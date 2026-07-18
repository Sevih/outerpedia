'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { onTabListKeyDown } from '@/lib/tablist';
import { HeatSlider } from './HeatSlider';

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
 * La sélection courante, SI on est sous un `<EncounterSelection>` — `null`
 * sinon. C'est la porte d'entrée du mode SUIVEUR de `BossRankProvider` : une
 * carte posée dans un mode à stages cale son palier sur le stage choisi, la
 * même carte posée ailleurs garde son état local. Elle doit donc pouvoir
 * demander « y a-t-il une sélection au-dessus de moi ? » sans jeter.
 */
export function useEncounterSelectionMaybe(): EncounterValue | null {
  return useContext(EncounterContext);
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
        onKeyDown={(e) => onTabListKeyDown(e, tabs.length, selected, setSelected)}
      >
        {tabs.map((tab, i) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={i === selected}
            tabIndex={i === selected ? 0 : -1}
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
 *
 * `indexes` : le même contenu peut valoir pour PLUSIEURS sélections — une carte
 * fusionnée du Special Request couvre tous les stages où son variant apparaît,
 * une équipe recommandée couvre sa plage de stages. Une seule fois dans la
 * charge utile, visible sur toute sa plage.
 */
export function EncounterPane({
  index,
  indexes,
  children,
}: {
  index?: number;
  indexes?: number[];
  children: ReactNode;
}) {
  const { selected } = useEncounter();
  const visible = indexes ? indexes.includes(selected) : index === selected;
  return visible ? <>{children}</> : null;
}

/**
 * GLISSIÈRE DE STAGES — le sélecteur des échelles longues.
 *
 * Treize stages en boutons segmentés (`EncounterTabs`) mangent deux lignes et
 * ne disent rien de la PROGRESSION ; une échelle se montre. Même géométrie et
 * mêmes gestes que la glissière de palier (`RankSlider`, `BossStats`) : piste
 * en dégradé de chaleur, crans posés à leur position réelle, pouce glissable,
 * clavier (←/→ un stage, Page↑/↓ trois, Début/Fin), pas-à-pas ◀ ▶. Elle ne
 * s'en distingue que par ce qu'elle pilote : la SÉLECTION de rencontre
 * (`EncounterSelection`), pas le palier d'une carte — les cartes suivent via
 * `BossRankProvider` en mode suiveur.
 *
 * Composant client PRÉ-LOCALISÉ : `ticks` porte le numéro court de chaque cran,
 * `titles` sa désignation complète (aria + rappel courant).
 */
export function EncounterSlider({
  label,
  ticks,
  titles,
  prevLabel,
  nextLabel,
}: {
  /** Nom du curseur (« Stage ») — affiché et lu par les lecteurs d'écran. */
  label: string;
  /** Libellé court de chaque cran (« 1 » … « 13 »), posé sous sa graduation. */
  ticks: string[];
  /** Désignation complète de chaque cran (« Stage 7 — Lv. 60 ») — aria + rappel. */
  titles: string[];
  prevLabel: string;
  nextLabel: string;
}) {
  const { count, selected, setSelected } = useEncounter();
  const last = count - 1;

  return (
    <div className="border-line-subtle bg-surface-raised flex flex-col gap-1 rounded-xl border px-3 py-3 lg:max-w-xl lg:flex-1">
      <div className="flex flex-wrap items-baseline gap-2">
        <h3 className="text-content font-mono text-[10px] font-semibold tracking-[0.14em] uppercase">
          {label}
        </h3>
        <span className="text-content-strong text-sm font-semibold">{titles[selected]}</span>
      </div>

      <HeatSlider
        count={count}
        selected={selected}
        onSelect={setSelected}
        ariaLabel={label}
        valueText={titles[selected]}
        prevLabel={prevLabel}
        nextLabel={nextLabel}
        railClass="h-8"
        padClass="px-4"
        thumbClass="h-7 w-7 rounded-lg"
        marks={ticks.map((_, i) => (
          <span
            key={i}
            aria-hidden
            className="bg-surface-sunken absolute top-1/2 h-2 w-px -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40"
            style={{ left: `${(last > 0 ? i / last : 0) * 100}%` }}
          />
        ))}
        thumb={
          <span className="text-content-strong font-mono text-xs font-bold">{ticks[selected]}</span>
        }
        // Chaque cran garde son numéro : treize repères courts tiennent la ligne,
        // l'échelle se lit d'un coup d'œil — c'est sa raison d'être.
        labels={ticks.map((tick, i) => (
          <span
            key={i}
            className={`absolute -translate-x-1/2 font-mono text-[10px] font-bold transition-colors ${
              i === selected ? 'text-accent' : 'text-content-muted'
            }`}
            style={{ left: `${(last > 0 ? i / last : 0) * 100}%` }}
          >
            {tick}
          </span>
        ))}
      />
    </div>
  );
}
