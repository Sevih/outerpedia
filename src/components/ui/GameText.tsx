import type { ReactNode } from 'react';

/**
 * Rend un texte du jeu : balises `<color=#hex>…</color>` (casse variable —
 * les profils écrivent `<Color=…>`) en spans colorés.
 *
 * Analyse à PILE, règle du rich text Unity : les balises s'imbriquent (la
 * couleur la plus intérieure s'applique, une fermante rend celle de
 * l'englobante), une ouvrante jamais fermée colore jusqu'à la fin, une fermante
 * orpheline ne s'affiche pas. Sans imbrication, le balisage est celui d'un
 * simple appariement (un span par paire).
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
  /** Un passage coloré ouvert : `key` = rang de son ouvrante dans le texte. */
  type Open = { key: number; color: string; children: ReactNode[]; texts: number };
  const out: ReactNode[] = [];
  const stack: Open[] = [];
  const re = /<color=(#[0-9a-fA-F]{3,8})>|<\/color>/gi;
  let opened = 0;
  let pending = '';

  /** Pousse le texte accumulé dans le passage courant (ou à la racine). */
  const flush = () => {
    if (!pending) return;
    const top = stack.at(-1);
    if (top) {
      top.children.push(renderFragment(pending, `c${top.key}i${top.texts || ''}`));
      top.texts++;
    } else out.push(renderFragment(pending, `t${opened}`));
    pending = '';
  };
  /** Ferme le passage courant : son span rejoint l'englobant (ou la racine). */
  const close = () => {
    const node = stack.pop()!;
    if (!node.children.length) node.children.push(renderFragment('', `c${node.key}i`));
    (stack.at(-1)?.children ?? out).push(
      <span key={`c${node.key}`} style={{ color: node.color }}>
        {node.children.length === 1 ? node.children[0] : node.children}
      </span>,
    );
  };

  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    pending += text.slice(last, m.index);
    last = m.index + m[0].length;
    if (m[1]) {
      flush();
      stack.push({ key: opened++, color: m[1], children: [], texts: 0 });
    } else if (stack.length) {
      flush();
      close();
    }
    // Fermante orpheline : retirée, le texte continue d'un seul tenant.
  }
  pending += text.slice(last);
  flush();
  while (stack.length) close();
  return out;
}

/**
 * Les tables du jeu portent des `\n` LITTÉRAUX (deux caractères) : à convertir
 * en vrais sauts de ligne partout où l'on affiche ce texte (le rendu final les
 * montre via `whitespace-pre-line`).
 */
export const gameLineBreaks = (text: string) => text.replace(/\\n/g, '\n');

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
  return <p className={className}>{renderGameColors(gameLineBreaks(text))}</p>;
}
