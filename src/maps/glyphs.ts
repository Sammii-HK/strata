import { PACK as GLYPHS } from '../data/pack_glyphs'
import { SCRIPT_TYPES } from '../data/scriptTypes'
import type { StrataConfig, StrataItem, Lane } from '../engine/strata'
import type { GlyphScript } from '../data/scriptTypes'

const LANES: Lane[] = SCRIPT_TYPES.map((t) => ({ id: t.id, name: t.name, color: t.color }))

// Regions, in a sensible west-to-east / old-to-new browsing order, shown first
// in the sub-lane fan before the rest (mirrors Cosmos's zodiac-first pattern).
const FEATURED_REGIONS = [
  'Mesopotamia',
  'Egypt',
  'Levant',
  'Aegean',
  'Anatolia',
  'Arabia',
  'Near East',
  'Iran',
  'South Asia',
  'Inner Asia',
  'Mongolia and Inner Asia',
  'Northeast Asia',
  'China',
  'Mainland Southeast Asia',
  'Korea',
  'Mesoamerica',
  'North America',
  'Rapa Nui',
  'Northern Europe',
  'Ireland and Britain',
  'Italy',
  'Iberian Peninsula',
  'Eastern Europe and Eurasia',
  'North Africa',
  'Horn of Africa',
  'West Africa',
  'Cameroon',
]

function decipherLine(g: GlyphScript): string {
  const d = g.decipherment
  if (d.status === 'undeciphered') return 'Still undeciphered.'
  if (d.status === 'partial') return 'Only partly deciphered.'
  if (d.year && d.decipherer) return `Deciphered in ${d.year} by ${d.decipherer}.`
  return ''
}

const byId: Record<string, GlyphScript> = Object.fromEntries(GLYPHS.map((g) => [g.id, g]))

const items: StrataItem[] = GLYPHS.map((g) => ({
  id: g.id,
  label: g.name,
  pos: g.year,
  end: g.endYear,
  lane: g.lane,
  sub: g.sub,
  // The source marks its iconic scripts 4; Strata's headline tier is 1.
  importance: g.importance === 4 ? 1 : g.importance,
  domain: g.decipherment.status,
  fuzzy: g.fuzzy,
  note: decipherLine(g) ? `${g.origin}\n\n${decipherLine(g)}` : g.origin,
}))

function fmtYear(y: number) {
  const r = Math.round(y)
  if (r < 0) return `${Math.abs(r).toLocaleString()} BCE`
  if (r < 1000) return `${r} CE`
  return r.toLocaleString()
}

function fmtSpan(y: number) {
  const a = Math.abs(Math.round(y))
  if (a >= 1000) return `${a.toLocaleString()} years`
  return `${a} year${a === 1 ? '' : 's'}`
}

const NOW = 2025

function compare(a: StrataItem, b: StrataItem): string[] {
  const early = a.pos <= b.pos ? a : b
  const late = a.pos <= b.pos ? b : a
  const gap = late.pos - early.pos
  const ga = byId[early.id]
  const gb = byId[late.id]
  const out: string[] = [`${fmtSpan(gap)} separate the first marks of ${early.label} from the first marks of ${late.label}.`]

  // The signature "wait, that can't be right" line: is the later script closer
  // to today than to the earlier one?
  const nowToLate = NOW - late.pos
  if (nowToLate > 0 && gap > nowToLate) {
    out.push(`${late.label} is closer to today than it is to the first ${early.label} inscriptions.`)
  }

  // Decipherment-year drama: a script "read again" centuries after a younger
  // script was already cracked, or one still unread while a far older one
  // has been legible for generations.
  if (ga && gb) {
    if (ga.decipherment.status === 'deciphered' && gb.decipherment.status === 'deciphered' && ga.decipherment.year && gb.decipherment.year) {
      const decGap = Math.abs(ga.decipherment.year - gb.decipherment.year)
      if (decGap >= 40) {
        const firstDeciphered = ga.decipherment.year! <= gb.decipherment.year! ? ga : gb
        const secondDeciphered = firstDeciphered === ga ? gb : ga
        out.push(
          `${secondDeciphered.name} waited ${decGap} more years to be read than ${firstDeciphered.name}, even though it is ${
            secondDeciphered.year <= firstDeciphered.year ? 'older' : 'younger'
          } on the timeline.`
        )
      }
    } else if (ga.decipherment.status === 'undeciphered' && gb.decipherment.status === 'deciphered' && gb.year < ga.year) {
      out.push(`${gb.name} was deciphered even though ${ga.name} is younger and still cannot be read.`)
    } else if (gb.decipherment.status === 'undeciphered' && ga.decipherment.status === 'deciphered' && ga.year < gb.year) {
      out.push(`${ga.name} was deciphered even though ${gb.name} is younger and still cannot be read.`)
    }
  }

  if (early.sub && early.sub === late.sub) {
    out.push(`Both emerged in ${early.sub}, ${fmtSpan(gap)} apart on the same patch of ground.`)
  }

  return out.slice(0, 3)
}

export const glyphsConfig: StrataConfig = {
  id: 'glyphs',
  name: 'Glyphs',
  tagline: 'Writing systems, read and unread',
  scale: 'linear',
  // Open framed on the classical-to-modern window (busiest with legible,
  // relatable scripts); pinch out for the deep antiquity of Sumer and Egypt.
  axis: { kind: 'time', format: fmtYear, ticks: [-3200, -2000, -1000, -500, 0, 500, 1000, 1500, 1800, 1900, 2000], frame: [-1200, 2025], domain: [-3300, 2025] },
  lanes: LANES,
  fanLanes: ['logographic', 'syllabic', 'abjad', 'abugida', 'alphabet', 'mixed'],
  fanPrimary: FEATURED_REGIONS,
  items,
  compare,
  scrubberLabel: 'Meanwhile',
  formatSpan: fmtSpan,
  lodImp4K: 0, // content-rich: show every script from the start (no star-density gating)
  hint: 'pinch to zoom · drag to travel · tap any script, tap a second to compare · zoom a script type open into its regions',
}
