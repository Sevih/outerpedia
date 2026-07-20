/**
 * RENDU PARTAGÉ d'un GUILD RAID — le mode à deux phases et trois boss.
 *
 * Un guild raid ne rejoue pas UN boss (comme le joint challenge ou le world
 * boss) mais TROIS, en deux phases :
 *   - Phase 1 : deux SOUS-BOSS (A et B). Chacun débloque, palier de kills après
 *     palier, une paire de GEAS (une aide + un handicap) — c'est la table qui
 *     fait la particularité du mode, et elle se DÉRIVE du combat (`geasUnlockTable`),
 *     jamais recopiée.
 *   - Phase 2 : le BOSS PRINCIPAL, sans table de déblocage — les geas y sont
 *     CHOISIS par chaque équipe (le contenu déclare les ids activés).
 *
 * La lecture est TABULÉE pour épurer : un onglet par phase, puis un sélecteur de
 * SOUS-BOSS en phase 1 et un sélecteur d'ÉQUIPE en phase 2 — une chose à la fois
 * (cf. `SegmentedTabs`), comme le faisait la V2.
 *
 * Comme le `VersionedBossGuide`, un guild raid est de la DONNÉE :
 *   meta.json · strings.json · versions/YYYY-MM/{config,subA,subB,main}.json
 * Une version n'a que les fichiers qu'elle a. La donnée du jeu ne garde que la
 * ROTATION COURANTE : les anciennes saisons n'ont plus de `group` (ni boss, ni
 * geas dérivables) — leur version reste « légère », son contenu éditorial (équipes,
 * vidéos) sans panneau de boss. On casse le build sur un tag/perso inconnu (STRICT),
 * jamais sur une version archivée sans combat.
 */
import type { ReactNode } from 'react';
import type { LocalizedText } from '@contracts';
import { getT } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import { parseText, type ParseCtx } from '@/lib/parse-text';
import {
  groupBossMonster,
  guideVersionLabel,
  readGuideFile,
  readGuideVersionFile,
  type GuideContentProps,
} from '@/lib/data/guides';
import { geasUnlockTable, resolveGeas } from '@/lib/data/geas';
import { monsterDisplayNames, monsterIconSrc } from '@/lib/data/monsters';
import { BossEncounters } from '@/components/guides/BossEncounters';
import {
  GeasUnlockList,
  ActiveGeasRow,
  GeasTable,
  type GeasColumn,
} from '@/components/guides/GeasUnlockList';
import { GuideVersions, type GuideVersionEntry } from '@/components/guides/GuideVersions';
import { RecommendedCharacters } from '@/components/guides/RecommendedCharacters';
import { TeamSlots } from '@/components/guides/TeamSlots';
import { TurnOrder, type TurnOrderStep } from '@/components/guides/TurnOrder';
import { BuildRequirements, type RequirementsData } from '@/components/guides/BuildRequirements';
import { SegmentedTabs, type TabItem } from '@/components/guides/SegmentedTabs';
import { MultiVideoEmbed, type VideoItem } from '@/components/ui/MultiVideoEmbed';
import { VideoJsonLd } from '@/components/seo/VideoJsonLd';
import { img } from '@/lib/images';

type LText = LocalizedText & { en: string };

/**
 * Un bloc de note d'équipe : un paragraphe (`p`), une liste à puces (`ul`) ou un
 * ORDRE DE JEU (`turnOrder`, réglage de vitesse). Les notes de phase 2 alternent
 * les trois — un simple tableau de paragraphes les aplatirait.
 */
type NoteBlock = { p: LText } | { ul: LText[] } | { turnOrder: TurnOrderStep[]; note?: LText };

/** `strings.json` — l'intro du guide, indépendante de toute version. */
interface GuideStrings {
  intro: LText;
}

/** `versions/<clé>/config.json` — les trois combats de la saison + ses vidéos. */
interface VersionConfig {
  /** Combat du sous-boss A (`DungeonRef.group`). Absent = version archivée. */
  subA?: string;
  subB?: string;
  /** Combat du boss principal (phase 2). */
  main?: string;
  /** Vidéos de la page (en plus de celles par boss/équipe). */
  videos?: VideoItem[];
}

interface RecommendedEntry {
  characters: string[];
  reason?: LText;
}

/** `versions/<clé>/subA.json` · `subB.json` — l'éditorial d'un sous-boss. */
interface SubBossData {
  /** Remarques d'intro (paragraphes libres). */
  notes?: LText[];
  recommended?: RecommendedEntry[];
  /** Équipe suggérée : un tableau d'options par poste. */
  team?: { slots: string[][]; note?: LText };
  video?: VideoItem;
}

/** Une équipe de phase 2 : nom, badge, postes, geas, builds, notes, vidéo. */
interface MainTeam {
  title: LText;
  /** Badge de l'équipe : élément (slug) — pastille avant le nom. */
  element?: string;
  /** Badge alternatif : sprite d'effet (`SC_Buff_*`) via `img.effect`. */
  icon?: string;
  slots: string[][];
  /** Notes de l'équipe (blocs p/ul/turn-order — tokens résolus via parseText). */
  notes?: NoteBlock[];
  /** Builds détaillés par personnage (stats/équipement/notes). */
  requirements?: RequirementsData;
  /** Geas activés : ids du pool, classés bonus/malus par leur nature. */
  geasActive?: { bonus?: string[]; malus?: string[] };
  video?: VideoItem;
}

/** `versions/<clé>/main.json` — les équipes de phase 2. */
interface MainData {
  teams?: MainTeam[];
}

export async function GuildRaidGuide({ lang, guide }: GuideContentProps) {
  const t = await getT(lang);
  const ctx: ParseCtx = { lang, t, strict: true };
  const at = `${guide.category}/${guide.slug}`;

  const strings = readGuideFile<GuideStrings>(guide, 'strings.json');
  if (!strings) throw new Error(`${at} : strings.json manquant (intro du guide).`);

  const newestLabel = guide.versions.length
    ? guideVersionLabel(guide.versions[0], lang)
    : undefined;

  const teamLabels = {
    prev: t('guides.team.prev_option'),
    next: t('guides.team.next_option'),
  };

  /** Rend une suite de blocs p/ul/turn-order (notes d'équipe), tokens résolus.
   *  `dropTurnOrder` : l'ordre de jeu est déjà porté par le tableau de builds
   *  (trié par SPD) → on saute le bloc file ATB, en gardant sa note libre. */
  const renderNotes = (notes: NoteBlock[] | undefined, opts?: { dropTurnOrder?: boolean }) =>
    notes?.map((block, i) => {
      if ('turnOrder' in block) {
        if (opts?.dropTurnOrder) {
          return block.note ? (
            <p key={i} className="text-content-muted text-center text-sm">
              {parseText(lRec(block.note, lang), ctx)}
            </p>
          ) : null;
        }
        return (
          <TurnOrder
            key={i}
            steps={block.turnOrder}
            lang={lang}
            note={block.note ? parseText(lRec(block.note, lang), ctx) : undefined}
          />
        );
      }
      if ('ul' in block) {
        return (
          <ul key={i} className="text-content list-inside list-disc space-y-1 text-sm">
            {block.ul.map((line, j) => (
              <li key={j}>{parseText(lRec(line, lang), ctx)}</li>
            ))}
          </ul>
        );
      }
      return (
        <p key={i} className="text-content text-sm leading-relaxed">
          {parseText(lRec(block.p, lang), ctx)}
        </p>
      );
    });

  /** Pastille de badge d'une équipe : élément (turn-icon) ou sprite d'effet. */
  const teamBadge = (team: MainTeam) => {
    const src = team.element
      ? img.element(team.element)
      : team.icon
        ? img.effect(team.icon)
        : undefined;
    if (!src) return undefined;
    // eslint-disable-next-line @next/next/no-img-element -- petit badge d'équipe
    return <img src={src} alt="" width={20} height={20} className="h-5 w-5 shrink-0" />;
  };

  /** Colonne de geas (portrait + nom + table de déblocage) d'un sous-boss. */
  const geasColumn = (group: string | undefined): GeasColumn | undefined => {
    if (!group) return undefined;
    const unlocks = geasUnlockTable(group);
    if (!unlocks.length) return undefined;
    const m = groupBossMonster(group);
    return {
      portraitSrc: m ? monsterIconSrc(m) : undefined,
      name: m ? (monsterDisplayNames([m.id], lang).get(m.id) ?? m.name.en) : '',
      unlocks,
    };
  };

  /** Libellé d'onglet d'un sous-boss : icône + nom du boss (données), sinon repli. */
  const subBossTabLabel = (group: string | undefined, index: number): ReactNode => {
    if (group) {
      const m = groupBossMonster(group);
      if (m) {
        const name = monsterDisplayNames([m.id], lang).get(m.id) ?? m.name.en;
        return (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- portrait de boss */}
            <img
              src={monsterIconSrc(m)}
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 shrink-0 rounded"
            />
            <span className="min-w-0 truncate">{name}</span>
            {m.element && (
              // eslint-disable-next-line @next/next/no-img-element -- icône d'élément
              <img
                src={img.element(m.element)}
                alt=""
                width={16}
                height={16}
                className="h-4 w-4 shrink-0"
              />
            )}
          </>
        );
      }
    }
    return t('guildraid.sub_boss', { n: index + 1 });
  };

  /** Un sous-boss de phase 1 : panneau (si combat), geas, éditorial. */
  const renderSubBoss = (group: string | undefined, data: SubBossData | undefined) => (
    <div className="space-y-4">
      {group && <BossEncounters group={group} lang={lang} hideSpawnLabel compact />}
      {group &&
        (() => {
          const unlocks = geasUnlockTable(group);
          return unlocks.length > 0 ? <GeasUnlockList unlocks={unlocks} lang={lang} t={t} /> : null;
        })()}
      {data?.notes?.map((note, i) => (
        <p key={i} className="text-content text-sm leading-relaxed">
          {parseText(lRec(note, lang), ctx)}
        </p>
      ))}
      {data?.recommended?.length ? (
        <RecommendedCharacters
          title={t('guides.recommended.title')}
          lang={lang}
          groups={data.recommended.map((g) => ({
            characters: g.characters,
            reason: g.reason ? parseText(lRec(g.reason, lang), ctx) : undefined,
          }))}
        />
      ) : null}
      {data?.team && (
        <TeamSlots
          title={t('guides.team_selector')}
          lang={lang}
          slots={data.team.slots}
          note={data.team.note ? parseText(lRec(data.team.note, lang), ctx) : undefined}
          labels={teamLabels}
        />
      )}
      {data?.video && (
        <>
          <MultiVideoEmbed byLabel={t('video.by')} videos={[data.video]} />
          <VideoJsonLd videos={[data.video]} />
        </>
      )}
    </div>
  );

  /**
   * Une équipe de phase 2 (le nom est porté par l'onglet, pas répété ici).
   * `geas` = les colonnes des deux sous-boss ; présentes → table complète du jeu
   * avec les geas de l'équipe cochés ; absentes (version légère) → rangée compacte.
   */
  const renderTeam = (team: MainTeam, geas?: { left: GeasColumn; right: GeasColumn }) => {
    const activeIds = [...(team.geasActive?.bonus ?? []), ...(team.geasActive?.malus ?? [])];
    // Ordre de jeu déjà porté par le plan de builds (trié SPD) → l'ordre ATB des
    // notes fait doublon : on le retire quand des builds existent.
    const hasBuilds = Boolean(team.requirements?.entries?.length);
    return (
      <div className="space-y-3">
        <TeamSlots lang={lang} slots={team.slots} labels={teamLabels} />
        {geas ? (
          <GeasTable left={geas.left} right={geas.right} activeIds={activeIds} lang={lang} t={t} />
        ) : (
          <ActiveGeasRow geas={resolveGeas(activeIds)} lang={lang} t={t} />
        )}
        {team.requirements && <BuildRequirements data={team.requirements} ctx={ctx} />}
        {renderNotes(team.notes, { dropTurnOrder: hasBuilds })}
        {team.video && <MultiVideoEmbed byLabel={t('video.by')} videos={[team.video]} />}
      </div>
    );
  };

  const versions: GuideVersionEntry[] = guide.versions.map((v, i) => {
    const cfg = readGuideVersionFile<VersionConfig>(guide, v.key, 'config.json');
    const subA = readGuideVersionFile<SubBossData>(guide, v.key, 'subA.json');
    const subB = readGuideVersionFile<SubBossData>(guide, v.key, 'subB.json');
    const main = readGuideVersionFile<MainData>(guide, v.key, 'main.json');
    const label = guideVersionLabel(v, lang);

    // Phase 1 : un onglet par sous-boss présent.
    const subBossTabs: TabItem[] = [];
    if (cfg?.subA || subA) {
      subBossTabs.push({
        key: 'a',
        label: subBossTabLabel(cfg?.subA, 0),
        content: renderSubBoss(cfg?.subA, subA),
      });
    }
    if (cfg?.subB || subB) {
      subBossTabs.push({
        key: 'b',
        label: subBossTabLabel(cfg?.subB, 1),
        content: renderSubBoss(cfg?.subB, subB),
      });
    }

    // Colonnes de geas (les deux sous-boss) — pour la table complète de phase 2.
    const geasLeft = geasColumn(cfg?.subA);
    const geasRight = geasColumn(cfg?.subB);
    const geasCols = geasLeft && geasRight ? { left: geasLeft, right: geasRight } : undefined;

    // Phase 2 : un onglet par équipe.
    const teamTabs: TabItem[] = (main?.teams ?? []).map((team, ti) => {
      const badge = teamBadge(team);
      const name = lRec(team.title, lang) || team.title.en;
      return {
        key: String(ti),
        label: badge ? (
          <>
            {badge}
            {name}
          </>
        ) : (
          name
        ),
        content: renderTeam(team, geasCols),
      };
    });

    // Onglets de phase — seulement ceux qui ont du contenu.
    const phaseTabs: TabItem[] = [];
    if (subBossTabs.length) {
      phaseTabs.push({
        key: 'p1',
        label: t('guides.tips.phase1'),
        content: (
          <SegmentedTabs
            ariaLabel={t('guides.tips.phase1')}
            tabs={subBossTabs}
            urlKey="boss"
            variant="boss"
          />
        ),
      });
    }
    if (cfg?.main || teamTabs.length) {
      phaseTabs.push({
        key: 'p2',
        label: t('guides.tips.phase2'),
        content: (
          <div className="space-y-6">
            {cfg?.main && <BossEncounters group={cfg.main} lang={lang} hideSpawnLabel compact />}
            <SegmentedTabs
              ariaLabel={t('guides.tips.phase2')}
              tabs={teamTabs}
              urlKey="team"
              variant="game"
            />
          </div>
        ),
      });
    }

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
        <div className="space-y-6">
          <SegmentedTabs
            ariaLabel={t('guides.strategy_guide')}
            tabs={phaseTabs}
            urlKey="phase"
            variant="game"
          />
          {cfg?.videos?.length ? (
            <section className="space-y-2">
              <h2 className="text-content-strong text-xl font-bold">
                {t('guides.combat_footage')}
              </h2>
              <MultiVideoEmbed byLabel={t('video.by')} videos={cfg.videos} />
            </section>
          ) : null}
        </div>
      ),
    };
  });

  return (
    <>
      <p className="text-content text-sm leading-relaxed">
        {parseText(lRec(strings.intro, lang), ctx)}
      </p>
      <GuideVersions versions={versions} label={t('page.guide.versions')} />
    </>
  );
}
