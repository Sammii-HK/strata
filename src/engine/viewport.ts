// Pure viewport maths for the Strata canvas (zoom anchoring, lane layout, which
// lane the sub-lane fan opens for, spring glides and the live-transform that
// carries the last drawn frame between React renders). Kept free of
// React/Skia so it can be unit tested with node:test.
//
// Functions marked 'worklet' also run on the UI thread inside gesture
// handlers (Reanimated). The directive is a plain string to Node, so tests are
// unaffected. A worklet may only call other worklets, and may not take a
// function argument across threads: hence subCount accepts a record.

export const FAN_K = 3
/** Below this fan spread (0..1) the locked lane is re-picked from the focal point. */
const REPICK_SP = 0.25
export const MIN_SUB_H = 26
export const FAN_FULL_FRAC = 0.82

export const clamp = (v: number, a: number, b: number) => {
  'worklet'
  return Math.max(a, Math.min(b, v))
}
export const lerp = (a: number, b: number, t: number) => {
  'worklet'
  return a + (b - a) * t
}
export const smooth = (x: number) => {
  'worklet'
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
  'worklet'
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
  'worklet'
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
  'worklet'
  const cand = bands.filter((b) => fanLanes.includes(b.laneId))
  if (!cand.length) return undefined
  return laneAtY(cand, focalY, ty)?.laneId
}

/** Zoom about a screen x so the axis value under it stays put; width-clamped. */
export function zoomX(tx: number, k: number, nk: number, focalX: number, W: number): number {
  'worklet'
  return clamp(focalX - (focalX - tx) * (nk / k), W - W * nk, 0)
}

/** Sub-lane counts by lane id: a function in JS, a plain record in worklets. */
export type SubCount = ((laneId: string) => number) | Readonly<Record<string, number>>

export function subCountOf(sc: SubCount, laneId: string): number {
  'worklet'
  return typeof sc === 'function' ? sc(laneId) : sc[laneId] ?? 1
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
  /** Sub-lane count for a given fan lane (a record on the UI thread). */
  subCount: SubCount
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
  'worklet'
  const { view: v, W } = inp
  const subs = (id: string) => subCountOf(inp.subCount, id)
  const nk = clamp(v.k * inp.factor, 1, inp.maxK)
  let lock = inp.lock
  if (nk < FAN_K) lock = null
  if (lock && !inp.laneIds.includes(lock)) lock = null

  const before = layoutBands({
    top: inp.top, usableH: inp.usableH, laneIds: inp.laneIds,
    fanLaneId: lock ?? undefined, subCount: lock ? subs(lock) : 1, k: v.k,
  })
  const tyBefore = clamp(v.ty, before.tyMin, 0)
  // Lock the fan to the lane under the fingers. While the locked fan is still barely open (lanes
  // almost flat), re-pick on every step so a pinch on a different lane is not stuck with a stale lock.
  if (nk >= FAN_K && (!lock || before.sp < REPICK_SP)) lock = pickFanLane(before.bands, inp.fanLanes, inp.focalY, tyBefore) ?? lock ?? null

  const after = layoutBands({
    top: inp.top, usableH: inp.usableH, laneIds: inp.laneIds,
    fanLaneId: lock ?? undefined, subCount: lock ? subs(lock) : 1, k: nk,
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
  'worklet'
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
  subCount: SubCount
  /** Zoom to use when the fan isn't already open. */
  targetK?: number
}

/** Jump the view to a lane's fan: open it, keep the x centre, scroll its band to the top. */
export function focusLaneView(inp: FocusInput): ZoomResult {
  const nk = clamp(Math.max(inp.view.k, inp.targetK ?? FAN_K + 3), 1, inp.maxK)
  const lay = layoutBands({
    top: inp.top, usableH: inp.usableH, laneIds: inp.laneIds,
    fanLaneId: inp.laneId, subCount: subCountOf(inp.subCount, inp.laneId), k: nk,
  })
  const band = lay.bands.find((b) => b.laneId === inp.laneId)
  const ty = band ? clamp(inp.top - band.top, lay.tyMin, 0) : 0
  return { view: { k: nk, tx: zoomX(inp.view.tx, inp.view.k, nk, inp.W / 2, inp.W), ty }, lock: nk >= FAN_K ? inp.laneId : null }
}

// ---------------------------------------------------------------------------
// Live view vs drawn view.
//
// Gestures move the view on the UI thread (shared values). React only re-draws
// the Skia tree (labels, culling, fan layout) when needsCommit says so; between
// those renders the drawn frame is carried to the live view by liveTransform,
// which is exact for pans and a brief x-stretch for zooms.

/** Pan by (dx, dy) inside the data edges and the vertical scroll range. */
export function panView(v: View, dx: number, dy: number, W: number, tyMin: number): View {
  'worklet'
  return { k: v.k, tx: clamp(v.tx + dx, W - W * v.k, 0), ty: clamp(v.ty + dy, tyMin, 0) }
}

/** Centre the view on screen x of the whole-span navigator (the scrubber track). */
export function jumpTx(v: View, x: number, W: number): number {
  'worklet'
  return clamp(W / 2 - x * v.k, W - W * v.k, 0)
}

export interface LiveTransform {
  /** x scale from the drawn frame to the live one. */
  sx: number
  /** x translation applied after scaling. */
  dx: number
  /** y translation. */
  dy: number
}

/** Map the drawn frame onto the live view: x' = sx * x + dx, y' = y + dy. */
export function liveTransform(drawn: View, live: View): LiveTransform {
  'worklet'
  const sx = live.k / drawn.k
  return { sx, dx: live.tx - sx * drawn.tx, dy: live.ty - drawn.ty }
}

/** Inverse of liveTransform: where a point on screen sits in the drawn frame (for hit-testing). */
export function toDrawn(x: number, y: number, drawn: View, live: View): { x: number; y: number } {
  const t = liveTransform(drawn, live)
  return { x: (x - t.dx) / t.sx, y: y - t.dy }
}

/** Horizontal drift (fraction of the width) the drawn frame may make before
 * React must re-draw it. The canvas draws items this far beyond each edge, so
 * nothing pops in on the way. Vertical drift never needs a re-draw: lanes are
 * not culled vertically, so a vertical pan is fully covered by the transform. */
export const DRIFT_X_FRAC = 0.5

/**
 * Does the live view need a React re-draw before it comes to rest? Any change
 * of zoom does (labels, level of detail and the fan all depend on k); a pan
 * only once it has drifted near the edge of what was drawn. Everything else
 * waits for the settle at the end of the gesture or glide. On the web the "UI
 * thread" is the JS thread, so every avoided re-draw is a frame not dropped.
 */
export function needsCommit(sent: View, live: View, W: number): boolean {
  'worklet'
  if (Math.abs(live.k / sent.k - 1) > 1e-4) return true
  return Math.abs(live.tx - sent.tx) > W * DRIFT_X_FRAC
}

/**
 * The view part-way through a spring glide from `a` to `b` (t: 0..1, may
 * overshoot a little). Zoom moves in log space so a 1x -> 100x glide feels
 * even, and the axis value at the screen centre moves linearly, so the content
 * slides rather than swinging about the left edge.
 */
export function interpView(a: View, b: View, t: number, W: number, maxK: number): View {
  'worklet'
  const k = clamp(Math.exp(lerp(Math.log(a.k), Math.log(b.k), t)), 1, maxK)
  const ua = (W / 2 - a.tx) / (W * a.k)
  const ub = (W / 2 - b.tx) / (W * b.k)
  const u = lerp(ua, ub, t)
  return { k, tx: clamp(W / 2 - u * W * k, W - W * k, 0), ty: Math.min(0, lerp(a.ty, b.ty, t)) }
}

/** Fling speed (px/s) below which a released drag just stops. */
export const FLING_MIN_V = 80
