// src/types/createBanner-cjs.d.ts
declare module '@/lib/createBanner.cjs' {
  export type Kind = 'all' | 'premium_standard' | 'limited_rateup' | 'regular_focus';

  export type Entry = {
    type: 'regular' | 'premium' | 'limited';
    badge: 'premium' | 'limited' | 'seasonal' | 'collab' | null;
    id: string;
    name: string;
    slug: string;
    element: string;
    class: string;
    rarity: number | string;
  };

  export type DrawResult = { rarity: 1 | 2 | 3; pick: Entry | null } & Partial<{ exchanged: boolean }>;

  export type MileageStore = { get: (k: string) => number; set: (k: string, v: number) => void };

  export type Banner = {
    drawOne: (opts?: { grantMileage?: boolean }) => DrawResult;
    drawTen: (opts?: { grantMileage?: boolean }) => {
      pulls: DrawResult[];
      stats: { total: number; star3: number; star2: number; star1: number; mileageAfter: number };
    };
    getMileage: () => number;
    canExchange: () => boolean;
    exchangeForFocus: (slug?: string) => DrawResult;
  };

  export type CreateBanner = (args: {
    kind: Kind;
    focus?: string[];
    mileageStore?: MileageStore;
    mileageKeyOverride?: string;
  }) => Promise<Banner>;

  export const createBanner: CreateBanner;
}
