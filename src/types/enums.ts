// Tous les types "listes fermées" utilisés dans Outerpedia

// --- ELEMENTS ---
export type ElementType =
  | 'Fire'
  | 'Water'
  | 'Earth'
  | 'Light'
  | 'Dark';

export const ELEMENTS: ElementType[] = ['Fire', 'Water', 'Earth', 'Light', 'Dark'] as const;

// --- CLASSES ---
export type ClassType =
  | 'Striker'
  | 'Defender'
  | 'Ranger'
  | 'Healer'
  | 'Mage';

export const CLASSES: ClassType[] = ['Striker', 'Defender', 'Ranger', 'Healer', 'Mage'] as const;

// --- CHAIN ---
export type ChainType =
  | 'Start'
  | 'Join'
  | 'Finish'

export const CHAIN_TYPES: ChainType[] = ['Start', 'Join', 'Finish'] as const;
export const CHAIN_TYPE_LABELS = {
  Start: 'Starter',
  Join: 'Companion',
  Finish: 'Finisher'
} as const;

// --- Ratity ---
export type RarityType =
  | 1
  | 2
  | 3

export const RARITIES: RarityType[] = [1, 2, 3] as const;

export type RoleType =
  | 'dps'
  | 'support'
  | 'sustain'

export const ROLES: RoleType[] = ['dps', 'support', 'sustain'] as const

export type SkillKey =
| 'SKT_FIRST'
| 'SKT_SECOND'
| 'SKT_ULTIMATE'
| 'SKT_CHAIN_PASSIVE'
| 'DUAL_ATTACK'
| 'EXCLUSIVE_EQUIP'

export const SKILL_SOURCES: { key: SkillKey; labelKey: string; labelCompactKey: string }[] = [
  { key: 'SKT_FIRST', labelKey: 'characters.filters.sources.skill1', labelCompactKey: 'characters.filters.sources.skill1Compact' },
  { key: 'SKT_SECOND', labelKey: 'characters.filters.sources.skill2', labelCompactKey: 'characters.filters.sources.skill2Compact' },
  { key: 'SKT_ULTIMATE', labelKey: 'characters.filters.sources.skill3', labelCompactKey: 'characters.filters.sources.skill3Compact' },
  { key: 'SKT_CHAIN_PASSIVE', labelKey: 'characters.filters.sources.chainPassive', labelCompactKey: 'characters.filters.sources.chainPassiveCompact' },
  { key: 'DUAL_ATTACK', labelKey: 'characters.filters.sources.dualAttack', labelCompactKey: 'characters.filters.sources.dualAttackCompact' },
  { key: 'EXCLUSIVE_EQUIP', labelKey: 'characters.filters.sources.exclusiveEquip', labelCompactKey: 'characters.filters.sources.exclusiveEquipCompact' },
]

// --- EQUIPMENT TYPES ---
export type EquipmentInlineType =
  | 'ee'
  | 'talisman'
  | 'weapon'
  | 'amulet'
  | 'set'

export const EQUIPMENT_INLINE_TYPES: EquipmentInlineType[] = ['ee', 'talisman', 'weapon', 'amulet', 'set'] as const
