/**
 * Transcendance (CharacterTranscendentTemplet) — donnée de PROGRESSION partagée.
 *
 * Le barème est commun à TOUS les persos d'une même rareté de base (`BasicStar`),
 * avec quelques overrides par perso. On le stocke donc UNE fois (`byStar`) + les
 * exceptions (`overrides`) — pas un blob dupliqué par personnage (c'était le
 * défaut de la V2, qui sérialisait le barème en chaînes sur chaque fiche).
 *
 * Résolution côté app : `overrides[charId] ?? byStar[character.rarity]`.
 *
 * Rates en per-mille (÷10 pour un %), cohérent avec `statScales` : 50 ⇒ +5%.
 */
import { bool, loadTable, num, type Row } from '../lib/tables';
import { validate, type Schema } from './core/validate';

/** Un palier de transcendance (TransStar). */
export interface TranscendStep {
  /** Palier d'étoile (TransStar). */
  star: number;
  /** Bonus cumulés à ce palier (per-mille ; ÷10 pour un %). */
  hp: number;
  atk: number;
  def: number;
  /** Niveau de skill débloqué. */
  skillLevel: number;
  /** Déblocages de burst / dégâts de garde. */
  burst2: boolean;
  burst3: boolean;
  wgDmg: boolean;
  /** Étoile « plus » (palier visuel sans gain de stat). */
  starPlus: number;
  /** Affichage DÉCLARÉ par le jeu : étoile montrée + couleur de la dernière. */
  showStar: number;
  starColor: string;
  /** Coût du palier. */
  materials: number;
  price: number;
}

export interface TranscendData {
  /** Barème par rareté de base : BasicStar → paliers (ordonnés). */
  byStar: Record<string, TranscendStep[]>;
  /** Exceptions par personnage : id → paliers (ordonnés). */
  overrides: Record<string, TranscendStep[]>;
}

function toStep(r: Row): TranscendStep {
  return {
    star: num(r.TransStar),
    hp: num(r.RewardHPRate),
    atk: num(r.RewardAtkRate),
    def: num(r.RewardDefRate),
    skillLevel: num(r.SkillLevel),
    burst2: bool(r.Burst2),
    burst3: bool(r.Burst3),
    wgDmg: bool(r.WGDMG),
    starPlus: num(r.StarPlus),
    showStar: num(r.ShowUIStar),
    starColor: (r.StarColor || 'YELLOW').toLowerCase(),
    materials: num(r.MaterialCount),
    price: num(r.Price),
  };
}

const stepSchema: Schema = {
  kind: 'object',
  fields: {
    star: { kind: 'number', int: true, min: 1 },
    hp: { kind: 'number' },
    atk: { kind: 'number' },
    def: { kind: 'number' },
    skillLevel: { kind: 'number', int: true, min: 0 },
    burst2: { kind: 'boolean' },
    burst3: { kind: 'boolean' },
    wgDmg: { kind: 'boolean' },
    starPlus: { kind: 'number', int: true, min: 0 },
    showStar: { kind: 'number', int: true, min: 0 },
    starColor: { kind: 'string' },
    materials: { kind: 'number', int: true, min: 0 },
    price: { kind: 'number', int: true, min: 0 },
  },
};

export function buildTranscend(): TranscendData {
  const byStar: Record<string, TranscendStep[]> = {};
  const overrides: Record<string, TranscendStep[]> = {};

  for (const r of loadTable('CharacterTranscendentTemplet')) {
    const step = toStep(r);
    const bucket =
      r.CharacterID === '0' ? (byStar[r.BasicStar] ??= []) : (overrides[r.CharacterID] ??= []);
    bucket.push(step);
  }
  for (const ladder of [...Object.values(byStar), ...Object.values(overrides)]) {
    ladder.sort((a, b) => a.star - b.star);
  }

  // Contrat à dents : chaque palier conforme.
  const issues = [...Object.values(byStar), ...Object.values(overrides)]
    .flat()
    .flatMap((s) => validate(s, stepSchema, `transcend[${s.star}]`));
  if (issues.length) {
    throw new Error(
      `transcend: ${issues.length} écart(s) de schéma, ex: ${issues[0].path} — ${issues[0].message}`,
    );
  }

  return { byStar, overrides };
}
