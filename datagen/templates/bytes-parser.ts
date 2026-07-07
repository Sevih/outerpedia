/**
 * Parser des fichiers .bytes du jeu (format .NET BinaryWriter), en TS pur.
 *
 * Format :
 *   - nom de table       : entier 7-bit (longueur) + chaîne UTF-8
 *   - nb de lignes       : uint32 LE
 *   - nb de colonnes     : uint32 LE
 *   - colonnes           : pour chacune, entier 7-bit (longueur) + chaîne
 *   - lignes             : pour chacune,
 *       - nb de champs   : uint32 LE
 *       - champs         : index colonne (int32 LE, -1 = colonne inconnue)
 *                          + chaîne (longueur 7-bit + UTF-8)
 *
 * Toutes les valeurs sont des chaînes (le typage se fait dans la couche au-dessus).
 */

export interface ParsedTable {
  table: string;
  columns: string[];
  rows: Record<string, string>[];
}

/** Lecteur séquentiel sur un Buffer (curseur interne). */
class Reader {
  private pos = 0;
  constructor(private readonly buf: Buffer) {}

  get atEnd(): boolean {
    return this.pos === this.buf.length;
  }
  get offset(): number {
    return this.pos;
  }
  get length(): number {
    return this.buf.length;
  }

  uint32(): number {
    const v = this.buf.readUInt32LE(this.pos);
    this.pos += 4;
    return v;
  }

  int32(): number {
    const v = this.buf.readInt32LE(this.pos);
    this.pos += 4;
    return v;
  }

  /** Entier encodé "7-bit" de .NET (robuste aux grandes valeurs). */
  varint(): number {
    let result = 0;
    let shift = 0;
    let byte = 0;
    do {
      byte = this.buf[this.pos++];
      result += (byte & 0x7f) * 2 ** shift;
      shift += 7;
    } while (byte & 0x80);
    return result;
  }

  /** Chaîne .NET BinaryReader : longueur 7-bit + octets UTF-8. */
  str(): string {
    const len = this.varint();
    const s = this.buf.toString('utf8', this.pos, this.pos + len);
    this.pos += len;
    return s;
  }
}

/** Parse un buffer .bytes en table { table, columns, rows }. */
export function parseBytes(buf: Buffer): ParsedTable {
  const rd = new Reader(buf);

  const table = rd.str();
  const rowCount = rd.uint32();
  const colCount = rd.uint32();

  const columns: string[] = [];
  for (let c = 0; c < colCount; c++) columns.push(rd.str());

  const rows: Record<string, string>[] = [];
  for (let r = 0; r < rowCount; r++) {
    const fieldCount = rd.uint32();
    const row: Record<string, string> = {};
    let unknown = 0;
    for (let f = 0; f < fieldCount; f++) {
      const fidx = rd.int32();
      const val = rd.str();
      if (fidx >= 0 && fidx < columns.length) row[columns[fidx]] = val;
      else row[`_unknown_${unknown++}`] = val;
    }
    rows.push(row);
  }

  if (!rd.atEnd) {
    throw new Error(`parse incomplet : ${rd.offset} octets lus sur ${rd.length}`);
  }

  return { table, columns, rows };
}
