import { IS_DEV } from '@/lib/admin/guard';
import { parsePublishRequest, publishArgs } from '@/lib/admin/patch-commands';
import { pnpmInvocation, refusePatchJob, streamPatchCommand } from '@/lib/admin/patch-runner';

// Outil local : 403 en prod. La publication (`pnpm commit`) lancée de l'accueil
// admin, sortie au fil de l'eau (NDJSON).

/** Ce que la publication embarquera : la revue 3b de `commit.ts`, rendue dans la page. */
export function GET() {
  if (!IS_DEV) return refusePatchJob('forbidden', 403);
  return streamPatchCommand({
    label: 'revue avant publication',
    display: 'git status --short',
    command: 'git',
    args: ['status', '--short'],
  });
}

/**
 * Publie : pousse R2 puis `main`, donc déploie. Le message et le bump sont
 * validés puis passés en ARGUMENTS — jamais interpolés dans une commande.
 */
export async function POST(req: Request) {
  if (!IS_DEV) return refusePatchJob('forbidden', 403);
  const parsed = parsePublishRequest(await req.json().catch(() => null));
  if (!parsed.ok) return refusePatchJob(parsed.error, 400);
  const pnpm = pnpmInvocation();
  const args = publishArgs(parsed.request);
  return streamPatchCommand({
    label: 'publication des données',
    display: `pnpm commit --msg "${parsed.request.message}" --bump ${parsed.request.bump} --yes`,
    command: pnpm.command,
    args: [...pnpm.args, ...args],
  });
}
