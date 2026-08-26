/**
 * `readEnum` — le lecteur d'enums du client, dans les DEUX syntaxes de dump
 * (Il2CppDumper sur l'APK Android, C# décompilé du client Steam). Les
 * générateurs goods/recruit en dépendent pour ASSET_TYPE : une syntaxe mal lue
 * = des monnaies sans nom, en silence.
 */
import { describe, expect, it } from 'vitest';
import { assetTypeKeys, readEnum } from './dump';

const IL2CPP = `
public enum ASSET_TYPE // TypeDefIndex: 4321
{
\t// Fields
\tpublic int value__; // 0x0
\tpublic const ASSET_TYPE AT_NONE = 0;
\tpublic const ASSET_TYPE AT_GOLD = 1;
\tpublic const ASSET_TYPE AT_IRREGULAR_CHASE_1 = 33;
\tpublic const ASSET_TYPE AT_MAX = 34;
}
public enum OTHER { public const OTHER X = 9; }
`;

const CSHARP = `
public enum OTHER
{
\tX = 9
}

public enum ASSET_TYPE
{
\tAT_NONE,
\tAT_GOLD,
\t[Obsolete]
\tAT_IRREGULAR_CHASE_1 = 33, // commentaire
\tAT_NEXT,
\tAT_MAX = 34
}
`;

describe('readEnum', () => {
  it('syntaxe Il2CppDumper : constantes typées, valeurs explicites', () => {
    expect([...readEnum(IL2CPP, 'ASSET_TYPE')]).toEqual([
      ['AT_NONE', 0],
      ['AT_GOLD', 1],
      ['AT_IRREGULAR_CHASE_1', 33],
      ['AT_MAX', 34],
    ]);
  });

  it('syntaxe C# : valeurs implicites = précédente + 1, attributs et commentaires ignorés', () => {
    expect([...readEnum(CSHARP, 'ASSET_TYPE')]).toEqual([
      ['AT_NONE', 0],
      ['AT_GOLD', 1],
      ['AT_IRREGULAR_CHASE_1', 33],
      ['AT_NEXT', 34],
      ['AT_MAX', 34],
    ]);
  });

  it('ne confond pas un enum avec un autre (préfixe de nom)', () => {
    expect(readEnum(CSHARP, 'OTHER')).toEqual(new Map([['X', 9]]));
    expect(readEnum(IL2CPP, 'OTHER')).toEqual(new Map([['X', 9]]));
  });

  it('enum absent → Map vide', () => {
    expect(readEnum(CSHARP, 'NOPE').size).toBe(0);
  });
});

describe('assetTypeKeys — id → SYS_ASSET_<X>', () => {
  it('même résultat quelle que soit la syntaxe, sans la sentinelle MAX', () => {
    const expected = new Map([
      ['0', 'SYS_ASSET_NONE'],
      ['1', 'SYS_ASSET_GOLD'],
      ['33', 'SYS_ASSET_IRREGULAR_CHASE_1'],
    ]);
    expect(assetTypeKeys(IL2CPP)).toEqual(expected);
    const cs = assetTypeKeys(CSHARP);
    expect(cs.get('33')).toBe('SYS_ASSET_IRREGULAR_CHASE_1');
    expect([...cs.values()]).not.toContain('SYS_ASSET_MAX');
  });

  it('dump sans ASSET_TYPE → lève (dump cassé, pas catalogue vide)', () => {
    expect(() => assetTypeKeys('rien')).toThrow(/ASSET_TYPE/);
  });
});
