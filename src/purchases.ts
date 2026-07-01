// RevenueCat integration, groundwork for the pack IAPs (Phase 2).
//
// v1 ships as a plain paid app with no IAP, so this is INERT until you set the
// public SDK key (EXPO_PUBLIC_REVENUECAT_IOS_KEY) and create the products +
// entitlements in the RevenueCat + App Store Connect dashboards (see
// store/ASC-CHECKLIST.md). Included maps (Cosmos, History) are owned by virtue
// of the paid app and do NOT depend on this.
//
// Entitlement ids expected in RevenueCat: 'evolution', 'oceans', 'deeptime',
// and 'complete' (Complete also grants the three per-pack entitlements).
//
// The RevenueCat native module is required lazily inside iOS-only guards so
// importing this file never breaks React Native Web (our preview) or Metro.

import { Platform } from 'react-native'

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
    // leave unconfigured; app still works, packs simply stay locked/coming-soon
  }
}

export function isPurchasesReady(): boolean {
  return configured
}

/** Active entitlement ids, e.g. {'evolution'} or {'complete','evolution',...}. Empty when unconfigured. */
export async function getActiveEntitlements(): Promise<Set<string>> {
  if (!configured) return new Set()
  const P = rc()
  if (!P) return new Set()
  try {
    const info = await P.getCustomerInfo()
    return new Set(Object.keys(info.entitlements.active))
  } catch {
    return new Set()
  }
}

export async function restorePurchases(): Promise<Set<string>> {
  if (!configured) return new Set()
  const P = rc()
  if (!P) return new Set()
  try {
    const info = await P.restorePurchases()
    return new Set(Object.keys(info.entitlements.active))
  } catch {
    return new Set()
  }
}

/** Purchase a pack by its RevenueCat package/product. Wired up in Phase 2. */
export async function purchasePackage(pkg: any): Promise<Set<string>> {
  if (!configured) return new Set()
  const P = rc()
  if (!P) return new Set()
  try {
    const { customerInfo } = await P.purchasePackage(pkg)
    return new Set(Object.keys(customerInfo.entitlements.active))
  } catch {
    return new Set()
  }
}
