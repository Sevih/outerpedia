/**
 * Filtre des assets de persos NON INTÉGRÉS. Deux régressions coûteuses à
 * empêcher, l'une comme l'autre invisible tant qu'on ne regarde pas la galerie :
 *   - trop filtrer → les SKINS (id propre, rattaché au perso de base) et les
 *     arts de PNJ disparaissent de `/wallpapers` (100 cutins sur 223 dans le
 *     premier jet du filtre) ;
 *   - pas assez → les illustrations d'un perso non annoncé partent sur R2.
 */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/** Le module résout `data/generated/characters.json` depuis le cwd. */
let dir: string;

async function withCharacters(chars: unknown): Promise<typeof import('./released')> {
  writeFileSync(join(dir, 'data/generated/characters.json'), JSON.stringify(chars));
  vi.resetModules();
  return import('./released');
}

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'released-'));
  mkdirSync(join(dir, 'data/generated'), { recursive: true });
  vi.spyOn(process, 'cwd').mockReturnValue(dir);
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
  vi.restoreAllMocks();
  vi.resetModules();
});

// K (sorti) avec son skin `2010001` ; `2000118` (lambda) n'est PAS intégré.
const CHARS = {
  '2000001': {
    appearances: ['2010001'],
    costumes: [{ model: '2010001', fusionModel: '0' }],
  },
  '2700003': { costumes: [{ model: '2710003', fusionModel: '2720003' }] },
};

describe('isUnreleasedCharacterAsset', () => {
  it('écarte le perso connu du jeu mais pas intégré (lambda, doublon de dev)', async () => {
    const { isUnreleasedCharacterAsset } = await withCharacters(CHARS);
    expect(isUnreleasedCharacterAsset('T_CutIn_2000118')).toBe(true);
    expect(isUnreleasedCharacterAsset('IMG_2000120')).toBe(true);
    expect(isUnreleasedCharacterAsset('T_Demi_2000118')).toBe(true);
  });

  it('GARDE les skins et modèles de fusion — leur id n’est pas une clé de perso', async () => {
    const { isUnreleasedCharacterAsset } = await withCharacters(CHARS);
    expect(isUnreleasedCharacterAsset('T_CutIn_2010001')).toBe(false);
    expect(isUnreleasedCharacterAsset('IMG_2010001_02')).toBe(false);
    expect(isUnreleasedCharacterAsset('T_CutIn_2720003')).toBe(false);
    // La casse du jeu varie (`T_Cutin_…` existe dans le pool).
    expect(isUnreleasedCharacterAsset('T_Cutin_2010001')).toBe(false);
  });

  it('GARDE les PNJ : espace de noms `3…`, sans perso intégré pour l’ancrer', async () => {
    const { isUnreleasedCharacterAsset } = await withCharacters(CHARS);
    expect(isUnreleasedCharacterAsset('IMG_3000032')).toBe(false);
  });

  it('ignore ce qui n’est pas nommé par un id de perso', async () => {
    const { isUnreleasedCharacterAsset } = await withCharacters(CHARS);
    for (const stem of ['T_Event_BG_001', 'T_Scenario_A0106', 'T_Event_Banner_Full_001'])
      expect(isUnreleasedCharacterAsset(stem)).toBe(false);
  });

  it('sans validé lisible, ne filtre RIEN (un checkout frais ne vide pas la galerie)', async () => {
    const { isUnreleasedCharacterAsset } = await withCharacters({});
    expect(isUnreleasedCharacterAsset('T_CutIn_2000118')).toBe(false);
  });
});
