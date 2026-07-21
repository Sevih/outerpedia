/**
 * RENDU d'un événement communautaire — le composant unique qui remplace les
 * `events/<slug>.tsx` de la V2. Serveur, pur : il reçoit l'entrée curée et rend
 * ses BLOCS dans l'ordre (cf. `EventBlock` du modèle de données).
 *
 * Toute la prose passe par `parseText` : les tags inline `{I-I/Free Ether}`,
 * `{P/perso}`… y sont résolus et LOCALISÉS côté serveur — la V2 écrivait des
 * `<ItemInline name="…" />` en dur dans chaque fichier d'événement.
 *
 * Une seule extension au-dessus de parseText : le LIEN EXTERNE en syntaxe
 * markdown `[libellé](https://…)`. Un événement renvoie forcément vers
 * l'extérieur (formulaire, Discord, chaîne d'un créateur) et les tags inline ne
 * couvrent que l'interne (`{L/…}`) ; seuls `http(s)` sont acceptés, tout le
 * reste retombe en texte.
 */
import type { ReactNode } from 'react';
import Image from 'next/image';
import type { TFunction } from '@/i18n';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { img } from '@/lib/images';
import { parseText } from '@/lib/parse-text';
import type { EventBlock, EventEntry, EventVideo } from '@/lib/data/events';
import { formatEventDate } from '@/lib/data/events';
import { MultiVideoEmbed } from '@/components/ui/MultiVideoEmbed';
import { videoThumbnail, videoUrl } from './presentation';

interface Ctx {
  lang: Lang;
  t: TFunction;
  /** Instant de référence (passé par la page → liste et détail concordent). */
  now: number;
}

const LINK_RE = /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g;

/** Prose éditoriale : tags inline + liens markdown externes + sauts de ligne. */
function RichText({ text, ctx }: { text: string; ctx: Ctx }): ReactNode {
  if (!text) return null;
  const parts: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of text.matchAll(LINK_RE)) {
    const at = m.index ?? 0;
    if (at > last) parts.push(<span key={`t${key}`}>{parseText(text.slice(last, at), ctx)}</span>);
    parts.push(
      <a
        key={`l${key}`}
        href={m[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent underline-offset-2 hover:underline"
      >
        {m[1]}
      </a>,
    );
    last = at + m[0].length;
    key++;
  }
  if (last < text.length)
    parts.push(<span key={`t${key}`}>{parseText(text.slice(last), ctx)}</span>);
  return parts;
}

/** Titre de bloc — absent quand l'auteur n'en a pas mis (prose d'introduction). */
function BlockTitle({ title }: { title?: string }) {
  if (!title) return null;
  return (
    <h2 className="text-content-strong mb-3 text-2xl font-semibold tracking-tight">{title}</h2>
  );
}

function VideoCard({ video, byLabel }: { video: EventVideo; byLabel: string }) {
  const thumb = videoThumbnail(video);
  return (
    <a
      href={videoUrl(video)}
      target="_blank"
      rel="noopener noreferrer"
      className="border-line-subtle bg-surface-raised/50 hover:border-accent/50 group flex flex-col overflow-hidden rounded-lg border transition"
    >
      <div className="bg-surface-sunken relative aspect-video w-full">
        {thumb ? (
          <Image
            src={thumb}
            alt={video.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <span className="text-content-subtle absolute inset-0 flex items-center justify-center text-xs tracking-wide uppercase">
            {video.platform}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-0.5 p-2.5">
        <span className="text-content-strong group-hover:text-accent line-clamp-2 text-sm font-medium">
          {video.title}
        </span>
        {video.author && (
          <span className="text-content-muted text-xs">
            {byLabel.replace('{author}', video.author)}
          </span>
        )}
      </div>
    </a>
  );
}

/**
 * Bloc vidéos GÉNÉRIQUE : une entrée porteuse d'un libellé `featured` passe en
 * lecteur embarqué badgé (podium d'un concours, coup de cœur d'une galerie) ;
 * les autres forment la grille de vignettes. Un même bloc sert donc au palmarès
 * et à la simple liste — c'est le libellé qui fait la mise en avant, pas un
 * champ de structure.
 */
function VideosBlock({
  entries,
  ctx,
  byLabel,
}: {
  entries: EventVideo[];
  ctx: Ctx;
  byLabel: string;
}) {
  const featured = entries.filter((v) => v.featured);
  const rest = entries.filter((v) => !v.featured);
  return (
    <div className="space-y-4">
      {featured.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {featured.map((v, i) => (
            <div
              key={`${v.platform}-${v.id}`}
              className={`border-line-subtle bg-surface-raised/40 flex flex-col gap-3 rounded-xl border p-4 ${
                i === 0 && featured.length > 1 ? 'lg:col-span-2' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="bg-accent/15 text-accent rounded px-2 py-0.5 text-xs font-bold tracking-wide uppercase">
                  {lRec(v.featured, ctx.lang)}
                </span>
                {v.author && <span className="text-content-muted text-xs">{v.author}</span>}
              </div>
              <MultiVideoEmbed
                videos={[{ platform: v.platform, id: v.id, title: v.title, author: v.author }]}
                byLabel={byLabel}
              />
            </div>
          ))}
        </div>
      )}
      {rest.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((v) => (
            <VideoCard key={`${v.platform}-${v.id}`} video={v} byLabel={byLabel} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Calendrier : les jalons de `meta.phases`, le prochain mis en avant. */
function TimelineBlock({ event, ctx }: { event: EventEntry; ctx: Ctx }) {
  const phases = event.phases ?? [];
  if (phases.length === 0) return null;
  const nextIdx = phases.findIndex((p) => {
    const until = Date.parse(p.until);
    return !Number.isNaN(until) && ctx.now < until;
  });
  return (
    <ol className="space-y-2">
      {phases.map((p, i) => {
        const isNext = i === nextIdx;
        const isPast = nextIdx === -1 || i < nextIdx;
        return (
          <li
            key={`${p.until}-${i}`}
            className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg border px-3 py-2 ${
              isNext ? 'border-accent/40 bg-accent/5' : 'border-line-subtle'
            }`}
          >
            <span
              className={`font-mono text-xs ${isNext ? 'text-accent' : 'text-content-subtle'} ${
                isPast ? 'line-through' : ''
              }`}
            >
              {formatEventDate(p.until, ctx.lang)}
            </span>
            <span className={isPast ? 'text-content-subtle text-sm' : 'text-content text-sm'}>
              {lRec(p.label, ctx.lang)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Block({ block, event, ctx }: { block: EventBlock; event: EventEntry; ctx: Ctx }) {
  const title = 'title' in block ? lRec(block.title, ctx.lang) : '';
  const byLabel = ctx.t('video.by');

  switch (block.kind) {
    case 'prose':
      return (
        <section>
          <BlockTitle title={title} />
          <p className="text-content-muted leading-relaxed text-pretty">
            <RichText text={lRec(block.text, ctx.lang)} ctx={ctx} />
          </p>
        </section>
      );

    case 'list':
      return (
        <section>
          <BlockTitle title={title} />
          <ul className="text-content-muted list-disc space-y-1.5 pl-6 leading-relaxed">
            {block.items.map((item, i) => (
              <li key={i}>
                <RichText text={lRec(item, ctx.lang)} ctx={ctx} />
              </li>
            ))}
          </ul>
        </section>
      );

    case 'sections':
      return (
        <section>
          <BlockTitle title={title} />
          <div className="space-y-4">
            {block.items.map((s, i) => (
              <div key={i}>
                <h3 className="text-content-strong font-semibold">{lRec(s.title, ctx.lang)}</h3>
                <p className="text-content-muted leading-relaxed text-pretty">
                  <RichText text={lRec(s.text, ctx.lang)} ctx={ctx} />
                </p>
              </div>
            ))}
          </div>
        </section>
      );

    case 'timeline':
      return (
        <section>
          <BlockTitle title={title} />
          <TimelineBlock event={event} ctx={ctx} />
        </section>
      );

    case 'callout':
      return (
        <section className="border-line-subtle border-accent/60 bg-surface-raised/50 rounded-lg border border-l-2 px-4 py-3">
          {title && (
            <div className="text-accent mb-1.5 text-xs font-bold tracking-wide">{title}</div>
          )}
          <p className="text-content-muted text-sm leading-relaxed">
            <RichText text={lRec(block.text, ctx.lang)} ctx={ctx} />
          </p>
        </section>
      );

    case 'cta':
      return (
        <section className="space-y-2 text-center">
          <a
            href={block.href}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-accent text-accent-fg inline-block rounded-lg px-6 py-3 font-semibold transition hover:opacity-90"
          >
            {lRec(block.label, ctx.lang)}
          </a>
          {block.note && (
            <p className="text-content-subtle text-sm">
              <RichText text={lRec(block.note, ctx.lang)} ctx={ctx} />
            </p>
          )}
        </section>
      );

    case 'videos':
      return (
        <section>
          <BlockTitle title={title} />
          <VideosBlock entries={block.entries} ctx={ctx} byLabel={byLabel} />
        </section>
      );

    case 'image':
      return (
        <figure className="space-y-2">
          <div className="relative mx-auto aspect-video w-full max-w-2xl">
            <Image
              src={img.asset(block.src)}
              alt={lRec(block.alt, ctx.lang)}
              fill
              sizes="(max-width: 768px) 100vw, 672px"
              className="rounded-lg object-contain"
            />
          </div>
          {block.caption && (
            <figcaption className="text-content-subtle text-center text-xs">
              {lRec(block.caption, ctx.lang)}
            </figcaption>
          )}
        </figure>
      );
  }
}

export function EventBlocks({
  event,
  lang,
  t,
  now,
}: {
  event: EventEntry;
  lang: Lang;
  t: TFunction;
  now: number;
}) {
  const ctx: Ctx = { lang, t, now };
  return (
    <div className="space-y-8">
      {event.blocks.map((block, i) => (
        <Block key={i} block={block} event={event} ctx={ctx} />
      ))}
    </div>
  );
}
