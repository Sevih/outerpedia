/**
 * Libellés du guide « Weekly & Monthly Reference Tables » (timegate-resource).
 *
 * Le factuel (sources, quantités, totaux) DÉRIVE de
 * `data/generated/timegate-resources.json` — cf. le générateur pour la frontière
 * dérivé (shops) / curé (non-shop). Ici ne vivent que la présentation (intro,
 * en-têtes, badges, onglets) et les NOMS de source en 5 langues, mappés par clé.
 *
 * Les libellés de source ≤ V2 sont transplantés verbatim ; ceux des shops que la
 * dérivation a révélés (general/tower/remains/pvp-real, absents de la hand-list
 * V2) sont ajoutés dans le même style.
 */
import type { LocalizedText } from '@contracts';
import type { SourceType } from '@contracts';

export const LABELS = {
  intro: {
    en: 'This guide lists every regular weekly and monthly source of timegated resources in Outerplane. Shop rows are derived from game data, so they stay current when a shop is reshuffled; non-shop rows (dungeon drops, mission and singularity rewards) are player estimates that assume things like reaching SSS++ rank or playing every eligible day. The items below can also occasionally come from limited-time events or cash packs, which are not counted here.',
    jp: 'このガイドは、アウタープレーンで定期的に入手できる週間・月間の時限リソースをすべてまとめています。ショップの行はゲームデータから導出しているため、ショップが再編されても最新の内容を保ちます。ショップ以外の行（ダンジョンのドロップ、ミッションや特異点の報酬）は、SSS++ランク到達や毎日プレイなどを前提とした推定値です。ここに記載のアイテムは期間限定イベントや課金パックでも入手できる場合がありますが、それらは含みません。',
    kr: '이 가이드는 아우터플레인에서 정기적으로 획득할 수 있는 주간·월간 시간제한 리소스를 모두 정리한 것입니다. 상점 항목은 게임 데이터에서 도출되므로 상점이 개편되어도 최신 상태를 유지합니다. 상점 외 항목(던전 드롭, 미션·특이점 보상)은 SSS++ 등급 도달이나 매일 플레이 등을 전제로 한 추정치입니다. 아래 아이템은 기간 한정 이벤트나 캐시 패키지로도 얻을 수 있지만 여기에는 포함하지 않습니다.',
    zh: '本指南列出了《Outerplane》中所有可定期获取的每周和每月限时资源。商店行由游戏数据推导，因此在商店重排后仍保持最新；非商店行（副本掉落、任务与奇点奖励）为玩家估算值，假设达成 SSS++ 评级或每天参与等条件。下列物品有时也可通过限时活动或充值礼包获得，但这些不计入本表。',
    fr: "Ce guide liste toutes les sources hebdomadaires et mensuelles régulières de ressources timegated dans Outerplane. Les lignes de shop sont dérivées des données du jeu : elles restent à jour quand un shop est rebrassé. Les lignes hors shop (drops de donjon, récompenses de mission et de singularité) sont des estimations joueur qui supposent par exemple d'atteindre le rang SSS++ ou de jouer chaque jour éligible. Les items ci-dessous peuvent aussi provenir d'events à durée limitée ou de packs payants, non comptés ici.",
  },

  tabs: {
    books: {
      en: 'Skill Manual',
      jp: 'スキル教本',
      kr: '스킬 교본',
      zh: '技能教材',
      fr: 'Manuels de skill',
    },
    transistones: {
      en: 'Transistone',
      jp: 'トランストーン',
      kr: '트랜스톤',
      zh: '转换石',
      fr: 'Transistone',
    },
    special: {
      en: 'Special Gear',
      jp: '特殊装備',
      kr: '특수 장비',
      zh: '特殊装备',
      fr: 'Équipement spécial',
    },
    'singularity-gear': {
      en: 'Singularity Gear',
      jp: '特異点装備',
      kr: '특이점 장비',
      zh: '奇点装备',
      fr: 'Équipement de singularité',
    },
    glunite: { en: 'Glunite', jp: 'グルーナイト', kr: '글루나이트', zh: '格鲁矿石', fr: 'Glunite' },
    'limit-break': {
      en: 'Limit Break',
      jp: '限界突破',
      kr: '한계 돌파',
      zh: '极限突破',
      fr: 'Limit Break',
    },
  } satisfies Record<string, LocalizedText>,

  headers: {
    source: { en: 'Source', jp: '獲得先', kr: '획득처', zh: '获取途径', fr: 'Source' },
    weekly: { en: 'Weekly', jp: 'ウィークリー', kr: '주간', zh: '每周', fr: 'Hebdo' },
    monthly: { en: 'Monthly', jp: 'マンスリー', kr: '월간', zh: '每月', fr: 'Mensuel' },
    total: { en: 'Total', jp: '合計', kr: '합계', zh: '总计', fr: 'Total' },
    grandTotal: {
      en: 'Grand Total (Monthly)',
      jp: '月間合計',
      kr: '월간 총합',
      zh: '月度总计',
      fr: 'Total mensuel global',
    },
  } satisfies Record<string, LocalizedText>,

  badges: {
    mission: { en: 'Mission', jp: 'ミッション', kr: '미션', zh: '任务', fr: 'Mission' },
    guild: { en: 'Guild', jp: 'ギルド', kr: '길드', zh: '公会', fr: 'Guilde' },
    shop: { en: 'Shop', jp: 'ショップ', kr: '상점', zh: '商店', fr: 'Shop' },
    craft: { en: 'Craft', jp: '製作', kr: '제작', zh: '制作', fr: 'Craft' },
  } satisfies Record<SourceType, LocalizedText>,

  /** Note de coût d'un craft : « coût 30× <item> » (l'item est un chip séparé). */
  costLabel: {
    en: 'cost',
    jp: '消費',
    kr: '소모',
    zh: '消耗',
    fr: 'coût',
  } satisfies LocalizedText,

  sources: {
    // Shops dérivés (ProductBuyType → clé). Libellés éditoriaux 5 langues.
    general: {
      en: 'General Shop',
      jp: 'ジェネラルショップ',
      kr: '일반 상점',
      zh: '普通商店',
      fr: 'Boutique générale',
    },
    guild: {
      en: 'Guild Shop',
      jp: 'ギルドショップ',
      kr: '길드 상점',
      zh: '公会商店',
      fr: 'Guild Shop',
    },
    arena: {
      en: 'Arena Shop',
      jp: 'アリーナショップ',
      kr: '결투장 상점',
      zh: '竞技场商店',
      fr: 'Arena Shop',
    },
    'pvp-real': {
      en: 'Real-Time Arena Shop',
      jp: 'リアルタイムアリーナショップ',
      kr: '실시간 결투장 상점',
      zh: '实时竞技场商店',
      fr: "Boutique d'arène en temps réel",
    },
    stars: {
      en: "Star's Memory Shop",
      jp: 'スターピースショップ',
      kr: '별의 기억 상점',
      zh: '星之记忆商店',
      fr: "Star's Memory Shop",
    },
    survey: {
      en: 'Survey Hub',
      jp: '調査支援所',
      kr: '조사 지원소',
      zh: '调查支援所',
      fr: 'Survey Hub',
    },
    worldboss: {
      en: 'World Boss Shop',
      jp: 'ワールドボスショップ',
      kr: '월드 보스 상점',
      zh: '世界首领商店',
      fr: 'World Boss Shop',
    },
    tower: {
      en: 'Skyward Tower Shop',
      jp: 'スカイワードタワーショップ',
      kr: '스카이워드 타워 상점',
      zh: '天空之塔商店',
      fr: 'Boutique de la Tour céleste',
    },
    remains: {
      en: 'Remains Shop',
      jp: 'レムナントショップ',
      kr: '잔재 상점',
      zh: '遗迹商店',
      fr: 'Boutique des Vestiges',
    },
    joint: {
      en: 'Joint Challenge Shop',
      jp: '合同チャレンジショップ',
      kr: '합동 챌린지 상점',
      zh: '联合挑战商店',
      fr: 'Joint Challenge Shop',
    },

    // Sources non-shop curées (transplant V2 verbatim).
    'irregular-infiltration-floor-3': {
      en: 'Irregular Infiltration Operation — Floor 3',
      jp: 'イレギュラー侵入殲滅戦 フロア3',
      kr: '이레귤러 침투 섬멸전 플로어 3',
      zh: '异型怪渗透歼灭战 第3层',
      fr: "Opération d'infiltration Irregular — Étage 3",
    },
    'irregular-extermination-points': {
      en: 'Irregular Extermination Project — Point Exchange',
      jp: 'イレギュラー殲滅戦 ポイント交換所',
      kr: '이레귤러 섬멸전 포인트 교환소',
      zh: '异型怪歼灭战 点数兑换所',
      fr: "Projet d'extermination Irregular — Échange de points",
    },
    'arena-weekly-play': {
      en: 'Weekly Play Reward',
      jp: 'ウィークリープレイ報酬',
      kr: '주간 플레이 보상',
      zh: '每周游戏奖励',
      fr: 'Récompense de jeu hebdomadaire',
    },
    'weekly-mission': {
      en: 'Weekly Mission',
      jp: 'ウィークリーミッション',
      kr: '주간 미션',
      zh: '每周任务',
      fr: 'Mission hebdomadaire',
    },
    'singularity-rank': {
      en: 'Dimensional Singularity — SSS++ Rank Reward',
      jp: '次元特異点 SSS++ランク報酬',
      kr: '차원 특이점 SSS++ 등급 보상',
      zh: '次元奇点 SSS++评级奖励',
      fr: 'Singularité dimensionnelle — Récompense rang SSS++',
    },
    'singularity-daily-run': {
      en: 'Dimensional Singularity — Daily Run (Wed–Sat)',
      jp: '次元特異点 デイリー参加 (水〜土)',
      kr: '차원 특이점 일일 참여 (수~토)',
      zh: '次元奇点 每日参与 (周三~周六)',
      fr: 'Singularité dimensionnelle — Run quotidien (Mer–Sam)',
    },
    'singularity-daily-ranking': {
      en: 'Dimensional Singularity — Daily Ranking',
      jp: '次元特異点 デイリーランキング',
      kr: '차원 특이점 일일 랭킹',
      zh: '次元奇点 每日排名',
      fr: 'Singularité dimensionnelle — Classement quotidien',
    },
    'kates-workshop': {
      en: "Kate's Workshop",
      jp: 'ケイトの工房',
      kr: '케이트 공방',
      zh: '凯特工坊',
      fr: 'Atelier de Kate',
    },
  } satisfies Record<string, LocalizedText>,
} as const;
