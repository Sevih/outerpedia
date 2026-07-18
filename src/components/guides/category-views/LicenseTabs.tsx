'use client';

import { useState } from 'react';
import type { Route } from 'next';
import Link from 'next/link';

/** Une carte de licence, préparée côté serveur (URLs complètes, nom localisé). */
export interface LicenseCard {
  slug: string;
  href: Route;
  name: string;
  /** Face de la carte (promotion : la face VERROUILLÉE). */
  src: string;
  /** Face révélée — présent = carte spoiler, à retourner avant de naviguer. */
  openSrc?: string;
}

/** Largeur de carte : 3 par rangée en mobile, 7 en desktop (portage V2). */
const CARD_W = 'w-[calc((100%-2*1rem)/3)] sm:w-[calc((100%-6*2rem)/7)]';

/**
 * Onglets Weekly / Promotion + galerie de cartes (portage V2). L'état client
 * ne porte que l'onglet actif et les cartes déjà révélées — le contenu vient
 * préparé du serveur.
 */
export function LicenseTabs({
  weekly,
  promotion,
  labels,
}: {
  weekly: LicenseCard[];
  promotion: LicenseCard[];
  labels: { weekly: string; promotion: string; reveal: string };
}) {
  const [tab, setTab] = useState<'weekly' | 'promotion'>('weekly');
  const [revealed, setRevealed] = useState<ReadonlySet<string>>(new Set());
  const reveal = (slug: string) => setRevealed((prev) => new Set(prev).add(slug));

  // Une seule population : pas d'onglet pour une liste vide.
  const tabs = weekly.length && promotion.length;
  const items = tabs ? (tab === 'weekly' ? weekly : promotion) : weekly.length ? weekly : promotion;

  return (
    <div className="space-y-6">
      {tabs ? (
        <div className="flex justify-center gap-2">
          {(['weekly', 'promotion'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                tab === key
                  ? 'border-yellow-400/50 bg-yellow-400/10 text-yellow-300'
                  : 'border-line bg-surface-overlay text-content hover:bg-line'
              }`}
            >
              {labels[key]}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap justify-center gap-4 sm:gap-x-8 sm:gap-y-6">
        {items.map((card) =>
          card.openSrc ? (
            <PromotionCard
              key={card.slug}
              card={card}
              revealed={revealed.has(card.slug)}
              onReveal={() => reveal(card.slug)}
              revealLabel={labels.reveal}
            />
          ) : (
            <WeeklyCard key={card.slug} card={card} />
          ),
        )}
      </div>
    </div>
  );
}

/** Carte hebdo : l'art de la licence, le nom dessous. */
function WeeklyCard({ card }: { card: LicenseCard }) {
  return (
    <Link href={card.href} className={`group flex flex-col items-center gap-1.5 ${CARD_W}`}>
      <div className="relative aspect-150/260 w-full overflow-hidden rounded-lg transition-all group-hover:ring-1 group-hover:ring-yellow-400/50">
        {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
        <img
          src={card.src}
          alt={card.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <p className="text-content line-clamp-2 w-full text-center text-xs font-medium">
        {card.name}
      </p>
    </Link>
  );
}

/**
 * Carte promotion (SPOILER) : face verrouillée, un clic la retourne (rotation
 * 3D) sur la face révélée qui mène au guide. Le nom n'apparaît qu'une fois la
 * carte retournée — avant, le bouton « Révéler ».
 */
function PromotionCard({
  card,
  revealed,
  onReveal,
  revealLabel,
}: {
  card: LicenseCard;
  revealed: boolean;
  onReveal: () => void;
  revealLabel: string;
}) {
  return (
    <div className={`flex flex-col items-center gap-1.5 ${CARD_W}`}>
      <div className="relative aspect-150/260 w-full perspective-[600px]">
        <div
          className={`relative h-full w-full transition-transform duration-500 transform-3d ${
            revealed ? 'transform-[rotateY(180deg)]' : ''
          }`}
        >
          {/* Face avant — verrouillée (clic = révéler). `backface-hidden` ne
              masque qu'au VISUEL : on sort la face cachée du focus + des
              lecteurs d'écran (sinon les deux faces sont tabulables/annoncées). */}
          <button
            type="button"
            onClick={onReveal}
            aria-label={revealLabel}
            aria-hidden={revealed}
            tabIndex={revealed ? -1 : 0}
            className="absolute inset-0 cursor-pointer overflow-hidden rounded-lg backface-hidden"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
            <img
              src={card.src}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </button>

          {/* Face arrière — révélée (lien vers le guide). Hors focus/lecteurs
              tant que la carte n'est pas retournée. */}
          <Link
            href={card.href}
            aria-hidden={!revealed}
            tabIndex={revealed ? 0 : -1}
            className="group absolute inset-0 transform-[rotateY(180deg)] overflow-hidden rounded-lg transition-all backface-hidden hover:ring-1 hover:ring-yellow-400/50"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
            <img
              src={card.openSrc}
              alt={card.name}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
        </div>
      </div>

      {revealed ? (
        <p className="text-content line-clamp-2 w-full text-center text-xs font-medium">
          {card.name}
        </p>
      ) : (
        <button
          onClick={onReveal}
          className="w-full cursor-pointer text-center text-xs font-medium text-yellow-300 transition-colors hover:text-yellow-200"
        >
          {revealLabel}
        </button>
      )}
    </div>
  );
}
