# TODO

> Le « à faire » uniquement. Le « fait », son contexte et les notes vont dans
> [DONE.md](./DONE.md) ; une section vidée est retirée.

---

## 🎮 Suites du patch du 06/10 (entrée DONE du 06/10)

- [ ] **Demiurge Lambda, sur retour des joueurs** : rangs (quick, onglet
      « Rangs » — PvE, PvP, EE base et +10), fiche curée (pros/cons,
      synergies ; rôle DPS déjà posé, tag `premium` automatique), ligne de
      `premium-limited`.
- [ ] **Sigma, après équilibrage** : curé à revoir (rang, pros/cons) ; et
      décider si le `damage-calculator` modélise [Tower Administrator]
      (+150 % de dégâts en Skyward Tower, les cibles de tour existent).
- [ ] **Revue d'extraction (suite de F14)** : la provenance d'un costume qui
      change (`costumes[#].source`, `package_shop`/`battlepass` → `shop` :
      Dianne, Vlada, Dahlia, Titia) reste un écart par la règle du doute —
      Sevih tranche ; mineure = une ligne dans `isMinorField`. Le flag `art`
      qui apparaît sur un costume existant, idem. Même mécanique possible
      pour monstres et équipement (écrans et staging manquent).
- [ ] **R2** : `images/ui/shop/al.webp` (onglet de l'Adventure License)
      encore dans le bucket, plus référencé — à retirer (Sevih).

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

- [ ] **Constat Basse restant de l'audit** : P10 (coût par image :
      `SUPERSAMPLE` à dpr 2, `clientWidth` relu à chaque image, instanciation
      des billboards), lot à écrire — P7 et P9 sont FAITS (lot F15, 06/10 :
      gardes du moteur et de l'extraction, compteurs retirés) —, à confirmer
      sur mobile.

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
