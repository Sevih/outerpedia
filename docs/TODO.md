# TODO

> Le « à faire » uniquement. Le « fait », son contexte et les notes vont dans
> [DONE.md](./DONE.md) ; une section vidée est retirée.

---

## 🩹 Patch du 06/10

- [ ] **Feuille de route** : [patch-2026-10-06.md](./patch-2026-10-06.md) —
      Demiurge Lambda, équilibrage de Sigma, contrôle des tours à 150 étages,
      guide de la Universal Tower, révision du Joint Challenge Annihilator,
      quantités hebdomadaires de Dimensional Singularity. La préparation du
      05/10 est commitée en local : ne pas pousser (ni `pnpm quick`) avant
      le patch.
- [ ] **Fin de l'Adventure License** : guides masqués, mode sorti de
      `most-used-units`, de `unlock-content`, du suivi de progression et des
      guides `quirk`, `daily-stamina`, `shop-purchase-priorities` (lot B20,
      FAIT le 05/10). Reste le lot **F13** de
      [lots-opus-2026-09-25.md](./lots-opus-2026-09-25.md) (calculateur de
      dégâts — agent Fable dédié, seul, après le `pnpm dev` du patch), et
      après ce `pnpm dev` : les priorités des produits arrivés au Survey Hub
      (éditorial, admin), les sources d'équipement du mode, l'icône d'onglet
      `ui/shop/al` du manifeste d'assets.

## 🧰 Outil quick

- [ ] **Onglet « Discord », suites du lot B24** : (a) Sevih essaie dans un
      vrai navigateur le presse-papiers de « copier la demande » et le
      formulaire « date » ; (b) les consignes de
      `scripts/quick/discord-prompt.md` sont tirées de DEUX résumés seulement
      (01/06 et 11/08/2026, les seuls du salon dont la première ligne porte
      « TL;DR ») : à corriger par Sevih après son premier jet réel, et à
      élargir si d'anciens résumés ont un autre titre.

## 🖥️ Deux PC, un serveur de dev

- [ ] **Fixe (Windows)** — le code y est depuis le push du 05/10 (`c9f3ccfb`,
      outils locaux seuls) : `git pull`, puis les quatre
      étapes de [la procédure](./procedure/test-subdomain-local.md) (ligne
      `DEV_PEERS`, ligne hosts `quick.outerpedia.local`, `pnpm
dev:caddy:install`, règle de pare-feu). La branche Windows de
      l'installeur n'a jamais tourné : vérifier qu'un `caddy.exe` répond après
      une réouverture de session, puis les deux sens (fixe lance / portable
      regarde, et l'inverse)
- [ ] **Portable** : lignes hosts `quick.outerpedia.local` et
      `es.outerpedia.local` (absente), puis valider la nouvelle ligne `dev` au
      prochain `pnpm dev`

## 🎴 Portraits animés

> Rapport : [audit/portrait-fx.md](./audit/portrait-fx.md).

- [ ] **Constats Basse restants de l'audit** : P7 (trous dans « refuser
      plutôt que rendre de travers » — à remonter depuis le lot F12 : un
      effet qui arrive est servi dès que `layerVerdict` passe, et un
      calque-maille y passe TOUJOURS ; `_Synchro`, joué en simulation, sort
      « servi tel quel » avec sa feuille UV 5×5 à tuile aléatoire non
      transcrite), P10 (coût par image : `SUPERSAMPLE` à dpr 2,
      `clientWidth` relu à chaque image, instanciation des billboards) ; de
      P9, les compteurs périmés hors des fichiers du lot F11 (`Portrait.tsx`,
      `portrait-fx.ts`, `extract-portrait-fx.py`, `refresh.ts`).

## 🧪 À jouer au prochain patch

- [ ] **Dry-run du flux patch (lot F7, G12)** : le correctif n'a pas pu être
      joué sans tirer les données du jeu. Test manuel décrit dans l'entrée
      DONE du lot F7 (03/10) — un run à blanc ne doit plus laisser
      d'artefact damage bâti sur le `skills.json` d'avant le patch.
- [ ] **Rapport des effets de portrait (lot F12)** : au premier patch qui
      apporte un effet, contrôler la dernière ligne du refresh (« ◆ Portraits
      animés — à lire ») — l'effet y est nommé avec ses porteurs, « servi tel
      quel » ou « en attente : … » ; puis `/dev/AnimatedPortrait`, où il a
      sa section générée, et le confronter au jeu. Les trois cas et quoi
      faire : entrée DONE du lot F12 (05/10).
