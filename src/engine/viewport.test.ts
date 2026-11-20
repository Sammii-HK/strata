/// <reference types="node" />
import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import {
  DRIFT_X_FRAC, FAN_K, FRAME_MAX_K, LOCKED_ZOOM, frameView, lockedMaxK, dominantAxis, focusLaneView, interpView, jumpTx, laneAtY, layoutBands, liveTransform,
  needsCommit, panView, pickFanLane, rectFits, subCountOf, toDrawn, zoomAtFocal, zoomX, type ZoomInput,
} from './viewport.ts'

const laneIds = ['a', 'solar', 'b', 'zodiac']
const base: ZoomInput = {
  view: { k: 1, tx: 0, ty: 0 }, factor: 1, focalX: 200, focalY: 0, W: 400, maxK: 300,
  top: 100, usableH: 400, laneIds, fanLanes: ['solar', 'zodiac'],
  subCount: (id) => (id === 'solar' ? 9 : 40), lock: null,
}
const flat = layoutBands({ top: 100, usableH: 400, laneIds, subCount: 1, k: 1 })

describe('laneAtY / pickFanLane', () => {
  test('flat layout gives equal bands and finds the one under y', () => {
    assert.equal(flat.bands.length, 4)
    assert.equal(laneAtY(flat.bands, 120)?.laneId, 'a')
    assert.equal(laneAtY(flat.bands, 330)?.laneId, 'b')
  })
  test('outside the stack snaps to the nearest band', () => {
    assert.equal(laneAtY(flat.bands, 10)?.laneId, 'a')
    assert.equal(laneAtY(flat.bands, 900)?.laneId, 'zodiac')
  })
  test('fan lane is the one under the finger, vertical-nearest when over a non-fan lane', () => {
    assert.equal(pickFanLane(flat.bands, ['solar', 'zodiac'], 230), 'solar')
    assert.equal(pickFanLane(flat.bands, ['solar', 'zodiac'], 450), 'zodiac')
    // over lane b (y 300-400): nearest fannable by distance is zodiac (400-500) for y=390, solar for y=305
    assert.equal(pickFanLane(flat.bands, ['solar', 'zodiac'], 390), 'zodiac')
    assert.equal(pickFanLane(flat.bands, ['solar', 'zodiac'], 305), 'solar')
  })
  test('REGRESSION: old behaviour ignored focal y (horizontal-centroid pick)', () => {
    // Legacy rule: pick the fan lane whose items are most centred on screen in x.
    // Here zodiac's items sit nearer to centre, so the legacy rule opens zodiac
    // even though the user pinched on the Solar System band.
    const legacy = (xs: Record<string, number>, W: number) =>
      Object.entries(xs).sort((p, q) => Math.abs(p[1] - W / 2) - Math.abs(q[1] - W / 2))[0][0]
    assert.equal(legacy({ solar: 90, zodiac: 210 }, 400), 'zodiac') // wrong lane
    assert.equal(pickFanLane(flat.bands, ['solar', 'zodiac'], 230), 'solar') // fixed
  })
})

describe('zoomX focal anchoring', () => {
  test('axis value under the focal x is unchanged by zoom', () => {
    const W = 400
    const tx = -150
    const k = 2
    const fx = 130
    const before = (fx - tx) / (W * k)
    const nk = 5
    const ntx = zoomX(tx, k, nk, fx, W)
    assert.ok(Math.abs((fx - ntx) / (W * nk) - before) < 1e-9)
  })
  test('clamps to data edges', () => {
    assert.equal(zoomX(0, 1, 2, 0, 400), 0)
    assert.equal(zoomX(0, 1, 2, 400, 400), -400)
  })
})

describe('zoomAtFocal', () => {
  test('locks the fan to the lane under the focal point at the FAN_K crossing', () => {
    const r = zoomAtFocal({ ...base, view: { k: 2.5, tx: -100, ty: 0 }, factor: 1.4, focalY: 230 })
    assert.ok(r.view.k >= FAN_K)
    assert.equal(r.lock, 'solar')
    const r2 = zoomAtFocal({ ...base, view: { k: 2.5, tx: -100, ty: 0 }, factor: 1.4, focalY: 460 })
    assert.equal(r2.lock, 'zodiac')
  })
  test('REGRESSION: a lock made while the fan is barely open is re-picked from where the next pinch lands', () => {
    // Pinch 1 crosses FAN_K near the solar band and locks it; the lanes are still almost flat.
    const r1 = zoomAtFocal({ ...base, view: { k: 2.9, tx: 0, ty: 0 }, factor: 1.1, focalY: 230 })
    assert.equal(r1.lock, 'solar')
    // Pinch 2 lands on the zodiac band while the fan is still barely open: it must follow the fingers.
    const r2 = zoomAtFocal({ ...base, view: r1.view, factor: 1.1, focalY: 450, lock: r1.lock })
    assert.equal(r2.lock, 'zodiac')
  })
  test('lock persists above FAN_K and clears below it', () => {
    const up = zoomAtFocal({ ...base, view: { k: 7, tx: -100, ty: 0 }, factor: 1.2, focalY: 460, lock: 'solar' })
    assert.equal(up.lock, 'solar')
    const down = zoomAtFocal({ ...base, view: { k: 3.1, tx: -100, ty: 0 }, factor: 0.5, lock: 'solar' })
    assert.equal(down.lock, null)
  })
  test('the lane under the finger stays under the finger as the fan opens', () => {
    // pinch on the zodiac band (last lane) while it opens to a tall fan.
    let view = { k: 1, tx: 0, ty: 0 }
    let lock: string | null = null
    const focalY = 470
    let anchoredFrac: number | null = null
    for (let i = 0; i < 12; i++) {
      const before = layoutBands({ top: 100, usableH: 400, laneIds, fanLaneId: lock ?? undefined, subCount: lock ? 40 : 1, k: view.k })
      const lb = laneAtY(before.bands, focalY, view.ty)!
      const frac = (focalY - (lb.top + view.ty)) / lb.h
      const r = zoomAtFocal({ ...base, view, factor: 1.35, focalY, lock })
      const after = layoutBands({ top: 100, usableH: 400, laneIds, fanLaneId: r.lock ?? undefined, subCount: r.lock ? 40 : 1, k: r.view.k })
      const nb = after.bands.find((b) => b.laneId === lb.laneId)!
      const newFrac = (focalY - (nb.top + r.view.ty)) / nb.h
      // fraction of the lane band under the finger is preserved, unless clamped by scroll bounds
      if (r.view.ty > after.tyMin && r.view.ty < 0) assert.ok(Math.abs(newFrac - frac) < 1e-6, `step ${i}: ${frac} vs ${newFrac}`)
      view = r.view
      lock = r.lock
      anchoredFrac = newFrac
    }
    assert.equal(lock, 'zodiac')
    assert.ok(anchoredFrac != null)
  })
  test('pan from the pinch centroid is added, bounded to the data', () => {
    const r = zoomAtFocal({ ...base, view: { k: 2, tx: -300, ty: 0 }, factor: 1, panDx: 500 })
    assert.equal(r.view.tx, 0)
  })
  test('k is clamped to maxK and at least 1', () => {
    assert.equal(zoomAtFocal({ ...base, factor: 0.1 }).view.k, 1)
    assert.equal(zoomAtFocal({ ...base, maxK: 3, view: { k: 2.9, tx: 0, ty: 0 }, factor: 5 }).view.k, 3)
  })
})

describe('dominantAxis', () => {
  test('undecided until the finger moves enough, then picks the larger axis', () => {
    assert.equal(dominantAxis(2, 3), null)
    assert.equal(dominantAxis(12, 3), 'x')
    assert.equal(dominantAxis(-3, 12), 'y')
  })
})

describe('rectFits', () => {
  const r = (l: number, rr: number, t: number, b: number) => ({ l, r: rr, t, b })
  test('same row overlaps collide, other rows do not', () => {
    const placed = [r(0, 50, 100, 112)]
    assert.equal(rectFits(placed, r(40, 90, 100, 112)), false)
    assert.equal(rectFits(placed, r(40, 90, 200, 212)), true)
  })
  test('adjacent fan sub-lane labels (26px apart) collide only when rects touch', () => {
    // sub-lane A: down label baseline y+16; sub-lane B (26 below): up label baseline y+26-9=y+17
    const a = r(10, 80, 100 + 6, 100 + 19)
    const b = r(10, 80, 100 + 17 - 10, 100 + 17 + 3)
    assert.equal(rectFits([a], b), false)
  })
})

describe('focusLaneView', () => {
  const inp = { view: { k: 1, tx: 0, ty: 0 }, laneId: 'zodiac', W: 400, maxK: 300, top: 100, usableH: 400, laneIds, subCount: () => 40 }
  test('opens the chosen lane, locks it, and scrolls its band to the top', () => {
    const r = focusLaneView(inp)
    assert.equal(r.lock, 'zodiac')
    assert.ok(r.view.k >= FAN_K)
    const lay = layoutBands({ top: 100, usableH: 400, laneIds, fanLaneId: 'zodiac', subCount: 40, k: r.view.k })
    const band = lay.bands.find((b) => b.laneId === 'zodiac')!
    assert.ok(Math.abs(band.top + r.view.ty - 100) < 1e-9 || r.view.ty === lay.tyMin)
  })
  test('respects the locked-map zoom cap (cannot open the fan)', () => {
    assert.equal(focusLaneView({ ...inp, maxK: 3 }).view.k, 3)
  })
})

describe('subCount as a record (UI-thread form)', () => {
  test('zoomAtFocal gives the same result for a function or a record', () => {
    const rec = { solar: 9, zodiac: 40 }
    const a = zoomAtFocal({ ...base, view: { k: 2.9, tx: -100, ty: 0 }, factor: 2, focalY: 230 })
    const b = zoomAtFocal({ ...base, view: { k: 2.9, tx: -100, ty: 0 }, factor: 2, focalY: 230, subCount: rec })
    assert.deepEqual(a, b)
  })
  test('missing lanes count as one sub-lane', () => {
    assert.equal(subCountOf({}, 'x'), 1)
    assert.equal(subCountOf((id) => (id === 'x' ? 5 : 1), 'x'), 5)
  })
})

describe('panView / jumpTx', () => {
  test('pan stays inside the data edges and the vertical range', () => {
    assert.deepEqual(panView({ k: 2, tx: -10, ty: 0 }, 50, 0, 400, -200), { k: 2, tx: 0, ty: 0 })
    assert.deepEqual(panView({ k: 2, tx: -390, ty: -10 }, -50, -500, 400, -200), { k: 2, tx: -400, ty: -200 })
  })
  test('scrubber jump centres the tapped point of the whole span', () => {
    // k = 4, tapping the middle of the track centres the middle of the data
    const tx = jumpTx({ k: 4, tx: 0, ty: 0 }, 200, 400)
    assert.equal((400 / 2 - tx) / (400 * 4), 0.5)
    assert.equal(jumpTx({ k: 4, tx: 0, ty: 0 }, 0, 400), 0) // clamped at the start
  })
})

describe('liveTransform / toDrawn', () => {
  const drawn = { k: 2, tx: -120, ty: -30 }
  test('a pure pan is a pure translation', () => {
    const t = liveTransform(drawn, { k: 2, tx: -170, ty: -10 })
    assert.deepEqual(t, { sx: 1, dx: -50, dy: 20 })
  })
  test('a drawn point lands where the live view would draw it', () => {
    const live = { k: 3, tx: -260, ty: -30 }
    const u = 0.4 // an axis position, as a fraction of the span
    const xDrawn = u * 400 * drawn.k + drawn.tx
    const xLive = u * 400 * live.k + live.tx
    const t = liveTransform(drawn, live)
    assert.ok(Math.abs(t.sx * xDrawn + t.dx - xLive) < 1e-9)
  })
  test('toDrawn inverts it, so taps hit what is on screen', () => {
    const live = { k: 2.5, tx: -200, ty: -60 }
    const t = liveTransform(drawn, live)
    const p = toDrawn(t.sx * 150 + t.dx, 90 + t.dy, drawn, live)
    assert.ok(Math.abs(p.x - 150) < 1e-9 && Math.abs(p.y - 90) < 1e-9)
  })
})

describe('needsCommit', () => {
  const W = 400
  const v = { k: 2, tx: -100, ty: 0 }
  test('any zoom re-draws', () => {
    assert.equal(needsCommit(v, { ...v, k: 2.01 }, W), true)
  })
  test('no movement never re-draws', () => {
    assert.equal(needsCommit(v, v, W), false)
  })
  test('a pan re-draws only near the edge of what was drawn', () => {
    assert.equal(needsCommit(v, { ...v, tx: -110 }, W), false)
    assert.equal(needsCommit(v, { ...v, tx: -100 - W * DRIFT_X_FRAC - 1 }, W), true)
  })
  test('a vertical pan alone never re-draws (lanes are not culled vertically)', () => {
    assert.equal(needsCommit(v, { ...v, ty: -500 }, W), false)
  })
})

describe('interpView (spring glides)', () => {
  const W = 400
  const a = { k: 1, tx: 0, ty: 0 }
  const b = { k: 100, tx: -100 * 400 * 0.7 + 200, ty: -40 }
  test('starts at a and ends at b', () => {
    const s = interpView(a, b, 0, W, 300)
    const e = interpView(a, b, 1, W, 300)
    assert.ok(Math.abs(s.k - 1) < 1e-9 && Math.abs(s.tx) < 1e-9)
    assert.ok(Math.abs(e.k - 100) < 1e-9 && Math.abs(e.tx - b.tx) < 1e-6 && e.ty === -40)
  })
  test('zoom moves in log space: half way through 1x to 100x is 10x', () => {
    assert.ok(Math.abs(interpView(a, b, 0.5, W, 300).k - 10) < 1e-9)
  })
  test('the axis value at the screen centre moves linearly', () => {
    const m = interpView(a, b, 0.5, W, 300)
    const u = (W / 2 - m.tx) / (W * m.k)
    assert.ok(Math.abs(u - (0.5 + 0.7) / 2) < 1e-9)
  })
  test('overshoot stays inside zoom limits and data edges', () => {
    const o = interpView(a, { k: 300, tx: -400 * 299, ty: 0 }, 1.08, W, 300)
    assert.ok(o.k <= 300 && o.tx >= W - W * o.k && o.tx <= 0)
    assert.ok(interpView({ k: 1, tx: 0, ty: -10 }, a, 1.1, W, 300).ty <= 0)
  })
})

describe('frameView / lockedMaxK', () => {
  test('the frame window fills the screen', () => {
    const v = frameView(0.6, 0.8, 400)
    assert.ok(Math.abs(v.k - 5) < 1e-9)
    // the frame's left end sits at the left edge, its right end at the right
    assert.ok(Math.abs(0.6 * 400 * v.k + v.tx) < 1e-6)
    assert.ok(Math.abs(0.8 * 400 * v.k + v.tx - 400) < 1e-6)
  })
  test('a frame as wide as the domain is the overview; tiny frames cap', () => {
    assert.deepEqual(frameView(0, 1, 400), { k: 1, tx: 0, ty: 0 })
    assert.equal(frameView(0.5, 0.5000001, 400).k, FRAME_MAX_K)
  })
  test('REGRESSION: measured in the domain, History opens on its frame', () => {
    // History: domain [-11000, 2030], frame [-800, 2030], one item at -400,000.
    const inDomain = (y: number) => (y + 11000) / 13030
    const inExtent = (y: number) => (y + 400000) / 402030
    const right = frameView(inDomain(-800), inDomain(2030), 400)
    const wrong = frameView(inExtent(-800), inExtent(2030), 400)
    assert.ok(Math.abs(right.k - 13030 / 2830) < 1e-9)
    assert.equal(wrong.k, FRAME_MAX_K) // the old maths zoomed straight to the cap
  })
  test('locked maps may zoom LOCKED_ZOOM past their opening view, within the global cap', () => {
    assert.equal(lockedMaxK(1, 300), LOCKED_ZOOM)
    assert.equal(lockedMaxK(0.5, 300), LOCKED_ZOOM)
    assert.equal(lockedMaxK(37, 300), 37 * LOCKED_ZOOM)
    assert.equal(lockedMaxK(200, 300), 300)
  })
})
