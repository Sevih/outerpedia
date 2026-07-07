/**
 * CONTRÔLE DES TAGS INLINE (port de l'outil V2) : balaye tout le contenu
 * éditorial ({B/…}, {P/…}, {I-W/…}…) et vérifie que chaque tag a une
 * correspondance dans la donnée — même résolution que le rendu parse-text.
 *
 * Collecte PARTAGÉE entre la page /admin/tags (diagnostic) et le test vitest
 * (`tag-control.test.ts`) qui rend le contrôle BLOQUANT : un tag sans
 * correspondance fait échouer la suite avant tout build.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { checkText, type TagCheck } from '@/lib/parse-text';
import { loadCuratedCharacters } from '@/lib/data/curated';
import { characterDisplayName, getCharacter } from '@/lib/data/characters';

/** Une occurrence de tag contrôlée, avec sa provenance. */
export interface TagOccurrence extends TagCheck {
  source: string;
}

/** Collecte récursive des chaînes contenant des tags dans un JSON. */
function walkStrings(node: unknown, path: string, out: { path: string; text: string }[]): void {
  if (typeof node === 'string') {
    if (node.includes('{')) out.push({ path, text: node });
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((v, i) => walkStrings(v, `${path}[${i}]`, out));
    return;
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) walkStrings(v, `${path}.${k}`, out);
  }
}

function readJson(p: string): unknown {
  try {
    return JSON.parse(readFileSync(resolve(process.cwd(), p), 'utf8'));
  } catch {
    return null;
  }
}

/** Nom lisible d'un perso pour la provenance (id sinon). */
function charLabel(id: string): string {
  const c = getCharacter(id);
  return c ? `${characterDisplayName(c)} (${id})` : id;
}

/** Balaye tout le contenu éditorial et retourne chaque tag contrôlé. */
export function collectTagOccurrences(): TagOccurrence[] {
  const occurrences: TagOccurrence[] = [];
  const scan = (source: string, text: string) => {
    for (const c of checkText(text)) occurrences.push({ source, ...c });
  };

  // Pros/cons legacy (repli transitoire, clé = id de perso).
  const prosCons = readJson('data/legacy/pros-cons.json') as Record<string, unknown> | null;
  if (prosCons) {
    for (const [id, entry] of Object.entries(prosCons)) {
      const texts: { path: string; text: string }[] = [];
      walkStrings(entry, '', texts);
      for (const t of texts) scan(`pros-cons · ${charLabel(id)}${t.path}`, t.text);
    }
  }

  // Curated persos : pros/cons migrés + synergies (réfs libres `{…}` + raisons).
  for (const [id, entry] of Object.entries(loadCuratedCharacters())) {
    if (entry.prosCons) {
      const texts: { path: string; text: string }[] = [];
      walkStrings(entry.prosCons, '', texts);
      for (const t of texts) scan(`curated pros-cons · ${charLabel(id)}${t.path}`, t.text);
    }
    for (const [gi, g] of (entry.synergies ?? []).entries()) {
      for (const h of g.heroes)
        if (h.startsWith('{')) scan(`synergies · ${charLabel(id)}[${gi}]`, h);
      for (const v of Object.values(g.reason ?? {}))
        if (v) scan(`synergies · ${charLabel(id)}[${gi}]`, v);
    }
  }

  // Gear reco + presets (notes éditoriales avec tags).
  for (const file of ['data/curated/gear-reco.json', 'data/curated/gear-presets.json']) {
    const data = readJson(file);
    if (!data) continue;
    const texts: { path: string; text: string }[] = [];
    walkStrings(data, '', texts);
    for (const t of texts) scan(`${file.split('/').pop()}${t.path}`, t.text);
  }

  return occurrences;
}
