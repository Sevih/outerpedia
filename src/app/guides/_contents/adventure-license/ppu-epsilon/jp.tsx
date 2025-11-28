'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import ppuEpsilonALTeamsData from './ppuEpsilonAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const ppuEpsilonALTeams = ppuEpsilonALTeamsData as Record<string, TeamData>

export default function PpuEpsilonGuide() {
    return (
        <GuideTemplate
            title="惑星浄化ユニット & イプシロン 冒険者ライセンス攻略"
            introduction="惑星浄化ユニットとイプシロンは常に復活するメカニズムを持っています。まず両方のイプシロンを倒して、メインボスのダメージ軽減とWG免疫を解除しましょう。ボスの必殺技を待ってから敵を一緒に倒しましょう。1〜2回でクリア可能。10段階まで検証済み。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '攻略',
                    content: (
                        <>
                            <div className="space-y-4">
                                <BossDisplay bossKey='Planet Purification Unit' modeKey='Adventure License' defaultBossId='51000015' />
                                <BossDisplay bossKey='Epsilon' modeKey='Adventure License' defaultBossId='51000016' />
                            </div>
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "まず両方のイプシロンを倒しましょう。イプシロンが生存している間、メインボスは受けるダメージが軽減され、WGダメージを受けません。",
                                    "すべての敵は倒れた味方を復活させることができます - ボスの必殺技を待ってから敵を一緒に倒しましょう。",
                                    "イプシロンが倒れると、他の雑魚のHPを30〜70%減少させます。",
                                    "メインボスの必殺技は倒れた味方全体を強化状態で復活させます - ボスの必殺技を待ってから敵を倒しましょう。"
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={ppuEpsilonALTeams.ppuEpsilonAL} defaultStage="Classic Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="X-ZpolvLR5I"
                                title="惑星浄化ユニット イプシロン - 冒険者ライセンス - 10段階 - 1回クリア (オート)"
                                author="XuRenChao"
                                date="01/10/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
