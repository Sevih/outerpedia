import GuideHeading from "@/app/components/GuideHeading"
import Accordion from "@/app/components/ui/Accordion"
import { lRec } from "@/lib/localize"

import {
    LABELS,
    getQuirkFaq,
    IntroSection,
    CategoryOverviewSection,
    HowItWorksSection,
    PrioritySection,
    EarlyGameExampleSection,
} from "./helpers"

const LANG = "en" as const

export default function QuirkGuide() {
    const quirkFaq = getQuirkFaq(LANG)

    return (
        <div>
            <GuideHeading level={2}>{lRec(LABELS.title, LANG)}</GuideHeading>
            <IntroSection lang={LANG} />

            <GuideHeading level={3}>{lRec(LABELS.categoryOverview, LANG)}</GuideHeading>
            <CategoryOverviewSection lang={LANG} />

            <GuideHeading level={3}>{lRec(LABELS.howItWorks, LANG)}</GuideHeading>
            <HowItWorksSection lang={LANG} />

            <GuideHeading level={3}>{lRec(LABELS.upgradingPriority, LANG)}</GuideHeading>
            <PrioritySection lang={LANG} />

            <GuideHeading level={4}>{lRec(LABELS.earlyGameExample, LANG)}</GuideHeading>
            <EarlyGameExampleSection lang={LANG} />

            <GuideHeading level={2}>{lRec(LABELS.faq, LANG)}</GuideHeading>
            <Accordion items={quirkFaq} />
        </div>
    )
}
