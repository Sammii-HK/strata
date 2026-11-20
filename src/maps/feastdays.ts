// Feast Days: the world's religious and cultural calendar on one year.
//
// Unlike Cosmos (distance) and History (elapsed years), this map's axis is
// cyclical: day-of-year, 1-366, for each festival's 2026 Gregorian occurrence.
// Position is where a feast falls on the annual wheel, not when it began.
// Content mined from the feast-days-ios source app (Resources/feast/*.json:
// 68 real entries, Encyclopedia Britannica + public-domain liturgical and
// cultural references), grouped into tradition lanes.

import { PACK as FEASTDAYS } from '../data/pack_feastdays'
import type { StrataConfig, StrataItem, Lane } from '../engine/strata'

const LANES: Lane[] = [
  { id: 'christian', name: 'Christian liturgical', color: '#D7494C' },
  { id: 'jewish', name: 'Jewish', color: '#4C82C3' },
  { id: 'islamic', name: 'Islamic', color: '#2FA98C' },
  { id: 'hindu', name: 'Hindu', color: '#E8B84B' },
  { id: 'buddhist', name: 'Buddhist', color: '#C56BD6' },
  { id: 'eastAsian', name: 'East Asian folk & lunar', color: '#E07A3E' },
  { id: 'seasonal', name: 'Seasonal & fire festivals', color: '#5AA84F' },
  { id: 'world', name: 'World & Indigenous', color: '#8A93A2' },
]

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTH_STARTS = [1, 32, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335] // day-of-year each month starts, 2026 (non-leap)

/** Format a day-of-year (1-366) as "17 Mar". */
function fmtDoy(doy: number): string {
  const d = Math.round(((doy - 1) % 366 + 366) % 366) + 1
  let m = 11
  for (let i = 0; i < 12; i++) {
    if (d < MONTH_STARTS[i]) { m = i - 1; break }
  }
  const day = d - MONTH_STARTS[m] + 1
  return `${day} ${MONTH_NAMES[m]}`
}

/** Shortest wrap-aware gap between two days-of-year, in days (0-183). */
function ringGap(a: number, b: number): number {
  const raw = Math.abs(a - b)
  return Math.min(raw, 366 - raw)
}

function fmtSpan(days: number): string {
  const d = Math.round(Math.abs(days))
  if (d === 0) return 'the same day'
  if (d === 1) return '1 day'
  if (d < 14) return `${d} days`
  if (d < 60) return `${Math.round(d / 7)} weeks`
  return `${Math.round(d / 30.44)} months`
}

const items: StrataItem[] = FEASTDAYS.map((f) => ({
  id: f.id,
  label: f.title,
  pos: f.doy,
  end: f.endDoy,
  lane: f.tradition,
  sub: f.region,
  importance: f.importance,
  domain: f.domain,
  fuzzy: f.fuzzy,
  note: f.note,
}))

function compare(a: StrataItem, b: StrataItem): string[] {
  const gap = ringGap(a.pos, b.pos)
  const sameTradition = a.lane === b.lane
  const out: string[] = []

  if (gap === 0) {
    out.push(sameTradition
      ? `${a.label} and ${b.label} fall on the very same day of the year.`
      : `${a.label} and ${b.label} land on the exact same day in 2026, despite belonging to entirely separate traditions.`)
  } else if (gap <= 3) {
    out.push(sameTradition
      ? `${a.label} and ${b.label} sit just ${fmtSpan(gap)} apart on the calendar.`
      : `${a.label} and ${b.label} come from unrelated traditions, yet land within ${fmtSpan(gap)} of each other in 2026.`)
  } else {
    out.push(`${fmtSpan(gap)} separate ${a.label} (${fmtDoy(a.pos)}) and ${b.label} (${fmtDoy(b.pos)}) on the 2026 calendar.`)
  }

  // Opposite-side-of-the-year framing, the ring's "wait, that can't be right" moment.
  if (gap > 150) {
    out.push(`They sit on almost opposite sides of the year, as far apart as two dates in a year can be.`)
  }

  if (a.fuzzy || b.fuzzy) {
    const movableItems = [a.fuzzy ? a.label : null, b.fuzzy ? b.label : null].filter(Boolean)
    const movable = movableItems.join(' and ')
    const verb = movableItems.length > 1 ? 'follow' : 'follows'
    out.push(`${movable} ${verb} a lunar or lunisolar calendar, so this gap shifts most years; 2026 is one snapshot.`)
  }

  return out.slice(0, 3)
}

export const feastdaysConfig: StrataConfig = {
  id: 'feastdays',
  name: 'Feast Days',
  tagline: "The world's festivals on one year",
  scale: 'linear',
  // The whole year is short enough to show at once; open framed on it and let
  // the ring itself (not a pinch-zoom window) be the discovery mechanic.
  axis: { kind: 'time', format: fmtDoy, ticks: [1, 32, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], frame: [1, 365], domain: [1, 365] },
  lanes: LANES,
  items,
  compare,
  scrubberLabel: 'Same week',
  formatSpan: fmtSpan,
  lodImp4K: 0, // content-rich: show every festival from the start
  hint: 'drag to travel the year · tap any feast, tap a second to see how the calendar lines them up',
}
