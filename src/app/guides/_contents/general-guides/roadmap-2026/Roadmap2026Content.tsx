import GuideHeading from '@/app/components/GuideHeading';
import type { TenantKey } from '@/tenants/config';
import { lRec, type LangMap } from '@/lib/localize';
import {
    QuarterlyRoadmapSection,
    MonthlyUpdatesSection,
    NewCharactersSection,
    CoreFusionSection,
    DimensionSingularitySection,
    RTASection,
    DemiurgeLimitedPlansSection,
    CouponSection,
    DevelopmentDirectionSection,
    CreditsSection
} from './helpers';

// Section headings localized
const HEADINGS = {
    intro: {
        en: "Summary of the January 2026 Offline Meeting where Major9 and VAGames presented the 2026 roadmap for Outerplane.",
        jp: "Major9とVAGamesが2026年のOuterplaneロードマップを発表した2026年1月オフラインミーティングの概要。",
        kr: "Major9와 VAGames가 2026년 Outerplane 로드맵을 발표한 2026년 1월 오프라인 미팅 요약.",
        zh: "Major9和VAGames在2026年1月线下会议上展示的Outerplane 2026路线图摘要。"
    },
    developmentDirection: {
        en: "Development Direction",
        jp: "開発方針",
        kr: "개발 방향",
        zh: "开发方向"
    },
    roadmapOverview: {
        en: "2026 Roadmap Overview",
        jp: "2026年ロードマップ概要",
        kr: "2026 로드맵 개요",
        zh: "2026路线图概览"
    },
    monthlyUpdates: {
        en: "Monthly Update Plans (January - July 2026)",
        jp: "月間アップデート計画（2026年1月〜7月）",
        kr: "월간 업데이트 계획 (2026년 1월 - 7월)",
        zh: "月度更新计划（2026年1月-7月）"
    },
    newCharacters: {
        en: "New Characters Revealed",
        jp: "新キャラクター公開",
        kr: "신규 캐릭터 공개",
        zh: "新角色公开"
    },
    coreFusion: {
        en: "Core Fusion Plans",
        jp: "コア融合計画",
        kr: "코어 융합 계획",
        zh: "核心融合计划"
    },
    dimensionSingularity: {
        en: "New PVE Content: Dimension Singularity",
        jp: "新PVEコンテンツ: 次元特異点",
        kr: "신규 PVE 콘텐츠: 차원 특이점",
        zh: "新PVE内容：次元奇点"
    },
    rta: {
        en: "RTA (Real-Time Arena)",
        jp: "RTA（リアルタイムアリーナ）",
        kr: "RTA (실시간 아레나)",
        zh: "RTA（实时竞技场）"
    },
    demiurgePlans: {
        en: "Demiurge/Limited/BokGak Plans",
        jp: "デミウルゴス/限定/復刻計画",
        kr: "데미우르고스/한정/복각 계획",
        zh: "神匠/限定/复刻计划"
    },
    coupon: {
        en: "Coupon Code",
        jp: "クーポンコード",
        kr: "쿠폰 코드",
        zh: "优惠码"
    }
} as const satisfies Record<string, LangMap>;

export default function Roadmap2026Content({ lang }: { lang: TenantKey }) {
    return (
        <div className="space-y-8">
            <p className="text-gray-300">
                {lRec(HEADINGS.intro, lang)}
            </p>

            {/* Development Direction */}
            <section>
                <GuideHeading level={3}>{lRec(HEADINGS.developmentDirection, lang)}</GuideHeading>
                <DevelopmentDirectionSection lang={lang} />
            </section>

            {/* Quarterly Roadmap */}
            <section>
                <GuideHeading level={3}>{lRec(HEADINGS.roadmapOverview, lang)}</GuideHeading>
                <QuarterlyRoadmapSection lang={lang} />
            </section>

            {/* Monthly Updates */}
            <section>
                <GuideHeading level={3}>{lRec(HEADINGS.monthlyUpdates, lang)}</GuideHeading>
                <MonthlyUpdatesSection lang={lang} />
            </section>

            {/* New Characters */}
            <section>
                <GuideHeading level={3}>{lRec(HEADINGS.newCharacters, lang)}</GuideHeading>
                <NewCharactersSection lang={lang} />
            </section>

            {/* Core Fusion */}
            <section>
                <GuideHeading level={3}>{lRec(HEADINGS.coreFusion, lang)}</GuideHeading>
                <CoreFusionSection lang={lang} />
            </section>

            {/* New PVE Content */}
            <section>
                <GuideHeading level={3}>{lRec(HEADINGS.dimensionSingularity, lang)}</GuideHeading>
                <DimensionSingularitySection lang={lang} />
            </section>

            {/* RTA */}
            <section>
                <GuideHeading level={3}>{lRec(HEADINGS.rta, lang)}</GuideHeading>
                <RTASection lang={lang} />
            </section>

            {/* Demiurge/Limited Plans */}
            <section>
                <GuideHeading level={3}>{lRec(HEADINGS.demiurgePlans, lang)}</GuideHeading>
                <DemiurgeLimitedPlansSection lang={lang} />
            </section>

            {/* Coupon */}
            <section>
                <GuideHeading level={3}>{lRec(HEADINGS.coupon, lang)}</GuideHeading>
                <CouponSection lang={lang} />
            </section>

            {/* Credits */}
            <CreditsSection lang={lang} />
        </div>
    );
}
