import { AdminSidebar, type NavSection } from '@/components/admin/AdminSidebar';
import { assertDevOnly } from '@/lib/admin/guard';
import { reviewTarget, reviewTotals } from '@/lib/admin/review-store';
import { v2MissingInV3 } from '@/lib/data/effects';
import { equipmentV2Control } from '@/lib/admin/equipment-control';

// Outil local : jamais prérendu, 404 en prod.
export const dynamic = 'force-dynamic';

/**
 * Compteurs « à traiter » affichés sur les lignes Extractor. Robuste : une
 * source en échec (extraction cassée, oracle absent) ne doit PAS faire tomber
 * toute la coquille admin.
 */
function pendingCounts() {
  let character = 0;
  let monster = 0;
  let effect = 0;
  const gear: Record<string, number> = {};
  try {
    character = reviewTotals(reviewTarget('character').diff);
  } catch {
    /* extraction indisponible */
  }
  try {
    monster = reviewTotals(reviewTarget('monster').diff);
  } catch {
    /* extraction indisponible */
  }
  try {
    effect = v2MissingInV3().length;
  } catch {
    /* oracle effets indisponible */
  }
  try {
    for (const r of equipmentV2Control()) gear[r.name] = r.issues.length + r.missingV3.length;
  } catch {
    /* oracle équipement indisponible */
  }
  return { character, monster, effect, gear };
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  assertDevOnly();
  const n = pendingCounts();
  const warn = (count: number) => (count > 0 ? { count, tone: 'warn' as const } : null);
  const danger = (count: number) => (count > 0 ? { count, tone: 'danger' as const } : null);

  const sections: NavSection[] = [
    {
      title: 'Extractor',
      items: [
        { label: 'Personnage', href: '/admin/extractor/characters', badge: warn(n.character) },
        { label: 'Effect', href: '/admin/extractor/effects', badge: danger(n.effect) },
        { label: 'EE', href: '/admin/extractor/ee', badge: warn(n.gear.ee ?? 0) },
        { label: 'Armes', href: '/admin/extractor/weapons', badge: warn(n.gear.weapons ?? 0) },
        { label: 'Amulet', href: '/admin/extractor/amulets', badge: warn(n.gear.amulets ?? 0) },
        { label: 'Armor', href: '/admin/extractor/armors' },
        {
          label: 'Talisman',
          href: '/admin/extractor/talismans',
          badge: warn(n.gear.talismans ?? 0),
        },
        { label: 'Sets', href: '/admin/extractor/sets', badge: warn(n.gear.sets ?? 0) },
        { label: 'Monstre', href: '/admin/extractor/monsters', badge: warn(n.monster) },
      ],
    },
    {
      title: 'Editor',
      items: [
        { label: 'Effect', href: '/admin/editor/effects' },
        { label: 'Personnage', href: '/admin/editor/characters' },
        { label: 'Item', href: '/admin/editor/items' },
        { label: 'EE', href: '/admin/editor/ee', soon: true },
        { label: 'Armes', href: '/admin/editor/weapons', soon: true },
        { label: 'Amulet', href: '/admin/editor/amulets', soon: true },
        { label: 'Armor', href: '/admin/editor/armors', soon: true },
        { label: 'Talisman', href: '/admin/editor/talismans', soon: true },
        { label: 'Monstre', href: '/admin/editor/monsters', soon: true },
      ],
    },
    {
      title: 'Tools',
      items: [
        { label: 'Pro / Con', href: '/admin/tools/pros-cons' },
        { label: 'Synergy', href: '/admin/tools/synergies' },
        { label: 'Code promo', href: '/admin/tools/promo-codes' },
        { label: 'Banner', href: '/admin/tools/banners' },
      ],
    },
    {
      title: 'Guide editor',
      items: [{ label: 'Guides', href: '/admin/guides', soon: true }],
    },
    {
      title: 'Divers',
      items: [
        { label: 'Contrôle des tags', href: '/admin/tags' },
        { label: 'Presets gear', href: '/admin/gear-presets' },
      ],
    },
  ];

  return (
    <div className="bg-surface-base text-content flex min-h-dvh">
      <AdminSidebar sections={sections} />
      <main className="min-w-0 flex-1 px-6 py-6">{children}</main>
    </div>
  );
}
