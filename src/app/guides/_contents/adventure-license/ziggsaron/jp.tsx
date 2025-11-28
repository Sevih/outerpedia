'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import ZiggsaronALTeamsData from './ZiggsaronAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const ZiggsaronALTeams = ZiggsaronALTeamsData as Record<string, TeamData>

export default function RavenousWolfKingZiggsaronGuide() {
    return (
        <GuideTemplate
            title="餓狼王ジグサロン 冒険者ライセンス ガイド"
            introduction="ウィークリー討伐ボス。永続的な攻撃力減少と毎ターン開始時に強化不可を付与。スピード型以外からのダメージ減少、水属性以外からのWGダメージ-50%。4ターンごとに狂暴化し、致命的な必殺技を使用。1-2回の挑戦でクリア可能。ステージ10まで検証済み。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay bossKey='Ravenous Wolf King, Ziggsaron' modeKey='Adventure License' defaultBossId='51000034' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "チーム全体に解除不可の{D/BT_STAT|ST_ATK}が永続的に付与される。",
                                "毎ターン開始時に{D/BT_SEALED}を1ターン付与。",
                                "反撃、復讐、迅速対応を無効化。",
                                "{C/Ranger}以外からのダメージ減少。"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={ZiggsaronALTeams.ziggsaronAL} defaultStage="No Ranger" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="Nlt72xRKMpo" title="ジグサロン - 冒険者ライセンス - ステージ10 - 1回クリア (オート)" author="XuRenChao" date="19/08/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
