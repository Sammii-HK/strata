import { ITEMS } from '../data/pack_geode'
import type { StrataConfig, StrataItem, Lane } from '../engine/strata'

const LANES: Lane[] = [
  { id: "gemstones", name: "Precious & Semi-Precious Gems", color: "#E07A3E" },
  { id: "ornamentalStones", name: "Ornamental & Carving Stones", color: "#4C82C3" },
  { id: "pigmentMinerals", name: "Pigment & Cosmetic Minerals", color: "#5AA84F" },
  { id: "toolMinerals", name: "Tool & Utility Minerals", color: "#E0699A" },
  { id: "organicGems", name: "Organic Gem Materials", color: "#C99A2E" },
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

export const geodeConfig: StrataConfig = {
  id: "geode",
  name: "Geode",
  tagline: "Crystals and minerals, mined through history",
  scale: 'linear',
  axis: {
    kind: 'time',
    format: fmtYear,
    ticks: [-70000, -60000, -50000, -40000, -30000, -20000, -10000, 0],
    frame: [-76547, 3428],
    domain: [-78075, 4956],
  },
  lanes: LANES,
  items: ITEMS,
  compare,
  scrubberLabel: 'Meanwhile',
  formatSpan: fmtSpan,
  lodImp4K: 0,
  hint: 'pinch to zoom · drag to travel · tap any item, tap a second to measure the years between',
}
