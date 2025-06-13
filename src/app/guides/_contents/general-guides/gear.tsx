import GuideHeading from '@/app/components/GuideHeading'
import ItemInlineDisplay from '@/app/components/ItemInline';
import EquipmentIntro from '@/app/components/EquipmentIntro';
import EquipmentCardInline from '@/app/components/EquipmentCard';
import StatInlineTag from '@/app/components/StatInlineTag';
import SubstatBar from '@/app/components/SubstatBar';
import SubstatBarWithValue from '@/app/components/SubstatBarWithValue';
import StarLevel from '@/app/components/StarLevel';
import Accordion from '@/app/components/ui/Accordion';
import GuideIconInline from '@/app/components/GuideIconInline';

const gearUpgradeFaq = [
  {
    key: '6v5-comparison',
    title: 'Is 6-star gear always better than 5-star legendary gear?',
    content: (
      <>
        <p>
          In general, all 6-star gear is better than 5-star legendary (red) gear. The only 5-star gear worth keeping are those from event shops with unique passives (you can view them by going to the equipment page and selecting 5 stars on weapons and accessories).
        </p>
        <p className="mt-2">
          6-star blue armor is viable for end-game content and is easier to upgrade.
        </p>
        <p className="mt-2">
          Grey/Green 6-star armor should only be used temporarily until you get better blue or red gear.
        </p>
      </>
    ),
  },
  {
    key: 'red-gear-weapons',
    title: 'Should I aim for red gear on weapons and accessories?',
    content: (
      <p>
        Yes. For weapons and accessories, red gear is preferred due to the additional effects.
      </p>
    ),
  },
  {
    key: 'how-to-get-6star',
    title: 'What are the main ways to get 6-star gear?',
    content: (
      <>
        <p>Here are your 4 main options:</p>
        <ol className="list-decimal list-inside ml-4 space-y-1">
          <li>
            <strong>Farm gear bosses and story hard stages</strong> starting from <strong>Season 3, 5-10</strong>. Prioritize farming armor, as weapons and accessories involve heavy RNG.
          </li>
          <li>
            <strong>Craft armor at Kate’s shop</strong> during crafting discount weeks (1 week/month). Use <ItemInlineDisplay names="Potentium (Armor)" /> to select your desired armor set. Avoid crafting weapons/accessories due to RNG.
          </li>
          <li>
            <strong>Use Precise Craft</strong> for weapons/accessories. This uses <ItemInlineDisplay names="Effectium" />and allows sub-stat rerolling, helping you save <ItemInlineDisplay names="Transistone (Individual)" />.
          </li>
          <li>
            <strong>Farm Irregular Bosses</strong>. Queen and Wyvre drop one gear set, while the other two bosses drop a different set. Check drop tables to farm the right bosses for your build.
          </li>
        </ol>
      </>
    ),
  },
  {
    key: 'drop-boost-titles',
    title: 'How can I increase gear drop rates?',
    content: (
      <p>
        Use <strong>Monad Gate titles</strong> that increase drop rates from Special Request stages. Some titles, like <GuideIconInline name="EBT_WORLD_BOSS_TITLE" text="Worldline Explorer" /><strong></strong>, can boost drop rates by up to 30%, helping reduce RNG frustration.
      </p>
    ),
  },
  {
    key: 'bad-main-stat',
    title: 'What if I get a good weapon/accessory with a bad main stat?',
    content: (
      <p>
        Save it as <strong>transcend fodder</strong>. When you get a better version with the right main stat, you can use it to breakthrough that gear.
      </p>
    ),
  },
  {
    key: 'bad-substats-red-armor',
    title: 'What to do with red armor that has bad sub-stats?',
    content: (
      <p>
        If you don’t want to use <ItemInlineDisplay names="Transistone (Total)" />, keep it as transcend fodder. If you do have enough total Transistones, reroll until you get 3 good sub-stats, then use a <ItemInlineDisplay names="Transistone (Individual)" /> to fix the last one.
      </p>
    ),
  },
  {
    key: 'transistone-usage',
    title: 'When should I use Transistones?',
    content: (
      <p>
        Use Transistones primarily on <strong>Irregular gear</strong>, then <strong>red armor</strong>. Do not use them on any other non-red gear.
      </p>
    ),
  },
  {
    key: 'limited-shop-worth',
    title: 'Are limited-time shops worth it?',
    content: (
      <p>
        Yes. <strong>Limited shops</strong> (appearing a few times a year) often include <ItemInlineDisplay names="Ether" /> sold against Ether and should be prioritized. These items can save you months or years of grinding.
      </p>
    ),
  },
  {
    key: 'event-selection-chests',
    title: 'What about gear selection chests from events?',
    content: (
      <p>
        They often include <strong>weapon, accessory, and armor chests</strong>. Check if the <strong>main stat</strong> is fixed or random. Sub-stats are usually random unless stated otherwise.
      </p>
    ),
  },
]




export default function BeginnerGuide() {
  return (
    <div>
      <GuideHeading level={3}>Gear Basics</GuideHeading>
      <p>
        Gear plays a crucial role in a hero&apos;s power. Each hero can equip three different types of gear; Weapon, Accessory, and Armor,  each contributing to their overall stats and performance in battle.
      </p>


      <p>
        Each piece of gear has several properties:
      </p>

      <EquipmentIntro />

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
        The maximum number of yellow segments per substat is 3, except for some items in the event shop where you may see 4. Rico&apos;s Secret Shop can grant 4 bars on a single substat, but this requires the shop to be max level (and even then, the chance is rare).
        <br />
        A &quot;perfect&quot; gear example (excluding shop) might look like:
      </p>
      <ul className="space-y-2">
        <li><SubstatBarWithValue stat="ATK%" yellow={3} orange={0} /></li>
        <li><SubstatBarWithValue stat="CHC" yellow={3} orange={0} /></li>
        <li><SubstatBarWithValue stat="CHD" yellow={3} orange={0} /></li>
        <li><SubstatBarWithValue stat="SPD" yellow={3} orange={0} /></li>
      </ul>







      <GuideHeading level={3}>Improving Gear</GuideHeading>
      <p>
        There are several ways to enhance your gear:
      </p>
      <ul className="list-disc list-inside">
        <li><strong>Enhance</strong> — Increase enhancement level</li>
        <li><strong>Reforge</strong> — Add or enhance substats</li>
        <li><strong>Breakthrough</strong> — Increase gear breakthrough</li>
        <li><strong>Change Stats</strong> — Reroll substats</li>
      </ul>

      <GuideHeading level={4}>Enhance</GuideHeading>
      <p>
        Available via the <strong>Enhance</strong> menu, using hammers <ItemInlineDisplay names="Apprentice's Hammer" text={false} /><ItemInlineDisplay names="Expert's Hammer" text={false} /><ItemInlineDisplay names="Master's Hammer" text={false} /><ItemInlineDisplay names="Artisan's Hammer" text={false} /> to increase the item&apos;s enhancement level up to +10.
        This improves the <strong>Main Stat only</strong>, based on the item&apos;s grade and star level.
      </p>
      <p className="text-neutral-400 text-sm italic mb-4">
        Note:  You can convert hammers to a higher grade in your inventory with a 2:1 ratio. (e.g., 2 <ItemInlineDisplay names="Master's Hammer" /> for 1 <ItemInlineDisplay names="Artisan's Hammer" />). Converting hammers is only useful for enhancing Special Gear, there is no benefit to doing that for regular enhancing
      </p>
      <p>Example comparisons:</p>
      <div className="flex flex-wrap justify-center gap-8">
        {/* Column: Normal (white) */}
        <div className="flex flex-col items-center gap-4 w-[160px] sm:w-[180px]">
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
                effect: null,
              }}
            />
            <div className="mt-1 flex items-center gap-1">
              <StatInlineTag name="ATK" color="text-white" />
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
                effect: null,
              }}
            />
            <div className="mt-1 flex items-center gap-1">
              <StatInlineTag name="ATK" color="text-white" />
              90
            </div>
          </div>
        </div>

        {/* Column: Epic (blue) */}
        <div className="flex flex-col items-center gap-4 w-[160px] sm:w-[180px]">
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
                effect: null,
              }}
            />
            <div className="mt-1 flex items-center gap-1">
              <StatInlineTag name="ATK" color="text-white" />
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
                effect: null,
              }}
            />
            <div className="mt-1 flex items-center gap-1">
              <StatInlineTag name="ATK" color="text-white" />
              270
            </div>
          </div>
        </div>

        {/* Column: Legendary (red) */}
        <div className="flex flex-col items-center gap-4 w-[160px] sm:w-[180px]">
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
                effect: null,
              }}
            />
            <div className="mt-1 flex items-center gap-1">
              <StatInlineTag name="ATK" color="text-white" />
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
                effect: null,
              }}
            />
            <div className="mt-1 flex items-center gap-1">
              <StatInlineTag name="ATK" color="text-white" />
              150
            </div>
          </div>
        </div>
      </div>



      <GuideHeading level={4}>Reforge</GuideHeading>
      <p>
        Available via the <strong>Reforge</strong> tab in the Enhance menu. Reforging is done by using catalysts <ItemInlineDisplay names="Normal Reforge Catalyst" text={false} /><ItemInlineDisplay names="Superior Reforge Catalyst" text={false} /><ItemInlineDisplay names="Epic Reforge Catalyst" text={false} /><ItemInlineDisplay names="Legendary Reforge Catalyst" text={false} />. <br />
      </p>
      <p className="text-neutral-400 text-sm italic mb-4">
        Note: Like hammers, you can convert catalyst to the upper grade in your inventory with a 6:1 (e.g : 6 <ItemInlineDisplay names="Normal Reforge Catalyst" /> for 1 <ItemInlineDisplay names="Superior Reforge Catalyst" />)
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

      <GuideHeading level={4}>Breakthrough</GuideHeading>
      <p>
        Available via the <strong>Breakthrough</strong> tab in the Enhance menu, using glunites <ItemInlineDisplay names="Glunite" text={false} /><ItemInlineDisplay names="Refined Glunite" text={false} /><ItemInlineDisplay names="Event Glunite" text={false} /><ItemInlineDisplay names="Armor Glunite" text={false} /> to increase the item’s breakthrough up to T4. This improves the main stat and item&apos;s effect.
      </p>
      <p className="text-neutral-400 text-sm italic mb-4">
        Note: You can use a duplicate item instead of Glunite (it must be the same grade, same effect, and same slot).
      </p>
      <p>Example comparisons:</p>
      <div className="flex flex-wrap justify-center gap-8">
        {/* Column: Surefire Javelin */}
        <div className="flex flex-col items-center gap-4 min-w-[280px]">
          <div className="flex flex-col items-center">
            Surefire Javelin
            <EquipmentCardInline data={{
              type: 'Weapon',
              rarity: 'legendary',
              star: 6,
              reforge: 0,
              tier: null,
              level: null,
              class: 'striker',
              effect: 11
            }} />
            <div className="mt-1 flex flex-col items-center gap-1 text-center">
              <div className="flex items-center gap-1">
                <StatInlineTag name="ATK" color='text-white' />
                200
              </div>
              <p>Effect: 1% of target&apos;s Max HP</p>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <EquipmentCardInline data={{
              type: 'Weapon',
              rarity: 'legendary',
              star: 6,
              reforge: 0,
              tier: 4,
              level: null,
              class: 'striker',
              effect: 11
            }} />
            <div className="mt-1 flex flex-col items-center gap-1 text-center">
              <div className="flex items-center gap-1">
                <StatInlineTag name="ATK" color='text-white' />
                240
              </div>
              <p>Effect: 2% of target&apos;s Max HP</p>
            </div>
          </div>
        </div>

        {/* Column: Immunity Set */}
        <div className="flex flex-col items-center gap-4 min-w-[280px]">
          <div className="flex flex-col items-center">
            Immunity Set
            <EquipmentCardInline data={{
              type: 'Armor',
              rarity: 'legendary',
              star: 6,
              reforge: 0,
              tier: null,
              level: null,
              class: null,
              effect: 19
            }} />
            <div className="mt-1 flex flex-col items-center gap-1 text-center">
              <div className="flex items-center gap-1">
                <StatInlineTag name="DEF" color='text-white' />
                100
              </div>
              <div className="flex items-center gap-1">
                2p bonus: Immunity 1 turn at start
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
            }} />
            <div className="mt-1 flex flex-col items-center gap-1 text-center">
              <div className="flex items-center gap-1">
                <StatInlineTag name="DEF" color='text-white' />
                120
              </div>
              <div className="flex items-center gap-1">
                2p bonus: Immunity 1 turn at start
              </div>
              <p>4p bonus: -30% damage taken</p>
            </div>
          </div>
        </div>

        {/* Column: Penetration Set */}
        <div className="flex flex-col items-center gap-4 min-w-[280px]">
          <div className="flex flex-col items-center">
            Penetration Set
            <EquipmentCardInline data={{
              type: 'Armor',
              rarity: 'legendary',
              star: 6,
              reforge: 0,
              tier: null,
              level: null,
              class: null,
              effect: 11
            }} />
            <div className="mt-1 flex flex-col items-center gap-1 text-center">
              <div className="flex items-center gap-1">
                <StatInlineTag name="DEF" color='text-white' />
                100
              </div>
              <div className="flex items-center gap-1">
                4p bonus: <StatInlineTag name="PEN" color='text-white' /> +20%
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
              effect: 11
            }} />
            <div className="mt-1 flex flex-col items-center gap-1 text-center">
              <div className="flex items-center gap-1">
                <StatInlineTag name="DEF" color='text-white' />
                120
              </div>
              <div className="flex items-center gap-1">
                2p bonus: <StatInlineTag name="PEN" color='text-white' /> +8%
              </div>
              <p>4p bonus: <StatInlineTag name="PEN" color='text-white' /> +12%</p>
            </div>
          </div>
        </div>
      </div>

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


      <GuideHeading level={2}>FAQ</GuideHeading>
      <Accordion items={gearUpgradeFaq} />

    </div>

  );
}

