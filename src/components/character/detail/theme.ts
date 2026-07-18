/**
 * Accent hex par élément du layout « éditorial » de la fiche perso (portage V2).
 * L'accent signe la page (n° de sections, eyebrow, dernière lettre du nom,
 * traits) — jamais utilisé en aplat. Injecté en SSR comme CSS var `--cd-el` et
 * passé aux composants enfants : il faut la valeur BRUTE, pas un `var(...)`.
 *
 * Les valeurs MIROITENT les tokens éléments de globals.css (`--fire`, `--water`,
 * `--earth`, `--light`, `--dark-elem`). On garde volontairement cette copie JS
 * plutôt qu'un `var(--${element})` mécanique car (1) le SSR a besoin du hex brut
 * et (2) la clé `dark` diverge du nom CSS `--dark-elem`. Toute retouche ici DOIT
 * suivre globals.css — c'est la seconde source, pas une source indépendante.
 */
const ELEMENT_HEX: Record<string, string> = {
  fire: '#ff6b6b',
  water: '#4dabf7',
  earth: '#51cf66',
  light: '#ffe066',
  dark: '#cc5de8',
};

/** Hex d'accent d'un élément (repli `fire` pour un élément inconnu). */
export function elementHex(element: string): string {
  return ELEMENT_HEX[element] ?? ELEMENT_HEX.fire;
}
