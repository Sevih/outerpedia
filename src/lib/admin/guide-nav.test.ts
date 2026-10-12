/**
 * La RÈGLE DE VISIBILITÉ des catégories de guides, côté outils (lot F18) : une
 * catégorie dont TOUS les guides sont cachés ne se propose plus — ni dans le
 * menu de l'admin, ni dans la vue d'ensemble de quick. C'est la règle de
 * `visibleCategorySlugs` du site, et c'est elle qui fait sortir Adventure
 * License (26 guides, tous cachés) des menus SANS la retirer de `GUIDE_SPECS`,
 * que les tests de specs lisent.
 *
 * Et le MENU de l'admin : les guides de boss sont portés dans quick, leurs
 * liens sortent ; `general-guides` reste (lot F19). Les guides sont FACTICES :
 * ceux du jour bougent, et c'est la règle qu'on garde, pas le corpus.
 */
import { describe, expect, it } from 'vitest';
import { GUIDE_SPECS } from './guide-draft';
import {
  GUIDE_EDITOR_CATEGORIES,
  adminGuideMenu,
  categoriesWithVisibleGuide,
  hasVisibleGuide,
  isGuideCategoryInQuick,
  type VisibleGuideLike,
} from './guide-nav';

const guides: VisibleGuideLike[] = [
  { category: 'joint-challenge' },
  { category: 'joint-challenge', hidden: false },
  { category: 'adventure-license', hidden: true },
  { category: 'adventure-license', hidden: true },
  { category: 'monad-gate', hidden: true },
  { category: 'general-guides' },
  { category: 'special-request', hidden: true },
  { category: 'special-request' },
];

describe('categoriesWithVisibleGuide — au moins un guide visible', () => {
  it('garde les catégories qui ont un guide visible, dans l’ordre demandé', () => {
    expect(
      categoriesWithVisibleGuide(
        ['special-request', 'adventure-license', 'joint-challenge', 'monad-gate'],
        guides,
      ),
    ).toEqual(['special-request', 'joint-challenge']);
  });

  it('une catégorie dont TOUS les guides sont cachés n’y est pas — Adventure License, Monad Gate', () => {
    expect(categoriesWithVisibleGuide(['adventure-license', 'monad-gate'], guides)).toEqual([]);
    expect(hasVisibleGuide('adventure-license', guides)).toBe(false);
  });

  it('une catégorie sans aucun guide n’y est pas non plus', () => {
    expect(categoriesWithVisibleGuide(['world-boss'], guides)).toEqual([]);
    expect(hasVisibleGuide('world-boss', guides)).toBe(false);
  });

  it('un seul guide visible suffit, même parmi des cachés', () => {
    expect(hasVisibleGuide('special-request', guides)).toBe(true);
  });

  it('sur le corpus RÉEL : Adventure License est morte, les autres éditables vivent', () => {
    // Lecture seule du scan du site — c'est l'agacement de Sevih (« certaines
    // catégories n'existent plus, genre les AL ») que la règle corrige.
    expect(hasVisibleGuide('adventure-license')).toBe(false);
    for (const slug of Object.keys(GUIDE_SPECS).filter((s) => s !== 'adventure-license'))
      expect(hasVisibleGuide(slug), slug).toBe(true);
  });
});

describe('adminGuideMenu — ce que le menu de l’admin propose encore', () => {
  it('toutes les catégories de GUIDE_SPECS sont portées dans quick', () => {
    for (const slug of Object.keys(GUIDE_SPECS)) expect(isGuideCategoryInQuick(slug)).toBe(true);
    expect(isGuideCategoryInQuick('general-guides')).toBe(false);
  });

  it('ne garde que general-guides : les guides de boss sont dans quick, AL est morte', () => {
    expect(adminGuideMenu(guides)).toEqual([{ slug: 'general-guides', label: 'General guides' }]);
  });

  it('general-guides sort aussi si tous ses guides étaient cachés', () => {
    expect(adminGuideMenu([{ category: 'general-guides', hidden: true }])).toEqual([]);
  });

  it('GUIDE_EDITOR_CATEGORIES reste le catalogue complet, libellés compris', () => {
    // Les libellés servent aux pages de l'admin par leur URL, et à la liste
    // « Wired types » ; la règle du menu n'y retire rien.
    expect(GUIDE_EDITOR_CATEGORIES.map((c) => c.slug)).toEqual([
      ...Object.keys(GUIDE_SPECS),
      'general-guides',
    ]);
    expect(GUIDE_EDITOR_CATEGORIES.find((c) => c.slug === 'adventure-license')?.label).toBe(
      'Adventure License',
    );
  });
});
