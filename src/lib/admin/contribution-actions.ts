'use server';

/**
 * IMPORT DE CONTRIBUTION (admin, dev-only) — point d'entrée GÉNÉRIQUE.
 *
 * On reçoit un JSON auto-descriptif (cf. `Contribution`) : le `kind` dit à quel
 * guide l'intégrer, `mode` s'il s'agit d'une édition ou d'un ajout. Ici on route
 * par `kind` vers le bon store, on fusionne, on AUTO-TRADUIT ce qui manque
 * (EN → langues vides) puis on ÉCRIT. Un seul tool pour tous les guides : brancher
 * un nouveau `kind` = ajouter un cas au `switch`.
 *
 * Tout se passe côté serveur (traduction = clés API, écriture = fs), d'où la
 * garde `IS_DEV`. Le retour est un résumé texte (jamais de JSX).
 */
import { IS_DEV } from '@/lib/admin/guard';
import { autoTranslate } from '@/lib/admin/translate-actions';
import {
  loadPremiumLimited,
  normalizeReview,
  savePremiumLimited,
  type ReviewEntryData,
} from '@/lib/admin/general-guide-store';
import {
  parseContribution,
  CONTRIBUTION_LABELS,
  type Contribution,
  type ReviewContributionPayload,
} from '@/lib/contribute/contribution';

export type ImportResult = { ok: true; summary: string } | { ok: false; errors: string[] };

const TARGET_LANGS = ['jp', 'kr', 'zh', 'fr'] as const;

/** Remplit sur place les langues VIDES d'une review depuis son EN. Renvoie le nb rempli. */
async function fillMissingTranslations(entry: ReviewEntryData): Promise<number> {
  const en = entry.review.en?.trim();
  if (!en) return 0;
  const targets = TARGET_LANGS.filter((l) => !entry.review[l]?.trim());
  if (!targets.length) return 0;
  const { results } = await autoTranslate([en], [...targets]);
  const tr = results[0] ?? {};
  let filled = 0;
  for (const l of targets) {
    if (tr[l]?.trim()) {
      entry.review[l] = tr[l]!;
      filled++;
    }
  }
  return filled;
}

/** Handler `premium-limited-review` : fusion par nom dans le bucket + trad + save. */
async function importReview(c: Contribution): Promise<ImportResult> {
  const payload = c.payload as ReviewContributionPayload;
  if (!payload?.entry) return { ok: false, errors: ['contribution has no review entry.'] };
  const bucket = payload.bucket === 'limited' ? 'limited' : 'premium';
  const entry = normalizeReview(payload.entry);
  if (!entry.name.trim()) return { ok: false, errors: ['review has no hero name.'] };

  const filled = await fillMissingTranslations(entry);

  const data = loadPremiumLimited();
  const list = data.reviews[bucket];
  const idx = list.findIndex((r) => r.name.trim().toLowerCase() === entry.name.toLowerCase());
  const replaced = idx >= 0;
  data.reviews[bucket] = replaced ? list.map((x, j) => (j === idx ? entry : x)) : [...list, entry];

  const errors = await savePremiumLimited(data);
  if (errors.length) return { ok: false, errors };

  const trad = filled ? `, ${filled} translation(s) filled` : '';
  const label = CONTRIBUTION_LABELS[c.kind];
  return { ok: true, summary: `${label} › ${bucket} › ${entry.name}: ${replaced ? 'edited' : 'added'}${trad}.` }; // prettier-ignore
}

/** Point d'entrée : parse l'enveloppe, route par `kind`, intègre et enregistre. */
export async function importContribution(raw: unknown): Promise<ImportResult> {
  if (!IS_DEV) return { ok: false, errors: ['forbidden (dev-only tool).'] };
  let c: Contribution;
  try {
    c = parseContribution(raw);
  } catch (e) {
    return { ok: false, errors: [`Invalid contribution: ${(e as Error).message}`] };
  }

  switch (c.kind) {
    case 'premium-limited-review':
      return importReview(c);
    default:
      return { ok: false, errors: [`No handler for kind “${c.kind}”.`] };
  }
}
