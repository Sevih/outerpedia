/**
 * Page PUBLIQUE de contribution aux reviews « Premium & Limited » (Shiraen).
 * Prod, sans login : on édite et on exporte un JSON (aucune écriture serveur).
 * Non indexée — c'est un outil de travail, pas une page de contenu.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { normalizeLang } from '@/lib/i18n/config';
import { localePath } from '@/lib/navigation';
import { getAllCharacters, characterDisplayName } from '@/lib/data/characters';
import { buildInlineRefs } from '@/lib/admin/inline-refs';
import { premiumLimitedRoster, type ReviewsBundle } from '@/lib/admin/general-guide-store';
import {
  premiumReviews,
  limitedReviews,
} from '../../guides/_contents/general-guides/premium-limited/reviews';
import { PremiumReviewsPublicTool } from '@/components/admin/premium-limited/PremiumReviewsPublicTool';

// Import STATIQUE (bundlé, prod-safe) — pas de lecture fs à l'exécution.
const initialReviews: ReviewsBundle = { premium: premiumReviews, limited: limitedReviews };

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  await params;
  return {
    title: 'Contribution — Premium & Limited reviews',
    robots: { index: false, follow: false },
  };
}

export default async function ContributePremiumReviewsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang = normalizeLang(raw);

  const charOptions = getAllCharacters().map((c) => ({
    id: c.id,
    name: characterDisplayName(c),
    element: c.element,
    class: c.class,
    rarity: c.rarity,
  }));

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <Link
        href={localePath(lang, '/contribute')}
        className="text-content-subtle hover:text-accent text-sm"
      >
        ← Contribution tools
      </Link>
      <h1 className="text-content-strong text-2xl font-semibold">
        Premium &amp; Limited — review contribution
      </h1>
      <PremiumReviewsPublicTool
        initial={initialReviews}
        roster={premiumLimitedRoster()}
        refs={buildInlineRefs()}
        charOptions={charOptions}
      />
    </main>
  );
}
