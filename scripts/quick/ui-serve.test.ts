import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { describe, expect, it } from 'vitest';
import { openTab, tabsOf as menuTabs } from './shot.mjs';
import { UI_TYPES, assemblePage, resolveUiFile, tabsOf } from './ui-serve';

const UI = resolve(import.meta.dirname, 'ui');
const TABS = ['coupons', 'comics', 'videos', 'ranks', 'gear', 'discord'];

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

  it('assemble la vraie page : six sections, plus aucun marqueur', () => {
    expect(tabsOf(shell())).toEqual(TABS);
    const page = assemblePage(shell(), readTab);
    expect(page).not.toContain('@tab');
    expect(
      [...page.matchAll(/<section id="tab-([a-z0-9-]+)"( hidden)?>/g)].map((m) => m[1]),
    ).toEqual(TABS);
    // Les sections sont dans `<main>`, avant le journal.
    expect(page.indexOf('<main>')).toBeLessThan(page.indexOf('<section id="tab-coupons">'));
    expect(page.indexOf('</section>', page.indexOf('id="tab-discord"'))).toBeLessThan(
      page.indexOf('<div id="log">'),
    );
  });

  it('chaque onglet de la coquille a ses deux fichiers, son bouton et son import', () => {
    const page = shell();
    for (const tab of TABS) {
      expect(existsSync(resolve(UI, 'tabs', `${tab}.js`)), `${tab}.js`).toBe(true);
      expect(readTab(tab), `${tab}.html`).toMatch(new RegExp(`^<section id="tab-${tab}"`));
      expect(page).toContain(`import '/ui/tabs/${tab}.js';`);
      expect(readFileSync(resolve(UI, 'tabs', `${tab}.js`), 'utf8')).toContain(
        `sections.register('${tab}', {`,
      );
    }
    expect(menuTabs(page)).toEqual(TABS);
    // Et rien dans `tabs/` que la coquille ne réclame pas.
    expect(readdirSync(resolve(UI, 'tabs')).sort()).toEqual(
      TABS.flatMap((t) => [`${t}.html`, `${t}.js`]).sort(),
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
    expect(html).toContain('<button data-tab="ranks" aria-selected="true">');
    expect(html.match(/aria-selected="true"/g)).toHaveLength(1);
    expect(html).toContain('<section id="tab-ranks">');
    expect(html.match(/<section id="tab-[a-z0-9-]+" hidden>/g)).toHaveLength(TABS.length - 1);
  });

  it('pose l’image d’attente juste avant </body>', () => {
    expect(openTab(page(), 'coupons', 1200)).toMatch(
      /<img src="\/__settle\?ms=1200" alt="" hidden \/>\n<\/body>/,
    );
  });

  it('refuse un onglet que le menu ne porte pas', () => {
    expect(() => openTab(page(), 'nope', 0)).toThrow(/onglet inconnu/);
  });
});
