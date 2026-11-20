// Calendarium: real calendar systems across cultures and history, positioned
// by the year each was introduced, formally adopted, or reformed. Hand-
// researched content (Britannica, Wikipedia, and scholarly secondary sources
// per entry), not mined from an existing sibling app, since this pack has
// no prior thin-app source. See packs/calendarium/calendarium.json for the
// portable source-of-truth data this file mirrors into StrataItem shape.
export type CalendarLane = 'solarSolarized' | 'lunisolar' | 'lunar' | 'mesoamerican' | 'revolutionary' | 'technical'

/** A single calendar system, positioned at the year it was introduced/adopted/reformed. */
export interface CalendarEvent {
  id: string
  title: string
  /** Year of introduction/adoption/reform (BCE negative). */
  year: number
  /** Year a temporary/superseded system ended, if applicable (e.g. French Republican, Soviet). */
  endYear?: number
  lane: CalendarLane
  /** Named reformer(s)/creator(s), or the institution responsible. */
  creator: string
  importance: 1 | 2 | 3 | 4
  /** True when the introduction date is a scholarly best-estimate or traditional attribution, not a firm record. */
  fuzzy?: boolean
  note: string
}

export const PACK: CalendarEvent[] = [
  {
    id: 'egyptian-civil',
    title: 'Egyptian Civil Calendar',
    year: -2510,
    lane: 'solarSolarized',
    fuzzy: true,
    importance: 3,
    creator: 'Old Kingdom Egyptian administrators/astronomers (no single named reformer)',
    note: "A 365-day civil calendar of 12 months of 30 days plus 5 extra 'epagomenal' days at year's end. Earliest firm attestation is the reign of Neferirkare (mid-25th century BCE, Dynasty V); probable use as early as Shepseskaf (c. 2510 BCE). It ran deliberately unlinked to the true solar year (365.2422 days), drifting a full day roughly every 4 years and cycling through the seasons over 1,460 years (the Sothic cycle).",
  },
  {
    id: 'roman-republican',
    title: 'Roman Republican Calendar',
    year: -450,
    lane: 'lunisolar',
    fuzzy: true,
    importance: 2,
    creator: 'Attributed by Roman tradition to King Numa Pompilius; formalised under the early Republic',
    note: 'A lunisolar calendar of 355 days across 12 months, kept in sync with the seasons by an irregular intercalary month inserted at the discretion of the Pontifex Maximus. Political manipulation of intercalation (extending allies’ terms, shortening rivals’) left it badly adrift by Julius Caesar’s time, forcing his 46 BCE reform.',
  },
  {
    id: 'julian',
    title: 'Julian Calendar',
    year: -45,
    lane: 'solarSolarized',
    importance: 1,
    creator: 'Julius Caesar, advised by the Alexandrian astronomer Sosigenes',
    note: 'Proposed by Caesar in 46 BCE and took effect 1 January 45 BCE. Fixed the year at 365.25 days with a leap day every 4th year, replacing the drifting Roman Republican calendar. To realign the seasons, 46 BCE itself was stretched to 445 days, the ‘Year of Confusion’. The Julian calendar remained the predominant Western calendar for over 1,600 years until the Gregorian reform of 1582.',
  },
  {
    id: 'hebrew-fixed',
    title: 'Hebrew Calendar (fixed arithmetic form)',
    year: 359,
    lane: 'lunisolar',
    fuzzy: true,
    importance: 2,
    creator: 'Traditionally attributed to Patriarch Hillel II',
    note: 'Jewish tradition credits Hillel II with fixing a calculated, rule-based lunisolar calendar in 359 CE (year 670 of the Seleucid era), replacing observation-based month sightings with a 19-year (Metonic) intercalation cycle. Modern scholarship suggests the fully modern arithmetic rules (including the exact molad interval and postponement rules) actually stabilized later, between the 7th and 8th centuries CE, under the Babylonian Geonim.',
  },
  {
    id: 'islamic-hijri',
    title: 'Islamic (Hijri) Calendar',
    year: 638,
    lane: 'lunar',
    importance: 1,
    creator: 'Caliph Umar ibn al-Khattab',
    note: 'A purely lunar calendar of 12 months of 29-30 days (354/355-day year, no intercalation), so it cycles through the seasons over about 33 years. Caliph Umar formally established the era in 638 CE (16 AH), choosing the Hijra (Muhammad’s migration from Mecca to Medina) as year 1, retroactively dated to 622 CE (16 July, Julian).',
  },
  {
    id: 'chinese-taichu',
    title: 'Chinese Calendar (Taichu reform)',
    year: -104,
    lane: 'lunisolar',
    importance: 2,
    creator: 'Emperor Wu of Han, astronomers Deng Ping and Luoxia Hong',
    note: "Emperor Wu ordered a calendar reform in 104 BCE, producing the Taichu ('Grand Inception') calendar, the oldest Chinese calendar whose computational data survive in full. It fixed the first lunar month as the start of the year and formalized the 24 solar terms and flexible intercalary-month placement, conventions the Chinese lunisolar calendar still follows.",
  },
  {
    id: 'maya-long-count',
    title: 'Maya Long Count Calendar',
    year: -3114,
    lane: 'mesoamerican',
    fuzzy: true,
    importance: 2,
    creator: 'Pre-Classic Maya (exact originators unrecorded)',
    note: 'A non-repeating, base-20/18 day-count used to track long spans of time, running from a mythological creation date of 13.0.0.0.0, 4 Ahau 8 Kumku. Under the scholarly-consensus GMT correlation (Goodman-Martinez-Thompson, constant 584,283), that creation date corresponds to 11 August 3114 BCE in the proleptic Gregorian calendar, a date confirmed independently via carbon-14 dating of a carved lintel at Tikal’s Temple I.',
  },
  {
    id: 'julian-day-number',
    title: 'Julian Day Number',
    year: 1583,
    lane: 'technical',
    importance: 2,
    creator: 'Joseph Scaliger',
    note: 'Not a civil calendar but a continuous day-count for astronomers and historians, published by Joseph Scaliger in De Emendatione Temporum (1583). He set day 0 at noon UT, 1 January 4713 BCE (proleptic Julian calendar): the most recent point where three cycles he multiplied together (the 28-year solar cycle, 19-year Metonic cycle, 15-year Roman indiction; 28×19×15 = 7,980 years) all restarted at once. Named for his father, Julius Caesar Scaliger, not for Julius Caesar. Astronomer John Herschel popularized its modern form in 1849.',
  },
  {
    id: 'gregorian',
    title: 'Gregorian Calendar',
    year: 1582,
    lane: 'solarSolarized',
    importance: 1,
    creator: 'Pope Gregory XIII, based on proposals by Aloysius Lilius, refined by Christopher Clavius',
    note: 'Promulgated by the papal bull Inter Gravissimas in February 1582 to correct Julian-calendar drift (11 minutes/year, about 1 day per 314 years) that had pushed the vernal equinox to 11 March. To realign it, Thursday 4 October 1582 was directly followed by Friday 15 October 1582: 10 days simply vanished. It refined the Julian leap-year rule so century years are leap years only if divisible by 400 (2000 was, 1900 wasn’t). Catholic states adopted it immediately; Protestant and Orthodox countries held out for centuries.',
  },
  {
    id: 'british-1752',
    title: 'British Empire adopts the Gregorian Calendar',
    year: 1752,
    lane: 'solarSolarized',
    importance: 3,
    creator: "Parliament of Great Britain (Calendar (New Style) Act 1750, 'Chesterfield's Act')",
    note: 'Britain and its colonies (including the American colonies) held out on the Julian calendar 170 years after Rome switched. The 1750 Act elided 11 days: Wednesday 2 September 1752 was followed by Thursday 14 September 1752. The same act moved the legal new year from 25 March to 1 January. Popular legend holds rioters demanded ‘give us our eleven days back,’ though historians now doubt organized riots actually occurred.',
  },
  {
    id: 'french-republican',
    title: 'French Republican Calendar',
    year: 1793,
    endYear: 1805,
    lane: 'revolutionary',
    importance: 2,
    creator: "National Convention, calendar design credited to Gilbert Romme and poet Fabre d'Eglantine",
    note: "Adopted by the Convention in October 1793, retroactively dated from 22 September 1792 (Year I). Twelve 30-day months split into three 10-day 'decades' (no 7-day week), plus 5-6 intercalary days, all explicitly designed to strip out religious and royalist associations. Napoleon abolished it by decree on 9 September 1805 (22 Fructidor Year XIII). It had one final 18-day revival under the Paris Commune, 6-23 May 1871.",
  },
  {
    id: 'iranian-jalali',
    title: 'Iranian Jalali Calendar',
    year: 1079,
    lane: 'solarSolarized',
    importance: 3,
    creator: 'Omar Khayyam and a committee of astronomers under Sultan Malik-Shah I',
    note: 'Adopted 15 March 1079 at the Seljuk imperial observatory in Isfahan after 8 years of astronomical work led by the mathematician-poet Omar Khayyam. A purely observational solar calendar keyed to the true vernal equinox rather than fixed arithmetic rules, it corrected roughly 18 days of accumulated drift and is considered more accurate over long spans than the Gregorian calendar’s rule-based leap years.',
  },
  {
    id: 'iranian-solar-hijri-modern',
    title: 'Modern Iranian Solar Hijri Calendar',
    year: 1925,
    lane: 'solarSolarized',
    importance: 3,
    creator: 'Legislated under the early Pahlavi government of Iran',
    note: 'Legally adopted 31 March 1925, this reform fixed the number of days in each of the 12 months (rather than the variable lengths of the old Jalali system tied to zodiac transit times) while keeping the observational vernal-equinox New Year (Nowruz) at its root. Variants remain the official calendar of Iran and Afghanistan today.',
  },
  {
    id: 'ethiopian',
    title: 'Ethiopian Calendar',
    year: 500,
    lane: 'solarSolarized',
    fuzzy: true,
    importance: 3,
    creator: 'Descended from the Alexandrian/Coptic calendar via Alexandrian monk-chronologists (e.g. Annianus of Alexandria, 5th century)',
    note: 'A 13-month solar calendar (12 months of 30 days plus a 5-6 day 13th month, Pagume) directly descended from the ancient Coptic calendar. It runs 7-8 years behind the Gregorian calendar because Ethiopian and Coptic tradition followed the Alexandrian monk Annianus’s 5th-century calculation of the Annunciation, distinct from the later Western dating Europe eventually settled on — the gap is a difference in year-zero, not day-length.',
  },
  {
    id: 'iso-week-date',
    title: 'ISO Week Date (ISO 8601)',
    year: 1988,
    lane: 'technical',
    importance: 4,
    creator: 'International Organization for Standardization',
    note: 'ISO 8601, first published June 1988, standardised the modern ISO week-numbering system (weeks run Monday-Sunday; a year’s week 1 is whichever week contains 4 January), superseding the earlier ISO 2015:1976 week-numbering standard. Not a full calendar system on its own but a widely used overlay on the Gregorian calendar for business, ISO dates (YYYY-MM-DD), and software timestamps.',
  },
  {
    id: 'soviet-calendar',
    title: 'Soviet Revolutionary Calendar',
    year: 1929,
    endYear: 1940,
    lane: 'revolutionary',
    importance: 3,
    creator: 'Council of People’s Commissars of the USSR',
    note: 'Decreed August 1929, replacing the 7-day week with a continuous 5-day production week (nepreryvka): workers were split into 5 colour-coded shift groups so factories never stood idle, each person resting on a different staggered day. Widely disliked (it fractured shared rest days and family time), it was modified to a 6-day week in December 1931 before the traditional 7-day week (with Sunday rest) was fully restored in March 1940.',
  },
  {
    id: 'bahai-badi',
    title: "Baha'i (Badi) Calendar",
    year: 1844,
    lane: 'solarSolarized',
    importance: 3,
    creator: "The Bab; later elaborated by Baha'u'llah",
    note: "A solar calendar of 19 months of 19 days (361 days) plus 4-5 intercalary days (Ayyam-i-Ha), with the new year at the northward equinox. Dated from 1844 CE, the year the Bab began teaching in Shiraz, Persia. Its modern worldwide implementation, fixing dates by the equinox as observed from Tehran rather than locally, only took uniform effect starting sunset 20 March 2015, after a unifying announcement by the Universal House of Justice on 10 July 2014.",
  },
  {
    id: 'julian-day-astronomical',
    title: 'Julian Day astronomical standard (Herschel)',
    year: 1849,
    lane: 'technical',
    importance: 4,
    creator: 'Sir John Herschel',
    note: 'Astronomer John Herschel formalised and popularised Scaliger’s 1583 Julian Period as a practical running day-count for observational astronomy in his 1849 textbook Outlines of Astronomy, cementing the Julian Day Number as the standard cross-calendar reference still used in astronomy, GPS timing, and software date libraries today.',
  },
]
