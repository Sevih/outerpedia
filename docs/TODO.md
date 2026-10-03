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
> Le **25/09** et le **03/10**, 38 items assez cadrés pour un agent Opus ont
> été délégués et soldés (table des commits, leçons et préambule réutilisable
> dans [lots-opus-2026-09-25.md](./lots-opus-2026-09-25.md)). Ce qui reste
> ci-dessous demande une décision, un test physique ou une relecture d'abord ;
> une deuxième série de lots (A22–A25, B12–B14, F1–F7) est écrite au même
> endroit.

---

## 🧹 Dette code

> L'audit du 07/08 est **entièrement traité** — hors volet damage, qui a son
> backlog séparé : [audit/damage-calculator.md](./audit/damage-calculator.md)
> (**D1–D5**). Bilan, y compris les constats tombés à la vérification, dans
> [DONE.md](./DONE.md).

- [ ] **Découper les gros composants client des autres outils — lots F1, F2,
      F3 pour un agent Fable (décision Sevih 03/10 ; réservé jusque-là).** Le damage calculator a eu ce
      traitement le 25/08 (`DamageCalculatorBrowser` 4 983 → 2 147 lignes,
      éclaté en types / stores / briques UI / hooks d'état / sections — cf.
      DONE 25/08) ; le même motif « un composant client géant qui tient tout »
      existe encore sur `hero-tracker/HeroTrackerBrowser.tsx` (2 113 l. —
      désormais le plus gros fichier du repo),
      `tier-list-maker/TierListMakerBrowser.tsx` (**FAIT le 03/10, lot F2** :
      2 143 → 408 l., cf. DONE) et
      `progress-tracker/ProgressTrackerBrowser.tsx` (**FAIT le 03/10, lot F3** :
      1 435 → 230 l., cf. DONE). Dette FROIDE —
      aucun des trois n'est en souffrance active. Méthode qui a marché sur le
      calculateur, si utile : découpe par script de tranches de lignes (zéro
      retranscription), hook d'état destructuré sous les MÊMES noms (le JSX ne
      bouge pas), tsc/eslint/tests après chaque étape.

### Lots de fond SEO/perf (audit Sitebulb 20/07 — non urgents)

> Le gros de l'audit est traité (cf. DONE 20-22/07). Ce qui suit est du VOLUME
> éditorial, pas du bug — ce n'est pas mécanisable. Détail : `docs/seo&audit/`.

- [ ] **Reste du lot « titles/descriptions courts »** — le gros est traité
      le 03/08 (cf. DONE). (1) Les descriptions des 18 pages d'outils : FAIT
      (lot B14, clé `tools.<slug>.meta_description`, cf. DONE 03/10). Reste :
      (2) re-passer Sitebulb pour re-compter ce qui est encore court.

## 🔎 Audit transverse du 07/09 (constats G1–G52)

> Source : [audit/transverse.md](./audit/transverse.md) — le rapport porte les
> lignes exactes, les vérifications et les correctifs détaillés ; ici, le « à
> faire » en clair, par lot. Le calculateur de dégâts (D1–D5) et la découpe des
> gros composants ne sont PAS ici : ils ont déjà leur item ou leur backlog.
> **S1** (limitation de débit) est TRAITÉ le 03/10 côté code, cf. DONE ; reste à
> recréer le conteneur Caddy sur le VPS.

### Lot 2 — métier, données, outillage

- [ ] Pull simulator : pool HORS-FOCUS lu dans les tables du jeu (G9, reste)
      — lot B13. Trouvé le 03/10 : le chemin de `customPool`
      (`RecruitGroupTemplet` → `RecruitGradeRecipeTemplet` →
      `RecruitRecipeTemplet`) donne le pool de chaque type de bannière ; le
      générateur ne l'émet pas encore et le simulateur trie par tags.
- [ ] Chips à lien au toucher (G4) : le « second tap = navigation » est en
      prod depuis le 09/09, jamais essayé sur un vrai téléphone. Sur
      `outerpedia.com/guides/guild-raid/frost-legion`, toucher un nom de
      perso : la bulle s'ouvre ; le toucher encore : la fiche s'ouvre.
- [ ] **Tours very hard : 12 formations ALTERNATIVES émises comme une vague de
      35 monstres** (G10) : `encounters.ts:975-1015` aplatit ce que `towers.ts`
      sait être un pool tiré au hasard (vérifié sur 40103001). C'est exactement
      la confusion que la note « Tours : waves ≠ encounters » ci-dessous
      interdit. Reprendre la règle de `towers.ts` dans la passe donjon — lot F5.
- [ ] **Deux générateurs dérivent le scaling des dégâts avec des règles
      différentes** (G11) : `damage-scaling.ts:64-92` vs `solver.ts:719-777` —
      Leo, Sterope, Tamara, Kuro divergent. Une seule fonction dans
      `datagen/lib/` — lot F6.
- [ ] **`pnpm dev` (dry) écrit `data/generated/damage/` avec `skill-descs`
      bâti sur l'ANCIEN `skills.json`** (G12) : artefacts de deux versions
      estampillés du nouveau `resVersion`. Ne jouer `damage` que si `apply`, ou
      lire depuis `data/extracted` en dry — lot F7.
- [ ] **`pnpm commit` fait `git add -A`** (G17), ce que CONVENTIONS.md interdit
      (`commit.ts:288`, après un `pnpm format` sur tout le repo) ;
      `datagen/README.md:400` recommande `git add <dossier>`. Stager les chemins
      que le flux a produits + `git add -u` derrière confirmation. Trancher
      aussi : `revert` accepté par `commit.ts` mais absent de CONVENTIONS.

### Au fil de l'eau (G26–G52 et dette — en passant sur les fichiers)

- [ ] **Dette** (rapport § Dette) — les lots du 25/09 et du 03/10 ont soldé
      tout ce qui était découpé (cf. DONE). Reste : (1) la cinquième modale,
      celle de `damage-calculator/ui.tsx` : FAIT (lot A23, cf. DONE) ;
      (2) `stripBrackets`/`stripDecoBrackets` et
      `advOf` recopiés dans `encounters.ts` (lot A25) ; (3) « persos
      intégrés » lu à quatre endroits avec quatre comportements d'erreur :
      dette froide, à arbitrer avant d'unifier.

### Audit des portraits animés (03/10, P1–P10 — les quatre Moyenne)

Rapport : [`docs/audit/portrait-fx.md`](./audit/portrait-fx.md). Aucun Haute.
Les Basse (P5–P10) et la dette se traitent en passant sur les fichiers.

- [ ] **Éviction et remontage dans la même image (P1)** : une carte vivante
      hors écran, évincée par le callback d'une voisine puis remontée par le
      sien dans la même tâche, appelle `restoreContext()` avant que
      `webglcontextlost` soit distribué — refus muet, carte statique jusqu'au
      prochain cycle. Reproduit sur `/dev/AnimatedPortrait` (Firefox le
      tolère) ; **à confirmer sur Chrome**. Correctif : UN
      `IntersectionObserver` partagé (drapeaux d'abord, montages, une éviction
      — règle aussi le plafond dépassé de P5), et un `restoreContext` rejoué
      après l'événement dans `onLost`.
- [ ] **18 Mo de textures GPU par carte `_Demi` (P2)** : chaque contexte
      monte sa copie ; `T_FX_Crystal_001_A` (2048², 887 Ko à télécharger) en
      fait 16 à elle seule, pour l'effet de 16 persos. **Décision Sevih** :
      plafonner la taille à l'extraction (fidélité à comparer sur la page de
      contrôle) ; le correctif de fond — un contexte partagé pour toutes les
      cartes — est un chantier, il emporterait P1, P5 et P6.
- [ ] **Graines des particules (P3)** : `autoRandomSeed` est FAUX sur huit
      émetteurs ; `star` et `star (1)` de `_2000093`, `_2000110`, `_2000114`
      partagent la graine 0, donc étoile et halo naissent ensemble en jeu, pas
      ici. Publier `autoRandomSeed`/`randomSeed`, partager la graine au
      montage, corriger les deux commentaires qui disent l'inverse. À
      confirmer sur une capture du jeu.
- [ ] **Tests du moteur et contrat de la table (P4)** : rien ne teste
      `portrait-fx-sim` (pur) ni ne confronte `portrait-fx.json` — régénéré
      par `refresh` — à ce que le moteur accepte ; un effet ajouté par le jeu
      reste hors de `DEFAULT_EFFECTS` sans un mot. Test de contrat + tests du
      simulateur + avertissement dans le script ; suppose de sortir de
      `mountPortraitFx` la décision « rendable ou refusé » en fonction pure.

### Audit du code des guides (09/09, H5–H14 — ce qui reste)

- [ ] **Couleurs Tailwind brutes des guides (H6) : FAIT** pour le corps des
      guides (lots B5 puis B12, 25 tokens `ed-*` créés). Reste, laissé exprès
      et à trancher : les 18 classes du champ `accent` des cartes personnage
      (`roadmap-2026/data.ts`, `roadmap-2026-h2/data.ts`) — accents d'ÉLÉMENT
      en -700/-900/-300 sans token d'élément de même valeur, plus l'accent
      `sky` de Titia (sans élément) ; et les SVG `MonadGateMap`
      (`#facc15`/`#fde047`) et `TowerCombatRoster` (`rgb(239 68 68)`), aux
      valeurs de Tailwind v3, qu'aucun token n'égale.

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
