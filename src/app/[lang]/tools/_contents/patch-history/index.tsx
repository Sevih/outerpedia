import { getT, type TranslationKey } from '@/i18n';
import type { Lang } from '@/lib/i18n/config';
import postsData from '@data/patch-notes/posts.json';
import {
  PatchHistoryBrowser,
  type PatchHistoryLabels,
  type PatchPost,
} from './PatchHistoryBrowser';

interface RawPost extends PatchPost {
  lang: string;
}

const TYPES = [
  'update',
  'notice',
  'event',
  'devnote',
  'known-issue',
  'patchnotes',
  'developer-notes',
  'compendium',
  'media-archives',
  'official-4-cut-cartoon',
  'probabilities',
  'world-introduction',
];

/**
 * Patch & Dev Notes — wrapper SERVEUR : sert les posts major9 de la langue
 * courante (`posts.json`, scrape getNews — en/jp/kr seulement : zh ET fr
 * retombent sur en, bandeau `zh_fallback` reformulé par locale) + les
 * libellés. L'archive Smilegate (EN, figée) n'est PAS embarquée ici : le
 * client la charge en chunk séparé à la demande.
 */
export default async function PatchHistory({ lang }: { lang: Lang }) {
  const t = await getT(lang);
  const effectiveLang = (['en', 'jp', 'kr'] as Lang[]).includes(lang) ? lang : 'en';
  const posts = (postsData.posts as RawPost[])
    .filter((p) => p.lang === effectiveLang)
    .map(({ id, date, slug, type, title, content }) => ({ id, date, slug, type, title, content }));

  const labels: PatchHistoryLabels = {
    eras: {
      major9: t('tools.patch-history.era.major9'),
      smilegate: t('tools.patch-history.era.smilegate'),
    },
    types: Object.fromEntries(
      TYPES.map((type) => [type, t(`tools.patch-history.type.${type}` as TranslationKey)]),
    ),
    all: t('common.all'),
    search: t('common.search'),
    loading: t('common.loading'),
    zhFallback: t('tools.patch-history.zh_fallback'),
    legacyEnOnly: t('tools.patch-history.legacy_en_only'),
  };

  return (
    <PatchHistoryBrowser
      posts={posts}
      labels={labels}
      fallbackToEn={lang !== effectiveLang}
      isEn={lang === 'en'}
    />
  );
}
