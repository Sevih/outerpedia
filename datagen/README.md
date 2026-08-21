# datagen — Atelier de données

Bibliothèque **TypeScript** qui transforme les données brutes du jeu **Outerplane**
en JSON consommé par le site. Tout est généré au **même format / mêmes valeurs**
grâce à des primitives partagées et des contrats typés.

> Objectif : remplacer l'ancien tas de scripts hétérogènes (python + TS) par **une
> seule lib cohérente**. La génération tourne **en local** ; le site (build CI)
> ne consomme que du JSON déjà committé. **Aucun python, aucun datamine dans le build.**

---

## Les 3 zones (qui vit où, et dans Git ou pas)

| Zone                      | Chemin       | Git ?        | Rôle                                           |
| ------------------------- | ------------ | ------------ | ---------------------------------------------- |
| **Code de la lib**        | `datagen/`   | ✅ committé  | L'intelligence de génération (TS)              |
| **Données finales**       | `data/`      | ✅ committé  | Consommées par l'app (le build en a besoin)    |
| **Aire de travail brute** | `.gamedata/` | ❌ gitignoré | Gros fichiers du jeu, **locaux**, régénérables |

`.gamedata/` n'est **jamais** committé (évite le bloat). Il est régénérable depuis
le jeu et sauvegardé sur **Cloudflare R2** (cf. multi-PC plus bas).

---

## Les 5 couches de la lib (`datagen/`)

```
extract/      Couche 0 — wrapper de l'extracteur Unity (AssetStudio).
              Lance l'outil sur les bundles, range la sortie. NON réécrit en TS
              (extraction d'assets = domaine spécialisé), juste piloté proprement.

templates/    Couche 1 — parse les .bytes en TEMPLATES typés du jeu.
              1 schéma TS par template (CharacterTemplet, ItemTemplet, Text*...).
              C'est la fondation : tout le reste lit des objets typés, pas du JSON brut.

lib/          Couche 2 — PRIMITIVES partagées (le cœur de la cohérence) :
              résolution de texte (Text* → string par langue), mapping ID↔nom↔slug,
              normalisation (éléments/classes/rareté → enums), calculs de stats.

generators/   Couche 3 — un générateur par artefact (characters, items, tower...),
              bâti sur les couches 1+2 → chacun produit la MÊME forme de sortie.

contracts/    Couche 4 — schémas TS des données GÉNÉRÉES (le format unique).
              La cohérence est garantie PAR LES TYPES, partagés avec l'app.

build.ts      Couche 5 — orchestration en 3 fichiers :
refresh.ts      build.ts   lance les générateurs → data/extracted/ ;
promote.ts      refresh.ts définition UNIQUE du flux « rafraîchir depuis le
                           jeu » (pull → extract → convert → build → promote),
                           partagé par `pnpm dev` et `datagen:patch` — les DEUX
                           en dry (le dev ne promeut plus auto ; l'intégration
                           se fait par entité depuis l'admin, ou promote manuel) ;
                promote.ts diff entité par entité + `--apply` → data/generated/.
```

### Modules à côté des couches

- **`extractor/`** — extracteur **déclaratif** par entité : `specs/`
  (character, monster — la description de QUOI extraire), `integrate.ts` /
  `integrate-equipment.ts` / `integrate-item.ts` (intégration ciblée d'une
  entité dans `data/generated/`, utilisée par l'admin), `version-monster.ts`
  (figer l'état committé d'un monstre).
- **`curated/`** — outillage de la couche curée : les schémas de validation
  (personnages, gear reco, tags, effets…). L'édition se fait via l'admin.

### Exception assumée : l'outillage Python

Quatre scripts échappent au « tout-TS », pour la **même** raison : lire un format
binaire spécialisé — typetrees Unity pour trois d'entre eux, tables OpenType pour
le dernier — au même titre que l'extracteur .NET de la couche 0, donc
**délibérément non réécrits en TS**.

| Script                                           | Module      | Sortie committée                                 | Ce qu'il évite                                                       |
| ------------------------------------------------ | ----------- | ------------------------------------------------ | -------------------------------------------------------------------- |
| `extract-face-layout.py`                         | `UnityPy`   | `datagen/assets/face-icon-layout.json`           | Des `FI_` absents pour les persos/skins récents                      |
| `extract-sprite-rect.py` _(2026-08-07)_          | `UnityPy`   | `datagen/assets/sprite-rect.json`                | Des sprites servis à leur taille ROGNÉE, donc décalés à l'affichage  |
| `extract-portrait-fx.py` _(câblé le 2026-08-21)_ | `UnityPy`   | `datagen/assets/portrait-fx.json` + textures PNG | 38 « sprite introuvable » à la collecte, donc un portrait sans effet |
| `extract-font-metrics.py` _(2026-08-08)_         | `fontTools` | `datagen/assets/portrait-font-metrics.json`      | Un `m_BestFit` faux, donc un nom qui déborde de sa boîte             |

Le second mérite un mot : le packer d'atlas coupe les bords transparents, et
AssetStudio n'exporte que ce qui reste. Un fichier de 111×128 pour un sprite de
128×128 — et le rognage est rarement symétrique (`MT_4031033` perd 30 px à gauche
et 0 à droite). Tout consommateur qui l'étire à la taille attendue le déforme ET
le déplace : c'est ce qui décalait le portrait dans son fond sur **232 des 515**
vignettes de monstres. Le staging repose les marges (`sprite-rect.ts`), donc
l'asset servi a la taille que le jeu lui donne et **aucun composant n'a à le
savoir**. La table est bornée à `at_thumbnailmonsterruntime` et
`at_thumbnailcharacterruntime` : le défaut est général (83 % de
`at_dungeonruntime`, 97 % de `at_thumbnailcostumeruntime`), mais élargir la liste
re-découpe tous les icônes déjà servis par cet atlas — un atlas à la fois, et
délibérément.

Le dernier arrivé mérite aussi un mot : il vivait **hors pipeline** alors que sa
sortie est committée — `manifest.ts` réclamait ses 38 textures sur toutes les
machines, mais seule celle où on l'avait lancé à la main savait les produire. Il
écrit en outre le `colorSpace` du build, que le rendu exige à `linear` (sinon il
refuse de poser l'effet). Cette valeur ne se lit que dans `globalgamemanagers`,
jadis pris d'une APK déposée à la main : **`datagen:dump` l'extrait désormais du
jeu installé** (même geste adb que la paire metadata/so), et à défaut le script
PRÉSERVE la valeur déjà committée au lieu d'écrire `unknown` — sans ce filet,
câbler l'étape aurait suffi à effacer l'effet du site depuis une machine sans
dump.

Tous quatre sont :

- **locaux** : joués automatiquement par le flux `refresh` (`pnpm dev` /
  `datagen:patch`) entre convert et build — les trois lecteurs de typetrees
  uniquement sur la machine de datamine (le refresh ne génère que si `.gamedata`
  existe) ; relançables seuls via `pnpm datagen:face-layout` /
  `pnpm datagen:sprite-rect` / `pnpm datagen:portrait-fx`. Depuis le 2026-07-14 : avant, il fallait les jouer
  à la main puis relancer dev. `extract-font-metrics.py` fait exception à
  l'exception : il lit `src/fonts/` (committé), pas `.gamedata`, donc il ne
  demande PAS de machine de datamine — juste fontTools ;
- **absents du build et de la CI** ;
- **bornés à un JSON committé** : leurs sorties sont versionnées et c'est ce que
  lisent `datagen/assets/face-icon.ts`, `datagen/assets/sprite-rect.ts` et le
  portrait. **Le serveur/build ne touche jamais Python** — d'où « aucun python
  _dans le build_ », qui reste vrai ;
- **optionnels par machine** (depuis le 2026-08-07) : `refresh` sonde l'import
  avant de lancer l'étape, et la SAUTE avec un avertissement si l'outillage
  manque — au lieu de faire échouer tout `pnpm dev`. Avoir `.gamedata`
  n'implique pas avoir l'outillage : un PC secondaire tire les bundles sans être
  outillé. Le JSON committé prend alors le relais ; seul ce qui est arrivé
  depuis manquerait sur cette machine. Pour l'outiller :
  `python -m pip install -r datagen/requirements.txt` puis
  `pnpm datagen:patch --force`. Un échec d'un script lui-même (bundle absent,
  prefab illisible) lève toujours.

  **Le sondage est PAR ÉTAPE et EN PRÉ-VOL** (depuis le 2026-08-14) : il importe
  le module dont l'étape dépend, pas un module témoin, et il le fait AVANT le
  pull. Sonder UnityPy pour tout le monde laissait passer font-metrics sur une
  machine outillée à moitié — le garde disait « bon » et le script mourait deux
  lignes plus loin, emportant `pnpm dev` avec lui. Même occasion, `refresh` force
  `PYTHONIOENCODING=utf-8` : sous Windows, python encode sa sortie en cp1252 et
  meurt sur le premier « → » de ses propres logs.

Les porter en TS reste possible (AssetStudioModCLI a un mode `-m dump`) mais non
prioritaire : cf. le fork tranché en faveur de l'isolation.

---

### Pré-vol et reprise après échec

Deux gardes distincts protègent la chaîne, tous deux rendus possibles par le fait
qu'elle est **déclarée** (`genSteps`) et non écrite en ligne droite d'appels : on
ne peut annoncer ni reprendre une étape qui n'a pas de nom.

**Pré-vol** — l'outillage python de TOUTES les étapes est sondé avant le pull, et
ce qui sera sauté est annoncé tout de suite. Sonder au moment de l'étape rendait
la réponse juste mais tardive : un module manquant se découvrait après le pull et
l'extract, soit un quart d'heure pour une information connaissable à la
seconde 0. Le verdict est calculé une fois et réutilisé par la boucle — ce qui
est annoncé est exactement ce qui se passe.

**Reprise** — `.gamedata/.refresh-checkpoint.json` est réécrit **après chaque
étape** et effacé au succès complet. Le stamp, lui, ne dit que « tout a réussi »
et n'est gravé qu'à la fin : une étape de deux secondes qui casse renvoyait à zéro
un extract de 2,2 Go déjà fait. Le checkpoint le complète, ne le remplace pas.

Ce n'est **pas** de l'incrémental, et c'est délibéré : modéliser les entrées de
chaque étape pour décider « celle-ci est à jour » demande de n'en oublier
aucune, et une entrée oubliée sert de la donnée périmée **en silence** — bien
pire que rejouer. La promesse est plus étroite et vérifiable : _mêmes entrées,
mêmes sources, on reprend où ça a cassé_. Toute autre situation jette le
checkpoint :

- `--force` = « rejoue tout », l'honorer serait contradictoire ;
- clé différente = le monde a bougé entre l'échec et la reprise.

La clé porte l'empreinte de `.gamedata/files` **et** celle des sources
`datagen/**` en `.ts`/`.py`. Cette seconde moitié est le garde qui compte : sans
elle, corriger `bytes-parser.ts` après un build cassé puis reprendre sauterait
`convert` et ferait déboguer sur du JSON périmé. Elle est bornée aux SOURCES,
jamais aux JSON du dossier — `face-icon-layout.json` & consorts sont des sorties
d'étapes, les inclure ferait changer la clé au milieu du run, donc invaliderait
le checkpoint qu'on vient d'écrire.

L'auto-réparation par le stamp reste intacte : le checkpoint est purement
additif, l'ignorer (ou l'effacer à la main) ramène au comportement d'avant.

---

## Le flux de bout en bout

```
   [ jeu : APK / bundles ]
            │  (extract/ — outil Unity, local)
            ▼
   .gamedata/extracted/  (images + .bytes)
            │  (templates/ — parser .bytes → typés, TS)
            ▼
   .gamedata/parsed/  (templates JSON typés)
            │  (generators/ + lib/ — TS, `pnpm datagen:build`)
            ├──────────────► data/extracted/   🚧 PROPOSITION (gitignoré)
            │                       │  (`pnpm datagen:promote --apply` — revue explicite)
            │                       ▼
            │                data/generated/   ✅ VALIDÉ, committé → consommé par l'app
            └──────────────► .gamedata/staging-images/  →  upload R2 → CDN
```

- **Données écrites à la main** : `data/curated/` (✅ committé).
- **Données extraites (JSON)** : `data/extracted/` (🚧 gitignoré — la proposition du build).
- **Données validées (JSON)** : `data/generated/` (✅ committé — SEULE source de l'app).
  On n'y écrit que par `pnpm datagen:promote` (diff entité par entité, `--apply`
  pour appliquer) ou par l'intégration ciblée d'un perso depuis l'admin — un
  pull de patch ne peut pas partir en prod par accident.
- **Sources éditoriales** : `data/editorial/` (✅ committé) — les assets que le
  wiki produit lui-même, absents du jeu (icônes d'effets corrigées, bannières
  de guides, drapeaux…). Ce sont des SOURCES, pas des sorties : la collecte les
  lit pour alimenter le staging, au même titre que le pool extrait du jeu.
- **Images générées** : vont sur **R2/CDN**, **jamais** dans le repo.

---

## Local vs CI

- **Génération** (rare, quand le jeu patche) : **en local**, avec `.gamedata/` rempli.
  Produit `data/extracted/` (proposition), validé via `datagen:promote` vers
  `data/generated/` (committé) + images (→ R2).
- **Build du site** (à chaque push, en CI) : consomme uniquement `data/` committé.
  **Pas de python, pas de datamine, pas d'extracteur.** Déterministe et rapide.

---

## Travailler sur 2 PC

| Tu fais quoi                        | Ce qu'il te faut          | Sur l'autre PC                                    |
| ----------------------------------- | ------------------------- | ------------------------------------------------- |
| Coder / éditer `curated/` / builder | `git` (tout est committé) | `git pull` — c'est tout                           |
| **Régénérer** (jeu a patché)        | l'aire `.gamedata/`       | la récupérer depuis **R2** (pas de ré-extraction) |
| **Publier une BD / un wallpaper**   | le pool `.editorial/`     | `pnpm editorial:pull` (puis `:push` après ajout)  |

Le quotidien est 100% git. Seule la régénération (rare) a besoin de `.gamedata/`,
qui n'est **pas** synchronisé entre machines : sur l'autre PC, on le reconstitue
par un `pnpm datagen:pull` depuis LDPlayer.

`.editorial/` (BD 4-cut + wallpapers faits main) est le seul contenu ORIGINAL du
projet : absent du jeu ET de git (binaires). Sa source de vérité est R2, préfixe
`editorial/` — `pnpm editorial:pull` / `pnpm editorial:push`, en `copy` jamais en
`sync` (union des machines, aucun transfert ne détruit un pool). **Pull avant de
publier** : `collect-comics` régénère le manifeste depuis le pool LOCAL, donc un
pool partiel amputerait la galerie (un garde-fou retient le manifeste dans ce
cas, cf. `datagen/assets/collect-comics.ts`).

---

## Récupérer les données du jeu (depuis LDPlayer)

Les bundles + il2cpp viennent du dossier `files` du jeu, sur une instance
**LDPlayer** (Android), via `adb`. Pour les rapatrier dans `.gamedata/files/` :

```bash
pnpm datagen:pull          # bundles + il2cpp
pnpm datagen:pull il2cpp   # un sous-dossier précis
```

**Le flux patch, en 4 commandes** (chaque enchaînement s'arrête à la
première erreur) :

```bash
pnpm datagen:patch           # pull → extract → convert → build → résumé du diff
pnpm datagen:promote --apply # si le résumé est cohérent : valider
pnpm datagen:regen           # après une correction curée (/admin/effects…) : build + apply
pnpm images                  # assets:collect + assets:push (R2)
```

**Incrémental & fiable** : ne tire que les fichiers nouveaux/modifiés, et
supprime en local ceux qui n'existent plus côté jeu. Détection des changements :
les **bundles** par leur nom (= hash de contenu), les **autres dossiers** par
**md5** du contenu → aucun changement raté, même à taille identique. Un 2e
lancement sans MAJ du jeu ne transfère rien.

Prérequis : LDPlayer lancé + Outerplane installé. Source dans l'émulateur :
`/sdcard/Android/data/com.smilegate.outerplane.stove.google/files/`.
Chemin de l'adb surchargeable via `ADB_PATH` (défaut : LDPlayer9).

---

## Versionner un boss (guides vs mises à jour du jeu)

Le jeu peut mettre à jour un boss **en place** (même id, contenu modifié) — un
guide écrit contre l'ancien état deviendrait silencieusement faux. Trois
protections, dont deux automatiques :

- **L'identité est l'ID, jamais le nom** : beaucoup de boss distincts partagent
  un nom (modes/stages/rotations différents) — les guides référencent des ids.
  Les stats EFFECTIVES d'un add dépendent du niveau du spawn (donjon/stage) ;
  l'entité extraite porte les valeurs brutes du templet.
- **Rétention automatique** (`datagen:promote`) : un monstre/skill déjà validé
  n'est JAMAIS supprimé par la promotion, même si le jeu purge ses lignes
  (`monsters.json` / `monster-skills.json` / `encounters.json` sont à rétention
  d'entités — le retrait reste une décision humaine, via git).
- **Versionnage au clic** (geste humain, à ton jugement — une maj sans impact
  guide ne se versionne pas) : sur la fiche `/admin/extractor/monsters/<id>`,
  deux boutons — **Enregistrer** (applique l'extraction fraîche de CE monstre)
  et **Versionner l'état committé** (fige l'état git HEAD dans
  `data/generated/monster-archive/<id>@<n>.json`, append-only, committé).

La **localisation** (où affronte-t-on le monstre : `spawns` = donjon + niveau
réel + barres de vie ; `summonedBy`/`linkedTo` pour les adds jamais spawnés) est
un champ **de l'entité monstre** : déplacer ou re-niveauter un boss apparaît
comme un diff, s'enregistre et se versionne comme le reste. Les donjons
référencés vivent dans `encounters.json` (mode, titre du stage, région — mergés
par « Enregistrer » avec le monstre), les titres de modes dans
`glossaries.modes`, et l'archive d'un boss embarque un snapshot des
donjons/modes référencés pour rester lisible seule.

Flux type : le boss `1` change de façon significative → **Versionner** (fige
l'ancien sous `1@1`) puis **Enregistrer** (le live prend le nouvel état). La
version A du guide s'épingle sur `1@1`, la nouvelle version B suit le live.

> Le versionnage fige **HEAD** (dernier état committé — celui contre lequel les
> guides ont été écrits) car en dev le promote automatique a souvent déjà écrasé
> le disque avec le nouvel état. Si la maj a été committée il y a longtemps,
> rattrapage CLI : `pnpm datagen:version-boss <id> --ref <commit>` (retrouver le
> commit : `git log -- data/generated/monsters.json`).
>
> TODO(guides) : quand le domaine guides existera, « Versionner » devra
> ré-épingler AUTOMATIQUEMENT les guides référençant `<id>` vers `<id>@<n>` —
> versionner ne doit jamais demander d'éditer la config d'un guide à la main.

---

## Publier (commit + déploiement)

> Le mécanisme est le MÊME pour tout le repo (code, pages, data) : branche →
> commit → push → PR → merge dans `main` = déploiement. Ce qui suit décrit le
> cas « patch de DONNÉES » ; pour du code/des pages, c'est le flux git normal
> (`git add` de ce que tu as changé, mêmes hooks, même CI) — seules les deux
> premières lignes ci-dessous sont spécifiques à la data.

Une fois le patch validé et vérifié dans `/admin` :

```bash
pnpm images                              # 1. les images d'abord (la prod lit R2)
git add data/generated data/curated      # 2. le validé + le curé
git commit -m "data: patch <version> — <résumé>"
git push                                 # 3. sur une branche → PR vers main
```

> Première publication d'une branche : `git push -u origin <branche>`
> (ou une fois pour toutes : `git config --global push.autoSetupRemote true`).
>
> **Ne PAS lancer `pnpm build` en local** : le build de prod est le travail de
> la CI. En local, les types générés du dev (`.next/dev/types`, qui connaissent
> les pages dev-only comme `/admin`) entrent en conflit avec ceux du build
> (`.next/types`) → échec garanti, et le `.next/types` orphelin fait ensuite
> échouer le typecheck du pre-push (remède : supprimer `.next/types`).
> Si un build local est vraiment nécessaire : stopper le dev server, puis
> `pnpm clean && pnpm build`.

Ce qui se passe tout seul, dans l'ordre :

1. **Au commit** (lefthook `pre-commit`) : prettier + eslint sur les fichiers
   indexés.
2. **Au push** (lefthook `pre-push`) : `pnpm typecheck` complet — un type cassé
   ne quitte jamais le poste.
3. **Sur la PR** (CI, job `check`) : lint + typecheck + `next build` — la
   validation finale avant merge.
4. **Au merge dans `main`** (CI) : build de l'**image Docker** → publication
   sur **GHCR** → **déploiement automatique** sur le VPS en SSH
   (`docker compose pull && up -d`). On ne se connecte jamais au serveur :
   _merger dans `main`, c'est déployer_.

Règles d'or :

- `pnpm images` **avant** le merge — sinon fenêtre d'images cassées en prod
  (le data déployé référence des fichiers pas encore sur R2).
- On ne committe que `data/generated/` (validé via `datagen:promote`) et
  `data/curated/` (saisies humaines). `data/extracted/`, `.gamedata/` et
  `.assets-staging/` sont gitignorés — impossible de publier du non-validé.
- Tant que le domaine n'est pas transféré, le déploiement `main` n'expose que
  l'IP du VPS : on peut valider la chaîne complète sans risque public.

## État

✅ **Opérationnel de bout en bout.** Tout ce qui est décrit ci-dessus existe :

- couche 0 (pull LDPlayer + extraction AssetStudio) ;
- couche 1 (`templates/`, parser `.bytes → JSON` typé, TS) ;
- couche 2 (`lib/`, primitives partagées) ;
- couche 3 (`generators/`, 20 générateurs — DÉCOMPTE DE RÉFÉRENCE : les
  autres docs renvoient ici au lieu de citer un nombre qui périme ;
  characters/monsters n'en sont plus, ils vivent dans l'extracteur) ;
- couche 4 (`contracts/`) et couche 5 (`build.ts` + `refresh.ts` + `promote.ts`) ;
- extracteur déclaratif (`extractor/`), couche curée (`curated/` + seed),
  pipeline images R2 (`assets/` + `pnpm images`), versionnage de boss.

`data/generated/` est committé et consommé par l'app ; le build CI ne lance
aucune génération.
