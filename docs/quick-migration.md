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

Accueil : Tableau de bord (= la boîte de réception de la home admin, étape 18,
lot B36 : l'onglet qui s'ouvre au lancement — l'inbox de l'admin telle quelle
(`buildInbox` d'`admin-inbox.ts` : extraction à revoir par entité, tags morts,
rapport d'assets — « Rien à faire. » quand elle est vide), l'état git (commits
à pousser, retard, dernier commit, fichiers modifiés), la version du jeu du
site contre celle du client installé, les bannières actives et à venir avec
ce que la table du jeu sait de plus, les codes promo qui expirent sous sept
jours. Il montre et renvoie, il ne fait rien : chaque item de l'inbox ouvre
sa page de l'ADMIN dans un nouvel onglet (`ADMIN_BASE`,
`https://outerpedia.local` d'office) tant que quick n'a pas la section — le
lot qui la porte ajoute sa ligne à `ADMIN_TO_QUICK` d'`actions.ts`. Portage
PARTIEL de la home admin : sa `PatchCard` est l'étape 21, sa couverture
éditoriale suivra les éditeurs ; l'admin garde donc sa home), Patch (= la
chaîne de `pnpm dev` et la `PatchCard` de la home admin, étape 21, lot C10 :
quatre gestes lancés de quick, chacun une commande du dépôt, sa sortie ligne
à ligne dans la console de la section — « Rafraîchir depuis le jeu »
(`pnpm datagen:patch`, source Steam ou Android, `--force`, `--no-pull`,
`--collect`, `--news` : pull, dump si le code a changé, extract, build,
promote en DRY), « Dry-run » (`pnpm datagen:promote`, la revue par fichier et
par entité, qui reste à l'écran), « Promouvoir » (`--apply`, allumé seulement
après un dry-run réussi dans la page, sans boîte de confirmation — le
dry-run EST la revue, décision Sevih ; la garde perso de `promote.ts` tient),
« Committer » (`pnpm commit --no-push`, message et bump) ; le push reste
« Pousser ». Un seul travail à la fois, le verrou de l'admin
(`acquirePatchJob`), que « Pousser » prend aussi ; « Arrêter » coupe le
travail en cours. Portage de la `PatchCard` COMPLET côté gestes, mais son
lien reste dans l'admin tant que le cycle n'a pas été joué une fois dans
quick — cf. TODO ; la revue par entité et l'intégration, étapes 19 et 20,
restent dans l'admin).
Publication : Codes promo (= Tools › Promo code ; lien retiré du menu admin le
08/10 — quick ajoute et supprime un code, mais ne RETOUCHE pas un code
existant, période ou récompenses : supprimer puis recréer, ou lot A pour
l'ajouter), Bannières (= Tools › Banner, étape 5, lot B35 : la liste de
`banner.json` éditée en place et, au-dessus, la détection dans la table du jeu
`RecruitGroupTemplet` — ce qui manque s'insère d'un clic, une fin différente
s'aligne ; lien retiré du menu admin le 08/10), Journal du site (= Tools ›
Changelog, étape 7, lot B37 : `changelog.json` édité entrée par entrée — une
ligne pliée, sa fiche dépliée —, une entrée nouvelle posée par GABARIT
(`src/lib/admin/changelog-templates.ts` : un par type, textes tirés de
l'historique, le perso cherché dans le roster donne le titre en six langues,
la puce et le slug), « Traduire » par entrée, et sous la fiche l'APERÇU de la
carte de `/changelog` dans la langue choisie ; lien retiré du menu admin le
08/10), 4-comics, Vidéos, Discord.
Données : Rangs, Tables du jeu (= Tools › Game data, étape 8, lot B38 : les
tables brutes de `.gamedata/parsed/`, en lecture seule — un champ de recherche
à la place de la liste latérale, ses suggestions rangées par USAGE : les
tables que le code lit d'abord, avec les fichiers qui les lisent et la
première ligne de leur docblock, déduits d'une passe sur les sources ; puis la
recherche dans la table, la pagination, les textes résolus, les liens croisés
et la ligne brute de l'admin ; lien retiré du menu admin le 08/10).
Éditeurs : Fiche perso (= Editor › Character, étape 9, lots C11, B42, B39 et
B40 — portage COMPLET —, et Editor › EE, étape 11, lot B43 : UNE section pour
tout ce que le wiki sait d'un perso, le picker de héros en tête, des
sous-onglets comme sur la fiche du site — Fiche, Pros / Cons, Synergies,
Skills, EE, Gear reco. C11 pose la coquille, le picker
partagé (`ui/hero-picker.mjs`) et le sous-onglet
Fiche : rangs PvE et PvP, rôle, paliers par transcendance, priorité de skills,
tags humains, les tags dérivés et les vidéos en lecture — un enregistrement, un
commit `chore(characters): <perso>`. Les rangs et le rôle restent AUSSI dans
la grille Rangs. B42 porte Pros / Cons et Synergies (= Tools › Pro / Con et
Tools › Synergy, étapes 4 et 3) : des textes à tags inline saisis en anglais,
leur aperçu tel que le site les rend, « Traduire » vers les cinq autres
langues, les héros d'une synergie par le picker partagé — dans la même savebar
et le même commit ; leurs liens sont retirés du menu admin le 08/10. B39 porte
Skills (= l'onglet « Skills (buff/debuff) » de l'éditeur, `CharacterKitEditor`) :
les cartes de skills du perso et leurs chips d'effets telles que l'admin les
calcule — ✕ masque une chip, « rétablir » la rend, « ＋ effet » en ajoute une
du glossaire par le picker partagé —, comptées par la même savebar ; le commit
de la fiche porte alors aussi `data/curated/character-skills.json`. B40 y
range Gear reco (= l'éditeur des recos de l'admin, jusque-là une section des
Données) : il VIT DANS LA FICHE, dernier sous-onglet, son UI telle quelle —
savebar de builds, onglets de builds, pickers, aperçu, « Traduire » — moins
son en-tête et son picker de perso, que la fiche porte ; les builds gardent
leur barre et leur commit à part, `chore(gear-reco): <perso>`, et les anciens
liens `#gear/<id>` y sont redirigés ; lien Character retiré du menu admin le
09/10. B43 y range l'EE (= l'éditeur des EE de l'admin, `EeCuratedEditor`),
entre Skills et Gear reco, éteint pour un perso qui n'en a pas : la tuile de
l'item et son second porteur, ses deux rangs — les cellules « EE base » et
« EE +10 » de la grille Rangs, qui les garde —, ses passifs en lecture, et ses
chips réglées comme celles d'un skill, la description de chaque effet montré
dessous ; le commit de la fiche porte alors aussi
`data/curated/equipment.json` ; lien EE retiré du menu admin le 09/10),
Effets (= Editor ›
Effect, étape 10, lot B41 : le catalogue des
effets rangé comme l'admin — paires buff ↔ debuff côte à côte, puis les effets
sans miroir —, sans menu latéral ; UNE recherche, jouée au serveur par la règle
de `src/lib/admin/effect-search.ts`, et chaque ligne dit quel champ a répondu ;
des filtres — nature, sans description, curés seulement, masqués ; la fiche de
l'effet choisi à droite, avec les champs de `EffectCuratedEditor` et l'extrait
en placeholder ; « ＋ effet » pour une création ; plusieurs fiches modifiées
partent en un lot, un commit ; lien retiré du menu admin le 08/10),
Monstres (= Editor › Monster, étape 12, lot C12 : le câblage des chips de
skills d'un monstre, `data/curated/monster-skills.json` — la seule chose que
l'écran de l'admin éditait. Le picker partagé, en lignes, montre d'abord les
monstres que les GUIDES désignent (543 sur les 4 848 du jeu : `bossId`,
`monsters`, `group`, `dungeons` des `meta.json`, les groupes des `config.json`
de versions, et leurs adds), chacun avec son mode · stage et le nombre de ses
guides ; « Site » élargit aux 2 451 que le site utilise ; pastilles de type,
recherche par début de mot du nom ou par id. La fiche : le monstre, ses guides
en liens, puis ses cartes de skills comme le sous-onglet Skills de la Fiche
perso — ✕ masque une chip, « rétablir » la rend, « ＋ effet » en ajoute une du
glossaire, et un MENU par chip (« sur la carte… ») la pose sur une autre carte
du kit, à la place du glisser-déposer de l'admin ; un badge dit quand un skill
est partagé par d'autres monstres. Un enregistrement, un commit
`chore(monsters): <nom> (<id>)`. Quick lit le COMMITTÉ (`data/generated/`),
pas l'extraction fraîche : il édite ce que le site montre, sans tables du jeu.
Les stats, l'intégration et les versions d'un monstre ne sont PAS de cet
écran : elles sont à l'extractor, étapes 19 et 20 ; lien Monster retiré du
menu admin le 09/10).
Outils : Noms (= Tools › Short names + Search aliases, étapes 1 et 2, lot B34,
liens retirés du menu admin le 08/10 — un onglet pour les deux, avec le verdict
« ce nom déborde-t-il ? » du site par langue).

## Ordre révisé le 08/10 (décision Sevih)

Quick devient le VRAI panneau admin : il lui faut un accueil et la chaîne
des données (détection, extraction, promotion) comme `pnpm dev` et la
`PatchCard` de l'admin les font. Les étapes 18 et 21 remontent donc juste
après les Bannières (5), avant Events :

5 Bannières (fait, B35) → 18 Tableau de bord (fait, B36) → 21 Patch (fait,
C10) → 7 Changelog (fait, B37) → 8 Game data (fait, B38) → 9 à 15 Éditeurs
(9 Character fait, C11, B42, B39 et B40 — B42 clôt aussi 3 Synergy et 4 Pro /
Con ; 10 Effect fait, B41 ; 11 EE fait, B43 ; 12 Monster fait, C12 ; 14 Gear
presets non porté et 15 Tag control fait autrement, A34) →
16 et 17 Guides →
19 et 20 Extractor (revue par entité, intégration) → 6 Events (décision Sevih
du 08/10 : tout dernier, un seul événement publié à ce jour) → 22 Clôture. La
numérotation des étapes ne change pas.

- **18 Tableau de bord** — FAIT, lot B36 (cf. « Déjà dans quick ») : un
  groupe « Accueil » en tête du menu, où l'étape 21 posera sa section.
- **21 Patch** — FAIT, lot C10 (cf. « Déjà dans quick ») : la chaîne
  `datagen/refresh.ts`, la promotion et le commit, lancés de la section
  « Patch » du groupe Accueil. Les persos non intégrés restent gardés :
  l'intégration par entité (19, 20) reste dans l'admin tant qu'elle n'est
  pas portée, et son lien reste.

## Ordre et inventaire

Chaque entrée : l'écran admin, ce qu'il contient, puis la ligne
« Agacements » à remplir (en vrac, même approximatif).

### 1. Outils simples (un lot A/B chacun, dans cet ordre)

3. **Tools › Synergy** — FAIT, lot B42 : le sous-onglet « Synergies » de la
   « Fiche perso » (cf. « Déjà dans quick »). L'entrée reste pour que la
   numérotation ne bouge pas.
   liste + fiche `[id]`
   - Agacements : ça devrais etre dans l'editor de character — corrigé : une
     carte par groupe dans la fiche du perso, ses héros choisis dans le picker
     partagé (en multi) au lieu d'une saisie par nom, la raison avec son aperçu.

4. **Tools › Pro / Con** — FAIT, lot B42 : le sous-onglet « Pros / Cons » de
   la « Fiche perso » (cf. « Déjà dans quick »). L'entrée reste pour que la
   numérotation ne bouge pas.
   liste + fiche `[id]`
   - Agacements : ça devrais etre dans l'editor de character — corrigé : les
     deux listes côte à côte dans la fiche du perso, chaque ligne avec son
     aperçu dessous (plus d'onglet Pros / Cons ni de clic pour éditer).

5. **Tools › Banner** — FAIT, lot B35 : l'onglet « Bannières » (cf. « Déjà
   dans quick »). L'agacement de Sevih (« on devrait pouvoir détecter les
   bannières actives et faire des auto-insertions ») y est corrigé par la
   détection dans `RecruitGroupTemplet`. L'entrée reste pour que la
   numérotation des suivantes ne bouge pas.

6. **Tools › Events**
   `EventsEditor` (451 l.)
   - Agacements :

7. **Tools › Changelog** — FAIT, lot B37 : l'onglet « Journal du site »
   (cf. « Déjà dans quick »). Les deux agacements de Sevih y sont corrigés :
   « on a énormément de messages qui se ressemblent et que l'on pourrait
   préremplir » par les gabarits, « pas de preview de la news » par l'aperçu
   sous la fiche. L'entrée reste pour que la numérotation des suivantes ne
   bouge pas.

8. **Tools › Game data** — FAIT, lot B38 : l'onglet « Tables du jeu »
   (cf. « Déjà dans quick »). Les deux agacements de Sevih y sont corrigés :
   « mettre en avant les tables que l'on utilise réellement, avec un petit
   texte pour l'utilité de la table » par l'usage déduit des sources (les
   tables lues d'abord, leurs lecteurs, la première ligne de leur docblock),
   « une grande liste de fichiers qui prend de la place » par le champ de
   recherche et ses suggestions. L'entrée reste pour que la numérotation des
   suivantes ne bouge pas.

### 2. Éditeurs (curation ; un lot B chacun)

9. **Editor › Character** — FAIT, lots C11, B42, B39 et B40 : la section « Fiche
   perso » (cf. « Déjà dans quick »). Faits : la coquille à sous-onglets, le
   picker de héros partagé, le sous-onglet Fiche (les champs de
   `CharacterCuratedEditor`, vidéos en lecture), puis Pros / Cons et Synergies
   (B42, les étapes 3 et 4, que Sevih voulait « dans l'editor de character » :
   `EditorialEditor` de l'admin), puis Skills (B39 : `CharacterKitEditor` —
   masquer ou ajouter les chips d'un kit), puis Gear reco (B40 : la section
   des Données devenue le dernier sous-onglet, son UI intacte). Le lien
   Character de l'admin est retiré avec B40 ; l'entrée reste pour que la
   numérotation des suivantes ne bouge pas.
   - Agacements : ui pas joli et compact (et on a deplacer le gear reco) —
     corrigé pour la Fiche par deux cartes aérées, « Rangs » et « Kit », au
     lieu de la grille serrée de l'admin ; le gear reco est revenu dans la
     fiche avec B40.

10. **Editor › Effect** — FAIT, lot B41 : l'onglet « Effets » (cf. « Déjà
    dans quick »). Les deux agacements de Sevih y sont corrigés : « une
    recherche text qui match sur je ne sais pas quoi (genre j'ecrit "tes" et
    j'ai increased speed qui sort) » par la règle par DÉBUT DE MOT, qui nomme
    le champ trouvé (l'admin en profite : c'est son module), « le side menu
    sert a rien » par son retrait — le catalogue est la liste. L'entrée reste
    pour que la numérotation des suivantes ne bouge pas.

11. **Editor › EE** — FAIT, lot B43 : le sous-onglet « EE » de la « Fiche
    perso » (cf. « Déjà dans quick »). L'entrée reste pour que la numérotation
    des suivantes ne bouge pas.
    `EeCuratedEditor`
    - Agacements : ça devrais limite etre une tab dans l'edition du personnage vu qu'un EE est lié a un ou deux perso max — corrigé : l'EE est un
      sous-onglet de la fiche de SON perso (un core-fusion `27…` a le sien ;
      l'EE d'un `20…` dit « porté aussi par » son pendant), plus une liste de
      129 EE à part.

12. **Editor › Monster** — FAIT pour l'ÉDITEUR, lot C12 : l'onglet
    « Monstres » (cf. « Déjà dans quick »). L'entrée reste pour que la
    numérotation des suivantes ne bouge pas.
    `MonsterKitEditor`
    - Correction de l'inventaire (lecture du code, 09/10) : l'écran
      « Editor › Monster » n'édite QU'UNE chose, le câblage des chips
      (`chipOwner`, `chipHide`, `chipAdd` de `monster-skills.json`).
      `MonsterStatsCard` (les stats, en lecture) et `MonsterActions` (Save =
      `integrateMonster`, « Version » = `versionMonster` puis le
      ré-épinglage des guides) vivent dans la page EXTRACTOR du monstre :
      ils étaient rangés ici à tort, ils sont aux étapes 19 et 20.
    - Agacements : c'est le bordel (surtout la partie versionnage). et de plus on devrait mettre en avant ceux utiliser dans les guides plutot que tous. ce que je veux dire c'est que l'on a quoi 100 guide donc pas sur que avoir les data de tout les monstres dans l'editor soit pertinent. — corrigé
      pour l'éditeur : le picker ouvre sur les 543 monstres que les 150
      guides désignent, « Site » élargit ; le câblage se fait par un menu sur
      chaque chip, carte par carte, sans glisser-déposer. Le VERSIONNAGE
      n'est pas porté : il n'est pas « une version par mode » (une variante
      de mode ou de difficulté est un AUTRE id — 4 848 monstres, 426 noms)
      mais des archives figées `monster-archive/<id>@<n>.json` puis
      l'épinglage `bossId@n` des guides (trois archives sur le disque, zéro
      épinglage au 09/10). Note pour 19-20 : versionnage à repenser — les
      archives et l'épinglage en UN geste qui montre les guides touchés
      AVANT de figer.

13. **Editor › Item**
    `ItemCuratedEditor`, `ItemsBrowser`
    - Agacements :

14. **Misc › Gear presets** — NON PORTÉ, décision du 09/10 (lot A34) : la
    raison est l'agacement lui-même, l'écran ne sert plus. La page
    `/admin/gear-presets` et `GearPresetsEditor` restent tels quels jusqu'au
    retrait de l'admin (étape 22), le lien est retiré du menu ;
    `data/curated/gear-presets.json` s'édite à la main (ou par la page, par
    son URL), et l'aide de Gear reco dans quick le dit. L'entrée reste pour
    que la numérotation des suivantes ne bouge pas.
    `GearPresetsEditor` (318 l.)
    - Agacements : c'etait surtout utile quand j'ai refait le site mais maintenant pllus vraiment

15. **Misc › Tag control** — FAIT autrement (lot A34) : le contrôle est le
    test, bloquant dans `pnpm commit` ; lien retiré. `tag-control.test.ts`
    fait échouer `pnpm test` dès qu'un tag inline n'a pas de correspondance,
    et `pnpm commit` joue `pnpm test` avant tout effet de bord (`scripts/commit.ts`,
    « contrôle : test »). La page `/admin/tags` reste, par son URL, pour le
    diagnostic tag par tag ; l'inbox du tableau de bord y renvoie toujours,
    sauf quand tous les tags morts viennent d'un même perso — elle ouvre alors
    sa fiche dans quick, au sous-onglet qui porte le texte. L'entrée reste
    pour que la numérotation des suivantes ne bouge pas.
    page `tags`
    - Agacements : ça ça devrais plus etre dans le pnpm commit en bloquant (on refuse de livrer si des tag ne sont pas valide) que dans les outils d'admin — c'était
      déjà le cas, rien à porter.

### 3. Guides (lot F, en plusieurs écrans si besoin)

16. **Guide editor › Overview + catégories de boss**
    `GuideEditor` (989 l.) : joint-challenge, special-request, irregular-extermination, adventure-license ; `InlineTextField`, traduction, vidéos
    - Agacements : deja certaines categorie n'existe plus (genre les AL ou monad gates)

17. **Guides généraux**
    `PremiumLimitedEditor`, `EditorialEditor`, `FreeHeroesEditor`
    - Agacements : ui pas pratique

### 4. Extractor (plusieurs lots, en dernier)

18. **Home admin : boîte de réception** — FAIT, lot B36 : l'onglet
    « Tableau de bord » (cf. « Déjà dans quick »). La ligne « Agacements »
    était vide : l'inbox est portée telle quelle. L'entrée reste pour que la
    numérotation des suivantes ne bouge pas.

19. **Extractor › revue par entité**
    `ExtractorReview`, `EntityDiffPanel`, `DiffHighlight`, `EntitySwitch` — Character, Effect, EE, Weapons, Amulet, Armor, Talisman, Sets, Monster, Item ; pour un monstre, `MonsterStatsCard` (ses stats, en lecture — cf. la correction de l'étape 12)
    - Agacements :

20. **Extractor › intégration**
    `IntegrateCharacterButton`, `IntegrateGearButton`, `IntegrateModeButton`, `AcceptTargetButton`, `ContributionImport` ; pour un monstre, `MonsterActions` (Save, « Version » — cf. la correction de l'étape 12)
    - Agacements : (reporté de l'étape 12 — « c'est le bordel, surtout la
      partie versionnage ») versionnage à repenser : les archives et
      l'épinglage en UN geste qui montre les guides touchés AVANT de figer.

21. **Patch : lanceur et journal** — FAIT, lot C10 : la section « Patch »
    (cf. « Déjà dans quick »). La ligne « Agacements » était vide : les
    gestes de la `PatchCard` sont portés tels quels, plus le rafraîchissement
    que seul `pnpm dev` lançait. L'entrée reste pour que la numérotation des
    suivantes ne bouge pas.

### 5. Clôture

22. **Retirer `/admin` du site**
    routes `.dev`, composants, `api/admin` devenus inutiles — un lot, quand
    1 à 21 sont faits
    - Agacements :
