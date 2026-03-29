// app/(tabs)/habits.tsx - COMPACT VERSION
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRunningHabitTimers, useCompletedHabitLogs } from '@/src/database/hooks/useDatabase';
import { stopHabitTimer } from '@/src/database/actions/habitActions';
import { formatDurationHMS } from '@/src/utils/formatters';
import { groupByDate } from '@/src/utils/dateHelpers';
import { getHabitConfig } from '@/src/lib/constants';
import FloatingActionButton from '@/src/components/common/FloatingActionButton';
import EmptyState from '@/src/components/common/EmptyState';
import Button from '@/src/components/common/Button';
import type { HabitCategory } from '@/src/types/database.types';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Strings } from '@/src/constants/strings';

export default function HabitsScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const runningTimers = useRunningHabitTimers();
  const [elapsedTimes, setElapsedTimes] = useState<Record<string, number>>({});
  const [refreshing, setRefreshing] = useState(false);
  const refreshTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completedLogs = useCompletedHabitLogs();

  useEffect(() => {
    const interval = setInterval(() => {
      const newElapsedTimes: Record<string, number> = {};
      runningTimers.forEach((timer) => {
        newElapsedTimes[timer.id] = Math.floor((Date.now() - timer.startedAt.getTime()) / 1000);
      });
      setElapsedTimes(newElapsedTimes);
    }, 1000);

    return () => clearInterval(interval);
  }, [runningTimers]);

  const groupedLogs = useMemo(
    () => groupByDate(completedLogs, (log) => log.startedAt),
    [completedLogs]
  );

  const handleStopTimer = async (timerId: string) => {
    try {
      await stopHabitTimer(timerId);
    } catch (error) {
      console.error('Failed to stop timer:', error);
    }
  };

  useEffect(() => {
    return () => { if (refreshTimeout.current) clearTimeout(refreshTimeout.current); };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    refreshTimeout.current = setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.moduleHabits} />
        }
      >
        <View style={{ padding: 20 }}>
          {/* Header */}
          <View style={{ marginBottom: 16, marginTop: 12 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 4 }}>
              {Strings.habits.screenTitle}
            </Text>
          </View>

          {/* Active Timers Section */}
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
                  backgroundColor: colors.success,
                  borderRadius: 3,
                  marginRight: 6
                }} />
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>
                  {Strings.habits.activeTimers}
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

            {runningTimers.length === 0 ? (
              <EmptyState
                icon="hourglass-outline"
                title={Strings.habits.emptyTimers}
                description={Strings.habits.emptyTimersDesc}
                action={
                  <Button
                    onPress={() => router.push('/habit/start')}
                    title={Strings.habits.startTimer}
                    icon="add"
                    variant="primary"
                  />
                }
              />
            ) : (
              <View style={{ gap: 10 }}>
                {runningTimers.map((timer) => {
                  const config = getHabitConfig(timer.category as HabitCategory);

                  return (
                    <View
                      key={timer.id}
                      style={{
                        backgroundColor: colors.bgSurface,
                        borderWidth: 1,
                        borderColor: colors.moduleHabits,
                        borderRadius: 12,
                        padding: 14
                      }}
                    >
                      {/* Active Badge */}
                      <View style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: colors.success + '20',
                        paddingHorizontal: 6,
                        paddingVertical: 3,
                        borderRadius: 6
                      }}>
                        <View style={{
                          width: 4,
                          height: 4,
                          backgroundColor: colors.success,
                          borderRadius: 2,
                          marginRight: 4
                        }} />
                        <Text style={{ color: colors.success, fontSize: 9, fontWeight: '600' }}>{Strings.habits.liveBadge}</Text>
                      </View>

                      {/* Header */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <View style={{
                          backgroundColor: config.color,
                          borderRadius: 20,
                          width: 36,
                          height: 36,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 10
                        }}>
                          <Ionicons name={config.icon as any} size={18} color="white" />
                        </View>
                        <View style={{ flex: 1, paddingRight: 60 }}>
                          <Text style={{
                            color: colors.textTertiary,
                            fontSize: 10,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                          }}>
                            {timer.category}
                          </Text>
                          <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: 'bold' }}>
                            {timer.activity}
                          </Text>
                        </View>
                      </View>

                      {/* Timer Display */}
                      <View style={{
                        backgroundColor: colors.bgSurfaceHover,
                        borderRadius: 10,
                        padding: 12,
                        marginBottom: 10,
                        borderWidth: 1,
                        borderColor: colors.moduleHabits + '50'
                      }}>
                        <Text style={{
                          color: colors.moduleHabits,
                          fontSize: 28,
                          fontFamily: 'monospace',
                          fontWeight: 'bold',
                          textAlign: 'center'
                        }}>
                          {formatDurationHMS(elapsedTimes[timer.id] || 0)}
                        </Text>
                      </View>

                      {/* Notes */}
                      {timer.notes && (
                        <View style={{
                          backgroundColor: colors.bgSurfaceHover,
                          borderRadius: 8,
                          padding: 10,
                          marginBottom: 10
                        }}>
                          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                            {timer.notes}
                          </Text>
                        </View>
                      )}

                      {/* Stop Button */}
                      <Button
                        onPress={() => handleStopTimer(timer.id)}
                        title={Strings.habits.stopTimer}
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

          {/* Recent Sessions - Grouped by Date like Finance */}
          <View style={{ marginBottom: 20 }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12
            }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>
                {Strings.habits.recentSessions}
              </Text>
              <Pressable onPress={() => router.push('/habit/history')}>
                <Text style={{ color: colors.moduleHabits, fontSize: 12, fontWeight: '600' }}>
                  {Strings.common.viewAll}
                </Text>
              </Pressable>
            </View>

            {completedLogs.length === 0 ? (
              <EmptyState
                icon="time-outline"
                title={Strings.habits.emptySessions}
                description={Strings.habits.emptySessionsDesc}
              />
            ) : (
              <View style={{ gap: 12 }}>
                {groupedLogs.slice(0, 5).map(([date, dateLogs]) => (
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
                      {dateLogs.map((log) => {
                        const config = getHabitConfig(log.category as HabitCategory);

                        return (
                          <Pressable
                            key={log.id}
                            onPress={() => router.push(`/habit/${log.id}`)}
                            style={{
                              backgroundColor: colors.bgSurface,
                              borderWidth: 1,
                              borderColor: colors.borderSurface,
                              borderRadius: 12,
                              padding: 12
                            }}
                          >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <View style={{
                                backgroundColor: config.color,
                                borderRadius: 20,
                                width: 40,
                                height: 40,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 12
                              }}>
                                <Ionicons name={config.icon as any} size={18} color="white" />
                              </View>

                              <View style={{ flex: 1 }}>
                                <Text style={{
                                  color: colors.textPrimary,
                                  fontWeight: '600',
                                  fontSize: 14,
                                  marginBottom: 3
                                }}>
                                  {log.activity}
                                </Text>
                                <View style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  flexWrap: 'wrap',
                                  gap: 6
                                }}>
                                  <View style={{
                                    backgroundColor: colors.bgSurfaceHover,
                                    paddingHorizontal: 6,
                                    paddingVertical: 2,
                                    borderRadius: 4
                                  }}>
                                    <Text style={{
                                      color: colors.textSecondary,
                                      fontSize: 10,
                                      fontWeight: '500'
                                    }}>
                                      {log.category}
                                    </Text>
                                  </View>
                                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Ionicons name="time" size={10} color={colors.textTertiary} />
                                    <Text style={{
                                      color: colors.textTertiary,
                                      fontSize: 10,
                                      marginLeft: 2
                                    }}>
                                      {formatDurationHMS(log.duration || 0)}
                                    </Text>
                                  </View>
                                </View>
                              </View>

                              <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                            </View>
                          </Pressable>
                        );
                      })}
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
        onPress={() => router.push('/habit/start')}
        icon="add"
        color="bg-purple-600"
      />
    </SafeAreaView>
  );
}
