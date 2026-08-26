/**
 * Cœurs PURS de la localisation du client Steam, testés sans Steam : le parseur
 * KeyValues de Valve et ses deux lectures (`libraryfolders.vdf`,
 * `appmanifest_<appid>.acf`). Une bibliothèque secondaire (autre disque) manquée
 * = « jeu introuvable » sur la machine où il est pourtant installé.
 */
import { describe, expect, it } from 'vitest';
import { libraryPaths, parseAppManifest, parseKeyValues } from './steam';

const VDF = `"libraryfolders"
{
\t"0"
\t{
\t\t"path"\t\t"C:\\\\Program Files (x86)\\\\Steam"
\t\t"label"\t\t""
\t\t"apps"
\t\t{
\t\t\t"228980"\t\t"123"
\t\t}
\t}
\t"1"
\t{
\t\t"path"\t\t"D:\\\\SteamLibrary"
\t\t"apps"
\t\t{
\t\t\t"4247320"\t\t"19279239116"
\t\t}
\t}
}
`;

const ACF = `"AppState"
{
\t"appid"\t\t"4247320"
\t"name"\t\t"OUTERPLANE"
\t"installdir"\t\t"OUTERPLANE"
\t"buildid"\t\t"24941080"
\t"InstalledDepots"
\t{
\t\t"4247321"
\t\t{
\t\t\t"manifest"\t\t"1816133217642979133"
\t\t}
\t}
}
`;

describe('parseKeyValues — format KeyValues de Valve', () => {
  it('imbrique les blocs et déplie les échappements', () => {
    const kv = parseKeyValues(VDF);
    const lib0 = (kv.libraryfolders as Record<string, Record<string, unknown>>)['0'];
    expect(lib0.path).toBe('C:\\Program Files (x86)\\Steam');
    expect((lib0.apps as Record<string, string>)['228980']).toBe('123');
  });

  it('un bloc tronqué ne lève pas — on rend ce qui a été lu', () => {
    expect(parseKeyValues('"a" { "b" "c"')).toEqual({ a: { b: 'c' } });
  });
});

describe('libraryPaths — toutes les bibliothèques, dans l’ordre', () => {
  it('liste chaque `path`, y compris les disques secondaires', () => {
    expect(libraryPaths(VDF)).toEqual(['C:\\Program Files (x86)\\Steam', 'D:\\SteamLibrary']);
  });

  it('fichier vide → aucune bibliothèque (l’appelant retombe sur SteamPath)', () => {
    expect(libraryPaths('')).toEqual([]);
  });
});

describe('parseAppManifest — installdir + buildid', () => {
  it('lit le dossier d’install et le build', () => {
    expect(parseAppManifest(ACF)).toEqual({ installdir: 'OUTERPLANE', buildid: '24941080' });
  });

  it('sans installdir → null (manifeste d’un autre format)', () => {
    expect(parseAppManifest('"AppState" { "appid" "1" }')).toBeNull();
  });
});
