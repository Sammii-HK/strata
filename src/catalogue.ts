// The map catalogue: what powers the Atlas (store) view and the soft-paywall
// gating. A map is either included (free, full depth), owned (unlocked pack),
// locked (purchasable), or coming-soon (roadmap, not built).
//
// Pricing model (v1.1, freemium): the app is a free download. Cosmos is free
// at full depth, always. History and every pack are one-off non-consumable
// unlocks: small packs £1.99, big packs (History, Evolution) £2.99. "Strata
// Complete" unlocks every pack plus every future map; its price scales with
// the catalogue (see completePrice in entitlements.ts). No subscription.
// Anyone who bought the original £9.99 app (build <= 3) keeps History.
// The prices here are fallbacks; the Atlas shows the StoreKit price when the
// RevenueCat offering has loaded.
// Soft paywall = a locked pack is fully browsable at the overview; only deep
// zoom (the fan), compare and search raise a gentle unlock bar. Never a wall,
// never a modal on launch.
// Preview packs = built and wired in, but with no App Store product yet. The
// web demo treats them as locked packs (overview free to browse); the iPhone
// app shows them as coming soon until their in-app purchase exists, so nobody
// meets an Unlock button with nothing behind it.

import { Platform } from 'react-native'
import { completePrice, resolveOwnedMaps, tierPrice, type PackTier } from './entitlements'

export type MapStatus = 'included' | 'owned' | 'locked' | 'coming-soon'
export type Lens = 'cosmos' | 'history' | 'evolution' | 'geode' | 'blazon' | 'balladry' | 'bestiary' | 'mythologies' | 'elements' | 'lunar' | 'calendarium'

export interface CatalogEntry {
  id: string
  name: string
  tagline: string
  color: string
  status: MapStatus
  /** Pack size, sets the fallback display price. Omitted for included maps. */
  tier?: PackTier
  blurb: string
  /** Set when the map is live and openable in-app. */
  lens?: Lens
  /** Built, but no store product yet: browsable on the web, coming soon in the app. */
  preview?: boolean
}

const ENTRIES: CatalogEntry[] = [
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
    status: 'locked',
    tier: 'big',
    lens: 'history',
    blurb: 'Civilisations, ideas and events as parallel lines. Zoom a region open into its countries; compare any two moments.',
  },
  {
    id: 'evolution',
    name: 'Evolution',
    tagline: 'Four billion years of life',
    color: '#2FA98C',
    status: 'locked',
    tier: 'big',
    lens: 'evolution',
    blurb: 'First cells to us. Clades run as lines; zoom one open into its orders and families. The whole tree of life on a single scale.',
  },
  {
    id: 'geode',
    name: 'Geode',
    tagline: 'Crystals and minerals through history',
    color: '#7FB5C9',
    status: 'locked',
    tier: 'small',
    lens: 'geode',
    blurb: 'Every gem and mineral placed at the moment humans first mined or named it, from ochre to synthetic diamond.',
  },
  {
    id: 'mythologies',
    name: 'Mythologies',
    tagline: 'Gods and heroes, first written down',
    color: '#D7494C',
    status: 'locked',
    tier: 'small',
    lens: 'mythologies',
    blurb: 'Six mythologies as parallel lines, each figure dated to its earliest surviving text: Homer, the Pyramid Texts, the Rigveda.',
  },
  {
    id: 'bestiary',
    name: 'Bestiary',
    tagline: 'Legendary creatures, first attested',
    color: '#8A6DC4',
    status: 'locked',
    tier: 'small',
    lens: 'bestiary',
    blurb: 'Dragons, kelpies and thunderbirds placed at their first written record. Oral tradition runs older; the ink is where we can point.',
  },
  {
    id: 'balladry',
    name: 'Balladry',
    tagline: 'Folk ballads and sea songs',
    color: '#5AA84F',
    status: 'locked',
    tier: 'small',
    lens: 'balladry',
    blurb: 'Child ballads, shanties and murder songs across the eras they were sung, from medieval borders to Appalachian porches.',
  },
  {
    id: 'blazon',
    name: 'Blazon',
    tagline: 'Coats of arms and when they were adopted',
    color: '#C9A227',
    status: 'locked',
    tier: 'small',
    lens: 'blazon',
    blurb: 'The three lions, the fleur-de-lis, the double eagle: European heraldry placed at the year each was first borne.',
  },
  {
    id: 'elements',
    name: 'Elements',
    tagline: 'The periodic table, one discovery at a time',
    color: '#9C8AE0',
    status: 'locked',
    tier: 'small',
    lens: 'elements',
    preview: true,
    blurb: 'Seventy classic elements as a timeline of discovery, from the copper and iron of antiquity to the lanthanides teased out of ore by spectroscopy. Tap any one for who isolated it and where its name comes from.',
  },
  {
    id: 'lunar',
    name: 'Lunar Almanac',
    tagline: 'Missions and eclipses across the space age',
    color: '#8A93A2',
    status: 'locked',
    tier: 'small',
    lens: 'lunar',
    preview: true,
    blurb: 'Every landmark Moon mission from Luna 1 to Chandrayaan-3, plus the eclipses history remembers, from Thales to the Great North American Eclipse. Zoom the missions open into the nations that flew them.',
  },
  {
    id: 'calendarium',
    name: 'Calendarium',
    tagline: 'Every calendar humanity has kept time by',
    color: '#C9A26B',
    status: 'locked',
    tier: 'small',
    lens: 'calendarium',
    preview: true,
    blurb: 'Eighteen calendars, from the Egyptian civil year to ISO week numbers, placed at the year each was introduced or reformed. Solar, lunar, lunisolar and the revolutionary experiments that did not last.',
  },
  {
    id: 'oceans',
    name: 'Oceans',
    tagline: 'Sunlit surface to the trench',
    color: '#4C82C3',
    status: 'coming-soon',
    tier: 'small',
    blurb: 'Depth is the axis. Life, shipwrecks and geology from the waves down to the crushing hadal deep.',
  },
  {
    id: 'deeptime',
    name: 'Deep Time',
    tagline: "Earth's geological eras",
    color: '#E07A3E',
    status: 'coming-soon',
    tier: 'small',
    blurb: 'Eons, periods and the five great extinctions on one unbroken scale. See how thin the age of humans really is.',
  },
]

/** Preview packs open on the web only; elsewhere they read as coming soon. */
const PREVIEWS_OPEN = Platform.OS === 'web'

export const CATALOG: CatalogEntry[] = ENTRIES.map((e) =>
  e.preview && !PREVIEWS_OPEN ? { ...e, status: 'coming-soon' } : e,
)

/** Ids of every purchasable, built map (locked or owned; not coming-soon, not
 * a preview without a store product). */
export const PAID_MAP_IDS: string[] = CATALOG.filter((e) => e.tier && e.status !== 'coming-soon' && !e.preview).map((e) => e.id)

/** Fallback display price for an entry, e.g. "£1.99". Undefined for included
 * maps and for previews, which have no store product to price yet. */
export function fallbackPrice(entry: CatalogEntry): string | undefined {
  return entry.tier && !entry.preview ? tierPrice(entry.tier) : undefined
}

/** Map ids unlocked given active RevenueCat entitlements and the legacy-buyer
 * flag. 'strata-complete' grants all packs; legacy £9.99 buyers keep History. */
export function ownedMapIds(active: ReadonlySet<string>, legacy: boolean): Set<string> {
  return resolveOwnedMaps(PAID_MAP_IDS, active, legacy)
}

/** The catalogue with `locked` flipped to `owned` for unlocked maps. */
export function resolveCatalog(owned: ReadonlySet<string>): CatalogEntry[] {
  return CATALOG.map((e) => (e.status === 'locked' && owned.has(e.id) ? { ...e, status: 'owned' } : e))
}

/** The catalogue entry a lens belongs to. */
export function entryForLens(lens: Lens): CatalogEntry | undefined {
  return CATALOG.find((e) => e.lens === lens)
}

/** Whether a lens can be used at full depth (included or unlocked). */
export function isLensOwned(lens: Lens, owned: ReadonlySet<string>): boolean {
  const entry = entryForLens(lens)
  return !entry || entry.status === 'included' || owned.has(entry.id)
}

export const COMPLETE = {
  name: 'Strata Complete',
  /** Fallback display price; the Atlas prefers the StoreKit price. */
  price: completePrice(PAID_MAP_IDS.length),
  blurb: 'Every pack, plus every future map. The whole atlas, one payment, yours forever.',
}
