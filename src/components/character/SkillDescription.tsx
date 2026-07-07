import type { SkillBuffVars } from '@contracts';
import { resolveSkillText } from '@/lib/skills';
import { renderGameColors } from '@/components/ui/GameText';

/**
 * Description de compétence : placeholders résolus (au niveau fourni via `vars`)
 * + couleurs du jeu rendues. Composant pur (server-friendly).
 */
export function SkillDescription({
  desc,
  vars,
  className = 'text-content-muted text-sm whitespace-pre-line',
}: {
  desc: string;
  vars?: Record<string, SkillBuffVars>;
  className?: string;
}) {
  // Les tables du jeu portent des `\n` LITTÉRAUX (deux caractères) → vrais
  // sauts de ligne (rendus par whitespace-pre-line).
  const text = resolveSkillText(desc, vars).replace(/\\n/g, '\n');
  return <p className={className}>{renderGameColors(text)}</p>;
}
