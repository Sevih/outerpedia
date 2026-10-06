/**
 * Les trois gestes « patch » de l'accueil admin — promouvoir l'extraction
 * (`pnpm datagen:promote`), commiter (`pnpm commit --no-push`) et pousser
 * (`git push`) — côté PUR : ce que la page, les routes et `scripts/commit.ts`
 * doivent dire de la même façon.
 *
 * Aucun import Node ici : le composant client valide le message avec la même
 * fonction que la route, et `commit.ts` lit `--bump` avec le même parseur. Le
 * lancement des commandes (spawn, verrou) vit dans `patch-runner.ts`.
 */

/**
 * Format de message exigé (conventional commits, garde-fou 2026-07-16) : le
 * CHANGELOG se reconstruit du log git — « import MG », « guild raid & tower »
 * y ont creusé des trous impossibles à combler après coup (commits poussés).
 */
export const CONVENTIONAL =
  /^(feat|fix|docs|chore|refactor|perf|test|style|ci|build|revert)(\([^)]+\))?!?: .+/;

/** Les bumps de version qu'un flag ou la page peuvent demander. */
export const BUMPS = ['patch', 'minor', 'major'] as const;
export type Bump = (typeof BUMPS)[number];

export const isBump = (v: unknown): v is Bump =>
  typeof v === 'string' && (BUMPS as readonly string[]).includes(v);

/**
 * Lit `--bump patch|minor|major` dans les arguments de `commit.ts`. `null` si
 * le flag est absent (le prompt reste) ; LÈVE s'il est là sans valeur reconnue —
 * un bump mal tapé ne doit ni retomber sur le prompt (personne n'y répond quand
 * la commande vient de la page) ni passer pour « version inchangée ».
 */
export function parseBumpFlag(argv: readonly string[]): Bump | null {
  const i = argv.indexOf('--bump');
  if (i === -1) return null;
  const value = argv[i + 1];
  if (!isBump(value))
    throw new Error(
      `--bump : ${BUMPS.join(', ')} attendu${value === undefined ? '' : ` (reçu « ${value} »)`}.`,
    );
  return value;
}

/** Longueur maximale d'un message de commit venu de la page. */
export const COMMIT_MESSAGE_MAX = 200;

/**
 * Caractères refusés dans un message venu de la page. La route le passe en
 * ARGUMENT (jamais dans une chaîne de commande), mais `commit.ts` le relit en
 * aval dans un shell : son `git commit -m "<message>"` passe par `execSync`.
 * Entre guillemets doubles, `$`, l'accent grave et `\` restent actifs pour sh ;
 * `"` et `%` pour cmd (le fixe).
 */
const SHELL_ACTIVE = /["$`\\%]/;
// Retour à la ligne compris : un message de commit publié tient sur une ligne.
const CONTROL = /[\u0000-\u001f\u007f]/;

/** Motif du refus d'un message de commit, ou `null` s'il est acceptable. */
export function commitMessageError(message: unknown): string | null {
  if (typeof message !== 'string' || !message) return 'message de commit attendu.';
  if (CONTROL.test(message)) return 'le message tient sur une ligne, sans caractère de contrôle.';
  if (message.length > COMMIT_MESSAGE_MAX)
    return `message trop long (${message.length} caractères, ${COMMIT_MESSAGE_MAX} au plus).`;
  if (!CONVENTIONAL.test(message))
    return 'préfixe conventionnel exigé — ex. « chore(data): patch du 06/10 ».';
  if (SHELL_ACTIVE.test(message)) return 'caractères refusés dans le message : " $ ` \\ %.';
  return null;
}

/** Un commit demandé par la page, validé. */
export interface PublishRequest {
  message: string;
  bump: Bump;
}

/** Valide le corps du POST de commit : la demande, ou le motif du refus. */
export function parsePublishRequest(
  body: unknown,
): { ok: true; request: PublishRequest } | { ok: false; error: string } {
  if (body === null || typeof body !== 'object' || Array.isArray(body))
    return { ok: false, error: 'objet JSON attendu.' };
  const { message, bump } = body as Record<string, unknown>;
  const error = commitMessageError(message);
  if (error) return { ok: false, error };
  if (!isBump(bump)) return { ok: false, error: `bump attendu : ${BUMPS.join(', ')}.` };
  return { ok: true, request: { message: message as string, bump } };
}

/**
 * Arguments de `pnpm` pour le commit — un élément par argument, jamais une
 * chaîne. `--no-push` : `commit.ts` fait tout (contrôles, bump, images sur R2,
 * commit) SAUF le push git, qui déploie et reste un geste à part (`pushArgs`).
 */
export const publishArgs = ({ message, bump }: PublishRequest): string[] => [
  'commit',
  '--msg',
  message,
  '--bump',
  bump,
  '--yes',
  '--no-push',
];

/**
 * Le push, commande par commande (arguments de `git`). La branche vient de
 * `CURRENT_BRANCH_ARGS`, lue par le SERVEUR : rien de la page n'entre ici.
 */
export const CURRENT_BRANCH_ARGS: readonly string[] = ['rev-parse', '--abbrev-ref', 'HEAD'];

/** La revue avant le push : les commits locaux en avance sur la branche suivie. */
export const PUSH_REVIEW_ARGS: readonly string[] = ['log', '--oneline', '@{upstream}..HEAD'];

export const pushFetchArgs = (branch: string): string[] => ['fetch', 'origin', branch];

export const pushVerifyArgs = (branch: string): string[] => [
  'rev-parse',
  '--verify',
  `origin/${branch}`,
];

/** Rend « <en avance>\t<en retard> », lu par `parseAheadBehind`. */
export const pushCompareArgs = (branch: string): string[] => [
  'rev-list',
  '--left-right',
  '--count',
  `HEAD...origin/${branch}`,
];

/** `--no-verify` comme `commit.ts` : les contrôles ont tourné avant le commit. */
export const pushArgs = (branch: string): string[] => ['push', '--no-verify', 'origin', branch];

/**
 * Motif du refus d'une branche à pousser, ou `null`. `HEAD` est ce que
 * `git rev-parse --abbrev-ref` rend sur un HEAD détaché ; le tiret de tête
 * ferait lire le nom comme une option par `git`.
 */
export function pushBranchError(branch: string): string | null {
  if (!branch || branch === 'HEAD') return 'aucune branche courante (HEAD détaché ?).';
  if (branch.startsWith('-') || /\s/.test(branch)) return `nom de branche refusé : « ${branch} ».`;
  return null;
}

/** Lit la sortie de `git rev-list --left-right --count HEAD...origin/<branche>`. */
export function parseAheadBehind(output: string): { ahead: number; behind: number } | null {
  const m = output.trim().match(/^(\d+)\s+(\d+)$/);
  return m ? { ahead: Number(m[1]), behind: Number(m[2]) } : null;
}

/**
 * Le pré-vol de `commit.ts`, côté décision : motif du refus de pousser, ou
 * `null`. Une branche EN RETARD sur origin ne part pas — le push serait refusé
 * de toute façon, autant le dire avant, avec le remède. Une sortie illisible
 * refuse aussi : pousser déploie, on ne part pas sans avoir pu comparer.
 */
export function pushRefusal(branch: string, revList: string): string | null {
  const counts = parseAheadBehind(revList);
  if (!counts) return `comparaison avec origin/${branch} illisible — rien n'a été poussé.`;
  if (!counts.behind) return null;
  return (
    `origin/${branch} a ${counts.behind} commit(s) que tu n'as pas — rien n'a été poussé. ` +
    `Intègre-les (git pull --rebase origin ${branch}), puis relance.`
  );
}

/**
 * Une ligne du flux NDJSON des routes `/api/admin/patch/*` : une ligne de
 * sortie de la commande, ou la dernière, `done`, qui porte l'issue.
 */
export type PatchEvent =
  { line: string } | { done: { ok: boolean; code?: number | null; error?: string } };

/** L'issue d'un travail : le contenu de la ligne `done`. */
export type PatchDone = Extract<PatchEvent, { done: unknown }>['done'];

const ANSI = /\u001b\[[0-9;?]*[ -/]*[@-~]/g;

/** Retire les séquences ANSI : la sortie va dans une page, pas dans un terminal. */
export const stripAnsi = (text: string): string => text.replace(ANSI, '');

/**
 * Découpe un flux de texte en lignes. Les morceaux ne tombent pas sur des fins
 * de ligne : le reliquat attend la suite, et `flush` le rend à la fermeture. Un
 * retour chariot seul (barre de progression) vaut fin de ligne.
 */
export function createLineSplitter(emit: (line: string) => void): {
  push: (chunk: string) => void;
  flush: () => void;
} {
  let carry = '';
  return {
    push(chunk) {
      const lines = (carry + chunk).split(/\r\n|\n|\r(?!$)/);
      carry = lines.pop() ?? '';
      for (const line of lines) emit(line);
    },
    flush() {
      const rest = carry.replace(/\r$/, '');
      carry = '';
      if (rest) emit(rest);
    },
  };
}
