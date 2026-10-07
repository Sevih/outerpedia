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
 * À côté de l'envoi, deux aides à la rédaction du résumé de patch, qui ne font
 * que LIRE : `importHistory` relit les résumés déjà postés et les apparie à leur
 * note officielle, `draftRequest` en fait la demande à coller dans claude.ai
 * pour un premier jet (aucun appel à un modèle d'ici).
 *
 * Ce geste ne committe et ne pousse RIEN, contrairement aux quatre autres.
 */
import shortcodes from './discord-shortcodes.json';
import type { Outcome, Report } from './actions';
import { restoreAnsi } from './discord-editor.mjs';

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
 * Quatre formes, dans l'ordre : une URL (laissée intacte — `:a:` dans un chemin
 * n'est pas un emoji), un emoji de serveur DÉJÀ écrit en `<:nom:id>`, un
 * horodatage `<t:instant:format>` (son `:100:` n'est pas le code de 💯), un code
 * `:nom:` à résoudre.
 */
const SHORTCODE =
  /https?:\/\/[^\s)>]+|<a?:\w{2,32}:\d{17,20}>|<t:-?\d+(?::[A-Za-z])?>|:([A-Za-z0-9_+-]{1,32}):/g;

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

// `restoreAnsi` vit dans `discord-editor.mjs` : la page s'en sert aussi (« copier le message »).
export { restoreAnsi };

/** Le texte de l'éditeur → ce qui part : couleurs rétablies, emojis convertis PUIS découpage. */
export function prepare(text: string, guild: GuildEmojis, partial = false): Prepared {
  const converted = convertEmojis(restoreAnsi(text.replace(/\r\n?/g, '\n')), guild, partial);
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

/**
 * L'horloge d'un rendu : les horodatages `<t:…>` s'affichent dans UN fuseau et
 * UNE langue, et le style relatif se compte depuis UN instant. Tout est donné,
 * rien n'est lu de la machine ici : le rendu reste pur.
 */
export interface Clock {
  /** « Maintenant », en millisecondes. */
  now: number;
  /** Fuseau IANA ; absent : celui du poste. */
  timeZone?: string;
  /** Langue (`fr`, `en-GB`…) ; absente : celle du poste. */
  locale?: string;
}

/** Ce que le rendu reçoit en plus du texte : les noms à signaler (cf. `Converted`), et l'horloge. */
export interface Marks {
  unknown?: readonly string[];
  pending?: readonly string[];
  /** Absente : l'heure, le fuseau et la langue du poste. */
  clock?: Clock;
}

/** Les styles de Discord, en options d'`Intl.DateTimeFormat` ; `R` est à part. */
const TIMESTAMP_FORMATS: Record<string, Intl.DateTimeFormatOptions> = {
  t: { timeStyle: 'short' },
  T: { timeStyle: 'medium' },
  d: { dateStyle: 'short' },
  D: { dateStyle: 'long' },
  f: { dateStyle: 'long', timeStyle: 'short' },
  F: { dateStyle: 'full', timeStyle: 'short' },
};

/** Unités du style relatif, de la plus grande à la plus petite, en secondes. */
const RELATIVE_UNITS: readonly (readonly [Intl.RelativeTimeFormatUnit, number])[] = [
  ['year', 365 * 86400],
  ['month', 30 * 86400],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
  ['second', 1],
];

/** Un horodatage Discord dans un texte qui part : `<t:instant>` ou `<t:instant:format>`. */
const TIMESTAMP = /<t:-?\d+(?::[A-Za-z])?>/;

/**
 * Le texte d'un horodatage `<t:unix:style>` tel que Discord l'affiche — à ceci
 * près que Discord prend le fuseau et la langue de chaque LECTEUR, et nous ceux
 * de l'horloge donnée. `null` : Discord le laisserait en toutes lettres (style
 * inconnu, instant hors du calendrier).
 *
 * `R` prend la plus grande unité entamée (« il y a 3 jours », « dans 2 heures ») ;
 * Discord arrondit un peu autrement près des bornes (45 jours y font « un
 * mois »), l'aperçu n'a pas à le suivre à l'unité près.
 */
export function formatTimestamp(unix: number, style: string, clock: Clock): string | null {
  const ms = unix * 1000;
  // Au-delà, `Date` n'a plus d'instant à donner.
  if (!Number.isFinite(ms) || Math.abs(ms) > 8.64e15) return null;
  if (style === 'R') {
    const seconds = Math.round((ms - clock.now) / 1000);
    const [unit, size] =
      RELATIVE_UNITS.find(([, s]) => Math.abs(seconds) >= s) ??
      RELATIVE_UNITS[RELATIVE_UNITS.length - 1];
    return new Intl.RelativeTimeFormat(clock.locale, { numeric: 'always' }).format(
      Math.round(seconds / size),
      unit,
    );
  }
  if (!Object.hasOwn(TIMESTAMP_FORMATS, style)) return null;
  return new Intl.DateTimeFormat(clock.locale, {
    ...TIMESTAMP_FORMATS[style],
    timeZone: clock.timeZone,
  }).format(ms);
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
 *
 * `timestamps` à `false` : là où Discord ne rend PAS les horodatages (le titre
 * d'un embed), ils restent en toutes lettres.
 */
function inline(raw: string, marks: Marks, timestamps = true): string {
  const clock = marks.clock ?? { now: Date.now() };
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
    // Horodatage : la pastille de Discord, l'instant UTC au survol. Un style
    // inconnu reste en texte, comme chez lui.
    .replace(
      /&lt;t:(-?\d+)(?::([A-Za-z]))?&gt;/g,
      (whole, unix: string, style: string | undefined) => {
        const shown = timestamps ? formatTimestamp(Number(unix), style ?? 'f', clock) : null;
        return shown === null
          ? whole
          : hold(
              `<span class="ts" title="${new Date(Number(unix) * 1000).toISOString()}">${escapeHtml(shown)}</span>`,
            );
      },
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

/** Les huit couleurs de texte d'un bloc `ansi`, telles que Discord les peint. */
const ANSI_COLORS: Record<number, string> = {
  30: '#4f545c',
  31: '#dc322f',
  32: '#859900',
  33: '#b58900',
  34: '#268bd2',
  35: '#d33682',
  36: '#2aa198',
  37: '#ffffff',
};

/**
 * Un bloc `ansi` comme Discord l'affiche : gras (1), souligné (4), couleur de
 * texte (30 à 37), remise à zéro (0). Les couleurs de fond (40 à 47) ne sont
 * pas peintes dans l'aperçu ; toute séquence est retirée du texte affiché.
 */
function ansiHtml(body: string): string {
  let html = '';
  let bold = false;
  let underline = false;
  let color = '';
  for (const part of body.split(/(\u001b\[[\d;]*m)/)) {
    const seq = /^\u001b\[([\d;]*)m$/.exec(part);
    if (seq) {
      for (const n of (seq[1] || '0').split(';').map(Number)) {
        if (n === 0) {
          bold = underline = false;
          color = '';
        } else if (n === 1) bold = true;
        else if (n === 4) underline = true;
        else if (ANSI_COLORS[n]) color = ANSI_COLORS[n];
      }
      continue;
    }
    if (!part) continue;
    const style =
      (color ? `color:${color};` : '') +
      (bold ? 'font-weight:700;' : '') +
      (underline ? 'text-decoration:underline;' : '');
    html += style ? `<span style="${style}">${escapeHtml(part)}</span>` : escapeHtml(part);
  }
  return html;
}

/**
 * Rend un message comme Discord l'affichera — HTML sûr, à poser dans un
 * conteneur `.dc` (les styles sont dans `ui/quick.css`). Reçoit le texte DÉJÀ
 * converti (`prepare`) : un `<:nom:id>` devient l'image de l'emoji.
 *
 * Couvert : titres `#` `##` `###`, sous-texte `-# `, citations `> ` et `>>> `,
 * listes `- ` / `* ` imbriquées, gras, italique, souligné, barré, spoiler, code
 * en ligne et en bloc (couleurs d'un bloc `ansi` comprises), liens masqués, URL nues, sauts de ligne tels quels,
 * horodatages `<t:…>` (hors du code, comme les emojis ; cf. `formatTimestamp`).
 * Pas couvert (rendu en texte) : listes numérotées, mise en forme à cheval sur
 * plusieurs lignes.
 */
export function renderDiscord(content: string, marks: Marks = {}): string {
  const code: string[] = [];
  const text = content
    .replace(PRIVATE, '')
    .replace(/```(?:([A-Za-z0-9_+-]*)\n)?([\s\S]*?)```/g, (_, lang: string, body: string) => {
      const inner = body.replace(/\n$/, '');
      code.push(lang === 'ansi' ? ansiHtml(inner) : escapeHtml(inner));
      return `${BLOCK}${code.length - 1}${BLOCKED}`;
    });
  return blocks(text.split('\n'), marks, code, false);
}

/** Le preview complet : un cadre par message, avec sa coupure et sa longueur. */
export function previewHtml(p: Prepared, clock?: Clock): string {
  const n = p.chunks.length;
  const marks: Marks = { unknown: p.unknown, pending: p.pending, clock };
  return p.chunks
    .map(
      (chunk, i) =>
        `<div class="dc-cut">message ${i + 1}/${n} · ${chunk.length} caractères</div>` +
        `<div class="dc">${renderDiscord(chunk, marks)}</div>`,
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
  /** À signaler sans bloquer : ce qui partira, mais ne s'affichera pas comme on le croit. */
  warnings: string[];
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
 *
 * Horodatages : Discord les rend dans la description et le texte du dessus, pas
 * dans le titre, le pied ni un libellé de bouton — un `<t:…>` posé là part tel
 * quel et s'affiche en toutes lettres : `warnings` le dit, sans bloquer.
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
  const warnings: string[] = [];
  /** Champ où Discord ne rend pas les horodatages. */
  const unstamped = (s: string, where: string): string => {
    if (TIMESTAMP.test(s))
      warnings.push(
        `${where} : Discord n’y rend pas les horodatages — ce <t:…> s’y afficherait en toutes lettres. Il n’est rendu que dans la description et le texte du dessus.`,
      );
    return s;
  };
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

  const description = convertEmojis(restoreAnsi(lf(text)), guild, partial);
  note(description);
  const split = splitMessage(description.content, EMBED_DESCRIPTION_LIMIT);

  // Un titre tient sur une ligne.
  const title = unstamped(
    within(rich(form.title).replace(/\s*\n\s*/g, ' '), EMBED_TITLE_LIMIT, 'Titre'),
    'Titre',
  );
  let url = link(form.url, 'Lien du titre');
  if (url && !form.title.trim()) {
    invalid.push('Lien du titre : il lui faut un titre.');
    url = '';
  }
  const thumbnail = link(form.thumbnail, 'Vignette');
  const image = link(form.image, 'Image');
  const footer = unstamped(within(plain(form.footer, 'Pied'), EMBED_FOOTER_LIMIT, 'Pied'), 'Pied');
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
    if (label && href) buttons.push({ label: unstamped(label, `${b.where}, libellé`), url: href });
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
    warnings,
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

  // Ni le titre, ni le pied, ni un libellé de bouton ne rendent un horodatage.
  const heading = inline(m.title, marks, false);
  const title = m.title
    ? `<div class="dc-embed-title">${m.url ? anchor(m.url, '', heading) : heading}</div>`
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
export function embedPreviewHtml(p: PreparedEmbed, clock?: Clock): string {
  const n = p.messages.length;
  const marks: Marks = { unknown: p.unknown, pending: p.pending, clock };
  return p.messages
    .map(
      (m, i) =>
        `<div class="dc-cut">message ${i + 1}/${n} · embed · description ${m.description.length} caractères · textes ${embedTotal(m)}</div>` +
        `<div class="dc">${renderEmbed(m, marks)}</div>`,
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
  /** L'horloge du rendu et de l'import ; absente : celle du poste (les tests la fixent). */
  clock?: () => Clock;
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

// ------------------------------------------------------------ historique -----

/** Messages demandés par page : le plafond de Discord. */
const HISTORY_PAGE = 100;
/** Plafond d'UN import : dix pages, les plus récentes. */
export const HISTORY_MAX_MESSAGES = 1000;
/** La suite d'un résumé : les messages du même auteur dans ce délai. */
const CONTINUATION_MS = 5 * 60 * 1000;
/** Sans lien, la note d'un résumé est la plus proche publiée dans ces jours-là. */
const PAIR_DAYS = 4;
const DAY_MS = 86_400_000;

/** Ce qu'on lit d'un message rendu par Discord. */
export interface RawMessage {
  id: string;
  /** 0 : message ordinaire, 19 : réponse ; le reste est du système (arrivée, épingle…). */
  type?: number;
  content?: string;
  /** Instant d'envoi, en ISO. */
  timestamp?: string;
  author?: { id?: string; username?: string; global_name?: string | null; bot?: boolean };
  embeds?: { title?: string; description?: string; url?: string }[];
  attachments?: unknown[];
  sticker_items?: unknown[];
  components?: { components?: { url?: string }[] }[];
}

/** La note officielle d'un résumé. */
export interface SummaryNote {
  id: string;
  date: string;
  title: string;
  url: string;
}

/** Un résumé déjà posté, recollé s'il était découpé, et sa note. */
export interface PastSummary {
  /** Les messages qui le portent, dans l'ordre. */
  ids: string[];
  /** Instant du premier, en ISO. */
  date: string;
  author: string;
  text: string;
  note: SummaryNote | null;
}

/** `.quick/discord-history.json` : les paires (note officielle → résumé de Sevih). */
export interface HistoryFile {
  importedAt: string;
  /** Le serveur et le salon du DERNIER import. */
  guildId: string;
  channelId: string;
  /** Du plus récent au plus ancien. */
  summaries: PastSummary[];
}

/** Un résumé repéré dans un salon, avant appariement : `links` porte ses adresses. */
export interface FoundSummary extends Omit<PastSummary, 'note'> {
  links: string[];
}

const TLDR = /tl;dr/i;

/** Ordre des identifiants de Discord : ils grandissent avec le temps. */
const bySnowflake = (a: string, b: string): number =>
  BigInt(a) < BigInt(b) ? -1 : BigInt(a) > BigInt(b) ? 1 : 0;

/** L'instant d'un message : celui que Discord donne, sinon celui que son id encode. */
function sentAt(m: RawMessage): number {
  const given = Date.parse(m.timestamp ?? '');
  return Number.isNaN(given) ? Number((BigInt(m.id) >> 22n) + 1_420_070_400_000n) : given;
}

/** Le texte d'un message : son contenu, sinon celui de ses embeds — titre puis description. */
function messageText(m: RawMessage): string {
  const content = (m.content ?? '').trim();
  if (content) return content;
  return (m.embeds ?? [])
    .flatMap((e) => [e.title ?? '', e.description ?? ''])
    .map((s) => s.trim())
    .filter(Boolean)
    .join('\n');
}

/**
 * Ce message OUVRE-t-il un résumé ? Sa première ligne contient `TL;DR` — ou,
 * s'il n'a pas de contenu (le bot en mode embed), le titre ou la description
 * d'un de ses embeds.
 */
function opensSummary(m: RawMessage): boolean {
  const content = (m.content ?? '').trim();
  if (content) return TLDR.test(content.split('\n', 1)[0]);
  return (m.embeds ?? []).some((e) => TLDR.test(e.title ?? '') || TLDR.test(e.description ?? ''));
}

/** Les adresses d'un message : celles de son texte, le lien de ses embeds, ses boutons de lien. */
function messageLinks(m: RawMessage, text: string): string[] {
  return [
    ...(text.match(/https?:\/\/[^\s<>()[\]]+/g) ?? []),
    ...(m.embeds ?? []).map((e) => e.url ?? ''),
    ...(m.components ?? []).flatMap((row) => (row.components ?? []).map((c) => c.url ?? '')),
  ].filter(Boolean);
}

/**
 * Les résumés d'une suite de messages (dans n'importe quel ordre), du plus
 * récent au plus ancien.
 *
 * Un résumé s'OUVRE par un message dont la première ligne contient `TL;DR`,
 * quel que soit son auteur (Sevih en son nom, ou le bot). Sa SUITE — le
 * découpage à 2 000 caractères — est faite des messages qui le suivent sans
 * interruption : même auteur, dans les cinq minutes de l'ouverture, et qui
 * n'ouvrent pas eux-mêmes un résumé. Le tout est recollé par un saut de ligne.
 */
export function groupSummaries(messages: readonly RawMessage[]): FoundSummary[] {
  const ordered = [...messages].sort((a, b) => bySnowflake(a.id, b.id));
  const found: FoundSummary[] = [];
  for (let i = 0; i < ordered.length; i++) {
    const first = ordered[i];
    if (!opensSummary(first)) continue;
    const opened = sentAt(first);
    const texts = [messageText(first)];
    const ids = [first.id];
    const links = messageLinks(first, texts[0]);
    for (let next = ordered[i + 1]; next; next = ordered[i + 1]) {
      const same = Boolean(first.author?.id) && next.author?.id === first.author?.id;
      if (!same || sentAt(next) - opened > CONTINUATION_MS || opensSummary(next)) break;
      i++;
      const text = messageText(next);
      links.push(...messageLinks(next, text));
      if (!text) continue;
      texts.push(text);
      ids.push(next.id);
    }
    found.push({
      ids,
      date: new Date(opened).toISOString(),
      author: first.author?.global_name || first.author?.username || first.author?.id || '',
      text: texts.join('\n'),
      links,
    });
  }
  return found.reverse();
}

/**
 * Ce qui identifie une note dans son adresse : le CHEMIN, sans barre finale.
 * L'hôte ne compte pas — l'éditeur a changé de domaine (`vagames.co.kr` puis
 * `major7.kr`) et les anciens résumés pointent sur l'ancien : comparés par
 * l'adresse entière, ils retombaient sur la date, donc sur l'avis de
 * maintenance du même jour.
 */
const bareUrl = (url: string): string => {
  try {
    return new URL(url).pathname.replace(/\/+$/, '');
  } catch {
    return url.replace(/\/+$/, '');
  }
};

/**
 * La note officielle d'un résumé. D'abord par le LIEN : le gabarit de Sevih
 * porte l'adresse de la note (`officialUrl`), en sous-texte ou en bouton — on
 * en compare le chemin, quel que soit le domaine (cf. `bareUrl`). Sinon
 * la note en anglais la plus proche publiée dans les quatre jours qui précèdent
 * le résumé — à date égale la note de patch passe devant, puis la plus récente.
 * `null` sinon : tout résumé n'est pas tiré d'une note.
 *
 * Rend la fonction d'appariement : la table des adresses n'est bâtie qu'une fois.
 */
export function notePairer(
  posts: readonly NotePost[],
): (summary: Pick<FoundSummary, 'links' | 'date'>) => SummaryNote | null {
  const en = posts.filter((p) => p.lang === 'en');
  const byUrl = new Map(en.map((p) => [bareUrl(officialUrl(p)), p]));
  const ref = (p: NotePost): SummaryNote => ({
    id: String(p.id),
    date: p.date,
    title: p.title,
    url: officialUrl(p),
  });
  return (summary) => {
    for (const link of summary.links) {
      const linked = byUrl.get(bareUrl(link));
      if (linked) return ref(linked);
    }
    // Les notes sont datées au jour : on compare des jours (UTC), pas des instants.
    const day = Date.parse(summary.date.slice(0, 10));
    const near = en
      .map((p) => ({ p, age: (day - Date.parse(p.date)) / DAY_MS }))
      .filter(({ age }) => age >= 0 && age <= PAIR_DAYS)
      .sort(
        (a, b) =>
          a.age - b.age ||
          Number(b.p.type === 'update') - Number(a.p.type === 'update') ||
          Number(b.p.id) - Number(a.p.id),
      );
    return near.length ? ref(near[0].p) : null;
  };
}

/** Les mêmes codes d'erreur quand on lit l'HISTORIQUE d'un salon : les droits qu'il faut. */
const HISTORY_RIGHTS =
  'il manque au bot, dans ce salon, « Voir le salon » ou « Voir les anciens messages »';
const HISTORY_HINTS: Record<number, string> = {
  10003: 'salon inconnu',
  50001: HISTORY_RIGHTS,
  50013: HISTORY_RIGHTS,
};

const INTENT_HELP =
  'Discord ne donne le contenu des messages des AUTRES qu’aux bots qui ont l’intent « Message Content » : sans lui il rend un contenu vide, sans erreur. À activer dans le portail développeur Discord (discord.com/developers) : l’application → Bot → Privileged Gateway Intents → « Message Content Intent », enregistrer, puis relancer l’import.';

/** Un message ordinaire d'un membre revenu VIDE : ni contenu, ni embed, ni pièce jointe. */
const isMemberMessage = (m: RawMessage): boolean =>
  !m.author?.bot && (m.type === undefined || m.type === 0 || m.type === 19);
const isEmpty = (m: RawMessage): boolean =>
  !(m.content ?? '').trim() &&
  !m.embeds?.length &&
  !m.attachments?.length &&
  !m.sticker_items?.length;

/** Résultat d'un import : l'historique du salon lu, ou `null` si rien n'est à écrire. */
export interface HistoryOutcome extends Outcome {
  history: HistoryFile | null;
}

/**
 * Lit l'historique d'un salon — les `HISTORY_MAX_MESSAGES` messages les plus
 * récents, par pages de cent, espacées comme les messages d'un envoi — et en
 * tire les résumés, appariés à leur note. Ne lit QUE : rien n'est posté, rien
 * n'est écrit (le disque est l'affaire de `server.ts`).
 *
 * Deux silences de Discord à ne pas prendre pour « aucun résumé » : sans
 * l'intent « Message Content », le contenu des messages des autres revient
 * VIDE (l'import s'arrête dès que c'est le cas de plus de la moitié de ceux
 * des membres) ; sans « Voir les anciens messages », la liste revient vide.
 */
export async function importHistory(
  deps: DiscordDeps,
  input: { guildId: string; channelId: string },
  posts: readonly NotePost[],
  report?: Report,
): Promise<HistoryOutcome> {
  const { guildId, channelId } = input;
  const refuse = (line: string): HistoryOutcome => ({ ok: false, log: [line], history: null });
  if (!deps.token) return refuse(TOKEN_HINT);
  if (!SNOWFLAKE.test(guildId) || !SNOWFLAKE.test(channelId))
    return refuse('Identifiant de serveur ou de salon invalide.');

  const j = journal(report, deps.token);
  const stop = (...lines: string[]): HistoryOutcome => {
    for (const line of lines) j.done(line);
    j.done('Rien n’a été écrit.');
    return { ok: false, log: j.lines, history: null };
  };
  const read: RawMessage[] = [];

  for (let page = 1; read.length < HISTORY_MAX_MESSAGES; page++) {
    if (page > 1) await deps.sleep(SPACING_MS);
    j.doing(`lecture de la page ${page}`);
    const limit = Math.min(HISTORY_PAGE, HISTORY_MAX_MESSAGES - read.length);
    const before = read.length ? `&before=${read[read.length - 1].id}` : '';
    const res = await call<RawMessage[]>(
      deps,
      'GET',
      `/channels/${channelId}/messages?limit=${limit}${before}`,
      undefined,
      HISTORY_HINTS,
    );
    if (!res.ok) return stop(`ÉCHEC à la page ${page} — ${res.error}`);
    const got = (Array.isArray(res.data) ? res.data : []).filter((m) =>
      SNOWFLAKE.test(String(m?.id)),
    );
    // Discord rend du plus récent au plus ancien : le dernier lu borne la page suivante.
    read.push(...got.sort((a, b) => bySnowflake(b.id, a.id)));
    j.done(
      `page ${page} : ${got.length} message${got.length > 1 ? 's' : ''} (${read.length} en tout), ${read.filter(opensSummary).length} résumé(s) repéré(s)`,
    );

    const members = read.filter(isMemberMessage);
    const empty = members.filter(isEmpty).length;
    if (empty * 2 > members.length)
      return stop(
        `Import arrêté : ${empty} des ${members.length} messages de membres lus reviennent VIDES (ni contenu, ni embed, ni pièce jointe).`,
        INTENT_HELP,
      );
    if (got.length < limit) break;
  }

  if (!read.length)
    return stop(
      `Aucun message lu : le salon est vide, ou ${HISTORY_RIGHTS} (sans ce dernier droit, Discord rend une liste vide, sans erreur).`,
    );

  const pair = notePairer(posts);
  const summaries = groupSummaries(read).map(({ links, ...s }): PastSummary => ({
    ...s,
    // Ceinture et bretelles : rien d'un message ne doit porter le jeton jusqu'au disque.
    text: scrub(s.text, deps.token),
    note: pair({ links, date: s.date }),
  }));
  const paired = summaries.filter((s) => s.note).length;
  j.done(
    `${read.length} messages lus${read.length >= HISTORY_MAX_MESSAGES ? ` (le plafond d’un import : les ${HISTORY_MAX_MESSAGES} plus récents)` : ''} : ${summaries.length} résumé${summaries.length > 1 ? 's' : ''}, dont ${paired} apparié${paired > 1 ? 's' : ''} à ${paired > 1 ? 'leur' : 'sa'} note.`,
  );
  return {
    ok: true,
    log: j.lines,
    history: {
      importedAt: new Date(deps.clock?.().now ?? Date.now()).toISOString(),
      guildId,
      channelId,
      summaries,
    },
  };
}

/**
 * L'historique après un import : les résumés lus REMPLACENT ceux du même
 * premier message, tous les autres sont gardés — ceux d'un autre salon, et ceux
 * que le plafond d'un import ne fait plus lire. Du plus récent au plus ancien.
 */
export function mergeHistory(previous: HistoryFile | null, imported: HistoryFile): HistoryFile {
  const fresh = new Set(imported.summaries.map((s) => s.ids[0]));
  const kept = (previous?.summaries ?? []).filter((s) => !fresh.has(s.ids[0]));
  return {
    ...imported,
    summaries: [...imported.summaries, ...kept].sort(
      (a, b) => b.date.localeCompare(a.date) || bySnowflake(b.ids[0], a.ids[0]),
    ),
  };
}

/**
 * `.quick/discord-history.json` tel qu'il est sur le disque → l'historique, ou
 * `null` s'il n'en est pas un. Une entrée illisible tombe, les autres restent.
 */
export function parseHistory(raw: unknown): HistoryFile | null {
  const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  if (!Array.isArray(o.summaries)) return null;
  const text = (v: unknown): string => (typeof v === 'string' ? v : '');
  const summaries = o.summaries.flatMap((entry: unknown): PastSummary[] => {
    const s = (entry && typeof entry === 'object' ? entry : {}) as Record<string, unknown>;
    const ids = (Array.isArray(s.ids) ? s.ids : []).filter(
      (id: unknown): id is string => typeof id === 'string' && SNOWFLAKE.test(id),
    );
    if (!ids.length || !text(s.text) || !text(s.date)) return [];
    const n = (s.note && typeof s.note === 'object' ? s.note : null) as Record<
      string,
      unknown
    > | null;
    return [
      {
        ids,
        date: text(s.date),
        author: text(s.author),
        text: text(s.text),
        note: n?.id
          ? { id: String(n.id), date: text(n.date), title: text(n.title), url: text(n.url) }
          : null,
      },
    ];
  });
  return {
    importedAt: text(o.importedAt),
    guildId: text(o.guildId),
    channelId: text(o.channelId),
    summaries,
  };
}

/** Ce que l'onglet montre de l'historique : les comptes, et une ligne par résumé. */
export interface HistoryState {
  count: number;
  paired: number;
  /** Instant du résumé le plus récent ; `null` sans résumé. */
  last: string | null;
  importedAt: string | null;
  items: { date: string; first: string; note: string | null }[];
}

export function historyState(history: HistoryFile | null): HistoryState {
  const summaries = history?.summaries ?? [];
  return {
    count: summaries.length,
    paired: summaries.filter((s) => s.note).length,
    last: summaries[0]?.date ?? null,
    importedAt: history?.importedAt || null,
    items: summaries.map((s) => ({
      date: s.date,
      first: s.text.split('\n', 1)[0].slice(0, 140),
      note: s.note?.title ?? null,
    })),
  };
}

// ------------------------------------------------- la demande à copier -------

/**
 * Au-delà, la demande ne se colle plus d'une pièce dans claude.ai : les
 * exemples les plus anciens sautent d'abord.
 */
export const REQUEST_BUDGET = 400_000;
/** Exemples joints par défaut, et le plus que le champ de la page accepte. */
export const REQUEST_EXAMPLES = 3;
export const REQUEST_EXAMPLES_MAX = 6;

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, code: string) => {
    if (code[0] !== '#') {
      const name = code.toLowerCase();
      return Object.hasOwn(ENTITIES, name) ? ENTITIES[name] : whole;
    }
    const n = /^#x/i.test(code) ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
    return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : whole;
  });
}

/** Les attributs d'une balise — une valeur entre guillemets peut porter des chevrons. */
const ATTRS = String.raw`(?:"[^"]*"|'[^']*'|[^'">])*`;
/**
 * Dans l'ordre : un commentaire ; un élément dont le contenu n'est pas du texte
 * à lire (script, style, cadre, vidéo), pris d'un bloc jusqu'à sa fermeture ;
 * une balise, ouvrante ou fermante ; du texte ; un chevron perdu.
 */
const HTML_TOKEN = new RegExp(
  String.raw`<!--[\s\S]*?-->` +
    String.raw`|<(script|style|iframe|video)\b${ATTRS}>[\s\S]*?<\/\1>` +
    String.raw`|<(\/?)([A-Za-z][A-Za-z0-9]*)\b${ATTRS}>` +
    String.raw`|[^<]+|<`,
  'gi',
);
/** Ce qui finit la ligne en cours, sans rien de plus. */
const BLOCKS = new Set([
  'p',
  'div',
  'figure',
  'figcaption',
  'blockquote',
  'section',
  'article',
  'ul',
  'ol',
  'thead',
  'tbody',
  'tfoot',
]);

/**
 * Le TEXTE d'une note officielle — son HTML WordPress, tel que `get-news` le
 * range — pour le donner à lire à un modèle : un titre par ligne (`## `), une
 * ligne par paragraphe, les puces en `- ` (retrait de deux espaces par niveau),
 * une ligne par rangée de tableau, ses cellules jointes par ` | ` (ce qui s'y
 * trouvait sur plusieurs lignes par ` / `), le texte barré entre `~~`, les
 * images et les vidéos retirées, les entités décodées, jamais deux lignes vides
 * de suite. Ni DOM ni dépendance : les balises sont lues au fil du texte.
 */
export function noteText(html: string): string {
  const out: string[] = [];
  /** Ligne en cours, et ce qui l'ouvre (`## `, `- `). */
  let text = '';
  let lead = '';
  /** Rangée et cellule de tableau en cours ; `depth` : tableaux ouverts. */
  let row: string[] | null = null;
  let cell: string | null = null;
  let depth = 0;
  const lists: { ordered: boolean; n: number }[] = [];
  let videoLink = false;

  const tidy = (s: string): string => s.replace(/\s+/g, ' ').trim();
  /** Finit la ligne — dans une cellule, tout tient sur UNE ligne : un séparateur à la place. */
  const end = (): void => {
    if (cell !== null) {
      cell += ' / ';
      return;
    }
    const line = tidy(text);
    if (line) {
      out.push(lead + line);
      lead = '';
    }
    text = '';
  };
  const blank = (): void => {
    end();
    if (cell === null && out.length && out[out.length - 1] !== '') out.push('');
  };
  const write = (s: string): void => {
    if (cell !== null) cell += s;
    else text += s;
  };
  const closeCell = (): void => {
    if (cell === null || !row) return;
    row.push(
      tidy(cell)
        .replace(/(?:\/ )+/g, '/ ')
        .replace(/^(?:\/ )+|(?: \/)+$/g, '')
        .trim(),
    );
    cell = null;
  };

  for (const token of html.matchAll(HTML_TOKEN)) {
    const name = token[3]?.toLowerCase();
    if (name === undefined) {
      // Du texte (ou un chevron perdu) ; un commentaire ou un élément sauté tombent.
      const readable = token[0] === '<' || !token[0].startsWith('<');
      if (readable && !videoLink) write(decodeEntities(token[0]));
      continue;
    }
    const closing = token[2] === '/';

    if (name === 'table') {
      // Un tableau DANS une cellule n'ouvre pas de rangées à lui : il s'y aplatit.
      if (closing) depth = Math.max(0, depth - 1);
      else depth++;
      if (depth > (closing ? 0 : 1)) end();
      else blank();
    } else if (depth > 1 && (name === 'tr' || name === 'td' || name === 'th')) {
      end();
    } else if (name === 'tr') {
      closeCell();
      if (closing && row?.some(Boolean)) out.push(row.join(' | '));
      row = closing ? null : [];
    } else if (name === 'td' || name === 'th') {
      closeCell();
      if (!closing && row) cell = '';
    } else if (/^h[1-6]$/.test(name)) {
      if (closing) end();
      else blank();
      lead = closing || cell !== null ? '' : `${'#'.repeat(Number(name[1]))} `;
    } else if (name === 'li') {
      end();
      lead = '';
      if (!closing) {
        const list = lists[lists.length - 1];
        const mark = list?.ordered ? `${++list.n}. ` : '- ';
        if (cell !== null) cell += mark;
        else lead = '  '.repeat(Math.max(0, lists.length - 1)) + mark;
      }
    } else if (name === 'hr') {
      blank();
    } else if (name === 'br') {
      end();
    } else if (name === 's' || name === 'del' || name === 'strike') {
      write('~~');
    } else if (name === 'a') {
      // Le lien que `get-news` pose à la place d'une vidéo : un nom de fichier, rien à lire.
      videoLink = !closing && /\bclass="[^"]*\bpn-video-link\b/.test(token[0]);
    } else if (BLOCKS.has(name)) {
      if (name === 'ul' || name === 'ol') {
        end();
        if (closing) lists.pop();
        else lists.push({ ordered: name === 'ol', n: 0 });
      } else end();
    }
    // Le reste (gras, couleur, lien…) ne porte que du texte : la balise tombe.
  }
  end();
  while (out[out.length - 1] === '') out.pop();
  return out.join('\n');
}

/** Les caractères de la table standard → leur code, le premier nom du fichier gagnant. */
const STANDARD_NAMES = new Map<string, string>();
for (const [name, char] of STANDARD) if (!STANDARD_NAMES.has(char)) STANDARD_NAMES.set(char, name);
/** Les plus longs d'abord : un emoji composé ne doit pas être lu par son premier morceau. */
const STANDARD_CHARS = new RegExp(
  [...STANDARD_NAMES.keys()]
    .sort((a, b) => b.length - a.length)
    .map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|'),
  'g',
);

/**
 * Un résumé posté, tel qu'il S'ÉCRIRAIT dans l'éditeur : les emojis en `:nom:`
 * (ceux d'un serveur comme les standards) et les horodatages en
 * `AAAA-MM-JJ HH:MM UTC`. C'est la forme demandée au modèle : les exemples la
 * lui montrent.
 */
export function summaryDraft(text: string): string {
  return text
    .replace(/<a?:(\w{2,32}):\d{17,20}>/g, ':$1:')
    .replace(/<t:(-?\d+)(?::[A-Za-z])?>/g, (whole, unix: string) => {
      const ms = Number(unix) * 1000;
      return Math.abs(ms) > 8.64e15
        ? whole
        : `${new Date(ms).toISOString().slice(0, 16).replace('T', ' ')} UTC`;
    })
    .replace(STANDARD_CHARS, (char) => `:${STANDARD_NAMES.get(char)}:`);
}

/** Une note telle que la demande la cite. */
export interface RequestNote {
  title: string;
  date: string;
  url: string;
  text: string;
}

/** Un exemple : la note officielle, et le résumé que Sevih en a posté. */
export interface RequestExample {
  note: RequestNote;
  summary: string;
}

export const requestNote = (post: NotePost): RequestNote => ({
  title: post.title,
  date: post.date,
  url: officialUrl(post),
  text: noteText(post.content),
});

/**
 * Les `count` résumés appariés les plus récents, du plus récent au plus ancien,
 * chacun avec le texte de sa note. Est passé : un résumé sans note, un résumé
 * dont la note n'est plus dans `posts`, et celui de la note À RÉSUMER (`skip`)
 * — il serait la réponse, pas un exemple.
 */
export function requestExamples(
  history: HistoryFile | null,
  posts: readonly NotePost[],
  count: number,
  skip?: string,
): RequestExample[] {
  const en = new Map(posts.filter((p) => p.lang === 'en').map((p) => [String(p.id), p]));
  const examples: RequestExample[] = [];
  for (const s of history?.summaries ?? []) {
    if (examples.length >= count) break;
    const post = s.note && s.note.id !== skip ? en.get(s.note.id) : undefined;
    if (post) examples.push({ note: requestNote(post), summary: summaryDraft(s.text) });
  }
  return examples;
}

export interface DraftRequest {
  text: string;
  /** Taille de la demande, en caractères. */
  length: number;
  /** Exemples joints, et ceux que le budget a fait sauter. */
  examples: number;
  dropped: number;
}

/** Dans `discord-prompt.md`, la ligne qui sépare les consignes du rappel final. */
export const FINAL_CHECK_MARK = '=== FINAL CHECK ===';

/**
 * La demande à coller dans claude.ai pour un premier jet — AUCUN appel réseau
 * ici, ni ailleurs : Sevih la colle lui-même, sous son abonnement.
 *
 * Dans l'ordre : les consignes (`discord-prompt.md`), les exemples — du plus
 * ancien au plus récent, chacun « note officielle » puis « résumé posté » —, la
 * note à résumer, le gabarit, puis le RAPPEL FINAL : la partie des consignes
 * qui suit la ligne `FINAL_CHECK_MARK`. Placé en dernier, après 100 000
 * caractères de notes, c'est lui qu'un modèle a sous les yeux en écrivant —
 * les règles du début, seules, cédaient devant les exemples (jets trop longs,
 * correctifs et règles de recrutement gardés malgré la consigne).
 * `examples` arrive du plus récent au plus ancien :
 * au-delà de `budget` caractères, les plus anciens sautent d'abord. La note à
 * résumer ne se raccourcit pas : sans exemple, la demande peut encore dépasser.
 */
export function draftRequest(input: {
  instructions: string;
  examples: readonly RequestExample[];
  note: RequestNote;
  template: string;
  budget?: number;
}): DraftRequest {
  const { examples, note, template, budget = REQUEST_BUDGET } = input;
  const [instructions, closing = ''] = input.instructions.split(FINAL_CHECK_MARK);
  const cited = (tag: string, n: RequestNote): string =>
    `<${tag}>\nTitle: ${n.title}\nDate: ${n.date}\nURL: ${n.url}\n\n${n.text}\n</${tag}>`;
  const build = (kept: readonly RequestExample[]): string =>
    [
      instructions.trim(),
      kept.length
        ? `<examples>\n${[...kept]
            .reverse()
            .map(
              (e) =>
                `<example>\n${cited('official_note', e.note)}\n<posted_summary>\n${e.summary}\n</posted_summary>\n</example>`,
            )
            .join('\n')}\n</examples>`
        : '',
      cited('note_to_summarize', note),
      `<template>\n${template}\n</template>`,
      closing.trim(),
    ]
      .filter(Boolean)
      .join('\n\n');

  let kept = examples.length;
  let text = build(examples);
  while (text.length > budget && kept > 0) text = build(examples.slice(0, --kept));
  return { text, length: text.length, examples: kept, dropped: examples.length - kept };
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
  /** À signaler sans bloquer (un horodatage là où Discord ne le rend pas). */
  warnings: string[];
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

  const clock = (): Clock => deps.clock?.() ?? { now: Date.now() };

  function plan(draft: Draft, suppressEmbeds: boolean): Plan {
    const { table, partial } = tableOf(draft.emojiGuilds);
    if (draft.mode === 'embed') {
      const p = prepareEmbed(draft.text, draft.embed, table, partial);
      return {
        preview: {
          html: embedPreviewHtml(p, clock()),
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
          warnings: p.warnings,
        },
        bodies: (edit) => p.messages.map((m) => embedBody(m, edit)),
      };
    }
    const p = prepare(draft.text, table, partial);
    return {
      preview: {
        html: previewHtml(p, clock()),
        messages: p.chunks.length,
        length: p.length,
        limit: MESSAGE_LIMIT,
        unknown: p.unknown,
        pending: p.pending,
        external: external(p.chunks, draft.guildId),
        blocker: blocker(p),
        warnings: [],
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

    /**
     * Les anciens résumés du salon choisi, appariés à leur note (`importHistory`).
     * Comme pour un envoi : le serveur est un de ceux du bot, et le salon est à
     * ce serveur. Ne fait que LIRE.
     */
    async history(
      req: { guildId: string; channelId: string },
      posts: readonly NotePost[],
      report?: Report,
    ): Promise<HistoryOutcome> {
      const refusal = (line: string): HistoryOutcome => ({
        ok: false,
        log: [scrub(line, deps.token)],
        history: null,
      });
      if (!deps.token) return refusal(TOKEN_HINT);
      const list = await channelsOf(req.guildId);
      if (!list.ok) return refusal(list.error);
      if (!list.data.some((c) => c.id === req.channelId)) return refusal(FOREIGN_CHANNEL);
      return importHistory(deps, req, posts, report);
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
