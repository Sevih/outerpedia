// @vitest-environment happy-dom
/**
 * La copie (presse-papier moderne, repli `execCommand`, échec sans rejet) et le
 * cycle du retour « copié ! » (monte, retombe, relancé par une nouvelle copie).
 * Rendu réel (react-dom) dans happy-dom, `navigator.clipboard` factice.
 */
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { copyText, useCopyToClipboard } from './useCopyToClipboard';

function setClipboard(value: unknown) {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value });
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('copyText', () => {
  it('écrit via navigator.clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });
    await expect(copyText('abc')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('abc');
  });

  it('rend false sans rejeter quand l’écriture est refusée', async () => {
    setClipboard({ writeText: vi.fn().mockRejectedValue(new Error('denied')) });
    await expect(copyText('abc')).resolves.toBe(false);
  });

  it('se replie sur execCommand hors contexte sécurisé, sans laisser de trace', async () => {
    setClipboard(undefined);
    let copied: string | undefined;
    const exec = vi.fn(() => {
      copied = document.querySelector('textarea')?.value;
      return true;
    });
    Object.defineProperty(document, 'execCommand', { configurable: true, value: exec });
    await expect(copyText('abc')).resolves.toBe(true);
    expect(exec).toHaveBeenCalledWith('copy');
    expect(copied).toBe('abc');
    expect(document.querySelector('textarea')).toBeNull();
  });
});

describe('useCopyToClipboard', () => {
  let host: HTMLDivElement;
  let root: Root;
  let api: ReturnType<typeof useCopyToClipboard>;

  function Probe() {
    api = useCopyToClipboard(1000);
    return null;
  }

  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    vi.useFakeTimers();
    setClipboard({ writeText: vi.fn().mockResolvedValue(undefined) });
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
    act(() => root.render(<Probe />));
  });

  afterEach(() => {
    act(() => root.unmount());
    host.remove();
  });

  it('monte copied puis le fait retomber après le délai', async () => {
    expect(api.copied).toBe(false);
    await act(async () => {
      await api.copy('code-1');
    });
    expect(api.copied).toBe(true);
    expect(api.copiedText).toBe('code-1');
    act(() => vi.advanceTimersByTime(1000));
    expect(api.copied).toBe(false);
    expect(api.copiedText).toBeNull();
  });

  it('une nouvelle copie relance le délai', async () => {
    await act(async () => {
      await api.copy('a');
    });
    act(() => vi.advanceTimersByTime(700));
    await act(async () => {
      await api.copy('b');
    });
    act(() => vi.advanceTimersByTime(700));
    expect(api.copiedText).toBe('b');
    act(() => vi.advanceTimersByTime(300));
    expect(api.copied).toBe(false);
  });

  it('reste à false quand la copie échoue', async () => {
    setClipboard({ writeText: vi.fn().mockRejectedValue(new Error('denied')) });
    let ok = true;
    await act(async () => {
      ok = await api.copy('x');
    });
    expect(ok).toBe(false);
    expect(api.copied).toBe(false);
  });
});
