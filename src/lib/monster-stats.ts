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
 *     REMPLACE l'interpolation (2 000 000 en very hard) — sur le BOSS seul,
 *     jamais sur un renfort (cf. `expandRankContexts`).
 *
 * Stat de FICHE (`statAt`) et stat de COMBAT (`combatStatAt`) : le jeu verse
 * au TAUX DE BUFF de la stat (`CalcFinalStat`, spec damage § 3) les passifs de
 * fiche du kit (`Monster.statPremium`) et les quirks « boss » du compte
 * (`monsterQuirkMods`, même canal : `GetStatPremiumBuffList` lit les buffs des
 * nœuds d'éveil), taux SOMMÉS puis une troncature. Les pages de boss et le
 * calculateur montrent la stat de combat, la fiche en infobulle.
 *
 * PIÈGE — `DungeonRank.hp` a DEUX sens selon le mode, et les confondre ment :
 * dans un mode à SCORE, ce n'est PAS les PV du boss mais la LARGEUR de la
 * tranche de dégâts du palier (`max − min + 1`). Vérifié sur toute l'échelle :
 * Singularity SSS++ `hp` = 750 000 = 5 000 000 − 4 250 001 + 1. L'afficher en
 * PV mentait d'un facteur 7,5. Le discriminant est `damage` : avec tranche, la
 * valeur est une barre (`bar`) ; sans tranche (adventure), de vrais PV.
 */
import type {
  DungeonAdv,
  DungeonMonster,
  DungeonRank,
  DungeonRef,
  Monster,
  RankDamage,
} from '@contracts';
import { calcStatByLevel } from '@/lib/damage/formula';

export interface StatRange {
  min: number;
  max: number;
}

/**
 * OVERGRADE du main boss de guild raid (au-delà du dernier stage templeté) —
 * GameConfig `GUILD_RAID_AFTER_10_BOSS_STAT` = [300, 300, 10] (hp, atk, def,
 * ‰ par overgrade, dump 1.4.14 — gardé par damage-data.test) :
 *   - PV : `floor(float32(1 + og × 300/1000) × float32(BossMonsterHP))`
 *     (`CGuildRaidSpawnData.GetCharacterData`, spec damage § 12.13) ;
 *   - ATK/DEF : canal `addRate` de SetBaseValue (spec § 3.2) —
 *     `base × (1000 + og × taux) / 1000` arrondi bas, AVANT adv/quirks.
 */
export const GUILD_RAID_OVERGRADE_RATES = { hp: 300, atk: 300, def: 10 } as const;
/** GameConfig `GUILD_RAID_MAIN_BOSS_MAX_GRADE` = 100 (dump 1.4.14) — borne de
 *  l'échelle de stages du main boss (gardé par damage-data.test). */
export const GUILD_RAID_MAIN_BOSS_MAX_GRADE = 100;

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
  /** Infiltration : l'adv monte tant que des nœuds liés restent à nettoyer
   *  (`DungeonRef.advLinked`) — `adv` est celle du nœud seul. */
  advLinked?: true;
  /** PV RÉELS du boss dans ce mode — remplacent l'interpolation du templet. */
  bossHp?: number;
  /** BARRE d'un palier à score : largeur de la tranche de dégâts, PAS des PV. */
  bar?: number;
  /** Overgrade du main boss de guild raid (stage − dernier stage templeté),
   *  cf. `GUILD_RAID_OVERGRADE_RATES`. */
  overGrade?: number;
  hpLines?: number;
  /** Niveau du palier SUIVANT (chaîne de level-up des boss à score, 0 = dernier
   * palier) — « Trans » = transition, PAS transcendance : vérifié binaire
   * 03/08/2026, jamais appliqué aux stats. */
  transLevel?: number;
  /** Tranche de dégâts du palier (modes à score). */
  damage?: RankDamage;
  /** Passifs additionnels du palier (résolus via `glossaries.rankOptions`). */
  options?: string[];
}

/** Rôle d'un monstre dans un donjon (`DungeonRef.monsters[].role`) ; introuvable → `undefined`. */
export function roleInDungeon(
  d: Pick<DungeonRef, 'monsters'>,
  monsterId: string,
): DungeonMonster['role'] | undefined {
  return d.monsters?.find((m) => m.id === monsterId)?.role;
}

/**
 * Les paliers qui appartiennent À CE MONSTRE.
 *
 * Quand un donjon à échelle de rangs aligne PLUSIEURS boss, l'échelle les
 * ENJAMBE au lieu de se répéter : au world boss, le boss 1 se joue de D à A,
 * et ATTEINDRE S (le seuil de dégâts du palier) le fait transitionner en
 * boss 2, qui porte S→SSS. Donner les sept rangs aux deux cartes mentirait
 * deux fois — chaque boss afficherait des rangs où il n'existe pas.
 *
 * Le découpage se LIT dans la donnée, il ne se décrète pas : le niveau de base
 * de chaque boss est exactement le niveau de son premier palier (vérifié sur
 * les six world boss — 60 = rang D, 90 = rang S en ligue 3). Si les niveaux ne
 * dessinent pas cette partition (autre mode, autre convention), l'échelle
 * entière reste à chacun — le comportement d'avant. Un donjon sans `monsters`
 * (archive d'avant l'extraction) compte moins de deux boss : l'échelle entière.
 */
export function ranksOfMonster(
  d: Pick<DungeonRef, 'ranks' | 'monsters'>,
  monsterId: string,
): DungeonRank[] | undefined {
  const ranks = d.ranks;
  const bosses = (d.monsters ?? []).filter((x) => x.role !== 'add');
  if (!ranks?.length || bosses.length < 2 || roleInDungeon(d, monsterId) === 'add') return ranks;

  const starts = bosses.map((b) => ranks.findIndex((r) => r.level === b.level));
  const partitioned = starts.every((s, i) => (i === 0 ? s === 0 : s > starts[i - 1]));
  const k = bosses.findIndex((b) => b.id === monsterId);
  if (!partitioned || k < 0) return ranks;
  return ranks.slice(starts[k], k + 1 < starts.length ? starts[k + 1] : undefined);
}

/**
 * Déplie un spawn en contextes : sans palier, le spawn tel quel ; avec paliers
 * (modes à progression : guild dungeon, world boss, singularity, event
 * challenge, adventure, exploration), UN contexte PAR palier — le palier
 * redéfinit la rencontre (niveau, PV, et ses adv REMPLACENT ceux du donjon).
 *
 * `role` = rôle du monstre dans la rencontre (`roleInDungeon`). LA règle : les
 * PV de BOSS d'une rencontre (`bossHp` du donjon, ou `hp` d'un palier sans
 * tranche de dégâts) ne vont qu'au boss, jamais à un renfort — le client ne
 * pose `BossHP` que si `Templet.IsBoss()` (`CDungeonScene`), et
 * `CAdventureLicenseSpawnData` laisse au renfort ses PV interpolés (les 80
 * contextes de renfort de l'Adventure License affichaient les PV du boss).
 * Rôle inconnu → traité comme aujourd'hui, sans rien deviner. Un palier SCORÉ
 * garde sa règle (`bar`, PV de base) quel que soit le rôle.
 */
export function expandRankContexts(
  base: SpawnContext,
  ranks?: DungeonRank[],
  role?: DungeonMonster['role'],
): SpawnContext[] {
  const add = role === 'add';
  const own: SpawnContext = { ...base };
  if (add) delete own.bossHp;
  if (!ranks?.length) return [own];
  return ranks.map((r) => {
    // Une tranche de dégâts = mode à SCORE = `r.hp` est une BARRE, pas des PV.
    const scored = r.damage !== undefined;
    return {
      ...own,
      level: r.level ?? base.level,
      // Le palier porte le nom que le JEU lui donne — ou rien. Un « #3 » de
      // repli était un faux grade : il partait dans le sprite du badge
      // (`CM_Event_Rank_#3`, image morte) et NUMÉROTAIT l'échelle à la place de
      // la donnée — le stage 8 d'Anubis s'affichait « #1 ». Une échelle sans
      // grade se gradue par ses stages (`stage`), pas par un compteur.
      rank: r.name,
      ...(r.stage ? { stage: r.stage } : {}),
      adv: r.adv,
      bossHp: scored || add ? own.bossHp : (r.hp ?? own.bossHp),
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

/** Stat → clé de modificateur de donjon correspondante. */
const ADV_OF: Record<string, keyof DungeonAdv> = {
  atk: 'atk',
  def: 'def',
  hp: 'hp',
  speed: 'spd',
};

/** Types de monstre ≥ `CT_BOSS_MONSTER` : ceux à qui le client applique les quirks de compte. */
const QUIRK_BOSS_TYPES = new Set(['boss', 'area_boss', 'season_boss']);

/** Le client applique-t-il les quirks « boss » du compte à ce type de monstre ? */
export function quirkBossType(type: string | undefined): boolean {
  return type !== undefined && QUIRK_BOSS_TYPES.has(type);
}

/**
 * Quirks de compte qui s'appliquent à un monstre, selon son TYPE : ceux du
 * glossaire (`glossaries.bossQuirkMods`) pour `boss`, `area_boss` et
 * `season_boss`, rien sinon — le client n'applique les nœuds d'éveil 198 à 201
 * qu'à un type ≥ `CT_BOSS_MONSTER` (`CCharacterData.CheckNodeApply`) ; 1 180
 * monstres `monster` / `named` des rencontres perdaient 20 % d'EFF et de RES.
 * Ce sont des taux du canal de buff (`monsterStatChannel`), pas une passe à part.
 */
export function monsterQuirkMods(
  type: string | undefined,
  bossQuirkMods: Record<string, number> | undefined,
): Record<string, number> {
  return quirkBossType(type) ? (bossQuirkMods ?? {}) : {};
}

/**
 * Stat de FICHE d'un monstre dans le contexte d'une rencontre : interpolation,
 * overgrade, avantage de spawn, PV de boss — ce que le templet et le donjon
 * posent, AVANT le canal de buff (passifs de fiche, quirks : `combatStatAt`).
 */
export function statAt(slug: string, r: StatRange, ctx: SpawnContext): number {
  // Interpolation tronquée VERS ZÉRO, comme le client (`CFormula.CalcStat`) :
  // sur une plage décroissante, `Math.floor` sortait 1 de moins.
  let v = calcStatByLevel(r.min, r.max, ctx.level);
  const og = ctx.overGrade ?? 0;
  // Overgrade ATK/DEF = canal addRate (§ 3.2) : sur la BASE, avant adv.
  if (og && (slug === 'atk' || slug === 'def'))
    v = Math.floor((v * (1000 + og * GUILD_RAID_OVERGRADE_RATES[slug])) / 1000);
  const adv = ctx.adv?.[ADV_OF[slug]];
  if (adv) v = Math.floor((v * (1000 + adv)) / 1000);
  if (slug === 'hp' && ctx.bossHp) v = ctx.bossHp;
  // Overgrade PV : l'expression du client telle quelle, en FLOAT32 à chaque
  // opération (`0.001f` compris) — `CGuildRaidSpawnData.GetCharacterData`,
  // `FloorToInt((float)PV × (1f + (float)(taux × og) × 0.001f))` (§ 12.13).
  if (og && slug === 'hp') {
    const f = Math.fround;
    const factor = f(1 + f(f(GUILD_RAID_OVERGRADE_RATES.hp * og) * f(0.001)));
    v = Math.floor(f(f(v) * factor));
  }
  return v;
}

/** Canal de buff d'une stat : plats (`buffValue`) et taux ‰ (`buffValueRate`) sommés. */
export interface StatBuffChannel {
  flat: number;
  rate: number;
}

/**
 * Le canal de buff PERMANENT d'une stat de monstre : son passif de fiche
 * (`Monster.statPremium`) et les quirks « boss » du compte (`monsterQuirkMods`,
 * taux ‰) — un seul canal, les taux s'additionnent avant la troncature.
 */
export function monsterStatChannel(
  slug: string,
  premium: Monster['statPremium'],
  quirkMods?: Record<string, number>,
): StatBuffChannel {
  const p = premium?.[slug];
  return { flat: p?.flat ?? 0, rate: (p?.rate ?? 0) + (quirkMods?.[slug] ?? 0) };
}

/**
 * Stat de COMBAT depuis la stat de fiche et son canal de buff :
 * `div1000((fiche + plats) × (1000 + Σ taux))`, tronqué vers zéro, plancher 0
 * (`CFormula.CalcFinalStat`, A = 0 pour un monstre — spec damage § 3).
 */
export function combatStat(sheet: number, channel: StatBuffChannel): number {
  return Math.max(0, Math.trunc(((sheet + channel.flat) * (1000 + channel.rate)) / 1000));
}

/** Stat de fiche et stat de combat d'un monstre à une rencontre. */
export interface MonsterStatValue {
  sheet: number;
  combat: number;
}

/**
 * Stat d'un monstre à une rencontre, FICHE et COMBAT (`combatStat` du canal
 * de `monsterStatChannel`). Deux exceptions du client :
 *   - PV REMPLACÉS (`bossHp`, overgrade) : le jeu les pose par
 *     `CCharacterData.MaxHP = …` → `CStatValue.SetTempMaxValue`, que
 *     `GetFinalValue` rend TEL QUEL — le taux de buff ne s'y applique pas ;
 *   - CRIT : `SetFinalValue` borne le taux critique à [0, 1000].
 */
export function combatStatAt(
  slug: string,
  r: StatRange,
  ctx: SpawnContext,
  premium?: Monster['statPremium'],
  quirkMods?: Record<string, number>,
): MonsterStatValue {
  const sheet = statAt(slug, r, ctx);
  if (slug === 'hp' && (ctx.bossHp || ctx.overGrade)) return { sheet, combat: sheet };
  const combat = combatStat(sheet, monsterStatChannel(slug, premium, quirkMods));
  return { sheet, combat: slug === 'critical_rate' ? Math.min(combat, 1000) : combat };
}

/**
 * Formate une valeur selon la convention d'AFFICHAGE du jeu : l'échelle est
 * celle du glossaire (`statScales`), dérivée de `CUtilUI.IsPercentStat` à la
 * source (A73) — EFF/RES y sont plats, en valeur brute (« 210 »).
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
      const key = `${s.level}|${s.rank ?? ''}|${s.stage ?? ''}|${JSON.stringify(s.adv ?? {})}|${s.advLinked ? 1 : ''}|${s.bossHp ?? ''}|${s.bar ?? ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.level - b.level);
}
