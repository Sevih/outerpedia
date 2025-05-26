'use client';

import { useEffect } from 'react';

export default function SortSelector() {
  useEffect(() => {
    const select = document.getElementById('sortSelector');
    const container = document.querySelector('[data-guide-grid]');

    if (!select || !container) return;

    const handleSort = (e: Event) => {
      const value = (e.target as HTMLSelectElement).value;
      const [key, order] = value.split('-');
      const cards = Array.from(container.children);

      cards.sort((a, b) => {
        const va = a.getAttribute(`data-${key}`);
        const vb = b.getAttribute(`data-${key}`);

        if (key === 'date') {
          return order === 'asc' ? Number(va) - Number(vb) : Number(vb) - Number(va);
        } else {
          return order === 'asc'
            ? va!.localeCompare(vb!)
            : vb!.localeCompare(va!);
        }
      });

      cards.forEach((el) => container.appendChild(el));
    };

    select.addEventListener('change', handleSort);

    return () => {
      select.removeEventListener('change', handleSort);
    };
  }, []);

  return (
    <select
      id="sortSelector"
      className="bg-neutral-800 text-white border border-neutral-700 rounded px-2 py-1 text-sm"
    >
      <option value="date-desc">Date (Newest)</option>
      <option value="date-asc">Date (Oldest)</option>
      <option value="title-asc">Title A→Z</option>
      <option value="title-desc">Title Z→A</option>
      <option value="author-asc">Author A→Z</option>
      <option value="author-desc">Author Z→A</option>
    </select>
  );
}
