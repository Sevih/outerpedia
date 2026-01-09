import Link from 'next/link'
import { CharacterPortrait } from '@/app/components/CharacterPortrait'
import { l } from '@/lib/localize'
import { toKebabCase } from '@/utils/formatText'
import allCharacters from '@/data/_allCharacters.json'
import { freeHeroesSources, customBannerPicks } from './recommendedCharacters'
import type { TenantKey } from '@/tenants/config'

export type CharData = { char: typeof allCharacters[0], localizedName: string, slug: string }

// Set of free hero names for quick lookup
export const freeHeroNames = new Set(
    freeHeroesSources.flatMap(source =>
        source.entries.flatMap(entry =>
            Array.isArray(entry.names) ? entry.names : [entry.names]
        )
    )
)

// Set of custom banner hero names
export const customBannerNames = new Set(
    customBannerPicks.flatMap(entry =>
        Array.isArray(entry.names) ? entry.names : [entry.names]
    )
)

// Flattened entries for free heroes table
export const flattenedFreeHeroesEntries = freeHeroesSources.flatMap(source =>
    source.entries.map(entry => ({
        source: source.source,
        names: Array.isArray(entry.names) ? entry.names : [entry.names],
        reason: entry.reason
    }))
)

// Get heroes not yet in custom banner (too recent)
export function getNotInCustomBannerChars(lang: TenantKey): CharData[] {
    const eligibleChars = allCharacters
        .filter(c => c.Rarity === 3)
        .filter(c => !c.limited)
        .filter(c => !c.tags?.includes('collab'))
        .filter(c => !c.tags?.includes('premium'))
        .filter(c => !c.Fullname.startsWith('Core Fusion'))
        .filter(c => !customBannerNames.has(c.Fullname))
        .filter(c => !freeHeroNames.has(c.Fullname))
        .map(c => c.Fullname)
    return mapNamesToChars(eligibleChars, lang)
}

// Helper to render text with \n as <br />
export function renderWithLineBreaks(text: string): React.ReactNode {
    const parts = text.split('\n')
    if (parts.length === 1) return text
    return parts.map((part, i) => (
        <span key={i}>
            {part}
            {i < parts.length - 1 && <br />}
        </span>
    ))
}

// Helper to map character names to display data
export function mapNamesToChars(names: string[], lang: TenantKey): CharData[] {
    return names
        .map(name => {
            const char = allCharacters.find(c => c.Fullname === name)
            if (!char) return null
            return {
                char,
                localizedName: l(char, 'Fullname', lang),
                slug: toKebabCase(char.Fullname)
            }
        })
        .filter(Boolean) as CharData[]
}

// Reusable grid of character portraits
const GRID_COLS: Record<number, string> = {
    3: 'grid-cols-3',
    4: 'grid-cols-4',
}

export function CharacterGrid({ characters, cols = 3 }: { characters: CharData[], cols?: number }) {
    return (
        <div className={`grid ${GRID_COLS[cols] || 'grid-cols-3'} gap-1 w-fit`}>
            {characters.map(({ char, localizedName, slug }) => (
                <Link
                    key={char.ID}
                    href={`/characters/${slug}`}
                    className="relative hover:z-10 transition-transform hover:scale-105"
                    title={localizedName}
                >
                    <div className="relative w-[70px] h-[70px] sm:w-[80px] sm:h-[80px]">
                        <CharacterPortrait
                            characterId={char.ID}
                            characterName={localizedName}
                            size={80}
                            className="rounded-lg border-2 border-gray-600 bg-gray-900"
                            showIcons
                            showStars
                        />
                    </div>
                </Link>
            ))}
        </div>
    )
}
