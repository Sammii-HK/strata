import { useState } from 'react';
import { Platform, Text as RNText } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import Onboarding from './src/Onboarding';
import Atlas from './src/Atlas';
import { MapContext, type Lens } from './src/mapContext';
import { cosmosConfig } from './src/maps/cosmos';
import { historyConfig } from './src/maps/history';
import { evolutionConfig } from './src/maps/evolution';
import { geodeConfig } from './src/maps/geode';
import { blazonConfig } from './src/maps/blazon';
import { balladryConfig } from './src/maps/balladry';
import { bestiaryConfig } from './src/maps/bestiary';
import { mythlineConfig } from './src/maps/mythline';
import type { StrataConfig } from './src/engine/strata';
import { useStore } from './src/useStore';

// Fixed-layout canvas app: text still follows the user's size setting, but only up to 130%, so the header,
// lane chips and scrubber cannot overflow each other at accessibility sizes.
const ScalableText = RNText as unknown as { defaultProps?: { maxFontSizeMultiplier?: number } }
ScalableText.defaultProps = { ...ScalableText.defaultProps, maxFontSizeMultiplier: 1.3 }

const CONFIGS: Record<Lens, StrataConfig> = {
  cosmos: cosmosConfig,
  history: historyConfig,
  evolution: evolutionConfig,
  geode: geodeConfig,
  blazon: blazonConfig,
  balladry: balladryConfig,
  bestiary: bestiaryConfig,
  mythologies: mythlineConfig,
};

// All maps ride the same StrataCanvas engine; the active config flows via
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
  // First launch lands straight in Cosmos (free, full depth). No intro wall:
  // the tips sheet is opt-in from the map menu.
  const [lens, setLens] = useState<Lens>('cosmos');
  const [showTips, setShowTips] = useState(false);
  const [showAtlas, setShowAtlas] = useState(false);
  const store = useStore();
  const config = CONFIGS[lens];
  const openAtlas = () => setShowAtlas(true);
  const openTips = () => setShowTips(true);
  return (
    <MapContext.Provider value={{ config, lens, setLens, openAtlas, openTips, store }}>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#101218' }}>
        <StatusBar style="light" />
        <LensView />
        {showAtlas && <Atlas onOpen={(l) => { setLens(l); setShowAtlas(false); }} onClose={() => setShowAtlas(false)} />}
        {showTips && <Onboarding lens={lens} onDone={() => setShowTips(false)} />}
      </GestureHandlerRootView>
    </MapContext.Provider>
  );
}
