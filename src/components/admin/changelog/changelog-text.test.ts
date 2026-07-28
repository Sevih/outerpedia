/**
 * Aller-retour des puces du journal pour l'auto-traduction.
 *
 * Deux risques, tous deux silencieux — d'où ces tests : des puces MÉLANGÉES (si
 * l'alignement sur l'index anglais lâche) et des puces PERDUES (si on reprojette
 * une entrée que personne n'a fait traduire).
 */
import { describe, expect, it } from 'vitest';
import { contentBullets, rebuiltContent, type LocalizedLines } from './changelog-text';

describe('contentBullets — une puce EN = un enregistrement', () => {
  it('porte les traductions déjà présentes AU MÊME INDEX', () => {
    const content: LocalizedLines = {
      en: ['Added Alice', 'Fixed the shop'],
      fr: ['Ajout d’Alice', 'Correction de la boutique'],
    };
    expect(contentBullets(content)).toEqual([
      { en: 'Added Alice', fr: 'Ajout d’Alice' },
      { en: 'Fixed the shop', fr: 'Correction de la boutique' },
    ]);
  });

  it('une langue PLUS COURTE que l’anglais laisse la puce en trop sans traduction', () => {
    // Elle est donc « périmée » et repartira au traducteur — c'est voulu.
    const bullets = contentBullets({ en: ['un', 'deux', 'trois'], fr: ['un fr'] });
    expect(bullets).toHaveLength(3);
    expect(bullets[1].fr).toBeUndefined();
    expect(bullets[2].fr).toBeUndefined();
  });

  it('l’anglais dicte le nombre d’enregistrements, pas la langue la plus longue', () => {
    expect(contentBullets({ en: ['seule'], fr: ['a', 'b', 'c'] })).toHaveLength(1);
  });

  it('pas de puce anglaise → rien à traduire', () => {
    expect(contentBullets({ fr: ['orpheline'] })).toEqual([]);
    expect(contentBullets({})).toEqual([]);
  });
});

describe('rebuiltContent — ne touche QUE ce qui a été traduit', () => {
  const content: LocalizedLines = { en: ['un', 'deux'], fr: ['un fr', 'deux fr'] };

  it('renvoie null quand aucune puce n’a bougé', () => {
    const before = contentBullets(content);
    const bullets = before.map((b) => ({ ...b }));
    expect(rebuiltContent(content, bullets, before)).toBeNull();
  });

  it('une entrée INTACTE ne perd pas ses puces orphelines', () => {
    // Le cas qui coûterait du texte : FR a 4 lignes, EN 2. Reprojeter
    // tronquerait FR à 2 — alors que personne n'a demandé à traduire CETTE
    // entrée. `null` protège les deux lignes en trop.
    const long: LocalizedLines = { en: ['un', 'deux'], fr: ['a', 'b', 'c', 'd'] };
    const before = contentBullets(long);
    expect(
      rebuiltContent(
        long,
        before.map((b) => ({ ...b })),
        before,
      ),
    ).toBeNull();
  });

  it('reprojette les puces traduites dans l’ordre de l’anglais', () => {
    const before = contentBullets({ en: ['un', 'deux'] });
    const bullets = before.map((b, k) => ({ ...b, fr: `fr ${k}` }));
    expect(rebuiltContent({ en: ['un', 'deux'] }, bullets, before)).toEqual({
      en: ['un', 'deux'],
      fr: ['fr 0', 'fr 1'],
    });
  });

  it('une entrée traduite SUIT la structure anglaise (l’anglais fait foi)', () => {
    // Ici la traduction a bien eu lieu : FR est réaligné sur les 2 puces EN, ses
    // lignes en trop disparaissent. C'est la règle « l'anglais est la structure ».
    const long: LocalizedLines = { en: ['un', 'deux'], fr: ['a', 'b', 'c', 'd'] };
    const before = contentBullets(long);
    const bullets = before.map((b) => ({ ...b, fr: 'neuf' }));
    expect(rebuiltContent(long, bullets, before)?.fr).toEqual(['neuf', 'neuf']);
  });

  it('n’écrase pas une langue restée vide', () => {
    const before = contentBullets({ en: ['un'] });
    const bullets = before.map((b) => ({ ...b, kr: 'kr' }));
    const next = rebuiltContent({ en: ['un'], fr: ['garde-moi'] }, bullets, before);
    expect(next?.kr).toEqual(['kr']);
    expect(next?.fr).toEqual(['garde-moi']);
  });

  it('les autres langues de l’entrée sont conservées telles quelles', () => {
    const src: LocalizedLines = { en: ['un'], jp: ['jp existant'] };
    const before = contentBullets(src);
    const bullets = before.map((b) => ({ ...b, fr: 'fr neuf' }));
    expect(rebuiltContent(src, bullets, before)).toEqual({
      en: ['un'],
      jp: ['jp existant'],
      fr: ['fr neuf'],
    });
  });
});
