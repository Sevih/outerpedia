'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import GlicysALTeamsData from './GlicysAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const GlicysALTeams = GlicysALTeamsData as Record<string, TeamData>

export default function GlicysGuide() {
  return (
    <GuideTemplate
      title="グリシス 冒険者ライセンス ガイド"
      introduction="特別依頼ステージ12と同じスキル構成。HPが60%になると1ターンの間無敵、3ターンの間効果命中増加を獲得。1～2回の挑戦でクリア可能。ステージ10まで検証済み。"
      defaultVersion="default"
      versions={{
        default: {
          label: 'ガイド',
          content: (
            <>
              <BossDisplay bossKey='Glicys' modeKey='Adventure License' defaultBossId='51000009' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips tips={[
                "グリシスは手下がいない場合、受けるダメージが70%減少します。彼女にフルダメージを与えるために、少なくとも1体の手下を生存させておきましょう。",
                "HPが60%になると【狂暴化】状態になり、1ターンの間{B/BT_INVINCIBLE_IR}を獲得します。60%以下の状態で2回目の挑戦を開始すると、無敵フェーズをスキップできます。"
              ]} />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharacters} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={GlicysALTeams.glicysAL} defaultStage="Team 1 – Icebreaker" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage videoId="gufhBKd9kXw" title="Glicys - Adventure License - Stage 10 - 1 run clear (Auto)" author="XuRenChao" date="26/08/2025" />
            </>
          ),
        },
      }}
    />
  )
}
