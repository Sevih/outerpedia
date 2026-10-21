/**
 * Primitive #buff — résolution des buffs (BuffTemplet) et de leurs placeholders.
 *
 * Logique portée d'une base éprouvée (equip/lib.ts + text-v2.ts) : le savoir
 * reverse-engineeré (échelle permille, niveaux, multi-buff CSV) qu'on ne veut
 * surtout pas re-deviner.
 *
 * Un BuffID a plusieurs niveaux (lignes BuffTemplet). Les descriptions du jeu
 * contiennent des placeholders `[Value]`, `[Rate]`, `[Turn]` (et variantes
 * `[+Value]`, `[Value2]`, `[Value4]`, `[Value5]`, `[Turn2]`…) résolus depuis la
 * ligne du buff au niveau demandé.
 *
 * NOTE : on ne met PAS l'ancien wrap couleur `<color=#28d9ed>` ici — c'est
 * de la présentation, pas de la donnée canonique. Le front stylise s'il veut.
 */
import {
  fillSkillPlaceholders,
  fillValuePlaceholders,
  unsignedValueIds,
  type BuffValues,
  type SkillBuffVars,
} from './placeholders';
import { formatStatValue, statSlug } from './stats';
import { bool, loadTable, num, tablesStamp, withCaseInsensitiveGet, type Row } from './tables';

export type { BuffValues, SkillBuffVars } from './placeholders';

/** Index BuffTemplet : BuffID → lignes (une par niveau). Lookup insensible à la casse. */
export function loadBuffIndex(): Map<string, Row[]> {
  const idx = new Map<string, Row[]>();
  for (const r of loadTable('BuffTemplet')) {
    const id = r.BuffID;
    if (!id) continue;
    const arr = idx.get(id);
    if (arr) arr.push(r);
    else idx.set(id, [r]);
  }
  return withCaseInsensitiveGet(idx);
}

/**
 * Niveau de buff d'un effet de SET (2P/4P d'une ligne `ItemSpecialOptionTemplet`)
 * = colonne `BuffLevel_xP` + 1. Client : le constructeur de `CItemSpecialOption`
 * (cas d'un set) prend `BuffLevel_2P + 1` (resp. `_4P`) et le passe à
 * `CBuffTempletContainer.GetBuffTemplet`. Les lignes de base n'ont pas la
 * colonne (→ niveau 1), les lignes enchantées (`BreakLimitCount 4`) ont `1`
 * (→ niveau 2). Les options UNIQUES (arme, accessoire, EE) ne passent PAS par
 * ici : le client y passe le niveau tel quel.
 *
 * Le BUFF de l'effet se lit par `setBuffId`, qui tient une table de
 * corrections de la colonne `BuffID_xP` (`SET_BUFF_CORRECTIONS`) ; le niveau,
 * lui, n'est jamais corrigé.
 */
export function setBuffLevel(row: Row, piece: '2P' | '4P'): number {
  return num(row[`BuffLevel_${piece}`]) + 1;
}

/** Correction d'une cellule `BuffID_xP` de `ItemSpecialOptionTemplet`. */
interface SetBuffCorrection {
  /** `ID` de la ligne (pas le `GroupID`). */
  rowId: string;
  piece: '2P' | '4P';
  /** Valeur fautive ATTENDUE dans la table du jeu. */
  expected: string;
  corrected: string;
  /** Ce qui fonde la correction. */
  source: string;
}

/**
 * Corrections de la table du jeu, lues par les trois lecteurs des effets de set
 * (calculateur `datagen/damage/equipment.ts`, `generators/equipment.ts`,
 * `generators/solver.ts`). Une correction ne s'applique que si la cellule porte
 * encore la valeur fautive attendue : si le jeu la change, `setBuffId` jette
 * pour qu'on retire la correction, jamais de remplacement silencieux.
 */
const SET_BUFF_CORRECTIONS: readonly SetBuffCorrection[] = [
  {
    // Pulverization enchanté (set 17, Level 2, BreakLimitCount 4) : le 4P y
    // recopie le buff du 2P (700 ‰ au niveau 2), alors que la ligne de base
    // (ID 17) pose `_17_1` au 4P et que `BuffTemplet` a `_17_1` au niveau 2
    // à 500 ‰.
    rowId: '117',
    piece: '4P',
    expected: 'BID_ITEM_UO_SET_17',
    corrected: 'BID_ITEM_UO_SET_17_1',
    source:
      'texte UO_SET_17_2_DESC_1 de la ligne (« +50% » contre une cible en Break) ; décision de Sevih du 19/10/2026 : 2P et 4P se cumulent, T4 = +70 % puis +50 %',
  },
];

/**
 * Buff d'un effet de SET (colonne `BuffID_2P` / `BuffID_4P` d'une ligne
 * `ItemSpecialOptionTemplet`), tel quel sauf correction de
 * `SET_BUFF_CORRECTIONS`. `undefined` si la cellule est vide.
 */
export function setBuffId(row: Row, piece: '2P' | '4P'): string | undefined {
  const raw = row[`BuffID_${piece}`] || undefined;
  const fix = SET_BUFF_CORRECTIONS.find((c) => c.rowId === row.ID && c.piece === piece);
  if (!fix) return raw;
  if (raw?.trim() !== fix.expected)
    throw new Error(
      `setBuffId : ItemSpecialOptionTemplet ID ${fix.rowId}, BuffID_${piece} vaut « ${raw ?? ''} » ` +
        `au lieu de « ${fix.expected} » attendu — le jeu a changé sa table : retirer la correction ` +
        `de SET_BUFF_CORRECTIONS (datagen/lib/buff.ts) après vérification.`,
    );
  return fix.corrected;
}

/** Vrai si la valeur du buff est en per-mille (à diviser par 10 pour un %). */
function isPermille(buff: Row): boolean {
  if (buff.ApplyingType === 'OAT_RATE') return true;
  const st = buff.StatType ?? '';
  if (st.includes('_RATE') || st.includes('_DMG')) return true;
  const t = buff.Type ?? '';
  // Les contre-attaques (BT_RUN_FIRST_SKILL_*) stockent leur taux dans Value en
  // per-mille (1000 = 100%) avec StatType/ApplyingType = NONE.
  if (t === 'BT_ADDITIVE_TURN' || t.includes('_ENHANCE') || t.includes('RUN_FIRST_SKILL'))
    return true;
  return false;
}

/** Formate la valeur d'un buff (per-mille → %, sinon entier absolu). */
function fmtValue(buff: Row): string {
  const v = num(buff.Value);
  return isPermille(buff) ? `${Math.abs(v) / 10}%` : String(Math.abs(v));
}

/** Formate la durée en tours (`?` si non numérique, ex. permanent). */
function fmtTurn(buff: Row): string {
  return /^\d+$/.test(buff.TurnDuration ?? '') ? buff.TurnDuration! : '?';
}

/** Magnitude formatée d'une ligne de buff (per-mille → %, sinon entier absolu). Exposé pour le classifier. */
export function formatRowValue(buff: Row): string {
  return fmtValue(buff);
}

/**
 * Trouve la ligne d'un buff à un niveau donné.
 * `buffIdStr` peut être un CSV de plusieurs buffs ; `index` choisit lequel
 * (0 = principal ; sinon l'id en position `index`, ou `${id0}_${index+1}` en repli).
 * Exposé pour le solver.
 */
export function findBuff(
  buffsByID: Map<string, Row[]>,
  buffIdStr: string,
  level: number,
  index = 0,
): Row | undefined {
  const ids = buffIdStr.split(',').map((s) => s.trim());
  const targetId = index === 0 ? ids[0] : (ids[index] ?? `${ids[0]}_${index + 1}`);
  return buffsByID.get(targetId)?.find((r) => r.Level === String(level));
}

/**
 * Buff « de fiche » : versé aux stats du personnage hors combat, donc compté
 * dans la fiche et la CP. Règle du client : `CSkillManager.GetStatPremiumBuffList`
 * garde les `BT_STAT_PREMIUM` dont `IsBuffCreateType(PASSIVE)` (égalité
 * stricte : ni `PASSIVE2` ni `ON_SPAWN`) et `IsCallerSkillType(SKT_ALL)`
 * (toujours vrai), puis `CCharacterData.InitStatPremiumBuff` ne retient que
 * `TargetType` `ME` ou `MY_TEAM`. Ni la condition (`BuffConditionType`) ni la
 * durée ne sont regardées, et un buff caché passe comme un autre. Mêmes
 * sources côté client : compétences, uniques d'objet (`m_ItemBuffTempletList`),
 * nœuds d'éveil, Infiltration, Monad Gate, cadeau du jour.
 */
export function isStatSheetBuff(buff: Row): boolean {
  return (
    buff.Type === 'BT_STAT_PREMIUM' &&
    buff.BuffCreateType === 'PASSIVE' &&
    (buff.TargetType === 'ME' || buff.TargetType === 'MY_TEAM')
  );
}

/** Extrait les valeurs formatées d'un buff (et de ses buffs CSV) à un niveau donné. */
export function buffValuesAt(
  buffsByID: Map<string, Row[]>,
  buffIdStr: string,
  level: number,
): BuffValues {
  const b = findBuff(buffsByID, buffIdStr, level, 0);
  const b2 = findBuff(buffsByID, buffIdStr, level, 1);
  const b4 = findBuff(buffsByID, buffIdStr, level, 3);
  const b5 = findBuff(buffsByID, buffIdStr, level, 4);

  const out: BuffValues = {};
  if (b) {
    out.value = fmtValue(b);
    if (num(b.CreateRate) > 0) out.rate = `${num(b.CreateRate) / 10}%`;
    if (fmtTurn(b) !== '?') out.turn = fmtTurn(b);
  }
  if (b2) {
    out.value2 = fmtValue(b2);
    if (fmtTurn(b2) !== '?') out.turn2 = fmtTurn(b2);
  }
  if (b4) out.value4 = fmtValue(b4);
  if (b5) out.value5 = fmtValue(b5);
  return out;
}

/**
 * Remplit un template (`[Value]`, `[Rate]`, `[Turn]` + variantes) avec des valeurs.
 * C'est LA méthode de résolution à la demande : `fillPlaceholders(passive.desc, passive.values[reforge], { color })`.
 * `color` enrobe chaque valeur de `<color=#28d9ed>` (présentation) ; valeur absente → `?`.
 * La règle vit dans `placeholders.ts` (partagée avec le site) ; ici, sans couleur par défaut.
 */
export function fillPlaceholders(template: string, v: BuffValues, color = false): string {
  return fillValuePlaceholders(template, v, color);
}

// --- placeholders de COMPÉTENCE (primitive #5) -------------------------------
// Les descriptions de skills utilisent un format distinct de l'équipement :
// chaque placeholder embarque l'id COMPLET du buff visé —
//   [Buff_C_<id>] = chance d'application (CreateRate, %)
//   [Buff_V_<id>] = valeur (règle du client, cf. `skillValue`)
//   [Buff_T_<id>] = durée en tours (TurnDuration)
// Les niveaux d'un buff de skill sont creux (1,3,5…) : on retombe sur le niveau
// défini le plus proche INFÉRIEUR ou égal à celui demandé.

/** Ligne d'un buff au niveau ≤ demandé le plus proche (`undefined` si aucune). */
export function buffRowAtLevel(
  buffsByID: Map<string, Row[]>,
  buffId: string,
  level: number,
): Row | undefined {
  const rows = buffsByID.get(buffId.trim());
  if (!rows?.length) return undefined;
  let best: Row | undefined;
  let bestLv = -1;
  for (const r of rows) {
    const lv = num(r.Level) || 1;
    if (lv <= level && lv > bestLv) {
      best = r;
      bestLv = lv;
    }
  }
  return (
    best ??
    rows.find((r) => (num(r.Level) || 1) === Math.min(...rows.map((x) => num(x.Level) || 1)))
  );
}

/**
 * Valeur d'un `[Buff_V_<id>]` : la règle du client (`GetSkillDescReplaceText`,
 * branche `v`) — `OAT_RATE` → magnitude/10 en %, sinon la valeur SIGNÉE — avec
 * le « % » décidé par `GetStatValue` (`IsPercentStat`) : pas de « 80 » pour
 * 8 % de CHC (décision de Sevih, 17/10/2026). `absolute` retire le signe
 * (texte « … by [Buff_V] », cf. `unsignedValueIds`).
 */
function skillValue(buff: Row, absolute: boolean): string {
  const v = num(buff.Value);
  const at = buff.ApplyingType ?? '';
  const stat = statSlug(buff.StatType) ?? undefined;
  return formatStatValue(at, at === 'OAT_RATE' || absolute ? Math.abs(v) : v, stat);
}

/**
 * Valeurs résolues d'un buff de skill au niveau demandé (clés absentes si nulles).
 * Sert À LA FOIS la desc (`[Buff_C/V/T_<id>]`) et les nombres des chips d'effet —
 * une seule source par niveau, pas de duplication. `absolute` : valeur sans signe (cf. `skillValue`).
 */
export function skillBuffVars(
  buffsByID: Map<string, Row[]>,
  buffId: string,
  level: number,
  { absolute = false }: { absolute?: boolean } = {},
): SkillBuffVars {
  const b = buffRowAtLevel(buffsByID, buffId, level);
  if (!b) return {};
  const out: SkillBuffVars = {};
  if (num(b.CreateRate) > 0) out.c = `${num(b.CreateRate) / 10}%`;
  if (num(b.Value) !== 0) out.v = skillValue(b, absolute);
  if (fmtTurn(b) !== '?') out.t = fmtTurn(b);
  return out;
}

/**
 * Remplit les placeholders `[Buff_C/V/T_<id>]` d'une description de compétence,
 * avec les valeurs des buffs visés AU NIVEAU demandé (règle de `placeholders.ts`,
 * signe retiré selon le template lui-même — à lui passer en anglais). Les
 * balises `<color=…>` du template source sont conservées telles quelles
 * (donnée canonique). `?` si la valeur n'existe pas.
 */
export function resolveSkillPlaceholders(
  template: string,
  buffsByID: Map<string, Row[]>,
  level: number,
): string {
  const unsigned = unsignedValueIds([template]);
  return fillSkillPlaceholders(template, (buffId) =>
    skillBuffVars(buffsByID, buffId, level, { absolute: unsigned.has(buffId) }),
  );
}

// --- groupes de buffs (BT_GROUP) ----------------------------------------------

/**
 * Enfants d'un buff conteneur `BT_GROUP` : sa `Value` pointe une ligne
 * `BuffGroupTemplet` dont les `Child*_BID` sont les buffs réellement appliqués
 * (ex. les stacks « Regina's World »). Sans expansion, l'effet réel est invisible.
 * `all=false` avec plusieurs enfants = le jeu en TIRE UN AU HASARD (Dianne :
 * une stat aléatoire parmi 4).
 */
export interface BuffGroup {
  kids: string[];
  all: boolean;
}

// Empreinte mtime : index UNIQUE de l'expansion Child1..10 (skills,
// monster-skills, equipment ×2 — plus de recopie de la boucle), invalidé au
// refresh des tables comme partout (modèle `curatedKeyCache`).
let buffGroupsCache: { data: Map<string, BuffGroup>; stamp: string } | undefined;

/** Index BuffGroupTemplet : id de groupe → enfants + mode de tirage. */
export function loadBuffGroups(): Map<string, BuffGroup> {
  const stamp = tablesStamp(['BuffGroupTemplet']);
  if (!buffGroupsCache || buffGroupsCache.stamp !== stamp) {
    const out = new Map<string, BuffGroup>();
    for (const g of loadTable('BuffGroupTemplet')) {
      if (!g.ID) continue;
      const kids: string[] = [];
      for (let i = 1; i <= 10; i++) {
        const bid = g[`Child${i}_BID`];
        if (bid) kids.push(bid);
      }
      out.set(g.ID, { kids, all: bool(g.IsAllCreate) });
    }
    buffGroupsCache = { data: out, stamp };
  }
  return buffGroupsCache.data;
}

/** Id de buff expansé + provenance (enfant d'un groupe ? à tirage aléatoire ?). */
export interface ExpandedBuff {
  id: string;
  choice?: boolean;
  /** Enfant d'un groupe (vs buff câblé directement sur le skill). */
  child?: boolean;
}

/** Ids de buffs d'un niveau, groupes `BT_GROUP` expansés en leurs enfants (id parent conservé). */
export function expandBuffIds(
  ids: string[],
  buffsByID: Map<string, Row[]>,
  groups: Map<string, BuffGroup>,
  level: number,
): ExpandedBuff[] {
  const out: ExpandedBuff[] = [];
  for (const id of ids) {
    out.push({ id });
    const row = buffRowAtLevel(buffsByID, id, level);
    if (row?.Type === 'BT_GROUP' || row?.Type === 'BT_GROUP_CASTER_TOOLTIP_CHECK') {
      const g = groups.get(row.Value ?? '');
      if (!g) continue;
      const choice = !g.all && g.kids.length > 1;
      for (const kid of g.kids) {
        const x: ExpandedBuff = { id: kid, child: true };
        if (choice) x.choice = true;
        out.push(x);
      }
    }
  }
  return out;
}
