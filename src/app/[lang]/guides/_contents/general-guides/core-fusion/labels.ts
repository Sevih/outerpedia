/**
 * Libellés du guide « Core Fusion » — transplantés VERBATIM de la V2
 * (helpers.tsx, oracle de contenu). Titre/description dans meta.json ;
 * reviews dans reviews.ts, priorités dans priorities.ts.
 */
import type { LocalizedText } from '@contracts';

export const LABELS = {
  intro: {
    en: 'Core Fusion heroes are upgraded versions of existing characters, unlocked through the Core Fusion system. They require the original character at 5★ transcendence and 300 {I-I/Fusion-Type Core} to unlock.\nOnce unlocked, all skills start at Lv1 and can be leveled up together for 150 {I-I/Fusion-Type Core} per level, up to Lv5 (900 total). These units also have a unique Core Fusion Passive that upgrades upon reaching Lv5.\nThis guide covers unlock priorities and reviews for each Core Fusion hero.',
    jp: 'コアフュージョンヒーローは、コアフュージョンシステムで解放できる既存キャラクターの強化版です。解放には元キャラクターの5★超越と{I-I/Fusion-Type Core}300個が必要です。\n解放後、全スキルはLv1から始まり、レベルごとに{I-I/Fusion-Type Core}150個で一括レベルアップ可能（Lv5まで合計900）。これらのユニットはLv5到達時に強化される固有のコアフュージョンパッシブも持っています。\n本ガイドでは解放優先順位と各ヒーローのレビューを紹介します。',
    kr: '코어 퓨전 영웅은 코어 퓨전 시스템을 통해 해금할 수 있는 기존 캐릭터의 강화 버전입니다. 해금에는 원본 캐릭터의 5★ 초월과 {I-I/Fusion-Type Core} 300개가 필요합니다.\n해금 후 모든 스킬은 Lv1에서 시작하며, 레벨당 {I-I/Fusion-Type Core} 150개로 일괄 레벨업 가능합니다 (Lv5까지 총 900). 이 유닛들은 Lv5 도달 시 강화되는 고유 코어 퓨전 패시브도 보유합니다.\n이 가이드에서는 해금 우선순위와 각 영웅의 리뷰를 다룹니다.',
    zh: '核心融合英雄是通过核心融合系统解锁的现有角色强化版。解锁需要原角色达到5★超越并消耗300个{I-I/Fusion-Type Core}。\n解锁后所有技能从Lv1开始，每级消耗150个{I-I/Fusion-Type Core}统一升级，最高Lv5（共计900）。这些单位还拥有在达到Lv5时强化的独特核心融合被动。\n本指南涵盖解锁优先级和每位英雄的评测。',
    fr: "Les Héros Core Fusion sont des versions améliorées de personnages existants, débloquées via le système Core Fusion. Ils nécessitent le personnage original à la transcendance 5★ et 300 {I-I/Fusion-Type Core} pour être débloqués.\nUne fois débloqués, tous les skills commencent au Lv1 et peuvent être level up ensemble pour 150 {I-I/Fusion-Type Core} par niveau, jusqu'au Lv5 (900 au total). Ces unités ont aussi un Core Fusion Passive unique qui s'améliore en atteignant le Lv5.\nCe guide couvre les priorités de déblocage et les reviews pour chaque Héros Core Fusion.",
  },

  unlockPriority: {
    en: 'Unlock Priority',
    jp: '解放優先順位',
    kr: '해금 우선순위',
    zh: '解锁优先级',
    fr: 'Priorité de Déblocage',
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

  recommendedLevel: {
    en: 'Recommended Level',
    jp: '推奨レベル',
    kr: '추천 레벨',
    zh: '推荐等级',
    fr: 'Niveau Recommandé',
  },

  skillChanges: {
    en: 'Skill Changes',
    jp: 'スキル変更',
    kr: '스킬 변경',
    zh: '技能变更',
    fr: 'Changements de Skill',
  },

  fusionPassive: {
    en: 'Fusion Passive',
    jp: 'フュージョンパッシブ',
    kr: '퓨전 패시브',
    zh: '融合被动',
    fr: 'Fusion Passive',
  },

  transcendence: {
    en: 'Transcendence Bonus',
    jp: '超越ボーナス',
    kr: '초월 보너스',
    zh: '超越奖励',
    fr: 'Bonus de Transcendance',
  },

  exclusiveEquipment: {
    en: 'Exclusive Equipment',
    jp: '専用装備',
    kr: '전용 장비',
    zh: '专属装备',
    fr: 'Exclusive Equipment',
  },

  oldEE: {
    en: 'Base',
    jp: '通常',
    kr: '기본',
    zh: '基础',
    fr: 'Base',
  },

  newEE: {
    en: 'Core Fusion',
    jp: 'コアフュージョン',
    kr: '코어 퓨전',
    zh: '核心融合',
    fr: 'Core Fusion',
  },
} as const satisfies Record<string, LocalizedText>;
