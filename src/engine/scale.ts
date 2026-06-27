// Framework-agnostic engine maths. Shared by web (SVG) and native (Skia).

export type TimeScale = 'linear' | 'log'

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const smooth = (x: number) => {
  const t = clamp(x, 0, 1)
  return t * t * (3 - 2 * t)
}

export const fmtYear = (y: number) => {
  const a = Math.abs(Math.round(y))
  const s = a >= 10000 ? a.toLocaleString() : String(a)
  return y < 0 ? `${s} BCE` : `${s} CE`
}
export const commaN = (n: number) => Math.round(n).toLocaleString()

const STEPS = [5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000]
export function niceStep(k: number, w: number, span: number) {
  const ppy = (w * k) / span
  const want = 110 / ppy
  for (const s of STEPS) if (s >= want) return s
  return 2000
}

export const LOG_TICKS = [-8000, -6000, -5000, -4000, -3000, -2000, -1500, -1000, -500, -250, 0, 250, 500, 750, 1000, 1250, 1500, 1650, 1800, 1900, 1950, 1980, 2000, 2020]

// year <-> [0,1] position. Log mode compresses deep antiquity, expands recent.
export function toUnit(year: number, scale: TimeScale, lo: number, hi: number) {
  if (scale === 'linear') return (year - lo) / (hi - lo)
  const REF = hi + 5
  const lmin = Math.log(REF - hi + 1)
  const lmax = Math.log(REF - lo + 1)
  const L = Math.log(Math.max(1, REF - year + 1))
  return (lmax - L) / (lmax - lmin)
}
export function fromUnit(u: number, scale: TimeScale, lo: number, hi: number) {
  if (scale === 'linear') return lo + u * (hi - lo)
  const REF = hi + 5
  const lmin = Math.log(REF - hi + 1)
  const lmax = Math.log(REF - lo + 1)
  const L = lmax - u * (lmax - lmin)
  return REF - (Math.exp(L) - 1)
}

export function showImp(i: number, k: number) {
  return i === 1 ? true : i === 2 ? k >= 1.5 : i === 3 ? k >= 2.6 : k >= 4.2
}
export function showLbl(i: number, k: number) {
  return i === 1 ? k >= 0.95 : i === 2 ? k >= 2.0 : i === 3 ? k >= 3.4 : k >= 6
}
