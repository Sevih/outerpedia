# Audit — code des guides (constats H1–H14)

> Fait le **2026-09-09**. Le lot que l'[audit transverse](./transverse.md) du
> 07/09 n'avait pas couvert : le CODE de `src/app/[lang]/guides/_contents/**`
> (151 `.tsx`, 27 `.ts`) et les rendus partagés de `src/components/guides/**`.
> Les 567 JSON avaient déjà été passés au script le 07/09 (clés, langues,
> balises, ids, dates) — pas refait ici.
>
> **Traité le jour même** : H1, H2, H3, H4 et la moitié de H7 (commentaires,
> `type="button"`, locales de tri, fuseau des dates d'archive, repli `200`,
> `console.warn` → throw) — cf. [DONE.md](../DONE.md) § 2026-09-09. Le reste
> est au [TODO](../TODO.md).

## Verdict

**Sain.** 130 des 151 `index.tsx` sont des re-exports d'une ligne vers 8
rendus partagés bien gardés (`readGuideFile` toujours protégé, erreurs
bruyantes sur group/dungeons/monstres inconnus, `notFound()` en place),
aucun lien interne mort, aucune langue mélangée dans les 1 351 objets
localisés, calculateurs arithmétiquement justes (gear, banner-mileage,
ether-income recoupés contre `enhance.json`, `recruit.json`,
`ether-rankings.json`). Aucun constat Haute.

## Moyenne

- **H1 — Roadmap 2026 : les « Core Fusion » étaient les persos de BASE** ·
  contenu faux · `other/roadmap-2026/data.ts` nommait `'Lisha'`, `'Snow'`… ;
  `findCharacterByName` indexe le nom d'AFFICHAGE, donc six portraits de bases
  avec leurs liens, pas les fusions (2700005…). **Fait** : « Core Fusion X »
  pour les cinq livrées ; Rin reste la base (sa fusion n'est pas en donnée).
- **H2 — Tour very hard : un id de boss inconnu rendait le premier combat en
  200** · soft-200 · `TowerGuide.tsx` (`?? combats[0]`) — `/…/12345` → Floor 20
  titré « Floor 12345 », une entrée ISR par URL sondée. **Fait** : repli sur le
  premier combat seulement sans segment, `notFound()` sinon.
- **H3 — 20 guides datés AVANT leur dernier changement de contenu** · le
  commit du 07/08 (Heatwave Cop Delta à la place de Ryu Lion) a modifié les
  équipes de 26 guides sans stamp. **Fait** : `updated` posé au 07/08 sur les
  20 encore en retard. À faire : rendre `stamp:guides` automatique (hook
  pre-commit) plutôt qu'une étape de `pnpm commit`.
- **H4 — « by {author} » en anglais dans les 5 langues sur 21 guides** ·
  i18n · `VersionedBossGuide`, `StagedBossGuide` appelaient `MultiVideoEmbed`
  sans `byLabel`. **Fait** : `t('video.by')` posé, et la prop est désormais
  OBLIGATOIRE (un oubli se voit à la compilation).
- **H5 — Quatre index « nom EN → item du catalogue », trois avec repli muet** ·
  duplication · `gear/index.tsx:74-86`, `heroes-growth/index.tsx:32-44`,
  `shop-purchase-priorities/index.tsx:66-77` (IIFE `CATALOG_BY_NAME`
  identiques) alors que `editorial/banner/items.ts:itemChipByName` jette sur un
  nom inconnu. Les trois copies rendent un `<span>` texte — l'inverse de la
  doctrine STRICT. Correctif : `itemChipByName` partout.
- **H6 — 152 couleurs Tailwind brutes dans 17 fichiers de guides** · hors
  tokens · `how-to-play` (23), `banner-mileage` (20), `roadmap-2026` (14 +
  12 dans la DONNÉE `data.ts`), `outerplane-on-linux` (14), `daily-stamina`
  (13), `service-transfer` (11), `timegate-resource` (9)… alors que
  `globals.css` déclare `--ed-{sky,violet,emerald,amber,rose,cyan}` pour ça.
  SVG : `MonadGateMap.tsx:351,375` (`#facc15`…), `TowerCombatRoster.tsx:184,192`,
  `BannerTabs.tsx:72`, `AdventureGrid.tsx:97`. Correctif :
  `EDITORIAL_ACCENT`/`text-ed-*`, `var(--ed-*)` en SVG.

## Basse

- **H7 — Anglais en dur dans des rendus localisés** · `gear/index.tsx:505,514`
  (« Cost: »), `core-fusion/index.tsx:124-133` (« Lv. 1 », `orLabel="or"`),
  `editorial/reviews/fusion.tsx:52` (« Lv {lv} »), `ether-income/Calculator.tsx:239`
  (« WB: »), `:95` (`alt="Ether"`), `BuildRequirements.tsx:137`,
  `TurnOrder.tsx:65` (« SPD » — `statAbbr('spd')` existe),
  `shop-purchase-priorities/index.tsx:46-51` (`PERIOD_ABBR` D/W/M/O),
  `premium.tsx:17` (`aria-label` « N stars »), `roadmap-2026/index.tsx` (5
  `alt` anglais). `outerplane-on-linux` est EN seul par choix mais sans
  `lang="en"` sur son conteneur. — La partie « commentaires qui mentent,
  `type="button"`, tri/format sans locale, fuseau, repli 200, console.warn »
  est FAITE.
- **H8 — `alt` contraires à la règle maison** · `HeroReviewCard.tsx:48,58,65`
  (slugs bruts « fire », « striker », « premium ») ; doublons icône+texte :
  `premium.tsx:70`, `BannerTabs.tsx:62`, `LicenseTabs.tsx:98`, `CardArt.tsx:35`,
  `fusion.tsx:174`.
- **H9 — 92 chaînes courtes des `labels.ts` existent déjà dans les locales**
  (`Weekly`, `Monthly`, `Source`, `Weapon`, `Armor`, `Notes`, `Details`,
  `Priority`, `Guild`, `Gold`…) — `gear/labels.ts` 15, `beginner-faq/content.ts`
  12, `timegate-resource/labels.ts` 12, `shop-purchase-priorities` 10,
  `ether-income` 8… Deux vocabulaires pour un mot (`MAIN_STAT_LABEL` fr
  « Main Stat » vs `page.character.ee.main_stat` « Stat principale »).
  Correctif : `t()` pour le chrome, `labels.ts` réservé à la prose.
- **H10 — `eslint-disable` évitable** · `ether-income/Calculator.tsx:217` : le
  `useMemo` de `totals` (arithmétique sur ~20 lignes) coûte une suppression
  d'`exhaustive-deps` ; inline, la directive part. Le calcul est juste.
- **H11 — Composants locaux qui doublent une primitive** · `gear/index.tsx:721`
  `QA` = `QACard` (`editorial/blocks.tsx`) ; `Card`/`Heading`/`TableShell`/`th`
  définis DANS le corps du composant ; `goldCell` identique dans `gear:112` et
  `heroes-growth:138`.
- **H12 — Hash d'onglets trompeurs** · `banner-mileage/index.tsx:155,186,225` :
  `#banner=pickup` ouvre le CUSTOM Rate Up, `#banner=new` le Rate Up,
  `#banner=fes` le Limited — ids hérités, aucun lien entrant (renommables).
- **H13 — `reward`/`rewardWin` : priorité inversée entre sites** ·
  `SpecialRequestSplit.tsx:52` (`reward ?? rewardWin`) vs
  `EncounterBossGuide.tsx:150`, `IrregularChaseMap.tsx:100` (`rewardWin ??
reward`) ; `StagedBossGuide.tsx:181` ne lit que `reward`. Sans effet
  aujourd'hui (12 donjons irregular_chase portent les deux). Une seule
  `lootTableOf(ref)` dans `rewards.ts`.
- **H14 — À confirmer** · `/guides/skyward-tower/<tour>/1` et la page de base
  rendent le même étage avec deux canonicals (`[floor]/page.tsx:49`) — doublon
  SEO. Roadmap H1 (Rin en juin) vs H2 (8 septembre) : attendu (H1 est une
  archive datée), mais un encart « annoncé pour juin, livré le 8/09 » le dirait
  au lecteur.

## Dette

- `TowerCombatRoster.tsx:44-48` recopie éléments/classes en dur ;
  `BannerBlocks.tsx:20-113` porte un dictionnaire 5 langues de 16 clés dans un
  composant ; `roadmap-2026(-h2)/data.ts` embarquent des classes CSS
  (`accent.border`) dans la donnée éditoriale.
- `VersionedBossGuide` lit chaque `config.json` deux fois ; `GuildRaidGuide`
  appelle `geasUnlockTable`/`groupBossMonster` 3× par sous-boss — sans effet
  mesurable en SSG.

## Zones lues et jugées saines

Les 8 rendus partagés (`BossGuide`, `EncounterBossGuide`, `StoryBossGuide`,
`StagedBossGuide`, `VersionedBossGuide`, `GuildRaidGuide`, `TowerGuide` hors
H2, `MonadGateGuide`) · `BossPanel`/`BossStats`/`BossRank`/`EncounterSelection`/
`HeatSlider`/`MonsterLineup` (ARIA slider/tablist, index bornés) ·
`SegmentedTabs`/`GuideVersions`/`BannerTabs` (hash = source de vérité) ·
`TeamSlotCarousel` (ResizeObserver nettoyé) · `TocBar`, `MonadGateMap`,
`MonadRouteClient`, `SingularityCountdown` · les 11 vues de catégorie ·
`RelatedGuides`, `{L/…}` (7 cibles internes, toutes existantes) · gear
(enhanceMult 5, MAX_TIER 4, activation 3 %), banner-mileage (prix/tickets),
ether-income (paliers), monad rewards · aucun `next/image`, aucun
`'use client'` superflu (les 24 clients ont un état).

## Non couvert

L'exactitude ÉDITORIALE des textes (`beginner-faq`, `daily-stamina`,
`unlock-content/notes.ts`, formules de `stats/labels.ts`) ; `how-to-play/*`
(balayé aux greps) ; `GeasUnlockList`, `LimitedHeroesList`, `PropertyDiagram`,
`guide-accents.ts` (survolés) ; le rendu réel (pas de `pnpm dev`).
