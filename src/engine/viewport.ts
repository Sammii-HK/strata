// Pure viewport maths for the Strata canvas (zoom anchoring, lane layout, which
// lane the sub-lane fan opens for). Kept free of React/Skia so it can be unit
// tested with node:test.

export const FAN_K = 3
export const MIN_SUB_H = 26
export const FAN_FULL_FRAC = 0.82

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const smooth = (x: number) => {
  const t = clamp(x, 0, 1)
  return t * t * (3 - 2 * t)
}

export interface View {
  k: number
  tx: number
  ty: number
}

export interface Band {
  laneId: string
  /** Top of the band in screen space, EXCLUDING the vertical pan (ty). */
  top: number
  h: number
}

export interface LayoutInput {
  /** Screen y where the first band starts. */
  top: number
  /** Height available to all bands. */
  usableH: number
  /** Visible (not hidden) lane ids, top to bottom. */
  laneIds: string[]
  /** The lane whose band is opened into sub-lanes, if any. */
  fanLaneId?: string
  /** Number of sub-lanes of the fan lane. */
  subCount: number
  k: number
}

export interface Layout {
  bands: Band[]
  sp: number
  contentH: number
  tyMin: number
}

/** Band layout for the visible lanes; the fan lane grows as k passes FAN_K. */
export function layoutBands(inp: LayoutInput): Layout {
  const nVis = Math.max(1, inp.laneIds.length)
  const fanVis = inp.fanLaneId != null ? inp.laneIds.indexOf(inp.fanLaneId) : -1
  const sp = fanVis >= 0 ? smooth(clamp((inp.k - FAN_K) / 3, 0, 1)) : 0
  const zFrac = fanVis >= 0 ? lerp(1 / nVis, FAN_FULL_FRAC, sp) : 1 / nVis
  const otherFrac = nVis > 1 ? (1 - zFrac) / (nVis - 1) : 1
  const mSub = Math.max(1, inp.subCount)
  const bands: Band[] = []
  let acc = inp.top
  for (let vp = 0; vp < inp.laneIds.length; vp++) {
    let bh = inp.usableH * (vp === fanVis ? zFrac : otherFrac)
    if (vp === fanVis && sp > 0.02) bh = Math.max(bh, mSub * MIN_SUB_H * sp)
    bands.push({ laneId: inp.laneIds[vp], top: acc, h: bh })
    acc += bh
  }
  const contentH = acc - inp.top
  return { bands, sp, contentH, tyMin: Math.min(0, inp.usableH - contentH) }
}

/** The band containing screen y (after vertical pan ty), else the nearest one. */
export function laneAtY(bands: Band[], y: number, ty = 0): Band | undefined {
  let best: Band | undefined
  let bd = Infinity
  for (const b of bands) {
    const t = b.top + ty
    if (y >= t && y < t + b.h) return b
    const d = y < t ? t - y : y - (t + b.h)
    if (d < bd) {
      bd = d
      best = b
    }
  }
  return best
}

/**
 * Which fannable lane opens: the one under the focal point, or, if the focal
 * point is over a lane that can't fan, the fannable lane NEAREST VERTICALLY.
 * (Previously this fell back to the lane whose items were most centred
 * horizontally, which ignores where the user is looking.)
 */
export function pickFanLane(bands: Band[], fanLanes: string[], focalY: number, ty = 0): string | undefined {
  const cand = bands.filter((b) => fanLanes.includes(b.laneId))
  if (!cand.length) return undefined
  return laneAtY(cand, focalY, ty)?.laneId
}

/** Zoom about a screen x so the axis value under it stays put; width-clamped. */
export function zoomX(tx: number, k: number, nk: number, focalX: number, W: number): number {
  return clamp(focalX - (focalX - tx) * (nk / k), W - W * nk, 0)
}

export interface ZoomInput {
  view: View
  factor: number
  focalX: number
  focalY: number
  /** Pan carried by the gesture centroid since the last update. */
  panDx?: number
  panDy?: number
  W: number
  maxK: number
  top: number
  usableH: number
  laneIds: string[]
  fanLanes: string[]
  /** Sub-lane count for a given fan lane. */
  subCount: (laneId: string) => number
  /** Currently locked fan lane (null when none). */
  lock: string | null
}

export interface ZoomResult {
  view: View
  lock: string | null
}

/**
 * One zoom step. Anchors x on the focal point, locks the fan to the lane under
 * the focal point when k crosses FAN_K, and re-anchors the vertical pan so the
 * lane under the finger stays under the finger while its band grows/shrinks.
 */
export function zoomAtFocal(inp: ZoomInput): ZoomResult {
  const { view: v, W } = inp
  const nk = clamp(v.k * inp.factor, 1, inp.maxK)
  let lock = inp.lock
  if (nk < FAN_K) lock = null
  if (lock && !inp.laneIds.includes(lock)) lock = null

  const before = layoutBands({
    top: inp.top, usableH: inp.usableH, laneIds: inp.laneIds,
    fanLaneId: lock ?? undefined, subCount: lock ? inp.subCount(lock) : 1, k: v.k,
  })
  const tyBefore = clamp(v.ty, before.tyMin, 0)
  if (nk >= FAN_K && !lock) lock = pickFanLane(before.bands, inp.fanLanes, inp.focalY, tyBefore) ?? null

  const after = layoutBands({
    top: inp.top, usableH: inp.usableH, laneIds: inp.laneIds,
    fanLaneId: lock ?? undefined, subCount: lock ? inp.subCount(lock) : 1, k: nk,
  })
  let ty = tyBefore
  const anchor = laneAtY(before.bands, inp.focalY, tyBefore)
  const next = anchor && after.bands.find((b) => b.laneId === anchor.laneId)
  if (anchor && next) {
    const frac = (inp.focalY - (anchor.top + tyBefore)) / anchor.h
    ty = inp.focalY - next.top - frac * next.h
  }
  ty = clamp(ty + (inp.panDy ?? 0), after.tyMin, 0)
  const tx = clamp(zoomX(v.tx, v.k, nk, inp.focalX, W) + (inp.panDx ?? 0), W - W * nk, 0)
  return { view: { k: nk, tx, ty }, lock }
}

/** Decide whether a drag is horizontal or vertical once it has moved enough. */
export function dominantAxis(dx: number, dy: number, threshold = 8): 'x' | 'y' | null {
  if (Math.hypot(dx, dy) < threshold) return null
  return Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y'
}

export interface Rect { l: number; r: number; t: number; b: number }

/** 2D label collision test (with a gap), so labels on different lines don't block each other and neighbours in the fan don't overlap. */
export function rectFits(placed: Rect[], c: Rect, gap = 8): boolean {
  return !placed.some((p) => c.l < p.r + gap && c.r > p.l - gap && c.t < p.b + 2 && c.b > p.t - 2)
}

export interface FocusInput {
  view: View
  laneId: string
  W: number
  maxK: number
  top: number
  usableH: number
  laneIds: string[]
  subCount: (laneId: string) => number
  /** Zoom to use when the fan isn't already open. */
  targetK?: number
}

/** Jump the view to a lane's fan: open it, keep the x centre, scroll its band to the top. */
export function focusLaneView(inp: FocusInput): ZoomResult {
  const nk = clamp(Math.max(inp.view.k, inp.targetK ?? FAN_K + 2), 1, inp.maxK)
  const lay = layoutBands({
    top: inp.top, usableH: inp.usableH, laneIds: inp.laneIds,
    fanLaneId: inp.laneId, subCount: inp.subCount(inp.laneId), k: nk,
  })
  const band = lay.bands.find((b) => b.laneId === inp.laneId)
  const ty = band ? clamp(inp.top - band.top, lay.tyMin, 0) : 0
  return { view: { k: nk, tx: zoomX(inp.view.tx, inp.view.k, nk, inp.W / 2, inp.W), ty }, lock: nk >= FAN_K ? inp.laneId : null }
}
