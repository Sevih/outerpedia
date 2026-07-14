/**
 * Primitive #effects — classification & résolution lisible des buffs.
 *
 * Un buff brut (`BuffTemplet`) porte un `Type` (143 codes `BT_*`), une catégorie
 * implicite (buff/debuff/contrôle) et 0..3 textes de jeu. Ce module en tire :
 *
 *   1. CLASSIFICATION  — `classify(row)` → { family, category }.
 *      - `family`   : ~16 grandes familles dérivées du `Type` (stat, dot, heal…).
 *      - `category` : buff | debuff | cc | neutral, dérivée de BuffDebuffType /
 *                     BuffCCType / IsDebuff (la nature réelle, fiable, du jeu).
 *
 *   2. GLOSSAIRE       — `buildEffectGlossary()` : `BuffToolTipTemplet` →
 *      catalogue des EFFETS NOMMÉS (« Burned », « Increased Defense »), variantes
 *      d'interruption FUSIONNÉES par NameID, filtré aux tooltips nommés
 *      (TextSystem/TextSkill) ET référencés par un buff. Réf par id (`tooltip`).
 *
 *   3. RÉSOLUTION      — `resolveEffect(row)` : l'INSTANCE concrète qu'une
 *      compétence/passif applique : famille, catégorie, stat, valeur, tours,
 *      cible + réf glossaire (nom/mécanique) ou label court (CreateText).
 *
 * Distinction clé : le GLOSSAIRE décrit le statut de façon générique (valeur
 * canonique, ex. « Increases Attack by 30% ») ; l'INSTANCE porte la vraie valeur
 * du buff au niveau donné. Le front compose « ATK +X% pendant N tours » à partir
 * de l'instance, en empruntant le nom/l'icône au glossaire.
 *
 * Le mapping `Type → family` est le seul savoir reverse-engineeré ici : il vit
 * dans une liste de règles ORDONNÉES (spécifique → général), lisible et testée
 * exhaustivement sur les 143 types réels. Un futur type inconnu retombe sur
 * `special` (jamais de drop silencieux ; le `type` brut est toujours conservé).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { formatRowValue } from './buff';
import type { LangDict } from './lang';
import { loadTextIndex, resolveText } from './text';
import { loadTable, num, tablesStamp, type Row } from './tables';
import { buildImageIndex, findImage } from '../assets/source';

/** Nature d'un effet, dérivée des champs fiables du jeu. */
export type EffectCategory = 'buff' | 'debuff' | 'cc' | 'neutral';

/** Grande famille fonctionnelle d'un effet (regroupe les 143 `BT_*`). */
export type EffectFamily =
  | 'stat' // modification de stat (ATK/DEF/HP/SPEED…)
  | 'damage' // dégâts directs / attaques additionnelles
  | 'dmg_reduce' // réduction / limitation de dégâts
  | 'dot' // dégâts sur la durée (burn/bleed/poison/curse…)
  | 'heal' // soin / hausse de soin reçu
  | 'anti_heal' // soin inversé / réduction de soin reçu
  | 'shield' // bouclier
  | 'protect' // invincibilité / immunité
  | 'cc' // contrôle (stun/freeze/silence/aggro…)
  | 'gauge' // jauge d'action / AP
  | 'cooldown' // recharge / réduction de cooldown
  | 'resource' // points de chaîne / ressources
  | 'cleanse' // retrait / vol / extension de buffs & debuffs
  | 'revive' // résurrection / mort / mort-vivant
  | 'summon' // appel de renforts
  | 'trigger' // déclencheurs (contre-attaque, skill en fin de tour…)
  | 'group' // indirection (BT_GROUP → enfants)
  | 'special'; // tout le reste (à raffiner si besoin)

/** Une règle de classification : si `test(type)` vrai → `family`. */
interface FamilyRule {
  family: EffectFamily;
  test: (type: string) => boolean;
}

/** Appartenance exacte à un ensemble de types. */
const oneOf =
  (...types: string[]) =>
  (t: string) =>
    types.includes(t);

/** Contient l'un des fragments. */
const has =
  (...frags: string[]) =>
  (t: string) =>
    frags.some((f) => t.includes(f));

/**
 * Règles ORDONNÉES (la 1re qui matche gagne). L'ordre encode les priorités :
 * les variantes spécifiques (anti-heal, revive) passent avant leurs racines
 * génériques (heal, cc).
 */
const FAMILY_RULES: FamilyRule[] = [
  { family: 'group', test: oneOf('BT_GROUP', 'BT_GROUP_CASTER_TOOLTIP_CHECK') },
  {
    family: 'dot',
    test: (t) =>
      t.startsWith('BT_DOT_') ||
      t === 'BT_GOLDEN_CURSE' ||
      /^BT_IMMEDIATELY_(BURN|BLEED|CURSE|POISON|LIGHTNING|2000092)/.test(t) ||
      /^BT_(BURN|BLEED|CURSE|POISON|LIGHTNING|2000092)_ENHANCE/.test(t),
  },
  { family: 'dmg_reduce', test: has('DMG_REDUCE', 'LIMIT_DMG', 'SHARE_DMG') },
  {
    family: 'damage',
    test: (t) =>
      t.startsWith('BT_DMG') ||
      oneOf(
        'BT_WG_DMG',
        'BT_ADDITIVE_ATTACK_ON_EVENT',
        'BT_EXTRA_ATTACK_ON_TURN_END',
        'BT_SEAL_ADDITIVE_ATTACK',
      )(t),
  },
  { family: 'anti_heal', test: has('REVERSE_HEAL', 'REDUCE_RECEIVE_HEAL', 'SEALED_RECEIVE_HEAL') },
  { family: 'heal', test: has('HEAL') },
  { family: 'shield', test: has('SHIELD') },
  { family: 'protect', test: oneOf('BT_INVINCIBLE', 'BT_WG_INVINCIBLE', 'BT_IMMUNE') },
  {
    family: 'revive',
    test: has('RESURRECTION', 'REVIVAL', 'UNDEAD', 'DEATH', 'KILL_UNDER_HP_RATE'),
  },
  {
    family: 'cc',
    test: oneOf(
      'BT_STUN',
      'BT_FREEZE',
      'BT_STONE',
      'BT_SILENCE',
      'BT_SEALED',
      'BT_SLEEP',
      'BT_AGGRO',
      'BT_STEALTHED',
      'BT_MARKING',
    ),
  },
  { family: 'gauge', test: (t) => t.includes('ACTION_GAUGE') || t.startsWith('BT_AP_') },
  { family: 'cooldown', test: has('COOL') },
  { family: 'resource', test: (t) => t.includes('RESOURCE') || t === 'BT_CP_CHARGE' },
  {
    family: 'cleanse',
    test: oneOf(
      'BT_REMOVE_BUFF',
      'BT_REMOVE_DEBUFF',
      'BT_REMOVE_BY_GROUP_ID',
      'BT_STEAL_BUFF',
      'BT_REDISTRIBUTE_BUFF',
      'BT_CASTER_COPY_BUFF',
      'BT_EXTEND_BUFF',
      'BT_EXTEND_DEBUFF',
    ),
  },
  { family: 'summon', test: has('CALL_BACKUP') },
  {
    family: 'trigger',
    test: (t) =>
      has('RUN_FIRST_SKILL', 'RUN_PASSIVE_SKILL', 'RUN_ACTIVE_SKILL', 'SECOND_TRIGGER')(t) ||
      oneOf('BT_SEAL_COUNTER', 'BT_ADDITIVE_TURN', 'BT_SEAL_ADDITIVE_TURN')(t),
  },
  {
    family: 'stat',
    test: (t) => t.startsWith('BT_STAT') || oneOf('BT_ENHANCE_ALL', 'BT_SWAP_STAT_ATTACK')(t),
  },
];

/**
 * OVERRIDES curés des familles (`data/curated/effect-families.json`,
 * `{"BT_NOUVEAU_TYPE": "dot"}`) : un nouveau type de buff se classe SANS
 * toucher au code — le fichier prime sur les règles.
 */
let familyOverrides: Map<string, EffectFamily> | null = null;
function loadFamilyOverrides(): Map<string, EffectFamily> {
  if (!familyOverrides) {
    familyOverrides = new Map();
    try {
      const raw = JSON.parse(
        readFileSync(resolve('data/curated/effect-families.json'), 'utf8'),
      ) as Record<string, EffectFamily>;
      for (const [t, f] of Object.entries(raw)) familyOverrides.set(t, f);
    } catch {
      /* pas d'overrides — les règles suffisent */
    }
  }
  return familyOverrides;
}

/** Types tombés en `special` (inconnus des règles ET des overrides). */
const unknownTypes = new Set<string>();
export function unknownFamilyTypes(): string[] {
  return [...unknownTypes].sort();
}

/** Famille fonctionnelle d'un `Type` de buff : overrides curés > règles > `special`. */
export function classifyFamily(type: string): EffectFamily {
  const override = loadFamilyOverrides().get(type);
  if (override) return override;
  for (const r of FAMILY_RULES) if (r.test(type)) return r.family;
  unknownTypes.add(type);
  return 'special';
}

/**
 * Catégorie (nature) d'un buff, dérivée des champs fiables du jeu :
 *   - contrôle si `BuffCCType` ≠ NONE (étourdit/gèle/etc., bloque le tour) ;
 *   - debuff si `IsDebuff` ou `BuffDebuffType` commence par DEBUFF ;
 *   - buff si `BuffDebuffType` = BUFF ;
 *   - neutral sinon (NEUTRAL / NEUTRAL2).
 */
export function classifyCategory(row: Row): EffectCategory {
  if ((row.BuffCCType ?? 'NONE') !== 'NONE') return 'cc';
  const dt = row.BuffDebuffType ?? '';
  if (row.IsDebuff === 'True' || dt.startsWith('DEBUFF')) return 'debuff';
  if (dt === 'BUFF') return 'buff';
  return 'neutral';
}

/** Sens d'une stat : la valeur négative = baisse (debuff de stat). */
export type EffectMode = 'up' | 'down';

/** Slug stable d'une stat (`ST_CRITICAL_RATE` → `critical_rate`), `null` si aucune. */
export function statSlug(statType: string | undefined): string | null {
  if (!statType || statType === 'ST_NONE') return null;
  return statType.replace(/^ST_/, '').toLowerCase();
}

/**
 * Un EFFET nommé du jeu : un statut affichable, ses variantes (base +
 * `_Interruption`, déclinaisons buff/debuff) séparées par (irremovable, nature).
 *
 * Ancré dans la donnée du jeu (pas écrit à la main) : source = les tooltips
 * `BuffToolTipTemplet` NOMMÉS (TextSystem ou TextSkill) ET référencés par au
 * moins un buff. Le bruit (tooltips sans nom / orphelins) est écarté.
 */
export interface Effect {
  /** Id canonique = tooltip de base (variante sans interruption). */
  id: string;
  /** Nom localisé (« Burned », « Increased Defense »). */
  name: LangDict;
  /** Description générique localisée. */
  desc: LangDict;
  /** Icône du jeu, VERBATIM (`_Interruption` = cadre irremovable, `_D` = cadre debuff rouge). */
  icon: string;
  /** Vrai si effet négatif (pris sur la variante de base). */
  isDebuff: boolean;
  /** Source : `tooltip` (statut nommé) ou `type` (mécanique via CreateText). */
  origin: 'tooltip' | 'type';
  /** Tooltips du jeu couverts par cet effet. Vide si `type`. */
  tooltips: string[];
  /**
   * Statut IRREMOVABLE (variante `_Interruption`, effet DISTINCT de la version
   * normale) : icône à cadre spécial, jamais recolorée à l'affichage.
   */
  irremovable?: boolean;
  /** Icône ABSENTE des sprites du jeu → asset communautaire (pool wiki V2). */
  iconEditorial?: boolean;
}

/**
 * Glossaire des effets + cartes de résolution (tooltip → effet, label → effet).
 *
 * DEUX sources, toutes deux 100 % donnée de jeu :
 *   1. `BuffToolTipTemplet` : statuts NOMMÉS, variantes fusionnées par `NameID` ;
 *   2. `BuffTemplet.CreateText` : effets MÉCANIQUES sans tooltip (Cooldown
 *      Reduction…), nommés via `TextSystem` (`SYS_BUFF_*`).
 * `byTooltip`/`byLabel` permettent aux effets de skill de retomber sur l'effet
 * canonique (un skill référence soit un tooltip, soit un label = symbole CreateText).
 */
/** Côté d'une clé d'effet éditoriale (`{B/…}` vs `{D/…}`). */
export type EffectSide = 'buff' | 'debuff';

/**
 * Alias ÉDITORIAUX : clés historiques du wiki (V2) → clé réelle (type de jeu
 * ou nom d'effet en MAJUSCULES_SOULIGNÉES). Même dialecte que les fichiers
 * pros-cons/reco ; vérifiés sur l'inventaire des tags legacy. Un alias dont le
 * SENS dépend du côté (`{B/…}` ≠ `{D/…}`) déclare une cible par côté.
 */
const EDITORIAL_KEY_ALIASES: Record<string, string | Record<EffectSide, string>> = {
  BT_BARRIER: 'BT_SHIELD_BASED_CASTER',
  BT_FIXED_DAMAGE: 'FIXED_DAMAGE', // tooltip nommé « Fixed Damage » (le type reverse-heal n'a pas de tooltip)
  BT_CONTINU_HEAL: 'SUSTAINED_RECOVERY',
  BT_ADDITIVE_ATTACK: 'ADDITIONAL_ATTACK',
  BT_COUNTERATTACK: 'COUNTERATTACK',
  BT_AGILE_RESPONSE: 'AGILE_RESPONSE',
  BT_REVENGE: 'REVENGE',
  BT_WG_REVERSE_HEAL: 'BT_WG_DMG',
  // V2 : la même clé désignait « Reduced/Increased Damage Taken » selon le côté.
  BT_DAMAGE_TAKEN: { buff: 'REDUCED_DAMAGE_TAKEN', debuff: 'INCREASED_DAMAGE_TAKEN' },
};

/** Nom d'effet → clé éditoriale (« Bane's Domain » → `BANES_DOMAIN`). */
export function effectNameKey(name: string): string {
  return name
    .replace(/['’]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();
}

/** Forme du glossaire construit (cache module : pur et coûteux — appelé par
 * le build global ET le générateur d'équipement). */
interface EffectGlossary {
  effects: Map<string, Effect>;
  byTooltip: Map<string, string>;
  byLabel: Map<string, string>;
  byKey: Record<EffectSide, Map<string, string>>;
  /** tooltip → types de mécanique (`BT_X` ou `BT_STAT|stat`) qui l'appliquent
   * dans BuffTemplet — sert à dédupliquer un statut AFFICHÉ par un niveau de
   * skill quand une chip du kit applique la même mécanique sous un statut
   * custom (« Execution time! » ⊃ « Increased Damage Taken »). */
  tooltipKinds: Map<string, string[]>;
}
// Cache DÉRIVÉ clé sur l'empreinte des tables : sans elle, l'invalidation
// mtime de loadTable est à moitié efficace — après un refresh, les tables
// rechargent mais le glossaire mémoïsé continuerait de servir l'ancien monde.
let glossaryCache: { data: EffectGlossary; stamp: string } | undefined;

export function buildEffectGlossary(): EffectGlossary {
  const stamp = tablesStamp(['TextSystem']);
  if (glossaryCache && glossaryCache.stamp === stamp) return glossaryCache.data;
  const sys = loadTextIndex('TextSystem');
  const skill = loadTextIndex('TextSkill');
  const nameOf = (key: string): LangDict => {
    const s = resolveText(sys, key);
    return s.en ? s : resolveText(skill, key);
  };

  // Tooltips référencés par au moins un buff OU affichés par un niveau de skill
  // (`BuffToolTip` — cas « Heavy Strike », montré par le skill sans être le
  // ToolTipID d'un buff). Les autres = jamais appliqués ni affichés.
  const referenced = new Set<string>();
  const tooltipKindSets = new Map<string, Set<string>>();
  for (const b of loadTable('BuffTemplet')) {
    const t = b.ToolTipID;
    if (t && t !== '0' && t !== 'NONE') {
      referenced.add(t);
      // Type de mécanique appliquant ce tooltip (composite pour les stats —
      // BT_STAT seul serait bien trop large pour la dédup).
      if (b.Type) {
        const stat =
          b.StatType && b.StatType !== 'ST_NONE'
            ? `|${b.StatType.replace(/^ST_/, '').toLowerCase()}`
            : '';
        const set = tooltipKindSets.get(t) ?? new Set<string>();
        set.add(`${b.Type}${stat}`);
        tooltipKindSets.set(t, set);
      }
    }
  }
  for (const table of ['CharacterSkillLevelTemplet', 'MonsterSkillLevelTemplet']) {
    for (const l of loadTable(table)) {
      for (const t of (l.BuffToolTip ?? '').split(',')) {
        const id = t.trim();
        if (id && id !== '0') referenced.add(id);
      }
    }
  }
  // …OU affiché comme IMMUNITÉ d'un monstre (`MonsterTemplet.BuffImmuneToolTip`) :
  // l'immunité-parapluie « Damage over Time » (SYS_BUFF_DOT_ALL) n'est appliquée
  // par AUCUN buff — elle n'existe qu'en immunité de boss, le panneau la rend.
  // La sentinelle « No Immunities » (SYS_IMMUNE_EMPTY, panneau vide) n'est pas
  // un statut : écartée ici, et purgée des monstres à l'extraction.
  for (const r of loadTable('MonsterTemplet')) {
    for (const t of (r.BuffImmuneToolTip ?? '').split(',')) {
      const id = t.trim();
      if (id && id !== '0') referenced.add(id);
    }
  }
  for (const r of loadTable('BuffToolTipTemplet')) {
    if (r.NameID === 'SYS_IMMUNE_EMPTY' && r.ID) referenced.delete(r.ID);
  }

  // Filtre : nommé ET référencé, puis regroupement par NameID.
  const groups = new Map<string, Row[]>();
  for (const r of loadTable('BuffToolTipTemplet')) {
    if (!r.ID || !referenced.has(r.ID) || !nameOf(r.NameID).en) continue;
    const list = groups.get(r.NameID);
    if (list) list.push(r);
    else groups.set(r.NameID, [r]);
  }

  const effects = new Map<string, Effect>();
  const byTooltip = new Map<string, string>();
  // Identité (NameID + irremovable + nature) → effet, pour raccrocher les
  // tooltips orphelins plus bas.
  const subKeyToEffect = new Map<string, string>();
  // Effet normal → son frère INDISSIPABLE (même NameID, même nature) — sert
  // aux clés éditoriales `_IR` plus bas.
  const irrSibling = new Map<string, string>();
  for (const members of groups.values()) {
    // Un même NameID couvre la version NORMALE et la version IRREMOVABLE
    // (icône `_Interruption`, cadre spécial ; suffixe `_D` = déclinaison
    // DEBUFF du cadre, rouge — l'icône du jeu est gardée VERBATIM), et parfois
    // une version buff ET une version debuff (Starving Devil, Bane's Domain).
    // Autant de statuts distincts côté joueur → un effet par (irremovable,
    // nature).
    const subGroups = new Map<string, Row[]>();
    for (const m of members) {
      const key = `${/_Interruption/i.test(m.IconName ?? '')}|${m.IsDebuff}`;
      const list = subGroups.get(key);
      if (list) list.push(m);
      else subGroups.set(key, [m]);
    }
    for (const sub of subGroups.values()) {
      const base = sub[0];
      const irremovable = /_Interruption/i.test(base.IconName ?? '');
      effects.set(base.ID, {
        id: base.ID,
        name: nameOf(base.NameID),
        desc: nameOf(base.DescID),
        icon: base.IconName ?? '',
        isDebuff: base.IsDebuff === 'True',
        origin: 'tooltip',
        tooltips: sub.map((m) => m.ID),
        ...(irremovable ? { irremovable: true } : {}),
      });
      for (const m of sub) byTooltip.set(m.ID, base.ID);
      const subKey = `${base.NameID}|${irremovable}|${base.IsDebuff === 'True'}`;
      if (!subKeyToEffect.has(subKey)) subKeyToEffect.set(subKey, base.ID);
    }
    for (const nature of ['True', 'False']) {
      const normal = subGroups.get(`false|${nature}`);
      const irr = subGroups.get(`true|${nature}`);
      if (normal && irr) irrSibling.set(normal[0].ID, irr[0].ID);
    }
  }

  // Tooltips ORPHELINS (référencés par aucun buff/niveau — typiquement les
  // affichages d'IMMUNITÉ des boss, `MonsterTemplet.BuffImmuneToolTip`) :
  // raccrochés à l'effet existant de même identité (NameID + irremovable +
  // nature) — le tooltip 64 « Cooldown Increase » rejoint l'effet 68.
  for (const r of loadTable('BuffToolTipTemplet')) {
    if (!r.ID || byTooltip.has(r.ID) || !nameOf(r.NameID).en) continue;
    const key = `${r.NameID}|${/_Interruption/i.test(r.IconName ?? '')}|${r.IsDebuff === 'True'}`;
    const eff = subKeyToEffect.get(key);
    if (eff) byTooltip.set(r.ID, eff);
  }

  // Source 2 : effets mécaniques SANS tooltip, nommés via CreateText.
  // Clé = symbole CreateText (sans préfixe `[DEBUFF]`) — même valeur que le
  // `label` que `resolveEffect` pose sur ces effets de skill. Si le NOM existe
  // déjà côté tooltip, on FUSIONNE (byLabel pointe sur l'effet tooltip, pas de
  // doublon) ; sinon on crée un effet `type`.
  // La version NORMALE prime sur l'irremovable quand les deux partagent un nom.
  const byName = new Map<string, string>();
  for (const [id, eff] of effects) if (!eff.irremovable) byName.set(eff.name.en.toLowerCase(), id);
  for (const [id, eff] of effects) {
    const k = eff.name.en.toLowerCase();
    if (!byName.has(k)) byName.set(k, id);
  }

  const byLabel = new Map<string, string>();
  for (const b of loadTable('BuffTemplet')) {
    const t = b.ToolTipID;
    // CreateText (message d'application) puis ActivateText (nom de la mécanique
    // déclenchée : Counterattack, Revenge, Additional Attack…).
    const text = b.CreateText || b.ActivateText;
    if ((t && t !== '0' && t !== 'NONE') || !text) continue; // a un tooltip ou pas de texte
    // Les buffs d'ÉQUIPEMENT portent surtout des textes d'OBJET (UO_*/ITEM_*),
    // écartés par le filtre SYS_ ci-dessous — mais certains référencent un
    // symbole de MÉCANIQUE (`SYS_BUFF_STEALTHED` du talisman de furtivité,
    // `SYS_BUFF_IMMUNE`…) : on les résout comme les buffs de skill, sinon les
    // chips d'EE/talisman correspondantes restent innommables.
    const symbol = stripTextSymbol(text);
    if (!symbol.startsWith('SYS_')) continue;
    if (byLabel.has(symbol)) continue; // symbole déjà résolu
    const name = nameOf(symbol);
    if (!name.en) continue; // pas de nom résoluble → on ignore

    const existing = byName.get(name.en.toLowerCase());
    if (existing) {
      byLabel.set(symbol, existing); // fusionne dans l'effet de même nom
      continue;
    }
    effects.set(symbol, {
      id: symbol,
      name,
      desc: nameOf(b.DescID),
      icon: b.IconName ?? '',
      isDebuff: b.IsDebuff === 'True' || /^\[DEBUFF/i.test(b.CreateText),
      origin: 'type',
      tooltips: [],
    });
    byLabel.set(symbol, symbol);
    byName.set(name.en.toLowerCase(), symbol);
  }

  // Seconde passe orphelins : tooltip dont le NameID est un SYMBOLE de
  // mécanique déjà résolu par label (tooltip 100 « SYS_BUFF_STEAL » → l'effet
  // « Stealing Buff ») — l'affichage d'immunité des boss référence ces
  // tooltips-là aussi.
  for (const r of loadTable('BuffToolTipTemplet')) {
    if (!r.ID || byTooltip.has(r.ID)) continue;
    const eff = byLabel.get(r.NameID ?? '');
    if (eff) byTooltip.set(r.ID, eff);
  }

  // --- Index par CLÉ éditoriale ({B/BT_STAT|ST_ATK}, {D/BT_DOT_BURN}…) --------
  // 1) Clés TYPE : chaque ligne BuffTemplet résoluble vers un effet vote pour
  //    (côté, clé type) → l'effet majoritaire gagne. Clé = `Type` du jeu, ou
  //    `BT_STAT|ST_X` pour les stats (seul composite, comme en V2).
  const votes = new Map<string, Map<string, number>>(); // "side|key" → effectId → n
  // Nature majoritaire par effet (buffs qui l'utilisent) — pour corriger les
  // effets mécaniques (`origin: type`) dont la ligne source ne dit pas le côté.
  const natureVotes = new Map<string, { buff: number; debuff: number }>();
  for (const b of loadTable('BuffTemplet')) {
    if (b.IsEquip === 'True' || b.IsEquipBuff === 'True') continue;
    const t = b.ToolTipID;
    const effId =
      (t && t !== '0' && t !== 'NONE' && byTooltip.get(t)) ||
      byLabel.get(stripTextSymbol(b.CreateText || b.ActivateText || ''));
    if (!effId) continue;
    const cat = classifyCategory(b);
    const side: EffectSide = cat === 'buff' ? 'buff' : 'debuff';
    if (cat === 'neutral') continue;
    const nv = natureVotes.get(effId) ?? { buff: 0, debuff: 0 };
    nv[side]++;
    natureVotes.set(effId, nv);
    const key =
      b.Type === 'BT_STAT' && b.StatType && b.StatType !== 'ST_NONE'
        ? `BT_STAT|${b.StatType}`
        : (b.Type ?? '');
    if (!key) continue;
    const slot = `${side}|${key}`;
    const m = votes.get(slot) ?? new Map<string, number>();
    m.set(effId, (m.get(effId) ?? 0) + 1);
    votes.set(slot, m);
  }
  const byKey: Record<EffectSide, Map<string, string>> = {
    buff: new Map(),
    debuff: new Map(),
  };
  for (const [slot, m] of votes) {
    const [side, key] = [slot.slice(0, slot.indexOf('|')), slot.slice(slot.indexOf('|') + 1)];
    const winner = [...m.entries()].sort((a, b) => b[1] - a[1])[0][0];
    byKey[side as EffectSide].set(key, winner);
  }
  // Déclinaisons NUMÉROTÉES d'un type (`BT_COOL2_CHARGE` = le CD du skill 2,
  // même mécanique que `BT_COOL_CHARGE`) : le vote ne couvre que l'USAGE réel —
  // aucun buff DEBUFF de type BT_COOL2_CHARGE n'existe aujourd'hui dans les
  // tables — mais la mécanique a bien les deux sens (immunités, futurs skills).
  // Chaque côté hérite de la résolution de sa forme SANS CHIFFRES.
  const numberedKeys = new Set([...byKey.buff.keys(), ...byKey.debuff.keys()]);
  for (const key of numberedKeys) {
    const base = key.replace(/\d+/g, '');
    if (base === key || !/^BT_[A-Z_]+$/.test(base)) continue;
    for (const side of ['buff', 'debuff'] as const) {
      const inherited = byKey[side].get(base);
      if (inherited && !byKey[side].has(key)) byKey[side].set(key, inherited);
    }
  }
  // Nature RÉELLE des effets mécaniques : leur ligne de définition ne porte
  // pas IsDebuff (SYS_BUFF_EXTEND_DEBUFF_UP « Debuff Duration Increase » est
  // un DEBUFF — il allonge les debuffs de l'ennemi) → nature majoritaire des
  // buffs qui les utilisent. Les statuts nommés (tooltip) gardent l'IsDebuff
  // du jeu, qui fait foi.
  for (const eff of effects.values()) {
    if (eff.origin !== 'type') continue;
    const nv = natureVotes.get(eff.id);
    if (nv && nv.buff !== nv.debuff) eff.isDebuff = nv.debuff > nv.buff;
  }
  // 2) Clés NOM : chaque effet est adressable par son nom EN normalisé
  //    (`RUSH`, `POLAR_NIGHT`, `AGILE_RESPONSE`…) — sans écraser une clé type.
  for (const [id, eff] of effects) {
    const key = effectNameKey(eff.name.en);
    if (!key) continue;
    const side: EffectSide = eff.isDebuff ? 'debuff' : 'buff';
    if (!byKey[side].has(key)) byKey[side].set(key, id);
  }
  // 3) Alias éditoriaux (dialecte V2) → résolus vers la clé réelle, les deux
  //    côtés (le contenu marque le côté via {B/…}/{D/…}). Une cible PAR CÔTÉ
  //    reste sur son côté (pas de repli croisé — le sens en dépend).
  for (const side of ['buff', 'debuff'] as const) {
    for (const [alias, target] of Object.entries(EDITORIAL_KEY_ALIASES)) {
      const sided = typeof target !== 'string';
      const t = sided ? target[side] : target;
      const id = sided
        ? byKey[side].get(t)
        : (byKey[side].get(t) ?? byKey[side === 'buff' ? 'debuff' : 'buff'].get(t));
      if (id && !byKey[side].has(alias)) byKey[side].set(alias, id);
    }
  }
  // 4) Suffixe `_IR` (dialecte V2) : `<clé>_IR` désigne la variante
  //    INDISSIPABLE du statut (effet DISTINCT, icône `_Interruption` —
  //    `BT_SEALED_IR`, `BT_STAT|ST_CRITICAL_RATE_IR`…). Chaque clé résolue
  //    reçoit sa déclinaison via le frère de même NameID/nature ; une clé dont
  //    la base résout DÉJÀ sur l'effet indissipable (seul utilisé par les
  //    tables, ex. Debuff Enhancement) porte le même effet sous les deux clés.
  for (const side of ['buff', 'debuff'] as const) {
    for (const [key, id] of [...byKey[side]]) {
      const irr = effects.get(id)?.irremovable ? id : irrSibling.get(id);
      if (irr && !byKey[side].has(`${key}_IR`)) byKey[side].set(`${key}_IR`, irr);
    }
  }

  // ÉDITORIAL : les effets SANS icône en jeu (mécaniques `origin: type`
  // surtout) reprennent l'icône du glossaire V2 écrit main (correspondance par
  // nom EN). Le manifest les rapatriera du pool V2 (`editorialFallback`) —
  // seule exception à la règle « images = extraction du jeu » : cet éditorial
  // n'existe pas dans les tables.
  try {
    const legacy = ['buffs.json', 'debuffs.json'].flatMap(
      (f) =>
        JSON.parse(readFileSync(resolve('data/legacy/effects', f), 'utf8')) as {
          label?: string;
          icon?: string;
        }[],
    );
    const iconByLabel = new Map(
      legacy.filter((e) => e.label && e.icon).map((e) => [e.label!.toLowerCase(), e.icon!]),
    );
    for (const e of effects.values()) {
      if (!e.icon) e.icon = iconByLabel.get((e.name.en ?? '').toLowerCase()) ?? '';
    }
  } catch {
    /* legacy absent — les effets sans icône restent sans icône */
  }

  // Officiel ou communautaire ? Une icône introuvable dans les sprites
  // extraits du jeu (nom verbatim ou variante SC_) est un asset WIKI.
  try {
    const index = buildImageIndex();
    const sc = (n: string) => n.replace(/^IG_/, 'SC_');
    for (const e of effects.values()) {
      if (!e.icon) continue;
      const found = findImage(index, [sc(e.icon), e.icon]);
      if (!found) e.iconEditorial = true;
    }
  } catch {
    /* extraction d'images absente (tests) — flag non calculé */
  }

  const tooltipKinds = new Map([...tooltipKindSets].map(([t, s]) => [t, [...s].sort()]));
  glossaryCache = { data: { effects, byTooltip, byLabel, byKey, tooltipKinds }, stamp };
  return glossaryCache.data;
}

/** Préfixe symbole d'un CreateText (`[DEBUFF]SYS_...` → `SYS_...`). */
function stripTextSymbol(key: string): string {
  return key.replace(/^\[[^\]]+\]/, '');
}

// Même régime d'empreinte que glossaryCache (dérivé de BuffTemplet + glossaire).
let mechanicLabelCache: { data: Map<string, string>; stamp: string } | undefined;

/**
 * Symbole `SYS_*` MAJORITAIRE par (nature, type de buff) — pont pour NOMMER
 * les effets d'ÉQUIPEMENT : leurs buffs (`BID_CEQUIP_*`…) portent le nom de
 * l'OBJET en CreateText (pas un nom d'effet), alors que les buffs de skill de
 * même type portent le symbole de la mécanique (BT_ACTION_GAUGE côté buff →
 * `SYS_BUFF_ACTION_GAUGE_UP` « Priority Increase »). Clé `side|BT_TYPE` ;
 * seuls les symboles résolubles dans le glossaire sont retenus — un type sans
 * symbole majoritaire (dégâts aux boss, câblages internes…) reste innommé,
 * donc sans chip, comme dans la curation V2.
 */
export function mechanicLabelIndex(): Map<string, string> {
  const stamp = tablesStamp(['TextSystem']);
  if (mechanicLabelCache && mechanicLabelCache.stamp === stamp) return mechanicLabelCache.data;
  const { byLabel } = buildEffectGlossary();
  const tally = new Map<string, Map<string, number>>();
  for (const b of loadTable('BuffTemplet')) {
    const t = b.ToolTipID;
    if (t && t !== '0' && t !== 'NONE') continue; // nommé par tooltip, hors sujet
    let sym = stripTextSymbol(b.CreateText || b.ActivateText || '');
    if (!sym.startsWith('SYS_')) continue;
    // Même correction de donnée client que `resolveEffect` : des BT_AP_CHARGE
    // déclarent le symbole des BP.
    if (b.Type === 'BT_AP_CHARGE' && sym === 'SYS_BUFF_CHARGE_BP') sym = 'SYS_BUFF_CHARGE_AP';
    const cat = classifyCategory(b);
    if (cat === 'neutral') continue;
    const key = `${cat === 'buff' ? 'buff' : 'debuff'}|${b.Type}`;
    const m = tally.get(key) ?? new Map<string, number>();
    m.set(sym, (m.get(sym) ?? 0) + 1);
    tally.set(key, m);
  }
  const idx = new Map<string, string>();
  for (const [key, m] of tally) {
    const winner = [...m.entries()].sort((a, b) => b[1] - a[1])[0][0];
    if (byLabel.has(winner)) idx.set(key, winner);
  }
  mechanicLabelCache = { data: idx, stamp };
  return idx;
}

/** L'instance concrète d'un effet appliqué par une compétence/un passif. */
export interface ResolvedEffect {
  /** Famille fonctionnelle. */
  family: EffectFamily;
  /** Nature (buff/debuff/cc/neutral). */
  category: EffectCategory;
  /** Type brut conservé (traçabilité, jamais perdu). */
  type: string;
  /** Id du buff source (relie une desc de skill `[Buff_*_<id>]` à son effet). */
  buff?: string;
  /** Cible (slug minuscule de `TargetType`, ex. `enemy_team`). */
  target: string;
  /** Stat affectée (slug) si applicable. */
  stat?: string;
  /** Sens de la stat (up/down) si applicable. */
  mode?: EffectMode;
  /** Magnitude formatée (per-mille → %, sinon entier), absolue. */
  value?: string;
  /** Durée en tours si fixe. */
  turn?: string;
  /** Taux d'application (%) si < 100. */
  rate?: string;
  /** Réf vers le glossaire (nom/mécanique/icône du statut nommé). */
  tooltip?: string;
  /** Clé de label court (CreateText/ActivateText) quand il n'y a pas de tooltip. */
  label?: string;
  /** Skill principal déclencheur (first/second/ultimate) si univoque (CallerSkillType). */
  caller?: string;
  /**
   * Membre d'un groupe à TIRAGE ALÉATOIRE (BuffGroupTemplet IsAllCreate=False,
   * plusieurs enfants) : un seul des effets marqués s'applique (posé par le
   * générateur de skills à l'expansion des groupes).
   */
  choice?: boolean;
}

/**
 * Résout une ligne `BuffTemplet` en instance d'effet structurée + lisible.
 * Ne résout PAS le texte ici (le glossaire/labels sont des catalogues à part) :
 * on pose les RÉFÉRENCES (`tooltip` / `label`) — résolution à la demande, comme
 * pour les passifs d'équipement.
 */
export function resolveEffect(row: Row): ResolvedEffect {
  const type = row.Type ?? 'BT_NONE';
  const raw = num(row.Value);
  const stat = statSlug(row.StatType);

  const eff: ResolvedEffect = {
    family: classifyFamily(type),
    category: classifyCategory(row),
    type,
    target: (row.TargetType ?? '').toLowerCase(),
  };
  if (row.BuffID) eff.buff = row.BuffID;

  if (stat) {
    eff.stat = stat;
    eff.mode = raw < 0 ? 'down' : 'up';
  }
  if (raw !== 0) eff.value = formatRowValue(row);
  if (/^\d+$/.test(row.TurnDuration ?? '')) eff.turn = row.TurnDuration!;
  if (num(row.CreateRate) > 0 && num(row.CreateRate) < 1000)
    eff.rate = `${num(row.CreateRate) / 10}%`;

  if (row.ToolTipID) eff.tooltip = row.ToolTipID;
  else if (row.CreateText) eff.label = stripTextSymbol(row.CreateText);
  // CORRECTION de donnée client : des buffs BT_AP_CHARGE déclarent le
  // CreateText des BP (`SYS_BUFF_CHARGE_BP`, symbole sans effet associé —
  // chaîne de Demiurge Luna). Le TYPE fait foi : AP.
  if (type === 'BT_AP_CHARGE' && eff.label === 'SYS_BUFF_CHARGE_BP')
    eff.label = 'SYS_BUFF_CHARGE_AP';
  // ActivateText = nom de la MÉCANIQUE déclenchée (SYS_BUFF_COUNTER → Counterattack,
  // SYS_BUFF_REVENGE…) — seul texte nommant les buffs BT_RUN_PASSIVE_SKILL_*.
  else if (row.ActivateText) eff.label = stripTextSymbol(row.ActivateText);

  // Skill déclencheur (CallerSkillType) quand il est UNIVOQUE : un buff porté
  // par un passif mais déclenché par le first (ex. dual attack de Monad Eva via
  // trancendent_8) appartient fonctionnellement à ce skill. On ignore les
  // listes ambiguës (plusieurs skills principaux) et SKT_ALL/SKT_NONE.
  const callers = (row.CallerSkillType ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s === 'SKT_FIRST' || s === 'SKT_SECOND' || s === 'SKT_ULTIMATE');
  if (callers.length === 1) eff.caller = callers[0].replace('SKT_', '').toLowerCase();

  return eff;
}

/** Partie INVARIANTE par niveau d'un effet (sans les scalaires value/rate/turn). */
export type EffectShape = Omit<ResolvedEffect, 'value' | 'rate' | 'turn'>;

/**
 * Structure d'un effet, sans les valeurs qui scalent (value/rate/turn).
 * Pour les compétences : la forme est stockée UNE fois, les nombres vivent dans
 * les `vars` par niveau (cf. `skillBuffVars`).
 */
export function effectShape(row: Row): EffectShape {
  const eff = resolveEffect(row);
  delete eff.value;
  delete eff.rate;
  delete eff.turn;
  return eff;
}
