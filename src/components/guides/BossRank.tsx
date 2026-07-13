'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { dedupSpawnContexts, type SpawnContext } from '@/lib/monster-stats';
import { useEncounterSelectionMaybe } from './EncounterSelection';

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
  /**
   * Le palier est PILOTÉ par la sélection de rencontre au-dessus (mode
   * suiveur) : la carte n'affiche alors aucun sélecteur à elle — deux curseurs
   * pour un même axe se contrediraient.
   */
  controlled: boolean;
}

const BossRankContext = createContext<BossRankValue | null>(null);

export function BossRankProvider({
  spawns,
  followStages,
  children,
}: {
  spawns: SpawnContext[];
  /**
   * MODE SUIVEUR : sélection d'`EncounterSelection` → index dans `spawns`.
   * C'est le contrat des cartes FUSIONNÉES (Special Request) : la carte couvre
   * plusieurs stages, et son contexte de stats doit suivre le stage choisi en
   * haut de page — pas un état local qui mentirait dès qu'on bouge l'échelle.
   * Les spawns sont alors indexés TELS QUE FOURNIS (pas de dédup : le mode a
   * déjà curé son échelle, et la table d'index doit rester alignée).
   */
  followStages?: Record<number, number>;
  children: ReactNode;
}) {
  const encounter = useEncounterSelectionMaybe();
  const followed = followStages && encounter ? (followStages[encounter.selected] ?? 0) : undefined;
  // Par défaut le PREMIER palier : c'est celui qu'on affronte d'abord. Ouvrir sur
  // SSS++ montrerait un boss que presque personne ne combat.
  const [localSelected, setSelected] = useState(0);
  const value = useMemo<BossRankValue>(() => {
    const controlled = followed !== undefined;
    const options = controlled ? spawns : dedupSpawnContexts(spawns);
    const selected = followed ?? localSelected;
    return {
      options,
      selected,
      setSelected,
      ctx: options[selected] ?? { level: 100 },
      controlled,
    };
  }, [spawns, localSelected, followed]);

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
