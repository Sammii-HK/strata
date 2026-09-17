import { ITEMS } from '../data/pack_blazon'
import type { StrataConfig, StrataItem, Lane } from '../engine/strata'

const LANES: Lane[] = [
  { id: "british-isles", name: "British Isles", color: "#E07A3E" },
  { id: "france", name: "France", color: "#4C82C3" },
  { id: "iberia", name: "Iberia", color: "#5AA84F" },
  { id: "central-europe", name: "Central Europe & the Alps", color: "#E0699A" },
  { id: "papacy", name: "The Papacy", color: "#C99A2E" },
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

export const blazonConfig: StrataConfig = {
  id: "blazon",
  name: "Blazon",
  tagline: "Coats of arms, and the moments they were adopted",
  scale: 'linear',
  axis: {
    kind: 'time',
    format: fmtYear,
    ticks: [1200, 1250, 1300, 1350, 1400, 1450, 1500],
    frame: [1155, 1516],
    domain: [1121, 1550],
  },
  lanes: LANES,
  items: ITEMS,
  compare,
  scrubberLabel: 'Meanwhile',
  formatSpan: fmtSpan,
  lodImp4K: 0,
  hint: 'pinch to zoom · drag to travel · tap any item, tap a second to measure the years between',
}
