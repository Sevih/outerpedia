/**
 * Données ÉDITORIALES du guide heroes-growth — la part NON dérivable de la data
 * de jeu (vérifié : pas de table favor/present→points, pas de table de paliers
 * d'affinité, effets de transcendance non structurés). Transplant V2.
 */
import type { LocalizedText } from '@contracts';

/** Paliers de gifts d'affinité : items exemples → points (+ bonus si préféré). */
export interface GiftTier {
  items: string[];
  points: number;
  bonus: number;
}
export const AFFINITY_GIFTS: GiftTier[] = [
  {
    items: ['USB Drive', "Collector's Coin", 'Mana Potion', 'Paper Crane', 'Berry'],
    points: 100,
    bonus: 50,
  },
  {
    items: ['Portable Gaming Device', 'Elegant Teacup', 'Fay Dust', 'Crystal Orb', 'Wildflower'],
    points: 200,
    bonus: 100,
  },
  {
    items: [
      'Smartphone',
      'Decorative Chest Armor',
      "Witch's Cauldron",
      'Lion Statue',
      "Phantom Bird's Egg",
    ],
    points: 500,
    bonus: 250,
  },
  {
    items: [
      'Dungeon Core Fragment',
      "Noble's Ceremonial Sword",
      'Magic Textbook',
      'Dreamcatcher',
      'Leaf of World Tree',
    ],
    points: 1000,
    bonus: 500,
  },
];

/** Paliers de récompense d'affinité (niveau → type de récompense). */
export interface AffinityReward {
  level: number;
  reward: 'stats' | 'chat';
}
export const AFFINITY_REWARDS: AffinityReward[] = [
  { level: 20, reward: 'stats' },
  { level: 30, reward: 'chat' },
  { level: 40, reward: 'stats' },
  { level: 60, reward: 'stats' },
  { level: 70, reward: 'chat' },
  { level: 80, reward: 'stats' },
  { level: 100, reward: 'stats' },
];

/**
 * Étapes de transcendance (3★→6★). Chaque étape donne un bonus de stat de base
 * (ATK/DEF/HP) ; certaines débloquent un effet spécial. `effect` absent = stat
 * de base seule.
 */
export interface TranscendStep {
  step: string;
  effect?: LocalizedText;
}
export const TRANSCENDENCE_STEPS: TranscendStep[] = [
  { step: '1' },
  { step: '2' },
  {
    step: '3',
    effect: {
      en: 'Burst 2 unlocked',
      jp: 'バースト2解放',
      kr: '버스트 2 해금',
      zh: '爆发2解锁',
      fr: 'Burst 2 débloqué',
    },
  },
  {
    step: '4',
    effect: {
      en: '1★/2★ gain a self-stat, 3★ gains a team-stat. All gain +1 Chain Passive Weakness Gauge Damage.',
      jp: '1★/2★は自己ステータス、3★はチームステータスを獲得。全員が+1チェーンパッシブ弱点ゲージダメージを獲得。',
      kr: '1★/2★는 자기 스탯, 3★는 팀 스탯 획득. 모두 +1 체인 패시브 약점 게이지 데미지 획득.',
      zh: '1★/2★获得自身属性，3★获得团队属性。全员获得+1连锁被动弱点槽伤害。',
      fr: '1★/2★ gagnent un self-stat, 3★ un team-stat. Tous gagnent +1 dégâts Chain Passive Weakness Gauge.',
    },
  },
  { step: '4+' },
  {
    step: '5',
    effect: {
      en: 'Burst 3 unlocked',
      jp: 'バースト3解放',
      kr: '버스트 3 해금',
      zh: '爆发3解锁',
      fr: 'Burst 3 débloqué',
    },
  },
  { step: '5+' },
  { step: '5++' },
  {
    step: '6',
    effect: {
      en: '1★/2★ gain a self-stat improvement, 3★ gains a team-stat improvement. All gain +25 Action Points at battle start.',
      jp: '1★/2★は自己ステータス強化、3★はチームステータス強化を獲得。全員がバトル開始時に+25アクションポイントを獲得。',
      kr: '1★/2★는 자기 스탯 강화, 3★는 팀 스탯 강화 획득. 모두 전투 시작 시 +25 행동 포인트 획득.',
      zh: '1★/2★获得自身属性强化，3★获得团队属性强化。全员在战斗开始时获得+25行动点。',
      fr: '1★/2★ gagnent une amélioration de self-stat, 3★ une amélioration de team-stat. Tous gagnent +25 Action Points en début de combat.',
    },
  },
];
