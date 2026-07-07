import type { ReactNode } from 'react';

/**
 * Rend un texte du jeu : balises `<color=#hex>…</color>` (casse variable —
 * les profils écrivent `<Color=…>`) en spans colorés.
 */
export function renderGameColors(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /<color=(#[0-9a-fA-F]{3,8})>([\s\S]*?)<\/color>/gi;
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      <span key={key++} style={{ color: m[1] }}>
        {m[2]}
      </span>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
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
