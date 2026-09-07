# TODO

> Le « à faire » uniquement — le « fait » migre dans [DONE.md](./DONE.md)
> (décision Sevih 2026-07-17). Réécrit le **2026-07-17** après audit complet du
> code, puis nettoyé les 18, 19, 20, 21 et **26/07** : à chaque passe, le « fait »
> migre dans DONE et les sections vidées sont retirées — leur bilan vit là-bas, le
> garder ici en produirait une copie qui finirait par mentir.
> Le **24/08**, l'item PRIO (Dimensional Supply au guide des bannières) est parti
> dans DONE avec la refonte in-game qu'il attendait, et sa section — vide — a
> suivi.
> État de référence : **26/07** — la migration du 24/08 n'était PAS une passe de
> relecture, les items ci-dessous n'ont pas été re-vérifiés contre le code depuis.
> Re-vérifier chaque item contre le code au moment de le traiter (le 26/07, cette
> relecture a corrigé deux chiffres périmés — cf. l'item SEO ; l'autre, le
> CHANGELOG, est tranché depuis : gelé, cf. DONE 03/08).
> Le **07/09**, l'audit transverse ([audit/transverse.md](./audit/transverse.md),
> constats G1–G52) a ajouté sa propre section ci-dessous — ces items-là SONT
> vérifiés contre le code (chaque Haute/Moyenne re-lu de première main ce
> jour-là).

---

## 📄 Pages manquantes (inventaire layout du 2026-07-17)

> Cibles du header/footer posés le 17/07 (contrat `src/lib/nav.ts`) — 404
> ASSUMÉES le temps du portage. L'historique des portages (19-21/07) vit dans
> DONE. (Le pré-seed des clés de locale est TERMINÉ et purgé — une clé sans
> consommateur fait désormais échouer `locales/keys.test.ts`.)

- [ ] **`/tools` — hero-tracker : boucle de revue Sevih** (V2 livrée le 12/08 au
      périmètre in-game qu'il a dicté, cf. DONE — page PUBLIÉE le 12/08 sur ordre
      de Sevih). RESTE : (1) arbitrer les axes réellement utiles (Sevih : « on
      retirera des trucs à la fin ») ; (2) VÉRIFIER quel barème de limit break
      s'applique à un Core Fusion — l'outil prend sa rareté AFFICHÉE (3★ pour
      CF Snow, dont la base est 2★), ce qui est un choix, pas une donnée ;
      (3) `pnpm images` au prochain passage : le PNG de `CM_EtcMenu_Colleague`
      (og:image de la page) et les `PI_*` des pièces ne sont que dans le staging
      local — le manifest les demande déjà, aucune curation à faire (sa source
      était fausse jusqu'au 13/08, cf. DONE ; il est produit depuis).

## 🧹 Dette code

> L'audit du 07/08 est **entièrement traité** — hors volet damage, qui a son
> backlog séparé : [audit/damage-calculator.md](./audit/damage-calculator.md)
> (**D1–D5**). Bilan, y compris les constats tombés à la vérification, dans
> [DONE.md](./DONE.md).

- [ ] **Découper les gros composants client des autres outils — RÉSERVÉ SEVIH
      (décision 25/08 : pas un lot agent).** Le damage calculator a eu ce
      traitement le 25/08 (`DamageCalculatorBrowser` 4 983 → 2 147 lignes,
      éclaté en types / stores / briques UI / hooks d'état / sections — cf.
      DONE 25/08) ; le même motif « un composant client géant qui tient tout »
      existe encore sur `hero-tracker/HeroTrackerBrowser.tsx` (2 113 l. —
      désormais le plus gros fichier du repo),
      `tier-list-maker/TierListMakerBrowser.tsx` (1 939 l.) et
      `progress-tracker/ProgressTrackerBrowser.tsx` (1 384 l.). Dette FROIDE —
      aucun des trois n'est en souffrance active. Méthode qui a marché sur le
      calculateur, si utile : découpe par script de tranches de lignes (zéro
      retranscription), hook d'état destructuré sous les MÊMES noms (le JSX ne
      bouge pas), tsc/eslint/tests après chaque étape.

### Lots de fond SEO/perf (audit Sitebulb 20/07 — non urgents)

> Le gros de l'audit est traité (cf. DONE 20-22/07). Ce qui suit est du VOLUME
> éditorial, pas du bug — ce n'est pas mécanisable. Détail : `docs/seo&audit/`.

- [ ] **Reste du lot « titles/descriptions courts » : re-mesurer, puis les
      descriptions d'OUTILS** — le gros est traité le 03/08 (cf. DONE : titles
      des fiches perso/équipement/outils enrichis, 53 descriptions de guides
      dédupliquées). Restent : (1) re-passer Sitebulb pour re-compter ce qui
      est encore court après ces deux lots ; (2) les descriptions des ~17 pages
      d'outils (une phrase, honnête mais courte) — ARBITRAGE REQUIS : la même
      chaîne i18n (`tools.<slug>.desc`) sert AUSSI de sous-titre visible dans
      ToolShell et sur la landing /tools — l'allonger pour le SEO change
      l'écran. Options : découpler (clé meta dédiée) ou assumer le texte court.

## 🔎 Audit transverse du 07/09 (constats G1–G52)

> Source : [audit/transverse.md](./audit/transverse.md) — le rapport porte les
> lignes exactes, les vérifications et les correctifs détaillés ; ici, le « à
> faire » en clair, par lot. Le calculateur de dégâts (D1–D5) et la découpe des
> gros composants ne sont PAS ici : ils ont déjà leur item ou leur backlog.
> **S1** (limitation de débit sur `X-Forwarded-For`) est re-vérifié TOUJOURS
> OUVERT — cf. `audit/plateforme.md`, le correctif dépend du `Caddyfile`.

### Lot 1 — huit bugs invisibles depuis un poste de dev EN/desktop (une soirée)

- [ ] **`/constructor`, `/toString`, `/__proto__` font un 500** (G1) : les
      gardes `value in OBJ` acceptent la chaîne de prototype. Passer à
      `Object.hasOwn` dans les 7 gardes (`isValidLang`, `isGuideCategory`,
      `isGuideTier`, `towers.ts`, `tools.ts` `INDEX[slug]`, `[slug]/page.tsx`
      `TOOL_COMPONENTS`, `contribution.ts`, `general-guide-store.ts`) ; en
      ceinture `dynamicParams = false` sur `[lang]/layout.tsx`. Corriger le
      commentaire `layout.tsx:65-67` qui affirme qu'un lang inconnu n'arrive
      jamais.
- [ ] **Les puces de langue du footer ne changent pas de langue en prod** (G2) :
      elles pointent `/fr` (path) alors que la prod route par sous-domaine — sur
      `jp.`, cliquer FR reste en japonais. `Footer.tsx:160` → `buildUrl(l, '/')`
      comme `LanguageSwitcher`.
- [ ] **Chaîne / Duo jamais séparés en JP et ZH** (G3) : `splitChainDual`
      (`src/lib/skills.ts:47`) exige `:` ASCII, le jeu écrit `：`. Découpes
      réussies EN 129 / KR 129 / JP 8 / ZH 6. Regex `[:：]` + un test jp/zh.
- [ ] **Les chips à lien ne naviguent pas au doigt** (G4, à CONFIRMER sur un
      téléphone avant de toucher) : `InlineTooltip.tsx:40-45` fait
      `preventDefault` sur touchend, le click du `<Link>` est annulé. Ne pas
      empêcher quand le déclencheur contient un lien, ou mettre le lien dans la
      bulle en tactile.
- [ ] **Statut d'événement figé 24 h en ISR** (G5) : `event/index.tsx` calcule
      upcoming/ongoing/ended côté serveur. Envoyer les bornes au client et
      dériver avec `useNow`, comme `SeasonBadge` (règle déjà écrite dans les
      notes ci-dessous : « le statut en cours se calcule CÔTÉ CLIENT »).
- [ ] **Un PNG éditorial déposé pour CORRIGER une icône est effacé sans
      conversion** (G6) : `collect.ts:44-52` ne convertit que si le webp
      n'existe pas, mais supprime toujours. Convertir si plus récent, ne
      supprimer que ce qui a été converti.
- [ ] **HTML des patch-notes injecté sans assainissement** (G7) :
      `get-news.ts` `processContent` laisse `<script>` (23 dans le committé),
      les attributs `on*` et les iframes hors allowlist (30 vers un hôte vagames
      que la CSP bloque en silence). Retirer script/`on*`/`javascript:`,
      n'accepter que les iframes de `frame-src` (ou y ajouter l'hôte s'il est
      voulu).
- [ ] **La purge nocturne ne purge pas ce que trois commentaires lui
      attribuent** (G8) : `/api/revalidate` ne touche que les guides ;
      `/changelog`, `/feed/changelog`, `/tierlist` (titre « September 2026 »),
      `/event` restent 24 h en retard. Ajouter ces routes à
      `TIME_SENSITIVE_ROUTES`, remplacer les `new Date()` de `seo.ts:98`,
      `home.ts:73`, `changelog.ts:66` par `serverNow()` (promesse de
      `time.ts`), puis réaligner les commentaires de `changelog.ts:65`,
      `feed/changelog/route.ts:14`, `events.ts:274`.

### Lot 2 — métier, données, outillage

- [ ] **Le simulateur de pull ignore `recruit.json.customPool`** (G9) : la
      bannière custom tire 35 des 91 héros 3★ non-fusion que le jeu n'y met pas
      (Maxwell, Leo, Stella, Astei…). `isInCustomRecruitPool` existe, seul un
      guide l'appelle — brancher le wrapper `pull-simulator/index.tsx` dessus.
      Vérifier au passage le pool hors-focus des bannières rateup/premium/limited
      contre la donnée.
- [ ] **Tours very hard : 12 formations ALTERNATIVES émises comme une vague de
      35 monstres** (G10) : `encounters.ts:975-1015` aplatit ce que `towers.ts`
      sait être un pool tiré au hasard (vérifié sur 40103001). C'est exactement
      la confusion que la note « Tours : waves ≠ encounters » ci-dessous
      interdit. Reprendre la règle de `towers.ts` dans la passe donjon.
- [ ] **Deux générateurs dérivent le scaling des dégâts avec des règles
      différentes** (G11) : `damage-scaling.ts:64-92` vs `solver.ts:719-777` —
      Leo, Sterope, Tamara, Kuro divergent. Une seule fonction dans
      `datagen/lib/`.
- [ ] **`pnpm dev` (dry) écrit `data/generated/damage/` avec `skill-descs`
      bâti sur l'ANCIEN `skills.json`** (G12) : artefacts de deux versions
      estampillés du nouveau `resVersion`. Ne jouer `damage` que si `apply`, ou
      lire depuis `data/extracted` en dry.
- [ ] **`[floor]` rend n'importe quel guide avec n'importe quel entier** (G15) :
      `/guides/general-guides/beginner-faq/42` → 200 et une entrée ISR par URL.
      `notFound()` si le guide n'est pas une tour ou si `floor` n'est pas
      `^\d+$`, dans la page ET `generateMetadata`.
- [ ] **Six écritures non atomiques sur des fichiers committés** (G16) :
      `promote.ts:331` (tout `data/generated/*` à l'apply), `get-news.ts:294`,
      `stamp-guides.ts:172`, `assets-push.mjs:281`, `sync-comics-seed.ts:79`,
      `video-meta.ts:134`. Une `writeTextAtomic` dans `lib/json.ts`.
- [ ] **`pnpm commit` fait `git add -A`** (G17), ce que CONVENTIONS.md interdit
      (`commit.ts:288`, après un `pnpm format` sur tout le repo) ;
      `datagen/README.md:400` recommande `git add <dossier>`. Stager les chemins
      que le flux a produits + `git add -u` derrière confirmation. Trancher
      aussi : `revert` accepté par `commit.ts` mais absent de CONVENTIONS.
- [ ] **`scripts/init.ps1` teste LDPlayer mais lance la chaîne Steam, puis
      promeut sans revue** (G18) : gater sur `findSteamInstall`, remplacer
      `datagen:regen` par `datagen:patch`.
- [ ] **Boutons « Télécharger » qui ouvrent le fichier** (G19) : `download`
      cross-origin vers R2 sans `Content-Disposition` (vérifié `curl -I`).
      Poser `attachment` sur R2 (`audio/bgm/*`, wallpapers) ou `fetch → blob`.
- [ ] **Impossible de taper un niveau au clavier dans le hero-tracker** (G20) :
      `NumberField` borne à chaque frappe avec `min = 5`. Texte local, borne au
      blur/Enter.
- [ ] **OST : `ArrowUp/Down` et `Space` confisquent la page** (G21) — même sans
      piste, même sur un bouton focalisé. Garder si piste chargée et cible non
      contrôle.

### Lot 3 — régler à la source

- [ ] **Sept lecteurs de JSON curé, repli `{}` silencieux** (G13) :
      `curated.ts` (243 Ko relus à chaque appel), `effects.ts`, `equipment.ts`,
      `gear-reco.ts`, `search-aliases.ts`, `short-names.ts`, `tags.ts`,
      `guides.ts` — aucun n'utilise `disk.ts` qui offre déjà le cache mtime.
      Même famille dans datagen : `manifest.ts:83,104,674`, `lib/effects.ts:653`,
      `character-release.ts:414`. Un lecteur, absence tolérée, JSON invalide
      jamais.
- [ ] **40+ imports directs de `@data/*` hors data layer** (G14), interdit par
      CONVENTIONS : `skills.json`, `equipment/ee.json`, `glossaries.json`
      (chargé en statique ici, au disque là), 6 guides, 5 outils… Un accesseur
      par fichier dans `src/lib/data` + règle eslint `no-restricted-imports`.
- [ ] **Aucune modale ne gère le focus** (G22) : `ImageLightbox`,
      `SettingsModal`, `SearchModal`, la modale du progress-tracker ; le drawer
      de filtres reste tabulable sous `aria-hidden` ; le sous-menu Guides du
      header est hover-only. Un `useDialogFocus` partagé, `inert={!open}`,
      `group-focus-within`.
- [ ] **Durées « 3d 4h 12m » en anglais dans les 5 langues, quatre copies**
      (G23) : `BannerCountdown`, `BuffEventTimer`, `ServerResets`,
      `progress-tracker/tracker.ts`. `SingularityCountdown` a déjà tranché
      (numérique). Un `lib/format-duration.ts`.
- [ ] **Chaînes UI en dur** (G24) : 24 sites dans les outils (dont des messages
      d'erreur EN FRANÇAIS remontés tels quels par `roster-import.ts:108-113`,
      « Failed to load track » dans l'OST, `fire`/`striker` bruts en `alt`/`title`
      et dans le picker du hero-tracker) + 8 dans les composants (`ON`/`OFF`,
      `aria-label` anglais, nombres en `toLocaleString('en')`). Liste complète
      dans le rapport.
- [ ] **`router.replace` à chaque frappe** (G25) : `MostUsedUnitsBrowser`,
      `CharactersBrowser`, `TierListBrowser` — un aller-retour RSC par filtre,
      là où le tier-list-maker fait `history.replaceState` et l'explique.

### Au fil de l'eau (G26–G52 et dette — en passant sur les fichiers)

- [ ] `/api/tierlist` ne valide pas l'ASCII de `z` (colonne `CHARSET=ascii`) —
      `sql_mode` du VPS à confirmer (G26).
- [ ] `parseText` strict : `{E/xxx}`/`{C/xxx}` inconnus rendent une clé et une
      image cassée sans passer par `unknownRef` ; `{L/…|href}` non validé (G27).
- [ ] `fr` : `sys.element.*`/`sys.class.*` traduits dans l'UI mais la fiche lit
      le glossaire EN — trancher une source (G28).
- [ ] Littéraux `'en'` résiduels (`i18n/index.ts:12`, `api/search`, `feed`,
      `characters.ts`), `keys.test.ts` avec la liste des langues en dur,
      `error.tsx:21` qui parle de 519 clés (1 169) (G29).
- [ ] Mapping sous-domaine ↔ langue résolu par la CLÉ dans le proxy, par
      `subdomain` dans `site.ts` ; `outerpedia.com/jp/…` servi au lieu de
      rediriger (G30).
- [ ] `monsterIconSrc` recopie `img.monster` (G31) ; `next/image` dans
      `event/[slug]`, `EventsBrowser`, `EventBlocks` (G32) ; `GuideMeta.ogImage`
      documenté en chemin racine — le piège déjà corrigé pour `DEFAULT_OG_IMAGE`
      (G33) ; fiche perso : `revalidate = 86400` affiché, 60 s réel via le fetch
      des reviews (G34).
- [ ] **Commentaires qui mentent** (G35) : `Footer.tsx:19`/`Header.tsx:41`
      (« ASSUMÉES 404 »), `HeaderClient.tsx:63`, `tools/registry.ts:31`
      (hero-tracker « unlisted »), `datagen/refresh.ts:11,21`, `lib/python.ts:3`,
      `datagen/README.md:455` (« 20 générateurs », 31), `monad.ts:115,124`,
      `lib/lang.ts:9`, `towers.ts:44,85`, `items.ts:12`,
      `progress-tracker/tracker.ts:27` (`lastUpdated` écrit, jamais lu),
      `curated.ts`.
- [ ] **« Ni V2 ni V3 »** : `globals.css` 25 occurrences (seul fichier de
      `src/`), `next.config.ts:24`, `eslint.config.mjs:53,106`, `Dockerfile:3,6`
      (G36).
- [ ] `alt` contraires à la règle maison (18 sites, G37) ; `<div onClick>` et
      boutons icône sans nom dans progress-tracker, OST, tier-list-maker,
      team-planner, galeries (G38).
- [ ] Hero-tracker : long press qui avale le tap suivant (à confirmer sur
      appareil), « réinitialiser » gaté sur la liste filtrée et qui oublie
      `fused` (G39). OST : Précédent/Suivant grisés aux bornes alors que
      shuffle/repeat marchent (G40). Team planner : ordre de chaîne `0000`
      accepté (G41). Tier-list maker : couleur d'import non validée, nom de
      fichier exporté vide en JP/KR/ZH (G42). Patch-history : strip HTML sur
      2,8 Mo à chaque frappe (G43).
- [ ] Petites fuites : timers `setCopied` (×3), écouteurs du drag de LIGNE du
      tier-list-maker, `clipboard.writeText` sans catch, `setLastResults` dans
      un updater (G44) ; admin : `key={i}` sur listes réordonnées (G45).
- [ ] `stamp:guides` date en UTC (G46) ; trois parseurs de `.env.local`, celui
      de `datagen/lib/env.ts` vide tout en CRLF (G47) ; 39 commits `news` non
      conventionnels (G48) ; `.dockerignore` n'exclut ni `.gamedata-android/`
      (19 Go) ni `*.sql` (G49).
- [ ] Guides : `joint-challenge/shichifuja` `updated` février alors que sa
      dernière version est juillet ; 4 descriptions Joint Challenge répètent le
      titre entier ; `effect-filters.json` et `gear-presets.json` sans `_doc`
      alors qu'ils encodent des arbitrages (G50).
- [ ] `retired` posé par promote sur des entités dont le contrat ne le déclare
      pas (G51) ; collectes exécutées à l'import sans `isMain`, JSON écrits hors
      `formatJson` (G52).
- [ ] **Dette** (rapport § Dette) : 4 modales/lightbox, 3 sélecteurs de perso,
      3 barres élément/classe, `CLASSES` en dur ×4 avec deux ordres,
      presse-papier ×4, tooltip d'effet recomposé, recherche perso normalisée de
      3 façons, `esc()`/`rfc822()` ×2 ; datagen : `isPermille` divergent,
      deux listes de shops permanents, « persos intégrés » ×4 lecteurs, paires
      classe/enum en dur après dérivation, rebuilds redondants ; familles
      d'équipement rematérialisées à chaque appel ; 8 utilitaires morts dans
      `globals.css` et pas de `--text-2xs` pour les 349 `text-[10/11px]` ;
      schémas persistés non normalisés (tier-list-maker) ; Twitch `parent` sans
      les sous-domaines ; `lefthook` `parallel: true` format+lint ; convention
      « locales alignées par ligne » plus vraie, à réécrire.
- [ ] **Lot non couvert à relancer** : le code TSX des 148 guides (seuls les
      JSON ont été passés au script — l'agent prévu a été coupé par le quota),
      18 générateurs de `datagen/generators/` listés dans le rapport,
      `portrait-fx-*.ts` (WebGL).

---

## 📌 Notes de référence (à ne pas perdre)

- **Damage calculator : SURTOUT NE PAS se baser sur la V2** (décision Sevih
  22/07 : le calculateur V2 est foireux) — exception à la règle « V2 =
  oracle », conception V3 native. Vaut pour toute évolution future du moteur
  (l'outil est PUBLIC depuis le 25/08, item de portage soldé — cf. DONE).

- **Warnings Turbopack au build (« overly broad patterns » sur guides.ts,
  « unexpected file in NFT list ») : BÉNINS, mesurés le 26/07.** Le scan FS des
  guides fait tracer tout le projet → ~16 Mo embarqués à tort dans l'image
  (src 11 Mo + datagen 3 Mo + docs 1,4 Mo), négligeable vs les 1,6 Go du
  `.next` légitime (1584 pages SSG). Le runtime, lui, est garanti par
  `outputFileTracingIncludes`. Si le temps de build ou l'image dérivent un
  jour : annotations `/*turbopackIgnore: true*/` sur les `resolve()` de
  guides.ts (sans risque, l'inclusion étant déclarée à la main).

- **Assets d'événement : rien à pousser à la main.** La collecte
  (`datagen/assets/manifest.ts`, PAS `collect.ts` qui n'indexe que les sprites du
  jeu) est DATA-DRIVEN sur le curé : ajouter un événement en admin suffit, il n'y a
  aucune liste d'assets à tenir. `pnpm images` enchaîne collect + audio +
  wallpapers + comics + push — ce n'est pas une commande « événements », elle
  pousse TOUT ce qui est en attente.
- **Guide porté → son boss doit exister** : chaque `meta.bossId` d'un guide doit
  être dans `monsters.json`, sinon le rendu JETTE. Extraction à la demande
  (`pnpm datagen:extract-entity`).
- **Jointure guide↔saison** : par le monstre réellement combattu
  (`meta.bossId` ↔ `season.monsters`), JAMAIS par la colonne `boss` (id
  canonique d'affichage). Gravée dans `content-schedule.test.ts`.
- `battleEnd` ≠ `end` : un boss peut être « en saison » sans être combattable.
- Le statut « en cours » se calcule CÔTÉ CLIENT (`SeasonBadge`) — pages ISR 24 h.
- Tours : `waves` = formations successives ; `encounters` = pools alternatifs
  (very hard) — ne jamais confondre.
- Sécurité vérifiée saine à l'audit 17/07 (ne pas re-auditer sans raison) :
  routes admin doublement gardées (`.dev.*` hors build prod + `IS_DEV`),
  `/api/revalidate` en Bearer temps constant sans dégradation, anti-path-
  traversal correct sur `images/[...path]`, `.env.local` ignoré et non tracké,
  aucun secret committé/loggé, `.dockerignore` exclut `.env*`.
- **Frontière `admin/`** : le chemin ne garantit rien, 6 modules shippent en prod
  (liste blanche BLOQUANTE `ADMIN_SHIPS_TO_PROD` dans `eslint.config.mjs`, audit
  F2). Les dossiers de briques `components/admin/editorial/` et
  `premium-limited/` ne peuvent pas importer de secret : c'est vérifié par eslint,
  pas par convention.
