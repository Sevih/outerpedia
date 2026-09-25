/** Accès aux CONTRIBUTEURS du wiki (`data/curated/contributors.json`, page /contributors). */
import contributorsData from '@data/curated/contributors.json';

/** Un contributeur (curé) — `favoriteCharacter` porte des tags inline `{P/…}`. */
export interface Contributor {
  id: string;
  name: string;
  role: string;
  avatar: string;
  favoriteCharacter?: string;
  quote?: string;
}

const CONTRIBUTORS = contributorsData as Contributor[];

export function getContributors(): Contributor[] {
  return CONTRIBUTORS;
}
