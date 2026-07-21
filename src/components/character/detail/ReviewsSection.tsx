'use client';

/**
 * Reviews communautaires (portage V2) : moyenne + distribution par étoile,
 * cartes d'avis (score de votes, avatar Discord, note, texte avec emojis
 * custom rendus en images), pagination « charger plus » côté client.
 *
 * Les avatars et emojis viennent du CDN Discord (couvert par `img-src https:`
 * de la CSP). L'accent élémentaire arrive en `hex` (comme QuickToc) — les
 * libellés sont résolus côté serveur et passés en props.
 */
import { useState } from 'react';
import type { Review } from '@/lib/data/reviews';
import { DISCORD_INVITE_URL } from '@/lib/discord';

const PAGE_SIZE = 10;

export interface ReviewsLabels {
  /** Phrase du CTA, le lien « EvaMains Discord » la termine. */
  cta: string;
  noReviews: string;
  /** « {count} reviews », déjà interpolé. */
  count: string;
  loadMore: string;
  viaDiscord: string;
}

interface Props {
  reviews: Review[];
  /** Accent élémentaire de la fiche (moyenne + barres de distribution). */
  hex: string;
  /** Locale BCP 47 des dates (LANGUAGES[lang].htmlLang). */
  dateLocale: string;
  labels: ReviewsLabels;
}

function discordAvatarUrl(userId: string, avatar: string | null): string {
  if (avatar) return `https://cdn.discordapp.com/avatars/${userId}/${avatar}.webp?size=64`;
  // Avatar par défaut de Discord — dérivé de l'id utilisateur (même règle que le client).
  const index = Number(BigInt(userId) >> BigInt(22)) % 6;
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}

/** Emojis custom Discord (`<:nom:id>`, `<a:nom:id>` animés) rendus en images. */
function renderTextWithEmojis(text: string) {
  const parts = text.split(/(<a?:\w+:\d+>)/g);
  return parts.map((part, i) => {
    const match = part.match(/^<(a?):(\w+):(\d+)>$/);
    if (!match) return part;
    const [, animated, name, id] = match;
    const ext = animated ? 'gif' : 'webp';
    return (
      // eslint-disable-next-line @next/next/no-img-element -- emoji du CDN Discord
      <img
        key={i}
        src={`https://cdn.discordapp.com/emojis/${id}.${ext}?size=20`}
        alt={`:${name}:`}
        title={`:${name}:`}
        width={20}
        height={20}
        className="inline-block align-text-bottom"
        loading="lazy"
      />
    );
  });
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        if (star <= Math.floor(rating)) {
          return (
            <span key={star} className="text-amber-400">
              ★
            </span>
          );
        }
        if (star === Math.ceil(rating) && rating % 1 >= 0.5) {
          return (
            <span key={star} className="relative text-zinc-600">
              ★
              <span className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                <span className="text-amber-400">★</span>
              </span>
            </span>
          );
        }
        return (
          <span key={star} className="text-zinc-600">
            ★
          </span>
        );
      })}
    </div>
  );
}

export function ReviewsSection({ reviews, hex, dateLocale, labels }: Props) {
  const [page, setPage] = useState(1);

  const average =
    reviews.length > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
      : 0;

  // Distribution par étoile entière (1..5).
  const distribution = [0, 0, 0, 0, 0];
  for (const r of reviews) {
    const bucket = Math.min(5, Math.max(1, Math.round(r.rating)));
    distribution[bucket - 1]++;
  }

  const visibleReviews = reviews.slice(0, page * PAGE_SIZE);
  const hasMore = visibleReviews.length < reviews.length;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(dateLocale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-zinc-400">
        {labels.cta}{' '}
        <a
          href={DISCORD_INVITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-400 hover:underline"
        >
          EvaMains Discord
        </a>
      </p>

      {reviews.length === 0 ? (
        <p className="text-sm text-zinc-500 italic">{labels.noReviews}</p>
      ) : (
        <>
          {/* Résumé : moyenne + distribution */}
          <div className="grid grid-cols-[auto_1fr] items-center gap-7 border-b border-white/6 pb-5">
            <div className="flex min-w-32 flex-col items-center gap-1.5">
              <div
                className="font-game text-5xl leading-none font-bold"
                style={{ color: hex, textShadow: `0 0 24px ${hex}55` }}
              >
                {average}
              </div>
              <StarRating rating={average} />
              <span className="font-mono text-[10px] tracking-wider text-zinc-500 uppercase">
                {labels.count}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = distribution[star - 1];
                const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={star} className="grid grid-cols-[28px_1fr_36px] items-center gap-2.5">
                    <span className="font-mono text-[11px] text-zinc-400">{star}★</span>
                    <span className="h-1.5 overflow-hidden rounded-full bg-white/5">
                      <span
                        className="block h-full"
                        style={{ width: `${pct}%`, background: hex, opacity: 0.7 }}
                      />
                    </span>
                    <span className="text-right font-mono text-[10.5px] text-zinc-500">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Liste des avis */}
          <div className="flex flex-col gap-3">
            {visibleReviews.map((review) => (
              <div key={review.id} className="card flex items-start gap-3 rounded-xl p-4">
                {/* Score de votes */}
                <div className="flex shrink-0 flex-col items-center gap-0.5 pt-1">
                  <span className="text-xs text-zinc-500">👍</span>
                  <span
                    className={`text-sm font-semibold ${
                      review.score > 0
                        ? 'text-emerald-400'
                        : review.score < 0
                          ? 'text-red-400'
                          : 'text-zinc-500'
                    }`}
                  >
                    {review.score || 0}
                  </span>
                  <span className="text-xs text-zinc-500">👎</span>
                </div>

                {/* eslint-disable-next-line @next/next/no-img-element -- avatar du CDN Discord */}
                <img
                  src={discordAvatarUrl(review.userId, review.avatar)}
                  alt={review.displayName}
                  width={40}
                  height={40}
                  className="shrink-0 rounded-full"
                  loading="lazy"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-zinc-200">{review.displayName}</span>
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-zinc-500">{formatDate(review.timestamp)}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-zinc-300">
                    {renderTextWithEmojis(review.text)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <button
              onClick={() => setPage((p) => p + 1)}
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2 text-sm text-zinc-400 transition hover:bg-white/10 hover:text-zinc-200"
            >
              {labels.loadMore}
            </button>
          )}

          <p className="text-xs text-zinc-500">{labels.viaDiscord}</p>
        </>
      )}
    </div>
  );
}
