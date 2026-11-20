# Zoom / navigation UX: test log (branch fix/strata-zoom-navigation-ux, 2026-10-11)

Evidence is labelled: **UNIT** (node:test, no UI), **TYPES** (tsc), **SIM** (iOS Simulator, Release build, arm64), **DEVICE** (physical phone: none yet).

## How to run
- `npm test` (node:test; needs Node 18+, use v24: `PATH=~/.nvm/versions/node/v24.21.0/bin:$PATH`) and `npx tsc --noEmit`. Result at HEAD: 38/38 pass, tsc clean. Entitlement tests unchanged.
- Simulator: `npx expo prebuild --platform ios --clean --no-install` then `cd ios && pod install` (regenerates codegen; skip and the first build fails on missing ReactCodegen files), then
  `xcodebuild -workspace ios/Strata.xcworkspace -scheme Strata -configuration Release -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' -derivedDataPath /tmp/strata-sim-dd ARCHS=arm64 ONLY_ACTIVE_ARCH=YES CODE_SIGNING_ALLOWED=NO build`.
  Run one build at a time; the Mac is shared with other agents.

## Verified on simulator (iPhone 17 Pro and iPhone SE 3rd gen, iOS 26.2)
| Check | Result |
|---|---|
| Single pinch on a fannable lane opens THAT lane (the reported "wrong lane" bug) | PASS (Constellations, Solar System) |
| Pinch on a non-fannable lane opens the nearest fannable lane | PASS (by design) |
| Chip tap focuses lane, tap again closes | PASS |
| Long-press chip hides lane, falls back to another fan | PASS |
| One-finger vertical scroll inside a tall fan | PASS after fix (was a hard crash, see below) |
| Header / chip row not overdrawn by lanes | PASS after fix |
| Sub-lane names readable, not struck through, item labels avoid lane titles | PASS after fix |
| Empty-lane cue only inside content area | PASS after fix |
| Time axis not overprinted | PASS after fix |
| iPhone SE: layout, fan, chips | PASS |
| Largest accessibility text size on SE: header, toolbar, scrubber | PASS after fix |

## Defects found by simulator testing (all fixed, none visible to unit tests)
1. Fanned-out lanes drew over the header and chip row (no canvas clip).
2. Sub-lane names struck through by their own lines; time axis collided with the bottom lane title.
3. **Crash on vertical drag in a tall fan**: gesture callbacks are compiled as worklets that capture variables when the gesture is created; `applyPan` was declared below the gesture, so it was captured as undefined (`TypeError: undefined is not a function`). Fixed by declaring it above.
4. Item labels overprinting lane titles at the left edge.
5. Chip-tap opened the fan only ~74% so names drew dim; now opens fully.
6. Largest Dynamic Type: title and scrubber ballooned over the UI, "+" pushed off screen. Fixed with per-element font-scale caps (a global `Text.defaultProps` cap is silently ignored on this React version) and a shrinking title.
7. Lane choice during a gradual pinch kept a stale lock (engine-level; covered by a unit regression test).

## Not applicable
- Light appearance: app is dark-only (`userInterfaceStyle: dark`).
- iPad: `supportsTablet: false` (runs in iPhone compatibility mode only).

## NOT verified (needs a person or a device)
- Real pinch/drag feel and gesture conflicts on a physical phone (synthetic touches only).
- Two-finger pan while pinching (pinch + drag in one move).
- Locked-lane interactions: tapping a locked fan chip should raise the unlock bar; purchase flows.
- Intermediate Dynamic Type sizes, landscape, VoiceOver, Reduce Motion.
- Entitlements on a real sandbox purchase (code untouched; unit tests pass).
- Chip row is 24pt tall with a 44pt touch target via hitSlop; not measured on device.
