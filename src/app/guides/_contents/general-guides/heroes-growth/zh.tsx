import GuideHeading from '@/app/components/GuideHeading'
import ItemInlineDisplay from '@/app/components/ItemInline'
import StarLevel from '@/app/components/StarLevel'
import { lRec } from '@/lib/localize'

import {
    LABELS,
    UpgradeTable,
    TranscendenceTable,
    SkillCostTable,
    XPItemsList,
    AffinityList,
    SpecialEquipmentList,
    GearSection,
} from './helpers'

const LANG = 'zh' as const

export default function HeroGrowthGuide() {
    return (
        <div className="space-y-6">
            <p>{lRec(LABELS.intro, LANG)}</p>

            <GuideHeading level={3}>{lRec(LABELS.sectionLeveling, LANG)}</GuideHeading>
            <p>{lRec(LABELS.levelingDesc1, LANG)}</p>
            <p>{lRec(LABELS.levelingDesc2, LANG)}</p>
            <XPItemsList lang={LANG} />
            <p>
                <ItemInlineDisplay names="Unlimited Restaurant Voucher" /> {lRec(LABELS.instantLv100, LANG)}
            </p>

            <GuideHeading level={3}>{lRec(LABELS.sectionUpgrade, LANG)}</GuideHeading>
            <p>{lRec(LABELS.upgradeDesc, LANG)}</p>
            <UpgradeTable lang={LANG} />
            <p>
                <ItemInlineDisplay names="Book of Evolution" /> {lRec(LABELS.instantStage6, LANG)}
            </p>

            <GuideHeading level={3}>{lRec(LABELS.sectionTranscendence, LANG)}</GuideHeading>
            <p>{lRec(LABELS.transcendenceDesc1, LANG)}</p>
            <p>{lRec(LABELS.transcendenceDesc2, LANG)}</p>
            <p>{lRec(LABELS.transcendenceDesc3, LANG)}</p>
            <TranscendenceTable lang={LANG} />
            <p className="text-neutral-400 text-sm italic mb-4">
                {lRec(LABELS.transcendenceNote, LANG)} <StarLevel levelLabel="3" size={12} /> {lRec(LABELS.transcendenceNoteEnd, LANG)} <StarLevel levelLabel="6" size={12} />.
            </p>

            <GuideHeading level={3}>{lRec(LABELS.sectionAffinity, LANG)}</GuideHeading>
            <p>{lRec(LABELS.affinityDesc, LANG)}</p>
            <AffinityList lang={LANG} />
            <p>
                <ItemInlineDisplay names="Oath of Determination" /> {lRec(LABELS.affinityMaxItem, LANG)}
            </p>

            <GuideHeading level={3}>{lRec(LABELS.sectionSkillUpgrade, LANG)}</GuideHeading>
            <p>{lRec(LABELS.skillUpgradeDesc1, LANG)}</p>
            <p>{lRec(LABELS.skillUpgradeDesc2, LANG)}</p>
            <SkillCostTable lang={LANG} />

            <GuideHeading level={3}>{lRec(LABELS.sectionSpecialEquipment, LANG)}</GuideHeading>
            <p>{lRec(LABELS.specialEquipmentDesc, LANG)}</p>
            <p><strong>EE</strong> {lRec(LABELS.eeDesc, LANG)}</p>
            <SpecialEquipmentList type="ee" lang={LANG} />
            <p>{lRec(LABELS.eeLv5Unlock, LANG)}</p>
            <p><strong>Talismans</strong> {lRec(LABELS.talismanDesc, LANG)}</p>
            <SpecialEquipmentList type="talisman" lang={LANG} />
            <p>{lRec(LABELS.auraNote, LANG)}</p>
            <p>{lRec(LABELS.materialsSource, LANG)}</p>

            <GuideHeading level={3}>{lRec(LABELS.sectionGems, LANG)}</GuideHeading>
            <p>{lRec(LABELS.gemsDesc1, LANG)}</p>
            <p>{lRec(LABELS.gemsDesc2, LANG)}</p>

            <GuideHeading level={3}>{lRec(LABELS.sectionGear, LANG)}</GuideHeading>
            <GearSection lang={LANG} />
        </div>
    )
}
