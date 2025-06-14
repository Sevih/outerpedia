import Link from 'next/link';
import Image from 'next/image';

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

export default function GuideCardGrid({ items }: Props) {
  return (
    <div
      data-guide-grid
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {items.map(
        ({ slug, title, description, icon, category, last_updated, author }) => (
          <Link
            key={slug}
            href={`/guides/${category}/${slug}`}
            className="group bg-neutral-900/70 border border-neutral-700 rounded-2xl p-4 flex flex-col hover:border-sky-500 hover:shadow-lg transition-all min-h-[160px]"
            data-title={title.toLowerCase()}
            data-author={author.toLowerCase()}
            data-date={new Date(last_updated).getTime()}
          >
            <div className="flex items-start gap-4 mb-3">
              <Image
                src={`/images/guides/${category}/${icon}_portrait.webp`}
                alt={`${title} icon`}
                width={48}
                height={48}
                style={{ width: 48, height: 48 }}
                className="flex-shrink-0 object-contain"
              />
              <div>
                <h2 className="text-white text-lg font-bold">{title}</h2>
                <p className="text-sm text-neutral-300">{description}</p>
              </div>
            </div>
            <div className="mt-auto text-sm text-neutral-400 flex flex-col sm:flex-row sm:justify-between sm:items-center pt-2 border-t border-neutral-700 gap-1">
  <span className="flex items-start gap-1">
    ✍️ <span className="overflow-wrap break-words">
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
        )
      )}
    </div>
  );
}
