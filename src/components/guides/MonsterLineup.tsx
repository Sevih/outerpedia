'use client';

import { useState, type ReactNode } from 'react';
import { lineupRows, type LineupEntry, type LineupRow } from '@/lib/lineup';
import { useEncounterSelectionMaybe } from './EncounterSelection';

/**
 * LA MISE EN PAGE DES MONSTRES D'UN COMBAT — et rien d'autre.
 *
 * À ne pas confondre avec `EncounterSelection`, qui est l'axe AU-DESSUS : elle
 * choisit QUEL COMBAT on regarde (difficulté, stage). Ici on est DANS un combat,
 * et la seule question est comment ranger ceux qui s'y battent ENSEMBLE. Les deux
 * ne se touchent que sur un point : quand un mode à stages fait entrer et sortir
 * des monstres d'un stage à l'autre, la rangée doit savoir qui est là — elle LIT
 * la sélection, elle ne la pilote jamais.
 *
 * La RÈGLE (1 → pleine largeur, 2 → côte à côte, 3+ → vignettes) vit dans
 * `@/lib/lineup`, où elle se teste sans DOM. Ici, on ne fait que la rendre.
 */
export interface LineupItem extends LineupEntry {
  /** Nom d'affichage (désambiguïsé par l'appelant — cf. `monsterDisplayNames`). */
  name: string;
  iconSrc: string;
  /** La carte, rendue par le SERVEUR — la rangée ne connaît pas son contenu. */
  card: ReactNode;
}

export function MonsterLineup({
  items,
  /** « Renfort » — aria de la barre de vignettes (composant client : il ne traduit pas). */
  addsLabel,
}: {
  items: LineupItem[];
  addsLabel: string;
}) {
  const selection = useEncounterSelectionMaybe();
  const rows = lineupRows(items, selection?.selected);

  return (
    <div className="space-y-6">
      {rows.map((row) => (
        <LineupRowView key={row.role} row={row} label={addsLabel} />
      ))}
    </div>
  );
}

function LineupRowView({ row, label }: { row: LineupRow<LineupItem>; label: string }) {
  if (row.mode === 'solo') return <>{row.items[0].card}</>;

  // DEUX : côte à côte. Ils se comparent — c'est tout l'intérêt de les voir
  // ensemble. Empilés en dessous de `md` : deux cartes de stats dans un
  // téléphone, ce n'est plus une comparaison, c'est une bouillie.
  if (row.mode === 'pair') {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {row.items.map((item, i) => (
          <div key={i} className="min-w-0">
            {item.card}
          </div>
        ))}
      </div>
    );
  }

  return <CompactRoster items={row.items} label={label} />;
}

/**
 * TROIS OU PLUS — la barre de vignettes.
 *
 * Trois cartes complètes côte à côte ne tiennent pas, et empilées elles noient le
 * boss sous ses propres sbires. On montre donc QUI est là (vignette + nom, tous
 * visibles d'un coup) et on déplie celui qu'on regarde.
 *
 * L'état est LOCAL et ne concerne que cette rangée : ce n'est pas un sélecteur de
 * combat, c'est le sommaire d'un combat. Les cartes non dépliées voyagent déjà
 * dans la charge utile (rendues par le serveur) — la bascule est instantanée.
 */
function CompactRoster({ items, label }: { items: LineupItem[]; label: string }) {
  const [active, setActive] = useState(0);
  // La composition change d'un stage à l'autre : l'index d'hier peut ne plus
  // exister aujourd'hui. On le borne AU RENDU plutôt que de le corriger dans un
  // effet — pas d'état à resynchroniser, donc rien à désynchroniser.
  const selected = Math.min(active, items.length - 1);

  return (
    <div className="space-y-3">
      <div role="tablist" aria-label={label} className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === selected}
            onClick={() => setActive(i)}
            className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-colors ${
              i === selected
                ? 'border-accent bg-accent/10 text-content-strong'
                : 'border-line-subtle text-content hover:bg-surface-raised'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
            <img
              src={item.iconSrc}
              alt=""
              className="h-6 w-6 shrink-0 rounded object-cover"
              loading="lazy"
            />
            <span className="max-w-40 truncate">{item.name}</span>
          </button>
        ))}
      </div>

      {items[selected]?.card}
    </div>
  );
}
