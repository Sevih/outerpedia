'use client';

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';

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
  // Même partition que RankSlider : `hit` ÉCOUTE (toute la zone, débords du
  // pouce compris), `rail` MESURE (la géométrie 0 % → 100 % se lit sur lui seul).
  const hit = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const pos = last > 0 ? selected / last : 0;

  const clamp = useCallback((i: number) => Math.min(last, Math.max(0, i)), [last]);

  const indexAt = useCallback(
    (clientX: number) => {
      const box = rail.current?.getBoundingClientRect();
      if (!box || box.width === 0) return selected;
      const ratio = Math.min(1, Math.max(0, (clientX - box.left) / box.width));
      return Math.round(ratio * last);
    },
    [last, selected],
  );

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    hit.current?.setPointerCapture(e.pointerId);
    dragging.current = true;
    setSelected(indexAt(e.clientX));
  };
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragging.current) setSelected(indexAt(e.clientX));
  };
  const onUp = () => {
    dragging.current = false;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const jump: Record<string, number> = {
      ArrowRight: 1,
      ArrowUp: 1,
      ArrowLeft: -1,
      ArrowDown: -1,
      PageUp: 3,
      PageDown: -3,
    };
    let next: number;
    if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = last;
    else if (e.key in jump) next = clamp(selected + jump[e.key]!);
    else return;
    e.preventDefault();
    setSelected(next);
  };

  const step = (delta: 1 | -1, aria: string, glyph: string) => (
    <button
      type="button"
      aria-label={aria}
      disabled={delta < 0 ? selected === 0 : selected === last}
      onClick={() => setSelected(clamp(selected + delta))}
      className="border-line bg-surface-base text-content hover:text-content-strong enabled:hover:border-line-strong flex h-7 w-6 shrink-0 items-center justify-center rounded border text-[10px] transition-colors disabled:opacity-30"
    >
      {glyph}
    </button>
  );

  return (
    <div className="border-line-subtle bg-surface-raised flex flex-col gap-1 rounded-xl border px-3 py-3 lg:max-w-xl lg:flex-1">
      <div className="flex flex-wrap items-baseline gap-2">
        <h3 className="text-content font-mono text-[10px] font-semibold tracking-[0.14em] uppercase">
          {label}
        </h3>
        <span className="text-content-strong text-sm font-semibold">{titles[selected]}</span>
      </div>

      <div className="flex items-center gap-2">
        {step(-1, prevLabel, '◀')}

        <div
          ref={hit}
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={last}
          aria-valuenow={selected}
          aria-valuetext={titles[selected]}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onLostPointerCapture={onUp}
          onKeyDown={onKeyDown}
          className="focus-visible:ring-ring min-w-0 flex-1 cursor-pointer touch-none rounded px-4 py-0.5 select-none focus-visible:ring-2 focus-visible:outline-none"
        >
          <div ref={rail} className="relative h-8">
            <span
              aria-hidden
              className="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 rounded-full"
              style={{
                background:
                  'linear-gradient(90deg, var(--rank-heat-lo), var(--rank-heat-mid), var(--rank-heat-hi))',
              }}
            />

            {ticks.map((_, i) => (
              <span
                key={i}
                aria-hidden
                className="bg-surface-sunken absolute top-1/2 h-2 w-px -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40"
                style={{ left: `${(last > 0 ? i / last : 0) * 100}%` }}
              />
            ))}

            <span
              aria-hidden
              className="border-accent bg-surface-base ring-accent/20 pointer-events-none absolute top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg border-2 shadow-lg ring-4 transition-[left] duration-75"
              style={{ left: `${pos * 100}%` }}
            >
              <span className="text-content-strong font-mono text-xs font-bold">
                {ticks[selected]}
              </span>
            </span>
          </div>

          {/* Chaque cran garde son numéro : treize repères courts tiennent la
              ligne, et l'échelle se lit d'un coup d'œil — c'est sa raison d'être. */}
          <div aria-hidden className="relative h-4">
            {ticks.map((tick, i) => (
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
          </div>
        </div>

        {step(1, nextLabel, '▶')}
      </div>
    </div>
  );
}
