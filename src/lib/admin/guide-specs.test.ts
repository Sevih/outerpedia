/**
 * `GUIDE_SPECS.groupModes` — les combats qu'une catégorie de guide a le droit de
 * désigner, et donc les seuls que son sélecteur propose.
 *
 * Une liste écrite à la main dérive : le jeu ajoute un mode, la catégorie
 * l'utilise, et le sélecteur cesse en silence de proposer le bon combat — la
 * panne se lit alors comme « le combat n'existe pas », ce qui est faux. Ces
 * tests la confrontent au CONTENU RÉEL : ce que les guides désignent vraiment
 * doit être exactement ce que la spec autorise.
 *
 * Ils ne gardent PAS le rendu : un `group` hors mode s'afficherait très bien. Ce
 * qu'ils gardent, c'est qu'on puisse encore choisir.
 */
import { describe, expect, it } from 'vitest';
import { listGuides, readGuideVersionFile, type Guide } from '@/lib/data/guides';
import { encountersOfGroup, listGroups } from '@/lib/data/encounters';
import { GUIDE_SPECS } from './guide-draft';

/** Clés d'un `config.json` de version qui désignent un combat (cf. repin-guides). */
const GROUP_KEYS = ['group', 'main', 'subA', 'subB'] as const;

/** Tous les `group` qu'un guide désigne, meta et versions confondues. */
function groupsOf(g: Guide): string[] {
  const out = g.group ? [g.group] : [];
  for (const v of g.versions) {
    const cfg = readGuideVersionFile<Record<string, unknown>>(g, v.key, 'config.json');
    if (!cfg) continue;
    for (const k of GROUP_KEYS) if (typeof cfg[k] === 'string') out.push(cfg[k]);
  }
  return out;
}

/** Le mode du donjon d'un combat — la clé sur laquelle `listGroups` filtre. */
const modeOfGroup = (group: string): string | undefined => encountersOfGroup(group)[0]?.ref.mode;

/** Modes RÉELLEMENT désignés par les guides, par catégorie. */
const byCategory = new Map<string, Set<string>>();
for (const g of listGuides()) {
  for (const group of groupsOf(g)) {
    const mode = modeOfGroup(group);
    if (!mode) continue;
    const modes = byCategory.get(g.category) ?? new Set<string>();
    modes.add(mode);
    byCategory.set(g.category, modes);
  }
}

describe('groupModes — la spec dit ce que le contenu fait', () => {
  it('le scan trouve des combats (sinon tout ce qui suit passe à vide)', () => {
    expect([...byCategory.values()].reduce((n, s) => n + s.size, 0)).toBeGreaterThan(0);
  });

  it('chaque mode RÉELLEMENT utilisé est autorisé par la spec de sa catégorie', () => {
    const gaps: string[] = [];
    for (const [category, modes] of byCategory) {
      const allowed = GUIDE_SPECS[category]?.groupModes;
      if (!allowed) continue; // catégorie non éditable ici, ou sans restriction
      for (const m of modes) {
        if (!allowed.includes(m)) gaps.push(`${category} : « ${m} » utilisé mais pas déclaré`);
      }
    }
    expect(gaps).toEqual([]);
  });

  it('aucun mode déclaré n’est MORT (une entrée que personne n’utilise)', () => {
    // L'autre sens, et il compte autant : une liste qui grossit sans jamais
    // maigrir finit par ne plus rien restreindre du tout.
    const dead: string[] = [];
    for (const [category, spec] of Object.entries(GUIDE_SPECS)) {
      const used = byCategory.get(category);
      if (!spec.groupModes || !used) continue;
      for (const m of spec.groupModes) {
        if (!used.has(m)) dead.push(`${category} : « ${m} » déclaré mais inutilisé`);
      }
    }
    expect(dead).toEqual([]);
  });

  it('toute catégorie à sélecteur de combat DÉCLARE ses modes', () => {
    const missing = Object.entries(GUIDE_SPECS)
      .filter(([, s]) => s.monster === 'group-config' || s.monster === 'group-meta')
      .filter(([, s]) => !s.groupModes?.length)
      .map(([c]) => c);
    expect(missing).toEqual([]);
  });

  it('le filtre RESTREINT vraiment — et laisse de quoi choisir', () => {
    // La contre-épreuve du mécanisme lui-même : sans elle, un `groupModes` qui
    // ne filtre rien (ou qui filtre tout) passerait les cas ci-dessus.
    const all = listGroups('en');
    for (const [category, spec] of Object.entries(GUIDE_SPECS)) {
      if (!spec.groupModes) continue;
      const some = listGroups('en', spec.groupModes);
      expect(some.length, `${category} : aucun combat proposé`).toBeGreaterThan(0);
      expect(some.length, `${category} : le filtre ne retire rien`).toBeLessThan(all.length);
    }
  });
});
