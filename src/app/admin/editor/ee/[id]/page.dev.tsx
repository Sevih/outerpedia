import { notFound } from 'next/navigation';
import { EntitySwitch } from '@/components/admin/EntitySwitch';
import { EeCuratedEditor } from '@/components/admin/EeCuratedEditor';
import { type EffectOption } from '@/components/admin/CharacterKitEditor';
import { getEEViews } from '@/lib/data/equipment';
import { eeEditorChips } from '@/lib/data/equipment-detail';
import { loadEeCuratedEntry } from '@/lib/admin/equipment-curated-store';
import { getMergedEffects } from '@/lib/data/effects';
import { characterDisplayName, getCharacter } from '@/lib/data/characters';
import { img } from '@/lib/images';
import { lRec } from '@/lib/i18n/localize';

export const dynamic = 'force-dynamic';

/**
 * VUE EDITOR d'un EE : la curation (priorité éditoriale rank/rank10 + câblage
 * d'affichage des chips de passifs). La donnée extraite (passifs, stats) reste
 * côté Extractor (bascule en haut).
 */
export default async function EditorEeDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const view = getEEViews().find((v) => v.characterId === id);
  if (!view) notFound();

  const chips = eeEditorChips(id, 'en');
  const initial = loadEeCuratedEntry(id);
  const owner = getCharacter(id);

  // Catalogue du glossaire pour le bouton + (effets non masqués, nommés) —
  // desc incluse (aide-mémoire quand on ajoute une chip).
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
          ...(e.desc.en ? { desc: e.desc.en } : {}),
        },
      ]),
  );

  return (
    <div className="max-w-3xl space-y-5">
      <EntitySwitch id={id} mode="editor" entity="ee" />

      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- asset R2 */}
        <img src={img.ee(id)} alt="" className="h-14 w-14 shrink-0 rounded object-cover" />
        <div>
          <h1 className="text-content-strong text-xl font-semibold">
            {lRec(view.name, 'en') || view.name.en}
          </h1>
          <p className="text-content-subtle text-sm">
            {owner ? characterDisplayName(owner) : id} · <span className="font-mono">{id}</span>
          </p>
        </div>
      </div>

      <EeCuratedEditor id={id} chips={chips} catalog={catalog} initial={initial} />
    </div>
  );
}
