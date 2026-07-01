import { useMemo, useRef, useState } from 'react'
import { Platform, useWindowDimensions } from 'react-native'
import { Canvas, Fill, Group, Line, Circle, Text, matchFont, vec } from '@shopify/react-native-skia'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { COSMOS_ALL as COSMOS } from './data/cosmosAll'
import type { CosmosCategory } from './data/cosmos'

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
const L10 = Math.log10
const BG = '#101218'
const TOP = 64
const BOTTOM = 40

const CATEGORIES: { id: CosmosCategory; name: string; color: string }[] = [
  { id: 'solarSystem', name: 'Solar System', color: '#E8B84B' },
  { id: 'stars', name: 'Nearby stars', color: '#4C82C3' },
  { id: 'zodiac', name: 'Constellations', color: '#C56BD6' },
  { id: 'deepSky', name: 'Clusters & nebulae', color: '#2FA98C' },
  { id: 'milkyWay', name: 'Milky Way', color: '#E07A3E' },
  { id: 'localGroup', name: 'Local Group', color: '#D7494C' },
  { id: 'largeScale', name: 'Large-scale structure', color: '#6C6CE8' },
]
const CAT_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CosmosCategory, (typeof CATEGORIES)[number]>

function fmtDist(ly: number) {
  if (ly < 1e-6) return `${Math.round(ly * 3.156e7)} light-sec`
  if (ly < 4e-3) {
    const au = ly / 1.581e-5
    return `${au < 10 ? au.toFixed(1) : Math.round(au).toLocaleString()} AU`
  }
  if (ly < 1) return `${ly.toFixed(2)} ly`
  if (ly < 1e6) return `${Math.round(ly).toLocaleString()} ly`
  if (ly < 1e9) return `${(ly / 1e6).toFixed(ly < 1e7 ? 2 : 0)} million ly`
  return `${(ly / 1e9).toFixed(2)} billion ly`
}
const TICK_LY = [3.17e-8, 1.581e-5, 1.581e-2, 1, 100, 1e4, 1e6, 1e8, 1e10]
const fontStyle = { fontFamily: Platform.select({ ios: 'Helvetica', default: 'sans-serif' }) as string, fontSize: 11 }

export default function CosmosCanvas() {
  const { width: W, height: H } = useWindowDimensions()
  const font = useMemo(() => matchFont(fontStyle), [])

  const [loLy, hiLy] = useMemo(() => {
    let lo = Infinity
    let hi = 0
    for (const o of COSMOS) {
      lo = Math.min(lo, o.distanceLy)
      hi = Math.max(hi, o.distanceLy)
    }
    return [lo, hi]
  }, [])
  const lo = L10(loLy)
  const hi = L10(hiLy)

  const [view, setView] = useState({ k: 1, tx: 0 })
  const viewRef = useRef(view)
  viewRef.current = view
  const lastScale = useRef(1)

  const clampTx = (tx: number, k: number, w: number) => clamp(tx, 120 - w * k, w - 120)
  const unit = (ly: number) => (L10(ly) - lo) / (hi - lo)
  const sx = (ly: number) => unit(ly) * W * view.k + view.tx
  const k = view.k

  const n = CATEGORIES.length
  const usableH = H - TOP - BOTTOM
  const catIndex = useMemo(() => new Map(CATEGORIES.map((c, i) => [c.id, i])), [])
  const catCenterY = (i: number) => TOP + (usableH * (i + 0.5)) / n

  const showImp = (i: number) => (i <= 3 ? true : k >= 2.2)
  const showLbl = (i: number) => (i === 1 ? true : i === 2 ? k >= 1.1 : i === 3 ? k >= 1.9 : k >= 3.5)

  const pan = Gesture.Pan()
    .runOnJS(true)
    .onChange((e) => setView((v) => ({ k: v.k, tx: clampTx(v.tx + e.changeX, v.k, W) })))
  const pinch = Gesture.Pinch()
    .runOnJS(true)
    .onBegin(() => {
      lastScale.current = 1
    })
    .onUpdate((e) => {
      const f = e.scale / lastScale.current
      lastScale.current = e.scale
      setView((v) => {
        const nk = clamp(v.k * f, 0.85, 60)
        return { k: nk, tx: clampTx(e.focalX - (e.focalX - v.tx) * (nk / v.k), nk, W) }
      })
    })
  const gesture = Gesture.Simultaneous(pan, pinch)

  const visible = COSMOS.filter((o) => showImp(o.importance))
    .map((o) => ({ o, x: sx(o.distanceLy), y: catCenterY(catIndex.get(o.category) ?? 0), c: CAT_MAP[o.category].color }))
    .filter((p) => p.x > -50 && p.x < W + 50)
    .sort((a, b) => b.o.importance - a.o.importance)

  // label declutter, both sides
  type Cand = (typeof visible)[number]
  const labels: { p: Cand; side: 1 | -1 }[] = []
  const up: [number, number][] = []
  const dn: [number, number][] = []
  const fits = (list: [number, number][], La: number, Ra: number) => !list.some(([a, b]) => La < b + 8 && Ra > a - 8)
  let toggle = 0
  const place = (cands: Cand[]) => {
    for (const c of cands.sort((a, b) => a.x - b.x)) {
      const wpx = c.o.name.length * 6.1 + 6
      const right = c.x > W - 150
      const La = right ? c.x - wpx : c.x
      const Ra = right ? c.x : c.x + wpx
      const order: (1 | -1)[] = toggle++ % 2 === 0 ? [-1, 1] : [1, -1]
      for (const side of order) {
        const list = side === -1 ? up : dn
        if (fits(list, La, Ra)) {
          list.push([La, Ra])
          labels.push({ p: c, side })
          break
        }
      }
    }
  }
  place(visible.filter((p) => p.o.importance === 1 && showLbl(1)))
  place(visible.filter((p) => p.o.importance === 2 && showLbl(2)))
  place(visible.filter((p) => p.o.importance === 3 && showLbl(3)))
  place(visible.filter((p) => p.o.importance === 4 && showLbl(4)))

  const ticks: { d: number; x: number }[] = []
  {
    let lastTx = -1e9
    for (const d of TICK_LY) {
      if (d < loLy || d > hiLy) continue
      const x = sx(d)
      if (x < -10 || x > W + 10) continue
      if (x - lastTx < 70) continue
      lastTx = x
      ticks.push({ d, x })
    }
  }

  return (
    <GestureDetector gesture={gesture}>
      <Canvas style={{ flex: 1 }}>
        <Fill color={BG} />

        {ticks.map((t) => (
          <Group key={`t${t.d}`}>
            <Line p1={vec(t.x, TOP - 8)} p2={vec(t.x, H - BOTTOM + 8)} color="#23272f" strokeWidth={0.5} />
            {font && <Text x={t.x - 20} y={H - BOTTOM + 24} text={fmtDist(t.d)} font={font} color="#6a7280" />}
          </Group>
        ))}

        {CATEGORIES.map((c, i) => {
          const y = catCenterY(i)
          return <Line key={c.id} p1={vec(clamp(sx(loLy), 0, W), y)} p2={vec(clamp(sx(hiLy), 0, W), y)} color={c.color} strokeWidth={2.4} strokeCap="round" opacity={0.85} />
        })}

        {visible.map((p) => {
          const imp = p.o.importance
          const r = imp === 1 ? 6.5 : imp === 2 ? 4.6 : imp === 3 ? 3.3 : 2.5
          return <Circle key={p.o.id} cx={p.x} cy={p.y} r={r} color={imp === 1 ? BG : p.c} style={imp === 1 ? 'stroke' : 'fill'} strokeWidth={imp === 1 ? 3 : undefined} />
        })}

        {font &&
          labels.map(({ p, side }) => {
            const right = p.x > W - 150
            return <Text key={`l${p.o.id}`} x={right ? p.x - p.o.name.length * 6.1 - 4 : p.x + 9} y={p.y + (side === -1 ? -9 : 16)} text={p.o.name} font={font} color="#e9eaee" />
          })}
      </Canvas>
    </GestureDetector>
  )
}
