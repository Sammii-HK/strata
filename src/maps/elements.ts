import { PACK } from '../data/pack_elements'
import type { StrataConfig, StrataItem, Lane } from '../engine/strata'

// Elements pack: the axis is discovery year (when each element was first
// recognised as a distinct substance), lanes are periodic-table categories.
// Source: element-stories-ios (elements.json), 70 elements, IUPAC + Royal
// Society of Chemistry + Mary Elvira Weeks sourced discovery stories.

const LANES: Lane[] = [
  { id: 'nonmetals', name: 'Nonmetals', color: '#4C82C3' },
  { id: 'nobleGases', name: 'Noble gases', color: '#6C6CE8' },
  { id: 'alkaliMetals', name: 'Alkali metals', color: '#D7494C' },
  { id: 'alkalineEarth', name: 'Alkaline earth metals', color: '#E07A3E' },
  { id: 'transitionMetals', name: 'Transition metals', color: '#E8B84B' },
  { id: 'postTransition', name: 'Post-transition metals', color: '#2FA98C' },
  { id: 'metalloids', name: 'Metalloids', color: '#C56BD6' },
  { id: 'halogens', name: 'Halogens', color: '#59C3D6' },
  { id: 'lanthanides', name: 'Lanthanides', color: '#9C8AE0' },
]

const items: StrataItem[] = PACK.map((e) => ({
  id: e.id,
  label: `${e.name} (${e.symbol})`,
  pos: e.year,
  lane: e.lane,
  // The source ranks familiarity 4 (hydrogen, iron) down to 1 (the rarer
  // lanthanides); Strata's importance runs the other way (1 = headline).
  importance: (5 - e.importance) as StrataItem['importance'],
  fuzzy: e.fuzzy,
  note: [e.discoverer ? `Isolated by ${e.discoverer}.` : 'Known since antiquity.', e.etymology, e.note].filter(Boolean).join(' '),
}))

function fmtYear(y: number) {
  const r = Math.round(y)
  if (r < 0) return `${Math.abs(r).toLocaleString()} BC`
  return `AD ${r}`
}

function fmtSpan(y: number) {
  const a = Math.abs(Math.round(y))
  if (a >= 1000) return `${a.toLocaleString()} years`
  return `${a} year${a === 1 ? '' : 's'}`
}

// Elements sharing a discoverer make a good surprise: the same person or team
// often turns up again a decade or a continent away.
function sharedDiscoverer(a: string, b: string): string | null {
  const namesOf = (s: string) => s.split(/,| and /).map((n) => n.trim()).filter(Boolean)
  const as = namesOf(a)
  const bs = namesOf(b)
  for (const name of as) if (bs.includes(name)) return name
  return null
}

function compare(a: StrataItem, b: StrataItem): string[] {
  const ea = PACK.find((p) => p.id === a.id)
  const eb = PACK.find((p) => p.id === b.id)
  const early = a.pos <= b.pos ? a : b
  const late = a.pos <= b.pos ? b : a
  const eEarly = a.pos <= b.pos ? ea : eb
  const eLate = a.pos <= b.pos ? eb : ea
  const gap = late.pos - early.pos
  const out: string[] = []

  if (eEarly?.discoverer && eLate?.discoverer) {
    const shared = sharedDiscoverer(eEarly.discoverer, eLate.discoverer)
    if (shared) {
      out.push(`${shared} had a hand in isolating both ${early.label} and ${late.label}${gap > 0 ? `, ${fmtSpan(gap)} apart` : ''}.`)
    }
  }
  if (out.length === 0) {
    out.push(`${fmtSpan(gap)} separate the discovery of ${early.label} and ${late.label}.`)
  }
  const nowToLate = 2025 - late.pos
  if (nowToLate > 0 && gap > nowToLate) {
    out.push(`${late.label} is closer to today than it is to ${early.label}.`)
  } else if (gap > 0) {
    const lifetimes = gap / 72
    if (lifetimes >= 1.5) out.push(`That is roughly ${Math.round(lifetimes)} human lifetimes apart on the periodic table's timeline.`)
  }
  if (eEarly?.fuzzy) {
    out.push(`${early.label} has no real discovery date: it was already known before written chemistry began.`)
  }
  return out.slice(0, 3)
}

export const elementsConfig: StrataConfig = {
  id: 'elements',
  name: 'Elements',
  tagline: 'The periodic table, one discovery at a time',
  scale: 'linear',
  // Open framed on the 1700-1950 window where most of the table was filled in;
  // pinch out to reach the antiquity metals known since the Bronze Age.
  axis: { kind: 'time', format: fmtYear, ticks: [-9000, -3000, -1000, 0, 1700, 1750, 1800, 1830, 1860, 1890, 1920, 1945], frame: [1600, 1960], domain: [-9500, 1960] },
  lanes: LANES,
  items,
  compare,
  scrubberLabel: 'Same decade',
  formatSpan: fmtSpan,
  lodImp4K: 0, // content-rich: show every element from the start
  hint: 'pinch to zoom · drag to travel through discovery history · tap any element, tap a second to compare',
}
