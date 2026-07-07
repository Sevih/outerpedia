/**
 * Accent par élément du layout « éditorial » de la fiche perso (portage V2).
 * L'accent signe la page (n° de sections, eyebrow, dernière lettre du nom,
 * traits) — jamais utilisé en aplat. Hexs = tokens éléments de globals.css.
 */
export const ELEMENT_HEX: Record<string, string> = {
  fire: '#ff6b6b',
  water: '#4dabf7',
  earth: '#51cf66',
  light: '#ffe066',
  dark: '#cc5de8',
};

export interface ElementAccent {
  hex: string;
  /** Aides alpha-hex (0–255) pour dégradés/bordures inline. */
  glow: string;
  soft: string;
  softer: string;
  border: string;
}

export function elementAccent(element: string): ElementAccent {
  const hex = ELEMENT_HEX[element] ?? ELEMENT_HEX.fire;
  return {
    hex,
    glow: `${hex}66`,
    soft: `${hex}14`,
    softer: `${hex}08`,
    border: `${hex}55`,
  };
}
