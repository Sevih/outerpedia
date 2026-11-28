// @vitest-environment happy-dom
/**
 * La carte du journal (B77) : les liens markdown des puces sont rendus, et la
 * carte reste entièrement cliquable sans lien imbriqué dans un lien — un seul
 * `<a>` de carte (le lien étiré), les liens des puces hors de lui.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { TranslationKey } from '@/i18n';
import type { ResolvedChangelogEntry } from '@/lib/data/changelog';
import { ChangelogEntryCard } from './ChangelogEntryCard';

const t = (key: TranslationKey) => key;

/** La puce à liens de l'entrée de Sevih du 28/11 (« OUTERPLANE Player Survey »). */
const SURVEY =
  '🔗 [Survey (Global)](https://t.co/KxxijqwJ0f) · [問卷連結 (繁體中文)](https://t.co/OgdUxsLmOv)';

const entry = (over: Partial<ResolvedChangelogEntry> = {}): ResolvedChangelogEntry => ({
  id: '4fba5469',
  date: '2026-11-28',
  type: 'news',
  title: 'OUTERPLANE Player Survey: 1,500 Free Ether',
  content: ['The OUTERPLANE team wants your **feedback**.', SURVEY],
  ...over,
});

function render(e: ResolvedChangelogEntry): HTMLElement {
  const host = document.createElement('div');
  host.innerHTML = renderToStaticMarkup(<ChangelogEntryCard entry={e} lang="en" t={t} />);
  return host;
}

describe('ChangelogEntryCard — liens des puces', () => {
  it('l’entrée de Sevih, sans Lien : ses deux liens externes, nouvel onglet, sans opener', () => {
    const host = render(entry());
    const links = [...host.querySelectorAll<HTMLAnchorElement>('li a')];
    expect(links.map((a) => [a.textContent, a.getAttribute('href')])).toEqual([
      ['Survey (Global)', 'https://t.co/KxxijqwJ0f'],
      ['問卷連結 (繁體中文)', 'https://t.co/OgdUxsLmOv'],
    ]);
    for (const a of links) {
      expect(a.getAttribute('target')).toBe('_blank');
      expect(a.getAttribute('rel')).toBe('noopener noreferrer');
    }
    // Le texte autour reste, sans la syntaxe markdown ; le gras est rendu.
    expect(host.querySelectorAll('li')[1].textContent).toBe(
      '🔗 Survey (Global) · 問卷連結 (繁體中文)',
    );
    expect(host.querySelector('li strong')?.textContent).toBe('feedback');
    // Sans Lien : une carte inerte, aucun autre `<a>` que ceux des puces.
    expect(host.querySelectorAll('a')).toHaveLength(2);
    expect(host.querySelector('article')?.className).not.toContain('card-interactive');
  });

  it('un lien interne passe par `localePath`, sans nouvel onglet, le gras de son libellé gardé', () => {
    const host = render(entry({ content: ['See **[the guide](/guides/x)**.'] }));
    const a = host.querySelector<HTMLAnchorElement>('li a');
    expect(a?.getAttribute('href')).toBe('/guides/x');
    expect(a?.getAttribute('target')).toBeNull();
    expect(a?.querySelector('strong')?.textContent).toBe('the guide');
  });

  it('avec Lien : un seul `<a>` de carte, les liens des puces hors de lui, aucun `<a>` dans un `<a>`', () => {
    const host = render(entry({ link: { kind: 'page', href: '/coupons' } }));
    const all = [...host.querySelectorAll('a')];
    expect(all).toHaveLength(3);
    expect(host.querySelector('a a')).toBeNull();

    const card = all.filter((a) => !a.closest('li'));
    expect(card).toHaveLength(1);
    expect(card[0].getAttribute('href')).toBe('/coupons');
    expect(card[0].textContent).toBe('changelog.goto.page→');
    // Le lien étiré : son `::after` couvre la carte, qui le contient.
    expect(card[0].className).toContain('after:absolute');
    expect(card[0].className).toContain('after:inset-0');
    const article = host.querySelector('article');
    expect(article?.className).toContain('relative');
    expect(article?.className).toContain('card-interactive');
    // Le titre décrit le lien de la carte.
    const title = host.querySelector('h2');
    expect(title?.id).toBeTruthy();
    expect(card[0].getAttribute('aria-describedby')).toBe(title?.id);
    // Les liens des puces passent au-dessus du lien étiré.
    for (const a of host.querySelectorAll('li a')) {
      expect(a.className).toContain('relative');
      expect(a.className).toContain('z-10');
    }
  });

  it('les puces sans lien gardent leur rendu : texte et gras seuls', () => {
    const host = render(entry({ content: ['Added the **Universal Tower** guide.'] }));
    expect(host.querySelector('li')?.innerHTML).toBe(
      'Added the <strong>Universal Tower</strong> guide.',
    );
  });
});
