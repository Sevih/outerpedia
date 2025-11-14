# Guild Raid Data Template

This template provides the structure for creating new guild raid data files.

## Boss ID Format

The `bossId` follows this format: `dataId-imageId-version`

### Example: `440700174-11-1`

- **`440700174`** = Real boss data ID (used to load `/data/boss/440700174-11-1.json`)
- **`11`** = Image ID (used for boss selector image: `/images/guides/guild-raid/T_Raid_SubBoss_11.png`)
  - Single-digit IDs are padded with a zero (e.g., `6` → `06` for `T_Raid_SubBoss_06.png`)
- **`1`** = Version number

### Complete Boss ID Examples

- `440400474-1-1` → Boss data: `440400474-1-1.json`, Image: `T_Raid_SubBoss_01.png`
- `440700274-6-1` → Boss data: `440700274-6-1.json`, Image: `T_Raid_SubBoss_06.png`
- `440700174-11-1` → Boss data: `440700174-11-1.json`, Image: `T_Raid_SubBoss_11.png`

## Geas Format

Geas can be specified in two ways:

### 1. Numeric ID (Recommended)

References entries in `/data/geas.json`:

```json
{
  "geas": {
    "1": {
      "bonus": 88,
      "malus": 5
    }
  }
}
```

### 2. String Reference (Legacy)

References geas from Phase 1 bosses using format: `{bossNumber}-{level}{B|M}`

```json
{
  "geas-active": {
    "bonus": ["1-3B", "2-5B"],
    "malus": ["1-2M"]
  }
}
```

- `"1-3B"` = Boss 1, Level 3, Bonus
- `"2-5M"` = Boss 2, Level 5, Malus

## File Structure

```json
{
  "v1": {
    "label": "Version Label",
    "date": "YYYY-MM-DD",
    "phase1": {
      "bosses": [
        {
          "bossId": "dataId-imageId-version",
          "geas": { /* 5 levels with bonus/malus */ },
          "notes": [ /* Optional boss mechanic notes */ ],
          "recommended": [ /* Optional recommended characters */ ],
          "team": [ /* Optional team composition */ ],
          "video": { /* Optional video */ }
        }
      ]
    },
    "phase2": {
      "id": "dataId-imageId-version",
      "overview": [ /* Boss mechanics */ ],
      "teams": {
        "team1": {
          "label": "Strategy Name",
          "icon": "icon-file.webp",
          "geas-active": {
            "bonus": [ /* Geas IDs or references */ ],
            "malus": [ /* Geas IDs or references */ ]
          },
          "setup": [ /* Team composition */ ],
          "note": [ /* Optional strategy notes */ ],
          "video": { /* Optional video */ }
        }
      }
    }
  }
}
```

## Validation

Validate your raid data using:

```bash
node scripts/raid/validate.js your-raid-slug
```

## Registry & Metadata

### 1. Add to Registry (`/src/data/raids/registry.json`)

Register your raid to make it discoverable:

```json
{
  "raids": {
    "your-raid-slug": {
      "slug": "your-raid-slug",
      "enabled": true,
      "dataPath": "your-raid-slug/data.json"
    }
  }
}
```

### 2. Add Metadata to Guides Reference (`/src/data/guides/guides-ref.json`)

Add display metadata for the guide listing:

```json
{
  "your-raid-slug": {
    "category": "guild-raid",
    "title": {
      "en": "English Title",
      "jp": "日本語タイトル",
      "kr": "한국어 제목",
      "zh": "中文标题"
    },
    "description": {
      "en": "English description",
      "jp": "日本語の説明",
      "kr": "한국어 설명",
      "zh": "中文描述"
    },
    "icon": "raid-icon-name",
    "last_updated": "YYYY-MM-DD",
    "author": "Your Name"
  }
}
```
