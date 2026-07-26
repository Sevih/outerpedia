/**
 * Contrat de `allTexts` (audit F9 — cœur devenu testable en sortant du composant).
 *
 * Deux invariants invisibles au rendu :
 *   - la RÉFÉRENCE : les valeurs rendues sont les objets eux-mêmes, la traduction
 *     écrit dedans. Des copies casseraient la traduction en silence.
 *   - le FILTRE PAR L'ANGLAIS : seuls les textes portant un EN non vide sont
 *     retenus, l'anglais étant la source. Une note rédigée uniquement en FR n'a
 *     rien à traduire — l'envoyer au traducteur produirait du charabia.
 */
import { describe, expect, it } from 'vitest';
import type { LocalizedText } from '@contracts';
import { allTexts } from './shop-text';
import type { OverlayEntry, ShopEditorial } from '@/lib/admin/shop-priorities-store';

const editorial = (over: Partial<ShopEditorial> = {}): ShopEditorial => ({
  shopNotes: {},
  textShops: {},
  eventItems: [],
  resourceItems: [],
  ...over,
});

const ens = (o: Record<string, OverlayEntry>, e: ShopEditorial) => allTexts(o, e).map((t) => t.en);

describe('allTexts — ce qui est collecté', () => {
  it('prend les notes de l’overlay curé', () => {
    expect(ens({ 'shop/a': { priority: 'S', notes: { en: 'N' } } }, editorial())).toEqual(['N']);
  });

  it('prend les notes de shop', () => {
    expect(ens({}, editorial({ shopNotes: { guild: { en: 'G' } } as never }))).toEqual(['G']);
  });

  it('prend le libellé ET la note des items éditoriaux, des deux familles', () => {
    const e = editorial({
      eventItems: [{ name: 'x', label: { en: 'L1' }, notes: { en: 'N1' } }] as never,
      resourceItems: [{ name: 'y', label: { en: 'L2' } }] as never,
    });
    expect(ens({}, e)).toEqual(['L1', 'N1', 'L2']);
  });

  it('prend les paragraphes ET la note de gear des shops texte', () => {
    const e = editorial({
      textShops: {
        rico: { paragraphs: [{ en: 'P1' }, { en: 'P2' }], gearNote: { en: 'G' } },
      } as never,
    });
    expect(ens({}, e)).toEqual(['P1', 'P2', 'G']);
  });

  it('ne rend rien quand tout est vide', () => {
    expect(allTexts({}, editorial())).toEqual([]);
  });
});

describe('allTexts — le filtre par l’anglais', () => {
  it('ÉCARTE un texte sans EN (rien à traduire depuis la source)', () => {
    expect(ens({ 'shop/a': { notes: { fr: 'Seulement FR' } } }, editorial())).toEqual([]);
  });

  it('écarte un EN qui n’est que des espaces', () => {
    expect(ens({ 'shop/a': { notes: { en: '   ' } } }, editorial())).toEqual([]);
  });

  it('écarte une entrée d’overlay sans note du tout', () => {
    expect(ens({ 'shop/a': { priority: 'S' } }, editorial())).toEqual([]);
  });
});

describe('allTexts — l’invariant qui compte', () => {
  it('rend les OBJETS eux-mêmes, pas des copies', () => {
    const notes: LocalizedText = { en: 'N' };
    const out = allTexts({ 'shop/a': { notes } }, editorial());

    expect(out[0]).toBe(notes);
    // Écrire dedans modifie bien la source — c'est ainsi que la traduction publie.
    out[0].fr = 'traduit';
    expect(notes.fr).toBe('traduit');
  });
});
