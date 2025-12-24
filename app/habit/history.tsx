// app/habit/history.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCompletedHabitLogs } from '@/src/database/hooks/useDatabase';
import { formatDurationHMS } from '@/src/utils/formatters';
import { formatDate, getStartOfDay, getEndOfDay, isToday, isYesterday } from '@/src/utils/dateHelpers';
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

export default function HabitHistoryScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const completedLogs = useCompletedHabitLogs();

  // Group by date
  const groupedLogs = useMemo(() => {
    const groups: Record<string, typeof completedLogs> = {};

    completedLogs.forEach((log) => {
      let dateKey: string;
      if (isToday(log.startedAt)) {
        dateKey = 'Today';
      } else if (isYesterday(log.startedAt)) {
        dateKey = 'Yesterday';
      } else {
        dateKey = formatDate(log.startedAt, 'short');
      }

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(log);
    });

    return Object.entries(groups).sort((a, b) => {
      if (a[0] === 'Today') return -1;
      if (b[0] === 'Today') return 1;
      if (a[0] === 'Yesterday') return -1;
      if (b[0] === 'Yesterday') return 1;
      return new Date(b[0]).getTime() - new Date(a[0]).getTime();
    });
  }, [completedLogs]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalSessions = completedLogs.length;
    const totalTime = completedLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
    const categoryCounts: Record<string, number> = {};
    
    completedLogs.forEach((log) => {
      categoryCounts[log.category] = (categoryCounts[log.category] || 0) + 1;
    });

    const topCategory = Object.entries(categoryCounts).sort(([, a], [, b]) => b - a)[0];

    return {
      totalSessions,
      totalTime,
      avgSessionTime: totalSessions > 0 ? totalTime / totalSessions : 0,
      topCategory: topCategory ? topCategory[0] : null,
      topCategoryCount: topCategory ? topCategory[1] : 0,
    };
  }, [completedLogs]);

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
          <View className="flex-row items-center mb-6 mt-4">
            <Pressable onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={28} color="white" />
            </Pressable>
            <Text className="text-2xl font-bold text-white flex-1">History</Text>
          </View>

          {/* Stats Cards */}
          {completedLogs.length > 0 && (
            <View className="mb-6">
              <View className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-700 rounded-2xl p-6 mb-4">
                <Text className="text-purple-400 text-sm mb-1">Total Time Tracked</Text>
                <Text className="text-white text-4xl font-bold mb-2">
                  {formatDurationHMS(stats.totalTime)}
                </Text>
                <Text className="text-purple-300 text-sm">
                  Across {stats.totalSessions} completed sessions
                </Text>
              </View>

              <View className="flex-row gap-3 mb-4">
                <View className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-4">
                  <Ionicons name="analytics" size={20} color="#38bdf8" />
                  <Text className="text-slate-400 text-xs mt-2">Avg Session</Text>
                  <Text className="text-white text-xl font-bold">
                    {formatDurationHMS(stats.avgSessionTime)}
                  </Text>
                </View>
                <View className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-4">
                  <Ionicons name="star" size={20} color="#fbbf24" />
                  <Text className="text-slate-400 text-xs mt-2">Top Category</Text>
                  <Text className="text-white text-sm font-bold">
                    {stats.topCategory || 'N/A'}
                  </Text>
                  <Text className="text-slate-500 text-xs">
                    {stats.topCategoryCount} sessions
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* History List */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-semibold text-white">Completed Sessions</Text>
              <View className="bg-slate-800 px-3 py-1 rounded-full">
                <Text className="text-slate-300 font-semibold">{completedLogs.length}</Text>
              </View>
            </View>

            {completedLogs.length === 0 ? (
              <EmptyState
                icon="time-outline"
                title="No History Yet"
                description="Completed habit sessions will appear here. Start a timer to begin tracking!"
                action={
                  <Button
                    onPress={() => router.push('/habit/start')}
                    title="Start Timer"
                    icon="play"
                    variant="primary"
                  />
                }
              />
            ) : (
              <View className="space-y-4">
                {groupedLogs.map(([date, dateLogs]) => (
                  <View key={date}>
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-slate-500 text-sm font-semibold uppercase">{date}</Text>
                      <Text className="text-slate-600 text-xs">
                        {dateLogs.length} {dateLogs.length === 1 ? 'session' : 'sessions'}
                      </Text>
                    </View>
                    <View className="space-y-2">
                      {dateLogs.map((log) => (
                        <Pressable
                          key={log.id}
                          onPress={() => router.push(`/habit/${log.id}`)}
                          className="bg-slate-800 border border-slate-700 rounded-xl p-4 active:bg-slate-700"
                        >
                          <View className="flex-row items-center">
                            <View className={`${CATEGORY_COLORS[log.category as HabitCategory]} rounded-full w-12 h-12 items-center justify-center mr-4`}>
                              <Ionicons
                                name={CATEGORY_ICONS[log.category as HabitCategory]}
                                size={24}
                                color="white"
                              />
                            </View>
                            <View className="flex-1">
                              <Text className="text-white font-semibold text-base mb-1">
                                {log.activity}
                              </Text>
                              <View className="flex-row items-center">
                                <View className="bg-slate-700 px-2 py-1 rounded mr-2">
                                  <Text className="text-slate-300 text-xs">{log.category}</Text>
                                </View>
                                {log.notes && (
                                  <View className="flex-row items-center">
                                    <Ionicons name="document-text-outline" size={12} color="#64748b" />
                                    <Text className="text-slate-500 text-xs ml-1" numberOfLines={1}>
                                      {log.notes}
                                    </Text>
                                  </View>
                                )}
                              </View>
                            </View>
                            <View className="items-end">
                              <Text className="text-sky-400 text-xl font-bold font-mono">
                                {formatDurationHMS(log.duration || 0)}
                              </Text>
                              {log.endedAt && (
                                <Text className="text-slate-500 text-xs">
                                  {formatDate(log.endedAt, 'short')}
                                </Text>
                              )}
                            </View>
                          </View>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Info Card */}
          {completedLogs.length > 0 && (
            <View className="bg-purple-900/20 border border-purple-700 rounded-xl p-4">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={20} color="#a78bfa" style={{ marginRight: 8, marginTop: 2 }} />
                <View className="flex-1">
                  <Text className="text-purple-300 text-sm font-semibold mb-1">Keep Going!</Text>
                  <Text className="text-purple-200 text-xs">
                    You've tracked {stats.totalSessions} sessions across all your activities. 
                    Remember, the layered time system lets you track multiple activities simultaneously!
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}