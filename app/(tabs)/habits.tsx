// app/(tabs)/habits.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRunningHabitTimers } from '@/src/database/hooks/useDatabase';
import { stopHabitTimer } from '@/src/database/actions/habitActions';
import { formatDurationHMS, formatTime } from '@/src/utils/formatters';
import { getRelativeTime } from '@/src/utils/dateHelpers';
import FloatingActionButton from '@/src/components/common/FloatingActionButton';
import EmptyState from '@/src/components/common/EmptyState';
import Button from '@/src/components/common/Button';
import type { HabitCategory } from '@/src/types/database.types';

const CATEGORY_COLORS: Record<HabitCategory, string> = {
  Productivity: 'bg-purple-500',
  'Self-Care': 'bg-green-500',
  Logistics: 'bg-blue-500',
  Enjoyment: 'bg-pink-500',
  Nothing: 'bg-gray-500',
};

const CATEGORY_ICONS: Record<HabitCategory, any> = {
  Productivity: 'briefcase',
  'Self-Care': 'heart',
  Logistics: 'car',
  Enjoyment: 'happy',
  Nothing: 'time',
};

export default function HabitsScreen() {
  const router = useRouter();
  const runningTimers = useRunningHabitTimers();
  const [elapsedTimes, setElapsedTimes] = useState<Record<string, number>>({});
  const [refreshing, setRefreshing] = useState(false);

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
    // Timers are automatically refreshed via WatermelonDB observables
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
                {runningTimers.map((timer) => (
                  <View
                    key={timer.id}
                    className={`rounded-2xl p-5 border-2 ${CATEGORY_COLORS[timer.category as HabitCategory]} border-opacity-30`}
                    style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)' }}
                  >
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center flex-1">
                        <View
                          className={`${CATEGORY_COLORS[timer.category as HabitCategory]} rounded-full w-10 h-10 items-center justify-center mr-3`}
                        >
                          <Ionicons
                            name={CATEGORY_ICONS[timer.category as HabitCategory]}
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
                    <View className="bg-slate-800/70 rounded-xl p-4 mb-3">
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
                ))}
              </View>
            )}
          </View>

          {/* Quick Stats */}
          <View className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-6">
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