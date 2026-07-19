'use client';

import { useEffect, useRef, useState } from 'react';
import { ItemInline } from '@/components/inline/ItemInline';
import type { CouponFullVM, CouponStatus } from '@/lib/home';

/**
 * Liste COMPLÈTE des codes promo (page `/coupons`) : actifs, à venir, expirés,
 * avec badge de statut, validité, récompenses (`ItemInline`) et copie
 * presse-papier. Le rachat one-click de la V2 reste OFF (accord VA Games en
 * attente) — non porté ici.
 */
export interface CouponsStrings {
  copy: string;
  copied: string;
  empty: string;
  active: string;
  upcoming: string;
  expired: string;
  /** Gabarit `{start}` / `{end}`. */
  validity: string;
}

const STATUS: Record<CouponStatus, { badge: string; code: string; icon: string }> = {
  active: { badge: 'text-emerald-400', code: 'bg-emerald-600/20 text-emerald-300', icon: '✓' },
  upcoming: { badge: 'text-amber-400', code: 'bg-amber-600/20 text-amber-300', icon: '⏳' },
  expired: {
    badge: 'text-content-subtle',
    code: 'bg-surface-muted text-content-subtle',
    icon: '✗',
  },
};

export function CouponsList({
  coupons,
  strings,
}: {
  coupons: CouponFullVM[];
  strings: CouponsStrings;
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
      /* presse-papier indisponible — on n'échoue pas */
    }
  };

  const statusLabel = (s: CouponStatus) =>
    s === 'active' ? strings.active : s === 'upcoming' ? strings.upcoming : strings.expired;

  if (coupons.length === 0) {
    return <p className="text-content-subtle text-center text-sm">{strings.empty}</p>;
  }

  return (
    <div className="space-y-3">
      {coupons.map((c) => {
        const st = STATUS[c.status];
        return (
          <div
            key={c.code}
            className={`card-interactive flex flex-col gap-2 p-4 ${c.status === 'expired' ? 'opacity-60' : ''}`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`shrink-0 rounded px-2.5 py-1 font-mono text-sm font-bold ${st.code}`}
              >
                {c.code}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(c.code)}
                className="bg-surface-raised hover:bg-surface-muted text-content-muted shrink-0 rounded px-3 py-1.5 text-xs font-medium transition-colors"
              >
                {copied === c.code ? strings.copied : strings.copy}
              </button>
              <div className="flex-1" />
              <span
                className={`flex shrink-0 items-center gap-1.5 text-xs font-semibold ${st.badge}`}
              >
                <span aria-hidden>{st.icon}</span>
                {statusLabel(c.status)}
              </span>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {c.rewards.map((r, i) => (
                <span
                  key={`${c.code}-${i}`}
                  className="text-content-muted inline-flex items-center gap-1 text-xs"
                >
                  <ItemInline item={r.item} color="text-content-muted" />
                  <span>x{r.qty}</span>
                </span>
              ))}
            </div>

            <p className="text-content-subtle text-xs">
              {strings.validity.replace('{start}', c.start).replace('{end}', c.end)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
