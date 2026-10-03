/**
 * Tests de `buildSkillDescs` — d'OÙ sortent les descs du popover (constat G12
 * de `docs/audit/transverse.md`). En dry, promote n'écrit pas `data/generated` :
 * la projection lisait donc le `skills.json` d'AVANT le patch pendant que les
 * autres tables damage sortaient des tables fraîches — deux versions sous un
 * seul `resVersion`, et `damage-data.test.ts` restait vert puisqu'il compare
 * au même `skills.json` committé.
 *
 * Deux dossiers temporaires jouent le validé (avant le patch) et la proposition
 * (après) ; le roster est simulé — les vrais `data/` ne sont pas lus. Le
 * maillon d'avant (qui passe `--from-extracted`, et quand) est verrouillé dans
 * `refresh.test.ts`.
 */
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  FROM_EXTRACTED_FLAG,
  WIKI_EXTRACTED,
  WIKI_GENERATED,
  buildSkillDescs,
  wikiDirOf,
} from './skill-descs';

// Le roster VALIDÉ : un seul perso intégré. `2400015` n'existe que dans la
// proposition (perso d'un patch à venir).
vi.mock('./roster', () => ({ integratedIds: () => new Set(['2000001']) }));

let generated: string;
let extracted: string;

const put = (dir: string, name: string, data: unknown): void =>
  writeFileSync(join(dir, name), JSON.stringify(data));

const skill = (id: string, type: string, text: string, value: string) => ({
  id,
  type,
  desc: { en: `${text} [Buff_V_b1]` },
  levels: [{ level: 1, vars: { b1: { v: value }, unused: { v: '1' } } }],
});

beforeEach(() => {
  generated = mkdtempSync(join(tmpdir(), 'skill-descs-generated-'));
  extracted = mkdtempSync(join(tmpdir(), 'skill-descs-extracted-'));

  // Le validé : l'état d'AVANT le patch.
  put(generated, 'characters.json', { '2000001': { id: '2000001', skills: ['s1'] } });
  put(generated, 'skills.json', { s1: skill('s1', 'first', 'Before the patch', '10') });

  // La proposition : s1 reworké, un ultimate ajouté au perso intégré, et un
  // perso non intégré avec son skill.
  put(extracted, 'characters.json', {
    '2000001': { id: '2000001', skills: ['s1', 's3'] },
    '2400015': { id: '2400015', skills: ['sx'] },
  });
  put(extracted, 'skills.json', {
    s1: skill('s1', 'first', 'After the patch', '20'),
    s3: skill('s3', 'ultimate', 'New ultimate', '30'),
    sx: skill('sx', 'first', 'Unreleased', '40'),
  });
});

afterEach(() => {
  rmSync(generated, { recursive: true, force: true });
  rmSync(extracted, { recursive: true, force: true });
});

describe('buildSkillDescs — une seule version des artefacts wiki par run', () => {
  it('promote en dry (proposition) : AUCUNE desc ni var du skills.json d’avant le patch', () => {
    const out = buildSkillDescs({ wikiDir: extracted });
    expect(out.skills.s1).toEqual({
      desc: { en: 'After the patch [Buff_V_b1]' },
      levels: [{ level: 1, vars: { b1: { v: '20' } } }],
    });
    expect(JSON.stringify(out)).not.toContain('Before the patch');
    // La liste de skills du perso vient du MÊME dossier que les descs : lue
    // dans le validé, l'ultimate ajouté par le patch manquerait à la projection.
    expect(Object.keys(out.skills)).toEqual(['s1', 's3']);
  });

  it('la proposition ne fait pas sortir un perso NON intégré — le roster reste le validé', () => {
    expect(buildSkillDescs({ wikiDir: extracted }).skills.sx).toBeUndefined();
  });

  it('le validé reste lu tel quel hors dry (damage:build seul, sync-derived)', () => {
    const out = buildSkillDescs({ wikiDir: generated });
    expect(out.skills).toEqual({
      s1: {
        desc: { en: 'Before the patch [Buff_V_b1]' },
        levels: [{ level: 1, vars: { b1: { v: '10' } } }],
      },
    });
  });
});

describe('wikiDirOf — le dossier que désignent les arguments de damage/build.ts', () => {
  it('sans argument : le validé', () => {
    expect(wikiDirOf([])).toBe(WIKI_GENERATED);
    expect(wikiDirOf(['--skip-anim'])).toBe(WIKI_GENERATED);
  });

  it('`--from-extracted` : la proposition', () => {
    expect(wikiDirOf([FROM_EXTRACTED_FLAG])).toBe(WIKI_EXTRACTED);
    expect(wikiDirOf(['--skip-anim', '--from-extracted'])).toBe(WIKI_EXTRACTED);
  });
});
