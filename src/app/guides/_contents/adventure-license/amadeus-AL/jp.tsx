'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import AmadeusALTeamsData from './AmadeusAL.json'
import type { TeamData } from '@/types/team'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import TacticalTips from '@/app/components/TacticalTips'

const AmadeusALTeams = AmadeusALTeamsData as Record<string, TeamData>

const recommendedCharacters = [
    {
        names: "Dianne",
        reason: {
            en: "Ideal as both her heals are attacks, and she can {B/BT_REMOVE_DEBUFF} without triggering the boss mechanic.",
            jp: "両方の回復が攻撃であり、ボスのメカニズムを発動させずに{B/BT_REMOVE_DEBUFF}できるため理想的。"
        }
    },
    {
        names: "Kuro",
        reason: {
            en: "Shines with {D/BT_STATBUFF_CONVERT_TO_STATDEBUFF}. Use S3 after boss self-buffs to convert them into long debuffs.",
            jp: "{D/BT_STATBUFF_CONVERT_TO_STATDEBUFF}で活躍。ボスの自己バフ後にS3を使用し、長時間のデバフに変換。"
        }
    },
    {
        names: ["Drakhan", "Gnosis Beth"],
        reason: {
            en: "MVPs thanks to their repeated debuffs.",
            jp: "繰り返しデバフを付与できるためMVP。"
        }
    },
    {
        names: "Akari",
        reason: {
            en: "Works even without {D/BT_SEALED} thanks to her broad debuff kit.",
            jp: "幅広いデバフキットのおかげで{D/BT_SEALED}なしでも機能。"
        }
    },
    {
        names: "Skadi",
        reason: {
            en: "Could be used to fill a slot as the buffs can help the team do more damage.",
            jp: "バフがチームのダメージを増加させるため、スロット埋めとして使用可能。"
        }
    }
]

export default function AmadeusALGuide() {
    return (
        <GuideTemplate
            title="アマデウス 冒険者ライセンス攻略ガイド"
            introduction="アマデウス冒険者ライセンスは、特殊依頼ステージ12と同じスキルが特徴です。適切なチーム編成で通常1〜2回の挑戦でクリア可能です。この戦略はステージ10まで検証済みです。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay bossKey='Amadeus' modeKey='Adventure License' defaultBossId='51000026' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "激怒メカニズムが発動する前に十分な{D/BT_WG_REVERSE_HEAL}を与えるため、デバフを付与し続けてください。",
                                    "ボスは免疫を無視するランダムなデバフを付与します。デバフが付与された後のクレンズが重要です。",
                                    "ボスは毎ラウンド、パーティのデバフを1ターン延長します。クレンズを計画的に。",
                                    "非攻撃スキルを持つキャラクターは使用しないでください。ボスに永続的なクリティカルヒットバフを与えてしまいます。"
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={AmadeusALTeams.amadeusAL} defaultStage="Recommended Team" replace={{ lead: "", mid: "", tail: "" }} />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="EJNnAhVZPkY"
                                title="Amadeus - Adventure License - Stage 10 - 1 run clear (Auto) - by XuRenChao"
                                author="XuRenChao"
                                date="08/09/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
