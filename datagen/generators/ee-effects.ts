/**
 * Générateur — EFFETS COMPARABLES DES EE (`ee-effects.json`).
 *
 * Sert l'outil `/contribute/ranking-helper` : pour ranker un EE il faut ses
 * homologues À EFFET SIMILAIRE, et ce vocabulaire doit venir des EFFETS BRUTS
 * des fichiers du jeu (décision Sevih 04/08) — pas des chips curées de la
 * carte EE, dont 41 EE sur 124 sont dépourvus (« Penetration against bosses
 * +30% » est un effet de stat sans statut nommé, invisible en chips).
 *
 * Par personnage porteur : la liste dédupliquée des effets de son EE, chacun
 * réduit à une CLÉ de comparaison normalisée + un libellé lisible :
 *   stat:<slug>:<up|down>       — stat pure (nom réel du jeu : « Penetration ») ;
 *   status:<id>                 — statut nommé (id canonique du glossaire) ;
 *   <family>:<type>:<stat>      — mécanique adossée à une stat (un « DMG
 *                                 scaling Speed » ne matche pas un buff Speed) ;
 *   type:<type>                 — mécanique pure (BT_DMG_TO_BOSS…).
 *
 * Libellés en ANGLAIS seul : `/contribute` est la zone de travail des
 * contributeurs, non localisée.
 */
import type { Effect, EffectShape } from '../lib/effects';
import type { LangDict } from '../lib/lang';
import type { ExclusiveItem, Passive } from './equipment';

/** Un effet comparable d'un EE. */
export interface EeEffectEntry {
  /** Clé de comparaison normalisée — deux EE « similaires » la partagent. */
  key: string;
  label: string;
  isDebuff: boolean;
}

/** characterId (porteur) → effets comparables de son EE. */
export type EeEffectsData = Record<string, EeEffectEntry[]>;

/** Libellés des mécaniques sans statut nommé (repli : type prettifié). */
const TYPE_LABELS: Record<string, string> = {
  BT_DMG: 'DMG bonus',
  BT_DMG_TO_BOSS: 'DMG vs bosses',
  BT_GROUP: 'Group bonus',
  BT_DMG_REDUCE: 'DMG reduction',
  BT_DMG_ENEMY_TEAM_DECREASE: 'Enemy team DMG down',
  BT_BLEED_ENHANCE: 'Bleed enhance',
  BT_POISON_ENHANCE: 'Poison enhance',
  BT_RESOURCE_CHARGE_BUFF_CASTER: 'Resource charge',
  BT_ACTION_GAUGE_ENHANCE: 'Action gauge boost',
  BT_DMG_CASTER_LOST_HP_RATE: 'DMG scaling with lost HP',
  BT_HEAL: 'Heal',
  BT_STAT: 'Stat bonus',
  BT_STAT_PREMIUM: 'Stat bonus',
};

function typeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type.replace(/^BT_/, '').replace(/_/g, ' ').toLowerCase();
}

export interface EeEffectsInput {
  ee: Record<string, ExclusiveItem>;
  passives: Record<string, Passive>;
  statNames: Record<string, LangDict>;
  /** Glossaire des effets (id canonique → effet nommé). */
  effects: Map<string, Effect>;
  byTooltip: Map<string, string>;
  byLabel: Map<string, string>;
}

/** Réduit UN effet structuré à son entrée comparable. PURE, testée. */
export function entryFor(
  e: EffectShape,
  input: Pick<EeEffectsInput, 'statNames' | 'effects' | 'byTooltip' | 'byLabel'>,
): EeEffectEntry {
  const isDebuff = e.category === 'debuff' || e.category === 'cc';
  if (e.family === 'stat' && e.stat) {
    const dir = e.mode === 'down' ? 'down' : 'up';
    const name = input.statNames[e.stat]?.en ?? e.stat;
    return { key: `stat:${e.stat}:${dir}`, label: `${name} ${dir}`, isDebuff };
  }
  const ref = e.tooltip ?? e.label;
  if (ref) {
    const id = (e.tooltip ? input.byTooltip.get(ref) : input.byLabel.get(ref)) ?? ref;
    const eff = input.effects.get(id);
    return {
      key: `status:${id}`,
      label: eff?.name.en ?? ref,
      isDebuff: eff?.isDebuff ?? isDebuff,
    };
  }
  if (e.stat) return { key: `${e.family}:${e.type}:${e.stat}`, label: typeLabel(e.type), isDebuff };
  return { key: `type:${e.type}`, label: typeLabel(e.type), isDebuff };
}

export function buildEeEffects(input: EeEffectsInput): EeEffectsData {
  const out: EeEffectsData = {};
  for (const [itemId, item] of Object.entries(input.ee)) {
    const seen = new Set<string>();
    const entries: EeEffectEntry[] = [];
    for (const ref of item.passives) {
      const passive = input.passives[ref.id];
      if (!passive) throw new Error(`ee-effects : EE ${itemId} → passif ${ref.id} introuvable`);
      for (const e of passive.effects ?? []) {
        const entry = entryFor(e, input);
        if (seen.has(entry.key)) continue;
        seen.add(entry.key);
        entries.push(entry);
      }
    }
    if (!entries.length) {
      throw new Error(`ee-effects : EE ${itemId} (${item.name.en}) sans aucun effet comparable`);
    }
    out[item.character] = entries;
  }
  return out;
}
