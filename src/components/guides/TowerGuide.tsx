/**
 * RENDU PARTAGÉ d'une tour (Skyward Tower) — les 8 guides `skyward-tower`.
 *
 * DEUX familles, deux façons de naviguer, un composant :
 *
 *   - STANDARD (normal / hard / élémentaires) : une suite d'ÉTAGES fixes. Le
 *     menu liste les étages, le détail montre le combat de l'étage
 *     (`BossEncounters`) + sa restriction fixe + l'éditorial de l'étage. On ne
 *     montre qu'un étage à la fois (sous-route `[floor]` statique).
 *
 *   - VERY HARD : la restriction ET le boss sont TIRÉS AU HASARD à chaque
 *     tentative — la notion d'étage n'a plus de sens. On navigue donc par
 *     COMBAT (les formations : un boss `type:boss` + ses adds), groupés comme le
 *     menu du jeu (Floor 20 / Demiurges / Random). Le détail montre Boss + adds
 *     (skills), les conseils, puis la ROSTER recommandée — écrite une seule fois
 *     et filtrée en direct par la restriction choisie (cf. `TowerCombatRoster`).
 *
 * La MÉCANIQUE (étages, combats, restrictions) vient de `towers.json` ;
 * l'ÉDITORIAL (conseils, recommandations, pool de raisons, disclaimer) de
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
import { getEncounter } from '@/lib/data/encounters';
import { getMonster, monsterIconSrc } from '@/lib/data/monsters';
import { findCharacterByName, characterDisplayName, slugForId } from '@/lib/data/characters';
import { BossEncounters } from './BossEncounters';
import { BossCard } from './BossPanel';
import { RecommendedCharacters } from './RecommendedCharacters';
import { TowerFloorMenu, type TowerMenuSection } from './TowerFloorMenu';
import { TowerAddsSelector } from './TowerAddsSelector';
import { TowerCombatRoster, type RosterGroup } from './TowerCombatRoster';

type Lang = GuideContentProps['lang'];
type LText = LocalizedText & { en: string };

/** Éditorial d'un étage standard (hard) — raisons INLINE (fichier petit). */
interface StandardEditorial {
  reason?: LText[];
  recommended?: { characters: string[]; reason?: LText }[];
}

/** Éditorial d'un combat very hard — raisons par CLÉ du dico `reasons`. */
interface VeryHardCombat {
  advice?: string[];
  recommended?: { characters: string[]; reason?: string }[];
}

/** `content.json` — l'éditorial, jamais la mécanique. */
interface TowerContent {
  disclaimer?: LText;
  /** Dico de raisons (very hard) : clé → texte localisé. */
  reasons?: Record<string, LText>;
  /** Éditorial par étage (standard), indexé par numéro d'étage. */
  floors?: Record<string, StandardEditorial>;
  /** Éditorial par combat (very hard), indexé par id de boss. */
  combats?: Record<string, VeryHardCombat>;
}

/** Nom d'affichage d'un monstre (repli EN). */
function monsterName(id: string, lang: Lang): string {
  const m = getMonster(id);
  return m ? lRec(m.name, lang) || m.name.en : id;
}

/** Le boss d'un donjon standard (rôle `boss`, sinon premier monstre). */
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

  const menu = (sections: TowerMenuSection[], currentKey: string) => (
    <div className="w-full shrink-0 md:w-72">
      <TowerFloorMenu
        sections={sections}
        currentKey={currentKey}
        searchPlaceholder={t('tower.search_placeholder')}
      />
    </div>
  );

  /* ── VERY HARD : navigation par combats ── */
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

    const combatEditorial = content?.combats?.[current.boss.id];
    const reason = (key: string): ReactNode => {
      const lt = content?.reasons?.[key];
      return lt ? parseText(lRec(lt, lang), ctx) : null;
    };

    const rosterGroups: RosterGroup[] = (combatEditorial?.recommended ?? []).map((g) => ({
      characters: g.characters.map((name) => {
        const c = findCharacterByName(name);
        if (!c) throw new Error(`TowerGuide (very hard) : personnage inconnu « ${name} ».`);
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

    return (
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        {menu(sections, current.boss.id)}
        <div className="min-w-0 flex-1 space-y-6">
          {content?.disclaimer && (
            <p className="border-accent/40 bg-accent/10 text-content rounded-lg border px-3 py-2 text-sm leading-relaxed">
              {parseText(lRec(content.disclaimer, lang), ctx)}
            </p>
          )}

          <section className="space-y-3">
            <h2 className="text-content-strong text-2xl font-bold">
              {monsterName(current.boss.id, lang)}
            </h2>
            <BossCard
              monsterId={current.boss.id}
              spawns={[{ level: current.boss.level }]}
              lang={lang}
              role="boss"
              compact
            />
          </section>

          {current.adds.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-content-strong text-lg font-bold">{t('tower.adds')}</h3>
              <TowerAddsSelector
                adds={current.adds
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

          {combatEditorial?.advice?.length ? (
            <section className="space-y-2">
              <h3 className="text-content-strong text-lg font-bold">{t('tower.strategy')}</h3>
              {combatEditorial.advice.map((key, i) => (
                <p key={i} className="text-content text-sm leading-relaxed">
                  {reason(key)}
                </p>
              ))}
            </section>
          ) : null}

          <TowerCombatRoster
            groups={rosterGroups}
            restrictable={current.group === 'random'}
            labels={{
              title: t('guides.recommended.title'),
              ban: t('tower.restr_ban'),
              force: t('tower.restr_force'),
              clear: t('tower.restr_clear'),
              element: t('tower.restr_element'),
              class: t('tower.restr_class'),
              star: t('tower.restr_star'),
            }}
          />
        </div>
      </div>
    );
  }

  /* ── STANDARD : navigation par étages ── */
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

  const editorial = content?.floors?.[String(current)];

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
            <p className="text-content-muted text-sm">
              {lRec(tower.debuff.desc, lang) || tower.debuff.desc.en}
            </p>
          </section>
        )}

        <BossEncounters dungeons={[floorData.dungeon]} lang={lang} />

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

        {editorial?.reason?.length ? (
          <section className="space-y-2">
            <h3 className="text-content-strong text-lg font-bold">{t('tower.strategy')}</h3>
            {editorial.reason.map((p, i) => (
              <p key={i} className="text-content text-sm leading-relaxed">
                {parseText(lRec(p, lang), ctx)}
              </p>
            ))}
          </section>
        ) : null}

        {editorial?.recommended?.length ? (
          <RecommendedCharacters
            title={t('guides.recommended.title')}
            lang={lang}
            groups={editorial.recommended.map((g) => ({
              characters: g.characters,
              reason: g.reason ? parseText(lRec(g.reason, lang), ctx) : undefined,
            }))}
          />
        ) : null}
      </div>
    </div>
  );
}
