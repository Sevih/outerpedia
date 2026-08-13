import type { HeroProgress } from './engine';

/**
 * Import d'un roster capturé — le format d'échange du suivi de compte.
 *
 * Personne ne saisit 119 héros à la main : un capteur externe (aujourd'hui celui
 * de gear-solver) lit le compte et produit un fichier ; l'outil le transpose en
 * état de suivi. Ce module est la FRONTIÈRE — il valide, borne et traduit ; il
 * ne connaît ni React ni le stockage.
 *
 * ─── Le format (`version: 1`) ────────────────────────────────────────────────
 *
 *   {
 *     "format": "outerpedia:hero-tracker",
 *     "version": 1,
 *     "heroes": {
 *       "2000043": {                                  // id du jeu, TOUJOURS celui du héros de BASE
 *         "owned": true,                              // absent = possédé ; false = non suivi
 *         "level": 100,                               // 5 (recrutement) → 120
 *         "skills": { "s1": 5, "s2": 5, "s3": 4, "chain_passive": 3 },  // 1 → 5, s3 = l'ultime
 *         "affinity": 10,                             // NIVEAU d'affinité (1 → 100), pas les points
 *         "transcend_star": 6,                        // étoile INTERNE (cf. ci-dessous)
 *         "ee": 10,                                   // enchantement de l'équipement exclusif, 0 → 10
 *         "core_fusion": { "level": 5, "ee": 0 }      // seulement si on possède la Core Fusion
 *       }
 *     }
 *   }
 *
 * `transcend_star` est l'étoile INTERNE du jeu (`CharacterTranscendentTemplet`),
 * pas l'étoile affichée ni le nombre d'étapes franchies :
 *
 *   1..4 → 1★..4★   ·   5 → 4★+1   ·   6 → 5★   ·   7 → 5★+1   ·   8 → 5★+2   ·   9 → 6★
 *
 * Elle DÉMARRE à la rareté de base : un 3★ non transcendé vaut 3, pas 0.
 *
 * `core_fusion` dit qu'on possède le fusionné À LA PLACE de sa base — jamais les
 * deux. Son `ee` est le SECOND équipement exclusif (celui du fusionné) ; le `ee`
 * du dessus reste celui hérité de la base.
 *
 * Tout champ absent prend son plancher. Un champ hors plage est BORNÉ plutôt que
 * rejeté : un fichier presque juste vaut mieux qu'un import refusé en bloc — mais
 * une enveloppe absente ou d'une autre version fait échouer l'import entier,
 * pour qu'un fichier étranger n'écrase jamais un roster.
 */

/** Ce que le stockage garde pour un héros suivi (état saisi, cible visée). */
export interface HeroEntry {
  state: HeroProgress;
  target: HeroProgress;
}

/** Ce que l'import doit savoir d'un héros du wiki pour placer une ligne du fichier. */
export interface ImportHero {
  id: string;
  /** Le fusionné qui remplace ce héros de base, si le jeu en propose un. */
  fusionId?: string;
  /** Nombre de paliers de fusion — renseigné sur le FUSIONNÉ lui-même. */
  fusionSteps?: number;
  /** Étoiles INTERNES de son échelle de transcendance, dans l'ordre. */
  stars: number[];
  /** Plafond de chaque axe : c'est la cible que l'import pose. */
  max: HeroProgress;
}

export interface ImportReport {
  heroes: Record<string, HeroEntry>;
  /** id du héros de BASE → on possède sa Core Fusion. */
  fused: Record<string, boolean>;
  imported: number;
  /** Lignes `owned: false` — le fichier les décrit, on ne les suit pas. */
  ignored: number;
  /** Ce que le wiki ne sait pas placer (id inconnu, fusion inexistante). */
  unknown: string[];
}

const FORMAT = 'outerpedia:hero-tracker';
const VERSION = 1;

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Entier borné, plancher si la valeur est absente ou illisible. */
function num(v: unknown, min: number, max: number, fallback: number): number {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(Math.trunc(n), min), max);
}

/**
 * Index du palier atteint dans l'échelle du héros : le dernier dont l'étoile
 * interne est ATTEINTE. Une étoile en deçà du départ (ou absente) laisse le
 * héros au premier palier — celui de sa rareté de base.
 */
function stepOf(stars: number[], star: unknown): number {
  const n = typeof star === 'number' ? star : Number(star);
  if (!Number.isFinite(n)) return 0;
  let i = 0;
  while (i + 1 < stars.length && stars[i + 1] <= n) i++;
  return stars[0] <= n ? i : 0;
}

/**
 * Transpose un fichier de roster en entrées de suivi. Jette si l'enveloppe n'est
 * pas celle attendue — c'est le seul cas où l'on refuse en bloc.
 */
export function importRoster(raw: unknown, byId: Map<string, ImportHero>): ImportReport {
  if (!isObj(raw) || raw.format !== FORMAT) {
    throw new Error(`format attendu « ${FORMAT} »`);
  }
  if (raw.version !== VERSION) {
    throw new Error(`version ${VERSION} attendue, fichier en version ${String(raw.version)}`);
  }
  if (!isObj(raw.heroes)) throw new Error('« heroes » manquant');

  const report: ImportReport = { heroes: {}, fused: {}, imported: 0, ignored: 0, unknown: [] };

  for (const [baseId, value] of Object.entries(raw.heroes)) {
    const row = isObj(value) ? value : {};
    if (row.owned === false) {
      report.ignored++;
      continue;
    }
    const base = byId.get(baseId);
    if (!base) {
      report.unknown.push(baseId);
      continue;
    }

    // Posséder la Core Fusion, c'est ne PAS posséder sa base : l'entrée vit sous
    // l'id du fusionné, et la base disparaît du roster.
    const cf = isObj(row.core_fusion) ? row.core_fusion : undefined;
    const fusionId = cf && base.fusionId ? base.fusionId : undefined;
    if (cf && !fusionId) report.unknown.push(`${baseId}.core_fusion`);
    const hero = fusionId ? byId.get(fusionId) : base;
    if (!hero) {
      report.unknown.push(fusionId ?? baseId);
      continue;
    }

    const skills = isObj(row.skills) ? row.skills : {};
    const ee = num(row.ee, 0, hero.max.ee[0], 0);
    const state: HeroProgress = {
      level: num(row.level, hero.max.level > 5 ? 5 : 1, hero.max.level, 5),
      skills: [skills.s1, skills.s2, skills.s3, skills.chain_passive].map((v) => num(v, 1, 5, 1)),
      // Un fusionné qu'on possède a forcément franchi le palier 1 (les 300 cores
      // de la fusion) : c'est le prix d'entrée, pas une étape à facturer.
      fusion: hero.fusionSteps ? num(cf?.level, 1, hero.fusionSteps, 1) : 0,
      affinity: num(row.affinity, 1, hero.max.affinity, 1),
      transcend: stepOf(hero.stars, row.transcend_star),
      ee: hero.max.ee.length > 1 ? [ee, num(cf?.ee, 0, hero.max.ee[1], 0)] : [ee],
    };

    report.heroes[hero.id] = { state, target: hero.max };
    if (fusionId) report.fused[baseId] = true;
    report.imported++;
  }

  return report;
}
