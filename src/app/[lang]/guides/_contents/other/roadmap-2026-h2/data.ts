/**
 * Données du guide « 2026 Roadmap — Second Half » — meeting du 14 août 2026
 * (第二回 日本ユーザー懇談会, deuxième rencontre des joueurs japonais).
 *
 * Rangé comme `roadmap-2026` : des SECTIONS thématiques, pas la suite des
 * captures. L'ordre du diaporama ne survit nulle part ici — les diapos de pur
 * titre servent d'illustration à la section qu'elles annonçaient, et le tableau
 * récapitulatif de fin devient des cartes mensuelles comme dans le premier
 * guide. Aucune diapo n'est perdue au passage.
 *
 * La source est JAPONAISE : `jp` est la TRANSCRIPTION du texte à l'écran, pas
 * une traduction ; les quatre autres langues en dérivent.
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
 * エリーゼ=Eliza/엘리제/伊莉莎, セイラン=Saeran, テルミナス島=Terminus Isle/
 * 멸망의 섬/灭亡之岛, メルシャフェス=Mirsha Festival/메르샤 페스티벌/弥乐沙节,
 * スカウト=Recruit/영입/招募. SEULE exception : ティティア, personnage inédit
 * absent de la donnée — « Titia » est une romanisation PROVISOIRE, à corriger
 * dès que le nom officiel EN sort (cf. `LABELS.titiaNote`).
 *
 * Le bloc PICK-UP fait exception à tout ça : la diapo y résumait des règles
 * que `general-guides/banner-mileage` détaille depuis les patch notes du
 * 25/08. Il reprend donc SON vocabulaire (募集 / recruits / banner / Héros en
 * focus, noms de bannières Rate Up · Limited · Premium · Dimensional Supply)
 * et SES règles — le mot à mot de la diapo se lisait de travers. Détail sur
 * place, au-dessus de `PICKUP_GROUPS`.
 */
import type { LocalizedText } from '@contracts';

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
    en: 'Everything announced for the second half of 2026 at the 2nd Japanese player roundtable, held on August 14, 2026. The slides were in Japanese; every line is translated below.',
    jp: '2026年8月14日に開催された第二回 日本ユーザー懇談会で発表された、2026年下半期の内容をまとめています。',
    kr: '2026년 8월 14일에 열린 제2회 일본 유저 간담회에서 발표된 2026년 하반기 내용을 정리했습니다.',
    zh: '整理2026年8月14日举行的第二届日本玩家恳谈会上公布的2026年下半年内容。',
    fr: 'Tout ce qui a été annoncé pour le second semestre 2026 lors de la 2e rencontre des joueurs japonais, le 14 août 2026. Les diapos étaient en japonais ; chaque ligne est traduite ci-dessous.',
  },
  agenda: {
    en: 'What the meeting covered',
    jp: '懇談会のアジェンダ',
    kr: '간담회 아젠다',
    zh: '恳谈会议程',
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
    en: 'Release plan for the rest of the year',
    jp: '年内の実装計画',
    kr: '연내 실장 계획',
    zh: '年内实装计划',
    fr: "Plan de sortie d'ici la fin de l'année",
  },
  coreFusion: {
    en: 'Core Fusion',
    jp: 'コアフュージョン',
    kr: '코어 융합',
    zh: '核心融合',
    fr: 'Core Fusion',
  },
  characterRework: {
    en: 'Character Rework',
    jp: 'キャラクターリワーク',
    kr: '캐릭터 리워크',
    zh: '角色重制',
    fr: 'Refonte de personnages',
  },
  storyRegion: {
    en: 'New Story Region',
    jp: '新規ストーリー地域',
    kr: '신규 스토리 지역',
    zh: '新剧情地区',
    fr: 'Nouvelle région scénaristique',
  },
  gameImprovements: {
    en: 'Game Improvements',
    jp: 'ゲーム改善',
    kr: '게임 개선',
    zh: '游戏改善',
    fr: 'Améliorations du jeu',
  },
  monthlySchedule: {
    en: 'Monthly Schedule',
    jp: '月別スケジュール',
    kr: '월별 스케줄',
    zh: '月度日程',
    fr: 'Calendrier mensuel',
  },
  alreadyReleased: {
    en: 'Already released',
    jp: 'リリース済み',
    kr: '출시 완료',
    zh: '已实装',
    fr: 'Déjà sorti',
  },
  labelNewCharacters: {
    en: 'New Characters:',
    jp: '新キャラクター:',
    kr: '신규 캐릭터:',
    zh: '新角色:',
    fr: 'Nouveaux personnages :',
  },
  labelCoreFusion: {
    en: 'Core Fusion:',
    jp: 'コア融合:',
    kr: '코어 융합:',
    zh: '核心融合:',
    fr: 'Core Fusion :',
  },
  labelStory: { en: 'Story:', jp: 'ストーリー:', kr: '스토리:', zh: '剧情:', fr: 'Scénario :' },
  labelContent: { en: 'Content:', jp: 'コンテンツ:', kr: '콘텐츠:', zh: '内容:', fr: 'Contenu :' },
  /** Le ※ répété au bas de presque toutes les diapos — écrit UNE fois. */
  disclaimer: {
    en: '※ Plans and contents may change depending on the development schedule.',
    jp: '※ 開発日程により、計画と内容は変更される場合があります。',
    kr: '※ 개발 일정에 따라 계획과 내용이 변경될 수 있습니다.',
    zh: '※ 根据开发日程，计划与内容可能会有所变更。',
    fr: "※ Le calendrier et le contenu peuvent changer selon l'avancement du développement.",
  },
  source: {
    en: 'Source: Outerplane — 2nd Japanese Player Roundtable (August 14, 2026)',
    jp: '出典: アウタープレーン 第二回 日本ユーザー懇談会（2026年8月14日）',
    kr: '출처: 아우터플레인 제2회 일본 유저 간담회 (2026년 8월 14일)',
    zh: '来源: Outerplane 第二届日本玩家恳谈会（2026年8月14日）',
    fr: 'Source : Outerplane — 2e rencontre des joueurs japonais (14 août 2026)',
  },
  /** Le nom du perso inédit n'a pas encore de romanisation officielle. */
  titiaNote: {
    en: '“Titia” is a provisional romanisation of ティティア — the character is not in the game data yet, so the official English name may differ.',
    jp: '「ティティア」の英語表記は暫定です。ゲームデータに未収録のため、正式名称と異なる場合があります。',
    kr: '「Titia」는 ティティア의 잠정 표기입니다. 게임 데이터에 아직 없어 정식 명칭과 다를 수 있습니다.',
    zh: '「Titia」为ティティア的暂定译名。该角色尚未收录于游戏数据，正式名称可能不同。',
    fr: "« Titia » est une romanisation provisoire de ティティア : le personnage n'est pas encore dans la donnée du jeu, le nom officiel pourra différer.",
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
  zh: '2026年1月至7月为另行公布，详见{L/2026路线图（上半年）|/guides/other/roadmap-2026}。',
  fr: 'Janvier à juillet 2026 ont été annoncés séparément — voir {L/Roadmap 2026 — Première moitié|/guides/other/roadmap-2026}.',
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
    alt: 'Opening shot of the 2nd Outerplane roundtable meeting',
    caption: {
      en: '2nd Roundtable Meeting',
      jp: '第二回 懇談会',
      kr: '제2회 간담회',
      zh: '第二届恳谈会',
      fr: '2e rencontre communautaire',
    },
  },
  {
    file: 'title.webp',
    alt: 'Title slide: Outerplane 2026 second half roadmap',
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
  alt: 'Agenda of the roundtable meeting',
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
    en: 'New Story Region',
    jp: '新規ストーリー地域',
    kr: '신규 스토리 지역',
    zh: '新剧情地区',
    fr: 'Nouvelle région scénaristique',
  },
  {
    en: 'Game Improvements',
    jp: 'ゲーム改善',
    kr: '게임 개선',
    zh: '游戏改善',
    fr: 'Améliorations du jeu',
  },
  {
    en: 'Monthly Schedule',
    jp: '月別スケジュール',
    kr: '월별 스케줄',
    zh: '月度日程',
    fr: 'Calendrier mensuel',
  },
];

export const RELEASE_PLAN_SHOT: Shot = {
  file: 'new-characters-plan.webp',
  alt: 'New character release plan: 1 Demiurge, 1 seasonal limited, 4 visual reworks, 2 standard',
};

/** Le décompte annoncé, une carte par catégorie. */
export const RELEASE_PLAN_COUNTS: Array<{ label: Text; value: number }> = [
  {
    value: 1,
    label: {
      en: 'Demiurge',
      jp: 'デミウルゴス',
      kr: '데미우르고스',
      zh: '德米乌戈斯',
      fr: 'Demiurge',
    },
  },
  {
    value: 1,
    label: {
      en: 'Seasonal Limited',
      jp: 'シーズナル限定',
      kr: '시즌 한정',
      zh: '季节限定',
      fr: 'Limité saisonnier',
    },
  },
  {
    value: 4,
    label: {
      en: 'Visual Rework',
      jp: 'ビジュアルリワーク',
      kr: '비주얼 리워크',
      zh: '视觉重制',
      fr: 'Refonte visuelle',
    },
  },
  { value: 2, label: { en: 'Standard', jp: '通常', kr: '일반', zh: '普通', fr: 'Standard' } },
];

export const RELEASE_PLAN_GOAL: Text = {
  en: 'Preparations are under way with the goal of unveiling 8 characters before the end of the year.',
  jp: '年内8名のキャラクターのお披露目を目標に準備中',
  kr: '연내 8명의 캐릭터 공개를 목표로 준비 중',
  zh: '正以年内公开8名角色为目标进行准备',
  fr: "Objectif visé : dévoiler 8 personnages d'ici la fin de l'année.",
};

/**
 * Ce qu'il faut savoir pour lire le décompte sans se tromper. La diapo annonce
 * « 8 お披露目 » et aligne 1+1+4+2 : les 4 refontes visuelles SONT comptées
 * dedans, alors que ce sont des persos déjà en jeu. Le lecteur qui compte 8
 * nouveaux persos se trompe — donc on le dit, la diapo ne le disait pas.
 */
export const RELEASE_PLAN_NOTES: Text[] = [
  {
    en: 'The eight break down as 1 + 1 + 4 + 2: the four visual reworks are existing characters getting a new look, so only four of the eight are genuinely new.',
    jp: '8名の内訳は 1＋1＋4＋2 です。ビジュアルリワークの4名は既存キャラクターの見た目の刷新であり、完全な新規は4名にとどまります。',
    kr: '8명의 내역은 1＋1＋4＋2입니다. 비주얼 리워크 4명은 기존 캐릭터의 외형 개편이므로, 실제 신규는 4명입니다.',
    zh: '8名的构成为 1＋1＋4＋2：视觉重制的4名是现有角色的外观翻新，因此真正的新角色只有4名。',
    fr: "Les huit se répartissent en 1 + 1 + 4 + 2 : les quatre refontes visuelles sont des personnages existants qui changent d'apparence, donc seuls quatre des huit sont réellement nouveaux.",
  },
  {
    en: 'The Core Fusion line-up is not included in these figures; it will be updated once the update policy is settled.',
    jp: 'コアフュージョンのラインナップは現在含まれておらず、アップデート方針の確定しだいアップデート予定',
    kr: '코어 융합 라인업은 현재 포함되어 있지 않으며, 업데이트 방침이 확정되는 대로 업데이트될 예정',
    zh: '核心融合阵容目前不包含在内，待更新方针确定后再行更新',
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
    name: 'Core Fusion Rin',
    element: 'water',
    classType: 'striker',
    accent: { border: 'border-blue-700/50', bg: 'bg-blue-900/20', text: 'text-blue-300' },
    date: { en: 'September 8', jp: '9月8日', kr: '9월 8일', zh: '9月8日', fr: '8 septembre' },
    images: ['cf-rin.webp'],
  },
];

/**
 * Les Core Fusion annoncés pour septembre. Eliza n'a PAS de fiche de design :
 * elle ne figure que dans la cellule « リン、エリーゼ（コアフュージョン） » du
 * calendrier mensuel — d'où sa présence ici et nulle part ailleurs.
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
  en: 'From September 8, Core Fusion allies are handled as regular allies — a change of name for the system is still under consideration.',
  jp: '9月8日より、コアフュージョン仲間は通常の仲間として扱われます。名称の変更については検討中です。',
  kr: '9월 8일부터 코어 융합 동료는 일반 동료로 취급됩니다. 명칭 변경은 검토 중입니다.',
  zh: '自9月8日起，核心融合同伴将按普通同伴处理。名称是否变更仍在讨论中。',
  fr: "À partir du 8 septembre, les alliés Core Fusion sont traités comme des alliés ordinaires — un changement de nom du système reste à l'étude.",
};

/**
 * Déjà SORTI au moment où ce guide est écrit — la seule annonce du meeting qui
 * soit du passé. Il n'a pas eu de fiche de design : il ne vient que de la
 * cellule « デミウルゴス セイラン » du calendrier, mais il est en base
 * (2000129), donc autant renvoyer vers sa fiche.
 */
export const RELEASED: Array<{ name: string; date: Text }> = [
  {
    name: 'Demiurge Saeran',
    date: { en: 'August', jp: '8月', kr: '8월', zh: '8月', fr: 'Août' },
  },
];

export const REWORK_SHOT: Shot = {
  file: 'character-rework.webp',
  alt: 'Character rework slide showing Eliza and Alice',
};

export const REWORK_NOTE: Text = {
  en: 'Visual rework plus balance buffs.',
  jp: 'ビジュアルのリワークとバランスの上方調整を行います',
  kr: '비주얼 리워크와 밸런스 상향 조정을 진행합니다',
  zh: '将进行视觉重制与平衡上调',
  fr: 'Refonte visuelle et amélioration de leur équilibrage.',
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
  { file: 'section-story.webp', alt: 'Section title: New Story Region' },
  {
    file: 'story-update-plan.webp',
    alt: 'Table of planned story updates from September to December 2026',
  },
];

export const STORY_TABLE: SlideTable = {
  headers: [
    { en: 'Region', jp: '地域', kr: '지역', zh: '地区', fr: 'Région' },
    { en: 'Episode', jp: 'エピソード', kr: '에피소드', zh: '篇章', fr: 'Épisode' },
    {
      en: 'Planned update',
      jp: 'アップデート予定',
      kr: '업데이트 예정',
      zh: '更新预定',
      fr: 'Mise à jour prévue',
    },
  ],
  rows: [
    [
      {
        en: 'Renewed Story',
        jp: 'リニューアルストーリ',
        kr: '리뉴얼 스토리',
        zh: '重制剧情',
        fr: 'Scénario remanié',
      },
      {
        en: 'EP4: Luna & Veronica arc',
        jp: 'EP4：ルナ＆ヴェロニカ編',
        kr: 'EP4: 루나 & 베로니카 편',
        zh: 'EP4：露娜＆薇罗妮卡篇',
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
        zh: '起源剧情 第4季 4-3',
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
        zh: '起源剧情 第4季 4-4',
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
        zh: '起源剧情 第4季 4-5',
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

/** En-têtes communs aux trois tableaux d'améliorations. */
const IMPROVEMENT_HEADERS: Text[] = [
  { en: 'Item', jp: '項目', kr: '항목', zh: '项目', fr: 'Élément' },
  { en: 'Details', jp: '内容', kr: '내용', zh: '内容', fr: 'Détail' },
  {
    en: 'Update (planned)',
    jp: 'アップデート（予定）時期',
    kr: '업데이트(예정) 시기',
    zh: '更新（预定）时间',
    fr: 'Mise à jour (prévue)',
  },
];

export const IMPROVEMENT_BLOCKS: ImprovementBlock[] = [
  {
    title: { en: 'August', jp: '8月', kr: '8월', zh: '8月', fr: 'Août' },
    shot: {
      file: 'improvements-august.webp',
      alt: 'Table of August 2026 game improvements',
    },
    table: {
      headers: IMPROVEMENT_HEADERS,
      rows: [
        [
          {
            en: 'Steam release',
            jp: 'Steam版リリース',
            kr: 'Steam 버전 출시',
            zh: 'Steam版发布',
            fr: 'Sortie Steam',
          },
          {
            en: 'Service opens on Steam.\nA smoother experience on PC as well.',
            jp: 'Steamでのサービスを開始。\nPCでもより快適にお楽しみいただけます。',
            kr: 'Steam에서 서비스를 시작.\nPC에서도 더 쾌적하게 즐길 수 있습니다.',
            zh: '在Steam上开始运营。\nPC端也能更舒适地游玩。',
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
            en: 'Added a region-switch transition to the Adventure screen.\nRegion buttons now show EX stage clear status and the number of ★ earned.\nEX stage icons redesigned for better readability.\nGuide Quests added to Story [Hard] and Origin [Hard].',
            jp: '冒険画面に地域の切替演出を追加\n地域ボタン内で、EXステージのクリア状況および★の獲得数を確認できるよう改善\nEXステージのアイコンデザインを変更し、視認性を向上\nストーリー(ハード)／オリジン(ハード)にガイドクエストを追加',
            kr: '모험 화면에 지역 전환 연출 추가\n지역 버튼에서 EX 스테이지 클리어 현황 및 ★ 획득 수를 확인할 수 있도록 개선\nEX 스테이지 아이콘 디자인을 변경해 시인성 향상\n스토리 하드 퀘스트 / 오리진 하드 퀘스트에 가이드 퀘스트 추가',
            zh: '在冒险界面加入地区切换演出\n地区按钮内可确认EX关卡的通关情况与★获得数\n变更EX关卡图标设计，提升辨识度\n为剧情困难任务／起源困难任务加入引导任务',
            fr: "Ajout d'une transition de changement de région sur l'écran d'aventure.\nLes boutons de région affichent désormais l'état de complétion des étapes EX et le nombre d'★ obtenues.\nIcônes des étapes EX redessinées pour une meilleure lisibilité.\nQuêtes guides ajoutées à Scénario [Difficile] et Origin [Difficile].",
          },
          { en: 'August 11', jp: '8月11日', kr: '8월 11일', zh: '8月11日', fr: '11 août' },
        ],
        [
          {
            en: 'Dimensional Singularity — 2nd wave',
            jp: '次元特異点 — 第2次',
            kr: '차원 특이점 — 제2차',
            zh: '次元奇点 — 第2次',
            fr: 'Dimensional Singularity — 2e vague',
          },
          {
            en: 'Singularity activation and enhancement can now be done together on the enhancement screen.\nAdded a “Practice Mode” you can retry as often as you like.\nWhen rerolling Singularity options, you can now compare the old and new options before choosing whether to apply them.\nClearer explanations of how certain options are applied.',
            jp: '特異点の活性化と強化を、強化画面でまとめて行えるよう改善\n気軽に何度でもテストできる「練習モード」を追加\n特異点オプションの再抽選(振り直し)時、変更前と変更後のオプションを比較して適用するかを選択できる機能を追加\n一部オプションの適用方式に関する説明を、より分かりやすく改善',
            kr: '특이점의 활성화와 강화를 강화 화면에서 한 번에 진행할 수 있도록 개선\n부담 없이 몇 번이든 테스트할 수 있는 「연습 모드」 추가\n특이점 옵션 재추첨 시, 변경 전후의 옵션을 비교해 적용 여부를 선택할 수 있는 기능 추가\n일부 옵션의 적용 방식에 대한 설명을 더 알기 쉽게 개선',
            zh: '奇点的激活与强化可在强化界面一并进行\n新增可随意重复测试的「练习模式」\n重抽奇点选项时，新增可对比变更前后选项再决定是否套用的功能\n改善部分选项套用方式的说明，使其更易理解',
            fr: "L'activation et l'amélioration des singularités se font désormais ensemble depuis l'écran d'amélioration.\nAjout d'un « mode entraînement » que l'on peut relancer autant de fois qu'on veut.\nLors d'un relancement des options de singularité, on peut comparer les options avant et après pour décider de les appliquer.\nExplications plus claires sur le mode d'application de certaines options.",
          },
          { en: 'August 25', jp: '8月25日', kr: '8월 25일', zh: '8月25日', fr: '25 août' },
        ],
        [
          {
            en: 'Terminus Isle rework',
            jp: 'テルミナス島 改編',
            kr: '멸망의 섬 개편',
            zh: '灭亡之岛 改版',
            fr: 'Refonte de Terminus Isle',
          },
          {
            en: 'Guaranteed weather change no longer requires the monthly purchase.\nExploration time removed: results can be checked at the same time as the team is set.\nPer-tier balance: weather penalties and formation bonuses tuned tier by tier to remove the disadvantage at lower tiers, plus first-clear rewards per tier.\nBulk exploration skip: check all available explorations at once and claim the rewards.\nGift growth completion time cut to roughly 30–40% of what it used to be.',
            jp: '気象の確定変更を、月額購入なしで利用できるよう改善\n探索時間を撤廃：編成と同時に確認できるよう改善\n段階別のバランス調整：気象ペナルティ／編成ボーナスを段階ごとに調整し、低い段階での不利を解消、段階の初回クリア報酬を適用\n探索の一括スキップ：確認できる探索をまとめて確認し、報酬を受け取れる機能\nギフト成長の完了までの時間を短縮：従来比 約30〜40%の水準まで引き下げ',
            kr: '기상의 확정 변경을 월정액 구매 없이 이용할 수 있도록 개선\n탐사 시간 폐지: 편성과 동시에 확인할 수 있도록 개선\n단계별 밸런스 조정: 기상 페널티／편성 보너스를 단계마다 조정해 낮은 단계의 불리함을 해소, 단계별 최초 클리어 보상 적용\n탐사 일괄 스킵: 확인 가능한 탐사를 한꺼번에 확인하고 보상을 수령하는 기능\n기프트 성장 완료까지의 시간 단축: 기존 대비 약 30〜40% 수준까지 감소',
            zh: '天气的确定变更无需月卡即可使用\n取消探索时间：可在编队的同时确认结果\n分阶段平衡调整：逐阶段调整天气惩罚／编队加成，消除低阶段的劣势，并加入各阶段首次通关奖励\n探索一键跳过：可一次性确认所有可确认的探索并领取奖励\n缩短礼物成长完成所需时间：降至原先约30〜40%的水平',
            fr: "Le changement de météo garanti ne nécessite plus l'achat mensuel.\nSuppression du temps d'exploration : le résultat se consulte en même temps que la composition.\nÉquilibrage par palier : pénalités météo et bonus de composition ajustés palier par palier pour supprimer le désavantage aux paliers bas, et récompenses de première victoire par palier.\nSaut groupé des explorations : tout consulter d'un coup et récupérer les récompenses.\nDurée de la croissance des cadeaux réduite à environ 30–40 % de ce qu'elle était.",
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
      alt: 'Table of September 2026 game improvements',
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
            en: 'Core Fusion allies will be handled as regular allies.\n— A change of name is still under consideration.',
            jp: 'コアフュージョン仲間を、通常の仲間として扱うよう変更\n— 名称の変更については検討中',
            kr: '코어 융합 동료를 일반 동료로 취급하도록 변경\n— 명칭 변경은 검토 중',
            zh: '将核心融合同伴改为按普通同伴处理\n— 名称是否变更仍在讨论中',
            fr: "Les alliés Core Fusion seront traités comme des alliés ordinaires.\n— Un changement de nom est encore à l'étude.",
          },
          { en: 'September 8', jp: '9月8日', kr: '9월 8일', zh: '9月8日', fr: '8 septembre' },
        ],
        [
          {
            en: 'Early-game gear rewards rework',
            jp: '序盤の装備報酬 改編',
            kr: '초반 장비 보상 개편',
            zh: '前期装备奖励 改版',
            fr: "Refonte des récompenses d'équipement du début de partie",
          },
          {
            en: 'Taking new players as the baseline, the rarity and star rank of the gear rewards that carry early progression and convenience are being reviewed.\nRaising the level of gear obtainable from Guide Quests, the Mirsha Festival, Special Request missions, new-player login missions and the like is under review and will be acted on.',
            jp: '新規プレイヤーを基準に、序盤の成長とプレイの利便性を担う装備報酬のレアリティ／星ランクを再点検\nガイドクエスト／メルシャフェスティバル／特別依頼ミッション／新規プレイヤーのログイン・ミッションなどで獲得できる装備水準の引き上げを検討し、対応',
            kr: '신규 플레이어를 기준으로, 초반 성장과 플레이 편의를 담당하는 장비 보상의 레어리티／별 등급을 재점검\n가이드 퀘스트／메르샤 페스티벌／특별 의뢰 미션／신규 플레이어 로그인 미션 등에서 획득할 수 있는 장비 수준의 상향을 검토하고 대응',
            zh: '以新玩家为基准，重新检视承担前期成长与游玩便利性的装备奖励的稀有度／星级\n研讨并推进提升引导任务／弥乐沙节／特别委托任务／新玩家登录任务等可获得的装备水准',
            fr: "En prenant les nouveaux joueurs comme référence, la rareté et le rang d'étoiles des récompenses d'équipement qui portent la progression du début de partie sont réexaminés.\nUne hausse du niveau d'équipement obtenu via les quêtes guides, le Mirsha Festival, les missions de requête spéciale, les missions de connexion des nouveaux joueurs et autres est à l'étude et sera mise en œuvre.",
          },
          { en: 'September 22', jp: '9月22日', kr: '9월 22일', zh: '9月22日', fr: '22 septembre' },
        ],
      ],
    },
  },
  {
    title: {
      en: 'Under review',
      jp: '検討中',
      kr: '검토 중',
      zh: '讨论中',
      fr: "À l'étude",
    },
    shot: {
      file: 'improvements-under-review.webp',
      alt: 'Table of game improvements still under review',
    },
    table: {
      headers: IMPROVEMENT_HEADERS,
      rows: [
        [
          {
            en: 'Recruit improvements',
            jp: 'スカウト改善',
            kr: '영입 개선',
            zh: '招募改善',
            fr: 'Améliorations du recrutement',
          },
          {
            en: 'Remove male characters from the Recruit pool.\nCurrent ★1–★2 characters: their pieces are granted in the story dungeon where they first appear.\nMaxwell / Leo: keep things as they are, or grant them the same way as above.',
            jp: '男性キャラクターをスカウトプールから除外\n現在の★1〜★2キャラクター：初登場のストーリーダンジョンでピースを支給\nマクスウェル／レオ：現状を維持、または上記と同様の方法で支給',
            kr: '남성 캐릭터를 영입 풀에서 제외\n현재 ★1〜★2 캐릭터: 첫 등장 스토리 던전에서 조각을 지급\n맥스웰／레오: 현행 유지, 또는 위와 동일한 방식으로 지급',
            zh: '将男性角色从招募池中移除\n现有★1〜★2角色：在其首次登场的剧情地下城发放碎片\n麦克斯韦／利奥：维持现状，或以与上述相同的方式发放',
            fr: 'Retirer les personnages masculins du pool de recrutement.\nPersonnages ★1–★2 actuels : leurs fragments sont donnés dans le donjon scénaristique où ils apparaissent pour la première fois.\nMaxwell / Leo : statu quo, ou distribution selon la même méthode que ci-dessus.',
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
  alt: 'Slide detailing the pick-up recruit improvements coming on August 25',
};

export const PICKUP_TITLE: Text = {
  en: 'Recruitment improvements (August 25)',
  jp: 'ピックアップ改善（8月25日）',
  kr: '픽업 개선 (8월 25일)',
  zh: 'PICKUP改善（8月25日）',
  fr: 'Améliorations du recrutement (25 août)',
};

export const PICKUP_INTRO: Text = {
  en: 'The basic recruitment rules and rates stay as they are; the following is added on top.',
  jp: '基本の募集ルールと確率は従来どおりのまま、以下の要素を追加します。',
  kr: '기본 모집 규칙과 확률은 기존 그대로 유지하며, 아래 요소를 추가합니다.',
  zh: '基本招募规则与概率维持不变，追加以下内容。',
  fr: "Les règles et les taux de recrutement de base ne changent pas ; les éléments suivants viennent s'y ajouter.",
};

/**
 * Les trois blocs ■ de la diapo — SEUL endroit du guide qui n'est pas une
 * transcription. La diapo résume ; le détail exact vit dans le guide
 * `banner-mileage`, écrit depuis les patch notes du 25/08. On reprend donc SON
 * vocabulaire (募集 / recruits / banner / Héros en focus, et les noms de
 * bannières : Rate Up, Limited, Premium, Dimensional Supply) plutôt que le mot
 * à mot japonais de la diapo, qui se lisait de travers :
 *   - 「最初の2回に確定スカウトの回数を付与」 ne veut pas dire « les 2 premières
 *     bannières ont un compteur », mais « la garantie se déclenche 2 fois au
 *     plus SUR une même bannière » ;
 *   - la garantie Demiurge se compte par HÉROS, pas par bannière : 50 tirages
 *     sur X, on bascule sur Y qui démarre à 0, on revient sur X et on reprend
 *     à 50.
 */
export const PICKUP_GROUPS: Array<{ heading: Text; lines: Text[] }> = [
  {
    heading: {
      en: 'Rate Up and Limited banners',
      jp: 'ピックアップ募集・限定募集',
      kr: '픽업 모집 · 한정 모집',
      zh: 'UP招募・限定招募',
      fr: 'Rate Up Banner et Limited Banner',
    },
    lines: [
      {
        en: 'Covers Rate Up, Seasonal Limited and Festival Limited banners.',
        jp: '対象はピックアップ募集、シーズナル限定、フェス限定です。',
        kr: '대상은 픽업 모집, 시즌 한정, 페스 한정입니다.',
        zh: '适用于UP招募、季节限定与庆典限定。',
        fr: 'Concerne les banners Rate Up, Seasonal Limited et Festival Limited.',
      },
      {
        en: 'The featured hero is guaranteed within 100 recruits, twice at most per banner.',
        jp: 'ピックアップヒーローは100回の募集以内に確定します。1つのバナーにつき最大2回までです。',
        kr: '픽업 영웅은 100회 모집 이내에 확정됩니다. 배너당 최대 2회까지입니다.',
        zh: 'UP同伴在100次招募以内必定获得，每个卡池最多2次。',
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
      kr: '프리미엄 모집 (데미우르고스)',
      zh: '精选招募（创世之神）',
      fr: 'Premium Banner (Demiurge)',
    },
    lines: [
      {
        en: 'The selected Demiurge hero is guaranteed within 100 recruits, once per Demiurge hero.',
        jp: '選択中のデミウルゴスヒーローは100回の募集以内に確定し、ヒーロー1体につき1回までです。',
        kr: '선택한 데미우르고스 영웅은 100회 모집 이내에 확정되며, 영웅 1명당 1회까지입니다.',
        zh: '所选创世之神同伴在100次招募以内必定获得，每名创世之神同伴限1次。',
        fr: 'Le Héros Demiurge sélectionné est garanti en 100 Recruits maximum, une fois par Héros Demiurge.',
      },
      {
        en: 'Progress is tracked per hero and switching your selection resets nothing: 50 recruits on one, switch to another and it starts at 0 — come back to the first and you resume at 50.',
        jp: '進行度はヒーローごとに記録され、選択を変えてもリセットされません。1体に50回使ってから別の1体に切り替えると、後者は0から始まり、元の1体に戻れば50回から再開します。',
        kr: '진행도는 영웅별로 기록되며 선택을 바꿔도 초기화되지 않습니다. 한 명에게 50회를 쓴 뒤 다른 영웅으로 바꾸면 그쪽은 0부터 시작하고, 원래 영웅으로 돌아오면 50회부터 이어집니다.',
        zh: '进度按同伴分别记录，更换所选同伴不会重置：对某位使用50次后换成另一位，后者从0开始；换回原来那位则从50次继续。',
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
        zh: '抽装备而非同伴的卡池。',
        fr: "La banner qui recrute de l'équipement et non des Héros.",
      },
      {
        en: 'Monthly acquisition opportunities adjusted for the highest-value gear.',
        jp: '最も価値の高い装備について、月間の獲得機会を調整',
        kr: '가장 가치가 높은 장비에 대해 월간 획득 기회를 조정',
        zh: '针对价值最高的装备，调整每月的获取机会',
        fr: "Les occasions d'obtention mensuelles sont ajustées pour l'équipement de plus grande valeur.",
      },
    ],
  },
];

export const SCHEDULE_SHOT: Shot = {
  file: 'monthly-schedule.webp',
  alt: 'Monthly schedule table for the second half of 2026',
};

export const MONTHLY_UPDATES: MonthlyUpdate[] = [
  {
    month: { en: 'August', jp: '8月', kr: '8월', zh: '8月', fr: 'Août' },
    highlights: [
      {
        en: 'Steam release',
        jp: 'Steam版リリース',
        kr: 'Steam 버전 출시',
        zh: 'Steam版发布',
        fr: 'Sortie Steam',
      },
    ],
    newCharacters: [
      {
        en: 'Demiurge Saeran',
        jp: 'デミウルゴス セイラン',
        kr: '데미우르고스 세이란',
        zh: '德米乌戈斯 萨伊蓝',
        fr: 'Demiurge Saeran',
      },
    ],
    content: [
      {
        en: 'Steam release',
        jp: 'Steam版リリース',
        kr: 'Steam 버전 출시',
        zh: 'Steam版发布',
        fr: 'Sortie Steam',
      },
      {
        en: 'Dimensional Singularity improvements',
        jp: '次元特異点改善',
        kr: '차원 특이점 개선',
        zh: '次元奇点改善',
        fr: 'Améliorations Dimensional Singularity',
      },
      {
        en: 'Terminus Isle rework',
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
        en: 'Recruit improvements',
        jp: 'スカウト改善',
        kr: '영입 개선',
        zh: '招募改善',
        fr: 'Améliorations du recrutement',
      },
    ],
  },
  {
    month: { en: 'September', jp: '9月', kr: '9월', zh: '9月', fr: 'Septembre' },
    highlights: [
      {
        en: 'Luna & Veronica arc ends',
        jp: 'ルナ＆ヴェロニカ編 完結',
        kr: '루나 & 베로니카 편 완결',
        zh: '露娜＆薇罗妮卡篇 完结',
        fr: 'Fin de l’arc Luna & Veronica',
      },
    ],
    newCharacters: [
      { en: 'Titia', jp: 'ティティア', kr: '티티아', zh: '蒂蒂亚', fr: 'Titia' },
      {
        en: 'Eliza (rework)',
        jp: 'エリーゼ（リワーク）',
        kr: '엘리제(리워크)',
        zh: '伊莉莎（重制）',
        fr: 'Eliza (refonte)',
      },
    ],
    coreFusions: ['Rin', 'Eliza'],
    story: [
      { en: 'Region 4', jp: '地域 4', kr: '지역 4', zh: '地区 4', fr: 'Région 4' },
      {
        en: 'Luna & Veronica arc — conclusion',
        jp: 'ルナ＆ヴェロニカ編 完結',
        kr: '루나 & 베로니카 편 완결',
        zh: '露娜＆薇罗妮卡篇 完结',
        fr: 'Arc Luna & Veronica — conclusion',
      },
    ],
    content: [
      {
        en: 'Core Fusion rework',
        jp: 'コアフュージョン改編',
        kr: '코어 융합 개편',
        zh: '核心融合改版',
        fr: 'Refonte de Core Fusion',
      },
      {
        en: 'Early-game gear rewards rework',
        jp: '序盤の装備報酬 改編',
        kr: '초반 장비 보상 개편',
        zh: '前期装备奖励改版',
        fr: "Refonte des récompenses d'équipement du début de partie",
      },
    ],
  },
];
