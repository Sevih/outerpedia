/**
 * La correspondance base → formes de combat, sur des lignes recopiées de
 * `CharacterTemplet` / `CharacterChangeTemplet` (réduites aux colonnes lues).
 * Elle nourrit la fiche (skills des formes) et le scaling des dégâts : une
 * erreur ici fait perdre une forme aux deux.
 *
 * Tourne SANS `.gamedata` (tables fournies à la main).
 */
import { describe, expect, it } from 'vitest';
import { formsByBaseFrom } from './character-forms';
import type { Row } from './tables';

const chars = [
  { ID: '2000119', NameID: '2000119_Name' },
  { ID: '2000120', NameID: '2000119_Name' },
  { ID: '2010119', NameID: '2000119_Name' },
  { ID: '2010120', NameID: '2000119_Name' },
  { ID: '2000129', NameID: '2000129_Name' },
  { ID: '2000130', NameID: '2000129_Name' },
];
const ids = (m: Map<string, Row[]>) =>
  Object.fromEntries([...m].map(([base, rows]) => [base, rows.map((r) => r.ID)]));

describe('formsByBaseFrom', () => {
  it('base → forme (Demiurge Saeran 2000129 → 2000130)', () => {
    const m = formsByBaseFrom(chars, [{ ID: '2000129', ChangeCharacterID: '2000130' }]);
    expect(ids(m)).toEqual({ '2000129': ['2000130'] });
  });

  it('skin → forme rattachée à SA base (2010119 → 2010120 sur 2000119)', () => {
    const m = formsByBaseFrom(chars, [{ ID: '2010119', ChangeCharacterID: '2010120' }]);
    expect(ids(m)).toEqual({ '2000119': ['2010120'] });
  });

  it("aller-retour : le « retour » vers la base n'est pas une forme ; pas de doublon", () => {
    const m = formsByBaseFrom(chars, [
      { ID: '2000119', ChangeCharacterID: '2000120' },
      { ID: '2000120', ChangeCharacterID: '2000119' },
      { ID: '2000119', ChangeCharacterID: '2000120' },
      { ID: '2010120', ChangeCharacterID: '2010119' },
    ]);
    expect(ids(m)).toEqual({ '2000119': ['2000120', '2010119'] });
  });

  it('une ligne absente de CharacterTemplet ne compte pas', () => {
    const m = formsByBaseFrom(chars, [{ ID: '2000129', ChangeCharacterID: '9999999' }]);
    expect(m.size).toBe(0);
  });
});
