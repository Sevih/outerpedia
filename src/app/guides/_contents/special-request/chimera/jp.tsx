'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import chimeraTeamsData from './Chimera.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const chimeraTeams = chimeraTeamsData as Record<string, TeamData>

export default function ChimeraGuide() {
    return (
        <GuideTemplate
            title="未確認キメラ特殊依頼攻略ガイド"
            introduction="スピード装備とクリティカル装備を手に入れるために、できるだけ早く攻略したいボスです。キメラのスキル構成は複雑ではなく、基本的にDPSレースです。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay bossKey='Unidentified Chimera' modeKey='Special Request: Ecology Study' defaultBossId='403400262' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "激怒前に倒せないと、生存が非常に困難になります。",
                                "幸い、{E/Fire}属性には現在このボスに対応する優秀なツールが多数あります。",
                                "キメラはHPが比較的低いですが防御力が非常に高いため、{D/BT_STAT|ST_DEF}はほぼ必須です。",
                                "DPSユニットに貫通率%のアクセサリーを装備するとダメージが大幅に向上します。",
                                "キメラのパッシブはチームのクリティカルダメージを85%減少させますが、代わりに全ユニットに100%のクリティカル率を付与します。",
                                "これを活用するため、ユニットにクリティカル率は不要です。攻撃力とクリティカルダメージに集中しましょう。",
                                "全ユニットに{I-T/Rogue's Charm}を装備しましょう。毎回CP生成が発動します。{E/Fire}ユニットには{I-T/Sage's Charm}も有効です。",
                                "ボスは攻撃を受けるたびに10%の{B/BT_ACTION_GAUGE}を獲得するため、スピードが重要です。",
                                "理想的にはチーム全体でステージ12は175以上、ステージ13は185以上のスピードが必要です。"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={chimeraTeams.chimeraSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="eHRErCHZmp4" title="キメラ戦闘映像" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
