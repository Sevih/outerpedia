import { AdminSidebar, type NavSection } from '@/components/admin/AdminSidebar';
import { assertDevOnly } from '@/lib/admin/guard';
import { reviewAll, reviewBuckets } from '@/lib/admin/review-store';

// Outil local : jamais prérendu, 404 en prod.
export const dynamic = 'force-dynamic';

/**
 * Compteurs « à traiter » (diff jeu ↔ site) affichés sur les lignes Extractor,
 * par id de cible. `new + diff + removed` (le typo, cosmétique, est exclu du
 * badge). Robuste : une extraction en échec ne doit PAS faire tomber toute la
 * coquille admin.
 */
function pendingCounts(): Record<string, number> {
  const out: Record<string, number> = {};
  try {
    for (const r of reviewAll()) {
      const b = reviewBuckets(r.diff);
      out[r.id] = b.new + b.diff + b.removed;
    }
  } catch {
    /* extraction indisponible */
  }
  return out;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  assertDevOnly();
  const n = pendingCounts();
  const warn = (count: number) => (count > 0 ? { count, tone: 'warn' as const } : null);

  const sections: NavSection[] = [
    {
      title: 'Extractor',
      items: [
        { label: 'Personnage', href: '/admin/extractor/characters', badge: warn(n.character ?? 0) },
        { label: 'Effect', href: '/admin/extractor/effects', badge: warn(n.effect ?? 0) },
        { label: 'EE', href: '/admin/extractor/ee', badge: warn(n.ee ?? 0) },
        { label: 'Armes', href: '/admin/extractor/weapons', badge: warn(n.weapon ?? 0) },
        { label: 'Amulet', href: '/admin/extractor/amulets', badge: warn(n.amulet ?? 0) },
        { label: 'Armor', href: '/admin/extractor/armors', badge: warn(n.armor ?? 0) },
        { label: 'Talisman', href: '/admin/extractor/talismans', badge: warn(n.talisman ?? 0) },
        { label: 'Sets', href: '/admin/extractor/sets', badge: warn(n.set ?? 0) },
        { label: 'Monstre', href: '/admin/extractor/monsters', badge: warn(n.monster ?? 0) },
        { label: 'Item', href: '/admin/extractor/items', badge: warn(n.item ?? 0) },
      ],
    },
    {
      // Même ordre d'entités que l'Extractor (demande Sevih) ; le Monstre et
      // l'Item ferment la liste des deux côtés.
      title: 'Editor',
      items: [
        { label: 'Personnage', href: '/admin/editor/characters' },
        { label: 'Effect', href: '/admin/editor/effects' },
        { label: 'EE', href: '/admin/editor/ee' },
        { label: 'Armes', href: '/admin/editor/weapons', soon: true },
        { label: 'Amulet', href: '/admin/editor/amulets', soon: true },
        { label: 'Armor', href: '/admin/editor/armors', soon: true },
        { label: 'Talisman', href: '/admin/editor/talismans', soon: true },
        { label: 'Monstre', href: '/admin/editor/monsters' },
        { label: 'Item', href: '/admin/editor/items' },
      ],
    },
    {
      title: 'Tools',
      items: [
        { label: 'Pro / Con', href: '/admin/tools/pros-cons' },
        { label: 'Synergy', href: '/admin/tools/synergies' },
        { label: 'Code promo', href: '/admin/tools/promo-codes' },
        { label: 'Banner', href: '/admin/tools/banners' },
        { label: 'Données du jeu', href: '/admin/tools/gamedata' },
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
