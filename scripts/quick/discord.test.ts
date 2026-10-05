/**
 * Contrat de l'onglet « Discord » de `pnpm quick` (`discord.ts`).
 *
 * Ce geste écrit dans un salon PUBLIC, au nom du bot : ce qui raterait ici se
 * lirait là-bas. Quatre choses à ne pas laisser partir —
 *   - un emoji resté en toutes lettres (`:scrol:`), ou un message coupé au
 *     milieu d'une ligne ;
 *   - un doublon : un envoi repris après un échec ne reposte pas ce qui est
 *     déjà en place ;
 *   - une mention qui notifie ;
 *   - le jeton du bot, dans un journal ou une réponse de route.
 *
 * AUCUN appel à Discord : `fetch` et `sleep` sont simulés (`harness`).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import shortcodes from './discord-shortcodes.json';
import {
  DISCORD_API,
  GUILD_HINT,
  MESSAGE_LIMIT,
  OFFICIAL_HOST,
  TOKEN_HINT,
  blocker,
  buildRequest,
  convertEmojis,
  discordSession,
  editMessages,
  latestNotes,
  loadGuild,
  messageBody,
  noteSrcdoc,
  officialUrl,
  patchTemplate,
  prepare,
  renderDiscord,
  scrub,
  sendMessages,
  sortChannels,
  splitMessage,
  type DiscordDeps,
  type GuildEmoji,
  type NotePost,
} from './discord';

const TOKEN = 'MTIzNDU2.FAKE-token_for.tests';
const GUILD_ID = '100000000000000001';
const CHANNEL = '200000000000000001';
const OTHER_CHANNEL = '200000000000000002';
const DARK = '300000000000000001';
const RANGER = '300000000000000002';
const PARTY = '300000000000000003';

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

/** Un Discord docile : rend la liste du serveur et accepte tout message. */
function discord(call: Call, n: number): { status: number; body?: unknown } {
  if (call.url.endsWith('/emojis'))
    return {
      status: 200,
      body: [...EMOJIS.values(), { id: '300000000000000009', name: 'gone', available: false }],
    };
  if (call.url.endsWith('/channels'))
    return {
      status: 200,
      body: [
        { id: '400000000000000001', type: 4, name: 'News', position: 0 },
        { id: CHANNEL, type: 5, name: 'patch-notes', position: 0, parent_id: '400000000000000001' },
        { id: OTHER_CHANNEL, type: 0, name: 'bot-test', position: 3 },
      ],
    };
  return { status: 200, body: { id: `50000000000000000${n}` } };
}

const posts = (calls: Call[]): Call[] => calls.filter((c) => c.method !== 'GET');

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
    expect(blocker(prepare(':scrol: :dark:', EMOJIS))).toMatch(/^Emoji inconnu : :scrol: —/);
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

describe('sendMessages', () => {
  const input = { channelId: CHANNEL, chunks: ['un', 'deux', 'trois'], suppressEmbeds: true };

  it('poste dans l’ordre, espacé d’une seconde, et rend le lien de chaque message', async () => {
    const { deps, calls, sleeps } = harness(discord);
    const lines: string[] = [];
    const out = await sendMessages(deps, input, (line, doing) => void (doing || lines.push(line)));

    expect(calls.map((c) => [c.method, c.url])).toEqual(
      Array(3).fill(['POST', `https://discord.com/api/v10/channels/${CHANNEL}/messages`]),
    );
    expect(calls.map((c) => c.body)).toEqual(
      input.chunks.map((content) => ({ content, allowed_mentions: { parse: [] }, flags: 4 })),
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
    const out = await sendMessages(deps, { ...input, chunks: ['un'] });
    expect(out.ok).toBe(true);
    expect(calls).toHaveLength(2);
    expect(calls[1].body).toEqual(calls[0].body);
    expect(sleeps).toEqual([650]);
  });

  it('un second 429 de suite est un échec — pas de boucle', async () => {
    const { deps, calls } = harness(() => ({ status: 429, body: { retry_after: 2 } }));
    const out = await sendMessages(deps, { ...input, chunks: ['un'] });
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
      channelId: CHANNEL,
      ids,
      chunks: ['un corrigé', 'deux'],
      suppressEmbeds: false,
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
      channelId: CHANNEL,
      ids,
      chunks: ['un', 'deux', 'trois'],
      suppressEmbeds: true,
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
      channelId: CHANNEL,
      ids,
      chunks: ['un', 'deux'],
      suppressEmbeds: true,
    });
    expect(calls).toHaveLength(1);
    expect(out.log).toEqual([
      'ÉCHEC au message 1/2 — Discord a répondu 404 : Unknown Message (code 10008) — message introuvable — supprimé depuis ?',
      'Rien n’a été modifié.',
    ]);
  });
});

// ---------------------------------------------------------------- serveur ----

describe('loadGuild / sortChannels', () => {
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

  it('lit emojis et salons en deux GET, sans les emojis indisponibles', async () => {
    const { deps, calls } = harness(discord);
    const res = await loadGuild(deps);
    expect(calls.map((c) => [c.method, c.url])).toEqual([
      ['GET', `https://discord.com/api/v10/guilds/${GUILD_ID}/emojis`],
      ['GET', `https://discord.com/api/v10/guilds/${GUILD_ID}/channels`],
    ]);
    if (!res.ok) throw new Error(res.error);
    expect([...res.data.emojis.keys()]).toEqual(['dark', 'ranger', 'party']);
    expect(res.data.channels.map((c) => c.name)).toEqual(['bot-test', 'patch-notes']);
  });

  it('sans jeton ou sans serveur : dit ce qui manque, sans appeler', async () => {
    const none = harness(discord, { token: undefined });
    expect(await loadGuild(none.deps)).toEqual({ ok: false, error: TOKEN_HINT });
    const half = harness(discord, { guildId: undefined });
    expect(await loadGuild(half.deps)).toEqual({ ok: false, error: GUILD_HINT });
    expect([...none.calls, ...half.calls]).toEqual([]);
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
      channels: null,
      emojiCount: 0,
    });

    const preview = session.preview(`${patchTemplate('https://ex.com/note/')}\n- :dark: Lambda`);
    expect(preview.messages).toBe(1);
    expect(preview.unknown).toEqual([]);
    expect(preview.pending).toEqual(['dark']);
    expect(preview.html).toContain('<h1>📜 PATCH NOTES — TL;DR</h1>');
    expect(preview.html).toContain('<h2>⚖️ Adjustments</h2>');
    expect(preview.html).toContain('<span class="wait" title="inconnu sans jeton">:dark:</span>');

    const sent = await session.send({ text: 'x', channelId: CHANNEL, suppressEmbeds: true });
    expect(sent).toEqual({ ok: false, log: [TOKEN_HINT], ids: [], urls: [], total: 0 });
    const edited = await session.edit({
      text: 'x',
      channelId: CHANNEL,
      suppressEmbeds: true,
      ids: ['500000000000000001'],
    });
    expect(edited.log).toEqual([TOKEN_HINT]);

    expect(calls).toEqual([]);
  });
});

describe('discordSession — avec jeton', () => {
  it('lit le serveur UNE fois, puis convertit ses emojis', async () => {
    const { deps, calls } = harness(discord);
    const session = discordSession(deps);

    const state = await session.state();
    expect(state.hasToken).toBe(true);
    expect(state.hint).toBeNull();
    expect(state.emojiCount).toBe(3);
    expect(state.channels?.map((c) => c.id)).toEqual([OTHER_CHANNEL, CHANNEL]);
    await session.state();
    expect(calls).toHaveLength(2);

    const preview = session.preview(SAMPLE);
    expect(preview.blocker).toBeNull();
    expect(preview.pending).toEqual([]);
    expect(preview.length).toBe(prepare(SAMPLE, EMOJIS).length);
    expect(preview.html).toContain(`/emojis/${DARK}.webp`);
    expect(preview.html).toMatch(/^<div class="dc-cut">message 1\/1 · \d+ caractères<\/div>/);
  });

  it('un chargement raté n’est pas retenu : l’état suivant réessaie', async () => {
    let down = true;
    const { deps, calls } = harness((call, n) => (down ? { status: 500 } : discord(call, n)));
    const session = discordSession(deps);
    expect((await session.state()).hint).toBe('Discord a répondu 500');
    down = false;
    expect((await session.state()).hint).toBeNull();
    expect(calls).toHaveLength(3);
  });

  it('un emoji inconnu, un salon hors liste ou un texte vide bloquent AVANT tout envoi', async () => {
    const { deps, calls } = harness(discord);
    const session = discordSession(deps);
    await session.state();
    const send = (text: string, channelId = CHANNEL) =>
      session.send({ text, channelId, suppressEmbeds: true });

    expect((await send(':scrol: oups')).log[0]).toMatch(/^Emoji inconnu : :scrol:/);
    expect((await send('ok', '200000000000000099')).log).toEqual(['Choisis un salon de la liste.']);
    expect((await send('  ')).log).toEqual(['Message vide.']);
    expect((await send('a'.repeat(2001))).log[0]).toMatch(/^La ligne 1 fait 2001 caractères/);
    expect(posts(calls)).toEqual([]);
  });

  it('envoie ce que le preview montre, puis le modifie en place', async () => {
    const { deps, calls } = harness(discord);
    const session = discordSession(deps);
    await session.state();

    const sent = await session.send({ text: SAMPLE, channelId: CHANNEL, suppressEmbeds: true });
    expect(sent.ok).toBe(true);
    expect(sent.total).toBe(1);
    expect(posts(calls).map((c) => c.body)).toEqual([
      { content: prepare(SAMPLE, EMOJIS).content, allowed_mentions: { parse: [] }, flags: 4 },
    ]);

    const edited = await session.edit({
      text: SAMPLE.replace('crash', 'freeze'),
      channelId: CHANNEL,
      suppressEmbeds: true,
      ids: sent.ids,
    });
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
    await session.state();
    const out = await session.send({
      text: 'un seul message',
      channelId: CHANNEL,
      suppressEmbeds: true,
      already: ['500000000000000001'],
      total: 2,
    });
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
    const leaky = harness((call, n) => {
      if (call.method === 'GET') return discord(call, n);
      if (call.method === 'PATCH')
        return { status: 400, body: { message: `bad header Bot ${TOKEN}`, code: 50035 } };
      return n === 4
        ? { status: 403, body: { message: `Missing Access for ${TOKEN}`, code: 50001 } }
        : discord(call, n);
    });
    const session = discordSession(leaky.deps);
    const seen: unknown[] = [];
    const report = (line: string): void => void seen.push(line);
    const two = `${'a'.repeat(1500)}\n${'b'.repeat(1500)}`;

    seen.push(await session.state());
    seen.push(session.preview(`${SAMPLE}\n${TOKEN}`));
    const sent = await session.send(
      { text: two, channelId: CHANNEL, suppressEmbeds: true },
      report,
    );
    seen.push(sent);
    seen.push(
      await session.edit(
        { text: two, channelId: CHANNEL, suppressEmbeds: true, ids: [...sent.ids, sent.ids[0]] },
        report,
      ),
    );
    seen.push(await session.edit({ text: two, channelId: CHANNEL, suppressEmbeds: true, ids: [] }));

    const thrown = harness(discord, {
      fetch: async (_url, init) => {
        throw new Error(`connect failed with headers ${JSON.stringify(init.headers)}`);
      },
    });
    const broken = discordSession(thrown.deps);
    seen.push(await broken.state());
    seen.push(
      await sendMessages(
        thrown.deps,
        { channelId: CHANNEL, chunks: ['x'], suppressEmbeds: true },
        report,
      ),
    );

    // Le scénario a bien traversé les trois fuites possibles…
    const all = JSON.stringify(seen);
    expect(sent.ok).toBe(false);
    expect(all).toContain('Missing Access for «jeton»');
    expect(all).toContain('bad header Bot «jeton»');
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
});
