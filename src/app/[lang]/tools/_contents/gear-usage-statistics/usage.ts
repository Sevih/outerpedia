import type { LangDict } from '@contracts';
import { loadGearPresets, loadGearReco } from '@/lib/data/gear-reco';
import {
  getAmuletFamilies,
  getSetViews,
  getTalismanFamilies,
  getWeaponFamilies,
  memberClassVariant,
  resolvePassives,
  withClassSuffix,
  type GearFamily,
} from '@/lib/data/equipment';

export type GearCategory = 'weapon' | 'amulet' | 'set' | 'talisman';

/** Une pièce agrégée : identité visuelle (tuile) + persos qui la jouent. */
export interface RawGearUsageEntry {
  /** Id de FAMILLE (armes/amulettes/talismans) ou de set. */
  key: string;
  name: LangDict;
  /** Slug de la page détail /equipment (absent = pas de fiche). */
  slug?: string;
  icon: string;
  grade: string;
  /** Étoiles du haut de famille (tuile 6★, comme /equipment). */
  star?: number;
  /** Icône d'effet (passif / enchantement de set) posée sur la tuile. */
  overlayIcon?: string;
  /** Classe unique restreinte (icône sur la tuile). */
  classType?: string;
  /** Ids des persos dont AU MOINS un build recommande la pièce. */
  characters: string[];
}

/**
 * Agrège « quelle pièce est recommandée chez qui » depuis la GEAR-RECO CURÉE
 * (source unique des builds de fiche perso), à la lecture — pas d'artefact
 * généré committé comme en V2 (même régime que most-used-units). L'unité de
 * compte est la FAMILLE d'équipement (le perso recommande « Rampaging Caracal »,
 * pas une variante d'étoiles), et le SET pour les armures ; presets `$` résolus.
 * Un id inconnu ou une référence `!name` non arbitrée est SKIPPÉ : c'est le
 * modèle `unresolved` de la fiche perso (l'admin arbitre), pas une erreur de
 * build. Dédup par (perso, pièce) : deux builds du même perso comptent 1.
 */
export function computeGearUsage(): Record<GearCategory, RawGearUsageEntry[]> {
  const presets = loadGearPresets();
  const byMember = (fams: GearFamily[]) => {
    const m = new Map<string, GearFamily>();
    for (const f of fams) for (const id of f.ids) m.set(id, f);
    return m;
  };
  const weaponOf = byMember(getWeaponFamilies());
  const amuletOf = byMember(getAmuletFamilies());
  const talismanOf = byMember(getTalismanFamilies());
  // `getSetViews` localise ses textes de bonus (inutilisés ici) — le reste
  // (nom LangDict, tuiles) est indépendant de la langue.
  const setViews = new Map(getSetViews('en').map((v) => [v.id, v]));

  // Variante de classe (Briareos/Gorgon : 5 objets distincts sous un même nom,
  // cf. `memberClassVariant`) : UNE ligne par variante — sa tuile, son passif,
  // son nom suffixé « [Classe] » — sinon la famille entière.
  const famEntry = (f: GearFamily, memberId: string): Omit<RawGearUsageEntry, 'characters'> => {
    const v = memberClassVariant(f, memberId);
    return {
      key: v ? `${f.id}:${v.classLimit}` : f.id,
      name: v ? withClassSuffix(f.name, v.classLimit) : f.name,
      slug: v ? v.slug : f.slug,
      icon: v ? v.icon : f.icon,
      grade: f.grade,
      star: f.stars.at(-1),
      // Icône du passif (l'`icon` d'un ref est indépendante de la langue).
      overlayIcon: resolvePassives(v ? v.passives : f.passives, 'en')[0]?.icon || undefined,
      classType: v ? v.classLimit : f.classLimits.length === 1 ? f.classLimits[0] : undefined,
    };
  };

  const usage: Record<GearCategory, Map<string, RawGearUsageEntry>> = {
    weapon: new Map(),
    amulet: new Map(),
    set: new Map(),
    talisman: new Map(),
  };
  const add = (
    cat: GearCategory,
    meta: Omit<RawGearUsageEntry, 'characters'>,
    charId: string,
    seen: Set<string>,
  ) => {
    const tag = `${cat}:${meta.key}`;
    if (seen.has(tag)) return;
    seen.add(tag);
    const entry = usage[cat].get(meta.key) ?? { ...meta, characters: [] };
    entry.characters.push(charId);
    usage[cat].set(meta.key, entry);
  };

  for (const [charId, builds] of Object.entries(loadGearReco())) {
    // Dédup par perso, toutes catégories (clé préfixée) : un perso = 1 vote.
    const seen = new Set<string>();
    for (const b of builds) {
      for (const w of b.weapons ?? []) {
        const f = !w.id.startsWith('!') && weaponOf.get(w.id);
        if (f) add('weapon', famEntry(f, w.id), charId, seen);
      }
      for (const a of b.amulets ?? []) {
        const f = !a.id.startsWith('!') && amuletOf.get(a.id);
        if (f) add('amulet', famEntry(f, a.id), charId, seen);
      }
      const taliIds = (b.talismans ?? []).flatMap((tn) =>
        tn.startsWith('$') ? (presets.talismans[tn.slice(1)] ?? []) : [tn],
      );
      for (const id of taliIds) {
        const f = !id.startsWith('!') && talismanOf.get(id);
        if (f) add('talisman', famEntry(f, id), charId, seen);
      }
      const combos = (b.sets ?? []).map(
        (c) => c.pieces ?? (c.preset ? (presets.sets[c.preset] ?? []) : []),
      );
      for (const combo of combos)
        for (const p of combo) {
          const v = setViews.get(p.set);
          if (!v) continue;
          add(
            'set',
            {
              key: v.id,
              name: v.name,
              slug: v.slug,
              // Tuile = la pièce d'armure (comme la V2), enchantement en overlay ;
              // cadre `unique` — le même rendu que les cartes de /equipment.
              icon: v.pieceIcons.armor ?? Object.values(v.pieceIcons).find(Boolean) ?? '',
              grade: 'unique',
              overlayIcon: v.icon,
            },
            charId,
            seen,
          );
        }
    }
  }

  const sorted = (m: Map<string, RawGearUsageEntry>) =>
    [...m.values()].sort(
      (a, b) => b.characters.length - a.characters.length || a.name.en.localeCompare(b.name.en),
    );
  return {
    weapon: sorted(usage.weapon),
    amulet: sorted(usage.amulet),
    set: sorted(usage.set),
    talisman: sorted(usage.talisman),
  };
}
