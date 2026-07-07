import type { ReactNode } from 'react';
import { img } from '@/lib/images';

/** Une carte de burst pré-rendue (coût AP + effet localisé). */
export interface BurstCard {
  level: 1 | 2 | 3;
  cost?: number;
  effect: ReactNode;
}

/**
 * Section Burst (portage V2) : les 3 cartes du jeu (IG_Button_Burst_0X,
 * ratio 220/310), coût AP en haut à droite, texte d'effet dans la zone basse.
 * Composant SERVEUR — les effets arrivent pré-rendus.
 * Rappel jeu : burst 1+2 dès l'obtention, burst 3 à la transcendance 5★.
 */
export function BurstSection({ bursts }: { bursts: BurstCard[] }) {
  if (!bursts.length) return null;

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {bursts.map((burst) => (
        <div
          key={burst.level}
          className="relative w-44 shrink-0"
          style={{ aspectRatio: '220 / 310' }}
        >
          {/* Cadre de la carte (fond du jeu) */}
          {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
          <img
            src={img.burstCard(burst.level)}
            alt={`Burst ${burst.level}`}
            className="pointer-events-none absolute inset-0 h-full w-full object-contain"
          />

          {/* Coût AP — pastille en haut à droite */}
          {burst.cost !== undefined && (
            <div className="absolute top-[3%] right-[4%] flex h-7 w-7 items-center justify-center">
              <span className="font-game text-xs font-bold text-white">{burst.cost}</span>
            </div>
          )}

          {/* Texte d'effet — zone basse */}
          <div className="absolute top-[48%] right-[10%] bottom-[5%] left-[5%] flex items-center overflow-y-auto px-1">
            <div className="w-full text-center text-[10px] leading-tight text-zinc-200">
              {burst.effect}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
