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
- [ ] **Fin de l'Adventure License** : les guides sont masqués ; ce qui cite
      encore le mode (tracker, guides généraux, quirks, calculateur) est le
      lot B20 de [lots-opus-2026-09-25.md](./lots-opus-2026-09-25.md), à
      lancer après le `pnpm dev` du patch (Opus, seul).

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
