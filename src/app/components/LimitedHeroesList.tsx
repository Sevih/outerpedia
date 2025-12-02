'use client';

import Link from 'next/link';
import { CharacterPortrait } from '@/app/components/CharacterPortrait';
import { useTenant } from '@/lib/contexts/TenantContext';
import { l } from '@/lib/localize';
import { TENANTS } from '@/tenants/config';
import type { Entry, BannerHistoryEntry, BadgeType } from '@/types/pull';
import type { CharacterLite } from '@/types/types';
import bannerData from '@/data/banner.json';
import limitedCharacters from '@/data/characters_limited.json';
import allCharacters from '@/data/_allCharacters.json';

type LimitedBadge = Exclude<BadgeType, 'premium' | null>;

type HeroInfo = {
    slug: string;
    id: string;
    badge: LimitedBadge;
    releaseDate: string;
    lastRerun: string | null;
    collabName?: string;
};

// Build a map from Fullname to character data
const charByFullname = new Map<string, CharacterLite>();
for (const char of allCharacters as CharacterLite[]) {
    charByFullname.set(char.Fullname, char);
}

const COLLAB_NAMES: Record<string, string> = {
    'ais-wallenstein': 'DanMachi',
    'bell-cranel': 'DanMachi',
    'ryu-lion': 'DanMachi',
};

const BADGE_STYLES: Record<string, { className: string; label: string }> = {
    limited: { className: 'text-pink-400', label: 'Limited' },
    seasonal: { className: 'text-green-400', label: 'Seasonal' },
    collab: { className: 'text-red-400', label: 'Collab' },
};

function formatDate(dateStr: string, locale: string): string {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: '2-digit' };
    return date.toLocaleDateString(locale, options);
}

function getLimitedHeroesInfo(): HeroInfo[] {
    const banners = bannerData as BannerHistoryEntry[];
    const limitedChars = limitedCharacters as Entry[];

    // Create a map of limited character names to their info
    const charInfoMap = new Map<string, { badge: LimitedBadge; id: string; slug: string }>();
    for (const char of limitedChars) {
        charInfoMap.set(char.name, {
            badge: char.badge as LimitedBadge,
            id: char.id,
            slug: char.slug,
        });
    }

    // Group banner entries by character name
    const bannersByChar = new Map<string, { entries: BannerHistoryEntry[]; slug: string }>();
    for (const banner of banners) {
        if (!charInfoMap.has(banner.name)) continue;

        const charInfo = charInfoMap.get(banner.name)!;
        const existing = bannersByChar.get(banner.name) || { entries: [], slug: charInfo.slug };
        existing.entries.push(banner);
        bannersByChar.set(banner.name, existing);
    }

    // Build hero info for each limited character
    const heroesInfo: HeroInfo[] = [];

    for (const [name, { entries, slug }] of bannersByChar) {
        entries.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

        const releaseDate = entries[0].start;
        const lastRerun = entries.length > 1 ? entries[entries.length - 1].start : null;
        const charInfo = charInfoMap.get(name)!;

        heroesInfo.push({
            slug,
            id: charInfo.id,
            badge: charInfo.badge,
            releaseDate,
            lastRerun,
            collabName: COLLAB_NAMES[slug],
        });
    }

    heroesInfo.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());

    return heroesInfo;
}

// Build a map from slug to Fullname for lookup
const slugToFullname = new Map<string, string>();
for (const char of limitedCharacters as Entry[]) {
    slugToFullname.set(char.slug, char.name);
}

export default function LimitedHeroesList() {
    const { key: lang } = useTenant();
    const heroes = getLimitedHeroesInfo();
    const dateLocale = TENANTS[lang].locale;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {heroes.map((hero) => {
                const fullname = slugToFullname.get(hero.slug);
                const charData = fullname ? charByFullname.get(fullname) : null;
                if (!charData) return null;

                const heroName = l(charData, 'Fullname', lang);
                const badgeStyle = BADGE_STYLES[hero.badge];
                const rerunText = hero.lastRerun
                    ? `Last rerun: ${formatDate(hero.lastRerun, dateLocale)}`
                    : null;
                const collabText = hero.collabName ? ` with ${hero.collabName}` : '';

                return (
                    <Link
                        key={hero.slug}
                        href={`/characters/${hero.slug}`}
                        className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                    >
                        <div className="flex-shrink-0 relative">
                            <CharacterPortrait
                                characterId={hero.id}
                                characterName={heroName}
                                size={80}
                                className="rounded-lg border-2 border-gray-600 bg-gray-900"
                                showIcons
                            />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="font-medium truncate">{heroName}</span>
                            <span className="text-sm">
                                <strong className={badgeStyle.className}>{badgeStyle.label}</strong>
                                {collabText}
                            </span>
                            <span className="text-xs text-gray-400">
                                Released: {formatDate(hero.releaseDate, dateLocale)}
                            </span>
                            {rerunText && (
                                <span className="text-xs text-gray-400">{rerunText}</span>
                            )}
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
