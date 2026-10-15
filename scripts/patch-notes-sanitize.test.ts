import { readFileSync } from 'node:fs';
import * as cheerio from 'cheerio';
import { describe, expect, it } from 'vitest';
import { isSafeUrl, sanitizeHtml } from './patch-notes-sanitize';

const attrs = (html: string, sel: string) =>
  cheerio
    .load(html)(sel)
    .toArray()
    .map((el) => ('attribs' in el ? el.attribs : {}));

describe('isSafeUrl', () => {
  it('garde http(s), les chemins relatifs et les ancres', () => {
    for (const u of [
      'https://x.com/a',
      'HTTP://x.com',
      '/images/a.webp',
      'a/b.png',
      '#top',
      '//x.com/a',
      '',
    ])
      expect(isSafeUrl(u)).toBe(true);
  });

  it('refuse tout autre schéma, même entrecoupé de blancs ou de caractères de contrôle', () => {
    for (const u of [
      'javascript:alert(1)',
      'JaVaScRiPt:alert(1)',
      ' javascript:x',
      'java\tscript:x',
      'java\nscript:x',
      'java\u0000script:x',
      'java script:x',
      'data:text/html,x',
      'vbscript:x',
      'file://srv/x',
    ])
      expect(isSafeUrl(u)).toBe(false);
  });
});

describe('sanitizeHtml — liste blanche', () => {
  it('retire un href javascript: masqué par une tabulation encodée', () => {
    for (const href of [
      'java&#9;script:alert(1)',
      'java&#x09;script:alert(1)',
      'java&#10;script:x',
    ]) {
      const out = sanitizeHtml(`<p><a href="${href}">lien</a></p>`);
      expect(attrs(out, 'a')).toEqual([{}]);
      expect(out).toContain('lien');
    }
  });

  it('retire srcdoc, même sur une iframe d’hôte autorisé', () => {
    const out = sanitizeHtml(
      '<iframe srcdoc="<script>alert(1)</script>" src="https://www.youtube.com/embed/x"></iframe>',
    );
    expect(attrs(out, 'iframe')).toEqual([{ src: 'https://www.youtube.com/embed/x' }]);
    expect(out).not.toContain('srcdoc');
  });

  it('remplace une iframe hors liste par UN lien, sans réinterpréter son URL', () => {
    const src = 'x"><a href="java&#9;script:alert(1)">';
    const out = sanitizeHtml(`<iframe src='${src.replace(/&/g, '&amp;')}'></iframe>`);
    const $ = cheerio.load(out);
    expect($('a').length).toBe(1);
    expect($('a').attr('href')).toBe(src);
    expect($('a').text()).toBe(src);
    expect(attrs(sanitizeHtml('<iframe src="javascript:alert(1)"></iframe>'), 'a')).toEqual([
      { target: '_blank', rel: 'noopener noreferrer' },
    ]);
    expect(sanitizeHtml('<p>a<iframe src="https://evil.example/x"></iframe></p>')).toBe(
      '<p>a<a href="https://evil.example/x" target="_blank" rel="noopener noreferrer">https://evil.example/x</a></p>',
    );
  });

  it('retire les attributs d’évènement et ceux hors liste', () => {
    const out = sanitizeHtml(
      '<img src="/a.webp" alt="" onerror="alert(1)" ONLOAD="x" formaction="javascript:x"><p onclick="x" style="color:red" data-id="3">t</p>',
    );
    expect(attrs(out, 'img')).toEqual([{ src: '/a.webp', alt: '' }]);
    expect(attrs(out, 'p')).toEqual([{ style: 'color:red', 'data-id': '3' }]);
  });

  it('retire script et ses pairs avec leur contenu, déballe une balise inconnue', () => {
    expect(sanitizeHtml('<p>a<script>alert(1)</script><svg><g onload="x"/></svg>b</p>')).toBe(
      '<p>ab</p>',
    );
    expect(sanitizeHtml('<p><before skill="">texte <b>gras</b></before></p>')).toBe(
      '<p>texte <b>gras</b></p>',
    );
    expect(sanitizeHtml('<p><x-a><a href="javascript:x">l</a></x-a></p>')).toBe('<p><a>l</a></p>');
  });

  it('garde les liens http(s) et relatifs', () => {
    const html =
      '<p><a href="https://x.com/a" target="_blank" rel="noopener noreferrer">a</a><a href="/s/b">b</a><img src="/images/patch-notes/1.webp" alt=""></p>';
    expect(sanitizeHtml(html)).toBe(html);
  });
});

describe('sanitizeHtml — vraies notes du corpus committé', () => {
  const { posts } = JSON.parse(readFileSync('data/patch-notes/posts.json', 'utf8')) as {
    posts: { id: number; content: string }[];
  };
  // Une note par forme courante : tableau stylé, embed YouTube, figure,
  // surlignage, citation (widget X), liste numérotée, police, lien externe.
  const markers = [
    '<td style',
    '<iframe',
    '<figure',
    '<mark',
    '<blockquote',
    '<ol start',
    '<font',
    'target="_blank"',
  ];
  const sample = markers.map((m) => posts.find((p) => p.content.includes(m)));

  it.each(markers.map((m, i) => [m, sample[i]] as const))('%s : rendu inchangé', (_m, post) => {
    expect(post).toBeDefined();
    expect(sanitizeHtml(post!.content)).toBe(post!.content);
  });
});
