// @vitest-environment happy-dom
/**
 * Les trois promesses du hook : le focus ENTRE, BOUCLE, REVIENT. Rendu réel
 * (react-dom) dans happy-dom ; `offsetParent` n'y existe pas → on le simule
 * pour que les boutons comptent comme visibles.
 */
import { act, useRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDialogFocus } from './useDialogFocus';

function Dialog({ onEscape }: { onEscape?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useDialogFocus(ref, { onEscape });
  return (
    <div ref={ref} role="dialog">
      <button id="first">a</button>
      <button id="last">b</button>
    </div>
  );
}

let host: HTMLDivElement;
let opener: HTMLButtonElement;
let root: Root;

beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
    configurable: true,
    get() {
      return document.body;
    },
  });
  opener = document.createElement('button');
  document.body.appendChild(opener);
  opener.focus();
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  opener.remove();
});

const tab = (shift = false) =>
  document.activeElement?.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Tab', shiftKey: shift, bubbles: true, cancelable: true }),
  );

describe('useDialogFocus', () => {
  it('le focus entre sur le premier focusable, boucle en Tab, revient à l’ouvreur', () => {
    act(() => root.render(<Dialog />));
    expect(document.activeElement?.id).toBe('first');
    // Depuis le dernier, Tab revient au premier ; depuis le premier, Shift+Tab va au dernier.
    document.getElementById('last')!.focus();
    tab();
    expect(document.activeElement?.id).toBe('first');
    tab(true);
    expect(document.activeElement?.id).toBe('last');
    act(() => root.unmount());
    root = createRoot(host); // pour l'afterEach
    expect(document.activeElement).toBe(opener);
  });

  it('Échap appelle `onEscape` quand il est fourni', () => {
    const onEscape = vi.fn();
    act(() => root.render(<Dialog onEscape={onEscape} />));
    document.activeElement?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    );
    expect(onEscape).toHaveBeenCalledTimes(1);
  });
});
