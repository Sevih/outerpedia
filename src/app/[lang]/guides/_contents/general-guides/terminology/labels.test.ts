/**
 * GARDE-FOUS du guide « Terminology & TL;DR ». Son contenu vit dans un module
 * TS (`labels.ts`), que ni le contrôle des tags des guides (`guides.test.ts`,
 * fichiers JSON) ni la parité des balises (`inline-tag-parity.test.ts`, JSON
 * aussi) ne lisent : sans ce test, une balise morte n'apparaîtrait qu'au build
 * de prod (parse-text STRICT jette au SSG).
 *
 * Tourne SANS `.gamedata` : ne lit que `data/generated/` et le code.
 */
import { describe, expect, it } from 'vitest';
import { LANGS } from '@/lib/i18n/config';
import { GUIDE_CATEGORY_SLUGS } from '@/lib/data/guide-categories';
import { getGuide } from '@/lib/data/guides';
import { getToolMeta } from '@/lib/data/tools';
import { TAG_REGEX, checkText } from '@/lib/parse-text';
import { LABELS } from './labels';

const entries = Object.entries(LABELS) as [string, Record<string, string>][];

/** Jetons `{…}` qu'`index.tsx` remplace (filtre des héros, chiffres du recrutement). */
const TOKENS = [
  'filter',
  'advanced',
  'pity',
  'rate3',
  'rateFeatured',
  'price',
  'pricePremium',
  'callCost',
];

/** Pages hors guides et hors outils que le guide cible. */
const STATIC_PAGES = new Set(['/characters', '/equipment', '/tierlist']);

/** Cible d'un `{L/label|href}` (le libellé, lui, se traduit). */
const hrefOf = (value: string): string => value.slice(value.indexOf('|') + 1);

/** Même règle que `guides.test.ts` pour les cibles `/guides/...`. */
function hrefExists(href: string): boolean {
  const parts = href.split(/[?#]/)[0].replace(/\/+$/, '').split('/').filter(Boolean);
  if (parts[0] !== 'guides') return true;
  if (parts.length === 1) return true;
  if (!(GUIDE_CATEGORY_SLUGS as readonly string[]).includes(parts[1])) return false;
  if (parts.length === 2) return true;
  return Boolean(getGuide(parts[1], parts[2]));
}

/** Balises d'un texte, le libellé des liens retiré (seule la cible compte). */
function tagsOf(text: string): string[] {
  return [...text.matchAll(TAG_REGEX)]
    .map(([tag, type, value]) => (type === 'L' ? `{L/${hrefOf(value)}}` : tag))
    .sort();
}

describe('terminology — labels.ts', () => {
  it('chaque texte existe, non vide, dans les six langues', () => {
    for (const [key, text] of entries) {
      for (const lang of LANGS) {
        expect(text[lang], `${key}.${lang}`).toBeTruthy();
      }
    }
  });

  it('les balises inline sont identiques d’une langue à l’autre', () => {
    for (const [key, text] of entries) {
      const ref = tagsOf(text.en);
      for (const lang of LANGS) {
        expect(tagsOf(text[lang]), `${key}.${lang}`).toEqual(ref);
      }
    }
  });

  it('toute balise résout (effets, stats, sets, guides liés)', () => {
    for (const [key, text] of entries) {
      for (const lang of LANGS) {
        for (const check of checkText(text[lang], { guideHrefExists: hrefExists })) {
          expect(check.ok, `${key}.${lang} : ${check.tag} — ${check.reason ?? ''}`).toBe(true);
        }
      }
    }
  });

  it('tout lien interne hors guides vise une page ou un outil qui existe', () => {
    const targets = new Set<string>();
    for (const [, text] of entries) {
      for (const [, type, value] of text.en.matchAll(TAG_REGEX)) {
        if (type !== 'L') continue;
        const href = hrefOf(value);
        expect(href.startsWith('/'), `lien externe inattendu : ${href}`).toBe(true);
        if (!href.startsWith('/guides')) targets.add(href);
      }
    }
    expect(targets.size).toBeGreaterThan(0);
    for (const href of targets) {
      const tool = getToolMeta(href.slice(1));
      const known = STATIC_PAGES.has(href) || (tool !== null && tool.status === 'available');
      expect(known, `cible inconnue : ${href}`).toBe(true);
    }
  });

  it('les jetons injectés sont connus et identiques d’une langue à l’autre', () => {
    const tokensOf = (text: string): string[] =>
      [...text.matchAll(/\{([a-zA-Z0-9]+)\}/g)].map(([, name]) => name).sort();
    const used = new Set<string>();
    for (const [key, text] of entries) {
      const ref = tokensOf(text.en);
      for (const name of ref) {
        used.add(name);
        expect(TOKENS, `${key} : jeton inconnu {${name}}`).toContain(name);
      }
      for (const lang of LANGS) {
        expect(tokensOf(text[lang]), `${key}.${lang}`).toEqual(ref);
      }
    }
    // Un jeton que plus aucun texte n'emploie est à retirer d'`index.tsx`.
    expect([...used].sort()).toEqual([...TOKENS].sort());
  });

  it('le filtre de la liste des héros est injecté dans chaque langue', () => {
    for (const lang of LANGS) {
      const text: string = LABELS.tldrScaling[lang];
      expect(text, lang).toContain('{filter}');
      expect(text, lang).toContain('{advanced}');
    }
  });
});
