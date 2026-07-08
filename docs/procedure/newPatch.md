```bash
pnpm datagen:patch           # pull → extract → convert → build → résumé du diff
pnpm datagen:promote --apply # si le résumé est cohérent : valider
pnpm datagen:regen           # après une correction curée (/admin/effects…) : build + apply
pnpm images                  # assets:collect + assets:push (R2)
git add data/generated data/curated      # 2. le validé + le curé
git commit && git push
```
