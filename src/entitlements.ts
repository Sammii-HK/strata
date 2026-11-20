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
 * this build get every paid map for free. */
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

/** The paid £9.99 build stopped being sold when the free release (build 4) went
 * out on 17 Sep 2026. A customer whose first purchase is on or after this was
 * never a paid-era buyer, whatever their reported build number says. */
export const FREEMIUM_CUTOVER = '2026-09-17T00:00:00Z'

/** True for a customer who bought the paid app: RevenueCat's
 * CustomerInfo.originalApplicationVersion is a plain integer build number
 * <= LAST_PAID_BUILD, and (when known) their first purchase predates the free release.
 *
 * Apple's sandbox and TestFlight report originalApplicationVersion as "1.0" for
 * EVERY account. Reading that by its leading integer gave build 1, so every App
 * Review tester looked like a paid-era buyer and the purchase flow they were
 * meant to exercise never behaved like a new customer's (2.1(b), Strata 1.1.0).
 * Real receipts carry the integer build ("3"), so anything not purely digits is
 * not trusted. Missing or unparseable => false. */
export function isLegacyBuyer(
  originalApplicationVersion: string | null | undefined,
  originalPurchaseDate?: string | null,
): boolean {
  if (originalApplicationVersion == null) return false
  const v = String(originalApplicationVersion).trim()
  if (!/^\d+$/.test(v)) return false
  if (parseInt(v, 10) > LAST_PAID_BUILD) return false
  if (originalPurchaseDate) {
    const bought = Date.parse(originalPurchaseDate)
    if (!Number.isNaN(bought) && bought >= Date.parse(FREEMIUM_CUTOVER)) return false
  }
  return true
}

/** Which paid maps are unlocked. `paidIds` is every purchasable map id in the
 * catalogue; `active` is the set of active entitlement ids; `legacy` is
 * isLegacyBuyer(). 'strata-complete' unlocks all; so does legacy (they paid the
 * same GBP 9.99 the bundle costs now). */
export function resolveOwnedMaps(paidIds: readonly string[], active: ReadonlySet<string>, legacy: boolean): Set<string> {
  if (active.has(COMPLETE_ENTITLEMENT)) return new Set(paidIds)
  // Legacy buyers paid GBP 9.99 for the whole app, which is what Complete costs today, so they
  // get every paid map rather than only the History they strictly bought. Going free must not
  // leave the people who actually paid with less than a new customer can unlock for the same money.
  if (legacy) return new Set(paidIds)
  return new Set(paidIds.filter((id) => active.has(id)))
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
