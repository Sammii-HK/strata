// Pure ownership and pricing rules for the freemium model (v1.1). No React
// Native or RevenueCat imports here so this file is unit-testable with Node.
//
// Store product ids are `app.lunary.strata.<packId>` (plus `.complete`).
// RevenueCat entitlement ids are the pack ids themselves ('history',
// 'evolution', ...) plus 'strata-complete', which grants every pack, present
// and future. (Plain 'complete' belongs to a different app, so never use it.)
//
// Prices here are FALLBACK display strings only. At runtime the Atlas prefers
// the StoreKit priceString on the RevenueCat package, so prices can change in
// App Store Connect without a build.

export const PRODUCT_PREFIX = 'app.lunary.strata.'
export const COMPLETE_PRODUCT_ID = `${PRODUCT_PREFIX}complete`
export const COMPLETE_ENTITLEMENT = 'strata-complete'
/** RevenueCat offering identifier. The project is shared by many apps, so
 * `offerings.current` is not ours; always fetch by this id. */
export const OFFERING_ID = 'strata_default'

/** Build number of the last paid (£9.99) release. Buyers up to and including
 * this build keep History for free. */
export const LAST_PAID_BUILD = 3

export type PackTier = 'small' | 'big'

/** Fallback display price by pack size: small packs £1.99, big packs £2.99. */
export function tierPrice(tier: PackTier): string {
  return tier === 'big' ? '£2.99' : '£1.99'
}

/** Store product id for a pack id, e.g. 'history' -> 'app.lunary.strata.history'. */
export function productIdFor(packId: string): string {
  return `${PRODUCT_PREFIX}${packId}`
}

/** Pack id (or 'complete') from a store product id; null if it isn't ours. */
export function packIdFromProductId(productId: string): string | null {
  if (!productId.startsWith(PRODUCT_PREFIX)) return null
  const rest = productId.slice(PRODUCT_PREFIX.length)
  return rest && !rest.includes('.') ? rest : null
}

/** True when the RevenueCat CustomerInfo.originalApplicationVersion (the iOS
 * build number the customer first downloaded) is from the paid era, i.e. the
 * leading integer is <= LAST_PAID_BUILD. Missing or unparseable => false. */
export function isLegacyBuyer(originalApplicationVersion: string | null | undefined): boolean {
  if (originalApplicationVersion == null) return false
  const m = String(originalApplicationVersion).trim().match(/^(\d+)/)
  if (!m) return false
  return parseInt(m[1], 10) <= LAST_PAID_BUILD
}

/** Which paid maps are unlocked. `paidIds` is every purchasable map id in the
 * catalogue; `active` is the set of active entitlement ids; `legacy` is
 * isLegacyBuyer(). 'strata-complete' unlocks all; legacy buyers keep 'history'. */
export function resolveOwnedMaps(paidIds: readonly string[], active: ReadonlySet<string>, legacy: boolean): Set<string> {
  if (active.has(COMPLETE_ENTITLEMENT)) return new Set(paidIds)
  const owned = new Set(paidIds.filter((id) => active.has(id)))
  if (legacy && paidIds.includes('history')) owned.add('history')
  return owned
}

/** Fallback display price for Strata Complete as a function of how many paid
 * (built, not coming-soon) maps are shipped: £9.99 for up to 7, +£1 per extra
 * map, capped at £19.99, always ending in .99 so the bundle never undersells
 * the catalogue as it grows. */
export function completePrice(paidMapCount: number): string {
  const extra = Math.max(0, Math.floor(paidMapCount) - 7)
  const pounds = Math.min(19, 9 + extra)
  return `£${pounds}.99`
}
