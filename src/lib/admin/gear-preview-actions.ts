'use server';

/**
 * Server action d'APERÇU des recos d'équipement (admin) : résout les builds EN
 * COURS d'édition avec le VRAI résolveur (`resolveGearBuilds`) + le même mapping
 * que la fiche perso (libellés de source, note), et renvoie des DONNÉES pures que
 * le composant client rend avec le vrai `GearRecoSection`.
 *
 * Comme l'aperçu inline : on ne traverse pas de JSX (la note repart en segments,
 * rendue client par `InlinePreview`). Garde `IS_DEV`.
 */
import type { GearBuild } from '@contracts';
import type { GearBuildView, GearRecoLabels } from '@/components/character/GearRecoSection';
import type { InlineSegment } from '@/lib/parse-text';
import { resolveInlineSegments } from '@/lib/parse-text';
import {
  resolveGearBuilds,
  loadGearReco,
  loadGearPresets,
  type ResolvedItemSource,
} from '@/lib/data/gear-reco';
import { expandBuild } from '@/lib/admin/gear-preset-resolve';
import { shopSourceLabel } from '@/lib/data/equipment';
import { getCharacter, characterDisplayName } from '@/lib/data/characters';
import { getT } from '@/i18n';
import { normalizeLang } from '@/lib/i18n/config';
import { IS_DEV } from '@/lib/admin/guard';

/** Un build d'aperçu : `GearBuildView` sans le nœud note (repart en segments). */
export type PreviewBuild = Omit<GearBuildView, 'noteNode'> & { noteSegments: InlineSegment[] };

export async function previewGearReco(
  builds: GearBuild[],
  lang: string,
): Promise<{ builds: PreviewBuild[]; labels: GearRecoLabels }> {
  const l = normalizeLang(lang);
  const t = await getT(l);
  const labels: GearRecoLabels = {
    weapon: t('page.character.gear.weapon'),
    amulet: t('page.character.gear.amulet'),
    talisman: t('page.character.gear.talisman'),
    set: t('page.character.gear.set'),
    substatPrio: t('page.character.gear.substat_prio'),
    setEffects: t('equip.detail.set_effects'),
    note: t('page.character.gear.note'),
    piece2: t('equip.set.2piece'),
    piece4: t('equip.set.4piece'),
    source: t('equip.detail.source'),
  };
  if (!IS_DEV || !builds.length) return { builds: [], labels };

  const resolved = resolveGearBuilds(builds, loadGearPresets(), l);

  // Boutiques extraites → libellés traduits, fusionnés au libellé curé (miroir
  // exact de la fiche perso).
  const withLabel = <T extends { source?: ResolvedItemSource }>(it: T): T => {
    if (!it.source) return it;
    const parts = [
      ...(it.source.shops ?? []).map((s) => shopSourceLabel(s, t)),
      ...(it.source.label ? [it.source.label] : []),
    ];
    return {
      ...it,
      source: { bosses: it.source.bosses, label: parts.length ? parts.join(' · ') : undefined },
    };
  };

  const previewBuilds: PreviewBuild[] = resolved.map(({ note, ...b }) => ({
    ...b,
    weapons: b.weapons.map(withLabel),
    amulets: b.amulets.map(withLabel),
    talismans: b.talismans.map(withLabel),
    setEffects: b.setEffects.map(withLabel),
    noteSegments: note ? resolveInlineSegments(note, { lang: l, t }) : [],
  }));
  return { builds: previewBuilds, labels };
}

/** Un perso important : ses builds (DÉPLIÉS, prêts à cloner dans l'éditeur). */
export interface ImportableChar {
  id: string;
  name: string;
  builds: GearBuild[];
}

/**
 * Liste des builds réutilisables (tous les persos sauf `excludeId`), presets
 * DÉPLIÉS → prêts à cloner dans l'éditeur qui travaille en pièces.
 */
export async function listImportableBuilds(excludeId: string): Promise<ImportableChar[]> {
  if (!IS_DEV) return [];
  const presets = loadGearPresets();
  const out: ImportableChar[] = [];
  for (const [id, builds] of Object.entries(loadGearReco())) {
    if (id === excludeId || !builds?.length) continue;
    const c = getCharacter(id);
    out.push({
      id,
      name: c ? characterDisplayName(c, 'en') : id,
      builds: builds.map((b) => expandBuild(b, presets)),
    });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}
