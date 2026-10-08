# Migration de l'admin vers quick

> Décision de Sevih du 08/10/2026 : `pnpm quick` remplace TOUT le panneau admin
> (`/admin`, extractor et outils compris), petit à petit. Trois raisons : quick
> est beaucoup plus rapide, son UI est plus agréable, et tout se fait d'un seul
> endroit. Quand tout est passé, l'admin sort du site.
>
> Ce fichier est l'inventaire et l'ordre. **Chaque section a une ligne
> « Agacements »** : Sevih y note, en vrac, ce qui l'a gêné dans l'écran admin
> et qu'il n'a jamais pris le temps de corriger. Le lot qui porte la section
> lit sa ligne et corrige EN PORTANT — sans ligne, l'agent porte l'écran tel
> quel, défauts compris. Une section portée migre dans `DONE.md` avec son lot.

## Règles de portage (valent pour tous les lots)

- La logique serveur ne bouge pas : quick appelle les actions et les stores de
  l'admin (`src/lib/admin/*`) tels quels, via `scripts/quick/actions.ts` et
  une route dans `server.ts` (`env.ts` rend `IS_DEV` vrai dans le processus
  de quick). Un portage, c'est l'ÉCRAN en vanilla — jamais une réécriture de
  la règle métier. Si l'écran admin porte de la logique dans son composant
  React, elle descend d'abord dans `src/lib/admin/` (testée), puis quick
  l'appelle.
- Une section = `scripts/quick/ui/tabs/<nom>.{html,js,css}` + une entrée de
  `GROUPS` dans `lib.js`, selon `scripts/quick/ui/STYLE.md`. Les briques
  existantes se réutilisent : pickers modaux et tuiles (`tabs/gear.js`,
  `ui/gear-view.mjs`), segments de note (`previewHtml`), traduction
  (« Traduire » de Gear reco), savebar et journal.
- Les deux outils coexistent pendant la transition : ils écrivent par les
  mêmes stores, les données ne divergent pas. **Une section portée
  COMPLÈTEMENT retire son lien du menu de l'admin** (`AdminSidebar`, nourri
  par `src/app/admin/layout.dev.tsx` ; pour l'extractor, `EXTRACTOR_ENTITIES`
  de `admin-inbox.ts`) dans le même lot — la page reste joignable par son
  URL jusqu'au retrait final, mais plus proposée. Un portage partiel garde
  son lien.
- Un lot = une section (A ou B), sauf les guides (F) et l'extractor (plusieurs
  lots). Les lots qui touchent `lib.js`/`index.html` ne tournent pas en
  parallèle ; ceux qui n'ajoutent que leur `tabs/<nom>.*` et leur route, si.
- Le banc : `node scripts/quick/shot.mjs --port … --tabs <nom>`, captures
  avant/après dans le résumé du lot. Tests : la page en happy-dom avec un fetch
  factice (méthode C4), la route dans `actions.test.ts`, et la suite rejouée
  avec `NODE_ENV=development` (leçon du 08/10).

## Déjà dans quick

Publication : Codes promo (= Tools › Promo code ; lien retiré du menu admin le
08/10 — quick ajoute et supprime un code, mais ne RETOUCHE pas un code
existant, période ou récompenses : supprimer puis recréer, ou lot A pour
l'ajouter), 4-comics, Vidéos, Discord.
Données : Rangs, Gear reco (= l'éditeur des recos de l'admin, l'admin en garde
un exemplaire).
Outils : Noms (= Tools › Short names + Search aliases, étapes 1 et 2, lot B34,
liens retirés du menu admin le 08/10 — un onglet pour les deux, avec le verdict
« ce nom déborde-t-il ? » du site par langue).

## Ordre révisé le 08/10 (décision Sevih)

Quick devient le VRAI panneau admin : il lui faut un accueil et la chaîne
des données (détection, extraction, promotion) comme `pnpm dev` et la
`PatchCard` de l'admin les font. Les étapes 18 et 21 remontent donc juste
après les Bannières (5), avant Events :

5 Bannières → 18 Tableau de bord → 21 Patch → 6 Events → 7 Changelog →
8 Game data → 9 à 15 Éditeurs → 16 et 17 Guides → 19 et 20 Extractor
(revue par entité, intégration) → 22 Clôture. La numérotation des étapes ne
change pas.

- **18 Tableau de bord** = l'accueil de quick, premier onglet du groupe
  Données (ou un groupe « Accueil » en tête) : l'inbox de l'admin
  (`buildInbox` d'`admin-inbox.ts` : extraction à revoir par entité, tags
  morts, rapport d'assets — « rien à l'écran » = « rien à faire »), l'état
  git (commits à pousser, retard), la version du jeu (`game-version.json`)
  contre celle du client installé, les bannières qui finissent ou qui
  commencent (depuis la table du jeu, cf. 5), les codes promo qui expirent.
- **21 Patch** = la chaîne `datagen/refresh.ts` lancée de quick, étape par
  étape dans le journal : pull (Steam, Android en secours) → dump si le code
  a changé → extract → convert → build → promote en DRY (le diff par
  fichier au niveau entité, lu à l'écran) → « Promouvoir » (`--apply`,
  après confirmation, la garde perso de `promote.ts` reste) → commit des
  `data/generated/` + notes de patch. Verrou d'un seul job à la fois
  (`acquirePatchJob` de `patch-runner.ts`). Les persos non intégrés
  restent gardés : l'intégration par entité (19, 20) reste dans l'admin
  tant qu'elle n'est pas portée, et son lien reste.

## Ordre et inventaire

Chaque entrée : l'écran admin, ce qu'il contient, puis la ligne
« Agacements » à remplir (en vrac, même approximatif).

### 1. Outils simples (un lot A/B chacun, dans cet ordre)

3. **Tools › Synergy**
   liste + fiche `[id]`
   - Agacements : ça devrais etre dans l'editor de character

4. **Tools › Pro / Con**
   liste + fiche `[id]`
   - Agacements : ça devrais etre dans l'editor de character

5. **Tools › Banner**
   `BannersEditor`
   - Agacements : on devrait pouvoir detecter les bannieres active (et faire des auto insertion)
   - Précisé le 08/10 : les bannières arrivent avec un patch ; la table du
     jeu `RecruitGroupTemplet` porte TOUTES les fenêtres (`PickupID`,
     `StartDate`, `EndDate`, `RecruitType` PICKUP / SEASONAL / OUTER_FES /
     selections / DEMIURGE / ELEMENTAL) et `banner.json` les suit une à une
     (id + début) — deux fins tapées à la main diffèrent d'un jour de la
     table (Lambda, Titia). Lot B35.

6. **Tools › Events**
   `EventsEditor` (451 l.)
   - Agacements :

7. **Tools › Changelog**
   `ChangelogEditor` (346 l.)
   - Agacements : on a enormement de message qui se ressemble et que l'on pourrais preremplir, pas de preview de la news ...

8. **Tools › Game data**
   `GameDataBrowser` + `[table]` (lecture)
   - Agacements : mettre en avant les tables que l'on utilise réelement (et mettre un petit text pour l'utilité de la table), on a une grande liste de fichier qui prendre de la place plutot qu'un select avec une recherche text qui suffirait)

### 2. Éditeurs (curation ; un lot B chacun)

9. **Editor › Character**
   `CharacterCuratedEditor` + `CharacterKitEditor`
   - Agacements : ui pas joli et compact (et on a deplacer le gear reco)

10. **Editor › Effect**
    `EffectCuratedEditor`, `EffectsCatalog`, `NewEffectForm`
    - Agacements : on a une recherche text qui match sur je ne sais pas quoi (genre j'ecrit "tes" et j'ai increased speed qui sort), le side menu sert a rien

11. **Editor › EE**
    `EeCuratedEditor`
    - Agacements :

12. **Editor › Monster**
    `MonsterKitEditor`, `MonsterStatsCard`, `MonsterActions`
    - Agacements :

13. **Editor › Item**
    `ItemCuratedEditor`, `ItemsBrowser`
    - Agacements :

14. **Misc › Gear presets**
    `GearPresetsEditor` (318 l.)
    - Agacements :

15. **Misc › Tag control**
    page `tags`
    - Agacements :

### 3. Guides (lot F, en plusieurs écrans si besoin)

16. **Guide editor › Overview + catégories de boss**
    `GuideEditor` (989 l.) : joint-challenge, special-request, irregular-extermination, adventure-license ; `InlineTextField`, traduction, vidéos
    - Agacements :

17. **Guides généraux**
    `PremiumLimitedEditor`, `EditorialEditor`, `FreeHeroesEditor`
    - Agacements :

### 4. Extractor (plusieurs lots, en dernier)

18. **Home admin : boîte de réception**
    compteurs new / diff / removed par entité (`admin-inbox`)
    - Agacements :

19. **Extractor › revue par entité**
    `ExtractorReview`, `EntityDiffPanel`, `DiffHighlight`, `EntitySwitch` — Character, Effect, EE, Weapons, Amulet, Armor, Talisman, Sets, Monster, Item
    - Agacements :

20. **Extractor › intégration**
    `IntegrateCharacterButton`, `IntegrateGearButton`, `IntegrateModeButton`, `AcceptTargetButton`, `ContributionImport`
    - Agacements :

21. **Patch : lanceur et journal**
    `PatchCard` + `patch-runner` (`pnpm datagen…`, `pnpm commit`), journaux longs en direct
    - Agacements :

### 5. Clôture

22. **Retirer `/admin` du site**
    routes `.dev`, composants, `api/admin` devenus inutiles — un lot, quand
    1 à 21 sont faits
    - Agacements :
