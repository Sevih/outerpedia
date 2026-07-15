/**
 * RENDU PARTAGÉ d'une tour (Skyward Tower) — les 8 guides `skyward-tower`.
 *
 * DEUX familles, deux façons de naviguer, UN rendu :
 *
 *   - STANDARD (normal / hard / élémentaires) : une suite d'ÉTAGES fixes. Le
 *     menu liste les étages ; le détail montre le combat de l'étage (boss +
 *     adds en cartes COMPACTES), sa restriction FIXE, puis l'éditorial. On ne
 *     montre qu'un étage à la fois (sous-route `[floor]`).
 *
 *   - VERY HARD : la restriction ET le boss sont TIRÉS AU HASARD à chaque
 *     tentative — la notion d'étage n'a plus de sens. On navigue donc par
 *     COMBAT (les formations : un boss + ses adds), groupés comme le menu du
 *     jeu (Floor 20 / Demiurges / Random), et la roster se filtre en direct par
 *     la restriction choisie (cf. `TowerCombatRoster`).
 *
 * La SEULE différence de rendu est là : le very hard filtre sa roster (aléa des
 * restrictions), le standard l'affiche telle quelle (restriction fixe). Tout le
 * reste — menu, boss/adds compacts, dico de raisons, advice, roster — est
 * COMMUN et factorisé ci-dessous.
 *
 * La MÉCANIQUE (étages, combats, restrictions) vient de `towers.json` ;
 * l'ÉDITORIAL (advice, recommandations, dico de raisons, disclaimer) de
 * `content.json`. Aucun identifiant ne se fabrique.
 */
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import type { LocalizedText } from '@contracts';
import { getT } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import { parseText, type ParseCtx } from '@/lib/parse-text';
import { localePath } from '@/lib/navigation';
import { readGuideFile, type GuideContentProps } from '@/lib/data/guides';
import {
  getTower,
  getTowerFloor,
  getTowerCombats,
  formatRestriction,
  TOWER_ELEMENT_MODE,
  type TowerCombatGroup,
} from '@/lib/data/towers';
import { getEncounter, bossWaveMonsters } from '@/lib/data/encounters';
import { getMonster, monsterIconSrc } from '@/lib/data/monsters';
import { findCharacterByName, characterDisplayName, slugForId } from '@/lib/data/characters';
import { renderGameText } from '@/components/inline/GameTokens';
import { BossCard } from './BossPanel';
import { TowerFloorMenu, type TowerMenuSection } from './TowerFloorMenu';
import { TowerAddsSelector } from './TowerAddsSelector';
import { TowerCombatRoster, type RosterGroup } from './TowerCombatRoster';

type Lang = GuideContentProps['lang'];
type LText = LocalizedText & { en: string };

/** Un groupe recommandé : des persos + la CLÉ de sa raison (dico `reasons`). */
interface RecommendedGroup {
  characters: string[];
  reason?: string;
}

/**
 * Éditorial d'un étage (standard) OU d'un combat (very hard) — MÊME forme : des
 * conseils et des groupes recommandés, tous exprimés par CLÉ du dico `reasons`.
 */
interface TowerEditorial {
  advice?: string[];
  recommended?: RecommendedGroup[];
}

/** `content.json` — l'éditorial, jamais la mécanique. */
interface TowerContent {
  disclaimer?: LText;
  /** Dico de raisons : clé → texte localisé (partagé par tous les étages/combats). */
  reasons?: Record<string, LText>;
  /** Éditorial par étage (standard), indexé par numéro d'étage. */
  floors?: Record<string, TowerEditorial>;
  /** Éditorial par combat (very hard), indexé par id de boss. */
  combats?: Record<string, TowerEditorial>;
}

/** Une unité affichable en carte compacte : de quoi la nommer et la calculer. */
interface CombatUnit {
  id: string;
  level: number;
}

/** Nom d'affichage d'un monstre (repli EN). */
function monsterName(id: string, lang: Lang): string {
  const m = getMonster(id);
  return m ? lRec(m.name, lang) || m.name.en : id;
}

/** Le boss d'un donjon standard (rôle `boss`, sinon premier monstre) — pour le menu. */
function dungeonBossName(dungeon: string, lang: Lang): string | undefined {
  const monsters = getEncounter(dungeon)?.monsters;
  if (!monsters?.length) return undefined;
  const boss = monsters.find((m) => m.role === 'boss') ?? monsters[0];
  return monsterName(boss.id, lang);
}

export async function TowerGuide({ lang, guide, floor }: GuideContentProps & { floor?: number }) {
  const t = await getT(lang);
  const ctx: ParseCtx = { lang, t, strict: true };

  const tower = guide.tower ? getTower(guide.tower) : undefined;
  if (!tower) {
    throw new Error(
      `TowerGuide : « ${guide.category}/${guide.slug} » sans \`tower\` valide ` +
        `(meta.tower = ${String(guide.tower)}).`,
    );
  }
  const content = readGuideFile<TowerContent>(guide, 'content.json');
  const detailHref = (key: string | number) =>
    localePath(lang, `/guides/${guide.category}/${guide.slug}/${key}`);

  /* ── Briques COMMUNES aux deux familles ── */

  const menu = (sections: TowerMenuSection[], currentKey: string) => (
    <div className="w-full shrink-0 md:w-72">
      <TowerFloorMenu
        sections={sections}
        currentKey={currentKey}
        searchPlaceholder={t('tower.search_placeholder')}
      />
    </div>
  );

  /** Une raison, résolue depuis le dico et parsée (tokens `{P/…}`, `{B/…}`…). */
  const reason = (key: string): ReactNode => {
    const lt = content?.reasons?.[key];
    return lt ? parseText(lRec(lt, lang), ctx) : null;
  };

  /** Un `recommended` éditorial → groupes de roster (persos résolus par nom). */
  const buildRoster = (recommended: readonly RecommendedGroup[] = []): RosterGroup[] =>
    recommended.map((g) => ({
      characters: g.characters.map((name) => {
        const c = findCharacterByName(name);
        if (!c) {
          throw new Error(
            `TowerGuide : personnage inconnu « ${name} » (${guide.category}/${guide.slug}).`,
          );
        }
        const slug = slugForId(c.id);
        return {
          id: c.id,
          name: characterDisplayName(c, lang),
          element: c.element,
          classType: c.class,
          rarity: c.rarity,
          href: slug ? localePath(lang, `/characters/${slug}`) : undefined,
        };
      }),
      reason: g.reason ? reason(g.reason) : undefined,
    }));

  /** La vue d'un combat : le boss en carte compacte, puis ses adds au sélecteur. */
  const combatView = (boss: CombatUnit, adds: readonly CombatUnit[]) => (
    <>
      <section className="space-y-3">
        <h2 className="text-content-strong text-2xl font-bold">{monsterName(boss.id, lang)}</h2>
        <BossCard
          monsterId={boss.id}
          spawns={[{ level: boss.level }]}
          lang={lang}
          role="boss"
          compact
        />
      </section>

      {adds.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-content-strong text-lg font-bold">{t('tower.adds')}</h3>
          <TowerAddsSelector
            adds={adds
              // Une formation peut aligner plusieurs exemplaires du MÊME add
              // (« Maxwell ×3 ») : un seul suffit au guide (carte identique).
              .filter((a, i, arr) => arr.findIndex((x) => x.id === a.id) === i)
              .map((a) => {
                const m = getMonster(a.id);
                return {
                  id: a.id,
                  name: monsterName(a.id, lang),
                  iconSrc: m ? monsterIconSrc(m) : undefined,
                  card: (
                    <BossCard
                      monsterId={a.id}
                      spawns={[{ level: a.level }]}
                      lang={lang}
                      role="add"
                      compact
                    />
                  ),
                };
              })}
          />
        </section>
      )}
    </>
  );

  /** Le bloc « stratégie » (advice = liste de clés de raisons). */
  const adviceSection = (editorial: TowerEditorial | undefined) =>
    editorial?.advice?.length ? (
      <section className="space-y-2">
        <h3 className="text-content-strong text-lg font-bold">{t('tower.strategy')}</h3>
        {editorial.advice.map((key, i) => (
          <p key={i} className="text-content text-sm leading-relaxed">
            {reason(key)}
          </p>
        ))}
      </section>
    ) : null;

  const rosterLabels = {
    title: t('guides.recommended.title'),
    ban: t('tower.restr_ban'),
    force: t('tower.restr_force'),
    clear: t('tower.restr_clear'),
    element: t('tower.restr_element'),
    class: t('tower.restr_class'),
    star: t('tower.restr_star'),
  };

  /* ── VERY HARD : navigation par combats, roster FILTRABLE (aléa) ── */
  if (tower.mode === 'tower_very_hard') {
    const combats = getTowerCombats(tower);
    const current = combats.find((c) => c.boss.id === String(floor ?? '')) ?? combats[0];
    if (!current) notFound();

    const groupTitle: Record<TowerCombatGroup, string> = {
      floor20: t('tower.group_floor20'),
      demiurge: t('tower.group_demiurge'),
      random: t('tower.group_random'),
    };
    const sections: TowerMenuSection[] = (['floor20', 'demiurge', 'random'] as const)
      .map((g) => ({
        title: groupTitle[g],
        entries: combats
          .filter((c) => c.group === g)
          .map((c) => {
            const m = getMonster(c.boss.id);
            return {
              key: c.boss.id,
              href: detailHref(c.boss.id),
              label: monsterName(c.boss.id, lang),
              portraitSrc: m ? monsterIconSrc(m) : undefined,
              element: m?.element,
              classType: m?.class,
            };
          }),
      }))
      .filter((s) => s.entries.length > 0);

    const editorial = content?.combats?.[current.boss.id];

    return (
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        {menu(sections, current.boss.id)}
        <div className="min-w-0 flex-1 space-y-6">
          {content?.disclaimer && (
            <p className="border-accent/40 bg-accent/10 text-content rounded-lg border px-3 py-2 text-sm leading-relaxed">
              {parseText(lRec(content.disclaimer, lang), ctx)}
            </p>
          )}

          {combatView(current.boss, current.adds)}
          {adviceSection(editorial)}

          <TowerCombatRoster
            groups={buildRoster(editorial?.recommended)}
            // Seul le pool aléatoire porte l'incertitude de restriction : c'est
            // là que le filtre a du sens (Floor 20 / Demiurges sont fixes).
            restrictable={current.group === 'random'}
            labels={rosterLabels}
          />
        </div>
      </div>
    );
  }

  /* ── STANDARD : navigation par étages, restriction FIXE (roster non filtré) ── */
  const isElement = tower.mode === TOWER_ELEMENT_MODE;
  const current = floor ?? tower.floors[0]?.floor ?? 1;
  const floorData = getTowerFloor(tower, current);
  if (!floorData) notFound();

  const sections: TowerMenuSection[] = [
    {
      entries: tower.floors.map((f) => ({
        key: String(f.floor),
        href: detailHref(f.floor),
        label: dungeonBossName(f.dungeon, lang) ?? '',
        number: f.floor,
        flag: f.restrictions.length > 0,
      })),
    },
  ];

  // Boss + adds de l'étage : la vague du boss de son donjon (boss d'abord).
  const ref = getEncounter(floorData.dungeon);
  const wave = ref?.monsters?.length
    ? bossWaveMonsters({ id: floorData.dungeon, ref, monsters: ref.monsters })
    : [];
  const boss = wave.find((m) => m.role === 'boss') ?? wave[0];
  const adds = boss ? wave.filter((m) => m !== boss) : [];

  const editorial = content?.floors?.[String(current)];
  const roster = buildRoster(editorial?.recommended);

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start">
      {menu(sections, String(current))}
      <div className="min-w-0 flex-1 space-y-6">
        <header className="space-y-1">
          <h2 className="text-content-strong text-2xl font-bold">
            {t('tower.floor', { n: current })}
          </h2>
          {(floorData.power || floorData.level) && (
            <p className="text-content-muted text-sm">
              {floorData.level ? t('tower.level', { n: floorData.level }) : ''}
              {floorData.level && floorData.power ? ' · ' : ''}
              {floorData.power ? t('tower.power', { n: floorData.power.toLocaleString() }) : ''}
            </p>
          )}
        </header>

        {isElement && tower.debuff && (
          <section className="border-line-subtle bg-surface-raised space-y-1 rounded-lg border p-3">
            <h3 className="text-content-strong text-sm font-bold">
              {lRec(tower.debuff.title, lang) || tower.debuff.title.en}
            </h3>
            {/* `desc` est du TEXTE DE JEU brut : `\n` littéraux, mentions
                d'élément/classe (enrichies en icônes) et balises `<color=…>`.
                On garde l'enrichissement mais on RETIRE la couleur du jeu — son
                bleu (`#0e7ecc`) suppose le fond du jeu et tombe illisible sur
                notre surface marine ; le texte reprend notre couleur lisible. */}
            <p className="text-content-muted text-sm whitespace-pre-line">
              {renderGameText(
                (lRec(tower.debuff.desc, lang) || tower.debuff.desc.en)
                  .replace(/\\n/g, '\n')
                  .replace(/<\/?color[^>]*>/gi, ''),
                lang,
              )}
            </p>
          </section>
        )}

        {boss && combatView(boss, adds)}

        {floorData.restrictions.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-content-strong text-lg font-bold">{t('tower.restrictions')}</h3>
            <ul className="space-y-1">
              {floorData.restrictions.map((r, i) => (
                <li key={i} className="text-content flex items-start gap-2 text-sm">
                  <span className="bg-accent/70 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
                  {formatRestriction(r, lang)}
                </li>
              ))}
            </ul>
          </section>
        )}

        {adviceSection(editorial)}

        {roster.length > 0 && (
          <TowerCombatRoster groups={roster} restrictable={false} labels={rosterLabels} />
        )}
      </div>
    </div>
  );
}
