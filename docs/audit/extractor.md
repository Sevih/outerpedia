# Audit — moteur d'extraction/revue (`datagen/extractor/`)

> Volet EXTRACTOR (constats **X1–X6**), l'angle mort identifié par les deux
> premiers audits (cf. [README.md](./README.md), § Angle mort). À NE PAS confondre
> avec `datagen/extract/` (pipeline device → pool, volet **E**). Fait le
> **2026-07-26**, lu de première main. État de référence : commit `918a130`.

## Périmètre

`datagen/extractor/` = **13 fichiers source · 2699 l.** (+ 4 tests). Le moteur qui,
à partir des tables du jeu, RECONSTRUIT chaque entité en mémoire pour la confronter
au committé (revue « le jeu a bougé, qu'est-ce qui change ? ») et l'INTÈGRE au clic.

| Bloc              | Fichiers                                                               | Rôle                                                                            |
| ----------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Framework `core/` | spec, runner, validate, changes                                        | contrat déclaratif + runner générique + validateur runtime + moteur de diff pur |
| Specs             | `specs/character.ts` (887 l.), `specs/monster.ts` (347 l.)             | tout le savoir de mapping d'une entité                                          |
| Revue             | `review.ts` (190 l.), `targets.ts`                                     | `reviewAll`/`reviewTarget`/`acceptTypos` + registre des cibles                  |
| Intégration       | `integrate.ts` (260 l.), `integrate-equipment.ts`, `integrate-item.ts` | merge validé dans `data/generated/`                                             |
| Divers            | `transcend.ts`, `version-monster.ts`                                   | sorties dérivées                                                                |

## Verdict : **sain, bien conçu**

Le framework spec→runner→validate est propre et extensible (ajouter une entité =
écrire une spec, pas copier une route). Le moteur de diff est 100 % pur. Les cœurs
d'intégration (destructifs) sont isolés à chemin injectable et **testés**
(`integrate.test.ts`). La spec perso est méticuleuse — le bug NPC de la session
(skills 14/15/16 sur 2000001) est corrigé ET documenté (`character.ts:659-670` :
bascule ressemblance → `CharacterChangeTemplet`). Constats : un **trou de tests**
sur les specs, une **perte silencieuse** partagée avec les autres volets, et un
**levier perf net** pour les 1320 ms.

---

## Constats (par sévérité)

### X1. [MOYEN] Les specs — le cœur du mapping — ne sont PAS testées

`specs/character.ts` (887 l.) et `specs/monster.ts` (347 l.) portent toute la
logique d'extraction, et c'est là qu'un vrai bug est passé (pollution des skills
NPC). **Zéro test.** Or les cœurs y sont massivement PURS et testables sans
`.gamedata` :

- `isInnatePierce` (`character.ts:103`) — LA distinction fine du tag ignore-defense
  (buff vs dégâts conditionnés vs pénétration innée) : 5 conditions, exactement le
  genre de prédicat qui régresse en silence.
- `ownIdentity` (324), `slugAfter` (314), `cleanVoiceActor` (333),
  `resolveVoiceActor` (348), `extractStats` (381, déjà exporté) — purs.
- La logique de `select()` (exclusion formes/fusions/NPC) et de tags
  (`recruitTagById`, priorité collab) — le siège du bug NPC — mérite un test sur
  entrées synthétiques.

> Reco : même méthode que le lot générateurs/extraction — tester les prédicats de
> classification en premier (`isInnatePierce`, l'exclusion NPC de `select`), là où
> un retour de bug coûte le plus cher.

### X2. [MOYEN] Perte SILENCIEUSE du committé → risque de WIPE au merge

Deux lecteurs avant écriture confondent « fichier ABSENT » (normal) et « fichier
CASSÉ » (erreur à stopper), en renvoyant `{}` dans les deux cas :

- `review.ts:27` `readCommitted` → `catch { return {} }`. Un `data/generated/*.json`
  corrompu fait voir TOUTES les entités comme « new » (diff faussé). Pire, au
  `writeBack` d'une cible à `subKey` (effets sous `glossaries.json`) :
  `{ ...readCommitted(file), [subKey]: data }` — si le fichier ne parse pas,
  `readCommitted` = `{}` → les autres clés du glossaire (classes, éléments…) sont
  **écrasées** à l'accept.
- `integrate.ts:44` `readJsonOr` → même `catch { return {} }`. Un `monsters.json`
  momentanément corrompu → merge d'un monstre sur `{}` → **tous les autres
  monstres perdus** à l'écriture.

C'est la **même classe** que F1/`readCuratedJson` (admin) et E2 (extraction) : une
lecture ratée traitée comme un vide, qui purge en silence. `readCuratedJson`
(`datagen/lib/json.ts`) fait DÉJÀ la bonne distinction (ENOENT → absent, parse
cassé → throw nommant le fichier) — mais ces deux lecteurs ne l'utilisent pas.

> Reco : router ces lectures par `readCuratedJson` (ou sa sémantique : ENOENT →
> `{}`, parse cassé → throw). Point de convergence avec F1.

### X3. [FAIBLE-MOYEN] Perf `reviewAll` (1320 ms) : `character`/`monster` non mémoïsés

`targets.ts` mémoïse `equipment()` (43-48) et `itemCatalog()` (63-68) sur
l'empreinte des tables — mais les cibles `character` et `monster` appellent
`buildCharacters()`/`buildMonsters()` **sans cache** (74-82). Chaque `reviewAll`,
puis chaque `reviewTarget`/`entityReview`/`targetBuild`/`acceptTypos` sur une de
ces cibles, **reconstruit l'extraction complète** (≈15 tables, `prepare` sur toutes
les lignes, `map` de chaque perso). L'admin enchaîne plusieurs de ces appels par
session de revue.

> Reco : mémoïser `character` et `monster` sur leur empreinte de tables, EXACTEMENT
> comme `equipment`/`itemCatalog` (même patron, quelques lignes). Levier le plus
> sûr et le plus consistant pour les 1320 ms. Profiler d'abord pour confirmer la
> part respective character/monster/equipment/item (mesure impossible ici sans
> `.gamedata`).

### X4. [FAIBLE] Diff : `stable()` re-sérialise les sous-arbres à chaque niveau

`core/changes.ts` `walk` teste `stable(a) === stable(b)` (sérialisation du
sous-arbre ENTIER) à chaque nœud, puis récurse — chaque enfant re-sérialise ce qui
faisait déjà partie du `stable` du parent. Négligeable en agrégat (peu d'entités
`changed` par revue ; les entités inchangées coûtent une seule sérialisation au
premier test). Micro-optimisation optionnelle, pas prioritaire.

### X5. [INFO] `validate` ne signale pas les clés INATTENDUES

`core/validate.ts` vérifie les champs DÉCLARÉS du schéma, mais un objet portant une
clé hors-schéma passe sans écart (schéma = plancher, pas plafond). Volontaire et
raisonnable ; noté pour mémoire — un jour où un champ fantôme se glisserait dans une
sortie, rien ne le dirait.

### X6. [INFO] Ce qui est SAIN (à ne pas re-auditer)

- Framework `core/` propre et générique ; validateur runtime maison sans dépendance.
- Cœurs d'intégration destructifs isolés + **testés** (`integrate.test.ts`,
  `integrate-equipment.test.ts`) ; `writeCanonicalJson` → bénéficie de F1 (atomique).
- Spec perso méticuleuse (gestion formes/fusions/NPC/apparences documentée).
- Moteur de diff pur, avec normalisation typo (séparation vrai écart / coquille).

---

## Synthèse actionnable

**Quick wins**

- **X3** — mémoïser `character`/`monster` dans `targets.ts` (mirroir equipment/item) → coupe le gros du 1320 ms.
- **X2** — router `readCommitted`/`readJsonOr` par `readCuratedJson` → supprime le risque de wipe (converge avec F1).

**Chantier**

- **X1** — tests des prédicats de spec (`isInnatePierce`, exclusion NPC de `select`, tags), là où le bug de la session vivait.

**Rien à faire** : diff (X4, négligeable), clés inattendues (X5, choix assumé), framework (sain).

## Frontière avec les autres volets

- **X2 ∈ même famille que F1 (admin) et E2 (extraction)** : « lecture ratée = vide
  silencieux → purge ». `datagen/lib/json.ts` `readCuratedJson` est le remède
  commun ; l'appliquer partout où on lit-puis-réécrit un fichier committé.
- Le moteur de diff (`core/changes`) est PARTAGÉ avec la revue admin — toute
  optimisation profite aux deux.
