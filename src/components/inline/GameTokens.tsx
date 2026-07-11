import type { ReactNode } from 'react';
import { ELEMENT_TEXT, img } from '@/lib/images';
import type { Lang } from '@/lib/i18n/config';
import { splitGameTokens, type GameToken } from '@/lib/game-tokens';
import { renderGameColors } from '@/components/ui/GameText';
import { InlineIcon } from './InlineIcon';

/**
 * Mention d'élément ou de classe repérée dans un texte du JEU, rendue comme en
 * jeu : icône + le mot, coloré. On garde le mot TEL QU'IL ÉTAIT ÉCRIT — la
 * phrase doit continuer de se lire (« if the target is not a ⛨Defender »), donc
 * pas de pastille, pas de soulignement, pas de reformulation.
 */
export function GameTokenInline({ token }: { token: GameToken }) {
  const isElement = token.kind === 'element';
  return (
    <InlineIcon
      icon={isElement ? img.element(token.slug) : img.klass(token.slug)}
      label={token.text}
      color={isElement ? (ELEMENT_TEXT[token.slug] ?? 'text-content-strong') : 'text-class'}
      underline={false}
      size={16}
    />
  );
}

/**
 * Texte du jeu COMPLET : balises de couleur + mentions d'élément/classe. C'est
 * le rendu à utiliser partout où l'on affiche une description sortie des tables
 * (compétences de persos comme de boss).
 */
export function renderGameText(text: string, lang: Lang): ReactNode[] {
  return renderGameColors(text, (fragment, key) =>
    splitGameTokens(fragment, lang).map((part, i) =>
      typeof part === 'string' ? part : <GameTokenInline key={`${key}-${i}`} token={part} />,
    ),
  );
}
