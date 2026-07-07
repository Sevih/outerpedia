/**
 * Options des sélecteurs d'équipement (admin) — construites depuis le généré,
 * UNE seule fois ici (pages fiche perso et presets les partagent).
 * Doublons de tables du jeu : premier id numérique gagne ; le gear de boss
 * décliné par classe est qualifié « [classe] » dans le libellé.
 */
import weaponsData from '@data/generated/equipment/weapon.json';
import accessoryData from '@data/generated/equipment/accessory.json';
import talismanData from '@data/generated/equipment/talisman.json';
import setsData from '@data/generated/equipment/sets.json';

export interface GearOption {
  id: string;
  label: string;
}

type EquipJson = Record<string, { name?: { en?: string }; classLimit?: string | null }>;

function toOptions(data: EquipJson): GearOption[] {
  const map = new Map<string, GearOption>();
  const ids = Object.keys(data).sort((a, b) => Number(a) - Number(b));
  for (const id of ids) {
    const e = data[id];
    if (!e.name?.en) continue;
    const label = `${e.name.en}${e.classLimit ? ` [${e.classLimit}]` : ''}`;
    if (!map.has(label)) map.set(label, { id, label });
  }
  return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
}

/** Options triées par slot (calculées au premier accès, module serveur). */
export function gearSelectOptions() {
  return {
    weapons: toOptions(weaponsData as EquipJson),
    amulets: toOptions(accessoryData as EquipJson),
    talismans: toOptions(talismanData as EquipJson),
    sets: toOptions(setsData as unknown as EquipJson),
  };
}
