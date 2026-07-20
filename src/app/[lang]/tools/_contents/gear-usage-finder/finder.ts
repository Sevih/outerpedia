import type { LangDict } from '@contracts';
import { loadGearPresets, loadGearReco } from '@/lib/data/gear-reco';
import {
  getAmuletFamilies,
  getSetViews,
  getWeaponFamilies,
  resolvePassives,
  type GearFamily,
} from '@/lib/data/equipment';

/** Une pièce sélectionnable : identité visuelle (tuile) + contraintes. */
export interface RawFinderGear {
  /** Id de FAMILLE (armes/amulettes) ou de set. */
  key: string;
  name: LangDict;
  icon: string;
  grade: string;
  /** Étoiles du haut de famille (tuile 6★, comme /equipment). */
  star?: number;
  /** Icône d'effet (passif / enchantement de set) posée sur la tuile. */
  overlayIcon?: string;
  /** Classe unique restreinte (icône sur la tuile). */
  classType?: string;
  /** Restrictions de classe (slugs) — vide = libre (toutes classes). */
  classLimits: string[];
  /** Main stats POSSIBLES de la famille (pools du jeu — mode libre). */
  mains: string[];
}

/** Un build curé mis à plat pour le matching côté client. */
export interface RawFinderBuild {
  charId: string;
  /** Famille d'arme → mains RECOMMANDÉES (« ATK%/HP% » éclaté). */
  weapons: Record<string, string[]>;
  /** Famille d'amulette → mains recommandées. */
  amulets: Record<string, string[]>;
  /** Ids des sets joués (combos aplatis). */
  sets: string[];
  /** Priorité de substats éclatée en clés (« ATK>CHC=CHD » → [ATK, CHC, CHD]). */
  subs: string[];
}

export interface RawFinderData {
  weapons: RawFinderGear[];
  amulets: RawFinderGear[];
  sets: RawFinderGear[];
  builds: RawFinderBuild[];
}

/**
 * Assemble les données du Gear Usage Finder depuis la GEAR-RECO CURÉE et les
 * familles d'équipement, à la lecture — pas d'artefact `gear-finder-index.json`
 * committé comme en V2 (même régime que gear-usage-statistics). L'unité est la
 * FAMILLE (le build recommande « Rampaging Caracal », pas une variante
 * d'étoiles) ; presets `$` résolus (sets ET substats). Une référence `!name`
 * non arbitrée est SKIPPÉE (modèle `unresolved` de la fiche perso). Les mains
 * curées multi (« ATK%/SPD ») sont éclatées : chacune matche.
 */
export function computeFinderData(): RawFinderData {
  const presets = loadGearPresets();
  const byMember = (fams: GearFamily[]) => {
    const m = new Map<string, GearFamily>();
    for (const f of fams) for (const id of f.ids) m.set(id, f);
    return m;
  };
  const weaponOf = byMember(getWeaponFamilies());
  const amuletOf = byMember(getAmuletFamilies());
  // `getSetViews` localise ses textes de bonus (inutilisés ici) — le reste
  // (nom LangDict, tuiles) est indépendant de la langue.
  const setViews = getSetViews('en');

  const famGear = (f: GearFamily): RawFinderGear => ({
    key: f.id,
    name: f.name,
    icon: f.icon,
    grade: f.grade,
    star: f.stars.at(-1),
    // Icône du passif (l'`icon` d'un ref est indépendante de la langue).
    overlayIcon: resolvePassives(f.passives, 'en')[0]?.icon || undefined,
    classType: f.classLimits.length === 1 ? f.classLimits[0] : undefined,
    classLimits: f.classLimits,
    mains: f.mainStats,
  });
  const byName = (a: RawFinderGear, b: RawFinderGear) => a.name.en.localeCompare(b.name.en);

  const builds: RawFinderBuild[] = [];
  for (const [charId, charBuilds] of Object.entries(loadGearReco())) {
    for (const b of charBuilds) {
      const flat: RawFinderBuild = { charId, weapons: {}, amulets: {}, sets: [], subs: [] };
      const addMains = (
        rec: Record<string, string[]>,
        fam: GearFamily | undefined | false,
        mainStat?: string,
      ) => {
        if (!fam) return;
        const mains = (mainStat ?? '')
          .split('/')
          .map((s) => s.trim())
          .filter(Boolean);
        // Même famille citée deux fois dans un build (variantes de main) : fusion.
        rec[fam.id] = [...new Set([...(rec[fam.id] ?? []), ...mains])];
      };
      for (const w of b.weapons ?? [])
        addMains(flat.weapons, !w.id.startsWith('!') && weaponOf.get(w.id), w.mainStat);
      for (const a of b.amulets ?? [])
        addMains(flat.amulets, !a.id.startsWith('!') && amuletOf.get(a.id), a.mainStat);
      const combos = (b.sets ?? []).map(
        (c) => c.pieces ?? (c.preset ? (presets.sets[c.preset] ?? []) : []),
      );
      flat.sets = [...new Set(combos.flat().map((p) => p.set))];
      const subs = b.substats?.startsWith('$') ? presets.substats[b.substats.slice(1)] : b.substats;
      flat.subs = [
        ...new Set(
          (subs ?? '')
            .split(/[>=]/)
            .map((s) => s.trim())
            .filter(Boolean),
        ),
      ];
      builds.push(flat);
    }
  }

  return {
    weapons: getWeaponFamilies().map(famGear).sort(byName),
    amulets: getAmuletFamilies().map(famGear).sort(byName),
    sets: setViews
      .map((v): RawFinderGear => ({
        key: v.id,
        name: v.name,
        // Tuile = la pièce d'armure, enchantement en overlay ; cadre `unique`
        // — le même rendu que les cartes de /equipment.
        icon: v.pieceIcons.armor ?? Object.values(v.pieceIcons).find(Boolean) ?? '',
        grade: 'unique',
        overlayIcon: v.icon,
        classLimits: [],
        mains: [],
      }))
      .sort(byName),
    builds,
  };
}
