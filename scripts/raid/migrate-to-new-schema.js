#!/usr/bin/env node

/**
 * Migrate Guild Raid Data to New Schema
 *
 * Changes:
 * - recommended: {name, comment} → {names, reason}
 * - video: {id, title} → {videoId, title, author?, date?}
 */

const fs = require('fs')
const path = require('path')

const raidsDir = path.join(__dirname, '../../src/data/raids')

function migrateRecommended(recommended) {
  if (!recommended || !Array.isArray(recommended)) return recommended

  return recommended.map(rec => {
    // Already migrated
    if ('names' in rec && 'reason' in rec) return rec

    // Old format: {name, comment}
    if ('name' in rec) {
      return {
        names: rec.name,
        reason: rec.comment || ''
      }
    }

    return rec
  })
}

function migrateVideo(video) {
  if (!video) return video

  // Already migrated
  if ('videoId' in video) return video

  // Old format: {id, title}
  if ('id' in video) {
    return {
      videoId: video.id,
      title: video.title,
      ...(video.author && { author: video.author }),
      ...(video.date && { date: video.date })
    }
  }

  return video
}

function migratePhase1Boss(boss) {
  return {
    ...boss,
    recommended: migrateRecommended(boss.recommended),
    video: migrateVideo(boss.video)
  }
}

function migratePhase2Team(team) {
  return {
    ...team,
    video: migrateVideo(team.video)
  }
}

function migrateVersion(version) {
  return {
    ...version,
    phase1: {
      ...version.phase1,
      bosses: version.phase1.bosses.map(migratePhase1Boss)
    },
    phase2: {
      ...version.phase2,
      video: migrateVideo(version.phase2.video),
      teams: Object.fromEntries(
        Object.entries(version.phase2.teams).map(([key, team]) => [
          key,
          migratePhase2Team(team)
        ])
      )
    }
  }
}

function migrateRaidData(data) {
  return Object.fromEntries(
    Object.entries(data).map(([versionKey, version]) => [
      versionKey,
      migrateVersion(version)
    ])
  )
}

// Get all raid directories
const raidDirs = fs.readdirSync(raidsDir).filter(dir => {
  const fullPath = path.join(raidsDir, dir)
  return fs.statSync(fullPath).isDirectory() && !dir.startsWith('_')
})

console.log(`Found ${raidDirs.length} raids to migrate:`)
raidDirs.forEach(dir => console.log(`  - ${dir}`))
console.log('')

let migratedCount = 0
let errorCount = 0

raidDirs.forEach(raidSlug => {
  const dataPath = path.join(raidsDir, raidSlug, 'data.json')

  if (!fs.existsSync(dataPath)) {
    console.log(`⚠️  ${raidSlug}: No data.json found, skipping`)
    return
  }

  try {
    const rawData = fs.readFileSync(dataPath, 'utf-8')
    const data = JSON.parse(rawData)

    const migratedData = migrateRaidData(data)

    // Write back with pretty formatting
    fs.writeFileSync(dataPath, JSON.stringify(migratedData, null, 2) + '\n')

    console.log(`✅ ${raidSlug}: Migrated successfully`)
    migratedCount++
  } catch (error) {
    console.log(`❌ ${raidSlug}: Error - ${error.message}`)
    errorCount++
  }
})

console.log('')
console.log(`Migration complete: ${migratedCount} successful, ${errorCount} errors`)
