/**
 * `pnpm damage:check` — VALIDATION RÉELLE (demande Sevih 25/08/2026) : rejoue
 * TOUTES les fixtures dorées contre les tables COURANTES de
 * `data/generated/damage/` et imprime chaque ligne avec son Δ exact — là où
 * `fixtures.test.ts` (même logique de rejeu, `replayFixture` partagé) ne dit
 * que passe/casse sous tolérance.
 *
 * Lancé automatiquement en FIN de `pnpm damage:build` : après chaque patch,
 * une dérive saute aux yeux au lieu d'attendre le prochain `vitest`.
 * Lecture d'une dérive (même doctrine que le test) :
 *   - fixture d'une AUTRE version du jeu → le JEU a pu changer (équilibrage) :
 *     revérifier EN JEU d'abord — AVERTISSEMENT, le script ne casse pas ;
 *   - fixture de la version des tables → régression MOTEUR probable :
 *     exit 1 (fait échouer `damage:build` et la chaîne patch, à raison).
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { FIXTURES } from '../../src/lib/damage/fixtures';
import { ENGINE_GAME_VERSION, type DamageFixture } from '../../src/lib/damage/harness';
import { type DamageData } from '../../src/lib/damage/inputs';
import { replayFixture } from '../../src/lib/damage/replay';
import { gamedata } from '../lib/paths';

const J = (name: string): unknown =>
  JSON.parse(readFileSync(resolve('data/generated/damage', name), 'utf8'));
const data = {
  characters: J('characters.json'),
  growth: J('growth.json'),
  buffs: J('buffs.json'),
  targets: J('targets.json'),
  equipment: J('equipment.json'),
} as unknown as DamageData;
const resVersion = (data.characters as unknown as { resVersion?: string }).resVersion ?? '?';

// Garde anti-mensonge : ENGINE_GAME_VERSION (harness.ts) est une constante
// MANUELLE — si le dump-stamp de la machine de datamine connaît une autre
// version du client, c'est qu'on a oublié de la bumper avec le patch.
const DUMP_STAMP = gamedata('apk/dumped/.dump-stamp.json');
if (existsSync(DUMP_STAMP)) {
  try {
    const stamp = JSON.parse(readFileSync(DUMP_STAMP, 'utf8')) as { gameVersion?: string };
    if (stamp.gameVersion && stamp.gameVersion !== ENGINE_GAME_VERSION) {
      console.warn(
        `⚠ ENGINE_GAME_VERSION (harness.ts) = ${ENGINE_GAME_VERSION} mais le dernier dump ` +
          `est ${stamp.gameVersion} — bumper la constante avec le patch.`,
      );
    }
  } catch {
    /* stamp illisible : la garde ne vaut que si le stamp parle */
  }
}

console.log(
  `damage:check — rejeu des ${FIXTURES.length} fixtures dorées ` +
    `(tables resVersion ${resVersion}, moteur ${ENGINE_GAME_VERSION})`,
);

let exact = 0;
let drift = 0;
let skipped = 0;
let engineSuspect = 0;

const line = (f: DamageFixture, label: string): string => `  ${label}  ${f.name}`;

for (const f of FIXTURES) {
  if (f.skipRef) {
    skipped += f.observed.length;
    console.log(line(f, `⏭ skip (${f.skipRef})`.padEnd(14)));
    continue;
  }
  let replay: ReturnType<typeof replayFixture>;
  try {
    replay = replayFixture(f, data);
  } catch (e) {
    engineSuspect += 1;
    console.log(line(f, '✗ REJEU IMPOSSIBLE'.padEnd(14)));
    console.log(`      ${(e as Error)?.message ?? e}`);
    continue;
  }
  const tol = f.tolerance ?? 0.5;
  for (const o of f.observed) {
    const tag = `${o.slot} · ${o.branch}`;
    if (replay.pending.has(o.slot.split('#')[0])) {
      skipped += 1;
      console.log(line(f, '⏭ § 12.4'.padEnd(14)) + ` — ${tag}`);
      continue;
    }
    const computed = replay.lines.find((l) => l.slot === o.slot && l.branch === o.branch)?.damage;
    if (computed === undefined) {
      engineSuspect += 1;
      console.log(line(f, '✗ LIGNE ABSENTE'.padEnd(14)) + ` — ${tag} (kit/branches changés ?)`);
      continue;
    }
    const delta = Math.abs(((computed - o.damage) / o.damage) * 100);
    if (delta === 0) {
      exact += 1;
      console.log(line(f, '✓ 0.000 %'.padEnd(14)) + ` — ${tag} (${computed})`);
      continue;
    }
    drift += 1;
    const sameVersion = f.gameVersion === ENGINE_GAME_VERSION;
    if (sameVersion && delta > tol) engineSuspect += 1;
    const hint = sameVersion
      ? delta > tol
        ? 'version COURANTE : régression moteur probable'
        : 'version courante, sous tolérance (arrondi ?)'
      : `fixture ${f.gameVersion} ≠ moteur ${ENGINE_GAME_VERSION} : le JEU a pu changer — revérifier EN JEU`;
    console.log(
      line(f, `⚠ ${delta >= 0.0005 ? delta.toFixed(3) : '<0.001'} %`.padEnd(14)) +
        ` — ${tag} : calculé ${computed} vs en jeu ${o.damage} [${hint}]`,
    );
  }
}

console.log(
  `\nBilan : ${exact} ligne(s) exacte(s), ${drift} en dérive, ${skipped} sautée(s)` +
    (engineSuspect ? ` — ${engineSuspect} SUSPICION(S) MOTEUR` : ''),
);
if (engineSuspect) {
  console.error(
    '✗ dérive au-delà de la tolérance sur la version COURANTE (ou rejeu cassé) — ' +
      'régression moteur probable, comparer la trace du panneau Debug.',
  );
  process.exit(1);
}
