'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import CalamariTeamsData from './Grand-Calamari.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const CalamariTeams = CalamariTeamsData as Record<string, TeamData>

export default function GrandCalamari13Guide() {
    return (
        <GuideTemplate
            title="グランドカラマリ特殊依頼攻略ガイド"
            introduction="グランドカラマリはバフ除去が無効で、毎ターンデバフ持続時間を1ターン短縮します。この戦いの鍵は{D/BT_SEALED}、{D/BT_STEAL_BUFF}、または{D/BT_STATBUFF_CONVERT_TO_STATDEBUFF}を使ってボスのバフ獲得を防ぐことです。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay bossKey='Grand Calamari' modeKey='Special Request: Ecology Study' defaultBossId='403400362' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "バフ除去無効。{D/BT_SEALED}、{D/BT_STEAL_BUFF}、または{D/BT_STATBUFF_CONVERT_TO_STATDEBUFF}でボスのバフ獲得を防ぎましょう。",
                                "毎ターンデバフ持続時間を1ターン短縮します。こまめにデバフを再付与しましょう。",
                                "{D/BT_STAT|ST_BUFF_CHANCE}デバフを付与します。パッシブクレンズ発動を持つクレンザーを編成しましょう。",
                                "{E/Light}ユニットのみWGダメージを与えられます。"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={CalamariTeams.grandCalamariSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="O9cxC5paoes" title="グランドカラマリ13 – クリアラン映像" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
