/**
 * ASSAINISSEMENT des notes de patch — le HTML est celui d'un WordPress tiers et
 * finit en `dangerouslySetInnerHTML` (patch-history), sous une CSP
 * `'unsafe-inline'`. Idempotent : `getNews` le rejoue sur TOUT le corpus à
 * chaque run, une règle ajoutée s'applique donc aussi au passé.
 *
 * LISTE BLANCHE : seul ce qui est nommé ici traverse.
 *   - balises de `ALLOWED_TAGS` gardées ; `DROPPED_TAGS` retirées avec leur
 *     contenu (23 `<script>` dans le committé au 07/09 — widgets X et ld+json —
 *     sans raison d'être dans le DOM) ; toute autre balise est remplacée par son
 *     contenu (le texte reste) ;
 *   - attributs de `GLOBAL_ATTRS`, `aria-*`, `data-*` (inertes : aucun script du
 *     site ne les lit) et ceux de `TAG_ATTRS` pour leur balise ; `srcdoc` n'y
 *     est nulle part, il part donc dans tous les cas ;
 *   - `href`/`src`/`cite`/`poster` : schéma `http(s)` ou chemin relatif, jugé
 *     APRÈS retrait des caractères de contrôle et des espaces — le navigateur
 *     ignore tabulations et retours à la ligne dans une URL, `java&#9;script:`
 *     reste un `javascript:` ;
 *   - iframe hors `FRAME_HOSTS` : la CSP rendrait un cadre VIDE (30 annonces
 *     vagames au 07/09) — remplacée par un lien, construit par l'API de cheerio
 *     (l'URL n'est jamais réinterprétée comme du HTML).
 *
 * Les balises et attributs listés couvrent tout ce que le corpus committé
 * contient au 15/10 (1 100 notes) : le passage à la liste blanche n'en a changé
 * qu'une, un lien `file://` vers un partage interne de l'éditeur, qui perd son
 * `href` (le texte reste).
 */
import * as cheerio from 'cheerio';

/** Hôtes d'iframe que la CSP (`frame-src`, next.config.ts) laisse s'afficher. */
export const FRAME_HOSTS = new Set([
  'www.youtube.com',
  'youtube.com',
  'www.youtube-nocookie.com',
  'player.twitch.tv',
  'player.bilibili.com',
]);

// prettier-ignore
const ALLOWED_TAGS = new Set([
  'a', 'b', 'blockquote', 'br', 'caption', 'code', 'col', 'colgroup', 'del', 'div', 'em',
  'figcaption', 'figure', 'font', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'iframe',
  'img', 'ins', 'li', 'mark', 'ol', 'p', 'pre', 's', 'small', 'span', 'strike', 'strong',
  'sub', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'u', 'ul', 'video',
]);

// prettier-ignore
const DROPPED_TAGS = new Set([
  'applet', 'base', 'button', 'embed', 'form', 'frame', 'frameset', 'input', 'link', 'math',
  'meta', 'noembed', 'noframes', 'noscript', 'object', 'plaintext', 'script', 'select',
  'style', 'svg', 'template', 'textarea', 'title', 'xmp',
]);

const GLOBAL_ATTRS = new Set(['class', 'dir', 'id', 'lang', 'role', 'style', 'tabindex', 'title']);

const TAG_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'rel', 'target']),
  blockquote: new Set(['cite']),
  col: new Set(['span']),
  colgroup: new Set(['span']),
  font: new Set(['color', 'face', 'size']),
  iframe: new Set([
    'allow',
    'allowfullscreen',
    'frameborder',
    'height',
    'loading',
    'referrerpolicy',
    'src',
    'title',
    'width',
  ]),
  img: new Set(['alt', 'height', 'src', 'width']),
  ol: new Set(['reversed', 'start', 'type']),
  td: new Set(['colspan', 'rowspan']),
  th: new Set(['colspan', 'rowspan']),
  video: new Set(['controls', 'poster', 'src']),
};

const URL_ATTRS = new Set(['cite', 'href', 'poster', 'src']);

/** Une URL gardée : schéma `http(s)`, ou aucun schéma (chemin relatif, ancre). */
export function isSafeUrl(value: string): boolean {
  const compact = value.replace(/[\s\u0000-\u001f\u007f-\u009f]/g, '');
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(compact);
  return !scheme || /^https?$/i.test(scheme[1]);
}

function allowedAttr(tag: string, name: string): boolean {
  const n = name.toLowerCase();
  return (
    GLOBAL_ATTRS.has(n) ||
    n.startsWith('aria-') ||
    n.startsWith('data-') ||
    Boolean(TAG_ATTRS[tag]?.has(n))
  );
}

function frameAllowed(src: string): boolean {
  if (!isSafeUrl(src)) return false;
  try {
    return FRAME_HOSTS.has(new URL(src.trim()).hostname);
  } catch {
    return false; // src relatif ou vide → hors liste
  }
}

export function sanitize($: cheerio.CheerioAPI): void {
  $([...DROPPED_TAGS].join(', ')).remove();
  for (const el of $('iframe').toArray()) {
    const src = $(el).attr('src') ?? '';
    if (frameAllowed(src)) continue;
    $(el).replaceWith(
      src
        ? $('<a>').attr({ href: src, target: '_blank', rel: 'noopener noreferrer' }).text(src)
        : '',
    );
  }
  for (const el of $('body *').toArray()) {
    if (!('attribs' in el)) continue;
    const tag = el.tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) {
      $(el).replaceWith($(el).contents());
      continue;
    }
    for (const [name, value] of Object.entries(el.attribs)) {
      if (!allowedAttr(tag, name) || (URL_ATTRS.has(name.toLowerCase()) && !isSafeUrl(value)))
        $(el).removeAttr(name);
    }
  }
}

/** Assainit un contenu déjà stocké (corpus committé) — même règle, sans images. */
export function sanitizeHtml(html: string): string {
  const $ = cheerio.load(html);
  sanitize($);
  return $('body').html() || '';
}
