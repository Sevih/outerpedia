import { AdminSidebar, type NavSection } from '@/components/admin/AdminSidebar';
import { assertDevOnly } from '@/lib/admin/guard';
import { actionableCount, bucketsOf, EXTRACTOR_ENTITIES } from '@/lib/admin/admin-inbox';
import { GUIDE_EDITOR_CATEGORIES } from '@/lib/admin/guide-nav';
import { RootDocument } from '../root-document';

// Outil local : jamais prérendu, 404 en prod.
export const dynamic = 'force-dynamic';

// Layout RACINE de l'admin (pas de `app/layout.tsx` global — chaque racine rend
// son <html> via RootDocument, cf. ce fichier). Figé en `en` : outil local.
export const metadata = { title: { default: 'Admin', template: '%s | Outerpedia Admin' } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  assertDevOnly();
  /**
   * Badge « à traiter » d'une entité : le TOTAL `new + diff + removed` (le typo,
   * cosmétique, en est exclu) ; le détail va en infobulle, sinon « 4 » se lit
   * « 4 diff » alors que la page dit « 2 new + 2 diff ».
   * Les buckets viennent de `admin-inbox` — même calcul que l'inbox de la home,
   * mémoïsé à la requête (cf. `entityBuckets`).
   */
  const badge = (id: string) => {
    const b = bucketsOf(id);
    const count = actionableCount(b);
    return count > 0
      ? {
          count,
          tone: 'warn' as const,
          title: `${b.new} new + ${b.diff} diff + ${b.removed} removed`,
        }
      : null;
  };

  const sections: NavSection[] = [
    {
      // Liste + ordre viennent d'`admin-inbox` (source unique, partagée avec la
      // home) — le Monstre et l'Item ferment la liste (décision Sevih).
      title: 'Extractor',
      items: EXTRACTOR_ENTITIES.map((e) => ({
        label: e.label,
        href: e.href,
        badge: badge(e.id),
      })),
    },
    {
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
      // Une entrée par TYPE de guide (chaque type a sa propre liste latérale) ;
      // « Overview » garde l'accueil (import de contribution) accessible.
      title: 'Guide editor',
      items: [
        { label: 'Overview', href: '/admin/guides', exact: true },
        ...GUIDE_EDITOR_CATEGORIES.map((c) => ({
          label: c.label,
          href: `/admin/guides/${c.slug}`,
        })),
      ],
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
    <RootDocument lang="en">
      <div className="bg-surface-base text-content flex min-h-dvh">
        <AdminSidebar sections={sections} />
        <main className="min-w-0 flex-1 px-6 py-6">{children}</main>
      </div>
    </RootDocument>
  );
}
