# Strata v1.1: accessibility (would-be Linear ticket; workspace hit its issue cap)

v1.0 shipped claiming **Dark Interface only** on the ASC accessibility label
(honest: the app is dark for every task). v1.1 makes Strata genuinely
accessible, then upgrades the label.

Apple's bar: a feature counts as supported only if users can complete the app's
**common tasks** with it. For Strata: explore/zoom the map, inspect an item,
compare two items, use the scrubber, switch maps.

## Work items
- [ ] VoiceOver: the Skia canvas exposes nothing. Add an accessibility overlay
      for visible items (or a rotor/list alternative), label all RN controls
      (menus, sheets, scrubber), then complete every common task with the screen
      off.
- [ ] Voice Control: falls out of element exposure + labels; verify "tap <name>"
      works for header controls and sheets.
- [ ] Larger Text (Dynamic Type): RN text is fixed-size everywhere; adopt font
      scaling in sheets, menus, Atlas; decide policy for in-canvas Skia labels.
- [ ] Differentiate Without Colour Alone: lines already carry name labels; audit
      chips, legend, and selection states so colour is never the only signal.
- [ ] Sufficient Contrast: muted greys (#6a7280 on #101218) fail 4.5:1; contrast
      pass on the FAINT/MUTED tokens.
- [ ] Reduced Motion: respect the system setting; damp/skip the fan-open
      animation and zoom easing.
- [ ] Captions / Audio Descriptions: n/a (no audio or video content).
- [ ] Update the ASC Accessibility Nutrition Label with the new features.

Context: label answered 2026-07-01 during v1.0 submission. App
app.lunary.strata, repo ~/development/chronoline-app.
