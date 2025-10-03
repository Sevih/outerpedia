'use client'

import GuideHeading from '@/app/components/GuideHeading'

type Entry = {
    mode: string
    unlock: string   // ex: "S5-12-3 : Puppet"
    desc: string
}

// ==== tes données ici ====
// tu pourras changer le format à la main, ça marchera tant que ça commence par "Sx-y-z"
const DATA: Entry[] = [
    { mode: 'Joint Challenge', unlock: 'S1-8-5 : Puppet', desc: 'Co-op mode across the server' },
    { mode: 'Guild', unlock: 'S1-1-8 : Prisoners', desc: 'Join or create a guild' },
    { mode: 'Base', unlock: 'S1-3-1 : Gathering Supplies', desc: 'Craft, Ether generator, Shop, Synchro Room, Expedition, Quirk' },
    { mode: 'Event Dungeon', unlock: 'S1-3-5 : Finding Blacksmith', desc: 'Allows entry to event dungeons' },
    { mode: "The Archdemon's Ruins: The Deeps", unlock: 'S1-5-1 : Onwards to Magnolia', desc: 'Various one-time rewards' },
    { mode: 'Talisman', unlock: 'S1-5-1 : Onwards to Magnolia', desc: 'Unlock the talisman equipment slot' },
    { mode: 'Skyward Tower', unlock: 'S1-3-13 : Her Name is Alpha', desc: 'Monthly reset tower with rewards + obtain Sigma' },
    { mode: 'Challenge! Special Request: Ecology Study', unlock: 'S1-5-5 : A Temporary Truce', desc: 'Main place to farm armor sets' },
    { mode: 'Challenge! Special Request: Identification', unlock: 'S1-5-5 : A Temporary Truce', desc: 'Main place to farm weapons and accessories' },
    { mode: 'Arena', unlock: "S1-4-6 : The Commander’s Sophistry", desc: 'PvP mode against AI defense team' },
    { mode: "The Archdemon's Ruins: The Infinite Corridor", unlock: 'S1-6-12 : Laplace Magnolia', desc: 'Rewards every 3 days (cooldown)' },
    { mode: 'Defeat the Doppelgänger', unlock: 'S1-6-5 : Pass', desc: 'Obtain hero pieces to transcend heroes' },
    { mode: 'World Boss', unlock: "S1-10-14 : An Automaton’s Wish", desc: 'Battle with 8 heroes and rank against other players' },
    { mode: 'Synchro Room', unlock: 'S1-7-5 : An Unjust Fight', desc: 'Enhance level and skills of chosen heroes' },
    { mode: 'Elemental Tower', unlock: 'S1-7-5 : An Unjust Fight', desc: 'Element-specific challenge towers with upgrade materials' },
    { mode: 'Terminus Isle', unlock: 'S1-9-5 : The Responsibility of the Guilty', desc: 'Obtain Quirk and Precise Craft resources' },
    { mode: 'Precise Craft', unlock: 'S1-9-5 : The Responsibility of the Guilty', desc: 'Craft specific gear pieces' },
    { mode: 'Quirk', unlock: 'S1-9-5 : The Responsibility of the Guilty', desc: 'Account-wide bonuses (hero stats, stamina, drop rate, etc.)' },
    { mode: 'Irregular Extermination', unlock: 'S2-10-15 : Unchanging', desc: "Various rewards and exclusive weapons and accessories" }
]


// === helper de tri ===
function parseStage(unlock: string) {
    // match "Sx-y-z" au début
    const match = unlock.match(/^S(\d+)-(\d+)-(\d+)/)
    if (!match) return [999, 999, 999] // si pas de match → tout à la fin
    return match.slice(1).map(v => parseInt(v, 10)) // [X, Y, Z]
}

const sortedData = [...DATA].sort((a, b) => {
    const [ax, ay, az] = parseStage(a.unlock)
    const [bx, by, bz] = parseStage(b.unlock)
    if (ax !== bx) return ax - bx
    if (ay !== by) return ay - by
    return az - bz
})

// === composant tableau ===
function SectionTable({
    head,
    rows,
}: {
    head: string[]
    rows: (string | number)[][]
}) {
    return (
        <div className="flex justify-center">
            <div className="w-full max-w-4xl">
                <table className="w-auto mx-auto border border-gray-700 rounded-md text-sm text-center">
                    <thead className="bg-gray-800">
                        <tr>
                            {head.map((h, i) => (
                                <th key={i} className="border px-3 py-2">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r, i) => (
                            <tr key={i}>
                                {r.map((c, j) => (
                                    <td key={j} className={`border px-3 py-2 ${j === 0 ? 'text-left' : ''}`}>{c}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default function UnlockContentGuide() {
    const rows = sortedData.map(e => [e.mode, e.unlock, e.desc])

    return (
        <div className="space-y-6">
            <GuideHeading>Content Unlock Guide</GuideHeading>
            <p className="text-sm text-gray-300 leading-relaxed text-center">
                Many features in <b>OUTERPLANE</b> are not available right away.
                Here is a quick overview of when each mode unlocks during the story.
            </p>

            <SectionTable
                head={['Mode', 'Unlock Condition', 'Description']}
                rows={rows}
            />
        </div>
    )
}
