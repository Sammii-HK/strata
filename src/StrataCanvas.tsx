import { useContext, useMemo, useRef, useState } from 'react'
import { Platform, Pressable, ScrollView, Text as RNText, TextInput, useWindowDimensions, View } from 'react-native'
import { Canvas, Fill, Group, Line, Circle, Text, matchFont, vec } from '@shopify/react-native-skia'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { MapContext } from './mapContext'
import type { StrataItem } from './engine/strata'

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const smooth = (x: number) => {
  const t = clamp(x, 0, 1)
  return t * t * (3 - 2 * t)
}
const L10 = Math.log10
const BG = '#101218'
const TOP = 112
const BOTTOM = 46

const fontStyle = { fontFamily: Platform.select({ ios: 'Helvetica', default: 'sans-serif' }) as string, fontSize: 11 }
const fontBoldStyle = { fontFamily: Platform.select({ ios: 'Helvetica', default: 'sans-serif' }) as string, fontSize: 12, fontWeight: '600' as const }

export default function StrataCanvas() {
  const { config, lens, setLens } = useContext(MapContext)
  const { width: W, height: H } = useWindowDimensions()
  // matchFont uses the platform system font provider; not implemented on RN Web,
  // so guard it (web skips text via the `font &&` checks; native gets real fonts).
  const font = useMemo(() => { try { return matchFont(fontStyle) } catch { return null } }, [])
  const fontBold = useMemo(() => { try { return matchFont(fontBoldStyle) } catch { return null } }, [])

  const [view, setView] = useState({ k: 1, tx: 0 })
  const viewRef = useRef(view)
  viewRef.current = view
  const lastScale = useRef(1)

  const [sel, setSel] = useState<string[]>([])
  const [shellOn, setShellOn] = useState(false)
  const shellOnRef = useRef(false)
  shellOnRef.current = shellOn
  const [shellPos, setShellPos] = useState(1000)
  const [allSubs, setAllSubs] = useState(false)
  const [hidden, setHidden] = useState<Set<string>>(() => new Set())
  const [menuOpen, setMenuOpen] = useState(false)
  const [mapMenuOpen, setMapMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  const visibleRef = useRef<{ id: string; x: number; y: number; r: number }[]>([])

  // --- memoised derivations (all hooks run unconditionally, before any early return) ---
  const LANE_MAP = useMemo(() => Object.fromEntries((config?.lanes ?? []).map((l) => [l.id, l])), [config])
  const byId = useMemo(() => new Map((config?.items ?? []).map((o) => [o.id, o])), [config])
  const [loP, hiP] = useMemo(() => {
    let lo = Infinity
    let hi = -Infinity
    for (const o of config?.items ?? []) {
      lo = Math.min(lo, o.pos)
      hi = Math.max(hi, o.pos)
    }
    if (!isFinite(lo)) return [0, 1]
    return [lo, hi]
  }, [config])
  const laneIndex = useMemo(() => new Map((config?.lanes ?? []).map((c, i) => [c.id, i])), [config])
  const subNames = useMemo(() => {
    const fanId = config?.fanLanes?.[0]
    if (!config || !fanId) return [] as string[]
    const s = new Set<string>()
    for (const o of config.items) if (o.lane === fanId && o.sub) s.add(o.sub)
    const primary = (config.fanPrimary ?? []).filter((x) => s.has(x))
    const featured = config.fanFeatured ? new Set(config.fanFeatured) : null
    let rest = [...s].filter((x) => !primary.includes(x))
    if (featured && !allSubs) rest = rest.filter((x) => featured.has(x))
    rest.sort()
    return [...primary, ...rest]
  }, [config, allSubs])
  const subIndex = useMemo(() => new Map(subNames.map((c, i) => [c, i])), [subNames])

  if (!config) return <View style={{ flex: 1, backgroundColor: BG }} />

  const ITEMS = config.items
  const LANES = config.lanes
  const isLog = config.scale === 'log'
  const ax = (v: number) => (isLog ? L10(v) : v)
  const inv = (a: number) => (isLog ? Math.pow(10, a) : a)
  const fmt = config.axis.format
  const fmtSpan = config.formatSpan ?? config.axis.format
  const fanLaneId = config.fanLanes?.[0]
  const fanIdx = fanLaneId ? LANES.findIndex((l) => l.id === fanLaneId) : -1
  const lo = ax(loP)
  const hi = ax(hiP)

  const clampTx = (tx: number, k: number, w: number) => clamp(tx, 120 - w * k, w - 120)
  const unit = (v: number) => (ax(v) - lo) / (hi - lo)
  const sx = (v: number) => unit(v) * W * view.k + view.tx
  const posAtPx = (px: number) => inv(lo + ((px - viewRef.current.tx) / (W * viewRef.current.k)) * (hi - lo))
  const k = view.k

  const zoomBy = (f: number) =>
    setView((v) => {
      const nk = clamp(v.k * f, 0.85, 60)
      return { k: nk, tx: clampTx(W / 2 - (W / 2 - v.tx) * (nk / v.k), nk, W) }
    })

  const pan = Gesture.Pan()
    .runOnJS(true)
    .onChange((e) => {
      if (shellOnRef.current) {
        setShellPos(clamp(posAtPx(e.x), loP, hiP))
        return
      }
      setView((v) => ({ k: v.k, tx: clampTx(v.tx + e.changeX, v.k, W) }))
    })
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
  const tap = Gesture.Tap()
    .runOnJS(true)
    .maxDuration(260)
    .onEnd((e) => {
      const vis = visibleRef.current
      let best: (typeof vis)[number] | null = null
      let bd = Infinity
      for (const p of vis) {
        const d = Math.hypot(p.x - e.x, p.y - e.y)
        if (d < bd) {
          bd = d
          best = p
        }
      }
      if (best && bd < Math.max(best.r + 14, 20)) {
        const id = best.id
        setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id].slice(-2)))
      }
    })
  const gesture = Gesture.Simultaneous(pan, pinch, tap)

  // ---- layout: one band per lane; fan lane expands into sub-lanes on zoom ----
  const n = LANES.length
  const usableH = H - TOP - BOTTOM
  const mSub = Math.max(1, subNames.length)

  const sp = fanIdx >= 0 ? smooth(clamp((k - 2) / 3, 0, 1)) : 0
  const zFrac = fanIdx >= 0 ? lerp(1 / n, 0.82, sp) : 1 / n
  const otherFrac = n > 1 ? (1 - zFrac) / (n - 1) : 1
  const bands: { top: number; h: number }[] = []
  {
    let acc = TOP
    for (let i = 0; i < n; i++) {
      const bh = usableH * (i === fanIdx ? zFrac : otherFrac)
      bands.push({ top: acc, h: bh })
      acc += bh
    }
  }
  const laneCenterY = (i: number) => bands[i].top + bands[i].h / 2
  const subY = (si: number) => {
    const b = bands[fanIdx]
    const pad = b.h * 0.05
    return b.top + pad + ((b.h - 2 * pad) * (si + 0.5)) / mSub
  }
  const objY = (o: StrataItem) => {
    const i = laneIndex.get(o.lane) ?? 0
    if (fanLaneId && o.lane === fanLaneId && sp > 0.02 && o.sub) {
      const si = subIndex.get(o.sub)
      if (si != null) return lerp(laneCenterY(i), subY(si), sp)
    }
    return laneCenterY(i)
  }

  const showImp = (i: number) => (i <= 3 ? true : k >= 2.2)
  const showLbl = (i: number) => (i === 1 ? true : i === 2 ? k >= 1.1 : i === 3 ? k >= 1.9 : k >= 3.5)

  const visible = ITEMS.filter((o) => showImp(o.importance) && !hidden.has(o.lane))
    .map((o) => ({ o, x: sx(o.pos), y: objY(o), c: LANE_MAP[o.lane].color }))
    .filter((p) => p.x > -50 && p.x < W + 50)
    .sort((a, b) => b.o.importance - a.o.importance)
  visibleRef.current = visible.map((p) => ({ id: p.o.id, x: p.x, y: p.y, r: p.o.importance === 1 ? 6.5 : p.o.importance === 2 ? 4.6 : p.o.importance === 3 ? 3.3 : 2.5 }))

  type Cand = (typeof visible)[number]
  const labels: { p: Cand; side: 1 | -1 }[] = []
  const up: [number, number][] = []
  const dn: [number, number][] = []
  const fits = (list: [number, number][], La: number, Ra: number) => !list.some(([a, b]) => La < b + 8 && Ra > a - 8)
  let toggle = 0
  const place = (cands: Cand[]) => {
    for (const c of cands.sort((a, b) => a.x - b.x)) {
      const wpx = c.o.label.length * 6.1 + 6
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
    for (const d of config.axis.ticks) {
      if (d < loP || d > hiP) continue
      const x = sx(d)
      if (x < -10 || x > W + 10) continue
      if (x - lastTx < 70) continue
      lastTx = x
      ticks.push({ d, x })
    }
  }

  const selObjs = sel.map((id) => byId.get(id)).filter(Boolean) as StrataItem[]
  const laneNameOf = (id: string) => LANE_MAP[id]?.name ?? id

  const shellState = shellOn
    ? LANES.map((cat) => {
        let best: StrataItem | null = null
        let bd = Infinity
        for (const o of ITEMS) {
          if (o.lane !== cat.id) continue
          const d = Math.abs(ax(o.pos) - ax(shellPos))
          if (d < bd) {
            bd = d
            best = o
          }
        }
        return { cat, o: best }
      })
    : []

  const runSearch = () => {
    const q = query.trim().toLowerCase()
    setSearchOpen(false)
    if (!q) return
    const hit = ITEMS.find((o) => o.label.toLowerCase().includes(q))
    if (!hit) return
    const nk = Math.max(viewRef.current.k, 8)
    setView({ k: nk, tx: clampTx(W / 2 - unit(hit.pos) * W * nk, nk, W) })
    setSel([hit.id])
  }

  const fanColor = fanIdx >= 0 ? LANES[fanIdx].color : '#C56BD6'
  const shellX = sx(shellPos)

  const menuBox = { backgroundColor: '#1a1e26', borderColor: '#2a2f39', borderWidth: 1, borderRadius: 10, padding: 4 } as const
  const item = { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, paddingVertical: 9, paddingHorizontal: 10, gap: 14 }
  const btn = { backgroundColor: '#181b22', borderColor: '#2a2f39', borderWidth: 1, borderRadius: 8, paddingVertical: 7, paddingHorizontal: 10 } as const

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <GestureDetector gesture={gesture}>
        <Canvas style={{ flex: 1 }}>
          <Fill color={BG} />

          {ticks.map((t) => (
            <Group key={`t${t.d}`}>
              <Line p1={vec(t.x, TOP - 8)} p2={vec(t.x, H - BOTTOM + 8)} color="#23272f" strokeWidth={0.5} />
              {font && <Text x={t.x - 20} y={H - BOTTOM + 24} text={fmt(t.d)} font={font} color="#6a7280" />}
            </Group>
          ))}

          {LANES.map((c, i) => {
            if (hidden.has(c.id)) return null
            const y = laneCenterY(i)
            const isFan = c.id === fanLaneId
            return <Line key={c.id} p1={vec(clamp(sx(loP), 0, W), y)} p2={vec(clamp(sx(hiP), 0, W), y)} color={c.color} strokeWidth={2.4} strokeCap="round" opacity={isFan ? 0.85 * (1 - sp) : 0.85} />
          })}

          {fanLaneId && fanIdx >= 0 && !hidden.has(fanLaneId) && sp > 0.02 &&
            subNames.map((sign, si) => {
              const y = subY(si)
              const laneH = (bands[fanIdx].h * 0.9) / mSub
              return (
                <Group key={`zs${sign}`}>
                  <Line p1={vec(clamp(sx(loP), 0, W), y)} p2={vec(clamp(sx(hiP), 0, W), y)} color={fanColor} strokeWidth={1} strokeCap="round" opacity={0.16 + 0.4 * sp} />
                  {font && sp > 0.6 && laneH > 10 && <Text x={7} y={y + 3} text={sign} font={font} color={fanColor} opacity={(sp - 0.6) / 0.4} />}
                </Group>
              )
            })}

          {shellOn && (
            <Group>
              <Line p1={vec(shellX, TOP - 10)} p2={vec(shellX, H - BOTTOM + 8)} color="#e8b84b" strokeWidth={1.5} />
              {font && <Text x={shellX - 30} y={TOP - 16} text={fmt(shellPos)} font={font} color="#e8b84b" />}
            </Group>
          )}

          {visible.map((p) => {
            const imp = p.o.importance
            const r = imp === 1 ? 6.5 : imp === 2 ? 4.6 : imp === 3 ? 3.3 : 2.5
            const isSel = sel.includes(p.o.id)
            return (
              <Group key={p.o.id}>
                {isSel && <Circle cx={p.x} cy={p.y} r={r + 4} color="#e9eaee" style="stroke" strokeWidth={1.5} />}
                <Circle cx={p.x} cy={p.y} r={r} color={imp === 1 ? BG : p.c} style={imp === 1 ? 'stroke' : 'fill'} strokeWidth={imp === 1 ? 3 : undefined} />
              </Group>
            )
          })}

          {selObjs.length === 2 && (() => {
            const a = selObjs[0]
            const b = selObjs[1]
            const axp = sx(a.pos)
            const ay = objY(a)
            const bxp = sx(b.pos)
            const by = objY(b)
            return (
              <Group>
                <Line p1={vec(axp, ay)} p2={vec(bxp, by)} color="#e9eaee" strokeWidth={1.5} />
                {fontBold && <Text x={(axp + bxp) / 2 - 34} y={(ay + by) / 2 - 8} text={`${fmtSpan(Math.abs(a.pos - b.pos))} apart`} font={fontBold} color="#e8b84b" />}
              </Group>
            )
          })()}

          {font &&
            labels.map(({ p, side }) => {
              const right = p.x > W - 150
              return <Text key={`l${p.o.id}`} x={right ? p.x - p.o.label.length * 6.1 - 4 : p.x + 9} y={p.y + (side === -1 ? -9 : 16)} text={p.o.label} font={font} color="#e9eaee" />
            })}
        </Canvas>
      </GestureDetector>

      {/* ---- header ---- */}
      <View style={{ position: 'absolute', top: 50, left: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 8, zIndex: 10 }}>
        <Pressable onPress={() => { setMapMenuOpen((v) => !v); setMenuOpen(false) }}>
          <RNText style={{ color: '#e9eaee', fontSize: 16, fontWeight: '500' }}>Chronoline · {config.name} ▾</RNText>
        </Pressable>
        <Pressable style={btn} onPress={() => { setMenuOpen((v) => !v); setMapMenuOpen(false) }}>
          <RNText style={{ color: '#e9eaee', fontSize: 13 }}>Options ▾</RNText>
        </Pressable>
        <View style={{ flex: 1 }} />
        {searchOpen ? (
          <TextInput
            autoFocus
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={runSearch}
            placeholder="Search…"
            placeholderTextColor="#6a7280"
            style={{ backgroundColor: '#181b22', borderColor: '#2a2f39', borderWidth: 1, borderRadius: 8, color: '#e9eaee', paddingVertical: 6, paddingHorizontal: 10, width: 150 }}
          />
        ) : (
          <Pressable style={btn} onPress={() => setSearchOpen(true)}>
            <RNText style={{ color: '#e9eaee', fontSize: 15 }}>⌕</RNText>
          </Pressable>
        )}
        <Pressable style={btn} onPress={() => zoomBy(1 / 1.4)}>
          <RNText style={{ color: '#e9eaee', fontSize: 15 }}>–</RNText>
        </Pressable>
        <Pressable style={btn} onPress={() => zoomBy(1.4)}>
          <RNText style={{ color: '#e9eaee', fontSize: 15 }}>+</RNText>
        </Pressable>
      </View>

      {mapMenuOpen && (
        <View style={{ position: 'absolute', top: 82, left: 12, zIndex: 30, minWidth: 200, ...menuBox }}>
          {(['cosmos', 'history'] as const).map((l) => (
            <Pressable key={l} style={item} onPress={() => { setLens(l); setMapMenuOpen(false) }}>
              <RNText style={{ color: '#e9eaee', fontSize: 14, textTransform: 'capitalize' }}>{l}</RNText>
              <RNText style={{ color: '#e8b84b' }}>{l === lens ? '✓' : ''}</RNText>
            </Pressable>
          ))}
        </View>
      )}

      {menuOpen && (
        <View style={{ position: 'absolute', top: 82, left: 90, zIndex: 30, minWidth: 210, maxHeight: H - 160, ...menuBox }}>
          <ScrollView>
            <Pressable style={item} onPress={() => { if (!shellOn) setShellPos(posAtPx(W / 2)); setShellOn((v) => !v) }}>
              <RNText style={{ color: '#e9eaee', fontSize: 13 }}>{config.scrubberLabel}</RNText>
              <RNText style={{ color: '#e8b84b' }}>{shellOn ? '✓' : ''}</RNText>
            </Pressable>
            {config.fanFeatured && config.fanToggleLabel && (
              <Pressable style={item} onPress={() => setAllSubs((v) => !v)}>
                <RNText style={{ color: '#e9eaee', fontSize: 13 }}>{config.fanToggleLabel}</RNText>
                <RNText style={{ color: fanColor }}>{allSubs ? '✓' : ''}</RNText>
              </Pressable>
            )}
            <View style={{ height: 1, backgroundColor: '#2a2f39', marginVertical: 4 }} />
            <RNText style={{ color: '#9aa1ac', fontSize: 11, paddingHorizontal: 10, paddingBottom: 2 }}>Lines</RNText>
            {LANES.map((c) => (
              <Pressable key={c.id} style={item} onPress={() => setHidden((hs) => { const nx = new Set(hs); if (nx.has(c.id)) nx.delete(c.id); else nx.add(c.id); return nx })}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: c.color, opacity: hidden.has(c.id) ? 0.3 : 1 }} />
                  <RNText style={{ color: '#e9eaee', fontSize: 13, opacity: hidden.has(c.id) ? 0.5 : 1 }}>{c.name}</RNText>
                </View>
                <RNText style={{ color: c.color }}>{hidden.has(c.id) ? '' : '✓'}</RNText>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ---- readout ---- */}
      {selObjs.length === 1 && (
        <View style={{ position: 'absolute', left: 12, right: 12, bottom: 16, zIndex: 12, backgroundColor: '#1a1e26', borderColor: '#2a2f39', borderWidth: 1, borderRadius: 10, padding: 12 }}>
          <RNText style={{ color: '#e9eaee', fontSize: 13 }}>
            <RNText style={{ color: '#e8b84b', fontWeight: '600' }}>{selObjs[0].label}</RNText> · {fmt(selObjs[0].pos)}{config.originLabel ?? ''} · {laneNameOf(selObjs[0].lane)}{selObjs[0].sub ? ` · ${selObjs[0].sub}` : ''}
          </RNText>
          {selObjs[0].note ? <RNText style={{ color: '#9aa1ac', fontSize: 12, marginTop: 6 }}>{selObjs[0].note}</RNText> : null}
          <Pressable onPress={() => setSel([])} style={{ position: 'absolute', top: 8, right: 10 }}>
            <RNText style={{ color: '#9aa1ac' }}>clear</RNText>
          </Pressable>
          <RNText style={{ color: '#6a7280', fontSize: 11, marginTop: 6 }}>tap another to compare</RNText>
        </View>
      )}

      {selObjs.length === 2 && (
        <View style={{ position: 'absolute', left: 12, right: 12, bottom: 16, zIndex: 12, backgroundColor: '#1a1e26', borderColor: '#2a2f39', borderWidth: 1, borderRadius: 10, padding: 12 }}>
          <RNText style={{ color: '#e9eaee', fontSize: 13 }}>
            <RNText style={{ color: '#e8b84b', fontWeight: '600' }}>{fmtSpan(Math.abs(selObjs[0].pos - selObjs[1].pos))}</RNText> between {selObjs[0].label} and {selObjs[1].label}
          </RNText>
          {config.compare(selObjs[0], selObjs[1]).map((line, i) => (
            <RNText key={i} style={{ color: '#e9eaee', fontSize: 12, marginTop: 6 }}>{line}</RNText>
          ))}
          <Pressable onPress={() => setSel([])} style={{ position: 'absolute', top: 8, right: 10 }}>
            <RNText style={{ color: '#9aa1ac' }}>clear</RNText>
          </Pressable>
        </View>
      )}
    </View>
  )
}
