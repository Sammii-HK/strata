// Etymos: word-origin timeline. Same engine as History, but each item is a
// single word positioned at the earliest attested/reconstructed year of its
// etymology_timeline, spanning forward to the year its modern English form
// settles. Lanes are language families (the route a word's ancestors travelled
// through); `sub` is the origin language of that earliest attested stage, so
// zooming into a family (e.g. Germanic) can later fan into its languages
// (Old English, Old Norse, Gothic...).
//
// Source: hand-curated dataset from the Etymos iOS app (81 words, 262
// etymology_timeline stages, roots.json, language_families.json). Adapted here
// into StrataItem shape; no content invented.

export type WordThread = 'germanic' | 'italic' | 'hellenic' | 'semitic' | 'indoIranian' | 'celtic' | 'otherIE' | 'uralic'

export interface WordEvent {
  id: string
  /** The modern English headword. */
  title: string
  /** Earliest attested/reconstructed year on the word's etymology_timeline (BCE negative). */
  year: number
  /** Year the modern English form settles, if later than `year`. */
  endYear?: number
  thread: WordThread
  /** Origin language of the earliest timeline stage (e.g. "Old English", "Arabic", "Proto-Indo-European"). */
  sub?: string
  domain: 'language'
  importance: 1 | 2 | 3 | 4
  /** True when the earliest stage is a reconstructed root (starts with *) rather than directly attested. */
  fuzzy?: boolean
  partOfSpeech: string
  /** Modern definition + compact stage-by-stage chain, e.g. "al- (Arabic, c. 700) -> al-kimiya (medieval) -> alchemy (English)". */
  note?: string
}
