/**
 * Libellés du guide « Weekly & Monthly Reference Tables » (timegate-resource).
 *
 * Le factuel (sources, quantités, totaux) DÉRIVE de
 * `data/generated/timegate-resources.json` — cf. le générateur pour la frontière
 * dérivé (shops) / curé (non-shop). Ici ne vivent que la présentation (intro,
 * en-têtes, badges, onglets) et les NOMS de source en 5 langues, mappés par clé.
 *
 * Les libellés de source hérités sont transplantés verbatim (sauf ceux de la
 * Singularité, réécrits au patch 1.4.22 : rangs jusqu'à EX+++, run illimité
 * mais récompense quotidienne). UN SHOP = UN ONGLET
 * d'échange réel (cf. le générateur) : les 7 shops canoniques, Arena unifié
 * (points d'arène + temps réel = même onglet). Tower/Remains sont écartés
 * (aucun onglet d'échange — décision Sevih 19/07).
 */
import type { LocalizedText } from '@contracts';
import type { SourceType } from '@contracts';

export const LABELS = {
  intro: {
    en: 'This guide lists every regular weekly and monthly source of timegated resources in Outerplane. Shop rows and Dimensional Singularity rewards are derived from game data, so they stay current when a shop is reshuffled or a reward changes; Singularity totals assume reaching EX+++ rank and one run every day of the season. Other non-shop rows (dungeon drops, mission rewards) are player estimates that assume playing every eligible day. The items below can also occasionally come from limited-time events or cash packs, which are not counted here.',
    jp: 'このガイドは、アウタープレーンで定期的に入手できる週間・月間の時限リソースをすべてまとめています。ショップの行と次元特異点の報酬はゲームデータから導出しているため、ショップの再編や報酬の変更があっても最新の内容を保ちます。特異点の合計はEX+++ランク到達とシーズン中毎日1回のプレイを前提としています。その他のショップ以外の行（ダンジョンのドロップ、ミッション報酬）は、対象日に毎日プレイすることを前提とした推定値です。ここに記載のアイテムは期間限定イベントや課金パックでも入手できる場合がありますが、それらは含みません。',
    kr: '이 가이드는 아우터플레인에서 정기적으로 획득할 수 있는 주간·월간 시간제한 리소스를 모두 정리한 것입니다. 상점 항목과 차원 특이점 보상은 게임 데이터에서 도출되므로 상점이 개편되거나 보상이 바뀌어도 최신 상태를 유지합니다. 특이점 합계는 EX+++ 등급 도달과 시즌 중 매일 1회 플레이를 전제로 합니다. 그 외 상점 외 항목(던전 드롭, 미션 보상)은 해당 요일마다 플레이한다는 전제의 추정치입니다. 아래 아이템은 기간 한정 이벤트나 캐시 패키지로도 얻을 수 있지만 여기에는 포함하지 않습니다.',
    zh: '本指南列出了《Outerplane》中所有可定期获取的每周和每月限时资源。商店行与次元奇点奖励由游戏数据推导，因此在商店重排或奖励变动后仍保持最新；奇点合计假设达成 EX+++ 评级并在赛季内每天参与一次。其他非商店行（副本掉落、任务奖励）为玩家估算值，假设每个可参与日都进行游戏。下列物品有时也可通过限时活动或充值礼包获得，但这些不计入本表。',
    fr: "Ce guide liste toutes les sources hebdomadaires et mensuelles régulières de ressources timegated dans Outerplane. Les lignes de shop et les récompenses de Dimensional Singularity sont dérivées des données du jeu : elles restent à jour quand un shop est rebrassé ou qu'une récompense change. Les totaux de Singularity supposent d'atteindre le rang EX+++ et de faire un run chaque jour de la saison. Les autres lignes hors shop (drops de donjon, récompenses de mission) sont des estimations joueur qui supposent de jouer chaque jour éligible. Les items ci-dessous peuvent aussi provenir d'events à durée limitée ou de packs payants, non comptés ici.",
    es: 'Esta guía lista todas las fuentes semanales y mensuales regulares de recursos con límite de tiempo en Outerplane. Las filas de tienda y las recompensas de Dimensional Singularity se derivan de datos del juego, así que se mantienen actualizadas cuando una tienda se reorganiza o cambia una recompensa; los totales de Singularity asumen alcanzar el rango EX+++ y hacer una ejecución cada día de la temporada. Las demás filas que no son de tienda (drops de dungeon, recompensas de misión) son estimaciones de jugadores que asumen jugar cada día elegible. Los ítems de abajo también pueden venir ocasionalmente de eventos por tiempo limitado o paquetes de pago, que no se cuentan aquí.',
  },

  tabs: {
    books: {
      en: 'Skill Manual',
      jp: 'スキル教本',
      kr: '스킬 교본',
      zh: '技能教材',
      fr: 'Manuels de skill',
      es: 'Manual de Skill',
    },
    transistones: {
      en: 'Transistone',
      jp: 'トランストーン',
      kr: '트랜스톤',
      zh: '转换石',
      fr: 'Transistone',
      es: 'Transistone',
    },
    special: {
      en: 'Special Gear',
      jp: '特殊装備',
      kr: '특수 장비',
      zh: '特殊装备',
      fr: 'Équipement spécial',
      es: 'Equipo especial',
    },
    'singularity-gear': {
      en: 'Singularity Gear',
      jp: '特異点装備',
      kr: '특이점 장비',
      zh: '奇点装备',
      fr: 'Équipement de singularité',
      es: 'Equipo de Singularidad',
    },
    glunite: {
      en: 'Glunite',
      jp: 'グルーナイト',
      kr: '글루나이트',
      zh: '格鲁矿石',
      fr: 'Glunite',
      es: 'Glunite',
    },
    'limit-break': {
      en: 'Limit Break',
      jp: '限界突破',
      kr: '한계 돌파',
      zh: '极限突破',
      fr: 'Limit Break',
      es: 'Limit Break',
    },
  } satisfies Record<string, LocalizedText>,

  // Source / Weekly / Monthly : chrome, via t() (equip.detail.source, home.resets.*).
  headers: {
    total: { en: 'Total', jp: '合計', kr: '합계', zh: '总计', fr: 'Total', es: 'Total' },
    grandTotal: {
      en: 'Grand Total (Monthly)',
      jp: '月間合計',
      kr: '월간 총합',
      zh: '月度总计',
      fr: 'Total mensuel global',
      es: 'Total General (Mensual)',
    },
  } satisfies Record<string, LocalizedText>,

  badges: {
    mission: {
      en: 'Mission',
      jp: 'ミッション',
      kr: '미션',
      zh: '任务',
      fr: 'Mission',
      es: 'Misión',
    },
    guild: { en: 'Guild', jp: 'ギルド', kr: '길드', zh: '公会', fr: 'Guilde', es: 'Gremio' },
    shop: { en: 'Shop', jp: 'ショップ', kr: '상점', zh: '商店', fr: 'Shop', es: 'Tienda' },
    craft: { en: 'Craft', jp: '製作', kr: '제작', zh: '制作', fr: 'Craft', es: 'Fabricar' },
  } satisfies Record<SourceType, LocalizedText>,

  /** Note de coût d'un craft : « coût 30× <item> » (l'item est un chip séparé). */
  costLabel: {
    en: 'cost',
    jp: '消費',
    kr: '소모',
    zh: '消耗',
    fr: 'coût',
    es: 'costo',
  } satisfies LocalizedText,

  sources: {
    // Shops dérivés (ProductBuyType → clé). Libellés éditoriaux 5 langues.
    general: {
      en: 'General Shop',
      jp: 'ジェネラルショップ',
      kr: '일반 상점',
      zh: '普通商店',
      fr: 'Boutique générale',
      es: 'Tienda General',
    },
    guild: {
      en: 'Guild Shop',
      jp: 'ギルドショップ',
      kr: '길드 상점',
      zh: '公会商店',
      fr: 'Guild Shop',
      es: 'Tienda del Gremio',
    },
    arena: {
      en: 'Arena Shop',
      jp: 'アリーナショップ',
      kr: '결투장 상점',
      zh: '竞技场商店',
      fr: 'Arena Shop',
      es: 'Tienda de Arena',
    },
    stars: {
      en: "Star's Memory Shop",
      jp: 'スターピースショップ',
      kr: '별의 기억 상점',
      zh: '星之记忆商店',
      fr: "Star's Memory Shop",
      es: 'Tienda de Memoria de Estrella',
    },
    survey: {
      en: 'Survey Hub',
      jp: '調査支援所',
      kr: '조사 지원소',
      zh: '调查支援所',
      fr: 'Survey Hub',
      es: 'Centro de Encuestas',
    },
    worldboss: {
      en: 'World Boss Shop',
      jp: 'ワールドボスショップ',
      kr: '월드 보스 상점',
      zh: '世界首领商店',
      fr: 'World Boss Shop',
      es: 'Tienda de Jefe mundial',
    },
    joint: {
      en: 'Joint Challenge Shop',
      jp: '合同チャレンジショップ',
      kr: '합동 챌린지 상점',
      zh: '联合挑战商店',
      fr: 'Joint Challenge Shop',
      es: 'Tienda de Desafío conjunto',
    },

    // Sources non-shop curées (transplant verbatim).
    'irregular-infiltration-floor-3': {
      en: 'Irregular Infiltration Operation — Floor 3',
      jp: 'イレギュラー侵入殲滅戦 フロア3',
      kr: '이레귤러 침투 섬멸전 플로어 3',
      zh: '异型怪渗透歼灭战 第3层',
      fr: "Opération d'infiltration Irregular — Étage 3",
      es: 'Op. de Infiltración Irregular — Piso 3',
    },
    'irregular-extermination-points': {
      en: 'Irregular Extermination Project — Point Exchange',
      jp: 'イレギュラー殲滅戦 ポイント交換所',
      kr: '이레귤러 섬멸전 포인트 교환소',
      zh: '异型怪歼灭战 点数兑换所',
      fr: "Projet d'extermination Irregular — Échange de points",
      es: 'Proyecto de Exterminio Irregular — Intercambio de Puntos',
    },
    'arena-weekly-play': {
      en: 'Weekly Play Reward',
      jp: 'ウィークリープレイ報酬',
      kr: '주간 플레이 보상',
      zh: '每周游戏奖励',
      fr: 'Récompense de jeu hebdomadaire',
      es: 'Recompensa Semanal por Jugar',
    },
    'weekly-mission': {
      en: 'Weekly Mission',
      jp: 'ウィークリーミッション',
      kr: '주간 미션',
      zh: '每周任务',
      fr: 'Mission hebdomadaire',
      es: 'Misión Semanal',
    },
    'singularity-rank': {
      en: 'Dimensional Singularity — Rank Rewards (E to EX+++)',
      jp: '次元特異点 ランク報酬 (E〜EX+++)',
      kr: '차원 특이점 등급 보상 (E~EX+++)',
      zh: '次元奇点 评级奖励 (E~EX+++)',
      fr: 'Singularité dimensionnelle — Récompenses de rang (E à EX+++)',
      es: 'Singularidad Dimensional — Recompensas de Rango (E a EX+++)',
    },
    'singularity-weekly-mission': {
      en: 'Dimensional Singularity — Weekly Missions',
      jp: '次元特異点 ウィークリーミッション',
      kr: '차원 특이점 주간 미션',
      zh: '次元奇点 每周任务',
      fr: 'Singularité dimensionnelle — Missions hebdomadaires',
      es: 'Singularidad Dimensional — Misiones Semanales',
    },
    'singularity-daily-run': {
      en: 'Dimensional Singularity — Daily Reward (1 run per day, Wed–Sun)',
      jp: '次元特異点 デイリー報酬 (1日1回プレイ、水〜日)',
      kr: '차원 특이점 일일 보상 (하루 1회 플레이, 수~일)',
      zh: '次元奇点 每日奖励 (每天挑战1次，周三~周日)',
      fr: 'Singularité dimensionnelle — Récompense quotidienne (1 run par jour, Mer–Dim)',
      es: 'Singularidad Dimensional — Recompensa Diaria (1 ejecución por día, Mié–Dom)',
    },
    'singularity-daily-ranking': {
      en: 'Dimensional Singularity — Daily Ranking',
      jp: '次元特異点 デイリーランキング',
      kr: '차원 특이점 일일 랭킹',
      zh: '次元奇点 每日排名',
      fr: 'Singularité dimensionnelle — Classement quotidien',
      es: 'Singularidad Dimensional — Clasificación Diaria',
    },
    'kates-workshop': {
      en: "Kate's Workshop",
      jp: 'ケイトの工房',
      kr: '케이트 공방',
      zh: '凯特工坊',
      fr: 'Atelier de Kate',
      es: "Kate's Workshop",
    },
  } satisfies Record<string, LocalizedText>,
} as const;
