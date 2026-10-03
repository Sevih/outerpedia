// @vitest-environment happy-dom
/**
 * Le tactile du tooltip inline : premier tap = la bulle s'ouvre sans naviguer,
 * second tap sur un lien = on y va (G4). La séquence d'événements est celle
 * qu'un navigateur mobile émet — `pointerdown` compris : c'est lui qui
 * refermait la bulle (Radix) avant que le second `touchend` n'arrive.
 */
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InlineTooltip } from './InlineTooltip';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.useFakeTimers();
  (window as unknown as { ontouchstart: null }).ontouchstart = null;
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  delete (window as unknown as { ontouchstart?: null }).ontouchstart;
  vi.useRealTimers();
});

const bubbleOpen = () => document.querySelector('#bubble') !== null;

type EventCtor = new (type: string, init?: PointerEventInit) => Event;

function fire(target: Element, type: string, Ctor: EventCtor = Event, init: PointerEventInit = {}) {
  const e = new Ctor(type, { bubbles: true, cancelable: true, ...init });
  act(() => {
    target.dispatchEvent(e);
    vi.advanceTimersByTime(50);
  });
  return e;
}

/** Un tap : pointeur, toucher, puis — si `touchend` n'est pas annulé — le clic synthétisé. */
function tap(target: HTMLElement): { clicked: boolean } {
  fire(target, 'pointerdown', PointerEvent, { pointerType: 'touch' });
  fire(target, 'touchstart');
  fire(target, 'pointerup', PointerEvent, { pointerType: 'touch' });
  if (fire(target, 'touchend').defaultPrevented) return { clicked: false };
  fire(target, 'mousedown', MouseEvent);
  fire(target, 'mouseup', MouseEvent);
  fire(target, 'click', MouseEvent);
  return { clicked: true };
}

describe('InlineTooltip au toucher', () => {
  it('lien : le premier tap ouvre la bulle sans naviguer, le second navigue', () => {
    const onLink = vi.fn((e: React.MouseEvent) => e.preventDefault());
    act(() =>
      root.render(
        <InlineTooltip content={<div id="bubble">bulle</div>}>
          <a href="#kuro" onClick={onLink}>
            Kuro
          </a>
        </InlineTooltip>,
      ),
    );
    const a = host.querySelector('a')!;

    expect(tap(a).clicked).toBe(false);
    expect(bubbleOpen()).toBe(true);
    expect(onLink).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(500));
    expect(tap(a).clicked).toBe(true);
    expect(onLink).toHaveBeenCalledTimes(1);
  });

  it('sans lien : le second tap referme la bulle', () => {
    act(() =>
      root.render(
        <InlineTooltip content={<div id="bubble">bulle</div>}>
          <button type="button">Burn</button>
        </InlineTooltip>,
      ),
    );
    const b = host.querySelector('button')!;

    tap(b);
    expect(bubbleOpen()).toBe(true);
    act(() => vi.advanceTimersByTime(500));
    tap(b);
    expect(bubbleOpen()).toBe(false);
  });

  it('un toucher ailleurs referme la bulle', () => {
    act(() =>
      root.render(
        <InlineTooltip content={<div id="bubble">bulle</div>}>
          <button type="button">Burn</button>
        </InlineTooltip>,
      ),
    );
    tap(host.querySelector('button')!);
    expect(bubbleOpen()).toBe(true);
    fire(document.body, 'touchstart');
    expect(bubbleOpen()).toBe(false);
  });
});
