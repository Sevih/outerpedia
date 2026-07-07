import { cache } from 'react';
import type { Lang } from './config';
import { DEFAULT_LANG } from './config';

/**
 * Store de langue à portée requête (React cache()). Posé une fois dans le
 * layout `[lang]`, lu partout dans les server components sans prop-drilling.
 */
const getStore = cache(() => ({ lang: DEFAULT_LANG as Lang }));

/** À appeler dans `[lang]/layout.tsx` pour fixer la langue de la requête. */
export function setRequestLang(lang: Lang) {
  getStore().lang = lang;
}

/** Lit la langue courante depuis n'importe quel server component. */
export function getRequestLang(): Lang {
  return getStore().lang;
}
