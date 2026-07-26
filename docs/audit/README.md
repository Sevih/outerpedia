# Audit — synthèse consolidée (extraction + admin)

> Vue commune des deux volets, **dédupliquée**, avec un backlog unique priorisé.
> Fait le **2026-07-26**. Les deux rapports de détail restent la source :
>
> - [extraction.md](./extraction.md) — pipeline `datagen/extract/` (constats **E1–E8**)
> - [admin.md](./admin.md) — panneau admin `src/{app,components,lib}/admin` (constats **F1–F9**)
>
> Ce document ne réécrit pas les constats : il **relie**, dédoublonne les
> recouvrements et donne UN ordre de traitement pour les deux à la fois.

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

## Angle mort commun : `datagen/extractor/` NON audité

Deux dossiers aux noms presque identiques, à ne pas confondre :

| Dossier              | Rôle                                                                       | Taille                     | Audité ?          |
| -------------------- | -------------------------------------------------------------------------- | -------------------------- | ----------------- |
| `datagen/extract/`   | pipeline device → pool                                                     | 7 fichiers · 1 160 l.      | **oui** (volet E) |
| `datagen/extractor/` | moteur de revue/intégration (`reviewAll`, `integrate*`, `specs/`, `core/`) | 13 fichiers · **2 699 l.** | **non**           |

**Ni l'un ni l'autre audit ne l'a couvert** — et la zone non auditée est **plus du
double** de la zone auditée. Elle est pourtant au centre : l'admin la consomme via
`review-store`, qui n'est qu'une façade.

Ce qui rend le trou concret, mesuré le 26/07 :

- **Couverture partielle.** 4 fichiers de test existent et couvrent le chemin
  d'intégration (`changes`, `validate`, `integrate`, `integrate-equipment`) — c'est
  bien. Mais les **specs**, qui décident de ce qui est extrait, n'en ont **aucun** :
  `specs/character.ts` (**887 l.**, le plus gros module du dossier) et
  `specs/monster.ts` (347 l.).
- **Le trou est là où un vrai bug est passé.** La pollution des skills NPC
  (skills 14/15/16 sur le perso 2000001, corrigée cette session en basculant la
  détection de forme de la ressemblance vers `CharacterChangeTemplet`) vivait
  exactement dans `specs/character.ts`. Aucun test ne prévient sa réapparition.
- **Le coût perf y est aussi.** `reviewAll()` = **1 320 ms mesuré**, dans
  `review.ts` (190 l., non testé, non audité). Il était appelé deux fois par
  chargement de `/admin` — mémoïsé depuis le 26/07, mais le coût unitaire est
  **imputable à `extractor/`, pas à l'admin**.

→ **Prochain périmètre d'audit, et le plus rentable** : c'est à la fois le premier
candidat perf, le principal trou de tests et le lieu d'un bug déjà vécu.

## Backlog unique priorisé

**P1 — à faire même si rien d'autre**

- **F1** — `json.ts` écriture atomique (3 l., un fichier, protège les deux volets).

**P2 — robustesse & duplication (petits, gain net)**

- **F3** — try + validation de forme des payloads d'écriture (garde l'entrée de F1).
- **F6** — confinement du chemin guide (`slug`/`fromKey`) — 1 ligne, idiome maison.
- **E4** — timeout sur l'extraction bytes/images (aligné sur audio).
- **E2** — garde anti-suppression massive sur miss partiel de listing.
- **E3 + F4** — dédup à la source : helper PNG partagé (×3) ; hook `useAutoTranslate` (×6, allège aussi F9).

**P3 — tests & perf**

- **F8 + E1** — tests des fonctions qui **mutent/parsent** : 16 stores admin en tête, puis parsers `ls -lR`/`md5sum`.
- **E6** — parallélisme dédup wallpapers ; **[handoff]** `extractor/reviewAll` (1 320 ms).

**Dette (au fil de l'eau)**

- **F2** — frontière `admin/` (documenter les modules qui shippent, ou extraire `lib/editorial/`).
- **F9** — taille des composants (F4 en retire une part) ; **E7** élagage blocklist wallpapers (après mesure) ; **F5** aperçus au montage ; **F7** concurrence stores.

## Note de méthode

**Provenance des constats** — les deux volets ont été audités séparément, et cette
distinction compte pour arbitrer :

- **F1–F9** (admin) : mesurés de première main — chronos (`reviewAll` 1 320 ms,
  scan de tags 120 ms), comptages (27/27 routes, 53 sites d'écriture, 8 entrées
  publiques), exécution réelle des résolveurs. Chaque chiffre du volet admin est
  reproductible.
- **E1–E8** (extraction) : produits par l'audit du pipeline `datagen/extract/`,
  repris ici **sans re-vérification indépendante**. Les sévérités et les
  références `fichier:ligne` sont celles de ce rapport.
- **Chiffres d'`extractor/`** (§ Angle mort) : mesurés de première main le 26/07.

`TODO.md`/`DONE.md` ne sont pas alimentés depuis cette synthèse : ils portent des
modifs non commitées. Ce backlog est le matériau à trier ensemble ; Sevih décide ce
qui monte dans `TODO.md`.
