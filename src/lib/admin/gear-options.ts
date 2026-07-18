/**
 * Options des sélecteurs d'équipement (admin) — construites depuis le généré,
 * UNE seule fois ici (pages fiche perso et presets les partagent).
 *
 * Armes / amulettes / talismans : dérivés des FAMILLES (haut de famille 6★) →
 * on porte l'icône 6★ (pas la 1★), la restriction de classe (`classLimits`,
 * vide = libre) et les main stats disponibles (filtrage du select). Les sets
 * restent lus à plat (pas de famille).
 */
import setsData from '@data/generated/equipment/sets.json';
import {
  getWeaponFamilies,
  getAmuletFamilies,
  getTalismanFamilies,
  type GearFamily,
} from '@/lib/data/equipment';

export interface GearOption {
  id: string;
  label: string;
  /** Sprite 6★ du jeu (aperçu « à vue » dans l'éditeur de recos). */
  icon?: string;
  /** Restrictions de classe (slugs). Vide/absent = équipable par tous. */
  classLimits?: string[];
  /** Main stats disponibles (labels « ATK% », « EFF »…) — filtrage du select. */
  mainStats?: string[];
}

type EquipJson = Record<
  string,
  { name?: { en?: string }; classLimit?: string | null; icon?: string }
>;

/** Options à plat (sets) : premier id numérique gagne, libellé + icône bruts. */
function toOptions(data: EquipJson): GearOption[] {
  const map = new Map<string, GearOption>();
  const ids = Object.keys(data).sort((a, b) => Number(a) - Number(b));
  for (const id of ids) {
    const e = data[id];
    if (!e.name?.en) continue;
    const label = `${e.name.en}${e.classLimit ? ` [${e.classLimit}]` : ''}`;
    if (!map.has(label)) map.set(label, { id, label, icon: e.icon });
  }
  return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
}

/** Options depuis les familles : id canonique, icône 6★, classe, main stats. */
function familyOptions(families: GearFamily[]): GearOption[] {
  return families
    .filter((f) => f.name.en)
    .map((f) => ({
      id: f.id,
      label: f.name.en,
      icon: f.icon, // 6★ (top de famille)
      classLimits: f.classLimits,
      mainStats: f.mainStats,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/** Options triées par slot (calculées au premier accès, module serveur). */
export function gearSelectOptions() {
  return {
    weapons: familyOptions(getWeaponFamilies()),
    amulets: familyOptions(getAmuletFamilies()),
    talismans: familyOptions(getTalismanFamilies()),
    sets: toOptions(setsData as unknown as EquipJson),
  };
}
