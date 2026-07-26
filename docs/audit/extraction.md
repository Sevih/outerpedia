# Audit — sous-système EXTRACTION (`datagen/extract/`)

> Compte rendu à mettre en commun avec l'audit du worker (panneau admin).
> Fait le **2026-07-26** après clôture des TODO d'extraction. Périmètre lu de
> première main (pas de résumé d'agent) : les 7 fichiers de `datagen/extract/`
> (~1160 lignes) + les dépendances partagées touchées (`lib/fs.walkFiles`,
> `lib/r2`). État de référence : commit `977589c`.

## Périmètre

Le front du pipeline datagen — du device au pool extrait, avant `build`/generators :

| Fichier                 | Rôle                                                          | Lignes |
| ----------------------- | ------------------------------------------------------------- | ------ |
| `pull-gamedata.ts`      | sync incrémentale `.gamedata/files` ← LDPlayer (tar par lots) | 275    |
| `extract-wallpapers.ts` | scan pool images → dédup perceptuelle → webp+png              | 330    |
| `extract-audio.ts`      | bundles → WAV → fusion intro/loop → mp3                       | 202    |
| `dump.ts`               | APK installé → `dump.cs` (Il2CppDumper, paire assortie)       | 136    |
| `extract.ts`            | ombrelle AssetStudioModCLI (bytes/images) + délègue audio/wp  | 114    |
| `tools.ts`              | bootstrap des binaires tiers depuis R2 (idempotent)           | 57     |
| `adb.ts`                | helpers adb partagés (device, root, capture/stream)           | 46     |

## Verdict global : **sain**

Code mûr, très bien commenté (le POURQUOI y est : pièges Windows/tar/adb,
dépareillage `.so`/metadata, `; true` sur les sorties adb non nulles). Garde-fous
réels et documentés. Les constats ci-dessous sont surtout du **durcissement**,
un **trou de tests** et une **duplication** — pas des bugs ouverts. Aucun défaut
de correction avéré sur le chemin nominal.

### Points forts à conserver

- **Pull incrémental par lots `tar`** : coût proportionnel au diff, pas aux 19 Go.
  Bien pensé (liste par fichier poussé, pas stdin ; `exec-out` binaire).
- **Garde-fous documentés** : dossier distant absent → refus (anti-purge),
  paire `.so`+metadata ré-extraite du même install (anti-dépareillage).
- **Contrats de nommage explicites** (stem = clé de jointure du générateur) :
  couplage extract↔generator rendu visible, pas caché.
- **Idempotence** : `ensureTool`, sorties dérivées reconstruites (`rm`+`mkdir`).

---

## Constats (par sévérité)

### 1. [MOYEN] Cœurs purs d'extraction NON testés

Aucun test dans `datagen/extract/` (confirmé). Or plusieurs cœurs sont purs et
testables **sans device ni `.gamedata`**, exactement comme les générateurs qu'on
vient de couvrir :

- **Parsers de signatures** `pull-gamedata.ts:51-104` — le parsing `ls -lR`
  (taille) et `md5sum` est **fragile** (dépend du layout de colonnes toybox) et
  porte une conséquence lourde (cf. constat 2). À extraire en fonctions pures
  `parseLsLR(text)` / `parseMd5(text)` et tester en priorité.
- **Classifieurs wallpapers** `extract-wallpapers.ts` : `getPriorityScore` (143),
  `getCategory` (175), `shouldExclude` (168) — purs, testables tels quels.
- **`findPairs`** `extract-audio.ts:114` — appariement intro/loop, pur si on lui
  passe la liste de fichiers.
- **`computePerceptualHash`** — déterministe (fixture image + hash attendu).

> Reco : même méthode que le lot générateurs (extraire/exporter le cœur pur,
> tester en synthétique). Priorité aux **parsers `ls -lR`/`md5sum`**.

### 2. [MOYEN-] Suppression locale SILENCIEUSE sur miss partiel de listing

`pull-gamedata.ts:216-217` + `259-261`. Une ligne de listing distant non parsée
→ absente de `remote` → classée `toDelete` **et** non re-tirée (pas dans `remote`
non plus). Le garde-fou (`remoteDir` absent, l. 203) ne couvre que le vide
**TOTAL**, pas un miss partiel. Pour `bundles` (content-addressed), un bundle qui
disparaît du miroir → le build extrait d'un jeu de bundles incomplet, sans erreur.

Probabilité faible (toybox stable ; ne casse que sur noms pathologiques /
transitoire md5sum), mais **silencieux** et affecte la complétude du build.

> Reco : refuser la suppression si `toDelete/local` dépasse un seuil (ex. > 25 %)
> tant que `toPull` est faible — un vrai wipe côté jeu est rare et mérite un stop
> explicite —, ou logguer chaque suppression.

### 3. [FAIBLE] Duplication — parsing d'en-tête PNG (IHDR 24 octets) en TRIPLE

Même logique (`89504e470d0a1a0a` + `readUInt32BE(16/20)`) copiée dans :

- `datagen/extract/extract-wallpapers.ts:181` (`pngDimensions`)
- `datagen/generators/wallpapers.ts:49` (`pngDims`)
- `datagen/assets/hero-full-art.ts:43`

> Reco (régler à la source) : un seul helper partagé (ex. `lib/png.ts
readPngSize(path)`), testé une fois, importé aux trois endroits. Le test
> existant de `wallpapers.test` migre dessus.
> Mineure aussi : `maxTasks = min(max(cpus-4,1),16)` dupliqué
> `extract.ts:71` ↔ `extract-audio.ts:67`.

### 4. [FAIBLE] Pas de timeout sur l'extraction bytes/images

`extract.ts` `cli()` (39-42) n'impose **aucun** `timeout`, alors qu'`extract-audio`
en met un (`600_000`, l. 92). Une passe AssetStudio bloquée pendrait indéfiniment.

> Reco : aligner un `timeout` sur `cli()` (même ordre de grandeur).

### 5. [FAIBLE] Flatten audio — collision de basename silencieuse

`extract-audio.ts:100-104` : un WAV niché dont le basename existe déjà à plat
n'est pas remonté (`!existsSync(flat)`), puis `readdirSync` non récursif (115)
l'ignore → piste perdue sans trace. Noms BGM uniques en pratique.

> Reco : `console.warn` sur collision (coût nul, rend le cas visible).

### 6. [FAIBLE] Perf — dédup wallpapers séquentielle

`extract-wallpapers.ts:234-265` : `scanAndFilter` et `detectDuplicates` font
`await sharp(...)` **fichier par fichier**. Sur un grand pool, sérialisé.

> Reco : borner un parallélisme (p-limit ≈ cpus). Gain de temps d'extraction,
> risque nul (déterminisme préservé : la dédup regroupe par hash, indépendant de
> l'ordre).

### 7. [INFO] Maintenabilité — blocklist wallpapers ~50 regex verbatim V2

`extract-wallpapers.ts:74-127` : héritée telle quelle, **partiellement redondante**
avec l'allowlist par catégorie (`getCategory` renvoie `null` → déjà exclu hors
Full/Banner/Cutin/Art). Passif de maintenance ; pas actionnable sans re-vérifier
sur la donnée quelles familles la catégorisation écarte déjà.

> Reco : chantier « élagage » à part, après avoir mesuré (sur le pool réel) le
> recouvrement blocklist ∩ catégorisation. Pas urgent.

### 8. [INFO] Interpolation shell dans les commandes adb

`sub` (argv) → `remoteDir` ; `apk`/`entry` (device) → `adb shell`. Surface
d'injection **théorique**, entrées = le dev lui-même / le device, outil local.
Risque réel négligeable — noté pour complétude, aucune action.

---

## Synthèse actionnable

**Quick wins (risque nul, gain net)**

- Helper PNG partagé (constat 3) — supprime une triple duplication.
- Timeout sur `cli()` (constat 4).
- `console.warn` collision flatten (constat 5).

**Chantiers**

- Tests des cœurs purs d'extraction, parsers `ls -lR`/`md5sum` en tête (constat 1).
- Garde-fou anti-suppression massive sur miss partiel (constat 2).
- Parallélisme dédup wallpapers (constat 6).
- Élagage blocklist wallpapers, après mesure (constat 7).

**Rien à faire** : sécurité shell (8), archi générale (saine).
