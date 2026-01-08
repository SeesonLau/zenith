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
    console.log('🚀 App starting...');
    startAutoSync();
    return () => {
      console.log('🛑 App closing...');
      stopAutoSync();
    };
  }, []);

  return (
    <SafeAreaProvider>
      {/* ✅ Added ThemeProvider wrapper */}
      <ThemeProvider>
        {/* Edge-to-edge status bar for Android */}
        <StatusBar style="light" translucent backgroundColor="transparent" />
        
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
      {/* ✅ Close ThemeProvider */}
    </SafeAreaProvider>
  );
}