// src/components/common/SyncStatus.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/hooks/useThemeColors'; // ✅ Theme Hook
import {
  performSync,
  forceFullSync,
  getSyncStatus,
  getPendingChangesCount,
} from '@/src/database/sync/syncManager';
import { database } from '@/src/database';
import { supabase, getDeviceId } from '@/src/lib/supabase';

export default function SyncStatus() {
  const colors = useThemeColors(); // ✅ Get current theme colors

  // --- STATE MANAGEMENT ---
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

  // --- LOGIC HANDLERS ---

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

  // --- DEBUG TOOLS ---

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

  const debugCheckSupabaseData = async () => {
    try {
      console.log('☁️ Checking Supabase database...');
      
      const { data: financeLogs } = await supabase.from('finance_logs').select('*').limit(10);
      const { data: habitLogs } = await supabase.from('habit_logs').select('*').limit(10);
      const { data: diaryEntries } = await supabase.from('diary_entries').select('*').limit(10);
      const { data: leisureLogs } = await supabase.from('leisure_logs').select('*').limit(10);

      console.log('📊 Supabase database counts (Limit 10):');
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
        `Records in Supabase (limit 10):\n\n` +
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

  // --- RENDER ---

  return (
    <View style={{
      backgroundColor: colors.bgSurface,
      borderWidth: 1,
      borderColor: colors.borderSurface,
      borderRadius: 16,
      padding: 16
    }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons
            name="cloud"
            size={20}
            color={isSyncing ? '#0ea5e9' : pendingChanges > 0 ? '#f59e0b' : '#22c55e'}
          />
          <Text style={{ color: colors.textPrimary, fontWeight: '600', marginLeft: 8 }}>
            Sync Status
          </Text>
        </View>
        {isSyncing && <ActivityIndicator size="small" color="#0ea5e9" />}
      </View>

      {/* Status Info */}
      <View style={{ gap: 8, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Last synced:</Text>
          <Text style={{ color: colors.textPrimary, fontSize: 14 }}>
            {lastSyncedAt ? lastSyncedAt.toLocaleTimeString() : 'Never'}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Pending changes:</Text>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: pendingChanges > 0 ? '#f59e0b' : '#22c55e'
          }}>
            {pendingChanges}
          </Text>
        </View>
      </View>

      {/* Sync Result Output Box */}
      {syncResult ? (
        <View style={{
          backgroundColor: '#0f172a', // Keep dark for terminal look, or use colors.bgCard
          borderRadius: 8,
          padding: 8,
          marginBottom: 12
        }}>
          <Text style={{ color: '#cbd5e1', fontSize: 12 }}>{syncResult}</Text>
        </View>
      ) : null}

      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        <Pressable
          onPress={handleSync}
          disabled={isSyncing}
          style={{
            flex: 1,
            backgroundColor: '#0ea5e9', // Sky blue
            borderRadius: 8,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isSyncing ? 0.5 : 1
          }}
        >
          <Ionicons name="sync" size={16} color="white" />
          <Text style={{ color: 'white', fontWeight: '600', marginLeft: 8 }}>Sync</Text>
        </Pressable>

        <Pressable
          onPress={handleForceSync}
          disabled={isSyncing}
          style={{
            backgroundColor: '#9333ea', // Purple
            borderRadius: 8,
            padding: 12,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isSyncing ? 0.5 : 1
          }}
        >
          <Ionicons name="cloud-download" size={16} color="white" />
        </Pressable>
      </View>

      {/* Debug Tools Section */}
      <View style={{ paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.borderSurface }}>
        <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 8 }}>
          Debug Tools
        </Text>
        
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
          <Pressable
            onPress={testSupabasePull}
            style={{
              flex: 1,
              backgroundColor: '#d97706', // Amber
              borderRadius: 8,
              padding: 8,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>Test Pull</Text>
          </Pressable>

          <Pressable
            onPress={debugCheckLocalData}
            style={{
              flex: 1,
              backgroundColor: '#2563eb', // Blue
              borderRadius: 8,
              padding: 8,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>Check Local</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={debugCheckSupabaseData}
          style={{
            backgroundColor: '#16a34a', // Green
            borderRadius: 8,
            padding: 8,
            alignItems: 'center'
          }}
        >
          <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>Check Supabase</Text>
        </Pressable>
      </View>

      {/* Legend */}
      <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.borderSurface }}>
        <Text style={{ color: colors.textTertiary, fontSize: 12 }}>🔵 Sync - Push & pull changes</Text>
        <Text style={{ color: colors.textTertiary, fontSize: 12 }}>🟣 Pull All - Download all data</Text>
      </View>
    </View>
  );
}