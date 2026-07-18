/**
 * INDEX DE RECHERCHE GLOBALE — aplatit les cibles cherchables d'une langue en
 * une liste `{ label, href, kind, icon }`. Construit CÔTÉ SERVEUR (lit la donnée
 * committée + le contrat `lib/nav.ts`) et servi par `/api/search` : la palette
 * (Ctrl+K) le charge à la première ouverture plutôt que de l'inliner dans le
 * header de CHAQUE page.
 *
 * Périmètre : pages de nav (+ catégories de guides + pages annexes), personnages,
 * guides. L'ÉQUIPEMENT est différé (éclaté en familles/sets/EE avec des slugs
 * dérivés — à ajouter ici quand son énumération sera stabilisée ; l'archi et la
 * palette le prennent sans changement, `kind: 'equipment'`).
 */
import type { TranslationKey } from '@/i18n';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { localePath } from '@/lib/navigation';
import { img } from '@/lib/images';
import { NAV_ITEMS, EXTRA_PAGES } from '@/lib/nav';
import { GUIDE_CATEGORIES, GUIDE_CATEGORY_SLUGS } from '@/lib/data/guide-categories';
import { listGuides } from '@/lib/data/guides';
import { characterDisplayName, getCharacterListItems, slugForId } from '@/lib/data/characters';

export type SearchKind = 'page' | 'character' | 'equipment' | 'guide';

export interface SearchEntry {
  label: string;
  href: string;
  kind: SearchKind;
  /** URL R2 d'une vignette (facultatif : les pages annexes n'en ont pas). */
  icon?: string;
}

/**
 * Une SOURCE de l'index, en best-effort : la recherche est un confort dérivé,
 * pas une page critique. Si une source échoue (ex. un guide transitoirement
 * malformé pendant un portage), on l'ignore et on sert le reste plutôt que de
 * faire 500 la palette — l'erreur reste levée, bruyamment, par les pages qui
 * consomment cette donnée directement (liste de guides…).
 */
function source(label: string, build: () => SearchEntry[]): SearchEntry[] {
  try {
    return build();
  } catch (e) {
    console.warn(
      `[search-index] source « ${label} » ignorée : ${e instanceof Error ? e.message : e}`,
    );
    return [];
  }
}

/** Toutes les cibles cherchables pour `lang`, pré-localisées. */
export function buildSearchIndex(lang: Lang, t: (key: TranslationKey) => string): SearchEntry[] {
  // Pages : nav principale (icônes de jeu) + catégories de guides + pages annexes
  // (contrat lib/nav.ts — mêmes cibles que le header, 404 assumées comprises).
  const pages: SearchEntry[] = [
    ...NAV_ITEMS.map((i): SearchEntry => ({
      label: t(i.key),
      href: localePath(lang, i.href),
      kind: 'page',
      icon: img.navIcon(i.icon),
    })),
    ...GUIDE_CATEGORY_SLUGS.map((slug): SearchEntry => ({
      label: lRec(GUIDE_CATEGORIES[slug].label, lang) || GUIDE_CATEGORIES[slug].label.en,
      href: localePath(lang, `/guides/${slug}`),
      kind: 'page',
      icon: img.guideIcon(GUIDE_CATEGORIES[slug].icon),
    })),
    ...EXTRA_PAGES.map((p): SearchEntry => ({
      label: t(p.key),
      href: localePath(lang, p.href),
      kind: 'page',
    })),
  ];

  const characters = source('characters', () =>
    getCharacterListItems().flatMap((c) => {
      const slug = slugForId(c.id);
      if (!slug) return [];
      return [
        {
          label: characterDisplayName(c, lang),
          href: localePath(lang, `/characters/${slug}`),
          kind: 'character' as const,
          icon: img.face(c.id),
        },
      ];
    }),
  );

  const guides = source('guides', () =>
    listGuides()
      .filter((g) => !g.hidden)
      .map((g): SearchEntry => ({
        label: lRec(g.title, lang),
        href: localePath(lang, `/guides/${g.category}/${g.slug}`),
        kind: 'guide',
        icon: img.guideIcon(g.icon),
      })),
  );

  return [...pages, ...characters, ...guides];
}
