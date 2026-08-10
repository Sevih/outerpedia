/**
 * RÉGLAGES GLOBAUX DU SITE — les préférences d'affichage du visiteur, partagées
 * par TOUTES les pages : portrait animé (rejouer l'effet de carte du jeu) et
 * skin affiché par personnage.
 *
 * Pourquoi pas `useStoredState` : ce hook-là tient un état PAR COMPOSANT. Ici la
 * même valeur est lue par des dizaines de cartes et écrite par la modale du
 * header ou une fiche perso — il faut UN état de module, et des abonnés. D'où le
 * patron `useSyncExternalStore` (déjà celui de `useMediaQuery`/`useUrlSlice`),
 * adossé au MÊME storage versionné que le reste (`client-storage`).
 *
 * Contrat SSR identique à `useStoredState` : le serveur et le premier rendu
 * client voient le `fallback` (zéro mismatch d'hydratation), la valeur stockée
 * arrive à l'abonnement — un portrait skinné apparaît donc en base puis bascule,
 * c'est le prix du localStorage et il est assumé (même comportement que les
 * outils existants).
 *
 * La table `skins` associe un CharacterID au ModelNameID du costume choisi
 * (`CostumeTemplet` : c'est l'id qui nomme TOUTES les images — `CT_`, `FI_`,
 * `IMG_`). On ne stocke JAMAIS l'id de base : revenir au défaut, c'est retirer
 * l'entrée. La coercition ne garde que des paires d'ids plausibles — la
 * validation « ce modèle appartient bien à ce perso » vit dans les surfaces de
 * choix, qui n'offrent que la vraie liste ; une entrée forgée à la main donne au
 * pire une image absente, jamais un crash.
 */

import { useSyncExternalStore } from 'react';
import { readStored, writeStored, type StoreSpec } from './client-storage';

// Le kill-switch vit dans son propre module SANS React (`site-settings-flag`) :
// le composant serveur `Header` doit pouvoir le lire, et ce module-ci lui est
// interdit (il tire `useSyncExternalStore`). Ré-exporté pour que les surfaces
// clientes n'aient qu'un import.
export { SITE_SETTINGS_ENABLED } from './site-settings-flag';

export interface SiteSettings {
  /** Rejouer l'effet de carte du jeu (WebGL) sur les portraits qui en portent un. */
  animatedPortraits: boolean;
  /** CharacterID → ModelNameID du costume affiché à la place de la base. */
  skins: Record<string, string>;
}

const FALLBACK: SiteSettings = { animatedPortraits: false, skins: {} };

const ID_RE = /^\d+$/;

/** Ramène n'importe quelle forme stockée au schéma courant — jamais de confiance. */
export function coerceSiteSettings(raw: unknown): SiteSettings {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const skins: Record<string, string> = {};
  const rawSkins =
    o.skins && typeof o.skins === 'object' ? (o.skins as Record<string, unknown>) : {};
  for (const [charId, model] of Object.entries(rawSkins)) {
    // Une entrée modèle = base serait un mensonge silencieux (le défaut sans le
    // dire) : on la retire, « pas d'entrée » est la seule forme du défaut.
    if (ID_RE.test(charId) && typeof model === 'string' && ID_RE.test(model) && model !== charId) {
      skins[charId] = model;
    }
  }
  return { animatedPortraits: o.animatedPortraits === true, skins };
}

export const SITE_SETTINGS_SPEC: StoreSpec<SiteSettings> = {
  key: 'outerpedia:settings',
  version: 1,
  fallback: FALLBACK,
};

// --- l'état de module et ses abonnés ---------------------------------------------

let state: SiteSettings = FALLBACK;
let hydrated = false;
let crossTab = false;
const listeners = new Set<() => void>();

function emit(): void {
  for (const l of listeners) l();
}

/** Première lecture du storage — au premier abonnement ou à la première écriture. */
function hydrate(): void {
  if (hydrated || typeof window === 'undefined') return;
  hydrated = true;
  state = coerceSiteSettings(readStored(SITE_SETTINGS_SPEC));
}

function subscribe(listener: () => void): () => void {
  // Hydrater AVANT d'inscrire : React relit le snapshot juste après l'abonnement
  // et re-rend si la valeur stockée diffère du fallback rendu au SSR.
  hydrate();
  if (!crossTab && typeof window !== 'undefined') {
    crossTab = true;
    // Deux onglets, un seul storage : l'événement `storage` (émis chez les
    // AUTRES onglets) resynchronise — un réglage posé ici suit là-bas.
    window.addEventListener('storage', (e) => {
      if (e.key !== SITE_SETTINGS_SPEC.key) return;
      state = coerceSiteSettings(readStored(SITE_SETTINGS_SPEC));
      emit();
    });
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = (): SiteSettings => state;
const getServerSnapshot = (): SiteSettings => FALLBACK;

/** Les réglages, abonnés — fallback au SSR et au premier rendu client. */
export function useSiteSettings(): SiteSettings {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Remplace l'état (coercé), écrit en write-through, notifie tous les abonnés. */
export function updateSiteSettings(update: (prev: SiteSettings) => SiteSettings): void {
  hydrate();
  state = coerceSiteSettings(update(state));
  writeStored(SITE_SETTINGS_SPEC, state);
  emit();
}

export function setAnimatedPortraits(on: boolean): void {
  updateSiteSettings((prev) => ({ ...prev, animatedPortraits: on }));
}

/** Choisit le costume d'un perso — `null` (ou le modèle de base) = retour au défaut. */
export function setSkin(characterId: string, model: string | null): void {
  updateSiteSettings((prev) => {
    const skins = { ...prev.skins };
    if (model === null || model === characterId) delete skins[characterId];
    else skins[characterId] = model;
    return { ...prev, skins };
  });
}

export function clearAllSkins(): void {
  updateSiteSettings((prev) => ({ ...prev, skins: {} }));
}

/** Remise à zéro de l'état de module — TESTS UNIQUEMENT (l'état est un singleton). */
export function resetSiteSettingsForTests(): void {
  state = FALLBACK;
  hydrated = false;
  crossTab = false;
  listeners.clear();
}
