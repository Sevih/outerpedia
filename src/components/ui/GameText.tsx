import type { ReactNode } from 'react';

/**
 * Rend un texte du jeu : balises `<color=#hex>…</color>` (casse variable —
 * les profils écrivent `<Color=…>`) en spans colorés.
 *
 * `renderFragment` décore le TEXTE (jamais le balisage) : c'est le point
 * d'accroche des mentions d'élément/classe (cf. `renderGameText`). Il s'applique
 * aussi À L'INTÉRIEUR des passages colorés — le jeu colore justement ces
 * mentions, ce serait le seul endroit où l'on ne verrait pas les icônes.
 */
export function renderGameColors(
  text: string,
  renderFragment: (fragment: string, key: string) => ReactNode = (f) => f,
): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /<color=(#[0-9a-fA-F]{3,8})>([\s\S]*?)<\/color>/gi;
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(renderFragment(text.slice(last, m.index), `t${key}`));
    out.push(
      <span key={`c${key}`} style={{ color: m[1] }}>
        {renderFragment(m[2], `c${key}i`)}
      </span>,
    );
    key++;
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(renderFragment(text.slice(last), `t${key}`));
  return out;
}

/**
 * Paragraphe de texte du jeu : couleurs rendues + `\n` LITTÉRAUX des tables
 * convertis en vrais sauts de ligne (affichés par `whitespace-pre-line`).
 */
export function GameText({
  text,
  className = 'text-sm whitespace-pre-line',
}: {
  text: string;
  className?: string;
}) {
  return <p className={className}>{renderGameColors(text.replace(/\\n/g, '\n'))}</p>;
}
