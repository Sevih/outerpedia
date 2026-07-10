/**
 * SOURCE DE VÉRITÉ des catégories de guides. Ajouter une catégorie = une entrée ici.
 *
 * Contrairement à la V2 (entrée `_categories.json` + vue custom enregistrée +
 * 10 clés de locale dans 5 fichiers), TOUT vit ici : slug, ordre, icône (sprite
 * du jeu, namespace `images/ui/guides/`), libellé et description localisés.
 * Le contenu éditorial est du `LocalizedText` inline — pas des clés i18n — car
 * il appartient à la donnée guides, pas au chrome du site.
 *
 * Les slugs sont un CONTRAT D'URL (V2) : ne jamais les renommer sans redirect.
 */
import type { LocalizedText } from '@contracts';

export interface GuideCategory {
  /** Ordre d'affichage sur la landing (croissant). */
  order: number;
  /** Sprite du jeu (collecté par le manifest d'assets sous `images/ui/guides/`). */
  icon: string;
  label: LocalizedText & { en: string };
  desc: LocalizedText & { en: string };
}

export const GUIDE_CATEGORIES = {
  'general-guides': {
    order: 1,
    icon: 'CM_EtcMenu_Side_Story',
    label: {
      en: 'General Guides',
      jp: '総合ガイド',
      kr: '일반 가이드',
      zh: '综合攻略',
      fr: 'Guides généraux',
    },
    desc: {
      en: 'Master game fundamentals: combat mechanics, character progression, equipment systems, and essential beginner tips for new players.',
      jp: 'ゲームの基礎をマスター：戦闘メカニクス、キャラクター育成、装備システム、初心者向け必須ヒント。',
      kr: '게임 기초 마스터: 전투 메커닉, 캐릭터 성장, 장비 시스템, 초보자를 위한 필수 팁.',
      zh: '掌握游戏基础机制：新玩家需知、角色养成、战斗和装备。',
      fr: "Maîtrisez les fondamentaux du jeu : mécaniques de combat, progression des personnages, systèmes d'équipement et conseils essentiels pour les nouveaux joueurs.",
    },
  },
  adventure: {
    order: 2,
    icon: 'CM_EtcMenu_Adventure',
    label: {
      en: 'Adventure',
      jp: '冒険',
      kr: '모험',
      zh: '冒险',
      fr: 'Adventure',
    },
    desc: {
      en: 'Detailed strategies to defeat challenging Adventure bosses: recommended teams, mechanics explanation, and stage tips.',
      jp: '冒険モードの強敵ボス攻略：おすすめチーム編成、メカニクス解説、ステージ攻略のヒント。',
      kr: '모험 모드의 강력한 보스를 공략하기 위한 상세 전략: 추천 팀 구성, 메커닉 설명, 스테이지 팁.',
      zh: '击败具有挑战性的主线故事模式首领的详细策略：了解推荐队伍、关卡机制和阶段提示。',
      fr: "Stratégies détaillées pour vaincre les Boss d'Adventure exigeants : équipes recommandées, explication des mécaniques et conseils par stage.",
    },
  },
  'adventure-license': {
    order: 3,
    icon: 'CM_Adventure_License',
    label: {
      en: 'Adventure License',
      jp: '冒険者ライセンス',
      kr: '모험 라이선스',
      zh: '冒险许可证',
      fr: 'Adventure License',
    },
    desc: {
      en: 'Guides for all Adventure License battles, including Promotion Fights: learn enemy mechanics, team recommendations, and strategies for every stage.',
      jp: '冒険者ライセンスの全バトル攻略（昇格戦を含む）：敵のメカニクス、推奨チーム、各ステージの攻略法を解説。',
      kr: '모험자 라이선스의 모든 전투 공략(승급전을 포함): 적 메커닉, 추천 팀, 각 스테이지별 전략을 안내합니다.',
      zh: '包含"晋升战斗"在内的冒险许可证指南——了解关卡机制、推荐队伍以及战斗策略。',
      fr: "Guides pour toutes les batailles d'Adventure License, y compris les Promotion Fights : apprenez les mécaniques ennemies, les équipes recommandées et les stratégies pour chaque stage.",
    },
  },
  'guild-raid': {
    order: 4,
    icon: 'CM_Lobby_Sub_Guild',
    label: {
      en: 'Guild Raid',
      jp: 'ギルドレイド',
      kr: '길드 레이드',
      zh: '公会突袭',
      fr: 'Guild Raid',
    },
    desc: {
      en: 'Comprehensive strategies for Guild Raids: boss mechanics, optimal team setups, and damage-maximizing tactics to achieve the highest raid scores.',
      jp: 'ギルドレイド完全攻略：ボスメカニクス、最適なチーム編成、最高スコアを狙うためのダメージ最大化戦術。',
      kr: '길드 레이드 완벽 공략: 보스 메커닉, 최적 팀 구성, 최고 점수를 위한 데미지 극대화 전술.',
      zh: '公会突袭综合策略——学习首领机制、参考最佳队伍以获得最高伤害或是最高分数。',
      fr: "Stratégies complètes pour les Guild Raid : mécaniques de Boss, configurations d'équipe optimales et tactiques pour maximiser les dégâts et atteindre les meilleurs scores de Raid.",
    },
  },
  'world-boss': {
    order: 5,
    icon: 'CM_Adventure_WorldBoss',
    label: {
      en: 'World Boss',
      jp: 'ワールドボス',
      kr: '월드 보스',
      zh: '世界Boss',
      fr: 'World Boss',
    },
    desc: {
      en: 'Comprehensive strategies to achieve SSS rank in Extreme League World Boss battles: optimal team setups, rotation timing, and damage maximization.',
      jp: 'エクストリームリーグのワールドボス戦でSSSランクを達成するための完全攻略：最適なチーム編成、スキルローテーション、ダメージ最大化。',
      kr: '익스트림 리그 월드 보스전에서 SSS 등급을 달성하기 위한 완벽 공략: 최적 팀 구성, 스킬 로테이션, 데미지 극대화.',
      zh: '在世界首领战极限联赛中实现SSS排名的综合策略：优化队伍设置、学习轮换技巧和伤害最大化策略。',
      fr: "Stratégies complètes pour atteindre le rang SSS dans les batailles World Boss en Extreme League : configurations d'équipe optimales, timing des rotations et maximisation des dégâts.",
    },
  },
  'dimensional-singularity': {
    order: 6,
    icon: 'CM_Gate_Icon_Monad',
    label: {
      en: 'Dimensional Singularity',
      jp: '次元特異点',
      kr: '차원 특이점',
      zh: '次元奇点',
      fr: 'Dimensional Singularity',
    },
    desc: {
      en: 'Daily-rotating Singularity boss guides: schedule, mechanics, ranking score targets, and Singularity Ascension gear progression.',
      jp: '日替わりで変わる特異点ボスの攻略：スケジュール、メカニクス、ランキングスコア目標、特異点昇華装備強化。',
      kr: '매일 바뀌는 특이점 보스 공략: 일정, 메커닉, 랭킹 점수 목표, 특이점 승화 장비 강화.',
      zh: '每日轮换的奇点Boss攻略：日程、机制、排名分数目标，以及奇点升华装备强化。',
      fr: "Guides quotidiens des Boss de Singularity en rotation : planning, mécaniques, objectifs de score au classement et progression de l'équipement Singularity Ascension.",
    },
  },
  'joint-challenge': {
    order: 7,
    icon: 'CM_Adventure_Cooperation',
    label: {
      en: 'Joint Challenge',
      jp: '合同チャレンジ',
      kr: '합동 챌린지',
      zh: '联合挑战',
      fr: 'Joint Challenge',
    },
    desc: {
      en: 'Score higher in Joint Challenge battles with advanced strategies: best team compositions, skill timing, and synergy tips for top rankings.',
      jp: '共同作戦で高スコアを狙うための上級攻略：最適なチーム編成、スキルタイミング、シナジー活用のコツ。',
      kr: '합동 챌린지에서 높은 점수를 얻기 위한 고급 공략: 최적 팀 구성, 스킬 타이밍, 시너지 활용 팁.',
      zh: '使用高级战略在"联合挑战"中获得更高分：获悉顶尖排名的队伍组合、技能时机安排及协同技巧。',
      fr: "Obtenez de meilleurs scores en Joint Challenge grâce à des stratégies avancées : meilleures compositions d'équipe, timing des compétences et conseils de synergie pour atteindre le sommet du classement.",
    },
  },
  'special-request': {
    order: 8,
    icon: 'CM_EtcMenu_Challenge',
    label: {
      en: 'Special Request',
      jp: '特別依頼',
      kr: '특별 의뢰',
      zh: '特别委托',
      fr: 'Special Request',
    },
    desc: {
      en: 'In-depth strategies for Special Request missions: Ecology Study and Identification. Learn boss mechanics, team synergies, and key tactics for success.',
      jp: '特別依頼ミッション徹底攻略：生態調査と正体究明。ボスメカニクス、チームシナジー、勝利のための重要戦術を解説。',
      kr: '특별 의뢰 미션 완벽 공략: 생태 조사 및 정체 규명. 보스 메커닉, 팀 시너지, 성공을 위한 핵심 전술을 소개합니다.',
      zh: '深入解析特别委托：生态调查/查清身份。 学习过关所需的首领机制、队伍配合和关键策略。',
      fr: "Stratégies approfondies pour les missions Special Request : Ecology Study et Identification. Apprenez les mécaniques de Boss, les synergies d'équipe et les tactiques clés pour réussir.",
    },
  },
  'irregular-extermination': {
    order: 9,
    icon: 'CM_Irregular_Infiltrate',
    label: {
      en: 'Irregular Extermination',
      jp: 'イレギュラー掃討',
      kr: '이레귤러 소탕',
      zh: '异形怪歼灭战',
      fr: 'Irregular Extermination',
    },
    desc: {
      en: 'Boss guides for the Irregular Extermination Project mode: learn boss patterns, recommended teams, and effective strategies for each stage.',
      jp: 'イレギュラー殲滅戦モードのボス攻略：ボスのパターン、推奨チーム、各ステージの効果的な戦略を紹介。',
      kr: '이레귤러 섬멸전 모드의 보스 공략: 보스 패턴, 추천 팀 구성, 각 스테이지별 효율적인 전략.',
      zh: '异形怪歼灭战首领攻略——了解每阶段首领的模式、推荐队伍和有效对策。',
      fr: 'Guides des Boss du mode Irregular Extermination Project : apprenez les patterns des Boss, les équipes recommandées et les stratégies efficaces pour chaque stage.',
    },
  },
  'monad-gate': {
    order: 10,
    icon: 'CM_Adventure_MonadGate',
    label: {
      en: 'Monad Gate',
      jp: 'モナドゲート',
      kr: '모나드 게이트',
      zh: '单子门',
      fr: 'Monad Gate',
    },
    desc: {
      en: 'Stage guides for Monad Gate: recommended paths, choices, and strategies to reach the true ending of the mode.',
      jp: 'モナド・ゲートのステージ攻略：真エンディングに到達するためのルート選択と戦略を紹介。',
      kr: '모나드 게이트 스테이지 공략: 진 엔딩에 도달하기 위한 경로 선택과 전략을 안내합니다.',
      zh: '单子门攻略：抵达真结局的策略、选项以及推荐路线。',
      fr: 'Guides des stages de Monad Gate : chemins recommandés, choix et stratégies pour atteindre la True Ending du mode.',
    },
  },
  'skyward-tower': {
    order: 11,
    icon: 'CT_Symbol_Automaton',
    label: {
      en: 'Skyward Tower',
      jp: '飛天の塔',
      kr: '비천의 탑',
      zh: '飞天之塔',
      fr: 'Skyward Tower',
    },
    desc: {
      en: 'Strategies for Skyward Tower and Elemental Towers: team compositions, floor mechanics, and tips.',
      jp: '飛天の塔とエレメンタルタワーの攻略：チーム編成、フロアメカニクス、攻略ヒント。',
      kr: '비천의 탑과 엘레멘탈 타워 공략: 팀 구성, 층별 메커닉, 공략 팁.',
      zh: '飞天之塔与元素之塔攻略：队伍搭配、楼层机制与攻略建议。',
      fr: "Stratégies pour Skyward Tower et Elemental Towers : compositions d'équipe, mécaniques d'étage et astuces.",
    },
  },
  other: {
    order: 12,
    icon: 'CM_EtcMenu_Azit',
    label: {
      en: 'Other Guides',
      jp: 'その他',
      kr: '기타',
      zh: '其他',
      fr: 'Autres guides',
    },
    desc: {
      en: "Guides, news, and content that doesn't fit into the other categories or is no longer up to date.",
      jp: '他のカテゴリに該当しない、または最新でなくなったガイド、ニュース、コンテンツ。',
      kr: '다른 카테고리에 해당하지 않거나 더 이상 최신이 아닌 가이드, 뉴스 및 콘텐츠.',
      zh: '不属于其他分类或已过时的攻略、新闻和内容。',
      fr: "Guides, actualités et contenus qui n'entrent dans aucune autre catégorie ou ne sont plus à jour.",
    },
  },
} as const satisfies Record<string, GuideCategory>;

/** Slug de catégorie (contrat d'URL V2). */
export type GuideCategorySlug = keyof typeof GUIDE_CATEGORIES;

/** Slugs dans l'ordre d'affichage. */
export const GUIDE_CATEGORY_SLUGS = (Object.keys(GUIDE_CATEGORIES) as GuideCategorySlug[]).sort(
  (a, b) => GUIDE_CATEGORIES[a].order - GUIDE_CATEGORIES[b].order,
);

/** Garde de type. */
export function isGuideCategory(value: string): value is GuideCategorySlug {
  return value in GUIDE_CATEGORIES;
}
