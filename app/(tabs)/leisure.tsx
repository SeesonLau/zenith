// app/(tabs)/leisure.tsx - COMPACT VERSION
import React, { useState, useMemo } from 'react';
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
import { formatDate } from '@/src/utils/dateHelpers';
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

  // Group completed sessions by date (like finance transactions)
  const groupedSessions = useMemo(() => {
    const groups: Record<string, typeof completedSessions> = {};

    completedSessions.forEach((session) => {
      const dateKey = formatDate(session.startedAt, 'short');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(session);
    });

    return Object.entries(groups).sort(
      ([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime()
    );
  }, [completedSessions]);

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
        <View style={{ padding: 20 }}>
          {/* Header */}
          <View style={{ marginBottom: 16, marginTop: 12 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 4 }}>
              Leisure Tracker
            </Text>
          </View>

          {/* Active Sessions */}
          {runningTimers.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                marginBottom: 12 
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ 
                    width: 6, 
                    height: 6, 
                    backgroundColor: '#ec4899', 
                    borderRadius: 3, 
                    marginRight: 6 
                  }} />
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>
                    Active Session
                  </Text>
                </View>
                <View style={{
                  backgroundColor: colors.bgSurface,
                  borderWidth: 1,
                  borderColor: colors.borderSurface,
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                  borderRadius: 10
                }}>
                  <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 12 }}>
                    {runningTimers.length}
                  </Text>
                </View>
              </View>

              <View style={{ gap: 10 }}>
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
            borderRadius: 14,
            padding: 16,
            marginBottom: 16
          }}>
            <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 15, marginBottom: 12 }}>
              Today's Stats
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 11, marginBottom: 4, fontWeight: '500' }}>
                  Sessions
                </Text>
                <Text style={{ color: colors.textPrimary, fontSize: 22, fontWeight: 'bold' }}>
                  {todaysSessions.length}
                </Text>
              </View>
              <View style={{ width: 1, backgroundColor: colors.borderSurface }} />
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 11, marginBottom: 4, fontWeight: '500' }}>
                  Total Time
                </Text>
                <Text style={{ color: colors.textPrimary, fontSize: 22, fontWeight: 'bold' }}>
                  {Math.floor(todaysSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60)}m
                </Text>
              </View>
              <View style={{ width: 1, backgroundColor: colors.borderSurface }} />
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 11, marginBottom: 4, fontWeight: '500' }}>
                  All Time
                </Text>
                <Text style={{ color: colors.textPrimary, fontSize: 22, fontWeight: 'bold' }}>
                  {Math.floor(totalDuration / 3600)}h
                </Text>
              </View>
            </View>
          </View>

          {/* Recent Sessions - Grouped by Date */}
          <View style={{ marginBottom: 20 }}>
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: 12 
            }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>
                Recent Sessions
              </Text>
              <View style={{
                backgroundColor: colors.bgSurface,
                borderWidth: 1,
                borderColor: colors.borderSurface,
                paddingHorizontal: 10,
                paddingVertical: 3,
                borderRadius: 10
              }}>
                <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 12 }}>
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
              <View style={{ gap: 12 }}>
                {groupedSessions.map(([date, dateSessions]) => (
                  <View key={date}>
                    <Text style={{
                      color: colors.textTertiary,
                      fontSize: 11,
                      fontWeight: '600',
                      marginBottom: 6,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5
                    }}>
                      {date}
                    </Text>
                    <View style={{ gap: 6 }}>
                      {dateSessions.map((session) => (
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
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Bottom Padding for FAB */}
          <View style={{ height: 100 }} />
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