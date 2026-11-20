import { PACK } from '../data/pack_lunar_almanac'
import type { StrataConfig, StrataItem, Lane } from '../engine/strata'

// Lunar Almanac: real missions and historically observed eclipses on a plain
// year axis, mined from the lunar-almanac-ios app's curated dataset (NASA
// NSSDCA, national space agency press releases, NASA's eclipse pages).
// Same linear time axis convention as History (negative = BCE) so the two
// packs read consistently if ever shown side by side.

const LANES: Lane[] = [
  { id: 'missions', name: 'Missions', color: '#8A93A2' },
  { id: 'eclipses', name: 'Eclipses', color: '#C56BD6' },
]

// Fan the missions lane open into the countries that flew them; eclipses fan
// into their type (solar/lunar, total/partial/annular/penumbral).
const MISSION_COUNTRIES = ['United States', 'Soviet Union', 'China', 'India']
const ECLIPSE_TYPES = ['Solar total', 'Solar annular', 'Solar partial', 'Lunar total', 'Lunar partial', 'Lunar penumbral']

const items: StrataItem[] = PACK.map((o) => ({
  id: o.id,
  label: o.name,
  pos: o.year,
  lane: o.category,
  sub: o.sub,
  importance: o.importance,
  note: o.note,
}))

function fmtYear(y: number) {
  const r = Math.round(y)
  if (r < 0) return `${Math.abs(r).toLocaleString()} BC`
  if (r < 1000) return `AD ${r}`
  return r.toLocaleString()
}

function fmtSpan(y: number) {
  const a = Math.abs(Math.round(y))
  if (a >= 1000) return `${a.toLocaleString()} years`
  return `${a} year${a === 1 ? '' : 's'}`
}

function compare(a: StrataItem, b: StrataItem): string[] {
  const early = a.pos <= b.pos ? a : b
  const late = a.pos <= b.pos ? b : a
  const gap = late.pos - early.pos
  const out: string[] = [`${fmtSpan(gap)} separate ${early.label} and ${late.label}.`]
  if (early.sub && early.sub === late.sub) {
    out.push(early.lane === 'missions'
      ? `Both flew for ${early.sub}, ${fmtSpan(gap)} apart in the same programme's history.`
      : `Both were ${early.sub.toLowerCase()} eclipses, ${fmtSpan(gap)} apart.`)
  }
  const nowToLate = 2026 - late.pos
  if (nowToLate > 0 && gap > nowToLate) out.push(`${late.label} is closer to today than to ${early.label}.`)
  return out.slice(0, 3)
}

export const lunarConfig: StrataConfig = {
  id: 'lunar',
  name: 'Lunar Almanac',
  tagline: 'Missions and eclipses across the space age',
  scale: 'linear',
  // Open framed on the Space Race through today, the densest run of missions;
  // pinch out to reach the Eclipse of Thales in 584 BC.
  axis: { kind: 'time', format: fmtYear, ticks: [-600, 0, 1500, 1900, 1960, 1970, 1980, 1990, 2000, 2010, 2020, 2025], frame: [1955, 2026], domain: [-600, 2026] },
  lanes: LANES,
  fanLanes: ['missions', 'eclipses'],
  fanPrimary: [...MISSION_COUNTRIES, ...ECLIPSE_TYPES],
  items,
  compare,
  scrubberLabel: 'Meanwhile',
  formatSpan: fmtSpan,
  lodImp4K: 0, // content-rich starter pack: show every item from the start
  hint: 'pinch to zoom · drag to travel · tap any mission or eclipse, tap a second to measure the years between',
}
