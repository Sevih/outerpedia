/**
 * Contrat du verrou « un seul travail à la fois », du lancement de pnpm sans
 * shell, de l'environnement des commandes et de la séquence du push. Aucune
 * commande n'est lancée : `streamPatchCommand` et `streamPatchPush` ne sont
 * exercés que sur leur REFUS, qui rend la main avant tout `spawn`, `pushBranch`
 * sur un lanceur factice, et le lanceur réel sur un `spawn` factice.
 */
import type { SpawnOptions, spawn } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  acquirePatchJob,
  pnpmInvocation,
  pushBranch,
  runningPatchJob,
  spawnLauncher,
  streamPatchCommand,
  streamPatchPush,
  type LaunchResult,
  type PatchLauncher,
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

  it('streamPatchPush passe par le même verrou : 409 pendant un commit', async () => {
    take('commit des données');
    const res = streamPatchPush();
    expect(res.status).toBe(409);
    expect(JSON.parse(await res.text())).toEqual({
      done: { ok: false, error: 'déjà en cours — commit des données' },
    });
    expect(runningPatchJob()).toBe('commit des données');
  });
});

describe('pushBranch (lanceur factice)', () => {
  const ok = (stdout = ''): LaunchResult => ({ code: 0, stdout });
  const ko = (code = 1): LaunchResult => ({ code, stdout: '' });

  /** Rejoue les réponses dans l'ordre et note chaque commande demandée. */
  const fake = (...answers: LaunchResult[]) => {
    const calls: string[] = [];
    const said: string[] = [];
    const launch: PatchLauncher = async (command, args) => {
      calls.push([command, ...args].join(' '));
      const answer = answers.shift();
      if (!answer) throw new Error(`commande inattendue : ${calls.at(-1)}`);
      return answer;
    };
    return { calls, said, run: () => pushBranch((line) => said.push(line), launch) };
  };

  it('branche à jour : pré-vol puis push de la branche lue par git', async () => {
    const { calls, said, run } = fake(ok('main\n'), ok(), ok('abc123\n'), ok('42\t0\n'), ok());
    expect(await run()).toEqual({ ok: true, code: 0 });
    expect(calls).toEqual([
      'git rev-parse --abbrev-ref HEAD',
      'git fetch origin main',
      'git rev-parse --verify origin/main',
      'git rev-list --left-right --count HEAD...origin/main',
      'git push --no-verify origin main',
    ]);
    // Le journal fait écho à chaque commande, et dit l'issue du pré-vol.
    expect(said.filter((l) => l.startsWith('$ '))).toEqual(calls.map((c) => `$ ${c}`));
    expect(said).toContain('origin/main : à jour.');
  });

  it('branche en retard : refus motivé, le push n’est jamais lancé', async () => {
    const { calls, run } = fake(ok('main\n'), ok(), ok('abc123\n'), ok('2\t3\n'));
    const done = await run();
    expect(done.ok).toBe(false);
    expect(done.error).toMatch(/origin\/main a 3 commit\(s\).*rien n'a été poussé/);
    expect(calls.some((c) => c.startsWith('git push'))).toBe(false);
  });

  it('comparaison en échec : refus, le push n’est jamais lancé', async () => {
    const { calls, run } = fake(ok('main\n'), ok(), ok('abc123\n'), ko(128));
    const done = await run();
    expect(done).toMatchObject({ ok: false });
    expect(done.error).toMatch(/illisible/);
    expect(calls).toHaveLength(4);
  });

  it('HEAD détaché ou branche illisible : rien n’est lancé après la lecture', async () => {
    const detached = fake(ok('HEAD\n'));
    expect(await detached.run()).toMatchObject({ ok: false });
    expect(detached.calls).toEqual(['git rev-parse --abbrev-ref HEAD']);

    const unreadable = fake(ko(128));
    expect((await unreadable.run()).error).toMatch(/branche courante illisible/);
    expect(unreadable.calls).toHaveLength(1);
  });

  it('origin injoignable : rien à comparer, le push part et rend son propre échec', async () => {
    const { calls, said, run } = fake(ok('main\n'), ko(128), ko(128));
    expect(await run()).toEqual({ ok: false, code: 128 });
    expect(calls).toEqual([
      'git rev-parse --abbrev-ref HEAD',
      'git fetch origin main',
      'git push --no-verify origin main',
    ]);
    expect(said).toContain('origin/main injoignable ou inexistant — rien à comparer.');
  });

  it('branche absente d’origin : rien à comparer, le push la crée', async () => {
    const { calls, run } = fake(ok('feat/x\n'), ok(), ko(128), ok());
    expect(await run()).toEqual({ ok: true, code: 0 });
    expect(calls.at(-1)).toBe('git push --no-verify origin feat/x');
    expect(calls.some((c) => c.includes('rev-list'))).toBe(false);
  });

  it('git introuvable au push : l’erreur du lancement remonte', async () => {
    const { run } = fake(ok('main\n'), ok(), ok('abc123\n'), ok('1\t0\n'), {
      code: null,
      stdout: '',
      error: 'spawn git ENOENT',
    });
    expect(await run()).toEqual({ ok: false, error: 'spawn git ENOENT' });
  });
});

describe('spawnLauncher (spawn factice)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  /** Note ce que `spawn` reçoit, puis rend un enfant qui écrit `stdout` et sort en 0. */
  const fakeSpawn = (stdout: string) => {
    const spawned: Array<{ command: string; args: readonly string[]; options: SpawnOptions }> = [];
    const spawnFn = ((command: string, args: readonly string[], options: SpawnOptions) => {
      spawned.push({ command, args, options });
      const child = Object.assign(new EventEmitter(), {
        stdout: new PassThrough(),
        stderr: new PassThrough(),
      });
      child.stdout.on('end', () => setImmediate(() => child.emit('close', 0)));
      child.stdout.end(stdout);
      child.stderr.end();
      return child;
    }) as unknown as typeof spawn;
    return { spawned, spawnFn };
  };

  it('toute commande part sans shell, avec l’environnement du serveur et GIT_TERMINAL_PROMPT=0', async () => {
    // Le reste de l'environnement suit ; une valeur héritée du terminal est écrasée.
    vi.stubEnv('PATCH_RUNNER_TEMOIN', 'gardé');
    vi.stubEnv('GIT_TERMINAL_PROMPT', '1');
    const { spawned, spawnFn } = fakeSpawn('abc123\n');
    const said: string[] = [];
    const launch = spawnLauncher((line) => said.push(line), spawnFn);

    expect(await launch('git', ['fetch', 'origin', 'main'])).toEqual({
      code: 0,
      stdout: 'abc123\n',
    });
    // pnpm aussi : `pnpm commit` lance ses propres `git fetch`.
    await launch('pnpm', ['commit', '--no-push']);

    expect(spawned.map((s) => [s.command, ...s.args].join(' '))).toEqual([
      'git fetch origin main',
      'pnpm commit --no-push',
    ]);
    for (const { options } of spawned) {
      expect(options.shell).toBe(false);
      expect(options.env).toMatchObject({
        GIT_TERMINAL_PROMPT: '0',
        PATCH_RUNNER_TEMOIN: 'gardé',
      });
    }
    expect(said).toEqual(['abc123', 'abc123']);
    // L'environnement du serveur, lui, n'est pas touché.
    expect(process.env.GIT_TERMINAL_PROMPT).toBe('1');
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
