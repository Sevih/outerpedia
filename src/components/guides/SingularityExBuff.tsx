import { getT, type TFunction, type TranslationKey } from '@/i18n';
import { LANGUAGES, type Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { img } from '@/lib/images';
import { serverNow } from '@/lib/time';
import { formatGuideDate } from '@/lib/data/guides';
import {
  singularityAppearancesAt,
  singularityCycleWeeks,
  singularityExBuffTarget,
  type SingularityAppearance,
  type SingularityExBuff,
} from '@/lib/data/singularity';

/**
 * EX BUFF de Dimensional Singularity (patch du 20/11/2026) : dès le rang EX, le
 * boss donne +200 % de dégâts aux alliés d'un élément ou d'une classe. Le buff
 * dépend du CRÉNEAU (semaine de rotation × jour), pas du boss : il s'affiche
 * donc sur les jours de la rotation et sur les apparitions d'un boss, jamais sur
 * la bibliothèque. Sans buff dans la donnée, rien ne se rend (pas de place vide).
 */

/** Nom court de la cible (élément ou classe), dans la langue — `undefined` si inconnue. */
function targetLabel(buff: SingularityExBuff, t: TFunction): string | undefined {
  const target = singularityExBuffTarget(buff);
  if (!target) return undefined;
  return t(`sys.${target.kind}.${target.id}` as TranslationKey);
}

function TargetIcon({ buff, className }: { buff: SingularityExBuff; className: string }) {
  const target = singularityExBuffTarget(buff);
  if (!target) return null;
  const src = target.kind === 'element' ? img.element(target.id) : img.klass(target.id);
  return <img src={src} alt="" aria-hidden className={`object-contain ${className}`} />;
}

/**
 * Pastille de l'EX Buff. `overlay` : posée SUR une bannière de la rotation, peu
 * de place — « EX » + icône, la `desc` du jeu en infobulle (et lue par les
 * lecteurs d'écran). `inline` : sous une carte ou dans une liste — icône,
 * « EX Buff · <cible> », puis la `desc` en texte.
 */
export function ExBuffBadge({
  buff,
  lang,
  t,
  variant,
}: {
  buff: SingularityExBuff;
  lang: Lang;
  t: TFunction;
  variant: 'overlay' | 'inline';
}) {
  const desc = lRec(buff.desc, lang) || buff.desc.en || '';
  const label = t('guides.singularity.ex_buff.label');
  const target = targetLabel(buff, t);

  if (variant === 'overlay') {
    return (
      <span
        title={desc}
        className="border-accent/50 bg-surface-base/75 inline-flex h-5 shrink-0 items-center gap-1 rounded-md border px-1 backdrop-blur-[2px]"
      >
        <span
          className="text-accent font-mono text-[9.5px] font-bold tracking-[0.14em] uppercase"
          aria-hidden
        >
          EX
        </span>
        <TargetIcon buff={buff} className="h-3.5 w-3.5" />
        <span className="sr-only">{`${label} · ${desc}`}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="border-accent/40 bg-accent/5 inline-flex shrink-0 items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-xs">
        <TargetIcon buff={buff} className="h-4 w-4" />
        <span className="text-accent font-semibold">{label}</span>
        {target && (
          <>
            <span className="text-content-subtle" aria-hidden>
              ·
            </span>
            <span className="text-content-strong font-semibold">{target}</span>
          </>
        )}
      </span>
      <span className="text-content-muted text-xs">{desc}</span>
    </span>
  );
}

/**
 * Guide de boss Singularity : les prochaines apparitions du boss sur un cycle
 * complet de rotation, avec l'EX Buff de chacune. Dépend du JOUR (`serverNow`) —
 * la route des guides est déjà purgée chaque nuit (`/api/revalidate`).
 * Muette si le boss ne tourne dans aucun groupe.
 */
export default async function SingularityAppearances({
  monsterId,
  lang,
}: {
  monsterId: string;
  lang: Lang;
}) {
  const t = await getT(lang);
  const appearances = singularityAppearancesAt(monsterId, serverNow());
  if (!appearances.length) return null;
  return (
    <SingularityAppearancesView
      appearances={appearances}
      weeks={singularityCycleWeeks()}
      lang={lang}
      t={t}
    />
  );
}

/** Le rendu, séparé de l'horloge : testable sur une date figée. */
export function SingularityAppearancesView({
  appearances,
  weeks,
  lang,
  t,
}: {
  appearances: SingularityAppearance[];
  weeks: number;
  lang: Lang;
  t: TFunction;
}) {
  const locale = LANGUAGES[lang].htmlLang;
  const hasExBuff = appearances.some((a) => a.exBuff);
  return (
    <section className="space-y-3" aria-labelledby="singularity-appearances">
      <div className="space-y-1">
        <h2 id="singularity-appearances" className="text-content-strong text-xl font-bold">
          {t('guides.singularity.appearances.title')}
        </h2>
        <p className="text-content-muted text-sm">
          {t('guides.singularity.appearances.tagline', { weeks })}
          {hasExBuff && ` ${t('guides.singularity.appearances.ex_note')}`}
        </p>
      </div>
      <ul className="border-line divide-line-subtle divide-y overflow-hidden rounded-xl border">
        {appearances.map((a) => {
          const isToday = a.state === 'today';
          const dow = new Date(`${a.date}T00:00:00Z`).toLocaleDateString(locale, {
            weekday: 'short',
            timeZone: 'UTC',
          });
          return (
            <li
              key={a.date}
              className={`flex flex-col gap-1.5 px-3 py-2 sm:flex-row sm:items-center sm:gap-4 ${
                isToday ? 'bg-accent/5' : ''
              }`}
            >
              <span className="flex shrink-0 items-center gap-2 sm:w-44">
                <span className="text-content-subtle font-mono text-[10.5px] font-semibold tracking-[0.14em] uppercase">
                  {dow}
                </span>
                <span className="text-content-strong text-sm font-semibold tabular-nums">
                  {formatGuideDate(a.date, lang)}
                </span>
                {isToday && (
                  <span className="text-accent text-2xs inline-flex items-center gap-1 font-mono font-semibold tracking-[0.14em] uppercase">
                    <span className="bg-accent size-1.5 rounded-full" aria-hidden />
                    {t('guides.singularity.week.today')}
                  </span>
                )}
              </span>
              {a.exBuff && <ExBuffBadge buff={a.exBuff} lang={lang} t={t} variant="inline" />}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
