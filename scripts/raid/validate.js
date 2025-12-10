#!/usr/bin/env node

/**
 * Guild Raid Data Validator
 * Validates raid data against Zod schema
 *
 * Usage: node scripts/raid/validate.js [raid-slug]
 */

const fs = require('fs')
const path = require('path')

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logError(message) {
  log(`❌ ${message}`, 'red')
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green')
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan')
}

// Get raid slug from command line
const raidSlug = process.argv[2]

if (!raidSlug) {
  logError('Please provide a raid slug')
  console.log('Usage: node scripts/raid/validate.js [raid-slug]')
  console.log('Example: node scripts/raid/validate.js madman-laboratory')
  process.exit(1)
}

// Paths
const projectRoot = path.resolve(__dirname, '../..')
const raidDataPath = path.join(projectRoot, 'src/data/raids', raidSlug, 'data.json')
const registryPath = path.join(projectRoot, 'src/data/raids/registry.json')

logInfo(`Validating raid: ${raidSlug}`)
console.log('')

// Check if raid data file exists
if (!fs.existsSync(raidDataPath)) {
  logError(`Raid data file not found: ${raidDataPath}`)
  process.exit(1)
}

// Load and parse raid data
let raidData
try {
  const rawData = fs.readFileSync(raidDataPath, 'utf-8')
  raidData = JSON.parse(rawData)
  logSuccess('Raid data file loaded successfully')
} catch (error) {
  logError(`Failed to parse raid data: ${error.message}`)
  process.exit(1)
}

// Basic structure validation
let hasErrors = false

// Check versions
const versions = Object.keys(raidData)
if (versions.length === 0) {
  logError('No versions found in raid data')
  hasErrors = true
} else {
  logSuccess(`Found ${versions.length} version(s): ${versions.join(', ')}`)
}

// Validate each version
versions.forEach((versionKey) => {
  const version = raidData[versionKey]

  console.log('')
  logInfo(`Validating version: ${versionKey}`)

  // Check required fields
  if (!version.label) {
    logError(`  Version ${versionKey} missing 'label'`)
    hasErrors = true
  }

  if (!version.date) {
    logError(`  Version ${versionKey} missing 'date'`)
    hasErrors = true
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(version.date)) {
    logError(`  Version ${versionKey} has invalid date format: ${version.date} (expected YYYY-MM-DD)`)
    hasErrors = true
  }

  // Collect all geas IDs from Phase 1 (for Phase 2 validation)
  const phase1GeasIds = new Set()
  const allGeasIds = [] // Track duplicates

  // Check Phase 1
  if (!version.phase1) {
    logError(`  Version ${versionKey} missing 'phase1'`)
    hasErrors = true
  } else {
    if (!version.phase1.bosses || !Array.isArray(version.phase1.bosses)) {
      logError(`  Version ${versionKey} Phase 1 missing 'bosses' array`)
      hasErrors = true
    } else {
      const bossCount = version.phase1.bosses.length
      if (bossCount < 1 || bossCount > 2) {
        logError(`  Version ${versionKey} Phase 1 must have 1-2 bosses (found ${bossCount})`)
        hasErrors = true
      } else {
        logSuccess(`  Phase 1: ${bossCount} boss(es)`)

        // Validate each boss
        version.phase1.bosses.forEach((boss, idx) => {
          // Check bossId (format: dataId-imageId-version, e.g., "440400474-11-1")
          if (!boss.bossId) {
            logError(`    Boss ${idx + 1} missing 'bossId'`)
            hasErrors = true
          } else {
            // Validate bossId format: "440400474-11-1" (dataId-imageId-version)
            if (!/^\d+-\d+-\d+$/.test(boss.bossId)) {
              logError(`    Boss ${idx + 1} has invalid bossId format: ${boss.bossId} (expected: dataId-imageId-version)`)
              hasErrors = true
            } else {
              logInfo(`    Boss ${idx + 1}: ${boss.bossId}`)
            }
          }

          // Check geas
          if (!boss.geas) {
            logError(`    Boss ${idx + 1} missing 'geas'`)
            hasErrors = true
          } else {
            const geasLevels = ['1', '2', '3', '4', '5']
            const missingLevels = geasLevels.filter(level => !boss.geas[level])
            if (missingLevels.length > 0) {
              logError(`    Boss ${idx + 1} missing geas levels: ${missingLevels.join(', ')}`)
              hasErrors = true
            }

            // Collect geas IDs from this boss
            geasLevels.forEach(level => {
              if (boss.geas[level]) {
                const bonusId = typeof boss.geas[level].bonus === 'number'
                  ? boss.geas[level].bonus
                  : null
                const malusId = typeof boss.geas[level].malus === 'number'
                  ? boss.geas[level].malus
                  : null

                if (bonusId !== null) {
                  phase1GeasIds.add(bonusId)
                  allGeasIds.push({ id: bonusId, boss: idx + 1, level, type: 'bonus' })
                }
                if (malusId !== null) {
                  phase1GeasIds.add(malusId)
                  allGeasIds.push({ id: malusId, boss: idx + 1, level, type: 'malus' })
                }
              }
            })
          }

          // Validate recommended format (new schema: {names, reason})
          if (boss.recommended && Array.isArray(boss.recommended)) {
            if (boss.recommended.length === 0) {
              logWarning(`    Boss ${idx + 1} has empty 'recommended' array`)
            } else {
              boss.recommended.forEach((rec, recIdx) => {
                // Check for old format
                if ('name' in rec || 'comment' in rec) {
                  logError(`    Boss ${idx + 1} recommended[${recIdx}] uses old format (name/comment). Run migration script.`)
                  hasErrors = true
                }
                // Check for new format
                if (!('names' in rec)) {
                  logError(`    Boss ${idx + 1} recommended[${recIdx}] missing 'names' field`)
                  hasErrors = true
                }
                if (!('reason' in rec)) {
                  logError(`    Boss ${idx + 1} recommended[${recIdx}] missing 'reason' field`)
                  hasErrors = true
                }
              })
            }
          }

          // Validate video format (new schema: {videoId, title})
          if (boss.video) {
            if ('id' in boss.video && !('videoId' in boss.video)) {
              logError(`    Boss ${idx + 1} video uses old format (id). Run migration script.`)
              hasErrors = true
            }
            if (!boss.video.videoId && !boss.video.id) {
              logWarning(`    Boss ${idx + 1} has empty video`)
            }
          }

          if (boss.team && (!Array.isArray(boss.team) || boss.team.length === 0)) {
            logWarning(`    Boss ${idx + 1} has empty 'team' array`)
          }
        })

        // Check for duplicate geas IDs in Phase 1
        const geasIdCounts = {}
        allGeasIds.forEach(({ id, boss, level, type }) => {
          if (!geasIdCounts[id]) {
            geasIdCounts[id] = []
          }
          geasIdCounts[id].push({ boss, level, type })
        })

        Object.entries(geasIdCounts).forEach(([id, occurrences]) => {
          if (occurrences.length > 1) {
            const locations = occurrences.map(o => `Boss ${o.boss} Level ${o.level} (${o.type})`).join(', ')
            logError(`    Duplicate geas ID ${id} found in Phase 1: ${locations}`)
            hasErrors = true
          }
        })
      }
    }
  }

  // Check Phase 2
  if (!version.phase2) {
    logError(`  Version ${versionKey} missing 'phase2'`)
    hasErrors = true
  } else {
    if (!version.phase2.id) {
      logError(`  Version ${versionKey} Phase 2 missing 'id'`)
      hasErrors = true
    } else {
      logSuccess(`  Phase 2: ${version.phase2.id}`)
    }

    if (!version.phase2.overview || !Array.isArray(version.phase2.overview) || version.phase2.overview.length === 0) {
      logError(`  Version ${versionKey} Phase 2 missing or empty 'overview' array`)
      hasErrors = true
    }

    if (!version.phase2.teams || typeof version.phase2.teams !== 'object') {
      logError(`  Version ${versionKey} Phase 2 missing 'teams' object`)
      hasErrors = true
    } else {
      const teamKeys = Object.keys(version.phase2.teams)
      if (teamKeys.length === 0) {
        logError(`  Version ${versionKey} Phase 2 has no team strategies`)
        hasErrors = true
      } else {
        logSuccess(`  Phase 2: ${teamKeys.length} team strategy(ies)`)

        // Validate each team
        teamKeys.forEach((teamKey) => {
          const team = version.phase2.teams[teamKey]

          // Validate video format (new schema: {videoId, title})
          if (team.video) {
            if ('id' in team.video && !('videoId' in team.video)) {
              logError(`    Team '${teamKey}' video uses old format (id). Run migration script.`)
              hasErrors = true
            }
          }

          // Validate geas references (can be either "1-3B" format or numeric ID)
          if (team['geas-active']) {
            // Validate bonus array
            if (team['geas-active'].bonus) {
              team['geas-active'].bonus.forEach((ref) => {
                const isValidFormat = /^[1-2]-[1-5][BM]$/i.test(ref)
                const isNumericId = typeof ref === 'number' && ref > 0

                if (!isValidFormat && !isNumericId) {
                  logError(`    Team '${teamKey}' has invalid bonus geas reference: ${ref} (must be format "1-3B" or positive integer)`)
                  hasErrors = true
                } else if (isNumericId) {
                  // Check that numeric geas ID exists in Phase 1
                  if (!phase1GeasIds.has(ref)) {
                    logError(`    Team '${teamKey}' uses geas ID ${ref} in bonus, but it's not defined in Phase 1`)
                    hasErrors = true
                  }
                }
              })
            }

            // Validate malus array
            if (team['geas-active'].malus) {
              team['geas-active'].malus.forEach((ref) => {
                const isValidFormat = /^[1-2]-[1-5][BM]$/i.test(ref)
                const isNumericId = typeof ref === 'number' && ref > 0

                if (!isValidFormat && !isNumericId) {
                  logError(`    Team '${teamKey}' has invalid malus geas reference: ${ref} (must be format "1-3B" or positive integer)`)
                  hasErrors = true
                } else if (isNumericId) {
                  // Check that numeric geas ID exists in Phase 1
                  if (!phase1GeasIds.has(ref)) {
                    logError(`    Team '${teamKey}' uses geas ID ${ref} in malus, but it's not defined in Phase 1`)
                    hasErrors = true
                  }
                }
              })
            }
          }
        })
      }
    }
  }
})

// Check registry
console.log('')
logInfo('Checking registry.json')

if (!fs.existsSync(registryPath)) {
  logWarning('registry.json not found')
} else {
  try {
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'))

    if (registry.raids && registry.raids[raidSlug]) {
      logSuccess(`Raid '${raidSlug}' found in registry`)

      const raidEntry = registry.raids[raidSlug]
      if (raidEntry.enabled) {
        logSuccess('Raid is enabled in registry')
      } else {
        logWarning('Raid is disabled in registry')
      }

      // Validate registry structure
      if (!raidEntry.slug) {
        logError('Registry entry missing "slug" field')
        hasErrors = true
      }
      if (!raidEntry.dataPath) {
        logError('Registry entry missing "dataPath" field')
        hasErrors = true
      }
    } else {
      logWarning(`Raid '${raidSlug}' not found in registry.json`)
      logInfo('Add this raid to registry.json to enable it')
    }
  } catch (error) {
    logError(`Failed to parse registry.json: ${error.message}`)
  }
}

// Check guides-ref.json for metadata
console.log('')
logInfo('Checking guides-ref.json for metadata')

const guidesRefPath = path.join(projectRoot, 'src/data/guides/guides-ref.json')
if (!fs.existsSync(guidesRefPath)) {
  logWarning('guides-ref.json not found')
} else {
  try {
    const guidesRef = JSON.parse(fs.readFileSync(guidesRefPath, 'utf-8'))

    if (guidesRef[raidSlug]) {
      logSuccess(`Raid '${raidSlug}' found in guides-ref.json`)

      const guideEntry = guidesRef[raidSlug]

      // Check required metadata fields
      if (!guideEntry.category || guideEntry.category !== 'guild-raid') {
        logError('guides-ref.json entry missing or invalid "category" field (should be "guild-raid")')
        hasErrors = true
      }
      if (!guideEntry.title) {
        logError('guides-ref.json entry missing "title" field')
        hasErrors = true
      }
      if (!guideEntry.description) {
        logError('guides-ref.json entry missing "description" field')
        hasErrors = true
      }
      if (!guideEntry.icon) {
        logError('guides-ref.json entry missing "icon" field')
        hasErrors = true
      }
      if (!guideEntry.last_updated) {
        logError('guides-ref.json entry missing "last_updated" field')
        hasErrors = true
      }
      if (!guideEntry.author) {
        logError('guides-ref.json entry missing "author" field')
        hasErrors = true
      }
    } else {
      logWarning(`Raid '${raidSlug}' not found in guides-ref.json`)
      logInfo('Add metadata to guides-ref.json for proper display')
    }
  } catch (error) {
    logError(`Failed to parse guides-ref.json: ${error.message}`)
  }
}

// Final result
console.log('')
console.log('='.repeat(60))
if (hasErrors) {
  logError('Validation FAILED - Please fix the errors above')
  process.exit(1)
} else {
  logSuccess('Validation PASSED - Raid data is valid!')
  process.exit(0)
}
