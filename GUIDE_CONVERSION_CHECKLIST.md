# AL Guide Conversion - AI Instructions

Game: **Outerplane**

## Status Tracking

### Converted (100% Perfect)
- amadeus-AL, anubis-g, ars-novaAL, beatlesAL, forest-king, meteos-AL, fulmination

### Remaining
calamariAL, chimeraAL, glicysAL, gustav, heavy-fixed-vladi-max, ksai, masterlessAL, ppu-epsilon, prom-dastei, prom-ddrakhan, prom-dstella, prom-dvlada, prom-gdahlia, prom-meva, sacreed-AL, schattermeister-Schwartz, shadowArch, toddlerAL, ziggsaron

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
            introduction="Short description, main mechanic, typical attempts. Example: Same skills as Special Request Stage 12, can be cleared in 1-2 attempts. Verified up to stage 10."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay bossKey='Boss Name' modeKey='Adventure License' defaultBossId='51000XXX' />
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
            jp: "{E/Fire} DPSオプション。",
            kr: "{E/Fire} DPS 옵션.",
            zh: "{E/Fire} DPS选项。"
        }
    }
]
```

**Critical Rules:**
- ALL 4 languages (en, jp, kr, zh) in one file
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

### RecommendedCharacterList Procedure

**CRITICAL:** Never invent reasons. All info must be verified from character JSON files.

**Steps:**

1. **For each character in team JSON:**
   - Read `src/data/char/{slug}.json`
   - Note: `Element`, `Class`, `role`, `tags`
   - Scan skills for key abilities

2. **Identify boss synergies:**
   - Element: Counters boss element, avoids penalties
   - Class: Benefits from boss class mechanics (ONLY if boss has class mechanics)
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

## Workflow

### Phase 1: EN Version Creation

1. User provides boss ID
2. Read `src/data/boss/{id}.json`
3. Create `BossNameAL.json` with teams + EN notes
4. Read character JSONs from `src/data/char/`
5. Create `recommendedCharacters.ts` with ALL 4 languages
6. Create `en.tsx` with all components
7. Verify: `python scripts/check-guide-format.py`
8. **STOP - Wait for user validation**

### Phase 2: Localization (After User Approval)

1. Copy `en.tsx` → `jp.tsx`, `kr.tsx`, `zh.tsx`
2. Translate in each file:
   - `title` (use boss JSON + translate "Guide")
   - `introduction`
   - `tips` in TacticalTips
   - `title` in CombatFootage
3. Add localized notes in JSON:
   - `note_jp`, `note_kr`, `note_zh`
4. Verify: Must show 100% PERFECT score

**DO NOT translate:**
- Component structure/imports
- Inline tags
- Character names
- `bossKey`, `modeKey`, `defaultBossId`

---

## Critical Rules

1. ALWAYS `'use client'` at top
2. ALWAYS include all 6 components in order
3. ALWAYS create `recommendedCharacters.ts` with 4 languages
4. NEVER invent character abilities - verify in JSONs
5. NEVER mention class unless boss has class mechanics
6. ALWAYS wait for user validation before localization
7. ALWAYS add empty `note_jp`, `note_kr`, `note_zh` arrays in JSON
8. Icon format: name only (no path/extension)

---

## Verification

```bash
python scripts/check-guide-format.py | grep "guide-slug"
```

Must show: `[PERFECT 100%] adventure-license/guide-slug (Single) +rc`

After localization: `(Full) +rc`

---

## Reference Examples

Perfect 100% guides:
- `amadeus-AL` (BossNameAL.json pattern)
- `anubis-g` (Multiple teams)
- `forest-king` (Boss with class mechanics)
- `meteos-AL` (Boss without class mechanics)
