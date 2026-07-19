'use client';

/**
 * Outil PUBLIC de contribution aux reviews « Premium & Limited » (pour Shiraen).
 * Zéro écriture serveur, zéro login : on édite UN perso et on EXPORTE ce seul
 * perso en JSON, que Sevih importe côté admin (c'est là qu'on traduit).
 *
 * On écrit en ANGLAIS uniquement (pas de barre de langue). La sélection est
 * pilotée par le ROSTER de la bannière (persos tagués premium / limited) : un
 * compteur « X/Y reviews » et la liste des persos SANS review. On peut aussi
 * rédiger la review d'un perso PAS ENCORE SORTI (bouton dédié → marqué
 * `unreleased`, saute au rendu jusqu'à sa sortie).
 */
import { useState } from 'react';
import type { InlineRefs } from '@/lib/admin/inline-refs';
import type { ReviewEntryData, ReviewsBundle } from '@/lib/admin/general-guide-store';
import type { CharOption } from '@/components/admin/CharacterPicker';
import {
  ReviewForm,
  downloadJson,
  emptyReview,
  type Bucket,
} from '@/components/admin/premium-limited/PremiumLimitedParts';
import { makeContribution, type ReviewContributionPayload } from '@/lib/contribute/contribution';

const btn =
  'rounded-md border border-line bg-surface-base px-3 py-1.5 text-sm hover:border-accent disabled:opacity-50';
const fileSlug = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') || 'review';

export interface Roster {
  premium: string[];
  limited: string[];
}

export function PremiumReviewsPublicTool({
  initial,
  roster,
  refs,
  charOptions,
}: {
  initial: ReviewsBundle;
  roster: Roster;
  refs: InlineRefs;
  charOptions: CharOption[];
}) {
  const [bucket, setBucket] = useState<Bucket>('premium');
  const [selected, setSelected] = useState<number | null>(null);
  const [reviews, setReviews] = useState<ReviewsBundle>(initial);

  const charByName = new Map(charOptions.map((c) => [c.name, c]));
  const list = reviews[bucket];
  const names = roster[bucket];

  // Une review « compte » si son EN est renseigné (les entrées vides créées à la
  // sélection n'inflent pas le compteur).
  const indexOf = (name: string) => list.findIndex((r) => r.name === name);
  const hasReview = (name: string) => {
    const i = indexOf(name);
    return i >= 0 && !!list[i].review.en?.trim();
  };
  const reviewedCount = names.filter(hasReview).length;
  const missing = names.filter((n) => !hasReview(n));
  const offRoster = list.map((r, i) => ({ r, i })).filter(({ r }) => !names.includes(r.name));

  const switchBucket = (b: Bucket) => {
    setBucket(b);
    setSelected(null);
  };
  const setList = (next: ReviewEntryData[]) => setReviews({ ...reviews, [bucket]: next });

  /** Édite (ou crée) la review d'un perso du roster. */
  const pickRoster = (name: string) => {
    const i = indexOf(name);
    if (i >= 0) return setSelected(i);
    setList([...list, { ...emptyReview(), name }]);
    setSelected(list.length);
  };
  /** Ajoute une review pour un perso pas encore sorti. */
  const addUnreleased = () => {
    setList([...list, { ...emptyReview(), unreleased: true }]);
    setSelected(list.length);
  };

  function exportSelected() {
    if (selected == null) return;
    const entry = list[selected];
    // « edit » si le perso avait déjà une review au chargement, sinon « add ».
    const existed = initial[bucket].some(
      (r) =>
        r.name.trim().toLowerCase() === entry.name.trim().toLowerCase() && !!r.review.en?.trim(),
    );
    const payload: ReviewContributionPayload = { bucket, entry };
    const envelope = makeContribution('premium-limited-review', existed ? 'edit' : 'add', payload);
    downloadJson(`review-${fileSlug(entry.name)}.json`, envelope);
  }

  const chip = (active: boolean) =>
    `rounded-md border px-2.5 py-1 text-sm ${active ? 'border-accent text-accent bg-accent/10' : 'border-line text-content-muted hover:border-accent'}`;

  return (
    <div className="space-y-6">
      <div className="border-line bg-surface-raised/60 rounded-lg border p-3 text-sm">
        <p className="text-content">
          Pick a hero to write or adjust its review (in English), then click{' '}
          <strong>Export this hero</strong> and send the JSON file — it will be reviewed and
          integrated. Translations are handled on import.
        </p>
      </div>

      {/* Bucket Premium / Limited */}
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

      {/* Compteur + roster */}
      <section className="space-y-3">
        <p className="text-content text-sm">
          <span className="font-semibold">
            {reviewedCount} / {names.length}
          </span>{' '}
          {bucket} unit reviews
          {missing.length > 0 && (
            <span className="text-warn"> — {missing.length} without review</span>
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          {names.map((name) => {
            const i = indexOf(name);
            const done = hasReview(name);
            return (
              <button
                key={name}
                type="button"
                className={chip(i >= 0 && i === selected)}
                onClick={() => pickRoster(name)}
              >
                {done ? '★ ' : '☆ '}
                {name}
              </button>
            );
          })}
        </div>

        {offRoster.length > 0 && (
          <div className="space-y-1">
            <p className="text-content-subtle text-xs uppercase">Unreleased / off-roster</p>
            <div className="flex flex-wrap gap-2">
              {offRoster.map(({ r, i }) => (
                <button
                  key={i}
                  type="button"
                  className={chip(i === selected)}
                  onClick={() => setSelected(i)}
                >
                  {r.name || '(unnamed)'}
                  {r.unreleased && <span className="text-warn"> ·unreleased</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        <button type="button" className={btn} onClick={addUnreleased}>
          + Review an unreleased hero
        </button>
      </section>

      {selected != null && list[selected] && (
        <ReviewForm
          entry={list[selected]}
          lang="en"
          refs={refs}
          charOptions={charOptions}
          charByName={charByName}
          heroMode="auto"
          onChange={(r) => setList(list.map((x, j) => (j === selected ? r : x)))}
        />
      )}

      <div className="border-line-subtle flex items-center gap-3 border-t pt-4">
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
    </div>
  );
}
