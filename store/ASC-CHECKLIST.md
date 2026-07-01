# App Store Connect submission checklist

Legend: ✅ done in code by Claude · 🔑 needs your Apple/RevenueCat login · 🎨 your asset

## v1 = paid app, NO in-app purchases yet
Ship Strata as a plain £9.99 paid app (Cosmos + History). Packs + Complete
come as a later update once IAP is wired. This keeps v1 fast and review-clean.

### App config
- ✅ `app.json`: bundle `app.lunary.strata`, version 1.0.0, build 1, dark UI, portrait, iPhone-only (`supportsTablet: false` so no iPad screenshots needed), `usesNonExemptEncryption: false` (skips the export-compliance prompt each build).
- 🎨 **App icon** (you): drop a 1024×1024 PNG (no alpha, no rounded corners) at `assets/icon.png`. Android adaptive icons already referenced.
- ✅ **App name**: **Strata** (set in `app.json` + throughout the app). Just enter it in ASC when you create the listing.

### Store listing (copy ready in ASC-LISTING.md)
- ✅ Description, subtitle, promo text, keywords, category, age rating drafted.
- ✅ **Screenshots**: captured at 1284×2778 (6.5") and 1320×2868 (6.9") in `store/screenshots/`. Upload the 6.9" set (required); 6.5" optional.
- 🔑 Support URL, Marketing URL, Privacy Policy URL (host `PRIVACY.md`; the free web app can serve them).

### Privacy
- ✅ Policy + label answers in PRIVACY.md. v1 answer: **Data Not Collected**.

### Price & availability
- 🔑 Set app price to **£9.99** (choose the matching tier). Availability: all territories (or your choice).
- 🔑 **Family Sharing: OFF** for the app. In ASC → App → Pricing and Availability, leave "Family Sharing" unticked. One-time payment, not shareable.

### Build & submit
- 🔑 `eas build -p ios --profile production` (or `npx expo run:ios --configuration Release` + Xcode Organizer) → upload to ASC. Signing already works (team SZ7Q48T98S).
- 🔑 Attach build, fill "What's New", submit for review.

---

## Phase 2 = IAP packs via RevenueCat (later update)

Code groundwork lives in `src/purchases.ts` + `Chronoline.storekit` (see those).
Products are wired to be inert until you complete the dashboard steps below.

### App Store Connect (🔑 you)
Create these as **Non-Consumable** in-app purchases (NOT auto-renewing):
| Product ID | Name | Price | Family Shareable |
|------------|------|-------|------------------|
| `app.lunary.strata.evolution` | Evolution pack | £4.99 | **OFF** |
| `app.lunary.strata.oceans` | Oceans pack | £4.99 | **OFF** |
| `app.lunary.strata.deeptime` | Deep Time pack | £4.99 | **OFF** |
| `app.lunary.strata.complete` | Strata Complete | £19.99 | **OFF** |

- ⚠️ For EACH product, in its ASC page, ensure **"Family Sharing" is turned OFF**
  (Apple defaults non-consumables to shareable-eligible; you must disable it).
- Fill each product's display name, description, and a review screenshot.

### RevenueCat dashboard (🔑 you)
1. Create a RevenueCat project, add the iOS app (bundle `app.lunary.strata`).
2. Add the App Store shared secret + an App Store Connect API key so RC can validate.
3. Create **Entitlements**:
   - `evolution`, `oceans`, `deeptime` (one per pack), attach the matching product.
   - `complete` entitlement → attach the `complete` product; also grant it the
     per-pack entitlements (Complete unlocks everything).
4. Create an **Offering** ("default") with packages for each product so the
   paywall can list them.
5. Copy the **public SDK key** (starts `appl_...`) into the app config, see
   `src/purchases.ts` (env `EXPO_PUBLIC_REVENUECAT_IOS_KEY` or app.config extra).
6. Keep RevenueCat **analytics/attribution OFF** to preserve the "Data Not
   Collected" privacy label.

### Reconciling "Complete £19.99" with a paid app
The app is already £9.99. So in-app, present Complete as an **upgrade** priced so
the all-in lands at £19.99 (i.e. a ~£10 "unlock everything" product), rather than
a fresh £19.99. Set the `complete` product price accordingly, and the Atlas copy
can say "everything for £19.99 all in". Decide the exact upgrade price when you
create the product.

### Then flip it on
- Set the RevenueCat key, build, and the Atlas coming-soon cards become buyable
  (status `locked`), with the soft-paywall taste-then-unlock on pack maps.
