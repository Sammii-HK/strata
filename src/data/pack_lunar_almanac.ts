// Lunar Almanac starter pack: real lunar missions and historically observed
// eclipses, mined from the lunar-almanac-ios app's curated dataset (NASA
// NSSDCA, national space agency press, and NASA's eclipse pages). Axis is
// year (same convention as History: negative = BCE).
//
// Two lanes:
//  - 'missions': robotic and crewed lunar missions, sub-laned by country so
//    the map can fan the Space Race open into its national programmes.
//  - 'eclipses': historically notable solar/lunar eclipses, sub-laned by
//    eclipse type (total/partial/annular/penumbral).
//
// All 15 missions in the source's missions.json carry a clean numeric `year`
// (launch year), country, achievements and a short story. The eclipses.json
// file itself has no top-level year (it describes each eclipse type's
// mechanics), but every one of its `notable_historic` sub-events does, so
// those 9 dated events are flattened into first-class items here.

export type LunarCategory = 'missions' | 'eclipses'

export interface LunarAlmanacObject {
  id: string
  name: string
  year: number
  category: LunarCategory
  /** Country (missions) or eclipse type (eclipses) - the fan sub-lane. */
  sub: string
  importance: 1 | 2 | 3 | 4
  note?: string
}

export const PACK: LunarAlmanacObject[] = [
  // ===== MISSIONS (source: missions.json, 15 entries, NASA NSSDCA + agency press) =====
  {
    id: 'la-luna-1',
    name: 'Luna 1',
    year: 1959,
    category: 'missions',
    sub: 'Soviet Union',
    importance: 2,
    note: "First craft to reach the Moon's vicinity and the first to escape Earth's gravity into solar orbit, missing its impact target by ~5,995 km",
  },
  {
    id: 'la-luna-3',
    name: 'Luna 3',
    year: 1959,
    category: 'missions',
    sub: 'Soviet Union',
    importance: 2,
    note: 'First images of the lunar far side, developed on board and radioed home, revealing a heavily cratered face with almost no maria',
  },
  {
    id: 'la-luna-10',
    name: 'Luna 10',
    year: 1966,
    category: 'missions',
    sub: 'Soviet Union',
    importance: 3,
    note: 'First spacecraft to orbit the Moon, proving sustained robotic observation was possible before any crewed landing',
  },
  {
    id: 'la-lunar-orbiter-1',
    name: 'Lunar Orbiter 1',
    year: 1966,
    category: 'missions',
    sub: 'United States',
    importance: 3,
    note: 'Mapped candidate Apollo landing sites and returned the first image of Earth seen from lunar orbit',
  },
  {
    id: 'la-apollo-8',
    name: 'Apollo 8',
    year: 1968,
    category: 'missions',
    sub: 'United States',
    importance: 1,
    note: "Borman, Lovell and Anders became the first humans to leave low Earth orbit, orbit the Moon, and witness Earthrise",
  },
  {
    id: 'la-apollo-11',
    name: 'Apollo 11',
    year: 1969,
    category: 'missions',
    sub: 'United States',
    importance: 1,
    note: "Armstrong and Aldrin landed Eagle in Mare Tranquillitatis on 20 July, the first crewed lunar landing, watched by an estimated 600 million people",
  },
  {
    id: 'la-apollo-13',
    name: 'Apollo 13',
    year: 1970,
    category: 'missions',
    sub: 'United States',
    importance: 2,
    note: 'An oxygen tank explosion crippled the ship en route; the crew used the Lunar Module Aquarius as a lifeboat and splashed down safely without landing',
  },
  {
    id: 'la-lunokhod-1',
    name: 'Lunokhod 1',
    year: 1970,
    category: 'missions',
    sub: 'Soviet Union',
    importance: 3,
    note: 'First robotic rover on another world; its laser retroreflector, rediscovered in 2010, is still used for lunar laser ranging today',
  },
  {
    id: 'la-apollo-17',
    name: 'Apollo 17',
    year: 1972,
    category: 'missions',
    sub: 'United States',
    importance: 1,
    note: 'Cernan and Schmitt made the last crewed lunar landing to date, the longest surface stay of the program, and Schmitt was the first scientist on the Moon',
  },
  {
    id: 'la-clementine',
    name: 'Clementine',
    year: 1994,
    category: 'missions',
    sub: 'United States',
    importance: 3,
    note: 'A compact technology demonstrator that mapped the Moon in multiple wavelengths and renewed interest in polar ice',
  },
  {
    id: 'la-lro',
    name: 'Lunar Reconnaissance Orbiter',
    year: 2009,
    category: 'missions',
    sub: 'United States',
    importance: 3,
    note: 'Still returning the most detailed global lunar imagery on record, mapping polar lighting, temperature and landing hazards',
  },
  {
    id: 'la-change-4',
    name: "Chang'e 4",
    year: 2019,
    category: 'missions',
    sub: 'China',
    importance: 2,
    note: 'First soft landing on the lunar far side, relayed via the Queqiao satellite parked at the Earth-Moon L2 point',
  },
  {
    id: 'la-change-5',
    name: "Chang'e 5",
    year: 2020,
    category: 'missions',
    sub: 'China',
    importance: 2,
    note: 'First lunar sample return since 1976; its regolith dated to about 2 billion years, younger than any Apollo or Luna sample',
  },
  {
    id: 'la-artemis-1',
    name: 'Artemis I',
    year: 2022,
    category: 'missions',
    sub: 'United States',
    importance: 2,
    note: 'Uncrewed Orion looped the Moon on the first flight of the Space Launch System, qualifying systems for a crewed return',
  },
  {
    id: 'la-chandrayaan-3',
    name: 'Chandrayaan-3',
    year: 2023,
    category: 'missions',
    sub: 'India',
    importance: 2,
    note: 'First landing near the lunar south pole and the first successful Indian lunar landing, touching down at Shiv Shakti Point',
  },

  // ===== ECLIPSES (source: eclipses.json notable_historic sub-events, 9 entries) =====
  {
    id: 'la-eclipse-thales',
    name: 'Eclipse of Thales',
    year: -584,
    category: 'eclipses',
    sub: 'Solar total',
    importance: 2,
    note: 'A total solar eclipse over Asia Minor that, per Herodotus, halted a battle between the Lydians and Medes; ancient sources credit Thales of Miletus with forecasting it',
  },
  {
    id: 'la-eclipse-columbus',
    name: "Columbus's lunar eclipse",
    year: 1504,
    category: 'eclipses',
    sub: 'Lunar total',
    importance: 2,
    note: 'Stranded in Jamaica, Columbus used an almanac forecast of this total lunar eclipse to convince Taíno chiefs to keep supplying his crew',
  },
  {
    id: 'la-eclipse-eddington',
    name: "Eddington's eclipse expedition",
    year: 1919,
    category: 'eclipses',
    sub: 'Solar total',
    importance: 1,
    note: "Arthur Eddington photographed stars near the totally eclipsed Sun from Príncipe and Sobral, confirming Einstein's general relativity",
  },
  {
    id: 'la-eclipse-2020-penumbral',
    name: 'June 2020 penumbral eclipse',
    year: 2020,
    category: 'eclipses',
    sub: 'Lunar penumbral',
    importance: 4,
    note: "Earth's outer shadow subtly dimmed the Moon, visible across much of Africa, Europe, Asia and Australia",
  },
  {
    id: 'la-eclipse-2021-partial',
    name: 'November 2021 partial lunar eclipse',
    year: 2021,
    category: 'eclipses',
    sub: 'Lunar partial',
    importance: 3,
    note: "97% of the Moon fell within Earth's umbra, the longest partial lunar eclipse in nearly 600 years",
  },
  {
    id: 'la-eclipse-2022-total',
    name: 'November 2022 total lunar eclipse',
    year: 2022,
    category: 'eclipses',
    sub: 'Lunar total',
    importance: 3,
    note: 'The last total lunar eclipse before 2025, visible across the Pacific, the Americas and eastern Asia',
  },
  {
    id: 'la-eclipse-2023-annular',
    name: 'October 2023 "ring of fire"',
    year: 2023,
    category: 'eclipses',
    sub: 'Solar annular',
    importance: 3,
    note: 'An annular eclipse traced Oregon to Central America; the Moon, near apogee, sat too small to fully cover the Sun',
  },
  {
    id: 'la-eclipse-2015-partial',
    name: 'March 2015 partial solar eclipse',
    year: 2015,
    category: 'eclipses',
    sub: 'Solar partial',
    importance: 4,
    note: 'Coverage exceeded 95% from northern Scotland and the Faroe Islands, and reached about 85% from London',
  },
  {
    id: 'la-eclipse-2024-total',
    name: 'Great North American Eclipse',
    year: 2024,
    category: 'eclipses',
    sub: 'Solar total',
    importance: 1,
    note: 'Totality up to 4 minutes 28 seconds swept Mexico through eastern North America, one of the most-observed eclipses in history',
  },
]
