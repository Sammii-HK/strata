# App Store Connect submission checklist

Legend: ✅ done in code by Claude · 🔑 needs your Apple/RevenueCat login · 🎨 your asset

## v1 (shipped) = paid app, no in-app purchases
v1.0 build 3 shipped as a plain £9.99 paid app (Cosmos + History). Everyone who
bought it keeps History in v1.1 (the app treats `originalApplicationVersion`
<= 3 as owning the `history` entitlement, see `src/entitlements.ts`).

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
- 🔑 v1.1: set the app price to **Free** (it was £9.99 for v1.0). Availability: all territories (or your choice).
- 🔑 **Family Sharing: OFF** for the app. In ASC → App → Pricing and Availability, leave "Family Sharing" unticked. One-time payment, not shareable.

### Build & submit
- 🔑 `eas build -p ios --profile production` (or `npx expo run:ios --configuration Release` + Xcode Organizer) → upload to ASC. Signing already works (team SZ7Q48T98S).
- 🔑 Attach build, fill "What's New", submit for review.

---

## v1.1 = free app + packs via RevenueCat

The model (see `src/catalogue.ts` header): free download, Cosmos free at full
depth, History and each pack a one-off non-consumable unlock, Strata Complete
unlocks everything plus every future map. Soft paywall: a locked map is fully
browsable at the overview; deep zoom, compare and search raise an unlock bar.

Fallback prices live in code (`tierPrice` and `completePrice` in
`src/entitlements.ts`), but the Atlas shows the StoreKit `priceString` from the
RevenueCat package once the offering loads, so you can reprice in ASC without a
build. Complete's fallback is £9.99 at up to 7 paid maps, +£1 per extra paid
map, capped at £19.99, always ending .99.

### App config
- ✅ `app.json`: version 1.1.0, iOS build 4.
- ✅ `.env`: `EXPO_PUBLIC_REVENUECAT_IOS_KEY` = the RevenueCat **public** iOS SDK
  key (`appl_...`). Public keys are designed to ship in the client; never put a
  secret/server key here. Without it `src/purchases.ts` is inert and only
  Cosmos is unlocked.

### App Store Connect (🔑 you)
Create these as **Non-Consumable** in-app purchases (NOT auto-renewing):
| Product ID | Name | Price | Family Shareable |
|------------|------|-------|------------------|
| `app.lunary.strata.history` | History | £2.99 | **OFF** |
| `app.lunary.strata.evolution` | Evolution | £2.99 | **OFF** |
| `app.lunary.strata.mythologies` | Mythologies | £1.99 | **OFF** |
| `app.lunary.strata.balladry` | Balladry | £1.99 | **OFF** |
| `app.lunary.strata.bestiary` | Bestiary | £1.99 | **OFF** |
| `app.lunary.strata.blazon` | Blazon | £1.99 | **OFF** |
| `app.lunary.strata.geode` | Geode | £1.99 | **OFF** |
| `app.lunary.strata.complete` | Strata Complete | £9.99 | **OFF** |

Already created earlier and still coming-soon in the catalogue (leave as is):
`app.lunary.strata.oceans`, `app.lunary.strata.deeptime`.

- ⚠️ For EACH product, in its ASC page, ensure **"Family Sharing" is turned OFF**
  (Apple defaults non-consumables to shareable-eligible; you must disable it).
- Fill each product's display name, description, and a review screenshot.
- Attach all eight products to the 1.1.0 version before submitting.

### RevenueCat dashboard (🔑 you)
The project is shared with other apps, so identifiers are namespaced:
1. **Entitlements** (one per pack, id = pack id): `history`, `evolution`,
   `mythologies`, `balladry`, `bestiary`, `blazon`, `geode`, each with its
   matching product attached; plus `strata-complete` with the
   `app.lunary.strata.complete` product attached. Do NOT use plain `complete`
   (it belongs to another app). The app treats `strata-complete` as owning
   every pack, present and future, so you do not need to attach the pack
   products to it.
2. **Offering** `strata_default` with packages: `$rc_lifetime` =
   `app.lunary.strata.complete`, and `$rc_custom_<pack>` for each of history,
   evolution, mythologies, balladry, bestiary, blazon, geode. The app fetches
   `offerings.all['strata_default']` (never `current`, which is another app's)
   and keys packages by product id, so the package names are only for you.
3. Keep RevenueCat **analytics/attribution OFF** to preserve the "Data Not
   Collected" privacy label (see PRIVACY.md).

### Then
- Build (`eas build -p ios --profile production`), attach to 1.1.0, fill
  "What's New" (free download, six new packs, existing buyers keep History),
  submit.
- Sandbox: `originalApplicationVersion` is "1.0" in the sandbox, which reads as
  a legacy buyer, so a sandbox tester will see History unlocked. Test pack
  purchases on any other pack.
