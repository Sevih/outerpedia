# Procédure — ajouter une 4-cut comic

Les BD sont faites main (récupérées de Discord en jpg/png), ramenées en V3 dans
`.editorial/comics/` (gitignoré → R2). La liste est un **manifeste servi sur R2**
lu à la requête : ajouter une BD **ne demande AUCUN redéploiement**.

Détail de l'archi dans [DONE.md](../DONE.md) (entrée `/4-comics` du 19/07).

## 0. Avoir le pool complet

`.editorial/` est gitignoré : un clone frais ne l'a pas, et deux machines
divergent. Sa source de vérité est R2 :

```bash
pnpm editorial:pull    # récupère le pool complet (BD + wallpapers)
```

**Obligatoire avant de publier depuis une machine secondaire** : le manifeste
est régénéré depuis le pool LOCAL, donc publier avec un pool partiel amputerait
la galerie. Un garde-fou retient le manifeste dans ce cas (il compare au seed
committé et te renvoie ici), mais le bon geste reste le pull.

## 1. Déposer l'image

Un fichier **jpg ou png** (tel quel depuis Discord) dans le dossier de la LANGUE
de la BD :

```
.editorial/comics/EN/    # anglais
.editorial/comics/JP/    # japonais
.editorial/comics/KR/    # coréen
```

Une BD existe souvent en 3 langues → déposer chaque version dans son dossier. Si
tu n'as que l'EN, juste `EN/`.

- **Le nom du fichier = l'ordre d'affichage** (tri alphabétique). Pour un ordre
  chronologique, préfixer par une date triable : `20260717_120000.png`.
- **jpg ou png uniquement.** Ne pas déposer de `.webp` brut (il serait listé mais
  pas poussé → 404).

## 2. Publier

```bash
pnpm images   # webp + ORIGINAUX sauvegardés sur R2 + manifeste poussé + purge de l'edge
```

La BD apparaît sur `/4-comics` en **< 10 min**, sans build, sans commit, sans
`datagen:build` : le manifeste se régénère depuis le contenu du dossier.

`pnpm images` enchaîne **`editorial:push`** avant la publication (depuis le
2026-08-21) : l'original est sauvegardé sur R2 avant que le dérivé parte. Ce
geste était manuel et s'oubliait — trois BD publiées depuis le fixe n'avaient
jamais eu leurs originaux sauvegardés, donc aucun `editorial:pull` ne pouvait
les ramener ailleurs.

## Notes

- Rien à committer : les images sont hors git (R2), la liste vit sur R2.
- `editorial:pull`/`push` sont des `copy`, jamais des `sync` : ils n'effacent
  rien, ni en local ni sur R2. Retirer une BD partout reste un geste manuel
  (puis `pnpm assets:collect-comics --force` pour écrire le manifeste réduit).
- **Garde-fou** : il compare les **noms**, pas les nombres — un pool qui échange
  3 BD contre 3 autres passait le test des comptes. Quand une BD servie manque au
  pool local, deux cas :
  - ses webp sont déjà sur R2 (le cas courant) → elle est **conservée au
    manifeste** et la galerie continue de la servir. Publier depuis une machine
    au pool incomplet est donc SANS PERTE : pas besoin d'avoir toutes les BD pour
    en ajouter une. Pense quand même à `editorial:push` depuis la machine qui
    détient l'original, sinon il reste non sauvegardé ;
  - ni original ici, ni dérivé sur R2 → le manifeste est retenu, et celui qu'une
    collecte précédente aurait laissé dans le staging est **retiré** (sans quoi
    `assets:push` enverrait une version périmée).

  `--force` court-circuite tout et écrit le pool local seul : c'est le geste du
  retrait VOLONTAIRE.

- Le `data/generated/comics.json` du repo n'est qu'un **repli** (dev / R2 down)
  — mais il n'est plus à rafraîchir à la main : `assets:sync-comics-seed`, dernier
  maillon de `pnpm images`, le réaligne sur le manifeste RÉELLEMENT en ligne une
  fois le push confirmé. C'est ce qui en fait une référence fiable pour le
  garde-fou ci-dessus. **Il est committé** : le prendre dans le commit qui suit la
  publication.
