/**
 * LANCEMENT des gestes « patch » de l'accueil admin (dev uniquement) : une
 * commande du dépôt, sa sortie relayée ligne à ligne en NDJSON — même principe
 * que `stream()` de `scripts/quick/server.ts`, en `ReadableStream`.
 *
 * Trois garanties :
 *  - PAS de shell : la commande et ses arguments vont tels quels à `spawn`, rien
 *    de ce qui vient de la page n'est interpolé dans une chaîne ;
 *  - UN SEUL travail à la fois (`acquirePatchJob`) : la promotion réécrit
 *    `data/generated`, la publication le lit, le committe et le pousse ;
 *  - un travail lancé VA AU BOUT : fermer l'onglet ne le tue pas. Couper
 *    `pnpm commit` entre le push R2 et le push git laisserait la prod servir
 *    des images que le dépôt n'enregistre pas (cf. `preflight` de `commit.ts`).
 */
import { spawn } from 'node:child_process';
import { createLineSplitter, stripAnsi, type PatchEvent } from './patch-commands';

/**
 * Le verrou vit sur `globalThis` : en dev, Next recharge les modules à chaud et
 * compile chaque route à part — une variable de module serait remise à zéro, ou
 * dédoublée entre `promote` et `commit`, pendant qu'un travail tourne.
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

/**
 * Lance la commande à la racine du dépôt, avec l'environnement du serveur, et
 * rend sa sortie (stdout et stderr mêlés) en flux NDJSON, close par `done`.
 * Un travail déjà en cours → 409, rien n'est lancé.
 */
export function streamPatchCommand({ label, display, command, args }: PatchCommand): Response {
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
      let finished = false;
      const finish = (done: Extract<PatchEvent, { done: unknown }>['done']): void => {
        if (finished) return;
        finished = true;
        release();
        send({ done });
        if (!listening) return;
        try {
          controller.close();
        } catch {
          /* flux déjà fermé par le lecteur */
        }
      };

      send({ line: `$ ${display}` });
      try {
        const child = spawn(command, args, {
          cwd: process.cwd(),
          env: process.env,
          shell: false,
          stdio: ['ignore', 'pipe', 'pipe'],
          windowsHide: true,
        });
        for (const out of [child.stdout, child.stderr]) {
          const lines = createLineSplitter((line) => send({ line: stripAnsi(line) }));
          out.setEncoding('utf8');
          out.on('data', lines.push);
          out.on('end', lines.flush);
        }
        child.on('error', (e) => finish({ ok: false, error: e.message }));
        child.on('close', (code) => finish({ ok: code === 0, code }));
      } catch (e) {
        finish({ ok: false, error: (e as Error).message });
      }
    },
    cancel() {
      listening = false;
    },
  });
  return new Response(body, { headers: HEADERS });
}
