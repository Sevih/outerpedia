# Damage calculator — harnais de debug

> Cinquième volet : [damage-formula.md](./damage-formula.md) dit COMMENT le jeu
> calcule, [damage-data-mapping.md](./damage-data-mapping.md) OÙ vit la donnée,
> [damage-report-inputs.md](./damage-report-inputs.md) QUELLES entrées fabriquer,
> [damage-calculator-ui.md](./damage-calculator-ui.md) l'UI livrée. Ce document
> spécifie l'outillage de MISE AU POINT du moteur : comment on voit ce qu'il
> calcule, comment on le confronte au jeu réel, et comment on l'empêche de
> régresser. **Tout ici est du mode harnais** — actif d'office en build de dev,
> et en production sur opt-in `?dev=1` dans l'URL (avant `z` — décision Sevih
> 06/08/2026, flux beta testeurs : ils capturent des scénarios via `?dev=1`,
> envoient le JSON ⧉, Sevih les rejoue via le bouton « Importer »). Le gate est
> donc un ÉTAT runtime (`devMode`), plus un inline de build : le code du
> harnais fait partie du bundle de prod, mais ne se REND jamais sans opt-in.

## 1. Ce qui existe déjà (27/07/2026)

- **Carte « Debug »** sous les trois colonnes du calculateur
  (`DamageCalculatorBrowser.tsx`) : dump JSON de `debugState` — l'état exact que
  le moteur consommera (attaquant, cible, contexte, équipe, quirks non nuls).
- **`debugState` est le CONTRAT d'entrée** : quand le moteur sera branché, sa
  fonction d'entrée prendra cet objet (ou un mappage 1:1). Toute évolution de
  l'UI qui change `debugState` change le contrat — la carte sert précisément à
  le voir.
- Le moteur pur existe déjà en bas de chaîne : `src/lib/damage/`
  (`formula.ts`, `recovery.ts`, `item.ts` + tests vitest). Il prend des entrées
  déjà fabriquées ; l'amont (build → entrées) reste à écrire
  (cf. damage-report-inputs § 6).

## 2. Trace de calcul (à construire avec le branchement)

> RÉALISÉ côté MOTEUR (04/08/2026, design validé par Sevih) : paramètre
> optionnel `trace?: TraceStep[]` sur `calcDamageCore` (§ 8.2, une étape par
> troncature exécutée), `checkDamageRate` (§ 7 : taux de base de la branche,
> modificateurs additifs, plancher quand il agit) et `sheetToCombatStat`
> (§ 16.1) ; `buildSkillReport(skill, scenario, { trace: true })` produit
> `BranchLine.trace` (préambule § 10.1/§ 6/§ 9.2/§ 9.3, § 9.1 par branche,
> § 7, § 8.2 du TOTAL, § 8.3 en dernière étape) et `SkillReport.wgTrace`
> (§ 11). Coût nul sans trace (`trace?.push`). Étape `unresolved` émise pour
> le swap § 10.1 sans lecteur de stat — jamais de valeur plausible. Tests :
> `src/lib/damage/trace.test.ts` (l'étape finale de chaque trace === la
> valeur retournée).
>
> RÉALISÉ côté PANNEAU (04/08/2026) : la carte Debug est BRANCHÉE. L'état
> `?z=` courant passe par le pont partagé `buildInputsFromZ`
> (`src/lib/damage/scenario.ts` — z décompressé → entrées de l'amont, la
> MÊME fonction que rejouera `fixtures.test.ts`) puis `buildDamageReport`
> (`{ trace: true }`). Rendu : accordéon par slot du rapport (S1/S2/S3,
> bursts en sous-lignes), dedans les états (chaînes) × branches à P > 0 —
> en-tête `branche · P · total` puis la trace `§ref · label · in → out`
> (valeurs brutes), la jauge § 11 (`wgTrace`) en pied. La reconstruction
> fiche → combat (§ 16.1) est affichée (`slug=saisi→combat`). Ce que le
> moteur v1 IGNORE est signalé en ambre, jamais tu : pans hors périmètre
> (`ignored` du pont : arme/accessoire/sets/talisman § 15, alliés,
> multi-cible ; + EE et quirks via le parent) et chips sans magnitude
> standard (`unresolvedFx`). Les tables damage (~11 Mo avec targets.json)
> sont importées en DYNAMIQUE par le PARENT à la première sélection
> d'attaquant — depuis le branchement du rapport PUBLIC (05/08/2026), le
> panneau les reçoit en props (`data`/`dataErr`), un seul chargement pour le
> rapport et le debug. Le Codex (réglage de compte, HORS z) est passé à part
> et capturé dans le champ `codex` du fixture — schéma § 3.

Le moteur retourne, EN PLUS des nombres, une **trace** — il ne faut jamais que
l'UI la reconstruise (elle mentirait au premier écart) :

```ts
interface TraceStep {
  /** Référence de spec — « § 8.2 », « § 9 », « § 16 »… cliquable vers damage-formula.md. */
  ref: string;
  /** Libellé court de l'étape (« facteur du skill », « couche DEF », « taux élémentaire »). */
  label: string;
  /** Opérandes d'entrée, nommés (atk: 12345, factor: 1.32…). */
  in: Record<string, number>;
  /** Valeur de sortie de l'étape. */
  out: number;
}
// Par skill × branche (normal / critique / esquivé) : TraceStep[] ordonné.
```

Rendu dans la carte Debug : un accordéon par skill, trois colonnes de branches,
chaque étape sur une ligne `ref · label · in → out`. Aucun arrondi d'affichage
qui masque un écart : valeurs brutes, l'arrondi ne vit que dans le RAPPORT.

Règles :

- La trace suit l'ordre RÉEL d'exécution du moteur (pas l'ordre de la spec).
- Une incertitude § 12 de la spec apparaît comme étape marquée `unresolved` —
  jamais silencieusement remplacée par une valeur plausible.

## 3. Table attendu / calculé / en jeu

Le juge de paix n'est pas la spec, c'est le JEU. Chaque scénario vérifié en jeu
devient un **fixture** — et il en faut **N, pas un témoin unique** (Sevih
03/08) : au câblage du moteur, c'est le CROISEMENT de plusieurs scénarios qui
met le doigt sur la cause d'un écart (un scénario sans équipement isole la
croissance, un avec crit isole la couche crit, etc.). On en capture autant que
nécessaire, elles s'accumulent dans le repo :

```ts
interface DamageFixture {
  /** Nom parlant : « Delta S3 crit vs WB Ragnakeus VH rank S ». */
  name: string;
  /** Le scénario COMPLET : la valeur `?z=` de l'URL du calculateur (lz-string). */
  z: string;
  /** Codex du COMPTE à la capture — HORS z (localStorage), mais il pèse dès
   *  qu'un buff est actif (§ 16.1). Absent = 0. */
  codex?: number;
  /** Niveau de GUILDE du compte — HORS z aussi ; son buff MAX_HP (§ 16.2)
   *  change le HP de combat dans les modes éligibles. Absent = 0. */
  guild?: number;
  /** Buff de titre « Premium Body » possédé (+5 % PV, § 16.2) — HORS z.
   *  Absent = non. */
  premium?: boolean;
  /** Version du jeu au moment de l'observation (« 1.4.9 »). */
  gameVersion: string;
  /** Observations en jeu : par slot × branche, dégâts constatés. La clé de
   *  slot est STABLE (pont `flattenReport`) : `S1`/`S2`/`S3`, burst en
   *  suffixe (`S2b1`), état non-base en `#chaîne` (`S2#nom`). */
  observed: { slot: string; branch: 'normal' | 'critical' | 'miss'; damage: number }[];
  /** Tolérance relative acceptée (défaut 0.5 % — arrondis d'affichage du jeu). */
  tolerance?: number;
  /** Référence d'incertitude § 12 dont le scénario dépend → test `skip`,
   *  table grise ; devient le test d'acceptation du jour où on tranche. */
  skipRef?: string;
  /** Contexte libre : ce qui était actif en jeu et difficile à encoder. */
  notes?: string;
}
```

- **Emplacement** : `src/lib/damage/fixtures/*.json` — dans le repo, versionnés,
  relus en PR comme du code. PAS de localStorage comme stockage de vérité (il ne
  survit ni au navigateur ni à l'équipe).
- **Capture** — REDESSINÉE (Sevih 05/08/2026, itérée 2× le même jour :
  « un scénario = UNE ligne de dégâts », la saisie vit dans la TABLE RÉSULTAT
  publique) :
  - **Table Résultat** (dev) : chaque colonne de branche porte une CHECKBOX
    (normal/critique/miss — miss cochée FORCE sa branche, le miss n'existe
    plus hors buff de « miss chance » ; décocher normal sert le crit forcé)
    et, sous chaque valeur calculée d'une branche cochée, une INPUT
    « en jeu » → Δ % immédiat (vert/rouge à ±0.5 %) et un bouton **`+`** qui
    SAUVEGARDE ce scénario : le `z` courant (tous les réglages UI y sont) +
    codex/guilde/titre + la ligne (clé `flattenReport`, état de base pour les
    multi-chaînes) + la valeur en jeu. Upsert par (z, slot, branche),
    localStorage `outerpedia:damage-calculator:debug-scenarios` (v2).
  - **Section « Scénarios »** (AU-DESSUS du panneau Debug) : table de
    comparaison `atk vs cible · en jeu · calculé · Δ %` — le calculé n'est
    JAMAIS stocké, il est REJOUÉ à l'affichage par le pont partagé (un moteur
    qui bouge se voit immédiatement ; Δ hors tolérance + `gameVersion`
    ancienne → badge « à revérifier en jeu »). Actions : **Charger**
    (re-remplit le calculateur ENTIER — reset + `applyZ`, la même fonction que
    l'hydratation `?z=` — + réglages de compte REPOSÉS, cellule observée
    pré-remplie, branche cochée), **⧉** (copie le `DamageFixture` équivalent —
    une ligne observée — à coller dans `fixtures/` et référencer dans
    `fixtures/index.ts` ; le localStorage reste un BROUILLON, le stockage de
    vérité est toujours le fichier committé), **✕** (supprime).
  - Le panneau Debug, lui, garde la trace, l'état fiche→combat, les passifs
    de boss et la table des fixtures COMMITTÉES.
- **Rendu** (fixtures committées) : table dans la carte Debug — une ligne par
  observation :
  `fixture · skill · branche · attendu (en jeu) · calculé · Δ %`, verte sous la
  tolérance, rouge au-dessus, grise si le scénario touche une incertitude § 12.

## 4. Anti-régression

> RÉALISÉ (04/08/2026) : `src/lib/damage/fixtures.test.ts` rejoue le registre
> `FIXTURES` (`src/lib/damage/fixtures/index.ts`) — décompression `z`, pont
> partagé `buildInputsFromZ` + `resolvePresetTarget`
> (`src/lib/damage/preset-target.ts`, node : MÊME `statAt` que le wrapper via
> `presetSpawnStats`, refactor à source unique ; PAS dans le barrel — lit au
> disque), amont pur, comparaison par (slot, branche) avec la tolérance du
> fixture. Le message d'échec oriente : `gameVersion` ≠ tables → « revérifier
> EN JEU d'abord » ; sinon → « régression moteur probable, comparer la
> trace ». `skipRef` → suite sautée. Le registre est VIDE au 04/08 : les
> premières fixtures restent à capturer en jeu (Sevih) — coller le JSON du
> bouton « Capturer » dans `fixtures/`, corriger `observed`, l'importer dans
> `fixtures/index.ts`.

Les fixtures ne servent pas qu'à l'œil : un test vitest les rejoue SANS UI.

- `src/lib/damage/fixtures.test.ts` : pour chaque fixture, décompresse `z`,
  fabrique les entrées via le même amont que l'UI (d'où l'exigence : l'amont
  est une fonction pure importable côté node, pas du code de composant),
  exécute le moteur, compare à `observed` avec `tolerance`.
- Le test échoue ⇒ soit le moteur a régressé, soit le JEU a changé
  (`gameVersion` du fixture ≠ version courante des tables) — le message d'échec
  doit dire lequel des deux vérifier en premier.
- Un fixture qui dépend d'une incertitude § 12 non tranchée est marqué
  `skip` avec la référence — il devient le test d'acceptation du jour où on
  tranche.

## 5. Décisions (statut au 03/08/2026)

| Question                                                          | Statut                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| i18n du harnais (règle repo : tout libellé passe par les locales) | ✅ Exemption actée et implémentée (27/07) : libellés du harnais en dur (le titre « Debug » de la carte reste localisé) ; maintenue le 06/08 avec l'opt-in `?dev=1` — le harnais est un outil de CONTRIBUTION, pas l'UI publique (le placeholder « pas encore supporté » de la table Résultat, lui, est public → locales)                                                                                                                  |
| Tolérance par défaut                                              | ✅ TRANCHÉE (Sevih 03/08) : 0.5 % relatif, surchargable par fixture. C'est un réglage de MISE AU POINT : l'objectif à terme est 0 — on resserre au fil de la validation, on ne s'installe pas dans l'écart                                                                                                                                                                                                                                |
| Les fixtures survivent-elles à un patch de jeu ?                  | ✅ TRANCHÉE (Sevih 03/08) : un patch n'invalide RIEN d'office — « pourquoi invalider si c'est toujours bon ? ». Le test anti-régression continue de rejouer TOUTES les fixtures contre les tables courantes : celle qui reste verte est toujours un témoin valide ; celle qui passe rouge avec un `gameVersion` ancien s'affiche « à revérifier en jeu » (badge), PAS « moteur cassé ». C'est le test lui-même qui départage, pas la date |

## 6. Prompt de session — design du harnais (à coller tel quel)

> **Mission.** Designer, puis implémenter après validation, le harnais de debug
> (DEV ONLY) du damage calculator d'Outerpedia — trace de calcul, table
> attendu/calculé/en jeu, anti-régression. La spec de référence est
> `docs/specs/damage-debug-harness.md` : lis-la EN PREMIER et en entier ; ce
> prompt n'en est que la porte d'entrée, en cas d'écart c'est la spec qui fait
> foi.
>
> **À lire ensuite, dans cet ordre.**
> `docs/specs/damage-formula.md` (le COMMENT — les § référencés par la trace),
> `docs/specs/damage-report-inputs.md` § 1–3 et § 6 (les entrées et l'amont à
> construire), `src/lib/damage/` (le moteur pur existant et ses tests),
> `src/app/[lang]/tools/_contents/damage-calculator/DamageCalculatorBrowser.tsx`
> (cherche `debugState` — le contrat d'entrée — et la carte Debug existante).
>
> **Phase 1 — DESIGN (livrable, pas de code).** Propose et fais valider :
> (a) l'API définitive de la trace (`TraceStep`, spec § 2) et son point
> d'accrochage DANS le moteur — la trace est générée par le moteur, jamais
> reconstruite par l'UI ; coût nul quand elle n'est pas demandée ;
> (b) l'UX du panneau : accordéon par skill × branche pour la trace, table des
> fixtures avec Δ % (vert/rouge/gris selon spec § 3), bouton « Capturer » →
> presse-papiers ;
> (c) le schéma `DamageFixture` finalisé (spec § 3) et le test
> `fixtures.test.ts` (spec § 4) — y compris le message d'échec qui oriente
> (régression moteur vs patch du jeu) ;
> (d) les arbitrages restants de la spec § 5, à faire trancher par Sevih.
> Présente ce design en un plan court avec les alternatives écartées et
> POURQUOI. N'écris aucun code avant validation explicite.
>
> **Phase 2 — IMPLÉMENTATION (après validation seulement).** Petites étapes
> vérifiables ; l'amont build→entrées doit rester une fonction pure importable
> côté node (le test des fixtures tourne sans UI).
>
> **Contraintes absolues.** Source de vérité = binaire libil2cpp 1.4.9 + tables
> `.gamedata/parsed/` ; jamais de formule inventée, jamais `outerpedia-v2` ;
> toute incertitude vit dans `damage-formula.md` § 12 et devient une étape
> `unresolved`, jamais une valeur plausible. Le harnais est en mode HARNAIS
> (build de dev, ou `?dev=1` en prod — cf. en-tête de cette spec) : il ne se
> rend jamais sans opt-in. UI : tokens Tailwind du projet uniquement (bg-scrim, bg-accent,
> text-warn…), jamais de couleur en dur. pnpm only ; ne JAMAIS lancer le
> serveur dev ; `pnpm exec tsc --noEmit`, eslint et prettier sur chaque fichier
> touché, `vitest run` sur les tests concernés ; commits uniquement sur
> instruction explicite de Sevih, staging par chemins explicites.
