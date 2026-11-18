/**
 * Le guide se REND dans les six langues. parse-text y tourne en STRICT : une
 * balise morte, un nom officiel de mode absent du glossaire ou une icône de set
 * manquante jettent — au build de prod seulement, sans ce test (la gate de dev
 * ne fait pas de build).
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LANGS } from '@/lib/i18n/config';
import TerminologyGuide from './index';

describe('terminology — rendu', () => {
  it.each(LANGS)('%s : la page se rend, sections et termes compris', async (lang) => {
    const html = renderToStaticMarkup(await TerminologyGuide({ lang }));
    for (const id of [
      'tldr',
      'combat',
      'stats',
      'gear',
      'heroes-pulls',
      'roles',
      'content',
      'community-slang',
    ]) {
      expect(html, id).toContain(`<section id="${id}"`);
    }
    // 12 + 13 + 11 + 7 + 9 + 9 + 9 termes.
    expect(html.match(/<dt /g)).toHaveLength(70);
    // Les jetons du filtre sont remplacés, aucune balise ne reste en clair.
    expect(html).not.toContain('{filter}');
    expect(html).not.toContain('{advanced}');
    expect(html).not.toMatch(/\{[A-Z-]+\//);
  });
});
