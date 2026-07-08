import type { CostumeItem } from '@contracts';
import costumesData from '@data/generated/costumes.json';

const COSTUMES = costumesData as unknown as Record<string, CostumeItem>;

export function getCostumes(): Record<string, CostumeItem> {
  return COSTUMES;
}

export function getCostume(id: string): CostumeItem | undefined {
  return COSTUMES[id];
}
