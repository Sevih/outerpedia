'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import AnnihilatorJCTeamsData from './AnnihilatorJC.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharactersJune, recommendedCharactersDec } from './recommendedCharacters'

const AnnihilatorJCTeams = AnnihilatorJCTeamsData as Record<string, TeamData>

export default function AnnihilatorGuide() {
  return (
    <GuideTemplate
      title="エクスタミネーター 共同作戦ガイド"
      introduction="共同作戦ボス。ボスはS1で{B/BT_SHIELD_BASED_CASTER}を獲得し、{E/Dark}ユニットはAP消費が最適化されます。単体攻撃は70%のダメージ減少とWG回復でペナルティを受けます。非攻撃スキルはボスに20,000の固定ダメージを与えます。"
      defaultVersion="december2025"
      versions={{
        december2025: {
          label: '2025年12月版',
          content: (
            <>
              <BossDisplay bossKey='Annihilator' modeKey='Joint Challenge' defaultBossId='4318062' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "ボスはS1で{B/BT_SHIELD_BASED_CASTER}を獲得 - {D/BT_REMOVE_BUFF}で解除。",
                  "{E/Dark}ユニットはAP消費が50%減少。",
                  "単体攻撃は70%のダメージ減少、ボスのWGを3回復。",
                  "非攻撃スキルはボスに10,000の固定ダメージを2回与える。"
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharactersDec} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={AnnihilatorJCTeams.annihilatorJCdec} defaultStage="Recommended Team" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="g64GWfYydvQ"
                title="エクスタミネーター - 共同作戦 - ベリーハード"
                author="Sevih"
                date="23/12/2025"
              />
            </>
          ),
        },
        june2025: {
          label: '2025年6月版',
          content: (
            <>
              <BossDisplay bossKey='Annihilator' modeKey='Joint Challenge' defaultBossId='4318062' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "ボスはS1で{B/BT_SHIELD_BASED_CASTER}を獲得 - {D/BT_REMOVE_BUFF}で解除。",
                  "{E/Dark}ユニットはAP消費が50%減少。",
                  "単体攻撃は70%のダメージ減少、ボスのWGを3回復。",
                  "非攻撃スキルはボスに10,000の固定ダメージを2回与える。"
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharactersJune} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={AnnihilatorJCTeams.annihilatorJCjune} defaultStage="Recommended Team" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="5r3gji7y6E0"
                title="エクスタミネーター - 共同作戦 - ベリーハード"
                author="Sevih"
                date="25/06/2025"
              />
            </>
          ),
        },
        legacy2024: {
          label: 'レガシー (2024年動画)',
          content: (
            <>
              <CombatFootage
                videoId="8d88RKTABNA"
                title="エクスタミネーター 共同作戦"
                author="Ducky"
                date="01/01/2024"
              />
            </>
          ),
        },
      }}
    />
  )
}
