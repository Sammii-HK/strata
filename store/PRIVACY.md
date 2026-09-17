# Privacy policy

_Last updated: 1 July 2026_

Strata does not collect, store, or transmit any personal data.

- The app has no accounts and no login.
- It does not use analytics, advertising, or third-party tracking.
- All content (maps and data) is bundled in the app and works fully offline.
- Nothing you do in the app leaves your device.

If in-app purchases are added in a future update, payments are handled entirely
by Apple. We never see your payment details. A purchase-management provider
(RevenueCat) may process an anonymous purchase identifier solely to restore your
purchases across your own devices; it is not linked to your identity and is not
used for tracking or advertising.

Questions: <your support email>

---

## App Privacy label answers (App Store Connect → App Privacy)

Answer the questionnaire as follows (v1.1: free app with in-app purchases via RevenueCat, no analytics or attribution enabled):

- **Do you collect data from this app?** → **No.**

That yields a "Data Not Collected" label. Nothing else to fill in for v1.

When IAP + RevenueCat ship, revisit:
- If RevenueCat is configured without attribution/analytics, you can still
  answer "No" (purchase restore uses an anonymous app-user ID, not linked to
  identity). If you enable any RevenueCat analytics/attribution features, you
  must then declare "Purchases" / "Identifiers" as appropriate. Keep it off to
  stay "Data Not Collected".
