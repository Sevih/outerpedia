/**
 * Lignes des sidebars ÉQUIPEMENT de l'extracteur (navigation, même UX que les
 * persos). Une ligne = une FAMILLE (armes/amulettes/talismans), un EE ou un
 * set — l'unité du catalogue public.
 *
 * Statut = écart d'extraction RÉEL (committé ↔ extraction fraîche), agrégé :
 * la review est keyée par ITEM et une famille couvre plusieurs ids (paliers
 * d'étoiles) → on somme les champs divergents de ses membres. Les items `new`
 * n'appartiennent à aucune famille du site : ils ne sont pas navigables ici et
 * restent sur la page index — d'où `gearReviewCounts`, qui donne les compteurs
 * AUTORITAIRES (par item) pour l'en-tête de la sidebar.
 */
import type { ExtractorRow } from '@/components/admin/ExtractorSidebar';
import { img } from '@/lib/images';
import { reviewBuckets, reviewTarget } from '@/lib/admin/review-store';
import {
  getAmuletFamilies,
  getEEViews,
  getSetViews,
  getTalismanFamilies,
  getWeaponFamilies,
  type GearFamily,
} from '@/lib/data/equipment';

export type GearKind = 'weapons' | 'amulets' | 'talismans' | 'ee' | 'sets';

const sprite = (name: string) => `/api/admin/sprite/${encodeURIComponent(name)}`;

/** Cible de review correspondante (sidebar au pluriel, cible au singulier). */
const REVIEW_TARGET: Record<GearKind, string> = {
  weapons: 'weapon',
  amulets: 'amulet',
  talismans: 'talisman',
  ee: 'ee',
  sets: 'set',
};

/**
 * Écarts de la cible : nb de champs divergents par id d'item + buckets.
 * Robuste : une extraction indisponible ne doit PAS casser la sidebar.
 */
function gearDiff(kind: GearKind): {
  changed: Map<string, number>;
  counts: { new: number; diff: number };
} {
  try {
    const review = reviewTarget(REVIEW_TARGET[kind]);
    const b = reviewBuckets(review.diff);
    return {
      changed: new Map(review.diff.changed.map((c) => [c.key, c.fields.length])),
      counts: { new: b.new, diff: b.diff },
    };
  } catch {
    return { changed: new Map(), counts: { new: 0, diff: 0 } };
  }
}

/** Compteurs AUTORITAIRES (par item, mêmes que la page index) pour l'en-tête. */
export function gearReviewCounts(kind: GearKind): { new: number; diff: number } {
  return gearDiff(kind).counts;
}

function famRows(fams: GearFamily[], changed: Map<string, number>): ExtractorRow[] {
  return fams.map((f) => {
    // Une famille couvre plusieurs ids (paliers d'étoiles) : on agrège leurs écarts.
    const count = f.ids.reduce((n, id) => n + (changed.get(id) ?? 0), 0);
    return {
      id: f.id,
      name: f.name.en,
      meta: f.grade + (f.classLimits.length ? ` · ${f.classLimits.join('/')}` : ''),
      icon: sprite(f.icon),
      iconFrame: img.slotFrame(f.grade),
      stars: f.stars.at(-1),
      status: (count > 0 ? 'diff' : 'ok') as ExtractorRow['status'],
      count,
    };
  });
}

export function buildGearRows(kind: GearKind): ExtractorRow[] {
  const { changed } = gearDiff(kind);
  switch (kind) {
    case 'weapons':
      return famRows(getWeaponFamilies(), changed);
    case 'amulets':
      return famRows(getAmuletFamilies(), changed);
    case 'talismans':
      return famRows(getTalismanFamilies(), changed);
    case 'ee':
      return getEEViews().map((e) => {
        const count = changed.get(e.itemId) ?? 0;
        return {
          id: e.itemId,
          name: e.name.en,
          meta: `EE · perso ${e.characterId}`,
          icon: sprite(`TI_Equipment_EX_${e.characterId}`),
          iconFrame: img.slotFrame(e.grade),
          stars: e.star,
          status: (count > 0 ? 'diff' : 'ok') as ExtractorRow['status'],
          count,
        };
      });
    case 'sets':
      return getSetViews('en').map((s) => {
        const count = changed.get(s.id) ?? 0;
        return {
          id: s.id,
          name: s.name.en,
          meta: 'set',
          icon: sprite(s.icon),
          // Les sets d'armure du catalogue sont tous légendaires (unique).
          iconFrame: img.slotFrame('unique'),
          status: (count > 0 ? 'diff' : 'ok') as ExtractorRow['status'],
          count,
        };
      });
  }
}
