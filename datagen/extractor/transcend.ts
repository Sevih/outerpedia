/**
 * Transcendance (CharacterTranscendentTemplet) — donnée de PROGRESSION partagée.
 *
 * Le barème est commun à TOUS les persos d'une même rareté de base (`BasicStar`),
 * avec quelques overrides par perso. On le stocke donc UNE fois (`byStar`) + les
 * exceptions (`overrides`) — pas un blob dupliqué par personnage (c'était le
 * défaut d'avant, où le barème était sérialisé en chaînes sur chaque fiche).
 *
 * Seuls les paliers que le jeu PARCOURT sont gardés : le client
 * (`CTempletManager.GetCharacterTranscendentTempletList`) écarte les lignes à
 * `UseTransStar` faux et suit `NextStar`. En 1★ et 2★, les paliers 5, 7 et 8 en
 * sont (coût et bonus nuls) : la chaîne réelle est 1→2→3→4→6→9.
 *
 * Un Core Fusion suit l'échelle de son ORIGINE : le client la lit sur le templet
 * d'origine, étoile de base et ID compris (`GetCharacterTranscendent(Templet.
 * BasicStar, Star, ID)`). `overrides[fusionné]` porte donc l'échelle de l'origine,
 * réduite aux paliers à partir de l'étoile de base du fusionné (3) : Snow et Lisha,
 * 2★ à l'origine, y gardent 3, 4, 6, 9 au barème 2★.
 *
 * Résolution côté app : `overrides[charId] ?? byStar[character.rarity]`
 * (`transcendLadder`, `src/lib/transcendence.ts`), juste aussi pour un fusionné.
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
  /** `NextStar` de chaque palier gardé, par échelle — pour le contrôle de chaîne. */
  const next = new Map<TranscendStep[], Map<number, number>>();

  for (const r of loadTable('CharacterTranscendentTemplet')) {
    // Palier que le jeu ne parcourt pas (cf. en-tête).
    if (!bool(r.UseTransStar)) continue;
    const step = toStep(r);
    const bucket =
      r.CharacterID === '0' ? (byStar[r.BasicStar] ??= []) : (overrides[r.CharacterID] ??= []);
    bucket.push(step);
    if (!next.has(bucket)) next.set(bucket, new Map());
    next.get(bucket)?.set(step.star, num(r.NextStar));
  }
  for (const ladder of [...Object.values(byStar), ...Object.values(overrides)]) {
    ladder.sort((a, b) => a.star - b.star);
  }

  // Contrat à dents : chaque `NextStar` non nul pointe un palier GARDÉ de la même
  // échelle — une chaîne qui mènerait à un palier écarté serait un cran perdu.
  const broken: string[] = [];
  for (const [ladder, links] of next) {
    const kept = new Set(ladder.map((s) => s.star));
    for (const [star, to] of links) if (to !== 0 && !kept.has(to)) broken.push(`${star}→${to}`);
  }
  if (broken.length) {
    throw new Error(`transcend: NextStar vers un palier écarté (${broken.join(', ')})`);
  }

  // Core Fusion : l'échelle de l'origine, à partir de l'étoile de base du fusionné.
  const templet = new Map(loadTable('CharacterTemplet').map((r) => [r.ID, r]));
  for (const f of loadTable('CharacterFusionTemplet')) {
    const origin = templet.get(f.CharacterID);
    const fused = templet.get(f.ChangeCharID);
    if (!origin || !fused) {
      throw new Error(`transcend: fusion ${f.CharacterID} → ${f.ChangeCharID} sans templet`);
    }
    const from = num(fused.BasicStar);
    const ladder = (overrides[f.CharacterID] ?? byStar[origin.BasicStar] ?? []).filter(
      (s) => s.star >= from,
    );
    if (!ladder.length) {
      throw new Error(`transcend: fusion ${f.ChangeCharID} sans palier à partir de ${from}`);
    }
    overrides[f.ChangeCharID] = ladder;
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
