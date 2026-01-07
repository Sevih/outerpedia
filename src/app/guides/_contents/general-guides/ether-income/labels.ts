import type { TenantKey } from '@/tenants/config'

type Labels = {
    // Page
    title: string
    description: string

    // Totals
    dailyIncome: string
    weeklyIncome: string
    monthlyIncome: string
    weeklyTotal: string
    monthlyTotal: string
    perDay: string

    // Adjustments
    advancedAdjustments: string
    arena: string
    guild: string
    worldBoss: string

    // Tables
    tableDaily: string
    tableWeekly: string
    tableMonthly: string
    source: string
    daily: string
    weekly: string
    monthly: string
    weeklyApprox: string
    monthlyApprox: string
    monthlyApprox4: string
    notes: string
    dailySubtotal: string
    weeklySubtotal: string
    monthlySubtotal: string

    // Variable
    variableExcluded: string
    variableTitle: string

    // Projection
    projection: string
    endDate: string
    currentEther: string
    days: string
    weeks: string
    months: string
    fromDaily: string
    fromWeekly: string
    fromMonthly: string
    projectedTotal: string

    // Sources
    sources: Record<string, string>
    sourceNotes: Record<string, string>

    // Arena ranks
    arenaRanks: Record<string, string>

    // Guild ranks
    guildRanks: Record<string, string>

    // World Boss ranks
    wbRanks: Record<string, string>
    wbLeagues: Record<string, string>

    // Variable items
    variableItems: Record<string, string>
}

export const labels: Record<TenantKey, Labels> = {
    en: {
        title: 'Daily / Weekly / Monthly Ether income',
        description: 'This guide organizes your income into Daily, Weekly, and Monthly sources. Use the Advanced rank adjustments (Arena, Guild Raid, World Boss) to match your account—totals and the date projection update instantly. Event/seasonal rewards are listed separately and aren\'t counted in the totals.',

        dailyIncome: 'Daily income',
        weeklyIncome: 'Weekly income',
        monthlyIncome: 'Monthly income',
        weeklyTotal: 'Weekly Total',
        monthlyTotal: 'Monthly Total',
        perDay: '/day',

        advancedAdjustments: 'Advanced rank adjustments',
        arena: 'Arena',
        guild: 'Guild',
        worldBoss: 'World Boss',

        tableDaily: 'Daily income',
        tableWeekly: 'Weekly income',
        tableMonthly: 'Monthly income',
        source: 'Source',
        daily: 'Daily',
        weekly: 'Weekly',
        monthly: 'Monthly',
        weeklyApprox: 'Weekly ≈×7',
        monthlyApprox: 'Monthly ≈×30',
        monthlyApprox4: 'Monthly ≈×4',
        notes: 'Notes',
        dailySubtotal: 'Daily subtotal',
        weeklySubtotal: 'Weekly subtotal',
        monthlySubtotal: 'Monthly subtotal',

        variableExcluded: 'Variable / Event-Driven (excluded)',
        variableTitle: 'Extra',

        projection: 'Projection until a date',
        endDate: 'End date',
        currentEther: 'Current Ether',
        days: 'Days',
        weeks: 'Weeks',
        months: 'Months',
        fromDaily: 'From Daily',
        fromWeekly: 'From Weekly',
        fromMonthly: 'From Monthly',
        projectedTotal: 'Projected Total',

        sources: {
            'daily.missions': 'Daily Missions',
            'daily.arena': 'Daily Arena',
            'daily.freePack': 'Daily Free Pack',
            'daily.missionEvent': 'Daily Mission Event',
            'daily.antiparticle': 'Antiparticle generator (2×12h)',
            'weekly.freePack': 'Weekly Free Pack',
            'weekly.arena': 'Weekly Arena Ranking',
            'weekly.missions': 'Weekly Missions',
            'weekly.guildCheckin': 'Guild Check-in',
            'weekly.monadGate': 'Monad Gate Weekly Missions',
            'monthly.freePack': 'Monthly Free Pack',
            'monthly.skywardTower': 'Skyward Tower',
            'monthly.checkin': 'Check-in',
            'monthly.maintenance': 'Maintenance rewards',
            'monthly.jointMission': 'Joint Mission',
            'monthly.guildRaid': 'Guild Raid Ranking Reward',
            'monthly.worldBoss': 'World Boss Ranking Reward',
        },
        sourceNotes: {
            'weekly.arena': '35 minimum. Can go up to 1500 for rank 1.',
            'weekly.monadGate': '5×10 + 200 completion bonus',
            'monthly.maintenance': '≈200 every 2 weeks (min)',
            'monthly.jointMission': '80 from Event Mission, do 10 joint challenge runs',
            'monthly.guildRaid': '200 minimum. Can go up to 1500 for rank 1.',
            'monthly.worldBoss': '60 minimum. Can go up to 1500 for rank 1 in extreme.',
        },

        arenaRanks: {
            'arena.bronze3': 'Bronze III',
            'arena.bronze2': 'Bronze II',
            'arena.bronze1': 'Bronze I',
            'arena.silver3': 'Silver III',
            'arena.silver2': 'Silver II',
            'arena.silver1': 'Silver I',
            'arena.gold3': 'Gold III',
            'arena.gold2': 'Gold II',
            'arena.gold1': 'Gold I',
            'arena.platinum3': 'Platinum III',
            'arena.platinum2': 'Platinum II',
            'arena.platinum1': 'Platinum I',
            'arena.diamond3': 'Diamond III',
            'arena.diamond2': 'Diamond II',
            'arena.diamond1': 'Diamond I',
            'arena.master3': 'Master III',
            'arena.master2': 'Master II',
            'arena.master1': 'Master I',
            'arena.top100': 'Top 100',
            'arena.top50': 'Top 50',
            'arena.top10': 'Top 10',
            'arena.top3': 'Top 3',
            'arena.top2': 'Top 2',
            'arena.top1': 'Top 1',
        },

        guildRanks: {
            'guild.top1': 'Top 1',
            'guild.top2': 'Top 2',
            'guild.top3': 'Top 3',
            'guild.top5': 'Top 5',
            'guild.top10': 'Top 10',
            'guild.top20': 'Top 20',
            'guild.top50': 'Top 50',
            'guild.top100': 'Top 100',
            'guild.top150': 'Top 150',
            'guild.top200': 'Top 200',
            'guild.top300': 'Top 300',
            'guild.top400': 'Top 400',
            'guild.top500': 'Top 500',
            'guild.top1000': 'Top 1000',
            'guild.top1500': 'Top 1500',
            'guild.top2000': 'Top 2000',
            'guild.top3000': 'Top 3000',
            'guild.below3001': 'Below Top 3001',
        },

        wbRanks: {
            'wb.rank1': 'Rank 1',
            'wb.rank2': 'Rank 2',
            'wb.rank3': 'Rank 3',
            'wb.top10': 'Top 10',
            'wb.top50': 'Top 50',
            'wb.top100': 'Top 100',
            'wb.top1pct': 'Top 1%',
            'wb.top10pct': 'Top 10%',
            'wb.top50pct': 'Top 50%',
            'wb.top100pct': 'Top 100%',
        },
        wbLeagues: {
            'Normal': 'Normal',
            'Hard': 'Hard',
            'Very Hard': 'Very Hard',
            'Extreme': 'Extreme',
        },

        variableItems: {
            'variable.terminus': 'Terminus Island Ether rewards (22–26 on treasure reward on Terminus 10) (5 chances everyday ×2 w/ terminus pack)',
            'variable.updateEvent': "Every update's event",
            'variable.sideStories': 'New Side Stories every new character (non-premium/limited)',
            'variable.coupons': 'Coupon codes',
            'variable.seasonalEvents': 'Seasonal events (story, point shops, login chains)',
        },
    },

    jp: {
        title: 'エーテル収入（日/週/月別）',
        description: 'このガイドでは収入を日次、週次、月次に分類しています。詳細設定（アリーナ、ギルドレイド、ワールドボス）でアカウントに合わせると、合計と日付予測が即座に更新されます。イベント/シーズン報酬は別途記載され、合計には含まれません。',

        dailyIncome: '日次収入',
        weeklyIncome: '週次収入',
        monthlyIncome: '月次収入',
        weeklyTotal: '週間合計',
        monthlyTotal: '月間合計',
        perDay: '/日',

        advancedAdjustments: '詳細ランク設定',
        arena: 'アリーナ',
        guild: 'ギルド',
        worldBoss: 'ワールドボス',

        tableDaily: '日次収入',
        tableWeekly: '週次収入',
        tableMonthly: '月次収入',
        source: '取得元',
        daily: '日次',
        weekly: '週次',
        monthly: '月次',
        weeklyApprox: '週≈×7',
        monthlyApprox: '月≈×30',
        monthlyApprox4: '月≈×4',
        notes: '備考',
        dailySubtotal: '日次小計',
        weeklySubtotal: '週次小計',
        monthlySubtotal: '月次小計',

        variableExcluded: '変動/イベント報酬（除外）',
        variableTitle: 'その他',

        projection: '日付までの予測',
        endDate: '終了日',
        currentEther: '現在のエーテル',
        days: '日数',
        weeks: '週数',
        months: '月数',
        fromDaily: '日次から',
        fromWeekly: '週次から',
        fromMonthly: '月次から',
        projectedTotal: '予測合計',

        sources: {
            'daily.missions': 'デイリーミッション',
            'daily.arena': 'デイリーアリーナ',
            'daily.freePack': 'デイリー無料パック',
            'daily.missionEvent': 'デイリーミッションイベント',
            'daily.antiparticle': '反粒子発生器（2×12時間）',
            'weekly.freePack': 'ウィークリー無料パック',
            'weekly.arena': 'ウィークリーアリーナランキング',
            'weekly.missions': 'ウィークリーミッション',
            'weekly.guildCheckin': 'ギルドチェックイン',
            'weekly.monadGate': 'モナドゲートウィークリーミッション',
            'monthly.freePack': 'マンスリー無料パック',
            'monthly.skywardTower': '昇天の塔',
            'monthly.checkin': 'チェックイン',
            'monthly.maintenance': 'メンテナンス報酬',
            'monthly.jointMission': '共同ミッション',
            'monthly.guildRaid': 'ギルドレイドランキング報酬',
            'monthly.worldBoss': 'ワールドボスランキング報酬',
        },
        sourceNotes: {
            'weekly.arena': '最低35。1位で最大1500。',
            'weekly.monadGate': '5×10 + 200完了ボーナス',
            'monthly.maintenance': '約200（2週間ごと、最低）',
            'monthly.jointMission': 'イベントミッションから80、共同チャレンジ10回',
            'monthly.guildRaid': '最低200。1位で最大1500。',
            'monthly.worldBoss': '最低60。エクストリーム1位で最大1500。',
        },

        arenaRanks: {
            'arena.bronze3': 'ブロンズIII',
            'arena.bronze2': 'ブロンズII',
            'arena.bronze1': 'ブロンズI',
            'arena.silver3': 'シルバーIII',
            'arena.silver2': 'シルバーII',
            'arena.silver1': 'シルバーI',
            'arena.gold3': 'ゴールドIII',
            'arena.gold2': 'ゴールドII',
            'arena.gold1': 'ゴールドI',
            'arena.platinum3': 'プラチナIII',
            'arena.platinum2': 'プラチナII',
            'arena.platinum1': 'プラチナI',
            'arena.diamond3': 'ダイヤモンドIII',
            'arena.diamond2': 'ダイヤモンドII',
            'arena.diamond1': 'ダイヤモンドI',
            'arena.master3': 'マスターIII',
            'arena.master2': 'マスターII',
            'arena.master1': 'マスターI',
            'arena.top100': 'Top 100',
            'arena.top50': 'Top 50',
            'arena.top10': 'Top 10',
            'arena.top3': 'Top 3',
            'arena.top2': 'Top 2',
            'arena.top1': 'Top 1',
        },

        guildRanks: {
            'guild.top1': 'Top 1',
            'guild.top2': 'Top 2',
            'guild.top3': 'Top 3',
            'guild.top5': 'Top 5',
            'guild.top10': 'Top 10',
            'guild.top20': 'Top 20',
            'guild.top50': 'Top 50',
            'guild.top100': 'Top 100',
            'guild.top150': 'Top 150',
            'guild.top200': 'Top 200',
            'guild.top300': 'Top 300',
            'guild.top400': 'Top 400',
            'guild.top500': 'Top 500',
            'guild.top1000': 'Top 1000',
            'guild.top1500': 'Top 1500',
            'guild.top2000': 'Top 2000',
            'guild.top3000': 'Top 3000',
            'guild.below3001': 'Top 3001以下',
        },

        wbRanks: {
            'wb.rank1': '1位',
            'wb.rank2': '2位',
            'wb.rank3': '3位',
            'wb.top10': 'Top 10',
            'wb.top50': 'Top 50',
            'wb.top100': 'Top 100',
            'wb.top1pct': 'Top 1%',
            'wb.top10pct': 'Top 10%',
            'wb.top50pct': 'Top 50%',
            'wb.top100pct': 'Top 100%',
        },
        wbLeagues: {
            'Normal': 'ノーマル',
            'Hard': 'ハード',
            'Very Hard': 'ベリーハード',
            'Extreme': 'エクストリーム',
        },

        variableItems: {
            'variable.terminus': 'ターミナルアイルのエーテル報酬（ターミナル10の宝箱報酬で22〜26）（毎日5回、ターミナルパックで×2）',
            'variable.updateEvent': '各アップデートのイベント',
            'variable.sideStories': '新キャラクターごとの新サイドストーリー（プレミアム/限定除く）',
            'variable.coupons': 'クーポンコード',
            'variable.seasonalEvents': 'シーズンイベント（ストーリー、ポイントショップ、ログインチェーン）',
        },
    },

    kr: {
        title: '에테르 수입 (일/주/월별)',
        description: '이 가이드는 수입을 일간, 주간, 월간으로 분류합니다. 고급 랭크 설정(아레나, 길드 레이드, 월드 보스)을 조정하면 합계와 날짜 예측이 즉시 업데이트됩니다. 이벤트/시즌 보상은 별도로 표시되며 합계에 포함되지 않습니다.',

        dailyIncome: '일간 수입',
        weeklyIncome: '주간 수입',
        monthlyIncome: '월간 수입',
        weeklyTotal: '주간 총합',
        monthlyTotal: '월간 총합',
        perDay: '/일',

        advancedAdjustments: '고급 랭크 설정',
        arena: '아레나',
        guild: '길드',
        worldBoss: '월드 보스',

        tableDaily: '일간 수입',
        tableWeekly: '주간 수입',
        tableMonthly: '월간 수입',
        source: '출처',
        daily: '일간',
        weekly: '주간',
        monthly: '월간',
        weeklyApprox: '주≈×7',
        monthlyApprox: '월≈×30',
        monthlyApprox4: '월≈×4',
        notes: '비고',
        dailySubtotal: '일간 소계',
        weeklySubtotal: '주간 소계',
        monthlySubtotal: '월간 소계',

        variableExcluded: '변동/이벤트 보상 (제외)',
        variableTitle: '기타',

        projection: '날짜까지 예측',
        endDate: '종료일',
        currentEther: '현재 에테르',
        days: '일수',
        weeks: '주수',
        months: '월수',
        fromDaily: '일간에서',
        fromWeekly: '주간에서',
        fromMonthly: '월간에서',
        projectedTotal: '예상 총합',

        sources: {
            'daily.missions': '일일 미션',
            'daily.arena': '일일 아레나',
            'daily.freePack': '일일 무료 팩',
            'daily.missionEvent': '일일 미션 이벤트',
            'daily.antiparticle': '반입자 발생기 (2×12시간)',
            'weekly.freePack': '주간 무료 팩',
            'weekly.arena': '주간 아레나 랭킹',
            'weekly.missions': '주간 미션',
            'weekly.guildCheckin': '길드 체크인',
            'weekly.monadGate': '모나드 게이트 주간 미션',
            'monthly.freePack': '월간 무료 팩',
            'monthly.skywardTower': '승천의 탑',
            'monthly.checkin': '체크인',
            'monthly.maintenance': '점검 보상',
            'monthly.jointMission': '합동 미션',
            'monthly.guildRaid': '길드 레이드 랭킹 보상',
            'monthly.worldBoss': '월드 보스 랭킹 보상',
        },
        sourceNotes: {
            'weekly.arena': '최소 35. 1위 시 최대 1500.',
            'weekly.monadGate': '5×10 + 200 완료 보너스',
            'monthly.maintenance': '약 200 (2주마다, 최소)',
            'monthly.jointMission': '이벤트 미션에서 80, 합동 챌린지 10회',
            'monthly.guildRaid': '최소 200. 1위 시 최대 1500.',
            'monthly.worldBoss': '최소 60. 익스트림 1위 시 최대 1500.',
        },

        arenaRanks: {
            'arena.bronze3': '브론즈 III',
            'arena.bronze2': '브론즈 II',
            'arena.bronze1': '브론즈 I',
            'arena.silver3': '실버 III',
            'arena.silver2': '실버 II',
            'arena.silver1': '실버 I',
            'arena.gold3': '골드 III',
            'arena.gold2': '골드 II',
            'arena.gold1': '골드 I',
            'arena.platinum3': '플래티넘 III',
            'arena.platinum2': '플래티넘 II',
            'arena.platinum1': '플래티넘 I',
            'arena.diamond3': '다이아몬드 III',
            'arena.diamond2': '다이아몬드 II',
            'arena.diamond1': '다이아몬드 I',
            'arena.master3': '마스터 III',
            'arena.master2': '마스터 II',
            'arena.master1': '마스터 I',
            'arena.top100': 'Top 100',
            'arena.top50': 'Top 50',
            'arena.top10': 'Top 10',
            'arena.top3': 'Top 3',
            'arena.top2': 'Top 2',
            'arena.top1': 'Top 1',
        },

        guildRanks: {
            'guild.top1': 'Top 1',
            'guild.top2': 'Top 2',
            'guild.top3': 'Top 3',
            'guild.top5': 'Top 5',
            'guild.top10': 'Top 10',
            'guild.top20': 'Top 20',
            'guild.top50': 'Top 50',
            'guild.top100': 'Top 100',
            'guild.top150': 'Top 150',
            'guild.top200': 'Top 200',
            'guild.top300': 'Top 300',
            'guild.top400': 'Top 400',
            'guild.top500': 'Top 500',
            'guild.top1000': 'Top 1000',
            'guild.top1500': 'Top 1500',
            'guild.top2000': 'Top 2000',
            'guild.top3000': 'Top 3000',
            'guild.below3001': 'Top 3001 이하',
        },

        wbRanks: {
            'wb.rank1': '1위',
            'wb.rank2': '2위',
            'wb.rank3': '3위',
            'wb.top10': 'Top 10',
            'wb.top50': 'Top 50',
            'wb.top100': 'Top 100',
            'wb.top1pct': 'Top 1%',
            'wb.top10pct': 'Top 10%',
            'wb.top50pct': 'Top 50%',
            'wb.top100pct': 'Top 100%',
        },
        wbLeagues: {
            'Normal': '노멀',
            'Hard': '하드',
            'Very Hard': '베리 하드',
            'Extreme': '익스트림',
        },

        variableItems: {
            'variable.terminus': '터미널 아일 에테르 보상 (터미널 10 보물 보상에서 22~26) (매일 5회, 터미널 팩으로 ×2)',
            'variable.updateEvent': '각 업데이트 이벤트',
            'variable.sideStories': '새 캐릭터마다 새 사이드 스토리 (프리미엄/한정 제외)',
            'variable.coupons': '쿠폰 코드',
            'variable.seasonalEvents': '시즌 이벤트 (스토리, 포인트 상점, 로그인 체인)',
        },
    },

    zh: {
        title: '以太收入（日/周/月）',
        description: '本指南将收入分为日常、每周和每月来源。使用高级排名设置（竞技场、公会副本、世界Boss）来匹配您的账号——总计和日期预测会即时更新。活动/季节奖励单独列出，不计入总计。',

        dailyIncome: '日常收入',
        weeklyIncome: '每周收入',
        monthlyIncome: '每月收入',
        weeklyTotal: '周总计',
        monthlyTotal: '月总计',
        perDay: '/天',

        advancedAdjustments: '高级排名设置',
        arena: '竞技场',
        guild: '公会',
        worldBoss: '世界Boss',

        tableDaily: '日常收入',
        tableWeekly: '每周收入',
        tableMonthly: '每月收入',
        source: '来源',
        daily: '日常',
        weekly: '每周',
        monthly: '每月',
        weeklyApprox: '周≈×7',
        monthlyApprox: '月≈×30',
        monthlyApprox4: '月≈×4',
        notes: '备注',
        dailySubtotal: '日常小计',
        weeklySubtotal: '每周小计',
        monthlySubtotal: '每月小计',

        variableExcluded: '变动/活动奖励（不计入）',
        variableTitle: '其他',

        projection: '日期预测',
        endDate: '结束日期',
        currentEther: '当前以太',
        days: '天数',
        weeks: '周数',
        months: '月数',
        fromDaily: '来自日常',
        fromWeekly: '来自每周',
        fromMonthly: '来自每月',
        projectedTotal: '预计总计',

        sources: {
            'daily.missions': '每日任务',
            'daily.arena': '每日竞技场',
            'daily.freePack': '每日免费礼包',
            'daily.missionEvent': '每日任务活动',
            'daily.antiparticle': '反粒子发生器（2×12小时）',
            'weekly.freePack': '每周免费礼包',
            'weekly.arena': '每周竞技场排名',
            'weekly.missions': '每周任务',
            'weekly.guildCheckin': '公会签到',
            'weekly.monadGate': '莫纳德之门每周任务',
            'monthly.freePack': '每月免费礼包',
            'monthly.skywardTower': '升天之塔',
            'monthly.checkin': '签到',
            'monthly.maintenance': '维护奖励',
            'monthly.jointMission': '联合任务',
            'monthly.guildRaid': '公会副本排名奖励',
            'monthly.worldBoss': '世界Boss排名奖励',
        },
        sourceNotes: {
            'weekly.arena': '最低35。第1名最高1500。',
            'weekly.monadGate': '5×10 + 200完成奖励',
            'monthly.maintenance': '约200（每2周，最低）',
            'monthly.jointMission': '活动任务80，完成10次联合挑战',
            'monthly.guildRaid': '最低200。第1名最高1500。',
            'monthly.worldBoss': '最低60。极限难度第1名最高1500。',
        },

        arenaRanks: {
            'arena.bronze3': '青铜III',
            'arena.bronze2': '青铜II',
            'arena.bronze1': '青铜I',
            'arena.silver3': '白银III',
            'arena.silver2': '白银II',
            'arena.silver1': '白银I',
            'arena.gold3': '黄金III',
            'arena.gold2': '黄金II',
            'arena.gold1': '黄金I',
            'arena.platinum3': '铂金III',
            'arena.platinum2': '铂金II',
            'arena.platinum1': '铂金I',
            'arena.diamond3': '钻石III',
            'arena.diamond2': '钻石II',
            'arena.diamond1': '钻石I',
            'arena.master3': '大师III',
            'arena.master2': '大师II',
            'arena.master1': '大师I',
            'arena.top100': 'Top 100',
            'arena.top50': 'Top 50',
            'arena.top10': 'Top 10',
            'arena.top3': 'Top 3',
            'arena.top2': 'Top 2',
            'arena.top1': 'Top 1',
        },

        guildRanks: {
            'guild.top1': 'Top 1',
            'guild.top2': 'Top 2',
            'guild.top3': 'Top 3',
            'guild.top5': 'Top 5',
            'guild.top10': 'Top 10',
            'guild.top20': 'Top 20',
            'guild.top50': 'Top 50',
            'guild.top100': 'Top 100',
            'guild.top150': 'Top 150',
            'guild.top200': 'Top 200',
            'guild.top300': 'Top 300',
            'guild.top400': 'Top 400',
            'guild.top500': 'Top 500',
            'guild.top1000': 'Top 1000',
            'guild.top1500': 'Top 1500',
            'guild.top2000': 'Top 2000',
            'guild.top3000': 'Top 3000',
            'guild.below3001': 'Top 3001以下',
        },

        wbRanks: {
            'wb.rank1': '第1名',
            'wb.rank2': '第2名',
            'wb.rank3': '第3名',
            'wb.top10': 'Top 10',
            'wb.top50': 'Top 50',
            'wb.top100': 'Top 100',
            'wb.top1pct': 'Top 1%',
            'wb.top10pct': 'Top 10%',
            'wb.top50pct': 'Top 50%',
            'wb.top100pct': 'Top 100%',
        },
        wbLeagues: {
            'Normal': '普通',
            'Hard': '困难',
            'Very Hard': '超难',
            'Extreme': '极限',
        },

        variableItems: {
            'variable.terminus': '终点岛以太奖励（终点10的宝箱奖励22~26）（每天5次，终点礼包×2）',
            'variable.updateEvent': '每次更新活动',
            'variable.sideStories': '每个新角色的新外传（精选/限定除外）',
            'variable.coupons': '兑换码',
            'variable.seasonalEvents': '季节活动（剧情、积分商店、登录链）',
        },
    },
}
