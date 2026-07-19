/**
 * Guide « Premium & Limited » — deux onglets : priorités de pull + review par
 * héros. Les reviews, priorités et notes d'impact sont ÉDITORIALES (transplant
 * V2) ; l'identité des persos (élément/classe/tag), et les sweetspots de
 * transcendance DÉRIVENT des données du jeu (la V2 rechargeait tout côté
 * client, textes de transcendance compris).
 */
import type { ReactNode } from 'react';
import type { Lang } from '@/lib/i18n/config';
import { getT } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import { parseText, type ParseCtx } from '@/lib/parse-text';
import { resolveGuideCharacter } from '@/lib/data/characters';
import { Tabs } from '@/components/ui/Tabs';
import { Prose } from '@/components/guides/editorial/blocks';
import { HeroReviewCard } from '@/components/guides/editorial/reviews/HeroReviewCard';
import {
  PriorityTiers,
  type PriorityTier,
} from '@/components/guides/editorial/reviews/PriorityTiers';
import {
  ImpactTable,
  RecoTargets,
  TranscendSweetspots,
} from '@/components/guides/editorial/reviews/premium';
import { LABELS } from './labels';
import { premiumOrder, limitedOrder, type PriorityOrder } from './priorities';
import { premiumReviews, limitedReviews, type HeroReviewEntry } from './reviews';

const WHERE = 'premium-limited';

export default async function PremiumLimitedGuide({ lang }: { lang: Lang }) {
  const t = await getT(lang);
  const ctx: ParseCtx = { lang, t, strict: true };
  const L = (m: (typeof LABELS)[keyof typeof LABELS]): string => lRec(m, lang);

  const priorityPanel = (order: PriorityOrder): ReactNode => {
    const tiers: PriorityTier[] = [
      { title: L(LABELS.priority1st), entries: order.first },
      { title: L(LABELS.priority2nd), entries: order.second },
      { title: L(LABELS.priority3rd), entries: order.third },
    ];
    return (
      <section className="border-line bg-surface-raised/60 space-y-6 rounded-2xl border p-6">
        <h2 className="text-content-strong m-0 text-center text-xl font-semibold">
          {L(LABELS.recommendedChoices)}
        </h2>
        <PriorityTiers tiers={tiers} lang={lang} where={WHERE} />
        <div className="border-line-subtle border-t pt-5">
          <div className="text-content-strong mb-3 text-center text-sm font-semibold">
            {L(LABELS.transcendPriority)}
          </div>
          <PriorityTiers tiers={[{ entries: order.transcend }]} lang={lang} where={WHERE} />
          <p className="text-content-subtle mt-3 text-center text-xs">
            {L(LABELS.transcendFocusNote)}
          </p>
        </div>
      </section>
    );
  };

  const reviewCards = (entries: HeroReviewEntry[]): ReactNode =>
    [...entries]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((entry) => {
        const g = resolveGuideCharacter(entry.name, lang, WHERE);
        return (
          <HeroReviewCard key={entry.name} character={g.character} lang={lang}>
            <p className="text-content text-sm whitespace-pre-line">
              {parseText(lRec(entry.review, lang), ctx)}
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="border-line-subtle rounded-md border p-3">
                <div className="text-content-strong mb-2 text-center text-sm font-semibold">
                  {L(LABELS.recommendedTargets)}
                </div>
                <RecoTargets pve={entry.recommendedPve} pvp={entry.recommendedPvp} />
              </div>
              <div className="border-line-subtle rounded-md border p-3">
                <div className="text-content-strong mb-2 text-center text-sm font-semibold">
                  {L(LABELS.transcendImpact)}
                </div>
                <ImpactTable impact={entry.impact} starLabel={L(LABELS.colStar)} />
              </div>
            </div>
            <TranscendSweetspots character={g.character} lang={lang} />
          </HeroReviewCard>
        );
      });

  const tabContent = (order: PriorityOrder, entries: HeroReviewEntry[]): ReactNode => (
    <div className="space-y-6">
      {priorityPanel(order)}
      {reviewCards(entries)}
    </div>
  );

  return (
    <>
      <Prose>{L(LABELS.intro)}</Prose>
      <Tabs
        urlParam="tab"
        tabs={[
          { id: 'premium', label: 'Premium', content: tabContent(premiumOrder, premiumReviews) },
          { id: 'limited', label: 'Limited', content: tabContent(limitedOrder, limitedReviews) },
        ]}
      />
    </>
  );
}
