import { cache } from 'react';
import type { Lang } from '@/lib/i18n/config';
import { isValidLang } from '@/lib/i18n/config';
import type { TranslationKey } from './locales/en';

export type { TranslationKey };
export type Messages = Record<TranslationKey, string>;
export type TFunction = (key: TranslationKey, vars?: Record<string, string | number>) => string;

/** Charge les messages d'une langue (mémoïsé par requête). */
export const loadMessages = cache(async (lang: Lang): Promise<Messages> => {
  const safeLang = isValidLang(lang) ? lang : 'en';
  const mod = await import(`./locales/${safeLang}.ts`);
  return mod.default;
});

/** Résout les motifs ICU `{var, plural, one {…} other {…}}`. */
function resolvePlurals(text: string, vars: Record<string, string | number>): string {
  return text.replace(
    /\{(\w+),\s*plural,\s*one\s*\{([^}]*)\}\s*other\s*\{([^}]*)\}\}/g,
    (_, varName, one, other) => {
      const count = Number(vars[varName] ?? 0);
      return (count === 1 ? one : other).replace(/#/g, String(count));
    },
  );
}

/** Construit une fonction de traduction depuis un dict de messages. */
export function makeT(messages: Messages): TFunction {
  return (key, vars) => {
    let text = messages[key] ?? key;
    if (!vars) return text;
    text = resolvePlurals(text, vars);
    return text.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
  };
}

/** Fonction de traduction pour les Server Components (mémoïsée par requête). */
export const getT = cache(async (lang: Lang): Promise<TFunction> => {
  const messages = await loadMessages(lang);
  return makeT(messages);
});
