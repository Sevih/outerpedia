'use client';

/**
 * Outil PUBLIC de contribution aux reviews « Premium & Limited » (pour Shiraen).
 * Zéro écriture serveur, zéro login : on édite UN perso (existant pré-rempli ou
 * nouveau) et on EXPORTE ce seul perso en JSON, que Sevih importe côté admin.
 * Réutilise les briques de l'éditeur admin (`PremiumLimitedParts`).
 *
 * Pas d'import ni d'auto-traduction ici (l'import se fait dans l'admin ; la
 * traduction appelle une API payante) : Shiraen rédige l'EN et exporte.
 */
import { useState } from 'react';
import type { InlineRefs } from '@/lib/admin/inline-refs';
import type { ReviewsBundle } from '@/lib/admin/general-guide-store';
import type { CharOption } from '@/components/admin/CharacterPicker';
import { CharacterNameDatalist } from '@/components/admin/CharacterChips';
import {
  DATALIST_ID,
  LangBar,
  ReviewWorkbench,
  downloadJson,
  type Bucket,
  type L,
  type SingleReviewExport,
} from '@/components/admin/premium-limited/PremiumLimitedParts';

const btn =
  'rounded-md border border-line bg-surface-base px-3 py-1.5 text-sm hover:border-accent disabled:opacity-50';
const fileSlug = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') || 'review';

export function PremiumReviewsPublicTool({
  initial,
  refs,
  charOptions,
}: {
  initial: ReviewsBundle;
  refs: InlineRefs;
  charOptions: CharOption[];
}) {
  const [lang, setLang] = useState<L>('en');
  const [bucket, setBucket] = useState<Bucket>('premium');
  const [selected, setSelected] = useState<number | null>(null);
  const [reviews, setReviews] = useState<ReviewsBundle>(initial);

  const charByName = new Map(charOptions.map((c) => [c.name, c]));
  const switchBucket = (b: Bucket) => {
    setBucket(b);
    setSelected(null);
  };

  function exportSelected() {
    if (selected == null) return;
    const entry = reviews[bucket][selected];
    const payload: SingleReviewExport = { bucket, entry };
    downloadJson(`review-${fileSlug(entry.name)}.json`, payload);
  }

  return (
    <div className="space-y-6">
      <CharacterNameDatalist id={DATALIST_ID} options={charOptions} />

      <div className="border-line bg-surface-raised/60 rounded-lg border p-3 text-sm">
        <p className="text-content">
          Pick a hero (Premium or Limited) to edit, or add a new one. Once the review is written,
          click <strong>Export this hero</strong> and send the JSON file — it will be reviewed and
          integrated into the site.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-content-subtle text-xs uppercase">Language</span>
        <LangBar lang={lang} setLang={setLang} />
        <span className="text-line mx-1">|</span>
        <button
          type="button"
          className={btn}
          onClick={exportSelected}
          disabled={selected == null}
          title="Download the hero being edited"
        >
          Export this hero
        </button>
      </div>

      <div className="border-line-subtle flex gap-1 border-b pb-2">
        {(['premium', 'limited'] as const).map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => switchBucket(b)}
            className={`rounded-md px-3 py-1 text-sm capitalize ${b === bucket ? 'bg-accent/20 text-accent font-semibold' : 'text-content-muted hover:bg-surface-overlay'}`}
          >
            {b}
          </button>
        ))}
      </div>

      <ReviewWorkbench
        reviews={reviews[bucket]}
        selectedIndex={selected}
        lang={lang}
        refs={refs}
        charOptions={charOptions}
        charByName={charByName}
        onChange={(list) => setReviews({ ...reviews, [bucket]: list })}
        onSelectIndex={setSelected}
      />
    </div>
  );
}
