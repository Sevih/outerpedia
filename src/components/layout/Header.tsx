import { getRequestLang } from '@/lib/i18n/server';
import { getT } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import { localePath } from '@/lib/navigation';
import { NAV_ITEMS } from '@/lib/nav';
import { img } from '@/lib/images';
import { getGameVersion } from '@/lib/data/game-version';
import { GUIDE_CATEGORIES, GUIDE_CATEGORY_SLUGS } from '@/lib/data/guide-categories';
import { characterDisplayName, getAllCharacters, getCharacter } from '@/lib/data/characters';
import { SITE_SETTINGS_ENABLED } from '@/lib/site-settings-flag';
import type { Lang } from '@/lib/i18n/config';
import { HeaderClient, type HeaderNavItem } from './HeaderClient';
import type { SkinCatalogEntry } from './SettingsModal';

/**
 * Le catalogue de la modale des réglages : les persos qui ont au moins un
 * costume AFFICHABLE, pré-localisés — même règle d'éligibilité que la galerie
 * de la fiche perso (une core-fusion hérite des skins de sa base via leur
 * modèle fusionné). ~60 entrées, quelques Ko dans le payload de chaque page :
 * le prix d'une modale sans import de table côté client.
 */
function buildSkinCatalog(lang: Lang): SkinCatalogEntry[] {
  const catalog: SkinCatalogEntry[] = [];
  for (const char of getAllCharacters()) {
    const isFusion = Boolean(char.originalCharacter);
    const source = isFusion ? getCharacter(char.originalCharacter!) : char;
    const options: SkinCatalogEntry['options'] = [];
    for (const cos of source?.costumes ?? []) {
      const model = isFusion ? cos.fusionModel : cos.model;
      const hasArt = isFusion ? cos.fusionArt : cos.art;
      if (!hasArt || !model || model === '0' || model === char.id) continue;
      options.push({ model, name: lRec(cos.name, lang) || cos.name.en });
    }
    if (options.length) {
      catalog.push({ id: char.id, name: characterDisplayName(char, lang), options });
    }
  }
  return catalog.sort((a, b) => a.name.localeCompare(b.name));
}

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
      skinCatalog={SITE_SETTINGS_ENABLED ? buildSkinCatalog(lang) : []}
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
        settings: {
          title: t('settings.title'),
          animated: t('settings.animated'),
          animatedNote: t('settings.animated_note'),
          skins: t('settings.skins'),
          skinsNote: t('settings.skins_note'),
          defaultPortrait: t('settings.default_portrait'),
          resetSkins: t('settings.reset_skins'),
          filterPlaceholder: t('settings.filter'),
          close: t('settings.close'),
          back: t('settings.back'),
        },
      }}
    />
  );
}
