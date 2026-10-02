import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { fromContentDraft, fromFlatDraft, fromVersionDraft, guideSpec } from './guide-draft';
import { loadGuideDraft } from './guide-store';
import { listGuides } from '@/lib/data/guides';

/**
 * Deux invariants que RIEN ne signale quand ils cassent — c'est tout le problème :
 * la donnée part en prod, l'outil annonce « ajoutée », et la page ne montre rien.
 *
 * 1. Une vidéo vit dans le fichier que son guide LIT, et ce fichier dépend de la
 *    famille : `content.json` (dimensional-singularity), `versions/<clé>/config.json`
 *    (joint-challenge, world-boss) ou `videos.json` (special-request, irregular,
 *    license). `quick` écrivait un `videos.json` pour tout le monde : deux vidéos
 *    ont dormi là des semaines sur dimensional-singularity, invisibles.
 * 2. L'aller-retour du brouillon admin ne PERD rien. Il perdait un groupe de
 *    recommandation sans personnage mais porteur d'un texte — le slot libre
 *    « Pick 3. Any 6★ Ranger/Vanguard works… » d'urd-dark, traduit en six langues,
 *    qu'une simple sauvegarde du guide aurait effacé.
 */

const CONTENTS = resolve('src/app/[lang]/guides/_contents');
const read = (...p: string[]): unknown => {
  const f = resolve(CONTENTS, ...p);
  return existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : undefined;
};

/** Clés triées récursivement : une différence d'ORDRE n'est pas une perte. */
const canon = (v: unknown): unknown =>
  Array.isArray(v)
    ? v.map(canon)
    : v && typeof v === 'object'
      ? Object.fromEntries(
          Object.entries(v as Record<string, unknown>)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, x]) => [k, canon(x)]),
        )
      : v;

describe('vidéos des guides', () => {
  it('aucune ne dort dans un fichier que son guide ne lit pas', () => {
    const égarées: string[] = [];
    for (const g of listGuides()) {
      const spec = guideSpec(g.category);
      if (!spec) continue;
      const at = `${g.category}/${g.slug}`;
      const count = (v: unknown): number => (Array.isArray(v) ? v.length : 0);

      if (spec.contentFile) {
        // Lu : content.json#videos. Un videos.json ici n'est jamais rendu.
        const n = count(read(g.category, g.slug, 'videos.json'));
        if (n) égarées.push(`${at} : ${n} dans videos.json, ignoré (famille content)`);
      } else if (spec.versioned) {
        // Lu : versions/<clé>/config.json#videos.
        for (const v of g.versions) {
          const n = count(read(g.category, g.slug, 'versions', v.key, 'videos.json'));
          if (n) égarées.push(`${at}@${v.key} : ${n} dans videos.json, ignoré (versionné)`);
        }
        const n = count(read(g.category, g.slug, 'videos.json'));
        if (n) égarées.push(`${at} : ${n} dans un videos.json racine, ignoré (versionné)`);
      } else {
        // Lu : videos.json à la racine.
        const c = read(g.category, g.slug, 'content.json') as { videos?: unknown } | undefined;
        const n = count(c?.videos);
        if (n) égarées.push(`${at} : ${n} dans content.json, ignoré (famille plate)`);
      }
    }
    expect(égarées).toEqual([]);
  });

  it("l'aller-retour du brouillon admin ne perd aucun contenu", () => {
    const pertes: string[] = [];
    for (const g of listGuides()) {
      const spec = guideSpec(g.category);
      if (!spec) continue;
      const draft = loadGuideDraft(g.category, g.slug);
      const compare = (before: unknown, after: unknown, at: string): void => {
        if (before === undefined && after === null) return;
        if (JSON.stringify(canon(before ?? null)) !== JSON.stringify(canon(after ?? null)))
          pertes.push(at);
      };

      if (spec.contentFile) {
        const before = read(g.category, g.slug, 'content.json');
        if (before !== undefined)
          compare(before, fromContentDraft(spec, draft), `${g.category}/${g.slug}/content.json`);
      } else if (spec.versioned) {
        for (const v of g.versions) {
          const vd = draft.versions.find((d) => d.key === v.key);
          if (!vd) continue;
          for (const [file, data] of Object.entries(fromVersionDraft(spec, vd)))
            compare(
              read(g.category, g.slug, 'versions', v.key, file),
              data,
              `${g.category}/${g.slug}@${v.key}/${file}`,
            );
        }
      } else {
        for (const [file, data] of Object.entries(fromFlatDraft(spec, draft)))
          compare(read(g.category, g.slug, file), data, `${g.category}/${g.slug}/${file}`);
      }
    }
    expect(pertes).toEqual([]);
  });
});
