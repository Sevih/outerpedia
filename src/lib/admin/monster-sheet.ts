/**
 * La FICHE d'un monstre telle que la section Extraction de quick la montre :
 * ses rencontres, ses stats à la rencontre, ses relations (invocateurs, kit
 * lié, invoqués) et le déclencheur d'enrage de ses skills — des règles que
 * l'ancien panneau admin calculait dans son rendu, descendues ici pour que
 * quick n'en recopie aucune.
 *
 * Tout est PUR : le monstre, les donjons (frais, avec le committé en repli
 * pour un monstre retenu dont le donjon a disparu), les titres de modes, les
 * échelles et les quirks sont passés — les appelants lisent le disque.
 */
import type { DungeonRef, LangDict, Monster } from '@contracts';
import {
  dedupSpawnContexts,
  expandRankContexts,
  formatMonsterStat,
  orderedStats,
  statAt,
  type SpawnContext,
  type StatRange,
} from '@/lib/monster-stats';
import { statAbbr } from '@/lib/stats';

/** Les rencontres montrées avant « n de plus » sur la fiche d'Extraction. */
export const ENCOUNTERS_SHOWN = 25;

/** Les donjons où lire une rencontre : le frais d'abord, le committé en repli. */
export interface DungeonSources {
  dungeons: Record<string, DungeonRef | undefined>;
  /** Les titres de modes (`encounters.modes`) ; un mode inconnu garde son slug. */
  modes: Record<string, LangDict | undefined>;
  fallback?: Record<string, DungeonRef | undefined>;
}

interface ResolvedSpawn {
  dungeon: string;
  level: number;
  hpLines?: number;
  ref: DungeonRef;
}

const modeLabel = (src: DungeonSources, mode: string): string => src.modes[mode]?.en ?? mode;

/** Les spawns d'un monstre dont le donjon se lit, triés par niveau. */
function resolvedSpawns(m: Pick<Monster, 'spawns'>, src: DungeonSources): ResolvedSpawn[] {
  return (m.spawns ?? [])
    .flatMap((s) => {
      const ref = src.dungeons[s.dungeon] ?? src.fallback?.[s.dungeon];
      return ref ? [{ ...s, ref }] : [];
    })
    .sort((a, b) => a.level - b.level);
}

export interface MonsterEncounterRow {
  mode: string;
  name: string;
  area?: string;
  level: number;
  hpLines?: number;
}

export interface MonsterEncounters {
  rows: MonsterEncounterRow[];
  /** Celles qui ne sont pas montrées (« n de plus »). */
  more: number;
  total: number;
}

/** Les rencontres d'un monstre : mode, stage, zone, niveau, barres — `limit` au plus. */
export function monsterEncounters(
  m: Pick<Monster, 'spawns'>,
  src: DungeonSources,
  limit = ENCOUNTERS_SHOWN,
): MonsterEncounters {
  const spawns = resolvedSpawns(m, src);
  return {
    rows: spawns.slice(0, limit).map((s) => ({
      mode: modeLabel(src, s.ref.mode),
      name: s.ref.name.en || s.dungeon,
      ...(s.ref.area?.en ? { area: s.ref.area.en } : {}),
      level: s.level,
      ...(s.hpLines ? { hpLines: s.hpLines } : {}),
    })),
    more: Math.max(0, spawns.length - limit),
    total: spawns.length,
  };
}

/**
 * Les contextes de stats d'un monstre : une rencontre réelle par spawn,
 * dépliée par palier (`expandRankContexts`) — le libellé « Mode · Stage ».
 */
export function monsterStatContexts(
  m: Pick<Monster, 'spawns'>,
  src: DungeonSources,
): SpawnContext[] {
  return resolvedSpawns(m, src).flatMap((s) =>
    expandRankContexts(
      {
        level: s.level,
        label: `${modeLabel(src, s.ref.mode)} · ${s.ref.name.en || s.dungeon}`,
        adv: s.ref.adv,
        ...(s.ref.advLinked ? { advLinked: true as const } : {}),
        bossHp: s.ref.bossHp,
        ...(s.hpLines ? { hpLines: s.hpLines } : {}),
      },
      s.ref.ranks,
    ),
  );
}

export interface MonsterStatCell {
  slug: string;
  abbr: string;
  value: string;
  /** « × n barres » sur les PV d'une rencontre à plusieurs barres. */
  bars?: number;
}

/** Une rencontre du `select` de la fiche : son libellé, ses stats, son contexte en lignes. */
export interface MonsterStatsOption {
  /** « SSS · Lv 120 », ou « Lv 100 » sans palier — l'option du `select`. */
  label: string;
  /** « Mode · Stage (palier SSS) » — où. */
  where: string;
  cells: MonsterStatCell[];
  /** Le contexte, éclaté : niveau et transcendance ; modificateurs ; dégâts, barre, PV du mode. */
  context: string[];
  /** Les passifs de palier, résolus et dédoublonnés. */
  passives: string[];
}

export interface MonsterStatsSheet {
  /** Dédoublonnées par effet et triées par niveau. */
  options: MonsterStatsOption[];
  /** Celle que la carte montre d'abord : la dernière (le palier le plus haut). */
  selected: number;
  /** Aucune rencontre connue : les valeurs du templet au Lv 100. */
  template: boolean;
}

/** Les milliers séparés d'une espace fine insécable, comme en français — sans la locale du poste. */
const fmtInt = (n: number): string => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
const signed = (v: number): string => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v) / 10} %`;

/**
 * Les stats d'un monstre à chacune de ses rencontres — le calcul de
 * `MonsterStatsCard` (`statAt`, l'ordre de l'écran du jeu, le format du jeu,
 * les quirks de compte) rendu en options prêtes à poser dans un `select` :
 * la page ne calcule rien, elle montre l'option choisie.
 */
export function monsterStatsSheet(
  stats: Record<string, StatRange>,
  contexts: SpawnContext[],
  scales: Record<string, string>,
  quirkMods: Record<string, number> = {},
  optionLabels: Record<string, string> = {},
): MonsterStatsSheet {
  const deduped = dedupSpawnContexts(contexts);
  const template = deduped.length === 0;
  const shown: SpawnContext[] = template ? [{ level: 100 }] : deduped;
  const quirks = Object.entries(quirkMods).filter(([, v]) => v);
  const options = shown.map((ctx): MonsterStatsOption => {
    const modified = Boolean(ctx.adv || ctx.bossHp || ctx.bar);
    const cells = orderedStats(stats).map(([slug, r]): MonsterStatCell => ({
      slug,
      abbr: statAbbr(slug),
      value: formatMonsterStat(slug, statAt(slug, r, ctx, quirkMods), scales),
      ...(slug === 'hp' && ctx.hpLines ? { bars: ctx.hpLines } : {}),
    }));
    const context: string[] = [];
    if (template) context.push(`Aucune rencontre connue — valeurs du templet au Lv ${ctx.level}.`);
    else {
      context.push(`Lv ${ctx.level}${ctx.transLevel ? ` · transcendance ${ctx.transLevel}` : ''}`);
      const mods: string[] = [];
      if (ctx.adv)
        mods.push(
          `modificateurs du donjon : ${Object.entries(ctx.adv)
            .map(([k, v]) => `${k.toUpperCase()} ${signed(v)}`)
            .join(', ')}`,
        );
      if (ctx.advLinked)
        mods.push('adversité plus forte tant que des nœuds liés restent à nettoyer');
      if (quirks.length)
        mods.push(
          `quirks de compte : ${quirks.map(([s, v]) => `${statAbbr(s)} ${signed(v)}`).join(', ')}`,
        );
      if (!modified) mods.push('valeurs du templet, interpolées');
      if (mods.length) context.push(mods.join(' · '));
      const scored: string[] = [];
      if (ctx.damage)
        scored.push(
          `dégâts : ${fmtInt(ctx.damage.min ?? 0)} – ${ctx.damage.max ? fmtInt(ctx.damage.max) : '∞'}`,
        );
      if (ctx.bar) scored.push(`barre du palier : ${fmtInt(ctx.bar)}`);
      if (ctx.bossHp) scored.push(`PV du mode : ${fmtInt(ctx.bossHp)}`);
      if (scored.length) context.push(scored.join(' · '));
    }
    return {
      label: `${ctx.rank ? `${ctx.rank} · ` : ctx.stage ? `stage ${ctx.stage} · ` : ''}Lv ${ctx.level}`,
      where: template
        ? 'templet'
        : `${ctx.label ?? ''}${ctx.rank ? ` (palier ${ctx.rank})` : ctx.stage ? ` (stage ${ctx.stage})` : ''}`,
      cells,
      context,
      // Dédup d'affichage : certains paliers listent des copies techniques du
      // même buff (Normal_1_1/Normal_1_2 → même libellé).
      passives: [...new Set((ctx.options ?? []).map((o) => optionLabels[o] ?? o))],
    };
  });
  return { options, selected: options.length - 1, template };
}

/**
 * Le déclencheur d'enrage RÉEL d'un skill `rage_enterN` (`Monster.rage`,
 * extrait de RageTemplet) : les descs de ces skills sont écrites pour UNE
 * variante du boss et mentent sur les autres — le palier i correspond à
 * rage_enter(i+1). Rien pour un autre type de skill.
 */
export function monsterRageLabel(m: Pick<Monster, 'rage'>, type: string): string | undefined {
  const n = /^rage_enter(\d*)$/.exec(type);
  const step = n && m.rage?.steps[Number(n[1] || '1') - 1];
  if (!step || !m.rage) return undefined;
  const at =
    m.rage.trigger === 'hp_rate'
      ? `à ${step.value / 10} % PV`
      : m.rage.trigger === 'lose_hp_value'
        ? `tous les ${fmtInt(step.value)} PV perdus`
        : m.rage.trigger === 'turn_count'
          ? `au tour ${step.value}`
          : `${m.rage.trigger} ${step.value}`;
  return step.duration ? `${at} · ${step.duration} tours` : at;
}

export interface MonsterRef {
  id: string;
  name: string;
}

export interface MonsterRelations {
  /** Jamais spawné : invoqué par ces monstres. */
  summonedBy: MonsterRef[];
  /** Jamais spawné : lié au kit de ces monstres. */
  linkedTo: MonsterRef[];
  /** Ceux qu'il invoque (les monstres dont il est un `summonedBy`). */
  summons: MonsterRef[];
}

/** Les monstres liés à celui-ci, nommés d'après `all` (l'id seul sinon). */
export function monsterRelations(
  m: Pick<Monster, 'id' | 'summonedBy' | 'linkedTo'>,
  all: Record<string, Pick<Monster, 'id' | 'name' | 'summonedBy'> | undefined>,
): MonsterRelations {
  const ref = (id: string): MonsterRef => ({ id, name: all[id]?.name.en || id });
  return {
    summonedBy: (m.summonedBy ?? []).map(ref),
    linkedTo: (m.linkedTo ?? []).map(ref),
    summons: Object.values(all)
      .filter((x): x is NonNullable<typeof x> => Boolean(x?.summonedBy?.includes(m.id)))
      .map((x) => ref(x.id)),
  };
}
