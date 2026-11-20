import { ITEMS } from '../data/pack_balladry'
import type { StrataConfig, StrataItem, Lane } from '../engine/strata'

const LANES: Lane[] = [
  { id: "scotland-borders", name: "Scotland & the Borders", color: "#E07A3E" },
  { id: "england", name: "England", color: "#4C82C3" },
  { id: "appalachian-american", name: "Appalachian & American", color: "#5AA84F" },
  { id: "sea-songs", name: "Sea Songs", color: "#E0699A" },
]

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
  const nowToLate = 2025 - late.pos
  if (nowToLate > 0 && gap > nowToLate) out.push(`${late.label} is closer to today than to ${early.label}.`)
  return out.slice(0, 3)
}

export const balladryConfig: StrataConfig = {
  id: "balladry",
  name: "Balladry",
  tagline: "Folk ballads and sea songs, and the eras they were sung in",
  scale: 'linear',
  axis: {
    kind: 'time',
    format: fmtYear,
    ticks: [1400, 1450, 1500, 1550, 1600, 1650, 1700, 1750, 1800, 1850],
    frame: [1381, 1899],
    domain: [1350, 1930],
  },
  lanes: LANES,
  items: ITEMS,
  compare,
  scrubberLabel: 'Meanwhile',
  formatSpan: fmtSpan,
  lodImp4K: 0,
  hint: 'pinch to zoom · drag to travel · tap any item, tap a second to measure the years between',
}
