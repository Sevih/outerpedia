# DONE — journal du suivi interne

> Pendant « fait » de [TODO.md](./TODO.md) (décision Sevih 2026-07-17 : le TODO
> ne garde que le « à faire »). Un item traité migre ici avec sa date ; le
> détail vit dans git. Ne pas confondre avec le `CHANGELOG.md` racine (public).

## 2026-07-17

- **Détection émulateur d'`init.ps1` fiabilisée** : sous PS 5.1, `2>$null` sur
  adb + EAP global `Stop` transformait le stderr bénin (« daemon not running;
  starting now ») en exception → émulateur déclaré absent à tort au premier
  lancement, pipeline data sauté. EAP local `Continue` (portée fonction) ;
  bug et remède reproduits sur PS 5.1 réel.
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
