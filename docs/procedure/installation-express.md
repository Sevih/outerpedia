# Install — aide-mémoire (commandes seules)

Explications : [installation.md](installation.md).

## Prérequis manuels

1. Installer **git**.
2. Lancer **LDPlayer** + Outerplane **installé et connecté**.
3. Récupérer **`.env.local`** (gestionnaire de mots de passe / backup).

## Depuis zéro

```powershell
# PowerShell EN ADMIN
git clone https://github.com/Sevih/outerpedia.git outerpedia-v3
cd outerpedia-v3
# → déposer .env.local à la racine
powershell -ExecutionPolicy Bypass -File scripts\init.ps1
pnpm dev
```

Si `init.ps1` vient d'installer nvm/rclone (PATH pas encore à jour) : rouvrir un
terminal admin, `cd outerpedia-v3`, relancer la même ligne `init.ps1` (idempotent).

## Mises à jour ensuite

```powershell
pnpm datagen:patch          # pull → extract → convert → build → diff (dry)
pnpm datagen:promote --apply # valider
pnpm datagen:dump           # seulement si le jeu a patché son CODE (nouveau .so)
pnpm images                 # push assets R2 (avant push git)
```
