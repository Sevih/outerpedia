/**
 * quick/discord-editor — les outils d'édition de l'onglet « Discord » : la barre
 * (gras, titres, liste, lien…), la palette d'emojis toujours visible, le
 * sélecteur d'emojis et l'autocomplétion des `:codes:`.
 *
 * UN FICHIER, DEUX LECTEURS : la page le charge tel quel
 * (`import('/discord-editor.mjs')`, servi par `server.ts`) et les tests
 * l'importent. D'où le `.mjs`, du JavaScript nu typé par JSDoc (`checkJs` de
 * `scripts/tsconfig.json`) : l'outil n'a ni build ni transpileur, un `.ts`
 * n'arriverait pas jusqu'au navigateur — et une copie dans `ui.html` ne serait
 * pas testée.
 *
 * Tout est PUR : texte et sélection en entrée, texte et sélection en sortie.
 * Rien ici ne touche au DOM ; c'est la page qui pose le résultat dans la zone
 * de texte, par la voie qui garde l'annulation du navigateur (cf. `diffEdit`).
 */

/**
 * Une zone de texte : son contenu et sa sélection (`start === end` : un curseur).
 * @typedef {{ text: string, start: number, end: number }} Edit
 */

/**
 * Un emoji proposé : d'un serveur (`id`, image du CDN ; `guildId` dit lequel)
 * ou standard (`char`).
 * @typedef {{ name: string, id?: string, animated?: boolean, char?: string, guildId?: string }} Emoji
 */

/**
 * Un serveur coché et ses emojis, tels que `/api/discord/emojis` les rend.
 * @typedef {{ id: string, name: string, emojis: readonly Emoji[] }} EmojiGuild
 */

/**
 * Les deux listes où l'on cherche : `guild`, les emojis des serveurs cochés
 * réunis (`mergeGuildEmojis`), et `standard`.
 * @typedef {{ guild: readonly Emoji[], standard: readonly Emoji[] }} EmojiLists
 */

// ----------------------------------------------------------- en ligne --------

/** Outils en ligne : ce que chacun pose de part et d'autre de la sélection. */
export const INLINE = /** @type {Readonly<Record<string, string>>} */ ({
  bold: '**',
  italic: '*',
  underline: '__',
  strike: '~~',
  code: '`',
  spoiler: '||',
});

/** Longueur de la suite du caractère `ch` qui finit juste avant `at`. */
function runBefore(/** @type {string} */ text, /** @type {number} */ at, /** @type {string} */ ch) {
  let n = 0;
  while (n < at && text[at - n - 1] === ch) n++;
  return n;
}

/** Longueur de la suite du caractère `ch` qui commence en `at`. */
function runAfter(/** @type {string} */ text, /** @type {number} */ at, /** @type {string} */ ch) {
  let n = 0;
  while (text[at + n] === ch) n++;
  return n;
}

/**
 * Une suite de `n` caractères porte-t-elle ce marqueur ? Le gras et l'italique
 * partagent l'étoile : deux étoiles sont un gras SANS italique, trois les deux.
 */
const carries = (/** @type {string} */ marker, /** @type {number} */ n) =>
  marker === '*' ? n % 2 === 1 : n >= marker.length;

/** Ce qui ouvre une ligne sans faire partie de son texte (citation, puce, titre, sous-texte). */
const LINE_HEAD = /^(?:> )?(?:\s*[-*] +|#{1,3} +|-# +)?/;

/**
 * Les morceaux à mettre en forme : un par ligne touchée, sans ses blancs de
 * bord (`*mot *` n'est pas un italique pour Discord) ni son marqueur de ligne
 * (`**- puce**` ne serait plus une puce). Une mise en forme ne passe pas le
 * saut de ligne — ni dans l'aperçu, ni ici.
 * @returns {{ a: number, b: number }[]}
 */
function segments(
  /** @type {string} */ text,
  /** @type {number} */ start,
  /** @type {number} */ end,
) {
  const out = [];
  let lineStart = text.lastIndexOf('\n', start - 1) + 1;
  while (lineStart <= end) {
    let lineEnd = text.indexOf('\n', lineStart);
    if (lineEnd < 0) lineEnd = text.length;
    const head = /** @type {RegExpExecArray} */ (LINE_HEAD.exec(text.slice(lineStart, lineEnd)))[0];
    let a = Math.max(start, lineStart + head.length);
    let b = Math.min(end, lineEnd);
    while (a < b && /\s/.test(text[a])) a++;
    while (b > a && /\s/.test(text[b - 1])) b--;
    if (a < b) out.push({ a, b });
    lineStart = lineEnd + 1;
  }
  return out;
}

/**
 * Pose ou retire un marqueur en ligne (`**`, `*`, `__`, `~~`, `` ` ``, `||`).
 *
 * Sans sélection : le marqueur vide, curseur dedans (un second clic le retire).
 * Avec : la sélection est entourée, et reste sélectionnée ; si elle porte DÉJÀ
 * le marqueur — autour d'elle ou dans ses bords — il est retiré. Sur plusieurs
 * lignes, chaque ligne est traitée pour elle-même, et le marqueur n'est retiré
 * que si toutes le portent.
 * @param {Edit} edit
 * @param {string} marker
 * @returns {Edit}
 */
export function toggleInline(edit, marker) {
  const { text, start, end } = edit;
  const ch = marker[0];
  const len = marker.length;

  if (start === end) {
    const around = Math.min(runBefore(text, start, ch), runAfter(text, start, ch));
    if (carries(marker, around))
      return {
        text: text.slice(0, start - len) + text.slice(start + len),
        start: start - len,
        end: start - len,
      };
    return {
      text: text.slice(0, start) + marker + marker + text.slice(start),
      start: start + len,
      end: start + len,
    };
  }

  const segs = segments(text, start, end).map(({ a, b }) => {
    const outside = Math.min(runBefore(text, a, ch), runAfter(text, b, ch));
    // Marqueurs pris DANS la sélection : les deux suites ne doivent pas se
    // chevaucher (`****` sélectionné seul n'est pas un gras vide à vider).
    const head = runAfter(text, a, ch);
    const tail = runBefore(text, b, ch);
    const inside = head + tail <= b - a ? Math.min(head, tail) : 0;
    const has = carries(marker, outside) ? 'outside' : carries(marker, inside) ? 'inside' : null;
    return { a, b, has };
  });
  if (!segs.length) return edit;
  const remove = segs.every((s) => s.has);

  let out = '';
  let at = 0;
  /** @type {{ from: number, to: number, outerFrom: number, outerTo: number }[]} */
  const placed = [];
  for (const { a, b, has } of segs) {
    if (remove && has === 'outside') {
      out += text.slice(at, a - len);
      const from = out.length;
      out += text.slice(a, b);
      placed.push({ from, to: out.length, outerFrom: from, outerTo: out.length });
      at = b + len;
    } else if (remove) {
      out += text.slice(at, a);
      const from = out.length;
      out += text.slice(a + len, b - len);
      placed.push({ from, to: out.length, outerFrom: from, outerTo: out.length });
      at = b;
    } else if (has) {
      // Déjà en forme, les autres pas : on l'y laisse.
      out += text.slice(at, a);
      const from = out.length;
      out += text.slice(a, b);
      placed.push({ from, to: out.length, outerFrom: from, outerTo: out.length });
      at = b;
    } else {
      out += text.slice(at, a);
      const outerFrom = out.length;
      out += marker;
      const from = out.length;
      out += text.slice(a, b);
      const to = out.length;
      out += marker;
      placed.push({ from, to, outerFrom, outerTo: out.length });
      at = b;
    }
  }
  out += text.slice(at);

  // Une ligne : le texte seul reste sélectionné (un second clic voit les
  // marqueurs autour). Plusieurs : marqueurs compris, pour la même raison.
  const first = placed[0];
  const last = placed[placed.length - 1];
  return placed.length === 1
    ? { text: out, start: first.from, end: first.to }
    : { text: out, start: first.outerFrom, end: last.outerTo };
}

// ------------------------------------------------------------ de ligne -------

/** Outils de ligne : ce que chacun pose en tête de ligne. */
export const LINE = /** @type {Readonly<Record<string, string>>} */ ({
  h1: '# ',
  h2: '## ',
  h3: '### ',
  sub: '-# ',
  quote: '> ',
  list: '- ',
});

/** Titre → outil, par son nombre de dièses. */
const HEADINGS = ['', 'h1', 'h2', 'h3'];

/**
 * Une ligne démontée. La citation entoure le reste (`> ## Titre`) ; titre,
 * sous-texte et puce s'excluent — une ligne n'est qu'une de ces choses. Seule
 * la puce garde son retrait (c'est lui qui l'imbrique) : un titre en retrait
 * n'en est pas un pour Discord.
 * @returns {{ raw: string, quote: boolean, indent: string, kind: string | null, mark: string, body: string }}
 */
function parseLine(/** @type {string} */ raw) {
  const quote = raw.startsWith('> ');
  const rest = quote ? raw.slice(2) : raw;
  const indent = /** @type {RegExpExecArray} */ (/^\s*/.exec(rest))[0];
  const m = /^(?:(#{1,3}) +|(-#) +|([-*]) +)/.exec(rest.slice(indent.length));
  const kind = !m ? null : m[3] ? 'list' : indent ? null : m[2] ? 'sub' : HEADINGS[m[1].length];
  const mark = kind && m ? m[0] : '';
  return { raw, quote, indent, kind, mark, body: rest.slice(indent.length + mark.length) };
}

/**
 * Pose ou retire un marqueur de ligne (`LINE`) sur toutes les lignes que la
 * sélection touche. EN BASCULE : si toutes le portent déjà il est retiré, sinon
 * il est posé partout — à la place du titre, du sous-texte ou de la puce qui s'y
 * trouvait. Les lignes vides sont passées, sauf s'il n'y a qu'elles (la ligne
 * vide où l'on s'apprête à taper un titre).
 * @param {Edit} edit
 * @param {string} tool
 * @returns {Edit}
 */
export function toggleLine(edit, tool) {
  const { text, start, end } = edit;
  const from = text.lastIndexOf('\n', start - 1) + 1;
  // Une sélection qui s'arrête en tout début de ligne ne touche pas cette ligne.
  const last = end > start && text[end - 1] === '\n' ? end - 1 : end;
  let to = text.indexOf('\n', last);
  if (to < 0) to = text.length;

  const lines = text.slice(from, to).split('\n').map(parseLine);
  const filled = lines.filter((l) => l.raw.trim());
  const targets = new Set(filled.length ? filled : lines);
  const has = (/** @type {ReturnType<typeof parseLine>} */ l) =>
    tool === 'quote' ? l.quote : l.kind === tool;
  const remove = [...targets].every(has);

  const rebuilt = lines.map((l) => {
    if (!targets.has(l)) return { head: l.raw.length - l.body.length, next: l.raw, nextHead: 0 };
    const quote = tool === 'quote' ? !remove : l.quote;
    const kind = tool === 'quote' ? l.kind : remove ? null : tool;
    const mark = kind === l.kind ? l.mark : kind ? LINE[kind] : '';
    const head = (quote ? '> ' : '') + (kind && kind !== 'list' ? '' : l.indent) + mark;
    return { head: l.raw.length - l.body.length, next: head + l.body, nextHead: head.length };
  });

  const block = rebuilt.map((r) => r.next).join('\n');
  // Une position suit son texte : dans le corps de la ligne elle garde sa
  // place, dans l'ancien marqueur elle vient au début du corps.
  const move = (/** @type {number} */ at) => {
    if (at < from) return at;
    if (at > to) return at + block.length - (to - from);
    let oldStart = from;
    let newStart = from;
    for (let i = 0; i < lines.length; i++) {
      const col = at - oldStart;
      if (col <= lines[i].raw.length) {
        const r = rebuilt[i];
        if (!targets.has(lines[i])) return newStart + col;
        return newStart + r.nextHead + Math.max(0, col - r.head);
      }
      oldStart += lines[i].raw.length + 1;
      newStart += rebuilt[i].next.length + 1;
    }
    return from + block.length;
  };
  return { text: text.slice(0, from) + block + text.slice(to), start: move(start), end: move(end) };
}

// --------------------------------------------------------- bloc de code ------

const FENCE = '```';

/**
 * Entoure de deux clôtures ```` ``` ````, chacune sur sa propre ligne : les
 * lignes entières que la sélection touche, ou un bloc vide au curseur. Un
 * second clic, la sélection (ou le curseur) restée entre les clôtures, les
 * retire.
 * @param {Edit} edit
 * @returns {Edit}
 */
export function toggleCodeBlock(edit) {
  const { text, start, end } = edit;

  const opening = /(?:^|\n)(```[A-Za-z0-9_+-]*\n)$/.exec(text.slice(0, start));
  const closing = /^\n```(?=\n|$)/.exec(text.slice(end));
  if (opening && closing) {
    const open = opening[1].length;
    return {
      text:
        text.slice(0, start - open) + text.slice(start, end) + text.slice(end + closing[0].length),
      start: start - open,
      end: end - open,
    };
  }
  const whole = /^```[A-Za-z0-9_+-]*\n(?:([\s\S]*)\n)?```$/.exec(text.slice(start, end));
  if (whole) {
    const inner = whole[1] ?? '';
    return {
      text: text.slice(0, start) + inner + text.slice(end),
      start,
      end: start + inner.length,
    };
  }

  let a = start;
  let b = end;
  if (start !== end) {
    a = text.lastIndexOf('\n', start - 1) + 1;
    const last = text[end - 1] === '\n' ? end - 1 : end;
    b = text.indexOf('\n', last);
    if (b < 0) b = text.length;
  }
  // Au curseur, en milieu de ligne : la ligne est coupée, les clôtures ne
  // partagent la leur avec rien.
  const lead = a === 0 || text[a - 1] === '\n' ? '' : '\n';
  const trail = b === text.length || text[b] === '\n' ? '' : '\n';
  const inner = text.slice(a, b);
  const at = a + lead.length + FENCE.length + 1;
  return {
    text: `${text.slice(0, a)}${lead}${FENCE}\n${inner}\n${FENCE}${trail}${text.slice(b)}`,
    start: at,
    end: at + inner.length,
  };
}

// ----------------------------------------------------------------- lien ------

/** Une sélection qui EST une adresse : elle devient l'URL du lien, pas son texte. */
export const isUrl = (/** @type {string} */ s) => /^https?:\/\/\S+$/.test(s);

/**
 * Le lien masqué `[texte](url)` que la sélection désigne — le lien entier, ou
 * son seul texte — pour qu'un second clic le retire. `null` s'il n'y en a pas.
 * @param {Edit} edit
 * @returns {{ from: number, to: number, label: string } | null}
 */
export function linkAt(edit) {
  const { text, start, end } = edit;
  const selected = text.slice(start, end);
  const whole = /^\[([^[\]\n]*)\]\([^\s)]*\)$/.exec(selected);
  if (whole) return { from: start, to: end, label: whole[1] };
  const tail = /^\]\([^\s)]*\)/.exec(text.slice(end));
  if (text[start - 1] === '[' && tail && !/[[\]\n]/.test(selected))
    return { from: start - 1, to: end + tail[0].length, label: selected };
  return null;
}

/**
 * Défait un lien trouvé par `linkAt` : il n'en reste que le texte, sélectionné.
 * @param {Edit} edit
 * @param {{ from: number, to: number, label: string }} link
 * @returns {Edit}
 */
export function unlink(edit, link) {
  return {
    text: edit.text.slice(0, link.from) + link.label + edit.text.slice(link.to),
    start: link.from,
    end: link.from + link.label.length,
  };
}

/**
 * L'adresse telle qu'elle peut s'écrire entre les parenthèses : `https://`
 * devant un hôte nu (Discord ne masque que du http), et ni blanc ni parenthèse
 * fermante, qui couperaient le lien.
 */
function cleanUrl(/** @type {string} */ url) {
  const u = url.trim();
  if (!u || /^https?:\/\/$/i.test(u)) return '';
  return (u.includes('://') ? u : `https://${u}`).replace(/\s/g, '%20').replace(/\)/g, '%29');
}

/**
 * Pose un lien masqué. La sélection devient le TEXTE et `url` l'adresse — sauf
 * une sélection qui est elle-même une adresse (`isUrl`) : elle devient l'URL,
 * et `url` n'est pas lu. Le curseur va là où il reste à écrire : dans les
 * crochets sans texte, dans les parenthèses sans adresse, après le lien sinon.
 * @param {Edit} edit
 * @param {string} url
 * @returns {Edit}
 */
export function insertLink(edit, url) {
  const { text, start, end } = edit;
  const selected = text.slice(start, end);
  const fromUrl = isUrl(selected);
  // Le texte d'un lien tient sur une ligne.
  const label = fromUrl ? '' : selected.replace(/\s*\n\s*/g, ' ');
  const href = fromUrl ? selected : cleanUrl(url);
  const link = `[${label}](${href})`;
  const caret = !label ? start + 1 : !href ? start + link.length - 1 : start + link.length;
  return { text: text.slice(0, start) + link + text.slice(end), start: caret, end: caret };
}

// --------------------------------------------------------------- outils ------

/**
 * Un bouton de la barre, par son nom : outil en ligne, de ligne, ou bloc de
 * code. Le lien n'est pas ici — il demande une adresse (`insertLink`).
 * @param {Edit} edit
 * @param {string} tool
 * @returns {Edit}
 */
export function applyTool(edit, tool) {
  if (Object.hasOwn(INLINE, tool)) return toggleInline(edit, INLINE[tool]);
  if (Object.hasOwn(LINE, tool)) return toggleLine(edit, tool);
  if (tool === 'codeblock') return toggleCodeBlock(edit);
  return edit;
}

const SHORTCUTS = /** @type {Readonly<Record<string, string>>} */ ({
  b: 'bold',
  i: 'italic',
  u: 'underline',
  k: 'link',
});

/**
 * L'outil d'un raccourci clavier : Ctrl (ou Cmd) + B, I, U, K — seuls. AltGr se
 * présente comme Ctrl+Alt sous Windows : ce n'est pas un raccourci.
 * @param {{ key: string, ctrlKey?: boolean, metaKey?: boolean, altKey?: boolean, shiftKey?: boolean }} e
 * @returns {string | null}
 */
export function shortcutTool(e) {
  if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey) return null;
  const key = e.key.toLowerCase();
  return Object.hasOwn(SHORTCUTS, key) ? SHORTCUTS[key] : null;
}

const isHigh = (/** @type {number} */ c) => c >= 0xd800 && c <= 0xdbff;
const isLow = (/** @type {number} */ c) => c >= 0xdc00 && c <= 0xdfff;

/**
 * Le plus petit remplacement qui mène d'un texte à l'autre : `[from, to[` de
 * `before` devient `insert`. `null` si rien ne change.
 *
 * C'est ce que la page donne à `execCommand('insertText')`, la seule écriture
 * dans une zone de texte que le navigateur range dans son historique
 * d'annulation — réécrire `value` le viderait, et Ctrl+Z ne rendrait plus rien.
 * Un seul remplacement par outil : un seul Ctrl+Z le défait.
 * @param {string} before
 * @param {string} after
 * @returns {{ from: number, to: number, insert: string } | null}
 */
export function diffEdit(before, after) {
  if (before === after) return null;
  const max = Math.min(before.length, after.length);
  let head = 0;
  while (head < max && before[head] === after[head]) head++;
  let tail = 0;
  while (tail < max - head && before[before.length - 1 - tail] === after[after.length - 1 - tail])
    tail++;
  // Jamais au milieu d'un caractère codé sur deux unités (un emoji) : deux
  // emojis différents peuvent partager leur première moitié.
  if (head > 0 && isHigh(before.charCodeAt(head - 1))) head--;
  if (tail > 0 && isLow(before.charCodeAt(before.length - tail))) tail--;
  return {
    from: head,
    to: before.length - tail,
    insert: after.slice(head, after.length - tail),
  };
}

// --------------------------------------------------------------- emojis ------

/** Nombre de derniers emojis utilisés que le sélecteur retient. */
export const RECENT_MAX = 10;

/**
 * Les emojis des serveurs cochés en UNE liste, dans l'ordre des serveurs, chacun
 * marqué du sien (`guildId`). Un même nom sur deux serveurs → le premier gagne,
 * comme à l'envoi (`mergeEmojis` de `discord.ts`) : l'autre ne pourrait pas
 * s'écrire, il n'est donc pas proposé.
 * @param {readonly EmojiGuild[]} guilds
 * @returns {Emoji[]}
 */
export function mergeGuildEmojis(guilds) {
  const seen = new Set();
  /** @type {Emoji[]} */
  const out = [];
  for (const g of guilds)
    for (const e of g.emojis) {
      if (seen.has(e.name)) continue;
      seen.add(e.name);
      out.push({ ...e, guildId: g.id });
    }
  return out;
}

/**
 * Filtre UNE liste par nom, sans égard à la casse : le nom exact, puis ceux qui
 * COMMENCENT par la recherche, puis ceux qui la contiennent. À égalité, les
 * derniers utilisés d'abord (du plus récent au plus ancien), puis l'ordre de la
 * liste. Sans recherche, la liste telle quelle.
 * @param {readonly Emoji[]} list
 * @param {string} query
 * @param {readonly string[]} [recent]
 * @returns {Emoji[]}
 */
export function matchEmojis(list, query, recent = []) {
  const q = query.trim().toLowerCase();
  if (!q) return [...list];
  const used = (/** @type {Emoji} */ e) => {
    const i = recent.indexOf(e.name);
    return i < 0 ? recent.length : i;
  };
  return list
    .map((emoji, order) => {
      const at = emoji.name.toLowerCase().indexOf(q);
      const rank = at < 0 ? -1 : emoji.name.length === q.length ? 0 : at === 0 ? 1 : 2;
      return { emoji, rank, used: used(emoji), order };
    })
    .filter((m) => m.rank >= 0)
    .sort((x, y) => x.rank - y.rank || x.used - y.used || x.order - y.order)
    .map((m) => m.emoji);
}

/**
 * Les emojis qui répondent à une recherche, ceux du SERVEUR d'abord — c'est
 * aussi l'ordre dans lequel un `:nom:` est résolu à l'envoi (`convertEmojis`).
 * @param {EmojiLists} lists
 * @param {string} query
 * @param {readonly string[]} [recent]
 * @param {number} [limit]
 * @returns {Emoji[]}
 */
export function searchEmojis(lists, query, recent = [], limit = Infinity) {
  return [
    ...matchEmojis(lists.guild, query, recent),
    ...matchEmojis(lists.standard, query, recent),
  ].slice(0, limit);
}

/**
 * Les derniers emojis utilisés, du plus récent au plus ancien — ceux qui
 * existent encore. Un nom porté par le serveur ET par la table standard est
 * celui du serveur, comme à l'envoi.
 * @param {EmojiLists} lists
 * @param {readonly string[]} recent
 * @returns {Emoji[]}
 */
export function recentEmojis(lists, recent) {
  const all = [...lists.guild, ...lists.standard];
  return recent.flatMap((name) => all.find((e) => e.name === name) ?? []);
}

/**
 * Ce que le sélecteur affiche, section par section. Sans recherche : les
 * récents, puis UNE section par serveur coché (`key` : `guild:<id>`) ; les
 * standards ne sont PAS déroulés d'office — ils sont des centaines — et leur
 * section reste repliée (`folded`) tant que `standardOpen` est faux. Avec une
 * recherche : ce qui y répond, serveurs d'abord, standards compris.
 * @param {EmojiLists} lists
 * @param {readonly { id: string, name: string }[]} guilds Les serveurs cochés, dans l'ordre.
 * @param {string} query
 * @param {readonly string[]} recent
 * @param {boolean} standardOpen
 * @returns {{ key: string, title: string, items: Emoji[], folded?: boolean }[]}
 */
export function pickerSections(lists, guilds, query, recent, standardOpen) {
  const searching = Boolean(query.trim());
  /** @type {{ key: string, title: string, items: Emoji[], folded?: boolean }[]} */
  const sections = [];
  if (!searching) {
    const used = recentEmojis(lists, recent);
    if (used.length) sections.push({ key: 'recent', title: 'Récents', items: used });
  }
  for (const g of guilds)
    sections.push({
      key: `guild:${g.id}`,
      title: g.name,
      items: matchEmojis(
        lists.guild.filter((e) => e.guildId === g.id),
        query,
        recent,
      ),
    });
  sections.push(
    searching || standardOpen
      ? { key: 'standard', title: 'Standards', items: matchEmojis(lists.standard, query, recent) }
      : { key: 'standard', title: 'Standards', items: [], folded: true },
  );
  return sections;
}

/**
 * La palette toujours visible : pour chaque groupe de `discord-palette.json`,
 * les emojis que ses noms désignent — sur un serveur coché d'abord (nom exact,
 * puis à la casse près), dans la table standard sinon : l'ordre dans lequel un
 * `:nom:` est résolu à l'envoi. Un nom que rien ne porte n'est PAS un bouton :
 * il revient dans `missing`, pour être corrigé dans le fichier. Un groupe sans
 * aucun bouton tombe.
 * @param {readonly { label: string, names: readonly string[] }[]} groups
 * @param {EmojiLists} lists
 * @returns {{ groups: { label: string, items: Emoji[] }[], missing: string[] }}
 */
export function resolvePalette(groups, lists) {
  const find = (/** @type {string} */ name) => {
    const low = name.toLowerCase();
    return (
      lists.guild.find((e) => e.name === name) ??
      lists.guild.find((e) => e.name.toLowerCase() === low) ??
      lists.standard.find((e) => e.name === low)
    );
  };
  /** @type {string[]} */
  const missing = [];
  const resolved = groups.map((g) => ({
    label: g.label,
    items: g.names.flatMap((name) => {
      const emoji = find(name);
      if (!emoji) missing.push(name);
      return emoji ?? [];
    }),
  }));
  return { groups: resolved.filter((g) => g.items.length), missing };
}

/**
 * Note un emoji comme le dernier utilisé : en tête, sans doublon, `max` au plus.
 * @param {readonly string[]} recent
 * @param {string} name
 * @param {number} [max]
 * @returns {string[]}
 */
export function pushRecent(recent, name, max = RECENT_MAX) {
  return [name, ...recent.filter((n) => n !== name)].slice(0, max);
}

const NAME_CHAR = /[A-Za-z0-9_+-]/;

/**
 * Le code en cours de frappe au curseur — `:sc` — ou `null`. Il s'ouvre par
 * `:` et DEUX lettres, et le curseur est à son bout.
 *
 * Ne sont pas des codes à compléter :
 *   - une heure ou un mot (`10:30`, `Note:ab`) et, du même coup, la fin d'un
 *     code déjà fermé (`:scroll:ab` — ce `:` ferme, il n'ouvre pas) ;
 *   - le milieu d'un nom, fermé ou non (`:sc|roll:`) ;
 *   - un bout d'adresse (`https://hôte/:id`) ;
 *   - du code, en ligne ou en bloc : rien ne s'y convertit à l'envoi.
 * @param {string} text
 * @param {number} caret
 * @returns {{ from: number, query: string } | null} `from` : la place du `:`.
 */
export function emojiQueryAt(text, caret) {
  let nameStart = caret;
  while (nameStart > 0 && NAME_CHAR.test(text[nameStart - 1])) nameStart--;
  const from = nameStart - 1;
  const query = text.slice(nameStart, caret);
  if (from < 0 || text[from] !== ':') return null;
  if (!/^[A-Za-z]{2}/.test(query) || query.length > 32) return null;
  if (from > 0 && NAME_CHAR.test(text[from - 1])) return null;
  if (caret < text.length && (NAME_CHAR.test(text[caret]) || text[caret] === ':')) return null;

  const before = text.slice(0, from);
  if (/https?:\/\/\S*$/i.test(before)) return null;
  if ((before.split(FENCE).length - 1) % 2) return null;
  const line = before.slice(before.lastIndexOf('\n') + 1).replaceAll(FENCE, '');
  if ((line.split('`').length - 1) % 2) return null;
  return { from, query };
}

/**
 * Écrit `:nom:` suivi d'une espace à la place de `[from, fin de sélection[` —
 * la sélection pour le sélecteur, le `:sc` tapé pour l'autocomplétion. Une
 * espace déjà là fait l'affaire : on ne la double pas.
 * @param {Edit} edit
 * @param {string} name
 * @param {number} [from]
 * @returns {Edit}
 */
export function insertEmoji(edit, name, from = edit.start) {
  const { text, end } = edit;
  const code = `:${name}:`;
  const caret = from + code.length + 1;
  return {
    text: text.slice(0, from) + code + (text[end] === ' ' ? '' : ' ') + text.slice(end),
    start: caret,
    end: caret,
  };
}

// ---------------------------------------------------------- horodatages ------

/**
 * Les formats d'un horodatage Discord `<t:instant:format>` que le formulaire
 * propose, dans son ordre. Discord rend l'instant dans le fuseau et la langue de
 * CHAQUE lecteur ; `f` est aussi ce qu'il prend quand le format manque.
 */
export const TIMESTAMP_STYLES = /** @type {readonly (readonly [string, string])[]} */ ([
  ['d', 'date courte'],
  ['D', 'date longue'],
  ['t', 'heure'],
  ['f', 'date et heure'],
  ['F', 'jour, date et heure'],
  ['R', 'relatif'],
]);

/**
 * L'instant Unix, en secondes, d'une date (`AAAA-MM-JJ`) et d'une heure
 * (`HH:MM`) données en UTC — celles d'une note officielle. `null` pour une date
 * qui n'existe pas : `Date.UTC` reporterait ce qui déborde (le 30 février y
 * devient le 2 mars), on relit donc ce qu'il a compris.
 * @param {string} date
 * @param {string} [time]
 * @returns {number | null}
 */
export function utcToUnix(date, time = '00:00') {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const t = /^(\d{2}):(\d{2})$/.exec(time);
  if (!d || !t) return null;
  const [year, month, day, hour, minute] = [d[1], d[2], d[3], t[1], t[2]].map(Number);
  if (hour > 23 || minute > 59) return null;
  const at = new Date(Date.UTC(year, month - 1, day, hour, minute));
  if (at.getUTCFullYear() !== year || at.getUTCMonth() !== month - 1 || at.getUTCDate() !== day)
    return null;
  return at.getTime() / 1000;
}

/**
 * La date que la sélection désigne — `AAAA-MM-JJ` ou `AAAA-MM-JJ HH:MM`, suivie
 * ou non de ` UTC` — avec ses bornes, blancs de bord exclus : le formulaire
 * s'ouvre prérempli, et l'horodatage prend sa place. `null` si la sélection
 * n'est pas une date (même impossible : le formulaire le dira).
 * @param {Edit} edit
 * @returns {{ date: string, time: string, start: number, end: number } | null}
 */
export function dateAt(edit) {
  const selected = edit.text.slice(edit.start, edit.end);
  const m = /^(\s*)(\d{4}-\d{2}-\d{2})(?: (\d{2}:\d{2}))?(?: UTC)?\s*$/.exec(selected);
  if (!m) return null;
  const start = edit.start + m[1].length;
  return { date: m[2], time: m[3] ?? '00:00', start, end: start + selected.trim().length };
}

/**
 * Écrit `<t:instant:format>` à la place de la sélection (au curseur s'il n'y en
 * a pas), curseur après.
 * @param {Edit} edit
 * @param {number} unix
 * @param {string} [style]
 * @returns {Edit}
 */
export function insertTimestamp(edit, unix, style = 'f') {
  const { text, start, end } = edit;
  const code = `<t:${unix}:${style}>`;
  const caret = start + code.length;
  return { text: text.slice(0, start) + code + text.slice(end), start: caret, end: caret };
}

/** Blocs et extraits de code : Discord n'y rend pas un horodatage, on n'y convertit rien. */
const CODE_SPAN = /```[\s\S]*?```|``[^\n]+?``|`[^`\n]+`/g;

/**
 * Une date écrite pour être convertie. Le suffixe ` UTC` est EXIGÉ — une date
 * nue reste du texte — et `UTC+2` n'est pas de l'UTC.
 */
const UTC_STAMP = /(?<!\d)(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}) UTC(?![\w+]|-\d)/g;

/**
 * Remplace dans tout le texte chaque `AAAA-MM-JJ HH:MM UTC` par `<t:…:f>` —
 * c'est sous cette forme qu'un modèle écrit ses dates, lui qui ne sait pas
 * calculer un instant Unix. Hors du code ; une date qui n'existe pas est
 * laissée telle quelle et rendue dans `invalid`. La sélection suit son texte.
 * @param {Edit} edit
 * @returns {{ edit: Edit, count: number, invalid: string[] }}
 */
export function convertDates(edit) {
  const { text } = edit;
  const code = [...text.matchAll(CODE_SPAN)].map((m) => [m.index, m.index + m[0].length]);
  /** @type {{ from: number, to: number, length: number }[]} */
  const done = [];
  /** @type {string[]} */
  const invalid = [];
  let out = '';
  let at = 0;
  for (const m of text.matchAll(UTC_STAMP)) {
    if (code.some(([a, b]) => m.index >= a && m.index < b)) continue;
    const unix = utcToUnix(m[1], m[2]);
    if (unix === null) {
      invalid.push(m[0]);
      continue;
    }
    const stamp = `<t:${unix}:f>`;
    out += text.slice(at, m.index) + stamp;
    at = m.index + m[0].length;
    done.push({ from: m.index, to: at, length: stamp.length });
  }
  out += text.slice(at);

  // Une position garde sa place ; prise dans une date convertie, elle vient
  // au bout de l'horodatage.
  const move = (/** @type {number} */ p) => {
    let shift = 0;
    for (const d of done) {
      if (p <= d.from) break;
      if (p < d.to) return d.from + shift + d.length;
      shift += d.length - (d.to - d.from);
    }
    return p + shift;
  };
  return {
    edit: { text: out, start: move(edit.start), end: move(edit.end) },
    count: done.length,
    invalid,
  };
}
