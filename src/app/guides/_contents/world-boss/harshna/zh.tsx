'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'
import GuideHeading from '@/app/components/GuideHeading'
import ClassInlineTag from '@/app/components/ClassInlineTag'
import ElementInlineTag from '@/app/components/ElementInline'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import StatInlineTag from '@/app/components/StatInlineTag'
import { WorldBossDisplay } from '@/app/components/boss'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import HarshnaTeamsData from './Harshna.json'
import type { TeamData } from '@/types/team'
import { phase1Characters, phase2Characters } from './recommendedCharacters'

const HarshnaTeams = HarshnaTeamsData as Record<string, TeamData>

const harshnaFebruary2026 = {
  boss1Key: 'Revenant Dragon Harshna',
  boss2Key: 'Frozen Dragon of Phantasm Harshna',
  boss1Ids: {
    'Normal': '4086025',
    'Very Hard': '4086027',
    'Extreme': '4086029'
  },
  boss2Ids: {
    'Hard': '4086026',
    'Very Hard': '4086028',
    'Extreme': '4086030'
  }
} as const

export default function HarshnaGuide() {
  return (
    <GuideTemplate
      title="哈尔什纳世界Boss攻略指南"
      introduction="第一队应避免携带减益效果，否则会给Boss很多额外回合。你应该编入一个防御者来施加4回合的防御力下降。第二队需要减益效果。你不必使用以减益为DPS的队伍（如燃烧队或GBeth）。只需确保能维持至少一个减益效果即可。"
      defaultVersion="july2025"
      versions={{
        february2026: {
          label: '2026年2月',
          hidden:true,
          content: (
            <>
              <WorldBossDisplay config={harshnaFebruary2026} defaultMode="Extreme" />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                sections={[
                  {
                    title: "phase1",
                    tips: [
                      "第一队应避免携带减益效果，否则会给Boss很多额外回合。",
                      "你应该编入一个{C/Defender}来施加4回合的{D/BT_STAT|ST_DEF_IR}。"
                    ]
                  },
                  {
                    title: "phase2",
                    tips: [
                      "第二队需要减益效果。你不必使用以减益为DPS的队伍（如燃烧队或{P/Gnosis Beth}）。只需确保能维持至少一个减益效果即可。",
                      "任何装备{I-W/Rampaging Caracal}的{C/Ranger}都可以胜任。",
                      "任何装备{I-W/Noblewoman's Guile}的优秀群攻{C/Mage}也可以。"
                    ]
                  }
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList title="phase1" entries={phase1Characters} />
              <RecommendedCharacterList title="phase2" entries={phase2Characters} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={HarshnaTeams.february2026} defaultStage="No Debuff Team" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="13vcQM1kMEg"
                title="哈尔什纳 - 世界Boss - SSS - 极限联赛"
                author="Sevih"
                date="01/07/2025"
              />
            </>
          ),
        },

        july2025: {
          label: '2025年7月',
          content: (
            <>
              <GuideHeading level={3}>攻略概述</GuideHeading>
              <GuideHeading level={4}>阶段1：亡灵龙哈尔什纳技能</GuideHeading>
              <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><strong>S1</strong>：单体，<EffectInlineTag name="BT_DOT_POISON" type="debuff" />。优先前排。</li>
                <li><strong>S2</strong>：全体，<EffectInlineTag name="BT_DOT_POISON_IR" type="debuff" /> 2回合</li>
                <li><strong>S3</strong>：全体，穿透30%防御力。如果施法者有可驱散的增益，则造成<EffectInlineTag name="BT_FREEZE_IR" type="debuff" /> 1回合。</li>

                <li><strong>被动</strong>：如果施法者有可驱散的减益，不受弱点槽伤害。</li>

                <li><strong>被动</strong>：为敌方队伍施加<EffectInlineTag name="UNIQUE_DAHLIA_A" type="buff" />。</li>
                <ol className='ml-10'>
                  <li><ClassInlineTag name='Defender' />：行动时，造成<EffectInlineTag name="BT_STAT|ST_DEF_IR" type="debuff" /> 4回合。</li>
                  <li><ClassInlineTag name='Healer' />：优先恢复效率提升50%。</li>
                  <li><ClassInlineTag name='Mage' />：<StatInlineTag name='CHD' /> +50%。</li>
                  <li><ClassInlineTag name='Ranger' />：行动时，造成Boss最大生命值3%的伤害。</li>
                  <li><ClassInlineTag name='Striker' />：<StatInlineTag name='ATK' /> +30%。</li>
                </ol>
                <li><strong>被动</strong>：当队友被施加减益时，施法者优先度提升100%。</li>
                <li><strong>被动</strong>：回合结束时，如果施法者有可驱散的减益，恢复弱点槽20点。</li>
                <li><strong>被动</strong>：<EffectInlineTag name="BT_DOT_CURSE" type="debuff" />造成的伤害不超过5,000。</li>
              </ul>
              <hr className="my-6 border-neutral-700" />
              <GuideHeading level={4}>阶段2：幻影冰龙哈尔什纳技能</GuideHeading>
              <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><strong>S1</strong>：单体，<EffectInlineTag name="BT_REMOVE_DEBUFF" type="buff" />移除施法者1个减益。优先最左边的敌人。</li>
                <li><strong>S2</strong>：全体，穿透30%防御力。<EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /> <EffectInlineTag name="BT_SEAL_COUNTER" type="buff" />。</li>
                <li><strong>S3</strong>：全体，如果施法者没有减益，无视目标100%防御力。</li>
                <li><strong>被动</strong>：如果施法者没有减益，弱点槽无法被降低。</li>
                <li><strong>被动</strong>：增加来自拥有<EffectInlineTag name="BT_STEALTHED" type="buff" />的敌人的弱点槽伤害。</li>
                <ol className='ml-10'>
                  <li><ClassInlineTag name='Defender' />：被单体攻击命中时，获得<EffectInlineTag name="BT_STEALTHED" type="buff" /> 2回合。</li>
                  <li><ClassInlineTag name='Healer' />：优先恢复效率提升50%。</li>
                  <li><ClassInlineTag name='Mage' />：<StatInlineTag name='CHD' /> +50%。</li>
                  <li><ClassInlineTag name='Ranger' />：<StatInlineTag name='EFF' />提升100%。</li>
                  <li><ClassInlineTag name='Striker' />：<StatInlineTag name='ATK' /> +30%。</li>
                </ol>
                <li><strong>被动</strong>：来自技能连锁的弱点槽伤害降低50%。</li>
                <li><strong>被动</strong>：回合结束时，如果施法者没有减益，恢复弱点槽20点并减少连锁点数50点。</li>
                <li><strong>被动</strong>：<EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" />不超过10,000。</li>
              </ul>
              <hr className="my-6 border-neutral-700" />
              <GuideHeading level={4}>角色与建议</GuideHeading>

              <p>第一队应避免携带减益效果，否则会给Boss很多额外回合。</p>
              <p>你应该编入一个<ClassInlineTag name='Defender' />来施加4回合的<EffectInlineTag name="BT_STAT|ST_DEF_IR" type="debuff" />。</p>
              <p>第二队需要减益效果。你不必使用以减益为DPS的队伍（如燃烧队或GBeth）。只需确保能维持至少一个减益效果即可。</p>

              <p className='font-bold underline mt-2'>阶段1推荐角色</p>
              <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><CharacterLinkCard name="Demiurge Drakhan" /> <CharacterLinkCard name="Kappa" /> <CharacterLinkCard name="Leo" />：<ClassInlineTag name='Defender' />。</li>
                <li><CharacterLinkCard name="Ryu Lion" /> <CharacterLinkCard name="Rey" /> <CharacterLinkCard name="Ame" />：无减益的强力<ElementInlineTag element='earth'/>DPS。</li>
                <li><CharacterLinkCard name="Demiurge Luna" /> <CharacterLinkCard name="Maxwell" /> <CharacterLinkCard name="Regina" /> <CharacterLinkCard name="Demiurge Astei" />：其他无减益的强力DPS。</li>
                <li><CharacterLinkCard name="Fran" />：<EffectInlineTag name="BT_STAT|ST_COUNTER_RATE" type="buff" />和<EffectInlineTag name="BT_SHIELD_BASED_CASTER" type="buff" />。</li>
                <li><CharacterLinkCard name="Charlotte" />：<EffectInlineTag name="BT_STAT|ST_ATK" type="buff" />。</li>
                <li><CharacterLinkCard name="Valentine" />：<EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> <EffectInlineTag name="BT_STAT|ST_CRITICAL_RATE" type="buff" /> <EffectInlineTag name="BT_STAT|ST_CRITICAL_DMG_RATE" type="buff" />（不要使用她的S3）。</li>
                <li><CharacterLinkCard name="Dianne" /><CharacterLinkCard name="Astei" /><CharacterLinkCard name="Nella" />：<EffectInlineTag name="BT_IMMUNE" type="buff" /></li>
              </ul>
              <p className='mt-4'>编入<ClassInlineTag name='Defender' />可以通过<EffectInlineTag name="BT_STAT|ST_DEF_IR" type="debuff" />轻松通过阶段1。</p>
              <p className='font-bold underline mt-2'>阶段2推荐角色</p>
              <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><CharacterLinkCard name="Gnosis Beth" />：<EffectInlineTag name="BT_STEALTHED" type="buff" /> <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> <EffectInlineTag name="BT_DOT_2000092" type="debuff" />和高伤害。</li>
                <li><CharacterLinkCard name="Notia" />：可以维持<EffectInlineTag name="BT_DOT_POISON" type="debuff" />和<EffectInlineTag name="BT_STAT|ST_ATK" type="debuff" /> <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" />等减益。</li>
                <li><CharacterLinkCard name="Akari" />：<EffectInlineTag name="BT_SEALED" type="debuff" /> <EffectInlineTag name="BT_EXTEND_DEBUFF" type="debuff" />。</li>
                <li><CharacterLinkCard name="Roxie" />：<EffectInlineTag name="BT_DOT_LIGHTNING" type="debuff" /> <EffectInlineTag name="BT_EXTEND_DEBUFF" type="debuff" />。</li>
                <li><CharacterLinkCard name="Bell Cranel" /><CharacterLinkCard name="Vlada" /><CharacterLinkCard name="Maxie" /><CharacterLinkCard name="Ember" />：<EffectInlineTag name="BT_DOT_BURN" type="debuff" />专家。</li>
                <li><CharacterLinkCard name="Monad Eva" />：一如既往的强大。</li>
                <li><CharacterLinkCard name="Fran" />：<EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> <EffectInlineTag name="BT_STAT|ST_COUNTER_RATE" type="buff" />和<EffectInlineTag name="BT_EXTEND_BUFF" type="buff" />（确保在Boss的S2之后使用）。</li>
              </ul>
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={HarshnaTeams.july2025} defaultStage="No Debuff Team" />
              <hr className="my-6 border-neutral-700" />
              <YoutubeEmbed videoId="13vcQM1kMEg" title="哈尔什纳 - 世界Boss - SSS - 极限联赛 by Sevih" />
            </>
          ),
        },

        legacy2024: {
          label: '旧版（2024年视频）',
          content: (
            <>
              <div>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold mb-2">视频指南</h2>
                  <p className="mb-2 text-neutral-300">
                    目前还没有完整的文字指南。现在我们推荐观看<strong>Ducky</strong>的这个视频：
                  </p>
                </div>

                <YoutubeEmbed videoId="32qJPmuJDyg" title="Harsha World Boss 23mil. 1 Hour Long Fight by Ducky" />
              </div>
            </>
          ),
        },
      }}
    />
  )
}
