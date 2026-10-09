import { notFound } from 'next/navigation';
import { CharacterVisual } from '@/components/admin/CharacterVisual';
import { EntitySwitch } from '@/components/admin/EntitySwitch';
import { EditorTabs } from '@/components/admin/EditorTabs';
import { CharacterCuratedEditor } from '@/components/admin/CharacterCuratedEditor';
import { CharacterKitEditor } from '@/components/admin/CharacterKitEditor';
import { GearRecoEditor, type GearRecoOptions } from '@/components/admin/GearRecoEditor';
import { gearSelectOptions } from '@/lib/admin/gear-options';
import { loadGearReco, loadGearPresets } from '@/lib/data/gear-reco';
import { expandBuild } from '@/lib/admin/gear-preset-resolve';
import { characterDisplayName } from '@/lib/data/characters';
import { getCharacterCurated } from '@/lib/data/curated';
import { characterKitCards, kitEffectCatalog, pickKitCards } from '@/lib/admin/character-kit';
import { loadCharacterKitSections } from '@/lib/admin/character-skill-curated-store';
import { buildInlineRefs } from '@/lib/admin/inline-refs';
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
  // Presets DÉPLIÉS → l'éditeur travaille en pièces (recompressé au save).
  const gearInitial = (loadGearReco()[id] ?? []).map((b) => expandBuild(b, presets));

  // --- Câblage des chips (curé) : cartes + chips AUTO (règles pures = curation
  // vide) résolues comme le rendu, curation actuelle filtrée sur ce perso. -----
  const cards = characterKitCards(
    bundle,
    (icon) => `/api/admin/sprite/${encodeURIComponent(icon)}`,
  );

  // État curé actuel, restreint aux cartes de CE perso (le fichier est global).
  const kit = loadCharacterKitSections();
  const chipHide = pickKitCards(kit.chipHide, cards);
  const chipAdd = pickKitCards(kit.chipAdd, cards);

  // Catalogue du glossaire pour le bouton + (effets non masqués, nommés).
  const catalog = kitEffectCatalog();

  return (
    <div className="space-y-5">
      <EntitySwitch id={id} mode="editor" entity="characters" />

      <CharacterVisual
        char={char}
        tags={[...(curated.tags ?? []), ...(char.originalCharacter ? ['core-fusion'] : [])]}
      />

      {/* Édition curée en onglets : champs manuels → skills → reco */}
      <EditorTabs
        tabs={[
          {
            key: 'manual',
            label: 'Manual fields',
            content: (
              <CharacterCuratedEditor
                id={id}
                characterName={characterDisplayName(char)}
                initial={curated}
                derivedTags={char.tags ?? []}
              />
            ),
          },
          {
            key: 'skills',
            label: 'Skills (buff/debuff)',
            content: (
              <CharacterKitEditor
                cards={cards}
                chipHide={chipHide}
                chipAdd={chipAdd}
                catalog={catalog}
              />
            ),
          },
          {
            key: 'reco',
            label: 'Gear reco',
            content: (
              <GearRecoEditor
                charId={id}
                charClass={char.class}
                initial={gearInitial}
                options={gearOptions}
                refs={buildInlineRefs()}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
