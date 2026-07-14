import Link from 'next/link';
import type { Route } from 'next';
import { InlineTooltip } from './InlineTooltip';

/**
 * Brique inline : icône + libellé coloré, tooltip optionnel (portage V2).
 * Composant SERVEUR — seule l'interactivité du tooltip est cliente
 * (InlineTooltip) ; le contenu du tooltip est rendu côté serveur.
 */
export function InlineIcon({
  icon,
  iconNode,
  label,
  color = 'text-content-strong',
  underline = true,
  imageClassName,
  tooltip,
  tooltipBg,
  href,
  size = 18,
}: {
  icon?: string;
  /** Icône déjà rendue (tuile d'effet recolorée…) — prioritaire sur `icon`. */
  iconNode?: React.ReactNode;
  label: string;
  color?: string;
  underline?: boolean;
  imageClassName?: string;
  tooltip?: React.ReactNode;
  tooltipBg?: string;
  /** Rend le chip cliquable (lien interne). */
  href?: string;
  size?: number;
}) {
  const body = (
    <>
      {iconNode}
      {!iconNode && icon && (
        <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
          <img
            src={icon}
            alt={label}
            className={`absolute inset-0 h-full w-full object-contain ${imageClassName ?? ''}`}
          />
        </span>
      )}
      {label && <span className={underline ? 'underline' : ''}>{label}</span>}
    </>
  );

  const inner = href ? (
    <Link
      href={href as Route}
      className={`inline-flex items-center gap-0.5 align-middle ${color} hover:brightness-125`}
    >
      {body}
    </Link>
  ) : (
    <span className={`inline-flex items-center gap-0.5 align-middle ${color}`}>{body}</span>
  );

  if (!tooltip) return inner;

  return (
    <InlineTooltip content={tooltip} bg={tooltipBg}>
      {href ? (
        inner
      ) : (
        <button type="button" className="cursor-default">
          {inner}
        </button>
      )}
    </InlineTooltip>
  );
}
