'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import PrototypeEx78TeamsData from './PrototypeEx78JC.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharactersOct } from './recommendedCharacters'

const PrototypeEx78Teams = PrototypeEx78TeamsData as Record<string, TeamData>

export default function PrototypeEx78Guide() {
  return (
    <GuideTemplate
      title="試作機:EX-78 共同作戦ガイド"
      introduction="共同作戦ボス。ボスは最も左側の敵を優先し、対象が{C/Healer}でない場合、自身に{B/BT_DAMGE_TAKEN}を付与します。{E/Earth}と{E/Water}の敵からのダメージが増加。{B/BT_CALL_BACKUP}からのWGダメージが100%増加。"
      defaultVersion="october2025"
      versions={{
        october2025: {
          label: '2025年10月版',
          content: (
            <>
              <BossDisplay bossKey='Prototype EX-78' modeKey='Joint Challenge' defaultBossId='4548181' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "S1は最も左側の敵を優先 - {B/BT_DAMGE_TAKEN}バフを防ぐため{C/Healer}を配置。",
                  "{E/Earth}と{E/Water}からのダメージ増加、{E/Fire}、{E/Light}、{E/Dark}からは減少。",
                  "{D/BT_DOT_POISON}状態の時、受けるダメージが増加。",
                  "弱体効果を持つ敵から攻撃されると、その敵のCPを30減少。",
                  "ボスが解除可能なバフを持っている場合、攻撃後にWGを10%回復。",
                  "{B/BT_CALL_BACKUP}からのWGダメージが100%増加。"
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharactersOct} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={PrototypeEx78Teams.october2025} defaultStage="Recommended Team" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="jw0GIwox7YM"
                title="試作機:EX-78 - 共同作戦 - (オート) ベリーハード"
                author="XuRenChao"
                date="28/10/2025"
              />
            </>
          ),
        },
        legacy2024: {
          label: 'レガシー (2024年動画)',
          content: (
            <>
              <CombatFootage
                videoId="UuspJgswwNQ"
                title="試作機:EX-78 共同作戦 最高スコア"
                author="Ducky"
                date="01/12/2024"
              />
            </>
          ),
        },
      }}
    />
  )
}
