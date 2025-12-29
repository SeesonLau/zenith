// app/(tabs)/habits.tsx (UPDATED)
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRunningHabitTimers } from '@/src/database/hooks/useDatabase';
import { stopHabitTimer } from '@/src/database/actions/habitActions';
import { formatDurationHMS } from '@/src/utils/formatters';
import { getRelativeTime } from '@/src/utils/dateHelpers';
import { getHabitConfig } from '@/src/lib/constants';
import FloatingActionButton from '@/src/components/common/FloatingActionButton';
import EmptyState from '@/src/components/common/EmptyState';
import Button from '@/src/components/common/Button';
import type { HabitCategory } from '@/src/types/database.types';
import { useCompletedHabitLogs } from '@/src/database/hooks/useDatabase'; 

export default function HabitsScreen() {
  const router = useRouter();
  const runningTimers = useRunningHabitTimers();
  const [elapsedTimes, setElapsedTimes] = useState<Record<string, number>>({});
  const [refreshing, setRefreshing] = useState(false);
  const completedLogs = useCompletedHabitLogs();
  const recentLogs = completedLogs.slice(0, 5);

  // Update elapsed times every second
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
    <View className="flex-1 bg-slate-900">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38bdf8" />
        }
      >
        <View className="p-6">
          {/* Header */}
          <View className="mb-6 mt-4">
            <Text className="text-3xl font-bold text-white mb-2">Habit Tracker</Text>
            <Text className="text-slate-400 text-base">
              Layered time system • Track multiple activities simultaneously
            </Text>
          </View>

          {/* Active Timers Section */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-semibold text-white">
                Active Timers
              </Text>
              <View className="bg-slate-800 px-3 py-1 rounded-full">
                <Text className="text-slate-300 font-semibold">
                  {runningTimers.length}
                </Text>
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
              <View className="space-y-3">
                {runningTimers.map((timer) => {
                  const config = getHabitConfig(timer.category as HabitCategory);
                  
                  return (
                    <View
                      key={timer.id}
                      className={`rounded-2xl p-5 border-2 ${config.borderColor} border-opacity-30`}
                      style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)' }}
                    >
                      {/* Header */}
                      <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center flex-1">
                          <View
                            className={`${config.color} rounded-full w-10 h-10 items-center justify-center mr-3`}
                          >
                            <Ionicons
                              name={config.icon as any}
                              size={20}
                              color="white"
                            />
                          </View>
                          <View className="flex-1">
                            <Text className="text-slate-400 text-xs uppercase tracking-wider">
                              {timer.category}
                            </Text>
                            <Text className="text-white text-lg font-bold">
                              {timer.activity}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Timer Display */}
                      <View className="glass rounded-xl p-4 mb-3">
                        <Text className="text-sky-400 text-4xl font-mono font-bold text-center">
                          {formatDurationHMS(elapsedTimes[timer.id] || 0)}
                        </Text>
                        <Text className="text-slate-500 text-xs text-center mt-1">
                          Started {getRelativeTime(timer.startedAt)}
                        </Text>
                      </View>

                      {/* Notes */}
                      {timer.notes && (
                        <View className="bg-slate-800/50 rounded-lg p-3 mb-3">
                          <Text className="text-slate-400 text-sm">{timer.notes}</Text>
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

          {/* Recent History Section - ADD THIS */}
          {recentLogs.length > 0 && (
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-semibold text-white">Recent Sessions</Text>
                <Pressable onPress={() => router.push('/habit/history')}>
                  <Text className="text-sky-400 text-sm">View All</Text>
                </Pressable>
              </View>

              <View className="space-y-2">
                {recentLogs.map((log) => {
                  const config = getHabitConfig(log.category as HabitCategory);

                  return (
                    <Pressable
                      key={log.id}
                      onPress={() => router.push(`/habit/${log.id}`)}
                      className="card p-4 active:bg-slate-700"
                    >
                      <View className="flex-row items-center">
                        <View className={`${config.color} rounded-full w-10 h-10 items-center justify-center mr-3`}>
                          <Ionicons name={config.icon as any} size={20} color="white" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-white font-semibold text-base">
                            {log.activity}
                          </Text>
                          <View className="flex-row items-center gap-2 mt-1">
                            <View className={`${config.bgColor} px-2 py-0.5 rounded`}>
                              <Text className={`${config.textColor} text-xs`}>
                                {log.category}
                              </Text>
                            </View>
                            <Text className="text-slate-500 text-xs">
                              {formatDurationHMS(log.duration || 0)}
                            </Text>
                            <Text className="text-slate-600 text-xs">•</Text>
                            <Text className="text-slate-500 text-xs">
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
          <View className="card p-5 mb-6">
            <Text className="text-white font-semibold text-lg mb-3">Today's Activity</Text>
            <View className="flex-row justify-around">
              <View className="items-center">
                <Text className="text-slate-400 text-xs mb-1">Sessions</Text>
                <Text className="text-white text-2xl font-bold">
                  {runningTimers.length}
                </Text>
              </View>
              <View className="w-px bg-slate-700" />
              <View className="items-center">
                <Text className="text-slate-400 text-xs mb-1">Categories</Text>
                <Text className="text-white text-2xl font-bold">
                  {new Set(runningTimers.map((t) => t.category)).size}
                </Text>
              </View>
              <View className="w-px bg-slate-700" />
              <View className="items-center">
                <Text className="text-slate-400 text-xs mb-1">Total Time</Text>
                <Text className="text-white text-2xl font-bold">
                  {Math.floor(
                    Object.values(elapsedTimes).reduce((a, b) => a + b, 0) / 60
                  )}m
                </Text>
              </View>
            </View>
          </View>

          {/* Info Card */}
          <View className="bg-purple-900/20 border border-purple-700 rounded-xl p-4">
            <View className="flex-row items-start">
              <Ionicons
                name="information-circle"
                size={20}
                color="#a78bfa"
                style={{ marginRight: 8, marginTop: 2 }}
              />
              <View className="flex-1">
                <Text className="text-purple-300 text-sm font-semibold mb-1">
                  Layered Time System
                </Text>
                <Text className="text-purple-200 text-xs">
                  Unlike traditional trackers, you can run multiple timers simultaneously. Perfect
                  for tracking overlapping activities like traveling while reading.
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
        color="bg-purple-500"
      />
    </View>
  );
}