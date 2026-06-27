import { Platform, Text as RNText } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

function AppBody() {
  // Skia needs CanvasKit loaded before its module is imported, so on web we
  // lazy-load it. On native we import the canvas directly.
  if (Platform.OS === 'web') {
    const { WithSkiaWeb } = require('@shopify/react-native-skia/lib/module/web');
    return (
      <WithSkiaWeb
        opts={{ locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/canvaskit-wasm@0.41.0/bin/full/${file}` }}
        getComponent={() => import('./src/TimelineCanvas')}
        fallback={<RNText style={{ color: '#e9eaee', padding: 24 }}>Loading Chronoline…</RNText>}
      />
    );
  }
  const TimelineCanvas = require('./src/TimelineCanvas').default;
  return <TimelineCanvas />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#101218' }}>
      <StatusBar style="light" />
      <AppBody />
    </GestureHandlerRootView>
  );
}
