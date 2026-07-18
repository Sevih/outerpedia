/**
 * ORDRE DE JEU — la suite des personnages par vitesse décroissante.
 *
 * Le réglage de vitesse est le cœur d'une compo de guild raid : qui joue avant
 * qui, et à quelle vitesse exacte. On le montre comme le jeu le vit — une file
 * d'icônes ATB, chacune avec sa vitesse. Composant SERVEUR ; un nom de perso
 * inconnu JETTE (build SSG cassé), comme partout dans les guides.
 */
import type { ReactNode } from 'react';
import type { Route } from 'next';
import Link from 'next/link';
import type { Lang } from '@/lib/i18n/config';
import { resolveGuideCharacter } from '@/lib/data/characters';
import { img } from '@/lib/images';

export interface TurnOrderStep {
  character: string;
  speed: number | string;
}

export function TurnOrder({
  steps,
  note,
  lang,
}: {
  steps: TurnOrderStep[];
  /** Note déjà localisée/parseText côté appelant. */
  note?: ReactNode;
  lang: Lang;
}) {
  if (!steps.length) return null;
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center justify-center gap-y-2">
        {steps.map((step, i) => {
          const {
            character: c,
            name,
            href,
          } = resolveGuideCharacter(step.character, lang, 'TurnOrder');
          return (
            <div key={i} className="flex items-center">
              {i > 0 && <span className="text-content-muted mx-2 text-lg select-none">›</span>}
              <div className="flex items-center gap-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element -- sprite ATB */}
                <img
                  src={img.atb(c.id)}
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 shrink-0 rounded object-contain"
                />
                <span className="flex flex-col items-start leading-tight">
                  {href ? (
                    <Link href={href as Route} className="text-accent text-sm hover:underline">
                      {name}
                    </Link>
                  ) : (
                    <span className="text-content-strong text-sm">{name}</span>
                  )}
                  <span className="text-stat text-xs">{step.speed} SPD</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {note && <p className="text-content-muted text-center text-sm">{note}</p>}
    </div>
  );
}
