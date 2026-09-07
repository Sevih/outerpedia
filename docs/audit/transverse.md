# Audit transverse — tout le projet (constats G1–G52)

> Fait le **2026-09-07**. Sixième volet, et le premier à balayer **tout** le
> repo en une passe : générateurs `datagen/generators/` (jamais audités),
> scripts et configuration, couche `src/lib/` + routes API + routing,
> composants et pages, outils `tools/_contents/`, guides `guides/_contents/`
> (par script sur les 567 JSON). Consigne de Sevih : « on cherche tout :
> mauvaise pratique, bug, incohérence », le damage calculator étant un chantier
> ouvert connu (non re-signalé).
>
> **Aucun recouvrement** : rien ici ne répète E1–E8, F1–F9, X1–X6, D1–D5,
> S1–S9. Les constats des cinq volets précédents ont été re-vérifiés au passage
> — tous ceux marqués « fait » dans DONE le sont réellement ; **S1 reste
> ouvert** (cf. § Déjà connus).
>
> **Méthode** : quatre passes de lecture (une par périmètre, jamais plus de deux
> en parallèle, sur consigne quota), chaque constat Haute/Moyenne **re-vérifié
> de première main** avant d'entrer ici (lecture du code, `node -e` sur les
> données committées, comptages). Ce qui n'a pas pu être exécuté (`pnpm dev`
> interdit, pas d'appareil tactile) est marqué « à confirmer ».

> **Suite, le soir même** : 24 constats traités en cinq commits (G1, G2, G3,
> G6, G7, G8, G9, G15, G16, G20, G21, G26, G29, G31, G32, G34, G35, G36, G40,
> G41, G42, G43, G44, G46–G50, G52, plus la moitié de G22 et la dette CSS) —
> détail dans [DONE.md](../DONE.md) § 2026-09-07. Ce qui reste est au
> [TODO](../TODO.md) § « Audit transverse du 07/09 » ; ce rapport n'est pas
> mis à jour constat par constat, il reste l'état du matin.

## État de référence

| Contrôle                                                             | Résultat                                           |
| -------------------------------------------------------------------- | -------------------------------------------------- |
| `tsc --noEmit` (src, datagen, scripts)                               | vert ×3                                            |
| `eslint`                                                             | 0                                                  |
| `vitest run`                                                         | 1 895 tests / 156 fichiers, verts                  |
| `prettier --check .`                                                 | vert                                               |
| `any` / `@ts-ignore` / `console.log` dans `src/`                     | 0 / 0 / 0                                          |
| Curés ↔ généré (characters, short-names, banner, gear-reco, release) | 0 id orphelin                                      |
| Balises `{P/…}` des guides                                           | 2 203, toutes résolues                             |
| Locales                                                              | 1 169 clés × 5, 0 divergence de placeholder/balise |

## Verdict

**Le projet est sain sur ses fondations** — typage strict tenu, données
cohérentes, effets React nettoyés, hydratation maîtrisée, SQL paramétré,
gardes admin complètes (28/28). Les cinq audits précédents ont fait leur
travail : les classes de bugs qu'ils visaient ne réapparaissent pas.

Ce que cette passe trouve est d'une autre nature — des bugs **invisibles
depuis un poste de dev EN/desktop** : un serveur qui ne se voit qu'en prod
(sous-domaines), en JP/ZH (ponctuation pleine largeur), au doigt (tactile), ou
au bout de 24 h d'ISR (statuts figés). Huit constats Haute, tous de cette
famille, tous à correctif court.

Deuxième famille, plus diffuse : **la doc a décroché du code** à plusieurs
endroits (revalidate, refresh, README datagen, commentaires « assumées 404 »),
et la règle « régler à la source » a de nouveaux contre-exemples (7 lecteurs de
JSON curé, 40 imports directs de `@data/*`, 4 presse-papiers, 4 modales).

---

## Haute

### G1 — Les gardes `value in OBJ` acceptent `constructor`, `toString`, `__proto__` · bug

[`src/lib/i18n/config.ts:66`](../../src/lib/i18n/config.ts) (`isValidLang`),
[`src/lib/data/guide-categories.ts:127,472`](../../src/lib/data/guide-categories.ts),
[`src/lib/data/towers.ts:23`](../../src/lib/data/towers.ts),
[`src/lib/data/tools.ts:61`](../../src/lib/data/tools.ts) (`INDEX[slug]`),
[`src/app/[lang]/[slug]/page.tsx:47`](../../src/app/[lang]/[slug]/page.tsx),
[`src/lib/contribute/contribution.ts:82`](../../src/lib/contribute/contribution.ts),
[`src/lib/admin/general-guide-store.ts:47`](../../src/lib/admin/general-guide-store.ts).

`'constructor' in {…}` est vrai (chaîne de prototype). Sur l'apex,
`/constructor` passe le proxy comme « préfixe de langue valide », `normalizeLang`
rend `'constructor'`, `import('./locales/constructor.ts')` rejette → le layout
racine jette → `global-error` (500, non cacheable, une stack par sonde).
`/api/search?lang=toString` → 500. `/jp/constructor` : `[slug]` récupère
`Object` comme loader → « Element type is invalid ». `/guides/constructor` rend
une page 200 vide. Le commentaire `[lang]/layout.tsx:65-67` (« un lang inconnu
n'arrive jamais ici ») est faux pour ces noms.

Vérifié : sémantique de `in` par `node -e`, chaîne déduite par lecture.
Correctif : `Object.hasOwn(...)` dans les 7 gardes (ou une `Map`) ; en
ceinture, `export const dynamicParams = false` sur `[lang]/layout.tsx`.

### G2 — Les puces de langue du footer ne changent pas de langue en prod · routing

[`src/components/layout/Footer.tsx:160`](../../src/components/layout/Footer.tsx)
pointe `/` ou `/${l}` (path) ; la prod route par **sous-domaine**. Sur
`jp.outerpedia.com`, cliquer « FR » donne `/fr` → `proxy.ts:71-80` (« le
sous-domaine fait foi ») redirige en 308 vers `jp.outerpedia.com/` : on reste en
japonais. Sur l'apex, `/fr` est servi path-based → page française sous
`outerpedia.com/fr`, doublon dont le canonical pointe ailleurs.
`LanguageSwitcher.tsx:83-97` fait le bon geste (`buildUrl` + `LANG_ROUTING`).

Vérifié : lecture `proxy.ts`, `site.ts`, `Caddyfile` (aucun `redir` de chemin).
Correctif : `href={buildUrl(l, '/')}` — réutiliser le switcher.

### G3 — Chaîne / Duo jamais séparés en JP et ZH · i18n données

[`src/lib/skills.ts:47`](../../src/lib/skills.ts) (`splitChainDual`) exige un
deux-points ASCII (`\s*:\s*`) ; JP et ZH écrivent `：` (U+FF1A). `chainDesc` =
tout le texte, `dualDesc = ''` : dans `ChainDualSection.tsx:95` le bloc
« Dual Attack » et ses chips disparaissent, la moitié chaîne affiche les deux
effets, `{SK/…|Dual}` rend un tooltip vide.

Vérifié par `node -e` sur `skills.json` : découpes réussies **EN 129, KR 129,
JP 8, ZH 6**. Aucun test sur `splitChainDual`.
Correctif : `\s*[:：]\s*` + un test jp/zh.

### G4 — Les chips à lien + tooltip ne naviguent pas au doigt · tactile · à confirmer sur appareil

[`src/components/inline/InlineTooltip.tsx:40-45,70`](../../src/components/inline/InlineTooltip.tsx)
pose `onTouchEnd={handleTap}` qui fait `preventDefault()` dès que
`'ontouchstart' in window` : le `click` synthétisé est annulé, le `<Link>`
enfant ne le reçoit jamais. Tout `{P/perso}`, `{SK/…}`, `{EE/…}`, `{AS/…}`,
`{I-W/…}` devient un simple toggle de bulle sur mobile, sans chemin vers la
fiche (la bulle ne contient pas de lien).

Vérifié par lecture (ordre des événements) ; pas exécuté sur device.
Correctif : ne pas `preventDefault` quand le déclencheur contient un `<a>`, ou
mettre le lien dans la bulle en mode tactile.

### G5 — Statut d'événement figé 24 h dans le cache ISR · logique métier

[`src/app/[lang]/tools/_contents/event/index.tsx:22-39`](../../src/app/[lang]/tools/_contents/event/index.tsx),
[`src/lib/data/events.ts:198`](../../src/lib/data/events.ts) (`summarize`
prend `Date.now()`), [`src/app/[lang]/event/page.tsx:19`](../../src/app/[lang]/event/page.tsx)
(`revalidate = 86400`). `status` (upcoming/ongoing/ended), `phase` et `teased`
sont calculés au rendu serveur puis servis 24 h : un événement qui commence ou
finit dans la journée reste au mauvais statut jusqu'à la purge — et
`/api/revalidate` ne purge pas cette route (G8). Contredit le patron déjà
adopté ailleurs (`SeasonBadge` calcule côté client ; `progress-tracker`
envoie des BORNES).

Correctif : envoyer `start`/`end`/`phases` au client et dériver le statut avec
l'horloge locale (`useNow`), comme `seasonWindows`.

### G6 — Un PNG éditorial déposé pour CORRIGER une icône est supprimé sans conversion · perte de donnée

[`datagen/assets/collect.ts:44-52`](../../datagen/assets/collect.ts) :
`normalizeEditorialPool` convertit en webp **si le webp n'existe pas**, puis fait
`rmSync(abs)` inconditionnellement. Cas typique, invité par l'en-tête du
fichier : corriger `ui/effect/foo.webp` en posant `foo.png` à côté → le PNG
(jamais committé, irrécupérable) est effacé, l'ancien webp reste, `pnpm images`
annonce `0 raster(s)` sans rien signaler.

Vérifié par lecture. Correctif : convertir si le PNG est plus récent que le
webp (ou toujours écraser), et ne supprimer QUE ce qui a été converti.

### G7 — HTML des patch-notes injecté sans assainissement · sécurité (dépendance tierce)

[`src/app/[lang]/tools/_contents/patch-history/PatchHistoryBrowser.tsx:289`](../../src/app/[lang]/tools/_contents/patch-history/PatchHistoryBrowser.tsx)
rend `post.content` en `dangerouslySetInnerHTML` ; `scripts/get-news.ts`
(`processContent`) réécrit les images et nettoie les classes, mais ne retire
**ni `<script>`, ni les attributs `on*`, ni les iframes hors allowlist**. État
du committé (`data/patch-notes/posts.json`, 1 007 posts) : 23 `<script>`
(widgets X/Twitter, ld+json — inertes via innerHTML mais dans le DOM), 63
iframes dont **30 vers `annoucements.outerplane.vagames.co.kr`**, hôte absent
de `frame-src` → cadre vide silencieux ; 0 attribut `on*` aujourd'hui, mais la
CSP a `'unsafe-inline'` : un `<img onerror>` publié par le WordPress officiel
(ou un compromis de celui-ci) s'exécuterait chez nos visiteurs.

Vérifié par `node -e` sur le JSON. Correctif : dans `processContent`, retirer
`script`, `on*`, `javascript:`, et n'accepter que les iframes de l'allowlist
CSP (ou ajouter l'hôte vagames à `frame-src` s'il est voulu).

### G8 — `/api/revalidate` ne purge pas ce que trois commentaires lui attribuent · incohérence fonctionnelle

[`src/app/api/revalidate/route.ts:25-31`](../../src/app/api/revalidate/route.ts)
ne purge que `/[lang]/guides/[category]` et `…/[slug]`. Or
[`src/lib/data/changelog.ts:65`](../../src/lib/data/changelog.ts),
[`src/app/feed/changelog/route.ts:14-15`](../../src/app/feed/changelog/route.ts)
et [`src/lib/data/events.ts:274`](../../src/lib/data/events.ts) affirment
« la purge de 00:05 UTC régénère ». Conséquence : entrée de changelog
programmée jusqu'à 24 h en retard sur `/changelog` et le flux ; bandeau
d'événement du layout périmé hors guides/accueil ; titre « September 2026 »
des tier lists (`seo.ts:98`) faux jusqu'à 24 h après le changement de mois.
`time.ts:7-11` promet que tout rendu dépendant de l'instant passe par
`serverNow()` — `seo.ts:98`, `home.ts:73`, `changelog.ts:66` appellent
`new Date()`.

Vérifié : `grep revalidatePath` (un seul site), `sevih-tool/stack/cron/revalidate.sh`.
Correctif : ajouter `/[lang]/changelog`, `/feed/changelog`, `/[lang]/tierlist`,
`/[lang]/event` à `TIME_SENSITIVE_ROUTES` (ou `revalidatePath('/[lang]', 'layout')`
la nuit), `serverNow()` partout, puis réaligner les trois commentaires.

---

## Moyenne

### G9 — Le pool « custom » du simulateur ignore `recruit.json.customPool` · logique métier

[`pull-simulator/PullSimulatorBrowser.tsx:76-81`](../../src/app/[lang]/tools/_contents/pull-simulator/PullSimulatorBrowser.tsx)
(`custom = normal+premium+limited`), [`pull-simulator/index.tsx:54-59`](../../src/app/[lang]/tools/_contents/pull-simulator/index.tsx)
(catégorie par tags). Le jeu limite le Custom Recruit à `customPool` ; la
donnée l'expose (`isInCustomRecruitPool`, `recruit.ts:15`), un seul guide
l'appelle, pas le simulateur. Vérifié par `node` : **35 des 91 3★ non-fusion**
ne sont pas dans `customPool` (Maxwell, Leo, Stella, Astei, Drakhan, Vlada,
Eva, Regina…) et sortent quand même en bannière custom.
Correctif : `category = isInCustomRecruitPool(id) ? … : …` dans le wrapper.

### G10 — Tours very hard : 12 formations ALTERNATIVES émises comme une seule vague · modélisation

[`datagen/generators/encounters.ts:975-1015`](../../datagen/generators/encounters.ts)
vs [`datagen/generators/towers.ts:212-223`](../../datagen/generators/towers.ts).
`towers.ts` sait qu'un groupe de spawn multi-lignes = pool tiré au hasard ;
`encounters.ts` aplatit toutes les lignes en une vague et incrémente `count`.
Vérifié sur `40103001` (Skyward VH 1F) : `towers.json` = 12 formations de 2-4
monstres ; `encounters.json` = **une vague de 35 monstres**. Consommé par le
picker de cible du calculateur et `src/lib/data/encounters.ts:129-132,355-358`.
Correctif : reprendre la règle de `towers.ts` dans la passe donjon
d'encounters.

### G11 — Deux générateurs dérivent « quelles stats pilotent les dégâts » avec des règles différentes · duplication divergente

[`datagen/generators/damage-scaling.ts:64-92`](../../datagen/generators/damage-scaling.ts)
vs [`datagen/generators/solver.ts:719-777`](../../datagen/generators/solver.ts).
Même fait (`BT_SWAP_STAT_ATTACK`, `BT_DMG_OWNER_STAT`), deux implémentations
(Skill_1..23 avec expansion `BT_GROUP` sans filtre de cible, contre S1/S2/S3/8/22/23
avec `TargetType === 'ME'`). Diff mesuré : Leo (def), Sterope (hp), Tamara
(spd), Kuro (`get_gold_rate`) — le calculateur demande DEF/HP/SPD à trois
persos dont le kit principal ne s'en sert pas.
Correctif : une seule fonction dans `datagen/lib/`, consommée par les deux.

### G12 — `pnpm dev` (dry) écrit `data/generated/damage/` avec `skill-descs` bâti sur l'ANCIEN `skills.json` · incohérence de version

[`datagen/refresh.ts:293-311`](../../datagen/refresh.ts),
[`datagen/damage/skill-descs.ts:7-11`](../../datagen/damage/skill-descs.ts).
L'étape `damage` tourne après `promote` même en dry-run (décision documentée
dans le commentaire) — mais `buildSkillDescs` lit `data/generated/skills.json`,
non promu en dry, pendant que `characters.json` sort des tables fraîches : un
même run produit des artefacts damage de **deux versions**, estampillés du
nouveau `resVersion`. Le test compare au `skills.json` committé, donc reste vert.
Correctif : ne jouer `damage` que si `apply`, ou lire `skill-descs` depuis
`data/extracted` quand promote est dry.

### G13 — Lecture des JSON curés : 7 implémentations, repli `{}` silencieux · règle « régler à la source »

[`src/lib/data/curated.ts:16-22`](../../src/lib/data/curated.ts) (relecture
brute à chaque appel, 243 Ko), `effects.ts:94-112`, `equipment.ts:116-135`,
`gear-reco.ts:55-61`, `search-aliases.ts:18-24`, `short-names.ts:44-50`,
`tags.ts:75-84`, `guides.ts:471,488`. `disk.ts` offre déjà le cache mtime
attendu et n'est utilisé par aucun. Tous (sauf guides) avalent un JSON cassé en
`{}` : un curé corrompu ferait disparaître pros/cons, recos, alias sans un log
— l'inverse de la doctrine `readCuratedJson` lève. Même famille côté datagen :
[`datagen/assets/manifest.ts:83-90,104-113,674-736`](../../datagen/assets/manifest.ts),
[`datagen/lib/effects.ts:653-664`](../../datagen/lib/effects.ts),
[`datagen/generators/character-release.ts:414-421`](../../datagen/generators/character-release.ts).
Correctif : router par `loadDataJson` (src) / `readCuratedJson` (datagen) —
absence tolérée, JSON invalide jamais.

### G14 — JSON de jeu importés hors data layer : 40+ sites · convention CONVENTIONS.md

`skills.json` : `characters/[slug]/page.tsx`, `hero-tracker/index.tsx`,
`team-planner/index.tsx`, `parse-text.tsx:47` ; `equipment/ee.json` : les
mêmes + `tier-list-maker`, `damage-calculator` ; `glossaries.json` :
`characters/page.tsx`, `characters/[slug]`, `damage-calculator`,
`game-tokens.ts` (statique) alors que `monsters.ts`/`skill-view.ts` le lisent
au disque — deux modes de chargement du même fichier ; plus `transcendence.ts`,
`home.ts` (×3), `VideoJsonLd.tsx`, `banner/items.ts`, `ranking-helper-data.ts`,
6 guides `general-guides/*`, `ost`, `wallpapers`, `4-comics`, `patch-history`,
`contributors/page.tsx`. Chaque site refait son `as unknown as Record<…>`.
Correctif : un accesseur par fichier dans `src/lib/data` + règle eslint
`no-restricted-imports` sur `@data/*` hors `src/lib/data/**`.

### G15 — La sous-route `[floor]` rend n'importe quel guide avec n'importe quel entier · soft-200

[`src/app/[lang]/guides/[category]/[slug]/[floor]/page.tsx:67-70`](../../src/app/[lang]/guides/[category]/[slug]/[floor]/page.tsx)
ne vérifie que `Number.isInteger(n) && n >= 1` ; seul `TowerGuide` fait
`notFound()`. `/guides/general-guides/beginner-faq/42` → 200, titre
« … — Floor 42 », une entrée ISR par URL visitée × 5 langues. `Number()`
accepte aussi `1e3`, `0x10`, `5.0` → doublons de cache du même étage.
Correctif : `if (!guide?.tower || !/^\d+$/.test(floor)) notFound()` dans la
page ET `generateMetadata`.

### G16 — Écritures non atomiques restantes sur des fichiers COMMITTÉS · risque ops

F1 a rendu `writeJson` atomique ; ces écrivains font `writeFileSync` direct :
[`datagen/promote.ts:331-334`](../../datagen/promote.ts) (tout `data/generated/*`
à l'apply), `scripts/get-news.ts:294`, `scripts/stamp-guides.ts:172`,
`scripts/assets-push.mjs:281`, `datagen/assets/sync-comics-seed.ts:79`,
`datagen/video-meta.ts:134`. Un Ctrl-C pendant `promote --apply` laisse un
`monsters.json` tronqué que les loaders refusent ensuite.
Correctif : `writeTextAtomic` dans `lib/json.ts`, utilisée par les six.

### G17 — `scripts/commit.ts` fait `git add -A`, ce que CONVENTIONS.md interdit · incohérence outillage

[`scripts/commit.ts:288`](../../scripts/commit.ts) après un `pnpm format` sur
tout le repo (l. 178, qui touche aussi les fichiers non suivis) ;
`datagen/README.md:400` recommande `git add data/generated data/curated`.
`CONVENTIONS.md:35-38` : « jamais `git add -A` ni `git add <dossier>` ».
`commit-assets.ts` et `get-news.ts` respectent la règle, l'outil principal non.
Correctif : `git add` des chemins que le flux a produits + `git add -u`
derrière confirmation.

### G18 — `scripts/init.ps1` teste LDPlayer mais lance la chaîne Steam, puis promeut sans revue · risque ops

[`scripts/init.ps1:210-238`](../../scripts/init.ps1) : `Test-Emulator` (adb)
gate le pipeline, mais `datagen:pull`/`datagen:dump` sont devenus les scripts
**Steam** le 26/08. Sur un poste Steam sans LDPlayer, le pipeline est sauté ;
avec LDPlayer, il tire Steam. Et `datagen:regen` = `build && promote --apply` :
une fresh install écrit `data/generated` sans la revue que le README promet.
Correctif : gater sur `findSteamInstall`, remplacer `regen` par `patch` (dry).

### G19 — Boutons « Télécharger » qui ouvrent le fichier au lieu de le sauver · UX

[`wallpapers/WallpapersGallery.tsx:227-234`](../../src/app/[lang]/tools/_contents/wallpapers/WallpapersGallery.tsx),
[`ost/OstPlayer.tsx:367-375,516-523`](../../src/app/[lang]/tools/_contents/ost/OstPlayer.tsx).
`download` vers `img.outerpedia.com` (autre origine) : Chrome/Firefox l'ignorent
sans `Content-Disposition`. Vérifié par `curl -I` sur R2 : `Content-Type` seul.
Correctif : `Content-Disposition: attachment` sur R2 pour `audio/bgm/*` et les
wallpapers, ou `fetch → blob`.

### G20 — Impossible de taper un niveau au clavier dans le hero-tracker · UX

[`hero-tracker/HeroTrackerBrowser.tsx:1975`](../../src/app/[lang]/tools/_contents/hero-tracker/HeroTrackerBrowser.tsx)
(`NumberField` borne à chaque frappe) avec `min = 5`. Taper « 1 » pour 120 est
remplacé par 5, puis « 2 » → 52, « 0 » → 520 → plafond.
Correctif : texte local pendant la saisie, borne au `blur`/Enter.

### G21 — OST : raccourcis clavier qui confisquent la page · a11y

[`ost/OstPlayer.tsx:241-251`](../../src/app/[lang]/tools/_contents/ost/OstPlayer.tsx)
(`ArrowUp/Down` → `preventDefault` inconditionnel, même sans piste : défilement
clavier mort), `:222-231` (`Space` préempte un `<button>` focalisé).
Correctif : ne capturer que si une piste est chargée et si `e.target` n'est
pas un contrôle.

### G22 — Aucune modale ne gère le focus · a11y

[`ui/ImageLightbox.tsx:66-73`](../../src/components/ui/ImageLightbox.tsx) (pas
de focus initial ni de retour, pas de scroll-lock),
[`layout/SettingsModal.tsx:106-112`](../../src/components/layout/SettingsModal.tsx),
[`layout/SearchModal.tsx:84-92`](../../src/components/layout/SearchModal.tsx)
(pas de retour ; Échap seulement depuis l'input), `ProgressTrackerBrowser.tsx:725-728`
(sans `role="dialog"`, ni Échap). Aucune ne piège le focus.
[`CharactersFiltersDrawer.tsx:56-67`](../../src/components/character/filters/CharactersFiltersDrawer.tsx) :
fermé = `aria-hidden` mais tout le panneau reste tabulable.
[`HeaderClient.tsx:184-198`](../../src/components/layout/HeaderClient.tsx) :
sous-menu Guides `group-hover` seulement, inaccessible au clavier.
Correctif : un `useDialogFocus` partagé ; `inert={!open}` sur le drawer ;
`group-focus-within:*` sur le sous-menu.

### G23 — Durées « 3d 4h 12m » en anglais dans les 5 langues, quatre copies · i18n + duplication

[`home/BannerCountdown.tsx:12-20`](../../src/components/home/BannerCountdown.tsx),
[`home/BuffEventTimer.tsx:64-73`](../../src/components/home/BuffEventTimer.tsx),
[`home/ServerResets.tsx:35-44`](../../src/components/home/ServerResets.tsx),
[`progress-tracker/tracker.ts:453-459`](../../src/app/[lang]/tools/_contents/progress-tracker/tracker.ts).
`guides/SingularityCountdown.tsx:46-62` a déjà tranché (format numérique,
motivé). Correctif : `lib/format-duration.ts` unique.

### G24 — Chaînes UI en dur, 24 sites dans les outils + 8 dans les composants · i18n

Outils : `ost/OstPlayer.tsx:129` (« Failed to load track », affiché), `:277,
295-300, 432, 472, 494` ; `hero-tracker/roster-import.ts:108,111,113` (messages
d'erreur **en français** affichés tels quels via `HeroTrackerBrowser.tsx:1223`) ;
`HeroTrackerBrowser.tsx:2165` (picker affiche `fire`/`water` brut alors que
`elementNames` est reçu) ; `TierListMakerBrowser.tsx:1822,1826,1845,1847` et
`TeamPlannerBrowser.tsx:395,399,408,412` (`title`/`alt` = `'fire'`,
`'striker'`) ; `GearUsageFinderBrowser.tsx:454,468` ; `GearUsageBrowser.tsx:127` ;
`WallpapersGallery.tsx:175,192,204` et `ComicsGallery.tsx:142,159,171`
(`aria-label` Close/Previous/Next). Composants : `ON`/`OFF`
(`SubstatVerdict.tsx:186`, `StatsRankingSection.tsx:217`), `aria-label="remove"`/`"clear"`
(`FilterAtoms.tsx:230,343`), `StarText.tsx:15`, concaténation nombre+libellé
(`TierListBrowser.tsx:381`, `tierlist/page.tsx:459-461,495`). Nombres en
`toLocaleString('en')` quelle que soit la langue :
`StatsRankingSection.tsx:136,291`, `EquipmentDetail.tsx:812,879`.

### G25 — Sync URL par `router.replace` à chaque frappe · perf

[`most-used-units/MostUsedUnitsBrowser.tsx:129`](../../src/app/[lang]/tools/_contents/most-used-units/MostUsedUnitsBrowser.tsx),
`CharactersBrowser.tsx:238`, `TierListBrowser.tsx:204` : un aller-retour RSC
par changement de filtre, là où `TierListMakerBrowser.tsx:759-760` explique et
fait l'inverse (`history.replaceState`). `TierListBrowser.tsx:188-207` et
`CharactersBrowser.tsx:212-240` font en plus un `replace` inutile au montage
(`lastUrl` part de `''`) — à confirmer.

---

## Basse

- **G26** · `/api/tierlist` ne valide pas le jeu de caractères de `z`
  ([`tierlist/route.ts:28`](../../src/app/api/tierlist/route.ts)) ; colonne
  `CHARSET=ascii` → 500 en `sql_mode` strict, ou `?` substitués et id faux
  sinon. `shortlink` fait la vérification, pas la tier list. `sql_mode` du VPS
  à confirmer.
- **G27** · Mode strict de `parseText` incomplet : `{E/xxx}`/`{C/xxx}` inconnus
  ne passent pas par `unknownRef` ([`parse-text.tsx:511-531`](../../src/lib/parse-text.tsx))
  → la page rend la clé `sys.element.xxx` et une `<img>` cassée. `{L/label|href}`
  non validé (`:547-552`) là où `EventBlocks.tsx:35` n'accepte que `http(s)`.
- **G28** · `fr` : `sys.element.*`/`sys.class.*` traduits dans l'UI
  (`fr.ts:985-989`) mais la fiche lit le glossaire (repli EN) — deux
  vocabulaires. Trancher (glossaire + repli, conforme à la règle) et retirer les
  clés.
- **G29** · Littéraux `'en'` résiduels : `src/i18n/index.ts:12` (le commentaire
  de `config.ts:72` affirme ce motif disparu), `api/search/route.ts:14`,
  `feed/route.ts:67`, `characters.ts:58,63,80`, `keys.test.ts:24` (liste en dur
  — dériver de `LANGUAGES`). `[lang]/error.tsx:21` parle de « 519 clés » (1 169).
- **G30** · Deux sources pour le mapping sous-domaine ↔ langue : `proxy.ts:71`
  matche la CLÉ, `site.ts:67` construit avec `LANGUAGES[l].subdomain`. Marche
  parce que clé = sous-domaine ; en prod, `outerpedia.com/jp/…` est servi au lieu
  de rediriger vers `jp.` (doublon couvert par le canonical).
- **G31** · `monsterIconSrc` ([`monsters.ts:294`](../../src/lib/data/monsters.ts))
  recopie `img.monster` (`images.ts:116`) alors que celui-ci affirme « la règle
  vit ICI et nulle part ailleurs ».
- **G32** · `next/image` dans 3 fichiers (`event/[slug]/page.tsx:16`,
  `EventsBrowser.tsx:13`, `EventBlocks.tsx:17`) — CONVENTIONS « `<img>` brut ».
- **G33** · `GuideMeta.ogImage` documenté en chemin racine `/images/…`
  (`guides.ts:148`), passé tel quel par 3 sites — le piège déjà corrigé pour
  `DEFAULT_OG_IMAGE`. Aucun `meta.json` ne l'utilise aujourd'hui.
- **G34** · ISR réel de la fiche perso = 60 s : `characters/[slug]/page.tsx:96`
  affiche `revalidate = 86400`, `reviews.ts:43` (`revalidate: 60`) abaisse la
  route. Voulu selon `reviews.ts:36`, la page le contredit.
- **G35** · Commentaires périmés : `Footer.tsx:19-22` et `Header.tsx:41-42`
  (« /tierlist, /coupons… ASSUMÉES 404 » — toutes existent),
  `HeaderClient.tsx:63-65` (« emplacement de la recherche réservé »),
  `tools/registry.ts:31-32` (hero-tracker « unlisted » — `_index.json` dit
  `available`), `datagen/refresh.ts:11,21` (listings ASM supprimés le 26/08 ;
  « pnpm dev → apply: true » alors que `dev-refresh.ts:22` passe `false`),
  `datagen/lib/python.ts:3-4`, `datagen/README.md:455-457` (« 20 générateurs »,
  `build.ts` en importe 31), `monad.ts:115,124` (noms de fichiers),
  `lib/lang.ts:9-10`, `towers.ts:44,85` (« 5 langues », `LangDict` en a 4),
  `items.ts:12` (« PROPOSITION à valider », consommé depuis longtemps),
  `progress-tracker/tracker.ts:27` (`lastUpdated` écrit partout, lu nulle part),
  `curated.ts` (« relu à chaque appel à dessein »).
- **G36** · Convention « ni V2 ni V3 » : [`globals.css`](../../src/app/globals.css)
  **25 occurrences** (seul fichier de `src/` — plateforme.md S4 le déclarait à
  tort réservé à `next.config.ts`), `next.config.ts:24`, `eslint.config.mjs:53,106`,
  `Dockerfile:3,6` (« outerpedia V3 », « cf. Phase 2 »).
- **G37** · `alt` contraires à la règle maison : `Thumbnail.tsx:488` `"boss"` ;
  `OverviewSection.tsx:121` `"star"` × rareté (annoncé N fois) ;
  `StatsRankingSection.tsx:131,285`, `EquipmentDetail.tsx:814,851` (`"CP"`,
  `"Gold"`) ; `BurstSection.tsx:31`, `TierListBrowser.tsx:339`,
  `SkillsSection.tsx:48` (`"→"`) ; slugs bruts `CharacterCard.tsx:193`,
  `CharacterPortrait.tsx:157`, `EquipmentIcon.tsx:562,589` ; doublons
  icône+texte `InlineIcon.tsx:42`, `ItemInline.tsx:57`, `SkillCard.tsx:158`,
  `OverviewSection.tsx:128-137`. `SubstatVerdict.tsx:95` : `aria-label` sur un
  `<span>` sans rôle. `TierListMakerBrowser.tsx:442,449` : `lang="en"` sur des
  noms localisés.
- **G38** · `<div onClick>` et boutons icône sans nom : `ProgressTrackerBrowser.tsx:979-982,
1027-1030, 1339-1348` ; `OstPlayer.tsx:309-315, 413, 436-465` ;
  `TierListMakerBrowser.tsx:1575-1579, 1893-1895` (aucun placement clavier) ;
  `TeamPlannerBrowser.tsx:189-198` (retirer : `opacity-0` hors survol, invisible
  au clavier), `:364-367, 374-380` ; backdrops `wallpapers:168`, `4-comics:135`.
- **G39** · Hero-tracker : long press tactile qui avale le tap suivant
  (`:1822-1845`, pas de `pointercancel`, à confirmer sur appareil) ; bouton
  « réinitialiser » gaté sur la liste FILTRÉE (`:723`) et qui remet `heroes`
  mais pas `fused` (`:1232-1234`).
- **G40** · OST : Précédent/Suivant `disabled` aux bornes (`:439,461`) alors que
  les gestionnaires gèrent shuffle et repeat-all — la touche marche, le bouton
  est gris.
- **G41** · Team planner : ordre de chaîne partagé non validé comme permutation
  (`:495`, `0000` accepté → quatre fois le même slot, irréparable par échange).
- **G42** · Tier-list maker : import JSON, couleur non validée (`:1035`,
  `"red"` → `colorToCode` encode `cred`, le lien partagé perd la couleur) ; nom
  de fichier exporté vide en JP/KR/ZH (`:1018,1379`, `[^\w-]` → `_.png`).
- **G43** · Patch-history : strip HTML sur 2,8 Mo à chaque frappe
  (`PatchHistoryBrowser.tsx:178-181`) — texte nu à précalculer.
- **G44** · Petites fuites : timers `setCopied` non nettoyés
  (`TierListMakerBrowser.tsx:1075`, `TeamPlannerBrowser.tsx:535`,
  `ShareButtons.tsx:128-136`) ; écouteurs du drag de LIGNE jamais retirés au
  démontage (`TierListMakerBrowser.tsx:834-855` — le drag d'ITEM, lui, a son
  nettoyage) ; `clipboard.writeText` sans `catch` (`TeamPlannerBrowser.tsx:532`) ;
  `setLastResults` DANS l'updater de `setSession` (`PullSimulatorBrowser.tsx:224-243`).
- **G45** · Admin : `key={i}` sur des listes réordonnées par `MoveButtons`
  (`EventsEditor.tsx:335,389`, `PremiumLimitedParts.tsx:503`) — l'état interne
  d'`InlineTextField` reste collé à la position.
- **G46** · `stamp:guides` date en UTC (`stamp-guides.ts:45`) : un
  `pnpm commit` entre 0 h et 2 h (Paris) date le guide de la veille.
- **G47** · Trois parseurs de `.env.local` : `datagen/lib/env.ts:18-24` (pas de
  `trim()` de ligne — vérifié : `'KEY=val\r'` ne matche pas, un fichier réécrit
  en CRLF vide toutes les variables, R2 compris ; le fichier actuel est LF),
  `assets-push.mjs:79-81`, `r2-cors.mjs:18-20` (ni trim ni dé-quotage).
- **G48** · Commits `news` non conventionnels : `get-news.ts:277` committe
  avec le message `news` (39 dans le log) ; `commit.ts:66-69` accepte `revert`,
  absent de CONVENTIONS.
- **G49** · `.dockerignore` n'exclut ni `.gamedata-android/` (≈19 Go), ni
  `.editorial/`, `.dev/`, `.unlighthouse/`, `*.sql` (`outerpedia.sql` à la
  racine). Sans effet en CI ; un `docker build` local envoie tout au démon.
- **G50** · Guides (par script sur 148 `meta.json`) : `joint-challenge/shichifuja`
  a `updated: 2026-02-24` alors que sa dernière version est `2026-07` (affiché
  « février ») ; 4 descriptions Joint Challenge répètent le titre entier
  (« Joint Challenge boss guide for Shichifuja Joint Challenge Guide: … »,
  ×5 langues : annihilator, deep-sea-guardian, koh-meteos, shichifuja) ;
  `effect-filters.json` et `gear-presets.json` encodent des arbitrages
  (catégories/groupes, codes de preset `aem`, `CPplusAssa`) sans `_doc`, contre
  la convention « dès qu'une clé encode un arbitrage, elle se documente ».
  Ordres, bossId, auteurs, langues, balises et placeholders : cohérents.
- **G51** · `retired` posé par promote sur monsters/monster-skills/encounters
  (`promote.ts:125-128`) alors que seul `DungeonRef.retired` existe dans le
  contrat — clé fantôme au premier retrait (X5 : le validateur ne la verra pas).
- **G52** · Collectes qui s'exécutent à l'import sans garde `isMain`
  (`collect-audio.ts:57`, `collect-comics.ts:187` avec `.then` sans `.catch`,
  `collect-wallpapers.ts`) ; `comics.json`/`video-meta.json`/`posts.json`
  écrits hors `formatJson` (passe prettier aujourd'hui par chance de forme).

---

## Dette (au fil de l'eau)

- **Briques dupliquées entre outils** : 4 modales/lightbox (`ProgressTracker.Modal`,
  `TeamPlanner.CharPicker`, `WallpapersGallery`, `ComicsGallery` — identiques à
  90 %, glyphes compris) ; 3 sélecteurs de perso ; 3 barres élément/classe
  maison alors que `CharactersFiltersBar`/`ClassIconPill` existent ; `CLASSES`
  en dur dans 4 fichiers avec DEUX ordres ; `ELEMENTS` en dur ×2 alors que
  `ELEMENT_ORDER` existe. Presse-papier réécrit ×4 (`ShareButtons`,
  `PromoCodes`, `CouponsList`, `CharactersBrowser`). Tooltip d'effet recomposé
  (`parse-text.tsx:89-98` vs `EffectTooltipBody`). Recherche perso normalisée
  de trois façons (`toLowerCase` / NFKC / NFKD). `esc()`/`rfc822()` dupliqués
  entre les deux flux RSS.
- **Datagen** : `isPermille`/`fmtValue`/`findBuff` recopiés dans `solver.ts`
  avec une règle divergente de `lib/buff.ts` ; deux listes de « shops
  permanents » (`shop-priorities.ts:34-44` vs `timegate-resources.ts:54-62`) ;
  « persos intégrés » lu par 4 lecteurs à 4 sémantiques d'erreur ; paires
  classe/enum et drapeaux en dur dans `manifest.ts:985,1042,1479` juste après
  les avoir dérivés ; `Caddyfile.dev:23` recode les sous-domaines ; rebuilds
  redondants dans un `datagen:build` (`buildEquipment` ×3, `buildItemCatalog`
  ×4, `loadTextIndex` sans cache, `monsters.json` ×5 dans manifest) ;
  `advOf`/`stripBrackets` recopiés dans `encounters.ts`.
- **Familles d'équipement** rematérialisées à chaque appel
  (`equipment.ts:625-634,661,714`), avec deux caches consommateurs
  (`gear-reco.ts:149`, `rewards.ts:94`) au lieu d'un cache à la source.
- **`globals.css`** : 8 utilitaires morts (`.scroll-offset`, `.h2-style`,
  `.card-solid`, `.card-light`, `.panel-success`, `.panel-danger`,
  `.panel-feature`, `.panel-highlight` — 0 usage) ; aucun utilitaire pour
  `text-[10px]` ×223 / `text-[11px]` ×126 — déclarer `--text-2xs`/`--text-3xs`
  dans `@theme` est la voie canonique.
- **Schémas persistés** : `client-storage.ts:79-83` rend `data` tel quel quand
  la version correspond ; le tier-list-maker ne normalise que la clé héritée —
  ajouter un champ à `TlmSettings` sans bump donnera des `checked={undefined}`.
- **Twitch `parent`** (`MultiVideoEmbed.tsx:21`) ne liste que `outerpedia.com`
  et `localhost` : les embeds échoueraient sur `jp./kr./zh./fr.` (latent, aucune
  vidéo Twitch aujourd'hui).
- `lefthook.yml` : `parallel: true` fait courir `format` (qui réécrit) et `lint`
  (qui lit) sur les mêmes fichiers ; le glob lint exclut `*.mjs` que la CI
  couvre. `pnpm dev` = `clean:all` (rm `node_modules` + install réseau) à chaque
  lancement — aucun dev hors ligne possible. `eslint-config-next 16.3.1` vs
  `next 16.3.0`.
- Locales : la convention « alignement par ligne » n'est plus vraie (en 1 396,
  fr 1 410, jp 1 367, kr 1 354, zh 1 328 lignes — prettier replie les longues
  chaînes) ; le test de clés fait le vrai travail. Réécrire la règle.

---

## Déjà connus, toujours ouverts (re-vérifiés)

| Constat                                 | État                                                                                                                             |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **S1** rate-limit sur `x-forwarded-for` | **ouvert** — `rate-limit.ts:28` inchangé, `Caddyfile` sans `trusted_proxies`. Pas marqué fait dans DONE : pas de fausse clôture. |
| F1, E2, E3, E4, E6, X2, X3              | faits, vérifiés dans le code                                                                                                     |
| D1–D5                                   | chantier ouvert, non re-signalé                                                                                                  |
| TODO « découper les gros composants »   | réservé Sevih, inchangé (2 218 / 2 050 / 1 439 l.)                                                                               |

## Backlog proposé

**P1 — une soirée, huit correctifs courts** : G1 (`Object.hasOwn`), G2 (footer
→ `buildUrl`), G3 (`[:：]` + test), G6 (collect.ts), G7 (assainir dans
`processContent`), G8 (`TIME_SENSITIVE_ROUTES` + `serverNow`), G5 (statut
d'événement côté client), G4 (à tester sur téléphone d'abord).

**P2 — métier et données** : G9 (customPool), G10 (vagues VH), G11 (une
fonction de scaling), G12 (damage en dry), G15 (`[floor]`), G16 (écritures
atomiques), G17/G18 (outillage vs convention).

**P3 — régler à la source** : G13 (7 lecteurs → 1), G14 (accesseurs + règle
eslint), G23/G24 (i18n), G22 (focus des modales, un hook), G25.

**Au fil de l'eau** : G26–G52 et la dette, en passant sur les fichiers.

## Zones lues et jugées saines

`datagen/build.ts`, `promote.ts` (rétention, `--only`), `refresh.ts` (pré-vol,
checkpoint), `lib/json.ts`, `lib/tables.ts`/`text.ts`/`buff.ts`/`effects.ts`
(déterministes), `generators/encounters.ts` (hors G10), `equipment.ts`,
`monad.ts` (BFS), `solver.ts` (3 134 ids = 3 134 du wiki), `skills.ts`,
`item-catalog.ts`, `sources.ts`, `content-schedule.ts`, `game-version.ts`,
`assets/stage.ts`, `source.ts`, `editorial.ts`, `commit-assets.ts`, `ci.yml`,
`tsconfig*`, `vitest.config.ts` · `rate-limit.ts` (hors S1), `db.ts`,
`hash-store.ts`, shortlinks (validation aux deux bouts), `/api/revalidate`
(Bearer temps constant), `/api/bot/*`, `/api/reco`, 28/28 routes admin/dev en
`.dev.ts` + `IS_DEV`, `src/hooks/*`, `client-storage.ts`, `runtime-json.ts`,
`seo.ts` (hreflang/canonical/x-default), `sitemap`/`robots`/`manifest`/`llms.txt`,
`gacha`/`lineup`/`combat-power`/`monster-stats` · `ui/` (Tabs a11y complète),
`seo/`, `home/` (horloge partagée), `tierlist/`, `changelog/`, `coupons/`,
`events/`, `quirks/`, `character/` (filtres, GearReco, AnimatedPortrait),
`equipment/`, `guides/` (tabs/sliders ARIA, listeners nettoyés), toutes les
pages listées (`notFound()` présent sur `[slug]`, `[category]`,
`equipment/[slug]`, `event/[slug]`), placeholders `[Buff_*]` : 0 non résolu
sur 1 033 skills · `_shared/TierListTool.tsx` + 4 wrappers (PvE/PvP/EE ne
divergent pas), `share-codec.ts` et le drag & drop (clés stables), `engine.ts`,
`roster-import.ts` (bornes), `tracker.ts` (resets UTC, `reconcileProgress`
idempotent), `usage.ts` ×2, `finder.ts`, hydratation des outils (`useStoredState`,
gardes `ready`), migration v1→v2 du hero-tracker.

## Non couvert

`datagen/generators/` : `recruit`, `hero-growth`, `progression`, `enhance`,
`quirks`, `unlock-content`, `ether-rankings`, `characters-list`, `ee-effects`,
`bgm-mapping`, `costumes`, `goods`, `bosses`, `singularity`, `monster-skills`,
`solver-ingredients`, `solver-best-skill`, `comics` ; `datagen/damage/*` (hors
`skill-descs`) ; `assets/{face-icon,piece-icon,sprite-rect,hero-full-art}` ;
`templates/bytes-parser.ts` ; les scripts `.py` · `src/lib/data/` : corps de
`equipment.ts`, `equipment-detail.ts`, `encounters.ts`, `rewards.ts`,
`boss-view.ts`, `char-progression.ts`, `singularity.ts`, `towers.ts` (balayés
pour caches/mutations seulement) ; `parse-text.tsx` au-delà des handlers ;
`skill-view.ts` et `game-tokens.ts` en profondeur · `portrait-fx-gl.ts`,
`portrait-fx-sim.ts`, `portrait-canvas.ts` (WebGL) ; `admin/` hors les deux
fichiers cités · `damage-calculator/` (chantier ouvert, sur consigne) ; le
contenu éditorial de `progress-tracker/tasks.ts` (compteurs = données de jeu,
non recoupées) · les 151 TSX de guides (seuls les JSON ont été passés au
script ; le code des guides n'a pas été lu — un lot à part, l'agent qui devait
le faire a été coupé par le quota).
