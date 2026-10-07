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

- [ ] **Gear reco, retour de Sevih du 07/10** : les deux lots sont FAITS
      (B31, C7), reste à les jouer à l'écran. B31 (une note en anglais,
      « Traduire ») avec les vraies clés — relancer quick, « Traduire » sur
      un perso à note en / es / fr (jp, kr, zh arrivent, fr et es ne bougent
      pas, tags intacts), retoucher l'anglais → badge « à retraduire »,
      « Enregistrer » → un commit `chore(gear-reco): <perso>` qui ne porte
      que les notes. C7 (pickers) : les bascules de stats à la souris et au
      clavier (une stat composée, la dernière retirée → « stat principale
      non choisie », la stat hors pool qui se retire), un mix de sets (Speed
      principal, Penetration et Attack secondaires) puis « Enregistrer » →
      le commit cite `$p2s2` et `$a2s2`, et `Tab` / `Entrée` /
      `Ctrl + Entrée` / `Échap` dans les quatre pickers.
- [ ] **4-comics, premier envoi réel multi-langues (lot B30)** : glisser d'un
      coup les trois fichiers d'une nouvelle BD (`…_EN`, `…_JP`, `…_KR`),
      vérifier la ligne à trois cases, publier — attendu : trois « déposé »,
      UNE conversion, UN push R2, UN commit `chore(assets): 4-comics comicNN (EN, JP, KR)`
      poussé. Si une connexion coupe, le bouton reste grisé
      (`post()` de `lib.js`, signalé par l'agent : à reprendre un jour, hors
      série UI).
- [ ] **Refonte de l'UI — contrôles à l'écran** (la série est close le 07/10,
      le banc ne joue pas ces états) : survol des ✕ et des boutons fantômes,
      anneau de focus, tiroir du journal pendant un vrai enregistrement,
      résultats de Récompense avec icônes, hash `#gear/<id>`, fenêtre sous
      1060 px ; Rangs : cellule modifiée, refus réel, dépliage, clavier dans
      les menus de rang ; Gear reco : erreur à la pièce, preset libéré puis
      repris, picker au clavier ; Discord AVEC le jeton : serveurs, salons,
      emojis de serveur, un envoi d'essai sur le serveur perso, embed,
      reprise d'envoi, presse-papiers (listes détaillées dans les entrées
      DONE des lots F16, B28, B29, C6).
- [ ] **Gear reco, à trancher** (laissé par B29) : donner `element`, `rarity`
      et la sous-classe au roster de `gearRecoState` (`actions.ts`) pour que
      l'en-tête n'ait plus à lire `/api/ranks` ; garder `#gear/<id>` dans
      l'adresse après un choix (recharger reviendrait sur le perso) — ça
      passe par `lib.js`, qui réécrit le hash à chaque bascule.

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
