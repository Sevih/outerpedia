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
 * ÉCARTS CONNUS — audit des doublons outerpedia ↔ gear-solver (PR #51,
 * `docs/audit-doublons-solver.md`), attribués par le code du client décompilé
 * et par des captures en jeu (tâche T16 de
 * `sevih-tool/docs/taches-cloud-2026-10-09.md`, section « Les captures » :
 * lv100 sans équipement, tout au max — Snow ATK 1503 / HP 6452 / DEF 1366 /
 * SPD 155, Lisha ATK 2093, Veronica ATK 1562, Claire ATK 1002 avec S2 niv. 1,
 * Ame CHC 46 % avec S2 niv. 5). Le test exige qu'ils divergent ENCORE, sur exactement ces
 * couches : le jour où la fiche est corrigée, il échoue, et c'est cette liste
 * qu'on vide.
 *
 * Ce que dit le client, pour une fiche hors combat (`CCharacterData.CalcStat`) :
 *   - un perso fusionné garde l'ID de son perso d'ORIGINE (`Initialize` reçoit
 *     `CharID`, la fusion ne renseigne que `FusionCharID`) ; `GetEvolutionStat`
 *     lit `GetCharacterEvolutionStatTempletList(ID)`, donc les évolutions du
 *     perso d'origine — la règle du solver (§ 2.2) ;
 *   - `CalcBasicStats` lit `Templet`, celui du même ID : les Min/Max de base
 *     sont ceux du perso d'origine. Les deux côtés prennent ceux du templet
 *     27xxxxx ; ils ne diffèrent que pour Snow et Lisha (Snow : ATK 66-659 à
 *     l'origine, 75-757 au templet de fusion). Les captures de Snow le
 *     confirment sur l'ATK, les HP, la DEF et la vitesse ;
 *   - `InitStatPremiumBuff` ← `CSkillManager.GetStatPremiumBuffList` prend, sur
 *     TOUS les skills du perso (pour un fusionné, les `SkillIDs` du templet de
 *     fusion, Skill_23 compris), TOUS les buffs `BT_STAT_PREMIUM` de création
 *     `PASSIVE` ciblant `ME` ou `MY_TEAM`, au niveau courant du skill ;
 *     `CStatValue.SetBuffPremiumValue` les cumule tous. Ni « premier buff », ni
 *     Skill_23 à la place de Skill_22 : la règle du solver (§ 2.4, confirmée
 *     par la capture de Lisha, classe + noyau = +20,2 %) ; et les passifs
 *     permanents de S1/S2/S3 y entrent comme les autres (§ 2.5) — confirmé par
 *     Ame (S2 niv. 5 : +25 CHC compté) et par Claire (S2 niv. 1, niveau sans
 *     buff : rien de compté).
 *
 * L'instantané n'est PAS régénéré ici : il le sera après le correctif de base
 * des fusionnés (T16). D'ici là, ses valeurs de Snow et Lisha portent la base
 * du templet de fusion — fausse, mais sans effet sur ce test, qui ne vérifie
 * que la divergence.
 */
const KNOWN_DIVERGENCES: Record<string, KnownDivergence> = {
  // § 2.2 + § 2.4 — évolutions (absentes de la fiche) et passifs classe + noyau
  // (réduits à un buff). Le wiki a tort sur les deux points.
  '2700003': {
    layers: ['white', 'full'],
    why: 'Core Fusion Snow : évolutions + passifs',
    verdict: 'partagé',
    basis: 'capture',
    detail:
      'solver juste sur évolution et passif de noyau, faux sur la base (templet de fusion au lieu de 2000003) ; wiki faux sur les trois',
  },
  '2700005': {
    layers: ['white', 'full'],
    why: 'Core Fusion Lisha : évolutions + passifs',
    verdict: 'partagé',
    basis: 'capture',
    detail:
      'solver juste sur évolution et passifs classe + noyau cumulés, faux sur la base (templet de fusion au lieu de 2000005) ; wiki faux sur les trois',
  },
  '2700037': {
    layers: ['white', 'full'],
    why: 'Core Fusion Veronica : évolutions + passifs',
    verdict: 'gear-solver',
    basis: 'capture',
    detail: 'même base des deux templets ; capture ATK seule',
  },
  '2700043': {
    layers: ['white', 'full'],
    why: 'Core Fusion Eternal : évolutions + passifs',
    verdict: 'gear-solver',
    basis: 'code',
  },
  '2700056': {
    layers: ['white', 'full'],
    why: 'Core Fusion Notia : évolutions + passifs',
    verdict: 'gear-solver',
    basis: 'code',
  },
  '2700070': {
    layers: ['white', 'full'],
    why: 'Core Fusion Epsilon : évolutions + passifs',
    verdict: 'gear-solver',
    basis: 'code',
  },
  // § 2.5 — passif S2 permanent (BT_STAT_PREMIUM PASSIVE sur soi), couche
  // absente de la fiche : la portion blanche est juste, la fiche affichée ne
  // l'est pas. Le client compte ce buff au niveau courant de S2.
  '2000017': {
    layers: ['full'],
    why: 'Claire : S2 +10 % ATK',
    verdict: 'gear-solver',
    basis: 'code',
    detail:
      'comparaison au niveau max de S2 (1096) : calcul, pas capture. La capture (S2 niv. 1, ATK 1002) confirme seulement que le buff suit le niveau ; elle coïncide avec le wiki, qui ignore S2 à tout niveau',
  },
  '2000065': {
    layers: ['full'],
    why: 'Ame : S2 +25 CHC',
    verdict: 'gear-solver',
    basis: 'capture',
    detail: 'CHC 46 % en jeu avec S2 niv. 5 : la valeur du solver, le wiki affiche 21',
  },
  '2000095': {
    layers: ['full'],
    why: 'Bell Cranel : S2 +30 % ATK',
    verdict: 'gear-solver',
    basis: 'code',
  },
};

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
