import { describe, expect, it } from 'vitest';
import { rankingHelperRows } from '@/lib/contribute/ranking-helper-data';

/**
 * Le vocabulaire de comparaison des EE doit couvrir les effets SANS statut
 * nommé (rapport Sevih 03/08 : Lambda affichait « pas d'EE » alors que
 * Triaena existe — ses deux effets sont muets — et son « Penetration vs
 * bosses » ne matchait pas celui de Frost Nova). Tests sur la donnée RÉELLE :
 * si une régression ré-appauvrit le vocabulaire, ils cassent.
 */

const rows = rankingHelperRows();
const byId = new Map(rows.map((r) => [r.id, r]));

describe('rankingHelperRows — vocabulaire de comparaison EE', () => {
  it('tout perso à EE expose au moins une chip comparable', () => {
    const withEe = rows.filter((r) => r.ee);
    expect(withEe.length).toBeGreaterThan(0);
    const empty = withEe.filter((r) => r.ee!.chips.length === 0);
    expect(empty.map((r) => `${r.id} ${r.name}`)).toEqual([]);
  });

  it('Lambda (Triaena) et Snow core-fusion (Frost Nova) partagent la clé Penetration', () => {
    const lambda = byId.get('2000118');
    const snowCf = byId.get('2700003');
    expect(lambda?.ee, 'Lambda doit avoir un EE').toBeTruthy();
    expect(snowCf?.ee, 'Snow core-fusion doit avoir un EE').toBeTruthy();
    const refs = (r: typeof lambda) => new Set(r!.ee!.chips.map((c) => c.ref));
    const shared = [...refs(lambda)].filter((ref) => refs(snowCf).has(ref));
    expect(shared).toContain('stat:pierce_power_rate:up');
  });
});
