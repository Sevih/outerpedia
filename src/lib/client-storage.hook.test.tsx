// @vitest-environment happy-dom
/**
 * Tests de `useStoredState` — le contrat d'hydratation du hook (premier rendu
 * = fallback, lecture au montage + `ready`, setter write-through). Rendu réel
 * via react-dom/client sous happy-dom (localStorage natif de l'environnement).
 */
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useStoredState, type StoreSpec } from './client-storage';

interface Settings {
  size: number;
}

const SPEC: StoreSpec<Settings> = {
  key: 'outerpedia:test-hook',
  version: 1,
  fallback: { size: 48 },
  legacyKeys: ['legacy-hook'],
  fromLegacy: (data) => ({ size: (data as { s: number }).s }),
};

/** Sonde : expose chaque rendu (valeur + ready) et le setter. */
interface Snap {
  value: Settings;
  ready: boolean;
}
function mount(spec: StoreSpec<Settings>): {
  root: Root;
  renders: Snap[];
  set: (next: Settings | ((prev: Settings) => Settings)) => void;
} {
  const renders: Snap[] = [];
  let setter: (next: Settings | ((prev: Settings) => Settings)) => void = () => {};
  function Probe() {
    const [value, set, ready] = useStoredState(spec);
    renders.push({ value, ready });
    setter = set;
    return null;
  }
  const root = createRoot(document.createElement('div'));
  act(() => root.render(<Probe />));
  return { root, renders, set: (n) => act(() => setter(n)) };
}

beforeEach(() => {
  localStorage.clear();
});

let mounted: Root | undefined;
afterEach(() => {
  act(() => mounted?.unmount());
  mounted = undefined;
});

describe('useStoredState', () => {
  it('premier rendu = fallback, puis hydratation depuis le storage + ready', () => {
    localStorage.setItem(SPEC.key, JSON.stringify({ v: 1, data: { size: 64 } }));
    const { root, renders } = mount(SPEC);
    mounted = root;
    // Le tout premier rendu (celui que le SSR aurait produit) est le fallback.
    expect(renders[0]).toEqual({ value: { size: 48 }, ready: false });
    // Après montage : valeur stockée + ready.
    expect(renders.at(-1)).toEqual({ value: { size: 64 }, ready: true });
  });

  it('storage vide → fallback, mais ready quand même', () => {
    const { root, renders } = mount(SPEC);
    mounted = root;
    expect(renders.at(-1)).toEqual({ value: { size: 48 }, ready: true });
  });

  it('setter write-through : la valeur committée est écrite sous enveloppe', () => {
    const { root, set } = mount(SPEC);
    mounted = root;
    set({ size: 80 });
    expect(JSON.parse(localStorage.getItem(SPEC.key)!)).toEqual({ v: 1, data: { size: 80 } });
  });

  it('updater fonctionnel', () => {
    localStorage.setItem(SPEC.key, JSON.stringify({ v: 1, data: { size: 10 } }));
    const { root, renders, set } = mount(SPEC);
    mounted = root;
    set((prev) => ({ size: prev.size + 5 }));
    expect(renders.at(-1)!.value).toEqual({ size: 15 });
    expect(JSON.parse(localStorage.getItem(SPEC.key)!).data).toEqual({ size: 15 });
  });

  it("absorbe une clé V2 héritée au montage (écrite sous la clé V3, l'héritée reste)", () => {
    localStorage.setItem('legacy-hook', JSON.stringify({ s: 32 }));
    const { root, renders } = mount(SPEC);
    mounted = root;
    expect(renders.at(-1)!.value).toEqual({ size: 32 });
    expect(JSON.parse(localStorage.getItem(SPEC.key)!)).toEqual({ v: 1, data: { size: 32 } });
    expect(localStorage.getItem('legacy-hook')).not.toBeNull();
  });
});
