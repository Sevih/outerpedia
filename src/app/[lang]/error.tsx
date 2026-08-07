'use client';

import { useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { DEFAULT_LANG } from '@/lib/i18n/config';
import { localePath } from '@/lib/navigation';

/**
 * Écran d'erreur du site public, rendu DANS le layout `[lang]` (header/footer
 * présents, comme la 404). Sans ce fichier, toute exception de rendu servait la
 * page d'erreur par défaut de Next : anglais seul, sans navigation, sans aucun
 * chemin de retour — le pendant exact du trou que `not-found.tsx` a bouché.
 *
 * Ce n'est pas théorique sur ce projet : les guides se rendent à partir de
 * données de pipeline, et un `meta.bossId` absent de `monsters.json` fait JETER
 * le rendu (cf. TODO, « Guide porté → son boss doit exister »).
 *
 * TRADUCTION — un `error.tsx` est forcément un Client Component (il reçoit
 * `reset`), donc pas de `getT`/`getRequestLang`, tous deux serveur. On N'importe
 * PAS `@/i18n` pour autant : aucun composant client du projet ne le fait, et ce
 * serait tirer les 519 clés des 5 locales dans le bundle pour trois phrases.
 * D'où ce dictionnaire local, saisi sur `<html lang>` — que le layout pose déjà
 * à la vraie langue. Le premier rendu est en anglais (le DOM n'existe pas encore
 * côté serveur), puis il se localise au montage : acceptable pour un écran qui
 * ne doit surtout pas, lui, échouer.
 */

/** Clé = `htmlLang` (`LANGUAGES[l].htmlLang`), pas la clé de langue interne. */
const STRINGS: Record<string, { title: string; message: string; retry: string; home: string }> = {
  en: {
    title: 'Something went wrong',
    message: 'This page could not be displayed. Try again, or head back home.',
    retry: 'Try again',
    home: 'Back to home',
  },
  fr: {
    title: 'Une erreur est survenue',
    message: "Cette page n'a pas pu s'afficher. Réessayez, ou revenez à l'accueil.",
    retry: 'Réessayer',
    home: "Retour à l'accueil",
  },
  ja: {
    title: 'エラーが発生しました',
    message: 'このページを表示できませんでした。再試行するか、ホームに戻ってください。',
    retry: '再試行',
    home: 'ホームに戻る',
  },
  ko: {
    title: '오류가 발생했습니다',
    message: '이 페이지를 표시할 수 없습니다. 다시 시도하거나 홈으로 돌아가세요.',
    retry: '다시 시도',
    home: '홈으로',
  },
  zh: {
    title: '出错了',
    message: '无法显示此页面。请重试，或返回首页。',
    retry: '重试',
    home: '返回首页',
  },
};

/**
 * `<html lang>` lu SANS `setState` dans un effet — la règle
 * `react-hooks/set-state-in-effect` est gardée active sur ce projet, et c'est
 * exactement le cas qu'elle vise. `useSyncExternalStore` est l'API faite pour
 * lire une valeur extérieure à React en restant SSR-safe : `getServerSnapshot`
 * rend l'anglais côté serveur, `getSnapshot` la vraie langue côté client, sans
 * rendu intermédiaire ni avertissement d'hydratation.
 *
 * `subscribe` ne fait rien et vit HORS du composant (référence stable, sinon
 * React se ré-abonne à chaque rendu) : l'attribut est posé une fois par le
 * layout et ne bouge plus.
 */
const subscribe = () => () => {};
const getLang = () => document.documentElement.lang;
const getServerLang = () => 'en';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const htmlLang = useSyncExternalStore(subscribe, getLang, getServerLang);
  const s = STRINGS[htmlLang] ?? STRINGS.en;

  useEffect(() => {
    // Sans ça, l'erreur ne laisse AUCUNE trace : Next l'a déjà interceptée, et
    // le visiteur ne verra qu'un écran poli. Les logs du conteneur sont le seul
    // endroit où le `digest` (qui relie ce rendu à la stack serveur) apparaît.
    console.error('[error boundary]', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-center md:px-6">
      <p className="text-accent text-7xl font-bold">!</p>
      {/* Headings en `width: fit-content` (globals.css) : centrer le BLOC. */}
      <h1 className="text-content-strong mx-auto mt-4 text-3xl font-bold">{s.title}</h1>
      <p className="text-content-muted mx-auto mt-3 max-w-md">{s.message}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="border-line-subtle bg-surface-raised text-content-strong hover:bg-line rounded-md border px-4 py-2 text-sm transition-colors"
        >
          {s.retry}
        </button>
        {/* `localePath` et pas `"/"` : avec le routing par SOUS-DOMAINE, les
            routes typées de l'app router sont `/[lang]/…`, jamais `/` — un
            littéral ne compile pas sous `typedRoutes`. Le `lang` est ignoré par
            la fonction (l'hôte porte la langue), d'où `DEFAULT_LANG` : cet
            écran est client, il n'a pas accès au store de langue serveur. */}
        <Link
          href={localePath(DEFAULT_LANG, '/')}
          className="border-line-subtle bg-surface-raised text-content-strong hover:bg-line rounded-md border px-4 py-2 text-sm transition-colors"
        >
          {s.home}
        </Link>
      </div>
    </div>
  );
}
