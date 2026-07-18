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

### Exception assumée : un (seul) outil Python

`datagen/assets/extract-face-layout.py` (`pnpm datagen:face-layout`) est la **seule
exception** au « tout-TS ». Il lit les **typetrees RectTransform** d'un prefab Unity
via **UnityPy** — même domaine spécialisé que l'extracteur .NET de la couche 0, donc
**délibérément non réécrit en TS**. Il est :

- **local** : joué automatiquement par le flux `refresh` (`pnpm dev` /
  `datagen:patch`) entre convert et build — uniquement sur la machine de
  datamine (le refresh ne génère que si `.gamedata` existe) ; relançable seul
  via `pnpm datagen:face-layout`. Depuis le 2026-07-14 : avant, il fallait le
  jouer à la main puis relancer dev pour produire les FI_ des nouveaux persos ;
- **absent du build et de la CI** ;
- **borné à un JSON committé** : sa sortie `datagen/assets/face-icon-layout.json` est
  versionnée et c'est ce que lit `datagen/assets/face-icon.ts`. **Le serveur/build ne
  touche jamais Python** — d'où « aucun python _dans le build_ », qui reste vrai.

Porter ce script en TS reste possible (AssetStudioModCLI a un mode `-m dump`) mais non
prioritaire : cf. le fork tranché en faveur de l'isolation.

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

Le quotidien est 100% git. Seule la régénération (rare) a besoin de `.gamedata/`,
synchronisé via R2 (à brancher en Phase 3).

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
