/**
 * Codec `?z=` des filtres de `/characters` — CONTRAT PUBLIC hérité de la V2.
 *
 * La barre d'adresse EST le lien de partage (décision Sevih 21/07) : l'état
 * complet des filtres tient dans un seul paramètre compact (~60-120 chars quel
 * que soit le nombre de facettes), au lieu de 300 chars de params en clair.
 * Format V2 à l'identique : JSON compact → lz-string. Les liens V2
 * `/characters?z=…` en circulation se décodent donc ici tels quels.
 *
 * Le contrat, ce sont les POSITIONS DE BITS et les INDICES, pas les chaînes :
 * les tables ci-dessous posent les slugs V3 aux positions V2 (`Fire`=bit 0 →
 * `fire`=bit 0…). Pour buffs/debuffs/tags (vocabulaires ouverts), les indices
 * sont GELÉS depuis `effectsIndex.json` de la V2 (snapshot du 21/07) avec la
 * canonisation V3 appliquée au décodage : un indice de VARIANTE V2 (`…_IR`,
 * déclinaison numérotée) décode vers sa clé canonique V3 — celle des cases de
 * filtre. Toute clé future SANS indice gelé voyage en clair dans les champs
 * d'extension `bx`/`dx`/`tx` (illisibles pour la V2, mais la V2 est figée) :
 * AUCUNE table à maintenir, aucun risque de dérive d'indices.
 */
import LZString from 'lz-string';

/** État complet des filtres (mêmes champs que l'état du browser). */
export interface FilterState {
  q: string;
  element: string[];
  klass: string[];
  rarity: number[];
  chain: string[];
  gift: string[];
  role: string[];
  tags: string[];
  tagLogic: 'AND' | 'OR';
  buffs: string[];
  debuffs: string[];
  effectLogic: 'AND' | 'OR';
  sources: string[];
  showUnique: boolean;
  teamBonuses: string[];
}

/** Payload compact sérialisé (clés V2 + extensions bx/dx/tx). */
interface ZPayload {
  e?: number;
  c?: number;
  r?: number;
  ch?: number;
  g?: number;
  b?: number[];
  d?: number[];
  l?: 0 | 1;
  q?: string;
  r2?: number;
  t?: number[];
  tl?: 0 | 1;
  src?: number;
  u?: 0 | 1;
  tb?: number;
  /** Clés hors index gelé (nouveautés post-snapshot), en clair. */
  bx?: string[];
  dx?: string[];
  tx?: string[];
}

// ── Vocabulaires fermés : slugs V3 aux positions de bits V2 ────────────────

const ELEM_BIT: Record<string, number> = { fire: 0, water: 1, earth: 2, light: 3, dark: 4 };
const CLASS_BIT: Record<string, number> = {
  striker: 0,
  defender: 1,
  ranger: 2,
  healer: 3,
  mage: 4,
};
const CHAIN_BIT: Record<string, number> = { start: 0, join: 1, finish: 2 };
// V2 : Science, Luxury, Magic Tool, Craftwork, Natural Object — même ordre que
// les slugs du jeu present_01..05 (vérifié sur glossaries.gifts).
const GIFT_BIT: Record<string, number> = {
  present_01: 0,
  present_02: 1,
  present_03: 2,
  present_04: 3,
  present_05: 4,
};
const RARITY_BIT: Record<number, number> = { 1: 0, 2: 1, 3: 2 };
const ROLE_BIT: Record<string, number> = { dps: 0, support: 1, sustain: 2 };
// V2 : SKT_FIRST, SKT_SECOND, SKT_ULTIMATE, SKT_CHAIN_PASSIVE, DUAL_ATTACK,
// EXCLUSIVE_EQUIP, SKT_FUSION_PASSIVE → clés de source V3, mêmes positions.
const SRC_BIT: Record<string, number> = {
  s1: 0,
  s2: 1,
  ultimate: 2,
  chainPassive: 3,
  dualAttack: 4,
  exclusiveEquip: 5,
  fusionPassive: 6,
};
// Identique au TB_KEYS V2 (et au TB_ORDER du générateur characters-list).
const TB_KEYS = [
  'SPD',
  'ATK',
  'HP',
  'DEF',
  'CHD',
  'CHC',
  'DMG UP%',
  'DMG RED%',
  'CDMG RED%',
  'PEN%',
  'EFF',
  'RES',
  'LS',
];
const TB_BIT: Record<string, number> = Object.fromEntries(TB_KEYS.map((v, i) => [v, i]));

// ── Vocabulaires ouverts : indices GELÉS (snapshot effectsIndex.json V2) ───
// `*_ENC` : clé canonique V3 → son propre indice V2 (encodage).
// `*_DEC` : indice V2 → clé canonique V3 (décodage — les variantes V2 pointent
// leur canonique, d'où des indices multiples vers la même clé).
// NE JAMAIS modifier une paire existante ; ne jamais réattribuer un indice.

const BUFF_ENC: Record<string, number> = {
  BT_DAMAGE_TAKEN: 1,
  BT_STAT_BUFF_ENHANCE_IR: 2,
  BUFF_ENHANCEMENT: 3,
  CORE_ENERGY: 4,
  COURAGE_AGAINST_DESPAIR: 5,
  COURAGE_DESPAIR_ELEM: 6,
  ENVIRONMENTAL_CHANGE_RESPONSE: 7,
  EXCLUDE_UNKNOWN_VARIABLES: 8,
  REMOVE_DETECTION_INTERFERENCE: 9,
  WEATHER_VARIABLE_RESPONSE: 10,
  BT_RANDOM_STAT: 11,
  'BT_STAT|ST_ACCURACY': 12,
  'BT_STAT|ST_ATK': 13,
  'BT_STAT|ST_BUFF_CHANCE': 14,
  'BT_STAT|ST_BUFF_RESIST': 15,
  'BT_STAT|ST_CRITICAL_DMG_RATE': 16,
  'BT_STAT|ST_CRITICAL_RATE': 18,
  'BT_STAT|ST_DEF': 19,
  'BT_STAT|ST_PIERCE_POWER_RATE': 20,
  'BT_STAT|ST_SPEED': 21,
  BT_CONTINU_HEAL: 28,
  BT_EXTEND_BUFF: 29,
  BT_EXTEND_DEBUFF: 30,
  BT_IMMUNE: 31,
  BT_INVINCIBLE: 32,
  BT_REMOVE_DEBUFF: 33,
  BT_RESURRECTION: 34,
  BT_REVIVAL: 35,
  BT_BARRIER: 36,
  'BT_STAT|ST_VAMPIRIC': 38,
  BT_STEALTHED: 39,
  BT_UNDEAD: 41,
  ARIEL: 44,
  A_NINJAS_AFTERIMAGE: 45,
  BANES_DOMAIN: 46,
  BT_CASTER_COPY_BUFF: 47,
  CHARISMA: 48,
  DESTROYERS_PUNISHMENT: 49,
  DOLL_GARDENS_CARETAKER: 50,
  ETHER_BOOST: 51,
  FIERCE_OFFENSIVE: 52,
  GRACE_OF_THE_VIRGIN_GODDESS: 53,
  HARMONY_OF_DESPAIR: 54,
  HUBRISS_DOMINION: 55,
  MANDALA: 56,
  POLAR_NIGHT: 57,
  PUREBLOODS_DOMINION: 58,
  RADIANT_WILL: 59,
  REGINAS_WORLD: 60,
  RETRIBUTIONS_DOMINION: 61,
  SAKURA_CHIRU: 62,
  SELFISH_GOD: 63,
  SHOW_YOUR_LOYALTY: 64,
  SPATIAL_DISTORTION_SELF: 65,
  UME_ICHIRIN: 66,
  WHITE_NIGHT: 67,
  BT_ACTION_GAUGE: 68,
  BT_ADDITIVE_ATTACK: 69,
  BT_ADDITIVE_TURN: 70,
  BT_AGILE_RESPONSE: 71,
  BT_AP_CHARGE: 72,
  BT_CALL_BACKUP: 73,
  BT_COOL_CHARGE: 74,
  BT_CP_CHARGE: 76,
  BT_DMG_ELEMENT_SUPERIORITY: 77,
  BT_DMG_TARGET_BREAK: 78,
  BT_EXTRA_ATTACK_ON_TURN_END: 79,
  BT_REVENGE: 80,
  BT_SEAL_COUNTER: 81,
  'BT_STAT|ST_AVOID': 82,
  'BT_STAT|ST_COUNTER_RATE': 83,
  HEAVY_STRIKE: 84,
  FINAL_BRAND: 89,
  RUSH: 90,
};

const BUFF_DEC: Record<number, string> = {
  1: 'BT_DAMAGE_TAKEN',
  2: 'BT_STAT_BUFF_ENHANCE_IR',
  3: 'BUFF_ENHANCEMENT',
  4: 'CORE_ENERGY',
  5: 'COURAGE_AGAINST_DESPAIR',
  6: 'COURAGE_DESPAIR_ELEM',
  7: 'ENVIRONMENTAL_CHANGE_RESPONSE',
  8: 'EXCLUDE_UNKNOWN_VARIABLES',
  9: 'REMOVE_DETECTION_INTERFERENCE',
  10: 'WEATHER_VARIABLE_RESPONSE',
  11: 'BT_RANDOM_STAT',
  12: 'BT_STAT|ST_ACCURACY',
  13: 'BT_STAT|ST_ATK',
  14: 'BT_STAT|ST_BUFF_CHANCE',
  15: 'BT_STAT|ST_BUFF_RESIST',
  16: 'BT_STAT|ST_CRITICAL_DMG_RATE',
  17: 'BT_STAT|ST_CRITICAL_DMG_RATE',
  18: 'BT_STAT|ST_CRITICAL_RATE',
  19: 'BT_STAT|ST_DEF',
  20: 'BT_STAT|ST_PIERCE_POWER_RATE',
  21: 'BT_STAT|ST_SPEED',
  22: 'BT_STAT|ST_ATK',
  23: 'BT_STAT|ST_BUFF_CHANCE',
  24: 'BT_STAT|ST_CRITICAL_RATE',
  25: 'BT_STAT|ST_DEF',
  26: 'BT_STAT|ST_PIERCE_POWER_RATE',
  27: 'BT_STAT|ST_SPEED',
  28: 'BT_CONTINU_HEAL',
  29: 'BT_EXTEND_BUFF',
  30: 'BT_EXTEND_DEBUFF',
  31: 'BT_IMMUNE',
  32: 'BT_INVINCIBLE',
  33: 'BT_REMOVE_DEBUFF',
  34: 'BT_RESURRECTION',
  35: 'BT_REVIVAL',
  36: 'BT_BARRIER',
  37: 'BT_BARRIER',
  38: 'BT_STAT|ST_VAMPIRIC',
  39: 'BT_STEALTHED',
  40: 'BT_STEALTHED',
  41: 'BT_UNDEAD',
  42: 'BT_IMMUNE',
  43: 'BT_INVINCIBLE',
  44: 'ARIEL',
  45: 'A_NINJAS_AFTERIMAGE',
  46: 'BANES_DOMAIN',
  47: 'BT_CASTER_COPY_BUFF',
  48: 'CHARISMA',
  49: 'DESTROYERS_PUNISHMENT',
  50: 'DOLL_GARDENS_CARETAKER',
  51: 'ETHER_BOOST',
  52: 'FIERCE_OFFENSIVE',
  53: 'GRACE_OF_THE_VIRGIN_GODDESS',
  54: 'HARMONY_OF_DESPAIR',
  55: 'HUBRISS_DOMINION',
  56: 'MANDALA',
  57: 'POLAR_NIGHT',
  58: 'PUREBLOODS_DOMINION',
  59: 'RADIANT_WILL',
  60: 'REGINAS_WORLD',
  61: 'RETRIBUTIONS_DOMINION',
  62: 'SAKURA_CHIRU',
  63: 'SELFISH_GOD',
  64: 'SHOW_YOUR_LOYALTY',
  65: 'SPATIAL_DISTORTION_SELF',
  66: 'UME_ICHIRIN',
  67: 'WHITE_NIGHT',
  68: 'BT_ACTION_GAUGE',
  69: 'BT_ADDITIVE_ATTACK',
  70: 'BT_ADDITIVE_TURN',
  71: 'BT_AGILE_RESPONSE',
  72: 'BT_AP_CHARGE',
  73: 'BT_CALL_BACKUP',
  74: 'BT_COOL_CHARGE',
  75: 'BT_STAT|ST_COUNTER_RATE',
  76: 'BT_CP_CHARGE',
  77: 'BT_DMG_ELEMENT_SUPERIORITY',
  78: 'BT_DMG_TARGET_BREAK',
  79: 'BT_EXTRA_ATTACK_ON_TURN_END',
  80: 'BT_REVENGE',
  81: 'BT_SEAL_COUNTER',
  82: 'BT_STAT|ST_AVOID',
  83: 'BT_STAT|ST_COUNTER_RATE',
  84: 'HEAVY_STRIKE',
  85: 'BT_CALL_BACKUP',
  86: 'BT_COOL_CHARGE',
  87: 'BT_COOL_CHARGE',
  88: 'BT_STAT|ST_COUNTER_RATE',
  89: 'FINAL_BRAND',
  90: 'RUSH',
};

const DEBUFF_ENC: Record<string, number> = {
  BT_ACTION_GAUGE: 1,
  BT_AGGRO: 2,
  BT_AP_CHARGE: 4,
  BT_CP_CHARGE: 5,
  BT_COOL_CHARGE: 6,
  ETERNAL_BLEEDING: 8,
  BT_DOT_BLEED: 9,
  BT_DOT_BURN: 10,
  BT_DOT_CURSE: 11,
  BT_DOT_LIGHTNING: 12,
  BT_DOT_POISON: 15,
  BT_EXTEND_BUFF: 17,
  BT_EXTEND_DEBUFF: 18,
  BT_FIXED_DAMAGE: 19,
  BT_FREEZE: 20,
  DETONATE: 22,
  SHICHIFUJAS_CURSE: 23,
  BT_MARKING: 24,
  BT_RANDOM: 25,
  BT_RANDOM_DEBUFF: 26,
  BT_REMOVE_BUFF: 27,
  BT_RESOURCE_DOWN: 28,
  BT_SEALED: 29,
  BT_SEALED_RECEIVE_HEAL: 30,
  BT_SEALED_RESURRECTION: 32,
  BT_SEAL_ADDITIVE_ATTACK: 33,
  BT_SEAL_BT_CALL_BACKUP_IR: 35,
  BT_SEAL_ADDITIVE_TURN_IR: 36,
  BT_SILENCE: 37,
  BT_STATBUFF_CONVERT_TO_STATDEBUFF: 39,
  'BT_STAT|ST_ACCURACY': 40,
  'BT_STAT|ST_ATK': 41,
  'BT_STAT|ST_AVOID': 43,
  'BT_STAT|ST_BUFF_CHANCE': 44,
  'BT_STAT|ST_BUFF_RESIST': 46,
  'BT_STAT|ST_CRITICAL_DMG_RATE': 48,
  'BT_STAT|ST_CRITICAL_RATE': 50,
  'BT_STAT|ST_DEF': 52,
  'BT_STAT|ST_PIERCE_POWER_RATE': 54,
  'BT_STAT|ST_SPEED': 55,
  BT_STEAL_BUFF: 57,
  BT_STONE: 58,
  BT_STUN: 60,
  BT_SYS_BUFF_ENHANCE_DEBUFF_UP: 62,
  BT_STAT_DEBUFF_ENHANCE_IR: 63,
  BT_WG_REVERSE_HEAL: 64,
  EXECUTION_TIME: 65,
  BT_DMG_REDUCE_IR: 66,
  BT_DEATH_IR: 67,
  IRREGULAR_INFECTION: 70,
  KERAUNOS: 72,
  CORROSIVE_POISON: 73,
  BT_KILL_UNDER_HP_RATE: 74,
  BT_GOLDEN_CURSE: 75,
  SPATIAL_DISTORTION_ENEMY: 76,
  BANES_DOMAIN: 77,
  BT_REDISTRIBUTE_BUFF: 78,
};

const DEBUFF_DEC: Record<number, string> = {
  1: 'BT_ACTION_GAUGE',
  2: 'BT_AGGRO',
  3: 'BT_AGGRO',
  4: 'BT_AP_CHARGE',
  5: 'BT_CP_CHARGE',
  6: 'BT_COOL_CHARGE',
  7: 'BT_COOL_CHARGE',
  8: 'ETERNAL_BLEEDING',
  9: 'BT_DOT_BLEED',
  10: 'BT_DOT_BURN',
  11: 'BT_DOT_CURSE',
  12: 'BT_DOT_LIGHTNING',
  13: 'BT_DOT_LIGHTNING',
  14: 'BT_DOT_BLEED',
  15: 'BT_DOT_POISON',
  16: 'BT_DOT_POISON',
  17: 'BT_EXTEND_BUFF',
  18: 'BT_EXTEND_DEBUFF',
  19: 'BT_FIXED_DAMAGE',
  20: 'BT_FREEZE',
  21: 'BT_FREEZE',
  22: 'DETONATE',
  23: 'SHICHIFUJAS_CURSE',
  24: 'BT_MARKING',
  25: 'BT_RANDOM',
  26: 'BT_RANDOM_DEBUFF',
  27: 'BT_REMOVE_BUFF',
  28: 'BT_RESOURCE_DOWN',
  29: 'BT_SEALED',
  30: 'BT_SEALED_RECEIVE_HEAL',
  31: 'BT_SEALED_RECEIVE_HEAL',
  32: 'BT_SEALED_RESURRECTION',
  33: 'BT_SEAL_ADDITIVE_ATTACK',
  34: 'BT_SEAL_ADDITIVE_ATTACK',
  35: 'BT_SEAL_BT_CALL_BACKUP_IR',
  36: 'BT_SEAL_ADDITIVE_TURN_IR',
  37: 'BT_SILENCE',
  38: 'BT_SILENCE',
  39: 'BT_STATBUFF_CONVERT_TO_STATDEBUFF',
  40: 'BT_STAT|ST_ACCURACY',
  41: 'BT_STAT|ST_ATK',
  42: 'BT_STAT|ST_ATK',
  43: 'BT_STAT|ST_AVOID',
  44: 'BT_STAT|ST_BUFF_CHANCE',
  45: 'BT_STAT|ST_BUFF_CHANCE',
  46: 'BT_STAT|ST_BUFF_RESIST',
  47: 'BT_STAT|ST_BUFF_RESIST',
  48: 'BT_STAT|ST_CRITICAL_DMG_RATE',
  49: 'BT_STAT|ST_CRITICAL_DMG_RATE',
  50: 'BT_STAT|ST_CRITICAL_RATE',
  51: 'BT_STAT|ST_CRITICAL_RATE',
  52: 'BT_STAT|ST_DEF',
  53: 'BT_STAT|ST_DEF',
  54: 'BT_STAT|ST_PIERCE_POWER_RATE',
  55: 'BT_STAT|ST_SPEED',
  56: 'BT_STAT|ST_SPEED',
  57: 'BT_STEAL_BUFF',
  58: 'BT_STONE',
  59: 'BT_STONE',
  60: 'BT_STUN',
  61: 'BT_STUN',
  62: 'BT_SYS_BUFF_ENHANCE_DEBUFF_UP',
  63: 'BT_STAT_DEBUFF_ENHANCE_IR',
  64: 'BT_WG_REVERSE_HEAL',
  65: 'EXECUTION_TIME',
  66: 'BT_DMG_REDUCE_IR',
  67: 'BT_DEATH_IR',
  68: 'BT_DOT_BURN',
  69: 'BT_DOT_CURSE',
  70: 'IRREGULAR_INFECTION',
  71: 'BT_SEALED',
  72: 'KERAUNOS',
  73: 'CORROSIVE_POISON',
  74: 'BT_KILL_UNDER_HP_RATE',
  75: 'BT_GOLDEN_CURSE',
  76: 'SPATIAL_DISTORTION_ENEMY',
  77: 'BANES_DOMAIN',
  78: 'BT_REDISTRIBUTE_BUFF',
  79: 'BT_STAT|ST_PIERCE_POWER_RATE',
};

const TAG_ENC: Record<string, number> = {
  'ignore-defense': 1,
  premium: 2,
  limited: 3,
  seasonal: 4,
  collab: 5,
  free: 6,
  'core-fusion': 7,
};
const TAG_DEC: Record<number, string> = Object.fromEntries(
  Object.entries(TAG_ENC).map(([k, v]) => [v, k]),
);

// ── Bitfields ──────────────────────────────────────────────────────────────

const invert = <T extends string | number>(map: Record<T, number>): Record<number, T> =>
  Object.fromEntries(Object.entries(map).map(([k, v]) => [v as number, k])) as Record<number, T>;

const ELEM_INV = invert(ELEM_BIT);
const CLASS_INV = invert(CLASS_BIT);
const CHAIN_INV = invert(CHAIN_BIT);
const GIFT_INV = invert(GIFT_BIT);
const ROLE_INV = invert(ROLE_BIT);
const SRC_INV = invert(SRC_BIT);
const TB_INV: Record<number, string> = Object.fromEntries(TB_KEYS.map((v, i) => [i, v]));
const RARITY_INV: Record<number, number> = { 0: 1, 1: 2, 2: 3 };

function toBits<T extends string | number>(arr: T[], map: Record<T, number>): number | undefined {
  let bits = 0;
  for (const v of arr) if (v in map) bits |= 1 << map[v];
  return bits || undefined;
}

function fromBits<T>(bits: number | undefined, inv: Record<number, T>, count: number): T[] {
  if (!bits) return [];
  const out: T[] = [];
  for (let i = 0; i < count; i++) if (bits & (1 << i)) out.push(inv[i]);
  return out;
}

/** Sépare une liste en (indices gelés, clés hors index). */
function toIdx(
  arr: string[],
  enc: Record<string, number>,
): { idx: number[] | undefined; extra: string[] | undefined } {
  const idx: number[] = [];
  const extra: string[] = [];
  for (const k of arr) {
    const i = enc[k];
    if (i) idx.push(i);
    else extra.push(k);
  }
  return { idx: idx.length ? idx : undefined, extra: extra.length ? extra : undefined };
}

/** Indices → clés canoniques + clés d'extension, dédupliqués dans l'ordre. */
function fromIdx(
  idx: number[] | undefined,
  extra: string[] | undefined,
  dec: Record<number, string>,
): string[] {
  const keys = [
    ...(idx ?? []).map((i) => dec[i]).filter((k): k is string => Boolean(k)),
    ...(extra ?? []),
  ];
  return [...new Set(keys)];
}

// ── Encode / décode ────────────────────────────────────────────────────────

/** Encode l'état des filtres — `undefined` si tout est vide (URL nue). */
export function encodeFilters(s: FilterState): string | undefined {
  const b = toIdx(s.buffs, BUFF_ENC);
  const d = toIdx(s.debuffs, DEBUFF_ENC);
  const t = toIdx(s.tags, TAG_ENC);
  const z: ZPayload = {
    e: toBits(s.element, ELEM_BIT),
    c: toBits(s.klass, CLASS_BIT),
    r: toBits(s.rarity, RARITY_BIT),
    ch: toBits(s.chain, CHAIN_BIT),
    g: toBits(s.gift, GIFT_BIT),
    b: b.idx,
    d: d.idx,
    l: (s.buffs.length || s.debuffs.length) && s.effectLogic === 'AND' ? 1 : undefined,
    q: s.q.trim() || undefined,
    r2: toBits(s.role, ROLE_BIT),
    t: t.idx,
    tl: s.tags.length && s.tagLogic === 'AND' ? 1 : undefined,
    src: toBits(s.sources, SRC_BIT),
    u: s.showUnique ? 1 : undefined,
    tb: toBits(s.teamBonuses, TB_BIT),
    bx: b.extra,
    dx: d.extra,
    tx: t.extra,
  };
  const json = JSON.stringify(z);
  if (json === '{}') return undefined;
  return LZString.compressToEncodedURIComponent(json);
}

/** Décode un `?z=` (V2 ou V3) — `null` si illisible. */
export function decodeFilters(z: string | null | undefined): FilterState | null {
  if (!z) return null;
  try {
    const json = LZString.decompressFromEncodedURIComponent(z);
    if (!json) return null;
    const raw = JSON.parse(json) as ZPayload;
    return {
      q: raw.q ?? '',
      element: fromBits(raw.e, ELEM_INV, 5),
      klass: fromBits(raw.c, CLASS_INV, 5),
      rarity: fromBits(raw.r, RARITY_INV, 3),
      chain: fromBits(raw.ch, CHAIN_INV, 3),
      gift: fromBits(raw.g, GIFT_INV, 5),
      role: fromBits(raw.r2, ROLE_INV, 3),
      tags: fromIdx(raw.t, raw.tx, TAG_DEC),
      tagLogic: raw.tl === 1 ? 'AND' : 'OR',
      buffs: fromIdx(raw.b, raw.bx, BUFF_DEC),
      debuffs: fromIdx(raw.d, raw.dx, DEBUFF_DEC),
      effectLogic: raw.l === 1 ? 'AND' : 'OR',
      sources: fromBits(raw.src, SRC_INV, 7),
      showUnique: raw.u === 1,
      teamBonuses: fromBits(raw.tb, TB_INV, TB_KEYS.length),
    };
  } catch {
    return null;
  }
}
