import { EVENTS } from '../data/events'
import { PACK as HIST_EU } from '../data/pack_history_europe'
import { PACK as HIST_WORLD } from '../data/pack_history_world'
import { PACK as HIST_IDEAS } from '../data/pack_history_ideas'
import { THREADS } from '../data/threads'
import type { StrataConfig, StrataItem, Lane } from '../engine/strata'

const LANES: Lane[] = THREADS.map((t) => ({ id: t.id, name: t.name, color: t.color }))

const ALL = [...EVENTS, ...HIST_EU, ...HIST_WORLD, ...HIST_IDEAS]
const items: StrataItem[] = ALL.map((e) => ({
  id: e.id,
  label: e.title,
  pos: e.year,
  end: e.endYear,
  lane: e.thread,
  sub: e.sub,
  importance: e.importance as 1 | 2 | 3 | 4,
  fuzzy: e.fuzzy,
  note: e.note,
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
  const lifetimes = gap / 72
  if (lifetimes >= 1.5) out.push(`That is about ${Math.round(lifetimes)} human lifetimes, end to end.`)
  const nowToLate = 2025 - late.pos
  if (nowToLate > 0 && gap > nowToLate) out.push(`${late.label} is closer to today than to ${early.label}.`)
  return out.slice(0, 3)
}

export const historyConfig: StrataConfig = {
  id: 'history',
  name: 'History',
  tagline: 'a tube map of recorded history',
  scale: 'linear',
  // Open framed on the classical-to-modern window (the densest, most relatable
  // stretch); pinch out for deep antiquity.
  axis: { kind: 'time', format: fmtYear, ticks: [-3000, -2000, -1000, -500, 0, 500, 1000, 1500, 1800, 1900, 1950, 2000], frame: [-800, 2030] },
  lanes: LANES,
  // No sub-lane fan for now: regions are stacked lanes over the same time range,
  // so the cosmos-style position-aware fan doesn't apply. Countries live in the
  // readout + Meanwhile cross-section. (Region->country fan is a later feature.)
  items,
  compare,
  scrubberLabel: 'Meanwhile',
  formatSpan: fmtSpan,
  hint: 'pinch to zoom · drag to travel · tap any event, tap a second to measure the years between',
}
