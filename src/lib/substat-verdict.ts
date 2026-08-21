/**
 * FLAT OU % ? — quelle version d'une substat ATK / DEF / HP rapporte le plus
 * par tick de reforge, pour UN perso à UN état d'investissement.
 *
 * Dans `CalcFinalStat` (cf. `damage/formula`), le taux d'un item
 * (`itemOptionValueRate`) ne multiplie QUE la somme plate sans équipement :
 *
 *   sum_flat = base(niveau) + évolutions + éveil plat (quirks IOT_STAT)
 *   part1    = sum_flat × (1000 + transcend + éveil% + item%) / 1000
 *   combined = part1 + itemFlat + buffFlat
 *
 * Le plat du gear s'ajoute APRÈS cette multiplication, et le multiplicateur
 * de buff externe (`buffValueRate`) s'applique aux deux — il s'annule dans la
 * comparaison. Un tick de +p % vaut donc `sum_flat × p / 100` points plats,
 * à comparer au tick plat. Ni le gear équipé, ni les buffs, ni le % de
 * transcendance (qui s'ADDITIONNE au % de gear dans la même somme de taux)
 * n'entrent dans le verdict : seule la base du perso compte, donc son niveau,
 * ses évolutions et ses quirks (la couche « awakening » du client — le plat
 * seulement, son taux rejoint la somme de taux). La transcendance n'y est pour
 * rien, pas même par le niveau : le limit break (lv120) est ouvert à tout
 * palier d'étoiles. Le gear est toujours supposé 6★.
 *
 * Module PUR et client-safe (aucune donnée importée) : la fiche perso le
 * recalcule à chaque changement d'input. Les données (ticks, base par niveau)
 * sont résolues côté serveur — `lib/data/sub-ticks`, `char-progression`.
 */

/** Les trois axes qui existent en flat ET en % dans les pools de substats. */
export const SUBSTAT_AXES = ['ATK', 'DEF', 'HP'] as const;
export type SubstatAxis = (typeof SUBSTAT_AXES)[number];

export function isSubstatAxis(stat: string): stat is SubstatAxis {
  return (SUBSTAT_AXES as readonly string[]).includes(stat);
}

/**
 * L'axe d'un token de priorité curée : « DEF » comme « DEF% » (quelques
 * priorités écrivent la version que l'éditeur préfère — le verdict a
 * justement pour rôle de dire si ce choix tient à l'investissement donné).
 * `undefined` pour tout autre token (SPD, CHC, « DMG UP% »…).
 */
export function substatAxisOf(stat: string): SubstatAxis | undefined {
  const base = stat.trim().replace(/%$/, '');
  return isSubstatAxis(base) ? base : undefined;
}

/** Un tick de reforge : plat en points, % en points d'AFFICHAGE (4 = +4 %). */
export interface SubTick {
  flat: number;
  pct: number;
}

/** Les ticks par axe — le gear est toujours supposé 6★ (le standard endgame). */
export type SubstatTicks = Record<SubstatAxis, SubTick>;

/** `close` : les deux versions se valent à la marge près — un verdict
 *  binaire serait trompeur si près de la bascule. */
export type SubstatVerdictKind = 'pct' | 'flat' | 'close';

export interface SubstatVerdict {
  kind: SubstatVerdictKind;
  /** Base utilisée (niveau + évolutions + éveil plat). */
  sumFlat: number;
  flatTick: number;
  pctTick: number;
  /** Ce que vaut le tick % en points plats sur cette base. */
  equivFlat: number;
  /** Base au-dessus de laquelle le % gagne ; `null` si le tick % est nul. */
  breakeven: number | null;
}

/** Écart relatif (vs le tick plat) sous lequel on affiche « ≈ ». */
export const CLOSE_MARGIN = 0.05;

/**
 * Le verdict. Garde `pctTick ≤ 0` : pas de division par zéro, le plat gagne
 * (un % nul ne rapporte rien). `flatTick ≤ 0` symétrique : le % gagne dès
 * qu'il rapporte quelque chose.
 */
export function judgeSubstat(
  sumFlat: number,
  tick: SubTick,
  margin: number = CLOSE_MARGIN,
): SubstatVerdict {
  const flatTick = Math.max(0, tick.flat);
  const pctTick = Math.max(0, tick.pct);
  if (pctTick <= 0) {
    return { kind: 'flat', sumFlat, flatTick, pctTick, equivFlat: 0, breakeven: null };
  }
  const equivFlat = (sumFlat * pctTick) / 100;
  const breakeven = (flatTick * 100) / pctTick;
  let kind: SubstatVerdictKind;
  if (flatTick <= 0) kind = equivFlat > 0 ? 'pct' : 'close';
  else if (Math.abs(equivFlat - flatTick) / flatTick <= margin) kind = 'close';
  else kind = equivFlat > flatTick ? 'pct' : 'flat';
  return { kind, sumFlat, flatTick, pctTick, equivFlat, breakeven };
}

/**
 * La base d'un perso aux PALIERS STABLES d'une reco de gear, résolue côté
 * serveur (`char-progression.getSubstatFlatProfile`) : tout ce dont le client
 * a besoin pour recalculer le verdict à chaque input sans embarquer les tables
 * du jeu. Les paliers sont le cap sans limit break (100) puis un par limit
 * break (105 / 110 / 120) : chaque niveau correspond exactement à un palier de
 * LB, donc à un modificateur de croissance sans ambiguïté — un niveau
 * intermédiaire est transitoire et n'a rien à faire dans une reco.
 */
export interface SubstatFlatProfile {
  /** Les paliers, croissants (100, 105, 110, 120). */
  levels: number[];
  /** `flatByLevel[axe][palier]` = base interpolée + évolutions atteintes. */
  flatByLevel: Record<SubstatAxis, Record<number, number>>;
  /** Quirks PLATS (IOT_STAT au niveau max) par axe — leur taux est exclu. */
  awakFlat: Record<SubstatAxis, number>;
}

/** Palier par défaut : 100 (ne pas supposer le limit break), sinon le premier. */
export function defaultLevel(profile: SubstatFlatProfile): number {
  return profile.levels.includes(100) ? 100 : (profile.levels[0] ?? 100);
}

/** `sum_flat` d'un axe à un palier, quirks compris ou non. */
export function sumFlatAt(
  profile: SubstatFlatProfile,
  axis: SubstatAxis,
  level: number,
  quirksOn: boolean,
): number {
  return (profile.flatByLevel[axis][level] ?? 0) + (quirksOn ? profile.awakFlat[axis] : 0);
}
