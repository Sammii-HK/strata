import { useContext } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text as RNText, View } from 'react-native'
import { COMPLETE, fallbackPrice, resolveCatalog, type CatalogEntry, type Lens } from './catalogue'
import { MapContext, type StoreState } from './mapContext'

const BG = '#101218'
const PANEL = '#1a1e26'
const BORDER = '#2a2f39'
const TEXT = '#e9eaee'
const MUTED = '#9aa1ac'
const FAINT = '#6a7280'
const ACCENT = '#e8b84b'

/** Live StoreKit price when the offering has loaded, else the catalogue fallback. */
function priceFor(entry: CatalogEntry, store: StoreState): string | undefined {
  return store.prices[entry.id] ?? fallbackPrice(entry)
}

function StatusChip({ entry, price }: { entry: CatalogEntry; price?: string }) {
  if (entry.status === 'included') return <Chip text="Free" color="#2FA98C" />
  if (entry.status === 'owned') return <Chip text="Unlocked" color="#2FA98C" />
  if (entry.status === 'locked') return <Chip text={entry.preview ? 'Preview' : price ?? 'Unlock'} color={ACCENT} />
  return <Chip text="Soon" color={FAINT} />
}

function Chip({ text, color }: { text: string; color: string }) {
  return (
    <View style={{ borderColor: color, borderWidth: 1, borderRadius: 20, paddingVertical: 3, paddingHorizontal: 10 }}>
      <RNText style={{ color, fontSize: 11, fontWeight: '600' }}>{text}</RNText>
    </View>
  )
}

function MapCard({ entry, store, onOpen }: { entry: CatalogEntry; store: StoreState; onOpen: (l: Lens) => void }) {
  // Locked maps open too: the overview is free to browse, only depth is gated.
  const openable = entry.status !== 'coming-soon' && entry.lens
  const price = priceFor(entry, store)
  const buyable = entry.status === 'locked' && store.canPurchase && !store.busy
  const body = (
    <View style={{ flexDirection: 'row', gap: 12, backgroundColor: PANEL, borderColor: BORDER, borderWidth: 1, borderRadius: 14, padding: 14, opacity: entry.status === 'coming-soon' ? 0.72 : 1 }}>
      <View style={{ width: 6, borderRadius: 3, backgroundColor: entry.color }} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <RNText style={{ color: TEXT, fontSize: 17, fontWeight: '600' }}>{entry.name}</RNText>
          <StatusChip entry={entry} price={price} />
        </View>
        <RNText style={{ color: MUTED, fontSize: 12.5, marginTop: 1 }}>{entry.tagline}</RNText>
        <RNText style={{ color: FAINT, fontSize: 12.5, marginTop: 8, lineHeight: 18 }}>{entry.blurb}</RNText>
        {openable && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 10 }}>
            <RNText style={{ color: entry.color, fontSize: 13, fontWeight: '600' }}>{entry.status === 'locked' ? 'Browse ›' : 'Open ›'}</RNText>
            {buyable && (
              <Pressable onPress={() => store.purchase(entry.id)} hitSlop={8}>
                <RNText style={{ color: ACCENT, fontSize: 13, fontWeight: '600' }}>Unlock {price}</RNText>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  )
  if (openable) return <Pressable onPress={() => onOpen(entry.lens!)}>{body}</Pressable>
  return body
}

function Section({ title }: { title: string }) {
  return <RNText style={{ color: MUTED, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8 }}>{title}</RNText>
}

export default function Atlas({ onOpen, onClose }: { onOpen: (l: Lens) => void; onClose: () => void }) {
  const { store } = useContext(MapContext)
  const catalog = resolveCatalog(store.owned)
  const yours = catalog.filter((e) => e.status === 'included' || e.status === 'owned')
  const locked = catalog.filter((e) => e.status === 'locked')
  const soon = catalog.filter((e) => e.status === 'coming-soon')
  const completePrice = store.prices.complete ?? COMPLETE.price
  const showComplete = locked.length > 0
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
        <Section title="Your maps" />
        {yours.map((e) => (
          <MapCard key={e.id} entry={e} store={store} onOpen={onOpen} />
        ))}

        {locked.length > 0 && (
          <>
            <Section title="Packs" />
            {locked.map((e) => (
              <MapCard key={e.id} entry={e} store={store} onOpen={onOpen} />
            ))}
          </>
        )}

        {showComplete && (
          <Pressable disabled={!store.canPurchase || store.busy} onPress={() => store.purchase('complete')} style={{ backgroundColor: PANEL, borderColor: ACCENT, borderWidth: 1, borderRadius: 14, padding: 16, marginTop: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <RNText style={{ color: TEXT, fontSize: 17, fontWeight: '600' }}>{COMPLETE.name}</RNText>
              {store.busy ? <ActivityIndicator color={ACCENT} /> : <RNText style={{ color: ACCENT, fontSize: 17, fontWeight: '700' }}>{completePrice}</RNText>}
            </View>
            <RNText style={{ color: MUTED, fontSize: 13, marginTop: 6, lineHeight: 19 }}>{COMPLETE.blurb}</RNText>
            {store.canPurchase && <RNText style={{ color: ACCENT, fontSize: 13, fontWeight: '600', marginTop: 10 }}>Unlock everything ›</RNText>}
          </Pressable>
        )}

        {soon.length > 0 && (
          <>
            <Section title="Coming soon" />
            {soon.map((e) => (
              <MapCard key={e.id} entry={e} store={store} onOpen={onOpen} />
            ))}
          </>
        )}

        <RNText style={{ color: FAINT, fontSize: 11, textAlign: 'center', marginTop: 6, lineHeight: 16 }}>
          Cosmos is free at full depth. Every locked map is free to browse; unlocking opens deep zoom, compare and search. Complete always covers every future map.
        </RNText>
        {store.canPurchase && (
          <Pressable disabled={store.busy} onPress={() => store.restore()} hitSlop={8} style={{ alignSelf: 'center', marginTop: 4, marginBottom: 24 }}>
            <RNText style={{ color: MUTED, fontSize: 12, textDecorationLine: 'underline' }}>Restore purchases</RNText>
          </Pressable>
        )}
      </ScrollView>
    </View>
  )
}
