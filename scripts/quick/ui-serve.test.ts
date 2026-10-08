import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { Window } from 'happy-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { GitState } from './actions';
import { READ_ONLY_POSTS, openTab, tabsOf as menuTabs } from './shot.mjs';
import { UI_TYPES, assemblePage, resolveUiFile, tabsOf } from './ui-serve';

const UI = resolve(import.meta.dirname, 'ui');
const TABS = [
  'dashboard',
  'coupons',
  'banners',
  'comics',
  'videos',
  'ranks',
  'gear',
  'discord',
  'names',
];

/** Comme `server.ts` : `tabs/<nom>.html`, ou `null` s'il manque. */
const readTab = (name: string): string | null => {
  const file = resolve(UI, 'tabs', `${name}.html`);
  return existsSync(file) ? readFileSync(file, 'utf8') : null;
};
const shell = (): string => readFileSync(resolve(UI, 'index.html'), 'utf8');

describe('assemblePage — la coquille et ses onglets', () => {
  it('remplace chaque marqueur par le markup de son onglet, dans l’ordre', () => {
    const page = assemblePage('<main>\n<!-- @tab a -->\n<!-- @tab b -->\n<p>fin</p></main>', (n) =>
      n === 'a' ? '<section id="tab-a">A</section>\n' : '<section id="tab-b" hidden>B</section>\n',
    );
    expect(page).toBe(
      '<main>\n<section id="tab-a">A</section>\n<section id="tab-b" hidden>B</section>\n<p>fin</p></main>',
    );
  });

  it('pose le markup tel quel, `$&` et consorts compris', () => {
    // Une chaîne de remplacement lirait `$&` et `$1` comme des renvois.
    expect(assemblePage('<!-- @tab a -->', () => '<b title="$& $1 $$">x</b>')).toBe(
      '<b title="$& $1 $$">x</b>',
    );
  });

  it('refuse un onglet réclamé sans fichier, en le nommant', () => {
    expect(() => assemblePage('<!-- @tab coupons --><!-- @tab nope -->', () => null)).toThrow(
      /« coupons ».*tabs\/coupons\.html manque/,
    );
    expect(() =>
      assemblePage('<!-- @tab coupons --><!-- @tab nope -->', (n) => (n === 'nope' ? null : 'ok')),
    ).toThrow(/« nope »/);
  });

  it('refuse un marqueur mal écrit plutôt que de le laisser dans la page', () => {
    for (const bad of ['<!-- @tab Ranks -->', '<!--@tab ranks-->', '<!-- @tab ../x -->'])
      expect(() => assemblePage(`<main>${bad}</main>`, () => 'ok')).toThrow(/illisible/);
    // Et un onglet ne peut pas en glisser un autre.
    expect(() => assemblePage('<!-- @tab a -->', () => '<!-- @tab b -->')).toThrow(/illisible/);
  });

  it('assemble la vraie page : neuf sections, plus aucun marqueur', () => {
    expect(tabsOf(shell())).toEqual(TABS);
    const page = assemblePage(shell(), readTab);
    expect(page).not.toContain('@tab');
    expect(
      [...page.matchAll(/<section id="tab-([a-z0-9-]+)"( hidden)?>/g)].map((m) => m[1]),
    ).toEqual(TABS);
    // Une seule section sans `hidden`, la première : c'est elle que la page ouvre.
    expect(page.match(/<section id="tab-[a-z0-9-]+">/g)).toEqual(['<section id="tab-dashboard">']);
    // Les sections sont dans `<main>` ; le journal est AVANT lui, sous `#tabs`.
    expect(page.indexOf('<main>')).toBeLessThan(page.indexOf('<section id="tab-dashboard">'));
    expect(page.indexOf('id="tabs"')).toBeLessThan(page.indexOf('<aside class="journal"'));
    expect(page.indexOf('</aside>')).toBeLessThan(page.indexOf('<main>'));
    expect(page.indexOf('<div id="log"')).toBeLessThan(page.indexOf('</aside>'));
  });

  it('chaque onglet de la coquille a ses trois fichiers, son entrée du menu et son import', () => {
    const page = shell();
    for (const tab of TABS) {
      expect(existsSync(resolve(UI, 'tabs', `${tab}.js`)), `${tab}.js`).toBe(true);
      expect(readTab(tab), `${tab}.html`).toMatch(new RegExp(`^<section id="tab-${tab}"`));
      expect(existsSync(resolve(UI, 'tabs', `${tab}.css`)), `${tab}.css`).toBe(true);
      expect(page).toContain(`<link rel="stylesheet" href="/ui/tabs/${tab}.css" />`);
      expect(page).toContain(`import '/ui/tabs/${tab}.js';`);
      // Le menu : `lib.js` pose les deux rangées d'après son tableau `GROUPS`.
      expect(readFileSync(resolve(UI, 'lib.js'), 'utf8')).toContain(`{ id: '${tab}', label: '`);
      expect(readFileSync(resolve(UI, 'tabs', `${tab}.js`), 'utf8')).toContain(
        `sections.register('${tab}', {`,
      );
    }
    expect(menuTabs(assemblePage(page, readTab))).toEqual(TABS);
    // Et rien dans `tabs/` que la coquille ne réclame pas.
    expect(readdirSync(resolve(UI, 'tabs')).sort()).toEqual(
      TABS.flatMap((t) => [`${t}.css`, `${t}.html`, `${t}.js`]).sort(),
    );
  });
});

describe('resolveUiFile — la garde de GET /ui/…', () => {
  const root = resolve('/srv/quick/ui');
  const under = (...parts: string[]): string => [root, ...parts].join(sep);

  it('rend le fichier et son type pour ce que la page charge', () => {
    expect(resolveUiFile(root, 'quick.css')).toEqual({
      file: under('quick.css'),
      type: 'text/css; charset=utf-8',
    });
    expect(resolveUiFile(root, 'lib.js')).toEqual({
      file: under('lib.js'),
      type: 'text/javascript; charset=utf-8',
    });
    expect(resolveUiFile(root, 'tabs/ranks.js')?.file).toBe(under('tabs', 'ranks.js'));
    expect(resolveUiFile(root, 'tabs/./ranks.js')?.file).toBe(under('tabs', 'ranks.js'));
  });

  it('donne à chaque extension de la liste son type MIME exact', () => {
    expect(Object.fromEntries(UI_TYPES)).toEqual({
      '.css': 'text/css; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.mjs': 'text/javascript; charset=utf-8',
      '.woff2': 'font/woff2',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
    });
    for (const [ext, type] of UI_TYPES)
      expect(resolveUiFile(root, `fonts/a${ext.toUpperCase()}`)?.type).toBe(type);
  });

  it('refuse une extension hors liste', () => {
    for (const path of [
      'index.html',
      'tabs/ranks.html',
      'lib.ts',
      'lib.js.map',
      'data.json',
      'lib',
      'tabs',
      'tabs/',
      '.css/x',
      '',
    ])
      expect(resolveUiFile(root, path), path).toBeNull();
  });

  it('refuse `..`, sous toutes ses écritures', () => {
    for (const path of [
      '../server.ts',
      '../discord-editor.mjs',
      'tabs/../../discord-editor.mjs',
      'tabs/../lib.js',
      '%2e%2e/discord-editor.mjs',
      '..%2fdiscord-editor.mjs',
      '%2e%2e%2fdiscord-editor.mjs',
      'tabs%2f..%2f..%2fdiscord-editor.mjs',
      '..\\discord-editor.mjs',
      '..%5cdiscord-editor.mjs',
    ])
      expect(resolveUiFile(root, path), path).toBeNull();
  });

  it('refuse un chemin qui sort du dossier', () => {
    for (const path of [
      '/etc/quick.css',
      '%2fetc%2fquick.css',
      '//etc/quick.css',
      `${root}-old/quick.css`,
      'quick.css%00.png',
      '%zz.css',
    ])
      expect(resolveUiFile(root, path), path).toBeNull();
  });
});

describe('shot — la page que le banc de captures photographie', () => {
  const page = (): string => assemblePage(shell(), readTab);

  it('ouvre l’onglet demandé dans le HTML, et lui seul', () => {
    const html = openTab(page(), 'ranks', 2500);
    expect(html).toContain('<section id="tab-ranks">');
    expect(html.match(/<section id="tab-[a-z0-9-]+" hidden>/g)).toHaveLength(TABS.length - 1);
  });

  it('pose l’image d’attente juste avant </body>', () => {
    expect(openTab(page(), 'coupons', 1200)).toMatch(
      /<img src="\/__settle\?ms=1200" alt="" hidden \/>\n<\/body>/,
    );
  });

  it('refuse un onglet que la page ne porte pas', () => {
    expect(() => openTab(page(), 'nope', 0)).toThrow(/onglet inconnu/);
  });

  it('ne relaie ni « Pousser » ni un enregistrement : aucun n’est une lecture', () => {
    for (const path of [
      '/api/push',
      '/api/coupons',
      '/api/banners',
      '/api/comics',
      '/api/video',
      '/api/ranks',
      '/api/gear-reco',
      '/api/names',
      '/api/discord/send',
      '/api/quit',
    ])
      expect(READ_ONLY_POSTS.has(path), path).toBe(false);
  });

  it('relaie le verdict d’un nom court saisi : il ne fait que lire', () => {
    expect(READ_ONLY_POSTS.has('/api/names/fit')).toBe(true);
  });
});

describe('gitBar — le bouton « Pousser » de l’en-tête', () => {
  afterEach(() => vi.unstubAllGlobals());

  /**
   * `gitBar` de la page, sur l'en-tête de la VRAIE coquille posé dans un
   * document happy-dom. `lib.js` est du JavaScript de navigateur, hors du
   * typage des scripts : il se charge par son chemin, et ne lit `document`
   * qu'à l'appel.
   */
  async function bar() {
    const { document } = new Window();
    document.body.innerHTML = /<header class="top">[\s\S]*?<\/header>/.exec(shell())?.[0] ?? '';
    vi.stubGlobal('document', document);
    const lib = (await import(/* @vite-ignore */ resolve(UI, 'lib.js'))) as {
      gitBar: (git: GitState) => void;
    };
    const button = document.getElementById('push') as unknown as HTMLButtonElement;
    const count = document.getElementById('push-count') as unknown as HTMLElement;
    return { gitBar: lib.gitBar, button, count };
  }

  it('est éteint tant que l’état de git n’est pas arrivé', async () => {
    const { button, count } = await bar();
    expect(button.className).toBe('btn primary sm');
    expect(button.disabled).toBe(true);
    expect(count.textContent).toBe('0');
    // Avant `#env` : pastilles, « Pousser », le poste, « Quitter ».
    expect(shell().indexOf('id="push"')).toBeLessThan(shell().indexOf('id="env"'));
  });

  it('pose le compte des commits en attente et s’allume', async () => {
    const { gitBar, button, count } = await bar();
    gitBar({ branch: 'main', ahead: 2, behind: 0 });
    expect(count.textContent).toBe('2');
    expect(button.disabled).toBe(false);
    expect(button.title).toBe('2 commits à pousser sur main — lance la CI');
    expect(count.classList.contains('warn')).toBe(false);
  });

  it('s’éteint à zéro', async () => {
    const { gitBar, button, count } = await bar();
    gitBar({ branch: 'main', ahead: 1, behind: 0 });
    gitBar({ branch: 'main', ahead: 0, behind: 0 });
    expect(count.textContent).toBe('0');
    expect(button.disabled).toBe(true);
    expect(button.title).toBe('Rien à pousser');
  });

  it('dit le retard sur l’amont, sans s’éteindre', async () => {
    const { gitBar, button, count } = await bar();
    gitBar({ branch: 'main', ahead: 1, behind: 3 });
    expect(count.textContent).toBe('1');
    expect(count.classList.contains('warn')).toBe(true);
    expect(button.disabled).toBe(false);
    expect(button.title).toBe('3 commits sur origin que tu n’as pas : `git pull --rebase` d’abord');
  });

  it('dit « pas d’amont » quand la branche ne suit rien', async () => {
    const { gitBar, button, count } = await bar();
    gitBar({ branch: 'essai', ahead: null, behind: 0 });
    expect(count.textContent).toBe('pas d’amont');
    expect(button.disabled).toBe(true);
    expect(button.title).toContain('essai');
  });
});

describe('log — le journal en haut de la page', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  type Lib = {
    log: (lines: string[], ok?: boolean, doing?: string) => void;
    journalWire: () => void;
  };

  /**
   * `log` de la page, sur l'aside de la VRAIE coquille (la méthode de
   * `gitBar`). Le presse-papiers est factice ; `scrollIntoView` aussi, pour
   * voir quand la page remonte au journal.
   */
  async function journal(clipboard: unknown = { writeText: vi.fn(() => Promise.resolve()) }) {
    const { document } = new Window();
    document.body.innerHTML = /<aside class="journal"[\s\S]*?<\/aside>/.exec(shell())?.[0] ?? '';
    vi.stubGlobal('document', document);
    vi.stubGlobal('navigator', { clipboard });
    const lib = (await import(/* @vite-ignore */ resolve(UI, 'lib.js'))) as Lib;
    lib.journalWire();
    const el = (id: string) => document.getElementById(id) as unknown as HTMLElement;
    const aside = el('journal');
    const scroll = vi.fn();
    aside.scrollIntoView = scroll;
    return {
      log: lib.log,
      aside,
      scroll,
      bar: el('journal-toggle'),
      last: el('journal-last'),
      title: el('journal-title'),
      dot: el('journal-dot'),
      copy: el('journal-copy'),
      /** Les lignes de `#log`, ou `null` tant qu'il est replié. */
      lines: () =>
        el('log').hidden ? null : [...el('log').children].map((d) => [d.className, d.textContent]),
    };
  }

  it('n’occupe rien au repos', async () => {
    const { log, aside, last, copy, lines } = await journal();
    expect(aside.hidden).toBe(true);
    expect(aside.dataset.state).toBe('idle');
    expect(last.textContent).toBe('');
    expect(copy.hidden).toBe(true);
    expect(lines()).toBeNull();
    // Un journal vidé y revient.
    log(['Code requis.'], false);
    log([]);
    expect(aside.hidden).toBe(true);
    expect(aside.dataset.state).toBe('idle');
  });

  it('`run` : une ligne, l’étape en cours, ni journal déplié ni bouton', async () => {
    const { log, aside, scroll, bar, last, dot, copy, lines } = await journal();
    log([], undefined, 'envoi au serveur');
    expect(aside.hidden).toBe(false);
    expect(aside.dataset.state).toBe('run');
    expect(dot.className).toBe('dot run');
    expect(last.textContent).toBe('envoi au serveur');
    expect(last.hidden).toBe(false);
    expect(lines()).toBeNull();
    expect(copy.hidden).toBe(true);

    log(['écrit'], undefined, 'git commit');
    expect(last.textContent).toBe('git commit');
    log(['écrit', 'committé']);
    expect(last.textContent).toBe('committé');
    expect(aside.dataset.state).toBe('run');
    // Pas de journal déplié pendant qu'une opération court, même au clic.
    bar.click();
    expect(lines()).toBeNull();
    expect(bar.getAttribute('aria-expanded')).toBe('false');
    expect(scroll).not.toHaveBeenCalled();
  });

  it('`ok` : une ligne verte, la dernière, sans bouton — le clic déplie', async () => {
    const { log, aside, scroll, bar, last, title, dot, copy, lines } = await journal();
    log(['écrit', 'committé — 1 commit à pousser.'], true);
    expect(aside.hidden).toBe(false);
    expect(aside.dataset.state).toBe('ok');
    expect(dot.className).toBe('dot ok');
    expect(last.textContent).toBe('committé — 1 commit à pousser.');
    expect(last.hidden).toBe(false);
    expect(title.hidden).toBe(true);
    expect(lines()).toBeNull();
    expect(copy.hidden).toBe(true);
    expect(bar.getAttribute('aria-expanded')).toBe('false');
    // L'opération est finie : la page remonte au journal s'il ne se voit pas.
    expect(scroll).toHaveBeenCalledWith({ block: 'nearest' });
    // Le vert : `data-state` sur la ligne, la classe sur la dernière étape.
    expect(readFileSync(resolve(UI, 'quick.css'), 'utf8')).toMatch(
      /\.journal\[data-state='ok'\] \.journal-last \{\s*color: var\(--success\);/,
    );

    bar.click();
    expect(bar.getAttribute('aria-expanded')).toBe('true');
    expect(lines()).toEqual([
      ['', 'écrit'],
      ['ok', 'committé — 1 commit à pousser.'],
    ]);
    // Déplié, le titre remplace la ligne ; toujours pas de bouton.
    expect(last.hidden).toBe(true);
    expect(title.hidden).toBe(false);
    expect(copy.hidden).toBe(true);
    bar.click();
    expect(lines()).toBeNull();
    expect(last.hidden).toBe(false);
  });

  it('`ko` : tout le journal d’office, la dernière ligne en rouge, et « Copier »', async () => {
    const writeText = vi.fn(() => Promise.resolve());
    const { log, aside, scroll, bar, dot, copy, lines } = await journal({ writeText });
    vi.useFakeTimers();
    log(['écrit', 'git commit', 'git push : refusé\n ! [rejected] main -> main'], false);
    expect(aside.hidden).toBe(false);
    expect(aside.dataset.state).toBe('ko');
    expect(dot.className).toBe('dot ko');
    expect(bar.getAttribute('aria-expanded')).toBe('true');
    expect(lines()).toEqual([
      ['', 'écrit'],
      ['', 'git commit'],
      ['ko', 'git push : refusé\n ! [rejected] main -> main'],
    ]);
    expect(scroll).toHaveBeenCalledWith({ block: 'nearest' });
    expect(copy.hidden).toBe(false);
    expect(copy.className).toBe('btn ghost sm');
    expect(copy.textContent).toBe('Copier');

    copy.click();
    await vi.advanceTimersByTimeAsync(0);
    expect(writeText).toHaveBeenCalledExactlyOnceWith(
      'écrit\ngit commit\ngit push : refusé\n ! [rejected] main -> main',
    );
    expect(copy.textContent).toBe('copié');
    await vi.advanceTimersByTimeAsync(1999);
    expect(copy.textContent).toBe('copié');
    await vi.advanceTimersByTimeAsync(1);
    expect(copy.textContent).toBe('Copier');
  });

  it('« Copier » dit « impossible » quand le presse-papiers se refuse', async () => {
    const refused = { writeText: vi.fn(() => Promise.reject(new Error('NotAllowedError'))) };
    // Permission refusée, puis page non sécurisée : `navigator.clipboard` absent.
    for (const clipboard of [refused, null]) {
      const { log, copy } = await journal(clipboard);
      vi.useFakeTimers();
      log(['Code requis.'], false);
      copy.click();
      await vi.advanceTimersByTimeAsync(0);
      expect(copy.textContent).toBe('impossible');
      await vi.advanceTimersByTimeAsync(2000);
      expect(copy.textContent).toBe('Copier');
      vi.useRealTimers();
    }
    expect(refused.writeText).toHaveBeenCalledExactlyOnceWith('Code requis.');
  });

  it('une opération suivante repart de zéro', async () => {
    const { log, aside, bar, last, copy, lines } = await journal();
    log(['écrit', 'git push : refusé'], false);
    expect(lines()).toHaveLength(2);

    log([], undefined, 'envoi au serveur');
    expect(aside.dataset.state).toBe('run');
    expect(lines()).toBeNull();
    expect(bar.getAttribute('aria-expanded')).toBe('false');
    expect(copy.hidden).toBe(true);
    expect(last.textContent).toBe('envoi au serveur');

    log(['git : rien à committer.'], true);
    expect(aside.dataset.state).toBe('ok');
    expect(last.textContent).toBe('git : rien à committer.');
    bar.click();
    expect(lines()).toEqual([['ok', 'git : rien à committer.']]);
  });
});

describe('Noms — la page, sur le vrai markup', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  const LANGS = ['en', 'jp', 'kr', 'zh', 'fr', 'es'];
  const per = <T>(value: T, over: Record<string, T> = {}): Record<string, T> => ({
    ...Object.fromEntries(LANGS.map((l) => [l, value])),
    ...over,
  });

  interface Row {
    id: string;
    name: string;
    full: Record<string, string>;
    short: Record<string, string>;
    aliases: string[];
    base: string[];
    fits: { full: Record<string, boolean>; short: Record<string, boolean | null> };
    todo: boolean;
  }
  const row = (id: string, name: string, over: Partial<Row> = {}): Row => ({
    id,
    name,
    full: per(name),
    short: {},
    aliases: [],
    base: [name.toLowerCase(), id],
    fits: { full: per(true), short: per<boolean | null>(null) },
    todo: false,
    ...over,
  });

  /** Quatre persos, un par état : à traiter, nom court trop long, nom court, rien. */
  const roster = (): Row[] => [
    row('4', 'Zed'),
    row('3', 'Short Carla', {
      short: { en: 'S.Carla' },
      aliases: ['carlita'],
      fits: { full: per(true, { en: false }), short: per<boolean | null>(true) },
    }),
    row('2', 'Long Bella', {
      short: { en: 'L.Bella', jp: 'とても長いベラの名前です' },
      fits: { full: per(true), short: per<boolean | null>(true, { jp: false }) },
    }),
    row('1', 'Overflowing Name Anna', {
      fits: { full: per(true, { en: false, fr: false }), short: per<boolean | null>(null) },
      todo: true,
    }),
  ];

  type Call = { path: string; body: unknown };

  /**
   * La page de quick dans un document happy-dom : la VRAIE coquille assemblée,
   * le vrai `lib.js` et le vrai `tabs/names.js` (eux seuls : les autres onglets
   * ne sont pas chargés), démarrés par `sections.start()`. `fetch` est factice :
   * il sert `rows`, juge un nom court à sa longueur (dix caractères au plus) et
   * note ce que la page poste.
   */
  async function names(opts: { hash?: string; saved?: (changes: Call['body']) => unknown } = {}) {
    vi.resetModules();
    const window = new Window({ url: `http://localhost:4747/${opts.hash ?? ''}` });
    const { document } = window;
    const page = assemblePage(shell(), readTab);
    document.body.innerHTML = (/<body>([\s\S]*)<\/body>/.exec(page)?.[1] ?? '').replace(
      /<script[\s\S]*?<\/script>/g,
      '',
    );

    const disk = { rows: roster() };
    const calls: Call[] = [];
    const confirm = vi.fn(() => true);
    const answer = (data: unknown) => {
      const bytes = new TextEncoder().encode(JSON.stringify(data));
      let read = false;
      return {
        ok: true,
        json: async () => data,
        body: {
          getReader: () => ({
            read: async () => (read ? { done: true } : ((read = true), { value: bytes })),
          }),
        },
      };
    };
    const fetch = vi.fn(async (path: string, init?: { body?: string }) => {
      const body: unknown = init?.body ? JSON.parse(init.body) : undefined;
      if (init) calls.push({ path, body });
      if (path === '/api/names/state') return answer({ rows: disk.rows, langs: LANGS, width: 80 });
      if (path === '/api/names/fit')
        return answer({ fits: (body as { texts: string[] }).texts.map((t) => t.length <= 10) });
      if (path === '/api/names') return answer(opts.saved?.(body) ?? { ok: true, log: ['fait'] });
      return answer({ imgBase: 'https://img.test', host: 'banc', port: 4747 });
    });

    vi.stubGlobal('window', window);
    vi.stubGlobal('document', document);
    vi.stubGlobal('location', window.location);
    vi.stubGlobal('history', window.history);
    vi.stubGlobal('fetch', fetch);
    vi.stubGlobal('confirm', confirm);

    const lib = (await import(/* @vite-ignore */ resolve(UI, 'lib.js'))) as {
      sections: { start: () => void };
    };
    await import(/* @vite-ignore */ resolve(UI, 'tabs', 'names.js'));
    lib.sections.start();
    const settle = () => new Promise((done) => setTimeout(done, 0));
    await settle();
    await settle();

    const el = (id: string) => document.getElementById(id) as unknown as HTMLInputElement;
    const all = (selector: string) =>
      [...document.querySelectorAll(selector)] as unknown as HTMLElement[];
    const fire = (target: HTMLElement, type: string, key?: string) =>
      target.dispatchEvent(
        (key
          ? new window.KeyboardEvent(type, { key, bubbles: true, cancelable: true })
          : new window.Event(type, { bubbles: true })) as unknown as Event,
      );
    return {
      el,
      all,
      calls,
      confirm,
      disk,
      settle,
      /** Les lignes de la liste : nom, badge, point. */
      list: () =>
        all('#n-list .n-row').map((b) => [
          b.querySelector('.n-name')?.textContent,
          b.querySelector('.badge')?.className ?? '',
          b.querySelector('.pt')?.className ?? '',
        ]),
      filter: (value: string) => {
        el('n-state').value = value;
        fire(el('n-state'), 'input');
      },
      open: (id: string) =>
        all('#n-list .n-row')
          .find((b) => b.dataset.id === id)
          ?.click(),
      /** Le champ du nom court d'une langue, et son verdict tel qu'il se lit. */
      short: (lang: string) => all(`#n-sheet input[data-lang="${lang}"]`)[0] as HTMLInputElement,
      verdict: (lang: string) => all(`#n-sheet [data-verdict="${lang}"]`)[0].textContent,
      type: (input: HTMLInputElement, value: string) => {
        input.value = value;
        fire(input, 'input');
      },
      key: (input: HTMLElement, key: string) => fire(input, 'keydown', key),
      chips: () =>
        all('#n-chips .chip').map((c) => [
          c.firstChild?.textContent,
          c.classList.contains('warn') ? c.title : '',
        ]),
    };
  }

  it('le groupe Outils n’est plus « à venir » : il ouvre Noms, la section est servie', async () => {
    const { all, el } = await names();
    const group = all('#groups button').find((b) => b.textContent?.includes('Outils'));
    expect(group?.dataset.group).toBe('tools');
    expect(group?.classList.contains('soon')).toBe(false);
    expect(all('#groups .gtab.soon').map((b) => b.textContent?.trim().split(/\s+/)[0])).toEqual([
      'Éditeurs',
      'Guides',
    ]);
    expect(el('tab-names').hidden).toBe(true);
    group?.click();
    expect(el('tab-names').hidden).toBe(false);
    expect(all('#tabs [data-tab="names"]')[0].getAttribute('aria-selected')).toBe('true');
    // Pas `wide` : la section reste dans les 1200 px.
    expect(all('main')[0].classList.contains('wide')).toBe(false);
  });

  it('filtre « À traiter » par défaut, le compte en tête, un badge par état', async () => {
    const page = await names();
    expect(page.el('n-state').value).toBe('todo');
    expect(page.el('n-total').textContent).toBe('1 à traiter sur 4');
    expect(page.list()).toEqual([['Overflowing Name Anna', 'badge ko', '']]);

    // À traiter d'abord, puis le nom court trop long, puis par nom.
    page.filter('all');
    expect(page.list()).toEqual([
      ['Overflowing Name Anna', 'badge ko', ''],
      ['Long Bella', 'badge warn', ''],
      ['Short Carla', 'badge ok', ''],
      ['Zed', '', ''],
    ]);
    expect(page.all('#n-list .badge').map((b) => b.textContent)).toEqual([
      'déborde',
      'court trop long',
      'court',
    ]);

    page.filter('long');
    expect(page.list().map(([name]) => name)).toEqual(['Long Bella']);
    page.filter('short');
    expect(page.list().map(([name]) => name)).toEqual(['Long Bella', 'Short Carla']);
    page.filter('alias');
    expect(page.list().map(([name]) => name)).toEqual(['Short Carla']);

    page.filter('all');
    page.type(page.el('n-q'), 'carl');
    expect(page.list().map(([name]) => name)).toEqual(['Short Carla']);
  });

  it('rien à traiter : la liste le dit, plutôt que de rester blanche', async () => {
    const page = await names();
    page.type(page.el('n-q'), 'zzz');
    expect(page.list()).toEqual([]);
    expect(page.el('n-empty').hidden).toBe(false);
    expect(page.el('n-empty').textContent).toBe('Aucun perso ne passe les filtres.');
  });

  it('la fiche : six langues, le verdict du nom complet, « = en » quand la langue est vide', async () => {
    const page = await names();
    page.filter('all');
    page.open('3');
    expect(page.all('#n-sheet .n-id strong')[0].textContent).toBe('Short Carla');
    expect(page.all('#n-sheet tbody tr')).toHaveLength(6);
    expect(page.all('#n-sheet tbody tr td:nth-child(2) .badge').map((b) => b.textContent)).toEqual([
      'déborde',
      'tient',
      'tient',
      'tient',
      'tient',
      'tient',
    ]);
    // L'anglais porte sa valeur ; le français, vide, replie dessus.
    expect(page.short('en').value).toBe('S.Carla');
    expect(page.verdict('en')).toBe('tient');
    expect(page.short('fr').value).toBe('');
    expect(page.short('fr').placeholder).toBe('Short Carla');
    expect(page.verdict('fr')).toBe('= en : S.Carla' + 'tient');
    // Le perso ouvert est dans l'adresse.
    expect(location.hash).toBe('#names/3');

    // Sans nom court du tout : rien à juger.
    page.open('4');
    expect(page.verdict('en')).toBe('—');
    expect(page.verdict('fr')).toBe('—');
  });

  it('la saisie relance le verdict, 300 ms après la dernière frappe, en UNE requête', async () => {
    const page = await names();
    page.open('1');
    vi.useFakeTimers();
    page.type(page.short('en'), 'O.A');
    page.type(page.short('en'), 'O.Anna');
    page.type(page.short('jp'), 'とても長いアンナの名前');
    // Le texte suit aussitôt ; le verdict attend le serveur.
    expect(page.verdict('fr')).toBe('= en : O.Anna' + '…');
    await vi.advanceTimersByTimeAsync(299);
    expect(page.calls).toEqual([]);
    await vi.advanceTimersByTimeAsync(1);
    expect(page.calls).toEqual([
      { path: '/api/names/fit', body: { texts: ['O.Anna', 'とても長いアンナの名前'] } },
    ]);
    expect(page.verdict('en')).toBe('tient');
    expect(page.verdict('jp')).toBe('déborde');
    expect(page.verdict('fr')).toBe('= en : O.Anna' + 'tient');

    // Modifié, pas enregistré : le point de la ligne, le badge, la savebar.
    expect(page.list()).toEqual([['Overflowing Name Anna', 'badge ko', 'pt edit']]);
    expect(page.el('n-badges').textContent).toContain('modifié');
    expect(page.el('n-count').textContent).toBe('1 perso modifié');
    expect(page.el('n-save').disabled).toBe(false);

    // Revenu à la valeur du disque : plus rien en attente.
    page.type(page.short('en'), '');
    page.type(page.short('jp'), '');
    expect(page.list()).toEqual([['Overflowing Name Anna', 'badge ko', '']]);
    expect(page.el('n-count').textContent).toBe('aucune modification');
    expect(page.el('n-save').disabled).toBe(true);
  });

  it('les alias en chips : Entrée, virgule, Retour arrière, ✕, et le doublon en `warn`', async () => {
    const page = await names();
    page.filter('all');
    page.open('3');
    const input = page.el('n-alias');
    expect(page.all('#n-sheet .chip.base').map((c) => c.textContent)).toEqual(['short carla', '3']);
    expect(page.chips()).toEqual([['carlita', '']]);

    page.type(input, 'carla s');
    page.key(input, 'Enter');
    expect(input.value).toBe('');
    // « Short Carla » est déjà cherchable, quelle que soit la casse.
    page.type(input, 'SHORT CARLA, sc,');
    expect(input.value).toBe('');
    expect(page.chips()).toEqual([
      ['carlita', ''],
      ['carla s', ''],
      ['SHORT CARLA', 'déjà cherchable sans cet alias'],
      ['sc', ''],
    ]);
    expect(page.el('n-alias-count').textContent).toBe('Alias (4)');

    // Retour arrière sur un champ vide retire le dernier ; pas sur un champ rempli.
    page.key(input, 'Backspace');
    expect(page.chips().map(([a]) => a)).toEqual(['carlita', 'carla s', 'SHORT CARLA']);
    input.value = 'x';
    page.key(input, 'Backspace');
    expect(page.chips()).toHaveLength(3);
    input.value = '';

    page.all('#n-chips [data-drop="0"]')[0].click();
    expect(page.chips().map(([a]) => a)).toEqual(['carla s', 'SHORT CARLA']);
    expect(page.list().find(([name]) => name === 'Short Carla')?.[2]).toBe('pt edit');
  });

  it('« Enregistrer » : tout le lot, le texte en attente du champ d’alias compris, puis le disque relu', async () => {
    const page = await names({
      saved: () => ({ ok: false, log: ['REFUSÉ — Zed'], refused: ['4'], saved: ['1', '3'] }),
    });
    page.filter('all');
    page.open('1');
    page.type(page.short('en'), 'O.Anna');
    page.open('3');
    // Tapé, jamais validé par Entrée : il part quand même.
    page.type(page.el('n-alias'), 'carla s');
    page.open('4');
    page.type(page.short('fr'), 'Z');
    expect(page.el('n-count').textContent).toBe('3 persos modifiés');
    await page.settle();
    page.calls.length = 0;

    // Ce que le disque rendra à la relecture : Anna a son nom court.
    page.disk.rows = roster().map((r) =>
      r.id === '1'
        ? { ...r, short: { en: 'O.Anna' }, todo: false, fits: { ...r.fits, short: per(true) } }
        : r.id === '3'
          ? { ...r, aliases: ['carlita', 'carla s'] }
          : r,
    );
    page.el('n-save').click();
    await page.settle();
    await page.settle();

    expect(page.calls.find((c) => c.path === '/api/names')?.body).toEqual({
      changes: [
        { id: '1', short: { en: 'O.Anna' }, aliases: [], was: { short: {}, aliases: [] } },
        {
          id: '3',
          short: { en: 'S.Carla' },
          aliases: ['carlita', 'carla s'],
          was: { short: { en: 'S.Carla' }, aliases: ['carlita'] },
        },
        { id: '4', short: { fr: 'Z' }, aliases: [], was: { short: {}, aliases: [] } },
      ],
    });
    // Badges et liste suivent le disque ; le refusé garde un point rouge.
    expect(page.list()).toEqual([
      ['Long Bella', 'badge warn', ''],
      ['Overflowing Name Anna', 'badge ok', ''],
      ['Short Carla', 'badge ok', ''],
      ['Zed', '', 'pt ko'],
    ]);
    expect(page.el('n-total').textContent).toBe('0 à traiter sur 4');
    expect(page.el('n-count').textContent).toBe('aucune modification' + '1 refus');
    expect(page.el('n-save').disabled).toBe(true);
    // La fiche montrée (Zed, refusé) est revenue au disque.
    expect(page.short('fr').value).toBe('');
  });

  it('le perso ouvert garde sa ligne, même hors du filtre d’état — pas hors de la recherche', async () => {
    const page = await names({ hash: '#names/3' });
    expect(page.el('n-state').value).toBe('todo');
    expect(page.list().map(([name]) => name)).toEqual(['Overflowing Name Anna', 'Short Carla']);
    expect(page.all('#n-list .n-row[aria-current="true"] .n-name')[0].textContent).toBe(
      'Short Carla',
    );
    page.type(page.el('n-q'), 'anna');
    expect(page.list().map(([name]) => name)).toEqual(['Overflowing Name Anna']);
    // Un id inconnu dans l'adresse : l'onglet s'ouvre, sans fiche.
    const ghost = await names({ hash: '#names/ghost' });
    expect(ghost.el('tab-names').hidden).toBe(false);
    expect(ghost.el('n-sheet').textContent?.trim()).toBe('Choisir un perso dans la liste.');
  });

  it('« Annuler » rend le disque ; quitter l’onglet avec des changements demande confirmation', async () => {
    const page = await names({ hash: '#names/1' });
    // `#names/<id>` : l'onglet ouvert sur la fiche, sans clic.
    expect(page.el('tab-names').hidden).toBe(false);
    expect(page.all('#n-sheet .n-id strong')[0].textContent).toBe('Overflowing Name Anna');
    expect(page.confirm).not.toHaveBeenCalled();

    page.type(page.short('en'), 'O.Anna');
    page.confirm.mockReturnValueOnce(false);
    page.all('#tabs [data-tab="coupons"]')[0].click();
    expect(page.confirm).toHaveBeenCalledTimes(1);
    expect(page.el('tab-names').hidden).toBe(false);

    page.el('n-reset').click();
    expect(page.short('en').value).toBe('');
    expect(page.el('n-count').textContent).toBe('aucune modification');
    page.all('#tabs [data-tab="coupons"]')[0].click();
    expect(page.confirm).toHaveBeenCalledTimes(1);
    expect(page.el('tab-names').hidden).toBe(true);
  });
});

describe('Bannières — la page, sur le vrai markup', () => {
  afterEach(() => vi.unstubAllGlobals());

  const TODAY = '2026-10-08';
  interface Banner {
    id: string;
    name: string;
    start: string;
    end: string;
  }
  interface Win {
    characterId: string;
    type: string;
    start: string;
    end: string;
    unknown?: true;
  }
  interface State {
    banners: Banner[];
    today: string;
    roster: { id: string; name: string }[];
    game: Win[] | null;
    gameError?: string;
    missing: Win[];
    drift: (Omit<Banner, 'end'> & { curated: string; game: string; type: string })[];
  }

  const SUMMER: Win = {
    characterId: '5',
    type: 'outer_fes',
    start: '2026-10-20',
    end: '2026-11-17',
  };
  const GHOST: Win = {
    characterId: '9',
    type: 'pickup',
    start: '2026-10-20',
    end: '2026-11-17',
    unknown: true,
  };
  /** Quatre bannières, une par statut daté, et ce que le jeu en dit de plus. */
  const disk = (over: Partial<State> = {}): State => ({
    banners: [
      { id: '4', name: 'Dana', start: '2026-10-13', end: '2026-11-10' },
      { id: '1', name: 'Anna', start: '2026-09-22', end: '2026-10-20' },
      { id: '2', name: 'Bella', start: '2026-09-08', end: '2026-10-05' },
      { id: '3', name: 'Carla', start: '2026-07-01', end: '2026-07-28' },
    ],
    today: TODAY,
    roster: [
      { id: '1', name: 'Anna' },
      { id: '2', name: 'Bella' },
      { id: '3', name: 'Carla' },
      { id: '4', name: 'Dana' },
      { id: '5', name: 'Summer Anna' },
    ],
    game: [SUMMER],
    missing: [SUMMER, GHOST],
    drift: [
      {
        id: '2',
        name: 'Bella',
        start: '2026-09-08',
        curated: '2026-10-05',
        game: '2026-10-06',
        type: 'pickup',
      },
    ],
    ...over,
  });

  type Call = { path: string; body: unknown };

  /**
   * La page de quick dans un document happy-dom, comme pour Noms : la VRAIE
   * coquille assemblée, le vrai `lib.js` et le vrai `tabs/banners.js` (eux
   * seuls), démarrés par `sections.start()`. `fetch` est factice : il sert
   * `state`, répond à l'enregistrement et note ce que la page poste.
   */
  async function banners(
    opts: { state?: Partial<State>; saved?: (body: Call['body']) => unknown } = {},
  ) {
    vi.resetModules();
    const window = new Window({ url: 'http://localhost:4747/#banners' });
    const { document } = window;
    const page = assemblePage(shell(), readTab);
    document.body.innerHTML = (/<body>([\s\S]*)<\/body>/.exec(page)?.[1] ?? '').replace(
      /<script[\s\S]*?<\/script>/g,
      '',
    );

    const served = { state: disk(opts.state), reads: 0 };
    const calls: Call[] = [];
    const confirm = vi.fn(() => true);
    const answer = (data: unknown) => {
      const bytes = new TextEncoder().encode(JSON.stringify(data));
      let read = false;
      return {
        ok: true,
        json: async () => data,
        body: {
          getReader: () => ({
            read: async () => (read ? { done: true } : ((read = true), { value: bytes })),
          }),
        },
      };
    };
    const fetch = vi.fn(async (path: string, init?: { body?: string }) => {
      const body: unknown = init?.body ? JSON.parse(init.body) : undefined;
      if (init) calls.push({ path, body });
      if (path === '/api/banners/state') {
        served.reads += 1;
        return answer(served.state);
      }
      if (path === '/api/banners')
        return answer(opts.saved?.(body) ?? { ok: true, log: ['fait'], issues: [], written: true });
      return answer({ imgBase: 'https://img.test', host: 'banc', port: 4747 });
    });

    vi.stubGlobal('window', window);
    vi.stubGlobal('document', document);
    vi.stubGlobal('location', window.location);
    vi.stubGlobal('history', window.history);
    vi.stubGlobal('fetch', fetch);
    vi.stubGlobal('confirm', confirm);

    const lib = (await import(/* @vite-ignore */ resolve(UI, 'lib.js'))) as {
      sections: { start: () => void };
    };
    await import(/* @vite-ignore */ resolve(UI, 'tabs', 'banners.js'));
    lib.sections.start();
    const settle = () => new Promise((done) => setTimeout(done, 0));
    await settle();
    await settle();

    const el = (id: string) => document.getElementById(id) as unknown as HTMLInputElement;
    const all = (selector: string) =>
      [...document.querySelectorAll(selector)] as unknown as HTMLElement[];
    const fire = (target: HTMLElement, type: string) =>
      target.dispatchEvent(new window.Event(type, { bubbles: true }) as unknown as Event);
    const field = (tr: HTMLElement, name: string) =>
      tr.querySelector(`[data-f="${name}"]`) as HTMLInputElement | null;
    const texts = (root: HTMLElement, selector: string) =>
      [...root.querySelectorAll(selector)].map((n) => n.textContent ?? '');
    return {
      el,
      all,
      calls,
      confirm,
      served,
      settle,
      /** Les lignes de la table : nom, début, fin, badges, classe. */
      rows: () =>
        all('#b-list tr').map((tr) => [
          field(tr, 'name')?.value ?? '(recherche)',
          field(tr, 'start')?.value,
          field(tr, 'end')?.value,
          texts(tr, '.b-status .badge').join(' | '),
          tr.className,
        ]),
      row: (name: string) => {
        const tr = all('#b-list tr').find((r) => field(r, 'name')?.value === name);
        if (!tr) throw new Error(`pas de ligne « ${name} »`);
        return tr;
      },
      field,
      /** Les lignes de « Dans le jeu » : nom, badges, période, bouton, éteint ? */
      game: () =>
        all('#b-game .b-win').map((li) => [
          texts(li, '.b-name')[0],
          texts(li, '.badge').join(' | '),
          texts(li, '.b-period')[0],
          texts(li, 'button')[0],
          (li.querySelector('button') as HTMLButtonElement).disabled,
        ]),
      gameButton: (label: string, name: string) => {
        const button = all('#b-game .b-win')
          .find((li) => texts(li, '.b-name')[0] === name)
          ?.querySelector('button') as HTMLButtonElement | null | undefined;
        if (button?.textContent !== label) throw new Error(`pas de « ${label} » pour ${name}`);
        return button;
      },
      type: (input: HTMLInputElement, value: string) => {
        input.value = value;
        fire(input, 'input');
      },
      hideExpired: (on: boolean) => {
        el('b-hide').checked = on;
        fire(el('b-hide'), 'change');
      },
    };
  }

  it('la section est servie, dans Publication, après Codes promo — pas `wide`', async () => {
    const page = await banners();
    expect(
      page.all('#tabs [data-group="publication"]').map((b) => [b.dataset.tab, b.textContent]),
    ).toEqual([
      ['coupons', 'Codes promo'],
      ['banners', 'Bannières'],
      ['comics', '4-comics'],
      ['videos', 'Vidéos'],
      ['discord', 'Discord'],
    ]);
    // `#banners` ouvre la section et son groupe.
    expect(page.el('tab-banners').hidden).toBe(false);
    expect(page.el('tab-coupons').hidden).toBe(true);
    expect(page.all('#groups [data-group="publication"]')[0].getAttribute('aria-selected')).toBe(
      'true',
    );
    expect(page.all('main')[0].classList.contains('wide')).toBe(false);
  });

  it('le statut par date, au jour du serveur ; les expirées masquées d’office', async () => {
    const page = await banners();
    expect(page.el('b-hide').checked).toBe(true);
    expect(page.rows()).toEqual([
      ['Dana', '2026-10-13', '2026-11-10', 'à venir · dans 5 j', ''],
      ['Anna', '2026-09-22', '2026-10-20', 'active · 12 j restants', ''],
    ]);
    expect(page.el('b-summary').textContent).toBe(
      '4 bannières' + '1 active' + '1 à venir' + '2 expirées',
    );
    expect(page.all('#b-list .badge').map((b) => b.className)).toEqual([
      'badge upcoming',
      'badge active',
    ]);

    // Décoché : récent → ancien, les expirées atténuées.
    page.hideExpired(false);
    expect(page.rows()).toEqual([
      ['Dana', '2026-10-13', '2026-11-10', 'à venir · dans 5 j', ''],
      ['Anna', '2026-09-22', '2026-10-20', 'active · 12 j restants', ''],
      ['Bella', '2026-09-08', '2026-10-05', 'expirée', 'expired'],
      ['Carla', '2026-07-01', '2026-07-28', 'expirée', 'expired'],
    ]);

    // La saisie d'une date refait le statut, sans redessiner la ligne.
    const end = page.field(page.row('Anna'), 'end') as HTMLInputElement;
    page.type(end, TODAY);
    expect(page.rows()[1]).toEqual([
      'Anna',
      '2026-09-22',
      TODAY,
      'active · dernier jour | modifiée',
      '',
    ]);
    expect(page.field(page.row('Anna'), 'end')).toBe(end);
    page.type(end, '');
    expect(page.rows()[1][3]).toBe('brouillon | modifiée');
    expect(page.el('b-count').textContent).toBe('1 changement');
  });

  it('rien d’actif ni à venir : la carte le dit, avec le compte des expirées masquées', async () => {
    const page = await banners({
      state: { banners: disk().banners.slice(2), missing: [], drift: [] },
    });
    expect(page.rows()).toEqual([]);
    expect(page.el('b-empty').hidden).toBe(false);
    expect(page.el('b-empty').textContent).toBe(
      'Aucune bannière active ou à venir — 2 expirées masquées.',
    );
  });

  it('« Dans le jeu » : les manquantes puis les dérives ; « Insérer » ajoute la ligne et compte un changement', async () => {
    const page = await banners();
    expect(page.el('b-game-count').textContent).toBe('2 à insérer' + '1 à aligner');
    expect(page.game()).toEqual([
      ['Summer Anna', 'fes | à venir · dans 12 j', '2026-10-20 → 2026-11-17', 'Insérer', false],
      // Hors du roster du site : montré, pas insérable.
      [
        '9',
        'hors roster | pickup | à venir · dans 12 j',
        '2026-10-20 → 2026-11-17',
        'Insérer',
        true,
      ],
      [
        'Bella',
        'pickup',
        '2026-09-08 → fin curée 2026-10-05, jeu 2026-10-06',
        'Aligner sur le jeu',
        false,
      ],
    ]);
    expect(page.el('b-insert-all').hidden).toBe(false);
    expect(page.el('b-save').disabled).toBe(true);

    page.gameButton('Insérer', 'Summer Anna').click();
    // Le nom du roster, les dates de la table, à sa place dans la liste.
    expect(page.rows()).toEqual([
      ['Summer Anna', '2026-10-20', '2026-11-17', 'à venir · dans 12 j | nouvelle', ''],
      ['Dana', '2026-10-13', '2026-11-10', 'à venir · dans 5 j', ''],
      ['Anna', '2026-09-22', '2026-10-20', 'active · 12 j restants', ''],
    ]);
    expect(page.el('b-count').textContent).toBe('1 changement');
    expect(page.el('b-save').disabled).toBe(false);
    // Un changement en attente : la carte ne la propose plus, et rien n'est parti.
    expect(page.game().map(([name]) => name)).toEqual(['9', 'Bella']);
    expect(page.el('b-game-count').textContent).toBe('1 à insérer' + '1 à aligner');
    expect(page.el('b-insert-all').hidden).toBe(true);
    expect(page.calls).toEqual([]);

    // Retirée de la liste, elle revient dans la carte.
    (page.row('Summer Anna').querySelector('[data-del]') as HTMLButtonElement).click();
    expect(page.game().map(([name]) => name)).toEqual(['Summer Anna', '9', 'Bella']);
    expect(page.el('b-count').textContent).toBe('aucune modification');

    // « Tout insérer » laisse le perso hors roster.
    page.el('b-insert-all').click();
    expect(page.rows().map(([name]) => name)).toEqual(['Summer Anna', 'Dana', 'Anna']);
    expect(page.game().map(([name]) => name)).toEqual(['9', 'Bella']);
  });

  it('« Aligner sur le jeu » change la fin ; une ligne expirée modifiée reste à l’écran', async () => {
    const page = await banners({ state: { missing: [] } });
    expect(page.rows().map(([name]) => name)).toEqual(['Dana', 'Anna']);

    page.gameButton('Aligner sur le jeu', 'Bella').click();
    expect(page.rows()).toEqual([
      ['Dana', '2026-10-13', '2026-11-10', 'à venir · dans 5 j', ''],
      ['Anna', '2026-09-22', '2026-10-20', 'active · 12 j restants', ''],
      ['Bella', '2026-09-08', '2026-10-06', 'expirée | modifiée', 'expired'],
    ]);
    expect(page.el('b-count').textContent).toBe('1 changement');
    // Plus rien à proposer.
    expect(page.game()).toEqual([]);
    expect(page.el('b-game').textContent).toBe('Les bannières du jeu sont toutes dans la liste.');
    expect(page.el('b-game-count').textContent).toBe('');
  });

  it('sans données du jeu : le message, en texte — et la liste s’édite quand même', async () => {
    const page = await banners({
      state: {
        game: null,
        gameError: 'Pas de données du jeu : lancer un patch (pull) d’abord.',
        missing: [],
        drift: [],
      },
    });
    const note = page.all('#b-game .b-note')[0];
    expect(note.textContent).toBe('Pas de données du jeu : lancer un patch (pull) d’abord.');
    expect(page.all('#b-game .ko, #b-game .error, #b-game .badge')).toEqual([]);
    expect(page.el('b-insert-all').hidden).toBe(true);
    expect(page.rows().map(([name]) => name)).toEqual(['Dana', 'Anna']);
  });

  it('« ＋ bannière » : le perso par les suggestions du roster, le nom prérempli, un brouillon refusé situé', async () => {
    const page = await banners({
      state: { missing: [], drift: [] },
      saved: () => ({
        ok: false,
        log: ['REFUSÉ — Banner 1 (Summer Anna): invalid start date (YYYY-MM-DD expected).'],
        issues: [
          {
            index: 0,
            message: 'Banner 1 (Summer Anna): invalid start date (YYYY-MM-DD expected).',
          },
          { index: 0, message: 'Banner 1 (Summer Anna): invalid end date (YYYY-MM-DD expected).' },
        ],
        written: false,
      }),
    });
    page.el('b-add').click();
    expect(page.rows()[0]).toEqual(['(recherche)', '', '', 'brouillon', '']);
    // Une ligne vide ne compte pas — mais « Annuler » la retirerait.
    expect(page.el('b-count').textContent).toBe('aucune modification');
    expect(page.el('b-save').disabled).toBe(true);
    expect(page.el('b-reset').disabled).toBe(false);

    const search = page.all('#b-list [data-pick]')[0] as HTMLInputElement;
    const results = page.all('#b-list .results')[0];
    page.type(search, 'a');
    expect(results.hidden).toBe(true);
    page.type(search, 'AN');
    expect(results.hidden).toBe(false);
    // Ceux qui commencent par la saisie d'abord, puis ceux qui la contiennent.
    expect(page.all('#b-list .results div').map((d) => d.textContent)).toEqual([
      'Anna',
      'Dana',
      'Summer Anna',
    ]);
    page.all('#b-list .results div')[2].click();
    expect(page.rows()[0]).toEqual(['Summer Anna', '', '', 'brouillon | nouvelle', '']);
    expect(page.all('#b-list tr')[0].querySelector('.face')?.getAttribute('src')).toBe(
      'https://img.test/images/characters/faceicon/FI_5.webp',
    );
    expect(page.el('b-count').textContent).toBe('1 changement');

    // Sans dates : `validateBanners` refuse, rien n'est écrit, la ligne est marquée.
    page.el('b-save').click();
    await page.settle();
    await page.settle();
    expect(page.calls).toEqual([
      {
        path: '/api/banners',
        body: {
          list: [{ id: '5', name: 'Summer Anna', start: '', end: '' }, ...disk().banners],
          changed: ['Summer Anna'],
        },
      },
    ]);
    expect(page.served.reads).toBe(1);
    expect(page.rows()[0]).toEqual(['Summer Anna', '', '', 'brouillon | nouvelle | refusée', 'ko']);
    expect(page.all('#b-list .badge.ko')[0].title).toBe(
      'Banner 1 (Summer Anna): invalid start date (YYYY-MM-DD expected). ; Banner 1 (Summer Anna): invalid end date (YYYY-MM-DD expected).',
    );
    expect(page.el('b-count').textContent).toBe('1 changement' + '1 refus');

    // La saisie lève le refus.
    page.type(page.field(page.row('Summer Anna'), 'start') as HTMLInputElement, '2026-10-20');
    expect(page.rows()[0][4]).toBe('');
    expect(page.el('b-count').textContent).toBe('1 changement');
  });

  it('« Enregistrer » : la liste entière, récent → ancien, les noms qui ont bougé — puis l’état relu', async () => {
    const page = await banners();
    page.gameButton('Insérer', 'Summer Anna').click();
    page.gameButton('Aligner sur le jeu', 'Bella').click();
    page.hideExpired(false);
    (page.row('Carla').querySelector('[data-del]') as HTMLButtonElement).click();
    page.type(page.field(page.row('Dana'), 'name') as HTMLInputElement, 'Dana (rerun)');
    expect(page.el('b-count').textContent).toBe('4 changements');

    // Ce que le disque rendra : la liste enregistrée, plus rien à proposer.
    const saved: Banner[] = [
      { id: '5', name: 'Summer Anna', start: '2026-10-20', end: '2026-11-17' },
      { id: '4', name: 'Dana (rerun)', start: '2026-10-13', end: '2026-11-10' },
      { id: '1', name: 'Anna', start: '2026-09-22', end: '2026-10-20' },
      { id: '2', name: 'Bella', start: '2026-09-08', end: '2026-10-06' },
    ];
    page.served.state = disk({ banners: saved, missing: [GHOST], drift: [] });
    page.el('b-save').click();
    await page.settle();
    await page.settle();

    expect(page.calls).toEqual([
      {
        path: '/api/banners',
        body: { list: saved, changed: ['Summer Anna', 'Dana (rerun)', 'Bella', 'Carla'] },
      },
    ]);
    expect(page.served.reads).toBe(2);
    expect(page.el('b-count').textContent).toBe('aucune modification');
    expect(page.el('b-save').disabled).toBe(true);
    expect(page.rows().map(([name, , , badges]) => [name, badges])).toEqual([
      ['Summer Anna', 'à venir · dans 12 j'],
      ['Dana (rerun)', 'à venir · dans 5 j'],
      ['Anna', 'active · 12 j restants'],
      ['Bella', 'expirée'],
    ]);
    // La détection ne propose plus ce qui est inséré ni aligné.
    expect(page.game().map(([name]) => name)).toEqual(['9']);
  });

  it('« Annuler » rend le disque ; quitter l’onglet avec des changements demande confirmation', async () => {
    const page = await banners();
    expect(page.confirm).not.toHaveBeenCalled();
    page.gameButton('Insérer', 'Summer Anna').click();
    page.gameButton('Aligner sur le jeu', 'Bella').click();
    expect(page.el('b-count').textContent).toBe('2 changements');

    page.confirm.mockReturnValueOnce(false);
    page.all('#tabs [data-tab="coupons"]')[0].click();
    expect(page.confirm).toHaveBeenCalledTimes(1);
    expect(page.el('tab-banners').hidden).toBe(false);

    page.el('b-reset').click();
    expect(page.rows().map(([name]) => name)).toEqual(['Dana', 'Anna']);
    expect(page.el('b-count').textContent).toBe('aucune modification');
    expect(page.el('b-reset').disabled).toBe(true);
    expect(page.game().map(([name]) => name)).toEqual(['Summer Anna', '9', 'Bella']);
    page.all('#tabs [data-tab="coupons"]')[0].click();
    expect(page.confirm).toHaveBeenCalledTimes(1);
    expect(page.el('tab-banners').hidden).toBe(true);
  });
});

describe('Tableau de bord — la page, sur le vrai markup', () => {
  afterEach(() => vi.unstubAllGlobals());

  const ADMIN = 'https://outerpedia.local';
  interface Dash {
    today: string;
    inbox:
      | {
          key: string;
          label: string;
          detail: string;
          href: string;
          tone: string;
          inQuick: boolean;
          tab: string | null;
        }[]
      | null;
    git: {
      branch: string;
      ahead: number | null;
      behind: number;
      last: { hash: string; subject: string; when: string } | null;
      dirty: number;
    } | null;
    game: { site: string; version: string | null; client: string; proposal: boolean } | null;
    banners: {
      active: { id: string; name: string; daysLeft: number }[];
      upcoming: { id: string; name: string; inDays: number }[];
      missing: number;
      drift: number;
      gameError?: string;
    } | null;
    coupons: {
      total: number;
      active: number;
      within: number;
      expiring: { code: string; daysLeft: number }[];
      error?: string;
    } | null;
    errors: Record<string, string>;
  }

  /** Un poste où chaque carte a quelque chose à dire. */
  const busy = (over: Partial<Dash> = {}): Dash => ({
    today: '2026-10-08',
    inbox: [
      {
        key: 'tags',
        label: 'Dead inline tags',
        detail: '2 tag(s) resolve to nothing',
        href: `${ADMIN}/admin/tags`,
        tone: 'danger',
        inQuick: false,
        tab: null,
      },
      {
        key: 'extract:character',
        label: 'Character',
        detail: '1 new',
        href: `${ADMIN}/admin/extractor/characters`,
        tone: 'warn',
        inQuick: false,
        tab: null,
      },
      {
        key: 'extract:item',
        label: 'Item',
        detail: '3 typo',
        href: `${ADMIN}/admin/extractor/items`,
        tone: 'muted',
        inQuick: true,
        tab: 'names',
      },
    ],
    git: {
      branch: 'main',
      ahead: 2,
      behind: 0,
      last: { hash: 'f1b28e5', subject: 'feat(quick): tableau de bord', when: 'il y a 3 heures' },
      dirty: 3,
    },
    game: { site: '1.11.404', version: '1.11.404', client: 'same', proposal: false },
    banners: {
      active: [
        { id: '2', name: 'Bella', daysLeft: 0 },
        { id: '1', name: 'Anna', daysLeft: 12 },
      ],
      upcoming: [{ id: '4', name: 'Dana', inDays: 5 }],
      missing: 2,
      drift: 1,
    },
    coupons: {
      total: 13,
      active: 8,
      within: 7,
      expiring: [
        { code: 'LASTDAY', daysLeft: 0 },
        { code: 'OPLIVE09', daysLeft: 3 },
      ],
    },
    errors: {},
    ...over,
  });

  /** Le même poste, sans rien à signaler. */
  const quiet = (over: Partial<Dash> = {}): Dash =>
    busy({
      inbox: [],
      git: { branch: 'main', ahead: 0, behind: 0, last: null, dirty: 0 },
      banners: { active: [], upcoming: [], missing: 0, drift: 0 },
      coupons: { total: 0, active: 0, within: 7, expiring: [] },
      ...over,
    });

  /**
   * La page de quick dans un document happy-dom, comme pour Noms et Bannières :
   * la VRAIE coquille assemblée, le vrai `lib.js` et le vrai
   * `tabs/dashboard.js` (eux seuls), démarrés par `sections.start()`. `fetch`
   * est factice : il sert `served.state`, compte les lectures de
   * `/api/dashboard` et répond à « Pousser ».
   */
  async function dashboard(
    opts: {
      state?: Dash;
      hash?: string;
      pushed?: unknown;
      status?: number;
      git?: GitState;
    } = {},
  ) {
    vi.resetModules();
    const window = new Window({ url: `http://localhost:4747/${opts.hash ?? ''}` });
    const { document } = window;
    const page = assemblePage(shell(), readTab);
    document.body.innerHTML = (/<body>([\s\S]*)<\/body>/.exec(page)?.[1] ?? '').replace(
      /<script[\s\S]*?<\/script>/g,
      '',
    );

    const served = { state: opts.state ?? busy(), reads: 0 };
    const posts: string[] = [];
    const answer = (data: unknown, ok = true) => {
      const bytes = new TextEncoder().encode(JSON.stringify(data));
      let read = false;
      return {
        ok,
        json: async () => data,
        body: {
          getReader: () => ({
            read: async () => (read ? { done: true } : ((read = true), { value: bytes })),
          }),
        },
      };
    };
    const fetch = vi.fn(async (path: string, init?: { body?: string }) => {
      if (init) posts.push(path);
      if (path === '/api/dashboard') {
        served.reads += 1;
        return opts.status
          ? answer({ ok: false, log: ['Error: route cassée'] }, false)
          : answer(served.state);
      }
      if (path === '/api/push')
        return answer(
          opts.pushed ?? {
            ok: true,
            log: ['poussé — la CI build et déploie.'],
            git: { branch: 'main', ahead: 0, behind: 0 },
          },
        );
      // `/api/state`, sans `git` d'office : l'en-tête ne suit alors que le
      // tableau de bord.
      return answer({ imgBase: 'https://img.test', host: 'banc', port: 4747, git: opts.git });
    });

    vi.stubGlobal('window', window);
    vi.stubGlobal('document', document);
    vi.stubGlobal('location', window.location);
    vi.stubGlobal('history', window.history);
    vi.stubGlobal('fetch', fetch);
    // `quick:saved` : happy-dom ne distribue que SES événements, pas l'`Event`
    // de Node que `lib.js` construirait ici.
    vi.stubGlobal('Event', window.Event);

    const lib = (await import(/* @vite-ignore */ resolve(UI, 'lib.js'))) as {
      sections: { start: () => void };
    };
    await import(/* @vite-ignore */ resolve(UI, 'tabs', 'dashboard.js'));
    lib.sections.start();
    const settle = async () => {
      for (let i = 0; i < 3; i++) await new Promise((done) => setTimeout(done, 0));
    };
    await settle();

    const el = (id: string) => document.getElementById(id) as unknown as HTMLButtonElement;
    const all = (selector: string) =>
      [...document.querySelectorAll(selector)] as unknown as HTMLElement[];
    const text = (node: Element | null | undefined) =>
      (node?.textContent ?? '').replace(/\s+/g, ' ').trim();
    return {
      el,
      all,
      text,
      served,
      posts,
      settle,
      /** Les lignes d'un bloc : la teinte de la pastille, ce qui s'y lit, teintée ? */
      rows: (id: string) =>
        all(`#${id} .h-row`).map((li) => [
          li.querySelector('.dot')?.className.replace('dot ', ''),
          text(li),
          li.classList.contains('tint'),
        ]),
      /** Les phrases d'un bloc sans ligne : rien à montrer, ou illisible. */
      notes: (id: string) => all(`#${id} .h-note, #${id} .empty`).map((p) => text(p)),
      /** Les titres des cartes, dans l'ordre de la grille. */
      cards: () => all('#tab-dashboard .h-grid > .card').map((c) => c.getAttribute('aria-label')),
    };
  }

  it('le groupe Accueil en tête : il ouvre la page, et le tableau de bord se lit', async () => {
    const page = await dashboard();
    expect(page.all('#groups button').map((b) => page.text(b).split(' ')[0])).toEqual([
      'Accueil',
      'Publication',
      'Données',
      'Éditeurs',
      'Guides',
      'Outils',
    ]);
    expect(
      page.all('#tabs [data-group="home"]').map((b) => [b.dataset.tab, b.textContent]),
    ).toEqual([['dashboard', 'Tableau de bord']]);
    // Sans hash : la première section du premier groupe, et elle seule.
    expect(
      page
        .all('main > section')
        .filter((s) => !s.hidden)
        .map((s) => s.id),
    ).toEqual(['tab-dashboard']);
    expect(page.all('#groups [data-group="home"]')[0].getAttribute('aria-selected')).toBe('true');
    expect(page.all('#tabs [data-tab="dashboard"]')[0].getAttribute('aria-selected')).toBe('true');
    expect(page.all('#tabs [data-tab="coupons"]')[0].hidden).toBe(true);
    // Pas `wide` : la section reste dans les 1200 px.
    expect(page.all('main')[0].classList.contains('wide')).toBe(false);
    expect(page.served.reads).toBe(1);
    expect(page.posts).toEqual([]);
  });

  it('les quatre cartes, depuis l’état du serveur', async () => {
    const page = await dashboard();
    expect(page.cards()).toEqual(['À faire', 'Dépôt', 'Jeu', 'Publication']);
    expect(page.text(page.el('h-today'))).toBe('au 2026-10-08 (UTC)');

    // « À faire » : l'inbox de l'admin, dans son ordre, une pastille par teinte.
    expect(page.rows('h-inbox')).toEqual([
      ['danger', 'Dead inline tags2 tag(s) resolve to nothingdans l’admin ↗', false],
      ['warn', 'Character1 newdans l’admin ↗', false],
      ['muted', 'Item3 typoOuvrir', false],
    ]);
    expect(page.text(page.el('h-inbox-count'))).toBe('3');
    expect(page.el('h-inbox-count').querySelector('.badge')?.className).toBe('badge ko');
    expect(
      page.all('#h-inbox a').map((a) => [a.getAttribute('href'), a.getAttribute('target')]),
    ).toEqual([
      ['https://outerpedia.local/admin/tags', '_blank'],
      ['https://outerpedia.local/admin/extractor/characters', '_blank'],
    ]);
    expect(page.text(page.all('[aria-label="À faire"] .card-head')[0])).toContain(
      "extraction, tags, assets — lu par l'admin",
    );

    // « Dépôt » : le compte de « Pousser », le dernier commit, l'index.
    expect(page.text(page.el('h-git-branch'))).toBe('main');
    expect(page.rows('h-git')).toEqual([
      ['info', '2 commits à pousser« Pousser », dans l’en-tête', false],
      ['muted', 'f1b28e5feat(quick): tableau de bord · il y a 3 heures', false],
      [
        'warn',
        '3 fichiers modifiésou non suivis — ce qui est indexé part avec le prochain enregistrement',
        true,
      ],
    ]);
    // L'en-tête dit le même compte que la carte.
    expect(page.text(page.el('push-count'))).toBe('2');

    // « Jeu » : égal, en vert.
    expect(page.rows('h-game')).toEqual([['ok', 'site 1.11.404 · client 1.11.404à jour', true]]);

    // « Publication » : les bannières, puis les codes promo.
    expect(page.rows('h-banners')).toEqual([
      ['ok', 'Belladernier jour', false],
      ['ok', 'Anna12 j restants', false],
      ['info', 'Danadans 5 j', false],
      ['warn', '2 à insérer · 1 à alignerd’après la table du jeu', true],
    ]);
    expect(page.text(page.el('h-banners-count'))).toBe('2 actives1 à venir');
    expect(page.all('#h-banners .face')[0].getAttribute('src')).toMatch(
      /\/images\/characters\/faceicon\/FI_2\.webp$/,
    );
    expect(page.rows('h-coupons')).toEqual([
      ['warn', 'LASTDAYdernier jour', false],
      ['warn', 'OPLIVE09expire dans 3 j', false],
    ]);
    expect(page.text(page.el('h-coupons-count'))).toBe('8 actifs');
  });

  it('rien à signaler : « Rien à faire. », et des pastilles vertes', async () => {
    const page = await dashboard({ state: quiet() });
    expect(page.notes('h-inbox')).toEqual(['Rien à faire.']);
    expect(page.rows('h-inbox')).toEqual([]);
    expect(page.text(page.el('h-inbox-count'))).toBe('');
    expect(page.rows('h-git')).toEqual([
      ['ok', 'rien à pousser', false],
      ['ok', 'aucun fichier modifié', false],
    ]);
    expect(page.notes('h-banners')).toEqual(['Aucune bannière active ni à venir.']);
    expect(page.notes('h-coupons')).toEqual(['Aucun code n’expire sous 7 jours.']);
    expect(page.el('h-coupons-count').querySelector('.badge')?.className).toBe('badge off');
    expect(page.text(page.el('h-coupons-count'))).toBe('0 actif');
  });

  it('les teintes du jeu : un patch attend en ambre, sans client atténué, la proposition dite', async () => {
    const game = async (over: Partial<NonNullable<Dash['game']>>) =>
      (
        await dashboard({
          state: quiet({
            game: {
              site: '1.11.404',
              version: '1.11.404',
              client: 'same',
              proposal: false,
              ...over,
            },
          }),
        })
      ).rows('h-game');

    // La section « Patch » n'existe pas encore : du texte, pas un bouton.
    expect(await game({ version: '1.11.405', client: 'ahead' })).toEqual([
      ['warn', 'site 1.11.404 · client 1.11.405un patch attend : onglet Patch', true],
    ]);
    expect(await game({ version: null, client: 'absent' })).toEqual([
      ['muted', 'site 1.11.404 · client —pas de client Steam sur ce poste', true],
    ]);
    expect(await game({ version: '1.11.403', client: 'behind' })).toEqual([
      ['muted', 'site 1.11.404 · client 1.11.403le client de ce poste est en retard', true],
    ]);
    expect(await game({ proposal: true })).toEqual([
      ['ok', 'site 1.11.404 · client 1.11.404à jour', true],
      [
        'warn',
        'proposition d’extraction en attentedata/extracted/ : à revoir, puis promouvoir',
        true,
      ],
    ]);
  });

  it('le dépôt en retard ou sans amont : la règle de l’en-tête', async () => {
    const late = await dashboard({
      state: quiet({ git: { branch: 'main', ahead: 1, behind: 3, last: null, dirty: 1 } }),
    });
    expect(late.rows('h-git')).toEqual([
      ['info', '1 commit à pousser« Pousser », dans l’en-tête', false],
      ['warn', '3 commits de retard sur origin`git pull --rebase` d’abord, au terminal', true],
      [
        'warn',
        '1 fichier modifiéou non suivis — ce qui est indexé part avec le prochain enregistrement',
        true,
      ],
    ]);
    expect(late.el('push-count').classList.contains('warn')).toBe(true);

    const none = await dashboard({
      state: quiet({ git: { branch: 'essai', ahead: null, behind: 0, last: null, dirty: 0 } }),
    });
    expect(none.rows('h-git')[0]).toEqual(['muted', 'pas d’amontrien ne peut partir d’ici', false]);
    expect(none.text(none.el('push-count'))).toBe('pas d’amont');
  });

  it('un bloc illisible le dit dans SA carte, les autres sont servis', async () => {
    const page = await dashboard({
      state: busy({
        inbox: null,
        game: null,
        errors: { inbox: 'extraction indisponible', game: 'manifest.dat illisible' },
      }),
    });
    expect(page.notes('h-inbox')).toEqual(['Illisible : extraction indisponible']);
    expect(page.all('#h-inbox .h-note')[0].className).toBe('h-note ko');
    expect(page.notes('h-game')).toEqual(['Illisible : manifest.dat illisible']);
    expect(page.rows('h-git')).toHaveLength(3);
    expect(page.rows('h-banners')).toHaveLength(4);
    // Rien dans le journal : la route a répondu.
    expect(page.el('journal').hidden).toBe(true);

    // Sans table du jeu, R2 injoignable : dits en clair, sous leurs lignes.
    const partial = await dashboard({
      state: quiet({
        banners: { active: [], upcoming: [], missing: 0, drift: 0, gameError: 'Pas de données.' },
        coupons: { total: 1, active: 1, within: 7, expiring: [], error: 'R2 unreadable: x' },
      }),
    });
    expect(partial.notes('h-banners')).toEqual([
      'Aucune bannière active ni à venir.',
      'Pas de données.',
    ]);
    expect(partial.notes('h-coupons')).toEqual([
      'Aucun code n’expire sous 7 jours.',
      'R2 unreadable: x — instantané local.',
    ]);
  });

  it('une route en erreur passe par le journal, et « Actualiser » se rallume', async () => {
    const page = await dashboard({ status: 500 });
    expect(page.el('journal').dataset.state).toBe('ko');
    expect(page.text(page.el('log'))).toBe(
      'Tableau de bord illisible : Error: Error: route cassée',
    );
    expect(page.el('h-refresh').disabled).toBe(false);
    expect(page.el('h-refresh').classList.contains('busy')).toBe(false);
  });

  it('« Actualiser » relit, et redessine ce que le serveur dit maintenant', async () => {
    const page = await dashboard();
    expect(page.rows('h-inbox')).toHaveLength(3);
    page.served.state = quiet();
    page.el('h-refresh').click();
    expect(page.el('h-refresh').disabled).toBe(true);
    expect(page.el('h-refresh').classList.contains('busy')).toBe(true);
    await page.settle();
    expect(page.served.reads).toBe(2);
    expect(page.notes('h-inbox')).toEqual(['Rien à faire.']);
    expect(page.el('h-refresh').disabled).toBe(false);
    expect(page.el('h-refresh').classList.contains('busy')).toBe(false);
  });

  it('les boutons renvoient à leur section ; revenir sur l’onglet relit', async () => {
    const page = await dashboard();
    const button = (label: string) =>
      page.all('#tab-dashboard button').find((b) => page.text(b) === label) as HTMLElement;

    button('Ouvrir Bannières').click();
    expect(page.el('tab-banners').hidden).toBe(false);
    expect(page.el('tab-dashboard').hidden).toBe(true);
    expect(page.all('#groups [data-group="publication"]')[0].getAttribute('aria-selected')).toBe(
      'true',
    );
    await page.settle();
    expect(page.served.reads).toBe(1);

    // Le groupe Accueil ramène au tableau de bord, qui se relit.
    page.all('#groups [data-group="home"]')[0].click();
    await page.settle();
    expect(page.el('tab-dashboard').hidden).toBe(false);
    expect(page.served.reads).toBe(2);

    button('Ouvrir Codes promo').click();
    expect(page.el('tab-coupons').hidden).toBe(false);
    page.all('#tabs [data-tab="dashboard"]')[0].click();
    await page.settle();
    expect(page.served.reads).toBe(3);

    // Un item de l'inbox que quick a déjà : son bouton, pas le lien de l'admin.
    button('Ouvrir').click();
    expect(page.el('tab-names').hidden).toBe(false);
  });

  it('ouvert sur un autre onglet (`#coupons`), il ne lit rien avant qu’on y vienne', async () => {
    const page = await dashboard({ hash: '#coupons' });
    expect(page.el('tab-coupons').hidden).toBe(false);
    expect(page.el('tab-dashboard').hidden).toBe(true);
    expect(page.served.reads).toBe(0);
    page.all('#groups [data-group="home"]')[0].click();
    await page.settle();
    expect(page.served.reads).toBe(1);
    expect(page.rows('h-inbox')).toHaveLength(3);
  });

  it('`quick:saved` : un geste réussi relit le tableau s’il est à l’écran — pas autrement', async () => {
    const page = await dashboard();
    expect(page.el('push').disabled).toBe(false);
    page.served.state = quiet();
    page.el('push').click();
    await page.settle();
    expect(page.posts).toEqual(['/api/push']);
    expect(page.served.reads).toBe(2);
    expect(page.rows('h-git')[0]).toEqual(['ok', 'rien à pousser', false]);

    // Un push refusé n'a rien changé : pas de relecture.
    const refused = await dashboard({
      pushed: {
        ok: false,
        log: ['git push a échoué'],
        git: { branch: 'main', ahead: 2, behind: 1 },
      },
    });
    refused.el('push').click();
    await refused.settle();
    expect(refused.posts).toEqual(['/api/push']);
    expect(refused.served.reads).toBe(1);

    // Tableau caché : il se relira en revenant, pas maintenant.
    const hidden = await dashboard({
      hash: '#coupons',
      git: { branch: 'main', ahead: 1, behind: 0 },
    });
    expect(hidden.el('push').disabled).toBe(false);
    hidden.el('push').click();
    await hidden.settle();
    expect(hidden.posts).toEqual(['/api/push']);
    expect(hidden.served.reads).toBe(0);
  });
});
