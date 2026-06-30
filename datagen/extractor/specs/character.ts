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
import { loadTextIndex, resolveText } from '../../lib/text';
import { loadTable, num, splitCsv, type Row } from '../../lib/tables';
import { runSpec } from '../core/runner';
import type { ExtractorSpec } from '../core/spec';
import type { Schema } from '../core/validate';

/** Échelle d'affichage d'une stat. */
export type StatScale = 'flat' | 'percent';

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
  /** Position dans l'attaque en chaîne (ChainCombinationTemplet.Sequence). */
  chainType?: 'start' | 'join' | 'finish';
  /** Type de cadeau préféré (slug ; libellé dans le glossaire `gifts`). */
  gift?: string;
  /** Icône de portrait (FaceIconID). */
  icon: string;
  /** Réfs vers le catalogue de compétences (Skill_1..23 non vides). */
  skills: string[];
  /** Doubleur localisé (CVNameID résolu), si renseigné. */
  voiceActor?: LangDict;
  /** Réf vers l'équipement exclusif (EE), si le perso en a un. */
  ee?: string;
  /** Sets recommandés (réfs GroupID de set), si présents. */
  recommendedSets?: string[];
  /** Stats de base par slug (valeurs brutes ; échelle dans `statScales`). */
  stats: Record<string, StatRange>;
  /** Ids des apparences (skins) qui empruntent l'identité de ce perso. */
  appearances?: string[];
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
}

/** Contexte partagé pré-calculé une fois pour tout le lot. */
interface CharacterAux {
  tchar: Map<string, LangDict>;
  tsys: Map<string, LangDict>;
  eeByChar: Map<string, string>;
  /** id perso → Sequence d'attaque en chaîne (ChainCombinationTemplet). */
  chainSeqById: Map<string, string>;
  /** id perso → type de cadeau préféré (TrustTemplet.PresentTypeLike). */
  giftById: Map<string, string>;
  /** ids dont le nickname s'affiche en préfixe (CharacterExtraTemplet). */
  showNickNameIds: Set<string>;
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
  return v.replace(/^(VA|CV)\.\s*/, '').trim();
}

/** Extrait les stats non nulles (paires _Min/_Max) en valeurs brutes. */
function extractStats(r: Row): Record<string, StatRange> {
  const out: Record<string, StatRange> = {};
  for (const d of STAT_DEFS) {
    const min = num(r[`${d.col}_Min`]);
    const max = num(r[`${d.col}_Max`]);
    if (min !== 0 || max !== 0) out[d.slug] = { min, max };
  }
  return out;
}

const statRangeSchema: Schema = {
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
    gift: { kind: 'string', optional: true },
    icon: { kind: 'string' },
    skills: { kind: 'array', of: { kind: 'string' }, minItems: 1 },
    voiceActor: { kind: 'langDict', optional: true },
    ee: { kind: 'string', optional: true },
    recommendedSets: { kind: 'array', of: { kind: 'string' }, optional: true },
    stats: { kind: 'record', of: statRangeSchema },
    appearances: { kind: 'array', of: { kind: 'string' }, optional: true },
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
    // Entités réelles uniquement : bases visibles (roster) + core-fusions.
    // Les apparences (skins) empruntent une identité → exclues (cf. ownIdentity).
    const fusionIds = new Set(loadTable('CharacterFusionTemplet').map((r) => r.ChangeCharID));
    return loadTable('CharacterTemplet').filter(
      (r) =>
        r.Type === 'CT_PC' &&
        ((ownIdentity(r) && r.ShowMainPage === 'true') || fusionIds.has(r.ID)),
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
    const subClasses: CharacterGlossaries['subClasses'] = {};
    for (const r of rows) {
      const element = slugAfter(r.Element, 'CET_');
      const klass = slugAfter(r.Class, 'CCT_');
      const subClass = r.SubClass && r.SubClass !== 'NONE' ? r.SubClass.toLowerCase() : undefined;
      if (element) elements[element] ??= resolveText(tsys, `SYS_ELEMENT_${element.toUpperCase()}`);
      if (klass) classes[klass] ??= resolveText(tsys, `SYS_CLASS_${klass.toUpperCase()}`);
      if (subClass && !subClasses[subClass]) {
        const up = subClass.toUpperCase();
        const desc = resolveText(tsys, `SYS_CLASS_INFO_${up}`);
        subClasses[subClass] = { name: resolveText(tsys, `SYS_CLASS_NAME_${up}`) };
        if (desc.en) subClasses[subClass].desc = desc;
      }
    }

    const statScales: Record<string, StatScale> = {};
    for (const d of STAT_DEFS) statScales[d.slug] = d.scale;

    // Attaque en chaîne : Sequence par perso (0=Start, 1/2=Join, 3=Finish).
    const chainSeqById = new Map(
      loadTable('ChainCombinationTemplet').map((r) => [r.ID, r.Sequence]),
    );

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
        .filter((r) => r.ShowNickName === 'True')
        .map((r) => r.CharacterID),
    );

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

    // Apparences : toute ligne CT_PC sans identité propre est un skin de sa cible.
    const appearancesOf = new Map<string, string[]>();
    for (const r of loadTable('CharacterTemplet')) {
      if (r.Type !== 'CT_PC' || ownIdentity(r)) continue;
      const target = r.NameID.replace(/_Name$/, '');
      const list = appearancesOf.get(target);
      if (list) list.push(r.ID);
      else appearancesOf.set(target, [r.ID]);
    }

    return {
      tchar,
      tsys,
      eeByChar,
      chainSeqById,
      giftById,
      showNickNameIds,
      fusionByBase,
      baseByFusion,
      fusionMetaByChar,
      fusionLevelsByGroup,
      appearancesOf,
      glossaries: { elements, classes, subClasses, statScales, gifts },
    };
  },

  map(r, aux) {
    const skills: string[] = [];
    for (let i = 1; i <= 23; i++) if (r[`Skill_${i}`]) skills.push(r[`Skill_${i}`]);

    const char: Character = {
      id: r.ID,
      name: resolveText(aux.tchar, r.NameID),
      rarity: num(r.BasicStar),
      element: slugAfter(r.Element, 'CET_'),
      class: slugAfter(r.Class, 'CCT_'),
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
    const seq = aux.chainSeqById.get(r.ID);
    if (seq !== undefined) char.chainType = seq === '0' ? 'start' : seq === '3' ? 'finish' : 'join';
    const gift = aux.giftById.get(r.ID);
    if (gift) char.gift = slugAfter(gift, 'ITS_');
    // Doubleur PAR LANGUE de doublage (en=VA anglais, jp=seiyuu, …), pas une
    // traduction. Nouvel objet (ne pas partager le dict caché) + nettoyage du
    // sentinelle « 0 » (= pas de doublage pour cette langue).
    const cv = resolveText(aux.tchar, r.CVNameID);
    const va: LangDict = {
      en: cleanVoiceActor(cv.en),
      jp: cleanVoiceActor(cv.jp),
      kr: cleanVoiceActor(cv.kr),
      zh: cleanVoiceActor(cv.zh),
    };
    if (va.en || va.jp || va.kr || va.zh) char.voiceActor = va;
    const ee = aux.eeByChar.get(r.ID);
    if (ee) char.ee = ee;
    const sets = splitCsv(r.RecommandSetOptionID ?? '');
    if (sets.length) char.recommendedSets = sets;

    const appearances = aux.appearancesOf.get(r.ID);
    if (appearances?.length) char.appearances = appearances;
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

  coverage: {
    dir: 'data/legacy/character',
    fields: {
      // Donnée de jeu qu'on extrait.
      ID: 'extracted',
      Fullname: 'extracted',
      Fullname_jp: 'extracted',
      Fullname_kr: 'extracted',
      Fullname_zh: 'extracted',
      Rarity: 'extracted',
      Element: 'extracted',
      Class: 'extracted',
      SubClass: 'extracted',
      skills: 'extracted', // réf vers le catalogue skills (généré à part)
      Chain_Type: 'extracted', // ChainCombinationTemplet.Sequence
      gift: 'extracted', // TrustTemplet.PresentTypeLike
      VoiceActor: 'extracted', // CVNameID
      VoiceActor_jp: 'extracted',
      VoiceActor_kr: 'extracted',
      VoiceActor_zh: 'extracted',
      // Core-fusion : lien base ↔ évolution (CharacterFusionTemplet).
      hasCoreFusion: 'extracted', // dérivable de coreFusion
      coreFusionId: 'extracted', // = coreFusion (sur la base)
      originalCharacter: 'extracted', // = originalCharacter (sur la fusion)
      // Connaissance humaine → data/curated, pas l'extraction.
      rank: 'curated',
      role: 'curated',
      tags: 'curated',
      skill_priority: 'curated',
      video: 'curated',
      rank_pvp: 'curated',
      rank_by_transcend: 'curated',
      role_by_transcend: 'curated',
      limited: 'curated',
      // Extrait dans un dataset partagé (transcend.json), pas par perso.
      transcend: 'extracted', // CharacterTranscendentTemplet → byStar + overrides
      // Détail core-fusion porté par l'entité fusion (champ `fusion`).
      fusionType: 'extracted', // = l'entité est une fusion (originalCharacter présent)
      fusionRequirements: 'extracted', // fusion.transStar + somme des coûts
      costPerLevel: 'extracted', // fusion.levels[].cost
    },
  },
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
