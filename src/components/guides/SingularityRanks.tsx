import { getT, type TFunction } from '@/i18n';
import { LANGUAGES, type Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { GRADE_TEXT, img } from '@/lib/images';
import { rankBadgeSprite } from '@/lib/ranks';
import { getCatalogEntry } from '@/lib/data/items';
import {
  singularityRankLadder,
  type SingularityRankLadderView,
} from '@/lib/data/singularity-ranks';
import { ItemInline } from '@/components/inline/ItemInline';

/** Clé catalogue de l'Ether (monnaie premium) — son nom officiel dans chaque langue. */
const ETHER_KEY = 'SYS_ASSET_CRISTAL';

/**
 * Section « Ranks » de Dimensional Singularity : comment le rang s'obtient, ce
 * qu'il change sur le boss, ce qu'il rapporte. Les chiffres viennent TOUS de
 * l'échelle dérivée des tables (`singularityRankLadder`) ; le texte n'en
 * recopie aucun. Muette si la donnée ne porte aucune échelle.
 */
export default async function SingularityRanks({ lang }: { lang: Lang }) {
  const t = await getT(lang);
  const ladder = singularityRankLadder(lang, {
    finalDmgReduce: t('guides.boss_display.rank_option_final_dmg_reduce'),
    wgDmgReduce: t('guides.boss_display.rank_option_wg_dmg_reduce'),
    dotDmgTaken: t('guides.boss_display.rank_option_dot_dmg_taken'),
  });
  if (!ladder.rows.length) return null;
  return <SingularityRanksView ladder={ladder} lang={lang} t={t} />;
}

/**
 * Le rendu, séparé de la lecture des données : testable sur une échelle
 * fabriquée (la donnée committée peut précéder un patch, cf. le test).
 */
export function SingularityRanksView({
  ladder,
  lang,
  t,
}: {
  ladder: SingularityRankLadderView;
  lang: Lang;
  t: TFunction;
}) {
  const locale = LANGUAGES[lang].htmlLang;
  const ether = getCatalogEntry(ETHER_KEY);
  const etherName = ether ? lRec(ether.name, lang) || ether.name.en : undefined;
  const hasRewards = ladder.rows.some((r) => r.rewards?.length);

  // Un groupe par GRADE (E, E+, E++ → « E ») : le trait entre deux groupes
  // découpe les 34 rangs en onze blocs lisibles, sans en fusionner aucun.
  const grades: { grade: string; rows: SingularityRankLadderView['rows'] }[] = [];
  for (const row of ladder.rows) {
    const grade = row.name.replace(/\+/g, '');
    const last = grades.at(-1);
    if (last?.grade === grade) last.rows.push(row);
    else grades.push({ grade, rows: [row] });
  }

  return (
    <section className="flex flex-col gap-5" aria-labelledby="singularity-ranks">
      <header className="border-line-subtle relative flex flex-col gap-2 border-b pb-4">
        <span
          className="bg-accent absolute -bottom-px left-0 h-0.5 w-14 rounded-full"
          aria-hidden
        />
        <h2
          id="singularity-ranks"
          className="text-content-strong text-xl font-semibold tracking-tight md:text-2xl"
        >
          {t('guides.singularity.ranks.title')}
        </h2>
        <p className="text-content-muted text-sm">{t('guides.singularity.ranks.tagline')}</p>
      </header>

      <div className="text-content space-y-2 text-sm leading-relaxed">
        <p>{t('guides.singularity.ranks.how')}</p>
        <p>{t('guides.singularity.ranks.element_note')}</p>
        <p>{t('guides.singularity.ranks.ex_note')}</p>
        {hasRewards && <p>{t('guides.singularity.ranks.rewards_note')}</p>}
        {etherName && <p>{t('guides.singularity.ranks.ether_note', { ether: etherName })}</p>}
      </div>

      <div className="border-line overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-surface-sunken text-content-subtle text-xs">
            <tr>
              <th scope="col" className="px-3 py-2 text-left font-semibold">
                {t('guides.boss_display.rank')}
              </th>
              <th scope="col" className="px-3 py-2 text-right font-semibold whitespace-nowrap">
                {t('guides.singularity.ranks.col_damage')}
              </th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">
                {t('page.character.skill.level')}
              </th>
              <th scope="col" className="px-3 py-2 text-left font-semibold">
                {t('guides.singularity.ranks.col_changes')}
              </th>
              {hasRewards && (
                <th scope="col" className="px-3 py-2 text-left font-semibold">
                  {t('guides.rewards.title')}
                </th>
              )}
            </tr>
          </thead>
          {grades.map(({ grade, rows }) => (
            <tbody key={grade} className="border-line border-t">
              {rows.map((row) => {
                const changes = [
                  ...row.changes,
                  ...(row.exBuff && ladder.exBuffPercent
                    ? [t('guides.singularity.ranks.ex_buff', { value: ladder.exBuffPercent })]
                    : []),
                ];
                return (
                  <tr key={row.name} className="border-line-subtle border-t first:border-t-0">
                    <th scope="row" className="px-3 py-1.5 text-left font-normal">
                      <span className="inline-flex items-center gap-2">
                        <img
                          src={img.rankBadge(rankBadgeSprite(row.name))}
                          alt=""
                          aria-hidden
                          width={28}
                          height={28}
                          className="h-7 w-7 object-contain"
                        />
                        <span className="text-content-strong font-mono text-xs font-bold">
                          {row.name}
                        </span>
                      </span>
                    </th>
                    <td className="text-content px-3 py-1.5 text-right font-mono text-xs whitespace-nowrap tabular-nums">
                      {row.minDamage.toLocaleString(locale)}
                    </td>
                    <td className="text-content-muted px-3 py-1.5 text-right font-mono text-xs tabular-nums">
                      {row.level ?? ''}
                    </td>
                    <td className="px-3 py-1.5 text-xs">
                      {changes.length > 0 ? (
                        <ul className="space-y-0.5">
                          {changes.map((c) => (
                            <li key={c} className="text-content">
                              {c}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-content-subtle" aria-hidden>
                          —
                        </span>
                      )}
                    </td>
                    {hasRewards && (
                      <td className="px-3 py-1.5 text-xs">
                        <span className="flex flex-col gap-0.5">
                          {(row.rewards ?? []).map((r, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 whitespace-nowrap"
                            >
                              <ItemInline
                                item={{
                                  name: r.name,
                                  iconSrc: r.iconSrc,
                                  grade: r.grade,
                                  desc: r.desc,
                                }}
                                size={20}
                                color={GRADE_TEXT[r.grade] ?? 'text-content'}
                              />
                              <span className="text-content-muted">
                                ×{r.max.toLocaleString(locale)}
                              </span>
                            </span>
                          ))}
                        </span>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          ))}
        </table>
      </div>
    </section>
  );
}
