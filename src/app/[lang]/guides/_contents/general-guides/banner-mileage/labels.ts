/**
 * Libellés du guide « Banners & Mileage » — transplantés VERBATIM de la V2
 * (oracle de contenu). Les TAUX, COÛTS et la liste des limited ne vivent plus
 * ici : ils sont GÉNÉRÉS (recruit.json) ; ne restent que l'éditorial (intros,
 * descriptions de bannières, avertissements) et le marqueur {star}.
 */
import type { LocalizedText } from '@contracts';

export const LABELS = {
  intro: {
    en: 'Understand the banner types and the mileage system in Outerplane to optimize your summons.',
    jp: 'Outerplaneのバナータイプとマイレージシステムを理解して、召喚を最適化しましょう。',
    kr: 'Outerplane의 배너 유형과 마일리지 시스템을 이해하고 소환을 최적화하세요.',
    zh: '了解异域战记中的卡池类型和指定招募系统以优化您的抽取',
    fr: 'Comprenez les types de Banner et le système de Mileage dans Outerplane pour optimiser vos pulls.',
  },

  // ── Introduction paragraphs ──

  intro_p1: {
    en: 'Like most gacha games, Outerplane features a recruitment system with multiple banners, each using different types of resources. This guide explains how banners and the mileage system work in Outerplane.',
    jp: '多くのガチャゲームと同様に、Outerplaneには複数のバナーを持つ募集システムがあり、それぞれ異なるリソースを使用します。このガイドでは、バナーとマイレージシステムの仕組みを説明します。',
    kr: '대부분의 가챠 게임처럼, Outerplane에는 여러 배너를 가진 모집 시스템이 있으며, 각 배너는 서로 다른 재화를 사용합니다. 이 가이드에서는 배너와 마일리지 시스템의 작동 방식을 설명합니다.',
    zh: '与大多数抽卡游戏一样，异域战记拥有多个卡池的招募系统，每个卡池使用不同的资源。本指南将介绍卡池和指定招募系统的运作方式。',
    fr: 'Comme la plupart des jeux gacha, Outerplane propose un système de recrutement avec plusieurs banners, chacune utilisant différents types de ressources. Ce guide explique le fonctionnement des banners et du système de mileage dans Outerplane.',
  },

  intro_p2_before: {
    en: 'Outerplane uses a ',
    jp: 'Outerplaneは',
    kr: 'Outerplane은 ',
    zh: 'Outerplane采用',
    fr: 'Outerplane utilisé un ',
  },
  intro_p2_highlight: {
    en: 'mileage system',
    jp: 'マイレージシステム',
    kr: '마일리지 시스템',
    zh: '指定招募系统',
    fr: 'système de mileage',
  },
  intro_p2_mid: {
    en: '. Unlike pity counters, mileage allows you to',
    jp: 'を採用しています。天井カウンターとは異なり、マイレージは必要なポイントを集めると',
    kr: '을 사용합니다. 천장 카운터와 달리, 마일리지는 필요한 포인트를 모으면',
    zh: '。与保底计数不同，指定招募允许你在积累足够点数后',
    fr: ". Contrairement aux compteurs de pity, le mileage vous permet d'",
  },
  intro_p2_bold: {
    en: ' directly obtain',
    jp: 'ピックアップヒーローを直接獲得',
    kr: ' 픽업 영웅을 직접 획득',
    zh: '直接获取',
    fr: 'obtenir directement',
  },
  intro_p2_after: {
    en: " the featured unit once you've gathered enough points.",
    jp: 'できます。',
    kr: '할 수 있습니다.',
    zh: 'UP同伴。',
    fr: " l'unité mise en avant une fois que vous avez rassemblé suffisamment de points.",
  },

  intro_p3_before: {
    en: 'Each recruit ',
    jp: '各募集',
    kr: '각 모집',
    zh: '每次招募',
    fr: 'Chaque Recruit ',
  },
  intro_p3_bold: {
    en: '(except those using event tickets)',
    jp: '（イベントチケットを除く）',
    kr: '(이벤트 티켓 제외)',
    zh: '（活动券除外）',
    fr: "(sauf ceux utilisant des tickets d'événement)",
  },
  intro_p3_after: {
    en: ' grants 1 mileage. Once you reach the required amount, you can exchange your mileage for the banner unit.',
    jp: 'でマイレージが1加算されます。必要数に達すると、マイレージをバナーヒーローと交換できます。',
    kr: '마다 마일리지가 1 적립됩니다. 필요 수량에 도달하면 마일리지를 배너 영웅과 교환할 수 있습니다.',
    zh: '可获得1点点数。达到所需数量后，可指定招募卡池同伴。',
    fr: " rapporte 1 mileage. Une fois la quantité requise atteinte, vous pouvez échanger votre mileage contre l'unité de la banner.",
  },

  intro_p4_before: {
    en: 'One major advantage of this system is that ',
    jp: 'このシステムの大きな利点は、',
    kr: '이 시스템의 큰 장점은 ',
    zh: '此系统的一大优势是',
    fr: 'Un avantage majeur de ce système est que le ',
  },
  intro_p4_bold1: {
    en: 'mileage is retained',
    jp: 'マイレージがバナー間で引き継がれる',
    kr: '마일리지가 배너 간에 유지',
    zh: '点数在卡池间保留',
    fr: 'mileage est conservé',
  },
  intro_p4_mid: {
    en: ' across banners.',
    jp: 'ことです。',
    kr: '된다는 것입니다.',
    zh: '。',
    fr: ' entre les banners.',
  },
  intro_p4_why: {
    en: 'Why is that useful?',
    jp: 'これが便利な理由は？',
    kr: '이것이 유용한 이유는?',
    zh: '这有什么用？',
    fr: 'En quoi est-ce utile ?',
  },
  intro_p4_scenario: {
    en: "Imagine you do a 10-recruit, get the unit, and also hit the mileage cap. If you're pulling for collection, you can ",
    jp: '10連募集でヒーローを獲得し、同時にマイレージ上限に達したとします。コレクション目的で引いている場合、',
    kr: '10연 모집에서 영웅을 획득하고 동시에 마일리지 상한에 도달했다고 가정해 봅시다. 수집 목적으로 뽑고 있다면, ',
    zh: '假设您满足指定招募的最后10连抽到了同伴。如果是为了收集，便可以',
    fr: "Imaginez que vous fassiez un Recruit x 10, obteniez l'unité et atteigniez aussi le plafond de mileage. Si vous faites des pulls pour la collection, vous pouvez ",
  },
  intro_p4_bold2: {
    en: 'save your mileage',
    jp: 'マイレージを温存',
    kr: '마일리지를 저장',
    zh: '保留点数',
    fr: 'conserver votre mileage',
  },
  intro_p4_end: {
    en: " for a future banner with a unit you're more interested in — or just keep it to secure your next target more efficiently.",
    jp: 'してより興味のあるヒーローの将来のバナーに使用したり、次の目標をより効率的に確保できます。',
    kr: '해서 더 관심 있는 영웅의 미래 배너에 사용하거나, 다음 목표를 더 효율적으로 확보할 수 있습니다.',
    zh: '用于未来更感兴趣的同伴卡池，高效地保证下一个目标。',
    fr: ' pour une future banner avec une unité qui vous intéresse davantage, ou simplement le garder pour sécuriser votre prochaine cible plus efficacement.',
  },

  // ── Banner tabs ──

  pickup: {
    label: {
      en: 'Custom Rate Up',
      jp: 'カスタムピックアップ',
      kr: '커스텀 픽업',
      zh: '自选UP',
      fr: 'Custom Rate Up',
    },
    heading: {
      en: 'Custom Rate Up Banner',
      jp: 'カスタムピックアップ募集',
      kr: '커스텀 픽업 모집',
      zh: '自选UP招募',
      fr: 'Custom Rate Up Banner',
    },
    specialFeature: {
      en: 'Using Recruit x 10 guarantees at least one 2★ hero',
      jp: '10連募集で2★以上のヒーローが1体以上確定',
      kr: '10연 모집 시 2★ 이상 영웅 1체 이상 확정',
      zh: '10连招募保底至少1个2★以上英雄',
      fr: 'Utiliser Recruit x 10 garantit au moins un Héros 2★',
    },
    desc: {
      en: 'This banner is always available. You can choose up to 3 characters to force the drop rate of those.',
      jp: 'このバナーは常設です。最大3体のキャラクターを選択してピックアップ対象にできます。',
      kr: '이 배너는 상시 운영됩니다. 최대 3명의 캐릭터를 선택하여 픽업 대상으로 지정할 수 있습니다.',
      zh: '此卡池常驻开放。你可以选择最多3个角色作为UP目标。',
      fr: "Cette banner est toujours disponible. Vous pouvez choisir jusqu'à 3 personnages pour forcer leur taux de drop.",
    },
    example_label: { en: 'Example:', jp: '例：', kr: '예시:', zh: '例如：', fr: 'Exemple :' },
    example_before: {
      en: ' If you select ',
      jp: ' ',
      kr: ' ',
      zh: ' 选择',
      fr: ' Si vous sélectionnez ',
    },
    example_after: {
      en: ", you can't drop another 3{star} except for those 3.",
      jp: 'を選択すると、3{star}はこの3体以外排出されません。',
      kr: '를 선택하면 이 3명 외에는 3{star}가 배출되지 않습니다.',
      zh: '后，3{star}只会出这3个角色。',
      fr: ", vous ne pouvez pas obtenir d'autres 3{star} en dehors de ces 3.",
    },
    warning: {
      en: "It's not recommended to use Ether on this banner",
      jp: 'このバナーでエーテルを使用することは推奨されません',
      kr: '이 배너에서 에테르 사용은 권장되지 않습니다',
      zh: '不建议在此卡池使用以太',
      fr: "Il n'est pas recommandé d'utiliser de l'Ether sur cette banner",
    },
  },

  rateup: {
    label: {
      en: 'Rate Up Banner',
      jp: 'ピックアップ募集',
      kr: '픽업 모집',
      zh: 'UP招募',
      fr: 'Rate Up Banner',
    },
    heading: {
      en: 'Rate Up Banner',
      jp: 'ピックアップ募集',
      kr: '픽업 모집',
      zh: 'UP招募',
      fr: 'Rate Up Banner',
    },
    specialFeature: {
      en: 'Using Recruit x 10 guarantees at least one 2★ hero',
      jp: '10連募集で2★以上のヒーローが1体以上確定',
      kr: '10연 모집 시 2★ 이상 영웅 1체 이상 확정',
      zh: '10连招募保底至少1个2★以上英雄',
      fr: 'Utiliser Recruit x 10 garantit au moins un Héros 2★',
    },
    desc: {
      en: 'This banner is temporary and usually lasts ',
      jp: 'このバナーは期間限定で、通常',
      kr: '이 배너는 기간 한정으로, 보통 ',
      zh: '此卡池为限时开放，通常持续',
      fr: 'Cette banner est temporaire et dure généralement ',
    },
    desc_duration: { en: '2 weeks', jp: '2週間', kr: '2주간', zh: '2周', fr: '2 semaines' },
    desc_after: { en: '.', jp: '開催されます。', kr: ' 운영됩니다.', zh: '。', fr: '.' },
    warning: {
      en: "It's not recommended to use Ether on this banner",
      jp: 'このバナーでエーテルを使用することは推奨されません',
      kr: '이 배너에서 에테르 사용은 권장되지 않습니다',
      zh: '不建议在此卡池使用以太',
      fr: "Il n'est pas recommandé d'utiliser de l'Ether sur cette banner",
    },
  },

  premium: {
    label: {
      en: 'Premium Banner',
      jp: 'プレミアム募集',
      kr: '프리미엄 모집',
      zh: '精选招募',
      fr: 'Premium Banner',
    },
    heading: {
      en: 'Premium Banner',
      jp: 'プレミアム募集',
      kr: '프리미엄 모집',
      zh: '精选招募',
      fr: 'Premium Banner',
    },
    subtext: {
      en: 'Demiurge heroes have about half the drop rate of regular off-banner heroes',
      jp: 'デミウルゴスヒーローの排出率は通常の3★の約半分です',
      kr: '데미우르고스 영웅의 배출 확률은 일반 비픽업 3★의 약 절반입니다',
      zh: '创世之神同伴的掉率约为普通非UP 3★同伴的一半',
      fr: 'Les Héros Demiurge ont environ la moitié du taux de drop des Héros off-banner habituels',
    },
    desc_bold: {
      en: 'Permanent banner',
      jp: '常設バナー',
      kr: '상시 배너',
      zh: '常驻卡池',
      fr: 'Banner permanente',
    },
    desc: {
      en: ' - The only regular way (besides events like Demiurge Contract) to get Demiurge Heroes.',
      jp: ' - デミウルゴスヒーローを獲得できる唯一の通常手段です（デミウルゴス契約などのイベントを除く）。',
      kr: ' - 데미우르고스 영웅을 획득할 수 있는 유일한 일반적인 방법입니다 (데미우르고스 계약 등의 이벤트 제외).',
      zh: ' - 是获取创世之神同伴的唯一常规途径（除创世之神契约等活动外）。',
      fr: " - Le seul moyen régulier (en dehors des événements comme le Demiurge Contract) d'obtenir des Demiurge Heroes.",
    },
    note: {
      en: 'These heroes are extremely powerful but also very rare. Demiurge heroes benefit more from transcendence overall, but some are strong right from base 3{star}.',
      jp: 'これらのヒーローは非常に強力ですが、排出率も非常に低いです。デミウルゴスヒーローは超越の恩恵が大きいですが、3{star}の状態でも強力なヒーローもいます。',
      kr: '이 영웅들은 매우 강력하지만 배출 확률도 매우 낮습니다. 데미우르고스 영웅은 초월의 효과가 크지만, 기본 3{star}에서도 강력한 영웅들이 있습니다.',
      zh: '这些同伴非常强力但掉率极低：她们的超越获益更多，部分在基础3{star}时就很强。',
      fr: 'Ces Héros sont extrêmement puissants mais aussi très rares. Les Héros Demiurge bénéficient davantage de la transcendance, mais certains sont forts dès leur version de base 3{star}.',
    },
  },

  limited: {
    label: {
      en: 'Limited Banner',
      jp: '限定募集',
      kr: '한정 모집',
      zh: '限定招募',
      fr: 'Limited Banner',
    },
    heading: {
      en: 'Limited Banner',
      jp: '限定募集',
      kr: '한정 모집',
      zh: '限定招募',
      fr: 'Limited Banner',
    },
    specialFeature: {
      en: 'Using Recruit x 10 guarantees at least one 2★ hero',
      jp: '10連募集で2★以上のヒーローが1体以上確定',
      kr: '10연 모집 시 2★ 이상 영웅 1체 이상 확정',
      zh: '10连招募保底至少1个2★以上英雄',
      fr: 'Utiliser Recruit x 10 garantit au moins un Héros 2★',
    },
    desc_bold: {
      en: 'Temporary banner',
      jp: '期間限定バナー',
      kr: '기간 한정 배너',
      zh: '限时卡池',
      fr: 'Banner temporaire',
    },
    desc: {
      en: ' - The only way to obtain Limited Heroes.',
      jp: ' - 限定ヒーローを獲得できる唯一の手段です。',
      kr: ' - 한정 영웅을 획득할 수 있는 유일한 방법입니다.',
      zh: ' - 是获取限定同伴的唯一途径。',
      fr: " - Le seul moyen d'obtenir les Limited Heroes.",
    },
    // « Festival » : le terme du jeu pour le tag `limited` (cf. tags V2 —
    // « Festival Units ») ; « Limited » désignait à tort toute la catégorie.
    type_limited_label: {
      en: 'Festival:',
      jp: 'フェス:',
      kr: '페스티벌:',
      zh: '限定:',
      fr: 'Festival :',
    },
    type_limited_desc: {
      en: 'Classic time-limited heroes',
      jp: '期間限定の通常ヒーロー',
      kr: '기간 한정 일반 영웅',
      zh: '常规限时同伴',
      fr: 'Héros classiques à durée limitée',
    },
    type_seasonal_label: {
      en: 'Seasonal:',
      jp: 'シーズン:',
      kr: '시즌:',
      zh: '季节：',
      fr: 'Seasonal :',
    },
    type_seasonal_desc: {
      en: 'Heroes tied to yearly events like Halloween or Christmas',
      jp: 'ハロウィンやクリスマスなどの季節イベントに関連するヒーロー',
      kr: '할로윈, 크리스마스 등 시즌 이벤트 관련 영웅',
      zh: '与万圣节、圣诞节等年度活动相关的同伴',
      fr: 'Héros liés aux événements annuels comme Halloween ou Noël',
    },
    type_collab_label: { en: 'Collab:', jp: 'コラボ:', kr: '콜라보:', zh: '联动:', fr: 'Collab :' },
    type_collab_desc: {
      en: 'Heroes from crossovers with other licenses (least likely to return)',
      jp: '他作品とのコラボヒーロー。復刻の可能性が最も低い',
      kr: '다른 작품과의 콜라보 영웅. 복각 가능성이 가장 낮음',
      zh: '与其他作品联动的同伴，复刻可能性最低',
      fr: "Héros issus de crossovers avec d'autres licences (les moins susceptibles de revenir)",
    },
    duration_before: {
      en: 'This banner typically runs for ',
      jp: 'このバナーは通常',
      kr: '이 배너는 보통 ',
      zh: '此卡池通常持续',
      fr: 'Cette banner dure généralement ',
    },
    duration_value: {
      en: '2 to 4 weeks',
      jp: '2〜4週間',
      kr: '2~4주간',
      zh: '2至4周',
      fr: '2 à 4 semaines',
    },
    duration_after: {
      en: '. Like Demiurge heroes, Limited units are (usually) extremely powerful, with their strongest abilities unlocking at high transcendence levels.',
      jp: '開催されます。デミウルゴスヒーローと同様に、限定ヒーローは（通常）非常に強力で、高い超越レベルで最強の能力が解放されます。',
      kr: ' 운영됩니다. 데미우르고스 영웅과 마찬가지로, 한정 영웅은 (대체로) 매우 강력하며, 높은 초월 단계에서 가장 강력한 능력이 해금됩니다.',
      zh: '。与创世之神同伴类似，限定同伴（通常）非常强力。其最强能力在最高超越等级解锁。',
      fr: '. Comme les Demiurge Heroes, les unités Limited sont (en général) extrêmement puissantes, leurs capacités les plus fortes se débloquant à un niveau de transcendance élevé.',
    },
    heroes_list_title: {
      en: 'List of Limited Heroes and their release dates:',
      jp: '限定ヒーロー一覧とリリース日:',
      kr: '한정 영웅 목록 및 출시일:',
      zh: '限定列表列表及发布日期:',
      fr: 'Liste des Limited Heroes et leurs dates de sortie :',
    },
    ticket_note: {
      en: "This item exists but hasn't been used yet",
      jp: 'このアイテムは存在しますがまだ使用されていません',
      kr: '이 아이템은 존재하지만 아직 사용된 적 없음',
      zh: '此道具存在但尚未使用过',
      fr: "Cet objet existe mais n'a pas encore été utilisé",
    },
  },
};

/** Vérification de forme : chaque feuille est un LocalizedText. */
type Leaf = LocalizedText;
type _Check = typeof LABELS extends Record<string, Leaf | Record<string, Leaf>> ? true : never;
const _check: _Check = true;
void _check;
