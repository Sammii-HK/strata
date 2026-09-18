// Ownership state for the app shell: loads the RevenueCat customer snapshot
// and offering on launch, resolves which maps are unlocked (including the
// legacy £9.99 buyer grant for History), and exposes purchase/restore.
// Everything degrades to "only Cosmos" when purchases are unconfigured.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ownedMapIds } from './catalogue'
import { isLegacyBuyer } from './entitlements'
import type { StoreState } from './mapContext'
import {
  configurePurchases,
  getCustomerSnapshot,
  getOffers,
  isPurchasesReady,
  purchasePackage,
  restorePurchases,
  type CustomerSnapshot,
  type StoreOffer,
} from './purchases'

export function useStore(): StoreState {
  const [owned, setOwned] = useState<ReadonlySet<string>>(() => new Set())
  const [offers, setOffers] = useState<Record<string, StoreOffer>>({})
  const [busy, setBusy] = useState(false)
  const [ready, setReady] = useState(false)

  const applySnapshot = useCallback((snap: CustomerSnapshot) => {
    setOwned(ownedMapIds(snap.active, isLegacyBuyer(snap.originalApplicationVersion)))
  }, [])

  useEffect(() => {
    let alive = true
    configurePurchases()
    setReady(isPurchasesReady())
    if (!isPurchasesReady()) return
    getCustomerSnapshot().then((snap) => { if (alive) applySnapshot(snap) })
    getOffers().then((o) => { if (alive) setOffers(o) })
    return () => { alive = false }
  }, [applySnapshot])

  const purchase = useCallback(async (id: string) => {
    const offer = offers[id]
    if (!offer) return
    setBusy(true)
    try {
      const snap = await purchasePackage(offer.pkg)
      // An empty snapshot means cancel/failure; keep what we had.
      if (snap.active.size || snap.originalApplicationVersion) applySnapshot(snap)
    } finally {
      setBusy(false)
    }
  }, [offers, applySnapshot])

  const restore = useCallback(async () => {
    setBusy(true)
    try {
      const snap = await restorePurchases()
      if (snap.active.size || snap.originalApplicationVersion) applySnapshot(snap)
    } finally {
      setBusy(false)
    }
  }, [applySnapshot])

  const prices = useMemo(() => {
    const out: Record<string, string> = {}
    for (const [k, v] of Object.entries(offers)) if (v.priceString) out[k] = v.priceString
    return out
  }, [offers])

  return useMemo(
    () => ({ owned, prices, canPurchase: ready && Object.keys(offers).length > 0, purchase, restore, busy }),
    [owned, prices, ready, offers, purchase, restore, busy],
  )
}
