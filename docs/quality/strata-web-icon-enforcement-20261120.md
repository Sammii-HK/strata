# Strata web icon enforcement

20 November 2026. Local source candidate based on `d472cee`, the actual merge of PR 1. The earlier merged-release checkout and the owner's later main changes were preserved. This is not a native release or a deployed web revision.

## Scope

Added a platform-specific `UiIcon.web.tsx` using named `lucide-react` components. Shared Atlas, onboarding and canvas controls now request named icons for close, selection, menu direction, list, search, zoom and navigation. The web SVGs inherit existing text colour and use explicit dimensions, `aria-hidden` and `focusable=false`. The icon-only Maps close button now has a complete accessible name.

The base `UiIcon.tsx` returns the previous native characters inside their existing React Native Text/style context. This preserves the existing native appearance instead of forking the large canvas or introducing a native SVG dependency. It is a compatibility fallback, not a native icon migration. The native fallback remains an explicit follow-up under the all-platform Lucide policy.

No domain notation, map/engine data, art, purchases/store logic, entitlements or gestures changed. An AST comparison against the merged baseline confirmed all 34 original press handlers and every original style, layout, input and accessibility-state attribute in the three modified UI files are byte-identical. Only icon expressions and the missing close label changed.

## Normal checks

- `npm run lint` and `npm run lint:web` run the unchanged canonical source guard.
- `npm test` preserves the existing test command after the canonical eleven icon regressions.
- `npm run test:web` runs the eleven canonical regressions plus the three focused icon/platform cases.
- `npm run typecheck` remains the normal TypeScript check.

The source guard changed from 15 blocking findings and five review lines to zero blocking findings and three review lines. All three remaining review lines belong to the native compatibility table, containing the thirteen original native icon characters. They are not cleared as domain notation or claimed to be Lucide. All web controls in this migration render the Lucide adapter.

## Verification

All eleven canonical regressions, three focused tests and full TypeScript validation pass. The focused tests render all thirteen web icons through real React DOM server rendering and confirm actual Lucide SVG markup, inherited colour, requested size and decorative accessibility. They also confirm native fallback text equality without loading any native service.

The installed Metro resolver was exercised against the actual source files: web resolves `./UiIcon` to `UiIcon.web.tsx`, while iOS resolves it to the existing-character fallback. No mock resolver or whole-app initialisation was used. The reference constraints were read from the [Expo SDK 56 documentation](https://docs.expo.dev/versions/v56.0.0/) and [its Metro configuration reference](https://docs.expo.dev/versions/v56.0.0/config/metro/).

A separate isolated dependency installation used `--ignore-scripts`, with no native build or install hooks. The lockfile adds the web Lucide package and reconciles its existing root version metadata. It does not upgrade the native/Expo stack.

## Open boundaries

The existing Expo dependency stack still reports 30 audit findings: 17 moderate, 12 high and one critical (`shell-quote`). This bounded web migration does not force native/Expo dependency changes. Do not release on the strength of this source check alone.

The full app was not exported or launched. Its entry mounts `useStore`; that runtime boundary was deliberately not exercised. No purchase, account, entitlement, database, provider, microphone, audio/model download, native packaging or release operation ran. The existing broader app suite was not rerun. No new screenshot, whole-app browser proof, native behaviour or deployment certification is claimed. Existing screenshots remain earlier product views.
