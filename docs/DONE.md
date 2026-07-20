# DONE — journal du suivi interne

> Pendant « fait » de [TODO.md](./TODO.md) (décision Sevih 2026-07-17 : le TODO
> ne garde que le « à faire »). Un item traité migre ici avec sa date ; le
> détail vit dans git. Ne pas confondre avec le `CHANGELOG.md` racine (public).

## 2026-07-21

- **Outil `/progress-tracker` porté** (+ hook `useStoredState` posé la veille,
  a06cdfe). Logique V2 réécrite en fonctions PURES
  (`_contents/progress-tracker/tracker.ts`, 28 tests) : `count` = seule source
  de vérité (« complété » = count ≥ max TOUJOURS dérivé des réglages — la V2
  stockait `completed`/`maxCount` en doublon et son `toggleTask` était du code
  mort), resets UTC (quotidien/lundi/1er) via arithmétique epoch, couloir
  infini (3 j après complétion), VHT (phases 1/8/15/22), fabrication précise
  (30 j glissants), singularité mer→sam, packs (Terminus/Veronica/licence).
  Persistance via les DEUX specs actés : `outerpedia:progress-tracker`
  (legacy `outerplane:progress`) et `…:settings` (legacy
  `outerplane:settings`), `coerceProgress` absorbe le schéma V2 (y compris le
  vieux « coché sans count »), clés V2 laissées en place. Le client ne lit
  JAMAIS le stocké tel quel : vue `reconcileProgress` à chaque rendu (tick
  60 s), mutations depuis la vue → resets persistés au premier geste, zéro
  effet de synchro. Définitions verbatim (`tasks.ts`, labelKey dérivé),
  wrapper serveur (libellés + 27 items du catalogue résolus par nom EN +
  sprites monnaies), UI V2 refaite sur tokens V3 (cartes-onglets / page
  unique, hiérarchie boutique, modales réglages 5 onglets + export/import —
  l'import accepte aussi un export V2 brut). 4 icônes nav + monnaie de guilde
  ancrées au manifeste (déjà sur R2 via le re-push du 20/07).

## 2026-07-20

- **Outil `/pull-simulator` porté.** Moteur pur dans `src/lib/gacha.ts`
  (4 bannières aux taux V2, session immuable, garantie 2★ du x10, mileage) —
  FIX au passage : la V2 amorçait le compteur « premier 3★ » à `totalPulls`
  avant de re-parcourir tout l'historique (numéro compté double dès la 2e
  salve) ; en V3 les deux compteurs comptent depuis zéro (helper unique,
  vérifié par smoke). Wrapper serveur : pools depuis le catalogue — entités
  CORE-FUSION EXCLUES (non tirables ; la V2 n'en avait pas dans son index),
  rareté 1/2 = pools mineurs, 3★ catégorisés par tags (premium /
  limited-seasonal-collab / normal), noms+préfixes localisés serveur,
  recherche multilingue via `characterSearchNames`+alias. Client sur les
  primitives V3 (FilterPill, CharacterPortrait wrappé, FitText, tokens ;
  ambre/violet = couleurs de donnée) : focus en combobox, x1/x10, mileage,
  cartes de résultat, stats de session, historique par batch. Identité par ID
  (plus de slugs — des 3★ sans fiche publique restent tirables).
- **Outil `/patch-history` porté + archive Stove migrée.** Le pipeline major9
  existait déjà (getNews → `posts.json`, images staged/R2) ; ce chantier a
  ramené le RESTE. ① Migration ONE-SHOT `scripts/migrate-legacy-news.ts` :
  `legacy-posts.json` (806 posts EN, archive figée) copié verbatim + les 2 749
  images RÉFÉRENCÉES par le contenu (déjà toutes .webp) copiées de la V2 vers
  le staging → 211 Mo poussés sur R2. Collecte DATA-DRIVEN : le dossier V2 en
  contenait 6 684 (originaux jpg/png, orphelins) — non embarqués. ② Outil :
  wrapper serveur (posts major9 de la langue courante ; en/jp/kr seulement →
  zh ET fr replient sur en, bandeau ; la V2 ne gérait que zh et le libellé fr
  du bandeau parlait du chinois — corrigé) + client (ères, filtres par type,
  recherche titre+contenu, pagination fenêtrée, posts dépliables, `?era&type`
  - `#slug` auto-déplié). L'archive legacy (2,8 Mo) n'est PAS dans le bundle :
    chunk chargé au premier passage sur l'ère Smilegate. ③ `prefixAssetSrcs`
    (images.ts) préfixe la base R2 sur les `src` relatifs stockés — solde
    l'item « Patch-notes : préfixer NEXT_PUBLIC_IMG_BASE » de l'ex todo-data.
    ④ CSS `.patch-note-content` porté sur les tokens V3.

- **Onglets « game » et filtres UNIFORMISÉS sur tout le site.** Le visuel
  d'onglet glow (`.tab-game-active`) devient LE style d'onglet : classes
  partagées dans `ui/game-tab` (SegmentedTabs, ui/Tabs `variant="game"`,
  onglets de builds de GearRecoSection), teinte paramétrable `--tab-glow`
  (défaut `var(--cd-el, ambre)` — la fiche perso teinte ses onglets à
  l'élément SANS style inline). `/equipment` : tabs → game (en gardant
  `?tab=`, règle hors guides) et filtres refondus sur la toolbar de
  /characters (SearchField/BarGroup/ToolbarDivider MUTUALISÉS dans
  FilterAtoms, pills élément/classe/étoiles multi-sélection). Filtre source
  en pills à icônes multi (OU) : portraits de boss (halo élémentaire) +
  boutiques (sprites CM_Adventure_License / CM_Shop_Shortcuts_EventShop,
  déjà sur R2) ; doublon Event Shop réglé À LA RACINE — le curé équipement
  gagne `source.shops` (slugs, vocabulaire de l'extraction), les 17
  `label: "Event Shop"` migrés, `resolveSource` fait l'union dédoublonnée ;
  queue de liste éditoriale (4 boss d'équipement puis boutiques, le reste
  alphabétique devant).
- **Variantes irregular, PASSE 2 : /equipment éclaté en cartes ET fiches PAR
  variante (retour Sevih : « 1 seule carte pour tous »).** Le browser rend
  UNE carte par variante (tuile/passif/nom suffixé/classe propres — plus de
  bloc « variants » groupé, retiré de cards.tsx) et chaque variante a SA page
  détail au slug suffixé (`briareoss-recklessness-defender`…) = les URLs V2
  (le suffixe était dans le nom → même slugify, les liens survivent). 20
  fiches : 2 armes ET 2 amulettes (Ambition/Vanity, couvertes par le même
  chemin). `classPassives` porte le `slug` de variante ; `gearModel` accepte
  une variante (nom/tuile/classe/SON passif/SES porteurs) ; le slug de
  FAMILLE reste servi en vue d'ensemble (compat V3, plus listé dans
  sitemap/llms) ; resolveItem/loot/stats lient la fiche de la variante.
  Manifest : PNG og pour TOUS les membres du palier max (+ passifs par
  variante), 13 assets poussés sur R2. tsc ×3 + eslint + 300 tests src verts.
- **Variantes de classe des items irregular (Briareos/Gorgon) distinguées
  partout (constat Sevih en relisant les outils gear).** En jeu ce sont 5
  objets distincts par item (un par classe : tuile ET passif propres) ; la V2
  les séparait en bakant « [Striker] » dans le nom à la main. La famille V3
  les groupait sous la tête (Striker) → BUG réel sur la fiche perso :
  `resolveItem` affichait la tuile ET le passif Striker pour un build
  référençant la variante Defender (ex. 2000106/787). Décision (tuile +
  suffixe, périmètre complet) : `classPassives` porte maintenant l'`icon` de
  chaque variante ; nouveaux helpers `withClassSuffix` (suffixe = libellé de
  classe OFFICIEL du jeu via `glossaries.classes` — « [Defender] » /
  「[防御型]」, comme la V2) et `memberClassVariant` (id membre → identité de
  SA variante). Corrigés : fiche perso + aperçu admin (resolveItem : tuile/
  passif/nom/classType de la variante), loot de donjon (nom suffixé),
  gear-usage-statistics et gear-usage-finder (clé `famille:classe` → 5 lignes/
  entrées par item, chacune sa tuile et sa classe), carte /equipment (chaque
  bloc de variante montre SA tuile ; la page détail taguait déjà par classe).
  Smoke test tsx sur les 3 vues + tsc + eslint + 300 tests src verts.
- **Règle « état interne d'un guide = hash » APPLIQUÉE partout (item Dette
  soldé).** `BannerTabs` bascule de `?banner=` (useUrlTab) au hash
  (`#banner=`, patron url-hash/SegmentedTabs, prop `urlKey`) ;
  `free-heroes-start-banner` ET `premium-limited` (3e contrevenant, découvert
  au passage) troquent `ui/Tabs ?tab=` contre `SegmentedTabs variant="game"
urlKey="tab"`. Plus AUCUN `?param` dans `guides/` ; `useUrlTab` reste le
  moteur de `ui/Tabs` seul (doc à jour). Vérifié : tsc propre, les 3 guides
  rendent en 200.
- **Tests générateurs : le TRIO PRIORITAIRE couvert (2270b92, 28 tests).**
  encounters/singularity/content-schedule, selon les deux registres actés
  (CI sans `.gamedata`) : cœurs PURS en synthétique (traversée spawn — CSV,
  slots ID0..3, dédup/accumulation — et `isoUtc` exporté pour ça) +
  INVARIANTS sur data/generated committé (références croisées d'encounters
  monstres/rewards/geas/rankOptions/spawns aller-retour/group mono-contenu,
  vagues tout-ou-rien conformes au contrat de sérialisation ; singularity
  rotation ordonnée + ancre curée + boss complets ; content-schedule tri,
  bornes ISO ordonnées, donjons des saisons SERVIES — jc tous, gr saison
  courante —, monstres de toutes les saisons, boss canonique courant).
  Reste dans l'item : les autres générateurs + build/refresh, même méthode.
- **Helpers seo.ts BRANCHÉS (c9cbb78) — VideoObject + FAQPage (item Dette
  soldé).** Pipeline video-meta porté de la V2 en mieux : collecte
  DATA-DRIVEN (marche des JSON de guides + curé persos) au lieu du scan
  regex des .tsx, fetch incrémental YouTube API (`pnpm datagen:video-meta`,
  YOUTUBE_API_KEY optionnel), purge des fantômes ; seed = cache V2 (169),
  complété à 221. `VideoJsonLd` (serveur, pendant SEO de MultiVideoEmbed
  client) branché dans les 5 moteurs de guides + la fiche perso — sans
  meta, rien d'émis (jamais de schéma invalide). `buildFaqJsonLd` branché
  sur beginner-faq : FAQ_LD déclaratif (14 Q/R en phase avec les QACard) +
  `plainInlineText` (parse-text) qui aplatit les tags pour le JSON-LD.
  Vérifié en dev : FAQPage 14 questions, VideoObject complet sur dahlia.
- **Outil `/gear-usage-finder` porté — même régime gear-reco à la lecture.**
  La V2 lisait un artefact de pipeline `gear-finder-index.json` ; en V3
  `finder.ts` assemble au rendu, depuis la gear-reco curée, les builds MIS À
  PLAT par FAMILLE (mains multi « ATK%/SPD » éclatées, presets `$` résolus —
  sets ET substats, priorité « A>B=C » éclatée en clés) + les catalogues
  sélectionnables (familles d'armes/amulettes avec `classLimits`/pools de
  mains, sets). Client `GearUsageFinderBrowser`, parité V2 : modes Recommandé
  (pièces/mains présentes dans les builds, main stricte) et Libre (tout le
  catalogue, scoring main=4 pts + 1/substat), parcours type → classe → pièce →
  main → substats, résultats en cartes triées par score (meilleur build par
  perso, compte de builds). Différences V3 assumées : unité = famille (pas la
  variante d'étoiles), restriction de classe vide = pièce montrée pour toutes
  les classes, mains du mode libre = pools réels de la famille (la V2 codait
  la liste en dur pour les armes). Pills de classe = `ClassIconPill` partagée.
  Smoke test tsx : 246 builds, 55/51/21 catalogues, éclatements vérifiés.
- **Outil `/gear-usage-statistics` porté — agrégation gear-reco à la lecture.**
  La V2 générait `gear-usage-stats.json` par un step de pipeline sur ses
  fichiers de reco par perso ; en V3 l'usage se calcule au rendu depuis la
  GEAR-RECO CURÉE (source unique des builds de fiche perso — `usage.ts`, même
  régime que most-used-units). Unité de compte = la FAMILLE d'équipement
  (armes/amulettes/talismans, presets `$` résolus) et le SET pour les armures ;
  ids inconnus/`!refs` non arbitrés SKIPPÉS (modèle `unresolved` de la fiche,
  pas une erreur) ; dédup par (perso, pièce). Abandonné : `buildNames` du JSON
  V2 — jamais affiché, et son accumulation était cassée (le `seen` par perso ne
  gardait que le premier build). Client `GearUsageBrowser` : onglets ×4 avec
  comptes, recherche multilingue, lignes classées (tuile `EquipmentIcon` —
  étoiles du haut de famille, passif/enchantement en overlay, cadre `unique`
  pour les sets comme /equipment —, barre proportionnelle, count) dépliables
  sur les persos (portrait + lien fiche). État local pur (parité V2, pas de
  sync URL). tsc (src) + eslint verts ; datagen/tests rouges = WIP du worker
  generators (content-schedule/encounters), hors périmètre — le bump sharp
  0.35 de ce chantier-là cassait par contre tout `pnpm typecheck` : corrigé
  (import nommé `type Sharp`, d12e5af).
- **Page `/changelog` du site livrée (entrée reconstituée depuis le
  TODO, le worker n'avait pas journalisé).** Journal du site refait propre
  (pas de portage V2) : socle données + migration des 134 entrées V2, page
  publique + section Recent Updates de la Home (rebranchée) + i18n (5
  locales), éditeur admin (store + route `.dev` + presets + lien typé +
  date/programmée/brouillon + regen V2 + sidebar Tools), flux RSS dédié
  `/feed/changelog` avec filtre de programmation. Vignette = og:image de la
  cible (garde-fou `og_default`) ; upload abandonné (inutile).
- **Outils admin Search aliases + Short names livrés (a36c228, worker
  aliases — entrée reconstituée).** Curés par perso. Le transitoire
  `@/lib/data/name-aliases` (importé mais inexistant, tsc cassé sur main
  quelques heures) a été résolu par SCISSION : `search-aliases.ts` (élargit la
  recherche) + `short-names.ts` (noms courts d'affichage) — vérifié, tsc
  propre. Solde aussi l'item « name-aliases.json à porter » de l'ex-section
  Données V2 (parité V2 atteinte via les deux curés).
- **H1 réellement centrés sur les pages du site (8588562).** Les headings
  sont en `width: fit-content` (globals.css, trait de titre du jeu) :
  `text-center` seul ne centre RIEN — le centrage passe par `mx-auto` sur le
  bloc. Vrais bugs corrigés (/contributors, /coupons, /changelog : intention
  `text-center` annulée par le fit-content) ; H1 à gauche centrés (/equipment
  en-tête complet, /legal, /guides/[category] bloc icône+titre, guide détail
  sans boss aligné sur la variante boss, /contribute ×4). Exclusions voulues
  (mises en page propres) : /characters/[slug], /tools, /tools/[slug],
  EquipmentDetail. Déjà bons : /characters, /guides, /tierlist, HomeHero.
- **Icône `bosses.json` unifiée sur l'id BRUT (décision Sevih : go).** Le
  générateur bakait `MT_<FaceIconID>` dans la donnée là où `monsters.json`
  stocke l'id brut (préfixe au rendu) — ambiguïté qui mordait en refactor
  (double préfixe / 404). Désormais : id brut partout, le sprite est une
  affaire de vue. `bosses.ts` (+ doc du type), 4 sites de rendu
  (GearRecoSection ×2, equipment/cards, EquipmentDetail) et le manifest
  d'assets préfixent `MT_` eux-mêmes ; `bosses.json` régénéré (diff = les 14
  champs `icon` exactement, promotion ciblée `--only`). Au passage, le
  dry-run de promote a CONFIRMÉ rétroactivement la neutralité de tous les
  refactors datagen du jour (39 fichiers identiques) et révélé un perso
  `lambda` (2000118) en attente dans l'extraction — non promu, décision de
  contenu. Vérifié : tsc, eslint, 461/461, fiche équipement en dev (émet
  `MT_4013071.webp`), assets:collect stable (mêmes clés R2, 0 re-staging).
- **`coupon-codes` résolu + coupons en RUNTIME R2 (zéro redéploiement).**
  ① `coupon-codes` n'est pas une page : renvoi vers `/coupons` (parité V2) —
  le champ `href` du curé outils, déjà présent dans `_index.json`, est
  maintenant SERVI (`ToolMeta.href`, landing `/tools`). ② Décision Sevih :
  un code poussé ne doit plus redéployer le site → patron du manifeste comics
  généralisé : `lib/home` lit `data/coupons.json` sur R2 à la requête
  (revalidate 600 s, repli committé en dev/panne ; `getActiveCoupons`/
  `getAllCoupons` async — home et /coupons passent à l'ISR 10 min de fait).
  Publication À LA SAUVEGARDE admin : `lib/admin/coupons-publish` (rclone
  copyto + purge edge d'une URL, conventions assets-push ; `s-maxage` COURT
  10 min — donnée vive, l'edge se rafraîchit seul même sans purge ; pire cas
  sans Cloudflare : ≤ 20 min). Branchée sur la route curated/coupons ET le
  regen V2 ; l'éditeur affiche « Saved + publié (live ≤ 10 min) » ou
  l'avertissement d'échec (l'écriture locale n'est jamais invalidée).
  Namespace R2 : `data/` (JSON runtime, distinct des images). tsc + eslint +
  tests verts. COMPLÉMENT (échange Sevih) : les JSON runtime entrent aussi dans
  le STAGING (`assets:collect` copie `data/curated/{coupons,banner}.json` →
  `data/`) — le flux `pnpm commit` (→ `pnpm images`) resynchronise donc R2 même
  si une édition a contourné le Save admin ; `assets:push` leur applique un
  Cache-Control COURT dédié (donnée vive ≠ asset immuable, deux lots rclone).
  Copies initiales poussées + vérifiées servies (200, bon en-tête).
- **Hygiène CLI datagen : l'item ⚙️ soldé (re-vérifié : 3 cibles n'existaient
  plus — coherence.ts, extractor/run.ts, import-gear-reco).** ① Gardes
  `isMain` : extract.ts, convert.ts (script top-level enveloppé dans `main()` —
  un import ne déclenche plus conversion + purge des fantômes), collect.ts
  (garde + `.catch` → exit 1, plus d'unhandledRejection). ② Flags stricts :
  `version-boss` refuse un flag sans valeur (`--ref --label x` prenait
  `--label` comme ref) ; `promote --only` borné au PROCHAIN flag (absorbait
  les fichiers situés après `--apply`). ③ `loadEnvLocal` (lib/env, hérité de
  la note r2.ts) : quotes d'enrobage dotenv retirées. ④ pull-gamedata :
  GARDE-FOU dossier distant absent — les signatures distantes vides faisaient
  passer « jeu désinstallé » pour « tout a disparu » et PURGEAIENT le miroir
  local entier ; désormais erreur explicite (`; true` pour que le test négatif
  ne fasse pas jeter adb avant le message, même piège que dump.ts). Vérifié :
  tsc, eslint, promote.test 12/12, CLI réels (usage, flag sans valeur,
  convert 257/257).
- **Homonymes site/admin désambiguïsés (dernier item Duplication).**
  `rankOptionLabels` (admin/monster-store) → `rankOptionAdminLabels` : PAS le
  même contrat que celui du site (EN seul + repli en cascade vs localisé +
  option inconnue omise) — doc croisée des deux côtés. `BOSS_TYPES` ×2 →
  `FORMATION_BOSS_TYPES` (data/towers : mène une formation) et
  `BOSS_BADGE_TYPES` (admin/monster-icon : porte le badge, `season_boss` en
  plus) — sets volontairement distincts, commentaires « ne pas fusionner ».
  Vérifié : tsc, towers.test 19/19, eslint.
- **Dette code datagen : le gros item duplications ×N soldé.** ① Traversée
  « monstres spawnés d'un donjon » ×3 → `dungeonSpawnedMonsters` (encounters,
  à côté de `spawnGroupIds`/`spawnUnits`) ; singularity/content-schedule en
  wrappers d'une ligne, sources garde son filtre boss dessus. ② Expansion
  BuffGroup Child1..10 ×3 → `loadBuffGroups` (lib/buff) devient l'index UNIQUE,
  stampé mtime ; equipment perd `groupKids` ET sa lecture brute (resolveBuffEffects
  itère `grp.kids`). ③ `span()` ×2 → `idSpan` (lib/tables) ; les résolutions
  RewardTemplet restent volontairement SÉPARÉES (contrats `RewardTable` vs
  `MonadReward` différents — mutualiser changerait un JSON committé ; documenté
  dans monad.ts). ④ Walk récursif ×4 → `walkFiles` (lib/fs, nouveau) avec
  option `sorted` (source.ts seul : « premier trié gagne » ; les autres gardent
  l'ordre FS — trier changerait quel doublon gagne). ⑤ `sc()` ×2 →
  `effectIconCandidates` (lib/effects, partagé avec le manifest). Sous-items
  ÉTEINTS constatés : `nameKey`/`isPresent`/regex VA/`norm()` import-* n'existent
  plus. Vérifié : tsc datagen, eslint, 461/461, regen à blanc byte-identique,
  assets:collect à blanc = 0 re-staging.
- **Outil `/most-used-units` porté — agrégation à la LECTURE, plus d'artefact.**
  La V2 générait `most-used-units.json` par un step de pipeline avec 4
  extracteurs par famille ; en V3 l'usage se calcule au rendu (ISR 24 h) depuis
  les fichiers de guides eux-mêmes (`usage.ts`) : collecte STRUCTURELLE unique —
  partout dans les contenus V3, les persos recommandés vivent dans
  `characters: string[]` ou `slots: string[][]` — sur les 9 catégories comptées
  (dernière version seulement pour les guides versionnés, méta courante ; noms
  résolus par `findCharacterByName`, inconnu = THROW, doctrine bruyante).
  Vérifié sur la donnée réelle : 108 persos / 91 guides, top Monad Eva=56 —
  cohérent avec le JSON V2 (56/37 sur les mêmes têtes). Client
  `MostUsedUnitsBrowser` (dans `_contents/`, pattern ost/wallpapers) : barre
  standard + pills de catégorie (`common.all` + catégories présentes, libellés
  `GUIDE_CATEGORIES.label`), lignes dépliables (portrait overlays + guides par
  catégorie en liens), total recalculé sur les catégories cochées, URL à plat
  `q/el/cl/r/cat`. Au passage : `characterSearchNames` factorisé dans
  `lib/data/characters` (le bloc était copié dans /characters + TierListTool,
  le 3e usage arrivait). tsc + eslint + tests verts.
- **Dette code datagen : code mort soldé + helpers adb mutualisés.**
  ① **Code mort (5 sites, re-vérifiés par grep)** : supprimés `hasFaceIconLayout`
  (face-icon.ts — et son en-tête « script à re-porter » corrigé : l'extracteur
  UnityPy est porté, `extract-face-layout.py` via datagen:patch — solde aussi la
  ligne face-icon du doc-item 📚), `r2Push` (lib/r2.ts, doublonnait
  assets-push.mjs), `getMaxLevel`/`resolvePlaceholders` (+ leurs describe) et
  l'export mort `isPermilleRow` (buff.ts). `validateTagDef` : BRANCHÉ au lieu de
  supprimé — nouveau test bloquant de FORME dans tags.test.ts (chaque définition
  de tags.json validée contre le schéma ; la couverture seule laissait passer un
  `kind` hors enum) et commentaire recadré. ② **`extract/adb.ts`** : ADB/PKG/
  capture/stream/pickDevice/ensureRoot mutualisés entre pull-gamedata.ts et
  dump.ts (maxBuffer unifié à 64 Mo, superset sans risque). Vérifié : tsc
  datagen, eslint, suite 461/461 (−5 tests morts, +1 schéma tags), regen à
  blanc → data/generated byte-identique.
- **Outils `/ee-priority-base` + `/ee-priority-plus10` portés + og:image des
  pages d'outil.** Suite du chantier tierlist (même session) : `TierListTool`
  généralisé en socle des 4 tier lists par perso (`mode: pve|pvp|ee-base|
ee-plus10`) — le rang vient d'une jointure par mode (curé perso pour PvE/PvP ;
  `getEEViews()` → porteur pour les EE, rangs `rank`/`rank10` du curé équipement,
  123/123 présents). `TierListBrowser` paramétré par PROPS et non plus par mode :
  `withTranscend` (PvE seul), groupe Rôles si fourni (PvE/PvP), **légende du sens
  des tiers** si fournie (EE seuls — clés `tierlist.legend.*` ; parité V2 :
  les disclaimers restent `tierlist.disclaimer_ee_*`, les clés
  `tools.ee-*.disclaimer` étaient mortes aussi en V2). JSON-LD ItemList étendu
  aux EE (la V2 ne l'avait que sur PvE/PvP). Deux one-liners `_contents/` +
  registre (7 outils portés, restent 11). **og:image = icône de l'outil**
  (demande Sevih) : `img.toolIconPng` + `ogImage` dans le generateMetadata du
  routeur `[slug]` ; manifeste d'assets : variante PNG de TOUTES les icônes de
  l'index curé (le sous-ensemble « portés » vit côté src/app — le lire du datagen
  inverserait la doctrine) ; 18 PNG produits (`assets:collect`) et poussés sur R2
  - purge edge (`assets:push` — `pushed.json` à commiter). tsc + eslint + 465
    tests verts.
- **Bugs sévérité moyenne : SOLDÉS (les deux items datagen).**
  ① **Caches module stampés** (régime mtime/TTL, modèle `curatedKeyCache`) :
  `faceIconIndex` (assets/manifest → CharacterTemplet), `groupKidsCache`
  (generators/equipment → BuffGroupTemplet), `iconIndex` (generators/goods →
  mtime du DOSSIER de sprites, le cache ne tient que la liste des noms),
  `assetEnum` (generators/recruit → mtime de dump.cs). Le 5e site du TODO
  (`v2-control.ts` `curatedKeySides`) n'existe plus — parti avec le chantier
  admin du 18/07. ② **`bool()` généralisé** : les 10 comparaisons exactes
  `=== 'True'` (character, encounters, buff, effects ×6) basculées sur `bool()`
  de lib/tables ; `boolCol` (specs/monster) garde son tri-état mais délègue son
  parsing à `bool()` — un seul point de vérité de casse. NB : le site cité par
  l'audit (`ShowMainPage === 'true'`, character.ts:492) avait déjà disparu (le
  filtre a été retiré). Vérifié : regen à blanc → data/generated **byte-
  identique** (0 diff git), tsc datagen, eslint, suite complète 465/465.
- **Outils `/tierlistpve` + `/tierlistpvp` portés + reliquat `/tierlist` soldé.**
  Découverte : la donnée de rang existait DÉJÀ dans `data/curated/characters.json`
  (`rank` ×123, `rankPvp` ×87, `rankByTranscend` ×14, `roleByTranscend` ×1 —
  l'item TODO « absente en V3 » était périmé) → chantier purement UI/câblage.
  `components/tierlist/tiers.ts` (TIERS S→E, accents de rangée — D tokenisé,
  zinc interdit —, `tierListRankOrder`) + `TierListBrowser` client UNIQUE
  PvE/PvP (la V2 avait 2 clients quasi-clones) : rangées S→E (glyphe
  `IG_Event_Rank_*`), sélecteur de transcendance 3–6★ côté PvE (repli
  `rankByTranscend`/`roleByTranscend` → 6★), URL partageable en params à plat
  (`q/el/cl/r/role/tr`, idiome CharactersBrowser — pas le `?z=` LZ de la V2).
  `CharactersFiltersBar` étendue : groupe **Rôles** optionnel (desktop + rangée
  mobile) et déclencheur avancé optionnel. Cartes en `sizes={{sm,sm,md}}`
  (`ResponsiveCharacterCard` paramétrable, défaut inchangé) — parité densité V2
  (remarque Sevih). Socle serveur `_shared/TierListTool` : lignes liste+curé,
  libellés pré-traduits, JSON-LD ItemList S→E daté (`getMonthYear`). Hub
  `/tierlist` : aperçu top S-tier RESTAURÉ (mélange à graine journalière stable
  ISR, cluster 2 rangées de `CharacterPortrait` dans `FlagshipCard`, repli
  glyphe centré sans données) et liens corrigés `/tools/<slug>` → `/<slug>`
  (routeur à plat). Sitemap : les slugs d'outils portés (registre) y entrent.
  i18n pré-seedée (rien ajouté). tsc + eslint + 465 tests verts.

- **Guild raid — erreurs (item PRIO) : VÉRIFIÉ RÉGLÉ, item retiré.** Le fix
  og:image phase 2 (55f0621, jointure saison + `guideBossMonster`) couvrait
  bien le problème — les 5 pages guild-raid rendent 200 avec le bon titre en
  dev (dignity/frost-legion/madman/planetary/prevent, vérifié le 20/07).
- **og:image des guides SANS boss = icône du meta (d68e140).** La carte par
  défaut du site ne sert plus jamais à un guide : repli ogImage explicite →
  portrait de boss → icône du meta en PNG (Discord/OG digèrent mal le WebP).
  Manifest : collecte PNG du sous-ensemble EXACT que la page utilise (même
  prédicat `guideBossMonster`) — 27 icônes pour 57 guides, poussées sur R2 ;
  stage : la branche `editorial` (pool V2 webp) sait convertir en PNG.
- **Audit cohérence structurelle des guides + harmonisation (9a16ebb).**
  Audit complet `_contents` (12 catégories, ~160 guides) : structure saine —
  familles moteur en re-export 1 ligne, fichiers optionnels par contrat,
  versions archives maigres prévues, validation scan bruyante (33 tests verts).
  Seule asymétrie corrigée : `BossGuide`/`StoryBossGuide` recevaient leur
  `content.json` en prop via 34 wrappers de 8 lignes (adventure ×20,
  dimensional-singularity ×14) — ils le lisent maintenant EUX-MÊMES
  (`readGuideFile`, pattern TowerGuide, jette si absent) et les 34 index.tsx
  sont des one-liners identiques, alignés sur les 6 autres familles moteur.
  Dates `updated` volontairement non stampées (aucun changement éditorial).
- **`/characters` (liste) — PHASE 2 : onglets Effects + Bonus (parité V2).**
  Data worker atterrie (`glossaries.effectFilters` 89/77 + `CharacterListItem.
{buff,debuff,effectsBySource,teamBonuses}`). Nouveau `lib/data/effect-filters.ts` :
  arbre d'options des effets construit CÔTÉ SERVEUR (le gros `glossaries.json` ne
  part pas dans le bundle client), **univers dérivé des agrégats réels** (chaque
  case matche ≥1 perso, chaque clé de perso a sa case — pas de filtre mort).
  Canonicalisation robuste `canonicalEffectKey` : `group` de la taxonomie, sinon
  la convention `_IR → base` (referme les trous `BT_BARRIER_IR`,
  `BT_STAT_BUFF_ENHANCE_IR` sans toucher la donnée). `EffectGroupGrid` :
  grille d'icônes par famille (desktop/sidebar xl) + déroulants à cases (drawer
  mobile), cyan=buff / rose=debuff. Onglet **Effects** : logique ET/OU, **filtre
  par source** de skill (`effectsBySource`, sources présentes seulement), toggle
  **unique**, familles ordonnées (statBoosts/supporting/utility/unique ·
  statReduction/cc/dot/utility/unique), `hidden` exclu. Onglet **Bonus** :
  `teamBonuses` avec icônes de stat (`STAT_ICON`), logique OU. Chips actifs +
  URL partageable (`b`/`d`/`el2`/`src`/`uniq`/`tb`) + reset étendus. Onglets
  data-gated (invisibles sans data). tsc + eslint verts ; pipeline (options ↔
  agrégats) vérifié sur la donnée réelle : 54 buff / 39 debuff, 0 doublon, 0 orphelin.
- **`/characters` (liste) — PHASE 1 : coquille + layout + filtres data-dispo.**
  Refonte du browser minimal (3 selects mono) en **recherche à facettes** parité
  V2, réécrite sur primitives/tokens V3 (zéro import V2). `components/character/
filters/` : `FilterAtoms` (pills élément/classe/étoile sur sprites `img.*`,
  chips ×, toggle AND/OR), `FilterPill`, `CharactersFiltersBar` (toolbar desktop +
  rangées mobiles), `AdvancedFiltersPanel` (onglets), `CharactersFiltersSidebar`
  (xl persistante), `CharactersFiltersDrawer` (bottom-sheet mobile, TOUJOURS monté
  - CSS pour éviter le setState-in-effect banni), `ActiveFiltersStrip` (chips +
    reset + copier le lien). `CharactersBrowser` réécrit : multi-sélection
    élément/classe/rareté/**chaîne**/**gift**/role/**tags** (logique ET/OU),
    recherche **multi-langues**, **URL partageable** (params simples lisibles, pas
    de LZString), hydratation depuis l'URL. `gift` exposé dans
    `getCharacterListItems`. i18n déjà pré-seedée (rien ajouté). tsc + eslint verts.
    (Phase 2 — onglets Effects/Bonus — livrée le même jour, cf. entrée ci-dessus.)
- **Retours Shiraen/Jaego sur les outils publics** (déployés sur le VPS) — 3 fixes.
  • **Synergies** : sélectionner un héros dans la liste l'ajoute DIRECTEMENT au
  groupe (avant : il fallait Entrée après avoir choisi dans le datalist). Entrée
  reste dispo pour saisie manuelle / tag `{…}`.
  • **Reco stars (premium)** : interaction _toggle de borne_ — sur une plage
  4-5, clic 4 = « 5 seul », clic 5 = « 4 seul » (un seul clic, fini le
  double-clic) ; clic dehors étend, clic sur l'étoile unique désélectionne.
  • **Aperçu inline PUBLIC** : garde `IS_DEV` retirée des deux actions read-only
  `renderInlinePreview`/`renderInlineBatch` (rendu de données de jeu publiques,
  aucun secret/écriture) → les `{tags}` s'affichent en prod sur `/contribute/*`
  (avant : blanc hors dev). `autoTranslate` + écriture restent dev-only. tsc +
  eslint OK.

## 2026-07-19

- **Contribution pros/cons & synergies (Jaego) — deux outils publics + import.**
  Deux outils SÉPARÉS (pros/cons et synergies sont deux choses distinctes, comme
  l'admin `/admin/tools/pros-cons` vs `/synergies`).
  • **Réutilisation, pas de réécriture** : le corps d'édition de `EditorialEditor`
  (pros/cons + synergies) extrait dans une brique CONTRÔLÉE partagée
  `editorial/EditorialFields.tsx` ; l'éditeur admin l'utilise (langue + trad +
  save autour), les outils publics aussi (EN only + export). Une seule UI de saisie.
  • **Outils publics** `/contribute/pros-cons` + `/contribute/synergies`
  (`EditorialPublicTool`, paramétré par `slice`/`kind`) : choix du perso par
  **grille de portraits** cliquables (pas un select — on choisit à la tête), avec
  toggle **Add** (persos SANS la slice) / **Edit** (ceux qui en ont), pré-rempli
  depuis l'éditorial existant. Data serveur commune factorisée
  (`editorial-tool-data.ts`). Hub : 2 cartes.
  • **Deux `kind`** `character-pros-cons` / `character-synergy` → même handler
  `importEditorial` : merge par PRÉSENCE de slice (un import synergies n'efface
  PAS les pros/cons existants, et inversement), reste du curé (skills, gear reco)
  préservé, batch auto-trad EN→vides, `upsertCharacterCurated`. Héros de synergie
  résolus nom→id à l'export. Import via le tool générique `/admin/guides`.
  • **Fix** : clé React dupliquée dans `InlineTextField` — les refs perso
  d'autocomplétion (`inline-refs`) dédoublonnées par valeur (20+ persos partagent
  un même nom EN : Ame, Snow, Eva… base/skin). tsc + eslint OK.
- **Sous-outil `/4-comics` (galerie BD) — 3ᵉ et dernier média** (ordre Sevih :
  ost → wallpapers → 4-comics ✓). BD faites main (hors jeu) : **ramenées en V3**
  (27×3 EN/JP/KR de la V2 → `.editorial/comics/<LANG>/`, gitignoré → R2), zéro
  dépendance V2. Générateur `datagen/generators/comics.ts` (`buildComics`, scanne
  les originaux → `{EN,JP,KR}` de stems). Collect `collect-comics.ts` (originaux
  → webp `quality:90`, idempotent mtime) ajouté à `pnpm images`. Page
  `_contents/4-comics/` (wrapper serveur + `ComicsGallery` client : onglets
  langue, grille portrait, lightbox clavier) sur tokens V3. Lib `comics.ts`,
  registre outils, `data/generated/comics.json`.
  • **Manifeste RUNTIME sur R2 (décision Sevih)** : pour ne PAS redéployer à
  chaque BD, `collect-comics` pousse aussi `images/4-comics/comics.json` sur R2 ;
  la page le lit à la requête (`fetch` + `revalidate:600`), repli sur le seed
  committé en dev / si R2 injoignable. Ajouter une BD = `pnpm images`, visible
  < 10 min sans build. Non câblé dans `build.ts` exprès (buildComics lit
  `.editorial`, absent en CI → écraserait le seed). tsc app + datagen + eslint OK.
- **Contribution premium/limited (Shiraen) — outil public + import admin
  générique.** Chaîne complète export→import bouclée.
  • **Outil public** `/contribute/premium-reviews` refondu : EN uniquement (pas
  de barre de langue — la trad se fait à l'import), pas de bouton delete,
  sélection **pilotée par le roster** (dérivé des tags perso : Premium = tag
  `premium` ; Limited = `limited`/`seasonal`/`collab` hors premium/core-fusion)
  avec compteur « X/Y unit reviews » + puces ★/☆ + « N without review ». Support
  **perso pas encore sorti** (`unreleased`) : review rédigée d'avance, saute au
  rendu du guide jusqu'à la sortie (garde-fou anti-typo conservé pour les noms
  non-unreleased). Hub `/contribute` + registre des outils.
  • **Enveloppe de contribution auto-descriptive** (`src/lib/contribute/
contribution.ts`) : `kind` (routage vers le guide), `mode` (edit/add),
  `payload`. `parseContribution` tolère l'ancien format nu. Un `kind` =
  `premium-limited-review` pour l'instant.
  • **Tool d'import admin GÉNÉRIQUE** posé sur `/admin/guides`
  (`ContributionImport` + server action `importContribution`, `IS_DEV`) : lit le
  `kind`, fusionne dans le bon bucket (edit par match de nom sinon add),
  **auto-traduit** les langues manquantes de l'entrée (EN→jp/kr/zh/fr, entrée
  seule pour ne pas re-facturer tout le lot), **enregistre**, renvoie un résumé.
  L'import per-guide de l'éditeur (stage avant Save) lit aussi l'enveloppe.
  Brancher core-fusion/shop plus tard = 1 `kind` + 1 handler. tsc + eslint OK.
- **Sous-outil `/wallpapers` (galerie) — tranche 1** (2ᵉ média, ordre Sevih).
  Principes actés : **hors-jeu → ramené en V3**, **zéro dépendance V2**. Split :
  jeu (Cutin/Full/Banner/Art) = extraction native **worker** (`extract-wallpapers`,
  spec + 2 hooks d'auto-maintenance transmis) ; **HeroFullArt** = RÉUTILISE les
  full-arts perso déjà hébergés (`IMG_<id>`, décision Sevih — zéro re-host) ;
  **Outerpedia** (5 faits main) = ramenés en V3 (`.editorial/wallpapers/`,
  gitignoré → R2, jamais git vu les 40 Mo dont un 8k).
  • **Générateur** `datagen/generators/wallpapers.ts` → `wallpapers.json` : scan
  pools (jeu + éditorial) + énumération `IMG_<id>` réutilisés, dims via en-tête
  PNG (pas de sharp), split `Full:*`. Writer canonique = `datagen:build`
  (buildWallpapers) ; exécution directe = revue. **Peuplé maintenant** :
  Outerpedia (5) + HeroFullArt (227) ; catégories jeu à 0 jusqu'au worker.
  • **Page** `_contents/wallpapers/` : wrapper serveur + `WallpapersGallery`
  client (onglets, grille portrait/paysage, lightbox clavier + download) sur
  tokens V3 (lightbox always-dark en valeurs arbitraires `[#fff]`/`[#000]`).
  Helper `lib/wallpapers.ts`. Registre outils. 2 clés i18n `Full:Scenario`/
  `Full:Others` ×5. tsc + eslint OK.
  • **Pool worker livré** (be3e700, parité V2 exacte : Cutin 222/Banner 90/Art 11/
  Full 135) → `wallpapers.json` régénéré : **690 wallpapers** (Outerpedia 5,
  HeroFullArt 227, + jeu). **Collect+push câblés** : `assets:collect-wallpapers`
  (pool jeu + éditorial → staging `images/download/<cat>`, HeroFullArt réutilise
  `characters/full`) ajouté à `pnpm images`. Chaîne d'auto-maintenance bouclée
  (Hook 1 worker ✓, Hook 2 build.ts en cours côté worker, collect/push moi ✓).
  • **Fix HeroFullArt (404 + parité V2)** : l'énumération `^IMG_\d+$` du pool ramassait
  des ids de skin/PNJ non hébergés (`IMG_2000120` → 404) ET ratait les arts
  alternatifs `IMG_<id>_NN` (8 que V2 a). Refonte en source partagée
  `datagen/assets/hero-full-art.ts` (`listHeroFullArt`) répliquant l'INTENTION V2
  (scan illust + min-largeur 250) **sans** sa dédup perceptuelle lossy (qui jette
  de vrais skins) → **superset natif** : V2 (230) ⊆ 235 (garde les 5 skins que V2
  sur-jette). Hébergement : le **manifest** demande `characters/full/IMG_<f>.webp`
  pour chaque entrée (dédup par clé ⇒ seuls les 9 extras s'ajoutent, jamais deux
  copies). `wallpapers.json` régénéré (HeroFullArt 227→235), 9 extras stagés en
  webp. Décision Sevih : superset natif plutôt que parité stricte. tsc/eslint OK.
- **Admin — toute l'UI passée en anglais** (décision Sevih). Balayage complet de
  la matrice (composants `admin/*`, pages `.dev`, stores/actions `lib/admin`,
  pickers) : seuls les CHAÎNES vues par l'utilisateur sont traduites, les
  COMMENTAIRES restent en français (convention). Fait via 8 sous-agents
  parallèles sur lots disjoints + rattrapage des chaînes sans accent
  (`Chercher`/`Changer` des pickers, `(no name)`, titres). tsc + eslint verts.
- **Guide editor — Premium & Limited (reviews + recommended choices) + outil
  public de contribution (Shiraen)** — 2ᵉ fragment general-guides bespoke.
  Données sorties du TS vers JSON (`premium-reviews.json`,
  `premium-priorities.json`, rendu inchangé). UX : UN éditeur par perso (édite un
  existant pré-rempli ou ajoute), notes en ÉTOILES (impact 1-5 ; cibles reco =
  plage 3-6 + Any + note libre, round-trip du texte existant). Recommended
  choices éditables (paliers de pull). **Contribution export/import** : outil
  PUBLIC `/contribute/premium-reviews` (prod, sans login, sans écriture serveur)
  qui exporte UN perso ; l'IMPORT se fait côté admin (fusion dans le bucket).
  Briques partagées (`PremiumLimitedParts`, `CharacterChips` extrait).
- **Guide editor — world-boss (phases) + adventure (notes multiples)** — world-
  boss branché sur le shell versionné (équipes/persos en SECTIONS de phase,
  reco sectionnée, 1re version vierge possible) ; `StoryBossGuide` rend
  DÉSORMAIS toutes les notes (`note: LText | LText[]`, rétro-compatible).
- **Sous-outil `/ost` (jukebox OST) + infra de routage des outils** — 1er des
  3 médias (ordre Sevih : ost → wallpapers → 4-comics). **Décisions** (cf. TODO) :
  URLs À PLAT `/(slug)` (parité prod V2, enjeu SEO) et « je fais aussi le
  générateur ».
  • **Routeur** `src/app/[lang]/[slug]/page.tsx` : catch-all qui sert
  `_contents/<slug>` via un **registre** de slugs portés (`tools/registry.ts`) —
  slug absent = 404 ; enveloppe titre i18n + fil d'Ariane + retour landing.
  Landing `href` basculée `/tools/<slug>` → `/<slug>`. `getToolMeta` ajouté.
  • **Générateur** `datagen/generators/bgm-mapping.ts` (`pnpm datagen:bgm`) :
  lit `LobbyCustomResourceTemplet` (lignes `LRT_BGM`) + `TextSystem` via
  `langDict` (en/jp/kr/zh d'un coup — plus riche que la V2 qui ne prenait que
  l'anglais et reportait les autres à la main), noms de repli dérivés du fichier
  (sans le tiret parasite « Battle - 02 » de la V2), `size`/`duration` sondées
  (statSync + ffprobe). Sortie `data/generated/bgm_mapping.json` (91 pistes,
  19 localisées). Vérifié vs V2 : mêmes 91, zéro vrai nom JP perdu, replis plus
  propres, doublons anglais kr/zh omis. Les mp3 (déjà convertis, hors
  ré-extraction datamine) sont RÉUTILISÉS, pas re-générés.
  • **Audio** : helper `src/lib/audio.ts` (base R2 partagée, préfixe `/audio`),
  route dev `src/app/audio/[...path]/route.dev.ts` avec **support `Range`**
  (206) pour le seek. 91 mp3 (122 Mo) en staging (gitignoré). **Push R2 câblé**
  dans `pnpm images` : `assets:collect-audio` copie le pool audio → staging, et
  `assets:push` parcourt déjà tout le staging → mp3 sur R2
  (`img.outerpedia.com/audio/bgm/*.mp3`, content-type auto par rclone).
  • **Dépendance V2 coupée** (worker a livré l'extraction native, commit 8bfaaa0) :
  `pnpm datagen:extract-audio` sort l'OST des bundles Unity vers
  `.gamedata/extracted/audio/bgm` (pool V3-owned, miroir de `GAME_IMAGES_DIR`).
  `collect-audio` repointé dessus (copie TOUT le pool — déjà curé par la regex
  de l'extracteur, donc zéro orphelin ; robuste aux nouvelles pistes) ;
  `v2AudioBgmDir()` retiré. Vérifié : mapping regénéré depuis le pool V3
  **strictement identique** (diff vide, 91 pistes).
  • **ffmpeg/ffprobe en auto-fetch R2** (comme AssetStudio) : entrées `FFMPEG`/
  `FFPROBE` dans `datagen/extract/tools.ts` (dossier R2 `tools/ffmpeg`, exe à
  plat), `ensureTool` les rapatrie dans `.gamedata/tools/ffmpeg` ; `datagen:tools`
  les garantit. Mon `bgm-mapping` résout ffprobe via `ensureTool(FFPROBE)`
  (surcharge `FFPROBE`). Plus de dépendance au PATH. Reste : pousser une fois le
  build ffmpeg sur R2 `tools/ffmpeg` (comme AssetStudio l'a été) ; le worker
  repointe son ffmpeg d'extraction sur `ensureTool(FFMPEG)`.
  • **Page** `_contents/ost/` : wrapper serveur (résout les libellés, passe la
  table) + `OstPlayer` client (logique V2 fidèle : lecture/seek/shuffle/repeat/
  historique/volume/raccourcis) **réhabillé sur les tokens V3** (accent ciel
  conservé — vif autorisé hors `guides/**` ; zinc/white/black → tokens). tsc +
  eslint clean.
- **Guide editor — general-guides bespoke : `free-heroes-start-banner` (onglet
  Free Heroes)** — premier fragment éditable d'un GUIDE GÉNÉRAL (contenu sur
  mesure, pas la famille de boss). Les SOURCES de héros gratuits sortent du TS
  (`recommended.ts`) vers `free-heroes-sources.json` (rendu `index.tsx`
  INCHANGÉ, ré-export depuis le JSON) ; `general-guide-store.ts` porte un
  REGISTRE extensible (slug → fragment) + load/save + validation (libellé EN,
  ≥1 entrée, ≥1 héros, chaque nom résout). Éditeur `FreeHeroesEditor` :
  ajout/retrait de sources, d'entrées et de héros (chips + portraits), type de
  choix (tous / un au choix), libellé + raison en 5 langues (InlineTextField,
  tokens, auto-traduction EN → vides). Câblé sur le shell `/admin/guides`
  (ligne « GG · … », dispatch page, branche `general-guides` de la route).
- **`/tools` + `/tierlist` : fidélité visuelle V2** (retour Sevih : « ne ressemble
  pas à la V2 »). J'avais trop neutralisé — or les couleurs vives Tailwind sont
  autorisées HORS `guides/**`. Repris le design V2 sur les primitives V3 (seuls
  les neutres → tokens). **Tools** : `toolsTheme` (accents par catégorie
  rankings=rose / equipment=ambre / simulators=cyan / info=violet / media=rose),
  onglets colorés, sections à en-tête barré d'accent, `ToolCard` (boîte d'icône à
  dégradé d'accent + halo au survol), **FeaturedRow** (3 phares avec ruban),
  `StatusBadge`. **Tierlist** : `tierlistTheme` (PvE=émeraude / PvP=rouge /
  rail=ciel), `FlagshipCard` à **panneau d'art** (dégradé radial + texture rayée +
  grand glyphe S centré), `VsBadge` (médaillon dégradé), `OtherRankingsRail`.
  Cluster de portraits top-tier toujours omis (pas de donnée de rang en V3).
  _Correctif (retour Sevih)_ : le glyphe de rang prenait les sprites `IG_Event_Rank_*`
  BRUTS du jeu (minuscules, ~1,6 Ko). Sevih avait upscalé les siens en V2 → on
  retire le rang des sprites de jeu du manifeste et on le ramène en **éditorial**
  depuis le pool V2 (`ui/rank/IG_Event_Rank_*`, S = 7,6 Ko). Staging resynchronisé.
- **Hub `/tierlist`** — dernière page manquante de l'inventaire footer/nav
  (layout d'abord). Hero (`getMonthYear`, compteurs rankings/units), deux cartes
  phares **PvE vs PvP** (badge VS central) et un rail vers 3 autres classements
  (ee-priority-base / ee-priority-plus10 / most-used-units) — métadonnées prises
  dans le domaine outils (`getVisibleTools`), liens vers `/tools/<slug>` (404 le
  temps du portage). Au sitemap. **Aperçu « top S-tier » différé** : aucune donnée
  de RANG par perso en V3 (elle vit dans l'outil tierlist non porté). Page serveur
  pure (liens seulement).
- **Guide editor — famille complète (6 catégories) sur un shell unifié** — suite
  du pilote joint-challenge : l'éditeur couvre désormais TOUTE la famille de boss.
  Généralisation autour d'un **`CatSpec` par catégorie** (`guide-draft.ts`), qui
  décrit un stockage divergent derrière un unique modèle éditable :
  - **stockage** : versionné (`versions/YYYY-MM/*.json`, JC), plat (fichiers
    racine, special-request / irregular / adventure-license), ou **`content.json`
    mono-fichier** (adventure, dimensional-singularity) ;
  - **monstre** : `config.group` (JC), `meta.group` (plates), `meta.dungeons`
    ordonnés (adventure, picker donjon), `meta.bossId` (dim, picker monstre) —
    écriture `meta.json` en read-merge-write ;
  - **équipes** : une équipe `slots` (JC), **buckets par plage de stages**
    (special-request), **nommées** titre `SectionTitle` + note multi-§ (irregular /
    adventure-license), ou **persos en sections** (dim = `content.teams`) ;
  - conseils en **sections titrées** (JC, dim) ou liste plate ; les titres
    `SectionTitle` non libres (preset/perso/élément/effet) sont préservés et
    éditables en libre. Nouveaux helpers data `listGroups`/`listDungeons`
    (`encounters.ts`) + `listMonsters` (`monsters.ts`), picker générique
    `IdLabelPicker`. Autotrad EN→vides couvrant tous les textes (intro, conseils,
    notes, raisons, titres, notes d'équipe). HORS scope : guild-raid, world-boss,
    general-guides/other, skyward-tower, monad-gate. Aperçu fidèle partout via le
    même pipeline de descripteurs (`previewMode="list"` pour les conseils).
- **Landing `/tools`** — 5ᵉ 404 du footer fermée (landing seule, décision Sevih :
  le layout d'abord, les 18 sous-outils viendront après). Données curées ramenées
  du V2 (`data/curated/tools/_categories.json` + `_index.json`) ; domaine
  `src/lib/data/tools.ts` (import statique). 17 outils visibles groupés en 5
  catégories, onglets + filtre par HASH (`#cat-…`, deep-link footer, idiome
  `useUrlSlice`), cartes icône+titre+desc pointant `/tools/<slug>` (404 assumée le
  temps du portage). 18 icônes ramenées data-driven (manifest lit `_index.json`),
  helper `img.toolIcon`. Au sitemap. Vérifié : 17 outils, toutes les clés i18n
  résolvent. Poussée R2 des icônes au prochain `pnpm images`.
- **Page `/coupons`** — liste complète des codes promo depuis `coupons.json`
  (curé) : 90 codes triés actifs → à venir → expirés (12 actifs / 78 expirés
  ce jour), badge de statut, validité, récompenses résolues en `ItemInline`,
  copie presse-papier ; instructions de rachat MANUEL en tête (Android + lien iOS
  officiel via HTML i18n de confiance). Assemblage `getAllCoupons` dans
  `lib/home.ts` ; composant client `CouponsList`. Au sitemap. **Rachat one-click
  NON porté** — `REDEEM_ENABLED=false` même en V2 (accord VA Games en attente) ;
  le lien « voir les N codes » de la home pointe désormais sur une vraie page.
- **Page `/contributors`** — 3ᵉ 404 du footer fermée. `contributors.json`
  ramené du V2 en `data/curated/` (liste curée, pas de la donnée de jeu) ;
  avatars (`images/contributors/*`) collectés **data-driven** (le manifest lit
  le curé et pousse chaque `avatar` référencé une fois) + copie staging ;
  helper `img.contributor`. Page statique i18n (clés `contributors.*`), grille de
  cartes sur primitives V3, perso(s) favori(s) rendus par `parseText` (tags
  `{P/…}`), ajoutée au sitemap. Vérifié : les 14 persos favoris résolvent tous.
  Poussée R2 des avatars au prochain `pnpm images`.
- **Guide editor — pilote joint-challenge (éditeur unifié « guide de boss »)** —
  dernier éditeur manquant de la matrice admin, posé sur la catégorie la plus
  utile (versionnée). Modèle métier (Sevih) : 1 monstre désigné + conseils +
  persos + équipe + vidéos, par version. Un guide n'a AUCUN chemin d'écriture
  jusqu'ici (couche `guides.ts` en lecture seule) : nouveau **store**
  (`guide-store.ts` — load/save/add-version, `writeJson` canonique, mkdir/rm par
  fichier, duplication d'une version « pour servir de base ») + **route**
  `/api/admin/guides/[category]/[slug]` (gardée `IS_DEV`). Adaptateurs PURS
  (`guide-draft.ts`) entre le modèle plat éditable et l'arbre de fichiers
  (`strings.json` + `versions/YYYY-MM/{config,tips,recommended,teams}.json`) :
  lecture aplatit, écriture ré-émet la forme courte (une section de conseils sans
  titre → `{tactical}`, sinon `{sections}` titrées) — diffs JC minimaux. Le
  « monstre » = un `DungeonRef.group`, choisi dans un **picker** alimenté par
  `listGroups` (nouveau, `encounters.ts` : les combats réels étiquetés boss·mode).
  UI (`GuideEditor` + `GroupPicker`) : intro commune + barre de versions + **＋
  version** (source à dupliquer sélectionnable, défaut = la plus récente), parties
  en **onglets** (`EditorTabs`, comme l'éditeur perso) — Monstre / Conseils /
  Notes / Persos / Équipe / Vidéos. Conseils = **un éditeur bloc, un rendu liste**
  (nouveau `previewMode="list"` d'`InlineTextField` : une ligne = un conseil,
  rendu via le vrai `parseText` — l'EN pilote la structure, les autres langues
  remplissent par index) ; équipe plafonnée à **4 slots** ; persos en portraits ;
  vidéos via `VideoCurator` réutilisé ; **auto-trad EN → langues vides** (DeepL →
  Haiku). Nav « Guide editor » activée (liste JC via `ToolCharacterList`). RESTE
  (TODO) : brancher les autres catégories de la famille sur le même shell.
- **Tokens de contraste remontés** (`globals.css`) — retours Sevih, en deux temps.
  - _Bordures_ : `line`/`line-subtle` disparaissaient À MÊME le fond du site
    (`line-subtle` #1e293b = la couleur de `surface-overlay` → 1.29:1). Remontés :
    `line-subtle` #42566e (2.5:1), `line` #526075 (3:1), `line-strong` #64748b
    (4:1, remonté aussi pour garder subtle<normal<strong).
  - _Texte_ (échelle entière remontée, trop sombre) : `content-strong` + `content`
    = VRAI blanc #fff — `content-strong` se distingue désormais par le GRAS (règle
    `.text-content-strong { font-weight: 700 }` en `@layer base`, surchargeable par
    un `font-*` explicite) ; `content-muted` + `content-subtle` reprennent l'ancien
    `content` #cbd5e1 (bien plus clair que l'ancien slate moyen #94a3b8/#808ea6).

- **Home riche** — page d'accueil reconstruite sur les primitives V3 (aucun
  import de composant V2). Sections : **HomeHero** (titre discret + déclencheur
  de recherche via événement `op:open-search`, écouté par HeaderClient),
  **DiscordBanner** (compteurs via l'API d'invitation, revalidés 1 h),
  **CurrentBanners** (bannières ACTIVES de `recruit.json` → `ResponsiveCharacterCard`
  - compte à rebours), **ServerResets** (daily/weekly/monthly, calcul pur),
    **BuffEventTimer** (Daily Buff depuis `buff-events.json`), **PromoCodes**
    (codes actifs de `data/curated/coupons.json`, récompenses résolues en
    `ItemInline`, copie presse-papier), **BeginnerGuides** (5 liens general-guides).
    Assemblage data serveur dans `src/lib/home.ts` (bannières/coupons/buff en
    view-models). Les 3 compteurs partagent une horloge unique
    (`src/hooks/useNow.ts`, `useSyncExternalStore` — même idiome que
    `SingularityCountdown`, pas de `setState`-dans-effet). Assets ramenés du pool
    V2 (entrées éditoriales dans le manifest + copie staging ; poussée R2 au
    prochain `pnpm images`) : bannière du site (`croped_banner.webp`,
    `img.homeBanner`), icône Discord (`discord.webp`, `img.discord`), et les
    7 icônes du Daily Buff (`ui/buffs/*`, `img.buff` ; repli pastille pour les
    types sans icône).
    Simplification assumée : pas de carousel mobile (flex-wrap responsive).
    **Recent Updates différée** (lit `getChangelog`,
    non porté). Vérifié runtime : 4 bannières actives, 12 coupons, buff du jour OK ;
    465 tests verts.
- **Guide « How Quirks Work » porté** (quirk, heroes-gear, ordre 3) — le plus
  « ajout de contenu » : la V2 était PUREMENT conceptuelle (5 catégories,
  how-it-works, priorité, exemple, FAQ), la V3 y AJOUTE les **arbres reproduits
  depuis les fichiers du jeu** (demande Sevih). 3 onglets (Guide / Quirk Trees /
  FAQ). Nouveau générateur `quirks.ts` → `quirks.json` : les quirks = table
  interne « **Awakening** » (`CharacterAwakeningNodeTemplet` + `…LevelTemplet` +
  `…Templet`). Les **5 catégories V2 = les 5 groupes** du jeu (PVE→counteract,
  JOB→class, ELEMENTAL→element, UTILITY, ADVENTURE_LICENSE) ; un sous-arbre = un
  main node + tous les nœuds dont `RequireMainNodeID` pointe dessus (13 arbres :
  5 éléments + 5 classes + utility + pve + adventure). Émis par nœud : type
  (main/normal), couleur de fond du jeu, nom/desc (`TextSystem`, `{0}` = valeur),
  connexions du graphe, niveau de main requis, et **coût (or + items) + effet PAR
  NIVEAU**. Valeur d'effet dérivée pour les 128 nœuds `IOT_STAT`
  (`formatStatValue` sur le SLUG, pas l'enum — CHC 2%/4%…) ; les 79 nœuds
  `IOT_BUFF` (buffs `Awakening_*` ABSENTS de `BuffTemplet`) → nom + coût sans
  chiffre (limite assumée). Rendu : **layout radial dérivé, main node au CENTRE**
  (choix Sevih ; positions in-game relatives/ambiguës → on reconstruit le graphe
  depuis les connexions, profondeur = distance), nœuds en pastilles teintées par
  leur couleur (sprites `CM_Gift_*` non collectés), **tooltip au survol** (nom,
  effet, coût total au max, niveau de déblocage) — client `QuirkTreeView` +
  navigateur `QuirkTrees` (onglets catégorie + sélecteur élément/classe). Prose
  5 langues portée V2 → `labels.ts` (tags `{C/}{E/}{S/}{P/}{I-I/}` supportés par
  le parse-text V3 ; `{ICON_*}` de catégorie résolus en terme gras faute de
  sprite de menu). Icône meta `TI_Gift_Cost_01` (choix Sevih). Rendu 200 EN + FR,
  0 réf morte.
- **Guide « Equipment Guide » porté** (gear, heroes-gear, ordre 2) — le plus
  gros des general-guides, 5 onglets (Bases, Upgrading, Ascension, Obtaining,
  FAQ). Port INTÉGRAL fidèle (décision Sevih), mais **zéro hardcode** : les
  tables numériques que la V2 figeait DÉRIVENT toutes de la donnée de jeu, en
  réutilisant les briques de l'outil `equipment/[slug]` déjà en place —
  - _ascension_ (activation, steps +11→+15, bonus +15 offensif/défensif avec
    grades C→S+ et split F/W/E · L/D, reroll) : `getAscensionView('weapon'|'armor')`
    exposé depuis `equipment-detail.ts`, source `enhance.json` (générique, sans
    item) ; main-stat % dérivé des facteurs (0.15 + 0.1×4 + 0.2) ;
  - _comparaison d'enhancement_ (Normal 1★ 18→90, Epic 2★ 54→270, Leg 1★ 30→150) :
    nouveau champ `EnhanceRules.examples` — base ATK par archétype (grade, star)
    tiré de `ItemOptionTemplet`, × ×5 au +10 ;
  - _breakthrough_ (Surefire Greatsword ATK 200→240 + textes T0→T4, Immunity /
    Penetration Set 2P/4P base vs T4) : `getEquipmentDetail` (mêmes passives /
    setEffects que la fiche).
  - _reroll manquant → DÉRIVÉ_ : le générateur `enhance.ts` mentionnait « reroll »
    sans l'émettre ; ajouté `singularity.reroll` (`SET_EQUIP_REROLL` : 500 000 or
    - Reload Cartridge ×10, 100 %) — plus besoin de curer.
      Reste ÉDITORIAL (prose 5 langues transplantée V2 → `labels.ts`) : mécaniques
      substats (barre 6 segments **sans valeurs chiffrées**, décision Sevih), tips
      (ratios 2:1 / 6:1), Change Stats, priorité par slot, FAQ. Nouveaux tokens
      `--substat-roll/reforge/empty` (jaune roll / orange reforge / creux). Guide V3 :
      `SegmentedTabs` 5 onglets, cartes `EquipmentIcon`, items `{I-I/…}` parse-text
      strict. Rendu 200 EN + FR ; datagen régénéré (`enhance.json`, lambda écarté).
- **Guide « Growth Systems » porté** (heroes-growth, heroes-gear, ordre 1) —
  gros guide de systèmes, 7 onglets (Gems fusionné dans Special Equipment,
  décision Sevih). Nouveau générateur `hero-growth.json` : les tables NUMÉRIQUES
  DÉRIVENT de la donnée de jeu (vérifiées identiques à la V2, avec le détail que
  la V2 masquait) —
  - _limit break_ : `CharacterMaxLevelTemplet` (facteurs = `CharBreakPieceQuantity`,
    gold = `Price`, bonus de stat = `LevelUpStatModifierAfter100` ; pièces/prix
    indépendants de l'élément → collapse par rareté) ;
  - _skill upgrade_ : `CharacterSkillEnchantTemplet` (manuels via `ItemID_n`, gold
    via `UpgradePrice`) ;
  - _EE / talisman_ : `SpecialEquipEnchantTemplet` (`ITS_EQUIP_EXCLUSIVE` /
    `ITS_EQUIP_OOPARTS`, matériaux + gold + déblocage de gem slot ; les « 150 »
    de la V2 = la SOMME des coûts 10+20+30+40+50 → ici le détail par niveau) ;
  - _XP food_ : `ItemTemplet` `ITS_MATERIAL_CHAR_LEVEL`, XP = `MaterialValue`.
    Le reste reste ÉDITORIAL car ABSENT de la donnée (vérifié : pas de table
    favor/present→points, pas de paliers d'affinité, effets de transcendance non
    structurés) : points des gifts d'affinité, paliers de récompense, effets de
    transcendance → `editorial.ts` ; toute la prose (5 langues) transplantée V2 →
    `labels.ts`. Guide V3 : `SegmentedTabs` 7 onglets, tables en tuiles à cadre de
    rareté (`ItemInline`), gem ref `{I-I/…}` en parse-text strict, résumé Gear +
    lien vers le guide gear (ordre 2, à venir).

- **Pages `/legal` + `/feed`** — les deux 404 de la barre basse du footer,
  fermées. **`/legal`** (`src/app/[lang]/legal/page.tsx`) : page statique i18n,
  contenu dans les clés `legal.*` déjà pré-seedées ×5 (heading, p1-p4, titre
  hébergeur + p5 LCEN), `generateMetadata` via `createPageMetadata`
  (`page.legal.*`), `revalidate` 24 h, ajoutée au `sitemap.ts` (page indexable).
  **`/feed`** (`src/app/feed/route.ts`) : flux **RSS 2.0** des guides non
  masqués, triés par fraîcheur (`guideUpdatedDate`, comme le sitemap), lien vers
  la fiche en langue par défaut, dates RFC-822, entités XML échappées. Route à
  la RACINE hors `[lang]` — le proxy l'exclut déjà nommément — donc flux unique
  en langue par défaut ; `dynamic = 'force-static'` + revalidation 24 h,
  `Content-Type: application/rss+xml`. 465 tests verts.
- **Éditeurs éditoriaux perso alignés sur le rendu du site (B/C/D)** — même
  chaîne de descripteurs que l'aperçu inline, généralisée aux 3 éditeurs perso.
  **B (pros/cons)** : `EditorialEditor` rend les entrées comme
  `getCharacterProsCons` (2 onglets Pros/Cons, lignes `Side`), résolues par
  `renderInlineBatch` (nouveau, `inline-preview-actions`) ; édition en place au
  clic sur la tuile (plus de champ séparé), `✕` par entrée, `+ entrée`.
  **B (synergies)** : les partenaires rendus en `CharacterPortrait` comme
  `SynergiesSection`, ajout par datalist (`+ partenaire…`), raison éditable au
  clic. **C** : `synergies/[id]/page.dev.tsx` construit les `heroViews`
  (id→portrait/slug) passés à l'éditeur. **D** : `characters/[id]/page.dev.tsx`
  regroupe champs manuels → skills → reco dans un `EditorTabs` (nouveau, panneaux
  tous montés, inactifs `hidden` → l'état survit au changement d'onglet).
  Piège corrigé : les wrappers cliquables étaient des `<button>` contenant du
  rendu inline interactif (`StatInline`=button, `{P}`/`{SK}`=lien) → nesting DOM
  invalide ; passés en `<div role="button" tabIndex onKeyDown>`, et `ItemRow`
  (`GearRecoSection`) reçoit `noLink` pour que les tuiles d'édition ne naviguent
  pas. Prolonge l'éditeur reco unifié du 18/07.
- **`useUrlTab` — dédup de la logique « URL source de vérité »** — le bloc
  identique de `ui/Tabs` et `guides/.../BannerTabs` (lecture de la tranche
  `?<param>=<id>` via useUrlSlice → Back/Forward pilote l'UI, écriture par
  `replaceState`, validation de l'id lu, repli local sans `urlParam`) extrait
  dans un hook générique `src/hooks/useUrlTab.ts` (`<T extends { id: string }>`,
  retourne `{ active, current, select }`). Les deux composants n'en gardent que
  leur rendu propre (soulignement thémé / cartes-images). Aucun changement de
  comportement. RESTE hors périmètre : migrer `BannerTabs` vers le hash (règle
  « état interne d'un guide = hash »), tracé en TODO.
- **CSP durcissement, PASSE 1 (Report-Only, observation)** — préparation du
  passage à une CSP à nonce sans casser la prod (build indisponible en local :
  on valide sur le trafic RÉEL). Une politique **stricte** (`script-src 'self'
'nonce-…' 'strict-dynamic'`, sans `'unsafe-inline'`) est servie via
  `proxy.ts` (Next 16 : la convention est `proxy.ts`, pas `middleware.ts`) sous
  l'en-tête **`Content-Security-Policy-Report-Only`** : le navigateur l'évalue
  et REMONTE ce qu'elle casserait, sans jamais bloquer. La politique réelle
  (`next.config.ts`, avec `'unsafe-inline'`) est **inchangée** → zéro risque.
  Le nonce est glissé sur les en-têtes de REQUÊTE (`Content-Security-Policy`
  interne, jamais renvoyé) pour que Next le pose sur SES `<script>` — sinon ils
  pollueraient les rapports. Collecte automatique sur tous les visiteurs :
  `report-uri` (Firefox/Safari) + `report-to`/`Reporting-Endpoints` (Chrome)
  → nouvel endpoint **`/api/csp-report`** qui normalise les deux formats, filtre
  le bruit d'extensions (`chrome-extension://`…), dédupe en mémoire et loggue en
  `console.warn` structuré (→ logs conteneur, `grep`). Vérifié : Caddy prod
  (`vps-…ovh.net`) ne strippe PAS la CSP (le `header_down -Content-Security-
Policy` est cantonné au bloc test-IP HTTP), donc le header arrive intact.
  `style-src` garde `'unsafe-inline'` (styles inline React, hors périmètre XSS).
  À DÉPLOYER puis observer avant la bascule réelle (PASSE 3, cf. TODO).

## 2026-07-18

- **Éditeur reco d'équipement UNIFIÉ sur tuiles** — l'aperçu EST l'éditeur : rend
  le vrai `GearRecoSection` (tuiles 6★, onglets par build), chaque tuile cliquable
  ouvre son éditeur inline (`✕` direct pour retirer). (1) **Icônes 6★** :
  `gear-options` dérive désormais des FAMILLES (`topId`) au lieu du plus petit id
  → corrige le bug 1★. (2) **Filtre de classe** sur les selects arme/amulette
  (`family.classLimits`, vide = libre ; valeur hors-classe préexistante conservée
  et marquée). (3) **Main stats en multi-select** (puces, pool du slot ; armes =
  ATK%/DEF%/HP% fixes ; amulettes = pool famille ; valeurs hors-pool retirables).
  (4) **Presets bidirectionnels** (`gear-preset-resolve`) : DÉPLIÉS au chargement
  (page) → édition en pièces 1:1 avec les tuiles, RECOMPRESSÉS au save (store)
  → JSON compact, pas de diff géant. (5) **Import d'un build** depuis un autre
  perso. Résolution via server action debouncée (`gear-preview-actions` +
  `resolveGearBuilds` extrait de `getCharacterGearReco`). `GearRecoSection`
  inchangé côté site (juste `SubstatPrioBar` exportée).
- **Auto-traduction éditoriale (DeepL → fallback Haiku)** — bouton « Traduire
  (EN → langues vides) » dans les éditeurs (pros/cons, synergie, notes reco).
  `translate-actions` (server action) : masque les fragments à préserver (tags
  `{…}` déjà localisés au rendu, `<color>`, `\n`), traduit la prose seule,
  réinsère. Deux moteurs, bascule auto : **DeepL** primaire (mode XML
  `ignore_tags`, quota gratuit) → sur **456** (quota épuisé) → **Claude Haiku**.
  Remplit uniquement les langues vides (préserve les trads manuelles), champs
  « à revoir ». Clés `DEEPL_API_KEY` / `ANTHROPIC_API_KEY` (env, dev-only).
- **Aperçu inline fidèle (descripteurs + vrais composants)** — l'aperçu des tags
  `{TYPE/…}` ne réimplémente plus le rendu (couleurs seules, sans icônes) :
  `resolveInlineSegments` (sibling de `parseText`, partage ses résolveurs privés
  → zéro dérive) projette le texte en DESCRIPTEURS purs, la server action
  `inline-preview-actions` les renvoie (résolveurs effets/équipement server-only,
  `node:fs`), et `InlinePreview` (client) les rend avec les VRAIS composants
  inline (`InlineIcon`/`ItemInline`/`StatInline`/`EffectIconTile`, tous
  client-safe) → identique au site (icônes, couleurs, liens, tooltips). Corrige
  le mur Next 16 : renvoyer du JSX de composants clients depuis une action casse
  le manifeste RSC Turbopack → on ne traverse QUE des données. `parseText`
  intouché (tests verts). Câblé dans `InlineTextField` (prop `lang` réintroduite),
  route `/api/admin/preview-text` supprimée (repliée dans l'action).

- **Guide « Weekly & Monthly Reference Tables » porté** (timegate-resource,
  economy, ordre 5) — re-pivot par item du même socle `ProductTemplet`. Pour un
  panel curé de ressources (manuels, transistones, poussière/mémoire, glunite,
  engrenage de singularité, limit break) : d'où on les récolte par semaine/mois
  et combien. Frontière dérivé/curé tranchée SOURCE PAR SOURCE (règle Sevih :
  dérivable → on dérive, sinon → on cure) — vérifiée dans la donnée de jeu :
  - _Dérivé_ (`timegate-resources.json`, générateur) : les sources de SHOP.
    **UN SHOP = UN ONGLET d'échange RÉEL** du jeu (`ProductCategory` →
    `ShopTabType` de `ProductShopTabGroupTemplet`), PAS une monnaie — correction
    Sevih 19/07 : grouper par `ProductBuyType` scindait l'onglet **Arena**
    (`PC_PVP`) en deux faux shops (points d'arène `PBT_PVP` hebdo + arène temps
    réel `PBT_PVP_REAL` mensuel) → désormais une seule ligne Arena hebdo+mensuel.
    On EXCLUT les catégories sans onglet d'échange (`PC_TOWER`/Automaton Coin,
    `PC_REMAINS`) que la V2 n'avait pas listées non plus. Résultat = les 7 shops
    canoniques V2 (general, guild, arena, stars, survey, worldboss, joint), mais
    DÉRIVÉS. Produit COURANT via les helpers `computeAsOf`/`isCurrent`/`PERIOD`
    EXPORTÉS de `shop-priorities` (une seule règle) ; quantité = `MaxBuyCount` ×
    période, auto-corrigée (retire l'arena/survey Basic Manual expiré fin 04-2026,
    impossible à tenir à la main).
  - _Curé_ (`data/curated/timegate-resources.json`) : le panel d'items + leur
    regroupement en onglets (choix éditorial), ET les sources NON-SHOP dont la
    quantité est une estimation joueur ABSENTE de la donnée — vérifié : drops
    de Floor 3 (probabilistes), échange de points d'Extermination
    (`IrregularChaseExchangeTemplet`, zéro colonne limite/reset → budget estimé),
    Singularité rang/daily/ranking (suppose SSS++ + 4 jours joués), missions,
    atelier de Kate (recette dans `ItemCraftConsumeTemplet` mais limite hebdo de
    craft absente). Chiffres transplantés verbatim de la V2. Zéro chevauchement
    avec le dérivé → pas de double comptage. Totaux calculés au build (mensuel
    global = mensuel + hebdo×4). Guide V3 : `SegmentedTabs` 6 onglets, une table
    par item, items en tuile à CADRE DE RARETÉ (`ItemInline`), badge par type de
    source. Aucune horloge (déterministe, « ne bouge que quand la donnée bouge »).

- **Guide « Shop Purchase Priorities » porté** (economy, ordre 4) — le plus
  data-driven de la catégorie. La V2 codait ~1000 lignes de contenu de shop EN
  DUR (`data.ts`), déjà PÉRIMÉ (Guild Shop rebrassé le 2024-12-03 : prix changés,
  Intermediate Skill Manual 200→150 Guild Coins). Nouveau générateur
  `shop-priorities.json` : les 8 shops permanents « à monnaie » (guild, joint,
  friend, arena, stars, worldboss, adventure-license, survey) DÉRIVENT de
  `ProductTemplet` — noms (ProductNameID→TextItem, 4 langues), coûts, limites,
  périodes, monnaie (asset du catalogue). « Produit courant » 100 % déterministe
  SANS horloge (exigence Sevih « trigger quand ça bouge uniquement ») : ancre
  `asOf` = StartDate réelle max (cluster d'années contigu → écarte les sentinelles
  forever 2034/2224/2999), courant si `StartDate ≤ asOf < EndDate`. Overlay curé
  `data/curated/shop-priorities.json` = SEUL l'éditorial (priorité S/A/B/C +
  notes), keyé par un slug STABLE `shop/<goods>/<période>` (le productId ET le
  ProductNameID bougent à chaque rotation ; l'invariant est CE QU'ON ACHÈTE) —
  la priorité reste accrochée quand le jeu rebrasse le shop. Seed depuis la V2
  (72/126 produits ; le reste = items V2 périmés rotationnés out, ou produits
  nouveaux jamais notés — à compléter à l'admin). Shops variables (Event,
  General/Resource) ou texte (Supply, Rico) restent éditoriaux (transplant
  verbatim, `editorial.ts`). Guide V3 : `SegmentedTabs` 12 onglets, table unifiée
  dérivé/éditorial sur primitives, textes supply/rico. Icône meta
  `TI_Web_Event_Coin` (collecte au prochain push d'assets).
  - _Retours icônes Sevih_ : (1) les 37 items sans icône résolus — équipement
    (arena/al) via le domaine gear (`buildEquipment`, namespace
    `images/equipment`, d'où `iconKind` sur chaque entrée) ; tickets PGT_TICKET
    (Stamina, Arena Ticket) via asset du catalogue ; seul « Title [Tycoon] »
    reste sans sprite. (2) Onglets : 12 icônes de shop dédiées (`shop_*.webp`
    V2 → `images/ui/shop/`, manifest + `img.shopIcon`) plutôt que l'icône de
    monnaie (vide pour world boss / joint challenge, absente pour les shops
    éditoriaux supply/rico/event/resource). (3) CADRE DE RARETÉ manquant : rendu
    des items via `ItemInline` (tuile `img.slotFrame(grade)` + icône + tooltip,
    comme les chips `{I-I/…}` de parse-text) au lieu d'`InlineIcon` — d'où un
    champ `grade` par entrée ; items éditoriaux (event/resource) résolus par nom
    sur le catalogue (`CATALOG_BY_NAME`) pour icône/grade/desc. (4) Le manifest
    ne collectait qu'un sous-ensemble d'icônes d'équipement (familles wiki +
    unique 6★) → 404 sur les équipements mid-tier du shop : collecte désormais
    TOUTES les icônes d'équipement (327 sprites de tier distincts, webp), à
    disposition hors pages détail. Assets `ui/shop` + équipement à pousser.
- **Éditeur EE — suivi (menu, colonne Curé, descriptions, portrait, passifs)**
  (raffinements de l'éditeur EE livré le même jour). (1) Menu Editor : retrait
  des entrées « à venir » armes/amulettes/armures/talismans + pages placeholder
  (seul l'EE a une curation à éditer). (2) Liste `editor/ee` : colonne « Curé »
  (✓/—, TOUTE curation posée — rang ou chips). (3) Fiche `editor/ee/[id]` :
  descriptions des effets (légende chips + ajouts, `EeChipMeta`/`EffectOption`
  gagnent `desc`) et section « Passifs (référence) » (paliers résolus déblocage
  Lv.1 + Lv.10 via `eeModelForView().passives`, textes remplis) — on ne voyait
  pas les passifs de stats sans chip. (4) Portrait EE (`img.ee`) au lieu de la
  face du perso sur les deux pages. Lint + 353 tests OK.

- **Exports src sans consommateur RETIRÉS** (dette code / code mort). RETIRÉS :
  `elementName`/`className` (game-tokens), `tagDesc` (tags), `SuffixLang`/
  `getLangConfig`/`GameLang`/`GAME_LANGS`/`isGameLang` (i18n/config — copie site
  self-référentielle, la vraie vit en datagen), repli inopérant de
  `guide-sections.ts:69-72` (`resolveEffectKey` teste déjà les 2 côtés).
  DÉ-EXPORTÉS (usage interne conservé) : `resolveRewardEntry`, `EffectTooltipBody`,
  `ELEMENT_HEX`. GARDÉS volontairement : `getMonthYear`/`buildVideoObjectJsonLd`/
  `buildFaqJsonLd` (seo.ts — /tierlist et /tools à venir ; `getMonthYear`→
  `serverNow` au portage).

- **Tokenisation couleurs guides — Phase 1 (palettes .ts) + galerie dev**
  (chantier Sevih 16/07, périmètre choisi 18/07 : palettes+composants d'abord,
  éditorial `_contents` en phase 2). Méthode actée : tokens PAR RÔLE aux valeurs
  EXACTES → rendu inchangé. Fait : (1) `nodeStyles.ts` (Monad Gate) — 4 couleurs
  vives de texte sorties en tokens `--monad-milestone/explore/combat/story`
  (yellow/green/red/sky-400 V2), exposés `text-monad-*` ; le filtre CSS qui
  teinte le sprite reste une chaîne `filter` à part. `ELEMENT_RING` déjà
  tokenisé. (2) `TurnOrder` : amber SPD → `text-stat` (le point précis du TODO ;
  look inchangé, l'unification SPD amber-vs-neutre reste un choix visuel).
  (3) `/dev/tokens` (`page.dev.tsx`, dev-only) : GALERIE des tokens EN CONTEXTE —
  chaque token appliqué dans une mini-maquette du composant qui l'emploie (carte
  neutre surfaces/contenu, encarts de statut, nœuds Monad, chips buff/debuff,
  valeurs de stat, chaîne, éléments, raretés/grades, rôles d'équipe, rampe de
  chaleur) + sa valeur résolue au runtime (lue via `useSyncExternalStore` pour
  respecter `set-state-in-effect`) — pour voir OÙ et COMMENT ça rend, et ajuster.
  (4) 1er ajustement piloté par la galerie : `--content-subtle` #64748b→#808ea6
  (les légendes discrètes tombaient à ~3:1 de contraste sur `surface-overlay`, sous
  le seuil AA en `text-xs` ; remonté à ~4.4:1, reste le cran le plus faible sous
  `content-muted`). (5) `MonadGateMap` — conversions EXACTES sûres (valeur =
  token existant, 0 pixel bougé) : `text-yellow-400` #facc15 → `text-monad-milestone`
  (2 cases à cocher + texte « requis » + titre True Ending) ; `hover:text-red-400`
  #f87171 → `hover:text-danger` (croix de fermeture). (6) `MonadGateMap` — nuances
  bespoke : arbitrage tranché par Sevih = TOKEN-FIN EXACT (0 pixel bougé, pas
  d'unification color-mix). 12 tokens `--monad-*` ajoutés aux valeurs OKLCH EXACTES
  de Tailwind v4 (relevées dans `tailwindcss/theme.css`) : famille choix (choice-bd/
  bg/chip-bd/text), clé (key/key-soft/key-badge), « n'a pas d'importance » (void-bd/
  bg/text), pastille de quête (quest-bd/text ; fond jaune réutilise monad-milestone).
  Les 9 classes vives (green/emerald/red/yellow à opacités) routées dessus, opacité
  gardée côté classe (`/30`…). Restent en littéraux SVG (attributs de présentation,
  `var()` non résolu) : `fill="white"`, `stroke="black"`, `#facc15`, `#fde047` —
  hors cible de l'eslint (classes). Galerie `/dev/tokens` : bloc « Encarts Monad
  Gate » ajouté (reproduit les usages réels). (7) Famille SÉLECTION jaune-or —
  rôle fonctionnel partagé des category-views (onglet/carte actif, anneau de
  survol). 3 tokens sémantiques `--select`/`--select-fg`/`--select-fg-hover`
  (yellow-400/300/200, valeurs OKLCH exactes) ; ~10 usages routés dessus sur 7
  composants (ModeColumns, AdventureGrid, LicenseTabs, MonadGateGallery,
  MonadRouteClient, SpecialRequestSplit, SkywardTowerView) ; opacités gardées
  côté classe. MonadRouteReward `text-emerald-300` (titre First Clear) réutilise
  `--monad-key-soft` (valeur exacte, 0 nouveau token). Galerie : bloc « Sélection »
  ajouté. Typecheck + lint + 423 tests OK. (8) Palette d'IDENTITÉ des catégories
  `guide-accents.ts` — fork tranché par Sevih = TOKENISER. 33 tokens `--cat-<teinte>-*`
  pour 11 catégories colorées (emerald/sky/indigo/amber/orange/violet/teal/rose/
  red/fuchsia/cyan) × 3 rôles : `-fg` (texte -300) + `-bd` (bords/fonds -500,
  opacité côté classe) exposés en `@theme inline` ; `-glow` (ombre colorée au
  survol, hex V2 verbatim) en var brute dans le `shadow-[…]`. fg/bd = OKLCH EXACTES
  de Tailwind v4. `other` (fourre-tout) reste neutre-tokenisé. Galerie : bloc
  « Accents de catégorie » appliquant la vraie map `GUIDE_ACCENT`. Lint + 423 tests
  OK. (9) 3 rouges stragglers → rampe danger cohérente : 2 tokens `--danger-strong`
  (rouge-500) / `--danger-deep` (rouge-600), valeurs OKLCH exactes, au-dessus de
  `--danger` (rouge-400). BossPanel `text-red-500` (id non résolu) → `text-danger-strong` ;
  TowerCombatRoster `border-red-500 bg-red-500/15` (ban) → `border/bg-danger-strong` ;
  IrregularChaseMap `border-red-600 hover:border-red-400` (cadre) → `border-danger-deep
group-hover:border-danger`. Galerie : rampe danger ajoutée au bloc Statut.
  ★ Les composants guides NON-ÉDITORIAUX sont désormais 100 % sans classe vive
  (vérifié). Lint + 423 tests OK. RESTE : extension RAW_COLOR aux couleurs vives
  (gros chantier séparé qui touche TOUT le repo, pas que les guides).

- **Tokenisation couleurs guides — Phase 2 (composants ÉDITORIAUX)** (suite du
  chantier, périmètre phase 2). Même méthode : tokens PAR RÔLE aux valeurs EXACTES
  (OKLCH Tailwind v4 / rgba V2 verbatim), rendu inchangé. Famille `--ed-*` (21
  tokens) : (1) palette canonique à 6 teintes de `editorial/accents.ts` (QACard/
  Callout/TocBar…) — base `-400` (`--ed-sky/violet/emerald/amber/rose/cyan`, à
  opacités côté classe) + `-glow` (halo des puces, rgba V2 en var brute dans le
  `shadow-[…]`) ; fichier réécrit dessus (text/stripe/chip/callout/borderL/borderT/
  dot/from). (2) crans annexes des bannières/reviews : `-soft` (-200, texte de
  callout : BannerBlocks amber/emerald/sky), `-faint` (-100, anneau d'onglet au
  survol : BannerTabs), `-deep` (-500, anneaux PvE/PvP : review premium sky/rose),
  `--ed-pink` (héros « limited »), `--ed-purple-fg/-bd` (review fusion). 5 fichiers
  routés (BannerBlocks, BannerTabs, LimitedHeroesList, reviews/premium, reviews/
  fusion). Galerie `/dev/tokens` : bloc « Accents éditoriaux » (vraie map
  `EDITORIAL_ACCENT` : callout + puce lumineuse + crans annexes). ★ Toute
  l'arborescence `components/guides/**` est maintenant sans classe vive. Lint +
  423 tests OK.

- **Verrou eslint — couleurs vives interdites sous `components/guides/**`**
  (lock-in de la tokenisation). Nouvelle règle `no-restricted-syntax` scopée à
  `src/components/guides/**` : interdit EN PLUS des gris/white/black (RAW_COLOR)
  les classes vives numérotées (`red/sky/emerald/…-100…900`, préfixes bg/text/
  border(-lrtbxy)/ring/fill/stroke/from/via/to/divide/outline/decoration) —
  regex `VIVID_COLOR`, message dédié pointant vers les tokens + `/dev/tokens`. Le
  bloc RÉ-INCLUT les sélecteurs RAW_COLOR (un bloc flat-config redéfinit la règle
  pour ses fichiers). Périmètre volontairement CONFINÉ aux guides (arbo tokenisée) :
  le reste du site (fiche perso exemptée, tools/landing) n'est pas prêt. Prose
  `_contents` hors périmètre (vit dans `app/**/guides/_contents/**`). Vérifié :
  lint vert sur tout le repo + test négatif (une vive injectée = erreur, message
  correct). RESTE (hors chantier guides) : tokeniser tools/landing puis étendre le
  garde-fou ; prose `_contents` éditoriale (à laisser en Tailwind direct, à confirmer).

- **Lot config / hygiène (dette)**. (1) Trous de typecheck comblés :
  `next.config.ts` + `vitest.config.ts` ajoutés au `include` de la tsconfig racine
  (couverts par la passe `tsc` principale) ; `scripts/*.mjs` (maillon R2 :
  `assets-push`, `r2-cors`) désormais typecheckés — `scripts/tsconfig.json` passe
  en `allowJs+checkJs` (+ `**/*.mjs`), les 18 gaps révélés corrigés par
  annotations JSDoc INERTES (objets `env`/`pushed` typés `Record<string,string>`,
  params crypto/`walk` typés). Les 3 passes tsc vertes, `node --check` OK.
  (2) `.env.example` : `DB_*`/`BOT_API_URL` (lus par AUCUN code, vérifié) annotés
  « V2 — pas encore porté » (mémo de prod, plutôt que supprimés). (3) Doc↔code :
  en-tête de `src/lib/data/geas.ts` corrigé — il disait que le classement bonus/
  malus se lit sur le flag `positive`, alors que `isBonusGeas` classe sur le SIGNE
  de `points` (« aide au combat ≠ bonus de score »). RESTE (hors ce lot) : CSP
  nonce + strict-dynamic (risqué : middleware + vérif build/runtime → passe dédiée) ;
  doc↔code restants en datagen (worker).

- **Recherche globale (palette Ctrl+K)** — item « Pages manquantes ». Trigger
  header (desktop = pilule « Search… ⌘K », mobile = loupe) + raccourci global
  Ctrl/⌘+K. Archi : index construit CÔTÉ SERVEUR (`src/lib/search-index.ts`,
  `buildSearchIndex(lang, t)`) et servi par un route handler `/api/search?lang=`
  (Cache-Control CDN agressif) — chargé à la 1re ouverture, PAS inliné dans le
  header de chaque page. Périmètre : pages (nav + catégories de guides + pages
  annexes, contrat `lib/nav.ts`), personnages (`/characters/<slug>` + face icon),
  guides (`/guides/<cat>/<slug>`). **Équipement différé** (éclaté familles/sets/EE,
  slugs dérivés — l'archi et la palette le prennent tel quel, `kind:'equipment'`).
  `SearchModal` (client) : fetch mémorisé au niveau module (par langue, requêtes
  concurrentes dédupliquées), filtre ACCENT-INSENSIBLE (NFD), résultats groupés
  par nature (8/groupe), navigation clavier complète (↑↓ parcourt, Entrée ouvre,
  Échap ferme), voile + verrou de scroll. `buildSearchIndex` est BEST-EFFORT par
  source (`source()` : une source qui jette — ex. guide transitoirement malformé
  pendant un portage — est ignorée avec `console.warn`, la palette ne 500 pas ;
  l'erreur reste levée bruyamment par les pages qui lisent la donnée en direct).
  Test `search-index.test.ts` (7) sur la donnée committée. Lint + tsc OK, suite
  464 verts (arbre guides redevenu sain). Fix : les pages de CATÉGORIE de guides
  affichaient un carré vide → icône `img.guideIcon(cat.icon)` ajoutée (garde-fou
  de test).

- **Tests `seo.ts` + compléments `skill-view`** (suite de la campagne tests,
  +35 → 458). `seo.test.ts` (26) : `createPageMetadata` (canonical, hreflang ×5
  - x-default dérivés de `buildUrl`, suffixe titre, tailles/carte OG-Twitter
    défaut vs custom carré/paysage, robots noindex, locale, og:type article vs
    website), et tous les builders JSON-LD (`buildSiteJsonLd` graphe connecté,
    breadcrumb positions, `VideoGameCharacter`/`Article` image absolutisée +
    `datePublished` repli, `ItemList` ordres schema.org, `VideoObject` youtube/
    twitch/bilibili + null si champ Google manquant, FAQ, `getMonthYear`).
    Assertions dérivées des mêmes helpers (`buildUrl`/`CANONICAL_ORIGIN`) → indép.
    de l'env. `skill-view.test.ts` (+9 → 39) : `cardEffects` (effets propres,
    union variantes, héritage burst_1..3 du burstable, passif rattaché par caller,
    curation chipHide/chipAdd substituable, vide→undefined) + `levelTooltipEffects`
    (tooltip de niveau à icône → chip ; statut cité comme CONDITION par la desc
    exclu) — ancrés sur un tooltip réel à icône CALCULÉ du glossaire committé.

- **Lot de tests « petits modules purs »** (suite de la campagne tests, +40).
  Six fichiers co-localisés : `stats.test.ts` (statAbbr connu/repli,
  `statOptionView` sur les 4 régimes flat/rate/%/RAW_FLAT — EFF flat brut, ATK
  rate suffixé, CHC % sans suffixe —, `statIconSprite` WG=undefined, `statName`
  glossaire+repli) ; `game-tokens.test.ts` (reconnaissance élément/classe +
  slug/nature, FRONTIÈRE LATINE « Fire »∉« Firefly », reconstruction fidèle,
  mention CJK sans frontière de mot) ; `tower-restrictions.test.ts` (ban prime
  sur quota, alias attacker→striker/priest→healer, star numérique, neutral) ;
  `site.test.ts` (`buildUrl` en routage PATH et SUBDOMAIN via `vi.stubEnv` +
  import dynamique — le module fige son profil au chargement —, apex vs
  sous-domaine, normalizeLang, racine sans slash) ; `i18n/index.test.ts` (`makeT`
  interpolation, clé brute si absente, `{k}` littéral, pluriels ICU one/other/#,
  combiné) ; `guide-sections.test.ts` (`resolveSectionTitle` title/preset/sujet
  avec `t` factice + jets sur preset/élément/perso inconnus). Stratégie : pur en
  synthétique, ancrage glossaire committé pour le reste. 383 → 423 tests, typecheck
  OK. RESTE mineur : builders JSON-LD de seo.ts + hreflang `buildAlternates`.

- **Tests `skill-view.ts` — APPROFONDISSEMENT (vues monstre / immunités /
  chaîne)** (suite du prio 1). +12 tests (18 → 30). VUES MONSTRE
  (`monsterSkillViews`, le cœur commenté « cas payé ») : duplication d'un effet
  de passif vers son skill déclencheur `caller` (ET conservation) — les cas
  Prototype EX-78 / Irregular Queen ; caller IGNORÉ sur skill actif (faux positif
  de kit réutilisé) ; réattribution vers le seul skill dont la desc nomme le buff ;
  fusion `rage_finish`→`rage_enter` (finish sans nom/desc absorbé) ; finish
  orphelin (sans enter) supprimé ; variante technique masquée ; WG jamais une chip
  côté monstre ; `chipOwner` curé prioritaire sur les signaux de tables.
  `immunityChipEffects` : résolution tooltips + types (`effectByKey` côté debuff)
  - baisses de stat (`BT_STAT|ST_*`), repli déclinaison-numérotée→base, réfs
    mortes rendues en `unresolved`. `buildChainView` : null sans chain_passive,
    répartition strike→chaîne / backup→duo, un niveau par palier. 371 → 383 tests.

- **Tests `skill-view.ts` (prio 1 du TODO)** — le module aux règles les plus
  fines du repo (741 lignes) n'avait AUCUN test. 18 tests posés
  (`skill-view.test.ts`), stratégie endossée par le TODO : règles DÉTERMINISTES
  en synthétique + ancrage sur le glossaire committé (une clé tooltip réelle
  calculée à l'exécution, pas de `.gamedata` requis). Couvert : les exclusions de
  câblage de `toChipEffect`/`toClientEffects` (enfant `choice`, `NON_CHIP_BUFFS`
  Ais/Astei/Ember, `BT_STAT` à label seul, `SYS_BUFF_DMG`, reverse-heal ciblé
  soi/allié = coût HP, tooltip irrésoluble) et le cas positif (tooltip du
  glossaire → chip) ; `isTranscendUpgrade` via ses 3 branches (palier autonome
  cantonné / rattaché par `caller` gardé / accordé au niveau 1 gardé) ;
  `monsterChipMeta` (WG→null, résolution nom+nature) ; `buildBurstViews`
  (numérotation 1..3, coût AP du burstable, variante la plus complète) ;
  `dedupSkills`, `mainSkills` ; smoke sur 400 skills réels (aucun throw,
  `buildStatusMap` rend des statuts). 353 → 371 tests. RESTE (TODO) : vues
  monstre (réattribution caller/enrage), immunités, chaîne, curation cardEffects.

- **Props / branches mortes retirées** (dette code, chaque prop RE-VÉRIFIÉE contre
  tous ses call sites). `CharacterCard` : 6 props d'affichage jamais passées
  (showName/showIcons/showElement/showClass/showStars/showBadge) + `children` +
  la branche `maxWidth: 120` inatteignable (seul `sm` atteint le nom-sous-carte,
  et son container fait 66) → composant allégé, sortie IDENTIQUE (les défauts
  valaient déjà true). `title` : prop morte de MonadRouteClient (le seul appelant,
  MonadGateGuide, ne la passe pas) qui alimentait un `<h2>` mort de MonadGateMap —
  retirée des deux + son rendu. `defaultIndex` : mort sur SegmentedTabs (toujours 0) et BossEncounters (toujours `encounters.length-1`, la difficulté la plus
  dure) → inliné ; EncounterSelection.defaultIndex GARDÉ (requis, passé par
  StagedBossGuide). `guide-accents.ts` : `textSoft`/`dot`/`stripe`/`border` lus
  par personne (CategoryCard n'utilise que 7 des 11 champs) → 48 chaînes Tailwind
  mortes supprimées, type resserré. Typecheck + 353 tests OK.

- **Éditeur admin EE** (dernier éditeur d'équipement — les autres pièces n'ont
  pas de curation à éditer, décision Sevih). L'`editor/ee` était un placeholder ;
  la couche curée EE (`rank`/`rank10`, tier list V2 ee-priority-base/plus10)
  existait dans `equipment.json` et s'affichait déjà mais était éditée MAIN.
  Livré, en DEUX volets dans un seul formulaire :
  • **Priorité** : sélecteurs `rank` (déblocage) / `rank10` (+10) avec aperçu
  image (`IG_Event_Rank_*`).
  • **Câblage buff/debuff des passifs** (demande Sevih) : masquer/ajouter les
  chips des passifs de l'EE (carte UNIQUE — un EE n'a qu'un jeu de passifs).
  Modèle : `EquipmentCuratedEntry` gagne `chipHide?`/`chipAdd?` (EE-only) ;
  `buildEeDetail` applique la curation aux `effectChips` (helper `eeChipEffects`
  partagé avec l'export `eeEditorChips` des chips AUTO résolues). `effectChips`
  passe de `EffectShape[]` à `ClientEffect[]` (contrat réel d'EffectChipsRow).
  Store `equipment-curated-store.ts` (upsert de l'entrée `ee`, préserve les
  autres sections + un éventuel `source`, section `ee` triée, `writeJson`
  canonique, validation `validateEquipmentCurated`) + route `POST
/api/admin/curated/ee/[id]`. Pages : liste `editor/ee` (rangs + lien) +
  `editor/ee/[id]` (form `EeCuratedEditor`), `EntitySwitch` élargi à `ee`. Nav :
  `soon` retiré, cellule Édition de la matrice d'accueil branchée (couverture
  X/N). Vérifié : `equipment.json` déjà canonique (0 reformatage à la 1re
  écriture), rendu public EE byte-identique (aucune curation chip posée),
  typecheck + lint (fichiers propres) + 353 tests OK.

- **`ResponsiveCharacterCard` : layout-shift réduit (défaut SSR = md) + hook
  mémoïsé** (perf UI publique, page la plus visitée). Deux volets :
  (1) `useMediaQuery` mémoïsé — `subscribe`/`getSnapshot` étaient recréés à chaque
  rendu → `useSyncExternalStore` se désabonnait/réabonnait à `window.matchMedia`
  à CHAQUE rendu, multiplié par les ~200 cartes (2 requêtes chacune). Passés en
  `useCallback([query])`. Bénéficie aussi à TeamSlotCarousel.
  (2) Layout-shift — DÉCISION Sevih : le SSR (sans viewport) partait toujours sur
  `sm` (66px) puis sautait à `lg` (120px) à l'hydratation. `useMediaQuery` gagne
  un `serverDefault` (via `getServerSnapshot`) ; la carte force `md` au SSR
  (`/characters` est surtout desktop). Le shift devient md→lg au pire sur grand
  écran, mobile se recale md→sm — plus jamais depuis 66px. `useSyncExternalStore`
  gère le recalage client sans warning d'hydratation. TeamSlotCarousel inchangé
  (serverDefault reste `false`). Typecheck (mes fichiers) + 353 tests OK.

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
