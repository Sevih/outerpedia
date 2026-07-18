'use client';

/**
 * Aperçu FIDÈLE d'un texte éditorial inline (admin) : rend les DESCRIPTEURS de
 * segments (résolus côté serveur par les vrais résolveurs de `parse-text`) avec
 * les VRAIS composants inline du site — `InlineIcon` / `ItemInline` /
 * `StatInline` / `EffectIconTile`. Le rendu est donc identique au site (icônes,
 * couleurs, liens) ; un segment `unknown` (tag mort) passe en ROUGE.
 *
 * Ces composants n'ont aucun import server-only (juste `next/link`, `img`,
 * `InlineTooltip`) : ils sont donc utilisables ici, côté client.
 */
import { Fragment } from 'react';
import type { InlineSegment } from '@/lib/parse-text';
import { InlineIcon } from '@/components/inline/InlineIcon';
import { ItemInline } from '@/components/inline/ItemInline';
import { StatInline } from '@/components/inline/StatInline';
import { EffectIconTile } from '@/components/character/EffectChips';

/** Tooltip d'effet (tuile + nom + description), miroir de `parse-text`. */
function effectTooltip(label: string, desc: string | undefined, isDebuff: boolean, icon?: string) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        {icon && <EffectIconTile icon={icon} isDebuff={isDebuff} className="h-6 w-6" />}
        <span className="text-content-strong text-sm font-bold">{label}</span>
      </div>
      {desc && <p className="text-content text-xs whitespace-pre-line">{desc}</p>}
    </div>
  );
}

function Segment({ seg }: { seg: InlineSegment }) {
  switch (seg.t) {
    case 'text':
      return <>{seg.s}</>;
    case 'br':
      return <br />;
    case 'unknown':
      return <span className="text-red-500">{seg.s}</span>;
    case 'icon':
      return (
        <InlineIcon
          icon={seg.icon}
          label={seg.label}
          color={seg.color}
          href={seg.href}
          underline={seg.underline}
        />
      );
    case 'effect':
      return (
        <InlineIcon
          iconNode={
            seg.icon ? (
              <EffectIconTile icon={seg.icon} isDebuff={seg.isDebuff} className="h-4.5 w-4.5" />
            ) : undefined
          }
          label={seg.label}
          color={seg.color}
          tooltip={effectTooltip(seg.label, seg.desc, seg.isDebuff, seg.icon)}
          tooltipBg={seg.isDebuff ? 'bg-debuff-bg' : 'bg-buff-bg'}
        />
      );
    case 'item':
      return (
        <ItemInline
          item={{ name: seg.name, iconSrc: seg.iconSrc, grade: seg.grade, desc: seg.desc }}
          color={seg.color}
          href={seg.href}
        />
      );
    case 'stat':
      return <StatInline name={seg.name} iconSrc={seg.iconSrc} desc={seg.desc} />;
  }
}

export function InlinePreview({ segments }: { segments: InlineSegment[] }) {
  return (
    <>
      {segments.map((seg, i) => (
        <Fragment key={i}>
          <Segment seg={seg} />
        </Fragment>
      ))}
    </>
  );
}
