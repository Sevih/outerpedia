/**
 * quick/discord — le cinquième geste : écrire un message et le faire poster par
 * le bot Outerpedia (le résumé d'une note de patch, tapé jusqu'ici à la main
 * dans Discord).
 *
 * TRANSPORT (décision Sevih, 05/10) : l'API REST de Discord en direct, avec le
 * jeton du bot lu dans `.env.local` (`DISCORD_BOT_TOKEN`). Ni dépendance
 * (`fetch` de Node), ni détour par le dépôt `outerbot`. Le serveur où l'on
 * poste se CHOISIT dans la page, parmi ceux dont le bot est membre :
 * `DISCORD_GUILD_ID` n'est que le choix du premier lancement.
 *
 * LE JETON NE SORT PAS D'ICI : il n'entre que dans l'en-tête `Authorization`
 * (`buildRequest`). Aucune réponse de route ne le porte, et toute ligne de
 * journal ou d'erreur passe par `scrub`, qui le remplacerait s'il s'y glissait.
 *
 * Trois étages, du plus pur au moins pur :
 *   - le TEXTE — `convertEmojis`, `splitMessage`, `renderDiscord`, et pour un
 *     embed `prepareEmbed`, `renderEmbed` : des fonctions pures, sans réseau ni
 *     disque. Le preview et l'envoi passent par le MÊME `prepare` (ou
 *     `prepareEmbed`) : ce que l'écran montre est ce qui part ;
 *   - les REQUÊTES — `buildRequest`, `messageBody`, `embedBody`, puis
 *     `sendMessages` / `editMessages` qui reçoivent `fetch` et `sleep` en
 *     argument (les tests les simulent : rien ici n'appelle Discord tant que le
 *     jeton manque) ;
 *   - la SESSION — `discordSession` tient ce qui a été LU de Discord (la liste
 *     des serveurs du bot, les salons et les emojis de chacun, lus une fois) et
 *     rend exactement ce que les routes de `server.ts` renvoient. Elle ne
 *     retient RIEN d'autre : le serveur où poster, les serveurs dont on prend
 *     les emojis et le mode arrivent de la page avec chaque demande.
 *
 * Ce geste ne committe et ne pousse RIEN, contrairement aux quatre autres.
 */
import shortcodes from './discord-shortcodes.json';
import type { Outcome, Report } from './actions';

export const DISCORD_API = 'https://discord.com/api/v10';
/** Plafond de Discord par message. */
export const MESSAGE_LIMIT = 2000;
/** Drapeau `SUPPRESS_EMBEDS` d'un message (1 << 2) : pas d'aperçu des liens. */
export const SUPPRESS_EMBEDS = 4;

/** Plafonds d'un embed : sa description, puis l'ensemble de ses textes. */
export const EMBED_DESCRIPTION_LIMIT = 4096;
export const EMBED_TOTAL_LIMIT = 6000;
export const EMBED_TITLE_LIMIT = 256;
export const EMBED_FOOTER_LIMIT = 2048;
export const BUTTON_LABEL_LIMIT = 80;
export const BUTTON_URL_LIMIT = 512;
/** Boutons d'UNE rangée de composants — on n'en pose qu'une. */
export const BUTTON_MAX = 5;
/** Barre d'un embed par défaut : le jeton `--accent` du site (`src/app/globals.css`). */
export const EMBED_COLOR = '#38bdf8';

export const TOKEN_HINT = 'jeton absent : ajoute DISCORD_BOT_TOKEN à .env.local';

const SNOWFLAKE = /^\d{17,20}$/;

// ---------------------------------------------------------------- emojis -----

export interface GuildEmoji {
  id: string;
  name: string;
  animated: boolean;
}

/** Emojis des serveurs cochés, par nom ; `null` = liste inconnue (jeton absent). */
export type GuildEmojis = ReadonlyMap<string, GuildEmoji> | null;

/**
 * Les emojis de plusieurs serveurs en UNE table, dans l'ordre donné : un même
 * nom sur deux serveurs → le premier gagne.
 */
export function mergeEmojis(lists: readonly (readonly GuildEmoji[])[]): Map<string, GuildEmoji> {
  const merged = new Map<string, GuildEmoji>();
  for (const list of lists) for (const e of list) if (!merged.has(e.name)) merged.set(e.name, e);
  return merged;
}

/**
 * Codes standard de Discord (`:scroll:` → 📜). Table tenue à la main dans
 * `discord-shortcodes.json` : les noms sont ceux de DISCORD, qui ne sont pas
 * toujours ceux de GitHub ou de Slack (`:calendar:` est 📆, 📅 s'appelle
 * `:date:` ; `:clock:` est 🕰️). Le test vérifie que chaque valeur est UN emoji
 * complet (sélecteur de variante compris, sans lequel ⚔ ou ⚠ sortent en texte).
 * En `Map` : un objet nu répondrait aussi à `:constructor:`.
 */
const STANDARD = new Map(Object.entries(shortcodes as Record<string, string>));

/** Un emoji standard tel que le sélecteur de la page le montre. */
export interface StandardEmoji {
  name: string;
  char: string;
}

/**
 * La table standard pour le sélecteur et l'autocomplétion de la page, dans
 * l'ordre du fichier (à ceci près que JS range devant les noms tout en chiffres).
 */
export const standardEmojis = (): StandardEmoji[] =>
  [...STANDARD].map(([name, char]) => ({ name, char }));

/** `v` (propriétés de chaînes) n'est pas dans la cible TS du dépôt : via le constructeur. */
const RGI_EMOJI = new RegExp('^\\p{RGI_Emoji}$', 'v');

/** `:flag_fr:` → 🇫🇷 : deux indicateurs régionaux, gardés si la paire est un vrai drapeau. */
function flag(name: string): string | undefined {
  const m = /^flag_([a-z]{2})$/.exec(name);
  if (!m) return undefined;
  const pair = String.fromCodePoint(...[...m[1]].map((c) => 0x1f1e6 + c.charCodeAt(0) - 97));
  return RGI_EMOJI.test(pair) ? pair : undefined;
}

export interface Converted {
  /** Le texte tel qu'il part : `<:nom:id>` et caractères Unicode en place. */
  content: string;
  /** `:nom:` restés en toutes lettres — fautes de frappe : ils BLOQUENT l'envoi. */
  unknown: string[];
  /** `:nom:` que seule la liste du serveur peut trancher, et elle manque. */
  pending: string[];
}

/** Blocs et extraits de code : rien ne s'y convertit, Discord les affiche tels quels. */
const CODE = /```[\s\S]*?```|``[^\n]+?``|`[^`\n]+`/g;

/**
 * Trois formes, dans l'ordre : une URL (laissée intacte — `:a:` dans un chemin
 * n'est pas un emoji), un emoji de serveur DÉJÀ écrit en `<:nom:id>`, un code
 * `:nom:` à résoudre.
 */
const SHORTCODE = /https?:\/\/[^\s)>]+|<a?:\w{2,32}:\d{17,20}>|:([A-Za-z0-9_+-]{1,32}):/g;

/**
 * La table par nom en minuscules, bâtie à la première demande. Dans l'ordre de
 * la table : à casse près, le premier nom gagne (celui du premier serveur).
 */
function lowerNames(guild: GuildEmojis): () => Map<string, GuildEmoji> {
  let lower: Map<string, GuildEmoji> | null = null;
  return () => {
    if (!lower) {
      lower = new Map();
      for (const [name, e] of guild ?? [])
        if (!lower.has(name.toLowerCase())) lower.set(name.toLowerCase(), e);
    }
    return lower;
  };
}

/**
 * Remplace les `:nom:` par ce que Discord attend d'un BOT. Le client Discord
 * fait cette conversion à la frappe ; un message posté par l'API ne passe pas
 * par lui, et `:scroll:` y resterait du texte.
 *
 * Ordre de résolution : les SERVEURS d'abord (`<:nom:id>`, `<a:nom:id>` s'il
 * est animé), la table standard ensuite. Un nom que ni les uns ni l'autre ne
 * connaissent est une faute de frappe (`unknown`) — sauf sans liste des
 * serveurs, ou avec une liste `partial` (un serveur coché n'est pas encore lu),
 * où il peut très bien en être un (`pending`). Un `:30:` de « 10:30:00 » n'a pas
 * de lettre : ce n'est pas un code, il reste du texte sans rien signaler.
 */
export function convertEmojis(text: string, guild: GuildEmojis, partial = false): Converted {
  const unknown = new Set<string>();
  const pending = new Set<string>();
  const lower = lowerNames(guild);

  const one = (whole: string, name: string | undefined): string => {
    if (name === undefined) return whole;
    // Nom exact d'abord ; la casse ne compte pas pour Discord à la frappe.
    const custom = guild?.get(name) ?? lower().get(name.toLowerCase());
    if (custom) return `<${custom.animated ? 'a' : ''}:${custom.name}:${custom.id}>`;
    const standard = STANDARD.get(name.toLowerCase()) ?? flag(name.toLowerCase());
    if (standard) return standard;
    if (!/[A-Za-z]/.test(name)) return whole;
    (guild && !partial ? unknown : pending).add(name);
    return whole;
  };

  let content = '';
  let at = 0;
  for (const code of text.matchAll(CODE)) {
    content += text.slice(at, code.index).replace(SHORTCODE, one) + code[0];
    at = code.index + code[0].length;
  }
  content += text.slice(at).replace(SHORTCODE, one);
  return { content, unknown: [...unknown], pending: [...pending] };
}

/**
 * La conversion d'un texte où Discord n'affiche PAS les emojis de serveur (le
 * pied d'un embed, le libellé d'un bouton) : les codes standard deviennent leur
 * caractère, un code de serveur reste tel quel et revient dans `server` — à
 * signaler, pas à convertir.
 */
export function convertPlain(
  text: string,
  guild: GuildEmojis,
  partial = false,
): Converted & { server: string[] } {
  const c = convertEmojis(text, null);
  const lower = lowerNames(guild);
  const onServer = (name: string): boolean =>
    Boolean(guild?.has(name) || lower().has(name.toLowerCase()));
  const rest = c.pending.filter((name) => !onServer(name));
  const known = Boolean(guild) && !partial;
  return {
    content: c.content,
    server: c.pending.filter(onServer),
    unknown: known ? rest : [],
    pending: known ? [] : rest,
  };
}

// ------------------------------------------------------------- découpage -----

export interface Split {
  chunks: string[];
  /** Découpage impossible (une ligne dépasse à elle seule) : rien ne part. */
  error?: string;
}

/**
 * Découpe un texte en messages de `limit` caractères au plus — JAMAIS au milieu
 * d'une ligne. La coupe se fait de préférence juste avant un titre `## ` (une
 * section ne se retrouve pas à cheval sur deux messages tant qu'elle tient dans
 * un seul), sinon au dernier saut de ligne qui rentre.
 *
 * Longueur en unités UTF-16 (`String.length`) : un emoji hors plan de base y
 * compte pour deux, donc jamais MOINS que le compte de Discord — on coupe au
 * pire un peu tôt, jamais trop tard.
 *
 * Les lignes vides en bord de morceau tombent : Discord les rogne de toute
 * façon, et un message qui n'en contiendrait que ça serait refusé.
 */
export function splitMessage(content: string, limit = MESSAGE_LIMIT): Split {
  const lines = content.split('\n');
  const blank = (i: number): boolean => !lines[i].trim();
  const chunks: string[] = [];

  let start = 0;
  while (start < lines.length) {
    if (blank(start)) {
      start++;
      continue;
    }
    let end = start; // exclusif
    let length = 0;
    while (end < lines.length) {
      const add = lines[end].length + (end > start ? 1 : 0);
      if (length + add > limit) break;
      length += add;
      end++;
    }
    if (end === start)
      return {
        chunks: [],
        error: `La ligne ${start + 1} fait ${lines[start].length} caractères à elle seule : Discord en accepte ${limit} par message, et une ligne ne se coupe pas. Raccourcis-la ou scinde-la.`,
      };

    // Il reste du texte : chercher la meilleure coupe dans ce qui rentre.
    if (lines.slice(end).some((l) => l.trim())) {
      for (let i = end; i > start; i--) {
        if (lines[i].startsWith('## ')) {
          end = i;
          break;
        }
      }
    }
    let last = end;
    while (blank(last - 1)) last--;
    chunks.push(lines.slice(start, last).join('\n'));
    start = end;
  }
  return { chunks };
}

export interface Prepared extends Converted, Split {
  /** Longueur réelle, emojis convertis (c'est elle que Discord plafonne). */
  length: number;
}

/** Le texte de l'éditeur → ce qui part : emojis convertis PUIS découpage. */
export function prepare(text: string, guild: GuildEmojis, partial = false): Prepared {
  const converted = convertEmojis(text.replace(/\r\n?/g, '\n'), guild, partial);
  const content = converted.content.trim();
  return { ...converted, content, length: content.length, ...splitMessage(converted.content) };
}

const codes = (names: readonly string[]): string => names.map((n) => `:${n}:`).join(', ');

/** Les codes restés en toutes lettres bloquent, dans un message comme dans un embed. */
function emojiBlocker(p: Pick<Converted, 'unknown' | 'pending'>): string | null {
  if (p.unknown.length)
    return `Emoji inconnu : ${codes(p.unknown)} — ni sur les serveurs cochés ni dans la table standard. On ne poste pas un message où il resterait en toutes lettres.`;
  if (p.pending.length)
    return `Emojis du serveur non chargés : ${codes(p.pending)} — impossible de les convertir.`;
  return null;
}

/** Pourquoi ce texte ne peut pas partir (`null` = il peut). */
export function blocker(p: Prepared): string | null {
  if (p.error) return p.error;
  if (!p.chunks.length) return 'Message vide.';
  return emojiBlocker(p);
}

// ---------------------------------------------------------------- rendu ------

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};
export const escapeHtml = (s: string): string => s.replace(/[&<>"']/g, (c) => ESCAPES[c]);

/** Noms à signaler dans le rendu (cf. `Converted`). */
export interface Marks {
  unknown?: readonly string[];
  pending?: readonly string[];
}

// Zone à usage privé : bornes des morceaux déjà rendus, qu'aucune règle
// suivante ne doit relire (un `_` dans une URL n'ouvre pas un italique). Les
// mêmes caractères tapés dans le texte sont retirés à l'entrée.
const HOLD = '\uE000';
const HELD = '\uE001';
const BLOCK = '\uE002';
const BLOCKED = '\uE003';
const PRIVATE = /[\uE000-\uE003]/g;

/**
 * Mise en forme d'UNE ligne. Le texte est ÉCHAPPÉ D'ABORD : tout ce qui suit
 * travaille sur du HTML inerte, et le seul balisage produit vient d'ici (d'où
 * les `&lt;`…`&gt;` dans les motifs, à la place des chevrons).
 */
function inline(raw: string, marks: Marks): string {
  const kept: string[] = [];
  const hold = (html: string): string => `${HOLD}${kept.push(html) - 1}${HELD}`;

  const emphasis = (s: string): string =>
    s
      .replace(/\*\*\*(?=\S)(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*(?!\*)/g, '<strong>$1</strong>')
      .replace(/__(.+?)__(?!_)/g, '<u>$1</u>')
      .replace(/\*(?=\S)([^*]+?)(?<=\S)\*/g, '<em>$1</em>')
      .replace(/(?<![A-Za-z0-9])_(?=\S)([^_]+?)(?<=\S)_(?![A-Za-z0-9])/g, '<em>$1</em>')
      .replace(/~~(.+?)~~/g, '<s>$1</s>')
      .replace(/\|\|(.+?)\|\|/g, '<span class="spoiler">$1</span>');

  const link = (url: string, label: string): string =>
    hold(`<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`);

  const unknown = new Set(marks.unknown);
  const pending = new Set(marks.pending);

  let s = escapeHtml(raw)
    // D'une seule passe, de gauche à droite : `\*` rend le caractère seul, sans
    // son rôle (un accent grave échappé n'ouvre donc pas de code), et le code en
    // ligne garde son contenu tel quel, barres obliques comprises.
    .replace(
      /\\(&(?:amp|lt|gt|quot|#39);|[^A-Za-z0-9\s])|``(.+?)``|`([^`]+)`/g,
      (_, escaped: string | undefined, a: string | undefined, b: string | undefined) =>
        hold(escaped ?? `<code>${a ?? b}</code>`),
    )
    // Emoji de serveur : son image, servie par le CDN de Discord.
    .replace(/&lt;(a?):(\w{2,32}):(\d{17,20})&gt;/g, (_, a: string, name: string, id: string) =>
      hold(
        `<img class="emoji" alt=":${name}:" title=":${name}:" src="https://cdn.discordapp.com/emojis/${id}.${a ? 'gif' : 'webp'}?size=48">`,
      ),
    )
    .replace(/&lt;(@[!&]?|#)(\d{17,20})&gt;/g, (_, kind: string, id: string) =>
      hold(`<span class="mention">${kind[0]}${id}</span>`),
    )
    // Lien masqué, URL éventuellement entre chevrons (`[texte](<url>)`).
    .replace(
      /\[([^[\]]+)\]\((?:&lt;)?(https?:\/\/[^\s)]+?)(?:&gt;)?\)/g,
      (_, label: string, url: string) => link(url, emphasis(label)),
    )
    // `<url>` : le lien sans ses chevrons (Discord n'en fait pas d'aperçu).
    .replace(/&lt;(https?:\/\/\S+?)&gt;/g, (_, url: string) => link(url, url))
    // URL nue : jusqu'au blanc, moins la ponctuation qui la suit.
    .replace(/https?:\/\/[^\s\uE000-\uE003]+/g, (found) => {
      const url = found.split('&lt;')[0].replace(/(?:[.,:;)\]*~|]|&quot;|&#39;)+$/, '');
      return link(url, url) + found.slice(url.length);
    })
    // Codes restés en toutes lettres : la faute se voit là où elle est.
    .replace(/:([A-Za-z0-9_+-]{1,32}):/g, (whole, name: string) =>
      unknown.has(name)
        ? hold(`<span class="bad" title="emoji inconnu">${whole}</span>`)
        : pending.has(name)
          ? hold(`<span class="wait" title="inconnu sans jeton">${whole}</span>`)
          : whole,
    );

  s = emphasis(s);
  const restore = (t: string): string =>
    t.replace(/\uE000(\d+)\uE001/g, (_, n: string) => restore(kept[Number(n)]));
  return restore(s);
}

/** Liste à puces, imbriquée par l'indentation de la puce. */
function list(items: { indent: number; text: string }[], marks: Marks): string {
  let html = '';
  const depth: number[] = [];
  for (const item of items) {
    if (!depth.length || item.indent > depth[depth.length - 1]) {
      html += '<ul>';
      depth.push(item.indent);
    } else {
      while (depth.length > 1 && item.indent < depth[depth.length - 1]) {
        html += '</li></ul>';
        depth.pop();
      }
      html += '</li>';
    }
    html += `<li>${inline(item.text, marks)}`;
  }
  return html + '</li></ul>'.repeat(depth.length);
}

const LIST_ITEM = /^(\s*)[-*]\s+(\S.*)$/;

function blocks(lines: string[], marks: Marks, code: string[], quoted: boolean): string {
  let html = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Citations. `>>> ` prend tout le reste du message ; il n'y a pas de
    // citation dans une citation.
    if (!quoted && line.startsWith('>>> ')) {
      html += `<blockquote>${blocks([line.slice(4), ...lines.slice(i + 1)], marks, code, true)}</blockquote>`;
      break;
    }
    if (!quoted && line.startsWith('> ')) {
      const inner: string[] = [];
      for (; i < lines.length && lines[i].startsWith('> '); i++) inner.push(lines[i].slice(2));
      i--;
      html += `<blockquote>${blocks(inner, marks, code, true)}</blockquote>`;
      continue;
    }

    // Bloc de code sorti en amont : il se rend en bloc, le texte qui l'entoure
    // sur la même ligne reste de part et d'autre.
    if (line.includes(BLOCK)) {
      for (const part of line.split(/(\uE002\d+\uE003)/)) {
        const m = /^\uE002(\d+)\uE003$/.exec(part);
        if (m) html += `<pre><code>${code[Number(m[1])]}</code></pre>`;
        else if (part.trim()) html += blocks([part], marks, code, quoted);
      }
      continue;
    }

    const heading = /^(#{1,3}) +(\S.*)$/.exec(line);
    if (heading) {
      const h = `h${heading[1].length}`;
      html += `<${h}>${inline(heading[2], marks)}</${h}>`;
      continue;
    }

    const sub = /^-# +(\S.*)$/.exec(line);
    if (sub) {
      html += `<div class="sub">${inline(sub[1], marks)}</div>`;
      continue;
    }

    if (LIST_ITEM.test(line)) {
      const items: { indent: number; text: string }[] = [];
      for (; i < lines.length; i++) {
        const m = LIST_ITEM.exec(lines[i]);
        if (!m) break;
        items.push({ indent: m[1].length, text: m[2] });
      }
      i--;
      html += list(items, marks);
      continue;
    }

    html += line.trim()
      ? `<div class="ln">${inline(line, marks)}</div>`
      : '<div class="ln"><br></div>';
  }
  return html;
}

/**
 * Rend un message comme Discord l'affichera — HTML sûr, à poser dans un
 * conteneur `.dc` (les styles sont dans `ui.html`). Reçoit le texte DÉJÀ
 * converti (`prepare`) : un `<:nom:id>` devient l'image de l'emoji.
 *
 * Couvert : titres `#` `##` `###`, sous-texte `-# `, citations `> ` et `>>> `,
 * listes `- ` / `* ` imbriquées, gras, italique, souligné, barré, spoiler, code
 * en ligne et en bloc, liens masqués, URL nues, sauts de ligne tels quels.
 * Pas couvert (rendu en texte) : listes numérotées, mise en forme à cheval sur
 * plusieurs lignes, horodatages `<t:…>`.
 */
export function renderDiscord(content: string, marks: Marks = {}): string {
  const code: string[] = [];
  const text = content
    .replace(PRIVATE, '')
    .replace(/```(?:[A-Za-z0-9_+-]*\n)?([\s\S]*?)```/g, (_, body: string) => {
      code.push(escapeHtml(body.replace(/\n$/, '')));
      return `${BLOCK}${code.length - 1}${BLOCKED}`;
    });
  return blocks(text.split('\n'), marks, code, false);
}

/** Le preview complet : un cadre par message, avec sa coupure et sa longueur. */
export function previewHtml(p: Prepared): string {
  const n = p.chunks.length;
  return p.chunks
    .map(
      (chunk, i) =>
        `<div class="dc-cut">message ${i + 1}/${n} · ${chunk.length} caractères</div>` +
        `<div class="dc">${renderDiscord(chunk, p)}</div>`,
    )
    .join('');
}

// ---------------------------------------------------------------- embed ------

export type Mode = 'simple' | 'embed';

/** Un bouton de lien sous le message : il ouvre une adresse, le bot n'écoute rien. */
export interface LinkButton {
  label: string;
  url: string;
}

/** Le formulaire d'embed de la page, tel qu'il est tapé — chaque champ est facultatif. */
export interface EmbedForm {
  title: string;
  /** Lien du titre. */
  url: string;
  /** Couleur de la barre, `#rrggbb`. */
  color: string;
  /** Vignette (en haut à droite) et image (en bas) : des adresses. */
  thumbnail: string;
  image: string;
  footer: string;
  /** Texte AU-DESSUS de l'embed : le `content` du message. */
  content: string;
  buttons: LinkButton[];
}

export const EMPTY_EMBED: EmbedForm = {
  title: '',
  url: '',
  color: EMBED_COLOR,
  thumbnail: '',
  image: '',
  footer: '',
  content: '',
  buttons: [],
};

/** Le formulaire tel qu'il arrive de la page : tout ce qui n'est pas du texte tombe. */
export function embedForm(raw: unknown): EmbedForm {
  const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const text = (v: unknown): string => (typeof v === 'string' ? v : '');
  return {
    title: text(o.title),
    url: text(o.url),
    color: text(o.color) || EMBED_COLOR,
    thumbnail: text(o.thumbnail),
    image: text(o.image),
    footer: text(o.footer),
    content: text(o.content),
    buttons: (Array.isArray(o.buttons) ? o.buttons : []).map((b: unknown) => {
      const button = (b && typeof b === 'object' ? b : {}) as Record<string, unknown>;
      return { label: text(button.label), url: text(button.url) };
    }),
  };
}

/** Une adresse que Discord accepte dans un embed ou un bouton : `http` ou `https`. */
export function isHttpUrl(s: string): boolean {
  if (/\s/.test(s)) return false;
  try {
    const { protocol } = new URL(s);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

/** `#rrggbb` → l'entier que Discord attend ; toute autre écriture : la couleur par défaut. */
export function embedColor(hex: string): number {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  return parseInt(m ? m[1] : EMBED_COLOR.slice(1), 16);
}

/**
 * UN message en mode embed, prêt à partir : le texte du dessus, la carte, les
 * boutons. `''` = champ absent. Tout y est déjà converti et validé.
 */
export interface EmbedMessage {
  content: string;
  title: string;
  url: string;
  description: string;
  color: number;
  thumbnail: string;
  image: string;
  footer: string;
  buttons: LinkButton[];
}

export interface PreparedEmbed {
  messages: EmbedMessage[];
  /** Longueur de la description, emojis convertis (plafond : 4 096 par embed). */
  length: number;
  /** Le plus gros total de textes d'un embed — titre, description, pied (plafond : 6 000). */
  total: number;
  unknown: string[];
  pending: string[];
  /** Champs refusés, chacun NOMMÉ : le premier bloque l'envoi. */
  invalid: string[];
  /** Découpage impossible (une ligne dépasse à elle seule) : rien ne part. */
  error?: string;
}

/** Ce que Discord compte dans les 6 000 caractères d'un embed. */
export const embedTotal = (m: EmbedMessage): number =>
  m.title.length + m.description.length + m.footer.length;

/**
 * Le texte de l'éditeur et le formulaire → les messages qui partent.
 *
 * Le texte est la DESCRIPTION. Au-delà de 4 096 caractères (comptés emojis
 * convertis), même découpage que pour un message simple — jamais au milieu d'une
 * ligne, de préférence avant un `## ` — en plusieurs messages d'un embed chacun :
 * titre, lien, vignette et texte du dessus sur le PREMIER seulement ; image,
 * pied et boutons sur le DERNIER ; la même couleur partout.
 *
 * Emojis : convertis dans la description, le titre et le texte du dessus. Dans
 * le pied et les libellés de bouton, Discord n'affiche pas les emojis de
 * serveur : seuls les standards y sont convertis, un code de serveur est refusé.
 *
 * Un champ refusé (trop long, adresse qui n'est pas du http, bouton à moitié
 * rempli) est vidé du rendu et NOMMÉ dans `invalid`.
 */
export function prepareEmbed(
  text: string,
  form: EmbedForm,
  guild: GuildEmojis,
  partial = false,
): PreparedEmbed {
  const unknown = new Set<string>();
  const pending = new Set<string>();
  const invalid: string[] = [];
  const note = (c: Converted): void => {
    for (const n of c.unknown) unknown.add(n);
    for (const n of c.pending) pending.add(n);
  };
  const lf = (s: string): string => s.replace(/\r\n?/g, '\n');
  /** Champ où les emojis de serveur s'affichent. */
  const rich = (s: string): string => {
    const c = convertEmojis(lf(s), guild, partial);
    note(c);
    return c.content.trim();
  };
  /** Champ où ils ne s'affichent pas. */
  const plain = (s: string, where: string): string => {
    const c = convertPlain(lf(s), guild, partial);
    note(c);
    if (c.server.length)
      invalid.push(
        `${where} : ${codes(c.server)} — Discord n’y affiche pas les emojis de serveur, retire ${c.server.length > 1 ? 'ces codes' : 'ce code'}.`,
      );
    return c.content.trim();
  };
  const within = (s: string, limit: number, where: string): string => {
    if (s.length <= limit) return s;
    invalid.push(`${where} : ${s.length} caractères, Discord en accepte ${limit}.`);
    return '';
  };
  const link = (s: string, where: string): string => {
    const url = s.trim();
    if (!url || isHttpUrl(url)) return url;
    invalid.push(`${where} : « ${url} » n’est pas une adresse http(s).`);
    return '';
  };

  const description = convertEmojis(lf(text), guild, partial);
  note(description);
  const split = splitMessage(description.content, EMBED_DESCRIPTION_LIMIT);

  // Un titre tient sur une ligne.
  const title = within(rich(form.title).replace(/\s*\n\s*/g, ' '), EMBED_TITLE_LIMIT, 'Titre');
  let url = link(form.url, 'Lien du titre');
  if (url && !form.title.trim()) {
    invalid.push('Lien du titre : il lui faut un titre.');
    url = '';
  }
  const thumbnail = link(form.thumbnail, 'Vignette');
  const image = link(form.image, 'Image');
  const footer = within(plain(form.footer, 'Pied'), EMBED_FOOTER_LIMIT, 'Pied');
  const content = within(rich(form.content), MESSAGE_LIMIT, 'Texte au-dessus de l’embed');

  const filled = form.buttons
    .map((b, i) => ({ label: b.label.trim(), url: b.url.trim(), where: `Bouton ${i + 1}` }))
    .filter((b) => b.label || b.url);
  if (filled.length > BUTTON_MAX)
    invalid.push(`Boutons : ${filled.length} remplis, Discord en accepte ${BUTTON_MAX}.`);
  const buttons: LinkButton[] = [];
  for (const b of filled.slice(0, BUTTON_MAX)) {
    const label = within(plain(b.label, b.where), BUTTON_LABEL_LIMIT, `${b.where}, libellé`);
    const href = within(
      link(b.url, `${b.where}, adresse`),
      BUTTON_URL_LIMIT,
      `${b.where}, adresse`,
    );
    if (!b.label) invalid.push(`${b.where} : libellé manquant.`);
    else if (!b.url) invalid.push(`${b.where} : adresse manquante.`);
    if (label && href) buttons.push({ label, url: href });
  }

  // Sans description, la carte peut encore porter un titre, une image, un pied.
  const bare = Boolean(title || thumbnail || image || footer);
  const chunks = split.chunks.length ? split.chunks : bare ? [''] : [];
  const n = chunks.length;
  const color = embedColor(form.color);
  const messages = chunks.map((chunk, i): EmbedMessage => ({
    content: i === 0 ? content : '',
    title: i === 0 ? title : '',
    url: i === 0 ? url : '',
    description: chunk,
    color,
    thumbnail: i === 0 ? thumbnail : '',
    image: i === n - 1 ? image : '',
    footer: i === n - 1 ? footer : '',
    buttons: i === n - 1 ? buttons : [],
  }));
  if (!n && (content || buttons.length))
    invalid.push(
      'Embed vide : il lui faut au moins une description (le texte de l’éditeur), un titre, une image ou un pied.',
    );
  messages.forEach((m, i) => {
    if (embedTotal(m) > EMBED_TOTAL_LIMIT)
      invalid.push(
        `Embed${n > 1 ? ` du message ${i + 1}/${n}` : ''} : ${embedTotal(m)} caractères de texte en tout (titre, description, pied), Discord en accepte ${EMBED_TOTAL_LIMIT}. Raccourcis le pied ou le titre.`,
      );
  });

  return {
    messages,
    length: description.content.trim().length,
    total: Math.max(0, ...messages.map(embedTotal)),
    unknown: [...unknown],
    pending: [...pending],
    invalid,
    ...(split.error ? { error: split.error } : {}),
  };
}

/** Pourquoi cet embed ne peut pas partir (`null` = il peut). */
export function embedBlocker(p: PreparedEmbed): string | null {
  if (p.error) return p.error.replace('par message', 'par description d’embed');
  if (p.invalid.length) return p.invalid[0];
  if (!p.messages.length) return 'Message vide.';
  return emojiBlocker(p);
}

/**
 * La carte d'un message en mode embed, comme Discord l'affiche : le texte du
 * dessus, puis la carte — barre de couleur à gauche, titre (cliquable s'il a un
 * lien), description en markdown, vignette à droite, image dessous, pied — et
 * les boutons de lien sous elle. HTML sûr, à poser dans un conteneur `.dc`.
 *
 * NON VÉRIFIÉ contre Discord : la description est rendue comme un message
 * (`renderDiscord`), titres `#`/`##` et sous-texte `-#` compris. Discord rend
 * bien le markdown dans une description ; ces trois-là restent à confirmer au
 * premier envoi.
 */
export function renderEmbed(m: EmbedMessage, marks: Marks = {}): string {
  const anchor = (url: string, cls: string, inner: string): string =>
    `<a${cls ? ` class="${cls}"` : ''} href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${inner}</a>`;
  const img = (url: string, cls: string): string =>
    url ? `<img class="${cls}" alt="" src="${escapeHtml(url)}">` : '';

  const title = m.title
    ? `<div class="dc-embed-title">${m.url ? anchor(m.url, '', inline(m.title, marks)) : inline(m.title, marks)}</div>`
    : '';
  const description = m.description
    ? `<div class="dc-embed-desc">${renderDiscord(m.description, marks)}</div>`
    : '';
  const footer = m.footer
    ? `<div class="dc-embed-footer">${escapeHtml(m.footer.replace(PRIVATE, ''))}</div>`
    : '';
  const buttons = m.buttons.length
    ? `<div class="dc-buttons">${m.buttons.map((b) => anchor(b.url, 'dc-button', escapeHtml(b.label))).join('')}</div>`
    : '';
  const color = `#${m.color.toString(16).padStart(6, '0')}`;

  return (
    (m.content ? `<div class="dc-above">${renderDiscord(m.content, marks)}</div>` : '') +
    `<div class="dc-embed" style="border-left-color:${color}">` +
    `<div class="dc-embed-head"><div class="dc-embed-text">${title}${description}</div>${img(m.thumbnail, 'dc-embed-thumb')}</div>` +
    img(m.image, 'dc-embed-image') +
    footer +
    '</div>' +
    buttons
  );
}

/** Le preview d'un envoi en mode embed : un cadre par message, avec ses longueurs. */
export function embedPreviewHtml(p: PreparedEmbed): string {
  const n = p.messages.length;
  return p.messages
    .map(
      (m, i) =>
        `<div class="dc-cut">message ${i + 1}/${n} · embed · description ${m.description.length} caractères · textes ${embedTotal(m)}</div>` +
        `<div class="dc">${renderEmbed(m, p)}</div>`,
    )
    .join('');
}

// ------------------------------------------------------- notes officielles ---

/** Ce que l'onglet lit d'un post de `data/patch-notes/posts.json`. */
export interface NotePost {
  id: number | string;
  date: string;
  slug: string;
  lang: string;
  type: string;
  title: string;
  content: string;
}

export interface NoteRef {
  id: string;
  date: string;
  type: string;
  title: string;
  url: string;
}

/** Hôte des annonces officielles — le même que `WP_API` dans `scripts/get-news.ts`. */
export const OFFICIAL_HOST = 'annoucements.outerplane.major7.kr';

/**
 * Adresse d'un post sur le site officiel : le permalien WordPress
 * `/<année>/<mois>/<jour>/<slug>/`.
 *
 * Le site ne la construit NULLE PART (l'outil `patch-history` rend le contenu
 * scrapé, sans lien vers l'original) et `get-news` ne demande pas le champ
 * `link` à l'API. Le motif est donc relevé dans la donnée : les notes se citent
 * entre elles, et les 63 liens de cette forme dont le post cité est dans
 * `posts.json` portent tous la date et le slug stockés — aucun contre-exemple
 * (relevé du 05/10/2026). `date` est la date de publication de WordPress, celle
 * du permalien ; un slug non ASCII y est déjà encodé.
 */
export function officialUrl(post: Pick<NotePost, 'date' | 'slug'>): string {
  return `https://${OFFICIAL_HOST}/${post.date.replaceAll('-', '/')}/${post.slug}/`;
}

/** Les dernières notes en anglais, les plus récentes d'abord. */
export function latestNotes(posts: readonly NotePost[], limit = 40): NoteRef[] {
  return posts
    .filter((p) => p.lang === 'en')
    .sort((a, b) => b.date.localeCompare(a.date) || Number(b.id) - Number(a.id))
    .slice(0, limit)
    .map((p) => ({
      id: String(p.id),
      date: p.date,
      type: p.type,
      title: p.title,
      url: officialUrl(p),
    }));
}

/**
 * Document du cadre isolé qui montre une note (`iframe` en `srcdoc`, sous
 * `sandbox`). Deux verrous pour un HTML qu'on n'a pas écrit : le bac à sable
 * de l'iframe, sans `allow-scripts`, et cette CSP — rien ne s'exécute, seules
 * les images et les vidéos se chargent, depuis leur origine. Les `src` relatifs
 * (`/images/patch-notes/…`) se résolvent sur l'outil, qui les sert.
 */
export function noteSrcdoc(content: string): string {
  return `<!doctype html><html><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src http: https: data:; media-src http: https:; style-src 'unsafe-inline'">
<base target="_blank">
<style>body{margin:14px;background:#fff;color:#1c1f27;font:14px/1.6 system-ui,sans-serif;overflow-wrap:anywhere}img,video,iframe{max-width:100%;height:auto}table{max-width:100%}</style>
</head><body>${content}</body></html>`;
}

const TEMPLATE_HEAD = '# :scroll: PATCH NOTES — TL;DR';
const TEMPLATE_SECTIONS = [
  '## :star: Banners & Dungeons',
  '## :crossed_swords: Content',
  '## :scales: Adjustments',
  '## :moneybag: Shop',
  '## :bug: Bug Fixes',
];
const FULL_NOTE = 'Full Patch Note';

/** Les sept lignes du résumé de patch de Sevih, avec le lien de la note choisie. */
export function patchTemplate(noteUrl: string): string {
  return [TEMPLATE_HEAD, `-# [${FULL_NOTE}](${noteUrl})`, ...TEMPLATE_SECTIONS].join('\n');
}

/**
 * Le même gabarit en mode embed : le lien de la note n'est plus un sous-texte
 * mais un BOUTON de lien sous la carte.
 */
export function embedTemplate(noteUrl: string): { text: string; buttons: LinkButton[] } {
  return {
    text: [TEMPLATE_HEAD, ...TEMPLATE_SECTIONS].join('\n'),
    buttons: [{ label: FULL_NOTE, url: noteUrl }],
  };
}

// --------------------------------------------------------------- requêtes ----

/** Ce qu'on utilise de `fetch` — assez étroit pour qu'un test le simule sans transtypage. */
export type FetchLike = (
  url: string,
  init: { method: string; headers: Record<string, string>; body?: string },
) => Promise<{ status: number; ok: boolean; json(): Promise<unknown> }>;

export interface DiscordDeps {
  token: string | undefined;
  /** `DISCORD_GUILD_ID` : le serveur proposé au premier lancement, rien de plus. */
  guildId: string | undefined;
  fetch: FetchLike;
  sleep: (ms: number) => Promise<void>;
}

type Method = 'GET' | 'POST' | 'PATCH';

/** La requête telle qu'elle part. Seul endroit où le jeton est écrit. */
export function buildRequest(
  token: string,
  method: Method,
  path: string,
  body?: unknown,
): { url: string; init: { method: string; headers: Record<string, string>; body?: string } } {
  return {
    url: `${DISCORD_API}${path}`,
    init: {
      method,
      headers: {
        Authorization: `Bot ${token}`,
        // Discord exige cette forme, et refuse les agents qu'il ne reconnaît pas.
        'User-Agent': 'DiscordBot (https://outerpedia.com, 1.0)',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    },
  };
}

/**
 * Corps d'un message. `allowed_mentions.parse` vide : AUCUNE mention ne notifie,
 * pas même un `@everyone` tapé par mégarde. À la modification, le drapeau est
 * toujours écrit — `0` retire l'aperçu supprimé si la case a été décochée.
 */
export function messageBody(
  content: string,
  suppressEmbeds: boolean,
  edit = false,
): { content: string; allowed_mentions: { parse: [] }; flags?: number } {
  return {
    content,
    allowed_mentions: { parse: [] },
    ...(suppressEmbeds ? { flags: SUPPRESS_EMBEDS } : edit ? { flags: 0 } : {}),
  };
}

/**
 * Corps d'un message en mode embed. Le drapeau « sans aperçu des liens » n'y est
 * JAMAIS posé : il masquerait l'embed lui-même. À la modification, tout est
 * écrit — texte du dessus et boutons vidés compris, sans quoi ceux d'avant
 * resteraient en place.
 */
export function embedBody(m: EmbedMessage, edit = false): Record<string, unknown> {
  const components = m.buttons.length
    ? [
        {
          type: 1, // rangée de composants
          // Bouton de style « lien » (5) : il porte une adresse, pas d'identifiant.
          components: m.buttons.map((b) => ({ type: 2, style: 5, label: b.label, url: b.url })),
        },
      ]
    : [];
  return {
    ...(m.content || edit ? { content: m.content } : {}),
    embeds: [
      {
        ...(m.title ? { title: m.title } : {}),
        ...(m.title && m.url ? { url: m.url } : {}),
        ...(m.description ? { description: m.description } : {}),
        color: m.color,
        ...(m.thumbnail ? { thumbnail: { url: m.thumbnail } } : {}),
        ...(m.image ? { image: { url: m.image } } : {}),
        ...(m.footer ? { footer: { text: m.footer } } : {}),
      },
    ],
    ...(components.length || edit ? { components } : {}),
    allowed_mentions: { parse: [] },
    ...(edit ? { flags: 0 } : {}),
  };
}

/** Retire le jeton d'un texte destiné à l'écran — ceinture ET bretelles. */
export function scrub(text: string, token: string | undefined): string {
  return token ? text.split(token).join('«jeton»') : text;
}

/** Ce que les codes d'erreur courants veulent dire ici. */
const ERROR_HINTS: Record<number, string> = {
  10003: 'salon inconnu',
  10008: 'message introuvable — supprimé depuis ?',
  50001: 'le bot ne voit pas ce salon',
  50013: 'permission manquante dans ce salon',
  50035: 'contenu refusé',
};

/** Les mêmes codes quand on lit un SERVEUR (ses salons, ses emojis) et non un salon. */
const GUILD_HINTS: Record<number, string> = {
  10004: 'serveur inconnu',
  50001: 'le bot n’a pas accès à ce serveur',
};

/** Au-delà, on n'attend pas : c'est un blocage, pas un simple ralentissement. */
const MAX_RETRY_AFTER_S = 30;

/** `status` : le statut HTTP d'un refus de Discord (absent si rien n'est revenu). */
type Called<T> = { ok: true; data: T } | { ok: false; error: string; status?: number };

/**
 * Un appel à l'API. Un 429 est ATTENDU (`retry_after`, en secondes) puis retenté
 * UNE fois ; tout autre refus revient en texte — statut, message et code de
 * Discord, jamais nos en-têtes.
 */
async function call<T>(
  deps: DiscordDeps,
  method: Method,
  path: string,
  body?: unknown,
  hints: Record<number, string> = ERROR_HINTS,
): Promise<Called<T>> {
  if (!deps.token) return { ok: false, error: TOKEN_HINT };
  const { url, init } = buildRequest(deps.token, method, path, body);
  const fail = (error: string, status?: number): Called<T> => ({
    ok: false,
    error: scrub(error, deps.token),
    ...(status === undefined ? {} : { status }),
  });

  for (let attempt = 0; ; attempt++) {
    let res: Awaited<ReturnType<FetchLike>>;
    let data: unknown;
    try {
      res = await deps.fetch(url, init);
      data = await res.json().catch(() => null);
    } catch (e: unknown) {
      const cause = (e as { cause?: { code?: string } }).cause?.code;
      return fail(`Discord injoignable : ${String(e)}${cause ? ` (${cause})` : ''}`);
    }
    if (res.ok) return { ok: true, data: data as T };

    const info = (data ?? {}) as { message?: string; code?: number; retry_after?: number };
    if (res.status === 429 && attempt === 0) {
      const wait = Number(info.retry_after ?? 1);
      if (wait <= MAX_RETRY_AFTER_S) {
        await deps.sleep(Math.ceil(wait * 1000));
        continue;
      }
    }
    const hint =
      res.status === 401 ? 'jeton refusé' : info.code !== undefined ? hints[info.code] : '';
    return fail(
      `Discord a répondu ${res.status}${info.message ? ` : ${info.message}` : ''}${info.code ? ` (code ${info.code})` : ''}${hint ? ` — ${hint}` : ''}${res.status === 429 ? ` — limite de débit, réessaie dans ${Math.ceil(Number(info.retry_after ?? 0))} s` : ''}`,
      res.status,
    );
  }
}

// ---------------------------------------------------------------- serveur ----

export interface Channel {
  id: string;
  name: string;
  /** Nom de la catégorie, `''` hors catégorie. */
  category: string;
  announcement: boolean;
}

/**
 * Un salon où poster. `externalEmojis` : le bot y a-t-il « Utiliser des emojis
 * externes » ? `null` quand on ne peut pas le dire — et alors on ne devine pas.
 */
export interface PostChannel extends Channel {
  externalEmojis: boolean | null;
}

/** Un serveur dont le bot est membre, tel que la page le voit : nom et id, rien d'autre. */
export interface GuildRef {
  id: string;
  name: string;
}

/** Ce qu'on garde EN PLUS d'un serveur pour lire les permissions du bot. */
interface KnownGuild extends GuildRef {
  owner: boolean;
  /** Permissions du bot à l'échelle du serveur ; `null` si Discord ne les a pas dites. */
  permissions: bigint | null;
}

interface RawOverwrite {
  id: string;
  /** 0 : un rôle, 1 : un membre. */
  type: number;
  allow: string;
  deny: string;
}

interface RawChannel {
  id: string;
  type: number;
  name?: string;
  position?: number;
  parent_id?: string | null;
  permission_overwrites?: RawOverwrite[];
}

interface RawEmoji {
  id: string | null;
  name: string | null;
  animated?: boolean;
  available?: boolean;
}

const TEXT = 0;
const CATEGORY = 4;
const ANNOUNCEMENT = 5;

/**
 * Les salons où poster (texte et annonces), dans l'ordre de la liste de
 * Discord : ceux hors catégorie d'abord, puis catégorie par catégorie, chacun
 * par `position` — l'id départage, comme chez Discord.
 */
export function sortChannels(raw: readonly RawChannel[]): Channel[] {
  const order = (a: RawChannel, b: RawChannel): number =>
    (a.position ?? 0) - (b.position ?? 0) || (BigInt(a.id) < BigInt(b.id) ? -1 : 1);
  const categories = raw.filter((c) => c.type === CATEGORY).sort(order);
  const postable = raw.filter((c) => c.type === TEXT || c.type === ANNOUNCEMENT).sort(order);
  const known = new Set(categories.map((c) => c.id));
  const of = (list: RawChannel[], category: string): Channel[] =>
    list.map((c) => ({
      id: c.id,
      name: c.name ?? c.id,
      category,
      announcement: c.type === ANNOUNCEMENT,
    }));
  return [
    ...of(
      postable.filter((c) => !c.parent_id || !known.has(c.parent_id)),
      '',
    ),
    ...categories.flatMap((cat) =>
      of(
        postable.filter((c) => c.parent_id === cat.id),
        cat.name ?? '',
      ),
    ),
  ];
}

const ADMINISTRATOR = 1n << 3n;
const USE_EXTERNAL_EMOJIS = 1n << 18n;

/** Ce qu'on sait du bot sur un serveur pour y lire UNE permission. */
export interface BotAccess {
  guildId: string;
  owner: boolean;
  /** Permissions à l'échelle du serveur (rôles réunis) ; `null` : inconnues. */
  permissions: bigint | null;
  /** Rôles du bot sur ce serveur ; `null` : pas lus. */
  roles: readonly string[] | null;
  /** Id du bot ; `null` : pas lu. */
  userId: string | null;
}

/**
 * Le bot a-t-il « Utiliser des emojis externes » dans ce salon ? Sans elle,
 * Discord ne refuse rien : il affiche l'emoji d'un autre serveur en toutes
 * lettres.
 *
 * C'est le calcul que Discord documente, réduit à ce seul bit : les
 * permissions du serveur, puis les dérogations du salon dans l'ordre —
 * `@everyone` (son id est celui du serveur), les rôles du bot (un refus, sauf
 * si un autre de ses rôles l'accorde), le bot lui-même. Propriétaire et
 * administrateur passent outre.
 *
 * `null` dès qu'il manque de quoi trancher (permissions non dites, rôles non
 * lus alors qu'une dérogation de rôle touche ce bit…) : on ne devine pas.
 */
export function canUseExternalEmojis(
  access: BotAccess,
  overwrites: readonly RawOverwrite[] | undefined,
): boolean | null {
  if (access.owner) return true;
  if (access.permissions === null) return null;
  if (access.permissions & ADMINISTRATOR) return true;
  if (!overwrites) return null;

  const bit = (v: string): boolean => {
    try {
      return (BigInt(v) & USE_EXTERNAL_EMOJIS) !== 0n;
    } catch {
      return false;
    }
  };
  // Seules les dérogations qui touchent ce bit comptent.
  const touching = overwrites.filter((o) => bit(o.allow) || bit(o.deny));
  let granted = (access.permissions & USE_EXTERNAL_EMOJIS) !== 0n;
  const apply = (list: readonly RawOverwrite[]): void => {
    if (list.some((o) => bit(o.deny))) granted = false;
    if (list.some((o) => bit(o.allow))) granted = true;
  };

  apply(touching.filter((o) => o.type === 0 && o.id === access.guildId));
  const byRole = touching.filter((o) => o.type === 0 && o.id !== access.guildId);
  if (byRole.length) {
    if (!access.roles) return null;
    const mine = new Set(access.roles);
    apply(byRole.filter((o) => mine.has(o.id)));
  }
  const byMember = touching.filter((o) => o.type === 1);
  if (byMember.length) {
    if (!access.userId) return null;
    apply(byMember.filter((o) => o.id === access.userId));
  }
  return granted;
}

interface RawGuild {
  id: string;
  name?: string;
  owner?: boolean;
  permissions?: string;
}

/** Lien qui invite le bot sur un serveur de plus — son id est aussi celui de son application. */
export const inviteUrl = (botId: string): string =>
  `https://discord.com/oauth2/authorize?client_id=${botId}&scope=bot&permissions=0`;

/**
 * Les serveurs dont le bot est membre, dans l'ordre où Discord les rend (du plus
 * ancien au plus récent). Une page de 200 au plus : le bot n'en a qu'une poignée.
 */
async function loadGuilds(deps: DiscordDeps): Promise<Called<KnownGuild[]>> {
  const res = await call<RawGuild[]>(deps, 'GET', '/users/@me/guilds');
  if (!res.ok) return res;
  return {
    ok: true,
    data: res.data
      .filter((g) => SNOWFLAKE.test(String(g.id)))
      .map((g) => {
        let permissions: bigint | null = null;
        try {
          if (typeof g.permissions === 'string') permissions = BigInt(g.permissions);
        } catch {}
        return { id: g.id, name: g.name ?? g.id, owner: g.owner === true, permissions };
      }),
  };
}

/**
 * Les salons d'un serveur, avec pour chacun la permission d'emojis externes. Les
 * rôles du bot ne sont lus que s'ils peuvent changer la réponse (ni
 * propriétaire, ni administrateur) ; cette lecture-là peut échouer sans rien
 * bloquer — la permission reste alors « inconnue ».
 */
async function loadChannels(
  deps: DiscordDeps,
  guild: KnownGuild,
  botId: string | null,
): Promise<Called<PostChannel[]>> {
  const channels = await call<RawChannel[]>(
    deps,
    'GET',
    `/guilds/${guild.id}/channels`,
    undefined,
    GUILD_HINTS,
  );
  if (!channels.ok) return channels;

  const above = guild.owner || (guild.permissions !== null && guild.permissions & ADMINISTRATOR);
  let roles: string[] | null = null;
  if (!above && botId) {
    const member = await call<{ roles?: unknown }>(
      deps,
      'GET',
      `/guilds/${guild.id}/members/${botId}`,
    );
    if (member.ok && Array.isArray(member.data?.roles)) roles = member.data.roles.map(String);
  }
  const access: BotAccess = {
    guildId: guild.id,
    owner: guild.owner,
    permissions: guild.permissions,
    roles,
    userId: botId,
  };
  const raw = new Map(channels.data.map((c) => [c.id, c]));
  return {
    ok: true,
    data: sortChannels(channels.data).map((c) => ({
      ...c,
      externalEmojis: canUseExternalEmojis(access, raw.get(c.id)?.permission_overwrites),
    })),
  };
}

/** Les emojis utilisables d'un serveur, par nom. */
async function loadEmojis(deps: DiscordDeps, guildId: string): Promise<Called<GuildEmoji[]>> {
  const res = await call<RawEmoji[]>(
    deps,
    'GET',
    `/guilds/${guildId}/emojis`,
    undefined,
    GUILD_HINTS,
  );
  if (!res.ok) return res;
  return {
    ok: true,
    data: res.data
      .filter((e) => e.id && e.name && e.available !== false)
      // Recopiés champ par champ : rien d'autre de ce que Discord renvoie d'un
      // emoji n'a à atteindre la page.
      .map((e) => ({ id: e.id!, name: e.name!, animated: Boolean(e.animated) }))
      .sort((x, y) => x.name.toLowerCase().localeCompare(y.name.toLowerCase(), 'en')),
  };
}

// ------------------------------------------------------------------ envoi ----

/** Écart entre deux messages d'un même envoi. */
const SPACING_MS = 1000;

/**
 * Journal à deux temps, comme celui d'`actions.ts` (non importé : ce module-là
 * charge toute la couche de données, dont ce geste n'a pas besoin) — avec en
 * plus le passage par `scrub` de chaque ligne.
 */
function journal(report: Report | undefined, token: string | undefined) {
  const lines: string[] = [];
  return {
    lines,
    doing: (line: string): void => report?.(scrub(line, token), true),
    done: (line: string): void => {
      lines.push(scrub(line, token));
      report?.(scrub(line, token));
    },
  };
}

/** Résultat d'un envoi : `ids` porte TOUS les messages en place, repris compris. */
export interface SendOutcome extends Outcome {
  ids: string[];
  urls: string[];
}

const messageUrl = (guildId: string, channelId: string, id: string): string =>
  `https://discord.com/channels/${guildId}/${channelId}/${id}`;

/** Où poster, et quoi : un corps de requête par message (`messageBody`, `embedBody`). */
interface Delivery {
  guildId: string;
  channelId: string;
  bodies: readonly unknown[];
}

/**
 * Poste les morceaux DANS L'ORDRE, espacés d'une seconde. Au premier échec on
 * S'ARRÊTE : poster la suite laisserait un trou au milieu du résumé. `ids`
 * revient avec ce qui est parti ; le repasser dans `already` REPREND au morceau
 * fautif sans rien reposter.
 */
export async function sendMessages(
  deps: DiscordDeps,
  input: Delivery & { already?: string[] },
  report?: Report,
): Promise<SendOutcome> {
  const { guildId, channelId, bodies } = input;
  const ids = [...(input.already ?? [])];
  const urls = (): string[] => ids.map((id) => messageUrl(guildId, channelId, id));
  const refuse = (line: string): SendOutcome => ({ ok: false, log: [line], ids, urls: urls() });

  if (!deps.token) return refuse(TOKEN_HINT);
  if (![guildId, channelId, ...ids].every((id) => SNOWFLAKE.test(id)))
    return refuse('Identifiant de serveur, de salon ou de message invalide.');
  if (ids.length >= bodies.length) return refuse('Tous les morceaux sont déjà postés.');

  const j = journal(report, deps.token);
  const n = bodies.length;
  const first = ids.length;
  if (first)
    j.done(
      `reprise : ${first === 1 ? 'le message 1 est déjà posté, non renvoyé' : `les messages 1 à ${first} sont déjà postés, non renvoyés`}.`,
    );

  for (let i = first; i < n; i++) {
    if (i > first) await deps.sleep(SPACING_MS);
    j.doing(`envoi du message ${i + 1}/${n}`);
    const res = await call<{ id: string }>(
      deps,
      'POST',
      `/channels/${channelId}/messages`,
      bodies[i],
    );
    if (!res.ok) {
      j.done(`ÉCHEC au message ${i + 1}/${n} — ${res.error}`);
      j.done(
        ids.length
          ? `Partis : ${ids.length} sur ${n}. Un nouveau clic reprend au message ${i + 1}, sans reposter les précédents.`
          : 'Rien n’a été posté.',
      );
      return { ok: false, log: j.lines, ids, urls: urls() };
    }
    ids.push(res.data.id);
    j.done(`message ${i + 1}/${n} posté : ${messageUrl(guildId, channelId, res.data.id)}`);
  }
  return { ok: true, log: j.lines, ids, urls: urls() };
}

/**
 * Modifie EN PLACE les messages déjà postés (`PATCH`), morceau par morceau. Si
 * le nombre de morceaux a changé, refus : il faudrait supprimer ou reposter, et
 * ça ne se fait pas tout seul.
 */
export async function editMessages(
  deps: DiscordDeps,
  input: Delivery & { ids: string[] },
  report?: Report,
): Promise<SendOutcome> {
  const { guildId, channelId, ids, bodies } = input;
  const urls = ids.map((id) => messageUrl(guildId, channelId, id));
  const refuse = (line: string): SendOutcome => ({ ok: false, log: [line], ids, urls });

  if (!deps.token) return refuse(TOKEN_HINT);
  if (!ids.length || ![guildId, channelId, ...ids].every((id) => SNOWFLAKE.test(id)))
    return refuse('Identifiant de serveur, de salon ou de message invalide.');
  if (ids.length !== bodies.length)
    return refuse(
      `Modification refusée : ${ids.length} message${ids.length > 1 ? 's sont postés' : ' est posté'}, le texte en fait maintenant ${bodies.length}. Rien n’est supprimé ni reposté automatiquement — ramène le texte à ${ids.length} message${ids.length > 1 ? 's' : ''}, ou supprime dans Discord puis « Nouveau message ».`,
    );

  const j = journal(report, deps.token);
  const n = bodies.length;
  for (let i = 0; i < n; i++) {
    if (i) await deps.sleep(SPACING_MS);
    j.doing(`modification du message ${i + 1}/${n}`);
    const res = await call<{ id: string }>(
      deps,
      'PATCH',
      `/channels/${channelId}/messages/${ids[i]}`,
      bodies[i],
    );
    if (!res.ok) {
      j.done(`ÉCHEC au message ${i + 1}/${n} — ${res.error}`);
      j.done(
        i ? `Modifiés : ${i} sur ${n}. Un nouveau clic les repasse tous.` : 'Rien n’a été modifié.',
      );
      return { ok: false, log: j.lines, ids, urls };
    }
    j.done(`message ${i + 1}/${n} modifié : ${urls[i]}`);
  }
  return { ok: true, log: j.lines, ids, urls };
}

// ---------------------------------------------------------------- palette ----

/** Un groupe de la palette : son libellé, et les noms d'emojis qu'il propose. */
export interface PaletteGroup {
  label: string;
  names: string[];
}

const EMOJI_NAME = /^[A-Za-z0-9_+-]{1,32}$/;

/**
 * La palette de `discord-palette.json`, un fichier que Sevih retouche à la main :
 * on en garde ce qui est lisible, et `error` dit ce qui ne l'est pas plutôt que
 * de faire tomber l'onglet. Un nom peut y être écrit `dark` ou `:dark:`.
 */
export function parsePalette(raw: unknown): { groups: PaletteGroup[]; error: string | null } {
  const list = (raw as { groups?: unknown } | null)?.groups;
  if (!Array.isArray(list))
    return { groups: [], error: 'discord-palette.json : il manque la liste « groups ».' };
  const bad: string[] = [];
  const groups = list.flatMap((g: unknown, i): PaletteGroup[] => {
    const group = (g && typeof g === 'object' ? g : {}) as { label?: unknown; names?: unknown };
    if (!Array.isArray(group.names)) {
      bad.push(`groupe ${i + 1} sans « names »`);
      return [];
    }
    const names = group.names.flatMap((n: unknown): string[] => {
      const name = typeof n === 'string' ? n.trim().replace(/^:(.*):$/, '$1') : '';
      if (EMOJI_NAME.test(name)) return [name];
      bad.push(`nom illisible ${JSON.stringify(n)}`);
      return [];
    });
    return [{ label: typeof group.label === 'string' ? group.label : '', names }];
  });
  return { groups, error: bad.length ? `discord-palette.json : ${bad.join(', ')}.` : null };
}

// ---------------------------------------------------------------- session ----

export interface DiscordState {
  hasToken: boolean;
  /** Ce qui manque pour envoyer, dit tel quel à l'écran (`null` = rien). */
  hint: string | null;
  /**
   * Les serveurs dont le bot est membre — nom et id, RIEN d'autre ; `null` tant
   * que la liste n'est pas lue.
   */
  guilds: GuildRef[] | null;
  /** `DISCORD_GUILD_ID` s'il est dans la liste : le serveur du premier lancement. */
  defaultGuild: string | null;
  /** Lien qui invite le bot sur un autre serveur ; `null` tant que son id n'est pas lu. */
  invite: string | null;
}

/**
 * Ce que la page envoie avec CHAQUE demande (preview, envoi, modification) : la
 * session ne retient ni le serveur, ni les cases cochées, ni le mode.
 */
export interface Draft {
  text: string;
  mode: Mode;
  /** Le formulaire d'embed — lu en mode embed seulement. */
  embed: EmbedForm;
  /** Le serveur où l'on poste. */
  guildId: string;
  /** Les serveurs dont on prend les emojis. */
  emojiGuilds: string[];
}

export interface Preview {
  html: string;
  /** Nombre de messages, et longueur réelle (emojis convertis). */
  messages: number;
  length: number;
  /** Plafond de `length` : 2 000 par message, 4 096 par description d'embed. */
  limit: number;
  /** Mode embed : le plus gros total de textes d'un embed (plafond : 6 000). */
  total?: number;
  unknown: string[];
  pending: string[];
  /** Emojis du texte pris sur un AUTRE serveur que celui où l'on poste. */
  external: string[];
  /** Pourquoi ce texte ne peut pas partir (`null` = il peut). */
  blocker: string | null;
}

export interface SendRequest extends Draft {
  channelId: string;
  suppressEmbeds: boolean;
  /** Reprise d'un envoi interrompu : ids déjà postés, et le nombre de morceaux d'alors. */
  already?: string[];
  total?: number;
}

export interface EditRequest extends Draft {
  channelId: string;
  suppressEmbeds: boolean;
  ids: string[];
  /** Où et comment le message est parti — ce que la page a gardé à l'envoi. */
  posted: { guildId: string; channelId: string; mode: Mode };
}

/** Les emojis d'un serveur coché — ou pourquoi on ne les a pas. */
export interface EmojiList {
  id: string;
  emojis: GuildEmoji[];
  error?: string;
}

const UNKNOWN_GUILD =
  'Serveur inconnu du bot : choisis-en un de la liste (« recharger la liste » la relit).';
const FOREIGN_CHANNEL = 'Ce salon n’appartient pas au serveur choisi : choisis-en un de la liste.';
const MODE_NAME: Record<Mode, string> = { simple: 'message simple', embed: 'embed' };

/** Ce qu'un brouillon donne : son preview, et les corps de requête qui partiraient. */
interface Plan {
  preview: Preview;
  bodies(edit: boolean): unknown[];
}

/**
 * L'onglet vu du serveur local : ce qui a été LU de Discord — l'id du bot, la
 * liste de ses serveurs, les salons et les emojis de chacun, lus UNE fois par
 * session et par serveur (« recharger la liste » oublie tout) — et les réponses
 * des routes. Un chargement raté n'est pas retenu, la prochaine demande
 * réessaie ; seul un REFUS des emojis (403, 404) l'est, pour ne pas redemander
 * à chaque frappe ce que Discord vient de refuser.
 *
 * Sans jeton, RIEN ne part sur le réseau : l'état le dit, le preview rend quand
 * même (emojis standard convertis, les autres marqués « inconnu sans jeton »),
 * l'envoi est refusé.
 */
export function discordSession(deps: DiscordDeps) {
  let botId: string | null = null;
  let guilds: KnownGuild[] | null = null;
  const channels = new Map<string, PostChannel[]>();
  const emojis = new Map<string, GuildEmoji[]>();
  const denied = new Map<string, string>();

  // Deux demandes simultanées de la même liste n'en font qu'une.
  const flights = new Map<string, Promise<unknown>>();
  function once<T>(key: string, run: () => Promise<T>): Promise<T> {
    const flying = flights.get(key) as Promise<T> | undefined;
    if (flying) return flying;
    const flight = run().finally(() => flights.delete(key));
    flights.set(key, flight);
    return flight;
  }

  const ensureGuilds = (): Promise<string | null> =>
    once('guilds', async () => {
      if (!deps.token) return TOKEN_HINT;
      if (!botId) {
        const me = await call<{ id?: unknown }>(deps, 'GET', '/users/@me');
        if (!me.ok) return me.error;
        if (!SNOWFLAKE.test(String(me.data?.id)))
          return 'Discord n’a pas rendu l’identifiant du bot.';
        botId = String(me.data.id);
      }
      if (!guilds) {
        const res = await loadGuilds(deps);
        if (!res.ok) return res.error;
        guilds = res.data;
      }
      return null;
    });

  async function channelsOf(guildId: string): Promise<Called<PostChannel[]>> {
    const hint = await ensureGuilds();
    if (hint) return { ok: false, error: hint };
    const guild = guilds?.find((g) => g.id === guildId);
    if (!guild) return { ok: false, error: UNKNOWN_GUILD };
    const cached = channels.get(guildId);
    if (cached) return { ok: true, data: cached };
    return once(`channels:${guildId}`, async () => {
      const res = await loadChannels(deps, guild, botId);
      if (res.ok) channels.set(guildId, res.data);
      return res;
    });
  }

  /** Les serveurs cochés que le bot connaît, dans l'ORDRE DE LA LISTE. */
  const checked = (ids: readonly string[]): KnownGuild[] => {
    const wanted = new Set(ids);
    return (guilds ?? []).filter((g) => wanted.has(g.id));
  };

  /** Lit les emojis des serveurs cochés qui ne le sont pas encore, et les rend tous. */
  async function emojisOf(ids: readonly string[]): Promise<EmojiList[]> {
    if (await ensureGuilds()) return [];
    const out: EmojiList[] = [];
    for (const { id } of checked(ids)) {
      const no = denied.get(id);
      if (!emojis.has(id) && no === undefined) {
        const res = await once(`emojis:${id}`, () => loadEmojis(deps, id));
        if (res.ok) emojis.set(id, res.data);
        else {
          if (res.status === 403 || res.status === 404) denied.set(id, res.error);
          out.push({ id, emojis: [], error: res.error });
          continue;
        }
      }
      out.push(
        no === undefined ? { id, emojis: emojis.get(id) ?? [] } : { id, emojis: [], error: no },
      );
    }
    return out;
  }

  /**
   * La table des emojis des serveurs cochés, tirée du SEUL cache (un preview ne
   * lit rien sur le réseau). `partial` : un serveur coché n'est pas encore lu —
   * un nom inconnu peut alors en venir, il n'est pas encore une faute.
   */
  function tableOf(ids: readonly string[]): { table: GuildEmojis; partial: boolean } {
    if (!deps.token || !guilds) return { table: null, partial: false };
    const list = checked(ids);
    return {
      table: mergeEmojis(list.map((g) => emojis.get(g.id) ?? [])),
      partial: list.some((g) => !emojis.has(g.id) && !denied.has(g.id)),
    };
  }

  /** Noms des emojis d'un texte converti qui viennent d'un AUTRE serveur que `guildId`. */
  function external(texts: readonly string[], guildId: string): string[] {
    const elsewhere = new Set<string>();
    for (const [id, list] of emojis) if (id !== guildId) for (const e of list) elsewhere.add(e.id);
    for (const e of emojis.get(guildId) ?? []) elsewhere.delete(e.id);
    const names = new Set<string>();
    for (const text of texts)
      for (const m of text.matchAll(/<a?:(\w{2,32}):(\d{17,20})>/g))
        if (elsewhere.has(m[2])) names.add(m[1]);
    return [...names];
  }

  function plan(draft: Draft, suppressEmbeds: boolean): Plan {
    const { table, partial } = tableOf(draft.emojiGuilds);
    if (draft.mode === 'embed') {
      const p = prepareEmbed(draft.text, draft.embed, table, partial);
      return {
        preview: {
          html: embedPreviewHtml(p),
          messages: p.messages.length,
          length: p.length,
          limit: EMBED_DESCRIPTION_LIMIT,
          total: p.total,
          unknown: p.unknown,
          pending: p.pending,
          external: external(
            p.messages.flatMap((m) => [m.content, m.title, m.description]),
            draft.guildId,
          ),
          blocker: embedBlocker(p),
        },
        bodies: (edit) => p.messages.map((m) => embedBody(m, edit)),
      };
    }
    const p = prepare(draft.text, table, partial);
    return {
      preview: {
        html: previewHtml(p),
        messages: p.chunks.length,
        length: p.length,
        limit: MESSAGE_LIMIT,
        unknown: p.unknown,
        pending: p.pending,
        external: external(p.chunks, draft.guildId),
        blocker: blocker(p),
      },
      bodies: (edit) => p.chunks.map((chunk) => messageBody(chunk, suppressEmbeds, edit)),
    };
  }

  /**
   * Avant tout envoi : le serveur est un de ceux du bot, le salon est à CE
   * serveur, les emojis des serveurs cochés sont lus, et rien ne bloque le texte.
   */
  async function ready(
    req: Draft & { channelId: string; suppressEmbeds: boolean },
  ): Promise<Plan | { refusal: string }> {
    if (!deps.token) return { refusal: TOKEN_HINT };
    const list = await channelsOf(req.guildId);
    if (!list.ok) return { refusal: list.error };
    if (!list.data.some((c) => c.id === req.channelId)) return { refusal: FOREIGN_CHANNEL };
    await emojisOf(req.emojiGuilds);
    const planned = plan(req, req.suppressEmbeds);
    return planned.preview.blocker ? { refusal: planned.preview.blocker } : planned;
  }

  const refused = (line: string, ids: string[] = []): SendOutcome => ({
    ok: false,
    log: [scrub(line, deps.token)],
    ids,
    urls: [],
  });

  return {
    /** `reload` : oublie tout ce qui a été lu de Discord, et relit la liste des serveurs. */
    async state(reload = false): Promise<DiscordState> {
      if (reload) {
        guilds = null;
        channels.clear();
        emojis.clear();
        denied.clear();
      }
      const hint = await ensureGuilds();
      return {
        hasToken: Boolean(deps.token),
        hint,
        // Recopiés champ par champ : ni permissions ni rien d'autre vers la page.
        guilds: guilds?.map(({ id, name }) => ({ id, name })) ?? null,
        defaultGuild: guilds?.find((g) => g.id === deps.guildId)?.id ?? null,
        invite: botId ? inviteUrl(botId) : null,
      };
    },

    /** Les salons d'un serveur du bot. */
    async channels(guildId: string): Promise<{ channels: PostChannel[] } | { error: string }> {
      const res = await channelsOf(guildId);
      return res.ok ? { channels: res.data } : { error: scrub(res.error, deps.token) };
    },

    /** Les emojis des serveurs cochés — chacun lu une fois, un refus dit en clair. */
    async emojis(ids: readonly string[]): Promise<{ guilds: EmojiList[] }> {
      return { guilds: await emojisOf(ids) };
    },

    preview(draft: Draft): Preview {
      return plan(draft, false).preview;
    },

    async send(req: SendRequest, report?: Report): Promise<SendOutcome & { total: number }> {
      const already = req.already ?? [];
      const r = await ready(req);
      if ('refusal' in r) return { ...refused(r.refusal, already), total: req.total ?? 0 };
      const bodies = r.bodies(false);
      const total = bodies.length;
      if (already.length && req.total !== total)
        return {
          ...refused(
            `Reprise refusée : l’envoi interrompu comptait ${req.total ?? '?'} messages, le texte en fait maintenant ${total}. Remets le découpage d’origine, ou supprime dans Discord ce qui est parti puis « Nouveau message ».`,
            already,
          ),
          total,
        };
      const out = await sendMessages(
        deps,
        { guildId: req.guildId, channelId: req.channelId, bodies, already },
        report,
      );
      return { ...out, total };
    },

    async edit(req: EditRequest, report?: Report): Promise<SendOutcome> {
      if (!deps.token) return refused(TOKEN_HINT, req.ids);
      const { posted } = req;
      // Les ids restent liés à l'endroit où le message est parti : on ne
      // modifie jamais ailleurs, même si la page le demandait.
      if (posted.guildId !== req.guildId || posted.channelId !== req.channelId)
        return refused(
          'Modification refusée : ce message n’est pas parti du serveur et du salon choisis. Reviens à ceux d’origine, ou « Nouveau message ».',
          req.ids,
        );
      if (posted.mode !== req.mode)
        return refused(
          `Modification refusée : le message est parti en « ${MODE_NAME[posted.mode]} », l’éditeur est en « ${MODE_NAME[req.mode]} ». Un message posté ne change pas de mode — repasse en « ${MODE_NAME[posted.mode]} », ou « Nouveau message ».`,
          req.ids,
        );
      const r = await ready(req);
      if ('refusal' in r) return refused(r.refusal, req.ids);
      return editMessages(
        deps,
        { guildId: req.guildId, channelId: req.channelId, ids: req.ids, bodies: r.bodies(true) },
        report,
      );
    },
  };
}
