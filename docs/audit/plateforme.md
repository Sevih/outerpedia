# Audit — socle public (constats S1–S9)

> Fait le **2026-08-28**. Cinquième volet, sur le **périmètre jamais audité** :
> ce qui sert le site aux visiteurs. Les quatre rapports existants couvrent
> l'extraction ([extraction.md](./extraction.md), E1–E8), l'admin
> ([admin.md](./admin.md), F1–F9), le moteur de revue
> ([extractor.md](./extractor.md), X1–X6) et le calculateur
> ([damage-calculator.md](./damage-calculator.md), D1–D5). Aucun recouvrement :
> rien ici ne re-signale un constat de ces quatre-là.
>
> **Ce volet couvre** : routes API publiques (`src/app/api/` hors admin),
> limitation de débit, accès MySQL et socle de partage, couche d'accès aux
> données (`src/lib/data/disk.ts` et le contrat de cache), i18n, configuration
> de build et CSP (`next.config.ts`), et des balayages transverses sur tout
> `src/` + `datagen/`.
>
> **Ajouté en 2e passe** : balayages de classes de bugs React sur tout `src/`
> (effets sans nettoyage, clés de liste, codec de partage) et déterminisme des
> générateurs.
>
> **Ce volet NE couvre PAS** (dette froide, à traiter séparément) : l'intérieur
> des trois gros composants client (`HeroTrackerBrowser`, `TierListMakerBrowser`,
> `ProgressTrackerBrowser` — déjà au TODO, réservés Sevih) et le détail des
> générateurs `datagen/generators/`.

## Verdict

**Le socle est sain.** Sur 1 070 fichiers TypeScript : **zéro `any`**, zéro
`@ts-ignore`, zéro `console.log` dans `src/`, quatre `eslint-disable` tous
motivés en commentaire. Contrôles au moment de l'audit : `tsc` (3 projets) vert,
`eslint` **0**, **1 879 tests** passants sur 155 fichiers, `prettier --check`
vert. Les entrées utilisateur sont validées, le SQL est paramétré partout, et
les décisions coûteuses (connexion par requête, `<img>` brut, CSP sans nonce)
sont documentées avec leur raison — plusieurs « anomalies » apparentes se sont
révélées être des arbitrages écrits.

**Le seul constat qui appelle une action rapide est S1** : la limitation de
débit des deux routes d'écriture publiques repose sur un en-tête que le client
contrôle.

---

## S1 — Limitation de débit contournable, et Map non bornée · **Haute** · sécurité

`clientIp()` ([`src/lib/rate-limit.ts:26`](../../src/lib/rate-limit.ts)) prend la
**première** valeur de `x-forwarded-for`. Or ni Cloudflare ni Caddy ne
_remplacent_ cet en-tête : ils **ajoutent** l'IP du pair à la valeur reçue. La
première valeur est donc celle que le client a écrite lui-même.

Trois faits qui rendent ce chemin réellement atteignable, vérifiés dans
`sevih-tool/stack/Caddyfile` :

- l'origine répond **en direct sur son IP** (bloc `http://213.32.67.18`) ;
- `zh.outerpedia.com` est en **nuage gris** — ses visiteurs atteignent Caddy
  sans passer par Cloudflare. **C'est VOULU** (Cloudflare est inutilisable
  depuis la Chine, cf. le bloc `zh` du `Caddyfile` et `docs/nuage-orange.md`) :
  ce n'est pas un défaut à corriger, mais la contrainte qui **décide** de la
  forme du correctif — c'est elle qui interdit la solution évidente
  (« `cf-connecting-ip` et rien d'autre »), cf. le tableau plus bas ;
- aucun `trusted_proxies` ni réécriture de `X-Forwarded-For` côté Caddy.

**Conséquences.** (1) Le quota des deux seules routes d'écriture publiques —
`/api/tierlist` ([`route.ts:17`](../../src/app/api/tierlist/route.ts)) et
`/api/shortlink` ([`route.ts:17`](../../src/app/api/shortlink/route.ts)) — se
contourne en faisant tourner l'en-tête. (2) Pire, la Map du limiteur
(`rate-limit.ts:9`) grandit **sans borne** : son nettoyage (`:13`) ne supprime
que les entrées **expirées**, et des IP forgées fraîches ne le sont jamais. Un
flot d'en-têtes distincts fait donc grossir la mémoire du process indéfiniment,
le nettoyage tournant à vide à chaque appel.

**Le piège : aucune règle côté app ne marche pour les DEUX chemins.** Les deux
topologies (voulues toutes les deux) donnent des chaînes différentes :

| Hôte                        | Chaîne              | Dernier XFF         | `CF-Connecting-IP` |
| --------------------------- | ------------------- | ------------------- | ------------------ |
| apex, `jp`/`kr`/`fr`, `www` | client → CF → Caddy | **IP d'edge CF** ❌ | vrai client ✅     |
| `zh` (nuage gris), test IP  | client → Caddy      | vrai client ✅      | **forgeable** ❌   |

Prendre le dernier XFF mettrait tout le trafic proxifié derrière **une seule**
IP d'edge Cloudflare (un quota commun à tous les visiteurs). Faire confiance à
`CF-Connecting-IP` rouvrirait la faille sur `zh`, où aucun Cloudflare ne le
réécrit — un client peut l'inventer. **Les deux règles sont justes chacune de
son côté et fausses de l'autre.**

**Correctif** — trois gestes, dont un dans l'autre dépôt :

1. **`sevih-tool/stack/Caddyfile`** — c'est le seul point qui connaît la vérité
   pour SON cas : faire poser par Caddy un en-tête maison (`X-Real-Client-IP`),
   en **écrasement** (jamais en ajout), avec par bloc d'hôte :
   - blocs proxifiés → la valeur de `CF-Connecting-IP` ;
   - bloc `zh` et bloc de test IP → l'IP du pair (`{http.request.remote.host}`).

   Écrasé par Caddy, l'en-tête n'est plus falsifiable, quel que soit le chemin.
   (Syntaxe `header_up` à confirmer à l'application — non testée ici.)

2. **`src/lib/rate-limit.ts`** — `clientIp` ne lit plus que cet en-tête, avec un
   repli explicite (`'unknown'`) plutôt que `x-forwarded-for`. Tant que le geste 1
   n'est pas déployé, la route dégrade en quota global : bruyant, mais pas
   contournable en silence.

3. **`src/lib/rate-limit.ts`** — borner la Map (purge du plus ancien au-delà
   d'un plafond, pas seulement des expirés). Indépendant des deux autres, et
   c'est lui qui ferme la croissance mémoire.

> Les gestes 1 et 2 vont ensemble et **traversent deux dépôts** : déployer le 2
> seul couperait la finesse du quota, déployer le 1 seul ne sert à rien. Le 3
> peut partir tout de suite.

> Aggravant : `rate-limit.ts` n'a **aucun test** alors qu'il est le seul rempart
> des deux routes d'écriture. Un test de fenêtre + un test de borne verrouillent
> le correctif.

## S2 — Le React Compiler est supposé, il n'est pas activé · **Moyenne** · perf / doc

Deux commentaires justifient l'absence de `useMemo` par le compilateur :

- [`DamageCalculatorBrowser.tsx:304`](../../src/app/[lang]/tools/_contents/damage-calculator/DamageCalculatorBrowser.tsx)
  — « Pas de useMemo : le React Compiler mémoïse seul » ;
- même fichier `:621` — « Pas de useMemo : le React Compiler mémoïse seul ».

Or **il n'est activé nulle part** : pas de `reactCompiler` dans `next.config.ts`,
et `babel-plugin-react-compiler` n'est ni dans `package.json` ni installé.

La prémisse est fausse deux fois. Même activé, le compilateur mémoïse des
valeurs de rendu — pas le **résultat d'un appel** comme `savedCalcs()` (`:761`),
qui rejoue décompression LZ + `JSON.parse` + `buildDamageReport` pour chaque
scénario sauvegardé.

**Impact réel : faible** — l'appel lourd est gaté par `devMode` (`:760`), donc
inerte pour un visiteur. **Le risque est la prémisse** : elle invite à retirer
d'autres mémoïsations ailleurs au nom d'un mécanisme absent.

**Correctif** : trancher, puis aligner. Soit activer le compilateur (et le
mesurer), soit corriger les deux commentaires pour dire ce qui tient vraiment
(« calcul court, mémoïsation non rentable » / « gaté par devMode »).

## S3 — `/api/search` reconstruit son index à chaque requête · **Moyenne** · perf

`buildSearchIndex` ([`src/lib/search-index.ts:97`](../../src/lib/search-index.ts))
parcourt pages + personnages + guides à **chaque appel**, sans mémoïsation. La
route ([`src/app/api/search/route.ts:13`](../../src/app/api/search/route.ts))
n'a pas de quota et s'en remet au cache CDN (`s-maxage=86400`).

Ça tient pour les hôtes proxifiés. **Pas pour `zh`** : nuage gris (voulu), aucun cache
Cloudflare devant — chaque ouverture de la palette Ctrl+K reconstruit l'index
sur l'origine.

**Correctif** : mémoïser par langue (les données sont statiques au build ; une
Map `lang → index` suffit, même régime que le cache de `disk.ts`).

## S4 — `next.config.ts` : le seul fichier hors convention · **Basse** · convention

Le repo est à **zéro** « V2 »/« V3 » dans les commentaires (purge du 15/08) et
en commentaires français partout… sauf ce fichier :

- `:24` « Security headers (ported from V2 — proven config) » — anglais **et**
  « V2 », qui ne désigne pas le dépôt mais l'ancien site ;
- `:146` « Slugs de guides RENOMMÉS en V2 » — même cas ;
- `:108` « Images served from a CDN (Cloudflare R2) — revisited in Phase 3 » —
  anglais, et « Phase 3 » ne renvoie plus à rien de consultable ;
- `:4` « Version from package.json — single source of truth » — anglais.

Un cinquième point, **périmé** plutôt que hors convention : le commentaire de
`media-src` parle du « `https:` large d'img-src », or `img-src` est devenu une
liste blanche explicite — la parenthèse décrit un état qui n'existe plus.

**Correctif** : réécrire ces cinq commentaires (« l'ancien site », « config
éprouvée », etc.).

## S5 — 11 exports morts, 44 sur-exportés · **Basse** · dette

Balayage sur `src/lib`, `src/components`, `src/hooks`, `datagen/lib`,
`datagen/generators` (hors tests et `.dev.*`), exports de **valeurs**
uniquement.

**Vraiment morts** (définis, référencés nulle part, pas même dans leur fichier) :

| Fichier                                                        | Export                     |
| -------------------------------------------------------------- | -------------------------- |
| `src/components/admin/PlaceholderPage.tsx`                     | `PlaceholderPage`          |
| `src/components/admin/premium-limited/PremiumLimitedParts.tsx` | `normalizeBundle`          |
| `src/components/events/presentation.ts`                        | `eventStatusKey`           |
| `src/components/events/presentation.ts`                        | `eventTypeKey`             |
| `src/lib/admin/repin-guides.ts`                                | `showValue`                |
| `src/lib/damage/formula.ts`                                    | `checkProbabilityPercent`  |
| `src/lib/damage/formula.ts`                                    | `checkProbabilityPermille` |
| `src/lib/damage/recovery.ts`                                   | `calcWgBuffDamage`         |
| `src/lib/data/characters.ts`                                   | `resolveSlug`              |
| `src/lib/data/effects.ts`                                      | `effectForLabel`           |
| `src/lib/data/item-catalog.ts`                                 | `catalogIdByName`          |

> **Deux ne sont PAS à supprimer** : `checkProbabilityPercent` / `Permille`
> reflètent volontairement la surface du binaire du jeu (même intention que le
> `void max` de `checkProbability`). Les garder, éventuellement le dire dans
> leur en-tête.

**Sur-exportés** (44) : utilisés seulement dans leur propre fichier — passer en
non-exporté réduit la surface publique sans rien casser. Les plus nets :
`loadEvents` / `getEvent` / `isTeased` (`src/lib/data/events.ts`),
`getRewardTable` (`rewards.ts`), `loadTagGlossary` (`tags.ts`),
`SITE_ORIGIN` (`src/lib/site.ts`), `FX_CATALOG` et `applyMaxHpRate`
(`src/lib/damage/inputs.ts`).

## S6 — `loadDataJson` rend l'objet caché (risque latent) · **Basse** · robustesse

[`src/lib/data/disk.ts:33`](../../src/lib/data/disk.ts) renvoie **l'objet du
cache**, pas une copie : une mutation par n'importe quel appelant corromprait la
donnée pour tout le reste du process (un `.sort()` en place suffirait à changer
un ordre partout, jusqu'au prochain `mtime`).

**Aucun appelant ne mute aujourd'hui** — vérifié sur les 21 sites d'appel et sur
tous les `.sort()` de `src/lib/data/` : ils passent systématiquement par
`.map()`, `.filter()` ou `[...x]` avant de trier. Ce n'est donc **pas un bug
ouvert**, c'est un contrat non gardé.

**Correctif possible** (garde-fou, coût nul en prod) : `Object.freeze` récursif
sur la donnée mise en cache uniquement quand `NODE_ENV !== 'production'` — la
première mutation lèverait en dev au lieu de passer inaperçue.

## S7 — Les tables de partage n'ont pas de purge · **Basse** · ops

`createHashStore` crée les tables avec un `created_at`
([`src/lib/hash-store.ts:77`](../../src/lib/hash-store.ts)), mais **rien ne
l'utilise** : `tier_lists` et `short_links` grossissent indéfiniment. Sans
urgence (payloads ≤ 1 Ko, ids déterministes donc pas de doublon), mais la
colonne existe déjà pour ça — décider d'un TTL, ou dire dans l'en-tête que la
rétention est **volontairement** infinie et pourquoi.

## S8 — Le codec `?z=` est réécrit 7 fois, et il ne dégrade pas pareil · **Moyenne** · duplication

Le même aller-retour « état → JSON → LZString → paramètre `?z=` » est
réimplémenté à la main dans **7 sites de décodage**, répartis sur **5 outils
indépendants** :

| Fichier                                                 | Repli si `z` est corrompu |
| ------------------------------------------------------- | ------------------------- |
| `damage-calculator/DamageCalculatorBrowser.tsx:632`     | `\|\| 'null'`             |
| `damage-calculator/DebugHarness.tsx:206`                | `\|\| 'null'`             |
| `damage-calculator/use-scenario-state.ts:316` et `:341` | `\|\| 'null'`             |
| `src/lib/damage/replay.ts:37`                           | `\|\| 'null'`             |
| `team-planner/TeamPlannerBrowser.tsx:475`               | **`\|\| '{}'`**           |
| `src/components/character/filters/filter-codec.ts:546`  | test explicite → `null`   |

**Ce n'est pas qu'une redite : les répliques divergent.** Face au MÊME `z`
tronqué (lien copié de travers, URL coupée par un client de chat), six sites
concluent « pas d'état » et repartent sur les valeurs par défaut ; le
team-planner conclut « état vide » — il ouvre donc un plan **vide** au lieu de
signaler que le lien est illisible. La différence tient au seul littéral de
repli, invisible en relecture.

La lecture du paramètre est dupliquée en parallèle (`params.get('z')` dans
`use-scenario-state.ts:311`, `TeamPlannerBrowser.tsx:472`,
`TierListMakerBrowser.tsx:736`, plus `CharactersBrowser.tsx:179` qui passe par
`decodeFilters`).

> À NE PAS fusionner avec : le codec de la tier-list
> (`tier-list-maker/share-codec.ts`), qui est un empaquetage binaire sur mesure
> (rang de sélection, `ceil(log2(restants))` bits) documenté en tête de fichier
> — un format de fil figé, pas une redite de LZString.

**Correctif** : un module `src/lib/z-codec.ts` exposant la paire
`encodeZ(state)` / `decodeZ(z): T | null` — une seule convention de repli
(`null` = illisible ou absent, choix majoritaire), un seul endroit où la
changer, et les 7 sites qui s'y branchent. `filter-codec.ts` en devient le
consommateur type : il fait déjà exactement ça, correctement.

## S9 — Points vérifiés sains (ne pas « corriger »)

Consignés pour éviter qu'un audit externe ou une passe future ne les rouvre :

- **i18n** : 1 169 clés **identiques** dans les 5 langues, verrouillées par
  `src/i18n/locales/keys.test.ts` — qui vérifie en plus que chaque clé EN a un
  consommateur, y compris via préfixe dynamique. Les listes de langues en dur
  restantes (`patch-history/index.tsx:38`, écrans admin) sont **documentées** et
  motivées ; la source unique `LANGUAGES` est respectée là où elle doit l'être.
- **`calcFinalStat` défini deux fois** (`damage/formula.ts:101` et
  `stat-compose.ts:135`) : ce n'est **pas** une duplication — le second
  **délègue** au premier, avec `Math.trunc` en garde-fou. Adaptateur documenté.
- **`getMonster(floor)`** (`guides/[category]/[slug]/[floor]/page.tsx:41`) :
  le segment d'URL est validé entier **avant** l'appel, aux deux endroits
  (`generateMetadata` et la page). Pas de traversée possible vers
  `monster-archive/`.
- **Routes publiques** : SQL paramétré, payloads bornés et typés, 503 propre
  sans BDD, `conn.end()` en `finally`. La connexion par requête (plutôt qu'un
  pool) est un arbitrage écrit dans `src/lib/db.ts`, pas un oubli.
- **`roadmap-2026` / `roadmap-2026-h2`** : `MonthlyUpdate` et
  `NewCharacterData` portent le même nom dans les deux, mais **pas la même
  forme** (`balance` vs `story`, `pve`/`pvp` vs `date`, élément/classe devenus
  optionnels). Factoriser coupleraient deux jeux éditoriaux qui divergent à
  dessein — à laisser.

---

## Backlog

**P1 — à faire**

- **S1** — source d'IP fiable : en-tête posé par Caddy (`sevih-tool`) + lecture
  côté app + borne de la Map + les deux tests qui manquent. **Deux dépôts** ; la
  borne de la Map, elle, part seule.

**P2 — petits, gain net**

- **S3** — mémoïser `buildSearchIndex` par langue (compte surtout pour `zh`).
- **S8** — module `z-codec` commun (7 sites, 3 conventions de repli divergentes).
- **S2** — trancher React Compiler : l'activer, ou corriger les deux
  commentaires qui l'invoquent.

**P3 — au fil de l'eau**

- **S4** — les cinq commentaires de `next.config.ts`.
- **S5** — retirer les 9 exports morts (garder les 2 du binaire), dé-exporter
  tout ou partie des 44.
- **S6** — `Object.freeze` en dev sur le cache de `disk.ts`.
- **S7** — trancher la rétention des tables de partage.

## Note de méthode

Constats mesurés de première main : comptages sur l'arbre réel (1 070 fichiers
`.ts`/`.tsx`, 155 fichiers de tests, 1 169 clés × 5 langues), exécution réelle
de `tsc` / `eslint` / `vitest` / `prettier`, lecture des fichiers cités, et
recoupement de la chaîne de proxy avec le `Caddyfile` de `sevih-tool` (S1, S3).
Le balayage d'exports morts (S5) vient d'un script d'analyse du corpus complet,
pas d'une impression : il distingue « jamais référencé nulle part » de « utilisé
seulement localement », et écarte les exports consommés par le framework
(`generateMetadata`, `revalidate`, handlers de route…).

Les zones exclues sont nommées en tête de document : elles n'ont pas été
survolées, elles n'ont pas été regardées.
