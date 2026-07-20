/**
 * Générateur — DONNÉE LISTE des personnages (filtres de `/characters`).
 *
 * Agrège, par perso, les effets qu'il APPLIQUE, pour les filtres à facettes de
 * la page liste (recherche par buff/debuff, et par SOURCE de skill). Trois
 * champs par entrée (clé = id perso) :
 *   - `buff` / `debuff` : union dédupliquée des clés d'effet CANONIQUES sur tout
 *     le kit (clés `effectByKey` : `BT_STAT|ST_ATK`, `BT_IMMUNE`, `POLAR_NIGHT`…,
 *     repliées sur leur `group` quand la taxonomie en définit un) ;
 *   - `effectsBySource` : les mêmes, ventilés par SOURCE de skill (s1/s2/…).
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
 * NB : `teamBonuses` (bonus d'équipe de transcendance) et `exclusiveEquip`
 * (effets de l'EE) ne sont PAS encore produits ici — cf. TODO en fin de fichier.
 *
 * Écriture CANONIQUE : `pnpm datagen:build` → `characters-list.json`. L'exécution
 * directe imprime des compteurs pour revue.
 */
import { isMain } from '../lib/is-main';
import type { Character } from '../extractor/specs/character';
import type { Skill } from './skills';
import type { Effect, ResolvedEffect } from '../lib/effects';
import type { EffectFiltersData } from '../curated/effect-filters';

/** Effets agrégés d'un perso pour les filtres de liste. */
export interface CharacterEffects {
  /** Clés d'effet (canoniques) appliquées comme buff, tout le kit, triées. */
  buff: string[];
  /** Idem, côté debuff. */
  debuff: string[];
  /** Mêmes clés, ventilées par source de skill (s1/s2/ultimate/…). */
  effectsBySource: Record<string, { buff: string[]; debuff: string[] }>;
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
  const { characters, skills, effects, byTooltip, byLabel, byKey, effectFilters } = deps;
  const idToKey = invertKeys(byKey, effectFilters);
  const out: CharactersListData = {};

  for (const char of Object.values(characters)) {
    const union: Record<Side, Set<string>> = { buff: new Set(), debuff: new Set() };
    const bySource: Record<string, Record<Side, Set<string>>> = {};

    for (const skillId of char.skills) {
      const sk = skills[skillId];
      if (!sk?.effects) continue;
      const source = SLOT_SOURCE[sk.type];
      for (const e of sk.effects) {
        // Résolution par statut NOMMÉ (tooltip/label → id → clé de taxonomie
        // inversée). On s'en tient AUX STATUTS NOMMÉS (= les chips affichées) :
        // les effets purement mécaniques sans tooltip (BT_AP_CHARGE self…) ne
        // sont pas des « buffs appliqués » filtrables → zéro faux positif.
        const id = effectId(e, byTooltip, byLabel);
        const eff = id ? effects.get(id) : undefined;
        if (!eff) continue;
        const side: Side = eff.isDebuff ? 'debuff' : 'buff';
        const key = idToKey[side].get(id!);
        if (!key) continue;
        // Canonicalise la variante (`_IR`… → base) via la taxonomie.
        const canonical = effectFilters[side][key]?.group ?? key;
        union[side].add(canonical);
        if (source) {
          const bucket = (bySource[source] ??= { buff: new Set(), debuff: new Set() });
          bucket[side].add(canonical);
        }
      }
    }

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
    const { characters } = buildCharacters();
    const { skills } = buildSkills();
    const { effects, byTooltip, byLabel, byKey } = buildEffectGlossary();
    const data = buildCharactersList({
      characters,
      skills,
      effects,
      byTooltip,
      byLabel,
      byKey,
      effectFilters: loadEffectFilters(),
    });
    const n = Object.keys(data).length;
    const withBuff = Object.values(data).filter((c) => c.buff.length).length;
    const withDebuff = Object.values(data).filter((c) => c.debuff.length).length;
    const withSrc = Object.values(data).filter((c) => Object.keys(c.effectsBySource).length).length;
    console.log(`characters-list: ${n} persos`);
    console.log(`  avec buff: ${withBuff} · avec debuff: ${withDebuff} · avec sources: ${withSrc}`);
  };
  run();
}

// TODO(#3 teamBonuses) : bonus d'équipe de TRANSCENDANCE — dérivable du `desc`
// par niveau du passif de transcendance (SkillLevel.desc, « +X% Ally Team … »),
// pas des effets my_team (qui incluent les buffs de combat temporaires).
// TODO(exclusiveEquip) : effets de l'équipement exclusif (source `exclusiveEquip`).
