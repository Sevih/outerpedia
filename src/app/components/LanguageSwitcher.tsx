'use client';

import { usePathname } from 'next/navigation';
import { TENANTS, type TenantKey } from '@/tenants/config';

export default function LanguageSwitcher({ current }: { current: TenantKey }) {
  const pathname = usePathname();

  const changeLang = (to: TenantKey) => {
    if (to === current) return;
    const target = TENANTS[to];
    if (!target) return;
    window.location.href = `https://${target.domain}${pathname}`;
  };

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="sr-only">Language</span>
      <select
        aria-label="Language"
        value={current}
        onChange={(e) => changeLang(e.target.value as TenantKey)}
        className="rounded-md border border-gray-600 bg-neutral-900 px-3 py-1 text-sm text-white
                   hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-cyan-600"
      >
        {Object.entries(TENANTS).map(([key, t]) => (
          <option key={key} value={key}>
            {t.label}
          </option>
        ))}
      </select>
    </label>
  );
}
