import type { Accessory } from "@/types/equipment";

export function cleanAccessory(accessory: Accessory): Accessory {
    return {
      ...accessory,
      boss: accessory.boss ?? "",
      mode: accessory.mode ?? undefined,
      class: accessory.class ?? "",
    };
  }
  