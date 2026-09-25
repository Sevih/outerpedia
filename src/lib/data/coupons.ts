/**
 * Accès aux CODES PROMO (`data/curated/coupons.json`), lus en RUNTIME (R2) avec
 * repli sur la copie committée — cf. `runtime-json.ts`.
 */
import { loadRuntimeJson } from '@/lib/data/runtime-json';
import couponsData from '@data/curated/coupons.json';

export type RawCoupon = {
  code: string;
  description: Record<string, string>;
  start: string;
  end: string;
};

const committed = couponsData as unknown as RawCoupon[];

export const loadCoupons = (): Promise<RawCoupon[]> => loadRuntimeJson('coupons.json', committed);
