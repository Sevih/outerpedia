/**
 * Contrat du verrou « un seul travail à la fois » et du lancement de pnpm sans
 * shell. Aucune commande n'est lancée : `streamPatchCommand` n'est exercé que
 * sur son REFUS, qui rend la main avant tout `spawn`.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  acquirePatchJob,
  pnpmInvocation,
  runningPatchJob,
  streamPatchCommand,
} from './patch-runner';

describe('acquirePatchJob', () => {
  const held: Array<() => void> = [];
  const take = (label: string) => {
    const release = acquirePatchJob(label);
    if (release) held.push(release);
    return release;
  };
  afterEach(() => {
    for (const release of held.splice(0)) release();
  });

  it('refuse un second travail tant que le premier tourne', () => {
    expect(take('promotion')).toBeTypeOf('function');
    expect(runningPatchJob()).toBe('promotion');
    expect(take('publication')).toBeNull();
    expect(runningPatchJob()).toBe('promotion');
  });

  it('se reprend une fois relâché', () => {
    const release = take('promotion');
    release?.();
    expect(runningPatchJob()).toBeUndefined();
    expect(take('publication')).toBeTypeOf('function');
    expect(runningPatchJob()).toBe('publication');
  });

  it('un relâchement rejoué ne libère pas le travail SUIVANT', () => {
    const first = take('promotion');
    first?.();
    take('publication');
    first?.();
    expect(runningPatchJob()).toBe('publication');
    expect(take('revue')).toBeNull();
  });

  it('streamPatchCommand répond 409 « déjà en cours » sans rien lancer', async () => {
    take('promotion de l’extraction');
    const res = streamPatchCommand({
      label: 'publication des données',
      display: 'commande-jamais-lancee',
      command: 'commande-jamais-lancee',
      args: [],
    });
    expect(res.status).toBe(409);
    expect(res.headers.get('content-type')).toMatch(/application\/x-ndjson/);
    expect(JSON.parse(await res.text())).toEqual({
      done: { ok: false, error: 'déjà en cours — promotion de l’extraction' },
    });
    // Le refus n'a ni pris ni rendu le verrou du travail en cours.
    expect(runningPatchJob()).toBe('promotion de l’extraction');
  });
});

describe('pnpmInvocation', () => {
  it('relance le script JS de pnpm avec le node courant quand pnpm a lancé le serveur', () => {
    expect(pnpmInvocation('/x/pnpm/bin/pnpm.mjs', '/usr/bin/node')).toEqual({
      command: '/usr/bin/node',
      args: ['/x/pnpm/bin/pnpm.mjs'],
    });
    expect(pnpmInvocation('C:\\x\\pnpm\\bin\\pnpm.cjs', 'C:\\node\\node.exe')).toEqual({
      command: 'C:\\node\\node.exe',
      args: ['C:\\x\\pnpm\\bin\\pnpm.cjs'],
    });
  });

  it('retombe sur `pnpm` du PATH sans npm_execpath, ou s’il n’est pas un script JS', () => {
    // `pnpm test` pose lui-même la variable : on la retire le temps du test.
    vi.stubEnv('npm_execpath', undefined);
    expect(pnpmInvocation(undefined, '/usr/bin/node')).toEqual({ command: 'pnpm', args: [] });
    vi.unstubAllEnvs();
    expect(pnpmInvocation('/usr/bin/pnpm', '/usr/bin/node')).toEqual({
      command: 'pnpm',
      args: [],
    });
  });
});
