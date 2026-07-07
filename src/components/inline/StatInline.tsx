import { InlineTooltip } from './InlineTooltip';

/**
 * Chip de stat partagé (port du StatInline V2) : icône du jeu + nom COMPLET
 * officiel, tooltip avec la description officielle quand le jeu en fournit
 * une (`SYS_STAT_DESC_*`). Pré-localisé par l'appelant (statName/statDesc).
 */
export function StatInline({
  name,
  iconSrc,
  desc,
  color = 'text-stat',
  size = 18,
}: {
  name: string;
  iconSrc?: string;
  desc?: string;
  color?: string;
  size?: number;
}) {
  const body = (
    <span className={`inline-flex items-center gap-1 align-middle ${color}`}>
      {iconSrc && (
        <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
          <img src={iconSrc} alt="" className="absolute inset-0 h-full w-full object-contain" />
        </span>
      )}
      {name}
    </span>
  );
  if (!desc) return body;
  return (
    <InlineTooltip
      content={
        <div className="flex max-w-64 flex-col gap-1">
          <span className="text-sm font-bold text-white">{name}</span>
          <p className="text-xs whitespace-pre-line text-neutral-200">{desc}</p>
        </div>
      }
    >
      <button type="button" className="cursor-default">
        {body}
      </button>
    </InlineTooltip>
  );
}
