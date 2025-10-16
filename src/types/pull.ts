// src/types/pull.ts
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


export interface SlugCharEntry {
  ID: string
  Fullname: string
  Fullname_jp?: string
  Fullname_kr?: string
}

export type SlugToCharMap = Record<string, SlugCharEntry>
