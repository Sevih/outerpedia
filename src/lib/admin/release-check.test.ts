/**
 * Contrat de `release-check` — le refus « date de sortie manquante » rendu
 * sans lever : qui, parmi un roster, n'a de date ni dans les notes ni dans le
 * curé — la même dérivation que `releasesForRoster`, qui, elle, lève.
 */
import { describe, expect, it } from 'vitest';
import type { Character } from '@datagen/extractor/specs/character';
import type { ReleaseHit } from '@datagen/generators/character-release';
import { missingReleases } from './release-check';

const hit = (label: string, date: string | null, coreFusion = false): ReleaseHit => ({
  label,
  date,
  source: 'fiche',
  post: 'p',
  title: 't',
  head: 'h',
  coreFusion,
});

const CHARS = {
  '2000001': { id: '2000001', name: { en: 'Aer' } },
  '2000002': {
    id: '2000002',
    name: { en: 'Stella' },
    nickname: { en: 'Demiurge' },
    showNickName: true,
  },
  '2700001': { id: '2700001', name: { en: 'Aer' }, originalCharacter: '2000001' },
  '2400015': { id: '2400015', name: { en: '' } },
} as unknown as Record<string, Character>;

describe('missingReleases', () => {
  it('une note date par le libellé officiel, le curé comble, le reste manque — avec son libellé', () => {
    const missing = missingReleases(
      CHARS,
      [hit('Aer', '2023-04-19'), hit('Demiurge Stella', '2024-01-01')],
      {
        '2700001': '2025-05-05',
      },
    );
    expect(missing).toEqual([{ id: '2400015', label: '' }]);
  });

  it('une core-fusion n’est datée que par une section core-fusion ; sans date, aucun refus pour un roster daté', () => {
    // Dans l'ordre du roster, celui des clés.
    expect(missingReleases(CHARS, [hit('Aer', '2023-04-19')], {}).map((m) => m.id)).toEqual([
      '2000002',
      '2400015',
      '2700001',
    ]);
    expect(
      missingReleases(CHARS, [hit('Aer', '2023-04-19'), hit('Aer', '2025-05-05', true)], {
        '2000002': '2024-01-01',
        '2400015': '2026-12-12',
      }),
    ).toEqual([]);
  });

  it('un hit sans date ne date rien', () => {
    expect(missingReleases({ '2000001': CHARS['2000001'] }, [hit('Aer', null)], {})).toEqual([
      { id: '2000001', label: 'Aer' },
    ]);
  });
});
