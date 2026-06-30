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
 *   2. GLOSSAIRE       — `loadStatusGlossary()` : `BuffToolTipTemplet` →
 *      catalogue des effets de STATUT NOMMÉS (« Burned », « Increased Defense »)
 *      avec nom + desc générique + icône + isDebuff, résolus en 4 langues via
 *      TextSystem. Défini UNE fois, référencé par id (`tooltip`).
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
import { formatRowValue } from './buff';
import type { LangDict } from './lang';
import { loadTextIndex, resolveText } from './text';
import { loadTable, num, type Row } from './tables';

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

/** Famille fonctionnelle d'un `Type` de buff (repli `special` si inconnu). */
export function classifyFamily(type: string): EffectFamily {
  for (const r of FAMILY_RULES) if (r.test(type)) return r.family;
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

/** Une entrée du glossaire des effets de statut nommés (source : `BuffToolTipTemplet`). */
export interface StatusEffect {
  /** Id du tooltip (clé de référence depuis les instances). */
  id: string;
  /** Nom localisé (« Burned », « Increased Defense »). */
  name: LangDict;
  /** Description générique localisée (mécanique du statut, valeur canonique). */
  desc: LangDict;
  /** Icône du statut. */
  icon: string;
  /** Vrai si c'est un effet négatif. */
  isDebuff: boolean;
}

/**
 * Glossaire des effets de statut nommés : `ToolTipID` → { name, desc, icon, isDebuff }.
 * Nom/desc résolus via TextSystem (4 langues). C'est LA source de prose autoritaire
 * du jeu pour les statuts nommés.
 */
export function loadStatusGlossary(): Map<string, StatusEffect> {
  const sys = loadTextIndex('TextSystem');
  const out = new Map<string, StatusEffect>();
  for (const r of loadTable('BuffToolTipTemplet')) {
    if (!r.ID) continue;
    out.set(r.ID, {
      id: r.ID,
      name: resolveText(sys, r.NameID),
      desc: resolveText(sys, r.DescID),
      icon: r.IconName ?? '',
      isDebuff: r.IsDebuff === 'True',
    });
  }
  return out;
}

/** Préfixe symbole d'un CreateText (`[DEBUFF]SYS_...` → `SYS_...`). */
function stripTextSymbol(key: string): string {
  return key.replace(/^\[[^\]]+\]/, '');
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
  /** Clé de label court (CreateText) quand il n'y a pas de tooltip. */
  label?: string;
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
