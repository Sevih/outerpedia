/**
 * « Rotation par tour » d'un perso pour le générateur SOLVER — la moyenne
 * par tour du facteur total (‰ de la stat d'attaque) joué quand le perso
 * lance, à CHACUN de ses tours, le skill PRÊT le plus fort parmi S3, S2, S1
 * (facteur `skillMaxFactor` de l'état de base, niveau max — le même que
 * `bestSkill`, bursts exclus). Un seul hit ne dit pas ce qu'un perso fait par
 * tour : un S3 fort à long cooldown se compare mal à un S2 un peu moins fort
 * deux fois plus fréquent. gear-solver en fait le multiplicateur de ses
 * colonnes PAR TOUR (`dmgs`, `mcds`) ; ses colonnes par hit gardent `bestSkill`.
 *
 * Sémantique des cooldowns, prouvée dans le client décompilé
 * (`.gamedata/apk/dumped/src/`, 22/10/2026) :
 *   - le compteur MONTE : `CSkill.CurrentCool` (CSkill.cs l.158-167), borné à
 *     [0, `Cool`] ; `CSkill.CanUse` (l.246-253) = `CurrentCool >= Cool` ;
 *   - départ : `CSkill.Initialize` / `Reset` posent `CurrentCool = StartCool`
 *     (l.204, l.240) ;
 *   - il monte de 1 au DÉBUT du tour du perso, avant le choix du skill :
 *     `CCharacterBattle.OnTurn` (CCharacterBattle.cs l.1545,
 *     `AddCoolSecond(1)` / `AddCoolUltimate(1)` l.1586-1587, S2 et S3
 *     seulement — `CSkillManager.AddCoolSecond` / `AddCoolUltimate`
 *     l.401-417), appelé en `SUB_STATE.TURN` (`CStateBattle.ChangeSubState`
 *     l.812-813), qui précède `SUB_STATE.COMMAND` ;
 *   - un lancer le remet à 0 : `CCharacterBattle.UseSkill` (l.2645,
 *     `UsingSkill.CurrentCool = 0` l.2857 ; une action additive ne le remet
 *     pas, hors modèle).
 * Conséquences : un skill à `StartCool` ≥ `Cool` − 1 est jouable dès le
 * tour 1 — tous au 22/10/2026 : `startCool` = `cool` partout, sauf le S2 de
 * 2700056 (3 pour 2, borné à `Cool` par le setter) ; lancé au tour t avec
 * `Cool` C, il revient au tour t + C (un S3 à `Cool` 4 joue aux tours 1, 5,
 * 9…) ; `Cool` 0 = toujours prêt.
 *
 * Modèle (déterministe, tours du perso seulement) : ni alliés, ni AP — donc
 * ni burst ni tour supplémentaire : l'économie d'AP n'est PAS modélisée —, ni
 * DoT, ni passifs qui touchent aux cooldowns (`BT_COOL_*`, `AddCoolSecond`
 * des buffs). S1 est toujours prêt ; un S2/S3 sans dégâts n'est jamais
 * choisi (il ne compte pas : le tour passe au suivant prêt) ; à facteur égal,
 * S3 > S2 > S1. L'état d'un tour est le couple des compteurs APRÈS la montée
 * du début de tour (le seul qui décide du choix) : on simule jusqu'à ce qu'il
 * se répète, et la rotation est la PÉRIODE ainsi trouvée — le régime établi
 * d'un long combat, sans le préambule du tour 1 quand il en a un (S2 2 / S3
 * 4 : tour 1 S3, puis S2 S1 S2 S3 en boucle). Le nombre d'états est borné par
 * (`Cool` S2 + 1) × (`Cool` S3 + 1) ≤ 49 aujourd'hui : la garde de 60 tours
 * ne joue pas, et si elle jouait la moyenne porterait sur les 60 tours.
 * Un skill à `unresolvedHits` compte pour 1000 ‰ (comme `bestSkill`) et
 * `approx` le signale dès qu'il est joué dans la période.
 */
import type { DamageCharacter, DamageSkill } from '../damage/characters';
import { type BestSkillSlot, skillMaxFactor } from './solver-best-skill';

/** Contrat émis dans `solver/characters.json` (`rotation`), à côté de
 *  `bestSkill` — champ additif, `schema` inchangé. */
export interface Rotation {
  /** ‰ de la stat d'attaque, moyenne par tour sur la période, entier. */
  factorPerTurn: number;
  /** Tours de la période (la rotation se répète ensuite à l'identique). */
  cycle: number;
  /** Lancers par slot sur la période (Σ = `cycle`). */
  uses: Record<BestSkillSlot, number>;
  /** Un skill joué a une chaîne de hits irrésolue (compté 1000 ‰). */
  approx?: true;
}

const SLOT_TYPES: { slot: BestSkillSlot; type: string }[] = [
  { slot: 'S1', type: 'SKT_FIRST' },
  { slot: 'S2', type: 'SKT_SECOND' },
  { slot: 'S3', type: 'SKT_ULTIMATE' },
];
const MAX_TURNS = 60;

interface SlotKit {
  factor: number;
  unresolvedHits: boolean;
  cool: number;
  startCool: number;
}

/** La rotation d'un perso, ou `undefined` s'il n'a aucun skill offensif en
 *  S1/S2/S3 (comme `bestSkillOf`). `turns`, quand fourni, reçoit la séquence
 *  des slots joués sur `turns.length` tours depuis le tour 1 (lecture humaine
 *  et tests). */
export function rotationOf(
  char: Pick<DamageCharacter, 'skills'>,
  skills: Record<string, DamageSkill>,
  turns?: BestSkillSlot[],
): Rotation | undefined {
  const byType = new Map<string, DamageSkill>();
  for (const { id } of char.skills) {
    const sk = skills[id];
    if (sk && !byType.has(sk.type)) byType.set(sk.type, sk);
  }
  const kit = new Map<BestSkillSlot, SlotKit>();
  for (const { slot, type } of SLOT_TYPES) {
    const sk = byType.get(type);
    const f = sk ? skillMaxFactor(sk) : undefined;
    if (!sk || !f) continue;
    const lv = sk.levels[sk.levels.length - 1];
    kit.set(slot, {
      factor: f.factor,
      unresolvedHits: !!f.unresolvedHits,
      // S1 n'a pas de compteur (le client ne le fait jamais monter) : toujours prêt.
      cool: slot === 'S1' ? 0 : Math.max(0, lv.cool),
      startCool: slot === 'S1' ? 0 : Math.max(0, lv.startCool),
    });
  }
  if (kit.size === 0) return undefined;

  // Compteurs S2/S3 (montent, bornés à `cool`) ; un slot absent reste à 0.
  const counter: Record<'S2' | 'S3', number> = {
    S2: kit.get('S2')?.startCool ?? 0,
    S3: kit.get('S3')?.startCool ?? 0,
  };
  const ready = (slot: BestSkillSlot): boolean => {
    const k = kit.get(slot);
    if (!k) return false;
    return slot === 'S1' || counter[slot] >= k.cool;
  };

  // Simulation sur la garde (ou plus long si `turns` le demande) ; l'état de
  // chaque tour est noté pour trouver la période ensuite.
  const played: BestSkillSlot[] = [];
  const states: string[] = [];
  for (let t = 0; t < Math.max(MAX_TURNS, turns?.length ?? 0); t++) {
    // Début du tour : +1 aux compteurs (`OnTurn`), borné à `Cool`.
    for (const s of ['S2', 'S3'] as const) {
      const k = kit.get(s);
      if (k) counter[s] = Math.min(k.cool, counter[s] + 1);
    }
    states.push(`${counter.S2}/${counter.S3}`);
    // Le plus fort parmi les prêts, parcourus S3 → S1 (l'égalité garde le
    // premier) ; S1 sans dégâts n'est pas dans le kit : joué à 0 ‰ faute d'autre.
    let pick: BestSkillSlot = 'S1';
    let best = -1;
    for (const s of ['S3', 'S2', 'S1'] as const) {
      const k = kit.get(s);
      if (k && ready(s) && k.factor > best) {
        pick = s;
        best = k.factor;
      }
    }
    if (pick !== 'S1') counter[pick] = 0;
    played.push(pick);
  }
  if (turns) for (let i = 0; i < turns.length; i++) turns[i] = played[i];

  // Période : du premier état revu jusqu'à sa réapparition ; à défaut, la garde.
  let start = 0;
  let end = MAX_TURNS;
  const seenAt = new Map<string, number>();
  for (let t = 0; t < MAX_TURNS; t++) {
    const first = seenAt.get(states[t]);
    if (first !== undefined) {
      start = first;
      end = t;
      break;
    }
    seenAt.set(states[t], t);
  }

  const period = played.slice(start, end);
  const uses: Record<BestSkillSlot, number> = { S1: 0, S2: 0, S3: 0 };
  let sum = 0;
  let approx = false;
  for (const s of period) {
    uses[s]++;
    const k = kit.get(s);
    sum += k?.factor ?? 0;
    if (k?.unresolvedHits) approx = true;
  }
  return {
    factorPerTurn: Math.round(sum / period.length),
    cycle: period.length,
    uses,
    ...(approx ? { approx: true as const } : {}),
  };
}
