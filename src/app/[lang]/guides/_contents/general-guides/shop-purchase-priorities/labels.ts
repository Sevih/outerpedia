/**
 * Libellés du guide « Recommended Purchases by Shop » — transplantés VERBATIM
 * de la V2. Les 8 shops permanents « à monnaie » DÉRIVENT du jeu
 * (data/generated/shop-priorities.json) ; ces libellés ne portent que la
 * présentation (légende de priorité, colonnes, noms d'onglets) et le contenu
 * ÉDITORIAL des shops non dérivés (cf. editorial.ts).
 */
import type { LocalizedText } from '@contracts';

export const LABELS = {
  description: {
    en: 'Specify exact costs and the amount given per purchase. Limits are structured as "count / period".',
    jp: '購入ごとの正確なコストと数量を明記。制限は「回数 / 期間」の形式です。',
    kr: '구매당 정확한 비용과 수량을 명시합니다. 제한은 "횟수 / 기간" 형식입니다.',
    zh: '标明每次购买的确切成本和数量。限制以"次数/周期"格式显示。',
    fr: 'Indique les coûts exacts et la quantité donnée par achat. Les limites sont structurées au format "nombre / période".',
  },
  legendTitle: {
    en: 'Legend:',
    jp: '凡例:',
    kr: '범례:',
    zh: '图例:',
    fr: 'Légende :',
  },
  legendS: {
    en: 'S = must-buy',
    jp: 'S = 必須購入',
    kr: 'S = 필수 구매',
    zh: 'S = 必买',
    fr: 'S = à acheter absolument',
  },
  legendA: {
    en: 'A = high value',
    jp: 'A = 高価値',
    kr: 'A = 높은 가치',
    zh: 'A = 高价值',
    fr: 'A = grande valeur',
  },
  legendB: {
    en: 'B = situational',
    jp: 'B = 状況次第',
    kr: 'B = 상황에 따라',
    zh: 'B = 视情况而定',
    fr: 'B = situationnel',
  },
  legendC: {
    en: 'C = low priority',
    jp: 'C = 低優先度',
    kr: 'C = 낮은 우선순위',
    zh: 'C = 低优先级',
    fr: 'C = faible priorité',
  },
  periodsTitle: {
    en: 'Periods:',
    jp: '期間:',
    kr: '기간:',
    zh: '周期:',
    fr: 'Périodes :',
  },
  periodD: {
    en: 'D = Daily',
    jp: 'D = 毎日',
    kr: 'D = 매일',
    zh: 'D = 每日',
    fr: 'D = Quotidien',
  },
  periodW: {
    en: 'W = Weekly',
    jp: 'W = 毎週',
    kr: 'W = 매주',
    zh: 'W = 每周',
    fr: 'W = Hebdomadaire',
  },
  periodM: {
    en: 'M = Monthly',
    jp: 'M = 毎月',
    kr: 'M = 매월',
    zh: 'M = 每月',
    fr: 'M = Mensuel',
  },
  periodO: {
    en: 'O = One-time',
    jp: 'O = 一回限り',
    kr: 'O = 일회성',
    zh: 'O = 一次性',
    fr: 'O = Unique',
  },
  colPriority: {
    en: 'Priority',
    jp: '優先度',
    kr: '우선순위',
    zh: '优先级',
    fr: 'Priorité',
  },
  colItem: {
    en: 'Item',
    jp: 'アイテム',
    kr: '아이템',
    zh: '物品',
    fr: 'Item',
  },
  colGives: {
    en: 'Gives',
    jp: '獲得',
    kr: '획득',
    zh: '获得',
    fr: 'Donne',
  },
  colCost: {
    en: 'Cost',
    jp: 'コスト',
    kr: '비용',
    zh: '花费',
    fr: 'Coût',
  },
  colLimit: {
    en: 'Limit',
    jp: '制限',
    kr: '제한',
    zh: '限制',
    fr: 'Limite',
  },
  colNotes: {
    en: 'Notes',
    jp: '備考',
    kr: '비고',
    zh: '备注',
    fr: 'Notes',
  },
  seeGearUsageFinder: {
    en: 'See Gear Usage Finder to check which characters your gear matches.',
    jp: 'Gear Usage Finderで、装備がどのキャラクターに適しているか確認できます。',
    kr: 'Gear Usage Finder에서 장비가 어떤 캐릭터에 맞는지 확인하세요.',
    zh: '请查看Gear Usage Finder，确认装备适合哪些角色。',
    fr: 'Consultez le Gear Usage Finder pour vérifier à quels personnages votre gear correspond.',
  },
} as const satisfies Record<string, LocalizedText>;

/** Onglets de shop (ordre d'affichage V2). `key` aligné sur le générateur. */
export const SHOP_TABS: { key: string; label: LocalizedText }[] = [
  {
    key: 'guild',
    label: {
      en: 'Guild Shop',
      jp: 'ギルドショップ',
      kr: '길드 상점',
      zh: '公会商店',
      fr: 'Guild Shop',
    },
  },
  {
    key: 'supply',
    label: {
      en: 'Supply Module',
      jp: '補給モジュール',
      kr: '보급 모듈',
      zh: '补给模块',
      fr: 'Supply Module',
    },
  },
  {
    key: 'rico',
    label: {
      en: 'Rico Secret',
      jp: 'リコの秘密',
      kr: '리코의 비밀',
      zh: '里科的秘密',
      fr: 'Rico Secret',
    },
  },
  {
    key: 'event',
    label: {
      en: 'Event Shop',
      jp: 'イベントショップ',
      kr: '이벤트 상점',
      zh: '活动商店',
      fr: 'Event Shop',
    },
  },
  {
    key: 'joint',
    label: {
      en: 'Joint Challenge',
      jp: 'ジョイントチャレンジ',
      kr: '조인트 챌린지',
      zh: '联合挑战',
      fr: 'Joint Challenge',
    },
  },
  {
    key: 'friend',
    label: {
      en: 'Friendship Point',
      jp: '友情ポイント',
      kr: '우정 포인트',
      zh: '友情点',
      fr: 'Friendship Point',
    },
  },
  {
    key: 'arena',
    label: {
      en: 'Arena Shop',
      jp: 'アリーナショップ',
      kr: '아레나 상점',
      zh: '竞技场商店',
      fr: 'Arena Shop',
    },
  },
  {
    key: 'stars',
    label: {
      en: "Star's Memory",
      jp: 'スターの記憶',
      kr: '스타의 기억',
      zh: '星之记忆',
      fr: "Star's Memory",
    },
  },
  {
    key: 'worldboss',
    label: {
      en: 'World Boss',
      jp: 'ワールドボス',
      kr: '월드 보스',
      zh: '世界首领',
      fr: 'World Boss',
    },
  },
  {
    key: 'al',
    label: {
      en: 'Adventure License',
      jp: '冒険ライセンス',
      kr: '모험 라이선스',
      zh: '冒险执照',
      fr: 'Adventure License',
    },
  },
  {
    key: 'survey',
    label: {
      en: 'Survey Hub',
      jp: 'サーベイハブ',
      kr: '서베이 허브',
      zh: '调查中心',
      fr: 'Survey Hub',
    },
  },
  {
    key: 'resource',
    label: {
      en: 'General',
      jp: '一般',
      kr: '일반',
      zh: '通用',
      fr: 'Général',
    },
  },
];
