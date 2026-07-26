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

// FRONTIÈRE `admin/` (audit F2). Le chemin `admin/` NE garantit PAS qu'un module
// reste en dev : **6 modules** sont importés EN VALEUR depuis du code servi au
// public (les outils de contribution réutilisent volontairement les briques
// éditoriales, et la home lit l'overlay du catalogue d'items), plus 2 en type
// seul. Cette liste est la seule exception, et elle est BLOQUANTE — ce qui la
// rend incapable de vieillir en mentant, contrairement à un commentaire en tête
// de dossier.
//
// Les `import type` sont autorisés d'office (`allowTypeImports`) : effacés à la
// compilation, ils ne peuvent rien embarquer.
//
// ⚠ AVANT D'AJOUTER UNE ENTRÉE : ce module lit-il un secret ? sa sûreté repose-
// t-elle sur `IS_DEV` ? Si oui, sors la brique partagée dans un module neutre au
// lieu d'élargir la liste — c'est exactement ce qui a été fait pour
// `translateReviews` (elle tirait DEEPL_API_KEY / ANTHROPIC_API_KEY dans le
// bundle des pages `/contribute`), cf. `premium-limited/premium-translate.ts`.
const ADMIN_SHIPS_TO_PROD = [
  '@/lib/admin/guard', // IS_DEV — simple constante (pages event)
  '@/lib/admin/inline-refs', // refs inline des outils publics de contribution
  '@/lib/admin/general-guide-store', // premiumLimitedRoster (/contribute/premium-reviews)
  '@/lib/admin/item-curated-store', // loadItemCurated — overlay catalogue, lu par la home
  '@/components/admin/editorial/EditorialPublicTool',
  '@/components/admin/premium-limited/PremiumReviewsPublicTool',
];
const ADMIN_BOUNDARY_MSG =
  "Frontière admin/ : ce module n'est pas censé partir en production. Les exceptions assumées sont listées dans ADMIN_SHIPS_TO_PROD (eslint.config.mjs) — avant d'y ajouter la tienne, vérifie qu'elle ne porte ni secret ni garde IS_DEV, sinon extrais la brique partagée.";
const SHARED_BRICK_MSG =
  "Ce dossier de briques est PARTAGÉ avec les outils publics de contribution : tout ce qui s'y trouve part dans le bundle de production. Interdit d'y importer un module porteur de secret (server actions `*-actions`) ou dont la sûreté repose sur IS_DEV. Sors la fonction concernée dans un module admin-only, hors de ce dossier (cf. premium-limited-translate.ts).";

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
  {
    // Garde-fou de la frontière `admin/` (cf. ADMIN_SHIPS_TO_PROD ci-dessus).
    // Exemptés : `admin/` lui-même, et les `.dev.*` — `pageExtensions`
    // (next.config.ts) ne les reconnaît QU'en développement, ils ne shippent
    // donc jamais, où qu'ils vivent. C'est bien « ce qui ship » qu'on garde, pas
    // une convention de chemin.
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/**/admin/**', 'src/**/*.dev.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              // Ordre gitignore : le large d'abord, les exceptions `!` ensuite.
              // ⚠ PAS de `**` ici : en sémantique gitignore on ne réinclut pas un
              // fichier situé dans un dossier exclu. `*` ne traversant pas `/`,
              // ces motifs excluent les FICHIERS un par un — et une exception `!`
              // sur un fichier, elle, fonctionne (vérifié : sans ça, les deux
              // outils publics nichés restaient bloqués malgré la liste).
              group: [
                '@/lib/admin/*',
                '@/components/admin/*/*',
                ...ADMIN_SHIPS_TO_PROD.map((m) => `!${m}`),
              ],
              allowTypeImports: true,
              message: ADMIN_BOUNDARY_MSG,
            },
          ],
        },
      ],
    },
  },
  {
    // DEUXIÈME SENS DE LA FRONTIÈRE — et c'est celui qui aurait attrapé le vrai
    // incident. Le garde-fou ci-dessus regarde « qui importe `admin/` » ; il ne
    // voit RIEN de ce qui se passe à l'intérieur. Or le fil trouvé le 26/07 était
    // interne : `premium-limited/PremiumLimitedParts` (brique partagée avec les
    // outils publics) importait `translate-actions` et embarquait ainsi
    // DEEPL_API_KEY / ANTHROPIC_API_KEY dans le graphe des pages `/contribute`.
    //
    // Ces deux dossiers portent donc un INVARIANT : tout ce qui y vit part en
    // prod. On y interdit l'import d'un module porteur de secret ou dont la
    // sûreté repose sur `IS_DEV`. `*-actions` étant la convention de nommage des
    // server actions du repo, un nouveau module d'actions est couvert d'office.
    //
    // Seule exception, `inline-preview-actions` : délibérément NON gardée, en
    // lecture seule sur des données de jeu publiques, et nécessaire aux outils
    // publics (décision documentée en tête de ce fichier-là).
    files: [
      'src/components/admin/editorial/**/*.{ts,tsx}',
      'src/components/admin/premium-limited/**/*.{ts,tsx}',
    ],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/lib/admin/*-actions',
                '!@/lib/admin/inline-preview-actions',
                '@/lib/admin/guard',
                '@/lib/admin/useAutoTranslate',
              ],
              allowTypeImports: true,
              message: SHARED_BRICK_MSG,
            },
          ],
        },
      ],
    },
  },
  // `.unlighthouse/**` : rapports d'audit générés (`pnpm seo:audit`), bundles JS
  // minifiés — gitignorés, mais ESLint flat ne lit pas `.gitignore` (n'ignore que
  // node_modules/.git), il les linterait sinon (des milliers de faux warnings).
  globalIgnores(['.next/**', 'out/**', 'build/**', '.unlighthouse/**', 'next-env.d.ts']),
]);

export default eslintConfig;
