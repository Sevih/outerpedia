import type { SkillBuffVars } from '@contracts';
import type { Lang } from '@/lib/i18n/config';
import { resolveSkillText } from '@/lib/skills';
import { renderGameColors } from '@/components/ui/GameText';
import { renderGameText } from '@/components/inline/GameTokens';

/**
 * Description de compétence : placeholders résolus (au niveau fourni via `vars`)
 * + couleurs du jeu rendues. Composant pur (server-friendly).
 *
 * Avec `lang`, les mentions d'ÉLÉMENT et de CLASSE du texte (« if the target is
 * not a Defender ») deviennent des icônes inline, comme en jeu. C'est optionnel
 * parce que la langue rendue doit être connue pour reconnaître les mots — cf.
 * `lib/game-tokens`.
 */
export function SkillDescription({
  desc,
  vars,
  lang,
  className = 'text-content-muted text-sm whitespace-pre-line',
}: {
  desc: string;
  vars?: Record<string, SkillBuffVars>;
  lang?: Lang;
  className?: string;
}) {
  // Les tables du jeu portent des `\n` LITTÉRAUX (deux caractères) → vrais
  // sauts de ligne (rendus par whitespace-pre-line).
  const text = resolveSkillText(desc, vars).replace(/\\n/g, '\n');
  return <p className={className}>{lang ? renderGameText(text, lang) : renderGameColors(text)}</p>;
}
