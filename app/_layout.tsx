// app/_layout.tsx (UPDATED WITH AUTO-SYNC)
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import "../global.css";
import { startAutoSync, stopAutoSync } from '@/src/database/sync/syncManager';

export default function RootLayout() {
  useEffect(() => {
    console.log('🚀 App starting...');
    
    // Start auto-sync when app launches
    startAutoSync();

    // Cleanup on unmount
    return () => {
      console.log('🛑 App closing...');
      stopAutoSync();
    };
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}