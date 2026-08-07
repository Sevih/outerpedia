# Audit — Calculateur de dégâts (2026-08-07)

> Volet DAMAGE (constats **D1–D5**). Extrait de l'audit global du site du
> 2026-08-07 : tout ce qui touche au calculateur a été sorti ici, le domaine
> ayant son worker dédié. L'audit global ne garde donc **aucun** constat damage.
>
> Volets voisins : [admin.md](./admin.md) (**F1–F9**),
> [extraction.md](./extraction.md) (**E1–E8**), [extractor.md](./extractor.md)
> (**X1–X6**) — synthèse dans [README.md](./README.md).
>
> Méthode : lecture du code + comptages (lignes, tailles de fichiers, graphes
> d'import). Chaque constat porte sa preuve `fichier:ligne` ou son chiffre. Rien
> n'est déduit ; ce qui n'a pas été vérifié est marqué comme tel.

## Contexte — chantier OUVERT

Le calculateur est **en cours de construction** (cf. `TODO.md` § Pages
manquantes) : page `unlisted`, UI posée le 26/07, moteur en cours, boucle de
revue Sevih active. **Aucun constat ci-dessous n'est un bug en production** — ce
sont des points de conception à trancher pendant que le chantier est ouvert,
c'est-à-dire au moment le moins cher.

## Périmètre mesuré

| Zone                          | Fichiers    | Lignes      |
| ----------------------------- | ----------- | ----------- |
| `src/lib/damage/`             | 15 modules  | **7 032**   |
| `src/lib/damage/*.test.ts`    | 12 fichiers | —           |
| `DamageCalculatorBrowser.tsx` | 1           | **4 050**   |
| `index.tsx` (wrapper serveur) | 1           | 922         |
| `DebugHarness.tsx`            | 1           | 691         |
| `data/generated/damage/`      | 6 JSON      | **12,9 Mo** |

## Verdict

Le **moteur est le mieux gardé du projet** : 12 fichiers de tests pour 15
modules, un test de propriété sur 500 configurations, des fixtures dorées, et
une discipline client/serveur explicite. Les cinq constats portent tous sur la
**frontière** du moteur — ce qui l'entoure, pas ce qu'il calcule.

| #   | Constat                                                     | Sévérité     | Effort  |
| --- | ----------------------------------------------------------- | ------------ | ------- |
| D1  | `CalcFinalStat` modélisé deux fois, sans oracle croisé      | **Moyenne+** | ~1 h    |
| D2  | `DebugHarness` (691 l.) dans le bundle client de production | Moyenne      | 15 min  |
| D3  | ~23 Mo de JSON en import statique dans le wrapper serveur   | Moyenne      | ~30 min |
| D4  | `DamageCalculatorBrowser.tsx` — 4 050 lignes                | Dette        | Élevé   |
| D5  | `preset-target.ts` mélange les deux voies de chargement     | Faible       | 5 min   |

---

## Ce qui est SAIN (à ne pas re-auditer)

- **Couverture du moteur** : 12 fichiers de tests pour 15 modules — le meilleur
  ratio du repo. `sheet.test.ts` porte un **test de propriété sur 500
  configurations** qui prouve que la reconstruction par couches est exactement
  égale à `calcFinalStat`. `fixtures.test.ts` rejoue des fixtures dorées.
- **Arithmétique du moteur** : `formula.ts` calcule en `BigInt` avec division
  tronquée vers zéro, pour coller au binaire et éviter toute dérive flottante.
  Chaque fonction porte sa RVA (`CalcFinalStat — RVA 0x2C59E48`).
- **Discipline client/serveur** : `preset-target.ts` est **volontairement hors du
  barrel** `index.ts` (`preset-target.ts:8-10`) pour ne pas tirer `node:fs` dans
  les bundles client. C'est le bon réflexe, documenté sur place.
- **Pureté du tirage** : `checkProbability` reçoit son `roll` en paramètre au
  lieu d'appeler `Math.random()` — le moteur reste testable et déterministe.
- **Pont d'état partagé** : le harnais passe par `buildInputsFromZ`, le même
  chemin que `fixtures.test.ts`. Ce qui est capturé est ce qui est rejoué.

---

## D1 — `CalcFinalStat` est modélisé deux fois, sans oracle croisé

**Sévérité : Moyenne+** · **Effort : ~1 h** · Le seul constat qui touche à la
correction fonctionnelle sur la durée.

Deux implémentations indépendantes de la **même** formule du binaire :

|                | [`lib/damage/formula.ts:100`](../../src/lib/damage/formula.ts#L100) | [`lib/stat-compose.ts:102`](../../src/lib/stat-compose.ts#L102) |
| -------------- | ------------------------------------------------------------------- | --------------------------------------------------------------- |
| Arithmétique   | `BigInt`, division tronquée                                         | `Math.trunc` sur flottants                                      |
| Signature      | objet, 12 champs                                                    | 8 paramètres positionnels                                       |
| Couches gérées | + `monadEnchant`, `spawnAdvantage`, `itemOption`                    | absentes                                                        |
| Tests          | `formula.test.ts` + **propriété sur 500 configs** (`sheet.test.ts`) | 10 tests via `char-progression.test.ts`                         |
| Alimente       | le calculateur de dégâts                                            | **la fiche personnage publique**                                |

Les deux ont été dépliées : elles sont **mathématiquement équivalentes** sur le
sous-ensemble commun, avec la correspondance suivante —

| `stat-compose` | `damage/formula`            |
| -------------- | --------------------------- |
| `awakFlat`     | `awakeningValue`            |
| `awakPM`       | `awakeningValueRate`        |
| `transcendPM`  | `transcendentStarValueRate` |
| `buffFlat`     | `buffValue`                 |
| `buffPM`       | `buffValueRate`             |
| `codexPM`      | `archiveStatValueRate`      |

Deux conséquences :

1. **Rien ne teste qu'elles restent d'accord.** Chacune a ses tests, aucun oracle
   croisé. Une correction du modèle appliquée d'un seul côté diverge en silence —
   et c'est la **fiche personnage**, la page la plus vue du site, qui porte la
   version sans test de propriété.
2. `Math.trunc` sur une division flottante peut diverger de la division entière
   `BigInt` par off-by-one (`Math.trunc(2.9999999999999996) === 2`). Improbable
   aux magnitudes du jeu — mais c'est précisément ce que le `BigInt` de
   `formula.ts` a été mis là pour éviter. Le raisonnement qui a imposé `BigInt`
   au moteur vaut pour l'affichage.

**Correctif** — faire déléguer `stat-compose.calcFinalStat` à
`formula.calcFinalStat`, champs manquants à `0`. Une seule source de vérité, et
le test de propriété existant couvre alors les deux usages. Attention : le
module doit rester **client-safe** (il est importé par
`StatsRankingSection.tsx`) — `formula.ts` est du calcul pur sans `node:fs`, donc
l'import est sûr, mais c'est à vérifier au moment du branchement.

## D2 — `DebugHarness` (691 lignes) est dans le bundle client de production

**Sévérité : Moyenne** · **Effort : 15 min**

[`DamageCalculatorBrowser.tsx:42`](../../src/app/[lang]/tools/_contents/damage-calculator/DamageCalculatorBrowser.tsx#L42)
l'importe **statiquement**, alors qu'il est opt-in :

```ts
const [devMode, setDevMode] = useState(DEV_BUILD); // ligne 1113
// ...activé en prod par `?dev=1` (ligne 1351), pour les beta-testeurs
```

Tout visiteur de `/damage-calculator` télécharge et parse un harnais qu'il ne
verra jamais. L'opt-in appelle exactement `next/dynamic` :

```ts
const DebugHarness = dynamic(() => import('./DebugHarness').then((m) => m.DebugHarness));
```

Comportement identique, 691 lignes hors du chemin critique. À noter :
**`next/dynamic` n'est utilisé nulle part dans le projet** (0 occurrence sur 149
composants clients) — ailleurs le découpage par route de Next suffit, ici non.

## D3 — ~23 Mo de JSON en import statique dans le wrapper serveur

**Sévérité : Moyenne** · **Effort : ~30 min** · Impact **dev + build**, pas le
bundle client.

[`index.tsx`](../../src/app/[lang]/tools/_contents/damage-calculator/index.tsx)
importe statiquement :

| Ligne    | Fichier                                          | Taille     |
| -------- | ------------------------------------------------ | ---------- |
| 37       | `generated/monster-skills.json`                  | **9,0 Mo** |
| 48       | `generated/skills.json`                          | 5,9 Mo     |
| 35       | `generated/damage/targets.json`                  | 4,5 Mo     |
| 36       | `generated/damage/buffs.json`                    | 3,9 Mo     |
| 26,27,49 | `progression`, `damage/growth`, `damage-scaling` | ~0,2 Mo    |

Or le projet a **exactement** un mécanisme pour ça, et son commentaire nomme le
fichier en cause :

> [`src/lib/data/disk.ts`](../../src/lib/data/disk.ts) — « Un `import` statique de
> ces JSON les fait entrer dans le graphe de modules : chaque « Enregistrer » de
> l'admin (qui réécrit `monsters.json` — 5,8 Mo — et **`monster-skills.json` —
> 8,7 Mo**) déclenchait alors une recompilation Turbopack de toutes les routes
> concernées, **10 à 40 s de « Compiling… »** entre deux monstres. »

[`src/lib/data/monsters.ts:25`](../../src/lib/data/monsters.ts#L25) charge ce
même `monster-skills.json` par `loadDataJson` — la voie prévue. Le calculateur
réintroduit la voie que `disk.ts` a été écrit pour supprimer.

**Précision importante** : ces imports sont dans un **server component**, ils ne
partent donc **pas au client**. Le coût est (a) la recompilation Turbopack en
dev à chaque sauvegarde admin touchant ces fichiers, (b) le temps et la mémoire
de build. Pas la charge utile du visiteur.

**Correctif** — router les quatre gros par `loadDataJson('generated/…')`, comme
`monsters.ts`. Les petits (`growth`, `config`, `damage-scaling`) peuvent rester
en import statique, ils ne pèsent rien.

## D4 — `DamageCalculatorBrowser.tsx` : 4 050 lignes

**Sévérité : Dette** · **Effort : Élevé** · À arbitrer, pas à corriger dans
l'urgence.

C'est le **plus gros fichier du dépôt**, à plus du double du second
(`TierListMakerBrowser.tsx`, 1 999 l.). Même famille que **F9** (composants
admin de 750 à 1 000 lignes), à une autre échelle.

Le fichier mélange au moins cinq responsabilités : état du formulaire, résolution
des presets, encodage/décodage `?z=`, rendu des tables de résultat, cycle de
capture du harnais. Les frontières naturelles sont déjà visibles dans le code
(les blocs commentés `── … ──`), ce qui rend l'extraction mécanique plutôt que
risquée.

Recommandation : **ne pas découper tant que le moteur bouge** — le fichier est le
lieu de la boucle de revue en cours. Mais poser le découpage comme condition de
sortie du chantier, avant le passage `unlisted` → `available`.

## D5 — `preset-target.ts` mélange les deux voies de chargement

**Sévérité : Faible** · **Effort : 5 min**

[`preset-target.ts:13`](../../src/lib/damage/preset-target.ts#L13) importe
`encounters.json` **statiquement**, alors que le même module documente en
en-tête que `getMonster` lit **au disque** (`loadDataJson`) — et c'est cette
lecture disque qui justifie son exclusion du barrel :

```ts
/** PAS exporté du barrel `src/lib/damage/index.ts` : `getMonster` lit au
 *  DISQUE (loadDataJson) — ce module est serveur/node UNIQUEMENT […] */
import encountersData from '@data/generated/encounters.json'; // ← l'autre voie
```

Deux voies pour le même domaine dans le même fichier. Sans conséquence
fonctionnelle (le module est serveur de toute façon), mais c'est le genre
d'incohérence qui rend la règle illisible pour le prochain. `loadDataJson`
partout dans ce module, ou l'import statique assumé et le commentaire ajusté.
Converge avec **D3** : même geste, même passe.

---

## Backlog proposé

**P1 — pendant que le chantier est ouvert**

- **D1** — `stat-compose` délègue à `formula`. Le seul constat à effet durable :
  supprime la possibilité même d'une divergence entre la fiche perso et le
  calculateur.

**P2 — petits, gain net**

- **D2** — `DebugHarness` en `next/dynamic` (15 min, −691 l. du bundle).
- **D3 + D5** — router les gros JSON par `loadDataJson`, même passe.

**P3 — condition de sortie du chantier**

- **D4** — découpage de `DamageCalculatorBrowser.tsx`, à faire **après** la
  stabilisation du moteur, avant `unlisted` → `available`.

## Note de méthode

Constats établis de première main : lecture du code, comptages de lignes
(`wc -l`), tailles de fichiers réelles, et suivi des graphes d'import
(`grep` sur les spécificateurs de module). Les équivalences de **D1** ont été
vérifiées en dépliant les deux implémentations terme à terme, pas en se fiant
aux commentaires.

Deux hypothèses ont été **écartées après vérification**, et ne figurent donc pas
comme constats :

- `createSession()` du pull-simulator (voisin dans `tools/`) est déterministe —
  le `Math.random()` est confiné à `rollSingle`. Pas de risque d'hydratation.
- Les `<img>` du calculateur sans `width`/`height` sont dans des conteneurs à
  taille fixe CSS — pas de CLS.
