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

/**
 * Champs de `meta.json` normalement OPTIONNELS qu'une catégorie peut rendre
 * OBLIGATOIRES (sa vue en dépend). Vérifié au scan : le build casse au lieu de
 * laisser un guide disparaître d'une vue qui ne sait pas où le ranger.
 */
export type GuideRequirable =
  'tier' | 'bossId' | 'order' | 'group' | 'mapPos' | 'dungeons' | 'tower' | 'depth' | 'route';

/**
 * Bloc EXPLICATIF d'un mode de jeu (« comment ça marche »), affiché en bas de sa
 * page de catégorie. C'est de la DONNÉE, pas un composant : en V2, ce bloc était
 * une fonction `ModeInfo` non exportée, enterrée au fond du fichier de liste du
 * seul mode qui en avait un — en écrire un deuxième aurait voulu dire écrire un
 * deuxième composant. Ici, un mode qui veut le sien remplit ce champ.
 */
export interface GuideCategoryInfo {
  /** De quoi parle le mode. */
  intro: LocalizedText & { en: string };
  /** Condition de déblocage, si le mode en a une. */
  unlock?: LocalizedText & { en: string };
  /** Horaires / cadence, si le mode en a. */
  schedule?: LocalizedText & { en: string };
  /** Fonctionnalités clés (liste à puces). */
  features?: readonly (LocalizedText & { en: string })[];
}

export interface GuideCategory {
  /** Ordre d'affichage sur la landing (croissant). */
  order: number;
  /** Sprite du jeu (collecté par le manifest d'assets sous `images/ui/guides/`). */
  icon: string;
  /**
   * ART de la vue de catégorie (fond de carte d'irregular-extermination…) —
   * même namespace et même collecte que les icônes (`images/ui/guides/`).
   * Déclaré ICI pour que le manifest d'assets et la vue lisent la même source.
   */
  art?: string;
  label: LocalizedText & { en: string };
  desc: LocalizedText & { en: string };
  /** Champs de meta exigés par la vue de cette catégorie. */
  requires?: readonly GuideRequirable[];
  /**
   * La page détail TITRE SUR LE BOSS : H1 centré au nom du monstre
   * (`meta.bossId`), sous-titre « Strategy Guide », partage aligné à droite.
   * Pour les modes où un guide EST la fiche d'un boss (Special Request) — le
   * titre du meta reste celui du SEO et des cartes de liste.
   */
  bossTitle?: boolean;
  /** Bloc « comment marche ce mode » (optionnel — tous n'en ont pas besoin). */
  info?: GuideCategoryInfo;
}

/**
 * PALIERS pédagogiques de `general-guides` (ordre de lecture conseillé).
 *
 * En V2 c'était une map `TIER_BY_SLUG` écrite À LA MAIN *dans le composant
 * React* : un guide absent de la map recevait `tier: null` et disparaissait
 * SILENCIEUSEMENT de la page. Ici le palier est une DONNÉE (`tier` du meta),
 * validée au scan — un guide sans palier casse le build.
 */
export const GUIDE_TIERS = {
  'first-steps': {
    order: 1,
    label: {
      en: 'First Steps',
      jp: '最初のステップ',
      kr: '첫 걸음',
      zh: '入门',
      fr: 'Premiers pas',
    },
  },
  pulls: {
    order: 2,
    label: {
      en: 'Banners & Pulls',
      jp: 'バナー & ガチャ',
      kr: '배너 & 뽑기',
      zh: '卡池 & 抽卡',
      fr: 'Bannières & pulls',
    },
  },
  economy: {
    order: 3,
    label: {
      en: 'Resources & Daily Loop',
      jp: 'リソース & デイリー',
      kr: '자원 & 데일리 루틴',
      zh: '资源 & 日常',
      fr: 'Ressources & routine quotidienne',
    },
  },
  'heroes-gear': {
    order: 4,
    label: {
      en: 'Heroes & Gear',
      jp: 'ヒーロー & 装備',
      kr: '영웅 & 장비',
      zh: '角色 & 装备',
      fr: 'Héros & gear',
    },
  },
} as const satisfies Record<string, { order: number; label: LocalizedText & { en: string } }>;

/** Clé de palier (`tier` du meta d'un guide `general-guides`). */
export type GuideTierKey = keyof typeof GUIDE_TIERS;

/** Paliers dans l'ordre de lecture. */
export const GUIDE_TIER_KEYS = (Object.keys(GUIDE_TIERS) as GuideTierKey[]).sort(
  (a, b) => GUIDE_TIERS[a].order - GUIDE_TIERS[b].order,
);

/** Garde de type. */
export function isGuideTier(value: string): value is GuideTierKey {
  return value in GUIDE_TIERS;
}

export const GUIDE_CATEGORIES = {
  'general-guides': {
    order: 1,
    icon: 'CM_EtcMenu_Side_Story',
    /** La vue en paliers exige un `tier` sur chaque guide (validé au scan). */
    requires: ['tier'],
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
    /**
     * Le SCÉNARIO, découpé en saisons : la vue en fait une section par saison et
     * une carte par stage guidé — l'art de la zone en fond, le boss dessous
     * quand le lecteur accepte le spoiler.
     *
     * Rien de tout ça ne se devine, d'où les trois champs exigés. `dungeons` =
     * la paire [Normal, Hard] du stage (le jeu ne relie PAS les deux : ni group
     * ni difficulty sur les donjons d'histoire — cf. `GuideMeta.dungeons`), d'où
     * la vue tire la zone, le nom du stage et le badge de difficulté. `bossId` =
     * le boss du guide, révélé par le toggle spoiler. `order` = saison × 100 +
     * épisode : la SECTION dans laquelle la carte tombe, parce que la saison de
     * la donnée n'est pas celle du jeu (cf. `GuideMeta.order`).
     */
    requires: ['dungeons', 'bossId', 'order'],
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
    /**
     * Mode PERMANENT à combats désignés : `group` = le combat que le guide
     * couvre (un donjon Weekly Conquest ou Promotion Challenge, seul dans son
     * groupe — son échelle de stages vit dans ses rangs), `bossId` = le boss du
     * donjon (og:image de la page détail — la V2 n'en avait aucune).
     *
     * Pas d'`order` : le mode n'a ni saison ni calendrier qui l'ordonnerait, et
     * les licences se lisent comme une galerie. La vue trie donc sur le titre,
     * comme la V2.
     */
    requires: ['group', 'bossId'],
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
    info: {
      intro: {
        en: 'Dimensional Singularity is an endgame mode accessible from Monad Gate by switching to Dimensional Singularity Mode. A different Singularity boss is active each day from Wednesday to Saturday, and your daily score determines your ranking and rewards.',
        jp: '次元特異点はモナドゲートから「次元特異点モード」に切り替えてアクセスするエンドコンテンツです。水曜から土曜まで、毎日異なる特異点ボスが出現し、その日のスコアによってランキングと報酬が決まります。',
        kr: '차원 특이점은 모나드 게이트에서 「차원 특이점 모드」로 전환하여 접근하는 엔드 콘텐츠입니다. 수요일부터 토요일까지 매일 다른 특이점 보스가 등장하며, 일일 점수에 따라 랭킹과 보상이 결정됩니다.',
        zh: '次元奇点是从单子门切换至「次元奇点模式」进入的终局内容。每周三到周六，每天会出现不同的奇点Boss，当日分数将决定排名与奖励。',
        fr: 'Dimensional Singularity est un mode de fin de jeu accessible depuis Monad Gate en passant en Dimensional Singularity Mode. Un Boss Singularity différent est actif chaque jour du mercredi au samedi, et votre score quotidien détermine votre classement et vos récompenses.',
      },
      unlock: {
        en: 'Unlock condition: clear Monad Gate Depth 1 True Ending.',
        jp: '解放条件：モナドゲート深層1の真エンディングをクリア。',
        kr: '해금 조건: 모나드 게이트 심층 1 진 엔딩 클리어.',
        zh: '解锁条件：通关单子门深层1的真结局。',
        fr: 'Condition de déblocage : terminer la True Ending de Monad Gate Depth 1.',
      },
      schedule: {
        en: 'Open every week from Wednesday 00:00 UTC to Saturday 23:59 UTC. The target boss changes daily at 00:00 UTC. 2 entries per day.',
        jp: '毎週水曜00:00 UTCから土曜23:59 UTCまで開放。対象ボスは毎日00:00 UTCに変化。1日2回挑戦可能。',
        kr: '매주 수요일 00:00 UTC부터 토요일 23:59 UTC까지 개방. 대상 보스는 매일 00:00 UTC에 변경. 1일 2회 도전 가능.',
        zh: '每周三00:00 UTC至周六23:59 UTC开放。目标Boss每日00:00 UTC更换。每日2次挑战机会。',
        fr: 'Ouvert chaque semaine du mercredi 00:00 UTC au samedi 23:59 UTC. Le Boss cible change chaque jour à 00:00 UTC. 2 entrées par jour.',
      },
      features: [
        {
          en: 'Singularity Repel: launch the daily boss battle.',
          jp: '特異点討伐：その日のボス戦を開始する。',
          kr: '특이점 격퇴: 당일 보스전을 시작합니다.',
          zh: '奇点击退：开始当日的Boss战斗。',
          fr: 'Singularity Repel : lance le combat de Boss du jour.',
        },
        {
          en: "Singularity Ascension Device: ascend gear that has reached max Enhancement and max Reforge. Ascending boosts the gear's main stat(s) and grants 3 extra Reforge attempts; reaching Enhancement +15 then adds a random bonus stat (type depends on the slot, value is random).",
          jp: '特異点昇華装置：強化と再鍛造が最大に達した装備を昇華する。昇華により装備のメインステータスが上昇し、再鍛造回数が+3される。さらに強化+15に到達するとランダムな追加ステータスが付与される（種類は装備スロットに依存、数値はランダム）。',
          kr: '특이점 승화 장치: 강화와 재련이 최대치에 도달한 장비를 승화합니다. 승화 시 장비의 메인 스탯이 상승하고 재련 횟수가 +3되며, 강화 +15에 도달하면 추가 랜덤 스탯이 부여됩니다(종류는 장비 슬롯에 따라 다르며, 수치는 랜덤).',
          zh: '奇点升华装置：将达到最大强化和最大重铸的装备进行升华。升华会提升装备的主属性数值并获得+3次重铸机会；强化等级达到+15时还会附加一项随机额外属性（类型取决于装备槽位，数值随机）。',
          fr: "Singularity Ascension Device : fait ascensionner un équipement ayant atteint l'Enhancement max et le Reforge max. L'ascension augmente la/les stat(s) principale(s) de l'équipement et octroie 3 tentatives de Reforge supplémentaires ; atteindre Enhancement +15 ajoute alors une stat bonus aléatoire (le type dépend du slot, la valeur est aléatoire).",
        },
        {
          en: 'Ranking Report: claim daily rewards based on your score the previous day.',
          jp: 'ランキングレポート：前日のスコアに応じた日次報酬を受け取る。',
          kr: '랭킹 보고서: 전일 점수에 따른 일일 보상을 수령합니다.',
          zh: '排名报告：根据前一日分数领取每日奖励。',
          fr: 'Ranking Report : récupérez vos récompenses quotidiennes en fonction de votre score de la veille.',
        },
      ],
    },
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
    /**
     * Mode PERMANENT à combats désignés : chaque guide porte le `group` de son
     * échelle de stages dans son meta (validé au scan) — la vue de catégorie
     * en dépend pour ranger les guides par mode (Identification / Ecology
     * Study) sans table slug→élément en dur. `order` porte l'ordre ÉDITORIAL
     * des colonnes et des cartes (Identification d'abord, comme en V2 — les
     * ids de donjons du jeu mettraient Ecology en tête). `bossId` nomme la
     * carte : le nom du BOSS, pas le titre du guide (souvent générique).
     */
    requires: ['group', 'order', 'bossId'],
    /** La page détail titre sur le boss — un guide SR est la fiche d'un boss. */
    bossTitle: true,
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
    /** Fond de la vue carte : l'écran Irregular Chase du jeu (pins posés dessus). */
    art: 'T_Irregular_Chase_Bg',
    /**
     * Mode PERMANENT à combats désignés : `group` = la poursuite que le guide
     * couvre (rendu + butin en découlent), `bossId` = le nom et le portrait du
     * pin (namespace boss existant — jamais une 2e copie du sprite), `order` =
     * le GroupID du jeu (1..4), qui est aussi l'ordre croissant de difficulté,
     * `mapPos` = la position du pin sur l'art de la catégorie (visuel V2 :
     * la vue est une CARTE, pas une grille). Pas de calendrier : rien à trier
     * par saison.
     */
    requires: ['group', 'bossId', 'order', 'mapPos'],
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
    /**
     * Les PROFONDEURS et leurs routes : la vue en fait deux sections (Story 1-5,
     * Endless 6-10 avec sélecteur de profondeur) et une carte par route. `depth`
     * et `route` sont DÉCLARÉS (requis au scan) — la V2 les lisait dans le slug
     * (`depth6-route2`) ; `variants` (optionnel) porte le nombre de layouts de
     * map d'une route, à la place du `VARIANT_DEPTHS` en dur du composant V2.
     */
    requires: ['depth', 'route'],
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
    /**
     * Deux familles de tours sous une même catégorie : difficulté (Normal /
     * Hard / Very Hard) et élémentaire (Fire…Dark). Chaque guide DÉSIGNE sa tour
     * par `meta.tower` (clé de `data/generated/towers.json`, requis au scan) —
     * la vue en tire la section, l'élément et l'ordre, sans lire le slug comme
     * en V2.
     */
    requires: ['tower'],
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

/**
 * Champs de meta exigés par la vue d'une catégorie (vide par défaut).
 * Accesseur typé : `GUIDE_CATEGORIES[c].requires` est inaccessible directement,
 * le `as const` ne donnant la propriété qu'aux catégories qui la déclarent.
 */
export function categoryRequires(category: GuideCategorySlug): readonly GuideRequirable[] {
  return (GUIDE_CATEGORIES[category] as GuideCategory).requires ?? [];
}

/** Bloc « comment marche ce mode », si la catégorie en déclare un. */
export function categoryInfo(category: GuideCategorySlug): GuideCategoryInfo | undefined {
  return (GUIDE_CATEGORIES[category] as GuideCategory).info;
}

/** Art de la vue de catégorie (fond de carte), si la catégorie en déclare un. */
export function categoryArt(category: GuideCategorySlug): string | undefined {
  return (GUIDE_CATEGORIES[category] as GuideCategory).art;
}
