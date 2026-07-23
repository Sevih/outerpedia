/**
 * Tests de `gamedata-store` (explorateur ADMIN des tables brutes, dev-only) —
 * ses CŒURS PURS : `isValidTableName` (garde anti-chemin) et `linkTargetFor`
 * (déduction de la table cible d'une colonne `*ID` — retrait du suffixe,
 * suffixes de mots longs→courts, préférence `<X>Templet`). Le reste
 * (describeTable/queryTable/textIndex) lit `.gamedata/parsed` et n'est pas
 * testable sans le jeu.
 *
 * Tourne SANS `.gamedata` : ces deux fonctions sont pures.
 */
import { describe, expect, it } from 'vitest';
import { isValidTableName, linkTargetFor } from './gamedata-store';

describe('isValidTableName — garde anti-chemin', () => {
  it('accepte un basename alphanumérique/underscore', () => {
    expect(isValidTableName('DungeonTemplet')).toBe(true);
    expect(isValidTableName('Text_System_2')).toBe(true);
  });

  it('rejette tout ce qui ressemble à un chemin ou contient un caractère spécial', () => {
    expect(isValidTableName('../etc/passwd')).toBe(false);
    expect(isValidTableName('a/b')).toBe(false);
    expect(isValidTableName('a b')).toBe(false);
    expect(isValidTableName('')).toBe(false);
    expect(isValidTableName('Item.json')).toBe(false);
  });
});

describe('linkTargetFor — colonne *ID → table cible', () => {
  const tables = new Set(['DungeonTemplet', 'RewardTemplet', 'MonsterTemplet', 'ItemTemplet']);

  it('retire le rôle en tête, garde le suffixe de mots le plus long qui existe', () => {
    // ClearDungeonID → ClearDungeon(absent) → Dungeon → DungeonTemplet.
    expect(linkTargetFor('ClearDungeonID', tables)).toBe('DungeonTemplet');
    expect(linkTargetFor('FirstRewardID', tables)).toBe('RewardTemplet');
  });

  it('pluriel `IDs` géré', () => {
    expect(linkTargetFor('MonsterIDs', tables)).toBe('MonsterTemplet');
  });

  it('préfère `<X>Templet` à `<X>` nu', () => {
    expect(linkTargetFor('DungeonID', new Set(['Dungeon', 'DungeonTemplet']))).toBe(
      'DungeonTemplet',
    );
    expect(linkTargetFor('DungeonID', new Set(['Dungeon']))).toBe('Dungeon');
  });

  it('pas une colonne `*ID`, ou aucune table candidate → undefined', () => {
    expect(linkTargetFor('Level', tables)).toBeUndefined(); // pas *ID
    expect(linkTargetFor('ID', tables)).toBeUndefined(); // base vide
    expect(linkTargetFor('NameID', tables)).toBeUndefined(); // clé de texte, pas une table
  });
});
