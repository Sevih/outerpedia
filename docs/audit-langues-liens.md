# Audit — les six langues et les liens internes (2026-10-09)

Constat, sans correction ni traduction : ce que le test de parité des clés
(`src/i18n/locales/keys.test.ts`) ne voit pas. Tous les chiffres viennent du
site **construit et servi**, pas d'une lecture du code.

## Méthode

1. `pnpm build` sur `main` (`1d55c84`), profil par défaut de `src/lib/site.ts`
   (origine `localhost:3000`, routage des langues **par chemin**), puis
   `next start`.
2. Un robot (cheerio) part de la sitemap et de l'accueil des six langues, et
   suit chaque `<a href>` interne du HTML servi. Un lien sans préfixe hérite de
   la langue de la page (c'est ce que fait le cookie `lang` en mode chemin).
   Chaque chemin de la sitemap est aussi demandé dans les six langues.
3. Un navigateur (Playwright) recharge 18 pages × 6 langues après hydratation,
   et clique les 5 onglets de `/equipment` dans chaque langue.
4. Texte non traduit : dans le `<main>` de chaque page d'une langue, les nœuds
   de texte identiques à un nœud de la même page anglaise (au moins deux mots
   latins en jp/kr/zh, trois en fr/es ; plus une passe mot seul en jp/kr/zh).
   Chaque chaîne est ensuite comparée aux tables de texte du jeu
   (`outerpedia-gamedata/parsed/Text*.json`, 152 268 libellés anglais) : si la
   colonne de la langue y est elle-même identique à l'anglais, le défaut est
   **côté jeu**, pas côté site.
5. Contenu absent : pour chaque chemin, nombre de titres `h1–h3` et de nœuds de
   texte de chaque langue comparé à l'anglais ; et lecture des `LocalizedText`
   de `data/curated/` et des guides (`_contents/**/*.json` et `*.ts`).

Les scripts (robot, comparaisons) sont restés hors dépôt.

## Résumé

| Contrôle                                  | Résultat                                                       |
| ----------------------------------------- | -------------------------------------------------------------- |
| Pages servies                             | 9 366 = 1 561 × 6 langues, **toutes en 200**                   |
| Liens internes (`href`) relevés           | 1 455 060, **aucun vers une page en erreur ou en redirection** |
| Ancres `#…` internes                      | 119 208 ; **2 cibles absentes** (§ 1.1, § 1.2)                 |
| Pages sans lien dans le HTML servi        | 39 par langue, atteintes après clic d'onglet (§ 1.3)           |
| `<html lang>`                             | **faux en japonais et en coréen** sur 3 044 pages (§ 2)        |
| Placeholders de jeu bruts                 | **105 pages × 6 langues** (§ 3)                                |
| Texte anglais d'origine site              | 9 sources (§ 4)                                                |
| Contenu présent dans une langue seulement | 1 cas (§ 4.5) ; toutes les pages existent dans les six langues |

## 1. Liens internes

### 1.1 Les six liens « Outils » du pied de page visent des ancres qui n'existent pas

`src/components/layout/Footer.tsx:70` construit `/tools#${slug}` pour
`most-used-units`, `tierlistpve`, `tierlistpvp`, `ee-priority-base`,
`ee-priority-plus10` et `gear-usage-statistics`. La page `/tools` ne porte
aucun de ces `id` (seuls `ld-site`, `portal-root`, `_R_`) : le clic ouvre le
haut de `/tools`, pas l'outil. Les outils vivent à `/<slug>` (pages en 200,
présentes dans la sitemap). Concerne chaque page, dans les six langues :
18 732 occurrences par ancre sur les 9 366 pages (le pied de page porte le
lien deux fois).

### 1.2 Une entrée du changelog vise `/event#20260324-video`

`data/curated/changelog.json:1127` : `"href": "/event#20260324-video"`. La page
`/event` n'a pas cet `id` ; l'événement est à `/event/20260324-video` (200).
Visible sur `/changelog` dans les six langues.

### 1.3 39 fiches d'équipement par langue ne sont liées qu'après JavaScript

`/equipment` ne rend dans son HTML que l'onglet « Armes » (64 liens). Les
talismans, sets et EE des autres onglets n'apparaissent qu'après un clic : 39
fiches par langue ne sont atteintes, dans le HTML servi, que par la sitemap.
Vérifié au navigateur : les 5 onglets × 6 langues donnent 289 fiches
distinctes, 1 734 liens, **0 erreur**. Ce n'est pas un lien cassé ; c'est à
connaître pour un robot qui n'exécute pas le JavaScript.

## 2. `<html lang>` porte le code du site, pas le code de langue

`src/app/root-document.tsx:61` écrit `lang={lang}` : le code interne (`jp`,
`kr`), alors que `LANGUAGES[lang].htmlLang` (`src/lib/i18n/config.ts`) vaut
`ja` et `ko`. Résultat servi : `<html lang="jp">` sur les 1 522 pages
japonaises et `<html lang="kr">` sur les 1 522 coréennes (`kr` est le code
ISO du kanouri). `zh`, `fr`, `es` et `en` coïncident par chance. Les
`hreflang` du `<head>` et de la sitemap sont, eux, corrects (`ja`, `ko`).
Effets attendus (non mesurés) : lecteurs d'écran, traduction du navigateur, et
choix des glyphes Han, que le navigateur prend japonais ou chinois selon
`lang`.

## 3. Placeholders `[buff_…]` affichés tels quels (toutes langues)

Sur 105 pages par langue (guides `skyward-tower`, 372 occurrences par langue,
anglais compris) on lit par exemple « a `[buff_c_tower_element_52151_1]`
chance to increase… ». Les valeurs sont pourtant dans la donnée :
`data/generated/monster-skills.json` porte
`"vars": {"tower_element_52151_1": {"c": "50%", …}}`. Cause : le jeu écrit ces
placeholders en minuscules (`[buff_c_…]`, vu dans `parsed/TextSkill.json`, le
buff `tower_element_52151_1` existe dans `BuffTemplet`), et
`resolveSkillText` (`src/lib/skills.ts:70`) ne reconnaît que
`/\[Buff_([CVT])_(.+?)\]/`, sensible à la casse. La même expression figure dans
`datagen/lib/buff.ts:225`, `datagen/generators/skills.ts:228` et
`datagen/damage/skill-descs.ts:71` ; leur effet sur ces buffs n'est pas
vérifié.

## 4. Texte resté en anglais, d'origine site

Classé par portée. Chaque cas a été vu dans les pages servies.

### 4.1 Le type d'équipement est le slug brut

`src/components/equipment/EquipmentDetail.tsx:390` affiche `{model.kind}`
(`weapon`, `amulet`, `talisman`, `set`, `ee`) dans l'en-tête de chaque fiche :
les 289 fiches (129 `ee`, 64 `weapon`, 60 `amulet`, 21 `set`, 15 `talisman`)
montrent « WEAPON », « EE »… dans les six langues (en anglais aussi,
c'est le slug et non le libellé « Accessory »). Les libellés traduits existent
déjà : `page.equipment.kind.*` dans les six locales.

### 4.2 Le texte d'accessibilité des étoiles des cartes d'équipe

`CharacterCard` (`src/components/character/CharacterCard.tsx:161`) a pour
défaut `'{rarity} star rarity'`. `TeamSlots` (`src/components/guides/TeamSlots.tsx:86`)
ne passe pas `starAriaLabel` : « 3 star rarity » est lu (texte `sr-only`) sur
30 pages de guides par langue. La clé `aria.star_rarity` existe dans les six
locales ; `TierListBrowser`, `CharactersBrowser` et `CurrentBanners` passent
le libellé traduit.

### 4.3 Locales : valeurs identiques à l'anglais

Sur 1 221 clés, 214 ont au moins une langue identique à l'anglais (jp 29,
kr 30, zh 17, fr 202, es 46). En jp/kr/zh, hors sigles et marques, il reste
`equip.detail.minmax` (« min → max », 112 fiches par langue ; traduit en
espagnol « mín → máx »). En français, la plupart des 202 sont des mots qui
s'écrivent pareil ou le vocabulaire de joueur du site (« Guides », « Source »,
« Talisman », « Tier List ») : rien n'y a été trié, faute de règle écrite sur
ce qui doit rester en anglais.

### 4.4 Une note du guide des stats en anglais en jp/kr/zh

`src/app/[lang]/guides/_contents/general-guides/stats/labels.ts:572` :
`cdmgred_note` a `jp`, `kr`, `zh` vides. `index.tsx:279` teste
`L(LABELS.cdmgred_note) &&` pour masquer une note absente, mais `L` replie sur
l'anglais : « **Note:** CDMG RED has no effect on non-crit hits. » s'affiche
sur `/jp|kr|zh/guides/general-guides/stats`.

### 4.5 La ligne « Colección … » disparaît en espagnol

`/es/guides/irregular-extermination` : les quatre cartes perdent leur ligne de
collection (« Collection Briareos », « ブリアレオスコレクション »… dans les
cinq autres langues). `collectionName`
(`src/components/guides/category-views/IrregularChaseMap.tsx:60`) cherche le
**préfixe** commun des noms d'équipement ; en espagnol le nom propre est à la
fin (« Vanidad Gorgona [Mago]… »), le préfixe commun est vide et la ligne est
masquée. C'est le seul écart de structure trouvé entre langues sur les 1 561
chemins.

### 4.6 Caractères coréens dans un texte chinois

`src/app/[lang]/guides/_contents/special-request/tyrant/recommended.json:26` :
`"zh": "{C/Healer}选택지。"` — « 택지 » est du hangul. Rendu sur
`/zh/guides/special-request/tyrant`. Seul cas trouvé en cherchant les
écritures étrangères à chaque langue (kana en coréen, hangul en japonais,
kana ou hangul en chinois), hors noms de contributeurs et titres de vidéos.

### 4.7 Les noms des pistes de l'OST

`datagen/generators/bgm-mapping.ts:173` ne garde que `name_jp` : 19 pistes sur
93 ont un nom japonais, les autres langues lisent l'anglais. D'après les tables
du jeu (correspondance par libellé anglais), le jeu fournit un nom français
pour 57 pistes, espagnol pour 54, coréen et chinois pour 9 (ex. « Battle - Raid
Boss » → « Combat - Boss de raid », « Batalla - Jefe de Incursión »).

### 4.8 Données curées

- `data/curated/gear-reco.json` : les noms de build (`name`, contrat `string`
  « affiché tel quel », `datagen/curated/gear-reco.ts:37`) sont en anglais
  dans toutes les langues — 268 builds, 100 libellés distincts (« Speed »,
  « Critical Strike », « Swift Immu »…), en onglets sur les fiches de
  96 personnages. Les notes : 87 sur 91 n'ont ni `jp`, ni `kr`, ni `zh`
  (repli anglais, ex. « Try to add some attack if you play her in a dual
  attack team… » sur `/jp/characters/gnosis-beth`).
- `data/curated/changelog.json` : 40 textes dont le français est identique à
  l'anglais, 8 pour l'espagnol ; dont des noms que le jeu traduit (« Deep Sea
  Guardian », « Walking Fortress Vault Venion », « Planet Purification Unit »
  sur `/es/changelog`).
- `data/curated/characters.json` : des textes traduits gardent des noms de
  personnage en anglais (« Demiurge Asteiがスキル3を使用後に… » sur
  `/jp/characters/demiurge-astei`). Non compté.

### 4.9 Titres identiques dans les `meta.json` des guides

17 titres français identiques à l'anglais (`adventure/*`,
`adventure-license/*`, `irregular-extermination/pursuit-blockbuster`…),
6 espagnols (`world-boss/*`, `dimensional-singularity/vi-e-11-a`). La plupart
sont des noms de boss ou de stage que le jeu laisse en anglais ; non trié un
par un.

## 5. Anglais voulu (pas des défauts)

- **Sigles de stats** (`ATK%`, `DMG UP%`, `CDMG RED%`…) : convention du wiki,
  `src/lib/stats.ts` (en-tête : « le jeu n'a AUCUNE abréviation »).
- **Noms courts** (`D.Lambda`, `CF Lisha`, `MS.Ame`…) : abréviation anglaise
  pour toutes les langues, décision du 2026-09-23 notée dans
  `src/lib/data/short-names.ts`.
- **Patch notes** en zh, fr, es : pas de posts dans ces langues, repli anglais
  annoncé par un bandeau (`tools/_contents/patch-history/index.tsx:30`). Le
  commentaire de `PatchHistoryBrowser.tsx:86` cite « zh, fr » et oublie `es`.
- Noms de doubleurs, de contributeurs, titres de vidéos, codes promo.

## 6. Côté jeu

Une grande part du texte anglais vu en français vient du jeu lui-même : sur les
nœuds de trois mots ou plus identiques à l'anglais, 810 occurrences françaises
correspondent à un libellé dont la colonne `French` du jeu **est** l'anglais
(noms de skills, d'équipements : `SKILL_NAME_2000001_Skill01` « Shield Rush »
en français ; « Burst Level 2 Unlocked » dans `TextSkill`). Les descriptions
françaises et espagnoles du jeu citent aussi les noms de skills en anglais.
Deux défauts du jeu passent tels quels :

- apostrophe devenue `Ï` (« Doll GardenÏs Caretaker », 7 occurrences dans
  `data/generated/`) ;
- traductions automatiques (« Sanctuary durant All » pour « Sanctuary for
  All »).

Le site ne peut rien y faire, sauf surcharge curée.

## 7. Test ajouté

`src/i18n/locales/keys.test.ts`, troisième garde : en jp, kr et zh, aucune
valeur contenant du texte latin ne doit être identique à l'anglais, hors deux
listes tenues exactes (`IDENTICAL_OK` : sigles, marques, URL ; `TO_TRANSLATE` :
`equip.detail.minmax`). Une traduction qui sort de la liste oblige à mettre la
liste à jour. Vérifié : le test passe, et échoue si l'on remet
`'nav.characters': 'Characters'` dans `jp.ts`.

Non ajoutés, parce qu'ils échoueraient aujourd'hui et demandent d'abord une
correction : `<html lang>` (§ 2), ancres (§ 1.1, § 1.2), placeholders (§ 3).
Non ajouté non plus : une garde sur les `LocalizedText` incomplets des données
curées — le repli anglais y est voulu (`src/lib/i18n/localize.ts`) et la garde
bloquerait `pnpm commit` dès qu'une note anglaise seule est saisie.

## 8. Non vérifié

- **Le routage par sous-domaine de la prod** : le build audité est en mode
  chemin. Les liens internes sont sans préfixe par construction, la langue
  vient du sous-domaine en prod ; ce mécanisme n'a pas été parcouru.
- Les variantes `?query` des pages (le robot les retire) et les liens qui
  n'apparaissent qu'après une interaction ailleurs que sur les onglets de
  `/equipment`.
- Les images (`NEXT_PUBLIC_IMG_BASE` vide en local, assets absents du
  conteneur).
- Les mots isolés restés en anglais en français et en espagnol : trop de mots
  s'écrivent pareil pour un relevé automatique fiable.
