/**
 * Contrat de la section « Patch » côté serveur : le lanceur (`runJob`), le
 * verrou qu'il partage avec l'admin, « Arrêter » (`stopJob`), les arguments de
 * chaque geste et leurs refus, et l'état au repos (`patchState`).
 *
 * AUCUNE commande ne part d'ici : `spawn` est factice — un enfant qui écrit
 * les lignes qu'on lui donne et sort avec le code qu'on lui dit —, et les
 * lectures de l'état sont injectées.
 */
import type { SpawnOptions, spawn } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { acquirePatchJob, runningPatchJob } from '@/lib/admin/patch-runner';
import {
  busyRefusal,
  commitPlan,
  displayCommand,
  patchState,
  promotePlan,
  refreshPlan,
  runGesture,
  runJob,
  stopJob,
  type PatchDisk,
  type Plan,
} from './patch';

/** Un enfant factice : on y écrit, puis on le fait sortir. */
function fakeChild() {
  const child = Object.assign(new EventEmitter(), {
    stdout: new PassThrough(),
    stderr: new PassThrough(),
    signals: [] as string[],
    /** Écrit sur les deux sorties, les ferme, puis sort avec `code`. */
    exit(code: number | null, out = '', err = '') {
      child.stdout.on('end', () => setImmediate(() => child.emit('close', code)));
      child.stderr.end(err);
      child.stdout.end(out);
    },
    /** Un signal reçu : comme un vrai processus, il sort sans code. */
    kill(signal: string) {
      child.signals.push(signal);
      child.exit(null);
      return true;
    },
  });
  return child;
}
type FakeChild = ReturnType<typeof fakeChild>;

/** Note ce que `spawn` reçoit ; `script` dit ce que fait chaque enfant lancé. */
function fakeSpawn(script: (child: FakeChild) => void = (child) => child.exit(0)) {
  const spawned: Array<{ command: string; args: readonly string[]; options: SpawnOptions }> = [];
  const children: FakeChild[] = [];
  const spawnFn = ((command: string, args: readonly string[], options: SpawnOptions) => {
    spawned.push({ command, args, options });
    const child = fakeChild();
    children.push(child);
    script(child);
    return child;
  }) as unknown as typeof spawn;
  return { spawned, children, spawnFn };
}

/** Le `report` de quick : les lignes reçues, dans l'ordre. */
const reporter = () => {
  const said: string[] = [];
  return { said, report: (line: string): void => void said.push(line) };
};

/** Laisse passer les `setImmediate` des enfants factices. */
const tick = (): Promise<void> => new Promise((done) => setImmediate(done));

describe('runJob — le lanceur de la section « Patch »', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('relaie chaque ligne dès qu’elle sort, garde tout, rend le code', async () => {
    const { spawned, spawnFn } = fakeSpawn((child) =>
      child.exit(0, '▶ pull\n\u001b[32m✓\u001b[0m 3 fichiers\r\n', 'avertissement\n'),
    );
    const { said, report } = reporter();
    const done = await runJob('essai', 'pnpm', ['datagen:patch', '--news'], report, {
      spawn: spawnFn,
    });

    expect(spawned.map((s) => [s.command, ...s.args])).toEqual([
      ['pnpm', 'datagen:patch', '--news'],
    ]);
    // stdout et stderr, mêlés ; les séquences ANSI retirées.
    expect([...said].sort()).toEqual(['avertissement', '▶ pull', '✓ 3 fichiers'].sort());
    expect(said.indexOf('▶ pull')).toBeLessThan(said.indexOf('✓ 3 fichiers'));
    expect(done).toEqual({ ok: true, code: 0, out: said.join('\n') });
  });

  it('part sans shell, dans son dossier, avec l’environnement du serveur', async () => {
    vi.stubEnv('PATCH_TEMOIN', 'gardé');
    const { spawned, spawnFn } = fakeSpawn();
    await runJob('essai', 'node', ['x.js'], () => {}, {
      spawn: spawnFn,
      cwd: '/tmp/ailleurs',
      env: { GAMEDATA_ROOT: '.gamedata-essai' },
    });
    const { options } = spawned[0];
    expect(options.shell).toBe(false);
    expect(options.cwd).toBe('/tmp/ailleurs');
    expect(options.stdio).toEqual(['ignore', 'pipe', 'pipe']);
    expect(options.env).toMatchObject({
      PATCH_TEMOIN: 'gardé',
      GIT_TERMINAL_PROMPT: '0',
      GAMEDATA_ROOT: '.gamedata-essai',
    });
    // Son groupe de processus, pour qu'« Arrêter » coupe aussi ce qu'il lance.
    expect(options.detached).toBe(process.platform !== 'win32');
    // Sans `cwd` : la racine du dépôt, d'où quick tourne.
    await runJob('essai', 'node', [], () => {}, { spawn: spawnFn });
    expect(spawned[1].options.cwd).toBe(process.cwd());
  });

  it('un code de sortie non nul est un échec, sortie comprise — et le verrou est relâché', async () => {
    const { spawnFn } = fakeSpawn((child) => child.exit(3, 'étape 1\n', '✗ extract a échoué\n'));
    const done = await runJob('essai', 'pnpm', [], () => {}, { spawn: spawnFn });
    expect(done.ok).toBe(false);
    expect(done.code).toBe(3);
    expect(done.out.split('\n').sort()).toEqual(['étape 1', '✗ extract a échoué'].sort());
    expect(runningPatchJob()).toBeUndefined();
  });

  it('une commande qui ne se lance pas rend son erreur — et le verrou', async () => {
    const thrower = (() => {
      throw new Error('spawn pnpm ENOENT');
    }) as unknown as typeof spawn;
    expect(await runJob('essai', 'pnpm', [], () => {}, { spawn: thrower })).toEqual({
      ok: false,
      code: null,
      out: '',
      error: 'spawn pnpm ENOENT',
    });
    expect(runningPatchJob()).toBeUndefined();

    // L'événement `error` de l'enfant (binaire introuvable), lui aussi.
    const { spawnFn } = fakeSpawn((child) =>
      setImmediate(() => child.emit('error', new Error('ENOENT'))),
    );
    const late = await runJob('essai', 'pnpm', [], () => {}, { spawn: spawnFn });
    expect(late).toMatchObject({ ok: false, code: null, error: 'ENOENT' });
    expect(runningPatchJob()).toBeUndefined();
  });

  it('un seul travail à la fois : le second est refusé sans rien lancer', async () => {
    const { spawned, children, spawnFn } = fakeSpawn(() => {});
    const first = runJob('dry-run de la promotion', 'pnpm', ['datagen:promote'], () => {}, {
      spawn: spawnFn,
    });
    expect(runningPatchJob()).toBe('dry-run de la promotion');
    expect(busyRefusal()).toEqual({
      ok: false,
      error: 'Un travail tourne déjà : dry-run de la promotion',
    });

    const { said, report } = reporter();
    expect(
      await runJob('commit des données', 'pnpm', ['commit'], report, { spawn: spawnFn }),
    ).toEqual({
      ok: false,
      code: null,
      out: '',
      error: 'Un travail tourne déjà : dry-run de la promotion',
    });
    expect(spawned).toHaveLength(1);
    expect(said).toEqual([]);
    // Le refus n'a pas rendu le verrou du premier.
    expect(runningPatchJob()).toBe('dry-run de la promotion');

    children[0].exit(0);
    expect((await first).ok).toBe(true);
    expect(runningPatchJob()).toBeUndefined();
    expect(busyRefusal()).toBeNull();
    // Libre : le suivant part.
    const { spawnFn: next } = fakeSpawn();
    expect((await runJob('commit des données', 'pnpm', [], () => {}, { spawn: next })).ok).toBe(
      true,
    );
  });

  it('le verrou est celui de l’admin : un geste lancé de là-bas refuse celui-ci', async () => {
    const release = acquirePatchJob('git push');
    const { spawned, spawnFn } = fakeSpawn();
    expect((await runJob('essai', 'pnpm', [], () => {}, { spawn: spawnFn })).error).toBe(
      'Un travail tourne déjà : git push',
    );
    expect(spawned).toEqual([]);
    release?.();
  });
});

describe('stopJob — « Arrêter »', () => {
  it('envoie SIGTERM au travail en cours, qui se clôt en « arrêté »', async () => {
    const { children, spawnFn } = fakeSpawn((child) => child.stdout.write('▶ extract\n'));
    const { said, report } = reporter();
    const running = runJob('rafraîchissement depuis le jeu (Steam)', 'pnpm', [], report, {
      spawn: spawnFn,
    });
    await tick();
    expect(said).toEqual(['▶ extract']);

    expect(stopJob()).toEqual({ ok: true, stopped: 'rafraîchissement depuis le jeu (Steam)' });
    expect(children[0].signals).toEqual(['SIGTERM']);
    expect(await running).toEqual({ ok: false, code: null, out: '▶ extract', stopped: true });
    expect(runningPatchJob()).toBeUndefined();
  });

  it('une commande arrêtée qui sort quand même en 0 n’est pas un succès', async () => {
    const { children, spawnFn } = fakeSpawn(() => {});
    const running = runJob('essai', 'pnpm', [], () => {}, { spawn: spawnFn });
    children[0].kill = (signal: string) => {
      children[0].signals.push(signal);
      children[0].exit(0);
      return true;
    };
    stopJob();
    expect(await running).toMatchObject({ ok: false, code: 0, stopped: true });
  });

  it('rien ne tourne : rien à arrêter', () => {
    expect(stopJob()).toEqual({ ok: false, error: 'Aucun travail en cours.' });
  });

  it('un travail tenu ailleurs (un push, l’admin) ne s’arrête pas d’ici', () => {
    const release = acquirePatchJob('git push');
    expect(stopJob()).toEqual({ ok: false, error: '« git push » ne s’arrête pas d’ici.' });
    expect(runningPatchJob()).toBe('git push');
    release?.();
  });

  it('le travail suivant n’hérite pas de l’arrêt du précédent', async () => {
    const stopped = fakeSpawn(() => {});
    const first = runJob('premier', 'pnpm', [], () => {}, { spawn: stopped.spawnFn });
    stopJob();
    await first;
    const { spawnFn } = fakeSpawn();
    expect(await runJob('second', 'pnpm', [], () => {}, { spawn: spawnFn })).toEqual({
      ok: true,
      code: 0,
      out: '',
    });
  });
});

describe('les plans — ce que chaque geste lance', () => {
  const args = (plan: unknown): string[] => (plan as Plan).args;

  it('rafraîchir : `pnpm datagen:patch`, un flag par option cochée', () => {
    expect(refreshPlan({})).toEqual({
      label: 'rafraîchissement depuis le jeu',
      args: ['datagen:patch'],
    });
    expect(refreshPlan({ source: 'steam', collect: true, news: true })).toEqual({
      label: 'rafraîchissement depuis le jeu (Steam)',
      args: ['datagen:patch', '--source', 'steam', '--collect', '--news'],
    });
    expect(
      refreshPlan({ source: 'android', force: true, noPull: true, collect: true, news: true }),
    ).toEqual({
      label: 'rafraîchissement depuis le jeu (Android)',
      args: ['datagen:patch', '--source', 'android', '--force', '--no-pull', '--collect', '--news'],
    });
    // Décoché, absent, ou autre chose que `true` : pas de flag.
    expect(args(refreshPlan({ force: false, news: 'oui', collect: 1 }))).toEqual(['datagen:patch']);
    // Un corps illisible (la page envoie toujours un objet) : la commande nue.
    expect(args(refreshPlan(null))).toEqual(['datagen:patch']);
  });

  it('rafraîchir ne promeut JAMAIS : `--apply` ne peut pas y entrer', () => {
    for (const body of [
      { apply: true },
      { apply: true, force: true, source: 'steam' },
      { '--apply': true },
      { news: '--apply', collect: '--apply' },
    ])
      expect(args(refreshPlan(body)), JSON.stringify(body)).not.toContain('--apply');
    // Ni par la source, qui est une liste close.
    for (const source of ['--apply', 'steam --apply', 'ios', '', 42, null])
      expect(refreshPlan({ source }), String(source)).toEqual({
        error: 'source attendue : steam ou android.',
      });
  });

  it('promotion : le dry-run de revue, ou `--apply` — sur un booléen, rien d’autre', () => {
    expect(promotePlan({ apply: false })).toEqual({
      label: 'dry-run de la promotion',
      args: ['datagen:promote'],
    });
    expect(promotePlan({ apply: true })).toEqual({
      label: 'promotion de l’extraction',
      args: ['datagen:promote', '--apply'],
    });
    for (const body of [{}, null, { apply: 'true' }, { apply: 1 }])
      expect(promotePlan(body), JSON.stringify(body)).toEqual({
        error: 'apply attendu : true ou false.',
      });
  });

  it('commit : les arguments de l’admin, `--no-push` toujours', () => {
    expect(commitPlan({ message: 'chore(data): patch du 08/10', bump: 'patch' })).toEqual({
      label: 'commit des données',
      args: [
        'commit',
        '--msg',
        'chore(data): patch du 08/10',
        '--bump',
        'patch',
        '--yes',
        '--no-push',
      ],
    });
    expect(args(commitPlan({ message: 'feat(data): saison 4', bump: 'minor' }))).toContain('minor');
  });

  it('commit : refusé AVANT de lancer — message vide ou mal formé, bump inconnu', () => {
    expect(commitPlan({ message: '', bump: 'patch' })).toEqual({
      error: 'message de commit attendu.',
    });
    expect(commitPlan({ bump: 'patch' })).toEqual({ error: 'message de commit attendu.' });
    expect(commitPlan({ message: 'patch du jour', bump: 'patch' })).toEqual({
      error: 'préfixe conventionnel exigé — ex. « chore(data): patch du 06/10 ».',
    });
    expect(commitPlan({ message: 'chore(data): $(rm -rf .)', bump: 'patch' })).toEqual({
      error: 'caractères refusés dans le message : " $ ` \\ %.',
    });
    expect(commitPlan({ message: `chore(data): ${'x'.repeat(200)}`, bump: 'patch' })).toMatchObject(
      {
        error: expect.stringMatching(/^message trop long/),
      },
    );
    for (const bump of ['', 'hotfix', undefined, '--no-verify'])
      expect(commitPlan({ message: 'chore(data): patch', bump }), String(bump)).toEqual({
        error: 'bump attendu : patch, minor, major.',
      });
    expect(commitPlan(null)).toEqual({ error: 'objet JSON attendu.' });
  });

  it('displayCommand : la commande comme on la taperait', () => {
    expect(displayCommand(['datagen:promote', '--apply'])).toBe('pnpm datagen:promote --apply');
    expect(displayCommand(['commit', '--msg', 'chore(data): patch du 08/10', '--yes'])).toBe(
      'pnpm commit --msg "chore(data): patch du 08/10" --yes',
    );
  });
});

describe('runGesture — un plan, de la commande à l’issue', () => {
  const PNPM = { command: '/usr/bin/node', args: ['/x/pnpm.cjs'] };
  const promote: Plan = {
    label: 'promotion de l’extraction',
    args: ['datagen:promote', '--apply'],
  };

  it('lance pnpm sans shell, la commande en première ligne, puis une ligne d’issue', async () => {
    const { spawned, spawnFn } = fakeSpawn((child) =>
      child.exit(0, '~ characters.json : 2 modifiées\n✓ 4 fichier(s) promu(s)\n'),
    );
    const { said, report } = reporter();
    expect(await runGesture(promote, report, { spawn: spawnFn, pnpm: PNPM })).toEqual({
      ok: true,
      code: 0,
      log: ['promotion de l’extraction : terminé.'],
    });
    expect(spawned.map((s) => [s.command, ...s.args])).toEqual([
      ['/usr/bin/node', '/x/pnpm.cjs', 'datagen:promote', '--apply'],
    ]);
    expect(said).toEqual([
      '$ pnpm datagen:promote --apply',
      '~ characters.json : 2 modifiées',
      '✓ 4 fichier(s) promu(s)',
    ]);
    expect(runningPatchJob()).toBeUndefined();
  });

  it('un échec : la fin de la sortie au journal, le code, où lire le reste', async () => {
    const out = Array.from({ length: 40 }, (_, i) => `ligne ${i + 1}`).join('\n\n');
    const { spawnFn } = fakeSpawn((child) => child.exit(1, `${out}\n`));
    const done = await runGesture(promote, () => {}, { spawn: spawnFn, pnpm: PNPM });
    expect(done.ok).toBe(false);
    expect(done.code).toBe(1);
    // Les quinze dernières lignes non vides, puis le verdict.
    expect(done.log).toHaveLength(16);
    expect(done.log[0]).toBe('ligne 26');
    expect(done.log[14]).toBe('ligne 40');
    expect(done.log[15]).toBe(
      'promotion de l’extraction : échec (code 1) — toute la sortie est dans la console de « Patch ».',
    );
  });

  it('arrêté : une ligne, et ce n’est pas un succès', async () => {
    const { spawnFn } = fakeSpawn(() => {});
    const running = runGesture(promote, () => {}, { spawn: spawnFn, pnpm: PNPM });
    expect(stopJob()).toEqual({ ok: true, stopped: 'promotion de l’extraction' });
    expect(await running).toEqual({
      ok: false,
      code: null,
      stopped: true,
      log: ['promotion de l’extraction : arrêté.'],
    });
  });

  it('un travail tourne déjà : le refus, sans même la ligne de commande suivante lancée', async () => {
    const release = acquirePatchJob('commit des données');
    const { spawned, spawnFn } = fakeSpawn();
    expect(await runGesture(promote, () => {}, { spawn: spawnFn, pnpm: PNPM })).toEqual({
      ok: false,
      code: null,
      log: ['Un travail tourne déjà : commit des données'],
    });
    expect(spawned).toEqual([]);
    release?.();
  });
});

describe('patchState — ce que la section montre au repos', () => {
  const disk = (over: Partial<PatchDisk> = {}): PatchDisk => ({
    job: () => undefined,
    source: () => undefined,
    steam: () => true,
    siteVersion: () => '1.11.402',
    clientVersion: () => '1.11.404',
    checkpoint: () => null,
    gitState: () => ({ branch: 'main', ahead: 2, behind: 0 }),
    porcelain: () => ' M data/generated/characters.json\n?? data/generated/new.json\n',
    ...over,
  });

  it('le poste au repos : versions, dépôt, rien en cours', () => {
    expect(patchState(disk())).toEqual({
      job: null,
      source: 'steam',
      steam: true,
      site: '1.11.402',
      client: '1.11.404',
      checkpoint: { steam: null, android: null },
      git: { branch: 'main', ahead: 2, behind: 0, dirty: 2 },
      messageMax: 200,
      errors: {},
    });
  });

  it('la source par défaut suit `DATAGEN_SOURCE`, steam sinon', () => {
    expect(patchState(disk({ source: () => 'android' })).source).toBe('android');
    expect(patchState(disk({ source: () => 'steam' })).source).toBe('steam');
    expect(patchState(disk({ source: () => 'ios' })).source).toBe('steam');
  });

  it('sans client Steam : dit, et l’Android reste possible', () => {
    const state = patchState(disk({ steam: () => false, clientVersion: () => null }));
    expect(state.steam).toBe(false);
    expect(state.client).toBeNull();
    expect(state.errors).toEqual({});
  });

  it('une reprise attend : la date du checkpoint, par source', () => {
    const at = Date.UTC(2026, 9, 8, 12, 30);
    const asked: string[] = [];
    const state = patchState(
      disk({
        checkpoint: (source) => {
          asked.push(source);
          return source === 'steam' ? at : null;
        },
      }),
    );
    expect(state.checkpoint).toEqual({ steam: '2026-10-08T12:30:00.000Z', android: null });
    expect(asked).toEqual(['steam', 'android']);
  });

  it('le travail en cours, d’où qu’il vienne', () => {
    expect(patchState(disk({ job: () => 'git push' })).job).toBe('git push');
    const release = acquirePatchJob('commit des données');
    expect(patchState({ ...disk(), job: runningPatchJob }).job).toBe('commit des données');
    release?.();
  });

  it('un dépôt propre : zéro fichier modifié', () => {
    expect(patchState(disk({ porcelain: () => '' })).git?.dirty).toBe(0);
  });

  it('une lecture qui lève rend `null` et sa raison, les autres sont servies', () => {
    const boom = (why: string) => () => {
      throw new Error(why);
    };
    const state = patchState(
      disk({
        siteVersion: boom('game-version.json illisible'),
        clientVersion: boom('manifest.dat illisible'),
        porcelain: boom('git status a échoué'),
        steam: boom('registre illisible'),
        checkpoint: boom('EACCES'),
      }),
    );
    expect(state).toMatchObject({
      site: null,
      client: null,
      git: null,
      steam: false,
      checkpoint: { steam: null, android: null },
      errors: {
        site: 'game-version.json illisible',
        client: 'manifest.dat illisible',
        git: 'git status a échoué',
        steam: 'registre illisible',
        checkpoint: 'EACCES',
      },
    });
    expect(state.job).toBeNull();
  });
});
