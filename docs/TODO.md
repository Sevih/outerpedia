# TODO

> Le « à faire » uniquement. Le « fait », son contexte et les notes vont dans
> [DONE.md](./DONE.md) ; une section vidée est retirée.

---

## 🎴 Portraits animés

> Rapport : [audit/portrait-fx.md](./audit/portrait-fx.md).

- [ ] **Un nouvel effet arrive sans geste manuel** (demande Sevih 05/10) :
      aujourd'hui il faut l'inscrire dans `DEFAULT_EFFECTS`, sinon il n'est
      pas extrait et `pnpm test` bloque le patch. Cible : extrait d'office,
      servi s'il est entièrement rendable, sinon portrait statique et signalé
      par le refresh, sans rien bloquer. Solde P8 au passage. Lot F12 (agent
      Fable, seul), écrit dans
      [lots-opus-2026-09-25.md](./lots-opus-2026-09-25.md).
- [ ] **Constats Basse restants de l'audit** : P7 (trous dans « refuser
      plutôt que rendre de travers »), P8 (`by_character()` rend `{}` sans
      la table parsée), P10 (coût par image : `SUPERSAMPLE` à dpr 2,
      `clientWidth` relu à chaque image, instanciation des billboards) ; de
      P9, les compteurs périmés hors des fichiers du lot F11 (`Portrait.tsx`,
      `portrait-fx.ts`, `extract-portrait-fx.py`, `refresh.ts`).

## 🧪 À jouer au prochain patch

- [ ] **Dry-run du flux patch (lot F7, G12)** : le correctif n'a pas pu être
      joué sans tirer les données du jeu. Test manuel décrit dans l'entrée
      DONE du lot F7 (03/10) — un run à blanc ne doit plus laisser
      d'artefact damage bâti sur le `skills.json` d'avant le patch.
