'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import BeatlesALTeamsData from './BeatlesAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'

const BeatlesALTeams = BeatlesALTeamsData as Record<string, TeamData>

const recommendedCharacters = [
    {
        names: ["Aer", "Kanon", "Bryn", "Bell Cranel"],
        reason: {
            en: "{E/Fire} DPS options.",
            jp: "{E/Fire}DPSオプション。"
        }
    },
    {
        names: ["Valentine", "Christina", "Eternal", "Holy Night's Blessing Dianne", "Mero"],
        reason: {
            en: "{E/Fire} supports that can help the team.",
            jp: "チームを助ける{E/Fire}サポート。"
        }
    },
    {
        names: ["Tio", "Astei", "Liselotte"],
        reason: {
            en: "{E/Fire} healer to keep the team alive.",
            jp: "チームを生存させる{E/Fire}ヒーラー。"
        }
    }
]

export default function DekrilMekrilGuide() {
    return (
        <GuideTemplate
            title="デグリル&メグリル 冒険者ライセンス攻略ガイド"
            introduction="デグリル&メグリル冒険者ライセンスは、スペシャルリクエストステージ12と同じスキルを持っています。この兄弟デュオは適切なチーム編成で1回の挑戦で安定してクリアできます。この攻略はステージ9まで検証済みです。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <div className="space-y-4">
                                <BossDisplay bossKey="Dek'Ril" modeKey='Adventure License' defaultBossId='51000007' />
                                <BossDisplay bossKey="Mek'Ril" modeKey='Adventure License' defaultBossId='51000008' />
                            </div>
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "スペシャルリクエストステージ12と同じスキルです。",
                                    "{E/Fire}ユニットのみがフルダメージを与えられます。火属性以外のユニットはダメージが減少し、両ボスから受けるダメージが増加します。",
                                    "メグリルが生存している間、全ての受けるダメージが大幅に減少します。この保護を解除するため、メグリルを先に倒してください。",
                                    "メグリルが死亡すると、デグリルは1ターン{B/BT_INVINCIBLE}と{B/BT_STAT|ST_ATK}を獲得します。バーストのタイミングを調整してください。",
                                    "デグリルは全体攻撃を受けると{B/BT_STAT|ST_AVOID}を獲得します。チェーン以外の全体スキルの使用は避けてください。",
                                    "デグリルが回避すると、WGダメージを受けず、アトラス（全体攻撃 + {D/BT_DOT_POISON} + バリア）で反撃します。",
                                    "HP70%で、デグリルは4ターン狂暴化します。狂暴化終了時、アクタイオンで高い単体ダメージを与え、全ての敵に解除不可の{D/BT_SEALED_RECEIVE_HEAL}を付与します。",
                                    "戦闘開始から2ターン以内にデグリルが狂暴化すると、チームは80CPを獲得します。"
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={BeatlesALTeams.beatlesAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="mx8ml6X_RZI"
                                title="Dek'ril & Mek'ril - Adventure License - Stage 10 - 1 run clear (Auto)"
                                author="XuRenChao"
                                date="19/08/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
