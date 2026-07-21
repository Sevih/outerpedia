import { notFound } from 'next/navigation';
import { EntitySwitch } from '@/components/admin/EntitySwitch';
import { EeCuratedEditor } from '@/components/admin/EeCuratedEditor';
import { type EffectOption } from '@/components/admin/CharacterKitEditor';
import { renderGameColors } from '@/components/ui/GameText';
import { getEEViews } from '@/lib/data/equipment';
import { eeEditorChips, eeModelForView } from '@/lib/data/equipment-detail';
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
  // Passifs résolus (déblocage Lv.1 + Lv.10) — référence de curation.
  const passives = eeModelForView(view, 'en').passives;

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

      {/* Passifs extraits (déblocage / +10) — référence, non éditables ici. */}
      {passives.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-content-strong text-xs font-semibold uppercase">
            Passives (reference)
          </h2>
          <div className="space-y-2">
            {passives.map((p, i) => (
              <div
                key={`${p.unlockLevel}-${i}`}
                className="border-line-subtle rounded-lg border p-3"
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="bg-surface-base text-content-subtle rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold">
                    {p.unlockLevel <= 1 ? 'Unlock' : `+${p.unlockLevel}`}
                  </span>
                  <span className="text-content-strong text-sm font-semibold">{p.name}</span>
                </div>
                {p.texts.map((t, j) => (
                  <p key={j} className="text-content-subtle text-xs whitespace-pre-line">
                    {renderGameColors(t.replace(/\\n/g, '\n'))}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}

      <EeCuratedEditor id={id} chips={chips} catalog={catalog} initial={initial} />
    </div>
  );
}
