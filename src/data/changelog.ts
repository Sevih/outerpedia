import type { TenantKey } from '@/tenants/config'
import type { Localized } from '@/types/common'

// Type pour les chaînes localisées (string simple ou objet Localized)
type LString = string | Localized;
const resolveL = (s: LString, key: TenantKey) =>
  typeof s === 'string' ? s : (s[key] ?? s.en);
const toLines = (v: string | string[]) =>
  Array.isArray(v) ? v : v.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);

export type ChangelogEntry = {
  date: string;
  title: string;
  type: 'feature' | 'fix' | 'update' | 'balance';
  content: string[];
  url?: string;
};

type RawEntry = {
  date: string;
  title: LString;
  type: 'feature' | 'fix' | 'update' | 'balance';
  content: string | string[] | LString[];
  url?: string;
};

// Ancienne version brute avec type explicite (const + types littéraux)
export const oldChangelog = [
  {
    date: "2026-01-24",
    title: {
      en: "Progress Tracker",
      jp: "進捗トラッカー",
      kr: "진행률 추적기",
      zh: "进度追踪器",
    } as LString,
    type: "feature",
    url: "/progress-tracker",
    content: [
      {
        en: "New tool to track your daily, weekly, and monthly tasks, shop purchases, and crafts in Outerplane.",
        jp: "Outerplaneのデイリー/ウィークリー/マンスリータスク、ショップ購入、クラフトを追跡する新しいツール。",
        kr: "Outerplane의 일일/주간/월간 작업, 상점 구매, 제작을 추적하는 새로운 도구.",
        zh: "追踪《异域战记》每日/每周/每月任务、商店购买和制作的新工具。",
      } as LString,
    ],
  },
  {
    date: "2026-01-21",
    title: {
      en: "Interface Improvements",
      jp: "インターフェース改善",
      kr: "인터페이스 개선",
      zh: "界面改进",
    } as LString,
    type: "feature",
    content: [
      {
        en: "Improved display of character cards across the site: tier lists, team recommendations, and guide pages now share a unified, cleaner look.",
        jp: "サイト全体のキャラクターカード表示を改善：ティアリスト、チーム推奨、ガイドページで統一されたデザインになりました。",
        kr: "사이트 전체의 캐릭터 카드 표시 개선: 티어 리스트, 팀 추천, 가이드 페이지가 통일된 디자인으로 변경되었습니다.",
        zh: "改进了整个网站的角色卡片显示：tier榜、队伍推荐和指南页面现在采用统一、更简洁的外观。",
      } as LString,
      {
        en: "Better mobile experience: team grids now display properly on small screens, and the \"Most Used Units\" page no longer has overlapping text.",
        jp: "モバイル体験の向上：チームグリッドが小さい画面でも正しく表示され、「最も使用されるユニット」ページのテキストが重ならなくなりました。",
        kr: "모바일 경험 개선: 팀 그리드가 작은 화면에서도 올바르게 표시되고, \"가장 많이 사용되는 유닛\" 페이지의 텍스트 겹침이 해결되었습니다.",
        zh: "改善移动端体验：队伍网格现在在小屏幕上正常显示，「最常用单位」页面不再有文字重叠问题。",
      } as LString,
      {
        en: "Homepage redesign: Discord link is now a separate banner, and a message displays when no character banner is active.",
        jp: "ホームページのリデザイン：Discordリンクが独立したバナーになり、キャラクターバナーがない時はメッセージが表示されます。",
        kr: "홈페이지 리디자인: Discord 링크가 별도 배너로 분리되었고, 캐릭터 배너가 없을 때 메시지가 표시됩니다.",
        zh: "首页重新设计：Discord链接现在是独立横幅，当没有角色卡池时会显示提示信息。",
      } as LString,
    ],
  },
  {
    date: "2026-01-20",
    title: {
      en: "Deep Sea Guardian",
      jp: "深海ガーディアン",
      kr: "심해 가디언",
      zh: "深海守护者",
    } as LString,
    type: "update",
    url: "/guides/joint-boss/deep-sea-guardian",
    content: [
      {
        en: "Deep Sea Guardian joint boss guide updated for January 2026 version.",
        jp: "深海ガーディアン共同ボスガイドが2026年1月版にアップデートされました。",
        kr: "심해 가디언 공동 보스 가이드가 2026년 1월 버전으로 업데이트되었습니다.",
        zh: "深海守护者联合首领指南已更新至2026年1月版本。",
      } as LString,
    ],
  },
  {
    date: "2026-01-17",
    title: {
      en: "2026 Roadmap Guide",
      jp: "2026年ロードマップガイド",
      kr: "2026 로드맵 가이드",
      zh: "2026路线图指南",
    } as LString,
    type: "feature",
    url: "/guides/general-guides/roadmap-2026",
    content: [
      {
        en: "Summary of the January 2026 Offline Meeting: development direction, quarterly roadmap, new characters (Monad Iota, Premine, Eris, Gnosis Domine), Core Fusion plans, RTA, Dimension Singularity, and coupon code.",
        jp: "2026年1月オフラインミーティングの概要：開発方針、四半期ロードマップ、新キャラクター（モナド・イオタ、プレミン、エリス、グノーシス・ドミネ）、コア融合計画、RTA、次元特異点、クーポンコード。",
        kr: "2026년 1월 오프라인 미팅 요약: 개발 방향, 분기별 로드맵, 신규 캐릭터(모나드 이오타, 프레민, 에리스, 그노시스 도미네), 코어 융합 계획, RTA, 차원 특이점, 쿠폰 코드.",
        zh: "2026年1月线下会议摘要：开发方向、季度路线图、新角色（单子·伊奥塔、普雷明、厄里斯、诺希斯·多米涅）、核心融合计划、RTA、次元奇点、优惠码。",
      } as LString,
    ],
  },
    {
    date: "2026-01-14",
    title: {
      en: "Dignity of the Golden Kingdom",
      jp: "黄金なる王国の威容",
      kr: "황금 왕국의 위용",
      zh: "黄金王国的威严",
    } as LString,
    type: "update",
    url:"/guides/guild-raid/dignity-of-the-golden-kingdom",
    content: [
      {
        en: "Dignity of the Golden Kingdom Guild Raid Guide updated for January 2026 version.",
        jp: "黄金なる王国の威容 ギルドレイドガイドが2026年1月版にアップデートされました。",
        kr: "황금 왕국의 위용 길드 레이드 가이드가 2026년 1월 버전으로 업데이트되었습니다.",
        zh: "黄金王国的威严 公会战指南已更新至2026年1月版本。",
      } as LString,
    ],
  },
  {
    date: "2025-01-14",
    title: {
      en: "Three Cries (Post-nerf)",
      jp: "三つの鳴き声（ナーフ後）",
      kr: "세 울음소리 (너프 후)",
      zh: "三声啼哭（削弱后）",
    } as LString,
    type: "update",
    url: "/guides/adventure/S4-1-10",
    content: [
      {
        en: "Three Cries boss guide updated with post-nerf skill data.",
        jp: "三つの鳴き声ボスガイドがナーフ後のスキルデータで更新されました。",
        kr: "세 울음소리 보스 가이드가 너프 후 스킬 데이터로 업데이트되었습니다.",
        zh: "三声啼哭Boss指南已更新削弱后的技能数据。",
      } as LString,
    ],
  },
  {
    date: "2025-12-31",
    title: {
      en: "Drakhan",
      jp: "ドレイカーン",
      kr: "드레이칸",
      zh: "德雷坎",
    } as LString,
    type: "update",
    url: "/guides/world-boss/drakhan",
    content: [
      {
        en: "Drakhan world boss guide updated for December 2025 version.",
        jp: "ドレイカーン ワールドボスガイドが2025年12月版にアップデートされました。",
        kr: "드레이칸 월드 보스 가이드가 2025년 12월 버전으로 업데이트되었습니다.",
        zh: "德雷坎 世界首领指南已更新至2025年12月版本。",
      } as LString,
    ],
  },
  {
    date: "2025-12-23",
    title: {
      en: "Annihilator",
      jp: "エクスタミネーター",
      kr: "말살자",
      zh: "歼灭者",
    } as LString,
    type: "update",
    url: "/guides/joint-boss/annihilator",
    content: [
      {
        en: "Annihilator joint boss guide updated for December 2025 version.",
        jp: "エクスタミネーター共同ボスガイドが2025年12月版にアップデートされました。",
        kr: "말살자 공동 보스 가이드가 2025년 12월 버전으로 업데이트되었습니다.",
        zh: "歼灭者联合首领指南已更新至2025年12月版本。",
      } as LString,
    ],
  },
  {
    date: "2025-12-17",
    title: {
      en: "Prevent World Alteration Guild Raid",
      jp: "世界変容の阻止 ギルドレイド",
      kr: "세계변용 저지 길드 레이드",
      zh: "阻止世界改变 公会战",
    } as LString,
    type: "update",
    url: "/guides/guild-raid/prevent-world-alteration",
    content: [
      {
        en: "Prevent World Alteration guild raid updated for December 2025 version.",
        jp: "世界変容の阻止 ギルドレイドが2025年12月版にアップデートされました。",
        kr: "세계변용 저지 길드 레이드가 2025년 12월 버전으로 업데이트되었습니다.",
        zh: "阻止世界改变 公会战已更新至2025年12月版本。",
      } as LString,
    ],
  },
  {
    date: "2025-12-16",
    title: {
      en: "New Limited Hero: Mystic Sage Ame",
      jp: "新限定ヒーロー：三蔵法師 あめ",
      kr: "새로운 한정 영웅: 삼장법사 아메",
      zh: "新限定英雄：三藏法师 亚美",
    } as LString,
    type: "update",
    url: "/characters/mystic-sage-ame",
    content: [
      {
        en: "Mystic Sage Ame, who deals Fixed Damage and applies Debuffs to enemies while increasing the Priority of herself and her allies.",
        jp: "固定ダメージを与え、敵にデバフを付与しながら、自身と味方の優先度を上昇させる三蔵法師 あめが参戦します。",
        kr: "고정 피해를 입히고 적에게 디버프를 부여하면서 자신과 아군의 우선권을 증가시키는 삼장법사 아메가 참전합니다.",
        zh: "三藏法师 亚美造成固定伤害并对敌人施加减益效果，同时提高自身和队友的优先度。",
      } as LString,
    ],
  },
  {
    date: "2025-12-02",
    title: {
      en: "Ragnakeus",
      jp: "ラグナケウス",
      kr: "라그나케우스",
      zh: "拉格纳凯乌斯",
    } as LString,
    type: "update",
    url: "/guides/world-boss/ragnakeus",
    content: [
      {
        en: "Ragnakeus world boss guide updated for December 2025 version.",
        jp: "ラグナケウス ワールドボスガイドが2025年12月版にアップデートされました。",
        kr: "라그나케우스 월드 보스 가이드가 2025년 12월 버전으로 업데이트되었습니다.",
        zh: "拉格纳凯乌斯 世界首领指南已更新至2025年12月版本。",
      } as LString,
    ],
  },
  {
    date: "2025-11-25",
    title: {
      en: "Knight of Hope Meteos",
      jp: "光明の騎士・メテウス",
      kr: "광명의 기사 메테우스",
      zh: "希望骑士梅特乌斯",
    } as LString,
    type: "update",
    url: "/guides/joint-boss/koh-meteos",
    content: [
      {
        en: "Knight of Hope Meteos joint boss guide updated for November 2025 version.",
        jp: "光明の騎士・メテウス共同ボスガイドが2025年11月版にアップデートされました。",
        kr: "광명의 기사 메테우스 공동 보스 가이드가 2025년 11월 버전으로 업데이트되었습니다.",
        zh: "希望骑士梅特乌斯联合首领指南已更新至2025年11月版本。",
      } as LString,
    ],
  },
  {
    date: "2025-11-25",
    title: {
      en: "Equipment Display Improvements",
      jp: "装備表示の改善",
      kr: "장비 표시 개선",
      zh: "装备显示改进",
    } as LString,
    type: "feature",
    content: [
      {
        en: "Dynamic rarity colors and backgrounds for equipment cards based on item rarity (legendary, epic, superior, normal).",
        jp: "アイテムのレアリティに基づいた装備カードの動的なレアリティカラーと背景（レジェンダリー、エピック、スーペリア、ノーマル）。",
        kr: "아이템 희귀도에 따른 장비 카드의 동적 희귀도 색상 및 배경(레전더리, 에픽, 슈페리어, 노멀).",
        zh: "根据物品稀有度（传说、史诗、优秀、普通）动态显示装备卡片的稀有度颜色和背景。",
      } as LString,
      {
        en: "Added stat ranges support for Epic 6-star equipment in weapon and accessory pages.",
        jp: "武器とアクセサリーページにエピック6つ星装備のステータス範囲サポートを追加。",
        kr: "무기 및 액세서리 페이지에 에픽 6성 장비의 스탯 범위 지원 추가.",
        zh: "在武器和配件页面添加了史诗6星装备的属性范围支持。",
      } as LString,
      {
        en: "URL sync for tabs in Gear Usage Statistics page.",
        jp: "ギア使用統計ページのタブにURL同期を追加。",
        kr: "장비 사용 통계 페이지의 탭에 URL 동기화 추가.",
        zh: "装备使用统计页面的标签页URL同步。",
      } as LString,
    ],
  },
  {
    date: "2025-11-20",
    title: {
      en: "The Frost Legion Guild Raid",
      jp: "雪国の軍勢 ギルドレイド",
      kr: "설국의 군세 길드 레이드",
      zh: "霜冻军团 公会战",
    } as LString,
    type: "update",
    url: "/guides/guild-raid/frost-legion",
    content: [
      {
        en: "The Frost Legion guild raid updated for November 2025 version.",
        jp: "雪国の軍勢 ギルドレイドが2025年11月版にアップデートされました。",
        kr: "설국의 군세 길드 레이드가 2025년 11월 버전으로 업데이트되었습니다.",
        zh: "霜冻军团 公会战已更新至2025年11月版本。",
      } as LString,
    ],
  },
  {
    date: "2025-11-18",
    title: {
      en: "New Hero Fortuna",
      jp: "新ヒーロー フォルトゥナ",
      kr: "신규 영웅 포르투나",
      zh: "新英雄 福图娜",
    } as LString,
    type: "update",
    url: "/characters/fortuna",
    content: [
      {
        en: "Fortuna, who attacks enemies while inflicting debuffs such as Freeze, Bleed, and Priority decrease, joins the battlefield.",
        jp: "凍結、出血、優先度減少などのデバフを与えながら敵を攻撃するフォルトゥナが戦場に参戦します。",
        kr: "빙결, 출혈, 우선권 감소 등의 디버프를 가하며 적을 공격하는 포르투나가 전장에 참전합니다.",
        zh: "福图娜在攻击敌人的同时施加冰冻、流血和优先度降低等减益效果，加入战场。",
      } as LString,
    ],
  },
   {
    date: "2025-11-04",
    title: {
      en: "Primordial Sentinel World Boss",
      jp: "原初の番人 ワールドボス",
      kr: "원시의 파수꾼 월드 보스",
      zh: "原初守卫 世界首领",
    } as LString,
    type: "update",
    url: "/guides/world-boss/primordial_sentinel",
    content: [
      {
        en: "Primordial Sentinel world boss updated for November 2025 version.",
        jp: "原初の番人 ワールドボスが2025年11月版にアップデートされました。",
        kr: "원시의 파수꾼 월드 보스가 2025년 11월 버전으로 업데이트되었습니다。",
        zh: "原初守卫 世界首领已更新至2025年11月版本。",
      } as LString,
    ],
  },
   {
    date: "2025-11-04",
    title: {
      en: "New Demiurge Hero : Gnosis Viella",
      jp: "新デミウルゴヒーロー：グノーシス ビエラ",
      kr: "새로운 데미우르고 영웅: 그노시스 비엘라",
      zh: "新的造物主英雄：诺希斯 比埃拉",
    } as LString,
    type: "update",
    url: "/characters/gnosis-viella",
    content: [
      {
        en: "Gnosis Viella, who attacks enemies while inflicting various debuffs, joins the battlefield.",
        jp: "様々なデバフを与えながら敵を攻撃するグノーシス ビエラが戦場に参戦します。",
        kr: "다양한 디버프를 가하며 적을 공격하는 그노시스 비엘라가 전장에 참전합니다.",
        zh: "诺希斯 比埃拉在攻击敌人的同时施加各种减益效果，加入战场。",
      } as LString,
    ],
  },
  {
    date: "2025-11-03",
    title: {
      en: "Beginner FAQ Guide",
      jp: "初心者向けFAQガイド",
      kr: "초보자 FAQ 가이드",
      zh: "新手FAQ指南",
    } as LString,
    type: "feature",
    url: "/guides/general-guides/beginner-faq",
    content: [
      {
        en: "Common questions from new players: starting teams, pulling priorities, gear progression, and resource management.",
        jp: "新規プレイヤーからの一般的な質問：スタートチーム、召喚優先度、装備進行、リソース管理。",
        kr: "신규 플레이어의 일반적인 질문: 시작 팀, 뽑기 우선순위, 장비 진행, 자원 관리.",
        zh: "新玩家常见问题：起始队伍、抽卡优先级、装备进度、资源管理。",
      } as LString,
    ],
  },
  {
    date: "2025-10-28",
    title: {
      en: "Prototype EX-78 Joint Boss",
      jp: "試作機:EX-78 共同ボス",
      kr: "EX-78 시범기 공동 보스",
    } as LString,
    type: "update",
    url: "/guides/joint-boss/prototype-ex-78",
    content: [
      {
        en: "Prototype EX-78 joint boss updated for October 2025 version.",
        jp: "試作機:EX-78 共同ボスが2025年10月版にアップデートされました。",
        kr: "EX-78 시범기 공동 보스가 2025년 10월 버전으로 업데이트되었습니다.",
      } as LString,
    ],
  },
  {
    date: "2025-10-23",
    title: {
      en: "The Madman's Laboratory Guild Raid",
      jp: "狂人の研究室 ギルドレイド",
      kr: "The Madman's Laboratory 길드 레이드",
    } as LString,
    type: "update",
    url: "/guides/guild-raid/madman-laboratory",
    content: [
      {
        en: "The Madman's Laboratory guild raid updated for october 2025 version.",
        jp: "狂人の研究室 ギルドレイドが2025年10月版にアップデートされました。",
        kr: "The Madman's Laboratory 길드 레이드가 2025년 10월 버전으로 업데이트되었습니다.",
      } as LString,
    ],
  },
  {
    date: "2025-10-23",
    title: {
      en: "New Hero Viella",
      jp: "新ヒーロー ビエラ",
      kr: "신규 영웅 비엘라",
    } as LString,
    type: "update",
    url: "/characters/viella",
    content: [
      {
        en: "Viella, who grants immunity to allies and increases the team's overall damage through Poison, is now underway.",
        jp: "味方に免疫を付与し、毒を通じてチーム全体のダメージを増加させるビエラが登場しました。",
        kr: "아군에게 면역을 부여하고 독을 통해 팀 전체의 데미지를 증가시키는 비엘라가 등장했습니다.",
      } as LString,
    ],
  },
  {
    date: "2025-10-21",
    title: {
      en: "Most Used Units in Guides",
      jp: "ガイドで最も使用されているユニット",
      kr: "가이드에서 가장 많이 사용되는 유닛",
    } as LString,
    type: "feature",
    url: "/most-used-unit",
    content: [
      {
        en: "🔍 **New Tool Available** – Discover which heroes are most frequently recommended across all Outerpedia guides.",
        jp: "🔍 **新ツール公開** – すべてのOuterpediaガイドで最も頻繁に推奨されているヒーローを発見しましょう。",
        kr: "🔍 **새로운 도구 출시** – 모든 Outerpedia 가이드에서 가장 자주 추천되는 영웅을 찾아보세요.",
      } as LString,
      {
        en: "🎯 Filter by category, element, class, rarity, and toggle limited units.",
        jp: "🎯 カテゴリー、属性、クラス、レアリティでフィルタリングし、限定ユニットを切り替えることができます。",
        kr: "🎯 카테고리, 속성, 클래스, 레어도로 필터링하고 한정 유닛을 전환할 수 있습니다.",
      } as LString,
      {
        en: "🆓 **Free Unit tag** now available on character pages and tier lists.",
        jp: "🆓 **無料ユニットタグ**がキャラクターページとティアリストで利用可能になりました。",
        kr: "🆓 **무료 유닛 태그**가 캐릭터 페이지와 티어 리스트에서 이용 가능합니다.",
      } as LString,
    ],
  },
  {
    date: "2025-10-15",
    title: {
      en: "Outerpedia Update – October 2025",
      jp: "Outerpediaアップデート – 2025年10月",
      kr: "Outerpedia 업데이트 – 2025년 10월",
    } as LString,
    type: "update",
    content: [
      {
        en: "A major update focused on **item pages** and **multilingual support**!",
        jp: "**アイテムページ**と**多言語対応**に焦点を当てた大型アップデート！",
        kr: "**아이템 페이지**와 **다국어 지원**에 초점을 맞춘 대형 업데이트!",
      } as LString,
      {
        en: "🌍 **Multilingual Expansion** – All item pages (Weapons, Accessories, Sets) are now fully available in **English, Japanese, and Korean**.",
        jp: "🌍 **多言語拡張** – すべてのアイテムページ（武器・アクセサリー・セット）が**英語・日本語・韓国語**に完全対応しました。",
        kr: "🌍 **다국어 확장** – 모든 아이템 페이지(무기, 액세서리, 세트)가 이제 **영어, 일본어, 한국어**로 완전히 제공됩니다.",
      } as LString,
      {
        en: "⚔️ **Equipment Overhaul** – Complete visual rework of the database pages for a cleaner, unified look.",
        jp: "⚔️ **装備リニューアル** – データベースページのデザインを全面的に一新し、より統一感のあるビジュアルに。",
        kr: "⚔️ **장비 개편** – 데이터베이스 페이지의 비주얼을 전면적으로 새롭게 개선했습니다.",
      } as LString,
    ],
  },
  {
    date: "2025-10-01",
    title: {
      en: "New Hero Summer Knight's Dream Ember",
      jp: "新ヒーロー Summer Knight's Dream Ember",
      kr: "신규 영웅 Summer Knight's Dream Ember",
    } as LString,
    type: "update",
    url: "/characters/summer-knight-s-dream-ember",
    content: [
      {
        en: "- The seasonal Limited Hero **Summer Knight's Dream Ember** has arrived in OUTERPLANE!",
        jp: "- 季節限定ヒーロー **Summer Knight's Dream Ember** がOUTERPLANEに登場！",
        kr: "- 시즌 한정 영웅 **Summer Knight's Dream Ember** 가 OUTERPLANE에 등장했습니다!",
      } as LString,
      {
        en: "- She inflicts **fixed damage on bosses** and grants **Penetration** and **Priority** buffs to her allies.",
        jp: "- ボスに**固定ダメージ**を与え、味方に**貫通**と**優先権**バフを付与します。",
        kr: "- 보스에게 **고정 피해**를 입히고 아군에게 **관통** 및 **우선권** 버프를 부여합니다.",
      } as LString,
    ],
  },
  {
    date: "2025-09-30",
    title: {
      en: "Multilingual support (WIP)",
      jp: "多言語対応（進行中）",
      kr: "다국어 지원(진행 중)",
    } as LString,
    type: "update",
    content: [
      {
        en: "- Started implementing multi-language support. A **Language** selector is now available in the header and keeps your current page when switching (en/jp/kr).",
        jp: "- 多言語対応の実装を開始しました。ヘッダーに**言語**セレクターを追加し、切り替えても現在のページを維持します（en/jp/kr）。",
        kr: "- 다국어 지원 구현을 시작했습니다. 헤더에 **언어** 선택기가 추가되었고 전환 시 현재 페이지를 유지합니다(en/jp/kr).",
      } as LString,
      {
        en: "- Initial localization is live for homepage SEO and the changelog. More pages will roll out progressively.",
        jp: "- まずはホームページのSEOと変更履歴でローカライズを公開しました。ほかのページも順次対応します。",
        kr: "- 첫 로컬라이제이션은 홈페이지 SEO와 변경 로그에 적용되었습니다. 다른 페이지도 순차적으로 적용됩니다.",
      } as LString,
      {
        en: "- Work in progress. Please report issues on Discord.",
        jp: "- 作業中のため、一部のテキストは英語のままです。問題があればDiscordでお知らせください。",
        kr: "- 작업 진행 중이므로 일부 텍스트는 아직 영어입니다. 문제는 Discord로 알려 주세요.",
      } as LString,
    ],
  },
  {
    date: "2025-09-27",
    title: "Gacha Pull Simulator & Utilities rename",
    type: "feature",
    url: "/pull-sim",
    content: [
      "- New **Gacha Pull Simulator**: simulate Rate Up, Premium, and Limited banners with the mileage system.",
      "- Renamed the **Tools** category to **Utilities** (URL stays `/tools`) and aligned page metadata for SEO."
    ],
  },
  {
    date: "2025-09-25",
    title: "Official Video",
    type: "feature",
    content: [
      "- Official YouTube videos are now embedded on character detail pages (when available).",
    ],
  },
  {
    date: "2025-09-24",
    title: "Ether Income Guide",
    type: "feature",
    url: "/guides/general-guides/ether-income",
    content: [
      "Added the **Ether Income Guide**: overview of all regular and variable sources of Ether in Outerplane, with daily, weekly, and monthly totals.",
    ]
  },
  {
    date: "2025-08-26",
    title: "Premium & Limited Guide",
    type: "feature",
    url: "/guides/general-guides/premium-limited",
    content: [
      "Added the **Premium & Limited Guide**: Quick recommendations for Premium and Limited banners.",
    ]
  },
  {
    date: "2025-08-23",
    title: "Skyward Tower Guide, Tags & Roles Filters",
    type: "feature",
    url: "/guides/skyward-tower",
    content: [
      "Added the **Skyward Tower Guide**",
      "Introduced tag filters on the character list",
      "Introduced role filters on the character list",
      "Improved character sorting and browsing with the new filters"
    ]
  },
  {
    date: "2025-08-20",
    title: "Sharable Character Filters",
    type: "feature",
    url: "/characters",
    content: [
      "- Character page filters (element, class, rarity, buffs/debuffs, etc.) are now encoded in the URL.",
      "- You can copy and share the link to directly show your filtered characters to others.",
    ],
  },
  {
    date: "2025-08-20",
    title: "Shop Guide Release",
    type: "feature",
    url: "/guides/general-guides/shop-purchase-priorities",
    content: [
      "- Outerplane **shop guide** with purchase priorities — best items to buy, what to skip, and how to spend currencies wisely.",
    ],
  },

  {
    date: "2025-08-19",
    title: "Shichifuja Update",
    type: "update",
     url: "/guides/joint-boss/shichifuja",
    content: [
      "- Joint boss Shichifuja has been updated for August 2025 version.",
    ],
  },
  {
    date: "2025-08-13",
    title: "Planetary Control Unit Guild Raid",
    type: "update",
     url: "/guides/guild-raid/planetary-control-unit",
    content: [
      "- Planetary Control Unit Guild Raid Guide release.",
    ],
  },
  {
    date: "2025-08-09",
    title: "OUTERPLANE Service Transfer to VAGAMES",
    type: "update",
    content: [
      "-  📢 <strong>Service Transfer Incoming:</strong> OUTERPLANE will transfer to <strong>VAGAMES</strong> on <strong>September 23, 2025</strong>.",
      "- Make sure to complete the transfer process to keep your account and data.",
      "- [View Transfer Procedure](/guides/service-transfer)",
    ],
  },
  {
    date: "2025-07-31",
    title: "Timegated Resources Guide",
    type: "feature",
    url: "/guides/general-guides/timegate-resource",
    content: [
      "- Complete guide to Outerplane’s timegated resources — skill books, transistones, special gear materials, and glunite sources.",
    ],
  },
  {
    date: "2025-07-29",
    title: "Revenant Dragon Harshna update",
    type: "update",
    url: "/guides/world-boss/harshna",
    content: [
      "- Guide is up to date for july 2025 version. Learn More",
    ],
  },
  {
    date: "2025-07-29",
    title: "New Hero Fran",
    type: "update",
    url: "/characters/fran",
    content: [
      "- Fran, a genius gamer who grants Counterattack to all allies and reduces all of the Unique Resource count on the target.",
    ],
  },
  {
    date: "2025-07-23",
    title: "Deep Sea Guardian Update",
    type: "update",
    url :"/guides/joint-boss/deep-sea-guardian",
    content: [
      "- Joint boss Deep Sea Guardian has been updated for July 2025 version.",
    ],
  },
  {
    date: "2025-07-16",
    title: "Dignity of the Golden Kingdom Guild Raid",
    type: "update",
    url:"/guides/guild-raid/dignity-of-the-golden-kingdom",
    content: [
      "- Dignity of the Golden Kingdom Guild Raid Guide release.",
    ],
  },
  {
    date: "2025-07-01",
    title: "Archdemon of Hubris Dahlia update",
    type: "update",
    url:"/guides/world-boss/dahlia",
    content: [
      "- Guide is up to date for july 2025 version.",
    ],
  },
  {
    date: "2025-06-24",
    title: "Tier List major change",
    type: "fix",
    content: [
      "- 1-2★ heroes were intended to be ranked separately from 3★. To improve readability and avoid confusion all 1-2★ heroes were demoted one tier to better reflect their actual performance.",
    ],
  },
  {
    date: "2025-06-24",
    title: "Annihilator Update",
    type: "update",
    url:"/guides/joint-boss/annihilator",
    content: [
      "- Joint boss Annihilator  has been updated for June 2025 version.",
    ],
  },
  {
    date: "2025-06-19",
    title: "Prevent World Alteration Guild Raid",
    type: "update",
    url:"/guides/guild-raid/prevent-world-alteration",
    content: [
      "- Prevent World Alteration Guild Raid Guide release.",
    ],
  },
  {
    date: "2025-06-17",
    title: "New Hero Liselotte",
    type: "update",
    url:"/characters/liselotte",
    content: [
      "- Liselotte, a genius magician who increases barrier and defense when an ally uses an attack that targets all enemies and fights by removing debuffs and reducing cooldowns.",
    ],
  },
  {
    date: "2025-06-15",
    title: "Character Profiles",
    type: "feature",
    content: [
      "- Character pages now include detailed profile info: birthday, height, weight, and lore.",
    ],
  },
  {
    date: "2025-06-14",
    title: "Quirk guide",
    type: "feature",
    url:"/guides/general-guides/quirk",
    content: [
      "- Learn how to efficiently enhance your heroes with the Quirk system: upgrade paths, recommended priorities, and required materials.",
    ],
  },
  {
    date: "2025-06-11",
    title: "Added base stats, gift preferences, and promo code display",
    type: "feature",
    content: [
      "-Character pages now display base stats",
      "-Gift preferences are now shown on character pages and can be used as a filter in the character list",
      "-Promo codes are now visible on the homepage (only valid ones) and fully listed on the [/coupons](/coupons) page",
    ],
  },
  {
    date: "2025-06-09",
    title: "Statistics & Combat Basics and Promotion : Monad Eva guides now available",
    type: "update",
    content: [
      "- [Statistics & Combat Basics](/guides/general-guides/stats) : Fundamental systems, mechanics, and beginner-friendly guides that apply to the entire game.",
      "- [Promotion Monad Eva](/guides/adventure-license/prom-meva) : Boss strategy guide.",
    ],
  },
  {
    date: "2025-06-04",
    title: "Walking Fortress Venion update",
    type: "update",
    url:"/guides/world-boss/venion",
    content: [
      "- Guide is up to date for june 2025 version.",
    ],
  },
  {
    date: "2025-05-30",
    title: "Hero Growth & Gear guides",
    type: "update",
    content: [
      "- [Hero Growth guide](/guides/general-guides/heroes-growth) : A complete breakdown of how to power up your heroes efficiently.",
      "- [Gear guide](guides/general-guides/gear) : A guide to gear types, upgrades, and how to make your equipment stronger.",
    ],
  },
  {
    date: "2025-05-27",
    title: "Knight of Hope Meteos guide",
    type: "update",
    url:"/guides/joint-boss/koh-meteos",
    content: [
      "- Guide update for May 2025.",
    ],
  },
  {
    date: "2025-05-26",
    title: "Adventure Guide Release",
    type: "update",
    content: [
      "- Guides are grouped by season (S1, S2, S3...) and follow the in-game progression",
      "- Spoiler-Free mode is enabled by default",
      "- You can reveal boss names and details by disabling Spoiler-Free mode",
      "- Explore now: [Adventure Guides](/guides/adventure)",
    ],
  },
  {
    date: "2025-05-25",
    title: "Guides updated: New entries in the General section",
    type: "feature",
    content: [
      "- [Banners & Mileage System](/guides/general-guides/banner-mileage) guide release.",
      "- [Daily Stamina Burn](/guides/general-guides/daily-stamina) guide release.",
    ],
  },
  {
    date: "2025-05-22",
    title: "Skill Chain Filter & Fix",
    type: "feature",
    content: [
      "- Add Skill Chain type Filter on Character page",
      "- Add Notice on Tier List PvE & PvP",
      "- Frost Legion P2 skills overview",
    ],
  },
  {
    date: "2025-05-21",
    title: "Skill Upgrade Priority",
    type: "feature",
    content: [
      "- Add Skill Upgrade Priority section in character's pages",
    ],
  },
  {
    date: "2025-05-21",
    title: "D.luna gear reco & Frost Legion Phase 1 guide",
    type: "feature",
    content: [
      "- Add gear recommandation for Demiurge Luna",
      "- Add guide for current guild raid Frost Legion Phase 1",
    ],
  },
  {
    date: "2025-05-20",
    title: "Demiurge Luna",
    type: "update",
    url:"/characters/demiurge-luna",
    content: [
      "- Demiurge Luna, a versatile Hero who deals heavy single-target damage to enemies and excels at multi-target damage is now live.",
    ],
  },
  {
    date: "2025-05-19",
    title: "Gear Usage Finder",
    type: "feature",
    url:"/gear-solver",
    content: [
      "- Unsure which character can use your gear? This tool helps you find the best match based on equipment.",
      "- This tool is still under development — results may be incomplete or imprecise. Use it as a guide, not as a final answer.",
    ],
  },
  {
    date: "2025-05-19",
    title: "Gear Usage Statistics",
    type: "feature",
    url:"/gear-usage-stats",
    content: [
      "- Discover the most recommended weapons, amulets and sets in Outerplane builds.",
    ],
  },
  {
    date: "2025-05-17",
    title: "New guide - Understanding Free Heroes & Starter Banners",
    type: "feature",
    url:"/guides/general-guides/free-heroes-start-banner",
    content: [
      "- Learn which heroes you’ll get for free in Outerplane and how to make the best choices from the Start.",
    ],
  },
  {
    date: "2025-05-16",
    title: "5★ item support",
    type: "feature",
    content: [
      "- Add 5★ items from event shop from event shop",
      "- Name and Rarity filters has been added on the Equipments Page"
    ],
  },
  {
    date: "2025-05-14",
    title: "PvP Tier List",
    type: "feature",
    content: [
      "- PvP tier list add updated with O. Nadja",
    ],
  },
  {
    date: "2025-05-14",
    title: "Adventure License ,Gear Boss & Irregular Pursuit Guides",
    type: "feature",
    content: [
      "- All Gear Boss guides are now live",
      "- All Adventure License guides are now live",
      "- All Irregular Pursuit guides are now live",
      "- Agile Respond has been added to the filters on the Characters page",
    ],
  },
  {
    date: "2025-05-07",
    title: "New hero - Nadja",
    type: "update",
    content: [
      "- Omega Nadja, who removes enemy Detonation damage and Priority increase effects, plays an important role in various boss battles and will be joining us.",
    ],
  },
  {
    date: "2025-05-05",
    title: "Add guide",
    type: "update",
    content: [
      "- Some guide were add like world boss and RGB special request",
    ],
  },
  {
    date: "2025-05-01",
    title: "Multi Select",
    type: "feature",
    content: [
      "- Add the option to select multple element, class, rarity on tier list, ee priority and character page",
    ],
  },
  {
    date: "2025-04-30",
    title: "Exclusive Equipment Priority",
    type: "feature",
    content: [
      "- Add Exclusive Equipment Priority Tier List",
      "- Add filter by Element and Class on Tier list",
    ],
  },
  {
    date: "2025-04-30",
    title: "Legal compliance update",
    type: "fix",
    content: [
      "- Added global disclaimer about intellectual property and unofficial status.",
      "- Created a dedicated `/legal` page with hosting information and takedown policy.",
      "- Confirmed the site does not collect personal data or include monetization.",
    ],
  },
  {
    date: "2025-04-29",
    title: "Filter debuff logic and 1-2 star tier list",
    type: "feature",
    content: `
  - added 1 and 2 star heroes in tier list
  - Add EE and Burst skill buff and debuff in logic when filtering heroes on https://outerpedia.com/characters page
  `
  },
  {
    date: "2025-04-28",
    title: "Website Officially Release",
    type: "update",
    content: `
  - 🎉 Outerpedia is now officially live!
  - Includes **complete Tier List**, **full character database**, and **exclusive equipment** data.
  - Optimized for **desktop and mobile** with full **PWA** support (installable as an app).
  - Fast static generation with optimized SEO, structured data, and dynamic Open Graph images.
  - Modern responsive UI powered by **Next.js 15** and **TailwindCSS**.
  - Dynamic routing for character pages, tier list tabs, and equipment listings.
  - Full CDN support for images (characters, equipment, icons) ensuring fast load times.
  - Built-in changelog page and homepage recent updates feed to track improvements.
  `
  },
  {
    date: "2025-04-28",
    title: "All character data, Tier List & SEO Improvements",
    type: "feature",
    content: `
  - Refactored Tier List page to support dynamic tabs (DPS, Support, Sustain) via URL routing (/tierlist/[tab]).
  - Implemented static _allCharacters.json generated at each build to avoid API fetch in production.
  - Improved Tier List SEO metadata dynamically per tab and globally.
  - Added dynamic OpenGraph and Twitter Card images for all character pages based on character ID.
  - Enhanced structured description on character pages combining element, class, and subclass information.
  - Added dynamic meta keywords per character for better indexing.
  - Improved SEO script (seo-check.cjs) to validate JSON integrity and image presence, executed only in development mode.
  - Improved loading and priority hints for critical images (Tier List portraits, character icons).
  `
  },
  {
    date: "2025-04-26",
    title: "SEO, Mobile & PWA Improvements",
    type: "update",
    content: `
  - Improved SEO and OpenGraph metadata across all pages.
  - Generated sitemap.xml automatically at each deployment.
  - Added manifest.json and mobile icons for PWA support.
  - Optimized mobile layouts for Home and Navigation.
  - Fixed structured data validation warnings (Search Console OK).
  `
  },
  {
    date: "2025-04-25",
    title: "Exclusive Equipment Data Complete",
    type: "update",
    content: `
  - Added all exclusive equipment **data and images** for all characters.
  - Each EE includes full metadata (name, main stat, +0/+10 effects).
  - Added **dual-stat support** for weapons and amulets (forcedMainStat with \`/\` separator).
  - Displayed **both icons and stat values** properly in tooltips and summary cards.
  - Improved **WeaponMiniCard** and **AmuletMiniCard** components to support multiple main stats with fallback icons.
  - Implemented full **VideoGame + CreativeWork** **schema.org JSON-LD** structure on /equipments.
  - Included images for all **weapons**, **amulets**, **armor sets**, **talismans**, and **exclusive equipment** in JSON-LD.
  - Varied set images dynamically (**Helmet**, **Armor**, **Gloves**, **Shoes**) for realistic representation.
  - Added **automatic URL linking** for Exclusive Equipment to character pages in structured data.
  - Unified code structure between **weapon** and **amulet** components for easier maintenance.
  - Resolved Search Console critical errors by switching to proper **VideoGame** schema.
  - Internal tools: added a **JSON-LD preview button** for development validation.
  `
  },
  {
    date: "2025-04-24",
    title: "Character Additions",
    type: "update",
    content: `
  - Added character from Christina to Ember (39 / 101).
  `
  },
  {
    date: "2025-04-24",
    title: "Character Additions & Burn Visuals",
    type: "feature",
    content: `
  - Added **Charlotte**, **Caren**, and all characters from A to B to the character database.
  - Added the skill icon (top-left corner) on burn cards to match in-game visuals.
  - Fixed misalignment in **Luna** and **Hilde** awakening displays.
  - Corrected **Charisma Bryn**'s skill placement.
  - Added Open Graph metadata for the Equipment page and icons to the Characters list.
  `
  },
  {
    date: "2025-04-23",
    title: "New Characters & Visual Enhancements",
    type: "feature",
    content: `
  - Added **Luna**, **Hilde** and **Adelie** to the character database.
  - Updated the homepage banner with a new visual and smooth CSS masking.
  - Refined the style of the "Currently Pullable" section for a cleaner layout.
  `
  },
  {
    date: "2025-04-22",
    title: "Cleanup & UI Polish for Changelog and Updates",
    type: "update",
    content: `
  - Unified visual style between homepage and /changelog for update entries.
  - Styled changelog cards with badge colors for each update type (FEATURE, FIX, UPDATE...).
  - Markdown rendering enabled for changelog entries to support lists, links and formatting.
  - Homepage "Recent Updates" section uses a timeline-style vertical layout with animated section titles.
  - Removed all STOVE news integration attempts for maintainability reasons.
  `
  },
  {
    date: "2025-04-22",
    title: "Homepage & SEO improvements, gear note rework",
    type: "update",
    content: `
  - Improved homepage SEO and added Open Graph banner for social previews.
  - Added JSON-LD metadata to character and equipment pages.
  - Simplified gear notes format and now shows icons instead of star text.
  - Fixed issues with special characters in charm names.
  - Added sitemap, robots.txt, and SEO check scripts.
  `
  },
  {
    date: "2025-04-20",
    title: "Major Data Pipeline Update",
    type: "feature",
    content: "Automated extraction and parsing of in-game data from `.bytes` files. Character JSONs are now generated with full skill info (enhancements, chain/dual effects, buffs/debuffs), exclusive equipment (`ee.json`), and recommended gear (`data/reco/`). Character data (excluding gear reco) will go live in a few days!"
  },
  {
    date: "2025-04-13",
    title: "Official Discord Server",
    type: "feature",
    content: "The official Outerpedia Discord server is now live! [Join the community](https://discord.com/invite/keGhVQWsHv) to discuss builds, report issues, suggest improvements, and receive update notifications."
  },
  {
    date: "2025-04-12",
    title: "Weapon MiniCard Tooltip",
    type: "feature",
    content: "Added a detailed tooltip on weapon hover in the Recommended Gear section of character pages."
  },
  {
    date: "2025-04-12",
    title: "Skills Disclaimer",
    type: "update",
    content: "Added a disclaimer: 'Skills are displayed here with maximum enhancements applied.'"
  },
  {
    date: "2025-04-12",
    title: "Exclusive Equipment Level Fix",
    type: "fix",
    content: "Corrected display of Exclusive Equipment levels: 'EE: Lv. 10', not 'rank 10'."
  },
  {
    date: "2025-04-11",
    title: "Initial Changelog Setup",
    type: "feature",
    content: "Created a visual changelog page and linked it in the footer. Last 10 updates are now shown on the homepage."
  },
  {
    date: "2025-04-10",
    title: "Character Page Enhancements",
    type: "update",
    content: "Added chain and dual attack effects with icons based on character element."
  },
  {
    date: "2025-04-10",
    title: "Buff/Debuff Filters",
    type: "feature",
    content: "Implemented filter interface for buffs and debuffs with AND/OR logic and icon support."
  },
  {
    date: "2025-04-09",
    title: "Basic Equipment Filters",
    type: "fix",
    content: "Filtered out exclusive gear and talismans from the Equipment page. Only basic gear is shown."
  },
  {
    date: "2025-04-08",
    title: "Armor Set Visual Cards",
    type: "feature",
    content: "Introduced visual cards for armor sets with hover effects and custom backgrounds."
  }
] as const satisfies readonly RawEntry[];

// Fonction unifiée pour accéder au changelog
export function getChangelog(lang: TenantKey, options?: { limit?: number }) {
  const entries = (oldChangelog as readonly RawEntry[]).map(e => {
    const title = resolveL(e.title, lang);
    const list = Array.isArray(e.content) ? e.content : toLines(e.content);
    const content = list.map(item => resolveL(item as LString, lang));
    return {
      date: e.date,
      title,
      type: e.type,
      content,
      url: e.url  // ✅ URL spécifique à l'entrée (optionnel)
    };
  });

  return options?.limit ? entries.slice(0, options.limit) : entries;
}

// Legacy function (deprecated - use getChangelog instead)
export function getChangelogFor(lang: TenantKey): ChangelogEntry[] {
  return getChangelog(lang);
}