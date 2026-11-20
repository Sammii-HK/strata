// AUTO-derived from glyphs-ios Resources/content/scripts.json (62 deciphered/
// undeciphered writing systems; the source's second Old Persian Cuneiform entry
// is dropped as a duplicate, curated with academic sources: Coe, Chadwick,
// Parpola, Walker, Daniels & Bright, etc). Era ranges converted to astronomical
// year numbering (BCE negative) to match the History pack's `year` convention.
import type { GlyphScript } from './scriptTypes'

export const PACK: GlyphScript[] = [
  {
    id: 'gl-sumerian-cuneiform',
    name: "Sumerian Cuneiform",
    year: -3200,
    endYear: 100,
    lane: "logographic",
    sub: "Mesopotamia",
    scriptType: "logographic",
    importance: 4,
    fuzzy: true,
    origin: "Cuneiform emerged in southern Mesopotamia among Sumerian scribes who began impressing wedge-shaped marks into wet clay tablets with reed styluses. Early signs were pictographic accounting tokens for grain, livestock, and labour; over centuries the signs abstracted into combinations of vertical, horizontal, and angled wedges, becoming flexible enough to record prayers, law, literature, and astronomy across many languages.",
    decipherment: {
      status: "deciphered",
      year: 1857,
      decipherer: "Henry Rawlinson, Edward Hincks, Jules Oppert, William Henry Fox Talbot",
      story: "Decipherment proceeded through Old Persian cuneiform first, using the trilingual Behistun Inscription. Once Old Persian was readable, scholars worked outward into Elamite and Akkadian, and from Akkadian back into Sumerian. In 1857 the Royal Asiatic Society set four scholars the same untranslated Akkadian text in sealed envelopes; their independent translations matched closely enough to confirm the method.",
    },
    sampleCharacters: [
      { form: "𒀀", transliteration: "a", meaning: "water" },
      { form: "𒁹", transliteration: "an / dingir", meaning: "sky / god" },
      { form: "𒌴", transliteration: "lugal", meaning: "king" },
      { form: "𒂞", transliteration: "kur", meaning: "mountain / land" }
    ],
    notableInscriptions: [
      { name: "Code of Hammurabi", story: "An Akkadian-language stele from c. 1754 BCE recording 282 legal provisions. One of the earliest deciphered long-form legal codes." },
      { name: "Epic of Gilgamesh tablets", story: "Akkadian recensions copied across Mesopotamia preserve one of the oldest surviving works of literature, including a flood narrative." }
    ],
    sources: [
      "Walker, C.B.F. (1987). Cuneiform. British Museum Press.",
      "Cuneiform Digital Library Initiative (cdli.ucla.edu) - public-domain tablet imagery and metadata.",
      "Unicode Standard, Cuneiform block U+12000-U+123FF."
    ],
  },
  {
    id: 'gl-egyptian-hieroglyphs',
    name: "Egyptian Hieroglyphs",
    year: -3200,
    endYear: 400,
    lane: "mixed",
    sub: "Egypt",
    scriptType: "mixed",
    importance: 4,
    fuzzy: true,
    origin: "Egyptian hieroglyphs are a mixed script combining logograms, phonograms, and determinatives. They were used for monumental inscriptions on temples, tombs, and stelae, while everyday writing used the cursive hieratic and later demotic derivatives. The system encoded consonants only, with determinative signs marking semantic categories.",
    decipherment: {
      status: "deciphered",
      year: 1822,
      decipherer: "Jean-Francois Champollion",
      story: "The Rosetta Stone, found by French troops in 1799, carried the same decree in hieroglyphs, demotic, and Greek. Thomas Young identified the cartouche of Ptolemy and several phonetic values. Champollion, building on Young and on his own knowledge of Coptic, demonstrated in 1822 that hieroglyphs were partly phonetic and partly logographic, cracking the system.",
    },
    sampleCharacters: [
      { form: "𓀛", transliteration: "j", meaning: "reed leaf - phonetic j" },
      { form: "𓂞", transliteration: "ankh", meaning: "life" },
      { form: "𓂗", transliteration: "pr", meaning: "house" },
      { form: "𓆐", transliteration: "nfr", meaning: "good / beautiful" }
    ],
    notableInscriptions: [
      { name: "Rosetta Stone", story: "A 196 BCE decree of Ptolemy V in three scripts; the bilingual key to modern Egyptology." },
      { name: "Pyramid Texts", story: "Funerary texts inscribed in Old Kingdom royal pyramids, the oldest substantial body of religious literature in any language." }
    ],
    sources: [
      "Allen, J.P. (2014). Middle Egyptian: An Introduction to the Language and Culture of Hieroglyphs. Cambridge UP.",
      "British Museum object record EA24 (Rosetta Stone).",
      "Unicode Standard, Egyptian Hieroglyphs block U+13000-U+1342F."
    ],
  },
  {
    id: 'gl-linear-b',
    name: "Linear B",
    year: -1450,
    endYear: -1200,
    lane: "syllabic",
    sub: "Aegean",
    scriptType: "syllabic",
    importance: 4,
    fuzzy: true,
    origin: "Linear B was used by Mycenaean palace administrations on Crete and the Greek mainland to record inventories, offerings, and personnel. It is largely syllabic, with about 90 syllabic signs plus logograms for commodities. The script was inscribed on clay tablets that were inadvertently preserved when palace fires baked them.",
    decipherment: {
      status: "deciphered",
      year: 1952,
      decipherer: "Michael Ventris (with John Chadwick)",
      story: "Alice Kober's grid analysis of recurring sign patterns prepared the ground. Architect Michael Ventris, treating the script as a syllabary, built on Kober's work and tested the hypothesis that the underlying language was an early form of Greek. Place names such as ko-no-so (Knossos) confirmed the reading. Linguist John Chadwick formalised the decipherment with him.",
    },
    sampleCharacters: [
      { form: "𐀀", transliteration: "a", meaning: "syllable a" },
      { form: "𐀏", transliteration: "jo", meaning: "syllable jo" },
      { form: "𐀛", transliteration: "ma", meaning: "syllable ma" },
      { form: "𐀬", transliteration: "qe", meaning: "syllable qe" }
    ],
    notableInscriptions: [
      { name: "Pylos Tablets", story: "Hundreds of administrative tablets baked in the destruction of the Palace of Nestor, providing the bulk of decipherable Linear B." },
      { name: "Knossos Tablets", story: "Excavated by Arthur Evans starting 1900, they were the original Linear B corpus and gave the script its name." }
    ],
    sources: [
      "Chadwick, J. (1958). The Decipherment of Linear B. Cambridge UP.",
      "Ventris, M. & Chadwick, J. (1953). 'Evidence for Greek Dialect in the Mycenaean Archives'. JHS 73.",
      "Unicode Standard, Linear B Syllabary block U+10000-U+1007F."
    ],
  },
  {
    id: 'gl-mayan',
    name: "Maya Hieroglyphs",
    year: -300,
    endYear: 1700,
    lane: "mixed",
    sub: "Mesoamerica",
    scriptType: "mixed",
    importance: 4,
    fuzzy: true,
    origin: "The Maya script combined logograms representing whole words with syllabic signs that could write words phonetically. Texts were carved on stelae, painted on ceramics, and written in folded bark-paper codices. The system encoded the Mayan languages, especially Classic Ch'olan, and was sophisticated enough for poetry, history, and astronomy.",
    decipherment: {
      status: "deciphered",
      year: 1952,
      decipherer: "Yuri Knorozov (foundational), with later work by Tatiana Proskouriakoff, David Stuart, Linda Schele",
      story: "Diego de Landa's 16th-century 'alphabet' had been dismissed for centuries. Soviet linguist Yuri Knorozov re-examined it in 1952 and recognised that Landa's signs were syllabic, not alphabetic. Tatiana Proskouriakoff then showed that inscriptions recorded historical events of named rulers, not just astronomy. Successive workshops led by Linda Schele opened the field, and the script is now substantially readable.",
    },
    sampleCharacters: [
      { form: "[T0001 ahau]", transliteration: "ajaw", meaning: "lord / ruler" },
      { form: "[T0506 kaban]", transliteration: "kab", meaning: "earth" },
      { form: "[T0544 kin]", transliteration: "k'in", meaning: "sun / day" },
      { form: "[T0561 chan]", transliteration: "chan / kaan", meaning: "sky / serpent" }
    ],
    notableInscriptions: [
      { name: "Dresden Codex", story: "One of four surviving pre-Columbian Maya codices; contains astronomical tables including a Venus almanac." },
      { name: "Palenque Temple of the Inscriptions", story: "Pakal the Great's tomb stele records dynastic history central to decipherment progress." }
    ],
    sources: [
      "Coe, M.D. (2012). Breaking the Maya Code, 3rd ed. Thames & Hudson.",
      "Stuart, D. (2005). The Inscriptions from Temple XIX at Palenque. Pre-Columbian Art Research Institute.",
      "Foundation for the Advancement of Mesoamerican Studies (famsi.org) - public scholarly archive."
    ],
  },
  {
    id: 'gl-phoenician',
    name: "Phoenician",
    year: -1050,
    endYear: -100,
    lane: "abjad",
    sub: "Levant",
    scriptType: "abjad",
    importance: 4,
    fuzzy: true,
    origin: "The Phoenician script is a 22-letter consonantal alphabet (abjad) descended from Proto-Sinaitic. Phoenician traders carried it across the Mediterranean, where it was adapted into Greek (which added vowel letters), Aramaic, and ultimately Hebrew, Arabic, Latin, and most modern alphabets.",
    decipherment: {
      status: "deciphered",
      year: 1758,
      decipherer: "Jean-Jacques Barthelemy",
      story: "Barthelemy used bilingual coins and inscriptions, particularly the trilingual Maltese Cippi of Melqart with Greek text, to identify Phoenician letterforms in 1758. Because the script is the parent of the Greek alphabet, comparison was relatively direct.",
    },
    sampleCharacters: [
      { form: "𐤀", transliteration: "alf", meaning: "ox - letter aleph" },
      { form: "𐤁", transliteration: "bet", meaning: "house - letter beth" },
      { form: "𐤌", transliteration: "lamd", meaning: "ox-goad - letter lamed" },
      { form: "𐤑", transliteration: "qof", meaning: "letter qoph" }
    ],
    notableInscriptions: [
      { name: "Ahiram Sarcophagus", story: "Royal sarcophagus from Byblos, c. 1000 BCE, with one of the earliest substantial Phoenician inscriptions." },
      { name: "Cippi of Melqart", story: "Bilingual Phoenician-Greek dedications from Malta that Barthelemy used as a key to decipher the script." }
    ],
    sources: [
      "Naveh, J. (1987). Early History of the Alphabet. Magnes Press.",
      "Healey, J.F. (1990). The Early Alphabet. British Museum Press.",
      "Unicode Standard, Phoenician block U+10900-U+1091F."
    ],
  },
  {
    id: 'gl-old-persian-cuneiform',
    name: "Old Persian Cuneiform",
    year: -525,
    endYear: -330,
    lane: "syllabic",
    sub: "Persia",
    scriptType: "syllabic",
    importance: 2,
    fuzzy: true,
    origin: "Old Persian cuneiform was a semi-syllabic script developed under the Achaemenid Empire, possibly as a deliberate royal innovation. It used wedge forms inspired by Mesopotamian cuneiform but was simpler, with around 36 signs, used almost exclusively for royal monumental inscriptions in the Old Persian language.",
    decipherment: {
      status: "deciphered",
      year: 1846,
      decipherer: "Georg Friedrich Grotefend (initial), Henry Rawlinson (full)",
      story: "Grotefend made an inspired guess in 1802 that royal Achaemenid inscriptions would follow the formula 'X, great king, son of Y, great king'. He correctly identified Darius and Xerxes. Henry Rawlinson scaled the cliff at Behistun to copy Darius I's trilingual inscription and produced a full decipherment by the 1840s.",
    },
    sampleCharacters: [
      { form: "𐎠", transliteration: "a", meaning: "syllable a" },
      { form: "𐎨", transliteration: "da", meaning: "syllable da" },
      { form: "𐎷", transliteration: "xa", meaning: "syllable xa" },
      { form: "𐏃", transliteration: "ra", meaning: "syllable ra" }
    ],
    notableInscriptions: [
      { name: "Behistun Inscription", story: "Trilingual Old Persian, Elamite, and Akkadian inscription carved into a cliff face by Darius I; the Rosetta Stone of cuneiform." },
      { name: "Persepolis foundation tablets", story: "Royal building inscriptions from the Achaemenid capital declaring titles, conquests, and divine favour." }
    ],
    sources: [
      "Kent, R.G. (1953). Old Persian: Grammar, Texts, Lexicon. American Oriental Society.",
      "Schmitt, R. (1991). The Bisitun Inscriptions of Darius the Great. Corpus Inscriptionum Iranicarum.",
      "Unicode Standard, Old Persian block U+103A0-U+103DF."
    ],
  },
  {
    id: 'gl-brahmi',
    name: "Brahmi",
    year: -300,
    endYear: 400,
    lane: "abugida",
    sub: "South Asia",
    scriptType: "abugida",
    importance: 4,
    fuzzy: true,
    origin: "Brahmi is the ancestor of nearly every Indic script and many scripts of Southeast Asia. It is an abugida: each consonant carries an inherent vowel, with diacritics modifying the vowel. Brahmi appears most famously on the rock and pillar edicts of the Mauryan emperor Ashoka.",
    decipherment: {
      status: "deciphered",
      year: 1837,
      decipherer: "James Prinsep",
      story: "Multiple eighteenth and nineteenth century scholars chipped away at Brahmi without full success. James Prinsep, secretary of the Asiatic Society of Bengal, completed the decipherment in 1837 by working with bilingual Indo-Greek coins and short inscriptions that paired Brahmi with the already-known Kharosthi or Greek scripts.",
    },
    sampleCharacters: [
      { form: "𑀅", transliteration: "a", meaning: "vowel a" },
      { form: "𑀕", transliteration: "ka", meaning: "consonant k with inherent a" },
      { form: "𑀪", transliteration: "pa", meaning: "consonant p with inherent a" },
      { form: "𑀰", transliteration: "ra", meaning: "consonant r with inherent a" }
    ],
    notableInscriptions: [
      { name: "Edicts of Ashoka", story: "Rock and pillar inscriptions from the 3rd century BCE recording the Mauryan emperor's moral proclamations across the Indian subcontinent." },
      { name: "Heliodorus Pillar", story: "A pillar erected c. 110 BCE near Vidisha by a Greek ambassador, dedicated to the god Vasudeva, written in Brahmi." }
    ],
    sources: [
      "Salomon, R. (1998). Indian Epigraphy. Oxford UP.",
      "Falk, H. (1993). Schrift im alten Indien. Gunter Narr Verlag.",
      "Unicode Standard, Brahmi block U+11000-U+1107F."
    ],
  },
  {
    id: 'gl-etruscan',
    name: "Etruscan",
    year: -700,
    endYear: 50,
    lane: "alphabet",
    sub: "Italy",
    scriptType: "alphabet",
    importance: 3,
    fuzzy: true,
    origin: "The Etruscans of central Italy adapted a western Greek alphabet, probably via the Euboean colony at Cumae, to write their non-Indo-European language. Their alphabet in turn influenced the Old Italic scripts that produced the Latin alphabet. Texts are mostly short funerary or votive inscriptions.",
    decipherment: {
      status: "partial",
      year: undefined,
      decipherer: undefined,
      story: "The script is fully readable - we know how to pronounce it - but the underlying Etruscan language has no close known relative, so vocabulary is reconstructed slowly from context. Around 13,000 inscriptions exist, but most are formulaic. The Pyrgi Tablets, a Phoenician-Etruscan bilingual, were a critical aid.",
    },
    sampleCharacters: [
      { form: "𐌀", transliteration: "a", meaning: "letter a" },
      { form: "𐌁", transliteration: "c (k)", meaning: "letter c, voiceless velar" },
      { form: "𐌆", transliteration: "z", meaning: "letter z" },
      { form: "𐌏", transliteration: "p", meaning: "letter p" }
    ],
    notableInscriptions: [
      { name: "Pyrgi Tablets", story: "Three gold leaves from c. 500 BCE bearing parallel Etruscan and Phoenician dedications to a goddess; key bilingual reference." },
      { name: "Liber Linteus", story: "The longest surviving Etruscan text, written on linen reused as Egyptian mummy wrappings; appears to be a ritual calendar." }
    ],
    sources: [
      "Bonfante, G. & Bonfante, L. (2002). The Etruscan Language: An Introduction. Manchester UP.",
      "Wallace, R.E. (2008). Zikh Rasna: A Manual of the Etruscan Language and Inscriptions. Beech Stave Press.",
      "Unicode Standard, Old Italic block U+10300-U+1032F."
    ],
  },
  {
    id: 'gl-elder-futhark',
    name: "Elder Futhark",
    year: 150,
    endYear: 800,
    lane: "alphabet",
    sub: "Northern Europe",
    scriptType: "alphabet",
    importance: 2,
    fuzzy: true,
    origin: "The Elder Futhark is the oldest form of the runic alphabets, used by speakers of Proto-Germanic and early Germanic languages. Its 24 angular runes were designed for carving on wood, bone, stone, and metal, with letterforms that avoid horizontal strokes that would split along wood grain. It evolved into the Younger Futhark and Anglo-Saxon Futhorc.",
    decipherment: {
      status: "deciphered",
      year: 1865,
      decipherer: "Sophus Bugge, Ludvig Wimmer",
      story: "Runic inscriptions were never fully lost; later Younger Futhark traditions provided a chain of transmission. Nineteenth century Scandinavian philologists, especially Sophus Bugge and Ludvig Wimmer, systematised readings and reconstructed the older Elder Futhark from inscriptions like the Kylver Stone.",
    },
    sampleCharacters: [
      { form: "ᚠ", transliteration: "f", meaning: "fehu - cattle, wealth" },
      { form: "ᚢ", transliteration: "u", meaning: "uruz - aurochs" },
      { form: "ᚦ", transliteration: "th", meaning: "thurisaz - thorn / giant" },
      { form: "ᚱ", transliteration: "r", meaning: "raido - riding, journey" }
    ],
    notableInscriptions: [
      { name: "Kylver Stone", story: "A Gotland slab from c. 400 CE listing the full 24-rune Elder Futhark in order; the canonical reference for the alphabet." },
      { name: "Einang Stone", story: "One of the oldest legible runestones, c. 350 CE, Norway, naming a runemaster." }
    ],
    sources: [
      "Page, R.I. (1999). An Introduction to English Runes, 2nd ed. Boydell.",
      "Looijenga, T. (2003). Texts and Contexts of the Oldest Runic Inscriptions. Brill.",
      "Unicode Standard, Runic block U+16A0-U+16FF."
    ],
  },
  {
    id: 'gl-ogham',
    name: "Ogham",
    year: 350,
    endYear: 900,
    lane: "alphabet",
    sub: "Ireland and Britain",
    scriptType: "alphabet",
    importance: 2,
    fuzzy: true,
    origin: "Ogham is an early medieval alphabet used principally for Primitive Irish, carved as notches and strokes along the edge of a stone or stick. The script reads bottom-to-top along the stem line. Most surviving Ogham inscriptions are short, marking grave stones or boundary markers with personal names and lineage.",
    decipherment: {
      status: "deciphered",
      year: undefined,
      decipherer: "Charles Vallancey, Charles Graves, Edward Lhuyd (cumulative)",
      story: "Ogham was never fully forgotten; medieval Irish manuscripts such as In Lebor Ogaim preserved letter names and values. Early modern antiquarians including Edward Lhuyd compared manuscript tradition with stone inscriptions, and nineteenth century scholars like Bishop Charles Graves of Limerick formalised readings.",
    },
    sampleCharacters: [
      { form: "ᚁ", transliteration: "b", meaning: "beith - birch" },
      { form: "ᚂ", transliteration: "l", meaning: "luis - flame / rowan" },
      { form: "ᚅ", transliteration: "n", meaning: "nin - fork" },
      { form: "ᚉ", transliteration: "d", meaning: "dair - oak" }
    ],
    notableInscriptions: [
      { name: "Ballys-pellan Brooch", story: "An 8th-9th century silver brooch with multiple personal names inscribed in Ogham." },
      { name: "Newton Stone", story: "A pillar in Aberdeenshire bearing both Ogham and an unidentified script, still debated by epigraphers." }
    ],
    sources: [
      "McManus, D. (1991). A Guide to Ogam. An Sagart.",
      "Forsyth, K. (1996). The Ogham Inscriptions of Scotland. Harvard PhD thesis (open access).",
      "Unicode Standard, Ogham block U+1680-U+169F."
    ],
  },
  {
    id: 'gl-indus',
    name: "Indus Script",
    year: -2600,
    endYear: -1900,
    lane: "logographic",
    sub: "South Asia",
    scriptType: "logographic",
    importance: 4,
    fuzzy: true,
    origin: "The Indus or Harappan script appears on seals, tablets, pottery, and metal objects from cities of the Indus Valley Civilisation such as Mohenjo-daro and Harappa. Inscriptions are short, averaging around five signs, with around 400 to 600 distinct signs catalogued. The underlying language is unknown.",
    decipherment: {
      status: "undeciphered",
      year: undefined,
      decipherer: undefined,
      story: "Without a bilingual text, without confident knowledge of the underlying language, and with very short inscriptions, the Indus script remains undeciphered. Statistical and computational analyses (Rao et al. 2009; Yadav et al. 2010) suggest structured linguistic patterning, but proposed readings remain speculative and contested.",
    },
    sampleCharacters: [
      { form: "[fish sign]", transliteration: "?", meaning: "Possibly 'fish' or homophonic for 'star'; unconfirmed." },
      { form: "[U-shape]", transliteration: "?", meaning: "Common terminal sign on seals; function unclear." },
      { form: "[jar with handle]", transliteration: "?", meaning: "Frequent sign, possibly grammatical." },
      { form: "[man with arms raised]", transliteration: "?", meaning: "Anthropomorphic sign found on tablets." }
    ],
    notableInscriptions: [
      { name: "Mohenjo-daro seals", story: "Soapstone seals depicting animals (bull, unicorn-like creature, elephant) with short inscriptions above; the bulk of the corpus." },
      { name: "Dholavira signboard", story: "A 3-metre-long inscription of ten large signs from the Dholavira gate, possibly the largest Indus inscription known." }
    ],
    sources: [
      "Parpola, A. (1994). Deciphering the Indus Script. Cambridge UP.",
      "Possehl, G.L. (2002). The Indus Civilization: A Contemporary Perspective. AltaMira.",
      "Rao, R.P.N. et al. (2009). 'Entropic Evidence for Linguistic Structure in the Indus Script'. Science 324.",
      "No Unicode block exists; signs cited via Mahadevan (1977) concordance numbers."
    ],
  },
  {
    id: 'gl-hangul',
    name: "Hangul",
    year: 1443,
    endYear: 2025,
    lane: "alphabet",
    sub: "Korea",
    scriptType: "alphabet",
    importance: 4,
    origin: "Hangul is the Korean alphabet, promulgated in 1446 in the document Hunminjeongeum ('The Correct Sounds for the Instruction of the People') by King Sejong the Great and the scholars of the Hall of Worthies. Its consonant shapes are based on the position of the speech organs, and its vowels on yin-yang cosmological elements. Letters combine into syllabic blocks.",
    decipherment: {
      status: "deciphered",
      year: 1446,
      decipherer: "Sejong the Great",
      story: "Hangul is unusual in being a featurally designed script with a documented inventor and a published rationale. The Hunminjeongeum Haerye, a 1446 commentary discovered in 1940, explains every letter shape and feature. There was no decipherment problem: the script came with its own user manual.",
    },
    sampleCharacters: [
      { form: "ㄱ", transliteration: "g/k", meaning: "consonant giyeok - based on tongue at soft palate" },
      { form: "ㄴ", transliteration: "n", meaning: "consonant nieun - based on tongue tip at upper teeth" },
      { form: "ㅁ", transliteration: "m", meaning: "consonant mieum - based on closed lips" },
      { form: "한", transliteration: "han", meaning: "syllable block 'han' (great / Korean)" }
    ],
    notableInscriptions: [
      { name: "Hunminjeongeum Haerye", story: "The 1446 royal exposition of Hangul. Rediscovered in 1940, it confirmed the featural design philosophy and is now a UNESCO Memory of the World inscription." },
      { name: "Yongbieocheonga (Songs of the Dragons Flying to Heaven)", story: "A 1447 epic of 125 cantos and the first major literary work composed in Hangul." }
    ],
    sources: [
      "Lee, K.-M. & Ramsey, S.R. (2011). A History of the Korean Language. Cambridge UP.",
      "King, R. (1996). 'Korean Writing'. In The World's Writing Systems, ed. Daniels & Bright. Oxford UP.",
      "Unicode Standard, Hangul Syllables U+AC00-U+D7A3, Hangul Jamo U+1100-U+11FF."
    ],
  },
  {
    id: 'gl-linear-a',
    name: "Linear A",
    year: -1800,
    endYear: -1450,
    lane: "syllabic",
    sub: "Aegean",
    scriptType: "syllabic",
    importance: 4,
    fuzzy: true,
    origin: "Linear A is the script of Minoan Crete, predecessor to Linear B. It shares many sign shapes with Linear B but writes a different, unidentified language often called Minoan or Eteocretan. Texts are mostly short administrative documents on clay tablets and fragments.",
    decipherment: {
      status: "undeciphered",
      year: undefined,
      decipherer: undefined,
      story: "Because Linear B reused many Linear A signs, scholars can guess phonetic values for many Linear A signs by analogy. But the underlying language is not Greek, and no convincing language family match has been demonstrated, so the script remains effectively undeciphered for meaning even though it is partly readable for sound.",
    },
    sampleCharacters: [
      { form: "[AB01 'da']", transliteration: "da?", meaning: "Phonetic value borrowed from Linear B; meaning unknown." },
      { form: "[AB08 'a']", transliteration: "a?", meaning: "Likely vocalic, on Linear B analogy." },
      { form: "[AB28 'i']", transliteration: "i?", meaning: "Likely vocalic, on Linear B analogy." },
      { form: "[A301 libation formula sign]", transliteration: "?", meaning: "Recurs on stone libation tables, function only inferred." }
    ],
    notableInscriptions: [
      { name: "Hagia Triada tablets", story: "Around 150 administrative tablets, the largest Linear A find, recording commodities and personnel." },
      { name: "Minoan libation tables", story: "Stone offering tables from peak sanctuaries with a recurring formulaic Linear A inscription whose meaning is still inferred." }
    ],
    sources: [
      "Schoep, I. (2002). The Administration of Neopalatial Crete. Bibliotheca Cretologica.",
      "Younger, J.G. (ongoing). Linear A Texts in Phonetic Transcription. Open scholarly resource (people.ku.edu/~jyounger/LinearA/).",
      "No Unicode block; sign references follow GORILA and the Younger A/B numbering."
    ],
  },
  {
    id: 'gl-akkadian-cuneiform',
    name: "Akkadian Cuneiform",
    year: -2500,
    endYear: 100,
    lane: "mixed",
    sub: "Mesopotamia",
    scriptType: "mixed",
    importance: 2,
    fuzzy: true,
    origin: "Akkadian scribes adapted Sumerian cuneiform to write a Semitic language, using signs both for syllables and inherited logograms. The result was a highly flexible scribal system used for royal inscriptions, legal documents, letters, scholarly lists, and literature across Babylonia and Assyria.",
    decipherment: {
      status: "deciphered",
      year: 1857,
      decipherer: "Henry Rawlinson, Edward Hincks, Jules Oppert, William Henry Fox Talbot",
      story: "Akkadian became readable after Old Persian cuneiform and the Behistun Inscription established dependable sign values. Comparative work across royal inscriptions, lexical lists, and tablet archives then clarified the syllabic and logographic readings.",
    },
    sampleCharacters: [
      { form: "𒀀", transliteration: "a", meaning: "vowel syllable" },
      { form: "𒈗", transliteration: "šarru", meaning: "king" },
      { form: "𒆠", transliteration: "ki", meaning: "place determinative" }
    ],
    notableInscriptions: [
      { name: "Amarna Letters", story: "Clay tablets preserving diplomatic correspondence between Egypt and Near Eastern courts in the fourteenth century BCE." }
    ],
    sources: [
      "Huehnergard, J. (2011). A Grammar of Akkadian. Eisenbrauns.",
      "Cuneiform Digital Library Initiative (cdli.ucla.edu).",
      "Unicode Standard, Cuneiform block U+12000-U+123FF."
    ],
  },
  {
    id: 'gl-ugaritic',
    name: "Ugaritic",
    year: -1400,
    endYear: -1180,
    lane: "abjad",
    sub: "Levant",
    scriptType: "abjad",
    importance: 2,
    fuzzy: true,
    origin: "Ugaritic is a cuneiform alphabet from the city of Ugarit on the Syrian coast. It writes consonants with wedge-shaped signs arranged in an alphabetic order, showing how alphabetic writing could be expressed through the same clay-tablet technology used by older cuneiform traditions.",
    decipherment: {
      status: "deciphered",
      year: 1930,
      decipherer: "Hans Bauer, Edouard Dhorme, Charles Virolleaud",
      story: "The script was read quickly after tablets were excavated at Ras Shamra. Short alphabetic sign lists, repeated divine and royal names, and comparison with Northwest Semitic languages gave scholars a secure route into the texts.",
    },
    sampleCharacters: [
      { form: "𐎀", transliteration: "a", meaning: "glottal consonant with a-class vowel" },
      { form: "𐎁", transliteration: "b", meaning: "b" },
      { form: "𐎎", transliteration: "m", meaning: "m" }
    ],
    notableInscriptions: [
      { name: "Baal Cycle", story: "A group of mythological poems from Ugarit that preserves early Northwest Semitic poetic style." }
    ],
    sources: [
      "Pardee, D. (1997). Ugaritic. In The Semitic Languages. Routledge.",
      "University of Chicago Oriental Institute, Ras Shamra tablet records.",
      "Unicode Standard, Ugaritic block U+10380-U+1039F."
    ],
  },
  {
    id: 'gl-south-arabian',
    name: "Ancient South Arabian",
    year: -900,
    endYear: 600,
    lane: "abjad",
    sub: "Arabia",
    scriptType: "abjad",
    importance: 2,
    fuzzy: true,
    origin: "Ancient South Arabian scripts were used in Sabaean, Minaic, Qatabanic, and Hadramitic inscriptions across Yemen and neighbouring regions. Their angular consonant letters were carved on stone, bronze, and wooden sticks, recording dedications, laws, trade, and royal building works.",
    decipherment: {
      status: "deciphered",
      year: 1841,
      decipherer: "Wilhelm Gesenius and Emil Roediger",
      story: "European scholars compared copied inscriptions with Semitic language patterns and related Ethiopic letter traditions. Readings improved as more inscriptions were documented from Yemen and the wider Arabian Peninsula.",
    },
    sampleCharacters: [
      { form: "𐩠", transliteration: "h", meaning: "h" },
      { form: "𐩣", transliteration: "m", meaning: "m" },
      { form: "𐩱", transliteration: "ʾ", meaning: "glottal stop" }
    ],
    notableInscriptions: [
      { name: "Sirwah inscriptions", story: "Sabaean monumental texts from a major sanctuary and political centre." }
    ],
    sources: [
      "Robin, C.J. (1991). Les inscriptions de l Arabie antique.",
      "Nebes, N. (2010). Epigraphic South Arabian. In The Semitic Languages.",
      "Unicode Standard, Old South Arabian block U+10A60-U+10A7F."
    ],
  },
  {
    id: 'gl-geez',
    name: "Geʽez",
    year: -500,
    endYear: 2025,
    lane: "abugida",
    sub: "Horn of Africa",
    scriptType: "abugida",
    importance: 2,
    fuzzy: true,
    origin: "Geʽez writing developed from South Arabian models and became the classical script of Aksum and Ethiopian Christian literature. Its letters later took vowel-marked forms, creating the Ethiopic abugida still used for Amharic, Tigrinya, and related languages.",
    decipherment: {
      status: "deciphered",
      year: undefined,
      decipherer: "Continuous learned tradition",
      story: "The script was never lost. Reading practices continued through Ethiopian and Eritrean manuscript, liturgical, and educational traditions, while modern scholarship compared inscriptions and manuscripts to describe earlier stages.",
    },
    sampleCharacters: [
      { form: "ሀ", transliteration: "ha", meaning: "ha" },
      { form: "ለ", transliteration: "la", meaning: "la" },
      { form: "መ", transliteration: "ma", meaning: "ma" }
    ],
    notableInscriptions: [
      { name: "Ezana inscriptions", story: "Royal Aksumite inscriptions in Greek, Sabaean, and Geʽez documenting political and religious change." }
    ],
    sources: [
      "Daniels, P.T. (1997). Ethiopic Writing. In The Semitic Languages. Routledge.",
      "Ullendorff, E. (1955). The Semitic Languages of Ethiopia. Taylor.",
      "Unicode Standard, Ethiopic block U+1200-U+137F."
    ],
  },
  {
    id: 'gl-aramaic',
    name: "Imperial Aramaic",
    year: -800,
    endYear: -300,
    lane: "abjad",
    sub: "Near East",
    scriptType: "abjad",
    importance: 2,
    fuzzy: true,
    origin: "Imperial Aramaic was the administrative script of the Achaemenid Empire, written from Egypt to Central Asia on papyrus, leather, ostraca, and stone. Its letter forms became ancestors of several later scripts, including Hebrew, Syriac, Nabataean, and many Central Asian writing systems.",
    decipherment: {
      status: "deciphered",
      year: undefined,
      decipherer: "Continuous Semitic manuscript and inscription traditions",
      story: "Aramaic was transmitted through Jewish, Christian, and Near Eastern manuscript communities. Monumental and documentary inscriptions linked the ancient administrative hand to better-known later scripts.",
    },
    sampleCharacters: [
      { form: "𐡀", transliteration: "ʾ", meaning: "aleph" },
      { form: "𐡁", transliteration: "b", meaning: "beth" },
      { form: "𐡌", transliteration: "m", meaning: "mem" }
    ],
    notableInscriptions: [
      { name: "Elephantine papyri", story: "Aramaic documents from a Jewish community in Persian-period Egypt." }
    ],
    sources: [
      "Naveh, J. (1982). Early History of the Alphabet. Magnes Press.",
      "Porten, B. (1968). Archives from Elephantine. University of California Press.",
      "Unicode Standard, Imperial Aramaic block U+10840-U+1085F."
    ],
  },
  {
    id: 'gl-hebrew',
    name: "Hebrew Square Script",
    year: -300,
    endYear: 2025,
    lane: "abjad",
    sub: "Levant",
    scriptType: "abjad",
    importance: 2,
    fuzzy: true,
    origin: "The Hebrew square script descends from Aramaic letter forms adopted in the Second Temple period. It became the standard script for Hebrew and Aramaic Jewish texts, balancing formal book hands, scribal rules, and later printed type traditions.",
    decipherment: {
      status: "deciphered",
      year: undefined,
      decipherer: "Continuous Jewish textual tradition",
      story: "Hebrew writing was never lost. Biblical, rabbinic, liturgical, and everyday manuscripts sustained reading traditions while palaeographers traced earlier inscriptions and regional hands.",
    },
    sampleCharacters: [
      { form: "א", transliteration: "ʾ", meaning: "aleph" },
      { form: "ב", transliteration: "b/v", meaning: "beth" },
      { form: "מ", transliteration: "m", meaning: "mem" }
    ],
    notableInscriptions: [
      { name: "Dead Sea Scrolls", story: "Manuscripts from the Judean Desert showing Hebrew and Aramaic hands from the late Second Temple period." }
    ],
    sources: [
      "Tov, E. (2012). Textual Criticism of the Hebrew Bible. Fortress.",
      "Naveh, J. (1982). Early History of the Alphabet. Magnes Press.",
      "Unicode Standard, Hebrew block U+0590-U+05FF."
    ],
  },
  {
    id: 'gl-nabataean',
    name: "Nabataean",
    year: -200,
    endYear: 400,
    lane: "abjad",
    sub: "Arabia and Levant",
    scriptType: "abjad",
    importance: 2,
    fuzzy: true,
    origin: "Nabataean script was used by the Nabataean kingdom for Aramaic inscriptions on tombs, coins, and monuments. Its increasingly cursive letter joins are important for understanding the development of Arabic script.",
    decipherment: {
      status: "deciphered",
      year: 1840,
      decipherer: "Semitic epigraphers including Wilhelm Gesenius",
      story: "Scholars read Nabataean through its Aramaic language and its relation to better-known Northwest Semitic scripts. Dated inscriptions from Petra and surrounding regions clarified the changing letter shapes.",
    },
    sampleCharacters: [
      { form: "𐢁", transliteration: "b", meaning: "beth" },
      { form: "𐢊", transliteration: "k", meaning: "kaph" },
      { form: "𐢓", transliteration: "r", meaning: "resh" }
    ],
    notableInscriptions: [
      { name: "Petra tomb inscriptions", story: "Short formal texts naming owners and legal protections for rock-cut tombs." }
    ],
    sources: [
      "Healey, J.F. (1993). The Nabataean Tomb Inscriptions of Mada in Salih. Oxford UP.",
      "Naveh, J. (1982). Early History of the Alphabet. Magnes Press.",
      "Unicode Standard, Nabataean block U+10880-U+108AF."
    ],
  },
  {
    id: 'gl-arabic',
    name: "Arabic",
    year: 400,
    endYear: 2025,
    lane: "abjad",
    sub: "Arabia and wider Islamic world",
    scriptType: "abjad",
    importance: 2,
    fuzzy: true,
    origin: "Arabic script developed from late Nabataean forms and became a major manuscript, administrative, and artistic writing system after the rise of Islam. It records consonants, marks long vowels, and can add short-vowel signs when precision is needed.",
    decipherment: {
      status: "deciphered",
      year: undefined,
      decipherer: "Continuous Arabic textual tradition",
      story: "Arabic writing has a continuous reading tradition through inscriptions, Qurʾanic manuscripts, documents, and education. Early inscriptions help document the transition from Nabataean-style forms to recognisably Arabic hands.",
    },
    sampleCharacters: [
      { form: "ا", transliteration: "ʾ / ā", meaning: "alif" },
      { form: "ب", transliteration: "b", meaning: "ba" },
      { form: "م", transliteration: "m", meaning: "mim" }
    ],
    notableInscriptions: [
      { name: "Jabal Ramm inscription", story: "An early Arabic inscription showing transitional letter forms." }
    ],
    sources: [
      "Gruendler, B. (1993). The Development of the Arabic Scripts. Scholars Press.",
      "Hoyland, R. (2001). Arabia and the Arabs. Routledge.",
      "Unicode Standard, Arabic block U+0600-U+06FF."
    ],
  },
  {
    id: 'gl-syriac',
    name: "Syriac",
    year: 100,
    endYear: 2025,
    lane: "abjad",
    sub: "Mesopotamia and Levant",
    scriptType: "abjad",
    importance: 2,
    fuzzy: true,
    origin: "Syriac is an Aramaic script used for Christian literature, translation, theology, science, and correspondence. Estrangela, Serto, and East Syriac styles show how a shared script can develop distinct regional manuscript identities.",
    decipherment: {
      status: "deciphered",
      year: undefined,
      decipherer: "Continuous Syriac textual tradition",
      story: "Syriac was preserved through church, school, and manuscript communities. Earlier inscriptions and dated manuscripts allow scholars to reconstruct the development of its main hands.",
    },
    sampleCharacters: [
      { form: "ܐ", transliteration: "ʾ", meaning: "alaph" },
      { form: "ܒ", transliteration: "b", meaning: "beth" },
      { form: "ܡ", transliteration: "m", meaning: "mim" }
    ],
    notableInscriptions: [
      { name: "Sinai Syriac manuscripts", story: "Manuscripts from St Catherine’s Monastery preserving early Christian texts and translations." }
    ],
    sources: [
      "Brock, S.P. (1997). A Brief Outline of Syriac Literature. Moran Etho.",
      "Healey, J.F. (1990). The Early Alphabet. British Museum Press.",
      "Unicode Standard, Syriac block U+0700-U+074F."
    ],
  },
  {
    id: 'gl-greek',
    name: "Greek Alphabet",
    year: -800,
    endYear: 2025,
    lane: "alphabet",
    sub: "Aegean and Mediterranean",
    scriptType: "alphabet",
    importance: 4,
    fuzzy: true,
    origin: "The Greek alphabet adapted a Phoenician consonantal script by assigning some letters to vowel sounds. This change suited Greek phonology and shaped later Etruscan, Latin, Coptic, Cyrillic, and scientific notation traditions.",
    decipherment: {
      status: "deciphered",
      year: undefined,
      decipherer: "Continuous Greek textual tradition",
      story: "Greek writing has a continuous tradition from archaic inscriptions through manuscripts and print. Regional archaic alphabets were interpreted by comparison with classical Greek and dated archaeological contexts.",
    },
    sampleCharacters: [
      { form: "Α", transliteration: "a", meaning: "alpha" },
      { form: "Β", transliteration: "b", meaning: "beta" },
      { form: "Ω", transliteration: "ō", meaning: "omega" }
    ],
    notableInscriptions: [
      { name: "Dipylon inscription", story: "One of the earliest Greek alphabetic inscriptions, written on a wine jug from Athens." }
    ],
    sources: [
      "Jeffery, L.H. (1990). The Local Scripts of Archaic Greece. Oxford UP.",
      "Threatte, L. (1980). The Grammar of Attic Inscriptions. De Gruyter.",
      "Unicode Standard, Greek and Coptic block U+0370-U+03FF."
    ],
  },
  {
    id: 'gl-latin',
    name: "Latin Alphabet",
    year: -700,
    endYear: 2025,
    lane: "alphabet",
    sub: "Italy and wider world",
    scriptType: "alphabet",
    importance: 4,
    fuzzy: true,
    origin: "The Latin alphabet developed in central Italy from Etruscan and Greek models. Roman administration, manuscript copying, printing, and modern standards made it the most widely used alphabetic script today.",
    decipherment: {
      status: "deciphered",
      year: undefined,
      decipherer: "Continuous Latin textual tradition",
      story: "Latin inscriptions, manuscripts, and printed texts preserve an unbroken reading tradition. Palaeography focuses less on decipherment than on dating and classifying changing hands.",
    },
    sampleCharacters: [
      { form: "A", transliteration: "a", meaning: "a" },
      { form: "M", transliteration: "m", meaning: "m" },
      { form: "Q", transliteration: "q", meaning: "q" }
    ],
    notableInscriptions: [
      { name: "Duenos inscription", story: "An early Latin text on a ceramic vessel, important for archaic letter forms and language." }
    ],
    sources: [
      "Clackson, J. and Horrocks, G. (2007). The Blackwell History of the Latin Language.",
      "Bischoff, B. (1990). Latin Palaeography. Cambridge UP.",
      "Unicode Standard, Basic Latin block U+0000-U+007F."
    ],
  },
  {
    id: 'gl-coptic',
    name: "Coptic",
    year: 200,
    endYear: 2025,
    lane: "alphabet",
    sub: "Egypt",
    scriptType: "alphabet",
    importance: 2,
    fuzzy: true,
    origin: "Coptic uses Greek letters plus signs derived from Demotic to write the final stage of the Egyptian language. It is central to Egyptian Christian manuscripts and also helped scholars understand the language behind hieroglyphic inscriptions.",
    decipherment: {
      status: "deciphered",
      year: undefined,
      decipherer: "Continuous Coptic church and manuscript tradition",
      story: "Coptic remained known in liturgical and scholarly contexts. Its vocabulary and grammar were essential for interpreting older Egyptian scripts during nineteenth-century decipherment work.",
    },
    sampleCharacters: [
      { form: "Ⲁ", transliteration: "a", meaning: "alpha" },
      { form: "Ⲙ", transliteration: "m", meaning: "mi" },
      { form: "Ϣ", transliteration: "š", meaning: "shai" }
    ],
    notableInscriptions: [
      { name: "Nag Hammadi codices", story: "Fourth-century Coptic books preserving diverse early Christian writings." }
    ],
    sources: [
      "Layton, B. (2004). A Coptic Grammar. Harrassowitz.",
      "Crum, W.E. (1939). A Coptic Dictionary. Oxford UP.",
      "Unicode Standard, Coptic block U+2C80-U+2CFF."
    ],
  },
  {
    id: 'gl-gothic',
    name: "Gothic Alphabet",
    year: 350,
    endYear: 700,
    lane: "alphabet",
    sub: "Black Sea and Europe",
    scriptType: "alphabet",
    importance: 2,
    fuzzy: true,
    origin: "The Gothic alphabet was created for the Gothic language, traditionally linked with Bishop Wulfila and the translation of biblical texts. Its signs draw on Greek, Latin, and runic models while serving a Germanic language.",
    decipherment: {
      status: "deciphered",
      year: undefined,
      decipherer: "Manuscript tradition through the Codex Argenteus",
      story: "Gothic survived in a small manuscript corpus rather than as a lost script. Comparison with Greek source texts and other Germanic languages allows close reading of the surviving translations.",
    },
    sampleCharacters: [
      { form: "𐌰", transliteration: "a", meaning: "a" },
      { form: "𐌱", transliteration: "b", meaning: "b" },
      { form: "𐌼", transliteration: "m", meaning: "m" }
    ],
    notableInscriptions: [
      { name: "Codex Argenteus", story: "A purple parchment manuscript with silver and gold ink preserving much of the Gothic Bible." }
    ],
    sources: [
      "Streitberg, W. (1910). Die gotische Bibel. Winter.",
      "Bennett, W.H. (1980). An Introduction to the Gothic Language. MLA.",
      "Unicode Standard, Gothic block U+10330-U+1034F."
    ],
  },
  {
    id: 'gl-armenian',
    name: "Armenian",
    year: 405,
    endYear: 2025,
    lane: "alphabet",
    sub: "Armenian Highlands",
    scriptType: "alphabet",
    importance: 2,
    origin: "The Armenian alphabet was created by Mesrop Mashtots in the early fifth century to support translation, education, and Christian literary culture. Its distinctive letter shapes formed a durable book tradition across manuscripts and print.",
    decipherment: {
      status: "deciphered",
      year: undefined,
      decipherer: "Continuous Armenian textual tradition",
      story: "Armenian reading traditions continued through schools, churches, manuscripts, and printing. Early inscriptions and dated manuscripts support palaeographic study of changing letter forms.",
    },
    sampleCharacters: [
      { form: "Ա", transliteration: "a", meaning: "ayb" },
      { form: "Մ", transliteration: "m", meaning: "men" },
      { form: "Ք", transliteration: "kʿ", meaning: "ke" }
    ],
    notableInscriptions: [
      { name: "Etchmiadzin Gospel", story: "A richly illuminated Armenian manuscript important for art history and book culture." }
    ],
    sources: [
      "Stone, M.E. (1996). Armenian Writing. In The World’s Writing Systems. Oxford UP.",
      "Nersessian, V. (2001). Treasures from the Ark. British Library.",
      "Unicode Standard, Armenian block U+0530-U+058F."
    ],
  },
  {
    id: 'gl-georgian',
    name: "Georgian",
    year: 430,
    endYear: 2025,
    lane: "alphabet",
    sub: "Caucasus",
    scriptType: "alphabet",
    importance: 2,
    fuzzy: true,
    origin: "Georgian writing appears in several historical forms, including Asomtavruli, Nuskhuri, and Mkhedruli. The scripts record Georgian language, church texts, royal inscriptions, and a long manuscript tradition with strong regional identity.",
    decipherment: {
      status: "deciphered",
      year: undefined,
      decipherer: "Continuous Georgian textual tradition",
      story: "Georgian script was transmitted through religious, literary, and civic use. Scholars compare dated inscriptions and manuscripts to understand the sequence of its three major styles.",
    },
    sampleCharacters: [
      { form: "Ⴀ", transliteration: "a", meaning: "asomtavruli an" },
      { form: "ⴄ", transliteration: "e", meaning: "nuskhuri en" },
      { form: "მ", transliteration: "m", meaning: "mkhedruli man" }
    ],
    notableInscriptions: [
      { name: "Bolnisi inscriptions", story: "Fifth-century Georgian inscriptions among the earliest securely dated examples of the script." }
    ],
    sources: [
      "Rapp, S.H. (2016). The Sasanian World through Georgian Eyes. Routledge.",
      "Daniels, P.T. and Bright, W. (1996). The World’s Writing Systems. Oxford UP.",
      "Unicode Standard, Georgian block U+10A0-U+10FF."
    ],
  },
  {
    id: 'gl-glagolitic',
    name: "Glagolitic",
    year: 860,
    endYear: 1800,
    lane: "alphabet",
    sub: "Slavic Europe",
    scriptType: "alphabet",
    importance: 2,
    fuzzy: true,
    origin: "Glagolitic is the earliest Slavic literary script, associated with the mission of Constantine-Cyril and Methodius. Its complex letter shapes were designed to write Old Church Slavonic and supported translation, liturgy, and regional manuscript culture.",
    decipherment: {
      status: "deciphered",
      year: undefined,
      decipherer: "Slavic manuscript tradition",
      story: "Glagolitic was never wholly lost, especially in Croatian liturgical use. Comparison with Cyrillic Old Church Slavonic manuscripts established sound values and historical relationships.",
    },
    sampleCharacters: [
      { form: "Ⰰ", transliteration: "a", meaning: "az" },
      { form: "Ⰱ", transliteration: "b", meaning: "buky" },
      { form: "Ⰿ", transliteration: "m", meaning: "myslite" }
    ],
    notableInscriptions: [
      { name: "Kiev Missal", story: "A small Glagolitic manuscript preserving early Slavic liturgical language." }
    ],
    sources: [
      "Schenker, A.M. (1995). The Dawn of Slavic. Yale UP.",
      "Lunt, H.G. (2001). Old Church Slavonic Grammar. De Gruyter.",
      "Unicode Standard, Glagolitic block U+2C00-U+2C5F."
    ],
  },
  {
    id: 'gl-cyrillic',
    name: "Cyrillic",
    year: 900,
    endYear: 2025,
    lane: "alphabet",
    sub: "Eastern Europe and Eurasia",
    scriptType: "alphabet",
    importance: 2,
    fuzzy: true,
    origin: "Cyrillic developed in the Bulgarian literary sphere from Greek uncial forms, with additional letters for Slavic sounds. It became a major script family used across Slavic and non-Slavic languages.",
    decipherment: {
      status: "deciphered",
      year: undefined,
      decipherer: "Continuous Orthodox, civic, and printed traditions",
      story: "Cyrillic reading continued through manuscript, church, state, and print use. Historical study tracks reforms, local variants, and the expansion of the script to new languages.",
    },
    sampleCharacters: [
      { form: "А", transliteration: "a", meaning: "a" },
      { form: "Б", transliteration: "b", meaning: "be" },
      { form: "Ж", transliteration: "ž", meaning: "zhe" }
    ],
    notableInscriptions: [
      { name: "Ostromir Gospel", story: "An eleventh-century East Slavic manuscript important for early Cyrillic book culture." }
    ],
    sources: [
      "Schenker, A.M. (1995). The Dawn of Slavic. Yale UP.",
      "Franklin, S. (2002). Writing, Society and Culture in Early Rus. Cambridge UP.",
      "Unicode Standard, Cyrillic block U+0400-U+04FF."
    ],
  },
  {
    id: 'gl-tifinagh',
    name: "Tifinagh",
    year: -3000,
    endYear: 2025,
    lane: "alphabet",
    sub: "North Africa",
    scriptType: "alphabet",
    importance: 3,
    fuzzy: true,
    origin: "Tifinagh refers to Berber scripts linked to ancient Libyco-Berber inscriptions and modern Amazigh writing. Contemporary standardised forms show how historical letter traditions can be adapted for education, signage, and digital typography.",
    decipherment: {
      status: "partial",
      year: undefined,
      decipherer: "Libyco-Berber partly read; modern Tifinagh standardised",
      story: "Modern Tifinagh is readable through living Amazigh use and standardisation. Ancient Libyco-Berber inscriptions are only partly understood because many texts are short and the historical language context is uneven.",
    },
    sampleCharacters: [
      { form: "ⴰ", transliteration: "a", meaning: "ya" },
      { form: "ⵎ", transliteration: "m", meaning: "yam" },
      { form: "ⵣ", transliteration: "z", meaning: "yaz" }
    ],
    notableInscriptions: [
      { name: "Dougga bilingual", story: "A Punic and Libyco-Berber inscription that helps anchor some ancient sign values." }
    ],
    sources: [
      "Kossmann, M. (2013). The Arabic Influence on Northern Berber. Brill.",
      "Camps, G. (1996). Berber Scripts. In The World’s Writing Systems. Oxford UP.",
      "Unicode Standard, Tifinagh block U+2D30-U+2D7F."
    ],
  },
  {
    id: 'gl-libyco-berber',
    name: "Libyco-Berber",
    year: -500,
    endYear: 700,
    lane: "alphabet",
    sub: "North Africa",
    scriptType: "alphabet",
    importance: 3,
    fuzzy: true,
    origin: "Libyco-Berber inscriptions occur across North Africa, often carved on stone as short names, titles, or memorial formulae. The script is historically important for Amazigh writing traditions, but many texts remain difficult because of sparse context.",
    decipherment: {
      status: "partial",
      year: undefined,
      decipherer: "Comparative epigraphy and bilingual inscriptions",
      story: "Some signs are read through bilingual inscriptions and links with later Tifinagh, but full interpretation is limited by short texts, regional variants, and uncertain historical language forms.",
    },
    sampleCharacters: [
      { form: "ⵣ", transliteration: "z", meaning: "later Tifinagh comparison" },
      { form: "ⵎ", transliteration: "m", meaning: "later Tifinagh comparison" }
    ],
    notableInscriptions: [
      { name: "Thugga inscriptions", story: "Bilingual and local inscriptions from ancient Dougga in Tunisia." }
    ],
    sources: [
      "Camps, G. (1996). Berber Scripts. In The World’s Writing Systems. Oxford UP.",
      "Pichler, W. (2007). Origin and Development of the Libyco-Berber Script.",
      "Unicode Standard, Tifinagh block U+2D30-U+2D7F for related modern forms."
    ],
  },
  {
    id: 'gl-iberian',
    name: "Iberian Scripts",
    year: -500,
    endYear: -50,
    lane: "mixed",
    sub: "Iberian Peninsula",
    scriptType: "mixed",
    importance: 3,
    fuzzy: true,
    origin: "The Iberian scripts were used for the Iberian language in eastern and southern Spain. Northeastern Iberian combines syllabic signs for stops with alphabetic signs for other consonants and vowels, a structure sometimes called semi-syllabic.",
    decipherment: {
      status: "partial",
      year: 1922,
      decipherer: "Manuel Gomez-Moreno",
      story: "The sign values of the northeastern script are largely known through coin legends and bilingual contexts, but the Iberian language itself remains only partly understood, so many texts can be sounded out without full translation.",
    },
    sampleCharacters: [
      { form: "𐌁", transliteration: "ka", meaning: "adapted sign form" },
      { form: "𐌉", transliteration: "i", meaning: "vowel sign" }
    ],
    notableInscriptions: [
      { name: "Lead plaques from Ullastret", story: "Written lead sheets preserving longer Iberian texts with economic or legal contexts." }
    ],
    sources: [
      "Velaza, J. (1996). Epigrafia y lengua ibericas. Arco Libros.",
      "Ferrer i Jane, J. (2005). Novetats sobre el sistema dual de diferenciacio grafica.",
      "Unicode Standard, Old Italic block U+10300-U+1032F for related encoded signs, with Iberian proposals documented separately."
    ],
  },
  {
    id: 'gl-tartessian',
    name: "Southwestern Palaeohispanic",
    year: -700,
    endYear: -400,
    lane: "mixed",
    sub: "Iberian Peninsula",
    scriptType: "mixed",
    importance: 3,
    fuzzy: true,
    origin: "Southwestern Palaeohispanic, often associated with Tartessian contexts, appears on stelae in southwest Iberia. It shares features with other Palaeohispanic scripts but remains harder to interpret because the underlying language and sign system are debated.",
    decipherment: {
      status: "partial",
      year: undefined,
      decipherer: "Comparative Palaeohispanic epigraphy",
      story: "Many signs have proposed values through comparison with Iberian and Phoenician-derived systems, but the language and exact reading order remain contested.",
    },
    sampleCharacters: [
      { form: "[SW sign forms]", transliteration: "various", meaning: "not fully encoded" }
    ],
    notableInscriptions: [
      { name: "Southwestern stelae", story: "Stone inscriptions from Portugal and southwest Spain, often with long curved lines of signs." }
    ],
    sources: [
      "Correa, J.A. (1996). La epigrafia tartesia.",
      "Koch, J.T. (2013). Tartessian. Celtic from the South-west at the Dawn of History.",
      "Untermann, J. (1997). Monumenta Linguarum Hispanicarum IV. Reichert."
    ],
  },
  {
    id: 'gl-cypriot-syllabary',
    name: "Cypriot Syllabary",
    year: -1100,
    endYear: -200,
    lane: "syllabic",
    sub: "Cyprus",
    scriptType: "syllabic",
    importance: 2,
    fuzzy: true,
    origin: "The Cypriot syllabary wrote Greek and the local Eteocypriot language on Cyprus. It descended from earlier Aegean writing traditions and remained in use long after alphabetic Greek was established elsewhere.",
    decipherment: {
      status: "deciphered",
      year: 1870,
      decipherer: "George Smith, Samuel Birch, Moritz Schmidt",
      story: "Bilingual inscriptions with Greek alphabetic text allowed scholars to match syllabic signs to Greek names and words. The script is readable, though Eteocypriot texts remain difficult because the language is not well understood.",
    },
    sampleCharacters: [
      { form: "𐠀", transliteration: "a", meaning: "a" },
      { form: "𐠈", transliteration: "ka", meaning: "ka" },
      { form: "𐠋", transliteration: "la", meaning: "la" }
    ],
    notableInscriptions: [
      { name: "Idalion tablet", story: "A bronze legal text in Cypriot syllabary recording a dispute and civic obligations." }
    ],
    sources: [
      "Masson, O. (1983). Les inscriptions chypriotes syllabiques. Boccard.",
      "Steele, P.M. (2013). A Linguistic History of Ancient Cyprus. Cambridge UP.",
      "Unicode Standard, Cypriot Syllabary block U+10800-U+1083F."
    ],
  },
  {
    id: 'gl-old-turkic',
    name: "Old Turkic",
    year: 700,
    endYear: 1000,
    lane: "alphabet",
    sub: "Inner Asia",
    scriptType: "alphabet",
    importance: 2,
    fuzzy: true,
    origin: "Old Turkic runiform script was used by Turkic khaganates across Mongolia and Siberia. Its angular signs were carved on stone monuments and wooden objects, recording political history, lineage, and memorial statements.",
    decipherment: {
      status: "deciphered",
      year: 1893,
      decipherer: "Vilhelm Thomsen",
      story: "The Orkhon inscriptions were read by identifying repeated royal names and comparing the language with known Turkic forms. Thomsen announced the decipherment in 1893, with Vasily Radlov publishing major readings soon after.",
    },
    sampleCharacters: [
      { form: "𐰀", transliteration: "a/e", meaning: "vowel" },
      { form: "𐰋", transliteration: "b", meaning: "b" },
      { form: "𐰢", transliteration: "m", meaning: "m" }
    ],
    notableInscriptions: [
      { name: "Orkhon inscriptions", story: "Eighth-century monuments for Kul Tigin and Bilge Qaghan in Mongolia." }
    ],
    sources: [
      "Tekin, T. (1968). A Grammar of Orkhon Turkic. Indiana University.",
      "Thomsen, V. (1896). Inscriptions de l Orkhon dechiffrees.",
      "Unicode Standard, Old Turkic block U+10C00-U+10C4F."
    ],
  },
  {
    id: 'gl-old-hungarian',
    name: "Old Hungarian",
    year: 900,
    endYear: 1550,
    lane: "alphabet",
    sub: "Carpathian Basin",
    scriptType: "alphabet",
    importance: 2,
    fuzzy: true,
    origin: "Old Hungarian, also called Hungarian runic script, was used for Hungarian in inscriptions, calendars, and later antiquarian manuscripts. Its right-to-left letter forms reflect a regional writing tradition distinct from Latin-script administration.",
    decipherment: {
      status: "deciphered",
      year: undefined,
      decipherer: "Hungarian manuscript and inscriptional tradition",
      story: "The script survived in early modern descriptions and regional inscriptions, so scholarship focuses on dating, authenticity, and local variation rather than complete decipherment.",
    },
    sampleCharacters: [
      { form: "𐲀", transliteration: "a", meaning: "a" },
      { form: "𐲋", transliteration: "k", meaning: "k" },
      { form: "𐲘", transliteration: "m", meaning: "m" }
    ],
    notableInscriptions: [
      { name: "Nikolsburg alphabet", story: "A fifteenth-century list preserving Old Hungarian letter names and order." }
    ],
    sources: [
      "Rona-Tas, A. (1999). Hungarians and Europe in the Early Middle Ages. CEU Press.",
      "Szakacs, G. (1994). The Old Hungarian Script.",
      "Unicode Standard, Old Hungarian block U+10C80-U+10CFF."
    ],
  },
  {
    id: 'gl-phags-pa',
    name: "Phags-pa",
    year: 1269,
    endYear: 1400,
    lane: "abugida",
    sub: "Mongol Empire",
    scriptType: "abugida",
    importance: 2,
    origin: "Phags-pa script was commissioned by Kublai Khan as a universal imperial script for Mongolian, Chinese, Tibetan, and other languages. It adapts Tibetan principles into vertical writing and reflects the administrative ambitions of the Yuan dynasty.",
    decipherment: {
      status: "deciphered",
      year: undefined,
      decipherer: "Multilingual inscriptions and manuscript comparison",
      story: "The script remained identifiable through imperial documents, seals, and bilingual inscriptions. Its values are understood by comparison with Tibetan models and the languages it records.",
    },
    sampleCharacters: [
      { form: "ꡀ", transliteration: "ka", meaning: "ka" },
      { form: "ꡏ", transliteration: "ma", meaning: "ma" },
      { form: "ꡜ", transliteration: "a", meaning: "vowel sign" }
    ],
    notableInscriptions: [
      { name: "Yuan dynasty seals", story: "Official seals and documents using Phags-pa as a prestige administrative script." }
    ],
    sources: [
      "Poppe, N. (1957). The Mongolian Monuments in hPʽags-pa Script. Harrassowitz.",
      "Daniels, P.T. and Bright, W. (1996). The World’s Writing Systems. Oxford UP.",
      "Unicode Standard, Phags-pa block U+A840-U+A87F."
    ],
  },
  {
    id: 'gl-mongolian',
    name: "Traditional Mongolian",
    year: 1200,
    endYear: 2025,
    lane: "alphabet",
    sub: "Mongolia and Inner Asia",
    scriptType: "alphabet",
    importance: 2,
    fuzzy: true,
    origin: "Traditional Mongolian script descends from the Uyghur alphabet and is written vertically in columns. It records Mongolian with positional letter forms and has also influenced scripts for Manchu and other Inner Asian languages.",
    decipherment: {
      status: "deciphered",
      year: undefined,
      decipherer: "Continuous Mongolian manuscript and print tradition",
      story: "The script has a continuous documentary tradition through chronicles, administration, literature, and education. Historical analysis traces its adaptation from Uyghur and its later standardisation.",
    },
    sampleCharacters: [
      { form: "ᠠ", transliteration: "a", meaning: "a" },
      { form: "ᠮ", transliteration: "m", meaning: "ma" },
      { form: "ᠬ", transliteration: "q/k", meaning: "qa/ka" }
    ],
    notableInscriptions: [
      { name: "Secret History manuscript tradition", story: "Later copies preserve the foundational Mongolian historical narrative, though in Chinese transcription rather than the earliest Mongolian script form." }
    ],
    sources: [
      "Poppe, N. (1954). Grammar of Written Mongolian. Harrassowitz.",
      "Kara, G. (1996). Mongolian Writing. In The World’s Writing Systems. Oxford UP.",
      "Unicode Standard, Mongolian block U+1800-U+18AF."
    ],
  },
  {
    id: 'gl-manchu',
    name: "Manchu",
    year: 1599,
    endYear: 2025,
    lane: "alphabet",
    sub: "Northeast Asia",
    scriptType: "alphabet",
    importance: 2,
    origin: "Manchu script adapts Mongolian vertical writing with additional marks to distinguish sounds more clearly. It was an official script of the Qing dynasty, used in archives, edicts, dictionaries, and multilingual inscriptions.",
    decipherment: {
      status: "deciphered",
      year: undefined,
      decipherer: "Qing documentary tradition",
      story: "Manchu reading continued through official Qing education and later scholarship. Large archives and bilingual Chinese-Manchu material make the script and language well documented.",
    },
    sampleCharacters: [
      { form: "ᠮ", transliteration: "ma", meaning: "ma" },
      { form: "ᠨ", transliteration: "na", meaning: "na" },
      { form: "ᡥ", transliteration: "ha", meaning: "ha" }
    ],
    notableInscriptions: [
      { name: "Qing imperial edicts", story: "Bilingual and multilingual documents preserving Manchu administrative usage." }
    ],
    sources: [
      "Norman, J. (1978). A Concise Manchu-English Lexicon. University of Washington.",
      "Elliott, M.C. (2001). The Manchu Way. Stanford UP.",
      "Unicode Standard, Mongolian block U+1800-U+18AF."
    ],
  },
  {
    id: 'gl-tibetan',
    name: "Tibetan",
    year: 650,
    endYear: 2025,
    lane: "abugida",
    sub: "Tibet and Himalayas",
    scriptType: "abugida",
    importance: 2,
    fuzzy: true,
    origin: "Tibetan script was developed for imperial administration and Buddhist translation, drawing on Indic models. Its written forms preserve older pronunciations and support a wide range of manuscript, print, and calligraphic traditions.",
    decipherment: {
      status: "deciphered",
      year: undefined,
      decipherer: "Continuous Tibetan textual tradition",
      story: "Tibetan writing has been transmitted through monastic, literary, and civic use. Dated inscriptions and manuscripts from Dunhuang help document early forms.",
    },
    sampleCharacters: [
      { form: "ཀ", transliteration: "ka", meaning: "ka" },
      { form: "མ", transliteration: "ma", meaning: "ma" },
      { form: "ཨ", transliteration: "a", meaning: "a" }
    ],
    notableInscriptions: [
      { name: "Dunhuang Tibetan manuscripts", story: "A large cache of early manuscripts preserving administrative, religious, and literary texts." }
    ],
    sources: [
      "van Schaik, S. (2011). Tibet: A History. Yale UP.",
      "Uray, G. (1955). The Old Tibetan Sources of the History of Central Asia.",
      "Unicode Standard, Tibetan block U+0F00-U+0FFF."
    ],
  },
  {
    id: 'gl-devanagari',
    name: "Devanagari",
    year: 1000,
    endYear: 2025,
    lane: "abugida",
    sub: "South Asia",
    scriptType: "abugida",
    importance: 2,
    fuzzy: true,
    origin: "Devanagari developed from Nagari scripts of northern India and writes Sanskrit, Hindi, Marathi, Nepali, and other languages. Its headline, vowel marks, and consonant clusters make it a central example of the Brahmic abugida family.",
    decipherment: {
      status: "deciphered",
      year: undefined,
      decipherer: "Continuous South Asian manuscript and print tradition",
      story: "Devanagari has a continuous textual tradition. Palaeographic work connects it to earlier Brahmi-derived forms through dated inscriptions and manuscripts.",
    },
    sampleCharacters: [
      { form: "अ", transliteration: "a", meaning: "independent vowel" },
      { form: "क", transliteration: "ka", meaning: "ka" },
      { form: "म", transliteration: "ma", meaning: "ma" }
    ],
    notableInscriptions: [
      { name: "Bakhshali manuscript", story: "A mathematical manuscript in a related northwestern script tradition, important for South Asian palaeography." }
    ],
    sources: [
      "Salomon, R. (1998). Indian Epigraphy. Oxford UP.",
      "Daniels, P.T. and Bright, W. (1996). The World’s Writing Systems. Oxford UP.",
      "Unicode Standard, Devanagari block U+0900-U+097F."
    ],
  },
  {
    id: 'gl-sinhala',
    name: "Sinhala",
    year: 700,
    endYear: 2025,
    lane: "abugida",
    sub: "Sri Lanka",
    scriptType: "abugida",
    importance: 2,
    fuzzy: true,
    origin: "Sinhala script descends from Brahmi through island manuscript traditions. Its rounded forms suited palm-leaf writing, and it records Sinhala with vowel signs, consonant letters, and special signs for sounds from Sanskrit and Pali.",
    decipherment: {
      status: "deciphered",
      year: undefined,
      decipherer: "Continuous Sri Lankan inscription and manuscript tradition",
      story: "Sinhala remained in active use, with inscriptions and manuscripts providing a long sequence for historical study. Early Brahmi inscriptions anchor its development.",
    },
    sampleCharacters: [
      { form: "අ", transliteration: "a", meaning: "independent vowel" },
      { form: "ක", transliteration: "ka", meaning: "ka" },
      { form: "ම", transliteration: "ma", meaning: "ma" }
    ],
    notableInscriptions: [
      { name: "Brahmi cave inscriptions of Sri Lanka", story: "Early donor inscriptions that show the roots of writing on the island." }
    ],
    sources: [
      "Paranavitana, S. (1970). Inscriptions of Ceylon. Department of Archaeology.",
      "Daniels, P.T. and Bright, W. (1996). The World’s Writing Systems. Oxford UP.",
      "Unicode Standard, Sinhala block U+0D80-U+0DFF."
    ],
  },
  {
    id: 'gl-thai',
    name: "Thai",
    year: 1283,
    endYear: 2025,
    lane: "abugida",
    sub: "Mainland Southeast Asia",
    scriptType: "abugida",
    importance: 2,
    fuzzy: true,
    origin: "Thai script was adapted from Old Khmer models to write the Thai language. It marks consonants, vowels, tones, and vowel length, creating a dense system shaped by both Indic script heritage and tonal language needs.",
    decipherment: {
      status: "deciphered",
      year: undefined,
      decipherer: "Continuous Thai inscription and manuscript tradition",
      story: "Thai writing has a continuous tradition from inscriptions through manuscripts, print, and education. The Ram Khamhaeng inscription is a key reference point, though its interpretation has been debated.",
    },
    sampleCharacters: [
      { form: "ก", transliteration: "k", meaning: "ko kai" },
      { form: "ม", transliteration: "m", meaning: "mo ma" },
      { form: "า", transliteration: "ā", meaning: "long vowel sign" }
    ],
    notableInscriptions: [
      { name: "Ram Khamhaeng inscription", story: "A famous Sukhothai-period inscription central to histories of Thai writing." }
    ],
    sources: [
      "Diller, A. (1996). Thai and Lao Writing. In The World’s Writing Systems. Oxford UP.",
      "Ishii, Y. (1986). Thailand: A Short History. Yale UP.",
      "Unicode Standard, Thai block U+0E00-U+0E7F."
    ],
  },
  {
    id: 'gl-khmer',
    name: "Khmer",
    year: 600,
    endYear: 2025,
    lane: "abugida",
    sub: "Cambodia",
    scriptType: "abugida",
    importance: 2,
    fuzzy: true,
    origin: "Khmer script descends from southern Brahmi-derived forms and is one of mainland Southeast Asia’s major writing systems. It records Khmer with consonant series, vowel signs, and stacked consonant forms, and influenced Thai and Lao scripts.",
    decipherment: {
      status: "deciphered",
      year: undefined,
      decipherer: "Continuous Khmer inscription and manuscript tradition",
      story: "Old Khmer inscriptions were read through continuity with later Khmer and comparison with Sanskrit portions. Monumental inscriptions from Angkor provide a substantial dated record.",
    },
    sampleCharacters: [
      { form: "ក", transliteration: "ka", meaning: "ka" },
      { form: "ម", transliteration: "mɔɔ", meaning: "ma" },
      { form: "អ", transliteration: "ʔɑɑ", meaning: "qa" }
    ],
    notableInscriptions: [
      { name: "Angkor inscriptions", story: "Stone inscriptions recording donations, administration, and royal projects across the Khmer Empire." }
    ],
    sources: [
      "Vickery, M. (1998). Society, Economics, and Politics in Pre-Angkor Cambodia.",
      "Jacob, J.M. (1996). Khmer Writing. In The World’s Writing Systems. Oxford UP.",
      "Unicode Standard, Khmer block U+1780-U+17FF."
    ],
  },
  {
    id: 'gl-baybayin',
    name: "Baybayin",
    year: 1300,
    endYear: 1800,
    lane: "abugida",
    sub: "Philippines",
    scriptType: "abugida",
    importance: 2,
    fuzzy: true,
    origin: "Baybayin is a Philippine Brahmic script used before and during early Spanish colonial contact. It writes consonant-vowel syllables and was used for letters, signatures, poetry, and religious texts adapted by missionaries.",
    decipherment: {
      status: "deciphered",
      year: undefined,
      decipherer: "Early colonial descriptions and living regional knowledge",
      story: "Spanish-period grammars and documents described the signs while some related scripts remained in use. Modern scholarship distinguishes Baybayin from other Philippine scripts such as Buhid, Hanunoo, and Tagbanwa.",
    },
    sampleCharacters: [
      { form: "ᜀ", transliteration: "a", meaning: "a" },
      { form: "ᜊ", transliteration: "ba", meaning: "ba" },
      { form: "ᜋ", transliteration: "ma", meaning: "ma" }
    ],
    notableInscriptions: [
      { name: "Doctrina Christiana", story: "A 1593 printed text containing Tagalog in both Latin letters and Baybayin." }
    ],
    sources: [
      "Morrow, P. (2002). Baybayin, the Ancient Script of the Philippines.",
      "Scott, W.H. (1994). Barangay. Ateneo de Manila UP.",
      "Unicode Standard, Tagalog block U+1700-U+171F."
    ],
  },
  {
    id: 'gl-cherokee',
    name: "Cherokee Syllabary",
    year: 1821,
    endYear: 2025,
    lane: "syllabic",
    sub: "North America",
    scriptType: "syllabic",
    importance: 4,
    origin: "The Cherokee syllabary was created by Sequoyah and rapidly adopted by Cherokee communities for letters, newspapers, education, and public life. Each sign represents a syllable rather than an individual consonant or vowel.",
    decipherment: {
      status: "deciphered",
      year: undefined,
      decipherer: "Continuous Cherokee community use",
      story: "The syllabary was intentionally designed and taught from the nineteenth century onward. Its history is documented through Cherokee-language print, manuscripts, and community education.",
    },
    sampleCharacters: [
      { form: "Ꭰ", transliteration: "a", meaning: "a" },
      { form: "Ꭶ", transliteration: "ga", meaning: "ga" },
      { form: "Ꮳ", transliteration: "tsa", meaning: "tsa" }
    ],
    notableInscriptions: [
      { name: "Cherokee Phoenix", story: "A bilingual newspaper first published in 1828 using the syllabary and English." }
    ],
    sources: [
      "Cushman, E. (2011). The Cherokee Syllabary. University of Oklahoma Press.",
      "Walker, W. and Sarbaugh, J. (1993). The Early History of the Cherokee Syllabary.",
      "Unicode Standard, Cherokee block U+13A0-U+13FF."
    ],
  },
  {
    id: 'gl-vai',
    name: "Vai",
    year: 1830,
    endYear: 2025,
    lane: "syllabic",
    sub: "West Africa",
    scriptType: "syllabic",
    importance: 2,
    fuzzy: true,
    origin: "The Vai syllabary was developed in present-day Liberia and Sierra Leone in the nineteenth century. It writes the Vai language with syllable signs and has been used for letters, records, religious texts, and education.",
    decipherment: {
      status: "deciphered",
      year: undefined,
      decipherer: "Continuous Vai community and scholarly documentation",
      story: "Vai writing was observed and documented soon after its creation, with community use continuing into modern literacy work. Its development is important for studying independently created scripts.",
    },
    sampleCharacters: [
      { form: "ꔀ", transliteration: "a", meaning: "a" },
      { form: "ꔉ", transliteration: "ka", meaning: "ka" },
      { form: "ꔋ", transliteration: "ma", meaning: "ma" }
    ],
    notableInscriptions: [
      { name: "Early Vai manuscripts", story: "Letters and notebooks showing everyday nineteenth-century use of the syllabary." }
    ],
    sources: [
      "Tuchscherer, K. (2005). History of Writing in Africa.",
      "Dalby, D. (1967). A Survey of the Indigenous Scripts of Liberia and Sierra Leone.",
      "Unicode Standard, Vai block U+A500-U+A63F."
    ],
  },
  {
    id: 'gl-bamum',
    name: "Bamum",
    year: 1896,
    endYear: 2025,
    lane: "syllabic",
    sub: "Cameroon",
    scriptType: "syllabic",
    importance: 2,
    fuzzy: true,
    origin: "Bamum script was created under King Njoya of the Bamum kingdom. It evolved through several stages from pictorial signs toward a syllabary, supporting history, administration, maps, medicine texts, and court records.",
    decipherment: {
      status: "deciphered",
      year: undefined,
      decipherer: "Bamum court records and community scholarship",
      story: "The script is known through manuscripts, royal archives, and later documentation. Its staged development is unusually well recorded for a modern African script creation.",
    },
    sampleCharacters: [
      { form: "ꚠ", transliteration: "a", meaning: "a" },
      { form: "ꚡ", transliteration: "ka", meaning: "ka" },
      { form: "ꚳ", transliteration: "ma", meaning: "ma" }
    ],
    notableInscriptions: [
      { name: "Bamum royal manuscripts", story: "Court documents preserving histories, law, and administrative records under King Njoya." }
    ],
    sources: [
      "Tuchscherer, K. and Hair, P.E.H. (2002). Cherchez l homme: A Bamum Writing System.",
      "Zeitlyn, D. (1994). Sua in Somié. Berghahn.",
      "Unicode Standard, Bamum block U+A6A0-U+A6FF."
    ],
  },
  {
    id: 'gl-nushu',
    name: "Nushu",
    year: 1800,
    endYear: 2000,
    lane: "syllabic",
    sub: "China",
    scriptType: "syllabic",
    importance: 2,
    fuzzy: true,
    origin: "Nushu was used by women in Jiangyong County, Hunan, for songs, letters, and sworn-sisterhood texts. Its slender signs write local speech syllabically and preserve a rare gendered manuscript culture.",
    decipherment: {
      status: "deciphered",
      year: undefined,
      decipherer: "Local transmission and twentieth-century documentation",
      story: "Nushu was documented while some users and readers were still alive. Scholars worked with manuscripts, embroidery, and oral testimony to record sign values and social context.",
    },
    sampleCharacters: [
      { form: "𛆁", transliteration: "a", meaning: "syllable sign" },
      { form: "𛅰", transliteration: "ma", meaning: "syllable sign" }
    ],
    notableInscriptions: [
      { name: "Third-day missives", story: "Cloth-bound texts sent to women after marriage, combining personal writing and song traditions." }
    ],
    sources: [
      "Liu, F. (2015). Gendered Words: Sentiments and Expression in Changing Rural China. Oxford UP.",
      "Chiang, W. (1995). We Two Know the Script; We Have Become Good Friends. University Press of America.",
      "Unicode Standard, Nushu block U+1B170-U+1B2FF."
    ],
  },
  {
    id: 'gl-tangut',
    name: "Tangut",
    year: 1036,
    endYear: 1500,
    lane: "logographic",
    sub: "Northwest China",
    scriptType: "logographic",
    importance: 2,
    origin: "Tangut script was created for the Western Xia state to write the Tangut language. Its thousands of complex square signs resemble Chinese in visual density but encode a distinct Tibeto-Burman language and a large Buddhist, legal, and administrative corpus.",
    decipherment: {
      status: "deciphered",
      year: 1909,
      decipherer: "Aleksei Ivanov, Nikolai Nevsky and later scholars",
      story: "Bilingual Chinese-Tangut texts, dictionaries, and Buddhist translations allowed scholars to establish readings. The language and script remain specialised, but the core system is readable.",
    },
    sampleCharacters: [
      { form: "𗀀", transliteration: "ngwu", meaning: "Tangut character" },
      { form: "𗼇", transliteration: "mi", meaning: "Tangut character" }
    ],
    notableInscriptions: [
      { name: "The Pearl in the Palm", story: "A Tangut-Chinese glossary that helped establish sign readings and meanings." }
    ],
    sources: [
      "Nevsky, N.A. (1960). Tangut Philology. Moscow.",
      "Sofronov, M.V. (1968). Grammatika tangutskogo yazyka.",
      "Unicode Standard, Tangut block U+17000-U+187FF."
    ],
  },
  {
    id: 'gl-khitan-large',
    name: "Khitan Large Script",
    year: 920,
    endYear: 1200,
    lane: "mixed",
    sub: "Northeast Asia",
    scriptType: "mixed",
    importance: 3,
    fuzzy: true,
    origin: "The Khitan large script was used by the Liao dynasty for the Khitan language. It includes logographic and phonetic elements, with many inscriptions carved on memorial tablets for elites.",
    decipherment: {
      status: "partial",
      year: undefined,
      decipherer: "Comparative study of Liao inscriptions",
      story: "Some signs and phrases are understood through bilingual context, titles, names, and comparison with the related Khitan small script, but the system is not fully read.",
    },
    sampleCharacters: [
      { form: "[large script sign]", transliteration: "unknown", meaning: "memorial-script sign" }
    ],
    notableInscriptions: [
      { name: "Liao funerary epitaphs", story: "Stone epitaphs that preserve names, offices, and formulae in Khitan scripts." }
    ],
    sources: [
      "Kane, D. (2009). The Kitan Language and Script. Brill.",
      "Wu, Y. and Janhunen, J. (2010). New Materials on the Khitan Small Script.",
      "Unicode encoding for Khitan Large Script is not complete in common fonts."
    ],
  },
  {
    id: 'gl-khitan-small',
    name: "Khitan Small Script",
    year: 925,
    endYear: 1200,
    lane: "mixed",
    sub: "Northeast Asia",
    scriptType: "mixed",
    importance: 3,
    fuzzy: true,
    origin: "Khitan small script was another Liao dynasty script for Khitan, using compact graphs that combine phonetic and semantic components. It appears especially in epitaphs and official contexts.",
    decipherment: {
      status: "partial",
      year: undefined,
      decipherer: "Daniel Kane and ongoing Khitan studies",
      story: "The small script is better analysed than the large script, but not fully deciphered. Names, titles, and repeated formulae provide anchors for reading.",
    },
    sampleCharacters: [
      { form: "[small script cluster]", transliteration: "partial", meaning: "phonetic cluster" }
    ],
    notableInscriptions: [
      { name: "Yelü Yanning epitaph", story: "A major Khitan small script inscription used in modern analysis of the script." }
    ],
    sources: [
      "Kane, D. (2009). The Kitan Language and Script. Brill.",
      "Janhunen, J. (2012). Khitan: Understanding the Language behind the Scripts.",
      "Unicode Standard, Khitan Small Script block U+18B00-U+18CFF."
    ],
  },
  {
    id: 'gl-jurchen',
    name: "Jurchen Script",
    year: 1120,
    endYear: 1500,
    lane: "mixed",
    sub: "Northeast Asia",
    scriptType: "mixed",
    importance: 3,
    fuzzy: true,
    origin: "Jurchen script was created for the Jin dynasty and adapted ideas from Khitan and Chinese writing. It recorded the Jurchen language before the later Manchu script became dominant among related peoples.",
    decipherment: {
      status: "partial",
      year: undefined,
      decipherer: "Comparative work with Chinese glossaries and inscriptions",
      story: "Chinese-Jurchen glossaries, inscriptions, and known titles allow partial reading. The limited corpus and complex sign system keep many passages uncertain.",
    },
    sampleCharacters: [
      { form: "[Jurchen sign]", transliteration: "partial", meaning: "official-script sign" }
    ],
    notableInscriptions: [
      { name: "Jurchen inscriptions from Jin monuments", story: "Texts recording royal and official statements in the Jin period." }
    ],
    sources: [
      "Kane, D. (1989). The Sino-Jurchen Vocabulary of the Bureau of Interpreters. Indiana University.",
      "Janhunen, J. (1996). Manchuria: An Ethnic History. Finno-Ugrian Society.",
      "Unicode Standard, Jurchen block proposal documentation; font support remains limited."
    ],
  },
  {
    id: 'gl-rongorongo',
    name: "Rongorongo",
    year: 1600,
    endYear: 1867,
    lane: "mixed",
    sub: "Rapa Nui",
    scriptType: "mixed",
    importance: 4,
    fuzzy: true,
    origin: "Rongorongo is a glyphic tradition from Rapa Nui preserved on wooden tablets and objects. Its direction alternates by line in reverse boustrophedon, but whether it records language directly remains unresolved.",
    decipherment: {
      status: "undeciphered",
      year: undefined,
      decipherer: undefined,
      story: "No agreed decipherment exists. The corpus is small, late copies are uneven, and there is no bilingual text. Proposed readings remain speculative and are treated cautiously in current scholarship.",
    },
    sampleCharacters: [
      { form: "[bird glyph]", transliteration: "unknown", meaning: "recurring sign" },
      { form: "[human figure]", transliteration: "unknown", meaning: "recurring sign" }
    ],
    notableInscriptions: [
      { name: "Santiago Staff", story: "A long wooden staff with rongorongo glyphs, one of the largest surviving texts." }
    ],
    sources: [
      "Fischer, S.R. (1997). Rongorongo: The Easter Island Script. Oxford UP.",
      "Pozdniakov, K. and Pozdniakov, I. (2007). Rapanui Writing and the Rapanui Language.",
      "CEIPP Rongorongo corpus documentation."
    ],
  },
  {
    id: 'gl-proto-elamite',
    name: "Proto-Elamite",
    year: -3100,
    endYear: -2900,
    lane: "mixed",
    sub: "Iran",
    scriptType: "mixed",
    importance: 4,
    fuzzy: true,
    origin: "Proto-Elamite appears on administrative tablets from Susa and other Iranian sites. It uses numerical signs and abstract marks for accounting, but its language and many sign values remain uncertain.",
    decipherment: {
      status: "undeciphered",
      year: undefined,
      decipherer: undefined,
      story: "Researchers can identify accounting structures and repeated sign groups, but the script lacks a bilingual key and the underlying language is uncertain. Digital imaging has improved sign catalogues without producing a full reading.",
    },
    sampleCharacters: [
      { form: "[M sign]", transliteration: "unknown", meaning: "administrative sign" },
      { form: "[numeric sign]", transliteration: "count", meaning: "quantity marker" }
    ],
    notableInscriptions: [
      { name: "Susa tablets", story: "Administrative tablets that form the core of the Proto-Elamite corpus." }
    ],
    sources: [
      "Dahl, J.L. (2019). Proto-Elamite. In The Oxford Handbook of Ancient Iran.",
      "CDLI Proto-Elamite corpus records.",
      "Englund, R.K. (1996). Proto-Elamite. In The World’s Writing Systems."
    ],
  },
  {
    id: 'gl-elamite-cuneiform',
    name: "Elamite Cuneiform",
    year: -2200,
    endYear: -330,
    lane: "syllabic",
    sub: "Iran",
    scriptType: "syllabic",
    importance: 2,
    fuzzy: true,
    origin: "Elamite cuneiform adapted Mesopotamian cuneiform for the Elamite language. It was used in royal inscriptions, administrative tablets, and Achaemenid trilingual texts alongside Old Persian and Akkadian.",
    decipherment: {
      status: "deciphered",
      year: 1850,
      decipherer: "Niels Ludvig Westergaard, Edwin Norris and later scholars",
      story: "The Behistun Inscription provided parallel Old Persian, Akkadian, and Elamite versions. Once Old Persian names and formulae were secure, scholars could map Elamite signs and grammar.",
    },
    sampleCharacters: [
      { form: "𒀀", transliteration: "a", meaning: "shared cuneiform sign" },
      { form: "𒁹", transliteration: "DIŠ", meaning: "personal-name marker" }
    ],
    notableInscriptions: [
      { name: "Behistun Elamite version", story: "The Elamite column of Darius I’s trilingual inscription." }
    ],
    sources: [
      "Reiner, E. (1969). The Elamite Language. Handbuch der Orientalistik.",
      "Stolper, M.W. (2004). Elamite. In The Cambridge Encyclopedia of the World’s Ancient Languages.",
      "Unicode Standard, Cuneiform block U+12000-U+123FF."
    ],
  },
  {
    id: 'gl-carian',
    name: "Carian",
    year: -700,
    endYear: -300,
    lane: "alphabet",
    sub: "Anatolia and Egypt",
    scriptType: "alphabet",
    importance: 2,
    fuzzy: true,
    origin: "Carian script wrote the Carian language of southwestern Anatolia and appears both in local inscriptions and in texts left by Carian mercenaries in Egypt. Its letters look deceptively Greek-like but often have different values.",
    decipherment: {
      status: "deciphered",
      year: 1981,
      decipherer: "John Ray, Ignacio Adiego and others",
      story: "The breakthrough came from Carian-Egyptian bilingual funerary inscriptions and personal names. These showed that visual similarity to Greek letters could mislead unless tested against language evidence.",
    },
    sampleCharacters: [
      { form: "𐊠", transliteration: "a", meaning: "a" },
      { form: "𐊼", transliteration: "m", meaning: "m" },
      { form: "𐊰", transliteration: "ś", meaning: "sibilant" }
    ],
    notableInscriptions: [
      { name: "Carian inscriptions at Saqqara", story: "Funerary and graffiti texts by Carian speakers in Egypt." }
    ],
    sources: [
      "Adiego, I.J. (2007). The Carian Language. Brill.",
      "Ray, J.D. (1981). An Approach to the Carian Script. Kadmos.",
      "Unicode Standard, Carian block U+102A0-U+102DF."
    ],
  },
  {
    id: 'gl-lycian',
    name: "Lycian",
    year: -500,
    endYear: -300,
    lane: "alphabet",
    sub: "Anatolia",
    scriptType: "alphabet",
    importance: 2,
    fuzzy: true,
    origin: "Lycian script adapted Greek alphabetic models to write the Lycian language of southwest Anatolia. It appears on tombs, coins, and public inscriptions, often in striking funerary landscapes.",
    decipherment: {
      status: "deciphered",
      year: undefined,
      decipherer: "Nineteenth-century Anatolian epigraphers",
      story: "Lycian was read through alphabetic comparison, bilingual texts, and names known from Greek sources. The script is readable, though the Anatolian language required separate linguistic reconstruction.",
    },
    sampleCharacters: [
      { form: "𐊀", transliteration: "a", meaning: "a" },
      { form: "𐊗", transliteration: "m", meaning: "m" },
      { form: "𐊆", transliteration: "i", meaning: "i" }
    ],
    notableInscriptions: [
      { name: "Xanthos stele", story: "A long Lycian inscription with Greek material nearby, central to the study of Lycian history and language." }
    ],
    sources: [
      "Melchert, H.C. (2004). Lycian. In The Cambridge Encyclopedia of the World’s Ancient Languages.",
      "Bryce, T. (1986). The Lycians. Museum Tusculanum.",
      "Unicode Standard, Lycian block U+10280-U+1029F."
    ],
  },
  {
    id: 'gl-lidian',
    name: "Lydian",
    year: -700,
    endYear: -300,
    lane: "alphabet",
    sub: "Anatolia",
    scriptType: "alphabet",
    importance: 2,
    fuzzy: true,
    origin: "Lydian script wrote the Lydian language of western Anatolia. It is alphabetic, usually written right to left, and is known from inscriptions on stone, coins, and small objects.",
    decipherment: {
      status: "deciphered",
      year: undefined,
      decipherer: "Twentieth-century Anatolian linguists",
      story: "The script values were established through alphabetic comparison and inscriptions with known names. The language is readable but still specialised because the corpus is limited.",
    },
    sampleCharacters: [
      { form: "𐤠", transliteration: "a", meaning: "a" },
      { form: "𐤪", transliteration: "r", meaning: "r" },
      { form: "𐤬", transliteration: "m", meaning: "m" }
    ],
    notableInscriptions: [
      { name: "Sardis inscriptions", story: "Texts from the Lydian capital preserving funerary and civic material." }
    ],
    sources: [
      "Gusmani, R. (1964). Lydisches Wörterbuch. Winter.",
      "Melchert, H.C. (2004). Lydian. In The Cambridge Encyclopedia of the World’s Ancient Languages.",
      "Unicode Standard, Lydian block U+10920-U+1093F."
    ],
  },
  {
    id: 'gl-meroitic',
    name: "Meroitic",
    year: -300,
    endYear: 500,
    lane: "mixed",
    sub: "Nile Valley",
    scriptType: "mixed",
    importance: 3,
    fuzzy: true,
    origin: "Meroitic was used in the Kingdom of Kush in two forms: hieroglyphic signs for monuments and cursive signs for everyday writing. The script values are known, but the Meroitic language is still only partly understood.",
    decipherment: {
      status: "partial",
      year: 1911,
      decipherer: "Francis Llewellyn Griffith",
      story: "Griffith identified sign values through Egyptian parallels, royal names, and repeated formulae. Reading the signs is possible, but interpreting the language remains limited by sparse bilingual evidence.",
    },
    sampleCharacters: [
      { form: "𐦠", transliteration: "a", meaning: "a" },
      { form: "𐦣", transliteration: "m", meaning: "m" },
      { form: "𐦥", transliteration: "s", meaning: "s" }
    ],
    notableInscriptions: [
      { name: "Royal pyramid inscriptions at Meroe", story: "Funerary and royal texts from Kushite monuments." }
    ],
    sources: [
      "Griffith, F.L. (1911). Meroitic Inscriptions. Egypt Exploration Fund.",
      "Rilly, C. (2012). Le meroitique et sa famille linguistique. Peeters.",
      "Unicode Standard, Meroitic Cursive block U+109A0-U+109FF."
    ],
  },
  {
    id: 'gl-old-uyghur',
    name: "Old Uyghur",
    year: 800,
    endYear: 1700,
    lane: "alphabet",
    sub: "Inner Asia",
    scriptType: "alphabet",
    importance: 2,
    fuzzy: true,
    origin: "Old Uyghur script adapted Sogdian forms into a vertical writing system for Turkic languages. It was used for Buddhist, Manichaean, Christian, commercial, and administrative texts across the Silk Roads.",
    decipherment: {
      status: "deciphered",
      year: undefined,
      decipherer: "Manuscript tradition and Turkic philology",
      story: "Old Uyghur manuscripts from Turfan and Dunhuang were read through Turkic linguistic knowledge and comparison with related scripts. The script later influenced Mongolian writing.",
    },
    sampleCharacters: [
      { form: "𐽰", transliteration: "a", meaning: "aleph-like sign" },
      { form: "𐽶", transliteration: "m", meaning: "mem-like sign" }
    ],
    notableInscriptions: [
      { name: "Turfan manuscripts", story: "Manuscripts from oasis sites preserving religious, legal, and commercial Uyghur texts." }
    ],
    sources: [
      "Hamilton, J.R. (1986). Manuscrits ouigours du IXe-Xe siecle de Touen-houang.",
      "Erdal, M. (2004). A Grammar of Old Turkic. Brill.",
      "Unicode Standard, Old Uyghur block U+10F70-U+10FAF."
    ],
  },
]
