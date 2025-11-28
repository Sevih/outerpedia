'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import AnubisALTeamsData from './AnubisAL.json'
import type { TeamData } from '@/types/team'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import TacticalTips from '@/app/components/TacticalTips'
import { recommendedCharacters } from './recommendedCharacters'
import MiniBossDisplay from '@/app/components/MiniBossDisplay'

const AnubisALTeams = AnubisALTeamsData as Record<string, TeamData>

export default function AnubisGuardianGuide() {
    return (
        <GuideTemplate
            title="アヌビスガーディアン 冒険者ライセンス攻略ガイド"
            introduction="アヌビスガーディアンは、毎ターン雑魚を復活させる、自身のバフとデバフを延長する、最適なダメージを与えるには火属性ユニットが必要など、独自のメカニズムが特徴です。火属性以外のユニットはボスのデバフをすべて解除し、WGダメージが半減します。ボスはHP50%で激怒し、3ターン後に致死ダメージを与えます。適切な火属性チーム編成で通常1〜2回の挑戦でクリア可能です。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay bossKey="Iota World's Giant God Soldier" modeKey='Adventure License' defaultBossId='51000031' />
                            <MiniBossDisplay
                                bosses={[
                                    { bossKey: 'Sand Soldier Khopesh', defaultBossId: '51000032' },
                                    { bossKey: 'Sand Soldier Spear', defaultBossId: '51000033' }
                                ]}
                                modeKey={['Weekly Conquest - Anubis Guardian']}
                                defaultModeKey='Weekly Conquest - Anubis Guardian'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "{E/Fire}ユニットのみを使用してください。火属性以外のユニットはボスからすべてのデバフを解除し、WGダメージが50%減少します。",
                                    "ボスは攻撃後、毎ターンすべての雑魚を復活させます。雑魚ではなくボスにダメージを集中させてください。",
                                    "ボスへのすべてのバフとデバフは各ターン開始時に1ターン延長されます。{D/BT_DOT_BURN}スタックが非常に効果的です。",
                                    "ボスのみが生存している場合、WGダメージは発生しません。少なくとも1体の雑魚を生かしておく必要があります。",
                                    "HP50%で、ボスは激怒し、3ターン後に致死ダメージを与えます。素早く押し切ってください。",
                                    "パーティのクリティカル率は0%に減少します。クリティカル依存のビルドは頼りにしないでください。"
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={AnubisALTeams.anubisAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="fU0UUuHswKM"
                                title="Anubis Guardian - Adventure License - Stage 10 - 1 run clear (Auto) - by XuRenChao"
                                author="XuRenChao"
                                date="22/09/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
