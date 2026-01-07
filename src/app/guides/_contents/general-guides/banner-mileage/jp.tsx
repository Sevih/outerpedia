import GuideHeading from '@/app/components/GuideHeading';
import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import BannerTabCards, { BannerTab } from '@/app/components/CardTabs';
import GuideIconInline from '@/app/components/GuideIconInline';
import LimitedHeroesList from '@/app/components/LimitedHeroesList';
import Image from 'next/image';


const decoration = "text-yellow-400 underline";
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
            <div>
                <GuideHeading>カスタムピックアップ募集</GuideHeading>
                <p>3{star}排出率：2.5%</p>
                <p>2{star}排出率：19%</p>
                <p>1{star}排出率：78.5%</p>
                <p className="mt-4"><span className={decoration}>特徴</span>：10連募集で2{star}以上のヒーローが1体以上確定。</p>
                <p className='mt-4'><span className={decoration}>1日1回無料募集</span></p>
                <p className='mt-4'>既に所持しているヒーローを引いた場合：</p>
                <ul>
                    <li><span className={decoration}><GuideIconInline name="GC_Item_Piece" text='汎用ピース' /></span>：2{star}で1個、3{star}で15個</li>
                    <li><span className={decoration}><GuideIconInline name="CM_Piece_Frame" text='ヒーローピース' /></span>：1{star}で5個、2{star}で10個、3{star}で150個</li>
                </ul>

                <p className='mt-2'>
                    このバナーは常設です。<br />最大3体のキャラクターを選択してピックアップ対象にできます。<br />例えば
                    <CharacterLinkCard name="Alice" />、<CharacterLinkCard name="Eliza" />、<CharacterLinkCard name="Francesca" />を選択すると、3{star}はこの3体以外排出されません。</p>
                <p className='mt-4'>
                    使用できるリソースは3種類：</p>
                <ul>
                    <li>
                        <span className={decoration}><GuideIconInline name="TI_Item_Ticket_Recruit_04" text='特別募集チケット（イベント）' /></span>：1枚で1回募集、マイレージ加算なし
                    </li>
                    <li>
                        <span className={decoration}><GuideIconInline name="TI_Item_Ticket_Recruit_02" text='特別募集チケット' /></span>：1枚で1回募集、<GuideIconInline name="CM_Icon_Recruit_Mileage_Element" text='カスタムマイレージ' size={25} />が1加算
                    </li>
                    <li>
                        <span className={decoration}><GuideIconInline name="TI_Item_Cristal_Cash" text='エーテル' /></span>：150で1回募集、<GuideIconInline name="CM_Icon_Recruit_Mileage_Element" text='カスタムマイレージ' size={25} />が1加算
                    </li>
                </ul>

                <p className='mt-4'>
                    このバナーで<GuideIconInline name="TI_Item_Cristal_Cash" text='エーテル' />を使用することは推奨されません
                </p>
                <p className='mt-4'>
                    <GuideIconInline name="CM_Icon_Recruit_Mileage_Element" text='カスタムマイレージ' size={25} />は使用するまで保持されます。
                </p>
                <p className='mt-4'>
                    <GuideIconInline name="CM_Icon_Recruit_Mileage_Element" text='カスタムマイレージ' size={25} />を200貯めると、ピックアップヒーローを獲得、または<GuideIconInline name="CM_Piece_Frame" text='ヒーローピース' />150個と交換できます。<br />
                    既に所持している場合は<GuideIconInline name="GC_Item_Piece" text='汎用ピース' />15個が追加で獲得できます。
                </p>
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
            <div>
                <GuideHeading>ピックアップ募集</GuideHeading>
                <p>3{star}ピックアップ排出率：1.25%</p>
                <p>3{star}その他排出率：1.25%</p>
                <p>2{star}排出率：19%</p>
                <p>1{star}排出率：78.5%</p>
                <p className="mt-4"><span className={decoration}>特徴</span>：10連募集で2{star}以上のヒーローが1体以上確定。</p>
                <p className="mt-4">
                    重複時の獲得：</p>
                <ul>
                    <li><span className={decoration}><GuideIconInline name="GC_Item_Piece" text="汎用ピース" /></span>：2{star}で1個、3{star}で15個</li>
                    <li><span className={decoration}><GuideIconInline name="CM_Piece_Frame" text="ヒーローピース" /></span>：1{star}で5個、2{star}で10個、3{star}で50個（バナーヒーローの場合は150個）</li>
                </ul>

                <p className="mt-2">
                    このバナーは期間限定で、通常2週間開催されます。
                </p>
                <p className="mt-4">
                    使用できるリソースは3種類：</p>
                <ul>
                    <li><span className={decoration}><GuideIconInline name="TI_Item_Ticket_Recruit_04" text="特別募集チケット（イベント）" /></span>：1枚で1回募集、マイレージ加算なし</li>
                    <li><span className={decoration}><GuideIconInline name="TI_Item_Ticket_Recruit_02" text="特別募集チケット" /></span>：1枚で1回募集、<GuideIconInline name="CM_Icon_Recruit_Mileage" text="マイレージ" size={25} />が1加算</li>
                    <li><span className={decoration}><GuideIconInline name="TI_Item_Cristal_Cash" text="エーテル" /></span>：150で1回募集、<GuideIconInline name="CM_Icon_Recruit_Mileage" text="マイレージ" size={25} />が1加算</li>
                </ul>

                <p className='mt-4'>
                    このバナーで<GuideIconInline name="TI_Item_Cristal_Cash" text='エーテル' />を使用することは推奨されません
                </p>
                <p className="mt-4"><GuideIconInline name="CM_Icon_Recruit_Mileage" text="マイレージ" size={25} />は使用するまで保持されます。</p>
                <p className="mt-4">
                    <GuideIconInline name="CM_Icon_Recruit_Mileage" text="マイレージ" size={25} />を200貯めると、ピックアップヒーローを獲得、または<GuideIconInline name="CM_Piece_Frame" text="ヒーローピース" />150個と交換できます。<br />
                    既に所持している場合は<GuideIconInline name="GC_Item_Piece" text="汎用ピース" />15個が追加で獲得できます。
                </p>

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
            <div>
                <GuideHeading>プレミアム募集</GuideHeading>
                <p>3{star}ピックアップ排出率：1.25%</p>
                <p>3{star}その他排出率：2.5%</p>
                <p className="ml-10 text-gray-400">デミウルゴスヒーローの排出率は通常の3{star}の約半分です</p>
                <p>2{star}排出率：19%</p>
                <p>1{star}排出率：77.25%</p>
                <p className="mt-4"><span className={decoration}>1日1回無料募集</span></p>
                <p className="mt-4">
                    重複時の獲得：
                </p>
                <ul>
                    <li><span className={decoration}><GuideIconInline name="GC_Item_Piece" text="汎用ピース" /></span>：2{star}で1個、3{star}で15個</li>
                    <li><span className={decoration}><GuideIconInline name="CM_Piece_Frame" text="ヒーローピース" /></span>：1{star}で5個、2{star}で10個、3{star}で50個（バナーヒーローの場合は150個）</li>
                </ul>

                <p className="mt-2">
                    これは常設バナーで、デミウルゴスヒーローを獲得できる唯一の通常手段です（デミウルゴス契約などのイベントを除く）。<br />
                    これらのヒーローは非常に強力ですが、排出率も非常に低いです。デミウルゴスヒーローは超越の恩恵が大きいですが、3{star}の状態でも強力なヒーローもいます。
                </p>
                <p className="mt-4">
                    使用できるリソースは3種類：
                </p>
                <ul>
                    <li><span className={decoration}><GuideIconInline name="TI_Item_Recruit_Special_001_NonMileage" text="デミウルゴスの呼び声（イベント）" /></span>：10個で1回募集、マイレージ加算なし</li>
                    <li><span className={decoration}><GuideIconInline name="TI_Item_Recruit_Special_001" text="デミウルゴスの呼び声" /></span>：10個で1回募集、<GuideIconInline name="CM_Icon_Recruit_Mileage_Special_001" text="偽神の証" size={25} />が1加算</li>
                    <li><span className={decoration}><GuideIconInline name="TI_Item_Cristal_Cash" text="エーテル" /></span>：225で1回募集、<GuideIconInline name="CM_Icon_Recruit_Mileage_Special_001" text="偽神の証" size={25} />が1加算</li>
                </ul>

                <p className="mt-4"><GuideIconInline name="CM_Icon_Recruit_Mileage_Special_001" text="偽神の証" size={25} />は使用するまで保持されます。</p>
                <p className="mt-4">
                    <GuideIconInline name="CM_Icon_Recruit_Mileage_Special_001" text="偽神の証" size={25} />を200貯めると、ピックアップヒーローを獲得、または<GuideIconInline name="CM_Piece_Frame" text="ヒーローピース" />150個と交換できます。<br />
                    既に所持している場合は<GuideIconInline name="GC_Item_Piece" text="汎用ピース" />15個が追加で獲得できます。
                </p>
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
            <div>
                <GuideHeading>限定募集</GuideHeading>
                <p>3{star}ピックアップ排出率：1.25%</p>
                <p>3{star}その他排出率：1.25%</p>
                <p>2{star}排出率：19%</p>
                <p>1{star}排出率：78.5%</p>
                <p className="mt-4"><span className={decoration}>特徴</span>：10連募集で2{star}以上のヒーローが1体以上確定。</p>
                <p className="mt-4">
                    重複時の獲得：
                </p>
                <ul>
                    <li><span className={decoration}><GuideIconInline name="GC_Item_Piece" text="汎用ピース" /></span>：2{star}で1個、3{star}で15個</li>
                    <li><span className={decoration}><GuideIconInline name="CM_Piece_Frame" text="ヒーローピース" /></span>：1{star}で5個、2{star}で10個、3{star}で150個</li>
                </ul>


                <p className="mt-2">
                    このバナーは期間限定で、限定ヒーローを獲得できる唯一の手段です。3つのカテゴリーに分かれています：</p>
                <ul>
                    <li><strong className='text-pink-400'>限定</strong>：期間限定の通常ヒーロー</li>
                    <li><strong className='text-green-400'>シーズン</strong>：ハロウィンやクリスマスなどの季節イベントに関連するヒーロー</li>
                    <li><strong className='text-red-400'>コラボ</strong>：他作品とのコラボヒーロー。復刻の可能性が最も低い</li>
                </ul>
                <p className="mt-2">
                    このバナーは通常2〜4週間開催されます。<br />
                    デミウルゴスヒーローと同様に、限定ヒーローは（通常）非常に強力で、高い超越レベルで最強の能力が解放されます。
                </p>

                <p className="mt-4">
                    <strong className={decoration}>限定ヒーロー一覧とリリース日：</strong></p>
                <LimitedHeroesList />

                <p className="mt-4">
                    使用できるリソースは3種類：
                </p>
                <ul>
                    <li>
                        <span className={decoration}>
                            <GuideIconInline name="TI_Item_Ticket_Recruit_06" text="限定募集チケット（イベント）" />
                        </span>：1枚で1回募集、マイレージ加算なし（このアイテムは存在しますがまだ使用されていません）
                    </li>
                    <li>
                        <span className={decoration}>
                            <GuideIconInline name="TI_Item_Ticket_Recruit_05" text="限定募集チケット" />
                        </span>：1枚で1回募集、<GuideIconInline name="CM_Icon_Recruit_Mileage_Seasonal" text="限定マイレージ" size={25} />が1加算
                    </li>
                    <li>
                        <span className={decoration}>
                            <GuideIconInline name="TI_Item_Cristal_Cash" text="エーテル" />
                        </span>：150で1回募集、<GuideIconInline name="CM_Icon_Recruit_Mileage_Seasonal" text="限定マイレージ" size={25} />が1加算
                    </li>
                </ul>


                <p className="mt-4"><GuideIconInline name="CM_Icon_Recruit_Mileage_Seasonal" text="限定マイレージ" size={25} />は使用するまで保持されます。</p>
                <p className="mt-4">
                    <GuideIconInline name="CM_Icon_Recruit_Mileage_Seasonal" text="限定マイレージ" size={25} />を150貯めると、ピックアップヒーローを獲得、または<GuideIconInline name="CM_Piece_Frame" text="ヒーローピース" />150個と交換できます。<br />
                    既に所持している場合は<GuideIconInline name="GC_Item_Piece" text="汎用ピース" />15個が追加で獲得できます。
                </p>
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
                Outerplaneは<span className={decoration}>マイレージシステム</span>を採用しています。
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
