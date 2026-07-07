'use client';

import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';

/**
 * Palier de transcendance SÉLECTIONNÉ, partagé entre le TranscendSlider et la
 * table Base Stats (une seule source — le slider pilote, la table suit).
 */
const Ctx = createContext<{ idx: number; setIdx: Dispatch<SetStateAction<number>> } | null>(null);

export function TranscendTierProvider({
  initial,
  children,
}: {
  initial: number;
  children: ReactNode;
}) {
  const [idx, setIdx] = useState(initial);
  return <Ctx.Provider value={{ idx, setIdx }}>{children}</Ctx.Provider>;
}

/** `null` hors provider (les composants retombent sur leur état local). */
export function useTranscendTier() {
  return useContext(Ctx);
}
