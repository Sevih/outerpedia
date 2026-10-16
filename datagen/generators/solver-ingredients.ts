/**
 * Ingrédients de stats par personnage pour GEAR-SOLVER — port FIDÈLE de
 * l'ancien `gear-solver/data/calc-stats.mjs`, aujourd'hui supprimé : CE module
 * produit désormais les ingrédients (ses choix sont résumés ici), et la formule
 * qui les consomme et fait foi est `gear-solver/packages/core/src/compose-stats.ts`.
 *
 * L'app compose au runtime le bloc de stats « sans équipement » depuis la
 * progression capturée (niveau, TransStar, codex, gifts…) ; ce module extrait
 * les blocs BRUTS par source. Règles d'encodage (contrat, NE PAS « corriger ») :
 *   - CHC/CHD/PEN/DMG± : per-mille ÷10 → points de %
 *   - ATK/DEF/HP OAT_RATE → atkPct/defPct/hpPct ; OAT_ADD → flat
 *   - SPD OAT_RATE, deux encodages (seul le noyau d'un Core Fusion en porte) :
 *       · ANCIEN, `corePassive` : flat PRÉ-CUIT contre `baseForRate.spd` (vitesse
 *         lv100 + évos max). Faux sous lv60 et avec de la vitesse d'équipement :
 *         le client met ce taux dans `m_nBuffValueRate`, qui multiplie la stat
 *         courante ENTIÈRE, équipement compris, avec troncature
 *         (`CFormula.CalcFinalStat`). Gardé tel quel : les versions installées
 *         de gear-solver le lisent (étape (a), en-tête de `solver.ts`) ;
 *       · NOUVEAU, `corePassiveByFusion` : taux brut en points de % dans
 *         `spdPct`, `spd` n'y porte que du plat.
 *     Dans tout autre bloc, un SPD OAT_RATE de fiche fait JETER le générateur :
 *     il y serait cuit, il lui faut d'abord un champ en taux ;
 *   - EFF/RES OAT_RATE → effRate/resRate (le composeur les applique via
 *     BuffValueRate — cf. le cas Notia +50% EFF)
 *   - buffs de compétence (classe, S1-S3, Skill_8, noyau) : le filtre du client,
 *     `isStatSheetBuff` (ni condition ni durée regardées)
 *
 * ⚠ Sortie pour l'app externe : enums moteur bruts, AUCUN slug wiki.
 */
import { isStatSheetBuff } from '../lib/buff';
import { bool, type Row } from '../lib/tables';

const ELEMENT_INDEX: Record<string, number> = {
  CET_EARTH: 0,
  CET_WATER: 1,
  CET_FIRE: 2,
  CET_LIGHT: 3,
  CET_DARK: 4,
};
const CLASS_INDEX: Record<string, number> = {
  CCT_DEFENDER: 1,
  CCT_ATTACKER: 2,
  CCT_RANGER: 3,
  CCT_MAGE: 4,
  CCT_PRIEST: 5,
};
const SUBCLASS_INDEX: Record<string, number> = {
  ATTACKER: 1,
  BRUISER: 2,
  WIZARD: 3,
  ENCHANTER: 4,
  VANGUARD: 5,
  TACTICIAN: 6,
  SWEEPER: 7,
  PHALANX: 8,
  RELIEVER: 9,
  SAGE: 10,
};

function num(v: string | undefined): number {
  if (!v) return 0;
  const p = parseInt(v, 10);
  return Number.isFinite(p) ? p : 0;
}
function splitCsv(s: string | undefined): string[] {
  if (!s) return [];
  return s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
}

export interface StatBlock {
  atk: number;
  def: number;
  hp: number;
  spd: number;
  chc: number;
  chd: number;
  pen: number;
  dmgInc: number;
  dmgRed: number;
  eff: number;
  res: number;
  effRate: number;
  resRate: number;
  atkPct: number;
  defPct: number;
  hpPct: number;
}
function zeroStats(): StatBlock {
  return {
    atk: 0,
    def: 0,
    hp: 0,
    spd: 0,
    chc: 0,
    chd: 0,
    pen: 0,
    dmgInc: 0,
    dmgRed: 0,
    eff: 0,
    res: 0,
    effRate: 0,
    resRate: 0,
    atkPct: 0,
    defPct: 0,
    hpPct: 0,
  };
}
/** Bloc du noyau par niveau de fusion : `spdPct` = SPD OAT_RATE en taux brut (points de %). */
export interface RateStatBlock extends StatBlock {
  spdPct: number;
}
/** Bloc en cours de remplissage : `spdPct` n'y apparaît qu'en mode `rate`. */
type WorkBlock = StatBlock & { spdPct?: number };
function isEmpty(s: WorkBlock): boolean {
  for (const k of Object.keys(s) as (keyof WorkBlock)[]) if (s[k] !== 0) return false;
  return true;
}

/**
 * Sort d'un SPD OAT_RATE selon le bloc qui le reçoit (cf. en-tête) :
 * `bake` = ancien encodage, cuit en plat contre `spd` (`corePassive` seul) ;
 * `rate` = taux brut dans `spdPct` (`corePassiveByFusion`) ; `reject` = tout
 * autre bloc, le générateur jette.
 */
type SpdRateMode =
  { kind: 'bake'; spd: number } | { kind: 'rate' } | { kind: 'reject'; block: string };

/** Index par clé (tri optionnel) — évite les `.filter()` par perso sur des tables à milliers de lignes. */
function indexBy(rows: Row[], keyField: string, sortField?: string): Map<string, Row[]> {
  const m = new Map<string, Row[]>();
  for (const r of rows) {
    const k = r[keyField];
    if (k == null) continue;
    let arr = m.get(k);
    if (!arr) {
      arr = [];
      m.set(k, arr);
    }
    arr.push(r);
  }
  if (sortField) {
    for (const arr of m.values()) arr.sort((a, b) => num(a[sortField]) - num(b[sortField]));
  }
  return m;
}

/** Ligne d'UN skill (rows triées par SkillLevel) : niveau exact, sinon le max. */
function pickSkillLevelRow(rows: Row[] | undefined, level?: number): Row | undefined {
  if (!rows || rows.length === 0) return undefined;
  if (level != null) {
    for (const r of rows) if (num(r.SkillLevel) === level) return r;
    return undefined;
  }
  return rows[rows.length - 1];
}
/** Ligne de buff au Level max (rows triées par Level). */
function pickMaxBuff(rows: Row[] | undefined): Row | undefined {
  return rows && rows.length > 0 ? rows[rows.length - 1] : undefined;
}

export interface MinMax {
  min: number;
  max: number;
}
export interface BaseStats {
  atk: MinMax;
  def: MinMax;
  hp: MinMax;
  spd: MinMax;
  chc: MinMax;
  chd: MinMax;
  eff: MinMax;
  res: MinMax;
}

// Ancrages lv1 (Min) / lv100 (Max). L'interpolation en jeu est entière :
// stat(L) = Min + floor((Max-Min) × (L-1) / 99) — reproduite côté app.
function extractBase(row: Row): BaseStats {
  return {
    atk: { min: num(row.Atk_Min), max: num(row.Atk_Max) },
    def: { min: num(row.Def_Min), max: num(row.Def_Max) },
    hp: { min: num(row.HP_Min), max: num(row.HP_Max) },
    spd: { min: num(row.Speed_Min), max: num(row.Speed_Max) },
    chc: { min: num(row.CriticalRate_Min) / 10, max: num(row.CriticalRate_Max) / 10 },
    chd: { min: num(row.CriticalDMGRate_Min) / 10, max: num(row.CriticalDMGRate_Max) / 10 },
    eff: { min: num(row.BuffChance_Min), max: num(row.BuffChance_Max) },
    res: { min: num(row.BuffResist_Min), max: num(row.BuffResist_Max) },
  };
}

// Ajouts d'évolution par EvolutionLevel (cumulés côté app selon le TransStar capturé).
// La table n'a pas d'ApplyingType : un apport d'évolution est plat par construction,
// aucun SPD OAT_RATE ne peut y arriver.
function extractEvoByLevel(evoRows: Row[] | undefined): Record<string, StatBlock> {
  const out: Record<string, StatBlock> = {};
  if (!evoRows) return out;
  for (const r of evoRows) {
    const lvl = String(num(r.EvolutionLevel));
    const dest = out[lvl] ?? zeroStats();
    for (let i = 1; i <= 3; i++) {
      const t = r[`RewardStatType_${i}`];
      const v = num(r[`RewardValue_${i}`]);
      if (t === 'ST_ATK') dest.atk += v;
      else if (t === 'ST_DEF') dest.def += v;
      else if (t === 'ST_HP') dest.hp += v;
      else if (t === 'ST_SPEED') dest.spd += v;
      else if (t === 'ST_BUFF_CHANCE') dest.eff += v;
      else if (t === 'ST_BUFF_RESIST') dest.res += v;
      else if (t === 'ST_CRITICAL_RATE') dest.chc += v / 10;
      else if (t === 'ST_CRITICAL_DMG_RATE') dest.chd += v / 10;
      else if (t === 'ST_DMG_BOOST') dest.dmgInc += v / 10;
      else if (t === 'ST_DMG_REDUCE_RATE') dest.dmgRed += v / 10;
      else if (t === 'ST_PIERCE_POWER_RATE') dest.pen += v / 10;
    }
    out[lvl] = dest;
  }
  return out;
}

export interface CodexLevel {
  atkPct: number;
  defPct: number;
  hpPct: number;
}
// Multiplicateurs % du codex (Hero Archive) Lv 1..11 — GLOBAL, pas par perso.
function extractCodexCurve(archiveStats: Row[]): CodexLevel[] {
  const out: CodexLevel[] = [{ atkPct: 0, defPct: 0, hpPct: 0 }]; // Lv 0 = pas de codex
  for (const r of archiveStats.slice().sort((a, b) => num(a.ID) - num(b.ID))) {
    out.push({
      atkPct: num(r.Atk_Rate) / 10,
      defPct: num(r.Def_Rate) / 10,
      hpPct: num(r.HP_Rate) / 10,
    });
  }
  return out;
}

export interface TranscendStar {
  atkPct: number;
  defPct: number;
  hpPct: number;
  skillLevel: number;
  showUIStar: number;
  starPlus: number;
}
// Bonus % par TransStar + niveau de Skill_8 débloqué. Les lignes catch-all
// `CharacterID="0"` (filtrées par BasicStar) servent les persos sans lignes propres.
// Seuls les paliers que le jeu parcourt (`UseTransStar`) : en 1★/2★, les crans 5,
// 7 et 8 n'en sont pas. Un Core Fusion passe l'étoile de base et l'ID de son
// ORIGINE (le client lit la transcendance sur ce templet) et `fromStar`, l'étoile
// de base du fusionné : son échelle commence là — même règle que `transcend.json`.
function extractTranscendByStar(
  transcendByCharId: Map<string, Row[]>,
  basicStar: number,
  charId: string,
  fromStar = 0,
): Record<string, TranscendStar> {
  const charSpecific = transcendByCharId.get(charId) ?? [];
  const pool = (
    charSpecific.length > 0
      ? charSpecific
      : (transcendByCharId.get('0') ?? []).filter((r) => num(r.BasicStar) === basicStar)
  ).filter((r) => bool(r.UseTransStar) && num(r.TransStar) >= fromStar);
  const out: Record<string, TranscendStar> = {};
  for (const r of pool) {
    const star = num(r.TransStar);
    if (star === 0) continue;
    out[String(star)] = {
      atkPct: num(r.RewardAtkRate) / 10,
      defPct: num(r.RewardDefRate) / 10,
      hpPct: num(r.RewardHPRate) / 10,
      skillLevel: num(r.SkillLevel),
      // Métadonnées d'étoiles UI pour la formule de BP (CalcBattlePower) :
      // star_bonus = ShowUIStar×500 + StarPlus×120.
      showUIStar: num(r.ShowUIStar),
      starPlus: num(r.StarPlus),
    };
  }
  return out;
}

/**
 * Route un triplet (StatType, ApplyingType, Value) vers le bon champ du bloc.
 * Partagé buffs/geas — mêmes règles d'encodage (cf. en-tête).
 */
function applyStatBonus(
  dest: WorkBlock,
  statType: string | undefined,
  applying: string | undefined,
  value: number,
  spdRate: SpdRateMode,
): void {
  const rate = applying === 'OAT_RATE';
  const add = applying === 'OAT_ADD';
  if (!rate && !add) return;
  switch (statType) {
    case 'ST_CRITICAL_RATE':
      dest.chc += value / 10;
      return;
    case 'ST_CRITICAL_DMG_RATE':
      dest.chd += value / 10;
      return;
    case 'ST_PIERCE_POWER_RATE':
      dest.pen += value / 10;
      return;
    case 'ST_DMG_REDUCE_RATE':
      dest.dmgRed += value / 10;
      return;
    case 'ST_DMG_BOOST':
      dest.dmgInc += value / 10;
      return;
    case 'ST_ATK':
      if (rate) dest.atkPct += value / 10;
      else dest.atk += value;
      return;
    case 'ST_DEF':
      if (rate) dest.defPct += value / 10;
      else dest.def += value;
      return;
    case 'ST_HP':
      if (rate) dest.hpPct += value / 10;
      else dest.hp += value;
      return;
    case 'ST_SPEED':
      if (!rate) dest.spd += value;
      else if (spdRate.kind === 'bake') dest.spd += Math.floor((spdRate.spd * value) / 1000);
      else if (spdRate.kind === 'rate') dest.spdPct = (dest.spdPct ?? 0) + value / 10;
      else {
        // Le client applique ce taux à la stat courante entière (`CalcFinalStat`) :
        // cuit ici, il serait faux sous lv100 et avec l'équipement. Il doit casser
        // ICI, pas partir cuit en silence chez gear-solver.
        throw new Error(
          `solver : SPD OAT_RATE ${value} ‰ dans ${spdRate.block} — seul le noyau ` +
            `(corePassiveByFusion.spdPct) porte la vitesse en taux : ajouter d'abord un champ ` +
            `en taux pour ce bloc (étape (a), en-tête de datagen/generators/solver.ts)`,
        );
      }
      return;
    case 'ST_BUFF_CHANCE':
      if (rate) dest.effRate += value / 10;
      else dest.eff += value;
      return;
    case 'ST_BUFF_RESIST':
      if (rate) dest.resRate += value / 10;
      else dest.res += value;
      return;
  }
}

/** Buff de compétence : versé à la fiche s'il en est un (`isStatSheetBuff`, filtre du client). */
function applyPremiumBuff(dest: WorkBlock, buff: Row, spdRate: SpdRateMode): void {
  if (!isStatSheetBuff(buff)) return;
  applyStatBonus(dest, buff.StatType, buff.ApplyingType, num(buff.Value), spdRate);
}

function extractClassPassive(
  row: Row,
  skillsByID: Map<string, Row[]>,
  buffsByID: Map<string, Row[]>,
): StatBlock {
  const out = zeroStats();
  const skillId = row.Skill_22;
  if (!skillId) return out;
  const levelRow = pickSkillLevelRow(skillsByID.get(String(skillId)));
  for (const bid of splitCsv(levelRow?.BuffID)) {
    const b = pickMaxBuff(buffsByID.get(bid));
    if (b) applyPremiumBuff(out, b, { kind: 'reject', block: `classPassive (${skillId})` });
  }
  return out;
}

/**
 * Un bloc par SkillLevel : la contribution des buffs de fiche au niveau donné.
 * Convention plancher : plus haut BuffLevel ≤ SkillLv (Ame S2 Lv5 → BuffLv4).
 * Filtre du client (`isStatSheetBuff`) : ni condition ni durée regardées.
 */
function extractSkillPassiveByLevel(
  skillId: string | undefined,
  skillsByID: Map<string, Row[]>,
  buffsByID: Map<string, Row[]>,
  spdRate: SpdRateMode,
): Record<string, WorkBlock> {
  if (!skillId) return {};
  const rows = skillsByID.get(String(skillId));
  if (!rows || rows.length === 0) return {};
  const out: Record<string, WorkBlock> = {};
  for (const row of rows) {
    const skillLv = num(row.SkillLevel);
    const dest: WorkBlock = zeroStats();
    for (const bid of splitCsv(row.BuffID)) {
      const bRows = buffsByID.get(bid);
      if (!bRows || bRows.length === 0) continue;
      let chosen = bRows[0];
      for (const b of bRows) {
        if (num(b.Level) <= skillLv) chosen = b;
        else break;
      }
      applyPremiumBuff(dest, chosen, spdRate);
    }
    if (!isEmpty(dest)) out[String(skillLv)] = dest;
  }
  return out;
}

// Buffs de Skill_8 par niveau de transcendance débloqué.
function extractSkill8ByLevel(
  row: Row,
  skillsByID: Map<string, Row[]>,
  buffsByID: Map<string, Row[]>,
  transcendByStar: Record<string, TranscendStar>,
): Record<string, StatBlock> {
  const out: Record<string, StatBlock> = {};
  const skillId = row.Skill_8;
  if (!skillId) return out;
  const skillRows = skillsByID.get(String(skillId));
  if (!skillRows) return out;
  const seen = new Set<number>();
  for (const star of Object.keys(transcendByStar)) {
    const lvl = transcendByStar[star].skillLevel;
    if (lvl <= 0 || seen.has(lvl)) continue;
    seen.add(lvl);
    const levelRow = pickSkillLevelRow(skillRows, lvl);
    if (!levelRow) continue;
    const dest = zeroStats();
    for (const bid of splitCsv(levelRow.BuffID)) {
      const b = pickMaxBuff(buffsByID.get(bid));
      if (b) applyPremiumBuff(dest, b, { kind: 'reject', block: `skill8ByLevel (${skillId})` });
    }
    if (!isEmpty(dest)) out[String(lvl)] = dest;
  }
  return out;
}

function accumulateGeasBonus(dest: StatBlock, levelRow: Row, buffsByID: Map<string, Row[]>): void {
  let statType = levelRow.StatType ?? 'ST_NONE';
  let applying = levelRow.ApplyingType ?? 'OAT_NONE';
  let value = num(levelRow.OptionValue);
  let condition = 'NONE';
  if (levelRow.OptionType === 'IOT_BUFF' && levelRow.BuffID) {
    const b = pickMaxBuff(buffsByID.get(levelRow.BuffID));
    if (!b) return;
    if (b.Type !== 'BT_STAT_PREMIUM') return;
    statType = b.StatType ?? 'ST_NONE';
    applying = b.ApplyingType ?? 'OAT_NONE';
    value = num(b.Value);
    condition = b.BuffConditionType ?? 'NONE';
  }
  if (condition !== 'NONE') return;
  applyStatBonus(dest, statType, applying, value, {
    kind: 'reject',
    block: `geasByNode (niveau ${levelRow.ID})`,
  });
}

export interface GeasNode {
  source: 'stat' | 'buff';
  levels: Record<string, StatBlock>;
}
// Geas (nœuds élément/classe/sous-classe) — valeur CUMULATIVE par niveau ;
// l'app choisit la ligne du niveau possédé (capture /gift/info), sinon le max.
function extractGeasByNode(
  row: Row,
  awakNodes: Row[],
  awakLevelsByGroup: Map<string, Map<number, Row>>,
  buffsByID: Map<string, Row[]>,
): Record<string, GeasNode> {
  const elemIdx = ELEMENT_INDEX[row.Element ?? ''] ?? -1;
  const classIdx = CLASS_INDEX[row.Class ?? ''] ?? -1;
  const subIdx = SUBCLASS_INDEX[row.SubClass ?? ''] ?? -1;
  const out: Record<string, GeasNode> = {};
  for (const node of awakNodes) {
    const gid = node.AwakeningLevelGroupID;
    if (!gid) continue;
    const v = num(node.AwakeningApplyTypeValue);
    let match = false;
    if (node.AwakeningApplyType === 'AAT_ELEMENTAL' && v === elemIdx) match = true;
    else if (node.AwakeningApplyType === 'AAT_CLASS' && v === classIdx) match = true;
    else if (node.AwakeningApplyType === 'AAT_SUBCLASS' && v === subIdx) match = true;
    if (!match) continue;
    const inner = awakLevelsByGroup.get(gid);
    if (!inner) continue;
    const perLevel: Record<string, StatBlock> = {};
    let source: 'stat' | 'buff' | null = null;
    for (const [lvl, lvlRow] of inner) {
      const dest = zeroStats();
      accumulateGeasBonus(dest, lvlRow, buffsByID);
      if (!isEmpty(dest)) {
        perLevel[String(lvl)] = dest;
        if (source === null) source = lvlRow.OptionType === 'IOT_BUFF' ? 'buff' : 'stat';
      }
    }
    if (Object.keys(perLevel).length > 0)
      out[node.ID] = { source: source ?? 'stat', levels: perLevel };
  }
  return out;
}

export interface CharacterIngredients {
  base: BaseStats;
  evoByLevel: Record<string, StatBlock>;
  transcendByStar: Record<string, TranscendStar>;
  classPassive: StatBlock;
  skill8ByLevel: Record<string, StatBlock>;
  geasByNode: Record<string, GeasNode>;
  s1ByLevel: Record<string, StatBlock>;
  s2ByLevel: Record<string, StatBlock>;
  s3ByLevel: Record<string, StatBlock>;
  corePassive: StatBlock | null;
  /** Fusionnés seulement : noyau (`Skill_23`) au niveau de chaque niveau de fusion, clés `"1"`…`"5"`. */
  corePassiveByFusion?: Record<string, RateStatBlock>;
}

export interface IngredientsTables {
  characterTemplet: Row[];
  evoStats: Row[];
  archiveStats: Row[];
  transcendent: Row[];
  skillLevels: Row[];
  buffs: Row[];
  awakLevels: Row[];
  awakNodes: Row[];
  fusionTemplet: Row[];
  fusionLevelTemplet: Row[];
}

/** Bundles d'ingrédients par perso + la courbe codex globale. */
export function computeCharacterIngredients(tables: IngredientsTables): {
  codexByLevel: CodexLevel[];
  characters: Record<string, CharacterIngredients>;
} {
  const {
    characterTemplet,
    evoStats,
    archiveStats,
    transcendent,
    skillLevels,
    buffs,
    awakLevels,
    awakNodes,
    fusionTemplet,
    fusionLevelTemplet,
  } = tables;

  const codexByLevel = extractCodexCurve(archiveStats);

  const buffsByID = indexBy(buffs, 'BuffID', 'Level');
  const skillsByID = indexBy(skillLevels, 'SkillID', 'SkillLevel');
  const evosByCharId = indexBy(evoStats, 'CharacterID');
  const transcendByCharId = indexBy(transcendent, 'CharacterID');
  const fusionLevelsByGroup = indexBy(fusionLevelTemplet, 'FusionGroupID', 'FusionLevel');
  const awakLevelsByGroup = new Map<string, Map<number, Row>>();
  for (const r of awakLevels) {
    const gid = r.AwakeningLevelGroupID;
    if (!gid) continue;
    let inner = awakLevelsByGroup.get(gid);
    if (!inner) {
      inner = new Map();
      awakLevelsByGroup.set(gid, inner);
    }
    inner.set(num(r.AwakeningLevel), r);
  }

  // Filtre variantes : NameID d'un AUTRE perso = alt visuel/PvP — jamais
  // référencé par une capture utilisateur (règle canonique du solver).
  const characters: Record<string, CharacterIngredients> = {};
  const templetById = new Map(characterTemplet.map((r) => [r.ID, r]));
  for (const row of characterTemplet) {
    if (row.Type !== 'CT_PC') continue;
    if (row.NameID !== `${row.ID}_Name`) continue;
    const id = row.ID;
    const fusionRow = fusionTemplet.find((r) => r.ChangeCharID === id);
    const evoCharId = fusionRow?.CharacterID ?? id;
    const basicStar = num(row.BasicStar);
    // Base et évolution d'un fusionné : celles du perso d'origine. Le client
    // (CCharacterData.CalcBasicStats) lit `Templet`, le templet de l'ID d'origine ;
    // le templet fusionné ne sert qu'aux skills. Confirmé par trois captures ATK
    // (Snow, Lisha, Veronica, lv100, 09/10/2026).
    const base = extractBase(templetById.get(evoCharId) ?? row);
    const evoByLevel = extractEvoByLevel(evosByCharId.get(evoCharId));
    // Seul `spd` est encore consommé (SPD OAT_RATE pré-cuit de `corePassive`, sur
    // lv100 max + évo max).
    const evoMax = zeroStats();
    for (const k of Object.keys(evoByLevel)) {
      for (const f of Object.keys(evoMax) as (keyof StatBlock)[]) evoMax[f] += evoByLevel[k][f];
    }
    const bakeSpd: SpdRateMode = { kind: 'bake', spd: base.spd.max + evoMax.spd };
    // Transcendance d'un fusionné : échelle de l'origine, à partir de sa propre étoile.
    const transcendByStar = fusionRow
      ? extractTranscendByStar(
          transcendByCharId,
          num(templetById.get(evoCharId)?.BasicStar),
          evoCharId,
          basicStar,
        )
      : extractTranscendByStar(transcendByCharId, basicStar, id);
    const classPassive = extractClassPassive(row, skillsByID, buffsByID);
    const skill8ByLevel = extractSkill8ByLevel(row, skillsByID, buffsByID, transcendByStar);
    const geasByNode = extractGeasByNode(row, awakNodes, awakLevelsByGroup, buffsByID);
    const skillByLevel = (slot: 'Skill_1' | 'Skill_2' | 'Skill_3') =>
      extractSkillPassiveByLevel(row[slot], skillsByID, buffsByID, {
        kind: 'reject',
        block: `${slot} (${row[slot]})`,
      });
    const s1ByLevel = skillByLevel('Skill_1');
    const s2ByLevel = skillByLevel('Skill_2');
    const s3ByLevel = skillByLevel('Skill_3');
    // Core fusion (2700xxx) : passif Skill_23 émis en un bloc au niveau max
    // (ancien encodage, SPD cuite — cf. en-tête).
    let corePassive: StatBlock | null = null;
    if (/^2700\d{3}$/.test(id) && row.Skill_23) {
      const byLv = extractSkillPassiveByLevel(row.Skill_23, skillsByID, buffsByID, bakeSpd);
      const levels = Object.keys(byLv).map(Number);
      if (levels.length) corePassive = byLv[String(Math.max(...levels))];
    }
    // Le client prend Skill_23 au niveau `Skill_23_Level` du niveau de fusion
    // (`CSkillManager.Create`) : un bloc par ligne de `CharacterFusionLevelTemplet`
    // du groupe. Un niveau sans buff de fiche vaut zéro, jamais de repli.
    let corePassiveByFusion: Record<string, RateStatBlock> | undefined;
    if (fusionRow) {
      const byLv = extractSkillPassiveByLevel(row.Skill_23, skillsByID, buffsByID, {
        kind: 'rate',
      });
      corePassiveByFusion = {};
      for (const lv of fusionLevelsByGroup.get(fusionRow.FusionGroupID ?? '') ?? []) {
        const block = byLv[String(num(lv.Skill_23_Level))] ?? zeroStats();
        corePassiveByFusion[String(num(lv.FusionLevel))] = { ...block, spdPct: block.spdPct ?? 0 };
      }
    }
    characters[id] = {
      base,
      evoByLevel,
      transcendByStar,
      classPassive,
      skill8ByLevel,
      geasByNode,
      s1ByLevel,
      s2ByLevel,
      s3ByLevel,
      corePassive,
      ...(corePassiveByFusion ? { corePassiveByFusion } : {}),
    };
  }
  return { codexByLevel, characters };
}
