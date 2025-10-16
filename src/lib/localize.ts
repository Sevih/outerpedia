// src/lib/localize.ts
// Helper de localisation pour Outerpedia (EN/JP/KR uniquement)

import type { TenantKey } from '@/tenants/config';

export type LangMap = Partial<Record<TenantKey, string>>;



// --- Utils internes ---
type Opts = { allowEmpty?: boolean; default?: string };

const isNonEmpty = (v: unknown): v is string =>
  typeof v === 'string' && v.trim().length > 0;

/**
 * l() - Localise un champ "plat" avec suffixes `_jp` / `_kr` (EN = base).
 * Exemples: name, name_jp, name_kr  |  Fullname, Fullname_jp, Fullname_kr
 */
export function l<T extends object>(
  obj: T,
  baseKey: string,
  lang: TenantKey,
  opts?: Opts
): string {
  const { allowEmpty = false, default: def = '' } = opts ?? {};
  const anyObj = obj as Record<string, unknown>; // 👈 cast interne unique

  const langKey = lang === 'en' ? baseKey : `${baseKey}_${lang}`;
  const v1 = anyObj[langKey];
  if (isNonEmpty(v1) || (allowEmpty && typeof v1 === 'string')) return v1 as string;

  const v2 = anyObj[baseKey];
  if (isNonEmpty(v2) || (allowEmpty && typeof v2 === 'string')) return v2 as string;

  return def;
}

/**
 * lRec() - Localise un objet "map" { en, jp, kr } (rédactionnel / guides).
 * Si `rec` est une string, on la considère comme EN.
 */
export function lRec(
  rec: LangMap | string | undefined | null,
  lang: TenantKey,
  opts?: Opts
): string {
  const { allowEmpty = false, default: def = '' } = opts ?? {};

  if (typeof rec === 'string') return isNonEmpty(rec) || allowEmpty ? rec : def;
  if (!rec) return def;

  const vLang = rec[lang];
  if (isNonEmpty(vLang) || (allowEmpty && typeof vLang === 'string')) return vLang as string;

  const vEn = rec.en;
  if (isNonEmpty(vEn) || (allowEmpty && typeof vEn === 'string')) return vEn as string;

  return def;
}

/**
 * makeLocalizer() - Variante curried pratique si tu passes souvent la même langue.
 */
export function makeLocalizer(lang: TenantKey) {
  return {
    /** Pour objets plats avec suffixes (_jp/_kr) */
    field<T extends Record<string, unknown>>(
      obj: T,
      baseKey: string,
      opts?: Opts
    ) {
      return l(obj, baseKey, lang, opts);
    },
    /** Pour objets { en, jp, kr } */
    map(rec: LangMap | string | undefined | null, opts?: Opts) {
      return lRec(rec, lang, opts);
    },
  };
}

export function lSubMap<T>(
  map: Record<string, T> | undefined,
  lang: TenantKey,
  isRoot: (k: string) => boolean = (k) => /^\d+$/.test(k)
): Record<string, T> | undefined {
  if (!map) return undefined

  const keys = Object.keys(map)
  // collecter toutes les racines: "2" à partir de "2", "2_jp", "2_kr"…
  const roots = new Set<string>()
  for (const k of keys) {
    const m = k.match(/^(.+?)_(jp|kr)$/)
    const root = m ? m[1] : k
    if (isRoot(root)) roots.add(root)
  }

  const out: Record<string, T> = {}
  for (const root of roots) {
    const suffixed = `${root}_${lang}`
    out[root] = (lang !== 'en' && map[suffixed] !== undefined) ? map[suffixed]! : map[root]!
  }
  return out
}

/** Spécifique à enhancement (clé numérique) */
export function lEnhancement(
  raw: Record<string, string[]> | undefined,
  lang: TenantKey
): Record<string, string[]> | undefined {
  return lSubMap<string[]>(raw, lang)
}

// Alias ergonomiques (optionnels)
export const pickLocalized = l;     // même chose que l()
export const pickLocalizedRec = lRec; // même chose que lRec()
