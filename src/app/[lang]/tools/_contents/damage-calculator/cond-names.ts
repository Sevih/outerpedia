/**
 * Noms LOCALISÉS des buffs référencés par les conditions `*_HAS_[NOT_]BUFF*`
 * (`conditionValue` = id de tooltip du jeu) — le panneau contexte affiche
 * « Owner has a buff : Burned » au lieu du seul gabarit générique (Sevih
 * 18/08/2026).
 *
 * Le PRÉDICAT (quelles conditions référencent un buff, sentinelles 9996..9999
 * exclues) vit dans le moteur (`conditionBuffRef`, gear.ts) : même décision
 * ici (collecte des noms) et côté client (suffixe du libellé). La résolution
 * passe par le glossaire des effets, id direct PUIS pont `effectByTooltip`
 * (« 66 » → Cooldown Increase — revue 18/08/2026). Id sans entrée (marqueur
 * technique au NameID vide, ex. 4089002 des Irréguliers) : absent de la map,
 * le client montre l'id brut — jamais un nom inventé.
 */
import { conditionBuffRef } from '@/lib/damage/gear';
import type { DamageBuffsData } from '@/lib/damage/inputs';
import { lRec } from '@/lib/i18n/localize';
import type { Lang } from '@/lib/i18n/config';

export interface CondNameGlossary {
  effects: Record<string, { name: Partial<Record<string, string>> }>;
  effectByTooltip: Record<string, string>;
}

export function buildCondBuffNames(
  buffs: DamageBuffsData,
  gloss: CondNameGlossary,
  lang: Lang,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const rows of Object.values(buffs.buffs)) {
    for (const r of rows) {
      const id = conditionBuffRef(r.conditionType, r.conditionValue);
      if (id === undefined || out[id] !== undefined) continue;
      const eff = gloss.effects[id] ?? gloss.effects[gloss.effectByTooltip[id]];
      if (!eff) continue;
      const name = lRec(eff.name, lang) || eff.name.en;
      if (name) out[id] = name;
    }
  }
  return out;
}
