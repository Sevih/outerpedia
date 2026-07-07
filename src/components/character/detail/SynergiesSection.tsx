import type { ReactNode } from 'react';
import { CharacterPortrait } from '@/components/character/CharacterPortrait';

/** Un partenaire résolu (perso) ou une réf libre (tag `{…}` rendue en amont). */
export type SynergyHeroView =
  | {
      id: string;
      name: string;
      element: string;
      classType: string;
      rarity: number;
      href?: string;
    }
  | { tag: ReactNode };

export interface SynergyGroupView {
  heroes: SynergyHeroView[];
  /** Raison partagée, déjà passée par parse-text. */
  reason?: ReactNode;
}

/**
 * Synergies (portage V2) : une carte par groupe de partenaires — portraits
 * cliquables + raison (tags inline résolus côté serveur).
 */
export function SynergiesSection({ groups }: { groups: SynergyGroupView[] }) {
  return (
    <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {groups.map((g, i) => (
        <li key={i} className="card flex flex-col gap-3 rounded-xl p-4">
          <div className="flex flex-wrap gap-3">
            {g.heroes.map((h, j) =>
              'tag' in h ? (
                <span key={j} className="flex items-center text-sm">
                  {h.tag}
                </span>
              ) : (
                <CharacterPortrait
                  key={j}
                  id={h.id}
                  name={h.name}
                  element={h.element}
                  classType={h.classType}
                  rarity={h.rarity}
                  size={56}
                  href={h.href}
                />
              ),
            )}
          </div>
          {g.reason && <p className="text-sm leading-relaxed text-zinc-300">{g.reason}</p>}
        </li>
      ))}
    </ul>
  );
}
