/**
 * Liste des héros LIMITED (limited/seasonal/collab) et de leurs passages en
 * bannière — release et dernier rerun DÉRIVÉS de `recruit.json` (bannières à
 * pickup des tables du jeu), là où la V2 maintenait `data/banner.json` à la
 * main. Les persos tagués limited SANS bannière (unités d'event, ex. Ais
 * Wallenstein) sont affichés « event uniquement » au lieu d'une fausse date.
 *
 * Un rerun via bannière « Selection » (choisis un ancien limited) compte comme
 * n'importe quel passage : le perso était réellement obtenable à cette date.
 */
import Link from 'next/link';
import type { Route } from 'next';
import type { LocalizedText } from '@contracts';
import { LANGUAGES, type Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { localePath } from '@/lib/navigation';
import { characterDisplayName, getAllCharacters, slugForId } from '@/lib/data/characters';
import { bannersOf } from '@/lib/data/recruit';
import { CharacterPortrait } from '@/components/character/CharacterPortrait';

const LIMITED_TAGS = ['limited', 'seasonal', 'collab'] as const;
type LimitedTag = (typeof LIMITED_TAGS)[number];

const LABELS = {
  released: { en: 'Released:', jp: 'リリース:', kr: '출시:', zh: '发布:', fr: 'Sortie :' },
  lastRerun: {
    en: 'Last rerun:',
    jp: '最終復刻:',
    kr: '마지막 복각:',
    zh: '最近复刻:',
    fr: 'Dernier rerun :',
  },
  eventOnly: {
    en: 'Event reward only — never available on a banner',
    jp: 'イベント報酬限定 — バナーでの入手不可',
    kr: '이벤트 보상 한정 — 배너에서 획득 불가',
    zh: '仅限活动奖励 — 从未在卡池中出现',
    fr: "Récompense d'event uniquement — jamais disponible en banner",
  },
  with: { en: ' with ', jp: ' × ', kr: ' × ', zh: ' × ', fr: ' avec ' },
  // Libellés V2 (data/tags.json) — le tag `limited` s'affiche « Festival ».
  badgeLimited: {
    en: 'Festival Units',
    jp: 'フェスユニット',
    kr: '페스티벌 유닛',
    zh: '限定单位',
    fr: 'Festival Units',
  },
  badgeSeasonal: {
    en: 'Seasonal Units',
    jp: '季節限定ユニット',
    kr: '시즌 유닛',
    zh: '季节单位',
    fr: 'Seasonal Units',
  },
  badgeCollab: {
    en: 'Collab Units',
    jp: 'コラボユニット',
    kr: '콜라보 유닛',
    zh: '联动单位',
    fr: 'Collab Units',
  },
} satisfies Record<string, LocalizedText>;

const BADGE_LABEL: Record<LimitedTag, LocalizedText> = {
  limited: LABELS.badgeLimited,
  seasonal: LABELS.badgeSeasonal,
  collab: LABELS.badgeCollab,
};

const BADGE_TEXT: Record<LimitedTag, string> = {
  limited: 'text-pink-400',
  seasonal: 'text-emerald-400',
  collab: 'text-rose-400',
};

function formatDate(iso: string, lang: Lang): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(LANGUAGES[lang].htmlLang, {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    timeZone: 'UTC',
  });
}

export function LimitedHeroesList({
  lang,
  collabNames,
}: {
  lang: Lang;
  /** Licence d'origine des persos collab (id → nom), éditorial. */
  collabNames?: Record<string, string>;
}) {
  const heroes = getAllCharacters()
    .map((c) => {
      const tag = LIMITED_TAGS.find((t) => c.tags?.includes(t));
      if (!tag) return undefined;
      const apps = bannersOf(c.id);
      const release = apps[0]?.start;
      const last = apps[apps.length - 1];
      return {
        character: c,
        tag,
        release,
        lastRerun: apps.length > 1 ? last : undefined,
        sortKey: last?.start ?? '0000',
      };
    })
    .filter((h) => h !== undefined)
    // Le plus récent passage d'abord ; les « event only » (sans date) ferment.
    .sort((a, b) => b.sortKey.localeCompare(a.sortKey));

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {heroes.map(({ character: c, tag, release, lastRerun }) => {
        const name = characterDisplayName(c, lang);
        const slug = slugForId(c.id);
        const href = slug ? (localePath(lang, `/characters/${slug}`) as Route) : undefined;
        const collab = collabNames?.[c.id];
        const body = (
          <>
            {/* CharacterPortrait s'étire (w-full) : on le borne à sa taille pour
                que le texte colle au portrait. */}
            <span className="w-16 shrink-0">
              <CharacterPortrait id={c.id} name={name} size={64} showName={false} />
            </span>
            <span className="flex flex-col">
              <span className="text-content-strong font-medium">{name}</span>
              <span className="text-sm">
                <strong className={BADGE_TEXT[tag]}>{lRec(BADGE_LABEL[tag], lang)}</strong>
                {collab && (
                  <span className="text-content-muted">
                    {lRec(LABELS.with, lang)}
                    {collab}
                  </span>
                )}
              </span>
              {release ? (
                <span className="text-content-subtle text-xs">
                  {lRec(LABELS.released, lang)} {formatDate(release, lang)}
                </span>
              ) : (
                <span className="text-warn/80 text-xs">{lRec(LABELS.eventOnly, lang)}</span>
              )}
              {lastRerun && (
                <span className="text-content-subtle text-xs">
                  {lRec(LABELS.lastRerun, lang)} {formatDate(lastRerun.start, lang)}
                </span>
              )}
            </span>
          </>
        );
        const className =
          'bg-surface-raised/50 hover:bg-surface-overlay/60 flex items-center gap-3 rounded-lg p-2 transition-colors';
        return href ? (
          <Link key={c.id} href={href} className={className}>
            {body}
          </Link>
        ) : (
          <div key={c.id} className={className}>
            {body}
          </div>
        );
      })}
    </div>
  );
}
