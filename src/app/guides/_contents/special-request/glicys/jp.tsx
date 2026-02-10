'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import GlicysTeamsData from './Glicys.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const GlicysTeams = GlicysTeamsData as Record<string, TeamData>

export default function GlicysGuide() {
    return (
        <GuideTemplate
            title="グリシス特殊依頼攻略ガイド"
            introduction="グリシスの主要メカニズムは召喚モブと{D/BT_FREEZE}デバフを中心に展開されます。慎重に管理すべき雑魚を召喚し、雑魚を倒すまでボスへの単体攻撃は弱点ゲージを回復させます。HP50%で激怒フェーズに入り、メカニズムが強化されます。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay bossKey='Glicys' modeKey='Special Request: Identification' defaultBossId='407600162' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "ボスは右側に小型モブを召喚します。単体スキルで攻撃すると、モブとボスの両方の防御力が低下します。",
                                "右側のモブは攻撃時に{D/BT_FREEZE}を付与します。",
                                "雑魚を倒すまで、ボスへの単体攻撃はWGを回復させます。序盤は避けましょう。",
                                "ボスは凍結した敵に対して増加ダメージを与えます（特にステージ13）。",
                                "HP50%でボスは激怒状態に入り、左側に大型モブを召喚します。",
                                "左側のモブを一撃で倒せない場合、チームが{D/BT_FREEZE}を受けます。",
                                "激怒中にボスは{B/BT_INVINCIBLE_IR}を獲得します。バーストのタイミングを計画しましょう。",
                                "チームはグリシスより遅い方が理想的です。スピードによるペナルティを避けるためです。",
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={GlicysTeams.glicysSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="NikwWwstygo" title="グリシス戦闘映像" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
