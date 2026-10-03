/**
 * Test BLOQUANT de la parité des balises inline entre les langues
 * (`CONVENTIONS.md` § i18n : une balise reste IDENTIQUE dans toutes les langues).
 *
 * Il garde le contenu COMMITTÉ : tous les JSON des guides (`_contents`) et de
 * `data/curated`. Un BLOC = un objet portant chaque langue du site en chaîne ;
 * il diverge quand le multiensemble de ses balises n'est pas le même d'une
 * langue à l'autre. Rien ne casse à l'écran dans ce cas — la langue qui écrit
 * « Ember » là où les autres écrivent `{P/Ember}` perd seulement le chip et son
 * lien —, d'où un test : personne ne le verrait.
 *
 * La forme d'une balise est celle du rendu (`TAG_REGEX` de `parse-text`), pas
 * une copie : ce que ce test compte est ce que `parseText` transforme.
 *
 * ⚠ Aucun effectif figé (cf. `datagen/curated/tags.test.ts`) : le contenu
 * grossit à chaque guide. Seules les exceptions sont nommées.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DEFAULT_LANG, LANGS } from '@/lib/i18n/config';
import { TAG_REGEX } from '@/lib/parse-text';

const GUIDES = 'src/app/[lang]/guides/_contents';
/** `gear-reco.json` compris : il est lu ici comme les autres curés. */
const ROOTS = [GUIDES, 'data/curated'];

/**
 * Divergences CONNUES au 2026-10-03, laissées en l'état parce qu'elles ne se
 * corrigent pas mécaniquement : les langues n'y disent pas la même chose, et
 * choisir laquelle a raison est une décision éditoriale. Dans les dix cas `fr`
 * et `es` suivent `en`, et `jp`/`kr`/`zh` s'en écartent ensemble.
 *
 * Une entrée se RETIRE quand le bloc est aligné (le test le réclame) ; on n'en
 * ajoute une que pour un écart qu'on a regardé et qu'on ne sait pas trancher.
 * La clé est le chemin du bloc : un élément inséré plus haut dans un tableau
 * la décale, et le test le dit — c'est le prix d'une exception nominative.
 */
const KNOWN_DIVERGENCES: ReadonlyArray<{ file: string; path: string; why: string }> = [
  // — Une balise que `en` porte et que jp/kr/zh n'ont pas (phrase plus courte) —
  {
    file: `${GUIDES}/adventure/S1-9-5/content.json`,
    path: 'tips[1]',
    why: 'en liste quatre contre-mesures, jp/kr/zh trois : {D/BT_REDISTRIBUTE_BUFF} y manque',
  },
  {
    file: `${GUIDES}/guild-raid/frost-legion/versions/2025-11/main.json`,
    path: 'teams[4].notes[8].ul[4]',
    why: 'en finit par « …, not {P/Akari} » ; jp/kr/zh ont coupé cette fin de phrase',
  },
  {
    file: `${GUIDES}/guild-raid/frost-legion/versions/2026-09/main.json`,
    path: 'teams[4].requirements.entries[0].notes[5]',
    why: 'même phrase que la version 2025-11 : « not {P/Akari} » absent de jp/kr/zh',
  },
  // — Une balise que jp/kr/zh ajoutent là où `en` ne nomme rien —
  {
    file: `${GUIDES}/dimensional-singularity/skuld-dark/content.json`,
    path: 'intro',
    why: 'en « heroes slower than Skuld » ; jp/kr/zh « dont la {S/SPD} est plus lente »',
  },
  {
    file: `${GUIDES}/dimensional-singularity/skuld-light/content.json`,
    path: 'intro',
    why: 'même phrase que skuld-dark : {S/SPD} en plus dans jp/kr/zh',
  },
  {
    file: `${GUIDES}/general-guides/premium-limited/premium-reviews.json`,
    path: 'premium[1].review',
    why: 'en « wants as many in the team as possible » (sous-entendu) ; jp/kr/zh explicitent « alliés {E/Dark} »',
  },
  {
    file: `${GUIDES}/joint-challenge/deep-sea-guardian/versions/2026-01/recommended.json`,
    path: '[3].reason',
    why: 'en « …COUNTER_RATE buff » ; jp/kr/zh « un {C/Striker} qui a …COUNTER_RATE »',
  },
  {
    file: `${GUIDES}/joint-challenge/deep-sea-guardian/versions/2026-06/recommended.json`,
    path: '[3].reason',
    why: 'même phrase que la version 2026-01 : {C/Striker} en plus dans jp/kr/zh',
  },
  {
    file: `${GUIDES}/special-request/glicys/recommended.json`,
    path: '[1].reason',
    why: 'en « {C/Healer} options » ; jp/kr/zh « {C/Healer} {E/Earth} qui a {B/BT_IMMUNE} »',
  },
  // — Les deux à la fois —
  {
    file: `${GUIDES}/special-request/beatles/recommended.json`,
    path: '[2].reason',
    why: 'en « {C/Healer} to keep the team alive » ; jp/kr/zh « healer {E/Fire} », la classe écrite en clair',
  },
];

interface Block {
  /** `fichier :: chemin`, la clé d'une exception. */
  id: string;
  /** Écarts par rapport à la langue de référence ; vide = bloc aligné. */
  gaps: string[];
}

const tagsOf = (text: string): string[] => (text.match(TAG_REGEX) ?? []).sort();

/** Occurrences de `a` absentes de `b` (différence de multiensembles). */
function minus(a: string[], b: string[]): string[] {
  const rest = [...b];
  return a.filter((tag) => {
    const i = rest.indexOf(tag);
    if (i === -1) return true;
    rest.splice(i, 1);
    return false;
  });
}

function jsonFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) jsonFiles(full, out);
    else if (entry.name.endsWith('.json')) out.push(full);
  }
  return out;
}

function collect(node: unknown, path: string, file: string, out: Block[]): void {
  if (Array.isArray(node)) {
    node.forEach((child, i) => collect(child, `${path}[${i}]`, file, out));
    return;
  }
  if (!node || typeof node !== 'object') return;
  const record = node as Record<string, unknown>;
  if (LANGS.every((lang) => typeof record[lang] === 'string')) {
    const ref = tagsOf(record[DEFAULT_LANG] as string);
    const gaps = LANGS.flatMap((lang) => {
      const tags = tagsOf(record[lang] as string);
      const extra = minus(tags, ref);
      const missing = minus(ref, tags);
      if (extra.length === 0 && missing.length === 0) return [];
      return [`${lang} +[${extra.join(' ')}] -[${missing.join(' ')}]`];
    });
    out.push({ id: `${file} :: ${path}`, gaps });
  }
  for (const [key, child] of Object.entries(record)) {
    collect(child, path ? `${path}.${key}` : key, file, out);
  }
}

const cwd = process.cwd();
const blocks: Block[] = [];
for (const root of ROOTS) {
  for (const full of jsonFiles(resolve(cwd, root)).sort()) {
    const file = relative(cwd, full).split('\\').join('/');
    collect(JSON.parse(readFileSync(full, 'utf8')), '', file, blocks);
  }
}
const known = new Set(KNOWN_DIVERGENCES.map((e) => `${e.file} :: ${e.path}`));

describe('balises inline — parité entre les langues', () => {
  it('le scan ne tourne pas à vide', () => {
    expect(blocks.length).toBeGreaterThan(0);
    expect(known.size).toBe(KNOWN_DIVERGENCES.length);
  });

  it(`aucun bloc ne diverge de « ${DEFAULT_LANG} » hors exceptions nommées`, () => {
    const unexpected = blocks
      .filter((b) => b.gaps.length > 0 && !known.has(b.id))
      .map((b) => `${b.id} — ${b.gaps.join(' ; ')}`);
    expect(unexpected).toEqual([]);
  });

  it('chaque exception désigne un bloc qui diverge encore (sinon : la retirer)', () => {
    const diverging = new Set(blocks.filter((b) => b.gaps.length > 0).map((b) => b.id));
    expect([...known].filter((id) => !diverging.has(id))).toEqual([]);
  });
});
