import { describe, expect, it } from 'vitest';
import { esc, rfc822 } from '@/lib/rss';

describe('esc', () => {
  it('échappe les cinq caractères réservés de XML', () => {
    expect(esc(`& < > " '`)).toBe('&amp; &lt; &gt; &quot; &apos;');
  });

  it('échappe `&` EN PREMIER : une entité déjà présente est ré-échappée, jamais laissée telle quelle', () => {
    expect(esc('&lt;')).toBe('&amp;lt;');
  });

  it('laisse le reste du texte intact', () => {
    expect(esc('Guide Guild Raid — Sacreed')).toBe('Guide Guild Raid — Sacreed');
  });

  it('rend une chaîne vide pour une chaîne vide', () => {
    expect(esc('')).toBe('');
  });
});

describe('rfc822', () => {
  it('convertit `YYYY-MM-DD` en date RFC-822 à minuit, fuseau GMT', () => {
    expect(rfc822('2026-09-23')).toBe('Wed, 23 Sep 2026 00:00:00 GMT');
  });

  // Comportement actuel, conservé : pas d'exception, la chaîne `"Invalid Date"`
  // part telle quelle dans le `<pubDate>`. Une date-heure ISO complète est
  // hors contrat (le suffixe `T00:00:00Z` s'y ajoute) et tombe dans ce cas.
  it('rend "Invalid Date" pour une entrée hors format, sans lever', () => {
    expect(rfc822('pas-une-date')).toBe('Invalid Date');
    expect(rfc822('')).toBe('Invalid Date');
    expect(rfc822('2026-09-23T10:00:00Z')).toBe('Invalid Date');
  });
});
