import { AdminSidebar, type NavSection } from '@/components/admin/AdminSidebar';
import { assertDevOnly } from '@/lib/admin/guard';
import { RootDocument } from '../root-document';

// Outil local : jamais prérendu, 404 en prod.
export const dynamic = 'force-dynamic';

// Layout RACINE de l'admin (pas de `app/layout.tsx` global — chaque racine rend
// son <html> via RootDocument, cf. ce fichier). Figé en `en` : outil local.
export const metadata = { title: { default: 'Admin', template: '%s | Outerpedia Admin' } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  assertDevOnly();
  const sections: NavSection[] = [
    // Groupe « Extractor » : vide depuis le 12/10, il sort du menu. Effect,
    // Armor et Item : portés dans quick (Données › Extraction, lot F20 — la
    // revue par cible, l'acceptation, l'intégration des items). Character, EE,
    // Weapons, Amulet, Talisman, Sets : la même section (lot F21 — la fiche
    // par entité et son intégration, le mode). Monster : la même encore (lot
    // F22 — « Figer et ré-épingler » sur sa fiche, le plan avant de figer).
    // La liste des dix cibles reste dans `admin-inbox` (`EXTRACTOR_ENTITIES`,
    // lue par l'inbox de la home et par quick) ; les pages
    // (`/admin/extractor/…`) restent joignables par leur URL jusqu'au retrait
    // de l'admin.
    // Groupe « Editor » : vide depuis le 09/10, il sort du menu. Character :
    // porté dans quick (Éditeurs › Fiche perso, Gear reco compris), lien
    // retiré le 09/10. Effect : porté dans quick (Éditeurs › Effets), lien
    // retiré le 08/10. EE : porté dans quick (Éditeurs › Fiche perso,
    // sous-onglet « EE »), lien retiré le 09/10. Monster : porté dans quick
    // (Éditeurs › Monstres : le câblage des chips, les monstres des guides
    // d'abord), lien retiré le 09/10 — les stats, l'intégration et les
    // versions restent à l'Extractor. Item : porté dans quick (Éditeurs ›
    // Items : le catalogue curé, la fiche à six langues, la création), lien
    // retiré le 09/10. PAS d'éditeur pour les autres pièces d'équipement
    // (armes/amulettes/armures/talismans/sets) : rien à curer dessus. Les
    // pages (`/admin/editor/…`) restent joignables par leur URL jusqu'au
    // retrait de l'admin.
    {
      title: 'Tools',
      items: [
        // Pro / Con et Synergy : portés dans quick (Éditeurs › Fiche perso,
        // sous-onglets « Pros / Cons » et « Synergies »), liens retirés le
        // 08/10 — les pages restent joignables par leur URL jusqu'au retrait
        // de l'admin.
        // Short names et Search aliases : portés dans quick (Outils › Noms),
        // liens retirés le 08/10 — les pages restent joignables par leur URL
        // jusqu'au retrait de l'admin.
        // Promo code : porté dans quick (Codes promo), lien retiré le 08/10 —
        // la page reste joignable par son URL jusqu'au retrait de l'admin.
        // Banner : porté dans quick (Publication › Bannières), lien retiré le
        // 08/10 — la page reste joignable par son URL jusqu'au retrait de l'admin.
        // Changelog : porté dans quick (Publication › Journal du site), lien
        // retiré le 08/10 — la page reste joignable par son URL jusqu'au retrait
        // de l'admin.
        { label: 'Events', href: '/admin/tools/events' },
        // Game data : porté dans quick (Données › Tables du jeu), lien retiré
        // le 08/10 — la page reste joignable par son URL jusqu'au retrait de
        // l'admin, et l'item « Assets » de l'inbox y renvoie toujours.
      ],
    },
    // Groupe « Guide editor » : vide depuis le 11/10, il sort du menu. Les
    // guides de BOSS (`GUIDE_SPECS`) sont portés dans quick (Guides › Guides,
    // lot F18), liens sortis le 11/10 ; les trois guides GÉNÉRAUX à fragment
    // éditable (Premium & Limited, Free Heroes, Shop priorities) et l'import de
    // contribution (« Overview ») le sont aussi (lot F19), liens sortis le
    // 11/10. Les pages (`/admin/guides`, `/admin/guides/<catégorie>/<slug>`)
    // restent joignables par leur URL jusqu'au retrait de l'admin ; les onze
    // guides généraux en `.ts` ne s'éditent ni ici ni dans quick (contenu en
    // code).
    // Groupe « Misc » : vide depuis le 09/10, il sort du menu avec ses deux
    // liens. Tag control : pas porté dans quick, le contrôle EST le test
    // (`tag-control.test.ts`, bloquant dans `pnpm test` donc dans
    // `pnpm commit`). Gear presets : non porté (décision Sevih du 09/10),
    // `data/curated/gear-presets.json` s'édite à la main. Les deux pages
    // (`/admin/tags`, `/admin/gear-presets`) restent joignables par leur URL
    // jusqu'au retrait de l'admin, et l'item « Dead inline tags » de l'inbox
    // renvoie toujours à la première.
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
