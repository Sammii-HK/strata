// Fun-fact-of-the-day content, drawn from the Strata maps. Two shapes:
//  - 'place': one thing and where it sits on the scale
//  - 'gap':   the distance or time between two things (the "wait, really?" ones)
// The widget picks one per day; the app can surface these too. All offline.

export interface Fact {
  kind: 'place' | 'gap'
  map: 'Cosmos' | 'History'
  headline: string // the punchy line
  detail: string // the supporting context
}

export const FACTS: Fact[] = [
  // ---- Cosmos: place ----
  { kind: 'place', map: 'Cosmos', headline: 'The ISS is 8 light-milliseconds away', detail: 'It orbits about 400 km up, so close that Strata has to zoom past it before the Moon even appears.' },
  { kind: 'place', map: 'Cosmos', headline: 'Proxima Centauri is 4.24 light-years away', detail: 'The nearest star to the Sun, yet still 270,000 times farther than the Sun itself.' },
  { kind: 'place', map: 'Cosmos', headline: 'The Milky Way is 100,000 light-years across', detail: 'Light that left the far side when our ancestors were flint-knapping is only arriving now.' },
  { kind: 'place', map: 'Cosmos', headline: 'Andromeda is 2.5 million light-years away', detail: 'The farthest thing you can see with the naked eye, and it is coming towards us.' },
  { kind: 'place', map: 'Cosmos', headline: 'The observable universe is 93 billion light-years wide', detail: 'Bigger than its age in light-years, because space itself has been stretching.' },
  { kind: 'place', map: 'Cosmos', headline: 'Voyager 1 is about a light-day from home', detail: 'The most distant human-made object, and it has barely left the front porch of the Solar System.' },

  // ---- Cosmos: gap / illusion ----
  { kind: 'gap', map: 'Cosmos', headline: 'A constellation is an illusion of depth', detail: 'The stars of Orion look like a group, but some are hundreds of light-years farther than others.' },
  { kind: 'gap', map: 'Cosmos', headline: 'The Sun is closer to Earth than to its neighbours', detail: 'Alpha Centauri is 270,000 times farther from us than the Sun, and it is the closest star system.' },
  { kind: 'gap', map: 'Cosmos', headline: 'Light needs 8 minutes to reach us from the Sun', detail: 'You always see the Sun as it was, never as it is.' },

  // ---- History: place ----
  { kind: 'place', map: 'History', headline: 'The Great Pyramid was built around 2560 BC', detail: 'It stood for over 3,800 years as the tallest structure humans had ever made.' },
  { kind: 'place', map: 'History', headline: 'Gutenberg printed his Bible around 1455', detail: 'Within 50 years, printed books outnumbered every manuscript copied in the previous thousand.' },
  { kind: 'place', map: 'History', headline: 'The first Moon landing was 1969', detail: 'Only 66 years after the Wright brothers first left the ground at Kitty Hawk in 1903.' },
  { kind: 'place', map: 'History', headline: 'Penicillin was discovered in 1928', detail: 'A stray mould on a forgotten dish, and suddenly infections stopped being a death sentence.' },
  { kind: 'place', map: 'History', headline: 'Darwin published On the Origin of Species in 1859', detail: 'The same decade the germ theory of disease took hold, a turning point for how we see life.' },

  // ---- History: gap (the striking ones) ----
  { kind: 'gap', map: 'History', headline: 'Cleopatra lived closer to the Moon landing than to the Pyramids', detail: 'The Great Pyramid was already 2,500 years old in her lifetime; the Moon landing was only 2,000 years after.' },
  { kind: 'gap', map: 'History', headline: 'Only ~360 years separate the telescope and the Moon landing', detail: 'From first looking up through glass to walking on the Moon, less than five lifetimes.' },
  { kind: 'gap', map: 'History', headline: 'The T. rex is closer to us than to the Stegosaurus', detail: 'More time separates those two dinosaurs than separates T. rex from you.' },
  { kind: 'gap', map: 'History', headline: 'Oxford University is older than the Aztec Empire', detail: 'Teaching began at Oxford around 1096; Tenochtitlan was founded in 1325.' },
  { kind: 'gap', map: 'History', headline: 'The fax machine is older than the American Civil War', detail: 'Patented in 1843, eighteen years before the war began.' },
  { kind: 'gap', map: 'History', headline: 'Woolly mammoths still roamed when the Pyramids were built', detail: 'A small population survived on Wrangel Island until about 2000 BC.' },
]
