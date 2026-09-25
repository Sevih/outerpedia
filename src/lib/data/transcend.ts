/**
 * Accès au barème de TRANSCENDANCE (`data/generated/transcend.json` : paliers
 * par étoile de base + surcharges par perso). Module léger, sans autre
 * dépendance : la tier list le tire côté client via `@/lib/transcendence`.
 */
import type { TranscendData } from '@contracts';
import transcendData from '@data/generated/transcend.json';

const TRANSCEND = transcendData as unknown as TranscendData;

export function getTranscend(): TranscendData {
  return TRANSCEND;
}
