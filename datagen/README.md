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
            │  (generators/ + lib/ — TS)
            ├──────────────► data/generated/   ✅ committé  → consommé par l'app
            └──────────────► .gamedata/staging-images/  →  upload R2 → CDN
```

- **Données écrites à la main** : `data/curated/` (✅ committé).
- **Données générées (JSON)** : `data/generated/` (✅ committé — le build les lit).
- **Images générées** : vont sur **R2/CDN**, **jamais** dans le repo.

---

## Local vs CI

- **Génération** (rare, quand le jeu patche) : **en local**, avec `.gamedata/` rempli.
  Produit `data/generated/` (committé) + images (→ R2).
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

## État

🚧 Structure posée. Prochaines étapes : wrapper d'extraction, puis le parser
`.bytes → templates` (couche 1), puis migration des générateurs un par un.
