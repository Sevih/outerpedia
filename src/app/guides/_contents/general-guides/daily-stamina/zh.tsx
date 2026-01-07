import GuideHeading from '@/app/components/GuideHeading';
import ElementInlineTag from '@/app/components/ElementInline';
import GuideIconInline from '@/app/components/GuideIconInline';

const decoration = "text-yellow-400 underline";

export default function BeginnerGuide() {
    return (
        <div className="space-y-6">
            <p>
                高效使用<GuideIconInline name="CM_Goods_Stamina" text="体力" />是游戏中最重要的事情之一 — 尤其是如果你计划长期游玩。
            </p>

            <p>
                以下是帮助你明智使用<GuideIconInline name="CM_Goods_Stamina" text="体力" />并持续获取资源的每日优先事项列表：
            </p>

            <GuideHeading level={4} className={decoration}>分身挑战</GuideHeading>
            <p>
                每日消耗60<GuideIconInline name="CM_Goods_Stamina" text="" />。
            </p>

            <GuideHeading level={4} className={decoration}>终点岛</GuideHeading>
            <p>
                每日消耗30<GuideIconInline name="CM_Goods_Stamina" text="" />。
            </p>

            <GuideHeading level={4} className={decoration}>第13关 武器/饰品Boss</GuideHeading>
            <p>
                通关全部5个Boss，每个3次（每日上限）。消耗240<GuideIconInline name="CM_Goods_Stamina" text="" />。<br />
                奖励：<GuideIconInline name="TI_Craft_Material_EX_Equip_Growth_01" text="蓝色记忆碎片" />（专属装备强化）、<GuideIconInline name="TI_Craft_Material_Talisman_Growth_01" text="蓝色星尘" />（护符强化）、<GuideIconInline name="CM_TopMenu_Gold" text="金币" />、随机6★传说装备（属性差可作为超越材料）。
            </p>

            <GuideHeading level={4} className={decoration}>困难模式 剧情最终Boss</GuideHeading>
            <p>
                从第3季5-10关开始，每章通关消耗50<GuideIconInline name="CM_Goods_Stamina" text="" />（目前共150，持续增加中）。<br />
                非常适合刷取<GuideIconInline name="CM_TopMenu_Gold" text="金币" />、<GuideIconInline name="stats" text="宝石" />、<GuideIconInline name="TI_Item_Growth_Dissolve_04" text="传说重铸催化剂" />（5★分解获得）和6★红色装备。
            </p>

            <GuideHeading level={4} className={decoration}>异常Boss</GuideHeading>
            <p>
                通关渗透关卡。追踪中加入其他玩家的Boss每次消耗20<GuideIconInline name="CM_Goods_Stamina" text="" />（超难）。<br />
                奖励：50K<GuideIconInline name="CM_TopMenu_Gold" text="金币" />、<GuideIconInline name="CM_TopMenu_Irregular_01" text="异常细胞" />、<GuideIconInline name="CM_Mission_Box04" text="好感度宝箱" />、<GuideIconInline name="TI_Common_Box05" text="强化石宝箱" />、低概率（约5%）获得异常装备：
            </p>
            <ul className="list-disc pl-6 space-y-2">
                <li>
                    <GuideIconInline name="TI_Equipment_Irregular_Accessary_01" text="布里亚柔斯的野心" />和<GuideIconInline name="TI_Equipment_Irregular_Weapon_01" text="布里亚柔斯的暴走" />：来自<GuideIconInline name="pursuit-iron-stretcher_portrait" text="铁担架" size={50} /> / <GuideIconInline name="pursuit-blockbuster_portrait" text="爆破者" size={50} />
                </li>
                <li>
                    <GuideIconInline name="TI_Equipment_Irregular_Accessary_02" text="戈耳工的虚荣" />和<GuideIconInline name="TI_Equipment_Irregular_Weapon_02" text="戈耳工的愤怒" />：来自<GuideIconInline name="pursuit-mutated-wyvre_portrait" text="变异飞龙" size={50} /> / <GuideIconInline name="pursuit-queen_portrait" text="异常女王" size={50} />
                </li>
            </ul>
            <p>
                刷到月8K细胞为止（用于2K<GuideIconInline name="TI_Item_Cristal_Cash" text="以太" />通行证奖励），之后如有需要可用剩余体力继续刷。
            </p>

            <GuideHeading level={4} className={decoration}>塔层</GuideHeading>
            <p>
                每月至少通关普通100层和困难17层（如果可能的话全层通关以清空商店）。消耗500+<GuideIconInline name="CM_Goods_Stamina" text="" />，取决于进度。
            </p>

            <GuideHeading level={4} className={decoration}>冒险执照</GuideHeading>
            <p>
                每周尽可能多地通关Boss。每次消耗10<GuideIconInline name="CM_Goods_Stamina" text="" />（每个Boss 2次）。每天做1个可以避免周末大量消耗体力。<br />
                奖励：<GuideIconInline name="CM_TopMenu_Gold" text="金币" />、<GuideIconInline name="CM_TopMenu_Licence" text="执照点数" />、<GuideIconInline name="TI_G_Dungeon_Box02" text="冒险者宝箱" />（宝箱可能奖励15<GuideIconInline name="CM_Goods_Stamina" text="" />）
            </p>

            <GuideHeading level={3} className={decoration}>基础总量</GuideHeading>
            <p>
                约560<GuideIconInline name="CM_Goods_Stamina" text="" /> + 异常Boss、塔、冒险执照的消耗量。
            </p>

            <GuideHeading level={4} className={decoration}>（可选）莫纳德之门</GuideHeading>
            <p>
                每日1次值得考虑。可以获得<GuideIconInline name="EBT_WORLD_BOSS_TITLE" text="调谐者" />等有用称号，提供<GuideIconInline name="CM_TopMenu_Gold" text="金币" />+10%和特别委托内容掉落率增加15%。<br />
                每次消耗30<GuideIconInline name="CM_Goods_Stamina" text="" />。
            </p>

            <GuideHeading level={4} className={decoration}>（可选）第13关 防具Boss</GuideHeading>
            <p>
                如果超越材料不足且需要<GuideIconInline name="TI_Equipment_Growth03" text="防具格鲁奈特" />，可以刷取<GuideIconInline name="TI_Craft_Material_Equipment_Growth_01" text="防具格鲁奈特碎片" />。<br />
                每日消耗240<GuideIconInline name="CM_Goods_Stamina" text="" />。
            </p>

            <hr className="my-4" />

            <p>如果你还没到达终局内容，以下是其他建议：</p>

            <ul className="list-disc pl-6 space-y-2">
                <li>
                    <strong className={decoration}>刷第12关 防具Boss</strong>：专注于<ElementInlineTag element='earth' />、<ElementInlineTag element='light' />，以及<ElementInlineTag element='dark' />或<ElementInlineTag element='water' />，直到获得所需装备。<ElementInlineTag element='fire' />装备除非追求特定属性否则用处不大。通关3个第12关Boss消耗36<GuideIconInline name="CM_Goods_Stamina" text="" />。
                </li>
                <li>
                    <strong className={decoration}>困难模式 剧情Boss</strong>：非常适合获取<GuideIconInline name="TI_Present_01_01" text="好感度道具" />、<GuideIconInline name="TI_Item_Growth_Earth_02" text="强化石" />、<GuideIconInline name="stats" text="宝石" />和<GuideIconInline name="TI_Item_Growth_Dissolve_04" text="传说重铸催化剂" />（5★分解获得）。
                </li>
            </ul>

            <p>
                ⚠️ <strong className={decoration}>避免点击邮箱中的「全部领取」</strong>：体力奖励会保留约6天。让体力条自然恢复，需要时再领取奖励来完成每日任务。
            </p>

            <p>
                注意：<strong>赏金猎人</strong>等其他每日任务也很有价值，但使用的是<GuideIconInline name="TI_Item_Ticket_Gold" text="门票" />而不是<GuideIconInline name="CM_Goods_Stamina" text="体力" />。
            </p>
        </div>
    );
}
