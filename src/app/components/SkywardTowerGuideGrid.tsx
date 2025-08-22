import Link from 'next/link';
import Image from 'next/image';

type TowerDifficulty = 'normal' | 'hard' | 'veryhard';

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

const bgByMode: Record<TowerDifficulty, string> = {
    normal: 'T_Tower_Bg.png',
    hard: 'T_Tower_Hard_Bg.png',
    veryhard: 'T_Tower_VeryHard_Bg.png',
};

function getDifficulty(slug: string): TowerDifficulty {
    const clean = slug.toLowerCase();
    if (clean.includes('very-hard')) return 'veryhard';
    if (clean.includes('hard')) return 'hard';
    return 'normal';
}





export default function SkywardTowerGuideGrid({ items }: Props) {
    const difficultyOrder = ['normal', 'hard', 'veryhard'] as const;

    const sortedItems = [...items].sort((a, b) => {
        const diffA = getDifficulty(a.slug);
        const diffB = getDifficulty(b.slug);
        return difficultyOrder.indexOf(diffA) - difficultyOrder.indexOf(diffB);
    });



    return (
        <div
            data-guide-grid
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
            {sortedItems.map(({ slug, title, description, category }) => {
                const bg = bgByMode[getDifficulty(slug)];
                return (
                    <Link
                        key={slug}
                        href={`/guides/${category}/${slug}`}
                        className="group relative rounded-2xl overflow-hidden border border-neutral-700 hover:border-sky-500 hover:shadow-xl transition-all bg-neutral-800 min-h-[160px]"
                    >
                        <Image
                            src={`/images/guides/skyward-tower/${bg}`}
                            alt={`${title} background`}
                            fill
                            className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                        />
                        <div className="absolute inset-0 bg-black/60 p-4 flex flex-col justify-end">
                            <h2 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-white tracking-wide drop-shadow-md uppercase">
                                {title}
                            </h2>
                            <p className="mt-1 text-neutral-300 italic text-xs sm:text-sm md:text-base leading-snug">
                                {description}
                            </p>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}

