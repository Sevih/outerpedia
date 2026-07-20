/**
 * ASSEMBLAGE DATA de la page d'accueil (serveur). Regroupe les sources déjà
 * générées/curées en view-models prêts à rendre : bannières ACTIVES (curées),
 * codes promo ACTIFS avec récompenses résolues (coupons curés), planning de buff
 * quotidien (dérivé des posts). Aucune logique de rendu ici.
 *
 * Import statique des JSON (même choix que characters.ts / recruit.ts) : la
 * donnée est figée au build et rafraîchie au redéploiement ; le filtrage « actif »
 * se recalcule à chaque régénération ISR, et les comptes à rebours vivent côté
 * client. EXCEPTION coupons : lus au RUNTIME depuis R2 (cf. `loadCoupons`) pour
 * qu'un code poussé paraisse sans redéploiement — l'import committé reste le repli.
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
import { getItemEntry } from '@/lib/data/item-catalog';
import type { InlineItem } from '@/components/inline/ItemInline';
import bannersData from '@data/curated/banner.json';
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
/** Entrée de `data/curated/banner.json` (le `name` est un confort d'admin). */
type RawBanner = { id: string; name: string; start: string; end: string };

const IMG_BASE = process.env.NEXT_PUBLIC_IMG_BASE ?? '';

/**
 * Charge les coupons. En prod : la COPIE RUNTIME hébergée sur R2
 * (`data/coupons.json`, publiée par la sauvegarde admin — cf.
 * `lib/admin/coupons-publish`), lue à la requête avec revalidation — un code
 * poussé apparaît SANS redéploiement (patron du manifeste comics, décision
 * Sevih 20/07). En dev (base vide) ou si R2 est injoignable : repli sur la
 * donnée committée. Le `revalidate` de 600 s abaisse d'office l'ISR des pages
 * consommatrices (home, /coupons) à 10 min — c'est voulu, c'est la fraîcheur.
 */
async function loadCoupons(): Promise<RawCoupon[]> {
  if (IMG_BASE) {
    try {
      const res = await fetch(`${IMG_BASE}/data/coupons.json`, { next: { revalidate: 600 } });
      if (res.ok) return (await res.json()) as RawCoupon[];
    } catch {
      /* R2 injoignable → repli committé */
    }
  }
  return couponsData as unknown as RawCoupon[];
}

/** Jour courant `YYYY-MM-DD` en UTC (les fenêtres actives sont en jours UTC). */
function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Bannières actives aujourd'hui, enrichies du perso. Source = le fichier CURÉ
 * (`/admin/tools/banners`), PAS `recruit.json` : les patch notes tombent 24-48 h
 * avant la mise à jour du jeu, la curation permet de pré-saisir une bannière
 * que les tables n'ont pas encore (le généré reste la source des guides —
 * historique release/rerun des limited). Dédupliquées par perso (un même perso
 * peut avoir deux fenêtres qui se chevauchent) et triées par rareté.
 */
export function getActiveBanners(lang: Lang): BannerVM[] {
  const today = todayUTC();
  const byId = new Map<string, BannerVM>();
  for (const b of (bannersData as RawBanner[]).filter((b) => b.start <= today && b.end >= today)) {
    if (byId.has(b.id)) continue;
    const c = getCharacter(b.id);
    const slug = c && slugForId(c.id);
    if (!c || !slug) continue;
    byId.set(b.id, {
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
export async function getActiveCoupons(
  lang: Lang,
  limit?: number,
): Promise<{ codes: CouponVM[]; activeCount: number }> {
  const today = todayUTC();
  const active = (await loadCoupons())
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

export type CouponStatus = 'active' | 'upcoming' | 'expired';

export interface CouponFullVM extends CouponVM {
  status: CouponStatus;
}

function couponStatus(c: RawCoupon, today: string): CouponStatus {
  if (c.start > today) return 'upcoming';
  if (c.end < today) return 'expired';
  return 'active';
}

/**
 * TOUS les coupons avec statut (actifs, puis à venir, puis expirés ; chaque
 * groupe du plus récent au plus ancien), récompenses résolues. Pour la page
 * `/coupons` (la home n'en montre qu'un sous-ensemble actif).
 */
export async function getAllCoupons(lang: Lang): Promise<CouponFullVM[]> {
  const today = todayUTC();
  const rank: Record<CouponStatus, number> = { active: 0, upcoming: 1, expired: 2 };
  return (await loadCoupons())
    .map((c) => ({ raw: c, status: couponStatus(c, today) }))
    .sort((a, b) => rank[a.status] - rank[b.status] || b.raw.start.localeCompare(a.raw.start))
    .map(({ raw, status }) => ({
      code: raw.code,
      start: raw.start,
      end: raw.end,
      status,
      rewards: Object.entries(raw.description).map(([key, qty]) => ({
        item: resolveReward(key, lang),
        qty,
      })),
    }));
}

/** Planning de buff quotidien (dérivé des posts par `get-news`). */
export function getBuffSchedule(): BuffScheduleEntry[] {
  return ((buffData as { schedule?: BuffScheduleEntry[] }).schedule ?? []).slice();
}
