/**
 * Générateur SOLVER — les tables dérivées finies que l'app desktop gear-solver
 * télécharge telles quelles (`data/generated/solver/*.json`). Port FIDÈLE de
 * `gear-solver/data/build.mjs` (source de vérité du contrat — ses commentaires
 * expliquent chaque choix ; ne rien « corriger » silencieusement).
 *
 * Différences assumées avec l'original (spec de portage, 2026-08-12) :
 *   - source = `.gamedata/parsed` via `loadTable` (mêmes colonnes que l'ancien
 *     dump json2 de l'ancien dépôt, archivé) ;
 *   - `effect_icon` curated SUPPRIMÉ — `ItemSpecialOptionTemplet.IconName`
 *     couvre 100 % des cas (le curated n'était qu'un fallback) ;
 *   - `set_icon` + prose des sets ← la génération equipment du MÊME build
 *     (paramètre `setsView`), plus l'ancien checkout ;
 *   - `sub-ticks` recomposé depuis `ItemOptionTemplet` (pools de subs des
 *     gears 5★/6★) — `item-stats-detail.json` n'existe plus ;
 *   - `dmgStat`/`dmgSec`/`noCrit` re-dérivés des tables brutes
 *     (`BT_SWAP_STAT_ATTACK` / `BT_DMG_OWNER_STAT` / crit −100 permanent).
 *
 * ⚠ CONTRAT app externe : enums moteur BRUTS (`ST_*`, `OAT_*`, `CCT_*`, slots
 * `weapon…boots/exclusive/ooparts`), textes EN en string simple. Aucun slug wiki.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadTable, type Row } from '../lib/tables';
import {
  computeCharacterIngredients,
  type CharacterIngredients,
  type CodexLevel,
} from './solver-ingredients';

const lang = 'English';

// ---- vue « sets » injectée depuis buildEquipment() (même build, source unique) --
interface SetsViewEffect {
  desc?: { en?: string };
  stat?: string;
  value?: string;
}
export interface SolverSetsView {
  [groupId: string]: {
    icon?: string;
    tiers: ({ '2p'?: SetsViewEffect | null; '4p'?: SetsViewEffect | null } | null)[];
  };
}

// Prose des bonus de set : desc du JEU quand la vue en a une (sets à buff —
// Revenge…), sinon SYNTHÈSE « <Label> +<valeur> » depuis le {stat, value} de
// la vue — le libellé historique exact (contrat de la référence gear-solver).
const SET_STAT_LABEL: Record<string, string> = {
  atk: 'Attack',
  def: 'Defense',
  hp: 'Health',
  critical_rate: 'Crit Chance',
  buff_chance: 'Effectiveness',
  buff_resist: 'Resilience',
  counter_rate: 'Counterattack Chance',
  e_cri_dmg_reduce: 'Crit DMG Reduc',
  vampiric: 'Lifesteal',
  pierce_power_rate: 'Penetration',
  critical_dmg_rate: 'Crit DMG',
  speed: 'Speed',
  enter_ap: 'Gains AP at the start of battle',
};
function setProse(e: SetsViewEffect | null | undefined): string | null {
  if (!e) return null;
  if (e.desc?.en) return e.desc.en;
  if (e.stat && e.value != null) {
    const label = SET_STAT_LABEL[e.stat];
    if (label) return `${label} +${e.value}`;
  }
  return null;
}

// ---- helpers fidèles à build.mjs ------------------------------------------------
const SLOT: Record<string, string> = {
  ITS_EQUIP_WEAPON: 'weapon',
  ITS_EQUIP_HELMET: 'helmet',
  ITS_EQUIP_ARMOR: 'armor',
  ITS_EQUIP_GLOVES: 'gloves',
  ITS_EQUIP_SHOES: 'boots',
  ITS_EQUIP_ACCESSORY: 'accessory',
  ITS_EQUIP_EXCLUSIVE: 'exclusive',
  ITS_EQUIP_OOPARTS: 'ooparts',
};
const GRADE: Record<string, string> = {
  IG_NORMAL: 'normal',
  IG_MAGIC: 'magic',
  IG_RARE: 'rare',
  IG_UNIQUE: 'unique',
};
// PRIEST → "Healer" : le fichier d'icône du jeu est `CM_Class_Healer.webp`.
const CLASS_NAME: Record<string, string> = {
  CCT_ATTACKER: 'Striker',
  CCT_MAGE: 'Mage',
  CCT_RANGER: 'Ranger',
  CCT_DEFENDER: 'Defender',
  CCT_PRIEST: 'Healer',
};

const TOKEN_RE = /\[[^\]]+\]/g;

function textMap(table: string): Map<string, string | null> {
  return new Map(loadTable(table).map((t) => [t.ID, t[lang] ?? null]));
}

/** `_num()` de build.mjs : 15.0 → "15", 1.5 → "1.5". */
function jsNum(x: number): string {
  return x === Math.trunc(x) ? String(Math.trunc(x)) : String(x);
}

function isPermille(buff: Row | null): boolean {
  if (!buff) return false;
  if (buff.ApplyingType === 'OAT_RATE') return true;
  const st = buff.StatType ?? '';
  if (st.includes('_RATE') || st.includes('_DMG')) return true;
  const t = buff.Type ?? '';
  // Déclencheur de contre-attaque (« Punishment ») : Value = CHANCE per-mille
  // avec ST_NONE/OAT_NONE — sans cette règle il rendrait « 187 » au lieu de 18.7%.
  if (t === 'BT_RUN_FIRST_SKILL_ON_TURN_END_DEFENDER') return true;
  return t === 'BT_ADDITIVE_TURN' || t.includes('_ENHANCE');
}

function fmtValue(buff: Row | null): string {
  if (!buff) return '?';
  const v = Number.parseInt(buff.Value ?? '0', 10) || 0;
  return isPermille(buff) ? `${jsNum(Math.abs(v) / 10)}%` : String(Math.abs(v));
}

function fmtTurn(buff: Row | null): string {
  const td = (buff?.TurnDuration ?? '').toString();
  return /^\d+$/.test(td) ? td : '?';
}

export interface SolverFiles {
  /** nom de fichier (sans dossier) → contenu, dans l'ORDRE d'émission de build.mjs. */
  files: [string, unknown][];
  /** `{hash, builtAt}` — idempotent contre le version.json COMMITTÉ. */
  version: { hash: string; builtAt: string };
}

export function buildSolver(inputs: { setsView: SolverSetsView }): SolverFiles {
  const files: [string, unknown][] = [];
  const emit = (name: string, data: unknown): void => {
    files.push([name, data]);
  };

  const textItem = textMap('TextItem');
  const textChar = textMap('TextCharacter');
  const textSystem = textMap('TextSystem');
  const textSkill = textMap('TextSkill');

  // ---- flag « show nickname » (Gnosis Dahlia, M.S.Ame, …) ----
  const showNickName = new Set<string>();
  for (const r of loadTable('CharacterExtraTemplet')) {
    if (r.CharacterID && r.ShowNickName === 'True') showNickName.add(String(r.CharacterID));
  }

  // ---- options : IOT_STAT direct, IOT_BUFF → renvoi BuffTemplet ----
  const options: Record<string, { st?: string; ap?: string; v?: number; buffId?: string }> = {};
  for (const o of loadTable('ItemOptionTemplet')) {
    if (o.OptionType === 'IOT_STAT') {
      options[o.ID] = { st: o.StatType, ap: o.ApplyingType, v: Number(o.OptionValue) };
    } else if (o.OptionType === 'IOT_BUFF' && o.BuffID) {
      options[o.ID] = { buffId: o.BuffID };
    }
  }
  emit('options.json', options);

  // ---- buffs : BID_ITEM_STAT_OOPARTS_* / BID_CEQUIP_MAIN_* par niveau ----
  const buffTemplet = loadTable('BuffTemplet');
  const eeCondByBuffId = new Map<string, string>();
  for (const b of buffTemplet) {
    const bid = b.BuffID;
    if (!bid || !bid.startsWith('BID_CEQUIP_MAIN_')) continue;
    if (!eeCondByBuffId.has(bid)) eeCondByBuffId.set(bid, b.BuffConditionType ?? 'NONE');
  }
  // Libellé façon jeu d'une main EE — préfère la clé par élément du jeu
  // (`SYS_STAT_<…>_TARGET_<ELEMENT>`), sinon compose « <Stat> vs <Élément> ».
  const EE_BUFF_PREFIX_STAT_KEY: Record<string, string> = {
    DMG: 'SYS_STAT_DMG_BOOST',
    DMG_REDUCE: 'SYS_STAT_DMG_REDUCE_RATE',
    BUFF_CHANCE: 'SYS_STAT_BUFF_CHANCE',
    BUFF_CRITICAL_RATE: 'SYS_STAT_CRITICAL_RATE',
    ACCURACY: 'SYS_STAT_ACCURACY',
  };
  const EE_TRAILING_MODIFIERS = ['FIRE', 'WATER', 'EARTH', 'LIGHT', 'DARK', 'CORE'];
  function eeMainLabel(buffId: string): string | null {
    if (!buffId.startsWith('BID_CEQUIP_MAIN_')) return null;
    const rest = buffId.slice('BID_CEQUIP_MAIN_'.length);
    let modifier: string | null = null;
    let statPrefix = rest;
    for (const mod of EE_TRAILING_MODIFIERS) {
      if (rest.endsWith(`_${mod}`)) {
        modifier = mod;
        statPrefix = rest.slice(0, -(mod.length + 1));
        break;
      }
    }
    const statKey = EE_BUFF_PREFIX_STAT_KEY[statPrefix];
    if (!statKey) return null;
    const statLabel = textSystem.get(statKey);
    if (!statLabel) return null;
    if (!modifier || modifier === 'CORE') return statLabel;
    const specific = textSystem.get(`${statKey}_TARGET_${modifier}`);
    if (specific)
      return specific
        .replace(/\\n|\r?\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    const elLabel = textSystem.get(`SYS_ELEMENT_${modifier}`);
    return elLabel ? `${statLabel} vs ${elLabel}` : statLabel;
  }

  const buffs: Record<
    string,
    ({ st: string; ap?: string; v: number; combatOnly?: true; name?: string } | undefined)[]
  > = {};
  for (const b of buffTemplet) {
    const bid = b.BuffID;
    if (!bid) continue;
    if (!(bid.startsWith('BID_ITEM_STAT_OOPARTS_') || bid.startsWith('BID_CEQUIP_MAIN_'))) continue;
    if (!b.StatType || b.StatType === 'ST_NONE') continue;
    const lv = Number(b.Level);
    if (!Number.isFinite(lv) || lv < 1) continue;
    const combatOnly = bid.startsWith('BID_CEQUIP_MAIN_') && eeCondByBuffId.get(bid) !== 'NONE';
    const entry: { st: string; ap?: string; v: number; combatOnly?: true; name?: string } = {
      st: b.StatType,
      ap: b.ApplyingType,
      v: Number(b.Value),
    };
    if (combatOnly) entry.combatOnly = true;
    if (bid.startsWith('BID_CEQUIP_MAIN_')) {
      const label = eeMainLabel(bid);
      if (label) entry.name = label;
    }
    (buffs[bid] ??= [])[lv - 1] = entry;
  }
  emit('buffs.json', buffs);

  // ---- equipment ----
  // Icône d'effet d'option unique : ItemSpecialOptionTemplet.IconName par
  // GroupID — couvre 100 % (l'ancien fallback curé est supprimé, spec).
  const itemTemplet = loadTable('ItemTemplet');
  const specialOptRows = loadTable('ItemSpecialOptionTemplet');
  const isoIconByGroup = new Map<string, string>();
  for (const s of specialOptRows) {
    const gid = String(s.GroupID ?? '');
    if (gid && s.IconName && !isoIconByGroup.has(gid)) isoIconByGroup.set(gid, s.IconName);
  }
  // set_icon + prose par tier ← la vue equipment du même build (mapping
  // non-linéaire de l'icône — Speed 13 → TI_Icon_Set_Enchant_15 — déjà résolu là).
  const { setsView } = inputs;

  const equipment: Record<string, unknown> = {};
  for (const it of itemTemplet) {
    const slot = SLOT[it.ItemSubType ?? ''];
    if (!slot) continue; // gear uniquement
    const armorSetId = it.SetOptionID && it.SetOptionID !== '0' ? it.SetOptionID : null;
    equipment[it.ID] = {
      slot,
      grade: GRADE[it.ItemGrade ?? ''] ?? null,
      star: Number(it.BasicStar) || null,
      classLimit: it.ClassLimit === 'CCT_NONE' ? null : it.ClassLimit,
      setId: it.UniqueOptionID && it.UniqueOptionID !== '0' ? it.UniqueOptionID : null,
      armorSetId,
      name: textItem.get(it.NameID ?? '') ?? null,
      mainGroup: it.MainOptionGroupID ?? null,
      subGroup: it.SubOptionGroupID ?? null,
      image: it.IconName || null,
      effectIcon: it.UniqueOptionID
        ? (isoIconByGroup.get(String(it.UniqueOptionID).split(',')[0]) ?? null)
        : null,
      armorSetIcon: armorSetId ? (setsView[armorSetId]?.icon ?? null) : null,
      class: CLASS_NAME[it.ClassLimit ?? ''] ?? null,
    };
  }
  emit('equipment.json', equipment);

  // ---- enhance : constantes + courbes d'XP cumulée par (slot, grade, star) ----
  const enhanceFactor = 0.4;
  const tierFactor = 0.05;
  const maxEnhanceLevel = 10;
  const expCurves: Record<string, number[]> = {};
  for (const r of loadTable('ItemEnchantTemplet')) {
    const slot = SLOT[r.ItemSubType ?? ''];
    if (!slot) continue;
    const lv = Number(r.EnchantLevel);
    if (lv < 0 || lv > maxEnhanceLevel) continue;
    for (const [grade, gradeKey] of [
      ['normal', 'Normal'],
      ['magic', 'Magic'],
      ['rare', 'Rare'],
      ['unique', 'Unique'],
    ] as const) {
      for (let star = 1; star <= 6; star++) {
        const v = r[`${gradeKey}_${star}`];
        if (v === undefined) continue;
        const key = `${slot}|${grade}|${star}`;
        (expCurves[key] ??= Array<number>(maxEnhanceLevel + 1).fill(0))[lv] = Number(v);
      }
    }
  }
  const singActivations = new Set<number>();
  const singStepsBySlot: Record<string, Record<number, number>> = {};
  for (const r of loadTable('SingularityEquipEnchantTemplet')) {
    const slot = SLOT[r.ItemSubType ?? ''];
    if (!slot) continue;
    const factor = Number(r.UpgradeFactorforOP);
    if (r.EnchantType === 'SET_ENCHANT') singActivations.add(factor);
    else if (r.EnchantType === 'SET_EQUIP_ENHANCE') {
      const next = Number(r.NextEnchantLevel);
      (singStepsBySlot[slot] ??= {})[next] = factor;
    }
  }
  const activation = [...singActivations][0] ?? 0;
  const slotSteps = Object.values(singStepsBySlot)[0] ?? {};
  const singularitySteps = Object.keys(slotSteps)
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => slotSteps[Number(k)]);
  emit('enhance.json', {
    enhanceFactor,
    tierFactor,
    maxEnhanceLevel,
    singularity: { activation, steps: singularitySteps },
    expCurves,
  });

  // ---- sets + singularity-options + ee-passives (une passe ItemSpecialOption) ----
  const buffByID = new Map<string, Row>();
  const buffByIDLevel = new Map<string, Row>();
  for (const b of buffTemplet) {
    const cur = buffByID.get(b.BuffID ?? '');
    if (!cur || Number(b.Level) > Number(cur.Level)) buffByID.set(b.BuffID ?? '', b);
    buffByIDLevel.set(`${b.BuffID}|${b.Level}`, b);
  }
  const BUFF_TYPE_TO_STAT: Record<string, string> = {
    BT_DMG: 'ST_DMG_BOOST',
    BT_DMG_TARGET_BREAK: 'ST_DMG_BOOST',
    BT_DMG_REDUCE: 'ST_DMG_REDUCE_RATE',
  };
  // Sets « comeback » (Revenge/Patience/Swiftness) : Value = MAXIMUM à PV
  // manquants pleins — pas une stat de fiche → aucun bonus numérique émis,
  // la prose porte le sens.
  const CONDITIONAL_OWNER_BUFF_TYPES = new Set([
    'BT_STAT_OWNER_LOST_HP_RATE',
    'BT_STAT_OWNER_LOST_HP_RATE_HALF',
  ]);
  function resolveSetEffectEntry(
    stat: string | undefined,
    ap: string | undefined,
    value: string | undefined,
    buffId: string | undefined,
    setLevel: number,
  ): { st: string; ap?: string; v: number } | null {
    if (stat && stat !== 'ST_NONE') return { st: stat, ap, v: Number(value) };
    if (!buffId) return null;
    const b = buffByIDLevel.get(`${buffId}|${setLevel}`);
    if (!b) return null;
    if (CONDITIONAL_OWNER_BUFF_TYPES.has(b.Type ?? '')) return null;
    if (b.StatType && b.StatType !== 'ST_NONE')
      return { st: b.StatType, ap: b.ApplyingType, v: Number(b.Value) };
    const mapped = BUFF_TYPE_TO_STAT[b.Type ?? ''];
    // BT_DMG_REDUCE sur ENEMY_TEAM stocke un négatif — on émet la magnitude.
    if (mapped && b.Value != null)
      return { st: mapped, ap: b.ApplyingType ?? 'OAT_RATE', v: Math.abs(Number(b.Value)) };
    return null;
  }
  // GroupIDs des EE : la 1re part de l'UniqueOptionID d'un item EXCLUSIVE.
  const eeGroupIds = new Set<string>();
  for (const it of itemTemplet) {
    if (it.ItemSubType !== 'ITS_EQUIP_EXCLUSIVE') continue;
    for (const g of String(it.UniqueOptionID ?? '').split(',')) if (g) eeGroupIds.add(g);
  }

  interface SetOut {
    name: string | null;
    desc: string | null;
    levels: {
      level: number;
      p2: { st: string; ap?: string; v: number } | null;
      p4: { st: string; ap?: string; v: number } | null;
      p2_desc: string | null;
      p4_desc: string | null;
    }[];
  }
  const sets: Record<string, SetOut> = {};
  const singularityOptions: Record<string, unknown> = {};
  const eePassives: Record<
    string,
    { levelThreshold: number; st?: string; ap?: string; v: number }[]
  > = {};
  for (const s of specialOptRows) {
    const initialDesc = textItem.get(s.DescID ?? '') ?? textItem.get(s.SimpleDescID ?? '') ?? null;
    const g = (sets[s.GroupID ?? ''] ??= {
      name: textItem.get(s.NameID ?? '') ?? null,
      desc: initialDesc,
      levels: [],
    });
    g.desc ??= initialDesc;
    const setLevel = Number(s.Level);
    // setLevel 1 = palier 4★ (tiers[0] de la vue equipment), 2 = palier 6★ (tiers[1]).
    const tierView = setsView[s.GroupID ?? '']?.tiers?.[setLevel - 1];
    g.levels.push({
      level: setLevel,
      p2: resolveSetEffectEntry(
        s.StatType_2P,
        s.ApplyingType_2P,
        s.OptionValue_2P,
        s.BuffID_2P,
        setLevel,
      ),
      p4: resolveSetEffectEntry(
        s.StatType_4P,
        s.ApplyingType_4P,
        s.OptionValue_4P,
        s.BuffID_4P,
        setLevel,
      ),
      p2_desc: setProse(tierView?.['2p']),
      p4_desc: setProse(tierView?.['4p']),
    });
    // Options Singularité (groupes 30000/31000) — TOUTES émises ; seules les
    // inconditionnelles BT_STAT_PREMIUM comptent hors combat (combatOnly sinon).
    if (
      s.OptionType === 'IOT_BUFF' &&
      s.BuffID &&
      (s.GroupID === '30000' || s.GroupID === '31000')
    ) {
      const buff = buffByID.get(s.BuffID);
      if (buff && buff.StatType && buff.StatType !== 'ST_NONE') {
        const unconditional =
          buff.Type === 'BT_STAT_PREMIUM' &&
          (!buff.BuffConditionType || buff.BuffConditionType === 'NONE');
        singularityOptions[s.ID] = {
          st: buff.StatType,
          ap: buff.ApplyingType,
          v: Number(buff.Value),
          name: textSkill.get(s.NameID ?? '') ?? null,
          desc: textSkill.get(s.DescID ?? '') ?? null,
          combatOnly: !unconditional,
        };
      }
    }
    // Passif EE à palier de niveau — split des BuffID à VIRGULES (bug Eris :
    // le lookup de la chaîne entière perdait aussi le passif SELF ; 7 EE touchés).
    if (s.BuffID && eeGroupIds.has(s.GroupID ?? '')) {
      for (const bid of String(s.BuffID).split(',')) {
        if (!bid) continue;
        const buff = buffByID.get(bid);
        const ok =
          buff &&
          buff.Type === 'BT_STAT_PREMIUM' &&
          buff.TargetType === 'ME' &&
          buff.BuffCreateType === 'PASSIVE' &&
          (buff.BuffConditionType ?? 'NONE') === 'NONE' &&
          buff.TurnDuration === '-1';
        if (ok) {
          (eePassives[s.GroupID ?? ''] ??= []).push({
            levelThreshold: Number(s.Level),
            st: buff.StatType,
            ap: buff.ApplyingType,
            v: Number(buff.Value),
          });
        }
      }
    }
  }
  emit('sets.json', sets);
  emit('singularity-options.json', singularityOptions);
  emit('ee-passives.json', eePassives);

  // ---- equipment-passives : texte du passif par palier de breakthrough ----
  const specialOptByID = new Map<string, Row>();
  for (const r of specialOptRows) if (!specialOptByID.has(r.ID)) specialOptByID.set(r.ID, r);
  const buffLevelsByID = new Map<string, Row[]>();
  for (const b of buffTemplet) {
    if (!b.BuffID) continue;
    const arr = buffLevelsByID.get(b.BuffID) ?? [];
    arr.push(b);
    buffLevelsByID.set(b.BuffID, arr);
  }
  for (const arr of buffLevelsByID.values()) arr.sort((a, b) => Number(a.Level) - Number(b.Level));

  function findBuff(buffIdStr: string, level: number, index = 0): Row | null {
    const ids = buffIdStr.split(',').map((s) => s.trim());
    const target = index === 0 ? ids[0] : (ids[index] ?? `${ids[0]}_${index + 1}`);
    const rows = buffLevelsByID.get(target) ?? [];
    return rows.find((b) => Number(b.Level) === level) ?? null;
  }
  function maxBuffLevel(buffIdStr: string): number {
    const first = buffIdStr.split(',')[0].trim();
    const rows = buffLevelsByID.get(first) ?? [];
    return rows.length ? Math.max(...rows.map((b) => Number(b.Level) || 1)) : 1;
  }
  function tokenValues(buffIdStr: string, level: number): Record<string, string> {
    const b0 = findBuff(buffIdStr, level, 0);
    const b2 = findBuff(buffIdStr, level, 1);
    const b4 = findBuff(buffIdStr, level, 3);
    const b5 = findBuff(buffIdStr, level, 4);
    const rate = b0 && b0.CreateRate ? `${jsNum(Number(b0.CreateRate) / 10)}%` : '?';
    const val = fmtValue(b0);
    const turn = fmtTurn(b0);
    const val2 = fmtValue(b2);
    const turn2 = fmtTurn(b2);
    const val4 = fmtValue(b4);
    const val5 = fmtValue(b5);
    return {
      '[Value]': val,
      '[+Value]': `+${val}`,
      '[-Value]': `-${val}`,
      '[Value2]': val2,
      '[+Value2]': `+${val2}`,
      '[-Value2]': `-${val2}`,
      '[Value4]': val4,
      '[Value5]': val5,
      '[Rate]': rate,
      '[RATE]': rate,
      '[Rate1]': rate,
      '[Turn]': turn,
      '[Turn1]': turn,
      '[+Turn]': turn,
      '[+Turn1]': turn,
      '[-Turn]': `-${turn}`,
      '[Turn2]': turn2,
    };
  }
  const substitute = (tpl: string, vals: Record<string, string>): string => {
    let text = tpl;
    for (const tok of new Set(tpl.match(TOKEN_RE) ?? [])) {
      if (vals[tok] !== undefined)
        text = text.split(tok).join(`<color=#28d9ed>${vals[tok]}</color>`);
    }
    return text;
  };

  // Talisman + EE passent par la table multi-tier ci-dessous, pas ici.
  const MULTI_TIER_SUBTYPES = new Set(['ITS_EQUIP_OOPARTS', 'ITS_EQUIP_EXCLUSIVE']);
  const equipmentPassives: Record<string, { name: string | null; textByTier: string[] }> = {};
  for (const it of itemTemplet) {
    if (!SLOT[it.ItemSubType ?? '']) continue;
    if (MULTI_TIER_SUBTYPES.has(it.ItemSubType ?? '')) continue;
    const uo = it.UniqueOptionID;
    if (!uo || uo === '0') continue;
    const opt = specialOptByID.get(String(uo).split(',')[0].trim());
    if (!opt) continue;
    const buffIdStr = opt.BuffID ?? '';
    if (!buffIdStr) continue;
    const descId = opt.DescID || opt.CustomCraftDescID;
    if (!descId) continue;
    const desc = textSkill.get(descId);
    if (!desc) continue;
    const maxLv = maxBuffLevel(buffIdStr);
    const textByTier: string[] = [];
    for (let lv = 1; lv <= maxLv; lv++)
      textByTier.push(substitute(desc, tokenValues(buffIdStr, lv)));
    equipmentPassives[it.ID] = { name: textSkill.get(opt.NameID ?? '') ?? null, textByTier };
  }
  emit('equipment-passives.json', equipmentPassives);

  // ---- multi-tier-passives : talisman/EE (base + palier +10) ----
  const multiTierPassives: Record<
    string,
    { name: string | null; tiers: { unlockLevel: number; isAdd: boolean; desc: string }[] }
  > = {};
  for (const it of itemTemplet) {
    if (!MULTI_TIER_SUBTYPES.has(it.ItemSubType ?? '')) continue;
    const uoIds = String(it.UniqueOptionID ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s && s !== '0');
    if (uoIds.length === 0) continue;
    const tiers: { unlockLevel: number; isAdd: boolean; desc: string }[] = [];
    let nameForItem: string | null = null;
    for (const uid of uoIds) {
      const opt = specialOptByID.get(uid);
      if (!opt) continue;
      const descId = opt.DescID || opt.CustomCraftDescID;
      const buffIdStr = opt.BuffID ?? '';
      if (!descId || !buffIdStr) continue;
      const descTpl = textSkill.get(descId);
      if (!descTpl) continue;
      nameForItem ??= textSkill.get(opt.NameID ?? '') ?? null;
      // Deux encodages coexistent (BuffID par palier vs BuffID partagé à deux
      // Levels) — le lookup au Level de la ligne, borné au max du buff, couvre
      // les deux (cf. build.mjs).
      const buffMaxLv = maxBuffLevel(buffIdStr);
      const lookupLv = Math.min(Number(opt.Level) || 1, buffMaxLv);
      tiers.push({
        unlockLevel: Number(opt.Level) || 1,
        isAdd: opt.IsAdd === 'True',
        desc: substitute(descTpl, tokenValues(buffIdStr, lookupLv)),
      });
    }
    if (tiers.length === 0) continue;
    tiers.sort((a, b) => a.unlockLevel - b.unlockLevel);
    multiTierPassives[it.ID] = { name: nameForItem, tiers };
  }
  emit('multi-tier-passives.json', multiTierPassives);

  // ---- gems : 15001..15054 = 9 stats × 6 niveaux, cross-check contre options ----
  const GEM_STAT_BY_INDEX = [
    { st: 'ST_ATK', ap: 'OAT_RATE', type: 'ATK' },
    { st: 'ST_DEF', ap: 'OAT_RATE', type: 'Def' },
    { st: 'ST_HP', ap: 'OAT_RATE', type: 'Heal' },
    { st: 'ST_CRITICAL_RATE', ap: 'OAT_ADD', type: 'CriRate' },
    { st: 'ST_CRITICAL_DMG_RATE', ap: 'OAT_ADD', type: 'CriDmgRate' },
    { st: 'ST_BUFF_CHANCE', ap: 'OAT_RATE', type: 'BuffChance' },
    { st: 'ST_BUFF_RESIST', ap: 'OAT_RATE', type: 'BuffResist' },
    { st: 'ST_DMG_BOOST', ap: 'OAT_ADD', type: 'DMG_INCREASE' },
    { st: 'ST_DMG_REDUCE_RATE', ap: 'OAT_ADD', type: 'DMG_REDUCE' },
  ];
  const GEMS_BASE_ID = 15001;
  const GEM_MAX_LEVEL = 6;
  const gems: Record<string, unknown> = {};
  for (let lv = 1; lv <= GEM_MAX_LEVEL; lv++) {
    for (let i = 0; i < GEM_STAT_BY_INDEX.length; i++) {
      const id = String(GEMS_BASE_ID + (lv - 1) * GEM_STAT_BY_INDEX.length + i);
      const slot = GEM_STAT_BY_INDEX[i];
      const opt = options[id];
      // Un drift du mapping (réordonnancement du jeu) SKIPPE l'entrée → visible
      // au rebuild suivant plutôt qu'une gemme silencieusement fausse.
      if (!opt || !('st' in opt) || opt.st !== slot.st || opt.ap !== slot.ap) continue;
      gems[id] = { type: slot.type, level: lv, st: opt.st, ap: opt.ap, v: opt.v };
    }
  }
  emit('gems.json', gems);

  // ---- exp-character / trust-character ----
  const expRowsRaw = loadTable('ExpCharacterTemplet').map((r) => ({
    lv: Number(r.Level),
    exp: Number(r.TotalExp),
    trustExp: Number(r.TrustExp),
  }));
  const maxLv = expRowsRaw.reduce((m, r) => Math.max(m, r.lv), 0);
  const expCurveByLevel = Array<number>(maxLv + 1).fill(0);
  for (const r of expRowsRaw) expCurveByLevel[r.lv] = r.exp;
  emit('exp-character.json', expCurveByLevel);

  const trustCurveByLevel = Array<number>(101).fill(0);
  for (const r of expRowsRaw) if (r.lv >= 1 && r.lv <= 100) trustCurveByLevel[r.lv] = r.trustExp;
  emit('trust-character.json', trustCurveByLevel);

  // ---- trust-buffs ----
  const trustBuffStats = new Map<string, { stat?: string; apply?: string; value: number }>();
  for (const b of buffTemplet) {
    if (!b.BuffID?.startsWith('trust_level_')) continue;
    trustBuffStats.set(b.BuffID, {
      stat: b.StatType,
      apply: b.ApplyingType,
      value: Number(b.Value),
    });
  }
  const trustBuffs = loadTable('TrustBuffTemplet')
    .map((r) => ({
      tier: Number(r.ID),
      buffId: r.BuffID,
      ...(trustBuffStats.get(r.BuffID ?? '') ?? null),
    }))
    .filter((r) => (r as { stat?: string }).stat);
  emit('trust-buffs.json', trustBuffs);

  // ---- char-level-max (par (BasicStar, Step), 1re ligne d'élément gagne) ----
  const charLevelMax: Record<string, unknown> = {};
  for (const r of loadTable('CharacterMaxLevelTemplet')) {
    const key = `${Number(r.BasicStar)}|${Number(r.Step)}`;
    if (charLevelMax[key]) continue;
    charLevelMax[key] = {
      requireLevel: Number(r.RequireLevel),
      maxLevel: Number(r.MaxLevel),
      statModifierAfter100: Number(r.LevelUpStatModifierAfter100),
    };
  }
  emit('char-level-max.json', charLevelMax);

  // ---- archive-bonus ----
  const archiveBonusCurve = loadTable('ArchiveBonusTemplet')
    .map((r) => ({ requiredCount: Number(r.CompleteCount), level: Number(r.Level) }))
    .sort((a, b) => a.requiredCount - b.requiredCount);
  emit('archive-bonus.json', archiveBonusCurve);

  // ---- ingredients + codex ----
  const characterTemplet = loadTable('CharacterTemplet');
  const skillLevels = loadTable('CharacterSkillLevelTemplet');
  const ingredientsResult = computeCharacterIngredients({
    characterTemplet,
    evoStats: loadTable('CharacterEvolutionStatTemplet'),
    archiveStats: loadTable('CharacterArchiveStatTemplet'),
    transcendent: loadTable('CharacterTranscendentTemplet'),
    skillLevels,
    buffs: buffTemplet,
    awakLevels: loadTable('CharacterAwakeningLevelTemplet'),
    awakNodes: loadTable('CharacterAwakeningNodeTemplet'),
    fusionTemplet: loadTable('CharacterFusionTemplet'),
  });
  emit('codex-curve.json', ingredientsResult.codexByLevel satisfies CodexLevel[]);

  // ---- characters (+ dmgStat/dmgSec/noCrit re-dérivés des tables BRUTES) ----
  // L'ancien monde lisait `public/damage-calc/buffs/{id}.json` (dérivé,
  // disparu). Équivalences brutes, calibrées sur la référence gear-solver :
  //   - dmgStat : BT_SWAP_STAT_ATTACK (ST_DEF/ST_HP) sur un skill du kit ;
  //   - dmgSec  : BT_DMG_OWNER_STAT, ratio = Value/1000 (> 0), max par stat ;
  //   - noCrit  : ST_CRITICAL_RATE ≤ −1000 sur ME — le jeu l'encode en buff
  //     `_passive` réappliqué à CHAQUE SKILL_START (Turn=1), donc toujours
  //     actif en pratique (Rhona, K.Tamamo, G.Nella).
  const skillRowsBySkillId = new Map<string, Row[]>();
  for (const r of skillLevels) {
    const arr = skillRowsBySkillId.get(r.SkillID ?? '') ?? [];
    arr.push(r);
    skillRowsBySkillId.set(r.SkillID ?? '', arr);
  }
  const SCALING_STAT_TO_KEY: Record<string, string> = {
    ST_ATK: 'atk',
    ST_DEF: 'def',
    ST_HP: 'hp',
    ST_SPEED: 'spd',
    ST_BUFF_CHANCE: 'eff',
    ST_CRITICAL_RATE: 'crc',
  };
  // Scan des scalings : S1/S2/S3 + Skill_8 (transcendance — le eff-scaling de
  // Nella vit dans les buffs PARTAGÉS trancendent_8_owner_*) + les PASSIFS
  // Skill_22 (classe — les swaps de Domine/Skadi/Anarky) et Skill_23 (core — Epsilon). PAS les skills
  // de SOUTIEN (backup, Skill_9/10) : leurs OWNER_STAT propres (Tamara
  // `_backup_1_1` spd 1500) sont les attaques de soutien, pas le kit principal —
  // l'ancienne référence ne les comptait pas. noCrit, lui, se cherche sur TOUS les
  // Skill_* (le `_passive` de Rhona vit hors S1-S3).
  const MAIN_SKILL_COLS = ['Skill_1', 'Skill_2', 'Skill_3', 'Skill_8', 'Skill_22', 'Skill_23'];
  const ALL_SKILL_COLS = Array.from({ length: 23 }, (_, i) => `Skill_${i + 1}`);
  function deriveDmgScaling(c: Row): {
    dmgStat?: string;
    dmgSec?: { stat: string; ratio: number }[];
    noCrit?: boolean;
  } {
    let dmgStat: string | null = null;
    let noCrit = false;
    const secMax = new Map<string, number>();
    const forEachBuff = (cols: string[], fn: (b: Row) => void): void => {
      for (const col of cols) {
        const sid = c[col];
        if (!sid) continue;
        const seen = new Set<string>();
        for (const row of skillRowsBySkillId.get(String(sid)) ?? []) {
          for (const bid of String(row.BuffID ?? '').split(',')) {
            if (!bid || seen.has(bid)) continue;
            seen.add(bid);
            for (const b of buffLevelsByID.get(bid) ?? []) {
              if (b.TargetType !== 'ME') continue;
              fn(b);
            }
          }
        }
      }
    };
    forEachBuff(MAIN_SKILL_COLS, (b) => {
      const key = SCALING_STAT_TO_KEY[b.StatType ?? ''];
      if (!key) return;
      if (b.Type === 'BT_SWAP_STAT_ATTACK') {
        if (key === 'def' || key === 'hp') dmgStat = key;
      } else if (b.Type === 'BT_DMG_OWNER_STAT') {
        const ratio = Number(b.Value) / 1000;
        if (ratio > 0) secMax.set(key, Math.max(secMax.get(key) ?? 0, ratio));
      }
    });
    forEachBuff(ALL_SKILL_COLS, (b) => {
      if (b.StatType === 'ST_CRITICAL_RATE' && Number(b.Value) <= -1000) noCrit = true;
    });
    const dmgSec = secMax.size > 0 ? [...secMax].map(([stat, ratio]) => ({ stat, ratio })) : null;
    return {
      ...(dmgStat ? { dmgStat } : {}),
      ...(dmgSec ? { dmgSec } : {}),
      ...(noCrit ? { noCrit: true } : {}),
    };
  }

  const characters: Record<string, unknown> = {};
  for (const c of characterTemplet) {
    if (c.Type !== 'CT_PC') continue;
    if (c.NameID !== `${c.ID}_Name`) continue;
    const ing: CharacterIngredients | undefined = ingredientsResult.characters[c.ID];
    const nickname = showNickName.has(c.ID) ? (textChar.get(c.NickNameID ?? '') ?? null) : null;
    characters[c.ID] = {
      name: textChar.get(c.NameID ?? '') ?? null,
      nickname,
      cls: c.Class ?? null,
      element: c.Element ?? null,
      star: Number(c.BasicStar) || null,
      ingredients: ing ?? null,
      recommendSetId:
        c.RecommandSetOptionID && c.RecommandSetOptionID !== '0' ? c.RecommandSetOptionID : null,
      ...deriveDmgScaling(c),
    };
  }
  emit('characters.json', characters);

  // ---- sub-ticks : recomposé depuis ItemOptionTemplet (item-stats-detail est mort) --
  // Pool de subs par palier d'étoiles : le SubOptionGroupID MAJORITAIRE des
  // gears unique 5★/6★ (105/106 aujourd'hui — dérivé dynamiquement, robuste au
  // drift). step : flat = OptionValue brut ; % = OptionValue per-mille ÷10.
  const SUB_STAT_KEY: Record<string, { flat: string; pct: string }> = {
    ST_ATK: { flat: 'atk', pct: 'atkPct' },
    ST_DEF: { flat: 'def', pct: 'defPct' },
    ST_HP: { flat: 'hp', pct: 'hpPct' },
  };
  const subGroupByStar = new Map<number, string>();
  for (const star of [5, 6]) {
    const counts = new Map<string, number>();
    for (const it of itemTemplet) {
      const slot = SLOT[it.ItemSubType ?? ''];
      if (!slot || slot === 'exclusive' || slot === 'ooparts') continue;
      if (Number(it.BasicStar) !== star || !it.SubOptionGroupID) continue;
      counts.set(it.SubOptionGroupID, (counts.get(it.SubOptionGroupID) ?? 0) + 1);
    }
    const top = [...counts].sort((a, b) => b[1] - a[1])[0];
    if (top) subGroupByStar.set(star, top[0]);
  }
  const subTicks: Record<string, Record<string, { step: number; percent: boolean }>> = {};
  for (const [star, groupId] of subGroupByStar) {
    const row: Record<string, { step: number; percent: boolean }> = {};
    for (const o of loadTable('ItemOptionTemplet')) {
      if (o.GroupID !== groupId || o.OptionType !== 'IOT_STAT') continue;
      const keys = SUB_STAT_KEY[o.StatType ?? ''];
      if (!keys) continue;
      const pct = o.ApplyingType === 'OAT_RATE';
      const key = pct ? keys.pct : keys.flat;
      const raw = Number(o.OptionValue);
      row[key] = { step: pct ? raw / 10 : raw, percent: pct };
    }
    if (Object.keys(row).length) subTicks[String(star)] = row;
  }
  emit('sub-ticks.json', subTicks);

  // ---- version.json : hash de contenu + builtAt idempotent contre le COMMITTÉ ----
  // Hash = sha256 cumulé `nom + JSON compact` dans l'ordre d'émission ci-dessus
  // (stable ssi le CONTENU est stable, indépendant du format d'écriture disque).
  const digest = createHash('sha256');
  for (const [name, data] of files) {
    digest.update(name);
    digest.update(JSON.stringify(data));
  }
  const hash = digest.digest('hex').slice(0, 12);
  // `builtAt` = millésime du DERNIER vrai changement : si le hash committé est
  // identique, on reprend son builtAt — un rebuild no-op ne salit pas git.
  const committedPath = resolve('data/generated/solver/version.json');
  let builtAt = new Date().toISOString();
  if (existsSync(committedPath)) {
    try {
      const prior = JSON.parse(readFileSync(committedPath, 'utf8')) as {
        hash?: string;
        builtAt?: string;
      };
      if (prior.hash === hash && prior.builtAt) builtAt = prior.builtAt;
    } catch {
      /* malformé → re-stamp */
    }
  }
  return { files, version: { hash, builtAt } };
}
