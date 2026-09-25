import { getT, type TranslationKey } from '@/i18n';
import type { Lang } from '@/lib/i18n/config';
import { getWallpapers } from '@/lib/data/wallpapers';
import { ARCHIVED } from './archived';
import { WallpapersGallery, type Wallpaper, type WallpapersData } from './WallpapersGallery';

/** Ordre d'affichage des catégories (inchangé). */
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
 *
 * ARCHIVÉS : une entrée `retired` est un asset que le jeu a retiré de ses
 * bundles mais que R2 sert toujours (rétention de catalogue de `promote`, cf.
 * `RETAIN_CATALOGS`). Elle quitte sa catégorie d'origine pour l'onglet
 * « Archivés », dernier, qui la garde sous son dossier de service (`cat`).
 */
export default async function Wallpapers({ lang }: { lang: Lang }) {
  const t = await getT(lang);
  const source: WallpapersData = getWallpapers();

  const data: WallpapersData = {};
  const archived: Wallpaper[] = [];
  for (const c of CATEGORY_ORDER) {
    data[c] = (source[c] ?? []).filter((w) => !w.retired);
    for (const w of source[c] ?? []) if (w.retired) archived.push({ ...w, cat: c });
  }
  if (archived.length) data[ARCHIVED] = archived;

  const categories = [...CATEGORY_ORDER, ARCHIVED]
    .filter((c) => (data[c]?.length ?? 0) > 0)
    .map((c) => ({
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
        archivedNote: t('wallpapers.archivedNote'),
        close: t('common.close'),
        previous: t('common.previous'),
        next: t('common.next'),
      }}
    />
  );
}
