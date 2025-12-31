// // app/_layout.tsx
// import { Stack } from 'expo-router';
// import { useEffect } from 'react';
// import { StatusBar } from 'expo-status-bar';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import "./global.css";
// import { startAutoSync, stopAutoSync } from '@/src/database/sync/syncManager';
// import { ThemeProvider } from '@/src/contexts/ThemeContext';

// export default function RootLayout() {

  
//   useEffect(() => {
//     console.log('🚀 App starting...');
//     startAutoSync();
//     return () => {
//       console.log('🛑 App closing...');
//       stopAutoSync();
//     };
//   }, []);

//   return (
//     <SafeAreaProvider>
//       {/* ✅ Added ThemeProvider wrapper */}
//       <ThemeProvider>
//         {/* Edge-to-edge status bar for Android */}
//         <StatusBar style="light" translucent backgroundColor="transparent" />
        
//         <Stack screenOptions={{ headerShown: false }}>
//           <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//         </Stack>
//       </ThemeProvider>
//       {/* ✅ Close ThemeProvider */}
//     </SafeAreaProvider>
//   );
// }
// app/_layout.tsx
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import "./global.css";
import { startAutoSync, stopAutoSync } from '@/src/database/sync/syncManager';
import { ThemeProvider } from '@/src/contexts/ThemeContext';

// IMPORTS FOR MIGRATION (Delete these after running)
import { database } from '@/src/database';
import { Q } from '@nozbe/watermelondb';
import type LeisureLog from '@/src/database/models/LeisureLog';

export default function RootLayout() {

  useEffect(() => {
    console.log('🚀 App starting...');
    startAutoSync();

    // ============================================================
    // 🛠️ MIGRATION SCRIPT: Real -> Acquainted
    // (Delete this block after you see "Migration complete" in console)
    // ============================================================
    const migrateData = async () => {
      try {
        await database.write(async () => {
          // 1. Find all logs with the old category "Real"
          const oldLogs = await database
            .get<LeisureLog>('leisure_logs')
            .query(Q.where('type', 'Real'))
            .fetch();

          if (oldLogs.length > 0) {
            console.log(`🔄 Migrating ${oldLogs.length} logs from 'Real' to 'Acquainted'...`);
            
            // 2. Loop through and update them
            for (const log of oldLogs) {
              await log.update((record) => {
                // Force update the type field
                (record as any).type = 'Acquainted'; 
              });
            }
            console.log('✅ Migration complete! You can now delete this script.');
          } else {
            console.log('👍 No old "Real" logs found. Migration not needed.');
          }
        });
      } catch (error) {
        console.error('Migration failed:', error);
      }
    };

    // Run the migration immediately on mount
    migrateData();
    // ============================================================
    // END MIGRATION SCRIPT
    // ============================================================

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