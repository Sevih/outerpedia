/**
 * STATS DE MONSTRE À LA RENCONTRE — calcul partagé admin/public (une seule
 * source, les deux cartes rendent pareil).
 *
 * Échelle identique aux personnages : min@1 → max@100, interpolation linéaire
 * EXTRAPOLÉE au-delà de 100 (les spawns vont jusqu'à Lv200). S'y ajoutent les
 * modificateurs du DONJON (vérifiés in-game, joint challenge very hard) :
 *   - `adv` (per-mille signés, `SpawnAdvantageRate_*`) sur ATK/DEF/HP/SPD :
 *     `stat × (1000 + adv) / 1000` arrondi bas (10754 × 0,465 = 5000 exact) ;
 *   - `bossHp` (`EventBossDungeonTemplet.BossMonsterHP`) : PV réels du boss,
 *     REMPLACE l'interpolation (2 000 000 en very hard).
 */
import type { DungeonAdv, DungeonRank } from '@contracts';

export interface StatRange {
  min: number;
  max: number;
}

/** Contexte d'une rencontre : niveau + modificateurs du donjon/palier. */
export interface SpawnContext {
  level: number;
  /** « Mode · Stage » (info-bulle du sélecteur). */
  label?: string;
  /** Nom du palier (« SSS », « E+ »…) quand la rencontre en a un. */
  rank?: string;
  adv?: DungeonAdv;
  bossHp?: number;
  hpLines?: number;
  /** Niveau de transcendance du boss au palier (barème à part, non appliqué). */
  transLevel?: number;
  /** Passifs additionnels du palier (ids bruts — résolution TODO). */
  options?: string[];
}

/**
 * Déplie un spawn en contextes : sans palier, le spawn tel quel ; avec paliers
 * (modes à progression : guild dungeon, world boss, singularity, event
 * challenge, adventure, exploration), UN contexte PAR palier — le palier
 * redéfinit la rencontre (niveau, PV, et ses adv REMPLACENT ceux du donjon).
 */
export function expandRankContexts(base: SpawnContext, ranks?: DungeonRank[]): SpawnContext[] {
  if (!ranks?.length) return [base];
  return ranks.map((r, i) => ({
    ...base,
    level: r.level ?? base.level,
    rank: r.name ?? `#${i + 1}`,
    adv: r.adv,
    bossHp: r.hp ?? base.bossHp,
    ...(r.transLevel ? { transLevel: r.transLevel } : {}),
    ...(r.options ? { options: r.options } : {}),
  }));
}

/** Ordre de l'écran de stats du jeu (le reste suit, dans l'ordre d'extraction). */
const GAME_ORDER = [
  'atk',
  'def',
  'hp',
  'speed',
  'critical_rate',
  'critical_dmg',
  'enemy_critical_dmg_reduce',
  'pierce_power',
  'pierce_power_rate',
  'damage_boost',
  'dmg_reduce',
  'buff_chance',
  'buff_resist',
  'effectiveness',
  'resilience',
];

/** EFF/RES : le jeu les affiche en VALEUR BRUTE (« 210 »), jamais en %. */
const RAW_FLAT = new Set(['buff_chance', 'buff_resist', 'effectiveness', 'resilience']);

/** Stat → clé de modificateur de donjon correspondante. */
const ADV_OF: Record<string, keyof DungeonAdv> = {
  atk: 'atk',
  def: 'def',
  hp: 'hp',
  speed: 'spd',
};

/** Valeur EFFECTIVE d'une stat dans le contexte d'une rencontre. */
export function statAt(slug: string, r: StatRange, ctx: SpawnContext): number {
  let v = r.min + Math.floor(((r.max - r.min) * (ctx.level - 1)) / 99);
  const adv = ctx.adv?.[ADV_OF[slug]];
  if (adv) v = Math.floor((v * (1000 + adv)) / 1000);
  if (slug === 'hp' && ctx.bossHp) v = ctx.bossHp;
  return v;
}

/** Formate une valeur selon la convention d'AFFICHAGE du jeu. */
export function formatMonsterStat(slug: string, v: number, scales: Record<string, string>): string {
  if (RAW_FLAT.has(slug)) return String(v);
  return scales[slug] === 'percent' ? `${v / 10}%` : String(v);
}

/** Entrées de stats dans l'ordre de l'écran du jeu. */
export function orderedStats(stats: Record<string, StatRange>): Array<[string, StatRange]> {
  const order = (slug: string): number => {
    const i = GAME_ORDER.indexOf(slug);
    return i === -1 ? GAME_ORDER.length : i;
  };
  return Object.entries(stats).sort(([a], [b]) => order(a) - order(b));
}

/** Dédup des rencontres par EFFET (niveau + palier + modificateurs), triées par niveau. */
export function dedupSpawnContexts(spawns: SpawnContext[]): SpawnContext[] {
  const seen = new Set<string>();
  return spawns
    .filter((s) => {
      const key = `${s.level}|${s.rank ?? ''}|${JSON.stringify(s.adv ?? {})}|${s.bossHp ?? ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.level - b.level);
}
