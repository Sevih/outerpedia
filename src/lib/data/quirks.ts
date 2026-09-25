/** Accès aux arbres de QUIRKS du compte (`data/generated/quirks.json`) — guide et calculateur. */
import type { QuirksData } from '@contracts';
import quirksData from '@data/generated/quirks.json';

const QUIRKS = quirksData as unknown as QuirksData;

export function getQuirks(): QuirksData {
  return QUIRKS;
}
