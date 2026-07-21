'use client';

/**
 * LES ADDS d'un combat very hard — un SÉLECTEUR de portraits + la carte compacte
 * de l'add choisi, plutôt qu'une pile de cartes.
 *
 * Les cartes (`BossCard`, serveur) sont TOUTES pré-rendues et passées en
 * ReactNode ; le client ne fait que montrer celle du portrait actif (les autres
 * restent montées mais masquées — leur état interne, comme le repli des stats,
 * est préservé). Un seul add ⇒ pas de sélecteur, juste la carte.
 */
import { useState, type ReactNode } from 'react';

export interface TowerAdd {
  id: string;
  name: string;
  iconSrc?: string;
  card: ReactNode;
}

export function TowerAddsSelector({ adds }: { adds: TowerAdd[] }) {
  const [sel, setSel] = useState(0);
  if (!adds.length) return null;
  const current = Math.min(sel, adds.length - 1);

  return (
    <div className="space-y-3">
      {adds.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {adds.map((a, i) => {
            const on = i === current;
            return (
              <button
                key={a.id}
                type="button"
                title={a.name}
                aria-pressed={on}
                onClick={() => setSel(i)}
                className={[
                  'flex flex-col items-center gap-1 rounded-lg border p-1 transition-colors',
                  on ? 'border-accent bg-accent/10' : 'border-line-subtle hover:border-line',
                ].join(' ')}
              >
                {a.iconSrc && (
                  <img
                    src={a.iconSrc}
                    alt=""
                    className="h-11 w-11 rounded-md object-cover"
                    loading="lazy"
                  />
                )}
                <span className="text-content-muted max-w-14 truncate text-[11px] leading-tight">
                  {a.name}
                </span>
              </button>
            );
          })}
        </div>
      )}
      {adds.map((a, i) => (
        <div key={a.id} className={i === current ? undefined : 'hidden'}>
          {a.card}
        </div>
      ))}
    </div>
  );
}
