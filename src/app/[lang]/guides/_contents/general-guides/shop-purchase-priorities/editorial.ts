/**
 * Contenu ÉDITORIAL des shops NON dérivés du guide shop-priorities : Supply
 * Module et Rico Secret (texte pur), Event Shop et General/Resource (sélections
 * curées / templates variables — pas un shop entier à refléter, donc pas dans le
 * générateur). Les notes de shop (Event, Joint) accompagnent les tables dérivées.
 *
 * La DONNÉE vit dans `shop-editorial.json` (éditable via /admin/guides,
 * general-guides) ; ce module n'en porte plus que les TYPES et la lecture typée.
 * Les 8 shops permanents « à monnaie », eux, dérivent du jeu
 * (`data/generated/shop-priorities.json`, priorité/notes dans l'overlay curé).
 */
import type { LocalizedText } from '@contracts';
import raw from './shop-editorial.json';

/** Un item éditorial (event/resource) — même forme d'affichage que le dérivé. */
export interface EditorialItem {
  name: string;
  label?: LocalizedText;
  priority?: 'S' | 'A' | 'B' | 'C';
  gives?: number;
  cost?: { currency: string; amount: number };
  limit?: { count: number; period: 'daily' | 'weekly' | 'monthly' | 'one-time' };
  notes?: LocalizedText;
}

/** Shops en TEXTE seul (Supply, Rico) : paragraphes + note de gear. */
export interface TextShop {
  paragraphs: LocalizedText[];
  gearNote?: LocalizedText;
}

/** Forme complète du fichier éditorial (contrat partagé avec le store admin). */
export interface ShopEditorial {
  shopNotes: Record<string, LocalizedText>;
  textShops: Record<string, TextShop>;
  eventItems: EditorialItem[];
  resourceItems: EditorialItem[];
}

const data = raw as ShopEditorial;

/** Notes affichées sous certains onglets (dérivés ou non). */
export const SHOP_NOTES: Record<string, LocalizedText> = data.shopNotes;

export const TEXT_SHOPS: Record<string, TextShop> = data.textShops;

/** Table éditoriale de l'Event Shop (template — coûts variables selon l'event). */
export const EVENT_ITEMS: EditorialItem[] = data.eventItems;

/** Table éditoriale du shop General/Resource (sélection curée Ether/Gold). */
export const RESOURCE_ITEMS: EditorialItem[] = data.resourceItems;
