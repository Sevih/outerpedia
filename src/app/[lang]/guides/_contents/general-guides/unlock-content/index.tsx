/**
 * Guide « Unlocking Content » — table de déblocage de la progression Story.
 *
 * Server Component : les conditions (stages, noms de donjons, noms de modes)
 * viennent de `data/generated/unlock-content.json` et se mettent à jour avec
 * les données du jeu ; seules les descriptions (notes.ts) sont éditoriales.
 */
import type { LocalizedText, UnlockRequirement } from '@contracts';
import type { Lang } from '@/lib/i18n/config';
import { getT } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import { parseText, type ParseCtx } from '@/lib/parse-text';
import { getUnlockEntry } from '@/lib/data/unlock-content';
import { CATEGORIES, CATEGORY_LABELS, ENTRIES, type Category, type GuideEntry } from './notes';

const LABELS = {
  intro: {
    en: 'Many features in OUTERPLANE are not available right away. Below is a categorized overview of when each mode unlocks during the story. Conditions are sourced from the game data and update automatically.',
    jp: 'OUTERPLANEの多くの機能は最初から利用できるわけではありません。以下は各モードがストーリー進行中にいつ解放されるかをカテゴリー別にまとめた一覧です。解放条件はゲームデータから取得され、自動更新されます。',
    kr: 'OUTERPLANE의 많은 기능은 처음부터 사용할 수 없습니다. 아래는 각 모드가 스토리 진행 중 언제 해금되는지 카테고리별로 정리한 표입니다. 해금 조건은 게임 데이터에서 가져오며 자동으로 갱신됩니다.',
    zh: 'OUTERPLANE的许多功能并非一开始就可用。下方按类别概览各模式在故事进程中的解锁时间。解锁条件来自游戏数据并自动更新。',
    fr: "De nombreuses fonctionnalités d'OUTERPLANE ne sont pas disponibles d'emblée. Voici un aperçu par catégorie du moment où chaque mode se débloque pendant la Story. Les conditions proviennent des data du jeu et se mettent à jour automatiquement.",
  },
  headerMode: {
    en: 'Game Mode',
    jp: 'ゲームモード',
    kr: '게임 모드',
    zh: '游戏模式',
    fr: 'Mode de Jeu',
  },
  headerCondition: {
    en: 'Unlock Condition',
    jp: '解放条件',
    kr: '해금 조건',
    zh: '解锁条件',
    fr: 'Condition de Déblocage',
  },
  headerDescription: {
    en: 'Description',
    jp: '説明',
    kr: '설명',
    zh: '描述',
    fr: 'Description',
  },
  orSeparator: { en: 'or', jp: 'または', kr: '또는', zh: '或', fr: 'ou' },
} satisfies Record<string, LocalizedText>;

// --- résolution données ↔ éditorial -----------------------------------------

type ResolvedReq = { stage: string; dungeonName: LocalizedText };

function requirementsOf(entry: GuideEntry): ResolvedReq[] {
  if (entry.source === 'manual') {
    return [{ stage: entry.stage, dungeonName: entry.dungeonName }];
  }
  const auto = getUnlockEntry(entry.contentType);
  // ContentType inconnu des données = faute de frappe éditoriale → le build
  // casse. Une entrée CONNUE sans stage résolvable reste un « ? » légitime
  // (condition interne du jeu — la customNote porte alors la condition).
  if (!auto) {
    throw new Error(`unlock-content : ContentType inconnu « ${entry.contentType} » (notes.ts)`);
  }
  if (auto.requirements.length === 0) {
    return [{ stage: '?', dungeonName: { en: '?' } }];
  }
  return auto.requirements.map((r: UnlockRequirement) => ({
    stage: r.stage ?? '?',
    dungeonName: r.dungeonName ?? { en: '?' },
  }));
}

/** Nom de mode : éditorial → lockScreenName → officialName → contentType. */
function modeNameOf(entry: GuideEntry): LocalizedText {
  if (entry.source === 'manual') return entry.modeName;
  if (entry.modeName) return entry.modeName;
  const auto = getUnlockEntry(entry.contentType);
  return auto?.lockScreenName ?? auto?.officialName ?? { en: entry.contentType };
}

// --- tri par stage (« S<saison>[H]-<épisode>-<stage> ») ----------------------

function parseStage(stage: string): [number, number, number, number] {
  const m = stage.match(/^S(\d+)(H?)-(\d+)-(\d+)/);
  if (!m) return [999, 999, 999, 999];
  return [parseInt(m[1], 10), m[2] === 'H' ? 1 : 0, parseInt(m[3], 10), parseInt(m[4], 10)];
}

function compareEntries(a: GuideEntry, b: GuideEntry): number {
  const sa = parseStage(requirementsOf(a)[0]?.stage ?? '?');
  const sb = parseStage(requirementsOf(b)[0]?.stage ?? '?');
  for (let i = 0; i < 4; i++) if (sa[i] !== sb[i]) return sa[i] - sb[i];
  return 0;
}

const entryKey = (e: GuideEntry): string =>
  e.source === 'auto' ? `auto:${e.contentType}` : `manual:${e.slug}`;

// --- rendu -------------------------------------------------------------------

function CategoryTable({
  category,
  entries,
  lang,
  ctx,
}: {
  category: Category;
  entries: GuideEntry[];
  lang: Lang;
  ctx: ParseCtx;
}) {
  const sorted = [...entries].sort(compareEntries);
  const or = lRec(LABELS.orSeparator, lang);
  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold">{lRec(CATEGORY_LABELS[category], lang)}</h2>
      <div className="w-full overflow-x-auto">
        <table className="border-line w-full rounded-md border text-center text-sm">
          <thead className="bg-surface-raised">
            <tr>
              <th className="border-line w-1/4 border px-3 py-2">
                {lRec(LABELS.headerMode, lang)}
              </th>
              <th className="border-line w-1/3 border px-3 py-2">
                {lRec(LABELS.headerCondition, lang)}
              </th>
              <th className="border-line border px-3 py-2">
                {lRec(LABELS.headerDescription, lang)}
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((entry) => {
              const reqs = requirementsOf(entry);
              // Un « ? : ? » non résolu est masqué quand la customNote porte
              // déjà la condition (elle devient la condition principale).
              const shown = entry.customNote ? reqs.filter((r) => r.stage !== '?') : reqs;
              return (
                <tr key={entryKey(entry)}>
                  <td className="border-line border px-3 py-2 text-left align-top">
                    {lRec(modeNameOf(entry), lang)}
                  </td>
                  <td className="border-line border px-3 py-2 align-top">
                    {shown.map((r, i) => (
                      <div key={i} className={i > 0 ? 'mt-1' : undefined}>
                        {i > 0 && <span className="text-content-muted mr-1 text-xs">{or}</span>}
                        <span className="font-mono">{r.stage}</span> : {lRec(r.dungeonName, lang)}
                      </div>
                    ))}
                    {entry.customNote && (
                      <div className={shown.length > 0 ? 'text-warn/80 mt-1 text-xs' : undefined}>
                        {parseText(lRec(entry.customNote, lang), ctx)}
                      </div>
                    )}
                  </td>
                  <td className="border-line border px-3 py-2 text-left align-top">
                    {parseText(lRec(entry.description, lang), ctx)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default async function UnlockContentGuide({ lang }: { lang: Lang }) {
  const t = await getT(lang);
  // Strict : une référence de contenu inconnue casse le build (pas de rouge).
  const ctx: ParseCtx = { lang, t, strict: true };

  const grouped: Record<Category, GuideEntry[]> = { gamemodes: [], character: [], base: [] };
  for (const e of ENTRIES) grouped[e.category].push(e);

  return (
    <>
      <p className="text-content text-sm leading-relaxed">{lRec(LABELS.intro, lang)}</p>
      {CATEGORIES.map((cat) =>
        grouped[cat].length > 0 ? (
          <CategoryTable key={cat} category={cat} entries={grouped[cat]} lang={lang} ctx={ctx} />
        ) : null,
      )}
    </>
  );
}
