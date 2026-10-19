// @vitest-environment happy-dom
/**
 * Téléchargement d'une sélection de pistes en zip : cases par ligne et « tout »
 * sur la playlist affichée, compte et poids, case qui ne lance pas la lecture,
 * zip dont les entrées portent `<file>.mp3`, échec qui garde la sélection.
 */
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OstPlayer, type BgmTrack, type OstStrings } from './OstPlayer';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const TRACKS: BgmTrack[] = [
  { file: 'Battle_01', name: 'Battle - Normal', size: 1.86, duration: 81 },
  { file: 'Battle_02', name: 'Battle 02', size: 1.67, duration: 72 },
  { file: 'Agitpunkt', name: 'Thema - Base', size: 1.05, duration: 46 },
];
const ARCHIVED: BgmTrack[] = [
  { file: 'Old_01', name: 'Old theme', size: 2, duration: 60, retired: true },
];

const STRINGS: OstStrings = {
  download: 'Download',
  selectTrack: 'Select a track',
  disclaimer1: 'd1',
  disclaimer2: 'd2',
  keyboardShortcuts: 'Keyboard shortcuts',
  tabTracks: 'Tracks',
  tabArchived: 'Archived',
  archivedNote: 'note',
  loadError: 'Failed to load track',
  colTitle: 'Title',
  colDuration: 'Duration',
  colSize: 'Size',
  shuffle: 'Shuffle',
  repeat: { off: 'off', all: 'all', one: 'one' },
  mute: 'Mute',
  unmute: 'Unmute',
  play: 'Play',
  pause: 'Pause',
  previous: 'Previous',
  next: 'Next',
  selectAll: 'Select all tracks',
  selectedCount: '{n} tracks · {mb} MB',
  downloadZip: 'Download selection (.zip)',
  clearSelection: 'Clear selection',
  zipProgress: '{done} / {total}',
  zipCancel: 'Cancel',
  zipTooBig: 'Over 100 MB',
  zipFailed: 'Failed on {name}',
};

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
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const render = () =>
  act(() =>
    root.render(<OstPlayer lang="en" tracks={TRACKS} archived={ARCHIVED} strings={STRINGS} />),
  );
const box = (label: string) =>
  host.querySelector<HTMLInputElement>(`input[type="checkbox"][aria-label="${label}"]`)!;
const button = (text: string) =>
  [...host.querySelectorAll('button')].find((b) => b.textContent?.trim() === text)!;
const click = (el: HTMLElement) => act(() => el.click());

/** Noms des entrées lus dans le répertoire central (fin de répertoire → fiches). */
function zipNames(buf: Uint8Array): string[] {
  const v = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const eocd = buf.length - 22;
  const count = v.getUint16(eocd + 10, true);
  let p = v.getUint32(eocd + 16, true);
  const names: string[] = [];
  for (let i = 0; i < count; i++) {
    const len = v.getUint16(p + 28, true);
    names.push(new TextDecoder().decode(buf.subarray(p + 46, p + 46 + len)));
    p += 46 + len + v.getUint16(p + 30, true) + v.getUint16(p + 32, true);
  }
  return names;
}

describe('OstPlayer — sélection pour le zip', () => {
  it('deux cases cochées : compte et total des Mo ; la case ne lance pas la lecture', () => {
    render();
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
    expect(host.textContent).not.toContain('Download selection (.zip)');

    click(box('Battle - Normal'));
    click(box('Thema - Base'));
    expect(host.textContent).toContain('2 tracks · 2.9 MB');
    expect(play).not.toHaveBeenCalled();
    expect(host.textContent).toContain('Select a track');

    click(button('Clear selection'));
    expect(box('Battle - Normal').checked).toBe(false);
    expect(host.textContent).not.toContain('tracks ·');
  });

  it('« tout » coche la playlist affichée seulement, vidée au changement d’onglet', () => {
    render();
    click(box('Select all tracks'));
    expect(host.textContent).toContain('3 tracks · 4.6 MB');
    expect(box('Old theme')).toBeNull();

    click(button('Archived1'));
    expect(host.textContent).not.toContain('tracks ·');
    click(box('Select all tracks'));
    expect(host.textContent).toContain('1 tracks · 2.0 MB');
    expect(box('Old theme').checked).toBe(true);
  });

  it('fetch une piste à la fois ; le zip porte `<file>.mp3`', async () => {
    render();
    const fetchMock = vi.fn(
      async (url: string) => new Response(new Uint8Array([1, 2, 3, url.length % 256])),
    );
    vi.stubGlobal('fetch', fetchMock);
    let blob: Blob | undefined;
    vi.spyOn(URL, 'createObjectURL').mockImplementation((b) => {
      blob = b as Blob;
      return 'blob:zip';
    });
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const anchorClick = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    click(box('Battle 02'));
    click(box('Battle - Normal'));
    await act(async () => button('Download selection (.zip)').click());

    expect(fetchMock.mock.calls.map(([u]) => u)).toEqual([
      '/audio/bgm/Battle_01.mp3',
      '/audio/bgm/Battle_02.mp3',
    ]);
    expect(anchorClick).toHaveBeenCalledTimes(1);
    expect(blob).toBeDefined();
    expect(zipNames(new Uint8Array(await blob!.arrayBuffer()))).toEqual([
      'Battle_01.mp3',
      'Battle_02.mp3',
    ]);
  });

  it('un fetch en échec garde la sélection et nomme la piste', async () => {
    render();
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) =>
        url.includes('Battle_02') ? new Response('', { status: 404 }) : new Response('ok'),
      ),
    );
    const create = vi.spyOn(URL, 'createObjectURL');

    click(box('Battle - Normal'));
    click(box('Battle 02'));
    await act(async () => button('Download selection (.zip)').click());

    expect(host.querySelector('[role="alert"]')?.textContent).toBe('Failed on Battle 02');
    expect(create).not.toHaveBeenCalled();
    expect(box('Battle - Normal').checked).toBe(true);
    expect(box('Battle 02').checked).toBe(true);
    expect(host.textContent).toContain('2 tracks · 3.5 MB');
  });
});
