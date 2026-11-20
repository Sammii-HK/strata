import { PACK } from '../data/pack_star_stories'
import type { StrataConfig, StrataItem, Lane } from '../engine/strata'

// Star Stories: one line per star or constellation, each telling placed at the
// year that culture's version was first recorded. Reading along a line shows
// the same stars renamed and re-mythologised across four thousand years.

const LANES: Lane[] = [
  { id: 'orion', name: 'Orion', color: '#4C82C3' },
  { id: 'pleiades', name: 'The Pleiades', color: '#E8B84B' },
  { id: 'ursaMajor', name: 'Ursa Major / Big Dipper', color: '#6C6CE8' },
  { id: 'sirius', name: 'Sirius', color: '#D7494C' },
  { id: 'scorpius', name: 'Scorpius', color: '#2FA98C' },
]

const byId = new Map(PACK.map((s) => [s.id, s]))

const items: StrataItem[] = PACK.map((s) => ({
  id: s.id,
  label: s.label,
  pos: s.pos,
  lane: s.lane,
  sub: s.culture,
  importance: s.importance,
  fuzzy: s.fuzzy,
  note: `${s.story}\n\n${s.dateNote}`,
}))

function fmtYear(y: number) {
  const r = Math.round(y)
  if (r < 0) return `${Math.abs(r).toLocaleString()} BC`
  if (r < 1000) return `AD ${r}`
  return String(r)
}

function fmtSpan(y: number) {
  const a = Math.abs(Math.round(y))
  if (a >= 1000) return `${a.toLocaleString()} years`
  return `${a} year${a === 1 ? '' : 's'}`
}

const laneName = (id: string) => LANES.find((l) => l.id === id)?.name ?? id

function compare(a: StrataItem, b: StrataItem): string[] {
  const early = a.pos <= b.pos ? a : b
  const late = a.pos <= b.pos ? b : a
  const gap = late.pos - early.pos
  const ce = byId.get(early.id)?.culture ?? ''
  const cl = byId.get(late.id)?.culture ?? ''
  const out: string[] = []
  if (early.lane === late.lane) {
    out.push(`The same stars, two stories: ${ce} sky-watchers saw ${early.label}; ${fmtSpan(gap)} later, ${cl} tellers saw ${late.label}.`)
  } else {
    out.push(`${fmtSpan(gap)} separate the ${ce} story of ${laneName(early.lane)} and the ${cl} story of ${laneName(late.lane)}.`)
  }
  const nowToLate = 2026 - late.pos
  if (nowToLate > 0 && gap > nowToLate) out.push(`${late.label} is closer to today than to ${early.label}.`)
  if (early.fuzzy || late.fuzzy) out.push('Dates mark the earliest surviving record of a telling; most of these stories were told aloud long before anyone wrote them down.')
  return out.slice(0, 3)
}

export const starStoriesConfig: StrataConfig = {
  id: 'starstories',
  name: 'Star Stories',
  tagline: 'One star, retold across history',
  scale: 'linear',
  axis: {
    kind: 'time',
    format: fmtYear,
    ticks: [-3000, -2500, -2000, -1500, -1000, -500, 0, 500, 1000, 1500, 1800],
    domain: [-3000, 1900],
  },
  lanes: LANES,
  items,
  compare,
  scrubberLabel: 'Meanwhile',
  formatSpan: fmtSpan,
  lodImp4K: 0,
  hint: 'pinch to zoom · drag to travel · tap any telling, tap a second to compare two cultures',
}
