/**
 * Extracteur DAMAGE #5 — CONFIG : le sous-ensemble de `GameConfigTemplet`
 * consommé par les formules (mapping § 7), en GARDE-FOU des constantes figées
 * dans `src/lib/damage/types.ts`.
 *
 * Le moteur fige ces valeurs en constantes (elles viennent du binaire 1.4.9) ;
 * l'extracteur les RELIT à chaque patch — le test d'invariants compare
 * `config.json` aux constantes du moteur : une divergence après un patch
 * signale une constante à mettre à jour, jamais une valeur à deviner.
 */
import { indexBy, loadTable, num } from '../lib/tables';

/** Clés du périmètre damage (spec § 7 du mapping) — brutes, en ‰ ou entiers. */
const DAMAGE_CONFIG_KEYS = [
  'MAX_CHARACTER_LEVEL',
  'MISSED_DAMAGE_RATE',
  'PVP_ATK_PENALTY_START_TURN',
  'PVP_ATK_PENALTY_LOOP_TURN',
  'PVP_ATK_PENALTY_DMG_RATE',
  'PVP_ATK_PENALTY_DMG_ADD_RATE',
  'PVP_HEAL_PENALTY_REDUCE_RATE',
  'PVP_HEAL_PENALTY_REDUCE_ADD_RATE',
  'CHECK_AVOID_VALUE_1',
  'CHECK_AVOID_VALUE_2',
  'CHECK_AVOID_VALUE_3',
  'CHECK_AVOID_VALUE_4',
  'GUILD_RAID_MAIN_BOSS_MAX_GRADE',
  'PUNISH_DMG_REDUCE_VALUE',
] as const;

export type DamageConfigKey = (typeof DAMAGE_CONFIG_KEYS)[number];

export type DamageConfigData = Record<DamageConfigKey, number> & {
  /** Overgrade du main boss de guild raid : « hp,atk,def » en ‰/grade
   *  (spec § 12.13) — la seule clé LISTE du périmètre. */
  GUILD_RAID_AFTER_10_BOSS_STAT: number[];
};

export function buildDamageConfig(): DamageConfigData {
  const byId = indexBy(loadTable('GameConfigTemplet'));
  const out = {} as DamageConfigData;
  for (const key of DAMAGE_CONFIG_KEYS) {
    const row = byId.get(key);
    if (!row) throw new Error(`GameConfigTemplet : clé « ${key} » absente — périmètre à revoir.`);
    out[key] = num(row.ValueString);
  }
  const list = byId.get('GUILD_RAID_AFTER_10_BOSS_STAT');
  if (!list) throw new Error('GameConfigTemplet : clé « GUILD_RAID_AFTER_10_BOSS_STAT » absente.');
  out.GUILD_RAID_AFTER_10_BOSS_STAT = (list.ValueString ?? '')
    .split(',')
    .map((v: string) => num(v));
  return out;
}
