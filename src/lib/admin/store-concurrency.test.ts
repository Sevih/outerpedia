/**
 * Non-régression de la PERTE DE MISE À JOUR des stores curés (audit F7).
 *
 * Le scénario est celui de deux onglets d'admin ouverts sur deux entités qui
 * partagent le même fichier curé, enregistrés coup sur coup. Avant le verrou, il
 * ne restait qu'une seule des deux écritures — mesuré, pas supposé : deux
 * `upsertCharacterCurated` concurrents laissaient `{ tamamo }` seul dans
 * `characters.json`, `stella` évaporé sans le moindre message d'erreur (les deux
 * appels répondaient « OK »).
 *
 * La cause est le point de suspension de `writeJson` (`await formatJson`, qui
 * passe par prettier) entre la lecture et l'écriture — cf. l'en-tête de
 * `store-lock.ts`. Ces tests le rejouent sur les stores où le merge est par CLÉ,
 * les seuls que le verrou peut sauver.
 *
 * Écritures réelles dans un tmp via `sandbox()` (cf. `store-fixture`).
 */
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { sandbox } from './store-fixture';

const box = sandbox('concurrency-');
// ⚠ APRÈS `sandbox()` : les stores figent leur chemin au chargement.
const { upsertCharacterCurated } = await import('./curated-store');
const { upsertEffectCurated } = await import('./effects-store');
const { upsertSearchAliases } = await import('./search-alias-store');
const { upsertShortName } = await import('./short-name-store');
const { applyCharacterKitCuration } = await import('./character-skill-curated-store');

beforeEach(() => box.reset());
afterAll(() => box.dispose());

describe('deux enregistrements simultanés sur le même fichier curé', () => {
  it('curated-store : les DEUX persos survivent', async () => {
    await Promise.all([
      upsertCharacterCurated('stella', { rank: 'SS' }),
      upsertCharacterCurated('tamamo', { rank: 'A' }),
    ]);

    const all = box.read<Record<string, { rank?: string }>>('data/curated/characters.json');
    expect(Object.keys(all).sort()).toEqual(['stella', 'tamamo']);
    expect(all.stella).toEqual({ rank: 'SS' });
    expect(all.tamamo).toEqual({ rank: 'A' });
  });

  it('curated-store : cinq enregistrements en rafale sont tous conservés', async () => {
    const ids = ['a', 'b', 'c', 'd', 'e'];
    await Promise.all(ids.map((id) => upsertCharacterCurated(id, { rank: 'B' })));
    expect(Object.keys(box.read<object>('data/curated/characters.json')).sort()).toEqual(ids);
  });

  it('curated-store : une SUPPRESSION concurrente n’emporte pas la voisine', async () => {
    await box.put('data/curated/characters.json', { stella: { rank: 'SS' }, vlada: { rank: 'C' } });
    await Promise.all([
      upsertCharacterCurated('stella', {}), // supprime
      upsertCharacterCurated('tamamo', { rank: 'A' }), // ajoute
    ]);

    const all = box.read<Record<string, unknown>>('data/curated/characters.json');
    expect(Object.keys(all).sort()).toEqual(['tamamo', 'vlada']);
  });

  it('effects-store : les DEUX effets survivent', async () => {
    await Promise.all([
      upsertEffectCurated('101', { tag: 'dot' }),
      upsertEffectCurated('102', { tag: 'cc' }),
    ]);
    expect(Object.keys(box.read<object>('data/curated/effects.json'))).toEqual(['101', '102']);
  });

  it('search-alias-store : les DEUX listes d’alias survivent', async () => {
    await Promise.all([
      upsertSearchAliases('stella', ['stel']),
      upsertSearchAliases('tamamo', ['tama']),
    ]);
    const all = box.read<Record<string, string[]>>('data/curated/search-aliases.json');
    expect(all).toEqual({ stella: ['stel'], tamamo: ['tama'] });
  });

  it('short-name-store : les DEUX noms courts survivent', async () => {
    await Promise.all([
      upsertShortName('stella', { en: 'D.Stella' }),
      upsertShortName('tamamo', { en: 'Tama' }),
    ]);
    const all = box.read<Record<string, object>>('data/curated/short-names.json');
    expect(Object.keys(all).sort()).toEqual(['stella', 'tamamo']);
  });

  it('character-skill-curated-store : les curations des DEUX persos survivent', async () => {
    await Promise.all([
      applyCharacterKitCuration({ cardIds: ['c1'], chipHide: { c1: ['b1'] } }),
      applyCharacterKitCuration({ cardIds: ['c2'], chipHide: { c2: ['b2'] } }),
    ]);
    const f = box.read<{ chipHide: Record<string, string[]> }>(
      'data/curated/character-skills.json',
    );
    expect(f.chipHide).toEqual({ c1: ['b1'], c2: ['b2'] });
  });

  it('aucun temporaire ne survit à une rafale', async () => {
    await Promise.all([
      upsertCharacterCurated('a', { rank: 'A' }),
      upsertCharacterCurated('b', { rank: 'B' }),
      upsertEffectCurated('1', { tag: 'dot' }),
    ]);
    expect(box.leftovers()).toEqual([]);
  });
});

describe('le verrou ne change rien au cas séquentiel', () => {
  it('deux enregistrements l’un après l’autre se comportent comme avant', async () => {
    expect(await upsertCharacterCurated('stella', { rank: 'SS' })).toEqual([]);
    expect(await upsertCharacterCurated('tamamo', { rank: 'A' })).toEqual([]);
    expect(Object.keys(box.read<object>('data/curated/characters.json')).sort()).toEqual([
      'stella',
      'tamamo',
    ]);
  });

  it('une écriture REFUSÉE ne bloque pas la suivante', async () => {
    // La file doit survivre à un rejet de validation (cf. `store-lock`).
    expect(
      (await upsertCharacterCurated('stella', { role: 'tank' as never })).length,
    ).toBeGreaterThan(0);
    expect(await upsertCharacterCurated('tamamo', { rank: 'A' })).toEqual([]);
    expect(box.read<Record<string, unknown>>('data/curated/characters.json')).toEqual({
      tamamo: { rank: 'A' },
    });
  });
});
