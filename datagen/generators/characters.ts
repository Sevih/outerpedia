/**
 * Générateur des PERSONNAGES (CharacterTemplet) — l'entité qui relie tout.
 *
 * Un perso référence : ses compétences (catalogue skills), son EE (équipement),
 * ses sets recommandés, et porte ses stats de base + identité (élément, classe,
 * sous-classe, rareté).
 *
 * Patron maison :
 *   - on RÉFÉRENCE par id (skills, ee) — pas de recopie ;
 *   - les libellés d'enum vivent dans des GLOSSAIRES définis une fois
 *     (elements/classes/subClasses) — l'item garde le slug stable ;
 *   - les stats sont stockées en NOMBRES BRUTS (fidélité + utilisables par le
 *     damage-calc) ; l'échelle (plat vs %) vit dans le glossaire `statScales`
 *     (source unique) → le front formate, le calc utilise le brut.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { LangDict } from '../lib/lang';
import { loadTextIndex, resolveText } from '../lib/text';
import { loadTable, num, splitCsv, type Row } from '../lib/tables';

const OUT = resolve('.gamedata/staging/characters');

/** Échelle d'affichage d'une stat. */
type StatScale = 'flat' | 'percent';

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

/** Un personnage jouable (source unique, référence skills/ee/sets par id). */
export interface Character {
  id: string;
  name: LangDict;
  /** Titre/épithète (« The Lone Avenger »). */
  nickname?: LangDict;
  /** Rareté de base (étoiles, BasicStar). */
  rarity: number;
  /** Slugs stables (libellés dans les glossaires). */
  element: string;
  class: string;
  subClass?: string;
  race: string;
  /** Icône de portrait (FaceIconID). */
  icon: string;
  /** Réfs vers le catalogue de compétences (Skill_1..23 non vides). */
  skills: string[];
  /** Réf vers l'équipement exclusif (EE), si le perso en a un. */
  ee?: string;
  /** Sets recommandés (réfs GroupID de set), si présents. */
  recommendedSets?: string[];
  /** Stats de base par slug (valeurs brutes ; échelle dans `statScales`). */
  stats: Record<string, StatRange>;
}

/** Glossaire générique slug → libellé localisé. */
type Glossary = Record<string, LangDict>;

/** Sortie du générateur. */
export interface CharacterData {
  characters: Record<string, Character>;
  glossaries: {
    elements: Glossary;
    classes: Glossary;
    subClasses: Record<string, { name: LangDict; desc?: LangDict }>;
    statScales: Record<string, StatScale>;
  };
}

export function buildCharacters(): CharacterData {
  const rows = loadTable('CharacterTemplet');
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

  const elements: Glossary = {};
  const classes: Glossary = {};
  const subClasses: Record<string, { name: LangDict; desc?: LangDict }> = {};

  const characters: Record<string, Character> = {};

  for (const r of rows) {
    if (r.Type !== 'CT_PC') continue; // personnages jouables uniquement

    const element = slugAfter(r.Element, 'CET_');
    const klass = slugAfter(r.Class, 'CCT_');
    const subClass = r.SubClass && r.SubClass !== 'NONE' ? r.SubClass.toLowerCase() : undefined;
    const race = slugAfter(r.Race, 'CRT_');

    // Glossaires (remplis à la volée, une entrée par slug rencontré).
    if (element) elements[element] ??= resolveText(tsys, `SYS_ELEMENT_${element.toUpperCase()}`);
    if (klass) classes[klass] ??= resolveText(tsys, `SYS_CLASS_${klass.toUpperCase()}`);
    if (subClass && !subClasses[subClass]) {
      const up = subClass.toUpperCase();
      const desc = resolveText(tsys, `SYS_CLASS_INFO_${up}`);
      subClasses[subClass] = { name: resolveText(tsys, `SYS_CLASS_NAME_${up}`) };
      if (desc.en) subClasses[subClass].desc = desc;
    }

    const skills: string[] = [];
    for (let i = 1; i <= 23; i++) if (r[`Skill_${i}`]) skills.push(r[`Skill_${i}`]);

    const char: Character = {
      id: r.ID,
      name: resolveText(tchar, r.NameID),
      rarity: num(r.BasicStar),
      element,
      class: klass,
      race,
      icon: r.FaceIconID ?? r.ID,
      skills,
      stats: extractStats(r),
    };
    const nick = resolveText(tchar, r.NickNameID);
    if (nick.en) char.nickname = nick;
    if (subClass) char.subClass = subClass;
    const ee = eeByChar.get(r.ID);
    if (ee) char.ee = ee;
    const sets = splitCsv(r.RecommandSetOptionID ?? '');
    if (sets.length) char.recommendedSets = sets;

    characters[r.ID] = char;
  }

  const statScales: Record<string, StatScale> = {};
  for (const d of STAT_DEFS) statScales[d.slug] = d.scale;

  return { characters, glossaries: { elements, classes, subClasses, statScales } };
}

/** Slug d'un enum en retirant un préfixe connu (`CET_FIRE` → `fire`). */
function slugAfter(v: string | undefined, prefix: string): string {
  if (!v) return '';
  return (v.startsWith(prefix) ? v.slice(prefix.length) : v).toLowerCase();
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

// --- staging -----------------------------------------------------------------

function main(): void {
  mkdirSync(OUT, { recursive: true });
  const data = buildCharacters();
  writeFileSync(resolve(OUT, 'characters.json'), JSON.stringify(data, null, 2));

  const list = Object.values(data.characters);
  console.log(`personnages (CT_PC): ${list.length}`);
  console.log(`  avec EE: ${list.filter((c) => c.ee).length}`);
  console.log(`  avec sous-classe: ${list.filter((c) => c.subClass).length}`);
  console.log(
    `glossaires: ${Object.keys(data.glossaries.elements).length} éléments, ${Object.keys(data.glossaries.classes).length} classes, ${Object.keys(data.glossaries.subClasses).length} sous-classes`,
  );

  // Échantillon lisible.
  const sample = list.slice(0, 4).map((c) => ({
    id: c.id,
    name: c.name.en,
    nickname: c.nickname?.en,
    identity: `${c.rarity}★ ${data.glossaries.elements[c.element]?.en} ${data.glossaries.classes[c.class]?.en}/${c.subClass ? data.glossaries.subClasses[c.subClass]?.name.en : '-'}`,
    skills: c.skills.length,
    ee: c.ee,
    stats: Object.fromEntries(Object.entries(c.stats).map(([k, v]) => [k, `${v.min}→${v.max}`])),
  }));
  writeFileSync(resolve(OUT, 'sample.json'), JSON.stringify(sample, null, 2));
  console.log(`staging: ${OUT}`);
}

main();
