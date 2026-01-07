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
        label: '自选UP',
        badgeImg: 'CM_Recruit_Tag_PickUp',
        badgePosition: '-top-4 -right-4',
        content: (
            <div>
                <GuideHeading>自选UP招募</GuideHeading>
                <p>3{star}掉率：2.5%</p>
                <p>2{star}掉率：19%</p>
                <p>1{star}掉率：78.5%</p>
                <p className="mt-4"><span className={decoration}>特点</span>：10连招募保底至少1个2{star}以上英雄。</p>
                <p className='mt-4'><span className={decoration}>每日1次免费招募</span></p>
                <p className='mt-4'>获得已拥有的英雄时：</p>
                <ul>
                    <li><span className={decoration}><GuideIconInline name="GC_Item_Piece" text='通用碎片' /></span>：2{star}获得1个，3{star}获得15个</li>
                    <li><span className={decoration}><GuideIconInline name="CM_Piece_Frame" text='英雄碎片' /></span>：1{star}获得5个，2{star}获得10个，3{star}获得150个</li>
                </ul>

                <p className='mt-2'>
                    此卡池常驻开放。<br />你可以选择最多3个角色作为UP目标。<br />例如选择
                    <CharacterLinkCard name="Alice" />、<CharacterLinkCard name="Eliza" />和<CharacterLinkCard name="Francesca" />后，3{star}只会出这3个角色。</p>
                <p className='mt-4'>
                    可使用3种资源：</p>
                <ul>
                    <li>
                        <span className={decoration}><GuideIconInline name="TI_Item_Ticket_Recruit_04" text='特别招募券（活动）' /></span>：1张1次招募，不计入里程
                    </li>
                    <li>
                        <span className={decoration}><GuideIconInline name="TI_Item_Ticket_Recruit_02" text='特别招募券' /></span>：1张1次招募，获得1<GuideIconInline name="CM_Icon_Recruit_Mileage_Element" text='自选里程' size={25} />
                    </li>
                    <li>
                        <span className={decoration}><GuideIconInline name="TI_Item_Cristal_Cash" text='以太' /></span>：150个1次招募，获得1<GuideIconInline name="CM_Icon_Recruit_Mileage_Element" text='自选里程' size={25} />
                    </li>
                </ul>

                <p className='mt-4'>
                    不建议在此卡池使用<GuideIconInline name="TI_Item_Cristal_Cash" text='以太' />
                </p>
                <p className='mt-4'>
                    <GuideIconInline name="CM_Icon_Recruit_Mileage_Element" text='自选里程' size={25} />会保留直到使用。
                </p>
                <p className='mt-4'>
                    积累200<GuideIconInline name="CM_Icon_Recruit_Mileage_Element" text='自选里程' size={25} />可获取UP英雄，或兑换150<GuideIconInline name="CM_Piece_Frame" text='英雄碎片' /><br />
                    如已拥有该英雄，额外获得15<GuideIconInline name="GC_Item_Piece" text='通用碎片' />。
                </p>
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
            <div>
                <GuideHeading>UP招募</GuideHeading>
                <p>3{star}UP掉率：1.25%</p>
                <p>3{star}非UP掉率：1.25%</p>
                <p>2{star}掉率：19%</p>
                <p>1{star}掉率：78.5%</p>
                <p className="mt-4"><span className={decoration}>特点</span>：10连招募保底至少1个2{star}以上英雄。</p>
                <p className="mt-4">
                    重复获得时：</p>
                <ul>
                    <li><span className={decoration}><GuideIconInline name="GC_Item_Piece" text="通用碎片" /></span>：2{star}获得1个，3{star}获得15个</li>
                    <li><span className={decoration}><GuideIconInline name="CM_Piece_Frame" text="英雄碎片" /></span>：1{star}获得5个，2{star}获得10个，3{star}获得50个（卡池UP英雄获得150个）</li>
                </ul>

                <p className="mt-2">
                    此卡池为限时开放，通常持续2周。
                </p>
                <p className="mt-4">
                    可使用3种资源：</p>
                <ul>
                    <li><span className={decoration}><GuideIconInline name="TI_Item_Ticket_Recruit_04" text="特别招募券（活动）" /></span>：1张1次招募，不计入里程</li>
                    <li><span className={decoration}><GuideIconInline name="TI_Item_Ticket_Recruit_02" text="特别招募券" /></span>：1张1次招募，获得1<GuideIconInline name="CM_Icon_Recruit_Mileage" text="里程" size={25} /></li>
                    <li><span className={decoration}><GuideIconInline name="TI_Item_Cristal_Cash" text="以太" /></span>：150个1次招募，获得1<GuideIconInline name="CM_Icon_Recruit_Mileage" text="里程" size={25} /></li>
                </ul>

                <p className='mt-4'>
                    不建议在此卡池使用<GuideIconInline name="TI_Item_Cristal_Cash" text='以太' />
                </p>
                <p className="mt-4"><GuideIconInline name="CM_Icon_Recruit_Mileage" text="里程" size={25} />会保留直到使用。</p>
                <p className="mt-4">
                    积累200<GuideIconInline name="CM_Icon_Recruit_Mileage" text="里程" size={25} />可获取UP英雄，或兑换150<GuideIconInline name="CM_Piece_Frame" text="英雄碎片" />。<br />
                    如已拥有该英雄，额外获得15<GuideIconInline name="GC_Item_Piece" text="通用碎片" />。
                </p>

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
            <div>
                <GuideHeading>精选招募</GuideHeading>
                <p>3{star}UP掉率：1.25%</p>
                <p>3{star}非UP掉率：2.5%</p>
                <p className="ml-10 text-gray-400">造物主英雄的掉率约为普通非UP 3{star}的一半</p>
                <p>2{star}掉率：19%</p>
                <p>1{star}掉率：77.25%</p>
                <p className="mt-4"><span className={decoration}>每日1次免费招募</span></p>
                <p className="mt-4">
                    重复获得时：
                </p>
                <ul>
                    <li><span className={decoration}><GuideIconInline name="GC_Item_Piece" text="通用碎片" /></span>：2{star}获得1个，3{star}获得15个</li>
                    <li><span className={decoration}><GuideIconInline name="CM_Piece_Frame" text="英雄碎片" /></span>：1{star}获得5个，2{star}获得10个，3{star}获得50个（卡池UP英雄获得150个）</li>
                </ul>

                <p className="mt-2">
                    此卡池常驻开放，是获取造物主英雄的唯一常规途径（除造物主契约等活动外）。<br />
                    这些英雄非常强力但掉率极低。造物主英雄从超越中获益更多，但有些在基础3{star}时就很强。
                </p>
                <p className="mt-4">
                    可使用3种资源：
                </p>
                <ul>
                    <li><span className={decoration}><GuideIconInline name="TI_Item_Recruit_Special_001_NonMileage" text="造物主的呼唤（活动）" /></span>：10个1次招募，不计入里程</li>
                    <li><span className={decoration}><GuideIconInline name="TI_Item_Recruit_Special_001" text="造物主的呼唤" /></span>：10个1次招募，获得1<GuideIconInline name="CM_Icon_Recruit_Mileage_Special_001" text="伪神之证" size={25} /></li>
                    <li><span className={decoration}><GuideIconInline name="TI_Item_Cristal_Cash" text="以太" /></span>：225个1次招募，获得1<GuideIconInline name="CM_Icon_Recruit_Mileage_Special_001" text="伪神之证" size={25} /></li>
                </ul>

                <p className="mt-4"><GuideIconInline name="CM_Icon_Recruit_Mileage_Special_001" text="伪神之证" size={25} />会保留直到使用。</p>
                <p className="mt-4">
                    积累200<GuideIconInline name="CM_Icon_Recruit_Mileage_Special_001" text="伪神之证" size={25} />可获取UP英雄，或兑换150<GuideIconInline name="CM_Piece_Frame" text="英雄碎片" />。<br />
                    如已拥有该英雄，额外获得15<GuideIconInline name="GC_Item_Piece" text="通用碎片" />。
                </p>
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
            <div>
                <GuideHeading>限定招募</GuideHeading>
                <p>3{star}UP掉率：1.25%</p>
                <p>3{star}非UP掉率：1.25%</p>
                <p>2{star}掉率：19%</p>
                <p>1{star}掉率：78.5%</p>
                <p className="mt-4"><span className={decoration}>特点</span>：10连招募保底至少1个2{star}以上英雄。</p>
                <p className="mt-4">
                    重复获得时：
                </p>
                <ul>
                    <li><span className={decoration}><GuideIconInline name="GC_Item_Piece" text="通用碎片" /></span>：2{star}获得1个，3{star}获得15个</li>
                    <li><span className={decoration}><GuideIconInline name="CM_Piece_Frame" text="英雄碎片" /></span>：1{star}获得5个，2{star}获得10个，3{star}获得150个</li>
                </ul>


                <p className="mt-2">
                    此卡池为限时开放，是获取限定英雄的唯一途径。分为3个类别：</p>
                <ul>
                    <li><strong className='text-pink-400'>限定</strong>：常规限时英雄</li>
                    <li><strong className='text-green-400'>季节</strong>：与万圣节、圣诞节等年度活动相关的英雄</li>
                    <li><strong className='text-red-400'>联动</strong>：与其他作品联动的英雄，复刻可能性最低</li>
                </ul>
                <p className="mt-2">
                    此卡池通常持续2至4周。<br />
                    与造物主英雄类似，限定英雄（通常）非常强力，其最强能力在高超越等级解锁。
                </p>

                <p className="mt-4">
                    <strong className={decoration}>限定英雄列表及发布日期：</strong></p>
                <LimitedHeroesList />

                <p className="mt-4">
                    可使用3种资源：
                </p>
                <ul>
                    <li>
                        <span className={decoration}>
                            <GuideIconInline name="TI_Item_Ticket_Recruit_06" text="限定招募券（活动）" />
                        </span>：1张1次招募，不计入里程（此道具存在但尚未使用过）
                    </li>
                    <li>
                        <span className={decoration}>
                            <GuideIconInline name="TI_Item_Ticket_Recruit_05" text="限定招募券" />
                        </span>：1张1次招募，获得1<GuideIconInline name="CM_Icon_Recruit_Mileage_Seasonal" text="限定里程" size={25} />
                    </li>
                    <li>
                        <span className={decoration}>
                            <GuideIconInline name="TI_Item_Cristal_Cash" text="以太" />
                        </span>：150个1次招募，获得1<GuideIconInline name="CM_Icon_Recruit_Mileage_Seasonal" text="限定里程" size={25} />
                    </li>
                </ul>


                <p className="mt-4"><GuideIconInline name="CM_Icon_Recruit_Mileage_Seasonal" text="限定里程" size={25} />会保留直到使用。</p>
                <p className="mt-4">
                    积累150<GuideIconInline name="CM_Icon_Recruit_Mileage_Seasonal" text="限定里程" size={25} />可获取UP英雄，或兑换150<GuideIconInline name="CM_Piece_Frame" text="英雄碎片" />。<br />
                    如已拥有该英雄，额外获得15<GuideIconInline name="GC_Item_Piece" text="通用碎片" />。
                </p>
            </div>
        ),

    },


];

export default function BannerAndMileageGuide() {
    return (
        <div className="space-y-6">
            <p>
                与大多数抽卡游戏一样，Outerplane拥有多个卡池的招募系统，
                每个卡池使用不同的资源。
                本指南将介绍卡池和里程系统的运作方式。
            </p>

            <p>
                Outerplane采用<span className={decoration}>里程系统</span>。
                与天井计数器不同，里程允许你在积累足够点数后
                <strong>直接获取</strong>UP英雄。
            </p>

            <p>
                每次招募<strong>（活动券除外）</strong>可获得1点里程。
                达到所需数量后，可用里程兑换卡池英雄。
            </p>

            <p>
                此系统的一大优势是<strong>里程在卡池间保留</strong>。<br />
                这有什么用？<br />
                假设你10连抽到了英雄，同时也达到了里程上限。
                如果你是为了收集而抽，可以<strong>保留里程</strong>
                用于未来更感兴趣的英雄卡池，或更高效地确保下一个目标。
            </p>



            <BannerTabCards tabs={bannerTabs} imagePath="/images/guides/general-guides/banner/" />
        </div>
    );
}
