import { Pressable, Text, View } from 'react-native'

const HINTS: { icon: string; text: string }[] = [
  { icon: '⤢', text: 'Pinch or scroll to zoom, from a single moment to all of it' },
  { icon: '↔', text: 'Drag to travel along the line' },
  { icon: '◐', text: 'Tap Cosmos or History up top to switch universe' },
  { icon: '○', text: 'Tap any point for what it is; tap a second to measure the gap' },
]

export default function Onboarding({ lens, onDone }: { lens: 'cosmos' | 'history'; onDone: () => void }) {
  const tagline =
    lens === 'cosmos'
      ? 'Zoom from the ISS just overhead out to the edge of the observable universe, everything to true scale.'
      : 'Zoom from a single day out to the whole of recorded history, every civilisation on one map.'
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(8,9,12,0.86)', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 24 }}>
      <View style={{ width: '100%', maxWidth: 360, backgroundColor: '#14161b', borderRadius: 18, borderWidth: 1, borderColor: '#2a2f39', padding: 26 }}>
        <Text style={{ color: '#e9eaee', fontSize: 28, fontWeight: '600', marginBottom: 4 }}>Chronoline</Text>
        <Text style={{ color: '#9aa1ac', fontSize: 15, lineHeight: 21, marginBottom: 20 }}>{tagline}</Text>

        {HINTS.map((h) => (
          <View key={h.text} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
            <Text style={{ color: '#C56BD6', fontSize: 20, width: 30 }}>{h.icon}</Text>
            <Text style={{ color: '#d5d7dc', fontSize: 14, lineHeight: 19, flex: 1 }}>{h.text}</Text>
          </View>
        ))}

        <Pressable
          onPress={onDone}
          style={({ pressed }) => ({ marginTop: 12, backgroundColor: pressed ? '#3a3050' : '#2a2233', borderWidth: 1, borderColor: '#C56BD6', borderRadius: 10, paddingVertical: 12, alignItems: 'center' })}
        >
          <Text style={{ color: '#e9c6f0', fontSize: 16, fontWeight: '500' }}>Start exploring</Text>
        </Pressable>
      </View>
    </View>
  )
}
