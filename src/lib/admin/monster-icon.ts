/**
 * Icône + fond de slot d'un MONSTRE (convention du jeu, portée telle quelle) :
 *   - `icon` commençant par « 2 » = modèle de PERSONNAGE réutilisé en boss →
 *     face icon composée `FI_<id>` (staging) ; sinon vignette brute `MT_<id>`
 *     (route sprite admin — non collectées).
 *   - fond par HIÉRARCHIE (le Type, pas les étoiles) : boss/area_boss/
 *     season_boss → Rare (rouge), named → Magic (bleu), mob → Normal (vert).
 */
import { img } from '@/lib/images';

export function monsterIconSrc(icon: string): string {
  return icon.startsWith('2')
    ? img.face(icon)
    : `/api/admin/sprite/${encodeURIComponent(`MT_${icon}`)}`;
}

const SLOT_BY_TYPE: Record<string, string> = {
  boss: 'MT_Slot_Rare',
  area_boss: 'MT_Slot_Rare',
  season_boss: 'MT_Slot_Rare',
  named: 'MT_Slot_Magic',
  monster: 'MT_Slot_Normal',
};

export function monsterSlotSrc(type: string): string {
  return `/api/admin/sprite/${SLOT_BY_TYPE[type] ?? 'MT_Slot_Normal'}`;
}
