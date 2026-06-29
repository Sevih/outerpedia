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
import { loadTable, num, withCaseInsensitiveGet, type Row } from './tables';

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

/** Niveau max disponible pour un BuffID (premier id si CSV). Défaut 1. */
export function getMaxLevel(buffsByID: Map<string, Row[]>, buffIdStr: string): number {
  const id = buffIdStr.split(',')[0]?.trim();
  const rows = id ? buffsByID.get(id) : undefined;
  if (!rows?.length) return 1;
  return Math.max(...rows.map((r) => num(r.Level) || 1));
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
  return template
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
    .replace(/\[\+Turn1?\]/gi, f(v.turn))
    .replace(/\[-Turn\]/gi, fs(v.turn, '-'))
    .replace(/\[Turn2\]/gi, f(v.turn2))
    .replace(/\[Turn\]/gi, f(v.turn));
}

/** Raccourci : extrait les valeurs d'un buff à un niveau et remplit le template d'un coup. */
export function resolvePlaceholders(
  text: string,
  buffsByID: Map<string, Row[]>,
  buffIdStr: string,
  level: number,
  color = false,
): string {
  return fillPlaceholders(text, buffValuesAt(buffsByID, buffIdStr, level), color);
}
