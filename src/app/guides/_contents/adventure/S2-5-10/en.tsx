'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function AsteiDemiurgeGuide() {
    return (
        <GuideTemplate
            title="Astei (Demiurge) Strategy Guide"
            introduction="Demiurge Astei is a powerful boss that chains critical buffs to inflict petrification on all enemies, then upgrades it to ignore immunity. Only takes weakness damage while enraged, and her enrage ultimate deals lethal damage."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Astei'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4500047'
                                labelFilter={["Snapped Back to Reality", "Doll Garden's Caretaker"]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "Use 2 characters to handle {D/BT_STONE} mechanics with {B/BT_REMOVE_DEBUFF} and {B/BT_IMMUNE}.",
                                "If damage is a problem, try to bring a character that can prevent boss from taking buff with {D/BT_SEALED}."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                        </>
                    ),
                },
            }}
        />
    )
}
