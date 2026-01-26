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
        label: '自选UP',
        badgeImg: 'CM_Recruit_Tag_PickUp',
        badgePosition: '-top-4 -right-4',
        content: (
            <div className="space-y-6">
                <GuideHeading>自选UP招募</GuideHeading>

                <BannerRates
                    rates={[
                        { stars: 3, rate: 2.5 },
                        { stars: 2, rate: 19 },
                        { stars: 1, rate: 78.5 },
                    ]}
                    specialFeature="10连招募保底至少1个2★以上英雄"
                    freePull={true}
                />

                <div>
                    <p className="text-gray-200 mb-3">
                        此卡池常驻开放。你可以选择最多3个角色作为UP目标。
                    </p>
                    <div className="bg-neutral-800/30 border border-neutral-700/50 rounded-lg p-3">
                        <p className="text-sm text-gray-300">
                            <span className="font-semibold text-yellow-400">例如：</span> 选择<CharacterLinkCard name="Alice" />、<CharacterLinkCard name="Eliza" />和<CharacterLinkCard name="Francesca" />后，3{star}只会出这3个角色。
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
                    warning="不建议在此卡池使用以太"
                />

                <MileageInfo mileageItem="Custom Mileage" cost={200} />
            </div>
        )
    },
    {
        key: 'new',
        image: 'CM_Btn_Recruit_PickUp_03',
        label: 'UP招募',
        badgeImg: 'CM_Recruit_Tag_New',
        badgePosition: '-top-4 -right-4',
        content: (
            <div className="space-y-6">
                <GuideHeading>UP招募</GuideHeading>

                <BannerRates
                    rates={[
                        { stars: 3, rate: 1.25, label: 'focus' },
                        { stars: 3, rate: 1.25, label: 'non-focus' },
                        { stars: 2, rate: 19 },
                        { stars: 1, rate: 78.5 },
                    ]}
                    specialFeature="10连招募保底至少1个2★以上英雄"
                />

                <div className="bg-neutral-800/30 border border-neutral-700/50 rounded-lg p-3">
                    <p className="text-sm text-gray-300">
                        此卡池为限时开放，通常持续<span className="font-semibold text-yellow-400">2周</span>。
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
                    warning="不建议在此卡池使用以太"
                />

                <MileageInfo mileageItem="Mileage" cost={200} />
            </div>
        ),
    },
    {
        key: 'premium',
        image: 'CM_Btn_Recruit_Special',
        label: '精选招募',
        badgeImg: 'CM_Recruit_Tag_Premium',
        badgePosition: '-top-4 -right-4',
        content: (
            <div className="space-y-6">
                <GuideHeading>精选招募</GuideHeading>

                <BannerRates
                    rates={[
                        { stars: 3, rate: 1.25, label: 'focus' },
                        {
                            stars: 3,
                            rate: 2.5,
                            label: 'non-focus',
                            subtext: '创世之神同伴的掉率约为普通非UP 3★同伴的一半'
                        },
                        { stars: 2, rate: 19 },
                        { stars: 1, rate: 77.25 },
                    ]}
                    freePull={true}
                />

                <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-3">
                    <p className="text-sm text-purple-200">
                        <span className="font-semibold">常驻卡池</span> - 是获取创世之神同伴的唯一常规途径（除创世之神契约等活动外）。
                    </p>
                    <p className="text-xs text-purple-300 mt-2">
                        这些同伴非常强力但掉率极低：她们的超越获益更多，部分在基础3{star}时就很强。
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
        label: '限定招募',
        badgeImg: 'CM_Recruit_Tag_Seasonal',
        badgePosition: '-top-1 right-0 ',
        content: (
            <div className="space-y-6">
                <GuideHeading>限定招募</GuideHeading>

                <BannerRates
                    rates={[
                        { stars: 3, rate: 1.25, label: 'focus' },
                        { stars: 3, rate: 1.25, label: 'non-focus' },
                        { stars: 2, rate: 19 },
                        { stars: 1, rate: 78.5 },
                    ]}
                    specialFeature="10连招募保底至少1个2★以上英雄"
                />

                <div className="space-y-3">
                    <div className="bg-pink-900/20 border border-pink-700/50 rounded-lg p-3">
                        <p className="text-sm text-pink-200 mb-3">
                            <span className="font-semibold">限时卡池</span> - 是获取限定同伴的唯一途径。
                        </p>
                        <div className="space-y-2 text-xs">
                            <div className="flex items-start gap-2">
                                <span className="font-semibold text-pink-400 min-w-[70px]">限定:</span>
                                <span className="text-pink-200">常规限时同伴</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="font-semibold text-green-400 min-w-[70px]">季节：</span>
                                <span className="text-pink-200">与万圣节、圣诞节等年度活动相关的同伴</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="font-semibold text-red-400 min-w-[70px]">联动:</span>
                                <span className="text-pink-200">与其他作品联动的同伴，复刻可能性最低</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-neutral-800/30 border border-neutral-700/50 rounded-lg p-3">
                        <p className="text-xs text-gray-300">
                            此卡池通常持续<span className="font-semibold text-yellow-400">2至4周</span>。与创世之神同伴类似，限定同伴（通常）非常强力。其最强能力在最高超越等级解锁。
                        </p>
                    </div>
                </div>

                <div>
                    <p className="text-sm font-semibold text-yellow-400 mb-2">限定列表列表及发布日期:</p>
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
                            note: '此道具存在但尚未使用过'
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
                与大多数抽卡游戏一样，异域战记拥有多个卡池的招募系统，
                每个卡池使用不同的资源。
                本指南将介绍卡池和指定招募系统的运作方式。
            </p>

            <p>
                Outerplane采用<span className="text-yellow-400 underline">指定招募系统</span>。
                与保底计数不同，指定招募允许你在积累足够点数后
                <strong>直接获取</strong>UP同伴。
            </p>

            <p>
                每次招募<strong>（活动券除外）</strong>可获得1点点数。
                达到所需数量后，可指定招募卡池同伴。
            </p>

            <p>
                此系统的一大优势是<strong>点数在卡池间保留</strong>。<br />
                这有什么用？<br />
                假设您满足指定招募的最后10连抽到了同伴。
                如果是为了收集，便可以<strong>保留点数</strong>
                用于未来更感兴趣的同伴卡池，高效地保证下一个目标。
            </p>



            <BannerTabCards tabs={bannerTabs} imagePath="/images/guides/general-guides/banner/" />
        </div>
    );
}
