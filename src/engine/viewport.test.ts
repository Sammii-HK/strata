/// <reference types="node" />
import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import {
  FAN_K, dominantAxis, focusLaneView, laneAtY, layoutBands, pickFanLane, rectFits, zoomAtFocal, zoomX, type ZoomInput,
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
  test('lock persists above FAN_K and clears below it', () => {
    const up = zoomAtFocal({ ...base, view: { k: 4, tx: -100, ty: 0 }, factor: 1.2, focalY: 460, lock: 'solar' })
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
