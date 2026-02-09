'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import BossDisplay from '@/app/components/BossDisplay'
import CalamariALTeamsData from './CalamariAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const CalamariALTeams = CalamariALTeamsData as Record<string, TeamData>

export default function CalamariALGuide() {
    return (
        <GuideTemplate
            title="グラン・カラマリー 冒険者ライセンス ガイド"
            introduction="スペシャルリクエスト ステージ12と同じスキル構成で、1〜2回の挑戦でクリア可能です。ステージ10まで検証済み。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay bossKey='Grand Calamari' modeKey='Adventure License' defaultBossId='51000023' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "ボスは強化効果を持っている時、受けるWGダメージを100%DOWNさせるため、{D/BT_STEAL_BUFF}、{D/BT_STATBUFF_CONVERT_TO_STATDEBUFF}、{D/BT_SEALED}を使用してください。",
                                "ボスは{E/Light}ユニットから受けるダメージがUPし、{E/Light}以外のユニットからのWGダメージがDOWNします。"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={CalamariALTeams.calamariAL} defaultStage="Recommended Team" />
                        </>
                    ),
                },
            }}
        />
    )
}
