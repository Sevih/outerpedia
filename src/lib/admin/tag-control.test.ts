/**
 * Contrôle BLOQUANT des tags inline : la suite échoue si un tag du contenu
 * éditorial (pros/cons, synergies, gear-reco, presets) n'a pas de
 * correspondance dans la donnée — même résolution que le rendu parse-text.
 * Diagnostic détaillé : /admin/tags.
 */
import { describe, expect, it } from 'vitest';
import { collectTagOccurrences } from './tag-control';

describe('tags inline du contenu éditorial', () => {
  it('contrôle au moins un tag (le scan ne tourne pas à vide)', () => {
    expect(collectTagOccurrences().length).toBeGreaterThan(0);
  });

  it('chaque tag a une correspondance dans la donnée', () => {
    const bad = collectTagOccurrences()
      .filter((o) => !o.ok)
      .map((o) => `${o.tag} — ${o.reason} @ ${o.source}`);
    expect(bad).toEqual([]);
  });
});
