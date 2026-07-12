'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

/**
 * LA DIFFICULTÉ COURANTE — l'axe AU-DESSUS du palier.
 *
 * Un palier (`BossRank`) fait varier les stats d'UN monstre. Une difficulté fait
 * varier le MONSTRE lui-même : le Joint Challenge oppose trois créatures
 * distinctes selon qu'on joue Normal, Hard ou Very Hard, et le World Boss en
 * fait apparaître deux à la fois dans ses deux ligues hautes. Rien de tout ça ne
 * se recalcule côté client — icône, nom, élément, immunités et compétences
 * changent. Le SERVEUR rend donc toutes les difficultés ; ce contexte ne décide
 * que de celle qu'on regarde.
 *
 * Les deux axes restent SÉPARÉS : le palier ne sait rien de la difficulté, la
 * difficulté ne sait rien du palier. La Singularity n'a que le premier, le Joint
 * Challenge que le second, le World Boss les deux — et aucun des trois n'a besoin
 * de connaître les autres.
 */
interface EncounterValue {
  count: number;
  selected: number;
  setSelected: (index: number) => void;
}

const EncounterContext = createContext<EncounterValue | null>(null);

export function EncounterSelection({
  count,
  defaultIndex,
  children,
}: {
  count: number;
  /** Difficulté ouverte au premier rendu — celle que le guide traite. */
  defaultIndex: number;
  children: ReactNode;
}) {
  const [selected, setSelected] = useState(defaultIndex);
  return (
    <EncounterContext.Provider value={{ count, selected, setSelected }}>
      {children}
    </EncounterContext.Provider>
  );
}

function useEncounter(): EncounterValue {
  const value = useContext(EncounterContext);
  if (!value) throw new Error('useEncounter : à utiliser sous <EncounterSelection>.');
  return value;
}

/**
 * Le sélecteur de difficulté. Segmenté plutôt que déroulant : trois ou quatre
 * choix se lisent d'un coup d'œil, et on veut voir qu'il y en a d'autres.
 */
export function EncounterTabs({ label, tabs }: { label: string; tabs: string[] }) {
  const { selected, setSelected } = useEncounter();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <h3 className="text-content font-mono text-[10px] font-semibold tracking-[0.14em] uppercase">
        {label}
      </h3>
      <div
        role="tablist"
        aria-label={label}
        className="border-line-subtle bg-surface-sunken inline-flex rounded-lg border p-0.5"
      >
        {tabs.map((tab, i) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={i === selected}
            onClick={() => setSelected(i)}
            className={`rounded-md px-3 py-1 text-sm font-semibold transition-colors ${
              i === selected
                ? 'bg-accent text-accent-fg'
                : 'text-content hover:bg-surface-raised cursor-pointer'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Le contenu d'UNE difficulté. Rendu par le serveur, monté seulement quand il
 * est choisi : le balisage des autres voyage déjà dans la charge utile, donc le
 * changement est instantané et ne redemande rien au réseau.
 */
export function EncounterPane({ index, children }: { index: number; children: ReactNode }) {
  const { selected } = useEncounter();
  return index === selected ? <>{children}</> : null;
}
