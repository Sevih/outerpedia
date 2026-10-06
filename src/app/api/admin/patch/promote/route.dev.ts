import { IS_DEV } from '@/lib/admin/guard';
import { pnpmInvocation, refusePatchJob, streamPatchCommand } from '@/lib/admin/patch-runner';

// Outil local : 403 en prod. La promotion extrait → validé lancée de l'accueil
// admin, sortie au fil de l'eau (NDJSON) — la même commande que le terminal.
function promote(apply: boolean): Response {
  if (!IS_DEV) return refusePatchJob('forbidden', 403);
  const pnpm = pnpmInvocation();
  const args = ['datagen:promote', ...(apply ? ['--apply'] : [])];
  return streamPatchCommand({
    label: apply ? 'promotion de l’extraction' : 'dry-run de la promotion',
    display: `pnpm ${args.join(' ')}`,
    command: pnpm.command,
    args: [...pnpm.args, ...args],
  });
}

/** Dry-run : le rapport de promotion, rien n'est écrit. */
export function GET() {
  return promote(false);
}

/** Apply : réécrit `data/generated` — la page ne l'appelle qu'après confirmation. */
export function POST() {
  return promote(true);
}
