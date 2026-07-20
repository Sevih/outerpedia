import type { LocalizedText } from '@contracts';
import { getT } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import { parseText, type ParseCtx } from '@/lib/parse-text';
import { readGuideFile, type GuideContentProps } from '@/lib/data/guides';
import { hardestDifficultyLabel, type Encounter } from '@/lib/data/encounters';
import { resolveSectionTitle, type SectionTitle } from '@/lib/data/guide-sections';
import {
  lootDetails,
  pursuitLoot,
  type LootVariant,
  type ResolvedReward,
} from '@/lib/data/rewards';
import { GRADE_TEXT } from '@/lib/images';
import { ItemInline } from '@/components/inline/ItemInline';
import { BossEncounters } from '@/components/guides/BossEncounters';
import { LootPanel } from '@/components/guides/LootPanel';
import { lootPanelLabels } from '@/components/guides/loot-labels';
import { TacticalTips } from '@/components/guides/TacticalTips';
import { RecommendedCharacters } from '@/components/guides/RecommendedCharacters';
import { TeamSlots } from '@/components/guides/TeamSlots';
import { MultiVideoEmbed, type VideoItem } from '@/components/ui/MultiVideoEmbed';
import { VideoJsonLd } from '@/components/seo/VideoJsonLd';

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
 * Le RÉSUMÉ du butin d'une difficulté, en icônes — la monnaie du mode (les
 * cellules, dont la quantité est justement ce qui monte d'une difficulté à
 * l'autre) et les tuiles de son pool aléatoire, une par classe, comme le jeu
 * les liste (cf. `pursuitLoot`). Le DÉTAIL de ces objets se déplie derrière
 * « Details » (cf. `LootPanel`).
 *
 * Même parti pris que le Special Request : ce qu'on vient farmer, et rien
 * d'autre — les coffres et marteaux fixes, identiques d'une poursuite à
 * l'autre, ne distinguent rien ; le lot de consolation de la défaite non plus.
 */
function PursuitLootIcons({
  loot,
}: {
  loot: { currencies: ResolvedReward[]; weapons: LootVariant[]; amulets: LootVariant[] };
}) {
  const gear = [...loot.weapons, ...loot.amulets];
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      {loot.currencies.map((c, i) => (
        <span key={i} className="inline-flex items-center gap-1 text-sm whitespace-nowrap">
          <ItemInline
            item={{ name: c.name, iconSrc: c.iconSrc, grade: c.grade, desc: c.desc }}
            color={GRADE_TEXT[c.grade] ?? 'text-content'}
          />
          {c.max > 1 && <span className="text-content-muted text-xs">×{c.max}</span>}
        </span>
      ))}
      <div className="flex flex-wrap items-center gap-1.5">
        {gear.map((v) => (
          <ItemInline
            key={v.iconSrc}
            iconOnly
            size={28}
            item={{ name: v.name, iconSrc: v.iconSrc, grade: v.grade }}
          />
        ))}
      </div>
    </div>
  );
}

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
 * La carte du boss porte le BUTIN de sa difficulté (`PursuitLootRow`, dans
 * `afterStats`) : c'est la spécificité du mode — mêmes onglets que le JC, mais
 * un pool par difficulté, et l'équipement ne tombe qu'en haut d'échelle.
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
  const lootLabels = lootPanelLabels(t);

  return (
    <>
      {strings?.intro && (
        <p className="text-content text-sm leading-relaxed">
          {parseText(lRec(strings.intro, lang), ctx)}
        </p>
      )}

      {/* Le butin est LU sur la table de VICTOIRE de chaque difficulté (son
          pool lui appartient : les cellules montent, l'équipement n'arrive
          qu'en Very Hard) — jamais sur une liste écrite à la main. */}
      <BossEncounters
        group={guide.group}
        lang={lang}
        afterStats={(e: Encounter) => {
          const tableId = e.ref.rewardWin ?? e.ref.reward;
          if (!tableId) return null;
          const loot = pursuitLoot(tableId, lang);
          if (!loot.currencies.length && !loot.weapons.length && !loot.amulets.length) return null;
          return (
            <LootPanel
              icons={<PursuitLootIcons loot={loot} />}
              details={lootDetails(tableId, lang)}
              labels={lootLabels}
            />
          );
        }}
      />

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
          <MultiVideoEmbed byLabel={t('video.by')} videos={videos} />
          <VideoJsonLd videos={videos} />
        </section>
      ) : null}
    </>
  );
}
