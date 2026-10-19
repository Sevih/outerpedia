/**
 * Archive ZIP SANS compression (méthode 0, STORE), écrite à la main : le zip
 * de l'OST (`/tools/ost`) se construit côté client et aucune dépendance ne
 * peut être ajoutée. Les mp3 ne gagnent rien à la compression, STORE suffit.
 *
 * Format (APPNOTE.TXT de PKWARE) : pour chaque entrée un en-tête local
 * (`PK\x03\x04`) suivi des octets bruts, puis le répertoire central
 * (`PK\x01\x02`, une fiche par entrée) et la fin de répertoire (`PK\x05\x06`).
 * Noms en UTF-8 annoncés par le bit 11 du drapeau général ; date fixe
 * (1980-01-01 00:00, la plus petite date DOS) pour un zip reproductible.
 *
 * Pas de zip64 : les champs de taille et d'offset font 32 bits (4 Gio) et le
 * compte d'entrées 16 bits (65 535). L'OST entière pèse ~127 Mo pour 93
 * pistes, loin de ces bornes ; au-delà, `buildZip` lève plutôt que d'écrire
 * une archive corrompue.
 */

/** Table du CRC-32 (polynôme réfléchi 0xEDB88320), calculée une fois. */
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

/** CRC-32 (celui du ZIP, de gzip et de PNG). */
export function crc32(data: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i++) c = CRC_TABLE[(c ^ data[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

export interface ZipEntry {
  /** Chemin dans l'archive (UTF-8, `/` comme séparateur). */
  name: string;
  data: Uint8Array<ArrayBuffer>;
}

/** Version 2.0 : « needed to extract » d'une entrée STORE avec drapeau UTF-8. */
const VERSION = 20;
/** Bit 11 : nom et commentaire en UTF-8. */
const FLAG_UTF8 = 0x0800;
const DOS_TIME = 0;
/** 1980-01-01 : ((1980 - 1980) << 9) | (1 << 5) | 1. */
const DOS_DATE = 0x0021;
const MAX_U32 = 0xffffffff;
const MAX_U16 = 0xffff;

/**
 * Construit l'archive. Le `Blob` assemble les morceaux sans recopier les
 * données des entrées dans un tampon unique (127 Mo de mp3 n'existent qu'une
 * fois en mémoire de travail, plus le Blob).
 */
export function buildZip(entries: ZipEntry[]): Blob {
  if (entries.length > MAX_U16) throw new Error('zip-store: trop d’entrées (pas de zip64)');
  const encoder = new TextEncoder();
  const parts: Uint8Array<ArrayBuffer>[] = [];
  const central: Uint8Array<ArrayBuffer>[] = [];
  let offset = 0;

  for (const entry of entries) {
    const name = encoder.encode(entry.name);
    const size = entry.data.length;
    const crc = crc32(entry.data);
    if (size > MAX_U32 || offset > MAX_U32)
      throw new Error('zip-store: archive au-delà de 4 Gio (pas de zip64)');

    const local = new Uint8Array(30 + name.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, VERSION, true);
    lv.setUint16(6, FLAG_UTF8, true);
    lv.setUint16(8, 0, true); // méthode STORE
    lv.setUint16(10, DOS_TIME, true);
    lv.setUint16(12, DOS_DATE, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, size, true); // taille compressée = taille brute
    lv.setUint32(22, size, true);
    lv.setUint16(26, name.length, true);
    lv.setUint16(28, 0, true); // pas de champ extra
    local.set(name, 30);

    const record = new Uint8Array(46 + name.length);
    const cv = new DataView(record.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, VERSION, true); // « made by » : octet haut 0 = MS-DOS
    cv.setUint16(6, VERSION, true);
    cv.setUint16(8, FLAG_UTF8, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, DOS_TIME, true);
    cv.setUint16(14, DOS_DATE, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, size, true);
    cv.setUint32(24, size, true);
    cv.setUint16(28, name.length, true);
    // 30 extra, 32 commentaire, 34 disque, 36 attributs internes, 38 externes : 0
    cv.setUint32(42, offset, true);
    record.set(name, 46);

    parts.push(local, entry.data);
    central.push(record);
    offset += local.length + size;
  }

  const centralSize = central.reduce((n, r) => n + r.length, 0);
  if (offset + centralSize > MAX_U32)
    throw new Error('zip-store: archive au-delà de 4 Gio (pas de zip64)');
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  // 4 numéro du disque, 6 disque du répertoire : 0
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  // 20 longueur du commentaire : 0

  return new Blob([...parts, ...central, end], { type: 'application/zip' });
}
