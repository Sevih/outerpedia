/**
 * Accès aux BANNIÈRES de recrutement en cours (`data/curated/banner.json`),
 * lues en RUNTIME (R2) avec repli sur la copie committée — cf. `runtime-json.ts`.
 */
import { loadRuntimeJson } from '@/lib/data/runtime-json';
import bannersData from '@data/curated/banner.json';

/** Entrée de `data/curated/banner.json` (le `name` est un confort d'admin). */
export type RawBanner = { id: string; name: string; start: string; end: string };

const committed = bannersData as RawBanner[];

export const loadBanners = (): Promise<RawBanner[]> => loadRuntimeJson('banner.json', committed);
