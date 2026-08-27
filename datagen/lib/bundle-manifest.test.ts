import { describe, expect, it } from 'vitest';
import {
  assetName,
  bundlesFor,
  bundlesSignature,
  closeOverDependencies,
  selectBundles,
  type BundleInfo,
} from './bundle-manifest';

const b = (name: string, assets: string[], dependencies: string[] = []): BundleInfo => ({
  name,
  folder: name.split('/')[0],
  filename: `hash-${name}`,
  fileSize: name.length,
  assets,
  dependencies,
});

const TEMPLET = b('templetbinary/character', [
  'Assets/Editor/Resources/TempletBinary/CharacterTemplet.bytes',
]);
const TEXT = b('templetbinary/text/en', [
  'Assets/Editor/Resources/TempletBinary/Text/TextName.bytes',
]);
const TEXTURE = b('texture/ui/foo', ['Assets/Art/UI/Texture/foo.png']);
const UI_PREFAB = b(
  'prefabs/ui/lobby',
  ['Assets/Editor/Resources/Prefabs/UI/Lobby.prefab'],
  ['spriteatlas/ui', 'shader/x'],
);
const ATLAS = b('spriteatlas/ui', ['Assets/Art/UI/Atlas/ui.spriteatlas'], ['texture/ui/foo']);
const SHADER = b('shader/x', ['Assets/Shaders/x.shader']);
const VOICE = b('voice/en/hero', ['Assets/Sound/Voice/EN/hero.wav'], ['missing-dep']);
const ALL = [TEMPLET, TEXT, TEXTURE, UI_PREFAB, ATLAS, SHADER, VOICE];

const BYTES = { name: /Templet|^Text/ };
const IMAGES = {
  name: /^(?!T_FX_|Font Texture)/,
  container: /assets\/editor\/resources\/(sprite|texture|prefabs\/ui)|assets\/art\/ui\//i,
};

describe('assetName', () => {
  it('nom sans dossier ni extension, comme --filter-by-name', () => {
    expect(assetName('Assets/Editor/Resources/TempletBinary/CharacterTemplet.bytes')).toBe(
      'CharacterTemplet',
    );
    expect(assetName('a/b/Font Texture.png')).toBe('Font Texture');
  });
});

describe('selectBundles', () => {
  it('garde un bundle dès qu’un asset passe nom ET container', () => {
    expect(selectBundles(ALL, BYTES).map((x) => x.name)).toEqual([
      'templetbinary/character',
      'templetbinary/text/en',
    ]);
    expect(selectBundles(ALL, IMAGES).map((x) => x.name)).toEqual([
      'texture/ui/foo',
      'prefabs/ui/lobby',
      'spriteatlas/ui',
    ]);
  });
  it('`^Text` ne prend pas Texture par le chemin : c’est le nom qui compte', () => {
    expect(selectBundles([TEXTURE], BYTES)).toEqual([]);
  });
});

describe('closeOverDependencies', () => {
  it('ferme transitivement, sans doublon, en ignorant une dépendance inconnue', () => {
    expect(closeOverDependencies(ALL, [UI_PREFAB]).map((x) => x.name)).toEqual([
      'texture/ui/foo',
      'prefabs/ui/lobby',
      'spriteatlas/ui',
      'shader/x',
    ]);
    expect(closeOverDependencies(ALL, [VOICE]).map((x) => x.name)).toEqual(['voice/en/hero']);
  });
  it('rend l’ordre du manifeste, quel que soit l’ordre de la sélection', () => {
    const a = closeOverDependencies(ALL, [ATLAS, TEMPLET]).map((x) => x.name);
    const c = closeOverDependencies(ALL, [TEMPLET, ATLAS]).map((x) => x.name);
    expect(a).toEqual(c);
    expect(a).toEqual(['templetbinary/character', 'texture/ui/foo', 'spriteatlas/ui']);
  });
});

describe('bundlesFor', () => {
  it('les .bytes ne dépendent de rien ; les images tirent atlas, textures et shaders', () => {
    expect(bundlesFor(ALL, BYTES).map((x) => x.name)).toEqual([
      'templetbinary/character',
      'templetbinary/text/en',
    ]);
    expect(bundlesFor(ALL, IMAGES).map((x) => x.name)).toEqual([
      'texture/ui/foo',
      'prefabs/ui/lobby',
      'spriteatlas/ui',
      'shader/x',
    ]);
  });
});

describe('bundlesSignature', () => {
  it('insensible à l’ordre, sensible à un fichier ou une taille', () => {
    const s = bundlesSignature([TEMPLET, TEXT]);
    expect(bundlesSignature([TEXT, TEMPLET])).toBe(s);
    expect(bundlesSignature([TEMPLET])).not.toBe(s);
    expect(bundlesSignature([TEMPLET, { ...TEXT, fileSize: TEXT.fileSize + 1 }])).not.toBe(s);
    expect(bundlesSignature([TEMPLET, { ...TEXT, filename: 'other' }])).not.toBe(s);
  });
});
