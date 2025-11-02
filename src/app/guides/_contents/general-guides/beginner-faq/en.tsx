'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import GuideIconInline from '@/app/components/GuideIconInline'
import ItemInlineDisplay from '@/app/components/ItemInline'
import StarLevel from '@/app/components/StarLevel'
import StatInlineTag from '@/app/components/StatInlineTag'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import Link from 'next/link'
import ElementInlineTag from '@/app/components/ElementInline'
import SkillInline from '@/app/components/SkillInline'

export default function BeginnerFAQ() {
  return (
    <GuideTemplate
      title="Beginner FAQ"
      introduction="Common questions asked by new players, compiled from community discussions and veteran player advice."
      defaultVersion="default"
      versions={{
        default: {
          label: 'FAQ',
          content: (
            <div className="space-y-12">
              {/* Getting Started */}
              <section className="space-y-6">
                <h3 className="text-2xl font-bold text-sky-400 border-l-4 border-sky-500 pl-4">Getting Started</h3>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-sky-300">How important is rerolling?</h4>
                    <p className=" leading-relaxed">
                      Getting a <Link href="/guides/general-guides/premium-limited" className="text-blue-400 hover:text-blue-300 underline">Premium/Limited hero</Link> early helps, but is not required.
                    </p>
                    <p className=" leading-relaxed">
                      The <Link href="/guides/general-guides/free-heroes-start-banner" className="text-blue-400 hover:text-blue-300 underline">heroes you get for free</Link> are a solid foundation to start off with.
                    </p>
                    <p className=" leading-relaxed">
                      Aside from Recruiting, you can farm regular heroes you don&apos;t have in the Doppelgänger Challenge too, given enough time (8 days each after completing their Side Story).
                    </p>
                  </div>
                </div>

              </section>

              {/* Heroes & Pulling */}
              < section className="space-y-6" >
                <h3 className="text-2xl font-bold text-purple-400 border-l-4 border-purple-500 pl-4">Heroes & Pulling</h3>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-4">
                    <h4 className="text-lg font-semibold text-purple-300">Who do I pull for?</h4>
                    <p className=" leading-relaxed">
                      Outerplane aims to use a <strong>wide range of heroes</strong>, rather than focusing on a small core group, so the goal is to have most heroes available.
                    </p>

                    <div className="grid md:grid-cols-3 gap-3 mt-4">
                      <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg space-y-2">
                        <div className="flex items-center gap-2 font-semibold text-purple-300">
                          <span>Limited</span>
                        </div>
                        <p className="text-sm ">
                          <ItemInlineDisplay names={'Ether'} /> goes to Limited heroes (Seasonal, Festival, Collab banners) as a priority. They don&apos;t necessarily stand above other heroes, but they are only available during their banner and can make certain fights easier. Collect at least at 3-star when their banner is up.
                        </p>
                      </div>

                      <div className="p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg space-y-2">
                        <h5 className="font-semibold text-amber-300">Premium</h5>
                        <p className="text-sm ">
                          The Premium banner lets you change your rate up target once per 7 days. When starting out, you can roll for the current rate up hero before changing.
                          Our recommended order is listed in the <Link href="/guides/general-guides/premium-limited" className="text-blue-400 underline">dedicated guide</Link>.
                        </p>
                      </div>

                      <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg space-y-2">
                        <h5 className="font-semibold text-green-300">Regular</h5>
                        <p className="text-sm  mb-2">
                          For Regular heroes in Rate Up Recruit and Custom Recruit we recommend only using <ItemInlineDisplay names={'Special Recruitment Ticket'} /> <ItemInlineDisplay names={'Special Recruitment Ticket (Event)'} />.
                          <br />The first goal in Custom Recruit when starting out is a hero that gives <EffectInlineTag name="BT_STAT|ST_CRITICAL_RATE" type="buff" /> buff.
                        </p>
                        <div className="gap-1">
                          <CharacterLinkCard name="Valentine" />
                          <CharacterLinkCard name="Tamara" /> <br />
                          <CharacterLinkCard name="Skadi" />
                          <CharacterLinkCard name="Charlotte" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-purple-300">Should I pull for dupes?</h4>

                    <div className="space-y-4">
                      <div>
                        <p className=" leading-relaxed mb-2">
                          Regular heroes can be farmed in the Doppelgänger Challenge, so pulling multiple copies is not required.
                          Unlocking a 3-star hero without recruiting them takes 250 hero pieces, transcending takes 150 per step(*).
                          So recruiting regular heroes while farming for their transcends in Doppelgänger is slightly more efficient.
                          New heroes take 3 months to get added to Doppelgänger and Custom Recruit.
                        </p>
                        <p className='text-xs text-gray-300 mb-4'>
                          (*) Transcend Steps being 4*, 4+, 5*, 5+, 5++, 6* for 900 total pieces required.
                        </p>
                        <div className="ml-4 space-y-1 text-sm text-gray-400">
                          <p>• <StarLevel levelLabel='4' /> — for the increased Weakness Gauge Damage is the main target.</p>
                          <p>• <StarLevel levelLabel='5' /> — if they have an interesting burst 3 effect.</p>
                          <p>• <StarLevel levelLabel='6' /> — is usually not a priority for regular heroes, since it only grants a stat bonus and 25 AP at battle start.</p>
                        </div>
                      </div>

                      <div>
                        <p className=" leading-relaxed">
                          <strong className="text-amber-300">Premium</strong> and <strong className="text-purple-400">Limited</strong> heroes transcend primarily via dupes, so these may need multiple copies.
                          How many depends on their individual kits, they generally already work at 3-star.
                          An evaluation of each hero and their transcends is found <Link href="/guides/general-guides/premium-limited" className="text-blue-400 underline">here</Link>.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-purple-300">What team do I start with?</h4>
                    <p className=" leading-relaxed">
                      A standard team for Story is a main damage dealer, a crit chance buffer, a Healer and a flexible spot for a debuffer, second damage dealer or buffer, or a Defender.
                      Defenders are not required in most of the story, Healers or Bruisers can handle it.
                    </p>

                    <div className="grid md:grid-cols-2 gap-3 mt-3">
                      <div className="p-3 bg-red-900/10 border-l-4 border-red-500 rounded">
                        <p className="text-sm font-semibold text-red-300 mb-2">DPS (from Start Dash banner)</p>
                        <div className="gap-1">
                          <CharacterLinkCard name="Ame" />
                          <CharacterLinkCard name="Rey" />
                          <CharacterLinkCard name="Rin" />
                          <CharacterLinkCard name="Vlada" />
                        </div>
                      </div>

                      <div className="p-3 bg-blue-900/10 border-l-4 border-blue-500 rounded">
                        <p className="text-sm font-semibold text-blue-300 mb-2">Crit Buff (from Custom Recruit banner)</p>
                        <div className="gap-1">
                          <CharacterLinkCard name="Valentine" />
                          <CharacterLinkCard name="Tamara" />
                          <CharacterLinkCard name="Skadi" />
                          <CharacterLinkCard name="Charlotte" />
                        </div>
                      </div>

                      <div className="p-3 bg-green-900/10 border-l-4 border-green-500 rounded">
                        <p className="text-sm font-semibold text-green-300 mb-2">Healers</p>
                        <div className="gap-1">

                          You get <CharacterLinkCard name="Mene" /> for free and can choose between <CharacterLinkCard name="Dianne" /> and <CharacterLinkCard name="Nella" /> later, with <CharacterLinkCard name="Monad Eva" /> also being highly recommended from <strong className="text-amber-300">Premium banner</strong> due to her unconditional <EffectInlineTag name='BT_CALL_BACKUP' type='buff' />.
                        </div>
                      </div>

                      <div className="p-3 bg-amber-900/10 border-l-4 border-amber-500 rounded">
                        <p className="text-sm font-semibold text-amber-300 mb-2">Flex/Support</p>
                        <div className="gap-1">
                          <CharacterLinkCard name="Veronica" />
                          <CharacterLinkCard name="Eternal" />
                          <CharacterLinkCard name="Akari" /> or another hero you picked up along the way.
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-orange-900/10 border-l-4 border-orange-500 rounded mt-3">
                      <span className="text-sm ">
                        <strong>First boss priorities are :</strong>
                        <ul>
                          <li><GuideIconInline name="IG_Turn_4034002" text="Unidentified Chimera" size={30} /> for armor set like <StatInlineTag name='SPD' /> and <StatInlineTag name='CHD' />.</li>
                          <li><GuideIconInline name="IG_Turn_4076001" text="Glicys" size={30} /> and <GuideIconInline name="IG_Turn_4076002" text="Blazing Knight Meteos" size={30} /> for weapons/accessories.</li>
                        </ul>
                        <p className='mt-4'>
                          A party that focuses on <ElementInlineTag element='earth' /> & <ElementInlineTag element='fire' /> heroes would be beneficial as a first team to work on. The long term goal is having teams in each element, but focus on building one team at a time.
                          Having one strong team ready speeds up upgrading your next one.
                        </p>
                        <div className="p-3 bg-blue-900/20 border-l-4 border-blue-500 rounded">

                          <p className="text-sm ">
                            <strong>Tip:</strong> You can use friends&apos; support heroes up to stage 10, so this is not a strict requirement.
                          </p>
                        </div>
                      </span>
                    </div>
                  </div>
                </div>
              </section>


              {/* What to do */}
              <section>
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                  <h4 className="text-lg font-semibold text-sky-300">Where do I go first?</h4>
                  <p className=" leading-relaxed">
                    <strong>Eva&apos;s Guide Quests</strong> in game will point you around the various gamemodes while clearing Story.
                  </p>
                  <div className="space-y-2 mt-3">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <p className=" leading-relaxed">
                        Under Challenges, the <Link href="/guides/special-request" className="text-blue-400 underline">Special Requests</Link><strong></strong> will let you unlock a strong starter pack of 6 heroes, along with gear and upgrade materials for them.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <p className=" leading-relaxed">
                        Experience is slow at the start, progress through the <strong>Bandit Chase</strong> stages to get more food daily.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <p className=" leading-relaxed">
                        <Link href="/guides/skyward-tower" className="text-blue-400 underline">Skyward Tower</Link><strong></strong> resets monthly, try to get as high as you can.
                      </p>
                    </div>
                  </div>
                </div>
              </section>


              {/* Gear & Equipment */}
              < section className="space-y-6">
                <h3 className="text-2xl font-bold text-amber-400 border-l-4 border-amber-500 pl-4">Gear & Equipment</h3>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-amber-300">How do I get gear?</h4>
                    <p className=" leading-relaxed">
                      Eva&apos;s Guide Quests and Skyward Tower will sort this out while levelling, along with the Challenge! Special Request missions&apos; 6-star legendary gear. When enough Survey Hub or Arena currency is available, these can also offer solid 6-star gear (season 2 for Survey Hub).
                      Farming for gear isn&apos;t a big focus until you have cleared Stage 10 on the Special Request bosses, so they can only drop 6-star gear.
                    </p>

                    <div className="grid md:grid-cols-2 gap-3 mt-3">
                      <div className="p-3 bg-cyan-900/10 border-l-4 border-cyan-500 rounded">
                        <p className="text-sm font-semibold text-cyan-300 mb-1">Armor Priority</p>
                        <p className="text-sm ">
                          <GuideIconInline name="IG_Turn_4034002" text="Unidentified Chimera" size={30} /> is the first focus for armor, as her sets, Speed, Counterattack, Critical Strike, (accuracy) offer something for any role. Penetration set from Sacreed Guardian would be stronger for damage dealers, but this boss doesn&apos;t offer sets that are generally useful for other roles.
                        </p>
                      </div>

                      <div className="p-3 bg-rose-900/10 border-l-4 border-rose-500 rounded">
                        <p className="text-sm font-semibold text-rose-300 mb-1">Weapons/Accessories</p>
                        <p className="text-sm ">
                          Weapon and accessory skills depend on the boss, and each boss can only drop accessories with certain main stats.<br />
                          <GuideIconInline name="IG_Turn_4076001" text="Glicys" size={30} /> offers accessories with Speed and Crit Chance main stats (also Defense & Resilience), making her the prime target for Weapons and Accessories to start off with. <br />
                          <GuideIconInline name="IG_Turn_4076002" text="Meteos" size={30} /> is the easy next target, with Penetration, Crit Damage, Health and Effectiveness accessory main stat options. Veronica can solo him at stage 10.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-amber-300">How do I get Exclusive Equipment & Talismans?</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-purple-900/10 border-l-4 border-purple-500 rounded">
                        <p className="text-sm font-semibold text-purple-300 mb-1">Exclusive Equipment</p>
                        <p className="text-sm ">
                          Heroes&apos; Exclusive Equipment is gained by reaching Trust level 10.<br />
                          Gifts can be obtained via the Black Market Expedition in the base, and farmed in Story boss stages marked by a daily entry limit.<br />
                          Irregular Extermination Project: Pursuit Operations also give gifts when clearing bosses.
                          <br />You can get an Oath of Determination to instant max out Trust via certain events,
                        </p>
                      </div>
                      <div className="p-3 bg-indigo-900/10 border-l-4 border-indigo-500 rounded">
                        <p className="text-sm font-semibold text-indigo-300 mb-1">Talismans and Charms</p>
                        <p className="text-sm ">
                          The Archdemon&apos;s Ruins&apos; Infinite Corridor is the primary source for Talismans. The Archdemon&apos;s Ruins Shop offers one 6-star selector per month.<br />
                          You also get a few from the Challenge! Special Request missions.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-amber-300">What gear is worth keeping?</h4>
                    <div className="p-3 bg-blue-900/20 border-l-4 border-blue-500 rounded mb-3">
                      <p className="text-sm font-semibold text-red-300">⚠️ Don&apos;t throw those blues! ⚠️</p>
                    </div>
                    <p className=" leading-relaxed">
                      Epic gear is the staple, not far behind Legendary and cheaper to upgrade. <br />
                      Once you get to 6-star gear (shouldn&apos;t take too long especially with friend supports), it&apos;ll be easy for reforged Epic gear to overtake 5-star Legendary gear, or even 6-star legendary with lower substat rolls. <br />
                      Green/Superior gear takes a bigger hit on its main stat, but for Helmet/Armor/Boots these can still turn out well when the substats are strong.
                    </p>
                    <p>
                      Gear can be reforged as many times as it has stars, which unlocks new substats until there are 4, then randomly increases one by one steps. The maximum total substats are:
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-sm mt-2">
                      <div className="p-2 bg-red-900/20 rounded text-center">
                        <p className="text-red-300 font-semibold">6★ Legendary</p>
                        <p className="">18 ticks</p>
                      </div>
                      <div className="p-2 bg-blue-900/20 rounded text-center">
                        <p className="text-blue-300 font-semibold">6★ Epic</p>
                        <p className="">17 ticks</p>
                      </div>
                      <div className="p-2 bg-green-900/20 rounded text-center">
                        <p className="text-green-300 font-semibold">6★ Superior</p>
                        <p className="">16 ticks</p>
                      </div>
                    </div>
                    <p className="mt-2">
                      Meaning for armor, where the main stat is usually not going to make or break the fight, the rarity of the gear is not important.<br />
                      Weapons, Accessories and Gloves you would aim for the higher rarities, as the main stat here does matter. Legendary Weapons & Accessories also come with skills.<br />

                      When it drops, the substats can have up to 3 ticks worth before reforging, out of 6 maximum.<br />
                      This isn&apos;t common enough to make it the basic requirement, as long as most of the substats are right you can make use of them.<br />
                      Increase the standards for gear to keep or use as materials as your account grows.

                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-amber-300">When should I start upgrading gear?</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-amber-400 mt-1">1.</span>
                        <p className=""><strong>Enhancing Weapons</strong> will speed up the early game a lot, this is one you can start doing as soon as you notice progress slowing down.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-amber-400 mt-1">2.</span>
                        <p className=""><strong>Accessories</strong> with crit chance main stat for your damage dealer are the next target to enhance.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-amber-400 mt-1">3.</span>
                        <p className=""><strong>Armor</strong> won&apos;t need enhancements until you&apos;re in the later chapters of season 1 (and then +5 should be fine for a while).</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-amber-400 mt-1">4.</span>
                        <p className=""><strong>Reforge/Breakthrough</strong> systems don&apos;t become important until you have 6-star gear.</p>
                      </div>
                      <ul>
                        <li>Substats are the focus at 6-star, so Reforging these will be a big part of your heroes&apos; power.</li>
                        <li>Breakthrough increases skill/set effects and upgrades main stats by 5% each (up to 4 times). This is one you can leave until you have gear with good substats which will be useful for a long time.</li>
                        <li>Gems for Special Gear are equivalent to one Reforge of the same level. They are a large gold sink to upgrade, so not something to focus on early while gold is still scarce and needed for gear enhancements.</li>
                      </ul>
                    </div>
                  </div>


                </div>
              </section>

              {/* Progression & Resources */}
              <section className="space-y-6">
                <h3 className="text-2xl font-bold text-green-400 border-l-4 border-green-500 pl-4">Progression & Resources</h3>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-green-300">Where do I use skill manuals first?</h4>
                    <div className="p-3 bg-yellow-900/10 border-l-4 border-yellow-500 rounded">
                      <p className="text-sm font-semibold text-yellow-300">Skill up rule of thumb :</p>
                      <ol className="list-decimal list-inside text-sm  space-y-1 mt-2 ml-2">
                        <li>Level 2 for Weakness Gauge damage</li>
                        <li>Effect chance, effect duration & cooldown reductions.</li>
                        <li>Damage increases (DPS only)</li>
                      </ol>
                    </div>
                    <p className="text-sm text-gray-300">
                      Chain passive can be left at level 2 until much later, the Weakness Gauge damage increase at level 5 is the only interesting part, so you can save skill manuals here until the more important skills are taken care of.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-green-300">What Base upgrades should I go for?</h4>
                    <div className="space-y-2">
                      <p>You can unlock and upgrade them in the order of Eva&apos;s Menu:</p>
                      <div className="p-3 bg-red-900/10 border-l-4 border-red-500 rounded">
                        <p className="text-sm font-semibold text-red-300">1. Antiparticle Generator <span className="text-sm text-gray-400">Max this first!</span></p>
                      </div>
                      <div className="p-3 bg-orange-900/10 border-l-4 border-orange-500 rounded">
                        <p className="text-sm font-semibold text-orange-300">2. Expedition</p>
                      </div>
                      <div className="p-3 bg-yellow-900/10 border-l-4 border-yellow-500 rounded">
                        <p className="text-sm font-semibold text-yellow-300">3. Supply Module</p>
                      </div>
                      <div className="p-3 bg-lime-900/10 border-l-4 border-lime-500 rounded">
                        <p className="text-sm font-semibold text-lime-300">4. Kate&apos;s Workshop</p>
                      </div>
                      <div className="p-3 bg-green-900/10 border-l-4 border-green-500 rounded">
                        <p className="text-sm font-semibold text-green-300">5. Synchro Room</p>
                      </div>
                      <p className=" text-sm">Unlock <strong>Quirks & Precise Crafting</strong> when they are opened (Clear Season 1 stage 9-5).</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-green-300">Priority for Quirks?</h4>
                    <p className=" leading-relaxed">
                      The upgrade order for Quirks depends on what heroes you&apos;re using and what boss you&apos;re targeting next.<br />
                      From broad impact to more specific: Counteract Strong Enemies, Class, Element.
                    </p>
                    <p className="">
                      Your preferred damage dealer subclass (Attacker, Bruiser, Wizard, Vanguard) and their element can go before supporters unless you&apos;re having trouble keeping them alive.
                    </p>
                    <p className="">
                      Utility doesn&apos;t help in combat, so picking up these QoL perks is at your own discretion.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-green-300">How important is joining a guild?</h4>

                    <p>It is a source of weekly skill manuals, and you can get hero pieces for Aer, Ame, Dahlia, Drakhan and Epsilon through it. Look for a guild with a level 5 guild shop. The monthly Guild Raid is also an important source of gems and ether.</p>
                  </div>
                </div>
              </section>

              {/* Advanced Tips */}
              <section className="space-y-6">
                <h3 className="text-2xl font-bold text-rose-400 border-l-4 border-rose-500 pl-4">Advanced Tips</h3>

                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                  <h4 className="text-lg font-semibold text-rose-300">My hero has skills that scale with health/defense/speed/evasion, should I focus on that then?</h4>
                  <p className=" leading-relaxed">
                    The key words to look for here are <strong className='underline'>&quot;instead of Attack&quot;</strong>.
                    When a skill only says its damage increases proportional to a stat, it will still mainly use Attack for its damage calculation.
                    The proportional stat will act as an extra multiplier, but this is generally too small to become the main focus.
                  </p>

                  <div className="grid md:grid-cols-2 gap-3 mt-3">
                    <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                      <p className="text-sm font-semibold text-green-300 mb-2 flex items-center gap-2">
                        <CharacterLinkCard name="Delta" /> <span className="text-xs">(HP instead of ATK)</span>
                      </p>
                      <p className="text-sm "><SkillInline character='Delta' skill='S1' /><SkillInline character='Delta' skill='S2' /><SkillInline character='Delta' skill='S3' /></p>
                      <p>Delta&apos;s skills scale proportional to Max Health instead of <StatInlineTag name="ATK" />: Focus on <StatInlineTag name="HP" /></p>
                    </div>

                    <div className="p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg">
                      <p className="text-sm font-semibold text-amber-300 mb-2 flex items-center gap-2">
                        <CharacterLinkCard name="Demiurge Stella" /> <span className="text-xs">(HP bonus)</span>
                      </p>
                      <p className="text-sm "><SkillInline character='Demiurge Stella' skill='S1' /><SkillInline character='Demiurge Stella' skill='S2' /><SkillInline character='Demiurge Stella' skill='S3' /></p>
                      <p className="text-sm ">Demiurge Stella&apos;s skills scale proportional to Max Health: Still goes for <StatInlineTag name="ATK" /> to increase damage, <StatInlineTag name="HP" /> is a bonus.</p>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-900/10 border-l-4 border-purple-500 rounded">
                    <p className="text-sm font-semibold text-purple-300 mb-1">
                      Against bosses that set your <StatInlineTag name="ATK" /> to 0 (Like Shichifuja&apos;s Shadow in Skyward Tower Hard): Delta can deal damage normally. Demiurge Stella&apos;s damage will reduce to single digits.
                    </p>
                  </div>
                </div>
              </section>

              {/* Related Guides */}
              <div className="mt-12 p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-xl">
                <h3 className="text-lg font-semibold text-blue-300 mb-4">📚 Related Guides</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <Link href="/guides/general-guides/free-heroes-start-banner" className="p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition border border-slate-600">
                    <p className="text-blue-400 font-medium">Free Heroes & Start Banner</p>
                    <p className="text-xs text-gray-400 mt-1">Maximize your free roster</p>
                  </Link>
                  <Link href="/guides/general-guides/premium-limited" className="p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition border border-slate-600">
                    <p className="text-purple-400 font-medium">Premium & Limited Guide</p>
                    <p className="text-xs text-gray-400 mt-1">Pulling priorities & transcendence</p>
                  </Link>
                  <Link href="/guides/general-guides/gear" className="p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition border border-slate-600">
                    <p className="text-amber-400 font-medium">Gear Guide</p>
                    <p className="text-xs text-gray-400 mt-1">Deep dive into equipment</p>
                  </Link>
                  <Link href="/guides/general-guides/heroes-growth" className="p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition border border-slate-600">
                    <p className="text-green-400 font-medium">Heroes Growth</p>
                    <p className="text-xs text-gray-400 mt-1">Leveling & progression systems</p>
                  </Link>
                </div>
              </div>
            </div >
          ),
        },
      }}
    />
  )
}
