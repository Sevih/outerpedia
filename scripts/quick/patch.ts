/**
 * quick/patch — la chaîne des données, lancée de la section « Patch ».
 *
 * Ce que Sevih tapait au terminal et cliquait dans l'admin à chaque patch du
 * jeu, en quatre gestes : rafraîchir depuis le client (`pnpm datagen:patch`,
 * la chaîne de `datagen/refresh.ts`, promote en DRY), relire la promotion
 * (`pnpm datagen:promote`), promouvoir (`--apply`), committer
 * (`pnpm commit --no-push`). Le push reste « Pousser », dans l'en-tête.
 *
 * Ce module CÂBLE, il ne réécrit rien : le lancement est celui de l'admin
 * (`spawnLauncher`, `pnpmInvocation`, `acquirePatchJob` de `patch-runner.ts`),
 * les arguments du commit aussi (`parsePublishRequest`, `publishArgs`). Ce
 * qu'il ajoute :
 *
 *   - la sortie va au `report` de quick (une ligne = un `step` du NDJSON de
 *     `stream`, cf. server.ts) et reste entière dans le résultat ;
 *   - la poignée du travail en cours est gardée ici : « Arrêter » (`stopJob`)
 *     lui envoie SIGTERM. L'admin, lui, laisse un travail aller au bout ;
 *   - un geste = un PLAN (`refreshPlan`, `promotePlan`, `commitPlan`) : son
 *     libellé et les arguments de pnpm, construits d'un corps de requête, ou le
 *     motif du refus. Purs — c'est eux que les tests lisent.
 *
 * UN SEUL travail à la fois : le verrou est celui de l'admin, sur `globalThis`,
 * que `/api/push` prend aussi (pousser pendant une promotion serait un
 * non-sens).
 */
import { spawn, type ChildProcess, type SpawnOptions } from 'node:child_process';
import { statSync } from 'node:fs';
import { resolve } from 'node:path';
import { COMMIT_MESSAGE_MAX, parsePublishRequest, publishArgs } from '@/lib/admin/patch-commands';
import {
  acquirePatchJob,
  pnpmInvocation,
  runningPatchJob,
  spawnLauncher,
} from '@/lib/admin/patch-runner';
import { findSteamInstall } from '@datagen/extract/steam';
import { ANDROID_GAMEDATA_ROOT, DEFAULT_GAMEDATA_ROOT } from '@datagen/lib/paths';
import type { SourceName } from '@datagen/refresh';
import { DASHBOARD_DISK, type GitState, type Outcome, type Report } from './actions';

// ---------------------------------------------------------------- lanceur ----

/** Ce qu'une commande lancée a rendu. */
export interface JobResult {
  ok: boolean;
  /** `null` : la commande n'a pas pu être lancée, ou un signal l'a coupée. */
  code: number | null;
  /** TOUTE la sortie, stdout et stderr mêlés, sans séquences ANSI. */
  out: string;
  /** Pourquoi rien n'a tourné : un travail en cours, ou `spawn` en échec. */
  error?: string;
  /** « Arrêter » l'a coupée. */
  stopped?: boolean;
}

export interface JobOptions {
  /** Défaut : la racine du dépôt, d'où quick est lancé. */
  cwd?: string;
  /** Ajouté à l'environnement du serveur (et à `GIT_TERMINAL_PROMPT=0`). */
  env?: Record<string, string | undefined>;
  /** Remplacé par les tests seulement : aucune vraie commande n'y part. */
  spawn?: typeof spawn;
}

/**
 * Sous Linux et macOS la commande part dans SON groupe de processus : pnpm
 * lance tsx, qui lance node, qui lance chaque étape de la chaîne par
 * `execFileSync`. Un SIGTERM à pnpm seul laisserait l'étape en cours finir en
 * orpheline, verrou relâché — « Arrêter » vise donc le groupe. Windows n'a pas
 * de groupe à signaler : la poignée seule.
 */
const GROUPED = process.platform !== 'win32';

/** Le travail lancé d'ici et sa poignée — ce que « Arrêter » coupe. */
let current: { label: string; child: ChildProcess; stopped: boolean } | null = null;

/** Le refus d'un second lancement : le texte du 409. */
export const busyError = (label: string | undefined = runningPatchJob()): string =>
  `Un travail tourne déjà : ${label ?? 'inconnu'}`;

/**
 * Ce que répond une route de la section quand un travail tourne (409), ou
 * `null` : rien ne tourne, elle peut lancer. `ok: false` pour que `post()` de
 * la page le lise comme un échec.
 */
export function busyRefusal(): { ok: false; error: string } | null {
  const label = runningPatchJob();
  return label === undefined ? null : { ok: false, error: busyError(label) };
}

/**
 * Lance UNE commande, sans shell, sous le verrou de l'admin, et attend sa fin.
 * Chaque ligne de sa sortie part au `report` dès qu'elle est écrite. Un
 * travail déjà en cours : rien n'est lancé, `error` le dit. Le verrou est
 * relâché à la sortie, quelle qu'elle soit.
 */
export async function runJob(
  label: string,
  command: string,
  args: readonly string[],
  report: Report,
  opts: JobOptions = {},
): Promise<JobResult> {
  const release = acquirePatchJob(label);
  if (!release) return { ok: false, code: null, out: '', error: busyError() };

  const lines: string[] = [];
  const say = (line: string): void => {
    lines.push(line);
    report(line);
  };
  let stopped = false;
  try {
    // La mécanique est celle de l'admin (lignes, ANSI, `spawn` qui échoue) ; on
    // ne lui glisse que le dossier, l'environnement, le groupe — et la poignée.
    const launch = spawnLauncher(say, ((cmd: string, argv: string[], options: SpawnOptions) => {
      const child = (opts.spawn ?? spawn)(cmd, argv, {
        ...options,
        cwd: opts.cwd ?? options.cwd,
        env: { ...options.env, ...opts.env } as NodeJS.ProcessEnv,
        detached: GROUPED,
      });
      current = { label, child, stopped: false };
      return child;
    }) as unknown as typeof spawn);
    const { code, error } = await launch(command, args);
    stopped = Boolean(current?.stopped);
    const out = lines.join('\n');
    if (error) return { ok: false, code, out, error };
    return { ok: code === 0 && !stopped, code, out, ...(stopped ? { stopped } : {}) };
  } finally {
    current = null;
    release();
  }
}

/**
 * « Arrêter » : SIGTERM au travail lancé d'ici, et à ce qu'il a lancé. Répond
 * ce qui a été arrêté — le flux du geste, lui, se clôt de lui-même quand la
 * commande sort. Un travail que ce module ne tient pas (un push, un geste de
 * l'admin sur le même verrou) ne s'arrête pas d'ici.
 */
export function stopJob(): { ok: true; stopped: string } | { ok: false; error: string } {
  if (!current) {
    const other = runningPatchJob();
    return {
      ok: false,
      error: other ? `« ${other} » ne s’arrête pas d’ici.` : 'Aucun travail en cours.',
    };
  }
  const { label, child } = current;
  current.stopped = true;
  let signalled = false;
  if (GROUPED && child.pid) {
    try {
      process.kill(-child.pid, 'SIGTERM');
      signalled = true;
    } catch {
      // Groupe déjà parti, ou jamais créé : la poignée, ci-dessous.
    }
  }
  if (!signalled) child.kill('SIGTERM');
  return { ok: true, stopped: label };
}

// ----------------------------------------------------------------- gestes ----

/** Un geste prêt à partir : son nom dans le verrou, et les arguments de pnpm. */
export interface Plan {
  label: string;
  args: string[];
}

export type Planned = Plan | { error: string };

const record = (body: unknown): Record<string, unknown> =>
  body !== null && typeof body === 'object' && !Array.isArray(body)
    ? (body as Record<string, unknown>)
    : {};

/**
 * Les options de « Rafraîchir » et leur flag dans la CLI de `refresh.ts`.
 * `--apply` n'y est PAS : cette route ne promeut jamais, la promotion est le
 * troisième geste, après la revue.
 */
const REFRESH_FLAGS = [
  ['force', '--force'],
  ['noPull', '--no-pull'],
  ['collect', '--collect'],
  ['news', '--news'],
] as const;

const SOURCE_LABELS: Record<SourceName, string> = { steam: 'Steam', android: 'Android' };

/** `POST /api/patch/refresh` : `pnpm datagen:patch` et ses flags. */
export function refreshPlan(body: unknown): Planned {
  const b = record(body);
  const { source } = b;
  if (source !== undefined && source !== 'steam' && source !== 'android')
    return { error: 'source attendue : steam ou android.' };
  const args = ['datagen:patch'];
  if (source) args.push('--source', source);
  for (const [key, flag] of REFRESH_FLAGS) if (b[key] === true) args.push(flag);
  return {
    label: `rafraîchissement depuis le jeu${source ? ` (${SOURCE_LABELS[source]})` : ''}`,
    args,
  };
}

/** `POST /api/patch/promote` : le dry-run de revue, ou la promotion. */
export function promotePlan(body: unknown): Planned {
  const { apply } = record(body);
  if (typeof apply !== 'boolean') return { error: 'apply attendu : true ou false.' };
  return apply
    ? { label: 'promotion de l’extraction', args: ['datagen:promote', '--apply'] }
    : { label: 'dry-run de la promotion', args: ['datagen:promote'] };
}

/**
 * `POST /api/patch/commit` : `pnpm commit --no-push`, message et bump validés
 * par l'admin (`commitMessageError`, `isBump`) AVANT tout lancement.
 */
export function commitPlan(body: unknown): Planned {
  const parsed = parsePublishRequest(body);
  if (!parsed.ok) return { error: parsed.error };
  return { label: 'commit des données', args: publishArgs(parsed.request) };
}

/** La commande telle qu'on la taperait : un argument à espaces entre guillemets. */
export const displayCommand = (args: readonly string[]): string =>
  ['pnpm', ...args.map((a) => (/\s/.test(a) ? `"${a}"` : a))].join(' ');

/** Combien de lignes de la sortie le journal reprend quand un geste échoue. */
const TAIL = 15;

/** L'issue d'un geste : le journal de l'en-tête, et le code de la commande. */
export interface GestureOutcome extends Outcome {
  code: number | null;
  stopped?: boolean;
}

/**
 * Déroule un plan : la commande en première ligne, sa sortie au fil, puis
 * l'issue. Le journal rendu (`log`) est court — une ligne quand ça passe, la
 * fin de la sortie quand ça casse : la sortie entière est dans la console de
 * la section, qui a reçu chaque ligne.
 */
export async function runGesture(
  plan: Plan,
  report: Report,
  opts: JobOptions & { pnpm?: { command: string; args: string[] } } = {},
): Promise<GestureOutcome> {
  const pnpm = opts.pnpm ?? pnpmInvocation();
  report(`$ ${displayCommand(plan.args)}`);
  const job = await runJob(plan.label, pnpm.command, [...pnpm.args, ...plan.args], report, opts);
  if (job.error) return { ok: false, code: job.code, log: [job.error] };
  if (job.stopped)
    return { ok: false, code: job.code, stopped: true, log: [`${plan.label} : arrêté.`] };
  if (job.ok) return { ok: true, code: job.code, log: [`${plan.label} : terminé.`] };
  return {
    ok: false,
    code: job.code,
    log: [
      ...job.out
        .split('\n')
        .filter((l) => l.trim())
        .slice(-TAIL),
      `${plan.label} : échec (code ${job.code ?? 'inconnu'}) — toute la sortie est dans la console de « Patch ».`,
    ],
  };
}

// ------------------------------------------------------------------- état ----

/** Les lectures de `/api/patch/state`, injectées. */
export interface PatchDisk {
  /** Le travail sous le verrou, d'où qu'il vienne. */
  job: () => string | undefined;
  /** `DATAGEN_SOURCE`, brut. */
  source: () => string | undefined;
  /** Un client Steam est-il installé sur ce poste ? */
  steam: () => boolean;
  /** Les deux versions du tableau de bord : le site, le client installé. */
  siteVersion: () => string;
  clientVersion: () => string | null;
  /** Date (ms) du checkpoint de reprise de cette source ; `null` s'il n'y en a pas. */
  checkpoint: (source: SourceName) => number | null;
  gitState: () => GitState;
  /** `git status --porcelain`, brut. */
  porcelain: () => string;
}

/**
 * La racine gamedata d'une source, comme `resolveSource` de `refresh.ts` la
 * choisit — sans rien poser dans l'environnement, lui.
 */
const gamedataRootOf = (source: SourceName): string =>
  resolve(
    process.env.GAMEDATA_ROOT ??
      (source === 'android' ? ANDROID_GAMEDATA_ROOT : DEFAULT_GAMEDATA_ROOT),
  );

export const PATCH_DISK: PatchDisk = {
  job: runningPatchJob,
  source: () => process.env.DATAGEN_SOURCE,
  steam: () => findSteamInstall() !== null,
  siteVersion: DASHBOARD_DISK.siteVersion,
  clientVersion: DASHBOARD_DISK.clientVersion,
  checkpoint: (source) =>
    statSync(resolve(gamedataRootOf(source), '.refresh-checkpoint.json'), {
      throwIfNoEntry: false,
    })?.mtimeMs ?? null,
  gitState: DASHBOARD_DISK.gitState,
  porcelain: DASHBOARD_DISK.porcelain,
};

export type PatchBlock = 'steam' | 'site' | 'client' | 'checkpoint' | 'git';

/**
 * Ce que la section montre au repos : le travail en cours, la source par
 * défaut, le client Steam, les versions site / client, la reprise qui attend
 * (par source — la page en change), et le dépôt (le commit ne sert à rien
 * sans fichier modifié). Une lecture qui lève rend `null` pour la sienne et sa
 * raison dans `errors`, comme le tableau de bord.
 */
export function patchState(disk: PatchDisk = PATCH_DISK) {
  const errors: Partial<Record<PatchBlock, string>> = {};
  const read = <T>(name: PatchBlock, of: () => T): T | null => {
    try {
      return of();
    } catch (e: unknown) {
      errors[name] = e instanceof Error ? e.message : String(e);
      return null;
    }
  };
  const iso = (ms: number | null): string | null =>
    ms === null ? null : new Date(ms).toISOString();

  return {
    job: disk.job() ?? null,
    source: (disk.source() === 'android' ? 'android' : 'steam') as SourceName,
    steam: read('steam', disk.steam) ?? false,
    site: read('site', disk.siteVersion),
    client: read('client', disk.clientVersion),
    checkpoint: read('checkpoint', () => ({
      steam: iso(disk.checkpoint('steam')),
      android: iso(disk.checkpoint('android')),
    })) ?? { steam: null, android: null },
    git: read('git', () => ({
      ...disk.gitState(),
      dirty: disk.porcelain().split('\n').filter(Boolean).length,
    })),
    messageMax: COMMIT_MESSAGE_MAX,
    errors,
  };
}
