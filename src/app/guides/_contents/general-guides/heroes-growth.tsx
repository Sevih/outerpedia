import GuideHeading from '@/app/components/GuideHeading'
import GuideIconInline from '@/app/components/GuideIconInline';
import ItemInlineDisplay from '@/app/components/ItemInline';
import StarLevel from '@/app/components/StarLevel';
import Link from 'next/link';

const costs = {
    1: {
        "lv 2": { green: 3 },
        "lv 3": { green: 3, blue: 1 },
        "lv 4": { green: 5, blue: 2 },
        "lv 5": { green: 0, blue: 4, red: 1 },
    },
    2: {
        "lv 2": { green: 3 },
        "lv 3": { green: 4, blue: 1 },
        "lv 4": { green: 5, blue: 3 },
        "lv 5": { green: 0, blue: 5, red: 1 },
    },
    3: {
        "lv 2": { green: 5 },
        "lv 3": { green: 5, blue: 3 },
        "lv 4": { green: 0, blue: 4, red: 1 },
        "lv 5": { green: 0, blue: 5, red: 2 },
    },
} as const;

const skillLevels = ["lv 2", "lv 3", "lv 4", "lv 5"] as const;

export default function HeroGrowthGuide() {
    return (
        <div className="space-y-6">
            <p>
                There are several ways to strengthen your heroes: leveling, upgrading, transcending, gear, etc.
                This guide covers each method in detail.
            </p>

            <GuideHeading level={3}>Leveling</GuideHeading>
            <p>
                Heroes gain experience by participating in battles or by consuming XP items. Most content grants XP, but not all (e.g., Bounty Hunter).
                The Bandit Chase challenge mode rewards you with consumable XP food:
            </p>
            <p>
                You can use various items to give XP.
            </p>

            <ul>
                <li><ItemInlineDisplay names="Sandwich" /> grants 250 XP</li>
                <li><ItemInlineDisplay names="Cake Slice" /> grants 600 XP</li>
                <li><ItemInlineDisplay names="Prosciutto" /> grants 2500 XP</li>
                <li><ItemInlineDisplay names="Steak Dish" /> grants 8000 XP</li>
            </ul>
            <p>
                The <ItemInlineDisplay names="Unlimited Restaurant Voucher" /> instantly sets a hero to level 100 (event/cash shop only).
            </p>

            <GuideHeading level={3} >Upgrade</GuideHeading>
            <p>
                Once a hero reaches specific levels, you can upgrade their base stats permanently in <strong>Hero → Upgrade</strong>.
                <br />The upgraded stats are fixed and depend on the hero&apos;s class and runes are mainly obtained via the <strong>Upgrade Stone Retrieval</strong> challenge.
                <br />The requirements per stage (element vary depending of hero&apos; one) is :
            </p>
            <table className="table-auto text-sm text-white">
                <tbody>
                    {[
                        ['CM_Evolution_00', 'Stage 1 (Lv. 1)', '', 'Starting stage'],
                        ['CM_Evolution_01', 'Stage 2 (Lv. 20)', '30', 'Light Upgrade Stone Fragment'],
                        ['CM_Evolution_02', 'Stage 3 (Lv. 40)', '35', 'Light Upgrade Stone Piece'],
                        ['CM_Evolution_03', 'Stage 4 (Lv. 60)', '40', 'Light Upgrade Stone'],
                        ['CM_Evolution_04', 'Stage 5 (Lv. 80)', '50', 'Refined Light Upgrade Stone'],
                        ['CM_Evolution_05', 'Stage 6 (Lv. 100)', '200', 'Refined Light Upgrade Stone'],
                    ].map(([icon, stage, cost, item], idx) => (
                        <tr key={idx} className="align-middle">
                            <td className="pr-2 whitespace-nowrap">
                                <GuideIconInline name={icon} text={stage} />
                            </td>
                            <td className="px-2">
                                <GuideIconInline name="Right_Arrow" text="" />
                            </td>
                            <td className="pr-1 text-right">{cost}</td>
                            <td>
                                {cost ? <ItemInlineDisplay names={item} /> : item}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <p>
                The <ItemInlineDisplay names="Book of Evolution" /> instantly upgrades a hero to Stage 6 (event/cash shop only).
            </p>

            <GuideHeading level={3}>Transcendence</GuideHeading>
            <p>
                Transcending improves heroes using hero pieces instead of stones. You can earn these through pulling duplicates, the <strong>Doppelgänger</strong> challenge, hero shop, or events.
                <br />Note: Demiurge and Limited units cannot be farmed via Doppelgänger and their may have different bonuses, often including unique passives instead of stat buffs (e.g., DDrak reduces AoE damage) and don&apos;t follow the generic transcendence effects.
            </p>
            <p>
                Generic transcendence effects (each step include a base Stat Atk, Def, HP bonus):
            </p>
            <table className="table-auto text-sm text-white border-separate border-spacing-y-2">
                <tbody>
                    {[
                        { icon: '1', unlock: '' },
                        { icon: '2', unlock: '' },
                        { icon: '3', unlock: 'Burst 2 Unlocked' },
                        {
                            icon: '4',
                            unlock: (
                                <>
                                    <StarLevel levelLabel="1" size={14} /> and <StarLevel levelLabel="2" size={14} /> gain self-stat while <StarLevel levelLabel="3" size={14} /> a team-stat
                                    <br /> All gain +1 Chain Passive Weakness Gauge Damage
                                </>
                            )
                        },
                        { icon: '4+', unlock: '' },
                        { icon: '5', unlock: 'Burst 3 Unlocked' },
                        { icon: '5+', unlock: '' },
                        { icon: '5++', unlock: '' },
                        {
                            icon: '6', unlock: (
                                <>
                                    <StarLevel levelLabel="1" size={14} />and <StarLevel levelLabel="2" size={14} /> gain self-stat improvement
                                    <br /> <StarLevel levelLabel="3" size={14} /> gains team-stat improvement
                                    <br /> All gain +25 Action Points at battle start
                                </>
                            )
                        },
                    ].map(({ icon, unlock }, idx) => (
                        <tr key={idx} className="mb-2">
                            <td className="pr-2 whitespace-nowra text-right">
                                <StarLevel levelLabel={icon} />
                            </td>
                            <td className="px-2">
                                <GuideIconInline name="Right_Arrow" text="" size={20} />
                            </td>
                            <td className="text-left align-middle">{unlock ? unlock : <p className="text-neutral-400 text-sm italic">nothing</p>}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <p className="text-neutral-400 text-sm italic mb-4">
                Note: you need 1 dupe to proceed each step. So with a <StarLevel levelLabel="3" size={12} /> base you need 1 + 6 copy to reach for <StarLevel levelLabel="6" size={12} />.
            </p>

            <GuideHeading level={3} >Trust (Friendship)</GuideHeading>
            <p>
                Increasing a hero&apos;s trust level unlocks their Exclusive Equipment at level 10.<br />
                You can give them any gift, but each heroes gots his preferred ones (you can check gift preference in <strong>Hero → Trust Level</strong> top-left box).<br />
                You can also give them Upgrade Stones matching their element. 170 000 total trust points are needed for level 10.
            </p>
            <ul>
                <li><ItemInlineDisplay names='Light Upgrade Stone Fragment' /> +5 </li>
                <li><ItemInlineDisplay names='Light Upgrade Stone Piece' /> +10 </li>
                <li><ItemInlineDisplay names='Light Upgrade Stone' /> +25 </li>
                <li><ItemInlineDisplay names='Refined Light Upgrade Stone' /> +50 </li>
                <li><ItemInlineDisplay names='USB Drive' text={false} /><ItemInlineDisplay names="Collector's Coin" text={false} /><ItemInlineDisplay names='Mana Potion' text={false} /><ItemInlineDisplay names='Paper Crane' text={false} /><ItemInlineDisplay names='Berry' text={false} /> +100 (Bonus: +50)</li>
                <li><ItemInlineDisplay names='Portable Gaming Device' text={false} /><ItemInlineDisplay names='Elegant Teacup' text={false} /><ItemInlineDisplay names='Fay Dust' text={false} /><ItemInlineDisplay names='Crystal Orb' text={false} /><ItemInlineDisplay names='Wildflower' text={false} /> +200 (Bonus: +100)</li>
                <li><ItemInlineDisplay names='Smartphone' text={false} /><ItemInlineDisplay names='Decorative Chest Armor' text={false} /><ItemInlineDisplay names="Witch's Cauldron" text={false} /><ItemInlineDisplay names='Lion Statue' text={false} /><ItemInlineDisplay names="Phantom Bird's Egg" text={false} /> +500 (Bonus: +250)</li>
                <li><ItemInlineDisplay names='Dungeon Core Fragment' text={false} /><ItemInlineDisplay names="Noble's Ceremonial Sword" text={false} /><ItemInlineDisplay names='Magic Textbook' text={false} /><ItemInlineDisplay names='Dreamcatcher' text={false} /><ItemInlineDisplay names='Leaf of World Tree' text={false} /> +1 000 (Bonus: +500)</li>
            </ul>
            <p>
                The <ItemInlineDisplay names="Oath of Determination" /> maxes trust to level 10 (event/cash shop only).
            </p>

            <GuideHeading level={3} >Skill Upgrade</GuideHeading>
            <p>
                Each hero has 3 basic skills and 1 chain passive. Each can be upgraded 4 times for bonus effects.
                Upgrading is done in <strong>Hero → Skills</strong> using <strong>Skill Books</strong> found in events, shops, and rewards.
            </p>
            <p>
                The cost of skill upgrade depend of the hero base rarity
            </p>
            <table className="table-auto text-sm text-white border-separate border-spacing-y-2">
                <thead>
                    <tr>
                        <th className="text-left pr-4">Upgrade Level</th>
                        <th className="text-center px-2"><StarLevel levelLabel="1" size={14} /></th>
                        <th className="text-center px-2"><StarLevel levelLabel="2" size={14} /></th>
                        <th className="text-center px-2"><StarLevel levelLabel="3" size={14} /></th>
                    </tr>
                </thead>
                <tbody>
                    {skillLevels.map((lv) => (
                        <tr key={lv}>
                            <td className="pr-4 font-medium">Lv{lv.slice(2)}</td>
                            {[1, 2, 3].map((rarity) => {
                                const key = rarity as keyof typeof costs;
                                const data = costs[key]?.[lv];
                                return (
                                    <td key={rarity} className="text-center px-2">
                                        {data &&
                                            Object.entries(data)
                                                .filter(([, amount]) => amount > 0)
                                                .map(([color, amount]) => {
                                                    const itemName =
                                                        color === "green"
                                                            ? "Basic Skill Manual"
                                                            : color === "blue"
                                                                ? "Intermediate Skill Manual"
                                                                : "Professional Skill Manual";
                                                    return (
                                                        <span key={color} className="inline-block mr-1">
                                                            <ItemInlineDisplay names={itemName} text={false} /> x{amount}
                                                        </span>
                                                    );
                                                })}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>


            <GuideHeading level={3}>Special Equipment</GuideHeading>
            <p>
                Found under <strong>Hero → Special Gear</strong>. There are two types: <strong>Exclusive Equipment (EE)</strong> and <strong>Talismans</strong>.
            </p>
            <p>
                <strong>EE</strong> is unlocked via Trust and grants a passive stat, a condition-based AP gain, a passive skill, and gem slots.
                It can be enhanced with:
            </p>
            <ul>
                <li><ItemInlineDisplay names="Blue Memory Stone" /> from Lv. 0 to 5 (150 needed)</li>
                <li><ItemInlineDisplay names="Purple Memory Stone" /> from Lv. 5 to 10 (150 needed)</li>
            </ul>
            <p>
                Level 5 unlocks an extra gem slot, Level 10 unlocks (or upgrades) the passive.
            </p>
            <p>
                <strong>Talismans</strong> grant a team-wide aura stat boos, CP/AP regen effects, and gem slots.
                They&apos;re upgraded with Stardust (blue/purple), and follow the same gem/passive thresholds as EE.</p>
            <ul>
                <li><ItemInlineDisplay names="Blue Stardust" /> from Lv. 0 to 5 (150 needed)</li>
                <li><ItemInlineDisplay names="Purple Stardust" /> from Lv. 5 to 10 (150 needed)</li>
            </ul>
            <p>
                Only the highest aura effect applies if duplicates exist (e.g., two crit dmg boosts = only the higher one applies).
            </p>
            <p>Those materials are mainly obtained via Irregular Extermination and events.</p>


            <GuideHeading level={3}>Gems</GuideHeading>
            <p>
                Gems are special jewels that can be socketed into <strong>Exclusive Equipment</strong> or <strong>Talismans</strong>. Their primary purpose is to compensate for a hero&apos;s missing stats.
            </p>
            <p>
                For example, if a DPS unit is lacking <strong>Crit Chance</strong>, equipping a Crit Chance gem can help reach key thresholds. Gem choices should always align with substat priorities and the character&apos;s role.
            </p>



            <GuideHeading level={3}>Gear</GuideHeading>
            <p>
  For detailed information, refer to the{' '}
  <Link href="/guides/general-guides/gear" className="underline text-blue-400 hover:text-blue-300">
    Equipment Guide
  </Link>
  . In short:
</p>
            <ul>
                <li>Gear comes in 4 rarities and can be upgraded up to +10</li>
                <li>Legendary  Weapons and Amulets have class restrictions (e.g., only usable by Mages)</li>
                <li>Armors provide set bonuses when equipped together</li>
                <li>Gear can be reforged to add substats (up to 4 total) or enhance existing ones if already at 4</li>
                <li>Breakthrough increases main stats and enhance passives</li>
                <li>Main stats cannot be rerolled</li>
                <li>Substats can be rerolled using Stat Change options</li>
            </ul>

        </div>
    )
}
