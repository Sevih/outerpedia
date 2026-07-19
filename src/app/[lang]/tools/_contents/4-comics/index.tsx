import { getT, type TranslationKey } from '@/i18n';
import type { Lang } from '@/lib/i18n/config';
import comicsFallback from '@data/generated/comics.json';
import { ComicsGallery, type ComicsData } from './ComicsGallery';

/** Langues d'origine des BD (ordre d'affichage des onglets). */
const COMIC_LANGS = ['EN', 'JP', 'KR'] as const;
const BASE = process.env.NEXT_PUBLIC_IMG_BASE ?? '';

/**
 * Charge le catalogue des BD. En prod : le MANIFESTE hébergé sur R2
 * (`images/4-comics/comics.json`, poussé par `pnpm images`), lu à la requête
 * avec revalidation — une BD ajoutée apparaît SANS redéploiement (< 10 min).
 * En dev (BASE vide) ou si R2 est injoignable : repli sur la donnée committée.
 */
async function loadComics(): Promise<ComicsData> {
  if (BASE) {
    try {
      const res = await fetch(`${BASE}/images/4-comics/comics.json`, {
        next: { revalidate: 600 },
      });
      if (res.ok) return (await res.json()) as ComicsData;
    } catch {
      /* R2 injoignable → repli committé */
    }
  }
  return comicsFallback as ComicsData;
}

/**
 * 4-Cut Comics — wrapper SERVEUR : charge le catalogue (manifeste R2), résout
 * les libellés i18n et le compte par langue d'origine (onglets non vides
 * uniquement), puis passe le tout à la galerie client. Les BD sont faites main,
 * ramenées en V3 (`.editorial/comics/`), jamais pointées V2.
 */
export default async function Comics({ lang }: { lang: Lang }) {
  const t = await getT(lang);
  const data = await loadComics();

  const languages = COMIC_LANGS.filter((l) => (data[l]?.length ?? 0) > 0).map((l) => ({
    key: l,
    label: t(`comics.lang.${l}` as TranslationKey),
    count: data[l].length,
  }));

  return (
    <ComicsGallery
      data={data}
      languages={languages}
      strings={{
        description: t('comics.description'),
        credit: t('comics.credit'),
      }}
    />
  );
}
