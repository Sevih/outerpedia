import GuideHeading from '@/app/components/GuideHeading';
import ElementInlineTag from '@/app/components/ElementInline';
import GuideIconInline from '@/app/components/GuideIconInline';

const decoration = "text-yellow-400 underline";

export default function BeginnerGuide() {
    return (
        <div className="space-y-6">
            <p>
                <GuideIconInline name="CM_Goods_Stamina" text="スタミナ" />を効率的に使うことは、このゲームで進行する上で最も重要なことの一つです — 特に長期的にプレイする予定なら。
            </p>

            <p>
                以下は<GuideIconInline name="CM_Goods_Stamina" text="スタミナ" />を賢く使い、アカウントにリソースを流し続けるための毎日の優先事項リストです：
            </p>

            <GuideHeading level={4} className={decoration}>ドッペルゲンガー</GuideHeading>
            <p>
                1日60<GuideIconInline name="CM_Goods_Stamina" text="" />消費。
            </p>

            <GuideHeading level={4} className={decoration}>ターミナルアイル</GuideHeading>
            <p>
                1日30<GuideIconInline name="CM_Goods_Stamina" text="" />消費。
            </p>

            <GuideHeading level={4} className={decoration}>ステージ13 武器/アクセサリーボス</GuideHeading>
            <p>
                全5ボスを各3回クリア（1日の上限）。240<GuideIconInline name="CM_Goods_Stamina" text="" />消費。<br />
                報酬：<GuideIconInline name="TI_Craft_Material_EX_Equip_Growth_01" text="青い記憶の欠片" />（専用装備強化）、<GuideIconInline name="TI_Craft_Material_Talisman_Growth_01" text="青い星の霧" />（タリスマン強化）、<GuideIconInline name="CM_TopMenu_Gold" text="ゴールド" />、ランダムな6★レジェンダリー装備（ステータスが悪ければ超越素材として使用可能）。
            </p>

            <GuideHeading level={4} className={decoration}>ハードモード ストーリー最終ボス</GuideHeading>
            <p>
                シーズン3ステージ5-10から、各章のクリアに50<GuideIconInline name="CM_Goods_Stamina" text="" />消費（現在合計150、今後増加予定）。<br />
                <GuideIconInline name="CM_TopMenu_Gold" text="ゴールド" />、<GuideIconInline name="stats" text="ジェム" />、<GuideIconInline name="TI_Item_Growth_Dissolve_04" text="レジェンダリー錬成触媒" />（5★分解から）、6★赤装備のファームに最適。
            </p>

            <GuideHeading level={4} className={decoration}>イレギュラーボス</GuideHeading>
            <p>
                侵入ステージをクリア。追跡では、他プレイヤーのボスに参加すると1回20<GuideIconInline name="CM_Goods_Stamina" text="" />消費（ベリーハード）。<br />
                報酬：50K<GuideIconInline name="CM_TopMenu_Gold" text="ゴールド" />、<GuideIconInline name="CM_TopMenu_Irregular_01" text="イレギュラーセル" />、<GuideIconInline name="CM_Mission_Box04" text="好感度チェスト" />、<GuideIconInline name="TI_Common_Box05" text="強化石チェスト" />、イレギュラー装備の低確率（約5%）：
            </p>
            <ul className="list-disc pl-6 space-y-2">
                <li>
                    <GuideIconInline name="TI_Equipment_Irregular_Accessary_01" text="ブリアレオスの野望" />と<GuideIconInline name="TI_Equipment_Irregular_Weapon_01" text="ブリアレオスの暴走" />：<GuideIconInline name="pursuit-iron-stretcher_portrait" text="アイアンストレッチャー" size={50} /> / <GuideIconInline name="pursuit-blockbuster_portrait" text="ブロックバスター" size={50} />から
                </li>
                <li>
                    <GuideIconInline name="TI_Equipment_Irregular_Accessary_02" text="ゴルゴンの虚栄" />と<GuideIconInline name="TI_Equipment_Irregular_Weapon_02" text="ゴルゴンの憤怒" />：<GuideIconInline name="pursuit-mutated-wyvre_portrait" text="ミュータントワイバーン" size={50} /> / <GuideIconInline name="pursuit-queen_portrait" text="イレギュラークイーン" size={50} />から
                </li>
            </ul>
            <p>
                月8Kセルに達するまでファーム（2K<GuideIconInline name="TI_Item_Cristal_Cash" text="エーテル" />パス報酬のため）、その後必要に応じて余ったスタミナでさらにファーム。
            </p>

            <GuideHeading level={4} className={decoration}>塔フロア</GuideHeading>
            <p>
                毎月最低でもノーマル100階とハード17階をクリア（可能なら全階クリアしてショップを空に）。500+<GuideIconInline name="CM_Goods_Stamina" text="" />消費、進行度による。
            </p>

            <GuideHeading level={4} className={decoration}>冒険免許</GuideHeading>
            <p>
                毎週できるだけ多くのボスをクリア。1回10<GuideIconInline name="CM_Goods_Stamina" text="" />消費（ボスごとに2回まで）。1日1回やることで週末の大量スタミナ消費を回避。<br />
                報酬：<GuideIconInline name="CM_TopMenu_Gold" text="ゴールド" />、<GuideIconInline name="CM_TopMenu_Licence" text="ライセンスポイント" />、<GuideIconInline name="TI_G_Dungeon_Box02" text="冒険者チェスト" />（チェストから15<GuideIconInline name="CM_Goods_Stamina" text="" />が出ることもある）
            </p>

            <GuideHeading level={3} className={decoration}>基本合計</GuideHeading>
            <p>
                約560<GuideIconInline name="CM_Goods_Stamina" text="" /> + イレギュラーボス、塔、冒険免許に使う分。
            </p>

            <GuideHeading level={4} className={decoration}>（オプション）モナドゲート</GuideHeading>
            <p>
                1日1回は検討の価値あり。<GuideIconInline name="EBT_WORLD_BOSS_TITLE" text="チューナー" />のような便利な称号が手に入り、<GuideIconInline name="CM_TopMenu_Gold" text="ゴールド" />+10%とスペシャルリクエストコンテンツでのドロップ率15%増加が得られます。<br />
                1回30<GuideIconInline name="CM_Goods_Stamina" text="" />消費。
            </p>

            <GuideHeading level={4} className={decoration}>（オプション）ステージ13 防具ボス</GuideHeading>
            <p>
                超越素材が不足していて<GuideIconInline name="TI_Equipment_Growth03" text="防具グルナイト" />が欲しい場合、<GuideIconInline name="TI_Craft_Material_Equipment_Growth_01" text="防具グルナイトの欠片" />を入手するためにファーム。<br />
                1日240<GuideIconInline name="CM_Goods_Stamina" text="" />消費。
            </p>

            <hr className="my-4" />

            <p>まだエンドゲームに達していない場合の他の提案：</p>

            <ul className="list-disc pl-6 space-y-2">
                <li>
                    <strong className={decoration}>ステージ12 防具ボスをファーム</strong>：必要なものが手に入るまで<ElementInlineTag element='earth' />、<ElementInlineTag element='light' />、そして<ElementInlineTag element='dark' />か<ElementInlineTag element='water' />に集中。<ElementInlineTag element='fire' />装備は特定のステータスを狙っていない限り有用性が低い。ステージ12ボス3体クリアで36<GuideIconInline name="CM_Goods_Stamina" text="" />消費。
                </li>
                <li>
                    <strong className={decoration}>ハードモード ストーリーボス</strong>：<GuideIconInline name="TI_Present_01_01" text="好感度アイテム" />、<GuideIconInline name="TI_Item_Growth_Earth_02" text="強化石" />、<GuideIconInline name="stats" text="ジェム" />、<GuideIconInline name="TI_Item_Growth_Dissolve_04" text="レジェンダリー錬成触媒" />（5★分解から）に最適。
                </li>
            </ul>

            <p>
                ⚠️ <strong className={decoration}>メールボックスの「すべて受け取る」をクリックしないで</strong>：スタミナ報酬は約6日間保持されます。バーを自然に回復させ、必要に応じてデイリーをカバーするために報酬を受け取りましょう。
            </p>

            <p>
                注意：<strong>バウンティハンター</strong>など他のデイリーも価値がありますが、<GuideIconInline name="CM_Goods_Stamina" text="スタミナ" />ではなく<GuideIconInline name="TI_Item_Ticket_Gold" text="チケット" />を使用します。
            </p>
        </div>
    );
}
