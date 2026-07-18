import { getRequestLang } from '@/lib/i18n/server';
import { getT } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import { localePath } from '@/lib/navigation';
import { NAV_ITEMS } from '@/lib/nav';
import { img } from '@/lib/images';
import { getGameVersion } from '@/lib/data/game-version';
import { GUIDE_CATEGORIES, GUIDE_CATEGORY_SLUGS } from '@/lib/data/guide-categories';
import { HeaderClient, type HeaderNavItem } from './HeaderClient';

/**
 * En-tête global — wrapper serveur : localise le contrat `lib/nav.ts`
 * (cibles 404 assumées le temps du portage), résout les icônes R2 et les
 * catégories de guides (sous-menu), puis délègue l'interactif à HeaderClient.
 */
export async function Header() {
  const lang = getRequestLang();
  const t = await getT(lang);

  const guideChildren = GUIDE_CATEGORY_SLUGS.map((slug) => ({
    href: localePath(lang, `/guides/${slug}`) as string,
    label: lRec(GUIDE_CATEGORIES[slug].label, lang) || GUIDE_CATEGORIES[slug].label.en,
  }));

  const nav: HeaderNavItem[] = NAV_ITEMS.map((item) => ({
    href: localePath(lang, item.href) as string,
    label: t(item.key),
    short: t(item.shortKey),
    iconSrc: img.navIcon(item.icon),
    children: item.href === '/guides' ? guideChildren : undefined,
  }));

  return (
    <HeaderClient
      lang={lang}
      nav={nav}
      appVersion={process.env.NEXT_PUBLIC_APP_VERSION || 'dev'}
      gameVersion={getGameVersion()}
      strings={{
        toggleMenu: t('aria.toggle_menu'),
        lang: {
          language: t('common.language'),
          official: t('header.lang.official'),
          community: t('header.lang.community'),
          communityNote: t('header.lang.community_note'),
        },
        search: {
          placeholder: t('search.placeholder'),
          short: t('search.short_placeholder'),
          noResults: t('search.no_results'),
          pages: t('search.pages'),
          characters: t('search.characters'),
          guides: t('search.guides'),
        },
      }}
    />
  );
}
