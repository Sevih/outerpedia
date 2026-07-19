import { getT, type TranslationKey } from '@/i18n';
import type { Lang } from '@/lib/i18n/config';
import wallpapersData from '@data/generated/wallpapers.json';
import { WallpapersGallery, type WallpapersData } from './WallpapersGallery';

/** Ordre d'affichage des catégories (parité V2). */
const CATEGORY_ORDER = [
  'Outerpedia',
  'HeroFullArt',
  'Cutin',
  'Full:Scenario',
  'Full:Events',
  'Full:Others',
  'Banner',
  'Art',
] as const;

/**
 * Wallpapers — wrapper SERVEUR : résout les libellés i18n et l'ordre des
 * catégories (seules les non vides sont exposées : les catégories du pool jeu
 * apparaissent une fois l'extraction worker passée), puis passe le tout à la
 * galerie client. Données : `wallpapers.json` (générateur `datagen:build`).
 */
export default async function Wallpapers({ lang }: { lang: Lang }) {
  const t = await getT(lang);
  const data = wallpapersData as WallpapersData;

  const categories = CATEGORY_ORDER.filter((c) => (data[c]?.length ?? 0) > 0).map((c) => ({
    key: c,
    label: t(`wallpapers.cat.${c}` as TranslationKey),
    count: data[c].length,
  }));

  return (
    <WallpapersGallery
      data={data}
      categories={categories}
      strings={{
        description: t('wallpapers.description'),
        download: t('wallpapers.download'),
        disclaimer1: t('wallpapers.disclaimer.line1'),
        disclaimer2: t('wallpapers.disclaimer.line2'),
        contactLink: t('wallpapers.contactLink'),
      }}
    />
  );
}
