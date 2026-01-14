import { z } from 'zod'
import { getAvailableLanguages, type TenantKey } from '@/tenants/config'

/**
 * Schema for Guild Raid data structure
 * Provides runtime validation and TypeScript type inference
 */

// ============================================================================
// GEAS SCHEMAS
// ============================================================================

/**
 * Background level for geas cards (visual styling)
 */
export const GeasBackgroundSchema = z.enum(['1', '2', '3'])

/**
 * Individual geas modifier (bonus or malus) - Full object format
 */
export const GeasObjectSchema = z.object({
  effect: z.string().min(1, 'Geas effect description is required'),
  ratio: z.string().min(1, 'Geas ratio is required (e.g., "-45%", "+20%")'),
  image: z.string().min(1, 'Geas icon image name is required'),
  bg: GeasBackgroundSchema,
})

/**
 * Individual geas modifier (bonus or malus) - Can be either an ID or full object
 * ID refers to entry in /data/geas.json
 */
export const GeasSchema = z.union([
  z.number().int().positive('Geas ID must be a positive integer'),
  GeasObjectSchema,
])

/**
 * Geas level containing both bonus and malus options
 */
export const GeasLevelSchema = z.object({
  bonus: GeasSchema,
  malus: GeasSchema,
})

/**
 * Complete geas configuration for a boss (5 levels)
 */
export const GeasConfigSchema = z.object({
  '1': GeasLevelSchema,
  '2': GeasLevelSchema,
  '3': GeasLevelSchema,
  '4': GeasLevelSchema,
  '5': GeasLevelSchema,
})

/**
 * Geas reference format: "1-3B" (boss 1, level 3, Bonus)
 * Pattern: {bossNumber}-{level}{B|M}
 */
export const GeasReferenceSchema = z.string().regex(
  /^[1-2]-[1-5][BM]$/i,
  'Geas reference must follow format: "1-3B" (boss 1-2, level 1-5, B for Bonus or M for Malus)'
)

// ============================================================================
// LOCALIZATION HELPERS
// ============================================================================

/**
 * LangMap for localized strings (matches @/lib/localize LangMap type)
 * Built dynamically from available languages in tenant config
 */
const buildLocalizedObjectSchema = () => {
  const languages = getAvailableLanguages()
  const shape: Record<string, z.ZodTypeAny> = {}
  for (const lang of languages) {
    shape[lang] = lang === 'en' ? z.string() : z.string().optional()
  }
  return z.object(shape as { en: z.ZodString } & Record<Exclude<TenantKey, 'en'>, z.ZodOptional<z.ZodString>>)
}

export const LangMapSchema = z.union([
  z.string(),
  buildLocalizedObjectSchema(),
])

/**
 * Helper to build localized suffix fields (field_jp, field_kr, field_zh)
 * Used with spread after defining the base field separately
 * Example: { notes: z.array(...), ...buildLocalizedSuffixFields('notes', z.array(...)) }
 */
const buildLocalizedSuffixFields = <T extends z.ZodTypeAny>(fieldName: string, schema: T) => {
  const languages = getAvailableLanguages()
  const shape: Record<string, z.ZodOptional<T>> = {}
  for (const lang of languages) {
    if (lang !== 'en') {
      shape[`${fieldName}_${lang}`] = schema.optional()
    }
  }
  return shape
}

/**
 * Helper to build all localized field schemas (field + field_jp, field_kr, field_zh)
 * All fields are optional - used when the base field doesn't need validation
 */
const buildLocalizedFields = <T extends z.ZodTypeAny>(fieldName: string, schema: T) => {
  const languages = getAvailableLanguages()
  const shape: Record<string, z.ZodOptional<T>> = {}
  for (const lang of languages) {
    const key = lang === 'en' ? fieldName : `${fieldName}_${lang}`
    shape[key] = schema.optional()
  }
  return shape
}

// ============================================================================
// CHARACTER & TEAM SCHEMAS
// ============================================================================

/**
 * Character recommendation with reason (compatible with RecommendedCharacterList)
 * - names: single name or array of names for grouped characters
 * - reason: localized explanation (LangMap)
 */
export const CharacterRecommendationSchema = z.object({
  names: z.union([
    z.string().min(1, 'Character name is required'),
    z.array(z.string().min(1, 'Character name cannot be empty')).min(1),
  ]),
  reason: LangMapSchema,
})

/**
 * Team composition: 2D array of character names
 * Rows represent different positions/roles in the team
 */
export const TeamCompositionSchema = z.array(
  z.array(z.string().min(1, 'Character name cannot be empty'))
).min(1, 'Team must have at least one row')

// ============================================================================
// VIDEO SCHEMAS
// ============================================================================

/**
 * YouTube video embed information (compatible with CombatFootage)
 */
export const VideoSchema = z.object({
  videoId: z.string().min(1, 'YouTube video ID is required'),
  title: z.string().min(1, 'Video title is required'),
  author: z.string().optional(),
  date: z.string().optional(),
})

// ============================================================================
// PHASE 1 (GEAS BOSSES) SCHEMAS
// ============================================================================

/**
 * Boss ID format: "440400474-11-1"
 * - First part: Real boss ID (for loading boss data file)
 * - Second part: Image ID (for T_Raid_SubBoss_XX.png, padded to 2 digits)
 * - Third part: Version number
 */
export const BossIdSchema = z.string().regex(
  /^\d+-\d+-\d+$/,
  'Boss ID must follow format: "440400474-11-1" (bossDataId-imageId-version)'
)

/**
 * Phase 1 boss configuration - SIMPLIFIED
 * Only stores raid-specific data, boss info is loaded from /data/boss/{bossId}.json
 */
export const Phase1BossSchema = z.object({
  bossId: BossIdSchema,
  geas: GeasConfigSchema,
  ...buildLocalizedFields('notes', z.array(z.string())),
  recommended: z.array(CharacterRecommendationSchema).optional(),
  team: TeamCompositionSchema.optional(),
  video: VideoSchema.optional(),
})

/**
 * Phase 1 complete configuration
 */
export const Phase1Schema = z.object({
  bosses: z.array(Phase1BossSchema)
    .min(1, 'Phase 1 must have at least one boss')
    .max(2, 'Phase 1 can have at most 2 bosses'),
})

// ============================================================================
// PHASE 2 (MAIN BOSS) SCHEMAS
// ============================================================================

/**
 * Note entry types for team strategies
 */
export const NoteParagraphSchema = z.object({
  type: z.literal('p'),
  string: z.string().min(1, 'Paragraph content cannot be empty'),
})

export const NoteListSchema = z.object({
  type: z.literal('ul'),
  items: z.array(z.string().min(1, 'List item cannot be empty')).min(1, 'List must have at least one item'),
})

export const NoteEntrySchema = z.discriminatedUnion('type', [
  NoteParagraphSchema,
  NoteListSchema,
])

/**
 * Active geas configuration for Phase 2 teams
 * Separates bonus and malus geas for proper visual styling
 */
export const ActiveGeasSchema = z.object({
  bonus: z.array(z.union([
    GeasReferenceSchema,
    z.number().int().positive('Geas ID must be a positive integer')
  ])).optional(),
  malus: z.array(z.union([
    GeasReferenceSchema,
    z.number().int().positive('Geas ID must be a positive integer')
  ])).optional(),
})

/**
 * Phase 2 team strategy configuration
 */
export const Phase2TeamSchema = z.object({
  label: z.string().min(1, 'Team strategy label is required'),
  icon: z.string().min(1, 'Team icon filename is required (e.g., "earth.webp")'),
  setup: TeamCompositionSchema,
  ...buildLocalizedFields('note', z.array(NoteEntrySchema)),
  'geas-active': ActiveGeasSchema.optional(),
  video: VideoSchema.optional(),
})

/**
 * Phase 2 complete configuration
 */
export const Phase2Schema = z.object({
  id: z.string().min(1, 'Boss ID is required (e.g., "440400379-B-1")'),
  overview: z.array(z.string()).min(1, 'Phase 2 must have at least one overview note'),
  ...buildLocalizedSuffixFields('overview', z.array(z.string())),
  teams: z.record(z.string(), Phase2TeamSchema).refine(
    (teams) => Object.keys(teams).length > 0,
    'Phase 2 must have at least one team strategy'
  ),
  video: VideoSchema.optional(),
})

// ============================================================================
// VERSION SCHEMAS
// ============================================================================

/**
 * Single raid version configuration
 */
export const RaidVersionSchema = z.object({
  label: z.string().min(1, 'Version label is required'),
  date: z.string().regex(
    /^\d{4}-\d{2}-\d{2}$/,
    'Date must be in YYYY-MM-DD format'
  ),
  phase1: Phase1Schema,
  phase2: Phase2Schema,
})

/**
 * Complete raid data with version support
 */
export const GuildRaidDataSchema = z.record(
  z.string(),
  RaidVersionSchema
).refine(
  (versions) => Object.keys(versions).length > 0,
  'Raid must have at least one version'
)

// ============================================================================
// METADATA SCHEMAS (for guides-ref.json integration)
// ============================================================================

/**
 * Raid metadata for integration with guides system
 */
export const RaidMetadataSchema = z.object({
  slug: z.string().min(1, 'Raid slug is required'),
  category: z.literal('guild-raid'),
  title: z.record(z.string(), z.string()).refine(
    (titles) => 'en' in titles,
    'English title is required'
  ),
  description: z.record(z.string(), z.string()).refine(
    (descriptions) => 'en' in descriptions,
    'English description is required'
  ),
  icon: z.string().min(1, 'Icon name is required'),
  last_updated: z.string().regex(
    /^\d{4}-\d{2}-\d{2}$/,
    'Date must be in YYYY-MM-DD format'
  ),
  author: z.string().min(1, 'Author name is required'),
})

// ============================================================================
// REGISTRY SCHEMA
// ============================================================================

/**
 * Raid registry entry - stores only essential data path info
 * Metadata (title, description, etc.) is stored in guides-ref.json
 */
export const RaidRegistryEntrySchema = z.object({
  slug: z.string(),
  enabled: z.boolean(),
  dataPath: z.string(),
})

export const RaidRegistrySchema = z.object({
  raids: z.record(z.string(), RaidRegistryEntrySchema),
})

// ============================================================================
// TYPESCRIPT TYPE EXPORTS
// ============================================================================

export type GeasObject = z.infer<typeof GeasObjectSchema>
export type Geas = z.infer<typeof GeasSchema>
export type GeasLevel = z.infer<typeof GeasLevelSchema>
export type GeasConfig = z.infer<typeof GeasConfigSchema>
export type GeasReference = z.infer<typeof GeasReferenceSchema>
export type ActiveGeas = z.infer<typeof ActiveGeasSchema>
export type CharacterRecommendation = z.infer<typeof CharacterRecommendationSchema>
export type TeamComposition = z.infer<typeof TeamCompositionSchema>
export type Video = z.infer<typeof VideoSchema>
export type Phase1Boss = z.infer<typeof Phase1BossSchema>
export type Phase1 = z.infer<typeof Phase1Schema>
export type NoteEntry = z.infer<typeof NoteEntrySchema>
export type Phase2Team = z.infer<typeof Phase2TeamSchema>
export type Phase2 = z.infer<typeof Phase2Schema>
export type RaidVersion = z.infer<typeof RaidVersionSchema>
export type GuildRaidData = z.infer<typeof GuildRaidDataSchema>
export type RaidMetadata = z.infer<typeof RaidMetadataSchema>
export type RaidRegistryEntry = z.infer<typeof RaidRegistryEntrySchema>
export type RaidRegistry = z.infer<typeof RaidRegistrySchema>

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validates guild raid data and returns typed result
 * @throws ZodError if validation fails
 */
export function validateGuildRaidData(data: unknown): GuildRaidData {
  return GuildRaidDataSchema.parse(data)
}

/**
 * Validates guild raid data and returns success/error result
 */
export function safeValidateGuildRaidData(data: unknown) {
  return GuildRaidDataSchema.safeParse(data)
}

/**
 * Validates raid metadata
 * @throws ZodError if validation fails
 */
export function validateRaidMetadata(data: unknown): RaidMetadata {
  return RaidMetadataSchema.parse(data)
}

/**
 * Validates a geas reference string
 */
export function validateGeasReference(ref: string): boolean {
  return GeasReferenceSchema.safeParse(ref).success
}

/**
 * Parse a geas reference into its components
 */
export function parseGeasReference(ref: string): {
  bossIndex: number
  level: string
  type: 'bonus' | 'malus'
} | null {
  const match = ref.match(/^(\d+)-(\d+)([BM])$/i)
  if (!match) return null

  const [, bossIndexStr, level, typeLetter] = match
  return {
    bossIndex: parseInt(bossIndexStr, 10) - 1,
    level,
    type: typeLetter.toUpperCase() === 'B' ? 'bonus' : 'malus',
  }
}

/**
 * Create a type-safe geas reference string
 */
export function createGeasReference(
  bossNumber: 1 | 2,
  level: 1 | 2 | 3 | 4 | 5,
  type: 'bonus' | 'malus'
): GeasReference {
  const typeLetter = type === 'bonus' ? 'B' : 'M'
  return `${bossNumber}-${level}${typeLetter}` as GeasReference
}

/**
 * Parse a boss ID into its components
 * Format: "440400474-11-1" → { dataId: "440400474", imageId: "11", version: 1 }
 *
 * Note: imageId will be padded to 2 digits when used for images (e.g., "6" → "06")
 */
export function parseBossId(bossId: string): {
  dataId: string
  imageId: string
  version: number
} | null {
  const parts = bossId.split('-')
  if (parts.length !== 3) return null

  const [dataId, imageId, versionStr] = parts
  const version = parseInt(versionStr, 10)

  if (!dataId || !imageId || isNaN(version)) return null

  return {
    dataId,
    imageId,
    version,
  }
}
