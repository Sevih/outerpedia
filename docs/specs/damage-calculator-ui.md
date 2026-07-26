# Damage calculator — squelette d'interface

> Quatrième volet. Le squelette sert à DÉPARTAGER les décisions du
> [rapport § 5](./damage-report-inputs.md) en les rendant visibles : chaque
> zone de l'écran incarne un choix. La prompt pour Claude design est en § 4,
> prête à copier.

## 1. Le squelette (desktop, 3 colonnes)

```text
┌────────────────────────────────────────────────────────────────────────────────┐
│  Damage Calculator                                  données v1.4.9 · [Reset]   │
├───────────────────────┬───────────────────────┬────────────────────────────────┤
│ ① ATTAQUANT (build)   │ ② SCÉNARIO            │ ③ RAPPORT                      │
│                       │                       │                                │
│ [portrait + picker]   │ CIBLE                 │ ┌─ Skill 2 « … » ────────────┐ │
│ Niv [120] Évo [6]     │ ◉ Monstre (preset)    │ │ 3 hits · variante: [Base ▾]│ │
│ Trans [★6] Skill [5]  │   [contenu ▾][boss ▾] │ │                            │ │
│ Archive [11] Monad[▾] │   → niv 90, spawn +15%│ │  Normal   Crit    Esquivé  │ │
│ Éveil [nœuds ▾]       │ ○ Personnage (build)  │ │  45 230   67 845  22 615   │ │
│                       │                       │ │  62,3 %   32,4 %   5,3 %   │ │
│ ÉQUIPEMENT            │ CONTEXTE              │ │                            │ │
│ [arme  +15][casque…]  │ [PvE ▾]  cibles: [1▾] │ │  Espérance : 51 348        │ │
│ main/subs par pièce   │ (PvP → cycle pénalité)│ │  par hit : 15 077 ×2       │ │
│ Set: 4P ATK · 2P Crit │                       │ │            + 21 194 (last) │ │
│ EE [+10] Artefact [5] │ BUFFS ACTIFS          │ │  WG −2 · vampirique 2 260  │ │
│                       │ Attaquant   Cible     │ └────────────────────────────┘ │
│ STATS FINALES (calc)  │ [+ Générique]         │ ┌─ Skill 1 « … » ──────────┐   │
│ ATK 4 812  Crit 78 %  │ [+ Depuis les kits]   │ │ … DOT: 3 210/tick (85 %) │   │
│ CritDMG 214 % …       │ chips: [ATK+50% ×2 ✕] │ └──────────────────────────┘   │
│ (repliable, lecture)  │        [DEF−40%    ✕] │ (une carte par skill offensif) │
└───────────────────────┴───────────────────────┴────────────────────────────────┘
```

Mobile : ①②③ empilés, le rapport en dernier avec un résumé sticky en bas
(« Espérance S2 : 51 348 ») qui déplie la carte.

## 2. Ce que chaque zone tranche (les décisions § 5)

| Zone du squelette                               | Décision § 5 | Ce que le squelette propose                                                                                                                       |
| ----------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| ② Cible ◉ Monstre / ○ Personnage                | § 5.1        | Les DEUX modes visibles dès la v1, monstre par défaut ; le mode personnage réutilise le panneau ① en miroir (même composant de build)             |
| ② Buffs `[+ Générique]` / `[+ Depuis les kits]` | § 5.2        | Les deux portes d'entrée coexistent : générique = stat + valeur + stacks ; kits = choisir 4 alliés → cocher leurs buffs réels (BuffID résolus)    |
| ③ Cartes par skill, DOT « par tick »            | § 5.3        | Pas de timeline de rotation en v1 — le DOT affiche dégâts/tick × proba de pose ; la rotation restera une évolution de la colonne ③ seule          |
| ③ `variante: [Base ▾]` sur la carte             | § 5.4        | Sélecteur de variante par skill (Base/Upgrade/A/B…), badge « non vérifié » si l'affectation n'est pas curée — la curation admin remplit le défaut |

Conséquence directe pour les extracteurs : le squelette confirme l'ordre § 6 du
rapport (characters → equipment → buffs → targets → config) et n'exige rien de
plus que ce qui y est listé.

## 3. Anatomie de la carte de rapport (zone ③)

- En-tête : icône + nom du skill, nombre de hits, sélecteur de variante,
  cooldown affiché à titre indicatif.
- Corps : 3 colonnes Normal / Critique / Esquivé — dégâts totaux + probabilité
  exacte de la branche ; l'espérance en dessous, en gras.
- Détail repliable « par hit » : la chaîne des hits avec le rattrapage du
  dernier hit visible (les arrondis sont VRAIS, pas cosmétiques).
- Lignes annexes conditionnelles : WG, vampirique, récup on-hit du défenseur,
  DOT (dégâts/tick + proba de pose), soins/shields posés.
- Cas particuliers : cible INVINCIBLE → carte grisée « 0 (invincible) » ;
  MISS impossible en PvE monstre sans Avoid → colonne Esquivé masquée.

## 4. Prompt pour Claude design (copier tel quel)

```text
Design a "Damage Calculator" tool page for Outerpedia, a wiki/tools site for the
gacha RPG Outerplane. Desktop-first web page, with a stacked mobile variant.

## Visual identity (match the existing site exactly)
- Dark theme ONLY. Deep navy slate surfaces: page background #0b1120, raised
  cards #131c2e, overlays/popovers #1e293b, sunken wells #070b14.
- Text: white #ffffff for primary content, #cbd5e1 for muted/secondary.
- Borders: slate #42566e (subtle) to #64748b (strong). Focus ring: sky #38bdf8.
- Accent for interactive elements and highlights: sky/cyan family. Element
  colors for the game's 5 elements: Earth green, Water blue, Fire red,
  Light yellow, Dark purple.
- Typography: clean geometric sans-serif, compact density (this is a data tool,
  not a landing page). Numbers are the heroes: large, tabular figures.

## Page layout — three columns (ratio ~28% / 24% / 48%)
Header bar: page title "Damage Calculator", a small badge "data v1.4.9", and a
Reset button.

### Column 1 — ATTACKER (the build)
- Character picker: portrait thumbnail + searchable select.
- Growth inputs in a tight grid of steppers/selects: Level (1-120), Evolution
  (0-6), Transcendence (stars), Skill level, Archive level, Monad nodes,
  Awakening nodes (opens a small node-tree popover).
- EQUIPMENT section: 6 gear slots (weapon, helmet, armor, gloves, shoes,
  accessory) each showing item icon, enchant level (+0..+15), main stat, and
  editable sub-stats (4 rows: stat select + value input). A set summary line
  (e.g. "4P Attack · 2P Critical"). Below: Exclusive Equipment slot with its
  own enchant level, and an Artifact slot with level.
- FINAL STATS panel (read-only, collapsible): computed ATK, DEF, HP, Speed,
  Crit Rate %, Crit DMG %, etc. Two-column dense grid. Visually distinct
  (sunken well) because it is OUTPUT, not input.

### Column 2 — SCENARIO
- TARGET card with a radio segmented control: "Monster" (default) / "Character".
  - Monster mode: two selects (Content, then Boss/Stage) + a read-only line
    showing the resolved spawn: "Lv 90 · spawn bonus +15% ATK/DEF".
  - Character mode: compact summary of an enemy build + "Edit build" button
    (reuses the attacker build editor in a modal/drawer).
- CONTEXT card: content type select (PvE / PvP Arena / Real-time PvP / World
  Boss), number of targets hit (1-5), and — only when PvP is selected — a
  "penalty cycle" stepper with a hint ("heals −50% from turn 10").
- ACTIVE BUFFS card, split "Attacker" / "Target" tabs or sub-sections. Two add
  buttons: "+ Generic buff" (opens: stat select, value %, stacks) and "+ From
  kits" (opens: pick up to 4 allies → checklist of their real buffs/debuffs).
  Active buffs render as removable chips with value and stack count, e.g.
  "ATK +50% ×2 ✕", debuffs on the target in a different hue, e.g. "DEF −40% ✕".

### Column 3 — REPORT (the payoff, visually dominant)
One card per offensive skill, most important skill first. Card anatomy:
- Header: skill icon + name, hit count ("3 hits"), a small "variant" dropdown
  (e.g. Base / Upgraded), and cooldown as passive info. If the variant mapping
  is unverified, show a subtle warning badge "unverified".
- Main block: three result columns — NORMAL / CRITICAL / MISS — each with the
  total damage (big tabular number) and the exact branch probability below it
  (e.g. "62.3%"). Then a highlighted "Expected damage" line (weighted average),
  the single most prominent number of the card.
- Collapsible "per hit" breakdown: list of hits with individual damage; the
  last hit is marked "(remainder)" because the game gives it the rounding
  remainder.
- Conditional footer lines with small icons: Weakness Gauge damage, lifesteal
  healing, target's on-hit recovery, DOT ("3,210 per tick · 85% apply chance"),
  shields/heals granted.
- Edge states to design: target invincible (card grayed with "0 — Invincible"),
  miss column hidden when the target cannot dodge.
Mobile: columns stack (Attacker → Scenario → Report) with a sticky bottom bar
showing the top skill's expected damage; tapping it scrolls to the report.

## Tone and constraints
- Information-dense but calm: generous line-height inside cards, clear section
  labels in small caps, no decorative illustrations.
- Every number that comes from a simulation branch shows its probability —
  never hide the odds.
- No light theme, no onboarding modals, no marketing hero section.
```

## 5. Après le design

1. Sevih passe la prompt dans Claude design, itère sur le rendu.
2. Le rendu validé fige les décisions § 5 (ou les amende — mettre à jour
   [damage-report-inputs.md](./damage-report-inputs.md) si un choix bouge).
3. Alors seulement : extracteur `characters` (l'ordre § 6 du rapport).
