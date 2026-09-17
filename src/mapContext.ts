import { createContext } from 'react'
import type { StrataConfig } from './engine/strata'
import type { Lens } from './catalogue'

export type { Lens }

/** Store state shared by the canvas (unlock bar) and the Atlas. Prices are the
 * StoreKit strings from the RevenueCat offering when loaded, else undefined
 * and callers fall back to the catalogue's tier price. */
export interface StoreState {
  /** Map ids unlocked (paid maps only; included maps are always usable). */
  owned: ReadonlySet<string>
  /** Live prices keyed by pack id or 'complete'. Empty until the offering loads. */
  prices: Readonly<Record<string, string>>
  /** True when purchases can actually be made on this platform/build. */
  canPurchase: boolean
  /** Buy one pack ('history', 'geode', ...) or 'complete'. Resolves once ownership has been refreshed. */
  purchase: (id: string) => Promise<void>
  restore: () => Promise<void>
  busy: boolean
}

export const EMPTY_STORE: StoreState = {
  owned: new Set(),
  prices: {},
  canPurchase: false,
  purchase: async () => {},
  restore: async () => {},
  busy: false,
}

// Config + lens control flow to the (web-lazy-loaded) canvas via context, so we
// don't have to thread props through WithSkiaWeb's getComponent boundary.
export const MapContext = createContext<{
  config: StrataConfig | null
  lens: Lens
  setLens: (l: Lens) => void
  openAtlas: () => void
  openTips: () => void
  store: StoreState
}>({
  config: null,
  lens: 'cosmos',
  setLens: () => {},
  openAtlas: () => {},
  openTips: () => {},
  store: EMPTY_STORE,
})
