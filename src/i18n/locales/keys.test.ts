/**
 * Les locales n'hébergent QUE des clés consommées — fin du pré-seed V2.
 *
 * Historique : les 5 fichiers de langue ont été transplantés de la V2 AVANT le
 * portage des pages, chaque namespace attendant sa page (« pré-seed », tracé
 * dans TODO § Pages manquantes). Le portage étant terminé (bascule du 21/07),
 * une clé sans consommateur redevient un SIGNAL : vestige V2 à purger, ou
 * faute de frappe entre le code et la locale.
 *
 * Deux gardes :
 *   1. clés identiques ×5 langues (une clé ajoutée dans une seule langue
 *      rendrait sa traduction silencieusement impossible) ;
 *   2. chaque clé EN est consommée quelque part — en littéral, ou via un
 *      PRÉFIXE DYNAMIQUE détecté dans le code (`t(\`tools.\${slug}\`)`,
 *      `'guides.' + x`…). Les préfixes sont EXTRAITS du source, pas déclarés à
 *      la main : un refactor qui supprime le consommateur dynamique ré-expose
 *      ses clés au test.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const LOCALES_DIR = resolve(__dirname);
const LANGS = ['en', 'fr', 'jp', 'kr', 'zh'] as const;

function keysOf(lang: string): string[] {
  const src = readFileSync(join(LOCALES_DIR, `${lang}.ts`), 'utf8');
  return [...src.matchAll(/^\s*'([^']+)':/gm)].map((m) => m[1]);
}

/** Tout le code susceptible de consommer une clé (src + datagen, locales exclues). */
function sourceCorpus(): string {
  let out = '';
  const walk = (dir: string): void => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) {
        if (!p.includes('locales') && !e.name.startsWith('.')) walk(p);
      } else if (/\.(ts|tsx)$/.test(e.name) && !e.name.endsWith('.test.ts')) {
        out += readFileSync(p, 'utf8');
      }
    }
  };
  walk(resolve(LOCALES_DIR, '../..')); // src/
  walk(resolve(LOCALES_DIR, '../../../datagen'));
  return out;
}

describe('locales — contrat des clés', () => {
  const enKeys = keysOf('en');

  it('les 5 langues portent EXACTEMENT les mêmes clés', () => {
    const ref = new Set(enKeys);
    for (const lang of LANGS) {
      if (lang === 'en') continue;
      const keys = keysOf(lang);
      const missing = enKeys.filter((k) => !keys.includes(k));
      const extra = keys.filter((k) => !ref.has(k));
      expect(missing, `${lang} : clés absentes`).toEqual([]);
      expect(extra, `${lang} : clés en trop`).toEqual([]);
    }
  });

  it('chaque clé a un consommateur (littéral ou préfixe dynamique du code)', () => {
    const corpus = sourceCorpus();
    // Préfixes dynamiques réels : segment de template `xxx.${` ou concat `'xxx.' +`.
    const dynamic = new Set<string>([
      ...[...corpus.matchAll(/`([a-z][a-z0-9_.-]*\.)\$\{/gi)].map((m) => m[1]),
      ...[...corpus.matchAll(/'([a-z][a-z0-9_.-]*\.)'\s*\+/gi)].map((m) => m[1]),
    ]);
    const dead = enKeys.filter(
      (k) =>
        !corpus.includes(`'${k}'`) &&
        !corpus.includes(`"${k}"`) &&
        !corpus.includes(`\`${k}\``) &&
        ![...dynamic].some((p) => k.startsWith(p)),
    );
    expect(dead, 'clés sans consommateur (vestige V2 à purger, ou typo)').toEqual([]);
  });
});
