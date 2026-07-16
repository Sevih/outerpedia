/**
 * Style visuel des nœuds de la carte Monad Gate : sprite d'icône + teinte.
 *
 * Le LIBELLÉ d'un type ne vit pas ici — c'est une clé i18n (`monad.node.<type>`).
 * Ce module ne porte que l'apparence : le nom du sprite (`img.monad`) et le
 * filtre CSS qui le colore (les icônes du jeu sont monochromes blanches, on les
 * teinte par `filter`), plus une classe de couleur de texte pour les popups.
 */
import type { MonadNodeType } from '@/lib/data/monad';

interface NodeStyle {
  /** Sprite du jeu (namespace `images/ui/monad/`). */
  icon: string;
  /** Filtre CSS qui teinte le sprite blanc. */
  filter: string;
  /** Classe de couleur de texte (popups / résumé des choix). */
  textColor: string;
}

// Teintes par famille (repris du visuel V2) : jaune = jalons/chemin, vert =
// exploration bénéfique, rouge = combat, bleu = narratif/spécial.
const YELLOW =
  'invert(17%) sepia(92%) saturate(5888%) hue-rotate(353deg) brightness(87%) contrast(132%)';
const GREEN =
  'invert(43%) sepia(93%) saturate(512%) hue-rotate(75deg) brightness(90%) contrast(92%)';
const GREEN2 =
  'invert(41%) sepia(93%) saturate(480%) hue-rotate(65deg) brightness(95%) contrast(89%)';
const RED =
  'invert(86%) sepia(131%) saturate(2884%) hue-rotate(348deg) brightness(107%) contrast(96%)';
const BLUE =
  'invert(44%) sepia(79%) saturate(1538%) hue-rotate(163deg) brightness(98%) contrast(94%)';
const NONE = 'invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)';

export const NODE_STYLES: Record<MonadNodeType, NodeStyle> = {
  start: { icon: 'CM_Monad_Node_Icon_01', filter: YELLOW, textColor: 'text-yellow-400' },
  tending: { icon: 'CM_Monad_Node_Icon_01', filter: YELLOW, textColor: 'text-yellow-400' },
  bending: { icon: 'CM_Monad_Node_Icon_01', filter: YELLOW, textColor: 'text-yellow-400' },
  nending: { icon: 'CM_Monad_Node_Icon_01', filter: YELLOW, textColor: 'text-yellow-400' },
  path: { icon: 'CM_Monad_Node_Icon_08', filter: YELLOW, textColor: 'text-yellow-400' },
  relic: { icon: 'CM_Monad_Node_Icon_05', filter: GREEN, textColor: 'text-green-400' },
  moment: { icon: 'CM_Monad_Node_Icon_03', filter: GREEN2, textColor: 'text-green-400' },
  combat: { icon: 'CM_Monad_Node_Icon_02', filter: RED, textColor: 'text-red-400' },
  elite: { icon: 'CM_Monad_Node_Icon_04', filter: RED, textColor: 'text-red-400' },
  pinnacle: { icon: 'CM_Monad_Node_Icon_06', filter: RED, textColor: 'text-red-400' },
  final: { icon: 'CM_Monad_Node_Icon_07', filter: RED, textColor: 'text-red-400' },
  eldritch: { icon: 'CM_Monad_Node_Icon_09', filter: BLUE, textColor: 'text-sky-400' },
  saga: { icon: 'CM_Monad_Node_Icon_10', filter: BLUE, textColor: 'text-sky-400' },
  cube: { icon: 'CM_Monad_Node_Icon_05', filter: BLUE, textColor: 'text-sky-400' },
  unknown: { icon: 'CM_Monad_Node_Icon_11', filter: NONE, textColor: 'text-on-vivid' },
};
