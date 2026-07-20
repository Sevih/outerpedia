/**
 * Icône + fond de slot d'un MONSTRE (convention du jeu, portée telle quelle) :
 *   - `icon` commençant par « 2 » = modèle de PERSONNAGE réutilisé en boss →
 *     face icon composée `FI_<id>` (staging) ; sinon vignette brute `MT_<id>`
 *     (route sprite admin — non collectées).
 *   - fond par HIÉRARCHIE (le Type, pas les étoiles) : slot du jeu à bordure
 *     intégrée, boss/area_boss/season_boss → GD_Slot_Bg_03 (rouge), named →
 *     GD_Slot_Bg_02 (bleu), mob → GD_Slot_Bg_01 (vert). Centre OPAQUE :
 *     l'icône se pose en retrait (inset) pour laisser la bordure visible.
 *   - badge « BOSS » du jeu (CT_Slot_Boss) sur les types boss.
 */
import { img } from '@/lib/images';

export function monsterIconSrc(icon: string): string {
  return icon.startsWith('2')
    ? img.face(icon)
    : `/api/admin/sprite/${encodeURIComponent(`MT_${icon}`)}`;
}

const SLOT_BY_TYPE: Record<string, string> = {
  boss: 'GD_Slot_Bg_03',
  area_boss: 'GD_Slot_Bg_03',
  season_boss: 'GD_Slot_Bg_03',
  named: 'GD_Slot_Bg_02',
  monster: 'GD_Slot_Bg_01',
};

export function monsterSlotSrc(type: string): string {
  return `/api/admin/sprite/${SLOT_BY_TYPE[type] ?? 'GD_Slot_Bg_01'}`;
}

/** Types qui portent le badge « BOSS » dans l'admin. PAS le même set que
 * `FORMATION_BOSS_TYPES` (data/towers) : `season_boss` a le badge mais ne mène
 * jamais une formation de tour. Sets volontairement distincts — ne pas fusionner. */
const BOSS_BADGE_TYPES = new Set(['boss', 'area_boss', 'season_boss']);

/** Badge « BOSS » du jeu, ou undefined si le type n'en est pas un. */
export function monsterBossBadgeSrc(type: string): string | undefined {
  return BOSS_BADGE_TYPES.has(type) ? '/api/admin/sprite/CT_Slot_Boss' : undefined;
}
