/**
 * Guide « 2026 Roadmap » — compte-rendu du meeting offline de janvier 2026
 * (portage V2, traduction @NewWorld). Contenu DATÉ conservé tel quel : c'est
 * une archive de ce qui a été annoncé, pas un suivi de ce qui a été livré.
 *
 * Server Component : les persos Core Fusion sont résolus par NOM
 * (`resolveGuideCharacter` — la V2 portait leurs ids en dur), élément/classe
 * des nouveaux persos passent par parse-text, les captures viennent du pool
 * éditorial (`img.guideShot`).
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
  COUPON_DATA,
  CORE_FUSION_CHARS,
  DEMIURGE_LIMITED_PLANS,
  DEVELOPMENT_DIRECTIONS,
  DIMENSION_SINGULARITY_FEATURES,
  LABELS,
  MASTERS_LEAGUE_RULES,
  MONTHLY_UPDATES,
  NEW_CHARACTERS,
  ROADMAP_QUARTERS,
  RTA_GENERAL_RULES,
  TACTICS_LEAGUE_RULES,
  type MonthlyUpdate,
  type NewCharacterData,
  type RoadmapQuarter,
} from './data';

const SLUG = 'roadmap-2026';
const shot = (file: string) => img.guideShot(SLUG, file);

function QuarterCard({ data, lang }: { data: RoadmapQuarter; lang: Lang }) {
  return (
    <div className="border-line-subtle bg-surface-raised rounded-lg border p-4">
      <div className="mb-2 text-2xl font-bold text-sky-400">{data.quarter}</div>
      <div className="text-content-muted mb-3 text-sm">{lRec(data.title, lang)}</div>
      <ul className="text-content-subtle space-y-1 text-xs">
        {data.items.map((item, i) => (
          <li key={i}>• {lRec(item, lang)}</li>
        ))}
      </ul>
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
        {data.balance && data.balance.length > 0 && (
          <div>
            <span className="text-content-muted">{lRec(LABELS.labelBalance, lang)} </span>
            <span className="text-orange-400">
              {data.balance.map((b) => lRec(b, lang)).join(', ')}
            </span>
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
  const pveText = data.pve ? lRec(data.pve, lang) : '';
  const pvpText = data.pvp ? lRec(data.pvp, lang) : '';
  const noteText = data.note ? lRec(data.note, lang) : '';

  return (
    <div className={`rounded-lg border ${data.accent.border} ${data.accent.bg} flex gap-4 p-4`}>
      <div className="flex-1">
        <h4 className={`mb-2 font-semibold ${data.accent.text}`}>{data.name}</h4>
        <p className="text-content-muted mb-2 text-sm">
          {parseText(`{E/${data.element}} {C/${data.classType}}`, ctx)}
        </p>
        {pveText || pvpText ? (
          <ul className="text-content-subtle space-y-1 text-xs">
            {pveText && (
              <li>
                <span className="text-green-400">PVE:</span> {pveText}
              </li>
            )}
            {pvpText && (
              <li>
                <span className="text-red-400">PVP:</span> {pvpText}
              </li>
            )}
          </ul>
        ) : noteText ? (
          <p className="text-content-subtle text-xs">{noteText}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        {data.images.map((file) => (
          <ImageLightbox key={file} src={shot(file)} alt={data.name} />
        ))}
      </div>
    </div>
  );
}

export default async function Roadmap2026Guide({ lang }: GuideContentProps) {
  const t = await getT(lang);
  // Strict : un slug d'élément/classe faux dans data.ts casse le build.
  const ctx: ParseCtx = { lang, t, strict: true };
  const L = (key: keyof typeof LABELS) => lRec(LABELS[key], lang);

  return (
    <>
      <p className="text-content-muted">{L('intro')}</p>

      <section>
        <h2 className="mb-3 text-xl font-semibold">{L('developmentDirection')}</h2>
        <ul className="text-content list-disc space-y-2 pl-6">
          {DEVELOPMENT_DIRECTIONS.map((d, i) => (
            <li key={i}>{lRec(d, lang)}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">{L('roadmapOverview')}</h2>
        <div className="mb-4 flex justify-center">
          <ImageLightbox
            src={shot('road-quarter.webp')}
            alt="2026 Quarterly Roadmap"
            caption={L('quarterlyOverview')}
            thumbnailClassName="max-h-64 w-auto"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {ROADMAP_QUARTERS.map((q) => (
            <QuarterCard key={q.quarter} data={q} lang={lang} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">{L('monthlyUpdates')}</h2>
        <div className="mb-4 flex flex-wrap justify-center gap-4">
          <ImageLightbox
            src={shot('road-j-m.webp')}
            alt="January to March 2026 Updates"
            caption={L('janMar')}
            thumbnailClassName="max-h-64 w-auto"
          />
          <ImageLightbox
            src={shot('road-a-j.webp')}
            alt="April to July 2026 Updates"
            caption={L('aprJul')}
            thumbnailClassName="max-h-64 w-auto"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {MONTHLY_UPDATES.map((m, i) => (
            <MonthCard key={i} data={m} lang={lang} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">{L('newCharacters')}</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {NEW_CHARACTERS.map((c) => (
            <NewCharacterCard key={c.name} data={c} lang={lang} ctx={ctx} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">{L('coreFusion')}</h2>
        <div className="mb-4 flex justify-center">
          <ImageLightbox
            src={shot('cf-snow-notia.webp')}
            alt="Core Fusion Snow and Notia"
            caption={L('cfSnowNotia')}
            thumbnailClassName="max-h-64 w-auto"
          />
        </div>
        <p className="text-content mb-4">{L('coreFusionDesc')}</p>
        <div className="flex flex-wrap justify-center gap-4">
          {CORE_FUSION_CHARS.map((cf) => {
            const c = resolveGuideCharacter(cf.name, lang, 'roadmap-2026');
            return (
              <div key={cf.name} className="flex flex-col items-center gap-1">
                <CharacterPortrait
                  id={c.character.id}
                  name={c.name}
                  element={c.character.element}
                  classType={c.character.class}
                  rarity={c.character.rarity}
                  href={c.href}
                />
                <span className="text-content-subtle text-xs">({lRec(cf.month, lang)})</span>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">{L('dimensionSingularity')}</h2>
        <div className="mb-4 flex justify-center">
          <ImageLightbox
            src={shot('dimension-singularity.webp')}
            alt="Dimension Singularity"
            caption={L('dsCaption')}
            thumbnailClassName="max-h-64 w-auto"
          />
        </div>
        <ul className="text-content list-disc space-y-2 pl-6">
          {DIMENSION_SINGULARITY_FEATURES.map((f, i) => (
            <li key={i}>{lRec(f, lang)}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">{L('rta')}</h2>
        <div className="mb-4 flex justify-center">
          <ImageLightbox
            src={shot('rta.webp')}
            alt="RTA Real-Time Arena"
            caption={L('rtaOverview')}
            thumbnailClassName="max-h-64 w-auto"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="border-line-subtle bg-surface-raised rounded-lg border p-4">
            <h4 className="mb-2 font-semibold text-cyan-400">{L('tacticsLeague')}</h4>
            <ul className="text-content-muted space-y-1 text-sm">
              {TACTICS_LEAGUE_RULES.map((r, i) => (
                <li key={i}>• {lRec(r, lang)}</li>
              ))}
            </ul>
          </div>
          <div className="border-line-subtle bg-surface-raised rounded-lg border p-4">
            <h4 className="mb-2 font-semibold text-yellow-400">{L('mastersLeague')}</h4>
            <ul className="text-content-muted space-y-1 text-sm">
              {MASTERS_LEAGUE_RULES.map((r, i) => (
                <li key={i}>• {lRec(r, lang)}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-line-subtle bg-surface-raised mt-4 rounded-lg border p-4">
          <h4 className="text-content-strong mb-2 font-semibold">{L('rtaRules')}</h4>
          <ul className="text-content-muted space-y-1 text-sm">
            {RTA_GENERAL_RULES.map((r, i) => (
              <li key={i}>• {lRec(r, lang)}</li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">{L('demiurgePlans')}</h2>
        <ul className="text-content list-disc space-y-2 pl-6">
          {DEMIURGE_LIMITED_PLANS.map((plan, i) => (
            <li key={i}>
              <span className="font-semibold text-yellow-400">{lRec(plan.label, lang)}</span>{' '}
              {lRec(plan.text, lang)}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">{L('coupon')}</h2>
        <div className="rounded-lg border border-pink-700/50 bg-linear-to-r from-pink-900/30 to-red-900/30 p-4">
          <p className="mb-2 font-mono text-2xl font-bold text-pink-300">{COUPON_DATA.code}</p>
          <ul className="text-content-muted text-sm">
            {COUPON_DATA.rewards.map((r, i) => (
              <li key={i}>• {lRec(r, lang)}</li>
            ))}
          </ul>
          <p className="text-content-subtle mt-2 text-xs">
            {L('validUntil')} {lRec(COUPON_DATA.expiry, lang)}
          </p>
        </div>
      </section>

      <section className="border-line-subtle text-content-subtle border-t pt-4 text-sm">
        <p>{lRec(LABELS.translationBy, lang)}</p>
        <p>{lRec(LABELS.source, lang)}</p>
      </section>
    </>
  );
}
