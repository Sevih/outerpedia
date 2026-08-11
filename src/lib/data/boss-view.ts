/**
 * LA VUE D'UN BOSS — tout ce que sa carte affiche, RÉSOLU et sérialisable.
 *
 * `BossCard` mélangeait deux métiers : aller chercher la donnée (glossaire des
 * effets, curation d'affichage, échelles de stats, donjons) et la rendre. Ce
 * module prend le premier. La carte ne fait plus que rendre — pour un boss du
 * live comme pour un boss figé, avec le MÊME code.
 *
 * POURQUOI CETTE SÉPARATION plutôt qu'une seconde carte pour les boss épinglés :
 * `BossCard` sert quatre modes de guide ; deux rendus censés être identiques
 * finissent par diverger, et la divergence tombe sur les vieux guides — ceux que
 * personne ne relit. Un seul rendu, deux provenances de données.
 *
 * MULTILINGUE (arbitrage Sevih) : la vue garde les dictionnaires ENTIERS et ne
 * choisit pas de langue. Un guide versionné se lit dans les cinq langues, pas
 * seulement en anglais — et c'est cette forme-là que l'archive fige.
 *
 * CE QUI N'EST PAS DEDANS, et pourquoi :
 *   - les SPAWNS d'une rencontre : ils appartiennent au MODE, pas au boss (le
 *     guide dit contre quoi on se bat ; la vue dit qui est le boss). Seules les
 *     rencontres PROPRES du monstre sont ici, pour le `BossPanel` ;
 *   - le chrome d'interface (« Immunities », « Skills »…) : c'est de l'UI, pas
 *     de la donnée de jeu. Le figer casserait les traductions.
 */
import type {
  DungeonRef,
  Glossaries,
  LangDict,
  Monster,
  MonsterSpawn,
  RankOption,
  Skill,
} from '@contracts';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import type { MonsterThumb } from '@/components/ui/Thumbnail';
import type { ClientEffect } from '@/components/character/EffectChips';
import { expandRankContexts, monsterPanelStats, type SpawnContext } from '@/lib/monster-stats';
import type { StatRange } from '@/lib/monster-stats';
import {
  buildStatusMapI18n,
  dedupSkills,
  immunityChipEffects,
  monsterSkillViews,
  type KitSources,
  type MonsterKitCuration,
} from '@/lib/skill-view';
import {
  effectForTooltip,
  getMergedEffect,
  mergeStatusEffectsI18n,
  type MergedEffect,
  type StatusI18n,
  type StatusMapI18n,
} from '@/lib/data/effects';

/** Un skill de boss, prêt à rendre — textes NON localisés (cf. en-tête). */
export interface BossSkillView {
  id: string;
  name: LangDict;
  desc?: LangDict;
  icon?: string;
  /**
   * Portée et camp : la carte en tire son étiquette de cible via le chrome i18n
   * (« Single Target »…). C'est une chaîne d'INTERFACE, donc jamais figée ici.
   */
  range?: string;
  offensive?: boolean;
  maxLevel: number;
  levels: Array<{
    level: number;
    cool?: number;
    wgReduce?: number;
    vars?: Skill['levels'][number]['vars'];
  }>;
  effects?: ClientEffect[];
}

/** Une immunité : sa réf, et le statut résolu — `effect` absent = réf inconnue. */
export interface BossImmunityView {
  tid: string;
  effect?: StatusI18n;
}

export interface BossView {
  /** Id tel que le guide le désigne — `<id>@<n>` si le boss est épinglé. */
  id: string;
  name: LangDict;
  thumb: MonsterThumb;
  /** Stats du panneau du jeu, lignes toujours-affichées comprises. */
  stats: Record<string, StatRange>;
  statScales: Record<string, string>;
  quirkMods: Record<string, number>;
  rankOptions: Record<string, RankOption>;
  immunities: BossImmunityView[];
  skills: BossSkillView[];
  /** Sous-glossaire du boss : les statuts que ses chips nomment. */
  statuses: StatusMapI18n;
  /** Rencontres PROPRES du monstre + de quoi les nommer (cf. en-tête). */
  spawns: MonsterSpawn[];
  dungeons: Record<string, DungeonRef>;
  modes: Record<string, LangDict>;
  /**
   * Présent SEULEMENT si la vue est figée — c'est ce qui rend l'épinglage
   * VISIBLE. Sans ça, un boss archivé et un boss vivant sont pixel pour pixel
   * identiques à l'écran : rien ne dit au lecteur (ni à l'éditeur) laquelle des
   * deux il regarde, et une carte périmée se lit comme à jour.
   */
  archived?: BossArchiveStamp;
}

/** Ce qu'une vue figée doit pouvoir dire d'elle-même. */
export interface BossArchiveStamp {
  /** Numéro d'archive — `<id>@<version>`. */
  version: number;
  /** `resVersion` du jeu à la capture, si connue (archives anciennes : absente). */
  gameVersion?: string;
  /** Date ISO du commit source. */
  committedAt: string;
  /** Note humaine de l'archive (« avant la maj 1.11 »), si posée. */
  label?: string;
}

/**
 * Les sources dont la vue est tirée. `KitSources` porte déjà le glossaire —
 * lequel contient `statScales`, `bossQuirkMods`, `rankOptions` et `modes` — donc
 * il ne reste que les donjons et la curation d'affichage.
 */
export interface BossViewSources extends KitSources {
  /** Donjons des spawns du monstre (`encounters.json`, ou snapshot d'archive). */
  dungeons: Record<string, DungeonRef>;
  /** Titres de modes — absents = ceux du glossaire (une archive fige les siens). */
  modes?: Record<string, LangDict>;
  /** Curation d'affichage des kits monstres — absente = celle du live. */
  curation?: MonsterKitCuration;
  /**
   * Provenance de l'archive, quand la vue en vient. Passée par les sources et
   * pas déduite ici : `buildBossView` ne lit pas le disque, et c'est ce qui la
   * garde testable à sec.
   */
  archived?: BossArchiveStamp;
}

/** Un effet fusionné réduit à ce qu'un statut affiche. */
function toStatus(e: MergedEffect): StatusI18n {
  return {
    name: e.name,
    isDebuff: e.isDebuff,
    ...(e.icon ? { icon: e.icon } : {}),
    ...(e.desc ? { desc: e.desc } : {}),
    ...(e.hidden ? { hidden: true } : {}),
  };
}

/**
 * Construit la vue d'un boss. FONCTION PURE : tout vient de `src`, rien du
 * disque — c'est ce qui permet de la rendre depuis une archive aussi bien que
 * depuis le live, et de la tester à sec.
 */
export function buildBossView(
  id: string,
  monster: Monster,
  rawSkills: Skill[],
  src: BossViewSources,
): BossView {
  const g: Glossaries = src.g;
  // Dédup ICI, pas chez l'appelant : les listes de skills des monstres à formes
  // répètent des ids, et une vue qui compterait deux fois le même skill est un
  // bug qu'on ne veut pas dépendre de la discipline des quatre appelants.
  const skills = dedupSkills(rawSkills);

  // Vue « kit » : chips réattribuées par réf de desc, enrage fusionné (le
  // rage_finish sans nom disparaît, ses chips rejoignent la carte enter).
  const views = monsterSkillViews(skills, src.curation, src).filter(({ skill: s }) => s.name.en);
  const bossSkills: BossSkillView[] = views.map(({ skill: s, effects }) => ({
    id: s.id,
    name: s.name,
    ...(s.desc ? { desc: s.desc } : {}),
    ...(s.icon ? { icon: s.icon } : {}),
    ...(s.range ? { range: s.range } : {}),
    ...(s.offensive ? { offensive: true } : {}),
    maxLevel: s.maxLevel,
    levels: s.levels.map((l) => ({
      level: l.level,
      cool: l.cool,
      wgReduce: l.wgReduce,
      vars: l.vars,
    })),
    ...(effects ? { effects } : {}),
  }));

  // Statuts nommés du kit, puis ceux des chips CURÉES en plus (chipAdd) : leur
  // statut n'est pas porté par les skills eux-mêmes.
  const statuses = buildStatusMapI18n(skills, src);
  mergeStatusEffectsI18n(
    statuses,
    bossSkills.flatMap((s) => s.effects ?? []),
    src.fx,
  );

  // Immunités : tooltips affichés en jeu + TYPES de mécanique, résolus vers les
  // effets canoniques. Une réf non résolue reste NUE — la carte la signale en
  // rouge, comme une erreur de contenu.
  const { effects: refs, unresolved } = immunityChipEffects(monster, src);
  const immunities: BossImmunityView[] = [
    ...refs.map((e) => {
      const eff = effectForTooltip(e.tooltip!, src.fx) ?? getMergedEffect(e.tooltip!, src.fx);
      return { tid: e.tooltip!, ...(eff ? { effect: toStatus(eff) } : {}) };
    }),
    ...unresolved.map((tid) => ({ tid })),
  ];

  // Donjons RESTREINTS aux spawns du monstre : la vue doit pouvoir être figée
  // seule, pas traîner tout `encounters.json` derrière elle.
  const spawns = monster.spawns ?? [];
  const allModes = src.modes ?? g.modes ?? {};
  const dungeons: Record<string, DungeonRef> = {};
  const modes: Record<string, LangDict> = {};
  for (const s of spawns) {
    const d = src.dungeons[s.dungeon];
    if (!d) continue;
    dungeons[s.dungeon] = d;
    if (allModes[d.mode]) modes[d.mode] = allModes[d.mode];
  }

  return {
    id,
    name: monster.name,
    thumb: {
      icon: monster.icon,
      type: monster.type,
      stars: monster.rarity,
      element: monster.element,
      cls: monster.class,
    },
    stats: monsterPanelStats(monster.stats),
    statScales: g.statScales,
    quirkMods: g.bossQuirkMods ?? {},
    rankOptions: g.rankOptions ?? {},
    immunities,
    skills: bossSkills,
    statuses,
    spawns,
    dungeons,
    modes,
    ...(src.archived ? { archived: src.archived } : {}),
  };
}

/**
 * Rencontres propres du monstre, avec les MODIFICATEURS du donjon et un libellé
 * « Mode · Stage » localisé. Même contrat que `monsterSpawnContexts`, mais lu
 * dans la VUE : c'est ce qui fait qu'un boss épinglé garde ses contextes de
 * stats même si le donjon a disparu du live (événement retiré, stage
 * re-niveauté) — l'archive fige ses donjons exprès depuis toujours.
 */
export function bossSpawnContexts(view: BossView, lang: Lang): SpawnContext[] {
  return view.spawns.flatMap((s) => {
    const d = view.dungeons[s.dungeon];
    if (!d) return [];
    const mode = view.modes[d.mode] ? lRec(view.modes[d.mode], lang) : d.mode;
    return expandRankContexts(
      {
        level: s.level,
        label: `${mode} · ${lRec(d.name, lang) || d.name.en}`,
        ...(d.adv ? { adv: d.adv } : {}),
        ...(d.bossHp ? { bossHp: d.bossHp } : {}),
        ...(s.hpLines ? { hpLines: s.hpLines } : {}),
      },
      d.ranks,
    );
  });
}

/**
 * Libellés des passifs de PALIER cités par des rencontres (« Increased
 * Penetration +30% »). Une option inconnue est OMISE : mieux vaut ne rien dire
 * qu'inventer. Même règle que `rankOptionLabels`, sur les options de la vue.
 */
export function bossRankOptionLabels(
  view: BossView,
  contexts: SpawnContext[],
  lang: Lang,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const id of new Set(contexts.flatMap((c) => c.options ?? []))) {
    const o = view.rankOptions[id];
    const name = o?.name ? lRec(o.name, lang) : undefined;
    if (!name) continue;
    // `value` est un per-mille pour les taux (convention du jeu, cf. statScales).
    const amount =
      o.value && o.stat && view.statScales?.[o.stat] === 'percent'
        ? ` ${o.value > 0 ? '+' : ''}${o.value / 10}%`
        : o.value
          ? ` ${o.value > 0 ? '+' : ''}${o.value}`
          : '';
    out[id] = `${name}${amount}`;
  }
  return out;
}
