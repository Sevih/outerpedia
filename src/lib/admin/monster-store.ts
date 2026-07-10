/**
 * Accès app au domaine MONSTRE de l'extracteur (réservé à l'admin local).
 *
 * Mince façade, comme `review-store` : isole l'import datagen côté serveur.
 * `fresh*` = extraction fraîche en mémoire ; `committed*` = data/generated
 * du disque (`{}` si pas encore intégré — le domaine est jeune).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildMonsters, type Monster } from '@datagen/extractor/specs/monster';
import {
  buildEncounters,
  type DungeonRef,
  type EncountersData,
} from '@datagen/generators/encounters';
import type { Skill } from '@datagen/generators/skills';

export type { DungeonRef, EncountersData, Monster, Skill };

export function freshMonsters(): Record<string, Monster> {
  return buildMonsters().monsters;
}

export function freshEncounters(): EncountersData {
  return buildEncounters();
}

function readGenerated<T>(rel: string): T | undefined {
  try {
    return JSON.parse(readFileSync(resolve('data/generated', rel), 'utf8')) as T;
  } catch {
    return undefined;
  }
}

export function committedMonsters(): Record<string, Monster> {
  return readGenerated<Record<string, Monster>>('monsters.json') ?? {};
}

export function committedMonsterSkills(): Record<string, Skill> {
  return readGenerated<Record<string, Skill>>('monster-skills.json') ?? {};
}

/**
 * Donjons VALIDÉS (`encounters.json`) — repli d'affichage pour un monstre
 * retenu dont le donjon a disparu de l'extraction fraîche (rétention promote).
 */
export function committedEncounters(): Record<string, DungeonRef> {
  return readGenerated<Record<string, DungeonRef>>('encounters.json') ?? {};
}
