# Audit — portraits animés `portrait-fx-*` (constats P1–P10)

> Fait le **2026-10-03** (lot F4, agent Fable). Le lot que l'[audit
> transverse](./transverse.md) du 07/09 avait laissé en « Non couvert » : le
> moteur WebGL des portraits animés — `portrait-fx.ts` (245 l.),
> `portrait-fx-gl.ts` (1 197 l.), `portrait-fx-sim.ts` (689 l.) — son montage
> `AnimatedPortrait.tsx`, ses voisins `Portrait.tsx`, `SettingsPortrait.tsx`,
> `CharacterPortrait.tsx`, `portrait-canvas.ts`, `portrait-layout.ts`, et côté
> données `datagen/assets/extract-portrait-fx.py` avec ce qu'il produit
> (`portrait-fx.json`). **Aucun code modifié** : c'est un audit.
>
> **Méthode** : lecture complète des neuf fichiers ; la table générée passée au
> script (`node -e`, puis les vraies fonctions de `portrait-fx-sim` sous `tsx`) ;
> le bundle `prefabs/character/ui_effect` relu en lecture seule avec UnityPy
> pour ce que l'extraction aplatit ou ignore ; les en-têtes du bucket au
> `curl` ; et une **mesure à l'écran** — Firefox 156 sans tête (profil jetable,
> WebDriver BiDi, WebGL2 réel) sur `/dev/AnimatedPortrait` du serveur déjà
> ouvert sur :3000, avec une sonde passive (contextes créés, événements de
> perte, appels à `requestAnimationFrame` par nom de callback).
>
> **Pas pu faire** : Chrome et Safari (aucun des deux sur ce poste — or les
> faits « mesurés » de l'en-tête de `portrait-fx-gl` le sont sur Chrome/ANGLE),
> un vrai téléphone, une comparaison image contre le jeu. Ce qui en dépend est
> marqué « à confirmer ».
>
> **Suites** (détail dans [DONE.md](../DONE.md)) : P1 et P5 traités par
> l'observateur partagé (lot F8, 03/10), P4 par les tests et le contrat de
> la table (lot B15), P2 par le plafond des textures à 512 (lot F9) puis par
> le contexte WebGL partagé, qui emporte aussi P6 (lot F11, 05/10 — plus de
> plafond de contextes, plus d'éviction ; les passages du rapport qui les
> décrivent valent pour l'état du 03/10), P3 par les graines partagées (lot
> F10). Restent ouverts : P7, P8, P10, et de P9 les compteurs hors des
> fichiers réécrits.

## État de référence

| Contrôle                                                           | Résultat                                                              |
| ------------------------------------------------------------------ | --------------------------------------------------------------------- |
| Effets extraits / lignes `byCharacter`                             | 10 / 28 — aucun nom d'effet sans prefab extrait                       |
| Refus du moteur sur la table du jour (mots-clés, blend, émetteurs) | 0 — au script, et console muette sur 27 canvas à l'écran              |
| `portrait-fx.json`                                                 | 518 Ko, 22 Ko gzip — chunk paresseux, réglage ÉTEINT par défaut       |
| Contextes créés au chargement (27 canvas, 4 à l'écran)             | 4                                                                     |
| Contextes vivants au repos, après défilement de toute la page      | 8 (= `LIVE_CAP`) ; pic transitoire 11                                 |
| Boucles `draw` par seconde                                         | 60 × cartes à l'écran ; 0 quand aucune ne l'est                       |
| `prefers-reduced-motion`                                           | 1 image par carte, puis 0 ; aucun double montage                      |
| Carte évincée qui revient à l'écran                                | ressuscitée (4 sur 4, deux passes)                                    |
| CORS du bucket (`img.outerpedia.com`)                              | `access-control-allow-origin: *` avec ET sans `Origin`                |
| Tests                                                              | `portrait-layout.test.ts` (9) ; rien sur sim, gl, canvas, ni la table |

## Verdict

**Sain, et mieux tenu que la moyenne du repo.** Le cycle de vie fait ce que
ses commentaires disent : un contexte n'est créé qu'à l'entrée à l'écran, la
boucle s'arrête hors écran et sous `prefers-reduced-motion`, le plafond de
contextes tient au repos, une carte évincée ressuscite, tout ce qui vit dans
le GPU se reconstruit depuis des caches CPU, les courses chargement/démontage
sont gardées (`disposed`), et le repli quand WebGL manque est le `<img>` de
`Portrait`, intact sous le canvas. Le réglage est éteint par défaut et le
moteur part dans un chunk paresseux : personne ne paie sans l'avoir demandé.
**Aucun constat Haute.**

Quatre constats Moyenne, de trois natures : une **course** entre l'éviction et
le remontage (P1), un **coût mémoire** que la carte ne laisse pas deviner (P2),
un **écart au jeu** que les commentaires nient (P3), et un **angle mort de
tests** sur une table que le pipeline régénère seul (P4).

---

## Moyenne

### P1 — Évincée et remontée dans la même image, une carte reste éteinte · course

[`AnimatedPortrait.tsx:171-198`](../../src/components/character/AnimatedPortrait.tsx),
[`portrait-fx-gl.ts:1114-1125`](../../src/components/character/portrait-fx-gl.ts).

Chaque carte a SON `IntersectionObserver`, et les callbacks d'une même image
s'exécutent à la suite, dans l'ordre du DOM. Quand une carte évincée (B) et une
carte vivante mais hors écran (A, plus bas dans le DOM) entrent ensemble :
le callback de B monte son effet, `evict()` cherche une victime — A porte
encore `onScreen = false`, son callback n'a pas tourné — et lui retire son
contexte (`loseContext`). Le callback de A suit **dans la même tâche** :
`!fx`, donc `mountPortraitFx`, donc `restoreContext()`… avant que l'événement
`webglcontextlost` ait été distribué (la spec le met en file). Or l'en-tête du
module le dit lui-même, fait mesuré n° 2 : « `restoreContext` est MUET si
`webglcontextlost` n'a pas été annulé ». À cet instant il ne l'est pas encore.
La session attend alors un `webglcontextrestored` qui ne viendra pas : la carte
est à l'écran, statique, et le reste tant qu'elle n'a pas refait un cycle
complet d'éviction (`fx` est posé, rien ne la remonte).

Le scénario n'a rien d'exotique : dépasser huit cartes animées en descendant,
puis revenir d'un saut (touche Début, retour arrière qui restaure le scroll,
molette rapide) sur une rangée dont une partie a été évincée.

Vérifié : chemin lu en entier ; scénario **reproduit** sur
`/dev/AnimatedPortrait` (descente douce jusqu'à l'éviction des cartes 0 et 1,
saut sur leur rangée : les cartes 2 et 3, vivantes, sont bien évincées PUIS
remontées dans la même image — quatre `lost` et quatre `restored` relevés).
Firefox 156 **tolère** l'ordre et restaure quand même. **À confirmer sur
Chrome** : le refus s'y déduit de la spec `WEBGL_lose_context` et du fait n° 2
de l'en-tête, pas d'une mesure — pas de Chrome sur ce poste.

Correctif : (1) un observateur PARTAGÉ pour toutes les cartes — un seul
callback par image, qui met à jour tous les `onScreen` d'abord, monte ensuite,
évince une fois à la fin ; la victime ne peut plus être une carte qui entre.
Règle aussi P5. (2) En ceinture, dans `onLost` de `portrait-fx-gl` :
`setTimeout(() => !disposed && gl.isContextLost() && LOSE_EXT.get(canvas)?.restoreContext(), 0)`
— un `restoreContext` rejoué APRÈS la distribution de l'événement (pas dans
l'écouteur, ni en microtâche : le drapeau n'est levé qu'au retour du dispatch).

### P2 — Chaque carte tient sa propre copie de toutes ses textures : 18 Mo de GPU pour une carte `_Demi` · coût

[`portrait-fx-gl.ts:674-705`](../../src/components/character/portrait-fx-gl.ts)
(`upload`), `:1154-1165` (chargement par montage),
[`AnimatedPortrait.tsx:46`](../../src/components/character/AnimatedPortrait.tsx)
(`LIVE_CAP = 8`).

Un contexte WebGL ne partage rien : chaque carte vivante recharge, décode et
monte ses textures en `RGBA8`/`SRGB8_ALPHA8` non compressé. Pour `_Demi` —
l'effet de **16 personnages** sur 28 — la table donne 8 textures, 18,0 Mo, dont
**16 pour une seule** : `T_FX_Crystal_001_A`, 2048×2048 sans mips, qui n'est
que le `_SecondTex` du calque `inner` (`st = [1,1,0,0]` : étirée UNE fois sur
une carte large de 80 à 152 px CSS). Huit cartes `_Demi` vivantes = 144 Mo de
textures, pour des vignettes ; les autres effets pèsent 3,5 à 9,9 Mo par
carte. Et le plafond n'est pas un maximum : le premier écran de `/characters`
trié par sortie porte 12 cartes animées sur 28 (calcul sur la table, ids
décroissants), toutes visibles, donc toutes vivantes (cf. P5).

Côté réseau, le premier passage d'une carte `_Demi` télécharge 1 127 Ko de WebP
sans perte, dont 887 Ko pour cette seule texture (cache navigateur : un jour).

Les cibles de rendu, elles, sont petites (carte de 152 px : ~304×582 en
`RGBA16F`, débord compris 1,5 à 2,8 Mo à dpr 1) — le coût est dans les
textures, pas dans le remplissage.

Vérifié : tailles, mips et usages lus dans `portrait-fx.json` ; poids des
fichiers dans `.assets-staging` et au `curl` sur le bucket ; montage par
contexte lu. **À confirmer sur appareil** : la mémoire réellement prise par le
pilote, et ce que fait un téléphone à ce régime (perte de contexte, onglet
tué) — non mesuré.

Correctif, deux étages. Court : plafonner la taille à l'extraction (2048 → 512
ramène `_Demi` de 18 à ~3 Mo et son téléchargement d'un ordre de grandeur) —
c'est un **arbitrage de fidélité** pour Sevih : le jeu échantillonne le
niveau 0 d'une 2048 sur ~250 px, une 512 pré-réduite sera plus lisse ; à
comparer sur `/dev/AnimatedPortrait`. De fond : UN contexte partagé pour
toutes les cartes (rendu hors écran, report par `drawImage` dans un canvas 2D
par carte) — une seule copie de chaque texture, plus de plafond, plus de
perte/résurrection ; il emporte P1, P5 et P6, mais c'est un chantier.

### P3 — Les étoiles et leurs halos sont tirés séparément ; le jeu leur donne la même graine · écart au jeu

[`portrait-fx-gl.ts:613-615`](../../src/components/character/portrait-fx-gl.ts)
(`Math.random()` par émetteur),
[`portrait-fx-sim.ts:52-53`](../../src/components/character/portrait-fx-sim.ts),
`:394`.

Deux commentaires affirment que « `autoRandomSeed` est VRAI sur ces
émetteurs », donc qu'une graine par montage est conforme. Le bundle dit
l'inverse pour **huit émetteurs de cinq effets** : `star` et `star (1)` de
`_2000093`, `_2000110`, `_2000114`, et `star (1)` de `_2000106` et `_2000121`
portent `autoRandomSeed = false`, `randomSeed = 0`. Sur les trois premiers,
les deux émetteurs sont des JUMEAUX — même forme, même cadence (10/s), même
vie, même vitesse, même frein, même bruit, même rotation ; seuls la taille et
le matériau diffèrent (l'étoile nette, son halo). Avec la même graine fixe,
Unity leur fait tirer la même suite : chaque étoile naît SOUS son halo. Ici,
deux graines indépendantes : 25 étoiles et 25 halos sans rapport.

Vérifié : `autoRandomSeed`/`randomSeed` lus dans le bundle (l'extraction ne
les publie pas) ; à graine commune, `createBillboardSim` superpose bien les
deux émetteurs (écart moyen 1,7 unité sur une carte de 180, contre 98 avec
deux graines — les deux consomment leurs tirages dans le même ordre). **À
confirmer en jeu** : que les paires y coïncident vraiment — déduit de la
sémantique d'Unity, pas d'une capture.

Correctif : publier `autoRandomSeed` et `randomSeed` dans la table ;
`mountPortraitFx` tire UNE graine par montage et par `randomSeed` fixe, que
les émetteurs concernés partagent ; corriger les deux commentaires.

### P4 — 2 100 lignes de moteur sans un test, et aucun contrat sur la table que le pipeline régénère · tests

`portrait-fx.ts`, `portrait-fx-sim.ts`, `portrait-fx-gl.ts`,
[`extract-portrait-fx.py:102-103`](../../datagen/assets/extract-portrait-fx.py)
(`DEFAULT_EFFECTS`), `datagen/refresh.ts:304-309` (l'étape).

Le seul test du lot est `portrait-layout.test.ts` (la géométrie statique).
`portrait-fx-sim` est pourtant PUR et se teste sans navigateur : `evalGradient`
(Blend/Fixed), `evalCurve` (Hermite, pente infinie), `frameAge` (rebouclage),
`isQuadLayer`, `unsupportedBillboard`, `createBillboardSim` (déterminisme à
graine donnée, plafond `maxParticles`, prewarm), `fxBleed`.

Plus important : l'extraction tourne dans `refresh` à chaque patch, sa sortie
est committée, et rien ne la confronte à ce que le moteur sait rendre. Deux
pannes passent en silence — le moteur refuse en `console.error`, la carte
reste un portrait normal : (a) le jeu ajoute un effet (`_2000125`) :
`byCharacter` le nomme, `DEFAULT_EFFECTS` — une liste en dur — ne l'extrait
pas, `fxOf` rend `undefined`, et le script n'imprime aucun avertissement ;
(b) un matériau gagne un mot-clé non transcrit, ou un émetteur un module
refusé. Aujourd'hui : 0 cas (vérifié au script sur les 10 effets et les 28
lignes).

Vérifié : `grep` des fichiers de test ; lecture de `extract()` et `main()`.

Correctif : un `portrait-fx.test.ts` de CONTRAT sur la table committée — tout
nom de `byCharacter` a son prefab (ou figure dans une liste explicite « pas
encore servi »), tout émetteur actif est accepté, toute texture citée a sa
fiche, `colorSpace === 'linear'`, indices de maille < 65 536. Il suppose de
sortir de `mountPortraitFx` (`:524-622`) la décision « rendable ou refusé » en
fonction pure — ce qui règle aussi P6. Plus les tests unitaires du simulateur,
et une ligne d'avertissement dans le script pour (a).

## Basse

- **P5 — Le plafond de 8 se dépasse, et l'observateur ne lit que sa première
  entrée** · `AnimatedPortrait.tsx:67-78`, `:172`. Transitoirement : pic
  **mesuré à 11** contextes vivants en remontant (les cartes qui entrent
  montent avant que celles qui sortent, plus bas dans le DOM, aient été
  marquées hors écran). Durablement : dès que plus de huit cartes animées
  sont à l'écran, par construction (12 sur `/characters` trié par sortie).
  Sans gravité sur ordinateur (le navigateur en tient « une quinzaine », dit
  l'en-tête) ; **à confirmer sur mobile**, où sa limite n'a pas été relevée. Et `([e]) =>` ne garde que la PREMIÈRE
  entrée d'un lot : si deux franchissements s'accumulent avant le callback,
  c'est l'état le plus ancien qui est retenu (carte visible figée, ou boucle
  qui tourne hors écran, jusqu'au franchissement suivant). Correctif :
  l'observateur partagé de P1, en lisant la dernière entrée par cible.
- **P6 — Les sorties d'échec laissent un contexte vivant et une entrée
  fantôme** · `portrait-fx-gl.ts:485`, `:629-632`, `:1126-1132` ;
  `AnimatedPortrait.tsx:174-187`. `getContext` est appelé AVANT de savoir si
  un calque est rendable : « aucun calque rendable » et l'échec de `buildGL`
  rendent `NO_FX` sans perdre le contexte créé, que plus personne ne libère.
  `NO_FX` étant une poignée comme une autre, la carte entre dans `live`,
  compte dans le plafond, et — évincée — retente et relogue son refus à
  chaque retour à l'écran (cas WebGL2 absent : une erreur console par carte
  et par passage). Latent : aucun effet du jour n'y tombe. Correctif :
  préparer les calques avant `getContext` ; ne pas inscrire un `NO_FX`.
- **P7 — « Refuser plutôt que rendre de travers » a des trous** ·
  `portrait-fx-sim.ts:302-328`, `portrait-fx-gl.ts:544-573`,
  `extract-portrait-fx.py:456-459`, `:496-524`, `:540-554`, `:604-609`.
  Acceptés sans contrôle : sur un calque-maille, tout (rotation du nœud,
  `startRotation`, absence de ring buffer — `frameAge` laisse « à l'appelant
  de cesser de dessiner », l'appelant ne le fait pas —, couleur aléatoire
  rendue au milieu) ; sur un billboard, `simulationSpeed ≠ 1` (ignoré par la
  simulation, honoré par `frameAge`), les modes courbe des scalaires de départ
  (`mmScalar` les prend pour des constantes), un BoxShell non plat, la
  rotation de la forme, un bruit défilant (`scrollSpeed`), `startFrame`. Côté
  extraction : `rateOverTime`, `gravityModifier` et le compte des rafales
  réduits à leur scalaire sans leur mode, seuls les enfants DIRECTS du prefab
  lus, et tout module hors des sept publiés ignoré — là où `min_max_gradient`,
  lui, casse sur un mode inconnu. Vérifié sur la table ET le bundle : aucun de
  ces cas n'est actif aujourd'hui (pas de petit-enfant, pas de module hors
  liste, tous les modes à 0 ou 3, formes plates, 210 clés de courbe dont 0
  pondérée). Correctif : compléter les deux gardes, faire lever l'extraction.
- **P8 — `by_character()` rend `{}` si la table parsée manque** ·
  `extract-portrait-fx.py:573-574`. Lancé sans
  `.gamedata/parsed/CharacterExtraTemplet.json`, le script réécrit le JSON
  avec 0 ligne : plus aucun perso n'a d'effet. Le `colorSpace`, lui, a reçu
  le traitement « préserver plutôt que dégrader » pour exactement cette
  raison. Se voit au diff ; correctif : même préservation, ou lever.
- **P9 — Des commentaires ont décroché du code** · l'en-tête de
  `extract-portrait-fx.py:44-49` explique « pourquoi du PNG et pas du WebP » et
  que « la clé du manifest porte `.png` » : elle porte `.webp`, sans perte
  (`manifest.ts:390-393`, `images.ts:193`). Compteurs périmés : « 25
  personnages sur 124 » (`portrait-fx.ts:7`, `:191`, `AnimatedPortrait.tsx:8`,
  `Portrait.tsx:249`, « 99 sur 124 » `:302`, « les 25 lignes »
  `extract-portrait-fx.py:564`) pour 28 lignes et 128 persos ; « quinze
  personnages portent `_Demi` » (`AnimatedPortrait.tsx:37`) pour 16 ; « les
  huit effets restants » (`portrait-fx.ts:228`) alors que les dix sont
  servis ; `refresh.ts:295-299` (« 9 effets », « dix du bundle », « 38
  textures ») pour 10, 11 et 40. Le script le disait : « les compter ici
  pourrirait ». Correctif : retirer les nombres, garder la règle.
- **P10 — Coût par image, sans effet mesuré** · `portrait-fx-gl.ts:303`,
  `:919-921`, `:1035-1072`. Un tirage et ~9 appels GL par particule (jusqu'à
  56 particules sur `_2000110` et `_2000114`), des tableaux et fermetures
  alloués à chaque image, `clientWidth`/`clientHeight` relus à chaque image
  par carte, et `SUPERSAMPLE = 2` même à dpr 2 (16 fragments par pixel CSS, là
  où la densité de l'écran fait déjà l'anticrénelage). 60 images/s tenues sur
  six cartes en mesure (GPU intégré, dpr 1). **À confirmer sur mobile.**
  Leviers si besoin : `SUPERSAMPLE = 1` dès dpr ≥ 2, un `ResizeObserver`,
  l'instanciation des billboards.

## Dette

- `fxBleed` est recalculé à chaque rendu d'`AnimatedPortrait` puis à chaque
  montage (`portrait-fx-gl.ts:508`) — moins de 0,1 ms mesuré : un cache par nom
  d'effet suffirait, sans urgence.
- La table embarque ce que le client ne lit pas (`bundle` de chaque texture,
  `renderQueue`, une quarantaine de flottants de stencil et de mots-clés
  doublés) ; `sortingFudge` est publié mais absent du type `FxEmitter` ;
  `PORTRAIT_FX` est un `as unknown as FxTable` sans validation de forme.
- `byCharacter` vit dans `portrait-fx.json` « provisoirement, pour une page
  /dev » (`extract-portrait-fx.py:568-571`) : l'effet est en production
  derrière un réglage, la place annoncée (`characters.json`) est due.
- `link()` ne détache ni ne supprime les shaders après l'édition de liens, et
  ne supprime pas un programme refusé — libérés avec le contexte.
- `uTime` croît sans borne : après ~24 h d'animation continue, la précision
  `float` des UV défilantes n'est plus que d'un texel. Le jeu a le même `_Time`.

## Zones lues et jugées saines

Création paresseuse des contextes, arrêt hors écran, onglet caché
(`visibilitychange` → `setRunning`, lu), démontage (`destroy` : boucle
annulée, écouteurs retirés, contexte rendu) · `prefers-reduced-motion` : une
image, et elle n'est jamais vide — l'alpha des calques de cadre est CONSTANT
sur la vie (0,39 à 1,00 selon l'effet), les billboards sont prewarmés (5 à 33
particules à t = 0) · perte spontanée et restauration (`buildGL` depuis les
caches CPU, `elapsed` conservé) · courses chargement/démontage et
chargement/perte (`disposed`, `live`, `decoded`) · repli `<img>` · CORS :
l'art est demandé deux fois (le `<img>` sans CORS, le canvas avec) et
l'en-tête `*` est servi dans les deux cas, donc pas d'empoisonnement de cache ;
le bucket met bien en cache (`MISS` puis `HIT`) · chunk paresseux et réglage
éteint par défaut (`SettingsPortrait.tsx`) ; aucun canvas au SSR en prod ·
`pct()` (hydratation) · `evalCurve` : 210 clés, aucune pondérée, l'Hermite est
donc exact · choix de la cible linéaire et repli de format · WebP sans perte
de bout en bout (`stage.ts:342`) · extraction : `colorSpace` préservé, mode de
dégradé inconnu = erreur, mailles via `MeshHandler` · `portrait-canvas.ts`
(images chargées en CORS par l'appelant, polices locales en un fichier donc
`document.fonts.load` suffit, calque manquant sauté) · `portrait-layout.ts` et
ses 9 tests.

## Non couvert

La FIDÉLITÉ au jeu : le fragment n'a pas été recollationné avec le GLSL du
bundle `shader/common`, ni l'étalonnage (double linéarisation, occlusion
prémultipliée) comparé à une capture ; les trois approximations déclarées du
simulateur (bruit, frein, `size3D`) sont prises telles quelles · Chrome,
Safari et le mobile réel (cf. en-tête) · `/dev/AnimatedPortrait/page.dev.tsx`
(dev-only, survolé) · `extract-font-metrics.py` · le prefab `_Synchro`
(présent dans le bundle, `rotation3D`, non servi par le site).
