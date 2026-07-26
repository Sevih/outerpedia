'use client';

/**
 * Auto-traduction des REVIEWS « Premium & Limited » — ADMIN SEULEMENT.
 *
 * ⚠ POURQUOI CE FICHIER EXISTE À PART (audit F2). Cette fonction vivait dans
 * `PremiumLimitedParts`, le module de briques PARTAGÉ avec les outils publics de
 * contribution. Elle y importait `translate-actions`, qui lit `DEEPL_API_KEY` et
 * `ANTHROPIC_API_KEY` : le graphe de modules des TROIS pages `/contribute`
 * publiques incluait donc la couche de traduction.
 *
 * Rien ne fuyait — le corps d'une server action ne part jamais au navigateur, et
 * la garde `IS_DEV` la rend inerte en prod. Mais la sûreté ne tenait qu'à cette
 * garde, posée dans un module que personne ne croyait public. Isolée ici,
 * l'arête n'existe plus : les outils publics ne tirent que des briques inertes.
 *
 * Seul appelant : `PremiumLimitedEditor` (dev). Le jour où un deuxième apparaît,
 * vérifier qu'il n'est pas servi en prod.
 *
 * ⚠ ET C'EST POUR ÇA QUE CE FICHIER EST ICI, et non dans `premium-limited/` avec
 * les briques : ce dossier-là a un invariant, « tout ce qui y vit ship en prod »,
 * et le garde-fou eslint l'applique en interdisant aux deux dossiers de briques
 * partagées (`editorial/`, `premium-limited/`) d'importer un secret. Garder ce
 * fichier dedans aurait obligé à y percer une exception — donc à rendre
 * l'invariant faux dès le premier jour.
 */
import type { ReviewEntryData, ReviewsBundle } from '@/lib/admin/general-guide-store';
import { autoTranslate } from '@/lib/admin/translate-actions';
import { applyTranslation, type Freshness } from '@/lib/admin/translate-fill';
import { LANGS, type LText } from '@/components/admin/premium-limited/PremiumLimitedParts';

/**
 * Regénère les REVIEWS des deux buckets depuis leur EN (admin) — écrase les
 * traductions. La fraîcheur restreint l'envoi à ce qui a BOUGÉ depuis le
 * chargement (quota DeepL).
 */
export async function translateReviews(
  bundle: ReviewsBundle,
  freshness: Freshness,
): Promise<{ next: ReviewsBundle; filled: number; provider: string }> {
  const targets = LANGS.filter((l) => l !== 'en');
  const clone = (list: ReviewEntryData[]) =>
    list.map((r) => ({ ...r, review: { ...r.review } as LText }));
  const next: ReviewsBundle = { premium: clone(bundle.premium), limited: clone(bundle.limited) };

  const recs = [...next.premium, ...next.limited]
    .map((r) => r.review)
    .filter((t) => freshness.isStale(t, targets));
  if (!recs.length) return { next, filled: 0, provider: 'deepl' };

  const { results, provider } = await autoTranslate(
    recs.map((r) => r.en!),
    targets,
  );
  let filled = 0;
  recs.forEach((rec, k) => {
    filled += applyTranslation(rec, results[k] ?? {}, targets);
    freshness.markFresh(rec);
  });
  return { next, filled, provider };
}
