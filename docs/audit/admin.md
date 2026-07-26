# Audit — Panneau admin (2026-07-26)

> Volet ADMIN (constats **F1–F9**). La mise en commun avec le volet extraction est
> faite : **[README.md](./README.md)** porte la synthèse dédupliquée et le backlog
> unique priorisé — c'est par là qu'il faut entrer. Volet voisin :
> [extraction.md](./extraction.md) (**E1–E8**). Le recouvrement entre les deux est
> repris en fin de document (§ Frontière avec l'extraction).
>
> Méthode : lecture du code + **mesures** (chronos, comptages, exécution réelle
> des résolveurs). Chaque constat porte sa preuve `fichier:ligne` ou son chiffre.
> Ce qui n'a pas pu être vérifié est marqué comme tel — rien n'est déduit.

## Périmètre mesuré

| Zone                   | Fichiers | Lignes      |
| ---------------------- | -------- | ----------- |
| `src/app/admin`        | 65       | 3 354       |
| `src/components/admin` | 56       | 12 526      |
| `src/lib/admin`        | 51       | 5 075       |
| `src/app/api/admin`    | 27       | 552         |
| **Total**              | **199**  | **~21 500** |

## Verdict

La **sécurité est saine** et l'outillage de garde est meilleur que la moyenne du
projet (triple garde, 27/27 routes couvertes, 0 problème eslint sur 21 500
lignes). Le risque réel n'est pas l'exposition : c'est la **durabilité de la
donnée éditoriale**. Un seul défaut mérite d'être traité en priorité (F1), il se
corrige en trois lignes à un seul endroit et couvre 53 sites d'écriture.

| #   | Constat                                                | Sévérité    | Effort    |
| --- | ------------------------------------------------------ | ----------- | --------- |
| F1  | Écritures non atomiques sur les JSON curés             | **Haute**   | ~3 lignes |
| F2  | `admin/` n'est pas une frontière (8 entrées publiques) | Moyenne     | Moyen     |
| F3  | Aucune validation runtime des payloads d'écriture      | Moyenne     | Moyen     |
| F4  | Échafaudage « translate » dupliqué 6×                  | Moyenne     | Faible    |
| F5  | N allers-retours d'aperçu au montage                   | Faible-moy. | Faible    |
| F6  | Pas de confinement de chemin côté écriture de guides   | Faible      | 1 ligne   |
| F7  | Concurrence read-merge-write des stores                | Faible      | Faible    |
| F8  | Couverture de tests : 3 tests / 48 modules             | Faible      | Élevé     |
| F9  | Composants de 750 à 1 000 lignes                       | Dette       | Élevé     |

---

## Ce qui est SAIN (à ne pas re-auditer)

1. **Garde dev-only, triple et complète.** 100 % des fichiers de
   `src/app/admin` et `src/app/api/admin` sont en `.dev.*` ; `pageExtensions`
   (`next.config.ts:76`) ne reconnaît `dev.*` qu'en développement ;
   `assertDevOnly()` rend 404 et `IS_DEV` répond 403. **27/27** routes API
   portent la garde — vérifié par comptage, aucune exception.
2. **Server actions : toutes gardées, y compris les exports secondaires.** Les 4
   actions qui écrivent ou consomment des clés API sont gardées, dont **les deux**
   exports de `gear-preview-actions.ts` (`previewGearReco` ligne 50,
   `listImportableBuilds` ligne 91) — c'est le piège classique de l'action
   oubliée, il est évité ici. `inline-preview-actions.ts` est délibérément non
   gardée : lecture seule de données de jeu publiques, décision documentée en
   tête de fichier, et nécessaire aux outils publics de contribution.
3. **La classe de bug « composant déclaré dans un corps de composant » est
   désormais mécaniquement bloquée.** `react-hooks/static-components` est active
   (elle a refusé un `ShopNoteRow` le 24/07). C'est la racine des deux bugs de
   focus/aperçu déjà vécus : le linter les empêche de revenir.
4. **eslint : 0 problème** sur les 199 fichiers.
5. **`readCuratedJson` lève sur un JSON cassé** au lieu de servir « pas de
   curation » en silence (`datagen/lib/json.ts:38`) — décision documentée et
   juste. ⚠ Elle interagit mal avec F1, voir ci-dessous.
6. **Format JSON canonique** (`writeJson`/`formatJson`) → diffs git stables.
7. **Doublon home/Extractor : réglé le 26/07** (cf. DONE). Le moteur de revue
   coûte **1 320 ms mesuré** et tournait deux fois par chargement de `/admin`
   (layout + page) ; il est mémoïsé à la requête. Inutile de le re-signaler.

---

## F1 — Écritures non atomiques sur la donnée curée · **Haute**

`writeJson` écrit en place, sans fichier temporaire :

```ts
// datagen/lib/json.ts:69
export async function writeJson(path: string, data: unknown): Promise<void> {
  writeFileSync(path, await formatJson(data));
}
```

`writeFileSync` **tronque puis écrit**. Une interruption pendant l'écriture
(Ctrl-C, redémarrage du serveur dev, crash, plantage de l'éditeur) laisse un
fichier tronqué. Surface : **16 stores, 53 sites d'écriture** dans `src/lib/admin`.

Ce qui rend le défaut coûteux, c'est l'**interaction avec le lecteur** : par
décision explicite (et bonne en soi, cf. § SAIN #5), `readCuratedJson` **lève**
sur un JSON cassé. Un save interrompu ne dégrade donc pas silencieusement — il
**bloque `pnpm dev` et le build** jusqu'à réparation manuelle.

Enjeu concret, les plus gros curés :

| Fichier                        | Taille |
| ------------------------------ | ------ |
| `data/curated/characters.json` | 243 Ko |
| `data/curated/gear-reco.json`  | 141 Ko |
| `data/curated/changelog.json`  | 127 Ko |

`characters.json` porte l'essentiel du travail éditorial (pros/cons, synergies,
overrides). Récupérable par git, mais au prix d'une perte de session.

**Correctif** — écrire à côté puis renommer (le rename est atomique sur le même
système de fichiers ; Node gère l'écrasement sous Windows via `MoveFileEx`) :

```ts
export async function writeJson(path: string, data: unknown): Promise<void> {
  const body = await formatJson(data); // déjà hors de la fenêtre critique
  const tmp = `${path}.tmp`;
  writeFileSync(tmp, body);
  renameSync(tmp, path);
}
```

Un seul endroit, **les 53 sites corrigés d'un coup**. Le `await formatJson()` est
déjà placé avant l'écriture — un échec de formatage ne tronque donc rien
aujourd'hui ; c'est bien la fenêtre d'écriture elle-même qu'il reste à fermer.

> ⚠ `datagen/lib/json.ts` est **partagé avec le worker d'extraction** :
> ce correctif le bénéficie aussi. Point de fusion des deux audits.

## F2 — `admin/` n'est pas une frontière · Moyenne

**8 points d'entrée hors-admin** importent `@/lib/admin` ou `@/components/admin`.
Une partie est légitime et voulue (les outils publics de contribution réutilisent
les briques éditoriales), mais la conséquence est que la garantie mentale « le
code `admin/` ne part jamais en production » est **fausse** :

| Consommateur public                              | Importe                                          | Nature                             |
| ------------------------------------------------ | ------------------------------------------------ | ---------------------------------- |
| `src/lib/home.ts` → `lib/data/item-catalog.ts`   | `item-curated-store`                             | valeur, **lecture disque en prod** |
| `contribute/premium-reviews/page.tsx`            | `inline-refs`, `general-guide-store`             | valeur, serveur                    |
| `contribute/pros-cons` · `synergies`             | `components/admin/editorial/EditorialPublicTool` | **bundle client public**           |
| `lib/contribute/editorial-tool-data.ts`          | `inline-refs` (+ 3 `import type`)                | valeur, serveur                    |
| `event/[slug]/page.tsx`, `tools/_contents/event` | `IS_DEV`                                         | anodin                             |

Vérifié : ça **fonctionne** en production — `data/curated/**/*.json` est tracé
dans l'image (`next.config.ts:100`) et `loadItemCurated` est tolérante
(`item-curated-store.ts:26-32`). Ce n'est donc **pas un bug**, c'est un défaut de
frontière : le jour où quelqu'un ajoutera une hypothèse dev-only — ou pire, une
clé API — dans un module `lib/admin` en croyant qu'il ne ship pas, le défaut
deviendra un incident. À noter que `item-catalog.ts` s'annonce lui-même « Vue
ADMIN » dans sa docstring tout en étant consommé par la page d'accueil publique.

**Correctif** — deux options : extraire les briques réellement partagées vers
`lib/editorial/` + `components/editorial/` (propre, coûteux), ou documenter en
tête de `lib/admin/` la liste explicite des modules qui shippent en prod (bon
marché, suffisant à court terme).

## F3 — Aucune validation runtime des payloads d'écriture · Moyenne

Les routes castent le corps de requête sans le vérifier :

```ts
const body = (await req.json()) as Body; // aucune validation
```

**17 routes** lisent du JSON, **11 seulement** ont un `try` → ~6 routes où un JSON
malformé produit un rejet non géré (500 avec stack). Surtout, rien ne garantit la
_forme_ avant d'écrire dans la donnée éditoriale. Les stores valident bien, mais
**au cas par cas** (`saveGuideDraft` vérifie l'intro EN et les clés de version au
format `YYYY-MM`) — il n'y a pas de filet commun.

Combiné à F1, un payload aberrant peut écrire une structure invalide dans un curé,
que le lecteur strict refusera ensuite.

**Correctif** — un garde de forme par payload (schéma déclaratif si une dépendance
de validation est acceptable, sinon un simple prédicat par store), plus un `try`
systématique autour de `req.json()`.

## F4 — Échafaudage « translate » dupliqué 6× · Moyenne

6 éditeurs réimplémentent le même flux : mêmes états (`trans`, `transMsg`), même
sortie anticipée, même appel `autoTranslate`, même boucle
`applyTranslation` + `markFresh`, et **la même chaîne littérale** :

```
Nothing to translate — every English text is already up to date.
```

présente à l'identique dans `EditorialEditor`, `FreeHeroesEditor`, `GuideEditor`,
`PremiumLimitedEditor`, `ShopPrioritiesEditor` (et une variante « note » dans
`GearRecoEditor`). La **seule** variation réelle est la façon de collecter les
enregistrements localisés, qui dépend de la forme de chaque éditeur.

La _sémantique_ est déjà mutualisée (`lib/admin/translate-fill.ts` :
`applyTranslation`, `createFreshness`) — c'est la plomberie UI qui reste dupliquée.

**Correctif** — un hook `useAutoTranslate(collect)` qui possède les états, la
sortie anticipée, l'appel, la boucle et les messages ; chaque éditeur ne fournit
plus qu'un `collect(): LocalizedText[]`. Faible risque, gain net.

## F5 — N allers-retours d'aperçu au montage · Faible-moyenne

`InlineTextField` déclenche `renderInlinePreview` dans un `useEffect` dépendant de
`[value, lang, previewMode]` : l'aperçu part donc **au montage**, sans frappe.
Deux endroits montent un champ **par élément de liste**, sans la garde
« un seul éditeur actif » :

- `GuideEditor.tsx:693` et `:745` — une note par équipe ;
- `FreeHeroesEditor.tsx:274` — une raison par entrée.

Le remède existe déjà dans le repo : `editorial/EditorialFields.tsx:155` et
`CharacterGroups.tsx` n'en montent qu'un (`editing === i`), le reste étant rendu
au repos par un `renderInlineBatch` unique.

**Mesure qui recadre l'ampleur** : au plus **3 équipes** par guide dans la donnée
réelle. L'ordre de grandeur est donc d'une dizaine d'allers-retours sur une page
d'éditeur (8 sites de champs dans `GuideEditor`, dont certains en liste), pas des
centaines. C'est la même racine que le bug de focus corrigé le 24/07, mais
l'impact résiduel est modéré — à traiter, sans urgence.

## F6 — Pas de confinement de chemin côté écriture de guides · Faible

```ts
// src/lib/admin/guide-store.ts:40
const guideDir = (category, slug) => resolve(CONTENTS_DIR, category, slug);
```

`resolve()` normalise les `..` et il n'y a **aucune vérification de confinement**.
Ce qui protège déjà :

- `category` est en **liste blanche** (`guideSpec(category)` → `GUIDE_SPECS`) ;
- `newKey` est validé par regex `YYYY-MM` (`guide-store.ts:185`) — ce qui tue le
  traversal sur le nom de version ;
- le dossier cible doit exister (`existsSync(base)`).

Restent **`slug`** (jamais validé) et **`fromKey`** (utilisé en lecture pour
copier une version source, sans regex). Exploitabilité quasi nulle : outil
dev-only, lié à localhost, requête à forger à la main. Mais **l'idiome de
confinement existe déjà dans le repo** — `src/app/images/[...path]/route.dev.ts:25`
fait `if (!full.startsWith(ROOT + sep)) return 400`. Une ligne à aligner, par
cohérence plus que par peur.

## F7 — Concurrence read-merge-write · Faible

Tous les stores font `load()` → modifier → `write()` (ex.
`item-curated-store.ts:34-40`). Deux enregistrements simultanés → le premier est
perdu en silence. Mono-utilisateur local, donc risque faible ; réel néanmoins avec
deux onglets d'admin ouverts sur des entités partageant un même fichier curé.

## F8 — Couverture de tests · Faible (mais trou coûteux)

- `src/lib/admin` : **3 fichiers de test pour 48 modules**
  (`events-store`, `gamedata-store`, `tag-control`).
- `src/components/admin` : **0 test** sur 56 composants.

À relativiser : `tag-control.test.ts` est **bloquant** et de forte valeur (aucun
tag éditorial mort ne peut passer — vérifié : 18 544 occurrences, 0 cassée), et la
suite datagen (346 tests) couvre les générateurs. Le trou qui coûte cher, ce sont
les **16 stores qui écrivent** : une régression y corrompt la donnée éditoriale
sans bruit. C'est là qu'il faut mettre les premiers tests, pas sur les composants.

## F9 — Taille des composants · Dette

`GuideEditor` 1 002 lignes, `EventsEditor` 891, `ShopPrioritiesEditor` 761,
`GearRecoEditor` 753. Pas un bug — mais c'est exactement la surface où sont nés
les bugs d'identité de composant et de focus. F4 (hook de traduction) en retire
une part mécaniquement.

---

## Ordre de traitement conseillé

1. **F1** — 3 lignes, un seul fichier, protège 243 Ko de travail éditorial. À
   faire même si rien d'autre n'est fait, et **à coordonner avec l'audit
   extraction** (fichier partagé).
2. **F6** puis **F3** — petits correctifs de robustesse, l'idiome maison existe
   déjà pour F6.
3. **F4** — refactor à faible risque, retire ~6 copies et allège F9.
4. **F2** — décision d'architecture à arbitrer (extraire vs documenter) ; le
   documenter suffit à court terme.
5. **F5**, **F7**, **F8** — au fil de l'eau.

## Frontière avec l'extraction

À arbitrer une seule fois, pour les deux audits :

- **`datagen/lib/json.ts`** (`writeJson` / `readCuratedJson` / `formatJson`) est
  le **socle commun** admin ↔ worker. F1 s'y corrige et bénéficie aux deux. Ne
  pas le traiter deux fois.
- **`src/lib/admin/review-store.ts`** est une façade mince sur
  `@datagen/extractor/review` : le coût mesuré de **1 320 ms** est imputable au
  moteur d'extraction, pas à l'admin. Si l'audit extraction cherche des gains, le
  chemin `reviewAll()` est le premier candidat — l'admin, lui, ne l'appelle plus
  qu'une fois par requête depuis le 26/07.
- Les JSON de `data/curated/` sont écrits par l'admin et relus par les
  générateurs : toute décision de format ou d'atomicité est commune aux deux
  volets.
