// app/(tabs)/habits.tsx - INLINE STYLES VERSION
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRunningHabitTimers, useCompletedHabitLogs } from '@/src/database/hooks/useDatabase';
import { stopHabitTimer } from '@/src/database/actions/habitActions';
import { formatDurationHMS } from '@/src/utils/formatters';
import { getRelativeTime } from '@/src/utils/dateHelpers';
import { getHabitConfig } from '@/src/lib/constants';
import FloatingActionButton from '@/src/components/common/FloatingActionButton';
import EmptyState from '@/src/components/common/EmptyState';
import Button from '@/src/components/common/Button';
import type { HabitCategory } from '@/src/types/database.types';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export default function HabitsScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const runningTimers = useRunningHabitTimers();
  const [elapsedTimes, setElapsedTimes] = useState<Record<string, number>>({});
  const [refreshing, setRefreshing] = useState(false);
  const completedLogs = useCompletedHabitLogs();
  const recentLogs = completedLogs.slice(0, 5);

  useEffect(() => {
    const interval = setInterval(() => {
      const newElapsedTimes: Record<string, number> = {};
      runningTimers.forEach((timer) => {
        const elapsed = Math.floor((Date.now() - timer.startedAt.getTime()) / 1000);
        newElapsedTimes[timer.id] = elapsed;
      });
      setElapsedTimes(newElapsedTimes);
    }, 1000);

    return () => clearInterval(interval);
  }, [runningTimers]);

  const handleStopTimer = async (timerId: string) => {
    try {
      await stopHabitTimer(timerId);
    } catch (error) {
      console.error('Failed to stop timer:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38bdf8" />
        }
      >
        <View style={{ padding: 24 }}>
          {/* Header */}
          <View style={{ marginBottom: 24, marginTop: 16 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 8 }}>
              Habit Tracker
            </Text>
          </View>

          {/* Active Timers Section */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 8, height: 8, backgroundColor: '#22c55e', borderRadius: 4, marginRight: 8 }} />
                <Text style={{ fontSize: 20, fontWeight: '600', color: colors.textPrimary }}>
                  Active Timers
                </Text>
              </View>
              <View style={{ backgroundColor: '#22c55e20', borderWidth: 1, borderColor: '#22c55e80', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
                <Text style={{ color: '#22c55e', fontWeight: 'bold', fontSize: 14 }}>{runningTimers.length}</Text>
              </View>
            </View>

            {runningTimers.length === 0 ? (
              <EmptyState
                icon="hourglass-outline"
                title="No Active Timers"
                description="Start tracking your activities to see them here"
                action={
                  <Button
                    onPress={() => router.push('/habit/start')}
                    title="Start Timer"
                    icon="add"
                    variant="primary"
                  />
                }
              />
            ) : (
              <View style={{ gap: 12 }}>
                {runningTimers.map((timer) => {
                  const config = getHabitConfig(timer.category as HabitCategory);
                  
                  return (
                    <View
                      key={timer.id}
                      style={{
                        backgroundColor: colors.bgSurface,
                        borderWidth: 2,
                        borderColor: colors.moduleHabits,
                        borderRadius: 16,
                        padding: 20
                      }}
                    >
                      {/* Active Indicator */}
                      <View style={{ position: 'absolute', top: 16, right: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: '#22c55e20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                        <View style={{ width: 6, height: 6, backgroundColor: '#22c55e', borderRadius: 3, marginRight: 6 }} />
                        <Text style={{ color: '#22c55e', fontSize: 12, fontWeight: '600' }}>ACTIVE</Text>
                      </View>

                      {/* Header */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <View style={{ backgroundColor: config.color, borderRadius: 24, width: 48, height: 48, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                          <Ionicons name={config.icon as any} size={24} color="white" />
                        </View>
                        <View style={{ flex: 1, paddingRight: 80 }}>
                          <Text style={{ color: colors.textTertiary, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                            {timer.category}
                          </Text>
                          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: 'bold' }}>
                            {timer.activity}
                          </Text>
                        </View>
                      </View>

                      {/* Timer Display */}
                      <View style={{ backgroundColor: colors.bgSurfaceHover, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#0ea5e950' }}>
                        <Text style={{ color: '#0ea5e9', fontSize: 36, fontFamily: 'monospace', fontWeight: 'bold', textAlign: 'center' }}>
                          {formatDurationHMS(elapsedTimes[timer.id] || 0)}
                        </Text>
                        <Text style={{ color: colors.textTertiary, fontSize: 12, textAlign: 'center', marginTop: 4 }}>
                          Started {getRelativeTime(timer.startedAt)}
                        </Text>
                      </View>

                      {/* Notes */}
                      {timer.notes && (
                        <View style={{ backgroundColor: colors.bgSurfaceHover, borderRadius: 8, padding: 12, marginBottom: 12 }}>
                          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                            {timer.notes}
                          </Text>
                        </View>
                      )}

                      {/* Actions */}
                      <Button
                        onPress={() => handleStopTimer(timer.id)}
                        title="Stop Timer"
                        icon="stop"
                        variant="danger"
                        fullWidth
                      />
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Recent History Section */}
          {recentLogs.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <Text style={{ fontSize: 20, fontWeight: '600', color: colors.textPrimary }}>
                  Recent Sessions
                </Text>
                <Pressable onPress={() => router.push('/habit/history')}>
                  <Text style={{ color: '#0ea5e9', fontSize: 14, fontWeight: '600' }}>View All →</Text>
                </Pressable>
              </View>

              <View style={{ gap: 8 }}>
                {recentLogs.map((log) => {
                  const config = getHabitConfig(log.category as HabitCategory);

                  return (
                    <Pressable
                      key={log.id}
                      onPress={() => router.push(`/habit/${log.id}`)}
                      style={{
                        backgroundColor: colors.bgSurface,
                        borderWidth: 1,
                        borderColor: colors.borderSurface,
                        borderRadius: 16,
                        padding: 16
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ backgroundColor: config.color, borderRadius: 20, width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                          <Ionicons name={config.icon as any} size={20} color="white" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 16 }}>
                            {log.activity}
                          </Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                            <View style={{ backgroundColor: config.bgColor, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                              <Text style={{ color: config.textColor, fontSize: 12, fontWeight: '500' }}>
                                {log.category}
                              </Text>
                            </View>
                            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                              {formatDurationHMS(log.duration || 0)}
                            </Text>
                            <Text style={{ color: colors.textTertiary, fontSize: 12 }}>•</Text>
                            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                              {getRelativeTime(log.startedAt)}
                            </Text>
                          </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#64748b" />
                      </View>
                    </Pressable>
                  );
                })}
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
              Today's Activity
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4 }}>Sessions</Text>
                <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: 'bold' }}>
                  {runningTimers.length}
                </Text>
              </View>
              <View style={{ width: 1, backgroundColor: colors.borderSurface }} />
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4 }}>Categories</Text>
                <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: 'bold' }}>
                  {new Set(runningTimers.map((t) => t.category)).size}
                </Text>
              </View>
              <View style={{ width: 1, backgroundColor: colors.borderSurface }} />
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4 }}>Total Time</Text>
                <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: 'bold' }}>
                  {Math.floor(Object.values(elapsedTimes).reduce((a, b) => a + b, 0) / 60)}m
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton
        onPress={() => router.push('/habit/start')}
        icon="add"
        color="bg-purple-600"
      />
    </SafeAreaView>
  );
}