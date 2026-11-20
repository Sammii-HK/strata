import { PACK } from '../data/pack_etymos'
import type { StrataConfig, StrataItem, Lane } from '../engine/strata'

const LANES: Lane[] = [
  { id: 'germanic', name: 'Germanic', color: '#4C82C3' },
  { id: 'italic', name: 'Italic (Latin)', color: '#E8B84B' },
  { id: 'hellenic', name: 'Hellenic (Greek)', color: '#2FA98C' },
  { id: 'semitic', name: 'Semitic (Arabic)', color: '#C56BD6' },
  { id: 'indoIranian', name: 'Indo-Iranian', color: '#E07A3E' },
  { id: 'celtic', name: 'Celtic', color: '#6C6CE8' },
  { id: 'otherIE', name: 'Other Indo-European', color: '#D7494C' },
  { id: 'uralic', name: 'Uralic', color: '#8C8C99' },
]

const items: StrataItem[] = PACK.map((w) => ({
  id: w.id,
  label: w.title,
  pos: w.year,
  end: w.endYear,
  lane: w.thread,
  sub: w.sub,
  importance: w.importance,
  domain: w.domain,
  fuzzy: w.fuzzy,
  note: w.note,
}))

const NON_IE = new Set(['semitic', 'uralic'])
const laneName = (id: string) => LANES.find((l) => l.id === id)?.name ?? id

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

// The word's own journey: earliest attested/reconstructed form to the point its
// modern English spelling settles. Falls back to a single point if no span.
function journey(it: StrataItem): number {
  return (it.end ?? it.pos) - it.pos
}

function compare(a: StrataItem, b: StrataItem): string[] {
  const early = a.pos <= b.pos ? a : b
  const late = a.pos <= b.pos ? b : a
  const gap = late.pos - early.pos
  const out: string[] = [`${fmtSpan(gap)} separate the earliest recorded root of "${early.label}" from that of "${late.label}".`]

  // Different routes into English. Germanic, Latin, Greek, Celtic and
  // Indo-Iranian are branches of one family (Indo-European); Arabic and
  // Finnish come from unrelated families, so say which it is.
  if (early.lane !== late.lane) {
    const related = !NON_IE.has(early.lane) && !NON_IE.has(late.lane)
    out.push(related
      ? `"${early.label}" reached English down the ${laneName(early.lane)} branch and "${late.label}" down the ${laneName(late.lane)} branch: cousins from the same Indo-European family tree.`
      : `"${early.label}" (${laneName(early.lane)}) and "${late.label}" (${laneName(late.lane)}) come from unrelated language families, and still both ended up in English.`)
  }

  // Whichever word had the longer road to its modern spelling.
  const ja = journey(a)
  const jb = journey(b)
  if (ja > 0 && jb > 0) {
    const longer = ja >= jb ? a : b
    const shorter = ja >= jb ? b : a
    const longerYears = Math.max(ja, jb)
    const shorterYears = Math.min(ja, jb)
    if (longerYears - shorterYears > 200) {
      out.push(`"${longer.label}" took ${fmtSpan(longerYears)} to settle into its modern spelling, versus ${fmtSpan(shorterYears)} for "${shorter.label}".`)
    }
  }

  // The "closer to now than to each other" gut-punch, History-style.
  const nowToLate = 2026 - late.pos
  if (nowToLate > 0 && gap > nowToLate) {
    out.push(`The root of "${late.label}" is closer to today than it is to the root of "${early.label}".`)
  }

  return out.slice(0, 3)
}

export const etymosConfig: StrataConfig = {
  id: 'etymos',
  name: 'Etymos',
  tagline: 'A tube map of English word origins',
  scale: 'linear',
  // Open framed on the medieval-to-modern window (where most borrowings and
  // coinages land); pinch out to Proto-Indo-European roots c. 4000 BCE.
  axis: { kind: 'time', format: fmtYear, ticks: [-4000, -2000, -1000, -500, 0, 500, 800, 1100, 1300, 1500, 1700, 1850, 1950], frame: [0, 1950], domain: [-4200, 1980] },
  lanes: LANES,
  // No sub-lane fan yet: the origin language of each word's earliest stage
  // lives in `sub` and shows in the readout; a language->word fan (mirroring
  // Cosmos's constellation fan) is a natural v2 once the pack has more words
  // per origin language to make fanning worthwhile.
  items,
  compare,
  scrubberLabel: 'Same era',
  formatSpan: fmtSpan,
  lodImp4K: 0, // content-rich: show every word from the start (no star-density gating)
  hint: 'pinch to zoom · drag to travel · tap any word, tap a second to compare their roots',
}
