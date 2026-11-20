import { PACK, EVO_LANES } from '../data/pack_evolution'
import type { StrataConfig, StrataItem, Lane } from '../engine/strata'

const LANES: Lane[] = EVO_LANES.map((l) => ({ id: l.id, name: l.name, color: l.color }))

// pos = -mya so, like History's BC years, earlier sits left and today is 0 on
// the right. Spans (`end`) convert the same way.
const items: StrataItem[] = PACK.map((e) => ({
  id: e.id,
  label: e.title,
  pos: -e.mya,
  end: e.end != null ? -e.end : undefined,
  lane: e.lane,
  sub: e.sub,
  importance: e.importance,
  domain: e.domain,
  fuzzy: e.fuzzy,
  note: e.note,
}))

/** Format a position (negative = million years ago) for ticks and readouts. */
function fmtAgo(pos: number): string {
  const mya = Math.abs(pos)
  if (mya === 0) return 'today'
  if (mya >= 1000) {
    const bil = mya / 1000
    return `${bil % 1 === 0 ? bil : bil.toFixed(1)} billion yrs ago`
  }
  if (mya >= 1) return `${mya >= 10 ? Math.round(mya) : mya} mya`
  // Sub-million: show in years.
  const yrs = Math.round(mya * 1_000_000)
  return `${yrs.toLocaleString()} yrs ago`
}

/** Format a span/gap between two positions (in million-year units). */
function fmtSpan(v: number): string {
  const mya = Math.abs(v)
  if (mya >= 1000) {
    const bil = mya / 1000
    return `${bil % 1 === 0 ? bil : bil.toFixed(1)} billion years`
  }
  if (mya >= 1) return `${Math.round(mya).toLocaleString()} million years`
  const yrs = Math.round(mya * 1_000_000)
  return `${yrs.toLocaleString()} years`
}

function compare(a: StrataItem, b: StrataItem): string[] {
  const early = a.pos <= b.pos ? a : b
  const late = a.pos <= b.pos ? b : a
  const gap = late.pos - early.pos // millions of years
  const out: string[] = [`${fmtSpan(gap)} separate ${early.label} and ${late.label}.`]

  // The whole of recorded history is ~5,000 years = 0.005 my.
  const historiesOfHumans = gap / 0.005
  if (historiesOfHumans >= 100) {
    out.push(`All of recorded human history fits into that gap ${Math.round(historiesOfHumans).toLocaleString()} times.`)
  }
  // Reign of the dinosaurs ≈ 165 million years.
  if (gap >= 200) {
    out.push(`That is longer than the dinosaurs ruled the Earth (about 165 million years).`)
  } else if (gap >= 30 && gap < 200) {
    const dinoFraction = gap / 165
    out.push(`That is about ${Math.round(dinoFraction * 100)}% of the dinosaurs' entire 165-million-year reign.`)
  }
  return out.slice(0, 3)
}

export const evolutionConfig: StrataConfig = {
  id: 'evolution',
  name: 'Evolution',
  tagline: 'four billion years of life',
  scale: 'linear',
  // Open framed on the Ediacaran-to-now window (where all visible, recognisable
  // life lives); pinch out for the vast microbial deep time back to first life.
  axis: {
    kind: 'time',
    format: fmtAgo,
    ticks: [-4500, -4000, -3000, -2000, -1000, -538, -252, -66, 0],
    frame: [-620, 20],
    domain: [-4600, 20],
  },
  lanes: LANES,
  // The clade lanes fan into their orders/families (sub) on deep zoom.
  fanLanes: ['mammals', 'reptiles', 'inverts', 'fish', 'hominins', 'plants'],
  items,
  compare,
  scrubberLabel: 'Living then',
  formatSpan: fmtSpan,
  originLabel: ' ago',
  lodImp4K: 0, // content-rich: show everything from the start
  hint: 'pinch to zoom · drag to travel time · tap any milestone, tap a second to measure the ages between',
}
