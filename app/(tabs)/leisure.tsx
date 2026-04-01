// app/(tabs)/leisure.tsx - COMPACT VERSION
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRunningLeisureTimers, useCompletedLeisureLogs } from '@/src/database/hooks/useDatabase';
import { startLeisureTimer } from '@/src/database/actions/leisureActions';
import FloatingActionButton from '@/src/components/common/FloatingActionButton';
import EmptyState from '@/src/components/common/EmptyState';
import Button from '@/src/components/common/Button';
import LeisureTimerCard from '@/src/components/leisure/LeisureTimerCard';
import CompletedLeisureCard from '@/src/components/leisure/CompletedLeisureCard';
import { groupByDate } from '@/src/utils/dateHelpers';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Strings } from '@/src/constants/strings';

export default function LeisureScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const runningTimers = useRunningLeisureTimers();
  const completedSessions = useCompletedLeisureLogs(20);
  const [refreshing, setRefreshing] = useState(false);
  const refreshTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const groupedSessions = useMemo(
    () => groupByDate(completedSessions, (s) => s.startedAt),
    [completedSessions]
  );

  const handleStartTimer = async () => {
    try {
      await startLeisureTimer();
    } catch (error) {
      if (__DEV__) console.error('Failed to start timer:', error);
    }
  };

  const handleStopTimer = async (timerId: string) => {
    const timer = runningTimers.find(t => t.id === timerId);
    if (!timer) return;

    const durationSeconds = Math.floor((Date.now() - timer.startedAt.getTime()) / 1000);
    router.push(`/leisure/complete?id=${timerId}&duration=${durationSeconds}`);
  };

  useEffect(() => {
    return () => { if (refreshTimeout.current) clearTimeout(refreshTimeout.current); };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    refreshTimeout.current = setTimeout(() => setRefreshing(false), 500);
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.moduleLeisure} />
        }
      >
        <View style={{ padding: 20 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, marginTop: 12 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.textPrimary }}>
              {Strings.leisure.screenTitle}
            </Text>
            <Pressable
              onPress={() => router.push('/leisure/analytics')}
              style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.borderSurface,
                borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, gap: 4,
              }}
            >
              <Ionicons name="bar-chart" size={16} color={colors.moduleLeisure} />
              <Text style={{ color: colors.moduleLeisure, fontSize: 13, fontWeight: '600' }}>Analytics</Text>
            </Pressable>
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
                    backgroundColor: colors.moduleLeisure,
                    borderRadius: 3,
                    marginRight: 6
                  }} />
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>
                    {Strings.leisure.activeSession}
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
              {Strings.leisure.todayStats}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 11, marginBottom: 4, fontWeight: '500' }}>
                  {Strings.leisure.statsSessions}
                </Text>
                <Text style={{ color: colors.textPrimary, fontSize: 22, fontWeight: 'bold' }}>
                  {todaysSessions.length}
                </Text>
              </View>
              <View style={{ width: 1, backgroundColor: colors.borderSurface }} />
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 11, marginBottom: 4, fontWeight: '500' }}>
                  {Strings.leisure.statsTotalTime}
                </Text>
                <Text style={{ color: colors.textPrimary, fontSize: 22, fontWeight: 'bold' }}>
                  {Math.floor(todaysSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60)}m
                </Text>
              </View>
              <View style={{ width: 1, backgroundColor: colors.borderSurface }} />
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 11, marginBottom: 4, fontWeight: '500' }}>
                  {Strings.leisure.statsAllTime}
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
                {Strings.leisure.recentSessions}
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
                title={Strings.leisure.emptyTitle}
                description={Strings.leisure.emptyDesc}
                action={
                  <Button
                    onPress={handleStartTimer}
                    title={Strings.leisure.startSession}
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
