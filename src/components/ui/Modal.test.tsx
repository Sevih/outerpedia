// @vitest-environment happy-dom
/**
 * Ce que la brique tient à la place des modales des outils : la boîte nommée,
 * les deux fermetures (Échap, clic sur le voile), le verrou du scroll et les
 * flèches à la demande. Le focus lui-même est testé avec `useDialogFocus`.
 */
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Lightbox, Modal } from './Modal';

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

const dialog = () => host.querySelector<HTMLElement>('[role="dialog"]')!;
const escape = (target: EventTarget = document.body) => {
  const e = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
  target.dispatchEvent(e);
  return e;
};
const LABELS = { close: 'Close', previous: 'Previous', next: 'Next' };

describe('Modal', () => {
  it('boîte nommée ; le voile ferme, le panneau non', () => {
    const onClose = vi.fn();
    act(() =>
      root.render(
        <Modal label="Settings" onClose={onClose} className="panel">
          <button id="inside">ok</button>
        </Modal>,
      ),
    );
    expect(dialog().getAttribute('aria-modal')).toBe('true');
    expect(dialog().getAttribute('aria-label')).toBe('Settings');
    expect(document.body.style.overflow).toBe('');

    document.getElementById('inside')!.click();
    host.querySelector<HTMLElement>('.panel')!.click();
    expect(onClose).not.toHaveBeenCalled();
    dialog().click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Échap ferme même quand le focus est sorti de la boîte, sauf touche déjà prise', () => {
    const onClose = vi.fn();
    act(() =>
      root.render(
        <Modal label="Settings" onClose={onClose} className="panel">
          <button>ok</button>
        </Modal>,
      ),
    );
    expect(escape().defaultPrevented).toBe(true);
    expect(onClose).toHaveBeenCalledTimes(1);

    // Une boîte ouverte par-dessus a déjà traité la touche.
    const above = document.createElement('div');
    document.body.appendChild(above);
    above.addEventListener('keydown', (e) => e.preventDefault());
    escape(above);
    above.remove();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('Lightbox', () => {
  it('verrouille le scroll de fond et le rend ; sans navigation, ni flèches ni compteur', () => {
    document.body.style.overflow = 'clip';
    act(() =>
      root.render(
        <Lightbox label="art" onClose={() => {}} labels={LABELS}>
          <img alt="art" />
        </Lightbox>,
      ),
    );
    expect(document.body.style.overflow).toBe('hidden');
    expect([...host.querySelectorAll('button')].map((b) => b.getAttribute('aria-label'))).toEqual([
      'Close',
    ]);
    act(() => root.render(null));
    expect(document.body.style.overflow).toBe('clip');
    document.body.style.overflow = '';
  });

  it('les flèches naviguent sans fermer ; la croix ferme', () => {
    const onClose = vi.fn();
    const onNavigate = vi.fn();
    act(() =>
      root.render(
        <Lightbox
          label="art"
          onClose={onClose}
          labels={LABELS}
          counter="2 / 5"
          onNavigate={onNavigate}
        >
          <img alt="art" />
        </Lightbox>,
      ),
    );
    expect(dialog().textContent).toContain('2 / 5');
    host.querySelector<HTMLElement>('[aria-label="Previous"]')!.click();
    host.querySelector<HTMLElement>('[aria-label="Next"]')!.click();
    expect(onNavigate.mock.calls).toEqual([[-1], [1]]);
    expect(onClose).not.toHaveBeenCalled();
    host.querySelector<HTMLElement>('[aria-label="Close"]')!.click();
    expect(onClose).toHaveBeenCalled();
  });
});
