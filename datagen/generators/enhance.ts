/**
 * Générateur — RÈGLES D'AMÉLIORATION des équipements (page détail).
 *
 * Tout vient des tables du jeu :
 *   - `ItemEnchantTemplet.UpgradeFactorforOP` : croissance de la main stat par
 *     niveau d'enchant (+0..+10) — base × (1 + 0.4 × niveau) ;
 *   - `ItemBreakLimitTemplet` (déjà extrait dans breakLimits) : +5 % par
 *     palier de breakthrough ;
 *   - `SingularityEquipEnchantTemplet` : ascension Singularity — activation
 *     (+15 % au +10, +3 reforges, +5 niveaux max), pas +11..+15 (facteurs,
 *     coûts, taux de succès, matériaux), reroll ;
 *   - `ItemSpecialOptionTemplet` groupes `AddSpecialOptionGroupID` : options
 *     BONUS débloquées au +15 — un groupe OFFENSIF (armes/amulettes) et un
 *     DÉFENSIF (pièces d'armure). Le GRADE (C/B/A/S/S+), sa COULEUR et la
 *     valeur de chaque palier sont déclarés dans la description du jeu
 *     (`<color=#27D054>C</color> … <color=#0D99DA>20%</color>`) — on les
 *     parse tels quels, zéro barème écrit main.
 */
import { loadTable, num, numf } from '../lib/tables';
import { loadTextIndex, resolveText } from '../lib/text';
import { slugEnum } from '../lib/enums';
import type { LangDict } from '../lib/lang';

export interface AscensionMaterial {
  id: string;
  count: number;
  name: LangDict;
  icon: string;
  /** Grade slug (cadre de rareté de la tuile). */
  grade: string;
  /** Description officielle (tooltip) — absente si l'item n'a pas de _DESC. */
  desc?: LangDict;
}

export interface AscensionStep {
  /** Niveau atteint (+11..+15). */
  to: number;
  /** Facteur de main stat ajouté par ce pas (0.1 / 0.2). */
  factor: number;
  price: number;
  /** Taux de succès en % (SuccessRate / 10000). */
  rate: number;
  materials: AscensionMaterial[];
}

/** Un grade d'un bonus +15 : plage de valeurs + couleur + taux, tels quels du jeu. */
export interface AscensionGrade {
  grade: string;
  /** Couleur hex déclarée par le jeu dans la description du grade. */
  color: string;
  /** Valeur ou plage (« 20% » / « 20%-26% »), format du jeu. */
  range: string;
  /** Variante L/D des effets défensifs par élément (F/W/E dans `range`). */
  rangeAlt?: string;
  /** Poids de tirage du grade au sein de l'effet (% arrondi). */
  rate: number;
}

/** Un bonus +15 : effet nommé + répartition par grades. */
export interface AscensionBonus {
  name: LangDict;
  icon: string;
  /** Chance de tirer CET effet dans le groupe (%, 1 décimale). */
  chance: number;
  grades: AscensionGrade[];
  /** Ligne élémentaire agrégée avec 2 plages (défensif) : libellés des branches. */
  splitLabels?: { primary: string; alt: string };
}

export interface EnhanceRules {
  /** Croissance par niveau d'enchant (UpgradeFactorforOP). */
  enhanceFactor: number;
  maxEnhance: number;
  /** Bonus par palier de breakthrough (facteurs breakLimits, constants). */
  tierFactor: number;
  singularity: {
    /** Conditions d'éligibilité (grade slug + étoiles mini). */
    minGrade: string;
    minStar: number;
    /** Activation au +10 : facteur immédiat + reforges/niveaux supplémentaires. */
    activation: { factor: number; price: number; rate: number; materials: AscensionMaterial[] };
    addReforge: number;
    addLevels: number;
    steps: AscensionStep[];
    /** Bonus au +15 par groupe d'équipement (armes/amulettes vs armure). */
    bonuses: { weapon: AscensionBonus[]; armor: AscensionBonus[] };
  };
}

export function buildEnhanceRules(): EnhanceRules {
  const enchant = loadTable('ItemEnchantTemplet').filter(
    (r) => r.ItemSubType === 'ITS_EQUIP_WEAPON',
  );
  const enhanceFactor = numf(enchant[0]?.UpgradeFactorforOP) || 0.4;
  const maxEnhance = Math.max(...enchant.map((r) => num(r.EnchantLevel)));

  const items = new Map(loadTable('ItemTemplet').map((r) => [r.ID, r]));
  const textItem = loadTextIndex('TextItem');
  const materialsOf = (r: Record<string, string>): AscensionMaterial[] => {
    const out: AscensionMaterial[] = [];
    for (const i of [1, 2, 3]) {
      const id = r[`RequireMaterial${i}`];
      const count = num(r[`MaterialCount${i}`]);
      if (!id || id === '0' || !count) continue;
      const it = items.get(id);
      // Description : convention `_NAME` → `_DESC` (comme le catalogue items).
      const descKey = it?.NameID?.replace(/_NAME$/, '_DESC');
      const desc = descKey ? resolveText(textItem, descKey) : null;
      out.push({
        id,
        count,
        name: it ? resolveText(textItem, it.NameID) : { en: id, jp: id, kr: id, zh: id },
        icon: it?.IconName ?? '',
        grade: slugEnum(it?.ItemGrade) || 'normal',
        ...(desc?.en ? { desc } : {}),
      });
    }
    return out;
  };

  const singAll = loadTable('SingularityEquipEnchantTemplet');
  const sing = singAll.filter((r) => r.ItemSubType === 'ITS_EQUIP_WEAPON');
  const act = sing.find((r) => r.EnchantType === 'SET_ENCHANT');
  const stepRows = sing
    .filter((r) => r.EnchantType === 'SET_EQUIP_ENHANCE')
    .sort((a, b) => num(a.NextEnchantLevel) - num(b.NextEnchantLevel));

  // Bonus +15 : chaque ligne du groupe est UN palier (grade + valeur + poids),
  // grade/couleur/valeur déclarés dans la description (`<color=#hex>C</color>
  // … <color=#0D99DA>20%</color>`). On regroupe par NameID puis par grade.
  const textSkill = loadTextIndex('TextSkill');
  const specialRows = loadTable('ItemSpecialOptionTemplet');
  const GRADE_TAG = /<color=#([0-9A-Fa-f]{6,8})>([^<]+)<\/color>/;
  const VALUE_TAG = /<color=#0D99DA>([^<]+)<\/color>/i;
  const bonusesOf = (groupId: string | undefined): AscensionBonus[] => {
    if (!groupId || groupId === '0') return [];
    const rows = specialRows.filter((r) => r.GroupID === groupId);
    const total = rows.reduce((s, r) => s + num(r.Rate), 0);
    type Tier = { grade: string; color: string; value: string; rate: number };
    const byName = new Map<string, { name: LangDict; icon: string; tiers: Tier[] }>();
    for (const r of rows) {
      const descEn = resolveText(textSkill, r.DescID).en;
      const g = GRADE_TAG.exec(descEn);
      const v = VALUE_TAG.exec(descEn);
      const cur = byName.get(r.NameID) ?? {
        name: resolveText(textSkill, r.NameID),
        icon: r.IconName ?? '',
        tiers: [],
      };
      cur.tiers.push({
        grade: g?.[2].trim() ?? '?',
        color: g ? `#${g[1]}` : '',
        value: v?.[1].trim() ?? '',
        rate: num(r.Rate),
      });
      byName.set(r.NameID, cur);
    }
    type Entry = { nameID: string; bonus: AscensionBonus };
    const entries: Entry[] = [];
    for (const [nameID, b] of byName) {
      const effectTotal = b.tiers.reduce((s, t) => s + t.rate, 0);
      const byGrade = new Map<string, Tier[]>();
      for (const t of b.tiers) {
        const list = byGrade.get(t.grade) ?? [];
        list.push(t);
        byGrade.set(t.grade, list);
      }
      const grades: AscensionGrade[] = [];
      for (const [grade, tiers] of byGrade) {
        const values = tiers.map((t) => t.value).filter(Boolean);
        const range =
          values.length > 1 && values[0] !== values[values.length - 1]
            ? `${values[0]}–${values[values.length - 1]}`
            : (values[0] ?? '');
        grades.push({
          grade,
          color: tiers[0].color,
          range,
          rate: Math.round((tiers.reduce((s, t) => s + t.rate, 0) / effectTotal) * 100),
        });
      }
      entries.push({
        nameID,
        bonus: {
          name: b.name,
          icon: b.icon,
          chance: Math.round((effectTotal / total) * 1000) / 10,
          grades,
        },
      });
    }

    // Agrégation des 5 variantes élémentaires en UNE ligne (présentation V2) :
    // offensif → plages identiques, libellé « vs <Element> » ; défensif →
    // deux plages distinctes (F/W/E vs L/D) portées par range/rangeAlt.
    const ELEM_OFF = /^UO_SINGULAREQUIP_DMG_TO_(EARTH|WATER|FIRE|LIGHT|DARK)_NAME$/;
    const ELEM_DEF = /^UO_SINGULAREQUIP_DMG_REDUCE_BY_(EARTH|WATER|FIRE|LIGHT|DARK)_NAME$/;
    const PRIMARY = new Set(['EARTH', 'WATER', 'FIRE']);
    const collapse = (
      matches: { el: string; bonus: AscensionBonus }[],
      split: boolean,
    ): AscensionBonus | null => {
      if (!matches.length) return null;
      const rep = matches[0].bonus;
      const name = { ...rep.name, en: rep.name.en.replace(/ vs \w+$/, ' vs <Element>') };
      if (!split) {
        return {
          ...rep,
          name,
          chance: Math.round(matches.reduce((s, m) => s + m.bonus.chance, 0) * 10) / 10,
        };
      }
      const primary = matches.find((m) => PRIMARY.has(m.el))?.bonus ?? rep;
      const alt = matches.find((m) => !PRIMARY.has(m.el))?.bonus;
      const grades = primary.grades.map((g) => ({
        ...g,
        ...(alt ? { rangeAlt: alt.grades.find((x) => x.grade === g.grade)?.range } : {}),
      }));
      return {
        ...primary,
        name,
        chance: Math.round(matches.reduce((s, m) => s + m.bonus.chance, 0) * 10) / 10,
        grades,
        ...(alt ? { splitLabels: { primary: 'F/W/E', alt: 'L/D' } } : {}),
      };
    };
    const out: AscensionBonus[] = [];
    const off: { el: string; bonus: AscensionBonus }[] = [];
    const def: { el: string; bonus: AscensionBonus }[] = [];
    for (const e of entries) {
      const mo = ELEM_OFF.exec(e.nameID);
      const md = ELEM_DEF.exec(e.nameID);
      if (mo) off.push({ el: mo[1], bonus: e.bonus });
      else if (md) def.push({ el: md[1], bonus: e.bonus });
      else out.push(e.bonus);
    }
    for (const c of [collapse(off, false), collapse(def, true)]) if (c) out.push(c);
    return out.sort((a, b) => b.chance - a.chance);
  };
  const groupOf = (subType: string) =>
    singAll.find(
      (r) =>
        r.ItemSubType === subType && r.AddSpecialOptionGroupID && r.AddSpecialOptionGroupID !== '0',
    )?.AddSpecialOptionGroupID;
  const bonuses = {
    weapon: bonusesOf(groupOf('ITS_EQUIP_WEAPON')),
    armor: bonusesOf(groupOf('ITS_EQUIP_HELMET')),
  };

  return {
    enhanceFactor,
    maxEnhance,
    tierFactor: 0.05, // breakLimits.factors — constant sur toute la table, vérifié
    singularity: {
      minGrade: 'unique',
      minStar: 6,
      activation: {
        factor: act ? numf(act.UpgradeFactorforOP) : 0.15,
        price: num(act?.UpgradePrice),
        rate: num(act?.SuccessRate) / 10000,
        materials: act ? materialsOf(act) : [],
      },
      addReforge: num(act?.AddSmeltingCount),
      addLevels: num(act?.AddMaxLevel),
      steps: stepRows.map((r) => ({
        to: maxEnhance + num(r.NextEnchantLevel),
        factor: numf(r.UpgradeFactorforOP),
        price: num(r.UpgradePrice),
        rate: num(r.SuccessRate) / 10000,
        materials: materialsOf(r),
      })),
      bonuses,
    },
  };
}
