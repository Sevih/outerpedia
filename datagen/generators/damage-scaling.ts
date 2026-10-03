/**
 * Générateur — QUELLES STATS PILOTENT LES DÉGÂTS de chaque perso jouable.
 *
 * Le damage calculator ne doit demander à l'utilisateur QUE les stats qui
 * servent au calcul de CE perso (décision Sevih 26/07/2026). Ces faits ne sont
 * pas curés : ils DÉRIVENT des mécaniques extraites du binaire
 * (docs/specs/damage-formula.md) appliquées aux tables :
 *
 *   - `attackStat` : GetAttackStat (§ 10.1) remplace l'ATK par une autre stat
 *     quand un buff `BT_SWAP_STAT_ATTACK` est actif — porté par le kit en
 *     passif (ex. HP ×20 %, DEF ×130 %) ;
 *   - `bonusStats` : `BT_DMG_OWNER_STAT` (§ 9.1, BT 88) ajoute aux dégâts un
 *     taux = stat de l'ATTAQUANT × Value (cap 100 %) — SPD/HP/DEF/CHC/EFF vus
 *     dans les kits ;
 *   - `lostHpDmg` : `BT_DMG_OWNER_LOST_HP_RATE` / `BT_DMG_CASTER_LOST_HP_RATE`
 *     (§ 9.1, BT 86/103) — les dégâts croissent avec les HP MANQUANTS, donc les
 *     HP max comptent ;
 *   - `dot` : le kit pose des DoT (`BT_DOT_*`, `BT_IMMEDIATELY_*`) — le rapport
 *     affichera tick + proba de pose, qui dépend de l'EFF (CheckResist, § 5).
 *
 * Périmètre : les buffs atteignables depuis les NIVEAUX DE SKILL du kit
 * (`CharacterSkillLevelTemplet.BuffID`, groupes `BT_GROUP` expansés). Les buffs
 * d'éveil/EE/artefact viendront avec les extracteurs damage (spec
 * damage-report-inputs.md § 6) — même mécanique, autres portes d'entrée.
 * `attackStat` et `bonusStats` viennent de `lib/kit-scaling.ts`, la règle
 * PARTAGÉE avec le solver (kit principal, buffs posés sur soi) : une stat que
 * seule l'attaque de soutien lit n'est pas demandée. `lostHpDmg` et `dot`
 * parcourent tout le kit (Skill_1..23), sans filtre de cible.
 *
 * Sortie CREUSE : un perso absent du fichier scale sur l'ATK sans mécanique
 * annexe. Seules les lignes CT_PC à identité propre sont émises (les skins
 * partagent les skills de leur base — convention `NameID = <ID>_Name`,
 * cf. generators/skills.ts).
 */
import { loadTable, splitCsv, type Row } from '../lib/tables';
import { expandBuffIds, buffRowAtLevel } from '../lib/buff';
import { slugEnum } from '../lib/enums';
import { kitScaling, loadKitScalingTables } from '../lib/kit-scaling';

/** Faits de scaling d'UN perso — chaque champ absent = « rien à signaler ». */
export interface DamageScaling {
  /** Slug de la stat qui remplace l'ATK dans CalcDamage (`hp`, `def`). */
  attackStat?: string;
  /** Slugs des stats converties en bonus de dégâts (BT 88), triés. */
  bonusStats?: string[];
  /** Dégâts fonction des HP manquants (BT 86/103) → HP max pertinents. */
  lostHpDmg?: boolean;
  /** Le kit pose des DoT → l'EFF pilote la proba de pose. */
  dot?: boolean;
}

/** Id de perso (CharacterTemplet, CT_PC à identité propre) → faits. */
export type DamageScalingFile = Record<string, DamageScaling>;

const LOST_HP_TYPES = new Set(['BT_DMG_OWNER_LOST_HP_RATE', 'BT_DMG_CASTER_LOST_HP_RATE']);
const DOT_RE = /^BT_(DOT|IMMEDIATELY)_/;

export function buildDamageScaling(): DamageScalingFile {
  const kit = loadKitScalingTables();
  const { buffs, groups, levelsBySkill } = kit;

  const out: DamageScalingFile = {};
  const chars = loadTable('CharacterTemplet')
    .filter((c) => c.Type === 'CT_PC' && c.ID && c.NameID === `${c.ID}_Name`)
    .sort((a, b) => a.ID.localeCompare(b.ID));

  for (const c of chars) {
    const scaling = kitScaling(c, kit);
    const attackStat = scaling.attackStat ? slugEnum(scaling.attackStat) : undefined;
    const bonusStats = scaling.bonus.map((b) => slugEnum(b.stat)).sort();
    let lostHpDmg = false;
    let dot = false;

    // Un buff par ID suffit : la CLASSIFICATION (Type/StatType) est invariante
    // entre niveaux — seules les magnitudes changent.
    const seen = new Set<string>();
    const classify = (row: Row | undefined): void => {
      if (!row?.Type) return;
      if (LOST_HP_TYPES.has(row.Type)) lostHpDmg = true;
      else if (DOT_RE.test(row.Type)) dot = true;
    };

    for (let i = 1; i <= 23; i++) {
      const sid = c[`Skill_${i}`];
      if (!sid) continue;
      for (const lvl of levelsBySkill.get(sid) ?? []) {
        for (const { id } of expandBuffIds(splitCsv(lvl.BuffID ?? ''), buffs, groups, 1)) {
          if (seen.has(id)) continue;
          seen.add(id);
          classify(buffRowAtLevel(buffs, id, 1));
        }
      }
    }

    const entry: DamageScaling = {
      ...(attackStat ? { attackStat } : {}),
      ...(bonusStats.length ? { bonusStats } : {}),
      ...(lostHpDmg ? { lostHpDmg } : {}),
      ...(dot ? { dot } : {}),
    };
    if (Object.keys(entry).length) out[c.ID] = entry;
  }
  return out;
}
