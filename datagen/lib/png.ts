/**
 * png — dimensions d'un PNG par lecture de son EN-TÊTE (signature + chunk IHDR,
 * 24 octets), SANS décoder l'image. Bon marché : un seul `read` de 24 octets.
 *
 * Partagé : cette lecture était copiée à l'identique dans trois modules
 * (`extract/extract-wallpapers`, `generators/wallpapers`, `assets/hero-full-art`)
 * — audit E3, « régler à la source ». `null` si le fichier est illisible OU
 * n'est pas un PNG (signature absente).
 *
 * Format : 8 octets de signature (`89 50 4E 47 0D 0A 1A 0A`) puis le chunk IHDR
 * dont largeur et hauteur sont deux u32 BIG-ENDIAN aux offsets 16 et 20.
 */
import { closeSync, openSync, readSync } from 'node:fs';

/** Signature PNG (8 premiers octets), en hexa. */
const PNG_SIGNATURE = '89504e470d0a1a0a';

/** Taille d'un PNG via son en-tête, `null` si illisible ou non-PNG. */
export function readPngSize(path: string): { w: number; h: number } | null {
  try {
    const buf = Buffer.alloc(24);
    const fd = openSync(path, 'r');
    try {
      readSync(fd, buf, 0, 24, 0);
    } finally {
      closeSync(fd); // fermé même si la lecture jette (pas de fd fuité)
    }
    if (buf.toString('hex', 0, 8) !== PNG_SIGNATURE) return null;
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  } catch {
    return null;
  }
}
