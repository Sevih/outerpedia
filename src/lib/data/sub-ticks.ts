/**
 * TICKS DE REFORGE des substats ATK / DEF / HP (flat et %) sur une pièce 6★ —
 * `data/generated/solver/sub-ticks.json`, recomposé par le datagen depuis
 * `ItemOptionTemplet` (pool de subs majoritaire des gears 6★). Le fichier
 * porte aussi la ligne 5★ ; la fiche perso suppose toujours du 6★ (le
 * standard endgame), on ne lit que celle-là.
 *
 * Unité du fichier : `step` en points pour le plat (`percent: false`), en
 * points d'AFFICHAGE pour le % (`percent: true`, 4 = +4 % — le datagen divise
 * le per-mille par 10). Le lecteur VÉRIFIE ce marquage : un fichier dont le
 * flag ne correspondrait plus ferait diviser un per-mille par 100 en silence.
 */
import {
  SUBSTAT_AXES,
  type SubstatAxis,
  type SubstatTicks,
  type SubTick,
} from '@/lib/substat-verdict';
import subTicksData from '@data/generated/solver/sub-ticks.json';

type RawTick = { step: number; percent: boolean };
const RAW = subTicksData as unknown as Record<string, Record<string, RawTick>>;

const GEAR_STAR = '6';

/** Clé du fichier par axe : `atk` / `atkPct`, `def` / `defPct`, `hp` / `hpPct`. */
const KEYS: Record<SubstatAxis, { flat: string; pct: string }> = {
  ATK: { flat: 'atk', pct: 'atkPct' },
  DEF: { flat: 'def', pct: 'defPct' },
  HP: { flat: 'hp', pct: 'hpPct' },
};

let cache: SubstatTicks | null | undefined;

/**
 * Les ticks 6★ par axe, `null` si le fichier ne porte pas les 6 duals attendus
 * avec le bon marquage d'unité — la fiche perso n'affiche alors pas
 * d'annotation plutôt qu'un verdict faux.
 */
export function getSubstatTicks(): SubstatTicks | null {
  if (cache !== undefined) return cache;
  const row = RAW[GEAR_STAR];
  if (!row) return (cache = null);
  const ticks = {} as Record<SubstatAxis, SubTick>;
  for (const axis of SUBSTAT_AXES) {
    const flat = row[KEYS[axis].flat];
    const pct = row[KEYS[axis].pct];
    if (!flat || !pct || flat.percent !== false || pct.percent !== true) return (cache = null);
    ticks[axis] = { flat: flat.step, pct: pct.step };
  }
  return (cache = ticks);
}
