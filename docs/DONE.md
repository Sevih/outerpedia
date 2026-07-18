# DONE — journal du suivi interne

> Pendant « fait » de [TODO.md](./TODO.md) (décision Sevih 2026-07-17 : le TODO
> ne garde que le « à faire »). Un item traité migre ici avec sa date ; le
> détail vit dans git. Ne pas confondre avec le `CHANGELOG.md` racine (public).

## 2026-07-18

- **`useMediaQuery` mémoïsé** (perf UI publique, « en passant » de l'item
  ResponsiveCharacterCard). `subscribe` et `getSnapshot` étaient recréés à chaque
  rendu → `useSyncExternalStore` se désabonnait/réabonnait à `window.matchMedia`
  à CHAQUE rendu ; multiplié par les ~200 cartes de `/characters` (2 requêtes
  chacune), du churn pur. Passés en `useCallback([query])`. Zéro changement de
  comportement. Bénéficie aussi à TeamSlotCarousel. Typecheck OK. RESTE (décision
  Sevih) : le layout-shift sm→lg à l'hydratation de la carte elle-même — fix
  structurel non trivial (les 3 tailles ont des DOM différents + FitText mesure
  en JS), à trancher avec lui.

- **Caches périmés (partie src) STAMPÉS sur le mtime du curé** (bug moyen —
  process admin long-running). `gear-reco.ts` (`famByMember`) et `rewards.ts`
  (`gearIndex`) indexaient membre→famille d'équipement dans un cache module
  PERMANENT. Or les familles sont matérialisées depuis `data/curated/equipment.json`
  (nom/icône/slug/source/passifs) — mutable via l'admin, `loadEquipmentEditorial`
  le relit à chaque appel. Les deux caches contredisaient donc l'en-tête « l'admin
  voit ses écritures immédiatement » : une réédition de l'éditorial n'apparaissait
  qu'au redémarrage. Fix : `equipmentEditorialStamp()` exporté d'equipment.ts
  (source unique du chemin curé, `statSync` → mtime, `-1` si absent) ; les deux
  caches se re-bâtissent quand le stamp bouge (même patron que `loadCuratedEffects`
  et monster-store). Structure d'index inchangée. Typecheck + 353 tests OK. RESTE
  (worker) : les caches DATAGEN équivalents (v2-control, manifest faceIconIndex,
  equipment groupKidsCache, goods/recruit).

- **Index des clés curées MUTUALISÉ (`resolveEffectKey` ↔ skill-view)** (dette
  code / duplication + cache périmé, d'une pierre deux coups). `resolveEffectKey`
  (effects.ts) faisait un scan linéaire `Object.entries(loadCuratedEffects())
.find(c.keys.includes(key))` à CHAQUE résolution de titre de section ; skill-view
  maintenait en parallèle un index `curatedKeyCache` (`nature|clé`→id) mais dans
  un cache module PERMANENT (jamais invalidé → périmé dès que l'admin réécrit le
  curé). Fusionnés en `curatedKeyIndex()` (effects.ts) : deux vues (`byKey` pour
  resolveEffectKey, `bySideKey` pour skill-view), mémoïsé sur l'IDENTITÉ de
  l'objet renvoyé par `loadCuratedEffects` (qui bascule au mtime) — donc frais
  dans le process admin, contrairement à l'ancien cache permanent. Sémantique
  préservée à l'octet (premier-gagnant dans l'ordre du fichier). +2 tests
  d'invariant (index fidèle au scan linéaire ; toute clé curée reste résoluble).
  Typecheck + 353 tests OK.

- **Câblage buff/debuff des PERSOS dans l'éditeur** (matrice admin — parité
  partielle avec l'éditeur de monstre). Constat Sevih : l'éditeur perso ne
  touchait qu'aux champs curés (rank/rôle/prio/tags/vidéos), jamais au câblage
  d'affichage des chips de skills, alors que le monstre l'a (MonsterKitEditor).
  Périmètre ACTÉ (le rendu perso est déterministe, contrairement au monstre où
  tout s'empile sur un porteur) : **masquer + ajouter uniquement**, PAS de
  déplacement inter-cartes (`chipOwner`) — question posée, réponse « Masquer +
  Ajouter ». Livré :
  • Couche curée `data/curated/character-skills.json` — `chipHide` (cardId →
  refs `tooltip/label` masquées) + `chipAdd` (cardId → réfs tooltip du
  glossaire ajoutées). cardId = id du skill (mains/fusion_passive/extra), id
  du chain_passive pour la chaîne, `…::dual` pour le duo.
  • Moteur : `CharacterKitCuration` + `characterCurated()` (lecture disque
  tolérante au fichier absent) + `applyCardCuration()` (filtre LOCAL) threadés
  dans `cardEffects(skills, s, curated?)` et `buildChainView(skills, lang,
curated?)` — l'admin passe `{}` pour les positions « règles pures ».
  • Store `character-skill-curated-store.ts` (patch card-scoped, `writeJson`
  canonique, `_doc` préservé, clés triées) + route `POST
/api/admin/curated/character-skills` (403 hors dev).
  • Composant `CharacterKitEditor` (× masque / + ajoute, identité par
  carte+ref, datalist du glossaire) branché dans l'éditeur perso.
  • 2e passe `mergeStatusEffects` sur la fiche publique ET l'extractor pour
  résoudre le statut des `chipAdd` (nom/icône/nature) — même patron que
  BossPanel. Fichier curé vide au départ → rendu public byte-identique tant
  qu'aucune curation n'est posée. Typecheck + lint (fichiers propres) + 351
  tests verts. NB : `skill-view.ts` reste sans test unitaire (chantier TODO
  priorité 1 séparé).

- **Wrappers de guides uniformisés sur le re-export 1 ligne** (dette code /
  duplication). 64 `index.tsx` qui ne faisaient que forwarder `{...props}` à un
  composant de rendu partagé (EncounterBossGuide ×30, VersionedBossGuide ×11,
  StagedBossGuide ×10, TowerGuide ×8, GuildRaidGuide ×5) passent de 6-8 lignes à
  `export { X as default } from '…'` — modèle déjà prouvé par les 31 monad-gate.
  NON touchés : les 34 wrappers qui INJECTENT un `content.json` local
  (BossGuide & co, le re-export sec ne peut pas passer le contenu) et les 12
  vrais contenus éditoriaux de `general-guides`/`other` (100-485 lignes). Le
  loader (`guide-detail.tsx`) lit `mod.default` — re-export transparent.
  Typecheck OK, 27 tests guides verts.

- **`StatInline` / hex éléments — faux doublon levé, mort retiré** (dette code /
  duplication). Le `StatInline` local d'`EquipmentDetail.tsx` était flaggé
  « redondant avec `inline/StatInline` » : VÉRIFICATION → ce n'est pas un
  doublon. Le local résout l'icône depuis `statKey`, tronque le nom, n'a pas de
  tooltip ; le partagé prend `name/iconSrc/desc` pré-résolus + tooltip. Rôles et
  habillages distincts. Renommé `EquipStatChip` (l'homonyme induisait le faux
  constat de doublon) + docstring qui explique la distinction. `detail/theme.ts` :
  seul `.hex` d'`elementAccent()` était consommé — les 4 champs alpha
  (`glow/soft/softer/border`) + l'interface `ElementAccent` étaient CALCULÉS
  MORTS ; réduit à `elementHex(): string`, `ELEMENT_HEX` dé-exporté (n'était lu
  qu'en interne). Les valeurs miroitent globals.css (`--fire`…) : commentaire
  renforcé (seconde source assumée, pas indépendante). Le vrai single-source CSS
  (`var(--${element})`) est REPORTÉ — il casse sur la clé `dark` vs `--dark-elem`
  et touche des styles inline SSR de la fiche perso (risque visuel, relecture).
  Typecheck OK.

- **Code mort — exports src sans consommateur** (dette code, chaque symbole
  RE-VÉRIFIÉ par grep repo+datagen avant retrait). SUPPRIMÉS : `elementName`/
  `className` (game-tokens.ts — seul `splitGameTokens`/`GameToken` importés),
  `tagDesc` (tags.ts), et tout le cluster `SuffixLang`/`getLangConfig`/`GameLang`/
  `GAME_LANGS`/`isGameLang` de `i18n/config.ts` — c'était une COPIE côté site,
  self-référentielle (aucun rendu ne la lisait) ; la vraie notion « langue de
  jeu » vit côté données dans `datagen/lib/lang.ts`, très utilisée (laissé un
  commentaire qui pointe là). Repli INOPÉRANT retiré de `guide-sections.ts:69-72` :
  le 2ᵉ `resolveEffectKey(côté inversé)` ne pouvait jamais réussir, la fonction
  testant DÉJÀ en interne le côté demandé puis l'opposé puis le curé (effects.ts).
  DÉ-EXPORTÉS (usage uniquement interne à leur fichier) : `resolveRewardEntry`
  (rewards.ts), `EffectTooltipBody` (EffectChips.tsx), `ELEMENT_HEX` (fait à
  l'item theme.ts). `gearIssueCounts` : déjà absent. GARDÉS À DESSEIN :
  `getMonthYear`/`buildVideoObjectJsonLd`/`buildFaqJsonLd` (seo.ts) — /tierlist
  et /tools sont inventoriés en « Pages manquantes ». Typecheck + 351 tests OK.

- **`data/legacy/` SUPPRIMÉ (249 fichiers) — l'oracle V2 déposé** (fin du PRIO #1).
  Trois familles de lecteurs coupées : (1) OUTILS ONE-SHOT obsolètes (migration
  finie) — `import-equipment`, `import-gear-reco`, `seedFromLegacy` +
  `datagen/curated/seed.ts`, scripts `datagen:seed-curated`/`extract-entity`.
  (2) ORACLE DE COUVERTURE (« qu'a-t-on zappé vs V2 ? ») — `core/diff.ts`,
  `extractor/run.ts`, `specs/index.ts` supprimés ; `coverage`/`FieldStatus`/
  `CoverageSpec` retirés de `core/spec.ts` + `core/runner.ts`, bloc `coverage:`
  de `specs/character.ts` retiré (le moteur `runSpec` et `characterSpec` RESTENT :
  `buildCharacters` s'en sert). (3) REPLIS RUNTIME — pros-cons legacy était du
  CODE MORT (keyé par slug, appelé par id V3 ; les 46 persos 100 % en curé) →
  repli retiré de `pros-cons.ts` + scan legacy de `tag-control.ts` ; icônes
  d'effets (105/193 effets sans icône de jeu) RAPATRIÉES du glossaire V2 vers
  `data/editorial/effect-icons.json` (versionné V3), `datagen/lib/effects.ts`
  repointé. Vérifié : `buildEffectGlossary()` produit un glossaire d'effets
  BYTE-IDENTIQUE au committé, legacy absent (l'éditorial couvre tout) ; typecheck
  - lint + 351 tests OK. RESTE hors legacy : le regen coupons/banner (EXCEPTION
    jusqu'à bascule prod, cf. TODO).

- **CSP resserrée : `unsafe-eval` retiré du script-src en PROD** — il n'est
  requis QU'EN DEV (le HMR / React Fast Refresh de Next s'appuie sur eval) ; un
  build de prod n'en a pas besoin. `script-src` construit dynamiquement :
  `unsafe-eval` n'entre que si `NODE_ENV !== 'production'`. Vérifié — prod →
  `script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com`
  (sans eval), dev → avec eval. Prérequis vérifié avant : aucun `eval`/`new
Function` dans `src/`, aucune dépendance cliente eval-suspecte. Au passage, le
  `isDev` du fichier était dupliqué (défini deux fois) — dédupliqué en tête.
  RESTE (TODO) : nonce + strict-dynamic pour retirer `unsafe-inline`. NB : la CSP
  ne prend effet qu'au prochain déploiement — un smoke-test du build prod reste
  la confirmation ultime avant bascule.
- **Factorisations admin (switches / pickers / sidebars)** — trois paires quasi
  dupliquées fusionnées. (1) `EntitySwitch({id, mode, entity})` générique remplace
  CharacterSwitch + MonsterSwitch (identiques au segment de route près), 4 call
  sites. (2) `SearchPicker<T>` : châssis de sélecteur cherchable (recherche →
  dropdown → aperçu + « changer »), CharacterPicker et ItemPicker deviennent des
  adaptateurs minces passant leur filtre/classement, icône de ligne et aperçu du
  sélectionné en callbacks. (3) `CharactersSidebar` (spécialisée) fusionnée dans
  `ExtractorSidebar` (générique, superset) : adaptateur `characterExtractorRows`
  mappe `SidebarRow`→`ExtractorRow` (face `FI_<id>`, élément/classe en overlays
  du portrait, rareté en étoiles), un champ `marker` générique porte le ✎ « curé ».
  3 composants supprimés. Vérifié : typecheck + lint + 351 tests OK. La sidebar
  perso adopte l'UX générique (nom d'abord, overlays) — à confirmer d'un coup d'œil.

- **Homonymes dédupliqués (partie non-admin)** — deux pièges levés. (1) Les
  constantes d'ordre d'équipement vivaient en copies : `GRADE_RANK`/`GRADE_ORDER`
  ×3 (equipment.ts, equipment-detail.ts, char-progression.ts — la 3ᵉ sous un nom
  DIFFÉRENT pour la même table) et `PIECE_ORDER` ×2 (equipment-detail, gear-reco)
  → source unique `src/lib/data/gear-order.ts` (module feuille, zéro import → pas
  de cycle), branchée aux 4 fichiers, nom uniformisé `GRADE_RANK`. Un grade ou
  une pièce ajoutés par le jeu se changent désormais à UN endroit. (2) `gearById`
  homonyme piégeux : rewards.ts définissait une fonction LOCALE `gearById`
  (résout une FAMILLE) tout en important `gearById` d'equipment.ts aliasé en
  `gearPieceById` (résout une PIÈCE) — deux « gearById » de retours différents
  dans le même fichier. La locale renommée `gearFamilyById` (+ 2 appels). RESTE
  (cf. TODO) : `rankOptionLabels` et `BOSS_TYPES` (touchent l'admin, zone du
  worker) + l'index `resolveEffectKey`. Typecheck + 351 tests OK.
- **Éditeur de recos : aperçu iconographique « à vue »** (demande Sevih) —
  l'éditeur `GearRecoEditor` listait des ids bruts dans des `<select>`. Un
  `<option>` HTML ne peut pas porter d'image → à côté de chaque sélecteur, un
  aperçu du sprite de l'item choisi (endpoint `/api/admin/sprite`, dev, comme
  `GearDetail`) : armes, amulettes, talismans (badge `$` pour un preset, ⚠ pour
  un id irrésolu, carré vide si rien). Les sets (preset-only dans l'éditeur)
  affichent les icônes des sets du preset — `GearOption` porte désormais son
  `icon`, la page éditeur résout slug→pièces→icônes (`setPresetIcons`). Vérifié :
  icônes résolues (armes/sets/presets), 351 tests verts, typecheck + lint OK.

- **Primitive `HeatSlider` — dédup RankSlider ↔ EncounterSlider** — les deux
  glissières d'échelle longue (palier de boss dans BossStats, stage dans
  EncounterSelection) partageaient ~90 lignes quasi identiques : le double-ref
  `hit`/`rail` (zone d'écoute vs mesure — le geste tactile correct), `pos`,
  `clamp`, `indexAt`, capture de pointeur, clavier (←/→ un cran, Page↑/↓ trois,
  Début/Fin), boutons ◀▶, rail + dégradé de chaleur + pouce. Extrait en composant
  `src/components/guides/HeatSlider.tsx` qui rend le CHÂSSIS et prend en props ce
  qui diffère : graduations (`marks`), contenu du pouce (`thumb`), libellés du
  bas (`labels`), et les dimensions (`railClass`/`padClass`/`thumbClass`). Les
  deux appelants deviennent de simples adaptateurs (RankSlider = badges de grade
  - repères E…SSS ; EncounterSlider = numéros de stage, dans sa carte). Classes
    Tailwind reprises À L'IDENTIQUE par appelant → rendu et gestes inchangés (à
    confirmer d'un coup d'œil). Imports react devenus inutiles retirés des deux
    fichiers. typecheck + lint + 351 tests OK.
- **Intégration PAR ENTITÉ pour l'item** (complète l'extracteur d'items) — bouton
  « Intégrer » (ou « Retirer » si l'id a disparu du frais) sur chaque ligne du
  diff de `/admin/extractor/items`. Cœur `integrateItemData(dir, id)` EXTRAIT
  dans `item-catalog.ts` : reporte la seule entrée fraîche dans `items.json`
  (tri `catalogCompare`, canonique) — désormais PARTAGÉ entre le rebake de
  l'éditeur curé (`bakeItemCatalogEntry`, réduit à une façade) et la revue
  d'extraction (`integrateItem`), plus de logique dupliquée. Wrapper
  `integrateItem` : entrée + staging de l'icône (`images/items/…`, sautée si
  placeholder blacklisté). Route `POST /api/admin/integrate/item/[id]`,
  `ExtractorReview` reçoit un prop `integrateKind` optionnel (bouton par ligne,
  générique). Vérifié : ré-intégration idempotente (0 diff `items.json`), 351
  tests verts, typecheck + lint OK.

- **Stores d'édition curée : écriture au format CANONIQUE** — les 6 stores admin
  (`curated-store` persos, `effects-store`, `item-curated-store`, `gear-reco-store`,
  `monster-skill-curated-store`, `promo-banner-store` coupons/banner) écrivaient
  en `JSON.stringify(sorted, null, 2)` au lieu du sérialiseur canonique
  (`writeJson`/`formatJson` de `datagen/lib/json`). Conséquence : les tableaux
  courts (`tags`, `videos`…) s'éclataient en multiligne, donc chaque édition d'UNE
  entité via l'admin reformatait TOUT le fichier (diff git géant — vu en direct
  quand Delta a été ajouté au curé). Tous passés en `writeJson` ; les mutateurs
  (`upsert*`, `apply*`, `save*`, `regen*`) et leurs 8 routes deviennent async
  (`await`). Vérifié : les 8 fichiers `data/curated/*` sont déjà canoniques (rien
  à reformater — le fix est purement code), 351 tests verts, typecheck + lint OK.
  Piège documenté dans l'en-tête de `lib/json.ts`, désormais fermé côté admin.
- **A11y des barres d'onglets (roving tabindex) + micro-fixes** — les 5
  implémentations `role="tablist"` du site (ui/Tabs, guides/SegmentedTabs,
  EncounterSelection, MonsterLineup, TeamSlotCarousel — l'audit en citait 4)
  n'avaient AUCUNE navigation clavier ni liaison onglet↔panneau. Helper unique
  `src/lib/tablist.ts` (`onTabListKeyDown`) : ←/↑ recule, →/↓ avance (cyclique),
  Home/End aux extrémités, sélectionne ET déplace le focus. Roving tabindex
  posé partout (`tabIndex` 0 sur l'actif, −1 sinon → Tab entre/sort de la barre,
  les flèches naviguent dedans). Les deux primitives à panneau unique (ui/Tabs,
  SegmentedTabs) gagnent en plus `id`/`aria-controls` sur les onglets et un
  panneau `role="tabpanel"` lié (`aria-labelledby`, focusable) — sémantique
  d'onglet conditionnée à « >1 onglet » dans SegmentedTabs (sinon aria-labelledby
  pointerait dans le vide). Micro-fixes du même audit : LicenseTabs — face avant
  nommée (`revealLabel`) et seule la face VISIBLE focusable/exposée (backface-
  hidden ne masque qu'au visuel) ; TowerFloorMenu — `aria-label` sur la
  recherche (placeholder ≠ label) ; EeTranscendSection — boutons +/- redondants
  (le slider est la commande accessible) sortis de l'arbre a11y + du focus au
  lieu d'`aria-label="-"/"+"` ; GearRecoSection — `aria-pressed` sur le sélecteur
  de build. Aucun changement visuel. 351 tests verts, typecheck propre (mon
  périmètre).
- **Extracteur d'ITEMS** (PRIO Sevih — l'entité manquante de la matrice) —
  nouvelle cible de revue `item` (`buildItemCatalog` : items + goods + costumes
  - overlay curé baké, exactement la forme d'`items.json`), mémoïsée sur les
    tables d'items ET `data/curated/items.json` (l'éditeur d'items le réécrit, la
    revue doit le refléter). Page `/admin/extractor/items` sur le composant
    générique `ExtractorReview` (diff jeu↔site new/diff/typo + « valider toute
    l'extraction » + « corriger les typos »), helper `itemReviewProps` qui résout
    les noms via l'union committé ∪ frais (nouveaux et disparus nommés), exposé
    par un `targetBuild(id)` (build frais mémoïsé, gratuit après `reviewTarget`).
    Entrée de menu Extractor (Item en fin, aligné sur l'Editor) + ligne de la
    matrice d'accueil (couverture curée X/N). Vérifié : 0 faux positif
    (`buildItemCatalog()` == `items.json` committé, 1171 items), 351 tests verts,
    typecheck datagen + lint OK. RESTE : intégration PAR ENTITÉ (bouton) — le
    « valider tout » global marche déjà.
- **Intégration par entité pour l'ÉQUIPEMENT** (PRIO Sevih — pendant gear de
  `integrateCharacter`) — bouton « Intégrer » sur les fiches extracteur (armes,
  amulettes, talismans, EE, sets) qui valide CETTE entité sans passer par le
  promote global. Cœur `integrateEquipmentData` (datagen, testable, injecté sur
  dossier temp) : merge toutes les lignes de la FAMILLE (plusieurs paliers
  d'étoiles) dans son fichier de slot + son entrée dans `families.json` + les
  records PARTAGÉS qu'elle référence (pools/passifs/paliers de casse) — comme
  `integrateCharacter` embarque les skills, sinon réfs pendantes côté site pour
  une famille neuve ; seuls les records référencés entrent (pas les voisins).
  Wrapper `integrateEquipment` : extraction fraîche + staging des images
  (icônes d'items + de passifs, + PNG og de l'icône représentative). Glossaires
  transverses laissés à `datagen:build` (une famille neuve réutilise des grades/
  classes déjà committés). Route `POST /api/admin/integrate/equipment/[kind]/[id]`,
  bouton `IntegrateGearButton` (rapport fichiers + images), câblé dans
  `GearDetail`. +6 tests (merge non destructif, refs ciblées, idempotence,
  upsert de famille, entité inconnue). 340 tests verts, typecheck + lint OK.

- **Oracle de test `combat-power`** — la formule de Combat Power sans équipement
  (reverse-engineered, « validée 0-diff in-game par le gear-solver ») n'avait
  aucun test. Verrouillée par 11 cas en deux familles : (1) invariants hand-
  dérivés du modèle, exacts et indépendants du cœur stat-dépendant — +500 par
  étoile UI, +120 par « +1 », +100 par niveau de skill au-dessus de 1, +5000 en
  Core Fusion, cap du crit rate à 100 % (130 ≡ 100), sortie entière ; (2) quatre
  snapshots de régression sur des profils réalistes (DPS crit, tank HP/DEF,
  support fusionné, crit cappé + coude du facteur crit) figés à l'état validé.
  Une modif du cœur fait bouger les snapshots → revue explicite.
- **`stamp-guides` : deux défauts corrigés (dates de guides auto)** — le stamp
  maintient `meta.updated` au commit (le build ne voit pas git). Défaut 1
  (diff parasite) : le stamp réécrivait le meta en `JSON.stringify(…,2)`, qui
  ÉCLATE en multiligne les tableaux courts que prettier garde inline (ex.
  `"dungeons": ["100805"]`). Comme le commit maison saute les hooks
  (`--no-verify`), le meta partait non-prettier et rebondissait en diff au
  `format:check` suivant. Piège latent (aucun des 141 metas re-stampé depuis la
  baseline, donc jamais déclenché) mais réel : prouvé qu'un bump aurait éclaté
  les tableaux. Fix : sérialisation via l'API Node de prettier (le CLI aurait
  interprété les `[lang]` du chemin comme un glob), qui reprend le `printWidth`
  du repo — sortie byte-identique à prettier, vérifiée sur un meta à tableaux +
  bump e2e réel. Défaut 2 : `--all` SANS date suivante dégradait silencieusement
  en mode normal (bump des seuls guides modifiés) au lieu de la baseline —
  désormais refus explicite. Au passage : le contrôle « le stamp attrape-t-il
  tout le pertinent ? » a été refait — tout le contenu d'un guide vit dans son
  dossier (zéro contenu partagé hors dossier, zéro import remontant), archives
  de versions exclues sauf la plus récente (même regex/tri que `guides.ts`).
  Limites ASSUMÉES : le contenu dérivé de `data/generated` ne bump pas (dérive
  de data ≠ édition) et les images (`public/images/guides/…`, hors `_contents`)
  non plus.
- **Recos (gear-reco) de Ryu Lion (2000097) + Delta (2000121) mises à jour
  depuis V2** — le snapshot legacy était figé ; sync des fichiers V2 à jour
  (`reco/2000097.json`, `reco/2000121.json` — nouveau, `reco/_presets.json`
  +preset de sets `a2s2` = Attack×2/Speed×2) puis ré-import `import-gear-reco.ts`.
  Périmètre vérifié strictement borné : côté curé, seuls `2000097` + `2000121`
  changent (Delta ajouté, 90 persos / 246 builds), presets = +`a2s2` seul ; 0
  référence irrésolue. Preuve d'absence de divergence : un ré-import à blanc du
  legacy inchangé reproduit le curé à l'identique. LIMITE connue (pipeline, pas
  une régression) : seules les notes EN sont capturées, les `Note_fr/jp/kr/zh`
  V2 sont ignorées pour les 90 persos. TODO ajouté : rendre l'UI d'édition des
  recos fidèle au rendu public (icônes, main stats).
- **Comparaisons V2 RETIRÉES de l'admin** (PRIO Sevih #1) — l'oracle a joué son
  rôle. Supprimés : `datagen/extractor/v2-control.ts`, `coherence.ts`,
  `src/lib/admin/equipment-control.ts`, `V2ControlPanel`, `EquipmentReport`,
  `v2MissingInV3` + `v2Reference` (effects.ts), script `datagen:coherence`.
  Toutes les pages extracteur (persos, effets, EE, armes, amulettes, armures,
  talismans, sets) tournent désormais sur le moteur `review` (diff jeu↔site
  new/diff/typo) via le composant générique `ExtractorReview` — index des
  équipements refaits à partir d'un helper `equipmentReviewProps(kind)` (noms
  résolus par famille/vue). Fiche perso extracteur : panneau V2 retiré (garde le
  diff extraction↔committé + intégration). GearDetail : bloc « Contrôle V2 »
  retiré (garde l'affichage info). Sidebars sans colonne `v2≠` ; badges du menu
  admin sur les buckets review (plus `equipmentV2Control`/`v2MissingInV3`).
  Éditeur d'effets : référence V2 retirée. Ordre du side-menu Extractor/Editor
  ALIGNÉ (demande Sevih). Vérifié : 0 code de comparaison V2 restant, 334 tests
  verts, extraction équipement sans faux positif. RESTE (cf. TODO) : déposer
  `data/legacy/` (encore lu par les specs datagen + imports one-shot).
- **Helper `normalizeLang` — fin du boilerplate lang (18 occurrences)** — chaque
  page répétait le bloc « await params » suivi de la normalisation
  copiée-collée du param de langue (garde de type puis repli sur un littéral en
  dur, avec un cast). Un seul helper exporté par la config i18n remplace les 18
  occurrences dans 9 pages, plus la copie privée du module SEO (dédupliquée).
  Le repli passe du littéral en dur à la langue par défaut de la config (même
  valeur aujourd'hui : l'anglais est la langue par défaut) — comportement
  identique, un seul endroit à changer si le défaut bouge. Le cast disparaît :
  le helper renvoie directement le bon type. Nettoyage induit : l'import du type
  Lang, devenu inutile là où le cast était sa seule référence, retiré des 7
  pages concernées. La garde `layout.tsx` (qui rejette une langue invalide en 404) garde volontairement la garde de type brute — sémantique différente.
- **`shopSourceLabel` : fin des trois `shopLabel` divergents** — le libellé d'un
  slug de boutique (source d'équipement) était calculé en trois copies : les
  pages liste/fiche équipement repliaient sur le slug brut pour un slug hors
  `adventure_license`/`event_shop`, tandis que la fiche perso traduisait via un
  cast `t(\`equip.source.${s}\`)`— rendant la CLÉ brute pour un slug inconnu.
Un nouveau slug se serait donc affiché différemment selon la page. Source
unique`shopSourceLabel(slug, t)`dans`data/equipment.ts` (map slug→clé +
REPLI ASSUMÉ sur le slug brut), branchée aux 3 sites. Data actuelle : 2 slugs
seulement (`event_shop`, `adventure_license`, tous deux traduits), donc rendu
  visible inchangé — c'est le risque futur qui est fermé.
- **Modèle admin « intégration = seule porte »** (PRIO Sevih) — deux volets :
  - _Extraction montre TOUT_ : la spec perso ne filtre plus sur `ShowMainPage`
    (elle gardait de fait les non-« sortis » invisibles). On garde exactement
    normaux (`ownIdentity`) + core-fusion, et on EXCLUT les form-changes
    (`CharacterChangeTemplet`, ex. Luna 2000119↔2000120) comme les skins.
    Résultat vérifié : +1 seul perso (Lambda 2000118), zéro skin/forme. La
    sidebar extracteur le liste en « new » (nom/élément/classe résolus).
  - _`pnpm dev` ne promeut plus auto_ (`scripts/dev-refresh.ts` : `apply:false`).
    Le site sert la donnée INTÉGRÉE (`data/generated` committé) ; les changements
    du jeu s'affichent en diff (extracteur + dry-run console) et s'intègrent
    DÉLIBÉRÉMENT — par entité (bouton `integrateCharacter`, écrit direct dans
    generated) ou via `promote --apply` manuel. Commentaires promote.ts/README
    corrigés (l'« apply auto en dev » n'existe plus).
- **Garde-fou des cibles internes `{L}`** (bug sévérité HAUTE) — `checkTag`
  validait `{L/…|/guides/…}` en `ok: true` inconditionnel : un lien de guide
  MORT passait le contrôle CI (seul `RelatedGuides` jetait, au render). Comme
  `parse-text` ne peut pas importer `data/guides` (node:fs → casse le bundle
  client), la validation est INJECTÉE : `checkText(text, { guideHrefExists })`
  reçoit un prédicat, le cas `L` contrôle les hrefs `/guides/...` (landing racine,
  landing de catégorie, ou fiche `catégorie/slug`) et ignore externes/ancres/
  label-seul. Le prédicat est câblé dans `guides.test.ts` (les 2 scans, plats +
  versionnés) sur `getGuide` + `GUIDE_CATEGORY_SLUGS` : un lien éditorial mort
  casse désormais le test. Vérifié : les 25 `{L}` internes existants valident
  tous. +4 tests (`parse-text.test.ts`) verrouillant le garde-fou (mort→échec,
  vivant→ok, sans validateur→ok, externe/ancre→ok).
- **Équipement remis dans le circuit SEO** (fiches `/equipment/*`) — elles
  étaient absentes de `sitemap.ts` ET de `/llms.txt`, avec une meta description
  identique sur tout le catalogue et un titre `« X – Outerplane » | Outerpedia`
  incohérent (les persos font `X | Outerpedia`). `allEquipmentSlugs()` existait
  pour ça mais était mort. Câblé : (1) sitemap + `/llms.txt` listent les 272
  fiches (58 armes + 55 accessoires + 15 talismans + 21 sets + 123 EE) via un
  nouveau `allEquipmentEntries()` (slug + nom EN, dont `allEquipmentSlugs`
  dérive maintenant) ; (2) titre = `model.name` seul (aligné sur les persos) ;
  (3) description UNIQUE par item : nouvelle clé `page.equipment.meta_description`
  templée `{name}`, ajoutée aux 5 langues (cohérence inter-langues préservée,
  `Record<TranslationKey>` l'impose). **`generateStaticParams` volontairement
  PAS ajouté** : le point d'audit était un faux problème — l'équipement se rend
  à la demande puis se cache 24 h (`revalidate` + `dynamicParams`), une page ISR
  reste indexable et le sitemap déclenche le 1er crawl. C'est le modèle EXACT
  qu'ont suivi les étages de tour quand on a retiré leur `generateStaticParams`
  (commit c38561f : +1360 pages au build évitées, décision assumée en commentaire
  de la route).
- **Dédup de chips d'effet alignée sur l'affichage (`EffectChips`)** — la clé de
  dédoublonnage clivait la nature en `category === 'debuff'` alors que
  l'affichage (couleur de la pill) la clive en `category !== 'buff'` : un effet
  `neutral`/`cc` sans statut nommé était PEINT en debuff (rouge) mais KEYÉ en
  buff, si bien qu'un chip rouge et un chip vert de même nom pouvaient fusionner
  (données : `neutral` ×715, `cc` ×389). Règle unique extraite en helper exporté
  `isDebuffEffect(category, statusIsDebuff?)` (`statusIsDebuff ?? category !==
'buff'`), branché aux 3 sites : affichage `EffectChip`, clé de dédup
  `EffectChipsRow`, et pills admin `monsterChipMeta` (`skill-view.ts:58`, déjà
  correct — passé par le helper pour verrouiller). Les statuts homonymes de
  natures OPPOSÉES documentés (Starving Devil buff 1076 / debuff 1077) restent
  distincts : ils portent un `isDebuff` curé, inchangé. +2 tests
  (`EffectChips.test.ts`) gravant le contrat.
- **`LOCK_SCREEN_OVERRIDES` trié (unlock-content.ts)** — les 11 overrides
  passés au crible (override forcé vs convention `SYS_CONTENS_LOCK_<CT>` vs
  `TextID` de la ligne vs nom du donjon). Constat de fond : le nom primaire est
  bâti sur une CONVENTION qui rouille (6 valeurs conventionnelles périmées), les
  overrides sont des rustines par-dessus. Tri : 7 vraies corrections (donnée
  absente/périmée, gardées), 2 « épinglage explicite » IRREGULAR_INFILTRATE /
  IRREGULAR_CHASE (la convention donne déjà le même texte — gardées, documentées
  comme telles), 2 alignées sur le `TextID` de la ligne (PVE_REMAINS_LOOP,
  PIECE_DUNGEON — annotées). AGIT_CUSTOM_CRAFT n'était PAS une correction mais un
  choix éditorial (« Precise Craft », terme du site entier, vs « Precision
  Crafting » de la convention, les deux valides/à jour) : sorti du générateur
  (qui ne fait que de la donnée) et déplacé en `modeName` éditorial dans
  `notes.ts` où il a sa place. Rendu visible du guide INCHANGÉ (« Precise
  Craft » via l'éditorial), commentaire de tête du générateur reformulé.
- **Panneau admin : matrice repensée + moteur de diff jeu↔site généralisé**
  (PRIO Sevih, 1re moitié). Le panneau d'accueil (`/admin`) ne compare plus la
  V2 : chaque entité montre le diff **committé (`data/generated`) vs extraction
  fraîche** en trois buckets **new / diff / typo** (colonne Extract), et la
  **couverture curée X/N** (colonne Édition — le « 1 » énigmatique devient
  « 142/143 curés »). Fondations : classifieur **typo** porté à l'identique de
  la V2 (`normalizeTypo` : replie blanc + ponctuation pleine largeur/CJK +
  guillemets simples courbes + `…` ; NE replie PAS les guillemets doubles, comme
  la V2) + `diffBuckets` dans le cœur PUR `core/changes.ts` (+5 tests) ; registre
  `TARGETS` étendu de 2 → 9 (character, monster, effect, ee, weapon, amulet,
  armor, talisman, set), effets ciblés via `select` sur `glossaries.json`.effects,
  `buildEquipment` mémoïsé (1× au lieu de 6×). Vérifié zéro faux positif :
  `reviewAll` sur la data committée rend `new=0 diff=0 typo=0 removed=0` partout.
  RESTE (cf. TODO PRIO) : pages extracteur PAR ENTITÉ + suppression `v2-control`.
- **Robustesse des éditeurs admin (4 bugs de l'audit 17/07)** :
  - _13 `fetch` sans `try/catch`_ → helper partagé `src/lib/admin/post-json.ts`
    (`postJson` : parse tolérant, jette le message serveur `error`/`errors[]`,
    supporte le contrat `200 {ok:false}`). Les 13 composants enveloppés en
    `try/catch`(+`finally` sur l'état busy séparé) — plus de bouton figé sur
    erreur réseau. `MonsterActions` (la référence) consomme le helper au lieu
    de son `post` local dupliqué.
  - _Listes keyées par index_ → util `src/lib/admin/keyed.ts`
    (`rowKey`/`withKey`/`stripKey`, `_key` synthétique retiré avant
    sérialisation) sur Banners, PromoCodes (+ récompenses), CharacterCurated
    (paliers), Editorial (pros/cons + groupes), GearPresets, GearReco (dont le
    piège `structuredClone` de « Dupliquer »). Supprimer une ligne ne transfère
    plus la recherche du picker à la voisine.
  - _`eeReport` O(n²)_ → `eeModelForView(view)` exposé dans `equipment-detail`,
    modèle EE bâti depuis la vue en main (fin des re-matérialisations de
    familles + `.find` par slug ; `loadCuratedEffects` hissé) — O(n).
  - _Caches `monster-store`_ (`siteIdsCache`, `tooltipNamesCache`) passés au
    régime `{stamp}` établi : sentinelle `tablesStamp(['TextSystem'])`
    (+ `fileStamp` du curé équipement pour `siteMonsterIds`).
- **Guide « Daily Stamina Burn » porté** (economy, ordre 3) : contenu verbatim
  V2 (labels 5 langues, roadmap 5 priorités, suggestions hors endgame, pro
  tips) sur les primitives éditoriales ; les noms des boss irréguliers
  DÉRIVENT de monsters.json (la V2 les codait en dur). Entrée curée « Gems »
  ajoutée pour les tags {I-I/…} (générique, icône V2 TI_GEM_dissolve_Random_3).
- **Daily Stamina : corrections post-relecture Sevih** (414344c) — « Bounty
  Hunter » est l'ANCIEN nom du mode, devenu Hypnotic Frog Hall
  (SYS_GOLD_DUNGEON) : la note utilise le vrai {I-I/Frog Hall Ticket}
  (SYS_ASSET_TICKET_GOLD, seul consommé par DungeonTemplet ; le jumeau legacy
  TICKET_EXP, homonyme et consommé nulle part, est masqué en curé pour gagner
  la résolution par nom). L'entrée custom « Bounty Hunter Ticket » saute. Les
  boss pointent sur les fiches pursuit 512020xx (celles des guides
  irregular-extermination) : noms complets 4 langues, y compris l'Irregular
  Queen — fini le repli éditorial (les fiches 40xxxxx ont la Queen sans nom).
- **Ether income : cadence bimestrielle** — guild raid et world boss ont lieu
  UN MOIS SUR DEUX (info Sevih ; la V2 les comptait chaque mois) : champ
  `monthsPerCycle` sur les sources, colonne/totaux en moyenne mensuelle, note
  « Held once every 2 months — reward from {min} to {max} » dérivée des
  échelles.
- **Guide « Ether Income » porté** (tier economy, ordre 1 ; unlock-content
  reste 2) : les QUATRE échelles de récompenses par rang (arène 24 paliers,
  guild raid, world boss 4 ligues, singularity) DÉRIVENT désormais du jeu —
  nouveau générateur `ether-rankings.json` (RewardTemplet.Crystal = Ether,
  vérifié sur l'arène et la singularity, valeurs V2 à l'identique). Constat :
  les valeurs V2 de guild raid et world boss étaient PÉRIMÉES (le jeu les a
  doublées — top 1 raid 1500 → 3000) ; l'Ether du world boss vient du
  classement GLOBAL_WORLD (MY_WORLD paie titres/cadres/tickets), ligues de la
  saison courante par StartDate. Noms de paliers = noms officiels du jeu
  (arène, ligues) + gabarits Top/Rank/Below ; notes de rang = gabarits
  {min}/{max}/{league} remplis des données générées. Éditorial verbatim
  (sources régulières, libellés, variables) ; calculateur client re-stylé V3
  (formatage numérique à locale fixe — mismatch d'hydratation sinon).

## 2026-07-17

- **Guides « Premium & Limited » (ordre 2) et « Core Fusion » (ordre 3)
  portés** (tier pulls) : reviews/priorités/labels transplantés VERBATIM
  (script) ; tout le reste DÉRIVE du jeu — sweetspots de transcendance
  (`getTranscendSweetspots`, paliers officiels — la V2 rechargeait ses textes
  côté client), coûts de fusion (`CharacterFusionLevelTemplet`, plus de
  `[300,150…]` en dur), paires base↔CF (plus de `replace('2700','2000')`),
  renommages de skills dérivés de skills.json (24/24 identiques au
  `cf-skill-names.json` V2 — item TODO soldé par vérification), EE base↔CF
  (données équipement V3). Primitives partagées
  `components/guides/editorial/reviews/` (HeroReviewCard, PriorityTiers, blocs
  premium/fusion). beginner-faq : carte RelatedGuides premium-limited
  réactivée (les 3 liens 404 de la section Bugs haute sont résorbés ; le
  garde-fou `{L}` reste en TODO). Icônes pve/pvp (éditorial) + icônes des 2
  guides collectées.
- **Archive des bannières purgées** — `data/curated/recruit-banners.json`
  (seed : release 2023 de Regina, purgée des tables du jeu) + garde anti-purge
  dans le générateur recruit : toute bannière du recruit.json promu qui
  disparaît des tables sans être archivée (ou assumée via `dropped`) casse la
  génération. Constat : le banner.json V2 était saisi À LA MAIN (éditeur admin
  dev-only) — dates à ±1 j et bannière d'Ais fabriquée, non reprises.
- **Écarts V2 résorbés** (audit 4 guides du 17/07, 4 agents, textes 5 langues
  comparés octet à octet) : intro de free-heroes restaurée (seule vraie perte
  de contenu rendue), description PIECE_DUNGEON d'unlock-content revenue au
  verbatim `{I-I/Hero Piece}` (l'item curé existe désormais). Reste ouvert :
  pattern « titres en page V2 » (H1 meta seul en V3) et mileage du Custom Rate
  Up (Elemental vs Custom) — décisions Sevih.
- **Layout, passe de fidélité 2 (retours Sevih)** — icône tierlist basculée
  sur `CM_Mission_Icon_Daily` (manifest + collecte, ui 190 ✓) ;
  LanguageSwitcher refait à l'identique V2 : dropdown drapeau + abréviation,
  liste avec badges officiel/communautaire et note de repli, variante
  `mobile-chips` dans le drawer (libellés passés en props — pas de contexte
  i18n client), navigation V3 conservée (préfixe de path + ?query/#hash) ;
  drapeaux SVG branchés partout via `img.flag` (ils étaient DÉJÀ collectés
  par le bloc éditorial du manifest) ; icônes de marque tranchées :
  react-icons comme la V2 (social rapide Discord/GitHub/RSS + bandeau
  officiel Reddit/YouTube/X…) ; chips de langues du footer alignées
  (drapeau + abréviation + pastille communautaire). Deux items « Pages
  manquantes » soldés (drapeaux, icônes de marque). GV : lue depuis
  `data/generated/game-version.json` (resVersion du jeu extrait), plus de
  variable d'env comme en V2.
- **Layout terminé : header/nav/footer, FIDÈLES à la V2 sur tokens V3**
  (PRIO Sevih ; « pas le même du tout » corrigé après premier jet minimal) —
  contrat `src/lib/nav.ts` (5 items V2 + EXTRA_PAGES pour la future
  recherche, sprites de jeu déclarés). Header = structure V2 complète :
  logo + badges v/GV, nav à icônes (libellé court < xl, long ≥ xl),
  DROPDOWN Guides (catégories de `GUIDE_CATEGORIES`), collapse au scroll
  (hystérésis V2), drawer mobile (icônes, chevrons, sous-menu guides,
  langues) ; l'emplacement recherche est réservé. Footer = structure V2 :
  marque + tagline + chips sociaux + CHIPS DE LANGUES, 4 colonnes
  repliables en mobile (`<details>`, zéro JS), bandeau officiel Outerplane,
  disclaimer, barre légale avec point de version. `game-version.ts` SORT du
  code mort (consommé header + footer). Les 5 sprites de nav ajoutés au
  manifest et COLLECTÉS (ui 185→190 ✓ — push R2 au prochain commit).
  Cibles 404 assumées — inventaire complet en section TODO
  « Pages manquantes ».
- **Texte en dur des 5 langues éradiqué** (2 commits — le site est servi en
  EN par défaut, le FR en dur fuyait chez tout le monde) : home
  (`characters.filters.count`), meta description fiche perso
  (`page.character.meta_description`, clé V2 pré-seedée), Footer
  (`footer.tagline`), ShareButtons (strings en props), selects
  d'EquipmentBrowser (options slug→libellé via `sys.*`, pattern
  CharactersBrowser), breadcrumb JSON-LD, srSuffix ; puis les aria/titres
  épars : FullArtCarousel, étoiles de CharacterCard (gabarit `{rarity}`),
  ImageLightbox, « by {author} » des vidéos (`video.by`, 6 sites câblés),
  tooltip CP (`page.character.cp_title`), « min → max »/« Step »
  d'EquipmentDetail. +13 clés ×5 langues. NB : ImageLightbox garde des
  défauts EN pour les appels du guide roadmap-2026 (à câbler quand ce guide
  repassera en chantier).
- **Détection émulateur d'`init.ps1` fiabilisée** : sous PS 5.1, `2>$null` sur
  adb + EAP global `Stop` transformait le stderr bénin (« daemon not running;
  starting now ») en exception → émulateur déclaré absent à tort au premier
  lancement, pipeline data sauté. EAP local `Continue` (portée fonction) ;
  bug et remède reproduits sur PS 5.1 réel.
- **« 18 générateurs » soldé** : le décompte de référence (20, characters/
  monsters exclus — ils vivent dans l'extracteur) est gravé à UN seul endroit
  (datagen/README couche 3) ; ROADMAP et CHANGELOG y renvoient au lieu de
  citer un nombre qui périme (l'énumération du CHANGELOG citait encore
  characters/monsters).
- **Spec monstre : `spawns`/`summonedBy`/`linkedTo` COPIÉS à l'embarquement**
  — ils aliasaient les tableaux du cache mémoïsé partagé de `buildEncounters` :
  une mutation d'entité aurait corrompu le cache pour tous les consommateurs.
  MonsterSpawn est plat → copie à un niveau, sortie identique par construction.
- **`extract-face-layout.py` : le re-scan complet FUSIONNE** (`cache.update`)
  au lieu d'écraser — un prefab retiré du bundle garde son entrée committée
  (rétention, comme le reste du pipeline ; ce mode est joué par `refresh.ts`).
  Au passage : le nom de fichier faux du docstring d'usage corrigé (item
  Doc ↔ code de l'audit).
- **`content-schedule` : garde sur `_unknown_0`** — le main boss guild raid
  vit dans une colonne sans en-tête que seul le parseur nomme (absente du
  schéma déclaré, 17/36 lignes la portent) : si plus aucune ligne ne la porte
  (colonne renommée par le jeu), warn explicite au build au lieu de saisons
  sans main boss en silence. Iso-sortie prouvée IDENTIQUE, garde muette
  aujourd'hui.
- **`convert.ts` purge les tables fantômes** : les `.json` de
  `.gamedata/parsed/` sans `.bytes` source (table retirée du jeu) sont
  supprimés en début de run — ils restaient servis à vie par `loadTable`.
  Testé e2e : fantôme planté → purgé, 257/257 tables converties.
- **`BuildRequirements` : ordre SPD déterministe** — l'ancien comparateur
  renvoyait 0 face à une entrée sans SPD (non transitif → ordre indéfini).
  Désormais : les entrées à SPD connue se trient entre elles (décroissant),
  celles sans SPD gardent leur position d'écriture — l'auteur fait foi, et la
  promesse « ordre DOM = ordre de jeu » redevient vraie.
- **`LanguageSwitcher` conserve query + hash** : l'état des guides vit dans
  l'URL (`?…` + `#version=`/`#team=`) et le switch de langue le perdait.
  Search/hash lus AU CLIC (le hash n'existe pas côté serveur et ses
  `replaceState` n'émettent aucun événement) → clic simple intercepté vers
  `router.push(path + search + hash)`, clic modifié/molette garde le href nu.
- **`commit.ts` : bump de version différé** — le choix reste à l'étape 2 mais
  l'écriture de package.json attend l'étape commit (avant le `git status`,
  pour qu'un commit « bump seul » reste possible) : tout abandon (bump,
  message vide, Ctrl-C) ne modifie plus rien, fini les versions sautées.
  Prouvé : bump choisi puis abandon → md5 de package.json inchangé (l'ancien
  code l'avait déjà écrit à ce stade).
- **Erreurs avalées sur les curés éradiquées** : `readCuratedJson` dans
  `datagen/lib/json.ts` (pendant lecture de `writeJson`) — fichier absent =
  `undefined` (pas de curation, cas normal), JSON cassé = **throw nommant le
  fichier** (un curé cassé décurait silencieusement la donnée servie,
  `pnpm dev` auto-appliquant le promote). Les 4 avaleurs convertis
  (curated/equipment, curated/effects, overrides familles de lib/effects,
  item-catalog) + les 2 parsers nus contextualisés (mode-titles d'encounters,
  ancre de singularity — leurs warns sémantiques inchangés). 5 tests
  synthétiques CI-safe (`json.test.ts`, tmpdir) ; iso-sortie prouvée sur
  items.json (IDENTIQUE).
- **`IL2CPP_SO` supprimée de `dump.ts`** (décision Sevih) : la paire
  .so/metadata se ré-extrait de l'émulateur à chaque dump — un `.so` imposé
  n'avait aucun cas d'usage (variable jamais documentée ni posée), et
  metadata absente → l'extraction écrasait silencieusement le fichier fourni
  par celui de l'émulateur.
- **Alerte « 93 assets guides refaits depuis le pool V2 » levée** : vérifié —
  `../outerpedia` à jour avec origin, 0 clé nouvelle, 92/93 fichiers identiques
  octet à octet à l'état R2 (`pushed.json`) ; l'unique diff
  (`CT_Detail_Slot_Lock_Open.webp`) est la face dérivée localement des cartes
  promotion, ré-encodée à l'identique visuel — poussée légitime au prochain
  commit.
- **Collecte d'assets soldée à 0 manquant** (après V2_DIR) : les 2 icônes
  `IG_Buff_Action_Gauge_Up/Down` (overrides curés dont le sprite source a
  disparu des bundles du jeu) copiées du staging vers `data/editorial/ui/effect/`
  (pool V3 versionné — même pattern que Reversal_Buff) ; le générateur
  costumes filtre désormais les entrées sans nom résolu (contenu pas encore
  sorti : COSTUME_97/102 des persos 2000118/2000120 retirés d'items.json, ils
  reviendront à la sortie du contenu).
- **Config fixe/portable `V2_DIR`** : le chemin `../outerpedia-v2` en dur
  cassait le pool V2 et le regen coupons/banner sur les machines où le repo
  s'appelle `../outerpedia`. Nouveau `datagen/lib/env.ts` (parse `.env.local`
  mémoïsé — repris par r2.ts — + `v2Dir()`/`v2ImagesDir()`), consommé par
  `promo-banner-store` (Next lit V2_DIR nativement), `stage.ts` et
  `manifest.ts` (la double définition du pool est morte). Documenté dans
  `.env.example`, `V2_DIR=../outerpedia` posé dans le `.env.local` local.
  Résultat mesuré : `assets:collect` passe de 55 à 4 manquants (editorial
  14/14, ui 185/185, guides ✓).
- **Bug `_NAME`→`_DESC` (items.ts + enhance.ts)** : quand `NameID` ne suivait
  pas la convention, le `replace` ne changeait rien et la « description » émise
  était le nom — 97 entrées de `items.json` contaminées. Garde
  `descKey !== NameID` posée aux deux endroits, regen + promote appliqués
  (~97 entrées corrigées, 0 restante), cohérence et tests verts.
- **Code mort supprimé** (aucun consommateur, vérifié par grep + typecheck
  complet) : kit `src/components/ui/` jamais importé (`Badge.tsx`, `Card.tsx`,
  `Pill.tsx`, `Surface.tsx`), alias historiques `getItems`/`getItem`
  (items.ts), alias `CostumeItem` des contrats (CostumeEntry reste interne à
  datagen).
- **Audit complet du site** (7 passes par zone : app, components ×2, lib/i18n,
  datagen ×2, scripts/config — findings versés dans TODO.md, sévérités hautes
  contre-vérifiées). État au moment de l'audit : typecheck/lint OK,
  319/319 tests verts, commit `7d30203`, v0.1.21.
- **`assets-push.mjs --purge-only`** : l'état `pushed.json` était écrit AVANT le
  `exit(0)` du mode purge — des assets jamais uploadés étaient marqués
  « poussés » et sautés à jamais. Sortie déplacée avant l'écriture d'état.
- **`get-news.ts`** : le `catch { break }` de pagination avalait TOUTE erreur
  (réseau, 500, DNS) → exit 0 avec « 0 new ». Le statut HTTP est porté par
  l'erreur ; seul le 400 (fin de pagination WP) « break », le reste remonte.
- **CI** : `node-version-file: .nvmrc` (au lieu de `24` en dur) +
  `pnpm format:check` ajouté au job check (le formatage n'était vérifié nulle
  part côté serveur, lefthook étant sautable).
- **`package.json`** : `prepare` — `|| true` (inexistant sous cmd.exe) →
  `|| echo skip`.
- **`src/__tests__/smoke.test.ts` supprimé** (placeholder 1+1 ; la stack est
  prouvée par les 27 fichiers de tests co-localisés). Dossier `__tests__` vide
  supprimé avec.
- **`.env.example`** : bloc `R2_*` (4 variables requises par chaque
  `pnpm commit`) + `V2_DIR` ajoutés commentés (`V2_DIR` documentée mais pas
  encore lue par le code — cf. chantier prio du TODO).
- **`area_name`** — constat : DÉJÀ COUVERT, `AreaTemplet` est consommé par
  `encounters.ts` (champ `area` localisé + saison/épisode story) et
  `unlock-content.ts` — pas de fichier dédié à porter.

## 2026-07-16 (avant la réécriture du TODO — détail dans git)

- **Bugs** (commits `7d858d8`…, un par fix) : collecte tours VH (waves +
  encounters), `pnpm test` en CI, MonadRouteClient sur `useUrlSlice`, caches
  d'effects salés du mtime des curés (`fileStamp` TTLisé), butin monad
  instrumenté + label via `resolveOrNull`, nom stable `monad/theme.json`,
  warning `isoUtc`, heuristique goods contournée pour les clés adossées à une
  ligne item. Enums d'éveil VÉRIFIÉS contre les `NodeNameID` : aucun
  off-by-one (méthode gravée en commentaire dans progression.ts). Sortie monad
  prouvée identique octet à octet avant/après.
- **Tests** (suite à 319) : restrictions/compositions de tours
  (`towers.test.ts`), geas guild-raid (`geas.test.ts`), hash-params
  (`url-hash.test.ts`), vote-croisé c9ce852 (`resolveKeyWinners` extrait PUR —
  glossaire prouvé identique — + 5 tests synthétiques).
- **Dette code** (un commit par chantier) : code mort (accès monad/towers,
  no-op stamp-guides), loader partagé du curé effects.json, « or »/« Gold » de
  Monad Gate localisés, `#4cc2ff` tokenisé (`--buff-tint`/`--debuff-tint`),
  TowerGuide + TeamSlots sur `resolveGuideCharacter`, `pickSkills`
  (5 boucles → 1), `GuideCardArt`, `RosterGroupCard` (habillage very hard via
  `decorate`), équipe de StagedBossGuide sur SegmentedTabs `#team=` — règle
  hash/`?param` gravée dans les docstrings. Règle eslint RAW_COLOR étendue aux
  `.ts` + exemption resserrée à `characters/**`.
- **Config/infra** : `scripts/*.ts` sous typecheck (3ᵉ projet tsc),
  `data/extracted/` exclu du contexte Docker, `git gc` (5017 objets loose),
  branche `backup/site-rebuild` supprimée. Hygiène commits : `pnpm commit`
  refuse tout message non conventionnel.
