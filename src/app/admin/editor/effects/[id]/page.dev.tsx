import Link from 'next/link';
import type { Route } from 'next';
import { EffectCuratedEditor } from '@/components/admin/EffectCuratedEditor';
import { getExtractedEffect, loadCuratedEffects } from '@/lib/data/effects';
import { EffectIconTile } from '@/components/character/EffectChips';

export const dynamic = 'force-dynamic';

const strip = (s: string) => s.replace(/<\/?[^>]+>/g, '');

/**
 * Édition d'UN effet : override d'un effet extrait, édition d'une création
 * curée, ou CRÉATION d'un nouvel effet (id inconnu → formulaire vierge).
 */
export default async function EditorEffectEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const eff = getExtractedEffect(id);
  const initial = loadCuratedEffects()[id] ?? {};
  const isCreation = !eff;
  const isNew = isCreation && Object.keys(initial).length === 0;

  return (
    <div className="space-y-5">
      <Link
        href={'/admin/editor/effects' as Route}
        className="text-content-subtle hover:text-content text-sm"
      >
        ← Effects
      </Link>

      {eff ? (
        /* Ce que l'extraction a récupéré */
        <section className="border-line-subtle bg-surface-raised space-y-2 rounded-lg border p-4">
          <div className="flex items-center gap-2">
            {eff.icon && (
              <EffectIconTile icon={eff.icon} isDebuff={eff.isDebuff} className="h-8 w-8" />
            )}
            <h1 className="text-content-strong text-xl font-semibold">{eff.name.en}</h1>
            <span className="text-content-subtle text-xs">
              id {eff.id} · {eff.icon} · {eff.isDebuff ? 'debuff' : 'buff'} ·{' '}
              {eff.icon ? (
                eff.iconEditorial ? (
                  <span className="text-warn">wiki icon</span>
                ) : (
                  <span className="text-success">game icon</span>
                )
              ) : (
                <span className="text-danger">no icon</span>
              )}
            </span>
          </div>
          <dl className="text-content-muted grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
            {(['en', 'jp', 'kr', 'zh'] as const).map((l) => (
              <div key={l}>
                <dt className="text-content-subtle text-xs uppercase">{l}</dt>
                <dd>{eff.name[l] || '—'}</dd>
              </div>
            ))}
          </dl>
          <p className="text-content-subtle text-sm whitespace-pre-line">
            {strip(eff.desc.en ?? '')}
          </p>
          <p className="text-content-subtle text-xs">Merged tooltips: {eff.tooltips.join(', ')}</p>
        </section>
      ) : (
        <section className="border-accent/40 bg-accent/5 space-y-1 rounded-lg border p-4">
          <h1 className="text-content-strong text-xl font-semibold">
            {isNew ? 'New creation' : 'Curated creation'} · <span className="font-mono">{id}</span>
          </h1>
          <p className="text-content-muted text-sm">
            No extracted data for this id: the effect is 100% carried by the curated layer (real
            game mechanic with no text in the tables — Uncounterable, Elemental Advantage…).
            Name/desc/icon/keys define the entire effect.
          </p>
        </section>
      )}

      <EffectCuratedEditor
        id={id}
        extractedName={eff?.name ?? { en: '', jp: '', kr: '', zh: '' }}
        initial={initial}
        creation={isCreation}
      />
    </div>
  );
}
