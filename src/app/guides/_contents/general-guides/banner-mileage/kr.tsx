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
        label: '커스텀 픽업',
        badgeImg: 'CM_Recruit_Tag_PickUp',
        badgePosition: '-top-4 -right-4',
        content: (
            <div className="space-y-6">
                <GuideHeading>커스텀 픽업 모집</GuideHeading>

                <BannerRates
                    rates={[
                        { stars: 3, rate: 2.5 },
                        { stars: 2, rate: 19 },
                        { stars: 1, rate: 78.5 },
                    ]}
                    specialFeature="10연 모집 시 2★ 이상 영웅 1체 이상 확정"
                    freePull={true}
                />

                <div>
                    <p className="text-gray-200 mb-3">
                        이 배너는 상시 운영됩니다. 최대 3명의 캐릭터를 선택하여 픽업 대상으로 지정할 수 있습니다.
                    </p>
                    <div className="bg-neutral-800/30 border border-neutral-700/50 rounded-lg p-3">
                        <p className="text-sm text-gray-300">
                            <span className="font-semibold text-yellow-400">예시:</span> <CharacterLinkCard name="Alice" />, <CharacterLinkCard name="Eliza" />, <CharacterLinkCard name="Francesca" />를 선택하면 이 3명 외에는 3{star}가 배출되지 않습니다.
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
                    warning="이 배너에서 에테르 사용은 권장되지 않습니다"
                />

                <MileageInfo mileageItem="Custom Mileage" cost={200} />
            </div>
        )
    },
    {
        key: 'new',
        image: 'CM_Btn_Recruit_PickUp_03',
        label: '픽업 모집',
        badgeImg: 'CM_Recruit_Tag_New',
        badgePosition: '-top-4 -right-4',
        content: (
            <div className="space-y-6">
                <GuideHeading>픽업 모집</GuideHeading>

                <BannerRates
                    rates={[
                        { stars: 3, rate: 1.25, label: 'focus' },
                        { stars: 3, rate: 1.25, label: 'non-focus' },
                        { stars: 2, rate: 19 },
                        { stars: 1, rate: 78.5 },
                    ]}
                    specialFeature="10연 모집 시 2★ 이상 영웅 1체 이상 확정"
                />

                <div className="bg-neutral-800/30 border border-neutral-700/50 rounded-lg p-3">
                    <p className="text-sm text-gray-300">
                        이 배너는 기간 한정으로, 보통 <span className="font-semibold text-yellow-400">2주간</span> 운영됩니다.
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
                    warning="이 배너에서 에테르 사용은 권장되지 않습니다"
                />

                <MileageInfo mileageItem="Mileage" cost={200} />
            </div>
        ),
    },
    {
        key: 'premium',
        image: 'CM_Btn_Recruit_Special',
        label: '프리미엄 모집',
        badgeImg: 'CM_Recruit_Tag_Premium',
        badgePosition: '-top-4 -right-4',
        content: (
            <div className="space-y-6">
                <GuideHeading>프리미엄 모집</GuideHeading>

                <BannerRates
                    rates={[
                        { stars: 3, rate: 1.25, label: 'focus' },
                        {
                            stars: 3,
                            rate: 2.5,
                            label: 'non-focus',
                            subtext: '데미우르고스 영웅의 배출 확률은 일반 비픽업 3★의 약 절반입니다'
                        },
                        { stars: 2, rate: 19 },
                        { stars: 1, rate: 77.25 },
                    ]}
                    freePull={true}
                />

                <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-3">
                    <p className="text-sm text-purple-200">
                        <span className="font-semibold">상시 배너</span> - 데미우르고스 영웅을 획득할 수 있는 유일한 일반적인 방법입니다 (데미우르고스 계약 등의 이벤트 제외).
                    </p>
                    <p className="text-xs text-purple-300 mt-2">
                        이 영웅들은 매우 강력하지만 배출 확률도 매우 낮습니다. 데미우르고스 영웅은 초월의 효과가 크지만, 기본 3{star}에서도 강력한 영웅들이 있습니다.
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
        label: '한정 모집',
        badgeImg: 'CM_Recruit_Tag_Seasonal',
        badgePosition: '-top-1 right-0 ',
        content: (
            <div className="space-y-6">
                <GuideHeading>한정 모집</GuideHeading>

                <BannerRates
                    rates={[
                        { stars: 3, rate: 1.25, label: 'focus' },
                        { stars: 3, rate: 1.25, label: 'non-focus' },
                        { stars: 2, rate: 19 },
                        { stars: 1, rate: 78.5 },
                    ]}
                    specialFeature="10연 모집 시 2★ 이상 영웅 1체 이상 확정"
                />

                <div className="space-y-3">
                    <div className="bg-pink-900/20 border border-pink-700/50 rounded-lg p-3">
                        <p className="text-sm text-pink-200 mb-3">
                            <span className="font-semibold">기간 한정 배너</span> - 한정 영웅을 획득할 수 있는 유일한 방법입니다.
                        </p>
                        <div className="space-y-2 text-xs">
                            <div className="flex items-start gap-2">
                                <span className="font-semibold text-pink-400 min-w-[70px]">한정:</span>
                                <span className="text-pink-200">기간 한정 일반 영웅</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="font-semibold text-green-400 min-w-[70px]">시즌:</span>
                                <span className="text-pink-200">할로윈, 크리스마스 등 시즌 이벤트 관련 영웅</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="font-semibold text-red-400 min-w-[70px]">콜라보:</span>
                                <span className="text-pink-200">다른 작품과의 콜라보 영웅. 복각 가능성이 가장 낮음</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-neutral-800/30 border border-neutral-700/50 rounded-lg p-3">
                        <p className="text-xs text-gray-300">
                            이 배너는 보통 <span className="font-semibold text-yellow-400">2~4주간</span> 운영됩니다. 데미우르고스 영웅과 마찬가지로, 한정 영웅은 (대체로) 매우 강력하며, 높은 초월 단계에서 가장 강력한 능력이 해금됩니다.
                        </p>
                    </div>
                </div>

                <div>
                    <p className="text-sm font-semibold text-yellow-400 mb-2">한정 영웅 목록 및 출시일:</p>
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
                            note: '이 아이템은 존재하지만 아직 사용된 적 없음'
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
                대부분의 가챠 게임처럼, Outerplane에는 여러 배너를 가진 모집 시스템이 있으며,
                각 배너는 서로 다른 재화를 사용합니다.
                이 가이드에서는 배너와 마일리지 시스템의 작동 방식을 설명합니다.
            </p>

            <p>
                Outerplane은 <span className="text-yellow-400 underline">마일리지 시스템</span>을 사용합니다.
                천장 카운터와 달리, 마일리지는 필요한 포인트를 모으면
                <strong> 픽업 영웅을 직접 획득</strong>할 수 있습니다.
            </p>

            <p>
                각 모집<strong>(이벤트 티켓 제외)</strong>마다 마일리지가 1 적립됩니다.
                필요 수량에 도달하면 마일리지를 배너 영웅과 교환할 수 있습니다.
            </p>

            <p>
                이 시스템의 큰 장점은 <strong>마일리지가 배너 간에 유지</strong>된다는 것입니다.<br />
                이것이 유용한 이유는?<br />
                10연 모집에서 영웅을 획득하고 동시에 마일리지 상한에 도달했다고 가정해 봅시다.
                수집 목적으로 뽑고 있다면, <strong>마일리지를 저장</strong>해서
                더 관심 있는 영웅의 미래 배너에 사용하거나, 다음 목표를 더 효율적으로 확보할 수 있습니다.
            </p>



            <BannerTabCards tabs={bannerTabs} imagePath="/images/guides/general-guides/banner/" />
        </div>
    );
}
