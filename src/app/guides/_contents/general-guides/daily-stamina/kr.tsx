import GuideHeading from '@/app/components/GuideHeading';
import ElementInlineTag from '@/app/components/ElementInline';
import GuideIconInline from '@/app/components/GuideIconInline';

const decoration = "text-yellow-400 underline";

export default function BeginnerGuide() {
    return (
        <div className="space-y-6">
            <p>
                <GuideIconInline name="CM_Goods_Stamina" text="스태미나" />를 효율적으로 사용하는 것은 이 게임에서 성장하는 데 가장 중요한 일 중 하나입니다 — 특히 장기 플레이를 계획한다면.
            </p>

            <p>
                다음은 <GuideIconInline name="CM_Goods_Stamina" text="스태미나" />를 현명하게 사용하고 계정에 지속적으로 자원을 확보하기 위한 일일 우선순위 목록입니다:
            </p>

            <GuideHeading level={4} className={decoration}>도플갱어</GuideHeading>
            <p>
                하루 60<GuideIconInline name="CM_Goods_Stamina" text="" /> 소모.
            </p>

            <GuideHeading level={4} className={decoration}>터미널 아일</GuideHeading>
            <p>
                하루 30<GuideIconInline name="CM_Goods_Stamina" text="" /> 소모.
            </p>

            <GuideHeading level={4} className={decoration}>스테이지 13 무기/악세서리 보스</GuideHeading>
            <p>
                5개 보스 모두 각 3회 클리어(일일 상한). 240<GuideIconInline name="CM_Goods_Stamina" text="" /> 소모.<br />
                보상: <GuideIconInline name="TI_Craft_Material_EX_Equip_Growth_01" text="푸른 기억 조각" />(전용 장비 강화), <GuideIconInline name="TI_Craft_Material_Talisman_Growth_01" text="푸른 별 안개" />(탈리스만 강화), <GuideIconInline name="CM_TopMenu_Gold" text="골드" />, 랜덤 6★ 레전더리 장비(스탯이 나쁘면 초월 재료로 사용 가능).
            </p>

            <GuideHeading level={4} className={decoration}>하드 모드 스토리 최종 보스</GuideHeading>
            <p>
                시즌 3 스테이지 5-10부터 각 챕터 클리어에 50<GuideIconInline name="CM_Goods_Stamina" text="" /> 소모(현재 총 150, 계속 증가 중).<br />
                <GuideIconInline name="CM_TopMenu_Gold" text="골드" />, <GuideIconInline name="stats" text="보석" />, <GuideIconInline name="TI_Item_Growth_Dissolve_04" text="레전더리 재련 촉매" />(5★ 분해로 획득), 6★ 레드 장비 파밍에 최적.
            </p>

            <GuideHeading level={4} className={decoration}>이레귤러 보스</GuideHeading>
            <p>
                침투 스테이지 클리어. 추적에서 다른 플레이어의 보스 참가 시 1회 20<GuideIconInline name="CM_Goods_Stamina" text="" /> 소모(베리 하드).<br />
                보상: 50K<GuideIconInline name="CM_TopMenu_Gold" text="골드" />, <GuideIconInline name="CM_TopMenu_Irregular_01" text="이레귤러 셀" />, <GuideIconInline name="CM_Mission_Box04" text="호감도 상자" />, <GuideIconInline name="TI_Common_Box05" text="강화석 상자" />, 이레귤러 장비 저확률(약 5%):
            </p>
            <ul className="list-disc pl-6 space-y-2">
                <li>
                    <GuideIconInline name="TI_Equipment_Irregular_Accessary_01" text="브리아레오스의 야망" />과 <GuideIconInline name="TI_Equipment_Irregular_Weapon_01" text="브리아레오스의 폭주" />: <GuideIconInline name="pursuit-iron-stretcher_portrait" text="아이언 스트레처" size={50} /> / <GuideIconInline name="pursuit-blockbuster_portrait" text="블록버스터" size={50} />에서
                </li>
                <li>
                    <GuideIconInline name="TI_Equipment_Irregular_Accessary_02" text="고르곤의 허영" />과 <GuideIconInline name="TI_Equipment_Irregular_Weapon_02" text="고르곤의 분노" />: <GuideIconInline name="pursuit-mutated-wyvre_portrait" text="돌연변이 와이번" size={50} /> / <GuideIconInline name="pursuit-queen_portrait" text="이레귤러 퀸" size={50} />에서
                </li>
            </ul>
            <p>
                월 8K 셀에 도달할 때까지 파밍(2K<GuideIconInline name="TI_Item_Cristal_Cash" text="에테르" /> 패스 보상용), 이후 필요시 남은 스태미나로 추가 파밍.
            </p>

            <GuideHeading level={4} className={decoration}>탑 층</GuideHeading>
            <p>
                매월 최소 노말 100층과 하드 17층 클리어(가능하면 전층 클리어하여 상점 비우기). 500+<GuideIconInline name="CM_Goods_Stamina" text="" /> 소모, 진행도에 따라 다름.
            </p>

            <GuideHeading level={4} className={decoration}>모험 면허</GuideHeading>
            <p>
                매주 최대한 많은 보스 클리어. 1회 10<GuideIconInline name="CM_Goods_Stamina" text="" /> 소모(보스당 2회까지). 하루에 1개씩 하면 주말에 대량 스태미나 소모를 피할 수 있음.<br />
                보상: <GuideIconInline name="CM_TopMenu_Gold" text="골드" />, <GuideIconInline name="CM_TopMenu_Licence" text="면허 포인트" />, <GuideIconInline name="TI_G_Dungeon_Box02" text="모험가 상자" />(상자에서 15<GuideIconInline name="CM_Goods_Stamina" text="" />가 나올 수 있음)
            </p>

            <GuideHeading level={3} className={decoration}>기본 총량</GuideHeading>
            <p>
                약 560<GuideIconInline name="CM_Goods_Stamina" text="" /> + 이레귤러 보스, 탑, 모험 면허에 사용하는 양.
            </p>

            <GuideHeading level={4} className={decoration}>(선택) 모나드 게이트</GuideHeading>
            <p>
                하루 1회 진행 고려. <GuideIconInline name="EBT_WORLD_BOSS_TITLE" text="튜너" /> 같은 유용한 칭호를 얻을 수 있으며, <GuideIconInline name="CM_TopMenu_Gold" text="골드" /> +10%와 특별 의뢰 콘텐츠에서 드롭률 15% 증가 효과가 있음.<br />
                1회 30<GuideIconInline name="CM_Goods_Stamina" text="" /> 소모.
            </p>

            <GuideHeading level={4} className={decoration}>(선택) 스테이지 13 방어구 보스</GuideHeading>
            <p>
                초월 재료가 부족하고 <GuideIconInline name="TI_Equipment_Growth03" text="방어구 글루나이트" />가 필요하면 <GuideIconInline name="TI_Craft_Material_Equipment_Growth_01" text="방어구 글루나이트 조각" />을 얻기 위해 파밍.<br />
                하루 240<GuideIconInline name="CM_Goods_Stamina" text="" /> 소모.
            </p>

            <hr className="my-4" />

            <p>아직 엔드게임에 도달하지 않았다면 다른 제안:</p>

            <ul className="list-disc pl-6 space-y-2">
                <li>
                    <strong className={decoration}>스테이지 12 방어구 보스 파밍</strong>: 필요한 것을 얻을 때까지 <ElementInlineTag element='earth' />, <ElementInlineTag element='light' />, 그리고 <ElementInlineTag element='dark' /> 또는 <ElementInlineTag element='water' />에 집중. <ElementInlineTag element='fire' /> 장비는 특정 스탯을 노리지 않는 한 유용성이 낮음. 스테이지 12 보스 3개 클리어에 36<GuideIconInline name="CM_Goods_Stamina" text="" /> 소모.
                </li>
                <li>
                    <strong className={decoration}>하드 모드 스토리 보스</strong>: <GuideIconInline name="TI_Present_01_01" text="호감도 아이템" />, <GuideIconInline name="TI_Item_Growth_Earth_02" text="강화석" />, <GuideIconInline name="stats" text="보석" />, <GuideIconInline name="TI_Item_Growth_Dissolve_04" text="레전더리 재련 촉매" />(5★ 분해로 획득)에 최적.
                </li>
            </ul>

            <p>
                ⚠️ <strong className={decoration}>우편함에서 &quot;모두 받기&quot;를 클릭하지 마세요</strong>: 스태미나 보상은 약 6일간 보관됩니다. 바가 자연 회복되도록 두고, 일일 과제를 위해 필요할 때 보상을 받으세요.
            </p>

            <p>
                참고: <strong>현상금 사냥꾼</strong> 등 다른 일일 과제도 가치가 있지만, <GuideIconInline name="CM_Goods_Stamina" text="스태미나" />가 아닌 <GuideIconInline name="TI_Item_Ticket_Gold" text="티켓" />을 사용합니다.
            </p>
        </div>
    );
}
