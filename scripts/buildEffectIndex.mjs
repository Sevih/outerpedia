// scripts/buildEffectIndex.mjs
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')

// ⚙️ chemins (tels que tu les as décrits)
const BUFFS_PATH   = path.join(ROOT, 'src', 'data', 'buffs.json')
const DEBUFFS_PATH = path.join(ROOT, 'src', 'data', 'debuffs.json')
const INDEX_PATH   = path.join(ROOT, 'src', 'data', 'effectsIndex.json')

function exists(p) { try { return fs.existsSync(p) } catch { return false } }
function readJSON(p, fallback) { try { return JSON.parse(fs.readFileSync(p, 'utf8')) } catch { return fallback } }
function unique(arr) { return Array.from(new Set(arr)) }
function nextId(rec) { const vals = Object.values(rec); const max = vals.length ? Math.max(...vals) : 0; return max + 1 }
function sortById(rec) { return Object.fromEntries(Object.entries(rec).sort((a,b) => a[1]-b[1])) }

function extractNames(list, kind) {
  if (!Array.isArray(list)) {
    console.warn(`[effects-index] ⚠ ${kind}.json n'est pas un array, on ignore.`)
    return []
  }
  const names = list
    .map(x => (x && typeof x === 'object' ? String(x.name ?? '').trim() : ''))
    .filter(Boolean)
  // petit check doublons dans la source
  const dups = names.filter((n, i) => names.indexOf(n) !== i)
  if (dups.length) {
    console.warn(`[effects-index] ⚠ Doublons détectés dans ${kind}.json: ${unique(dups).join(', ')}`)
  }
  return unique(names)
}

function main() {
  if (!exists(BUFFS_PATH) || !exists(DEBUFFS_PATH)) {
    console.error('[effects-index] ❌ buffs.json ou debuffs.json introuvable.')
    console.error('  Buffs   :', BUFFS_PATH)
    console.error('  Debuffs :', DEBUFFS_PATH)
    process.exit(1)
  }

  const buffsData   = readJSON(BUFFS_PATH, [])
  const debuffsData = readJSON(DEBUFFS_PATH, [])

  const buffKeys   = extractNames(buffsData, 'buffs')
  const debuffKeys = extractNames(debuffsData, 'debuffs')

  console.log(`[effects-index] Buff keys: ${buffKeys.length}, Debuff keys: ${debuffKeys.length}`)

  // Lis l'index existant pour préserver la stabilité
  const idx = readJSON(INDEX_PATH, { buffs: {}, debuffs: {} })

  let changed = false
  for (const k of buffKeys) {
    if (!(k in idx.buffs)) { idx.buffs[k] = nextId(idx.buffs); changed = true }
  }
  for (const k of debuffKeys) {
    if (!(k in idx.debuffs)) { idx.debuffs[k] = nextId(idx.debuffs); changed = true }
  }

  // ⚠ On NE SUPPRIME JAMAIS les anciennes clés → liens stables

  if (changed) {
    const out = { buffs: sortById(idx.buffs), debuffs: sortById(idx.debuffs) }
    fs.mkdirSync(path.dirname(INDEX_PATH), { recursive: true })
    fs.writeFileSync(INDEX_PATH, JSON.stringify(out, null, 2), 'utf8')
    console.log('[effectsIndex.json] ✅ updated')
  } else {
    console.log('[effectsIndex.json] up-to-date (no new effects)')
  }
}

main()
