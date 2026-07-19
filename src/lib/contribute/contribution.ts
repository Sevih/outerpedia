/**
 * ENVELOPPE DE CONTRIBUTION — format d'échange public → admin.
 *
 * Un contributeur (outil `/contribute/*`) exporte un JSON ; Sevih le dépose dans
 * le tool d'import admin, qui l'intègre au bon guide. Pour que l'import soit
 * GÉNÉRIQUE (un seul tool, tous les guides), le JSON se décrit lui-même :
 *   - `kind`  → À QUEL guide/fragment il appartient (clé de routage serveur) ;
 *   - `mode`  → édition d'une entrée existante ou AJOUT (intention de l'auteur) ;
 *   - `payload` → la donnée propre au `kind`.
 *
 * Fichier PARTAGÉ client/serveur : aucun accès fs ici, les types du store sont en
 * `import type` (effacés à la compilation). Ajouter un `kind` = l'ajouter au type
 * union + à `CONTRIBUTION_LABELS`, et brancher son handler côté serveur.
 */
import type { ReviewEntryData } from '@/lib/admin/general-guide-store';

export const CONTRIBUTION_VERSION = 1;

/** Discriminant de routage : un `kind` = un guide/fragment cible. */
export type ContributionKind = 'premium-limited-review';

/** Libellés humains (affichés par le tool d'import ; le routage se fait sur `kind`). */
export const CONTRIBUTION_LABELS: Record<ContributionKind, string> = {
  'premium-limited-review': 'Premium & Limited — review',
};

export type ContributionMode = 'edit' | 'add';

export interface Contribution<P = unknown> {
  contributionVersion: number;
  kind: ContributionKind;
  /** Intention de l'auteur : éditer une entrée existante ou en ajouter une. */
  mode: ContributionMode;
  payload: P;
}

/* --- Payloads par `kind` --- */

export type ReviewBucket = 'premium' | 'limited';
/** `premium-limited-review` : UNE review de héros pour l'un des deux buckets. */
export interface ReviewContributionPayload {
  bucket: ReviewBucket;
  entry: ReviewEntryData;
}

/** Emballe un payload dans l'enveloppe versionnée (côté outil public). */
export function makeContribution<P>(
  kind: ContributionKind,
  mode: ContributionMode,
  payload: P,
): Contribution<P> {
  return { contributionVersion: CONTRIBUTION_VERSION, kind, mode, payload };
}

/**
 * Lit un JSON quelconque en enveloppe de contribution. TOLÈRE l'ancien format
 * nu des reviews (`{ bucket, entry }` sans enveloppe) → replié en
 * `premium-limited-review`. Lève si la forme est inexploitable.
 */
export function parseContribution(raw: unknown): Contribution {
  if (!raw || typeof raw !== 'object') throw new Error('empty or non-object JSON.');
  const o = raw as Record<string, unknown>;

  if (typeof o.kind === 'string') {
    if (!(o.kind in CONTRIBUTION_LABELS)) throw new Error(`unknown contribution kind “${o.kind}”.`);
    if (o.payload == null) throw new Error('envelope has no “payload”.');
    const mode: ContributionMode = o.mode === 'add' ? 'add' : 'edit';
    return { contributionVersion: Number(o.contributionVersion) || 1, kind: o.kind as ContributionKind, mode, payload: o.payload }; // prettier-ignore
  }

  // Rétro-compat : ancien export nu d'une review (avant l'enveloppe).
  if (o.entry && typeof o.entry === 'object') {
    return makeContribution('premium-limited-review', 'edit', {
      bucket: o.bucket === 'limited' ? 'limited' : 'premium',
      entry: o.entry,
    } as ReviewContributionPayload);
  }

  throw new Error('unrecognized JSON — expected a contribution export.');
}
