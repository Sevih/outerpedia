import type { SpawnOptions } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { describe, expect, it } from 'vitest';
import {
  PORT_RETRIES,
  RESTART_EXIT_CODE,
  RESTART_MARK,
  createGestures,
  portBusy,
  restartAnswer,
  restartCommand,
  restartQuick,
  restartRefusal,
  takeRestartMark,
  type Busy,
  type Env,
  type RestartDeps,
} from './restart';

const idle: Busy = { patchJob: undefined, gestures: [] };

/** Une promesse tenue : `release` la lâche (ou la rejette). */
const held = () => {
  let release: () => void = () => {};
  let fail: (e: Error) => void = () => {};
  const promise = new Promise<void>((done, ko) => {
    release = done;
    fail = ko;
  });
  return { promise, release, fail };
};

/**
 * Un serveur et un `spawn` factices : chaque appel s'inscrit dans `events`,
 * dans l'ordre. `close` rend la main aussitôt ; le processus lancé dit
 * `spawn` (ou `error` avec `fails`) au tour suivant.
 */
function bench(opts: { fails?: boolean; busy?: () => Busy } = {}) {
  const events: string[] = [];
  const spawned: { command: string; args: string[]; options: SpawnOptions }[] = [];
  const exits: number[] = [];
  const said: string[] = [];
  const deps: RestartDeps = {
    execPath: '/usr/bin/node',
    execArgv: ['--require', '/tsx/preflight.cjs', '--import', 'file:///tsx/loader.mjs'],
    argv: ['/usr/bin/node', '/repo/scripts/quick/server.ts', '--no-open'],
    env: { NODE_ENV: 'development', PATH: '/usr/bin', QUICK_PORT: '4799', DEEPL_API_KEY: '' },
    cwd: '/repo',
    server: {
      close(done) {
        events.push('close');
        setTimeout(() => done?.(), 0);
      },
      closeAllConnections() {
        events.push('closeAllConnections');
      },
    },
    spawn(command, args, options) {
      events.push('spawn');
      spawned.push({ command, args, options });
      const child = new EventEmitter();
      setTimeout(() =>
        opts.fails ? child.emit('error', new Error('spawn ENOENT')) : child.emit('spawn'),
      );
      return child;
    },
    exit(code) {
      events.push(`exit ${code}`);
      exits.push(code);
    },
    say: (line) => said.push(line),
    busy: opts.busy,
    pollMs: 1,
  };
  return { deps, events, spawned, exits, said };
}

describe('« Relancer quick » — les gestes en cours', () => {
  it('compte un geste le temps qu’il court, sous sa route', async () => {
    const gestures = createGestures();
    const gate = held();
    const run = gestures.track('/api/ranks', () => gate.promise);
    expect(gestures.running()).toEqual(['/api/ranks']);
    expect(restartRefusal({ patchJob: undefined, gestures: gestures.running() })?.error).toContain(
      '/api/ranks',
    );
    gate.release();
    await run;
    expect(gestures.running()).toEqual([]);
    expect(restartRefusal({ patchJob: undefined, gestures: gestures.running() })).toBeNull();
  });

  it('décompte un geste qui échoue : la relance repasse', async () => {
    const gestures = createGestures();
    const gate = held();
    const run = gestures.track('/api/coupons', () => gate.promise);
    gate.fail(new Error('R2 injoignable'));
    await expect(run).rejects.toThrow('R2 injoignable');
    expect(gestures.running()).toEqual([]);
    expect(restartAnswer({ ...idle, gestures: gestures.running() }, 1).status).toBe(200);
  });

  it('garde les gestes simultanés, chacun le sien', async () => {
    const gestures = createGestures();
    const a = held();
    const b = held();
    const ra = gestures.track('/api/discord/send', () => a.promise);
    const rb = gestures.track('/api/ranks', () => b.promise);
    expect(gestures.running()).toEqual(['/api/discord/send', '/api/ranks']);
    a.release();
    await ra;
    expect(gestures.running()).toEqual(['/api/ranks']);
    b.release();
    await rb;
    expect(gestures.running()).toEqual([]);
  });
});

describe('« Relancer quick » — la route', () => {
  it('refuse (409) pendant un travail sous le verrou de « Patch », en le nommant', () => {
    const out = restartAnswer({ patchJob: 'git push', gestures: [] }, 1234);
    expect(out.status).toBe(409);
    expect(out.restart).toBe(false);
    expect(out.body).toEqual({
      ok: false,
      error: 'Relance refusée : un geste est en cours (git push) — attends sa fin.',
    });
  });

  it('refuse (409) pendant un geste qui stream, et dit lequel', async () => {
    const gestures = createGestures();
    const gate = held();
    const run = gestures.track('/api/patch/commit', () => gate.promise);
    const out = restartAnswer({ patchJob: 'pnpm commit', gestures: gestures.running() }, 1234);
    expect(out.status).toBe(409);
    expect(out.restart).toBe(false);
    expect(out.body.error).toContain('pnpm commit, /api/patch/commit');
    gate.release();
    await run;
  });

  it('refuse une seconde relance pendant la première : elle lancerait deux quick', () => {
    const out = restartAnswer({ ...idle, restarting: true }, 1234);
    expect(out.status).toBe(409);
    expect(out.restart).toBe(false);
    expect(out.body.error).toBe('Relance déjà en cours.');
  });

  it('accepte au repos, avec le PID qui sert (la page attend d’en voir un autre)', () => {
    const out = restartAnswer(idle, 1234);
    expect(out).toEqual({
      status: 200,
      body: { ok: true, log: ['quick redémarre…'], pid: 1234 },
      restart: true,
    });
  });
});

describe('« Relancer quick » — la relance', () => {
  it('relance le même node, ses options, son script et ses arguments, avec l’environnement reçu', () => {
    const { deps } = bench();
    const { command, args, options } = restartCommand(deps);
    expect(command).toBe('/usr/bin/node');
    expect(args).toEqual([
      '--require',
      '/tsx/preflight.cjs',
      '--import',
      'file:///tsx/loader.mjs',
      '/repo/scripts/quick/server.ts',
      '--no-open',
    ]);
    expect(options).toEqual({
      cwd: '/repo',
      // Une clé vidée au lancement le reste : le nouveau quick ne la reprend pas de `.env.local`.
      env: {
        NODE_ENV: 'development',
        PATH: '/usr/bin',
        QUICK_PORT: '4799',
        DEEPL_API_KEY: '',
        [RESTART_MARK]: '1',
      },
      stdio: 'inherit',
      detached: false,
    });
    // L'environnement reçu n'est pas touché.
    expect(deps.env[RESTART_MARK]).toBeUndefined();
  });

  it('libère le port AVANT de lancer le nouveau, et ne sort qu’une fois celui-ci parti', async () => {
    const { deps, events, spawned, exits } = bench();
    await restartQuick(deps);
    expect(events).toEqual(['close', 'closeAllConnections', 'spawn', `exit ${RESTART_EXIT_CODE}`]);
    expect(spawned).toHaveLength(1);
    expect(spawned[0].args.slice(-2)).toEqual(['/repo/scripts/quick/server.ts', '--no-open']);
    expect(spawned[0].options.env?.QUICK_PORT).toBe('4799');
    expect(exits).toEqual([RESTART_EXIT_CODE]);
  });

  it('un geste parti entre la réponse et la fermeture va au bout avant la relance', async () => {
    const gestures = createGestures();
    const gate = held();
    const run = gestures.track('/api/names', () => gate.promise);
    const { deps, events, said } = bench({
      busy: () => ({ patchJob: undefined, gestures: gestures.running() }),
    });
    const restarting = restartQuick(deps);
    await new Promise((done) => setTimeout(done, 20));
    expect(events).toEqual(['close', 'closeAllConnections']);
    expect(said).toContain('quick : un geste court encore, la relance attend sa fin…');
    gate.release();
    await run;
    await restarting;
    expect(events).toEqual(['close', 'closeAllConnections', 'spawn', `exit ${RESTART_EXIT_CODE}`]);
  });

  it('un nouveau quick qui ne part pas : sortie en 1, la raison dans la sortie', async () => {
    const { deps, exits, said } = bench({ fails: true });
    await restartQuick(deps);
    expect(exits).toEqual([1]);
    expect(said.at(-1)).toBe('quick : relance impossible — spawn ENOENT. Relance-le à la main.');
  });

  it('n’attend pas indéfiniment des connexions qui ne se ferment pas', async () => {
    const { deps, events } = bench();
    deps.server.close = () => events.push('close');
    deps.closeTimeoutMs = 5;
    await restartQuick(deps);
    expect(events).toEqual(['close', 'closeAllConnections', 'spawn', `exit ${RESTART_EXIT_CODE}`]);
  });
});

describe('« Relancer quick » — le nouveau quick', () => {
  it('lit la marque et l’efface, pour lui comme pour l’environnement transmis', () => {
    const env: Env = { [RESTART_MARK]: '1', PATH: '/usr/bin' };
    const launch: Env = { [RESTART_MARK]: '1' };
    expect(takeRestartMark(env, launch)).toBe(true);
    expect(env).toEqual({ PATH: '/usr/bin' });
    expect(launch).toEqual({});
    expect(takeRestartMark({ PATH: '/usr/bin' })).toBe(false);
  });

  it('réessaie le port pris, le dit une fois, puis abandonne avec un message clair', () => {
    expect(portBusy(1, 4747)).toEqual({
      retry: true,
      say: "quick : le port 4747 n'est pas encore libre, nouvel essai…",
    });
    expect(portBusy(2, 4747)).toEqual({ retry: true, say: null });
    expect(portBusy(PORT_RETRIES, 4747).retry).toBe(true);
    const out = portBusy(PORT_RETRIES + 1, 4747);
    expect(out.retry).toBe(false);
    expect(out.say).toBe(
      'quick : relance abandonnée — le port 4747 est toujours pris après 10 s. Un autre processus le tient ; arrête-le, puis relance quick.',
    );
  });
});
