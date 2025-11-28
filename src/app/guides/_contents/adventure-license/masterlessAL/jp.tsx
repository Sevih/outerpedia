'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import masterlessALTeamsData from './masterlessAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const masterlessALTeams = masterlessALTeamsData as Record<string, TeamData>

export default function MasterlessGuardianGuide() {
    return (
        <GuideTemplate
            title="主なきガーディアン 冒険免許ガイド"
            introduction="特別依頼ステージ12と同じスキル。1～2回でクリア可能。ステージ10まで確認済み。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay bossKey='Masterless Guardian' modeKey='Adventure License' defaultBossId='51000001' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "弱体効果がない場合、ボスはWGダメージを受けない。",
                                "ミニガーディアンは攻撃時にボスの行動ゲージを上げ、弱体効果を2つ解除する。"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={masterlessALTeams.masterlessAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="MZ39RaAYiv0" title="主なきガーディアン - 冒険免許 - ステージ10 - 1回クリア (オート)" author="XuRenChao" date="19/08/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
