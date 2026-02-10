'use client'

import { useState, useCallback } from 'react'
import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import MiniBossDisplay from '@/app/components/MiniBossDisplay'
import BeatlesTeamsData from './Beatles.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const BeatlesTeams = BeatlesTeamsData as Record<string, TeamData>

export default function BeatlesGuide() {
    const [selectedMode, setSelectedMode] = useState('Special Request: Identification')
    const [miniBossId, setMiniBossId] = useState('407600462')

    const handleBossChange = useCallback((dekrilId: string) => {
        // Dek'Ril IDs are 4076003XX, Mek'Ril IDs are 4076004XX (just +100)
        const mekrilId = String(Number(dekrilId) + 100)
        setMiniBossId(mekrilId)
    }, [])

    return (
        <GuideTemplate
            title="デクリル＆メクリル特殊依頼攻略ガイド"
            introduction="このボスの主要ギミックは回避です。チェインスキル以外のAoEスキルを使用すると回避バフを獲得します。{D/BT_STAT|ST_AVOID}を付与できるキャラクターと単体DPSがおすすめです。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay
                                bossKey="Dek'Ril"
                                modeKey='Special Request: Identification'
                                onModeChange={setSelectedMode}
                                onBossChange={handleBossChange}
                                defaultBossId='407600362' />
                            <MiniBossDisplay
                                bosses={[
                                    { bossKey: "Mek'Ril", defaultBossId: miniBossId }
                                ]}
                                modeKey='Special Request: Identification'
                                controlledMode={selectedMode}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "チェインスキル以外のAoEスキルを使用するとボスに{B/BT_STAT|ST_DEF}が付与されます。",
                                "キャラクターが{D/BT_DOT_POISON}を受けている場合、ボスは行動直後に反撃します。",
                                "メインボス（右側）のみが攻撃します。左側のボスは常に{B/BT_STAT|ST_ATK}をバフします。",
                                "左側のボスを倒すと、メインボスが{B/BT_INVINCIBLE}と{B/BT_STAT|ST_ATK}を獲得します。",
                                "{D/BT_STAT|BT_REMOVE_BUFF}や{D/BT_STAT|BT_STEAL_BUFF}を付与できるキャラクターが強く推奨されます。",
                                "{B/BT_STAT|ST_DEF}の発動を避けるため、単体DPSに集中しましょう。"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={BeatlesTeams.beatlesSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="eQmB1Uw9qL8" title="デクリル＆メクリル戦闘映像" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
