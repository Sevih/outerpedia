'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { dedupSpawnContexts, type SpawnContext } from '@/lib/monster-stats';

/**
 * LE PALIER COURANT, partagé.
 *
 * Le palier choisi ne décide pas que des stats : il décide aussi du NIVEAU du
 * boss, qui se lit dans l'en-tête, à côté de sa classe — donc à l'autre bout du
 * panneau. Deux endroits, une seule vérité : elle vit ici.
 *
 * Sans ça, le niveau de l'en-tête serait figé au rendu serveur et mentirait dès
 * qu'on touche à la glissière. Un contexte plutôt qu'un composant client géant :
 * l'en-tête, les immunités et les compétences restent rendus par le SERVEUR.
 */
interface BossRankValue {
  /** Rencontres réelles, dédupliquées — l'échelle de paliers. */
  options: SpawnContext[];
  selected: number;
  setSelected: (index: number) => void;
  /** La rencontre courante (repli neutre si le boss n'a aucun spawn connu). */
  ctx: SpawnContext;
}

const BossRankContext = createContext<BossRankValue | null>(null);

export function BossRankProvider({
  spawns,
  children,
}: {
  spawns: SpawnContext[];
  children: ReactNode;
}) {
  // Par défaut le PREMIER palier : c'est celui qu'on affronte d'abord. Ouvrir sur
  // SSS++ montrerait un boss que presque personne ne combat.
  const [selected, setSelected] = useState(0);
  const value = useMemo<BossRankValue>(() => {
    const options = dedupSpawnContexts(spawns);
    return {
      options,
      selected,
      setSelected,
      ctx: options[selected] ?? { level: 100 },
    };
  }, [spawns, selected]);

  return <BossRankContext.Provider value={value}>{children}</BossRankContext.Provider>;
}

export function useBossRank(): BossRankValue {
  const value = useContext(BossRankContext);
  if (!value) throw new Error('useBossRank : à utiliser sous <BossRankProvider>.');
  return value;
}

/**
 * Niveau du boss AU PALIER COURANT — se pose à côté de sa classe, dans l'en-tête.
 * C'est là qu'on le cherche (le jeu l'écrit au même endroit), et ça évite de
 * répéter le palier trois fois autour de la glissière, qui le porte déjà.
 */
export function BossLevel({ label }: { label: string }) {
  const { ctx } = useBossRank();
  return (
    <span className="text-content-strong text-sm font-semibold">
      {label} {ctx.level}
    </span>
  );
}
