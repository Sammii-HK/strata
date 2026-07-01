# Chronoline — product plan

## What it is
A premium, beautiful, interactive atlas of everything, built on one zoomable engine.
You zoom out for the big picture and in for the detail, and any two things can be
compared for the gap between them. History is the first lens; the same engine powers
space, evolution and the deep ocean.

## The bet
Reference facts are free (Wikipedia). People pay for a delightful, giftable
experience. The moat is design taste plus curation, not data volume. Proof that this
category sells: The Elements (Theodore Gray), Star Walk / Sky Guide.

## Model: one app, free core, paid packs
One app is one marketing surface, so reviews, ranking and reach compound instead of
splitting across many apps. Packs are one-time unlocks (reference apps convert far
better on one-time than subscription), plus a discounted "everything" bundle.

- **Free (the hook): Cosmos / zodiac.** The most viral lens (how small are we), and the
  one Sammii's astrology / Lunary audience will install on day one. Drives installs,
  reviews and word of mouth.
- **Pack: Recorded history** — built. £3.99
- **Pack: Life on Earth** (evolution, first life to dinosaurs to humans) — huge family
  appeal, deep-time log axis already built, the tree-of-life IS the zoom-split. £3.99
- **Pack: The Deep** (oceans: surface to trenches, shipwrecks, basins) — gorgeous,
  travels well socially. £3.99
- **Bundle: everything + future packs** — £9.99

Family mode is a setting (reuses the sensitivity curation), not a separate app.

## Funnel
Astrology / Lunary audience -> free Cosmos lens (zodiac-depth reveal, "your sign is
scattered stars light-years apart") -> reviews + shares -> upsell history / evolution /
ocean packs -> bundle. The cosmos lens is both the hook and the on-brand wedge.

## Money-likelihood ranking
1. Cosmos / zodiac (audience + viral) — flagship + free
2. Recorded history (built, broad) — first paid pack
3. Life on Earth (family, no sensitivity headaches)
4. The deep ocean (visually striking)

## Near-term roadmap
1. Ship history pack native (in progress: Expo + Skia, engine ported).
2. Wire StoreKit / RevenueCat for one-time unlocks + bundle.
3. Cosmos lens as the free hook (log distance axis is already built).
4. App Store listing: educational category (sidesteps the astrology "fortune telling"
   rejection risk that hits Lunary), giftable framing, strong screenshots of the zoom.
5. Evolution and ocean packs as data configs on the same engine (Codex-able, cheap).

## KPIs
Installs (from the free cosmos hook), free-to-paid conversion per pack, bundle take
rate, review volume and rating, share/referral loop from the cosmos lens.

## Engineering note
The engine is data-driven: each lens is { axis transform + ticks, lanes + sub-lanes,
items, formatters, palette, scale-reveal generators }. History, cosmos, evolution and
ocean are configs of one shared core, so new lenses are cheap to add without a rebuild.
