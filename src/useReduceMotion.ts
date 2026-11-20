import { useEffect, useState } from 'react'
import { AccessibilityInfo } from 'react-native'

/**
 * The system Reduce Motion setting, kept live. iOS: Settings > Accessibility >
 * Motion. Web: the prefers-reduced-motion media query (react-native-web reads
 * it through AccessibilityInfo). When on, the canvas places the view instead of
 * gliding: no fling momentum, no spring travel.
 *
 * In development, `globalThis.__strataReduceMotion(true | false)` overrides it,
 * because a browser's media query cannot be flipped from a test script.
 */
export function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false)
  useEffect(() => {
    let alive = true
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => { if (alive) setReduce(!!v) })
      .catch(() => {})
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (v: boolean) => setReduce(!!v))
    if (__DEV__) (globalThis as any).__strataReduceMotion = (v: boolean) => setReduce(!!v)
    return () => {
      alive = false
      sub?.remove?.()
    }
  }, [])
  return reduce
}
