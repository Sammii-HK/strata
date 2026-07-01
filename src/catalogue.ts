// The map catalogue: what powers the Atlas (store) view and, later, the
// soft-paywall gating. A map is either included (free, full depth), owned
// (unlocked pack), locked (purchasable), or coming-soon (roadmap, not built).
//
// Pricing model: PAID app £9.99 one-time, includes Cosmos & History (no free
// download; the free web version is the top-of-funnel). Extra packs £4.99 each.
// "Strata Complete" £19.99+ unlocks every pack plus all future maps; its
// price scales up as the catalogue grows. No subscription.
// Soft paywall = a locked pack is fully browsable at the overview; only deep
// zoom (the fan), compare and search raise a gentle unlock bar. Never a wall.

/** Paid app price (App Store), includes Cosmos + History. */
export const APP_PRICE = '£9.99'

export type MapStatus = 'included' | 'owned' | 'locked' | 'coming-soon'
export type Lens = 'cosmos' | 'history'

export interface CatalogEntry {
  id: string
  name: string
  tagline: string
  color: string
  status: MapStatus
  /** Display price for packs, e.g. "£2.99". Omitted for included maps. */
  price?: string
  blurb: string
  /** Set when the map is live and openable in-app. */
  lens?: Lens
}

export const CATALOG: CatalogEntry[] = [
  {
    id: 'cosmos',
    name: 'Cosmos',
    tagline: 'The scale of the universe',
    color: '#6C6CE8',
    status: 'included',
    lens: 'cosmos',
    blurb: 'From the ISS just overhead out to the edge of the observable universe, everything to true scale. Zoom a constellation into its real stars.',
  },
  {
    id: 'history',
    name: 'History',
    tagline: 'A tube map of recorded history',
    color: '#E8B84B',
    status: 'included',
    lens: 'history',
    blurb: 'Civilisations, ideas and events as parallel lines. Zoom a region open into its countries; compare any two moments.',
  },
  {
    id: 'evolution',
    name: 'Evolution',
    tagline: 'Four billion years of life',
    color: '#2FA98C',
    status: 'coming-soon',
    price: '£4.99',
    blurb: 'First cells to us. Clades run as lines; zoom one open into its orders and families. The whole tree of life on a single scale.',
  },
  {
    id: 'oceans',
    name: 'Oceans',
    tagline: 'Sunlit surface to the trench',
    color: '#4C82C3',
    status: 'coming-soon',
    price: '£4.99',
    blurb: 'Depth is the axis. Life, shipwrecks and geology from the waves down to the crushing hadal deep.',
  },
  {
    id: 'deeptime',
    name: 'Deep Time',
    tagline: "Earth's geological eras",
    color: '#E07A3E',
    status: 'coming-soon',
    price: '£4.99',
    blurb: 'Eons, periods and the five great extinctions on one unbroken scale. See how thin the age of humans really is.',
  },
]

/** Pack ids unlocked given active RevenueCat entitlements. 'complete' grants all packs. (Phase 2) */
export function ownedPackIds(active: Set<string>): Set<string> {
  const packs = CATALOG.filter((e) => e.price).map((e) => e.id)
  if (active.has('complete')) return new Set(packs)
  return new Set(packs.filter((id) => active.has(id)))
}

export const COMPLETE = {
  name: 'Strata Complete',
  price: '£19.99',
  blurb: 'Every pack, plus every future map. The whole atlas, one payment, yours forever.',
}
