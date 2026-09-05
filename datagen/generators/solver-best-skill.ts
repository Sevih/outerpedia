/**
 * « Meilleur hit » d'un perso pour le générateur SOLVER — le facteur total
 * (‰ de la stat d'attaque) du skill LE PLUS PUISSANT parmi S1/S2/S3 au niveau
 * MAX, états burst 1/2/3 compris (ils REMPLACENT le skill burstable quand
 * l'AP est dépensé — rattachés à son slot exactement comme le calculateur,
 * `inputs.ts` : `burstableSlotOf`, jamais un slot supposé).
 *
 * gear-solver multiplie sa base « dégât par hit à facteur 100 % » par ce
 * facteur : le nombre affiché devient le hit attendu du meilleur skill, et la
 * comparaison inter-persos a un sens. Le classement mono-perso ne bouge pas
 * (constante par perso).
 *
 * Sémantique du facteur (spec damage-formula § 8.1/8.2) :
 *   facteur = SkillLevelTemplet.DamageFactor (niveau max)
 *           × facteur total de l'état / 1000
 * où le facteur total de l'état est la règle UNIQUE du moteur
 * (`stateTotalFactor`, report.ts) : Σ des events des clips résolus, sinon
 * Σ tables comblée à 1000 ‰ sous 990. Un skill à plusieurs états (chaîne de
 * base, upgrade…) prend son état le plus fort. Multi-hit = SOMME des hits
 * (c'est le total de la cascade, pas le plus gros hit isolé).
 *
 * Exclusions : passifs (jamais dans les slots S1/S2/S3 ni burst), skills à
 * `DamageFactor` 0 (soins, buffs purs). Un skill offensif SANS chaîne de hits
 * ni clip (`hitsUnresolved`, § 12.4) compte pour son facteur plein (1000 ‰ —
 * le comblement du moteur) et le porte en `unresolvedHits` : signalé, jamais
 * tu. Les DoT ne sont PAS modélisés (un perso dont le vrai « meilleur hit »
 * est un DoT — Gnosis Beth — est sous-estimé, assumé côté gear-solver).
 */
import { burstableSlotOf } from '../../src/lib/damage/gear';
import { attachChainClips, groupHitsByChain, stateTotalFactor } from '../../src/lib/damage/report';
import type { DamageCharacter, DamageSkill } from '../damage/characters';

export type BestSkillSlot = 'S1' | 'S2' | 'S3';

/** Contrat émis dans `solver/characters.json` (`bestSkill`) — consommé tel quel
 *  par gear-solver (`CharacterDef.bestSkill`). */
export interface BestSkill {
  /** Slot du skill gagnant. */
  slot: BestSkillSlot;
  /** État burst gagnant (1..3) — absent = le skill de base. */
  burst?: 1 | 2 | 3;
  /** ‰ de la stat d'attaque, entier (ex. 1670 = ×1,67). */
  factor: number;
  /** Chaîne de hits irrésolue : facteur total supposé 1000 ‰ (approximation). */
  unresolvedHits?: true;
}

const SLOT_TYPES: { slot: BestSkillSlot; type: string }[] = [
  { slot: 'S1', type: 'SKT_FIRST' },
  { slot: 'S2', type: 'SKT_SECOND' },
  { slot: 'S3', type: 'SKT_ULTIMATE' },
];
const BURST_TYPES = ['SKT_BURST_1', 'SKT_BURST_2', 'SKT_BURST_3'];

/** Facteur total (‰) d'UN skill à son niveau max, ou `undefined` s'il ne fait
 *  pas de dégâts. `unresolvedHits` quand aucune chaîne n'est connue. */
export function skillMaxFactor(
  sk: DamageSkill,
): { factor: number; unresolvedHits?: true } | undefined {
  const lv = sk.levels[sk.levels.length - 1];
  if (!lv || lv.damageFactor <= 0) return undefined;
  const states = attachChainClips(groupHitsByChain(sk.hits), sk.clips, sk.clipsUnresolvedChains);
  if (states.length === 0) {
    return { factor: lv.damageFactor, unresolvedHits: true };
  }
  const hitTotal = Math.max(...states.map((s) => stateTotalFactor(s).totalFactor));
  return { factor: Math.round((lv.damageFactor * hitTotal) / 1000) };
}

/**
 * Le meilleur skill d'un perso — max du facteur sur S1/S2/S3 puis bursts
 * 1..3 (ordre de parcours = ordre de préférence à égalité : le skill de base
 * l'emporte sur son burst de même facteur). `undefined` si le perso n'a
 * aucun skill offensif dans ces slots (donnée absente ou kit sans dégâts).
 */
export function bestSkillOf(
  char: Pick<DamageCharacter, 'skills'>,
  skills: Record<string, DamageSkill>,
): BestSkill | undefined {
  const byType = new Map<string, DamageSkill>();
  for (const { id } of char.skills) {
    const sk = skills[id];
    if (sk && !byType.has(sk.type)) byType.set(sk.type, sk);
  }
  const candidates: BestSkill[] = [];
  for (const { slot, type } of SLOT_TYPES) {
    const sk = byType.get(type);
    const f = sk ? skillMaxFactor(sk) : undefined;
    if (f) candidates.push({ slot, ...f });
  }
  const burstSlot = burstableSlotOf(SLOT_TYPES.map(({ type }) => byType.get(type)));
  if (burstSlot !== undefined) {
    BURST_TYPES.forEach((type, i) => {
      const sk = byType.get(type);
      const f = sk ? skillMaxFactor(sk) : undefined;
      if (f) candidates.push({ slot: burstSlot, burst: (i + 1) as 1 | 2 | 3, ...f });
    });
  }
  let best: BestSkill | undefined;
  for (const c of candidates) if (!best || c.factor > best.factor) best = c;
  return best;
}
