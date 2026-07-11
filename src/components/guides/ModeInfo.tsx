import { lRec } from '@/lib/i18n/localize';
import type { Lang } from '@/lib/i18n/config';
import type { GuideCategoryInfo } from '@/lib/data/guide-categories';

/**
 * Bloc « comment marche ce mode », rendu à partir de la DONNÉE de la catégorie
 * (`GUIDE_CATEGORIES[…].info`). Un mode qui veut le sien remplit un champ ; il
 * n'y a pas de composant à écrire par mode — c'est précisément ce que faisait la
 * V2, dont le seul bloc existant était une fonction non exportée enterrée dans
 * le fichier de liste de Singularity.
 */
export function ModeInfo({ info, lang }: { info: GuideCategoryInfo; lang: Lang }) {
  return (
    <section className="border-line-subtle bg-surface-raised text-content rounded-xl border p-4 text-sm sm:p-5">
      <p className="leading-relaxed">{lRec(info.intro, lang)}</p>
      {info.unlock && <p className="text-content-muted mt-2">{lRec(info.unlock, lang)}</p>}
      {info.schedule && <p className="text-content-muted mt-1">{lRec(info.schedule, lang)}</p>}
      {info.features && info.features.length > 0 && (
        <ul className="mt-3 list-disc space-y-1 pl-5">
          {info.features.map((f) => (
            <li key={f.en}>{lRec(f, lang)}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
