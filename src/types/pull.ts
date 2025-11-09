// src/types/pull.ts
import type { WithLocalizedFields } from './common';

export type PoolType = 'regular' | 'limited' | 'premium';
export type BadgeType = 'premium' | 'limited' | 'seasonal' | 'collab' | null;

export interface Entry {
  type: PoolType;
  badge: BadgeType;
  id: string;
  name: string;
  slug: string;
  element: string;
  class: string;
  rarity: number | string; // générateur permet number OU string
}

// Type de base pour SlugCharEntry (sans variantes localisées)
export interface SlugCharEntryBase {
  ID: string
  Fullname: string
}

// Type complet avec variantes localisées pour Fullname
export type SlugCharEntry = WithLocalizedFields<SlugCharEntryBase, 'Fullname'>

export type SlugToCharMap = Record<string, SlugCharEntry>
