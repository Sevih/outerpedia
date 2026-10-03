/**
 * Réglages d'AFFICHAGE du Tier List Maker (localStorage) — le seul état
 * persisté de l'outil : la liste, elle, vit dans l'URL. Extrait de
 * `TierListMakerBrowser.tsx` le 03/10/2026 (découpage mécanique, contenu
 * inchangé).
 */
import type { StoreSpec } from '@/lib/client-storage';
import type { IconSize } from './contracts';

// ── Réglages d'affichage (persistés — clé héritée `tlm-settings` absorbée) ──

export interface TlmSettings {
  iconSize: IconSize;
  showNames: boolean;
  showElement: boolean;
  showClass: boolean;
  showRarity: boolean;
  showSkins: boolean;
  showSkinNames: boolean;
  showCards: boolean;
  cardSize: IconSize;
  showCardTags: boolean;
}

const SETTINGS_FALLBACK: TlmSettings = {
  iconSize: 'm',
  showNames: false,
  showElement: false,
  showClass: false,
  showRarity: false,
  showSkins: false,
  showSkinNames: true,
  showCards: false,
  cardSize: 'm',
  showCardTags: false,
};

/** Normalise des réglages de provenance quelconque (`tlm-settings` héritée incluse
 *  — mêmes champs, on ne garde que les valeurs valides). */
function coerceSettings(raw: unknown): TlmSettings {
  const d = (raw && typeof raw === 'object' ? raw : {}) as Partial<TlmSettings>;
  const size = (v: unknown): IconSize | undefined =>
    v === 's' || v === 'm' || v === 'l' ? v : undefined;
  const bool = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback);
  return {
    iconSize: size(d.iconSize) ?? 'm',
    showNames: bool(d.showNames, false),
    showElement: bool(d.showElement, false),
    showClass: bool(d.showClass, false),
    showRarity: bool(d.showRarity, false),
    showSkins: bool(d.showSkins, false),
    showSkinNames: bool(d.showSkinNames, true),
    showCards: bool(d.showCards, false),
    cardSize: size(d.cardSize) ?? 'm',
    showCardTags: bool(d.showCardTags, false),
  };
}

export const SETTINGS_SPEC: StoreSpec<TlmSettings> = {
  key: 'outerpedia:tier-list-maker:settings',
  version: 1,
  fallback: SETTINGS_FALLBACK,
  legacyKeys: ['tlm-settings'],
  fromLegacy: (data) => (data && typeof data === 'object' ? coerceSettings(data) : undefined),
  // Aussi à la version courante : un réglage ajouté sans bump arrive complété.
  normalize: coerceSettings,
};
