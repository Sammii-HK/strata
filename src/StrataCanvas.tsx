import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Keyboard, Platform, Pressable, ScrollView, Text as RNText, TextInput, useWindowDimensions, View } from 'react-native'
import { Canvas, Fill, Group, Line, Circle, Text, matchFont, vec } from '@shopify/react-native-skia'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { BlurView } from 'expo-blur'
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
  const { config, lens, setLens, openAtlas } = useContext(MapContext)
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

  // Open framed on config.axis.frame (e.g. Earth's neighbourhood) instead of the
  // flat whole-span overview. Runs once per map on mount.
  useEffect(() => {
    const f = config?.axis.frame
    if (!config || !f) return
    const axL = (v: number) => (config.scale === 'log' ? Math.log10(v) : v)
    let lov = Infinity
    let hiv = -Infinity
    for (const o of config.items) {
      lov = Math.min(lov, o.pos)
      hiv = Math.max(hiv, o.pos)
    }
    const loA = axL(lov)
    const hiA = axL(hiv)
    const uu = (v: number) => (axL(v) - loA) / (hiA - loA)
    const span = Math.max(1e-6, uu(f[1]) - uu(f[0]))
    const nk = Math.max(0.85, Math.min(60, 1 / span))
    const tx = Math.max(120 - W * nk, Math.min(W - 120, -uu(f[0]) * W * nk))
    setView({ k: nk, tx })
  }, [config, W])

  // Reset transient state when switching maps.
  useEffect(() => {
    setSel([])
    setShellOn(false)
    setHidden(new Set())
    setAllSubs(false)
    setMenuOpen(false)
    setMapMenuOpen(false)
    setSearchOpen(false)
    setQuery('')
  }, [config?.id])

  if (!config) return <View style={{ flex: 1, backgroundColor: BG }} />

  const ITEMS = config.items
  const LANES = config.lanes
  const isLog = config.scale === 'log'
  const ax = (v: number) => (isLog ? L10(v) : v)
  const inv = (a: number) => (isLog ? Math.pow(10, a) : a)
  const fmt = config.axis.format
  const fmtSpan = config.formatSpan ?? config.axis.format
  const lo = ax(loP)
  const hi = ax(hiP)

  const clampTx = (tx: number, k: number, w: number) => clamp(tx, 120 - w * k, w - 120)
  const unit = (v: number) => (ax(v) - lo) / (hi - lo)
  const sx = (v: number) => unit(v) * W * view.k + view.tx
  const posAtPx = (px: number) => inv(lo + ((px - viewRef.current.tx) / (W * viewRef.current.k)) * (hi - lo))
  const k = view.k

  // Position-aware fan: whichever fannable lane is most centred on screen opens
  // (so zooming into the Solar System opens it; into the constellations opens them).
  const fanCandidates = config.fanLanes ?? []
  let fanLaneId: string | undefined
  {
    let best = Infinity
    for (const id of fanCandidates) {
      let sum = 0
      let cnt = 0
      for (const o of ITEMS) {
        if (o.lane !== id || !o.sub) continue
        const x = sx(o.pos)
        if (x < -60 || x > W + 60) continue
        sum += x
        cnt++
      }
      if (!cnt) continue
      const score = Math.abs(sum / cnt - W / 2)
      if (score < best) {
        best = score
        fanLaneId = id
      }
    }
    if (!fanLaneId && fanCandidates.length) fanLaneId = fanCandidates[0]
  }
  const fanIdx = fanLaneId ? LANES.findIndex((l) => l.id === fanLaneId) : -1
  const subNames = (() => {
    if (!fanLaneId) return [] as string[]
    const s = new Set<string>()
    for (const o of ITEMS) if (o.lane === fanLaneId && o.sub) s.add(o.sub)
    const primary = (config.fanPrimary ?? []).filter((x) => s.has(x))
    const featured = config.fanFeatured ? new Set(config.fanFeatured) : null
    let rest = [...s].filter((x) => !primary.includes(x))
    if (featured && !allSubs) {
      const f = rest.filter((x) => featured.has(x))
      if (f.length) rest = f // only applies where featured matches (constellations), not the Solar System
    }
    rest.sort()
    return [...primary, ...rest]
  })()
  const subIndex = new Map(subNames.map((c, i) => [c, i]))

  const zoomBy = (f: number) =>
    setView((v) => {
      const nk = clamp(v.k * f, 0.85, 300)
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
        const nk = clamp(v.k * f, 0.85, 300)
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

  // ---- layout: one band per VISIBLE lane (hidden lanes reclaim their space);
  // the fan lane expands into sub-lanes on zoom ----
  // Reserve room for the glass scrubber panel so it never covers the bottom lines.
  const usableH = H - TOP - BOTTOM - (shellOn ? 180 : 0)
  const mSub = Math.max(1, subNames.length)
  const visLanes = LANES.filter((l) => !hidden.has(l.id))
  const nVis = Math.max(1, visLanes.length)
  const visPos = new Map(visLanes.map((l, vp) => [l.id, vp]))
  const fanVis = fanLaneId != null ? visPos.get(fanLaneId) ?? -1 : -1

  const sp = fanVis >= 0 ? smooth(clamp((k - 3) / 3, 0, 1)) : 0
  const zFrac = fanVis >= 0 ? lerp(1 / nVis, 0.82, sp) : 1 / nVis
  const otherFrac = nVis > 1 ? (1 - zFrac) / (nVis - 1) : 1
  const bands: { top: number; h: number }[] = []
  {
    let acc = TOP
    for (let vp = 0; vp < nVis; vp++) {
      const bh = usableH * (vp === fanVis ? zFrac : otherFrac)
      bands.push({ top: acc, h: bh })
      acc += bh
    }
  }
  const laneCenterY = (laneId: string) => {
    const vp = visPos.get(laneId)
    if (vp == null) return -1000
    return bands[vp].top + bands[vp].h / 2
  }
  const subY = (si: number) => {
    const b = bands[fanVis >= 0 ? fanVis : 0]
    const pad = b.h * 0.05
    return b.top + pad + ((b.h - 2 * pad) * (si + 0.5)) / mSub
  }
  const objY = (o: StrataItem) => {
    if (fanLaneId && o.lane === fanLaneId && sp > 0.02 && o.sub) {
      const si = subIndex.get(o.sub)
      if (si != null) return lerp(laneCenterY(o.lane), subY(si), sp)
    }
    return laneCenterY(o.lane)
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

          {LANES.map((c) => {
            if (hidden.has(c.id)) return null
            const y = laneCenterY(c.id)
            const isFan = c.id === fanLaneId
            return (
              <Group key={c.id}>
                <Line p1={vec(clamp(sx(loP), 0, W), y)} p2={vec(clamp(sx(hiP), 0, W), y)} color={c.color} strokeWidth={2.4} strokeCap="round" opacity={isFan ? 0.85 * (1 - sp) : 0.85} />
                {font && <Text x={8} y={y - 7} text={c.name} font={font} color={c.color} opacity={isFan ? Math.max(0, 1 - sp * 1.6) : 0.92} />}
              </Group>
            )
          })}

          {fanLaneId && fanVis >= 0 && !hidden.has(fanLaneId) && sp > 0.02 &&
            subNames.map((sign, si) => {
              const y = subY(si)
              const laneH = (bands[fanVis].h * 0.9) / mSub
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
            const x2 = p.o.end != null ? clamp(sx(p.o.end), -20, W + 20) : null
            return (
              <Group key={p.o.id}>
                {x2 != null && <Line p1={vec(p.x, p.y)} p2={vec(x2, p.y)} color={p.c} strokeWidth={Math.max(3, r)} strokeCap="round" opacity={0.4} />}
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

      {/* tap-off layer: closes menus + search when you tap anywhere else */}
      {(menuOpen || mapMenuOpen || searchOpen) && (
        <Pressable
          onPress={() => { setMenuOpen(false); setMapMenuOpen(false); setSearchOpen(false); Keyboard.dismiss() }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9 }}
        />
      )}

      {/* ---- header ---- */}
      <View style={{ position: 'absolute', top: 50, left: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 8, zIndex: 10 }}>
        {searchOpen ? (
          <>
            <TextInput
              autoFocus
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={runSearch}
              returnKeyType="search"
              placeholder="Search…"
              placeholderTextColor="#6a7280"
              style={{ flex: 1, backgroundColor: '#181b22', borderColor: '#2a2f39', borderWidth: 1, borderRadius: 8, color: '#e9eaee', paddingVertical: 8, paddingHorizontal: 12, fontSize: 15 }}
            />
            <Pressable style={btn} onPress={() => { setSearchOpen(false); setQuery(''); Keyboard.dismiss() }}>
              <RNText style={{ color: '#e9eaee', fontSize: 15 }}>✕</RNText>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable onPress={() => { setMapMenuOpen((v) => !v); setMenuOpen(false) }}>
              <RNText style={{ color: '#e9eaee', fontSize: 16, fontWeight: '500' }}>Strata · {config.name} ▾</RNText>
            </Pressable>
            <Pressable style={btn} onPress={() => { setMenuOpen((v) => !v); setMapMenuOpen(false) }}>
              <RNText style={{ color: '#e9eaee', fontSize: 13 }}>Options ▾</RNText>
            </Pressable>
            <View style={{ flex: 1 }} />
            <Pressable style={btn} onPress={() => setSearchOpen(true)}>
              <RNText style={{ color: '#e9eaee', fontSize: 15 }}>⌕</RNText>
            </Pressable>
            <Pressable style={btn} onPress={() => zoomBy(1 / 1.4)}>
              <RNText style={{ color: '#e9eaee', fontSize: 15 }}>–</RNText>
            </Pressable>
            <Pressable style={btn} onPress={() => zoomBy(1.4)}>
              <RNText style={{ color: '#e9eaee', fontSize: 15 }}>+</RNText>
            </Pressable>
          </>
        )}
      </View>

      {mapMenuOpen && (
        <View style={{ position: 'absolute', top: 82, left: 12, zIndex: 30, minWidth: 200, ...menuBox }}>
          {(['cosmos', 'history'] as const).map((l) => (
            <Pressable key={l} style={item} onPress={() => { setLens(l); setMapMenuOpen(false) }}>
              <RNText style={{ color: '#e9eaee', fontSize: 14, textTransform: 'capitalize' }}>{l}</RNText>
              <RNText style={{ color: '#e8b84b' }}>{l === lens ? '✓' : ''}</RNText>
            </Pressable>
          ))}
          <View style={{ height: 1, backgroundColor: '#2a2f39', marginVertical: 4 }} />
          <Pressable style={item} onPress={() => { setMapMenuOpen(false); openAtlas() }}>
            <RNText style={{ color: '#e9eaee', fontSize: 14 }}>Browse all maps</RNText>
            <RNText style={{ color: '#9aa1ac' }}>›</RNText>
          </Pressable>
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
      {!shellOn && selObjs.length === 1 && (
        <View style={{ position: 'absolute', left: 12, right: 12, bottom: 16, zIndex: 12, backgroundColor: '#1a1e26', borderColor: '#2a2f39', borderWidth: 1, borderRadius: 16, padding: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <View style={{ width: 9, height: 9, borderRadius: 2, backgroundColor: LANE_MAP[selObjs[0].lane]?.color ?? '#e8b84b' }} />
              <RNText style={{ color: '#9aa1ac', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>{laneNameOf(selObjs[0].lane)}{selObjs[0].sub ? ` · ${selObjs[0].sub}` : ''}</RNText>
            </View>
            <Pressable onPress={() => setSel([])} hitSlop={12}>
              <RNText style={{ color: '#9aa1ac', fontSize: 14 }}>clear</RNText>
            </Pressable>
          </View>
          <RNText style={{ color: '#e9eaee', fontSize: 22, fontWeight: '700' }}>{selObjs[0].label}</RNText>
          <RNText style={{ color: '#e8b84b', fontSize: 14, marginTop: 2 }}>{fmt(selObjs[0].pos)}{config.originLabel ?? ''}</RNText>
          {selObjs[0].note ? <RNText style={{ color: '#c9ccd2', fontSize: 13, lineHeight: 19, marginTop: 8 }}>{selObjs[0].note}</RNText> : null}
          <RNText style={{ color: '#6a7280', fontSize: 12, marginTop: 10 }}>Tap another to compare</RNText>
        </View>
      )}

      {!shellOn && selObjs.length === 2 && (
        <View style={{ position: 'absolute', left: 12, right: 12, bottom: 16, zIndex: 12, backgroundColor: '#1a1e26', borderColor: '#2a2f39', borderWidth: 1, borderRadius: 16, padding: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <RNText style={{ color: '#9aa1ac', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>The gap</RNText>
            <Pressable onPress={() => setSel([])} hitSlop={12}>
              <RNText style={{ color: '#9aa1ac', fontSize: 14 }}>clear</RNText>
            </Pressable>
          </View>
          <RNText style={{ color: '#e8b84b', fontSize: 26, fontWeight: '700' }}>{fmtSpan(Math.abs(selObjs[0].pos - selObjs[1].pos))}</RNText>
          <RNText style={{ color: '#e9eaee', fontSize: 14, marginTop: 2 }}>between {selObjs[0].label} and {selObjs[1].label}</RNText>
          {config.compare(selObjs[0], selObjs[1]).map((line, i) => (
            <RNText key={i} style={{ color: '#c9ccd2', fontSize: 13, lineHeight: 19, marginTop: 8 }}>{line}</RNText>
          ))}
        </View>
      )}

      {/* ---- glass cross-section scrubber ---- */}
      {shellOn && (
        <BlurView intensity={36} tint="dark" style={{ position: 'absolute', left: 12, right: 12, bottom: 16, zIndex: 13, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' }}>
          <View style={{ padding: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <RNText style={{ color: '#e9eaee', fontSize: 13 }}>
                Cross-section at <RNText style={{ color: '#e8b84b', fontWeight: '700' }}>{fmt(shellPos)}</RNText>
              </RNText>
              <Pressable onPress={() => setShellOn(false)} hitSlop={10}>
                <RNText style={{ color: '#9aa1ac', fontSize: 13 }}>done</RNText>
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              {shellState.filter(({ cat }) => !hidden.has(cat.id)).map(({ cat, o }) => (
                <View key={cat.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 8, paddingVertical: 5, paddingHorizontal: 9 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: cat.color }} />
                  <RNText style={{ color: o ? '#e9eaee' : '#5b626c', fontSize: 12 }}>{o ? o.label : '—'}</RNText>
                </View>
              ))}
            </View>
            <RNText style={{ color: '#6a7280', fontSize: 11, marginTop: 10 }}>drag across the map to sweep</RNText>
          </View>
        </BlurView>
      )}
    </View>
  )
}
