import { notFound } from 'next/navigation';
import { CharacterVisual } from '@/components/admin/CharacterVisual';
import { EntitySwitch } from '@/components/admin/EntitySwitch';
import { CharacterCuratedEditor } from '@/components/admin/CharacterCuratedEditor';
import { GearRecoEditor, type GearRecoOptions } from '@/components/admin/GearRecoEditor';
import { gearSelectOptions } from '@/lib/admin/gear-options';
import { loadGearReco, loadGearPresets } from '@/lib/data/gear-reco';
import { characterDisplayName } from '@/lib/data/characters';
import { getCharacterCurated } from '@/lib/data/curated';
import { extractedBundle } from '@/lib/admin/review-store';

/**
 * VUE EDITOR d'un perso : la couche curée (connaissance humaine) — champs
 * manuels + recos d'équipement. Le contrôle de l'extraction vit côté Extractor
 * (bascule en haut).
 */
export default async function EditorCharacterDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const bundle = extractedBundle(id);
  if (!bundle) notFound();
  const { char } = bundle;
  const curated = getCharacterCurated(id);

  // Options des sélecteurs gear reco (helper partagé avec /admin/gear-presets).
  const presets = loadGearPresets();
  const opts = gearSelectOptions();
  // Icônes des sets composant chaque preset (aperçu « à vue » dans l'éditeur).
  const setIconById = new Map(opts.sets.map((o) => [o.id, o.icon]));
  const setPresetIcons: Record<string, string[]> = {};
  for (const [slug, pieces] of Object.entries(presets.sets)) {
    setPresetIcons[slug] = pieces
      .map((p) => setIconById.get(p.set))
      .filter((i): i is string => Boolean(i));
  }
  const gearOptions: GearRecoOptions = {
    ...opts,
    presets: {
      talismans: presets.talismans,
      sets: Object.keys(presets.sets),
      substats: Object.keys(presets.substats),
    },
    setPresetIcons,
  };
  const gearInitial = loadGearReco()[id] ?? [];

  return (
    <div className="space-y-5">
      <EntitySwitch id={id} mode="editor" entity="characters" />

      <CharacterVisual
        char={char}
        tags={[...(curated.tags ?? []), ...(char.originalCharacter ? ['core-fusion'] : [])]}
      />

      {/* Recos d'équipement (format curé, sélecteurs par id) */}
      <GearRecoEditor charId={id} initial={gearInitial} options={gearOptions} />

      {/* Champs manuels (curé) */}
      <section className="border-line-subtle border-t pt-4">
        <h2 className="text-content-strong mb-3 text-xs font-semibold uppercase">
          Champs manuels (curé)
        </h2>
        <CharacterCuratedEditor
          id={id}
          characterName={characterDisplayName(char)}
          initial={curated}
          derivedTags={char.tags ?? []}
        />
      </section>
    </div>
  );
}
