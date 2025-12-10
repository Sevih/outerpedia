# Guild Raid Data Structure

This directory contains all guild raid data in the structured format.

## Directory Structure

```
raids/
├── README.md                    # This file
├── registry.json                # Index of all raids (slug, enabled, dataPath)
├── _template/                   # Template for creating new raids
│   ├── data.json
│   └── README.md
└── {raid-slug}/                 # Individual raid directories
    └── data.json                # Complete raid data
```

## Data Format

Each raid has a single `data.json` file containing:
- Version-keyed structure (e.g., `"v1"`, `"v2"`)
- Each version includes:
  - `label`: Display name (e.g., "September 2024")
  - `date`: Date in YYYY-MM-DD format
  - `phase1`: Geas bosses configuration (1-2 bosses)
  - `phase2`: Main boss strategies

### Boss ID Format

Boss IDs follow the format: `{dataId}-{imageId}-{version}`
- `dataId`: ID for loading boss data from `/data/boss/{dataId}.json`
- `imageId`: For the image `T_Raid_SubBoss_XX.png` (padded to 2 digits)
- `version`: Version number

Example: `"440400474-11-1"`

### Geas Configuration

Each Phase 1 boss has 5 geas levels, each with a bonus and malus option.
Geas can be either:
- A numeric ID referencing `/data/geas.json`
- A full object with `effect`, `ratio`, `image`, `bg`

### Phase 2 Geas References

Format: `"{bossNumber}-{level}{B|M}"`
- `bossNumber`: 1 or 2
- `level`: 1-5
- `B` for Bonus, `M` for Malus

Example: `"1-3B"` = Boss 1, Level 3, Bonus

## Validation

All raid data is validated against the Zod schema defined in:
`src/schemas/guild-raid.schema.ts`

The validator checks:
- Required fields (label, date, phase1, phase2)
- Date format (YYYY-MM-DD)
- Boss ID format
- Geas configuration completeness (5 levels per boss)
- Duplicate geas IDs in Phase 1
- Phase 2 geas references validity
- Registry and guides-ref.json entries

## Creating a New Raid

1. Copy the `_template/` directory with your raid slug: `raids/{raid-slug}/`
2. Edit `data.json` with your raid information
3. Run validation: `npm run raid:validate {raid-slug}`
4. Add entry to `registry.json`
5. Add metadata to `src/data/guides/guides-ref.json` with `category: "guild-raid"`

## CLI Tools

```bash
# Validate raid data
npm run raid:validate {raid-slug}

# Example
npm run raid:validate madman-laboratory
```

## Image Assets

Images are stored in `public/images/guides/guild-raid/` with naming convention:
- `{raid-slug}_banner.webp` - Banner image
- `{raid-slug}_portrait.webp` - Portrait image
- `{raid-slug}_portrait2.webp` - Second portrait (if needed)

Geas boss images: `T_Raid_SubBoss_{imageId}.png`

## Metadata in guides-ref.json

Each raid needs an entry in `src/data/guides/guides-ref.json`:

```json
"{raid-slug}": {
  "category": "guild-raid",
  "title": { "en": "Raid Title", "jp": "...", "kr": "...", "zh": "..." },
  "description": { "en": "Description", ... },
  "icon": "raid-slug",
  "last_updated": "YYYY-MM-DD",
  "author": "Author Name"
}
```

## Current Raids

- `madman-laboratory`
- `frost-legion`
- `planetary-control-unit`
- `prevent-world-alteration`
- `dignity-of-the-golden-kingdom`
