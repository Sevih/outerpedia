import type { TFunction } from '@/i18n';
import type { GearRecoLabels } from '@/components/character/GearRecoSection';

/**
 * Libellés du panneau de butin (`LootPanel`).
 *
 * Dans un module À PART, sans `'use client'` : le panneau, lui, est un composant
 * client (le dépliage est un état d'interface), et une fonction exportée d'un
 * module client ne peut pas être APPELÉE depuis un composant serveur — seulement
 * rendue. Les guides sont des composants serveur : ils fabriquent les libellés
 * ici, et les passent au panneau comme donnée.
 */
export interface LootPanelLabels extends Pick<GearRecoLabels, 'source' | 'piece2' | 'piece4'> {
  /** En-tête de la ligne (« Rewards »). */
  title: string;
  /** Bouton de dépliage (« Details »). */
  details: string;
  weapon: string;
  amulet: string;
  talisman: string;
  set: string;
}

/**
 * Les libellés, tirés des MÊMES clés que l'équipement recommandé d'un perso —
 * c'est le même vocabulaire à l'écran, il n'a aucune raison d'être traduit deux
 * fois.
 */
export function lootPanelLabels(t: TFunction): LootPanelLabels {
  return {
    title: t('guides.rewards.title'),
    details: t('guides.rewards.details'),
    weapon: t('page.character.gear.weapon'),
    amulet: t('page.character.gear.amulet'),
    talisman: t('page.character.gear.talisman'),
    set: t('page.character.gear.set'),
    piece2: t('equip.set.2piece'),
    piece4: t('equip.set.4piece'),
    source: t('equip.detail.source'),
  };
}
