/**
 * Guide « Prototype EX-78 » (Joint Challenge) — guide VERSIONNÉ de référence.
 *
 * Les versions sont AUTO-DÉCOUVERTES par le data layer (`versions/YYYY-MM/`) :
 * ajouter un mois = créer un dossier avec ses JSON, rien d'autre. Chaque
 * version décrit ses données (`config.json` : boss + vidéos ; `tips.json`,
 * `recommended.json`, `teams.json` optionnels) et le rendu s'assemble ici —
 * plus d'imports nommés ni de JSX répété par version comme en V2.
 */
import type { LocalizedText } from '@contracts';
import { getT } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import { parseText, type ParseCtx } from '@/lib/parse-text';
import { guideVersionLabel, readGuideVersionFile, type GuideContentProps } from '@/lib/data/guides';
import { BossPanel } from '@/components/guides/BossPanel';
import { GuideVersions, type GuideVersionEntry } from '@/components/guides/GuideVersions';
import { TacticalTips } from '@/components/guides/TacticalTips';
import { RecommendedCharacters } from '@/components/guides/RecommendedCharacters';
import { TeamSlots } from '@/components/guides/TeamSlots';
import { MultiVideoEmbed, type VideoItem } from '@/components/ui/MultiVideoEmbed';
import strings from './strings.json';

interface VersionConfig {
  /** Id du monstre (data/generated/monsters.json) — panneau boss si présent. */
  boss?: string;
  videos?: VideoItem[];
}
interface VersionTips {
  tactical: LocalizedText[];
}
type VersionRecommended = Array<{ characters: string[]; reason?: LocalizedText }>;
interface VersionTeams {
  slots: string[][];
  note?: LocalizedText;
}

export default async function PrototypeEx78Guide({ lang, guide }: GuideContentProps) {
  const t = await getT(lang);
  const ctx: ParseCtx = { lang, t };
  const newestLabel = guide.versions.length
    ? guideVersionLabel(guide.versions[0], lang)
    : undefined;

  const versions: GuideVersionEntry[] = guide.versions.map((v, i) => {
    const cfg = readGuideVersionFile<VersionConfig>(guide, v.key, 'config.json');
    const tips = readGuideVersionFile<VersionTips>(guide, v.key, 'tips.json');
    const recommended = readGuideVersionFile<VersionRecommended>(guide, v.key, 'recommended.json');
    const teams = readGuideVersionFile<VersionTeams>(guide, v.key, 'teams.json');
    const label = guideVersionLabel(v, lang);

    return {
      key: v.key,
      label,
      ...(i > 0 && newestLabel
        ? {
            warning: t('page.guide.older_version_warning', {
              currentVersion: label,
              newestVersion: newestLabel,
            }),
          }
        : {}),
      content: (
        <>
          {cfg?.boss && <BossPanel monsterId={cfg.boss} lang={lang} />}
          {tips && (
            <TacticalTips
              title={t('guides.tips.tactical')}
              tips={tips.tactical.map((tip) => parseText(lRec(tip, lang), ctx))}
            />
          )}
          {recommended && (
            <RecommendedCharacters
              title={t('guides.recommended.title')}
              lang={lang}
              groups={recommended.map((g) => ({
                characters: g.characters,
                reason: g.reason ? parseText(lRec(g.reason, lang), ctx) : undefined,
              }))}
            />
          )}
          {teams && (
            <TeamSlots
              title={t('guides.team_selector')}
              lang={lang}
              slots={teams.slots}
              note={teams.note ? parseText(lRec(teams.note, lang), ctx) : undefined}
            />
          )}
          {cfg?.videos?.length ? (
            <section className="space-y-2">
              <h2 className="text-content-strong text-xl font-bold">
                {t('guides.combat_footage')}
              </h2>
              <MultiVideoEmbed videos={cfg.videos} />
            </section>
          ) : null}
        </>
      ),
    };
  });

  return (
    <>
      <p className="text-content-muted text-sm leading-relaxed">
        {parseText(lRec(strings.intro, lang), ctx)}
      </p>
      <GuideVersions versions={versions} label={t('page.guide.versions')} />
    </>
  );
}
