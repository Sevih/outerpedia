'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import ToddlerALTeamsData from './ToddlerAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const ToddlerALTeams = ToddlerALTeamsData as Record<string, TeamData>

export default function TyrantToddlerGuide() {
    return (
        <GuideTemplate
            title="タイラントの幼生 冒険者ライセンス ガイド"
            introduction="特殊依頼ステージ12と同じスキル。1〜2回の挑戦でクリア可能。ステージ10まで検証済み。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <div className="space-y-4">
                                <BossDisplay bossKey='Tyrant Toddler' modeKey='Adventure License' defaultBossId='51000004' />
                                <BossDisplay bossKey='Deformed Inferior Core' modeKey='Adventure License' defaultBossId='51000005' labelFilter={"Weekly Conquest - Tyrant Toddler"} />
                            </div>
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "バーストスキル、連携、チェーンスキル以外の攻撃でWGダメージを受けない。",
                                "{C/Healer}と{C/Defender}の味方はスピードが50%UPし、防御力に応じてダメージがUPする。"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={ToddlerALTeams.toddlerAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="i7HvX6Gzic8" title="タイラントの幼生 - 冒険者ライセンス - ステージ10 - 1回クリア" author="XuRenChao" date="11/08/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
