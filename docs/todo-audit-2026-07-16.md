# TODO — Audit complet du 2026-07-16 (round 2)

> Audit au commit `d57ad3a` (main, arbre propre, **278/278 tests verts**, v0.1.21).
> 4 passes : code `src/`, couche data, documentation, transverse — chacune briefée
> avec [todo-audit-2026-07-13.md](todo-audit-2026-07-13.md) pour ne remonter que le NOUVEAU.
> Périmètre nouveau depuis le round 1 : ~35 commits (patch du 14/07, portage guides
> Skyward Tower + guild-raid + Monad Gate + adventure-license, refonte tours VH,
> restrictions d'étages, admin gamedata reader PR #18, perf CI, pnpm 11).

---

## P1 — Bugs et risques réels (nouveaux)

- [ ] **HAUTE — `datagen/assets/manifest.ts:832-839` : les monstres des tours VERY HARD ne sont jamais collectés.** Le collecteur (b9d951c) ne lit que `floor.waves`, or les 20 étages VH ne stockent leurs monstres que dans `floor.encounters` (régime alternatif — 0 waves / 20 encounters, vérifié sur la donnée). Conséquence : 57 monstres VH ignorés → **10 portraits `MT_` + ~237 icônes de skills jamais produits**, dont `MT_4151015` — précisément le 404 que le message du commit prétendait corriger. Fix : itérer `[...(floor.waves ?? []), ...(floor.encounters ?? [])]` (et compléter le type local qui ignore `encounters`).
- [ ] **HAUTE — la CI et les hooks ne lancent JAMAIS `pnpm test`.** `ci.yml` job check = install→lint→typecheck→build ; lefthook = format/lint (pre-commit) + typecheck (pre-push). Les 278 tests ne gardent ni les merges ni les déploiements — exécution manuelle uniquement. → ajouter `pnpm test` au job check (2,8 s, ce n'est pas un coût).
- [ ] **MOYENNE — `src/components/guides/monad/MonadRouteClient.tsx:32-45` : régression de pattern.** Le sélecteur de variante lit `?v=` une fois dans un `useEffect` + `useState` → l'état masque l'URL (Back/Forward mort après le premier clic) ET réintroduit le seul `eslint-disable react-hooks/set-state-in-effect` du repo (l.43), contre la politique d'`eslint.config.mjs:14`. Le hook maison `useUrlSlice`/`Tabs(urlParam)` existe exactement pour ça. (Composant documenté « port du composant V2 » — porté avec son défaut.)
- [ ] **MOYENNE — `datagen/lib/effects.ts:312/:539` : trou dans l'empreinte du glossaire.** Le fix « vote croisé » (c9ce852) a ajouté une lecture de `data/curated/effects.json` dans `buildEffectGlossary`, mais le stamp reste `tablesStamp(['TextSystem'])` — éditer une création curée dans l'admin ne réinvalide pas le glossaire (byKey périmé jusqu'au redémarrage). Même trou pré-existant pour `effect-families.json` (l.170). → saler le stamp avec `fileStamp()` des deux curés.
- [ ] BASSE — `datagen/generators/monad.ts:699-729` : `resolveReward` renvoie `null` en silence (référence `rewardId` pendante sur les nœuds) — instrumenter comme le resolveReward d'encounters (ligne agrégée).
- [ ] BASSE — `monad.ts:743-746` : libellé de stage résolu sans filtre `hasText` (dict vide possible), contrairement au `resolveOrNull` du reste du fichier.
- [ ] BASSE — `src/lib/data/monad.ts:12` importe `theme-1.json` en dur alors que `build.ts:186` écrit `theme-${themeId}.json` dynamique — un futur thème ≠ 1 casserait l'import silencieusement.
- [ ] BASSE — `datagen/generators/content-schedule.ts:124-128` : `isoUtc` laisse passer une date malformée sans warning (fallback silencieux).

## P2 — Tests manquants (zones neuves)

- [ ] Restrictions de tours (099fff4, +109 l. generators/towers.ts, +7579 l. de data) : **zéro test**.
- [ ] `src/lib/data/geas.ts` (81 l., déblocages guild-raid) et `url-hash.ts` : zéro test.
- [ ] Fix vote croisé (c9ce852) : aucun test de non-régression ajouté à `effects.test.ts`.
- [ ] `src/lib/admin/gamedata-store.ts` (259 l.) : pas de test (dev-only, priorité moindre).

## P3 — Dette du nouveau code (duplications / incohérences)

- [ ] **Dérive couleurs vives dans les guides** : la règle eslint RAW_COLOR ne bannit que les gris+white/black en `.tsx` → les nouvelles vues passent à travers : `monad/MonadGateMap.tsx` (yellow/green/red/emerald), `MonadRouteClient/Reward`, `TurnOrder.tsx:61`, `TowerCombatRoster.tsx:141` (rouge en dur alors qu'un token danger existe), `BossPanel.tsx:233`, `guides/page.tsx:76`, cartes SkywardTowerView/MonadGateGallery (`hover:ring-yellow-400/50`). ET les palettes extraites en `.ts` échappent totalement au garde-fou (`guide-accents.ts`, `nodeStyles.ts:49` contient même `text-white`, `ELEMENT_RING` d'images.ts). → décision : tokeniser, ou étendre officiellement l'exemption « port pixel-perfect V2 » aux vues concernées + étendre la règle aux `.ts`.
- [ ] **Resserrer l'exemption couleurs existante** : `parse-text`/`inline/**`/`ShareButtons` n'ont plus AUCUNE couleur brute (nettoyés le 14/07) — l'exemption d'`eslint.config.mjs:34-42` n'est plus nécessaire que pour `characters/**`. (Était déjà dans le reliquat du 13/07 ; confirmé mort.)
- [ ] Quasi-clones : `RecommendedCharacters.tsx:48-88` (serveur) vs bloc roster de `TowerCombatRoster.tsx:168-253` (client) — même grille/portraits/raison, seule la logique de restriction diffère → partager le rendu « groupe de persos + raison ».
- [ ] `TowerGuide.tsx:134-154` (`buildRoster`) et `TeamSlots.tsx:65-70` réimplémentent « nom éditorial → perso » à la main alors que `resolveGuideCharacter` (lib/data/characters.ts:108) existe et est utilisé par 3 autres composants.
- [ ] Carte-art de landing dupliquée : `SkywardTowerView.tsx:90-145` vs `MonadGateGallery.tsx:34-100` (même gabarit h-40/voiles/ring).
- [ ] Deux systèmes d'onglets pour le même besoin : `ui/Tabs` (?param, useUrlSlice) vs `guides/SegmentedTabs` (#hash, url-hash) — SR sélectionne ses équipes avec l'un, le guild raid avec l'autre.
- [ ] 4 lectures ad-hoc de `data/curated/effects.json` (lib/effects.ts:539 NOUVEAU, equipment.ts:520, manifest.ts:267, v2-control.ts:417) — pas de loader partagé dans datagen/curated/effects.ts.
- [ ] Texte en dur non localisé (public) : `MonadGateMap.tsx:693` (`"or"`), `MonadGateGuide.tsx:82` (`'Gold'` alors que `SYS_ASSET_GOLD` localisé existe via le catalogue).
- [ ] Hex/rgb en dur : `GeasUnlockList.tsx:57,186,212` (dont `#4cc2ff` = doublon de `.bg-buff-tint` de globals.css), `TowerCombatRoster.tsx:215,224`, `MonadGateMap.tsx:352,376` (certains justifiés par commentaire — à trier).
- [ ] Code mort : `getTowerCombat` (towers.ts:121), `getMonadRoute` (monad.ts:25), `monadRouteVariants` + `monadRouteRefs` (monad.ts:50-60, mort transitif), `Object.assign(meta, {})` no-op (stamp-guides.ts:149).
- [ ] Docstrings périmées : `datagen/generators/monad.ts:2` et `src/lib/data/monad.ts:6-8` décrivent le modèle « un fichier par route » abandonné (réel : `routes.json` unique ~1,5 Mo).

## P4 — Config / infra (nouveaux)

- [ ] `scripts/*.ts` (commit, dev-refresh, get-news, stamp-guides) ne sont couverts par AUCUN typecheck (tsconfig = src, datagen/tsconfig = datagen ; tsx = transpile-only) → les inclure quelque part.
- [ ] `.dockerignore` : ajouter `data/extracted/` (sortie locale, gonfle le contexte si présente).
- [ ] `.git` : 4647 objets loose / 0 packé (47 Mo) → un `git gc` compacterait.
- [ ] Hygiène commits : `681fc65 « import MG »`, `ea133ea « guild raid & tower »`, `dbbe3ac « push apres reffacto + clean »` (en réalité un simple bump 0.1.17→0.1.18) — messages non conventionnels qui aggravent le trou du CHANGELOG.

## P5 — Documentation (à resynchroniser)

- [ ] **`docs/todo-data-v2.md` — le plus décroché** : skyward-tower (8 guides + vue + kits + restrictions), monad-gate (31 guides + générateur monad.ts + data/generated/monad/) et adventure (20 guides + vue AdventureSeasons, portés SANS area_name) sont FAITS mais marqués « 0 guide porté » → cocher les trois, corriger « area_name bloque adventure » (contourné) et « monad couvert par singularity.json » (faux : générateur dédié).
- [ ] **CHANGELOG.md** : ~34 commits post-14/07 absents (guides, CI perf, pnpm 11, dependabot, editorial) ; « ~130 commits » → 174 ; « 18 générateurs » → 19 (characters/monsters n'en sont plus, costumes/monad manquent) ; vues manquantes (AdventureSeasons, AdventureLicense, SkywardTowerView, MonadGateView).
- [ ] **`data/editorial/` non documenté nulle part** (rôle : assets produits par le wiki, consultés avant le pool V2, versionnés) → CONVENTIONS.md section Données + tableau des zones de datagen/README.
- [ ] « 18 générateurs » → 19 aussi dans ROADMAP.md:48 et datagen/README.md:278 (+ mentionner monad.ts et les restrictions de tours).
- [x] `docs/todo-audit-2026-07-13.md` : « 4 branches locales » → il n'en reste qu'UNE (`backup/site-rebuild`) — corrigé dans ce commit.

---

## Vérifié SAIN / résolu depuis le 13-14/07 (ne pas re-traiter)

- Le grand ménage a tenu : 0 garde fragile réintroduit (14 `isMain`), `spawnUnits` partagé partout (bug ID0 de sources soldé), `CLASS_ENUM` dérivé, `MODE_TITLE_KEY` branché sur `modeTitleKey()`, stamp-guides renames corrigé, warnings agrégés, newPatch.md corrigé, effect-families seedé, adm.html absent, promote/integrate/convert testés.
- PR #18 (gamedata reader) : conforme aux patterns — routes `.dev.ts` gardées `IS_DEV` (la convention réelle des 19 routes API ; `assertDevOnly` = pages), anti path-traversal, caches sur `tablesStamp`. (Nit : `linkTargets` recalculé par requête, dev-only.)
- CI workflows relus : skips/permissions/secrets cohérents, pas de double build, RAS.
- 3 des 4 branches locales élaguées (reste `backup/site-rebuild`) ; `data/extracted` bien gitignoré ; 0 TODO nouveau dans le code (le seul = ré-épinglage guides de version-monster, toujours actionnable) ; 0 @ts-ignore ; i18n des nouvelles clés alignée sur les 5 locales (81 clés).
- Reliquat du round 1 toujours ouvert (voir l'autre fichier) : PRIO comparaisons V2, tests générateurs, progression.ts enums, bosses.ts icône, LOCK_SCREEN_OVERRIDES, CHASE_TITLE_KEY (décision), _doc curés, TODO(guides) version-monster.
