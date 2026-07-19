'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { ItemInline } from '@/components/inline/ItemInline';
import type { CouponVM } from '@/lib/home';

/**
 * Codes promo ACTIFS (version accueil : affichage + copie presse-papier, sans
 * panneau d'échange — celui-ci vit sur `/coupons`). Récompenses rendues en
 * badges `ItemInline`. Lien « voir les N codes » vers `/coupons`.
 */
export interface PromoStrings {
  title: string;
  copy: string;
  copied: string;
  empty: string;
  /** Gabarit avec `{count}`. */
  viewAll: string;
}

export function PromoCodes({
  codes,
  activeCount,
  viewAllHref,
  strings,
}: {
  codes: CouponVM[];
  activeCount: number;
  viewAllHref: string;
  strings: PromoStrings;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(null), 1500);
    } catch {
      /* presse-papier indisponible (http, permission) — on n'échoue pas */
    }
  };

  return (
    <section>
      <h2 className="text-content-strong mb-6 text-2xl font-bold">{strings.title}</h2>

      {codes.length === 0 ? (
        <p className="text-content-subtle text-center text-sm">{strings.empty}</p>
      ) : (
        <>
          <div className="divide-line-subtle divide-y">
            {codes.map((promo) => (
              <div key={promo.code} className="flex flex-col gap-1.5 py-3">
                <div className="flex items-center gap-3">
                  <span className="shrink-0 rounded bg-emerald-600/20 px-2.5 py-1 font-mono text-sm font-bold text-emerald-300">
                    {promo.code}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(promo.code)}
                    className="bg-surface-raised hover:bg-surface-muted text-content-muted shrink-0 rounded px-3 py-1.5 text-xs font-medium transition-colors"
                  >
                    {copied === promo.code ? strings.copied : strings.copy}
                  </button>
                </div>
                <div className="flex flex-col gap-1">
                  {promo.rewards.map((r, i) => (
                    <span
                      key={`${promo.code}-${i}`}
                      className="text-content-muted inline-flex items-center gap-1 text-xs"
                    >
                      <ItemInline item={r.item} color="text-content-muted" />
                      <span>x{r.qty}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {activeCount > codes.length && (
            <div className="mt-4 text-center">
              <Link href={viewAllHref as Route} className="text-accent text-sm hover:underline">
                {strings.viewAll.replace('{count}', String(activeCount))}
              </Link>
            </div>
          )}
        </>
      )}
    </section>
  );
}
