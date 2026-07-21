/**
 * Primitive #buff — résolution des buffs (BuffTemplet) et de leurs placeholders.
 *
 * Logique portée de la V2 éprouvée (equip/lib.ts + text-v2.ts) : le savoir
 * reverse-engineeré (échelle permille, niveaux, multi-buff CSV) qu'on ne veut
 * surtout pas re-deviner.
 *
 * Un BuffID a plusieurs niveaux (lignes BuffTemplet). Les descriptions du jeu
 * contiennent des placeholders `[Value]`, `[Rate]`, `[Turn]` (et variantes
 * `[+Value]`, `[Value2]`, `[Value4]`, `[Value5]`, `[Turn2]`…) résolus depuis la
 * ligne du buff au niveau demandé.
 *
 * NOTE : on ne met PAS le wrap couleur `<color=#28d9ed>` de la V2 ici — c'est
 * de la présentation, pas de la donnée canonique. Le front stylise s'il veut.
 */
import { bool, loadTable, num, tablesStamp, withCaseInsensitiveGet, type Row } from './tables';

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
 */
function findBuff(
  buffsByID: Map<string, Row[]>,
  buffIdStr: string,
  level: number,
  index = 0,
): Row | undefined {
  const ids = buffIdStr.split(',').map((s) => s.trim());
  const targetId = index === 0 ? ids[0] : (ids[index] ?? `${ids[0]}_${index + 1}`);
  return buffsByID.get(targetId)?.find((r) => r.Level === String(level));
}

/** Valeurs formatées d'un buff à un niveau, prêtes à remplir un template (clés absentes si non applicables). */
export interface BuffValues {
  value?: string;
  rate?: string;
  turn?: string;
  value2?: string;
  turn2?: string;
  value4?: string;
  value5?: string;
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
 */
export function fillPlaceholders(template: string, v: BuffValues, color = false): string {
  const w = (s: string) => (color ? `<color=#28d9ed>${s}</color>` : s);
  const f = (s: string | undefined) => (s == null ? '?' : w(s));
  const fs = (s: string | undefined, sign: '+' | '-') => (s == null ? '?' : w(`${sign}${s}`));
  return (
    template
      .replace(/\[\+Value5\]/gi, fs(v.value5, '+'))
      .replace(/\[-Value5\]/gi, fs(v.value5, '-'))
      .replace(/\[Value5\]/gi, f(v.value5))
      .replace(/\[\+Value4\]/gi, fs(v.value4, '+'))
      .replace(/\[-Value4\]/gi, fs(v.value4, '-'))
      .replace(/\[Value4\]/gi, f(v.value4))
      .replace(/\[\+Value2\]/gi, fs(v.value2, '+'))
      .replace(/\[-Value2\]/gi, fs(v.value2, '-'))
      .replace(/\[Value2\]/gi, f(v.value2))
      .replace(/\[RATE\]/gi, f(v.rate))
      .replace(/\[Rate1?\]/g, f(v.rate))
      .replace(/\[\+Value\]/gi, fs(v.value, '+'))
      .replace(/\[-Value\]/gi, fs(v.value, '-'))
      .replace(/\[Value\]/gi, f(v.value))
      // `[+Turn]` SANS signe, volontairement (vérifié 2026-07-21 sur les 22
      // usages réels + la V2, qui fait pareil) : contrairement à `[+Value]` qui
      // est un DELTA (« ATK +15 % »), celui-ci est une DURÉE — les gabarits du
      // jeu disent « [+Turn]ターンの間 » / « [+Turn]턴 » / « [+Turn]回合 », soit
      // « pendant N tours ». Un signe donnerait « pendant +2 tours ». Le « + » du
      // nom ne désigne donc pas le signe. (`[-Turn]` n'apparaît nulle part dans
      // les tables : défensif.)
      .replace(/\[\+Turn1?\]/gi, f(v.turn))
      .replace(/\[-Turn\]/gi, fs(v.turn, '-'))
      .replace(/\[Turn2\]/gi, f(v.turn2))
      .replace(/\[Turn\]/gi, f(v.turn))
  );
}

// --- placeholders de COMPÉTENCE (primitive #5) -------------------------------
// Les descriptions de skills utilisent un format distinct de l'équipement :
// chaque placeholder embarque l'id COMPLET du buff visé —
//   [Buff_C_<id>] = chance d'application (CreateRate, %)
//   [Buff_V_<id>] = valeur (per-mille /10 si applicable, sinon entier absolu)
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

/** Valeurs de placeholder d'un buff de skill à un niveau : chance / valeur / tours. */
export interface SkillBuffVars {
  /** Chance d'application (CreateRate/10, incl. 100%) — `[Buff_C_<id>]`. */
  c?: string;
  /** Valeur (magnitude absolue, per-mille /10 si applicable) — `[Buff_V_<id>]`. */
  v?: string;
  /** Durée en tours (TurnDuration) — `[Buff_T_<id>]`. */
  t?: string;
}

/**
 * Valeurs résolues d'un buff de skill au niveau demandé (clés absentes si nulles).
 * Sert À LA FOIS la desc (`[Buff_C/V/T_<id>]`) et les nombres des chips d'effet —
 * une seule source par niveau, pas de duplication.
 */
export function skillBuffVars(
  buffsByID: Map<string, Row[]>,
  buffId: string,
  level: number,
): SkillBuffVars {
  const b = buffRowAtLevel(buffsByID, buffId, level);
  if (!b) return {};
  const out: SkillBuffVars = {};
  if (num(b.CreateRate) > 0) out.c = `${num(b.CreateRate) / 10}%`;
  if (num(b.Value) !== 0) out.v = fmtValue(b);
  if (fmtTurn(b) !== '?') out.t = fmtTurn(b);
  return out;
}

/**
 * Remplit les placeholders `[Buff_C/V/T_<id>]` d'une description de compétence,
 * avec les valeurs des buffs visés AU NIVEAU demandé. Les balises `<color=…>`
 * du template source sont conservées telles quelles (donnée canonique).
 * `?` si la valeur n'existe pas.
 */
export function resolveSkillPlaceholders(
  template: string,
  buffsByID: Map<string, Row[]>,
  level: number,
): string {
  return template.replace(/\[Buff_([CVT])_(.+?)\]/g, (_m, kind: string, buffId: string) => {
    const vars = skillBuffVars(buffsByID, buffId, level);
    const val = kind === 'C' ? vars.c : kind === 'T' ? vars.t : vars.v;
    return val ?? '?';
  });
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
