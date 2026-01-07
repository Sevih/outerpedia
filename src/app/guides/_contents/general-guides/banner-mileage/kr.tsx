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
        label: '커스텀 픽업',
        badgeImg: 'CM_Recruit_Tag_PickUp',
        badgePosition: '-top-4 -right-4',
        content: (
            <div>
                <GuideHeading>커스텀 픽업 모집</GuideHeading>
                <p>3{star} 배출 확률: 2.5%</p>
                <p>2{star} 배출 확률: 19%</p>
                <p>1{star} 배출 확률: 78.5%</p>
                <p className="mt-4"><span className={decoration}>특징</span>: 10연 모집 시 2{star} 이상 영웅 1체 이상 확정.</p>
                <p className='mt-4'><span className={decoration}>1일 1회 무료 모집</span></p>
                <p className='mt-4'>이미 보유한 영웅을 획득할 경우:</p>
                <ul>
                    <li><span className={decoration}><GuideIconInline name="GC_Item_Piece" text='범용 조각' /></span>: 2{star}는 1개, 3{star}는 15개</li>
                    <li><span className={decoration}><GuideIconInline name="CM_Piece_Frame" text='영웅 조각' /></span>: 1{star}는 5개, 2{star}는 10개, 3{star}는 150개</li>
                </ul>

                <p className='mt-2'>
                    이 배너는 상시 운영됩니다.<br /> 최대 3명의 캐릭터를 선택하여 픽업 대상으로 지정할 수 있습니다. <br />예를 들어
                    <CharacterLinkCard name="Alice" />, <CharacterLinkCard name="Eliza" />, <CharacterLinkCard name="Francesca" />를 선택하면 이 3명 외에는 3{star}가 배출되지 않습니다.</p>
                <p className='mt-4'>
                    사용 가능한 재화는 3종류:</p>
                <ul>
                    <li>
                        <span className={decoration}><GuideIconInline name="TI_Item_Ticket_Recruit_04" text='특별 모집권 (이벤트)' /></span>: 1장당 1회 모집, 마일리지 미적용
                    </li>
                    <li>
                        <span className={decoration}><GuideIconInline name="TI_Item_Ticket_Recruit_02" text='특별 모집권' /></span>: 1장당 1회 모집, <GuideIconInline name="CM_Icon_Recruit_Mileage_Element" text='커스텀 마일리지' size={25} /> 1 적립
                    </li>
                    <li>
                        <span className={decoration}><GuideIconInline name="TI_Item_Cristal_Cash" text='에테르' /></span>: 150당 1회 모집, <GuideIconInline name="CM_Icon_Recruit_Mileage_Element" text='커스텀 마일리지' size={25} /> 1 적립
                    </li>
                </ul>

                <p className='mt-4'>
                    이 배너에서 <GuideIconInline name="TI_Item_Cristal_Cash" text='에테르' /> 사용은 권장되지 않습니다
                </p>
                <p className='mt-4'>
                    <GuideIconInline name="CM_Icon_Recruit_Mileage_Element" text='커스텀 마일리지' size={25} />는 사용할 때까지 유지됩니다.
                </p>
                <p className='mt-4'>
                    <GuideIconInline name="CM_Icon_Recruit_Mileage_Element" text='커스텀 마일리지' size={25} /> 200개로 픽업 영웅을 획득하거나, <GuideIconInline name="CM_Piece_Frame" text='영웅 조각' /> 150개와 교환할 수 있습니다.<br />
                    이미 보유 중인 경우 <GuideIconInline name="GC_Item_Piece" text='범용 조각' /> 15개가 추가로 지급됩니다.
                </p>
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
            <div>
                <GuideHeading>픽업 모집</GuideHeading>
                <p>3{star} 픽업 배출 확률: 1.25%</p>
                <p>3{star} 비픽업 배출 확률: 1.25%</p>
                <p>2{star} 배출 확률: 19%</p>
                <p>1{star} 배출 확률: 78.5%</p>
                <p className="mt-4"><span className={decoration}>특징</span>: 10연 모집 시 2{star} 이상 영웅 1체 이상 확정.</p>
                <p className="mt-4">
                    중복 획득 시:</p>
                <ul>
                    <li><span className={decoration}><GuideIconInline name="GC_Item_Piece" text="범용 조각" /></span>: 2{star}는 1개, 3{star}는 15개</li>
                    <li><span className={decoration}><GuideIconInline name="CM_Piece_Frame" text="영웅 조각" /></span>: 1{star}는 5개, 2{star}는 10개, 3{star}는 50개 (배너 영웅은 150개)</li>
                </ul>

                <p className="mt-2">
                    이 배너는 기간 한정으로, 보통 2주간 운영됩니다.
                </p>
                <p className="mt-4">
                    사용 가능한 재화는 3종류:</p>
                <ul>
                    <li><span className={decoration}><GuideIconInline name="TI_Item_Ticket_Recruit_04" text="특별 모집권 (이벤트)" /></span>: 1장당 1회 모집, 마일리지 미적용</li>
                    <li><span className={decoration}><GuideIconInline name="TI_Item_Ticket_Recruit_02" text="특별 모집권" /></span>: 1장당 1회 모집, <GuideIconInline name="CM_Icon_Recruit_Mileage" text="마일리지" size={25} /> 1 적립</li>
                    <li><span className={decoration}><GuideIconInline name="TI_Item_Cristal_Cash" text="에테르" /></span>: 150당 1회 모집, <GuideIconInline name="CM_Icon_Recruit_Mileage" text="마일리지" size={25} /> 1 적립</li>
                </ul>

                <p className='mt-4'>
                    이 배너에서 <GuideIconInline name="TI_Item_Cristal_Cash" text='에테르' /> 사용은 권장되지 않습니다
                </p>
                <p className="mt-4"><GuideIconInline name="CM_Icon_Recruit_Mileage" text="마일리지" size={25} />는 사용할 때까지 유지됩니다.</p>
                <p className="mt-4">
                    <GuideIconInline name="CM_Icon_Recruit_Mileage" text="마일리지" size={25} /> 200개로 픽업 영웅을 획득하거나, <GuideIconInline name="CM_Piece_Frame" text="영웅 조각" /> 150개와 교환할 수 있습니다.<br />
                    이미 보유 중인 경우 <GuideIconInline name="GC_Item_Piece" text="범용 조각" /> 15개가 추가로 지급됩니다.
                </p>

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
            <div>
                <GuideHeading>프리미엄 모집</GuideHeading>
                <p>3{star} 픽업 배출 확률: 1.25%</p>
                <p>3{star} 비픽업 배출 확률: 2.5%</p>
                <p className="ml-10 text-gray-400">데미우르고스 영웅의 배출 확률은 일반 비픽업 3{star}의 약 절반입니다</p>
                <p>2{star} 배출 확률: 19%</p>
                <p>1{star} 배출 확률: 77.25%</p>
                <p className="mt-4"><span className={decoration}>1일 1회 무료 모집</span></p>
                <p className="mt-4">
                    중복 획득 시:
                </p>
                <ul>
                    <li><span className={decoration}><GuideIconInline name="GC_Item_Piece" text="범용 조각" /></span>: 2{star}는 1개, 3{star}는 15개</li>
                    <li><span className={decoration}><GuideIconInline name="CM_Piece_Frame" text="영웅 조각" /></span>: 1{star}는 5개, 2{star}는 10개, 3{star}는 50개 (배너 영웅은 150개)</li>
                </ul>

                <p className="mt-2">
                    이 배너는 상시 운영되며, 데미우르고스 영웅을 획득할 수 있는 유일한 일반적인 방법입니다 (데미우르고스 계약 등의 이벤트 제외).<br />
                    이 영웅들은 매우 강력하지만 배출 확률도 매우 낮습니다. 데미우르고스 영웅은 초월의 효과가 크지만, 기본 3{star}에서도 강력한 영웅들이 있습니다.
                </p>
                <p className="mt-4">
                    사용 가능한 재화는 3종류:
                </p>
                <ul>
                    <li><span className={decoration}><GuideIconInline name="TI_Item_Recruit_Special_001_NonMileage" text="데미우르고스의 부름 (이벤트)" /></span>: 10개당 1회 모집, 마일리지 미적용</li>
                    <li><span className={decoration}><GuideIconInline name="TI_Item_Recruit_Special_001" text="데미우르고스의 부름" /></span>: 10개당 1회 모집, <GuideIconInline name="CM_Icon_Recruit_Mileage_Special_001" text="거짓 신의 증표" size={25} /> 1 적립</li>
                    <li><span className={decoration}><GuideIconInline name="TI_Item_Cristal_Cash" text="에테르" /></span>: 225당 1회 모집, <GuideIconInline name="CM_Icon_Recruit_Mileage_Special_001" text="거짓 신의 증표" size={25} /> 1 적립</li>
                </ul>

                <p className="mt-4"><GuideIconInline name="CM_Icon_Recruit_Mileage_Special_001" text="거짓 신의 증표" size={25} />는 사용할 때까지 유지됩니다.</p>
                <p className="mt-4">
                    <GuideIconInline name="CM_Icon_Recruit_Mileage_Special_001" text="거짓 신의 증표" size={25} /> 200개로 픽업 영웅을 획득하거나, <GuideIconInline name="CM_Piece_Frame" text="영웅 조각" /> 150개와 교환할 수 있습니다.<br />
                    이미 보유 중인 경우 <GuideIconInline name="GC_Item_Piece" text="범용 조각" /> 15개가 추가로 지급됩니다.
                </p>
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
            <div>
                <GuideHeading>한정 모집</GuideHeading>
                <p>3{star} 픽업 배출 확률: 1.25%</p>
                <p>3{star} 비픽업 배출 확률: 1.25%</p>
                <p>2{star} 배출 확률: 19%</p>
                <p>1{star} 배출 확률: 78.5%</p>
                <p className="mt-4"><span className={decoration}>특징</span>: 10연 모집 시 2{star} 이상 영웅 1체 이상 확정.</p>
                <p className="mt-4">
                    중복 획득 시:
                </p>
                <ul>
                    <li><span className={decoration}><GuideIconInline name="GC_Item_Piece" text="범용 조각" /></span>: 2{star}는 1개, 3{star}는 15개</li>
                    <li><span className={decoration}><GuideIconInline name="CM_Piece_Frame" text="영웅 조각" /></span>: 1{star}는 5개, 2{star}는 10개, 3{star}는 150개</li>
                </ul>


                <p className="mt-2">
                    이 배너는 기간 한정으로, 한정 영웅을 획득할 수 있는 유일한 방법입니다. 3가지 카테고리로 나뉩니다:</p>
                <ul>
                    <li><strong className='text-pink-400'>한정</strong>: 기간 한정 일반 영웅</li>
                    <li><strong className='text-green-400'>시즌</strong>: 할로윈, 크리스마스 등 시즌 이벤트 관련 영웅</li>
                    <li><strong className='text-red-400'>콜라보</strong>: 다른 작품과의 콜라보 영웅. 복각 가능성이 가장 낮음</li>
                </ul>
                <p className="mt-2">
                    이 배너는 보통 2~4주간 운영됩니다.<br />
                    데미우르고스 영웅과 마찬가지로, 한정 영웅은 (대체로) 매우 강력하며, 높은 초월 단계에서 가장 강력한 능력이 해금됩니다.
                </p>

                <p className="mt-4">
                    <strong className={decoration}>한정 영웅 목록 및 출시일:</strong></p>
                <LimitedHeroesList />

                <p className="mt-4">
                    사용 가능한 재화는 3종류:
                </p>
                <ul>
                    <li>
                        <span className={decoration}>
                            <GuideIconInline name="TI_Item_Ticket_Recruit_06" text="한정 모집권 (이벤트)" />
                        </span>: 1장당 1회 모집, 마일리지 미적용 (이 아이템은 존재하지만 아직 사용된 적 없음)
                    </li>
                    <li>
                        <span className={decoration}>
                            <GuideIconInline name="TI_Item_Ticket_Recruit_05" text="한정 모집권" />
                        </span>: 1장당 1회 모집, <GuideIconInline name="CM_Icon_Recruit_Mileage_Seasonal" text="한정 마일리지" size={25} /> 1 적립
                    </li>
                    <li>
                        <span className={decoration}>
                            <GuideIconInline name="TI_Item_Cristal_Cash" text="에테르" />
                        </span>: 150당 1회 모집, <GuideIconInline name="CM_Icon_Recruit_Mileage_Seasonal" text="한정 마일리지" size={25} /> 1 적립
                    </li>
                </ul>


                <p className="mt-4"><GuideIconInline name="CM_Icon_Recruit_Mileage_Seasonal" text="한정 마일리지" size={25} />는 사용할 때까지 유지됩니다.</p>
                <p className="mt-4">
                    <GuideIconInline name="CM_Icon_Recruit_Mileage_Seasonal" text="한정 마일리지" size={25} /> 150개로 픽업 영웅을 획득하거나, <GuideIconInline name="CM_Piece_Frame" text="영웅 조각" /> 150개와 교환할 수 있습니다.<br />
                    이미 보유 중인 경우 <GuideIconInline name="GC_Item_Piece" text="범용 조각" /> 15개가 추가로 지급됩니다.
                </p>
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
                Outerplane은 <span className={decoration}>마일리지 시스템</span>을 사용합니다.
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
