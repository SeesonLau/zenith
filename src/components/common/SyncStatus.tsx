// src/components/common/SyncStatus.tsx (WITH DEBUG FEATURES)
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  performSync,
  forceFullSync,
  getSyncStatus,
  getPendingChangesCount,
} from '@/src/database/sync/syncManager';
import { database } from '@/src/database';
import { supabase, getDeviceId } from '@/src/lib/supabase';

export default function SyncStatus() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [syncResult, setSyncResult] = useState<string>('');

  useEffect(() => {
    updateStatus();
    const interval = setInterval(updateStatus, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async () => {
    const status = getSyncStatus();
    setIsSyncing(status.isSyncing);
    setLastSyncedAt(status.lastSyncedAt);

    const pending = await getPendingChangesCount();
    setPendingChanges(pending);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncResult('Syncing...');

    const result = await performSync();

    if (result.success) {
      const pulled = result.changes?.pulled;
      const pushed = result.changes?.pushed;
      const message = `✅ Synced!\n↓ ${pulled?.created || 0} new, ${pulled?.updated || 0} updated, ${pulled?.deleted || 0} deleted\n↑ ${pushed?.created || 0} new, ${pushed?.updated || 0} updated, ${pushed?.deleted || 0} deleted`;
      setSyncResult(message);
      Alert.alert('Sync Complete', message);
    } else {
      setSyncResult(`❌ ${result.message}`);
      Alert.alert('Sync Failed', result.message || 'Unknown error');
    }

    await updateStatus();

    // Clear result after 5s
    setTimeout(() => setSyncResult(''), 5000);
  };

  const handleForceSync = async () => {
    Alert.alert(
      'Force Full Sync',
      'This will pull all data from the server. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Force Sync',
          onPress: async () => {
            setIsSyncing(true);
            setSyncResult('Force syncing...');

            const result = await forceFullSync();

            if (result.success) {
              const pulled = result.changes?.pulled;
              const message = `✅ Full sync complete!\n↓ ${pulled?.created || 0} new records downloaded`;
              setSyncResult(message);
              Alert.alert('Success', message);
            } else {
              setSyncResult(`❌ ${result.message}`);
              Alert.alert('Failed', result.message || 'Unknown error');
            }

            await updateStatus();
            setTimeout(() => setSyncResult(''), 5000);
          },
        },
      ]
    );
  };

  // DEBUG: Test Supabase Pull
  const testSupabasePull = async () => {
    try {
      const deviceId = await getDeviceId();
      
      console.log('🧪 Testing Supabase pull_changes...');
      console.log('📱 Device ID:', deviceId);
      
      const { data, error } = await supabase.rpc('pull_changes', {
        last_pulled_at: 0,  // Pull everything
        schema_version: 5,
        migration: null,
        device_id_param: deviceId,
      });

      if (error) {
        console.error('❌ Supabase Error:', error);
        Alert.alert('Error', JSON.stringify(error, null, 2));
        return;
      }

      console.log('✅ Raw data received from Supabase:');
      console.log(JSON.stringify(data, null, 2));
      
      // Count records
      const changes = data?.changes || {};
      const financeCreated = changes.finance_logs?.created || [];
      const habitCreated = changes.habit_logs?.created || [];
      const diaryCreated = changes.diary_entries?.created || [];
      const leisureCreated = changes.leisure_logs?.created || [];

      console.log('📊 Record counts:');
      console.log('  💰 Finance:', financeCreated.length);
      console.log('  ⏱️  Habits:', habitCreated.length);
      console.log('  📔 Diary:', diaryCreated.length);
      console.log('  🎮 Leisure:', leisureCreated.length);

      if (financeCreated.length > 0) {
        console.log('💰 Finance sample:', financeCreated[0]);
      }
      
      Alert.alert(
        'Test Pull Result',
        `Records from Supabase:\n\n` +
        `💰 Finance: ${financeCreated.length}\n` +
        `⏱️ Habits: ${habitCreated.length}\n` +
        `📔 Diary: ${diaryCreated.length}\n` +
        `🎮 Leisure: ${leisureCreated.length}\n\n` +
        `Check console for full data`
      );
    } catch (error) {
      console.error('❌ Test failed:', error);
      Alert.alert('Test Failed', String(error));
    }
  };

  // DEBUG: Check Local Database
  const debugCheckLocalData = async () => {
    try {
      console.log('🔍 Checking local database...');
      
      const financeLogs = await database.get('finance_logs').query().fetch();
      const habitLogs = await database.get('habit_logs').query().fetch();
      const diaryEntries = await database.get('diary_entries').query().fetch();
      const leisureLogs = await database.get('leisure_logs').query().fetch();

      console.log('📊 Local database counts:');
      console.log('  💰 Finance:', financeLogs.length);
      console.log('  ⏱️  Habits:', habitLogs.length);
      console.log('  📔 Diary:', diaryEntries.length);
      console.log('  🎮 Leisure:', leisureLogs.length);

      if (financeLogs.length > 0) {
        console.log('💰 Finance sample:');
        const sample = financeLogs[0] as any;
        console.log('  Item:', sample.item);
        console.log('  Cost:', sample.totalCost);
        console.log('  Date:', new Date(sample.transactionDate));
      }

      Alert.alert(
        'Local Database',
        `Records in local DB:\n\n` +
        `💰 Finance: ${financeLogs.length}\n` +
        `⏱️ Habits: ${habitLogs.length}\n` +
        `📔 Diary: ${diaryEntries.length}\n` +
        `🎮 Leisure: ${leisureLogs.length}`
      );
    } catch (error) {
      console.error('❌ Local check failed:', error);
      Alert.alert('Error', String(error));
    }
  };

  // DEBUG: Check Supabase Direct
  const debugCheckSupabaseData = async () => {
    try {
      console.log('☁️ Checking Supabase database...');
      
      const { data: financeLogs, error: financeError } = await supabase
        .from('finance_logs')
        .select('*')
        .limit(10);

      const { data: habitLogs, error: habitError } = await supabase
        .from('habit_logs')
        .select('*')
        .limit(10);

      const { data: diaryEntries, error: diaryError } = await supabase
        .from('diary_entries')
        .select('*')
        .limit(10);

      const { data: leisureLogs, error: leisureError } = await supabase
        .from('leisure_logs')
        .select('*')
        .limit(10);

      console.log('📊 Supabase database counts:');
      console.log('  💰 Finance:', financeLogs?.length || 0);
      console.log('  ⏱️  Habits:', habitLogs?.length || 0);
      console.log('  📔 Diary:', diaryEntries?.length || 0);
      console.log('  🎮 Leisure:', leisureLogs?.length || 0);

      if (financeLogs && financeLogs.length > 0) {
        console.log('💰 Finance sample from Supabase:');
        console.log(financeLogs[0]);
      }

      Alert.alert(
        'Supabase Database',
        `Records in Supabase:\n\n` +
        `💰 Finance: ${financeLogs?.length || 0}\n` +
        `⏱️ Habits: ${habitLogs?.length || 0}\n` +
        `📔 Diary: ${diaryEntries?.length || 0}\n` +
        `🎮 Leisure: ${leisureLogs?.length || 0}\n\n` +
        `Check console for sample data`
      );
    } catch (error) {
      console.error('❌ Supabase check failed:', error);
      Alert.alert('Error', String(error));
    }
  };

  return (
    <View className="card p-4">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Ionicons
            name="cloud"
            size={20}
            color={isSyncing ? '#0ea5e9' : pendingChanges > 0 ? '#f59e0b' : '#22c55e'}
          />
          <Text className="text-white font-semibold ml-2">Sync Status</Text>
        </View>
        {isSyncing && <ActivityIndicator size="small" color="#0ea5e9" />}
      </View>

      {/* Status Info */}
      <View className="space-y-2 mb-3">
        <View className="flex-row justify-between">
          <Text className="text-slate-400 text-sm">Last synced:</Text>
          <Text className="text-slate-300 text-sm">
            {lastSyncedAt ? lastSyncedAt.toLocaleTimeString() : 'Never'}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-slate-400 text-sm">Pending changes:</Text>
          <Text
            className={`text-sm font-semibold ${
              pendingChanges > 0 ? 'text-amber-400' : 'text-green-400'
            }`}
          >
            {pendingChanges}
          </Text>
        </View>
      </View>

      {/* Sync Result */}
      {syncResult && (
        <View className="bg-slate-900/50 rounded-lg p-2 mb-3">
          <Text className="text-slate-300 text-xs">{syncResult}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View className="flex-row gap-2 mb-3">
        <Pressable
          onPress={handleSync}
          disabled={isSyncing}
          className={`flex-1 bg-sky-500 rounded-lg p-3 flex-row items-center justify-center ${
            isSyncing ? 'opacity-50' : ''
          }`}
        >
          <Ionicons name="sync" size={16} color="white" />
          <Text className="text-white font-semibold ml-2">Sync</Text>
        </Pressable>

        <Pressable
          onPress={handleForceSync}
          disabled={isSyncing}
          className={`bg-purple-600 rounded-lg p-3 ${isSyncing ? 'opacity-50' : ''}`}
        >
          <Ionicons name="cloud-download" size={16} color="white" />
        </Pressable>
      </View>

      {/* Debug Buttons */}
      <View className="pt-3 border-t border-slate-700">
        <Text className="text-slate-400 text-xs font-semibold mb-2">Debug Tools</Text>
        <View className="flex-row gap-2 mb-2">
          <Pressable
            onPress={testSupabasePull}
            className="flex-1 bg-amber-600 rounded-lg p-2"
          >
            <Text className="text-white text-xs text-center font-semibold">
              Test Pull
            </Text>
          </Pressable>
          <Pressable
            onPress={debugCheckLocalData}
            className="flex-1 bg-blue-600 rounded-lg p-2"
          >
            <Text className="text-white text-xs text-center font-semibold">
              Check Local
            </Text>
          </Pressable>
        </View>
        <Pressable
          onPress={debugCheckSupabaseData}
          className="bg-green-600 rounded-lg p-2"
        >
          <Text className="text-white text-xs text-center font-semibold">
            Check Supabase
          </Text>
        </Pressable>
      </View>

      {/* Legend */}
      <View className="mt-3 pt-3 border-t border-slate-700">
        <Text className="text-slate-500 text-xs">🔵 Sync - Push & pull changes</Text>
        <Text className="text-slate-500 text-xs">🟣 Pull All - Download all data</Text>
      </View>
    </View>
  );
}