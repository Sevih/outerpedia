/**
 * Références d'EFFETS résolues pour l'UI du calculateur : nom + icône +
 * description localisés depuis le glossaire des effets, pour
 *  - les buffs référencés par les conditions `*_HAS_[NOT_]BUFF*`
 *    (`conditionValue` = id de tooltip du jeu) — la coche de mécanique rend
 *    « Target has <tag Bleeding> » au lieu d'un nom en texte plat (Sevih
 *    22/08/2026, remplace le « : Burned » du 18/08) ;
 *  - les DoT posés par les skills (`tooltipId` du templet de buff, MÊME
 *    espace d'ids) — la ligne DoT de la table Résultat porte l'icône.
 *
 * Le PRÉDICAT (quelles conditions référencent un buff, sentinelles 9996..9999
 * exclues) vit dans le moteur (`conditionBuffRef`, gear.ts) : même décision
 * ici (collecte) et côté client (rendu). La résolution passe par le glossaire
 * des effets, id direct PUIS pont `effectByTooltip` (« 66 » → Cooldown
 * Increase — revue 18/08/2026). Id sans entrée (marqueur technique au NameID
 * vide, ex. 4089002 des Irréguliers) : absent de la map, le client montre
 * l'id brut — jamais un nom inventé.
 */
import { conditionBuffRef } from '@/lib/damage/gear';
import type { DamageBuffsData } from '@/lib/damage/inputs';
import { lRec } from '@/lib/i18n/localize';
import type { Lang } from '@/lib/i18n/config';
import type { DcEffectRef } from './contracts';

export interface CondNameGlossary {
  effects: Record<
    string,
    {
      name: Partial<Record<string, string>>;
      desc?: Partial<Record<string, string>>;
      icon?: string;
      isDebuff?: boolean;
    }
  >;
  effectByTooltip: Record<string, string>;
}

export function buildEffectRefs(
  buffs: DamageBuffsData,
  gloss: CondNameGlossary,
  lang: Lang,
): Record<string, DcEffectRef> {
  const out: Record<string, DcEffectRef> = {};
  const add = (id: string): void => {
    if (out[id] !== undefined) return;
    const eff = gloss.effects[id] ?? gloss.effects[gloss.effectByTooltip[id]];
    if (!eff) return;
    const name = lRec(eff.name, lang) || eff.name.en;
    if (!name) return;
    out[id] = {
      name,
      icon: eff.icon ?? '',
      desc: (eff.desc ? lRec(eff.desc, lang) || eff.desc.en : '') ?? '',
      debuff: eff.isDebuff === true,
    };
  };
  for (const rows of Object.values(buffs.buffs)) {
    for (const r of rows) {
      const condRef = conditionBuffRef(r.conditionType, r.conditionValue);
      if (condRef !== undefined) add(condRef);
      // Tout `ToolTipID` porté par une ligne : DoT (ligne Résultat) ET procs
      // dynamiques déclarables (steppers de stacks — « Pilgrimage —
      // <tag Penetration Up> +30 % », 23/08/2026). Borné par le glossaire :
      // seuls les ids qui y résolvent entrent dans la map.
      if (r.tooltipId !== undefined) add(String(r.tooltipId));
    }
  }
  return out;
}
