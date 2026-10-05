/**
 * Contrat de l'onglet « Discord » de `pnpm quick` (`discord.ts`).
 *
 * Ce geste écrit dans un salon PUBLIC, au nom du bot : ce qui raterait ici se
 * lirait là-bas. Cinq choses à ne pas laisser partir —
 *   - un emoji resté en toutes lettres (`:scrol:`), ou un message coupé au
 *     milieu d'une ligne ;
 *   - un doublon : un envoi repris après un échec ne reposte pas ce qui est
 *     déjà en place ;
 *   - une mention qui notifie ;
 *   - le jeton du bot, dans un journal ou une réponse de route ;
 *   - un message sur le MAUVAIS serveur : celui où l'on poste se choisit, et un
 *     message posté ne se modifie que là où il est parti.
 *
 * AUCUN appel à Discord : `fetch` et `sleep` sont simulés (`harness`).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import shortcodes from './discord-shortcodes.json';
import palette from './discord-palette.json';
import {
  BUTTON_MAX,
  DISCORD_API,
  EMBED_COLOR,
  EMBED_DESCRIPTION_LIMIT,
  EMBED_TOTAL_LIMIT,
  EMPTY_EMBED,
  MESSAGE_LIMIT,
  OFFICIAL_HOST,
  TOKEN_HINT,
  blocker,
  buildRequest,
  canUseExternalEmojis,
  convertEmojis,
  convertPlain,
  discordSession,
  editMessages,
  embedBlocker,
  embedBody,
  embedColor,
  embedForm,
  embedPreviewHtml,
  embedTemplate,
  embedTotal,
  inviteUrl,
  isHttpUrl,
  latestNotes,
  mergeEmojis,
  messageBody,
  noteSrcdoc,
  officialUrl,
  parsePalette,
  patchTemplate,
  prepare,
  prepareEmbed,
  renderDiscord,
  renderEmbed,
  scrub,
  sendMessages,
  sortChannels,
  splitMessage,
  standardEmojis,
  type BotAccess,
  type DiscordDeps,
  type Draft,
  type EditRequest,
  type EmbedForm,
  type GuildEmoji,
  type NotePost,
  type SendRequest,
} from './discord';

const TOKEN = 'MTIzNDU2.FAKE-token_for.tests';
const BOT_ID = '900000000000000001';
/** Le serveur de `DISCORD_GUILD_ID` — le bot n'y est ni propriétaire ni administrateur. */
const GUILD_ID = '100000000000000001';
/** Un second serveur, plus récent : celui de Sevih, dont le bot est propriétaire. */
const HOME_GUILD = '100000000000000002';
/** Un serveur qui refuse ses emojis (403). */
const LOCKED_GUILD = '100000000000000003';
const CHANNEL = '200000000000000001';
const OTHER_CHANNEL = '200000000000000002';
/** Le salon du second serveur. */
const HOME_CHANNEL = '200000000000000003';
const DARK = '300000000000000001';
const RANGER = '300000000000000002';
const PARTY = '300000000000000003';
/** Sur le second serveur : un `dark` en double, et un `tactician` qu'il est seul à avoir. */
const HOME_DARK = '300000000000000011';
const TACTICIAN = '300000000000000012';
const BOT_ROLE = '600000000000000001';
/** Bit « Utiliser des emojis externes ». */
const EXTERNAL = String(1 << 18);

const EMOJIS = new Map<string, GuildEmoji>([
  ['dark', { id: DARK, name: 'dark', animated: false }],
  ['ranger', { id: RANGER, name: 'ranger', animated: false }],
  ['party', { id: PARTY, name: 'party', animated: true }],
]);

/**
 * Un résumé de patch dans la forme de ceux de Sevih : le gabarit rempli, avec
 * chaque construction qu'il emploie (titre, lien en sous-texte, sections,
 * listes imbriquées, citation, emojis du serveur et standard). Le texte exact
 * d'un de ses messages n'était pas joint au lot : celui-ci est reconstitué.
 */
const SAMPLE = [
  '# :scroll: PATCH NOTES — TL;DR',
  '-# [Full Patch Note](https://annoucements.outerplane.major7.kr/2026/10/05/1006pne/)',
  '## :star: Banners & Dungeons',
  '- **Demiurge Lambda** :dark: :ranger: — new Demiurge hero',
  '  - Pickup: *after maintenance* ~ ongoing',
  '- Irregular Extermination: __new season__',
  '## :crossed_swords: Content',
  '> Adventure License is retired.',
  '> Its shop moves to the Survey Hub.',
  '## :scales: Adjustments',
  '* Skill cooldown `4` → `3`',
  '## :moneybag: Shop',
  '- ~~Old package~~ replaced',
  '## :bug: Bug Fixes',
  '- Fixed a crash, see https://outerpedia.com/tools/patch-history.',
].join('\n');

interface Call {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: unknown;
}

/** `fetch` et `sleep` simulés : tout appel est noté, la réponse vient de `reply`. */
function harness(
  reply: (call: Call, n: number) => { status: number; body?: unknown },
  over: Partial<DiscordDeps> = {},
) {
  const calls: Call[] = [];
  const sleeps: number[] = [];
  const deps: DiscordDeps = {
    token: TOKEN,
    guildId: GUILD_ID,
    fetch: async (url, init) => {
      const call: Call = {
        url,
        method: init.method,
        headers: init.headers,
        body: init.body === undefined ? undefined : JSON.parse(init.body),
      };
      calls.push(call);
      const r = reply(call, calls.length);
      return {
        status: r.status,
        ok: r.status >= 200 && r.status < 300,
        json: async () => r.body ?? null,
      };
    },
    sleep: async (ms) => void sleeps.push(ms),
    ...over,
  };
  return { deps, calls, sleeps };
}

/**
 * Un Discord docile : le bot est membre de trois serveurs, chacun rend ses
 * salons et ses emojis (sauf `LOCKED_GUILD`, qui refuse les siens), et tout
 * message est accepté. Sur `GUILD_ID` le bot n'a « emojis externes » que dans
 * `CHANNEL`, par une dérogation de son rôle.
 */
function discord(call: Call, n: number): { status: number; body?: unknown } {
  const path = call.url.slice(DISCORD_API.length);
  if (path === '/users/@me')
    return { status: 200, body: { id: BOT_ID, username: 'Outerpedia', bot: true } };
  if (path === '/users/@me/guilds')
    return {
      status: 200,
      body: [
        // Discord en dit plus (icône, bannière, fonctions) : la page n'en voit rien.
        { id: GUILD_ID, name: 'EvaMains', owner: false, permissions: '2048', icon: 'abc' },
        { id: HOME_GUILD, name: 'Chez Sevih', owner: true, permissions: '0', features: [] },
        { id: LOCKED_GUILD, name: 'Fermé', owner: false, permissions: '2048' },
      ],
    };
  const guild = /^\/guilds\/(\d+)\/(emojis|channels|members\/\d+)$/.exec(path);
  if (guild?.[2] === 'emojis') {
    if (guild[1] === LOCKED_GUILD)
      return { status: 403, body: { message: 'Missing Access', code: 50001 } };
    if (guild[1] === HOME_GUILD)
      return {
        status: 200,
        body: [
          { id: TACTICIAN, name: 'tactician' },
          { id: HOME_DARK, name: 'dark' },
        ],
      };
    return {
      status: 200,
      body: [...EMOJIS.values(), { id: '300000000000000009', name: 'gone', available: false }],
    };
  }
  if (guild?.[2] === 'channels') {
    if (guild[1] === HOME_GUILD)
      return { status: 200, body: [{ id: HOME_CHANNEL, type: 0, name: 'test', position: 0 }] };
    return {
      status: 200,
      body: [
        { id: '400000000000000001', type: 4, name: 'News', position: 0 },
        {
          id: CHANNEL,
          type: 5,
          name: 'patch-notes',
          position: 0,
          parent_id: '400000000000000001',
          permission_overwrites: [{ id: BOT_ROLE, type: 0, allow: EXTERNAL, deny: '0' }],
        },
        { id: OTHER_CHANNEL, type: 0, name: 'bot-test', position: 3, permission_overwrites: [] },
      ],
    };
  }
  if (guild) return { status: 200, body: { roles: [BOT_ROLE], user: { id: BOT_ID } } };
  return { status: 200, body: { id: `50000000000000000${n}` } };
}

const posts = (calls: Call[]): Call[] => calls.filter((c) => c.method !== 'GET');
const gets = (calls: Call[]): string[] =>
  calls.filter((c) => c.method === 'GET').map((c) => c.url.slice(DISCORD_API.length));

/** Ce que la page joint à chaque demande : par défaut, on poste sur `GUILD_ID` avec ses emojis. */
const draft = (text: string, over: Partial<Draft> = {}): Draft => ({
  text,
  mode: 'simple',
  embed: EMPTY_EMBED,
  guildId: GUILD_ID,
  emojiGuilds: [GUILD_ID],
  ...over,
});
const toSend = (text: string, over: Partial<SendRequest> = {}): SendRequest => ({
  ...draft(text),
  channelId: CHANNEL,
  suppressEmbeds: true,
  ...over,
});
const toEdit = (text: string, ids: string[], over: Partial<EditRequest> = {}): EditRequest => ({
  ...toSend(text),
  ids,
  posted: { guildId: GUILD_ID, channelId: CHANNEL, mode: 'simple' },
  ...over,
});
const form = (over: Partial<EmbedForm> = {}): EmbedForm => ({ ...EMPTY_EMBED, ...over });

// ---------------------------------------------------------------- rendu ------

describe('renderDiscord — chaque construction', () => {
  it.each([
    ['# Titre', '<h1>Titre</h1>'],
    ['## Titre', '<h2>Titre</h2>'],
    ['### Titre', '<h3>Titre</h3>'],
    // Quatre dièses, ou pas d'espace : ce n'est pas un titre pour Discord.
    ['#### Titre', '<div class="ln">#### Titre</div>'],
    ['#Titre', '<div class="ln">#Titre</div>'],
    ['-# petit', '<div class="sub">petit</div>'],
    ['**gras**', '<div class="ln"><strong>gras</strong></div>'],
    ['*italique*', '<div class="ln"><em>italique</em></div>'],
    ['_italique_', '<div class="ln"><em>italique</em></div>'],
    ['__souligné__', '<div class="ln"><u>souligné</u></div>'],
    ['~~barré~~', '<div class="ln"><s>barré</s></div>'],
    ['***les deux***', '<div class="ln"><strong><em>les deux</em></strong></div>'],
    ['`a *b* :scroll:`', '<div class="ln"><code>a *b* :scroll:</code></div>'],
    // Un `_` au milieu d'un mot, ou un `*` entouré d'espaces, ne met rien en forme.
    ['snake_case_name', '<div class="ln">snake_case_name</div>'],
    ['5 * 3 * 2', '<div class="ln">5 * 3 * 2</div>'],
    ['\\*pas italique\\*', '<div class="ln">*pas italique*</div>'],
  ])('%s', (source, html) => {
    expect(renderDiscord(source)).toBe(html);
  });

  it('citations : lignes `> ` groupées, `>>> ` jusqu’à la fin', () => {
    expect(renderDiscord('> a\n> **b**\nc')).toBe(
      '<blockquote><div class="ln">a</div><div class="ln"><strong>b</strong></div></blockquote><div class="ln">c</div>',
    );
    expect(renderDiscord('>>> a\nb')).toBe(
      '<blockquote><div class="ln">a</div><div class="ln">b</div></blockquote>',
    );
    // Sans espace derrière, c'est du texte.
    expect(renderDiscord('>a')).toBe('<div class="ln">&gt;a</div>');
  });

  it('listes `- ` et `* `, imbriquées par indentation', () => {
    expect(renderDiscord('- a\n* b')).toBe('<ul><li>a</li><li>b</li></ul>');
    expect(renderDiscord('- a\n  - b\n    - c\n- d')).toBe(
      '<ul><li>a<ul><li>b<ul><li>c</li></ul></li></ul></li><li>d</li></ul>',
    );
    expect(renderDiscord('- a\nfin')).toBe('<ul><li>a</li></ul><div class="ln">fin</div>');
  });

  it('blocs de code : contenu tel quel, échappé', () => {
    expect(renderDiscord('```\n<b> **x** :scroll:\n```')).toBe(
      '<pre><code>&lt;b&gt; **x** :scroll:</code></pre>',
    );
    expect(renderDiscord('avant\n```js\nlet a;\nlet b;\n```\naprès')).toBe(
      '<div class="ln">avant</div><pre><code>let a;\nlet b;</code></pre><div class="ln">après</div>',
    );
  });

  it('liens masqués, URL nues, URL entre chevrons', () => {
    const a = (url: string, label = url): string =>
      `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    expect(renderDiscord('[**Note**](https://ex.com/a?b=1&c=2)')).toBe(
      `<div class="ln">${a('https://ex.com/a?b=1&amp;c=2', '<strong>Note</strong>')}</div>`,
    );
    expect(renderDiscord('[Note](<https://ex.com/a_b_c>)')).toBe(
      `<div class="ln">${a('https://ex.com/a_b_c', 'Note')}</div>`,
    );
    // La ponctuation qui suit une URL nue n'en fait pas partie.
    expect(renderDiscord('voir https://ex.com/a_b_c.')).toBe(
      `<div class="ln">voir ${a('https://ex.com/a_b_c')}.</div>`,
    );
    expect(renderDiscord('<https://ex.com>')).toBe(`<div class="ln">${a('https://ex.com')}</div>`);
    // Seuls http et https font un lien.
    expect(renderDiscord('[x](javascript:alert(1))')).not.toContain('<a');
  });

  it('sauts de ligne tels quels, ligne vide comprise', () => {
    expect(renderDiscord('a\n\nb')).toBe(
      '<div class="ln">a</div><div class="ln"><br></div><div class="ln">b</div>',
    );
  });

  it('emoji de serveur : son image ; `.gif` s’il est animé', () => {
    expect(renderDiscord(`<:dark:${DARK}>`)).toBe(
      `<div class="ln"><img class="emoji" alt=":dark:" title=":dark:" src="https://cdn.discordapp.com/emojis/${DARK}.webp?size=48"></div>`,
    );
    expect(renderDiscord(`<a:party:${PARTY}>`)).toContain(`/emojis/${PARTY}.gif?size=48`);
  });

  it('signale les codes restés en toutes lettres, là où ils sont', () => {
    const html = renderDiscord('## :typo: et :dark: à 10:30:00', {
      unknown: ['typo'],
      pending: ['dark'],
    });
    expect(html).toBe(
      '<h2><span class="bad" title="emoji inconnu">:typo:</span> et <span class="wait" title="inconnu sans jeton">:dark:</span> à 10:30:00</h2>',
    );
  });
});

describe('renderDiscord — échappement', () => {
  const HOSTILE = [
    '<script>alert(1)</script> & "x" \'y\'',
    '# <img src=x onerror=alert(1)>',
    '- <b>gras</b>',
    '> <iframe src="//evil"></iframe>',
    '[<i>x</i>](https://ex.com/"onmouseover="alert(1))',
    'https://ex.com/"><script>alert(1)</script>',
    '`<u>code</u>` et ```<s>bloc</s>```',
    '<:dark:1> <:x"onload="a:300000000000000001>',
    '\uE0000\uE001 \uE0020\uE003',
  ];

  it('le texte tapé ne produit JAMAIS de balise : seules les nôtres sortent', () => {
    const OURS =
      /^<\/?(?:h[123]|div|ul|li|blockquote|pre|code|strong|em|u|s|span|br|a|img)(?: (?:class|title|alt|href|target|rel|src)="[^"<>]*")*>$/;
    for (const source of HOSTILE) {
      const html = renderDiscord(source, { unknown: ['x'] });
      for (const tag of html.match(/<[^>]*>/g) ?? []) expect(tag, source).toMatch(OURS);
      expect(html, source).not.toMatch(/on\w+="/);
      expect(html, source).not.toMatch(/[\uE000-\uE003]/);
    }
  });

  it('rend les caractères spéciaux lisibles', () => {
    expect(renderDiscord('<script>alert(1)</script> & "x"')).toBe(
      '<div class="ln">&lt;script&gt;alert(1)&lt;/script&gt; &amp; &quot;x&quot;</div>',
    );
  });
});

describe('renderDiscord — le résumé de patch', () => {
  it('rend le sample entier, emojis convertis', () => {
    const p = prepare(SAMPLE, EMOJIS);
    expect(p.unknown).toEqual([]);
    expect(p.chunks).toHaveLength(1);

    const emoji = (name: string, id: string): string =>
      `<img class="emoji" alt=":${name}:" title=":${name}:" src="https://cdn.discordapp.com/emojis/${id}.webp?size=48">`;
    const a = (url: string, label = url): string =>
      `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    expect(renderDiscord(p.chunks[0])).toBe(
      [
        '<h1>📜 PATCH NOTES — TL;DR</h1>',
        `<div class="sub">${a('https://annoucements.outerplane.major7.kr/2026/10/05/1006pne/', 'Full Patch Note')}</div>`,
        '<h2>⭐ Banners &amp; Dungeons</h2>',
        `<ul><li><strong>Demiurge Lambda</strong> ${emoji('dark', DARK)} ${emoji('ranger', RANGER)} — new Demiurge hero`,
        '<ul><li>Pickup: <em>after maintenance</em> ~ ongoing</li></ul></li>',
        '<li>Irregular Extermination: <u>new season</u></li></ul>',
        '<h2>⚔️ Content</h2>',
        '<blockquote><div class="ln">Adventure License is retired.</div><div class="ln">Its shop moves to the Survey Hub.</div></blockquote>',
        '<h2>⚖️ Adjustments</h2>',
        '<ul><li>Skill cooldown <code>4</code> → <code>3</code></li></ul>',
        '<h2>💰 Shop</h2>',
        '<ul><li><s>Old package</s> replaced</li></ul>',
        '<h2>🐛 Bug Fixes</h2>',
        `<ul><li>Fixed a crash, see ${a('https://outerpedia.com/tools/patch-history')}.</li></ul>`,
      ].join(''),
    );
  });
});

// ---------------------------------------------------------------- emojis -----

describe('convertEmojis', () => {
  it('emoji du serveur → `<:nom:id>`, animé → `<a:nom:id>`', () => {
    expect(convertEmojis(':dark: :ranger: :party:', EMOJIS)).toEqual({
      content: `<:dark:${DARK}> <:ranger:${RANGER}> <a:party:${PARTY}>`,
      unknown: [],
      pending: [],
    });
    // La casse ne compte pas ; le nom écrit est celui du serveur.
    expect(convertEmojis(':Dark:', EMOJIS).content).toBe(`<:dark:${DARK}>`);
  });

  it('code standard → son caractère Unicode', () => {
    expect(convertEmojis(':scroll: :star: :crossed_swords: :flag_fr:', EMOJIS).content).toBe(
      '📜 ⭐ ⚔️ 🇫🇷',
    );
  });

  it('ni l’un ni l’autre : inconnu, laissé tel quel et nommé', () => {
    expect(convertEmojis(':scrol: puis :scrol: et :flag_zz:', EMOJIS)).toEqual({
      content: ':scrol: puis :scrol: et :flag_zz:',
      unknown: ['scrol', 'flag_zz'],
      pending: [],
    });
    // `Object.prototype` n'est pas une table d'emojis.
    expect(convertEmojis(':constructor:', EMOJIS).unknown).toEqual(['constructor']);
  });

  it('sans jeton : un nom non standard est « à vérifier », pas une faute', () => {
    expect(convertEmojis(':scroll: :dark: :scrol:', null)).toEqual({
      content: '📜 :dark: :scrol:',
      unknown: [],
      pending: ['dark', 'scrol'],
    });
  });

  it('ne touche ni au code, ni aux URL, ni aux heures, ni à ce qui est déjà converti', () => {
    const kept = [
      '`:scroll:`',
      '```\n:dark:\n```',
      'https://ex.com/a:scroll:b',
      'à 10:30:00 UTC',
      `<:dark:${DARK}>`,
      `<a:party:${PARTY}>`,
      '📜 tapé directement',
    ].join('\n');
    expect(convertEmojis(kept, EMOJIS)).toEqual({ content: kept, unknown: [], pending: [] });
  });

  it('`:scroll:` collé derrière un lien masqué est bien converti', () => {
    expect(convertEmojis('[x](https://ex.com/a):scroll:', EMOJIS).content).toBe(
      '[x](https://ex.com/a)📜',
    );
  });

  it('liste partielle (un serveur coché pas encore lu) : un nom inconnu attend, il n’est pas une faute', () => {
    expect(convertEmojis(':dark: :tactician:', EMOJIS, true)).toEqual({
      content: `<:dark:${DARK}> :tactician:`,
      unknown: [],
      pending: ['tactician'],
    });
  });
});

describe('mergeEmojis — plusieurs serveurs', () => {
  const home: GuildEmoji[] = [
    { id: TACTICIAN, name: 'tactician', animated: false },
    { id: HOME_DARK, name: 'dark', animated: false },
  ];

  it('dans l’ordre donné : un même nom sur deux serveurs, le premier gagne', () => {
    const first = mergeEmojis([[...EMOJIS.values()], home]);
    expect(first.get('dark')?.id).toBe(DARK);
    expect(first.get('tactician')?.id).toBe(TACTICIAN);
    expect(mergeEmojis([home, [...EMOJIS.values()]]).get('dark')?.id).toBe(HOME_DARK);
    expect(convertEmojis(':dark: :tactician:', first).content).toBe(
      `<:dark:${DARK}> <:tactician:${TACTICIAN}>`,
    );
  });

  it('à la casse près aussi, le premier gagne — mais le nom exact passe devant', () => {
    const table = mergeEmojis([
      [{ id: DARK, name: 'Dark', animated: false }],
      [{ id: HOME_DARK, name: 'DARK', animated: false }],
    ]);
    expect(convertEmojis(':dark:', table).content).toBe(`<:Dark:${DARK}>`);
    expect(convertEmojis(':DARK:', table).content).toBe(`<:DARK:${HOME_DARK}>`);
  });

  it('aucun serveur : la table est vide, pas inconnue — un nom de serveur est une faute', () => {
    expect(convertEmojis(':scroll: :dark:', mergeEmojis([]))).toEqual({
      content: '📜 :dark:',
      unknown: ['dark'],
      pending: [],
    });
  });
});

describe('convertPlain — là où Discord n’affiche pas les emojis de serveur', () => {
  it('convertit les standards, laisse et NOMME les codes de serveur', () => {
    expect(convertPlain(':scroll: Outerpedia :dark: :Ranger: :scrol:', EMOJIS)).toEqual({
      content: '📜 Outerpedia :dark: :Ranger: :scrol:',
      server: ['dark', 'Ranger'],
      unknown: ['scrol'],
      pending: [],
    });
    // Sans liste des serveurs, on ne sait pas : rien n'est accusé.
    expect(convertPlain(':dark:', null)).toEqual({
      content: ':dark:',
      server: [],
      unknown: [],
      pending: ['dark'],
    });
  });
});

describe('table des codes standard', () => {
  const table = shortcodes as Record<string, string>;

  it('porte les codes d’un résumé de patch', () => {
    expect(
      Object.fromEntries(
        [
          'scroll',
          'star',
          'crossed_swords',
          'scales',
          'moneybag',
          'bug',
          'warning',
          'gift',
          'calendar',
          'tada',
          'new',
          'fire',
          'sparkles',
          'tools',
          'hammer',
          'white_check_mark',
          'x',
          'arrow_up',
          'arrow_down',
          'information_source',
          'loudspeaker',
          'mega',
          'trophy',
          'gem',
          'shield',
          'dagger',
          'crown',
          'hourglass',
          'clock',
          'pushpin',
          'link',
        ].map((name) => [name, [...table[name]].map((c) => c.codePointAt(0)!.toString(16))]),
      ),
    ).toEqual({
      scroll: ['1f4dc'],
      star: ['2b50'],
      crossed_swords: ['2694', 'fe0f'],
      scales: ['2696', 'fe0f'],
      moneybag: ['1f4b0'],
      bug: ['1f41b'],
      warning: ['26a0', 'fe0f'],
      gift: ['1f381'],
      calendar: ['1f4c6'],
      tada: ['1f389'],
      new: ['1f195'],
      fire: ['1f525'],
      sparkles: ['2728'],
      tools: ['1f6e0', 'fe0f'],
      hammer: ['1f528'],
      white_check_mark: ['2705'],
      x: ['274c'],
      arrow_up: ['2b06', 'fe0f'],
      arrow_down: ['2b07', 'fe0f'],
      information_source: ['2139', 'fe0f'],
      loudspeaker: ['1f4e2'],
      mega: ['1f4e3'],
      trophy: ['1f3c6'],
      gem: ['1f48e'],
      shield: ['1f6e1', 'fe0f'],
      dagger: ['1f5e1', 'fe0f'],
      crown: ['1f451'],
      hourglass: ['231b'],
      clock: ['1f570', 'fe0f'],
      pushpin: ['1f4cc'],
      link: ['1f517'],
    });
  });

  it('se donne au sélecteur dans l’ordre du fichier, nom et caractère', () => {
    const list = standardEmojis();
    expect(list).toHaveLength(Object.keys(table).length);
    // Les noms tout en chiffres passent devant : JS range ainsi les clés d'un objet.
    expect(list.slice(0, 4)).toEqual([
      { name: '100', char: '💯' },
      { name: '1234', char: '🔢' },
      { name: 'scroll', char: '📜' },
      { name: 'star', char: '⭐' },
    ]);
    // Quelques codes ajoutés pour le sélecteur, au point de code près.
    const points = (name: string): string[] =>
      [...table[name]].map((c) => c.codePointAt(0)!.toString(16));
    expect(points('bulb')).toEqual(['1f4a1']);
    expect(points('skull_crossbones')).toEqual(['2620', 'fe0f']);
    expect(points('left_right_arrow')).toEqual(['2194', 'fe0f']);
    expect(points('hash')).toEqual(['23', 'fe0f', '20e3']);
    expect(points('pirate_flag')).toEqual(['1f3f4', '200d', '2620', 'fe0f']);
    // `:flag_xx:` reste calculé : aucun code de la table ne le masque.
    expect(Object.keys(table).filter((name) => /^flag_[a-z]{2}$/.test(name))).toEqual([]);
  });

  it('chaque valeur est UN emoji complet (sélecteur de variante compris)', () => {
    // `\p{RGI_Emoji}` : la liste d'Unicode des séquences recommandées — une
    // valeur tronquée, doublée ou sans son U+FE0F n'y est pas.
    const whole = new RegExp('^\\p{RGI_Emoji}$', 'v');
    const names = Object.keys(table);
    expect(names.length).toBeGreaterThanOrEqual(100);
    for (const name of names) {
      expect(name).toMatch(/^[a-z0-9_]+$/);
      expect(whole.test(table[name]), `:${name}:`).toBe(true);
    }
  });
});

// ------------------------------------------------------------- découpage -----

describe('splitMessage', () => {
  it('1 999 et 2 000 caractères : un seul message', () => {
    for (const n of [MESSAGE_LIMIT - 1, MESSAGE_LIMIT]) {
      const text = `${'a'.repeat(999)}\n${'b'.repeat(n - 1000)}`;
      expect(text).toHaveLength(n);
      expect(splitMessage(text)).toEqual({ chunks: [text] });
    }
  });

  it('2 001 caractères : deux messages, coupés au saut de ligne', () => {
    const text = `${'a'.repeat(1000)}\n${'b'.repeat(1000)}`;
    expect(text).toHaveLength(MESSAGE_LIMIT + 1);
    expect(splitMessage(text)).toEqual({ chunks: ['a'.repeat(1000), 'b'.repeat(1000)] });
  });

  it('une ligne seule de plus de 2 000 caractères : refus, ligne nommée', () => {
    expect(splitMessage('a'.repeat(MESSAGE_LIMIT)).chunks).toHaveLength(1);
    const split = splitMessage(`court\n${'a'.repeat(MESSAGE_LIMIT + 1)}`);
    expect(split.chunks).toEqual([]);
    expect(split.error).toMatch(/^La ligne 2 fait 2001 caractères/);
  });

  it('coupe de préférence juste AVANT un titre `## `', () => {
    const text = [
      '# Titre',
      '## A',
      'x'.repeat(900),
      '## B',
      'y'.repeat(900),
      '## C',
      'z'.repeat(900),
    ].join('\n');
    // `## C` rentrerait encore dans le premier message : on le garde avec sa section.
    expect(splitMessage(text).chunks).toEqual([
      ['# Titre', '## A', 'x'.repeat(900), '## B', 'y'.repeat(900)].join('\n'),
      ['## C', 'z'.repeat(900)].join('\n'),
    ]);
  });

  it('sans titre où couper : au dernier saut de ligne qui rentre', () => {
    const line = (c: string): string => c.repeat(900);
    expect(splitMessage([line('a'), line('b'), line('c')].join('\n')).chunks).toEqual([
      `${line('a')}\n${line('b')}`,
      line('c'),
    ]);
  });

  it('une section plus longue qu’un message est coupée entre deux lignes', () => {
    const lines = [
      '## A',
      ...Array.from({ length: 45 }, (_, i) => `- ${String(i).padEnd(98, '.')}`),
    ];
    const { chunks } = splitMessage(lines.join('\n'));
    expect(chunks.length).toBe(3);
    for (const c of chunks) expect(c.length).toBeLessThanOrEqual(MESSAGE_LIMIT);
    expect(chunks.join('\n').split('\n')).toEqual(lines);
  });

  it('les lignes vides en bord de message tombent ; un texte vide ne donne rien', () => {
    const text = `\n\n${'a'.repeat(1500)}\n\n\n${'b'.repeat(1500)}\n\n`;
    expect(splitMessage(text).chunks).toEqual(['a'.repeat(1500), 'b'.repeat(1500)]);
    expect(splitMessage(' \n\n ').chunks).toEqual([]);
    expect(blocker(prepare(' \n ', EMOJIS))).toBe('Message vide.');
  });

  it('compte la longueur APRÈS conversion des emojis', () => {
    const p = prepare(':dark:', EMOJIS);
    expect(p.content).toBe(`<:dark:${DARK}>`);
    expect(p.length).toBe(26);

    // 100 lignes de 12 caractères tapés : 1 299 à l'écran, 3 299 une fois converties.
    const text = Array.from({ length: 100 }, () => ':dark: texte').join('\n');
    expect(text.length).toBeLessThan(MESSAGE_LIMIT);
    const long = prepare(text, EMOJIS);
    expect(long.length).toBe(3299);
    expect(long.chunks).toHaveLength(2);
    for (const c of long.chunks) expect(c.length).toBeLessThanOrEqual(MESSAGE_LIMIT);
  });

  it('le sample, répété, se découpe par sections entières', () => {
    const body = SAMPLE.split('\n').slice(2).join('\n');
    const p = prepare(`${SAMPLE}\n${Array.from({ length: 6 }, () => body).join('\n')}`, EMOJIS);
    expect(p.error).toBeUndefined();
    expect(p.chunks.length).toBeGreaterThan(1);
    for (const c of p.chunks) expect(c.length).toBeLessThanOrEqual(MESSAGE_LIMIT);
    for (const c of p.chunks.slice(1)) expect(c.startsWith('## ')).toBe(true);
    expect(p.chunks.join('\n')).toBe(p.content);
  });
});

describe('blocker', () => {
  it('nomme l’emoji fautif, et laisse passer un texte propre', () => {
    expect(blocker(prepare(SAMPLE, EMOJIS))).toBeNull();
    expect(blocker(prepare(':scrol: :dark:', EMOJIS))).toMatch(
      /^Emoji inconnu : :scrol: — ni sur les serveurs cochés ni dans la table standard/,
    );
    expect(blocker(prepare(':dark:', null))).toMatch(/^Emojis du serveur non chargés : :dark:/);
  });
});

// --------------------------------------------------------------- requêtes ----

describe('buildRequest / messageBody', () => {
  it('POST : adresse, jeton en `Bot …`, corps JSON', () => {
    expect(buildRequest('T', 'POST', `/channels/${CHANNEL}/messages`, { content: 'x' })).toEqual({
      url: `https://discord.com/api/v10/channels/${CHANNEL}/messages`,
      init: {
        method: 'POST',
        headers: {
          Authorization: 'Bot T',
          'User-Agent': 'DiscordBot (https://outerpedia.com, 1.0)',
          'Content-Type': 'application/json',
        },
        body: '{"content":"x"}',
      },
    });
  });

  it('GET : ni corps ni type de contenu', () => {
    const { init } = buildRequest('T', 'GET', '/guilds/1/emojis');
    expect(init).toEqual({
      method: 'GET',
      headers: {
        Authorization: 'Bot T',
        'User-Agent': 'DiscordBot (https://outerpedia.com, 1.0)',
      },
    });
    expect(DISCORD_API).toBe('https://discord.com/api/v10');
  });

  it('aucune mention ne notifie ; le drapeau suit la case', () => {
    expect(messageBody('@everyone', true)).toEqual({
      content: '@everyone',
      allowed_mentions: { parse: [] },
      flags: 4,
    });
    expect(messageBody('x', false)).toEqual({ content: 'x', allowed_mentions: { parse: [] } });
    // À la modification, `0` RETIRE la suppression des aperçus.
    expect(messageBody('x', false, true)).toEqual({
      content: 'x',
      allowed_mentions: { parse: [] },
      flags: 0,
    });
    expect(messageBody('x', true, true).flags).toBe(4);
  });
});

// ------------------------------------------------------------------ envoi ----

/** Les corps d'un envoi en message simple, un par morceau. */
const bodies = (chunks: string[], suppressEmbeds = true, edit = false): unknown[] =>
  chunks.map((c) => messageBody(c, suppressEmbeds, edit));

describe('sendMessages', () => {
  const chunks = ['un', 'deux', 'trois'];
  const input = { guildId: GUILD_ID, channelId: CHANNEL, bodies: bodies(chunks) };

  it('poste dans l’ordre, espacé d’une seconde, et rend le lien de chaque message', async () => {
    const { deps, calls, sleeps } = harness(discord);
    const lines: string[] = [];
    const out = await sendMessages(deps, input, (line, doing) => void (doing || lines.push(line)));

    expect(calls.map((c) => [c.method, c.url])).toEqual(
      Array(3).fill(['POST', `https://discord.com/api/v10/channels/${CHANNEL}/messages`]),
    );
    expect(calls.map((c) => c.body)).toEqual(
      chunks.map((content) => ({ content, allowed_mentions: { parse: [] }, flags: 4 })),
    );
    for (const c of calls) expect(c.headers.Authorization).toBe(`Bot ${TOKEN}`);
    expect(sleeps).toEqual([1000, 1000]);

    const link = (n: number): string =>
      `https://discord.com/channels/${GUILD_ID}/${CHANNEL}/50000000000000000${n}`;
    expect(out).toEqual({
      ok: true,
      ids: ['500000000000000001', '500000000000000002', '500000000000000003'],
      urls: [link(1), link(2), link(3)],
      log: [1, 2, 3].map((n) => `message ${n}/3 posté : ${link(n)}`),
    });
    // Le journal au fil est celui qui est rendu.
    expect(lines).toEqual(out.log);
  });

  it('un 429 est attendu (`retry_after`) puis retenté une fois', async () => {
    const { deps, calls, sleeps } = harness((call, n) =>
      n === 1 ? { status: 429, body: { retry_after: 0.65 } } : discord(call, n),
    );
    const out = await sendMessages(deps, { ...input, bodies: bodies(['un']) });
    expect(out.ok).toBe(true);
    expect(calls).toHaveLength(2);
    expect(calls[1].body).toEqual(calls[0].body);
    expect(sleeps).toEqual([650]);
  });

  it('un second 429 de suite est un échec — pas de boucle', async () => {
    const { deps, calls } = harness(() => ({ status: 429, body: { retry_after: 2 } }));
    const out = await sendMessages(deps, { ...input, bodies: bodies(['un']) });
    expect(out.ok).toBe(false);
    expect(calls).toHaveLength(2);
    expect(out.log[0]).toMatch(/^ÉCHEC au message 1\/1 — Discord a répondu 429/);
    expect(out.log[1]).toBe('Rien n’a été posté.');
  });

  it('échec au deuxième morceau : on s’arrête ; la reprise ne reposte pas le premier', async () => {
    const first = harness((call, n) =>
      n === 2
        ? { status: 403, body: { message: 'Missing Permissions', code: 50013 } }
        : discord(call, n),
    );
    const failed = await sendMessages(first.deps, input);

    expect(failed.ok).toBe(false);
    // Le troisième n'est PAS parti : pas de trou au milieu du résumé.
    expect(first.calls.map((c) => (c.body as { content: string }).content)).toEqual(['un', 'deux']);
    expect(failed.ids).toEqual(['500000000000000001']);
    expect(failed.log).toEqual([
      `message 1/3 posté : https://discord.com/channels/${GUILD_ID}/${CHANNEL}/500000000000000001`,
      'ÉCHEC au message 2/3 — Discord a répondu 403 : Missing Permissions (code 50013) — permission manquante dans ce salon',
      'Partis : 1 sur 3. Un nouveau clic reprend au message 2, sans reposter les précédents.',
    ]);

    const second = harness((call, n) => discord(call, n + 5));
    const resumed = await sendMessages(second.deps, { ...input, already: failed.ids });

    expect(second.calls.map((c) => (c.body as { content: string }).content)).toEqual([
      'deux',
      'trois',
    ]);
    expect(resumed.ok).toBe(true);
    expect(resumed.ids).toEqual(['500000000000000001', '500000000000000006', '500000000000000007']);
    expect(resumed.log[0]).toBe('reprise : le message 1 est déjà posté, non renvoyé.');
  });

  it('tout est déjà parti, ou un identifiant est douteux : rien n’est appelé', async () => {
    const { deps, calls } = harness(discord);
    const done = await sendMessages(deps, {
      ...input,
      already: ['500000000000000001', '500000000000000002', '500000000000000003'],
    });
    expect(done.log).toEqual(['Tous les morceaux sont déjà postés.']);
    expect((await sendMessages(deps, { ...input, channelId: '../guilds/1' })).ok).toBe(false);
    expect((await sendMessages(deps, { ...input, guildId: 'x' })).ok).toBe(false);
    expect((await sendMessages(deps, { ...input, already: ['1/../2'] })).ok).toBe(false);
    expect(calls).toEqual([]);
  });

  it('Discord injoignable : l’erreur revient en clair, sans rien d’autre', async () => {
    const { deps } = harness(discord, {
      fetch: async () => {
        throw Object.assign(new TypeError('fetch failed'), { cause: { code: 'ENOTFOUND' } });
      },
    });
    const out = await sendMessages(deps, input);
    expect(out.log).toEqual([
      'ÉCHEC au message 1/3 — Discord injoignable : TypeError: fetch failed (ENOTFOUND)',
      'Rien n’a été posté.',
    ]);
  });
});

describe('editMessages', () => {
  const ids = ['500000000000000001', '500000000000000002'];

  it('modifie en place, morceau par morceau (`PATCH`)', async () => {
    const { deps, calls, sleeps } = harness(discord);
    const out = await editMessages(deps, {
      guildId: GUILD_ID,
      channelId: CHANNEL,
      ids,
      bodies: bodies(['un corrigé', 'deux'], false, true),
    });

    expect(calls.map((c) => [c.method, c.url])).toEqual(
      ids.map((id) => ['PATCH', `https://discord.com/api/v10/channels/${CHANNEL}/messages/${id}`]),
    );
    expect(calls.map((c) => c.body)).toEqual([
      { content: 'un corrigé', allowed_mentions: { parse: [] }, flags: 0 },
      { content: 'deux', allowed_mentions: { parse: [] }, flags: 0 },
    ]);
    expect(sleeps).toEqual([1000]);
    expect(out.ok).toBe(true);
    expect(out.ids).toEqual(ids);
    expect(out.log).toEqual(
      ids.map(
        (id, i) =>
          `message ${i + 1}/2 modifié : https://discord.com/channels/${GUILD_ID}/${CHANNEL}/${id}`,
      ),
    );
  });

  it('refuse si le nombre de morceaux a changé — ni suppression ni repost', async () => {
    const { deps, calls } = harness(discord);
    const out = await editMessages(deps, {
      guildId: GUILD_ID,
      channelId: CHANNEL,
      ids,
      bodies: bodies(['un', 'deux', 'trois'], true, true),
    });
    expect(out.ok).toBe(false);
    expect(out.log[0]).toMatch(
      /^Modification refusée : 2 messages sont postés, le texte en fait maintenant 3\./,
    );
    expect(calls).toEqual([]);
  });

  it('s’arrête au premier refus de Discord', async () => {
    const { deps, calls } = harness(() => ({
      status: 404,
      body: { message: 'Unknown Message', code: 10008 },
    }));
    const out = await editMessages(deps, {
      guildId: GUILD_ID,
      channelId: CHANNEL,
      ids,
      bodies: bodies(['un', 'deux'], true, true),
    });
    expect(calls).toHaveLength(1);
    expect(out.log).toEqual([
      'ÉCHEC au message 1/2 — Discord a répondu 404 : Unknown Message (code 10008) — message introuvable — supprimé depuis ?',
      'Rien n’a été modifié.',
    ]);
  });
});

// ---------------------------------------------------------------- serveur ----

describe('sortChannels', () => {
  it('range les salons comme la liste de Discord, texte et annonces seulement', () => {
    expect(
      sortChannels([
        { id: '13', type: 0, name: 'general', position: 2, parent_id: '2' },
        { id: '2', type: 4, name: 'Community', position: 1 },
        { id: '1', type: 4, name: 'News', position: 0 },
        { id: '12', type: 5, name: 'patch-notes', position: 1, parent_id: '1' },
        { id: '11', type: 0, name: 'rules', position: 0, parent_id: '1' },
        { id: '14', type: 2, name: 'Vocal', position: 0, parent_id: '2' },
        { id: '15', type: 15, name: 'forum', position: 0, parent_id: '2' },
        { id: '10', type: 0, name: 'welcome', position: 5 },
        // Même position : l'id départage.
        { id: '17', type: 0, name: 'b', position: 3, parent_id: '2' },
        { id: '16', type: 0, name: 'a', position: 3, parent_id: '2' },
      ]),
    ).toEqual([
      { id: '10', name: 'welcome', category: '', announcement: false },
      { id: '11', name: 'rules', category: 'News', announcement: false },
      { id: '12', name: 'patch-notes', category: 'News', announcement: true },
      { id: '13', name: 'general', category: 'Community', announcement: false },
      { id: '16', name: 'a', category: 'Community', announcement: false },
      { id: '17', name: 'b', category: 'Community', announcement: false },
    ]);
  });
});

describe('canUseExternalEmojis — la permission du bot dans UN salon', () => {
  const ADMIN = String(1 << 3);
  const access = (over: Partial<BotAccess> = {}): BotAccess => ({
    guildId: GUILD_ID,
    owner: false,
    permissions: 2048n,
    roles: [BOT_ROLE],
    userId: BOT_ID,
    ...over,
  });
  const role = (id: string, allow: string, deny: string) => ({ id, type: 0, allow, deny });
  const member = (id: string, allow: string, deny: string) => ({ id, type: 1, allow, deny });

  it('sans dérogation : les permissions du serveur', () => {
    expect(canUseExternalEmojis(access(), [])).toBe(false);
    expect(canUseExternalEmojis(access({ permissions: BigInt(EXTERNAL) | 2048n }), [])).toBe(true);
    // Une dérogation qui ne touche pas ce bit ne change rien.
    expect(canUseExternalEmojis(access(), [role(BOT_ROLE, '2048', '1024')])).toBe(false);
  });

  it('propriétaire et administrateur passent outre les dérogations', () => {
    const denied = [role(GUILD_ID, '0', EXTERNAL), member(BOT_ID, '0', EXTERNAL)];
    expect(canUseExternalEmojis(access({ owner: true, permissions: null }), denied)).toBe(true);
    expect(canUseExternalEmojis(access({ permissions: BigInt(ADMIN) }), denied)).toBe(true);
  });

  it('dérogations dans l’ordre : @everyone, puis les rôles du bot, puis le bot', () => {
    const granted = access({ permissions: BigInt(EXTERNAL) });
    // `@everyone` porte l'id du serveur.
    expect(canUseExternalEmojis(granted, [role(GUILD_ID, '0', EXTERNAL)])).toBe(false);
    expect(canUseExternalEmojis(access(), [role(GUILD_ID, EXTERNAL, '0')])).toBe(true);
    // Un rôle du bot rend ce que `@everyone` retire ; le rôle d'un autre, non.
    expect(
      canUseExternalEmojis(granted, [role(GUILD_ID, '0', EXTERNAL), role(BOT_ROLE, EXTERNAL, '0')]),
    ).toBe(true);
    expect(
      canUseExternalEmojis(granted, [
        role(GUILD_ID, '0', EXTERNAL),
        role('600000000000000099', EXTERNAL, '0'),
      ]),
    ).toBe(false);
    // Entre deux rôles du bot, l'accord l'emporte sur le refus.
    expect(
      canUseExternalEmojis(access({ roles: [BOT_ROLE, '600000000000000002'] }), [
        role(BOT_ROLE, '0', EXTERNAL),
        role('600000000000000002', EXTERNAL, '0'),
      ]),
    ).toBe(true);
    // La dérogation du bot lui-même a le dernier mot.
    expect(
      canUseExternalEmojis(granted, [role(BOT_ROLE, EXTERNAL, '0'), member(BOT_ID, '0', EXTERNAL)]),
    ).toBe(false);
    expect(canUseExternalEmojis(granted, [member('900000000000000099', '0', EXTERNAL)])).toBe(true);
  });

  it('dès qu’il manque de quoi trancher : `null`, on ne devine pas', () => {
    expect(canUseExternalEmojis(access({ permissions: null }), [])).toBeNull();
    expect(canUseExternalEmojis(access(), undefined)).toBeNull();
    // Rôles non lus, et une dérogation de rôle touche ce bit.
    expect(
      canUseExternalEmojis(access({ roles: null }), [role(BOT_ROLE, EXTERNAL, '0')]),
    ).toBeNull();
    expect(
      canUseExternalEmojis(access({ userId: null }), [member(BOT_ID, EXTERNAL, '0')]),
    ).toBeNull();
    // Rôles non lus, mais aucune dérogation de rôle ne touche ce bit : on sait.
    expect(canUseExternalEmojis(access({ roles: null }), [role(BOT_ROLE, '2048', '0')])).toBe(
      false,
    );
  });
});

// ---------------------------------------------------------------- session ----

describe('discordSession — sans jeton', () => {
  it('l’état le dit, le preview rend, l’envoi est refusé — et RIEN ne part sur le réseau', async () => {
    const { deps, calls } = harness(discord, { token: undefined });
    const session = discordSession(deps);

    expect(await session.state()).toEqual({
      hasToken: false,
      hint: 'jeton absent : ajoute DISCORD_BOT_TOKEN à .env.local',
      guilds: null,
      defaultGuild: null,
      invite: null,
    });
    expect(await session.state(true)).toMatchObject({ hasToken: false, guilds: null });
    expect(await session.channels(GUILD_ID)).toEqual({ error: TOKEN_HINT });
    expect(await session.emojis([GUILD_ID])).toEqual({ guilds: [] });

    const preview = session.preview(
      draft(`${patchTemplate('https://ex.com/note/')}\n- :dark: Lambda`),
    );
    expect(preview.messages).toBe(1);
    expect(preview.limit).toBe(MESSAGE_LIMIT);
    expect(preview.unknown).toEqual([]);
    expect(preview.pending).toEqual(['dark']);
    expect(preview.html).toContain('<h1>📜 PATCH NOTES — TL;DR</h1>');
    expect(preview.html).toContain('<h2>⚖️ Adjustments</h2>');
    expect(preview.html).toContain('<span class="wait" title="inconnu sans jeton">:dark:</span>');

    const sent = await session.send(toSend('x'));
    expect(sent).toEqual({ ok: false, log: [TOKEN_HINT], ids: [], urls: [], total: 0 });
    const edited = await session.edit(toEdit('x', ['500000000000000001']));
    expect(edited.log).toEqual([TOKEN_HINT]);

    expect(calls).toEqual([]);
  });
});

describe('discordSession — les serveurs du bot', () => {
  it('l’état rend leur liste — nom et id, RIEN d’autre —, le serveur par défaut et le lien d’invitation', async () => {
    const { deps, calls } = harness(discord);
    const session = discordSession(deps);

    const state = await session.state();
    expect(state).toEqual({
      hasToken: true,
      hint: null,
      guilds: [
        { id: GUILD_ID, name: 'EvaMains' },
        { id: HOME_GUILD, name: 'Chez Sevih' },
        { id: LOCKED_GUILD, name: 'Fermé' },
      ],
      // `DISCORD_GUILD_ID` : le choix du premier lancement, rien de plus.
      defaultGuild: GUILD_ID,
      invite: `https://discord.com/oauth2/authorize?client_id=${BOT_ID}&scope=bot&permissions=0`,
    });
    expect(JSON.stringify(state)).not.toContain(TOKEN);
    expect(inviteUrl('42')).toBe(
      'https://discord.com/oauth2/authorize?client_id=42&scope=bot&permissions=0',
    );

    // Lue une fois : ni salon ni emoji tant que la page ne les demande pas.
    await session.state();
    expect(gets(calls)).toEqual(['/users/@me', '/users/@me/guilds']);
  });

  it('un `DISCORD_GUILD_ID` absent, ou qui n’est pas un serveur du bot : aucun serveur par défaut', async () => {
    for (const guildId of [undefined, '100000000000000099']) {
      const { deps } = harness(discord, { guildId });
      const state = await discordSession(deps).state();
      expect(state.hint).toBeNull();
      expect(state.defaultGuild).toBeNull();
      expect(state.guilds).toHaveLength(3);
    }
  });

  it('« recharger la liste » relit les serveurs, et oublie salons et emojis lus', async () => {
    let invited = false;
    const { deps, calls } = harness((call, n) => {
      const r = discord(call, n);
      if (invited && call.url.endsWith('/users/@me/guilds'))
        (r.body as unknown[]).push({ id: '100000000000000004', name: 'Nouveau' });
      return r;
    });
    const session = discordSession(deps);
    await session.state();
    await session.channels(HOME_GUILD);
    await session.emojis([HOME_GUILD]);
    calls.length = 0;

    invited = true;
    expect((await session.state()).guilds).toHaveLength(3);
    expect(calls).toEqual([]);
    expect((await session.state(true)).guilds?.map((g) => g.name)).toContain('Nouveau');
    await session.channels(HOME_GUILD);
    await session.emojis([HOME_GUILD]);
    // L'id du bot, lui, ne change pas : il n'est pas redemandé.
    expect(gets(calls)).toEqual([
      '/users/@me/guilds',
      `/guilds/${HOME_GUILD}/channels`,
      `/guilds/${HOME_GUILD}/emojis`,
    ]);
  });

  it('un chargement raté n’est pas retenu : l’état suivant réessaie', async () => {
    let down = true;
    const { deps, calls } = harness((call, n) => (down ? { status: 500 } : discord(call, n)));
    const session = discordSession(deps);
    expect(await session.state()).toMatchObject({ hint: 'Discord a répondu 500', guilds: null });
    down = false;
    expect((await session.state()).hint).toBeNull();
    expect(gets(calls)).toEqual(['/users/@me', '/users/@me', '/users/@me/guilds']);
  });
});

describe('discordSession — le serveur où l’on poste', () => {
  it('rend les salons du serveur demandé, avec la permission d’emojis externes de chacun', async () => {
    const { deps, calls } = harness(discord);
    const session = discordSession(deps);

    expect(await session.channels(GUILD_ID)).toEqual({
      channels: [
        // Aucune permission au niveau du serveur, aucune dérogation ici.
        {
          id: OTHER_CHANNEL,
          name: 'bot-test',
          category: '',
          announcement: false,
          externalEmojis: false,
        },
        // Accordée par une dérogation du rôle du bot.
        {
          id: CHANNEL,
          name: 'patch-notes',
          category: 'News',
          announcement: true,
          externalEmojis: true,
        },
      ],
    });
    // Propriétaire : tout lui est permis, ses rôles ne sont pas lus.
    expect(await session.channels(HOME_GUILD)).toEqual({
      channels: [
        { id: HOME_CHANNEL, name: 'test', category: '', announcement: false, externalEmojis: true },
      ],
    });
    expect(gets(calls)).toEqual([
      '/users/@me',
      '/users/@me/guilds',
      `/guilds/${GUILD_ID}/channels`,
      `/guilds/${GUILD_ID}/members/${BOT_ID}`,
      `/guilds/${HOME_GUILD}/channels`,
    ]);
  });

  it('les salons sont lus UNE fois par serveur et par session, même demandés en même temps', async () => {
    const { deps, calls } = harness(discord);
    const session = discordSession(deps);
    await Promise.all([session.channels(GUILD_ID), session.channels(GUILD_ID)]);
    await session.channels(HOME_GUILD);
    await session.channels(GUILD_ID);
    await session.channels(HOME_GUILD);
    expect(gets(calls).filter((path) => path.endsWith('/channels'))).toEqual([
      `/guilds/${GUILD_ID}/channels`,
      `/guilds/${HOME_GUILD}/channels`,
    ]);
  });

  it('les rôles du bot illisibles : les salons sortent quand même, permission « inconnue » là où ils comptent', async () => {
    const { deps } = harness((call, n) =>
      call.url.includes('/members/') ? { status: 403 } : discord(call, n),
    );
    const res = await discordSession(deps).channels(GUILD_ID);
    if ('error' in res) throw new Error(res.error);
    expect(res.channels.map((c) => [c.name, c.externalEmojis])).toEqual([
      ['bot-test', false],
      ['patch-notes', null],
    ]);
  });

  it('refuse un serveur dont le bot n’est pas membre — rien n’est lu, rien ne part', async () => {
    const { deps, calls } = harness(discord);
    const session = discordSession(deps);
    const unknown = '100000000000000099';

    expect(await session.channels(unknown)).toEqual({
      error: expect.stringMatching(/^Serveur inconnu du bot/),
    });
    const sent = await session.send(toSend('ok', { guildId: unknown }));
    expect(sent.ok).toBe(false);
    expect(sent.log[0]).toMatch(/^Serveur inconnu du bot/);
    // Un identifiant qui n'en est pas un ne finit pas dans une adresse.
    expect((await session.send(toSend('ok', { guildId: `${GUILD_ID}/../x` }))).ok).toBe(false);
    expect(gets(calls)).toEqual(['/users/@me', '/users/@me/guilds']);
    expect(posts(calls)).toEqual([]);
  });

  it('refuse un salon qui n’appartient pas au serveur annoncé', async () => {
    const { deps, calls } = harness(discord);
    const session = discordSession(deps);

    // Le salon existe — sur l'AUTRE serveur.
    for (const req of [
      toSend('ok', { guildId: HOME_GUILD, channelId: CHANNEL }),
      toSend('ok', { guildId: GUILD_ID, channelId: HOME_CHANNEL }),
      toSend('ok', { channelId: '200000000000000099' }),
    ])
      expect((await session.send(req)).log).toEqual([
        'Ce salon n’appartient pas au serveur choisi : choisis-en un de la liste.',
      ]);
    expect(posts(calls)).toEqual([]);
  });

  it('poste sur le serveur choisi, pas sur celui de `DISCORD_GUILD_ID`', async () => {
    const { deps, calls } = harness(discord);
    const session = discordSession(deps);
    const sent = await session.send(
      toSend('bonjour', { guildId: HOME_GUILD, channelId: HOME_CHANNEL, emojiGuilds: [] }),
    );
    expect(sent.ok).toBe(true);
    expect(posts(calls).map((c) => c.url)).toEqual([
      `https://discord.com/api/v10/channels/${HOME_CHANNEL}/messages`,
    ]);
    expect(sent.urls).toEqual([
      `https://discord.com/channels/${HOME_GUILD}/${HOME_CHANNEL}/${sent.ids[0]}`,
    ]);
  });

  it('un message posté ne se modifie que LÀ où il est parti : refus hors du serveur et du salon d’origine', async () => {
    const { deps, calls } = harness(discord);
    const session = discordSession(deps);
    const sent = await session.send(toSend('v1'));
    expect(sent.ok).toBe(true);
    const origin = { guildId: GUILD_ID, channelId: CHANNEL, mode: 'simple' as const };

    // La page a changé de serveur, ou de salon : on ne modifie rien ailleurs.
    for (const elsewhere of [
      { guildId: HOME_GUILD, channelId: HOME_CHANNEL },
      { guildId: GUILD_ID, channelId: OTHER_CHANNEL },
    ]) {
      const out = await session.edit(toEdit('v2', sent.ids, { ...elsewhere, posted: origin }));
      expect(out.ok).toBe(false);
      expect(out.log[0]).toMatch(
        /^Modification refusée : ce message n’est pas parti du serveur et du salon choisis/,
      );
      expect(out.ids).toEqual(sent.ids);
    }
    expect(posts(calls)).toHaveLength(1);

    // Revenu à l'origine : la modification passe.
    const edited = await session.edit(toEdit('v2', sent.ids, { posted: origin }));
    expect(edited.ok).toBe(true);
    expect(posts(calls)[1].url).toBe(
      `https://discord.com/api/v10/channels/${CHANNEL}/messages/${sent.ids[0]}`,
    );
  });
});

describe('discordSession — les serveurs dont on prend les emojis', () => {
  it('ne lit que les serveurs cochés, UNE fois chacun par session', async () => {
    const { deps, calls } = harness(discord);
    const session = discordSession(deps);

    const first = await session.emojis([GUILD_ID]);
    expect(first).toEqual({
      guilds: [
        {
          id: GUILD_ID,
          // Nom, id, animé — triés par nom, sans l'emoji indisponible.
          emojis: [
            { id: DARK, name: 'dark', animated: false },
            { id: PARTY, name: 'party', animated: true },
            { id: RANGER, name: 'ranger', animated: false },
          ],
        },
      ],
    });
    await Promise.all([session.emojis([GUILD_ID]), session.emojis([GUILD_ID, HOME_GUILD])]);
    await session.emojis([HOME_GUILD, GUILD_ID]);
    // Un envoi les relit dans le cache, pas sur le réseau.
    await session.send(toSend(':dark:', { emojiGuilds: [GUILD_ID, HOME_GUILD] }));
    expect(gets(calls).filter((path) => path.endsWith('/emojis'))).toEqual([
      `/guilds/${GUILD_ID}/emojis`,
      `/guilds/${HOME_GUILD}/emojis`,
    ]);
  });

  it('ne rend d’un emoji que son nom, son id et s’il est animé', async () => {
    // Discord en dit plus (qui l'a créé, quels rôles y ont droit).
    const { deps } = harness((call, n) =>
      call.url.endsWith('/emojis')
        ? {
            status: 200,
            body: [
              {
                id: RANGER,
                name: 'ranger',
                animated: false,
                available: true,
                roles: ['600000000000000001'],
                user: { id: '700000000000000001', username: 'sevih' },
              },
              { id: PARTY, name: 'party', animated: true, managed: false },
              { id: DARK, name: 'Dark', require_colons: true },
              { id: '300000000000000009', name: 'gone', available: false },
            ],
          }
        : discord(call, n),
    );
    const out = await discordSession(deps).emojis([GUILD_ID]);
    expect(out.guilds).toEqual([
      {
        id: GUILD_ID,
        emojis: [
          { id: DARK, name: 'Dark', animated: false },
          { id: PARTY, name: 'party', animated: true },
          { id: RANGER, name: 'ranger', animated: false },
        ],
      },
    ]);
    expect(JSON.stringify(out)).not.toContain(TOKEN);
  });

  it('résout dans l’ordre de la LISTE des serveurs : un nom en double, le premier coché gagne', async () => {
    const { deps } = harness(discord);
    const session = discordSession(deps);
    // Demandés à l'envers : c'est l'ordre de la liste qui compte.
    const loaded = await session.emojis([HOME_GUILD, GUILD_ID]);
    expect(loaded.guilds.map((g) => g.id)).toEqual([GUILD_ID, HOME_GUILD]);

    const both = session.preview(
      draft(':dark: :tactician: :scroll:', { emojiGuilds: [HOME_GUILD, GUILD_ID] }),
    );
    expect(both.blocker).toBeNull();
    expect(both.html).toContain(`/emojis/${DARK}.webp`);
    expect(both.html).not.toContain(HOME_DARK);
    expect(both.html).toContain(`/emojis/${TACTICIAN}.webp`);
    // `tactician` vient d'un autre serveur que celui où l'on poste ; `dark`, non.
    expect(both.external).toEqual(['tactician']);

    // Le premier décoché, le second prend le nom.
    const home = session.preview(draft(':dark:', { emojiGuilds: [HOME_GUILD] }));
    expect(home.html).toContain(`/emojis/${HOME_DARK}.webp`);
    expect(home.external).toEqual(['dark']);
    // On poste CHEZ lui : son emoji n'y est plus externe.
    expect(
      session.preview(draft(':dark:', { guildId: HOME_GUILD, emojiGuilds: [HOME_GUILD] })).external,
    ).toEqual([]);
  });

  it('un serveur décoché n’existe plus : son emoji redevient une faute, qui bloque', async () => {
    const { deps, calls } = harness(discord);
    const session = discordSession(deps);
    await session.emojis([GUILD_ID, HOME_GUILD]);

    const preview = session.preview(draft(':dark: :tactician:'));
    expect(preview.unknown).toEqual(['tactician']);
    expect(preview.pending).toEqual([]);
    expect(preview.blocker).toMatch(/^Emoji inconnu : :tactician: — ni sur les serveurs cochés/);
    expect((await session.send(toSend(':tactician:'))).log[0]).toMatch(/^Emoji inconnu/);
    expect(posts(calls)).toEqual([]);
  });

  it('aucun serveur coché : seuls les emojis standard passent', async () => {
    const { deps, calls } = harness(discord);
    const session = discordSession(deps);
    await session.state();

    const preview = session.preview(draft(':scroll: :dark:', { emojiGuilds: [] }));
    expect(preview.html).toContain('📜');
    expect(preview.unknown).toEqual(['dark']);
    expect(preview.pending).toEqual([]);

    const sent = await session.send(toSend(':scroll: ok', { emojiGuilds: [] }));
    expect(sent.ok).toBe(true);
    expect(posts(calls)[0].body).toMatchObject({ content: '📜 ok' });
    // Aucune liste d'emojis n'a été lue.
    expect(gets(calls).filter((path) => path.endsWith('/emojis'))).toEqual([]);
  });

  it('un serveur qui refuse est dit en clair, n’est pas redemandé, et ne bloque pas les autres', async () => {
    const { deps, calls } = harness(discord);
    const session = discordSession(deps);

    const out = await session.emojis([LOCKED_GUILD, GUILD_ID]);
    expect(out.guilds).toEqual([
      expect.objectContaining({ id: GUILD_ID, emojis: expect.arrayContaining([]) }),
      {
        id: LOCKED_GUILD,
        emojis: [],
        error:
          'Discord a répondu 403 : Missing Access (code 50001) — le bot n’a pas accès à ce serveur',
      },
    ]);
    expect(out.guilds[0].error).toBeUndefined();
    expect((await session.emojis([LOCKED_GUILD])).guilds[0].error).toMatch(/403/);

    // Ses emojis ne viendront pas : un nom inconnu est une faute, pas une attente.
    const picked = { emojiGuilds: [LOCKED_GUILD, GUILD_ID] };
    const preview = session.preview(draft(':dark: :nope:', picked));
    expect(preview.html).toContain(`/emojis/${DARK}.webp`);
    expect(preview.unknown).toEqual(['nope']);
    expect((await session.send(toSend(':dark:', picked))).ok).toBe(true);
    expect(gets(calls).filter((path) => path.endsWith('/emojis'))).toEqual([
      `/guilds/${GUILD_ID}/emojis`,
      `/guilds/${LOCKED_GUILD}/emojis`,
    ]);
  });

  it('une panne passagère n’est pas un refus : elle est dite, et la demande suivante réessaie', async () => {
    let down = true;
    const { deps, calls } = harness((call, n) =>
      down && call.url.endsWith('/emojis') ? { status: 500 } : discord(call, n),
    );
    const session = discordSession(deps);
    expect((await session.emojis([GUILD_ID])).guilds).toEqual([
      { id: GUILD_ID, emojis: [], error: 'Discord a répondu 500' },
    ]);
    // Coché mais pas lu : son emoji attend, il n'est pas accusé.
    const waiting = session.preview(draft(':dark:'));
    expect(waiting.pending).toEqual(['dark']);
    expect(waiting.blocker).toMatch(/^Emojis du serveur non chargés : :dark:/);
    expect((await session.send(toSend(':dark:'))).ok).toBe(false);

    down = false;
    expect((await session.emojis([GUILD_ID])).guilds[0].emojis).toHaveLength(3);
    expect(session.preview(draft(':dark:')).blocker).toBeNull();
    expect(posts(calls)).toEqual([]);
  });

  it('un serveur inconnu du bot dans les cases cochées est ignoré', async () => {
    const { deps, calls } = harness(discord);
    const session = discordSession(deps);
    expect(await session.emojis(['100000000000000099', `${GUILD_ID}/../x`])).toEqual({
      guilds: [],
    });
    expect(gets(calls)).toEqual(['/users/@me', '/users/@me/guilds']);
  });
});

describe('discordSession — message simple', () => {
  it('le preview rend ce que l’envoi poste', async () => {
    const { deps } = harness(discord);
    const session = discordSession(deps);
    await session.emojis([GUILD_ID]);

    const preview = session.preview(draft(SAMPLE));
    expect(preview.blocker).toBeNull();
    expect(preview.pending).toEqual([]);
    expect(preview.external).toEqual([]);
    expect(preview.length).toBe(prepare(SAMPLE, EMOJIS).length);
    expect(preview.html).toContain(`/emojis/${DARK}.webp`);
    expect(preview.html).toMatch(/^<div class="dc-cut">message 1\/1 · \d+ caractères<\/div>/);
  });

  it('un emoji inconnu ou un texte vide bloquent AVANT tout envoi', async () => {
    const { deps, calls } = harness(discord);
    const session = discordSession(deps);
    const send = (text: string) => session.send(toSend(text));

    expect((await send(':scrol: oups')).log[0]).toMatch(/^Emoji inconnu : :scrol:/);
    expect((await send('  ')).log).toEqual(['Message vide.']);
    expect((await send('a'.repeat(2001))).log[0]).toMatch(/^La ligne 1 fait 2001 caractères/);
    expect(posts(calls)).toEqual([]);
  });

  it('envoie ce que le preview montre, puis le modifie en place', async () => {
    const { deps, calls } = harness(discord);
    const session = discordSession(deps);

    const sent = await session.send(toSend(SAMPLE));
    expect(sent.ok).toBe(true);
    expect(sent.total).toBe(1);
    expect(posts(calls).map((c) => c.body)).toEqual([
      { content: prepare(SAMPLE, EMOJIS).content, allowed_mentions: { parse: [] }, flags: 4 },
    ]);

    const edited = await session.edit(toEdit(SAMPLE.replace('crash', 'freeze'), sent.ids));
    expect(edited.ok).toBe(true);
    const patch = posts(calls)[1];
    expect([patch.method, patch.url]).toEqual([
      'PATCH',
      `https://discord.com/api/v10/channels/${CHANNEL}/messages/${sent.ids[0]}`,
    ]);
    expect((patch.body as { content: string }).content).toContain('Fixed a freeze');
  });

  it('reprise refusée si le découpage n’est plus celui de l’envoi interrompu', async () => {
    const { deps, calls } = harness(discord);
    const session = discordSession(deps);
    const out = await session.send(
      toSend('un seul message', { already: ['500000000000000001'], total: 2 }),
    );
    expect(out.ok).toBe(false);
    expect(out.log[0]).toMatch(/^Reprise refusée : l’envoi interrompu comptait 2 messages/);
    // Les ids déjà postés reviennent : la page ne les oublie pas.
    expect(out.ids).toEqual(['500000000000000001']);
    expect(posts(calls)).toEqual([]);
  });
});

describe('le jeton ne sort pas', () => {
  it('`scrub` le retire d’un texte', () => {
    expect(scrub(`Authorization: Bot ${TOKEN} !`, TOKEN)).toBe('Authorization: Bot «jeton» !');
    expect(scrub('rien', undefined)).toBe('rien');
  });

  it('ni dans une ligne de journal, ni dans une réponse de route — même si Discord ou `fetch` le renvoient', async () => {
    // Le pire cas : chaque message d'erreur qui revient CONTIENT le jeton.
    let posted = 0;
    const leaky = harness((call, n) => {
      if (call.url.endsWith(`/guilds/${LOCKED_GUILD}/emojis`))
        return { status: 403, body: { message: `No access with ${TOKEN}`, code: 50001 } };
      if (call.method === 'GET') return discord(call, n);
      if (call.method === 'PATCH')
        return { status: 400, body: { message: `bad header Bot ${TOKEN}`, code: 50035 } };
      return ++posted === 2
        ? { status: 403, body: { message: `Missing Access for ${TOKEN}`, code: 50001 } }
        : discord(call, n);
    });
    const session = discordSession(leaky.deps);
    const seen: unknown[] = [];
    const report = (line: string): void => void seen.push(line);
    const two = `${'a'.repeat(1500)}\n${'b'.repeat(1500)}`;

    seen.push(await session.state());
    seen.push(session.preview(draft(`${SAMPLE}\n${TOKEN}`)));
    seen.push(await session.channels(GUILD_ID));
    seen.push(await session.emojis([GUILD_ID, LOCKED_GUILD]));
    const sent = await session.send(toSend(two), report);
    seen.push(sent);
    seen.push(await session.edit(toEdit(two, [...sent.ids, sent.ids[0]]), report));
    seen.push(await session.edit(toEdit(two, [])));

    const thrown = harness(discord, {
      fetch: async (_url, init) => {
        throw new Error(`connect failed with headers ${JSON.stringify(init.headers)}`);
      },
    });
    const broken = discordSession(thrown.deps);
    seen.push(await broken.state());
    seen.push(await broken.channels(GUILD_ID));
    seen.push(
      await sendMessages(
        thrown.deps,
        { guildId: GUILD_ID, channelId: CHANNEL, bodies: bodies(['x']) },
        report,
      ),
    );

    // Le scénario a bien traversé les fuites possibles…
    const all = JSON.stringify(seen);
    expect(sent.ok).toBe(false);
    expect(all).toContain('Missing Access for «jeton»');
    expect(all).toContain('bad header Bot «jeton»');
    expect(all).toContain('No access with «jeton»');
    expect(all).toContain('connect failed with headers');
    // … et le jeton n'est nulle part, hormis dans le texte que l'auteur a tapé
    // lui-même (le preview rend ce qu'on lui donne).
    expect(all.split(TOKEN).length - 1).toBe(1);
    expect(JSON.stringify(seen.filter((_, i) => i !== 1))).not.toContain(TOKEN);
    // Il est bien parti là où il doit : dans l'en-tête, et seulement là.
    for (const c of leaky.calls) {
      expect(c.headers.Authorization).toBe(`Bot ${TOKEN}`);
      expect(c.url).not.toContain(TOKEN);
    }
  });
});

// ---------------------------------------------------------------- embed ------

/** Un formulaire rempli de bout en bout. */
const FULL = form({
  title: ':scroll: Patch notes',
  url: 'https://ex.com/note/',
  color: '#ff8800',
  thumbnail: 'https://ex.com/thumb.png',
  image: 'https://ex.com/banner.png',
  footer: 'Outerpedia :star:',
  content: ':dark: New patch',
  buttons: [
    { label: 'Full Patch Note', url: 'https://ex.com/note/' },
    { label: ':scroll: Wiki', url: 'https://outerpedia.com/' },
  ],
});

describe('prepareEmbed — le texte de l’éditeur devient la description', () => {
  it('un seul embed : chaque champ du formulaire à sa place, emojis convertis', () => {
    const p = prepareEmbed('## :star: Banners\n- :dark: Lambda', FULL, EMOJIS);
    expect(p.invalid).toEqual([]);
    expect(p.messages).toEqual([
      {
        content: `<:dark:${DARK}> New patch`,
        title: '📜 Patch notes',
        url: 'https://ex.com/note/',
        description: `## ⭐ Banners\n- <:dark:${DARK}> Lambda`,
        color: 0xff8800,
        thumbnail: 'https://ex.com/thumb.png',
        image: 'https://ex.com/banner.png',
        // Dans le pied et les libellés, les standards seulement.
        footer: 'Outerpedia ⭐',
        buttons: [
          { label: 'Full Patch Note', url: 'https://ex.com/note/' },
          { label: '📜 Wiki', url: 'https://outerpedia.com/' },
        ],
      },
    ]);
    // Longueurs APRÈS conversion : `:dark:` fait 26 caractères une fois parti.
    expect(p.length).toBe(p.messages[0].description.length);
    expect(p.total).toBe(
      '📜 Patch notes'.length + p.messages[0].description.length + 'Outerpedia ⭐'.length,
    );
    expect(embedBlocker(p)).toBeNull();
  });

  it('tout est facultatif : la description seule, ou un titre seul', () => {
    const alone = prepareEmbed('Bonjour', EMPTY_EMBED, EMOJIS);
    expect(alone.messages).toEqual([
      {
        content: '',
        title: '',
        url: '',
        description: 'Bonjour',
        color: embedColor(EMBED_COLOR),
        thumbnail: '',
        image: '',
        footer: '',
        buttons: [],
      },
    ]);
    expect(embedBlocker(alone)).toBeNull();

    const bare = prepareEmbed('  ', form({ title: 'Annonce' }), EMOJIS);
    expect(bare.messages.map((m) => [m.title, m.description])).toEqual([['Annonce', '']]);
    expect(embedBlocker(bare)).toBeNull();
  });

  it('rien du tout : message vide ; un texte du dessus ou un bouton sans carte : embed vide', () => {
    expect(embedBlocker(prepareEmbed('', EMPTY_EMBED, EMOJIS))).toBe('Message vide.');
    for (const lone of [
      form({ content: 'dessus' }),
      form({ buttons: [{ label: 'x', url: 'https://ex.com/' }] }),
    ])
      expect(embedBlocker(prepareEmbed('', lone, EMOJIS))).toMatch(/^Embed vide : /);
  });

  it('4 096 caractères de description : un embed ; 4 097 : deux, coupés au saut de ligne', () => {
    const line = (n: number): string => 'x'.repeat(n);
    const fits = prepareEmbed(
      `${line(2000)}\n${line(2095)}`.padEnd(EMBED_DESCRIPTION_LIMIT, 'y'),
      EMPTY_EMBED,
      EMOJIS,
    );
    expect(fits.length).toBe(4096);
    expect(fits.messages).toHaveLength(1);

    const over = prepareEmbed(`${line(2000)}\n${line(2096)}`, EMPTY_EMBED, EMOJIS);
    expect(over.length).toBe(4097);
    expect(over.messages.map((m) => m.description.length)).toEqual([2000, 2096]);
    expect(embedBlocker(over)).toBeNull();

    // Plus long qu'un MESSAGE simple (2 000), mais pas qu'une description.
    expect(prepareEmbed(line(3000), EMPTY_EMBED, EMOJIS).messages).toHaveLength(1);
  });

  it('une ligne seule de plus de 4 096 caractères : refus, ligne nommée', () => {
    const p = prepareEmbed(`ok\n${'x'.repeat(4097)}`, EMPTY_EMBED, EMOJIS);
    expect(p.messages).toEqual([]);
    expect(embedBlocker(p)).toMatch(
      /^La ligne 2 fait 4097 caractères à elle seule : Discord en accepte 4096 par description d’embed/,
    );
  });

  it('compte la description APRÈS conversion des emojis', () => {
    // 200 lignes de 12 caractères tapés : 2 599 à l'écran, 6 599 une fois converties.
    const text = Array.from({ length: 200 }, () => ':dark: texte').join('\n');
    expect(text.length).toBeLessThan(EMBED_DESCRIPTION_LIMIT);
    const p = prepareEmbed(text, EMPTY_EMBED, EMOJIS);
    expect(p.length).toBe(6599);
    expect(p.messages).toHaveLength(2);
    for (const m of p.messages)
      expect(m.description.length).toBeLessThanOrEqual(EMBED_DESCRIPTION_LIMIT);
  });

  it('plusieurs embeds : titre, lien, vignette et texte du dessus sur le PREMIER ; image, pied et boutons sur le DERNIER ; même couleur', () => {
    const section = (name: string): string => `## ${name}\n${'x'.repeat(3000)}`;
    const p = prepareEmbed([section('A'), section('B'), section('C')].join('\n'), FULL, EMOJIS);
    expect(p.invalid).toEqual([]);
    expect(p.messages).toHaveLength(3);
    const [first, middle, last] = p.messages;

    // Coupé de préférence AVANT un `## `, comme un message simple.
    expect(p.messages.map((m) => m.description.slice(0, 4))).toEqual(['## A', '## B', '## C']);

    expect(first).toMatchObject({
      content: `<:dark:${DARK}> New patch`,
      title: '📜 Patch notes',
      url: 'https://ex.com/note/',
      thumbnail: 'https://ex.com/thumb.png',
      image: '',
      footer: '',
      buttons: [],
    });
    expect(middle).toMatchObject({
      content: '',
      title: '',
      url: '',
      thumbnail: '',
      image: '',
      footer: '',
      buttons: [],
    });
    expect(last).toMatchObject({
      content: '',
      title: '',
      url: '',
      thumbnail: '',
      image: 'https://ex.com/banner.png',
      footer: 'Outerpedia ⭐',
    });
    expect(last.buttons).toHaveLength(2);
    expect(p.messages.map((m) => m.color)).toEqual([0xff8800, 0xff8800, 0xff8800]);
    // Le total affiché est celui de l'embed le plus chargé.
    expect(p.total).toBe(Math.max(...p.messages.map(embedTotal)));
  });

  it('6 000 caractères pour l’ensemble des textes d’un embed : au-delà, refus chiffré', () => {
    const fits = form({ title: 't'.repeat(256), footer: 'f'.repeat(1744) });
    const ok = prepareEmbed('d'.repeat(4000), fits, EMOJIS);
    expect(ok.total).toBe(EMBED_TOTAL_LIMIT);
    expect(embedBlocker(ok)).toBeNull();

    const over = prepareEmbed('d'.repeat(4000), { ...fits, footer: 'f'.repeat(1745) }, EMOJIS);
    expect(over.total).toBe(6001);
    expect(embedBlocker(over)).toBe(
      'Embed : 6001 caractères de texte en tout (titre, description, pied), Discord en accepte 6000. Raccourcis le pied ou le titre.',
    );

    // Découpé : c'est l'embed fautif qui est nommé (le dernier porte le pied).
    const split = prepareEmbed(
      `${'a'.repeat(4000)}\n${'b'.repeat(4000)}`,
      form({ footer: 'f'.repeat(2048) }),
      EMOJIS,
    );
    expect(embedBlocker(split)).toMatch(/^Embed du message 2\/2 : 6048 caractères de texte/);
  });

  it.each([
    ['Titre', { title: 't'.repeat(257) }, /^Titre : 257 caractères, Discord en accepte 256\.$/],
    ['Pied', { footer: 'f'.repeat(2049) }, /^Pied : 2049 caractères, Discord en accepte 2048\.$/],
    [
      'Texte du dessus',
      { content: 'c'.repeat(2001) },
      /^Texte au-dessus de l’embed : 2001 caractères, Discord en accepte 2000\.$/,
    ],
    [
      'Libellé',
      { buttons: [{ label: 'l'.repeat(81), url: 'https://ex.com/' }] },
      /^Bouton 1, libellé : 81 caractères, Discord en accepte 80\.$/,
    ],
  ])('%s trop long : refus, champ nommé', (_name, over, message) => {
    expect(embedBlocker(prepareEmbed('texte', form(over), EMOJIS))).toMatch(message);
  });

  it('le titre se compte emojis convertis : 250 caractères tapés peuvent en faire trop', () => {
    const title = `${'t'.repeat(244)}:dark:`;
    expect(title.length).toBe(250);
    expect(embedBlocker(prepareEmbed('x', form({ title }), EMOJIS))).toBe(
      'Titre : 270 caractères, Discord en accepte 256.',
    );
  });

  it.each([
    ['Lien du titre', { title: 'T', url: 'javascript:alert(1)' }],
    ['Vignette', { thumbnail: 'ex.com/thumb.png' }],
    ['Image', { image: 'ftp://ex.com/banner.png' }],
    ['Bouton 1, adresse', { buttons: [{ label: 'Wiki', url: 'outerpedia.com' }] }],
    [
      'Bouton 2, adresse',
      {
        buttons: [
          { label: 'a', url: 'https://ex.com/' },
          { label: 'b', url: 'data:text/html,x' },
        ],
      },
    ],
  ])('%s : une adresse qui n’est pas du http(s) bloque l’envoi, champ nommé', (name, over) => {
    const p = prepareEmbed('texte', form(over), EMOJIS);
    expect(embedBlocker(p)).toMatch(
      new RegExp(`^${name} : « .+ » n’est pas une adresse http\\(s\\)\\.$`),
    );
    // Le champ refusé ne part pas dans le rendu non plus.
    expect(JSON.stringify(p.messages)).not.toMatch(/javascript:|ftp:|data:/);
  });

  it('`isHttpUrl` : http et https, rien d’autre', () => {
    for (const ok of ['https://ex.com/a?b=c#d', 'http://localhost:3000/', 'HTTPS://EX.COM'])
      expect(isHttpUrl(ok)).toBe(true);
    for (const no of ['', 'ex.com', '//ex.com', 'https://', 'https://ex.com/a b', 'mailto:a@b.c'])
      expect(isHttpUrl(no)).toBe(false);
  });

  it('un lien de titre sans titre est refusé plutôt qu’oublié en silence', () => {
    expect(embedBlocker(prepareEmbed('x', form({ url: 'https://ex.com/' }), EMOJIS))).toBe(
      'Lien du titre : il lui faut un titre.',
    );
  });

  it('boutons : cinq au plus, les rangées vides passées, une rangée à moitié remplie nommée', () => {
    const b = (i: number) => ({ label: `B${i}`, url: `https://ex.com/${i}` });
    const empty = { label: ' ', url: '' };
    const five = prepareEmbed(
      'x',
      form({ buttons: [b(1), empty, b(2), b(3), b(4), b(5)] }),
      EMOJIS,
    );
    expect(five.invalid).toEqual([]);
    expect(five.messages[0].buttons.map((x) => x.label)).toEqual(['B1', 'B2', 'B3', 'B4', 'B5']);
    expect(BUTTON_MAX).toBe(5);

    const six = prepareEmbed('x', form({ buttons: [1, 2, 3, 4, 5, 6].map(b) }), EMOJIS);
    expect(embedBlocker(six)).toBe('Boutons : 6 remplis, Discord en accepte 5.');

    // La numérotation est celle de l'écran, rangées vides comprises.
    expect(
      embedBlocker(
        prepareEmbed('x', form({ buttons: [b(1), empty, { label: 'Wiki', url: '' }] }), EMOJIS),
      ),
    ).toBe('Bouton 3 : adresse manquante.');
    expect(
      embedBlocker(
        prepareEmbed('x', form({ buttons: [{ label: '', url: 'https://ex.com/' }] }), EMOJIS),
      ),
    ).toBe('Bouton 1 : libellé manquant.');
  });

  it('emojis : convertis dans la description, le titre et le texte du dessus ; un code de serveur dans le pied ou un libellé est signalé, PAS converti', () => {
    const p = prepareEmbed(
      ':dark: desc',
      form({ title: ':ranger: titre', content: ':party: dessus', footer: 'pied :dark: :bug:' }),
      EMOJIS,
    );
    expect(p.messages[0]).toMatchObject({
      description: `<:dark:${DARK}> desc`,
      title: `<:ranger:${RANGER}> titre`,
      content: `<a:party:${PARTY}> dessus`,
      footer: 'pied :dark: 🐛',
    });
    expect(embedBlocker(p)).toBe(
      'Pied : :dark: — Discord n’y affiche pas les emojis de serveur, retire ce code.',
    );

    const label = prepareEmbed(
      'x',
      form({ buttons: [{ label: ':dark: :ranger: Wiki', url: 'https://ex.com/' }] }),
      EMOJIS,
    );
    expect(embedBlocker(label)).toBe(
      'Bouton 1 : :dark:, :ranger: — Discord n’y affiche pas les emojis de serveur, retire ces codes.',
    );
  });

  it('un emoji inconnu bloque où qu’il soit ; sans jeton il attend', () => {
    for (const where of ['title', 'content', 'footer'] as const)
      expect(embedBlocker(prepareEmbed('x', form({ [where]: ':scrol:' }), EMOJIS))).toMatch(
        /^Emoji inconnu : :scrol:/,
      );
    expect(embedBlocker(prepareEmbed(':scrol:', EMPTY_EMBED, EMOJIS))).toMatch(/^Emoji inconnu/);
    const waiting = prepareEmbed(':dark:', form({ title: ':ranger:', footer: ':party:' }), null);
    expect(waiting.pending).toEqual(['dark', 'ranger', 'party']);
    expect(embedBlocker(waiting)).toMatch(/^Emojis du serveur non chargés/);
  });

  it('couleur : `#rrggbb` → l’entier ; toute autre écriture → le jeton `--accent` du site', () => {
    expect(embedColor('#ff8800')).toBe(0xff8800);
    expect(embedColor('00FF00')).toBe(0x00ff00);
    for (const odd of ['', 'red', '#fff', '#gggggg']) expect(embedColor(odd)).toBe(0x38bdf8);
    const css = readFileSync(resolve(import.meta.dirname, '../../src/app/globals.css'), 'utf8');
    expect(css).toContain(`--accent: ${EMBED_COLOR};`);
  });

  it('`embedForm` : ce qui arrive de la page est ramené à du texte', () => {
    expect(embedForm(null)).toEqual(EMPTY_EMBED);
    expect(
      embedForm({
        title: 'T',
        url: 42,
        color: '',
        footer: ['x'],
        buttons: [{ label: 'a', url: 'https://ex.com/', style: 1 }, 'nope', { label: 7 }],
        extra: true,
      }),
    ).toEqual({
      ...EMPTY_EMBED,
      title: 'T',
      buttons: [
        { label: 'a', url: 'https://ex.com/' },
        { label: '', url: '' },
        { label: '', url: '' },
      ],
    });
    expect(embedForm({ buttons: 'x' }).buttons).toEqual([]);
  });
});

describe('embedBody — le corps de la requête', () => {
  const [full] = prepareEmbed('## Desc', FULL, EMOJIS).messages;

  it('chaque champ à sa place ; boutons de style « lien » dans une rangée ; aucune mention ne notifie', () => {
    expect(embedBody(full)).toEqual({
      content: `<:dark:${DARK}> New patch`,
      embeds: [
        {
          title: '📜 Patch notes',
          url: 'https://ex.com/note/',
          description: '## Desc',
          color: 0xff8800,
          thumbnail: { url: 'https://ex.com/thumb.png' },
          image: { url: 'https://ex.com/banner.png' },
          footer: { text: 'Outerpedia ⭐' },
        },
      ],
      components: [
        {
          type: 1,
          components: [
            { type: 2, style: 5, label: 'Full Patch Note', url: 'https://ex.com/note/' },
            { type: 2, style: 5, label: '📜 Wiki', url: 'https://outerpedia.com/' },
          ],
        },
      ],
      allowed_mentions: { parse: [] },
    });
  });

  it('un champ vide n’est pas écrit', () => {
    const [bare] = prepareEmbed('Bonjour', EMPTY_EMBED, EMOJIS).messages;
    expect(embedBody(bare)).toEqual({
      embeds: [{ description: 'Bonjour', color: 0x38bdf8 }],
      allowed_mentions: { parse: [] },
    });
  });

  it('à la modification tout est écrit : un texte du dessus ou des boutons retirés ne restent pas en place', () => {
    const [bare] = prepareEmbed('Bonjour', EMPTY_EMBED, EMOJIS).messages;
    expect(embedBody(bare, true)).toEqual({
      content: '',
      embeds: [{ description: 'Bonjour', color: 0x38bdf8 }],
      components: [],
      allowed_mentions: { parse: [] },
      flags: 0,
    });
  });

  it('le drapeau « sans aperçu des liens » n’est JAMAIS posé : il masquerait l’embed', () => {
    expect(embedBody(full)).not.toHaveProperty('flags');
    expect(embedBody(full, true).flags).toBe(0);
  });
});

describe('renderEmbed — la carte comme Discord l’affiche', () => {
  const [full] = prepareEmbed('## :star: Banners\n- **Lambda** :dark:', FULL, EMOJIS).messages;
  const html = renderEmbed(full);

  it('barre de couleur, titre cliquable, description en markdown, vignette, image, pied, boutons, texte au-dessus', () => {
    expect(html).toBe(
      `<div class="dc-above"><div class="ln"><img class="emoji" alt=":dark:" title=":dark:" src="https://cdn.discordapp.com/emojis/${DARK}.webp?size=48"> New patch</div></div>` +
        '<div class="dc-embed" style="border-left-color:#ff8800">' +
        '<div class="dc-embed-head"><div class="dc-embed-text">' +
        '<div class="dc-embed-title"><a href="https://ex.com/note/" target="_blank" rel="noopener noreferrer">📜 Patch notes</a></div>' +
        `<div class="dc-embed-desc"><h2>⭐ Banners</h2><ul><li><strong>Lambda</strong> <img class="emoji" alt=":dark:" title=":dark:" src="https://cdn.discordapp.com/emojis/${DARK}.webp?size=48"></li></ul></div>` +
        '</div><img class="dc-embed-thumb" alt="" src="https://ex.com/thumb.png"></div>' +
        '<img class="dc-embed-image" alt="" src="https://ex.com/banner.png">' +
        '<div class="dc-embed-footer">Outerpedia ⭐</div>' +
        '</div>' +
        '<div class="dc-buttons">' +
        '<a class="dc-button" href="https://ex.com/note/" target="_blank" rel="noopener noreferrer">Full Patch Note</a>' +
        '<a class="dc-button" href="https://outerpedia.com/" target="_blank" rel="noopener noreferrer">📜 Wiki</a>' +
        '</div>',
    );
  });

  it('sans lien le titre n’est pas cliquable ; un champ absent ne laisse rien', () => {
    const [bare] = prepareEmbed(
      'Bonjour',
      form({ title: 'Annonce', color: '#000001' }),
      EMOJIS,
    ).messages;
    expect(renderEmbed(bare)).toBe(
      '<div class="dc-embed" style="border-left-color:#000001">' +
        '<div class="dc-embed-head"><div class="dc-embed-text">' +
        '<div class="dc-embed-title">Annonce</div>' +
        '<div class="dc-embed-desc"><div class="ln">Bonjour</div></div>' +
        '</div></div></div>',
    );
  });

  it('ce qui est tapé dans le formulaire ne produit JAMAIS de balise ni d’attribut', () => {
    const hostile = '"><script>alert(1)</script><img src=x onerror=alert(1)>';
    const p = prepareEmbed(
      hostile,
      form({
        title: hostile,
        url: `https://ex.com/?q="onmouseover="alert(1)`,
        thumbnail: `https://ex.com/t.png"onerror="alert(1)`,
        image: `https://ex.com/i.png?a='b'&c=<d>`,
        footer: hostile,
        content: hostile,
        color: '#123456"><script>',
        buttons: [{ label: hostile, url: `https://ex.com/"><script>` }],
      }),
      EMOJIS,
    );
    const out = embedPreviewHtml(p);
    expect(out).not.toMatch(/<script|<img src=x/);
    // Aucune adresse ne ferme son attribut.
    expect(out).not.toMatch(/(?:href|src)="[^"]*"(?:on\w+|>?<script)/);
    const tags = [...out.matchAll(/<([a-z0-9]+)(?:\s[^<>]*)?>/gi)].map((m) => m[1]);
    expect(new Set(tags)).toEqual(new Set(['div', 'a', 'img']));
    // Une couleur qui n'en est pas une retombe sur celle par défaut.
    expect(out).toContain('style="border-left-color:#38bdf8"');
  });

  it('le preview : un cadre par message, avec ses longueurs', () => {
    const p = prepareEmbed(
      `${'a'.repeat(4000)}\n${'b'.repeat(4000)}`,
      form({ title: 'T' }),
      EMOJIS,
    );
    const out = embedPreviewHtml(p);
    expect(out).toContain(
      '<div class="dc-cut">message 1/2 · embed · description 4000 caractères · textes 4001</div>',
    );
    expect(out).toContain(
      '<div class="dc-cut">message 2/2 · embed · description 4000 caractères · textes 4000</div>',
    );
    expect(out.match(/class="dc-embed"/g)).toHaveLength(2);
    expect(out.match(/class="dc-embed-title"/g)).toHaveLength(1);
  });
});

describe('discordSession — mode embed', () => {
  const embedDraft = { mode: 'embed' as const, embed: FULL };
  const origin = { guildId: GUILD_ID, channelId: CHANNEL, mode: 'embed' as const };

  it('le preview rend la carte, ses longueurs et ses plafonds', async () => {
    const { deps } = harness(discord);
    const session = discordSession(deps);
    await session.emojis([GUILD_ID]);

    const preview = session.preview(draft('## Desc :dark:', embedDraft));
    expect(preview).toMatchObject({
      messages: 1,
      limit: EMBED_DESCRIPTION_LIMIT,
      length: `## Desc <:dark:${DARK}>`.length,
      blocker: null,
      unknown: [],
      pending: [],
    });
    expect(preview.total).toBe(preview.length + '📜 Patch notes'.length + 'Outerpedia ⭐'.length);
    expect(preview.html).toContain('class="dc-embed"');
    expect(preview.html).toContain('class="dc-button"');

    // Un champ invalide bloque, nommé.
    expect(
      session.preview(draft('x', { mode: 'embed', embed: form({ image: 'banner.png' }) })).blocker,
    ).toBe('Image : « banner.png » n’est pas une adresse http(s).');
  });

  it('envoie ce que le preview montre — sans JAMAIS le drapeau d’aperçu, même case cochée', async () => {
    const { deps, calls } = harness(discord);
    const session = discordSession(deps);

    const sent = await session.send(
      toSend('## Desc :dark:', { ...embedDraft, suppressEmbeds: true }),
    );
    expect(sent.ok).toBe(true);
    expect(sent.total).toBe(1);
    const [message] = prepareEmbed('## Desc :dark:', FULL, EMOJIS).messages;
    expect(posts(calls).map((c) => [c.method, c.url, c.body])).toEqual([
      ['POST', `https://discord.com/api/v10/channels/${CHANNEL}/messages`, embedBody(message)],
    ]);
    expect(posts(calls)[0].body).not.toHaveProperty('flags');
    expect(posts(calls)[0].body).toMatchObject({ allowed_mentions: { parse: [] } });
  });

  it('un champ invalide bloque AVANT tout envoi', async () => {
    const { deps, calls } = harness(discord);
    const session = discordSession(deps);
    const bad = form({ title: 'T', url: 'pas une adresse' });
    const out = await session.send(toSend('x', { mode: 'embed', embed: bad }));
    expect(out.log).toEqual(['Lien du titre : « pas une adresse » n’est pas une adresse http(s).']);
    expect(posts(calls)).toEqual([]);
  });

  it('« Mettre à jour » modifie les embeds en place — même nombre de messages exigé', async () => {
    const { deps, calls } = harness(discord);
    const session = discordSession(deps);
    const two = `## A\n${'a'.repeat(3000)}\n## B\n${'b'.repeat(3000)}`;
    const sent = await session.send(toSend(two, embedDraft));
    expect(sent.ids).toHaveLength(2);

    // Boutons retirés entre-temps : la modification les efface du dernier message.
    const lighter = { ...FULL, buttons: [] };
    const edited = await session.edit(
      toEdit(two.replace('## B', '## B2'), sent.ids, {
        mode: 'embed',
        embed: lighter,
        posted: origin,
      }),
    );
    expect(edited.ok).toBe(true);
    const patches = posts(calls).slice(2);
    expect(patches.map((c) => [c.method, c.url])).toEqual(
      sent.ids.map((id) => [
        'PATCH',
        `https://discord.com/api/v10/channels/${CHANNEL}/messages/${id}`,
      ]),
    );
    const messages = prepareEmbed(two.replace('## B', '## B2'), lighter, EMOJIS).messages;
    expect(patches.map((c) => c.body)).toEqual(messages.map((m) => embedBody(m, true)));
    expect(patches[1].body).toMatchObject({ content: '', components: [], flags: 0 });

    const grown = await session.edit(
      toEdit(`${two}\n## C\n${'c'.repeat(3000)}`, sent.ids, { ...embedDraft, posted: origin }),
    );
    expect(grown.ok).toBe(false);
    expect(grown.log[0]).toMatch(
      /^Modification refusée : 2 messages sont postés, le texte en fait maintenant 3\./,
    );
    expect(posts(calls)).toHaveLength(4);
  });

  it('refuse de changer de mode sur un message déjà posté, dans un sens comme dans l’autre', async () => {
    const { deps, calls } = harness(discord);
    const session = discordSession(deps);
    const simple = await session.send(toSend('Bonjour'));
    const embed = await session.send(toSend('Bonjour', embedDraft));
    expect([simple.ok, embed.ok]).toEqual([true, true]);

    const toEmbed = await session.edit(toEdit('Bonjour', simple.ids, embedDraft));
    expect(toEmbed.ok).toBe(false);
    expect(toEmbed.log).toEqual([
      'Modification refusée : le message est parti en « message simple », l’éditeur est en « embed ». Un message posté ne change pas de mode — repasse en « message simple », ou « Nouveau message ».',
    ]);
    const toSimple = await session.edit(toEdit('Bonjour', embed.ids, { posted: origin }));
    expect(toSimple.log[0]).toMatch(/^Modification refusée : le message est parti en « embed »/);
    expect(toSimple.ids).toEqual(embed.ids);
    expect(posts(calls)).toHaveLength(2);
  });
});

// ---------------------------------------------------------------- palette ----

describe('parsePalette — `discord-palette.json`', () => {
  it('le fichier livré : quatre groupes, les noms du jeu et les six icônes du gabarit', () => {
    const { groups, error } = parsePalette(palette);
    expect(error).toBeNull();
    expect(groups.map((g) => [g.label, g.names.length])).toEqual([
      ['Éléments', 5],
      ['Classes', 5],
      ['Sous-classes', 10],
      ['Génériques', 6],
    ]);
    // Les génériques sont les icônes de section du gabarit : des emojis standard.
    const standard = new Set(standardEmojis().map((e) => e.name));
    for (const name of groups[3].names) expect(standard.has(name)).toBe(true);
    for (const name of groups[3].names)
      expect(patchTemplate('https://ex.com/')).toContain(`:${name}:`);
  });

  it('garde ce qui est lisible et dit ce qui ne l’est pas, sans tomber', () => {
    expect(
      parsePalette({
        groups: [
          { label: 'Éléments', names: ['dark', ':fire:', ' Light ', 'pas un nom', 7] },
          { names: ['x'] },
          { label: 'Vide' },
        ],
      }),
    ).toEqual({
      groups: [
        { label: 'Éléments', names: ['dark', 'fire', 'Light'] },
        { label: '', names: ['x'] },
      ],
      error:
        'discord-palette.json : nom illisible "pas un nom", nom illisible 7, groupe 3 sans « names ».',
    });
    for (const broken of [null, [], { groups: 'x' }, 'texte'])
      expect(parsePalette(broken)).toEqual({
        groups: [],
        error: 'discord-palette.json : il manque la liste « groups ».',
      });
  });
});

// ------------------------------------------------------- notes officielles ---

describe('notes officielles', () => {
  const post = (over: Partial<NotePost>): NotePost => ({
    id: 1,
    date: '2026-01-01',
    slug: 's',
    lang: 'en',
    type: 'notice',
    title: 't',
    content: '<p>c</p>',
    ...over,
  });

  it('adresse officielle : le permalien WordPress, date et slug du post', () => {
    // Lien relevé tel quel dans une note scrapée, qui cite celle du 22/09.
    expect(officialUrl({ date: '2026-09-21', slug: '0922pne' })).toBe(
      'https://annoucements.outerplane.major7.kr/2026/09/21/0922pne/',
    );
    // Un slug non ASCII est déjà encodé dans la donnée : il passe tel quel.
    expect(officialUrl({ date: '2026-10-02', slug: '%f0%9f%93%85-october' })).toBe(
      'https://annoucements.outerplane.major7.kr/2026/10/02/%f0%9f%93%85-october/',
    );
  });

  it('l’hôte est celui que `get-news` scrape', () => {
    const scraper = readFileSync(resolve(import.meta.dirname, '../get-news.ts'), 'utf8');
    expect(scraper).toContain(`const WP_API = 'https://${OFFICIAL_HOST}/wp-json/`);
  });

  it('liste les notes en anglais, les plus récentes d’abord', () => {
    const notes = latestNotes(
      [
        post({ id: 10, date: '2026-10-02', title: 'Hero' }),
        post({ id: 12, date: '2026-10-05', slug: '1006pne', type: 'update', title: 'Patch' }),
        post({ id: 13, date: '2026-10-05', lang: 'kr', title: '패치' }),
        post({ id: 11, date: '2026-10-02', title: 'Calendar' }),
        post({ id: 9, date: '2026-09-29', title: 'Old' }),
      ],
      3,
    );
    expect(notes).toEqual([
      {
        id: '12',
        date: '2026-10-05',
        type: 'update',
        title: 'Patch',
        url: 'https://annoucements.outerplane.major7.kr/2026/10/05/1006pne/',
      },
      expect.objectContaining({ id: '11', title: 'Calendar' }),
      expect.objectContaining({ id: '10', title: 'Hero' }),
    ]);
  });

  it('le cadre de la note interdit tout script, par sa CSP', () => {
    const doc = noteSrcdoc('<p>Hello</p><script>alert(1)</script>');
    expect(doc).toContain(
      `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src http: https: data:; media-src http: https:; style-src 'unsafe-inline'">`,
    );
    expect(doc).not.toMatch(/script-src/);
    expect(doc).toContain('<base target="_blank">');
    expect(doc).toContain('<body><p>Hello</p>');
  });

  it('le gabarit : sept lignes, le lien de la note en deuxième', () => {
    expect(patchTemplate('https://ex.com/note/').split('\n')).toEqual([
      '# :scroll: PATCH NOTES — TL;DR',
      '-# [Full Patch Note](https://ex.com/note/)',
      '## :star: Banners & Dungeons',
      '## :crossed_swords: Content',
      '## :scales: Adjustments',
      '## :moneybag: Shop',
      '## :bug: Bug Fixes',
    ]);
    // Aucun de ses codes n'attend la liste du serveur.
    expect(prepare(patchTemplate('https://ex.com/note/'), null).pending).toEqual([]);
  });

  it('en mode embed, « Full Patch Note » est un bouton de lien, plus un sous-texte', () => {
    const template = embedTemplate('https://ex.com/note/');
    expect(template).toEqual({
      text: [
        '# :scroll: PATCH NOTES — TL;DR',
        '## :star: Banners & Dungeons',
        '## :crossed_swords: Content',
        '## :scales: Adjustments',
        '## :moneybag: Shop',
        '## :bug: Bug Fixes',
      ].join('\n'),
      buttons: [{ label: 'Full Patch Note', url: 'https://ex.com/note/' }],
    });
    const p = prepareEmbed(template.text, form({ buttons: template.buttons }), null);
    expect(embedBlocker(p)).toBeNull();
    expect(embedBody(p.messages[0]).components).toEqual([
      {
        type: 1,
        components: [{ type: 2, style: 5, label: 'Full Patch Note', url: 'https://ex.com/note/' }],
      },
    ]);
  });
});
