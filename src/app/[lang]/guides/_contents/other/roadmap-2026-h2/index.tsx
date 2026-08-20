/**
 * Guide « 2026 Roadmap — Second Half » — meeting offline du 14 août 2026.
 *
 * Suite de `roadmap-2026`, dont le meeting de janvier ne couvrait que
 * janvier→juillet. Mêmes conventions que lui : Server Component, persos
 * désignés par NOM éditorial et résolus par `resolveGuideCharacter`,
 * élément/classe rendus par parse-text, captures du pool éditorial via
 * `img.guideShot`, et les mêmes cartes (`MonthCard`, `NewCharacterCard`).
 *
 * Trois formes lui sont propres, parce que ce meeting-ci en avait besoin :
 * les tableaux repris tels quels des diapos (`SlideTableView`), le décompte
 * du plan de sortie, et le bloc Pick-up. Les cellules et les puces contiennent
 * des `\n` — `whitespace-pre-line` les restitue sans <br/> à la main.
 */
import type { Lang } from '@/lib/i18n/config';
import { getT } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import { img } from '@/lib/images';
import { parseText, type ParseCtx } from '@/lib/parse-text';
import { resolveGuideCharacter } from '@/lib/data/characters';
import type { GuideContentProps } from '@/lib/data/guides';
import { CharacterPortrait } from '@/components/character/CharacterPortrait';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import {
  AGENDA,
  AGENDA_SHOT,
  CORE_FUSION_CHARS,
  CORE_FUSION_NOTE,
  IMPROVEMENT_BLOCKS,
  IMPROVEMENTS_SHOT,
  LABELS,
  MONTHLY_UPDATES,
  NEW_CHARACTERS,
  OPENING_SHOTS,
  PICKUP_GROUPS,
  PICKUP_INTRO,
  PICKUP_SEE_ALSO,
  PICKUP_SHOT,
  PICKUP_TITLE,
  RELEASE_PLAN_COUNTS,
  RELEASE_PLAN_GOAL,
  RELEASE_PLAN_NOTES,
  RELEASE_PLAN_SHOT,
  RELEASED,
  REWORK_NOTE,
  REWORK_SHOT,
  REWORKS,
  SCHEDULE_SHOT,
  SEE_FIRST_HALF,
  STORY_SHOTS,
  STORY_TABLE,
  type MonthlyUpdate,
  type NewCharacterData,
  type Shot,
  type SlideTable,
} from './data';

const SLUG = 'roadmap-2026-h2';
const shot = (file: string) => img.guideShot(SLUG, file);

function ShotRow({ shots, lang }: { shots: Shot[]; lang: Lang }) {
  return (
    <div className="mb-4 flex flex-wrap justify-center gap-4">
      {shots.map((s) => (
        <ImageLightbox
          key={s.file}
          src={shot(s.file)}
          alt={s.alt}
          caption={s.caption ? lRec(s.caption, lang) : undefined}
          thumbnailClassName="max-h-64 w-auto"
        />
      ))}
    </div>
  );
}

function SlideTableView({ data, lang }: { data: SlideTable; lang: Lang }) {
  return (
    // Un tableau large ne doit JAMAIS pousser la page : il défile dans sa boîte.
    <div className="border-line-subtle overflow-x-auto rounded-lg border">
      <table className="w-full min-w-160 border-collapse text-sm">
        <thead>
          <tr className="bg-surface-raised">
            {data.headers.map((h, i) => (
              <th
                key={i}
                className="border-line-subtle text-content-strong border-b px-3 py-2 text-left font-semibold"
              >
                {lRec(h, lang)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, r) => (
            <tr key={r} className="border-line-subtle border-b last:border-b-0">
              {row.map((cell, c) => (
                <td
                  key={c}
                  className={`px-3 py-2 align-top whitespace-pre-line ${
                    c === 0 ? 'text-content font-semibold' : 'text-content-muted'
                  }`}
                >
                  {lRec(cell, lang)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MonthCard({ data, lang }: { data: MonthlyUpdate; lang: Lang }) {
  return (
    <div className="border-line-subtle bg-surface-raised rounded-lg border p-4">
      <h4 className="border-line-subtle text-content-strong mb-3 border-b pb-2 text-lg font-semibold">
        {lRec(data.month, lang)}
        {data.highlights.length > 0 && (
          <span className="ml-2 text-sm text-yellow-400">
            ({data.highlights.map((h) => lRec(h, lang)).join(', ')})
          </span>
        )}
      </h4>
      <div className="space-y-3 text-sm">
        {data.newCharacters && data.newCharacters.length > 0 && (
          <div>
            <span className="text-content-muted">{lRec(LABELS.labelNewCharacters, lang)} </span>
            <span className="font-semibold text-purple-400">
              {data.newCharacters.map((c) => lRec(c, lang)).join(', ')}
            </span>
          </div>
        )}
        {data.coreFusions && data.coreFusions.length > 0 && (
          <div>
            <span className="text-content-muted">{lRec(LABELS.labelCoreFusion, lang)} </span>
            <span className="font-semibold text-pink-400">{data.coreFusions.join(', ')}</span>
          </div>
        )}
        {data.story && data.story.length > 0 && (
          <div>
            <span className="text-content-muted">{lRec(LABELS.labelStory, lang)} </span>
            <span className="text-sky-400">{data.story.map((s) => lRec(s, lang)).join(' • ')}</span>
          </div>
        )}
        {data.content && data.content.length > 0 && (
          <div>
            <span className="text-content-muted">{lRec(LABELS.labelContent, lang)} </span>
            <span className="text-content">
              {data.content.map((c) => lRec(c, lang)).join(' • ')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function NewCharacterCard({
  data,
  lang,
  ctx,
}: {
  data: NewCharacterData;
  lang: Lang;
  ctx: ParseCtx;
}) {
  return (
    <div className={`rounded-lg border ${data.accent.border} ${data.accent.bg} flex gap-4 p-4`}>
      <div className="flex-1">
        <h4 className={`mb-1 font-semibold ${data.accent.text}`}>{data.name}</h4>
        <p className="text-content-subtle mb-2 text-xs">{lRec(data.date, lang)}</p>
        {data.element && data.classType && (
          <p className="text-content-muted mb-2 text-sm">
            {parseText(`{E/${data.element}} {C/${data.classType}}`, ctx)}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {data.images.map((file) => (
          <ImageLightbox key={file} src={shot(file)} alt={data.name} />
        ))}
      </div>
    </div>
  );
}

/** Portrait + libellé de date, sous la même forme dans Core Fusion et Rework. */
function DatedPortrait({ name, date, lang }: { name: string; date: string; lang: Lang }) {
  const c = resolveGuideCharacter(name, lang, SLUG);
  return (
    <div className="flex flex-col items-center gap-1">
      <CharacterPortrait
        id={c.character.id}
        name={c.name}
        element={c.character.element}
        classType={c.character.class}
        rarity={c.character.rarity}
        href={c.href}
      />
      <span className="text-content-subtle text-xs">({date})</span>
    </div>
  );
}

export default async function Roadmap2026SecondHalfGuide({ lang }: GuideContentProps) {
  const t = await getT(lang);
  // Strict : un slug d'élément/classe faux dans data.ts casse le build.
  const ctx: ParseCtx = { lang, t, strict: true };
  const L = (key: keyof typeof LABELS) => lRec(LABELS[key], lang);

  return (
    <>
      <p className="text-content-muted">{L('intro')}</p>
      <p className="text-content-muted">{parseText(lRec(SEE_FIRST_HALF, lang), ctx)}</p>

      <section>
        <h2 className="mb-3 text-xl font-semibold">{L('agenda')}</h2>
        <ShotRow shots={OPENING_SHOTS} lang={lang} />
        <div className="flex flex-col gap-4 md:flex-row md:items-start">
          <ol className="text-content list-decimal space-y-2 pl-6 md:flex-1">
            {AGENDA.map((item, i) => (
              <li key={i}>{lRec(item, lang)}</li>
            ))}
          </ol>
          <ImageLightbox
            src={shot(AGENDA_SHOT.file)}
            alt={AGENDA_SHOT.alt}
            thumbnailClassName="max-h-48 w-auto"
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">{L('newCharacters')}</h2>
        <h3 className="text-content-strong mb-2 font-semibold">{L('releasePlan')}</h3>
        <ShotRow shots={[RELEASE_PLAN_SHOT]} lang={lang} />
        <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {RELEASE_PLAN_COUNTS.map((c) => (
            <div
              key={c.label.en}
              className="border-line-subtle bg-surface-raised rounded-lg border p-4 text-center"
            >
              <div className="text-3xl font-bold text-sky-400">{c.value}</div>
              <div className="text-content-muted mt-1 text-xs">{lRec(c.label, lang)}</div>
            </div>
          ))}
        </div>
        <p className="text-content mb-2">{lRec(RELEASE_PLAN_GOAL, lang)}</p>
        <ul className="text-content-subtle mb-4 list-disc space-y-1 pl-6 text-sm">
          {RELEASE_PLAN_NOTES.map((n, i) => (
            <li key={i}>{lRec(n, lang)}</li>
          ))}
        </ul>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {NEW_CHARACTERS.map((c) => (
            <NewCharacterCard key={c.name} data={c} lang={lang} ctx={ctx} />
          ))}
        </div>
        <h3 className="text-content-strong mt-6 mb-2 font-semibold">{L('alreadyReleased')}</h3>
        <div className="flex flex-wrap justify-center gap-4">
          {RELEASED.map((r) => (
            <DatedPortrait key={r.name} name={r.name} date={lRec(r.date, lang)} lang={lang} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">{L('coreFusion')}</h2>
        <p className="text-content mb-4">{lRec(CORE_FUSION_NOTE, lang)}</p>
        <div className="flex flex-wrap justify-center gap-4">
          {CORE_FUSION_CHARS.map((cf) => (
            <DatedPortrait key={cf.name} name={cf.name} date={lRec(cf.month, lang)} lang={lang} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">{L('characterRework')}</h2>
        <ShotRow shots={[REWORK_SHOT]} lang={lang} />
        <p className="text-content mb-4">{lRec(REWORK_NOTE, lang)}</p>
        <div className="flex flex-wrap justify-center gap-4">
          {REWORKS.map((r) => (
            <DatedPortrait key={r.name} name={r.name} date={lRec(r.date, lang)} lang={lang} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">{L('storyRegion')}</h2>
        <ShotRow shots={STORY_SHOTS} lang={lang} />
        <SlideTableView data={STORY_TABLE} lang={lang} />
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">{L('gameImprovements')}</h2>
        <ShotRow shots={[IMPROVEMENTS_SHOT]} lang={lang} />
        <div className="space-y-6">
          {IMPROVEMENT_BLOCKS.map((block) => (
            <div key={block.shot.file}>
              <h3 className="text-content-strong mb-2 font-semibold">{lRec(block.title, lang)}</h3>
              <ShotRow shots={[block.shot]} lang={lang} />
              <SlideTableView data={block.table} lang={lang} />
            </div>
          ))}

          <div>
            <h3 className="text-content-strong mb-2 font-semibold">{lRec(PICKUP_TITLE, lang)}</h3>
            <ShotRow shots={[PICKUP_SHOT]} lang={lang} />
            <p className="text-content mb-3">{lRec(PICKUP_INTRO, lang)}</p>
            <p className="text-content-muted mb-3 text-sm">
              {parseText(lRec(PICKUP_SEE_ALSO, lang), ctx)}
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {PICKUP_GROUPS.map((g) => (
                <div
                  key={g.heading.en}
                  className="border-line-subtle bg-surface-raised rounded-lg border p-4"
                >
                  <h4 className="mb-2 font-semibold text-cyan-400">{lRec(g.heading, lang)}</h4>
                  <ul className="text-content-muted space-y-1 text-sm">
                    {g.lines.map((line, i) => (
                      <li key={i}>• {lRec(line, lang)}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">{L('monthlySchedule')}</h2>
        <ShotRow shots={[SCHEDULE_SHOT]} lang={lang} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {MONTHLY_UPDATES.map((m, i) => (
            <MonthCard key={i} data={m} lang={lang} />
          ))}
        </div>
      </section>

      <section className="border-line-subtle text-content-subtle space-y-1 border-t pt-4 text-sm">
        <p>{L('disclaimer')}</p>
        <p>{L('source')}</p>
        <p>{L('titiaNote')}</p>
      </section>
    </>
  );
}
