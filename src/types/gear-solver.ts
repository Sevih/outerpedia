export type CharacterData = {
  Fullname: string;
  Element: string;
  Rarity: number;
  Class: string;
  ID: number;
};

export type ResultEntry = {
  character: string;
  builds: string[];
  data?: CharacterData | null;
};

export type GearItem = {
  name: string;
  class?: string | string[] | null;
  mainStats?: string[];
};

export type BuildData = {
  weaponSub: { name: string; mainStat: string[] }[];
  amuletSub: { name: string; mainStat: string[] }[];
  sub: string[];
  armorSets: string[];
};

