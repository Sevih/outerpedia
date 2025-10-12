// src/lib/selectPartners.ts
import type { PartnerRoot, PartnerItem, PartnerEntry } from '@/types/partners';

export function selectPartners(root: PartnerRoot, slug: string): PartnerEntry[] {
  const node = root[slug];
  if (!node) return [];

  const out: PartnerEntry[] = [];

  function pushEntries(items: PartnerItem[]): void {
    for (const it of items) {
      if (Array.isArray((it as PartnerEntry).hero)) {
        // entrée finale
        out.push(it as PartnerEntry);
      } else {
        // sous-objet imbriqué: { "<sub>": { partner: [...] } }
        const nested = it as Record<string, { partner: PartnerItem[] }>;
        for (const subSlug in nested) {
          const group = nested[subSlug];
          if (group?.partner?.length) pushEntries(group.partner);
        }
      }
    }
  }

  pushEntries(node.partner);
  return out;
}
