/**
 * Primitive #4 (amorce) — normalisation des enums du jeu.
 *
 * Les valeurs d'enum du jeu sont préfixées par un namespace (`ST_`, `IG_`,
 * `OAT_`, `ITS_`…). On les transforme en slug lisible en retirant ce préfixe,
 * SANS table en dur : un nouvel enum est normalisé automatiquement.
 */

/**
 * Slug d'un enum : retire `stripSegments` segments de tête (séparés par `_`),
 * puis minuscule.
 *   slugEnum('ST_ATK')              → 'atk'
 *   slugEnum('IG_UNIQUE')           → 'unique'
 *   slugEnum('ITS_EQUIP_WEAPON', 2) → 'weapon'
 */
export function slugEnum(v: string | undefined, stripSegments = 1): string {
  if (!v) return '';
  const parts = v.split('_');
  const tail = parts.slice(stripSegments).join('_');
  return (tail || v).toLowerCase();
}
