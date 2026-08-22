/**
 * Extracteur DAMAGE #1b — CLIPS D'ANIMATION : pour chaque skill, la séquence
 * réelle des clips joués et leurs events de hit.
 *
 * Pourquoi : le § 8.1 de la spec (docs/specs/damage-formula.md) calcule le
 * facteur total d'un skill en scannant les AnimationEvents du CLIP courant —
 * pas les tables. Un `ReceiveMaxDamage` (et son rattrapage § 8.3) existe PAR
 * CLIP : un skill joué en deux clips (S2 de Francesca : 700 ‰ + 300 ‰) fait
 * DEUX cascades, un clip peut rejouer un templet (S1 de Caren : 300 ‰ ×2) ou
 * mêler les chaînes de plusieurs états (S3 de Francesca : 800 ‰ + 200 ‰ dans
 * le même clip).
 *
 * La liaison skill → clips est de la DONNÉE, pas une convention :
 *  - `CharacterSkillTemplet.TriggerName` (et `TriggerNameSkip` pour l'état
 *    SKIP) liste les triggers d'animator du skill DANS L'ORDRE
 *    (« Skill2,Skill2_2 » = deux clips successifs chez Francesca) ;
 *  - `anim-events.json` (extract-anim-events.py) porte, par personnage, le
 *    mapping trigger → clips du controller de combat ET la séquence des
 *    `EventAttackStart` de chaque clip.
 *
 * JAMAIS de devinette — une chaîne est listée `clipsUnresolvedChains` (et le
 * moteur retombe sur l'heuristique § 12.4) quand :
 *  - un trigger du skill mène à PLUSIEURS clips à events (états alternatifs) ;
 *  - un clip retenu contient un templet absent de `CharacterDamageTemplet`
 *    (somme du clip incalculable) ;
 *  - une partie seulement des templets de la chaîne apparaît dans les clips
 *    (un segment a pu échapper à l'extraction — on ne sert pas un facteur
 *    partiel silencieusement).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadTable, num, splitCsv } from '../lib/tables';

/** Un event `EventAttackStart` du clip, facteur résolu GLOBALEMENT (le
 *  templet peut appartenir à un autre skill — le binaire somme tout le clip). */
export interface DamageClipEvent {
  /** ID brut du damage templet (partie avant la virgule du `data`). */
  id: string;
  /** DamageFactor du templet (‰ du facteur total). */
  factor: number;
  /** Occurrences § 8.1 : `MaxHitCount == 0 ? 1 : MaxHitCount`. */
  count: number;
}

/** Un clip joué par le skill : séquence d'events dans l'ordre du temps. */
export interface DamageSkillClip {
  name: string;
  events: DamageClipEvent[];
}

/** Résultat de l'affectation pour UN skill. */
export interface SkillClipsResult {
  /** Clips à events du skill, dans l'ordre des triggers (base puis skip). */
  clips?: DamageSkillClip[];
  /** Chaînes dont l'affectation n'est pas résolue (cf. en-tête) — le moteur
   *  retombe sur l'heuristique § 12.4 pour ces états. */
  clipsUnresolvedChains?: string[];
}

const EVENTS_PATH = resolve('datagen/damage/anim-events.json');

interface CharAnimEntry {
  clips: Record<string, string[]>;
  triggers: Record<string, string[]>;
}

/** Index construit une fois par build. */
export interface ClipIndex {
  chars: Map<string, CharAnimEntry>;
  /** Facteur/occurrences/skills par templet (TOUTE la table, lignes sans SkillID incluses). */
  templet: Map<string, { factor: number; count: number }>;
}

/** Ordre ordinal — la sortie est canonique et committée (cf. characters.ts). */
const ord = (x: string, y: string): number => (x < y ? -1 : x > y ? 1 : 0);

export function buildClipIndex(): ClipIndex {
  const raw = JSON.parse(readFileSync(EVENTS_PATH, 'utf8')) as Record<string, CharAnimEntry>;
  const templet = new Map<string, { factor: number; count: number }>();
  for (const d of loadTable('CharacterDamageTemplet')) {
    const max = num(d.MaxHitCount);
    templet.set(d.ID, { factor: num(d.DamageFactor), count: max > 0 ? max : 1 });
  }
  return { chars: new Map(Object.entries(raw)), templet };
}

/**
 * Résout les clips d'un skill depuis ses triggers d'animator et ses hits.
 * `triggerCsv`/`triggerSkipCsv` = colonnes `TriggerName`/`TriggerNameSkip` du
 * `CharacterSkillTemplet` (CSV ordonné).
 */
export function resolveSkillClips(
  index: ClipIndex,
  triggerCsv: string | undefined,
  triggerSkipCsv: string | undefined,
  hits: { id: string; chain: string }[],
): SkillClipsResult {
  if (!hits.length) return {};
  const charId = hits[0].chain.split('_')[0] ?? '';
  const entry = /^\d+$/.test(charId) ? index.chars.get(charId) : undefined;
  if (!entry) return {};

  const chains = new Map<string, Set<string>>();
  for (const h of hits) {
    const c = chains.get(h.chain);
    if (c) c.add(h.id);
    else chains.set(h.chain, new Set([h.id]));
  }
  const unresolved = new Set<string>();
  const flagChainsOf = (templetIds: string[]): void => {
    for (const [chain, ids] of chains)
      if (templetIds.some((t) => ids.has(t))) unresolved.add(chain);
  };

  // Clips du skill, dans l'ordre des triggers. Seuls les clips à events
  // comptent (les autres n'existent pas dans anim-events.json).
  const clipNames: string[] = [];
  for (const trigger of [...splitCsv(triggerCsv ?? ''), ...splitCsv(triggerSkipCsv ?? '')]) {
    const withEvents = (entry.triggers[trigger] ?? []).filter((n) => entry.clips[n]?.length);
    if (withEvents.length > 1) {
      // États alternatifs sur un même trigger : on ne choisit pas.
      flagChainsOf(withEvents.flatMap((n) => entry.clips[n].map((e) => e.split(',')[0].trim())));
      continue;
    }
    if (withEvents.length === 1 && !clipNames.includes(withEvents[0]))
      clipNames.push(withEvents[0]);
  }
  if (!clipNames.length && !unresolved.size) return {};

  // Events résolus ; un templet hors table rend le clip incalculable.
  const clips: DamageSkillClip[] = [];
  const covered = new Set<string>();
  for (const name of clipNames) {
    const seq = entry.clips[name].map((e) => e.split(',')[0].trim()).filter(Boolean);
    if (seq.some((t) => !index.templet.has(t))) {
      flagChainsOf(seq);
      continue;
    }
    // Un clip sans AUCUN templet du skill (trigger partagé avec un autre état)
    // n'appartient pas à ce skill.
    if (!seq.some((t) => [...chains.values()].some((ids) => ids.has(t)))) continue;
    clips.push({
      name,
      events: seq.map((tid) => {
        const t = index.templet.get(tid)!;
        return { id: tid, factor: t.factor, count: t.count };
      }),
    });
    for (const t of seq) covered.add(t);
  }

  // Couverture par chaîne : tout ou rien. Une chaîne partiellement couverte
  // (un segment a pu échapper à l'extraction) n'est PAS servie en facteur
  // partiel ; une chaîne sans aucun event garde le fallback silencieux.
  for (const [chain, ids] of chains) {
    const seen = [...ids].filter((t) => covered.has(t)).length;
    if (seen > 0 && seen < ids.size) unresolved.add(chain);
  }
  const resolvedClips = clips.filter((c) =>
    c.events.some((e) =>
      [...chains.entries()].some(([ch, ids]) => ids.has(e.id) && !unresolved.has(ch)),
    ),
  );

  return {
    ...(resolvedClips.length ? { clips: resolvedClips } : {}),
    ...(unresolved.size ? { clipsUnresolvedChains: [...unresolved].sort(ord) } : {}),
  };
}
