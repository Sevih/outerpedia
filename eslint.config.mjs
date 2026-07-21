import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

// Couleurs « brutes » interdites dans le JSX : gris Tailwind numérotés
// (gray/zinc/slate/neutral/stone-100…900) et white/black, sur les utilitaires de
// couleur. Forcent l'usage des tokens sémantiques (cf. src/app/globals.css) →
// garantit que les 2 thèmes (clair/sombre) restent corrects. Garde-fou BLOQUANT.
const RAW_COLOR =
  '(bg|text|border|ring|fill|stroke|from|via|to|divide|outline|ring-offset|decoration)-(gray|zinc|slate|neutral|stone)-[0-9]{2,3}|(bg|text|border|ring|fill|stroke|divide|outline)-(white|black)\\b';
const RAW_COLOR_MSG =
  'Couleur en dur interdite (gris/white/black Tailwind). Utilise un token sémantique : bg-surface-*, text-content-*, border-line(-subtle|-strong), accent… (cf. src/app/globals.css).';

// Couleurs VIVES numérotées (red/sky/emerald…-100…900) — interdites en PLUS des
// gris, mais UNIQUEMENT sous `src/components/guides/**` : toute l'arbo y a été
// tokenisée (--cat-*/--ed-*/--monad-*/--select/--danger-*…), ce garde-fou
// verrouille l'acquis. Le reste du site n'est PAS encore prêt (fiche perso
// exemptée, tools/landing à tokeniser un jour) → hors périmètre pour l'instant.
const VIVID_COLOR =
  '(bg|text|border|border-[lrtbxy]|ring|ring-offset|fill|stroke|from|via|to|divide|outline|decoration)-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3}';
const VIVID_COLOR_MSG =
  'Couleur vive en dur interdite dans les guides (déjà tokenisés). Utilise un token : --cat-*/--ed-*/--monad-*/--select/--danger-*/--stat… (cf. src/app/globals.css & /dev/tokens).';

// Note vs V2: on NE désactive PAS react-hooks/set-state-in-effect — on garde la
// règle active et on corrige les vrais cas au portage (faire BIEN).
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // `<img>` BRUT ASSUMÉ, PARTOUT (2026-07-22). `next.config.ts` pose
    // `images.unoptimized: true` : les assets viennent de R2 en `.webp`
    // pré-dimensionné, avec les cache headers réglés côté Caddy/Next. Dans ces
    // conditions `<Image />` émet un `<img>` nu — la règle réclame un wrapper
    // qui n'optimise rien. On l'éteint UNE fois ici plutôt que de l'annuler
    // ligne à ligne : elle traînait 215 directives dans 96 fichiers, et tout
    // nouveau fichier « oubliait » la convention (d'où le bruit récurrent en
    // CI).
    // À RALLUMER le jour où `images.unoptimized` repasse à false (« Phase 3 »,
    // cf. next.config.ts) — ce sera cette ligne, et rien d'autre, à retirer.
    // NB : le vrai sujet perf que cette règle effleure, ce sont les
    // `width`/`height` manquants (CLS, cf. docs/TODO.md) — il se traite dans
    // les primitives d'image, pas via le linter.
    rules: {
      '@next/next/no-img-element': 'off',
    },
  },
  {
    // `.ts` inclus (2026-07-16) : les palettes hors JSX (nodeStyles,
    // guide-accents, ELEMENT_RING…) portaient des classes de couleur que la
    // règle ne voyait pas.
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        { selector: `Literal[value=/${RAW_COLOR}/]`, message: RAW_COLOR_MSG },
        { selector: `TemplateElement[value.raw=/${RAW_COLOR}/]`, message: RAW_COLOR_MSG },
      ],
    },
  },
  {
    // GUIDES — arbo entièrement tokenisée : on interdit EN PLUS les couleurs
    // vives (redéfinit `no-restricted-syntax` pour ces fichiers, donc on RÉ-INCLUT
    // les sélecteurs RAW_COLOR de base). La prose éditoriale des guides vit dans
    // `src/app/**/guides/_contents/**`, hors de ce périmètre — non concernée.
    files: ['src/components/guides/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        { selector: `Literal[value=/${RAW_COLOR}/]`, message: RAW_COLOR_MSG },
        { selector: `TemplateElement[value.raw=/${RAW_COLOR}/]`, message: RAW_COLOR_MSG },
        { selector: `Literal[value=/${VIVID_COLOR}/]`, message: VIVID_COLOR_MSG },
        { selector: `TemplateElement[value.raw=/${VIVID_COLOR}/]`, message: VIVID_COLOR_MSG },
      ],
    },
  },
  {
    // FICHE PERSO — portage pixel-perfect de la V2 (layout éditorial sombre,
    // markup V2 copié à l'identique, zinc/white compris). Exception ASSUMÉE et
    // CONFINÉE : tout le reste du site reste sous le garde-fou tokens.
    // (Resserrée le 2026-07-16 : parse-text/inline/ShareButtons n'ont plus
    // aucune couleur brute — seule la fiche perso en a encore besoin.)
    // À tokeniser le jour où la fiche devra suivre le thème clair.
    files: [
      'src/components/character/**/*.{ts,tsx}',
      // NB: `**` couvre les segments littéraux `[lang]`/`[slug]` (crochets =
      // classe de caractères en glob, non échappables proprement ici).
      'src/app/**/characters/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
  // `.unlighthouse/**` : rapports d'audit générés (`pnpm seo:audit`), bundles JS
  // minifiés — gitignorés, mais ESLint flat ne lit pas `.gitignore` (n'ignore que
  // node_modules/.git), il les linterait sinon (des milliers de faux warnings).
  globalIgnores(['.next/**', 'out/**', 'build/**', '.unlighthouse/**', 'next-env.d.ts']),
]);

export default eslintConfig;
