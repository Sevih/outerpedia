/**
 * Accès au PLANNING des buffs quotidiens (`data/patch-notes/buff-events.json`,
 * dérivé des posts par `get-news`).
 */
import buffData from '@data/patch-notes/buff-events.json';

export interface BuffScheduleEntry {
  date: string;
  type: string;
  raw: string;
}

const SCHEDULE = (buffData as { schedule?: BuffScheduleEntry[] }).schedule ?? [];

/** Copie du planning (l'appelant peut la trier sans toucher la donnée). */
export function getBuffSchedule(): BuffScheduleEntry[] {
  return SCHEDULE.slice();
}
