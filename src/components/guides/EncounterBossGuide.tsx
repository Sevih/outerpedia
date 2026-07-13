import type { LocalizedText } from '@contracts';
import { getT } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import { parseText, type ParseCtx } from '@/lib/parse-text';
import { readGuideFile, type GuideContentProps } from '@/lib/data/guides';
import { hardestDifficultyLabel } from '@/lib/data/encounters';
import { resolveSectionTitle, type SectionTitle } from '@/lib/data/guide-sections';
import { BossEncounters } from '@/components/guides/BossEncounters';
import { TacticalTips } from '@/components/guides/TacticalTips';
import { RecommendedCharacters } from '@/components/guides/RecommendedCharacters';
import { TeamSlots } from '@/components/guides/TeamSlots';
import { MultiVideoEmbed, type VideoItem } from '@/components/ui/MultiVideoEmbed';

/** `strings.json` — optionnel : tous les portages n'ont pas d'intro. */
interface GuideStrings {
  intro?: LocalizedText & { en: string };
}

/** `videos.json` */
type GuideVideos = VideoItem[];

/** `tips.json` */
interface GuideTips {
  tactical: (LocalizedText & { en: string })[];
}

/** `recommended.json` */
type GuideRecommended = Array<{
  characters: string[];
  reason?: LocalizedText & { en: string };
}>;

/**
 * `teams.json` — DES équipes nommées, pas une seule : les guides irregular en
 * proposent jusqu'à trois (« Classic Team », « 1 Run Public »…). Le titre suit
 * le même contrat que les sections de `BossGuide` (`SectionTitle`) ; absent,
 * l'équipe prend le titre générique. La note est une LISTE de paragraphes —
 * celle de la Queen en V2 était un vrai walkthrough en plusieurs blocs.
 */
type GuideTeams = Array<{
  title?: SectionTitle;
  slots: string[][];
  note?: (LocalizedText & { en: string })[];
}>;

/**
 * RENDU PARTAGÉ d'un guide de boss NON VERSIONNÉ à rencontres — un mode
 * permanent qui rejoue le même combat à plusieurs difficultés (poursuite
 * irregular ; l'anatomie vaut pour tout mode « comme le joint challenge mais
 * sans saisons »).
 *
 * C'est `VersionedBossGuide` SANS l'axe des versions : le guide entier est ce
 * qu'une version y est. Le combat vient du `group` du META (comme
 * `StagedBossGuide` — pas de saison qui le porterait dans un config de
 * version). Les quatre guides irregular de la V2 étaient isomorphes — quatre
 * TSX de ~90 lignes qui ne différaient que par leurs données. Ici le rendu vit
 * une fois et un guide n'est que ses JSON :
 *   meta.json · tips.json · recommended.json · teams.json · videos.json
 * Un fichier absent = une section en moins, jamais un plantage (l'intro de
 * strings.json comprise : la V2 n'en écrivait pas pour ce mode, on n'en
 * invente pas).
 *
 * Le panneau du boss porte le BUTIN (`rewards`) : c'est la spécificité du mode
 * — mêmes onglets que le JC, mais chaque difficulté a ses tables win/lose.
 *
 * STRICT : un `group` inconnu, un tag ou un nom de perso inconnu JETTE (build
 * SSG cassé), comme partout ailleurs dans les guides.
 */
export async function EncounterBossGuide({ lang, guide }: GuideContentProps) {
  const t = await getT(lang);
  const ctx: ParseCtx = { lang, t, strict: true };
  const at = `${guide.category}/${guide.slug}`;

  if (!guide.group) {
    throw new Error(`${at} : « group » manquant dans meta.json (guide de boss à rencontres).`);
  }

  const strings = readGuideFile<GuideStrings>(guide, 'strings.json');
  const tips = readGuideFile<GuideTips>(guide, 'tips.json');
  const recommended = readGuideFile<GuideRecommended>(guide, 'recommended.json');
  const teams = readGuideFile<GuideTeams>(guide, 'teams.json');
  const videos = readGuideFile<GuideVideos>(guide, 'videos.json');

  // Les conseils sont écrits pour la difficulté la plus dure — le dire (cf.
  // VersionedBossGuide : le lecteur qui bascule sur Normal doit le savoir).
  const target = hardestDifficultyLabel(guide.group, lang, t);

  return (
    <>
      {strings?.intro && (
        <p className="text-content text-sm leading-relaxed">
          {parseText(lRec(strings.intro, lang), ctx)}
        </p>
      )}

      <BossEncounters group={guide.group} lang={lang} rewards />

      {tips && target && (
        <p className="text-content text-xs italic">
          {t('guides.difficulty.tips_for', { difficulty: target })}
        </p>
      )}

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

      {teams?.map((team, i) => (
        <TeamSlots
          key={i}
          title={
            team.title
              ? resolveSectionTitle(team.title, 'team', lang, t, `${at} · teams[${i}]`)
              : t('guides.team_selector')
          }
          lang={lang}
          slots={team.slots}
          note={
            team.note?.length ? (
              <div className="space-y-2">
                {team.note.map((p, j) => (
                  <p key={j}>{parseText(lRec(p, lang), ctx)}</p>
                ))}
              </div>
            ) : undefined
          }
          labels={{
            prev: t('guides.team.prev_option'),
            next: t('guides.team.next_option'),
          }}
        />
      ))}

      {videos?.length ? (
        <section className="space-y-2">
          <h2 className="text-content-strong text-xl font-bold">{t('guides.combat_footage')}</h2>
          <MultiVideoEmbed videos={videos} />
        </section>
      ) : null}
    </>
  );
}
