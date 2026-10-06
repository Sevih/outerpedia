/**
 * LANCEMENT des gestes « patch » de l'accueil admin (dev uniquement) : une
 * commande du dépôt (ou, pour le push, une courte séquence), sa sortie relayée
 * ligne à ligne en NDJSON — même principe que `stream()` de
 * `scripts/quick/server.ts`, en `ReadableStream`.
 *
 * Trois garanties :
 *  - PAS de shell : la commande et ses arguments vont tels quels à `spawn`, rien
 *    de ce qui vient de la page n'est interpolé dans une chaîne ;
 *  - UN SEUL travail à la fois (`acquirePatchJob`) : la promotion réécrit
 *    `data/generated`, le commit le lit et l'enregistre, le push l'envoie ;
 *  - un travail lancé VA AU BOUT : fermer l'onglet ne le tue pas. Couper
 *    `pnpm commit` entre le push R2 et le push git laisserait la prod servir
 *    des images que le dépôt n'enregistre pas (cf. `preflight` de `commit.ts`).
 */
import { spawn } from 'node:child_process';
import {
  CURRENT_BRANCH_ARGS,
  createLineSplitter,
  pushArgs,
  pushBranchError,
  pushCompareArgs,
  pushFetchArgs,
  pushRefusal,
  pushVerifyArgs,
  stripAnsi,
  type PatchDone,
  type PatchEvent,
} from './patch-commands';

/**
 * Le verrou vit sur `globalThis` : en dev, Next recharge les modules à chaud et
 * compile chaque route à part — une variable de module serait remise à zéro, ou
 * dédoublée entre `promote`, `commit` et `push`, pendant qu'un travail tourne.
 */
const SLOT = Symbol.for('outerpedia.admin.patch-job');
const slot = globalThis as unknown as Record<symbol, string | undefined>;

/** Libellé du travail en cours, s'il y en a un. */
export const runningPatchJob = (): string | undefined => slot[SLOT];

/**
 * Prend le verrou pour `label`. Rend la fonction qui le relâche (sans effet au
 * second appel), ou `null` si un travail tourne déjà.
 */
export function acquirePatchJob(label: string): (() => void) | null {
  if (slot[SLOT] !== undefined) return null;
  slot[SLOT] = label;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    slot[SLOT] = undefined;
  };
}

/**
 * Comment lancer pnpm SANS shell. Sous Windows `pnpm` est un `.cmd`, que
 * `spawn` refuse sans interpréteur ; mais le serveur de dev est lui-même lancé
 * par `pnpm dev`, qui pose `npm_execpath` (le script JS de pnpm) : on relance ce
 * script avec le node courant. Sans cette variable, `pnpm` du PATH.
 */
export function pnpmInvocation(
  entry: string | undefined = process.env.npm_execpath,
  execPath: string = process.execPath,
): { command: string; args: string[] } {
  return entry && /\.[cm]?js$/.test(entry)
    ? { command: execPath, args: [entry] }
    : { command: 'pnpm', args: [] };
}

const HEADERS = {
  'content-type': 'application/x-ndjson; charset=utf-8',
  'cache-control': 'no-store',
};

const ndjson = (event: PatchEvent): string => `${JSON.stringify(event)}\n`;

/** Réponse NDJSON d'une seule ligne `done` en échec (refus, corps invalide). */
export function refusePatchJob(error: string, status: number): Response {
  return new Response(ndjson({ done: { ok: false, error } }), { status, headers: HEADERS });
}

export interface PatchCommand {
  /** Nom du travail, rendu au second clic (« déjà en cours — … »). */
  label: string;
  /** La commande telle qu'on la taperait — première ligne du journal. */
  display: string;
  command: string;
  args: string[];
}

/** Ce qu'une commande lancée a rendu : son code de sortie et sa sortie standard. */
export interface LaunchResult {
  /** `null` si la commande n'a pas pu être lancée (cf. `error`) ou a été tuée. */
  code: number | null;
  stdout: string;
  error?: string;
}

/**
 * Lance UNE commande et attend sa fin. Le vrai lanceur (`spawnLauncher`) relaie
 * aussi la sortie dans le journal ; les tests en injectent un factice.
 */
export type PatchLauncher = (command: string, args: readonly string[]) => Promise<LaunchResult>;

/** Un travail : il écrit dans le journal (`say`), lance ses commandes, rend l'issue. */
export type PatchJob = (say: (line: string) => void, launch: PatchLauncher) => Promise<PatchDone>;

const toDone = ({ code, error }: LaunchResult): PatchDone =>
  error ? { ok: false, error } : { ok: code === 0, code };

/**
 * L'environnement des commandes : celui du serveur, plus `GIT_TERMINAL_PROMPT=0`.
 * Elles héritent du terminal du serveur de dev, et git y demande ses
 * identifiants en direct (`/dev/tty`, pas stdin) : un `git fetch` ou un
 * `git push` y attendrait une saisie que la page ne voit pas, verrou tenu. Avec
 * la variable il échoue aussitôt, et son message part dans le journal. Posée
 * pour TOUTES les commandes : `pnpm commit` lance lui-même des `git fetch`.
 */
const patchEnv = (base: NodeJS.ProcessEnv = process.env): NodeJS.ProcessEnv => ({
  ...base,
  GIT_TERMINAL_PROMPT: '0',
});

/**
 * Le lanceur réel : `spawn` sans shell, à la racine du dépôt, avec
 * l'environnement du serveur (`patchEnv`) ; stdout et stderr vont, mêlés, dans
 * le journal. `spawnFn` n'est remplacé que par les tests.
 */
export const spawnLauncher =
  (say: (line: string) => void, spawnFn: typeof spawn = spawn): PatchLauncher =>
  (command, args) =>
    new Promise((resolve) => {
      let stdout = '';
      try {
        const child = spawnFn(command, [...args], {
          cwd: process.cwd(),
          env: patchEnv(),
          shell: false,
          stdio: ['ignore', 'pipe', 'pipe'],
          windowsHide: true,
        });
        for (const out of [child.stdout, child.stderr]) {
          const lines = createLineSplitter((line) => say(stripAnsi(line)));
          out.setEncoding('utf8');
          out.on('data', lines.push);
          out.on('end', lines.flush);
        }
        child.stdout.on('data', (chunk: string) => {
          stdout += chunk;
        });
        child.on('error', (e) => resolve({ code: null, stdout, error: e.message }));
        child.on('close', (code) => resolve({ code, stdout }));
      } catch (e) {
        resolve({ code: null, stdout, error: (e as Error).message });
      }
    });

/**
 * Déroule `job` sous le verrou et rend son journal en flux NDJSON, clos par
 * `done`. Un travail déjà en cours → 409, rien n'est lancé.
 */
function streamPatchJob(label: string, job: PatchJob): Response {
  const release = acquirePatchJob(label);
  if (!release) return refusePatchJob(`déjà en cours — ${runningPatchJob()}`, 409);

  // Le lecteur peut partir avant la fin (onglet fermé) : on cesse d'écrire,
  // le travail, lui, continue et garde le verrou jusqu'à sa sortie.
  let listening = true;
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (event: PatchEvent): void => {
        if (!listening) return;
        try {
          controller.enqueue(encoder.encode(ndjson(event)));
        } catch {
          listening = false;
        }
      };
      const finish = (done: PatchDone): void => {
        release();
        send({ done });
        if (!listening) return;
        try {
          controller.close();
        } catch {
          /* flux déjà fermé par le lecteur */
        }
      };

      const say = (line: string): void => send({ line });
      job(say, spawnLauncher(say)).then(finish, (e: unknown) =>
        finish({ ok: false, error: (e as Error).message }),
      );
    },
    cancel() {
      listening = false;
    },
  });
  return new Response(body, { headers: HEADERS });
}

/**
 * Lance la commande à la racine du dépôt, avec l'environnement du serveur, et
 * rend sa sortie (stdout et stderr mêlés) en flux NDJSON, close par `done`.
 * Un travail déjà en cours → 409, rien n'est lancé.
 */
export function streamPatchCommand({ label, display, command, args }: PatchCommand): Response {
  return streamPatchJob(label, async (say, launch) => {
    say(`$ ${display}`);
    return toDone(await launch(command, args));
  });
}

/**
 * Le push, par la séquence de `commit.ts` : la branche courante, lue ICI, puis
 * son pré-vol (`preflight` — non importable : `commit.ts` s'exécute à l'import
 * et sort par `process.exit`), puis `git push`. Origin injoignable ou branche
 * encore absente d'origin : rien à comparer, on pousse, comme `commit.ts` — le
 * push dira lui-même ce qui ne va pas. Branche en retard : refus, rien ne part.
 */
export const pushBranch: PatchJob = async (say, launch) => {
  const git = (args: readonly string[]): Promise<LaunchResult> => {
    say(`$ git ${args.join(' ')}`);
    return launch('git', args);
  };

  const head = await git(CURRENT_BRANCH_ARGS);
  if (head.code !== 0)
    return { ok: false, error: 'branche courante illisible — rien n’a été poussé.' };
  const branch = head.stdout.trim();
  const branchError = pushBranchError(branch);
  if (branchError) return { ok: false, error: `${branchError} Rien n’a été poussé.` };

  if ((await git(pushFetchArgs(branch))).code !== 0)
    say(`origin/${branch} injoignable ou inexistant — rien à comparer.`);
  else if ((await git(pushVerifyArgs(branch))).code !== 0)
    say(`${branch} n'existe pas encore sur origin — rien à comparer.`);
  else {
    const refusal = pushRefusal(branch, (await git(pushCompareArgs(branch))).stdout);
    if (refusal) return { ok: false, error: refusal };
    say(`origin/${branch} : à jour.`);
  }

  return toDone(await git(pushArgs(branch)));
};

/** Le push en flux NDJSON, sous le même verrou que les autres gestes. */
export const streamPatchPush = (): Response => streamPatchJob('push de la branche', pushBranch);
