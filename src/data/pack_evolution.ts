// Evolution pack — four billion years of life on one scale.
//
// Axis unit is million-years-ago (mya). In the config each item's `pos` is set
// to -mya so, exactly like History's BC years, earlier = left and today = 0 on
// the right. Lanes are the great branches of the tree of life; a few pivotal
// planetary events share an "Earth" lane because life's story is unreadable
// without them (oxygen, snowball, the five mass extinctions).
//
// Dates follow mainstream palaeontological / molecular-clock consensus. Where a
// first appearance is genuinely contested or a molecular estimate, `fuzzy` is
// set (drawn as a dashed ring) rather than pretending to a precision the
// science doesn't have.

export interface EvoItem {
  id: string
  title: string
  /** Million years ago (start / first appearance). */
  mya: number
  /** Optional span end, in million years ago (e.g. a clade that later died out). */
  end?: number
  lane: string
  /** Optional sub-lane (order/family/group) for the deep-zoom fan. */
  sub?: string
  importance: 1 | 2 | 3 | 4
  domain?: string
  fuzzy?: boolean
  note: string
}

export const EVO_LANES = [
  { id: 'earth', name: 'Earth & extinctions', color: '#E07A3E' },
  { id: 'microbes', name: 'Microbes', color: '#37A794' },
  { id: 'eukaryotes', name: 'Eukaryotes', color: '#59B0A0' },
  { id: 'plants', name: 'Plants', color: '#4FB477' },
  { id: 'fungi', name: 'Fungi', color: '#B58B4C' },
  { id: 'inverts', name: 'Invertebrates', color: '#C98A5B' },
  { id: 'fish', name: 'Fish', color: '#4C82C3' },
  { id: 'amphibians', name: 'Amphibians', color: '#6BAF5B' },
  { id: 'reptiles', name: 'Reptiles & dinosaurs', color: '#B5643C' },
  { id: 'birds', name: 'Birds', color: '#E8B84B' },
  { id: 'mammals', name: 'Mammals', color: '#C25B7A' },
  { id: 'hominins', name: 'Hominins', color: '#8E4EC6' },
]

export const PACK: EvoItem[] = [
  // ============================================================
  // EARTH & THE MASS EXTINCTIONS
  // ============================================================
  { id: 'ev-earth-forms', title: 'Earth forms', mya: 4540, lane: 'earth', importance: 1, note: 'The planet accretes from the solar nebula about 4.54 billion years ago.' },
  { id: 'ev-moon-impact', title: 'The Moon-forming impact', mya: 4510, lane: 'earth', importance: 3, fuzzy: true, note: 'A Mars-sized body, Theia, strikes Earth; the debris coalesces into the Moon.' },
  { id: 'ev-liquid-water', title: 'Liquid water oceans', mya: 4400, lane: 'earth', importance: 2, fuzzy: true, note: 'Zircon crystals suggest cool oceans existed within ~150 million years of Earth forming.' },
  { id: 'ev-late-bombardment', title: 'Late Heavy Bombardment', mya: 4000, lane: 'earth', importance: 3, fuzzy: true, note: 'A possible spike of asteroid impacts scarred the young Earth and Moon.' },
  { id: 'ev-goe', title: 'Great Oxidation Event', mya: 2400, lane: 'earth', importance: 1, note: 'Cyanobacteria flood the air with oxygen — lethal to most life then, the foundation of ours now.' },
  { id: 'ev-huronian', title: 'First Snowball Earth', mya: 2300, lane: 'earth', importance: 3, fuzzy: true, note: 'The Huronian glaciation, likely triggered by the new oxygen destroying methane, may have frozen the whole planet.' },
  { id: 'ev-cryogenian', title: 'Snowball Earth (Cryogenian)', mya: 700, lane: 'earth', importance: 2, note: 'Ice possibly reached the equator; complex life appears soon after it thaws.' },
  { id: 'ev-cambrian-start', title: 'Cambrian period begins', mya: 538.8, lane: 'earth', importance: 1, note: 'The base of the Phanerozoic — the eon of visible life. Almost everything below this line is microbes and soft blobs.' },
  { id: 'ev-ordovician-ext', title: 'End-Ordovician extinction', mya: 445, lane: 'earth', domain: 'extinction', importance: 2, note: 'The first of the "big five". Rapid glaciation wiped out ~85% of species, almost all marine.' },
  { id: 'ev-devonian-ext', title: 'Late Devonian extinction', mya: 372, lane: 'earth', domain: 'extinction', importance: 2, note: 'A drawn-out crisis that hit reef-builders and armoured fish especially hard.' },
  { id: 'ev-great-dying', title: 'The Great Dying (End-Permian)', mya: 252, lane: 'earth', domain: 'extinction', importance: 1, note: 'The worst extinction ever: ~96% of marine species gone, driven by Siberian volcanism. Life took millions of years to recover.' },
  { id: 'ev-triassic-ext', title: 'End-Triassic extinction', mya: 201, lane: 'earth', domain: 'extinction', importance: 2, note: 'Cleared the competition and let the dinosaurs inherit the land.' },
  { id: 'ev-kpg', title: 'The asteroid (K–Pg extinction)', mya: 66, lane: 'earth', domain: 'extinction', importance: 1, note: 'A city-sized asteroid strikes Chicxulub; the non-avian dinosaurs and ~75% of species vanish. Mammals inherit the world.' },
  { id: 'ev-ice-ages', title: 'The Ice Ages begin', mya: 2.58, lane: 'earth', importance: 2, note: 'The Pleistocene: repeating glacial cycles that shaped mammoths, and us.' },
  { id: 'ev-holocene', title: 'Holocene — the present warm age', mya: 0.0117, lane: 'earth', importance: 3, note: 'The stable interglacial in which all of farming and civilisation happened.' },

  // ============================================================
  // MICROBES — prokaryotes
  // ============================================================
  { id: 'ev-first-life', title: 'First life (LUCA)', mya: 3800, lane: 'microbes', importance: 1, fuzzy: true, note: 'The last universal common ancestor of everything alive. The earliest chemical traces of life reach back ~3.7–4.1 billion years.' },
  { id: 'ev-stromatolites', title: 'Stromatolites', mya: 3480, lane: 'microbes', sub: 'Bacteria', importance: 2, note: 'Layered mats built by microbial communities — among the oldest fossils on Earth, and still made today.' },
  { id: 'ev-archaea', title: 'Bacteria & Archaea split', mya: 3400, lane: 'microbes', importance: 3, fuzzy: true, note: 'Life\'s deepest fork. Archaea look like bacteria but are biochemically a world apart — and are our own distant ancestors.' },
  { id: 'ev-photosynthesis', title: 'Oxygenic photosynthesis', mya: 2800, lane: 'microbes', sub: 'Cyanobacteria', importance: 1, fuzzy: true, note: 'Cyanobacteria learn to split water using sunlight, releasing oxygen — the single most world-changing invention in life\'s history.' },
  { id: 'ev-methanogens', title: 'Methane-breathing microbes', mya: 3500, lane: 'microbes', sub: 'Archaea', importance: 4, fuzzy: true, note: 'Early archaea whose methane may have kept the faint young Sun\'s Earth warm.' },
  { id: 'ev-extremophiles', title: 'Deep-sea vent microbes', mya: 3700, lane: 'microbes', importance: 4, fuzzy: true, note: 'Some of the earliest ecosystems may have run on chemistry at hydrothermal vents, no sunlight required.' },

  // ============================================================
  // EUKARYOTES — the complex cell
  // ============================================================
  { id: 'ev-eukaryotes', title: 'First eukaryotes', mya: 1800, lane: 'eukaryotes', importance: 1, fuzzy: true, note: 'A cell with a nucleus and mitochondria — the latter a bacterium that was swallowed and never digested. The template for all plants, animals and fungi.' },
  { id: 'ev-mitochondria', title: 'Mitochondria captured', mya: 1900, lane: 'eukaryotes', importance: 2, fuzzy: true, note: 'One cell engulfs another; the guest becomes the power plant of every complex cell since.' },
  { id: 'ev-sex', title: 'Sexual reproduction', mya: 1200, lane: 'eukaryotes', importance: 2, fuzzy: true, note: 'Shuffling two parents\' genes together — slow, costly, and the engine that made evolution fast.' },
  { id: 'ev-bangiomorpha', title: 'Bangiomorpha, first complex multicellular', mya: 1050, lane: 'eukaryotes', importance: 3, note: 'A red alga — one of the oldest organisms with differentiated cells and sexual reproduction.' },
  { id: 'ev-plastid', title: 'Chloroplasts captured', mya: 1600, lane: 'eukaryotes', importance: 3, fuzzy: true, note: 'A eukaryote swallows a cyanobacterium; the descendants become algae and, eventually, all plants.' },

  // ============================================================
  // PLANTS
  // ============================================================
  { id: 'ev-green-algae', title: 'Green algae', mya: 1000, lane: 'plants', importance: 3, fuzzy: true, note: 'The freshwater green algae from which all land plants would later descend.' },
  { id: 'ev-land-plants', title: 'Plants colonise land', mya: 470, lane: 'plants', sub: 'Bryophytes', importance: 1, note: 'The first liverwort-like plants creep onto bare rock — greening a dead landscape for the first time.' },
  { id: 'ev-cooksonia', title: 'Cooksonia, first vascular plant', mya: 430, lane: 'plants', sub: 'Vascular plants', importance: 2, note: 'Internal plumbing lets plants stand upright and grow tall — the beginning of everything with a stem.' },
  { id: 'ev-first-forests', title: 'First forests', mya: 385, lane: 'plants', sub: 'Trees', importance: 1, note: 'Archaeopteris, the first true tree, builds the first forests — pulling down so much CO₂ it may have cooled the planet.' },
  { id: 'ev-seed-plants', title: 'Seeds', mya: 360, lane: 'plants', importance: 2, note: 'The seed frees plants from needing water to reproduce, letting them spread inland and into dry ground.' },
  { id: 'ev-coal-forests', title: 'Carboniferous coal forests', mya: 320, lane: 'plants', sub: 'Ferns & horsetails', importance: 2, note: 'Vast swamp forests of giant ferns and horsetails — buried, compressed, and burned by us 300 million years later as coal.' },
  { id: 'ev-conifers', title: 'Conifers', mya: 310, lane: 'plants', sub: 'Gymnosperms', importance: 3, note: 'Cone-bearing trees that would dominate the age of dinosaurs.' },
  { id: 'ev-flowers', title: 'Flowering plants', mya: 135, lane: 'plants', sub: 'Angiosperms', importance: 1, note: 'Flowers appear and explode across the world — a rise so fast Darwin called it "an abominable mystery".' },
  { id: 'ev-grasses', title: 'Grasses', mya: 60, lane: 'plants', sub: 'Grasses', importance: 3, note: 'Grasses evolve; grasslands later spread and remake the world of grazing mammals — and, eventually, wheat and us.' },
  { id: 'ev-grasslands', title: 'Grasslands spread', mya: 25, lane: 'plants', importance: 4, note: 'Open savannahs expand, setting the stage for horses, antelope and upright apes.' },

  // ============================================================
  // FUNGI
  // ============================================================
  { id: 'ev-fungi', title: 'Fungi diverge', mya: 1200, lane: 'fungi', importance: 3, fuzzy: true, note: 'Fungi split from animals — our closest kingdom. The oldest fungal fossils reach back ~1 billion years.' },
  { id: 'ev-mycorrhizae', title: 'Fungi partner with plants', mya: 470, lane: 'fungi', importance: 2, note: 'Mycorrhizal fungi wire into plant roots, feeding them minerals in exchange for sugar — the deal that made land plants possible.' },
  { id: 'ev-prototaxites', title: 'Prototaxites, the giant fungus', mya: 420, lane: 'fungi', importance: 3, fuzzy: true, note: 'Eight-metre spires that towered over the earliest land life — probably an enormous fungus.' },
  { id: 'ev-lichens', title: 'Lichens', mya: 400, lane: 'fungi', importance: 4, note: 'A fungus and an alga living as one — pioneers that break down bare rock into soil.' },

  // ============================================================
  // INVERTEBRATES
  // ============================================================
  { id: 'ev-sponges', title: 'Sponges', mya: 640, lane: 'inverts', importance: 2, fuzzy: true, note: 'The earliest animals — no nerves, no muscles, just cooperating cells. Molecular clocks push their origin past 600 million years.' },
  { id: 'ev-ediacara', title: 'Ediacaran biota', mya: 575, lane: 'inverts', importance: 1, note: 'The first large, soft-bodied animals — strange fronds and discs like Dickinsonia, unlike anything alive today.' },
  { id: 'ev-cnidaria', title: 'Jellyfish & corals', mya: 580, lane: 'inverts', sub: 'Cnidarians', importance: 3, fuzzy: true, note: 'The first animals with true tissues and stinging cells.' },
  { id: 'ev-cambrian-explosion', title: 'The Cambrian explosion', mya: 538, lane: 'inverts', importance: 1, note: 'In a geological blink, almost every major animal body plan appears — eyes, shells, legs, guts. The world suddenly fills with animals.' },
  { id: 'ev-trilobites', title: 'Trilobites', mya: 521, end: 252, lane: 'inverts', sub: 'Arthropods', importance: 2, note: 'Armoured sea-floor arthropods with the first complex eyes; they thrived for 270 million years before the Great Dying erased them.' },
  { id: 'ev-anomalocaris', title: 'Anomalocaris, the first great predator', mya: 518, lane: 'inverts', importance: 3, note: 'A metre-long Cambrian hunter with grasping appendages — the top predator of its world.' },
  { id: 'ev-molluscs', title: 'Molluscs', mya: 530, lane: 'inverts', sub: 'Molluscs', importance: 3, note: 'Snails, clams and their kin — one of the most successful body plans ever, still everywhere today.' },
  { id: 'ev-arthropods-land', title: 'Arthropods crawl ashore', mya: 430, lane: 'inverts', sub: 'Arthropods', importance: 2, note: 'Millipedes and their relatives are the first animals to leave the water for land.' },
  { id: 'ev-insects', title: 'Insects', mya: 400, lane: 'inverts', sub: 'Insects', importance: 1, note: 'The most diverse animals ever to exist appear — more species than everything else combined.' },
  { id: 'ev-flight-insects', title: 'Insects take flight', mya: 325, lane: 'inverts', sub: 'Insects', importance: 2, note: 'The first animals to fly — 100 million years before any vertebrate leaves the ground.' },
  { id: 'ev-meganeura', title: 'Meganeura, giant dragonfly', mya: 300, lane: 'inverts', importance: 3, note: 'A dragonfly with a 70cm wingspan, made possible by the oxygen-rich Carboniferous air.' },
  { id: 'ev-ammonites', title: 'Ammonites', mya: 400, end: 66, lane: 'inverts', sub: 'Molluscs', importance: 3, note: 'Coiled, tentacled relatives of squid; their spiral shells are everywhere in the fossil record until the asteroid took them too.' },

  // ============================================================
  // FISH & early vertebrates
  // ============================================================
  { id: 'ev-first-chordate', title: 'Pikaia, an early chordate', mya: 508, lane: 'fish', importance: 3, note: 'A small Cambrian swimmer with a stiffening rod down its back — the first hint of a backbone, and of us.' },
  { id: 'ev-first-fish', title: 'First fish (jawless)', mya: 518, lane: 'fish', sub: 'Jawless fish', importance: 1, note: 'Haikouichthys and kin — tiny, jawless, finless fish. The first true vertebrates.' },
  { id: 'ev-jaws', title: 'Jaws evolve', mya: 440, lane: 'fish', importance: 1, note: 'The single evolutionary step behind every bite, from a shark to your dinner — jaws turned fish from filter-feeders into hunters.' },
  { id: 'ev-sharks', title: 'Sharks', mya: 450, lane: 'fish', sub: 'Cartilaginous fish', importance: 2, note: 'Cartilage-skeletoned predators that have prowled the oceans, barely changed, since before trees existed.' },
  { id: 'ev-placoderms', title: 'Armoured fish (placoderms)', mya: 430, end: 359, lane: 'fish', importance: 3, note: 'Tank-like jawed fish; Dunkleosteus grew to six metres with shearing bony plates for teeth.' },
  { id: 'ev-bony-fish', title: 'Bony fish', mya: 420, lane: 'fish', sub: 'Ray-finned fish', importance: 2, note: 'The ray-finned fish — today half of all vertebrate species swim in this branch.' },
  { id: 'ev-coelacanth', title: 'Lobe-finned fish', mya: 415, lane: 'fish', sub: 'Lobe-finned fish', importance: 2, note: 'Fish with fleshy, limb-like fins. One branch would walk onto land; another, the coelacanth, still survives in the deep.' },
  { id: 'ev-tiktaalik', title: 'Tiktaalik, the fish that walked', mya: 375, lane: 'fish', importance: 1, note: 'A flat-headed fish with a neck, wrists and lungs — caught mid-transition between fin and limb.' },

  // ============================================================
  // AMPHIBIANS & tetrapods
  // ============================================================
  { id: 'ev-tetrapods', title: 'First tetrapods', mya: 365, lane: 'amphibians', importance: 1, note: 'Ichthyostega and Acanthostega drag themselves onto land on four legs — the ancestors of every amphibian, reptile, bird and mammal.' },
  { id: 'ev-amphibians', title: 'Amphibians', mya: 340, lane: 'amphibians', importance: 2, note: 'The first true land vertebrates — but still tied to water to breed, as frogs are today.' },
  { id: 'ev-temnospondyls', title: 'Giant amphibians', mya: 330, end: 120, lane: 'amphibians', importance: 3, note: 'Crocodile-sized amphibians that dominated wet lowlands for over 200 million years.' },
  { id: 'ev-frogs', title: 'Frogs', mya: 200, lane: 'amphibians', importance: 4, note: 'The lineage of modern frogs and toads, remarkably little changed since the dinosaurs.' },

  // ============================================================
  // REPTILES & DINOSAURS
  // ============================================================
  { id: 'ev-amniotes', title: 'The amniotic egg', mya: 320, lane: 'reptiles', importance: 1, note: 'A shelled egg that could be laid on dry land cut the last tie to water — and split into reptiles on one branch, mammals on the other.' },
  { id: 'ev-first-reptiles', title: 'First reptiles', mya: 312, lane: 'reptiles', importance: 2, note: 'Hylonomus, a small lizard-like animal — the oldest known true reptile.' },
  { id: 'ev-archosaurs', title: 'Archosaurs', mya: 250, lane: 'reptiles', importance: 3, note: 'The "ruling reptiles": the group that gave rise to crocodiles, pterosaurs, dinosaurs and birds.' },
  { id: 'ev-first-dinos', title: 'First dinosaurs', mya: 233, lane: 'reptiles', sub: 'Dinosaurs', importance: 1, note: 'Small, fast bipeds appear; within 30 million years they rule every large-animal niche on land.' },
  { id: 'ev-pterosaurs', title: 'Pterosaurs take to the air', mya: 228, lane: 'reptiles', sub: 'Pterosaurs', importance: 2, note: 'The first flying vertebrates — some later the size of a small plane.' },
  { id: 'ev-ichthyosaurs', title: 'Marine reptiles', mya: 250, end: 66, lane: 'reptiles', sub: 'Marine reptiles', importance: 3, note: 'Ichthyosaurs, plesiosaurs and mosasaurs — reptiles that returned to the sea and ruled it while dinosaurs ruled the land.' },
  { id: 'ev-sauropods', title: 'Sauropods, the giants', mya: 200, lane: 'reptiles', sub: 'Dinosaurs', importance: 2, note: 'The long-necked dinosaurs — the largest animals ever to walk the Earth, some over 30 metres long.' },
  { id: 'ev-turtles', title: 'Turtles', mya: 220, lane: 'reptiles', importance: 4, note: 'The turtle body plan — a rib cage turned into a shell — has barely changed since the Triassic.' },
  { id: 'ev-crocodiles', title: 'Crocodilians', mya: 200, lane: 'reptiles', importance: 4, note: 'Living crocodiles are the last survivors of the great archosaur dynasty, alongside the birds.' },
  { id: 'ev-stegosaurus', title: 'Stegosaurus', mya: 155, lane: 'reptiles', sub: 'Dinosaurs', importance: 3, note: 'Plated and spike-tailed, roaming the Late Jurassic — closer in time to Tyrannosaurus than Tyrannosaurus is to us.' },
  { id: 'ev-snakes', title: 'Snakes', mya: 128, lane: 'reptiles', importance: 4, note: 'Lizards that lost their legs — a body plan so successful it spread worldwide.' },
  { id: 'ev-trex', title: 'Tyrannosaurus rex', mya: 68, lane: 'reptiles', sub: 'Dinosaurs', importance: 2, note: 'One of the last and largest land predators before the asteroid — living right up to the K–Pg line.' },
  { id: 'ev-nonavian-end', title: 'Non-avian dinosaurs die out', mya: 66, lane: 'reptiles', domain: 'extinction', importance: 1, note: 'After 165 million years, every dinosaur but the birds is gone in the aftermath of the impact.' },

  // ============================================================
  // BIRDS
  // ============================================================
  { id: 'ev-archaeopteryx', title: 'Archaeopteryx, first bird', mya: 150, lane: 'birds', importance: 1, note: 'Feathers, wings — and teeth, claws and a bony tail. The famous halfway-house between dinosaur and bird.' },
  { id: 'ev-feathered-dinos', title: 'Feathered dinosaurs', mya: 165, lane: 'birds', importance: 2, fuzzy: true, note: 'Many small theropod dinosaurs had feathers long before flight — for warmth or display. Birds are living dinosaurs.' },
  { id: 'ev-modern-birds', title: 'Modern birds radiate', mya: 60, lane: 'birds', importance: 2, note: 'With the big dinosaurs gone, surviving birds explode into today\'s 10,000+ species within a few million years.' },
  { id: 'ev-terror-birds', title: 'Terror birds', mya: 50, end: 2, lane: 'birds', importance: 3, note: 'Flightless, three-metre apex-predator birds that hunted across the Americas for tens of millions of years.' },
  { id: 'ev-songbirds', title: 'Songbirds', mya: 33, lane: 'birds', importance: 4, note: 'The perching songbirds — now almost half of all bird species.' },

  // ============================================================
  // MAMMALS
  // ============================================================
  { id: 'ev-synapsids', title: 'Synapsids — our branch', mya: 320, lane: 'mammals', importance: 1, note: 'On the day the amniotic egg split, one branch became reptiles and the other — the synapsids — began the long road to us.' },
  { id: 'ev-dimetrodon', title: 'Dimetrodon', mya: 295, end: 272, lane: 'mammals', importance: 3, note: 'The sail-backed predator often mistaken for a dinosaur is actually a distant cousin of ours, tens of millions of years before the first dinosaur.' },
  { id: 'ev-therapsids', title: 'Therapsids', mya: 275, lane: 'mammals', importance: 3, note: 'Increasingly mammal-like reptiles — differentiated teeth, more upright legs — bridging toward true mammals.' },
  { id: 'ev-cynodonts', title: 'Cynodonts', mya: 260, lane: 'mammals', importance: 3, note: 'Small, probably furry, likely warm-blooded — the direct ancestors of mammals, surviving in the dinosaurs\' shadow.' },
  { id: 'ev-first-mammals', title: 'First true mammals', mya: 205, lane: 'mammals', importance: 1, note: 'Morganucodon and kin: shrew-sized, nocturnal, and destined to stay small for 140 million years while dinosaurs owned the daylight.' },
  { id: 'ev-marsupials', title: 'Marsupials & placentals split', mya: 160, lane: 'mammals', importance: 2, fuzzy: true, note: 'The pouch-bearers and the placental mammals part ways — one branch leading to kangaroos, the other to us.' },
  { id: 'ev-mammal-radiation', title: 'The mammal takeover', mya: 66, lane: 'mammals', importance: 1, note: 'Within a few million years of the asteroid, mammals balloon from shrew-sized survivors into every large-animal role the dinosaurs left empty.' },
  { id: 'ev-primates', title: 'First primates', mya: 66, lane: 'mammals', sub: 'Primates', importance: 2, note: 'Small tree-dwellers with grasping hands and forward-facing eyes appear right around the extinction — the root of our own order.' },
  { id: 'ev-whales', title: 'Whales return to the sea', mya: 50, lane: 'mammals', sub: 'Cetaceans', importance: 2, note: 'Pakicetus, a hoofed land mammal, begins the walk back into the water; its descendants become the largest animals that have ever lived.' },
  { id: 'ev-horses', title: 'First horses', mya: 55, lane: 'mammals', sub: 'Odd-toed', importance: 3, note: 'Eohippus, a dog-sized forest browser — the start of one of the best-documented lineages in the fossil record.' },
  { id: 'ev-bats', title: 'Bats', mya: 52, lane: 'mammals', importance: 4, note: 'Mammals take to the air; echolocation follows soon after.' },
  { id: 'ev-elephants', title: 'First elephants', mya: 37, lane: 'mammals', importance: 4, note: 'Moeritherium, a pig-sized swamp-dweller, begins the elephant line.' },
  { id: 'ev-cats-dogs', title: 'Cats & dogs (carnivorans)', mya: 42, lane: 'mammals', sub: 'Carnivorans', importance: 4, note: 'The carnivoran radiation that leads to every cat, dog, bear and seal.' },
  { id: 'ev-mammoths', title: 'Mammoths', mya: 5, end: 0.004, lane: 'mammals', importance: 3, note: 'Ice-age giants that survived until ~4,000 years ago — after the pyramids were built.' },

  // ============================================================
  // HOMININS & HUMANS
  // ============================================================
  { id: 'ev-apes', title: 'First apes', mya: 23, lane: 'hominins', sub: 'Apes', importance: 2, note: 'Tail-less primates like Proconsul appear in African forests — the root of the ape branch.' },
  { id: 'ev-great-apes', title: 'Great apes', mya: 15, lane: 'hominins', importance: 3, note: 'The larger, big-brained apes: the ancestors of orangutans, gorillas, chimps and us.' },
  { id: 'ev-human-chimp-split', title: 'Human & chimp lines split', mya: 7, lane: 'hominins', importance: 1, note: 'Our lineage parts from the chimpanzees\'. Sahelanthropus, near this split, may already have walked upright.' },
  { id: 'ev-ardipithecus', title: 'Ardipithecus', mya: 4.4, lane: 'hominins', importance: 3, note: '"Ardi" — a forest ape that could both climb and walk on two legs, before the savannah.' },
  { id: 'ev-lucy', title: 'Australopithecus ("Lucy")', mya: 3.2, lane: 'hominins', importance: 1, note: 'Fully upright walkers with ape-sized brains. Lucy\'s skeleton showed our ancestors stood up long before they got clever.' },
  { id: 'ev-stone-tools', title: 'First stone tools', mya: 3.3, lane: 'hominins', importance: 2, note: 'The oldest known tools, from Lomekwi in Kenya — chipped before the genus Homo even existed.' },
  { id: 'ev-homo-habilis', title: 'Homo habilis', mya: 2.4, lane: 'hominins', sub: 'Homo', importance: 2, note: '"Handy man" — the first of our own genus, with a larger brain and a toolkit.' },
  { id: 'ev-homo-erectus', title: 'Homo erectus', mya: 1.9, lane: 'hominins', sub: 'Homo', importance: 1, note: 'Tall, long-legged, and the first hominin to leave Africa — and, later, to tame fire.' },
  { id: 'ev-fire', title: 'Control of fire', mya: 1.0, lane: 'hominins', importance: 2, fuzzy: true, note: 'Cooked food unlocked more energy for a hungrier, bigger brain. Firm evidence dates to at least a million years ago.' },
  { id: 'ev-neanderthals', title: 'Neanderthals', mya: 0.43, end: 0.04, lane: 'hominins', sub: 'Homo', importance: 2, note: 'Cold-adapted, big-brained cousins who buried their dead and made art — and whose DNA most living people still carry.' },
  { id: 'ev-sapiens', title: 'Homo sapiens', mya: 0.3, lane: 'hominins', sub: 'Homo', importance: 1, note: 'Us. The oldest known fossils of our species, from Jebel Irhoud in Morocco, are around 300,000 years old.' },
  { id: 'ev-out-of-africa', title: 'Out of Africa', mya: 0.07, lane: 'hominins', importance: 2, note: 'The migration that carried modern humans across every continent — and left every other human species extinct behind us.' },
  { id: 'ev-agriculture', title: 'Farming begins', mya: 0.012, lane: 'hominins', importance: 2, note: 'The Neolithic. In the last blink of this whole map, humans start growing food — and everything after follows fast.' },
  { id: 'ev-writing', title: 'Writing', mya: 0.005, lane: 'hominins', importance: 3, note: 'Recorded history begins — the sliver of time the History map zooms into is this thin final line here.' },
  { id: 'ev-today', title: 'Today', mya: 0, lane: 'hominins', importance: 1, note: 'You, reading this, at the very right-hand edge of four billion years.' },
]
