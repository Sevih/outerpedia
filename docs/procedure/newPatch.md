# Procédure — patch du jeu

Le détail (flux, garanties, rétention, versionnage de boss) vit dans
[datagen/README.md](../../datagen/README.md) — ce fichier n'est que le
pense-bête, pour ne pas maintenir deux docs.

Prérequis : le client Steam installé et lancé une fois depuis le patch (il se met
à jour au lancement). Secours LDPlayer : `pnpm datagen:patch-android`, racine
`.gamedata-android/` — cf. datagen/README § « Récupérer les données du jeu ».

Le cycle se joue dans `pnpm quick`, Accueil › Patch : « Lancer » (le
`datagen:patch` ci-dessous), « Dry-run » puis « Promouvoir » (`datagen:promote`,
puis `--apply`), « Committer » (`pnpm commit --no-push`), et « Pousser » dans
l'en-tête. Les mêmes étapes, à la main :

```bash
pnpm datagen:patch           # pull → extract → convert → build → résumé du diff (dry)
                             # + dump/ASM si le CODE a changé, + pipeline DAMAGE
                             # (anim-events + data/generated/damage — intégré le
                             # 25/08 : le patch 1.4.15 l'avait laissé derrière),
                             # qui se termine par `damage:check` : rejeu des
                             # fixtures dorées, chaque Δ imprimé — une dérive
                             # après patch = le jeu a changé, à revérifier en jeu

pnpm datagen:promote --apply # si le résumé est cohérent : valider
pnpm datagen:regen           # après une correction curée (quick, Effets…) : build + apply
pnpm images                  # assets:collect + assets:push (R2) — AVANT le push git
```

Vérifier dans quick — Données › Extraction, la revue par cible et
l'intégration entité par entité —, puis publier :

```bash
pnpm commit                  # contrôles → bump version → images R2 → commit + push
```

Ou à la main :

```bash
git add data/generated data/curated
git commit -m "data: patch <version>" && git push
```

## La feuille de route du patch

Un patch se prépare dans `docs/patch-<AAAA-MM-JJ>.md` (date de la mise en
service), **pas** dans [TODO.md](../TODO.md) : une mise à jour du site n'est pas
du backlog. Le fichier est jetable — supprimé dans le commit qui le solde, son
bilan part dans [DONE.md](../DONE.md).

Il ne contient **que ce qu'il y a à faire** : une case = un geste. Pas de
résumé du patch note, pas de justification, pas de tableau de récompenses — le
patch note est déjà dans `data/patch-notes/posts.json`, et ce qui doit se
retenir d'un patch à l'autre s'écrit ici, dans cette procédure.

Et **rien de supposé** : un id de perso deviné, une date extrapolée, un nom de
fichier probable n'ont pas leur place dans une liste de gestes — relus demain,
ils se lisent comme du constaté. Ce qui n'est pas encore connu se découvre au
diff ; le geste, lui, s'écrit sans le chiffre.

Deux exceptions valent la place qu'elles prennent : la liste de ce qu'on a
**écarté** (sinon on la refait au patch suivant) et un point qui demande une
**décision** plutôt qu'un geste.

## Ce que le pipeline ne fait PAS : la couche curée

`datagen` intègre le perso, ses skills, son EE et ses items — il ne **décide**
rien. Deux saisies restent, **toutes deux dans quick, Éditeurs › Fiche perso**
(jamais à la main dans les JSON), et chacune alimente plusieurs pages : l'oubli
ne casse rien, il laisse un trou silencieux. D'où la carte.

| Où saisir                                                                                                 | Ce qui l'affiche                                                                             |
| --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| sous-onglet Fiche — rôle, priorité des skills, vidéos, puis rangs PvE et PvP (aussi dans Données › Rangs) | fiche perso, `/tierlist`, tierlistpve/pvp, tier-list-maker, contribute/ranking-helper        |
| sous-onglet Gear reco — la reco d'équipement                                                              | fiche perso, `/equipment/<slug>` (« qui utilise »), gear-usage-finder, gear-usage-statistics |
| sous-onglet EE — `rank`, `rank10` (aussi les cellules « EE base » et « EE +10 » de Données › Rangs)       | `/equipment`, `/equipment/<slug>`, fiche perso, ee-priority-base, ee-priority-plus10         |

Un seul piège, et il prévient : une mécanique de perso sort souvent un `BT_`
inédit (précédents : `BT_2000065_A`, `BT_2000094`), que le build **warn**. Tant
que le type n'est pas classé dans `effect-families.json`, le filtre buff/debuff
de `/characters` a un trou.

Rien à saisir en revanche pour : `banner.json` (un héros qui rejoint la
bannière **premium**, permanente, n'y entre pas — le fichier ne porte que les
pickups limités/saisonniers), `most-used-units` (il agrège les compos des
guides) et `team-planner` (il ne lit que du généré).

## Saison de boss qui revient (Joint Challenge, world boss…)

Deux gestes distincts, tous les deux dans `pnpm quick` :

1. **Le boss a changé dans le jeu** (même id, contenu modifié) — et seulement
   dans ce cas : sur sa fiche (Données › Extraction › Monstres › « Fiche »),
   « 1. Figer l'état actuel » AVANT « 2. Intégrer l'extraction ». « Figer et
   ré-épingler » montre d'abord son plan — la clé `<id>@<n>` qui sera créée, le
   commit figé, les guides touchés, gardés, en attente —, puis fige l'état
   COMMITTÉ dans `data/generated/monster-archive/<id>@<n>.json`, épingle dessus
   les versions de guides qui le désignaient encore en live, re-date les guides
   touchés et committe le tout, en un geste. L'ancienne version du guide lit
   alors l'archive ; la nouvelle suit le live.
2. **La nouvelle version du guide** : Guides › le guide › « ＋ version » crée
   `versions/<AAAA-MM>/` (une copie de la précédente, sans son épinglage). Puis
   réviser `config.json` / `recommended.json` / `teams.json` / `tips.json`
   depuis la version précédente — le roster a bougé entre deux saisons ;
   « Enregistrer » re-date `meta.json.updated` (à la main : `pnpm stamp:guides`).

`pnpm datagen:version-boss <id> --ref <commit>` ne crée PAS de version de
guide : c'est le rattrapage en ligne de commande du figeage — l'archive d'un
état déjà recouvert par des commits — et il ne ré-épingle aucun guide.

## Un correctif de jeu peut périmer de l'éditorial

Le pipeline rafraîchit les **chiffres**, jamais les **phrases**. Une refonte de
système laisse donc des textes faux derrière elle (ex. 12/08/2026 : les taux de
réussite de l'ascension Singularity supprimés, alors que le guide `gear` et la
carte d'ascension de `/equipment/<slug>` les décrivaient encore). Relire le
patch note en cherchant ce qui est _décrit_ sur le site, pas seulement _calculé_.

Et l'éditorial ne vit pas que dans `_contents/` : des **règles de jeu sont
écrites en dur dans le code** là où aucune table ne les porte, et elles se
périment pareil. Le raté du 12/08 en est l'exemple — le « 2 entries per day »
n'était pas dans un guide mais dans `src/lib/data/guide-categories.ts` : cherché
dans les guides, on ne le trouvait pas. Les endroits vérifiés le 25/08 :

- `src/lib/data/guide-categories.ts` — fiches de catégorie (entrées par jour,
  coûts, description du mode) ;
- `src/lib/gacha.ts` — `GUARANTEE_OF`, la garantie du pull simulator (100
  tirages, plafond par bannière) : elle vient des notes de patch, pas des tables ;
- `guides/_contents/general-guides/banner-mileage/index.tsx` — `MILEAGE_OF`
  (bannière → monnaie de mileage) et `STANDARD_REWARDS` (doublons → wildcards),
  qu'aucune table ne relie ;
- `components/guides/editorial/banner/*.tsx` — libellés de chrome des bannières.

Le réflexe qui rattrape ça : `grep` le chiffre ou le terme du patch note dans
`src/` en entier, pas seulement dans `_contents/`.
