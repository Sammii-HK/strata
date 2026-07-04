# Strata social video scripts — Batch 01

Format: "Zoom Gap" — 15–22s vertical (TikTok/Reels/Shorts). All facts below are
verified against real Strata source data (see citation lines). No voiceover —
captions do the work, screen-recording of the actual app timeline/globe is
the b-roll.

**Recording note:** Strata's UI has no "jump to event" navigation hook yet, so
these need to be recorded manually — scrub/pinch to each named event by hand
in the simulator or a real device, following the shot list per script. If we
end up producing a lot of these, it's worth adding a debug deep-link
(`strata://focus?id=<event-id>`) so recording can be scripted instead of
manual — flagging as a real follow-up, not doing it speculatively now.

**Posting rule (from the X algorithm notes already in memory):** no link in
the video or caption body — link goes in bio/first comment only. Reply to
every comment in the first 30 minutes if humanly possible; that's worth more
than the post itself for reach.

---

## 1. Cleopatra / Pyramids / Moon landing
Source: `src/data/events.ts` — `great-pyramid` (year -2560), `cleopatra`
(year -51 to -30). Pre-existing fact, already in `src/facts.ts`.

- **0–3s hook (on-screen text over a still Egypt-region timeline view):**
  "Cleopatra lived closer to the Moon landing than to the Pyramids"
- **3–14s reveal (shot list):** Start zoomed on the Great Pyramid marker
  (-2560). Slow zoom-out/pan right along the timeline toward Cleopatra
  (-30), holding a beat there, then continue the pan toward the present day
  and let "1969 — Moon landing" stamp in.
- **14–18s gut-punch:** "2,530 years to the Pyramids. Only 1,999 to Apollo 11."
- **18–22s out:** Strata logo, no CTA link — just "zoom your own timeline."

---

## 2. Confucius / Roman Republic / Pyramids
Source: mined via `scripts/mine-surprising-facts.ts --mode=gap --map=History`.
`events.ts` — `confucius` (year -551), `roman-republic` (year -509),
`great-pyramid` (year -2560). Verified non-fuzzy.

- **Hook:** "Confucius never met a Roman — but almost did"
- **Reveal shot list:** Start on Confucius marker (-551), short zoom/pan to
  Roman Republic founding (-509) — the gap should read as visually tiny.
  Then pull back to show the Great Pyramid (-2560) far to the left for scale.
- **Gut-punch:** "42 years apart. The Pyramids were already 2,000 years old
  by then."
- **Out:** logo, "zoom your own timeline."

---

## 3. Oxford University / Aztec Empire
Source: pre-existing, `src/facts.ts` line 38.

- **Hook:** "Oxford University is older than the Aztec Empire"
- **Reveal shot list:** Start on Oxford teaching origin (~1096), pan right
  to Tenochtitlan founding (1325).
- **Gut-punch:** "229 years of Oxford lectures before the Aztecs existed."
- **Out:** logo, "zoom your own timeline."

---

## 4. Fax machine / American Civil War
Source: pre-existing, `src/facts.ts` line 39.

- **Hook:** "The fax machine predates the American Civil War"
- **Reveal shot list:** Start on fax machine patent (1843), short pan to
  Civil War start (1861).
- **Gut-punch:** "18 years of fax machines before the war even started."
- **Out:** logo, "zoom your own timeline."

---

## 5. Woolly mammoths / Pyramids — NEEDS A DIFFERENT SHOT, SEE BELOW
Source: pre-existing, `src/facts.ts` line 40. **Checked: there is no
structured data entry for this anywhere in the mined dataset** (grepped all
of `src/data/*.ts` for "mammoth" — zero hits). It's hand-written prose in
`facts.ts`/`widget.swift` only, never added as a real timeline marker. The
in-app "pan from Pyramid to the other marker" shot this format relies on
doesn't work here because there's no second marker to pan to.

Two ways to fix, your call:
- **(a)** Add a real `wrangel-island-mammoths` entry to `events.ts` (year
  -2000, sourced/citable — Wrangel Island's mammoth population is a
  real, well-documented paleontology fact) — then this becomes a normal
  in-app pan shot like the others, and the entry is a legitimate small
  content addition either way.
- **(b)** Skip the in-app pan for this one specifically and use a real
  photo/illustration cutaway instead (mammoth image cut to Pyramid
  timeline marker) — faster, but breaks the "the app is the b-roll"
  consistency of the rest of the batch.

Rest of the script stands either way:
- **Hook:** "Woolly mammoths were alive when the Pyramids went up"
- **Gut-punch:** "A live mammoth population overlapped construction by
  centuries."
- **Out:** logo, "zoom your own timeline."

---

## 6. Italian Renaissance / Aztec Empire
Source: mined via `scripts/mine-surprising-facts.ts --mode=gap --map=History`.
`events.ts` — `renaissance` (year 1400), `aztec-empire` (year 1428).
Verified non-fuzzy.

- **Hook:** "The Italian Renaissance and the Aztec Empire started a
  generation apart"
- **Reveal shot list:** Start on Renaissance marker (1400), short pan to
  Aztec Empire founding (1428).
- **Gut-punch:** "28 years apart. Most people file these in completely
  different eras — they weren't."
- **Out:** logo, "zoom your own timeline."

---

## 7. Genghis Khan's conquests / Mansa Musa's Mali Empire
Source: mined via `scripts/mine-surprising-facts.ts --mode=gap --map=History`.
`events.ts` — `mongol-conquests` (year 1206), `mali-empire` (year 1235).
Verified non-fuzzy. Reframed hook per feedback — don't assume the audience
knows who Mansa Musa is, lead with the "richest man in history" hook instead.

- **Hook:** "The richest man who ever lived was building his empire at the
  same time as Genghis Khan"
- **Reveal shot list:** Start on Mongol conquests marker (1206), short pan
  to Mali Empire founding (1235). On-screen label introduces "Mansa Musa,
  Mali Empire" only once the pan lands.
- **Gut-punch:** "29 years apart. Two empires you'd never picture in the
  same era — completely contemporary."
- **Out:** logo, "zoom your own timeline."

---

## 8. Sirius / Wezen (Canis Major) — NEEDS A DIFFERENT SHOT, SEE BELOW
Source: mined via `scripts/mine-surprising-facts.ts --mode=depth-illusion`.
`pack_cosmos_constellations.ts` — `cn-cma-sirius` (8.6ly), `cn-cma-wezen`
(1600ly), both `sub: 'Canis Major'`. Data verified — the pack's own note
text already gestures at this ("nearly 200 times further than Sirius in
the same little dog").

**Checked the actual CosmosCanvas code: this shot doesn't work as
described.** The canvas places objects in horizontal lanes by category
(stars/local-group/etc.) and positions them on the X-axis by log-scale
distance — it does NOT render apparent night-sky position or constellation
shapes. Sirius and Wezen already sit far apart on-screen in the app; there's
no "these look grouped" moment to contrast against, because the illusion
Strata's own existing fact describes isn't something the current UI shows.

This needs a genuine two-shot treatment instead of one continuous in-app
pan: (1) a real night-sky photo/illustration of Canis Major showing Sirius
and Wezen looking like part of the same shape, cut to (2) Strata's own
distance canvas showing the real 1,591ly gap. Not a blocker, just a
different, non-in-app-only production plan than the History scripts.

- **Hook:** "These two stars look like neighbours. One is 200x farther
  than the other."
- **Gut-punch:** "Sirius: 8.6 light-years. Wezen: 1,600. Same constellation,
  wildly different distances."
- **Out:** logo, "zoom your own timeline."

---

## 9. Rigil Kentaurus / Hadar (Centaurus) — same caveat as script 8
Source: mined via `scripts/mine-surprising-facts.ts --mode=depth-illusion`.
`pack_cosmos_constellations.ts` — Rigil Kentaurus (4.4ly, i.e. Alpha
Centauri), Hadar (390ly), both `sub: 'Centaurus'`. Same two-shot treatment
as script 8 needed (real sky reference, then Strata's distance canvas).

- **Hook:** "The closest star system to Earth is standing right next to a
  star 90x farther away"
- **Gut-punch:** "Rigil Kentaurus: 4.4 light-years. Hadar: 390. They're not
  neighbours — they just look like it from here."
- **Out:** logo, "zoom your own timeline."

---

## Open items before recording
1. Confirm the exact mammoth-extinction entry/id for script 5 (grep didn't
   surface it in this session — check `pack_history_world.ts`/`events.ts`
   directly, or pull the citation from the existing `facts.ts`/widget
   source note if the underlying dated entry isn't in the mined dataset).
2. Confirm Strata's Cosmos canvas actually has a "depth reveal" interaction
   (un-flattening a 2D constellation view into 3D distance) — scripts 8/9
   assume this exists; if it doesn't, the visual needs a different shot
   (e.g., side-by-side distance bars) instead.
3. Once account creation is done, wire up a Spellcast account set for
   Strata (same pattern as existing "Lunary"/"sammii" sets) so scheduling
   these is one step, not a manual upload each time.
