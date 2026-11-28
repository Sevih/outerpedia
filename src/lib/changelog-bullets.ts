/**
 * Une puce du journal du site (`/changelog`), découpée pour le rendu — PUR.
 *
 * Deux balisages sont rendus :
 * - le gras markdown `**…**` : les puces de `changelog.json` en portent depuis
 *   l'origine, et la carte les affichait brutes, astérisques compris ;
 * - le lien markdown `[libellé](cible)` (B77), la forme du `LINK_RE` des
 *   événements (`EventBlocks`) étendue à l'interne : une cible `https?://…`
 *   (externe), ou un chemin `/…` du site SANS préfixe de langue (comme le champ
 *   Lien d'une entrée ; le lecteur le localise). Toute autre cible
 *   (`javascript:`, `mailto:`, relative sans `/`, `//hôte`) et toute syntaxe
 *   incomplète restent du texte tel quel.
 * Le gras peut entourer un lien (`**[x](/y)**`) ou être dans son libellé
 * (`[**x**](/y)`). Le reste (un `` `code` ``, l'italique) reste du texte.
 *
 * La carte entière est un lien quand l'entrée en porte un : elle ne contient
 * pas pour autant de lien dans un lien, c'est un lien ÉTIRÉ (cf.
 * `ChangelogEntryCard`), et les liens des puces passent au-dessus.
 *
 * Une seule implémentation pour les trois lecteurs : `ChangelogEntryCard` (la
 * page et la home), l'aperçu de quick (`previewChangelogEntry`), qui montre
 * donc ce que le site montrera, et le flux RSS (`src/app/feed/changelog/route.ts`),
 * qui en aplatit les segments.
 */

/** Un morceau de texte d'une puce : en gras ou non. */
export interface BulletText {
  text: string;
  bold?: true;
}

/** Un lien d'une puce : sa cible et son libellé, lui-même en morceaux (le gras). */
export interface BulletLink {
  /** `https?://…` tel quel, ou un chemin `/…` du site sans préfixe de langue. */
  href: string;
  /** Posé sur une cible `http(s)` : nouvel onglet ; absent, un chemin du site. */
  external?: true;
  label: BulletText[];
}

/** Un segment de puce : du texte, ou un lien. */
export type BulletSegment = BulletText | BulletLink;

/** Le segment est-il un lien ? */
export const isBulletLink = (s: BulletSegment): s is BulletLink => 'href' in s;

const BOLD = /\*\*(.+?)\*\*/g;

/**
 * Le `LINK_RE` des événements, la cible étendue au chemin interne `/…` (mais
 * pas `//…`, qui sortirait du site).
 */
const LINK = /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+|\/(?!\/)[^\s)]*)\)/g;

// Un lien est masqué le temps de lire le gras de la puce : le gras qui
// l'entoure se lit alors d'un seul tenant, sans voir les astérisques de son
// libellé. Deux caractères d'usage privé, absents d'une puce écrite à la main.
const OPEN = '';
const CLOSE = '';
const SLOT = /(\d+)/g;

/** Le gras seul : `a **b** c` → texte, gras, texte ; sans fermeture, du texte. */
function boldPieces(line: string): BulletText[] {
  const out: BulletText[] = [];
  let at = 0;
  for (const m of line.matchAll(BOLD)) {
    if (m.index > at) out.push({ text: line.slice(at, m.index) });
    out.push({ text: m[1], bold: true });
    at = m.index + m[0].length;
  }
  if (at < line.length) out.push({ text: line.slice(at) });
  return out;
}

/**
 * `Added the **Universal Tower** guide` → texte, gras, texte ;
 * `See [the guide](/guides/x)` → texte, lien. Des astérisques sans fermeture
 * restent du texte ; une puce vide ne rend aucun segment.
 */
export function bulletSegments(line: string): BulletSegment[] {
  // Une puce qui porterait déjà les marqueurs n'est pas lue pour ses liens.
  if (line.includes(OPEN) || line.includes(CLOSE)) return boldPieces(line);

  const links: { label: string; href: string }[] = [];
  const masked = line.replace(LINK, (_, label: string, href: string) => {
    links.push({ label, href });
    return `${OPEN}${links.length - 1}${CLOSE}`;
  });

  const out: BulletSegment[] = [];
  for (const piece of boldPieces(masked)) {
    let at = 0;
    for (const m of piece.text.matchAll(SLOT)) {
      if (m.index > at) out.push({ ...piece, text: piece.text.slice(at, m.index) });
      const { label, href } = links[Number(m[1])];
      out.push({
        href,
        ...(href.startsWith('/') ? {} : { external: true as const }),
        label: boldPieces(label).map((p) => (piece.bold ? { text: p.text, bold: true } : p)),
      });
      at = m.index + m[0].length;
    }
    if (at < piece.text.length) out.push({ ...piece, text: piece.text.slice(at) });
  }
  return out;
}
