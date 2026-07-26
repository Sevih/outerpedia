/**
 * Garde de forme des corps d'écriture admin (audit F3). Ce qui est verrouillé
 * ici, c'est le refus des payloads qui, passés tels quels à un store,
 * SUPPRIMAIENT l'entrée curée en silence (compact vide ⇒ suppression) — et le
 * fait qu'un JSON malformé devienne un 400 lisible au lieu d'un 500.
 */
import { describe, expect, it } from 'vitest';
import { jsonArrayBody, jsonObjectBody, optionalJsonObject } from './route-body';

/** Une Request qui porte le texte brut voulu (y compris du JSON cassé). */
const req = (raw: string): Request =>
  new Request('http://local/admin', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: raw,
  });

const status = async (r: { ok: boolean; res?: Response }) => r.res?.status;
const errorsOf = async (r: { ok: boolean; res?: Response }) =>
  ((await r.res?.json()) as { errors: string[] } | undefined)?.errors?.join() ?? '';

describe('jsonObjectBody', () => {
  it('accepte un objet et le rend typé', async () => {
    const r = await jsonObjectBody<{ a: number }>(req('{"a":1}'));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.body).toEqual({ a: 1 });
  });

  it('accepte un objet VIDE — « plus de curation » est une intention légitime', async () => {
    const r = await jsonObjectBody(req('{}'));
    expect(r.ok).toBe(true);
  });

  it('refuse les payloads qui effaçaient la curation en silence', async () => {
    // Chacun se compacte en « vide » côté store → suppression de l'entrée, avec
    // un `{ ok: true }` en réponse. C'est le cœur de F3.
    for (const raw of ['"bonjour"', '42', 'true', '["a"]', 'null']) {
      const r = await jsonObjectBody(req(raw));
      expect(r.ok, `payload ${raw}`).toBe(false);
      expect(await status(r)).toBe(400);
      expect(await errorsOf(r)).toMatch(/objet JSON attendu/);
    }
  });

  it('refuse un JSON malformé en 400 (et non un 500 avec stack)', async () => {
    const r = await jsonObjectBody(req('{"a":1,'));
    expect(r.ok).toBe(false);
    expect(await status(r)).toBe(400);
    expect(await errorsOf(r)).toMatch(/corps JSON invalide/);
  });

  it('refuse un corps VIDE (aucun JSON à lire)', async () => {
    const r = await jsonObjectBody(req(''));
    expect(r.ok).toBe(false);
    expect(await errorsOf(r)).toMatch(/corps JSON invalide/);
  });
});

describe('jsonArrayBody', () => {
  it('accepte un tableau, vide compris (vider une liste est légitime)', async () => {
    for (const raw of ['[]', '[{"x":1}]']) {
      expect((await jsonArrayBody(req(raw))).ok, `payload ${raw}`).toBe(true);
    }
  });

  it('refuse un objet là où une liste est attendue', async () => {
    const r = await jsonArrayBody(req('{"a":1}'));
    expect(r.ok).toBe(false);
    expect(await errorsOf(r)).toMatch(/tableau JSON attendu/);
  });

  it('refuse un JSON malformé', async () => {
    const r = await jsonArrayBody(req('[1,'));
    expect(r.ok).toBe(false);
    expect(await errorsOf(r)).toMatch(/corps JSON invalide/);
  });
});

describe('optionalJsonObject — routes d’ACTION (corps facultatif)', () => {
  it('rend les options quand le corps en porte', async () => {
    expect(await optionalJsonObject<{ mode: string }>(req('{"mode":"typos"}'))).toEqual({
      mode: 'typos',
    });
  });

  it('rend {} sans jamais lever : corps absent, cassé, null ou scalaire', async () => {
    // Poster sans corps est un usage NORMAL ici (bouton « valider la cible »).
    // Le `null` littéral est le cas qui levait un 500 avant : JSON valide, donc
    // non rattrapé par un `.catch()`, puis `body.mode` sur `null`.
    for (const raw of ['', '{oops', 'null', '"texte"', '42', '[]']) {
      expect(await optionalJsonObject(req(raw)), `payload ${raw}`).toEqual({});
    }
  });
});
