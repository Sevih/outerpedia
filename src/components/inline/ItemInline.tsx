import Link from 'next/link';
import type { Route } from 'next';
import { img } from '@/lib/images';
import { InlineTooltip } from './InlineTooltip';

/** Un item affichable en inline (pré-localisé par l'appelant). */
export interface InlineItem {
  name: string;
  /** URL COMPLÈTE de l'icône (img.equipment / img.item selon le namespace). */
  iconSrc: string;
  /** Grade slug — cadre de rareté de la tuile. */
  grade: string;
  /** Description officielle (tooltip). */
  desc?: string;
}

/**
 * Badge d'item partagé (port de l'ItemInline V2) : tuile cadre de rareté +
 * icône, nom souligné optionnel, tooltip nom + description au survol/tap.
 * LA brique inline des items — matériaux d'ascension, gifts, pièces de
 * rappel, tags `{I-I/…}` / `{AS/…}` du parse-text… (une seule implémentation).
 */
export function ItemInline({
  item,
  size = 18,
  iconOnly = false,
  tooltip,
  href,
  color = 'text-equipment',
}: {
  item: InlineItem;
  /** Côté de la tuile en px. */
  size?: number;
  /** Tuile seule (le libellé est géré par l'appelant). */
  iconOnly?: boolean;
  /** Contenu de tooltip RICHE (remplace le nom + desc par défaut). */
  tooltip?: React.ReactNode;
  /** Rend le badge cliquable (lien interne). */
  href?: string;
  /** Couleur du libellé (grade de l'item pour l'équipement). */
  color?: string;
}) {
  const body = (
    <span className={`${color} inline-flex items-center gap-1 align-middle`}>
      <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
        <img src={img.slotFrame(item.grade)} alt="" className="absolute inset-0 h-full w-full" />
        {item.iconSrc && (
          // eslint-disable-next-line @next/next/no-img-element -- asset R2/staging
          <img
            src={item.iconSrc}
            alt={item.name}
            className="absolute inset-0 h-full w-full object-contain"
          />
        )}
      </span>
      {!iconOnly && <span className="underline">{item.name}</span>}
    </span>
  );
  const inner = href ? (
    <Link href={href as Route} className="hover:brightness-125">
      {body}
    </Link>
  ) : (
    <button type="button" className="cursor-default">
      {body}
    </button>
  );
  return (
    <InlineTooltip
      content={
        tooltip ?? (
          <div className="flex max-w-64 flex-col gap-1">
            {/* Tooltip sur surface sombre (thème unique) : tokens contenu. */}
            <span className="text-content-strong text-sm font-bold">{item.name}</span>
            {item.desc && <p className="text-content text-xs whitespace-pre-line">{item.desc}</p>}
          </div>
        )
      }
    >
      {inner}
    </InlineTooltip>
  );
}
