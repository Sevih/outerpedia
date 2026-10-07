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
- [ ] **Revue d'extraction (suite de F14)** : le flag `art` qui apparaît sur
      un costume existant reste un écart — à trancher au premier cas.
- [ ] **R2** : `images/ui/shop/al.webp` (onglet de l'Adventure License)
      encore dans le bucket, plus référencé — à retirer (Sevih).

## 🎒 Gear reco — données (signalé par le lot C4)

- [ ] **Bloody Edge (`631`)** : deux builds de `data/curated/gear-reco.json`
      lui donnent ATK% en stat principale, son pool ne propose que HP% — à
      corriger dans quick (onglet Gear reco) ou l'admin (Sevih).
- [ ] **Presets en double** (`$mrs` = `$elemcritAP`, `a2p2` = `p2a2` dans
      `gear-presets.json`) : `collapseBuild` rend le premier trouvé, l'admin
      change donc le slug au save (quick, lui, garde celui du disque). À
      fusionner ou à distinguer dans l'admin des presets.

## 🧰 Outil quick

- [ ] **Refonte de l'UI** (demande de Sevih du 07/10 : « c'est pas beau ») :
      six lots de [lots-opus-2026-09-25.md](./lots-opus-2026-09-25.md), dans
      cet ordre — **C5** (charpente : un fichier par onglet dans
      `scripts/quick/ui/`, onglet dans l'URL, banc de captures `shot.mjs` ;
      Opus, seul, après C4), **B30** (4-comics : plusieurs BD et langues en
      un envoi et un commit ; Opus, seul), **F16** (charte : jetons de
      `globals.css`, coquille, composants, `STYLE.md`, trois onglets simples
      refaits ; Fable, seul), puis **B28** Rangs (vraies icônes, portraits),
      **B29** Gear reco (picker modal) et **C6** Discord en parallèle (Opus,
      fichiers disjoints). Direction posée par défaut dans
      F16 : ressembler à l'admin, menu horizontal à deux niveaux — groupes
      puis sections, pas de barre latérale (quick doit remplacer à terme
      tout l'admin hors extractor et misc : éditeurs, guides, outils —
      décisions du 07/10), journal en tiroir.
      Maquette Claude Design à valider (ou retoucher dans l'éditeur) AVANT
      de lancer F16 : https://claude.ai/artifact/TNRpwKkQcUhvX4VQhNMtHw — cinq planches, les
      lots F16, B28, B29 et C6 la lisent.

## 🧪 À jouer au prochain patch

- [ ] **Retouches mineures des monstres et de l'équipement (lot B27)** : au
      premier patch qui en apporte, `/admin/extractor/monsters` — cases Diff
      et Minor, « Apply minor changes (n) », badge `minor` discret dans la
      sidebar — puis le bouton, sur les monstres ou une page d'équipement :
      le message doit finir par le bilan d'images
      (`images: … produced, … already there`). Idem à
      `pnpm datagen:promote --apply` : une ligne
      `images : monsters.json — n entité(s) validée(s) modifiée(s) — …` par
      fichier touché. Page jamais vue à l'écran par l'agent (pas de serveur
      de dev) : entrée DONE du lot B27 (06/10).
- [ ] **Rapport des effets de portrait (lot F12)** : au premier patch qui
      apporte un effet, contrôler la dernière ligne du refresh (« ◆ Portraits
      animés — à lire ») — l'effet y est nommé avec ses porteurs, « servi tel
      quel » ou « en attente : … » ; puis `/dev/AnimatedPortrait`, où il a
      sa section générée, et le confronter au jeu. Les trois cas et quoi
      faire : entrée DONE du lot F12 (05/10).
