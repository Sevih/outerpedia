# quick — la charte graphique

> La page de `pnpm quick` ressemble à l'admin du site : mêmes couleurs, même
> sobriété, pas de web font. Ce fichier dit d'où viennent les jetons, ce que
> fait chaque composant de `quick.css` (un exemple de markup chacun), les
> règles de mise en page, et le croquis de chaque onglet tel qu'il est rendu
> (les six de départ sont à la charte depuis le 07/10/2026 ; les écarts aux croquis de
> départ sont dans les entrées DONE des lots B28, B29 et C6). La maquette de
> départ est l'artefact Claude Design de Sevih du 07/10/2026 (sept planches) ;
> ici, c'est ce que le code rend. Une section nouvelle (éditeurs, guides,
> outils de l'admin que quick doit absorber) suit ces composants et ces
> croquis.

## Les jetons

Recopiés du `:root` de `src/app/globals.css`, **sous les mêmes noms** — une
couleur qui change sur le site se recopie ici, sans traduction :

| Jeton                                                                     | Valeur                            | Rôle                                                      |
| ------------------------------------------------------------------------- | --------------------------------- | --------------------------------------------------------- |
| `--surface-base`                                                          | `#0b1120`                         | le fond de la page, des champs                            |
| `--surface-raised`                                                        | `#131c2e`                         | l'en-tête, les cartes                                     |
| `--surface-overlay`                                                       | `#1e293b`                         | la savebar, la bande du journal, les chips, un survol     |
| `--surface-sunken`                                                        | `#070b14`                         | la rangée des sections                                    |
| `--content` / `--content-strong`                                          | `#ffffff`                         | le texte                                                  |
| `--content-muted` / `--content-subtle`                                    | `#cbd5e1`                         | libellés, explications, en-têtes de table (4,5:1 partout) |
| `--line-subtle`                                                           | `#42566e`                         | bords de carte, filets de table, séparateurs              |
| `--line`                                                                  | `#526075`                         | bords de champ et de bouton fantôme                       |
| `--line-strong`                                                           | `#64748b`                         | pastille éteinte                                          |
| `--accent` / `--accent-fg` / `--ring`                                     | `#38bdf8` / `#0b1120` / `#38bdf8` | l'action principale, l'onglet actif, le focus             |
| `--success`, `--warn`, `--danger`                                         | `#4ade80`, `#fbbf24`, `#f87171`   | les états                                                 |
| `--fire` … `--dark-elem`, `--klass`, `--rarity-*`, `--item-*`, `--role-*` | cf. `globals.css`                 | couleurs d'élément, de classe, de rareté, de rôle         |

Propres à quick : `--placeholder` (`#7f8ea3`, le texte des placeholders) et
`--mono` (la pile `ui-monospace`). Police : `system-ui`, 14 px / 1,5. Rayons :
10 px une carte, 8 px un champ ou un bouton, 999 px un badge, une chip, une
pastille.

## La coquille

- **En-tête** (`header.top`, 52 px, `surface-raised`) : le logo, les
  **groupes** en onglets (`.gtab`, filet accent sous l'actif ; « Accueil » en
  tête — sa première section, le tableau de bord, est celle que la page
  ouvre ; `.gtab.soon`
  grisé avec son badge « à venir » : Guides, tant que quick n'a pas repris
  l'admin — Éditeurs a deux sections, Fiche perso et Effets, et Outils la
  sienne, Noms), puis à droite les
  pastilles des services (`.pill` + `.dot`, `title` = pourquoi), « Pousser »,
  le poste et le port (`#env`), « Quitter ».
- **« Pousser »** (`#push`, un `.btn.primary.sm` et son `.badge` `#push-count`) :
  le seul geste qui pousse — un enregistrement ne fait que committer. Le badge
  compte les commits en attente (`gitBar(git)` de `lib.js`, d'après
  `/api/state` puis la réponse de chaque `post()`) ; à zéro le bouton est
  `disabled` (`title` « Rien à pousser »), en retard sur l'amont le badge
  passe en ambre (`.warn`, `title` = le `git pull --rebase` à faire), sans
  amont il dit « pas d'amont ». Pendant le push : `busy`, et le journal suit.
- **Sections** (`nav.tabs`, 40 px, `surface-sunken`) : les sections du groupe
  actif (`.tab`, filet accent sous l'active). Un groupe s'ouvre sur sa
  première section. Le hash (`#ranks`) sélectionne le groupe ET la section.
- Les deux rangées sont posées par `lib.js` d'après son tableau `GROUPS` :
  **ajouter une section** = une entrée `{ id, label, wide? }` dans le bon
  groupe, ses trois fichiers `tabs/<id>.{html,css,js}`, son marqueur
  `<!-- @tab id -->`, son `<link>` et son `import` dans `index.html`. Seule
  la première section du premier groupe est sans `hidden` dans son HTML.
  Les sections vivent dans UN document : chacune préfixe ses `id` et ses
  classes d'une lettre à elle (`b-` Bannières, `c-` Codes promo, `d-` et
  `e-` Discord, `g-` Gear reco, `h-` Tableau de bord, `j-` Journal du site,
  `k-` 4-comics, `n-` Noms, `p-` Patch, `r-` Rangs, `t-` Tables du jeu,
  `v-` Vidéos, `x-` Effets) — une lettre reprise et `$('c-list')` rend l'élément de l'autre
  onglet, sans erreur. Fiche perso PARTAGE `c-` avec Codes promo (décision du
  lot C11) : aucun id de l'un n'est repris par l'autre, et un test le garde
  (« aucun `id` en double dans la page »). `hp-` est au picker de héros, qui
  n'est à aucun onglet.
- Ce qu'une section dit d'elle à `sections.register` : `init()` (une fois, au
  démarrage), `open()` (chaque fois qu'elle vient à l'écran), `dirty()`,
  `canLeave()`. `sections.go('<id>')` ouvre une autre section, comme un clic
  sur son onglet. Un `post()` réussi qui a committé ou poussé émet
  `quick:saved` sur `document`. `post(path, payload, onStep)` : avec
  `onStep`, chaque ligne du flux est remise à la section au lieu d'être
  empilée au journal, qui ne montre alors que la ligne en cours puis le
  résultat — la console de « Patch » s'en sert.
- **`<main>`** : 1200 px centrés, 24 px de marge.
  `wide: true` dans l'entrée de `GROUPS` lui donne toute la largeur
  (`main.wide`) : Patch, Rangs, Gear reco, Tables du jeu, Fiche perso, Effets, Discord. Une section
  est une colonne à 18 px d'écart : `.head` (le `h2` et sa `p.hint`), puis des
  `.card`.
- **Journal** (`aside.journal`, `surface-overlay`) : une bande DANS LE FLUX,
  entre `nav.tabs` et `<main>`, pleine largeur, son contenu (`.journal-in`)
  aligné sur `<main>` — 1200 px centrés, toute la largeur sous un onglet
  `wide`. Rien de fixé, et au repos il n'occupe rien (`hidden`).
  `log(lines, ok, doing)` garde sa signature et pose seul l'état
  (`data-state`) :
  - `run` (`ok` indéfini) : UNE ligne de 40 px — la pastille qui bat et l'étape
    en cours (`doing`, sinon la dernière ligne). Elle ne se déplie pas.
  - `ok` : UNE ligne, verte — la dernière du journal, l'action faite
    (« committé — 1 commit à pousser… »). Pas de bouton ; un clic sur la ligne
    déplie tout le journal (`aria-expanded`), un second le replie.
  - `ko` : TOUT le journal (`#log`, monospace, 40 % de la fenêtre au plus),
    déplié d'office, la dernière ligne en rouge et les étapes passées neutres,
    et « Copier » (`#journal-copy`, `.btn.ghost.sm`) en tête à droite : le
    journal en texte brut dans le presse-papiers, une ligne par étape. Le
    bouton dit « copié » deux secondes, « impossible » si le navigateur refuse.
    Un simple message (`log(['Code requis.'], false)`) est un `ko` comme un
    autre.

  Déplié, la ligne de tête montre le titre « Journal » à la place de la
  dernière étape (elle est dans `#log`, entière). Chaque `log()` repart de
  zéro ; à la fin d'une opération (`ok` ou `ko`) la page remonte au journal
  s'il n'est plus dans la fenêtre (`scrollIntoView({ block: 'nearest' })`). La
  `.savebar` collante est dans `<main>`, donc toujours sous lui : aucun des
  deux ne recouvre l'autre.

```html
<main>
  <section id="tab-coupons">
    <div class="head">
      <h2>Codes promo</h2>
      <p class="hint">Ce que fait l'onglet.</p>
    </div>
    <div class="card pad">…</div>
  </section>
</main>
```

## Les composants

### `.card` — une carte

`.card` seule est un cadre ; `.card.pad` remplit (18 × 20 px) en colonne à
14 px d'écart ; `.card-head` / `.card-foot` sont une rangée bordée (un titre en
`strong`, des badges, un bouton poussé par `margin-left: auto`) ; `.scroll`
fait défiler une table trop large.

```html
<div class="card">
  <div class="card-head"><strong>13 codes</strong><span class="badge active">8 actifs</span></div>
  <div class="scroll">
    <table>
      …
    </table>
  </div>
  <div class="empty" hidden>Aucun code promo.</div>
</div>
```

### `.form` — une grille de champs

Une rangée qui se replie, champs alignés sur leur bas, 12 × 14 px d'écart.
Chaque champ est un `.field` (son `label` au-dessus) et porte sa **largeur
naturelle** par classe ; **un bouton se pose à côté de son champ**, dans la
même `.form`, jamais poussé à l'autre bout. `.grow` prend la place qui reste
(la zone de dépôt).

| Classe      | Largeur | Pour                                 |
| ----------- | ------- | ------------------------------------ |
| `.w-code`   | 14 ch   | un code promo (chasse fixe)          |
| `.w-qty`    | 8 ch    | une quantité (alignée à droite)      |
| `.w-search` | 30 ch   | une recherche, une cible             |
| `.w-url`    | 42 ch   | une adresse                          |
| `.w-text`   | 22 ch   | un libellé court                     |
| `.w-date`   | 150 px  | une date (le `type="date"` l'a déjà) |

```html
<div class="form">
  <div class="field picker">
    <label for="c-reward">Récompense</label>
    <input id="c-reward" class="w-search" autocomplete="off" />
    <div class="results" id="c-results" hidden></div>
  </div>
  <div class="field">
    <label for="c-qty">Quantité</label><input id="c-qty" class="w-qty" value="1" />
  </div>
  <button class="btn ghost" id="c-add-reward">Ajouter</button>
</div>
<div class="actions"><button class="btn primary">Ajouter le code</button></div>
```

`input`, `select` (chevron dessiné, même hauteur que l'input : 34 px),
`textarea` (84 px, redimensionnable) partagent le fond `surface-base`, le bord
`--line`, le focus `--ring`. `.check` : une case et son libellé sur la ligne
des champs. `.picker` + `.results` : la liste de résultats sous le champ (une
ligne = `<div data-id>` avec son `.ico` et son nom en `span`). `.actions` : la
rangée des boutons d'un formulaire.

### `.btn` — trois niveaux, une taille

```html
<button class="btn primary">Enregistrer</button>
<button class="btn ghost">Annuler</button>
<button class="btn danger">Supprimer le build</button>
<button class="btn ghost sm">+ arme</button>
<button class="btn icon" aria-label="Supprimer GOLD" title="Supprimer">✕</button>
```

`primary` = l'action de l'onglet, une par formulaire ; `ghost` = le reste ;
`danger` = ce qui détruit (texte rouge, bord rouge au survol). 34 px, `sm` 28 px.
`icon` (30 × 30) = l'action d'une ligne : gris, **rouge au survol seulement**,
toujours avec `aria-label`. États : `disabled` (55 %) et `busy` (sablier qui
bat devant le libellé, curseur « progress » — à poser pendant un `post()`).

### `table`

Un `<table>` nu suffit : en-tête en capitales grises, cellules séparées par
`--line-subtle`, dernière ligne sans filet, 8 × 12 px de marge. `td.dim` grise
une cellule, `.code` passe en chasse fixe. **Une icône et son nom** dans une
cellule : `<span class="rw"><img class="ico" …>Nom</span>`, dans un
`<div class="rws">` (flex) — posés en ligne, Firefox raccourcit la cellule
voisine. L'action de la ligne : un `.btn.icon` dans la dernière colonne.

### `.badge` — un état en un mot

```html
<span class="badge active">actif</span> <span class="badge upcoming">à venir</span>
<span class="badge expired">expiré</span> <span class="badge warn">modifié</span>
<span class="badge refused">refusé</span> <span class="badge error">erreur</span>
```

Fond à 15 %, texte de la couleur. Alias : `ok` = `active` ; `soon`, `edit` =
`upcoming` ; `dirty` = `warn` ; `ko` = `refused` ; `off` = `expired`. Un badge
vide ne s'affiche pas.

### `.chip` — une récompense choisie, une planche

```html
<span class="chip"
  ><img class="ico" src="…/items/CM_TopMenu_Gold.webp" alt="" />Gold ×1000000
  <button class="btn icon" aria-label="Retirer Gold">✕</button></span
>
```

Dans un `.chips` (rangée qui se replie, invisible vide).

### `.drop`, `.empty`

`.drop` : la zone de dépôt (pointillés, icône, une phrase ; `over` pendant le
survol d'un fichier). `.empty` : l'état vide d'une carte, en pointillés —
« Aucun code promo. », « Aucune planche choisie. », « Choisir une note ».

### `.savebar`

La barre d'enregistrement de Rangs, Gear reco, Noms, Fiche perso, Effets, Bannières et Journal du site : le compte de changements
(le `span`, poussé à gauche), « Annuler », « Enregistrer ». Collante en haut.

```html
<div class="savebar">
  <span id="r-count">129 / 129 persos · 2 modifications</span>
  <button class="btn ghost" id="r-reset">Annuler</button>
  <button class="btn primary" id="r-save">Enregistrer</button>
</div>
```

### Icônes

`state.imgBase` (de `/api/state`) est la base des images du site :
`${imgBase}/images/items/<icon>.webp` pour un item ou une monnaie
(`rewardOptions()` expose `icon` ; `itemIcon(icon)` de `lib.js` rend l'`<img
class="ico">` de 24 px, décoratif, `alt=""`). Les icônes d'élément, de classe,
de rareté et les portraits sont sous le même `imgBase` : B28 en fait les
colonnes de Rangs.

## Les règles

- **Largeur maîtrisée** : 1200 px par défaut ; `wide` quand le contenu est une
  table large ou deux colonnes (Rangs, Gear reco, Discord).
- **Un champ a la largeur de ce qu'il contient**, par classe ; jamais
  `flex: 1` sur un champ court. Un bouton suit son champ.
- **Espacements** : 18 px entre les blocs d'une section, 14 px dans une carte,
  12 × 14 px entre les champs, 10 px entre les boutons d'une rangée.
- **Un seul `primary` par formulaire** ; détruire = `danger` ou `icon` ✕.
- **Le journal est le seul retour** : pas de message dans l'onglet, `log()`.
  Exception : la sortie d'une commande longue (« Patch ») va dans une console
  de la section, le journal n'en gardant que la ligne en cours et l'issue.
- **L'aperçu Discord** (`.dc*`) imite Discord à dessein et garde ses couleurs.

## Les trois onglets « wide » — croquis

Croquis de départ pour Rangs et Gear reco (faits par B28 et B29 le 07/10 :
les écarts, et pourquoi, sont dans leurs entrées DONE ; le rendu fait foi),
croquis du rendu pour Discord. Le markup de chaque onglet est dans
`tabs/<nom>.html`, son style dans `tabs/<nom>.css`.

### Rangs (`wide`, fait — B28)

```
.head  Rangs et rôles — Rien ne s'écrit à la sélection…
.card.pad  .form : [Nom 30ch] [Rang de ▾] [Rang ▾] [Rôle ▾] [Élément : 5 icônes cliquables] [☐ par transcendance] [☐ modifiés]
.savebar   129 / 129 persos · 2 modifications · 1 refus   [Annuler] [Enregistrer 2 changements]
.card > .scroll > table
   ▸ | portrait + Nom (+ badge « par transcendance ») | icône Élément | icône Classe | icône Sous-classe | ★★★ | Rôle ▾ | PvE ▾ | PvP ▾ | EE base ▾ | EE +10 ▾
   tr.sub (fond surface-sunken) : une ligne par transcendance
   pied de carte : « n lignes montrées sur 129 » · l'échelle des rangs en icônes
```

Un select modifié prend le bord et le fond `accent` à 12 % (`.badge.edit` pour
le compte), un refus le bord `danger`. Les icônes d'élément et de classe :
22 px, depuis `imgBase`, `alt=""` doublées par le nom en texte ou en `title`.

### Gear reco (`wide`, fait — B29, pickers C7, tuiles C8, aperçu C9, onglets de builds B32)

```
.head  Gear reco — Les builds d'un perso…
.card.pad  perso à gauche : portrait 56 px, nom, élément · classe · sous-classe · ★★★, badge « 2 builds · 1 note » ; à droite [Changer de perso] (le picker : recherche, élément, classe, portraits)
.savebar   1 changement · 1 erreur · « Build PvP : stat principale non permise » Aperçu [en|fr|es|jp|kr|zh] [＋ build] [Annuler] [Enregistrer]
.g-tabs (role tablist ; absente sans build)  [Speed] [High Crit ●] [Build 3 ●] — un onglet par build, dans leur ordre : son nom, ou « Build n » ; le `.tab` des sections de la coquille en 32 px (filet accent sous l'actif) ; un point accent = build nouveau ou modifié, pas encore enregistré (ce que compte la savebar), un point rouge = build en erreur (un onglet caché ne cache pas une erreur)
   clavier : ← → (les bouts se rejoignent), Début, Fin — l'onglet est montré aussitôt et prend le focus (`tabindex` 0 sur l'actif, -1 ailleurs)
   « ＋ build » et « Dupliquer » activent le nouveau, « Monter » / « Descendre » emmènent l'onglet, « Supprimer » active le voisin précédent, « Annuler » et « Enregistrer » gardent l'onglet, un autre perso revient au premier
.card (LE build montré — un seul à la fois, `#g-list` est le `tabpanel`)  card-head : « Build » [nom 24ch] badge « modifié » · dupliquer ↑ ↓ ✕ (btn icon)
   grille 2 colonnes, 18 × 28 px : Armes | Talismans (badge preset $slug, ou « sans preset ») | Amulettes | Sets | Substats (le seul menu de preset, + « régler à la pièce ») | Note (pleine largeur : UNE textarea, l'anglais ; dessous [Traduire] badge error · « 212 caractères » à droite ; puis « Traductions (5) » replié, badge warn « à retraduire », 5 textarea fr · es · jp · kr · zh, trois par rangée)
   une arme, une amulette = [bouton 240px : tuile d'item 44 px + nom coloré par le grade, un clic ouvre le picker du slot] [ses stats principales en bascules, aria-pressed] ✕ ; « ＋ arme » (.btn.ghost.sm) ouvre le même picker
   talismans = une rangée de tuiles (tuile d'item 44 px + nom + ✕), « ＋ talisman » ouvre le picker
   sets = une rangée par combo : [tuiles helmet + armor du premier set, 32 px] nom « 2p » + [tuiles gloves + shoes du second] nom « 2p » … badge $slug ou « sans preset » ✕ (un set joué à 4 : ses quatre tuiles, « 4p ») ; « Composer un mix… » est la seule façon de les éditer (un principal, des secondaires)
le picker de pièces (UNE modale pour les armes ou les amulettes, les talismans, les sets — `gPkOpen`, lot C7 ; le perso, lui, se choisit dans le picker de héros partagé, cf. « Le picker de héros ») : titre + badge · recherche · rangée de filtres optionnelle (le groupe segmenté des sets) · grille de tuiles (tuile d'item 64 px, nom coloré dessous, badge AP / CP ou « hors classe » ; un set = ses quatre pièces de 34 px en grille 2 × 2 ; anneau accent sur le choix, pastille ✓ en haut à gauche, `disabled` grisé — un set sans bonus 2 pièces parmi les secondaires) · un pied [récapitulatif] [Annuler] [Valider]
   clavier : Entrée dans la recherche = « Valider » (Ctrl + Entrée aussi) ; Entrée ou Espace sur une tuile la coche ou la décoche ; Échap, la croix, le voile ferment sans rien poser ; Tab reste dans le panneau
   en bas de la carte, sur le fond de la page : ▾ APERÇU (un bouton, `aria-expanded` ; ouvert d'office, rien n'est retenu) puis le build COMME LA FICHE PERSO le montrera — rangées à étiquette de 96 px (Weapon | Accessory | Talisman : tuile 44 px, nom au grade, puces de stat principale ; Armor Set : une ligne par combo, tuiles 32 px, puis la légende des bonus ; Substat Priority en barre, comme `SubstatPrioBar` — par stat, icône 14 px et abréviation, puis six segments de 6 px, pleins en jaune `#facc15` jusqu'à son rang, le reste en gris `#3f3f46`, 336 px au plus ; Notes : icône + libellé coloré par balise, une balise que le site ne résout pas en ROUGE, une pièce inconnue aussi) ; rien n'y est cliquable, une description passe en `title`
le hash (une entrée pour un lien ou le banc ; la page ne l'écrit pas) : `#gear/<id>` ouvre le perso, `#gear/<id>/build/<n>` sur son n-ième build (à partir de 1, borné), `…/picker/<slot>` y ouvre en plus un picker (`char`, ou `weapons` / `amulets` / `talismans` / `sets` du build montré) — les deux se combinent : `#gear/<id>/build/2/picker/weapons`
l'aperçu (`previewHtml` de `ui/gear-view.mjs`, pur et testé ; classes `.pv-*`) rend ce que répond `POST /api/gear-reco/preview` — les builds de la page résolus par le résolveur du site, dans la langue du groupe segmenté de la savebar (une pour toutes les cartes, `en` d'office). UNE requête pour tous les builds du perso à chaque changement (400 ms après la dernière frappe), gardée par build : changer d'onglet redessine depuis elle, sans requête ; pendant qu'elle court le rendu précédent reste, atténué (`.busy`) ; un refus s'écrit en rouge DANS le bloc — la seule exception à « le journal est le seul retour », l'aperçu se relançant à chaque touche. Les couleurs sont les classes du site (`text-buff`, `text-item-legendary`…) traduites en jetons dans `tabs/gear.css` ; ceux qui manquaient à `quick.css` (`--buff`, `--debuff`, `--buff-bg`, `--debuff-bg`, `--stat`, `--highlight`, `--equipment`) y sont recopiés de `globals.css`, portés par `#tab-gear`
la tuile d'item (`ui/gear-view.mjs`, pur et testé ; classes `.gv-*` de `tabs/gear.css`) est celle de /equipment (`EquipmentIcon.tsx`) : cadre de rareté `images/ui/bg/TI_Slot_<Grade>.webp`, icône à 6 % de marge, étoiles en bas (18 % de la tuile, chevauchement 30 %), icône d'effet en haut à droite (26 %), icône de classe dessous (24 %) si la pièce n'a qu'une classe ; le nom prend le jeton `--item-*` de son grade (`GRADE_TOKEN`)
.card.ko (un build refusé) : bord danger, badge « stat principale non permise », le message sous la pièce
```

### Discord (`wide`, fait — C6)

Fait, et le croquis est ici celui du rendu (les écarts au croquis de départ
sont dans l'entrée DONE du lot C6) :

```
.head  Message Discord — Posté par le bot…  badge warn « jeton absent… »
deux colonnes (flex, 20 px ; la note 30 % — 380 px au moins —, l'éditeur le reste ; l'une sous l'autre sous 1100 px)
  gauche .card : card-head [▾ replier] « Note officielle » … « ouvrir l'original » ; dessous, le select de la note sur toute la largeur
                 le cadre de la note (iframe), montré une fois la note chargée — avant, un .empty « Choisir une note »
         .card : card-head « Anciens résumés » badge « 14 importés » [importer] ; l'état, puis « voir la liste » (details)
  droite .card.pad : .form sur UNE ligne — [Serveur ▾] [Salon ▾] [Emojis de ▾ : liste de cases déroulante] [☐ sans aperçu des liens] et à droite le segmenté Message | Embed (deux radios)
         .card.pad (mode Embed seulement) : titre, lien, barre ; vignette, image ; texte au-dessus, pied ; boutons de lien
         .card : card-head = barre d'outils GROUPÉE (style · blocs · titres · listes et citation · insertions), boutons 32 × 30 avec `title` ; [convertir les dates] à droite
                 la zone de texte (chasse fixe) — le formulaire de date, le sélecteur d'emojis et l'autocomplétion se posent par-dessus ; la palette dessous, repliable
                 card-foot, deux rangées : [Insérer le gabarit] [Proposer un brouillon] [Copier la demande] exemples [3]
                                           badge « 612 / 2000 caractères » … [Copier le message] [Envoyer dans #salon] ; puis la ligne d'état (badge + texte)
         .card : card-head « Aperçu — tel que Discord le rendra » puis .dc (thème Discord, inchangé)
```

Note repliée (état retenu) : ses deux cartes se rangent en une ligne au-dessus
de l'éditeur, qui prend toute la largeur. Propres à l'onglet, dans
`tabs/discord.css` faute de composant commun : `.d-grp` (boutons d'outil
accolés), `.d-seg` (bouton segmenté), `.d-menu` (liste de cases déroulante).

## Données — croquis

Rangs et Gear reco ont leur croquis plus haut, avec les onglets « wide ».

### Tables du jeu (`wide`, fait — B38)

Les tables brutes du jeu (`.gamedata/parsed/`), telles que le parser les
produit — l'outil d'exploration qui précède l'écriture d'un générateur.
Lecture seule : ni savebar ni `canLeave`, que des GET. Croquis du rendu :

```
.head  Tables du jeu — Les tables brutes extraites du jeu… Lecture seule… Les tables que le code lit sortent d'abord…
.card.pad  .form : [Table… 30ch, chasse fixe] « 258 tables · 89 lues par 42 fichiers » [Recalculer]
   PAS de liste : le champ et ses suggestions (.picker + .results, 40 au plus puis « … N autres : préciser le nom. »)
     une suggestion = le nom (chasse fixe) · la taille · à droite badge ok « utilisée · N » (N fichiers la lisent), ou « jamais lue » atténué en italique
     dans l'ordre du serveur : les tables lues d'abord, par nombre de lecteurs décroissant puis par nom ; les autres ensuite, par nom
     le champ vide (ou qui porte le nom de la table ouverte) propose tout ; Entrée prend la première ; Échap ou un clic ailleurs referme
   .t-info (la table choisie) :
     nom (chasse fixe, 15 px) · son badge d'usage · « 180 Ko · extraite le 08/10/2026 08:58 » · « CNomInterne · 177 lignes · 32/35 colonnes remplies » (arrive avec la première page ; le nom interne seulement s'il diffère)
     .chips : un .chip.t-reader par fichier qui la lit (« generators/recruit », chasse fixe, texte seul, `title` = le chemin complet)
     p.t-note : la première ligne du docblock de chaque lecteur, une par ligne, les `…` en chasse fixe ; au-delà de six lignes elle défile dans son cadre
     une table que rien ne lit : « Aucun fichier de datagen, de src/lib/data ni de scripts/quick ne lit cette table par son nom. »
   .empty à la place : « Choisir une table : taper son nom — les 89 tables lues par le code sortent d'abord. » · « table inconnue : X » · sans `.gamedata/parsed/`, le message du serveur
.card (absente sans table)  card-head.t-bar : [Chercher dans la table… 30ch] [toutes les colonnes ▾ + les colonnes COMPLÈTES] [☐ exact] [☑ résoudre les textes] [☐ colonnes vides] … « 120 lignes sur 177 » [Précédent] « page 1 / 3 » [Suivant]
   « exact » = égalité stricte sur la colonne choisie, éteinte sans colonne ; la recherche part 200 ms après la dernière frappe et revient à la première page
   .t-cols — le tableau, et à sa droite la ligne brute (380 px ; dessous sous 1000 px)
     .scroll > table : il défile dans son cadre, dans les deux sens, en-tête collant ; en-têtes et cellules en chasse fixe, sans repli
        colonnes jamais remplies masquées (« colonnes vides » les montre), colonnes de langue masquées sauf l'anglais (`HIDDEN_LANG_COLUMNS`, la règle de l'admin, servie par l'état)
        une colonne `*ID` qui mène à une table : ↗ accent dans l'en-tête (`title` = la cible), et dans la cellule un lien PAR id (une liste CSV en porte plusieurs)
        une clé de texte : son anglais dessous, en italique atténué (40 ch au plus) ; une valeur longue est coupée à 60 ch (`title` = la valeur)
        une ligne se clique (ou Entrée) : fond `surface-overlay`, et sa LIGNE BRUTE s'ouvre
     aside.t-raw  card-head : « Ligne brute » · « 32 champs » … [Copier] ✕
        dl.t-kv : une paire par champ de la ligne, clé atténuée | valeur entière — toutes les colonnes, toutes les langues, rien de résolu
        « Copier » : le JSON de la ligne ; le bouton dit « copié » deux secondes, « impossible » si le navigateur refuse
   .empty « Aucune ligne ne correspond. »
le hash : `#gamedata/<Table>` ouvre l'onglet sur la table (la page l'écrit au choix : recharger y revient) ; un lien croisé est `#gamedata/<Cible>?col=ID&exact=1&q=<valeur>` — égalité stricte, `ID=101` ne ramène pas `1011` ; `&row=<n>` y montre en plus la ligne brute de la n-ième ligne, à partir de 0 (le banc ne clique pas)
```

Le catalogue vient de `GET /api/gamedata/tables` (`gameTablesState` : nom,
taille, date, `usedBy`, `note`, les comptes, `hiddenColumns`), lu à la
PREMIÈRE venue sur l'onglet, pas au démarrage. L'usage est une passe du
serveur sur les sources (`tableUsage`), faite une fois par processus ;
« Recalculer » la refait (`?recompute=1`) et relit le catalogue. Une page de
lignes vient de `GET /api/gamedata/table` (`queryTable` de l'admin : la
recherche et la pagination restent au serveur, une table monte à 18 Mo) ; seule
la dernière demande se dessine, un refus passe par le journal. Suivre un lien
croisé pose une entrée d'historique : « Précédent » du navigateur revient à la
table quittée. Propres à l'onglet, dans `tabs/gamedata.css` : `.t-info`,
`.t-id`, `.t-reader`, `.t-note`, `.t-bar`, `.t-cols`, `.t-grid`, `.t-v`,
`.t-text`, `.t-raw`, `.t-kv`, `.t-pair`.

## Accueil — croquis

### Tableau de bord (1200 px, fait — B36)

Ce qui demande une action, lu ailleurs : il montre et renvoie, il ne fait
rien. Croquis du rendu :

```
.head  Tableau de bord — Ce qui demande une action. Rien ne se fait d'ici…        « au 2026-10-08 (UTC) » [Actualiser]
.h-grid — des .card sur deux colonnes au-dessus de 900 px, une en dessous ; chaque carte a sa hauteur
  .card « À faire »    card-head : titre · badge du compte (ko s'il y a du rouge, sinon warn) … « extraction, tags, assets — lu par l'admin »
     une ligne par item de l'inbox de l'admin, dans SON ordre :  ● Character  1 new … dans l'admin ↗ (nouvel onglet)
       ● = `.dot` de la teinte de l'item (danger, warn, muted) ; un item que quick a déjà : [Ouvrir] (va à l'onglet) à la place du lien
     .empty « Rien à faire. »
  .card « Dépôt »      card-head : titre · la branche en chasse fixe
     ● 7 commits à pousser  « Pousser », dans l'en-tête      (accent ; « rien à pousser » en vert ; « pas d'amont » atténué)
     ● 3 commits de retard sur origin  `git pull --rebase` d'abord, au terminal      (warn, seulement s'il y en a)
     ● 54135782  le sujet du dernier commit · il y a 31 minutes
     ● 10 fichiers modifiés  ou non suivis — un enregistrement ne committe que ses fichiers      (warn ; « aucun fichier modifié » en vert)
  .card « Jeu »
     ● site 1.11.404 · client 1.11.404  à jour      (ok ; warn « un patch attend : onglet Patch » quand le client est en avance — un bouton quand la section existe ; atténué sans client, ou client en retard)
     ● proposition d'extraction en attente  data/extracted/ : à revoir, puis promouvoir      (warn, seulement s'il y en a une)
  .card « Publication » — deux têtes dans la même carte
     card-head : « Bannières » · badges « 2 actives » · « 1 à venir » … [Ouvrir Bannières]
       ● visage 24 px · nom … badge ok « 12 j restants » (« dernier jour » à zéro) ; à venir : ● accent … badge upcoming « dans 5 j »
       ● 2 à insérer · 1 à aligner  d'après la table du jeu      (warn)
       « Aucune bannière active ni à venir. » ; sans table du jeu, le message du serveur dessous, atténué
     card-head : « Codes promo » · badge « 8 actifs » … [Ouvrir Codes promo]
       ● OPLIVE09 (chasse fixe) … badge warn « expire dans 3 j » (« dernier jour » à zéro)
       « Aucun code n'expire sous 7 jours. »
un bloc que le serveur n'a pas pu lire : « Illisible : <raison> » en rouge DANS sa carte, les autres servis
```

Tout vient de `GET /api/dashboard` (`dashboardState` : cinq blocs
indépendants, chacun `null` avec sa raison dans `errors` quand sa lecture a
levé). La page le relit à chaque venue à l'écran (`open`), au clic sur
« Actualiser », et sur `quick:saved` si elle est montrée — jamais en boucle :
l'inbox de l'admin coûte deux secondes. Le compte de la carte « Dépôt » est
celui de l'en-tête, qu'elle remet à jour (`gitBar`). Les échéances se
comptent au jour UTC du serveur (`today`). Propres à l'onglet, dans
`tabs/dashboard.css` : `.h-row` (une ligne : pastille, `.h-label`,
`.h-detail`, ce qui la ferme poussé à droite), `.h-row.tint` (le libellé
prend la teinte de la pastille), les teintes `.dot.warn`, `.dot.danger`,
`.dot.info`, et `.h-note` (une phrase à la place des lignes).

### Patch (`wide`, fait — C10)

La chaîne des données à chaque patch du jeu : quatre gestes, chacun une
commande du dépôt lancée par le serveur (`patch.ts`), un seul travail à la
fois. Croquis du rendu :

```
.head  Patch — La chaîne des données à chaque patch du jeu, étape par étape…
quatre .card empilées, dans l'ordre du flux ; chacune : card-head = « n · titre » · ce que fait le geste (.lbl) … son ÉTAT poussé à droite (.p-state : atténué, ok, warn, ko), puis .p-body = le geste
  .card « 1 · Rafraîchir depuis le jeu »      … « client 1.11.404 · site 1.11.402 — un patch attend » (warn ; sans écart, atténué ; « pas de client Steam · site … », `title` : l'Android reste possible)
     .form : Source [Steam | Android] (.p-seg, deux radios ; défaut = `DATAGEN_SOURCE`, sinon Steam) [☐ forcer] [☐ sans pull] [☑ collecter les images] [☑ notes de patch] [Lancer]
     .p-note.warn « une reprise attend (checkpoint du 08/10 14:30) : « Lancer » reprend où la chaîne a cassé, « forcer » repart de zéro. » — seulement s'il y en a un pour la source choisie
  .card « 2 · Revue de la promotion »         … « pas encore de dry-run » · « dry-run en cours… » · « dry-run réussi à 14:32 » (ok) · « dry-run en échec à 14:32 » (ko) · « dry-run à refaire : la proposition a pu changer » (warn)
     [Dry-run]
     pre.p-out (32 vh au plus, absente avant le premier dry-run) : la sortie du DERNIER dry-run, qui reste après la fin — c'est la revue
  .card « 3 · Promouvoir »                    … « après un dry-run réussi » · « prêt : la revue est au-dessus » · « promue à 14:40 — reste à committer » (ok)
     [Promouvoir (--apply)]  Les persos pas encore intégrés dans l'admin ne partent pas, même ici (la garde de promote.ts).
     éteint tant qu'un dry-run n'a pas réussi DANS CETTE PAGE ; pas de boîte de confirmation (le dry-run est la revue, la promotion se défait par git) ; un rafraîchissement lancé, une promotion faite ou ratée : la revue est à refaire
  .card « 4 · Committer les données »         … « 11 fichiers modifiés · 2 commits à pousser — « Pousser », dans l'en-tête » (warn s'il y a des fichiers ; « aucun fichier modifié » ; « dépôt illisible : … » en ko)
     .form : [Message 42ch, prérempli « chore(data): patch du 08/10 », borné à 200] [Version ▾ patch · minor · major] [Committer (pnpm commit)]
     .p-note « Le commit lance format, lint, typecheck et tests : compter dix minutes. Il embarque tout ce qui est modifié dans le dépôt (git add -A)… »
     éteint sans message ou sans fichier modifié (`title` : rien à committer)
.card « Console »  card-head : titre · son état (.lbl) … [Arrêter] (danger, pendant un travail seulement) [Copier] [Effacer]
   état : « au repos » · « en cours : dry-run de la promotion » · « 412 lignes » · « un travail tourne : commit des données — lancé avant, sa sortie n'est pas ici »
   pre.p-out#p-console (chasse fixe 12 px, fond de la page, 40 vh) : toute la sortie, ligne à ligne ; elle défile avec la sortie tant qu'on n'est pas remonté ; au-delà de 5 000 lignes seule la fin reste affichée, « Copier » rend tout
```

Pendant un travail : les quatre boutons et « Pousser » sont éteints (le 409
du serveur reste la vraie garde), celui du geste est `busy`, le journal de
l'en-tête montre la ligne en cours puis l'issue — une ligne quand ça passe,
les quinze dernières lignes de la sortie et le verdict quand ça casse.
« Arrêter » envoie SIGTERM au travail et à ce qu'il a lancé ; sa réponse
s'écrit dans la console (« — arrêt demandé : … »), le geste se clôt seul en
« arrêté ». L'état vient de `GET /api/patch/state` : relu à chaque venue à
l'écran et après chaque geste, et toutes les trois secondes tant qu'un
travail lancé AVANT (page rechargée, « Pousser » en cours) tient le verrou —
sa sortie, elle, n'est pas rejouée. Recharger la page pendant un geste lancé
d'ici demande confirmation (`dirty`). Propres à l'onglet, dans
`tabs/patch.css` : `.p-state`, `.p-body`, `.p-note`, `.p-seg` (le segmenté de
Discord, recopié faute de composant commun), `.p-out` (une sortie de
commande).

## Publication — croquis

### Bannières (1200 px, fait — B35)

Les fenêtres de recrutement de la home (`banner.json`), et ce que la table du
jeu en sait de plus. Croquis du rendu :

```
.head  Bannières — Les fenêtres de recrutement que montre la home. Rien ne s'écrit à la saisie…
.savebar   2 changements · 1 refus   [Annuler] [Enregistrer]   (la liste entière part : fichier, R2, commit)
.card « Dans le jeu »  card-head : titre · badge edit « 2 à insérer » · badge warn « 1 à aligner » … [Tout insérer] (absent sans rien d'insérable)
   une ligne par fenêtre (.b-win), les manquantes puis les dérives de fin :
     visage 32 px · nom EN du roster · badge du type (pickup, seasonal, fes, « seasonal · sélection »…) · « 2026-10-20 → 2026-11-17 » · badge de statut … [Insérer]
     un perso hors du roster du site : son id, badge ko « hors roster », [Insérer] éteint
     visage · nom · badge du type · « 2026-09-08 → fin curée 2026-10-05, jeu 2026-10-06 » … [Aligner sur le jeu]
   rien à proposer : « Les bannières du jeu sont toutes dans la liste. » ; sans table du jeu : le message du serveur, en texte atténué (pas en rouge)
   insérer et aligner sont des changements EN ATTENTE : la ligne quitte la carte et entre dans la liste, rien ne s'écrit avant « Enregistrer »
.card  card-head : « 52 bannières » · badges « 2 actives » · « 1 à venir » · « 1 brouillon » · « 49 expirées » … [☑ masquer les expirées] [＋ bannière]
   table, récent → ancien :  visage 32 px + [nom affiché 30ch] | [début, date] | [fin, date] | statut | ✕
     statut : badge ok « active · 12 j restants » (« dernier jour » à zéro) · badge upcoming « à venir · dans 5 j » · badge expired « expirée » (ligne à 50 %) · badge warn « brouillon » (sans dates)
              puis badge edit « nouvelle » ou « modifiée », et badge ko « refusée » (`title` = le refus ; les champs de la ligne bordés de rouge)
     « masquer les expirées » est coché d'office ; une ligne expirée qui porte un changement ou un refus reste à l'écran
     « ＋ bannière » pose une ligne en tête : [Chercher un perso…] et sa liste de suggestions du roster (.picker + .results, à partir de deux lettres, ceux qui commencent par la saisie d'abord ; Entrée prend la première) ; le perso choisi, la ligne montre son visage et son nom prérempli, sans dates = brouillon
   .empty « Aucune bannière active ou à venir — 50 expirées masquées. »
```

Le diff vient du serveur (`/api/banners/state` : `missing`, `drift`), la page
n'y retire que ce que la liste en cours porte déjà. Le statut se lit au jour
UTC du serveur (`today`), la règle de la home. Une frappe ne redessine pas la
ligne (le champ garde le curseur) : son statut, le résumé, la carte du jeu et
la savebar suivent. La table ne défile en largeur que sous 760 px — au-dessus,
la liste de suggestions sort de la table au lieu d'y être rognée. La cellule
du ✕ est `td.b-del`, pas `td.actions` : `.actions` est une rangée flex, et une
cellule qui n'en est plus une décale son filet. Quitter l'onglet avec des
changements en attente demande confirmation (`canLeave`).

### Journal du site (1200 px, fait — B37)

Le changelog du site (`changelog.json`, la page `/changelog` et la home) :
une entrée se pose par gabarit, se traduit, et se relit comme la page la
montrera. Croquis du rendu :

```
.head  Journal du site — Ce que la page /changelog et la home annoncent. Rien ne s'écrit à la saisie… Le site le lit au build…
.savebar   2 entrées modifiées · 1 refus   Aperçu [en|fr|es|jp|kr|zh]   [Annuler] [Enregistrer]   (le fichier entier part, puis un commit — pas de R2)
.card.pad « Nouvelle entrée »  [＋ Perso] [＋ Guide] [＋ Mise à jour] [＋ Page / outil] [＋ News] [＋ Correctif] [＋ Manuel]   (.btn.ghost.sm, un par gabarit du serveur)
   un gabarit sans champ (Page / outil, News, Correctif, Manuel) pose son entrée d'un clic
   Perso : .form — [Chercher un perso…] et ses suggestions du roster (.picker + .results, deux lettres, Entrée prend la première) ; le choix POSE l'entrée : titre dans les six langues, puce en anglais, slug en lien
   Guide, Mise à jour : .form — un champ par champ du gabarit, préremplis par le serveur ([Guide 30ch] [Mode ▾] [Mois 22ch « October 2026 »] [Slug du guide 30ch]) puis [Poser l'entrée] (Entrée aussi) ; un second clic sur le gabarit referme
   l'entrée posée arrive en tête, dépliée, datée du jour ; un champ laissé vide reste ÉCRIT dedans ({guide}, {slug}) et l'enregistrement la refuse tant qu'il y est
.card  card-head : « 150 entrées » · badges « 1 brouillon » · « 2 programmées » … [Filtrer : titre, contenu, slug… 30ch] [Tous les types ▾]
   ul.j-list, récent → ancien — 40 lignes dessinées à la fois ; card-foot : « 40 entrées montrées sur 150 » … [Afficher plus (40)]
   une entrée PLIÉE = une ligne (un bouton, `aria-expanded`) :  ▸ 2026-10-06 (chasse fixe) · badge du type (la teinte de la carte du site) · titre anglais · chip « guide · /guides/… » (tronquée, `title` = la cible)
        puis badge warn « brouillon » ou upcoming « programmée » (date à venir), badge ko « refusée » (`title` = le refus, filet rouge à gauche), et à droite le point accent d'une entrée nouvelle ou modifiée
   DÉPLIÉE, sa fiche (.j-sheet) sous la ligne :
        .form  [Date] [Type ▾] [☐ brouillon] … [Supprimer] (danger, sm)
        Titre (en) [toute la largeur]
        ▸ [Titre — autres langues] « 5 / 5 »   (details, ouvert quand une langue est remplie : fr · es · jp · kr · zh, trois par rangée)
        Puces (en) — une par ligne ; **gras**   (UNE textarea : une ligne = une puce)
        [Traduire] · badge warn « à retraduire » (l'anglais a changé depuis le chargement ou la dernière traduction) · badge error (le refus du traducteur)
        ▸ [Puces — autres langues] « 5 / 5 »   (details : cinq textarea)
        .form  [Lien ▾ : aucun · perso · guide · outil · page] [Slug du perso | Chemin, 42ch, chasse fixe — pour un perso, les suggestions du roster] [Image (chemin, facultatif…) 42ch]
        APERÇU  « ce que la page /changelog montrera » — sur le fond de la page : la carte du site (.j-card, 720 px au plus)
             vignette 56 px (l'image explicite, sinon le portrait du perso ou la carte du guide, sinon l'emoji du type) | badge du type · date dans la langue
             titre (16 px, gras) · les puces (pastilles pleines, le gras `**…**` rendu) · « View character → » en accent, puis sa cible en chasse fixe atténuée
   .empty « Aucune entrée ne correspond au filtre. »
le hash (une entrée pour un lien ou le banc ; la page ne l'écrit pas) : `#changelog/<n>` ouvre l'onglet sur la fiche de la n-ième entrée de la liste, à partir de 0 — la plus récente
```

Tout ce qui se lit vient de `GET /api/changelog/state` (les entrées dans
l'ordre du fichier, le jour UTC, le roster, les gabarits et leurs champs
préremplis, les libellés des types et des sortes de lien — la page n'en
recopie aucun). Un gabarit se remplit AU SERVEUR (`GET /api/changelog/fill`,
`fillTemplate`) : la page n'a ni les noms du roster dans six langues ni la
règle. « Traduire » envoie le titre et les puces anglaises de l'entrée à
`POST /api/translate` — une puce = un texte, le nombre de puces d'une langue
suit l'anglais — et RÉÉCRIT les cinq langues, remplies ou non. L'aperçu rend
`POST /api/changelog/preview` (`previewChangelogEntry` : les fonctions de la
carte du site) dans la langue du groupe segmenté de la savebar, une pour
toutes les fiches : une requête à l'ouverture d'une fiche, puis UNE par entrée
400 ms après la dernière frappe, et une par fiche ouverte au changement de
langue ; pendant qu'elle court le rendu précédent reste, atténué (`.busy`) ;
un refus s'écrit en rouge dans le bloc. Une frappe ne redessine pas la fiche
(le champ garde le curseur) : sa ligne, ses badges, les comptes « n / 5 », la
savebar et l'aperçu suivent. Le filtre ne masque ni une fiche dépliée ni une
entrée pas encore enregistrée. Une entrée posée et laissée vide ne compte
pas, « Annuler » la retire. « Enregistrer » envoie la liste entière, récent →
ancien — une entrée intacte repart telle que le disque la porte, aucun diff
hors de ce qui a bougé — et l'état est relu. Quitter l'onglet avec des
changements en attente demande confirmation (`canLeave`). Propres à l'onglet,
dans `tabs/changelog.css` : `.j-line`, `.j-sheet`, `.j-more`, `.j-grid`,
`.j-badge` et ses teintes `.j-t-<type>` (les jetons `--cat-*-fg` du site,
recopiés sous les mêmes noms), `.j-chip`, `.j-seg` (le segmenté de Gear reco,
recopié faute de composant commun), `.j-card` (la carte de `/changelog`).

## Le picker de héros (`ui/hero-picker.mjs`, lot C11)

La modale où l'on choisit un perso — ou plusieurs —, PARTAGÉE : « Fiche
perso » et Gear reco l'ouvrent, les synergies s'en servent en multi-choix. Et
autre chose qu'un héros, quand ce n'est qu'une question de contenu : le
sous-onglet Skills y choisit un EFFET du glossaire (B39).
Elle n'est à aucun onglet : `openHeroPicker(opts)` la pose dans `<body>` au
premier appel (classes `hp-`, `ui/hero-picker.css`), aux mesures du picker de
pièces de Gear reco. Une section n'a donc rien à écrire dans son HTML.

```
openHeroPicker({ roster, imgBase, title, onPick, multi?, chosen?, opener?, filters?, tally?, seg?, count?, hint?, tile?, rows?, placeholder?, none? })
.hp-modal (voile, fixe)  >  .hp-panel (720 px, 720 px de haut au plus)
  .hp-head     titre en capitales · badge « 129 persos » (multi : « 2 choisis sur 129 » ; `tally` le remplace) … ✕
  .hp-top      la recherche (36 px, « Chercher un perso… ») ; dessous .hp-filters :
                 pastilles d'élément puis de classe (.hp-tog 36 px, `aria-pressed` ; celles que le roster porte, dans l'ordre du site ; aucune enfoncée = toutes)
                 `seg` : un groupe segmenté de plus, poussé à droite (Gear reco : Tous · Avec recos · Sans recos)
  .hp-body     .hp-tiles — une tuile par perso, dans l'ordre du roster : visage 64 px dans son anneau (.hp-ring, accent sur le choix), icône d'élément en bas à gauche, le nom dessous (11 px)
                 `count` : une pastille en haut à droite (le nombre de builds, atténuée à zéro) ; en multi-choix, ✓ sur une tuile cochée
               .empty « Aucun perso ne correspond. »
  .hp-foot     en multi-choix seulement : les noms cochés, dans l'ordre des clics (« Aucun perso. ») … [Annuler] [Valider]
autre chose que des héros (le picker d'effets de Skills) :
  `tile(item)`  le contenu d'une tuile, dessiné par l'appelant, dans le bouton du picker — ni visage ni anneau ; son CSS est à l'appelant, sous `.hp-modal`
  `rows`        .hp-tiles.rows : des tuiles en LIGNES (une icône, le nom à côté, 13 px), 200 px au moins, trois colonnes dans le panneau
  `placeholder` la recherche (« Chercher un effet… », aussi son `aria-label`) ; `none` : le vide (« Aucun effet ne correspond. »)
  un item sans `class` ni `element` : aucune pastille — l'appelant passe SES `filters`, ceux du module pourraient porter une classe enfoncée
```

Choix unique : la tuile cliquée part à `onPick(id)` et la modale se ferme —
sauf si `onPick` rend `false` (des changements en attente, l'abandon refusé).
Multi-choix : un clic coche ou décoche, « Valider » rend `onPick(ids)`. La
recherche repart vide à chaque ouverture ; les filtres restent là où
l'appelant les garde (`filters`, cf. `heroFilters()`), sinon dans le module.
Clavier : Entrée dans la recherche prend la première tuile (choix unique) ou
valide (multi-choix, Ctrl + Entrée aussi) ; Entrée ou Espace sur une tuile la
choisit ; Échap, la croix et le voile ferment sans rien poser ; Tab reste dans
le panneau ; à la fermeture le focus revient à `opener()`.

## Éditeurs — croquis

### Fiche perso (`wide`, coquille et sous-onglet Fiche — C11 ; Pros / Cons et Synergies — B42 ; Skills — B39)

Ce que le wiki sait d'UN perso, en sous-onglets comme sur sa fiche du site :
l'éditeur « Character » de l'admin, son onglet « Skills (buff/debuff) » et ses
outils Pro / Con et Synergy. Croquis du rendu :

```
.head  Fiche perso — Ce que le wiki sait d'un perso, par sous-onglets. Rien ne s'écrit à la saisie… Les rangs et le rôle se règlent aussi dans la grille Rangs.
.card.pad.c-char  l'en-tête de Gear reco : portrait 56 px, nom, élément · classe · sous-classe (son icône) · ★★★ · badge off « chaîne join » ; à droite [Changer de perso] (le picker de héros)
   sans perso : « Aucun perso choisi. », [Choisir un perso], et le picker OUVERT d'office à chaque venue sur l'onglet
.savebar   2 changements · 1 refus · 1 erreur · « Priorité de skills · Skill 2 : entre 1 et 3, ou vide »   Aperçu [en|fr|es|jp|kr|zh]   [Annuler] [Enregistrer]   (UNE barre pour tous les sous-onglets ; absente sans perso)
   « Aperçu » (.c-pv-lang, le groupe segmenté .c-seg — celui de Gear reco) : la langue de l'aperçu des textes, `en` d'office, UNE pour toute la fiche ; absent du sous-onglet Fiche, qui n'a pas de texte
.c-tabs (role tablist — la rangée des onglets de builds de Gear reco, `.tab` en 32 px)  [Fiche ●] [Pros / Cons ●] [Synergies] [Skills] [Gear reco]
   le sous-onglet pas encore porté est là, `disabled`, `title` = le lot qui l'apporte (Gear reco B40)
   un point accent = des changements pas encore enregistrés DANS ce sous-onglet, rouge = un refus ou une erreur
   clavier : ← → (les bouts se rejoignent), Début, Fin — parmi les sous-onglets allumés ; `tabindex` 0 sur l'actif, -1 ailleurs
#c-panel (le `tabpanel`) — Fiche : .c-cols, deux colonnes de .card (une seule sous 1000 px)
  .card « Rangs »   card-head : titre · badge edit « modifié » · badge ko « refusé »
     .form : [Rang PvE ▾] [Rang PvP ▾] [Rôle ▾] — la cellule de Rangs : l'icône du rang dans le cadre, bord et fond accent quand modifiée, bord danger quand refusée, son refus dessous en rouge
     PAR TRANSCENDANCE  table : [palier ▾] | [rang ▾] | [rôle ▾] | ✕ — une ligne par palier qui porte une valeur ; le menu du palier propose le sien et ceux qui sont libres, en changer emmène rang et rôle
        [＋ palier] (.btn.ghost.sm : le premier palier libre ; éteint quand les quatre sont là) · « Vide = palier non noté : il hérite… » · un palier hérité hors des pleins est DIT, pas édité
        sans palier : « Aucun palier : le rang et le rôle valent à toute transcendance. »
  .card « Kit »     card-head : titre · badges
     PRIORITÉ DE SKILLS  .form : [Skill 1] [Skill 2] [Ultimate] (nombre, 1 à 3) « 1 à 3 ; vide = non renseigné. » — une valeur hors de 1 à 3 : champ rouge, l'erreur dessous, rien n'est envoyé
     TAGS  les tags humains en cases (.check : free) ; dessous « déduits des données » puis les tags du jeu en .badge.off (lecture)
  .card « Vidéos » (pleine largeur)  card-head : titre · badge du compte · « en lecture » … lien « ajouter dans Vidéos » (ouvre l'onglet Vidéos sur ce perso)
     une ligne par vidéo : titre · auteur · date ; « aucune vidéo »
#c-panel — Pros / Cons : .c-cols, deux .card côte à côte (une seule sous 1000 px)
  .card « Pros » | .card « Cons »   card-head : titre · badge off (le compte) · badge edit « modifié » · badge ko « refusé »
     .c-lines : une ligne (.c-line, filet à gauche — accent quand elle est modifiée) = son texte, et ✕ (.btn.icon) à droite
        le TEXTE d'une ligne (.c-text, le même dans Synergies) :
          [textarea EN, 2 lignes, qui grandit avec le texte]   (bord danger quand la ligne est refusée)
          .c-pv  l'aperçu : les segments que le site rendra (icône + libellé dans la couleur du site), un tag inconnu en ROUGE ; atténué pendant que la requête court ; absent tant que le texte est vide
          .c-err le refus de la ligne, en rouge
          <details> [Traductions (5)] · badge warn « à retraduire » · « 3 / 5 »   — replié ; déplié : cinq textarea fr · es · jp · kr · zh, trois par rangée, placeholder = l'anglais
     [＋ pro] / [＋ con] (.btn.ghost.sm, en pied de carte) ; « Aucun pro. » / « Aucun con. »
  sous les deux cartes : [Traduire] (.btn.ghost, `title` : il ÉCRASE) · badge error (son refus) · le refus du champ entier (`stale`, forme)
#c-panel — Synergies : .c-syn, une pile de .card.c-group, une par groupe
  .card   card-head : « Groupe 1 » · badge edit « modifié » · badge ko « refusé » … ✕ à droite (retire le groupe)
     .c-heroes : des tuiles (.c-hero : portrait 44 px cadré sur le visage, nom, ✕) puis [＋ héros] (.btn.ghost.sm — le picker de héros en `multi`, les héros du groupe cochés, le perso de la fiche exclu)
     la raison : le TEXTE d'une ligne, comme un pro
  sous la pile : [＋ groupe] [Traduire] · badge error · le refus du champ ; « Aucune synergie. »
#c-panel — Skills : .c-cols, une .card.c-skill par carte de skill, deux par rangée (une seule sous 1000 px) — mains, passifs, chaîne, duo
  .card   card-head : icône du skill 36 px (le duo n'en a pas) · nom · id · type (chasse fixe) · badge edit « modifié » · badge ko « refusé »
     .c-desc   la description telle que le jeu l'écrit, en anglais : ses couleurs, ses sauts de ligne (`gameText` de `gear-view.mjs`)
     .c-chips  les chips d'effets, puis [＋ effet] (.btn.ghost.sm)
        une chip = la `.chip` de la charte : tuile de l'effet 22 px (.c-fx : fond noir, l'icône en masque teinté buff ou debuff ; cadre vide sans icône) · nom · ✕ (`title` de la chip = sa ref)
        ✕ sur une chip du kit la MASQUE : pointillés, atténuée, nom barré, et [rétablir] à la place de ✕
        un effet AJOUTÉ : badge edit « ajoutée », son ✕ le retire
        bord accent (.dirty) : la chip n'est pas dans l'état que le disque porte
     .c-err    le refus de la carte, en rouge
  [＋ effet] ouvre le picker partagé sur le catalogue des effets : « Ajouter un effet — <skill> », la recherche sur le nom, [Tous | Buffs | Debuffs], des tuiles en lignes (tuile 28 px + nom) ; les homonymes sont départagés (« Barrier (buff) », « Barrier (irremovable, buff) ») ; un effet déjà ajouté à la carte n'est plus proposé
  sous les cartes : le refus du champ entier (cartes illisibles au serveur) ; .empty « Kit illisible : … » / « Aucune carte de skill. »
.card.ko (une carte qui porte un refus ou une erreur) : bord danger
le hash : `#character/<id>/<sous-onglet>` (`fiche` · `pros-cons` · `synergies` · `skills` · `gear` ; `#character/<id>` = `fiche`, un sous-onglet éteint aussi) — la page l'écrit au choix du perso et du sous-onglet : recharger y revient
   `#character/<id>/skills/picker/<n>` ouvre en plus le picker d'effets de la n-ième carte (à partir de 1) — pour le banc, la page ne l'écrit pas
```

Le roster vient de `GET /api/character/roster`, lu UNE fois ; la fiche d'un
perso de `GET /api/character/state?id=` (`characterSheetState` : sa ligne, sa
chaîne, ses tags dérivés, son entrée curée entière, ses rangs et les listes de
leurs menus, les tags humains, ses vidéos — la page n'en recopie aucun), relue
à chaque venue sur l'onglet quand rien n'est en attente (un rang a pu changer
dans Rangs). Les rangs sont des CELLULES, celles de Rangs : même forme
envoyée, même refus par cellule. « Enregistrer » envoie toute la fiche à
`POST /api/character` (`saveCharacterSheet`) — les cellules modifiées, les
champs hors rangs qui ont bougé (chacun entier), et l'entrée que la page
avait chargée (`was`) — pour UN commit `chore(characters): <perso>`, puis
relit le disque. Une cellule enregistrée ou refusée n'est plus « modifiée » :
la refusée montre la valeur du disque, cerclée, son refus dessous. Un champ
hors rangs refusé garde sa saisie — sauf si c'est le disque qui avait changé
sous lui (`stale`, rien n'est alors écrit) : il montre le disque. Une frappe
ne redessine pas la carte (le champ garde le curseur) : ses badges, le point
du sous-onglet et la savebar suivent ; seule la table des paliers est
redessinée, quand un palier est ajouté, retiré ou déplacé. « Annuler » relit
le disque. Changer de perso ou quitter l'onglet avec des changements en
attente demande confirmation (`canLeave`).

Pros / Cons et Synergies (B42) sont des TEXTES À TAGS INLINE (`{B/…}`,
`{SK/Aer|S3}`…), sur le modèle de la Note de Gear reco : l'anglais se saisit,
« Traduire » génère les autres langues, à relire. Une ligne compte dans la
savebar dès qu'elle diffère du disque — ajoutée (vide, elle ne compte pas et
ne part pas), modifiée, retirée ; chaque liste part ENTIÈRE (`curated.prosCons`
avec ses deux listes, `curated.synergies`), les langues d'un texte dans
l'ordre où le fichier les portait. L'aperçu : UNE requête pour toutes les
lignes du sous-onglet montré (`POST /api/character/preview` →
`renderInlineBatch`, l'aperçu de l'admin), 400 ms après la dernière frappe,
dans la langue de la savebar — une langue qu'une ligne ne porte pas se replie
sur l'anglais, comme au rendu ; les segments sont rendus par `noteHtml` de
`gear-view.mjs`. « à retraduire » : l'anglais a bougé depuis le chargement (ou
depuis le dernier « Traduire ») et des traductions sont en place. « Traduire »
envoie les textes anglais du sous-onglet à `POST /api/translate` et ÉCRASE les
cinq autres langues, comme dans l'admin ; ce qu'il vient de traduire se
déplie ; un refus (pas de clé, le moteur) va au journal et à côté du bouton,
rien ne bouge. À l'enregistrement le serveur CONTRÔLE avant d'écrire, comme
les notes de Gear reco : chaque tag de chaque langue par la résolution du
site (`checkText`), l'anglais présent, la parité des balises d'un texte écrit
dans toutes les langues, les héros d'une synergie dans le roster, pas de
groupe sans héros. Un écart est un refus SITUÉ (`list`, `index` dans la liste
envoyée) : la ligne garde sa saisie, son message dessous, sa carte cerclée,
le point rouge sur son sous-onglet — y retoucher le lève. `refs` de l'état
(`buildInlineRefs`, les listes de saisie assistée de l'admin) est servi, pas
encore lu par la page : ce n'est PAS le contrôle (à apparence égale elle ne
garde qu'une clé d'effet).

Skills (B39) porte l'éditeur de kit de l'admin (`CharacterKitEditor`) : la
présentation seule, la donnée extraite reste fidèle aux tables. `kit` de
l'état sert tout — les cartes et leurs chips telles que l'admin les calcule
(`characterKitCards` de `src/lib/admin/character-kit.ts`, sur l'extraction du
jeu ; les icônes de skill sont celles du site), ce que
`data/curated/character-skills.json` masque (`chipHide`) et ajoute
(`chipAdd`) sur CES cartes, le catalogue des effets et le dossier de leurs
icônes ; sans tables du jeu sur le poste, `kit.error` le dit et le reste de la
fiche se lit. Un geste sur une chip redessine SA carte seule (le focus reste
sur la chip, ou va à « ＋ effet ») ; la savebar compte chaque chip masquée,
rétablie, ajoutée ou retirée, le point du sous-onglet suit. « Enregistrer »
joint `kit` à l'envoi de la fiche : les seules cartes modifiées, leurs deux
listes ENTIÈRES (une ref héritée du fichier, que la carte ne montre pas, y
reste). Le serveur recalcule les cartes du perso, n'écrit que les listes qui
bougent (`applyCharacterKitCuration`) et refuse, SITUÉ à la carte (`card`),
une ref ajoutée qui n'est pas une chip de la carte ou un effet du catalogue ;
le commit — toujours UN, `chore(characters): <perso>` — porte alors AUSSI
`character-skills.json`. Une carte refusée garde sa saisie, cerclée, son
message dessous ; y retoucher le lève.

Propres à l'onglet, dans `tabs/character.css` : `.c-char`, `.c-who` et
consorts (l'en-tête de Gear reco, recopié), `.c-tabs`, `.c-cols`, `.c-card`,
`.c-body`, `.c-cell`, `.c-rkico`, `.c-pt` (la cellule de Rangs, recopiée),
`.c-tiers`, `.c-err`, `.c-tags`, `.c-derived`, `.c-videos` ; pour les textes :
`.c-pv-lang`, `.c-seg`, `.c-lines`, `.c-line`, `.c-text`, `.c-pv`, `.c-trs`,
`.c-ko`, `.c-syn`, `.c-group`, `.c-heroes`, `.c-hero` — et les jetons et
classes de couleur des segments (`.pv-*`, `text-buff`…), recopiés de
`gear.css` où ils vivent sous `#tab-gear` ; pour Skills : `.c-skill`,
`.c-skico`, `.c-skid`, `.c-desc`, `.c-chips`, `.c-chip`, `.c-chn`, et `.c-fx`,
la tuile d'effet de l'onglet Effets (`.x-ico`), recopiée avec ses deux
teintes — elle vaut aussi sous `.hp-modal`, pour le picker d'effets.

### Effets (`wide`, fait — B41)

Le glossaire des effets : ce que le jeu fournit et l'entrée curée de chacun
(`data/curated/effects.json`), l'éditeur « Effect » de l'admin sans son menu
latéral. Croquis du rendu :

```
.head  Effets — Le glossaire des effets : ce que le jeu fournit… Rien ne s'écrit à la saisie… Lus au rendu…
.savebar   2 effets modifiés · 1 refus   [Annuler] [Enregistrer]   (un lot : tous les effets modifiés, pas seulement celui à l'écran)
.card.pad  .form sur UNE ligne : [Chercher 42ch « Nom (en, fr), id, clé BT_… — ou 日本語, 한국어, 中文 »] [Nature ▾ : Buffs et debuffs · Buffs · Debuffs] [☐ sans description] [☐ curés seulement] [☐ masqués]   …à droite [Nouvel effet 22ch, chasse fixe « ID (ex. UNCOUNTERABLE) »] [＋ effet]
   dessous, le compte : « 212 effets — 188 statuts, 12 mécaniques, 12 créations · 42 curés · 8 sans description · 2 masqués » ; dès qu'un filtre ou une recherche joue : « 4 sur 212 effets »
.x-cols — deux colonnes (le catalogue | la fiche, 560 px ; l'une sous l'autre sous 1000 px)
  gauche .card.x-list : en-têtes BUFF (bleu) | DEBUFF (rouge), puis le catalogue, qui défile dans sa carte
     PAS de menu latéral : le catalogue EST la liste. Une rangée (.x-pair) = une PAIRE miroir côte à côte (Increased Speed | Reduced Speed), dans l'ordre du serveur
     puis .x-sep « Sans miroir (156) » et les orphelins, un buff et un debuff par rangée, la case vide quand une colonne est plus courte
     une ligne (.x-row, un bouton) : tuile 28 px · nom EN (« sans nom » en rouge) · badges · point
        dessous : id (chasse fixe) · origine (statut · mécanique · création) · « curé » (un effet extrait qui porte une entrée) · famille éditoriale
        dessous, en italique atténué : POURQUOI la ligne répond à la recherche — « nom en », « nom fr · Vitesse accrue », « clé BT_STAT|ST_SPEED », « id 15 », « nom jp · スピードUP »
        badges : nature (buff bleu, debuff rouge) · « irremovable » (off) · « masqué » (off) · « sans description » (warn) · « sans icône » (ko) · « nouveau » (edit, une création pas encore enregistrée)
        point : accent = modifié, pas enregistré ; rouge = refusé au dernier enregistrement (`title` = le refus)
     une paire reste ENTIÈRE dès qu'un de ses deux membres passe la recherche et les filtres : le miroir qui ne passe pas est atténué (45 %), sans raison
     « Nature » choisie : UNE colonne (les en-têtes s'effacent) — les effets en paire de cette nature, puis « Sans miroir »
     l'effet ouvert garde sa ligne hors des filtres ; en tête, .x-sep « Nouveaux, pas encore enregistrés (1) » et les créations de « ＋ effet »
     .empty « Aucun effet ne correspond. »
  droite .card.x-sheet (l'effet choisi, `#effects/<id>` ; avant, un .empty « Choisir un effet dans le catalogue. »)
     tuile 48 px · nom (le nom anglais saisi, sinon l'extrait, sinon l'id) · id · origine · « icône du jeu » (ok) / « icône du wiki » (warn) / « sans icône » (ko) · badges (nature effective, « nouveau », « refusé », « modifié »)
     un effet EXTRAIT : cadre « Ce que le jeu fournit » — la description anglaise (balises retirées), les clés de l'index en .chip.x-key (chasse fixe, lecture seule), « Tooltips fusionnés : … »
     une CRÉATION : p.hint « Aucune donnée extraite pour cet id… »
     Nom — six champs, deux par rangée (.x-langs), `placeholder` = le nom extrait ; « Vide = le nom extrait » (création : « L'anglais est requis. »)
     Description — six textarea, `placeholder` = la description extraite, telle que le jeu l'écrit
     .form  [Icône 30ch, chasse fixe, `list` = les icônes déjà portées par un effet] [Nature ▾ : celle de l'extrait (buff) · buff · debuff] [Famille éditoriale (buff) ▾ : par défaut (taxonomie) + les familles du côté EFFECTIF ; une famille de l'autre côté reste proposée, « cc (autre côté) »]
     Clés éditoriales ({B/…} et {D/…}) — une textarea en chasse fixe, virgule ou retour à la ligne
     [☐ Masquer du site (bruit, interne)]   Note interne (textarea)
     p.hint « Tout vider puis « Enregistrer » retire l'entrée curée : l'extrait fait foi. » (création : « Une création garde au moins son nom anglais. »)
```

Tout ce qui se lit vient de `GET /api/effects/state` (`effectsState` : le
catalogue rangé par `pairEffects` de l'admin, et par effet sa ligne, son
extrait SANS la curation, son entrée curée du disque ; les comptes, les
familles et leurs libellés par côté, les libellés d'origine, les langues, le
dossier des icônes et celles déjà portées — la page n'en recopie aucun). La
RECHERCHE est au serveur : `GET /api/effects/search?q=` (`effectsSearch`)
joue la règle de `src/lib/admin/effect-search.ts` et rend, par effet qui
répond, le champ qui a répondu — 200 ms après la dernière frappe, seule la
dernière demande se dessine, un champ vidé rend tout aussitôt. Les filtres,
eux, sont à la page (ils lisent la ligne). La tuile (`.x-ico`) est celle du
site (`EffectIconTile`) : fond noir, l'icône en masque teinté de sa nature
(`--buff-tint`, `--debuff-tint`, recopiés de `globals.css` et portés par
`#tab-effects`), sauf les icônes « Interruption », qui gardent leurs couleurs.
Une frappe ne redessine pas la fiche (le champ garde le curseur) : son titre,
sa tuile, les familles du côté effectif, le point de sa ligne, ses badges et
la savebar suivent ; la LIGNE du catalogue (nom, badges) ne suit qu'après
« Enregistrer », quand l'état est relu. « ＋ effet » demande l'id au serveur
(`GET /api/effects/id?raw=`, la règle de l'admin : capitales, blancs en `_`) :
un id qui existe ouvre sa fiche, un id nouveau pose une fiche vierge — elle ne
compte pas tant que rien n'y est saisi. « Enregistrer » envoie tous les effets
modifiés à `POST /api/effects` (`saveEffects`), chacun avec l'entrée que la
page avait chargée (`was`) et `create` pour une création ; un effet refusé
GARDE sa saisie, marqué d'un point rouge — sauf si le disque avait changé
(`stale`) : sa fiche montre alors le disque. « Annuler » rend le disque et
retire les créations. Quitter l'onglet avec des effets en attente demande
confirmation (`canLeave`). Propres à l'onglet, dans `tabs/effects.css` :
`.x-cols`, `.x-list`, `.x-heads`, `.x-rows`, `.x-pair`, `.x-sep`, `.x-row`,
`.x-dim`, `.x-why`, `.x-nat`, `.x-ico`, `.x-sheet`, `.x-ext`, `.x-key`,
`.x-langs`.

## Outils — croquis

### Noms (1200 px, fait — B34)

Le nom court d'affichage et les alias de recherche d'un perso, les deux outils
de l'admin en un onglet. Croquis du rendu :

```
.head  Noms — Le nom court d'affichage d'un perso et ses alias de recherche…
.savebar   2 persos modifiés · 1 refus   [Annuler] [Enregistrer]   (un lot : tous les persos modifiés, pas seulement celui à l'écran)
.card.n-cols — deux colonnes (320 px | le reste ; l'une sous l'autre sous 900 px)
  gauche .n-side : [Chercher un perso…] [État ▾ : À traiter (défaut) · Nom court trop long · Avec nom court · Avec alias · Tous]
                   « 3 à traiter sur 129 »
                   la liste (elle défile dans sa colonne), une ligne = un bouton : visage 32 px · nom EN · badge d'état · point
                     badge : « déborde » (ko) = à traiter ; « court trop long » (warn) ; « court » (ok) = un nom court qui tient ; rien quand tout tient
                     point : accent = modifié, pas enregistré ; rouge = refusé au dernier enregistrement
                     tri : à traiter, puis court trop long, puis par nom ; le perso ouvert garde sa ligne hors du filtre d'état
                   .empty « Aucun perso à traiter… » quand la liste est vide
  droite .n-sheet (le perso choisi, `#names/<id>` ; avant, un .empty « Choisir un perso dans la liste. »)
     visage 56 px · nom EN · ses badges (l'état, « refusé : le disque avait changé », « modifié »)
     p.hint  la règle : le nom court là où le nom complet ne tient pas sur deux lignes de 80 px ; sans valeur, l'anglais sert
     table  Langue | Nom complet + badge « tient » (ok) / « déborde » (ko) | Nom court : [input 22ch, placeholder = le nom complet] puis le verdict du nom court EFFECTIF
            verdict : badge « tient » / « déborde » / « — » (aucun nom court) / « … » (le serveur n'a pas encore jugé) ; champ vide = « = en : S.Regina » atténué devant le badge
     Alias de recherche  « Déjà cherchable » : .chip.base (atténués, sans croix)
                         « Alias (n) » : un cadre de champ (.n-box) — .chip.alias (accent, ✕), .chip.alias.warn + title « déjà cherchable sans cet alias », puis l'input « + alias (Entrée, virgule)… »
                         Entrée ou virgule ajoute, Retour arrière sur champ vide retire le dernier, ✕ retire ; le texte encore dans le champ part avec « Enregistrer »
```

Le verdict vient du serveur, jamais de la page : `/api/names/state` le donne
pour le disque (la liste et les badges d'état ne bougent donc qu'après
« Enregistrer », quand l'état est relu), `POST /api/names/fit` pour la saisie
— 300 ms après la dernière frappe, les noms courts effectifs du perso en une
requête, gardés par texte. Le point d'une ligne et le badge « modifié » suivent
la saisie aussitôt. Quitter l'onglet avec des persos en attente demande
confirmation (`canLeave`), comme Gear reco.
