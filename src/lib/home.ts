/**
 * ASSEMBLAGE DATA de la page d'accueil (serveur). Regroupe les sources déjà
 * générées/curées en view-models prêts à rendre : bannières ACTIVES (recruit),
 * codes promo ACTIFS avec récompenses résolues (coupons curés), planning de buff
 * quotidien (dérivé des posts). Aucune logique de rendu ici.
 *
 * Import statique des JSON (même choix que characters.ts / recruit.ts) : la
 * donnée est figée au build et rafraîchie au redéploiement ; le filtrage « actif »
 * se recalcule à chaque régénération ISR (24 h), et les comptes à rebours vivent
 * côté client.
 */
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { localePath } from '@/lib/navigation';
import { img } from '@/lib/images';
import {
  characterDisplayName,
  characterNamePrefix,
  getCharacter,
  slugForId,
} from '@/lib/data/characters';
import { activeBanners } from '@/lib/data/recruit';
import { getItemEntry } from '@/lib/data/item-catalog';
import type { InlineItem } from '@/components/inline/ItemInline';
import couponsData from '@data/curated/coupons.json';
import buffData from '@data/patch-notes/buff-events.json';

/** Une bannière active, prête pour `CharacterCard` + son compte à rebours. */
export interface BannerVM {
  id: string;
  name: string;
  prefix: string | null;
  element: string;
  classType: string;
  rarity: number;
  tags?: string[];
  href: string;
  /** Fin `YYYY-MM-DD` (UTC) — le countdown client la lit. */
  end: string;
}

export interface CouponReward {
  item: InlineItem;
  qty: string;
}

export interface CouponVM {
  code: string;
  start: string;
  end: string;
  rewards: CouponReward[];
}

export interface BuffScheduleEntry {
  date: string;
  type: string;
  raw: string;
}

type RawCoupon = { code: string; description: Record<string, string>; start: string; end: string };

/** Jour courant `YYYY-MM-DD` en UTC (les fenêtres actives sont en jours UTC). */
function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Bannières actives aujourd'hui, enrichies du perso. Dédupliquées par perso (un
 * même perso peut avoir deux fenêtres qui se chevauchent) et triées par rareté.
 */
export function getActiveBanners(lang: Lang): BannerVM[] {
  const today = todayUTC();
  const byId = new Map<string, BannerVM>();
  for (const b of activeBanners(today)) {
    if (byId.has(b.characterId)) continue;
    const c = getCharacter(b.characterId);
    const slug = c && slugForId(c.id);
    if (!c || !slug) continue;
    byId.set(b.characterId, {
      id: c.id,
      name: characterDisplayName(c, lang),
      prefix: characterNamePrefix(c, lang),
      element: c.element,
      classType: c.class,
      rarity: c.rarity,
      tags: c.tags,
      href: localePath(lang, `/characters/${slug}`),
      end: b.end,
    });
  }
  return [...byId.values()].sort((a, b) => b.rarity - a.rarity);
}

/** Récompense d'un coupon (clé d'item du jeu) résolue en badge inline localisé. */
function resolveReward(key: string, lang: Lang): InlineItem {
  const e = getItemEntry(key);
  if (!e) return { name: key, iconSrc: '', grade: 'normal' };
  return {
    name: lRec(e.name, lang) || e.name.en || key,
    iconSrc: e.icon ? img.item(e.icon) : '',
    grade: e.grade ?? 'normal',
    desc: e.desc ? lRec(e.desc, lang) : undefined,
  };
}

/**
 * Codes promo ACTIFS aujourd'hui (récents d'abord), récompenses résolues. Rend
 * aussi le nombre total d'actifs (pour le lien « voir les N codes »).
 */
export function getActiveCoupons(
  lang: Lang,
  limit?: number,
): { codes: CouponVM[]; activeCount: number } {
  const today = todayUTC();
  const active = (couponsData as unknown as RawCoupon[])
    .filter((c) => c.start <= today && c.end >= today)
    .sort((a, b) => b.start.localeCompare(a.start));
  const sliced = limit ? active.slice(0, limit) : active;
  const codes: CouponVM[] = sliced.map((c) => ({
    code: c.code,
    start: c.start,
    end: c.end,
    rewards: Object.entries(c.description).map(([key, qty]) => ({
      item: resolveReward(key, lang),
      qty,
    })),
  }));
  return { codes, activeCount: active.length };
}

/** Planning de buff quotidien (dérivé des posts par `get-news`). */
export function getBuffSchedule(): BuffScheduleEntry[] {
  return ((buffData as { schedule?: BuffScheduleEntry[] }).schedule ?? []).slice();
}
