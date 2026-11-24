import { getT, type TFunction } from '@/i18n';
import { LANGUAGES, type Lang } from '@/lib/i18n/config';
import { serverNow } from '@/lib/time';
import { formatGuideDate } from '@/lib/data/guides';
import {
  singularityActiveComboAt,
  singularityExCombos,
  type SingularityActiveCombo,
  type SingularityExCombo,
} from '@/lib/data/singularity';
import { ExBuffBadge } from '@/components/guides/SingularityExBuff';
import { SingularityVideoGallery } from '@/components/guides/SingularityVideoGallery';
import { MultiVideoEmbed, type VideoItem } from '@/components/ui/MultiVideoEmbed';

/**
 * VIDÉOS D'UN GUIDE DIMENSIONAL SINGULARITY, rangées par combinaison boss × EX
 * Buff (patch 1.4.22 du 20/11/2026). Une vidéo de DS peut porter `ex: "<cible>"`
 * — la CIBLE du buff (`fire`, `ranger`…, cf. `SINGULARITY_EX_TARGETS`), pas l'id
 * de groupe, qu'un patch renumérote. Plusieurs vidéos par combinaison : une
 * combinaison peut avoir plusieurs stratégies.
 *
 * Les combinaisons du boss se DÉRIVENT de la rotation (`singularityExCombos`) ;
 * la galerie en montre une carte chacune, la combinaison de la semaine affichée
 * en tête (`singularityActiveComboAt`), et une carte vide pour celle qui n'a pas
 * encore de vidéo. Sous la galerie :
 *  - les vidéos SANS `ex` : celles d'avant l'EX Buff, dans leur propre section ;
 *  - les vidéos dont la cible n'est plus une combinaison du boss (un patch a
 *    changé la rotation) : une section « Combat Footage » à part — elles ont été
 *    tournées pour un EX Buff, pas avant lui.
 *
 * Dépend du JOUR (`serverNow`) : la route des guides est purgée chaque nuit par
 * `/api/revalidate`. Le JSON-LD des vidéos reste émis par `BossGuide`, pour
 * toutes les vidéos du guide.
 */

/** Une vidéo de guide DS : le `VideoItem` partagé, plus la cible de son EX Buff. */
export type SingularityVideoItem = VideoItem & { ex?: string };

/** Une carte de la galerie : une combinaison, ses vidéos, et son état actif. */
export interface SingularityVideoCard {
  combo: SingularityExCombo;
  videos: VideoItem[];
  /** Présent sur la seule combinaison active. */
  active?: SingularityActiveCombo;
}

export interface SingularityVideoSplit {
  /** Une par combinaison du boss, l'active en premier, puis l'ordre des cibles. */
  cards: SingularityVideoCard[];
  /** Les vidéos sans `ex` : d'avant l'EX Buff. */
  beforeEx: VideoItem[];
  /** Les vidéos dont la cible n'est pas (ou plus) une combinaison du boss. */
  others: VideoItem[];
}

/** Range les vidéos d'un guide par combinaison. Pure : combinaisons et active en entrée. */
export function splitSingularityVideos(
  combos: SingularityExCombo[],
  active: SingularityActiveCombo | undefined,
  videos: SingularityVideoItem[],
): SingularityVideoSplit {
  const keys = new Set(combos.map((c) => c.target.id));
  const cards = combos.map((combo) => ({
    combo,
    videos: videos.filter((v) => v.ex === combo.target.id),
    ...(active?.target.id === combo.target.id ? { active } : {}),
  }));
  return {
    cards: [...cards.filter((c) => c.active), ...cards.filter((c) => !c.active)],
    beforeEx: videos.filter((v) => v.ex === undefined),
    others: videos.filter((v) => v.ex !== undefined && !keys.has(v.ex)),
  };
}

export default async function SingularityVideos({
  monsterId,
  videos,
  lang,
}: {
  monsterId: string;
  videos: SingularityVideoItem[];
  lang: Lang;
}) {
  const t = await getT(lang);
  const split = splitSingularityVideos(
    singularityExCombos(monsterId),
    singularityActiveComboAt(monsterId, serverNow()),
    videos,
  );
  return <SingularityVideosView split={split} lang={lang} t={t} />;
}

/** L'étiquette de la carte active : la semaine (en cours ou prochaine), puis le jour. */
function ActiveFlag({
  active,
  lang,
  t,
}: {
  active: SingularityActiveCombo;
  lang: Lang;
  t: TFunction;
}) {
  const week = t(
    active.betweenWeeks ? 'guides.singularity.next_week.title' : 'guides.singularity.week.title',
  );
  const day =
    active.state === 'today'
      ? t('guides.singularity.week.today')
      : `${new Date(`${active.date}T00:00:00Z`).toLocaleDateString(LANGUAGES[lang].htmlLang, {
          weekday: 'short',
          timeZone: 'UTC',
        })} ${formatGuideDate(active.date, lang)}`;
  return (
    <span className="text-accent text-2xs flex items-center gap-1.5 font-mono font-semibold tracking-[0.14em] uppercase">
      <span className="bg-accent size-1.5 rounded-full" aria-hidden />
      {week} · {day}
    </span>
  );
}

/** Le rendu, séparé de l'horloge : testable sur une date figée. */
export function SingularityVideosView({
  split,
  lang,
  t,
}: {
  split: SingularityVideoSplit;
  lang: Lang;
  t: TFunction;
}) {
  const by = t('video.by');
  const { cards, beforeEx, others } = split;
  if (!cards.length && !beforeEx.length && !others.length) return null;
  // Le lecteur s'ouvre sur l'active si elle a des vidéos, sinon sur la première qui en a.
  const initial = (
    cards.find((c) => c.active && c.videos.length) ?? cards.find((c) => c.videos.length)
  )?.combo.target.id;
  return (
    <>
      {cards.length > 0 && (
        <section className="space-y-3" aria-labelledby="singularity-videos">
          <div className="space-y-1">
            <h2 id="singularity-videos" className="text-content-strong text-xl font-bold">
              {t('guides.singularity.videos.title')}
            </h2>
            <p className="text-content-muted text-sm">{t('guides.singularity.videos.tagline')}</p>
          </div>
          <SingularityVideoGallery
            initial={initial}
            labels={{
              by,
              none: t('guides.singularity.videos.none'),
              count: t('guides.singularity.videos.count'),
            }}
            cards={cards.map((c) => ({
              key: c.combo.target.id,
              badge: <ExBuffBadge buff={c.combo.buff} lang={lang} t={t} variant="inline" />,
              ...(c.active ? { flag: <ActiveFlag active={c.active} lang={lang} t={t} /> } : {}),
              videos: c.videos,
            }))}
          />
        </section>
      )}
      {beforeEx.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-content-strong text-xl font-bold">
            {t('guides.singularity.videos.before_ex')}
          </h2>
          <MultiVideoEmbed byLabel={by} videos={beforeEx} />
        </section>
      )}
      {others.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-content-strong text-xl font-bold">{t('guides.combat_footage')}</h2>
          <MultiVideoEmbed byLabel={by} videos={others} />
        </section>
      )}
    </>
  );
}
