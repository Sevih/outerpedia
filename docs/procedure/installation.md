# Procédure — installation sur une nouvelle machine

Repartir d'un `git clone` propre demande deux choses en plus du code :
des **fichiers hors git** (secrets + binaires d'outillage) et une **première
génération de données** (rien n'est committé côté `.gamedata`/staging).

Ce fichier est le pense-bête pour ne rien oublier. Le détail du pipeline data
vit dans [datagen/README.md](../../datagen/README.md).

---

## 0. Voie express (script d'init)

Une fois le repo **cloné** et le `.env.local` **déposé** (§2.1), une seule
commande met tout en place — toolchain, dépendances et première génération de
données — de façon **idempotente** (ré-exécutable sans risque) :

```powershell
powershell -ExecutionPolicy Bypass -File scripts\init.ps1
```

[`scripts/init.ps1`](../../scripts/init.ps1) est un orchestrateur mince : il
enchaîne les commandes ci-dessous (`corepack`, `pnpm`, `pnpm datagen:*`) et
**auto-installe via winget** ce qui manque — `nvm-windows`, le runtime **.NET**
(Il2CppDumper) et `rclone` — en rafraîchissant le PATH dans la foulée.

Ce qui reste **irréductiblement manuel** : `git` (il a fallu cloner ce repo pour
avoir le script), le `.env.local` (§2.1), et un **émulateur LDPlayer lancé avec
le jeu installé + connecté** (source des données ; sinon le pipeline data est
sauté proprement, à relancer une fois l'émulateur prêt).

> **Lance-le en utilisateur NORMAL (pas administrateur).** Un `git clone` ou un
> `init.ps1` exécuté en admin rend `.git` et les fichiers générés possédés par
> « Administrateurs » → git en usage normal les refuse (« dubious ownership »),
> et VS Code tague le dépôt comme non sûr. Seule exception : sur une machine
> **sans Node**, le tout premier `nvm use` exige l'admin (lien symbolique) — fais
> uniquement CETTE commande dans un terminal élevé, puis reviens en normal. Le
> script est **idempotent** : en cas de pépin (PATH pas rafraîchi après une
> install), rouvrir un terminal et relancer reprend où il en était.

> Le fichier `.ps1` est encodé **UTF-8 avec BOM** : PowerShell 5.1 lirait sinon
> les accents dans la codepage ANSI et casserait le parsing. Ne pas le ré-enregistrer
> sans BOM.

Les sections suivantes détaillent chaque étape (et servent de secours manuel).

---

## 1. Prérequis

- **Node 24** (voir `.nvmrc`). Le projet exige `>=24` ; pnpm 11.13 refuse de
  tourner sous Node < 22.13 de toute façon.
- **pnpm 11.13.0** via corepack (voir §3).
- **git**.
- Pour (re)générer la data : un **émulateur Android** (LDPlayer) avec Outerplane
  installé + **adb** dans le PATH. Sinon, récupérer `.gamedata/` depuis R2.

---

## 2. Cloner + déposer les fichiers hors git

```bash
git clone https://github.com/Sevih/outerpedia.git outerpedia-v3
cd outerpedia-v3
```

### 2.1 `.env.local` (racine) — non versionné

Seul `.env.example` est dans git. Recréer `.env.local` avec les vraies valeurs :

| Variable                                      | Rôle                         |
| --------------------------------------------- | ---------------------------- |
| `R2_*` (endpoint, bucket, access key, secret) | accès Cloudflare R2 (images) |
| `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`  | purge CDN / API Cloudflare   |
| `YOUTUBE_API_KEY`                             | récup des vidéos (news)      |

> Profil de déploiement (`NEXT_PUBLIC_SITE_ORIGIN` / `_LANG_ROUTING` / `_SITE_INDEXABLE`) :
> **rien à poser en dev**, les défauts donnent `localhost + path + indexable` (cf.
> [src/lib/site.ts](../../src/lib/site.ts)). Ils ne servent qu'au build prod — voir
> [bascule-domaine.md](bascule-domaine.md).

### 2.2 Outillage — dans `.gamedata/` (hors git)

Les binaires d'outillage (AssetStudioModCLI, Il2CppDumper) sont **tirés de R2**
à la demande par [tools.ts](../../datagen/extract/tools.ts) — rien à déposer à la
main (surcharge possible via `ASTUDIO_CLI` / `IL2CPP_DUMPER`).

Le dump il2cpp **`dump.cs`** (lu par `datagen:build` via
[goods.ts](../../datagen/generators/goods.ts) / [recruit.ts](../../datagen/generators/recruit.ts))
n'est plus à fournir non plus : **`pnpm datagen:dump`** le régénère tout seul
depuis l'APK installé sur l'émulateur (voir §4).

> ℹ️ **Pourquoi c'est fiable.** Il2CppDumper exige deux fichiers de la MÊME
> version — `global-metadata.dat` + `libil2cpp.so`. Les fournir dépareillés
> donne `MetadataRegistration : 0` (ce qui ressemble à tort à une « protection »).
> `datagen:dump` extrait les DEUX du même install (`base.apk` +
> `split_config.arm64_v8a.apk`) → paire toujours assortie. Rien à télécharger ni
> à bidouiller.

> ℹ️ La **clé age** (`~/.config/sops/age/keys.txt`) n'est **pas** nécessaire
> ici : ce repo n'a pas de `.sops.yaml`. Elle ne sert qu'à `sevih-tool`.

### 2.3 À NE PAS copier (régénérable)

`node_modules/`, `.next/`, `.gamedata/files/` (bundles — re-pull adb ou R2),
`.gamedata/extracted/`, `.assets-staging/`.

---

## 3. Node + pnpm

```bash
nvm install 24
nvm use 24                       # nvm-windows : global par version de Node
corepack enable
corepack prepare pnpm@11.13.0 --activate
pnpm -v                          # doit afficher 11.13.0
```

**Pièges rencontrés :**

- `corepack prepare` échoue avec `Cannot find matching keyid` → le corepack
  fourni avec Node a des clés de signature npm périmées. Corriger avec
  `npm install -g corepack@latest` puis refaire `corepack enable` + `prepare`.
- Avec **nvm-windows**, les paquets globaux (dont corepack) sont isolés **par
  version de Node** : après un `nvm use`, refaire `corepack enable` + `prepare`.

Puis :

```bash
pnpm install
```

---

## 4. Première génération des données

Rien n'est committé côté data locale : il faut la construire une fois.

```bash
pnpm datagen:pull        # bundles + il2cpp depuis l'émulateur (adb).  ~15 Go
pnpm datagen:dump        # dump.cs depuis l'APK installé (paire assortie, auto)
pnpm datagen:extract     # .bytes + images → .gamedata/extracted/ (via AssetStudioModCLI)
pnpm datagen:convert     # .bytes → tables parsées (.gamedata/parsed/*.json)
pnpm datagen:regen       # build + promote --apply → data/extracted (lit parsed + dump.cs)
pnpm assets:pull         # ensemble d'images PUBLIÉ sur R2 → .assets-staging/images
```

> `datagen:dump` a besoin de l'émulateur **lancé** avec le jeu **installé** (il lit
> l'APK via adb). Il ne change qu'aux MAJ de code du jeu — inutile de le rejouer à
> chaque patch de données.

> **Remplir `.assets-staging/images` est indispensable en dev** : la route dev
> [`/images/[...path]`](../../src/app/images/[...path]/route.dev.ts) y lit les
> images (sinon tous les `/images/*.webp` renvoient **404**). On utilise
> **`assets:pull`** (ensemble PUBLIÉ sur R2 = ce que sert le site, curés/manuels
> inclus). `assets:collect` ne régénère QUE les sprites extraits du jeu et rate
> les assets curés — il sert au flux de **publication** (collect + push) quand on
> datamine du nouveau contenu, pas à l'onboarding.

`pnpm dev` enchaîne déjà `clean:all → dev-refresh (pull→extract→convert→build→
promote+collect news)` en tête, mais **pas** `assets:collect` — d'où le step
manuel ci-dessus au premier lancement.

---

## 5. Lancer

```bash
pnpm dev
```

Vérifier `/` puis `/admin`. Si des images 404 → relancer `pnpm assets:collect`.
