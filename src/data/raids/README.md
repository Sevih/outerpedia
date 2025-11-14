# Guild Raid Data Structure

This directory contains all guild raid data in the new structured format.

## Directory Structure

```
raids/
├── README.md                    # This file
├── registry.json                # Index of all raids
├── _template/                   # Template for creating new raids
│   └── data.json
└── {raid-slug}/                 # Individual raid directories
    └── data.json                # Complete raid data
```

## Data Format

Each raid has a single `data.json` file containing:
- Metadata (title, description, dates)
- Phase 1 configuration (geas bosses)
- Phase 2 configuration (main boss strategies)
- Version history

## Validation

All raid data is validated against the Zod schema defined in:
`src/schemas/guild-raid.schema.ts`

## Creating a New Raid

1. Copy the `_template/data.json` file
2. Create a new directory with your raid slug: `raids/{raid-slug}/`
3. Edit the data.json file with your raid information
4. Run validation: `npm run raid:validate {raid-slug}`
5. Update `registry.json` to include your raid

## CLI Tools

```bash
# Create a new raid (interactive)
npm run raid:create

# Validate raid data
npm run raid:validate {raid-slug}

# Migrate from old format
npm run raid:migrate {old-raid-path}

# List all raids
npm run raid:list
```

## Image Assets

Images should be placed in: `public/images/guides/guild-raid/{raid-slug}/`

Common images (geas icons, UI elements) are in: `public/images/guides/guild-raid/_common/`
