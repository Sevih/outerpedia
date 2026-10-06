import { IS_DEV } from '@/lib/admin/guard';
import { PUSH_REVIEW_ARGS } from '@/lib/admin/patch-commands';
import { refusePatchJob, streamPatchCommand, streamPatchPush } from '@/lib/admin/patch-runner';

// Outil local : 403 en prod. Le push git lancé de l'accueil admin, sortie au fil
// de l'eau (NDJSON) — le geste qui DÉPLOIE, séparé du commit.

/** Ce qui partirait : les commits locaux en avance sur la branche suivie. */
export function GET() {
  if (!IS_DEV) return refusePatchJob('forbidden', 403);
  return streamPatchCommand({
    label: 'revue avant push',
    display: `git ${PUSH_REVIEW_ARGS.join(' ')}`,
    command: 'git',
    args: [...PUSH_REVIEW_ARGS],
  });
}

/**
 * Pousse la branche courante — `main` = déploiement de la prod. Aucun corps
 * lu : la branche est celle du dépôt, lue par le serveur, et le pré-vol de
 * `commit.ts` (branche en retard sur origin = refus) passe avant.
 */
export function POST() {
  if (!IS_DEV) return refusePatchJob('forbidden', 403);
  return streamPatchPush();
}
