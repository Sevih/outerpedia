import { notFound } from 'next/navigation';
import { CharacterVisual } from '@/components/admin/CharacterVisual';
import { CharacterSwitch } from '@/components/admin/CharacterSwitch';
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
  const gearOptions: GearRecoOptions = {
    ...gearSelectOptions(),
    presets: {
      talismans: presets.talismans,
      sets: Object.keys(presets.sets),
      substats: Object.keys(presets.substats),
    },
  };
  const gearInitial = loadGearReco()[id] ?? [];

  return (
    <div className="space-y-5">
      <CharacterSwitch id={id} mode="editor" />

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
        />
      </section>
    </div>
  );
}
