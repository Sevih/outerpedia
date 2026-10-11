# Audit — poids des bundles et accessibilité

> Fait le **2026-10-09** sur le site **construit** (`next build`, Next 16.3.0 /
> Turbopack, 1 964 pages générées) puis **démarré** (`next start`), au commit
> `1d55c84` de `main`. Constat seul : rien n'est corrigé ici. Chaque constat
> donne la page, la mesure et le fichier responsable ; les deux parties sont
> classées par **gain attendu**.

## Méthode

- **Build** : `NODE_ENV=production`, `NEXT_PUBLIC_IMG_BASE=https://img.outerpedia.com`,
  routage des langues par défaut (`path`). Node 24, pnpm 11.13.1.
- **Poids par page** : les 550 URL du `sitemap.xml` (anglais) ont été demandées
  au serveur ; pour chacune, somme des `<script src="/_next/…">` du HTML
  (taille brute et Brotli) et taille du flux RSC inline (`self.__next_f`). Les
  autres langues servent les mêmes routes, donc les mêmes chunks.
- **Attribution** : `next experimental-analyze --output` (graphe de modules de
  Turbopack) croisé avec `.next/diagnostics/route-bundle-stats.json` (chunks du
  premier chargement de chaque route). L'analyseur recompile de son côté : ses
  noms de chunks diffèrent du build, ils sont appariés par taille (écart
  ≤ 1,5 Ko). Les chaînes d'import citées ont été relues dans le code.
- **Réseau réel** : Chromium (Playwright) charge la page, attend le repos
  réseau, défile jusqu'en bas, et compte tout le JS et les requêtes RSC reçus
  (préchargements compris).
- **Accessibilité** : axe-core 4 (règles WCAG 2.0/2.1/2.2 A et AA +
  bonnes pratiques) en 1366×900 et 390×844, sur cinq pages : accueil `/`,
  fiche `/characters/snow`, liste `/characters`, outil `/tier-list-maker`,
  guide `/guides/dimensional-singularity/urd-light`. Puis, au clavier : 40
  tabulations par page avec relevé de l'élément focalisé et de son indicateur,
  ouverture/fermeture des modales (recherche, réglages), du sélecteur de
  langue, du menu mobile. Structure des titres relevée sur le DOM rendu.

Les tailles « brutes » sont les octets du fichier ; « br » est leur taille
Brotli (qualité 11), ordre de grandeur du transfert si le serveur compresse.
Le coût d'analyse et d'exécution côté navigateur suit la taille brute.

## Résumé

| Famille de pages (EN)                | Pages | JS 1er chargement brut / br | HTML brut / br      |
| ------------------------------------ | ----: | --------------------------- | ------------------- |
| Outils `/<outil>` + `/tools`         |    18 | **2 109 Ko / 544 Ko**       | jusqu'à 3 349 / 245 |
| Guides `/guides/<cat>/<slug>`        |    93 | **1 837 Ko / 481 Ko**       | jusqu'à 4 356 / 61  |
| Liste `/characters`                  |     1 | 1 758 Ko / 459 Ko           | 955 / 44            |
| Fiches `/characters/<slug>`          |   129 | 1 065 Ko / 264 Ko           | ≤ 375 / 32          |
| Fiches `/equipment/<slug>`           |   289 | 1 002 Ko / 243 Ko           | ≤ 238 / 22          |
| Accueil `/`                          |     1 | 690 Ko / 184 Ko             | 193 / 19            |
| Pages légères (`/legal`, `/guides`…) |     — | 644–676 Ko / 174–185 Ko     | —                   |

Le socle commun à toutes les pages (`/legal`) pèse 534 Ko d'après
`route-bundle-stats.json` (644 Ko en comptant tous les scripts du HTML), dont
**438 Ko de framework** (React DOM, routeur Next) : il n'y a presque rien à y
gagner. L'essentiel de l'écart au-dessus vient de deux données embarquées dans
le bundle client (A1, A2) et d'un routeur d'outils qui charge tous les outils à
la fois (A3).

Côté accessibilité, la base est saine : un seul `<main>`, `lang` juste, focus
visible sur tous les liens et boutons parcourus, menu Guides atteignable au
clavier, modales qui piègent et rendent le focus (sauf B2), tooltips qui s'ouvrent au
focus. Les manques sont précis et localisés (partie B).

---

## A. Poids des bundles

### A1 — `CharacterCard` embarque `characters.json` entier pour une concaténation de chaînes · gain **~580 Ko bruts / ~210 Ko br** sur 112 pages EN

- **Pages** : `/characters`, les 93 guides, les 18 pages d'outils (× 6 langues).
  Le chunk `28nklen803sep.js` (737 Ko bruts, 210 Ko br) figure dans le premier
  chargement de ces 112 pages, et dans les préchargements de l'accueil (A5).
- **Contenu** : `data/generated/characters.json` (497 Ko après minification,
  dont les biographies dans les six langues) + `characters-list.json` (69 Ko) +
  `characters-slug-to-id.json`.
- **Cause** : [`src/components/character/CharacterCard.tsx:4`](../src/components/character/CharacterCard.tsx)
  importe `joinDisplayName` depuis [`src/lib/data/characters.ts`](../src/lib/data/characters.ts),
  un module qui importe ces JSON en tête (`:7-10`). `joinDisplayName` est une
  fonction de trois lignes (`characters.ts:72-74`) qui n'en lit aucun. Comme
  `CharacterCard` est rendu dans des composants client
  (`CharactersBrowser.tsx`, `guides/TeamSlotCarousel.tsx`), tout le module part
  au navigateur. [`src/components/tierlist/TierListBrowser.tsx:7`](../src/components/tierlist/TierListBrowser.tsx)
  fait le même import pour la même fonction ; il sert aux outils
  `tierlistpve`/`tierlistpvp` (via `tools/_contents/_shared/TierListTool.tsx`),
  déjà touchés par A3.
- **Piste** : sortir les utilitaires purs (`joinDisplayName` et voisins) dans
  un module sans import de données.

### A2 — `game-tokens.ts` embarque tout le glossaire pour 843 octets · gain **~292 Ko bruts / ~56 Ko br** sur 531 pages EN

- **Pages** : 531 des 550 pages EN — toutes sauf l'accueil, les index de
  guides, `/event` et sa sous-page, `/changelog`, `/legal`, `/contributors`, `/coupons`,
  `/tierlist`. Chunk `06homiml358ig.js`, 292 Ko bruts.
- **Contenu** : `data/generated/glossaries.json` entier (373 Ko sur disque).
  Mesuré par clé : `effects` 141 Ko, `geas` 43 Ko, `effectByKey` 14 Ko… ; les
  deux clés utiles ici, `elements` et `classes`, font **843 octets**.
- **Cause** : [`src/lib/game-tokens.ts:27-29`](../src/lib/game-tokens.ts)
  (`const G = getGlossaries()`, au niveau du module) ←
  `src/components/inline/GameTokens.tsx` ← `src/components/character/SkillDescription.tsx`,
  lui-même rendu côté client par `SkillCard`, `ChainDualSection`,
  `EeTranscendSection`, `GearRecoSection`, `EquipmentDetail`,
  `equipment/cards.tsx`, `damage-calculator/SkillTip.tsx`.
  Le commentaire de `src/lib/data/stat-glossary.ts:6` connaît le problème
  (« `glossaries.json` pèse 1,8 Mo ») ; ce chemin-ci n'a pas été coupé.
- **Piste** : passer à `GameTokens` la table élément/classe résolue côté
  serveur, ou générer un petit JSON dédié.

### A3 — Chaque page d'outil charge le code de tous les outils · gain **~270 Ko bruts de code + les données d'A1/A2** sur 18 pages EN

- **Pages** : les 17 outils de `src/app/[lang]/[slug]` et la page d'accueil
  des outils `/tools`. Les 18 pages chargent **exactement les mêmes 22
  scripts** (2 109 Ko bruts) : `/ost`, qui n'affiche qu'un lecteur audio,
  télécharge le calculateur de dégâts, le hero-tracker et le tier-list-maker.
- **Mesure** (premier chargement de `/[lang]/[slug]`, code propre à chaque
  outil) : damage-calculator 84 Ko, progress-tracker 44 Ko, hero-tracker
  38 Ko, tier-list-maker 36 Ko, ost 15 Ko, pull-simulator 12 Ko, team-planner
  12 Ko, puis 3 à 6 Ko pour les six autres. S'y ajoutent les chunks d'A1 et
  A2, tirés par les outils qui en ont besoin et servis à tous.
- **Cause** : [`src/app/[lang]/tools/registry.ts:10-37`](../src/app/[lang]/tools/registry.ts)
  — une seule route dynamique `[slug]` dont le module importe (en `import()`)
  les 17 wrappers serveur ; les composants client qu'ils référencent entrent
  tous dans le manifeste client de cette route. `/tools`
  ([`src/app/[lang]/tools/page.tsx:8`](../src/app/[lang]/tools/page.tsx))
  n'importe que `PORTED_TOOL_SLUGS` du même module et hérite du même lot
  (`route-bundle-stats.json` : 2 010 Ko pour `/[lang]/tools`, dont
  `DamageCalculatorBrowser.tsx`). La cause est déduite de la structure et du
  constat ; le mécanisme exact de Turbopack n'a pas été lu dans ses sources.
- **Piste** : une route statique par outil (ou un segment par outil sous
  `[slug]`), et une liste de slugs qui n'importe pas les composants.

### A4 — Flux RSC de plusieurs mégaoctets sur trois pages · gain : analyse et mémoire sur mobile, peu de transfert

Le flux RSC est rejoué par React à l'hydratation : sa taille brute pèse sur le
temps d'analyse et la mémoire, même quand Brotli le réduit beaucoup.

| Page (EN)                                | HTML brut | dont RSC | HTML br | Cause                                                                                                                                                                                                               |
| ---------------------------------------- | --------: | -------: | ------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/guides/guild-raid/frost-legion`        |  4 356 Ko | 4 203 Ko |   61 Ko | 40 panneaux de boss pré-rendus (onglets) ; **852 Ko d'objets `style`**, dont les 8 propriétés `mask*`/`WebkitMask*` d'[`EffectChips.tsx:55-67`](../src/components/character/EffectChips.tsx) répétées 1 676 fois    |
| `/patch-history`                         |  3 349 Ko | 3 292 Ko |  245 Ko | tous les posts de la langue, **contenu complet**, passés en props ([`patch-history/index.tsx:30-32`](../src/app/[lang]/tools/_contents/patch-history/index.tsx)) alors que la page n'en affiche qu'une page repliée |
| `/damage-calculator`                     |  3 063 Ko | 3 013 Ko |  127 Ko | props du navigateur, surtout `targets` (≈ 4 600 entrées `spawns`/`stage`/`wave`, construit [`damage-calculator/index.tsx:697`](../src/app/[lang]/tools/_contents/damage-calculator/index.tsx))                      |
| `/guides/general-guides/premium-limited` |  1 576 Ko | 1 141 Ko |   42 Ko | non détaillé                                                                                                                                                                                                        |

Les quatre autres guides de raid de guilde suivent le même schéma que
`frost-legion` : `dignity-of-the-golden-kingdom` 3 253 Ko de RSC,
`prevent-world-alteration` 2 101 Ko, `madman-laboratory` 2 088 Ko,
`planetary-control-unit` 1 894 Ko. Viennent ensuite deux world boss et trois
special request entre 719 et 872 Ko.

### A5 — Les préchargements de l'accueil tirent 1,7 Mo de JS et 1,9 Mo de RSC · gain : données mobiles, se résorbe en partie avec A1

- **Page** : `/`. Premier chargement : 690 Ko de JS. Après repos réseau et
  défilement : **2 369 Ko de JS en 33 fichiers et 1 929 Ko de RSC**. Le
  surplus vient du préchargement des liens visibles par `next/link` :
  `/equipment` (223 Ko RSC), `/characters` (182 Ko), deux guides, les fiches
  des bannières, et le chunk d'A1 (737 Ko) tiré par `/characters`.
- Le JS préchargé n'est pas exécuté : le coût est le transfert, pas le CPU.
- Une partie est un **artefact du routage local** : en `path`, les liens de
  langue du pied de page (`/jp`, `/kr`, `/zh`, `/fr`, `/es`, chacun deux fois,
  55–61 Ko) sont préchargés ; en production (`subdomain`) ce sont des liens vers
  un autre hôte, que Next ne précharge pas. **Non vérifié en production.**
- Même phénomène, à plus petite échelle, sur `/characters/snow` (2 235 Ko de
  JS après repos contre 1 065 au premier chargement).

### A6 — Pour mémoire : ce qui est déjà paresseux et le reste

- Tables du calculateur (`src/lib/data/damage-tables.ts:14-31`) : cinq chunks,
  **9,3 Mo bruts / ~670 Ko br**, chargés au choix d'un attaquant
  (`use-damage-tables.ts`). Déjà à la demande ; le coût d'analyse reste élevé
  sur mobile, mais n'est payé que par qui calcule.
- Archive `data/patch-notes/legacy-posts.json` : chunk de 2,8 Mo bruts /
  315 Ko br, chargé à la demande (`src/lib/data/patch-legacy.ts:10`).
- `datagen/assets/portrait-fx.json` + moteur WebGL : 251 Ko, paresseux
  (`SettingsPortrait.tsx`).
- `data/generated/transcend.json` (17 Ko) est dans le premier chargement de
  presque toutes les pages via `Portrait.tsx`/`Thumbnail.tsx` →
  `src/lib/transcendence.ts`. Faible.
- CSS : `globals.css` sort en un seul fichier de 237 Ko bruts sur chaque page.
  Hors du périmètre JS, signalé pour mémoire.

---

## B. Accessibilité

Échantillon : `/`, `/characters/snow`, `/characters`, `/tier-list-maker`,
`/guides/dimensional-singularity/urd-light`, en bureau et en mobile.
axe ne relève **aucune violation** de contraste sur les jetons de couleur du
thème (calculés : `content-subtle` #cbd5e1 donne 12,7:1 sur `surface-base` et
9,9:1 sur `surface-overlay`).

### B1 — Aucun lien d'évitement : 19 tabulations avant le contenu · toutes les pages

- **Mesure** : en bureau, le premier élément du contenu est atteint à la
  **20e tabulation** sur les cinq pages (logo, 5 liens de navigation, les 10
  liens du sous-menu Guides, recherche, réglages, langue). En mobile, à la
  5e (le menu est replié).
- **Fichiers** : aucun lien « Aller au contenu » dans
  [`src/app/root-document.tsx`](../src/app/root-document.tsx) ni
  [`src/components/layout/HeaderClient.tsx`](../src/components/layout/HeaderClient.tsx) ;
  le `<main>` n'a pas d'ancre cible.
- WCAG 2.4.1 (A).

### B2 — Les réglages s'ouvrent avec le focus sur le voile `aria-hidden` · toutes les pages

- **Mesure** : bouton « Site settings » + Entrée → l'élément focalisé est
  `<button aria-hidden="true" tabindex="-1" class="… absolute inset-0 …">`,
  le voile de fermeture. Un lecteur d'écran n'annonce rien.
- **Cause** : [`src/hooks/useDialogFocus.ts:5-6`](../src/hooks/useDialogFocus.ts) —
  le sélecteur `FOCUSABLE` retient `button:not([disabled])` sans exclure
  `tabindex="-1"` ; le voile est le premier bouton du dialogue
  ([`SettingsModal.tsx:114-120`](../src/components/layout/SettingsModal.tsx)),
  et `SettingsModal` n'a pas de cible `initial` (`:91`). Il devient aussi la
  borne du piège à focus. `SearchModal.tsx:162-168` a le même voile, mais
  donne `initial: inputRef` : son ouverture est correcte (vérifié) ; son cycle
  de tabulation n'a pas été vérifié en détail.
- WCAG 2.4.3 (A), 4.1.2 (A).

### B3 — Contrôles de formulaire sans nom accessible · fiches perso, tier-list-maker

| Contrôle                                                                           | Page                              | Fichier                                                                                                    | axe                      |
| ---------------------------------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------ |
| Curseur de transcendance (`input type="range"`, seul le `aria-valuetext` est posé) | 129 fiches                        | [`EeTranscendSection.tsx:199-208`](../src/components/character/detail/EeTranscendSection.tsx)              | `label`, critique        |
| Niveau du codex (`<select>` sans libellé)                                          | 129 fiches                        | [`StatsRankingSection.tsx:200-204`](../src/components/character/detail/StatsRankingSection.tsx)            | `select-name`, critique  |
| Tri du vivier (`<select>`)                                                         | `/tier-list-maker`                | [`tier-list-maker/PoolPanel.tsx:138-142`](../src/app/[lang]/tools/_contents/tier-list-maker/PoolPanel.tsx) | `select-name`, critique  |
| Recherche de perso, titre de la tier list : nommés par leur seul `placeholder`     | `/characters`, `/tier-list-maker` | `filters/FilterAtoms.tsx:338`, `tier-list-maker/Toolbar.tsx`                                               | accepté par axe, fragile |

WCAG 1.3.1, 4.1.2 (A).

### B4 — Focus peu ou pas visible sur les champs de saisie · liste, tier-list-maker

- Les liens et boutons parcourus ont tous un anneau de focus. Les champs, non :
  - recherche de `/characters` et titre de `/tier-list-maker` :
    `focus:outline-none`, seul le **liseré de 1 px** change de couleur
    (gris-bleu → bleu de l'accent, #42566e → #38bdf8 sur la recherche) ;
  - libellés de rangée du tier-list-maker (`<textarea>` S, A, B…) :
    `focus:outline-none` et **aucun** changement mesuré au focus (contour,
    ombre, bordure, fond identiques).
- **Fichiers** : `src/components/character/filters/FilterAtoms.tsx:338-344`
  (champ de recherche, `focus:border-accent … focus:outline-none`),
  `tier-list-maker/Toolbar.tsx:70` (titre), le `textarea` des rangées dans
  `tier-list-maker/ui.tsx:290`.
- WCAG 2.4.7 (AA) pour les textarea ; 2.4.11 (AA, 2.2) pour le liseré de 1 px.

### B5 — Sélecteur de langue : rôle `listbox` sans flèches, nom qui ne contient pas le texte visible · toutes les pages

- **Mesure** : ouvert à l'Entrée, `↓` ne déplace pas le focus (il reste sur le
  bouton) ; les options ne s'atteignent qu'à la tabulation. Un lecteur d'écran
  annonce une liste de choix et attend les flèches.
- Le bouton affiche « EN » et s'appelle « Language » : le nom ne contient pas
  le texte visible (axe `label-content-name-mismatch`, sérieux). Même règle
  pour le bouton de recherche (visible « Search… ⌘K », nom « Search
  characters, equipment, guides... »).
- **Fichier** : [`LanguageSwitcher.tsx:137-179`](../src/components/layout/LanguageSwitcher.tsx)
  (`aria-haspopup="listbox"`, `role="listbox"`, `role="option"`) ;
  bouton de recherche dans `HeaderClient.tsx`.
- WCAG 2.5.3 (A) ; 4.1.2 pour le rôle annoncé.

### B6 — Structure des titres · fiche perso

- `/characters/snow` : **deux `<h2>` « Exclusive Equipment » consécutifs**.
  La page pose le titre de section
  ([`characters/[slug]/page.tsx:695`](../src/app/[lang]/characters/[slug]/page.tsx)),
  et `EeTranscendSection` repose le sien
  ([`EeTranscendSection.tsx:52`](../src/components/character/detail/EeTranscendSection.tsx)).
- Le reste est propre : un `<h1>` par page, niveaux sans saut sur l'accueil, la
  fiche et le guide (h2 → h3 → h4).
- `/characters` et `/tier-list-maker` n'ont que leur `<h1>` : la grille et les
  filtres ne sont pas balisés. Navigation par titres inutile sur ces pages ;
  pas une non-conformité.

### B7 — Contraste

- **Violation mesurée** : compteur du vivier, `/tier-list-maker` —
  #1d5676 sur #38bdf8, **3,7:1** pour 4,5 attendu (texte 12 px).
  [`PoolPanel.tsx:124`](../src/app/[lang]/tools/_contents/tier-list-maker/PoolPanel.tsx)
  (`opacity-60` sur un onglet actif `bg-accent`).
- **Lu dans le code, non mesuré sur page** (affichage conditionnel) :
  « coming soon » en `text-zinc-600`
  ([`StatsRankingSection.tsx:330`](../src/components/character/detail/StatsRankingSection.tsx)),
  ≈ 2,4:1 sur `surface-base`.
- **Non vérifié** : texte posé sur des images (noms sur les portraits de
  `/characters` — 159 nœuds —, bannières de l'accueil, en-tête de fiche) :
  axe ne sait pas calculer ces cas, et les images de `img.outerpedia.com`
  étaient inaccessibles depuis l'environnement d'audit (voir plus bas).
- Pour mémoire : 54 emplois de `text-[8px]`/`text-[9px]` dans `src/`. Pas de
  seuil WCAG, mais à la limite de la lisibilité.

### B8 — Mineurs

- Deux `<nav>` sans nom sur les guides : le menu
  ([`HeaderClient.tsx:165`](../src/components/layout/HeaderClient.tsx)) et le
  fil d'Ariane ([`guide-detail.tsx:134`](../src/app/[lang]/guides/[category]/[slug]/guide-detail.tsx))
  — axe `landmark-unique`. `QuickToc` et `TocBar` ont déjà un `aria-label`.
- Mobile, toutes les pages : le lien du logo contient une image dont l'`alt`
  répète le texte voisin (axe `image-redundant-alt`).

### Ce qui a été vérifié et tient

- Sous-menu Guides atteignable au clavier (`group-focus-within`, constat G22
  de l'audit transverse traité).
- Modale de recherche : focus dans le champ à l'ouverture, piège tenu sur 12
  tabulations, Échap ferme et rend le focus au bouton.
- Modale de réglages : piège tenu sur 25 tabulations, Échap ferme et rend le
  focus (hors B2).
- Menu mobile : s'ouvre à l'Entrée, la tabulation entre dans les liens, Échap
  le referme.
- Tooltips (`InlineTooltip`, Radix HoverCard) : s'ouvrent au focus du
  déclencheur, pas seulement au survol.
- `lang` du document juste ; un seul `<main>`.

---

## Ce qui n'est pas vérifié

- **Images et contraste sur image** : `img.outerpedia.com` est refusé par le
  proxy de l'environnement d'audit. Les pages ont été testées sans leurs
  images : contraste du texte sur image et rendu visuel non vérifiés.
- **Production** : compression réellement servie (Caddy, Cloudflare), et
  préchargements en routage `subdomain` (A5) non mesurés. Les tailles br sont
  calculées, pas observées sur le réseau.
- **Temps** : aucun chiffre de LCP, TBT ou INP, ni profil CPU sur mobile. Le
  coût d'A4 est déduit de la taille, pas chronométré.
- **Lecteurs d'écran** : aucun test avec NVDA, VoiceOver ou TalkBack ; les
  constats B viennent d'axe, du DOM et du parcours clavier automatisé.
- **Langues** : poids et accessibilité mesurés en anglais seulement. Les
  routes et chunks sont les mêmes dans les cinq autres langues ; les longueurs
  de texte (B5, contraste) ne l'ont pas été.
- **Échantillon** : cinq pages pour l'accessibilité. Les outils autres que le
  tier-list-maker (calculateur, hero-tracker, OST…) n'ont pas été audités ;
  l'audit transverse (G20, G21) y avait déjà relevé des points clavier.
- **Cause d'A3** : constat mesuré, mécanisme Turbopack déduit.

## Mesures brutes (pages les plus lourdes, EN)

JS = scripts du premier chargement ; RSC = flux inline du HTML.

| Page                                      |  JS brut |  JS br |    HTML brut |         RSC |
| ----------------------------------------- | -------: | -----: | -----------: | ----------: |
| `/tools`                                  | 2 120 Ko | 546 Ko |       142 Ko |       69 Ko |
| 17 outils (`/ost`, `/damage-calculator`…) | 2 109 Ko | 544 Ko | 119–3 349 Ko | 68–3 291 Ko |
| 93 guides                                 | 1 837 Ko | 481 Ko | 138–4 356 Ko | 78–4 202 Ko |
| `/characters`                             | 1 758 Ko | 459 Ko |       955 Ko |      243 Ko |
| 129 fiches perso                          | 1 065 Ko | 264 Ko |     ≤ 375 Ko |    ≤ 195 Ko |
| 289 fiches équipement                     | 1 002 Ko | 243 Ko |     ≤ 238 Ko |    ≤ 107 Ko |
| `/equipment`                              |   968 Ko | 238 Ko |       641 Ko |      333 Ko |
| `/`                                       |   690 Ko | 184 Ko |       193 Ko |      118 Ko |
| `/legal` (socle)                          |   644 Ko | 174 Ko |       105 Ko |       62 Ko |

Chunks lourds (fichiers du build) : `28nklen803sep.js` 737 Ko (A1),
`06homiml358ig.js` 292 Ko (A2), `21kikw-tlcoml.js` 229 Ko et
`3szkjp_nh-3gc.js` 157 Ko (framework). Les noms changent à chaque build.
