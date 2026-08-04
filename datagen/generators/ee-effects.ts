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
  BT_BURN_ENHANCE: 'Burn enhance',
  BT_BLEED_ENHANCE: 'Bleed enhance',
  BT_POISON_ENHANCE: 'Poison enhance',
  BT_LIGHTNING_ENHANCE: 'Lightning enhance',
  BT_CURSE_ENHANCE: 'Curse enhance',
  // DoT SIGNATURE d'un perso : le nombre est l'id du PERSO (2000092 = Gnosis
  // Beth), pas un id de statut — le résoudre par le glossaire des effets
  // tomberait sur un homonyme (« Retribution's Dominion »). Le nom vient du
  // texte du passif (« Increases damage dealt by Eternal Bleeding… »).
  BT_2000092_ENHANCE: 'Eternal Bleeding enhance',
  BT_RESOURCE_CHARGE_BUFF_CASTER: 'Resource charge',
  BT_ACTION_GAUGE_ENHANCE: 'Action gauge boost',
  BT_DMG_CASTER_LOST_HP_RATE: 'DMG scaling with lost HP',
  BT_DMG_OWNER_STAT: 'DMG scaling with own stat',
  BT_HEAL_BASED_CASTER: 'Heal (caster-based)',
  BT_HEAL_BASED_TARGET: 'Heal (target-based)',
  BT_HEAL: 'Heal',
  BT_STAT: 'Stat bonus',
  BT_STAT_PREMIUM: 'Stat bonus',
};

function typeLabel(type: string): string {
  return TYPE_LABELS[type] ?? prettifySlug(type.replace(/^BT_/, ''));
}

/**
 * Refs de statut sans entrée de glossaire — relevées sur la donnée réelle
 * (un slug brut à l'écran est un bug). Weakness gauge DMG : dégâts infligés
 * à la jauge de faiblesse du boss (vidée = break) — sens confirmé par Sevih.
 */
const STATUS_FALLBACK: Record<string, string> = {
  WEAKNESS_GAUGE_DAMAGE: 'Weakness gauge DMG',
};

/** Dernier recours : slug/clé → texte lisible (jamais de `_` à l'écran). */
function prettifySlug(slug: string): string {
  const s = slug.replace(/_/g, ' ').toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
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
  // « Ally DoT taken -30% » (Omega Nadja +10) est implémenté par le jeu comme
  // UN effet *_ENHANCE par type de DoT, ciblant les ALLIÉS : six chips
  // « enhance » à l'écran pour un seul effet défensif. Côté allié, on replie
  // tout en UNE clé — la CIBLE distingue ce cas de l'enhance offensif
  // (Gnosis Beth : même type, target enemy_team).
  if (e.family === 'dot' && /_ENHANCE$/.test(e.type) && !e.target.startsWith('enemy')) {
    return { key: 'dot:taken', label: 'Ally DoT taken', isDebuff: false };
  }
  // Une stat de COMBAT CONNUE (présente dans `statNames`) est l'identité
  // canonique de l'effet : deux « Speed up » matchent, que le jeu ait attaché
  // un tooltip ou non (il n'en met qu'à certains — clé par statut ici
  // FRAGMENTERAIT le vocabulaire, mesuré : 30 porteurs sur 124).
  if (e.family === 'stat' && e.stat && input.statNames[e.stat]) {
    const dir = e.mode === 'down' ? 'down' : 'up';
    return {
      key: `stat:${e.stat}:${dir}`,
      label: `${input.statNames[e.stat].en} ${dir}`,
      isDebuff,
    };
  }
  // Sinon, le STATUT NOMMÉ fait l'identité : le jeu réemploie des slugs
  // fourre-tout HORS statNames (`get_gold_rate`) comme support de mécaniques
  // PROPRES à un perso — l'effet réel est le tooltip (« Fierce Offensive »
  // chez Notia), pas la stat porteuse (relevé Sevih 04/08).
  const ref = e.tooltip ?? e.label;
  if (ref) {
    const id = (e.tooltip ? input.byTooltip.get(ref) : input.byLabel.get(ref)) ?? ref;
    const eff = input.effects.get(id);
    return {
      key: `status:${id}`,
      label: eff?.name.en ?? STATUS_FALLBACK[ref] ?? prettifySlug(ref),
      isDebuff: eff?.isDebuff ?? isDebuff,
    };
  }
  if (e.family === 'stat' && e.stat) {
    const dir = e.mode === 'down' ? 'down' : 'up';
    return { key: `stat:${e.stat}:${dir}`, label: `${prettifySlug(e.stat)} ${dir}`, isDebuff };
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
