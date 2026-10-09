---
name: relecture-lot
description: Relit un lot rendu par un agent (docs/lots-opus-2026-09-25.md) — périmètre du commit, entrée DONE, contrôles, rejeu — puis le range. À utiliser quand Sevih colle « Demande <lot> — commit hash <hash> » ou « Demande <lot> — bloque », ou demande de relire un lot.
argument-hint: <lot> <hash>
---

# Relecture d'un lot

Entrée : `$ARGUMENTS` — le code du lot et le hash de son commit, ou la ligne
rendue par l'agent telle que Sevih la colle (`Demande B39 : commit hash 1a2b3c4d`).

Le mode d'emploi des lots vit dans `docs/lots-opus-2026-09-25.md` : le prompt de
chaque lot ouvert, le message de lancement, le préambule commun. Un lot relu
sort de ce fichier ; sa trace est dans `docs/DONE.md`.

## Si l'agent rend « bloque »

Rien n'est commité. Lire la section du lot et la question posée. Trancher
seulement si une donnée du dépôt répond (une table du jeu, un enum, une
convention écrite) et citer la source ; sinon rendre la question à Sevih avec
une recommandation en une phrase. La réponse se termine par le message à
recoller à l'agent.

## Relire un commit

1. **Le contrat.** Lire la section du lot : la tâche, le hors périmètre, la
   vérification propre au lot, le message de commit attendu, les lots avec
   lesquels il ne tourne pas.
2. **Le périmètre.** `git show --stat --format='%H%n%s%n%b' <hash>` puis le diff
   lui-même, pas seulement la liste des fichiers :
   - un seul commit, le message attendu ;
   - aucun fichier hors périmètre, ni `package.json`, ni `pnpm-lock.yaml` ;
   - l'entrée `docs/DONE.md` en tête de la section du jour, et `docs/TODO.md`
     ajusté quand le lot le demande (les contrôles laissés à Sevih y sont) ;
   - rien d'emporté d'un autre lot (l'index git est partagé).
3. **Les contrôles.** `pnpm typecheck && pnpm lint && pnpm test`. Un lot qui
   touche `scripts/quick/` ajoute
   `NODE_ENV=development pnpm exec vitest run scripts/quick`. L'arbre de travail
   peut porter les fichiers d'un lot en cours : un échec situé dans ces fichiers
   n'est pas celui du lot relu, le dire sans y toucher (ni `stash`, ni
   `checkout`, ni `restore`).
4. **Le rejeu.** Vérifier ce que l'entrée DONE affirme, pas seulement que les
   tests passent : rejouer le module par `tsx` avec des stores et un git
   factices, relire les refus, compter ce qui est annoncé. Pour une interface,
   le banc — jamais le quick de Sevih, jamais un navigateur piloté à la main :
   - un quick isolé, clés vidées :
     `DISCORD_BOT_TOKEN= DEEPL_API_KEY= ANTHROPIC_API_KEY= DEV_PEERS= QUICK_PORT=<port libre> pnpm quick --no-open` ;
   - les captures par `node scripts/quick/shot.mjs --port <port> …`, dont le
     relais ne laisse passer que les lectures ;
   - par `curl`, seulement les `GET` et les `POST` de `READ_ONLY_POSTS`.
     Chaque autre `POST` de quick est un vrai geste (commit, push, R2, Discord).
     Une écriture se simule hors du dépôt, jamais dans `data/curated/`.
5. **Le verdict.**

## Validé

1. Entrée en tête de la section du jour de `docs/DONE.md` (`## AAAA-MM-JJ`, à
   créer si elle manque), dans le style des relectures voisines :
   `**Relecture <lot> (<modèle qui relit>) — <titre>, validé**`, puis le
   périmètre constaté, les contrôles avec leurs chiffres, ce qui a été rejoué,
   ce qui reste à contrôler par Sevih, et la suite.
2. Dans `docs/lots-opus-2026-09-25.md` : retirer la section du lot, et monter
   le compte de lots (et la date de fin) de l'en-tête.
3. Ce qui a été vu hors périmètre et mérite un suivi va au `docs/TODO.md`.
4. Commit, fichiers indexés explicitement, en une seule commande précédée du
   contrôle de l'index :
   `test -z "$(git diff --cached --name-only)" && git add docs/DONE.md docs/lots-opus-2026-09-25.md && git commit -m "docs(done): relecture <lot> — <l'essentiel> ; <lot suivant ou « aucun lot ouvert »>"`.
   Ajouter `docs/TODO.md` s'il a bougé. Si le contrôle échoue, un autre lot a
   des fichiers indexés : attendre et recommencer, ne rien désindexer.
5. Pas de push.

## Refusé

Rien n'est rangé, rien n'est commité. Dire ce qui manque ou dépasse, fichier et
ligne à l'appui, et donner le message à recoller à l'agent pour qu'il corrige
dans un nouveau commit. Ni `--amend` ni `revert` sur le commit d'un agent sans
l'accord de Sevih.

## La réponse à Sevih

Courte : validé ou non, le hash du commit de relecture, ce qu'il doit contrôler
lui-même à l'écran, et quoi lancer ensuite. Deux lots qui écrivent les mêmes
fichiers (`scripts/quick/`, les six locales, `datagen:build`) passent un par un.
