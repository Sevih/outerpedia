/**
 * PUSH des assets : `pnpm assets:push`.
 *   `--full`        re-pousse tout (ignore l'état local).
 *   `--purge-only`  repurge l'edge sans rien uploader (réglage Cloudflare changé).
 *
 * Pousse le staging local (`.assets-staging/`, produit par `assets:collect`) vers
 * le bucket R2 via rclone (S3), puis PURGE le cache edge Cloudflare des clés
 * poussées. Identifiants lus dans `.env.local`.
 *
 * NE LISTE JAMAIS LE BUCKET. L'ancien script tenait les assets pour immuables et
 * s'appuyait sur `--ignore-existing`, ce qui cumulait deux défauts : rclone devait
 * énumérer TOUT R2 pour connaître les noms déjà pris (de plus en plus lent à
 * mesure que le bucket grossit), et un nom déjà présent était sauté SANS aucune
 * comparaison — une image corrigée en gardant son nom n'était jamais renvoyée.
 * On tient donc l'état nous-mêmes dans `datagen/assets/pushed.json` (clé → sha1
 * du contenu poussé, VERSIONNÉ) : on hache le staging (~1 s pour 140 Mo), on
 * diffe, on n'envoie que ce qui a réellement changé. Aucun appel de listing.
 *
 * Le Cache-Control dissocie les deux caches, qui n'ont pas les mêmes contraintes :
 *   - `s-maxage` (edge Cloudflare) = 1 an. R2 n'est donc presque jamais sollicité,
 *     et comme on purge nous-mêmes l'edge sur les clés poussées, il ne ment pas.
 *   - `max-age` (navigateur) = 10 min. Ce cache-là est INPURGEABLE : sa durée EST
 *     le délai maximal avant qu'une correction soit vue. L'ancien réglage
 *     (`max-age=31536000, immutable`) signifiait littéralement « ne revalide
 *     jamais » : une image corrigée restait fausse un an chez qui l'avait déjà vue.
 *   - `stale-while-revalidate` : le navigateur affiche sa copie immédiatement et
 *     revalide en fond — la fraîcheur ne coûte aucune latence.
 *
 * Prérequis : rclone (winget install Rclone.Rclone).
 * `.env.local` : R2_* (requis) ; CLOUDFLARE_API_TOKEN + CLOUDFLARE_ZONE_ID (sans
 * eux l'upload se fait quand même, mais la purge est SAUTÉE — donc l'edge sert
 * l'ancienne image jusqu'à expiration).
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const STAGING = resolve('.assets-staging');
const STATE_FILE = resolve('datagen/assets/pushed.json');
const IMG_BASE = 'https://img.outerpedia.com';
const CACHE_CONTROL = 'public, max-age=600, s-maxage=31536000, stale-while-revalidate=86400';
/** Limite de l'API Cloudflare : 30 URLs par appel de purge. */
const PURGE_BATCH = 30;
const FULL = process.argv.includes('--full');
/**
 * Repurge TOUT l'edge sans rien réuploader. Utile quand ce n'est pas le contenu
 * qui a changé mais la façon dont Cloudflare le sert (réglage de zone, Cache
 * Rule…) : l'edge garde ses réponses un an (`s-maxage`), en-têtes d'alors inclus.
 */
const PURGE_ONLY = process.argv.includes('--purge-only');

// .env.local : parse minimal KEY=VALUE (pas de dépendance).
const env = {};
try {
  for (const line of readFileSync(resolve('.env.local'), 'utf8').split('\n')) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (m) env[m[1]] = m[2].trim();
  }
} catch {
  /* pas de .env.local */
}

const { R2_ENDPOINT, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = env;
if (!R2_ENDPOINT || !R2_BUCKET || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.error(
    'R2_ENDPOINT / R2_BUCKET / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY requis dans .env.local',
  );
  process.exit(1);
}
if (!existsSync(STAGING)) {
  console.error(`Staging introuvable (${STAGING}) — lance d'abord : pnpm assets:collect`);
  process.exit(1);
}
// PAS de `shell: true` : le shell Windows re-découperait les arguments sur les
// espaces (chemin « Projet perso », header Cache-Control) — rclone est un vrai
// .exe, spawn direct avec arguments verbatim.
if (spawnSync('rclone', ['version'], { stdio: 'ignore' }).status !== 0) {
  console.error('rclone introuvable — installe-le : winget install Rclone.Rclone');
  process.exit(1);
}

// --- diff local : staging vs état poussé ---------------------------------------

/** Clés bucket du staging (séparateur `/`) → sha1 du contenu. */
function hashStaging() {
  const out = new Map();
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const abs = join(dir, e.name);
      if (e.isDirectory()) {
        walk(abs);
        continue;
      }
      if (!e.isFile()) continue;
      const key = relative(STAGING, abs).split('\\').join('/');
      // `manifest-report.json` est un rapport local ; les `.*` sont nos états.
      if (key === 'manifest-report.json' || key.startsWith('.')) continue;
      out.set(key, createHash('sha1').update(readFileSync(abs)).digest('hex'));
    }
  };
  walk(STAGING);
  return out;
}

const current = hashStaging();
let pushed = {};
try {
  pushed = JSON.parse(readFileSync(STATE_FILE, 'utf8'));
} catch {
  /* premier push, ou état jamais écrit */
}
// `--full` ignore l'état comme référence de comparaison, mais on GARDE le fichier
// lu pour la fusion finale : une clé poussée jadis puis retirée du staging vit
// toujours sur R2 (on ne supprime jamais à distance), son entrée doit survivre.
const baseline = FULL ? {} : pushed;

const added = [];
const changed = [];
for (const [key, hash] of current) {
  if (!(key in baseline)) added.push(key);
  else if (baseline[key] !== hash) changed.push(key);
}
// `--purge-only` : rien à envoyer, on repurge l'intégralité du staging.
const toPush = PURGE_ONLY ? [...current.keys()] : [...added, ...changed];

if (!toPush.length) {
  console.log(`R2 déjà à jour — ${current.size} assets, rien à pousser.`);
  process.exit(0);
}

const bootstrap = Object.keys(pushed).length === 0;
if (PURGE_ONLY) {
  console.log(`Purge seule — ${toPush.length} URL(s), aucun upload.`);
} else if (bootstrap || FULL) {
  console.log(
    `Re-push COMPLET (${toPush.length} assets) : il réécrit aussi le Cache-Control des\n` +
      `objets déjà en place — un en-tête S3 est figé à l'upload, les anciens portent\n` +
      `encore « immutable, max-age=1 an » et ne peuvent pas être corrigés autrement.\n`,
  );
} else {
  console.log(
    `${added.length} ajoutée(s), ${changed.length} modifiée(s) → ${toPush.length} à pousser.`,
  );
}

// --- upload ---------------------------------------------------------------------

if (!PURGE_ONLY) {
  // `--files-from` : la liste EST la décision. `--no-traverse` n'énumère pas la
  // destination, `--ignore-times` ne compare rien — c'est notre état qui tranche,
  // pas un aller-retour avec R2.
  const listFile = resolve(STAGING, '.push-list.txt');
  writeFileSync(listFile, toPush.join('\n') + '\n');

  const res = spawnSync(
    'rclone',
    [
      'copy',
      STAGING,
      `:s3:${R2_BUCKET}`,
      '--files-from',
      listFile,
      '--no-traverse',
      '--ignore-times',
      '--header-upload',
      `Cache-Control: ${CACHE_CONTROL}`,
      '--s3-no-check-bucket',
      '--transfers',
      '16',
      '--progress',
    ],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        RCLONE_S3_PROVIDER: 'Cloudflare',
        RCLONE_S3_ENDPOINT: R2_ENDPOINT,
        RCLONE_S3_ACCESS_KEY_ID: R2_ACCESS_KEY_ID,
        RCLONE_S3_SECRET_ACCESS_KEY: R2_SECRET_ACCESS_KEY,
      },
    },
  );
  rmSync(listFile, { force: true });
  if (res.status !== 0) {
    console.error('✗ rclone a échoué — état inchangé, relance le push.');
    process.exit(res.status ?? 1);
  }
}

// --- purge du cache edge --------------------------------------------------------

const { CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID } = env;
if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
  console.warn(
    '\n⚠ CLOUDFLARE_API_TOKEN / CLOUDFLARE_ZONE_ID absents de .env.local — purge SAUTÉE.\n' +
      "  Les assets sont sur R2, mais l'edge continuera de servir les anciens.",
  );
} else {
  const urls = toPush.map((k) => `${IMG_BASE}/${k}`);
  console.log(`\nPurge du cache edge — ${urls.length} URL(s)...`);
  for (let i = 0; i < urls.length; i += PURGE_BATCH) {
    const batch = urls.slice(i, i + PURGE_BATCH);
    const r = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files: batch }),
      },
    );
    const json = await r.json().catch(() => ({}));
    if (!r.ok || !json.success) {
      // On n'écrit PAS l'état : le prochain push repoussera et repurgera ces clés.
      // Un état qui dirait « poussé » alors que l'edge sert encore l'ancienne image
      // rendrait le problème invisible — exactement le bug qu'on corrige.
      console.error(
        `✗ purge refusée (lot ${Math.floor(i / PURGE_BATCH) + 1}) :`,
        JSON.stringify(json.errors ?? r.statusText),
      );
      process.exit(1);
    }
  }
}

// --- état -----------------------------------------------------------------------

if (PURGE_ONLY) {
  // Pas d'écriture d'état : rien n'a été uploadé. Fusionner les hash du staging
  // marquerait « poussé » un asset modifié localement mais jamais envoyé — les
  // push suivants le sauteraient et R2 servirait l'ancienne version en silence.
  console.log(`\n✅ ${toPush.length} URL(s) purgée(s) de l'edge. Aucun upload, R2 inchangé.`);
  process.exit(0);
}

// Écrit APRÈS upload ET purge : l'état ne décrit que ce qui est réellement servi.
const merged = { ...pushed };
for (const [key, hash] of current) merged[key] = hash;
const sorted = Object.fromEntries(Object.entries(merged).sort(([a], [b]) => a.localeCompare(b)));
mkdirSync(dirname(STATE_FILE), { recursive: true });
writeFileSync(STATE_FILE, JSON.stringify(sorted, null, 2) + '\n');

console.log(`\n✅ ${toPush.length} asset(s) poussé(s). Commite datagen/assets/pushed.json.`);
if (changed.length && !bootstrap && !FULL) {
  console.log(
    `   ${changed.length} image(s) CORRIGÉE(S) en place : l'edge est purgé (visible tout de suite\n` +
      `   pour qui ne les a pas en cache), les autres revalideront sous 10 min.`,
  );
}
