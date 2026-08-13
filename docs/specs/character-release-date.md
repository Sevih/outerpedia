# Dates de sortie des personnages — brief de travail

> Prompt préparé le 13/08/2026 pour la session du 14/08. Tout ce qui suit a été
> MESURÉ sur la donnée réelle du repo (archive patch-notes + tables du jeu) —
> ce sont des constats, pas des hypothèses. Ne les re-mesure pas, vérifie-les
> quand ça te coûte une commande, et attaque directement.

## Ce qu'on veut

Une date de sortie par personnage, pour **trier `/characters`** et **l'afficher
sur la fiche perso**. Contrat minimal, rien de plus :

```json
{ "2000129": "2026-08-12" }
```

Clé = id perso, valeur = `YYYY-MM-DD`. Le JOUR est demandé (pas le mois seul).

Décision d'arbitrage (Sevih, 13/08) : **on dégrossit d'abord par la convention
« New Hero {name} Drop Rate Up! »** des notes de mise à jour, on regarde ce que
ça donne, et on décide ensuite du reste. Ne commence pas par la curation à la
main.

## Les sources, et ce qu'elles valent (mesuré)

### 1. Archive des notes — `data/patch-notes/`

- `legacy-posts.json` : 806 posts Smilegate, EN, **2023-02-01 → 2025-09-22**.
- `posts.json` : 959 posts M9 (en/jp/kr, 319 EN), **2025-10-02 → 2026-08-13**.
- Types utiles : `patchnotes` (64, ère Smilegate) et `update` (25, ère M9) —
  **89 notes de MAJ au total**, 2023-05-01 → aujourd'hui, sans trou.

**La convention qui porte le signal** (ère Smilegate, 60 notes la portent :
17 en 2023, 25 en 2024, 18 en 2025) :

```
1. New Hero Fran Drop Rate Up!
   # Name : Fran   # Element : Water   # Battle Type : Striker
   # Schedule : 05/07/25 (Wed) after the maintenance – 06/04/25 before the maintenance
```

⚠ **La date à retenir est celle de `# Schedule`, pas celle du post** : la note
est publiée LA VEILLE de la maintenance (« 6/7 (Wed) Update Notice » posté le
2023-06-06). Le `content` est du HTML avec des échappements markdown (`\#`,
`\-`) — dé-taguer puis normaliser les blancs avant de parser.

Ère M9 (depuis 10/2025) : le format a changé, prose numérotée, plus de bloc
`# Name:`. En revanche le **titre porte la date de maintenance exacte** :
`[Update] 2026/07/21(Tue) Patch Note`. « New Hero » apparaît dans 9 des 19
notes 2026. C'est une deuxième passe, pas la première.

### 2. Tables du jeu — `RecruitGroupTemplet`

`PickupID` + `StartDate` donne une première bannière pour **68 persos**. Utile
en appoint, mais ce n'est PAS une autorité :

- **15 lignes à `StartDate = 0`** — tout le pool `DEMIURGE`. Saeran (2000129),
  sorti le 12/08/2026, n'a **aucune ligne datée**.
- Des dates **antérieures au lancement global** : Laplace y est au 2023-04-05,
  alors que sa bannière ouvre le 19/04 (dates internes/KR).
- VAGames **purge les vieilles lignes** — c'est documenté et déjà contourné dans
  `data/curated/recruit-banners.json` (Regina : la table ne connaît que la rerun
  de 2025-07-01, sa release est de 2024-01-30).

Règle : n'accepte une date de table que si elle est **postérieure au
2023-04-19** et cohérente avec les notes.

### 3. Lancement global = **2023-04-19**

Établi par l'archive : événements de pré-registration jusqu'au 28/03,
« Laplace Recruitment Chance Increase (4/19 Update) » posté le 18/04,
« Celebrating OP's No.1 Ranking » le 20/04. Le roster de départ (~30 persos :
K, Vera, Snow, Iris, Lisha, Sofia, Alpha, Rhona, Eva, Idith, Dolly, Tanya,
Yuri, Bleu, Rico, Shu, Tio, Sigma, Parti…) prend cette date. **Sa sortie n'est
pas dans l'archive** : les Update Notice ne commencent qu'au 2023-05-01.

## Les pièges (tous constatés, ne retombe pas dedans)

1. **« Première mention du nom » ≠ sortie.** Tout le roster de lancement
   s'agglutine sur les notes du 02/05 et du 23/05/2023 — ce sont des mentions
   d'équilibrage. Cette méthode donne 95 persos et une bonne moitié de faux.
2. **Les posts d'événement sont en retard.** Sur les 49 persos que notes ET
   tables datent, 18 divergent, systématiquement **8 à 26 jours après** la date
   de table (les « Rate Up Screenshot Event » sortent en cours de bannière).
   N'utilise pas les titres `[Event] X Rate Up!` comme date.
3. **Les noms se collisionnent.** Les Core Fusion portent le nom de leur base
   (Snow/Snow, Lisha/Lisha, Eva ×2) : indissociables par le texte, ils devront
   être curés ou dérivés autrement. « Stella » matche à l'intérieur de
   « Demiurge Stella » → appariement EXCLUSIF, nom le plus long d'abord.
4. **Les blocs officiels citent des noms qui n'existent pas dans le roster** :
   « Holy Night's Blessing Dianne », « Gnosis Beth », « Demiurge Stella » — ce
   sont des libellés d'événement. Prévois une normalisation (retrait des
   préfixes de campagne) plutôt qu'un rejet silencieux.
5. **Un nom non résolu ne doit JAMAIS disparaître en silence** : logue-le. C'est
   le seul moyen de voir ce que la passe automatique n'a pas su faire.

## Marche à suivre

1. **Passe 1 — dégrossir.** Parse les 89 notes de MAJ, extrait les sections
   « New Hero {name} Drop Rate Up! » et leur bloc `# Name:` / `# Schedule:`.
   Sors un tableau `id → date` + la liste des noms non résolus. **Montre le
   résultat à Sevih avant d'aller plus loin** — c'est lui qui décide si on
   complète à la main ou si on ajoute une passe.
2. **Passe 2 (si demandé)** — ère M9 par le titre + section « New Hero », puis
   appoint par les tables (avec la règle du 19/04/2023), puis roster de
   lancement en constante.
3. **Reste** — `data/curated/character-release.json`, même philosophie que
   `recruit-banners.json` : le curé comble ce que la dérivation ne sait pas, et
   il est documenté par un `_doc` en tête.
4. **Garde-fou** — un test qui casse si un perso n'a de date d'aucune source.
   Sans ça le trou revient en silence au prochain patch (c'est exactement ce
   qui est arrivé aux bannières purgées).

## Intégration

- **Sortie** : un fichier généré à part, `data/generated/character-release.json`
  (`id → "YYYY-MM-DD"`), plutôt qu'un champ dans `characters.json` — ça évite de
  toucher le contrat de l'extracteur et le flux d'intégration de l'admin.
  Émission dans `datagen/build.ts` comme les autres générateurs.
- **Consommation** : tri sur `src/app/[lang]/characters/page.tsx` (qui trie
  aujourd'hui par nom, l. 265) et affichage dans le bloc `meta` de la fiche
  (`src/app/[lang]/characters/[slug]/page.tsx`, l. ~180, à côté de `birthday`)
  — clé de locale à ajouter, `page.character.release` par convention.
- L'archive des notes est **committée** dans le repo : la génération ne dépend
  pas d'un scrape en ligne, elle est reproductible.

## Contraintes de session (rappel)

- Réponses en **français**, commentaires de code en français.
- On fait **BIEN**, pas vite : lire la donnée réelle avant de proposer un modèle.
- **Commits par chemins EXPLICITES** — jamais `git add -A` : un autre worker
  partage le checkout (le 13/08 un commit concurrent a avalé des fichiers déjà
  stagés).
- **Jamais de push** sans ordre explicite.
- `DONE.md` mis à jour dans le MÊME commit que le travail.
- **pnpm** uniquement.
