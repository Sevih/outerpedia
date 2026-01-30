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
      title="하르슈나 월드보스 공략 가이드"
      introduction="첫 번째 팀은 디버프를 피해야 합니다. 그렇지 않으면 보스에게 많은 추가 턴을 줍니다. 4턴 동안 방어력 감소를 적용할 디펜더를 편성해야 합니다. 두 번째 팀에는 디버프가 필요합니다. 화상 팀이나 GBeth처럼 디버프 DPS 팀을 사용할 필요는 없습니다. 최소 하나의 디버프를 유지할 수 있으면 됩니다."
      defaultVersion="july2025"
      versions={{
        february2026: {
          label: '2026년 2월',
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
                      "첫 번째 팀은 디버프를 피해야 합니다. 그렇지 않으면 보스에게 많은 추가 턴을 줍니다.",
                      "4턴 동안 {D/BT_STAT|ST_DEF_IR}를 적용할 {C/Defender}를 편성해야 합니다."
                    ]
                  },
                  {
                    title: "phase2",
                    tips: [
                      "두 번째 팀에는 디버프가 필요합니다. 화상 팀이나 {P/Gnosis Beth}처럼 디버프 DPS 팀을 사용할 필요는 없습니다. 최소 하나의 디버프를 유지할 수 있으면 됩니다.",
                      "{I-W/Rampaging Caracal}을 장착한 {C/Ranger}로 가능합니다.",
                      "{I-W/Noblewoman's Guile}을 장착한 우수한 광역 {C/Mage}로도 가능합니다."
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
                title="하르슈나 - 월드보스 - SSS - 익스트림 리그"
                author="Sevih"
                date="01/07/2025"
              />
            </>
          ),
        },

        july2025: {
          label: '2025년 7월',
          content: (
            <>
              <GuideHeading level={3}>공략 개요</GuideHeading>
              <GuideHeading level={4}>페이즈 1: 망령룡 하르슈나 스킬</GuideHeading>
              <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><strong>S1</strong>: 단일, <EffectInlineTag name="BT_DOT_POISON" type="debuff" />. 전열 우선.</li>
                <li><strong>S2</strong>: 전체, <EffectInlineTag name="BT_DOT_POISON_IR" type="debuff" /> 2턴</li>
                <li><strong>S3</strong>: 전체, 방어력 30% 관통. 시전자에게 해제 가능한 버프가 있으면 <EffectInlineTag name="BT_FREEZE_IR" type="debuff" /> 1턴 부여.</li>

                <li><strong>패시브</strong>: 시전자에게 해제 가능한 디버프가 있으면 약점 게이지 피해를 받지 않음.</li>

                <li><strong>패시브</strong>: 적 팀에게 <EffectInlineTag name="UNIQUE_DAHLIA_A" type="buff" /> 부여.</li>
                <ol className='ml-10'>
                  <li><ClassInlineTag name='Defender' />: 행동 시, <EffectInlineTag name="BT_STAT|ST_DEF_IR" type="debuff" /> 4턴 부여.</li>
                  <li><ClassInlineTag name='Healer' />: 우선 회복 효율 50% 증가.</li>
                  <li><ClassInlineTag name='Mage' />: <StatInlineTag name='CHD' /> +50%.</li>
                  <li><ClassInlineTag name='Ranger' />: 행동 시, 보스 최대 HP의 3% 피해.</li>
                  <li><ClassInlineTag name='Striker' />: <StatInlineTag name='ATK' /> +30%.</li>
                </ol>
                <li><strong>패시브</strong>: 아군이 디버프를 받으면 시전자의 우선도가 100% 증가.</li>
                <li><strong>패시브</strong>: 턴 종료 시, 시전자에게 해제 가능한 디버프가 있으면 약점 게이지 20 회복.</li>
                <li><strong>패시브</strong>: <EffectInlineTag name="BT_DOT_CURSE" type="debuff" />로 인한 피해는 5,000을 초과하지 않음.</li>
              </ul>
              <hr className="my-6 border-neutral-700" />
              <GuideHeading level={4}>페이즈 2: 환영의 빙룡 하르슈나 스킬</GuideHeading>
              <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><strong>S1</strong>: 단일, 시전자의 <EffectInlineTag name="BT_REMOVE_DEBUFF" type="buff" /> 1개 해제. 가장 왼쪽 적 우선.</li>
                <li><strong>S2</strong>: 전체, 방어력 30% 관통. <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /> <EffectInlineTag name="BT_SEAL_COUNTER" type="buff" />.</li>
                <li><strong>S3</strong>: 전체, 시전자에게 디버프가 없으면 대상의 방어력 100% 무시.</li>
                <li><strong>패시브</strong>: 시전자에게 디버프가 없으면 약점 게이지를 감소시킬 수 없음.</li>
                <li><strong>패시브</strong>: <EffectInlineTag name="BT_STEALTHED" type="buff" />를 가진 적으로부터 약점 게이지 피해 증가.</li>
                <ol className='ml-10'>
                  <li><ClassInlineTag name='Defender' />: 단일 공격을 받으면 <EffectInlineTag name="BT_STEALTHED" type="buff" /> 2턴 부여.</li>
                  <li><ClassInlineTag name='Healer' />: 우선 회복 효율 50% 증가.</li>
                  <li><ClassInlineTag name='Mage' />: <StatInlineTag name='CHD' /> +50%.</li>
                  <li><ClassInlineTag name='Ranger' />: <StatInlineTag name='EFF' /> 100% 증가.</li>
                  <li><ClassInlineTag name='Striker' />: <StatInlineTag name='ATK' /> +30%.</li>
                </ol>
                <li><strong>패시브</strong>: 스킬 체인으로 인한 약점 게이지 피해 50% 감소.</li>
                <li><strong>패시브</strong>: 턴 종료 시, 시전자에게 디버프가 없으면 약점 게이지 20 회복, 체인 포인트 50 감소.</li>
                <li><strong>패시브</strong>: <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" />는 10,000을 초과하지 않음.</li>
              </ul>
              <hr className="my-6 border-neutral-700" />
              <GuideHeading level={4}>캐릭터 및 조언</GuideHeading>

              <p>첫 번째 팀은 디버프를 피해야 합니다. 그렇지 않으면 보스에게 많은 추가 턴을 줍니다.</p>
              <p>4턴 동안 <EffectInlineTag name="BT_STAT|ST_DEF_IR" type="debuff" />를 적용할 <ClassInlineTag name='Defender' />를 편성해야 합니다.</p>
              <p>두 번째 팀에는 디버프가 필요합니다. 화상 팀이나 GBeth처럼 디버프 DPS 팀을 사용할 필요는 없습니다. 최소 하나의 디버프를 유지할 수 있으면 됩니다.</p>

              <p className='font-bold underline mt-2'>페이즈 1 추천 캐릭터</p>
              <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><CharacterLinkCard name="Demiurge Drakhan" /> <CharacterLinkCard name="Kappa" /> <CharacterLinkCard name="Leo" /> : <ClassInlineTag name='Defender' />.</li>
                <li><CharacterLinkCard name="Ryu Lion" /> <CharacterLinkCard name="Rey" /> <CharacterLinkCard name="Ame" /> : 디버프 없는 강력한 <ElementInlineTag element='earth'/> DPS.</li>
                <li><CharacterLinkCard name="Demiurge Luna" /> <CharacterLinkCard name="Maxwell" /> <CharacterLinkCard name="Regina" /> <CharacterLinkCard name="Demiurge Astei" />: 디버프 없는 다른 강력한 DPS.</li>
                <li><CharacterLinkCard name="Fran" />: <EffectInlineTag name="BT_STAT|ST_COUNTER_RATE" type="buff" />와 <EffectInlineTag name="BT_SHIELD_BASED_CASTER" type="buff" />.</li>
                <li><CharacterLinkCard name="Charlotte" />: <EffectInlineTag name="BT_STAT|ST_ATK" type="buff" />.</li>
                <li><CharacterLinkCard name="Valentine" />: <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> <EffectInlineTag name="BT_STAT|ST_CRITICAL_RATE" type="buff" /> <EffectInlineTag name="BT_STAT|ST_CRITICAL_DMG_RATE" type="buff" /> (S3는 사용하지 마세요).</li>
                <li><CharacterLinkCard name="Dianne" /><CharacterLinkCard name="Astei" /><CharacterLinkCard name="Nella" />: <EffectInlineTag name="BT_IMMUNE" type="buff" /></li>
              </ul>
              <p className='mt-4'><ClassInlineTag name='Defender' />를 편성하면 <EffectInlineTag name="BT_STAT|ST_DEF_IR" type="debuff" />로 페이즈 1을 쉽게 통과할 수 있습니다.</p>
              <p className='font-bold underline mt-2'>페이즈 2 추천 캐릭터</p>
              <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><CharacterLinkCard name="Gnosis Beth" />: <EffectInlineTag name="BT_STEALTHED" type="buff" /> <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> <EffectInlineTag name="BT_DOT_2000092" type="debuff" />와 높은 피해.</li>
                <li><CharacterLinkCard name="Notia" />: <EffectInlineTag name="BT_DOT_POISON" type="debuff" />와 <EffectInlineTag name="BT_STAT|ST_ATK" type="debuff" /> <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> 같은 디버프 유지 가능.</li>
                <li><CharacterLinkCard name="Akari" />: <EffectInlineTag name="BT_SEALED" type="debuff" /> <EffectInlineTag name="BT_EXTEND_DEBUFF" type="debuff" />.</li>
                <li><CharacterLinkCard name="Roxie" />: <EffectInlineTag name="BT_DOT_LIGHTNING" type="debuff" /> <EffectInlineTag name="BT_EXTEND_DEBUFF" type="debuff" />.</li>
                <li><CharacterLinkCard name="Bell Cranel" /><CharacterLinkCard name="Vlada" /><CharacterLinkCard name="Maxie" /><CharacterLinkCard name="Ember" />: <EffectInlineTag name="BT_DOT_BURN" type="debuff" /> 전문가.</li>
                <li><CharacterLinkCard name="Monad Eva" />: 여전히 강력.</li>
                <li><CharacterLinkCard name="Fran" />: <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> <EffectInlineTag name="BT_STAT|ST_COUNTER_RATE" type="buff" />와 <EffectInlineTag name="BT_EXTEND_BUFF" type="buff" /> (보스의 S2 이후에 사용하세요).</li>
              </ul>
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={HarshnaTeams.july2025} defaultStage="No Debuff Team" />
              <hr className="my-6 border-neutral-700" />
              <YoutubeEmbed videoId="13vcQM1kMEg" title="하르슈나 - 월드보스 - SSS - 익스트림 리그 by Sevih" />
            </>
          ),
        },

        legacy2024: {
          label: '레거시 (2024년 영상)',
          content: (
            <>
              <div>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold mb-2">영상 가이드</h2>
                  <p className="mb-2 text-neutral-300">
                    아직 완전한 문서 가이드가 작성되지 않았습니다. 현재로서는 <strong>Ducky</strong>의 이 영상을 추천합니다:
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
