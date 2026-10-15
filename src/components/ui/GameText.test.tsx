/**
 * `renderGameColors` : analyse à pile des balises `<color>` (règle du rich text
 * Unity). Le balisage d'un texte sans imbrication reste celui d'un simple
 * appariement — c'est le cas de presque tous les textes du jeu.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { renderGameColors } from './GameText';

const html = (s: string, frag?: (f: string, key: string) => string) =>
  renderToStaticMarkup(<>{renderGameColors(s, frag)}</>);

describe('renderGameColors', () => {
  it('texte simple : un span par paire, le reste tel quel', () => {
    expect(html('aucune balise')).toBe('aucune balise');
    expect(html('Inflicts <color=#ffd700>Burn</color> for 2 turns')).toBe(
      'Inflicts <span style="color:#ffd700">Burn</span> for 2 turns',
    );
    expect(html('<Color=#FFF>a</COLOR> et <color=#000>b</color>')).toBe(
      '<span style="color:#FFF">a</span> et <span style="color:#000">b</span>',
    );
    // Paire vide : le span reste, comme avant.
    expect(html('x<color=#123></color>y')).toBe('x<span style="color:#123"></span>y');
  });

  it('imbrication : la couleur intérieure s’applique, la fermante rend l’englobante', () => {
    expect(html('<color=#aaa>a <color=#bbb>b</color> c</color> d')).toBe(
      '<span style="color:#aaa">a <span style="color:#bbb">b</span> c</span> d',
    );
    expect(html('<color=#aaa><color=#bbb>b</color></color>')).toBe(
      '<span style="color:#aaa"><span style="color:#bbb">b</span></span>',
    );
  });

  it('ouvrante jamais fermée : colore jusqu’à la fin', () => {
    expect(html('a <color=#aaa>b c')).toBe('a <span style="color:#aaa">b c</span>');
    expect(html('<color=#aaa>a <color=#bbb>b</color> c')).toBe(
      '<span style="color:#aaa">a <span style="color:#bbb">b</span> c</span>',
    );
  });

  it('fermante orpheline : ne s’affiche pas, le texte reste d’un seul tenant', () => {
    expect(html('a</color> b')).toBe('a b');
    expect(html('<color=#aaa>a</color> b</color> c')).toBe('<span style="color:#aaa">a</span> b c');
  });

  it('`renderFragment` ne reçoit que du texte, jamais une balise', () => {
    const seen: string[] = [];
    html('x <color=#aaa>a <color=#bbb>b</color></color></color> y <color=#ccc>z', (f, key) => {
      seen.push(`${key}:${f}`);
      return f;
    });
    expect(seen).toEqual(['t0:x ', 'c0i:a ', 'c1i:b', 't2: y ', 'c2i:z']);
  });
});
