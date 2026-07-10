/**
 * Lignes des sidebars ÉQUIPEMENT de l'extracteur (même UX que les persos).
 * Une ligne = une FAMILLE (armes/amulettes/talismans), un EE ou un set —
 * l'unité du catalogue public et du contrôle V2. Le statut `diff` = issues du
 * contrôle V2 sur cette entrée ; icônes = sprites bruts du jeu (route admin).
 */
import type { ExtractorRow } from '@/components/admin/ExtractorSidebar';
import { img } from '@/lib/images';
import { equipmentV2Control, type EquipmentCatalogue } from '@/lib/admin/equipment-control';
import {
  getAmuletFamilies,
  getEEViews,
  getSetViews,
  getTalismanFamilies,
  getWeaponFamilies,
  type GearFamily,
} from '@/lib/data/equipment';

export type GearKind = EquipmentCatalogue;

/** Issues du contrôle V2, comptées par nom d'entrée (minuscule). */
export function gearIssueCounts(kind: GearKind): Map<string, number> {
  const out = new Map<string, number>();
  try {
    for (const rep of equipmentV2Control(kind)) {
      for (const i of rep.issues) {
        const k = i.item.toLowerCase();
        out.set(k, (out.get(k) ?? 0) + 1);
      }
    }
  } catch {
    /* oracle V2 indisponible */
  }
  return out;
}

const sprite = (name: string) => `/api/admin/sprite/${encodeURIComponent(name)}`;

function famRows(fams: GearFamily[], counts: Map<string, number>): ExtractorRow[] {
  return fams.map((f) => {
    const count = counts.get(f.name.en.toLowerCase()) ?? 0;
    return {
      id: f.id,
      name: f.name.en,
      meta: f.grade + (f.classLimits.length ? ` · ${f.classLimits.join('/')}` : ''),
      icon: sprite(f.icon),
      iconFrame: img.slotFrame(f.grade),
      stars: f.stars.at(-1),
      status: count ? ('diff' as const) : ('ok' as const),
      count,
    };
  });
}

export function buildGearRows(kind: GearKind): ExtractorRow[] {
  const counts = gearIssueCounts(kind);
  switch (kind) {
    case 'weapons':
      return famRows(getWeaponFamilies(), counts);
    case 'amulets':
      return famRows(getAmuletFamilies(), counts);
    case 'talismans':
      return famRows(getTalismanFamilies(), counts);
    case 'ee':
      return getEEViews().map((e) => {
        const count = counts.get(e.name.en.toLowerCase()) ?? 0;
        return {
          id: e.itemId,
          name: e.name.en,
          meta: `EE · perso ${e.characterId}`,
          icon: sprite(`TI_Equipment_EX_${e.characterId}`),
          iconFrame: img.slotFrame(e.grade),
          stars: e.star,
          status: count ? ('diff' as const) : ('ok' as const),
          count,
        };
      });
    case 'sets':
      return getSetViews('en').map((s) => {
        const count = counts.get(s.name.en.toLowerCase()) ?? 0;
        return {
          id: s.id,
          name: s.name.en,
          meta: 'set',
          icon: sprite(s.icon),
          // Les sets d'armure du catalogue sont tous légendaires (unique).
          iconFrame: img.slotFrame('unique'),
          status: count ? ('diff' as const) : ('ok' as const),
          count,
        };
      });
  }
}
