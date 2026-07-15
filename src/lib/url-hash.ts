'use client';

/**
 * LE HASH COMME JEU DE PARAMÈTRES — `#version=jun2026&phase=p2&team=1`.
 *
 * Un guide récurrent empile plusieurs sélecteurs (version, phase, sous-boss,
 * équipe) et chacun veut son lien partageable. Un seul `#clé=valeur` ne suffit
 * plus : on partage donc le hash en paramètres indépendants, façon query-string.
 *
 * Rétrocompatible : un guide qui n'a qu'une version garde `#version=X` — lire un
 * paramètre absent rend `null`, écrire préserve les autres. La SOURCE DE VÉRITÉ
 * reste l'URL (cf. `useUrlSlice`) : on lit la tranche, on écrit la tranche.
 */
import { writeUrl } from '@/hooks/useUrlSlice';

function parse(hash: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const part of hash.replace(/^#/, '').split('&')) {
    if (!part) continue;
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    map.set(decodeURIComponent(part.slice(0, eq)), decodeURIComponent(part.slice(eq + 1)));
  }
  return map;
}

/** Valeur d'un paramètre du hash, ou `null` s'il est absent. */
export function readHashParam(key: string): string | null {
  return parse(window.location.hash).get(key) ?? null;
}

/** Écrit un paramètre du hash en préservant les autres (sans rechargement). */
export function writeHashParam(key: string, value: string): void {
  writeUrl(() => {
    const map = parse(window.location.hash);
    map.set(key, value);
    const next = [...map]
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    window.history.replaceState(null, '', `#${next}`);
  });
}
