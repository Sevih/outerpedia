import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { Window } from 'happy-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { newEffectId } from '@/lib/admin/effect-catalog';
import { effectHaystack, effectMatches } from '@/lib/admin/effect-search';
import type { GitState } from './actions';
import { READ_ONLY_POSTS, openTab, tabsOf as menuTabs } from './shot.mjs';
import { UI_TYPES, assemblePage, resolveUiFile, tabsOf } from './ui-serve';

const UI = resolve(import.meta.dirname, 'ui');
const TABS = [
  'dashboard',
  'patch',
  'coupons',
  'banners',
  'changelog',
  'comics',
  'videos',
  'ranks',
  'gamedata',
  'character',
  'effects',
  'monsters',
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

  it('assemble la vraie page : quatorze sections, plus aucun marqueur', () => {
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
    // Et rien dans `tabs/` que la coquille ne réclame pas — sauf Gear reco, qui
    // n'est plus une section : un module et sa feuille, sans markup à lui.
    expect(readdirSync(resolve(UI, 'tabs')).sort()).toEqual(
      [...TABS.flatMap((t) => [`${t}.css`, `${t}.html`, `${t}.js`]), 'gear.css', 'gear.js'].sort(),
    );
  });

  it('Gear reco n’est plus une section : ni menu, ni marqueur, ni feuille, ni import — la fiche le charge', () => {
    const tab = (file: string): string => readFileSync(resolve(UI, 'tabs', file), 'utf8');
    expect(shell()).not.toMatch(/gear/i);
    expect(readFileSync(resolve(UI, 'lib.js'), 'utf8')).not.toContain("id: 'gear'");
    expect(tab('gear.js')).not.toContain('sections.register');
    // Le module et sa feuille viennent avec la « Fiche perso », son hôte dans son markup.
    expect(tab('character.js')).toContain("from './gear.js';");
    expect(tab('character.css')).toContain("@import url('/ui/tabs/gear.css');");
    expect(tab('character.html')).toContain('<div id="c-gear" role="tabpanel"');
    // Sa feuille ne règle que ce qui vit sous cet hôte.
    const selectors = tab('gear.css')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .split('}')
      .filter((rule) => rule.includes('{'))
      // Dans un `@media` ou un `@container`, la règle est après son accolade.
      .map((rule) => rule.slice(0, rule.lastIndexOf('{')))
      .flatMap((head) => head.slice(head.lastIndexOf('{') + 1).split(','))
      .map((sel) => sel.trim());
    expect(selectors.length).toBeGreaterThan(100);
    expect(selectors.filter((sel) => !sel.startsWith('#c-gear'))).toEqual([]);
  });

  it('aucun `id` en double dans la page : deux onglets peuvent partager une lettre, pas un id', () => {
    // « Fiche perso » et Codes promo préfixent tous deux en `c-` : un id repris
    // et `$('c-list')` rendrait l'élément de l'autre onglet, sans erreur.
    const ids = [...assemblePage(shell(), readTab).matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
    // Et ceux que `character.js` pose lui-même ne sont pas ceux de Codes promo.
    const coupons = [...(readTab('coupons') ?? '').matchAll(/\sid="(c-[^"]+)"/g)].map((m) => m[1]);
    const posed = readFileSync(resolve(UI, 'tabs', 'character.js'), 'utf8');
    expect(coupons.length).toBeGreaterThan(0);
    expect(coupons.filter((id) => posed.includes(`id="${id}"`))).toEqual([]);
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
      '/api/patch/refresh',
      '/api/patch/promote',
      '/api/patch/commit',
      '/api/patch/stop',
      '/api/coupons',
      '/api/banners',
      '/api/changelog',
      '/api/translate',
      '/api/gear-reco/translate',
      '/api/comics',
      '/api/video',
      '/api/ranks',
      '/api/gear-reco',
      '/api/names',
      '/api/effects',
      '/api/character',
      '/api/monsters',
      '/api/discord/send',
      '/api/quit',
    ])
      expect(READ_ONLY_POSTS.has(path), path).toBe(false);
  });

  it('relaie le verdict d’un nom court saisi : il ne fait que lire', () => {
    expect(READ_ONLY_POSTS.has('/api/names/fit')).toBe(true);
  });

  it('du journal du site, relaie l’aperçu d’une entrée et rien d’autre', () => {
    expect([...READ_ONLY_POSTS].filter((path) => path.startsWith('/api/changelog'))).toEqual([
      '/api/changelog/preview',
    ]);
  });

  it('des effets, ne relaie aucun POST : la recherche et l’id d’une création sont des GET', () => {
    expect([...READ_ONLY_POSTS].filter((path) => path.startsWith('/api/effects'))).toEqual([]);
  });

  it('de la fiche perso, relaie l’aperçu de ses textes et rien d’autre', () => {
    expect([...READ_ONLY_POSTS].filter((path) => path.startsWith('/api/character'))).toEqual([
      '/api/character/preview',
    ]);
  });

  it('des monstres, ne relaie aucun POST : le roster et l’état d’un kit sont des GET', () => {
    expect([...READ_ONLY_POSTS].filter((path) => path.startsWith('/api/monsters'))).toEqual([]);
  });

  it('des tables du jeu, ne relaie aucun POST : l’onglet ne fait que des GET', () => {
    expect([...READ_ONLY_POSTS].filter((path) => path.startsWith('/api/gamedata'))).toEqual([]);
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

describe('Effets — la page, sur le vrai markup', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  const LANGS = ['en', 'jp', 'kr', 'zh', 'fr', 'es'];

  interface Curated {
    name?: Record<string, string>;
    desc?: Record<string, string>;
    icon?: string;
    isDebuff?: boolean;
    keys?: string[];
    tag?: string;
    hidden?: boolean;
    note?: string;
  }
  interface Row {
    id: string;
    name: string;
    icon: string;
    isDebuff: boolean;
    origin: string;
    iconEditorial: boolean;
    irremovable: boolean;
    tag: string | null;
    family: string | null;
    overridden: boolean;
    hidden: boolean;
    noDesc: boolean;
    keys: string[];
    extracted: {
      name: Record<string, string>;
      desc: Record<string, string>;
      icon: string;
      isDebuff: boolean;
      tooltips: string[];
    } | null;
    curated: Curated;
  }
  const row = (id: string, name: string, over: Partial<Row> = {}): Row => ({
    id,
    name,
    icon: `IG_${id}`,
    isDebuff: false,
    origin: 'tooltip',
    iconEditorial: false,
    irremovable: false,
    tag: null,
    family: null,
    overridden: false,
    hidden: false,
    noDesc: false,
    keys: [],
    extracted: {
      name: { en: name },
      desc: { en: `${name}.` },
      icon: `IG_${id}`,
      isDebuff: Boolean(over.isDebuff),
      tooltips: [id],
    },
    curated: {},
    ...over,
  });

  /** Une paire, une création et deux debuffs sans miroir — un masqué, un sans description. */
  const catalog = () => ({
    pairs: [
      {
        buff: row('15', 'Increased Speed', {
          keys: ['BT_STAT|ST_SPEED', 'INCREASED_SPEED'],
          extracted: {
            name: { en: 'Increased Speed', jp: 'スピードUP', fr: 'Vitesse accrue' },
            desc: { en: 'Increases <color=#fff>Speed</color>.\\nStacks.' },
            icon: 'IG_15',
            isDebuff: false,
            tooltips: ['15', '2015'],
          },
        }),
        debuff: row('26', 'Reduced Speed', { isDebuff: true, keys: ['BT_STAT|ST_SPEED'] }),
      },
    ],
    orphanBuffs: [
      row('UNCOUNTERABLE', 'Uncounterable', {
        icon: 'IG_Buff_Seal_Counter',
        origin: 'curated',
        iconEditorial: true,
        tag: 'utility',
        family: 'Utility',
        overridden: true,
        keys: ['BT_SEAL_COUNTER'],
        extracted: null,
        curated: {
          name: { en: 'Uncounterable', fr: 'Incontrable' },
          icon: 'IG_Buff_Seal_Counter',
          keys: ['BT_SEAL_COUNTER'],
          tag: 'utility',
          note: 'création',
        },
      }),
    ],
    orphanDebuffs: [
      row('1', 'Burned', {
        isDebuff: true,
        hidden: true,
        overridden: true,
        curated: { hidden: true },
      }),
      row('900', 'Zap', { icon: '', isDebuff: true, origin: 'type', noDesc: true }),
    ],
  });
  const rowsOf = (c: ReturnType<typeof catalog>): Row[] => [
    ...c.pairs.flatMap((p) => [p.buff, p.debuff]),
    ...c.orphanBuffs,
    ...c.orphanDebuffs,
  ];

  type Call = { path: string; body?: unknown };
  type Saved = { ok: boolean; log: string[]; [more: string]: unknown };

  /**
   * La page de quick dans un document happy-dom, comme pour Noms : la VRAIE
   * coquille assemblée, le vrai `lib.js` et le vrai `tabs/effects.js`. `fetch`
   * est factice : il sert `disk.catalog`, répond à la recherche par la VRAIE
   * règle (`effectMatches` sur les lignes servies — la raison affichée est
   * celle que le serveur rendrait), forge l'id d'une création comme l'admin,
   * et note tout ce que la page demande.
   */
  async function effects(
    opts: {
      hash?: string;
      saved?: (body: unknown) => Saved;
      edit?: (c: ReturnType<typeof catalog>) => void;
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

    const disk = { catalog: catalog() };
    opts.edit?.(disk.catalog);
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
      const url = new URL(path, 'http://localhost:4747');
      if (url.pathname.startsWith('/api/effects')) calls.push(body ? { path, body } : { path });
      if (url.pathname === '/api/effects/state')
        return answer({
          catalog: disk.catalog,
          counts: {
            total: 5,
            statuses: 3,
            mechanics: 1,
            creations: 1,
            curated: 2,
            noDesc: 1,
            hidden: 1,
          },
          families: {
            buff: [
              { value: 'statBoosts', label: 'Stat Boosts' },
              { value: 'utility', label: 'Utility' },
            ],
            debuff: [
              { value: 'cc', label: 'Control Effects (CC)' },
              { value: 'utility', label: 'Utility Debuffs' },
            ],
          },
          origins: { tooltip: 'statut', type: 'mécanique', curated: 'création' },
          langs: LANGS,
          sprite: 'images/ui/effect',
          icons: ['IG_15', 'IG_Buff_Seal_Counter'],
        });
      if (url.pathname === '/api/effects/search') {
        const q = url.searchParams.get('q') ?? '';
        const matches: Record<string, unknown> = {};
        for (const r of rowsOf(disk.catalog)) {
          const name = { ...r.extracted?.name, ...r.curated.name };
          const hit = effectMatches(effectHaystack({ id: r.id, keys: r.keys, name }), q);
          if (hit) matches[r.id] = hit;
        }
        return answer({ q, matches });
      }
      if (url.pathname === '/api/effects/id') {
        const id = newEffectId(url.searchParams.get('raw') ?? '');
        return answer({ id, exists: rowsOf(disk.catalog).some((r) => r.id === id) });
      }
      if (url.pathname === '/api/effects')
        return answer(opts.saved?.(body) ?? { ok: true, log: ['fait'] });
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
    await import(/* @vite-ignore */ resolve(UI, 'tabs', 'effects.js'));
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
    const type = (input: HTMLInputElement, value: string) => {
      input.value = value;
      fire(input, 'input');
    };
    const cell = (b: Element | null): string =>
      b?.classList.contains('x-row')
        ? `${b.classList.contains('x-dim') ? '~' : ''}${(b as HTMLElement).dataset.id}`
        : '';
    return {
      el,
      all,
      calls,
      confirm,
      disk,
      settle,
      type,
      fire,
      /** Le catalogue tel qu'il se lit : une rangée par ligne, `~` devant un miroir atténué. */
      grid: () =>
        all('#x-rows > *').map((line) =>
          line.classList.contains('x-sep')
            ? line.textContent
            : [...line.children].map((b) => cell(b)).join(' | '),
        ),
      /** Une ligne : son nom, ses badges, sa seconde ligne, sa raison, son point. */
      line: (id: string) => {
        const b = all('#x-rows .x-row').find((r) => r.dataset.id === id);
        return {
          name: b?.querySelector('.x-name')?.textContent,
          badges: [...(b?.querySelectorAll('.badge') ?? [])].map((x) => x.textContent),
          meta: b?.querySelector('.x-meta')?.textContent,
          why: b?.querySelector('.x-why')?.textContent ?? '',
          dot: b?.querySelector('.pt')?.className ?? '',
          icon: b?.querySelector('.x-ico')?.className,
        };
      },
      open: (id: string) =>
        all('#x-rows .x-row')
          .find((b) => b.dataset.id === id)
          ?.click(),
      /** Cherche, et attend la réponse (200 ms après la dernière frappe). */
      search: async (q: string) => {
        vi.useFakeTimers();
        type(el('x-q'), q);
        await vi.advanceTimersByTimeAsync(200);
        vi.useRealTimers();
        await settle();
      },
      check: (id: string, on = true) => {
        el(id).checked = on;
        fire(el(id), 'input');
      },
      pick: (id: string, value: string) => {
        el(id).value = value;
        fire(el(id), 'input');
      },
      /** Un champ de la fiche, par son `data-f` (et sa langue). */
      field: (f: string, lang?: string) =>
        all(
          `#x-sheet [data-f="${f}"]${lang ? `[data-lang="${lang}"]` : ''}`,
        )[0] as HTMLInputElement,
      /** L'option qu'un menu porte `selected` (cf. `picked` du journal du site). */
      picked: (select: HTMLElement) =>
        (select.querySelector('option[selected]') as HTMLOptionElement | null)?.value,
      options: (select: HTMLElement) =>
        [...select.querySelectorAll('option')].map((o) => o.textContent),
    };
  }

  it('le groupe Éditeurs n’est plus « à venir » : Effets y est, en pleine largeur', async () => {
    const { all, el } = await effects();
    const group = all('#groups button').find((b) => b.textContent?.includes('Éditeurs'));
    expect(group?.dataset.group).toBe('editors');
    expect(group?.classList.contains('soon')).toBe(false);
    expect(el('tab-effects').hidden).toBe(true);
    // Le groupe s'ouvre sur sa première section, « Fiche perso » ; Effets suit.
    group?.click();
    expect(el('tab-effects').hidden).toBe(true);
    all('#tabs [data-tab="effects"]')[0].click();
    expect(el('tab-effects').hidden).toBe(false);
    expect(all('#tabs [data-tab="effects"]')[0].getAttribute('aria-selected')).toBe('true');
    expect(all('#tabs [data-tab="effects"]')[0].textContent).toBe('Effets');
    expect(all('main')[0].classList.contains('wide')).toBe(true);
    // Pas de menu latéral : une recherche, des filtres, le catalogue, la fiche.
    expect(all('#tab-effects aside, #tab-effects nav')).toEqual([]);
  });

  it('le catalogue : les paires côte à côte, puis les effets sans miroir', async () => {
    const page = await effects();
    expect(page.grid()).toEqual(['15 | 26', 'Sans miroir (3)', 'UNCOUNTERABLE | 1', ' | 900']);
    expect(page.el('x-heads').hidden).toBe(false);
    expect(page.el('x-total').textContent).toBe(
      '5 effets — 3 statuts, 1 mécanique, 1 création · 2 curés · 1 sans description · 1 masqué',
    );
    expect(page.line('15')).toEqual({
      name: 'Increased Speed',
      badges: ['buff'],
      meta: '15 · statut',
      why: '',
      dot: '',
      icon: 'x-ico buff',
    });
    // Une création curée : son origine, sa famille ; pas de « curé » en double.
    expect(page.line('UNCOUNTERABLE').meta).toBe('UNCOUNTERABLE · création · Utility');
    // Un effet extrait qui porte une entrée curée le dit.
    expect(page.line('1')).toMatchObject({
      badges: ['debuff', 'masqué'],
      meta: '1 · statut · curé',
      icon: 'x-ico debuff',
    });
    expect(page.line('900')).toMatchObject({
      badges: ['debuff', 'sans description', 'sans icône'],
      meta: '900 · mécanique',
      icon: 'x-ico none',
    });
    expect(page.all('#x-rows .badge.warn').map((b) => b.textContent)).toEqual(['sans description']);
  });

  it('la tuile : l’icône en masque teinté, sous la base des images ; « Interruption » garde ses couleurs', async () => {
    const page = await effects({
      edit: (c) => (c.pairs[0].debuff.icon = 'IG_Buff_Stat_Speed_Interruption_D'),
    });
    const tinted = page.all('#x-rows .x-row[data-id="15"] .x-ico')[0];
    expect(tinted.getAttribute('style')).toBe(
      "--x-src: url('https://img.test/images/ui/effect/IG_15.webp')",
    );
    expect(tinted.querySelectorAll('i')).toHaveLength(3);
    expect(tinted.getAttribute('aria-hidden')).toBe('true');
    const native = page.all('#x-rows .x-row[data-id="26"] .x-ico')[0];
    expect(native.className).toBe('x-ico');
    expect(native.querySelectorAll('i')).toHaveLength(0);
    expect(native.querySelector('img')?.getAttribute('src')).toBe(
      'https://img.test/images/ui/effect/IG_Buff_Stat_Speed_Interruption_D.webp',
    );
  });

  it('la recherche part 200 ms après la dernière frappe, et chaque ligne dit POURQUOI elle sort', async () => {
    const page = await effects();
    vi.useFakeTimers();
    page.type(page.el('x-q'), 'sp');
    page.type(page.el('x-q'), 'spe');
    await vi.advanceTimersByTimeAsync(199);
    expect(page.calls.filter((c) => c.path.includes('/search'))).toEqual([]);
    await vi.advanceTimersByTimeAsync(1);
    vi.useRealTimers();
    await page.settle();
    expect(page.calls.filter((c) => c.path.includes('/search'))).toEqual([
      { path: '/api/effects/search?q=spe' },
    ]);
    expect(page.grid()).toEqual(['15 | 26']);
    expect(page.line('15').why).toBe('nom en');
    expect(page.line('26').why).toBe('nom en');
    expect(page.el('x-total').textContent).toBe('2 sur 5 effets');

    // Par la clé : la raison la nomme.
    await page.search('BT_SP');
    expect(page.grid()).toEqual(['15 | 26']);
    expect(page.line('15').why).toBe('clé BT_STAT|ST_SPEED');

    // Par une autre langue que celle de la ligne : la raison montre le nom trouvé.
    await page.search('スピ');
    expect(page.line('15').why).toBe('nom jp · スピードUP');
    // La paire reste entière : le miroir qui ne répond pas est atténué, sans raison.
    expect(page.grid()).toEqual(['15 | ~26']);
    expect(page.line('26').why).toBe('');
    await page.search('accrue');
    expect(page.line('15').why).toBe('nom fr · Vitesse accrue');

    await page.search('seal');
    expect(page.grid()).toEqual(['Sans miroir (1)', 'UNCOUNTERABLE | ']);
    expect(page.line('UNCOUNTERABLE').why).toBe('clé BT_SEAL_COUNTER');
    await page.search('900');
    expect(page.line('900').why).toBe('id 900');
  });

  it('« tes » ne sort plus Increased Speed : la liste le dit, plutôt que de rester blanche', async () => {
    const page = await effects();
    await page.search('tes');
    expect(page.grid()).toEqual([]);
    expect(page.el('x-empty').hidden).toBe(false);
    expect(page.el('x-empty').textContent).toBe('Aucun effet ne correspond.');
    expect(page.el('x-heads').hidden).toBe(true);
    expect(page.el('x-total').textContent).toBe('0 sur 5 effets');

    // Champ vidé : tout revient aussitôt, sans attendre ni demander.
    const asked = page.calls.length;
    page.type(page.el('x-q'), '');
    expect(page.grid()).toHaveLength(4);
    expect(page.calls).toHaveLength(asked);
  });

  it('les filtres : une nature = une colonne ; sans description, curés seulement, masqués', async () => {
    const page = await effects();
    page.pick('x-nature', 'debuff');
    expect(page.grid()).toEqual(['26', 'Sans miroir (2)', '1', '900']);
    expect(page.el('x-rows').classList.contains('one')).toBe(true);
    expect(page.el('x-heads').hidden).toBe(true);
    expect(page.el('x-total').textContent).toBe('3 sur 5 effets');
    page.pick('x-nature', 'buff');
    expect(page.grid()).toEqual(['15', 'Sans miroir (1)', 'UNCOUNTERABLE']);
    page.pick('x-nature', '');
    expect(page.el('x-rows').classList.contains('one')).toBe(false);

    page.check('x-nodesc');
    expect(page.grid()).toEqual(['Sans miroir (1)', ' | 900']);
    page.check('x-nodesc', false);
    page.check('x-curated');
    expect(page.grid()).toEqual(['Sans miroir (2)', 'UNCOUNTERABLE | 1']);
    page.check('x-hidden');
    expect(page.grid()).toEqual(['Sans miroir (1)', ' | 1']);
    page.check('x-curated', false);
    page.check('x-hidden', false);

    // Les filtres se combinent avec la recherche.
    await page.search('spe');
    page.pick('x-nature', 'debuff');
    expect(page.grid()).toEqual(['26']);
  });

  it('la fiche d’un effet extrait : ce que le jeu fournit, et l’extrait en placeholder', async () => {
    const page = await effects();
    expect(page.el('x-sheet').textContent?.trim()).toBe('Choisir un effet dans le catalogue.');
    page.open('15');
    expect(location.hash).toBe('#effects/15');
    expect(page.all('#x-rows .x-row[aria-current="true"]').map((b) => b.dataset.id)).toEqual([
      '15',
    ]);
    expect(page.el('x-title').textContent).toBe('Increased Speed');
    expect(page.all('#x-sheet .x-who .x-meta')[0].textContent).toBe('15 · statut · icône du jeu');
    // Balises retirées, `\n` littéraux rendus en sauts de ligne.
    expect(page.all('#x-sheet .x-desc')[0].textContent).toBe('Increases Speed.\nStacks.');
    expect(page.all('#x-sheet .x-key').map((c) => c.textContent)).toEqual([
      'BT_STAT|ST_SPEED',
      'INCREASED_SPEED',
    ]);
    expect(page.all('#x-sheet .x-ext .x-meta')[0].textContent).toBe(
      'Tooltips fusionnés : 15, 2015',
    );

    // Six langues pour le nom, six pour la description, vides : l'extrait est en gris.
    expect(page.all('#x-sheet [data-f="name"]')).toHaveLength(6);
    expect(page.all('#x-sheet [data-f="desc"]')).toHaveLength(6);
    expect(page.field('name', 'en').value).toBe('');
    expect(page.field('name', 'en').placeholder).toBe('Increased Speed');
    expect(page.field('name', 'fr').placeholder).toBe('Vitesse accrue');
    expect(page.field('name', 'kr').placeholder).toBe('');
    expect(page.field('desc', 'en').placeholder).toBe(
      'Increases <color=#fff>Speed</color>.\\nStacks.',
    );
    expect(page.field('icon').placeholder).toBe('IG_15');
    expect(page.field('icon').getAttribute('list')).toBe('x-icons');
    expect(page.all('#x-icons option').map((o) => o.getAttribute('value'))).toEqual([
      'IG_15',
      'IG_Buff_Seal_Counter',
    ]);
    expect(page.options(page.field('isDebuff'))).toEqual([
      'celle de l’extrait (buff)',
      'buff',
      'debuff',
    ]);
    expect(page.options(page.field('tag'))).toEqual([
      'par défaut (taxonomie)',
      'Stat Boosts',
      'Utility',
    ]);
    expect(page.field('hidden').checked).toBe(false);
    expect(page.el('x-sheet').textContent).toContain('retire l’entrée curée');
  });

  it('la fiche d’une création : son entrée curée dans les champs, l’anglais requis', async () => {
    const page = await effects({ hash: '#effects/UNCOUNTERABLE' });
    // `#effects/<id>` : l'onglet ouvert sur la fiche, sans clic.
    expect(page.el('tab-effects').hidden).toBe(false);
    expect(page.el('x-title').textContent).toBe('Uncounterable');
    expect(page.all('#x-sheet .x-who .x-meta')[0].textContent).toBe(
      'UNCOUNTERABLE · création · icône du wiki',
    );
    expect(page.all('#x-sheet .x-ext')).toEqual([]);
    expect(page.el('x-sheet').textContent).toContain('Aucune donnée extraite pour cet id');
    expect(page.field('name', 'en').value).toBe('Uncounterable');
    expect(page.field('name', 'fr').value).toBe('Incontrable');
    expect(page.field('icon').value).toBe('IG_Buff_Seal_Counter');
    expect(page.field('keys').value).toBe('BT_SEAL_COUNTER');
    expect(page.field('note').value).toBe('création');
    expect(page.picked(page.field('tag'))).toBe('utility');
    expect(page.options(page.field('isDebuff'))[0]).toBe('buff (par défaut)');
    expect(page.el('x-sheet').textContent).toContain(
      'Une création garde au moins son nom anglais.',
    );

    // Un id inconnu dans l'adresse : l'onglet s'ouvre, sans fiche.
    const ghost = await effects({ hash: '#effects/ghost' });
    expect(ghost.el('tab-effects').hidden).toBe(false);
    expect(ghost.el('x-sheet').textContent?.trim()).toBe('Choisir un effet dans le catalogue.');
  });

  it('la saisie : le point, le badge, la savebar ; la nature choisie change les familles proposées', async () => {
    const page = await effects();
    page.open('15');
    expect(page.el('x-count').textContent).toBe('aucune modification');
    expect(page.el('x-save').disabled).toBe(true);

    page.type(page.field('name', 'en'), 'Haste');
    expect(page.el('x-title').textContent).toBe('Haste');
    expect(page.line('15').dot).toBe('pt edit');
    expect(page.el('x-badges').textContent).toBe('buff' + 'modifié');
    expect(page.el('x-count').textContent).toBe('1 effet modifié');
    expect(page.el('x-save').disabled).toBe(false);

    // Debuff : les familles de ce côté, la tuile repeinte, le badge de la fiche.
    page.pick('x-isdebuff', 'true');
    expect(page.options(page.field('tag'))).toEqual([
      'par défaut (taxonomie)',
      'Control Effects (CC)',
      'Utility Debuffs',
    ]);
    expect(page.el('x-tag-label').textContent).toBe('Famille éditoriale (debuff)');
    expect(page.all('#x-preview .x-ico')[0].className).toBe('x-ico lg debuff');
    expect(page.el('x-badges').textContent).toBe('debuff' + 'modifié');
    // Une famille de l'AUTRE côté reste proposée : elle ne s'efface pas en douce.
    page.pick('x-tag', 'cc');
    page.pick('x-isdebuff', 'false');
    expect(page.options(page.field('tag'))).toEqual([
      'par défaut (taxonomie)',
      'Stat Boosts',
      'Utility',
      'cc (autre côté)',
    ]);
    expect(page.picked(page.field('tag'))).toBe('cc');

    // L'icône tapée est celle de la tuile de la fiche.
    page.type(page.field('icon'), "IG_It's(new)");
    expect(page.all('#x-preview .x-ico')[0].getAttribute('style')).toBe(
      "--x-src: url('https://img.test/images/ui/effect/IG_It%27s%28new%29.webp')",
    );

    // Revenu aux valeurs du disque : plus rien en attente.
    page.type(page.field('name', 'en'), ' ');
    page.type(page.field('icon'), '');
    page.pick('x-isdebuff', '');
    page.pick('x-tag', '');
    expect(page.line('15').dot).toBe('');
    expect(page.el('x-count').textContent).toBe('aucune modification');
    expect(page.el('x-save').disabled).toBe(true);
  });

  it('« Enregistrer » : tout le lot en UN envoi, ce que le disque portait joint, puis l’état relu', async () => {
    const page = await effects({
      saved: () => ({
        ok: false,
        log: ['REFUSÉ — …'],
        saved: ['15'],
        refused: ['26', '1'],
        stale: ['1'],
        reasons: { '26': 'Reduced Speed (26) : schéma', '1': 'Burned (1) : le disque a changé.' },
      }),
    });
    page.open('15');
    page.type(page.field('name', 'en'), ' Haste ');
    page.type(page.field('name', 'fr'), 'Hâte');
    page.type(page.field('keys'), 'HASTE,\n QUICK ,');
    page.open('26');
    page.pick('x-tag', 'cc');
    page.type(page.field('note'), 'à revoir');
    page.open('1');
    page.field('hidden').checked = false;
    page.fire(page.field('hidden'), 'input');
    expect(page.el('x-count').textContent).toBe('3 effets modifiés');
    page.calls.length = 0;

    // Ce que le disque rendra à la relecture : 15 a son entrée.
    const next = catalog();
    next.pairs[0].buff.name = 'Haste';
    next.pairs[0].buff.overridden = true;
    next.pairs[0].buff.curated = { name: { en: 'Haste', fr: 'Hâte' }, keys: ['HASTE', 'QUICK'] };
    page.disk.catalog = next;
    page.el('x-save').click();
    await page.settle();
    await page.settle();

    expect(page.calls[0]).toEqual({
      path: '/api/effects',
      body: {
        changes: [
          {
            id: '15',
            curated: { name: { en: 'Haste', fr: 'Hâte' }, keys: ['HASTE', 'QUICK'] },
            was: {},
          },
          { id: '26', curated: { tag: 'cc', note: 'à revoir' }, was: {} },
          { id: '1', curated: {}, was: { hidden: true } },
        ],
      },
    });
    expect(page.calls[1]).toEqual({ path: '/api/effects/state' });

    // Enregistré : plus en attente, la ligne suit le disque.
    expect(page.line('15')).toMatchObject({ name: 'Haste', dot: '' });
    // Refusé : la saisie RESTE (rien à retaper), marquée d'un point rouge.
    expect(page.line('26').dot).toBe('pt ko');
    page.open('26');
    expect(page.field('note').value).toBe('à revoir');
    expect(page.all('#x-badges .badge.ko').map((b) => [b.textContent, b.title])).toEqual([
      ['refusé', 'Reduced Speed (26) : schéma'],
    ]);
    // Refusé parce que le disque avait changé : la fiche montre le disque.
    expect(page.line('1').dot).toBe('pt ko');
    page.open('1');
    expect(page.field('hidden').checked).toBe(true);
    expect(page.el('x-count').textContent).toBe('1 effet modifié' + '2 refus');
    expect(page.el('x-save').disabled).toBe(false);
  });

  it('« ＋ effet » : l’id forgé par le serveur, une fiche vierge en tête, envoyée avec `create`', async () => {
    const page = await effects({
      saved: () => ({ ok: true, log: ['fait'], saved: ['FIXED_DAMAGE'], refused: [] }),
    });
    page.type(page.el('x-new-id'), ' fixed damage ');
    page.el('x-new').click();
    await page.settle();
    expect(page.calls.at(-1)).toEqual({ path: '/api/effects/id?raw=%20fixed%20damage%20' });
    expect(page.grid().slice(0, 2)).toEqual([
      'Nouveaux, pas encore enregistrés (1)',
      'FIXED_DAMAGE',
    ]);
    expect(page.line('FIXED_DAMAGE')).toMatchObject({
      name: 'sans nom',
      badges: ['buff', 'nouveau'],
      meta: 'FIXED_DAMAGE · création',
    });
    expect(page.el('x-new-id').value).toBe('');
    expect(location.hash).toBe('#effects/FIXED_DAMAGE');
    expect(page.el('x-title').textContent).toBe('FIXED_DAMAGE');
    expect(page.el('x-badges').textContent).toBe('buff' + 'nouveau');
    // Vierge, elle ne compte pas : rien à enregistrer, mais « Annuler » la retire.
    expect(page.el('x-count').textContent).toBe('aucune modification');
    expect(page.el('x-save').disabled).toBe(true);
    expect(page.el('x-reset').disabled).toBe(false);

    page.type(page.field('name', 'en'), 'Fixed Damage');
    page.type(page.field('keys'), 'FIXED_DAMAGE');
    expect(page.el('x-count').textContent).toBe('1 effet modifié');
    page.calls.length = 0;
    // À la relecture, la création est sur le disque : elle n'est plus un brouillon.
    const next = catalog();
    next.orphanBuffs.unshift(
      row('FIXED_DAMAGE', 'Fixed Damage', {
        origin: 'curated',
        overridden: true,
        extracted: null,
        curated: { name: { en: 'Fixed Damage' }, keys: ['FIXED_DAMAGE'] },
      }),
    );
    page.disk.catalog = next;
    page.el('x-save').click();
    await page.settle();
    await page.settle();
    expect(page.calls[0].body).toEqual({
      changes: [
        {
          id: 'FIXED_DAMAGE',
          curated: { name: { en: 'Fixed Damage' }, keys: ['FIXED_DAMAGE'] },
          was: {},
          create: true,
        },
      ],
    });
    expect(page.grid()).toEqual([
      '15 | 26',
      'Sans miroir (4)',
      'FIXED_DAMAGE | 1',
      'UNCOUNTERABLE | 900',
    ]);
    expect(page.line('FIXED_DAMAGE').badges).toEqual(['buff']);
    expect(page.el('x-count').textContent).toBe('aucune modification');
  });

  it('« ＋ effet » sur un id qui existe : sa fiche s’ouvre, rien n’est créé ; Entrée vaut le bouton', async () => {
    const page = await effects();
    page.type(page.el('x-new-id'), 'uncounterable');
    page.fire(page.el('x-new-id'), 'keydown', 'Enter');
    await page.settle();
    expect(page.grid()).toHaveLength(4);
    expect(page.el('x-title').textContent).toBe('Uncounterable');
    expect(page.el('journal-last').textContent).toBe(
      'UNCOUNTERABLE existe déjà : sa fiche est ouverte.',
    );

    // Sans id : rien n'est demandé au serveur.
    const asked = page.calls.length;
    page.el('x-new').click();
    await page.settle();
    expect(page.calls).toHaveLength(asked);
    expect(page.el('journal').dataset.state).toBe('ko');
  });

  it('« Annuler » rend le disque et retire les créations ; quitter avec des changements demande confirmation', async () => {
    const page = await effects({ hash: '#effects/15' });
    expect(page.confirm).not.toHaveBeenCalled();
    page.type(page.field('name', 'en'), 'Haste');
    page.type(page.el('x-new-id'), 'draft');
    page.el('x-new').click();
    await page.settle();
    expect(page.grid()[0]).toBe('Nouveaux, pas encore enregistrés (1)');

    page.confirm.mockReturnValueOnce(false);
    page.all('#tabs [data-tab="coupons"]')[0].click();
    expect(page.confirm).toHaveBeenCalledTimes(1);
    expect(page.confirm.mock.calls[0]).toEqual([
      '1 effet modifié, pas encore enregistré. Quitter l’onglet ? Ils restent en attente tant que la page n’est pas rechargée.',
    ]);
    expect(page.el('tab-effects').hidden).toBe(false);

    page.el('x-reset').click();
    expect(page.grid()).toHaveLength(4);
    expect(page.el('x-count').textContent).toBe('aucune modification');
    // La fiche montrée était celle de la création retirée.
    expect(page.el('x-sheet').textContent?.trim()).toBe('Choisir un effet dans le catalogue.');
    page.open('15');
    expect(page.field('name', 'en').value).toBe('');
    page.all('#tabs [data-tab="coupons"]')[0].click();
    expect(page.confirm).toHaveBeenCalledTimes(1);
    expect(page.el('tab-effects').hidden).toBe(true);
  });
});

describe('hero-picker — le picker de héros partagé, dans un document', () => {
  afterEach(() => vi.unstubAllGlobals());

  interface Hero {
    id: string;
    name: string;
    class: string;
    element?: string;
    builds?: number;
  }
  const ROSTER: Hero[] = [
    { id: '1', name: 'Aer', class: 'striker', element: 'fire', builds: 3 },
    { id: '2', name: 'Alice', class: 'mage', element: 'earth', builds: 0 },
    { id: '3', name: 'Astei', class: 'healer', element: 'fire', builds: 1 },
  ];
  type Options = {
    roster: Hero[];
    imgBase: string;
    title: string;
    onPick: (picked: unknown) => unknown;
    [more: string]: unknown;
  };

  /**
   * Le VRAI `hero-picker.mjs` dans un document happy-dom vide : la modale est à
   * lui, il la pose dans `<body>` au premier appel. Un bouton tient lieu de
   * celui qui l'ouvre.
   */
  async function picker() {
    vi.resetModules();
    const window = new Window({ url: 'http://localhost:4747/' });
    const { document } = window;
    document.body.innerHTML = '<button id="opener">Choisir</button>';
    vi.stubGlobal('window', window);
    vi.stubGlobal('document', document);
    const mod = (await import(/* @vite-ignore */ resolve(UI, 'hero-picker.mjs'))) as {
      openHeroPicker: (opts: Options) => void;
      closeHeroPicker: () => void;
      heroFilters: () => { elements: Set<string>; classes: Set<string>; seg: string };
    };
    const el = (id: string) => document.getElementById(id) as unknown as HTMLInputElement;
    const all = (selector: string) =>
      [...document.querySelectorAll(selector)] as unknown as HTMLElement[];
    const fire = (target: HTMLElement, type: string, key?: string) =>
      target.dispatchEvent(
        (key
          ? new window.KeyboardEvent(type, { key, bubbles: true, cancelable: true })
          : new window.Event(type, { bubbles: true })) as unknown as Event,
      );
    const onPick = vi.fn<(picked: unknown) => unknown>();
    return {
      ...mod,
      el,
      all,
      fire,
      onPick,
      document,
      open: (over: Partial<Options> = {}) =>
        mod.openHeroPicker({
          roster: ROSTER,
          imgBase: 'https://img.test',
          title: 'Choisir un perso',
          onPick,
          opener: () => el('opener'),
          ...over,
        }),
      names: () => all('#hp-results .hp-tile').map((t) => t.querySelector('.hp-n')?.textContent),
      tile: (id: string) => all('#hp-results .hp-tile').find((t) => t.dataset.id === id)!,
      search: (q: string) => {
        el('hp-q').value = q;
        fire(el('hp-q'), 'input');
      },
    };
  }

  it('pose SA modale dans <body>, une fois, et l’ouvre : titre, compte, tuiles, recherche au focus', async () => {
    const p = await picker();
    expect(p.el('hp-modal')).toBeNull();
    p.open();
    p.closeHeroPicker();
    p.open();

    expect(p.all('.hp-modal')).toHaveLength(1);
    expect(p.el('hp-modal').parentElement).toBe(p.document.body as unknown as HTMLElement);
    expect(p.el('hp-modal').hidden).toBe(false);
    expect(p.el('hp-title').textContent).toBe('Choisir un perso');
    expect(p.el('hp-tally').textContent).toBe('3 persos');
    expect(p.names()).toEqual(['Aer', 'Alice', 'Astei']);
    expect(p.document.activeElement).toBe(
      p.el('hp-q') as unknown as typeof p.document.activeElement,
    );
    // Une tuile : le visage, l'icône d'élément, le nom — sous la base des images.
    const tile = p.tile('1');
    expect(tile.title).toBe('Aer');
    expect(tile.querySelector('.hp-fi')?.getAttribute('src')).toBe(
      'https://img.test/images/characters/faceicon/FI_1.webp',
    );
    expect(tile.querySelector('.hp-el')?.getAttribute('src')).toBe(
      'https://img.test/images/ui/elem/IG_Turn_Element_Fire.webp',
    );
    // Choix unique : pas de pied, pas de pastille.
    expect(p.el('hp-foot').hidden).toBe(true);
    expect(p.all('.hp-cnt')).toEqual([]);
  });

  it('la recherche filtre par nom, et dit quand rien ne correspond', async () => {
    const p = await picker();
    p.open();
    p.search('  aL ');
    expect(p.names()).toEqual(['Alice']);
    expect(p.el('hp-none').hidden).toBe(true);
    p.search('zzz');
    expect(p.names()).toEqual([]);
    expect(p.el('hp-none').hidden).toBe(false);
    expect(p.el('hp-none').textContent).toBe('Aucun perso ne correspond.');
  });

  it('les pastilles : celles que le roster porte, dans l’ordre du site ; aucune enfoncée = tout', async () => {
    const p = await picker();
    p.open();
    const togs = (group: string) =>
      p.all(`#hp-filters [aria-label="${group}"] .hp-tog`).map((b) => b.getAttribute('aria-label'));
    expect(togs('Élément')).toEqual(['Fire', 'Earth']);
    expect(togs('Classe')).toEqual(['Striker', 'Mage', 'Healer']);

    p.all('#hp-filters [data-element="fire"]')[0].click();
    expect(p.names()).toEqual(['Aer', 'Astei']);
    expect(p.all('#hp-filters [data-element="fire"]')[0].getAttribute('aria-pressed')).toBe('true');
    p.all('#hp-filters [data-class="healer"]')[0].click();
    expect(p.names()).toEqual(['Astei']);
    p.all('#hp-filters [data-element="fire"]')[0].click();
    p.all('#hp-filters [data-class="healer"]')[0].click();
    expect(p.names()).toEqual(['Aer', 'Alice', 'Astei']);
  });

  it('les filtres survivent à la fermeture là où l’appelant les garde, pas la recherche', async () => {
    const p = await picker();
    const filters = p.heroFilters();
    p.open({ filters });
    p.all('#hp-filters [data-class="mage"]')[0].click();
    p.search('al');
    p.closeHeroPicker();

    p.open({ filters });
    expect(p.el('hp-q').value).toBe('');
    expect(p.names()).toEqual(['Alice']);
    expect(p.all('#hp-filters [data-class="mage"]')[0].getAttribute('aria-pressed')).toBe('true');
    // Un autre appelant, ses propres filtres : rien d'enfoncé.
    p.open({ filters: p.heroFilters() });
    expect(p.names()).toEqual(['Aer', 'Alice', 'Astei']);
  });

  it('choix unique : la tuile cliquée part à `onPick`, la modale se ferme, le focus revient', async () => {
    const p = await picker();
    p.open({ chosen: '2' });
    // Le perso en cours porte l'anneau.
    expect(p.tile('2').getAttribute('aria-current')).toBe('true');
    expect(p.tile('2').querySelector('.hp-ring')?.classList.contains('on')).toBe(true);
    expect(p.tile('1').hasAttribute('aria-current')).toBe(false);

    p.tile('3').click();
    expect(p.onPick.mock.calls).toEqual([['3']]);
    expect(p.el('hp-modal').hidden).toBe(true);
    expect(p.document.activeElement).toBe(
      p.el('opener') as unknown as typeof p.document.activeElement,
    );
  });

  it('`onPick` qui rend false garde la modale ouverte (un abandon refusé)', async () => {
    const p = await picker();
    p.onPick.mockReturnValue(false);
    p.open();
    p.tile('1').click();
    expect(p.onPick.mock.calls).toEqual([['1']]);
    expect(p.el('hp-modal').hidden).toBe(false);
  });

  it('Entrée dans la recherche prend la première tuile montrée', async () => {
    const p = await picker();
    p.open();
    p.search('as');
    p.fire(p.el('hp-q'), 'keydown', 'Enter');
    expect(p.onPick.mock.calls).toEqual([['3']]);
    expect(p.el('hp-modal').hidden).toBe(true);
  });

  it('Échap, la croix et le voile ferment sans rien poser', async () => {
    const p = await picker();
    p.open();
    p.fire(p.document.body as unknown as HTMLElement, 'keydown', 'Escape');
    expect(p.el('hp-modal').hidden).toBe(true);
    p.open();
    p.el('hp-close').click();
    expect(p.el('hp-modal').hidden).toBe(true);
    p.open();
    // Un clic DANS le panneau ne ferme pas ; sur le voile, si.
    p.all('.hp-panel')[0].click();
    expect(p.el('hp-modal').hidden).toBe(false);
    p.el('hp-modal').click();
    expect(p.el('hp-modal').hidden).toBe(true);
    expect(p.onPick).not.toHaveBeenCalled();
  });

  it('multi : les tuiles se cochent dans l’ordre des clics, le pied récapitule, « Valider » rend la liste', async () => {
    const p = await picker();
    p.open({ multi: true, chosen: ['3'] });
    expect(p.el('hp-foot').hidden).toBe(false);
    expect(p.el('hp-tally').textContent).toBe('1 choisi sur 3');
    expect(p.tile('3').getAttribute('aria-pressed')).toBe('true');
    expect(p.tile('3').querySelector('.hp-cnt')?.textContent).toBe('✓');
    expect(p.tile('1').getAttribute('aria-pressed')).toBe('false');

    p.tile('1').click();
    expect(p.el('hp-modal').hidden).toBe(false);
    expect(p.onPick).not.toHaveBeenCalled();
    expect(p.el('hp-tally').textContent).toBe('2 choisis sur 3');
    expect(p.all('#hp-foot .hp-recap')[0].textContent).toBe('Astei, Aer');
    // Un second clic décoche.
    p.tile('3').click();
    expect(p.all('#hp-foot .hp-recap')[0].textContent).toBe('Aer');
    p.tile('2').click();

    expect(p.all('#hp-foot button').map((b) => b.textContent)).toEqual(['Annuler', 'Valider']);
    p.all('#hp-foot [data-hp="ok"]')[0].click();
    expect(p.onPick.mock.calls).toEqual([[['1', '2']]]);
    expect(p.el('hp-modal').hidden).toBe(true);
  });

  it('multi : « Annuler » ne pose rien, Entrée dans la recherche valide', async () => {
    const p = await picker();
    p.open({ multi: true });
    expect(p.all('#hp-foot .hp-recap')[0].textContent).toBe('Aucun perso.');
    p.tile('2').click();
    p.all('#hp-foot [data-hp="cancel"]')[0].click();
    expect(p.el('hp-modal').hidden).toBe(true);
    expect(p.onPick).not.toHaveBeenCalled();

    p.open({ multi: true });
    p.tile('2').click();
    p.search('ae');
    p.fire(p.el('hp-q'), 'keydown', 'Enter');
    // La recherche ne décoche pas ce qu'elle cache.
    expect(p.onPick.mock.calls).toEqual([[['2']]]);
  });

  it('ce qu’un appelant y ajoute : un groupe segmenté, son badge, le `title` de ses tuiles', async () => {
    const p = await picker();
    p.open({
      tally: () => '3 persos · 2 avec recos · 1 sans',
      seg: {
        label: 'Recos',
        options: [
          ['', 'Tous'],
          ['with', 'Avec recos'],
          ['without', 'Sans recos'],
        ],
        test: (c: Hero, has: string) =>
          has === 'with' ? Boolean(c.builds) : has === 'without' ? !c.builds : true,
      },
      hint: (c: Hero) => `${c.name} — ${c.builds} builds`,
    });
    expect(p.el('hp-tally').textContent).toBe('3 persos · 2 avec recos · 1 sans');
    expect(p.tile('1').title).toBe('Aer — 3 builds');
    const seg = () => p.all('#hp-filters .hp-seg button');
    expect(seg().map((b) => [b.textContent, b.getAttribute('aria-pressed')])).toEqual([
      ['Tous', 'true'],
      ['Avec recos', 'false'],
      ['Sans recos', 'false'],
    ]);
    seg()[2].click();
    expect(p.names()).toEqual(['Alice']);
    expect(seg().map((b) => b.getAttribute('aria-pressed'))).toEqual(['false', 'false', 'true']);
    seg()[1].click();
    expect(p.names()).toEqual(['Aer', 'Astei']);
  });

  it('autre chose que des héros : `tile` dessine la tuile, `rows` la range en lignes, la recherche et le vide se nomment', async () => {
    const p = await picker();
    const effects = [
      { id: '1', name: 'Burned', isDebuff: true },
      { id: '7', name: 'Increased Attack', isDebuff: false },
    ];
    p.open({
      roster: effects as unknown as Hero[],
      title: 'Ajouter un effet',
      rows: true,
      tile: (o: { name: string }) => `<i class="fx"></i><span>${o.name}</span>`,
      placeholder: 'Chercher un effet…',
      none: 'Aucun effet ne correspond.',
    });
    expect(p.el('hp-q').placeholder).toBe('Chercher un effet…');
    expect(p.el('hp-q').getAttribute('aria-label')).toBe('Chercher un effet');
    expect(p.el('hp-results').className).toBe('hp-tiles rows');
    // La tuile est celle de l'appelant, dans le bouton du picker : ni visage ni anneau.
    expect(p.tile('1').innerHTML).toBe('<i class="fx"></i><span>Burned</span>');
    expect(p.tile('1').title).toBe('Burned');
    expect(p.all('#hp-results .hp-fi, #hp-results .hp-ring')).toEqual([]);
    // Sans classe ni élément : aucune pastille.
    expect(p.all('#hp-filters .hp-tog')).toEqual([]);
    p.search('att');
    expect(p.all('#hp-results .hp-tile').map((t) => t.dataset.id)).toEqual(['7']);
    p.search('zzz');
    expect(p.el('hp-none').textContent).toBe('Aucun effet ne correspond.');
    p.search('');
    p.tile('7').click();
    expect(p.onPick).toHaveBeenCalledWith('7');

    // Rouvert sur des héros : la grille de visages, ses mots à elle.
    p.open();
    expect(p.el('hp-q').placeholder).toBe('Chercher un perso…');
    expect(p.el('hp-q').getAttribute('aria-label')).toBe('Chercher un perso');
    expect(p.el('hp-results').className).toBe('hp-tiles');
    expect(p.el('hp-none').textContent).toBe('Aucun perso ne correspond.');
    expect(p.all('#hp-results .hp-fi')).toHaveLength(3);
  });

  it('`match` : la recherche de l’appelant remplace « le nom qui contient », sur la saisie en minuscules', async () => {
    const p = await picker();
    const match = vi.fn((c: Hero, q: string) => c.id === q || c.name.toLowerCase().startsWith(q));
    p.open({ match });
    // Par le début seulement : « li » est au milieu d'« Alice ».
    p.search('  AL ');
    expect(p.names()).toEqual(['Alice']);
    expect(match).toHaveBeenCalledWith(ROSTER[0], 'al');
    p.search('li');
    expect(p.names()).toEqual([]);
    // Et par ce que l'appelant veut : ici l'id.
    p.search('3');
    expect(p.names()).toEqual(['Astei']);
    // Une saisie vide ne lui demande rien : tout est montré.
    match.mockClear();
    p.search('');
    expect(p.names()).toEqual(['Aer', 'Alice', 'Astei']);
    expect(match).not.toHaveBeenCalled();
  });

  it('`pills` : des pastilles à libellé, après celles du roster ; aucune enfoncée = tout, et l’appelant les garde', async () => {
    const p = await picker();
    const filters = p.heroFilters();
    const pills = {
      label: 'Recos',
      options: [
        ['with', 'avec recos'],
        ['none', 'sans reco'],
      ],
      of: (c: Hero) => (c.builds ? 'with' : 'none'),
    };
    p.open({ pills, filters });
    const togs = () => p.all('#hp-filters [aria-label="Recos"] .hp-tog');
    expect(togs().map((b) => [b.textContent, b.className, b.getAttribute('aria-pressed')])).toEqual(
      [
        ['avec recos', 'hp-tog txt', 'false'],
        ['sans reco', 'hp-tog txt', 'false'],
      ],
    );
    expect(p.names()).toEqual(['Aer', 'Alice', 'Astei']);

    togs()[1].click();
    expect(p.names()).toEqual(['Alice']);
    expect(togs()[1].getAttribute('aria-pressed')).toBe('true');
    // Deux enfoncées : l'une OU l'autre ; elles se combinent aux pastilles du roster.
    togs()[0].click();
    expect(p.names()).toEqual(['Aer', 'Alice', 'Astei']);
    p.all('#hp-filters [data-element="fire"]')[0].click();
    togs()[1].click();
    expect(p.names()).toEqual(['Aer', 'Astei']);

    // Rouvert avec les mêmes filtres : la pastille est restée enfoncée.
    p.closeHeroPicker();
    p.open({ pills, filters });
    expect(togs().map((b) => b.getAttribute('aria-pressed'))).toEqual(['true', 'false']);
    // Sans `pills`, aucune pastille à libellé — et celles d'un autre appelant ne filtrent rien.
    p.open({ filters: { elements: new Set(), classes: new Set(), seg: '' } });
    expect(p.all('#hp-filters .hp-tog.txt')).toEqual([]);
    expect(p.names()).toEqual(['Aer', 'Alice', 'Astei']);
  });

  it('un roster sans élément : ni pastille d’élément, ni icône sur la tuile', async () => {
    const p = await picker();
    p.open({ roster: ROSTER.map(({ id, name, class: cls }) => ({ id, name, class: cls })) });
    expect(p.all('#hp-filters [data-element]')).toEqual([]);
    expect(p.all('#hp-results .hp-el')).toEqual([]);
    expect(p.names()).toEqual(['Aer', 'Alice', 'Astei']);
  });
});

describe('Fiche perso — la page, sur le vrai markup', () => {
  // L'horloge est FACTICE d'un bout à l'autre (cf. `character`) : l'aperçu des
  // textes part 400 ms après une frappe, et un minuteur laissé en vol par un
  // test irait frapper le `fetch` du suivant.
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  const AER = '2000055';
  const AIS = '2000096';
  const ALICE = '2000002';
  type Text = Partial<Record<string, string>>;
  /** Un pro du disque, traduit partout : les clés dans l'ordre du fichier. */
  const BEACH: Text = {
    en: 'Strips buffs with {D/BT_REMOVE_BUFF}',
    jp: 'jp {D/BT_REMOVE_BUFF}',
    kr: 'kr {D/BT_REMOVE_BUFF}',
    zh: 'zh {D/BT_REMOVE_BUFF}',
    fr: 'Retire les buffs avec {D/BT_REMOVE_BUFF}',
    es: 'es {D/BT_REMOVE_BUFF}',
  };
  interface Curated {
    rank?: string;
    rankPvp?: string;
    role?: string;
    tags?: string[];
    skillPriority?: { first?: number; second?: number; ultimate?: number };
    rankByTranscend?: Record<string, string>;
    roleByTranscend?: Record<string, string>;
    videos?: {
      platform: string;
      id: string;
      title?: string;
      author?: string;
      uploadDate?: string;
    }[];
    prosCons?: { pros?: Text[]; cons?: Text[] };
    synergies?: { heroes: string[]; reason?: Text }[];
  }
  const ROSTER = [
    { id: AER, name: 'Aer', element: 'fire', class: 'striker', subClass: 'attacker', rarity: 3 },
    {
      id: AIS,
      name: 'Ais Wallenstein',
      element: 'light',
      class: 'striker',
      subClass: 'attacker',
      rarity: 3,
    },
    { id: ALICE, name: 'Alice', element: 'earth', class: 'mage', subClass: 'wizard', rarity: 3 },
  ];
  /** Le curé du disque, par perso : Aer sans palier, Ais avec — et une synergie. */
  const curated = (): Record<string, Curated> => ({
    [AER]: {
      prosCons: { pros: [BEACH, { en: 'strong' }], cons: [{ en: 'slow' }] },
      videos: [
        {
          platform: 'youtube',
          id: 'abc',
          title: 'Slacking Surfer, Aer',
          author: 'Outerplane',
          uploadDate: '2025-09-22T10:00:00Z',
        },
      ],
      rank: 'A',
      rankPvp: 'C',
      role: 'dps',
      tags: ['free'],
      skillPriority: { first: 3, second: 2, ultimate: 1 },
    },
    [AIS]: {
      rank: 'B',
      role: 'dps',
      rankByTranscend: { '3': 'D', '9': 'B', '5': 'C' },
      synergies: [{ heroes: [AER], reason: { en: 'Feeds {B/BT_ADDITIVE_TURN}', fr: 'Nourrit' } }],
    },
  });

  /** Le kit d'Aer, tel que le serveur le sert : deux cartes de skill, la chaîne, le duo. */
  type Chips = Record<string, string[]>;
  const KIT_CARDS = [
    {
      id: '5501',
      name: 'Whatever!',
      type: 'first',
      desc: 'Attacks with a <color=#28d9ed>40%</color> chance.\\nSecond line.',
      iconSrc: '/images/characters/skills/Skill_First_2000055.webp',
      chips: [
        { ref: '11', name: 'Increased Crit Hit Chance', icon: 'IG_Buff_Crit', isDebuff: false },
      ],
    },
    {
      id: '5502',
      name: 'To the Beach?',
      type: 'second',
      iconSrc: '/images/characters/skills/Skill_Second_2000055.webp',
      chips: [
        {
          ref: 'SYS_BUFF_REMOVE_BUFF',
          name: 'Buff Removal',
          icon: 'IG_Buff_Remove',
          isDebuff: true,
        },
        { ref: 'SYS_NO_ICON', name: 'Priority Increase', isDebuff: false },
      ],
    },
    {
      id: '5504',
      name: 'Chain Passive',
      type: 'chain_passive',
      iconSrc: 'https://cdn.test/chain.webp',
      chips: [],
    },
    { id: '5504::dual', name: 'Dual', type: 'dual', chips: [] },
  ];
  const KIT_CATALOG = {
    '1': { id: '1', name: 'Burned', icon: 'IG_Buff_Dot_Burn', isDebuff: true },
    '7': { id: '7', name: 'Increased Attack', icon: 'IG_Buff_Atk', isDebuff: false },
    '8': { id: '8', name: 'Immunity', icon: 'IG_Buff_Immune', isDebuff: false },
    '9': {
      id: '9',
      name: 'Immunity',
      icon: 'IG_Buff_Immune_Interruption',
      isDebuff: false,
      irremovable: true,
    },
  };
  /** L'EE d'Aer, tel que le serveur le sert : deux chips AUTO, ses deux passifs. */
  interface EeDisk {
    rank: string;
    rank10: string;
    chipHide: string[];
    chipAdd: string[];
  }
  const EE_ITEM = {
    itemId: AER,
    name: 'Super Board',
    icon: 'TI_Equipment_EX_2000055',
    star: 6,
    grade: 'unique',
    chips: [
      {
        ref: 'SYS_BUFF_ACTION_GAUGE_UP',
        name: 'Priority Increase',
        icon: 'IG_Buff_Action_Gauge_Up',
        isDebuff: false,
        desc: 'Increases the target’s <color=#28d9ed>Priority</color>.',
      },
      { ref: 'SYS_NO_DESC', name: 'Silent', isDebuff: true },
    ],
    passives: [
      {
        level: 1,
        name: 'Aer’s Exclusive Equipment',
        texts: ['Penetration <color=#28d9ed>+20%</color> when using To the Beach?'],
      },
      { level: 10, name: 'Aer’s Exclusive Equipment', texts: ['Line one.\\nLine two.'] },
    ],
  };
  /** Le catalogue de « ＋ effet » de l'EE : celui de Skills, descriptions comprises. */
  const EE_CATALOG = {
    ...KIT_CATALOG,
    '1': { ...KIT_CATALOG['1'], desc: 'Takes damage every turn.' },
  };

  type Call = { path: string; body?: unknown };
  type Saved = { ok: boolean; log: string[]; [more: string]: unknown };

  /** Gear reco : un build tel que le disque l'écrit, les listes et les presets du serveur. */
  interface GearBuild {
    name: string;
    weapons?: { id: string; mainStat?: string }[];
    amulets?: { id: string; mainStat?: string }[];
    talismans?: string[];
    sets?: { preset?: string; pieces?: { set: string; count: number }[] }[];
    substats?: string;
    note?: Text;
  }
  const piece = (id: string, label: string, more: object = {}) => ({
    id,
    label,
    icon: `I${id}`,
    classLimits: [] as string[],
    mainStats: [] as string[],
    grade: 'unique',
    star: 6,
    ...more,
  });
  const GEAR_OPTIONS = {
    weapons: [
      piece('4', 'Surefire Greatsword', {
        classLimits: ['striker'],
        mainStats: ['ATK%', 'DEF%', 'HP%'],
      }),
      piece('5', 'Twin B', { classLimits: ['striker'], mainStats: ['ATK%'] }),
      piece('6', 'Sage Staff', { classLimits: ['mage'], mainStats: ['ATK%'] }),
    ],
    amulets: [piece('1010', 'Death’s Hold', { mainStats: ['PEN%', 'CHD'] })],
    talismans: [
      piece('10003', 'Rogue’s Charm', { mode: 'CP' }),
      piece('10011', 'Undertaker’s Charm', { mode: 'AP' }),
    ],
    sets: [
      { id: '12', label: 'Critical Strike Set', pieceIcons: ['H', 'A', 'G', 'S'], has2P: true },
      { id: '13', label: 'Speed Set', pieceIcons: ['H', 'A', 'G', 'S'], has2P: true },
    ],
  };
  const GEAR_PRESETS = {
    talismans: { ru: ['10003', '10011'] } as Record<string, string[]>,
    sets: {
      s4: [{ set: '13', count: 4 }],
      chd4: [{ set: '12', count: 4 }],
    } as Record<string, { set: string; count: number }[]>,
    substats: { dps: 'ATK>CHC>CHD>SPD' } as Record<string, string>,
  };
  /** Les recos du disque : deux builds pour Aer, aucun pour les autres. */
  const gearDisk = (): Record<string, GearBuild[]> => ({
    [AER]: [
      {
        name: 'Speed',
        weapons: [{ id: '4', mainStat: 'ATK%' }],
        amulets: [{ id: '1010', mainStat: 'PEN%' }],
        talismans: ['$ru'],
        sets: [{ preset: 's4' }],
        substats: '$dps',
      },
      {
        name: 'High Crit',
        weapons: [{ id: '4', mainStat: 'ATK%' }],
        talismans: ['$ru'],
        sets: [{ preset: 'chd4' }],
        substats: '$dps',
        note: { en: 'Crit first.', fr: 'Le crit d’abord.' },
      },
    ],
  });
  /** Un build du disque, ses presets dépliés en pièces : ce que l'état sert à côté. */
  const gearPieces = (b: GearBuild) => ({
    ...b,
    talismans: (b.talismans ?? []).flatMap((t) =>
      t.startsWith('$') ? (GEAR_PRESETS.talismans[t.slice(1)] ?? [t]) : [t],
    ),
    sets: (b.sets ?? []).map((c) => ({
      pieces: c.preset ? (GEAR_PRESETS.sets[c.preset] ?? []) : (c.pieces ?? []),
    })),
    substats: b.substats?.startsWith('$')
      ? (GEAR_PRESETS.substats[b.substats.slice(1)] ?? '')
      : (b.substats ?? ''),
  });

  /**
   * La page de quick dans un document happy-dom, comme pour Noms et Effets : la
   * VRAIE coquille assemblée, le vrai `lib.js`, le vrai `tabs/character.js`, le
   * vrai `gear-view.mjs` et le vrai `hero-picker.mjs`. `fetch` est factice : il
   * sert le roster et l'état d'un perso d'après `disk.curated` (relu à chaque
   * appel), l'aperçu des textes (une balise `{…/Foo}` y sort `unknown`, les
   * autres en effet) et « Traduire » (`translated`), et note ce que la page
   * demande. L'horloge est factice une fois les modules chargés : `settle`
   * laisse passer les promesses, pas les 400 ms de l'aperçu.
   */
  async function character(
    opts: {
      hash?: string;
      saved?: (
        body: unknown,
        disk: Record<string, Curated>,
        chips: { chipHide: Chips; chipAdd: Chips },
        ee: EeDisk,
      ) => Saved;
      translated?: (texts: string[]) => unknown;
      /** Le curé des chips de skills du disque (Aer), et un kit illisible. */
      chips?: { chipHide?: Chips; chipAdd?: Chips };
      kitError?: string;
      /** Le curé de l'EE d'Aer sur le disque, et son second porteur — les autres persos n'ont pas d'EE. */
      ee?: Partial<EeDisk>;
      companion?: { id: string; name: string };
      /** Gear reco : la réponse à un enregistrement des builds (d'office, écrit). */
      gearSaved?: (body: unknown) => Saved;
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

    const disk = {
      curated: curated(),
      chips: { chipHide: {}, chipAdd: {}, ...opts.chips } as { chipHide: Chips; chipAdd: Chips },
      ee: { rank: 'A', rank10: 'S', chipHide: [], chipAdd: [], ...opts.ee } as EeDisk,
      gear: gearDisk(),
    };
    const calls: Call[] = [];
    // Ce que Gear reco demande, à part : les tests de la fiche comptent les leurs.
    const gearCalls: Call[] = [];
    // L'aperçu attend cette porte : `hold` la ferme, pour voir la requête en vol.
    let gate: Promise<void> = Promise.resolve();
    const confirm = vi.fn(() => true);
    const answer = (data: unknown, status = 200) => {
      const bytes = new TextEncoder().encode(JSON.stringify(data));
      let read = false;
      return {
        ok: status === 200,
        status,
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
      const url = new URL(path, 'http://localhost:4747');
      if (url.pathname.startsWith('/api/character')) calls.push(body ? { path, body } : { path });
      if (url.pathname === '/api/character/roster') return answer({ roster: ROSTER });
      if (url.pathname === '/api/character/state') {
        const id = url.searchParams.get('id') ?? '';
        const row = ROSTER.find((c) => c.id === id);
        if (!row) return answer({ error: `perso inconnu : ${id}` }, 404);
        const cu = disk.curated[id] ?? {};
        return answer({
          char: { ...row, chain: 'join', tags: id === AER ? ['ignore-defense'] : [] },
          curated: cu,
          ranks: {
            rank: cu.rank ?? '',
            rankPvp: cu.rankPvp ?? '',
            role: cu.role ?? '',
            rankByTranscend: cu.rankByTranscend ?? {},
            roleByTranscend: cu.roleByTranscend ?? {},
          },
          tiers: ['S', 'A', 'B', 'C', 'D', 'E'],
          eeTiers: ['S', 'A', 'B', 'C', 'D'],
          roles: ['dps', 'support', 'sustain'],
          steps: [
            { key: '3', label: '3★' },
            { key: '4', label: '4★' },
            { key: '6', label: '5★' },
            { key: '9', label: '6★' },
          ],
          humanTags: ['free'],
          videos: cu.videos ?? [],
          refs: {},
          langs: { default: 'en', shown: ['en', 'fr', 'es', 'jp', 'kr', 'zh'] },
          // Seul Aer a des cartes ; un autre perso, un kit vide.
          kit: {
            cards: id === AER && !opts.kitError ? KIT_CARDS : [],
            chipHide: id === AER ? disk.chips.chipHide : {},
            chipAdd: id === AER ? disk.chips.chipAdd : {},
            catalog: KIT_CATALOG,
            sprite: 'images/ui/effect',
            ...(opts.kitError ? { error: opts.kitError } : {}),
          },
          ee:
            id === AER
              ? {
                  ...EE_ITEM,
                  ...(opts.companion ? { companion: opts.companion } : {}),
                  ...disk.ee,
                  catalog: EE_CATALOG,
                }
              : null,
        });
      }
      if (url.pathname === '/api/character/preview') {
        const { texts, lang } = body as { texts: string[]; lang: string };
        await gate;
        return answer({
          segments: texts.map((text) =>
            text.split(/(\{[^}]+\})/).flatMap((part): unknown[] =>
              !part
                ? []
                : !part.startsWith('{')
                  ? [{ t: 'text', s: part }]
                  : part.endsWith('/Foo}')
                    ? [{ t: 'unknown', s: part }]
                    : [
                        {
                          t: 'effect',
                          label: `${part.slice(3, -1)} (${lang})`,
                          color: 'text-buff',
                          isDebuff: false,
                        },
                      ],
            ),
          ),
        });
      }
      if (url.pathname === '/api/translate') {
        calls.push({ path, body });
        const out = opts.translated?.((body as { texts: string[] }).texts) ?? {
          error: 'Pas de clé DEEPL_API_KEY ni ANTHROPIC_API_KEY dans .env.local',
        };
        return answer(out, 'error' in (out as object) ? 500 : 200);
      }
      if (url.pathname.startsWith('/api/gear-reco'))
        gearCalls.push(body ? { path, body } : { path });
      if (url.pathname === '/api/gear-reco/state') {
        const id = url.searchParams.get('id') ?? '';
        const row = ROSTER.find((c) => c.id === id);
        if (!row) return answer({ error: `perso inconnu : ${id}` }, 404);
        const builds = disk.gear[id] ?? [];
        return answer({
          presets: GEAR_PRESETS,
          options: GEAR_OPTIONS,
          langs: { default: 'en', main: ['en', 'fr', 'es'], extra: ['jp', 'kr', 'zh'] },
          statIcons: {},
          id,
          disk: builds,
          builds: builds.map(gearPieces),
        });
      }
      // L'aperçu : les armes par leur nom, la note dans la langue (repli sur l'anglais).
      if (url.pathname === '/api/gear-reco/preview') {
        const { builds, lang } = body as { builds: GearBuild[]; lang: string };
        return answer({
          builds: builds.map((b) => ({
            name: b.name,
            weapons: (b.weapons ?? []).map((p) => ({
              id: p.id,
              name: GEAR_OPTIONS.weapons.find((o) => o.id === p.id)?.label ?? p.id,
              grade: 'unique',
              mainStat: p.mainStat,
            })),
            amulets: [],
            talismans: [],
            sets: [],
            setEffects: [],
            noteSegments: [{ t: 'text', s: `${lang}: ${b.note?.[lang] ?? b.note?.en ?? ''}` }],
          })),
          labels: { weapon: 'Weapon', note: 'Notes' },
        });
      }
      if (url.pathname === '/api/gear-reco') {
        const sent = body as { id: string; builds: GearBuild[] };
        const out = opts.gearSaved?.(body) ?? { ok: true, log: ['fait'], written: true };
        if (out.written) disk.gear[sent.id] = sent.builds;
        return answer(out);
      }
      if (url.pathname === '/api/character')
        return answer(
          opts.saved?.(body, disk.curated, disk.chips, disk.ee) ?? {
            ok: true,
            log: ['fait'],
            written: true,
            stale: false,
            refused: [],
          },
        );
      return answer({ imgBase: 'https://img.test', host: 'banc', port: 4747 });
    });

    vi.stubGlobal('window', window);
    vi.stubGlobal('document', document);
    vi.stubGlobal('location', window.location);
    vi.stubGlobal('history', window.history);
    vi.stubGlobal('fetch', fetch);
    vi.stubGlobal('confirm', confirm);
    // `quick:saved` : happy-dom ne distribue que SES événements, pas l'`Event` de Node.
    vi.stubGlobal('Event', window.Event);

    const lib = (await import(/* @vite-ignore */ resolve(UI, 'lib.js'))) as {
      sections: { start: () => void };
    };
    await import(/* @vite-ignore */ resolve(UI, 'tabs', 'character.js'));
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    lib.sections.start();
    const settle = () => vi.advanceTimersByTimeAsync(0);
    await settle();
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
    /** Choisit une valeur dans un menu, comme le ferait la souris. */
    const pick = (select: HTMLElement, value: string) => {
      (select as unknown as HTMLSelectElement).value = value;
      fire(select, 'change');
    };
    /**
     * La valeur qu'un menu porte à son DESSIN (l'option `selected`) : après un
     * `innerHTML`, happy-dom ne la rend pas par `value` (cf. `picked`, Effets).
     */
    const val = (select: HTMLElement): string =>
      select.querySelector('option[selected]')?.getAttribute('value') ?? '';
    const type = (input: HTMLElement, value: string) => {
      (input as unknown as HTMLInputElement).value = value;
      fire(input, 'input');
    };
    return {
      el,
      all,
      calls,
      confirm,
      disk,
      settle,
      fire,
      pick,
      type,
      val,
      window,
      /** Le menu d'une cellule de rang : un champ, ou le palier `step` d'une table. */
      cell: (field: string, step?: string) =>
        all(
          `#c-panel select[data-field="${field}"]${step ? `[data-step="${step}"]` : ':not([data-step])'}`,
        )[0] as HTMLSelectElement,
      prio: (key: string) => all(`#c-panel input[data-prio="${key}"]`)[0] as HTMLInputElement,
      tag: (t: string) => all(`#c-panel input[data-tag="${t}"]`)[0] as HTMLInputElement,
      /** Les paliers montrés, tels qu'ils se lisent : palier, rang, rôle. */
      tiers: () =>
        all('#c-tiers tr[data-step]').map((tr) =>
          [...tr.querySelectorAll('select')].map((s) => val(s as unknown as HTMLElement)),
        ),
      subs: () =>
        all('#c-tabs [role="tab"]').map((b) => [
          b.textContent,
          b.getAttribute('aria-selected'),
          (b as unknown as HTMLButtonElement).disabled ? b.title : '',
          b.querySelector('.dot')?.className ?? '',
        ]),
      count: () => el('c-count').textContent,
      save: async () => {
        el('c-save').click();
        for (let i = 0; i < 6; i++) await settle();
      },
      posted: () => calls.filter((c) => c.path === '/api/character').map((c) => c.body),
      states: () => calls.filter((c) => c.path.startsWith('/api/character/state')).length,
      /** Les aperçus demandés, et les appels à « Traduire ». */
      previews: () => calls.filter((c) => c.path === '/api/character/preview').map((c) => c.body),
      translations: () => calls.filter((c) => c.path === '/api/translate').map((c) => c.body),
      sub: (id: string) => el(`c-tab-${id}`).click(),
      /** Les lignes d'une liste (`pros`, `cons`, `synergies`), dans l'ordre. */
      lines: (list: string) => all(`#c-panel [data-list="${list}"][data-k]`),
      /** La textarea d'une ligne, dans une langue. */
      area: (line: HTMLElement, lang = 'en') =>
        line.querySelector(`textarea[data-lang="${lang}"]`) as unknown as HTMLTextAreaElement,
      act: (name: string, root?: HTMLElement) =>
        ((root ?? el('c-panel')) as unknown as ParentNode).querySelector(
          `[data-act="${name}"]`,
        ) as unknown as HTMLButtonElement,
      text: (root: HTMLElement, selector: string) =>
        root.querySelector(selector)?.textContent ?? '',
      /** Retient la réponse du prochain aperçu ; rend de quoi la lâcher. */
      hold: () => {
        let release = () => {};
        gate = new Promise((done) => (release = done));
        return () => release();
      },
      /** 400 ms après la dernière frappe, puis la réponse. */
      preview: async () => {
        await vi.advanceTimersByTimeAsync(400);
        await settle();
      },
      // ---- Gear reco, le dernier sous-onglet : un module monté dans `#c-gear`.
      /** Vient sur Gear reco, et laisse son état puis son aperçu arriver. */
      gear: async () => {
        el('c-tab-gear').click();
        for (let i = 0; i < 6; i++) await settle();
      },
      gearStates: () =>
        gearCalls.filter((c) => c.path.startsWith('/api/gear-reco/state')).map((c) => c.path),
      gearPreviews: () =>
        gearCalls.filter((c) => c.path === '/api/gear-reco/preview').map((c) => c.body),
      gearPosted: () => gearCalls.filter((c) => c.path === '/api/gear-reco').map((c) => c.body),
      /** Les onglets de builds : leur nom, s'il est montré, son point. */
      builds: () =>
        all('#g-tabs [role="tab"]').map((b) => [
          b.textContent,
          b.getAttribute('aria-selected'),
          b.querySelector('.dot')?.className ?? '',
        ]),
      /** La carte du build montré. */
      card: () => all('#g-list [data-k]')[0],
      /** Le nom du build montré, et sa note dans une langue. */
      buildName: () => all('#g-list [data-t="name"]')[0] as unknown as HTMLInputElement,
      note: (lang = 'en') =>
        all(`#g-list textarea[data-lang="${lang}"]`)[0] as unknown as HTMLTextAreaElement,
      gearCount: () => el('g-count').textContent,
      gearSave: async () => {
        el('g-save').click();
        for (let i = 0; i < 8; i++) await settle();
      },
      /** Les tuiles du picker de pièces : leur nom, cochée ou non. */
      tiles: () =>
        all('#g-results .g-tile').map((t) => [
          t.querySelector('.g-n')?.textContent,
          t.getAttribute('aria-pressed'),
        ]),
    };
  }

  it('servie dans Éditeurs, EN PREMIER : le groupe s’ouvre sur elle, en pleine largeur', async () => {
    const page = await character();
    expect(
      page.all('#tabs [data-group="editors"]').map((b) => [b.dataset.tab, b.textContent]),
    ).toEqual([
      ['character', 'Fiche perso'],
      ['effects', 'Effets'],
      ['monsters', 'Monstres'],
    ]);
    expect(page.el('tab-character').hidden).toBe(true);
    // Sur un autre onglet, le picker ne s'ouvre pas : il couvrirait sa page.
    expect(page.el('hp-modal')).toBeNull();

    page.all('#groups [data-group="editors"]')[0].click();
    expect(page.el('tab-character').hidden).toBe(false);
    expect(page.all('main')[0].classList.contains('wide')).toBe(true);
    expect(page.all('#tab-character h2')[0].textContent).toBe('Fiche perso');
  });

  it('sans perso : « Aucun perso choisi. », rien d’autre, et le picker OUVERT d’office', async () => {
    const page = await character({ hash: '#character' });
    expect(page.el('c-who').textContent).toBe('Aucun perso choisi.');
    expect(page.el('c-pick-label').textContent).toBe('Choisir un perso');
    expect(page.el('c-pick').disabled).toBe(false);
    expect(page.el('c-bar').hidden).toBe(true);
    expect(page.el('c-tabs').hidden).toBe(true);
    expect(page.el('c-panel').innerHTML).toBe('');
    // Le roster est lu UNE fois, aucun état de perso n'est demandé.
    expect(page.calls).toEqual([{ path: '/api/character/roster' }]);

    expect(page.el('hp-modal').hidden).toBe(false);
    expect(page.el('hp-title').textContent).toBe('Choisir un perso');
    expect(page.all('#hp-results .hp-n').map((n) => n.textContent)).toEqual([
      'Aer',
      'Ais Wallenstein',
      'Alice',
    ]);
  });

  it('un perso choisi dans le picker : sa fiche, son en-tête, et l’adresse qui le dit', async () => {
    const page = await character({ hash: '#character' });
    page.all('#hp-results .hp-tile')[0].click();
    await page.settle();
    await page.settle();

    expect(page.el('hp-modal').hidden).toBe(true);
    expect(page.window.location.hash).toBe(`#character/${AER}/fiche`);
    expect(page.all('#c-who strong')[0].textContent).toBe('Aer');
    expect(page.all('#c-who .c-trait').map((t) => t.textContent)).toEqual([
      'fire',
      'striker',
      'attacker',
    ]);
    expect(page.all('#c-who .c-trait img').map((i) => i.getAttribute('src'))).toEqual([
      'https://img.test/images/ui/elem/IG_Turn_Element_Fire.webp',
      'https://img.test/images/ui/class/IG_Turn_Class_Striker.webp',
      'https://img.test/images/ui/class/CM_Sub_Class_Attacker.webp',
    ]);
    expect(page.all('#c-who .c-stars img')).toHaveLength(3);
    expect(page.all('#c-who .badge.off')[0].textContent).toBe('chaîne join');
    expect(page.all('#c-who .c-face')[0].getAttribute('src')).toBe(
      `https://img.test/images/characters/portrait/CT_${AER}.webp`,
    );
    expect(page.el('c-pick-label').textContent).toBe('Changer de perso');
    expect(page.el('c-bar').hidden).toBe(false);
    expect(page.count()).toBe('aucune modification');
    // « Changer de perso » rouvre le picker, l'anneau sur le perso en cours.
    page.el('c-pick').click();
    expect(page.el('hp-modal').hidden).toBe(false);
    expect(page.all('#hp-results [aria-current="true"]').map((t) => t.dataset.id)).toEqual([AER]);
  });

  it('`#character/2000055/fiche` ouvre l’onglet sur la fiche, sans picker', async () => {
    const page = await character({ hash: `#character/${AER}/fiche` });
    expect(page.el('tab-character').hidden).toBe(false);
    expect(page.all('#tabs [data-tab="character"]')[0].getAttribute('aria-selected')).toBe('true');
    expect(page.all('#c-who strong')[0].textContent).toBe('Aer');
    expect(page.el('hp-modal')).toBeNull();
    expect(page.window.location.hash).toBe(`#character/${AER}/fiche`);
    // `#character/<id>` vaut « fiche », un sous-onglet inconnu aussi.
    const bare = await character({ hash: `#character/${AIS}` });
    expect(bare.window.location.hash).toBe(`#character/${AIS}/fiche`);
    const nope = await character({ hash: `#character/${AIS}/nope` });
    expect(nope.window.location.hash).toBe(`#character/${AIS}/fiche`);
    expect(nope.all('#c-who strong')[0].textContent).toBe('Ais Wallenstein');
  });

  it('un perso que le roster ne connaît pas : le journal le dit, la page reste sans perso', async () => {
    const page = await character({ hash: '#character/nope' });
    expect(page.el('c-who').textContent).toBe('Aucun perso choisi.');
    expect(page.el('journal').dataset.state).toBe('ko');
    expect(page.el('log').textContent).toContain('perso inconnu : nope');
  });

  it('les sous-onglets : la rangée entière, Fiche montrée, tous allumés', async () => {
    const page = await character({ hash: `#character/${AER}` });
    expect(page.el('c-tabs').getAttribute('role')).toBe('tablist');
    expect(page.subs()).toEqual([
      ['Fiche', 'true', '', ''],
      ['Pros / Cons', 'false', '', ''],
      ['Synergies', 'false', '', ''],
      ['Skills', 'false', '', ''],
      ['EE', 'false', '', ''],
      ['Gear reco', 'false', '', ''],
    ]);
    expect(page.all('#c-tabs [role="tab"]').map((b) => b.getAttribute('tabindex'))).toEqual([
      '0',
      '-1',
      '-1',
      '-1',
      '-1',
      '-1',
    ]);
    expect(page.el('c-panel').getAttribute('role')).toBe('tabpanel');
    expect(page.el('c-panel').getAttribute('aria-labelledby')).toBe('c-tab-fiche');
    expect(page.el('c-tab-fiche').getAttribute('aria-controls')).toBe('c-panel');
    // Gear reco a son hôte, à côté : rien n'y est monté avant d'y venir.
    expect(page.el('c-tab-gear').getAttribute('aria-controls')).toBe('c-gear');
    expect(page.el('c-gear').getAttribute('aria-labelledby')).toBe('c-tab-gear');
    expect(page.el('c-gear').hidden).toBe(true);
    expect(page.el('c-gear').innerHTML).toBe('');
    expect(page.gearStates()).toEqual([]);
  });

  it('le clavier des sous-onglets : ← → Début Fin, les bouts se rejoignent', async () => {
    const page = await character({ hash: `#character/${AER}` });
    page.el('c-tab-fiche').focus();
    // Six sous-onglets : → avance, les bouts se rejoignent, Fin et Début y vont.
    for (const [key, to] of [
      ['ArrowRight', 'pros-cons'],
      ['ArrowRight', 'synergies'],
      ['ArrowRight', 'skills'],
      ['ArrowRight', 'ee'],
      ['ArrowRight', 'gear'],
      ['ArrowRight', 'fiche'],
      ['ArrowLeft', 'gear'],
      ['Home', 'fiche'],
      ['End', 'gear'],
      ['ArrowLeft', 'ee'],
      ['Home', 'fiche'],
    ]) {
      const event = new page.window.KeyboardEvent('keydown', {
        key,
        bubbles: true,
        cancelable: true,
      });
      page.window.document.activeElement?.dispatchEvent(event);
      // La touche est prise (la page ne défile pas), l'onglet montré a la main.
      expect(event.defaultPrevented, key).toBe(true);
      expect(page.el(`c-tab-${to}`).getAttribute('aria-selected'), key).toBe('true');
      expect(page.window.document.activeElement?.id, key).toBe(`c-tab-${to}`);
      expect(page.window.location.hash, key).toBe(`#character/${AER}/${to}`);
    }
  });

  it('la fiche : trois cartes — Rangs, Kit, Vidéos — remplies du disque', async () => {
    const page = await character({ hash: `#character/${AER}` });
    expect(page.all('#c-panel .c-card > .card-head strong').map((s) => s.textContent)).toEqual([
      'Rangs',
      'Kit',
      'Vidéos',
    ]);
    expect(['rank', 'rankPvp', 'role'].map((f) => page.val(page.cell(f)))).toEqual([
      'A',
      'C',
      'dps',
    ]);
    expect(page.all('#c-panel label[for="c-f-rank"]')[0].textContent).toBe('Rang PvE');
    // L'icône du rang, dans le cadre du menu.
    expect(page.all('#c-panel .c-rkico')[0].getAttribute('src')).toBe(
      'https://img.test/images/ui/rank/IG_Event_Rank_A.webp',
    );
    expect(page.tiers()).toEqual([]);
    expect(page.el('c-tiers').textContent).toContain('Aucun palier');
    expect([
      page.prio('first').value,
      page.prio('second').value,
      page.prio('ultimate').value,
    ]).toEqual(['3', '2', '1']);
    expect(page.prio('first').type).toBe('number');
    expect(page.tag('free').checked).toBe(true);
    // Les tags que le jeu donne : en lecture.
    expect(page.all('#c-panel .c-derived .lbl')[0].textContent).toBe('déduits des données');
    expect(page.all('#c-panel .c-derived .badge.off').map((b) => b.textContent)).toEqual([
      'ignore-defense',
    ]);
    expect(page.all('#c-panel .c-derived input')).toEqual([]);
    // Les vidéos : titre, auteur, date — et rien à saisir.
    expect(page.all('#c-panel .c-videos li').map((li) => li.textContent)).toEqual([
      'Slacking Surfer, AerOuterplane · 2025-09-22',
    ]);
    expect(page.all('#c-panel [data-card="videos"] input, [data-card="videos"] select')).toEqual(
      [],
    );

    const ais = await character({ hash: `#character/${AIS}` });
    expect(ais.all('#c-panel [data-card="videos"] .c-body')[0].textContent).toBe('aucune vidéo');
    expect(ais.all('#c-panel .c-derived')[0].textContent).toBe('déduits des données— aucun');
    expect(ais.tag('free').checked).toBe(false);
    expect(ais.prio('first').value).toBe('');
  });

  it('un rang modifié : surligné comme dans Rangs, compté, pointé sur l’onglet ; remis, tout s’efface', async () => {
    const page = await character({ hash: `#character/${AER}` });
    page.pick(page.cell('rank'), 'S');

    expect(page.cell('rank').className).toBe('dirty');
    expect(page.all('#c-panel .c-rkico')[0].getAttribute('src')).toBe(
      'https://img.test/images/ui/rank/IG_Event_Rank_S.webp',
    );
    expect(page.count()).toBe('1 changement');
    expect(page.el('c-save').disabled).toBe(false);
    expect(page.el('c-reset').disabled).toBe(false);
    expect(page.all('#c-panel [data-mod="ranks"]')[0].textContent).toBe('modifié');
    expect(page.all('#c-panel [data-mod="kit"]')[0].textContent).toBe('');
    expect(page.subs()[0]).toEqual(['Fiche', 'true', '', 'dot edit']);
    // Le menu n'a pas été redessiné : il garde la main.
    page.pick(page.cell('role'), 'support');
    expect(page.count()).toBe('2 changements');

    page.pick(page.cell('rank'), 'A');
    page.pick(page.cell('role'), 'dps');
    expect(page.cell('rank').className).toBe('');
    expect(page.count()).toBe('aucune modification');
    expect(page.el('c-save').disabled).toBe(true);
    expect(page.subs()[0]).toEqual(['Fiche', 'true', '', '']);
  });

  it('un rang vidé : le cadre perd son icône', async () => {
    const page = await character({ hash: `#character/${AER}` });
    page.pick(page.cell('rankPvp'), '');
    const icon = page.cell('rankPvp').parentElement?.querySelector('.c-rkico') as unknown as {
      hidden: boolean;
    };
    expect(icon.hidden).toBe(true);
    expect(page.count()).toBe('1 changement');
  });

  it('les paliers : ceux du disque, dans l’ordre ; un palier hérité hors échelle est dit, pas édité', async () => {
    const page = await character({ hash: `#character/${AIS}` });
    expect(page.tiers()).toEqual([
      ['3', 'D', ''],
      ['9', 'B', ''],
    ]);
    expect(page.all('#c-tiers thead th').map((th) => th.textContent)).toEqual([
      'Transcendance',
      'Rang PvE',
      'Rôle',
      'Retirer',
    ]);
    expect(page.el('c-tiers').textContent).toContain(
      'Hérité hors paliers pleins, conservé tel quel : Rang Trans 5 : C.',
    );
    // Le menu d'un palier : le sien, plus ceux qui sont libres.
    expect(
      [...page.all('#c-tiers select[data-move="3"] option')].map((o) => o.textContent),
    ).toEqual(['3★', '4★', '5★']);
  });

  it('« ＋ palier » ajoute le premier palier libre ; son rang choisi, il compte', async () => {
    const page = await character({ hash: `#character/${AER}` });
    const add = () => page.all('#c-tiers [data-act="add-step"]')[0] as unknown as HTMLButtonElement;
    expect(add().textContent).toBe('＋ palier');
    add().click();
    expect(page.tiers()).toEqual([['3', '', '']]);
    // Un palier ajouté et laissé vide n'est pas un changement.
    expect(page.count()).toBe('aucune modification');

    page.pick(page.cell('rankByTranscend', '3'), 'S');
    page.pick(page.cell('roleByTranscend', '3'), 'support');
    expect(page.count()).toBe('2 changements');
    expect(page.cell('rankByTranscend', '3').className).toBe('dirty');

    add().click();
    add().click();
    add().click();
    expect(page.tiers().map(([step]) => step)).toEqual(['3', '4', '6', '9']);
    expect(add().disabled).toBe(true);
    expect(add().title).toBe('Tous les paliers sont là.');
  });

  it('changer le palier d’une ligne emmène son rang et son rôle', async () => {
    const page = await character({ hash: `#character/${AIS}` });
    page.pick(page.all('#c-tiers select[data-move="3"]')[0], '6');
    expect(page.tiers()).toEqual([
      ['6', 'D', ''],
      ['9', 'B', ''],
    ]);
    // Deux cellules : le palier quitté se vide, celui d'arrivée prend le rang.
    expect(page.count()).toBe('2 changements');
    await page.save();
    expect((page.posted()[0] as { changes: { ranks: unknown[] } }).changes.ranks).toEqual([
      { id: AIS, field: 'rankByTranscend', step: '3', from: 'D', to: '' },
      { id: AIS, field: 'rankByTranscend', step: '6', from: '', to: 'D' },
    ]);
  });

  it('✕ retire un palier : ses deux cellules se vident, la ligne s’en va', async () => {
    const page = await character({ hash: `#character/${AIS}` });
    page.all('#c-tiers [data-act="del-step"][data-step="9"]')[0].click();
    expect(page.tiers()).toEqual([['3', 'D', '']]);
    expect(page.count()).toBe('1 changement');
    // Un palier vidé à la main, lui, reste à l'écran : ✕ le retire.
    page.pick(page.cell('rankByTranscend', '3'), '');
    expect(page.tiers().map(([step]) => step)).toEqual(['3']);
    expect(page.cell('rankByTranscend', '3').className).toBe('dirty');
    expect(page.count()).toBe('2 changements');
  });

  it('une priorité saisie : surlignée, comptée UNE fois pour les trois champs', async () => {
    const page = await character({ hash: `#character/${AER}` });
    page.type(page.prio('first'), '1');
    expect(page.prio('first').classList.contains('dirty')).toBe(true);
    expect(page.count()).toBe('1 changement');
    page.type(page.prio('ultimate'), '');
    expect(page.count()).toBe('1 changement');
    expect(page.all('#c-panel [data-mod="kit"]')[0].textContent).toBe('modifié');
    // Le champ n'a pas été redessiné : la frappe garde le curseur.
    expect(page.prio('first').value).toBe('1');

    await page.save();
    expect((page.posted()[0] as { changes: unknown }).changes).toEqual({
      ranks: [],
      // Vide = non renseigné : la clé n'est pas envoyée.
      curated: { skillPriority: { first: 1, second: 2 } },
      was: page.disk.curated[AER],
    });
  });

  it('une priorité hors de 1 à 3 : l’erreur sous le champ, et rien n’est envoyé', async () => {
    const page = await character({ hash: `#character/${AER}` });
    page.type(page.prio('second'), '7');
    expect(page.prio('second').classList.contains('refused')).toBe(true);
    expect(page.all('#c-panel [data-err="skillPriority"]')[0].textContent).toBe(
      'Priorité de skills · Skill 2 : entre 1 et 3, ou vide',
    );
    expect(page.all('#c-panel [data-card="kit"]')[0].classList.contains('ko')).toBe(true);
    expect(page.subs()[0][3]).toBe('dot ko');
    expect(page.count()).toContain('1 erreur');

    await page.save();
    expect(page.posted()).toEqual([]);
    expect(page.el('journal').dataset.state).toBe('ko');
    expect(page.el('log').textContent).toContain('Rien n’est envoyé tant qu’il reste des erreurs');

    page.type(page.prio('second'), '3');
    expect(page.prio('second').classList.contains('refused')).toBe(false);
    expect(page.all('#c-panel [data-err="skillPriority"]')[0].textContent).toBe('');
    expect(page.subs()[0][3]).toBe('dot edit');
  });

  it('un tag coché ou décoché compte, et part en liste entière', async () => {
    const page = await character({ hash: `#character/${AER}` });
    page.tag('free').checked = false;
    page.fire(page.tag('free'), 'change');
    expect(page.count()).toBe('1 changement');
    await page.save();
    expect((page.posted()[0] as { changes: { curated: unknown } }).changes.curated).toEqual({
      tags: [],
    });

    const again = await character({ hash: `#character/${AER}` });
    again.tag('free').checked = false;
    again.fire(again.tag('free'), 'change');
    again.tag('free').checked = true;
    again.fire(again.tag('free'), 'change');
    expect(again.count()).toBe('aucune modification');
  });

  it('« Enregistrer » : UN envoi pour toute la fiche, puis l’état relu du disque', async () => {
    const page = await character({
      hash: `#character/${AER}`,
      saved: (_, disk) => {
        disk[AER] = {
          ...disk[AER],
          rank: 'S',
          skillPriority: { first: 1, second: 2, ultimate: 1 },
        };
        return {
          ok: true,
          log: ['PvE : A → S', 'git : fait'],
          written: true,
          stale: false,
          refused: [],
          git: { branch: 'main', ahead: 1, behind: 0 },
        };
      },
    });
    const was = page.disk.curated[AER];
    page.pick(page.cell('rank'), 'S');
    page.type(page.prio('first'), '1');
    expect(page.count()).toBe('2 changements');
    const before = page.states();
    await page.save();

    expect(page.posted()).toEqual([
      {
        id: AER,
        changes: {
          ranks: [{ id: AER, field: 'rank', from: 'A', to: 'S' }],
          curated: { skillPriority: { first: 1, second: 2, ultimate: 1 } },
          was,
        },
      },
    ]);
    expect(page.states()).toBe(before + 1);
    expect(page.val(page.cell('rank'))).toBe('S');
    expect(page.cell('rank').className).toBe('');
    expect(page.prio('first').classList.contains('dirty')).toBe(false);
    expect(page.count()).toBe('aucune modification');
    expect(page.subs()[0][3]).toBe('');
    expect(page.el('c-save').classList.contains('busy')).toBe(false);
    // Le compte de « Pousser » suit, par `post`.
    expect(page.el('push-count').textContent).toBe('1');
  });

  it('une cellule refusée : elle montre le disque, cerclée, son refus dessous ; le reste est parti', async () => {
    const page = await character({
      hash: `#character/${AER}`,
      saved: (_, disk) => {
        // Quelqu'un avait posé B entre-temps ; le rôle, lui, est écrit.
        disk[AER] = { ...disk[AER], rank: 'B', role: 'support' };
        return {
          ok: false,
          log: ['REFUSÉ', 'git : fait'],
          written: true,
          stale: false,
          refused: [{ field: 'rank', reason: 'la page avait « A », le disque porte « B »' }],
        };
      },
    });
    page.pick(page.cell('rank'), 'S');
    page.pick(page.cell('role'), 'support');
    await page.save();

    expect(page.val(page.cell('rank'))).toBe('B');
    expect(page.cell('rank').className).toBe('refused');
    expect(page.all('#c-panel [data-err="rank"]')[0].textContent).toBe(
      'la page avait « A », le disque porte « B »',
    );
    expect(page.all('#c-panel [data-card="ranks"]')[0].classList.contains('ko')).toBe(true);
    expect(page.all('#c-panel [data-ko="ranks"]')[0].textContent).toBe('refusé');
    expect(page.val(page.cell('role'))).toBe('support');
    expect(page.cell('role').className).toBe('');
    expect(page.count()).toBe('1 refus');
    expect(page.subs()[0][3]).toBe('dot ko');
    // Y retoucher lève le refus.
    page.pick(page.cell('rank'), 'S');
    expect(page.cell('rank').className).toBe('dirty');
    expect(page.all('#c-panel [data-err="rank"]')[0].textContent).toBe('');
    expect(page.subs()[0][3]).toBe('dot edit');
  });

  it('un palier refusé : cerclé, et dit sous la table', async () => {
    const page = await character({
      hash: `#character/${AIS}`,
      saved: () => ({
        ok: false,
        log: ['REFUSÉ'],
        written: false,
        stale: false,
        refused: [{ field: 'rankByTranscend', step: '9', reason: 'le disque porte « B »' }],
      }),
    });
    page.pick(page.cell('rankByTranscend', '9'), 'S');
    await page.save();
    expect(page.cell('rankByTranscend', '9').className).toBe('refused');
    expect(page.val(page.cell('rankByTranscend', '9'))).toBe('B');
    expect(page.all('#c-panel [data-err="tiers"]')[0].textContent).toBe(
      '6★ · Rang : le disque porte « B »',
    );
  });

  it('`stale` : le disque avait changé sous un champ — la fiche montre le disque, le refus dessous', async () => {
    const page = await character({
      hash: `#character/${AER}`,
      saved: (_, disk) => {
        disk[AER] = { ...disk[AER], skillPriority: { first: 2, second: 2, ultimate: 2 } };
        return {
          ok: false,
          log: ['REFUSÉ'],
          written: false,
          stale: true,
          refused: [{ field: 'skillPriority', reason: 'le disque a changé depuis le chargement' }],
        };
      },
    });
    page.type(page.prio('first'), '1');
    await page.save();

    expect(page.prio('first').value).toBe('2');
    expect(page.prio('first').classList.contains('dirty')).toBe(false);
    expect(page.prio('first').classList.contains('refused')).toBe(true);
    expect(page.all('#c-panel [data-err="skillPriority"]')[0].textContent).toBe(
      'le disque a changé depuis le chargement',
    );
    expect(page.count()).toBe('1 refus');
    expect(page.el('c-save').disabled).toBe(true);
  });

  it('un champ hors rangs refusé sans que le disque ait bougé garde sa saisie', async () => {
    const page = await character({
      hash: `#character/${AER}`,
      saved: () => ({
        ok: false,
        log: ['REFUSÉ'],
        written: false,
        stale: false,
        refused: [{ field: 'skillPriority', reason: 'refus du store' }],
      }),
    });
    page.type(page.prio('first'), '1');
    await page.save();
    expect(page.prio('first').value).toBe('1');
    expect(page.prio('first').classList.contains('dirty')).toBe(true);
    expect(page.prio('first').classList.contains('refused')).toBe(true);
    expect(page.count()).toBe('1 changement1 refus');
  });

  it('« Annuler » relit le disque : la saisie et les paliers ajoutés s’en vont', async () => {
    const page = await character({ hash: `#character/${AER}` });
    page.pick(page.cell('rank'), 'S');
    page.type(page.prio('first'), '1');
    page.all('#c-tiers [data-act="add-step"]')[0].click();
    const before = page.states();
    page.el('c-reset').click();
    await page.settle();
    await page.settle();

    expect(page.states()).toBe(before + 1);
    expect(page.val(page.cell('rank'))).toBe('A');
    expect(page.prio('first').value).toBe('3');
    expect(page.tiers()).toEqual([]);
    expect(page.count()).toBe('aucune modification');
    expect(page.posted()).toEqual([]);
  });

  it('`dirty` et `canLeave` : des changements en attente retiennent l’onglet, sur confirmation', async () => {
    const page = await character({ hash: `#character/${AER}` });
    const leave = () => page.all('#tabs [data-tab="effects"]')[0].click();
    const unload = () => {
      const event = new page.window.Event('beforeunload', { cancelable: true });
      (page.window.onbeforeunload as unknown as (e: unknown) => void)(event);
      return event.defaultPrevented;
    };
    expect(unload()).toBe(false);

    page.pick(page.cell('rank'), 'S');
    expect(unload()).toBe(true);
    page.confirm.mockReturnValueOnce(false);
    leave();
    expect(page.el('tab-character').hidden).toBe(false);
    expect(page.confirm).toHaveBeenLastCalledWith(
      '1 changement non enregistré sur Aer. Quitter l’onglet ? Ils restent en attente tant que la page n’est pas rechargée.',
    );

    leave();
    expect(page.el('tab-character').hidden).toBe(true);
    // Revenu, la saisie est toujours là — et la fiche n'a pas été relue par-dessus.
    const before = page.states();
    page.all('#tabs [data-tab="character"]')[0].click();
    await page.settle();
    expect(page.states()).toBe(before);
    expect(page.cell('rank').value).toBe('S');
    expect(page.window.location.hash).toBe(`#character/${AER}/fiche`);
  });

  it('revenir sur l’onglet sans rien en attente relit la fiche : un rang a pu changer dans Rangs', async () => {
    const page = await character({ hash: `#character/${AER}` });
    page.all('#tabs [data-tab="effects"]')[0].click();
    expect(page.confirm).not.toHaveBeenCalled();
    page.disk.curated[AER] = { ...page.disk.curated[AER], rank: 'E' };
    page.all('#tabs [data-tab="character"]')[0].click();
    await page.settle();
    await page.settle();
    expect(page.val(page.cell('rank'))).toBe('E');
    expect(page.count()).toBe('aucune modification');
  });

  it('changer de perso avec des changements en attente : sur confirmation, sinon le picker reste', async () => {
    const page = await character({ hash: `#character/${AER}` });
    page.pick(page.cell('rank'), 'S');
    page.el('c-pick').click();
    const other = () => page.all('#hp-results .hp-tile').find((t) => t.dataset.id === AIS)!;

    page.confirm.mockReturnValueOnce(false);
    other().click();
    expect(page.confirm).toHaveBeenLastCalledWith(
      'Abandonner 1 changement non enregistré sur Aer ?',
    );
    expect(page.el('hp-modal').hidden).toBe(false);
    expect(page.all('#c-who strong')[0].textContent).toBe('Aer');

    other().click();
    await page.settle();
    await page.settle();
    expect(page.el('hp-modal').hidden).toBe(true);
    expect(page.all('#c-who strong')[0].textContent).toBe('Ais Wallenstein');
    expect(page.count()).toBe('aucune modification');
    expect(page.window.location.hash).toBe(`#character/${AIS}/fiche`);
    // Le même perso recliqué : le picker se ferme, rien n'est relu.
    const before = page.states();
    page.el('c-pick').click();
    other().click();
    await page.settle();
    expect(page.el('hp-modal').hidden).toBe(true);
    expect(page.states()).toBe(before);
  });

  it('« ajouter dans Vidéos » ouvre l’onglet Vidéos, sur ce perso si sa liste le propose', async () => {
    const page = await character({ hash: `#character/${AER}` });
    // L'onglet Vidéos n'est pas chargé ici : sa liste de cibles est posée à la main.
    page.el('v-target').innerHTML =
      `<option value="character:1">Autre</option><option value="character:${AER}">Aer</option>`;
    const link = page.all('#c-panel [data-act="videos"]')[0];
    expect(link.textContent).toBe('ajouter dans Vidéos');
    link.click();
    expect(page.el('tab-videos').hidden).toBe(false);
    expect(page.el('tab-character').hidden).toBe(true);
    expect(page.el('v-target').value).toBe(`character:${AER}`);
  });

  // ------------------------------------------- « Pros / Cons » et « Synergies »
  const PROS = `#character/${AER}/pros-cons`;
  /** Un traducteur factice : chaque langue rend son code devant l'anglais. */
  const deepl = (texts: string[]) => ({
    results: texts.map((t) =>
      Object.fromEntries(['jp', 'kr', 'zh', 'fr', 'es'].map((l) => [l, `${l}:${t}`])),
    ),
    provider: 'deepl',
  });

  it('`#character/2000055/pros-cons` : deux cartes, les lignes du disque, UN aperçu pour l’onglet', async () => {
    const page = await character({ hash: PROS });
    expect(page.window.location.hash).toBe(PROS);
    expect(page.subs().map((t) => t.slice(0, 2))).toEqual([
      ['Fiche', 'false'],
      ['Pros / Cons', 'true'],
      ['Synergies', 'false'],
      ['Skills', 'false'],
      ['EE', 'false'],
      ['Gear reco', 'false'],
    ]);
    expect(page.all('#c-panel .c-card > .card-head strong').map((h) => h.textContent)).toEqual([
      'Pros',
      'Cons',
    ]);
    expect(page.all('#c-panel [data-n]').map((b) => b.textContent)).toEqual(['2', '1']);
    expect(page.lines('pros').map((l) => page.area(l).value.trim())).toEqual([BEACH.en, 'strong']);
    expect(page.lines('cons').map((l) => page.area(l).value.trim())).toEqual(['slow']);
    const first = page.area(page.lines('pros')[0]);
    expect(first.getAttribute('rows')).toBe('2');
    expect(first.getAttribute('aria-label')).toBe('Pro 1, en anglais');
    expect(page.act('add-line', page.all('[data-card="pros"]')[0]).textContent).toBe('＋ pro');
    expect(page.act('add-line', page.all('[data-card="cons"]')[0]).textContent).toBe('＋ con');
    expect(page.act('del-line', page.lines('pros')[0]).className).toBe('btn icon');
    expect(page.count()).toBe('aucune modification');

    // UNE requête pour tout l'onglet, pros et cons, dans la langue de la savebar.
    expect(page.previews()).toEqual([{ texts: [BEACH.en, 'strong', 'slow'], lang: 'en' }]);
    const pv = page.lines('pros')[0].querySelector('[data-pv]') as unknown as HTMLElement;
    expect(pv.textContent).toBe('Strips buffs with BT_REMOVE_BUFF (en)');
    expect(pv.querySelector('.pv-seg.text-buff .pv-u')?.textContent).toBe('BT_REMOVE_BUFF (en)');
    expect(pv.classList.contains('busy')).toBe(false);

    // Le groupe des langues : dans la savebar, `en` d'office ; absent de « Fiche ».
    expect(page.el('c-pv-lang').hidden).toBe(false);
    expect(
      page.all('#c-pv-lang button').map((b) => [b.textContent, b.getAttribute('aria-pressed')]),
    ).toEqual([
      ['en', 'true'],
      ['fr', 'false'],
      ['es', 'false'],
      ['jp', 'false'],
      ['kr', 'false'],
      ['zh', 'false'],
    ]);
    page.sub('fiche');
    expect(page.el('c-pv-lang').hidden).toBe(true);
    expect(page.window.location.hash).toBe(`#character/${AER}/fiche`);
    // Revenu, l'onglet se redessine sur le rendu reçu : la même requête ne repart pas.
    page.sub('pros-cons');
    await page.settle();
    expect(page.previews()).toHaveLength(1);
    expect(page.text(page.lines('pros')[0], '[data-pv]')).toBe(
      'Strips buffs with BT_REMOVE_BUFF (en)',
    );
  });

  it('pendant que l’aperçu court, le rendu précédent reste, atténué', async () => {
    const page = await character({ hash: PROS });
    const pv = () => page.lines('pros')[1].querySelector('[data-pv]') as unknown as HTMLElement;
    expect(pv().textContent).toBe('strong');
    const release = page.hold();
    page.type(page.area(page.lines('pros')[1]), 'stronger');
    await vi.advanceTimersByTimeAsync(400);
    expect(page.previews()).toHaveLength(2);
    expect(pv().classList.contains('busy')).toBe(true);
    expect(pv().textContent).toBe('strong');
    release();
    await page.settle();
    expect(pv().classList.contains('busy')).toBe(false);
    expect(pv().textContent).toBe('stronger');
  });

  it('« ＋ pro » : vide, la ligne ne compte pas ; saisie, elle compte, et l’aperçu part 400 ms après la frappe, en UNE requête', async () => {
    const page = await character({ hash: PROS });
    page.act('add-line', page.all('[data-card="pros"]')[0]).click();
    await page.settle();
    expect(page.lines('pros')).toHaveLength(3);
    const added = () => page.lines('pros')[2];
    // La ligne ajoutée a la main, et ne pèse rien tant qu'elle est vide.
    expect(page.window.document.activeElement).toBe(
      page.area(added()) as unknown as typeof page.window.document.activeElement,
    );
    expect(page.count()).toBe('aucune modification');
    expect(page.subs()[1][3]).toBe('');
    const before = page.previews().length;

    page.type(page.area(added()), 'Gra');
    await vi.advanceTimersByTimeAsync(300);
    page.type(page.area(added()), 'Grants {B/Foo} and {B/BT_ADDITIVE_TURN}');
    await vi.advanceTimersByTimeAsync(399);
    expect(page.previews()).toHaveLength(before);
    await vi.advanceTimersByTimeAsync(1);
    await page.settle();
    expect(page.previews()).toHaveLength(before + 1);
    expect(page.previews().at(-1)).toEqual({
      texts: [BEACH.en, 'strong', 'Grants {B/Foo} and {B/BT_ADDITIVE_TURN}', 'slow'],
      lang: 'en',
    });
    // Un tag que le site ne résout pas sort en ROUGE, comme dans Gear reco.
    expect(page.text(added(), '[data-pv] .pv-unknown')).toBe('{B/Foo}');
    expect(page.text(added(), '[data-pv]')).toBe('Grants {B/Foo} and BT_ADDITIVE_TURN (en)');

    // La frappe n'a rien redessiné : la textarea garde la main et son texte.
    expect(page.area(added()).value).toBe('Grants {B/Foo} and {B/BT_ADDITIVE_TURN}');
    expect(added().classList.contains('dirty')).toBe(true);
    expect(page.count()).toBe('1 changement');
    expect(page.all('#c-panel [data-mod="pros"]')[0].textContent).toBe('modifié');
    expect(page.all('#c-panel [data-mod="cons"]')[0].textContent).toBe('');
    expect(page.subs().map((t) => t[3])).toEqual(['', 'dot edit', '', '', '', '']);
    // Revidée, elle ne compte plus.
    page.type(page.area(added()), ' ');
    expect(page.count()).toBe('aucune modification');
  });

  it('les traductions, repliées : cinq langues, l’anglais en placeholder, « à retraduire » quand il a bougé', async () => {
    const page = await character({ hash: PROS });
    const [beach, strong] = page.lines('pros');
    const fold = beach.querySelector('details') as unknown as HTMLDetailsElement;
    expect(fold.open).toBe(false);
    expect(page.text(beach, 'summary .btn')).toBe('Traductions (5)');
    expect(page.text(beach, '[data-tally]')).toBe('5 / 5');
    expect(page.text(strong, '[data-tally]')).toBe('0 / 5');
    expect(
      page
        .all('.c-trs label')
        .slice(0, 5)
        .map((l) => l.textContent),
    ).toEqual(['fr', 'es', 'jp', 'kr', 'zh']);
    expect(page.area(beach, 'fr').value.trim()).toBe(BEACH.fr);
    expect(page.area(strong, 'fr').value.trim()).toBe('');
    expect(page.area(strong, 'fr').getAttribute('placeholder')).toBe('strong');
    expect(page.text(beach, '[data-stale]')).toBe('');

    // L'anglais retouché : ses traductions datent d'un autre texte.
    page.type(page.area(beach), 'Removes buffs with {D/BT_REMOVE_BUFF}');
    expect(page.text(beach, '[data-stale]')).toBe('à retraduire');
    expect(beach.querySelector('[data-stale]')?.className).toBe('badge warn');
    expect(page.area(beach, 'fr').placeholder).toBe('Removes buffs with {D/BT_REMOVE_BUFF}');
    // Remis, plus rien à retraduire ; une ligne sans traduction n'en a jamais.
    page.type(page.area(beach), BEACH.en ?? '');
    expect(page.text(beach, '[data-stale]')).toBe('');
    expect(page.count()).toBe('aucune modification');
    page.type(page.area(strong), 'stronger');
    expect(page.text(strong, '[data-stale]')).toBe('');

    // Une traduction se retouche à la main : elle compte, et part à sa place.
    page.type(page.area(beach, 'fr'), 'Retire {D/BT_REMOVE_BUFF}');
    page.type(page.area(strong, 'fr'), 'plus fort');
    expect(page.text(strong, '[data-tally]')).toBe('1 / 5');
    expect(page.count()).toBe('2 changements');
    await page.save();
    const sent = (page.posted()[0] as { changes: { curated: { prosCons: Curated['prosCons'] } } })
      .changes.curated;
    expect(sent).toEqual({
      prosCons: {
        pros: [
          { ...BEACH, fr: 'Retire {D/BT_REMOVE_BUFF}' },
          { en: 'stronger', fr: 'plus fort' },
        ],
        cons: [{ en: 'slow' }],
      },
    });
    // Les langues du disque gardent leur ordre dans le fichier.
    expect(Object.keys(sent.prosCons?.pros?.[0] ?? {})).toEqual(Object.keys(BEACH));
  });

  it('la langue de l’aperçu : un clic dans la savebar, la requête part aussitôt — une langue absente se replie sur l’anglais', async () => {
    const page = await character({ hash: PROS });
    const fr = page.all('#c-pv-lang button[data-lang="fr"]')[0];
    fr.click();
    await page.settle();
    expect(fr.getAttribute('aria-pressed')).toBe('true');
    expect(page.all('#c-pv-lang button[data-lang="en"]')[0].getAttribute('aria-pressed')).toBe(
      'false',
    );
    expect(page.previews().at(-1)).toEqual({ texts: [BEACH.fr, 'strong', 'slow'], lang: 'fr' });
    expect(page.text(page.lines('pros')[0], '[data-pv]')).toBe(
      'Retire les buffs avec BT_REMOVE_BUFF (fr)',
    );
    // La langue vaut pour toute la fiche : Synergies la garde.
    page.sub('synergies');
    expect(page.all('#c-pv-lang button[data-lang="fr"]')[0].getAttribute('aria-pressed')).toBe(
      'true',
    );
  });

  it('« Traduire » : les textes anglais de l’onglet, d’UN appel — les cinq langues ÉCRASÉES, à relire', async () => {
    const page = await character({ hash: PROS, translated: deepl });
    const button = page.act('translate');
    expect(button.className).toBe('btn ghost');
    expect(button.title).toContain('ÉCRASE');
    page.type(page.area(page.lines('pros')[0]), 'Removes buffs');
    expect(page.text(page.lines('pros')[0], '[data-stale]')).toBe('à retraduire');
    button.click();
    for (let i = 0; i < 4; i++) await page.settle();

    expect(page.translations()).toEqual([{ texts: ['Removes buffs', 'strong', 'slow'] }]);
    const [beach, strong] = page.lines('pros');
    // Écrasées : la traduction du disque n'est plus là.
    expect(page.area(beach, 'fr').value.trim()).toBe('fr:Removes buffs');
    expect(page.area(strong, 'zh').value.trim()).toBe('zh:strong');
    expect(page.area(page.lines('cons')[0], 'es').value.trim()).toBe('es:slow');
    expect(page.text(beach, '[data-stale]')).toBe('');
    expect(page.text(strong, '[data-tally]')).toBe('5 / 5');
    // Ce qui vient d'être traduit s'ouvre : c'est à relire.
    expect((beach.querySelector('details') as unknown as HTMLDetailsElement).open).toBe(true);
    expect(page.act('translate').disabled).toBe(false);
    expect(page.count()).toBe('3 changements');
    expect(page.el('journal').dataset.state).toBe('ok');
    expect(page.el('log').textContent).toContain('3 textes : 15 traductions posées par DeepL');

    await page.save();
    const pros = (page.posted()[0] as { changes: { curated: { prosCons: { pros: Text[] } } } })
      .changes.curated.prosCons.pros;
    // Une langue nouvelle se range dans l'ordre du moteur, celui du fichier.
    expect(Object.keys(pros[1])).toEqual(['en', 'jp', 'kr', 'zh', 'fr', 'es']);
    expect(pros[0]).toEqual({
      en: 'Removes buffs',
      jp: 'jp:Removes buffs',
      kr: 'kr:Removes buffs',
      zh: 'zh:Removes buffs',
      fr: 'fr:Removes buffs',
      es: 'es:Removes buffs',
    });
  });

  it('« Traduire » sans clé, ou un moteur qui ne rend rien : le refus va au journal, rien ne bouge', async () => {
    const page = await character({ hash: PROS });
    page.act('translate').click();
    for (let i = 0; i < 4; i++) await page.settle();
    expect(page.el('journal').dataset.state).toBe('ko');
    expect(page.el('log').textContent).toContain(
      'Traduction refusée : Pas de clé DEEPL_API_KEY ni ANTHROPIC_API_KEY dans .env.local',
    );
    expect(page.text(page.el('c-panel'), '[data-tr-error]')).toContain('Pas de clé');
    expect(page.area(page.lines('pros')[1], 'fr').value.trim()).toBe('');
    expect(page.area(page.lines('pros')[0], 'fr').value.trim()).toBe(BEACH.fr);
    expect(page.count()).toBe('aucune modification');
    expect(page.act('translate').disabled).toBe(false);

    const none = await character({
      hash: PROS,
      translated: (texts) => ({ results: texts.map(() => ({})), provider: 'none' }),
    });
    none.act('translate').click();
    for (let i = 0; i < 4; i++) await none.settle();
    expect(none.el('journal').dataset.state).toBe('ko');
    expect(none.el('log').textContent).toContain('le traducteur n’a rien rendu');
    expect(none.count()).toBe('aucune modification');
  });

  it('✕ retire une ligne : elle compte, et part en moins dans la liste ENTIÈRE', async () => {
    const page = await character({ hash: PROS });
    page.act('del-line', page.lines('pros')[0]).click();
    await page.settle();
    expect(page.lines('pros').map((l) => page.area(l).value.trim())).toEqual(['strong']);
    expect(page.all('#c-panel [data-n]').map((b) => b.textContent)).toEqual(['1', '1']);
    expect(page.count()).toBe('1 changement');
    expect(page.area(page.lines('pros')[0]).getAttribute('aria-label')).toBe('Pro 1, en anglais');
    // Une ligne ajoutée puis retirée ne laisse rien.
    page.act('add-line', page.all('[data-card="cons"]')[0]).click();
    page.act('del-line', page.lines('cons')[1]).click();
    expect(page.count()).toBe('1 changement');

    await page.save();
    expect((page.posted()[0] as { changes: unknown }).changes).toEqual({
      ranks: [],
      curated: { prosCons: { pros: [{ en: 'strong' }], cons: [{ en: 'slow' }] } },
      was: page.disk.curated[AER],
    });
  });

  it('un tag refusé à l’enregistrement : situé sur SA ligne — carte cerclée, message sous la textarea, saisie gardée', async () => {
    const page = await character({
      hash: PROS,
      saved: () => ({
        ok: false,
        log: ['REFUSÉ'],
        written: false,
        stale: false,
        refused: [
          {
            field: 'prosCons',
            list: 'pros',
            index: 2,
            reason: 'tag inconnu {B/Foo} (effet inconnu)',
          },
        ],
      }),
    });
    // Une ligne vide au milieu : elle ne part pas, le rang du refus est celui de l'envoi.
    page.act('add-line', page.all('[data-card="pros"]')[0]).click();
    page.act('add-line', page.all('[data-card="pros"]')[0]).click();
    page.type(page.area(page.lines('pros')[3]), 'Grants {B/Foo}');
    await page.save();

    const bad = page.lines('pros')[3];
    expect(page.area(bad).value.trim()).toBe('Grants {B/Foo}');
    expect(page.area(bad).classList.contains('refused')).toBe(true);
    expect(page.text(bad, '.c-err')).toBe('tag inconnu {B/Foo} (effet inconnu)');
    expect(page.all('#c-panel [data-card="pros"]')[0].classList.contains('ko')).toBe(true);
    expect(page.all('#c-panel [data-ko="pros"]')[0].textContent).toBe('refusé');
    expect(page.all('#c-panel [data-card="cons"]')[0].classList.contains('ko')).toBe(false);
    expect(page.text(page.lines('pros')[0], '.c-err')).toBe('');
    expect(page.count()).toBe('1 changement1 refus');
    expect(page.subs().map((t) => t[3])).toEqual(['', 'dot ko', '', '', '', '']);
    // Y retoucher lève le refus.
    page.type(page.area(bad), 'Grants {B/BT_ADDITIVE_TURN}');
    expect(page.area(bad).classList.contains('refused')).toBe(false);
    expect(page.text(bad, '.c-err')).toBe('');
    expect(page.all('#c-panel [data-card="pros"]')[0].classList.contains('ko')).toBe(false);
    expect(page.subs()[1][3]).toBe('dot edit');
  });

  it('« Enregistrer » écrit les pros : la fiche relue du disque, plus rien en attente', async () => {
    const page = await character({
      hash: PROS,
      saved: (body, disk) => {
        const { curated: sent } = (body as { changes: { curated: Curated } }).changes;
        disk[AER] = { ...disk[AER], prosCons: sent.prosCons };
        return { ok: true, log: ['fait'], written: true, stale: false, refused: [] };
      },
    });
    page.type(page.area(page.lines('cons')[0]), 'slower');
    expect(page.count()).toBe('1 changement');
    await page.save();
    expect(page.lines('cons').map((l) => page.area(l).value.trim())).toEqual(['slower']);
    expect(page.lines('cons')[0].classList.contains('dirty')).toBe(false);
    expect(page.count()).toBe('aucune modification');
    expect(page.subs()[1][3]).toBe('');
  });

  it('`stale` : le disque avait changé sous les pros — l’onglet montre le disque, le refus sous les cartes', async () => {
    const page = await character({
      hash: PROS,
      saved: (_, disk) => {
        disk[AER] = { ...disk[AER], prosCons: { pros: [{ en: 'from elsewhere' }] } };
        return {
          ok: false,
          log: ['REFUSÉ'],
          written: false,
          stale: true,
          refused: [{ field: 'prosCons', reason: 'le disque a changé depuis le chargement' }],
        };
      },
    });
    page.type(page.area(page.lines('pros')[1]), 'stronger');
    await page.save();
    expect(page.lines('pros').map((l) => page.area(l).value.trim())).toEqual(['from elsewhere']);
    expect(page.lines('cons')).toEqual([]);
    expect(page.all('#c-panel [data-card="cons"] .lbl')[0].textContent).toBe('Aucun con.');
    expect(page.text(page.el('c-panel'), '[data-err="prosCons"]')).toBe(
      'le disque a changé depuis le chargement',
    );
    expect(page.count()).toBe('1 refus');
    expect(page.subs()[1][3]).toBe('dot ko');
  });

  it('`#character/2000096/synergies` : une carte par groupe — ses héros en tuiles, sa raison, son aperçu', async () => {
    const page = await character({ hash: `#character/${AIS}/synergies` });
    expect(page.window.location.hash).toBe(`#character/${AIS}/synergies`);
    expect(page.subs()[2].slice(0, 2)).toEqual(['Synergies', 'true']);
    const [group] = page.lines('synergies');
    expect(page.lines('synergies')).toHaveLength(1);
    expect(group.classList.contains('card')).toBe(true);
    expect(page.text(group, '.card-head strong')).toBe('Groupe 1');
    expect(page.act('del-line', group).closest('.card-head')).not.toBeNull();
    expect(page.all('.c-hero').map((h) => h.querySelector('span')?.textContent)).toEqual(['Aer']);
    const face = page.all('.c-hero img')[0];
    expect(face.getAttribute('src')).toBe(
      `https://img.test/images/characters/portrait/CT_${AER}.webp`,
    );
    expect([face.getAttribute('width'), face.getAttribute('height')]).toEqual(['44', '44']);
    expect(page.act('del-hero', group).getAttribute('aria-label')).toBe('Retirer Aer');
    expect(page.act('add-hero', group).textContent).toBe('＋ héros');
    expect(page.area(group).value.trim()).toBe('Feeds {B/BT_ADDITIVE_TURN}');
    expect(page.area(group).getAttribute('aria-label')).toBe('Raison du groupe 1, en anglais');
    expect(page.text(group, '[data-tally]')).toBe('1 / 5');
    expect(page.previews()).toEqual([{ texts: ['Feeds {B/BT_ADDITIVE_TURN}'], lang: 'en' }]);
    expect(page.text(group, '[data-pv]')).toBe('Feeds BT_ADDITIVE_TURN (en)');
    expect(page.all('#c-panel > .c-syn > .c-foot button').map((b) => b.textContent)).toEqual([
      '＋ groupe',
      'Traduire',
    ]);

    // Sans synergie : la phrase, et les deux boutons.
    const aer = await character({ hash: `#character/${AER}/synergies` });
    expect(aer.lines('synergies')).toEqual([]);
    expect(aer.all('#c-panel .c-syn > .lbl')[0].textContent).toBe('Aucune synergie.');
    expect(aer.previews()).toEqual([]);
  });

  it('une synergie à deux héros : « ＋ groupe », le picker partagé en multi, la raison, l’envoi', async () => {
    const page = await character({ hash: `#character/${AER}/synergies` });
    page.act('add-line').click();
    await page.settle();
    const group = () => page.lines('synergies')[0];
    // Un groupe ajouté et laissé vide n'est pas un changement.
    expect(page.count()).toBe('aucune modification');

    page.act('add-hero', group()).click();
    expect(page.el('hp-modal').hidden).toBe(false);
    expect(page.el('hp-title').textContent).toBe('Héros du groupe');
    // Le perso de la fiche n'est pas proposé.
    expect(page.all('#hp-results .hp-n').map((n) => n.textContent)).toEqual([
      'Ais Wallenstein',
      'Alice',
    ]);
    expect(page.el('hp-foot').hidden).toBe(false);
    const tile = (id: string) => page.all('#hp-results .hp-tile').find((t) => t.dataset.id === id)!;
    tile(ALICE).click();
    tile(AIS).click();
    expect(page.el('hp-tally').textContent).toBe('2 choisis sur 2');
    page.all('#hp-foot [data-hp="ok"]')[0].click();
    await page.settle();

    expect(page.el('hp-modal').hidden).toBe(true);
    expect(page.all('.c-hero').map((h) => h.querySelector('span')?.textContent)).toEqual([
      'Alice',
      'Ais Wallenstein',
    ]);
    expect(page.count()).toBe('1 changement');
    expect(page.text(group(), '[data-mod-line]')).toBe('modifié');
    expect(page.subs().map((t) => t[3])).toEqual(['', '', 'dot edit', '', '', '']);
    // Rouvert, le picker coche les héros du groupe.
    page.act('add-hero', group()).click();
    expect(page.all('#hp-results .hp-tile[aria-pressed="true"]').map((t) => t.dataset.id)).toEqual([
      AIS,
      ALICE,
    ]);
    page.all('#hp-foot [data-hp="cancel"]')[0].click();
    // ✕ sur une tuile retire son héros.
    page.all('.c-hero [data-act="del-hero"]')[0].click();
    expect(page.all('.c-hero').map((h) => h.querySelector('span')?.textContent)).toEqual([
      'Ais Wallenstein',
    ]);
    page.act('add-hero', group()).click();
    tile(ALICE).click();
    page.all('#hp-foot [data-hp="ok"]')[0].click();

    page.type(page.area(group()), 'Shares {B/BT_ADDITIVE_TURN}');
    await page.preview();
    expect(page.previews().at(-1)).toEqual({ texts: ['Shares {B/BT_ADDITIVE_TURN}'], lang: 'en' });
    await page.save();
    expect((page.posted()[0] as { changes: unknown }).changes).toEqual({
      ranks: [],
      curated: {
        synergies: [{ heroes: [AIS, ALICE], reason: { en: 'Shares {B/BT_ADDITIVE_TURN}' } }],
      },
      was: page.disk.curated[AER],
    });
  });

  it('un groupe refusé : sa carte cerclée, son refus sous la raison ; « Traduire » y vaut pour les raisons', async () => {
    const page = await character({
      hash: `#character/${AIS}/synergies`,
      translated: deepl,
      saved: () => ({
        ok: false,
        log: ['REFUSÉ'],
        written: false,
        stale: false,
        refused: [{ field: 'synergies', list: 'synergies', index: 1, reason: 'groupe sans héros' }],
      }),
    });
    page.act('add-line').click();
    page.type(page.area(page.lines('synergies')[1]), 'alone');
    await page.save();
    const [kept, bad] = page.lines('synergies');
    expect(bad.classList.contains('ko')).toBe(true);
    expect(page.text(bad, '[data-ko-line]')).toBe('refusé');
    expect(page.text(bad, '.c-err')).toBe('groupe sans héros');
    expect(kept.classList.contains('ko')).toBe(false);
    expect(page.subs()[2][3]).toBe('dot ko');

    page.act('translate').click();
    for (let i = 0; i < 4; i++) await page.settle();
    expect(page.translations()).toEqual([{ texts: ['Feeds {B/BT_ADDITIVE_TURN}', 'alone'] }]);
    expect(page.area(page.lines('synergies')[0], 'fr').value.trim()).toBe(
      'fr:Feeds {B/BT_ADDITIVE_TURN}',
    );
    // ✕ en tête de carte retire le groupe.
    page.act('del-line', page.lines('synergies')[0]).click();
    expect(page.lines('synergies')).toHaveLength(1);
    expect(page.text(page.lines('synergies')[0], '.card-head strong')).toBe('Groupe 1');
  });

  it('« Annuler » rend tout, d’un sous-onglet à l’autre ; `canLeave` retient l’onglet', async () => {
    const page = await character({ hash: PROS });
    page.type(page.area(page.lines('pros')[1]), 'stronger');
    page.sub('synergies');
    page.act('add-line').click();
    page.type(page.area(page.lines('synergies')[0]), 'with someone');
    page.sub('fiche');
    page.pick(page.cell('rank'), 'S');
    // UNE barre pour toute la fiche : les trois sous-onglets comptés.
    expect(page.count()).toBe('3 changements');
    expect(page.subs().map((t) => t[3])).toEqual(['dot edit', 'dot edit', 'dot edit', '', '', '']);

    page.confirm.mockReturnValueOnce(false);
    page.all('#tabs [data-tab="effects"]')[0].click();
    expect(page.el('tab-character').hidden).toBe(false);
    expect(page.confirm).toHaveBeenLastCalledWith(
      '3 changements non enregistrés sur Aer. Quitter l’onglet ? Ils restent en attente tant que la page n’est pas rechargée.',
    );
    // La saisie d'un sous-onglet survit au passage par un autre.
    page.sub('pros-cons');
    expect(page.area(page.lines('pros')[1]).value.trim()).toBe('stronger');

    page.el('c-reset').click();
    await page.settle();
    await page.settle();
    expect(page.count()).toBe('aucune modification');
    expect(page.lines('pros').map((l) => page.area(l).value.trim())).toEqual([BEACH.en, 'strong']);
    page.sub('synergies');
    expect(page.lines('synergies')).toEqual([]);
    expect(page.posted()).toEqual([]);
    expect(page.subs().map((t) => t[3])).toEqual(['', '', '', '', '', '']);
  });

  // ------------------------------------------------------------ « Skills »
  const SKILLS = `#character/${AER}/skills`;
  type Page = Awaited<ReturnType<typeof character>>;
  /** Les cartes de skills, et les chips d'une carte telles qu'elles se lisent. */
  const kitCards = (page: Page) => page.all('#c-panel [data-kit]');
  const kitCard = (page: Page, id: string) => kitCards(page).find((c) => c.dataset.kit === id)!;
  const chips = (card: HTMLElement) =>
    ([...card.querySelectorAll('.c-chip')] as unknown as HTMLElement[]).map((c) => [
      c.querySelector('.c-chn')?.textContent,
      c.className.replace('chip c-chip', '').trim(),
      c.querySelector('button')?.textContent,
    ]);
  const chip = (card: HTMLElement, ref: string, kind = 'auto') =>
    ([...card.querySelectorAll('.c-chip')] as unknown as HTMLElement[]).find(
      (c) => c.dataset.ref === ref && c.dataset.kind === kind,
    )!;
  const tiles = (page: Page) => page.all('#hp-results .hp-tile').map((t) => t.textContent);
  /** Un enregistrement qui écrit les chips envoyées sur le disque factice. */
  const writeChips: NonNullable<Parameters<typeof character>[0]>['saved'] = (body, _, disk) => {
    const { kit } = (body as { changes: { kit?: { chipHide: Chips; chipAdd: Chips } } }).changes;
    for (const section of ['chipHide', 'chipAdd'] as const)
      for (const [card, list] of Object.entries(kit?.[section] ?? {})) {
        if (list.length) disk[section][card] = list;
        else delete disk[section][card];
      }
    return { ok: true, log: ['fait'], written: true, stale: false, refused: [] };
  };

  it('`#character/2000055/skills` : une carte par skill — icône, nom, id · type, description, chips, « ＋ effet »', async () => {
    const page = await character({ hash: SKILLS });
    expect(page.window.location.hash).toBe(SKILLS);
    expect(page.subs()[3]).toEqual(['Skills', 'true', '', '']);
    // Pas de texte à tags ici : le groupe « Aperçu » de la savebar s'efface.
    expect(page.el('c-pv-lang').hidden).toBe(true);
    expect(page.previews()).toEqual([]);

    expect(kitCards(page).map((c) => page.text(c, '.card-head strong'))).toEqual([
      'Whatever!',
      'To the Beach?',
      'Chain Passive',
      'Dual',
    ]);
    expect(kitCards(page).map((c) => page.text(c, '.c-skid'))).toEqual([
      '5501 · first',
      '5502 · second',
      '5504 · chain_passive',
      '5504::dual · dual',
    ]);
    // Une icône relative passe sous la base des images ; absolue, elle reste ; le duo n'en a pas.
    expect(kitCards(page).map((c) => c.querySelector('.c-skico')?.getAttribute('src'))).toEqual([
      'https://img.test/images/characters/skills/Skill_First_2000055.webp',
      'https://img.test/images/characters/skills/Skill_Second_2000055.webp',
      'https://cdn.test/chain.webp',
      undefined,
    ]);
    // La description, telle que le jeu l'écrit : sa couleur, son `\n` littéral.
    const [first, second, chain] = kitCards(page);
    expect(first.querySelector('.c-desc')?.innerHTML).toBe(
      'Attacks with a <span style="color:#28d9ed">40%</span> chance.<br>Second line.',
    );
    expect(second.querySelector('.c-desc')).toBeNull();

    expect(chips(first)).toEqual([['Increased Crit Hit Chance', '', '✕']]);
    expect(chips(second)).toEqual([
      ['Buff Removal', '', '✕'],
      ['Priority Increase', '', '✕'],
    ]);
    expect(chips(chain)).toEqual([]);
    // La tuile du site : l'icône en masque teinté de sa nature ; sans icône, un cadre vide.
    const tile = (ref: string) => chip(second, ref).querySelector('.c-fx')!;
    expect(tile('SYS_BUFF_REMOVE_BUFF').className).toBe('c-fx debuff');
    expect(tile('SYS_BUFF_REMOVE_BUFF').getAttribute('style')).toContain(
      "url('https://img.test/images/ui/effect/IG_Buff_Remove.webp')",
    );
    expect(tile('SYS_NO_ICON').className).toBe('c-fx none');
    expect(chip(first, '11').querySelector('.c-fx')?.className).toBe('c-fx buff');
    expect(chip(first, '11').title).toBe('11');
    expect(chip(first, '11').querySelector('button')?.getAttribute('aria-label')).toBe(
      'Masquer Increased Crit Hit Chance',
    );
    // Chaque carte a son « ＋ effet », le duo sans chip compris.
    expect(kitCards(page).map((c) => page.act('add-chip', c)?.textContent)).toEqual(
      Array(4).fill('＋ effet'),
    );
    expect(page.count()).toBe('aucune modification');
  });

  it('✕ masque une chip : barrée, atténuée, « rétablir » — comptée, le point sur l’onglet', async () => {
    const page = await character({ hash: SKILLS });
    const second = () => kitCard(page, '5502');
    chip(second(), 'SYS_BUFF_REMOVE_BUFF').querySelector('button')!.click();

    expect(chips(second())).toEqual([
      ['Buff Removal', 'off dirty', 'rétablir'],
      ['Priority Increase', '', '✕'],
    ]);
    expect(page.text(second(), '.card-head .badge.edit')).toBe('modifié');
    expect(page.count()).toBe('1 changement');
    expect(page.el('c-save').disabled).toBe(false);
    expect(page.subs()[3]).toEqual(['Skills', 'true', '', 'dot edit']);
    // Le focus reste sur la chip : son bouton, devenu « rétablir ».
    const back = chip(second(), 'SYS_BUFF_REMOVE_BUFF').querySelector('button')!;
    expect(page.window.document.activeElement).toBe(back as unknown as Element);
    expect(back.getAttribute('aria-label')).toBe('Rétablir Buff Removal');
    // Les autres cartes n'ont pas bougé.
    expect(page.text(kitCard(page, '5501'), '.card-head .badge.edit')).toBe('');

    chip(second(), 'SYS_NO_ICON').querySelector('button')!.click();
    expect(page.count()).toBe('2 changements');
    // « rétablir » rend la chip : revenue à ce que le disque porte, elle ne compte plus.
    chip(second(), 'SYS_BUFF_REMOVE_BUFF').querySelector('button')!.click();
    chip(second(), 'SYS_NO_ICON').querySelector('button')!.click();
    expect(chips(second()).map((c) => c[1])).toEqual(['', '']);
    expect(page.count()).toBe('aucune modification');
    expect(page.subs()[3][3]).toBe('');
    expect(page.el('c-save').disabled).toBe(true);
  });

  it('une chip que le disque masque déjà : barrée sans être « modifiée » ; la rétablir compte', async () => {
    const page = await character({
      hash: SKILLS,
      chips: { chipHide: { '5502': ['SYS_NO_ICON', 'legacy'] }, chipAdd: { '5501': ['7', '404'] } },
    });
    const second = () => kitCard(page, '5502');
    expect(chips(second())).toEqual([
      ['Buff Removal', '', '✕'],
      ['Priority Increase', 'off', 'rétablir'],
    ]);
    // Un effet ajouté par le disque : son badge ; hors du catalogue, sa ref pour nom.
    expect(chips(kitCard(page, '5501'))).toEqual([
      ['Increased Crit Hit Chance', '', '✕'],
      ['Increased Attack', '', '✕'],
      ['404', '', '✕'],
    ]);
    expect(
      [...kitCard(page, '5501').querySelectorAll('.c-chip')].map(
        (c) => c.querySelector('.badge')?.textContent ?? '',
      ),
    ).toEqual(['', 'ajoutée', 'ajoutée']);
    expect(page.count()).toBe('aucune modification');

    chip(second(), 'SYS_NO_ICON').querySelector('button')!.click();
    expect(chips(second())[1]).toEqual(['Priority Increase', 'dirty', '✕']);
    expect(page.count()).toBe('1 changement');
    await page.save();
    // La liste part ENTIÈRE : la ref héritée, que la carte ne montre pas, y reste.
    expect(page.posted()).toEqual([
      {
        id: AER,
        changes: {
          ranks: [],
          curated: {},
          was: curated()[AER],
          kit: {
            cardIds: ['5501', '5502', '5504', '5504::dual'],
            chipHide: { '5502': ['legacy'] },
            chipAdd: { '5502': [] },
          },
        },
      },
    ]);
  });

  it('« ＋ effet » : le picker partagé sur le catalogue — recherche, nature, homonymes départagés', async () => {
    const page = await character({ hash: SKILLS, chips: { chipAdd: { '5501': ['7'] } } });
    const first = () => kitCard(page, '5501');
    page.act('add-chip', first()).click();

    expect(page.el('hp-modal').hidden).toBe(false);
    expect(page.el('hp-title').textContent).toBe('Ajouter un effet — Whatever!');
    expect(page.el('hp-q').placeholder).toBe('Chercher un effet…');
    expect(page.el('hp-results').classList.contains('rows')).toBe(true);
    // Par nom ; l'effet que la carte a déjà en ajout n'est plus proposé.
    expect(tiles(page)).toEqual(['Burned', 'Immunity (buff)', 'Immunity (irremovable, buff)']);
    expect(page.el('hp-tally').textContent).toBe('3 effets');
    // Une tuile : celle de l'effet, et son nom ; les « Interruption » gardent leurs couleurs.
    const [burned, , irremovable] = page.all('#hp-results .hp-tile');
    expect(burned.title).toBe('Burned — 1');
    expect(burned.querySelector('.c-fx')?.className).toBe('c-fx debuff');
    expect(irremovable.querySelector('.c-fx img')?.getAttribute('src')).toBe(
      'https://img.test/images/ui/effect/IG_Buff_Immune_Interruption.webp',
    );
    // Ni pastille d'élément ni de classe : un effet n'en a pas.
    expect(page.all('#hp-filters .hp-tog')).toEqual([]);

    const seg = () => page.all('#hp-filters .hp-seg button');
    expect(seg().map((b) => b.textContent)).toEqual(['Tous', 'Buffs', 'Debuffs']);
    seg()[2].click();
    expect(tiles(page)).toEqual(['Burned']);
    seg()[1].click();
    expect(tiles(page)).toEqual(['Immunity (buff)', 'Immunity (irremovable, buff)']);
    seg()[0].click();
    page.type(page.el('hp-q'), 'zzz');
    expect(tiles(page)).toEqual([]);
    expect(page.el('hp-none').textContent).toBe('Aucun effet ne correspond.');
    page.type(page.el('hp-q'), 'irrem');
    expect(tiles(page)).toEqual(['Immunity (irremovable, buff)']);

    // La tuile choisie s'ajoute à la carte : son badge, le compte, le focus sur « ＋ effet ».
    page.all('#hp-results .hp-tile')[0].click();
    expect(page.el('hp-modal').hidden).toBe(true);
    expect(chips(first())).toEqual([
      ['Increased Crit Hit Chance', '', '✕'],
      ['Increased Attack', '', '✕'],
      ['Immunity', 'dirty', '✕'],
    ]);
    expect(chip(first(), '9', 'add').querySelector('.badge')?.textContent).toBe('ajoutée');
    expect(chip(first(), '9', 'add').querySelector('button')?.getAttribute('aria-label')).toBe(
      'Retirer Immunity',
    );
    expect(page.count()).toBe('1 changement');
    expect(page.subs()[3][3]).toBe('dot edit');
    expect(page.window.document.activeElement).toBe(
      page.act('add-chip', first()) as unknown as Element,
    );
    // La modale du picker de héros est la même : « Changer de perso » la rouvre sur des persos.
    page.act('add-chip', first()).click();
    expect(tiles(page)).toEqual(['Burned', 'Immunity (buff)']);
    page.el('hp-close').click();
    page.el('c-pick').click();
    expect(page.el('hp-q').placeholder).toBe('Chercher un perso…');
    expect(page.el('hp-results').classList.contains('rows')).toBe(false);
    expect(page.all('#hp-results .hp-fi')).toHaveLength(3);
    page.el('hp-close').click();

    // ✕ sur une chip ajoutée la retire : celle du picker ne compte plus, celle du disque compte.
    chip(first(), '9', 'add').querySelector('button')!.click();
    expect(page.count()).toBe('aucune modification');
    chip(first(), '7', 'add').querySelector('button')!.click();
    expect(chips(first())).toEqual([['Increased Crit Hit Chance', '', '✕']]);
    expect(page.count()).toBe('1 changement');
  });

  it('« Enregistrer » : les seules cartes modifiées, leurs deux listes ENTIÈRES ; le disque relu n’a plus rien en attente', async () => {
    const page = await character({ hash: SKILLS, saved: writeChips });
    chip(kitCard(page, '5502'), 'SYS_BUFF_REMOVE_BUFF').querySelector('button')!.click();
    page.act('add-chip', kitCard(page, '5504::dual')).click();
    page.all('#hp-results .hp-tile')[0].click();
    expect(page.count()).toBe('2 changements');

    const states = page.states();
    await page.save();
    expect(page.posted()).toEqual([
      {
        id: AER,
        changes: {
          ranks: [],
          curated: {},
          was: curated()[AER],
          kit: {
            cardIds: ['5501', '5502', '5504', '5504::dual'],
            chipHide: { '5502': ['SYS_BUFF_REMOVE_BUFF'], '5504::dual': [] },
            chipAdd: { '5502': [], '5504::dual': ['1'] },
          },
        },
      },
    ]);
    expect(page.states()).toBe(states + 1);
    expect(page.count()).toBe('aucune modification');
    expect(page.subs()[3][3]).toBe('');
    // Ce que le disque porte maintenant : masquée, ajoutée — plus « modifiées ».
    expect(chips(kitCard(page, '5502'))[0]).toEqual(['Buff Removal', 'off', 'rétablir']);
    expect(chips(kitCard(page, '5504::dual'))).toEqual([['Burned', '', '✕']]);
    expect(page.text(kitCard(page, '5502'), '.card-head .badge.edit')).toBe('');
  });

  it('un refus situé : la carte cerclée, son message dessous, sa saisie gardée ; y retoucher le lève', async () => {
    const page = await character({
      hash: SKILLS,
      saved: () => ({
        ok: false,
        log: ['REFUSÉ'],
        written: false,
        stale: false,
        refused: [
          { field: 'kit', card: '5502', reason: '« x » : pas une chip de cette carte' },
          { field: 'kit', reason: 'kit illisible (tables du jeu absentes)' },
        ],
      }),
    });
    chip(kitCard(page, '5502'), 'SYS_NO_ICON').querySelector('button')!.click();
    chip(kitCard(page, '5501'), '11').querySelector('button')!.click();
    await page.save();

    const second = () => kitCard(page, '5502');
    expect(second().classList.contains('ko')).toBe(true);
    expect(page.text(second(), '.card-head .badge.ko')).toBe('refusé');
    expect(page.text(second(), '.c-err')).toBe('« x » : pas une chip de cette carte');
    expect(kitCard(page, '5501').classList.contains('ko')).toBe(false);
    // Le refus sans carte : sous les cartes.
    expect(page.text(page.el('c-panel'), '[data-err="kit"]')).toBe(
      'kit illisible (tables du jeu absentes)',
    );
    expect(page.count()).toBe('2 changements2 refus');
    expect(page.subs()[3][3]).toBe('dot ko');
    expect(chips(second())[1]).toEqual(['Priority Increase', 'off dirty', 'rétablir']);

    chip(second(), 'SYS_NO_ICON').querySelector('button')!.click();
    expect(second().classList.contains('ko')).toBe(false);
    expect(page.text(second(), '.c-err')).toBe('');
    expect(page.text(page.el('c-panel'), '[data-err="kit"]')).toBe('');
    expect(page.subs()[3][3]).toBe('dot edit');
  });

  it('« Annuler » rend les chips du disque ; changer de sous-onglet garde la saisie', async () => {
    const page = await character({ hash: SKILLS, chips: { chipHide: { '5501': ['11'] } } });
    chip(kitCard(page, '5501'), '11').querySelector('button')!.click();
    page.act('add-chip', kitCard(page, '5504')).click();
    page.all('#hp-results .hp-tile')[1].click();
    expect(page.count()).toBe('2 changements');

    page.sub('fiche');
    expect(page.subs()[3][3]).toBe('dot edit');
    page.sub('skills');
    expect(chips(kitCard(page, '5501'))).toEqual([['Increased Crit Hit Chance', 'dirty', '✕']]);
    expect(chips(kitCard(page, '5504'))).toEqual([['Immunity', 'dirty', '✕']]);

    page.el('c-reset').click();
    await page.settle();
    await page.settle();
    expect(page.count()).toBe('aucune modification');
    expect(chips(kitCard(page, '5501'))).toEqual([
      ['Increased Crit Hit Chance', 'off', 'rétablir'],
    ]);
    expect(chips(kitCard(page, '5504'))).toEqual([]);
    expect(page.posted()).toEqual([]);
  });

  it('`…/skills/picker/2` ouvre le picker d’effets de la deuxième carte, sans l’écrire dans l’adresse', async () => {
    const page = await character({ hash: `${SKILLS}/picker/2` });
    expect(page.el('hp-modal').hidden).toBe(false);
    expect(page.el('hp-title').textContent).toBe('Ajouter un effet — To the Beach?');
    expect(page.window.location.hash).toBe(SKILLS);
    // Une carte qui n'existe pas : le sous-onglet, sans picker.
    const none = await character({ hash: `${SKILLS}/picker/9` });
    expect(none.el('hp-modal')).toBeNull();
    expect(kitCards(none)).toHaveLength(4);
  });

  it('un kit illisible, un perso sans carte : la page le dit, le reste de la fiche se lit', async () => {
    const page = await character({ hash: SKILLS, kitError: 'tables du jeu absentes' });
    expect(page.all('#c-panel .empty').map((e) => e.textContent)).toEqual([
      'Kit illisible : tables du jeu absentes.',
    ]);
    expect(kitCards(page)).toEqual([]);
    page.sub('fiche');
    expect(page.val(page.cell('rank'))).toBe('A');

    const ais = await character({ hash: `#character/${AIS}/skills` });
    expect(ais.all('#c-panel .empty').map((e) => e.textContent)).toEqual([
      'Aucune carte de skill.',
    ]);
  });

  // ------------------------------------------------------------------ « EE »
  // L'équipement exclusif du perso : sa tuile, ses deux rangs (des cellules de
  // Rangs), ses passifs en lecture, ses chips réglées comme celles d'un skill.
  const EE = `#character/${AER}/ee`;
  const AUTO = 'SYS_BUFF_ACTION_GAUGE_UP';
  const eeCard = (page: Page, card = 'ee-chips') => page.all(`#c-panel [data-card="${card}"]`)[0];
  /** L'aide-mémoire sous les chips : une ligne par effet décrit. */
  const memo = (page: Page) => page.all('#c-panel .c-memo li').map((li) => li.textContent);
  /** L'entrée curée de l'EE que la page avait chargée, telle qu'elle la renvoie. */
  const eeWas = (over: Partial<EeDisk> = {}) => ({
    rank: 'A',
    rank10: 'S',
    chipHide: [],
    chipAdd: [],
    ...over,
  });
  /** Un enregistrement qui écrit l'EE envoyé — ses rangs, ses chips — sur le disque factice. */
  const writeEe: NonNullable<Parameters<typeof character>[0]>['saved'] = (body, _, __, disk) => {
    const { ranks, ee } = (
      body as {
        changes: {
          ranks: { field: string; to: string }[];
          ee?: { chipHide: string[]; chipAdd: string[] };
        };
      }
    ).changes;
    for (const r of ranks) {
      if (r.field === 'eeRank') disk.rank = r.to;
      if (r.field === 'eeRank10') disk.rank10 = r.to;
    }
    if (ee) Object.assign(disk, { chipHide: ee.chipHide, chipAdd: ee.chipAdd });
    return { ok: true, log: ['fait'], written: true, stale: false, refused: [] };
  };

  it('`#character/2000055/ee` : la tuile de l’EE, ses deux rangs, ses passifs en lecture, ses chips et leur aide-mémoire', async () => {
    const page = await character({ hash: EE });
    expect(page.window.location.hash).toBe(EE);
    expect(page.subs()[4]).toEqual(['EE', 'true', '', '']);
    expect(page.el('c-panel').getAttribute('aria-labelledby')).toBe('c-tab-ee');
    // Pas de texte à tags ici : le groupe « Aperçu » de la savebar s'efface.
    expect(page.el('c-pv-lang').hidden).toBe(true);

    // L'en-tête : un ITEM — son cadre de rareté, son icône, ses étoiles —, son nom dans la couleur du grade.
    const head = page.all('#c-panel .c-ee')[0];
    expect(head.querySelector('.gv-frame')?.getAttribute('src')).toBe(
      'https://img.test/images/ui/bg/TI_Slot_Unique.webp',
    );
    expect(head.querySelector('.gv-icon')?.getAttribute('src')).toBe(
      'https://img.test/images/equipment/TI_Equipment_EX_2000055.webp',
    );
    expect(head.querySelector('.gv-tile')?.getAttribute('style')).toBe('width:56px;height:56px');
    expect(head.querySelectorAll('.gv-stars img')).toHaveLength(6);
    expect(page.text(head, '.c-een')).toBe('Super Board');
    expect(head.querySelector('.c-een')?.getAttribute('style')).toBe('color:var(--item-legendary)');
    expect(head.querySelector('.lbl')).toBeNull();

    // Les rangs : deux cellules de Rangs, sur l'échelle des EE (pas de E) plus vide.
    const ranks = eeCard(page, 'ee-ranks');
    expect([...ranks.querySelectorAll('label')].map((l) => l.textContent)).toEqual([
      'Au déblocage',
      'À +10',
    ]);
    expect(page.val(page.cell('eeRank'))).toBe('A');
    expect(page.val(page.cell('eeRank10'))).toBe('S');
    expect([...page.cell('eeRank').options].map((o) => o.value)).toEqual([
      '',
      'S',
      'A',
      'B',
      'C',
      'D',
    ]);
    expect([...ranks.querySelectorAll('.c-rkico')].map((i) => i.getAttribute('src'))).toEqual([
      'https://img.test/images/ui/rank/IG_Event_Rank_A.webp',
      'https://img.test/images/ui/rank/IG_Event_Rank_S.webp',
    ]);

    // Les passifs, en lecture : le déblocage puis +10, le texte tel que le jeu l'écrit.
    const passives = eeCard(page, 'ee-passives');
    expect([...passives.querySelectorAll('.badge')].map((b) => b.textContent)).toEqual([
      'Déblocage',
      '+10',
    ]);
    expect([...passives.querySelectorAll('.c-desc')].map((d) => d.innerHTML)).toEqual([
      'Penetration <span style="color:#28d9ed">+20%</span> when using To the Beach?',
      'Line one.<br>Line two.',
    ]);
    expect(passives.querySelector('select, input, button')).toBeNull();

    // Les chips : la rangée d'une carte de Skills, « ＋ effet » au bout.
    expect(chips(eeCard(page))).toEqual([
      ['Priority Increase', '', '✕'],
      ['Silent', '', '✕'],
    ]);
    expect(chip(eeCard(page), AUTO).querySelector('.c-fx')?.className).toBe('c-fx buff');
    expect(chip(eeCard(page), 'SYS_NO_DESC').querySelector('.c-fx')?.className).toBe('c-fx none');
    expect(page.act('add-chip', eeCard(page)).textContent).toBe('＋ effet');
    // L'aide-mémoire : une chip sans description n'y est pas.
    expect(memo(page)).toEqual(['Priority Increase — Increases the target’s Priority.']);
    expect(page.all('#c-panel .c-memo li')[0].className).toBe('lbl');
    expect(page.all('#c-panel .c-memo li span span')[0].getAttribute('style')).toBe(
      'color:#28d9ed',
    );
    expect(page.count()).toBe('aucune modification');
  });

  it('un second porteur : « porté aussi par … » sous le nom ; sans chip, la carte le dit', async () => {
    const page = await character({
      hash: EE,
      companion: { id: '2700055', name: 'Core Fusion Aer' },
    });
    expect(page.text(page.all('#c-panel .c-ee')[0], '.lbl')).toBe(
      'porté aussi par Core Fusion Aer',
    );
    // Toutes ses chips masquées restent là, barrées ; l'aide-mémoire s'efface.
    const hidden = await character({
      hash: EE,
      ee: { chipHide: [AUTO, 'SYS_NO_DESC'] },
    });
    expect(chips(eeCard(hidden)).map((c) => c[1])).toEqual(['off', 'off']);
    expect(memo(hidden)).toEqual([]);
    expect(hidden.all('#c-panel .c-memo')).toEqual([]);
  });

  it('un perso sans EE : l’onglet est éteint, son `title` le dit ; `…/ee` vaut `fiche`, le clavier le saute', async () => {
    const page = await character({ hash: `#character/${AIS}/ee` });
    expect(page.subs()[4]).toEqual(['EE', 'false', 'pas d’EE', '']);
    expect(page.window.location.hash).toBe(`#character/${AIS}/fiche`);
    expect(page.subs()[0].slice(0, 2)).toEqual(['Fiche', 'true']);
    // Éteint : un clic n'y mène pas, et → passe de Skills à Gear reco.
    page.el('c-tab-ee').click();
    expect(page.window.location.hash).toBe(`#character/${AIS}/fiche`);
    page.sub('skills');
    page.el('c-tab-skills').focus();
    page.fire(page.el('c-tab-skills'), 'keydown', 'ArrowRight');
    expect(page.window.location.hash).toBe(`#character/${AIS}/gear`);

    // Changer de perso depuis l'EE d'Aer : Ais n'en a pas, sa fiche s'ouvre sur « Fiche ».
    const aer = await character({ hash: EE });
    aer.el('c-pick').click();
    aer.all('#hp-results .hp-tile')[1].click();
    await aer.settle();
    await aer.settle();
    expect(aer.all('#c-who strong')[0].textContent).toBe('Ais Wallenstein');
    expect(aer.window.location.hash).toBe(`#character/${AIS}/fiche`);
    expect(aer.subs()[4]).toEqual(['EE', 'false', 'pas d’EE', '']);
  });

  it('les deux rangs : des cellules de Rangs — surlignées, comptées dans CE sous-onglet, envoyées comme elles', async () => {
    const page = await character({ hash: EE, saved: writeEe });
    page.pick(page.cell('eeRank10'), 'A');

    expect(page.cell('eeRank10').className).toBe('dirty');
    expect(eeCard(page, 'ee-ranks').querySelectorAll('.c-rkico')[1].getAttribute('src')).toBe(
      'https://img.test/images/ui/rank/IG_Event_Rank_A.webp',
    );
    expect(page.count()).toBe('1 changement');
    expect(page.all('#c-panel [data-mod="ee-ranks"]')[0].textContent).toBe('modifié');
    expect(page.all('#c-panel [data-mod="ee-chips"]')[0].textContent).toBe('');
    expect(page.subs()[4]).toEqual(['EE', 'true', '', 'dot edit']);
    // Pas dans Fiche : ni son point, ni le badge de sa carte Rangs.
    expect(page.subs()[0][3]).toBe('');
    page.sub('fiche');
    expect(page.all('#c-panel [data-mod="ranks"]')[0].textContent).toBe('');
    page.pick(page.cell('rank'), 'S');
    expect(page.count()).toBe('2 changements');
    expect(page.subs().map((t) => t[3])).toEqual(['dot edit', '', '', '', 'dot edit', '']);
    page.pick(page.cell('rank'), 'A');
    page.sub('ee');
    expect(page.val(page.cell('eeRank10'))).toBe('A');
    page.pick(page.cell('eeRank'), '');
    expect(page.count()).toBe('2 changements');

    await page.save();
    // Les rangs de l'EE partent en cellules ; sans chip touchée, pas de `ee`.
    expect(page.posted()).toEqual([
      {
        id: AER,
        changes: {
          ranks: [
            { id: AER, field: 'eeRank10', from: 'S', to: 'A' },
            { id: AER, field: 'eeRank', from: 'A', to: '' },
          ],
          curated: {},
          was: curated()[AER],
        },
      },
    ]);
    expect(page.count()).toBe('aucune modification');
    expect(page.val(page.cell('eeRank'))).toBe('');
    expect(page.val(page.cell('eeRank10'))).toBe('A');
    expect(page.cell('eeRank10').className).toBe('');
    // Vidé : le cadre perd son icône.
    expect(
      (eeCard(page, 'ee-ranks').querySelectorAll('.c-rkico')[0] as unknown as HTMLElement).hidden,
    ).toBe(true);
  });

  it('✕ masque une chip : barrée, « rétablir », sortie de l’aide-mémoire — comptée ; rétablie, elle ne compte plus', async () => {
    const page = await character({ hash: EE });
    chip(eeCard(page), AUTO).querySelector('button')!.click();

    expect(chips(eeCard(page))).toEqual([
      ['Priority Increase', 'off dirty', 'rétablir'],
      ['Silent', '', '✕'],
    ]);
    expect(memo(page)).toEqual([]);
    expect(page.text(eeCard(page), '.card-head .badge.edit')).toBe('modifié');
    expect(page.all('#c-panel [data-mod="ee-ranks"]')[0].textContent).toBe('');
    expect(page.count()).toBe('1 changement');
    expect(page.subs()[4][3]).toBe('dot edit');
    // Le focus reste sur la chip : son bouton, devenu « rétablir ».
    const back = chip(eeCard(page), AUTO).querySelector('button')!;
    expect(page.window.document.activeElement).toBe(back as unknown as Element);
    expect(back.getAttribute('aria-label')).toBe('Rétablir Priority Increase');

    back.click();
    expect(chips(eeCard(page)).map((c) => c[1])).toEqual(['', '']);
    expect(memo(page)).toHaveLength(1);
    expect(page.count()).toBe('aucune modification');
    expect(page.subs()[4][3]).toBe('');
    expect(page.el('c-save').disabled).toBe(true);
  });

  it('« ＋ effet » : le picker d’effets de Skills sur le catalogue — l’effet choisi s’ajoute, décrit dessous ; ✕ le retire', async () => {
    const page = await character({ hash: EE, ee: { chipAdd: ['7'] } });
    expect(chips(eeCard(page))[2]).toEqual(['Increased Attack', '', '✕']);
    page.act('add-chip', eeCard(page)).click();

    expect(page.el('hp-modal').hidden).toBe(false);
    expect(page.el('hp-title').textContent).toBe('Ajouter un effet — Super Board');
    expect(page.el('hp-q').placeholder).toBe('Chercher un effet…');
    expect(page.el('hp-results').classList.contains('rows')).toBe(true);
    // Par nom, homonymes départagés ; l'effet déjà ajouté n'est plus proposé.
    expect(tiles(page)).toEqual(['Burned', 'Immunity (buff)', 'Immunity (irremovable, buff)']);
    expect(page.all('#hp-filters .hp-seg button').map((b) => b.textContent)).toEqual([
      'Tous',
      'Buffs',
      'Debuffs',
    ]);

    page.all('#hp-results .hp-tile')[0].click();
    expect(page.el('hp-modal').hidden).toBe(true);
    expect(chips(eeCard(page))).toEqual([
      ['Priority Increase', '', '✕'],
      ['Silent', '', '✕'],
      ['Increased Attack', '', '✕'],
      ['Burned', 'dirty', '✕'],
    ]);
    expect(chip(eeCard(page), '1', 'add').querySelector('.badge')?.textContent).toBe('ajoutée');
    expect(chip(eeCard(page), '1', 'add').querySelector('button')?.getAttribute('aria-label')).toBe(
      'Retirer Burned',
    );
    // L'aide-mémoire suit : la chip visible, puis l'ajout que le catalogue décrit.
    expect(memo(page)).toEqual([
      'Priority Increase — Increases the target’s Priority.',
      'Burned — Takes damage every turn.',
    ]);
    expect(page.count()).toBe('1 changement');
    expect(page.subs()[4][3]).toBe('dot edit');
    expect(page.window.document.activeElement).toBe(
      page.act('add-chip', eeCard(page)) as unknown as Element,
    );

    // ✕ sur l'ajout du picker : il ne compte plus ; sur celui du disque : il compte.
    chip(eeCard(page), '1', 'add').querySelector('button')!.click();
    expect(page.count()).toBe('aucune modification');
    expect(memo(page)).toHaveLength(1);
    chip(eeCard(page), '7', 'add').querySelector('button')!.click();
    expect(chips(eeCard(page))).toHaveLength(2);
    expect(page.count()).toBe('1 changement');
  });

  it('« Enregistrer » : un rang et des chips en UN envoi — les deux listes ENTIÈRES et l’entrée chargée ; le disque relu n’a plus rien en attente', async () => {
    const page = await character({
      hash: EE,
      saved: writeEe,
      // `legacy` : une ref héritée du fichier, que la carte ne montre pas ; `404`, hors catalogue.
      ee: { chipHide: ['SYS_NO_DESC', 'legacy'], chipAdd: ['404'] },
    });
    expect(chips(eeCard(page))).toEqual([
      ['Priority Increase', '', '✕'],
      ['Silent', 'off', 'rétablir'],
      ['404', '', '✕'],
    ]);
    expect(page.count()).toBe('aucune modification');

    page.pick(page.cell('eeRank'), 'S');
    chip(eeCard(page), 'SYS_NO_DESC').querySelector('button')!.click();
    chip(eeCard(page), AUTO).querySelector('button')!.click();
    page.act('add-chip', eeCard(page)).click();
    page.all('#hp-results .hp-tile')[0].click();
    expect(page.count()).toBe('4 changements');

    const states = page.states();
    await page.save();
    expect(page.posted()).toEqual([
      {
        id: AER,
        changes: {
          ranks: [{ id: AER, field: 'eeRank', from: 'A', to: 'S' }],
          curated: {},
          was: curated()[AER],
          ee: {
            chipHide: ['legacy', AUTO],
            chipAdd: ['404', '1'],
            was: eeWas({ chipHide: ['SYS_NO_DESC', 'legacy'], chipAdd: ['404'] }),
          },
        },
      },
    ]);
    expect(page.states()).toBe(states + 1);
    expect(page.count()).toBe('aucune modification');
    expect(page.subs()[4][3]).toBe('');
    // Ce que le disque porte maintenant n'est plus « modifié ».
    expect(chips(eeCard(page))).toEqual([
      ['Priority Increase', 'off', 'rétablir'],
      ['Silent', '', '✕'],
      ['404', '', '✕'],
      ['Burned', '', '✕'],
    ]);
    expect(page.val(page.cell('eeRank'))).toBe('S');
    expect(page.text(eeCard(page), '.card-head .badge.edit')).toBe('');
  });

  it('un refus situé : la carte des chips cerclée, son message dessous, sa saisie gardée — la cellule refusée montre le disque', async () => {
    const page = await character({
      hash: EE,
      saved: () => ({
        ok: false,
        log: ['REFUSÉ'],
        written: false,
        stale: false,
        refused: [
          { field: 'ee', reason: '« x » : pas une chip de cet EE' },
          { field: 'eeRank10', reason: 'la page avait « S », le disque porte « A »' },
        ],
      }),
    });
    chip(eeCard(page), AUTO).querySelector('button')!.click();
    page.pick(page.cell('eeRank10'), 'B');
    await page.save();

    expect(eeCard(page).classList.contains('ko')).toBe(true);
    expect(page.text(eeCard(page), '.card-head .badge.ko')).toBe('refusé');
    expect(page.text(eeCard(page), '[data-err="ee"]')).toBe('« x » : pas une chip de cet EE');
    expect(chips(eeCard(page))[0]).toEqual(['Priority Increase', 'off dirty', 'rétablir']);
    // La cellule refusée n'est plus « modifiée » : le disque, cerclé, son refus dessous.
    expect(page.cell('eeRank10').className).toBe('refused');
    expect(page.val(page.cell('eeRank10'))).toBe('S');
    expect(eeCard(page, 'ee-ranks').classList.contains('ko')).toBe(true);
    expect(page.text(eeCard(page, 'ee-ranks'), '[data-err="eeRank10"]')).toBe(
      'la page avait « S », le disque porte « A »',
    );
    expect(page.count()).toBe('1 changement2 refus');
    expect(page.subs()[4][3]).toBe('dot ko');
    // Rien de tout ça n'est de la Fiche.
    expect(page.subs()[0][3]).toBe('');
    page.sub('fiche');
    expect(page.all('#c-panel [data-card="ranks"]')[0].classList.contains('ko')).toBe(false);
    page.sub('ee');

    // Y retoucher lève le refus des chips.
    chip(eeCard(page), 'SYS_NO_DESC').querySelector('button')!.click();
    expect(eeCard(page).classList.contains('ko')).toBe(false);
    expect(page.text(eeCard(page), '[data-err="ee"]')).toBe('');
    expect(page.count()).toBe('2 changements1 refus');
  });

  it('`stale` : l’entrée de l’EE avait changé — les chips montrent le disque, le refus dessous', async () => {
    const page = await character({
      hash: EE,
      saved: (_, __, ___, disk) => {
        // L'admin avait masqué l'autre chip entre-temps : rien n'est écrit.
        disk.chipHide = ['SYS_NO_DESC'];
        return {
          ok: false,
          log: ['REFUSÉ'],
          written: false,
          stale: true,
          refused: [{ field: 'ee', reason: 'le disque a changé depuis le chargement' }],
        };
      },
    });
    chip(eeCard(page), AUTO).querySelector('button')!.click();
    await page.save();

    expect(chips(eeCard(page))).toEqual([
      ['Priority Increase', '', '✕'],
      ['Silent', 'off', 'rétablir'],
    ]);
    expect(page.text(eeCard(page), '[data-err="ee"]')).toBe(
      'le disque a changé depuis le chargement',
    );
    expect(page.count()).toBe('1 refus');
    expect(page.el('c-save').disabled).toBe(true);
  });

  it('« Annuler » rend l’EE du disque ; changer de sous-onglet garde la saisie, `canLeave` la retient', async () => {
    const page = await character({ hash: EE, ee: { chipHide: [AUTO] } });
    chip(eeCard(page), AUTO).querySelector('button')!.click();
    page.pick(page.cell('eeRank'), 'C');
    page.act('add-chip', eeCard(page)).click();
    page.all('#hp-results .hp-tile')[1].click();
    expect(page.count()).toBe('3 changements');

    page.sub('skills');
    expect(page.subs()[4][3]).toBe('dot edit');
    page.sub('ee');
    expect(page.val(page.cell('eeRank'))).toBe('C');
    expect(page.cell('eeRank').className).toBe('dirty');
    expect(chips(eeCard(page))).toEqual([
      ['Priority Increase', 'dirty', '✕'],
      ['Silent', '', '✕'],
      ['Immunity', 'dirty', '✕'],
    ]);
    // Quitter l'onglet avec l'EE en attente : sur confirmation.
    page.confirm.mockReturnValueOnce(false);
    page.all('#tabs [data-tab="effects"]')[0].click();
    expect(page.confirm).toHaveBeenCalledWith(expect.stringContaining('3 changements'));
    expect(page.el('tab-character').hidden).toBe(false);

    page.el('c-reset').click();
    await page.settle();
    await page.settle();
    expect(page.count()).toBe('aucune modification');
    expect(page.val(page.cell('eeRank'))).toBe('A');
    expect(chips(eeCard(page))).toEqual([
      ['Priority Increase', 'off', 'rétablir'],
      ['Silent', '', '✕'],
    ]);
    expect(page.posted()).toEqual([]);
  });

  // ---------------------------------------------------------------- Gear reco
  // Le dernier sous-onglet : l'ancienne section « Gear reco » des Données,
  // devenue un module (`tabs/gear.js`) que la fiche monte pour son perso. Son UI
  // et ses routes n'ont pas bougé ; son en-tête et son picker de perso, si.

  /** La page ouverte sur Gear reco, son état et son premier aperçu arrivés. */
  async function geared(
    hash = `#character/${AER}/gear`,
    opts: Parameters<typeof character>[0] = {},
  ) {
    const page = await character({ ...opts, hash });
    for (let i = 0; i < 6; i++) await page.settle();
    return page;
  }

  it('Gear reco : y venir monte le module pour le perso de la fiche, son état lu une fois', async () => {
    const page = await character({ hash: `#character/${AER}` });
    // Plus de section à lui : ni onglet dans le menu, ni `<section>`.
    expect(page.all('#tabs [data-tab="gear"]')).toEqual([]);
    expect(page.el('tab-gear')).toBeNull();
    expect(page.all('#tabs [data-group="data"]').map((b) => b.dataset.tab)).toEqual([
      'ranks',
      'gamedata',
    ]);

    await page.gear();
    expect(page.window.location.hash).toBe(`#character/${AER}/gear`);
    expect(page.subs()[5]).toEqual(['Gear reco', 'true', '', '']);
    expect(page.el('c-panel').hidden).toBe(true);
    expect(page.el('c-panel').innerHTML).toBe('');
    expect(page.el('c-gear').hidden).toBe(false);
    expect(page.gearStates()).toEqual([`/api/gear-reco/state?id=${AER}`]);
    // Ni en-tête de perso ni « Changer de perso » à lui : la fiche les a.
    expect(page.el('g-who')).toBeNull();
    expect(page.el('g-pick')).toBeNull();
    expect(page.all('#c-who strong')[0].textContent).toBe('Aer');
    // Sa savebar, ses onglets de builds, la carte du premier.
    expect(page.el('g-bar').hidden).toBe(false);
    expect(page.gearCount()).toBe('aucune modification');
    expect(page.builds()).toEqual([
      ['Speed', 'true', ''],
      ['High Crit', 'false', ''],
    ]);
    expect(page.buildName().value).toBe('Speed');
    expect(page.all('#g-pv-lang button').map((b) => b.textContent)).toEqual([
      'en',
      'fr',
      'es',
      'jp',
      'kr',
      'zh',
    ]);
    // Au-dessus de sa barre, qui enregistre quoi ; la barre de la fiche reste,
    // sans langue d'aperçu (ce sous-onglet a la sienne).
    expect(page.all('#c-gear > p.hint')[0].textContent).toContain(
      '« Enregistrer » de la fiche, au-dessus, ne les envoie pas',
    );
    expect(page.el('c-bar').hidden).toBe(false);
    expect(page.el('c-pv-lang').hidden).toBe(true);

    // Un autre sous-onglet, puis le retour : le module est resté monté, rien n'est relu.
    page.sub('fiche');
    expect(page.el('c-gear').hidden).toBe(true);
    expect(page.el('c-panel').hidden).toBe(false);
    expect(page.all('#c-panel .c-card').length).toBeGreaterThan(0);
    await page.gear();
    expect(page.gearStates()).toHaveLength(1);
    expect(page.builds()).toHaveLength(2);
  });

  it('`#character/<id>/gear/build/2/picker/weapons` : le n-ième build, et son picker d’armes', async () => {
    const page = await geared(`#character/${AER}/gear/build/2/picker/weapons`);
    // L'adresse dit le sous-onglet, pas le build montré.
    expect(page.window.location.hash).toBe(`#character/${AER}/gear`);
    expect(page.builds().map((b) => b.slice(0, 2))).toEqual([
      ['Speed', 'false'],
      ['High Crit', 'true'],
    ]);
    expect(page.buildName().value).toBe('High Crit');
    expect(page.el('g-modal').hidden).toBe(false);
    expect(page.el('g-modal-title').textContent).toBe('Choisir les armes');
    // Les armes de la classe du perso de la fiche (striker), celle du build cochée.
    expect(page.tiles()).toEqual([
      ['Surefire Greatsword', 'true'],
      ['Twin B', 'false'],
    ]);
    expect(page.el('g-tally').textContent).toBe('1 choisie sur 2 · striker');

    // Sans picker ; un rang hors des builds est borné au dernier.
    const far = await geared(`#character/${AER}/gear/build/9`);
    expect(far.builds().map((b) => b[1])).toEqual(['false', 'true']);
    expect(far.el('g-modal').hidden).toBe(true);
  });

  it('les anciens liens : `#gear/<id>…` vaut `#character/<id>/gear…`, mêmes effets', async () => {
    const page = await geared(`#gear/${AER}/build/2/picker/weapons`);
    expect(page.el('tab-character').hidden).toBe(false);
    expect(page.all('#tabs [data-tab="character"]')[0].getAttribute('aria-selected')).toBe('true');
    expect(page.window.location.hash).toBe(`#character/${AER}/gear`);
    expect(page.subs()[5].slice(0, 2)).toEqual(['Gear reco', 'true']);
    expect(page.builds().map((b) => b[1])).toEqual(['false', 'true']);
    expect(page.el('g-modal').hidden).toBe(false);
    expect(page.el('g-modal-title').textContent).toBe('Choisir les armes');

    // `#gear/<id>` : le perso, son premier build — ici aucun —, pas de picker.
    const plain = await geared(`#gear/${AIS}`);
    expect(plain.window.location.hash).toBe(`#character/${AIS}/gear`);
    expect(plain.all('#c-who strong')[0].textContent).toBe('Ais Wallenstein');
    expect(plain.gearStates()).toEqual([`/api/gear-reco/state?id=${AIS}`]);
    expect(plain.all('#g-list .empty')[0].textContent).toBe(
      'Aucun build pour ce perso : « ＋ build » en ajoute un.',
    );
    expect(plain.el('g-modal').hidden).toBe(true);

    // `#gear` seul : la fiche, sur Gear reco — et le picker de héros, faute de perso.
    const bare = await geared('#gear');
    expect(bare.el('tab-character').hidden).toBe(false);
    expect(bare.gearStates()).toEqual([]);
    expect(bare.el('hp-modal').hidden).toBe(false);
    bare.all('#hp-results .hp-tile')[0].click();
    for (let i = 0; i < 6; i++) await bare.settle();
    expect(bare.window.location.hash).toBe(`#character/${AER}/gear`);
    expect(bare.builds()).toHaveLength(2);
  });

  it('Gear reco : les onglets de builds — clic, clavier, « ＋ build » — et le point du sous-onglet', async () => {
    const page = await geared();
    const tab = (i: number) => page.all('#g-tabs [role="tab"]')[i];
    tab(1).click();
    expect(page.buildName().value).toBe('High Crit');
    expect(page.el('g-list').getAttribute('role')).toBe('tabpanel');
    expect(page.el('g-list').getAttribute('aria-labelledby')).toBe(tab(1).id);
    // → depuis le dernier revient au premier ; changer d'onglet ne redemande pas l'aperçu.
    page.fire(tab(1), 'keydown', 'ArrowRight');
    expect(page.builds().map((b) => b[1])).toEqual(['true', 'false']);
    expect(page.gearPreviews()).toHaveLength(1);

    // « ＋ build » : un onglet de plus, montré, en erreur tant qu'il n'a pas de nom.
    page.el('g-add').click();
    expect(page.builds()).toEqual([
      ['Speed', 'false', ''],
      ['High Crit', 'false', ''],
      ['Build 3', 'true', 'dot ko'],
    ]);
    expect(page.gearCount()).toContain('1 changement');
    expect(page.gearCount()).toContain('nom vide');
    page.type(page.buildName(), 'PvP');
    expect(page.builds()[2]).toEqual(['PvP', 'true', 'dot edit']);
    expect(page.gearCount()).toBe('1 changement');
    // Le sous-onglet de la fiche porte le point ; sa savebar ne compte pas les builds.
    expect(page.subs()[5]).toEqual(['Gear reco', 'true', '', 'dot edit']);
    expect(page.count()).toBe('aucune modification');
    expect(page.el('c-save').disabled).toBe(true);

    // « Annuler » de SA barre relit les builds du disque.
    page.el('g-reset').click();
    for (let i = 0; i < 6; i++) await page.settle();
    expect(page.gearStates()).toHaveLength(2);
    expect(page.builds()).toHaveLength(2);
    expect(page.gearCount()).toBe('aucune modification');
    expect(page.subs()[5][3]).toBe('');
  });

  it('Gear reco : l’aperçu — une requête pour tous les builds, la langue de la barre, 400 ms après une frappe', async () => {
    const page = await geared(`#character/${AER}/gear/build/2`);
    // Les builds tels qu'ils partiraient : intacts, ceux du disque.
    expect(page.gearPreviews()).toEqual([{ builds: gearDisk()[AER], lang: 'en' }]);
    const pv = () => page.card().querySelector('[data-pv]')?.textContent ?? '';
    expect(pv()).toContain('Surefire Greatsword');
    expect(pv()).toContain('en: Crit first.');

    // Une autre langue : une requête, aussitôt.
    page.all('#g-pv-lang button[data-lang="fr"]')[0].click();
    await page.settle();
    await page.settle();
    expect(page.gearPreviews()).toHaveLength(2);
    expect(page.gearPreviews()[1]).toMatchObject({ lang: 'fr' });
    expect(pv()).toContain('fr: Le crit d’abord.');

    // Une frappe dans la note : rien avant 400 ms, puis les builds retouchés.
    page.type(page.note(), 'Crit, then speed.');
    expect(page.gearPreviews()).toHaveLength(2);
    await page.preview();
    expect(page.gearPreviews()).toHaveLength(3);
    expect(page.gearPreviews()[2]).toMatchObject({
      lang: 'fr',
      builds: [{ name: 'Speed' }, { name: 'High Crit', note: { en: 'Crit, then speed.' } }],
    });
    expect(page.gearCount()).toBe('1 changement');
  });

  it('Gear reco : un picker de pièces — cocher puis « Valider » pose, Échap ferme sans rien poser', async () => {
    const page = await geared();
    const add = () =>
      page
        .card()
        .querySelector(
          '[data-act="pick"][data-slot="weapons"][data-i="-1"]',
        ) as unknown as HTMLElement;
    const pieces = () => page.all('#g-list .g-gear .g-item-n').map((n) => n.textContent);
    expect(pieces()).toEqual(['Surefire Greatsword', 'Death’s Hold']);

    add().click();
    expect(page.el('g-modal').hidden).toBe(false);
    page.all('#g-results .g-tile')[1].click();
    expect(page.tiles()).toEqual([
      ['Surefire Greatsword', 'true'],
      ['Twin B', 'true'],
    ]);
    page.fire(page.el('g-q'), 'keydown', 'Escape');
    expect(page.el('g-modal').hidden).toBe(true);
    expect(pieces()).toEqual(['Surefire Greatsword', 'Death’s Hold']);
    expect(page.gearCount()).toBe('aucune modification');

    add().click();
    page.all('#g-results .g-tile')[1].click();
    page.all('#g-foot [data-pk="ok"]')[0].click();
    expect(page.el('g-modal').hidden).toBe(true);
    expect(pieces()).toEqual(['Surefire Greatsword', 'Twin B', 'Death’s Hold']);
    expect(page.gearCount()).toBe('1 changement');
    expect(page.builds()[0]).toEqual(['Speed', 'true', 'dot edit']);

    // Les autres slots ouvrent la même modale : les talismans, le mix de sets.
    (
      page
        .card()
        .querySelector('[data-act="pick"][data-slot="talismans"]') as unknown as HTMLElement
    ).click();
    expect(page.el('g-modal-title').textContent).toBe('Choisir les talismans');
    expect(page.tiles()).toEqual([
      ['Rogue’s Charm', 'true'],
      ['Undertaker’s Charm', 'true'],
    ]);
    page.el('g-close').click();
    (
      page.card().querySelector('[data-act="pick"][data-slot="sets"]') as unknown as HTMLElement
    ).click();
    expect(page.el('g-modal-title').textContent).toBe('Composer les sets');
    expect(page.el('g-tally').textContent).toBe('Speed Set · 4 pièces');
    page.el('g-close').click();
    expect(page.el('g-modal').hidden).toBe(true);
  });

  it('Gear reco : « Enregistrer » de SA barre poste les builds, à part ; celle de la fiche ne les envoie pas', async () => {
    const page = await geared();
    page.type(page.buildName(), 'Speed 2');
    expect(page.gearCount()).toBe('1 changement');
    expect(page.builds()[0]).toEqual(['Speed 2', 'true', 'dot edit']);
    // La savebar de la fiche ne compte pas les builds : son bouton reste éteint.
    expect(page.count()).toBe('aucune modification');
    expect(page.el('c-save').disabled).toBe(true);
    await page.save();
    expect(page.posted()).toEqual([]);
    expect(page.gearPosted()).toEqual([]);

    // Un rang en plus : la fiche part seule, les builds restent en attente.
    page.sub('fiche');
    page.pick(page.cell('rank'), 'S');
    expect(page.count()).toBe('1 changement');
    await page.save();
    expect(page.posted()).toHaveLength(1);
    expect(page.gearPosted()).toEqual([]);
    expect(page.subs()[5]).toEqual(['Gear reco', 'false', '', 'dot edit']);
    await page.gear();
    expect(page.gearStates()).toHaveLength(1);
    expect(page.gearCount()).toBe('1 changement');

    // Sa barre : la liste entière du perso, un build intact tel que le disque l'écrit.
    await page.gearSave();
    const [speed, crit] = gearDisk()[AER];
    expect(page.gearPosted()).toEqual([{ id: AER, builds: [{ ...speed, name: 'Speed 2' }, crit] }]);
    // Écrit : le disque est relu, le build montré reste le même.
    expect(page.gearStates()).toHaveLength(2);
    expect(page.gearCount()).toBe('aucune modification');
    expect(page.builds()).toEqual([
      ['Speed 2', 'true', ''],
      ['High Crit', 'false', ''],
    ]);
    expect(page.subs()[5][3]).toBe('');
    expect(page.posted()).toHaveLength(1);
  });

  it('Gear reco : un refus du serveur se pose sur son build, rien n’est relu ; une erreur retient l’envoi', async () => {
    const page = await geared(undefined, {
      gearSaved: () => ({
        ok: false,
        log: ['refusé'],
        written: false,
        issues: [{ build: 1, slot: 'note', message: 'tag inconnu {B/nope}' }],
      }),
    });
    page.type(page.buildName(), 'Speed 2');
    await page.gearSave();
    expect(page.gearPosted()).toHaveLength(1);
    expect(page.gearStates()).toHaveLength(1);
    expect(page.el('journal').dataset.state).toBe('ko');
    // Le build 2 porte l'erreur : son onglet en rouge, la savebar la compte.
    expect(page.builds()).toEqual([
      ['Speed 2', 'true', 'dot edit'],
      ['High Crit', 'false', 'dot ko'],
    ]);
    expect(page.gearCount()).toContain('1 erreur');
    page.all('#g-tabs [role="tab"]')[1].click();
    expect(page.card().classList.contains('ko')).toBe(true);
    expect(
      page.all('#g-list .g-iss[data-iss="note"] .badge.error').map((b) => b.textContent),
    ).toEqual(['tag inconnu {B/nope}']);

    // Tant qu'il en reste une, rien n'est envoyé : le journal dit laquelle.
    await page.gearSave();
    expect(page.gearPosted()).toHaveLength(1);
    expect(page.el('log').textContent).toContain('Rien n’est envoyé tant qu’il reste des erreurs');
    expect(page.el('log').textContent).toContain('build 2 « High Crit » · Note : tag inconnu');
    // Le build retouché ne porte plus l'erreur du dernier enregistrement.
    page.type(page.note(), 'Crit.');
    expect(page.builds()[1]).toEqual(['High Crit', 'true', 'dot edit']);
  });

  it('`dirty` et `canLeave` communs : des builds en attente retiennent l’onglet et le changement de perso', async () => {
    const page = await geared();
    const leave = () => page.all('#tabs [data-tab="effects"]')[0].click();
    const unload = () => {
      const event = new page.window.Event('beforeunload', { cancelable: true });
      (page.window.onbeforeunload as unknown as (e: unknown) => void)(event);
      return event.defaultPrevented;
    };
    const hero = (id: string) => page.all('#hp-results .hp-tile').find((t) => t.dataset.id === id)!;
    expect(unload()).toBe(false);

    page.type(page.buildName(), 'Speed 2');
    expect(unload()).toBe(true);
    page.confirm.mockReturnValueOnce(false);
    leave();
    expect(page.el('tab-character').hidden).toBe(false);
    expect(page.confirm).toHaveBeenLastCalledWith(
      '1 changement non enregistré sur Aer. Quitter l’onglet ? Ils restent en attente tant que la page n’est pas rechargée.',
    );

    // « Annuler » de la fiche relit la fiche, pas les builds.
    page.sub('fiche');
    page.pick(page.cell('rank'), 'S');
    page.el('c-reset').click();
    await page.settle();
    await page.settle();
    expect(page.count()).toBe('aucune modification');
    expect(page.subs()[5][3]).toBe('dot edit');
    expect(unload()).toBe(true);

    // Un rang et un build : comptés ensemble avant de changer de perso.
    page.pick(page.cell('rank'), 'S');
    page.el('c-pick').click();
    page.confirm.mockReturnValueOnce(false);
    hero(AIS).click();
    expect(page.confirm).toHaveBeenLastCalledWith(
      'Abandonner 2 changements non enregistrés sur Aer ?',
    );
    expect(page.all('#c-who strong')[0].textContent).toBe('Aer');

    hero(AIS).click();
    for (let i = 0; i < 6; i++) await page.settle();
    expect(page.all('#c-who strong')[0].textContent).toBe('Ais Wallenstein');
    // Les builds d'Aer sont oubliés ; ceux d'Ais ne sont lus qu'en venant sur Gear reco.
    expect(unload()).toBe(false);
    expect(page.subs()[5][3]).toBe('');
    expect(page.gearStates()).toHaveLength(1);
    await page.gear();
    expect(page.gearStates()).toEqual([
      `/api/gear-reco/state?id=${AER}`,
      `/api/gear-reco/state?id=${AIS}`,
    ]);
    expect(page.builds()).toEqual([]);
    expect(page.all('#g-list .empty')[0].textContent).toBe(
      'Aucun build pour ce perso : « ＋ build » en ajoute un.',
    );

    // Retour à Aer, sur Gear reco : ses builds relus du disque, la saisie abandonnée.
    page.el('c-pick').click();
    hero(AER).click();
    for (let i = 0; i < 6; i++) await page.settle();
    expect(page.gearStates()).toHaveLength(3);
    expect(page.builds()).toEqual([
      ['Speed', 'true', ''],
      ['High Crit', 'false', ''],
    ]);
  });
});

describe('Monstres — la page, sur le vrai markup', () => {
  afterEach(() => vi.unstubAllGlobals());

  const BOSS = '4318062';
  const TWIN = '4318061';
  const ADD = '4044007';
  const MOB = '4004100';
  interface Guide {
    category: string;
    slug: string;
    title: string;
  }
  const JC: Guide = {
    category: 'joint-challenge',
    slug: 'annihilator',
    title: 'Annihilator Guide',
  };
  const S3: Guide = { category: 'adventure', slug: 'S3-1-10', title: 'S3 Hard : Annihilator' };
  const FROST: Guide = { category: 'guild-raid', slug: 'frost-legion', title: 'Frost Legion' };
  /** Le roster du serveur : trois monstres des guides, puis un du site, sans guide. */
  const ROSTER = [
    {
      id: BOSS,
      name: 'Annihilator',
      type: 'area_boss',
      icon: '/images/ui/boss/MT_4014002.webp',
      place: 'Joint Challenge · Defeat the Annihilator Very Hard',
      guides: [JC, S3],
    },
    {
      id: TWIN,
      name: 'Annihilator',
      type: 'boss',
      icon: 'https://cdn.test/annihilator.webp',
      place: 'Joint Challenge · Defeat the Annihilator Hard',
      guides: [JC],
    },
    {
      id: ADD,
      name: 'Giant God Soldier',
      type: 'named',
      icon: '/images/a.webp',
      place: '',
      guides: [FROST],
    },
    {
      id: MOB,
      name: 'Goblin Scout',
      type: 'monster',
      icon: '/images/ui/boss/MT_4004100.webp',
      place: 'Skyward Tower · 5F',
      guides: [],
    },
  ];
  /** Le kit du boss : deux cartes à chips, et le skill technique de fin d'enrage, sans nom. */
  const CARDS = [
    {
      id: '113651',
      name: 'Target Acquired',
      type: 'first',
      desc: 'Attacks an enemy, gains a <color=#28d9ed>Barrier</color>.\\nTwice.\\n',
      iconSrc: '/images/characters/skills/Skill_First_4014002.webp',
    },
    {
      id: '113652',
      name: 'Neutralize All Fronts',
      type: 'second',
      iconSrc: 'https://cdn.test/second.webp',
    },
    { id: '113656', name: '', type: 'rage_finish1' },
  ];
  const chipRow = (buff: string, carrier: string, name: string, more: object = {}) => ({
    buff,
    carrier,
    name,
    isDebuff: false,
    defaultCards: [carrier],
    owner: null,
    hiddenOn: [],
    ...more,
  });
  const CHIPS = [
    chipRow('buff_502', '113651', 'Barrier', { icon: 'IG_Buff_Barrier' }),
    chipRow('buff_503', '113652', 'Stunned', { icon: 'IG_Buff_Stun', isDebuff: true }),
    // Portée par le skill technique, montrée par les règles sur la carte du second.
    chipRow('buff_437', '113656', 'Cooldown Reduction', { defaultCards: ['113652'] }),
  ];
  const CATALOG = {
    '1': { id: '1', name: 'Burned', icon: 'IG_Buff_Dot_Burn', isDebuff: true },
    '7': { id: '7', name: 'Increased Attack', icon: 'IG_Buff_Atk', isDebuff: false },
    '8': { id: '8', name: 'Immunity', icon: 'IG_Buff_Immune', isDebuff: false },
    '9': { id: '9', name: 'Immunity', icon: 'IG_Buff_Immune', isDebuff: false, irremovable: true },
  };
  interface KitDisk {
    chipOwner: Record<string, string>;
    chipHide: Record<string, string[]>;
    chipAdd: Record<string, string[]>;
  }
  interface Sent {
    id: string;
    changes: {
      chipOwner: Record<string, string | null>;
      chipHide: Record<string, string[]>;
      chipAdd: Record<string, string[]>;
    };
    was: KitDisk;
  }
  type Call = { path: string; body?: unknown };
  type Saved = { ok: boolean; log: string[]; [more: string]: unknown };

  /** Ce que le serveur ferait d'un envoi accepté : le curé du disque, mis à jour. */
  const written = (body: unknown, disk: KitDisk): Saved => {
    const { changes } = body as Sent;
    for (const [buff, target] of Object.entries(changes.chipOwner)) {
      if (target) disk.chipOwner[buff] = target;
      else delete disk.chipOwner[buff];
    }
    for (const section of ['chipHide', 'chipAdd'] as const)
      for (const [card, list] of Object.entries(changes[section])) {
        if (list.length) disk[section][card] = list;
        else delete disk[section][card];
      }
    return { ok: true, log: ['fait'], written: true, stale: false, refused: [] };
  };

  /**
   * La page de quick dans un document happy-dom, comme pour la « Fiche perso » :
   * la VRAIE coquille assemblée, le vrai `lib.js`, le vrai `tabs/monsters.js`, le
   * vrai `gear-view.mjs` et le vrai `hero-picker.mjs`. `fetch` est factice : il
   * sert le roster et l'état d'un monstre d'après `disk` (relu à chaque appel) —
   * seul le boss a un kit —, répond à un enregistrement (`saved` ; d'office, il
   * écrit), et note ce que la page demande.
   */
  async function monsters(
    opts: {
      hash?: string;
      disk?: Partial<KitDisk>;
      saved?: (body: unknown, disk: KitDisk) => Saved;
      siteError?: string;
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

    const disk: KitDisk = { chipOwner: {}, chipHide: {}, chipAdd: {}, ...opts.disk };
    const calls: Call[] = [];
    const confirm = vi.fn(() => true);
    const answer = (data: unknown, status = 200) => {
      const bytes = new TextEncoder().encode(JSON.stringify(data));
      let read = false;
      return {
        ok: status === 200,
        status,
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
      const url = new URL(path, 'http://localhost:4747');
      if (url.pathname.startsWith('/api/monsters')) calls.push(body ? { path, body } : { path });
      if (url.pathname === '/api/monsters/roster')
        return answer({
          roster: ROSTER,
          counts: { guides: 3, site: 4 },
          ...(opts.siteError ? { siteError: opts.siteError } : {}),
        });
      if (url.pathname === '/api/monsters/state') {
        const id = url.searchParams.get('id') ?? '';
        const row = ROSTER.find((m) => m.id === id);
        if (!row) return answer({ error: `monstre inconnu : ${id}` }, 404);
        const mine = id === BOSS;
        return answer({
          monster: row,
          kit: { cards: mine ? CARDS : [], chips: mine ? CHIPS : [] },
          // Une copie : la page garde l'état qu'elle a lu, le disque bouge sans elle.
          disk: JSON.parse(
            JSON.stringify(mine ? disk : { chipOwner: {}, chipHide: {}, chipAdd: {} }),
          ),
          catalog: CATALOG,
          sprite: 'images/ui/effect',
          shared: mine ? { '113651': { count: 3, names: ['Annihilator', 'Prototype'] } } : {},
          guideBase: 'https://outerpedia.local/en/guides',
        });
      }
      if (url.pathname === '/api/monsters')
        return answer(opts.saved?.(body, disk) ?? written(body, disk));
      return answer({ imgBase: 'https://img.test', host: 'banc', port: 4747 });
    });

    vi.stubGlobal('window', window);
    vi.stubGlobal('document', document);
    vi.stubGlobal('location', window.location);
    vi.stubGlobal('history', window.history);
    vi.stubGlobal('fetch', fetch);
    vi.stubGlobal('confirm', confirm);
    // `quick:saved` : happy-dom ne distribue que SES événements, pas l'`Event` de Node.
    vi.stubGlobal('Event', window.Event);

    const lib = (await import(/* @vite-ignore */ resolve(UI, 'lib.js'))) as {
      sections: { start: () => void };
    };
    await import(/* @vite-ignore */ resolve(UI, 'tabs', 'monsters.js'));
    lib.sections.start();
    const settle = async () => {
      for (let i = 0; i < 4; i++) await new Promise((done) => setTimeout(done, 0));
    };
    await settle();

    const el = (id: string) => document.getElementById(id) as unknown as HTMLInputElement;
    const all = (selector: string) =>
      [...document.querySelectorAll(selector)] as unknown as HTMLElement[];
    const fire = (target: HTMLElement, type: string) =>
      target.dispatchEvent(new window.Event(type, { bubbles: true }) as unknown as Event);
    const card = (id: string) => all('#m-panel [data-kit]').find((c) => c.dataset.kit === id)!;
    const chip = (id: string, ref: string) =>
      [...card(id).querySelectorAll('.m-chip')].find(
        (c) => (c as HTMLElement).dataset.ref === ref,
      ) as HTMLElement;
    /** La valeur qu'un menu porte à son DESSIN (cf. `val` de la « Fiche perso »). */
    const val = (select: Element | null): string =>
      select?.querySelector('option[selected]')?.getAttribute('value') ?? '';
    return {
      el,
      all,
      calls,
      confirm,
      disk,
      settle,
      window,
      card,
      chip,
      /** Ouvre l'onglet, comme un clic sur son entrée du menu. */
      come: async () => {
        all('#tabs [data-tab="monsters"]')[0].click();
        await settle();
      },
      /** Les lignes du picker : nom, où, badges. */
      rows: () =>
        all('#hp-results .hp-tile').map((t) => [
          t.querySelector('.m-pname')?.textContent,
          t.querySelector('.m-pwhere')?.textContent,
          [...t.querySelectorAll('.badge')].map((b) => b.textContent).join(' · '),
        ]),
      tile: (id: string) => all('#hp-results .hp-tile').find((t) => t.dataset.id === id)!,
      search: (q: string) => {
        el('hp-q').value = q;
        fire(el('hp-q'), 'input');
      },
      choose: async (id: string) => {
        all('#hp-results .hp-tile')
          .find((t) => t.dataset.id === id)!
          .click();
        await settle();
      },
      /** Les chips d'une carte : nom, classes d'état, badge, la carte de son menu, son bouton. */
      chips: (id: string) =>
        [...card(id).querySelectorAll('.m-chip')].map((c) => [
          c.querySelector('.m-chn')?.textContent,
          c.className.replace(/^chip m-chip ?/, ''),
          c.querySelector('.badge')?.textContent ?? '',
          c.querySelector('select') ? val(c.querySelector('select')) || '—' : '',
          c.querySelector('button')?.textContent,
        ]),
      /** Pose une chip sur une carte par son menu, comme le ferait la souris. */
      move: (id: string, ref: string, to: string) => {
        const menu = chip(id, ref).querySelector('select') as unknown as HTMLSelectElement;
        menu.value = to;
        fire(menu as unknown as HTMLElement, 'change');
      },
      badges: (id: string) =>
        [...card(id).querySelectorAll('.card-head .badge')]
          .map((b) => b.textContent)
          .filter(Boolean),
      count: () => el('m-count').textContent,
      save: async () => {
        el('m-save').click();
        await settle();
        await settle();
      },
      posted: () => calls.filter((c) => c.path === '/api/monsters').map((c) => c.body as Sent),
      states: () => calls.filter((c) => c.path.startsWith('/api/monsters/state')).length,
    };
  }

  const HASH = `#monsters/${BOSS}`;

  it('servie dans Éditeurs, après Effets, en pleine largeur — et rien n’est demandé avant d’y venir', async () => {
    const page = await monsters();
    expect(page.calls).toEqual([]);
    expect(
      page.all('#tabs [data-group="editors"]').map((b) => [b.dataset.tab, b.textContent]),
    ).toEqual([
      ['character', 'Fiche perso'],
      ['effects', 'Effets'],
      ['monsters', 'Monstres'],
    ]);
    await page.come();
    expect(page.el('tab-monsters').hidden).toBe(false);
    expect(page.all('main')[0].classList.contains('wide')).toBe(true);
    expect(page.all('#tab-monsters h2')[0].textContent).toBe('Monstres');
    // Le roster est lu à la première venue, une fois : y revenir ne le redemande pas.
    expect(page.calls).toEqual([{ path: '/api/monsters/roster' }]);
    page.all('#tabs [data-tab="effects"]')[0].click();
    await page.come();
    expect(page.calls).toEqual([{ path: '/api/monsters/roster' }]);
  });

  it('sans monstre : « Aucun monstre choisi. », et le picker OUVERT d’office sur les monstres des GUIDES', async () => {
    const page = await monsters({ hash: '#monsters' });
    expect(page.el('m-who').textContent).toBe('Aucun monstre choisi.');
    expect(page.el('m-pick-label').textContent).toBe('Choisir un monstre');
    expect(page.el('m-pick').disabled).toBe(false);
    expect(page.el('m-bar').hidden).toBe(true);
    expect(page.el('m-panel').innerHTML).toBe('');

    expect(page.el('hp-modal').hidden).toBe(false);
    expect(page.el('hp-title').textContent).toBe('Choisir un monstre');
    expect(page.el('hp-tally').textContent).toBe('3 des guides · 4 avec le site');
    expect(page.el('hp-q').placeholder).toBe('Chercher un monstre (nom ou id)…');
    expect(page.el('hp-results').className).toBe('hp-tiles rows');
    // Une ligne : le nom, où on l'affronte (son id sinon), son type, « N guides ».
    expect(page.rows()).toEqual([
      ['Annihilator', 'Joint Challenge · Defeat the Annihilator Very Hard', 'area boss · 2 guides'],
      ['Annihilator', 'Joint Challenge · Defeat the Annihilator Hard', 'boss · 1 guide'],
      ['Giant God Soldier', ADD, 'named · 1 guide'],
    ]);
    // L'icône du serveur : relative, sous la base des images ; absolue, telle quelle.
    expect(page.tile(BOSS).querySelector('.m-pico')?.getAttribute('src')).toBe(
      'https://img.test/images/ui/boss/MT_4014002.webp',
    );
    expect(page.tile(TWIN).querySelector('.m-pico')?.getAttribute('src')).toBe(
      'https://cdn.test/annihilator.webp',
    );
    // Le `title` : le nom, l'id, et les titres de ses guides.
    expect(page.tile(BOSS).title).toBe(
      `Annihilator — ${BOSS}\nAnnihilator Guide\nS3 Hard : Annihilator`,
    );
  });

  it('le picker : « Site » élargit, les pastilles de type filtrent, la recherche prend le début d’un mot du nom ou de l’id', async () => {
    const page = await monsters({ hash: '#monsters' });
    const ids = () => page.all('#hp-results .hp-tile').map((t) => t.dataset.id);
    const seg = () => page.all('#hp-filters .hp-seg button');
    expect(seg().map((b) => [b.textContent, b.getAttribute('aria-pressed')])).toEqual([
      ['Guides', 'true'],
      ['Site', 'false'],
    ]);
    seg()[1].click();
    expect(ids()).toEqual([BOSS, TWIN, ADD, MOB]);
    expect(page.rows()[3]).toEqual(['Goblin Scout', 'Skyward Tower · 5F', 'monster']);

    // Les types que le roster porte, les boss d'abord ; aucune enfoncée = tous.
    const pills = () => page.all('#hp-filters [aria-label="Type"] .hp-tog');
    expect(pills().map((b) => b.textContent)).toEqual(['boss', 'area boss', 'named', 'monster']);
    pills()[0].click();
    expect(ids()).toEqual([TWIN]);
    pills()[3].click();
    expect(ids()).toEqual([TWIN, MOB]);
    pills()[0].click();
    pills()[3].click();

    // Par le DÉBUT d'un mot, dans n'importe quel ordre — jamais par le milieu.
    page.search('sold gi');
    expect(ids()).toEqual([ADD]);
    page.search('nihil');
    expect(ids()).toEqual([]);
    expect(page.el('hp-none').textContent).toBe('Aucun monstre ne correspond.');
    page.search('  ANNI ');
    expect(ids()).toEqual([BOSS, TWIN]);
    // Par le début de l'id ; « Guides » referme le périmètre sur la même saisie.
    page.search('4004');
    expect(ids()).toEqual([MOB]);
    seg()[0].click();
    expect(ids()).toEqual([]);
  });

  it('sans tables du jeu : le picker dit que la liste du site manque, les monstres des guides sont là', async () => {
    const page = await monsters({ hash: '#monsters', siteError: 'pas de tables' });
    expect(page.el('hp-tally').textContent).toBe('3 des guides · site illisible');
    expect(page.rows()).toHaveLength(3);
  });

  it('un monstre choisi : son en-tête, ses guides en liens, et l’adresse qui le dit', async () => {
    const page = await monsters({ hash: '#monsters' });
    await page.choose(BOSS);
    expect(page.el('hp-modal').hidden).toBe(true);
    expect(page.window.location.hash).toBe(HASH);
    expect(page.calls.map((c) => c.path)).toEqual([
      '/api/monsters/roster',
      `/api/monsters/state?id=${BOSS}`,
    ]);

    const who = page.el('m-who');
    expect(who.querySelector('strong')?.textContent).toBe('Annihilator');
    expect(who.querySelector('.m-face')?.getAttribute('src')).toBe(
      'https://img.test/images/ui/boss/MT_4014002.webp',
    );
    expect(who.querySelector('.m-traits')?.textContent).toBe(
      `area boss${BOSS}Joint Challenge · Defeat the Annihilator Very Hard`,
    );
    expect(
      [...who.querySelectorAll('.m-link')].map((a) => [a.textContent, a.getAttribute('href')]),
    ).toEqual([
      ['Annihilator Guide', 'https://outerpedia.local/en/guides/joint-challenge/annihilator'],
      ['S3 Hard : Annihilator', 'https://outerpedia.local/en/guides/adventure/S3-1-10'],
    ]);
    // Ce que l'onglet ne porte pas, et où le trouver.
    expect(who.textContent).toContain('Stats, intégration et versions : extractor (étapes 19-20).');
    expect(page.el('m-pick-label').textContent).toBe('Changer de monstre');
    expect(page.el('m-bar').hidden).toBe(false);
    expect(page.count()).toBe('aucune modification');
    expect(page.el('m-save').disabled).toBe(true);
  });

  it('un monstre du site, sans guide : le badge « aucun guide », et un kit vide le dit', async () => {
    const page = await monsters({ hash: `#monsters/${MOB}` });
    expect(page.el('m-who').querySelector('.m-guides')?.textContent).toBe('aucun guide');
    expect(page.el('m-who').querySelector('.m-link')).toBeNull();
    expect(page.el('m-panel').textContent).toBe('Aucune carte de skill.');
  });

  it('`#monsters/<id>` : le kit s’ouvre sans picker — une carte par skill, ses chips, son menu, « ＋ effet »', async () => {
    const page = await monsters({ hash: HASH });
    expect(page.el('tab-monsters').hidden).toBe(false);
    expect(page.el('hp-modal')).toBeNull();
    expect(page.states()).toBe(1);

    const cards = page.all('#m-panel [data-kit]');
    expect(cards.map((c) => c.querySelector('.card-head strong')?.textContent)).toEqual([
      'Target Acquired',
      'Neutralize All Fronts',
      '(sans nom)',
    ]);
    expect(cards.map((c) => c.querySelector('.m-skid')?.textContent)).toEqual([
      '113651 · first',
      '113652 · second',
      '113656 · rage_finish1',
    ]);
    // Une icône relative passe sous la base des images ; absolue, elle reste ; le dernier n'en a pas.
    expect(cards.map((c) => c.querySelector('.m-skico')?.getAttribute('src'))).toEqual([
      'https://img.test/images/characters/skills/Skill_First_4014002.webp',
      'https://cdn.test/second.webp',
      undefined,
    ]);
    // La description, telle que le jeu l'écrit : sa couleur, ses `\n` littéraux, sans ceux de la fin.
    expect(cards[0].querySelector('.m-desc')?.innerHTML).toBe(
      'Attacks an enemy, gains a <span style="color:#28d9ed">Barrier</span>.<br>Twice.',
    );
    expect(cards[1].querySelector('.m-desc')).toBeNull();

    // Chaque chip à sa place par défaut : son menu invite, ✕ la masque.
    expect(page.chips('113651')).toEqual([['Barrier', '', '', '—', '✕']]);
    // La chip du skill technique est sur la carte où les règles la montrent.
    expect(page.chips('113652')).toEqual([
      ['Stunned', '', '', '—', '✕'],
      ['Cooldown Reduction', '', '', '—', '✕'],
    ]);
    expect(page.chips('113656')).toEqual([]);
    const menu = page.chip('113651', 'buff_502').querySelector('select')!;
    expect([...menu.querySelectorAll('option')].map((o) => o.textContent)).toEqual([
      'sur la carte…',
      'Target Acquired · first',
      'Neutralize All Fronts · second',
      '(sans nom) · rage_finish1',
    ]);
    expect(menu.getAttribute('aria-label')).toBe('Carte de Barrier');
    expect(page.chip('113651', 'buff_502').title).toBe('buff_502 — porté par 113651');
    // La tuile du site : l'icône en masque teinté de sa nature ; sans icône, un cadre vide.
    expect(page.chip('113652', 'buff_503').querySelector('.m-fx')?.className).toBe('m-fx debuff');
    expect(page.chip('113652', 'buff_503').querySelector('.m-fx')?.getAttribute('style')).toContain(
      "url('https://img.test/images/ui/effect/IG_Buff_Stun.webp')",
    );
    expect(page.chip('113652', 'buff_437').querySelector('.m-fx')?.className).toBe('m-fx none');
    expect(cards.map((c) => c.querySelector('[data-act="add-chip"]')?.textContent)).toEqual(
      Array(3).fill('＋ effet'),
    );
  });

  it('le badge « partagé par N monstres » sur un skill commun, ses noms au survol', async () => {
    const page = await monsters({ hash: HASH });
    expect(page.badges('113651')).toEqual(['partagé par 3 monstres']);
    expect(page.card('113651').querySelector('.card-head .badge.off')?.getAttribute('title')).toBe(
      'Masquer ou ajouter une chip ici vaut pour tous : Annihilator, Prototype…',
    );
    expect(page.badges('113652')).toEqual([]);
  });

  it('✕ masque une chip : pointillés, « rétablir », son menu retiré — comptée ; rétablie, elle ne compte plus', async () => {
    const page = await monsters({ hash: HASH });
    page.chip('113652', 'buff_503').querySelector('button')!.click();
    expect(page.chips('113652')).toEqual([
      ['Stunned', 'off dirty', '', '', 'rétablir'],
      ['Cooldown Reduction', '', '', '—', '✕'],
    ]);
    expect(page.badges('113652')).toEqual(['modifié']);
    expect(page.badges('113651')).toEqual(['partagé par 3 monstres']);
    expect(page.count()).toBe('1 changement');
    expect(page.el('m-save').disabled).toBe(false);
    // Le focus reste sur la chip : son bouton, devenu « rétablir ».
    const back = page.chip('113652', 'buff_503').querySelector('button')!;
    expect(page.window.document.activeElement).toBe(back as unknown as Element);
    expect(back.getAttribute('aria-label')).toBe('Rétablir Stunned');

    back.click();
    expect(page.chips('113652')[0]).toEqual(['Stunned', '', '', '—', '✕']);
    expect(page.count()).toBe('aucune modification');
    expect(page.el('m-save').disabled).toBe(true);
  });

  it('« ＋ effet » : le picker d’effets sur le catalogue — l’effet choisi s’ajoute, ✕ le retire', async () => {
    const page = await monsters({ hash: HASH });
    (page.card('113651').querySelector('[data-act="add-chip"]') as HTMLElement).click();
    expect(page.el('hp-modal').hidden).toBe(false);
    expect(page.el('hp-title').textContent).toBe('Ajouter un effet — Target Acquired');
    expect(page.el('hp-tally').textContent).toBe('4 effets');
    // Les homonymes sont départagés ; pas de pastilles de type ici.
    expect(page.all('#hp-results .hp-tile').map((t) => t.textContent)).toEqual([
      'Burned',
      'Immunity (buff)',
      'Immunity (irremovable, buff)',
      'Increased Attack',
    ]);
    expect(page.all('#hp-filters .hp-tog')).toEqual([]);
    expect(page.all('#hp-results .m-fx')).toHaveLength(4);

    page.tile('7').click();
    expect(page.el('hp-modal').hidden).toBe(true);
    expect(page.chips('113651')).toEqual([
      ['Barrier', '', '', '—', '✕'],
      ['Increased Attack', 'dirty', 'ajoutée', '', '✕'],
    ]);
    expect(page.count()).toBe('1 changement');
    // Un effet déjà ajouté n'est plus proposé.
    (page.card('113651').querySelector('[data-act="add-chip"]') as HTMLElement).click();
    expect(page.all('#hp-results .hp-tile').map((t) => t.dataset.id)).not.toContain('7');
    page.el('hp-close').click();

    page.chip('113651', '7').querySelector('button')!.click();
    expect(page.chips('113651')).toEqual([['Barrier', '', '', '—', '✕']]);
    expect(page.count()).toBe('aucune modification');
  });

  it('le menu d’une chip la DÉPLACE : elle quitte sa carte pour la cible, « déplacée » ; « par défaut » la rend', async () => {
    const page = await monsters({ hash: HASH });
    page.move('113651', 'buff_502', '113652');

    expect(page.chips('113651')).toEqual([]);
    expect(page.chips('113652')).toEqual([
      ['Barrier', 'dirty', 'déplacée', '113652', '✕'],
      ['Stunned', '', '', '—', '✕'],
      ['Cooldown Reduction', '', '', '—', '✕'],
    ]);
    // Les deux cartes portent le changement, la troisième non ; UN changement.
    expect(page.badges('113651')).toEqual(['partagé par 3 monstres', 'modifié']);
    expect(page.badges('113652')).toEqual(['modifié']);
    expect(page.badges('113656')).toEqual([]);
    expect(page.count()).toBe('1 changement');
    // Déplacée, son menu propose « par défaut » en tête, et le focus l'a suivie.
    const menu = page.chip('113652', 'buff_502').querySelector('select')!;
    expect(menu.querySelector('option')?.textContent).toBe('par défaut');
    expect(menu.className).toBe('m-move dirty');
    expect(page.window.document.activeElement).toBe(menu as unknown as Element);

    page.move('113652', 'buff_502', '');
    expect(page.chips('113651')).toEqual([['Barrier', '', '', '—', '✕']]);
    expect(page.chips('113652')).toHaveLength(2);
    expect(page.count()).toBe('aucune modification');
    expect(page.badges('113652')).toEqual([]);
  });

  it('ce que le disque cure déjà : une chip posée ailleurs, une masquée, un masquage resté d’une autre carte, des ajouts', async () => {
    const page = await monsters({
      hash: HASH,
      disk: {
        chipOwner: { buff_437: '113656' },
        chipHide: { '113652': ['buff_503', 'buff_502', 'ref-heritee'] },
        chipAdd: { '113651': ['1', '404'] },
      },
    });
    // Rien n'est « modifié » : c'est l'état du disque.
    expect(page.count()).toBe('aucune modification');
    expect(page.all('#m-panel .m-chip.dirty')).toEqual([]);
    // Un effet ajouté par le disque : son badge ; hors du catalogue, sa ref pour nom.
    expect(page.chips('113651')).toEqual([
      ['Barrier', '', '', '—', '✕'],
      ['Burned', '', 'ajoutée', '', '✕'],
      ['404', '', 'ajoutée', '', '✕'],
    ]);
    // Masquée sur sa carte ; et « Barrier », masquée ici alors qu'elle est montrée ailleurs.
    expect(page.chips('113652')).toEqual([
      ['Stunned', 'off', '', '', 'rétablir'],
      ['Barrier', 'off', '', '', 'rétablir'],
    ]);
    expect(page.chip('113652', 'buff_502').dataset.kind).toBe('stray');
    // Posée par le curé sur le skill technique : « déplacée », sans être modifiée.
    expect(page.chips('113656')).toEqual([['Cooldown Reduction', '', 'déplacée', '113656', '✕']]);

    // La remettre par défaut compte ; la poser sur une carte qui la masquait l'y rétablit.
    page.move('113656', 'buff_437', '');
    expect(page.chips('113652')[1]).toEqual(['Cooldown Reduction', 'dirty', '', '—', '✕']);
    expect(page.count()).toBe('1 changement');
    page.move('113651', 'buff_502', '113652');
    expect(page.chips('113652').find((c) => c[0] === 'Barrier')).toEqual([
      'Barrier',
      'dirty',
      'déplacée',
      '113652',
      '✕',
    ]);
    // Deux déplacements, et le masquage levé sur la carte cible.
    expect(page.count()).toBe('3 changements');
  });

  it('« Enregistrer » : UN envoi — les chips déplacées, les deux listes ENTIÈRES des cartes modifiées, l’état chargé ; le disque relu n’a plus rien en attente', async () => {
    const page = await monsters({
      hash: HASH,
      disk: { chipHide: { '113652': ['ref-heritee'] } },
    });
    page.move('113651', 'buff_502', '113656');
    page.chip('113652', 'buff_503').querySelector('button')!.click();
    (page.card('113651').querySelector('[data-act="add-chip"]') as HTMLElement).click();
    page.tile('1').click();
    expect(page.count()).toBe('3 changements');

    await page.save();
    expect(page.posted()).toEqual([
      {
        id: BOSS,
        changes: {
          chipOwner: { buff_502: '113656' },
          // La ref héritée du fichier, que la carte ne montre pas, y reste.
          chipHide: { '113651': [], '113652': ['ref-heritee', 'buff_503'] },
          chipAdd: { '113651': ['1'], '113652': [] },
        },
        was: { chipOwner: {}, chipHide: { '113652': ['ref-heritee'] }, chipAdd: {} },
      },
    ]);
    // Le disque fait foi : relu, il porte la saisie — plus rien n'est « modifié ».
    expect(page.states()).toBe(2);
    expect(page.disk).toEqual({
      chipOwner: { buff_502: '113656' },
      chipHide: { '113652': ['ref-heritee', 'buff_503'] },
      chipAdd: { '113651': ['1'] },
    });
    expect(page.count()).toBe('aucune modification');
    expect(page.all('#m-panel .m-chip.dirty')).toEqual([]);
    expect(page.chips('113656')).toEqual([['Barrier', '', 'déplacée', '113656', '✕']]);
    expect(page.chips('113652')[0]).toEqual(['Stunned', 'off', '', '', 'rétablir']);
    expect(page.el('m-save').disabled).toBe(true);
  });

  it('un refus situé : la carte cerclée, son message dessous, sa saisie gardée — y retoucher le lève', async () => {
    const page = await monsters({
      hash: HASH,
      saved: () => ({
        ok: false,
        log: ['REFUSÉ'],
        written: false,
        stale: false,
        refused: [
          { card: '113652', reason: '« buff_503 » : pas une chip de cette carte' },
          { card: '113652', reason: 'autre chose' },
        ],
      }),
    });
    page.chip('113652', 'buff_503').querySelector('button')!.click();
    await page.save();

    const card = page.card('113652');
    expect(card.className).toBe('card m-card ko');
    expect(page.badges('113652')).toEqual(['modifié', 'refusé']);
    expect(card.querySelector('.m-err')?.textContent).toBe(
      '« buff_503 » : pas une chip de cette carte ; autre chose',
    );
    // La saisie est restée : la chip est toujours masquée, et comptée.
    expect(page.chips('113652')[0]).toEqual(['Stunned', 'off dirty', '', '', 'rétablir']);
    expect(page.count()).toBe('1 changement1 refus');
    expect(page.card('113651').className).toBe('card m-card');

    page.chip('113652', 'buff_503').querySelector('button')!.click();
    expect(page.card('113652').className).toBe('card m-card');
    expect(page.card('113652').querySelector('.m-err')?.textContent).toBe('');
    expect(page.count()).toBe('aucune modification');
  });

  it('`stale` : le disque avait changé — la page le montre, la saisie est abandonnée, le refus dit dessous', async () => {
    const page = await monsters({
      hash: HASH,
      saved: (_, disk) => {
        // Un autre a écrit entre-temps : le disque que la page va relire.
        disk.chipAdd['113651'] = ['7'];
        return {
          ok: false,
          log: ['REFUSÉ'],
          written: false,
          stale: true,
          refused: [{ reason: 'le disque a changé depuis le chargement' }],
        };
      },
    });
    page.chip('113652', 'buff_503').querySelector('button')!.click();
    await page.save();

    expect(page.chips('113652')[0]).toEqual(['Stunned', '', '', '—', '✕']);
    expect(page.chips('113651')[1]).toEqual(['Increased Attack', '', 'ajoutée', '', '✕']);
    expect(page.count()).toBe('1 refus');
    expect(page.all('#m-panel [data-err="kit"]')[0].textContent).toBe(
      'le disque a changé depuis le chargement',
    );
    expect(page.el('m-save').disabled).toBe(true);
  });

  it('« Annuler » rend le disque ; quitter l’onglet ou changer de monstre avec des changements demande', async () => {
    const page = await monsters({ hash: HASH });
    page.move('113651', 'buff_502', '113652');
    page.chip('113652', 'buff_503').querySelector('button')!.click();
    expect(page.count()).toBe('2 changements');

    // Quitter l'onglet : refusé, on y reste, la saisie avec.
    page.confirm.mockReturnValueOnce(false);
    page.all('#tabs [data-tab="effects"]')[0].click();
    expect(page.confirm).toHaveBeenCalledWith(
      '2 changements non enregistrés sur Annihilator. Quitter l’onglet ? Ils restent en attente tant que la page n’est pas rechargée.',
    );
    expect(page.el('tab-monsters').hidden).toBe(false);

    // Changer de monstre : refusé, le picker reste ouvert.
    page.el('m-pick').click();
    page.confirm.mockReturnValueOnce(false);
    await page.choose(TWIN);
    expect(page.confirm).toHaveBeenLastCalledWith(
      'Abandonner 2 changements non enregistrés sur Annihilator ?',
    );
    expect(page.el('hp-modal').hidden).toBe(false);
    expect(page.count()).toBe('2 changements');
    // Le monstre en cours porte l'anneau du choix, et le rechoisir ne demande rien.
    expect(page.tile(BOSS).getAttribute('aria-current')).toBe('true');
    page.el('hp-close').click();

    page.el('m-reset').click();
    await page.settle();
    expect(page.count()).toBe('aucune modification');
    expect(page.chips('113651')).toEqual([['Barrier', '', '', '—', '✕']]);
    // Plus rien en attente : on quitte sans question, et y revenir relit le kit.
    const asked = page.confirm.mock.calls.length;
    page.all('#tabs [data-tab="effects"]')[0].click();
    expect(page.el('tab-monsters').hidden).toBe(true);
    const read = page.states();
    await page.come();
    expect(page.confirm.mock.calls.length).toBe(asked);
    expect(page.states()).toBe(read + 1);
    expect(page.window.location.hash).toBe(HASH);
  });

  it('un monstre inconnu dans l’adresse : le journal le dit, et le picker s’ouvre', async () => {
    const page = await monsters({ hash: '#monsters/nope' });
    expect(page.el('journal').dataset.state).toBe('ko');
    expect(page.el('log').textContent).toContain('monstre inconnu : nope');
    expect(page.el('m-who').textContent).toBe('Aucun monstre choisi.');
    expect(page.el('hp-modal').hidden).toBe(false);
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
      ['changelog', 'Journal du site'],
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

describe('Journal du site — la page, sur le vrai markup', () => {
  // L'horloge est FACTICE d'un bout à l'autre (cf. `journal`) : l'aperçu se
  // relance 400 ms après une frappe, et un minuteur laissé en vol par un test
  // irait frapper le `fetch` du suivant.
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  const TODAY = '2026-10-08';
  type Link = { kind: 'character'; slug: string } | { kind: string; href: string };
  interface Entry {
    date: string;
    type: string;
    title: Record<string, string>;
    content: Record<string, string[]>;
    link?: Link;
    image?: string;
    draft?: true;
  }
  interface Field {
    key: string;
    label: string;
    kind: string;
    value: string;
    placeholder: string;
    options: { value: string; label: string }[];
  }
  interface State {
    entries: Entry[];
    today: string;
    roster: { id: string; name: string; slug: string }[];
    templates: { id: string; label: string; type: string; fields: Field[] }[];
    types: { value: string; label: string }[];
    linkKinds: { value: string; label: string }[];
    langs: { default: string; file: string[]; shown: string[] };
  }

  const LAMBDA: Entry = {
    date: '2026-10-06',
    type: 'character',
    title: { en: 'Demiurge Lambda', fr: 'Démiurge Lambda' },
    content: { en: ['Lambda added.'], fr: ['Lambda ajouté.'] },
    link: { kind: 'character', slug: 'demiurge-lambda' },
  };
  const TOWER: Entry = {
    date: '2026-10-06',
    type: 'guide',
    title: { en: 'Universal Tower' },
    content: { en: ['Added the **Universal Tower** guide.', 'Second bullet.'] },
    link: { kind: 'guide', href: '/guides/skyward-tower/universal-tower' },
  };
  const NEWS: Entry = {
    date: '2026-09-23',
    type: 'news',
    title: { en: 'Outerpedia in French' },
    content: { en: ['News bullet.'] },
  };
  const field = (over: Partial<Field> & { key: string; label: string }): Field => ({
    kind: 'text',
    value: '',
    placeholder: '',
    options: [],
    ...over,
  });
  /** Ce que `/api/changelog/state` sert : trois entrées, récent → ancien, et les gabarits. */
  const disk = (over: Partial<State> = {}): State => ({
    entries: [LAMBDA, TOWER, NEWS],
    today: TODAY,
    roster: [
      { id: '1', name: 'Anna', slug: 'anna' },
      { id: '4', name: 'Dana', slug: 'dana' },
      { id: '5', name: 'Summer Anna', slug: 'summer-anna' },
    ],
    templates: [
      {
        id: 'character',
        label: 'Perso',
        type: 'character',
        fields: [
          field({
            key: 'name',
            label: 'Perso',
            kind: 'character',
            placeholder: 'Chercher un perso…',
          }),
          field({ key: 'scope', label: 'Fiche', kind: 'choice', value: 'skills and stats' }),
        ],
      },
      {
        id: 'update',
        label: 'Mise à jour',
        type: 'update',
        fields: [
          field({ key: 'guide', label: 'Guide', placeholder: 'Annihilator' }),
          field({
            key: 'mode',
            label: 'Mode',
            kind: 'choice',
            value: 'Joint Challenge',
            options: [
              { value: 'Joint Challenge', label: 'Joint Challenge' },
              { value: 'Guild Raid', label: 'Guild Raid' },
            ],
          }),
          field({ key: 'month', label: 'Mois', kind: 'month', value: 'October 2026' }),
          field({ key: 'slug', label: 'Slug du guide', placeholder: 'annihilator' }),
        ],
      },
      { id: 'feature', label: 'Page / outil', type: 'feature', fields: [] },
      { id: 'manual', label: 'Manuel', type: 'guide', fields: [] },
    ],
    types: [
      { value: 'guide', label: 'Guide' },
      { value: 'update', label: 'Mise à jour' },
      { value: 'feature', label: 'Page / outil' },
      { value: 'character', label: 'Perso' },
      { value: 'news', label: 'News' },
      { value: 'fix', label: 'Correctif' },
    ],
    linkKinds: [
      { value: '', label: 'aucun lien' },
      { value: 'character', label: 'perso (slug)' },
      { value: 'guide', label: 'guide (chemin)' },
      { value: 'tool', label: 'outil (chemin)' },
      { value: 'page', label: 'page (chemin)' },
    ],
    langs: {
      default: 'en',
      file: ['en', 'jp', 'kr', 'zh', 'fr', 'es'],
      shown: ['en', 'fr', 'es', 'jp', 'kr', 'zh'],
    },
    ...over,
  });
  /** `n` entrées datées, récent → ancien : « Update 1 » est la plus récente. */
  const many = (n: number): Entry[] =>
    Array.from({ length: n }, (_, i) => ({
      date: `2026-${String(9 - Math.floor(i / 28)).padStart(2, '0')}-${String(28 - (i % 28)).padStart(2, '0')}`,
      type: i % 5 ? 'update' : 'news',
      title: { en: `Update ${i + 1}` },
      content: { en: [`Bullet of ${i + 1}.`] },
    }));

  /** Le gabarit rempli que rendrait `GET /api/changelog/fill`, d'après sa requête. */
  const filled = (q: URLSearchParams) => {
    const template = q.get('template');
    if (template === 'character')
      return {
        type: 'character',
        title: {
          en: 'Summer Anna',
          jp: 'サマー・アンナ',
          kr: '서머 안나',
          zh: '夏日安娜',
          fr: 'Anna estivale',
          es: 'Anna de verano',
        },
        content: ['Summer Anna has been added to the database with full skills and stats.'],
        link: { kind: 'character', value: 'summer-anna' },
        date: TODAY,
      };
    if (template === 'update') {
      const guide = q.get('guide') || '{guide}';
      return {
        type: 'update',
        title: { en: guide },
        content: [`${guide} ${q.get('mode')} Guide updated for ${q.get('month')} version.`],
        link: { kind: 'guide', value: `/guides/joint-challenge/${q.get('slug') || '{slug}'}` },
        date: TODAY,
      };
    }
    const feature = template === 'feature';
    return {
      type: feature ? 'feature' : 'guide',
      title: {},
      content: [],
      link: { kind: feature ? 'page' : '', value: '' },
      date: TODAY,
    };
  };

  /** L'aperçu que rendrait le serveur : la langue, repli anglais, le gras en segments. */
  const viewOf = (entry: Entry, lang: string) => ({
    type: entry.type,
    badge: `${entry.type} (${lang})`,
    icon: '🧭',
    date: entry.date,
    title: entry.title[lang] ?? entry.title.en ?? '',
    bullets: (entry.content[lang] ?? entry.content.en ?? []).map((line) =>
      line
        .split(/(\*\*.+?\*\*)/)
        .filter(Boolean)
        .map((part) =>
          part.startsWith('**') ? { text: part.slice(2, -2), bold: true } : { text: part },
        ),
    ),
    link: entry.link
      ? {
          kind: entry.link.kind,
          label: 'Go there',
          href: 'slug' in entry.link ? `/characters/${entry.link.slug}` : entry.link.href,
        }
      : null,
    image: entry.link?.kind === 'character' ? '/images/characters/faceicon/FI_9.png' : null,
  });

  type Call = { path: string; body: unknown };

  /**
   * La page de quick dans un document happy-dom, comme pour Bannières : la VRAIE
   * coquille assemblée, le vrai `lib.js` et le vrai `tabs/changelog.js` (eux
   * seuls), démarrés par `sections.start()`. `fetch` est factice : il sert
   * l'état, remplit les gabarits, rend l'aperçu et la traduction, répond à
   * l'enregistrement — et note ce que la page demande.
   */
  async function journal(
    opts: {
      state?: Partial<State>;
      hash?: string;
      saved?: (body: Call['body']) => unknown;
      translated?: (texts: string[]) => unknown;
      /** L'état répond autre chose que 200 : un serveur plus vieux que l'onglet (404), le moteur (500). */
      stateDown?: { status: number; body: unknown };
    } = {},
  ) {
    vi.resetModules();
    const window = new Window({ url: `http://localhost:4747/#${opts.hash ?? 'changelog'}` });
    const { document } = window;
    const page = assemblePage(shell(), readTab);
    document.body.innerHTML = (/<body>([\s\S]*)<\/body>/.exec(page)?.[1] ?? '').replace(
      /<script[\s\S]*?<\/script>/g,
      '',
    );

    const served = { state: disk(opts.state), reads: 0 };
    const calls: Call[] = [];
    const fills: string[] = [];
    const previews: { entry: Entry; lang: string }[] = [];
    const confirm = vi.fn(() => true);
    const answer = (data: unknown) => {
      const bytes = new TextEncoder().encode(JSON.stringify(data));
      let read = false;
      return {
        ok: true,
        status: 200,
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
      if (path === '/api/changelog/state') {
        served.reads += 1;
        if (opts.stateDown)
          return {
            ok: false,
            status: opts.stateDown.status,
            json: async () => opts.stateDown?.body,
          };
        return answer(served.state);
      }
      if (path.startsWith('/api/changelog/fill?')) {
        fills.push(decodeURIComponent(path.slice(path.indexOf('?') + 1)).replace(/\+/g, ' '));
        return answer(filled(new URLSearchParams(path.slice(path.indexOf('?') + 1))));
      }
      if (path === '/api/changelog/preview') {
        const asked = body as { entry: Entry; lang: string };
        previews.push(asked);
        return answer(viewOf(asked.entry, asked.lang));
      }
      if (init) calls.push({ path, body });
      if (path === '/api/translate') {
        const { texts } = body as { texts: string[] };
        return answer(
          opts.translated?.(texts) ?? {
            results: texts.map((text) =>
              text
                ? Object.fromEntries(
                    ['fr', 'es', 'jp', 'kr', 'zh'].map((lang) => [lang, `${lang}: ${text}`]),
                  )
                : {},
            ),
            provider: 'deepl',
          },
        );
      }
      if (path === '/api/changelog')
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
    await import(/* @vite-ignore */ resolve(UI, 'tabs', 'changelog.js'));
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    lib.sections.start();
    const settle = () => vi.advanceTimersByTimeAsync(0);
    await settle();
    await settle();

    const el = (id: string) => document.getElementById(id) as unknown as HTMLInputElement;
    const all = (selector: string, root?: HTMLElement) =>
      [
        ...((root ?? document) as unknown as ParentNode).querySelectorAll(selector),
      ] as unknown as HTMLElement[];
    const fire = (target: HTMLElement, type: string) =>
      target.dispatchEvent(new window.Event(type, { bubbles: true }) as unknown as Event);
    const texts = (root: HTMLElement, selector: string) =>
      all(selector, root).map((n) => n.textContent ?? '');
    const item = (title: string) => {
      const li = all('#j-list .j-item').find((x) => texts(x, '.j-title')[0] === title);
      if (!li) throw new Error(`pas d’entrée « ${title} »`);
      return li;
    };
    const type = (input: HTMLElement, value: string) => {
      (input as HTMLInputElement).value = value;
      fire(input, 'input');
    };
    return {
      el,
      all,
      calls,
      fills,
      previews,
      confirm,
      served,
      settle,
      texts,
      item,
      type,
      fire,
      /**
       * L'option qu'un menu de la fiche porte `selected` — pas sa `value` :
       * happy-dom ne la relit pas d'un `<select>` posé par `innerHTML` dans une
       * fiche (il rend la deuxième option), Firefox si.
       */
      picked: (select: HTMLElement) =>
        (select.querySelector('option[selected]') as HTMLOptionElement | null)?.value,
      /** Les lignes de la liste : date, type, titre, lien, badges, point « modifiée ». */
      lines: () =>
        all('#j-list .j-item').map((li) => [
          texts(li, '.j-date')[0],
          texts(li, '.j-line .j-badge')[0],
          texts(li, '.j-title')[0],
          texts(li, '.j-chip')[0] ?? '',
          texts(li, '.j-line .badge').join(' | '),
          li.querySelector('.j-edit') ? '●' : '',
        ]),
      titles: () => all('#j-list .j-title').map((n) => n.textContent),
      /** Déplie (ou replie) une entrée, et laisse partir son aperçu. */
      toggle: async (title: string) => {
        (item(title).querySelector('.j-line') as HTMLElement).click();
        await settle();
      },
      /** Un champ de la fiche d'une entrée : `data-f`, `data-t` (titre) ou `data-c` (puces). */
      input: (title: string, attr: 'f' | 't' | 'c', name: string) => {
        const found = item(title).querySelector(`[data-${attr}="${name}"]`);
        if (!found) throw new Error(`pas de champ ${attr}=${name} dans « ${title} »`);
        return found as unknown as HTMLInputElement;
      },
      template: (label: string) => {
        const button = all('#j-templates button').find((b) => b.textContent === `＋ ${label}`);
        if (!button) throw new Error(`pas de gabarit « ${label} »`);
        return button;
      },
      save: async () => {
        el('j-save').click();
        await settle();
        await settle();
        await settle();
      },
    };
  }

  it('la section est servie, dans Publication, après Bannières — pas `wide`', async () => {
    const page = await journal();
    expect(
      page.all('#tabs [data-group="publication"]').map((b) => [b.dataset.tab, b.textContent]),
    ).toEqual([
      ['coupons', 'Codes promo'],
      ['banners', 'Bannières'],
      ['changelog', 'Journal du site'],
      ['comics', '4-comics'],
      ['videos', 'Vidéos'],
      ['discord', 'Discord'],
    ]);
    expect(page.el('tab-changelog').hidden).toBe(false);
    expect(page.el('tab-banners').hidden).toBe(true);
    expect(page.all('main')[0].classList.contains('wide')).toBe(false);
    // Le rappel de l'intro : le site lit le fichier au build.
    expect(page.all('#tab-changelog .hint')[0].textContent).toMatch(/au build.*« Pousser »/s);
    // Aucun id de la section ne double celui d'un autre onglet (`c-` est aux codes promo).
    const ids = page.all('[id]').map((n) => n.id);
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
  });

  it('un serveur sans la route (quick lancé avant l’onglet) : le journal dit le 404 et le remède, pas « data.entries is undefined »', async () => {
    const page = await journal({ stateDown: { status: 404, body: { error: 'route inconnue' } } });
    expect(page.el('journal').dataset.state).toBe('ko');
    expect(page.el('journal').textContent).toContain(
      'Journal du site illisible : Error: /api/changelog/state : HTTP 404 — route inconnue (quick lancé avant ce code ? Ctrl-C puis `pnpm quick`)',
    );
    // La liste reste vide, rien ne plante derrière.
    expect(page.all('#j-list li').length).toBe(0);
  });

  it('la liste : une entrée = une ligne, récent → ancien ; gabarits, types et langues servis', async () => {
    const page = await journal();
    expect(page.lines()).toEqual([
      ['2026-10-06', 'Perso', 'Demiurge Lambda', 'character · demiurge-lambda', '', ''],
      [
        '2026-10-06',
        'Guide',
        'Universal Tower',
        'guide · /guides/skyward-tower/universal-tower',
        '',
        '',
      ],
      ['2026-09-23', 'News', 'Outerpedia in French', '', '', ''],
    ]);
    // Pliées : aucune fiche, donc aucun champ dessiné — et aucun aperçu demandé.
    expect(page.all('#j-list .j-sheet')).toEqual([]);
    expect(page.previews).toEqual([]);
    expect(page.el('j-summary').textContent).toBe('3 entrées');
    expect(page.el('j-shown').textContent).toBe('3 entrées montrées sur 3');
    expect(page.el('j-more').hidden).toBe(true);
    expect(page.el('j-count').textContent).toBe('aucune modification');
    expect(page.el('j-save').disabled).toBe(true);
    expect(page.el('j-reset').disabled).toBe(true);
    expect(page.all('#j-templates button').map((b) => b.textContent)).toEqual([
      '＋ Perso',
      '＋ Mise à jour',
      '＋ Page / outil',
      '＋ Manuel',
    ]);
    expect(page.all('#j-type option').map((o) => o.textContent)).toEqual([
      'Tous les types',
      'Guide',
      'Mise à jour',
      'Page / outil',
      'Perso',
      'News',
      'Correctif',
    ]);
    expect(
      page.all('#j-pv-lang button').map((b) => [b.textContent, b.getAttribute('aria-pressed')]),
    ).toEqual([
      ['en', 'true'],
      ['fr', 'false'],
      ['es', 'false'],
      ['jp', 'false'],
      ['kr', 'false'],
      ['zh', 'false'],
    ]);
  });

  it('brouillon et programmée se lisent sur la ligne, et se comptent', async () => {
    const page = await journal({
      state: {
        entries: [
          { ...NEWS, date: '2026-10-20', title: { en: 'Later' } },
          { ...NEWS, date: '2026-10-20', title: { en: 'Hidden' }, draft: true },
          LAMBDA,
        ],
      },
    });
    expect(page.lines().map(([, , title, , badges]) => [title, badges])).toEqual([
      ['Later', 'programmée'],
      ['Hidden', 'brouillon'],
      ['Demiurge Lambda', ''],
    ]);
    expect(page.el('j-summary').textContent).toBe('3 entrées' + '1 brouillon' + '1 programmée');
  });

  it('n’en dessine que 40 à la fois ; « Afficher plus », le filtre texte et le filtre type', async () => {
    const page = await journal({ state: { entries: many(95) } });
    expect(page.titles()).toHaveLength(40);
    expect(page.titles()[0]).toBe('Update 1');
    expect(page.el('j-shown').textContent).toBe('40 entrées montrées sur 95');
    expect(page.el('j-more').hidden).toBe(false);
    expect(page.el('j-more').textContent).toBe('Afficher plus (40)');

    page.el('j-more').click();
    expect(page.titles()).toHaveLength(80);
    expect(page.el('j-more').textContent).toBe('Afficher plus (15)');
    page.el('j-more').click();
    expect(page.titles()).toHaveLength(95);
    expect(page.el('j-more').hidden).toBe(true);

    // Le filtre texte : titre, contenu, lien — et la liste repart de sa première page.
    page.type(page.el('j-q'), 'UPDATE 9');
    expect(page.titles()).toEqual([
      'Update 9',
      ...Array.from({ length: 6 }, (_, i) => `Update ${90 + i}`),
    ]);
    expect(page.el('j-shown').textContent).toBe('7 entrées montrées sur 7 — 95 en tout');
    page.type(page.el('j-q'), 'bullet of 42.');
    expect(page.titles()).toEqual(['Update 42']);
    page.type(page.el('j-q'), 'rien de tel');
    expect(page.titles()).toEqual([]);
    expect(page.el('j-empty').hidden).toBe(false);
    expect(page.el('j-empty').textContent).toBe('Aucune entrée ne correspond au filtre.');
    expect(page.el('j-foot').hidden).toBe(true);

    // Le filtre type : une entrée sur cinq est une news.
    page.type(page.el('j-q'), '');
    page.el('j-type').value = 'news';
    page.fire(page.el('j-type'), 'change');
    expect(page.el('j-shown').textContent).toBe('19 entrées montrées sur 19 — 95 en tout');
    expect(page.titles().slice(0, 3)).toEqual(['Update 1', 'Update 6', 'Update 11']);
  });

  it('dépliée, la fiche : ses champs, les puces une par ligne, les autres langues ouvertes si remplies', async () => {
    const page = await journal();
    await page.toggle('Demiurge Lambda');
    expect(page.all('#j-list .j-sheet')).toHaveLength(1);
    const li = page.item('Demiurge Lambda');
    expect(li.classList.contains('open')).toBe(true);
    expect(li.querySelector('.j-line')?.getAttribute('aria-expanded')).toBe('true');
    expect(page.input('Demiurge Lambda', 'f', 'date').value).toBe('2026-10-06');
    expect(page.picked(page.input('Demiurge Lambda', 'f', 'type'))).toBe('character');
    expect(page.input('Demiurge Lambda', 'f', 'draft').checked).toBe(false);
    expect(page.input('Demiurge Lambda', 't', 'en').value).toBe('Demiurge Lambda');
    expect(page.input('Demiurge Lambda', 't', 'fr').value).toBe('Démiurge Lambda');
    expect(page.input('Demiurge Lambda', 'c', 'en').value).toBe('Lambda added.');
    expect(page.picked(page.input('Demiurge Lambda', 'f', 'linkKind'))).toBe('character');
    expect(page.input('Demiurge Lambda', 'f', 'linkValue').value).toBe('demiurge-lambda');
    expect(page.input('Demiurge Lambda', 'f', 'image').value).toBe('');
    // Les cinq autres langues, dans l'ordre de l'écran, sous deux replis.
    expect(page.all('.j-more [data-t]', li).map((n) => n.dataset.t)).toEqual([
      'fr',
      'es',
      'jp',
      'kr',
      'zh',
    ]);
    expect(
      page
        .all('.j-more', li)
        .map((d) => [d.hasAttribute('open'), page.texts(d, '[data-tally]')[0]]),
    ).toEqual([
      [true, '1 / 5'],
      [true, '1 / 5'],
    ]);

    // Une entrée sans traduction : deux puces, une par ligne, les replis fermés.
    await page.toggle('Universal Tower');
    expect(page.input('Universal Tower', 'c', 'en').value).toBe(
      'Added the **Universal Tower** guide.\nSecond bullet.',
    );
    expect(
      page
        .all('.j-more', page.item('Universal Tower'))
        .map((d) => [d.hasAttribute('open'), page.texts(d, '[data-tally]')[0]]),
    ).toEqual([
      [false, '0 / 5'],
      [false, '0 / 5'],
    ]);
    expect(page.all('#j-list .j-sheet')).toHaveLength(2);

    // Un second clic replie.
    await page.toggle('Demiurge Lambda');
    expect(page.all('#j-list .j-sheet')).toHaveLength(1);
    expect(page.item('Demiurge Lambda').classList.contains('open')).toBe(false);
    expect(page.el('j-count').textContent).toBe('aucune modification');
  });

  it('la saisie : le textarea devient des puces, la ligne et le compte suivent, le champ garde le curseur', async () => {
    const page = await journal();
    await page.toggle('Universal Tower');
    const bullets = page.input('Universal Tower', 'c', 'en');
    page.type(bullets, ' First.  \n\n   \nSecond **bold**.\nThird. ');
    expect(page.input('Universal Tower', 'c', 'en')).toBe(bullets);
    expect(page.lines()[1][5]).toBe('●');
    expect(page.el('j-count').textContent).toBe('1 entrée modifiée');
    expect(page.el('j-save').disabled).toBe(false);

    const title = page.input('Universal Tower', 't', 'en');
    page.type(title, 'Tower, universal');
    expect(page.lines()[1][2]).toBe('Tower, universal');
    page.type(page.input('Tower, universal', 'f', 'date'), '2026-10-20');
    page.input('Tower, universal', 'f', 'draft').checked = true;
    page.fire(page.input('Tower, universal', 'f', 'draft'), 'change');
    expect(page.lines()[1].slice(0, 5)).toEqual([
      '2026-10-20',
      'Guide',
      'Tower, universal',
      'guide · /guides/skyward-tower/universal-tower',
      'brouillon',
    ]);
    // Le lien : sans sorte, plus de champ de valeur ni de chip.
    const kind = page.input('Tower, universal', 'f', 'linkKind');
    kind.value = '';
    page.fire(kind, 'change');
    expect(page.lines()[1][3]).toBe('');
    expect(
      (page.item('Tower, universal').querySelector('[data-linkbox]') as HTMLElement).hidden,
    ).toBe(true);

    await page.save();
    expect(page.calls).toEqual([
      {
        path: '/api/changelog',
        body: {
          // La liste entière, récent → ancien ; les entrées intactes telles que le disque.
          list: [
            {
              date: '2026-10-20',
              type: 'guide',
              title: { en: 'Tower, universal' },
              content: { en: ['First.', 'Second **bold**.', 'Third.'] },
              draft: true,
            },
            LAMBDA,
            NEWS,
          ],
          changed: ['Tower, universal'],
        },
      },
    ]);
    // L'état est relu : plus rien en attente, les fiches repliées.
    expect(page.served.reads).toBe(2);
    expect(page.el('j-count').textContent).toBe('aucune modification');
    expect(page.all('#j-list .j-sheet')).toEqual([]);
  });

  it('« à retraduire » quand l’anglais a changé depuis le chargement ; « Traduire » force les cinq langues', async () => {
    const page = await journal();
    await page.toggle('Demiurge Lambda');
    const stale = () => page.texts(page.all('#j-list .j-item')[0], '[data-stale]')[0];
    expect(stale()).toBe('');
    page.type(page.input('Demiurge Lambda', 'c', 'en'), 'Lambda added.\nWith her gear.');
    expect(stale()).toBe('à retraduire');
    // Revenu à l'anglais chargé : les traductions sont de nouveau à jour.
    page.type(page.input('Demiurge Lambda', 'c', 'en'), 'Lambda added.');
    expect(stale()).toBe('');
    page.type(page.input('Demiurge Lambda', 'c', 'en'), 'Lambda added.\nWith her gear.');

    (page.item('Demiurge Lambda').querySelector('[data-act="translate"]') as HTMLElement).click();
    await page.settle();
    await page.settle();
    // Le titre et les puces de CETTE entrée, une puce = un texte.
    expect(page.calls).toEqual([
      {
        path: '/api/translate',
        body: { texts: ['Demiurge Lambda', 'Lambda added.', 'With her gear.'] },
      },
    ]);
    // Les cinq langues sont posées, le français déjà là réécrit ; les puces suivent l'anglais.
    expect(page.input('Demiurge Lambda', 't', 'fr').value).toBe('fr: Demiurge Lambda');
    expect(page.input('Demiurge Lambda', 't', 'zh').value).toBe('zh: Demiurge Lambda');
    expect(page.input('Demiurge Lambda', 'c', 'fr').value).toBe(
      'fr: Lambda added.\nfr: With her gear.',
    );
    expect(page.input('Demiurge Lambda', 'c', 'jp').value).toBe(
      'jp: Lambda added.\njp: With her gear.',
    );
    expect(page.texts(page.item('Demiurge Lambda'), '[data-tally]')).toEqual(['5 / 5', '5 / 5']);
    expect(stale()).toBe('');
    expect(page.el('j-count').textContent).toBe('1 entrée modifiée');
    expect(page.el('journal').dataset.state).toBe('ok');

    // Sans anglais retouché, « Traduire » repart quand même : il force.
    (page.item('Demiurge Lambda').querySelector('[data-act="translate"]') as HTMLElement).click();
    await page.settle();
    await page.settle();
    expect(page.calls).toHaveLength(2);
  });

  it('une entrée sans traduction n’est pas « à retraduire » ; un refus du traducteur s’écrit sur la fiche', async () => {
    const page = await journal({
      translated: () => ({
        error: 'Pas de clé DEEPL_API_KEY ni ANTHROPIC_API_KEY dans .env.local',
      }),
    });
    await page.toggle('Universal Tower');
    page.type(page.input('Universal Tower', 't', 'en'), 'Universal Tower 2');
    const li = () => page.item('Universal Tower 2');
    expect(page.texts(li(), '[data-stale]')[0]).toBe('');

    (li().querySelector('[data-act="translate"]') as HTMLElement).click();
    await page.settle();
    await page.settle();
    expect(page.texts(li(), '[data-tr-error]')[0]).toBe(
      'Pas de clé DEEPL_API_KEY ni ANTHROPIC_API_KEY dans .env.local',
    );
    expect(page.el('journal').dataset.state).toBe('ko');
    // Rien n'a été posé.
    expect(page.input('Universal Tower 2', 't', 'fr').value).toBe('');
    expect((li().querySelector('[data-act="translate"]') as HTMLButtonElement).disabled).toBe(
      false,
    );
  });

  it('l’aperçu : une requête à l’ouverture, puis UNE, 400 ms après la dernière frappe ; la langue relance', async () => {
    const page = await journal();
    await page.toggle('Universal Tower');
    expect(page.previews).toEqual([{ entry: TOWER, lang: 'en' }]);
    const pv = () => page.item('Universal Tower').querySelector('[data-pv]') as HTMLElement;
    // La carte du site : le badge, la date, le titre, le gras, le lien et où il mène.
    expect(page.texts(pv(), '.j-badge')).toEqual(['guide (en)']);
    expect(page.texts(pv(), '.j-card-title')).toEqual(['Universal Tower']);
    expect(page.texts(pv(), 'li')).toEqual(['Added the Universal Tower guide.', 'Second bullet.']);
    expect(page.texts(pv(), 'li strong')).toEqual(['Universal Tower']);
    expect(pv().querySelector('.j-goto')?.textContent).toBe(
      'Go there →/guides/skyward-tower/universal-tower',
    );
    // Sans vignette : l'icône du type.
    expect(pv().querySelector('.j-thumb')?.textContent).toBe('🧭');
    expect(pv().querySelector('.j-thumb img')).toBeNull();

    const bullets = page.input('Universal Tower', 'c', 'en');
    page.type(bullets, 'A');
    await vi.advanceTimersByTimeAsync(300);
    page.type(bullets, 'A **b**');
    await vi.advanceTimersByTimeAsync(399);
    expect(page.previews).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(page.previews).toHaveLength(2);
    expect(page.previews[1]).toEqual({
      entry: { ...TOWER, content: { en: ['A **b**'] } },
      lang: 'en',
    });
    expect(page.texts(pv(), 'li')).toEqual(['A b']);
    expect(page.texts(pv(), 'li strong')).toEqual(['b']);
    // Une frappe qui ne change rien à l'entrée ne redemande rien.
    page.type(bullets, 'A **b**  ');
    await vi.advanceTimersByTimeAsync(400);
    expect(page.previews).toHaveLength(2);

    // Une autre fiche dépliée, puis la langue : une requête par entrée ouverte.
    await page.toggle('Demiurge Lambda');
    expect(page.previews).toHaveLength(3);
    const lambda = page.item('Demiurge Lambda').querySelector('[data-pv]') as HTMLElement;
    // Le portrait est sous la base des images quand le serveur rend un chemin.
    expect(lambda.querySelector('.j-thumb img')?.getAttribute('src')).toBe(
      'https://img.test/images/characters/faceicon/FI_9.png',
    );
    page.all('#j-pv-lang button')[1].click();
    await page.settle();
    expect(page.previews.slice(3).map((p) => [p.entry.title.en, p.lang])).toEqual([
      ['Demiurge Lambda', 'fr'],
      ['Universal Tower', 'fr'],
    ]);
    expect(page.all('#j-pv-lang button').map((b) => b.getAttribute('aria-pressed'))).toEqual([
      'false',
      'true',
      'false',
      'false',
      'false',
      'false',
    ]);
    expect(
      page.texts(
        page.item('Demiurge Lambda').querySelector('[data-pv]') as HTMLElement,
        '.j-card-title',
      ),
    ).toEqual(['Démiurge Lambda']);
    // Rien de tout cela n'est un changement.
    expect(page.calls).toEqual([]);
  });

  it('un gabarit sans champ pose une entrée en tête, dépliée, à la date du jour — vide, elle ne compte pas', async () => {
    const page = await journal();
    page.template('Page / outil').click();
    await page.settle();
    await page.settle();
    expect(page.fills).toEqual(['template=feature']);
    expect(page.lines()[0]).toEqual(['2026-10-08', 'Page / outil', 'sans titre', '', '', '']);
    expect(page.lines()).toHaveLength(4);
    const li = page.all('#j-list .j-item')[0];
    expect(li.classList.contains('open')).toBe(true);
    expect(page.picked(li.querySelector('[data-f="type"]') as HTMLElement)).toBe('feature');
    // La sorte de lien est préremplie, sa valeur reste à saisir.
    expect(page.picked(li.querySelector('[data-f="linkKind"]') as HTMLElement)).toBe('page');
    expect((li.querySelector('[data-linkbox]') as HTMLElement).hidden).toBe(false);
    expect(page.previews).toHaveLength(1);
    expect(page.el('j-count').textContent).toBe('aucune modification');
    expect(page.el('j-save').disabled).toBe(true);
    // « Annuler » la retire.
    expect(page.el('j-reset').disabled).toBe(false);
    page.el('j-reset').click();
    expect(page.lines()).toHaveLength(3);

    // Elle reste à l'écran sous un filtre qui ne la contient pas.
    page.template('Manuel').click();
    await page.settle();
    await page.settle();
    page.type(page.el('j-q'), 'lambda');
    expect(page.titles()).toEqual(['sans titre', 'Demiurge Lambda']);
  });

  it('le gabarit « Mise à jour » : son formulaire prérempli, puis l’entrée remplie par le serveur', async () => {
    const page = await journal();
    expect(page.el('j-form').hidden).toBe(true);
    page.template('Mise à jour').click();
    expect(page.el('j-form').hidden).toBe(false);
    expect(page.template('Mise à jour').getAttribute('aria-pressed')).toBe('true');
    expect(
      page.all('#j-form [data-v]').map((f) => [f.dataset.v, (f as HTMLInputElement).value]),
    ).toEqual([
      ['guide', ''],
      ['mode', 'Joint Challenge'],
      // Le mois courant, rendu par le serveur.
      ['month', 'October 2026'],
      ['slug', ''],
    ]);
    expect(page.fills).toEqual([]);

    // Le slug laissé vide : il reste écrit dans le lien, à compléter.
    page.type(page.all('#j-form [data-v="guide"]')[0], 'Annihilator');
    (page.el('j-form').querySelector('[data-act="pose"]') as HTMLElement).click();
    await page.settle();
    await page.settle();
    expect(page.fills).toEqual([
      'template=update&guide=Annihilator&mode=Joint Challenge&month=October 2026&slug=',
    ]);
    expect(page.lines()[0]).toEqual([
      '2026-10-08',
      'Mise à jour',
      'Annihilator',
      'guide · /guides/joint-challenge/{slug}',
      '',
      '●',
    ]);
    expect(page.input('Annihilator', 'c', 'en').value).toBe(
      'Annihilator Joint Challenge Guide updated for October 2026 version.',
    );
    expect(page.el('j-count').textContent).toBe('1 entrée modifiée');
    // Le formulaire s'est refermé.
    expect(page.el('j-form').hidden).toBe(true);
    expect(page.template('Mise à jour').getAttribute('aria-pressed')).toBe('false');

    // Un second clic sur le gabarit referme son formulaire sans rien poser.
    page.template('Mise à jour').click();
    page.template('Mise à jour').click();
    expect(page.el('j-form').hidden).toBe(true);
    expect(page.fills).toHaveLength(1);
  });

  it('le gabarit « Perso » : la recherche du roster, puis le titre en six langues, la puce et le slug', async () => {
    const page = await journal();
    page.template('Perso').click();
    const search = page.el('j-form').querySelector('[data-pick]') as unknown as HTMLInputElement;
    expect(search.placeholder).toBe('Chercher un perso…');
    const results = page.el('j-form').querySelector('.results') as HTMLElement;
    page.type(search, 'a');
    expect(results.hidden).toBe(true);
    page.type(search, 'AN');
    // Ceux qui commencent par la saisie d'abord, puis ceux qui la contiennent.
    expect(page.all('#j-form .results div span:first-of-type').map((n) => n.textContent)).toEqual([
      'Anna',
      'Dana',
      'Summer Anna',
    ]);
    page.all('#j-form .results div')[2].click();
    await page.settle();
    await page.settle();

    expect(page.fills).toEqual(['template=character&character=5']);
    expect(page.lines()[0]).toEqual([
      '2026-10-08',
      'Perso',
      'Summer Anna',
      'character · summer-anna',
      '',
      '●',
    ]);
    expect(page.input('Summer Anna', 't', 'fr').value).toBe('Anna estivale');
    expect(page.input('Summer Anna', 't', 'zh').value).toBe('夏日安娜');
    expect(page.input('Summer Anna', 'c', 'en').value).toBe(
      'Summer Anna has been added to the database with full skills and stats.',
    );
    // Les six titres sont là, les puces des autres langues restent à traduire.
    expect(page.texts(page.item('Summer Anna'), '[data-tally]')).toEqual(['5 / 5', '0 / 5']);
    expect(page.texts(page.item('Summer Anna'), '[data-stale]')[0]).toBe('');
    expect(page.el('j-form').hidden).toBe(true);

    await page.save();
    const sent = page.calls[0].body as { list: Entry[]; changed: string[] };
    expect(sent.changed).toEqual(['Summer Anna']);
    expect(sent.list).toHaveLength(4);
    // Les langues dans l'ordre du fichier, pas celui de l'écran.
    expect(JSON.stringify(sent.list[0])).toBe(
      JSON.stringify({
        date: '2026-10-08',
        type: 'character',
        title: {
          en: 'Summer Anna',
          jp: 'サマー・アンナ',
          kr: '서머 안나',
          zh: '夏日安娜',
          fr: 'Anna estivale',
          es: 'Anna de verano',
        },
        content: {
          en: ['Summer Anna has been added to the database with full skills and stats.'],
        },
        link: { kind: 'character', slug: 'summer-anna' },
      }),
    );
  });

  it('le lien d’un perso se cherche dans le roster ; les autres se tapent', async () => {
    const page = await journal();
    await page.toggle('Outerpedia in French');
    const kind = page.input('Outerpedia in French', 'f', 'linkKind');
    const box = page.item('Outerpedia in French').querySelector('[data-linkbox]') as HTMLElement;
    expect(box.hidden).toBe(true);
    kind.value = 'character';
    page.fire(kind, 'change');
    expect(box.hidden).toBe(false);
    expect(page.texts(box, '[data-link-label]')).toEqual(['Slug du perso']);

    const value = page.input('Outerpedia in French', 'f', 'linkValue');
    page.type(value, 'dan');
    expect(page.texts(box, '.results div span:first-of-type')).toEqual(['Dana']);
    (box.querySelector('.results div') as HTMLElement).click();
    expect(value.value).toBe('dana');
    expect((box.querySelector('.results') as HTMLElement).hidden).toBe(true);
    expect(page.lines()[2][3]).toBe('character · dana');

    // Un chemin : aucune suggestion.
    kind.value = 'page';
    page.fire(kind, 'change');
    expect(page.texts(box, '[data-link-label]')).toEqual(['Chemin']);
    page.type(value, '/dana');
    expect((box.querySelector('.results') as HTMLElement).hidden).toBe(true);
    expect(page.lines()[2][3]).toBe('page · /dana');
  });

  it('« Enregistrer » refusé : rien n’est relu, l’entrée fautive est marquée par son rang ; la saisie lève le refus', async () => {
    const page = await journal({
      saved: () => ({
        ok: false,
        log: ['REFUSÉ — Entrée 3 : titre EN requis.'],
        issues: [{ index: 2, message: 'Entrée 3 : titre EN requis.' }],
        written: false,
      }),
    });
    await page.toggle('Outerpedia in French');
    page.type(page.input('Outerpedia in French', 't', 'en'), '  ');
    await page.save();

    expect(page.served.reads).toBe(1);
    expect(page.lines()[2]).toEqual(['2026-09-23', 'News', 'sans titre', '', 'refusée', '●']);
    expect(page.all('#j-list .j-item')[2].classList.contains('ko')).toBe(true);
    expect(page.all('#j-list .badge.ko')[0].title).toBe('Entrée 3 : titre EN requis.');
    expect(page.el('j-count').textContent).toBe('1 entrée modifiée' + '1 refus');
    // La fiche est restée ouverte, la saisie est gardée.
    expect(page.all('#j-list .j-sheet')).toHaveLength(1);

    page.type(
      page.all('#j-list .j-item')[2].querySelector('[data-t="en"]') as HTMLElement,
      'Fixed',
    );
    expect(page.lines()[2].slice(2)).toEqual(['Fixed', '', '', '●']);
    expect(page.el('j-count').textContent).toBe('1 entrée modifiée');
  });

  it('« Supprimer » retire l’entrée, et son titre part avec le commit', async () => {
    const page = await journal();
    await page.toggle('Universal Tower');
    (page.item('Universal Tower').querySelector('[data-act="del"]') as HTMLElement).click();
    expect(page.titles()).toEqual(['Demiurge Lambda', 'Outerpedia in French']);
    expect(page.el('j-summary').textContent).toBe('2 entrées');
    expect(page.el('j-count').textContent).toBe('1 entrée modifiée');

    page.served.state = disk({ entries: [LAMBDA, NEWS] });
    await page.save();
    expect(page.calls).toEqual([
      { path: '/api/changelog', body: { list: [LAMBDA, NEWS], changed: ['Universal Tower'] } },
    ]);
    expect(page.el('j-summary').textContent).toBe('2 entrées');
    expect(page.el('j-count').textContent).toBe('aucune modification');
  });

  it('« Annuler » rend le disque ; quitter l’onglet avec des changements demande confirmation', async () => {
    const page = await journal();
    expect(page.confirm).not.toHaveBeenCalled();
    await page.toggle('Universal Tower');
    page.type(page.input('Universal Tower', 't', 'en'), 'Renamed');
    await page.toggle('Demiurge Lambda');
    (page.item('Demiurge Lambda').querySelector('[data-act="del"]') as HTMLElement).click();
    expect(page.el('j-count').textContent).toBe('2 entrées modifiées');

    page.confirm.mockReturnValueOnce(false);
    page.all('#tabs [data-tab="coupons"]')[0].click();
    expect(page.confirm).toHaveBeenCalledTimes(1);
    expect(page.confirm.mock.calls[0]).toEqual([
      '2 entrées modifiées, pas encore enregistrées. Quitter l’onglet ? Elles restent en attente tant que la page n’est pas rechargée.',
    ]);
    expect(page.el('tab-changelog').hidden).toBe(false);

    page.el('j-reset').click();
    expect(page.titles()).toEqual(['Demiurge Lambda', 'Universal Tower', 'Outerpedia in French']);
    expect(page.all('#j-list .j-sheet')).toEqual([]);
    expect(page.el('j-count').textContent).toBe('aucune modification');
    expect(page.el('j-reset').disabled).toBe(true);
    page.all('#tabs [data-tab="coupons"]')[0].click();
    expect(page.confirm).toHaveBeenCalledTimes(1);
    expect(page.el('tab-changelog').hidden).toBe(true);
    expect(page.calls).toEqual([]);
  });

  it('`#changelog/<n>` ouvre l’onglet sur la fiche de la n-ième entrée, à partir de 0', async () => {
    const page = await journal({ hash: 'changelog/1' });
    expect(page.el('tab-changelog').hidden).toBe(false);
    expect(page.all('#j-list .j-item.open').map((li) => page.texts(li, '.j-title')[0])).toEqual([
      'Universal Tower',
    ]);
    expect(page.previews).toEqual([{ entry: TOWER, lang: 'en' }]);

    // Au-delà de la première page : la liste s'étend jusqu'à elle. Hors liste : rien d'ouvert.
    const far = await journal({ hash: 'changelog/59', state: { entries: many(95) } });
    expect(far.titles()).toHaveLength(60);
    expect(far.all('#j-list .j-item.open').map((li) => far.texts(li, '.j-title')[0])).toEqual([
      'Update 60',
    ]);
    const none = await journal({ hash: 'changelog/7' });
    expect(none.all('#j-list .j-item.open')).toEqual([]);
    expect(none.titles()).toHaveLength(3);
  });
});

describe('Tables du jeu — la page, sur le vrai markup', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  interface Reader {
    name: string;
    path: string;
  }
  interface Table {
    name: string;
    bytes: number;
    mtimeMs: number;
    usedBy: Reader[];
    note: string;
  }
  interface Catalog {
    tables: Table[];
    used: number;
    readers: number;
    hiddenColumns: string[];
    error?: string;
  }
  interface Rows {
    table: string;
    columns: string[];
    filled: string[];
    rowCount: number;
    rows: Record<string, string>[];
    matched: number;
    page: number;
    pageSize: number;
    texts: Record<string, string>;
    links: Record<string, string>;
  }
  type Query = Record<string, string>;

  const reader = (name: string): Reader => ({ name, path: `datagen/${name}.ts` });
  const table = (name: string, bytes: number, usedBy: Reader[] = [], note = ''): Table => ({
    name,
    bytes,
    mtimeMs: Date.UTC(2026, 9, 8, 8, 58),
    usedBy,
    note,
  });
  /** Le catalogue, dans l'ordre du serveur : les tables lues d'abord. */
  const catalog = (over: Partial<Catalog> = {}): Catalog => ({
    tables: [
      table(
        'RecruitGroupTemplet',
        180_167,
        [reader('extractor/specs/character'), reader('generators/recruit')],
        "Spec d'extraction — PERSONNAGES.\nGénérateur — DOMAINE RECRUTEMENT (`recruit.json`).",
      ),
      table(
        'CharacterTemplet',
        2_400_000,
        [reader('extractor/specs/character')],
        "Spec d'extraction — PERSONNAGES.",
      ),
      table('AreaTemplet', 512),
      table('RecruitRateTemplet', 4_096),
    ],
    used: 2,
    readers: 2,
    hiddenColumns: ['French', 'Korean'],
    ...over,
  });

  const NORMAL = {
    ID: '1',
    RecruitType: 'NORMAL',
    NameID: 'SYS_RECRUIT_1',
    English: 'Normal',
    French: 'Normale',
  };
  const SEASONAL = {
    ID: '6203',
    RecruitType: 'SEASONAL <b>',
    CharacterIDs: '2000093, 2000085',
    NameID: 'constructor',
    English: 'Seasonal',
    French: 'Saison',
  };
  /** Une page de `RecruitGroupTemplet` : 120 lignes filtrées sur 177, trois pages. */
  const recruit = (over: Partial<Rows> = {}): Rows => ({
    table: 'CRecruitGroupTemplet',
    columns: ['ID', 'RecruitType', 'CharacterIDs', 'NameID', 'English', 'French', 'Dead'],
    filled: ['ID', 'RecruitType', 'CharacterIDs', 'NameID', 'English', 'French'],
    rowCount: 177,
    rows: [NORMAL, SEASONAL],
    matched: 120,
    page: 1,
    pageSize: 50,
    texts: { SYS_RECRUIT_1: 'Normal Recruitment' },
    links: { CharacterIDs: 'CharacterTemplet' },
    ...over,
  });
  const character = (): Rows => ({
    table: 'CharacterTemplet',
    columns: ['ID', 'NameID'],
    filled: ['ID', 'NameID'],
    rowCount: 300,
    rows: [{ ID: '2000085', NameID: '2000085_Name' }],
    matched: 1,
    page: 1,
    pageSize: 50,
    texts: {},
    links: {},
  });

  /**
   * La page de quick dans un document happy-dom, comme pour le tableau de
   * bord : la VRAIE coquille assemblée, le vrai `lib.js` et le vrai
   * `tabs/gamedata.js` (eux seuls), démarrés par `sections.start()`. `fetch`
   * est factice : il sert `served.catalog`, et de `/api/gamedata/table` la
   * page de la table demandée (au rang demandé) — chaque requête est gardée.
   */
  async function gamedata(
    opts: {
      hash?: string;
      catalog?: Catalog;
      rows?: (query: Query) => Rows | null;
      clipboard?: unknown;
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

    const served = { catalog: opts.catalog ?? catalog() };
    const reads: string[] = [];
    const queries: Query[] = [];
    const posts: string[] = [];
    const answer = (data: unknown, status = 200) => ({
      ok: status < 400,
      status,
      json: async () => data,
    });
    const rows =
      opts.rows ??
      ((q: Query): Rows | null =>
        q.name === 'RecruitGroupTemplet'
          ? recruit({ page: Number(q.page) })
          : q.name === 'CharacterTemplet'
            ? character()
            : null);
    const fetch = vi.fn(async (path: string, init?: unknown) => {
      if (init) posts.push(path);
      const url = new URL(path, 'http://localhost:4747');
      if (url.pathname === '/api/gamedata/tables') {
        reads.push(path);
        return answer(served.catalog);
      }
      if (url.pathname === '/api/gamedata/table') {
        const query = Object.fromEntries(url.searchParams);
        queries.push(query);
        const out = rows(query);
        return out ? answer(out) : answer({ error: `table inconnue : ${query.name}` }, 404);
      }
      return answer({ imgBase: 'https://img.test', host: 'banc', port: 4747 });
    });
    const writeText = vi.fn(() => Promise.resolve());

    vi.stubGlobal('window', window);
    vi.stubGlobal('document', document);
    vi.stubGlobal('location', window.location);
    vi.stubGlobal('history', window.history);
    vi.stubGlobal('fetch', fetch);
    vi.stubGlobal('navigator', { clipboard: opts.clipboard ?? { writeText } });

    const lib = (await import(/* @vite-ignore */ resolve(UI, 'lib.js'))) as {
      sections: { start: () => void };
    };
    await import(/* @vite-ignore */ resolve(UI, 'tabs', 'gamedata.js'));
    lib.sections.start();
    const settle = async () => {
      for (let i = 0; i < 4; i++) await new Promise((done) => setTimeout(done, 0));
    };
    await settle();

    const el = (id: string) => document.getElementById(id) as unknown as HTMLInputElement;
    const all = (selector: string) =>
      [...document.querySelectorAll(selector)] as unknown as HTMLElement[];
    const text = (node: Element | null | undefined) =>
      (node?.textContent ?? '').replace(/\s+/g, ' ').trim();
    const fire = (target: HTMLElement, type: string, key?: string) =>
      target.dispatchEvent(
        (key
          ? new window.KeyboardEvent(type, { key, bubbles: true, cancelable: true })
          : new window.Event(type, { bubbles: true })) as unknown as Event,
      );
    const type = (input: HTMLInputElement, value: string) => {
      input.value = value;
      fire(input, 'input');
    };
    return {
      window,
      el,
      all,
      text,
      fire,
      type,
      served,
      reads,
      queries,
      posts,
      writeText,
      settle,
      /** Vient à l'onglet par le menu. */
      come: async () => {
        all('#tabs [data-tab="gamedata"]')[0].click();
        await settle();
      },
      /** Tape un nom dans le sélecteur et prend la suggestion `name`. */
      pick: async (name: string) => {
        type(el('t-pick'), name);
        all('#t-results [data-id]')
          .find((d) => d.dataset.id === name)
          ?.click();
        await settle();
      },
      /** Coche ou décoche une case, comme un clic. */
      check: async (id: string, checked: boolean) => {
        el(id).checked = checked;
        fire(el(id), 'change');
        await settle();
      },
      /** Les suggestions : le nom, la taille, l'usage. */
      hits: () =>
        all('#t-results [data-id]').map((d) => [
          d.dataset.id,
          text(d.querySelector('.lbl')),
          text(d.lastElementChild),
        ]),
      /** Les en-têtes du tableau. */
      head: () => all('#t-head th').map((th) => text(th)),
      /** Les cellules d'une ligne, telles qu'elles se lisent. */
      cells: (i: number) => all(`#t-rows tr[data-i="${i}"] td`).map((td) => text(td)),
      /** La ligne brute : ses paires clé, valeur. */
      raw: () =>
        all('#t-kv .t-pair').map((pair) => [
          pair.querySelector('dt')?.textContent,
          pair.querySelector('dd')?.textContent,
        ]),
    };
  }

  it('la section est servie, dans Données, après Rangs — `wide` ; rien n’est lu avant d’y venir', async () => {
    const page = await gamedata();
    expect(
      page.all('#tabs [data-group="data"]').map((b) => [b.dataset.tab, b.textContent]),
    ).toEqual([
      ['ranks', 'Rangs'],
      ['gamedata', 'Tables du jeu'],
    ]);
    // La page s'ouvre sur le tableau de bord : ni catalogue ni passe sur les sources.
    expect(page.el('tab-gamedata').hidden).toBe(true);
    expect(page.reads).toEqual([]);

    await page.come();
    expect(page.el('tab-gamedata').hidden).toBe(false);
    expect(page.all('#groups [data-group="data"]')[0].getAttribute('aria-selected')).toBe('true');
    expect(page.all('main')[0].classList.contains('wide')).toBe(true);
    expect(page.reads).toEqual(['/api/gamedata/tables']);
    expect(page.text(page.el('t-total'))).toBe('4 tables · 2 lues par 2 fichiers');
    expect(page.text(page.el('t-none'))).toBe(
      'Choisir une table : taper son nom — les 2 tables lues par le code sortent d’abord.',
    );
    expect(page.el('t-info').hidden).toBe(true);
    expect(page.el('t-card').hidden).toBe(true);

    // Y revenir ne relit pas : le catalogue ne bouge qu'à « Recalculer ».
    page.all('#tabs [data-tab="ranks"]')[0].click();
    await page.come();
    expect(page.reads).toEqual(['/api/gamedata/tables']);
    // Lecture seule : ni savebar, ni un seul POST.
    expect(page.all('#tab-gamedata .savebar')).toEqual([]);
    expect(page.queries).toEqual([]);
    expect(page.posts).toEqual([]);
  });

  it('les suggestions : les tables lues d’abord, le badge « utilisée · N », « jamais lue » sinon', async () => {
    const page = await gamedata({ hash: '#gamedata' });
    expect(page.el('t-results').hidden).toBe(true);

    // Le champ vide propose tout, dans l'ordre du serveur.
    page.fire(page.el('t-pick'), 'focus');
    expect(page.el('t-results').hidden).toBe(false);
    expect(page.hits()).toEqual([
      ['RecruitGroupTemplet', '180 Ko', 'utilisée · 2'],
      ['CharacterTemplet', '2,4 Mo', 'utilisée · 1'],
      ['AreaTemplet', '512 o', 'jamais lue'],
      ['RecruitRateTemplet', '4 Ko', 'jamais lue'],
    ]);
    expect(page.all('#t-results [data-id]').map((d) => d.lastElementChild?.className)).toEqual([
      'badge ok',
      'badge ok',
      'lbl t-unread',
      'lbl t-unread',
    ]);

    // La saisie filtre par sous-chaîne, sans casse, et garde l'ordre.
    page.type(page.el('t-pick'), 'recruit');
    expect(page.hits().map(([name]) => name)).toEqual([
      'RecruitGroupTemplet',
      'RecruitRateTemplet',
    ]);
    page.type(page.el('t-pick'), 'zzz');
    expect(page.hits()).toEqual([]);
    expect(page.text(page.el('t-results'))).toBe('Aucune table ne porte ce nom.');

    // Un clic ailleurs, ou Échap, referme la liste.
    page.el('t-total').click();
    expect(page.el('t-results').hidden).toBe(true);
    page.type(page.el('t-pick'), 'rate');
    expect(page.el('t-results').hidden).toBe(false);
    page.fire(page.el('t-pick'), 'keydown', 'Escape');
    expect(page.el('t-results').hidden).toBe(true);
    expect(page.queries).toEqual([]);
  });

  it('pas le catalogue entier sous le champ : quarante suggestions, et le reste compté', async () => {
    const many = Array.from({ length: 45 }, (_, i) =>
      table(`Table${String(i).padStart(2, '0')}Templet`, 1000),
    );
    const page = await gamedata({
      hash: '#gamedata',
      catalog: catalog({ tables: many, used: 0, readers: 0 }),
    });
    page.fire(page.el('t-pick'), 'focus');
    expect(page.hits()).toHaveLength(40);
    expect(page.text(page.all('#t-results .t-more')[0])).toBe('… 5 autres : préciser le nom.');
    page.type(page.el('t-pick'), 'table4');
    expect(page.hits()).toHaveLength(5);
    expect(page.all('#t-results .t-more')).toEqual([]);
  });

  it('Entrée prend la première ; la table choisie : taille, date, lecteurs en chips, note, hash', async () => {
    const page = await gamedata({ hash: '#gamedata' });
    page.type(page.el('t-pick'), 'recruit');
    page.fire(page.el('t-pick'), 'keydown', 'Enter');
    await page.settle();

    expect(page.el('t-pick').value).toBe('RecruitGroupTemplet');
    expect(page.el('t-results').hidden).toBe(true);
    expect(page.window.location.hash).toBe('#gamedata/RecruitGroupTemplet');
    // UNE requête : la première page, textes résolus d'office.
    expect(page.queries).toEqual([
      { name: 'RecruitGroupTemplet', q: '', col: '', exact: '0', page: '1', resolve: '1' },
    ]);

    expect(page.el('t-none').hidden).toBe(true);
    expect(page.el('t-info').hidden).toBe(false);
    expect(page.text(page.all('#t-info .t-id strong')[0])).toBe('RecruitGroupTemplet');
    expect(page.text(page.all('#t-info .t-id .badge')[0])).toBe('utilisée · 2');
    expect(page.all('#t-info .t-id .lbl').map((span) => page.text(span))).toEqual([
      expect.stringMatching(/^180 Ko · extraite le \d{2}\/\d{2}\/2026 \d{2}:\d{2}$/),
      // Le nom interne du parser, puis ce que la lecture apprend.
      'CRecruitGroupTemplet · 177 lignes · 6/7 colonnes remplies',
    ]);
    // Un lecteur : du texte seul, son chemin complet au survol.
    expect(page.all('#t-info .t-reader').map((c) => [c.textContent, c.title, c.tagName])).toEqual([
      ['extractor/specs/character', 'datagen/extractor/specs/character.ts', 'SPAN'],
      ['generators/recruit', 'datagen/generators/recruit.ts', 'SPAN'],
    ]);
    expect(page.all('#t-info .t-note')[0].innerHTML).toBe(
      "Spec d'extraction — PERSONNAGES.\nGénérateur — DOMAINE RECRUTEMENT (<code>recruit.json</code>).",
    );
    expect(page.el('t-card').hidden).toBe(false);

    // Une table que rien ne lit le dit, sans chips.
    await page.pick('AreaTemplet');
    expect(page.window.location.hash).toBe('#gamedata/AreaTemplet');
    expect(page.all('#t-info .t-id .t-unread').map((s) => page.text(s))).toEqual(['jamais lue']);
    expect(page.all('#t-info .t-reader')).toEqual([]);
    expect(page.text(page.all('#t-info .t-note')[0])).toMatch(
      /^Aucun fichier .* ne lit cette table/,
    );
  });

  it('`#gamedata/<Table>` ouvre l’onglet sur la table, son filtre compris ; une table inconnue le dit', async () => {
    const hash = '#gamedata/CharacterTemplet?col=ID&exact=1&q=2000085';
    const page = await gamedata({ hash });
    expect(page.el('tab-gamedata').hidden).toBe(false);
    expect(page.window.location.hash).toBe(hash);
    expect(page.reads).toEqual(['/api/gamedata/tables']);
    expect(page.queries).toEqual([
      { name: 'CharacterTemplet', q: '2000085', col: 'ID', exact: '1', page: '1', resolve: '1' },
    ]);
    expect(page.el('t-pick').value).toBe('CharacterTemplet');
    expect(page.el('t-q').value).toBe('2000085');
    expect(page.el('t-col').value).toBe('ID');
    expect(page.el('t-exact').checked).toBe(true);
    expect(page.el('t-exact').disabled).toBe(false);
    expect(page.text(page.el('t-count'))).toBe('1 ligne sur 300');
    expect(page.cells(0)).toEqual(['2000085', '2000085_Name']);

    const bare = await gamedata({ hash: '#gamedata/RecruitGroupTemplet' });
    expect(bare.queries).toEqual([
      { name: 'RecruitGroupTemplet', q: '', col: '', exact: '0', page: '1', resolve: '1' },
    ]);
    expect(bare.el('t-exact').disabled).toBe(true);

    const none = await gamedata({ hash: '#gamedata/NopeTemplet' });
    expect(none.el('tab-gamedata').hidden).toBe(false);
    expect(none.text(none.el('t-none'))).toBe('table inconnue : NopeTemplet');
    expect(none.el('t-none').hidden).toBe(false);
    expect(none.el('t-info').hidden).toBe(true);
    expect(none.el('t-card').hidden).toBe(true);
    expect(none.queries).toEqual([]);
  });

  it('le tableau : colonnes jamais remplies et colonnes de langue masquées, le texte anglais sous sa clé', async () => {
    const page = await gamedata({ hash: '#gamedata/RecruitGroupTemplet' });
    // `Dead` n'est renseignée par aucune ligne, `French` est une langue ; la
    // flèche dit la colonne qui mène à une autre table.
    expect(page.head()).toEqual(['ID', 'RecruitType', 'CharacterIDs↗', 'NameID', 'English']);
    expect(page.all('#t-head .t-arrow')[0].title).toBe('→ CharacterTemplet');
    expect(page.cells(0)).toEqual(['1', 'NORMAL', '', 'SYS_RECRUIT_1Normal Recruitment', 'Normal']);
    expect(page.all('#t-rows tr[data-i="0"] .t-text').map((t) => t.textContent)).toEqual([
      'Normal Recruitment',
    ]);
    // Une valeur qui porte un chevron est échappée ; `constructor`, clé de texte
    // possible, ne ramène pas un membre hérité de l'objet des textes.
    expect(page.cells(1)).toEqual([
      '6203',
      'SEASONAL <b>',
      '2000093, 2000085',
      'constructor',
      'Seasonal',
    ]);
    expect(page.all('#t-rows b')).toEqual([]);

    // « colonnes vides » montre les colonnes mortes — jamais les langues.
    await page.check('t-blank', true);
    expect(page.head()).toEqual([
      'ID',
      'RecruitType',
      'CharacterIDs↗',
      'NameID',
      'English',
      'Dead',
    ]);
    // Le select de la recherche, lui, liste les colonnes complètes.
    expect(page.all('#t-col option').map((o) => o.textContent)).toEqual([
      'toutes les colonnes',
      'ID',
      'RecruitType',
      'CharacterIDs',
      'NameID',
      'English',
      'French',
      'Dead',
    ]);
    // Rien de tout cela ne redemande la table.
    expect(page.queries).toHaveLength(1);
  });

  it('une cellule `*ID` qui a une cible : un lien par id, en égalité STRICTE sur `ID`', async () => {
    const page = await gamedata({ hash: '#gamedata/RecruitGroupTemplet' });
    const links = page.all('#t-rows tr[data-i="1"] a');
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '#gamedata/CharacterTemplet?col=ID&exact=1&q=2000093',
      '#gamedata/CharacterTemplet?col=ID&exact=1&q=2000085',
    ]);
    // Une cellule vide, ou une colonne sans cible, n'en porte pas.
    expect(page.all('#t-rows tr[data-i="0"] a')).toEqual([]);

    links[1].click();
    await page.settle();
    expect(page.queries.at(-1)).toEqual({
      name: 'CharacterTemplet',
      q: '2000085',
      col: 'ID',
      exact: '1',
      page: '1',
      resolve: '1',
    });
    expect(page.window.location.hash).toBe('#gamedata/CharacterTemplet?col=ID&exact=1&q=2000085');
    expect(page.el('t-pick').value).toBe('CharacterTemplet');
    expect(page.text(page.all('#t-info .t-id strong')[0])).toBe('CharacterTemplet');
    expect(page.el('t-col').value).toBe('ID');
    expect(page.el('t-exact').checked).toBe(true);
    expect(page.cells(0)).toEqual(['2000085', '2000085_Name']);
    // Suivre un lien n'ouvre pas la ligne brute de la ligne quittée.
    expect(page.el('t-raw').hidden).toBe(true);

    // « Précédent » du navigateur : la table quittée revient.
    page.window.history.replaceState(null, '', '#gamedata/RecruitGroupTemplet');
    page.window.dispatchEvent(new page.window.Event('popstate') as never);
    await page.settle();
    expect(page.el('t-pick').value).toBe('RecruitGroupTemplet');
    expect(page.queries.at(-1)).toEqual({
      name: 'RecruitGroupTemplet',
      q: '',
      col: '',
      exact: '0',
      page: '1',
      resolve: '1',
    });
  });

  it('cliquer une ligne ouvre la LIGNE BRUTE : toutes les colonnes, toutes les langues — et « Copier »', async () => {
    const page = await gamedata({ hash: '#gamedata/RecruitGroupTemplet' });
    expect(page.el('t-raw').hidden).toBe(true);

    page.all('#t-rows tr[data-i="1"] td')[0].click();
    expect(page.el('t-raw').hidden).toBe(false);
    expect(page.all('#t-rows tr').map((tr) => tr.getAttribute('aria-selected'))).toEqual([
      'false',
      'true',
    ]);
    expect(page.text(page.el('t-raw-count'))).toBe('6 champs');
    // La langue que le tableau masque y est, et rien n'est résolu.
    expect(page.raw()).toEqual(Object.entries(SEASONAL));

    page.el('t-copy').click();
    await page.settle();
    expect(page.writeText).toHaveBeenCalledWith(JSON.stringify(SEASONAL, null, 2));
    expect(page.el('t-copy').textContent).toBe('copié');

    // Entrée sur une ligne l'ouvre aussi ; la croix referme.
    page.fire(page.all('#t-rows tr[data-i="0"]')[0], 'keydown', 'Enter');
    expect(page.raw()).toEqual(Object.entries(NORMAL));
    page.el('t-raw-close').click();
    expect(page.el('t-raw').hidden).toBe(true);
    expect(page.all('#t-rows tr[aria-selected="true"]')).toEqual([]);
    expect(page.posts).toEqual([]);
  });

  it('« Copier » dit « impossible » quand le presse-papiers se refuse', async () => {
    const page = await gamedata({
      hash: '#gamedata/RecruitGroupTemplet',
      clipboard: { writeText: () => Promise.reject(new Error('refusé')) },
    });
    page.all('#t-rows tr[data-i="0"] td')[0].click();
    page.el('t-copy').click();
    await page.settle();
    expect(page.el('t-copy').textContent).toBe('impossible');
  });

  it('`&row=<n>` dans le hash montre la ligne brute de la n-ième ligne (le banc ne clique pas)', async () => {
    const page = await gamedata({ hash: '#gamedata/RecruitGroupTemplet?row=1' });
    expect(page.el('t-raw').hidden).toBe(false);
    expect(page.raw()).toEqual(Object.entries(SEASONAL));
    // Le rang ne part pas au serveur.
    expect(page.queries).toEqual([
      { name: 'RecruitGroupTemplet', q: '', col: '', exact: '0', page: '1', resolve: '1' },
    ]);
  });

  it('la pagination : « N lignes sur T », « page N / M », précédent et suivant', async () => {
    const page = await gamedata({ hash: '#gamedata/RecruitGroupTemplet' });
    expect(page.text(page.el('t-count'))).toBe('120 lignes sur 177');
    expect(page.text(page.el('t-page'))).toBe('page 1 / 3');
    expect(page.el('t-prev').disabled).toBe(true);
    expect(page.el('t-next').disabled).toBe(false);

    page.el('t-next').click();
    await page.settle();
    page.el('t-next').click();
    await page.settle();
    expect(page.queries.map((q) => q.page)).toEqual(['1', '2', '3']);
    expect(page.text(page.el('t-page'))).toBe('page 3 / 3');
    expect(page.el('t-prev').disabled).toBe(false);
    expect(page.el('t-next').disabled).toBe(true);

    page.el('t-prev').click();
    await page.settle();
    expect(page.queries.at(-1)?.page).toBe('2');
    expect(page.text(page.el('t-page'))).toBe('page 2 / 3');

    // Une table sans ligne qui corresponde le dit, sur une seule page.
    const empty = await gamedata({
      hash: '#gamedata/RecruitGroupTemplet',
      rows: () => recruit({ rows: [], matched: 0 }),
    });
    expect(empty.text(empty.el('t-count'))).toBe('0 ligne sur 177');
    expect(empty.text(empty.el('t-page'))).toBe('page 1 / 1');
    expect(empty.el('t-no-rows').hidden).toBe(false);
    expect(empty.el('t-next').disabled).toBe(true);
  });

  it('la recherche : UNE requête 200 ms après la dernière frappe, la colonne, « exact », « résoudre les textes »', async () => {
    const page = await gamedata({ hash: '#gamedata/RecruitGroupTemplet' });
    page.el('t-next').click();
    await page.settle();
    expect(page.queries).toHaveLength(2);

    vi.useFakeTimers();
    page.type(page.el('t-q'), 'pi');
    page.type(page.el('t-q'), 'pickup');
    await vi.advanceTimersByTimeAsync(199);
    expect(page.queries).toHaveLength(2);
    await vi.advanceTimersByTimeAsync(1);
    // La recherche repart de la première page.
    expect(page.queries.slice(2)).toEqual([
      { name: 'RecruitGroupTemplet', q: 'pickup', col: '', exact: '0', page: '1', resolve: '1' },
    ]);
    vi.useRealTimers();
    await page.settle();

    // « exact » porte sur une colonne : éteinte sans elle.
    expect(page.el('t-exact').disabled).toBe(true);
    page.el('t-col').value = 'RecruitType';
    page.fire(page.el('t-col'), 'change');
    await page.settle();
    expect(page.el('t-exact').disabled).toBe(false);
    await page.check('t-exact', true);
    await page.check('t-resolve', false);
    expect(page.queries.slice(3).map((q) => [q.q, q.col, q.exact, q.resolve])).toEqual([
      ['pickup', 'RecruitType', '0', '1'],
      ['pickup', 'RecruitType', '1', '1'],
      ['pickup', 'RecruitType', '1', '0'],
    ]);

    // Revenir à « toutes les colonnes » lève l'égalité stricte.
    page.el('t-col').value = '';
    page.fire(page.el('t-col'), 'change');
    await page.settle();
    expect(page.el('t-exact').checked).toBe(false);
    expect(page.el('t-exact').disabled).toBe(true);
    expect(page.queries.at(-1)).toMatchObject({ col: '', exact: '0', resolve: '0' });
    expect(page.posts).toEqual([]);
  });

  it('« Recalculer » relit les sources au serveur, et redessine ce qu’il dit maintenant', async () => {
    const page = await gamedata({ hash: '#gamedata/AreaTemplet' });
    expect(page.all('#t-info .t-unread')).toHaveLength(1);

    page.served.catalog = catalog({
      tables: [
        table('AreaTemplet', 512, [reader('generators/areas')], 'Générateur — ZONES.'),
        ...catalog().tables.filter((t) => t.name !== 'AreaTemplet'),
      ],
      used: 3,
      readers: 3,
    });
    page.el('t-recompute').click();
    await page.settle();
    expect(page.reads).toEqual(['/api/gamedata/tables', '/api/gamedata/tables?recompute=1']);
    expect(page.text(page.el('t-total'))).toBe('4 tables · 3 lues par 3 fichiers');
    expect(page.text(page.all('#t-info .t-id .badge')[0])).toBe('utilisée · 1');
    expect(page.all('#t-info .t-reader').map((c) => c.textContent)).toEqual(['generators/areas']);
    expect(page.el('t-recompute').disabled).toBe(false);
    // La table ouverte n'est pas relue.
    expect(page.queries).toHaveLength(1);
    expect(page.posts).toEqual([]);
  });

  it('sans données du jeu : le message du serveur, et aucune suggestion', async () => {
    const page = await gamedata({
      hash: '#gamedata',
      catalog: {
        tables: [],
        used: 0,
        readers: 0,
        hiddenColumns: [],
        error: 'Pas de données du jeu : lancer un patch (pull) d’abord.',
      },
    });
    expect(page.text(page.el('t-none'))).toBe(
      'Pas de données du jeu : lancer un patch (pull) d’abord.',
    );
    expect(page.text(page.el('t-total'))).toBe('');
    page.fire(page.el('t-pick'), 'focus');
    expect(page.el('t-results').hidden).toBe(true);
    expect(page.el('t-card').hidden).toBe(true);
  });

  it('une table que le serveur refuse passe par le journal', async () => {
    const page = await gamedata({ hash: '#gamedata/RecruitRateTemplet' });
    expect(page.queries).toHaveLength(1);
    expect(page.el('journal').dataset.state).toBe('ko');
    expect(page.text(page.el('log'))).toBe(
      'Table RecruitRateTemplet illisible : Error: table inconnue : RecruitRateTemplet',
    );
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
          sheet?: string;
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
    ).toEqual([
      ['dashboard', 'Tableau de bord'],
      ['patch', 'Patch'],
    ]);
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
        '3 fichiers modifiésou non suivis — un enregistrement ne committe que ses fichiers',
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

  it('les tags morts d’un perso : un lien vers sa fiche dans quick, pas vers l’admin', async () => {
    const [tags, ...rest] = busy().inbox ?? [];
    const page = await dashboard({
      state: busy({ inbox: [{ ...tags, sheet: 'character/2000012/pros-cons' }, ...rest] }),
    });
    expect(page.rows('h-inbox')[0]).toEqual([
      'danger',
      'Dead inline tags2 tag(s) resolve to nothingfiche du perso ↗',
      false,
    ]);
    // Un nouvel onglet de quick : la fiche lit ce hash à son chargement.
    expect(
      page.all('#h-inbox a').map((a) => [a.getAttribute('href'), a.getAttribute('target')]),
    ).toEqual([
      ['#character/2000012/pros-cons', '_blank'],
      ['https://outerpedia.local/admin/extractor/characters', '_blank'],
    ]);
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

    // La section « Patch » existe : un bouton y mène.
    expect(await game({ version: '1.11.405', client: 'ahead' })).toEqual([
      ['warn', 'site 1.11.404 · client 1.11.405un patch attendOnglet Patch', true],
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
        '1 fichier modifiéou non suivis — un enregistrement ne committe que ses fichiers',
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

  it('un patch attend : « Onglet Patch » ouvre la section, seconde du groupe', async () => {
    const page = await dashboard({
      state: quiet({
        game: { site: '1.11.404', version: '1.11.405', client: 'ahead', proposal: false },
      }),
    });
    (
      page.all('#h-game button').find((b) => page.text(b) === 'Onglet Patch') as HTMLElement
    ).click();
    expect(page.el('tab-patch').hidden).toBe(false);
    expect(page.el('tab-dashboard').hidden).toBe(true);
    expect(page.all('#groups [data-group="home"]')[0].getAttribute('aria-selected')).toBe('true');
    expect(page.all('#tabs [data-tab="patch"]')[0].getAttribute('aria-selected')).toBe('true');
    expect(page.all('main')[0].classList.contains('wide')).toBe(true);
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

describe('Patch — la page, sur le vrai markup', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  interface State {
    job: string | null;
    source: 'steam' | 'android';
    steam: boolean;
    site: string | null;
    client: string | null;
    checkpoint: { steam: string | null; android: string | null };
    git: { branch: string; ahead: number | null; behind: number; dirty: number } | null;
    messageMax: number;
    errors: Record<string, string>;
  }

  /** Un poste au repos : le client en avance d'un patch, trois fichiers modifiés. */
  const idle = (over: Partial<State> = {}): State => ({
    job: null,
    source: 'steam',
    steam: true,
    site: '1.11.402',
    client: '1.11.404',
    checkpoint: { steam: null, android: null },
    git: { branch: 'main', ahead: 0, behind: 0, dirty: 3 },
    messageMax: 200,
    errors: {},
    ...over,
  });

  type Call = { path: string; body: unknown };

  /**
   * Le flux d'un geste, TENU par le test : il y pousse des lignes NDJSON quand
   * il veut, puis le clôt — la page est observée pendant que le travail court.
   */
  function heldStream() {
    const queue: (Uint8Array | null)[] = [];
    let wake: (() => void) | null = null;
    const put = (chunk: Uint8Array | null) => {
      queue.push(chunk);
      wake?.();
    };
    return {
      /** Une ligne du flux : `{ step }`, `{ done }`, ou une réponse d'une pièce. */
      send: (line: unknown) => put(new TextEncoder().encode(`${JSON.stringify(line)}\n`)),
      /** Un morceau brut, tel quel : plusieurs lignes d'un coup. */
      raw: (text: string) => put(new TextEncoder().encode(text)),
      close: () => put(null),
      body: {
        getReader: () => ({
          read: async () => {
            while (!queue.length) await new Promise<void>((done) => (wake = done));
            const chunk = queue.shift();
            return chunk ? { value: chunk } : { done: true };
          },
        }),
      },
    };
  }

  /**
   * La page de quick dans un document happy-dom, comme pour le tableau de
   * bord : la VRAIE coquille, le vrai `lib.js` et le vrai `tabs/patch.js` (eux
   * seuls). `fetch` est factice : il sert `served.state`, répond à « Arrêter »,
   * et rend à chaque geste un flux que le test tient (`streams`). Aucune
   * commande n'existe ici.
   */
  async function patch(opts: { state?: Partial<State>; hash?: string; stop?: unknown } = {}) {
    vi.resetModules();
    const window = new Window({ url: `http://localhost:4747/${opts.hash ?? '#patch'}` });
    const { document } = window;
    const page = assemblePage(shell(), readTab);
    document.body.innerHTML = (/<body>([\s\S]*)<\/body>/.exec(page)?.[1] ?? '').replace(
      /<script[\s\S]*?<\/script>/g,
      '',
    );

    const served = { state: idle(opts.state), reads: 0 };
    const calls: Call[] = [];
    const streams: ReturnType<typeof heldStream>[] = [];
    const confirm = vi.fn(() => true);
    const writeText = vi.fn<(text: string) => Promise<void>>(() => Promise.resolve());
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
      if (init) calls.push({ path, body: init.body ? JSON.parse(init.body) : undefined });
      if (path === '/api/patch/state') {
        served.reads += 1;
        return answer(served.state);
      }
      if (path === '/api/patch/stop')
        return answer(opts.stop ?? { ok: true, stopped: 'dry-run de la promotion' });
      if (init) {
        const held = heldStream();
        streams.push(held);
        return { ok: true, body: held.body };
      }
      return answer({ imgBase: 'https://img.test', host: 'banc', port: 4747 });
    });

    vi.stubGlobal('window', window);
    vi.stubGlobal('document', document);
    vi.stubGlobal('location', window.location);
    vi.stubGlobal('history', window.history);
    vi.stubGlobal('fetch', fetch);
    vi.stubGlobal('confirm', confirm);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    vi.stubGlobal('Event', window.Event);

    const lib = (await import(/* @vite-ignore */ resolve(UI, 'lib.js'))) as {
      sections: { start: () => void };
    };
    await import(/* @vite-ignore */ resolve(UI, 'tabs', 'patch.js'));
    lib.sections.start();
    /** Laisse la page lire ce qui est arrivé — sous de faux minuteurs aussi. */
    const settle = async () => {
      for (let i = 0; i < 4; i++)
        if (vi.isFakeTimers()) await vi.advanceTimersByTimeAsync(0);
        else await new Promise((done) => setTimeout(done, 0));
    };
    await settle();

    const el = (id: string) => document.getElementById(id) as unknown as HTMLInputElement;
    const all = (selector: string) =>
      [...document.querySelectorAll(selector)] as unknown as HTMLElement[];
    const text = (node: Element | null | undefined) =>
      (node?.textContent ?? '').replace(/\s+/g, ' ').trim();
    const BUTTONS = ['p-refresh', 'p-dry', 'p-apply', 'p-commit'];
    return {
      el,
      all,
      text,
      served,
      calls,
      streams,
      confirm,
      writeText,
      settle,
      fire: (target: HTMLElement, type: string) =>
        target.dispatchEvent(new window.Event(type, { bubbles: true }) as unknown as Event),
      /** Le flux du dernier geste lancé. */
      stream: () => streams[streams.length - 1],
      /** Le dernier flux reçoit ces lignes de sortie, puis son issue, et se clôt. */
      async finish(done: unknown, steps: string[] = []) {
        const held = streams[streams.length - 1];
        for (const step of steps) held.send({ step });
        held.send({ done });
        held.close();
        await settle();
      },
      /** Éteints ? Les quatre gestes, dans l'ordre du flux. */
      disabled: () => BUTTONS.map((id) => el(id).disabled),
      /** L'état de chaque étape, à droite de sa tête. */
      states: () =>
        ['p-refresh-state', 'p-review-state', 'p-apply-state', 'p-commit-state'].map((id) =>
          text(el(id)),
        ),
      console: () => el('p-console').textContent ?? '',
    };
  }

  const OK = (label: string) => ({ ok: true, code: 0, log: [`${label} : terminé.`] });
  const KO = (label: string) => ({
    ok: false,
    code: 1,
    log: [
      '✗ ça casse',
      `${label} : échec (code 1) — toute la sortie est dans la console de « Patch ».`,
    ],
  });

  it('la section est servie, seconde du groupe Accueil, en pleine largeur', async () => {
    const page = await patch();
    expect(
      page.all('#tabs [data-group="home"]').map((b) => [b.dataset.tab, b.textContent, b.hidden]),
    ).toEqual([
      ['dashboard', 'Tableau de bord', false],
      ['patch', 'Patch', false],
    ]);
    expect(
      page
        .all('main > section')
        .filter((s) => !s.hidden)
        .map((s) => s.id),
    ).toEqual(['tab-patch']);
    expect(page.all('#groups [data-group="home"]')[0].getAttribute('aria-selected')).toBe('true');
    expect(page.all('#tabs [data-tab="patch"]')[0].getAttribute('aria-selected')).toBe('true');
    expect(page.all('main')[0].classList.contains('wide')).toBe(true);
    // Elle lit son état en venant à l'écran, et ne poste rien.
    expect(page.served.reads).toBe(1);
    expect(page.calls).toEqual([]);

    // Ouverte ailleurs, elle ne lit rien avant qu'on y vienne.
    const elsewhere = await patch({ hash: '#coupons' });
    expect(elsewhere.served.reads).toBe(0);
    elsewhere.all('#groups [data-group="home"]')[0].click();
    expect(elsewhere.el('tab-dashboard').hidden).toBe(false);
    elsewhere.all('#tabs [data-tab="patch"]')[0].click();
    await elsewhere.settle();
    expect(elsewhere.el('tab-patch').hidden).toBe(false);
    expect(elsewhere.served.reads).toBe(1);
  });

  it('les quatre cartes au repos, dans l’ordre du flux, puis la console', async () => {
    const page = await patch();
    expect(page.all('#tab-patch > .card').map((c) => c.getAttribute('aria-label'))).toEqual([
      'Rafraîchir depuis le jeu',
      'Revue de la promotion',
      'Promouvoir',
      'Committer les données',
      'Console',
    ]);
    expect(page.all('#tab-patch > .card .card-head strong').map((s) => page.text(s))).toEqual([
      '1 · Rafraîchir depuis le jeu',
      '2 · Revue de la promotion',
      '3 · Promouvoir',
      '4 · Committer les données',
      'Console',
    ]);
    expect(page.states()).toEqual([
      'client 1.11.404 · site 1.11.402 — un patch attend',
      'pas encore de dry-run',
      'après un dry-run réussi',
      '3 fichiers modifiés',
    ]);
    // Chaque carte a son bouton ; seul « Promouvoir » attend la revue.
    expect(
      ['p-refresh', 'p-dry', 'p-apply', 'p-commit'].map((id) => page.text(page.el(id))),
    ).toEqual(['Lancer', 'Dry-run', 'Promouvoir (--apply)', 'Committer (pnpm commit)']);
    expect(page.disabled()).toEqual([false, false, true, false]);
    // Les options de « Rafraîchir », comme `pnpm dev` : images et notes cochées.
    expect(['p-force', 'p-nopull', 'p-collect', 'p-news'].map((id) => page.el(id).checked)).toEqual(
      [false, false, true, true],
    );
    expect(
      page
        .all('input[name="p-source"]')
        .map((r) => [(r as HTMLInputElement).value, (r as HTMLInputElement).checked]),
    ).toEqual([
      ['steam', true],
      ['android', false],
    ]);
    expect(page.el('p-resume').hidden).toBe(true);
    // Le commit : message prérempli au jour du poste, borné, bump `patch`.
    expect(page.el('p-message').value).toMatch(/^chore\(data\): patch du \d\d\/\d\d$/);
    expect(page.el('p-message').maxLength).toBe(200);
    expect(page.el('p-bump').value).toBe('patch');
    expect(page.all('#p-bump option').map((o) => (o as HTMLOptionElement).value)).toEqual([
      'patch',
      'minor',
      'major',
    ]);
    expect(page.text(page.all('[aria-label="Committer les données"] .p-note')[0])).toContain(
      'Le commit lance format, lint, typecheck et tests : compter dix minutes.',
    );
    expect(page.text(page.all('[aria-label="Promouvoir"] .actions')[0])).toContain(
      "Les persos pas encore intégrés dans l'admin ne partent pas",
    );
    // La console : vide, au repos, « Arrêter » absent, la revue pas encore là.
    expect(page.console()).toBe('');
    expect(page.text(page.el('p-console-state'))).toBe('au repos');
    expect(page.el('p-stop').hidden).toBe(true);
    expect(page.el('p-review').hidden).toBe(true);
    expect(readFileSync(resolve(UI, 'tabs', 'patch.css'), 'utf8')).toMatch(
      /#p-console \{\s*height: 40vh;/,
    );
    // L'en-tête suit le dépôt : rien à pousser.
    expect(page.el('push').disabled).toBe(true);
  });

  it('l’état du poste : sans client Steam, source Android, reprise, dépôt', async () => {
    const none = await patch({
      state: { steam: false, client: null, source: 'android', site: '1.11.404' },
    });
    expect(none.states()[0]).toBe('pas de client Steam · site 1.11.404');
    expect(none.el('p-refresh-state').title).toContain('Android reste possible');
    expect(none.disabled()[0]).toBe(false);
    expect(none.all('input[name="p-source"]').map((r) => (r as HTMLInputElement).checked)).toEqual([
      false,
      true,
    ]);

    // À jour : pas de « un patch attend ».
    const same = await patch({ state: { client: '1.11.404', site: '1.11.404' } });
    expect(same.states()[0]).toBe('client 1.11.404 · site 1.11.404');
    expect(same.el('p-refresh-state').className).toBe('p-state');

    // Une reprise attend : dite pour la source choisie, et elle seule.
    const resume = await patch({
      state: { checkpoint: { steam: '2026-10-08T12:30:00.000Z', android: null } },
    });
    expect(resume.el('p-resume').hidden).toBe(false);
    expect(resume.text(resume.el('p-resume'))).toMatch(
      /^une reprise attend \(checkpoint du \d\d\/\d\d.{1,3}\d\d:\d\d\) : « Lancer » reprend/,
    );
    const android = resume.all('input[name="p-source"]')[1] as HTMLInputElement;
    android.checked = true;
    resume.fire(android, 'change');
    expect(resume.el('p-resume').hidden).toBe(true);

    // Rien de modifié : rien à committer ; des commits attendent : dit.
    const clean = await patch({
      state: { git: { branch: 'main', ahead: 2, behind: 0, dirty: 0 } },
    });
    expect(clean.states()[3]).toBe(
      'aucun fichier modifié · 2 commits à pousser — « Pousser », dans l’en-tête',
    );
    expect(clean.disabled()).toEqual([false, false, true, true]);
    expect(clean.el('p-commit').title).toBe('Aucun fichier modifié : rien à committer');
    expect(clean.el('push').disabled).toBe(false);
    expect(clean.text(clean.el('push-count'))).toBe('2');

    // Dépôt illisible : dit dans la carte, et le commit reste tentable.
    const blind = await patch({ state: { git: null, errors: { git: 'git status a échoué' } } });
    expect(blind.states()[3]).toBe('dépôt illisible : git status a échoué');
    expect(blind.disabled()[3]).toBe(false);
  });

  it('« Lancer » : les options cochées partent, la console reçoit les lignes au fil', async () => {
    const page = await patch();
    page.el('p-force').checked = true;
    page.el('p-news').checked = false;
    page.el('p-refresh').click();
    await page.settle();
    expect(page.calls).toEqual([
      {
        path: '/api/patch/refresh',
        body: { source: 'steam', force: true, noPull: false, collect: true, news: false },
      },
    ]);

    // Pendant le travail : les quatre gestes et « Pousser » éteints, « Arrêter » là.
    expect(page.disabled()).toEqual([true, true, true, true]);
    expect(page.el('push').disabled).toBe(true);
    expect(page.el('p-stop').hidden).toBe(false);
    expect(page.el('p-refresh').classList.contains('busy')).toBe(true);
    expect(page.text(page.el('p-console-state'))).toBe('en cours : rafraîchissement depuis le jeu');
    expect(page.el('journal').dataset.state).toBe('run');
    expect(page.text(page.el('journal-last'))).toBe('rafraîchissement depuis le jeu');

    page.stream().send({ step: '$ pnpm datagen:patch --source steam --force --collect' });
    page.stream().send({ step: '▶ pull (client Steam → .gamedata)' });
    await page.settle();
    expect(page.console()).toBe(
      '$ pnpm datagen:patch --source steam --force --collect\n▶ pull (client Steam → .gamedata)\n',
    );
    // Le journal de l'en-tête : la ligne en cours, sans empiler la sortie.
    expect(page.el('journal').dataset.state).toBe('run');
    expect(page.text(page.el('journal-last'))).toBe('▶ pull (client Steam → .gamedata)');
    expect(page.el('log').children).toHaveLength(1);
    // Une ligne vide va à la console, pas au journal.
    page.stream().send({ step: '' });
    await page.settle();
    expect(page.text(page.el('journal-last'))).toBe('▶ pull (client Steam → .gamedata)');
    expect(page.disabled()).toEqual([true, true, true, true]);

    page.served.state = idle({ client: '1.11.404', site: '1.11.402' });
    await page.finish(OK('rafraîchissement depuis le jeu (Steam)'), ['✅ refresh terminé.']);
    expect(page.console()).toBe(
      '$ pnpm datagen:patch --source steam --force --collect\n▶ pull (client Steam → .gamedata)\n\n✅ refresh terminé.\n',
    );
    expect(page.el('journal').dataset.state).toBe('ok');
    expect(page.text(page.el('journal-last'))).toBe(
      'rafraîchissement depuis le jeu (Steam) : terminé.',
    );
    // Fini : l'état est relu, les boutons reviennent, « Arrêter » repart.
    expect(page.served.reads).toBe(2);
    expect(page.disabled()).toEqual([false, false, true, false]);
    expect(page.el('p-stop').hidden).toBe(true);
    expect(page.el('p-refresh').classList.contains('busy')).toBe(false);
    expect(page.text(page.el('p-console-state'))).toBe('4 lignes');
    // Rien n'a demandé confirmation.
    expect(page.confirm).not.toHaveBeenCalled();
  });

  it('« Promouvoir » : éteint avant un dry-run réussi, allumé après, éteint après un échec', async () => {
    const page = await patch();
    expect(page.el('p-apply').disabled).toBe(true);

    page.el('p-dry').click();
    await page.settle();
    expect(page.calls.at(-1)).toEqual({ path: '/api/patch/promote', body: { apply: false } });
    expect(page.states()[1]).toBe('dry-run en cours…');
    // La revue est à l'écran dès le lancement, et reçoit SA copie de la sortie.
    expect(page.el('p-review').hidden).toBe(false);
    await page.finish(OK('dry-run de la promotion'), [
      '$ pnpm datagen:promote',
      '~ characters.json : 2 modifiées (2000095, 2000101)',
      '(dry-run — rien n’a été écrit ; relance avec --apply pour valider)',
    ]);
    const review =
      '$ pnpm datagen:promote\n~ characters.json : 2 modifiées (2000095, 2000101)\n(dry-run — rien n’a été écrit ; relance avec --apply pour valider)\n';
    expect(page.el('p-review').textContent).toBe(review);
    expect(page.console()).toBe(review);
    expect(page.states()[1]).toMatch(/^dry-run réussi à \d\d:\d\d$/);
    expect(page.states()[2]).toBe('prêt : la revue est au-dessus');
    expect(page.disabled()).toEqual([false, false, false, false]);

    // Un dry-run en échec : la revue repart de zéro, « Promouvoir » s'éteint.
    page.el('p-dry').click();
    await page.settle();
    expect(page.el('p-review').textContent).toBe('');
    await page.finish(KO('dry-run de la promotion'), ['✗ data/extracted absent']);
    expect(page.el('p-review').textContent).toBe('✗ data/extracted absent\n');
    expect(page.states()[1]).toMatch(/^dry-run en échec à \d\d:\d\d$/);
    expect(page.el('p-review-state').className).toBe('p-state ko');
    expect(page.disabled()).toEqual([false, false, true, false]);
    // L'échec : la fin de la sortie et le verdict, au journal déplié.
    expect(page.el('journal').dataset.state).toBe('ko');
    expect([...page.el('log').children].map((d) => d.textContent)).toEqual([
      '✗ ça casse',
      'dry-run de la promotion : échec (code 1) — toute la sortie est dans la console de « Patch ».',
    ]);

    // De nouveau réussi, puis promu — sans confirmation : le dry-run EST la revue.
    page.el('p-dry').click();
    await page.settle();
    await page.finish(OK('dry-run de la promotion'), ['~ items.json : 1 ajoutée']);
    expect(page.el('p-apply').disabled).toBe(false);
    page.el('p-apply').click();
    await page.settle();
    expect(page.confirm).not.toHaveBeenCalled();
    expect(page.calls.at(-1)).toEqual({ path: '/api/patch/promote', body: { apply: true } });
    expect(page.el('p-apply').classList.contains('busy')).toBe(true);
    await page.finish(OK('promotion de l’extraction'), ['✓ 1 fichier(s) promu(s)']);
    // La revue du dry-run reste lisible ; une autre promotion demande un autre dry-run.
    expect(page.el('p-review').textContent).toBe('~ items.json : 1 ajoutée\n');
    expect(page.states()[2]).toMatch(/^promue à \d\d:\d\d — reste à committer$/);
    expect(page.el('p-apply').disabled).toBe(true);
    expect(page.calls.map((c) => c.path)).toEqual([
      '/api/patch/promote',
      '/api/patch/promote',
      '/api/patch/promote',
      '/api/patch/promote',
    ]);
  });

  it('une revue ne survit pas à un rafraîchissement, ni à une promotion en échec', async () => {
    const page = await patch();
    page.el('p-dry').click();
    await page.settle();
    await page.finish(OK('dry-run de la promotion'));
    expect(page.el('p-apply').disabled).toBe(false);

    // La proposition va changer : la revue faite ne vaut plus.
    page.el('p-refresh').click();
    await page.settle();
    await page.finish(OK('rafraîchissement depuis le jeu (Steam)'));
    expect(page.el('p-apply').disabled).toBe(true);
    expect(page.states()[1]).toBe('dry-run à refaire : la proposition a pu changer');

    page.el('p-dry').click();
    await page.settle();
    await page.finish(OK('dry-run de la promotion'));
    page.el('p-apply').click();
    await page.settle();
    await page.finish(KO('promotion de l’extraction'));
    expect(page.el('p-apply').disabled).toBe(true);
    expect(page.states()[1]).toBe('dry-run à refaire : la proposition a pu changer');
  });

  it('« Committer » : le message et le bump partent, « Pousser » suit le compte rendu', async () => {
    const page = await patch();
    const message = page.el('p-message');
    // Sans message, pas de commit.
    message.value = '   ';
    page.fire(message, 'input');
    expect(page.el('p-commit').disabled).toBe(true);
    message.value = '  chore(data): patch 1.11.404  ';
    page.fire(message, 'input');
    expect(page.el('p-commit').disabled).toBe(false);
    page.el('p-bump').value = 'minor';

    page.el('p-commit').click();
    await page.settle();
    expect(page.calls).toEqual([
      {
        path: '/api/patch/commit',
        body: { message: 'chore(data): patch 1.11.404', bump: 'minor' },
      },
    ]);
    expect(page.disabled()).toEqual([true, true, true, true]);

    // Le commit est fait : plus rien de modifié, un commit à pousser.
    page.served.state = idle({ git: { branch: 'main', ahead: 1, behind: 0, dirty: 0 } });
    await page.finish(
      { ...OK('commit des données'), git: { branch: 'main', ahead: 1, behind: 0 } },
      ['$ pnpm commit --msg "chore(data): patch 1.11.404" --bump minor --yes --no-push'],
    );
    expect(page.el('journal').dataset.state).toBe('ok');
    expect(page.states()[3]).toBe(
      'aucun fichier modifié · 1 commit à pousser — « Pousser », dans l’en-tête',
    );
    expect(page.text(page.el('push-count'))).toBe('1');
    expect(page.el('push').disabled).toBe(false);
    expect(page.disabled()).toEqual([false, false, true, true]);
  });

  it('un refus du serveur (message, 409) passe par le journal, rien ne tourne', async () => {
    const page = await patch();
    page.el('p-dry').click();
    await page.settle();
    // Une réponse d'une pièce, pas un flux : c'est elle, l'issue.
    page.stream().send({ ok: false, error: 'Un travail tourne déjà : git push' });
    page.stream().close();
    await page.settle();
    expect(page.el('journal').dataset.state).toBe('ko');
    expect(page.text(page.el('log'))).toBe('Un travail tourne déjà : git push');
    expect(page.el('p-apply').disabled).toBe(true);
    expect(page.console()).toBe('');

    page.el('p-commit').click();
    await page.settle();
    page.stream().send({
      ok: false,
      log: ['préfixe conventionnel exigé — ex. « chore(data): patch du 06/10 ».'],
    });
    page.stream().close();
    await page.settle();
    expect(page.text(page.el('log'))).toBe(
      'préfixe conventionnel exigé — ex. « chore(data): patch du 06/10 ».',
    );
    expect(page.disabled()).toEqual([false, false, true, false]);
  });

  it('« Arrêter » : visible pendant un travail, sa réponse dans la console', async () => {
    const page = await patch();
    page.el('p-dry').click();
    await page.settle();
    page.stream().send({ step: '$ pnpm datagen:promote' });
    await page.settle();
    expect(page.el('p-stop').hidden).toBe(false);

    page.el('p-stop').click();
    await page.settle();
    expect(page.calls.at(-1)).toEqual({ path: '/api/patch/stop', body: {} });
    expect(page.console()).toBe(
      '$ pnpm datagen:promote\n— arrêt demandé : dry-run de la promotion\n',
    );
    // Le journal reste celui du geste, qui se clôt seul : arrêté n'est pas réussi.
    expect(page.el('journal').dataset.state).toBe('run');
    await page.finish({
      ok: false,
      code: null,
      stopped: true,
      log: ['dry-run de la promotion : arrêté.'],
    });
    expect(page.el('journal').dataset.state).toBe('ko');
    expect(page.text(page.el('log'))).toBe('dry-run de la promotion : arrêté.');
    expect(page.el('p-stop').hidden).toBe(true);
    expect(page.el('p-apply').disabled).toBe(true);
    expect(page.states()[1]).toMatch(/^dry-run en échec/);

    // Un refus d'arrêt se lit dans la console, lui aussi.
    const refused = await patch({ stop: { ok: false, error: 'Aucun travail en cours.' } });
    refused.el('p-dry').click();
    await refused.settle();
    refused.el('p-stop').click();
    await refused.settle();
    expect(refused.console()).toBe('— Aucun travail en cours.\n');
  });

  it('« Copier » rend toute la sortie, « Effacer » vide la console', async () => {
    const page = await patch();
    page.el('p-dry').click();
    await page.settle();
    await page.finish(OK('dry-run de la promotion'), ['$ pnpm datagen:promote', '~ a.json']);
    // Une seconde sortie s'enchaîne, séparée d'une ligne vide.
    page.el('p-dry').click();
    await page.settle();
    await page.finish(OK('dry-run de la promotion'), ['$ pnpm datagen:promote']);
    expect(page.console()).toBe('$ pnpm datagen:promote\n~ a.json\n\n$ pnpm datagen:promote\n');

    vi.useFakeTimers();
    page.el('p-copy').click();
    await vi.advanceTimersByTimeAsync(0);
    expect(page.writeText).toHaveBeenCalledExactlyOnceWith(
      '$ pnpm datagen:promote\n~ a.json\n\n$ pnpm datagen:promote',
    );
    expect(page.text(page.el('p-copy'))).toBe('copié');
    await vi.advanceTimersByTimeAsync(2000);
    expect(page.text(page.el('p-copy'))).toBe('Copier');

    page.el('p-clear').click();
    expect(page.console()).toBe('');
    expect(page.text(page.el('p-console-state'))).toBe('au repos');
    // La revue, elle, garde sa sortie.
    expect(page.el('p-review').textContent).toBe('$ pnpm datagen:promote\n');
    // Presse-papiers refusé : le bouton le dit.
    page.writeText.mockRejectedValueOnce(new Error('NotAllowedError'));
    page.el('p-copy').click();
    await vi.advanceTimersByTimeAsync(0);
    expect(page.text(page.el('p-copy'))).toBe('impossible');
  });

  it('la console n’affiche que la fin d’une sortie très longue — « Copier » garde tout', async () => {
    const page = await patch();
    page.el('p-refresh').click();
    await page.settle();
    const steps = Array.from({ length: 5003 }, (_, i) => `  ${i + 1}/5003 copié(s)…`);
    // D'un bloc, comme une rafale du pull : un seul morceau du flux.
    page.stream().raw(steps.map((step) => `${JSON.stringify({ step })}\n`).join(''));
    await page.finish(OK('rafraîchissement depuis le jeu (Steam)'));
    expect(page.el('p-console').childNodes).toHaveLength(5000);
    expect(page.console().startsWith('  4/5003 copié(s)…\n')).toBe(true);
    expect(page.console().endsWith('  5003/5003 copié(s)…\n')).toBe(true);
    expect(page.text(page.el('p-console-state'))).toBe(
      '5003 lignes — les 5000 dernières affichées',
    );
    page.el('p-copy').click();
    await page.settle();
    expect(page.writeText).toHaveBeenCalledExactlyOnceWith(steps.join('\n'));
  });

  it('un travail tourne déjà (lancé avant) : dit, sans sa sortie, boutons éteints jusqu’à sa fin', async () => {
    vi.useFakeTimers();
    const page = await patch({
      state: { job: 'commit des données', git: { branch: 'main', ahead: 2, behind: 0, dirty: 3 } },
    });
    expect(page.text(page.el('p-console-state'))).toBe(
      'un travail tourne : commit des données — lancé avant, sa sortie n’est pas ici',
    );
    expect(page.console()).toBe('');
    expect(page.disabled()).toEqual([true, true, true, true]);
    // « Pousser » aussi, malgré deux commits en attente ; « Arrêter » est là.
    expect(page.text(page.el('push-count'))).toBe('2');
    expect(page.el('push').disabled).toBe(true);
    expect(page.el('p-stop').hidden).toBe(false);
    expect(page.served.reads).toBe(1);

    // L'état est relu toutes les trois secondes tant que le travail tient.
    await vi.advanceTimersByTimeAsync(3000);
    expect(page.served.reads).toBe(2);
    expect(page.disabled()).toEqual([true, true, true, true]);

    page.served.state = idle({ git: { branch: 'main', ahead: 3, behind: 0, dirty: 0 } });
    await vi.advanceTimersByTimeAsync(3000);
    expect(page.served.reads).toBe(3);
    expect(page.disabled()).toEqual([false, false, true, true]);
    expect(page.el('push').disabled).toBe(false);
    expect(page.text(page.el('push-count'))).toBe('3');
    expect(page.el('p-stop').hidden).toBe(true);
    expect(page.text(page.el('p-console-state'))).toBe('au repos');
    // Fini : plus de relecture.
    await vi.advanceTimersByTimeAsync(10_000);
    expect(page.served.reads).toBe(3);
  });

  it('un travail lancé ailleurs n’est plus relu une fois la section quittée', async () => {
    vi.useFakeTimers();
    const page = await patch({ state: { job: 'git push' } });
    expect(page.served.reads).toBe(1);
    page.all('#tabs [data-tab="dashboard"]')[0].click();
    // La relecture déjà armée part une fois, puis plus rien.
    await vi.advanceTimersByTimeAsync(3000);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(page.served.reads).toBe(2);
  });
});
