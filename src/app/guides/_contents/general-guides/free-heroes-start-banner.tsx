import GuideHeading from '@/app/components/GuideHeading'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import CharacterInlineStacked from '@/app/components/CharacterInlineStacked'
import ElementInlineTag from '@/app/components/ElementInline';
import GuideIconInline from '@/app/components/GuideIconInline';
import Image from 'next/image'

const decoration = "text-gray-400 underline italic"

export default function BeginnerGuide() {
    return (
        <div className="space-y-6">
            <p className="text-red-500 font-semibold bg-red-100 border border-red-300 rounded px-4 py-2 text-sm">
                Avoid picking duplicates — <strong>always choose characters you don&apos;t already own</strong>. If your in-game recommendations look different, it&apos;s because we&apos;ve already excluded heroes you&apos;ll unlock for free elsewhere.
            </p>


            <GuideHeading level={3}>Start Dash Banner</GuideHeading>

            <p>
                At the start of the game, you can select one of the following 3★ characters. They’re all solid choices, so just pick the one you prefer :
                <CharacterLinkCard name="Ame" /> <CharacterLinkCard name="Rin" /> <CharacterLinkCard name="Rey" /> or <CharacterLinkCard name="Vlada" />.
            </p>

            <GuideHeading level={3}>Free characters you&apos;ll unlock</GuideHeading>
            <GuideHeading level={4}>From <GuideIconInline name="New-User-Missions" /></GuideHeading>
            <p><CharacterLinkCard name="Mene" /></p>

            <p><GuideIconInline name="T_Recruit_Card_03" text="Season 1 Selector" /> that features season 1 heroes</p>
            <div className="inline-flex flex-wrap gap-2">
                <CharacterInlineStacked name="Alice" />
                <CharacterInlineStacked name="Eliza" />
                <CharacterInlineStacked name="Francesca" />
                <CharacterInlineStacked name="Leo" />
                <CharacterInlineStacked name="Maxwell" />
                <CharacterInlineStacked name="Rhona" />
                <CharacterInlineStacked name="Rin" /> {/* add note below if needed */}
                <CharacterInlineStacked name="Saeran" />
                <CharacterInlineStacked name="Valentine" />
            </div>


            <GuideHeading level={4}>From All Around Mirsha I</GuideHeading>
            <p><CharacterLinkCard name="Veronica" /> when you clear Season 1 Normal Adventure 2-3</p>
            <p>Another <GuideIconInline name="T_Recruit_Card_03" text="Season 1 Selector" /> when you clear Season 1 Hardmode Adventure 10-7 </p>
            <GuideHeading level={4}>From clearing Season 3 1-13 : The Identity of the Relic</GuideHeading>
            <p><CharacterLinkCard name="Fatal" /></p>
            <GuideHeading level={4}>From clearing Skyward Tower Floor 100</GuideHeading>
            <p><CharacterLinkCard name="Sigma" /></p>
            <GuideHeading level={4}>From <GuideIconInline name="CM_Shop_Tab_Exchange" text='Friendship Shop' />  : 10 hero pieces per week for 700 <GuideIconInline name="CM_Goods_FriendPoint" text='Friendship Points' /></GuideHeading>
            <p><CharacterLinkCard name="Stella" /></p>
            <GuideHeading level={4}>From <GuideIconInline name="Supporters" /> (choose one of the following starter - <ElementInlineTag element="light" /> recommended)</GuideHeading>
            <div className="flex items-start gap-6">
                {/* Light Starter */}
                <div>
                    <p className="mb-2">
                        <ElementInlineTag element="light" /> Starter:
                    </p>
                    <div className="flex gap-2">
                        <CharacterInlineStacked name="Dianne" />
                        <CharacterInlineStacked name="Drakhan" />
                        <CharacterInlineStacked name="Akari" />
                    </div>
                </div>

                {/* Separator */}
                <div className="w-px bg-transparent self-stretch mx-2"></div>

                {/* Dark Starter */}
                <div>
                    <p className="mb-2">
                        <ElementInlineTag element="dark" /> Starter:
                    </p>
                    <div className="flex gap-2">
                        <CharacterInlineStacked name="Nella" />
                        <CharacterInlineStacked name="Hilde" />
                        <CharacterInlineStacked name="Iota" />
                    </div>
                </div>
            </div>

            <GuideHeading level={4}>From <GuideIconInline name="CM_Shop_Shortcuts_GuildShop" text='Guild Shop' /> : 10 hero pieces per week for 300 <GuideIconInline name="CM_Goods_Guild_Coin" text='Guild Coins' /></GuideHeading>
            <div className="flex flex-wrap gap-2 mt-2">
                <CharacterInlineStacked name="Ame" />
                <CharacterInlineStacked name="Dahlia" />
                <CharacterInlineStacked name="Epsilon" />
            </div>
            <p className="text-neutral-400 text-sm italic mb-4">
                Note:  <CharacterLinkCard name="Drakhan" /> too if you didn&apos;t picked the <ElementInlineTag element="light" /> Starter Selector
            </p>
            <GuideHeading level={4}>Special Request events</GuideHeading>
            <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Identification */}
                <div className="flex-1 flex flex-col items-start space-y-3">
                    <div className="w-[400px] h-[80px] relative">
                        <Image
                            src="/images/guides/general-guides/Challenge!-Special-Request-Identification.webp"
                            alt="Challenge! Special Request: Identification"
                            width={400}
                            height={80}
                            style={{ width: 400, height: 80 }}
                            className="object-contain"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <CharacterLinkCard name="Eternal" /> from <GuideIconInline name="IG_Turn_4076003" text="Dek'ril & Mek'ril" size={50} />
                        </div>
                        <div className="flex items-center gap-2">
                            <CharacterLinkCard name="Noa" /> from <GuideIconInline name="IG_Turn_4076001" text="Glicys" size={50} />
                        </div>
                        <div className="flex items-center gap-2">
                            <CharacterLinkCard name="Laplace" /> from <GuideIconInline name="IG_Turn_4076002" text="Blazing Knight Meteos" size={50} />
                        </div>
                    </div>
                </div>

                {/* Ecology Study */}
                <div className="flex-1 flex flex-col items-start space-y-3">
                    <div className="w-[400px] h-[80px] relative">
                        <Image
                            src="/images/guides/general-guides/Challenge!-Special-Request-Ecology-Study.webp"
                            alt="Challenge! Special Request: Ecology Study"
                            width={400}
                            height={80}
                            style={{ width: 400, height: 80 }}
                            className="object-contain"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <CharacterLinkCard name="Aer" /> from <GuideIconInline name="IG_Turn_4034002" text="Unidentified Chimera" size={50} />
                        </div>
                        <div className="flex items-center gap-2">
                            <CharacterLinkCard name="Kappa" /> from <GuideIconInline name="IG_Turn_4076005" text="Tyrant Toddler" size={50} />
                        </div>
                        <div className="flex items-center gap-2">
                            <CharacterLinkCard name="Beth" /> from <GuideIconInline name="IG_Turn_4076006" text="Masterless Guardian" size={50} />
                        </div>
                    </div>
                </div>
            </div>




            <GuideHeading level={3}>Pulling strategy (Custom Banner)</GuideHeading>
            <p>
                Like everythings previously : Focus on unlocking new characters — doppelgängers handle transcendence. New units join the custom pool ~3.5 months after release.
            </p>
            <p className="text-neutral-400 text-sm italic mb-4">
                Note: Some heroes are not available in the custom banner yet, as they haven&apos;t been out long enough (like Fran).
            </p>
            <p className="text-neutral-400 text-sm italic mb-4">
                Note: Characters whose names appear in <span className={decoration}>grey</span> can be obtained for free (see above).
            </p>
            <p className="mt-2">Recommended picks order from the Custom Banner:</p>
            <div className="flex items-center gap-x-4">
                <div className="flex flex-wrap items-start gap-2">
                    <CharacterInlineStacked name="Tamara" />
                    <CharacterInlineStacked name="Valentine" />
                    <CharacterInlineStacked name="Skadi" />
                </div>
                <p className="text-sm">Crit buffers</p>
            </div>

            {/* Immunity / Healing */}
            <div className="flex items-center gap-x-4 mt-4">
                <div className="flex flex-wrap items-start gap-2">
                    <CharacterInlineStacked name="Dianne" deco={decoration} />
                    <CharacterInlineStacked name="Nella" deco={decoration} />
                </div>
                <p className="text-sm">Pick based on your starter</p>
            </div>


            {/* PvP Utility */}
            <div className="flex items-center gap-x-4 mt-4">
                <div className="flex flex-wrap items-start gap-2">
                    <CharacterInlineStacked name="Dahlia" deco={decoration} />
                    <CharacterInlineStacked name="Iota" deco={decoration} />
                    <CharacterInlineStacked name="Kanon" />
                </div>
                <p className="">Excellent PvP units.</p>
            </div>

            {/* DPS */}
            <div className="flex items-center gap-x-4 mt-4">
                <div className="flex flex-wrap items-start gap-2">
                    <CharacterInlineStacked name="Ame" deco={decoration} />
                    <CharacterInlineStacked name="Rey" />
                    <CharacterInlineStacked name="Roxie" />
                    <CharacterInlineStacked name="Maxwell" deco={decoration} />
                </div>
                <p className="">High damage dealers for general content</p>
            </div>

            {/* Debuffers */}
            <div className="flex items-center gap-x-4 mt-4">
                <div className="flex flex-wrap items-start gap-2">
                    <CharacterInlineStacked name="Akari" deco={decoration} />
                    <CharacterInlineStacked name="Tamamo-no-Mae" />
                    <CharacterInlineStacked name="Kuro" />
                </div>
                <p className="">Reliable debuffers</p>
            </div>

            {/* Pure Support / Healing */}
            <div className="flex items-center gap-x-4 mt-4">
                <div className="flex flex-wrap items-start gap-2">
                    <CharacterInlineStacked name="Astei" />
                    <CharacterInlineStacked name="Liselotte" />                    
                </div>
                <p className="">Pure Healer</p>
            </div>

            {/* DPS with special utility */}
            <div className="flex items-center gap-x-4 mt-4">
                <div className="flex flex-wrap items-start gap-2">
                    <CharacterInlineStacked name="Drakhan" deco={decoration} />
                    <CharacterInlineStacked name="Regina" />
                    <CharacterInlineStacked name="Caren" />
                    <CharacterInlineStacked name="Maxie" />
                </div>
                <p className="">DPS with Special use cases</p>
            </div>

            {/* Niche Utility */}
            <div className="flex items-center gap-x-4 mt-4">
                <div className="flex flex-wrap items-start gap-2">
                    <CharacterInlineStacked name="Sterope" />
                    <CharacterInlineStacked name="Notia" />
                    <CharacterInlineStacked name="Hilde" deco={decoration} />
                    <CharacterInlineStacked name="Charlotte" />
                    <CharacterInlineStacked name="Fran" />
                    <CharacterInlineStacked name="Luna" />
                </div>
                <p className="">Niche but Special use cases</p>
            </div>

            {/* Temporary DPS */}
            <div className="flex items-center gap-x-4 mt-4">
                <div className="flex flex-wrap items-start gap-2">
                    <CharacterInlineStacked name="Rin" deco={decoration} />
                    <CharacterInlineStacked name="Epsilon" />
                </div>
                <p className="">Usable as DPS early on, but generally outscaled.</p>
            </div>

            {/* Niche usage */}
            <div className="flex items-center gap-x-4 mt-4">
                <div className="flex flex-wrap items-start gap-2">
                    <CharacterInlineStacked name="Rhona" deco={decoration} />
                    <CharacterInlineStacked name="Hanbyul Lee" />
                    <CharacterInlineStacked name="Alice" deco={decoration} />
                    <CharacterInlineStacked name="Saeran" deco={decoration} />
                    <CharacterInlineStacked name="Mero" />
                    <CharacterInlineStacked name="Leo" deco={decoration} />
                    <CharacterInlineStacked name="Christina" />
                    <CharacterInlineStacked name="Edelweiss" />
                    <CharacterInlineStacked name="Vlada" />
                    <CharacterInlineStacked name="Bryn" />
                </div>
                <p className="">Niche usage</p>
            </div>
            {/* Collection */}
            <div className="flex items-center gap-x-4 mt-4">
                <div className="flex flex-wrap items-start gap-2">
                    <CharacterInlineStacked name="Francesca" deco={decoration} />
                    <CharacterInlineStacked name="Eliza" deco={decoration} />
                </div>
                <p className="">For collection only.</p>
            </div>
        </div>
    )
}
