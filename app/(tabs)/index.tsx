// app/(tabs)/index.tsx
import { Pressable, Text, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SyncStatus from '@/src/components/common/SyncStatus';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-slate-900">
      <View className="p-6">
        {/* Header */}
        <View className="mb-6 mt-4">
          <Text className="text-4xl font-bold text-white mb-2">
            Zenith
          </Text>
          <Text className="text-slate-400 text-lg">
            Personal Management Suite
          </Text>
        </View>

        {/* Sync Status Component */}
        <View className="mb-6">
          <SyncStatus />
        </View>

        {/* Status Card */}
        <View className="card p-5 mb-6 border-green-700 bg-green-900/10">
          <View className="flex-row items-center">
            <View className="bg-green-500 rounded-full w-12 h-12 items-center justify-center mr-4">
              <Ionicons name="checkmark-circle" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-green-400 font-semibold text-lg">
                System Ready
              </Text>
              <Text className="text-slate-400 text-sm">
                Auto-sync enabled • Offline-first
              </Text>
            </View>
          </View>
        </View>

        {/* Module Cards */}
        <Text className="text-white font-semibold text-lg mb-4">
          Modules
        </Text>

        <View className="space-y-3">
          {[
            { 
              name: 'Habits', 
              icon: 'hourglass-outline', 
              route: '/habits', 
              color: 'bg-purple-500',
              description: 'Track your daily activities'
            },
            { 
              name: 'Finance', 
              icon: 'wallet-outline', 
              route: '/finance', 
              color: 'bg-green-500',
              description: 'Manage your transactions'
            },
            { 
              name: 'Diary', 
              icon: 'book-outline', 
              route: '/diary', 
              color: 'bg-sky-500',
              description: 'Journal your thoughts'
            },
            { 
              name: 'Leisure', 
              icon: 'game-controller-outline', 
              route: '/leisure', 
              color: 'bg-pink-500',
              description: 'Log entertainment time'
            },
          ].map((module) => (
            <Pressable
              key={module.name}
              onPress={() => router.push(module.route as any)}
              className="card p-4 flex-row items-center active:bg-slate-700"
            >
              <View className={`${module.color} rounded-full w-12 h-12 items-center justify-center mr-4`}>
                <Ionicons name={module.icon as any} size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-lg">
                  {module.name}
                </Text>
                <Text className="text-slate-400 text-sm">
                  {module.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#64748b" />
            </Pressable>
          ))}
        </View>

        {/* App Info */}
        <View className="mt-8 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <View className="flex-row items-center justify-center mb-2">
            <Ionicons name="shield-checkmark" size={16} color="#22c55e" />
            <Text className="text-green-400 text-sm font-semibold ml-2">
              Offline-First Architecture
            </Text>
          </View>
          <Text className="text-slate-400 text-xs text-center">
            All data stored locally with automatic cloud backup
          </Text>
          <Text className="text-slate-500 text-xs text-center mt-1">
            Syncs every 5 minutes when online
          </Text>
        </View>

        {/* Version Info */}
        <Text className="text-slate-600 text-xs text-center mt-6">
          Zenith v1.0.0 
        </Text>
      </View>
    </ScrollView>
  );
}