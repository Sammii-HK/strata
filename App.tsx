import { useState } from 'react';
import { Platform, Pressable, Text as RNText, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import Onboarding from './src/Onboarding';
import { MapContext, type Lens } from './src/mapContext';
import { cosmosConfig } from './src/maps/cosmos';

let seenIntro = false;

function LensView({ lens }: { lens: Lens }) {
  // Skia needs CanvasKit loaded before its module is imported, so on web we
  // lazy-load it. On native we import the canvas directly.
  if (Platform.OS === 'web') {
    const { WithSkiaWeb } = require('@shopify/react-native-skia/lib/module/web');
    return (
      <WithSkiaWeb
        opts={{ locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/canvaskit-wasm@0.41.0/bin/full/${file}` }}
        getComponent={() => (lens === 'cosmos' ? import('./src/StrataCanvas') : import('./src/TimelineCanvas'))}
        fallback={<RNText style={{ color: '#e9eaee', padding: 24 }}>Loading Chronoline…</RNText>}
      />
    );
  }
  const Comp = lens === 'cosmos' ? require('./src/StrataCanvas').default : require('./src/TimelineCanvas').default;
  return <Comp />;
}

export default function App() {
  const [lens, setLens] = useState<Lens>('cosmos');
  const [showIntro, setShowIntro] = useState(!seenIntro);
  const config = lens === 'cosmos' ? cosmosConfig : null;
  return (
    <MapContext.Provider value={{ config, lens, setLens }}>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#101218' }}>
        <StatusBar style="light" />
        <LensView lens={lens} />
        {lens === 'history' && (
          <View
            style={{
              position: 'absolute',
              top: 54,
              alignSelf: 'center',
              flexDirection: 'row',
              backgroundColor: '#1a1e26',
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#2a2f39',
              padding: 3,
              zIndex: 20,
            }}
          >
            {(['cosmos', 'history'] as const).map((l) => (
              <Pressable
                key={l}
                onPress={() => setLens(l)}
                style={{ paddingVertical: 6, paddingHorizontal: 16, borderRadius: 8, backgroundColor: lens === l ? '#2a2f39' : 'transparent' }}
              >
                <RNText style={{ color: lens === l ? '#e9eaee' : '#9aa1ac', fontSize: 14, textTransform: 'capitalize' }}>{l}</RNText>
              </Pressable>
            ))}
          </View>
        )}
        {showIntro && <Onboarding lens={lens} onDone={() => { seenIntro = true; setShowIntro(false); }} />}
      </GestureHandlerRootView>
    </MapContext.Provider>
  );
}
