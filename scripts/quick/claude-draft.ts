/**
 * claude-draft — le premier jet du résumé de patch, rédigé par Claude Code
 * lancé sans fenêtre (`claude -p`), à la place du copier-coller dans claude.ai.
 *
 * POURQUOI Claude Code et pas l'API : un programme qui appelle l'API passe par
 * une clé facturée à l'usage, en plus de l'abonnement. La commande `claude`,
 * elle, tourne sous l'ABONNEMENT de Sevih, comme sa fenêtre de tous les jours.
 * D'où la règle de ce fichier : la clé d'API ne doit JAMAIS arriver jusqu'à la
 * commande — quick charge `.env.local`, qui porte `ANTHROPIC_API_KEY`, et une
 * clé présente dans l'environnement l'emporterait sur l'abonnement (`childEnv`).
 *
 * La demande passe par l'ENTRÉE STANDARD : elle fait plus de 100 000
 * caractères, bien au-delà de ce qu'une ligne de commande accepte sous
 * Windows. Sans outil, sans session gardée, dans un dossier vide : la commande
 * ne lit ni le dépôt ni ses consignes, elle répond au texte reçu.
 *
 * Fixe (Windows) comme portable (Fedora) : sous Windows `claude` peut être un
 * `.cmd`, que Node ne lance que par l'interpréteur — d'où la ligne de commande
 * écrite en une pièce, sans rien qui vienne de l'utilisateur (`claudeCommand`).
 */
import { spawn, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import type { Report } from './actions';

/** Le modèle du premier jet : `QUICK_DRAFT_MODEL` le remplace (alias ou nom complet). */
export const DRAFT_MODEL = 'sonnet';
export const DRAFT_TIMEOUT_MS = 300_000;

const SYSTEM =
  'You write Discord announcements. Follow the instructions of the message exactly and reply with the announcement only.';

/**
 * Ajouté à la demande : ses consignes veulent le message dans un bloc de code
 * (pratique à copier depuis claude.ai), ici le texte revient directement.
 */
export const RAW_REPLY =
  '\n\nOverride for this request: reply with the raw message only — no code block around the whole message, no comment before or after it.\n';

/** Un nom de modèle sans rien qui puisse se lire comme autre chose sur une ligne de commande. */
export function draftModel(raw: string | undefined): string {
  return raw && /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(raw) ? raw : DRAFT_MODEL;
}

/** Un environnement de processus, sans les champs que Next impose à `ProcessEnv`. */
export type Env = Record<string, string | undefined>;

/**
 * L'environnement de la commande : celui de quick MOINS les secrets de
 * `.env.local` (elle n'a besoin d'aucun) et moins toute clé d'API Anthropic,
 * d'où qu'elle vienne — c'est ce qui garantit l'abonnement, pas la facture.
 */
export function childEnv(env: Env, localKeys: readonly string[]): Env {
  const out = { ...env };
  for (const k of [...localKeys, 'ANTHROPIC_API_KEY', 'ANTHROPIC_AUTH_TOKEN']) delete out[k];
  return out;
}

/** La commande à lancer, selon le système. Rien n'y vient de la page : le modèle est validé. */
export function claudeCommand(
  model: string,
  platform: NodeJS.Platform,
): { command: string; args: string[]; shell: boolean } {
  // `--effort` est DIT : hérité d'une session Claude Code ouverte autour (CLAUDE_EFFORT),
  // un effort élevé fait passer la réponse de 40 s à plus de 4 minutes.
  const flags = [
    '-p',
    '--model',
    draftModel(model),
    '--effort',
    'medium',
    '--no-session-persistence',
  ];
  if (platform === 'win32')
    // Par l'interpréteur (un `.cmd` l'exige) : la ligne est écrite ici, guillemets compris.
    return {
      command: `claude ${flags.join(' ')} --tools "" --system-prompt "${SYSTEM}"`,
      args: [],
      shell: true,
    };
  return {
    command: 'claude',
    args: [...flags, '--tools', '', '--system-prompt', SYSTEM],
    shell: false,
  };
}

/**
 * Le message dans la réponse. Demandé nu, mais un modèle l'emballe parfois
 * quand même dans un bloc : on retire CETTE enveloppe-là (première et dernière
 * lignes), jamais les blocs du message lui-même (le bloc `ansi` des équilibrages).
 */
export function extractDraft(stdout: string): string {
  const text = stdout.replace(/\r\n?/g, '\n').trim();
  const lines = text.split('\n');
  const open = /^(`{3,})(?:markdown|md|text|discord)?$/.exec(lines[0] ?? '');
  if (open && lines.length > 2 && lines[lines.length - 1] === open[1])
    return lines.slice(1, -1).join('\n').trim();
  return text;
}

export interface ClaudeRun {
  code: number | null;
  stdout: string;
  stderr: string;
  /** La commande `claude` n'existe pas sur ce poste. */
  missing?: boolean;
  timedOut?: boolean;
}

/** Lance la commande, lui donne la demande sur l'entrée standard, rend ce qu'elle a écrit. */
export function runClaude(
  prompt: string,
  opts: { model: string; env: Env; timeoutMs?: number },
): Promise<ClaudeRun> {
  const { command, args, shell } = claudeCommand(opts.model, process.platform);
  return new Promise((done) => {
    const child = spawn(command, args, {
      cwd: tmpdir(),
      env: opts.env as NodeJS.ProcessEnv,
      shell,
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      // Sous Windows le processus lancé est l'interpréteur : `/T` emporte la commande avec lui.
      if (process.platform === 'win32' && child.pid)
        spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { windowsHide: true });
      else child.kill('SIGTERM');
    }, opts.timeoutMs ?? DRAFT_TIMEOUT_MS);
    const finish = (run: ClaudeRun): void => {
      clearTimeout(timer);
      done(run);
    };
    child.stdout.on('data', (c: Buffer) => (stdout += c.toString('utf8')));
    child.stderr.on('data', (c: Buffer) => (stderr += c.toString('utf8')));
    child.on('error', (e: NodeJS.ErrnoException) =>
      finish({ code: null, stdout, stderr: String(e), missing: e.code === 'ENOENT' }),
    );
    child.on('close', (code) => finish({ code, stdout, stderr, timedOut }));
    // Une commande absente ferme son entrée avant qu'on ait écrit : l'erreur vient par `error`.
    child.stdin.on('error', () => {});
    child.stdin.end(prompt, 'utf8');
  });
}

const MISSING =
  'Claude Code introuvable sur ce poste (commande `claude`) : installe-le et connecte-toi, ou passe par « Copier la demande ».';

/** Sous Windows, une commande inconnue ne lève pas d'erreur : l'interpréteur le dit sur sa sortie. */
const notFound = (run: ClaudeRun): boolean =>
  Boolean(run.missing) ||
  (run.code !== 0 && /not recognized|n.est pas reconnu|command not found/i.test(run.stderr));

export interface DraftOutcome {
  ok: boolean;
  log: string[];
  text: string;
}

/** Le premier jet : la demande part, le message revient — ou la raison pour laquelle il ne vient pas. */
export async function proposeDraft(
  prompt: string,
  deps: { run: (prompt: string) => Promise<ClaudeRun>; model: string },
  report?: Report,
): Promise<DraftOutcome> {
  const refuse = (line: string): DraftOutcome => ({ ok: false, log: [line], text: '' });
  report?.(
    `Claude rédige le premier jet (modèle ${deps.model}, ${prompt.length.toLocaleString('fr-FR')} caractères envoyés)`,
    true,
  );
  const run = await deps.run(prompt + RAW_REPLY);
  if (notFound(run)) return refuse(MISSING);
  if (run.timedOut)
    return refuse('Claude n’a pas répondu à temps : réessaie, ou passe par « Copier la demande ».');
  const said = (run.stderr.trim() || run.stdout.trim()).split('\n').slice(0, 4).join(' — ');
  if (run.code !== 0)
    return refuse(`Claude Code a échoué (code ${run.code ?? '?'}) : ${said || 'sans message'}`);
  const text = extractDraft(run.stdout);
  if (!text) return refuse('Claude a rendu une réponse vide.');
  return {
    ok: true,
    log: [
      `premier jet reçu : ${text.length.toLocaleString('fr-FR')} caractères — à relire avant d’envoyer.`,
    ],
    text,
  };
}
