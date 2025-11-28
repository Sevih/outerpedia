# AL Guide Conversion - AI Instructions

Game: **Outerplane**

## Status Tracking

### Converted (100% Perfect)
- amadeus-AL, anubis-g, ars-novaAL, beatlesAL, calamariAL, forest-king, meteos-AL, fulmination, gustav, heavy-fixed-vladi-max, masterlessAL, ppu-epsilon

### Remaining
chimeraAL, glicysAL, ksai, prom-dastei, prom-ddrakhan, prom-dstella, prom-dvlada, prom-gdahlia, prom-meva, sacreed-AL, schattermeister-Schwartz, shadowArch, toddlerAL, ziggsaron

---

## Quick Reference - File Checklist

For each guide, you need these files in `src/app/guides/_contents/adventure-license/{slug}/`:

| File | Phase 1 | Phase 2 | Description |
|------|---------|---------|-------------|
| `en.tsx` | Required | Required | English guide |
| `BossNameAL.json` | Required | Required | Teams + localized notes |
| `recommendedCharacters.ts` | Required | Required | Character recommendations |
| `jp.tsx` | - | Required | Japanese guide |
| `kr.tsx` | - | Required | Korean guide |
| `zh.tsx` | - | Required | Chinese guide |

---

## File Structure Requirements

### 1. `en.tsx` (Primary TSX)

```tsx
'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import BossNameALTeamsData from './BossNameAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const BossNameALTeams = BossNameALTeamsData as Record<string, TeamData>

export default function BossNameGuide() {
    return (
        <GuideTemplate
            title="Boss Name Adventure License Guide"
            introduction="Short description, main mechanic, typical attempts. Supports inline tags like {E/Fire}, {P/CharName}. Example: Same skills as Special Request Stage 12, can be cleared in 1-2 attempts. Verified up to stage 10."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay bossKey='Boss Name' modeKey='Adventure License' defaultBossId='51000XXX' />
                            {/* For adds/secondary bosses, use labelFilter to show only the relevant version */}
                            {/* <BossDisplay bossKey='Add Name' modeKey='Adventure License' defaultBossId='51000YYY' labelFilter={"Weekly Conquest - Boss Name"} /> */}
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[...]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={BossNameALTeams.bossNameAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="..." title="..." author="..." date="DD/MM/YYYY" />
                        </>
                    ),
                },
            }}
        />
    )
}
```

### 2. `BossNameAL.json` (Teams Data)

Naming: Match boss name (NOT `teams.json`)

```json
{
    "bossNameAL": {
        "Recommended Team": {
            "icon": "fire",
            "team": [
                ["Character1", "Character2"],
                ["Character3"]
            ],
            "note": [{"type": "p", "string": "EN text"}],
            "note_jp": [],
            "note_kr": [],
            "note_zh": []
        }
    }
}
```

**Icon Format Rules:**
- ✅ `"fire"` or `"SC_Buff_Fire_Dmg"` (name only)
- ❌ `"/images/ui/effect/fire.webp"` (no path/extension)

**Note Rules:**
- EN notes required for all stages
- Empty arrays for jp/kr/zh until localization phase
- Every stage with `team` MUST have `note`, `note_jp`, `note_kr`, `note_zh` fields

### 3. `recommendedCharacters.ts` (Character Recommendations)

**Location:** Same folder as TSX files
**Purpose:** Avoid duplication across localized TSX files

```typescript
export const recommendedCharacters = [
    {
        names: ["Character1", "Character2"],
        reason: {
            en: "{E/Fire} DPS options.",
            jp: "",
            kr: "",
            zh: ""
        }
    }
]
```

**Critical Rules:**
- File structure includes all 4 languages (en, jp, kr, zh)
- **Phase 1**: Only write English (`en`) - leave jp/kr/zh as empty strings `""`
- **Phase 2**: Fill in jp/kr/zh translations
- Export named `recommendedCharacters`
- Import in TSX: `import { recommendedCharacters } from './recommendedCharacters'`

---

## Content Creation Procedures

### TacticalTips Procedure

**Goal:** Strategic advice, NOT skill description repetition

**Steps:**
1. Read `src/data/boss/{id}.json`
2. Identify: counter mechanics, elemental restrictions, class bonuses, enrage conditions
3. Filter: Keep only mechanics with actionable advice
4. Write: Short sentences with inline tags, include "Use X", "Avoid Y" advice

**Examples:**
```tsx
tips={[
    "Only takes WG damage from Counter and Revenge attacks.",
    "Reduces Critical Hit Chance for non-{E/Earth} units."
]}
```

**CRITICAL:** Verify buff/debuff keys in `src/data/buffs.json` and `src/data/debuffs.json` before using `{B/...}` or `{D/...}` tags.

### How to Detect Boss Class Mechanics

**Step 1: Read boss JSON skills**
Search for keywords in skill descriptions:
- "Striker", "Defender", "Ranger", "Healer", "Mage"
- "攻撃型", "防御型", "スピード型", "回復型", "魔法型" (Japanese)

**Step 2: Identify class mechanic type**

| Mechanic | Example Text |
|----------|--------------|
| Class bonus | "increases damage taken from Mage and Ranger enemies" |
| Class resist | "reduces damage taken from Striker enemies" |
| Class penalty | "reduces Critical Hit Chance for non-{Class} units" |

**Example - Forest King (HAS class mechanics):**
```
"Greatly reduces damage taken from Striker enemies, but increases
damage taken from Mage and Ranger enemies."
```
→ Mention class in recommendations: `"{E/Light} {C/Mage} and {C/Ranger} DPS options."`

**Example - Meteos (NO class mechanics):**
```
"Reduces Weakness Gauge damage taken from non-Water enemies by 50%"
```
→ Only mention element: `"{E/Water} DPS options."`

---

### Adding Secondary Bosses (Adds)

Some encounters have secondary bosses (adds) that spawn alongside the main boss. To display them:

**Step 1: Find the add in boss index**
```
READ src/data/boss/index.json
├── Search for add name (e.g., "Deformed Inferior Core")
├── Look for matching mode with a label field
└── Get the ID from that entry
```

**Step 2: Use labelFilter to show only the relevant version**

The `labelFilter` prop filters which version of the add to display (some adds appear in multiple encounters).

```tsx
<div className="space-y-4">
    <BossDisplay bossKey='Main Boss' modeKey='Adventure License' defaultBossId='51000XXX' />
    <BossDisplay bossKey='Add Name' modeKey='Adventure License' defaultBossId='51000YYY' labelFilter={"Weekly Conquest - Main Boss"} />
</div>
```

**Example - Sacreed Guardian with Deformed Inferior Core:**
```tsx
<div className="space-y-4">
    <BossDisplay bossKey='Sacreed Guardian' modeKey='Adventure License' defaultBossId='51000021' />
    <BossDisplay bossKey='Deformed Inferior Core' modeKey='Adventure License' defaultBossId='51000022' labelFilter={"Weekly Conquest - Sacreed Guardian"} />
</div>
```

**Note:** Wrap multiple BossDisplay components in `<div className="space-y-4">` for proper spacing.

---

### RecommendedCharacterList Procedure

**CRITICAL:** Never invent reasons. All info must be verified from character JSON files.

**Steps:**

1. **For each character in team JSON:**
   - Read `src/data/char/{slug}.json`
   - Note: `Element`, `Class`, `role`, `tags`
   - Scan skills for key abilities

2. **Identify boss synergies:**
   - Element: Counters boss element, avoids penalties
   - Class: Benefits from boss class mechanics (ONLY if boss has class mechanics - see detection above)
   - Abilities: Immunities, cleanse, buff removal, dual attack, ignore-defense
   - Tags: Special mechanics

3. **Group characters by similar reason:**
   - Same element DPS (ignore class unless boss has class mechanics)
   - Tanks/supports with cleanse/shield
   - Generic supports (buffers, debuffers)
   - Unique ability characters (separate if justified)

4. **Write reasons:**
   - Short and factual
   - Use inline tags: `{E/Fire}`, `{C/Mage}`, `{D/BT_X}`, `{B/BT_Y}`
   - Mention ONLY verified abilities from character JSON
   - **DO NOT mention class** unless boss has class-specific mechanics

   **Valid patterns:**
   - `"{E/Fire} DPS options."` (no class mechanics)
   - `"{E/Light} {C/Mage} and {C/Ranger} DPS options."` (boss has class mechanics)
   - `"{E/Water} units with Debuff Cleanse and Shield."` (describe ability, don't use unverified buff tags)
   - `"{E/Earth} support units."`
   - Healers: `"{E/Earth} healers."`

   **CRITICAL:** When mentioning buffs/debuffs, verify the `name` exists in `src/data/buffs.json` or `src/data/debuffs.json` first. If unsure, describe the ability in plain text instead of using `{B/...}` or `{D/...}` tags.

5. **NEVER mention:**
   - Unverified abilities
   - Vague terms: "Core", "MVP", "best", "optimal"
   - Invented mechanics

**Example (Boss WITH class mechanics):**
```typescript
[
    {
        names: ["Beth", "Regina", "Luna"],
        reason: {
            en: "{E/Light} {C/Mage} and {C/Ranger} DPS options.",
            jp: "{E/Light} {C/Mage}と{C/Ranger} DPSオプション。",
            kr: "{E/Light} {C/Mage}와 {C/Ranger} DPS 옵션.",
            zh: "{E/Light} {C/Mage}和{C/Ranger} DPS选项。"
        }
    },
    {
        names: ["Stella"],
        reason: {
            en: "{E/Light} {C/Ranger} with Stun immunity.",
            jp: "スタン免疫を持つ{E/Light} {C/Ranger}。",
            kr: "스턴 면역을 가진 {E/Light} {C/Ranger}.",
            zh: "拥有眩晕免疫的{E/Light} {C/Ranger}。"
        }
    }
]
```

**Example (Boss WITHOUT class mechanics):**
```typescript
[
    {
        names: ["Caren", "Regina", "Roxie"],
        reason: {
            en: "{E/Water} DPS options.",
            jp: "{E/Water} DPSオプション。",
            kr: "{E/Water} DPS 옵션.",
            zh: "{E/Water} DPS选项。"
        }
    },
    {
        names: ["Luna", "Veronica"],
        reason: {
            en: "{E/Water} units with Debuff Cleanse.",
            jp: "弱体解除を持つ{E/Water}ユニット。",
            kr: "약화 해제를 가진 {E/Water} 유닛.",
            zh: "拥有弱化解除的{E/Water}单位。"
        }
    }
]
```

**Note:** Examples use plain text for abilities. Only use `{B/...}` or `{D/...}` tags if you've verified the exact `name` in the JSON files.

---

## Inline Tags Reference

Format: `{TYPE/VALUE}`

- `{E/Fire}` - Element with icon (Fire, Water, Earth, Light, Dark)
- `{C/Mage}` - Class (Striker, Defender, Ranger, Healer, Mage)
- `{B/BuffName}` - Buff tag (MUST use `name` from `src/data/buffs.json`)
- `{D/DebuffName}` - Debuff tag (MUST use `name` from `src/data/debuffs.json`)
- `{P/CharacterName}` - Character link
- `{I-W/WeaponName}` - Weapon item
- `{I-A/AmuletName}` - Amulet item

**CRITICAL - Buff/Debuff Keys:**
- ✅ Use `name` field from JSON files (e.g., `BT_DOT_CURSE`, `BT_COUNTER`)
- ❌ NEVER use `label` field (e.g., "Cursed", "Counterattack")
- ❌ NEVER invent buff/debuff keys
- **Verify:** All `{B/...}` and `{D/...}` tags MUST exist in `src/data/buffs.json` or `src/data/debuffs.json`

---

## Data Lookup Procedures

### Finding bossKey and defaultBossId

**Step 1: Find boss in index**
```
READ src/data/boss/index.json
├── Search for boss name (e.g., "Forest King")
├── Look for "Adventure License" mode
└── Get the ID from that entry
```

**Step 2: Verify in boss JSON**
```
READ src/data/boss/{id}.json
├── bossKey = Name.en field (EXACT match required)
└── defaultBossId = id field
```

**Example:**
```json
// In index.json
"Forest King": {
    "Adventure License": [
        { "id": "51000017", ... }
    ]
}

// In 51000017.json
{
    "id": "51000017",
    "Name": { "en": "Forest King", ... }
}

// In en.tsx
<BossDisplay bossKey='Forest King' modeKey='Adventure License' defaultBossId='51000017' />
```

**CRITICAL:** `bossKey` must EXACTLY match `Name.en` from boss JSON. No typos, no modifications.

---

## Workflow

### Phase 1: EN Version Creation

**Step 1: Data Collection**
```
READ src/data/boss/{id}.json
├── Extract: Name.en (for bossKey), id (for defaultBossId)
├── Extract: Name.jp, Name.kr, Name.zh (for localized titles)
├── Extract: Skills (for TacticalTips)
├── Extract: BuffImmune, StatBuffImmune (for immunities)
└── Note: Any class/element mechanics in skill descriptions
```

**Step 2: Create JSON File (`BossNameAL.json`)**
```json
{
    "bossNameAL": {
        "Stage Name": {
            "icon": "effect_name",      // ← Name only, NO path/extension
            "team": [["Char1"], ["Char2"]],
            "note": [{"type": "p", "string": "EN text"}],
            "note_jp": [],              // ← Empty array, NOT missing
            "note_kr": [],              // ← Empty array, NOT missing
            "note_zh": []               // ← Empty array, NOT missing
        }
    }
}
```

**Step 3: Create `recommendedCharacters.ts`**
```typescript
export const recommendedCharacters = [
    {
        names: ["Character1", "Character2"],
        reason: {
            en: "{E/Element} DPS options.",
            jp: "",     // ← Empty string, NOT missing
            kr: "",     // ← Empty string, NOT missing
            zh: ""      // ← Empty string, NOT missing
        }
    }
]
```

**Step 4: Create `en.tsx`**
- Use template from File Structure Requirements
- All 6 components in order: BossDisplay → TacticalTips → RecommendedCharacterList → StageBasedTeamSelector → CombatFootage

**Step 5: Verify**
```bash
python scripts/check-guide-format.py | grep "guide-slug"
```
Expected: `[PERFECT 100%] adventure-license/guide-slug (Single) +rc`

**Step 6: STOP - Wait for User Validation**

---

### Phase 1.5: Typo Correction (If User Modified Strings)

If the user made changes to EN strings:
1. Read modified `en.tsx` and `BossNameAL.json`
2. Check for typos (missing punctuation, spacing issues)
3. Apply corrections
4. **STOP - Wait for user approval to proceed to Phase 2**

---

### Phase 2: Localization (After User Approval)

**Step 1: Copy TSX Files**
```
en.tsx → jp.tsx, kr.tsx, zh.tsx
```

**Step 2: Translate in Each TSX**

| Field | Translate? | Example |
|-------|-----------|---------|
| `title` | YES | "Blazing Knight Meteos Adventure License Guide" → "炎の騎士メテオス アドベンチャーライセンス ガイド" |
| `introduction` | YES | Full translation (supports inline tags like `{E/Fire}`, `{P/CharName}`) |
| `tips` array | YES | Each tip string |
| `CombatFootage title` | YES | Video title |
| `bossKey` | NO | Keep English |
| `modeKey` | NO | Keep "Adventure License" |
| `defaultBossId` | NO | Keep ID |
| Character names | NO | Keep English |
| Inline tags | NO | Keep `{E/Fire}`, `{B/BT_X}` |

**Step 3: Fill `recommendedCharacters.ts`**
- Complete `jp`, `kr`, `zh` fields (currently `""`)

**Step 4: Fill JSON Notes**
- Complete `note_jp`, `note_kr`, `note_zh` arrays

**Step 5: Final Verify**
```bash
python scripts/check-guide-format.py | grep "guide-slug"
```
Expected: `[PERFECT 100%] adventure-license/guide-slug (Full) +rc`

---

## Critical Rules Summary

### ALWAYS DO
1. `'use client'` at top of every TSX
2. Include all 6 components in correct order
3. Create `recommendedCharacters.ts` with all 4 language keys
4. Add empty `note_jp`, `note_kr`, `note_zh` arrays in JSON (Phase 1)
5. Use icon name only (no path, no extension)
6. Verify buff/debuff keys exist in JSON files before using `{B/...}` or `{D/...}`
7. Wait for user validation before Phase 2

### NEVER DO
1. Invent character abilities - always verify in `src/data/char/{slug}.json`
2. Mention class unless boss has class-specific mechanics
3. Use `label` field for buff/debuff tags (use `name` field)
4. Use full paths in icons (`/images/ui/effect/fire.webp` → `fire`)
5. Skip empty arrays in JSON (`note_jp: []` is required even if empty)
6. Translate character names or inline tags

---

## Verification

```bash
python scripts/check-guide-format.py | grep "guide-slug"
```

Must show: `[PERFECT 100%] adventure-license/guide-slug (Single) +rc`

After localization: `(Full) +rc`

---

## Pre-Submit Validation Checklist

Before submitting Phase 1, manually verify:

### JSON File Validation
```
□ File named `{BossName}AL.json` (NOT `teams.json`)
□ Root key matches filename (e.g., `meteosAL` for `MeteosAL.json`)
□ Every stage has ALL fields: icon, team, note, note_jp, note_kr, note_zh
□ Icon is name only: "fire" ✓ | "/images/ui/effect/fire.webp" ✗
□ note_jp, note_kr, note_zh are empty arrays `[]` (NOT missing)
```

### recommendedCharacters.ts Validation
```
□ File exists in same folder as en.tsx
□ Export named `recommendedCharacters`
□ Every entry has: names, reason.en, reason.jp, reason.kr, reason.zh
□ reason.jp/kr/zh are empty strings `""` (NOT missing)
□ All buff/debuff tags verified in src/data/{buffs,debuffs}.json
```

### en.tsx Validation
```
□ 'use client' at line 1
□ Imports recommendedCharacters from './recommendedCharacters'
□ All 6 components present in order
□ bossKey matches exactly the `Name.en` field in boss JSON
□ defaultBossId matches the boss ID for Adventure License mode
```

---

## Common Mistakes - DO vs DON'T

### Icon Format

```json
// ✅ CORRECT
"icon": "fire"
"icon": "SC_Buff_Effect_Remove_Buff"

// ❌ WRONG
"icon": "/images/ui/effect/fire.webp"
"icon": "fire.webp"
```

### JSON Note Arrays

```json
// ✅ CORRECT - Phase 1 (empty arrays present)
{
    "note": [{"type": "p", "string": "EN text"}],
    "note_jp": [],
    "note_kr": [],
    "note_zh": []
}

// ❌ WRONG - Missing arrays
{
    "note": [{"type": "p", "string": "EN text"}]
}
```

### recommendedCharacters.ts Structure

```typescript
// ✅ CORRECT - All 4 language keys present
{
    names: ["Luna"],
    reason: {
        en: "{E/Water} support.",
        jp: "",
        kr: "",
        zh: ""
    }
}

// ❌ WRONG - Missing language keys
{
    names: ["Luna"],
    reason: {
        en: "{E/Water} support."
    }
}
```

### Buff/Debuff Tags

```typescript
// ✅ CORRECT - Using `name` field from JSON
"{B/BT_REMOVE_DEBUFF}"      // name: "BT_REMOVE_DEBUFF"
"{D/BT_STUN}"               // name: "BT_STUN"
"{B/BT_SHIELD_BASED_CASTER}" // name: "BT_SHIELD_BASED_CASTER"

// ❌ WRONG - Using label or invented keys
"{B/Debuff Cleanse}"        // This is a label, not name
"{D/Stun}"                  // This is a label, not name
"{B/BT_SUPER_BUFF}"         // Invented, doesn't exist
```

### Class Mentions

```typescript
// ✅ CORRECT - Boss HAS class mechanics (e.g., Forest King)
"{E/Light} {C/Mage} and {C/Ranger} DPS options."

// ✅ CORRECT - Boss has NO class mechanics (e.g., Meteos)
"{E/Water} DPS options."

// ❌ WRONG - Mentioning class when boss has no class mechanics
"{E/Water} {C/Mage} DPS options."  // Don't mention Mage if boss doesn't care
```

### Character Abilities

```typescript
// ✅ CORRECT - Verified from src/data/char/{slug}.json
"Luna with {B/BT_REMOVE_DEBUFF} and {B/BT_SHIELD_BASED_CASTER}."

// ❌ WRONG - Invented abilities
"Luna with Burst Damage and Team Cleanse."  // Not verified

// ✅ CORRECT - Describe in plain text if unsure about tag
"Luna with debuff removal and shield."  // Safe fallback
```

---

## Reference Examples

Perfect 100% guides to use as templates:

| Guide | Pattern | Note |
|-------|---------|------|
| `meteos-AL` | Standard | Boss without class mechanics |
| `forest-king` | With class | Boss WITH class mechanics |
| `anubis-g` | Multiple teams | Multiple team options |
| `ppu-epsilon` | Multi-boss | Multiple BossDisplay components |

---

## Troubleshooting

### Score not reaching 100%?

1. **Missing +rc?** → Check `recommendedCharacters.ts` exists and has all 4 language keys
2. **"Single" instead of "Full"?** → Missing jp.tsx, kr.tsx, or zh.tsx files
3. **Invalid icons warning?** → Remove path/extension from icon values
4. **Missing note translations?** → Add empty `note_jp: []` arrays in JSON

### Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `bossKey not found` | Typo in bossKey | Check exact `name` in boss JSON |
| `Cannot find './recommendedCharacters'` | File missing | Create recommendedCharacters.ts |
| `reason.jp is undefined` | Missing language key | Add `jp: ""` to reason object |
