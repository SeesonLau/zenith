// app/_layout.tsx
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import "./global.css";
import { startAutoSync, stopAutoSync } from '@/src/database/sync/syncManager';
import { ThemeProvider } from '@/src/contexts/ThemeContext';


export default function RootLayout() {


  useEffect(() => {
    if (__DEV__) console.log('🚀 App starting...');
    startAutoSync();
    return () => {
      if (__DEV__) console.log('🛑 App closing...');
      stopAutoSync();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StatusBar style="light" translucent backgroundColor="transparent" />

        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
