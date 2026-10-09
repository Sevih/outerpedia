/**
 * ORACLE gear-solver — la fiche « Base Stats » du wiki comparée, personnage par
 * personnage et niveau par niveau, à la composition `composeCharStats` du
 * gear-solver (formules confrontées aux captures en jeu, `data/stat-locks.json`
 * de ce dépôt-là). outerpedia ne peut pas importer ce code : la comparaison
 * porte sur un instantané, `fixtures/gear-solver-oracle.json`, écrit par
 * `scripts/export-wiki-oracle.mjs` du gear-solver. Sa provenance (commit du
 * gear-solver, hash des données solver, version des tables) est dans le
 * fichier.
 *
 * Deux comparaisons, chacune sur les 11 stats que les deux côtés connaissent
 * (CDMG RED% n'existe pas côté solver) :
 *   - `white` : portion blanche (base interpolée + évolutions) = `step.stats`
 *     de `computeStatSteps` ;
 *   - `full`  : la fiche telle qu'elle s'affiche par défaut (transcendance au
 *     dernier palier, codex max, quirks actifs) = `composeStep(...).value`,
 *     contre le `noGearStats` du solver (tout au max, compétences comprises).
 *
 * Seuls les personnages présents DES DEUX CÔTÉS sont comparés : un perso ajouté
 * par un patch, absent de l'instantané, ne fait rien échouer.
 *
 * Régénérer l'instantané (après un changement de formule dans le gear-solver ou
 * une synchro de données qui touche les persos), depuis le gear-solver :
 *   npm run oracle:wiki -- --out ../outerpedia/src/lib/data/fixtures/gear-solver-oracle.json
 */
import { describe, expect, it } from 'vitest';
import type { Character, ProgressionData } from '@contracts';
import { composeStep, type StepStatKey } from '@/lib/stat-compose';
import { computeStatSteps, getStatLayers } from './char-progression';
import oracleData from './fixtures/gear-solver-oracle.json';
import charactersData from '@data/generated/characters.json';
import progressionData from '@data/generated/progression.json';
import solverVersion from '@data/generated/solver/version.json';

interface Oracle {
  provenance: {
    generator: string;
    gearSolverCommit: string | null;
    gearSolverDirty: boolean | null;
    dataHash: string | null;
    dataBuiltAt: string | null;
    resVersion: string | null;
  };
  levels: number[];
  stats: string[];
  characters: Record<
    string,
    { name: string; white: Record<string, number[]>; full: Record<string, number[]> }
  >;
}

const ORACLE = oracleData as unknown as Oracle;
const CHARS = charactersData as unknown as Record<string, Character>;
const PROGRESSION = progressionData as unknown as ProgressionData;

/** Colonne de l'instantané (clé moteur du solver) → clé d'affichage du wiki. */
const COLUMN_KEY: Record<string, StepStatKey> = {
  atk: 'ATK',
  def: 'DEF',
  hp: 'HP',
  spd: 'SPD',
  chc: 'CHC',
  chd: 'CHD',
  pen: 'PEN%',
  dmgInc: 'DMG UP%',
  dmgRed: 'DMG RED%',
  eff: 'EFF',
  res: 'RES',
};

type Layer = 'white' | 'full';

/**
 * Qui a raison selon le jeu : `gear-solver`, `wiki`, `aucun`, ou `partagé` (le
 * solver a raison sur une partie, tort sur une autre — dit dans `detail`).
 */
type Verdict = 'gear-solver' | 'wiki' | 'aucun' | 'partagé';
/** D'où vient le verdict : une capture prise en jeu, ou la seule lecture du code
 * du client (`outerpedia-gamedata/apk/dumped/src/`, 1.4.18). */
type Basis = 'capture' | 'code';

interface KnownDivergence {
  layers: Layer[];
  why: string;
  verdict: Verdict;
  basis: Basis;
  detail?: string;
}

/**
 * ÉCARTS CONNUS — aucun aujourd'hui. Le test exige qu'un écart listé diverge
 * ENCORE sur exactement ses couches : le jour où il est corrigé, il échoue, et
 * c'est cette liste qu'on vide.
 *
 * Historique : l'audit des doublons (PR #51, `docs/audit-doublons-solver.md`)
 * en avait trouvé neuf — les six Core Fusion (base prise au templet 27xxxxx,
 * évolutions absentes, un seul buff de passif retenu) et les passifs permanents
 * de S2 de Claire, Ame et Bell Cranel. Tranchés par le client décompilé et par
 * huit captures en jeu du 09/10/2026 (Snow fusionné ATK 1503 / HP 6452 /
 * DEF 1366 / SPD 155, Lisha ATK 2093, Veronica ATK 1562, Claire ATK 1002 avec
 * S2 niv. 1, Ame CHC 46 % avec S2 niv. 5), puis corrigés des deux côtés : la
 * base des fusionnés dans le contrat (T16, #59) et la fiche, qui lit désormais
 * le contrat (T18, #60). L'instantané a été régénéré après ces correctifs.
 */
const KNOWN_DIVERGENCES: Record<string, KnownDivergence> = {};

/** Écarts d'un perso sur une couche, sous la forme « lv100 HP wiki 5202 ≠ 7171 ». */
function diffsOf(id: string, layer: Layer): string[] {
  const char = CHARS[id];
  const expected = ORACLE.characters[id][layer];
  const layers = getStatLayers(char);
  const sel = {
    tierIdx: layers.transcend.length - 1,
    codexLevel: layers.codex.length - 1,
    quirksOn: true,
  };
  const out: string[] = [];
  for (const step of computeStatSteps(char).steps) {
    const row = expected[String(step.level)];
    if (!row) continue;
    const composed = layer === 'full' ? composeStep(step, layers, sel) : undefined;
    ORACLE.stats.forEach((col, i) => {
      const key = COLUMN_KEY[col];
      const wiki = composed ? composed[key].value : step.stats[key];
      if (wiki !== row[i]) out.push(`lv${step.level} ${key} wiki ${wiki} ≠ ${row[i]}`);
    });
  }
  return out;
}

const COMMON = Object.keys(ORACLE.characters).filter((id) => CHARS[id]);

/** Rappelé dans les messages d'échec : un instantané pris sur d'autres données
 * que celles du wiki explique un écart sans que la fiche ait changé. */
const STALE =
  ORACLE.provenance.dataHash === solverVersion.hash
    ? ''
    : ` — instantané pris sur les données ${ORACLE.provenance.dataHash}, le wiki est sur ${solverVersion.hash} : régénérer l'instantané avant de conclure`;

describe('oracle gear-solver — instantané', () => {
  it('porte sa provenance : commit du gear-solver, données, version des tables', () => {
    expect(ORACLE.provenance.gearSolverCommit).toMatch(/^[0-9a-f]{40}$/);
    expect(ORACLE.provenance.gearSolverDirty).toBe(false);
    expect(ORACLE.provenance.dataHash).toBeTruthy();
    expect(ORACLE.provenance.resVersion).toBeTruthy();
  });

  it('colonnes connues du test (une colonne inconnue serait ignorée en silence)', () => {
    expect(ORACLE.stats.filter((c) => !COLUMN_KEY[c])).toEqual([]);
  });

  it('couvre le niveau 1, le 100 et le maximum de chaque palier de limit break', () => {
    expect(COMMON.length).toBeGreaterThan(0);
    for (const id of COMMON) {
      const c = CHARS[id];
      const lb = PROGRESSION.limitBreak[`${c.rarity}_${c.element}`] ?? [];
      const wanted = [1, 100, ...lb.map((s) => s.maxLevel)];
      for (const part of ['white', 'full'] as const)
        expect(Object.keys(ORACLE.characters[id][part]).map(Number), `${id} ${part}`).toEqual(
          expect.arrayContaining(wanted),
        );
    }
  });

  it('chaque écart connu désigne un perso de l’instantané et du wiki', () => {
    expect(Object.keys(KNOWN_DIVERGENCES).filter((id) => !COMMON.includes(id))).toEqual([]);
  });
});

describe('fiche « Base Stats » du wiki = composeCharStats du gear-solver', () => {
  for (const layer of ['white', 'full'] as const) {
    it(`${layer} : identique pour tout perso hors écarts connus`, () => {
      const unexpected: Record<string, string[]> = {};
      for (const id of COMMON) {
        if (KNOWN_DIVERGENCES[id]?.layers.includes(layer)) continue;
        const d = diffsOf(id, layer);
        if (d.length) unexpected[`${id} ${ORACLE.characters[id].name}`] = d;
      }
      expect(unexpected, `écarts non répertoriés${STALE}`).toEqual({});
    });
  }

  it.each(Object.entries(KNOWN_DIVERGENCES))(
    'écart connu %s : diverge encore (sinon, retirer de KNOWN_DIVERGENCES)',
    (id, { layers, why }) => {
      for (const layer of layers)
        expect(diffsOf(id, layer).length, `${why} — couche ${layer}`).toBeGreaterThan(0);
    },
  );
});
