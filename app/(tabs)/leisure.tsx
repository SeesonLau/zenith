// app/(tabs)/leisure.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useRunningLeisureTimers,
  useCompletedLeisureLogs,
  useAllLeisureLogs,
} from '@/src/database/hooks/useDatabase';
import { startLeisureTimer, deleteLeisureLog } from '@/src/database/actions/leisureActions';
import FloatingActionButton from '@/src/components/common/FloatingActionButton';
import EmptyState from '@/src/components/common/EmptyState';
import Button from '@/src/components/common/Button';
import LeisureTimerCard from '@/src/components/leisure/LeisureTimerCard';
import CompletedLeisureCard from '@/src/components/leisure/CompletedLeisureCard';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Strings } from '@/src/constants/strings';
import { formatDuration } from '@/src/utils/formatters';

export default function LeisureScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const runningTimers = useRunningLeisureTimers();
  const completedSessions = useCompletedLeisureLogs(20);
  const allLogs = useAllLeisureLogs();
  const [refreshing, setRefreshing] = useState(false);
  const refreshTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (refreshTimeout.current) clearTimeout(refreshTimeout.current); };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    refreshTimeout.current = setTimeout(() => setRefreshing(false), 500);
  };

  const handleStartTimer = async () => {
    try {
      await startLeisureTimer();
    } catch (error) {
      if (__DEV__) console.error('Failed to start timer:', error);
    }
  };

  const handleEditSession = (sessionId: string) => {
    router.push(`/leisure/edit?id=${sessionId}`);
  };

  const handleDeleteSession = (sessionId: string) => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLeisureLog(sessionId);
            } catch (error) {
              if (__DEV__) console.error('Failed to delete session:', error);
            }
          },
        },
      ]
    );
  };

  const handleStopTimer = (timerId: string) => {
    const timer = runningTimers.find(t => t.id === timerId);
    if (!timer) return;
    const durationSeconds = Math.floor((Date.now() - timer.startedAt.getTime()) / 1000);
    router.push(`/leisure/complete?id=${timerId}&duration=${durationSeconds}`);
  };

  // Today's sessions from the recent 20
  const todaysSessions = useMemo(() => {
    const today = new Date();
    return completedSessions.filter(s =>
      s.startedAt.getDate() === today.getDate() &&
      s.startedAt.getMonth() === today.getMonth() &&
      s.startedAt.getFullYear() === today.getFullYear()
    );
  }, [completedSessions]);

  const todaySeconds = useMemo(
    () => todaysSessions.reduce((sum, s) => sum + (s.duration ?? 0), 0),
    [todaysSessions]
  );

  const todayAvgSeconds = todaysSessions.length > 0
    ? Math.round(todaySeconds / todaysSessions.length)
    : 0;

  const allTimeSeconds = useMemo(
    () => allLogs.reduce((sum, s) => sum + (s.duration ?? 0), 0),
    [allLogs]
  );

  // Group recent sessions by ISO date key (newest first)
  const groupedSessions = useMemo(() => {
    const grouped: Record<string, typeof completedSessions> = {};
    completedSessions.forEach(s => {
      const d = s.startedAt;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(s);
    });
    return Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a));
  }, [completedSessions]);

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
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: 16, marginTop: 12,
          }}>
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
                flexDirection: 'row', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: 10,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{ width: 6, height: 6, backgroundColor: colors.success, borderRadius: 3 }} />
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textPrimary }}>
                    Active Sessions
                  </Text>
                </View>
                <View style={{
                  backgroundColor: colors.success + '20', borderWidth: 1, borderColor: colors.success + '50',
                  paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8,
                }}>
                  <Text style={{ color: colors.success, fontWeight: '700', fontSize: 11 }}>
                    {runningTimers.length}
                  </Text>
                </View>
              </View>
              <View style={{ gap: 10 }}>
                {runningTimers.map(timer => (
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

          {/* Today Stats — analytics hero style */}
          <View style={{
            backgroundColor: colors.bgSurface,
            borderWidth: 1, borderColor: colors.borderSurface,
            borderLeftWidth: 4, borderLeftColor: colors.moduleLeisure,
            borderRadius: 14, padding: 18, marginBottom: 16,
          }}>
            <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '500', marginBottom: 4 }}>
              Today's Activity
            </Text>
            <Text style={{ color: colors.moduleLeisure, fontSize: 30, fontWeight: 'bold', marginBottom: 12 }}>
              {todaySeconds > 0 ? formatDuration(todaySeconds) : '—'}
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{
                flex: 1, backgroundColor: colors.moduleLeisure + '18',
                borderWidth: 1, borderColor: colors.moduleLeisure + '40',
                borderRadius: 10, padding: 10,
              }}>
                <Text style={{ color: colors.textTertiary, fontSize: 10, marginBottom: 3 }}>Sessions</Text>
                <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: 'bold' }}>
                  {todaysSessions.length}
                </Text>
              </View>
              <View style={{
                flex: 1, backgroundColor: colors.moduleLeisure + '18',
                borderWidth: 1, borderColor: colors.moduleLeisure + '40',
                borderRadius: 10, padding: 10,
              }}>
                <Text style={{ color: colors.textTertiary, fontSize: 10, marginBottom: 3 }}>Avg Session</Text>
                <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: 'bold' }}>
                  {todayAvgSeconds > 0 ? formatDuration(todayAvgSeconds) : '—'}
                </Text>
              </View>
              <View style={{
                flex: 1, backgroundColor: colors.moduleLeisure + '18',
                borderWidth: 1, borderColor: colors.moduleLeisure + '40',
                borderRadius: 10, padding: 10,
              }}>
                <Text style={{ color: colors.textTertiary, fontSize: 10, marginBottom: 3 }}>All Time</Text>
                <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: 'bold' }}>
                  {allTimeSeconds > 0 ? formatDuration(allTimeSeconds) : '—'}
                </Text>
              </View>
            </View>
          </View>

          {/* Recent Sessions */}
          <View style={{ marginBottom: 20 }}>
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: 10,
            }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textPrimary }}>
                Recent Sessions
              </Text>
              <View style={{
                backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.borderSurface,
                paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8,
              }}>
                <Text style={{ color: colors.textSecondary, fontWeight: '600', fontSize: 11 }}>
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
              <View style={{ gap: 14 }}>
                {groupedSessions.map(([dateKey, daySessions]) => {
                  const dayDate = new Date(dateKey + 'T12:00:00');
                  const dayLabel = dayDate.toLocaleDateString('en-US', {
                    weekday: 'short', month: 'short', day: 'numeric',
                  });
                  const dayTotal = daySessions.reduce((s, l) => s + (l.duration ?? 0), 0);
                  return (
                    <View key={dateKey}>
                      <View style={{
                        flexDirection: 'row', alignItems: 'center',
                        justifyContent: 'space-between', marginBottom: 6,
                      }}>
                        <Text style={{
                          color: colors.textTertiary, fontSize: 11, fontWeight: '600',
                          textTransform: 'uppercase', letterSpacing: 0.5,
                        }}>
                          {dayLabel}
                        </Text>
                        <Text style={{ color: colors.textTertiary, fontSize: 11 }}>
                          {formatDuration(dayTotal)}
                        </Text>
                      </View>
                      <View style={{ gap: 6 }}>
                        {daySessions.map(session => (
                          <CompletedLeisureCard
                            key={session.id}
                            id={session.id}
                            type={session.type}
                            title={session.title}
                            startedAt={session.startedAt}
                            duration={session.duration ?? 0}
                            notes={session.notes}
                            onPress={() => router.push(`/leisure/${session.id}`)}
                            onEdit={() => handleEditSession(session.id)}
                            onDelete={() => handleDeleteSession(session.id)}
                          />
                        ))}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      <FloatingActionButton
        onPress={handleStartTimer}
        icon="play"
        color="bg-pink-600"
      />
    </SafeAreaView>
  );
}
