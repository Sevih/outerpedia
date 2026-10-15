/**
 * Accès aux CONDITIONS DE DÉBLOCAGE (`data/generated/unlock-content.json`).
 * Donnée générée → import statique figé (même choix que characters.ts).
 */
import type { UnlockEntry } from '@contracts';
import unlockData from '@data/generated/unlock-content.json';

const ENTRIES = (unlockData as { entries: UnlockEntry[] }).entries;

// Plusieurs lignes ContentLockTemplet peuvent partager un ContentType : la
// PREMIÈRE gagne, comme dans le jeu (`CTempletManager.GetContentLock` rend la
// première trouvée). Le générateur garde l'ordre de la table (tri stable).
let byType: Map<string, UnlockEntry> | undefined;

/** Entrée de déblocage d'un ContentType (`WORLD_BOSS`, `PVE_TOWER`…). */
export function getUnlockEntry(contentType: string): UnlockEntry | undefined {
  if (!byType) {
    byType = new Map();
    for (const e of ENTRIES) if (!byType.has(e.contentType)) byType.set(e.contentType, e);
  }
  return byType.get(contentType);
}
