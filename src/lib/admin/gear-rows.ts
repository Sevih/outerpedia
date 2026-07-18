/**
 * Lignes des sidebars ÉQUIPEMENT de l'extracteur (navigation, même UX que les
 * persos). Une ligne = une FAMILLE (armes/amulettes/talismans), un EE ou un
 * set — l'unité du catalogue public. Le diff « jeu ↔ site » vit sur la page
 * index (`ExtractorReview`) ; ici, simple navigation vers la fiche.
 */
import type { ExtractorRow } from '@/components/admin/ExtractorSidebar';
import { img } from '@/lib/images';
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

function famRows(fams: GearFamily[]): ExtractorRow[] {
  return fams.map((f) => ({
    id: f.id,
    name: f.name.en,
    meta: f.grade + (f.classLimits.length ? ` · ${f.classLimits.join('/')}` : ''),
    icon: sprite(f.icon),
    iconFrame: img.slotFrame(f.grade),
    stars: f.stars.at(-1),
    status: 'ok' as const,
    count: 0,
  }));
}

export function buildGearRows(kind: GearKind): ExtractorRow[] {
  switch (kind) {
    case 'weapons':
      return famRows(getWeaponFamilies());
    case 'amulets':
      return famRows(getAmuletFamilies());
    case 'talismans':
      return famRows(getTalismanFamilies());
    case 'ee':
      return getEEViews().map((e) => ({
        id: e.itemId,
        name: e.name.en,
        meta: `EE · perso ${e.characterId}`,
        icon: sprite(`TI_Equipment_EX_${e.characterId}`),
        iconFrame: img.slotFrame(e.grade),
        stars: e.star,
        status: 'ok' as const,
        count: 0,
      }));
    case 'sets':
      return getSetViews('en').map((s) => ({
        id: s.id,
        name: s.name.en,
        meta: 'set',
        icon: sprite(s.icon),
        // Les sets d'armure du catalogue sont tous légendaires (unique).
        iconFrame: img.slotFrame('unique'),
        status: 'ok' as const,
        count: 0,
      }));
  }
}
