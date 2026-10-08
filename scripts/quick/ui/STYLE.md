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
  grisé avec son badge « à venir » : Éditeurs, Guides, tant que quick n'a pas
  repris l'admin — Outils a sa première section, Noms), puis à droite les
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
- Ce qu'une section dit d'elle à `sections.register` : `init()` (une fois, au
  démarrage), `open()` (chaque fois qu'elle vient à l'écran), `dirty()`,
  `canLeave()`. `sections.go('<id>')` ouvre une autre section, comme un clic
  sur son onglet. Un `post()` réussi qui a committé ou poussé émet
  `quick:saved` sur `document`.
- **`<main>`** : 1200 px centrés, 24 px de marge.
  `wide: true` dans l'entrée de `GROUPS` lui donne toute la largeur
  (`main.wide`) : Rangs, Gear reco, Discord. Une section est une colonne à
  18 px d'écart : `.head` (le `h2` et sa `p.hint`), puis des `.card`.
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

La barre d'enregistrement de Rangs, Gear reco, Noms et Bannières : le compte de changements
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
le picker (UNE modale pour le perso, les pièces, les talismans, les sets — `gPkOpen`, lot C7) : titre + badge · recherche · rangée de filtres optionnelle (pastilles, groupe segmenté) · grille de tuiles (visages 64 px ; tuile d'item 64 px, nom coloré dessous, badge AP / CP ou « hors classe » ; un set = ses quatre pièces de 34 px en grille 2 × 2 ; anneau accent sur le choix, pastille ✓ en haut à gauche, `disabled` grisé — un set sans bonus 2 pièces parmi les secondaires) · en multi-choix (armes, amulettes, talismans, sets), un pied [récapitulatif] [Annuler] [Valider]
   clavier : Entrée dans la recherche = « Valider » en multi-choix (Ctrl + Entrée aussi), la première tuile en choix unique (le perso) ; Entrée ou Espace sur une tuile la coche ou la décoche ; Échap, la croix, le voile ferment sans rien poser ; Tab reste dans le panneau
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
     ● 10 fichiers modifiés  ou non suivis — ce qui est indexé part avec le prochain enregistrement      (warn ; « aucun fichier modifié » en vert)
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
