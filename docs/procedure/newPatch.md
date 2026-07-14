# Procédure — patch du jeu

Le détail (flux, garanties, rétention, versionnage de boss) vit dans
[datagen/README.md](../../datagen/README.md) — ce fichier n'est que le
pense-bête, pour ne pas maintenir deux docs.

Prérequis : LDPlayer lancé + Outerplane à jour.

```bash
pnpm datagen:patch           # pull → extract → convert → build → résumé du diff (dry)
pnpm datagen:promote --apply # si le résumé est cohérent : valider
pnpm datagen:regen           # après une correction curée (/admin/effects…) : build + apply
pnpm images                  # assets:collect + assets:push (R2) — AVANT le push git
```

Vérifier dans `/admin`, puis publier :

```bash
pnpm commit                  # contrôles → bump version → images R2 → commit + push
```

Ou à la main :

```bash
git add data/generated data/curated
git commit -m "data: patch <version>" && git push
```
