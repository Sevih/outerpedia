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
        label: 'カスタムピックアップ',
        badgeImg: 'CM_Recruit_Tag_PickUp',
        badgePosition: '-top-4 -right-4',
        content: (
            <div className="space-y-6">
                <GuideHeading>カスタムピックアップ募集</GuideHeading>

                <BannerRates
                    rates={[
                        { stars: 3, rate: 2.5 },
                        { stars: 2, rate: 19 },
                        { stars: 1, rate: 78.5 },
                    ]}
                    specialFeature="10連募集で2★以上のヒーローが1体以上確定"
                    freePull={true}
                />

                <div>
                    <p className="text-gray-200 mb-3">
                        このバナーは常設です。最大3体のキャラクターを選択してピックアップ対象にできます。
                    </p>
                    <div className="bg-neutral-800/30 border border-neutral-700/50 rounded-lg p-3">
                        <p className="text-sm text-gray-300">
                            <span className="font-semibold text-yellow-400">例：</span> <CharacterLinkCard name="Alice" />、<CharacterLinkCard name="Eliza" />、<CharacterLinkCard name="Francesca" />を選択すると、3{star}はこの3体以外排出されません。
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
                    warning="このバナーでエーテルを使用することは推奨されません"
                />

                <MileageInfo mileageItem="Custom Mileage" cost={200} />
            </div>
        )
    },
    {
        key: 'new',
        image: 'CM_Btn_Recruit_PickUp_03',
        label: 'ピックアップ募集',
        badgeImg: 'CM_Recruit_Tag_New',
        badgePosition: '-top-4 -right-4',
        content: (
            <div className="space-y-6">
                <GuideHeading>ピックアップ募集</GuideHeading>

                <BannerRates
                    rates={[
                        { stars: 3, rate: 1.25, label: 'focus' },
                        { stars: 3, rate: 1.25, label: 'non-focus' },
                        { stars: 2, rate: 19 },
                        { stars: 1, rate: 78.5 },
                    ]}
                    specialFeature="10連募集で2★以上のヒーローが1体以上確定"
                />

                <div className="bg-neutral-800/30 border border-neutral-700/50 rounded-lg p-3">
                    <p className="text-sm text-gray-300">
                        このバナーは期間限定で、通常<span className="font-semibold text-yellow-400">2週間</span>開催されます。
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
                    warning="このバナーでエーテルを使用することは推奨されません"
                />

                <MileageInfo mileageItem="Mileage" cost={200} />
            </div>
        ),
    },
    {
        key: 'premium',
        image: 'CM_Btn_Recruit_Special',
        label: 'プレミアム募集',
        badgeImg: 'CM_Recruit_Tag_Premium',
        badgePosition: '-top-4 -right-4',
        content: (
            <div className="space-y-6">
                <GuideHeading>プレミアム募集</GuideHeading>

                <BannerRates
                    rates={[
                        { stars: 3, rate: 1.25, label: 'focus' },
                        {
                            stars: 3,
                            rate: 2.5,
                            label: 'non-focus',
                            subtext: 'デミウルゴスヒーローの排出率は通常の3★の約半分です'
                        },
                        { stars: 2, rate: 19 },
                        { stars: 1, rate: 77.25 },
                    ]}
                    freePull={true}
                />

                <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-3">
                    <p className="text-sm text-purple-200">
                        <span className="font-semibold">常設バナー</span> - デミウルゴスヒーローを獲得できる唯一の通常手段です（デミウルゴス契約などのイベントを除く）。
                    </p>
                    <p className="text-xs text-purple-300 mt-2">
                        これらのヒーローは非常に強力ですが、排出率も非常に低いです。デミウルゴスヒーローは超越の恩恵が大きいですが、3{star}の状態でも強力なヒーローもいます。
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
        label: '限定募集',
        badgeImg: 'CM_Recruit_Tag_Seasonal',
        badgePosition: '-top-1 right-0 ',
        content: (
            <div className="space-y-6">
                <GuideHeading>限定募集</GuideHeading>

                <BannerRates
                    rates={[
                        { stars: 3, rate: 1.25, label: 'focus' },
                        { stars: 3, rate: 1.25, label: 'non-focus' },
                        { stars: 2, rate: 19 },
                        { stars: 1, rate: 78.5 },
                    ]}
                    specialFeature="10連募集で2★以上のヒーローが1体以上確定"
                />

                <div className="space-y-3">
                    <div className="bg-pink-900/20 border border-pink-700/50 rounded-lg p-3">
                        <p className="text-sm text-pink-200 mb-3">
                            <span className="font-semibold">期間限定バナー</span> - 限定ヒーローを獲得できる唯一の手段です。
                        </p>
                        <div className="space-y-2 text-xs">
                            <div className="flex items-start gap-2">
                                <span className="font-semibold text-pink-400 min-w-[70px]">限定:</span>
                                <span className="text-pink-200">期間限定の通常ヒーロー</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="font-semibold text-green-400 min-w-[70px]">シーズン:</span>
                                <span className="text-pink-200">ハロウィンやクリスマスなどの季節イベントに関連するヒーロー</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="font-semibold text-red-400 min-w-[70px]">コラボ:</span>
                                <span className="text-pink-200">他作品とのコラボヒーロー。復刻の可能性が最も低い</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-neutral-800/30 border border-neutral-700/50 rounded-lg p-3">
                        <p className="text-xs text-gray-300">
                            このバナーは通常<span className="font-semibold text-yellow-400">2〜4週間</span>開催されます。デミウルゴスヒーローと同様に、限定ヒーローは（通常）非常に強力で、高い超越レベルで最強の能力が解放されます。
                        </p>
                    </div>
                </div>

                <div>
                    <p className="text-sm font-semibold text-yellow-400 mb-2">限定ヒーロー一覧とリリース日:</p>
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
                            note: 'このアイテムは存在しますがまだ使用されていません'
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
                多くのガチャゲームと同様に、Outerplaneには複数のバナーを持つ募集システムがあり、
                それぞれ異なるリソースを使用します。
                このガイドでは、バナーとマイレージシステムの仕組みを説明します。
            </p>

            <p>
                Outerplaneは<span className="text-yellow-400 underline">マイレージシステム</span>を採用しています。
                天井カウンターとは異なり、マイレージは必要なポイントを集めると
                <strong>ピックアップヒーローを直接獲得</strong>できます。
            </p>

            <p>
                各募集<strong>（イベントチケットを除く）</strong>でマイレージが1加算されます。
                必要数に達すると、マイレージをバナーヒーローと交換できます。
            </p>

            <p>
                このシステムの大きな利点は、<strong>マイレージがバナー間で引き継がれる</strong>ことです。<br />
                これが便利な理由は？<br />
                10連募集でヒーローを獲得し、同時にマイレージ上限に達したとします。
                コレクション目的で引いている場合、<strong>マイレージを温存</strong>して
                より興味のあるヒーローの将来のバナーに使用したり、次の目標をより効率的に確保できます。
            </p>



            <BannerTabCards tabs={bannerTabs} imagePath="/images/guides/general-guides/banner/" />
        </div>
    );
}
