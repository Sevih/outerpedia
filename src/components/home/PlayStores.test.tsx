// @vitest-environment happy-dom
/**
 * Note « Jouer à OUTERPLANE » de l'accueil : les trois stores pointent sur les
 * URL partagées, s'ouvrent à part sans `opener`, et le renvoi mène au guide
 * « How to play ».
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { GAME_STORE_URLS } from '@/lib/game-stores';
import { PlayStores } from './PlayStores';

const STRINGS = { title: 'Play OUTERPLANE', more: 'How to Play guide' };

function render() {
  const host = document.createElement('div');
  host.innerHTML = renderToStaticMarkup(<PlayStores lang="en" strings={STRINGS} />);
  return host;
}

describe('PlayStores', () => {
  it('trois liens externes, un par store, dans l’ordre Steam · Google Play · App Store', () => {
    const links = [...render().querySelectorAll<HTMLAnchorElement>('a[target="_blank"]')];
    expect(links.map((a) => [a.textContent, a.getAttribute('href')])).toEqual([
      ['Steam', GAME_STORE_URLS.steam],
      ['Google Play', GAME_STORE_URLS.playstore],
      ['App Store', GAME_STORE_URLS.appstore],
    ]);
    for (const a of links) expect(a.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('les URL sont celles des stores du jeu', () => {
    expect(GAME_STORE_URLS.steam).toBe('https://store.steampowered.com/app/4247320/OUTERPLANE/');
    expect(GAME_STORE_URLS.playstore).toBe(
      'https://play.google.com/store/apps/details?id=com.smilegate.outerplane.stove.google',
    );
    expect(GAME_STORE_URLS.appstore).toBe(
      'https://apps.apple.com/us/app/outerplane-strategy-anime/id1630880836',
    );
  });

  it('titre, et renvoi interne au guide « How to play »', () => {
    const host = render();
    expect(host.querySelector('h2')?.textContent).toBe(STRINGS.title);
    const guide = [...host.querySelectorAll('a')].find((a) => !a.hasAttribute('target'));
    expect(guide?.getAttribute('href')).toBe('/guides/other/how-to-play');
    expect(guide?.textContent).toBe(STRINGS.more);
  });
});
