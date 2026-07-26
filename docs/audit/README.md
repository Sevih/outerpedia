# Audit — synthèse consolidée (extraction + admin + extractor)

> Vue commune des **trois** volets, **dédupliquée**, avec un backlog unique
> priorisé. Fait le **2026-07-26**. Les rapports de détail restent la source :
>
> - [extraction.md](./extraction.md) — pipeline `datagen/extract/` (device → pool, constats **E1–E8**)
> - [admin.md](./admin.md) — panneau admin `src/{app,components,lib}/admin` (constats **F1–F9**)
> - [extractor.md](./extractor.md) — moteur de revue/intégration `datagen/extractor/` (constats **X1–X6**)
>
> Ce document ne réécrit pas les constats : il **relie**, dédoublonne les
> recouvrements et donne UN ordre de traitement pour les trois à la fois.

## Verdict croisé

Les deux volets sont **sains** : sécurité admin solide (27/27 routes gardées, 0
eslint sur 21 500 lignes), pipeline d'extraction mûr et bien gardé. Aucun bug
ouvert sur le chemin nominal de part et d'autre. Le vrai risque partagé n'est pas
l'exposition, c'est la **durabilité de la donnée éditoriale** — et il se joue dans
**un fichier commun aux deux volets**.

## Le point de fusion : `datagen/lib/json.ts`

C'est le **socle partagé** admin ↔ extraction, et il concentre le seul constat de
sévérité Haute de tout l'audit.

- **F1 (Haute)** — `writeJson` écrit sans fichier temporaire → une interruption
  laisse un JSON tronqué. Aggravé par `readCuratedJson` qui **lève** sur JSON
  cassé (bon en soi) : un save interrompu **bloque `pnpm dev` et le build**.
  Surface : 53 sites d'écriture, dont `characters.json` (243 Ko de travail
  éditorial).
- **Correctif = 3 lignes**, un seul endroit (write-tmp + `renameSync` atomique).
- **Bénéficie aux DEUX volets** : l'admin écrit ces curés, les générateurs
  d'extraction les relisent. **À corriger une seule fois** — ni deux fois, ni en
  double PR. C'est le premier geste, avant tout le reste.

> Corollaire : toute décision de **format ou d'atomicité** des `data/curated/*.json`
> est commune. F3 (validation de forme des payloads) protège l'entrée du même
> tuyau — à penser avec F1.

## Recouvrements (traiter une fois, pas deux)

| Thème                                     | Volet admin                             | Volet extraction                                                    | Fusion                                                            |
| ----------------------------------------- | --------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Écriture atomique**                     | F1 (`writeJson`)                        | relit ces curés                                                     | **même fichier `json.ts`** → 1 fix                                |
| **Duplication « régler à la source »**    | F4 (échafaudage translate ×6)           | E3 (parsing en-tête PNG ×3 + `maxTasks` ×2)                         | même passe qualité, fixes indépendants                            |
| **Cœurs non testés qui écrivent/parsent** | F8 (16 stores qui écrivent, 3 tests/48) | E1 (parsers `ls -lR`/`md5sum`, classifieurs wp)                     | 1 chantier tests, priorité aux fonctions qui **mutent la donnée** |
| **Confinement d'entrée**                  | F6 (slug guide, pas de garde `..`)      | E8 (interpolation shell adb)                                        | idiome maison existe (`route.dev.ts:25`) — aligner                |
| **Robustesse silencieuse**                | F7 (read-merge-write concurrent)        | E2 (suppression locale sur miss de listing), E5 (collision flatten) | même classe : perte silencieuse, rendre bruyant                   |

Le **volet extractor (X)** s'inscrit dans deux de ces thèmes : **X2** (lecture ratée
→ `{}` → wipe) rejoint « robustesse silencieuse » **et** le socle F1 —
`readCuratedJson` est le remède commun aux trois (**F1 / E2 / X2**) ; **X1** (specs
`character`/`monster` non testées) rejoint « cœurs non testés qui mutent » (**F8 /
E1 / X1**).

## Le troisième volet : `datagen/extractor/` (ex-angle mort, désormais audité)

Deux dossiers aux noms presque identiques, à ne pas confondre :

| Dossier              | Rôle                                                                       | Taille                     | Audité ?          |
| -------------------- | -------------------------------------------------------------------------- | -------------------------- | ----------------- |
| `datagen/extract/`   | pipeline device → pool                                                     | 7 fichiers · 1 160 l.      | **oui** (volet E) |
| `datagen/extractor/` | moteur de revue/intégration (`reviewAll`, `integrate*`, `specs/`, `core/`) | 13 fichiers · **2 699 l.** | **oui** (volet X) |

C'était l'angle mort des deux premiers audits — **plus du double** de la zone
`extract/`, et au centre du flux (l'admin le consomme via `review-store`, une
façade). Il est maintenant couvert : [extractor.md](./extractor.md). Verdict
**sain** ; les trois constats qui comptent :

- **X1** — les **specs** (`character.ts` 887 l., `monster.ts` 347 l.) n'ont **aucun
  test**, alors qu'elles portent la logique d'extraction — et que le bug NPC de la
  session (skills 14/15/16 sur 2000001, corrigé via `CharacterChangeTemplet`) y
  vivait. Le chemin d'intégration, lui, EST testé (`changes`/`validate`/`integrate`).
- **X2** — `review.readCommitted` et `integrate.readJsonOr` avalent un parse-error
  en `{}` → **risque de wipe** au merge (même famille que F1/E2, cf. Convergences).
- **X3** — le **1 320 ms** de `reviewAll` : `character`/`monster` ne sont **pas
  mémoïsés** dans `targets.ts` (contrairement à equipment/item) → reconstruction
  complète à chaque appel. Levier perf le plus sûr — mirroir du cache existant.

## Backlog unique priorisé

> ✅ **Déjà fait le 26/07** (côté datagen, Claude) : **F1** `json.ts` atomique
> (`f4fc6d4`, +tests concurrence renforcés) · **E3** helper PNG partagé (`706ee03`)
> · **E2** garde anti-purge miroir (`db6afaf`) · **E4** timeout extraction
> (`918a130`). Reste ci-dessous.

**P1**

- _(fait — F1)_ — socle atomique en place, protège les trois volets.

**P2 — robustesse & duplication (petits, gain net)**

- **F3** — try + validation de forme des payloads d'écriture (garde l'entrée de F1).
- **F6** — confinement du chemin guide (`slug`/`fromKey`) — 1 ligne, idiome maison.
- **X2** — router `review.readCommitted` / `integrate.readJsonOr` par `readCuratedJson` (supprime le risque de wipe ; converge avec F1).
- **X3** — mémoïser `character`/`monster` dans `targets.ts` (mirroir equipment/item) → coupe le gros du **1 320 ms**.
- **F4** — hook `useAutoTranslate` (dédup translate ×6, allège aussi F9).

**P3 — tests**

- **F8 + E1 + X1** — tests des fonctions qui **mutent/parsent** : 16 stores admin, parsers `ls -lR`/`md5sum`, prédicats de specs (`isInnatePierce`, exclusion NPC de `select` — le siège du bug de la session).
- **E6** — parallélisme dédup wallpapers.

**Dette (au fil de l'eau)**

- **F2** — frontière `admin/` (documenter les modules qui shippent, ou extraire `lib/editorial/`).
- **F9** — taille des composants (F4 en retire une part) ; **E7** élagage blocklist wallpapers (après mesure) ; **F5** aperçus au montage ; **F7** concurrence stores ; **X4** micro-opt du diff (négligeable).

## Note de méthode

**Provenance des constats** — les deux volets ont été audités séparément, et cette
distinction compte pour arbitrer :

- **F1–F9** (admin) : mesurés de première main — chronos (`reviewAll` 1 320 ms,
  scan de tags 120 ms), comptages (27/27 routes, 53 sites d'écriture, 8 entrées
  publiques), exécution réelle des résolveurs. Chaque chiffre du volet admin est
  reproductible.
- **E1–E8** (extraction) et **X1–X6** (extractor) : audités de première main
  (lecture du code + comptages : 7 fic./1160 l. et 13 fic./2699 l.). Les X ont été
  écrits en relisant `extractor/` directement, pas depuis un résumé. Les sévérités
  et références `fichier:ligne` sont celles de leurs rapports respectifs.

`DONE.md` n'est pas alimenté depuis cette synthèse (modifs non commitées du worker).
`TODO.md` porte déjà la répartition par rôle (section « Suite d'audit », arbre de
travail) — Claude a coché F1/E2/E3/E4 faits. Sevih tranche ce qui reste à trier.
