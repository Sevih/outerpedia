'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import TyrantTeamsData from './Tyrant.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const TyrantTeams = TyrantTeamsData as Record<string, TeamData>

export default function TyrantGuide() {
    return (
        <GuideTemplate
            title="タイラント特殊依頼攻略ガイド"
            introduction="タイラントトドラーはデバフの素早いクレンズが重要です。戦闘開始時に{D/BT_DOT_POISON}、{D/BT_DOT_BLEED}、{D/BT_DOT_LIGHTNING}が即座に積まれ、すぐにクレンズしないと非常に早く倒されます。AoEクレンズを持つユニットが必須です。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay bossKey='Tyrant Toddler' modeKey='Special Request: Ecology Study' defaultBossId='401400262' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "戦闘開始時に自チームとボスの両方に{D/BT_DOT_POISON}、{D/BT_DOT_BLEED}、{D/BT_DOT_LIGHTNING}が即座に積まれます。",
                                "これらのDoTはすぐにクレンズしないと非常に早く倒されます。",
                                "ViellaとDianneのS3は全デバフの全持続時間をクレンズし、このボスを簡単にします。",
                                "バーストスキル、デュアルアタック、スキルチェインからのみWGダメージを受けます。",
                                "{C/Healer}と{C/Defender}の味方はスピード+50%で、防御力に基づいたダメージ増加を得ます。",
                                "ステージ12：{C/Healer}と{C/Defender}のスピードを50%増加させ、ダメージが防御力で計算されます。他の全クラスはダメージが95%減少します。",
                                "ステージ13：クリティカルヒット率を完全に減少させ、{C/Defender}以外の全クラスのダメージを95%減少させます。"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={TyrantTeams.tyrantSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="n9-IcrXHyBA" title="タイラント戦闘映像" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
