/**
 * `extractMembers` — le découpage d'un membre dans un fichier C# décompilé
 * (ilspycmd), testé sur du texte. Un bloc coupé trop tôt = un listing tronqué
 * que la spec citerait comme complet ; un appel pris pour une déclaration = du
 * bruit dans le diff de patch.
 */
import { describe, expect, it } from 'vitest';
import { extractMembers, resolveTarget } from './extract-cs';

describe('resolveTarget — noms fabriqués par le compilateur', () => {
  it('membre ordinaire : inchangé', () => {
    expect(resolveTarget('CFormula$$CalcStat')).toEqual({ cls: 'CFormula', member: 'CalcStat' });
  });

  it('machine d’état d’itérateur → la méthode porteuse', () => {
    expect(resolveTarget('CStateBattle.<PvpAttackTeamPenaltyDmg>d__81$$MoveNext')).toMatchObject({
      cls: 'CStateBattle',
      member: 'PvpAttackTeamPenaltyDmg',
    });
  });

  it('fonction locale → la méthode qui la déclare', () => {
    expect(resolveTarget('CFormula$$<CalcDamage>g__CalcDamage|17_0')).toMatchObject({
      cls: 'CFormula',
      member: 'CalcDamage',
      folded: 'fonction locale CalcDamage',
    });
  });
});

const SRC = `using System;

public class CFormula
{
\tprivate static float s_Cache;

\tpublic static float CalcStat(int a)
\t{
\t\tif (a > 0)
\t\t{
\t\t\treturn CalcStat(a, "x}"); // accolade dans une chaîne
\t\t}
\t\treturn 0f;
\t}

\tpublic static float CalcStat(int a, string s)
\t{
\t\treturn (float)a * 1.5f;
\t}

\tpublic float Value => s_Cache * 2f;

\tpublic int Count
\t{
\t\tget
\t\t{
\t\t\treturn 3;
\t\t}
\t\tset
\t\t{
\t\t\ts_Cache = value;
\t\t}
\t}

\tpublic CFormula()
\t{
\t\ts_Cache = CalcStat(1);
\t}

\tpublic static extern void Native();

\tpublic (int addValue, int rateValue) Pair(int x)
\t{
\t\treturn (addValue: x, rateValue: 2 * x);
\t}
}
`;

describe('extractMembers', () => {
  it('méthode : toutes les surcharges, chacune jusqu’à son accolade fermante', () => {
    const blocks = extractMembers(SRC, 'CFormula', 'CalcStat');
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toMatch(/^\tpublic static float CalcStat\(int a\)/);
    expect(blocks[0].trimEnd()).toMatch(/return 0f;\n\t}$/);
    expect(blocks[1]).toContain('(float)a * 1.5f');
  });

  it('ignore les appels (`CalcStat(1)` dans le ctor n’est pas une déclaration)', () => {
    const blocks = extractMembers(SRC, 'CFormula', 'CalcStat');
    expect(blocks.some((b) => b.includes('s_Cache = CalcStat'))).toBe(false);
  });

  it('get_X → la propriété entière (accesseurs compris)', () => {
    const [count] = extractMembers(SRC, 'CFormula', 'get_Count');
    expect(count).toMatch(/^\tpublic int Count\n\t\{/);
    expect(count).toContain('set');
    expect(count.trimEnd()).toMatch(/\t}$/);
  });

  it('propriété à corps d’expression → jusqu’au `;`', () => {
    expect(extractMembers(SRC, 'CFormula', 'get_Value')).toEqual([
      '\tpublic float Value => s_Cache * 2f;',
    ]);
  });

  it('.ctor → les constructeurs', () => {
    const [ctor] = extractMembers(SRC, 'CFormula', '.ctor');
    expect(ctor).toMatch(/^\tpublic CFormula\(\)/);
    expect(ctor).toContain('s_Cache = CalcStat(1);');
  });

  it('membre sans corps (extern) → la signature seule', () => {
    expect(extractMembers(SRC, 'CFormula', 'Native')).toEqual([
      '\tpublic static extern void Native();',
    ]);
  });

  it('type de retour tuple `(int a, int b)` (GetCriticalStatBuffValues, 26/08/2026) → déclaration reconnue', () => {
    const [pair] = extractMembers(SRC, 'CFormula', 'Pair');
    expect(pair).toMatch(/^\tpublic \(int addValue, int rateValue\) Pair\(int x\)/);
    expect(pair).toContain('rateValue: 2 * x');
  });

  it('membre absent → rien (l’appelant décide de l’échec)', () => {
    expect(extractMembers(SRC, 'CFormula', 'Nope')).toEqual([]);
  });
});
