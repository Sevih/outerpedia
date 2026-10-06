import { IS_DEV } from '@/lib/admin/guard';
import { parsePublishRequest, publishArgs } from '@/lib/admin/patch-commands';
import { pnpmInvocation, refusePatchJob, streamPatchCommand } from '@/lib/admin/patch-runner';

// Outil local : 403 en prod. Le commit (`pnpm commit --no-push`) lancé de
// l'accueil admin, sortie au fil de l'eau (NDJSON). Le push est un autre geste
// (route `push`).

/** Ce que le commit embarquera : la revue 3b de `commit.ts`, rendue dans la page. */
export function GET() {
  if (!IS_DEV) return refusePatchJob('forbidden', 403);
  return streamPatchCommand({
    label: 'revue avant commit',
    display: 'git status --short',
    command: 'git',
    args: ['status', '--short'],
  });
}

/**
 * Commite : contrôles, bump, images poussées sur R2, commit LOCAL — pas de push
 * git, donc pas de déploiement. Le message et le bump sont validés puis passés
 * en ARGUMENTS — jamais interpolés dans une commande.
 */
export async function POST(req: Request) {
  if (!IS_DEV) return refusePatchJob('forbidden', 403);
  const parsed = parsePublishRequest(await req.json().catch(() => null));
  if (!parsed.ok) return refusePatchJob(parsed.error, 400);
  const pnpm = pnpmInvocation();
  const args = publishArgs(parsed.request);
  return streamPatchCommand({
    label: 'commit des données',
    display: `pnpm commit --msg "${parsed.request.message}" --bump ${parsed.request.bump} --yes --no-push`,
    command: pnpm.command,
    args: [...pnpm.args, ...args],
  });
}
