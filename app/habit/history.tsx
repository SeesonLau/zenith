// app/habit/history.tsx (UPDATED WITH ANALYTICS)
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCompletedHabitLogs } from '@/src/database/hooks/useDatabase';
import { getHabitConfig } from '@/src/lib/constants';
import { formatDurationHMS, formatDuration } from '@/src/utils/formatters';
import { formatDate, getStartOfWeek, getEndOfWeek } from '@/src/utils/dateHelpers';
import type { HabitCategory } from '@/src/types/database.types';
import Button from '@/src/components/common/Button';

export default function HabitHistoryScreen() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');
  const completedLogs = useCompletedHabitLogs();

  // Filter logs by period
  const filteredLogs = useMemo(() => {
    if (selectedPeriod === 'all') return completedLogs;

    const now = new Date();
    const startDate = selectedPeriod === 'week' 
      ? getStartOfWeek(now)
      : new Date(now.getFullYear(), now.getMonth(), 1);

    return completedLogs.filter((log) => log.startedAt >= startDate);
  }, [completedLogs, selectedPeriod]);

  // Calculate analytics
  const analytics = useMemo(() => {
    const totalDuration = filteredLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
    const totalSessions = filteredLogs.length;

    // By category
    const byCategory: Record<string, number> = {};
    filteredLogs.forEach((log) => {
      byCategory[log.category] = (byCategory[log.category] || 0) + (log.duration || 0);
    });

    // By activity
    const byActivity: Record<string, number> = {};
    filteredLogs.forEach((log) => {
      byActivity[log.activity] = (byActivity[log.activity] || 0) + (log.duration || 0);
    });

    // Most frequent
    const mostFrequent = Object.entries(byActivity).sort(([, a], [, b]) => b - a)[0];

    // Average session duration
    const averageSession = totalSessions > 0 ? totalDuration / totalSessions : 0;

    return {
      totalDuration,
      totalSessions,
      byCategory,
      byActivity,
      mostFrequentActivity: mostFrequent?.[0] || 'None',
      mostFrequentDuration: mostFrequent?.[1] || 0,
      averageSession,
    };
  }, [filteredLogs]);

  return (
    <ScrollView className="flex-1 bg-slate-900">
      <View className="p-6">
        {/* Header */}
        <View className="flex-row items-center mb-6 mt-4">
          <Pressable onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={28} color="white" />
          </Pressable>
          <Text className="text-2xl font-bold text-white flex-1">Habit History</Text>
        </View>

        {/* Period Selector */}
        <View className="flex-row gap-2 mb-6">
          {(['week', 'month', 'all'] as const).map((period) => (
            <Pressable
              key={period}
              onPress={() => setSelectedPeriod(period)}
              className={`
                flex-1 py-3 rounded-xl
                ${selectedPeriod === period ? 'bg-purple-500' : 'bg-slate-800'}
              `}
            >
              <Text
                className={`
                  text-center font-semibold capitalize
                  ${selectedPeriod === period ? 'text-white' : 'text-slate-400'}
                `}
              >
                {period === 'all' ? 'All Time' : `This ${period}`}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Summary Stats */}
        <View className="card p-5 mb-6">
          <Text className="text-white font-semibold text-lg mb-4">Summary</Text>
          <View className="flex-row flex-wrap gap-4">
            <StatBox
              label="Total Time"
              value={formatDuration(analytics.totalDuration)}
              icon="time"
              color="text-sky-400"
            />
            <StatBox
              label="Sessions"
              value={analytics.totalSessions.toString()}
              icon="list"
              color="text-purple-400"
            />
            <StatBox
              label="Avg Session"
              value={formatDuration(Math.floor(analytics.averageSession))}
              icon="analytics"
              color="text-green-400"
            />
            <StatBox
              label="Top Activity"
              value={analytics.mostFrequentActivity}
              icon="star"
              color="text-yellow-400"
            />
          </View>
        </View>

        {/* By Category */}
        <View className="card p-5 mb-6">
          <Text className="text-white font-semibold text-lg mb-4">Time by Category</Text>
          {Object.entries(analytics.byCategory)
            .sort(([, a], [, b]) => b - a)
            .map(([category, duration]) => {
              const config = getHabitConfig(category as HabitCategory);
              const percentage = (duration / analytics.totalDuration) * 100;

              return (
                <View key={category} className="mb-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                      <View className={`${config.color} rounded-full w-8 h-8 items-center justify-center mr-2`}>
                        <Ionicons name={config.icon as any} size={16} color="white" />
                      </View>
                      <Text className="text-white font-medium">{category}</Text>
                    </View>
                    <Text className="text-slate-400 text-sm">
                      {formatDuration(duration)} • {percentage.toFixed(0)}%
                    </Text>
                  </View>
                  <View className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <View
                      className={config.color}
                      style={{ width: `${percentage}%`, height: '100%' }}
                    />
                  </View>
                </View>
              );
            })}
        </View>

        {/* Top Activities */}
        <View className="card p-5 mb-6">
          <Text className="text-white font-semibold text-lg mb-4">Top Activities</Text>
          {Object.entries(analytics.byActivity)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([activity, duration], index) => (
              <View key={activity} className="flex-row items-center py-3 border-b border-slate-700 last:border-b-0">
                <View className="bg-slate-700 rounded-full w-8 h-8 items-center justify-center mr-3">
                  <Text className="text-white font-bold text-sm">{index + 1}</Text>
                </View>
                <Text className="text-white flex-1">{activity}</Text>
                <Text className="text-slate-400 text-sm">{formatDuration(duration)}</Text>
              </View>
            ))}
        </View>

        {/* Recent Sessions */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-white mb-4">Recent Sessions</Text>
          {filteredLogs.slice(0, 10).map((log) => {
            const config = getHabitConfig(log.category as HabitCategory);

            return (
              <Pressable
                key={log.id}
                onPress={() => router.push(`/habit/${log.id}`)}
                className="card p-4 mb-3 active:bg-slate-700"
              >
                <View className="flex-row items-center">
                  <View className={`${config.color} rounded-full w-10 h-10 items-center justify-center mr-3`}>
                    <Ionicons name={config.icon as any} size={20} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-semibold">{log.activity}</Text>
                    <Text className="text-slate-400 text-xs">
                      {formatDate(log.startedAt, 'short')} • {formatDurationHMS(log.duration || 0)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#64748b" />
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

interface StatBoxProps {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

function StatBox({ label, value, icon, color }: StatBoxProps) {
  return (
    <View className="flex-1 min-w-[45%] bg-slate-800/50 rounded-xl p-4">
      <View className="flex-row items-center mb-2">
        <Ionicons name={icon} size={16} color="#64748b" />
        <Text className="text-slate-400 text-xs ml-2">{label}</Text>
      </View>
      <Text className={`${color} font-bold text-xl`}>{value}</Text>
    </View>
  );
}