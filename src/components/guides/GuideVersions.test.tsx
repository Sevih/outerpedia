// @vitest-environment happy-dom
/**
 * Une version CACHÉE (`version.json { hidden: true }`) : hors du sélecteur,
 * jamais le défaut, joignable par `#version=<clé>`. Les en-têtes viennent de
 * `guideVersionHeads`, ceux que bâtissent les constructeurs de guides versionnés
 * (`VersionedBossGuide`, `GuildRaidGuide`) — le bandeau « ancienne version » se
 * calcule sur les versions visibles.
 */
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { guideVersionHeads } from '@/lib/data/guides';
import { GuideVersions, type GuideVersionEntry } from './GuideVersions';

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  window.history.replaceState(null, '', '/');
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

// Trois versions, la plus récente cachée (l'ordre du scan : la plus récente d'abord).
const entries: GuideVersionEntry[] = guideVersionHeads(
  [{ key: '2026-09', hidden: true }, { key: '2026-05' }, { key: '2026-01' }],
  'en',
  (current, newest) => `older ${current} → ${newest}`,
).map((h) => ({ ...h, content: <p data-content>{h.key}</p> }));

const render = () => act(() => root.render(<GuideVersions versions={entries} label="Versions" />));
const options = () =>
  [...host.querySelectorAll('option')].map((o) => (o as HTMLOptionElement).value);
const shown = () => host.querySelector('[data-content]')?.textContent;
const warning = () => host.querySelector('.panel-warning')?.textContent;

describe('GuideVersions — une version cachée', () => {
  it('le sélecteur ne propose que les deux versions visibles', () => {
    render();
    expect(options()).toEqual(['2026-05', '2026-01']);
  });

  it('le défaut est la plus récente VISIBLE, sans bandeau « ancienne version »', () => {
    render();
    expect(shown()).toBe('2026-05');
    expect(warning()).toBeUndefined();
    expect(host.querySelector('select')!.value).toBe('2026-05');
  });

  it('une version visible plus ancienne garde son bandeau, rapporté à la plus récente visible', () => {
    window.history.replaceState(null, '', '#version=2026-01');
    render();
    expect(shown()).toBe('2026-01');
    expect(warning()).toBe('older January 2026 → May 2026');
  });

  it('`#version=<clé cachée>` l’affiche, avec son bandeau, et le menu la montre le temps de sa visite', () => {
    window.history.replaceState(null, '', '#version=2026-09');
    render();
    expect(shown()).toBe('2026-09');
    expect(warning()).toBe('older September 2026 → May 2026');
    expect(options()).toEqual(['2026-09', '2026-05', '2026-01']);
    expect(host.querySelector('select')!.value).toBe('2026-09');
  });
});
