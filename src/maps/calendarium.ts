// Calendarium: calendar systems positioned by the year each was introduced,
// formally adopted or reformed. Hand-researched (Britannica, Wikipedia and
// scholarly secondary sources per entry), from feat/strata-pack-calendarium.

import { PACK as CALENDARIUM } from '../data/pack_calendarium'
import type { StrataConfig, StrataItem, Lane } from '../engine/strata'

const LANES: Lane[] = [
  { id: 'solarSolarized', name: 'Solar & solarised reforms', color: '#E8B84B' },
  { id: 'lunisolar', name: 'Lunisolar', color: '#2FA98C' },
  { id: 'lunar', name: 'Lunar', color: '#C56BD6' },
  { id: 'mesoamerican', name: 'Mesoamerican', color: '#D7494C' },
  { id: 'revolutionary', name: 'Revolutionary & utopian', color: '#6C6CE8' },
  { id: 'technical', name: 'Technical & scientific', color: '#8C8C99' },
]

const laneName = (id: string) => (LANES.find((l) => l.id === id)?.name ?? id).toLowerCase()

function fmtYear(y: number) {
  const r = Math.round(y)
  if (r < 0) return `${Math.abs(r).toLocaleString()} BCE`
  return `${r} CE`
}

function fmtSpan(y: number) {
  const a = Math.abs(Math.round(y))
  if (a >= 1000) return `${(a / 1000).toFixed(a % 1000 === 0 ? 0 : 1)}k years`
  return `${a} year${a === 1 ? '' : 's'}`
}

const items: StrataItem[] = CALENDARIUM.map((c) => ({
  id: c.id,
  label: c.title,
  pos: c.year,
  end: c.endYear,
  lane: c.lane,
  importance: c.importance,
  domain: 'calendars',
  fuzzy: c.fuzzy,
  note: `${c.note}\n\nCredited to: ${c.creator}.`,
}))

function compare(a: StrataItem, b: StrataItem): string[] {
  const early = a.pos <= b.pos ? a : b
  const late = a.pos <= b.pos ? b : a
  const gap = late.pos - early.pos
  const out: string[] = [`${fmtSpan(gap)} separate the introduction of "${early.label}" from "${late.label}".`]

  if (early.lane !== late.lane) {
    out.push(`"${early.label}" sits on the ${laneName(early.lane)} line and "${late.label}" on the ${laneName(late.lane)} line: two different answers to fitting days, moons and years together.`)
  }

  const nowToLate = 2026 - late.pos
  if (nowToLate > 0 && gap > nowToLate) {
    out.push(`"${late.label}" is closer to today than it is to "${early.label}".`)
  }

  if (a.fuzzy || b.fuzzy) {
    const fuzzyItems = [a.fuzzy ? a.label : null, b.fuzzy ? b.label : null].filter(Boolean)
    out.push(`${fuzzyItems.join(' and ')} ${fuzzyItems.length > 1 ? 'rest' : 'rests'} on scholarly best-estimates or traditional attribution rather than a firmly attested founding date.`)
  }

  return out.slice(0, 3)
}

export const calendariumConfig: StrataConfig = {
  id: 'calendarium',
  name: 'Calendarium',
  tagline: 'Every calendar humanity has kept time by',
  scale: 'linear',
  // Open framed on the classical-to-modern reform window (where most named,
  // datable reforms cluster), pinch out to the Egyptian civil calendar and
  // the Maya Long Count's mythological epoch.
  axis: { kind: 'time', format: fmtYear, ticks: [-3114, -2500, -1000, -450, -45, 0, 500, 638, 1000, 1582, 1793, 1925, 1988], frame: [-500, 2026], domain: [-3200, 2030] },
  lanes: LANES,
  items,
  compare,
  scrubberLabel: 'Same era',
  formatSpan: fmtSpan,
  lodImp4K: 0, // content-rich: show every calendar from the start
  hint: 'pinch to zoom · drag to travel · tap any calendar, tap a second to compare their reforms',
}
