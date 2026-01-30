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
      title="ハルシュナ ワールドボス攻略ガイド"
      introduction="最初のチームはデバフを持たないようにしましょう。そうしないとボスに多くの追加ターンを与えてしまいます。4ターンの防御力ダウンを付与するためにディフェンダーを編成すべきです。2番目のチームにはデバフが必要です。火傷コンプやGBethのようなデバフDPSチームを使う必要はありません。最低1つのデバフを維持できるようにしましょう。"
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
                      "最初のチームはデバフを持たないようにしましょう。そうしないとボスに多くの追加ターンを与えてしまいます。",
                      "4ターンの{D/BT_STAT|ST_DEF_IR}を付与するために{C/Defender}を編成すべきです。"
                    ]
                  },
                  {
                    title: "phase2",
                    tips: [
                      "2番目のチームにはデバフが必要です。火傷コンプや{P/Gnosis Beth}のようなデバフDPSチームを使う必要はありません。最低1つのデバフを維持できるようにしましょう。",
                      "{I-W/Rampaging Caracal}を装備した{C/Ranger}なら可能です。",
                      "{I-W/Noblewoman's Guile}を装備した優秀なAoE {C/Mage}でも可能です。"
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
                title="ハルシュナ - ワールドボス - SSS - エクストリームリーグ"
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
              <GuideHeading level={3}>攻略概要</GuideHeading>
              <GuideHeading level={4}>フェーズ1：亡霊竜ハルシュナのスキル</GuideHeading>
              <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><strong>S1</strong>: 単体、<EffectInlineTag name="BT_DOT_POISON" type="debuff" />。前列優先。</li>
                <li><strong>S2</strong>: 全体、<EffectInlineTag name="BT_DOT_POISON_IR" type="debuff" /> 2ターン</li>
                <li><strong>S3</strong>: 全体、防御力30%貫通。術者に解除可能なバフがある場合、<EffectInlineTag name="BT_FREEZE_IR" type="debuff" /> 1ターン付与。</li>

                <li><strong>パッシブ</strong>: 術者に解除可能なデバフがある場合、弱点ゲージダメージを受けない。</li>

                <li><strong>パッシブ</strong>: 敵チームに<EffectInlineTag name="UNIQUE_DAHLIA_A" type="buff" />を付与。</li>
                <ol className='ml-10'>
                  <li><ClassInlineTag name='Defender' />: 行動時、<EffectInlineTag name="BT_STAT|ST_DEF_IR" type="debuff" /> 4ターン付与。</li>
                  <li><ClassInlineTag name='Healer' />: 優先回復効率50%増加。</li>
                  <li><ClassInlineTag name='Mage' />: <StatInlineTag name='CHD' /> +50%。</li>
                  <li><ClassInlineTag name='Ranger' />: 行動時、ボスの最大HPの3%ダメージ。</li>
                  <li><ClassInlineTag name='Striker' />: <StatInlineTag name='ATK' /> +30%。</li>
                </ol>
                <li><strong>パッシブ</strong>: 味方がデバフを受けると、術者の優先度が100%増加。</li>
                <li><strong>パッシブ</strong>: ターン終了時、術者に解除可能なデバフがある場合、弱点ゲージを20回復。</li>
                <li><strong>パッシブ</strong>: <EffectInlineTag name="BT_DOT_CURSE" type="debuff" />からのダメージは5,000を超えない。</li>
              </ul>
              <hr className="my-6 border-neutral-700" />
              <GuideHeading level={4}>フェーズ2：幻影の凍竜ハルシュナのスキル</GuideHeading>
              <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><strong>S1</strong>: 単体、術者の<EffectInlineTag name="BT_REMOVE_DEBUFF" type="buff" /> 1つ解除。最も左の敵優先。</li>
                <li><strong>S2</strong>: 全体、防御力30%貫通。<EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /> <EffectInlineTag name="BT_SEAL_COUNTER" type="buff" />。</li>
                <li><strong>S3</strong>: 全体、術者にデバフがない場合、対象の防御力100%無視。</li>
                <li><strong>パッシブ</strong>: 術者にデバフがない場合、弱点ゲージを減少できない。</li>
                <li><strong>パッシブ</strong>: <EffectInlineTag name="BT_STEALTHED" type="buff" />を持つ敵からの弱点ゲージダメージ増加。</li>
                <ol className='ml-10'>
                  <li><ClassInlineTag name='Defender' />: 単体攻撃を受けた時、<EffectInlineTag name="BT_STEALTHED" type="buff" /> 2ターン付与。</li>
                  <li><ClassInlineTag name='Healer' />: 優先回復効率50%増加。</li>
                  <li><ClassInlineTag name='Mage' />: <StatInlineTag name='CHD' /> +50%。</li>
                  <li><ClassInlineTag name='Ranger' />: <StatInlineTag name='EFF' /> 100%増加。</li>
                  <li><ClassInlineTag name='Striker' />: <StatInlineTag name='ATK' /> +30%。</li>
                </ol>
                <li><strong>パッシブ</strong>: スキルチェーンからの弱点ゲージダメージ50%減少。</li>
                <li><strong>パッシブ</strong>: ターン終了時、術者にデバフがない場合、弱点ゲージを20回復し、チェーンポイントを50減少。</li>
                <li><strong>パッシブ</strong>: <EffectInlineTag name="BT_FIXED_DAMAGE" type="debuff" />は10,000を超えない。</li>
              </ul>
              <hr className="my-6 border-neutral-700" />
              <GuideHeading level={4}>キャラクターとアドバイス</GuideHeading>

              <p>最初のチームはデバフを持たないようにしましょう。そうしないとボスに多くの追加ターンを与えてしまいます。</p>
              <p>4ターンの<EffectInlineTag name="BT_STAT|ST_DEF_IR" type="debuff" />を付与するために<ClassInlineTag name='Defender' />を編成すべきです。</p>
              <p>2番目のチームにはデバフが必要です。火傷コンプやGBethのようなデバフDPSチームを使う必要はありません。最低1つのデバフを維持できるようにしましょう。</p>

              <p className='font-bold underline mt-2'>フェーズ1推奨キャラクター</p>
              <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><CharacterLinkCard name="Demiurge Drakhan" /> <CharacterLinkCard name="Kappa" /> <CharacterLinkCard name="Leo" /> : <ClassInlineTag name='Defender' />。</li>
                <li><CharacterLinkCard name="Ryu Lion" /> <CharacterLinkCard name="Rey" /> <CharacterLinkCard name="Ame" /> : デバフなしの強力な<ElementInlineTag element='earth'/>DPS。</li>
                <li><CharacterLinkCard name="Demiurge Luna" /> <CharacterLinkCard name="Maxwell" /> <CharacterLinkCard name="Regina" /> <CharacterLinkCard name="Demiurge Astei" />: デバフなしの他の強力なDPS。</li>
                <li><CharacterLinkCard name="Fran" />: <EffectInlineTag name="BT_STAT|ST_COUNTER_RATE" type="buff" />と<EffectInlineTag name="BT_SHIELD_BASED_CASTER" type="buff" />。</li>
                <li><CharacterLinkCard name="Charlotte" />: <EffectInlineTag name="BT_STAT|ST_ATK" type="buff" />。</li>
                <li><CharacterLinkCard name="Valentine" />: <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> <EffectInlineTag name="BT_STAT|ST_CRITICAL_RATE" type="buff" /> <EffectInlineTag name="BT_STAT|ST_CRITICAL_DMG_RATE" type="buff" />（S3は使わないこと）。</li>
                <li><CharacterLinkCard name="Dianne" /><CharacterLinkCard name="Astei" /><CharacterLinkCard name="Nella" />: <EffectInlineTag name="BT_IMMUNE" type="buff" /></li>
              </ul>
              <p className='mt-4'><ClassInlineTag name='Defender' />を編成すると<EffectInlineTag name="BT_STAT|ST_DEF_IR" type="debuff" />でフェーズ1を楽に突破できます。</p>
              <p className='font-bold underline mt-2'>フェーズ2推奨キャラクター</p>
              <ul className="list-disc list-inside text-neutral-300 mb-4">
                <li><CharacterLinkCard name="Gnosis Beth" />: <EffectInlineTag name="BT_STEALTHED" type="buff" /> <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> <EffectInlineTag name="BT_DOT_2000092" type="debuff" />と高ダメージ。</li>
                <li><CharacterLinkCard name="Notia" />: <EffectInlineTag name="BT_DOT_POISON" type="debuff" />や<EffectInlineTag name="BT_STAT|ST_ATK" type="debuff" /> <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" />などのデバフを維持可能。</li>
                <li><CharacterLinkCard name="Akari" />: <EffectInlineTag name="BT_SEALED" type="debuff" /> <EffectInlineTag name="BT_EXTEND_DEBUFF" type="debuff" />。</li>
                <li><CharacterLinkCard name="Roxie" />: <EffectInlineTag name="BT_DOT_LIGHTNING" type="debuff" /> <EffectInlineTag name="BT_EXTEND_DEBUFF" type="debuff" />。</li>
                <li><CharacterLinkCard name="Bell Cranel" /><CharacterLinkCard name="Vlada" /><CharacterLinkCard name="Maxie" /><CharacterLinkCard name="Ember" />: <EffectInlineTag name="BT_DOT_BURN" type="debuff" />スペシャリスト。</li>
                <li><CharacterLinkCard name="Monad Eva" />: 相変わらず強力。</li>
                <li><CharacterLinkCard name="Fran" />: <EffectInlineTag name="BT_ACTION_GAUGE" type="buff" /> <EffectInlineTag name="BT_STAT|ST_COUNTER_RATE" type="buff" />と<EffectInlineTag name="BT_EXTEND_BUFF" type="buff" />（ボスのS2の後に使うこと）。</li>
              </ul>
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={HarshnaTeams.july2025} defaultStage="No Debuff Team" />
              <hr className="my-6 border-neutral-700" />
              <YoutubeEmbed videoId="13vcQM1kMEg" title="ハルシュナ - ワールドボス - SSS - エクストリームリーグ by Sevih" />
            </>
          ),
        },

        legacy2024: {
          label: 'レガシー（2024年動画）',
          content: (
            <>
              <div>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold mb-2">動画ガイド</h2>
                  <p className="mb-2 text-neutral-300">
                    完全な文章ガイドはまだ作成されていません。現時点では<strong>Ducky</strong>によるこの動画をお勧めします：
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
