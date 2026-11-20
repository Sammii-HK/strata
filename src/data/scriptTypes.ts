// Glyphs pack types and the script-type lanes.

export type ScriptTypeId = 'logographic' | 'syllabic' | 'abjad' | 'abugida' | 'alphabet' | 'mixed'

export type DeciphermentStatusId = 'deciphered' | 'partial' | 'undeciphered'

export interface SampleCharacter {
  form: string
  transliteration: string
  meaning: string
}

export interface NotableInscription {
  name: string
  story: string
}

export interface DeciphermentInfo {
  status: DeciphermentStatusId
  /** Year of decipherment, when known and applicable. */
  year?: number
  decipherer?: string
  story: string
}

export interface GlyphScript {
  id: string
  name: string
  /** First attested/emergence year, astronomical numbering (BCE negative). */
  year: number
  /** Last year of active use, or the current year if still in use. */
  endYear?: number
  /** Script classification, also used as the lane id. */
  lane: ScriptTypeId
  scriptType: ScriptTypeId
  /** Source app's scale: 4 marks the iconic scripts (cuneiform, Linear B,
   * Hangul). The map lifts those to Strata's headline tier, 1. */
  importance: 1 | 2 | 3 | 4
  /** Era dates are approximate ("c.") for most ancient scripts. */
  fuzzy?: boolean
  origin: string
  decipherment: DeciphermentInfo
  sampleCharacters: SampleCharacter[]
  notableInscriptions: NotableInscription[]
  sources: string[]
  /** Region the script originated in, revealed as a sub-lane when you zoom in. */
  sub?: string
}

// Script-classification lines. Array order = top-to-bottom row order on the map.
export const SCRIPT_TYPES: { id: ScriptTypeId; name: string; color: string }[] = [
  { id: 'logographic', name: 'Logographic', color: '#D7494C' },
  { id: 'syllabic', name: 'Syllabic', color: '#E0699A' },
  { id: 'abjad', name: 'Abjad', color: '#E8B84B' },
  { id: 'abugida', name: 'Abugida', color: '#2FA98C' },
  { id: 'alphabet', name: 'Alphabet', color: '#4C82C3' },
  { id: 'mixed', name: 'Mixed', color: '#8A6DC4' },
]

export const SCRIPT_TYPE_MAP: Record<string, { name: string; color: string }> = Object.fromEntries(
  SCRIPT_TYPES.map((t) => [t.id, { name: t.name, color: t.color }])
)
