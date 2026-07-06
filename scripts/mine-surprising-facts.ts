// ============================================================
// Surprising-fact miner. Two distinct mining modes, because "surprising"
// means different things on different axes:
//
// --mode=gap (default, History or Cosmos): for three real points A -> B -> C
// in order along a scalar axis (year, or distance-from-Earth), is the gap
// from B to C much SMALLER than the gap from A to B? Exploits a real human
// intuition — "things far apart on the axis feel unrelated, things close
// together feel contemporary" — and finds where that intuition is wrong.
// This works well for TIME (year) because people carry a strong, violable
// prior about chronological distance. It works poorly for raw distance-
// from-Earth (see cosmos-gap output) because nobody has an equivalent prior
// about how far apart two named stars "should" be — there's nothing to
// violate, so results are technically true but not surprising.
//
// --mode=depth-illusion (Cosmos only): the actual working Cosmos surprise
// pattern, matching Strata's own shipped fact "a constellation is an
// illusion of depth" — take stars grouped in the same constellation (same
// `sub` field, a real visual/perceptual grouping people already hold an
// intuition about: "these are near each other, they're in the same
// picture in the sky") and find the pair with the LARGEST distanceLy gap.
// The surprise is the opposite shape from --mode=gap: big gap where
// intuition expects closeness, not small gap where intuition expects
// distance.
//
// Persistent dedup: pass --mark-seen to append every candidate shown in
// this run to .mined-facts-seen.json (gitignored-worthy, but left tracked
// here since it's small and meant to be shared across mining sessions).
// Future runs skip anything already in that file, so repeated runs of this
// script surface fresh material instead of the same top-N every time —
// the actual mechanism that makes this a renewable "farm" rather than a
// one-shot list.
//
// Usage:
//   npx tsx scripts/mine-surprising-facts.ts --mode=gap --map=History --min-ratio=2 --limit=40
//   npx tsx scripts/mine-surprising-facts.ts --mode=depth-illusion --min-ratio=5 --limit=40 --mark-seen

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { EVENTS } from '../src/data/events'
import { PACK as WORLD } from '../src/data/pack_history_world'
import { PACK as EUROPE } from '../src/data/pack_history_europe'
import { PACK as IDEAS } from '../src/data/pack_history_ideas'
import { COSMOS } from '../src/data/cosmos'
import { PACK as COSMOS_MAIN } from '../src/data/pack_cosmos'
import { PACK as COSMOS_STARS } from '../src/data/pack_cosmos_stars'
import { PACK as COSMOS_DEEP } from '../src/data/pack_cosmos_deep'
import { PACK as COSMOS_SOLAR } from '../src/data/pack_cosmos_solar'
import { PACK as COSMOS_CONST } from '../src/data/pack_cosmos_constellations'
import { PACK as COSMOS_CONST_N } from '../src/data/pack_cosmos_const_north'
import { PACK as COSMOS_CONST_S } from '../src/data/pack_cosmos_const_south'

interface FlatItem {
  id: string
  title: string
  value: number // year (History) or distanceLy (Cosmos)
  importance: number
  fuzzy?: boolean
  sourcePack: string
  map: 'History' | 'Cosmos'
  group?: string // constellation ('sub' field) — only used by depth-illusion mode
}

const args = process.argv.slice(2)
const mode = (args.find((a) => a.startsWith('--mode='))?.split('=')[1] ?? 'gap') as
  | 'gap'
  | 'depth-illusion'
const mapFilter = args.find((a) => a.startsWith('--map='))?.split('=')[1] as
  | 'History'
  | 'Cosmos'
  | undefined
const minRatio = Number(args.find((a) => a.startsWith('--min-ratio='))?.split('=')[1] ?? '2')
const limit = Number(args.find((a) => a.startsWith('--limit='))?.split('=')[1] ?? '40')
const markSeen = args.includes('--mark-seen')
const jsonOut = args.includes('--json')
const MAX_IMPORTANCE = 3 // constellation packs skew lower-importance than the main History packs; loosened so depth-illusion has enough to work with

const MIN_GAP_BC = Number(args.find((a) => a.startsWith('--min-gap-bc='))?.split('=')[1] ?? '15')
const MIN_GAP_AB = Number(args.find((a) => a.startsWith('--min-gap-ab='))?.split('=')[1] ?? '150')

const SEEN_PATH = join(__dirname, '.mined-facts-seen.json')
function loadSeen(): Set<string> {
  if (!existsSync(SEEN_PATH)) return new Set()
  try {
    return new Set(JSON.parse(readFileSync(SEEN_PATH, 'utf8')))
  } catch {
    return new Set()
  }
}
function saveSeen(keys: Set<string>) {
  writeFileSync(SEEN_PATH, JSON.stringify([...keys].sort(), null, 2))
}

function flattenHistory(pack: any[], sourcePack: string): FlatItem[] {
  return pack
    .filter((e) => e.importance <= MAX_IMPORTANCE && typeof e.year === 'number')
    .map((e) => ({
      id: e.id,
      title: e.title,
      value: e.year,
      importance: e.importance,
      fuzzy: e.fuzzy,
      sourcePack,
      map: 'History' as const,
    }))
}

function flattenCosmos(pack: any[], sourcePack: string): FlatItem[] {
  return pack
    .filter((e) => e.importance <= MAX_IMPORTANCE && typeof e.distanceLy === 'number')
    .map((e) => ({
      id: e.id,
      title: e.name,
      value: e.distanceLy,
      importance: e.importance,
      sourcePack,
      map: 'Cosmos' as const,
      group: e.sub,
    }))
}

const historyItems: FlatItem[] = [
  ...flattenHistory(EVENTS, 'events'),
  ...flattenHistory(WORLD, 'pack_history_world'),
  ...flattenHistory(EUROPE, 'pack_history_europe'),
  ...flattenHistory(IDEAS, 'pack_history_ideas'),
]

const cosmosItems: FlatItem[] = [
  ...flattenCosmos(COSMOS, 'cosmos'),
  ...flattenCosmos(COSMOS_MAIN, 'pack_cosmos'),
  ...flattenCosmos(COSMOS_STARS, 'pack_cosmos_stars'),
  ...flattenCosmos(COSMOS_DEEP, 'pack_cosmos_deep'),
  ...flattenCosmos(COSMOS_SOLAR, 'pack_cosmos_solar'),
]

const constellationItems: FlatItem[] = [
  ...flattenCosmos(COSMOS_CONST, 'pack_cosmos_constellations'),
  ...flattenCosmos(COSMOS_CONST_N, 'pack_cosmos_const_north'),
  ...flattenCosmos(COSMOS_CONST_S, 'pack_cosmos_const_south'),
].filter((i) => i.group) // only entries with real constellation membership

const CURRENT_YEAR = 2026
historyItems.push({
  id: 'now',
  title: 'Today',
  value: CURRENT_YEAR,
  importance: 1,
  sourcePack: 'synthetic',
  map: 'History',
})

interface GapCandidate {
  kind: 'gap'
  map: string
  a: FlatItem
  b: FlatItem
  c: FlatItem
  gapAB: number
  gapBC: number
  ratio: number
  key: string
  /** A handful of real, nearby events (by sorted position, excluding a/b/c)
   * so a rendered timeline has genuine surrounding texture instead of two
   * isolated dots on an empty line — matches the real app's populated feel. */
  context: FlatItem[]
}

interface IllusionCandidate {
  kind: 'illusion'
  group: string
  near: FlatItem
  far: FlatItem
  ratio: number
  key: string
}

function mineGap(items: FlatItem[], mapName: string): GapCandidate[] {
  const sorted = [...items].sort((x, y) => x.value - y.value)
  const out: GapCandidate[] = []
  for (let bi = 1; bi < sorted.length - 1; bi++) {
    const b = sorted[bi]
    for (let ai = Math.max(0, bi - 8); ai < bi; ai++) {
      const a = sorted[ai]
      const gapAB = b.value - a.value
      if (gapAB <= 0 || gapAB < MIN_GAP_AB) continue
      if (a.title === b.title) continue
      for (let ci = bi + 1; ci < Math.min(sorted.length, bi + 9); ci++) {
        const c = sorted[ci]
        const gapBC = c.value - b.value
        if (gapBC < MIN_GAP_BC) continue
        if (b.title === c.title || a.title === c.title) continue
        const ratio = gapAB / gapBC
        if (ratio >= minRatio) {
          // Nearby real events for timeline texture: a couple before `a`,
          // a couple between `b` and `c`, a couple after `c` — skip the
          // three featured points themselves.
          const excludeIds = new Set([a.id, b.id, c.id])
          const context = [
            ...sorted.slice(Math.max(0, ai - 2), ai),
            ...sorted.slice(bi + 1, ci).filter((x) => !excludeIds.has(x.id)),
            ...sorted.slice(ci + 1, ci + 3),
          ].filter((x) => !excludeIds.has(x.id))
          out.push({
            kind: 'gap', map: mapName, a, b, c, gapAB, gapBC, ratio,
            key: `gap:${mapName}:${a.id}:${b.id}`, context,
          })
        }
      }
    }
  }
  return out.sort((x, y) => y.ratio - x.ratio)
}

// Depth illusion: within each constellation group, find the pair with the
// largest ratio of far/near distanceLy. Requires at least 2 members with a
// meaningfully different distance (ratio >= minRatio) to be worth surfacing.
function mineDepthIllusion(items: FlatItem[]): IllusionCandidate[] {
  const byGroup = new Map<string, FlatItem[]>()
  for (const item of items) {
    if (!item.group) continue
    if (!byGroup.has(item.group)) byGroup.set(item.group, [])
    byGroup.get(item.group)!.push(item)
  }
  const out: IllusionCandidate[] = []
  for (const [group, members] of byGroup) {
    if (members.length < 2) continue
    const sorted = [...members].sort((x, y) => x.value - y.value)
    const near = sorted[0]
    const far = sorted[sorted.length - 1]
    if (near.id === far.id || near.value <= 0) continue
    const ratio = far.value / near.value
    if (ratio >= minRatio) {
      out.push({ kind: 'illusion', group, near, far, ratio, key: `illusion:${group}:${near.id}:${far.id}` })
    }
  }
  return out.sort((x, y) => y.ratio - x.ratio)
}

const seen = loadSeen()
let printed = 0
// Structured rows for --json consumers (e.g. the fact-bank agent) — one
// flat shape covering both modes, carrying only real verified numbers so a
// downstream script generator never has to (or is tempted to) re-derive or
// paraphrase the citation figures themselves.
const jsonRows: Record<string, unknown>[] = []

if (mode === 'gap') {
  const results: GapCandidate[] = []
  if (!mapFilter || mapFilter === 'History') results.push(...mineGap(historyItems, 'History'))
  if (!mapFilter || mapFilter === 'Cosmos') results.push(...mineGap(cosmosItems, 'Cosmos'))

  const seenAB = new Set<string>()
  const deduped: GapCandidate[] = []
  for (const cand of results.sort((x, y) => y.ratio - x.ratio)) {
    if (seenAB.has(cand.key) || seen.has(cand.key)) continue
    seenAB.add(cand.key)
    deduped.push(cand)
  }

  if (!jsonOut) {
    console.log(
      `[gap mode] Mined ${results.length} raw candidates, ${deduped.length} after dedup + seen-filter. Top ${Math.min(limit, deduped.length)}:\n`,
    )
  }
  for (const cand of deduped.slice(0, limit)) {
    const unit = cand.map === 'History' ? 'yr' : 'ly'
    const fuzzy = Boolean(cand.a.fuzzy || cand.b.fuzzy)
    if (jsonOut) {
      jsonRows.push({
        kind: 'gap',
        map: cand.map,
        key: cand.key,
        ratio: Number(cand.ratio.toFixed(2)),
        unit,
        fuzzy,
        near: { id: cand.b.id, title: cand.b.title, value: cand.b.value, sourcePack: cand.b.sourcePack },
        anchor: { id: cand.c.id, title: cand.c.title, value: cand.c.value, sourcePack: cand.c.sourcePack },
        far: { id: cand.a.id, title: cand.a.title, value: cand.a.value, sourcePack: cand.a.sourcePack },
        gapNearToAnchor: Number(cand.gapBC.toFixed(4)),
        gapFarToNear: Number(cand.gapAB.toFixed(4)),
        context: cand.context.map((x) => ({ id: x.id, title: x.title, value: x.value })),
      })
    } else {
      const fuzzyFlag = fuzzy ? ' [fuzzy date(s) - verify before shipping]' : ''
      console.log(
        `[${cand.map}] ratio ${cand.ratio.toFixed(1)}x — "${cand.b.title}" is closer to "${cand.c.title}" ` +
          `(${cand.gapBC.toFixed(cand.map === 'Cosmos' ? 4 : 0)}${unit}) than to "${cand.a.title}" ` +
          `(${cand.gapAB.toFixed(cand.map === 'Cosmos' ? 4 : 0)}${unit})${fuzzyFlag}`,
      )
    }
    seen.add(cand.key)
    printed++
  }
} else {
  const results = mineDepthIllusion(constellationItems).filter((c) => !seen.has(c.key))
  if (!jsonOut) {
    console.log(`[depth-illusion mode] ${results.length} constellation candidates after seen-filter. Top ${Math.min(limit, results.length)}:\n`)
  }
  for (const cand of results.slice(0, limit)) {
    if (jsonOut) {
      jsonRows.push({
        kind: 'depth-illusion',
        map: 'Cosmos',
        key: cand.key,
        ratio: Number(cand.ratio.toFixed(2)),
        unit: 'ly',
        fuzzy: false,
        group: cand.group,
        near: { id: cand.near.id, title: cand.near.title, value: cand.near.value },
        far: { id: cand.far.id, title: cand.far.title, value: cand.far.value },
        gapLy: Number((cand.far.value - cand.near.value).toFixed(2)),
      })
    } else {
      console.log(
        `[${cand.group}] ratio ${cand.ratio.toFixed(1)}x — "${cand.near.title}" (${cand.near.value.toFixed(1)}ly) and ` +
          `"${cand.far.title}" (${cand.far.value.toFixed(1)}ly) look like part of the same constellation but are ` +
          `${(cand.far.value - cand.near.value).toFixed(1)}ly apart in reality`,
      )
    }
    seen.add(cand.key)
    printed++
  }
}

if (jsonOut) {
  // Only the data rows go to stdout as JSON — everything else (this
  // script's own progress logging) goes to stderr so a subprocess caller
  // gets clean, parseable stdout.
  console.error(`[mine-surprising-facts] ${printed} row(s), mode=${mode}${mapFilter ? ` map=${mapFilter}` : ''}`)
  process.stdout.write(JSON.stringify(jsonRows, null, 2) + '\n')
} else if (!markSeen) {
  console.log(`\n(${printed} candidates would be marked seen with --mark-seen once you're happy with them.)`)
}

if (markSeen) {
  saveSeen(seen)
  if (jsonOut) console.error(`Marked ${printed} candidates as seen (${SEEN_PATH}).`)
  else console.log(`Marked ${printed} candidates as seen — future runs will skip them (${SEEN_PATH}).`)
}
