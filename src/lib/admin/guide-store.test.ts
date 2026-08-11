/**
 * CONFINEMENT des écritures de guides (audit F6). Ces entrées viennent de l'URL
 * (`category`, `slug`) et du corps de requête (`newKey`, `fromKey`) : le store
 * les traduit en CHEMINS DE FICHIERS, et `resolve()` normalise les `..`. Une
 * entrée non validée désignait donc un dossier arbitraire du disque.
 *
 * Ces tests n'exercent QUE les chemins de REFUS : chaque garde rend la main
 * avant le premier `mkdirSync`/`writeJson`, donc la suite n'écrit rien et ne
 * salit pas l'arbre `_contents`. C'est aussi ce qu'ils prouvent — que le refus
 * arrive AVANT l'effet de bord.
 *
 * ⚠ PIÈGE, vécu à l'écriture de ce fichier : ne JAMAIS passer ici un couple
 * catégorie/slug VALIDE. `addGuideVersion` réussit alors et crée réellement
 * `<guide>/versions/<clé>/` dans l'arbre du site (un dossier parasite à
 * nettoyer à la main). Pour tester un paramètre en isolation, garder toujours
 * UNE garde amont qui bloque — c'est l'astuce du dernier cas ci-dessous.
 */
import { describe, expect, it } from 'vitest';
import { addGuideVersion } from './guide-store';

// Catégorie réellement versionnée (cf. GUIDE_SPECS) — sert de base valide pour
// n'isoler qu'un seul paramètre fautif à la fois.
const CAT = 'joint-challenge';

describe('addGuideVersion — confinement des chemins', () => {
  it("refuse un slug qui s'échappe de _contents (traversal)", async () => {
    for (const slug of ['../../../../tmp/evil', '..', 'x/../../../..']) {
      const errors = await addGuideVersion(CAT, slug, '2026-01', '');
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.join()).toMatch(/Invalid guide path/);
    }
  });

  it('refuse une catégorie hors liste blanche (sinon dossier parasite créé)', async () => {
    const errors = await addGuideVersion('inventée', 'peu-importe', '2026-01', '');
    expect(errors.join()).toMatch(/Non-editable category/);
  });

  it('refuse une catégorie éditable mais NON versionnée', async () => {
    // `special-request` est éditable en stockage PLAT : pas de versions/ à créer.
    const errors = await addGuideVersion('special-request', 'peu-importe', '2026-01', '');
    expect(errors.join()).toMatch(/not versioned/);
  });

  it('refuse une clé de version mal formée', async () => {
    for (const key of ['2026-13', '26-01', '2026-1', '../2026-01', '']) {
      expect((await addGuideVersion(CAT, 'peu-importe', key, '')).join()).toMatch(/YYYY-MM/);
    }
  });

  it('refuse un fromKey mal formé — il désignait le dossier source à recopier', async () => {
    for (const from of ['../../../../etc', '2026-13', 'nope']) {
      expect((await addGuideVersion(CAT, 'peu-importe', '2026-01', from)).join()).toMatch(
        /Source version key expected/,
      );
    }
  });

  it('ne rejette pas un fromKey VIDE (version vierge, cas légitime)', async () => {
    // On force l'arrêt sur une garde AMONT (slug hors périmètre) : si le
    // `fromKey` vide était refusé pour lui-même, l'erreur porterait sur lui.
    // Formulé ainsi, le test prouve la même chose SANS effet de bord.
    const errors = await addGuideVersion(CAT, '../../../../tmp/evil', '2026-01', '');
    expect(errors.join()).toMatch(/Invalid guide path/);
    expect(errors.join()).not.toMatch(/Source version key expected/);
  });
});
