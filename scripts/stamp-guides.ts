/**
 * STAMP des dates de guides (`pnpm stamp:guides`) — maintient `meta.updated`.
 *
 * Le build ne voit jamais git (`.dockerignore` exclut `.git`) : la date doit
 * donc vivre COMMITTÉE dans `meta.json`. Ce script la maintient au moment du
 * commit, où l'historique local est disponible.
 *
 * Modèle (décidé avec Sevih) : baseline = release V3 (tous les guides datés du
 * jour de release, une fois) ; ensuite, si un fichier PERTINENT d'un guide
 * change → `updated = aujourd'hui`. « Pertinent » = les fichiers partagés du
 * guide (meta/strings/index/notes…) + la DERNIÈRE version ; les archives de
 * versions (`versions/<plus ancienne>/`) ne comptent pas — corriger un vieux
 * guide versionné ne le fait pas remonter en « à jour ».
 *
 * Pas de `git log` (historique parfois shallow en CI) : on lit `git status`
 * (modif indexées + working tree), toujours fiable en local. Idempotent.
 *
 *   pnpm stamp:guides             bumpe les guides dont un fichier pertinent change
 *   pnpm stamp:guides --all DATE  baseline : force TOUS les guides à DATE (release)
 *   pnpm stamp:guides --check     n'écrit rien ; sort en code 1 si un bump manque
 *   pnpm stamp:guides --date DATE surcharge la date « aujourd'hui » (tests)
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { format as prettierFormat, resolveConfig } from 'prettier';

const CONTENTS = resolve(process.cwd(), 'src/app/[lang]/guides/_contents');
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const VERSION_DIR_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

const argv = process.argv.slice(2);
const flag = (f: string): string | null => {
  const i = argv.indexOf(f);
  return i > -1 && argv[i + 1] ? argv[i + 1] : null;
};
const CHECK = argv.includes('--check');
const ALL = flag('--all');
// `--all` SANS date suivante dégradait SILENCIEUSEMENT en mode normal (bump des
// seuls guides modifiés) au lieu de la baseline attendue → refus explicite.
if (argv.includes('--all') && !ALL) {
  console.error('`--all` exige une DATE de baseline (ex. `--all 2026-07-01`).');
  process.exit(1);
}
const TODAY = flag('--date') ?? ALL ?? new Date().toISOString().slice(0, 10);

if (!DATE_RE.test(TODAY)) {
  console.error(`Date invalide : "${TODAY}" (attendu YYYY-MM-DD).`);
  process.exit(1);
}

/** Fichiers modifiés (indexés + working tree), chemins POSIX relatifs au repo. */
function gitChangedFiles(): Set<string> {
  const out = execFileSync('git', ['status', '--porcelain', '-z'], { encoding: 'utf8' });
  const files = new Set<string>();
  // Format -z : « XY <chemin>\0 ». Renommage/copie (X ou Y ∈ {R,C}) : DEUX
  // enregistrements — « R  <nouveau>\0<ancien>\0 » — et le second est un chemin
  // NU, sans préfixe « XY  » : lui appliquer slice(3) tronquerait son début.
  // On consomme donc les enregistrements par paires dans ce cas, et les deux
  // chemins comptent comme « modifiés » (un guide renommé a bien changé).
  const recs = out.split('\0');
  for (let i = 0; i < recs.length; i++) {
    const rec = recs[i];
    if (rec.length < 4) continue;
    files.add(rec.slice(3).replace(/\\/g, '/'));
    if (/[RC]/.test(rec.slice(0, 2))) {
      const orig = recs[++i];
      if (orig) files.add(orig.replace(/\\/g, '/'));
    }
  }
  return files;
}

interface GuideDir {
  category: string;
  slug: string;
  dir: string;
  metaPath: string;
}

/** Tous les dossiers de guides (category/slug avec meta.json). */
function listGuideDirs(): GuideDir[] {
  const out: GuideDir[] = [];
  for (const cat of readdirSync(CONTENTS, { withFileTypes: true })) {
    if (!cat.isDirectory()) continue;
    const catDir = resolve(CONTENTS, cat.name);
    for (const slug of readdirSync(catDir, { withFileTypes: true })) {
      if (!slug.isDirectory()) continue;
      const dir = resolve(catDir, slug.name);
      const metaPath = resolve(dir, 'meta.json');
      if (existsSync(metaPath)) out.push({ category: cat.name, slug: slug.name, dir, metaPath });
    }
  }
  return out;
}

/** Dossiers de versions d'un guide, triés (le plus récent d'abord). */
function versionKeys(dir: string): string[] {
  const vdir = resolve(dir, 'versions');
  if (!existsSync(vdir)) return [];
  return readdirSync(vdir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && VERSION_DIR_RE.test(e.name))
    .map((e) => e.name)
    .sort((a, b) => b.localeCompare(a));
}

/**
 * Un fichier changé est-il PERTINENT pour ce guide ? Oui s'il est dans le
 * dossier du guide MAIS pas dans une archive de version (tout `versions/<clé>`
 * autre que la plus récente est ignoré).
 */
function relevantChange(g: GuideDir, changed: Set<string>, newestVersion: string | null): boolean {
  const base = relative(process.cwd(), g.dir).replace(/\\/g, '/') + '/';
  const archives = versionKeys(g.dir)
    .filter((k) => k !== newestVersion)
    .map((k) => `${base}versions/${k}/`);
  for (const f of changed) {
    if (!f.startsWith(base)) continue;
    if (archives.some((a) => f.startsWith(a))) continue; // archive → ignoré
    // La modif du SEUL champ `updated` de meta.json ne compte pas (anti-boucle).
    if (f === `${base}meta.json` && onlyUpdatedChanged(g.metaPath)) continue;
    return true;
  }
  return false;
}

/** Le diff indexé/working de meta.json ne touche-t-il QUE le champ `updated` ? */
function onlyUpdatedChanged(metaPath: string): boolean {
  try {
    const diff = execFileSync('git', ['diff', 'HEAD', '--unified=0', '--', metaPath], {
      encoding: 'utf8',
    });
    const changedLines = diff.split('\n').filter((l) => /^[+-]/.test(l) && !/^[+-]{3} /.test(l));
    return changedLines.length > 0 && changedLines.every((l) => /"updated"\s*:/.test(l));
  } catch {
    return false;
  }
}

/**
 * Sérialise un objet EXACTEMENT comme prettier — via l'API, pas le CLI (qui
 * traiterait les `[lang]` du chemin comme un motif glob et ne matcherait pas le
 * fichier). Nécessaire : le stamp écrivait du `JSON.stringify`, qui ÉCLATE les
 * tableaux courts que prettier garde INLINE (`"dungeons": ["100805"]`) → meta
 * committé non-prettier (le commit maison saute les hooks via `--no-verify`) et
 * diff parasite au `format:check` du commit suivant. `resolveConfig` reprend le
 * `printWidth` du repo (seuil d'inline des tableaux).
 */
async function toPrettierJson(obj: unknown, filepath: string): Promise<string> {
  const config = await resolveConfig(filepath);
  return prettierFormat(JSON.stringify(obj, null, 2), { ...config, filepath, parser: 'json' });
}

/** Lit/écrit meta.json en préservant l'ordre des clés (updated déjà présent
 * reste à sa place ; sinon inséré après `author`). Sortie prettier-canonique. */
async function stampMeta(metaPath: string, date: string): Promise<boolean> {
  const raw = readFileSync(metaPath, 'utf8');
  const meta = JSON.parse(raw) as Record<string, unknown>;
  if (meta.updated === date) return false;
  let out: Record<string, unknown> = meta;
  if ('updated' in meta) {
    meta.updated = date;
  } else {
    // Insère `updated` juste après `author` (lisibilité des diffs).
    out = {};
    for (const [k, v] of Object.entries(meta)) {
      out[k] = v;
      if (k === 'author') out.updated = date;
    }
    if (!('updated' in out)) out.updated = date;
  }
  writeFileSync(metaPath, await toPrettierJson(out, metaPath));
  return true;
}

async function main(): Promise<void> {
  const guides = listGuideDirs();
  const changed = ALL ? null : gitChangedFiles();
  const bumped: string[] = [];
  const wouldBump: string[] = [];

  for (const g of guides) {
    const newest = versionKeys(g.dir)[0] ?? null;
    const meta = JSON.parse(readFileSync(g.metaPath, 'utf8')) as { updated?: string };
    const label = `${g.category}/${g.slug}`;

    let target: string | null = null;
    if (ALL) {
      target = TODAY; // baseline : tout le monde à la date de release.
    } else if (changed && relevantChange(g, changed, newest)) {
      target = TODAY; // un fichier pertinent change → aujourd'hui.
    }
    if (!target || meta.updated === target) continue;

    if (CHECK) {
      wouldBump.push(label);
      continue;
    }
    if (await stampMeta(g.metaPath, target)) {
      bumped.push(label);
      // Ré-indexe le meta stampé pour qu'il parte dans LE MÊME commit.
      try {
        execFileSync('git', ['add', '--', g.metaPath], { stdio: 'ignore' });
      } catch {
        /* pas d'index (hors commit) — le fichier reste écrit, c'est suffisant */
      }
    }
  }

  if (CHECK) {
    if (wouldBump.length) {
      console.error(
        `stamp:guides --check : ${wouldBump.length} guide(s) à re-dater :\n  - ${wouldBump.join('\n  - ')}`,
      );
      process.exit(1);
    }
    console.log('stamp:guides --check : toutes les dates sont à jour.');
    return;
  }

  if (ALL) console.log(`stamp:guides : baseline ${TODAY} appliquée à ${bumped.length} guide(s).`);
  else if (bumped.length)
    console.log(
      `stamp:guides : ${bumped.length} guide(s) re-daté(s) au ${TODAY} :\n  - ${bumped.join('\n  - ')}`,
    );
  else console.log('stamp:guides : aucun guide à re-dater.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
