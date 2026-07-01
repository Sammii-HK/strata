import { createContext } from 'react'
import type { StrataConfig } from './engine/strata'

export type Lens = 'cosmos' | 'history'

// Config + lens control flow to the (web-lazy-loaded) canvas via context, so we
// don't have to thread props through WithSkiaWeb's getComponent boundary.
export const MapContext = createContext<{ config: StrataConfig | null; lens: Lens; setLens: (l: Lens) => void; openAtlas: () => void }>({
  config: null,
  lens: 'cosmos',
  setLens: () => {},
  openAtlas: () => {},
})
