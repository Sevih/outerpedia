/**
 * `data/curated/game-client.json`, la référence du client Steam que recopient
 * gear-solver et outerplane-tweaks : une forme cassée ici casse leur build (ou
 * pire, leur fait poser un BepInEx non vérifié). Et `nextGameClient`, la
 * décision de `dump-steam.ts` de réécrire le bloc `client` — le dump lui-même
 * décompile tout le client, on ne le rejoue pas en test.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { nextGameClient, readGameClient, type GameClientFile } from './game-client';

const file = readGameClient();

describe('game-client.json — forme', () => {
  it('steam : appid entier, dossiers et racines non vides', () => {
    const { steam } = file;
    expect(Number.isInteger(steam.appId)).toBe(true);
    expect(steam.appId).toBeGreaterThan(0);
    for (const v of [
      steam.installDir,
      steam.dataDir,
      steam.exe,
      steam.registry.key,
      steam.registry.value,
    ])
      expect(v).toMatch(/\S/);
    for (const roots of [steam.roots.windows, steam.roots.linux]) {
      expect(roots.length).toBeGreaterThan(0);
      for (const dir of roots) expect(dir).toMatch(/\S/);
    }
  });

  it('linux : racines RELATIVES au dossier personnel', () => {
    for (const dir of file.steam.roots.linux) expect(dir).not.toMatch(/^[/~]/);
  });

  it('client : version x.y.z, build en chiffres, date AAAA-MM-JJ', () => {
    expect(file.client.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(file.client.buildId).toMatch(/^\d+$/);
    expect(file.client.dumpedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('bepinex : sha256 en 64 hex minuscules, url qui porte la version et finit par l’asset', () => {
    const { bepinex } = file;
    expect(bepinex.sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(bepinex.url).toContain(bepinex.version);
    expect(bepinex.url.endsWith(`/${bepinex.asset}`)).toBe(true);
  });

  it('chaque bloc est documenté', () => {
    for (const k of ['_doc', '_docSteam', '_docClient', '_docBepinex'] as const)
      expect(file[k]).toMatch(/\S/);
  });
});

describe('steam.ts — plus rien du client écrit en dur', () => {
  // Le source relu, commentaires ôtés (ils peuvent citer `~/.local/share/Steam`
  // pour expliquer) : l'appid et les racines vivent dans le curé.
  const src = readFileSync('datagen/extract/steam.ts', 'utf-8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');

  it('ni appid', () => {
    expect(src).not.toContain(String(file.steam.appId));
  });

  it('ni racine Steam, ni clé de registre, ni dossier de données en littéral', () => {
    for (const lit of [
      ...file.steam.roots.windows,
      ...file.steam.roots.linux,
      'Program Files',
      'com.valvesoftware.Steam',
      `'${file.steam.dataDir}'`,
      file.steam.registry.key.replaceAll('\\', '\\\\'),
    ])
      expect(src, lit).not.toContain(lit);
    // Les formes en morceaux de l'ancienne écriture (`join(home, '.local', …)`).
    expect(src).not.toMatch(/'\.local'|'\.steam'|'\.var'/);
  });
});

describe('nextGameClient — réécrire le bloc `client` ou rien', () => {
  const base: GameClientFile = {
    _doc: 'doc',
    steam: file.steam,
    _docClient: 'doc client',
    client: { version: '1.4.18', buildId: '25744766', dumpedAt: '2026-10-06' },
    bepinex: file.bepinex,
  };

  it('même version, même build → rien (la date seule ne fait pas un diff)', () => {
    expect(nextGameClient(base, '1.4.18', '25744766', '2026-10-20')).toBeNull();
  });

  it('nouvelle version → le bloc client seul change, le reste et l’ordre des clés tels quels', () => {
    const next = nextGameClient(base, '1.4.19', '25900000', '2026-10-20');
    expect(next).toEqual({
      ...base,
      client: { version: '1.4.19', buildId: '25900000', dumpedAt: '2026-10-20' },
    });
    expect(Object.keys(next!)).toEqual(Object.keys(base));
    expect(next!.steam).toBe(base.steam);
    expect(next!.bepinex).toBe(base.bepinex);
  });

  it('nouveau build seul (redépôt Valve, même version) → réécrit', () => {
    expect(nextGameClient(base, '1.4.18', '25800000', '2026-10-20')?.client).toEqual({
      version: '1.4.18',
      buildId: '25800000',
      dumpedAt: '2026-10-20',
    });
  });

  it('version inconnue (UnityPy absent) → rien, jamais devinée', () => {
    expect(nextGameClient(base, 'inconnue', '25900000', '2026-10-20')).toBeNull();
  });

  it('build absent (install hors Steam) → rien', () => {
    expect(nextGameClient(base, '1.4.19', null, '2026-10-20')).toBeNull();
  });

  it('ne modifie pas l’objet reçu', () => {
    nextGameClient(base, '1.4.19', '25900000', '2026-10-20');
    expect(base.client.version).toBe('1.4.18');
  });
});
