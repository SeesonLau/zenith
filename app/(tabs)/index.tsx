import { Pressable, Text, View, Alert, ScrollView } from 'react-native';
import { syncWithSupabase } from '@/src/database/sync/supabaseSync';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function HomeScreen() {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    
    try {
      const result = await syncWithSupabase();
      
      if (result.success) {
        Alert.alert('Success', 'Data synced successfully! ✅');
      } else {
        Alert.alert('Sync Failed', 'Check console for details');
      }
    } catch (error) {
      console.error('Sync error:', error);
      Alert.alert('Error', 'Sync failed. See console for details.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-900">
      <View className="p-6">
        {/* Header */}
        <View className="mb-8 mt-4">
          <Text className="text-4xl font-bold text-white mb-2">
            Zenith
          </Text>
          <Text className="text-slate-400 text-lg">
            Personal Management Suite
          </Text>
        </View>

        {/* Status Card */}
        <View className="bg-green-900/20 border-green-700 rounded-2xl p-6 mb-6 border">
          <View className="flex-row items-center">
            <View className="bg-green-500 rounded-full w-12 h-12 items-center justify-center mr-4">
              <Ionicons name="checkmark-circle" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-green-400 font-semibold text-lg">
                Ready to Sync
              </Text>
              <Text className="text-slate-400 text-sm">
                No authentication required
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <Text className="text-white font-semibold text-lg mb-4">
          Quick Actions
        </Text>

        {/* Sync Button */}
        <Pressable
          onPress={handleSync}
          disabled={isSyncing}
          className={`rounded-xl p-5 mb-3 flex-row items-center ${
            isSyncing ? 'bg-sky-600' : 'bg-sky-500 active:bg-sky-600'
          }`}
        >
          <View className="bg-white/20 rounded-full w-10 h-10 items-center justify-center mr-4">
            <Ionicons 
              name={isSyncing ? "sync" : "cloud-upload-outline"} 
              size={20} 
              color="white" 
            />
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-lg">
              {isSyncing ? 'Syncing...' : 'Sync Data'}
            </Text>
            <Text className="text-sky-100 text-sm">
              Push and pull changes from cloud
            </Text>
          </View>
        </Pressable>

        {/* Module Cards */}
        <Text className="text-white font-semibold text-lg mb-4 mt-6">
          Modules
        </Text>

        <View className="space-y-3">
          {[
            { name: 'Habits', icon: 'hourglass-outline', route: '/habits', color: 'bg-purple-500' },
            { name: 'Finance', icon: 'wallet-outline', route: '/finance', color: 'bg-green-500' },
            { name: 'Diary', icon: 'book-outline', route: '/diary', color: 'bg-blue-500' },
            { name: 'Leisure', icon: 'game-controller-outline', route: '/leisure', color: 'bg-pink-500' },
          ].map((module) => (
            <Pressable
              key={module.name}
              onPress={() => router.push(module.route as any)}
              className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex-row items-center active:bg-slate-700"
            >
              <View className={`${module.color} rounded-full w-12 h-12 items-center justify-center mr-4`}>
                <Ionicons name={module.icon as any} size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-lg">
                  {module.name}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#64748b" />
            </Pressable>
          ))}
        </View>

        {/* Status Info */}
        <View className="mt-8 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <Text className="text-slate-400 text-xs text-center">
            ✅ Offline-first • 🔓 No authentication required
          </Text>
          <Text className="text-slate-500 text-xs text-center mt-1">
            All data stored locally and synced to your personal Supabase
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}