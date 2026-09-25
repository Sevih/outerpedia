'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Écrit `text` dans le presse-papier ; `true` si l'écriture a réussi. Jamais de
 * rejet : l'appelant décide du repli (`window.prompt`, rien…) sur `false`.
 *
 * `navigator.clipboard` n'existe qu'en contexte sécurisé (https, localhost) :
 * ailleurs (dev servi en http sur le LAN), repli `execCommand('copy')` sur une
 * zone de texte hors écran — déprécié mais seul chemin restant.
 */
export async function copyText(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // permission refusée, ou iOS hors geste utilisateur direct
      return false;
    }
  }
  if (typeof document === 'undefined') return false;
  const previous = document.activeElement as HTMLElement | null;
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.top = '-9999px';
  document.body.appendChild(area);
  area.focus();
  area.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  area.remove();
  // Le focus revient où il était (une modale garde son piège de focus).
  previous?.focus?.();
  return ok;
}

/**
 * Copie + retour « copié ! » : `copied` passe à `true` après une copie réussie
 * et retombe au bout de `resetMs`. `copiedText` dit QUEL texte vient d'être
 * copié (listes où chaque ligne a son bouton). Une nouvelle copie relance le
 * délai ; le minuteur est coupé au démontage. `copy` est stable par `resetMs`.
 */
export function useCopyToClipboard(resetMs = 1500) {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = useCallback(
    async (text: string) => {
      const ok = await copyText(text);
      if (ok) {
        setCopiedText(text);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopiedText(null), resetMs);
      }
      return ok;
    },
    [resetMs],
  );

  return { copy, copied: copiedText !== null, copiedText };
}
