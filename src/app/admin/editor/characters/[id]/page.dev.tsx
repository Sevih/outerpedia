import { notFound } from 'next/navigation';
import type { Skill } from '@contracts';
import { CharacterVisual } from '@/components/admin/CharacterVisual';
import { EntitySwitch } from '@/components/admin/EntitySwitch';
import { EditorTabs } from '@/components/admin/EditorTabs';
import { CharacterCuratedEditor } from '@/components/admin/CharacterCuratedEditor';
import {
  CharacterKitEditor,
  type CardChip,
  type EffectOption,
  type KitEditorCard,
} from '@/components/admin/CharacterKitEditor';
import { GearRecoEditor, type GearRecoOptions } from '@/components/admin/GearRecoEditor';
import { isDebuffEffect, type ClientEffect } from '@/components/character/EffectChips';
import { gearSelectOptions } from '@/lib/admin/gear-options';
import { loadGearReco, loadGearPresets } from '@/lib/data/gear-reco';
import { expandBuild } from '@/lib/admin/gear-preset-resolve';
import { characterDisplayName } from '@/lib/data/characters';
import { getCharacterCurated } from '@/lib/data/curated';
import { getMergedEffects } from '@/lib/data/effects';
import {
  DUAL_CARD_SUFFIX,
  buildChainView,
  buildStatusMap,
  cardEffects,
  dedupSkills,
  mainSkills,
} from '@/lib/skill-view';
import { img } from '@/lib/images';
import { lRec } from '@/lib/i18n/localize';
import { resolveSkillText } from '@/lib/skills';
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
  const uniqueSkills = dedupSkills(Object.values(bundle.skills) as Skill[]);
  const statuses = buildStatusMap(uniqueSkills, 'en');
  // Un effet de carte → chip d'éditeur (dédup par ref : une ref = une chip
  // masquable, comme au rendu où les homonymes fusionnent).
  const toChips = (effects: ClientEffect[] | undefined): CardChip[] => {
    const seen = new Set<string>();
    const out: CardChip[] = [];
    for (const e of effects ?? []) {
      const ref = e.tooltip ?? e.label;
      if (!ref || seen.has(ref)) continue;
      seen.add(ref);
      const st = statuses[ref];
      out.push({
        ref,
        name: st?.name ?? ref,
        ...(st?.icon ? { icon: st.icon } : {}),
        isDebuff: isDebuffEffect(e.category, st?.isDebuff),
      });
    }
    return out;
  };

  const cards: KitEditorCard[] = [
    ...mainSkills(uniqueSkills),
    ...uniqueSkills.filter((s) => s.type === 'fusion_passive' || s.type === 'extra'),
  ].map((s) => ({
    id: s.id,
    name: lRec(s.name, 'en'),
    type: s.type,
    // Placeholders [Buff_V/C/T_…] résolus aux vars du dernier niveau (sinon la
    // desc s'affiche brute — comme le rendu public via SkillDescription).
    ...(s.desc
      ? { desc: resolveSkillText(lRec(s.desc, 'en'), s.levels[s.levels.length - 1]?.vars) }
      : {}),
    ...(s.icon ? { iconSrc: `/api/admin/sprite/${encodeURIComponent(s.icon)}` } : {}),
    chips: toChips(cardEffects(uniqueSkills, s, {})),
  }));
  // Chaîne & duo : deux cartes distinctes (id du chain_passive + suffixe duo).
  const cp = uniqueSkills.find((s) => s.type === 'chain_passive');
  const chainView = cp ? buildChainView(uniqueSkills, 'en', {}) : null;
  if (cp && chainView) {
    // Vars du dernier niveau de la chaîne pour résoudre les placeholders.
    const chainVars = chainView.levels[chainView.levels.length - 1]?.vars;
    cards.push({
      id: cp.id,
      name: chainView.name || 'Chain',
      type: 'chain_passive',
      ...(chainView.chainDesc ? { desc: resolveSkillText(chainView.chainDesc, chainVars) } : {}),
      iconSrc: img.chain(char.element, char.chainType ?? 'start'),
      chips: toChips(chainView.chainEffects),
    });
    cards.push({
      id: cp.id + DUAL_CARD_SUFFIX,
      name: 'Dual',
      type: 'dual',
      ...(chainView.dualDesc ? { desc: resolveSkillText(chainView.dualDesc, chainVars) } : {}),
      chips: toChips(chainView.dualEffects),
    });
  }

  // État curé actuel, restreint aux cartes de CE perso (le fichier est global).
  const cardIds = new Set(cards.map((c) => c.id));
  const kit = loadCharacterKitSections();
  const pick = (rec: Record<string, string[]>): Record<string, string[]> =>
    Object.fromEntries(Object.entries(rec).filter(([k]) => cardIds.has(k)));
  const chipHide = pick(kit.chipHide);
  const chipAdd = pick(kit.chipAdd);

  // Catalogue du glossaire pour le bouton + (effets non masqués, nommés).
  const catalog: Record<string, EffectOption> = Object.fromEntries(
    getMergedEffects()
      .filter((e) => !e.hidden && e.name.en)
      .map((e) => [
        e.id,
        {
          id: e.id,
          name: e.name.en,
          ...(e.icon ? { icon: e.icon } : {}),
          isDebuff: e.isDebuff,
          ...(e.irremovable ? { irremovable: true } : {}),
        },
      ]),
  );

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
            label: 'Champs manuels',
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
            label: 'Reco d’équipement',
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
