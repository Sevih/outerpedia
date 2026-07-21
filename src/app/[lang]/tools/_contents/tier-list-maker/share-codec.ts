/**
 * Tier-list maker — CODEC du lien de partage (portage V2, format de fil
 * IDENTIQUE : des liens `?z=` V2 circulent, ils doivent se décoder ici).
 *
 * Le placement est l'essentiel du payload. Les items ne sont JAMAIS stockés en
 * clés : chaque item est une position dans une liste par type triée par id
 * numérique — liste en append-only (le nouveau contenu du jeu a un id plus
 * haut), donc les positions restent stables au fil des mises à jour.
 *
 * Pour le cas courant (liste mono-type), le placement est encodé en RANG DE
 * SÉLECTION : en parcourant les items dans l'ordre d'affichage, chacun stocke
 * sa position parmi les entrées ENCORE disponibles du pool — soit
 * `ceil(log2(restants))` bits. Les premiers coûtent ~7 bits, les derniers 0 :
 * proche du plancher d'information, loin devant un index fixe par item.
 *
 * Format du paramètre `z` :
 *   "1" + b64url(titre) + "," + (b64url(label) + "," + codeCouleur) par tier
 *       + "," + b64url(binaire)
 * Chaque segment est en base64url ou en code couleur alphanumérique — aucun
 * "%" ni "+", la valeur survit à un aller-retour URLSearchParams. Les virgules
 * séparent les segments ; l'alphabet base64url n'en contient pas.
 */

export type Tier = {
  id: string;
  label: string;
  color: string;
  items: string[];
};

export const TIER_PALETTE = [
  '#ff7f7f',
  '#ffbf7f',
  '#ffdf7f',
  '#ffff7f',
  '#bfff7f',
  '#7fffbf',
  '#7fdfff',
  '#7f9fff',
  '#bf7fff',
  '#ff7fdf',
  '#d4d4d8',
  '#9ca3af',
];

const TYPE_BITS = 2; // 3 types d'item + 1 marqueur « mixte »
const MIXED_COUNT_BITS = 9; // mode mixte : items par tier
const MIXED_INDEX_BITS = 9; // mode mixte : index d'item par type
const POOL_BITS = 12; // mono-type : taille du pool canonique stockée

/** Bits nécessaires pour représenter les valeurs 0..n-1. */
function bitsFor(n: number): number {
  return n <= 1 ? 0 : 32 - Math.clz32(n - 1);
}

/** Listes par type triées par id numérique (stable) + index inverse. */
export type Canon = {
  byType: { key: string }[][]; // [characters, ee, bosses]
  index: Map<string, { type: number; idx: number }>;
};

export function buildCanon(
  characters: { key: string }[],
  ee: { key: string }[],
  bosses: { key: string }[],
): Canon {
  const numId = (k: string) => Number(k.slice(1)) || 0;
  const byType = [characters, ee, bosses].map((arr) =>
    [...arr].sort((a, b) => numId(a.key) - numId(b.key)),
  );
  const index = new Map<string, { type: number; idx: number }>();
  byType.forEach((list, type) => list.forEach((it, idx) => index.set(it.key, { type, idx })));
  return { byType, index };
}

/* base64 : btoa/atob côté navigateur, Buffer côté node (tests). */
function binToB64url(bin: string): string {
  const b64 =
    typeof btoa === 'function' ? btoa(bin) : Buffer.from(bin, 'binary').toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlToBin(s: string): string {
  const pad = s.length % 4 ? 4 - (s.length % 4) : 0;
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(pad);
  return typeof atob === 'function' ? atob(b64) : Buffer.from(b64, 'base64').toString('binary');
}

class BitWriter {
  private bits: number[] = [];
  write(value: number, n: number) {
    for (let i = n - 1; i >= 0; i--) this.bits.push((value >>> i) & 1);
  }
  toBase64url(): string {
    const bytes = new Uint8Array(Math.ceil(this.bits.length / 8));
    this.bits.forEach((bit, i) => {
      if (bit) bytes[i >> 3] |= 1 << (7 - (i & 7));
    });
    let s = '';
    for (const b of bytes) s += String.fromCharCode(b);
    return binToB64url(s);
  }
}

class BitReader {
  private pos = 0;
  private bytes: Uint8Array;
  constructor(b64url: string) {
    const bin = b64urlToBin(b64url);
    this.bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) this.bytes[i] = bin.charCodeAt(i);
  }
  read(n: number): number {
    let v = 0;
    for (let i = 0; i < n; i++) {
      const bit = ((this.bytes[this.pos >> 3] ?? 0) >> (7 - (this.pos & 7))) & 1;
      v = (v << 1) | bit;
      this.pos++;
    }
    return v;
  }
}

/** Texte UTF-8 ⇄ base64url — garde `z` sans "%" ni "+". */
function textToB64url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return binToB64url(bin);
}

function b64urlToText(s: string): string {
  try {
    const bin = b64urlToBin(s);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  } catch {
    return '';
  }
}

/** Couleur → code compact : "p<idx>" (palette) ou "c<hex>" (personnalisée). */
function colorToCode(color: string): string {
  const pi = TIER_PALETTE.indexOf(color);
  return pi >= 0 ? `p${pi}` : `c${color.replace('#', '')}`;
}

function codeToColor(code: string, fallback: string): string {
  if (code[0] === 'p') return TIER_PALETTE[Number(code.slice(1))] ?? fallback;
  if (code[0] === 'c' && /^[0-9a-f]{6}$/i.test(code.slice(1))) return `#${code.slice(1)}`;
  return fallback;
}

export function encodeState(title: string, tiers: Tier[], canon: Canon): string {
  const parts: string[] = [textToB64url(title)];
  for (const t of tiers) parts.push(textToB64url(t.label), colorToCode(t.color));

  const refs = tiers.flatMap((t) =>
    t.items
      .map((key) => canon.index.get(key))
      .filter((r): r is { type: number; idx: number } => !!r),
  );
  const firstType = refs[0]?.type ?? 0;
  const mode =
    refs.length && refs.every((r) => r.type === firstType) ? firstType : refs.length ? 3 : 0;

  const w = new BitWriter();
  w.write(mode, TYPE_BITS);

  if (mode === 3) {
    // Types mêlés : une paire (type, index) brute par item.
    for (const t of tiers) w.write(t.items.length, MIXED_COUNT_BITS);
    for (const r of refs) {
      w.write(r.type, TYPE_BITS);
      w.write(r.idx, MIXED_INDEX_BITS);
    }
  } else {
    // Mono-type : rang de sélection contre le pool canonique.
    const pool = canon.byType[mode].length;
    w.write(pool, POOL_BITS);
    const countBits = bitsFor(pool + 1);
    for (const t of tiers) w.write(t.items.length, countBits);
    const available = Array.from({ length: pool }, (_, i) => i);
    for (const r of refs) {
      const pos = available.indexOf(r.idx);
      w.write(pos, bitsFor(available.length));
      available.splice(pos, 1);
    }
  }
  parts.push(w.toBase64url());
  return `1${parts.join(',')}`;
}

export function decodeState(
  raw: string | null,
  canon: Canon,
): { title: string; tiers: Tier[] } | null {
  if (!raw || raw[0] !== '1') return null;
  // parts = [titre, (label, couleur) × T, binaire]  →  longueur paire et ≥ 4
  const parts = raw.slice(1).split(',');
  if (parts.length < 4 || parts.length % 2 !== 0) return null;
  const tierCount = (parts.length - 2) / 2;

  try {
    const r = new BitReader(parts[parts.length - 1]);
    const mode = r.read(TYPE_BITS);
    const perTier: { type: number; idx: number }[][] = [];

    if (mode === 3) {
      const counts: number[] = [];
      for (let i = 0; i < tierCount; i++) counts.push(r.read(MIXED_COUNT_BITS));
      for (const c of counts) {
        const row: { type: number; idx: number }[] = [];
        for (let j = 0; j < c; j++)
          row.push({ type: r.read(TYPE_BITS), idx: r.read(MIXED_INDEX_BITS) });
        perTier.push(row);
      }
    } else {
      const pool = r.read(POOL_BITS);
      const countBits = bitsFor(pool + 1);
      const counts: number[] = [];
      for (let i = 0; i < tierCount; i++) counts.push(r.read(countBits));
      const available = Array.from({ length: pool }, (_, i) => i);
      for (const c of counts) {
        const row: { type: number; idx: number }[] = [];
        for (let j = 0; j < c; j++) {
          const pos = r.read(bitsFor(available.length));
          const idx = available[pos];
          if (idx === undefined) continue;
          available.splice(pos, 1);
          row.push({ type: mode, idx });
        }
        perTier.push(row);
      }
    }

    const tiers: Tier[] = perTier.map((row, i) => ({
      id: `t${i}`,
      label: b64urlToText(parts[1 + i * 2]),
      color: codeToColor(parts[2 + i * 2] ?? '', TIER_PALETTE[i % TIER_PALETTE.length]),
      items: row.map((rf) => canon.byType[rf.type]?.[rf.idx]?.key).filter((k): k is string => !!k),
    }));
    return { title: b64urlToText(parts[0]), tiers };
  } catch {
    return null;
  }
}
