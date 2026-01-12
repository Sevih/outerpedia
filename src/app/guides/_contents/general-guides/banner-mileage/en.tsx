import GuideHeading from '@/app/components/GuideHeading';
import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import BannerTabCards, { BannerTab } from '@/app/components/CardTabs';
import LimitedHeroesList from '@/app/components/LimitedHeroesList';
import Image from 'next/image';
import BannerRates from '@/app/components/guides/BannerRates';
import BannerRewards from '@/app/components/guides/BannerRewards';
import BannerResources from '@/app/components/guides/BannerResources';
import MileageInfo from '@/app/components/guides/MileageInfo';

const star = <span className={`relative align-middle inline-flex w-[15px] h-[15px]`}>
    <Image
        src={`/images/ui/CM_icon_star_y.webp`}
        alt="badge"
        width={15}
        height={15}
        style={{ width: 15, height: 15 }}
        className="object-contain"
    />
</span>;


const bannerTabs: BannerTab[] = [
    {
        key: 'pickup',
        image: 'CM_Btn_Recruit_Custom',
        label: 'Custom Rate Up',
        badgeImg: 'CM_Recruit_Tag_PickUp',
        badgePosition: '-top-4 -right-4',
        content: (
            <div className="space-y-6">
                <GuideHeading>Custom Rate Up Banner</GuideHeading>

                <BannerRates
                    rates={[
                        { stars: 3, rate: 2.5 },
                        { stars: 2, rate: 19 },
                        { stars: 1, rate: 78.5 },
                    ]}
                    specialFeature="Using Recruit x 10 guarantees at least one 2★ hero"
                    freePull={true}
                />

                <div>
                    <p className="text-gray-200 mb-3">
                        This banner is always available. You can choose up to 3 characters to force the drop rate of those.
                    </p>
                    <div className="bg-neutral-800/30 border border-neutral-700/50 rounded-lg p-3">
                        <p className="text-sm text-gray-300">
                            <span className="font-semibold text-yellow-400">Example:</span> If you select{' '}
                            <CharacterLinkCard name="Alice" />, <CharacterLinkCard name="Eliza" /> and{' '}
                            <CharacterLinkCard name="Francesca" />, you can&apos;t drop another 3{star} except for those 3.
                        </p>
                    </div>
                </div>

                <BannerRewards
                    rewards={[
                        { stars: 1, wildcard: 0, heroPiece: 5 },
                        { stars: 2, wildcard: 1, heroPiece: 10 },
                        { stars: 3, wildcard: 15, heroPiece: 150 },
                    ]}
                />

                <BannerResources
                    resources={[
                        {
                            items: 'Special Recruitment Ticket (Event)',
                            cost: 1,
                            mileageItem: null,
                        },
                        {
                            items: 'Special Recruitment Ticket',
                            cost: 1,
                            mileageItem: 'Custom Mileage',
                        },
                        {
                            items: ['Free Ether', 'Ether'],
                            cost: 150,
                            mileageItem: 'Custom Mileage',
                        },
                    ]}
                    warning="It's not recommended to use Ether on this banner"
                />

                <MileageInfo mileageItem="Custom Mileage" cost={200} />
            </div>
        )
    },
    {
        key: 'new',
        image: 'CM_Btn_Recruit_PickUp_03',
        label: 'Rate Up Banner',
        badgeImg: 'CM_Recruit_Tag_New',
        badgePosition: '-top-4 -right-4',
        content: (
            <div className="space-y-6">
                <GuideHeading>Rate Up Banner</GuideHeading>

                <BannerRates
                    rates={[
                        { stars: 3, rate: 1.25, label: 'focus' },
                        { stars: 3, rate: 1.25, label: 'non-focus' },
                        { stars: 2, rate: 19 },
                        { stars: 1, rate: 78.5 },
                    ]}
                    specialFeature="Using Recruit x 10 guarantees at least one 2★ hero"
                />

                <div className="bg-neutral-800/30 border border-neutral-700/50 rounded-lg p-3">
                    <p className="text-sm text-gray-300">
                        This banner is temporary and usually lasts <span className="font-semibold text-yellow-400">2 weeks</span>.
                    </p>
                </div>

                <BannerRewards
                    rewards={[
                        { stars: 1, wildcard: 0, heroPiece: 5 },
                        { stars: 2, wildcard: 1, heroPiece: 10 },
                        { stars: 3, wildcard: 15, heroPiece: 150 },
                    ]}
                />

                <BannerResources
                    resources={[
                        {
                            items: 'Special Recruitment Ticket (Event)',
                            cost: 1,
                            mileageItem: null,
                        },
                        {
                            items: 'Special Recruitment Ticket',
                            cost: 1,
                            mileageItem: 'Mileage',
                        },
                        {
                            items: ['Free Ether', 'Ether'],
                            cost: 150,
                            mileageItem: 'Mileage',
                        },
                    ]}
                    warning="It's not recommended to use Ether on this banner"
                />

                <MileageInfo mileageItem="Mileage" cost={200} />
            </div>
        ),
    },
    {
        key: 'premium',
        image: 'CM_Btn_Recruit_Special',
        label: 'Premium Banner',
        badgeImg: 'CM_Recruit_Tag_Premium',
        badgePosition: '-top-4 -right-4',
        content: (
            <div className="space-y-6">
                <GuideHeading>Premium Banner</GuideHeading>

                <BannerRates
                    rates={[
                        { stars: 3, rate: 1.25, label: 'focus' },
                        {
                            stars: 3,
                            rate: 2.5,
                            label: 'non-focus',
                            subtext: 'Demiurge heroes have about half the drop rate of regular off-banner heroes'
                        },
                        { stars: 2, rate: 19 },
                        { stars: 1, rate: 77.25 },
                    ]}
                    freePull={true}
                />

                <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-3">
                    <p className="text-sm text-purple-200">
                        <span className="font-semibold">Permanent banner</span> - The only regular way (besides events like Demiurge Contract) to get Demiurge Heroes.
                    </p>
                    <p className="text-xs text-purple-300 mt-2">
                        These heroes are extremely powerful but also very rare. Demiurge heroes benefit more from transcendence overall, but some are strong right from base 3{star}.
                    </p>
                </div>

                <BannerRewards
                    rewards={[
                        { stars: 1, wildcard: 0, heroPiece: 5 },
                        { stars: 2, wildcard: 1, heroPiece: 10 },
                        { stars: 3, wildcard: 15, heroPiece: 150 },
                    ]}
                />

                <BannerResources
                    resources={[
                        {
                            items: 'Call of the Demiurge (Event)',
                            cost: 10,
                            mileageItem: null,
                        },
                        {
                            items: 'Call of the Demiurge',
                            cost: 10,
                            mileageItem: "False God's Proof",
                        },
                        {
                            items: ['Free Ether', 'Ether'],
                            cost: 225,
                            mileageItem: "False God's Proof",
                        },
                    ]}
                />

                <MileageInfo mileageItem="False God's Proof" cost={200} />
            </div>
        ),
    },
    {
        key: 'fes',
        image: 'CM_Btn_Recruit_Seasonal',
        label: 'Limited Banner',
        badgeImg: 'CM_Recruit_Tag_Seasonal',
        badgePosition: '-top-1 right-0 ',
        content: (
            <div className="space-y-6">
                <GuideHeading>Limited Banner</GuideHeading>

                <BannerRates
                    rates={[
                        { stars: 3, rate: 1.25, label: 'focus' },
                        { stars: 3, rate: 1.25, label: 'non-focus' },
                        { stars: 2, rate: 19 },
                        { stars: 1, rate: 78.5 },
                    ]}
                    specialFeature="Using Recruit x 10 guarantees at least one 2★ hero"
                />

                <div className="space-y-3">
                    <div className="bg-pink-900/20 border border-pink-700/50 rounded-lg p-3">
                        <p className="text-sm text-pink-200 mb-3">
                            <span className="font-semibold">Temporary banner</span> - The only way to obtain Limited Heroes.
                        </p>
                        <div className="space-y-2 text-xs">
                            <div className="flex items-start gap-2">
                                <span className="font-semibold text-pink-400 min-w-[70px]">Limited:</span>
                                <span className="text-pink-200">Classic time-limited heroes</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="font-semibold text-green-400 min-w-[70px]">Seasonal:</span>
                                <span className="text-pink-200">Heroes tied to yearly events like Halloween or Christmas</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="font-semibold text-red-400 min-w-[70px]">Collab:</span>
                                <span className="text-pink-200">Heroes from crossovers with other licenses (least likely to return)</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-neutral-800/30 border border-neutral-700/50 rounded-lg p-3">
                        <p className="text-xs text-gray-300">
                            This banner typically runs for <span className="font-semibold text-yellow-400">2 to 4 weeks</span>. Like Demiurge heroes, Limited units are (usually) extremely powerful, with their strongest abilities unlocking at high transcendence levels.
                        </p>
                    </div>
                </div>

                <div>
                    <p className="text-sm font-semibold text-yellow-400 mb-2">List of Limited Heroes and their release dates:</p>
                    <LimitedHeroesList />
                </div>

                <BannerRewards
                    rewards={[
                        { stars: 1, wildcard: 0, heroPiece: 5 },
                        { stars: 2, wildcard: 1, heroPiece: 10 },
                        { stars: 3, wildcard: 15, heroPiece: 150 },
                    ]}
                />

                <BannerResources
                    resources={[
                        {
                            items: 'Limited Recruitment Ticket (Event)',
                            cost: 1,
                            mileageItem: null,
                            note: 'This item exists but hasn\'t been used yet'
                        },
                        {
                            items: 'Limited Recruitment Ticket',
                            cost: 1,
                            mileageItem: 'Limited Mileage',
                        },
                        {
                            items: ['Free Ether', 'Ether'],
                            cost: 150,
                            mileageItem: 'Limited Mileage',
                        },
                    ]}
                />

                <MileageInfo mileageItem="Limited Mileage" cost={150} />
            </div>
        ),

    },


];

export default function BannerAndMileageGuide() {
    return (
        <div className="space-y-6">
            <p>
                Like most gacha games, Outerplane features a recruitment system with multiple banners,
                each using different types of resources.
                This guide explains how banners and the mileage system work in Outerplane.
            </p>

            <p>
                Outerplane uses a <span className="text-yellow-400 underline">mileage system</span>.
                Unlike pity counters, mileage allows you to
                <strong> directly obtain</strong> the featured unit once you&apos;ve gathered enough points.
            </p>

            <p>
                Each recruit <strong>(except those using event tickets)</strong> grants 1 mileage.
                Once you reach the required amount, you can exchange your mileage for the banner unit.
            </p>

            <p>
                One major advantage of this system is that <strong>mileage is retained</strong> across banners.<br />
                Why is that useful?<br />
                Imagine you do a 10-recruit, get the unit, and also hit the mileage cap.
                If you&apos;re pulling for collection, you can <strong>save your mileage</strong> for a future banner
                with a unit you&apos;re more interested in — or just keep it to secure your next target more efficiently.
            </p>



            <BannerTabCards tabs={bannerTabs} imagePath="/images/guides/general-guides/banner/" />
        </div>
    );
}
