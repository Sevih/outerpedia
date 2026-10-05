/**
 * portrait-fx-report — CE QU'UN PATCH A FAIT AUX EFFETS DE PORTRAIT, dit à la console.
 *
 * `extract-portrait-fx.py` sort d'office tout effet que la table du jeu nomme ;
 * le moteur ne sert que ceux qu'il sait poser EN ENTIER et laisse les autres en
 * portrait statique (`effectVerdict`, `src/components/character/portrait-fx-sim`).
 * Rien de tout ça ne bloque un patch — donc rien ne se verrait. Ce pas, que
 * `refresh` joue juste après l'extraction, est l'endroit où ça se voit : pour
 * chaque effet NOUVEAU par rapport à la table committée, son nom, ses porteurs,
 * et « servi tel quel » ou « en attente : <effet>/<calque> — <motif> ». Un effet
 * en attente ou pas extrait est redit à chaque passage tant qu'il le reste, et
 * `refresh` reprend les mêmes lignes dans son récapitulatif final.
 *
 * LE VERDICT N'EST PAS RÉÉCRIT ICI, ni en python : c'est celui du moteur,
 * importé. L'extraction ne sait pas ce que le site sait rendre, et n'a pas à le
 * savoir.
 *
 * LE RELEVÉ (`portrait-fx-served.json`, committé). Ce pas y écrit, pour chaque
 * effet SERVI, l'empreinte de sa fiche (ses émetteurs, leurs matériaux, leurs
 * mailles). Il donne au test de contrat (`portrait-fx.test.ts`) la seule
 * régression qu'il doit encore attraper sans liste tenue à la main : un effet
 * servi au dernier relevé, dont la fiche n'a PAS changé, et que le moteur ne
 * servirait plus — c'est alors le moteur qui a régressé, pas le jeu qui a
 * bougé. Une fiche que le patch a changée sort du relevé sans rien casser.
 * Pour cette raison, ce pas ne retire JAMAIS du relevé un effet à fiche
 * inchangée : le blanchir ici ferait taire le test au premier refresh.
 * Resserrer le moteur en connaissance de cause se valide à la main :
 * `pnpm tsx datagen/assets/portrait-fx-report.ts --accept`.
 *
 * Usage : `pnpm tsx datagen/assets/portrait-fx-report.ts [--accept]` — ne lit
 * que des fichiers committés, tourne donc sans `.gamedata`.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { isMain } from '../lib/is-main';
import type { FxTable } from '../../src/components/character/portrait-fx';
import { effectVerdict, type FxVerdictTable } from '../../src/components/character/portrait-fx-sim';

const TABLE = 'datagen/assets/portrait-fx.json';
const SNAPSHOT = 'datagen/assets/portrait-fx-served.json';

/** `effet servi → empreinte de sa fiche`, cf. l'en-tête. */
export type Snapshot = Record<string, string>;

/** Ce que le rapport lit d'une table : qui porte quoi, et de quoi juger chaque effet. */
export type FxReportTable = FxVerdictTable & Pick<FxTable, 'byCharacter'>;

/**
 * L'empreinte de la FICHE d'un effet : tout ce dont son verdict dépend — ses
 * émetteurs, et les matériaux et mailles qu'ils citent. Null s'il n'est pas
 * dans la table.
 */
export function fingerprint(table: FxVerdictTable, effectName: string): string | null {
  const effect = table.effects[effectName];
  if (!effect) return null;
  const cited = (pick: (e: (typeof effect.emitters)[number]) => string | null) =>
    [...new Set(effect.emitters.map(pick).filter((n): n is string => !!n))].sort();
  const fiche = {
    effect,
    materials: cited((e) => e.material).map((n) => table.materials[n] ?? null),
    meshes: cited((e) => e.mesh).map((n) => table.meshes[n] ?? null),
  };
  return createHash('sha256').update(JSON.stringify(fiche)).digest('hex').slice(0, 16);
}

/** Un effet du relevé, fiche inchangée, que le moteur ne sert plus : le moteur a régressé. */
function regressed(table: FxVerdictTable, snapshot: Snapshot, effectName: string): boolean {
  const print = fingerprint(table, effectName);
  return (
    print !== null &&
    snapshot[effectName] === print &&
    effectVerdict(effectName, table).kind !== 'served'
  );
}

/**
 * Le relevé à écrire : les effets servis de `table`, plus ceux de `previous` que
 * le moteur a cessé de servir À FICHE INCHANGÉE — gardés, pour que le test de
 * contrat continue de casser dessus (cf. l'en-tête).
 */
export function nextSnapshot(table: FxVerdictTable, previous: Snapshot): Snapshot {
  const out: Snapshot = {};
  for (const name of Object.keys(table.effects).sort()) {
    const served = effectVerdict(name, table).kind === 'served';
    if (served || regressed(table, previous, name)) out[name] = fingerprint(table, name)!;
  }
  return out;
}

/**
 * LE RAPPORT — une ligne par chose à lire, aucune quand tout est comme au
 * dernier commit et servi. PUR : les tables arrivent en argument.
 *
 * `committed` est la table du dernier commit (null si git ne la rend pas :
 * les nouveautés ne sont alors pas comparées, et c'est dit) ; `snapshot`, le
 * relevé du même commit.
 */
export function fxReport(i: {
  fresh: FxReportTable;
  committed: Pick<FxTable, 'byCharacter' | 'effects'> | null;
  snapshot: Snapshot;
}): string[] {
  const { fresh, committed, snapshot } = i;
  const lines: string[] = [];
  if (!committed) lines.push('? table committée illisible (git) — nouveautés non comparées');

  const carriers = new Map<string, string[]>();
  for (const [id, name] of Object.entries(fresh.byCharacter))
    carriers.set(name, [...(carriers.get(name) ?? []), id]);
  const before = committed
    ? new Set([...Object.values(committed.byCharacter), ...Object.keys(committed.effects)])
    : null;

  for (const [name, ids] of carriers) {
    const isNew = before ? !before.has(name) : false;
    const who = `porteur(s) ${ids.join(', ')}`;
    const mark = isNew ? '+' : '!';
    const tag = isNew ? 'NOUVEAU, ' : '';
    const verdict = effectVerdict(name, fresh);

    if (verdict.kind === 'served') {
      const joined =
        committed && !isNew ? ids.filter((id) => committed.byCharacter[id] !== name) : [];
      if (isNew) lines.push(`+ ${name} (${who}) — NOUVEAU, servi tel quel`);
      else if (joined.length)
        lines.push(`+ ${name} — nouveau(x) porteur(s) ${joined.join(', ')}, servi tel quel`);
    } else if (verdict.kind === 'held') {
      const was = regressed(fresh, snapshot, name)
        ? 'servi au dernier relevé ET fiche inchangée (le MOTEUR a changé : `pnpm test` casse), '
        : snapshot[name]
          ? 'servi jusqu’ici, sa fiche a changé, '
          : '';
      for (const reason of verdict.reasons)
        lines.push(`${mark} ${name} (${who}) — ${tag}${was}en attente : ${reason}`);
    } else {
      const was = snapshot[name] ? 'servi jusqu’ici, ' : '';
      lines.push(`${mark} ${name} (${who}) — ${tag}${was}pas extrait : ${verdict.reason}`);
    }
  }
  return lines;
}

// --- lecture du disque et de git ----------------------------------------------------

function readJson<T>(path: string): T | null {
  if (!existsSync(resolve(path))) return null;
  return JSON.parse(readFileSync(resolve(path), 'utf8')) as T;
}

/** Un fichier tel que le dernier commit le porte, ou null (pas de git, fichier neuf). */
function committedJson<T>(path: string): T | null {
  try {
    const raw = execFileSync('git', ['show', `HEAD:${path}`], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Les lignes du rapport sur la table DU DISQUE, face au dernier commit. Ne lève
 * jamais : c'est un récapitulatif, il ne doit pas faire échouer ce qui l'appelle.
 */
export function portraitFxRecap(): string[] {
  try {
    const fresh = readJson<FxReportTable>(TABLE);
    if (!fresh) return [];
    return fxReport({
      fresh,
      committed: committedJson<FxTable>(TABLE),
      snapshot: committedJson<Snapshot>(SNAPSHOT) ?? {},
    });
  } catch (e) {
    return [`? rapport des effets de portrait impossible — ${(e as Error)?.message ?? e}`];
  }
}

if (isMain(import.meta.url)) {
  const fresh = readJson<FxReportTable>(TABLE);
  if (!fresh) {
    console.log(`  ${TABLE} absent — rien à rapporter.`);
  } else {
    const lines = portraitFxRecap();
    const served = Object.keys(fresh.effects).filter(
      (name) => effectVerdict(name, fresh).kind === 'served',
    ).length;
    console.log(
      `  ${served} effet(s) servi(s) sur ${Object.keys(fresh.effects).length} extrait(s).`,
    );
    for (const line of lines) console.log(`  ${line}`);
    if (!lines.length) console.log('  Rien de nouveau, rien en attente.');

    // `--accept` : repartir d'un relevé vide, donc entériner ce que le moteur
    // sert AUJOURD'HUI — le geste de qui a resserré le moteur exprès.
    const previous = process.argv.includes('--accept') ? {} : (readJson<Snapshot>(SNAPSHOT) ?? {});
    const next = `${JSON.stringify(nextSnapshot(fresh, previous), null, 2)}\n`;
    const current = existsSync(resolve(SNAPSHOT)) ? readFileSync(resolve(SNAPSHOT), 'utf8') : '';
    if (next !== current) {
      writeFileSync(resolve(SNAPSHOT), next);
      console.log(`  relevé mis à jour → ${SNAPSHOT}`);
    }
  }
}
