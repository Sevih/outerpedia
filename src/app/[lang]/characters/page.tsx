import type { Metadata } from 'next';
import { isValidLang, type Lang } from '@/lib/i18n/config';
import { getT } from '@/i18n';
import { createPageMetadata, buildItemListJsonLd, buildUrl } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import { CharactersBrowser, type CharacterRow } from '@/components/character/CharactersBrowser';
import {
  characterDisplayName,
  characterNamePrefix,
  getCharacterListItems,
  slugForId,
} from '@/lib/data/characters';
import { characterTags, loadCuratedCharacters } from '@/lib/data/curated';

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = (isValidLang(raw) ? raw : 'en') as Lang;
  const t = await getT(lang);
  return createPageMetadata({
    lang,
    path: '/characters',
    title: t('page.characters.title'),
    description: t('page.characters.description'),
  });
}

function buildRows(lang: Lang): CharacterRow[] {
  const curated = loadCuratedCharacters();
  return getCharacterListItems().map((c) => ({
    id: c.id,
    slug: slugForId(c.id) ?? c.id,
    name: characterDisplayName(c, lang),
    prefix: characterNamePrefix(c, lang),
    element: c.element,
    class: c.class,
    rarity: c.rarity,
    isFusion: c.isFusion,
    // Tags DÉRIVÉS DU JEU (extraction) + le seul tag humain (`free`, curé).
    // La map curée est passée explicitement : une seule lecture pour le roster.
    tags: characterTags(c, curated),
    rank: curated[c.id]?.rank,
    role: curated[c.id]?.role,
  }));
}

export default async function CharactersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const lang = (isValidLang(raw) ? raw : 'en') as Lang;
  const t = await getT(lang);
  const rows = buildRows(lang);

  const itemList = buildItemListJsonLd({
    name: t('page.characters.title'),
    url: buildUrl(lang, '/characters'),
    itemListOrder: 'Unordered',
    items: [...rows]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((r) => ({ name: r.name, url: buildUrl(lang, `/characters/${r.slug}`) })),
  });

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6">
      <JsonLd data={itemList} />
      <div>
        <h1 className="text-content-strong text-2xl font-bold">{t('page.characters.title')}</h1>
        <p className="text-content-muted text-sm">{t('page.characters.description')}</p>
      </div>
      <CharactersBrowser rows={rows} />
    </div>
  );
}
