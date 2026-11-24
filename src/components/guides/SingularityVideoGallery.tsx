'use client';

import { useState, type ReactNode } from 'react';
import { cleanVideoTitle } from '@/lib/video-title';
import { MultiVideoEmbed, type VideoItem } from '@/components/ui/MultiVideoEmbed';

/**
 * La galerie vidéo d'un guide Dimensional Singularity, côté client : une carte
 * par combinaison boss × EX Buff, et UN lecteur au-dessus de la grille. Un clic
 * sur une carte qui a des vidéos les charge dans le lecteur (`MultiVideoEmbed` :
 * des onglets quand elles sont plusieurs, une seule iframe montée à la fois).
 *
 * Tout ce qui demande la langue (la pastille de l'EX Buff, l'étiquette de la
 * carte active, les libellés) arrive rendu du serveur (`SingularityVideos`) :
 * ce composant ne tient que la sélection.
 */
export interface SingularityGalleryCard {
  /** La cible de l'EX Buff (`fire`, `ranger`…) : la clé de la combinaison. */
  key: string;
  /** La pastille de l'EX Buff, rendue par le serveur. */
  badge: ReactNode;
  /** L'étiquette de la combinaison active (semaine, jour) — la seule carte qui en porte une. */
  flag?: ReactNode;
  videos: VideoItem[];
}

/** La miniature d'une vidéo : YouTube seul en garantit une, dérivée de l'id. */
const thumbOf = (v: VideoItem): string | undefined =>
  v.platform === 'youtube'
    ? `https://i.ytimg.com/vi/${encodeURIComponent(v.id)}/mqdefault.jpg`
    : undefined;

function CardBody({
  card,
  labels,
}: {
  card: SingularityGalleryCard;
  labels: { by: string; none: string; count: string };
}) {
  const first = card.videos[0];
  const thumb = first && thumbOf(first);
  return (
    <>
      {card.flag}
      <span className="block">{card.badge}</span>
      {first ? (
        <span className="flex items-start gap-3">
          <span className="border-line-subtle bg-surface-sunken relative block aspect-video w-32 shrink-0 overflow-hidden rounded-lg border">
            {thumb && (
              <img
                src={thumb}
                alt=""
                aria-hidden
                width={320}
                height={180}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            )}
            {!thumb && (
              <span className="text-content-subtle absolute inset-0 flex items-center justify-center font-mono text-[10.5px] tracking-[0.14em] uppercase">
                {first.platform}
              </span>
            )}
          </span>
          <span className="min-w-0 space-y-1">
            <span className="text-content-strong line-clamp-2 block text-sm font-semibold">
              {first.label ?? cleanVideoTitle(first.title)}
            </span>
            {first.author && (
              <span className="text-content-muted block text-xs">
                {labels.by.replace('{author}', first.author)}
              </span>
            )}
            {card.videos.length > 1 && (
              <span className="text-accent block font-mono text-[10.5px] font-semibold tracking-[0.14em] uppercase">
                {labels.count.replace('{count}', String(card.videos.length))}
              </span>
            )}
          </span>
        </span>
      ) : (
        <span className="border-line-subtle text-content-muted flex min-h-20 items-center justify-center rounded-lg border border-dashed text-sm">
          {labels.none}
        </span>
      )}
    </>
  );
}

export function SingularityVideoGallery({
  cards,
  initial,
  labels,
}: {
  cards: SingularityGalleryCard[];
  /** La carte que le lecteur montre d'abord (la combinaison active, sinon la première avec vidéo). */
  initial?: string;
  labels: { by: string; none: string; count: string };
}) {
  const [selected, setSelected] = useState(initial);
  const current = cards.find((c) => c.key === selected && c.videos.length);
  return (
    <div className="space-y-4">
      {current && (
        // `key` : changer de carte remonte le lecteur — l'onglet actif repart du premier.
        <MultiVideoEmbed key={current.key} byLabel={labels.by} videos={current.videos} />
      )}
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const on = card.key === current?.key;
          const frame = `flex h-full w-full flex-col gap-2 rounded-xl border p-3 text-left ${
            card.flag ? 'border-accent/60 bg-accent/5' : 'border-line-subtle bg-surface-raised'
          }`;
          return (
            <li key={card.key} data-ex={card.key}>
              {card.videos.length ? (
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSelected(card.key)}
                  className={`${frame} hover:border-accent/80 focus-visible:ring-accent cursor-pointer transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                    on ? 'ring-accent ring-1' : ''
                  }`}
                >
                  <CardBody card={card} labels={labels} />
                </button>
              ) : (
                <div className={frame}>
                  <CardBody card={card} labels={labels} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
