import { AdminSidebar, type NavSection } from '@/components/admin/AdminSidebar';
import { assertDevOnly } from '@/lib/admin/guard';
import { reviewAll, reviewBuckets } from '@/lib/admin/review-store';
import { actionableDiff } from '@/lib/admin/monster-review';

// Outil local : jamais prérendu, 404 en prod.
export const dynamic = 'force-dynamic';

/**
 * Compteurs « à traiter » (diff jeu ↔ site) affichés sur les lignes Extractor,
 * par id de cible. `new + diff + removed` (le typo, cosmétique, est exclu du
 * badge). Robuste : une extraction en échec ne doit PAS faire tomber toute la
 * coquille admin.
 */
function pendingCounts(): Record<string, { count: number; title: string }> {
  const out: Record<string, { count: number; title: string }> = {};
  try {
    for (const r of reviewAll()) {
      // Monstres : seuls ceux servis par le site sont actionnables (cf.
      // `actionableDiff`) — sinon le badge compte du bruit d'extraction.
      const b = reviewBuckets(actionableDiff(r.id, r.diff));
      // Le badge est un TOTAL ; le détail va en infobulle (sinon « 4 » se lit
      // « 4 diff » alors que la page dit « 2 new + 2 diff »).
      out[r.id] = {
        count: b.new + b.diff + b.removed,
        title: `${b.new} new + ${b.diff} diff + ${b.removed} removed`,
      };
    }
  } catch {
    /* extraction indisponible */
  }
  return out;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  assertDevOnly();
  const n = pendingCounts();
  const warn = (p?: { count: number; title: string }) =>
    p && p.count > 0 ? { count: p.count, tone: 'warn' as const, title: p.title } : null;

  const sections: NavSection[] = [
    {
      title: 'Extractor',
      items: [
        { label: 'Character', href: '/admin/extractor/characters', badge: warn(n.character) },
        { label: 'Effect', href: '/admin/extractor/effects', badge: warn(n.effect) },
        { label: 'EE', href: '/admin/extractor/ee', badge: warn(n.ee) },
        { label: 'Weapons', href: '/admin/extractor/weapons', badge: warn(n.weapon) },
        { label: 'Amulet', href: '/admin/extractor/amulets', badge: warn(n.amulet) },
        { label: 'Armor', href: '/admin/extractor/armors', badge: warn(n.armor) },
        { label: 'Talisman', href: '/admin/extractor/talismans', badge: warn(n.talisman) },
        { label: 'Sets', href: '/admin/extractor/sets', badge: warn(n.set) },
        { label: 'Monster', href: '/admin/extractor/monsters', badge: warn(n.monster) },
        { label: 'Item', href: '/admin/extractor/items', badge: warn(n.item) },
      ],
    },
    {
      // Même ordre d'entités que l'Extractor (demande Sevih) ; le Monstre et
      // l'Item ferment la liste des deux côtés.
      // Même ordre d'entités que l'Extractor (demande Sevih) ; le Monstre et
      // l'Item ferment la liste des deux côtés. PAS d'éditeur pour les autres
      // pièces d'équipement (armes/amulettes/armures/talismans/sets) : rien à
      // curer dessus — seul l'EE a une curation (rang + câblage des chips).
      title: 'Editor',
      items: [
        { label: 'Character', href: '/admin/editor/characters' },
        { label: 'Effect', href: '/admin/editor/effects' },
        { label: 'EE', href: '/admin/editor/ee' },
        { label: 'Monster', href: '/admin/editor/monsters' },
        { label: 'Item', href: '/admin/editor/items' },
      ],
    },
    {
      title: 'Tools',
      items: [
        { label: 'Pro / Con', href: '/admin/tools/pros-cons' },
        { label: 'Synergy', href: '/admin/tools/synergies' },
        { label: 'Search aliases', href: '/admin/tools/search-aliases' },
        { label: 'Short names', href: '/admin/tools/short-names' },
        { label: 'Promo code', href: '/admin/tools/promo-codes' },
        { label: 'Banner', href: '/admin/tools/banners' },
        { label: 'Changelog', href: '/admin/tools/changelog' },
        { label: 'Events', href: '/admin/tools/events' },
        { label: 'Game data', href: '/admin/tools/gamedata' },
      ],
    },
    {
      title: 'Guide editor',
      items: [{ label: 'Guides', href: '/admin/guides' }],
    },
    {
      title: 'Misc',
      items: [
        { label: 'Tag control', href: '/admin/tags' },
        { label: 'Gear presets', href: '/admin/gear-presets' },
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
