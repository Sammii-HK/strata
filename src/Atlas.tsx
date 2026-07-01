import { Pressable, ScrollView, Text as RNText, View } from 'react-native'
import { CATALOG, COMPLETE, type CatalogEntry, type Lens } from './catalogue'

const BG = '#101218'
const PANEL = '#1a1e26'
const BORDER = '#2a2f39'
const TEXT = '#e9eaee'
const MUTED = '#9aa1ac'
const FAINT = '#6a7280'
const ACCENT = '#e8b84b'

function StatusChip({ entry }: { entry: CatalogEntry }) {
  if (entry.status === 'included') return <Chip text="Included" color="#2FA98C" />
  if (entry.status === 'owned') return <Chip text="Unlocked" color="#2FA98C" />
  if (entry.status === 'locked') return <Chip text={entry.price ?? 'Unlock'} color={ACCENT} />
  return <Chip text={`Soon · ${entry.price ?? ''}`.trim()} color={FAINT} />
}

function Chip({ text, color }: { text: string; color: string }) {
  return (
    <View style={{ borderColor: color, borderWidth: 1, borderRadius: 20, paddingVertical: 3, paddingHorizontal: 10 }}>
      <RNText style={{ color, fontSize: 11, fontWeight: '600' }}>{text}</RNText>
    </View>
  )
}

function MapCard({ entry, onOpen }: { entry: CatalogEntry; onOpen: (l: Lens) => void }) {
  const openable = (entry.status === 'included' || entry.status === 'owned') && entry.lens
  const body = (
    <View style={{ flexDirection: 'row', gap: 12, backgroundColor: PANEL, borderColor: BORDER, borderWidth: 1, borderRadius: 14, padding: 14, opacity: entry.status === 'coming-soon' ? 0.72 : 1 }}>
      <View style={{ width: 6, borderRadius: 3, backgroundColor: entry.color }} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <RNText style={{ color: TEXT, fontSize: 17, fontWeight: '600' }}>{entry.name}</RNText>
          <StatusChip entry={entry} />
        </View>
        <RNText style={{ color: MUTED, fontSize: 12.5, marginTop: 1 }}>{entry.tagline}</RNText>
        <RNText style={{ color: FAINT, fontSize: 12.5, marginTop: 8, lineHeight: 18 }}>{entry.blurb}</RNText>
        {openable && <RNText style={{ color: entry.color, fontSize: 13, fontWeight: '600', marginTop: 10 }}>Open ›</RNText>}
      </View>
    </View>
  )
  if (openable) return <Pressable onPress={() => onOpen(entry.lens!)}>{body}</Pressable>
  return body
}

export default function Atlas({ onOpen, onClose }: { onOpen: (l: Lens) => void; onClose: () => void }) {
  const included = CATALOG.filter((e) => e.status === 'included' || e.status === 'owned')
  const soon = CATALOG.filter((e) => e.status === 'coming-soon' || e.status === 'locked')
  return (
    <View style={{ position: 'absolute', inset: 0, backgroundColor: BG, zIndex: 50 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 56, paddingHorizontal: 18, paddingBottom: 8 }}>
        <RNText style={{ color: TEXT, fontSize: 24, fontWeight: '600' }}>Maps</RNText>
        <Pressable onPress={onClose} hitSlop={12}>
          <RNText style={{ color: MUTED, fontSize: 22 }}>✕</RNText>
        </Pressable>
      </View>
      <RNText style={{ color: FAINT, fontSize: 13, paddingHorizontal: 18, marginBottom: 8, lineHeight: 19 }}>
        One engine, many worlds. Every map is the same lens: parallel lines on a scale, zoom in and each line becomes many.
      </RNText>

      <ScrollView contentContainerStyle={{ padding: 18, paddingTop: 6, gap: 12 }}>
        <RNText style={{ color: MUTED, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>Your maps</RNText>
        {included.map((e) => (
          <MapCard key={e.id} entry={e} onOpen={onOpen} />
        ))}

        <RNText style={{ color: MUTED, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8 }}>Coming soon</RNText>
        {soon.map((e) => (
          <MapCard key={e.id} entry={e} onOpen={onOpen} />
        ))}

        <View style={{ backgroundColor: PANEL, borderColor: ACCENT, borderWidth: 1, borderRadius: 14, padding: 16, marginTop: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <RNText style={{ color: TEXT, fontSize: 17, fontWeight: '600' }}>{COMPLETE.name}</RNText>
            <RNText style={{ color: ACCENT, fontSize: 17, fontWeight: '700' }}>{COMPLETE.price}</RNText>
          </View>
          <RNText style={{ color: MUTED, fontSize: 13, marginTop: 6, lineHeight: 19 }}>{COMPLETE.blurb}</RNText>
        </View>

        <RNText style={{ color: FAINT, fontSize: 11, textAlign: 'center', marginTop: 6 }}>Cosmos and History come with the app. Packs arrive as updates; Complete always covers every future map.</RNText>
      </ScrollView>
    </View>
  )
}
