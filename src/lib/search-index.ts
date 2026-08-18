/**
 * INDEX DE RECHERCHE GLOBALE — aplatit les cibles cherchables d'une langue en
 * une liste `{ label, href, kind, icon, terms }`. Construit CÔTÉ SERVEUR (lit la
 * donnée committée + le contrat `lib/nav.ts`) et servi par `/api/search` : la
 * palette (Ctrl+K) le charge à la première ouverture plutôt que de l'inliner
 * dans le header de CHAQUE page.
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
import {
  characterDisplayName,
  characterSearchNames,
  getCharacterListItems,
  slugForId,
} from '@/lib/data/characters';
import { loadSearchAliases } from '@/lib/data/search-aliases';
import { normalizeSearchText } from '@/lib/search-text';

export type SearchKind = 'page' | 'character' | 'equipment' | 'guide';

export interface SearchEntry {
  label: string;
  href: string;
  kind: SearchKind;
  /** URL R2 d'une vignette (facultatif : les pages annexes n'en ont pas). */
  icon?: string;
  /**
   * Tout ce qui doit MATCHER, au-delà du libellé affiché : les noms des AUTRES
   * langues, les alias curés, le slug. Sans eux, un visiteur de zh.outerpedia.com
   * ne peut chercher qu'en chinois — le nom anglais, qu'il connaît par la
   * communauté, ne matchait plus rien dès que la donnée zh a été traduite
   * (signalé par XTY109 le 18/08/2026).
   *
   * Une CHAÎNE pré-normalisée (mots séparés par des espaces) et pas un tableau :
   * l'index part sur le réseau, et le client n'a plus rien à normaliser à la
   * frappe — il fait des `includes` dessus.
   *
   * Ce qu'on y met est DOSÉ, l'index étant téléchargé : les personnages portent
   * tous leurs noms (parité avec le champ de la page personnages — deux barres
   * qui ne trouvent pas les mêmes persos seraient le bug d'à côté ; +9 Ko gzip),
   * les pages et les guides seulement leur libellé et leur SLUG, qui est déjà la
   * forme anglaise de leur sujet. Les titres de guides des quatre langues
   * coûtaient 6 Ko gzip pour ce que le slug donne gratuitement.
   */
  terms?: string;
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

/** Agrège des termes cherchables : normalisés, dédupliqués, joints par espace. */
function terms(...parts: (string | undefined)[]): string {
  const seen = new Set<string>();
  for (const part of parts) {
    const n = normalizeSearchText(part ?? '');
    if (n) seen.add(n);
  }
  return [...seen].join(' ');
}

/**
 * Le href en mots : `/guides/guild-raid` → « guides guild raid ». Le slug est le
 * nom ANGLAIS canonique de la cible — il rend les pages et les guides trouvables
 * en anglais depuis toutes les langues, sans charger un second jeu de traductions.
 */
function hrefWords(href: string): string {
  return href.replace(/[/_-]+/g, ' ');
}

/** Toutes les cibles cherchables pour `lang`, pré-localisées. */
export function buildSearchIndex(lang: Lang, t: (key: TranslationKey) => string): SearchEntry[] {
  // Pages : nav principale (icônes de jeu) + catégories de guides + pages annexes
  // (contrat lib/nav.ts — mêmes cibles que le header, 404 assumées comprises).
  const pages: SearchEntry[] = [
    ...NAV_ITEMS.map((i): SearchEntry => {
      const href = localePath(lang, i.href);
      return {
        label: t(i.key),
        href,
        kind: 'page',
        icon: img.navIcon(i.icon),
        terms: terms(t(i.key), hrefWords(href)),
      };
    }),
    ...GUIDE_CATEGORY_SLUGS.map((slug): SearchEntry => {
      const { label, icon } = GUIDE_CATEGORIES[slug];
      const href = localePath(lang, `/guides/${slug}`);
      return {
        label: lRec(label, lang) || label.en,
        href,
        kind: 'page',
        icon: img.guideIcon(icon),
        terms: terms(lRec(label, lang) || label.en, hrefWords(href)),
      };
    }),
    ...EXTRA_PAGES.map((p): SearchEntry => {
      const href = localePath(lang, p.href);
      return {
        label: t(p.key),
        href,
        kind: 'page',
        terms: terms(t(p.key), hrefWords(href)),
      };
    }),
  ];

  const characters = source('characters', () => {
    // Alias curés (fautes, abréviations) chargés UNE fois, pas par personnage.
    const aliases = loadSearchAliases();
    return getCharacterListItems().flatMap((c) => {
      const slug = slugForId(c.id);
      if (!slug) return [];
      return [
        {
          label: characterDisplayName(c, lang),
          href: localePath(lang, `/characters/${slug}`),
          kind: 'character' as const,
          icon: img.face(c.id),
          // Même univers de noms que le champ de la page personnages : noms
          // toutes langues + surnoms + alias + id + slug.
          terms: terms(characterDisplayName(c, lang), ...characterSearchNames(c, aliases[c.id])),
        },
      ];
    });
  });

  const guides = source('guides', () =>
    listGuides()
      .filter((g) => !g.hidden)
      .map((g): SearchEntry => {
        const href = localePath(lang, `/guides/${g.category}/${g.slug}`);
        return {
          label: lRec(g.title, lang),
          href,
          kind: 'guide',
          icon: img.guideIcon(g.icon),
          terms: terms(lRec(g.title, lang), hrefWords(href)),
        };
      }),
  );

  return [...pages, ...characters, ...guides];
}
