/**
 * refresh — définition UNIQUE du flux « rafraîchir la donnée depuis le jeu ».
 *
 * Le RÉSULTAT DU PULL pilote tout : on ne re-génère que si on a réellement tiré
 * du nouveau (ou `--force`). Sinon on saute toute la chaîne.
 *
 *   pull (si LDPlayer + diff)
 *     ├─ si le CODE du jeu a changé (version installée ≠ empreinte du dump) :
 *     │  dump (→ dump.cs + listings ASM committés)
 *     └─ si tiré : extract → convert → face-layout(py) → build →
 *        promote[ --apply] → [collect]
 *   [getNews]  ← optionnel (fetch web, indépendant du datamine)
 *
 * Deux points d'entrée partagent ce module (plus de logique dupliquée) :
 *   - `pnpm dev`         → scripts/dev-refresh.ts : { apply, collect, news } = true
 *   - `pnpm datagen:patch` → CLI ci-dessous : promote en DRY (revue), sans extras
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { isMain } from './lib/is-main';
import { gameVersion, pickDevice } from './extract/adb';
import { pull } from './extract/pull-gamedata';

const TSX_CLI = resolve('node_modules/tsx/dist/cli.mjs');
const GAMEDATA = resolve('.gamedata/files');
// Empreinte des ENTRÉES au dernier build RÉUSSI. Tant que la signature actuelle
// == ce stamp, la donnée générée est à jour ; sinon on régénère. Comme le stamp
// n'est écrit qu'APRÈS un succès, un extract planté en cours laisse la signature
// désynchronisée → le run suivant se répare tout seul (sans avoir à `--force`).
const STAMP = resolve('.gamedata/.refresh-stamp');
// Empreinte du dernier `datagen:dump` : porte la version du jeu dont sortent
// dump.cs et les listings ASM committés.
const DUMP_STAMP = resolve('.gamedata/apk/dumped/.dump-stamp.json');
// La metadata que le JEU embarque dans son dossier `files/` (tirée par le pull,
// suivie au md5). Second signal de changement de code — cf. `dumpDecision`.
const PULLED_META = resolve('.gamedata/files/il2cpp/Metadata/global-metadata.dat');

/**
 * Le CODE du client a-t-il changé depuis le dernier dump ? Compare la version
 * INSTALLÉE sur l'émulateur à celle gravée dans l'empreinte du dump.
 *
 * Un patch de DONNÉES ne bouge pas le binaire ; un patch de CODE oui, et alors
 * dump.cs et les 91 listings de docs/specs/damage-formula-asm/ sont périmés
 * (constat Sevih 13/08/2026 : rien ne le signalait, il fallait y penser).
 *
 * Renvoie `null` quand la question ne se pose pas ou n'est pas décidable :
 * pas d'émulateur, `dumpsys` muet, ou pas d'empreinte (auquel cas c'est un
 * premier dump à faire à la main, pas une régression à rattraper).
 */
function codeChanged(): DumpVerdict {
  if (!existsSync(DUMP_STAMP)) return null;
  let stamp: { gameVersion?: string; metadata?: { sha256?: string } };
  try {
    stamp = JSON.parse(readFileSync(DUMP_STAMP, 'utf8'));
  } catch {
    return null; // empreinte illisible : `disasm.py` refusera de toute façon
  }
  let installed: string | null = null;
  try {
    installed = gameVersion(pickDevice());
  } catch {
    // pas de device : on peut encore juger sur la metadata déjà tirée
  }
  return dumpDecision({
    stamped: stamp.gameVersion ?? null,
    installed,
    stampedMetaSha: stamp.metadata?.sha256 ?? null,
    pulledMetaSha: existsSync(PULLED_META)
      ? createHash('sha256').update(readFileSync(PULLED_META)).digest('hex')
      : null,
  });
}

type DumpVerdict = { from: string; to: string; reason: 'version' | 'metadata' } | null;

/**
 * Décision PURE « faut-il re-dumper ? » — isolée du flux à effets de bord pour
 * être testable (cf. refresh.test), comme `regenDecision`.
 *
 * DEUX signaux, dans cet ordre :
 *  1. `versionName` installé ≠ celui du dernier dump → l'APK a été remplacée ;
 *  2. sinon, `global-metadata.dat` TIRÉ (`.gamedata/files/il2cpp/Metadata/`,
 *     que le pull suit déjà au md5) ≠ celui du dump. Le jeu garde sa metadata
 *     dans son dossier `files/`, donc elle peut être remplacée SANS réinstaller
 *     l'APK — un correctif sans bump de version passerait sous le radar du
 *     signal 1. (Constaté identique à celle de l'APK le 13/08/2026 ; c'est le
 *     filet, pas le cas courant.)
 *
 * `inconnue` et les valeurs manquantes ne déclenchent JAMAIS rien : ce n'est
 * pas une preuve de changement, et un dump surprise coûte plusieurs minutes.
 */
export function dumpDecision(i: {
  stamped: string | null;
  installed: string | null;
  stampedMetaSha?: string | null;
  pulledMetaSha?: string | null;
}): DumpVerdict {
  const { stamped, installed, stampedMetaSha, pulledMetaSha } = i;
  const known = (v: string | null | undefined): v is string => !!v && v !== 'inconnue';

  if (known(stamped) && known(installed) && stamped !== installed) {
    return { from: stamped, to: installed, reason: 'version' };
  }
  if (known(stampedMetaSha) && known(pulledMetaSha) && stampedMetaSha !== pulledMetaSha) {
    return {
      from: `${stamped ?? 'version inconnue'} / metadata ${stampedMetaSha.slice(0, 12)}…`,
      to: `${installed ?? stamped ?? 'version inconnue'} / metadata ${pulledMetaSha.slice(0, 12)}…`,
      reason: 'metadata',
    };
  }
  return null;
}

/** Lance un script TS via tsx, en héritant du terminal. Lève si échec. */
function step(label: string, file: string, args: string[] = []): void {
  console.log(`\n▶ ${label}`);
  execFileSync(process.execPath, [TSX_CLI, resolve(file), ...args], { stdio: 'inherit' });
}

/**
 * Outillage python de l'étape face-layout. Null si tout est là, sinon le motif
 * du manque (message destiné à l'utilisateur).
 */
function pythonToolingMissing(): string | null {
  const probe = spawnSync('python', ['-c', 'import UnityPy'], { stdio: 'ignore' });
  if (probe.error) return 'python introuvable';
  if (probe.status !== 0) return 'module UnityPy absent';
  return null;
}

/**
 * Étapes PYTHON — les seules du projet (cf. datagen/README). Elles lisent les
 * TYPETREES des bundles pullés via UnityPy, chacune vers un JSON COMMITTÉ :
 *   - `extract-face-layout`  → cadrage des FI_ par personnage ;
 *   - `extract-sprite-rect`  → taille logique des sprites rognés par l'atlas.
 * Sans elles, collect produit des assets faux (FI_ manquants pour les nouveaux
 * persos, vignettes décalées dans leur fond). Locales par construction : ce code
 * ne s'exécute que si `.gamedata` existe (machine de datamine), jamais en CI.
 *
 * OUTILLAGE SONDÉ AVANT DE LANCER. `.gamedata` présent n'implique pas python +
 * UnityPy installés : sur une machine secondaire, l'import raté faisait échouer
 * TOUT `pnpm dev`, pour une étape dont la sortie est COMMITTÉE. On la saute donc
 * avec un avertissement — le dev tourne sur les tables du dernier passage. Un
 * échec du script LUI-MÊME (bundle absent, prefab illisible) lève toujours :
 * là, c'est un vrai problème de la machine de datamine, pas un défaut d'outillage.
 */
function pyStep(label: string, file: string): void {
  console.log(`\n▶ ${label}`);
  const missing = pythonToolingMissing();
  if (missing) {
    console.warn(
      `  ⚠ SAUTÉE — ${missing}. Les JSON committés (face-icon-layout, sprite-rect)\n` +
        '    prennent le relais ; seuls les sprites arrivés depuis manqueraient.\n' +
        '    Pour l’outiller : pip install UnityPy, puis `pnpm datagen:patch --force`.',
    );
    return;
  }
  execFileSync('python', [resolve(file)], { stdio: 'inherit' });
}

/**
 * Signature bon marché de `.gamedata/files` : md5 de la liste triée
 * `chemin:taille` (aucune lecture de contenu — les bundles sont content-addressed,
 * leur NOM change déjà avec le contenu). '' si le dossier est absent.
 */
function inputSignature(): string {
  if (!existsSync(GAMEDATA)) return '';
  const parts: string[] = [];
  const walk = (dir: string, prefix: string): void => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const rel = prefix ? `${prefix}/${e.name}` : e.name;
      const abs = join(dir, e.name);
      if (e.isDirectory()) walk(abs, rel);
      else if (e.isFile()) parts.push(`${rel}:${statSync(abs).size}`);
    }
  };
  walk(GAMEDATA, '');
  return createHash('md5').update(parts.sort().join('\n')).digest('hex');
}

const readStamp = (): string | null => {
  try {
    return readFileSync(STAMP, 'utf8').trim();
  } catch {
    return null;
  }
};

/**
 * Décision PURE de (re)génération — isolée du flux à effets de bord pour être
 * testable (cf. refresh.test). On régénère si `.gamedata/files` est là ET
 * (`--force`, OU le pull a ramené du neuf, OU la signature des entrées diffère
 * du dernier build réussi = auto-réparation). Un 1er run (`prevSig === null`)
 * n'est PAS « stale » : la baseline s'amorce sans régénérer.
 */
export function regenDecision(i: {
  hasGamedata: boolean;
  force: boolean;
  changed: boolean;
  prevSig: string | null;
  currentSig: string;
}): { doGen: boolean; staleByStamp: boolean } {
  const staleByStamp = i.hasGamedata && i.prevSig !== null && i.prevSig !== i.currentSig;
  const doGen = i.hasGamedata && (i.force || i.changed || staleByStamp);
  return { doGen, staleByStamp };
}

export type RefreshOptions = {
  /** Forcer la re-génération même si le local est déjà à jour (filet anti-échec). */
  force?: boolean;
  /** Sauter le pull (travail offline sur la donnée committée). */
  noPull?: boolean;
  /** `promote --apply` (écrit data/generated) plutôt que le dry-run de revue. */
  apply?: boolean;
  /** Rejouer `assets:collect` (staging des images). */
  collect?: boolean;
  /** Rejouer `getNews` (toujours, indépendant du pull). */
  news?: boolean;
};

/** Exécute le flux de rafraîchissement gaté sur le résultat du pull. */
export async function refresh(opts: RefreshOptions = {}): Promise<void> {
  const { force = false, noPull = false, apply = false, collect = false, news = false } = opts;

  // 1) Pull — ne tire que si LDPlayer est là ET que le distant diffère.
  let changed = false;
  if (noPull) {
    console.log('⏭  pull sauté (--no-pull).');
  } else {
    console.log('▶ pull (jeu → .gamedata)');
    changed = (await pull()).changed;
  }

  // 1bis) Le binaire a-t-il changé ? Si oui, re-dumper AVANT de générer : les
  // générateurs lisent dump.cs (ASSET_TYPE), et les listings ASM que citent les
  // specs damage en sortent aussi. `dump.ts` enchaîne `disasm.py` tout seul.
  if (!noPull) {
    const bump = codeChanged();
    if (bump) {
      console.log(
        `\n⚙  le CODE du jeu a changé (${bump.reason === 'version' ? 'version installée' : 'global-metadata.dat tirée'}) :` +
          `\n   ${bump.from} → ${bump.to}` +
          `\n   → re-dump du binaire (dump.cs + les listings de docs/specs/damage-formula-asm/,` +
          `\n     committés : leur diff fait partie du patch).`,
      );
      step('dump     (APK installé → dump.cs + listings ASM)', 'datagen/extract/dump.ts');
    }
  }

  // 2) Décision de (re)génération. On régénère si :
  //   - `--force`, ou
  //   - le pull a ramené du neuf, ou
  //   - la signature des entrées ≠ stamp du dernier build réussi (AUTO-RÉPARATION :
  //     couvre un extract planté, un `.gamedata` restauré à la main, etc.).
  // Rien à générer si `.gamedata/files` est absent (ex. machine sans datamine).
  const hasGamedata = existsSync(GAMEDATA);
  const currentSig = inputSignature();
  const prevSig = readStamp();
  const { doGen, staleByStamp } = regenDecision({
    hasGamedata,
    force,
    changed,
    prevSig,
    currentSig,
  });

  if (doGen) {
    if (!changed && (force || staleByStamp)) {
      console.log(
        force
          ? '\n⚙  --force : re-génération malgré un local à jour.'
          : '\n⚙  signature des entrées ≠ dernier build → re-génération (auto-réparation).',
      );
    }
    step('extract  (.bytes + images)', 'datagen/extract/extract.ts');
    step('convert  (.bytes → templates)', 'datagen/templates/convert.ts');
    pyStep(
      'face-layout (prefabs → face-icon-layout.json)',
      'datagen/assets/extract-face-layout.py',
    );
    pyStep('sprite-rect (atlas → sprite-rect.json)', 'datagen/assets/extract-sprite-rect.py');
    // Celle-ci ne lit PAS `.gamedata` mais `src/fonts/` (committé) : elle tourne
    // donc même sans machine de datamine, et ne change que si une police change.
    pyStep(
      'font-metrics (polices → portrait-font-metrics.json)',
      'datagen/assets/extract-font-metrics.py',
    );
    step('build    (générateurs → data/extracted)', 'datagen/build.ts');
    step(
      apply ? 'promote  (extracted → generated)' : 'promote  (revue du diff — dry-run)',
      'datagen/promote.ts',
      apply ? ['--apply'] : [],
    );
    if (collect) step('assets   (collecte images → staging)', 'datagen/assets/collect.ts');
    // Succès de toute la chaîne : on grave le stamp (une exception plus haut nous
    // aurait fait sortir avant → stamp inchangé → réparation au prochain run).
    writeFileSync(STAMP, currentSig);
  } else {
    console.log('\n✓ Donnée à jour — génération sautée.');
    // Amorçage silencieux : 1er run sans stamp mais donnée committée réputée à
    // jour → on grave la baseline sans régénérer (évite un extract inutile).
    if (hasGamedata && prevSig === null) writeFileSync(STAMP, currentSig);
  }

  // 3) News — optionnel (fetch web, indépendant du jeu).
  if (news) step('getNews', 'scripts/get-news.ts');
}

// Exécution directe = `pnpm datagen:patch` : refresh headless, promote en DRY
// (revue du diff) sauf `--apply`. Flags : --force / --no-pull / --apply / --collect.
if (isMain(import.meta.url)) {
  const a = process.argv.slice(2);
  refresh({
    force: a.includes('--force'),
    noPull: a.includes('--no-pull'),
    apply: a.includes('--apply'),
    collect: a.includes('--collect'),
    news: false,
  })
    .then(() => console.log('\n✅ refresh terminé.\n'))
    .catch((e) => {
      console.error('\n✗ refresh a échoué :', e?.message ?? e);
      process.exit(1);
    });
}
