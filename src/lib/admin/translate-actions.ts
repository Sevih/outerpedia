'use server';

/**
 * Server action d'AUTO-TRADUCTION éditoriale (admin) : traduit une prose EN vers
 * les langues du site en PRÉSERVANT les fragments à ne jamais traduire — tags
 * inline `{…}` (déjà localisés au rendu par `parse-text`), balises
 * `<color=…>`/`</color>` et sauts de ligne `\n`.
 *
 * Deux moteurs, bascule automatique :
 *   1. DeepL (primaire) — quota gratuit « Developer » (1 M caractères one-shot).
 *   2. Claude Haiku (fallback) — quand DeepL renvoie 456 (quota épuisé).
 * On brûle le gratuit d'abord ; le jour où il est vide, ça continue en Haiku
 * (centimes) sans intervention. `provider` indique lequel a servi.
 *
 * Correctness : les tags portent une clé EN et sont re-localisés par `parseText`
 * (le JP voit le nom JP d'Alice). On ne les traduit donc PAS : on les extrait, on
 * traduit la prose seule, on réinsère. DeepL utilise son mode XML `ignore_tags`
 * (robuste) ; Haiku reçoit des marqueurs `⟦n⟧` qu'on lui demande de préserver.
 *
 * Garde `IS_DEV` : outil local. Clés `DEEPL_API_KEY` / `ANTHROPIC_API_KEY`
 * (env / SOPS).
 */
import { type Lang } from '@/lib/i18n/config';
import { IS_DEV } from '@/lib/admin/guard';

type Target = Exclude<Lang, 'en'>;
type Translations = Partial<Record<Lang, string>>;

// Fragments préservés LITTÉRALEMENT : tags inline complets + balises couleur
// (ouvrante/fermante). Le TEXTE entre `<color>` et `</color>` est, lui, traduit.
const PROTECT = /\{[^}]+\}|<\/?color[^>]*>/gi;

// --- DeepL ---------------------------------------------------------------------

const DEEPL_LANG: Record<Target, string> = { jp: 'JA', kr: 'KO', zh: 'ZH', fr: 'FR' };

class DeeplQuotaError extends Error {}

const xmlEscape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const xmlUnescape = (s: string) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');

/**
 * Construit le payload XML DeepL en un passage : la prose est échappée XML, chaque
 * fragment protégé devient une balise `<x>i</x>` (ignorée par DeepL). Pas de
 * marqueur intermédiaire → aucune collision possible avec les chiffres de la prose.
 */
function toDeeplXml(text: string): { xml: string; tokens: string[] } {
  const tokens: string[] = [];
  let xml = '';
  let last = 0;
  for (const m of text.matchAll(PROTECT)) {
    const at = m.index ?? 0;
    if (at > last) xml += xmlEscape(text.slice(last, at));
    const i = tokens.length;
    tokens.push(m[0]);
    xml += `<x>${i}</x>`;
    last = at + m[0].length;
  }
  if (last < text.length) xml += xmlEscape(text.slice(last));
  return { xml, tokens };
}

async function translateDeepL(
  texts: string[],
  tgt: Target[],
  key: string,
): Promise<Translations[]> {
  const host = key.endsWith(':fx') ? 'https://api-free.deepl.com' : 'https://api.deepl.com';
  const prepared = texts.map(toDeeplXml);
  const results: Translations[] = texts.map(() => ({}));

  // Un appel par langue cible (DeepL ne traduit que vers une langue à la fois).
  for (const l of tgt) {
    const res = await fetch(`${host}/v2/translate`, {
      method: 'POST',
      headers: { Authorization: `DeepL-Auth-Key ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: prepared.map((p) => p.xml),
        source_lang: 'EN',
        target_lang: DEEPL_LANG[l],
        tag_handling: 'xml',
        ignore_tags: ['x'],
      }),
    });
    if (res.status === 456) throw new DeeplQuotaError('Quota DeepL épuisé');
    if (!res.ok) throw new Error(`DeepL ${res.status} : ${await res.text()}`);
    const data = (await res.json()) as { translations: { text: string }[] };
    data.translations.forEach((tr, i) => {
      // Déséchappe la prose PUIS réinsère les tags bruts (qui contiennent des `<>`).
      const restored = xmlUnescape(tr.text).replace(
        /<x>\s*(\d+)\s*<\/x>/g,
        (_, n) => prepared[i].tokens[Number(n)] ?? '',
      );
      results[i][l] = restored;
    });
  }
  return results;
}

// --- Claude Haiku --------------------------------------------------------------

const LANG_NAMES: Record<Target, string> = {
  jp: '日本語 (Japanese)',
  kr: '한국어 (Korean)',
  zh: '中文 (Simplified Chinese)',
  fr: 'Français (French)',
};

/** Masque les fragments protégés par des marqueurs `⟦n⟧` (préservés par le modèle). */
function maskBracket(text: string): { masked: string; tokens: string[] } {
  const tokens: string[] = [];
  const masked = text.replace(PROTECT, (m) => {
    const i = tokens.length;
    tokens.push(m);
    return `⟦${i}⟧`;
  });
  return { masked, tokens };
}

async function translateHaiku(
  texts: string[],
  tgt: Target[],
  key: string,
): Promise<Translations[]> {
  const masked = texts.map(maskBracket);
  const payload = masked.map((m, i) => ({ id: i, text: m.masked }));
  const system =
    'Tu traduis des notes éditoriales concises d’un wiki de jeu mobile (Outerplane). ' +
    'Traduis depuis l’anglais vers les langues demandées, avec un ton bref de guide de jeu. ' +
    'RÈGLE ABSOLUE : conserve chaque marqueur ⟦n⟧ et chaque saut de ligne littéral \\n EXACTEMENT ' +
    'tel quel et à la même place — ne les traduis pas, ne les réordonne pas, ne les supprime pas. ' +
    'Réponds UNIQUEMENT par un objet JSON, sans aucun texte autour.';
  const user =
    `Langues cibles : ${tgt.map((l) => `${l} = ${LANG_NAMES[l]}`).join(', ')}.\n` +
    'Pour chaque entrée, renvoie ses traductions.\n' +
    'Format STRICT : {"0": {"jp":"…","kr":"…"}, "1": {…}} — une clé par id, une sous-clé par code langue.\n\n' +
    `Entrées :\n${JSON.stringify(payload)}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' }, // prettier-ignore
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status} : ${await res.text()}`);
  const data = (await res.json()) as { content?: { text?: string }[] };
  const raw = data.content?.[0]?.text ?? '';
  const slice = raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1);
  let parsed: Record<string, Record<string, string>>;
  try {
    parsed = JSON.parse(slice) as Record<string, Record<string, string>>;
  } catch {
    throw new Error('Réponse du modèle non-JSON — réessaie');
  }
  return texts.map((_, i) => {
    const out: Translations = {};
    const row = parsed[String(i)] ?? {};
    const restore = (s: string) =>
      s.replace(/⟦(\d+)⟧/g, (_, n) => masked[i].tokens[Number(n)] ?? '');
    for (const l of tgt) if (typeof row[l] === 'string') out[l] = restore(row[l]);
    return out;
  });
}

// --- Point d'entrée : DeepL puis fallback Haiku ---------------------------------

/**
 * Traduit chaque `texts[i]` (EN) vers les `targets` (hors `en`). Retour aligné
 * sur l'entrée. `provider` = moteur ayant servi (`deepl`, `haiku`, ou `none`).
 * DeepL d'abord ; sur quota épuisé (456), bascule Haiku si sa clé est présente.
 */
export async function autoTranslate(
  texts: string[],
  targets: Lang[],
): Promise<{ results: Translations[]; provider: 'deepl' | 'haiku' | 'none' }> {
  const empty = { results: texts.map(() => ({}) as Translations), provider: 'none' as const };
  if (!IS_DEV) return empty;
  const tgt = targets.filter((l): l is Target => l !== 'en');
  if (!texts.length || !tgt.length) return empty;

  const deeplKey = (process.env.DEEPL_API_KEY ?? process.env.DEEPL_API)?.trim();
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();

  if (deeplKey) {
    try {
      return { results: await translateDeepL(texts, tgt, deeplKey), provider: 'deepl' };
    } catch (e) {
      if (!(e instanceof DeeplQuotaError)) throw e;
      if (!anthropicKey)
        throw new Error('Quota DeepL épuisé (1 M) — ajoute ANTHROPIC_API_KEY pour basculer sur Haiku.'); // prettier-ignore
      return { results: await translateHaiku(texts, tgt, anthropicKey), provider: 'haiku' };
    }
  }
  if (anthropicKey) {
    return { results: await translateHaiku(texts, tgt, anthropicKey), provider: 'haiku' };
  }
  throw new Error('Aucune clé (DEEPL_API_KEY ou ANTHROPIC_API_KEY) dans .env.local / SOPS.');
}
