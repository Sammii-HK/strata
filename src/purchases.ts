// RevenueCat integration for the v1.1 freemium packs.
//
// Strata is a free download; Cosmos is free at full depth. History and every
// pack are non-consumable unlocks bought here, and "Strata Complete" unlocks
// everything. This file is INERT until the public SDK key
// (EXPO_PUBLIC_REVENUECAT_IOS_KEY, see .env) is set and the products +
// entitlements exist in the RevenueCat + App Store Connect dashboards (see
// store/ASC-CHECKLIST.md). When inert, only Cosmos is unlocked.
//
// Store product ids: app.lunary.strata.<pack> for history, evolution,
// mythologies, balladry, bestiary, blazon, geode, and app.lunary.strata.complete.
// Entitlement ids: the same pack ids, plus 'strata-complete' (grants every pack,
// present and future). The RevenueCat project is shared across apps, so the
// offering is fetched by id ('strata_default'), never via offerings.current.
// Buyers of the original £9.99 app (originalApplicationVersion <= 3) keep
// History; see isLegacyBuyer() in entitlements.ts.
//
// The RevenueCat native module is required lazily inside iOS-only guards so
// importing this file never breaks React Native Web (our preview) or Metro.

import { Platform } from 'react-native'
import { COMPLETE_PRODUCT_ID, OFFERING_ID, packIdFromProductId } from './entitlements'

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? ''
let configured = false
let cached: any = null

function rc(): any {
  if (cached !== null) return cached
  try {
    cached = require('react-native-purchases').default
  } catch {
    cached = false
  }
  return cached
}

/** Safe to call on every launch: no-op unless on iOS with a key set. */
export function configurePurchases(): void {
  if (configured || !IOS_KEY || Platform.OS !== 'ios') return
  const P = rc()
  if (!P) return
  try {
    P.configure({ apiKey: IOS_KEY })
    configured = true
  } catch {
    // leave unconfigured; app still works, packs simply stay locked
  }
}

export function isPurchasesReady(): boolean {
  return configured
}

/** What ownership is derived from: active entitlement ids plus the build the
 * customer first installed (for the legacy £9.99 buyer grant). */
export interface CustomerSnapshot {
  active: Set<string>
  originalApplicationVersion: string | null
}

const EMPTY: CustomerSnapshot = { active: new Set(), originalApplicationVersion: null }

function snapshotOf(info: any): CustomerSnapshot {
  return {
    active: new Set(Object.keys(info?.entitlements?.active ?? {})),
    originalApplicationVersion: info?.originalApplicationVersion ?? null,
  }
}

/** Current customer state. Empty when unconfigured or offline. */
export async function getCustomerSnapshot(): Promise<CustomerSnapshot> {
  if (!configured) return EMPTY
  const P = rc()
  if (!P) return EMPTY
  try {
    return snapshotOf(await P.getCustomerInfo())
  } catch {
    return EMPTY
  }
}

/** Active entitlement ids, e.g. {'evolution'} or {'strata-complete', ...}. */
export async function getActiveEntitlements(): Promise<Set<string>> {
  return (await getCustomerSnapshot()).active
}

export async function restorePurchases(): Promise<CustomerSnapshot> {
  if (!configured) return EMPTY
  const P = rc()
  if (!P) return EMPTY
  try {
    return snapshotOf(await P.restorePurchases())
  } catch {
    return EMPTY
  }
}

/** A purchasable offer: the raw RevenueCat package to hand to
 * purchasePackage(), plus its localised StoreKit price string ("£1.99"). */
export interface StoreOffer {
  pkg: any
  priceString: string
}

/** Offers from the 'strata_default' offering keyed by pack id ('history',
 * 'evolution', ...) or 'complete'. Keys come from each package's product
 * identifier (app.lunary.strata.<pack>) so package naming in the dashboard
 * does not matter. Empty when unconfigured or offline; callers fall back to
 * the catalogue price and keep the map locked. */
export async function getOffers(): Promise<Record<string, StoreOffer>> {
  if (!configured) return {}
  const P = rc()
  if (!P) return {}
  try {
    const offerings = await P.getOfferings()
    const offering = offerings?.all?.[OFFERING_ID]
    if (!offering) return {}
    const out: Record<string, StoreOffer> = {}
    for (const pkg of offering.availablePackages ?? []) {
      const sid: string = pkg?.product?.identifier ?? ''
      const key = sid === COMPLETE_PRODUCT_ID ? 'complete' : packIdFromProductId(sid)
      if (key) out[key] = { pkg, priceString: pkg?.product?.priceString ?? '' }
    }
    return out
  } catch {
    return {}
  }
}

/** Purchase a package (from getOffers().pkg). Returns the customer state
 * afterwards; empty on cancel, failure or when unconfigured. */
export async function purchasePackage(pkg: any): Promise<CustomerSnapshot> {
  if (!configured || !pkg) return EMPTY
  const P = rc()
  if (!P) return EMPTY
  try {
    const { customerInfo } = await P.purchasePackage(pkg)
    return snapshotOf(customerInfo)
  } catch {
    return EMPTY
  }
}
