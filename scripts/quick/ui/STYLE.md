# quick — la charte graphique

> La page de `pnpm quick` ressemble à l'admin du site : mêmes couleurs, même
> sobriété, pas de web font. Ce fichier dit d'où viennent les jetons, ce que
> fait chaque composant de `quick.css` (un exemple de markup chacun), les
> règles de mise en page, et le croquis attendu des onglets qui restent à
> passer à la charte (Rangs, Gear reco, Discord). La maquette de départ est
> l'artefact Claude Design de Sevih du 07/10/2026 (cinq planches) ; ici, c'est
> ce que le code rend.

## Les jetons

Recopiés du `:root` de `src/app/globals.css`, **sous les mêmes noms** — une
couleur qui change sur le site se recopie ici, sans traduction :

| Jeton                                                                     | Valeur                            | Rôle                                                      |
| ------------------------------------------------------------------------- | --------------------------------- | --------------------------------------------------------- |
| `--surface-base`                                                          | `#0b1120`                         | le fond de la page, des champs                            |
| `--surface-raised`                                                        | `#131c2e`                         | l'en-tête, les cartes                                     |
| `--surface-overlay`                                                       | `#1e293b`                         | la savebar, le tiroir du journal, les chips, un survol    |
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
  **groupes** en onglets (`.gtab`, filet accent sous l'actif ; `.gtab.soon`
  grisé avec son badge « à venir » : Éditeurs, Guides, Outils, tant que quick
  n'a pas repris l'admin hors extractor et misc), puis à droite les pastilles
  des services (`.pill` + `.dot`, `title` = pourquoi), le poste et le port
  (`#env`), « Quitter ».
- **Sections** (`nav.tabs`, 40 px, `surface-sunken`) : les sections du groupe
  actif (`.tab`, filet accent sous l'active). Un groupe s'ouvre sur sa
  première section. Le hash (`#ranks`) sélectionne le groupe ET la section.
- Les deux rangées sont posées par `lib.js` d'après son tableau `GROUPS` :
  **ajouter une section** = une entrée `{ id, label, wide? }` dans le bon
  groupe, ses trois fichiers `tabs/<id>.{html,css,js}`, son marqueur
  `<!-- @tab id -->`, son `<link>` et son `import` dans `index.html`.
- **`<main>`** : 1200 px centrés, 24 px de marge, 72 px en bas (le tiroir).
  `wide: true` dans l'entrée de `GROUPS` lui donne toute la largeur
  (`main.wide`) : Rangs, Gear reco, Discord. Une section est une colonne à
  18 px d'écart : `.head` (le `h2` et sa `p.hint`), puis des `.card`.
- **Journal** (`.journal`, fixé en bas) : replié, une ligne — la dernière
  étape, la pastille (bat pendant une opération), le bouton « Journal » ;
  déplié, tout `#log` (40 % de la fenêtre au plus). `log(lines, ok, doing)`
  garde sa signature : `ok` indéfini + `doing` = l'opération commence, le
  tiroir s'ouvre seul et bat ; `ok` vrai / faux = il se colore (`data-state`
  `ok` / `ko`). Un simple message (`log(['Code requis.'], false)`) colore la
  barre sans l'ouvrir.

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

La barre d'enregistrement de Rangs et Gear reco : le compte de changements
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
- **Héritage** : `.row`, `button.action`, `button.ghost`, `a.ghost`,
  `label.check` (bloc « héritage » de `quick.css`) rendent les composants sous
  les anciens noms pour Rangs, Gear reco et Discord ; chaque lot qui passe un
  onglet à la charte les remplace par `.form` et `.btn`, le dernier retire le
  bloc.

## Les trois onglets qui suivent — croquis

Un croquis, pas un diktat : si l'agent du lot voit mieux, il dit pourquoi dans
`DONE.md`. Le markup de chaque onglet reste dans `tabs/<nom>.html` et son
style dans `tabs/<nom>.css` (aujourd'hui l'ancien bloc, jetons renommés).

### Rangs (B28, `wide`)

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

### Gear reco (B29, `wide`)

```
.head  Gear reco — Les builds d'un perso…
.card.pad  perso à gauche : portrait 56 px, nom, élément · classe · sous-classe · ★★★, badge « 2 builds · 1 note » ; à droite [Changer de perso] (le picker : recherche, élément, classe, portraits)
.savebar   1 changement · 1 erreur · « Build PvP : stat principale non permise » [＋ build] [Annuler] [Enregistrer]
.card (un build)  card-head : « Build » [nom 24ch] badge 1 / 2 · ✕ dupliquer ↑ ↓ ✕ (btn icon)
   grille 2 colonnes, 18 × 28 px : Armes | Talismans (badge preset $slug + « régler à la pièce ») | Amulettes | Sets | Substats (pleine largeur) | Notes en · fr · es (pleine largeur, 3 textarea, « + jp · kr · zh »)
   une pièce = [select 260px] [select 120px] ✕ ; « + arme » en .btn.ghost.sm
.card.ko (un build refusé) : bord danger, badge « stat principale non permise », le message sous la pièce
```

### Discord (C6, `wide`)

```
.head  Message Discord — Posté par le bot…
deux colonnes (flex, 20 px ; 380 px / 620 px, l'une sous l'autre en étroit)
  gauche .card : card-head [▾ replier] « Note officielle » [select de la note, 230px] « ouvrir l'original »
                 le cadre de la note (iframe) — REPLIÉ et remplacé par un .empty « Choisir une note » tant qu'aucune note n'est choisie : plus d'iframe blanc
         .card : « Anciens résumés » badge « 14 importés » [déplier] — la liste repliée
  droite .card.pad : .form sur UNE ligne — [Serveur ▾] [Salon ▾] [Emojis de ▾] [☐ sans aperçu des liens] et à droite un bouton segmenté Message | Embed (aria-pressed)
         .card : barre d'outils GROUPÉE (style · blocs · titres · listes · insertions), chaque bouton 30 × 30 avec `title` ; [convertir les dates] à droite
                 la zone de texte (textarea, chasse fixe) ; la palette en dessous, repliable
                 card-foot : [Insérer le gabarit] [Proposer un brouillon] [Copier la demande] exemples [3] · badge « 1 message · 612 / 2000 » [Copier le message] [Envoyer dans #salon]
         .card : « Aperçu — tel que Discord le rendra » puis .dc (thème Discord, inchangé)
```

Le formulaire embed (titre, lien, couleur, vignette, image, texte au-dessus,
pied, boutons) devient une `.card.pad` entre la ligne des options et l'éditeur,
visible en mode Embed seulement.
