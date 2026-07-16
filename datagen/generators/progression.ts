/**
 * Générateur — PROGRESSION des personnages (section « Base Stats » des fiches).
 *
 * Tout vient des tables du jeu :
 *   - `CharacterEvolutionTemplet`      : échelle d'évolution par rareté de base
 *     (ev2..ev9, niveau requis) — les coûts varient par élément mais PAS les
 *     niveaux (validé), on ne stocke que l'échelle ;
 *   - `CharacterEvolutionStatTemplet`  : bonus de stats PAR PERSO à chaque
 *     évolution (3 slots RewardStatType/Value) ;
 *   - `CharacterMaxLevelTemplet`       : limit breaks (lv100→105→110→120) par
 *     (rareté, élément) — pièces de rappel, or, modificateur de stats ;
 *   - `CharacterTemplet` Skill_23/22   : buff PREMIUM (`BT_STAT_PREMIUM`) —
 *     stat + valeur (OAT_ADD = plat ÷10, OAT_RATE = per-mille de la stat) ;
 *   - `CharacterArchiveStatTemplet`    : courbe du CODEX (bonus % ATK/DEF/HP
 *     par niveau d'archive 1..11, per-mille, appliqué sur la stat de BASE) ;
 *   - `CharacterAwakening{Node,Level}Templet` : QUIRKS (arbres d'éveil de
 *     compte par élément / classe / sous-classe) — bonus au niveau MAX de
 *     chaque nœud (les valeurs par niveau sont cumulatives), séparés
 *     IOT_STAT (« blanc », couche awak de CalcFinalStat) vs IOT_BUFF
 *     (`BT_STAT_PREMIUM` sans condition, couche BuffValueRate) ;
 *   - `CharacterTemplet` Skill_8       : buffs PREMIUM du passif de
 *     transcendance par niveau (couche BuffValueRate, comme in-game).
 *
 * Le CALCUL des paliers (formule CalcFinalStat reverse-engineered, validée
 * 0-diff in-game par le gear-solver) vit côté app
 * (`src/lib/data/char-progression.ts`).
 */
import { loadTable, num, splitCsv, type Row } from '../lib/tables';
import { slugEnum } from '../lib/enums';

/** Un cran de l'échelle d'évolution (niveau requis pour l'évolution N). */
export interface EvolutionRung {
  ev: number;
  level: number;
}

export interface LimitBreakStep {
  step: number;
  requireLevel: number;
  maxLevel: number;
  /** Pièces de rappel nécessaires (CharBreakPieceQuantity). */
  pieces: number;
  /** Item de rappel (résolu via items.json côté app). */
  recallItemId: string;
  price: number;
  /** Modificateur de croissance au-delà du niveau 100 (per-mille). */
  statModifier: number;
}

export interface PremiumInfo {
  /** Slug de stat (atk, critical_rate…). */
  stat: string;
  /** flat = valeur brute ÷10 ; rate = per-mille de la stat du palier. */
  mode: 'flat' | 'rate';
  value: number;
}

/** Un bonus de stat brut (quirks / passif de transcendance). */
export interface StatBonus {
  /** Slug de stat (atk, critical_rate…). */
  stat: string;
  /** add = plat (mais per-mille pour les stats intrinsèquement %) ; rate = per-mille. */
  applying: 'add' | 'rate';
  value: number;
}

/** Bonus d'un groupe de quirks au niveau MAX, séparés par couche du jeu. */
export interface QuirkBlock {
  /** Nœuds IOT_STAT — couche « awak » de CalcFinalStat (portion blanche). */
  stat: StatBonus[];
  /** Nœuds IOT_BUFF (BT_STAT_PREMIUM sans condition) — couche BuffValueRate. */
  buff: StatBonus[];
}

export interface ProgressionData {
  /** Rareté de base → échelle d'évolution (ordonnée). */
  evolutions: Record<string, EvolutionRung[]>;
  /** Perso → évolution → bonus de stats (slugs, valeurs brutes). */
  evoRewards: Record<string, Record<string, Record<string, number>>>;
  /** `<rareté>_<élément>` → paliers de limit break (ordonnés). */
  limitBreak: Record<string, LimitBreakStep[]>;
  /** Perso → buff premium (passif de classe). */
  premium: Record<string, PremiumInfo>;
  /** Courbe du codex : index = niveau d'archive (0 = rien), per-mille sur la BASE. */
  codex: { atk: number; def: number; hp: number }[];
  /** Quirks (arbres d'éveil) au niveau max, par groupe applicable. */
  quirks: {
    elemental: Record<string, QuirkBlock>;
    class: Record<string, QuirkBlock>;
    subclass: Record<string, QuirkBlock>;
  };
  /** Skill de transcendance (Skill_8) → niveau → buffs premium actifs. */
  skill8: Record<string, Record<string, StatBonus[]>>;
}

/**
 * Index des enums d'éveil → slugs maison. VÉRIFIÉ contre les tables
 * (2026-07-16, via les `NodeNameID` des nœuds principaux qui NOMMENT leur
 * cible) : AAT_ELEMENTAL est 0-based (0=Earth…4=Dark) ; AAT_CLASS et
 * AAT_SUBCLASS sont 1-based (1=Defender…5=Healer ; 1=Attacker…10=Sage) —
 * d'où le `''` en tête de ces deux tableaux.
 */
const AWAKENING_ELEMENTS = ['earth', 'water', 'fire', 'light', 'dark'];
const AWAKENING_CLASSES = ['', 'defender', 'striker', 'ranger', 'mage', 'healer'];
const AWAKENING_SUBCLASSES = [
  '',
  'attacker',
  'bruiser',
  'wizard',
  'enchanter',
  'vanguard',
  'tactician',
  'sweeper',
  'phalanx',
  'reliever',
  'sage',
];

export function buildProgression(): ProgressionData {
  // --- Échelle d'évolution : niveaux communs à tous les éléments d'une rareté.
  const evolutions: Record<string, EvolutionRung[]> = {};
  for (const r of loadTable('CharacterEvolutionTemplet')) {
    const star = r.BasicStar;
    const rung: EvolutionRung = { ev: num(r.EvolutionLevel), level: num(r.RequireLevel) };
    const list = (evolutions[star] ??= []);
    const prev = list.find((x) => x.ev === rung.ev);
    if (!prev) list.push(rung);
    else if (prev.level !== rung.level)
      console.warn(`⚠ évolution ${star}/ev${rung.ev} : niveaux divergents entre éléments`);
  }
  for (const list of Object.values(evolutions)) list.sort((a, b) => a.ev - b.ev);

  // --- Bonus d'évolution par perso (3 slots par ligne).
  const evoRewards: ProgressionData['evoRewards'] = {};
  for (const r of loadTable('CharacterEvolutionStatTemplet')) {
    const byEv = (evoRewards[r.CharacterID] ??= {});
    const stats = (byEv[r.EvolutionLevel] ??= {});
    for (const i of [1, 2, 3]) {
      const st = r[`RewardStatType_${i}`];
      const v = num(r[`RewardValue_${i}`]);
      if (!st || st === 'ST_NONE' || !v) continue;
      const slug = slugEnum(st);
      stats[slug] = (stats[slug] ?? 0) + v;
    }
  }

  // --- Limit breaks par (rareté, élément).
  const limitBreak: ProgressionData['limitBreak'] = {};
  for (const r of loadTable('CharacterMaxLevelTemplet')) {
    const key = `${r.BasicStar}_${slugEnum(r.Element)}`;
    (limitBreak[key] ??= []).push({
      step: num(r.Step),
      requireLevel: num(r.RequireLevel),
      maxLevel: num(r.MaxLevel),
      pieces: num(r.CharBreakPieceQuantity),
      recallItemId: r.CharBreakPieceRecallItemID ?? '',
      price: num(r.Price),
      statModifier: num(r.LevelUpStatModifierAfter100),
    });
  }
  for (const list of Object.values(limitBreak)) list.sort((a, b) => a.step - b.step);

  // --- Premium : buff BT_STAT_PREMIUM du skill de classe (Skill_23, repli 22).
  const skillBuffs = new Map<string, Set<string>>();
  const levelRowsBySkill = new Map<string, Row[]>();
  for (const l of loadTable('CharacterSkillLevelTemplet')) {
    const set = skillBuffs.get(l.SkillID) ?? new Set<string>();
    for (const id of splitCsv(l.BuffID ?? '')) set.add(id);
    skillBuffs.set(l.SkillID, set);
    let rows = levelRowsBySkill.get(l.SkillID);
    if (!rows) levelRowsBySkill.set(l.SkillID, (rows = []));
    rows.push(l);
  }
  // Ligne de buff au niveau MAX (les valeurs par niveau sont cumulatives).
  const buffMaxRows = new Map<string, Row>();
  for (const b of loadTable('BuffTemplet')) {
    if (b.Type !== 'BT_STAT_PREMIUM' || !b.BuffID) continue;
    const prev = buffMaxRows.get(b.BuffID);
    if (!prev || num(b.Level) > num(prev.Level)) buffMaxRows.set(b.BuffID, b);
  }
  const buffRows = new Map<string, Row>();
  for (const b of loadTable('BuffTemplet')) {
    if (b.Type === 'BT_STAT_PREMIUM' && b.BuffID && !buffRows.has(b.BuffID))
      buffRows.set(b.BuffID, b);
  }
  const premium: ProgressionData['premium'] = {};
  for (const c of loadTable('CharacterTemplet')) {
    if (c.Type !== 'CT_PC') continue;
    const sid = c.Skill_23 || c.Skill_22;
    if (!sid) continue;
    for (const buffId of skillBuffs.get(sid) ?? []) {
      const b = buffRows.get(buffId);
      if (!b) continue;
      premium[c.ID] = {
        stat: slugEnum(b.StatType),
        mode: b.ApplyingType === 'OAT_RATE' ? 'rate' : 'flat',
        value: num(b.Value),
      };
      break;
    }
  }

  // --- Codex : courbe globale des bonus d'archive (per-mille, index = niveau).
  const codex: ProgressionData['codex'] = [{ atk: 0, def: 0, hp: 0 }];
  for (const r of loadTable('CharacterArchiveStatTemplet')
    .slice()
    .sort((a, b) => num(a.ID) - num(b.ID))) {
    codex.push({ atk: num(r.Atk_Rate), def: num(r.Def_Rate), hp: num(r.HP_Rate) });
  }

  // --- Quirks : nœuds d'éveil au niveau max, agrégés par groupe applicable.
  const awakLevels = new Map<string, Row>();
  for (const r of loadTable('CharacterAwakeningLevelTemplet')) {
    const gid = r.AwakeningLevelGroupID;
    if (!gid) continue;
    const prev = awakLevels.get(gid);
    if (!prev || num(r.AwakeningLevel) > num(prev.AwakeningLevel)) awakLevels.set(gid, r);
  }
  const quirks: ProgressionData['quirks'] = { elemental: {}, class: {}, subclass: {} };
  const quirkBonus = (row: Row): { kind: 'stat' | 'buff'; bonus: StatBonus } | undefined => {
    if (row.OptionType === 'IOT_BUFF' && row.BuffID) {
      const b = buffMaxRows.get(row.BuffID);
      // BT_STAT_PREMIUM inconditionnel uniquement — les buffs conditionnés
      // (vs boss…) ne changent pas la fiche de stats.
      if (!b || (b.BuffConditionType ?? 'NONE') !== 'NONE') return undefined;
      return {
        kind: 'buff',
        bonus: {
          stat: slugEnum(b.StatType),
          applying: b.ApplyingType === 'OAT_RATE' ? 'rate' : 'add',
          value: num(b.Value),
        },
      };
    }
    if (row.StatType && row.StatType !== 'ST_NONE') {
      return {
        kind: 'stat',
        bonus: {
          stat: slugEnum(row.StatType),
          applying: row.ApplyingType === 'OAT_RATE' ? 'rate' : 'add',
          value: num(row.OptionValue),
        },
      };
    }
    return undefined;
  };
  for (const node of loadTable('CharacterAwakeningNodeTemplet')) {
    const v = num(node.AwakeningApplyTypeValue);
    let bucket: Record<string, QuirkBlock> | undefined;
    let key: string | undefined;
    if (node.AwakeningApplyType === 'AAT_ELEMENTAL') {
      bucket = quirks.elemental;
      key = AWAKENING_ELEMENTS[v];
    } else if (node.AwakeningApplyType === 'AAT_CLASS') {
      bucket = quirks.class;
      key = AWAKENING_CLASSES[v];
    } else if (node.AwakeningApplyType === 'AAT_SUBCLASS') {
      bucket = quirks.subclass;
      key = AWAKENING_SUBCLASSES[v];
    }
    if (!bucket || !key) continue;
    const row = awakLevels.get(node.AwakeningLevelGroupID ?? '');
    if (!row) continue;
    const qb = quirkBonus(row);
    if (!qb) continue;
    const block = (bucket[key] ??= { stat: [], buff: [] });
    block[qb.kind].push(qb.bonus);
  }

  // --- Skill_8 : buffs premium du passif de transcendance, par niveau.
  const skill8: ProgressionData['skill8'] = {};
  for (const c of loadTable('CharacterTemplet')) {
    if (c.Type !== 'CT_PC' || !c.Skill_8 || skill8[c.Skill_8]) continue;
    const byLevel: Record<string, StatBonus[]> = {};
    for (const l of levelRowsBySkill.get(c.Skill_8) ?? []) {
      const bonuses: StatBonus[] = [];
      for (const bid of splitCsv(l.BuffID ?? '')) {
        const b = buffMaxRows.get(bid);
        if (!b || (b.BuffConditionType ?? 'NONE') !== 'NONE') continue;
        bonuses.push({
          stat: slugEnum(b.StatType),
          applying: b.ApplyingType === 'OAT_RATE' ? 'rate' : 'add',
          value: num(b.Value),
        });
      }
      if (bonuses.length) byLevel[l.SkillLevel] = bonuses;
    }
    if (Object.keys(byLevel).length) skill8[c.Skill_8] = byLevel;
  }

  return { evolutions, evoRewards, limitBreak, premium, codex, quirks, skill8 };
}
