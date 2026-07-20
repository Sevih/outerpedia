/**
 * Générateur — DONNÉE LISTE des personnages (filtres de `/characters`).
 *
 * Agrège, par perso, les effets qu'il APPLIQUE, pour les filtres à facettes de
 * la page liste (recherche par buff/debuff, et par SOURCE de skill). Trois
 * champs par entrée (clé = id perso) :
 *   - `buff` / `debuff` : union dédupliquée des clés d'effet CANONIQUES sur tout
 *     le kit (clés `effectByKey` : `BT_STAT|ST_ATK`, `BT_IMMUNE`, `POLAR_NIGHT`…,
 *     repliées sur leur `group` quand la taxonomie en définit un) ;
 *   - `effectsBySource` : les mêmes, ventilés par SOURCE de skill (s1/s2/…) et par
 *     l'équipement exclusif (`exclusiveEquip`) ;
 *   - `teamBonuses` : stats données à TOUTE L'ÉQUIPE en permanence via le passif
 *     de TRANSCENDANCE (clés STAT_ICON : SPD/ATK/…).
 *
 * RÉSOLUTION DE CLÉ (le point délicat) : le `type` brut d'un effet de skill a
 * des variantes (`BT_STAT_PREMIUM`…) qui NE SONT PAS des clés de taxonomie. On
 * résout donc chaque effet → id de glossaire (via son tooltip/label) → on
 * INVERSE `effectByKey` pour retrouver la clé de taxonomie, puis on canonicalise
 * via `effect-filters` (`group`). Même identité que les chips affichées.
 *
 * MAPPING DES SLOTS : la V3 décompose plus finement que la V2 (13 slots vs 7
 * sources). Les buffs de l'attaque en CHAÎNE vivent sur les `strike_*`, ceux du
 * DUO sur les `backup_*` (cf. skill-view) — on les rattache donc à `chainPassive`
 * / `dualAttack`. Les passifs restants (class/unique/burst/extra) comptent dans
 * l'union `buff`/`debuff` mais n'ont pas de source nommée (comportement V2).
 *
 * Écriture CANONIQUE : `pnpm datagen:build` → `characters-list.json`. L'exécution
 * directe imprime des compteurs pour revue.
 */
import { isMain } from '../lib/is-main';
import type { Character } from '../extractor/specs/character';
import type { Skill } from './skills';
import type { Effect, ResolvedEffect } from '../lib/effects';
import type { EffectFiltersData } from '../curated/effect-filters';
import type { ExclusiveItem, Passive } from './equipment';

/** Effets agrégés d'un perso pour les filtres de liste. */
export interface CharacterEffects {
  /** Clés d'effet (canoniques) appliquées comme buff, tout le kit, triées. */
  buff: string[];
  /** Idem, côté debuff. */
  debuff: string[];
  /** Mêmes clés, ventilées par source de skill (s1/s2/ultimate/…). */
  effectsBySource: Record<string, { buff: string[]; debuff: string[] }>;
  /** Stats offertes à l'équipe par le passif de transcendance (clés STAT_ICON). */
  teamBonuses: string[];
}

/**
 * Vocabulaire FERMÉ des stats de bonus d'équipe (label du jeu → clé STAT_ICON).
 * Les noms pleins viennent des textes de transcendance (`+X% Ally Team <Stat>`) ;
 * les formes courtes (`DMG Incr`/`DMG Reduc`) sont des raccourcis propres à ces
 * textes (pas des noms de stat du glossaire) — d'où cette table, comme la V2.
 */
const TEAM_STAT: Record<string, string> = {
  attack: 'ATK',
  defense: 'DEF',
  health: 'HP',
  speed: 'SPD',
  'critical damage': 'CHD',
  'critical hit chance': 'CHC',
  effectiveness: 'EFF',
  resilience: 'RES',
  'dmg incr': 'DMG UP%',
  'dmg reduc': 'DMG RED%',
  penetration: 'PEN%',
  lifesteal: 'LS',
};

/** Ordre canonique d'affichage des bonus d'équipe (déterminisme + parité V2). */
const TB_ORDER = [
  'SPD',
  'ATK',
  'HP',
  'DEF',
  'CHD',
  'CHC',
  'DMG UP%',
  'DMG RED%',
  'CDMG RED%',
  'PEN%',
  'EFF',
  'RES',
  'LS',
];

/**
 * Stats d'équipe repérées dans un texte de transcendance : un label du
 * vocabulaire fermé ADJACENT au marqueur « Ally/Allies[' Team] » (« +X% Ally Team
 * Speed », « Allies DMG Incr +X% », « Increases Ally Resilience by X% »). On
 * matche le LABEL connu directement (pas une capture ouverte) — insensible aux
 * mots qui le suivent (« … Speed each turn », « … Resilience by 6% »).
 */
const ALLY_STAT = new RegExp(
  `all(?:ies|y)(?:['’]s?)?(?:\\s+team)?\\s+(${Object.keys(TEAM_STAT)
    .sort((a, b) => b.length - a.length)
    .join('|')})\\b`,
  'gi',
);

function teamStatsFromDesc(desc: string, into: Set<string>): void {
  const flat = desc.replace(/\\n|\r?\n/g, ' ');
  for (const m of flat.matchAll(ALLY_STAT)) {
    const key = TEAM_STAT[m[1].toLowerCase()];
    if (key) into.add(key);
  }
}

export type CharactersListData = Record<string, CharacterEffects>;

/** Slug de SkillType (V3) → source de filtre (contrat worker). Absent = pas de source nommée. */
const SLOT_SOURCE: Record<string, string> = {
  first: 's1',
  second: 's2',
  ultimate: 'ultimate',
  chain_passive: 'chainPassive',
  // Les buffs de l'attaque en chaîne vivent sur les skills techniques strike_*.
  strike_aerial: 'chainPassive',
  strike_ground: 'chainPassive',
  strike_finish: 'chainPassive',
  // Les buffs de l'attaque duo vivent sur les backup_*.
  backup_aerial: 'dualAttack',
  backup_ground: 'dualAttack',
  fusion_passive: 'fusionPassive',
};

type Side = 'buff' | 'debuff';

/** Dépendances déjà construites par l'orchestrateur (pas de double-build). */
export interface CharactersListDeps {
  characters: Record<string, Character>;
  skills: Record<string, Skill>;
  /** Glossaire des effets (id → effet) — pour le côté (isDebuff). */
  effects: Map<string, Effect>;
  /** tooltip → id d'effet canonique. */
  byTooltip: Map<string, string>;
  /** label (symbole CreateText) → id d'effet. */
  byLabel: Map<string, string>;
  /** clé de taxonomie → id, par côté. */
  byKey: Record<Side, Map<string, string>>;
  /** Taxonomie de filtre curée (famille UI + group). */
  effectFilters: EffectFiltersData;
  /** Équipements exclusifs (source `exclusiveEquip`), liés au perso par `character`. */
  ee: Record<string, ExclusiveItem>;
  /** Passifs référencés par les EE (id → passif, effets structurés). */
  passives: Record<string, Passive>;
}

/**
 * Index inverse id d'effet → clé de taxonomie, par côté. Ne garde QUE les clés
 * présentes dans la taxonomie curée ; sur collision (plusieurs clés → même id),
 * préfère la clé de BASE (sans `group`) à une variante.
 */
function invertKeys(
  byKey: Record<Side, Map<string, string>>,
  filters: EffectFiltersData,
): Record<Side, Map<string, string>> {
  const out: Record<Side, Map<string, string>> = { buff: new Map(), debuff: new Map() };
  for (const side of ['buff', 'debuff'] as const) {
    for (const [key, id] of byKey[side]) {
      if (!filters[side][key]) continue;
      const prev = out[side].get(id);
      if (!prev || (filters[side][prev].group && !filters[side][key].group)) out[side].set(id, key);
    }
  }
  return out;
}

/** Résout un effet de skill vers son id de glossaire (tooltip puis label). */
function effectId(e: ResolvedEffect, byTooltip: Map<string, string>, byLabel: Map<string, string>) {
  if (e.tooltip && byTooltip.has(e.tooltip)) return byTooltip.get(e.tooltip);
  if (e.label && byLabel.has(e.label)) return byLabel.get(e.label);
  return undefined;
}

/** Construit la donnée liste (agrégats d'effets) pour tous les persos. */
export function buildCharactersList(deps: CharactersListDeps): CharactersListData {
  const { characters, skills, effects, byTooltip, byLabel, byKey, effectFilters, ee, passives } =
    deps;
  const idToKey = invertKeys(byKey, effectFilters);
  // Perso → ses équipements exclusifs (l'EE se lie au perso par `character`).
  const eeByChar = new Map<string, ExclusiveItem[]>();
  for (const item of Object.values(ee)) {
    if (item.character)
      (eeByChar.get(item.character) ?? eeByChar.set(item.character, []).get(item.character)!).push(
        item,
      );
  }
  const out: CharactersListData = {};

  for (const char of Object.values(characters)) {
    const union: Record<Side, Set<string>> = { buff: new Set(), debuff: new Set() };
    const bySource: Record<string, Record<Side, Set<string>>> = {};
    const team = new Set<string>();

    // Résout un effet en (côté, clé canonique) et l'ajoute à l'union + à sa
    // source. On s'en tient aux STATUTS NOMMÉS (tooltip/label → id → clé de
    // taxonomie inversée = les chips affichées) : les effets purement mécaniques
    // sans tooltip (BT_AP_CHARGE self…) ne sont pas filtrables → zéro faux positif.
    const addEffect = (e: ResolvedEffect, source: string | undefined): void => {
      const id = effectId(e, byTooltip, byLabel);
      const eff = id ? effects.get(id) : undefined;
      if (!eff) return;
      const side: Side = eff.isDebuff ? 'debuff' : 'buff';
      const key = idToKey[side].get(id!);
      if (!key) return;
      const canonical = effectFilters[side][key]?.group ?? key; // variante `_IR`… → base
      union[side].add(canonical);
      if (source)
        (bySource[source] ??= { buff: new Set(), debuff: new Set() })[side].add(canonical);
    };

    for (const skillId of char.skills) {
      const sk = skills[skillId];
      if (!sk) continue;
      // Bonus d'équipe : le passif de TRANSCENDANCE (unique_passive) décrit son
      // gain d'équipe sur le desc PAR NIVEAU (SE_DESC_SKILL08_*).
      if (sk.type === 'unique_passive')
        for (const lv of sk.levels ?? []) if (lv.desc?.en) teamStatsFromDesc(lv.desc.en, team);
      if (!sk.effects) continue;
      const source = SLOT_SOURCE[sk.type];
      for (const e of sk.effects) addEffect(e, source);
    }

    // Équipement exclusif : effets des passifs de l'EE → source `exclusiveEquip`.
    for (const item of eeByChar.get(char.id) ?? [])
      for (const ref of item.passives)
        for (const e of passives[ref.id]?.effects ?? []) addEffect(e, 'exclusiveEquip');

    const effectsBySource: CharacterEffects['effectsBySource'] = {};
    for (const [source, sides] of Object.entries(bySource)) {
      const buff = [...sides.buff].sort();
      const debuff = [...sides.debuff].sort();
      if (buff.length || debuff.length) effectsBySource[source] = { buff, debuff };
    }

    out[char.id] = {
      buff: [...union.buff].sort(),
      debuff: [...union.debuff].sort(),
      effectsBySource,
      teamBonuses: [...team].sort((a, b) => TB_ORDER.indexOf(a) - TB_ORDER.indexOf(b)),
    };
  }

  return out;
}

// Exécution directe = revue (compteurs). Writer canonique = datagen:build.
if (isMain(import.meta.url)) {
  const run = async () => {
    const { buildCharacters } = await import('../extractor/specs/character');
    const { buildSkills } = await import('./skills');
    const { buildEffectGlossary } = await import('../lib/effects');
    const { loadEffectFilters } = await import('../curated/effect-filters');
    const { buildEquipment } = await import('./equipment');
    const { characters } = buildCharacters();
    const { skills } = buildSkills();
    const { effects, byTooltip, byLabel, byKey } = buildEffectGlossary();
    const equipment = buildEquipment();
    const data = buildCharactersList({
      characters,
      skills,
      effects,
      byTooltip,
      byLabel,
      byKey,
      effectFilters: loadEffectFilters(),
      ee: equipment.ee,
      passives: equipment.passives,
    });
    const n = Object.keys(data).length;
    const withBuff = Object.values(data).filter((c) => c.buff.length).length;
    const withDebuff = Object.values(data).filter((c) => c.debuff.length).length;
    const withSrc = Object.values(data).filter((c) => Object.keys(c.effectsBySource).length).length;
    const withTeam = Object.values(data).filter((c) => c.teamBonuses.length).length;
    console.log(`characters-list: ${n} persos`);
    console.log(
      `  avec buff: ${withBuff} · debuff: ${withDebuff} · sources: ${withSrc} · teamBonuses: ${withTeam}`,
    );
  };
  run();
}
