# Procédure — ajouter une 4-cut comic

Les BD sont faites main (récupérées de Discord en jpg/png), ramenées en V3 dans
`.editorial/comics/` (gitignoré → R2). La liste est un **manifeste servi sur R2**
lu à la requête : ajouter une BD **ne demande AUCUN redéploiement**.

Détail de l'archi dans [DONE.md](../DONE.md) (entrée `/4-comics` du 19/07).

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
pnpm images   # convertit en webp + pousse images & comics.json sur R2 + purge l'edge
```

C'est tout. La BD apparaît sur `/4-comics` en **< 10 min**, sans build, sans
commit, sans `datagen:build` : le manifeste se régénère depuis le contenu du
dossier.

## Notes

- Rien à committer : les images sont hors git (R2), la liste vit sur R2.
- Le `data/generated/comics.json` du repo n'est qu'un **repli** (dev / R2 down).
  Pour le rafraîchir : `pnpm datagen:build` puis promote (facultatif, la prod
  n'en dépend pas).
