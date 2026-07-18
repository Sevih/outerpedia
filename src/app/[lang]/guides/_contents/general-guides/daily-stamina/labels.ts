/**
 * Libellés du guide « Daily Stamina » — transplantés VERBATIM de la V2
 * (index.tsx, oracle de contenu). Le titre vit dans meta.json (le H2 en page
 * « Roadmap » de la V2 suit le pattern H1-meta des autres guides) ; les noms
 * des boss irréguliers DÉRIVENT de monsters.json — sauf l'Irregular Queen,
 * dont le nom est VIDE dans les tables du jeu (repli éditorial ci-dessous).
 */
import type { LocalizedText } from '@contracts';

export const LABELS = {
  intro: {
    en: 'Learn how to efficiently spend your stamina daily in Outerplane with this step-by-step guide.',
    jp: 'この手順ガイドで、Outerplane の毎日のスタミナを効率よく使う方法を学びましょう。',
    kr: '이 단계별 가이드로 Outerplane에서 매일 스태미나를 효율적으로 사용하는 법을 알아보세요.',
    zh: '通过这份分步指南，了解每日如何在异域战记中高效地消耗体力',
    fr: 'Apprenez à dépenser votre stamina quotidienne efficacement dans Outerplane avec ce guide pas à pas.',
  },
  introPara1: {
    en: 'Spending {I-I/Stamina} efficiently is one of the most important things you can do to progress in this game — especially if you plan to play long-term.',
    jp: '{I-I/Stamina}を効率的に使うことは、このゲームで進行する上で最も重要なことの一つです — 特に長期的にプレイする予定なら。',
    kr: '{I-I/Stamina}를 효율적으로 사용하는 것은 이 게임에서 성장하는 데 가장 중요한 일 중 하나입니다 — 특히 장기 플레이를 계획한다면.',
    zh: '高效使用{I-I/Stamina}是游戏中最重要的事情之一 — 尤其是如果你计划长期游玩。',
    fr: "Dépenser la {I-I/Stamina} efficacement est l'une des choses les plus importantes pour progresser dans ce jeu, surtout si vous comptez jouer sur le long terme.",
  },
  introPara2: {
    en: "Here's a list of daily priorities to help you spend your {I-I/Stamina} wisely and keep resources flowing into your account:",
    jp: '以下は{I-I/Stamina}を賢く使い、アカウントにリソースを流し続けるための毎日の優先事項リストです：',
    kr: '다음은 {I-I/Stamina}를 현명하게 사용하고 계정에 지속적으로 자원을 확보하기 위한 일일 우선순위 목록입니다:',
    zh: '以下是帮助你明智使用{I-I/Stamina}并持续获取资源的每日优先事项列表：',
    fr: 'Voici une liste de priorités quotidiennes pour vous aider à dépenser votre {I-I/Stamina} judicieusement et à garder un flux constant de ressources sur votre compte :',
  },
  heading_dailySweep: {
    en: 'Daily Sweep',
    jp: 'デイリースイープ',
    kr: '데일리 스윕',
    zh: '每日扫荡',
    fr: 'Daily Sweep',
  },
  body_dailySweep: {
    en: 'Use the Sweep function to clear all 3 categories below in one go.',
    jp: 'スイープ機能で以下の3カテゴリをまとめてクリア。',
    kr: '스윕 기능으로 아래 3가지 카테고리를 한 번에 클리어.',
    zh: '使用扫荡功能一次性完成以下3个类别。',
    fr: "Utilisez la fonction Sweep pour clear les 3 catégories ci-dessous d'un seul coup.",
  },
  sweep_optional: {
    en: 'Optional',
    jp: 'オプション',
    kr: '선택',
    zh: '可选',
    fr: 'Optionnel',
  },
  heading_terminusIsle: {
    en: 'Terminus Isle',
    jp: 'ターミナルアイル',
    kr: '터미널 아일',
    zh: '终点岛',
    fr: 'Terminus Isle',
  },
  cost_terminusIsle: {
    en: '30 {I-I/Stamina}/day',
    jp: '30{I-I/Stamina}/日',
    kr: '30{I-I/Stamina}/일',
    zh: '30{I-I/Stamina}/天',
    fr: '30 {I-I/Stamina}/jour',
  },
  body_terminusIsle: {
    en: 'Various rewards, most notably {I-I/Effectium}, {I-I/Proof of Destiny}, {I-I/Token of Connection} and {I-I/Special Recruitment Ticket (Event)}.\nIf you bought the Terminus Isle Exploration Support Pack, you can run it twice for 20 {I-I/Stamina} each.',
    jp: '報酬多数、特に{I-I/Effectium}、{I-I/Proof of Destiny}、{I-I/Token of Connection}、{I-I/Special Recruitment Ticket (Event)}。\nテルミナス島探査応援パック購入済みの場合、20{I-I/Stamina}で2回実行可能。',
    kr: '다양한 보상, 특히 {I-I/Effectium}, {I-I/Proof of Destiny}, {I-I/Token of Connection}, {I-I/Special Recruitment Ticket (Event)}.\n멸망의 섬 탐사 지원팩 구매 시 20{I-I/Stamina}씩 2회 실행 가능.',
    zh: '奖励丰富，最重要的有{I-I/Effectium}、{I-I/Proof of Destiny}、{I-I/Token of Connection}和{I-I/Special Recruitment Ticket (Event)}。\n购买灭亡之岛探索支援包后，可以每次20{I-I/Stamina}运行两次。',
    fr: 'Récompenses variées, notamment {I-I/Effectium}, {I-I/Proof of Destiny}, {I-I/Token of Connection} et {I-I/Special Recruitment Ticket (Event)}.\nSi vous avez acheté le Terminus Isle Exploration Support Pack, vous pouvez le lancer deux fois pour 20 {I-I/Stamina} chacun.',
  },
  heading_irregularBosses: {
    en: 'Irregular Bosses',
    jp: 'イレギュラーボス',
    kr: '이레귤러 보스',
    zh: '异常Boss',
    fr: 'Irregular Bosses',
  },
  cost_irregularBosses: {
    en: '20 {I-I/Stamina}/run (Pursuit, Very Hard)',
    jp: '20{I-I/Stamina}/回（追跡・ベリーハード）',
    kr: '20{I-I/Stamina}/회 (추적, 베리 하드)',
    zh: '20{I-I/Stamina}/次（追踪·超难）',
    fr: '20 {I-I/Stamina}/run (Pursuit, Very Hard)',
  },
  body_irregularBossesCost: {
    en: 'Clear the Infiltration stage.\nFor Pursuit rewards: 50K {I-I/Gold}, {I-I/Irregular Cell Type IV}, {I-I/Epic Quality Present Selection Chest}, {I-I/Random Upgrade Stone Chest} & ~5% chance at Irregular gear.\nFarm to 8K cells/month for {I-I/Ether} pass rewards:',
    jp: '侵入ステージをクリア。\n追跡報酬：50K{I-I/Gold}、{I-I/Irregular Cell Type IV}、{I-I/Epic Quality Present Selection Chest}、{I-I/Random Upgrade Stone Chest}、約5%でイレギュラー装備。\n月8Kセルで{I-I/Ether}パス報酬:',
    kr: '침투 스테이지 클리어.\n추적 보상: 50K{I-I/Gold}, {I-I/Irregular Cell Type IV}, {I-I/Epic Quality Present Selection Chest}, {I-I/Random Upgrade Stone Chest} & ~5% 확률 이레귤러 장비.\n월 8K 셀 달성 시 {I-I/Ether} 패스 보상:',
    zh: '通关渗透关卡。\n追踪奖励：50K{I-I/Gold}、{I-I/Irregular Cell Type IV}、{I-I/Epic Quality Present Selection Chest}、{I-I/Random Upgrade Stone Chest}及约5%异常装备。\n刷至月8K细胞获{I-I/Ether}通行证奖励:',
    fr: "Clear le stage Infiltration.\nRécompenses Pursuit : 50K {I-I/Gold}, {I-I/Irregular Cell Type IV}, {I-I/Epic Quality Present Selection Chest}, {I-I/Random Upgrade Stone Chest} et ~5% de chance de drop d'Irregular gear.\nFarmez jusqu'à 8K cells/mois pour les récompenses du pass {I-I/Ether} :",
  },
  irregularGearFrom: {
    en: ' from ',
    jp: '：',
    kr: ': ',
    zh: '：来自',
    fr: ' depuis ',
  },
  heading_towerFloors: {
    en: 'Tower Floors',
    jp: '塔フロア',
    kr: '탑 층',
    zh: '塔层',
    fr: 'Étages de la Tower',
  },
  cost_towerFloors: {
    en: '500+ {I-I/Stamina}/month',
    jp: '500+{I-I/Stamina}/月',
    kr: '500+{I-I/Stamina}/월',
    zh: '500+{I-I/Stamina}/月',
    fr: '500+ {I-I/Stamina}/mois',
  },
  body_towerFloors: {
    en: 'Clear Normal floor 100 and Hard floor 7 minimum each month (all floors if possible).',
    jp: '毎月最低ノーマル100階・ハード7階クリア（可能なら全階）。',
    kr: '매월 최소 노말 100층 · 하드 7층 클리어（가능하면 전층）.',
    zh: '每月至少通关普通100层及困难7层（如可能全层通关）。',
    fr: 'Clear au minimum le Floor 100 Normal et le Floor 7 Hard chaque mois (tous les Floors si possible).',
  },
  heading_adventureLicense: {
    en: 'Adventure License',
    jp: '冒険免許',
    kr: '모험 면허',
    zh: '冒险执照',
    fr: 'Adventure License',
  },
  cost_adventureLicense: {
    en: '10 {I-I/Stamina}/attempt',
    jp: '10{I-I/Stamina}/回',
    kr: '10{I-I/Stamina}/회',
    zh: '10{I-I/Stamina}/次',
    fr: '10 {I-I/Stamina}/tentative',
  },
  body_adventureLicense: {
    en: "Clear as many bosses as you can weekly (2 attempts per boss).\n{I-I/Gold}, {I-I/License Point}, {I-I/Adventurer Chest} (can reward 15 {I-I/Stamina}) — do 1 boss/day to avoid stamina spikes at week's end.",
    jp: '毎週できるだけ多くのボスをクリア（ボスごとに2回まで）。\n{I-I/Gold}、{I-I/License Point}、{I-I/Adventurer Chest}（15{I-I/Stamina}が当たることも）。週末のスタミナ集中消費を避けるため1日1ボスずつ推奨。',
    kr: '매주 최대한 많은 보스 클리어 (보스당 2회까지).\n{I-I/Gold}, {I-I/License Point}, {I-I/Adventurer Chest} (15{I-I/Stamina} 획득 가능) — 주말 스태미나 급격 소모 방지를 위해 하루 1보스씩 추천.',
    zh: '每周尽可能多通关Boss（每个Boss 2次）。\n{I-I/Gold}、{I-I/License Point}、{I-I/Adventurer Chest}（可能获得15{I-I/Stamina}）——建议每天1Boss，避免周末体力暴消。',
    fr: 'Clear autant de bosses que possible chaque semaine (2 tentatives par boss).\n{I-I/Gold}, {I-I/License Point}, {I-I/Adventurer Chest} (peut donner 15 {I-I/Stamina}). Faites 1 boss/jour pour éviter les pics de consommation de stamina en fin de semaine.',
  },
  heading_totalBaseline: {
    en: 'Total baseline',
    jp: '基本合計',
    kr: '기본 총량',
    zh: '基础总量',
    fr: 'Total de base',
  },
  body_totalBaseline: {
    en: '510 {I-I/Stamina}/day (990 with Ecology Study) + Irregular Bosses, Tower, and Adventure License.',
    jp: '510{I-I/Stamina}/日（生態調査込みで990）＋イレギュラーボス・塔・冒険免許。',
    kr: '510{I-I/Stamina}/일 (생태 조사 포함 시 990) + 이레귤러 보스, 탑, 모험 면허.',
    zh: '510{I-I/Stamina}/天（含生态调查为990）+ 异常Boss、塔、冒险执照。',
    fr: '510 {I-I/Stamina}/jour (990 avec Ecology Study) + Irregular Bosses, Tower et Adventure License.',
  },
  notYetEndgame: {
    en: 'Not yet endgame, or need to burn more Stamina? Other suggestions:',
    jp: 'まだエンドゲーム未到達、またはスタミナを消費したい場合：',
    kr: '아직 엔드게임 미도달이거나 스태미나를 더 소비해야 한다면:',
    zh: '还未到达终局，或需要消耗更多体力？其他建议：',
    fr: 'Pas encore en endgame, ou besoin de brûler plus de Stamina ? Autres suggestions :',
  },
  heading_farmStage12: {
    en: 'Farm Stage 12 Armor Bosses',
    jp: 'ステージ12 防具ボスをファーム',
    kr: '스테이지 12 방어구 보스 파밍',
    zh: '刷第12关 防具Boss',
    fr: 'Farm les Armor Bosses Stage 12',
  },
  body_farmStage12: {
    en: ': Focus on {E/Earth}, {E/Light}, and either {E/Dark} or {E/Water}. {E/Fire} gear is less useful unless chasing specific stats. Costs 36 {I-I/Stamina} per 3 bosses.',
    jp: '：{E/Earth}、{E/Light}、{E/Dark}か{E/Water}に集中。{E/Fire}装備は特定スタット狙い以外有用性低。3体クリアで36{I-I/Stamina}消費。',
    kr: ': {E/Earth}, {E/Light}, {E/Dark} 또는 {E/Water}에 집중. {E/Fire} 장비는 특정 스탯 외엔 비효율. 보스 3개에 36{I-I/Stamina} 소모.',
    zh: '：专注于{E/Earth}、{E/Light}及{E/Dark}或{E/Water}。{E/Fire}装备除特定属性外用处不大。3个Boss消耗36{I-I/Stamina}。',
    fr: ' : Concentrez-vous sur {E/Earth}, {E/Light}, et {E/Dark} ou {E/Water}. Le gear {E/Fire} est moins utile sauf pour des stats spécifiques. Coûte 36 {I-I/Stamina} pour 3 bosses.',
  },
  heading_hardModeStoryBossesAlt: {
    en: 'Hard Mode Story Bosses',
    jp: 'ハードモード ストーリーボス',
    kr: '하드 모드 스토리 보스',
    zh: '困难模式 剧情Boss',
    fr: 'Bosses Story Hard Mode',
  },
  affectionItemsLabel: {
    en: 'Affection Items',
    jp: '好感度アイテム',
    kr: '호감도 아이템',
    zh: '好感度道具',
    fr: "objets d'Affection",
  },
  upgradeStonesLabel: {
    en: 'Upgrade Stones',
    jp: '強化石',
    kr: '강화석',
    zh: '强化石',
    fr: 'Upgrade Stones',
  },
  body_hardModeStoryAlt_prefix: {
    en: ': Great for ',
    jp: '：',
    kr: ': ',
    zh: '：非常适合获取',
    fr: ' : Excellent pour les ',
  },
  body_hardModeStoryAlt_suffix: {
    en: ', {I-I/Gems} and {I-I/Legendary Reforge Catalyst} (from 5★ red dismantle), and {I-I/Survey Points}.',
    jp: '、{I-I/Gems}、{I-I/Legendary Reforge Catalyst}（5★赤分解から）、{I-I/Survey Points}。',
    kr: ', {I-I/Gems} 및 {I-I/Legendary Reforge Catalyst}(5★ 레드 분해), {I-I/Survey Points}.',
    zh: '、{I-I/Gems}和{I-I/Legendary Reforge Catalyst}（5★红色分解）和{I-I/Survey Points}。',
    fr: ', les {I-I/Gems} et {I-I/Legendary Reforge Catalyst} (via dismantle de gear rouge 5★), et les {I-I/Survey Points}.',
  },
  avoidReceiveAll: {
    en: 'Avoid clicking "Receive All" in your mailbox',
    jp: 'メールボックスの「すべて受け取る」をクリックしないで',
    kr: '우편함에서 "모두 받기"를 클릭하지 마세요',
    zh: '避免点击邮箱中的「全部领取」',
    fr: 'Évitez de cliquer sur "Receive All" dans votre boîte mail',
  },
  body_avoidReceiveAll: {
    en: ': Stamina rewards stay for ~6 days. Let your bar regenerate naturally, then claim rewards as needed.',
    jp: '：スタミナ報酬は約6日間保持。バーを自然に回復させ、必要に応じて受け取りましょう。',
    kr: ': 스태미나 보상은 약 6일간 보관. 자연 회복 후 필요할 때 수령하세요.',
    zh: '：体力奖励保留约6天。让体力条自然恢复，需要时再领取。',
    fr: ' : Les récompenses de Stamina restent environ 6 jours. Laissez votre barre se régénérer naturellement, puis récupérez-les selon vos besoins.',
  },
  body_noteOtherDailies: {
    en: 'Note: Other dailies like Bounty Hunter are also valuable, but they use {I-I/Bounty Hunter Ticket(s)}, not {I-I/Stamina}.',
    jp: '注意：バウンティハンターなど他のデイリーも価値がありますが、{I-I/Stamina}ではなく{I-I/Bounty Hunter Ticket(s)}を使用します。',
    kr: '참고: 현상금 사냥꾼 등 다른 일일 과제도 가치 있지만, {I-I/Stamina}가 아닌 {I-I/Bounty Hunter Ticket(s)}을 사용합니다.',
    zh: '注意：赏金猎人等其他每日任务也很有价值，但使用{I-I/Bounty Hunter Ticket(s)}而非{I-I/Stamina}。',
    fr: "Note : D'autres dailies comme Bounty Hunter sont aussi intéressantes, mais elles utilisent des {I-I/Bounty Hunter Ticket(s)} et non de la {I-I/Stamina}.",
  },
} as const satisfies Record<string, LocalizedText>;

/** Repli éditorial : nom V2 de l'Irregular Queen (vide dans les tables). */
export const IRREGULAR_QUEEN_NAME: LocalizedText = {
  en: 'Irregular Queen',
  jp: 'イレギュラークイーン',
  kr: '이레귤러 퀸',
  zh: '异型怪女王',
  fr: 'Irregular Queen',
};

export interface SweepRow {
  name: LocalizedText;
  cost: LocalizedText;
  reason: LocalizedText;
}

/** Les catégories du sweep quotidien (verbatim V2). */
export const SWEEP_ROWS: SweepRow[] = [
  {
    name: {
      en: 'Special Request: Identification (Stage 13)',
      jp: '特別依頼:正体究明（Lv.13）',
      kr: '특별 의뢰 : 정체 규명 (13단계)',
      zh: '特别委托:查清身份(第13关)',
      fr: 'Special Request : Identification (Stage 13)',
    },
    cost: {
      en: '480 {I-I/Stamina}/day',
      jp: '480{I-I/Stamina}/日',
      kr: '480{I-I/Stamina}/일',
      zh: '480{I-I/Stamina}/天',
      fr: '480 {I-I/Stamina}/jour',
    },
    reason: {
      en: 'Special Gear materials ({I-I/Blue Memory Piece} & {I-I/Blue Star Mist}), {I-I/Gold}, 6★ legendary gear (transcend fodder if stats are bad)',
      jp: '特殊装備素材（{I-I/Blue Memory Piece}・{I-I/Blue Star Mist}）、{I-I/Gold}、6★伝説装備（ステータスが悪ければ超越素材）',
      kr: '특수 장비 재료（{I-I/Blue Memory Piece} & {I-I/Blue Star Mist}）, {I-I/Gold}, 6★ 전설 장비（스탯이 안 좋으면 초월 재료）',
      zh: '特殊装备材料（{I-I/Blue Memory Piece}&{I-I/Blue Star Mist}）、{I-I/Gold}、6★传说装备（属性差时用于超越材料）',
      fr: 'Matériaux Special Gear ({I-I/Blue Memory Piece} et {I-I/Blue Star Mist}), {I-I/Gold}, gear legendary 6★ (fodder de transcend si les stats sont mauvaises)',
    },
  },
  {
    name: {
      en: 'Story Hard Final Bosses',
      jp: 'ハードモード最終ボス',
      kr: '하드 모드 최종 보스',
      zh: '困难模式最终Boss',
      fr: 'Story Hard - Bosses Finaux',
    },
    cost: {
      en: '50 {I-I/Stamina}/chapter',
      jp: '50{I-I/Stamina}/章',
      kr: '50{I-I/Stamina}/챕터',
      zh: '50{I-I/Stamina}/章',
      fr: '50 {I-I/Stamina}/chapitre',
    },
    reason: {
      en: 'Main source of {I-I/Gold}, 6★ red gear, {I-I/Survey Points} & {I-I/Legendary Reforge Catalyst}',
      jp: '{I-I/Gold}・6★赤装備・{I-I/Survey Points}・{I-I/Legendary Reforge Catalyst}の主な入手先',
      kr: '{I-I/Gold}, 6★ 레드 장비, {I-I/Survey Points} & {I-I/Legendary Reforge Catalyst} 주요 수급처',
      zh: '{I-I/Gold}、6★红装、{I-I/Survey Points}和{I-I/Legendary Reforge Catalyst}的主要来源',
      fr: 'Source principale de {I-I/Gold}, gear rouge 6★, {I-I/Survey Points} et {I-I/Legendary Reforge Catalyst}',
    },
  },
];

/** Ecology Study — même sweep, optionnel (verbatim V2). */
export const SWEEP_OPTIONAL: SweepRow = {
  name: {
    en: 'Special Request: Ecology Study (Stage 13)',
    jp: '特別依頼:生態調査（Lv.13）',
    kr: '특별의뢰: 생태 조사 (13단계)',
    zh: '特别委托:生态调查(第13关)',
    fr: 'Special Request : Ecology Study (Stage 13)',
  },
  cost: {
    en: '480 {I-I/Stamina}/day',
    jp: '480{I-I/Stamina}/日',
    kr: '480{I-I/Stamina}/일',
    zh: '480{I-I/Stamina}/天',
    fr: '480 {I-I/Stamina}/jour',
  },
  reason: {
    en: 'Provides {I-I/Armor Glunite Fragment} for crafting {I-I/Armor Glunite} and 6★ legendary gear (transcend fodder if stats are bad)',
    jp: '{I-I/Armor Glunite}の精製用{I-I/Armor Glunite Fragment}と6★伝説装備（ステータスが悪ければ超越素材）',
    kr: '{I-I/Armor Glunite} 제작용 {I-I/Armor Glunite Fragment} 및 6★ 전설 장비（스탯이 안 좋으면 초월 재료）',
    zh: '提供用于合成{I-I/Armor Glunite}的{I-I/Armor Glunite Fragment}及6★传说装备（属性差时用于超越材料）',
    fr: "Fournit des {I-I/Armor Glunite Fragment} pour crafter de l'{I-I/Armor Glunite} et du gear legendary 6★ (fodder de transcend si les stats sont mauvaises)",
  },
};
