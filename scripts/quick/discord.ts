/**
 * quick/discord — le cinquième geste : écrire un message et le faire poster par
 * le bot Outerpedia (le résumé d'une note de patch, tapé jusqu'ici à la main
 * dans Discord).
 *
 * TRANSPORT (décision Sevih, 05/10) : l'API REST de Discord en direct, avec le
 * jeton du bot lu dans `.env.local` (`DISCORD_BOT_TOKEN`, `DISCORD_GUILD_ID`).
 * Ni dépendance (`fetch` de Node), ni détour par le dépôt `outerbot`.
 *
 * LE JETON NE SORT PAS D'ICI : il n'entre que dans l'en-tête `Authorization`
 * (`buildRequest`). Aucune réponse de route ne le porte, et toute ligne de
 * journal ou d'erreur passe par `scrub`, qui le remplacerait s'il s'y glissait.
 *
 * Trois étages, du plus pur au moins pur :
 *   - le TEXTE — `convertEmojis`, `splitMessage`, `renderDiscord` : des
 *     fonctions pures, sans réseau ni disque. Le preview et l'envoi passent par
 *     le MÊME `prepare` : ce que l'écran montre est ce qui part ;
 *   - les REQUÊTES — `buildRequest`, `messageBody`, puis `sendMessages` /
 *     `editMessages` qui reçoivent `fetch` et `sleep` en argument (les tests
 *     les simulent : rien ici n'appelle Discord tant que le jeton manque) ;
 *   - la SESSION — `discordSession` tient la liste du serveur (emojis, salons)
 *     lue une fois, et rend exactement ce que les routes de `server.ts`
 *     renvoient.
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

export const TOKEN_HINT = 'jeton absent : ajoute DISCORD_BOT_TOKEN à .env.local';
export const GUILD_HINT = 'serveur absent : ajoute DISCORD_GUILD_ID à .env.local';

const SNOWFLAKE = /^\d{17,20}$/;

// ---------------------------------------------------------------- emojis -----

export interface GuildEmoji {
  id: string;
  name: string;
  animated: boolean;
}

/** Emojis du serveur par nom ; `null` = liste inconnue (jeton absent, ou échec). */
export type GuildEmojis = ReadonlyMap<string, GuildEmoji> | null;

/**
 * Codes standard de Discord (`:scroll:` → 📜). Table tenue à la main dans
 * `discord-shortcodes.json` : les noms sont ceux de DISCORD, qui ne sont pas
 * toujours ceux de GitHub ou de Slack (`:calendar:` est 📆, 📅 s'appelle
 * `:date:` ; `:clock:` est 🕰️). Le test vérifie que chaque valeur est UN emoji
 * complet (sélecteur de variante compris, sans lequel ⚔ ou ⚠ sortent en texte).
 * En `Map` : un objet nu répondrait aussi à `:constructor:`.
 */
const STANDARD = new Map(Object.entries(shortcodes as Record<string, string>));

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
 * Remplace les `:nom:` par ce que Discord attend d'un BOT. Le client Discord
 * fait cette conversion à la frappe ; un message posté par l'API ne passe pas
 * par lui, et `:scroll:` y resterait du texte.
 *
 * Ordre de résolution : le SERVEUR d'abord (`<:nom:id>`, `<a:nom:id>` s'il est
 * animé), la table standard ensuite. Un nom que ni l'un ni l'autre ne connaît
 * est une faute de frappe (`unknown`) — sauf sans liste du serveur, où il peut
 * très bien en être un (`pending`). Un `:30:` de « 10:30:00 » n'a pas de
 * lettre : ce n'est pas un code, il reste du texte sans rien signaler.
 */
export function convertEmojis(text: string, guild: GuildEmojis): Converted {
  const unknown = new Set<string>();
  const pending = new Set<string>();
  let lower: Map<string, GuildEmoji> | null = null;

  const one = (whole: string, name: string | undefined): string => {
    if (name === undefined) return whole;
    // Nom exact d'abord ; la casse ne compte pas pour Discord à la frappe.
    lower ??= new Map([...(guild ?? [])].map(([k, e]) => [k.toLowerCase(), e]));
    const custom = guild?.get(name) ?? lower.get(name.toLowerCase());
    if (custom) return `<${custom.animated ? 'a' : ''}:${custom.name}:${custom.id}>`;
    const standard = STANDARD.get(name.toLowerCase()) ?? flag(name.toLowerCase());
    if (standard) return standard;
    if (!/[A-Za-z]/.test(name)) return whole;
    (guild ? unknown : pending).add(name);
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
export function prepare(text: string, guild: GuildEmojis): Prepared {
  const converted = convertEmojis(text.replace(/\r\n?/g, '\n'), guild);
  const content = converted.content.trim();
  return { ...converted, content, length: content.length, ...splitMessage(converted.content) };
}

/** Pourquoi ce texte ne peut pas partir (`null` = il peut). */
export function blocker(p: Prepared): string | null {
  if (p.error) return p.error;
  if (!p.chunks.length) return 'Message vide.';
  const list = (names: string[]): string => names.map((n) => `:${n}:`).join(', ');
  if (p.unknown.length)
    return `Emoji inconnu : ${list(p.unknown)} — ni sur le serveur ni dans la table standard. On ne poste pas un message où il resterait en toutes lettres.`;
  if (p.pending.length)
    return `Emojis du serveur non chargés : ${list(p.pending)} — impossible de les convertir.`;
  return null;
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

/** Les sept lignes du résumé de patch de Sevih, avec le lien de la note choisie. */
export function patchTemplate(noteUrl: string): string {
  return [
    '# :scroll: PATCH NOTES — TL;DR',
    `-# [Full Patch Note](${noteUrl})`,
    '## :star: Banners & Dungeons',
    '## :crossed_swords: Content',
    '## :scales: Adjustments',
    '## :moneybag: Shop',
    '## :bug: Bug Fixes',
  ].join('\n');
}

// --------------------------------------------------------------- requêtes ----

/** Ce qu'on utilise de `fetch` — assez étroit pour qu'un test le simule sans transtypage. */
export type FetchLike = (
  url: string,
  init: { method: string; headers: Record<string, string>; body?: string },
) => Promise<{ status: number; ok: boolean; json(): Promise<unknown> }>;

export interface DiscordDeps {
  token: string | undefined;
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

/** Au-delà, on n'attend pas : c'est un blocage, pas un simple ralentissement. */
const MAX_RETRY_AFTER_S = 30;

type Called<T> = { ok: true; data: T } | { ok: false; error: string };

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
): Promise<Called<T>> {
  if (!deps.token) return { ok: false, error: TOKEN_HINT };
  const { url, init } = buildRequest(deps.token, method, path, body);
  const fail = (error: string): Called<T> => ({ ok: false, error: scrub(error, deps.token) });

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
      res.status === 401 ? 'jeton refusé' : info.code !== undefined ? ERROR_HINTS[info.code] : '';
    return fail(
      `Discord a répondu ${res.status}${info.message ? ` : ${info.message}` : ''}${info.code ? ` (code ${info.code})` : ''}${hint ? ` — ${hint}` : ''}${res.status === 429 ? ` — limite de débit, réessaie dans ${Math.ceil(Number(info.retry_after ?? 0))} s` : ''}`,
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

export interface Guild {
  emojis: Map<string, GuildEmoji>;
  channels: Channel[];
}

interface RawChannel {
  id: string;
  type: number;
  name?: string;
  position?: number;
  parent_id?: string | null;
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

/** Emojis et salons du serveur — deux lectures, rien d'écrit. */
export async function loadGuild(deps: DiscordDeps): Promise<Called<Guild>> {
  if (!deps.token) return { ok: false, error: TOKEN_HINT };
  if (!deps.guildId) return { ok: false, error: GUILD_HINT };
  if (!SNOWFLAKE.test(deps.guildId))
    return { ok: false, error: 'DISCORD_GUILD_ID n’est pas un identifiant de serveur.' };

  const emojis = await call<RawEmoji[]>(deps, 'GET', `/guilds/${deps.guildId}/emojis`);
  if (!emojis.ok) return emojis;
  const channels = await call<RawChannel[]>(deps, 'GET', `/guilds/${deps.guildId}/channels`);
  if (!channels.ok) return channels;

  return {
    ok: true,
    data: {
      emojis: new Map(
        emojis.data
          .filter((e) => e.id && e.name && e.available !== false)
          .map((e) => [e.name!, { id: e.id!, name: e.name!, animated: Boolean(e.animated) }]),
      ),
      channels: sortChannels(channels.data),
    },
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

const messageUrl = (deps: DiscordDeps, channelId: string, id: string): string =>
  `https://discord.com/channels/${deps.guildId}/${channelId}/${id}`;

/**
 * Poste les morceaux DANS L'ORDRE, espacés d'une seconde. Au premier échec on
 * S'ARRÊTE : poster la suite laisserait un trou au milieu du résumé. `ids`
 * revient avec ce qui est parti ; le repasser dans `already` REPREND au morceau
 * fautif sans rien reposter.
 */
export async function sendMessages(
  deps: DiscordDeps,
  input: { channelId: string; chunks: string[]; suppressEmbeds: boolean; already?: string[] },
  report?: Report,
): Promise<SendOutcome> {
  const { channelId, chunks, suppressEmbeds } = input;
  const ids = [...(input.already ?? [])];
  const urls = (): string[] => ids.map((id) => messageUrl(deps, channelId, id));
  const refuse = (line: string): SendOutcome => ({ ok: false, log: [line], ids, urls: urls() });

  if (!deps.token) return refuse(TOKEN_HINT);
  if (!SNOWFLAKE.test(channelId) || !ids.every((id) => SNOWFLAKE.test(id)))
    return refuse('Identifiant de salon ou de message invalide.');
  if (ids.length >= chunks.length) return refuse('Tous les morceaux sont déjà postés.');

  const j = journal(report, deps.token);
  const n = chunks.length;
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
      messageBody(chunks[i], suppressEmbeds),
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
    j.done(`message ${i + 1}/${n} posté : ${messageUrl(deps, channelId, res.data.id)}`);
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
  input: { channelId: string; ids: string[]; chunks: string[]; suppressEmbeds: boolean },
  report?: Report,
): Promise<SendOutcome> {
  const { channelId, ids, chunks, suppressEmbeds } = input;
  const urls = ids.map((id) => messageUrl(deps, channelId, id));
  const refuse = (line: string): SendOutcome => ({ ok: false, log: [line], ids, urls });

  if (!deps.token) return refuse(TOKEN_HINT);
  if (!SNOWFLAKE.test(channelId) || !ids.length || !ids.every((id) => SNOWFLAKE.test(id)))
    return refuse('Identifiant de salon ou de message invalide.');
  if (ids.length !== chunks.length)
    return refuse(
      `Modification refusée : ${ids.length} message${ids.length > 1 ? 's sont postés' : ' est posté'}, le texte en fait maintenant ${chunks.length}. Rien n’est supprimé ni reposté automatiquement — ramène le texte à ${ids.length} message${ids.length > 1 ? 's' : ''}, ou supprime dans Discord puis « Nouveau message ».`,
    );

  const j = journal(report, deps.token);
  const n = chunks.length;
  for (let i = 0; i < n; i++) {
    if (i) await deps.sleep(SPACING_MS);
    j.doing(`modification du message ${i + 1}/${n}`);
    const res = await call<{ id: string }>(
      deps,
      'PATCH',
      `/channels/${channelId}/messages/${ids[i]}`,
      messageBody(chunks[i], suppressEmbeds, true),
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

// ---------------------------------------------------------------- session ----

export interface DiscordState {
  hasToken: boolean;
  /** Ce qui manque pour envoyer, dit tel quel à l'écran (`null` = rien). */
  hint: string | null;
  /** Salons où poster ; `null` tant que le serveur n'est pas lu. */
  channels: Channel[] | null;
  emojiCount: number;
}

export interface Preview {
  html: string;
  /** Nombre de messages, et longueur réelle (emojis convertis). */
  messages: number;
  length: number;
  unknown: string[];
  pending: string[];
  /** Pourquoi ce texte ne peut pas partir (`null` = il peut). */
  blocker: string | null;
}

export interface SendRequest {
  text: string;
  channelId: string;
  suppressEmbeds: boolean;
  /** Reprise d'un envoi interrompu : ids déjà postés, et le nombre de morceaux d'alors. */
  already?: string[];
  total?: number;
}

export interface EditRequest {
  text: string;
  channelId: string;
  suppressEmbeds: boolean;
  ids: string[];
}

/**
 * L'onglet vu du serveur : la liste du serveur Discord lue UNE fois (emojis et
 * salons ne changent pas pendant qu'on rédige), et les quatre réponses des
 * routes. Un chargement raté n'est pas retenu — la prochaine lecture d'état
 * réessaie.
 *
 * Sans jeton, RIEN ne part sur le réseau : l'état le dit, le preview rend quand
 * même (emojis standard convertis, ceux du serveur marqués « inconnu sans
 * jeton »), l'envoi est refusé.
 */
export function discordSession(deps: DiscordDeps) {
  let guild: Guild | null = null;

  async function ensureGuild(): Promise<string | null> {
    if (guild) return null;
    const res = await loadGuild(deps);
    if (!res.ok) return res.error;
    guild = res.data;
    return null;
  }

  function ready(text: string, channelId: string): { chunks: string[] } | { refusal: string } {
    if (!deps.token) return { refusal: TOKEN_HINT };
    if (!guild) return { refusal: 'Serveur Discord non chargé : recharge la page.' };
    if (!guild.channels.some((c) => c.id === channelId))
      return { refusal: 'Choisis un salon de la liste.' };
    const prepared = prepare(text, guild.emojis);
    const refusal = blocker(prepared);
    return refusal ? { refusal } : { chunks: prepared.chunks };
  }

  const refused = (line: string, ids: string[] = []): SendOutcome => ({
    ok: false,
    log: [scrub(line, deps.token)],
    ids,
    urls: [],
  });

  return {
    async state(): Promise<DiscordState> {
      const hint = await ensureGuild();
      return {
        hasToken: Boolean(deps.token),
        hint,
        channels: guild?.channels ?? null,
        emojiCount: guild?.emojis.size ?? 0,
      };
    },

    preview(text: string): Preview {
      const p = prepare(text, guild?.emojis ?? null);
      return {
        html: previewHtml(p),
        messages: p.chunks.length,
        length: p.length,
        unknown: p.unknown,
        pending: p.pending,
        blocker: blocker(p),
      };
    },

    async send(req: SendRequest, report?: Report): Promise<SendOutcome & { total: number }> {
      const already = req.already ?? [];
      const r = ready(req.text, req.channelId);
      if ('refusal' in r) return { ...refused(r.refusal, already), total: req.total ?? 0 };
      const total = r.chunks.length;
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
        {
          channelId: req.channelId,
          chunks: r.chunks,
          suppressEmbeds: req.suppressEmbeds,
          already,
        },
        report,
      );
      return { ...out, total };
    },

    async edit(req: EditRequest, report?: Report): Promise<SendOutcome> {
      const r = ready(req.text, req.channelId);
      if ('refusal' in r) return refused(r.refusal, req.ids);
      return editMessages(
        deps,
        {
          channelId: req.channelId,
          ids: req.ids,
          chunks: r.chunks,
          suppressEmbeds: req.suppressEmbeds,
        },
        report,
      );
    },
  };
}
