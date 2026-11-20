import { ITEMS } from '../data/pack_mythline'
import type { StrataConfig, StrataItem, Lane } from '../engine/strata'

const LANES: Lane[] = [
  { id: "greek", name: "Greek", color: "#E07A3E" },
  { id: "norse", name: "Norse", color: "#4C82C3" },
  { id: "celtic", name: "Celtic", color: "#5AA84F" },
  { id: "egyptian", name: "Egyptian", color: "#E0699A" },
  { id: "hindu", name: "Hindu", color: "#C99A2E" },
  { id: "mesopotamian", name: "Mesopotamian", color: "#8A6DC4" },
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

export const mythlineConfig: StrataConfig = {
  id: "mythologies",
  name: "Mythologies",
  tagline: "Gods and heroes, dated to their first written record",
  scale: 'linear',
  axis: {
    kind: 'time',
    format: fmtYear,
    ticks: [-3000, -2500, -2000, -1500, -1000, -500, 0, 500, 1000],
    frame: [-3196, 1316],
    domain: [-3272, 1392],
  },
  lanes: LANES,
  items: ITEMS,
  compare,
  scrubberLabel: 'Meanwhile',
  formatSpan: fmtSpan,
  lodImp4K: 0,
  hint: 'pinch to zoom · drag to travel · tap any item, tap a second to measure the years between',
}
