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

// Note vs V2: on NE désactive PAS react-hooks/set-state-in-effect — on garde la
// règle active et on corrige les vrais cas au portage (faire BIEN).
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ['src/**/*.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        { selector: `Literal[value=/${RAW_COLOR}/]`, message: RAW_COLOR_MSG },
        { selector: `TemplateElement[value.raw=/${RAW_COLOR}/]`, message: RAW_COLOR_MSG },
      ],
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);

export default eslintConfig;
