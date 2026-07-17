import type { TranslationKey } from '@/i18n';

/**
 * NAVIGATION PRINCIPALE — contrat V2 : mêmes items, même ordre, mêmes URL
 * (header, menu mobile, et la future recherche lisent la même source).
 *
 * Certaines cibles n'existent PAS ENCORE en V3 (/tierlist, /tools…) : ASSUMÉ
 * (décision Sevih 2026-07-17) — le layout précède les pages ; l'inventaire des
 * pages manquantes vit dans docs/TODO.md (section « Pages manquantes »).
 */
export interface NavItem {
  key: TranslationKey;
  /** Libellé court (nav resserrée / menu mobile). */
  shortKey: TranslationKey;
  href: string;
  /** Sprite du jeu (namespace `images/ui/nav/` — collecté par le manifest). */
  icon: string;
}

// prettier-ignore
export const NAV_ITEMS: readonly NavItem[] = [
  { key: 'nav.characters', shortKey: 'nav.characters.short', href: '/characters', icon: 'CM_EtcMenu_Colleague' },
  { key: 'nav.equipment', shortKey: 'nav.equipment.short', href: '/equipment', icon: 'CM_EtcMenu_Inventory' },
  { key: 'nav.tierlist', shortKey: 'nav.tierlist.short', href: '/tierlist', icon: 'CM_Mission_Icon_Daily' },
  { key: 'nav.utilities', shortKey: 'nav.utilities.short', href: '/tools', icon: 'CM_EtcMenu_Setting' },
  { key: 'nav.guides', shortKey: 'nav.guides.short', href: '/guides', icon: 'CM_EtcMenu_Character_Book' },
];

/** Pages hors nav principale mais cherchables (recherche à venir, footer). */
export const EXTRA_PAGES: ReadonlyArray<{ key: TranslationKey; href: string }> = [
  { key: 'page.coupons.title', href: '/coupons' },
  { key: 'contributors.title', href: '/contributors' },
  { key: 'changelog.title', href: '/changelog' },
];
