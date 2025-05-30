import GuideHeading from '@/app/components/GuideHeading'
import ItemInlineDisplay from '@/app/components/ItemInline';
import EquipmentIntro from '@/app/components/EquipmentIntro';
import EquipmentCardInline from '@/app/components/EquipmentCard';
import StatInlineTag from '@/app/components/StatInlineTag';
import SubstatBar from '@/app/components/SubstatBar';
import SubstatBarWithValue from '@/app/components/SubstatBarWithValue';
import StarLevel from '@/app/components/StarLevel';


export default function BeginnerGuide() {
    return (
        <div>
            <GuideHeading level={3}>Equipment Basics</GuideHeading>
            <p>
                Gear plays a crucial role in a hero&apos;s power. Each hero can equip three different types of gear; Weapon, Accessory, and Armor,  each contributing to their overall stats and performance in battle.
            </p>


            <p>
                Each piece of gear has several properties:
            </p>

            <EquipmentIntro />



            <GuideHeading level={3}>Improving Equipment</GuideHeading>
            <p>
                There are several ways to enhance your gear:
            </p>
            <ul className="list-disc list-inside">
                <li><strong>Enhance</strong> — Increase upgrade level</li>
                <li><strong>Reforge</strong> — Add or enhance substats</li>
                <li><strong>Breakthrough</strong> — Increase gear Tier</li>
                <li><strong>Change Stats</strong> — Reroll substats</li>
            </ul>

            <GuideHeading level={4}>Enhance</GuideHeading>
            <p>
                Available via the <strong>Enhance</strong> menu, using hammers <ItemInlineDisplay names="Apprentice's Hammer" text={false} /><ItemInlineDisplay names="Expert's Hammer" text={false} /><ItemInlineDisplay names="Master's Hammer" text={false} /><ItemInlineDisplay names="Artisan's Hammer" text={false} /> to increase the item&apos;s enhancement level up to +10.
                This improves the <strong>Main Stat only</strong>, based on the item&apos;s rarity and star level.
            </p>
            <p className="text-neutral-400 text-sm italic mb-4">
                Note:  You can convert hammers to a higher rarity in your inventory with a 2:1 ratio. (e.g., 2 <ItemInlineDisplay names="Master's Hammer" /> for 1 <ItemInlineDisplay names="Artisan's Hammer" />)
            </p>
            <p>Example comparisons:</p>
            <div className="flex gap-8">
                {/* Column: Normal (white) */}
                <div className="flex flex-col items-center gap-4">
                    <div className="flex flex-col items-center">
                        <EquipmentCardInline
                            data={{
                                type: 'Weapon',
                                rarity: 'normal',
                                star: 1,
                                reforge: 0,
                                tier: null,
                                level: null,
                                class: null,
                                effect: null
                            }}
                        />
                        <div className="mt-1 flex items-center gap-1">
                            <StatInlineTag name="ATK" color='text-white' />
                            18
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <EquipmentCardInline
                            data={{
                                type: 'Weapon',
                                rarity: 'normal',
                                star: 1,
                                reforge: 0,
                                tier: null,
                                level: 10,
                                class: null,
                                effect: null
                            }}
                        />
                        <div className="mt-1 flex items-center gap-1">
                            <StatInlineTag name="ATK" color='text-white' />
                            90
                        </div>
                    </div>
                </div>

                {/* Column: Epic (blue) */}
                <div className="flex flex-col items-center gap-4">
                    <div className="flex flex-col items-center">
                        <EquipmentCardInline
                            data={{
                                type: 'Weapon',
                                rarity: 'epic',
                                star: 2,
                                reforge: 0,
                                tier: null,
                                level: null,
                                class: null,
                                effect: null
                            }}
                        />
                        <div className="mt-1 flex items-center gap-1">
                            <StatInlineTag name="ATK" color='text-white' />
                            54
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <EquipmentCardInline
                            data={{
                                type: 'Weapon',
                                rarity: 'epic',
                                star: 2,
                                reforge: 0,
                                tier: null,
                                level: 10,
                                class: null,
                                effect: null
                            }}
                        />
                        <div className="mt-1 flex items-center gap-1">
                            <StatInlineTag name="ATK" color='text-white' />
                            270
                        </div>
                    </div>
                </div>

                {/* Column: Legendary (red) */}
                <div className="flex flex-col items-center gap-4">
                    <div className="flex flex-col items-center">
                        <EquipmentCardInline
                            data={{
                                type: 'Weapon',
                                rarity: 'legendary',
                                star: 1,
                                reforge: 0,
                                tier: null,
                                level: null,
                                class: null,
                                effect: null
                            }}
                        />
                        <div className="mt-1 flex items-center gap-1">
                            <StatInlineTag name="ATK" color='text-white' />
                            30
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <EquipmentCardInline
                            data={{
                                type: 'Weapon',
                                rarity: 'legendary',
                                star: 1,
                                reforge: 0,
                                tier: null,
                                level: 10,
                                class: null,
                                effect: null
                            }}
                        />
                        <div className="mt-1 flex items-center gap-1">
                            <StatInlineTag name="ATK" color='text-white' />
                            150
                        </div>
                    </div>
                </div>
            </div>



            <GuideHeading level={4}>Breakthrough</GuideHeading>
            <p>
                Available via the <strong>Breakthrough</strong> tab in the Enhance menu, using glunites <ItemInlineDisplay names="Glunite" text={false} /><ItemInlineDisplay names="Refined Glunite" text={false} /><ItemInlineDisplay names="Event Glunite" text={false} /><ItemInlineDisplay names="Armor Glunite" text={false} /> to increase the item’s tier up to T4. This improves the main stat and item&apos;s effect.
            </p>
            <p className="text-neutral-400 text-sm italic mb-4">
                Note: You can use a duplicate item instead of Glunite (it must be the same rarity, same effect, and same slot).
            </p>
            <p>Example comparisons:</p>
            <div className="flex gap-8">
                {/* Column: Normal (white) */}
                <div className="flex flex-col items-center gap-4">
                    <div className="flex flex-col items-center">Surefire Javelin <EquipmentCardInline data={{
                        type: 'Weapon',
                        rarity: 'legendary',
                        star: 6,
                        reforge: 0,
                        tier: null,
                        level: null,
                        class: 'striker',
                        effect: 11
                    }}
                    />
                        <div className="mt-1 flex flex-col items-center gap-1 text-center">
                            <div className="flex items-center gap-1">
                                <StatInlineTag name="ATK" color='text-white' />
                                200
                            </div>
                            <p>
                                Effect: 1% of targets&apos;s Max HP
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <EquipmentCardInline
                            data={{
                                type: 'Weapon',
                                rarity: 'legendary',
                                star: 6,
                                reforge: 0,
                                tier: 4,
                                level: null,
                                class: 'striker',
                                effect: 11
                            }}
                        />
                        <div className="mt-1 flex flex-col items-center gap-1 text-center">
                            <div className="flex items-center gap-1">
                                <StatInlineTag name="ATK" color='text-white' />
                                240
                            </div>
                            <p>
                                Effect: 2% of target&apos;s Max HP
                            </p>
                        </div>
                    </div>
                </div>

                {/* Column: Epic (blue) */}
                <div className="flex flex-col items-center gap-4">
                    <div className="flex flex-col items-center">
                        Immunity Set
                        <EquipmentCardInline
                            data={{
                                type: 'Armor',
                                rarity: 'legendary',
                                star: 6,
                                reforge: 0,
                                tier: null,
                                level: null,
                                class: null,
                                effect: 19
                            }}
                        />
                        <div className="mt-1 flex flex-col items-center gap-1 text-center">
                            <div className="flex items-center gap-1">
                                2p bonus : Immunity 1 turn at start
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <EquipmentCardInline data={{
                            type: 'Armor',
                            rarity: 'legendary',
                            star: 6,
                            reforge: 0,
                            tier: 4,
                            level: null,
                            class: null,
                            effect: 19
                        }}
                        />
                        <div className="mt-1 flex flex-col items-center gap-1 text-center">
                            <div className="flex items-center gap-1">
                                2p bonus : Immunity 1 turn at start
                            </div>
                            <p>
                                4p bonus : -30% damage taken
                            </p>
                        </div>
                    </div>
                </div>

                {/* Column: Legendary (red) */}
                <div className="flex flex-col items-center gap-4">
                    <div className="flex flex-col items-center">
                        Penetration Set
                        <EquipmentCardInline
                            data={{
                                type: 'Armor',
                                rarity: 'legendary',
                                star: 6,
                                reforge: 0,
                                tier: null,
                                level: null,
                                class: null,
                                effect: 11
                            }}
                        />
                        <div className="mt-1 flex flex-col items-center gap-1 text-center">
                            <div className="flex items-center gap-1">
                                4p bonus : <StatInlineTag name="PEN" color='text-white' /> +20%
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <EquipmentCardInline
                            data={{
                                type: 'Armor',
                                rarity: 'legendary',
                                star: 6,
                                reforge: 0,
                                tier: 4,
                                level: null,
                                class: null,
                                effect: 11
                            }}
                        />
                        <div className="mt-1 flex flex-col items-center gap-1 text-center">
                            <div className="flex items-center gap-1">
                                2p bonus : <StatInlineTag name="PEN" color='text-white' /> +8%
                            </div>
                            <p>
                                4p bonus : <StatInlineTag name="PEN" color='text-white' /> +12%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <GuideHeading level={4}>Quick note about Substats</GuideHeading>
            <p>
                Each stat can only appear once per item, regardless of whether it is a main stat or a substat (e.g: you cannot roll a speed substat on a speed mainstat Accessory).
            </p>
            <p>
                Substat values are represented as a bar with 6 segments using the following color code:
            </p>
            <SubstatBar yellow={2} orange={3} />
            <ul className="list-disc list-inside">
                <li>Gray — Inactive</li>
                <li>Yellow — Active</li>
                <li>Orange — Active (gained through reforge)</li>
            </ul>

            <p className='mt-4 mb-4'>
                The maximum number of yellow segments per substat is 3, except for some items in the event shop where you may see 4. Rico Shop items may also grant 4 on a single substat.
                <br />
                A &quot;perfect&quot; gear example (excluding shop) might look like:
            </p>
            <ul className="space-y-2">
                <li><SubstatBarWithValue stat="ATK%" yellow={3} orange={0} /></li>
                <li><SubstatBarWithValue stat="CHC" yellow={3} orange={0} /></li>
                <li><SubstatBarWithValue stat="CHD" yellow={3} orange={0} /></li>
                <li><SubstatBarWithValue stat="SPD" yellow={3} orange={0} /></li>
            </ul>


            <GuideHeading level={4}>Reforge</GuideHeading>
             <p>
                Available via the <strong>Reforge</strong> tab in the Enhance menu. Reforging is done by using catalysts <ItemInlineDisplay names="Normal Reforge Catalyst" text={false} /><ItemInlineDisplay names="Superior Reforge Catalyst" text={false} /><ItemInlineDisplay names="Epic Reforge Catalyst" text={false} /><ItemInlineDisplay names="Legendary Reforge Catalyst" text={false} />. <br />
                </p>
                <p className="text-neutral-400 text-sm italic mb-4">
                Note: Like hammers, you can convert catalyst to the upper rarity in your inventory with a 6:1 (e.g : 6 <ItemInlineDisplay names="Normal Reforge Catalyst" /> for 1 <ItemInlineDisplay names="Superior Reforge Catalyst" />)
            </p>
                <p className="text-neutral-400 text-sm italic mb-4">
                Note: You can reforge an item up to its star level (one time for <StarLevel levelLabel="1" size={14} /> gear and up to six times for <StarLevel levelLabel="6" size={14} />gear)
            </p>
            <p>
                Here’s how reforging works:
                </p>
            <ul className="list-disc list-inside">
                <li>If the item has less than 4 substats, it will add one (up to 4)</li>
                <li>If the item has 4 substats, it will enhance one (adds an orange segment) up to a maximum of 6 active segments</li>
            </ul>


            <GuideHeading level={4}>Change Stats</GuideHeading>
            <p>
                Available via the <strong>Change Stat</strong> menu. There are two modes available:
            </p>
            <ul className="list-disc list-inside">
                <li><strong>Change All</strong> <br /> Rerolls all substats and yellow segments. Orange segments remain fixed. Use one <ItemInlineDisplay names="Transistone (Total)" /> per reroll</li>
                <li><strong>Select & Change</strong> <br /> Allows rerolling one specific substat. Once selected, the stat is locked in. Yellow segment count will change, but orange ones remain. Use one <ItemInlineDisplay names="Transistone (Individual)" /></li>
            </ul>

            <p className="text-neutral-400 text-sm italic mb-4">
                Tip: Avoid rerolling stats using <ItemInlineDisplay names="Transistone (Individual)" /> if the substat already has 4 or more orange segments. Since orange segments are fixed, the reroll range drops from 1–3 to 1–2 yellow segments.
            </p>

        </div>
    );
}

