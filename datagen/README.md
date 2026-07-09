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

run.ts        Couche 5 — orchestrateur (remplace l'ancien pipeline/run.ts).
```

### Exception assumée : un (seul) outil Python

`datagen/assets/extract-face-layout.py` (`pnpm datagen:face-layout`) est la **seule
exception** au « tout-TS ». Il lit les **typetrees RectTransform** d'un prefab Unity
via **UnityPy** — même domaine spécialisé que l'extracteur .NET de la couche 0, donc
**délibérément non réécrit en TS**. Il est :

- **local & rare** : relancé à la main seulement quand les face icons changent ;
- **hors de tout chemin automatisé** : absent du build, de la CI et du flux `refresh`
  (`pnpm dev` / `datagen:patch`) ;
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

🚧 Structure posée. Prochaines étapes : wrapper d'extraction, puis le parser
`.bytes → templates` (couche 1), puis migration des générateurs un par un.
