import { useEffect, useState } from 'react';
import { Platform, Text as RNText } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import Onboarding from './src/Onboarding';
import Atlas from './src/Atlas';
import { MapContext, type Lens } from './src/mapContext';
import { cosmosConfig } from './src/maps/cosmos';
import { historyConfig } from './src/maps/history';
import { evolutionConfig } from './src/maps/evolution';
import { configurePurchases } from './src/purchases';

let seenIntro = false;

// Both maps ride the same StrataCanvas engine now; the active config flows via
// MapContext. Skia needs CanvasKit before its module imports, so lazy-load on web.
function LensView() {
  if (Platform.OS === 'web') {
    const { WithSkiaWeb } = require('@shopify/react-native-skia/lib/module/web');
    return (
      <WithSkiaWeb
        opts={{ locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/canvaskit-wasm@0.41.0/bin/full/${file}` }}
        getComponent={() => import('./src/StrataCanvas')}
        fallback={<RNText style={{ color: '#e9eaee', padding: 24 }}>Loading Strata…</RNText>}
      />
    );
  }
  const Comp = require('./src/StrataCanvas').default;
  return <Comp />;
}

export default function App() {
  const [lens, setLens] = useState<Lens>('cosmos');
  const [showIntro, setShowIntro] = useState(!seenIntro);
  const [showAtlas, setShowAtlas] = useState(false);
  useEffect(() => { configurePurchases(); }, []);
  const config = lens === 'cosmos' ? cosmosConfig : lens === 'evolution' ? evolutionConfig : historyConfig;
  const openAtlas = () => setShowAtlas(true);
  return (
    <MapContext.Provider value={{ config, lens, setLens, openAtlas }}>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#101218' }}>
        <StatusBar style="light" />
        <LensView />
        {showAtlas && <Atlas onOpen={(l) => { setLens(l); setShowAtlas(false); }} onClose={() => setShowAtlas(false)} />}
        {showIntro && <Onboarding lens={lens} onDone={() => { seenIntro = true; setShowIntro(false); }} />}
      </GestureHandlerRootView>
    </MapContext.Provider>
  );
}
