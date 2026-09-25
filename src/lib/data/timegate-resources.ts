/** Accès aux RESSOURCES À TEMPS (`data/generated/timegate-resources.json`, guide dédié). */
import type { TimegateResourcesData } from '@contracts';
import timegateData from '@data/generated/timegate-resources.json';

const TIMEGATE = timegateData as unknown as TimegateResourcesData;

export function getTimegateResources(): TimegateResourcesData {
  return TIMEGATE;
}
