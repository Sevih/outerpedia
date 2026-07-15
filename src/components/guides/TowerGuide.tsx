/**
 * RENDU PARTAGÉ d'une tour (Skyward Tower) — les 8 guides `skyward-tower`.
 *
 * Une tour est une SUITE D'ÉTAGES, chacun son propre combat. Le guide ne montre
 * qu'UN étage à la fois — celui de l'URL (`.../fire-tower/35`, sous-route `[floor]`
 * pré-générée) — pour ne pas empiler cent panneaux de boss dans une seule page.
 * La colonne de gauche (`TowerFloorMenu`) est un simple jeu de LIENS vers les
 * autres étages ; c'est la seule part cliente, tout le détail est rendu serveur.
 *
 * TROIS familles, un seul composant :
 *   - difficulté / élémentaire : étages FIXES, boss réel par étage
 *     (`BossEncounters` sur le donjon de l'étage) ;
 *   - very hard : la plupart des étages sont TIRÉS AU HASARD (`floor.randomized`) —
 *     on ne peut pas montrer un boss garanti, on montre le MENU (le pool
 *     éditorial `content.pool`) et le disclaimer ; les paliers fixes (5/10/15/20)
 *     retombent sur le rendu normal.
 *
 * La MÉCANIQUE (étages, donjons, restrictions) vient de `data/generated/towers.json` ;
 * l'ÉDITORIAL (recommandations, conseils, pool, disclaimer) de `content.json`.
 * Les identifiants ne se traduisent jamais : le donjon d'un étage EST une clé
 * d'`encounters.json`, un boss du pool EST un donjon, un perso recommandé EST un
 * nom résolu par `RecommendedCharacters`.
 */
import { notFound } from 'next/navigation';
import type { LocalizedText, Tower } from '@contracts';
import { getT } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import { parseText, type ParseCtx } from '@/lib/parse-text';
import { localePath } from '@/lib/navigation';
import { readGuideFile, type GuideContentProps } from '@/lib/data/guides';
import { getTower, getTowerFloor, formatRestriction, TOWER_ELEMENT_MODE } from '@/lib/data/towers';
import { getEncounter } from '@/lib/data/encounters';
import { getMonster } from '@/lib/data/monsters';
import { BossEncounters } from './BossEncounters';
import { RecommendedCharacters } from './RecommendedCharacters';
import { TowerFloorMenu, type TowerMenuItem } from './TowerFloorMenu';

type LText = LocalizedText & { en: string };

/** L'éditorial d'un étage (ou d'une entrée de pool) — porté par `content.json`. */
interface TowerEditorial {
  /** Conseils libres (paragraphes, tokens résolus par parseText). */
  reason?: LText[];
  /** Personnages recommandés : noms d'affichage EN (cf. RecommendedCharacters). */
  recommended?: { characters: string[]; reason?: LText }[];
}

/** Une entrée du pool very hard : un boss (= son DONJON) + son éditorial. */
type TowerPoolEntry = TowerEditorial & { boss: string };

/** `content.json` d'un guide de tour — l'éditorial, jamais la mécanique. */
interface TowerContent {
  /** Very hard : l'avertissement sur la randomisation du mode. */
  disclaimer?: LText;
  /** Éditorial par étage, indexé par numéro d'étage (chaîne). */
  floors?: Record<string, TowerEditorial>;
  /** Very hard : le menu de boss possibles. */
  pool?: TowerPoolEntry[];
}

/** Nom d'affichage d'un monstre (repli EN), ou `undefined` si inconnu. */
function monsterName(id: string, lang: GuideContentProps['lang']): string | undefined {
  const m = getMonster(id);
  if (!m) return undefined;
  return lRec(m.name, lang) || m.name.en;
}

/** Le boss d'un donjon (rôle `boss`, sinon le premier monstre). */
function dungeonBossName(dungeon: string, lang: GuideContentProps['lang']): string | undefined {
  const monsters = getEncounter(dungeon)?.monsters;
  if (!monsters?.length) return undefined;
  const boss = monsters.find((m) => m.role === 'boss') ?? monsters[0];
  return monsterName(boss.id, lang);
}

export async function TowerGuide({ lang, guide, floor }: GuideContentProps & { floor?: number }) {
  const t = await getT(lang);
  const ctx: ParseCtx = { lang, t, strict: true };

  const key = guide.tower;
  const tower: Tower | undefined = key ? getTower(key) : undefined;
  if (!tower) {
    throw new Error(
      `TowerGuide : « ${guide.category}/${guide.slug} » sans \`tower\` valide ` +
        `(meta.tower = ${String(key)}).`,
    );
  }

  const isVH = tower.mode === 'tower_very_hard';
  const isElement = tower.mode === TOWER_ELEMENT_MODE;
  const content = readGuideFile<TowerContent>(guide, 'content.json');

  // Étage courant : celui de l'URL, sinon le premier (l'étage 1).
  const current = floor ?? tower.floors[0]?.floor ?? 1;
  const floorData = getTowerFloor(tower, current);
  if (!floorData) notFound();

  // Menu : un lien par étage, boss résolu au build.
  const items: TowerMenuItem[] = tower.floors.map((f) => ({
    floor: f.floor,
    href: localePath(lang, `/guides/${guide.category}/${guide.slug}/${f.floor}`),
    boss: dungeonBossName(f.dungeon, lang),
    restricted: f.restrictions.length > 0 || Boolean(f.randomized),
  }));

  /** Un bloc éditorial (conseils + recommandations), rien si vide. */
  const renderEditorial = (ed: TowerEditorial | undefined, keyHint: string) => {
    if (!ed?.reason?.length && !ed?.recommended?.length) return null;
    return (
      <div key={keyHint} className="space-y-4">
        {ed.reason?.length ? (
          <section className="space-y-2">
            <h3 className="text-content-strong text-lg font-bold">{t('tower.strategy')}</h3>
            {ed.reason.map((p, i) => (
              <p key={i} className="text-content text-sm leading-relaxed">
                {parseText(lRec(p, lang), ctx)}
              </p>
            ))}
          </section>
        ) : null}
        {ed.recommended?.length ? (
          <RecommendedCharacters
            title={t('guides.recommended.title')}
            lang={lang}
            groups={ed.recommended.map((g) => ({
              characters: g.characters,
              reason: g.reason ? parseText(lRec(g.reason, lang), ctx) : undefined,
            }))}
          />
        ) : null}
      </div>
    );
  };

  const renderBoss = (dungeon: string) => <BossEncounters dungeons={[dungeon]} lang={lang} />;

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start">
      {/* Colonne gauche — sélecteur d'étage */}
      <div className="w-full shrink-0 md:w-72">
        <TowerFloorMenu
          items={items}
          current={current}
          searchPlaceholder={t('tower.search_placeholder')}
        />
      </div>

      {/* Colonne droite — détail de l'étage courant */}
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

        {/* Debuff de tour élémentaire (constant sur toute la tour). */}
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

        {/* Disclaimer very hard. */}
        {isVH && content?.disclaimer && (
          <p className="border-accent/40 bg-accent/10 text-content rounded-lg border px-3 py-2 text-sm leading-relaxed">
            {parseText(lRec(content.disclaimer, lang), ctx)}
          </p>
        )}

        {/* Restrictions fixes de l'étage. */}
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

        {isVH && floorData.randomized ? (
          /* Étage tiré au hasard : pas de boss garanti → menu (pool) + conditions
             possibles. Le disclaimer au-dessus explique la randomisation. */
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-content-strong text-lg font-bold">{t('tower.random_floor')}</h3>
              {tower.restrictionsPool?.length ? (
                <ul className="space-y-1">
                  {tower.restrictionsPool.map((r, i) => (
                    <li key={i} className="text-content-muted flex items-start gap-2 text-sm">
                      <span className="bg-content-muted/50 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
                      {formatRestriction(r, lang)}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            {content?.pool?.length ? (
              <section className="space-y-6">
                <h3 className="text-content-strong text-lg font-bold">{t('tower.pool')}</h3>
                {content.pool.map((entry, i) => (
                  <div
                    key={i}
                    className="border-line-subtle space-y-4 border-t pt-6 first:border-t-0 first:pt-0"
                  >
                    {renderBoss(entry.boss)}
                    {renderEditorial(entry, `pool-${i}`)}
                  </div>
                ))}
              </section>
            ) : null}
          </div>
        ) : (
          <div className="space-y-6">
            {renderBoss(floorData.dungeon)}
            {renderEditorial(content?.floors?.[String(current)], `floor-${current}`)}
          </div>
        )}
      </div>
    </div>
  );
}
