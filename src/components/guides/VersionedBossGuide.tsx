import type { LocalizedText } from '@contracts';
import { getT } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import { parseText, type ParseCtx } from '@/lib/parse-text';
import {
  guideVersionLabel,
  readGuideFile,
  readGuideVersionFile,
  type GuideContentProps,
} from '@/lib/data/guides';
import { BossEncounters } from '@/components/guides/BossEncounters';
import { hardestDifficultyLabel } from '@/lib/data/encounters';
import { GuideVersions, type GuideVersionEntry } from '@/components/guides/GuideVersions';
import { TacticalTips } from '@/components/guides/TacticalTips';
import { RecommendedCharacters } from '@/components/guides/RecommendedCharacters';
import { TeamSlots } from '@/components/guides/TeamSlots';
import { MultiVideoEmbed, type VideoItem } from '@/components/ui/MultiVideoEmbed';

/** `strings.json` — le texte du guide qui ne dépend d'aucune version. */
interface GuideStrings {
  intro: LocalizedText & { en: string };
}

/** `versions/<clé>/config.json` — ce que la version combat, et avec quelles vidéos. */
interface VersionConfig {
  /**
   * Le COMBAT que la saison rejoue (`DungeonRef.group`) — ses difficultés, ses
   * monstres et leurs niveaux en découlent. Un `boss` (un id de monstre) ne
   * portait qu'UNE difficulté : le portage V2 n'avait donc que le Very Hard, et
   * les deux autres n'existaient nulle part.
   */
  group?: string;
  videos?: VideoItem[];
}

/** `versions/<clé>/tips.json` */
interface VersionTips {
  tactical: (LocalizedText & { en: string })[];
}

/** `versions/<clé>/recommended.json` */
type VersionRecommended = Array<{
  characters: string[];
  reason?: LocalizedText & { en: string };
}>;

/** `versions/<clé>/teams.json` */
interface VersionTeams {
  slots: string[][];
  note?: LocalizedText & { en: string };
}

/**
 * RENDU PARTAGÉ d'un guide de boss VERSIONNÉ — un mode qui rejoue le même boss
 * saison après saison (joint challenge, et demain guild raid / world boss).
 *
 * Les 5 guides Joint Challenge de la V2 sont ISOMORPHES : chaque version enchaîne
 * panneau du boss → conseils → persos → équipe → vidéos, plus une version
 * « legacy » qui n'est qu'une vidéo. Aucune section n'appartient à un guide en
 * propre, aucun titre n'est écrit à la main. La V2 les écrivait pourtant en cinq
 * TSX de ~250 lignes, où ce même bloc était RECOPIÉ une fois par version — d'où
 * ses dérives, dont celle-ci, bien réelle : la version de juin 2025 d'Annihilator
 * affichait les conseils de décembre 2025, parce que le TSX pointait la mauvaise
 * variable. Quatre copies d'une même chose finissent toujours par diverger.
 *
 * Ici le rendu vit une fois. Un guide n'est plus que de la donnée :
 *   meta.json · strings.json · versions/YYYY-MM/{config,tips,recommended,teams}.json
 * Une version n'a que les fichiers qu'elle a — la « legacy » n'a qu'un `config.json`
 * avec ses vidéos, et une version sans `tips.json` n'affiche pas de conseils
 * (plutôt que ceux d'une autre saison).
 *
 * STRICT : un tag ou un nom de perso inconnu JETTE (build SSG cassé).
 */
export async function VersionedBossGuide({ lang, guide }: GuideContentProps) {
  const t = await getT(lang);
  const ctx: ParseCtx = { lang, t, strict: true };
  const at = `${guide.category}/${guide.slug}`;

  const strings = readGuideFile<GuideStrings>(guide, 'strings.json');
  if (!strings) throw new Error(`${at} : strings.json manquant (intro du guide).`);

  // La plus récente d'abord (cf. `scanVersions`) : c'est celle qu'on ouvre, les
  // autres portent l'avertissement « version datée ».
  const newestLabel = guide.versions.length
    ? guideVersionLabel(guide.versions[0], lang)
    : undefined;

  /**
   * LE BOSS NE CHANGE PAS DE SAISON EN SAISON — il ne descend donc pas dans la
   * boucle des versions.
   *
   * Un Joint Challenge rejoue le MÊME combat : les trois saisons d'Annihilator
   * pointent toutes `event_boss:SYS_EVENT_BOSS_DUNGEON_0001`. Seuls les conseils,
   * les équipes et les vidéos datent. Rendre le panneau par version le rendait
   * trois fois — et depuis qu'il porte les trois difficultés, NEUF cartes de
   * boss partaient dans la charge utile, neuf fois le même monstre avec ses
   * compétences et ses immunités. La page pesait 1 Mo.
   *
   * La règle se lit dans la donnée, elle ne se décrète pas : si toutes les
   * saisons jouent le même combat, le panneau monte au-dessus des onglets. Le
   * jour où un guide en aurait deux, chaque version reprend le sien.
   */
  const groups = new Set(
    guide.versions
      .map((v) => readGuideVersionFile<VersionConfig>(guide, v.key, 'config.json')?.group)
      .filter((g): g is string => Boolean(g)),
  );
  const sharedGroup = groups.size === 1 ? [...groups][0] : undefined;

  const versions: GuideVersionEntry[] = guide.versions.map((v, i) => {
    const cfg = readGuideVersionFile<VersionConfig>(guide, v.key, 'config.json');
    const target = cfg?.group ? hardestDifficultyLabel(cfg.group, lang, t) : undefined;
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
          {/* Le panneau ne redescend ici que si les saisons jouent des combats
              DIFFÉRENTS — sinon il est rendu une fois, au-dessus des onglets. */}
          {!sharedGroup && cfg?.group && <BossEncounters group={cfg.group} lang={lang} />}

          {/* Les conseils sont écrits pour UNE difficulté — celle que le mode
              fait viser (la plus dure). Le dire, plutôt que de laisser croire
              qu'ils valent pour les trois : le lecteur qui bascule sur Normal
              doit savoir que ce qu'il lit dessous ne parle pas de son combat. */}
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

          {teams && (
            <TeamSlots
              title={t('guides.team_selector')}
              lang={lang}
              slots={teams.slots}
              note={teams.note ? parseText(lRec(teams.note, lang), ctx) : undefined}
              labels={{
                prev: t('guides.team.prev_option'),
                next: t('guides.team.next_option'),
              }}
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
      {/* Contenu éditorial : même encre que le reste du guide, pas du gris de chrome. */}
      <p className="text-content text-sm leading-relaxed">
        {parseText(lRec(strings.intro, lang), ctx)}
      </p>

      {/* Le sélecteur de version est le premier contrôle de la page : il décide de
          TOUT ce qu'on lit dessous. Le boss vient juste après, rendu UNE fois —
          il ne dépend d'aucune saison (cf. `sharedGroup`). */}
      <GuideVersions
        versions={versions}
        label={t('page.guide.versions')}
        shared={sharedGroup ? <BossEncounters group={sharedGroup} lang={lang} /> : undefined}
      />
    </>
  );
}
