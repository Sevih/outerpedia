/**
 * Spec d'extraction — PERSONNAGES (CharacterTemplet), entité qui relie tout.
 *
 * Source unique du savoir « perso » : type de sortie, mapping, schéma, oracle.
 * Le mapping est repris à l'identique de l'ancien `generators/characters.ts`
 * (zéro régression) ; les manques vis-à-vis de V2 sont déclarés dans `coverage`
 * (`todo`) et ressortent dans le rapport de complétude.
 *
 * Patron maison conservé : on RÉFÉRENCE skills/ee/sets par id (pas de recopie) ;
 * les libellés d'enum vivent dans des glossaires (slug stable) ; les stats sont
 * des NOMBRES BRUTS, l'échelle (plat/%) vit dans `statScales` (source unique).
 */
import type { LangDict } from '../../lib/lang';
import { resolveClass } from '../../lib/class';
import { expandBuffIds, loadBuffGroups, loadBuffIndex } from '../../lib/buff';
import { loadTextIndex, resolveText } from '../../lib/text';
import { bool, loadTable, num, splitCsv, type Row } from '../../lib/tables';
import { buildImageIndex } from '../../assets/source';
import { costumeCore } from '../../generators/costumes';
import { runSpec } from '../core/runner';
import type { ExtractorSpec } from '../core/spec';
import type { Schema } from '../core/validate';

/** Échelle d'affichage d'une stat. */
export type StatScale = 'flat' | 'percent';

/** Position dans l'attaque en chaîne. */
export type ChainType = 'start' | 'join' | 'finish';

/** BuffCreateType du buff de chaîne (`CHAIN_<rôle>_…`) → position. */
const CHAIN_ROLE: Record<string, ChainType> = {
  STARTER: 'start',
  STRIKER: 'join',
  FINISHER: 'finish',
};

/**
 * Vocabulaire FERMÉ des étiquettes DÉRIVÉES DU JEU. Les libellés et
 * descriptions vivent dans `data/curated/tags.json` (le jeu n'a AUCUN texte
 * pour ces catégories) ; ici on ne produit que la classification.
 * `free` n'y figure pas : c'est la seule étiquette purement humaine (aucun
 * marqueur d'obtention gratuite dans les tables) → couche curée.
 */
export type CharacterTag =
  'premium' | 'limited' | 'seasonal' | 'collab' | 'ignore-defense' | 'core-fusion';

/** Ordre canonique d'affichage (le 1er tag trouvé fait le badge de carte). */
const TAG_ORDER: readonly CharacterTag[] = [
  'premium',
  'limited',
  'seasonal',
  'collab',
  'ignore-defense',
  'core-fusion',
];

/**
 * D'où vient la pénétration de DEF. Toutes ne se valent PAS pour le joueur :
 * `kit` est acquis d'office, `ee` suppose l'équipement exclusif forgé et
 * équipé, `transcend` suppose le palier de transcendance atteint. On garde la
 * provenance pour que le front puisse nuancer (« Ignore DEF · via EE ») au
 * lieu de promettre la même chose dans les trois cas.
 */
export type IgnoreDefenseSource = 'kit' | 'ee' | 'transcend';

/** Ordre canonique des provenances (sortie déterministe). */
const IGNORE_DEFENSE_SOURCES: readonly IgnoreDefenseSource[] = ['kit', 'ee', 'transcend'];

/** `RibbonType` de la bannière de recrutement → étiquette d'acquisition. */
const RIBBON_TAG: Record<string, CharacterTag> = {
  PREMIUM: 'premium',
  OUTER_FES: 'limited',
  SEASONAL: 'seasonal',
};

/**
 * Une pénétration INNÉE — le perso perce DE LUI-MÊME.
 *
 * LA distinction du tag, et le piège de tout le sujet : « ignore-defense » ne
 * veut PAS dire « touche à la pénétration », mais « perce sans condition ».
 * Trois formes du jeu à ne surtout pas confondre :
 *
 *   1. BUFF de pénétration (`ON_TURN_END`) — le perso GAGNE le statut nommé
 *      « Increased Penetration », qui DURE et s'affiche dans sa barre de buffs.
 *      Ce n'est pas de l'inné : sans le buff, il ne perce pas. Beth (S1), Maxie,
 *      Tamara, Ember, Fortuna sont dans ce cas → ILS NE SONT PAS TAGGÉS.
 *   2. Dégâts CONDITIONNÉS à ce buff (`BT_DMG` + `BuffConditionType=OWNER_HAS_BUFF`)
 *      — la ligne porte bien `ST_PIERCE_POWER_RATE`, mais elle ne l'APPLIQUE pas :
 *      elle module des dégâts SI le buff est là (Beth S2/S3). Piège classique :
 *      la stat est présente, la pénétration non.
 *   3. Pénétration INNÉE — la seule qui compte :
 *      - `ON_SKILL_FINISH` / `ON_SKILL_CHAIN_FINISH` : appliquée le TEMPS que le
 *        skill (ou la chaîne) se résolve, puis retirée → c'est la frappe qui
 *        perce, pas le perso qui porte un statut. La chaîne de Beth est ainsi la
 *        SEULE vraie pénétration de son kit ;
 *      - `NONE` : passif permanent (transcendance, équipement exclusif).
 *
 * Cible : `ME`, ou `MY_TEAM` qui INCLUT le lanceur ; `MY_TEAM_WITHOUT_ME` non,
 * d'où la liste explicite plutôt qu'un `startsWith('MY_TEAM')`.
 * Valeur POSITIVE : un `ST_PIERCE_POWER_RATE` NÉGATIF sur `ENEMY_TEAM` RÉDUIT la
 * pénétration adverse (Domine, Anarky) — l'exact inverse d'un ignore-DEF.
 */
function isInnatePierce(b: Row): boolean {
  return (
    (b.StatType ?? '').startsWith('ST_PIERCE_POWER') &&
    num(b.Value) > 0 &&
    (b.TargetType === 'ME' || b.TargetType === 'MY_TEAM') &&
    b.Type !== 'BT_DMG' &&
    (b.BuffRemoveType ?? 'NONE') !== 'ON_TURN_END'
  );
}

/**
 * Colonnes de stats de CharacterTemplet (paires _Min/_Max) → slug + échelle.
 * `percent` = valeur per-mille (÷10 pour un %) ; `flat` = entier brut.
 */
const STAT_DEFS: Array<{ col: string; slug: string; scale: StatScale }> = [
  { col: 'HP', slug: 'hp', scale: 'flat' },
  { col: 'Atk', slug: 'atk', scale: 'flat' },
  { col: 'Def', slug: 'def', scale: 'flat' },
  { col: 'Speed', slug: 'speed', scale: 'flat' },
  { col: 'WG', slug: 'guard', scale: 'flat' },
  { col: 'CriticalRate', slug: 'critical_rate', scale: 'percent' },
  { col: 'CriticalDMGRate', slug: 'critical_dmg', scale: 'percent' },
  { col: 'DMGReduceRate', slug: 'dmg_reduce', scale: 'percent' },
  { col: 'DamageBoost', slug: 'damage_boost', scale: 'percent' },
  { col: 'PiercePower', slug: 'pierce_power', scale: 'flat' },
  { col: 'PiercePowerRate', slug: 'pierce_power_rate', scale: 'percent' },
  { col: 'Vampiric', slug: 'vampiric', scale: 'percent' },
  { col: 'HitHPRecovery', slug: 'hit_hp_recovery', scale: 'flat' },
  { col: 'Accuracy', slug: 'effectiveness', scale: 'percent' },
  { col: 'Avoid', slug: 'resilience', scale: 'percent' },
  { col: 'BuffChance', slug: 'buff_chance', scale: 'percent' },
  { col: 'BuffResist', slug: 'buff_resist', scale: 'percent' },
  { col: 'CounterRate', slug: 'counter_rate', scale: 'percent' },
  { col: 'EnemyCriticalDamageReduce', slug: 'enemy_critical_dmg_reduce', scale: 'percent' },
  { col: 'HitBP', slug: 'hit_bp', scale: 'flat' },
  { col: 'EnterBP', slug: 'enter_bp', scale: 'flat' },
  { col: 'KillBP', slug: 'kill_bp', scale: 'flat' },
  { col: 'GetGoldRate', slug: 'get_gold_rate', scale: 'percent' },
  { col: 'GetCharExpRate', slug: 'get_char_exp_rate', scale: 'percent' },
  { col: 'AvoidAddCap', slug: 'avoid_add_cap', scale: 'percent' },
  { col: 'AvoidSubtractCap', slug: 'avoid_subtract_cap', scale: 'percent' },
];

/** Fourchette d'une stat (niveau 1 → niveau max), valeurs brutes. */
export interface StatRange {
  min: number;
  max: number;
}

/** Profil de personnage (donnée d'archive). Valeurs brutes : le front formate. */
export interface CharacterProfile {
  /** Anniversaire « MM/DD » (depuis Birth AAAAMMJJ). */
  birthday?: string;
  /** Taille en cm. */
  height?: number;
  /** Poids en kg (omis si « secret »). */
  weight?: number;
  /** Histoire/lore localisée. */
  story?: LangDict;
}

/** Un costume/skin (CostumeTemplet). */
export interface Costume {
  id: string;
  /** Id du modèle d'apparence (ModelNameID). */
  model: string;
  name: LangDict;
  /** Icône de costume (SpriteCostumeIcon). */
  icon: string;
  /** Rareté (slug : normal/magic/rare). */
  grade: string;
  /** Provenance (slug : shop/event_shop/world_boss_shop/battlepass…), si connue. */
  source?: string;
  /** Modèle équivalent pour la core-fusion (FusionModelNameID), si présent. */
  fusionModel?: string;
  /** Full art IMG_<model> présent dans l'extraction (affichable). */
  art?: boolean;
  /** Full art IMG_<fusionModel> présent dans l'extraction. */
  fusionArt?: boolean;
  /** Ordre d'affichage. */
  sort: number;
}

/** Un palier de core-fusion (CharacterFusionLevelTemplet). */
export interface FusionLevel {
  level: number;
  /** Matériau requis (id item) + quantité pour ce palier. */
  item: string;
  cost: number;
  /** Niveau atteint par compétence (skillId → niveau) à ce palier. */
  skillLevels: Record<string, number>;
}

/** Détail de progression d'une core-fusion (porté par l'entité fusion). */
export interface FusionInfo {
  /** Groupe de fusion (FusionGroupID). */
  group: string;
  /** Transcendance prérequise sur la base (CharacterTransStar). */
  transStar: number;
  levels: FusionLevel[];
}

/** Un personnage jouable (source unique, référence skills/ee/sets par id). */
export interface Character {
  id: string;
  name: LangDict;
  /** Titre/épithète (« The Lone Avenger »). */
  nickname?: LangDict;
  /**
   * Le jeu affiche le nickname EN PRÉFIXE du nom (CharacterExtraTemplet.ShowNickName)
   * → nom complet « Demiurge Stella ». Le front compose `nickname + name`.
   */
  showNickName?: boolean;
  /** Rareté de base (étoiles, BasicStar). */
  rarity: number;
  /** Slugs stables (libellés dans les glossaires). */
  element: string;
  class: string;
  subClass?: string;
  race: string;
  /** Position dans l'attaque en chaîne (BuffTemplet `<id>_chain*`.BuffCreateType). */
  chainType?: ChainType;
  /**
   * Étiquettes dérivées du jeu (acquisition, mécanique, lignée), ordre canonique.
   * Le curé n'ajoute que `free` par-dessus — cf. `data/curated/characters.json`.
   */
  tags?: CharacterTag[];
  /** Provenances de la pénétration de DEF, si le perso porte `ignore-defense`. */
  ignoreDefense?: IgnoreDefenseSource[];
  /** Type de cadeau préféré (slug ; libellé dans le glossaire `gifts`). */
  gift?: string;
  /** Icône de portrait (FaceIconID). */
  icon: string;
  /** Réfs vers le catalogue de compétences (Skill_1..23 non vides). */
  skills: string[];
  /** Doubleur localisé (CVNameID résolu), si renseigné. */
  voiceActor?: LangDict;
  /** Profil d'archive (anniversaire, taille, poids, histoire). */
  profile?: CharacterProfile;
  /** Réf vers l'équipement exclusif (EE), si le perso en a un. */
  ee?: string;
  /** Sets recommandés (réfs GroupID de set), si présents. */
  recommendedSets?: string[];
  /** Stats de base par slug (valeurs brutes ; échelle dans `statScales`). */
  stats: Record<string, StatRange>;
  /** Ids des apparences (modèles alternés) qui empruntent l'identité de ce perso. */
  appearances?: string[];
  /** Costumes/skins obtenables (CostumeTemplet), avec nom et icône. */
  costumes?: Costume[];
  /** Sur une base qui a une évolution : id de l'entité core-fusion. */
  coreFusion?: string;
  /** Sur une entité core-fusion : id du personnage de base dont elle dérive. */
  originalCharacter?: string;
  /** Sur une entité core-fusion : détail de progression (paliers, coûts). */
  fusion?: FusionInfo;
}

/** Glossaire générique slug → libellé localisé. */
type Glossary = Record<string, LangDict>;

/** Sorties transverses dérivées de l'extraction perso. */
export interface CharacterGlossaries {
  elements: Glossary;
  classes: Glossary;
  subClasses: Record<string, { name: LangDict; desc?: LangDict }>;
  statScales: Record<string, StatScale>;
  /** Types de cadeau (slug → libellé), réf par `Character.gift`. */
  gifts: Glossary;
  /** Libellé « Core Fusion » du jeu (SYS_CHARACTER_FUSION_TITLE) — préfixe du nom. */
  fusionTitle: LangDict;
}

/** Contexte partagé pré-calculé une fois pour tout le lot. */
interface CharacterAux {
  tchar: Map<string, LangDict>;
  tsys: Map<string, LangDict>;
  eeByChar: Map<string, string>;
  /** id perso → position d'attaque en chaîne (BuffTemplet, buff `_chain`). */
  chainTypeById: Map<string, ChainType>;
  /** id perso → type de cadeau préféré (TrustTemplet.PresentTypeLike). */
  giftById: Map<string, string>;
  /** ids dont le nickname s'affiche en préfixe (CharacterExtraTemplet). */
  showNickNameIds: Set<string>;
  /** id perso → profil d'archive (ArchiveCharacterProfileTemplet). */
  profileById: Map<string, CharacterProfile>;
  /** id perso → costumes (CostumeTemplet). */
  costumesByChar: Map<string, Costume[]>;
  /** base → id de sa core-fusion (CharacterFusionTemplet). */
  fusionByBase: Map<string, string>;
  /** core-fusion → id de sa base. */
  baseByFusion: Map<string, string>;
  /** core-fusion → { group, transStar } (CharacterFusionTemplet). */
  fusionMetaByChar: Map<string, { group: string; transStar: number }>;
  /** FusionGroupID → lignes de paliers (CharacterFusionLevelTemplet). */
  fusionLevelsByGroup: Map<string, Row[]>;
  /** id cible → ids des apparences qui l'empruntent. */
  appearancesOf: Map<string, string[]>;
  /** id de base → skills de ses FORMES de combat (kit principal remplacé). */
  formSkillsByBase: Map<string, string[]>;
  /** slug d'enum de classe brut (`attacker`) → slug canonique (`striker`). */
  classOf: Map<string, string>;
  /** id perso → étiquette d'acquisition (RecruitGroupTemplet), si le jeu en donne une. */
  recruitTagById: Map<string, CharacterTag>;
  /** id de skill → provenances de pénétration qu'il apporte (`kit` et/ou `transcend`). */
  pierceBySkill: Map<string, Set<IgnoreDefenseSource>>;
  /** ids des persos dont l'ÉQUIPEMENT EXCLUSIF accorde une pénétration. */
  eePierceIds: Set<string>;
  glossaries: CharacterGlossaries;
}

/** Slug d'un enum en retirant un préfixe connu (`CET_FIRE` → `fire`). */
function slugAfter(v: string | undefined, prefix: string): string {
  if (!v) return '';
  return (v.startsWith(prefix) ? v.slice(prefix.length) : v).toLowerCase();
}

/**
 * Identité propre : le `NameID` d'une ligne est `<ID>_Name`. Les apparences
 * (skins) empruntent au contraire le `NameID` de leur base (`2000005_Name` sur
 * l'id `2010005`) → c'est ce qui les distingue d'un vrai perso/évolution.
 */
function ownIdentity(r: Row): boolean {
  return r.NameID === `${r.ID}_Name`;
}

/**
 * Nettoie un nom de doubleur : sentinelle « 0 » (pas de doublage) → vide, et
 * retire le préfixe d'usage (`VA. ` anglais, `CV.` jp/kr) → nom nu, le front
 * réaffiche le préfixe s'il veut.
 */
function cleanVoiceActor(v: string | undefined): string {
  if (!v || v === '0') return '';
  const name = v.replace(/^(VA|CV)\.\s*/, '').trim();
  // Placeholders du jeu : « VA. None », « CV.메네 성우 이름 » (« nom du doubleur »).
  if (name === 'None' || /성우 이름$/.test(name)) return '';
  return name;
}

/**
 * Doubleurs par langue de doublage depuis TextCharacter. Deux formats :
 * nouveau = une clé par RÉGION (`<id>_CVName_en/_jp/_kr`), le nom natif dans
 * la colonne de sa langue — PRIORITAIRE (quand les deux coexistent, l'ancienne
 * clé est un placeholder « VA. None ») ; ancien = UNE clé `<id>_CVName`
 * (une colonne par langue). `null` si aucun doubleur.
 */
function resolveVoiceActor(
  tchar: Map<string, LangDict>,
  keyBase: string | undefined,
): LangDict | null {
  if (!keyBase) return null;
  let va: LangDict = {
    en: cleanVoiceActor(resolveText(tchar, `${keyBase}_en`).en),
    jp: cleanVoiceActor(resolveText(tchar, `${keyBase}_jp`).jp),
    kr: cleanVoiceActor(resolveText(tchar, `${keyBase}_kr`).kr),
    zh: cleanVoiceActor(resolveText(tchar, `${keyBase}_zh`).zh),
  };
  if (!(va.en || va.jp || va.kr || va.zh)) {
    const cv = resolveText(tchar, keyBase);
    va = {
      en: cleanVoiceActor(cv.en),
      jp: cleanVoiceActor(cv.jp),
      kr: cleanVoiceActor(cv.kr),
      zh: cleanVoiceActor(cv.zh),
    };
  }
  return va.en || va.jp || va.kr || va.zh ? va : null;
}

/** Stats de l'écran principal du jeu : toujours émises, même nulles — un boss
 * à DEF 0 affiche « DEF 0 » en jeu (colonne absente du templet = 0). */
const CORE_STATS = new Set(['hp', 'atk', 'def', 'speed']);

/** Extrait les stats non nulles (paires _Min/_Max) en valeurs brutes — sauf le
 * cœur (`CORE_STATS`), toujours émis.
 * La plage couvre les niveaux 1..100 SANS éveils — les paliers affichés
 * (évolutions, dépassement 105/110/120) sont CALCULÉS au runtime par
 * `computeStatSteps` (src/lib/data/char-progression), validé contre l'oracle
 * V2 et in-game. Ne pas cuire les éveils ici : double-compte garanti. */
export function extractStats(r: Row): Record<string, StatRange> {
  const out: Record<string, StatRange> = {};
  for (const d of STAT_DEFS) {
    const min = num(r[`${d.col}_Min`]);
    const max = num(r[`${d.col}_Max`]);
    if (min !== 0 || max !== 0 || CORE_STATS.has(d.slug)) out[d.slug] = { min, max };
  }
  return out;
}

export const statRangeSchema: Schema = {
  kind: 'object',
  fields: { min: { kind: 'number' }, max: { kind: 'number' } },
};

const characterSchema: Schema = {
  kind: 'object',
  fields: {
    id: { kind: 'string' },
    name: { kind: 'langDict' },
    nickname: { kind: 'langDict', optional: true },
    showNickName: { kind: 'boolean', optional: true },
    rarity: { kind: 'number', int: true, min: 0 },
    element: { kind: 'string' },
    class: { kind: 'string' },
    subClass: { kind: 'string', optional: true },
    race: { kind: 'string' },
    chainType: { kind: 'string', enum: ['start', 'join', 'finish'], optional: true },
    tags: {
      kind: 'array',
      optional: true,
      of: { kind: 'string', enum: TAG_ORDER },
    },
    ignoreDefense: {
      kind: 'array',
      optional: true,
      of: { kind: 'string', enum: IGNORE_DEFENSE_SOURCES },
    },
    gift: { kind: 'string', optional: true },
    icon: { kind: 'string' },
    skills: { kind: 'array', of: { kind: 'string' }, minItems: 1 },
    voiceActor: { kind: 'langDict', optional: true },
    profile: {
      kind: 'object',
      optional: true,
      fields: {
        birthday: { kind: 'string', optional: true },
        height: { kind: 'number', int: true, optional: true },
        weight: { kind: 'number', int: true, optional: true },
        story: { kind: 'langDict', optional: true },
      },
    },
    ee: { kind: 'string', optional: true },
    recommendedSets: { kind: 'array', of: { kind: 'string' }, optional: true },
    stats: { kind: 'record', of: statRangeSchema },
    appearances: { kind: 'array', of: { kind: 'string' }, optional: true },
    costumes: {
      kind: 'array',
      optional: true,
      of: {
        kind: 'object',
        fields: {
          id: { kind: 'string' },
          model: { kind: 'string' },
          name: { kind: 'langDict' },
          icon: { kind: 'string' },
          grade: { kind: 'string' },
          source: { kind: 'string', optional: true },
          fusionModel: { kind: 'string', optional: true },
          art: { kind: 'boolean', optional: true },
          fusionArt: { kind: 'boolean', optional: true },
          sort: { kind: 'number', int: true },
        },
      },
    },
    coreFusion: { kind: 'string', optional: true },
    originalCharacter: { kind: 'string', optional: true },
    fusion: {
      kind: 'object',
      optional: true,
      fields: {
        group: { kind: 'string' },
        transStar: { kind: 'number', int: true, min: 0 },
        levels: {
          kind: 'array',
          minItems: 1,
          of: {
            kind: 'object',
            fields: {
              level: { kind: 'number', int: true, min: 1 },
              item: { kind: 'string' },
              cost: { kind: 'number', int: true, min: 0 },
              skillLevels: { kind: 'record', of: { kind: 'number', int: true } },
            },
          },
        },
      },
    },
  },
};

export const characterSpec: ExtractorSpec<Character, CharacterAux> = {
  id: 'character',

  select() {
    // Entités réelles : bases à identité propre (`ownIdentity`) + core-fusions.
    // Tout le reste est du SKIN et emprunte une identité :
    //   - apparences (ids 201xxxx/202xxxx…) → écartées par `ownIdentity` ;
    //   - formes alternées (`CharacterChangeTemplet`, ex. Luna 2000119↔2000120 :
    //     la cible `ChangeCharacterID` emprunte l'identité de la base) → écartées.
    // On NE filtre PLUS sur `ShowMainPage` : les persos non « sortis » mais réels
    // (ex. Lambda 2000118) doivent apparaître dans l'extracteur pour que l'admin
    // décide de les intégrer (l'intégration est la seule porte vers le site).
    const fusionIds = new Set(loadTable('CharacterFusionTemplet').map((r) => r.ChangeCharID));
    const formIds = new Set(loadTable('CharacterChangeTemplet').map((r) => r.ChangeCharacterID));
    return loadTable('CharacterTemplet').filter(
      (r) => r.Type === 'CT_PC' && !formIds.has(r.ID) && (ownIdentity(r) || fusionIds.has(r.ID)),
    );
  },

  prepare(rows) {
    const items = loadTable('ItemTemplet');
    const tchar = loadTextIndex('TextCharacter');
    const tsys = loadTextIndex('TextSystem');

    // Réverse EE : CharacterLimit → id de l'item EE.
    const eeByChar = new Map<string, string>();
    for (const it of items) {
      if (it.ItemSubType === 'ITS_EQUIP_EXCLUSIVE' && it.CharacterLimit) {
        eeByChar.set(it.CharacterLimit, it.ID);
      }
    }

    // Glossaires : une entrée par slug rencontré (élément/classe/sous-classe).
    const elements: Glossary = {};
    const classes: Glossary = {};
    // Slug d'enum brut (`attacker`) → slug canonique (`striker`), via TextSystem.
    const classOf = new Map<string, string>();
    const subClasses: CharacterGlossaries['subClasses'] = {};
    for (const r of rows) {
      const element = slugAfter(r.Element, 'CET_');
      const klassRaw = slugAfter(r.Class, 'CCT_');
      const subClass = r.SubClass && r.SubClass !== 'NONE' ? r.SubClass.toLowerCase() : undefined;
      if (element) elements[element] ??= resolveText(tsys, `SYS_ELEMENT_${element.toUpperCase()}`);
      if (klassRaw && !classOf.has(klassRaw)) {
        const { slug, name } = resolveClass(klassRaw, tsys);
        classOf.set(klassRaw, slug);
        classes[slug] ??= name;
      }
      if (subClass && !subClasses[subClass]) {
        const up = subClass.toUpperCase();
        const desc = resolveText(tsys, `SYS_CLASS_INFO_${up}`);
        subClasses[subClass] = { name: resolveText(tsys, `SYS_CLASS_NAME_${up}`) };
        if (desc.en) subClasses[subClass].desc = desc;
      }
    }

    const statScales: Record<string, StatScale> = {};
    for (const d of STAT_DEFS) statScales[d.slug] = d.scale;

    // Attaque en chaîne : le buff `<id>_chain*` porte le rôle dans BuffCreateType
    // (CHAIN_STARTER/STRIKER/FINISHER). Source fiable (≠ ChainCombination.Sequence).
    const chainTypeById = new Map<string, ChainType>();
    for (const b of loadTable('BuffTemplet')) {
      const m = /^(\d+)_chain/.exec(b.BuffID ?? '');
      if (!m || chainTypeById.has(m[1])) continue;
      const role = /CHAIN_(STARTER|STRIKER|FINISHER)_/.exec(b.BuffCreateType ?? '');
      if (role) chainTypeById.set(m[1], CHAIN_ROLE[role[1]]);
    }

    // Cadeau préféré : TrustTemplet.PresentTypeLike (ITS_PRESENT_0X) + glossaire.
    const trust = loadTable('TrustTemplet');
    const giftById = new Map(trust.map((r) => [r.ID, r.PresentTypeLike]));
    const gifts: Glossary = {};
    for (const r of trust) {
      const slug = slugAfter(r.PresentTypeLike, 'ITS_');
      if (slug) gifts[slug] ??= resolveText(tsys, `SYS_${r.PresentTypeLike}`);
    }

    // Affichage du nickname en préfixe du nom (« Demiurge Stella »).
    const showNickNameIds = new Set(
      loadTable('CharacterExtraTemplet')
        .filter((r) => bool(r.ShowNickName))
        .map((r) => r.CharacterID),
    );

    // Profils d'archive : anniversaire (Birth AAAAMMJJ), taille, poids, histoire.
    const profileById = new Map<string, CharacterProfile>();
    for (const r of loadTable('ArchiveCharacterProfileTemplet')) {
      const prof: CharacterProfile = {};
      if (/^\d{8}$/.test(r.Birth ?? ''))
        prof.birthday = `${r.Birth.slice(4, 6)}/${r.Birth.slice(6, 8)}`;
      const h = num(r.Height);
      if (h > 0) prof.height = h;
      const w = num(r.Weight);
      if (w > 0) prof.weight = w;
      const story = resolveText(tsys, r.ProfileScenario);
      if (story.en) prof.story = story;
      if (Object.keys(prof).length) profileById.set(r.CharacterID, prof);
    }

    // Costumes/skins (CostumeTemplet), groupés par perso et ordonnés. Le flag
    // `art` (full art IMG_<model> présent dans l'extraction) évite au front de
    // référencer des rendus que le jeu ne fournit pas pour certains skins.
    const imageIndex = buildImageIndex();
    const costumesByChar = new Map<string, Costume[]>();
    for (const r of loadTable('CostumeTemplet')) {
      // Champs communs (nom/icône/grade/source) : extraction PARTAGÉE avec la
      // vue plate du catalogue d'items (`costumeCore` — une seule règle, repli
      // d'icône RewardCostumeIcon inclus).
      const { name, icon, grade, source } = costumeCore(r, tchar);
      const cos: Costume = {
        id: r.ID,
        model: r.ModelNameID,
        name,
        icon,
        grade,
        sort: num(r.Sort),
      };
      if (source) cos.source = source;
      if (r.FusionModelNameID) cos.fusionModel = r.FusionModelNameID;
      if (imageIndex.has(`img_${cos.model}`.toLowerCase())) cos.art = true;
      if (cos.fusionModel && imageIndex.has(`img_${cos.fusionModel}`.toLowerCase()))
        cos.fusionArt = true;
      const list = costumesByChar.get(r.CharacterID);
      if (list) list.push(cos);
      else costumesByChar.set(r.CharacterID, [cos]);
    }
    for (const list of costumesByChar.values()) list.sort((a, b) => a.sort - b.sort);

    // Liens core-fusion (table dédiée) : base ↔ évolution + méta + paliers.
    const fusion = loadTable('CharacterFusionTemplet');
    const fusionByBase = new Map(fusion.map((f) => [f.CharacterID, f.ChangeCharID]));
    const baseByFusion = new Map(fusion.map((f) => [f.ChangeCharID, f.CharacterID]));
    const fusionMetaByChar = new Map(
      fusion.map((f) => [
        f.ChangeCharID,
        { group: f.FusionGroupID, transStar: num(f.CharacterTransStar) },
      ]),
    );
    const fusionLevelsByGroup = new Map<string, Row[]>();
    for (const r of loadTable('CharacterFusionLevelTemplet')) {
      const list = fusionLevelsByGroup.get(r.FusionGroupID);
      if (list) list.push(r);
      else fusionLevelsByGroup.set(r.FusionGroupID, [r]);
    }

    // Profil de la fusion : birthday/taille/poids de la base + histoire PROPRE
    // (FusionCompleteDescID = SYS_ACHIEVE_PROFILE_<fusionId>).
    for (const f of fusion) {
      const story = resolveText(tsys, f.FusionCompleteDescID);
      const prof: CharacterProfile = { ...(profileById.get(f.CharacterID) ?? {}) };
      if (story.en) prof.story = story;
      if (Object.keys(prof).length) profileById.set(f.ChangeCharID, prof);
    }

    // Apparences : ligne CT_PC sans identité propre = skin de sa cible — à
    // condition qu'un COSTUME la référence (seul marqueur fiable d'un skin
    // affichable, avec ses CT_/FI_/IG_Turn_ propres). Écarte : les clones de
    // gameplay (21/23–26X…, ModelID = base, sprites de la base réutilisés),
    // les formes de combat sans visuel UI propre (Demiurge Luna 2000120 :
    // seules les icônes de skill changent) et les apparences jamais livrées
    // (« Sentinel Noa » 2020022, vue uniquement dans la transition du world boss).
    const costumeModels = new Set<string>();
    for (const r of loadTable('CostumeTemplet')) {
      if (r.ModelNameID && r.ModelNameID !== '0') costumeModels.add(r.ModelNameID);
      if (r.FusionModelNameID && r.FusionModelNameID !== '0')
        costumeModels.add(r.FusionModelNameID);
    }
    const appearancesOf = new Map<string, string[]>();
    for (const r of loadTable('CharacterTemplet')) {
      if (r.Type !== 'CT_PC' || ownIdentity(r) || !costumeModels.has(r.ID)) continue;
      const target = r.NameID.replace(/_Name$/, '');
      const list = appearancesOf.get(target);
      if (list) list.push(r.ID);
      else appearancesOf.set(target, [r.ID]);
    }

    // FORMES DE COMBAT : la transformation DÉCLARÉE par le jeu
    // (`CharacterChangeTemplet`, Demiurge Luna 2000119 → 2000120 via son S2).
    // Ses skills rejoignent la fiche de la base — le joueur les déclenche, le
    // jeu présente un seul personnage.
    //
    // ⚠ Ne PAS déduire la forme d'un « kit principal différent » : les VARIANTES
    // NPC (`NPCCharacterTemplet` : K niveau 99 ★9 en renfort de scénario, id
    // 2600001, `OriginalCharacterID` 2000001) empruntent le modèle ET l'identité
    // d'un perso avec un kit à elles. L'heuristique les repliait sur la fiche du
    // JOUEUR, qui héritait de skills qu'il ne joue jamais (K : « Raging Storm »,
    // « Sliding Uppercut »…). Une déclaration explicite du jeu, pas une
    // ressemblance.
    const rowById = new Map(loadTable('CharacterTemplet').map((r) => [r.ID, r]));
    const formSkillsByBase = new Map<string, string[]>();
    for (const chg of loadTable('CharacterChangeTemplet')) {
      const source = rowById.get(chg.ID);
      const form = rowById.get(chg.ChangeCharacterID);
      if (!source || !form) continue;
      // La transformation est déclarée aussi pour les SKINS (2010119 → 2010120) :
      // on ramène toujours à l'identité de base.
      const baseId = ownIdentity(source) ? source.ID : source.NameID.replace(/_Name$/, '');
      const skills: string[] = [];
      for (let i = 1; i <= 23; i++) if (form[`Skill_${i}`]) skills.push(form[`Skill_${i}`]);
      formSkillsByBase.set(baseId, [...(formSkillsByBase.get(baseId) ?? []), ...skills]);
    }

    // ACQUISITION (premium/limited/seasonal/collab) : la BANNIÈRE fait foi.
    // `RecruitGroupTemplet` liste chaque bannière avec le perso mis en avant
    // (`PickupID`) et son ruban (`RibbonType`). Un perso peut revenir dans
    // plusieurs bannières (rerun, sélection) → on prend l'UNION de ses rubans
    // et on tranche par ordre de priorité.
    // Le collab n'a PAS de ruban propre (il emprunte `SEASONAL`) : il se lit sur
    // le nom de l'image de bannière (« Collabo ») ou, pour les persos jamais
    // remis en bannière, sur l'effet de vignette du roster (CharacterExtraTemplet
    // `FX_UI_Character_List_Dungeon`).
    const collabIds = new Set(
      loadTable('CharacterExtraTemplet')
        .filter((r) => r.ThumbnailEffect === 'FX_UI_Character_List_Dungeon')
        .map((r) => r.CharacterID),
    );
    const ribbonsByChar = new Map<string, Set<string>>();
    for (const r of loadTable('RecruitGroupTemplet')) {
      const id = r.PickupID;
      if (!id || id === '0') continue;
      if (/Collabo/i.test(`${r.RollingBannerImage ?? ''} ${r.BannerImageName ?? ''}`))
        collabIds.add(id);
      const set = ribbonsByChar.get(id);
      if (set) set.add(r.RibbonType);
      else ribbonsByChar.set(id, new Set([r.RibbonType]));
    }
    const recruitTagById = new Map<string, CharacterTag>();
    for (const [id, ribbons] of ribbonsByChar) {
      // Priorité : le collab l'emporte (il se déguise en SEASONAL), puis le
      // ruban le plus « fort » — un perso premium peut ressortir en PICKUP.
      const tag = collabIds.has(id)
        ? 'collab'
        : (['PREMIUM', 'OUTER_FES', 'SEASONAL'].find((rt) => ribbons.has(rt)) ?? '');
      if (tag) recruitTagById.set(id, RIBBON_TAG[tag] ?? (tag as CharacterTag));
    }
    for (const id of collabIds) recruitTagById.set(id, 'collab');

    // PÉNÉTRATION DE DÉFENSE (`ignore-defense`) — trois provenances distinctes.
    //
    // Le kit : on part des skills du perso et on suit les buffs qu'ils posent,
    // groupes `BT_GROUP` EXPANSÉS (`expandBuffIds`). L'expansion n'est pas un
    // détail : Delta ne perce QUE via un enfant de groupe (`2000099_child`),
    // invisible si on s'arrête aux buffs câblés directement sur le skill.
    // La transcendance : le jeu nomme ces buffs `trancendent_*` (sic) — le perso
    // ne perce qu'une fois le palier atteint, on ne le confond pas avec le kit.
    // L'EE : buffs `BID_CEQUIP_<id>*`, hors du graphe des skills.
    const buffsByID = loadBuffIndex();
    const buffGroups = loadBuffGroups();
    const pierceBySkill = new Map<string, Set<IgnoreDefenseSource>>();
    for (const lvl of loadTable('CharacterSkillLevelTemplet')) {
      const ids = splitCsv(lvl.BuffID ?? '').filter((b) => b && b !== '0');
      if (!ids.length) continue;
      for (const b of expandBuffIds(ids, buffsByID, buffGroups, num(lvl.SkillLevel))) {
        if (!(buffsByID.get(b.id) ?? []).some(isInnatePierce)) continue;
        const src: IgnoreDefenseSource = b.id.startsWith('trancendent_') ? 'transcend' : 'kit';
        const set = pierceBySkill.get(lvl.SkillID);
        if (set) set.add(src);
        else pierceBySkill.set(lvl.SkillID, new Set([src]));
      }
    }
    const eePierceIds = new Set<string>();
    for (const b of loadTable('BuffTemplet')) {
      const m = /^BID_CEQUIP_(\d+)/.exec(b.BuffID ?? '');
      if (m && isInnatePierce(b)) eePierceIds.add(m[1]);
    }

    return {
      tchar,
      tsys,
      eeByChar,
      chainTypeById,
      giftById,
      showNickNameIds,
      profileById,
      costumesByChar,
      fusionByBase,
      baseByFusion,
      fusionMetaByChar,
      fusionLevelsByGroup,
      appearancesOf,
      formSkillsByBase,
      classOf,
      recruitTagById,
      pierceBySkill,
      eePierceIds,
      glossaries: {
        elements,
        classes,
        subClasses,
        statScales,
        gifts,
        fusionTitle: resolveText(tsys, 'SYS_CHARACTER_FUSION_TITLE'),
      },
    };
  },

  map(r, aux) {
    const skills: string[] = [];
    for (let i = 1; i <= 23; i++) if (r[`Skill_${i}`]) skills.push(r[`Skill_${i}`]);
    // Skills des formes de combat (cf. formSkillsByBase) — même personnage.
    for (const s of aux.formSkillsByBase.get(r.ID) ?? []) if (!skills.includes(s)) skills.push(s);

    const char: Character = {
      id: r.ID,
      name: resolveText(aux.tchar, r.NameID),
      rarity: num(r.BasicStar),
      element: slugAfter(r.Element, 'CET_'),
      class: aux.classOf.get(slugAfter(r.Class, 'CCT_')) ?? slugAfter(r.Class, 'CCT_'),
      race: slugAfter(r.Race, 'CRT_'),
      icon: r.FaceIconID ?? r.ID,
      skills,
      stats: extractStats(r),
    };
    const nick = resolveText(aux.tchar, r.NickNameID);
    if (nick.en) char.nickname = nick;
    if (aux.showNickNameIds.has(r.ID)) char.showNickName = true;
    const subClass = r.SubClass && r.SubClass !== 'NONE' ? r.SubClass.toLowerCase() : undefined;
    if (subClass) char.subClass = subClass;
    const chainType = aux.chainTypeById.get(r.ID);
    if (chainType) char.chainType = chainType;
    const gift = aux.giftById.get(r.ID);
    if (gift) char.gift = slugAfter(gift, 'ITS_');
    // Doubleur PAR LANGUE de doublage (en=VA anglais, jp=seiyuu, …), pas une
    // traduction. Une core-fusion prend le doubleur de sa BASE (même voix
    // in-game — sa propre clé CV est un placeholder « Notia voice actor name »).
    const fusionBase = aux.baseByFusion.get(r.ID);
    const va = fusionBase
      ? resolveVoiceActor(aux.tchar, `${fusionBase}_CVName`)
      : resolveVoiceActor(aux.tchar, r.CVNameID);
    if (va) char.voiceActor = va;
    const profile = aux.profileById.get(r.ID);
    if (profile) char.profile = profile;
    const ee = aux.eeByChar.get(r.ID);
    if (ee) char.ee = ee;
    const sets = splitCsv(r.RecommandSetOptionID ?? '');
    if (sets.length) char.recommendedSets = sets;

    // ÉTIQUETTES : acquisition (bannière) + mécanique (pénétration) + lignée.
    // `skills` inclut déjà les FORMES de combat → une forme qui perce compte.
    const tags = new Set<CharacterTag>();
    const recruitTag = aux.recruitTagById.get(r.ID);
    if (recruitTag) tags.add(recruitTag);
    const pierce = new Set<IgnoreDefenseSource>();
    for (const s of skills) for (const src of aux.pierceBySkill.get(s) ?? []) pierce.add(src);
    if (aux.eePierceIds.has(r.ID)) pierce.add('ee');
    if (pierce.size) {
      char.ignoreDefense = IGNORE_DEFENSE_SOURCES.filter((s) => pierce.has(s));
      tags.add('ignore-defense');
    }
    if (aux.baseByFusion.has(r.ID)) tags.add('core-fusion');
    if (tags.size) char.tags = TAG_ORDER.filter((t) => tags.has(t));

    const appearances = aux.appearancesOf.get(r.ID);
    if (appearances?.length) char.appearances = appearances;
    const costumes = aux.costumesByChar.get(r.ID);
    if (costumes?.length) char.costumes = costumes;
    const fusion = aux.fusionByBase.get(r.ID);
    if (fusion) char.coreFusion = fusion;
    const base = aux.baseByFusion.get(r.ID);
    if (base) char.originalCharacter = base;
    const fusionMeta = aux.fusionMetaByChar.get(r.ID);
    if (fusionMeta) {
      const levels: FusionLevel[] = (aux.fusionLevelsByGroup.get(fusionMeta.group) ?? [])
        .map((lr) => {
          // Skill_N_Level → niveau de la N-ième compétence de CETTE fusion (r.Skill_N).
          const skillLevels: Record<string, number> = {};
          for (let i = 1; i <= 23; i++) {
            const lvl = lr[`Skill_${i}_Level`];
            const skillId = r[`Skill_${i}`];
            if (lvl && skillId) skillLevels[skillId] = num(lvl);
          }
          return {
            level: num(lr.FusionLevel),
            item: lr.RequireItemID,
            cost: num(lr.RequireItemValue),
            skillLevels,
          };
        })
        .sort((a, b) => a.level - b.level);
      char.fusion = { group: fusionMeta.group, transStar: fusionMeta.transStar, levels };
    }

    return char;
  },

  key: (c) => c.id,
  schema: characterSchema,

  finalize: (_items, aux) => ({ ...aux.glossaries }),
};

/** Sortie du domaine perso (personnages + glossaires transverses). */
export interface CharacterData {
  characters: Record<string, Character>;
  glossaries: CharacterGlossaries;
}

/**
 * Compat orchestrateur : exécute la spec et assemble la `CharacterData`.
 * Source unique du savoir perso — l'ancien `generators/characters.ts` est retiré.
 */
export function buildCharacters(): CharacterData {
  const r = runSpec(characterSpec);
  return { characters: r.items, glossaries: r.extra as unknown as CharacterGlossaries };
}
