import GuideHeading from '@/app/components/GuideHeading';
import ElementInlineTag from '@/app/components/ElementInline';
import GuideIconInline from '@/app/components/GuideIconInline';

const decoration = "text-yellow-400 underline";

export default function BeginnerGuide() {
    return (
        <div className="space-y-6">
            <p>
                Spending <GuideIconInline name="CM_Goods_Stamina" text="Stamina" /> efficiently is one of the most important things you can do to progress in this game — especially if you plan to play long-term.
            </p>

            <p>
                Here&apos;s a list of daily priorities to help you spend your <GuideIconInline name="CM_Goods_Stamina" text="Stamina" /> wisely and keep resources flowing into your account:
            </p>

            <GuideHeading level={4} className={decoration}>Doppelgänger</GuideHeading>
            <p>
                Costs 60 <GuideIconInline name="CM_Goods_Stamina" text="" /> per day.
            </p>

            <GuideHeading level={4} className={decoration}>Terminus Isle</GuideHeading>
            <p>
                Costs 30 <GuideIconInline name="CM_Goods_Stamina" text="" /> per day.
            </p>

            <GuideHeading level={4} className={decoration}>Stage 13 Weapon/Accessory Bosses</GuideHeading>
            <p>
                Clear all 5 bosses, 3 times each (daily cap). Costs 240 <GuideIconInline name="CM_Goods_Stamina" text="" />.<br />
                Rewards: <GuideIconInline name="TI_Craft_Material_EX_Equip_Growth_01" text="Blue Memory Piece" /> (EE enhancement), <GuideIconInline name="TI_Craft_Material_Talisman_Growth_01" text="Blue Star Mist" /> (Talisman enhancement), <GuideIconInline name="CM_TopMenu_Gold" text="Gold" />, and random 6★ legendary gear (useful for transcend fodder if stats are bad).
            </p>

            <GuideHeading level={4} className={decoration}>Hard Mode Story Final Bosses</GuideHeading>
            <p>
                Starting from Season 3 stage 5-10, each chapter costs 50 <GuideIconInline name="CM_Goods_Stamina" text="" /> to clear (150 total currently and increasing).<br />
                Great for farming <GuideIconInline name="CM_TopMenu_Gold" text="Gold" />, <GuideIconInline name="stats" text="Gems" />, <GuideIconInline name="TI_Item_Growth_Dissolve_04" text="Legendary Reforge Catalyst" /> (from 5★ dismantle), and 6★ red gear.
            </p>

            <GuideHeading level={4} className={decoration}>Irregular Bosses</GuideHeading>
            <p>
                Clear the Infiltration stage. For Pursuit, joining other players&apos; bosses costs 20 <GuideIconInline name="CM_Goods_Stamina" text="" /> per run (Very Hard).<br />
                Rewards: 50K <GuideIconInline name="CM_TopMenu_Gold" text="Gold" />, <GuideIconInline name="CM_TopMenu_Irregular_01" text="Irregular Cells" />, <GuideIconInline name="CM_Mission_Box04" text="Affection Chest" />, <GuideIconInline name="TI_Common_Box05" text="Upgrade Stone Chest" />, and a small (~5%) chance for Irregular gear:
            </p>
            <ul className="list-disc pl-6 space-y-2">
                <li>
                    <GuideIconInline name="TI_Equipment_Irregular_Accessary_01" text="Briareos's Ambition" /> and <GuideIconInline name="TI_Equipment_Irregular_Weapon_01" text="Briareos's Recklessness" /> from <GuideIconInline name="pursuit-iron-stretcher_portrait" text="Iron Stretcher" size={50} /> / <GuideIconInline name="pursuit-blockbuster_portrait" text="BlockBuster" size={50} />
                </li>
                <li>
                    <GuideIconInline name="TI_Equipment_Irregular_Accessary_02" text="Gorgon's Vanity" /> and <GuideIconInline name="TI_Equipment_Irregular_Weapon_02" text="Gorgon's Wrath" /> from <GuideIconInline name="pursuit-mutated-wyvre_portrait" text="Mutated Wyvre" size={50} /> / <GuideIconInline name="pursuit-queen_portrait" text="Irregular Queen" size={50} />
                </li>
            </ul>
            <p>
                Farm until you reach 8K cells/month (for 2K <GuideIconInline name="TI_Item_Cristal_Cash" text="Ether" /> pass rewards), then use any extra stamina to farm more if you need.
            </p>

            <GuideHeading level={4} className={decoration}>Tower Floors</GuideHeading>
            <p>
                At least clear Normal floor 100 and Hard floor 17 each month (clear all floor if possible to empty the shop). Will cost 500+ <GuideIconInline name="CM_Goods_Stamina" text="" />, depending on progress.
            </p>

            <GuideHeading level={4} className={decoration}>Adventure License</GuideHeading>
            <p>
                Clear as many bosses as you can weekly. Each attempt costs 10 <GuideIconInline name="CM_Goods_Stamina" text="" /> (2 attempts per boss). Doing 1 per day helps avoid a large stamina drain at week&apos;s end.<br />
                Rewards: <GuideIconInline name="CM_TopMenu_Gold" text="Gold" />, <GuideIconInline name="CM_TopMenu_Licence" text="License points" />, <GuideIconInline name="TI_G_Dungeon_Box02" text="Aventurer Chest" /> (note that the chest can reward you with 15 <GuideIconInline name="CM_Goods_Stamina" text="" />)
            </p>

            <GuideHeading level={3} className={decoration}>Total baseline</GuideHeading>
            <p>
                ~560 <GuideIconInline name="CM_Goods_Stamina" text="" /> + however much you spend on Irregular Bosses, Tower, and Adventure License.
            </p>

            <GuideHeading level={4} className={decoration}>(Optional) Monad Gate</GuideHeading>
            <p>
                Doing 1 run per day is to consider since you can grab some useful titles like <GuideIconInline name="EBT_WORLD_BOSS_TITLE" text="Tuner" /> that gives you +10% <GuideIconInline name="CM_TopMenu_Gold" text="Gold" /> and 15% increased drop rate during Special Request content.<br />
                Costs 30 <GuideIconInline name="CM_Goods_Stamina" text="" /> per run.
            </p>

            <GuideHeading level={4} className={decoration}>(Optional) Stage 13 Armor Bosses</GuideHeading>
            <p>
                If you&apos;re low on transcend fodder and want <GuideIconInline name="TI_Equipment_Growth03" text="Armor Glunites" />, farm them to get <GuideIconInline name="TI_Craft_Material_Equipment_Growth_01" text="Armor Glunite Fragments" />.<br />
                Costs 240 <GuideIconInline name="CM_Goods_Stamina" text="" /> per day.
            </p>

            <hr className="my-4" />

            <p>If you&apos;re not yet in the endgame, here are other suggestions:</p>

            <ul className="list-disc pl-6 space-y-2">
                <li>
                    <strong className={decoration}>Farm Stage 12 Armor Bosses</strong>: Focus on <ElementInlineTag element='earth' />, <ElementInlineTag element='light' />, and either <ElementInlineTag element='dark' /> or <ElementInlineTag element='water' /> until you get what you need. <ElementInlineTag element='fire' /> gear is less useful unless you&apos;re chasing specific stats. Clearing 3 stage 12 bosses costs 36 <GuideIconInline name="CM_Goods_Stamina" text="" />.
                </li>
                <li>
                    <strong className={decoration}>Hard Mode Story Bosses</strong>: Great for <GuideIconInline name="TI_Present_01_01" text="Affection Items" />, <GuideIconInline name="TI_Item_Growth_Earth_02" text="Upgrade Stones" />, <GuideIconInline name="stats" text="Gems" />, and <GuideIconInline name="TI_Item_Growth_Dissolve_04" text="Legendary Reforge Catalyst" /> (from 5★ dismantle).
                </li>
            </ul>

            <p>
                ⚠️ <strong className={decoration}>Avoid clicking &quot;Receive All&quot; in your mailbox</strong>: Stamina rewards stay for ~6 days. Let your bar regenerate naturally, then claim rewards as needed to cover your dailies.
            </p>

            <p>
                Note: Other dailies like <strong>Bounty Hunter</strong> are also valuable, but they use <GuideIconInline name="TI_Item_Ticket_Gold" text="Tickets" />, not <GuideIconInline name="CM_Goods_Stamina" text="Stamina" />.
            </p>
        </div>
    );
}
