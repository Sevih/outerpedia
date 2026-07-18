# DONE — journal du suivi interne

> Pendant « fait » de [TODO.md](./TODO.md) (décision Sevih 2026-07-17 : le TODO
> ne garde que le « à faire »). Un item traité migre ici avec sa date ; le
> détail vit dans git. Ne pas confondre avec le `CHANGELOG.md` racine (public).

## 2026-07-18

- **Guide « Daily Stamina Burn » porté** (economy, ordre 3) : contenu verbatim
  V2 (labels 5 langues, roadmap 5 priorités, suggestions hors endgame, pro
  tips) sur les primitives éditoriales ; les noms des boss irréguliers
  DÉRIVENT de monsters.json (la V2 les codait en dur) — sauf l'Irregular
  Queen, au nom VIDE dans les tables du jeu (repli éditorial documenté). Deux
  entrées curées d'items ajoutées pour les tags {I-I/…} du guide : « Gems »
  (générique, icône V2 TI_GEM_dissolve_Random_3) et « Bounty Hunter
  Ticket(s) » (l'asset officiel TICKET_GOLD s'appelle « Frog Hall Ticket » —
  autre chose).
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
