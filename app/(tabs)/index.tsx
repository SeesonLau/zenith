// app/(tabs)/index.tsx - INLINE STYLES VERSION
import { Pressable, Text, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import SyncStatus from '@/src/components/common/SyncStatus';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export default function HomeScreen() {
  const router = useRouter();
  const colors = useThemeColors();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 24 }}>
          {/* Header with Settings Button */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, marginTop: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 32, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 8 }}>
                Zenith
              </Text>
            </View>
            
            {/* Settings Button */}
            <Pressable
              onPress={() => router.push('/settings' as any)}
              style={{
                backgroundColor: colors.bgSurface,
                borderWidth: 1,
                borderColor: colors.borderSurface,
                borderRadius: 24,
                width: 48,
                height: 48,
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 16
              }}
            >
              <Ionicons name="settings-outline" size={24} color="#38bdf8" />
            </Pressable>
          </View>

          {/* Sync Status Component */}
          <View style={{ marginBottom: 24 }}>
            <SyncStatus />
          </View>

          {/* Status Card */}
          <View style={{
            backgroundColor: colors.bgSurface,
            borderWidth: 1,
            borderColor: colors.borderSurface,
            borderRadius: 16,
            padding: 20,
            marginBottom: 24
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ backgroundColor: '#22c55e', borderRadius: 24, width: 48, height: 48, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                <Ionicons name="checkmark-circle" size={24} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#22c55e', fontWeight: '600', fontSize: 18 }}>
                  System Ready
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                  Auto-sync enabled • Offline-first
                </Text>
              </View>
            </View>
          </View>

          {/* Version Info */}
          <Text style={{ color: colors.textTertiary, fontSize: 12, textAlign: 'center', marginTop: 24, marginBottom: 96 }}>
            Zenith v1.1.0 
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}