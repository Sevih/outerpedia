/**
 * Libellés du guide « Premium & Limited » — transplantés VERBATIM de la V2
 * (helpers.tsx, oracle de contenu). Titre/description dans meta.json ; les
 * reviews et priorités dans reviews.ts / priorities.ts.
 */
import type { LocalizedText } from '@contracts';

export const LABELS = {
  intro: {
    en: 'Quick recommendations for Premium and Limited banners. See PvE/PvP targets and the key transcendence sweetspots (3★→6★) for each hero.',
    jp: 'プレミアムおよび限定バナーのおすすめガイド。各ヒーローのPvE/PvP目標と重要な超越スイートスポット（3★→6★）をご覧ください。',
    kr: '프리미엄 및 한정 배너 추천 가이드입니다. 각 영웅의 PvE/PvP 목표와 주요 초월 스위트스팟(3★→6★)을 확인하세요.',
    zh: '高级和限定卡池快速推荐指南。查看每位英雄的PvE/PvP目标和关键超越甜点（3★→6★）。',
    fr: 'Recommandations rapides pour les Premium et Limited Banners. Consultez les cibles PvE/PvP et les sweetspots de transcendance clés (3★→6★) pour chaque Héros.',
  },

  recommendedChoices: {
    en: 'Recommended Choices',
    jp: 'おすすめの選択',
    kr: '추천 선택',
    zh: '推荐选择',
    fr: 'Choix Recommandés',
  },

  priority1st: {
    en: '1st Priority',
    jp: '第1優先',
    kr: '1순위',
    zh: '第一优先',
    fr: '1ère Priorité',
  },

  priority2nd: {
    en: '2nd Priority',
    jp: '第2優先',
    kr: '2순위',
    zh: '第二优先',
    fr: '2e Priorité',
  },

  priority3rd: {
    en: '3rd Priority',
    jp: '第3優先',
    kr: '3순위',
    zh: '第三优先',
    fr: '3e Priorité',
  },

  collabNote: {
    en: 'Collab heroes are shown translucent: their tier shows where they would land, but they are not an actual choice on this banner.',
    jp: 'コラボヒーローは半透明で表示されます。順位は本来の位置を示していますが、このバナーでは実際の選択肢ではありません。',
    kr: '콜라보 영웅은 반투명으로 표시됩니다. 순위는 원래 위치를 나타내지만, 이 배너에서는 실제 선택지가 아닙니다.',
    zh: '联动英雄以半透明显示：其优先级表示他们本应所处的位置，但在此卡池中并非实际可选。',
    fr: 'Les Héros de collab sont affichés en translucide : leur palier indique où ils se situeraient, mais ils ne sont pas un choix réel sur cette bannière.',
  },

  transcendPriority: {
    en: 'Transcendence Priority',
    jp: '超越優先順位',
    kr: '초월 우선순위',
    zh: '超越优先级',
    fr: 'Priorité de Transcendance',
  },

  transcendFocusNote: {
    en: 'Focus on transcending these heroes first for maximum impact.',
    jp: '最大の効果を得るため、まずこれらのヒーローの超越を優先してください。',
    kr: '최대 효과를 위해 이 영웅들의 초월을 먼저 집중하세요.',
    zh: '为获得最大效果，请优先超越这些英雄。',
    fr: 'Priorisez la transcendance de ces Héros en premier pour un impact maximal.',
  },

  recommendedTargets: {
    en: 'Recommended targets',
    jp: '推奨目標',
    kr: '추천 목표',
    zh: '推荐目标',
    fr: 'Cibles recommandées',
  },

  transcendImpact: {
    en: 'Transcendence impact',
    jp: '超越の影響',
    kr: '초월 영향',
    zh: '超越影响',
    fr: 'Impact de la transcendance',
  },

  colStar: {
    en: '★',
    jp: '★',
    kr: '★',
    zh: '★',
    fr: '★',
  },
} as const satisfies Record<string, LocalizedText>;
