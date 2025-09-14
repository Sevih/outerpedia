import bossData from '@/data/boss.json'

export type GuideBoss = {
    name: string
    id: string
    links: string[]
}



const IRREGULAR_GUIDE_MAP: Record<string, GuideBoss[]> = {
    "Gorgon's Vanity": [
        { name: 'Irregular Queen', id: '4089001', links: ['pursuit-queen'] },
        { name: 'Mutated Wyvre', id: '4014003', links: ['pursuit-mutated-wyvre'] }
    ],
    "Gorgon's Wrath": [
        { name: 'Irregular Queen', id: '4089001', links: ['pursuit-queen'] },
        { name: 'Mutated Wyvre', id: '4014003', links: ['pursuit-mutated-wyvre'] }
    ],
    "Briareos's Ambition": [
        { name: 'Iron Stretcher', id: '4013071', links: ['pursuit-iron-stretcher'] },
        { name: 'Blockbuster', id: '4013072', links: ['pursuit-blockbuster'] }
    ],
    "Briareos's Recklessness": [
        { name: 'Iron Stretcher', id: '4013071', links: ['pursuit-iron-stretcher'] },
        { name: 'Blockbuster', id: '4013072', links: ['pursuit-blockbuster'] }
    ]
}



// Type brut des données boss.json
type BossGroup = Record<string, { id: string; guide?: string }[]>
type BossSection = Record<string, BossGroup[]> // ← ici le tableau est pris en compte
type BossData = BossSection[]
// Ce que tu construis
export type BossEntry = {
  id: string
  guide?: string
  category: string
}

const bossLookup: Record<string, BossEntry> = (() => {
  const flat: Record<string, BossEntry> = {}

  for (const section of bossData as BossData) {
    for (const [category, groups] of Object.entries(section)) {
      for (const group of groups) {
        for (const [bossName, bossArray] of Object.entries(group)) {
          const info = bossArray[0]
          flat[bossName] = { id: info.id, guide: info.guide, category }
        }
      }
    }
  }

  return flat
})()

export function resolveItemSource({
    itemname,
    source,
    boss
}: {
    itemname: string
    source?: string
    boss?: string
}): { trueSource?: string; trueBosses: GuideBoss[] } {
    // Irregular Extermination
    if (source === 'Irregular Extermination') {
        const entry = Object.entries(IRREGULAR_GUIDE_MAP).find(([prefix]) =>
            itemname.startsWith(prefix)
        )
        if (entry) return { trueSource: source, trueBosses: entry[1] }
        return { trueSource: source, trueBosses: [] }
    }

    // Skippable categories
    if (source === 'Adventure License') {
        return {
            trueSource: 'Adventure License Shop',
            trueBosses: [
                {
                    name: 'Adventure License',
                    id: 'CM_ETC_Shop',
                    links: ['1']
                }
            ]
        }
    }


    if (source === 'Event Shop') {
        return {
            trueSource: 'Event Shop',
            trueBosses: [
                {
                    name: 'Reward bought from a particular event shop',
                    id: 'CM_Shop_Shortcuts_EventShop',
                    links: ['']
                }
            ]
        }
    }

    // Special Request
    if (source === 'Special Request') {
        const bossEntry = boss ? bossLookup[boss] : undefined
        if (bossEntry?.guide) {
            return {
                trueSource: source,
                trueBosses: [{ name: boss!, id: bossEntry.id, links: [bossEntry.guide!] }]
            }
        }
    }

    // Default fallback
    return { trueSource: source, trueBosses: [] }
}
