/**
 * Tests de `gamedata-store` (explorateur ADMIN des tables brutes, dev-only) —
 * ses CŒURS PURS : `isValidTableName` (garde anti-chemin) et `linkTargetFor`
 * (déduction de la table cible d'une colonne `*ID` — alias d'abord, puis retrait
 * du suffixe, suffixes de mots longs→courts, préférence `<X>Templet`). Le reste
 * (describeTable/queryTable/textIndex) lit `.gamedata/parsed` et n'est pas
 * testable sans le jeu.
 *
 * Tourne SANS `.gamedata` : ces deux fonctions sont pures.
 */
import { describe, expect, it } from 'vitest';
import { isValidTableName, LINK_ALIASES, linkTargetFor } from './gamedata-store';

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

describe('linkTargetFor — alias (`LINK_ALIASES`)', () => {
  it("l'alias l'emporte sur la déduction par le nom", () => {
    // Sans alias, `PickupID` chercherait `PickupTemplet` — et le trouverait ici.
    const tables = new Set(['CharacterTemplet', 'PickupTemplet']);
    expect(linkTargetFor('PickupID', tables)).toBe('CharacterTemplet');
    expect(linkTargetFor('ChangeCharID', tables)).toBe('CharacterTemplet');
    expect(linkTargetFor('BonusCharIDs', tables)).toBe('CharacterTemplet'); // liste CSV
  });

  it('un alias vers une table absente ne donne rien — pas de repli sur le nom', () => {
    expect(linkTargetFor('PickupID', new Set(['DungeonTemplet']))).toBeUndefined();
    expect(linkTargetFor('PickupID', new Set(['PickupTemplet']))).toBeUndefined();
  });

  it('chaque alias est une colonne `*ID` et vise une table nommée', () => {
    for (const [col, target] of Object.entries(LINK_ALIASES)) {
      expect(col).toMatch(/I[Dd]s?$/);
      expect(linkTargetFor(col, new Set([target]))).toBe(target);
    }
  });

  it('la déduction par le nom reste pour les colonnes sans alias', () => {
    const tables = new Set(['CharacterTemplet', 'CostumeTemplet']);
    expect(LINK_ALIASES).not.toHaveProperty('ShareCharacterID');
    expect(linkTargetFor('ShareCharacterID', tables)).toBe('CharacterTemplet');
    expect(linkTargetFor('ChangeCharacterCostumeID', tables)).toBe('CostumeTemplet');
    expect(linkTargetFor('toString', tables)).toBeUndefined(); // clé du prototype, pas un alias
  });
});
