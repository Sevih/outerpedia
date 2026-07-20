/**
 * Présentation du journal du site (`/changelog`) : correspondances type →
 * badge/icône, et résolution du lien et de la vignette d'une entrée.
 *
 * Séparé de la couche données (`@/lib/data/changelog`), qui reste pure : ici on
 * touche aux assets (portraits) et au rendu. Les classes Tailwind sont des
 * LITTÉRAUX — v4 ne voit pas les concaténations `bg-${x}`.
 */
import type { Lang } from '@/lib/i18n/config';
import { LANGUAGES } from '@/lib/i18n/config';
import type { TranslationKey } from '@/i18n';
import type { ChangelogType, ChangelogLink, ResolvedChangelogEntry } from '@/lib/data/changelog';
import { getCharacterBySlug } from '@/lib/data/characters';
import { getGuide, guideBossMonster } from '@/lib/data/guides';
import { monsterOgImage } from '@/lib/data/monsters';
import { img } from '@/lib/images';

/** Badge coloré par type (tokens `cat-*` de globals.css). */
export const CHANGELOG_TYPE_BADGE: Record<ChangelogType, string> = {
  guide: 'bg-cat-emerald-fg/15 text-cat-emerald-fg',
  update: 'bg-cat-sky-fg/15 text-cat-sky-fg',
  feature: 'bg-cat-violet-fg/15 text-cat-violet-fg',
  character: 'bg-cat-amber-fg/15 text-cat-amber-fg',
  news: 'bg-cat-teal-fg/15 text-cat-teal-fg',
  fix: 'bg-cat-rose-fg/15 text-cat-rose-fg',
};

/** Icône de repli pour la vignette (ni image explicite, ni portrait). */
export const CHANGELOG_TYPE_ICON: Record<ChangelogType, string> = {
  guide: '🧭',
  update: '🔁',
  feature: '🧰',
  character: '🛡️',
  news: '📣',
  fix: '🐞',
};

/** Clé i18n de l'appel à l'action, selon la nature du lien. */
export function changelogGotoKey(kind: ChangelogLink['kind']): TranslationKey {
  return `changelog.goto.${kind}` as TranslationKey;
}

/** Chemin interne (sans préfixe de langue) d'une entrée, ou `undefined`. */
export function changelogHref(link?: ChangelogLink): string | undefined {
  if (!link) return undefined;
  return link.kind === 'character' ? `/characters/${link.slug}` : link.href;
}

/**
 * Vignette d'une entrée = l'og:image de la cible du lien. Si cette og retomberait
 * sur la carte de partage PAR DÉFAUT du site (`og_default`, trop grande /
 * générique) — ou s'il n'y a pas d'og propre — pas de vignette : la carte affiche
 * l'icône de type. Cf. `changelogThumb`.
 */
export function changelogThumb(entry: ResolvedChangelogEntry): string | undefined {
  const src = resolveThumb(entry);
  return src && src !== img.ogDefault() ? src : undefined;
}

function resolveThumb(entry: ResolvedChangelogEntry): string | undefined {
  if (entry.image) return img.asset(entry.image);
  const { link } = entry;
  if (link?.kind === 'character') {
    // Og:image de la fiche perso (icône de visage).
    const id = getCharacterBySlug(link.slug)?.id;
    return id ? img.facePng(id) : undefined;
  }
  if (link?.kind === 'guide') return guideOgImage(link.href);
  // Outil / page / aucun lien : leur og:image est la carte par défaut → aucune vignette.
  return undefined;
}

/**
 * og:image d'un guide depuis son href `/guides/<catégorie>/<slug>` : on réutilise
 * exactement la carte de partage de la page guide — `ogImage` explicite, sinon le
 * portrait du boss représentant le guide (`guideBossMonster` : `bossId`, ou le boss
 * de phase 2 dérivé pour un guild raid). Renvoie `undefined` si le guide n'a ni
 * image ni boss (ex. general-guides → icône de type).
 */
function guideOgImage(href: string): string | undefined {
  const m = href.match(/^\/guides\/([^/]+)\/([^/?#]+)/);
  if (!m) return undefined;
  const guide = getGuide(m[1], m[2]);
  if (!guide) return undefined;
  if (guide.ogImage) return img.asset(guide.ogImage);
  const boss = guideBossMonster(guide);
  if (boss) return monsterOgImage(boss);
  return undefined;
}

/** Date ISO → date localisée courte, en UTC (aligne sur la borne de publication). */
export function formatChangelogDate(date: string, lang: Lang): string {
  const d = new Date(`${date}T00:00:00Z`);
  return new Intl.DateTimeFormat(LANGUAGES[lang].htmlLang, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(d);
}
