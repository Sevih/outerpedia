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
> Le **25/09**, tri « délégable à un agent » : les items assez cadrés pour
> partir à un agent Opus ont chacun leur brief autoportant dans
> [lots-opus-2026-09-25.md](./lots-opus-2026-09-25.md) (A = petits, B = moyens,
> C = gros mécaniques) ; le reste y est listé comme réservé à Sevih.

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

## 🌍 Langues — le jeu parle français et espagnol (23/09/2026)

> Six langues dans le code depuis le 23/09, `es.outerpedia.com` servi depuis le
> 25/09 (infra + doubleurs vérifiés, cf. DONE). Reste une porte laissée fermée :

- [ ] **`China_Traditional`** : les tables `Text*` la portent, remplie à 100 %,
      et le site ne la sert pas. Trancher un jour si un `zh-TW` a un public —
      ce serait une septième entrée dans `LANGUAGES` + `GAME_LANGS`, une locale
      UI de plus, un sous-domaine de plus (et la question du nuage gris, comme
      `zh`). Pas à l'ordre du jour, tracé pour ne pas le redécouvrir.

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

### Lot 2 — métier, données, outillage

- [ ] Pull simulator : vérifier le pool HORS-FOCUS des bannières
      rateup/premium/limited contre le jeu (G9, reste). BLOQUÉ côté données :
      `recruit.json` n'expose que `customPool` ; il faudrait que le générateur
      `recruit.ts` émette aussi le pool de chaque `kind` (RecruitGroupTemplet)
      avant de pouvoir comparer.
- [ ] Chips à lien au toucher : VALIDER sur téléphone le « second tap =
      navigation » posé le 09/09 (G4).
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

### Lot 3 — régler à la source

- [ ] **40+ imports directs de `@data/*` hors data layer** (G14), interdit par
      CONVENTIONS : `skills.json`, `equipment/ee.json`, `glossaries.json`
      (chargé en statique ici, au disque là), 6 guides, 5 outils… Un accesseur
      par fichier dans `src/lib/data` + règle eslint `no-restricted-imports`.
- [ ] **Durées « 3d 4h 12m » en anglais dans toutes les langues, quatre copies**
      (G23) : `BannerCountdown`, `BuffEventTimer`, `ServerResets`,
      `progress-tracker/tracker.ts`. `SingularityCountdown` a déjà tranché
      (numérique). Un `lib/format-duration.ts`.
- [ ] **Chaînes UI en dur** (G24) : 24 sites dans les outils (dont des messages
      d'erreur EN FRANÇAIS remontés tels quels par `roster-import.ts:108-113`,
      « Failed to load track » dans l'OST, `fire`/`striker` bruts en `alt`/`title`
      et dans le picker du hero-tracker) + 8 dans les composants (`ON`/`OFF`,
      `aria-label` anglais, nombres en `toLocaleString('en')`). Liste complète
      dans le rapport.

### Au fil de l'eau (G26–G52 et dette — en passant sur les fichiers)

- [ ] `alt` contraires à la règle maison (18 sites, G37) ; `<div onClick>` et
      boutons icône sans nom dans progress-tracker, OST, tier-list-maker,
      team-planner, galeries (G38).
- [ ] `retired` posé par promote sur monsters/monster-skills/encounters alors
      que seul `DungeonRef.retired` existe dans le contrat — clé fantôme au
      premier retrait, que le validateur ne verra pas (G51) ; `comics.json`,
      `video-meta.json`, `posts.json` écrits hors `formatJson` (passe prettier
      par chance de forme, un tableau court le ferait échouer en CI) (G52).
- [ ] Admin : `key={i}` sur des listes réordonnées par `MoveButtons`
      (`EventsEditor.tsx:335,389`, `PremiumLimitedParts.tsx:503`) — l'état
      interne d'`InlineTextField` reste collé à la position ; il faut un id par
      bloc (G45).
- [ ] **Dette** (rapport § Dette) : 4 modales/lightbox, 3 sélecteurs de perso,
      3 barres élément/classe, `CLASSES` en dur ×4 avec deux ordres,
      presse-papier ×4, tooltip d'effet recomposé, recherche perso normalisée de
      3 façons, `esc()`/`rfc822()` ×2 ; datagen : `isPermille` divergent,
      deux listes de shops permanents, « persos intégrés » ×4 lecteurs, paires
      classe/enum en dur après dérivation, rebuilds redondants ; familles
      d'équipement rematérialisées à chaque appel ; 8 utilitaires morts dans
      `globals.css` FAITS ; pas de `--text-2xs` pour les 349 `text-[10/11px]` ;
      schémas persistés non normalisés (tier-list-maker) ; Twitch `parent` sans
      les sous-domaines ; `lefthook` `parallel: true` format+lint.
- [ ] **Lot non couvert à relancer** : `portrait-fx-*.ts` (WebGL). Les guides
      sont audités (09/09, [audit/guides.md](./audit/guides.md)) ; les 18
      générateurs sont en cours.

### Audit du code des guides (09/09, H5–H14 — ce qui reste)

- [ ] **Quatre index « nom EN → item », trois avec repli muet** (H5) :
      `gear`, `heroes-growth`, `shop-purchase-priorities` recopient une IIFE
      `CATALOG_BY_NAME` qui rend un `<span>` texte sur un nom inconnu ;
      `itemChipByName` (`editorial/banner/items.ts`) jette. Consommer
      `itemChipByName` partout.
- [ ] **152 couleurs Tailwind brutes dans 17 fichiers de guides** (H6) alors
      que `--ed-{sky,violet,emerald,amber,rose,cyan}` existent pour ça
      (`how-to-play` 23, `banner-mileage` 20, `roadmap-2026` 14 + 12 dans
      `data.ts`, `outerplane-on-linux` 14, `daily-stamina` 13…) ; SVG en dur
      dans `MonadGateMap`, `TowerCombatRoster`, `BannerTabs`, `AdventureGrid`.
- [ ] Anglais en dur dans des rendus localisés (H7, reste) : « Cost: »
      (`gear`), « Lv. 1 »/`orLabel="or"` (`core-fusion`), « Lv {lv} »
      (`fusion.tsx`), « WB: »/`alt="Ether"` (`ether-income`), « SPD »
      (`BuildRequirements`, `TurnOrder` — `statAbbr('spd')` existe),
      `PERIOD_ABBR` D/W/M/O (`shop-purchase-priorities`), `aria-label` « N
      stars » (`premium.tsx`), 5 `alt` de `roadmap-2026` ; `lang="en"` sur le
      conteneur d'`outerplane-on-linux`.
- [ ] `alt` contraires à la règle maison (H8) : `HeroReviewCard` (slugs bruts),
      doublons icône+texte dans `premium.tsx`, `BannerTabs`, `LicenseTabs`,
      `CardArt`, `fusion.tsx`.
- [ ] 92 chaînes courtes des `labels.ts` déjà dans les locales (H9) — deux
      vocabulaires pour un mot ; `t()` pour le chrome, `labels.ts` pour la
      prose. `eslint-disable` évitable dans `ether-income/Calculator.tsx:217`
      (H10). `QA` doublon de `QACard`, `Card`/`Heading`/`TableShell` définis
      dans le corps du composant, `goldCell` ×2 (H11).
- [ ] Hash d'onglets trompeurs de `banner-mileage` (`#banner=pickup` ouvre le
      custom…, H12) ; `reward`/`rewardWin` priorité inversée entre 3 sites
      (H13, sans effet aujourd'hui) ; à confirmer : doublon SEO
      `/<tour>/1` vs page de base, encart « annoncé juin, livré 8/09 » sur la
      roadmap (H14). Rendre `stamp:guides` automatique (hook pre-commit) pour
      que H3 ne se reproduise pas.

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
