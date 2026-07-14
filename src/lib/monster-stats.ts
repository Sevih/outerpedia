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
 *
 * PIÈGE — `DungeonRank.hp` a DEUX sens selon le mode, et les confondre ment :
 * dans un mode à SCORE, ce n'est PAS les PV du boss mais la LARGEUR de la
 * tranche de dégâts du palier (`max − min + 1`). Vérifié sur toute l'échelle :
 * Singularity SSS++ `hp` = 750 000 = 5 000 000 − 4 250 001 + 1. L'afficher en
 * PV mentait d'un facteur 7,5. Le discriminant est `damage` : avec tranche, la
 * valeur est une barre (`bar`) ; sans tranche (adventure), de vrais PV.
 */
import type { DungeonAdv, DungeonRank, RankDamage } from '@contracts';

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
  /**
   * STAGE numéroté du palier (Adventure License) — l'autre façon dont un mode
   * gradue son échelle. Un grade porte un badge, un stage porte un NUMÉRO : les
   * deux s'excluent, et confondre les deux fabriquait un sprite qui n'existe pas.
   */
  stage?: number;
  /** Le stage, LOCALISÉ (« Stage 8 ») — posé par le rendu, seul à avoir le `t`. */
  stageLabel?: string;
  adv?: DungeonAdv;
  /** PV RÉELS du boss dans ce mode — remplacent l'interpolation du templet. */
  bossHp?: number;
  /** BARRE d'un palier à score : largeur de la tranche de dégâts, PAS des PV. */
  bar?: number;
  hpLines?: number;
  /** Niveau de transcendance du boss au palier (barème à part, non appliqué). */
  transLevel?: number;
  /** Tranche de dégâts du palier (modes à score). */
  damage?: RankDamage;
  /** Passifs additionnels du palier (résolus via `glossaries.rankOptions`). */
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
  return ranks.map((r) => {
    // Une tranche de dégâts = mode à SCORE = `r.hp` est une BARRE, pas des PV.
    const scored = r.damage !== undefined;
    return {
      ...base,
      level: r.level ?? base.level,
      // Le palier porte le nom que le JEU lui donne — ou rien. Un « #3 » de
      // repli était un faux grade : il partait dans le sprite du badge
      // (`CM_Event_Rank_#3`, image morte) et NUMÉROTAIT l'échelle à la place de
      // la donnée — le stage 8 d'Anubis s'affichait « #1 ». Une échelle sans
      // grade se gradue par ses stages (`stage`), pas par un compteur.
      rank: r.name,
      ...(r.stage ? { stage: r.stage } : {}),
      adv: r.adv,
      bossHp: scored ? base.bossHp : (r.hp ?? base.bossHp),
      ...(scored && r.hp !== undefined ? { bar: r.hp } : {}),
      ...(r.transLevel ? { transLevel: r.transLevel } : {}),
      ...(r.damage ? { damage: r.damage } : {}),
      ...(r.options ? { options: r.options } : {}),
    };
  });
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

/**
 * Valeur EFFECTIVE d'une stat dans le contexte d'une rencontre. `quirkMods` =
 * réductions PERMANENTES des quirks de compte (`glossaries.bossQuirkMods`,
 * per-mille signés — EFF/RES −10 %) : le jeu les applique aux stats affichées
 * du boss, nous aussi.
 */
export function statAt(
  slug: string,
  r: StatRange,
  ctx: SpawnContext,
  quirkMods?: Record<string, number>,
): number {
  let v = r.min + Math.floor(((r.max - r.min) * (ctx.level - 1)) / 99);
  const adv = ctx.adv?.[ADV_OF[slug]];
  if (adv) v = Math.floor((v * (1000 + adv)) / 1000);
  if (slug === 'hp' && ctx.bossHp) v = ctx.bossHp;
  const q = quirkMods?.[slug];
  if (q) v = Math.floor((v * (1000 + q)) / 1000);
  return v;
}

/**
 * Formate une valeur selon la convention d'AFFICHAGE du jeu.
 *
 * `locale` groupe les milliers : les PV d'un boss se comptent en dizaines de
 * millions, et « 47850000 » ne se lit pas. Optionnel — l'admin affiche des
 * valeurs brutes, qu'on ne veut pas voir bouger avec la langue de l'onglet.
 */
export function formatMonsterStat(
  slug: string,
  v: number,
  scales: Record<string, string>,
  locale?: string,
): string {
  if (RAW_FLAT.has(slug)) return String(v);
  if (scales[slug] === 'percent') return `${v / 10}%`;
  return locale ? v.toLocaleString(locale) : String(v);
}

/**
 * Lignes que l'écran du jeu affiche pour un monstre SANS que sa table les porte.
 *
 * `MonsterTemplet` n'a que 11 colonnes de stats (HP, WG, Speed, Atk, Def,
 * DamageBoost, DMGReduceRate, CriticalRate, CriticalDMGRate, BuffChance,
 * BuffResist), et n'en remplit pas toujours 11. Le panneau du jeu, lui, a des
 * lignes FIXES. Les omettre laissait un trou dans la grille ; les afficher à 0
 * dit quelque chose : ce boss n'a pas de pénétration.
 *
 * Le cas qui l'impose : les trois difficultés d'un Joint Challenge sont trois
 * MONSTRES distincts, et seul celui du Very Hard porte `DamageBoost`. Sans ce
 * remplissage, la grille passait de 11 à 12 cases en changeant d'onglet — une
 * grille qui change de forme sous le clic a l'air cassée, et le lecteur perdait
 * la ligne qu'il comparait. Avec, tout boss du jeu affiche les mêmes 12 lignes.
 *
 * Ce sont bien des stats de BASE : les paliers de Singularity accordent
 * « Pénétration +30 % » en PASSIF (un buff irremovable), pas en modification de
 * la fiche — d'où sa place parmi les pastilles de passifs, pas dans la grille.
 */
const PANEL_ONLY_STATS = ['enemy_critical_dmg_reduce', 'pierce_power_rate', 'damage_boost'];

/** Stats d'un monstre, complétées des lignes que le panneau du jeu montre toujours. */
export function monsterPanelStats(stats: Record<string, StatRange>): Record<string, StatRange> {
  const out = { ...stats };
  for (const slug of PANEL_ONLY_STATS) out[slug] ??= { min: 0, max: 0 };
  return out;
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
      const key = `${s.level}|${s.rank ?? ''}|${s.stage ?? ''}|${JSON.stringify(s.adv ?? {})}|${s.bossHp ?? ''}|${s.bar ?? ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.level - b.level);
}
