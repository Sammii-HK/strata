import { useEffect, useMemo, useRef, useState } from 'react'
import { Platform, useWindowDimensions } from 'react-native'
import { Canvas, Fill, Group, Line, Circle, Text, matchFont, vec } from '@shopify/react-native-skia'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { EVENTS as EVENTS_CORE } from './data/events'
import { PACK as HIST_EU } from './data/pack_history_europe'
import { PACK as HIST_WORLD } from './data/pack_history_world'
import { PACK as HIST_IDEAS } from './data/pack_history_ideas'
import { THREADS, THREAD_MAP } from './data/threads'
import { clamp, fmtYear, niceStep, showImp, showLbl, toUnit } from './engine/scale'

const EVENTS = [...EVENTS_CORE, ...HIST_EU, ...HIST_WORLD, ...HIST_IDEAS]

const TOP = 64
const BOTTOM = 40
const BG = '#101218'

const fontStyle = { fontFamily: Platform.select({ ios: 'Helvetica', default: 'sans-serif' }) as string, fontSize: 11 }

export default function TimelineCanvas() {
  const { width: W, height: H } = useWindowDimensions()
  const font = useMemo(() => matchFont(fontStyle), [])

  const [minY, maxY] = useMemo(() => {
    let lo = Infinity
    let hi = -Infinity
    for (const e of EVENTS) {
      lo = Math.min(lo, e.year)
      hi = Math.max(hi, e.endYear ?? e.year)
    }
    return [Math.floor((lo - 120) / 100) * 100, Math.ceil((Math.max(hi, 2025) + 25) / 10) * 10]
  }, [])

  const [view, setView] = useState({ k: 1, tx: 0 })
  const didInit = useRef(false)
  const lastScale = useRef(1)

  useEffect(() => {
    if (W < 10) return
    if (didInit.current) return
    didInit.current = true
    const u0 = toUnit(-2500, 'linear', minY, maxY)
    const u1 = toUnit(2030, 'linear', minY, maxY)
    const nk = clamp(1 / (u1 - u0), 0.8, 90)
    setView({ k: nk, tx: clamp(-u0 * W * nk, 120 - W * nk, W - 120) })
  }, [W, minY, maxY])

  const sx = (year: number) => toUnit(year, 'linear', minY, maxY) * W * view.k + view.tx
  const n = THREADS.length
  const usableH = H - TOP - BOTTOM
  const rowY = (i: number) => TOP + (usableH * (i + 0.5)) / n
  const k = view.k

  const pan = Gesture.Pan()
    .runOnJS(true)
    .onChange((e) => {
      setView((v) => ({ k: v.k, tx: clamp(v.tx + e.changeX, 120 - W * v.k, W - 120) }))
    })
  const pinch = Gesture.Pinch()
    .runOnJS(true)
    .onBegin(() => {
      lastScale.current = 1
    })
    .onUpdate((e) => {
      const factor = e.scale / lastScale.current
      lastScale.current = e.scale
      setView((v) => {
        const nk = clamp(v.k * factor, 0.75, 90)
        const ntx = clamp(e.focalX - (e.focalX - v.tx) * (nk / v.k), 120 - W * nk, W - 120)
        return { k: nk, tx: ntx }
      })
    })
  const gesture = Gesture.Simultaneous(pan, pinch)

  const threadIndex = useMemo(() => new Map(THREADS.map((t, i) => [t.id, i])), [])
  const visible = EVENTS.filter((e) => showImp(e.importance, k))
    .map((e) => ({ e, x: sx(e.year), y: rowY(threadIndex.get(e.thread) ?? 0), c: THREAD_MAP[e.thread]?.color ?? '#888' }))
    .filter((p) => p.x > -40 && p.x < W + 40)

  const step = niceStep(k, W, maxY - minY)
  const tickStart = Math.ceil(minY / step) * step
  const ticks: number[] = []
  for (let yv = tickStart; yv <= maxY; yv += step) {
    const x = sx(yv)
    if (x > -10 && x < W + 10) ticks.push(yv)
  }

  return (
    <GestureDetector gesture={gesture}>
      <Canvas style={{ flex: 1 }}>
        <Fill color={BG} />

        {ticks.map((yv) => {
          const x = sx(yv)
          return (
            <Group key={`t${yv}`}>
              <Line p1={vec(x, TOP - 8)} p2={vec(x, H - BOTTOM + 8)} color="#23272f" strokeWidth={0.5} />
              {font && <Text x={x - 16} y={H - BOTTOM + 24} text={fmtYear(yv)} font={font} color="#6a7280" />}
            </Group>
          )
        })}

        {THREADS.map((l, i) => {
          const y = rowY(i)
          return <Line key={l.id} p1={vec(clamp(sx(minY), 0, W), y)} p2={vec(clamp(sx(maxY), 0, W), y)} color={l.color} strokeWidth={2.4} />
        })}

        {visible.map((p) => {
          const imp = p.e.importance
          const r = imp === 1 ? 6.5 : imp === 2 ? 4.2 : imp === 3 ? 3.2 : 2.4
          if (imp === 1) {
            return (
              <Group key={p.e.id}>
                <Circle cx={p.x} cy={p.y} r={r} color={BG} />
                <Circle cx={p.x} cy={p.y} r={r} color={p.c} style="stroke" strokeWidth={3} />
              </Group>
            )
          }
          return <Circle key={p.e.id} cx={p.x} cy={p.y} r={r} color={p.c} />
        })}

        {font &&
          visible
            .filter((p) => showLbl(p.e.importance, k))
            .map((p) => <Text key={`l${p.e.id}`} x={p.x + 9} y={p.y + 4} text={p.e.title} font={font} color="#e9eaee" />)}
      </Canvas>
    </GestureDetector>
  )
}
