import { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AccessibilityInfo, Keyboard, Platform, Pressable, ScrollView, SectionList, Text as RNText, TextInput, useWindowDimensions, View } from 'react-native'
import { Canvas, Fill, Group, Line, Circle, Text, matchFont, rect, useFont, vec } from '@shopify/react-native-skia'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { cancelAnimation, runOnJS, useAnimatedReaction, useAnimatedStyle, useDerivedValue, useSharedValue, withDecay, withSpring } from 'react-native-reanimated'
import { BlurView } from 'expo-blur'
import { MapContext } from './mapContext'
import { CATALOG, entryForLens, fallbackPrice, isLensOwned, type CatalogEntry } from './catalogue'
import type { StrataItem } from './engine/strata'
import {
  DRIFT_X_FRAC, FAN_K, FLING_MIN_V, clamp, dominantAxis, focusLaneView, interpView, jumpTx, layoutBands, lerp, liveTransform,
  needsCommit, panView, rectFits, toDrawn, zoomAtFocal, type Rect, type View as Vw,
} from './engine/viewport'
import { useReduceMotion } from './useReduceMotion'

// Maps in the quick-switch: every live map. Locked ones open at the overview
// (soft paywall); only depth is gated. Coming-soon entries (including preview
// packs outside the web) stay out.
const SWITCHABLE = CATALOG.filter((e) => e.lens && e.status !== 'coming-soon') as (CatalogEntry & { lens: NonNullable<CatalogEntry['lens']> })[]
// Zoom cap on a locked map: the sub-lane fan starts opening at k = 3, so this
// is exactly "the overview, fully browsable, but not the fan".
const LOCKED_MAX_K = 3
const MAX_K = 300

const L10 = Math.log10
const BG = '#101218'
const TOP = 112
const BOTTOM = 46
const SCRUB_H = 58 // persistent x-axis scrubber track along the bottom

// Springs, not timed transitions: every glide can be caught mid-flight by a
// touch and keeps its velocity when retargeted. View travel is critically
// damped (a map should not wobble); the scrubber follow is stiffer so it
// tracks the finger; the map-switch entrance is allowed a little give.
const GLIDE = { mass: 1, stiffness: 170, damping: 26 } // damping ratio ~1.0
const FOLLOW = { mass: 1, stiffness: 420, damping: 42 } // ~1.0, quicker
const ENTER = { mass: 1, stiffness: 210, damping: 21 } // ~0.72
const FLING_DECEL = 0.997
const TAP_AFTER_PINCH_MS = 180 // a tap landing as the second finger lifts is the end of the pinch, not a pick
const TAP_AFTER_CATCH_MS = 320 // a touch that stops a glide only stops it

// Native haptic tick (no-op off iOS / if the module is missing).
const haptic = (style: 'Light' | 'Medium' = 'Light') => {
  if (Platform.OS !== 'ios') return
  try {
    const H = require('expo-haptics')
    H.impactAsync(H.ImpactFeedbackStyle[style])
  } catch {}
}

const fontStyle = { fontFamily: Platform.select({ ios: 'Helvetica', default: 'sans-serif' }) as string, fontSize: 11 }
const fontBoldStyle = { fontFamily: Platform.select({ ios: 'Helvetica', default: 'sans-serif' }) as string, fontSize: 12, fontWeight: '600' as const }

/** The view the React tree last drew, plus the fan lane it drew open. */
type Drawn = Vw & { lock: string | null }

/** What the UI-thread gestures need to know about the current layout. */
interface Nav {
  usableH: number
  laneIds: string[]
  fanLanes: string[]
  subCounts: Record<string, number>
  tyMin: number
  renderedFan: string | null
  maxK: number
  locked: boolean
}

export default function StrataCanvas() {
  const { config, lens, setLens, openAtlas, openTips, store } = useContext(MapContext)
  // Soft paywall: locked maps browse freely at the overview; deep zoom, compare
  // and search raise the unlock bar (nudge) instead of a wall.
  const locked = !isLensOwned(lens, store.owned)
  const maxK = locked ? LOCKED_MAX_K : MAX_K
  const [nudge, setNudge] = useState(false)
  const { width: W, height: H } = useWindowDimensions()
  const reduce = useReduceMotion()
  const renderedFanRef = useRef<string | undefined>(undefined)
  const navRef = useRef<{ usableH: number; laneIds: string[]; subCount: (id: string) => number; nav: Nav }>({
    usableH: 0, laneIds: [], subCount: () => 1,
    nav: { usableH: 0, laneIds: [], fanLanes: [], subCounts: {}, tyMin: 0, renderedFan: null, maxK, locked },
  })
  // matchFont uses the OS system font provider -- native only, CanvasKit on web
  // has no system font access, so web needs a real bundled font file instead.
  const nativeFont = useMemo(() => { try { return matchFont(fontStyle) } catch { return null } }, [])
  const nativeFontBold = useMemo(() => { try { return matchFont(fontBoldStyle) } catch { return null } }, [])
  const webFont = useFont(require('../assets/fonts/Inter-Variable.ttf'), 11)
  const webFontBold = useFont(require('../assets/fonts/Inter-Variable.ttf'), 12)
  const font = Platform.OS === 'web' ? webFont : nativeFont
  const fontBold = Platform.OS === 'web' ? webFontBold : nativeFontBold

  // ---- the view, in two places ----
  // Live: shared values the gestures drive on the UI thread, every frame.
  // Drawn: React state the Skia tree is laid out from (labels, culling, fan).
  // React only re-draws when needsCommit says the live view has moved far
  // enough (or the motion has settled); in between, a transform carries the drawn frame to the live view,
  // so a pan or fling never waits on React.
  const [view, setView] = useState<Drawn>({ k: 1, tx: 0, ty: 0, lock: null })
  const viewRef = useRef(view)
  viewRef.current = view
  const drawnRef = useRef<Vw>({ k: 1, tx: 0, ty: 0 })
  const kS = useSharedValue(1)
  const txS = useSharedValue(0)
  const tyS = useSharedValue(0)
  const lockS = useSharedValue<string | null>(null) // fan lane held by the last zoom
  const drawnS = useSharedValue<Vw>({ k: 1, tx: 0, ty: 0 })
  const navS = useSharedValue<Nav>(navRef.current.nav)
  const sentS = useSharedValue<Vw>({ k: 1, tx: 0, ty: 0 })
  const reduceS = useSharedValue(reduce)
  // gesture bookkeeping (UI thread)
  const panAxisS = useSharedValue(0) // 0 undecided, 1 along time, 2 across lanes
  const panAccXS = useSharedValue(0)
  const panAccYS = useSharedValue(0)
  const pinchActiveS = useSharedValue(false)
  const pinchedS = useSharedValue(false) // a pinch happened during this touch: no fling on release
  const pinchEndAtS = useSharedValue(0)
  const lastScaleS = useSharedValue(1)
  const lastFxS = useSharedValue(NaN)
  const lastFyS = useSharedValue(NaN)
  const nudgedS = useSharedValue(false)
  const flingS = useSharedValue(false)
  const caughtAtS = useSharedValue(0)
  // spring glides between two whole views (chip focus, search, +/-, map open)
  const animT = useSharedValue(0)
  const animOnS = useSharedValue(false)
  const animFromS = useSharedValue<Vw>({ k: 1, tx: 0, ty: 0 })
  const animToS = useSharedValue<Vw>({ k: 1, tx: 0, ty: 0 })
  const enterS = useSharedValue(1) // map-switch entrance, 0 -> 1

  useEffect(() => { reduceS.value = reduce }, [reduce])

  const [sel, setSel] = useState<string[]>([])
  const [shellOn, setShellOn] = useState(false) // cross-section (meanwhile) panel, reads the view centre
  const [allSubs, setAllSubs] = useState(false)
  const [hidden, setHidden] = useState<Set<string>>(() => new Set())
  const [menuOpen, setMenuOpen] = useState(false)
  const [mapMenuOpen, setMapMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [listOpen, setListOpen] = useState(false) // screen-reader friendly list of every item
  const [query, setQuery] = useState('')
  // Scrubber drill-in: a nav stack of item ids. sheetIdx = -1 shows the chips.
  const [sheetHist, setSheetHist] = useState<string[]>([])
  const [sheetIdx, setSheetIdx] = useState(-1)
  const [sheetH, setSheetH] = useState(0) // measured height of the active bottom sheet
  const listTitleRef = useRef<any>(null)
  const wheelIdleRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const visibleRef = useRef<{ id: string; x: number; y: number; r: number }[]>([])

  // Re-draws are coalesced to one per frame.
  const pendingRef = useRef<Drawn | null>(null)
  const rafRef = useRef<number | null>(null)
  const commit = useCallback((k: number, tx: number, ty: number, lock: string | null) => {
    pendingRef.current = { k, tx, ty, lock }
    if (rafRef.current != null) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      const p = pendingRef.current
      pendingRef.current = null
      if (p) setView(p)
    })
  }, [])
  useEffect(() => () => { if (rafRef.current != null) cancelAnimationFrame(rafRef.current) }, [])

  // After every render, tell the UI thread what was drawn and the new layout.
  useLayoutEffect(() => {
    drawnS.value = drawnRef.current
    navS.value = navRef.current.nav
    // a sheet opening can shrink the vertical scroll range under the live view
    if (tyS.value < navRef.current.nav.tyMin) tyS.value = navRef.current.nav.tyMin
  })

  // UI thread: re-draw when the live view has moved enough.
  useAnimatedReaction(
    () => ({ k: kS.value, tx: txS.value, ty: tyS.value }),
    (live) => {
      if (!needsCommit(sentS.value, live, W)) return
      sentS.value = live
      runOnJS(commit)(live.k, live.tx, live.ty, lockS.value)
    },
    [W],
  )
  // UI thread: a glide in progress writes the in-between view.
  useAnimatedReaction(
    () => animT.value,
    (t) => {
      if (!animOnS.value) return
      const v = interpView(animFromS.value, animToS.value, t, W, navS.value.maxK)
      kS.value = v.k
      txS.value = v.tx
      tyS.value = v.ty
    },
    [W],
  )

  // Drawn frame -> live view. Content gets the full transform; lane titles
  // only follow vertically (they are pinned to the left edge); the time axis
  // only horizontally (it is pinned to the bottom).
  const fullT = useDerivedValue(() => {
    const t = liveTransform(drawnS.value, { k: kS.value, tx: txS.value, ty: tyS.value })
    return [{ translateX: t.dx }, { translateY: t.dy }, { scaleX: t.sx }]
  })
  const xT = useDerivedValue(() => {
    const t = liveTransform(drawnS.value, { k: kS.value, tx: txS.value, ty: tyS.value })
    return [{ translateX: t.dx }, { scaleX: t.sx }]
  })
  const yT = useDerivedValue(() => [{ translateY: tyS.value - drawnS.value.ty }])
  const enterT = useDerivedValue(() => [{ translateY: (1 - enterS.value) * 14 }])
  const enterO = useDerivedValue(() => enterS.value)
  // The scrubber thumb follows the live view directly.
  const thumbStyle = useAnimatedStyle(() => {
    const tw = Math.max(30, W / kS.value)
    return { width: tw, left: clamp(-txS.value / kS.value, 0, W - tw) }
  })

  // ---- UI-thread helpers (worklets) ----
  const settle = () => {
    'worklet'
    const live = { k: kS.value, tx: txS.value, ty: tyS.value }
    sentS.value = live
    runOnJS(commit)(live.k, live.tx, live.ty, lockS.value)
  }
  const stopMotion = () => {
    'worklet'
    cancelAnimation(txS)
    cancelAnimation(tyS)
    cancelAnimation(kS)
    cancelAnimation(animT)
    animOnS.value = false
    flingS.value = false
  }
  // One zoom step about a focal point (pinch on the UI thread, wheel on JS).
  // Which lane the fan opens for is decided by where you zoom (the band under
  // the focal point, or the vertically nearest fannable one), and the vertical
  // pan is re-anchored so that lane stays under your fingers. All maths lives
  // in engine/viewport.ts.
  const zoomStep = (f: number, fx: number, fy: number, pdx: number, pdy: number) => {
    'worklet'
    const nav = navS.value
    const v = { k: kS.value, tx: txS.value, ty: tyS.value }
    const r = zoomAtFocal({
      view: v, factor: f, focalX: fx, focalY: fy, panDx: pdx, panDy: pdy, W, maxK: nav.maxK, top: TOP,
      usableH: nav.usableH, laneIds: nav.laneIds, fanLanes: nav.fanLanes, subCount: nav.subCounts,
      // a framed open (k >= FAN_K, no zoom yet) shows a fan nobody has locked: adopt it
      lock: lockS.value ?? (v.k >= FAN_K ? nav.renderedFan : null),
    })
    lockS.value = r.lock
    kS.value = r.view.k
    txS.value = r.view.tx
    tyS.value = r.view.ty
  }
  const glideTx = (tx: number, follow: boolean) => {
    'worklet'
    if (reduceS.value) {
      txS.value = tx
      settle()
      return
    }
    txS.value = withSpring(tx, follow ? FOLLOW : GLIDE, (done) => {
      'worklet'
      if (done) settle()
    })
  }

  // ---- gestures ----
  const gesture = useMemo(() => {
    // One-finger drag locks to its dominant axis (horizontal = along time,
    // vertical = scroll between sub-lanes) so a sideways drag can't wobble the
    // lanes and vice versa. Ignored while two fingers are pinching. Released
    // with speed, it carries on and decays (unless Reduce Motion is on).
    const pan = Gesture.Pan()
      .onBegin(() => {
        if (flingS.value || animOnS.value) caughtAtS.value = Date.now()
        stopMotion()
        panAxisS.value = 0
        panAccXS.value = 0
        panAccYS.value = 0
        pinchedS.value = false
      })
      .onChange((e) => {
        if (pinchActiveS.value) return
        let dx = e.changeX
        let dy = e.changeY
        if (panAxisS.value === 0) {
          panAccXS.value += dx
          panAccYS.value += dy
          const ax = panAccXS.value
          const ay = panAccYS.value
          const axis = navS.value.tyMin < 0 ? dominantAxis(ax, ay) : ax || ay ? 'x' : null
          if (!axis) return
          panAxisS.value = axis === 'x' ? 1 : 2
          dx = ax
          dy = ay
        }
        const v = panView({ k: kS.value, tx: txS.value, ty: tyS.value }, panAxisS.value === 1 ? dx : 0, panAxisS.value === 2 ? dy : 0, W, navS.value.tyMin)
        txS.value = v.tx
        tyS.value = v.ty
      })
      .onEnd((e) => {
        const axis = panAxisS.value
        if (axis === 0 || pinchedS.value || reduceS.value) return
        const vel = axis === 1 ? e.velocityX : e.velocityY
        if (Math.abs(vel) < FLING_MIN_V) return
        flingS.value = true
        const done = (finished?: boolean) => {
          'worklet'
          if (!finished) return
          flingS.value = false
          settle()
        }
        if (axis === 1) txS.value = withDecay({ velocity: vel, clamp: [W - W * kS.value, 0], deceleration: FLING_DECEL }, done)
        else tyS.value = withDecay({ velocity: vel, clamp: [navS.value.tyMin, 0], deceleration: FLING_DECEL }, done)
      })
      .onFinalize(() => {
        if (!flingS.value && !animOnS.value) settle()
      })
    const pinch = Gesture.Pinch()
      .onStart(() => {
        stopMotion()
        pinchActiveS.value = true
        pinchedS.value = true
        lastScaleS.value = 1
        lastFxS.value = NaN
        lastFyS.value = NaN
        nudgedS.value = false
      })
      .onUpdate((e) => {
        if (!pinchActiveS.value) return
        const f = e.scale / lastScaleS.value
        lastScaleS.value = e.scale
        const had = !Number.isNaN(lastFxS.value)
        // the fingers' midpoint also carries the view (pinch + drag in one move)
        const pdx = had ? e.focalX - lastFxS.value : 0
        const pdy = had ? e.focalY - lastFyS.value : 0
        lastFxS.value = e.focalX
        lastFyS.value = e.focalY
        const nav = navS.value
        if (nav.locked && f > 1 && kS.value * f > nav.maxK && !nudgedS.value) {
          nudgedS.value = true
          runOnJS(setNudge)(true)
        }
        zoomStep(f, e.focalX, e.focalY, pdx, pdy)
      })
      .onFinalize(() => {
        if (!pinchActiveS.value) return
        pinchActiveS.value = false
        pinchEndAtS.value = Date.now()
        settle()
      })
    const tap = Gesture.Tap()
      .runOnJS(true)
      .maxDuration(260)
      .maxDistance(12)
      .onEnd((e) => {
        const now = Date.now()
        if (pinchActiveS.value || now - pinchEndAtS.value < TAP_AFTER_PINCH_MS) return
        if (now - caughtAtS.value < TAP_AFTER_CATCH_MS) return
        // Hit-test in the drawn frame: the live view may have moved since.
        const p = toDrawn(e.x, e.y, drawnRef.current, { k: kS.value, tx: txS.value, ty: tyS.value })
        const vis = visibleRef.current
        let best: (typeof vis)[number] | null = null
        let bd = Infinity
        for (const q of vis) {
          // Lanes are horizontal lines, so being off the line vertically is a
          // stronger sign of "not this one" than being along it: weight dy double.
          const d = Math.hypot(q.x - p.x, (q.y - p.y) * 2)
          if (d < bd) {
            bd = d
            best = q
          }
        }
        if (best && bd < Math.max(best.r + 14, 20)) {
          const id = best.id
          setSel((s) => {
            const next = s.includes(id) ? s.filter((x) => x !== id) : [...s, id].slice(-2)
            haptic(next.length === 2 ? 'Medium' : 'Light')
            return next
          })
        }
      })
    return Gesture.Simultaneous(pan, pinch, tap)
  }, [W])

  // The scrubber track is a navigator: drag/tap along it to pan the whole view
  // to that point on the axis (centre the view on the tapped x), so you can jump
  // end-to-end in one move instead of dragging many times. A tap glides there;
  // a drag follows the finger on a stiffer spring.
  const scrubGesture = useMemo(() => {
    const scrub = Gesture.Pan()
      .onBegin(() => { stopMotion() })
      .onChange((e) => { glideTx(jumpTx({ k: kS.value, tx: txS.value, ty: tyS.value }, e.x, W), true) })
    const scrubTap = Gesture.Tap().onEnd((e) => { glideTx(jumpTx({ k: kS.value, tx: txS.value, ty: tyS.value }, e.x, W), false) })
    return Gesture.Simultaneous(scrub, scrubTap)
  }, [W])

  // ---- JS-side view changes ----
  const liveView = (): Vw => ({ k: kS.value, tx: txS.value, ty: tyS.value })
  /** Put the view somewhere at once (map open, Reduce Motion). */
  const placeView = (v: Vw, lock: string | null) => {
    cancelAnimation(txS); cancelAnimation(tyS); cancelAnimation(animT)
    animOnS.value = false
    flingS.value = false
    lockS.value = lock
    kS.value = v.k
    txS.value = v.tx
    tyS.value = v.ty
    sentS.value = v
    setView({ ...v, lock })
  }
  /** Spring the whole view to `to`; `lock` undefined keeps the current fan lock.
   * With Reduce Motion on, it just places. */
  const glideTo = (to: Vw, lock?: string | null, from?: Vw) => {
    const lk = lock === undefined ? lockS.value : lock
    if (reduce) {
      placeView(to, lk)
      return
    }
    cancelAnimation(txS); cancelAnimation(tyS); cancelAnimation(animT)
    flingS.value = false
    lockS.value = lk
    animFromS.value = from ?? liveView()
    animToS.value = to
    animT.value = 0
    animOnS.value = true
    animT.value = withSpring(1, GLIDE, (done) => {
      'worklet'
      if (!done) return
      animOnS.value = false
      settle()
    })
  }


  // --- memoised derivations (all hooks run unconditionally, before any early return) ---
  const LANE_MAP = useMemo(() => Object.fromEntries((config?.lanes ?? []).map((l) => [l.id, l])), [config])
  const byId = useMemo(() => new Map((config?.items ?? []).map((o) => [o.id, o])), [config])
  const [loP, hiP] = useMemo(() => {
    if (config?.axis.domain) return config.axis.domain
    let lo = Infinity
    let hi = -Infinity
    for (const o of config?.items ?? []) {
      lo = Math.min(lo, o.pos)
      hi = Math.max(hi, o.pos)
    }
    if (!isFinite(lo)) return [0, 1]
    return [lo, hi]
  }, [config])
  // The list view: every item, by line, in axis order.
  const listSections = useMemo(() => (config?.lanes ?? []).map((l) => ({
    lane: l,
    data: (config?.items ?? []).filter((o) => o.lane === l.id).sort((a, b) => a.pos - b.pos),
  })).filter((s) => s.data.length > 0), [config])

  // Open framed on config.axis.frame (e.g. Earth's neighbourhood) instead of the
  // flat whole-span overview. Switching maps starts at the new map's overview
  // and springs into its frame; the content eases in either way. A resize just
  // re-places. Locked maps open at the whole-span overview, framed on unlock.
  const lastMapRef = useRef<string | null>(null)
  const lastLockedRef = useRef(locked)
  useEffect(() => {
    if (!config) return
    const switched = lastMapRef.current !== config.id
    const unlocked = lastLockedRef.current && !locked
    lastMapRef.current = config.id
    lastLockedRef.current = locked
    const overview = { k: 1, tx: 0, ty: 0 }
    let target: Vw = overview
    const f = config.axis.frame
    if (!locked && f) {
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
      const nk = Math.max(1, Math.min(60, 1 / span))
      target = { k: nk, tx: clamp(-uu(f[0]) * W * nk, W - W * nk, 0), ty: 0 }
    }
    if (switched) {
      placeView(overview, null)
      if (!reduce) {
        enterS.value = 0
        enterS.value = withSpring(1, ENTER)
      }
      if (target.k > 1.001) glideTo(target, null, overview)
    } else if (unlocked) {
      glideTo(target, null)
    } else {
      placeView(target, null)
    }
  }, [config, W, locked])

  // Reset transient state when switching maps.
  useEffect(() => {
    setSel([])
    setShellOn(false)
    setHidden(new Set())
    setAllSubs(false)
    setMenuOpen(false)
    setMapMenuOpen(false)
    setSearchOpen(false)
    setListOpen(false)
    setSheetHist([])
    setSheetIdx(-1)
    setQuery('')
    setNudge(false)
  }, [config?.id])

  // The list overlay: move focus into it on open, close on Escape (web).
  useEffect(() => {
    if (!listOpen) return
    const t = setTimeout(() => {
      const node = listTitleRef.current
      if (!node) return
      if (Platform.OS === 'web') node.focus?.()
      else {
        const { findNodeHandle } = require('react-native')
        const h = findNodeHandle(node)
        if (h) AccessibilityInfo.setAccessibilityFocus(h)
      }
    }, 60)
    if (Platform.OS !== 'web' || typeof window === 'undefined') return () => clearTimeout(t)
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setListOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => { clearTimeout(t); window.removeEventListener('keydown', onKey) }
  }, [listOpen])

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

  // Pin the data edges to the screen edges: the content always fills the width,
  // you can't pan or zoom out into empty space past the ends.
  const clampTx = (tx: number, k: number, w: number) => clamp(tx, w - w * k, 0)
  const unit = (v: number) => (ax(v) - lo) / (hi - lo)
  const sx = (v: number) => unit(v) * W * view.k + view.tx
  const posAtPx = (px: number) => inv(lo + ((px - viewRef.current.tx) / (W * viewRef.current.k)) * (hi - lo))
  const k = view.k
  const shellPos = posAtPx(W / 2) // the meanwhile cross-section reads the view centre
  // Draw this far past each edge so a pan between re-draws never shows a gap.
  const MARGIN = W * DRIFT_X_FRAC + 80

  // Position-aware fan: whichever fannable lane is most centred on screen opens
  // (so zooming into the Solar System opens it; into the constellations opens them).
  const fanCandidates = config.fanLanes ?? []
  let fanLaneId: string | undefined
  // A pinch or wheel zoom remembers the lane band under its focal point when the
  // fan starts opening (k crosses FAN_K), and holds it until you zoom back out.
  // Before this, the fan picked whichever fannable lane was most centred
  // horizontally, so zooming into the constellations could open the Solar
  // System fan and shove the lane under your fingers into a sliver.
  if (view.lock && fanCandidates.includes(view.lock)) fanLaneId = view.lock
  if (!fanLaneId) {
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
  const subNamesFor = (laneId: string | undefined) => {
    if (!laneId) return [] as string[]
    const s = new Set<string>()
    for (const o of ITEMS) if (o.lane === laneId && o.sub) s.add(o.sub)
    const primary = (config.fanPrimary ?? []).filter((x) => s.has(x))
    const featured = config.fanFeatured ? new Set(config.fanFeatured) : null
    let rest = [...s].filter((x) => !primary.includes(x))
    if (featured && !allSubs) {
      const f = rest.filter((x) => featured.has(x))
      if (f.length) rest = f // only applies where featured matches (constellations), not the Solar System
    }
    rest.sort()
    return [...primary, ...rest]
  }
  const subNames = subNamesFor(fanLaneId)
  renderedFanRef.current = fanLaneId
  const subIndex = new Map(subNames.map((c, i) => [c, i]))

  // Zooming past the locked cap does nothing to the view but raises the nudge.
  const wantsDeeper = (f: number) => {
    if (locked && f > 1 && kS.value * f > maxK) setNudge(true)
  }
  // +/- buttons zoom about the centre of the lanes, so the lane you are
  // looking at stays selected, and glide there.
  const zoomBy = (f: number) => {
    wantsDeeper(f)
    const cur = liveView()
    const nav = navRef.current
    const r = zoomAtFocal({
      view: cur, factor: f, focalX: W / 2, focalY: TOP + nav.usableH / 2, W, maxK, top: TOP,
      usableH: nav.usableH, laneIds: nav.laneIds, fanLanes: config.fanLanes ?? [], subCount: nav.subCount,
      lock: lockS.value ?? (cur.k >= FAN_K ? renderedFanRef.current ?? null : null),
    })
    glideTo(r.view, r.lock)
  }

  // Switch which lane the fan is open on (tap a lane chip), with a glide.
  // Tapping the open lane again closes the fan.
  const focusLane = (id: string) => {
    if (!(config.fanLanes ?? []).includes(id)) return false
    if (hidden.has(id)) setHidden((hs) => { const nx = new Set(hs); nx.delete(id); return nx })
    const cur = liveView()
    if (lockS.value === id && cur.k >= FAN_K) {
      glideTo({ k: 1, tx: 0, ty: 0 }, null)
      return true
    }
    if (maxK < FAN_K) { setNudge(true); return true }
    const nav = navRef.current
    const r = focusLaneView({
      view: cur, laneId: id, W, maxK, top: TOP, usableH: nav.usableH,
      laneIds: hidden.has(id) ? [...nav.laneIds, id] : nav.laneIds, subCount: nav.subCount,
    })
    glideTo(r.view, r.lock)
    if (locked) setNudge(true)
    return true
  }
  const toggleHidden = (id: string) => {
    if (lockS.value === id) {
      lockS.value = null
      setView((v) => ({ ...v, lock: null }))
    }
    setHidden((hs) => { const nx = new Set(hs); if (nx.has(id)) nx.delete(id); else nx.add(id); return nx })
  }

  // Web only: trackpad pinch and mouse-wheel scroll both arrive as wheel events
  // (trackpad pinch sets ctrlKey), so this is what "pinch or scroll to zoom"
  // actually means on desktop web -- react-native-gesture-handler's Pinch
  // gesture has no equivalent for either. Zoom centres on the cursor, same math
  // as the pinch. A sideways two-finger trackpad swipe pans along time.
  const onWheel = (e: any) => {
    e.preventDefault?.()
    const ne = e.nativeEvent ?? e
    const deltaY = ne.deltaY ?? 0
    const deltaX = ne.deltaX ?? 0
    if (!deltaY && !deltaX) return
    cancelAnimation(txS); cancelAnimation(tyS); cancelAnimation(animT)
    animOnS.value = false
    flingS.value = false
    if (!ne.ctrlKey && Math.abs(deltaX) > Math.abs(deltaY)) {
      const v = panView(liveView(), -deltaX, 0, W, navRef.current.nav.tyMin)
      txS.value = v.tx
    } else {
      // Not offsetX/Y: on Skia's DPR-scaled canvas element those come back at
      // half the cursor position, which anchored the zoom (and the fan lane)
      // to the wrong place. Client coordinates against the container are exact.
      const box = e.currentTarget?.getBoundingClientRect?.()
      const focalX = ne.clientX != null ? ne.clientX - (box?.left ?? 0) : W / 2
      const focalY = ne.clientY != null ? ne.clientY - (box?.top ?? 0) : H / 2
      const f = Math.exp(clamp(-deltaY * 0.01, -0.5, 0.5))
      wantsDeeper(f)
      zoomStep(f, focalX, focalY, 0, 0)
    }
    // re-draw once the wheel goes quiet, for the last few pixels of a pan
    if (wheelIdleRef.current) clearTimeout(wheelIdleRef.current)
    wheelIdleRef.current = setTimeout(() => { const v = liveView(); commit(v.k, v.tx, v.ty, lockS.value) }, 140)
  }

  // Open an item from the list: select it and glide the map to it.
  const showItem = (o: StrataItem) => {
    setListOpen(false)
    if (hidden.has(o.lane)) setHidden((hs) => { const nx = new Set(hs); nx.delete(o.lane); return nx })
    const cur = liveView()
    const nk = Math.min(maxK, Math.max(cur.k, 4))
    glideTo({ k: nk, tx: clampTx(W / 2 - unit(clamp(o.pos, loP, hiP)) * W * nk, nk, W), ty: cur.ty })
    setSel([o.id])
  }

  // ---- layout: one band per VISIBLE lane (hidden lanes reclaim their space);
  // the fan lane expands into sub-lanes on zoom ----
  // Condense the lines when any bottom sheet is up (scrubber or a tapped-item
  // readout) so it never covers a line or the selected item.
  const sheetUp = sel.length > 0 || shellOn || sheetIdx >= 0
  const usableH = H - TOP - BOTTOM - SCRUB_H - (sheetUp ? (sheetH > 0 ? sheetH : 150) + 16 : 0)
  const mSub = Math.max(1, subNames.length)
  const visLanes = LANES.filter((l) => !hidden.has(l.id))
  const nVis = Math.max(1, visLanes.length)
  const visPos = new Map(visLanes.map((l, vp) => [l.id, vp]))
  const fanVis = fanLaneId != null ? visPos.get(fanLaneId) ?? -1 : -1
  // The fan band gets a minimum height per sub-lane, so many sub-lanes (e.g. all
  // constellations) can exceed the screen; drag vertically to reach the rest.
  const { bands, sp, tyMin } = layoutBands({
    top: TOP, usableH, laneIds: visLanes.map((l) => l.id), fanLaneId: fanVis >= 0 ? fanLaneId : undefined, subCount: mSub, k,
  })
  {
    const laneIds = visLanes.map((l) => l.id)
    const subCount = (id: string) => Math.max(1, subNamesFor(id).length)
    const subCounts: Record<string, number> = {}
    for (const id of fanCandidates) subCounts[id] = subCount(id)
    navRef.current = {
      usableH, laneIds, subCount,
      nav: { usableH, laneIds, fanLanes: fanCandidates, subCounts, tyMin, renderedFan: fanLaneId ?? null, maxK, locked },
    }
  }
  const ty = clamp(view.ty, tyMin, 0)
  drawnRef.current = { k: view.k, tx: view.tx, ty }
  const laneCenterY = (laneId: string) => {
    const vp = visPos.get(laneId)
    if (vp == null) return -1000
    return bands[vp].top + bands[vp].h / 2 + ty
  }
  const subY = (si: number) => {
    const b = bands[fanVis >= 0 ? fanVis : 0]
    const pad = b.h * 0.05
    return b.top + pad + ((b.h - 2 * pad) * (si + 0.5)) / mSub + ty
  }
  const objY = (o: StrataItem) => {
    if (fanLaneId && o.lane === fanLaneId && sp > 0.02 && o.sub) {
      const si = subIndex.get(o.sub)
      if (si != null) return lerp(laneCenterY(o.lane), subY(si), sp)
    }
    return laneCenterY(o.lane)
  }

  const showImp = (i: number) => (i <= 3 ? true : k >= (config.lodImp4K ?? 2.2))
  const showLbl = (i: number) => (i === 1 ? true : i === 2 ? k >= 1.1 : i === 3 ? k >= 1.9 : k >= 3.5)

  const visible = ITEMS.filter((o) => showImp(o.importance) && !hidden.has(o.lane))
    .map((o) => ({ o, x: sx(clamp(o.pos, loP, hiP)), y: objY(o), c: LANE_MAP[o.lane].color }))
    .filter((p) => p.x > -MARGIN && p.x < W + MARGIN)
    .sort((a, b) => b.o.importance - a.o.importance)
  visibleRef.current = visible.map((p) => ({ id: p.o.id, x: p.x, y: p.y, r: p.o.importance === 1 ? 6.5 : p.o.importance === 2 ? 4.6 : p.o.importance === 3 ? 3.3 : 2.5 }))

  const laneInView = new Set(visible.map((p) => p.o.lane))
  type Cand = (typeof visible)[number]
  const labels: { p: Cand; side: 1 | -1 }[] = []
  // Collide on real rectangles (x span AND y row). The old per-side lists were
  // global, so labels on different lines blocked each other, while neighbouring
  // sub-lanes in the fan (26px apart) could still overprint each other.
  const placed: Rect[] = []
  // Lane and sub-lane titles are drawn at the left edge: reserve their space so item labels steer around them.
  for (const c of visLanes) {
    if (c.id === fanLaneId && sp > 0.3) continue
    const ly = laneCenterY(c.id)
    placed.push({ l: 6, r: 10 + c.name.length * 6.4, t: ly - 7 - 11, b: ly - 7 + 3 })
  }
  if (fanLaneId && fanVis >= 0 && sp > 0.6) {
    subNames.forEach((sign, si) => {
      const sy = subY(si)
      placed.push({ l: 5, r: 9 + sign.length * 6.4, t: sy - 3 - 11, b: sy - 3 + 3 })
    })
  }
  let toggle = 0
  const place = (cands: Cand[]) => {
    for (const c of cands.sort((a, b) => a.x - b.x)) {
      const wpx = c.o.label.length * 6.1 + 6
      const right = c.x > W - 150
      const La = right ? c.x - wpx : c.x
      const Ra = right ? c.x : c.x + wpx
      const order: (1 | -1)[] = toggle++ % 2 === 0 ? [-1, 1] : [1, -1]
      for (const side of order) {
        const base = c.y + (side === -1 ? -9 : 16) // text baseline, as drawn
        const rect = { l: La, r: Ra, t: base - 11, b: base + 3 }
        if (rectFits(placed, rect)) {
          placed.push(rect)
          labels.push({ p: c, side })
          break
        }
      }
    }
  }
  // Label rank = importance, but wars are demoted a tier so discoveries and
  // ideas headline (the dots are unchanged; only who wins the label space).
  const labelRank = (o: StrataItem) => Math.min(4, o.importance + (o.domain === 'war' ? 1 : 0))
  place(visible.filter((p) => labelRank(p.o) === 1 && showLbl(1)))
  place(visible.filter((p) => labelRank(p.o) === 2 && showLbl(2)))
  place(visible.filter((p) => labelRank(p.o) === 3 && showLbl(3)))
  place(visible.filter((p) => labelRank(p.o) === 4 && showLbl(4)))

  const ticks: { d: number; x: number }[] = []
  {
    let lastTx = -1e9
    for (const d of config.axis.ticks) {
      if (d < loP || d > hiP) continue
      const x = sx(d)
      if (x < -MARGIN || x > W + MARGIN) continue
      if (x - lastTx < 70) continue
      lastTx = x
      ticks.push({ d, x })
    }
  }

  const selObjs = sel.map((id) => byId.get(id)).filter(Boolean) as StrataItem[]
  const laneNameOf = (id: string) => LANE_MAP[id]?.name ?? id

  const shellState = shellOn
    ? (() => {
        // Only surface a line's event if it's genuinely "meanwhile": within a
        // fraction of the on-screen span of the scrubber. Otherwise the globally
        // nearest event (e.g. Islam at 610 AD) would show even at 3000 BC.
        const visSpan = Math.abs(ax(posAtPx(W)) - ax(posAtPx(0)))
        const thresh = visSpan * 0.35
        return LANES.map((cat) => {
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
          return { cat, o: best && bd <= thresh ? best : null }
        })
      })()
    : []

  const runSearch = () => {
    const q = query.trim().toLowerCase()
    setSearchOpen(false)
    if (!q) return
    const hit = ITEMS.find((o) => o.label.toLowerCase().includes(q))
    if (!hit) return
    const nk = Math.min(maxK, Math.max(kS.value, 8))
    glideTo({ k: nk, tx: clampTx(W / 2 - unit(hit.pos) * W * nk, nk, W), ty: 0 })
    setSel([hit.id])
  }

  const fanColor = fanIdx >= 0 ? LANES[fanIdx].color : '#C56BD6'
  const shellX = sx(shellPos)

  const menuBox = { backgroundColor: '#1a1e26', borderColor: '#2a2f39', borderWidth: 1, borderRadius: 10, padding: 4 } as const
  const item = { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, paddingVertical: 9, paddingHorizontal: 10, gap: 14 }
  const btn = { backgroundColor: '#181b22', borderColor: '#2a2f39', borderWidth: 1, borderRadius: 8, paddingVertical: 7, paddingHorizontal: 10 } as const

  return (
    <View style={{ flex: 1, backgroundColor: BG }} {...(Platform.OS === 'web' ? { onWheel } : {})}>
      {/* The canvas is one picture to assistive tech; the list view (header ☰) carries its items. */}
      <View
        style={{ flex: 1 }}
        accessible
        accessibilityRole="image"
        accessibilityLabel={`${config.name} map: ${ITEMS.length} items on ${LANES.length} lines. Open the list to browse them.`}
      >
      <GestureDetector gesture={gesture}>
        <Canvas style={{ flex: 1 }}>
          <Fill color={BG} />
          {/* time axis: follows the live view horizontally only */}
          <Group transform={xT}>
          {ticks.map((t) => (
            <Group key={`t${t.d}`}>
              <Line p1={vec(t.x, TOP - 8)} p2={vec(t.x, H - BOTTOM - SCRUB_H +8)} color="#23272f" strokeWidth={0.5} />
              {font && <Text x={t.x - 20} y={H - BOTTOM - SCRUB_H +24} text={fmt(t.d)} font={font} color="#6a7280" />}
            </Group>
          ))}
          </Group>

          {/* Clip lanes to the content area: lanes the fan pushes above/below it must not draw over the header, chip row or the time axis. */}
          <Group clip={rect(0, TOP - 4, W, H - BOTTOM - SCRUB_H - (TOP - 4))}>
          <Group transform={enterT} opacity={enterO}>

          {/* lines: full live transform */}
          <Group transform={fullT}>
          {LANES.map((c) => {
            if (hidden.has(c.id)) return null
            const y = laneCenterY(c.id)
            const isFan = c.id === fanLaneId
            return <Line key={c.id} p1={vec(clamp(sx(loP), -MARGIN, W + MARGIN), y)} p2={vec(clamp(sx(hiP), -MARGIN, W + MARGIN), y)} color={c.color} strokeWidth={2.4} strokeCap="round" opacity={isFan ? 0.85 * (1 - sp) : 0.85} />
          })}
          {fanLaneId && fanVis >= 0 && !hidden.has(fanLaneId) && sp > 0.02 &&
            subNames.map((sign, si) => {
              const y = subY(si)
              return <Line key={`zs${sign}`} p1={vec(clamp(sx(loP), -MARGIN, W + MARGIN), y)} p2={vec(clamp(sx(hiP), -MARGIN, W + MARGIN), y)} color={fanColor} strokeWidth={1} strokeCap="round" opacity={0.16 + 0.4 * sp} />
            })}
          </Group>

          {/* lane and sub-lane titles, empty-lane cues: pinned to the left edge, follow vertically */}
          <Group transform={yT}>
          {font && LANES.map((c) => {
            if (hidden.has(c.id)) return null
            const y = laneCenterY(c.id)
            const isFan = c.id === fanLaneId
            return <Text key={`n${c.id}`} x={8} y={y - 7} text={c.name} font={font} color={c.color} opacity={isFan ? Math.max(0, 1 - sp * 1.6) : 0.92} />
          })}
          {font && LANES.map((c) => {
            // Empty-lane cue: a line with nothing in this stretch says so, instead of looking broken.
            if (hidden.has(c.id) || (c.id === fanLaneId && sp > 0.3) || laneInView.has(c.id)) return null
            const msg = 'nothing in view: zoom or pan'
            const cy = laneCenterY(c.id)
            if (cy < TOP + 6 || cy + 24 > H - BOTTOM - SCRUB_H) return null
            return <Text key={`e${c.id}`} x={W / 2 - msg.length * 2.9} y={laneCenterY(c.id) + 16} text={msg} font={font} color={c.color} opacity={0.45} />
          })}
          {font && fanLaneId && fanVis >= 0 && !hidden.has(fanLaneId) && sp > 0.6 &&
            subNames.map((sign, si) => {
              const laneH = (bands[fanVis].h * 0.9) / mSub
              if (laneH <= 13) return null
              return <Text key={`zt${sign}`} x={7} y={subY(si) - 3} text={sign} font={font} color={fanColor} opacity={(sp - 0.6) / 0.4} />
            })}
          </Group>

          {shellOn && (
            <Group>
              <Line p1={vec(shellX, TOP - 10)} p2={vec(shellX, H - BOTTOM - SCRUB_H +8)} color="#e8b84b" strokeWidth={1.5} />
              {font && <Text x={shellX - 30} y={TOP + 12} text={fmt(shellPos)} font={font} color="#e8b84b" />}
            </Group>
          )}

          {/* items, the measuring line and labels: full live transform */}
          <Group transform={fullT}>
          {visible.map((p) => {
            const imp = p.o.importance
            const r = imp === 1 ? 6.5 : imp === 2 ? 4.6 : imp === 3 ? 3.3 : 2.5
            const isSel = sel.includes(p.o.id)
            const x2 = p.o.end != null ? clamp(sx(p.o.end), -MARGIN, W + MARGIN) : null
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
          </Group>
          </Group>
          </Group>
        </Canvas>
      </GestureDetector>
      </View>

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
            <Pressable style={btn} accessibilityRole="button" accessibilityLabel="Close search" onPress={() => { setSearchOpen(false); setQuery(''); Keyboard.dismiss() }}>
              <RNText style={{ color: '#e9eaee', fontSize: 15 }}>✕</RNText>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable style={{ flexShrink: 1 }} accessibilityRole="button" accessibilityLabel={`Map: ${config.name}. Switch map`} accessibilityState={{ expanded: mapMenuOpen }} onPress={() => { setMapMenuOpen((v) => !v); setMenuOpen(false) }}>
              <RNText maxFontSizeMultiplier={1.15} numberOfLines={1} style={{ color: '#e9eaee', fontSize: 16, fontWeight: '500' }}>Strata · {config.name} ▾</RNText>
            </Pressable>
            <Pressable style={btn} accessibilityRole="button" accessibilityLabel="Options" accessibilityState={{ expanded: menuOpen }} onPress={() => { setMenuOpen((v) => !v); setMapMenuOpen(false) }}>
              <RNText maxFontSizeMultiplier={1.15} numberOfLines={1} style={{ color: '#e9eaee', fontSize: 13 }}>Options ▾</RNText>
            </Pressable>
            <View style={{ flex: 1 }} />
            <Pressable style={btn} accessibilityRole="button" accessibilityLabel="List every item" onPress={() => { setListOpen(true); setMenuOpen(false); setMapMenuOpen(false) }}>
              <RNText maxFontSizeMultiplier={1.15} numberOfLines={1} style={{ color: '#e9eaee', fontSize: 15 }}>☰</RNText>
            </Pressable>
            <Pressable style={btn} accessibilityRole="button" accessibilityLabel="Search" onPress={() => (locked ? setNudge(true) : setSearchOpen(true))}>
              <RNText maxFontSizeMultiplier={1.15} numberOfLines={1} style={{ color: '#e9eaee', fontSize: 15 }}>⌕</RNText>
            </Pressable>
            <Pressable style={btn} accessibilityRole="button" accessibilityLabel="Zoom out" onPress={() => zoomBy(1 / 1.4)}>
              <RNText maxFontSizeMultiplier={1.15} numberOfLines={1} style={{ color: '#e9eaee', fontSize: 15 }}>–</RNText>
            </Pressable>
            <Pressable style={btn} accessibilityRole="button" accessibilityLabel="Zoom in" onPress={() => zoomBy(1.4)}>
              <RNText maxFontSizeMultiplier={1.15} numberOfLines={1} style={{ color: '#e9eaee', fontSize: 15 }}>+</RNText>
            </Pressable>
          </>
        )}
      </View>

      {/* ---- lane chips: always-visible way to switch lane view. Tap a fan lane to
           focus it (tap again to close), hold any lane to hide / show it. ---- */}
      {!searchOpen && LANES.length > 1 && (
        <View style={{ position: 'absolute', top: 88, left: 0, right: 0, height: 24, zIndex: 10 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 6, alignItems: 'center' }}>
            {LANES.map((c) => {
              const off = hidden.has(c.id)
              const canFan = (config.fanLanes ?? []).includes(c.id)
              const active = !off && c.id === fanLaneId && k >= FAN_K
              return (
                <Pressable
                  key={c.id}
                  accessibilityLabel={`${c.name} line`}
                  accessibilityHint={canFan ? 'Tap to focus this line, hold to hide or show it' : 'Tap or hold to hide or show this line'}
                  onPress={() => { if (!canFan || !focusLane(c.id)) toggleHidden(c.id) }}
                  onLongPress={() => toggleHidden(c.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 4, right: 4 }}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 3, paddingHorizontal: 8, borderRadius: 12, borderWidth: 1, borderColor: active ? c.color : '#2a2f39', backgroundColor: active ? '#1a1e26' : 'transparent', opacity: off ? 0.4 : 1 }}
                >
                  <View style={{ width: 7, height: 7, borderRadius: 2, backgroundColor: c.color }} />
                  <RNText maxFontSizeMultiplier={1.15} numberOfLines={1} style={{ color: '#e9eaee', fontSize: 11 }}>{c.name}</RNText>
                </Pressable>
              )
            })}
          </ScrollView>
        </View>
      )}

      {mapMenuOpen && (
        <View style={{ position: 'absolute', top: 82, left: 12, zIndex: 30, minWidth: 200, ...menuBox }}>
          {SWITCHABLE.map((e) => {
            const owned = isLensOwned(e.lens, store.owned)
            return (
              <Pressable key={e.lens} style={item} onPress={() => { setLens(e.lens); setMapMenuOpen(false) }}>
                <RNText style={{ color: '#e9eaee', fontSize: 14 }}>{e.name}</RNText>
                <RNText style={{ color: owned ? '#e8b84b' : '#6a7280', fontSize: owned ? 14 : 11 }}>{e.lens === lens ? '✓' : owned ? '' : e.preview ? 'preview' : store.prices[e.id] ?? fallbackPrice(e) ?? ''}</RNText>
              </Pressable>
            )
          })}
          <View style={{ height: 1, backgroundColor: '#2a2f39', marginVertical: 4 }} />
          <Pressable style={item} onPress={() => { setMapMenuOpen(false); openAtlas() }}>
            <RNText style={{ color: '#e9eaee', fontSize: 14 }}>Browse all maps</RNText>
            <RNText style={{ color: '#9aa1ac' }}>›</RNText>
          </Pressable>
          <Pressable style={item} onPress={() => { setMapMenuOpen(false); openTips() }}>
            <RNText style={{ color: '#e9eaee', fontSize: 14 }}>How to use</RNText>
            <RNText style={{ color: '#9aa1ac' }}>›</RNText>
          </Pressable>
        </View>
      )}

      {menuOpen && (
        <View style={{ position: 'absolute', top: 82, left: 90, zIndex: 30, minWidth: 210, maxHeight: H - 160, ...menuBox }}>
          <ScrollView>
            <Pressable style={item} onPress={() => setShellOn((v) => !v)}>
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
              <Pressable key={c.id} style={item} onPress={() => toggleHidden(c.id)}>
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
        <View onLayout={(e) => setSheetH(e.nativeEvent.layout.height)} style={{ position: 'absolute', left: 12, right: 12, bottom: SCRUB_H + 10, zIndex: 12, backgroundColor: '#1a1e26', borderColor: '#2a2f39', borderWidth: 1, borderRadius: 16, padding: 18 }}>
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

      {/* ---- unlock bar (soft paywall): deep zoom, compare or search on a locked map ---- */}
      {locked && (nudge || (!shellOn && selObjs.length === 2)) && (() => {
        const entry = entryForLens(lens)
        const price = entry ? store.prices[entry.id] ?? fallbackPrice(entry) : undefined
        const dismiss = () => { setNudge(false); if (selObjs.length === 2) setSel([selObjs[0].id]) }
        return (
          <View onLayout={(e) => setSheetH(e.nativeEvent.layout.height)} style={{ position: 'absolute', left: 12, right: 12, bottom: SCRUB_H + 10, zIndex: 14, backgroundColor: '#1a1e26', borderColor: '#e8b84b', borderWidth: 1, borderRadius: 16, padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <RNText style={{ color: '#e8b84b', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>{entry?.preview ? `${config.name} preview` : `Unlock ${config.name}`}</RNText>
              <Pressable onPress={dismiss} hitSlop={12}>
                <RNText style={{ color: '#9aa1ac', fontSize: 14 }}>not now</RNText>
              </Pressable>
            </View>
            <RNText style={{ color: '#c9ccd2', fontSize: 13, lineHeight: 19 }}>
              {selObjs.length === 2 && !nudge ? 'Comparing two points' : 'Deep zoom and search'} {entry?.preview ? 'arrive with the iPhone pack, which is on its way' : 'come with the pack'}. The overview stays free to browse.
            </RNText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 }}>
              {store.canPurchase && entry ? (
                <>
                  <Pressable disabled={store.busy} onPress={() => store.purchase(entry.id)} style={{ backgroundColor: '#2a2233', borderColor: '#e8b84b', borderWidth: 1, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 14 }}>
                    <RNText style={{ color: '#e9eaee', fontSize: 14, fontWeight: '600' }}>{store.busy ? 'One moment…' : `Unlock ${price ?? ''}`.trim()}</RNText>
                  </Pressable>
                  <Pressable disabled={store.busy} onPress={() => { setNudge(false); openAtlas() }} hitSlop={8}>
                    <RNText style={{ color: '#9aa1ac', fontSize: 13 }}>All packs ›</RNText>
                  </Pressable>
                </>
              ) : (
                <Pressable onPress={() => { setNudge(false); openAtlas() }} style={{ backgroundColor: '#2a2233', borderColor: '#e8b84b', borderWidth: 1, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 14 }}>
                  <RNText style={{ color: '#e9eaee', fontSize: 14, fontWeight: '600' }}>{Platform.OS === 'ios' || entry?.preview ? 'See packs' : 'Unlock in the iPhone app'}</RNText>
                </Pressable>
              )}
            </View>
          </View>
        )
      })()}

      {!shellOn && selObjs.length === 2 && !locked && (
        <View onLayout={(e) => setSheetH(e.nativeEvent.layout.height)} style={{ position: 'absolute', left: 12, right: 12, bottom: SCRUB_H + 10, zIndex: 12, backgroundColor: '#1a1e26', borderColor: '#2a2f39', borderWidth: 1, borderRadius: 16, padding: 18 }}>
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

      {/* ---- glass cross-section scrubber (chip list) ---- */}
      {shellOn && sheetIdx < 0 && (
        <BlurView onLayout={(e) => setSheetH(e.nativeEvent.layout.height)} intensity={36} tint="dark" style={{ position: 'absolute', left: 12, right: 12, bottom: SCRUB_H + 10, zIndex: 13, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' }}>
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
                <Pressable
                  key={cat.id}
                  disabled={!o}
                  onPress={() => { if (o) { setSheetHist((h) => [...h, o.id]); setSheetIdx(sheetHist.length) } }}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 9 }}
                >
                  <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: cat.color }} />
                  <RNText style={{ color: o ? '#e9eaee' : '#5b626c', fontSize: 12 }}>{o ? o.label : '—'}</RNText>
                </Pressable>
              ))}
            </View>
            <RNText style={{ color: '#6a7280', fontSize: 11, marginTop: 10 }}>drag to sweep · tap one to open it</RNText>
          </View>
        </BlurView>
      )}

      {/* ---- scrubber drill-in detail sheet (with back / forward / close all) ---- */}
      {shellOn && sheetIdx >= 0 && (() => {
        const cur = byId.get(sheetHist[sheetIdx])
        if (!cur) return null
        return (
          <BlurView onLayout={(e) => setSheetH(e.nativeEvent.layout.height)} intensity={40} tint="dark" style={{ position: 'absolute', left: 12, right: 12, bottom: SCRUB_H + 10, zIndex: 14, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)' }}>
            <View style={{ padding: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
                  <Pressable onPress={() => setSheetIdx(sheetIdx - 1)} hitSlop={8}>
                    <RNText style={{ color: '#9aa1ac', fontSize: 14 }}>‹ Back</RNText>
                  </Pressable>
                  {sheetIdx < sheetHist.length - 1 && (
                    <Pressable onPress={() => setSheetIdx(sheetIdx + 1)} hitSlop={8}>
                      <RNText style={{ color: '#9aa1ac', fontSize: 14 }}>Forward ›</RNText>
                    </Pressable>
                  )}
                </View>
                <Pressable onPress={() => { setShellOn(false); setSheetHist([]); setSheetIdx(-1) }} hitSlop={8}>
                  <RNText style={{ color: '#9aa1ac', fontSize: 14 }}>Close all ✕</RNText>
                </Pressable>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <View style={{ width: 9, height: 9, borderRadius: 2, backgroundColor: LANE_MAP[cur.lane]?.color ?? '#e8b84b' }} />
                <RNText style={{ color: '#9aa1ac', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>{laneNameOf(cur.lane)}{cur.sub ? ` · ${cur.sub}` : ''}</RNText>
              </View>
              <RNText style={{ color: '#e9eaee', fontSize: 22, fontWeight: '700' }}>{cur.label}</RNText>
              <RNText style={{ color: '#e8b84b', fontSize: 14, marginTop: 2 }}>{fmt(cur.pos)}{config.originLabel ?? ''}</RNText>
              {cur.note ? <RNText style={{ color: '#c9ccd2', fontSize: 13, lineHeight: 19, marginTop: 8 }}>{cur.note}</RNText> : null}
            </View>
          </BlurView>
        )
      })()}

      {/* ---- persistent x-axis navigator (scrollbar over the whole graphic) ---- */}
      <GestureDetector gesture={scrubGesture}>
        <BlurView intensity={44} tint="dark" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: SCRUB_H, zIndex: 15, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)' }}>
          <View style={{ flex: 1 }} accessible accessibilityRole="adjustable" accessibilityLabel={`Position: ${fmt(shellPos)}, of ${fmt(loP)} to ${fmt(hiP)}`}>
            <View style={{ position: 'absolute', left: 12, right: 12, top: SCRUB_H / 2 + 5, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.13)' }} />
            <RNText maxFontSizeMultiplier={1.15} numberOfLines={1} style={{ position: 'absolute', left: 12, top: 8, color: '#6a7280', fontSize: 10 }}>{fmt(loP)}</RNText>
            <RNText maxFontSizeMultiplier={1.15} numberOfLines={1} style={{ position: 'absolute', right: 12, top: 8, color: '#6a7280', fontSize: 10 }}>{fmt(hiP)}</RNText>
            {(() => {
              const thumbW = Math.max(30, W / view.k)
              const thumbLeft = clamp(-view.tx / view.k, 0, W - thumbW)
              return <RNText maxFontSizeMultiplier={1.15} numberOfLines={1} style={{ position: 'absolute', left: clamp(thumbLeft + thumbW / 2 - 44, 6, W - 94), top: 8, width: 88, textAlign: 'center', color: '#e8b84b', fontSize: 11, fontWeight: '700' }}>{fmt(shellPos)}</RNText>
            })()}
            <Animated.View style={[{ position: 'absolute', top: SCRUB_H / 2 - 2, height: 15, borderRadius: 8, backgroundColor: 'rgba(232,184,75,0.28)', borderWidth: 1.5, borderColor: '#e8b84b' }, thumbStyle]} />
          </View>
        </BlurView>
      </GestureDetector>

      {/* ---- list view: every item of this map, by line, for screen readers and keyboards ---- */}
      {listOpen && (
        <View
          accessibilityViewIsModal
          {...(Platform.OS === 'web' ? ({ role: 'dialog', 'aria-modal': true, 'aria-label': `${config.name} items` } as any) : {})}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40, backgroundColor: BG }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: 18, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#2a2f39' }}>
            <View style={{ flex: 1 }}>
              <RNText ref={listTitleRef} {...(Platform.OS === 'web' ? ({ tabIndex: -1 } as any) : {})} accessibilityRole="header" style={{ color: '#e9eaee', fontSize: 20, fontWeight: '600' }}>{config.name}</RNText>
              <RNText style={{ color: '#9aa1ac', fontSize: 12, marginTop: 2 }}>{ITEMS.length} items on {LANES.length} lines, in order along each line</RNText>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Close the list" onPress={() => setListOpen(false)} hitSlop={12} style={btn}>
              <RNText style={{ color: '#e9eaee', fontSize: 14 }}>Done</RNText>
            </Pressable>
          </View>
          <SectionList
            sections={listSections}
            keyExtractor={(o) => o.id}
            stickySectionHeadersEnabled
            initialNumToRender={30}
            contentContainerStyle={{ paddingBottom: 40 }}
            renderSectionHeader={({ section }) => (
              <View style={{ backgroundColor: '#14161c', paddingHorizontal: 18, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 9, height: 9, borderRadius: 2, backgroundColor: section.lane.color }} />
                <RNText accessibilityRole="header" style={{ color: '#c9ccd2', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {section.lane.name} · {section.data.length}
                </RNText>
              </View>
            )}
            renderItem={({ item: o }) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${o.label}, ${fmt(o.pos)}${config.originLabel ?? ''}${o.sub ? `, ${o.sub}` : ''}`}
                accessibilityHint="Shows it on the map"
                onPress={() => showItem(o)}
                style={({ pressed }) => ({ paddingHorizontal: 18, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#1c2028', backgroundColor: pressed ? '#1a1e26' : 'transparent' })}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                  <RNText style={{ color: '#e9eaee', fontSize: 15, flexShrink: 1, fontWeight: o.importance === 1 ? '600' : '400' }}>{o.label}</RNText>
                  <RNText style={{ color: '#e8b84b', fontSize: 13 }}>{fmt(o.pos)}</RNText>
                </View>
                {o.note ? <RNText numberOfLines={2} style={{ color: '#9aa1ac', fontSize: 12.5, lineHeight: 18, marginTop: 3 }}>{o.note}</RNText> : null}
              </Pressable>
            )}
          />
        </View>
      )}
    </View>
  )
}
