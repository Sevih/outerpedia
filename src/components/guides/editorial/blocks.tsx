/**
 * PRIMITIVES ÉDITORIALES des guides — les briques de mise en page que chaque
 * guide V2 réécrivait dans son `helpers.tsx` (cf. redesign FAQ), mutualisées.
 *
 * Composants SERVEUR, purs : ils reçoivent des chaînes/nœuds DÉJÀ localisés
 * (l'appelant fait le `lRec`/`parseText`) et une teinte de `accents.ts`.
 * Tout ce qui est interactif (TOC scroll-spy) vit dans son propre fichier client.
 */
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { EDITORIAL_ACCENT, type EditorialAccent } from './accents';

/** Titre de section : titre fort + double filet à l'accent. */
export function SectionHeading({ accent, title }: { accent: EditorialAccent; title: string }) {
  const a = EDITORIAL_ACCENT[accent];
  return (
    <header className="mb-4">
      <h2 className="text-content-strong text-2xl leading-tight font-semibold tracking-tight">
        {title}
      </h2>
      <div className="mt-2.5 flex items-center gap-3.5">
        <span className={cn('h-0.5 w-8 shrink-0 rounded-full', a.stripe)} aria-hidden />
        <span className={cn('h-px flex-1 opacity-30', a.stripe)} aria-hidden />
      </div>
    </header>
  );
}

/**
 * Carte question → réponse. `featured` la met en avant (liseré gauche,
 * dégradé doux, badge optionnel — « Start here »).
 */
export function QACard({
  accent,
  featured,
  badge,
  question,
  children,
}: {
  accent: EditorialAccent;
  featured?: boolean;
  badge?: string;
  question: ReactNode;
  children: ReactNode;
}) {
  const a = EDITORIAL_ACCENT[accent];
  return (
    <article
      className={cn(
        'bg-surface-raised/60 relative overflow-hidden rounded-xl border px-5 py-4.5',
        featured ? cn(a.chipBorder, 'bg-linear-to-b to-transparent', a.from) : 'border-line-subtle',
      )}
    >
      {featured && (
        <span className={cn('absolute inset-y-0 left-0 w-0.75', a.stripe)} aria-hidden />
      )}
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border font-mono text-xs font-bold',
            a.chipBg,
            a.chipBorder,
            a.text,
          )}
          aria-hidden
        >
          Q
        </span>
        <h3 className="text-content-strong pt-0.5 text-[17px] leading-snug font-semibold tracking-tight">
          {badge && (
            <span
              className={cn(
                'mr-2 inline-block rounded border px-1.5 py-1 align-middle font-mono text-[9.5px] leading-none font-bold tracking-[0.16em] uppercase',
                a.chipBg,
                a.chipBorder,
                a.text,
              )}
            >
              {badge}
            </span>
          )}
          {question}
        </h3>
      </div>
      <div className="mt-3 flex flex-col gap-3.5">{children}</div>
    </article>
  );
}

/** Paragraphe de réponse (corps de texte atténué). */
export function Prose({ children }: { children: ReactNode }) {
  return <p className="text-content-muted m-0 text-sm leading-relaxed text-pretty">{children}</p>;
}

/** Encart accentué : liseré gauche + libellé optionnel en petites capitales. */
export function Callout({
  accent,
  label,
  children,
}: {
  accent: EditorialAccent;
  label?: ReactNode;
  children: ReactNode;
}) {
  const a = EDITORIAL_ACCENT[accent];
  return (
    <div
      className={cn(
        'rounded-lg border border-l-2 px-3.5 py-3',
        a.calloutBorder,
        a.borderL,
        a.calloutBg,
      )}
    >
      {label && (
        <div className={cn('mb-1.5 font-mono text-[11px] font-bold tracking-wide', a.text)}>
          {label}
        </div>
      )}
      <div className="text-content-muted text-sm leading-relaxed">{children}</div>
    </div>
  );
}

/** Mini-panel à liseré haut (colonnes « qui pull », panneaux comparatifs…). */
export function MiniPanel({
  accent,
  title,
  children,
}: {
  accent: EditorialAccent;
  title: ReactNode;
  children?: ReactNode;
}) {
  const a = EDITORIAL_ACCENT[accent];
  return (
    <div
      className={cn(
        'border-line-subtle bg-surface-overlay/50 rounded-lg border border-t-2 px-3.5 py-3',
        a.borderT,
      )}
    >
      <div className={cn('text-content-strong text-sm font-semibold', children ? 'mb-2' : null)}>
        {title}
      </div>
      {children && <div className="text-content-muted text-[13px] leading-relaxed">{children}</div>}
    </div>
  );
}

/** Liste ordonnée à numéros accentués. */
export function NumberedList({ accent, items }: { accent: EditorialAccent; items: ReactNode[] }) {
  const a = EDITORIAL_ACCENT[accent];
  return (
    <ol className="m-0 flex list-none flex-col gap-2.5 p-0">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-3">
          <span
            className={cn(
              'mt-0.5 inline-flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-md border font-mono text-[11px] font-bold',
              a.chipBg,
              a.chipBorder,
              a.text,
            )}
            aria-hidden
          >
            {i + 1}
          </span>
          <span className="text-content pt-0.5 text-sm leading-relaxed">{it}</span>
        </li>
      ))}
    </ol>
  );
}

/** Liste à puces lumineuses. */
export function DotList({ accent, items }: { accent: EditorialAccent; items: ReactNode[] }) {
  const a = EDITORIAL_ACCENT[accent];
  return (
    <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className={cn('mt-2 h-1.5 w-1.5 shrink-0 rounded-full', a.dot)} aria-hidden />
          <span className="text-content text-sm leading-relaxed">{it}</span>
        </li>
      ))}
    </ul>
  );
}

/** Rangées « étape → libellé » (ordre d'upgrade de la base…). */
export function StepRows({ items }: { items: { accent: EditorialAccent; label: ReactNode }[] }) {
  return (
    <div className="border-line-subtle flex flex-col gap-px overflow-hidden rounded-lg border">
      {items.map((it, i) => {
        const a = EDITORIAL_ACCENT[it.accent];
        return (
          <div key={i} className="bg-surface-overlay/50 flex items-center gap-3 px-3.5 py-2.5">
            <span
              className={cn(
                'shrink-0 rounded-md border px-2 py-1 font-mono text-[11px] leading-none font-bold',
                a.chipBg,
                a.chipBorder,
                a.text,
              )}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="text-content text-sm font-semibold">{it.label}</span>
          </div>
        );
      })}
    </div>
  );
}
