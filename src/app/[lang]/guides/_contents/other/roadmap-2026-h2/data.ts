/**
 * Données du guide « 2026 Roadmap — Second Half » — meeting du 14 août 2026
 * (2nd Japan Player Meetup / 제2회 일본 유저 간담회).
 *
 * Rangé comme `roadmap-2026` : des SECTIONS thématiques, pas la suite des
 * captures. L'ordre du diaporama ne survit nulle part ici — les diapos de pur
 * titre servent d'illustration à la section qu'elles annonçaient, et le tableau
 * récapitulatif de fin devient des cartes mensuelles comme dans le premier
 * guide. Aucune diapo n'est perdue au passage.
 *
 * DEUX decks du même meeting, et la règle qui en découle :
 *   - les captures affichées sont celles du deck CORÉEN, bilingue KR + EN ;
 *   - `en` et `kr` sont donc la TRANSCRIPTION de ce deck — c'est la source
 *     officielle, elle prime sur toute traduction qu'on ferait nous-mêmes ;
 *   - `jp` reste la transcription du deck japonais projeté le jour même ;
 *   - `zh` et `fr` dérivent de `en`.
 * Le deck KR corrige plusieurs lectures du deck JP : Brush-Up (et non « visual
 * rework »), New Story Areas, Steam Launch, Dimensional Singularity Phase 2,
 * Terminus Isle Overhaul, Pick-Up Improvements, Monthly Pass.
 *
 * On ne DÉCRIT jamais une capture : le lecteur l'a sous les yeux. Les fiches de
 * character design portent des annotations coréennes de l'équipe artistique
 * (« détail des yeux », « médaille »…) — elles ont été écrites ici, puis
 * retirées : c'est de la légende d'image, pas de l'information de roadmap.
 * Même règle pour l'élément et la classe, que les puces `{E/…} {C/…}` disent
 * déjà — et dont l'ABSENCE dit qu'ils n'ont pas été annoncés.
 *
 * Vocabulaire : les noms de personnages et de modes ne s'inventent pas, ils se
 * LISENT dans `data/generated/` (characters.json, unlock-content.json) —
 * Eliza/엘리제/伊莉莎, Saeran/세이란/萨伊蓝, Demiurge/데미우르고스/创世之神,
 * Terminus Isle/멸망의 섬/灭亡之岛, Mirsha Festival/메르샤 페스티벌/弥乐沙节,
 * Recruit/영입/招募, Monad Gate/모나드 게이트/单子门. Et ギフト/기프트 se dit
 * Quirk (天赋) en anglais, PAS « gift » : la diapo KR écrit 기프트, la donnée du
 * jeu dit Quirk. Deux romanisations du deck KR sont écartées au profit de la
 * donnée du jeu : « Seiran » (→ Saeran) et « Mersha Festival » (→ Mirsha
 * Festival).
 *
 * Le bloc PICK-UP fait exception à tout ça : la diapo y résumait des règles
 * que `general-guides/banner-mileage` détaille depuis les patch notes du
 * 25/08. Il reprend donc SON vocabulaire (recruits / banner / Héros en focus,
 * noms de bannières Rate Up · Limited · Premium · Dimensional Supply) et SES
 * règles — le mot à mot de la diapo se lisait de travers. Détail sur place,
 * au-dessus de `PICKUP_GROUPS`.
 */
import type { LocalizedText } from '@contracts';
import type { VideoItem } from '@/components/ui/MultiVideoEmbed';

type Text = LocalizedText & { en: string };

/** Capture de `data/editorial/guides/roadmap-2026-h2/`. */
export interface Shot {
  file: string;
  /** `alt` (EN, non localisé — description de l'image, pas son contenu). */
  alt: string;
  caption?: Text;
}

/** Tableau repris d'une diapo — les cellules peuvent contenir des `\n`. */
export interface SlideTable {
  headers: Text[];
  rows: Text[][];
}

/** Un bloc « améliorations » : son titre, sa capture, son tableau. */
export interface ImprovementBlock {
  title: Text;
  shot: Shot;
  table: SlideTable;
}

export interface MonthlyUpdate {
  month: Text;
  highlights: Text[];
  newCharacters?: Text[];
  /** Noms éditoriaux EN (persos existants — liens de fiche). */
  coreFusions?: string[];
  story?: Text[];
  content?: Text[];
}

export interface NewCharacterData {
  name: string;
  /**
   * Slugs (tags parse-text `{E/…}` / `{C/…}`). ABSENTS quand le meeting ne les
   * a pas annoncés — un perso inédit n'a ni élément ni classe tant que la
   * donnée du jeu ne les porte pas, et les inventer serait pire que se taire.
   */
  element?: string;
  classType?: string;
  accent: { border: string; bg: string; text: string };
  date: Text;
  /** Fichiers de `data/editorial/guides/roadmap-2026-h2/`. */
  images: string[];
}

export const LABELS = {
  intro: {
    en: 'Everything announced for the second half of 2026 at the 2nd Japan Player Meetup, held on August 14, 2026.',
    jp: '2026年8月14日に開催された第二回 日本ユーザー懇談会で発表された、2026年下半期の内容をまとめています。',
    kr: '2026년 8월 14일에 열린 제2회 일본 유저 간담회에서 발표된 2026년 하반기 내용을 정리했습니다.',
    zh: '对2026年8月14日举行的第二届日本玩家恳谈会上公布的2026年下半年预计更新内容的整理。',
    fr: 'Tout ce qui a été annoncé pour le second semestre 2026 lors du 2e meetup des joueurs japonais, le 14 août 2026.',
  },
  agenda: {
    en: 'Agenda',
    jp: '懇談会のアジェンダ',
    kr: '아젠다',
    zh: '公布项目',
    fr: 'Au programme de la rencontre',
  },
  newCharacters: {
    en: 'New Characters',
    jp: '新キャラクター',
    kr: '신규 캐릭터',
    zh: '新角色',
    fr: 'Nouveaux personnages',
  },
  releasePlan: {
    en: 'New Character Release Plan',
    jp: '新キャラクター 実装計画',
    kr: '신규 캐릭터 출시 계획',
    zh: '新角色实装计划',
    fr: 'Plan de sortie des nouveaux personnages',
  },
  coreFusion: {
    en: 'Core Fusion',
    jp: 'コアフュージョン',
    kr: '코어 융합',
    zh: '核心融合',
    fr: 'Core Fusion',
  },
  characterRework: {
    en: 'Brush-Up Characters',
    jp: 'キャラクターリワーク',
    kr: '브러시업 캐릭터',
    zh: '重制角色',
    fr: 'Personnages retouchés (Brush-Up)',
  },
  storyRegion: {
    en: 'New Story Areas',
    jp: '新規ストーリー地域',
    kr: '신규 스토리 지역',
    zh: '新剧情章节',
    fr: 'Nouvelles zones scénaristiques',
  },
  gameImprovements: {
    en: 'Game Improvements',
    jp: 'ゲーム改善',
    kr: '게임 개선',
    zh: '游戏方面改善',
    fr: 'Améliorations du jeu',
  },
  monthlySchedule: {
    en: 'Monthly Schedule for the 2nd Half of 2026',
    jp: '2026年 下半期 月別スケジュール',
    kr: '2026년 하반기 월별 스케줄',
    zh: '2026年下半年月度计划',
    fr: 'Calendrier mensuel du second semestre 2026',
  },
  alreadyReleased: {
    en: 'Already released',
    jp: 'リリース済み',
    kr: '출시 완료',
    zh: '已实装',
    fr: 'Déjà sorti',
  },
  labelNewCharacters: {
    en: 'Character:',
    jp: '新キャラクター:',
    kr: '캐릭터:',
    zh: '新角色:',
    fr: 'Personnages :',
  },
  labelCoreFusion: {
    en: 'Core Fusion:',
    jp: 'コアフュージョン:',
    kr: '코어 융합:',
    zh: '核心融合:',
    fr: 'Core Fusion :',
  },
  labelStory: { en: 'Story:', jp: 'ストーリー:', kr: '스토리:', zh: '剧情:', fr: 'Scénario :' },
  labelContent: {
    en: 'Content / Improvements:',
    jp: 'コンテンツ:',
    kr: '콘텐츠 / 개선:',
    zh: '内容 / 改善:',
    fr: 'Contenu / améliorations :',
  },
  /** Le ※ répété au bas de presque toutes les diapos — écrit UNE fois. */
  disclaimer: {
    en: '※ Plans and details are subject to change depending on the development schedule.',
    jp: '※ 開発日程により、計画と内容は変更される場合があります。',
    kr: '※ 개발 일정에 따라 계획과 내용은 변경될 수 있습니다.',
    zh: '※ 根据开发日程，计划内容可能变更。',
    fr: "※ Le calendrier et le contenu peuvent changer selon l'avancement du développement.",
  },
  video: {
    en: 'Watch the broadcast',
    jp: 'ロードマップ動画',
    kr: '로드맵 영상',
    zh: '路线图影片',
    fr: 'Revoir la diffusion',
  },
  promoCode: {
    en: 'Promo code from the broadcast',
    jp: '配信で公開されたクーポンコード',
    kr: '방송에서 공개된 쿠폰 코드',
    zh: '直播公布的兑换码',
    fr: 'Code promo annoncé pendant la diffusion',
  },
  source: {
    en: 'Source: OuterPlane — 2026 2nd Half Roadmap, 2nd Japan Player Meetup (August 14, 2026)',
    jp: '出典: アウタープレーン 第二回 日本ユーザー懇談会（2026年8月14日）',
    kr: '출처: 아우터플레인 2026년 하반기 로드맵, 제2회 일본 유저 간담회 (2026년 8월 14일)',
    zh: '来源: OuterPlane 2026年下半年路线图，第二届日本玩家恳谈会（2026年8月14日）',
    fr: 'Source : OuterPlane — Roadmap du second semestre 2026, 2e meetup des joueurs japonais (14 août 2026)',
  },
} as const satisfies Record<string, Text>;

/**
 * Renvois vers les deux guides voisins — tags `{L/libellé|/chemin}`, rendus par
 * parse-text. Ce ne sont pas des diapos : c'est du liant éditorial.
 */
export const SEE_FIRST_HALF: Text = {
  en: 'January to July 2026 were announced separately — see {L/2026 Roadmap — First Half|/guides/other/roadmap-2026}.',
  jp: '2026年1月〜7月は別の機会に発表されています。{L/2026年ロードマップ（前半）|/guides/other/roadmap-2026}をご覧ください。',
  kr: '2026년 1월~7월은 별도로 발표되었습니다. {L/2026 로드맵 (상반기)|/guides/other/roadmap-2026}를 참고하세요.',
  zh: '2026年1月至7月路线为另行公布，详见{L/2026路线图（上半年）|/guides/other/roadmap-2026}。',
  fr: 'Janvier à juillet 2026 ont été annoncés séparément — voir {L/Roadmap 2026 — Première moitié|/guides/other/roadmap-2026}.',
};

export const COUPONS_SEE_ALSO: Text = {
  en: 'Every active code, with its rewards and expiry: {L/Promo Codes|/coupons}.',
  jp: '有効なコードの一覧（報酬・期限つき）は{L/クーポンコード|/coupons}をご覧ください。',
  kr: '사용 가능한 코드 전체와 보상·기간은 {L/쿠폰 코드|/coupons}에서 확인하세요.',
  zh: '全部可用兑换码奖励及有效期详见{L/兑换码|/coupons}。',
  fr: 'Tous les codes actifs, avec récompenses et date limite : {L/Codes promo|/coupons}.',
};

export const PICKUP_SEE_ALSO: Text = {
  en: 'Full rules, rates and mileage for every banner: {L/Banner & Mileage|/guides/general-guides/banner-mileage}.',
  jp: '各バナーのルール・確率・マイレージの詳細は{L/バナーとマイレージ|/guides/general-guides/banner-mileage}をご覧ください。',
  kr: '각 배너의 규칙·확률·마일리지 상세는 {L/배너와 마일리지|/guides/general-guides/banner-mileage}를 참고하세요.',
  zh: '各卡池的完整规则、概率与点数详见{L/卡池与点数|/guides/general-guides/banner-mileage}。',
  fr: 'Règles, taux et mileage de chaque banner en détail : {L/Banner & Mileage|/guides/general-guides/banner-mileage}.',
};

/** Les deux visuels d'ouverture du meeting. */
export const OPENING_SHOTS: Shot[] = [
  {
    file: 'meeting-photo.webp',
    alt: 'Opening shot of the 2nd OuterPlane player meetup',
    caption: {
      en: '2nd Player Meetup',
      jp: '第二回 懇談会',
      kr: '제2회 간담회',
      zh: '第二届恳谈会',
      fr: '2e rencontre communautaire',
    },
  },
  {
    file: 'title.webp',
    alt: 'Title slide: OuterPlane 2026 2nd Half Roadmap',
    caption: {
      en: 'August 14, 2026',
      jp: '2026年8月14日',
      kr: '2026년 8월 14일',
      zh: '2026年8月14日',
      fr: '14 août 2026',
    },
  },
];

export const AGENDA_SHOT: Shot = {
  file: 'agenda.webp',
  alt: 'Agenda of the player meetup',
};

export const AGENDA: Text[] = [
  {
    en: 'New Characters',
    jp: '新キャラクター',
    kr: '신규 캐릭터',
    zh: '新角色',
    fr: 'Nouveaux personnages',
  },
  {
    en: 'New Story Areas',
    jp: '新規ストーリー地域',
    kr: '신규 스토리 지역',
    zh: '新剧情章节',
    fr: 'Nouvelles zones scénaristiques',
  },
  {
    en: 'Game Improvements',
    jp: 'ゲーム改善',
    kr: '게임 개선',
    zh: '游戏方面改善',
    fr: 'Améliorations du jeu',
  },
  {
    en: 'Monthly Schedule',
    jp: '月別スケジュール',
    kr: '월별 스케줄',
    zh: '月度计划',
    fr: 'Calendrier mensuel',
  },
];

export const RELEASE_PLAN_SHOT: Shot = {
  file: 'new-characters-plan.webp',
  alt: 'New Character Release Plan: 1 Demiurge, 1 Seasonal Limited, 4 Visual Brush-Up, 2 Standard',
};

/** Le décompte annoncé, une carte par catégorie. */
export const RELEASE_PLAN_COUNTS: Array<{ label: Text; value: number }> = [
  {
    value: 1,
    label: {
      en: 'Demiurge',
      jp: 'デミウルゴス',
      kr: '데미우르고스',
      zh: '创世之神',
      fr: 'Demiurge',
    },
  },
  {
    value: 1,
    label: {
      en: 'Seasonal Limited',
      jp: 'シーズナル限定',
      kr: '시즈널 한정',
      zh: '季节限定',
      fr: 'Limité saisonnier',
    },
  },
  {
    value: 4,
    label: {
      en: 'Visual Brush-Up',
      jp: 'ビジュアルリワーク',
      kr: '비주얼 브러시업',
      zh: '形象重制',
      fr: 'Brush-Up visuel',
    },
  },
  { value: 2, label: { en: 'Standard', jp: '通常', kr: '통상', zh: '普通', fr: 'Standard' } },
];

export const RELEASE_PLAN_GOAL: Text = {
  en: 'Targeting the reveal of 8 characters within the year.',
  jp: '年内8名のキャラクターのお披露目を目標に準備中',
  kr: '연내 8명의 캐릭터 공개를 목표로 준비 중',
  zh: '计划年内公开8名角色',
  fr: "Objectif visé : dévoiler 8 personnages d'ici la fin de l'année.",
};

/**
 * Ce qu'il faut savoir pour lire le décompte sans se tromper. La diapo annonce
 * « 8 公開 » et aligne 1+1+4+2 : les 4 Brush-Up SONT comptés dedans, alors que
 * ce sont des persos déjà en jeu. Le lecteur qui compte 8 nouveaux persos se
 * trompe — donc on le dit, la diapo ne le disait pas. La seconde puce, elle,
 * est la note de bas de diapo.
 */
export const RELEASE_PLAN_NOTES: Text[] = [
  {
    en: 'The eight break down as 1 + 1 + 4 + 2: the four Visual Brush-Ups are existing characters getting a new look, so only four of the eight are genuinely new.',
    jp: '8名の内訳は 1＋1＋4＋2 です。ビジュアルリワークの4名は既存キャラクターの見た目の刷新であり、完全な新規は4名にとどまります。',
    kr: '8명의 내역은 1＋1＋4＋2입니다. 비주얼 브러시업 4명은 기존 캐릭터의 외형 개편이므로, 실제 신규는 4명입니다.',
    zh: '8名角色构成为 1＋1＋4＋2：4名是现有角色的外观翻新，意味着真正的新角色只有4名。',
    fr: "Les huit se répartissent en 1 + 1 + 4 + 2 : les quatre Brush-Up visuels sont des personnages existants qui changent d'apparence, donc seuls quatre des huit sont réellement nouveaux.",
  },
  {
    en: 'The Core Fusion lineup is not included at this time; it will be updated once the update policy is finalized.',
    jp: 'コアフュージョンのラインナップは現在含まれておらず、アップデート方針の確定しだいアップデート予定',
    kr: '코어 융합 라인업은 현재 포함되어 있지 않으며, 업데이트 방침 확정 시 업데이트 예정',
    zh: '核心融合角色目前不包含在内，待更新方针确定后更新',
    fr: "La liste des Core Fusion n'est pas comprise dans ces chiffres : elle sera mise à jour dès que la politique de mise à jour sera arrêtée.",
  },
];

/**
 * Les personnages dont le meeting a montré la FICHE DE DESIGN. Titia n'a ni
 * élément ni classe : le meeting ne les a pas annoncés.
 */
export const NEW_CHARACTERS: NewCharacterData[] = [
  {
    name: 'Titia',
    accent: { border: 'border-sky-700/50', bg: 'bg-sky-900/20', text: 'text-sky-300' },
    date: { en: 'September 8', jp: '9月8日', kr: '9월 8일', zh: '9月8日', fr: '8 septembre' },
    images: ['titia.webp'],
  },
  {
    name: 'Core Fusion · Rin',
    element: 'water',
    classType: 'striker',
    accent: { border: 'border-blue-700/50', bg: 'bg-blue-900/20', text: 'text-blue-300' },
    date: { en: 'September 8', jp: '9月8日', kr: '9월 8일', zh: '9月8日', fr: '8 septembre' },
    images: ['cf-rin.webp'],
  },
];

/**
 * Les Core Fusion annoncés pour septembre. Eliza n'a PAS de fiche de design :
 * elle ne figure que dans la cellule « 린, 엘리제(코어 융합) » du calendrier
 * mensuel — d'où sa présence ici et nulle part ailleurs.
 */
export const CORE_FUSION_CHARS: Array<{ name: string; month: Text }> = [
  {
    name: 'Rin',
    month: { en: 'Sep 8', jp: '9月8日', kr: '9월 8일', zh: '9月8日', fr: '8 sept.' },
  },
  {
    name: 'Eliza',
    month: { en: 'September', jp: '9月', kr: '9월', zh: '9月', fr: 'Septembre' },
  },
];

export const CORE_FUSION_NOTE: Text = {
  en: 'From September 8, Core Fusion allies are changed to be treated as standard allies — a name change for the system is under review.',
  jp: '9月8日より、コアフュージョン仲間は通常の仲間として扱われます。名称の変更については検討中です。',
  kr: '9월 8일부터 코어 융합 동료를 일반 동료로 취급하도록 변경됩니다. 명칭 변경에 대해서는 검토 중입니다.',
  zh: '自9月8日起，核心融合同伴将被改为按普通同伴处理。是否变更该前缀仍在讨论中。',
  fr: "À partir du 8 septembre, les alliés Core Fusion sont traités comme des alliés ordinaires — un changement de nom du système est à l'étude.",
};

/**
 * Déjà SORTI au moment où ce guide est écrit — la seule annonce du meeting qui
 * soit du passé. Il n'a pas eu de fiche de design : il ne vient que de la
 * cellule « 데미우르고스 세이란 » du calendrier, mais il est en base (2000129),
 * donc autant renvoyer vers sa fiche. La diapo romanise « Seiran » ; le jeu
 * écrit Saeran, et c'est le jeu qui gagne.
 */
export const RELEASED: Array<{ name: string; date: Text }> = [
  {
    name: 'Demiurge Saeran',
    date: { en: 'August', jp: '8月', kr: '8월', zh: '8月', fr: 'Août' },
  },
];

export const REWORK_SHOT: Shot = {
  file: 'character-rework.webp',
  alt: 'Brush-Up Characters slide showing Eliza and Alice',
};

export const REWORK_NOTE: Text = {
  en: 'Visual brush-ups and upward balance adjustments will be carried out.',
  jp: 'ビジュアルのリワークとバランスの上方調整を行います',
  kr: '비주얼 브러시업 및 밸런스 상향 조정을 진행합니다',
  zh: '将进行形象重制与平衡上调',
  fr: "Brush-up visuel et ajustements d'équilibrage à la hausse.",
};

/** Noms éditoriaux EN + date annoncée. */
export const REWORKS: Array<{ name: string; date: Text }> = [
  {
    name: 'Eliza',
    date: { en: 'Sep 22', jp: '9月22日', kr: '9월 22일', zh: '9月22日', fr: '22 sept.' },
  },
  {
    name: 'Alice',
    date: { en: 'Dec 23', jp: '12月23日', kr: '12월 23일', zh: '12月23日', fr: '23 déc.' },
  },
];

export const STORY_SHOTS: Shot[] = [
  { file: 'section-story.webp', alt: 'Section title: New Story Areas' },
  {
    file: 'story-update-plan.webp',
    alt: 'Story Update Plan table, September to December 2026',
  },
];

export const STORY_TABLE: SlideTable = {
  headers: [
    { en: 'Area', jp: '地域', kr: '지역', zh: '地区', fr: 'Zone' },
    { en: 'Episode', jp: 'エピソード', kr: '에피소드', zh: '篇章', fr: 'Épisode' },
    {
      en: 'Scheduled Update',
      jp: 'アップデート予定',
      kr: '업데이트 예정',
      zh: '更新预定',
      fr: 'Mise à jour prévue',
    },
  ],
  rows: [
    [
      {
        en: 'Renewal Story',
        jp: 'リニューアルストーリ',
        kr: '리뉴얼 스토리',
        zh: '重制剧情',
        fr: 'Scénario remanié',
      },
      {
        en: 'EP4: Luna & Veronica Arc',
        jp: 'EP4：ルナ＆ヴェロニカ編',
        kr: 'EP4: 루나 & 베로니카 편',
        zh: 'EP4：露娜＆维罗妮卡篇',
        fr: 'EP4 : arc Luna & Veronica',
      },
      { en: 'September 8', jp: '9月8日', kr: '9월 8일', zh: '9月8日', fr: '8 septembre' },
    ],
    [
      {
        en: 'Origin Story',
        jp: 'オリジンストーリー',
        kr: '오리진 스토리',
        zh: '起源剧情',
        fr: 'Origin Story',
      },
      {
        en: 'Origin Story Season 4-3',
        jp: 'オリジンストーリーシーズン4-3',
        kr: '오리진 스토리 시즌 4-3',
        zh: '起源剧情 第4季 Ep3',
        fr: 'Origin Story saison 4-3',
      },
      { en: 'October 20', jp: '10月20日', kr: '10월 20일', zh: '10月20日', fr: '20 octobre' },
    ],
    [
      {
        en: 'Origin Story',
        jp: 'オリジンストーリー',
        kr: '오리진 스토리',
        zh: '起源剧情',
        fr: 'Origin Story',
      },
      {
        en: 'Origin Story Season 4-4',
        jp: 'オリジンストーリーシーズン4-4',
        kr: '오리진 스토리 시즌 4-4',
        zh: '起源剧情 第4季 Ep4',
        fr: 'Origin Story saison 4-4',
      },
      { en: 'November 17', jp: '11月17日', kr: '11월 17일', zh: '11月17日', fr: '17 novembre' },
    ],
    [
      {
        en: 'Origin Story',
        jp: 'オリジンストーリー',
        kr: '오리진 스토리',
        zh: '起源剧情',
        fr: 'Origin Story',
      },
      {
        en: 'Origin Story Season 4-5',
        jp: 'オリジンストーリーシーズン4-5',
        kr: '오리진 스토리 시즌 4-5',
        zh: '起源剧情 第4季 Ep5',
        fr: 'Origin Story saison 4-5',
      },
      { en: 'December 15', jp: '12月15日', kr: '12월 15일', zh: '12月15日', fr: '15 décembre' },
    ],
  ],
};

export const IMPROVEMENTS_SHOT: Shot = {
  file: 'section-improvements.webp',
  alt: 'Section title: Game Improvements',
};

/** En-têtes communs aux quatre tableaux d'améliorations. */
const IMPROVEMENT_HEADERS: Text[] = [
  { en: 'Item', jp: '項目', kr: '항목', zh: '项目', fr: 'Élément' },
  { en: 'Details', jp: '内容', kr: '세부 내용', zh: '详细内容', fr: 'Détail' },
  {
    en: 'Update (Expected) Timing',
    jp: 'アップデート（予定）時期',
    kr: '업데이트(예상) 시점',
    zh: '（预定）更新时间',
    fr: 'Mise à jour (prévue)',
  },
];

export const IMPROVEMENT_BLOCKS: ImprovementBlock[] = [
  {
    title: { en: 'August', jp: '8月', kr: '8월', zh: '8月', fr: 'Août' },
    shot: {
      file: 'improvements-august.webp',
      alt: 'Game Improvements August table',
    },
    table: {
      headers: IMPROVEMENT_HEADERS,
      rows: [
        [
          {
            en: 'Steam Launch',
            jp: 'Steam版リリース',
            kr: '스팀 런칭',
            zh: 'Steam版发布',
            fr: 'Lancement Steam',
          },
          {
            en: 'Service begins on Steam.\nYou can enjoy the game even more comfortably on PC.',
            jp: 'Steamでのサービスを開始。\nPCでもより快適にお楽しみいただけます。',
            kr: '스팀에서 서비스를 시작합니다.\nPC에서도 더욱 편하게 즐기실 수 있습니다.',
            zh: '开始在Steam上运营。\nPC端也能更舒适地游玩。',
            fr: 'Ouverture du service sur Steam.\nUne expérience plus confortable sur PC également.',
          },
          {
            en: 'Late August (planned)',
            jp: '8月末予定',
            kr: '8월 말 예정',
            zh: '预计8月底',
            fr: 'Fin août (prévu)',
          },
        ],
        [
          {
            en: 'Story Renewal',
            jp: 'ストーリーリニューアル',
            kr: '스토리 리뉴얼',
            zh: '剧情重制',
            fr: 'Refonte du scénario',
          },
          {
            en: 'Area-transition effect added to the Adventure screen\nArea buttons improved to show Ex Stage clear status and number of stars earned\nEx Stage icon design changed to improve visibility\nGuide Quests added to Story (Hard) / Origin (Hard)',
            jp: '冒険画面に地域の切替演出を追加\n地域ボタン内で、EXステージのクリア状況および★の獲得数を確認できるよう改善\nEXステージのアイコンデザインを変更し、視認性を向上\nストーリー(ハード)／オリジン(ハード)にガイドクエストを追加',
            kr: '모험 화면에 지역 전환 연출 추가\n지역 버튼 내에서 Ex 스테이지 클리어 여부 및 별 획득 개수를 확인할 수 있도록 개선\nEx 스테이지 아이콘 디자인을 변경하여 시인성 개선\n스토리(하드) / 오리진(하드)에 가이드 퀘스트 추가',
            zh: '在冒险界面加入章节切换演出\n章节按钮内可确认Ex关卡的通关情况与获得星数\n变更Ex关卡图标设计，提升其辨识度\n为剧情(困难) / 起源(困难)加入教学任务',
            fr: "Ajout d'un effet de transition de zone sur l'écran Aventure\nLes boutons de zone affichent désormais l'état de complétion des Ex Stages et le nombre d'étoiles obtenues\nIcônes des Ex Stages redessinées pour une meilleure lisibilité\nGuide Quests ajoutées à Story (Hard) / Origin (Hard)",
          },
          { en: 'August 11', jp: '8月11日', kr: '8월 11일', zh: '8月11日', fr: '11 août' },
        ],
        [
          {
            en: 'Dimensional Singularity – Phase 2',
            jp: '次元特異点 — 第2次',
            kr: '차원 특이점 - 2차',
            zh: '次元奇点 — 第2阶段',
            fr: 'Dimensional Singularity – phase 2',
          },
          {
            en: 'Singularity activation and enhancement can now be done together on the enhancement screen\n“Practice Mode” added so you can test repeatedly at no cost\nWhen rerolling Singularity options, a feature to compare before / after options and choose whether to apply is added\nDescriptions of how certain options apply are made easier to understand',
            jp: '特異点の活性化と強化を、強化画面でまとめて行えるよう改善\n気軽に何度でもテストできる「練習モード」を追加\n特異点オプションの再抽選(振り直し)時、変更前と変更後のオプションを比較して適用するかを選択できる機能を追加\n一部オプションの適用方式に関する説明を、より分かりやすく改善',
            kr: '특이점 활성화와 강화를 강화 화면에서 한 번에 진행할 수 있도록 개선\n부담 없이 여러 번 테스트할 수 있는 「연습 모드」 추가\n특이점 옵션 리롤 시, 변경 전 / 변경 후 옵션을 비교하여 적용 여부를 선택할 수 있는 기능 추가\n일부 옵션의 적용 방식에 대한 설명을 보다 알기 쉽게 개선',
            zh: '奇点激活与强化可在强化界面一次完成\n新增可无负担反复测试的「练习模式」\n重抽奇点选项时新增对比变更前 / 变更后选项并选择的功能\n改善部分选项作用的说明，使其更易理解',
            fr: "L'activation et l'amélioration des singularités se font désormais en une fois depuis l'écran d'amélioration\nAjout d'un « mode entraînement » permettant de tester autant de fois qu'on veut, sans coût\nLors d'un reroll des options de singularité, ajout d'une comparaison avant / après pour décider de les appliquer\nExplications plus claires sur le mode d'application de certaines options",
          },
          { en: 'August 25', jp: '8月25日', kr: '8월 25일', zh: '8月25日', fr: '25 août' },
        ],
        [
          {
            en: 'Terminus Isle Overhaul',
            jp: 'テルミナス島 改編',
            kr: '멸망의 섬 개편',
            zh: '灭亡之岛 改版',
            fr: 'Refonte de Terminus Isle',
          },
          {
            en: 'Guaranteed weather conversion is usable without a Monthly Pass purchase\nExploration wait time removed: results viewable as soon as the team is set\nStage balance adjusted: weather penalties / formation bonuses tuned per stage to remove disadvantages at lower stages, plus first-clear rewards per stage\nSweep All for exploration: check all available explorations and claim rewards at once\nTime to fully grow a Quirk shortened to roughly 30–40% of the current duration',
            jp: '気象の確定変更を、月額購入なしで利用できるよう改善\n探索時間を撤廃：編成と同時に確認できるよう改善\n段階別のバランス調整：気象ペナルティ／編成ボーナスを段階ごとに調整し、低い段階での不利を解消、段階の初回クリア報酬を適用\n探索の一括スキップ：確認できる探索をまとめて確認し、報酬を受け取れる機能\nギフト成長の完了までの時間を短縮：従来比 約30〜40%の水準まで引き下げ',
            kr: '날씨 확정 변환 기능을 월정액 구매 없이 사용할 수 있도록 개선\n탐사 시간 제거: 편성과 동시에 확인 가능하도록 개선\n단계별 밸런스 조정: 기상 페널티 / 편성 보너스를 단계별로 조정하여 낮은 단계에서의 불합리함을 해소, 단계 최초 클리어 보상 적용\n탐사 일괄 소탕: 확인 가능한 탐사를 한 번에 확인하고 보상을 수령할 수 있는 기능\n기프트 성장 완료까지의 시간 단축: 기존 대비 약 30~40% 수준으로 하향',
            zh: '天气变更无需月卡\n取消探索等待时间，编队即完成\n分阶段平衡调整：逐阶段调整天气惩罚及编队加成，消除低阶段的不合理之处，并加入各阶段首次通关奖励\n一键扫荡：可一次性完成所有可确认的探索并领取奖励\n天赋成长完成所需时间缩短：降至原先约30~40%的水平',
            fr: "Le changement de météo garanti s'utilise désormais sans achat du Monthly Pass\nSuppression du temps d'attente d'exploration : le résultat se consulte dès la composition établie\nÉquilibrage par palier : pénalités météo et bonus de composition ajustés palier par palier pour supprimer le désavantage aux paliers bas, et récompenses de première victoire par palier\nSweep All des explorations : tout consulter d'un coup et récupérer les récompenses\nDurée de croissance complète d'un Quirk réduite à environ 30–40 % de la durée actuelle",
          },
          { en: 'August 25', jp: '8月25日', kr: '8월 25일', zh: '8月25日', fr: '25 août' },
        ],
      ],
    },
  },
  {
    title: { en: 'September', jp: '9月', kr: '9월', zh: '9月', fr: 'Septembre' },
    shot: {
      file: 'improvements-september.webp',
      alt: 'Game Improvements September table',
    },
    table: {
      headers: IMPROVEMENT_HEADERS,
      rows: [
        [
          {
            en: 'Core Fusion',
            jp: 'コアフュージョン',
            kr: '코어 융합',
            zh: '核心融合',
            fr: 'Core Fusion',
          },
          {
            en: 'Core Fusion allies changed to be treated as standard allies\n– A name change is under review',
            jp: 'コアフュージョン仲間を、通常の仲間として扱うよう変更\n— 名称の変更については検討中',
            kr: '코어 융합 동료를 일반 동료로 취급하도록 변경\n– 명칭 변경에 대해서는 검토 중',
            zh: '将核心融合同伴改为按普通同伴处理\n– 前缀名是否变更仍在讨论中',
            fr: "Les alliés Core Fusion seront traités comme des alliés ordinaires\n– Un changement de nom est à l'étude",
          },
          { en: 'September 8', jp: '9月8日', kr: '9월 8일', zh: '9月8日', fr: '8 septembre' },
        ],
        [
          {
            en: 'Early-Game Gear Reward Rework',
            jp: '序盤の装備報酬 改編',
            kr: '초반부 장비 보상 개편',
            zh: '前期装备奖励 改版',
            fr: "Refonte des récompenses d'équipement du début de partie",
          },
          {
            en: 'Based on new players, the Gear rewards that drive early growth and convenience will have their grade / star rating reviewed\nGuide Quest / Mirsha Festival / Special Request Mission / new-player attendance · missions and more: reviewing and raising the level of obtainable Gear',
            jp: '新規プレイヤーを基準に、序盤の成長とプレイの利便性を担う装備報酬のレアリティ／星ランクを再点検\nガイドクエスト／メルシャフェスティバル／特別依頼ミッション／新規プレイヤーのログイン・ミッションなどで獲得できる装備水準の引き上げを検討し、対応',
            kr: '신규 플레이어를 기준으로, 초반 성장과 플레이 편의를 담당하는 장비 보상의 등급 / 성급 재점검\n가이드 퀘스트 / 메르샤 페스티벌 / 특별 의뢰 미션 / 신규 플레이어 출석 · 미션 등에서 획득 가능한 장비 수준의 상향을 검토하여 처리',
            zh: '以新玩家为基准，重新审视承担前期成长与游玩便利性的装备奖励的等级 / 星级\n正在商讨教学任务 / 弥乐沙节 / 特别委托任务 / 新玩家签到、任务等可获得的装备的水准并予以提升',
            fr: "En prenant les nouveaux joueurs comme référence, la qualité et le rang d'étoiles des récompenses de Gear qui portent la progression du début de partie sont réexaminés\nGuide Quests / Mirsha Festival / missions de Special Request / connexion et missions des nouveaux joueurs, etc. : le niveau de Gear obtenu y sera relevé après examen",
          },
          { en: 'September 22', jp: '9月22日', kr: '9월 22일', zh: '9月22日', fr: '22 septembre' },
        ],
      ],
    },
  },
  {
    title: {
      en: 'Content Closures · Goals for the Year',
      jp: 'コンテンツ終了・年内目標',
      kr: '콘텐츠 종료 · 연내 목표',
      zh: '内容终止 · 年内目标',
      fr: "Fermetures de contenu · objectifs de fin d'année",
    },
    shot: {
      file: 'improvements-content-closures.webp',
      alt: 'Game Improvements Content Closures and goals for the year table',
    },
    table: {
      headers: IMPROVEMENT_HEADERS,
      rows: [
        [
          {
            en: 'Monad Gate Closure',
            jp: 'モナドゲート 終了',
            kr: '모나드 게이트 종료',
            zh: '单子门关闭',
            fr: 'Fermeture de Monad Gate',
          },
          {
            en: 'Content closure processing\nRewards migrated due to closure',
            jp: 'コンテンツ終了の処理\n終了に伴う報酬の移管処理',
            kr: '콘텐츠 종료 처리\n종료에 따른 보상 이관 처리',
            zh: '终止\n奖励将移至别处',
            fr: 'Fermeture du contenu\nTransfert des récompenses liées à la fermeture',
          },
          { en: 'September 22', jp: '9月22日', kr: '9월 22일', zh: '9月22日', fr: '22 septembre' },
        ],
        [
          {
            en: 'Adventure License Closure',
            jp: '冒険者ライセンス 終了',
            kr: '모험 라이선스 종료',
            zh: '冒险执照 关闭',
            fr: "Fermeture de l'Adventure License",
          },
          {
            en: 'Content closure processing\nRewards migrated due to closure',
            jp: 'コンテンツ終了の処理\n終了に伴う報酬の移管処理',
            kr: '콘텐츠 종료 처리\n종료에 따른 보상 이관 처리',
            zh: '终止\n奖励移至别处',
            fr: 'Fermeture du contenu\nTransfert des récompenses liées à la fermeture',
          },
          { en: 'October 6', jp: '10月6日', kr: '10월 6일', zh: '10月6日', fr: '6 octobre' },
        ],
        [
          {
            en: 'Guild Security Area',
            jp: 'ギルド警備エリア',
            kr: '길드 경비 구역',
            zh: '公会警备区域',
            fr: 'Guild Security Area',
          },
          {
            en: 'Sweep function unlocked upon reaching the highest rank\nWhen Sweep is available, handled together with the guild buff bubble (Lobby)',
            jp: '最高ランク到達時に掃討機能を開放\n掃討が可能な場合、ギルドバフのバブルとまとめて処理（ロビー）',
            kr: '최고 랭크 도달 시, 소탕 기능 오픈\n소탕이 가능한 경우, 길드 버프 버블과 함께 처리 (로비)',
            zh: '达到最高等级时开放扫荡功能\n将与大厅公会增益气泡同时进行',
            fr: 'Fonction Sweep débloquée en atteignant le rang maximal\nQuand le Sweep est disponible, il est traité avec la bulle de buff de guilde (lobby)',
          },
          { en: 'October 6', jp: '10月6日', kr: '10월 6일', zh: '10月6日', fr: '6 octobre' },
        ],
      ],
    },
  },
  {
    title: {
      en: 'Under Review',
      jp: '検討中',
      kr: '검토 중',
      zh: '讨论中',
      fr: "À l'étude",
    },
    shot: {
      file: 'improvements-under-review.webp',
      alt: 'Game Improvements Under Review table',
    },
    table: {
      headers: IMPROVEMENT_HEADERS,
      rows: [
        [
          {
            en: 'Recruit Improvements',
            jp: 'スカウト改善',
            kr: '영입 개선',
            zh: '招募池改善',
            fr: 'Améliorations du Recruit',
          },
          {
            en: 'Male characters removed from the Recruit pool\nCurrent 1-star – 2-star characters: granted as Pieces in the story dungeon where they first appear\nMaxwell / Leo: kept as is, or granted in a similar manner to the above',
            jp: '男性キャラクターをスカウトプールから除外\n現在の★1〜★2キャラクター：初登場のストーリーダンジョンでピースを支給\nマクスウェル／レオ：現状を維持、または上記と同様の方法で支給',
            kr: '남성 캐릭터를 영입 풀에서 제외\n현재의 ★1 ~ ★2 캐릭터 : 첫 등장 스토리 던전에서 조각으로 지급\n맥스웰 / 레오 : 현상 유지, 또는 위와 유사한 방법으로 지급',
            zh: '将男性角色从招募池中移除\n现有★1 ~ ★2角色：在其首次登场的剧情发放碎片\n麦克斯威尔 / 雷欧：维持现状或以与上述相似的方式发放',
            fr: 'Retrait des personnages masculins du pool de Recruit\nPersonnages ★1–★2 actuels : distribués sous forme de Pieces dans le donjon scénaristique où ils apparaissent pour la première fois\nMaxwell / Leo : statu quo, ou distribution selon une méthode similaire',
          },
          {
            en: 'August 25 (planned)',
            jp: '8月25日予定',
            kr: '8월 25일 예정',
            zh: '预计8月25日',
            fr: '25 août (prévu)',
          },
        ],
      ],
    },
  },
];

export const PICKUP_SHOT: Shot = {
  file: 'pickup-improvements.webp',
  alt: 'Pick-Up Improvements slide, coming on August 25',
};

export const PICKUP_TITLE: Text = {
  en: 'Pick-Up Improvements (August 25)',
  jp: 'ピックアップ改善（8月25日）',
  kr: '픽업 개선 (8월 25일)',
  zh: 'PICKUP改善（8月25日）',
  fr: 'Améliorations des Pick-Up (25 août)',
};

export const PICKUP_INTRO: Text = {
  en: 'The basic Recruit rules and rates remain unchanged; the following elements are added.',
  jp: '基本のスカウトルールと確率は従来どおりのまま、以下の要素を追加します。',
  kr: '기본 영입 룰과 확률은 기존과 동일하게 유지하되, 아래 요소를 추가합니다.',
  zh: '基本招募规则与概率维持不变，追加以下内容。',
  fr: "Les règles et les taux de Recruit de base ne changent pas ; les éléments suivants viennent s'y ajouter.",
};

/**
 * Les trois blocs ■ de la diapo — SEUL endroit du guide qui n'est pas une
 * transcription. La diapo résume ; le détail exact vit dans le guide
 * `banner-mileage`, écrit depuis les patch notes du 25/08. On reprend donc SON
 * vocabulaire (recruits / banner / Héros en focus, et les noms de bannières :
 * Rate Up, Limited, Premium, Dimensional Supply) plutôt que le mot à mot de la
 * diapo, qui se lisait de travers :
 *   - « A "Guaranteed Recruit" count is granted for the first 2 instances » ne
 *     veut pas dire « les 2 premières bannières ont un compteur », mais « la
 *     garantie se déclenche 2 fois au plus SUR une même bannière » ;
 *   - la garantie Demiurge se compte par HÉROS, pas par bannière : 50 tirages
 *     sur X, on bascule sur Y qui démarre à 0, on revient sur X et on reprend
 *     à 50.
 * La diapo appelle le troisième bloc « Gear Gacha Improvements » : c'est la
 * bannière que le jeu nomme Dimensional Supply, et c'est ce nom qu'on garde.
 */
export const PICKUP_GROUPS: Array<{ heading: Text; lines: Text[] }> = [
  {
    heading: {
      en: 'Rate Up and Limited banners',
      jp: 'ピックアップ募集・限定募集',
      kr: '픽업 · 시즈널 한정 · 페스 한정 영입',
      zh: '概率提升招募・限定招募',
      fr: 'Rate Up Banner et Limited Banner',
    },
    lines: [
      {
        en: 'Covers Rate Up, Seasonal Limited and Festival Limited banners.',
        jp: '対象はピックアップ募集、シーズナル限定、フェス限定です。',
        kr: '대상은 픽업, 시즈널 한정, 페스 한정입니다.',
        zh: '适用于概率提升招募、季节限定与庆典限定。',
        fr: 'Concerne les banners Rate Up, Seasonal Limited et Festival Limited.',
      },
      {
        en: 'The featured hero is guaranteed within 100 recruits, twice at most per banner.',
        jp: 'ピックアップヒーローは100回の募集以内に確定します。1つのバナーにつき最大2回までです。',
        kr: '픽업 영웅은 100회 영입 이내에 확정됩니다. 배너당 최대 2회까지입니다.',
        zh: '在100次招募以内必定获得当期同伴，每个卡池最多2次。',
        fr: 'Le Héros en focus est garanti en 100 Recruits maximum, deux fois au plus par banner.',
      },
      {
        en: 'Progress is tracked per banner and never shared between them.',
        jp: '進行度はバナーごとに管理され、他のバナーとは共有されません。',
        kr: '진행도는 배너별로 관리되며 다른 배너와 공유되지 않습니다.',
        zh: '进度按卡池分别记录，不同卡池之间不共享。',
        fr: 'La progression est suivie banner par banner et ne se partage jamais entre elles.',
      },
      {
        en: 'Guarantees used and progress reset when the banner ends.',
        jp: '使用した確定回数と進行度は、バナー終了時にリセットされます。',
        kr: '사용한 확정 횟수와 진행도는 배너 종료 시 초기화됩니다.',
        zh: '已使用的保底次数和进度在卡池结束时重置。',
        fr: 'Garanties utilisées et progression sont remises à zéro à la fin de la banner.',
      },
    ],
  },
  {
    heading: {
      en: 'Premium Banner (Demiurge)',
      jp: 'プレミアム募集（デミウルゴス）',
      kr: '프리미엄 영입 (데미우르고스)',
      zh: '创世之神招募',
      fr: 'Premium Banner (Demiurge)',
    },
    lines: [
      {
        en: 'The selected Demiurge hero is guaranteed within 100 recruits, once per Demiurge hero.',
        jp: '選択中のデミウルゴスヒーローは100回の募集以内に確定し、ヒーロー1体につき1回までです。',
        kr: '선택한 데미우르고스 영웅은 100회 영입 이내에 확정되며, 영웅 1명당 1회까지입니다.',
        zh: '在100次招募以内必定获得所选创世之神同伴。每名限1次。',
        fr: 'Le Héros Demiurge sélectionné est garanti en 100 Recruits maximum, une fois par Héros Demiurge.',
      },
      {
        en: 'Progress is tracked per hero and switching your selection resets nothing: 50 recruits on one, switch to another and it starts at 0 — come back to the first and you resume at 50.',
        jp: '進行度はヒーローごとに記録され、選択を変えてもリセットされません。1体に50回使ってから別の1体に切り替えると、後者は0から始まり、元の1体に戻れば50回から再開します。',
        kr: '진행도는 영웅별로 기록되며 선택을 바꿔도 초기화되지 않습니다. 한 명에게 50회를 쓴 뒤 다른 영웅으로 바꾸면 그쪽은 0부터 시작하고, 원래 영웅으로 돌아오면 50회부터 이어집니다.',
        zh: '进度按同伴分别记录，更换所选同伴不会重置：对某位抽50次后换成另一位，后者从0开始；换回原来那位则从50次继续。',
        fr: "La progression est suivie par Héros et changer de sélection ne remet rien à zéro : 50 Recruits sur l'un, on passe à un autre qui démarre à 0 — on revient au premier et on reprend à 50.",
      },
    ],
  },
  {
    heading: {
      en: 'Dimensional Supply',
      jp: '次元物資召喚',
      kr: '차원 물자 호출',
      zh: '次元物资召唤',
      fr: 'Dimensional Supply',
    },
    lines: [
      {
        en: 'The banner that recruits gear instead of heroes.',
        jp: 'ヒーローではなく装備を引くバナーです。',
        kr: '영웅이 아니라 장비를 뽑는 배너입니다.',
        zh: '装备池。',
        fr: "La banner qui recrute de l'équipement et non des Héros.",
      },
      {
        en: 'Monthly acquisition opportunities adjusted for the highest-value Gear.',
        jp: '最も価値の高い装備について、月間の獲得機会を調整',
        kr: '가장 가치가 높은 장비에 대해, 월별 획득 기회를 조정',
        zh: '针对价值最高的装备，调整每月的获取机会',
        fr: "Les occasions d'obtention mensuelles sont ajustées pour le Gear de plus grande valeur.",
      },
    ],
  },
];

/** La rediffusion du meeting, en clôture du guide. */
export const ROADMAP_VIDEO: VideoItem = {
  platform: 'youtube',
  id: 'cGhwBndgA2w',
  title: 'OuterPlane — 2026 2nd Half Roadmap',
};

/**
 * Le code distribué pendant le live. On ne stocke QUE le code : récompenses,
 * validité et statut (actif / expiré) sont résolus depuis `coupons.json` à
 * l'affichage — un code en dur dans un guide se périme en silence.
 */
export const LIVE_COUPON_CODE = 'OPLIVE08';

/** Pourquoi les cartes vont plus loin que la capture. */
export const SCHEDULE_NOTE: Text = {
  en: 'The slide itself only covers August and September. October to December are compiled here from the Story Update Plan and Content Closures slides — nothing is inferred.',
  jp: 'このスライド自体は8月と9月までです。10月〜12月は、ストーリーアップデート計画とコンテンツ終了のスライドから再構成しています（推測は含みません）。',
  kr: '해당 슬라이드는 8월과 9월까지만 다룹니다. 10월~12월은 스토리 업데이트 계획과 콘텐츠 종료 슬라이드를 바탕으로 정리한 것이며, 추측은 포함되지 않았습니다.',
  zh: '该组幻灯片本身只涵盖8月与9月的内容。10月至12月是依据"剧情更新计划"与"内容终止"两张幻灯片整理而成，未作任何推测。',
  fr: "La diapo elle-même s'arrête à septembre. Octobre à décembre sont recomposés ici depuis les diapos du plan scénaristique et des fermetures de contenu — rien n'y est déduit.",
};

export const SCHEDULE_SHOT: Shot = {
  file: 'monthly-schedule.webp',
  alt: 'Monthly Schedule table for the 2nd half of 2026',
};

/**
 * Août et septembre viennent de la diapo « Monthly Schedule », qui S'ARRÊTE là.
 * Octobre à décembre sont RECOMPOSÉS à partir des deux autres diapos qui
 * datent des sorties — « Story Update Plan » et « Content Closures » — plus la
 * date de Brush-Up d'Alice (23/12) de la diapo Brush-Up. Rien n'y est déduit :
 * chaque ligne est annoncée quelque part dans le meeting. `SCHEDULE_NOTE` le
 * dit au lecteur, parce que la capture juste au-dessus, elle, ne montre que
 * deux mois. Même raison pour la fermeture de Monad Gate ajoutée à septembre.
 */
export const MONTHLY_UPDATES: MonthlyUpdate[] = [
  {
    month: { en: 'August', jp: '8月', kr: '8월', zh: '8月', fr: 'Août' },
    highlights: [
      {
        en: 'Steam Launch',
        jp: 'Steam版リリース',
        kr: '스팀 런칭',
        zh: 'Steam版发布',
        fr: 'Lancement Steam',
      },
    ],
    newCharacters: [
      {
        en: 'Demiurge Saeran',
        jp: 'デミウルゴス セイラン',
        kr: '데미우르고스 세이란',
        zh: '创世之神 萨伊蓝',
        fr: 'Demiurge Saeran',
      },
    ],
    content: [
      {
        en: 'Steam Launch',
        jp: 'Steam版リリース',
        kr: '스팀 런칭',
        zh: 'Steam版发布',
        fr: 'Lancement Steam',
      },
      {
        en: 'Dimensional Singularity Improvements',
        jp: '次元特異点改善',
        kr: '차원 특이점 개선',
        zh: '次元奇点改进',
        fr: 'Améliorations Dimensional Singularity',
      },
      {
        en: 'Terminus Isle Overhaul',
        jp: 'テルミナス島改編',
        kr: '멸망의 섬 개편',
        zh: '灭亡之岛改版',
        fr: 'Refonte de Terminus Isle',
      },
      {
        en: 'Story Renewal',
        jp: 'ストーリーリニューアル',
        kr: '스토리 리뉴얼',
        zh: '剧情重制',
        fr: 'Refonte du scénario',
      },
      {
        en: 'Recruit Improvements',
        jp: 'スカウト改善',
        kr: '영입 개선',
        zh: '招募改进',
        fr: 'Améliorations du Recruit',
      },
    ],
  },
  {
    month: { en: 'September', jp: '9月', kr: '9월', zh: '9月', fr: 'Septembre' },
    highlights: [
      {
        en: 'Luna & Veronica arc concludes',
        jp: 'ルナ＆ヴェロニカ編 完結',
        kr: '루나 & 베로니카 편 완결',
        zh: '露娜＆维罗妮卡篇 完结',
        fr: 'Fin de l’arc Luna & Veronica',
      },
    ],
    newCharacters: [
      { en: 'Titia', jp: 'ティティア', kr: '티티아', zh: '蒂蒂亚', fr: 'Titia' },
      {
        en: 'Eliza (Rework)',
        jp: 'エリーゼ（リワーク）',
        kr: '엘리제(리워크)',
        zh: '伊莉莎（重制）',
        fr: 'Eliza (refonte)',
      },
    ],
    coreFusions: ['Rin', 'Eliza'],
    story: [
      { en: 'Area 4', jp: '地域 4', kr: '지역 4', zh: 'Ep4', fr: 'Zone 4' },
      {
        en: 'Luna & Veronica arc concludes',
        jp: 'ルナ＆ヴェロニカ編 完結',
        kr: '루나 & 베로니카 편 완결',
        zh: '露娜＆维罗妮卡篇 完结',
        fr: 'Arc Luna & Veronica — conclusion',
      },
    ],
    content: [
      {
        en: 'Core Fusion Rework',
        jp: 'コアフュージョン改編',
        kr: '코어 융합 개편',
        zh: '核心融合改版',
        fr: 'Refonte de Core Fusion',
      },
      {
        en: 'Early-Game Gear Reward Rework',
        jp: '序盤の装備報酬 改編',
        kr: '초반부 장비 보상 개편',
        zh: '前期装备奖励改版',
        fr: "Refonte des récompenses d'équipement du début de partie",
      },
      {
        en: 'Monad Gate Closure',
        jp: 'モナドゲート終了',
        kr: '모나드 게이트 종료',
        zh: '单子门关闭',
        fr: 'Fermeture de Monad Gate',
      },
    ],
  },
  {
    month: { en: 'October', jp: '10月', kr: '10월', zh: '10月', fr: 'Octobre' },
    highlights: [],
    story: [
      {
        en: 'Origin Story Season 4-3',
        jp: 'オリジンストーリーシーズン4-3',
        kr: '오리진 스토리 시즌 4-3',
        zh: '起源剧情 第4季 Ep3',
        fr: 'Origin Story saison 4-3',
      },
    ],
    content: [
      {
        en: 'Adventure License Closure',
        jp: '冒険者ライセンス終了',
        kr: '모험 라이선스 종료',
        zh: '冒险家执照终止',
        fr: "Fermeture de l'Adventure License",
      },
      {
        en: 'Guild Security Area: Sweep at max rank',
        jp: 'ギルド警備エリア：最高ランクで掃討',
        kr: '길드 경비 구역: 최고 랭크 시 소탕',
        zh: '公会警备区域可扫荡',
        fr: 'Guild Security Area : Sweep au rang max',
      },
    ],
  },
  {
    month: { en: 'November', jp: '11月', kr: '11월', zh: '11月', fr: 'Novembre' },
    highlights: [],
    story: [
      {
        en: 'Origin Story Season 4-4',
        jp: 'オリジンストーリーシーズン4-4',
        kr: '오리진 스토리 시즌 4-4',
        zh: '起源剧情 第4季 Ep4',
        fr: 'Origin Story saison 4-4',
      },
    ],
  },
  {
    month: { en: 'December', jp: '12月', kr: '12월', zh: '12月', fr: 'Décembre' },
    highlights: [],
    newCharacters: [
      {
        en: 'Alice (Brush-Up)',
        jp: 'アリス（リワーク）',
        kr: '앨리스(브러시업)',
        zh: '爱丽丝（形象重制）',
        fr: 'Alice (Brush-Up)',
      },
    ],
    story: [
      {
        en: 'Origin Story Season 4-5',
        jp: 'オリジンストーリーシーズン4-5',
        kr: '오리진 스토리 시즌 4-5',
        zh: '起源剧情 第4季 Ep5',
        fr: 'Origin Story saison 4-5',
      },
    ],
  },
];
