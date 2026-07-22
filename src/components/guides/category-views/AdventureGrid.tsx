'use client';

import { useState } from 'react';
import type { Route } from 'next';
import Link from 'next/link';

/** Un stage guidé, préparé côté serveur (URLs complètes, textes localisés). */
export interface StageCard {
  slug: string;
  href: Route;
  /** Épisode du stage, abrégé et localisé (« Ep. 8 ») — en tête de carte. */
  episode: string;
  /** Zone du stage (`area` du donjon le plus dur) — le titre de la carte. */
  area: string;
  /** Art de la zone (l'icône du meta). */
  src: string;
  /** Le boss du guide — caché tant que le lecteur n'a pas accepté le spoiler. */
  boss: { name: string; src: string };
}

/** Une saison de l'histoire : sa section dans la page. */
export interface SeasonSection {
  season: number;
  label: string;
  stages: StageCard[];
}

/**
 * Les stages guidés, par saison — avec l'interrupteur à SPOILERS.
 *
 * Le nom d'un boss d'histoire est un spoiler d'intrigue : les cartes s'ouvrent
 * donc sur la zone seule, et le lecteur DEMANDE les boss. La V2 avait le même
 * interrupteur, mais son libellé annonçait l'état au lieu de l'action (cartes
 * masquées → bouton « Spoiler-free ») : ici le bouton dit toujours ce qu'un clic
 * FERA. L'état ne vit que le temps de la visite — rien à retenir d'une page à
 * l'autre pour une préférence qui se reprend d'un clic.
 */
export function AdventureGrid({
  sections,
  labels,
}: {
  sections: SeasonSection[];
  labels: { reveal: string; hide: string };
}) {
  const [spoilers, setSpoilers] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setSpoilers((v) => !v)}
          aria-pressed={spoilers}
          className={`cursor-pointer rounded-lg border px-3 py-1.5 text-sm transition-colors ${
            spoilers
              ? 'border-select/50 bg-select/10 text-select-fg'
              : 'border-line bg-surface-overlay text-content hover:bg-line'
          }`}
        >
          {spoilers ? labels.hide : labels.reveal}
        </button>
      </div>

      {sections.map(({ season, label, stages }) => (
        <section key={season} className="space-y-3">
          <h2 className="text-content-strong text-lg font-bold">{label}</h2>
          <div className="flex flex-wrap gap-3">
            {stages.map((stage) => (
              <StageTile key={stage.slug} stage={stage} spoilers={spoilers} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/**
 * Carte d'un stage (visuel V2) : l'art de la zone en fond, l'épisode et la zone
 * en haut, le boss en bas — lui seul dépend du spoiler. La carte garde sa taille
 * dans les deux états : révéler les boss ne doit pas faire sauter la grille sous
 * le curseur.
 */
function StageTile({ stage, spoilers }: { stage: StageCard; spoilers: boolean }) {
  return (
    <Link
      href={stage.href}
      className="ring-line group hover:ring-select/50 relative h-40 w-20 overflow-hidden rounded-lg ring-1 transition-all sm:h-64 sm:w-32"
    >
      <img
        src={stage.src}
        alt=""
        aria-hidden
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      {/* Les deux dégradés : le haut porte l'épisode et la zone, le bas le boss. */}
      <div className="absolute inset-0 bg-linear-to-b from-black/70 via-transparent to-black/80" />

      <div className="absolute inset-x-0 top-0 space-y-0.5 p-2">
        <p className="text-content-muted text-[10px] font-medium drop-shadow-lg">{stage.episode}</p>
        <p className="text-content-strong line-clamp-3 text-xs font-medium drop-shadow-lg">
          {stage.area}
        </p>
      </div>

      {spoilers && (
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-1 p-2">
          <img
            src={stage.boss.src}
            alt={stage.boss.name}
            loading="lazy"
            className="ring-line h-10 w-10 rounded-md object-cover ring-1 sm:h-14 sm:w-14"
            width={40}
            height={40}
          />
          <span className="text-content-strong hidden max-w-full truncate text-xs font-medium drop-shadow-lg sm:block">
            {stage.boss.name}
          </span>
        </div>
      )}
    </Link>
  );
}
