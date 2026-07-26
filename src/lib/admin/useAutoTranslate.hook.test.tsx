// @vitest-environment happy-dom
/**
 * Contrat de `useAutoTranslate` — l'échafaudage « Translate » dont dépendent
 * maintenant SIX éditeurs (audit F4). Ce qui est verrouillé : la sortie anticipée
 * quand rien n'est périmé, le fait que `commit` ne soit appelé QUE si un appel a
 * eu lieu, le comptage des champs remplis, et qu'une erreur du traducteur
 * n'échappe jamais (elle atterrit dans `message`).
 *
 * Rendu réel via react-dom/client sous happy-dom, comme `client-storage.hook.test`.
 * La server action est mockée : sinon le test dépendrait des clés API et de
 * `IS_DEV`.
 */
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

const autoTranslate = vi.fn();
vi.mock('@/lib/admin/translate-actions', () => ({
  autoTranslate: (...args: unknown[]) => autoTranslate(...args),
}));

const { useAutoTranslate } = await import('./useAutoTranslate');
const { createFreshness } = await import('./translate-fill');

type LText = { en?: string; fr?: string; jp?: string };
const LANGS = ['en', 'fr', 'jp'] as const;

/** Monte le hook et expose son dernier état + le déclencheur. */
function mount(opts: {
  records: LText[];
  baseline?: (string | undefined)[];
  onCommit?: (draft: LText[]) => void;
}) {
  const snaps: { state: string; message: string | null }[] = [];
  let run: () => Promise<void> = async () => {};
  function Probe() {
    const t = useAutoTranslate<LText[]>({
      langs: LANGS,
      freshness: createFreshness(opts.baseline ?? []),
      collect: () => ({ draft: opts.records, records: opts.records }),
      commit: (d) => opts.onCommit?.(d),
    });
    snaps.push({ state: t.state, message: t.message });
    run = t.run;
    return null;
  }
  const root = createRoot(document.createElement('div'));
  act(() => root.render(<Probe />));
  mounted = root;
  return {
    snaps,
    run: async () => await act(async () => void (await run())),
    /** Démarre sans attendre — pour observer l'état PENDANT l'appel. */
    start: () => run(),
  };
}

let mounted: Root | undefined;
afterEach(() => {
  act(() => mounted?.unmount());
  mounted = undefined;
  autoTranslate.mockReset();
});

const last = (snaps: { state: string; message: string | null }[]) => snaps[snaps.length - 1];

describe('useAutoTranslate', () => {
  it('ne traduit rien et ne commite pas quand aucun texte n’est périmé', async () => {
    const commit = vi.fn();
    // Baseline == l'EN présent ⇒ déjà traduit, et fr/jp remplis ⇒ rien à faire.
    const rec: LText = { en: 'Hello', fr: 'Bonjour', jp: 'こんにちは' };
    const h = mount({ records: [rec], baseline: ['Hello'], onCommit: commit });
    await h.run();

    expect(autoTranslate).not.toHaveBeenCalled();
    expect(commit).not.toHaveBeenCalled();
    expect(last(h.snaps).state).toBe('done');
    expect(last(h.snaps).message).toMatch(/Nothing to translate/);
  });

  it('traduit le périmé, compte les champs remplis et commite', async () => {
    autoTranslate.mockResolvedValue({
      results: [{ fr: 'Bonjour', jp: 'こんにちは' }],
      provider: 'deepl',
    });
    const commit = vi.fn();
    const rec: LText = { en: 'Hello' }; // EN inconnu de la baseline ⇒ périmé
    const h = mount({ records: [rec], baseline: [], onCommit: commit });
    await h.run();

    // L'EN n'est JAMAIS une cible.
    expect(autoTranslate).toHaveBeenCalledWith(['Hello'], ['fr', 'jp']);
    expect(rec.fr).toBe('Bonjour');
    expect(commit).toHaveBeenCalledTimes(1);
    expect(last(h.snaps).message).toMatch(/2 field\(s\) translated via DeepL/);
  });

  it('annonce le repli Haiku (quota DeepL) dans le message', async () => {
    autoTranslate.mockResolvedValue({ results: [{ fr: 'Bonjour' }], provider: 'haiku' });
    const h = mount({ records: [{ en: 'Hello' }], baseline: [] });
    await h.run();
    expect(last(h.snaps).message).toMatch(/Haiku \(DeepL quota reached\)/);
  });

  it('dit clairement quand la traduction revient identique', async () => {
    // Le traducteur renvoie ce qui est déjà là ⇒ zéro champ modifié.
    autoTranslate.mockResolvedValue({ results: [{ fr: 'Bonjour' }], provider: 'deepl' });
    const h = mount({ records: [{ en: 'Hello', fr: 'Bonjour' }], baseline: [] });
    await h.run();
    expect(last(h.snaps).message).toMatch(/already matched the English text/);
  });

  it('ne laisse PAS échapper une erreur du traducteur', async () => {
    autoTranslate.mockRejectedValue(new Error('quota dépassé'));
    const commit = vi.fn();
    const h = mount({ records: [{ en: 'Hello' }], baseline: [], onCommit: commit });
    await expect(h.run()).resolves.toBeUndefined();

    expect(last(h.snaps).state).toBe('error');
    expect(last(h.snaps).message).toBe('quota dépassé');
    // Rien n'est publié quand l'appel a échoué.
    expect(commit).not.toHaveBeenCalled();
  });

  it('reste `loading` PENDANT l’appel, puis `done` (le bouton se désactive)', async () => {
    // Appel tenu en suspens : sans ça React regroupe `loading` et `done` dans le
    // même lot de rendus et l'état intermédiaire n'est pas observable.
    let release!: () => void;
    autoTranslate.mockImplementation(
      () =>
        new Promise((r) => {
          release = () => r({ results: [{ fr: 'Bonjour' }], provider: 'deepl' });
        }),
    );
    const h = mount({ records: [{ en: 'Hello' }], baseline: [] });

    let pending!: Promise<void>;
    await act(async () => {
      pending = h.start();
    });
    expect(last(h.snaps).state).toBe('loading');

    await act(async () => {
      release();
      await pending;
    });
    expect(last(h.snaps).state).toBe('done');
  });
});
