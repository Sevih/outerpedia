'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/lib/contexts/I18nContext'

type GuideItem = {
  slug: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  last_updated: string;
  author: string;
};

type Props = {
  items: GuideItem[];
};

export default function AdventureGuideGrid({ items }: Props) {
  const [spoilerFree, setSpoilerFree] = useState(true);
  const { t } = useI18n();

  const grouped = items.reduce((acc: Record<string, GuideItem[]>, item) => {
    const match = item.slug.match(/^(S\d+)-/);
    const season = match ? match[1] : 'Unknown';
    if (!acc[season]) acc[season] = [];
    acc[season].push(item);
    return acc;
  }, {});

  const sortedSeasons = Object.keys(grouped).sort((a, b) => {
    const na = parseInt(a.slice(1));
    const nb = parseInt(b.slice(1));
    return na - nb;
  });

  const sortByChapter = (a: GuideItem, b: GuideItem) => {
    const parse = (slug: string) => {
      const match = slug.match(/^S(\d+)-(\d+)-(\d+)/);
      return match ? match.slice(1).map(Number) : [0, 0, 0];
    };
    const [sa, ca, stga] = parse(a.slug);
    const [sb, cb, stgb] = parse(b.slug);
    if (sa !== sb) return sa - sb;
    if (ca !== cb) return ca - cb;
    return stga - stgb;
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-end">
        <button
          onClick={() => setSpoilerFree((v) => !v)}
          className="px-3 py-1 text-sm border border-neutral-600 rounded bg-neutral-800 hover:bg-neutral-700 transition"
        >
          {spoilerFree ? t('guides.spoilerFree.disable') : t('guides.spoilerFree.enable')}
        </button>
      </div>

      {sortedSeasons.map((season) => (
        <div key={season}>
          <h2 className="text-xl font-semibold text-white mb-4">{season} {t('categories.adventure')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {grouped[season].sort(sortByChapter).map((item) => {
              const [safeTitle] = item.title.split(':');
              // Extract mode from title
              const modeMatch = safeTitle.match(/(Normal|Hard|ノーマル|ハード|노말|하드)/);
              const mode = modeMatch ? modeMatch[1] : '';
              // Extract from slug: "S1-8-5" + mode → "S1 Normal 8-5"
              const slugMatch = item.slug.match(/^(S\d+)-(\d+)-(\d+)/);
              const spoilerFreeTitle = slugMatch
                ? `${slugMatch[1]}${mode ? ' ' + mode : ''} ${slugMatch[2]}-${slugMatch[3]}`
                : safeTitle;

              return (
                <Link
                  key={item.slug}
                  href={`/guides/${item.category}/${item.slug}`}
                  className="group bg-neutral-900/70 border border-neutral-700 rounded-2xl p-4 flex flex-col hover:border-sky-500 hover:shadow-lg transition-all min-h-[160px]"
                >
                  <div className="flex items-start gap-4 mb-3">
                    {spoilerFree ? (
                      <div className="w-full">
                        <h2 className="text-white text-lg font-bold">{spoilerFreeTitle.trim()}</h2>
                        <div className="mt-2 text-sm text-neutral-400 flex flex-col sm:flex-row sm:justify-between sm:items-center border-t border-neutral-700 pt-2 gap-1">
                          <span className="flex items-start gap-1">
                            ✍️{' '}
                            <span className="overflow-wrap break-words">
                              {item.author.split('/').map((part, i) => (
                                <span key={i}>
                                  {part}
                                  {i < item.author.split('/').length - 1 && <span>/</span>}
                                  <wbr />
                                </span>
                              ))}
                            </span>
                          </span>
                          <span className="flex items-center gap-1">
                            🕒 {new Date(item.last_updated).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Image
                          src={`/images/guides/${item.category}/${item.icon}_portrait.webp`}
                          alt={`${item.title} icon`}
                          width={48}
                          height={48}
                          style={{ width: 48, height: 48 }}
                          className="flex-shrink-0 object-contain"
                        />
                        <div>
                          <h2 className="text-white text-lg font-bold">{item.title}</h2>
                          <p className="text-sm text-neutral-300">{item.description}</p>
                        </div>
                      </>
                    )}
                  </div>

                  {!spoilerFree && (
                    <div className="mt-auto text-sm text-neutral-400 flex flex-col sm:flex-row sm:justify-between sm:items-center pt-2 border-t border-neutral-700 gap-1">
                      <span className="flex items-start gap-1">
                        ✍️{' '}
                        <span className="overflow-wrap break-words">
                          {item.author.split('/').map((part, i) => (
                            <span key={i}>
                              {part}
                              {i < item.author.split('/').length - 1 && <span>/</span>}
                              <wbr />
                            </span>
                          ))}
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        🕒 {new Date(item.last_updated).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
