/**
 * Une puce du journal du site (`/changelog`), découpée pour le rendu — PUR.
 *
 * Le SEUL balisage rendu est le gras markdown `**…**` : les puces de
 * `changelog.json` en portent depuis l'origine, et la carte les affichait
 * brutes, astérisques compris. Tout le reste (un `[texte](url)`, un `` `code` ``)
 * reste du texte tel quel : la carte entière est déjà un lien, elle ne peut pas
 * en contenir un autre.
 *
 * Une seule implémentation pour les deux lecteurs : `ChangelogEntryCard` (la
 * page et la home) et l'aperçu de quick (`previewChangelogEntry`), qui montre
 * donc ce que le site montrera. Le motif est celui que le flux RSS aplatit
 * (`src/app/feed/changelog/route.ts`).
 */

/** Un morceau de puce : du texte, en gras ou non. */
export interface BulletSegment {
  text: string;
  bold?: true;
}

const BOLD = /\*\*(.+?)\*\*/g;

/**
 * `Added the **Universal Tower** guide` → texte, gras, texte. Des astérisques
 * sans fermeture restent du texte ; une puce vide ne rend aucun segment.
 */
export function bulletSegments(line: string): BulletSegment[] {
  const out: BulletSegment[] = [];
  let at = 0;
  for (const m of line.matchAll(BOLD)) {
    if (m.index > at) out.push({ text: line.slice(at, m.index) });
    out.push({ text: m[1], bold: true });
    at = m.index + m[0].length;
  }
  if (at < line.length) out.push({ text: line.slice(at) });
  return out;
}
