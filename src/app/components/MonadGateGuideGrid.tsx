import Image from 'next/image';
import Link from 'next/link';

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

export default function MonadGateGuideGrid({ items }: Props) {
  const groupedByDepth = items.reduce<Record<string, GuideItem[]>>((acc, item) => {
    const match = item.slug.match(/^depth(\d+)/i);
    const depth = match ? `Depth ${match[1]}` : 'Other';
    if (!acc[depth]) acc[depth] = [];
    acc[depth].push(item);
    return acc;
  }, {});

  const sortedDepths = Object.keys(groupedByDepth).sort((a, b) => {
    const aNum = parseInt(a.replace('Depth ', ''), 10);
    const bNum = parseInt(b.replace('Depth ', ''), 10);
    return aNum - bNum;
  });

  return (
    <div className="space-y-12">
      {sortedDepths.map((depth) => (
        <div key={depth}>
          <h3 className="text-xl font-bold text-white mb-4">{depth}</h3>
          <div
            data-guide-grid
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {groupedByDepth[depth].map(({ slug, title, description, last_updated, author }) => (
              <Link
                key={slug}
                href={`/guides/monad-gate/${slug}`}
                className="group bg-zinc-900 border border-zinc-700 rounded-2xl p-4 flex flex-col hover:border-yellow-500 hover:shadow-lg transition-all min-h-[160px]"
                data-title={title.toLowerCase()}
                data-author={author.toLowerCase()}
                data-date={new Date(last_updated).getTime()}
              >
                <div className="flex items-start gap-4 mb-3">
                  <Image
                    src={`/images/guides/monad-gate/CM_Adventure_MonadGate.webp`}
                    alt={`${title} icon`}
                    width={48}
                    height={48}
                    style={{ width: 48, height: 48 }}
                    className="flex-shrink-0 object-contain rounded"
                  />
                  <div>
                    <h2 className="text-white text-lg font-bold">{title}</h2>
                    <p className="text-sm text-neutral-300">{description}</p>
                  </div>
                </div>
                <div className="mt-auto text-sm text-neutral-400 flex flex-col sm:flex-row sm:justify-between sm:items-center pt-2 border-t border-neutral-700 gap-1">
                  <span className="flex items-start gap-1">
                    ✍️{' '}
                    <span className="overflow-wrap break-words">
                      {author.split('/').map((part, i) => (
                        <span key={i}>
                          {part}
                          {i < author.split('/').length - 1 && <span>/</span>}
                          <wbr />
                        </span>
                      ))}
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    🕒 {new Date(last_updated).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
