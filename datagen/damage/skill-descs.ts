/**
 * Extracteur DAMAGE #1b — PROJECTION DES DESCS DE SKILLS pour le popover du
 * calculateur : desc localisées (dictionnaires COMPLETS — le client localise
 * au rendu) + vars par niveau ÉLAGUÉES aux seuls placeholders que la desc
 * référence (`[Buff_C/V/T_<id>]`).
 *
 * SOURCE : les artefacts wiki committés (`data/generated/skills.json`,
 * `data/generated/characters.json`) — la desc templetée et l'extraction des
 * vars (c/v/t) vivent dans le générateur skills, on ne les réimplémente pas.
 * Dépendance d'ordre assumée : régénérer via `damage:build` APRÈS un
 * `datagen:build` qui a rafraîchi skills.json.
 *
 * POURQUOI une projection : l'UI chargeait le catalogue entier côté client
 * (5,9 Mo — revue 18/08/2026) pour lire desc+vars de ~6 skills ; ici on émet
 * uniquement les skills principaux (S1/S2/S3) et bursts du roster damage,
 * vars élaguées et niveaux à vars identiques consécutifs dédupliqués
 * (`levelAt` sélectionne la plus haute entrée ≤ niveau : garder la première
 * de chaque série donne le même résultat). Garde : damage-data.test.ts
 * vérifie que la projection résout EXACTEMENT comme le catalogue.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { integratedIds } from './roster';

/** Miroir minimal d'un skill du catalogue wiki (les champs consommés). */
interface WikiSkill {
  id: string;
  type: string;
  desc?: Record<string, string>;
  levels: { level: number; vars?: Record<string, { c?: string; v?: string; t?: string }> }[];
}

interface WikiCharacter {
  id: string | number;
  skills: (string | number)[];
}

export interface SkillDescLevel {
  level: number;
  vars: Record<string, { c?: string; v?: string; t?: string }>;
}

export interface SkillDescEntry {
  desc: Record<string, string>;
  /** Absent quand la desc ne référence aucun placeholder. */
  levels?: SkillDescLevel[];
}

export interface SkillDescsData {
  skills: Record<string, SkillDescEntry>;
}

/** Types de skills servis au popover : les 3 principaux + les bursts. */
const POPOVER_TYPES = new Set(['first', 'second', 'ultimate']);

/** Ids des placeholders `[Buff_C/V/T_<id>]` référencés par la desc (toutes
 *  langues confondues — les gabarits partagent leurs placeholders, l'union
 *  est une sécurité, pas un pari). */
function referencedIds(desc: Record<string, string>): Set<string> {
  const out = new Set<string>();
  for (const text of Object.values(desc)) {
    for (const m of text.matchAll(/\[Buff_[CVT]_(.+?)\]/g)) out.add(m[1]);
  }
  return out;
}

export function buildSkillDescs(): SkillDescsData {
  const skills = JSON.parse(readFileSync(resolve('data/generated/skills.json'), 'utf8')) as Record<
    string,
    WikiSkill
  >;
  const charsRaw = JSON.parse(
    readFileSync(resolve('data/generated/characters.json'), 'utf8'),
  ) as unknown;
  const chars: WikiCharacter[] = Array.isArray(charsRaw)
    ? (charsRaw as WikiCharacter[])
    : Object.values(charsRaw as Record<string, WikiCharacter>);

  const roster = integratedIds();
  const out: Record<string, SkillDescEntry> = {};
  for (const c of chars) {
    if (roster && !roster.has(String(c.id))) continue;
    for (const ref of c.skills) {
      const s = skills[String(ref)];
      if (!s || out[s.id]) continue;
      if (!POPOVER_TYPES.has(s.type) && !s.type.startsWith('burst_')) continue;
      if (!s.desc || !Object.values(s.desc).some(Boolean)) continue;
      const wanted = referencedIds(s.desc);
      const levels: SkillDescLevel[] = [];
      for (const lv of s.levels) {
        const vars: SkillDescLevel['vars'] = {};
        for (const id of wanted) {
          const v = lv.vars?.[id];
          if (v !== undefined) vars[id] = v;
        }
        // Dédup des niveaux consécutifs identiques (cf. en-tête : sans effet
        // sur `levelAt`).
        const prev = levels[levels.length - 1];
        if (prev && JSON.stringify(prev.vars) === JSON.stringify(vars)) continue;
        levels.push({ level: lv.level, vars });
      }
      const meaningful = levels.some((l) => Object.keys(l.vars).length > 0);
      out[s.id] = { desc: s.desc, ...(meaningful ? { levels } : {}) };
    }
  }

  // Sortie canonique (tri ordinal des ids) — le diff git est la revue.
  const sorted: Record<string, SkillDescEntry> = {};
  for (const id of Object.keys(out).sort()) sorted[id] = out[id];
  return { skills: sorted };
}
