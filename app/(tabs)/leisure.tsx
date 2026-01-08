// app/(tabs)/leisure.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRunningLeisureTimers } from '@/src/database/hooks/useDatabase';
import { startLeisureTimer } from '@/src/database/actions/leisureActions';
import { database } from '@/src/database';
import { Q } from '@nozbe/watermelondb';
import type LeisureLog from '@/src/database/models/LeisureLog';
import FloatingActionButton from '@/src/components/common/FloatingActionButton';
import EmptyState from '@/src/components/common/EmptyState';
import Button from '@/src/components/common/Button';
import LeisureTimerCard from '@/src/components/leisure/LeisureTimerCard';
import CompletedLeisureCard from '@/src/components/leisure/CompletedLeisureCard';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export default function LeisureScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const runningTimers = useRunningLeisureTimers();
  const [refreshing, setRefreshing] = useState(false);
  const [completedSessions, setCompletedSessions] = useState<LeisureLog[]>([]);

  React.useEffect(() => {
    const subscription = database
      .get<LeisureLog>('leisure_logs')
      .query(
        Q.where('ended_at', Q.notEq(null)),
        Q.sortBy('started_at', Q.desc),
        Q.take(20)
      )
      .observe()
      .subscribe(setCompletedSessions);

    return () => subscription.unsubscribe();
  }, []);

  const handleStartTimer = async () => {
    try {
      await startLeisureTimer();
    } catch (error) {
      console.error('Failed to start timer:', error);
    }
  };

  const handleStopTimer = async (timerId: string) => {
    try {
      const timer = runningTimers.find(t => t.id === timerId);
      if (!timer) return;

      const durationSeconds = Math.floor((Date.now() - timer.startedAt.getTime()) / 1000);
      router.push(`/leisure/complete?id=${timerId}&duration=${durationSeconds}`);
    } catch (error) {
      console.error('Failed to navigate to complete:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  const totalDuration = completedSessions.reduce((sum, log) => sum + (log.duration || 0), 0);
  const todaysSessions = completedSessions.filter((log) => {
    const today = new Date();
    return (
      log.startedAt.getDate() === today.getDate() &&
      log.startedAt.getMonth() === today.getMonth() &&
      log.startedAt.getFullYear() === today.getFullYear()
    );
  });

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ec4899" />
        }
      >
        <View style={{ padding: 24 }}>
          {/* Header */}
          <View style={{ marginBottom: 24, marginTop: 16 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 8 }}>
              Leisure Tracker
            </Text>
          </View>

          {/* Active Sessions */}
          {runningTimers.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 8, height: 8, backgroundColor: '#ec4899', borderRadius: 4, marginRight: 8 }} />
                  <Text style={{ fontSize: 20, fontWeight: '600', color: colors.textPrimary }}>
                    Active Session
                  </Text>
                </View>
                <View style={{ backgroundColor: '#ec489920', borderWidth: 1, borderColor: '#ec489980', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
                  <Text style={{ color: '#ec4899', fontWeight: 'bold', fontSize: 14 }}>{runningTimers.length}</Text>
                </View>
              </View>

              <View style={{ gap: 12 }}>
                {runningTimers.map((timer) => (
                  <LeisureTimerCard
                    key={timer.id}
                    id={timer.id}
                    type={timer.type}
                    title={timer.title}
                    notes={timer.notes}
                    startedAt={timer.startedAt}
                    onStop={handleStopTimer}
                    onPress={() => router.push(`/leisure/${timer.id}`)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Quick Stats */}
          <View style={{
            backgroundColor: colors.bgSurface,
            borderWidth: 1,
            borderColor: colors.borderSurface,
            borderRadius: 16,
            padding: 20,
            marginBottom: 24
          }}>
            <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 18, marginBottom: 12 }}>
              Today's Stats
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4, fontWeight: '500' }}>
                  Sessions
                </Text>
                <Text style={{ color: colors.textPrimary, fontSize: 28, fontWeight: 'bold' }}>
                  {todaysSessions.length}
                </Text>
              </View>
              <View style={{ width: 1, backgroundColor: colors.borderSurface }} />
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4, fontWeight: '500' }}>
                  Total Time
                </Text>
                <Text style={{ color: colors.textPrimary, fontSize: 28, fontWeight: 'bold' }}>
                  {Math.floor(todaysSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60)}m
                </Text>
              </View>
              <View style={{ width: 1, backgroundColor: colors.borderSurface }} />
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4, fontWeight: '500' }}>
                  All Time
                </Text>
                <Text style={{ color: colors.textPrimary, fontSize: 28, fontWeight: 'bold' }}>
                  {Math.floor(totalDuration / 3600)}h
                </Text>
              </View>
            </View>
          </View>

          {/* Recent Sessions */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={{ fontSize: 20, fontWeight: '600', color: colors.textPrimary }}>
                Recent Sessions
              </Text>
              <View style={{
                backgroundColor: colors.bgSurface,
                borderWidth: 1,
                borderColor: colors.borderSurface,
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 12
              }}>
                <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 14 }}>
                  {completedSessions.length}
                </Text>
              </View>
            </View>

            {completedSessions.length === 0 && runningTimers.length === 0 ? (
              <EmptyState
                icon="film-outline"
                title="No Sessions Yet"
                description="Start tracking your leisure time"
                action={
                  <Button
                    onPress={handleStartTimer}
                    title="Start Session"
                    icon="play"
                    variant="primary"
                  />
                }
              />
            ) : (
              <View style={{ gap: 8 }}>
                {completedSessions.map((session) => (
                  <CompletedLeisureCard
                    key={session.id}
                    id={session.id}
                    type={session.type}
                    title={session.title}
                    startedAt={session.startedAt}
                    duration={session.duration || 0}
                    notes={session.notes}
                    onPress={() => router.push(`/leisure/${session.id}`)}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton
        onPress={handleStartTimer}
        icon="play"
        color="bg-pink-600"
      />
    </SafeAreaView>
  );
}