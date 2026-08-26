/**
 * refresh — définition UNIQUE du flux « rafraîchir la donnée depuis le jeu ».
 *
 * Le RÉSULTAT DU PULL pilote tout : on ne re-génère que si on a réellement tiré
 * du nouveau (ou `--force`). Sinon on saute toute la chaîne.
 *
 *   choix de la SOURCE (Android/LDPlayer ou client Steam) et de sa racine gamedata
 *   pré-vol de l'outillage python  ← AVANT le pull : ce qui sera sauté, tout de suite
 *   pull (si la source est là + diff)
 *     ├─ si le CODE du jeu a changé (version installée ≠ empreinte du dump) :
 *     │  dump (→ dump.cs + listings ASM committés)
 *     └─ si tiré : extract → convert → face-layout(py) → sprite-rect(py) →
 *        font-metrics(py) → build → promote[ --apply] → damage → [collect]
 *   [getNews]  ← optionnel (fetch web, indépendant du datamine)
 *
 * La chaîne gatée est DÉCLARÉE (`genSteps`), pas écrite en ligne droite : c'est
 * ce qui permet de la désigner étape par étape — pour le pré-vol comme pour la
 * reprise après échec (`resumeDecision`, checkpoint écrit après chaque étape).
 *
 * Deux points d'entrée partagent ce module (plus de logique dupliquée) :
 *   - `pnpm dev`         → scripts/dev-refresh.ts : { apply, collect, news } = true
 *   - `pnpm datagen:patch` → CLI ci-dessous : promote en DRY (revue), sans extras
 *
 * DEUX SOURCES depuis le 2026-08-26 (`--source android|steam`, défaut android
 * jusqu'à la bascule) : chacune a son pull, son dump et son signal « le code a
 * changé », derrière la même interface `Source`. Elles écrivent la MÊME
 * arborescence, dans des racines distinctes (`lib/paths`) : la chaîne
 * extract→collect ne sait pas d'où viennent les fichiers. Les modules de
 * source sont importés DYNAMIQUEMENT, après que la racine est posée — ils
 * figent leurs chemins à l'import.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { isMain } from './lib/is-main';
import { STEAM_GAMEDATA_ROOT, gamedata, gamedataRoot } from './lib/paths';
import { pythonToolingMissing } from './lib/python';
import type { PullResult } from './extract/pull-gamedata';

const TSX_CLI = resolve('node_modules/tsx/dist/cli.mjs');
const filesDir = (): string => gamedata('files');
// Empreinte des ENTRÉES au dernier build RÉUSSI. Tant que la signature actuelle
// == ce stamp, la donnée générée est à jour ; sinon on régénère. Comme le stamp
// n'est écrit qu'APRÈS un succès, un extract planté en cours laisse la signature
// désynchronisée → le run suivant se répare tout seul (sans avoir à `--force`).
const stampPath = (): string => gamedata('.refresh-stamp');
// Progression DANS la chaîne, réécrite après chaque étape et effacée au succès
// complet — c'est ce qui permet de reprendre après un échec au lieu de tout
// rejouer (cf. `resumeDecision`). Complète le stamp, ne le remplace pas.
const checkpointPath = (): string => gamedata('.refresh-checkpoint.json');
// Empreinte du dernier `datagen:dump` / `datagen:dump-steam` : porte la version
// du jeu dont sortent dump.cs et les listings (ASM ou C#) committés.
const dumpStampPath = (): string => gamedata('apk/dumped/.dump-stamp.json');

export type SourceName = 'android' | 'steam';

/**
 * Une SOURCE de jeu : ce que `refresh` a besoin d'elle, rien de plus. Le
 * reste de la chaîne lit la racine gamedata sans savoir qui l'a remplie.
 */
type Source = {
  name: SourceName;
  label: string;
  /** Synchronise `files/` ; ne lève pas si la source est absente (cf. PullResult). */
  pull(): Promise<PullResult>;
  /**
   * Ce que le monde dit du CODE du client : version installée (null si
   * indécidable) et sha256 du fichier de code TIRÉ par le pull (Android :
   * `files/il2cpp/Metadata/global-metadata.dat` ; Steam :
   * `files/managed/Assembly-CSharp.dll`) — les deux signaux de `dumpDecision`.
   */
  installed(): { version: string | null; codeSha: string | null };
  /** Le script de dump à jouer quand le code a changé. */
  dumpFile: string;
};

const sha256File = (path: string): string | null =>
  existsSync(path) ? createHash('sha256').update(readFileSync(path)).digest('hex') : null;

/** Charge une source — imports DYNAMIQUES : la racine gamedata est déjà posée. */
async function loadSource(name: SourceName): Promise<Source> {
  if (name === 'steam') {
    const { pull } = await import('./extract/pull-steam');
    const { findSteamInstall } = await import('./extract/steam');
    const { bundleVersion } = await import('./extract/dump-steam');
    return {
      name,
      label: 'client Steam',
      pull: () => pull(),
      dumpFile: 'datagen/extract/dump-steam.ts',
      installed() {
        const install = findSteamInstall();
        return {
          version: install ? bundleVersion(install.globalGameManagers) : null,
          codeSha: sha256File(gamedata('files/managed/Assembly-CSharp.dll')),
        };
      },
    };
  }
  const { pull } = await import('./extract/pull-gamedata');
  const { gameVersion, pickDevice } = await import('./extract/adb');
  return {
    name,
    label: 'LDPlayer',
    pull: () => pull(),
    dumpFile: 'datagen/extract/dump.ts',
    installed() {
      let version: string | null = null;
      try {
        version = gameVersion(pickDevice());
      } catch {
        // pas de device : on peut encore juger sur la metadata déjà tirée
      }
      // La metadata que le JEU embarque dans son dossier `files/` (tirée par le
      // pull, suivie au md5) : second signal de changement de code.
      return {
        version,
        codeSha: sha256File(gamedata('files/il2cpp/Metadata/global-metadata.dat')),
      };
    },
  };
}

/**
 * Le CODE du client a-t-il changé depuis le dernier dump ? Compare la version
 * INSTALLÉE (émulateur ou client Steam, cf. `Source.installed`) à celle gravée
 * dans l'empreinte du dump.
 *
 * Un patch de DONNÉES ne bouge pas le binaire ; un patch de CODE oui, et alors
 * dump.cs et les 91 listings de docs/specs/damage-formula-asm/ sont périmés
 * (constat Sevih 13/08/2026 : rien ne le signalait, il fallait y penser).
 *
 * Renvoie `null` quand la question ne se pose pas ou n'est pas décidable :
 * pas d'émulateur, `dumpsys` muet, ou pas d'empreinte (auquel cas c'est un
 * premier dump à faire à la main, pas une régression à rattraper).
 */
function codeChanged(source: Source): DumpVerdict {
  const path = dumpStampPath();
  if (!existsSync(path)) return null;
  let stamp: {
    source?: SourceName;
    gameVersion?: string;
    metadata?: { sha256?: string };
    dll?: { sha256?: string };
  };
  try {
    stamp = JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null; // empreinte illisible : `disasm.py` / `extract-cs` refuseront de toute façon
  }
  // Une empreinte d'une AUTRE source sous cette racine (mélange de miroirs) :
  // ses sha ne sont pas comparables — on ne décide rien, on le dit.
  if ((stamp.source ?? 'android') !== source.name) {
    console.warn(
      `⚠ ${path} vient de la source « ${stamp.source ?? 'android'} », pas « ${source.name} » — re-dump à la main.`,
    );
    return null;
  }
  const { version, codeSha } = source.installed();
  return dumpDecision({
    stamped: stamp.gameVersion ?? null,
    installed: version,
    stampedMetaSha: stamp.metadata?.sha256 ?? stamp.dll?.sha256 ?? null,
    pulledMetaSha: codeSha,
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
 * Une étape de la chaîne de génération.
 *
 * `id` est l'identité STABLE dans le checkpoint de reprise : le renommer périme
 * les reprises en cours (sans danger — la chaîne repart de zéro — mais autant
 * le savoir). `py` = module python dont l'étape dépend ; absent = étape TS.
 */
export type Step = {
  id: string;
  label: string;
  file: string;
  args?: string[];
  py?: string;
};

/**
 * La chaîne extract→collect, DÉCLARÉE plutôt qu'écrite en ligne droite d'appels.
 * C'est ce qui rend possibles le pré-vol (savoir AVANT de pull ce qui va être
 * sauté) et la reprise après échec (savoir quelle étape a réussi) : les deux
 * ont besoin de désigner une étape, donc qu'elle ait un nom.
 *
 * Les deux étapes hors table — `dump` (conditionnelle, avant la décision de
 * régénération) et `getNews` (indépendante du jeu) — restent des appels directs :
 * elles ne sont ni gatées par le stamp ni reprises.
 */
export function genSteps(o: { apply: boolean; collect: boolean }): Step[] {
  return [
    { id: 'extract', label: 'extract  (.bytes + images)', file: 'datagen/extract/extract.ts' },
    {
      id: 'convert',
      label: 'convert  (.bytes → templates)',
      file: 'datagen/templates/convert.ts',
    },
    {
      id: 'face-layout',
      label: 'face-layout (prefabs → face-icon-layout.json)',
      file: 'datagen/assets/extract-face-layout.py',
      py: 'UnityPy',
    },
    {
      id: 'sprite-rect',
      label: 'sprite-rect (atlas → sprite-rect.json)',
      file: 'datagen/assets/extract-sprite-rect.py',
      py: 'UnityPy',
    },
    // SANS ARGUMENT = `DEFAULT_EFFECTS`, les 9 effets SERVIS par le site —
    // exactement ce que porte le `portrait-fx.json` committé. Surtout pas `--all` :
    // il sortirait les dix effets du bundle, donc des textures que le manifeste ne
    // demande pas. Hors pipeline jusqu'ici alors que sa sortie est COMMITTÉE :
    // `manifest.ts` réclamait ses 38 textures sur TOUTES les machines, mais seule
    // celle où on l'avait lancé à la main savait les produire (34 « sprite
    // introuvable » sur le portable, 14/08). Le `colorSpace` qu'il écrit vient
    // désormais du jeu installé (`datagen:dump`), et à défaut est PRÉSERVÉ — sans
    // quoi câbler l'étape aurait suffi à effacer l'effet du site.
    {
      id: 'portrait-fx',
      label: 'portrait-fx (prefabs → portrait-fx.json + textures)',
      file: 'datagen/assets/extract-portrait-fx.py',
      py: 'UnityPy',
    },
    // Celle-ci ne lit PAS `.gamedata` mais `src/fonts/` (committé) : elle tourne
    // donc même sans machine de datamine, et ne change que si une police change.
    {
      id: 'font-metrics',
      label: 'font-metrics (polices → portrait-font-metrics.json)',
      file: 'datagen/assets/extract-font-metrics.py',
      py: 'fontTools',
    },
    { id: 'build', label: 'build    (générateurs → data/extracted)', file: 'datagen/build.ts' },
    {
      id: 'promote',
      label: o.apply ? 'promote  (extracted → generated)' : 'promote  (revue du diff — dry-run)',
      file: 'datagen/promote.ts',
      args: o.apply ? ['--apply'] : [],
    },
    // Pipeline DAMAGE (tables du moteur du calculateur) — intégré le 25/08/2026 :
    // le patch 1.4.15 avait tout rafraîchi SAUF `data/generated/damage/` (restée
    // sur l'ancienne resVersion, personne ne pensait à `pnpm damage:build`).
    // APRÈS promote : `skill-descs.ts` lit les artefacts wiki de data/generated.
    // Pas de couche extracted/promote pour lui (doctrine en tête de
    // damage/build.ts : la revue est le diff git) — en dry-run il écrit donc
    // directement, et ce diff se revoit avec le reste. Le script lance lui-même
    // `extract-anim-events.py` (UnityPy) avec sa propre annonce de saut — c'est
    // pourquoi il n'a pas de champ `py` ici.
    {
      id: 'damage',
      label: 'damage   (anim-events + tables moteur → data/generated/damage)',
      file: 'datagen/damage/build.ts',
    },
    ...(o.collect
      ? [
          {
            id: 'assets',
            label: 'assets   (collecte images → staging)',
            file: 'datagen/assets/collect.ts',
          },
        ]
      : []),
  ];
}

/**
 * Clé d'une étape dans le checkpoint : l'id ET ses arguments. `promote` seul et
 * `promote --apply` ne font pas le même travail — les confondre ferait sauter
 * l'écriture de `data/generated` à une reprise relancée avec `--apply`.
 */
export const stepKey = (s: Step): string => [s.id, ...(s.args ?? [])].join(' ');

/**
 * PRÉ-VOL de l'outillage python : quelles étapes seront sautées, décidé AVANT
 * de lancer quoi que ce soit. Renvoie `id d'étape → motif`.
 *
 * Sonder au moment de l'étape (ce qu'on faisait) rendait la réponse juste mais
 * TARDIVE : le manque de fontTools se découvrait après le pull et l'extract,
 * soit un quart d'heure pour une information connaissable à la seconde 0. Le
 * verdict est calculé ici et RÉUTILISÉ par la boucle, donc ce qui est annoncé
 * est exactement ce qui se passe.
 *
 * `probe` est injecté pour que la fonction soit pure et testable (cf.
 * refresh.test). Mémoïsé par module : deux étapes UnityPy = un seul `python -c`.
 */
export function preflightPython(
  steps: Step[],
  probe: (mod: string) => string | null,
): Map<string, string> {
  const seen = new Map<string, string | null>();
  const missing = new Map<string, string>();
  for (const s of steps) {
    if (!s.py) continue;
    if (!seen.has(s.py)) seen.set(s.py, probe(s.py));
    const why = seen.get(s.py);
    if (why) missing.set(s.id, why);
  }
  return missing;
}

/** Sonde l'outillage python de la chaîne et ANNONCE ce qui sera sauté. */
function preflight(steps: Step[]): Map<string, string> {
  const missing = preflightPython(steps, pythonToolingMissing);
  if (missing.size) {
    const lines = [...missing].map(([id, why]) => `     ${id.padEnd(13)} ${why}`).join('\n');
    console.warn(
      `⚠ Pré-vol : outillage python incomplet — étape(s) qui seront SAUTÉES :\n${lines}\n` +
        '   Les JSON committés prennent le relais ; seul ce qui est arrivé depuis\n' +
        '   manquerait sur cette machine. Pour l’outiller :\n' +
        '     python -m pip install -r datagen/requirements.txt\n',
    );
  }
  return missing;
}

/**
 * Joue une étape de la table. `missing` = verdict du pré-vol pour cette étape.
 *
 * ÉTAPES PYTHON — les seules du projet (cf. datagen/README), chacune vers un
 * JSON COMMITTÉ : `face-layout` (cadrage des FI_), `sprite-rect` (taille logique
 * des sprites rognés), `font-metrics` (chasses des polices du portrait). Sans
 * les deux premières, collect produit des assets faux ; elles lisent les
 * typetrees des bundles pullés, donc ne tournent que sur la machine de datamine.
 *
 * Une étape python NON OUTILLÉE est SAUTÉE, pas fatale : sa sortie est
 * committée, donc le dev tourne sur les tables du dernier passage — faire
 * échouer tout `pnpm dev` pour ça était disproportionné. Un échec du script
 * LUI-MÊME (bundle absent, prefab illisible) lève toujours : là, c'est un vrai
 * problème de la machine de datamine, pas un défaut d'outillage.
 *
 * IO EN UTF-8 FORCÉE. Ces scripts impriment des flèches et des accents ; sous
 * Windows, python encode sa sortie dans la codepage ANSI (cp1252) dès qu'il ne
 * détecte pas mieux, et meurt sur un `UnicodeEncodeError` au premier « → ».
 * `PYTHONIOENCODING` décorrèle la sortie de la console héritée.
 */
function runStep(s: Step, missing: string | undefined): void {
  console.log(`\n▶ ${s.label}`);
  if (!s.py) {
    execFileSync(process.execPath, [TSX_CLI, resolve(s.file), ...(s.args ?? [])], {
      stdio: 'inherit',
    });
    return;
  }
  if (missing) {
    console.warn(`  ⚠ SAUTÉE — ${missing} (cf. pré-vol). Le JSON committé prend le relais.`);
    return;
  }
  execFileSync('python', [resolve(s.file)], {
    stdio: 'inherit',
    env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
  });
}

/**
 * Signature bon marché de `.gamedata/files` : md5 de la liste triée
 * `chemin:taille` (aucune lecture de contenu — les bundles sont content-addressed,
 * leur NOM change déjà avec le contenu). '' si le dossier est absent.
 */
function inputSignature(): string {
  if (!existsSync(filesDir())) return '';
  const parts: string[] = [];
  const walk = (dir: string, prefix: string): void => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const rel = prefix ? `${prefix}/${e.name}` : e.name;
      const abs = join(dir, e.name);
      if (e.isDirectory()) walk(abs, rel);
      else if (e.isFile()) parts.push(`${rel}:${statSync(abs).size}`);
    }
  };
  walk(filesDir(), '');
  return createHash('md5').update(parts.sort().join('\n')).digest('hex');
}

/**
 * Empreinte des SOURCES de la chaîne : les `.ts`/`.py` de `datagen/`, en
 * `chemin:taille:mtime`. Elle entre dans la clé du checkpoint pour tuer le piège
 * central de la reprise — build casse, on corrige `bytes-parser.ts`, et sans
 * elle la reprise sauterait `convert` pour nous faire déboguer sur du JSON
 * périmé. Le mtime (et pas la seule taille) parce qu'un correctif change souvent
 * une ligne sans changer un octet de plus.
 *
 * BORNÉE AUX SOURCES, jamais aux JSON du dossier : `face-icon-layout.json`,
 * `sprite-rect.json` et `portrait-font-metrics.json` sont des SORTIES d'étapes.
 * Les inclure ferait changer la clé AU MILIEU du run, donc invaliderait le
 * checkpoint qu'on vient d'écrire — une reprise qui ne reprend jamais.
 */
function sourceSignature(): string {
  const parts: string[] = [];
  const walk = (dir: string, prefix: string): void => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const rel = prefix ? `${prefix}/${e.name}` : e.name;
      const abs = join(dir, e.name);
      if (e.isDirectory()) walk(abs, rel);
      // `extract/listings.json` est une SOURCE aussi : le manifeste des listings
      // que `disasm.py` et `extract-cs.ts` lisent.
      else if (e.isFile() && (/\.(ts|py)$/.test(e.name) || rel === 'extract/listings.json')) {
        const st = statSync(abs);
        parts.push(`${rel}:${st.size}:${st.mtimeMs}`);
      }
    }
  };
  walk(resolve('datagen'), '');
  return createHash('md5').update(parts.sort().join('\n')).digest('hex');
}

/** Clé de validité d'une reprise : les entrées du jeu ET les sources qui les traitent. */
const checkpointKey = (inputSig: string): string =>
  createHash('md5').update(`${inputSig}\n${sourceSignature()}`).digest('hex');

type Checkpoint = { key: string; done: string[] };

const readCheckpoint = (): Checkpoint | null => {
  try {
    const c: unknown = JSON.parse(readFileSync(checkpointPath(), 'utf8'));
    const ok =
      !!c &&
      typeof c === 'object' &&
      typeof (c as Checkpoint).key === 'string' &&
      Array.isArray((c as Checkpoint).done);
    return ok ? (c as Checkpoint) : null;
  } catch {
    return null; // absent, tronqué, illisible : on repart de zéro, c'est le défaut sûr
  }
};

const readStamp = (): string | null => {
  try {
    return readFileSync(stampPath(), 'utf8').trim();
  } catch {
    return null;
  }
};

/**
 * Décision PURE de REPRISE — quelles étapes sauter parce qu'elles ont déjà
 * réussi au run précédent (cf. refresh.test), isolée comme `regenDecision`.
 *
 * Le stamp ne dit QUE « tout a réussi », et n'est écrit qu'à la fin : une étape
 * de deux secondes qui casse renvoyait à zéro un extract de 2,2 Go déjà fait. Le
 * checkpoint, lui, est écrit APRÈS CHAQUE étape et dit lesquelles.
 *
 * Il ne prétend PAS à l'incrémental (on ne modélise pas les entrées de chaque
 * étape — une entrée oubliée servirait de la donnée périmée en silence, bien
 * pire que rejouer). Sa promesse est plus étroite et vérifiable : MÊMES ENTRÉES,
 * MÊMES SOURCES, on reprend où ça a cassé. Toute autre situation le jette :
 *   - `--force` = « rejoue tout », il serait contradictoire de l'honorer ;
 *   - clé différente = le monde a bougé entre l'échec et la reprise.
 * L'auto-réparation par le stamp reste donc intacte : ce fichier est purement
 * additif, l'ignorer ramène au comportement d'avant.
 */
export function resumeDecision(i: { force: boolean; key: string; checkpoint: Checkpoint | null }): {
  done: string[];
  discarded: 'force' | 'stale' | null;
} {
  if (!i.checkpoint) return { done: [], discarded: null };
  if (i.force) return { done: [], discarded: 'force' };
  if (i.checkpoint.key !== i.key) return { done: [], discarded: 'stale' };
  return { done: i.checkpoint.done, discarded: null };
}

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
  /** Source de jeu (défaut : `DATAGEN_SOURCE`, sinon android). */
  source?: SourceName;
};

/**
 * Source demandée → nom validé, et pose la racine gamedata qui va avec si
 * `GAMEDATA_ROOT` ne l'impose pas (Steam : `.gamedata-steam`, pour ne jamais
 * écraser le miroir Android tant que les deux coexistent). DOIT précéder tout
 * `gamedata()` et tout import de module de source.
 */
export function resolveSource(requested: string | undefined): SourceName {
  const name = requested ?? process.env.DATAGEN_SOURCE ?? 'android';
  if (name !== 'android' && name !== 'steam') {
    throw new Error(`source inconnue : « ${name} » (android | steam)`);
  }
  if (name === 'steam' && !process.env.GAMEDATA_ROOT) {
    process.env.GAMEDATA_ROOT = STEAM_GAMEDATA_ROOT;
  }
  return name;
}

/** Exécute le flux de rafraîchissement gaté sur le résultat du pull. */
export async function refresh(opts: RefreshOptions = {}): Promise<void> {
  const { force = false, noPull = false, apply = false, collect = false, news = false } = opts;
  const source = await loadSource(resolveSource(opts.source));
  console.log(`◆ source : ${source.label} → ${gamedataRoot()}`);
  const steps = genSteps({ apply, collect });

  // 0) PRÉ-VOL — AVANT le pull, donc avant le quart d'heure de datamine : dire
  // tout de suite ce qui manque et ce qui sera sauté. Inutile sans `.gamedata`
  // (aucune étape ne tournera) : on éviterait juste d'avertir dans le vide sur
  // une machine qui ne datamine pas.
  const preflightDone = existsSync(filesDir());
  let pyMissing = preflightDone ? preflight(steps) : new Map<string, string>();

  // 1) Pull — ne tire que si LDPlayer est là ET que le distant diffère.
  let changed = false;
  if (noPull) {
    console.log('⏭  pull sauté (--no-pull).');
  } else {
    console.log(`▶ pull (${source.label} → ${gamedataRoot()})`);
    changed = (await source.pull()).changed;
  }

  // 1bis) Le binaire a-t-il changé ? Si oui, re-dumper AVANT de générer : les
  // générateurs lisent dump.cs (ASSET_TYPE), et les listings que citent les
  // specs damage en sortent aussi (`dump.ts` enchaîne `disasm.py`,
  // `dump-steam.ts` enchaîne `extract-cs.ts`).
  if (!noPull) {
    const bump = codeChanged(source);
    if (bump) {
      console.log(
        `\n⚙  le CODE du jeu a changé (${bump.reason === 'version' ? 'version installée' : 'fichier de code tiré'}) :` +
          `\n   ${bump.from} → ${bump.to}` +
          `\n   → re-dump du binaire (dump.cs + les listings de docs/specs/damage-formula-${source.name === 'steam' ? 'cs' : 'asm'}/,` +
          `\n     committés : leur diff fait partie du patch).`,
      );
      step(`dump     (${source.label} → dump.cs + listings)`, source.dumpFile);
    }
  }

  // 2) Décision de (re)génération. On régénère si :
  //   - `--force`, ou
  //   - le pull a ramené du neuf, ou
  //   - la signature des entrées ≠ stamp du dernier build réussi (AUTO-RÉPARATION :
  //     couvre un extract planté, un `.gamedata` restauré à la main, etc.).
  // Rien à générer si `.gamedata/files` est absent (ex. machine sans datamine).
  const hasGamedata = existsSync(filesDir());
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
    // Le pré-vol n'avait pas lieu d'être au démarrage (`.gamedata` absent) mais
    // le pull vient de le créer : le faire MAINTENANT, sinon une étape non
    // outillée échouerait au lieu d'être sautée — exactement ce qu'il évite.
    if (!preflightDone) pyMissing = preflight(steps);

    // REPRISE : les étapes déjà réussies au run précédent, si rien n'a bougé.
    const key = checkpointKey(currentSig);
    const { done, discarded } = resumeDecision({ force, key, checkpoint: readCheckpoint() });
    if (discarded)
      console.log(
        discarded === 'force'
          ? '⚙  --force : reprise ignorée, chaîne complète.'
          : '⚙  reprise abandonnée : entrées ou sources modifiées depuis — chaîne complète.',
      );
    const doneKeys = new Set(done);
    if (doneKeys.size)
      console.log(
        `⏭  reprise après échec : ${doneKeys.size} étape(s) déjà réussie(s) sautée(s) ` +
          `— ${[...doneKeys].join(', ')}.\n   Pour tout rejouer : --force.`,
      );

    for (const s of steps) {
      if (doneKeys.has(stepKey(s))) continue;
      // Le checkpoint est écrit APRÈS l'étape : une exception nous sort d'ici en
      // laissant gravé exactement ce qui a réussi, et rien de plus.
      runStep(s, pyMissing.get(s.id));
      doneKeys.add(stepKey(s));
      writeFileSync(checkpointPath(), `${JSON.stringify({ key, done: [...doneKeys] }, null, 2)}\n`);
    }

    // Succès de toute la chaîne : on grave le stamp (une exception plus haut nous
    // aurait fait sortir avant → stamp inchangé → réparation au prochain run) et
    // on jette le checkpoint, qui n'a plus rien à reprendre.
    writeFileSync(stampPath(), currentSig);
    rmSync(checkpointPath(), { force: true });
  } else {
    console.log('\n✓ Donnée à jour — génération sautée.');
    // Amorçage silencieux : 1er run sans stamp mais donnée committée réputée à
    // jour → on grave la baseline sans régénérer (évite un extract inutile).
    if (hasGamedata && prevSig === null) writeFileSync(stampPath(), currentSig);
  }

  // 3) News — optionnel (fetch web, indépendant du jeu).
  if (news) step('getNews', 'scripts/get-news.ts');
}

/** `--source steam` ou `--source=steam` dans argv, sinon undefined. PUR. */
export function sourceArg(argv: string[]): string | undefined {
  const i = argv.indexOf('--source');
  if (i >= 0) return argv[i + 1];
  return argv.find((x) => x.startsWith('--source='))?.slice('--source='.length);
}

// Exécution directe = `pnpm datagen:patch` : refresh headless, promote en DRY
// (revue du diff) sauf `--apply`. Flags : --force / --no-pull / --apply /
// --collect / --source android|steam.
if (isMain(import.meta.url)) {
  const a = process.argv.slice(2);
  refresh({
    force: a.includes('--force'),
    noPull: a.includes('--no-pull'),
    apply: a.includes('--apply'),
    collect: a.includes('--collect'),
    news: false,
    source: sourceArg(a) as SourceName | undefined,
  })
    .then(() => console.log('\n✅ refresh terminé.\n'))
    .catch((e) => {
      console.error('\n✗ refresh a échoué :', e?.message ?? e);
      process.exit(1);
    });
}
