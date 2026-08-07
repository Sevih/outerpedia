'use client';

/**
 * Dernier filet : l'erreur a eu lieu dans le LAYOUT RACINE lui-même, donc
 * `[lang]/error.tsx` n'a pas pu être rendu (il vit à l'intérieur de ce layout).
 * Next remplace alors tout le document — d'où le `<html>`/`<body>` ci-dessous.
 * Sans ce fichier, ce cas-là sert une page BLANCHE.
 *
 * VOLONTAIREMENT AUTONOME. Il n'utilise ni `RootDocument`, ni `globals.css`, ni
 * Tailwind, ni les polices, ni l'i18n : tout ça est précisément ce qui vient de
 * casser, ou ce qui en dépend. Un écran de secours qui importe la moitié de
 * l'application peut échouer avec elle. D'où les styles INLINE et l'anglais en
 * dur — le repli du site, et la seule langue dont on soit sûr ici (le `<html
 * lang>` correct est justement ce que le layout racine n'a pas pu poser).
 *
 * Les couleurs sont celles de `globals.css` en dur (surface-base / content /
 * accent) pour que l'écran reste dans l'identité du site sans charger sa CSS.
 */
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0b1120',
          color: '#ffffff',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <div>
          <p style={{ fontSize: '3.5rem', fontWeight: 700, color: '#38bdf8', margin: 0 }}>!</p>
          <h1 style={{ fontSize: '1.5rem', color: '#ffffff', margin: '1rem 0 0' }}>
            Something went wrong
          </h1>
          <p style={{ margin: '0.75rem 0 0', maxWidth: '28rem' }}>
            Outerpedia could not load this page. Try again, or head back home.
          </p>
          {/* `digest` : le seul lien entre cet écran et la stack côté serveur.
              Sans lui, un rapport d'utilisateur est intraçable dans les logs. */}
          {'digest' in error && typeof error.digest === 'string' && (
            <p style={{ margin: '0.75rem 0 0', fontSize: '0.75rem', opacity: 0.6 }}>
              Reference: {error.digest}
            </p>
          )}
          <div
            style={{
              marginTop: '2rem',
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                background: '#131c2e',
                color: '#ffffff',
                border: '1px solid #526075',
                borderRadius: '0.375rem',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
            {/* `<a>` et pas `<Link>`, À DESSEIN : on veut un rechargement
                COMPLET du document. `<Link>` ferait une navigation client via
                le routeur — or le routeur fait partie de ce qui vient
                d'échouer, et `next/link` ré-importerait ce que cet écran évite
                justement de charger. La règle ci-dessous suppose une page
                saine ; ce n'est pas le cas ici. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                background: '#131c2e',
                color: '#ffffff',
                border: '1px solid #526075',
                borderRadius: '0.375rem',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                textDecoration: 'none',
              }}
            >
              Back to home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
