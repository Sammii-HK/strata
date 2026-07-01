# App Review notes for Strata

Paste into App Store Connect → App Review Information → Notes. This pre-empts a
Guideline 4.2 (minimum functionality / "this could be a website") question.

---

Strata is a native, offline data-visualisation app, not a web wrapper.

- **Rendered natively on the GPU** with Skia (react-native-skia). There is no
  web view and no web content anywhere in the app.
- **Fully offline.** All data (the Cosmos and History maps) is bundled in the
  app; it makes no network requests to function. You can review it in Airplane
  Mode.
- **Built around multitouch gestures** that a web page cannot match: pinch-zoom
  across ~18 orders of magnitude, drag to pan, tap to inspect, tap two things to
  measure the gap between them, and a bottom scrubber to jump across the whole
  timeline. Haptic feedback on interactions.
- **Semantic level-of-detail**: the map re-renders continuously as you zoom, with
  lines fanning into sub-lanes and labels appearing/declutter in real time.
- A **home-screen widget** (fun fact of the day) ships in a following update.

The free web version is a teaser/marketing surface; the app is the full,
premium, offline experience with content packs via in-app purchase.

**How to exercise the core features quickly:**
1. Launch → the intro appears → tap "Start exploring".
2. Pinch out to see the whole scale; pinch in to dive to the Solar System /
   individual eras.
3. Tap any dot to inspect it; tap a second dot to measure the gap.
4. Tap "Cosmos ▾" at the top to switch to the History map.
5. Options ▾ → toggle the Meanwhile cross-section; drag the bottom track to jump.

No account, no login, no data collection.
