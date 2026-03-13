'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import { WorldBossDisplay } from '@/app/components/boss'
import PrimordialSentinelTeamsData from './PrimordialSentinel.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { phase1Characters, phase2Characters, phase1Characters03, phase2Characters03 } from './recommendedCharacters'
import GuideHeading from '@/app/components/GuideHeading'

const PrimordialSentinelTeams = PrimordialSentinelTeamsData as Record<string, TeamData>

const primordialSentinelNovember2025 = {
    boss1Key: 'Primordial Sentinel',
    boss2Key: 'Glorious Sentinel',
    boss1Ids: {
        'Normal': '4086007',
        'Very Hard': '4086009',
        'Extreme': '4086011'
    },
    boss2Ids: {
        'Hard': '4086008',
        'Very Hard': '4086010',
        'Extreme': '4086012'
    }
} as const

export default function PrimordialSentinelGuide() {
    return (
        <GuideTemplate
            title="Primordial Sentinel (Glorious Sentinel) Strategy"
            introduction="The Primordial Sentinel is a challenging two-phase world boss that requires precise team coordination and timing. This guide covers strategies for defeating this boss up to the Extreme League."
            defaultVersion="march2026"
            versions={{
                march2026: {
                    label: 'March 2026',
                    content: (
                        <>
                            <WorldBossDisplay config={primordialSentinelNovember2025} defaultMode="Extreme" />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                sections={[
                                    {
                                        title: "phase1",
                                        tips: [
                                            "Abuse priority gain and reduction as much as possible to maximize your turns.",
                                            "Equip Sage and Rogue charms for Skill Chains and CP generation (don't forget critical hit chance for Rogue).",
                                            "In both phases, bring at least 1 healer for the {D/BT_STAT|ST_SPEED} thanks to the {B/UNIQUE_DAHLIA_A} buff.",
                                            "You have 2 ways to keep the Chain Points you accumulated during Phase 1 — see the Transition section below."
                                        ]
                                    },
                                    {
                                        title: { en: "Phase Transition", jp: "フェーズ移行", kr: "페이즈 전환", zh: "阶段过渡" },
                                        tips: [
                                            "If you have {P/Monad Eva} at 6 stars: her mere presence will apply {D/BT_SEAL_ADDITIVE_ATTACK} to the boss, preventing his extra attack that removes all your CP. You can swap to Team 2 before the transition (safest) or after it — but swapping after requires your team to be fast enough to act before the boss ({AS/Swiftness} or priority boost recommended).",
                                            "Without {P/Monad Eva} 6 stars: make sure you have at least 1 {E/Fire}, {E/Water} or {E/Earth} character in Team 2.",
                                            "Swap to Team 2 near the Phase 2 threshold (1.2M damage). Let the boss play, then push him into Phase 2. The boss plays again and gains his buff {B/CORE_ENERGY} — break him before his next turn to remove the buff and avoid his extra attack that strips your CP."
                                        ]
                                    }
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList title="phase1" entries={phase1Characters03} />
                            <RecommendedCharacterList title="phase2" entries={phase2Characters03} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={PrimordialSentinelTeams.march2026} defaultStage="Phase 1" />
                        </>
                    ),
                },
                november2025: {
                    label: 'November 2025',
                    content: (
                        <>
                            <WorldBossDisplay config={primordialSentinelNovember2025} defaultMode="Extreme" />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                sections={[
                                    {
                                        title: "strategy",
                                        tips: [
                                            "This entire fight revolves around priority control. In Phase 1, abuse priority reduction as much as possible.",
                                            "In Phase 2, the boss is immune to priority reduction - make your characters as fast as possible.",
                                            "Equip Sage and Rogue charms for Skill Chains and CP generation (don't forget critical hit chance for Rogue).",
                                            "In both phases, bring at least 1 healer for the {D/BT_STAT|ST_SPEED} thanks to the {B/UNIQUE_DAHLIA_A} buff."
                                        ]
                                    },
                                    {
                                        title: "phase2",
                                        tips: [
                                            "If you have {P/Monad Eva} at 6 stars in Team 2, you can stack CP in Phase 1 then swap to Team 2 near the end.",
                                            "{P/Monad Eva} will instantly {D/BT_SEAL_ADDITIVE_ATTACK} the boss, allowing you to keep the CP you built during Phase 1."
                                        ]
                                    }
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList title="phase1" entries={phase1Characters} />
                            <RecommendedCharacterList title="phase2" entries={phase2Characters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={PrimordialSentinelTeams.november2025} defaultStage="Phase 1" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="4me_DqMftbs"
                                title="Primordial Sentinel - World Boss - SSS - Extreme League"
                                author="Sevih"
                                date="01/11/2025"
                            />
                            <p className="mt-2 text-neutral-400 text-sm">
                                Note: This video showcases an SSS Extreme clear. The same strategy can be applied to lower difficulties, but certain boss mechanics may be weakened or disabled. As the score is not unlimited before Extreme League, this requires less focus on building chain points in phase 1.
                            </p>
                        </>
                    ),
                },
                july2024: {
                    label: 'July 2024',
                    content: (
                        <>
                            <TacticalTips
                                sections={[
                                    {
                                        title: "phase1",
                                        tips: [
                                            "Use {P/Valentine}'s S3 as much as possible.",
                                            "{P/Iota} uses S1 only.",
                                            "{P/Notia} must maintain her buff uptime for priority pushes.",
                                            "{P/Dianne} needs {P/Iota} to have the highest ATK to push her every turn with S1.",
                                            "Build CP in P1 and lock boss down using {P/Iota} & {P/Valentine}'s priority reduction.",
                                            "Do not heal {P/Iota}; let her self-sap to 1 HP (boosts SPD via Swiftness).",
                                            "Break boss once, reduce WG to 1-2, apply Invulnerable with {P/Iota} S3/S2B2.",
                                            "Ensure boss is around 1.2M HP after breaking with 10 chain attacks ready.",
                                            "Push P1 damage over threshold to spawn P2 boss.",
                                            "{P/Iota} (1 HP, Swiftness) will act before P2 boss. Swap to Team 2."
                                        ]
                                    },
                                    {
                                        title: "phase2",
                                        tips: [
                                            "P2 boss uses S2 {D/BT_DOT_LIGHTNING}, {P/Monad Eva} S2 cleanses it immediately.",
                                            "Cleanse = \"healer action\", which applies {D/BT_STAT|ST_SPEED} to boss.",
                                            "Team can outspeed and break + remove core energy.",
                                            "Spam chain attacks to lock him; use {P/Monad Eva} S1 to help build CP."
                                        ]
                                    }
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <GuideHeading level={3}>Important Notes</GuideHeading>
                            <p className="text-neutral-300 mb-4">
                                This comp only works with 6-star {'{P/Monad Eva}'}. Credit to <strong>Birdmouth</strong> for discovering this.
                                The core energy buff counts as an additional attack, which {'{P/Monad Eva}'} skill seal at battle start can cancel.
                                This protects your CP from being lost.
                            </p>
                            <p className="text-neutral-300 mb-4">
                                Alternative: swap to Team 2 during Phase 1. Since {'{E/Light}'} {'{E/Dark}'} units can&apos;t reduce WG in P1, you&apos;ll need at least
                                one {'{E/Fire}'} {'{E/Water}'} {'{E/Earth}'} unit in Team 2. This lets {'{P/Monad Eva}'} apply skill seal upon entering P2 and protect your rotation.
                            </p>
                            <p className="text-neutral-300">
                                Another option: run {'{P/Demiurge Stella}'} instead of {'{P/Stella}'}. Swap to Team 2 at end of P1 and use one chain skill to trigger fixed damage and move into P2.
                            </p>
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="Kd-dKroOXEo"
                                title="Glorious Sentinel World Boss 23mil+ by Ducky"
                                author="Ducky"
                                date="01/07/2024"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
