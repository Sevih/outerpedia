/**
 * Contrat des conversions de texte des guides (audit F9 — cœurs devenus
 * testables en sortant du composant).
 *
 * Ce qui est verrouillé est la règle la moins évidente de l'éditeur : **l'ANGLAIS
 * est la STRUCTURE** du contenu localisé. Éditer le bloc EN ajoute ou retire des
 * entrées ; éditer une AUTRE langue ne fait que remplir des traductions par
 * index. Sans cette asymétrie, traduire un guide en FR pourrait en supprimer des
 * conseils — et la perte serait silencieuse, le rendu se contentant d'afficher
 * moins de lignes.
 */
import { describe, expect, it } from 'vitest';
import { blockToItems, itemsToBlock, versionTexts } from './guide-text';
import type { LText, VersionDraft } from '@/lib/admin/guide-draft';

describe('itemsToBlock', () => {
  it('rend une ligne par entrée, dans l’ordre', () => {
    const items: LText[] = [{ en: 'Premier' }, { en: 'Second' }];
    expect(itemsToBlock(items, 'en')).toBe('Premier\nSecond');
  });

  it('laisse une ligne VIDE là où la traduction manque (l’index est le lien)', () => {
    // Le vide doit être conservé : c'est ce qui aligne la ligne 2 du bloc FR sur
    // l'entrée 2 de la liste.
    const items: LText[] = [{ en: 'A', fr: 'A-fr' }, { en: 'B' }, { en: 'C', fr: 'C-fr' }];
    expect(itemsToBlock(items, 'fr')).toBe('A-fr\n\nC-fr');
  });

  it('rend une chaîne vide sur une liste vide', () => {
    expect(itemsToBlock([], 'en')).toBe('');
  });
});

describe('blockToItems — en ANGLAIS, le bloc pilote la STRUCTURE', () => {
  it('ajoute une entrée quand une ligne apparaît', () => {
    const prev: LText[] = [{ en: 'A' }];
    expect(blockToItems('A\nB', prev, 'en')).toEqual([{ en: 'A' }, { en: 'B' }]);
  });

  it('SUPPRIME une entrée quand une ligne disparaît', () => {
    const prev: LText[] = [{ en: 'A' }, { en: 'B' }];
    expect(blockToItems('A', prev, 'en')).toEqual([{ en: 'A' }]);
  });

  it('PRÉSERVE les traductions déjà saisies des entrées conservées', () => {
    const prev: LText[] = [{ en: 'A', fr: 'A-fr', jp: 'A-jp' }];
    expect(blockToItems('A modifié', prev, 'en')).toEqual([
      { en: 'A modifié', fr: 'A-fr', jp: 'A-jp' },
    ]);
  });
});

describe('blockToItems — dans une AUTRE langue, la structure est intouchable', () => {
  it('n’ajoute AUCUNE entrée même si le bloc a plus de lignes', () => {
    // Le garde-fou : une ligne de trop en FR ne doit pas créer un conseil
    // fantôme, sans texte anglais, que le rendu afficherait vide.
    const prev: LText[] = [{ en: 'A' }];
    expect(blockToItems('A-fr\nLigne en trop', prev, 'fr')).toEqual([{ en: 'A', fr: 'A-fr' }]);
  });

  it('ne SUPPRIME aucune entrée même si le bloc a moins de lignes', () => {
    const prev: LText[] = [{ en: 'A' }, { en: 'B' }];
    const out = blockToItems('A-fr', prev, 'fr');
    expect(out).toHaveLength(2);
    expect(out[1].en).toBe('B');
  });

  it('RETIRE la clé de langue quand la ligne est vidée (pas de chaîne vide stockée)', () => {
    const prev: LText[] = [{ en: 'A', fr: 'A-fr' }];
    const out = blockToItems('', prev, 'fr');
    expect(out[0]).toEqual({ en: 'A' });
    expect('fr' in out[0]).toBe(false);
  });

  it('traite une ligne d’espaces comme un vide', () => {
    const prev: LText[] = [{ en: 'A', fr: 'A-fr' }];
    expect(blockToItems('   ', prev, 'fr')).toEqual([{ en: 'A' }]);
  });

  it('remplit par INDEX, sans décaler les autres langues', () => {
    const prev: LText[] = [{ en: 'A' }, { en: 'B', jp: 'B-jp' }];
    expect(blockToItems('A-fr\nB-fr', prev, 'fr')).toEqual([
      { en: 'A', fr: 'A-fr' },
      { en: 'B', jp: 'B-jp', fr: 'B-fr' },
    ]);
  });
});

describe('versionTexts', () => {
  const ver = (over: Partial<VersionDraft> = {}): VersionDraft =>
    ({
      tipSections: [],
      notes: [],
      recommended: [],
      recoSections: [],
      teams: [],
      videos: [],
      ...over,
    }) as VersionDraft;

  it('rend les OBJETS eux-mêmes (la traduction écrit dedans)', () => {
    // Point crucial : ce ne sont pas des copies — `useAutoTranslate` mute ces
    // objets, et c'est ce qui publie la traduction dans le brouillon.
    const note = { en: 'Note' };
    const out = versionTexts(ver({ notes: [note] }));
    expect(out[0]).toBe(note);
  });

  it('parcourt toutes les surfaces d’une version, dans l’ordre', () => {
    const out = versionTexts(
      ver({
        tipSections: [{ title: { en: 'T' }, tips: [{ en: 'tip' }] }] as never,
        notes: [{ en: 'note' }],
        recommended: [{ characters: [], reason: { en: 'reco' } }] as never,
        recoSections: [
          { title: { en: 'S' }, groups: [{ characters: [], reason: { en: 'grp' } }] },
        ] as never,
        teams: [{ title: { en: 'team' }, note: { en: 'n' }, slots: [] }] as never,
      }),
    );
    expect(out.map((t) => t.en)).toEqual(['T', 'tip', 'note', 'reco', 'S', 'grp', 'team', 'n']);
  });

  it('saute les champs absents sans trou dans la liste', () => {
    const out = versionTexts(ver({ teams: [{ slots: [] }] as never }));
    expect(out).toEqual([]);
  });

  it('déplie les notes multi-paragraphes du mode `named`', () => {
    const out = versionTexts(
      ver({ teams: [{ slots: [], notes: [{ en: 'p1' }, { en: 'p2' }] }] as never }),
    );
    expect(out.map((t) => t.en)).toEqual(['p1', 'p2']);
  });
});
