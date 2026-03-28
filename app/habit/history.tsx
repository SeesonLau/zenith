// app/habit/history.tsx - COMPACT VERSION
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCompletedHabitLogs } from '@/src/database/hooks/useDatabase';
import { getHabitConfig } from '@/src/lib/constants';
import { formatDurationHMS, formatDuration } from '@/src/utils/formatters';
import { formatDate, getStartOfWeek, getStartOfMonth } from '@/src/utils/dateHelpers';
import type { HabitCategory } from '@/src/types/database.types';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export default function HabitHistoryScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');
  const completedLogs = useCompletedHabitLogs();

  // Filter logs by period
  const filteredLogs = useMemo(() => {
    if (selectedPeriod === 'all') return completedLogs;

    const now = new Date();
    const startDate = selectedPeriod === 'week' 
      ? getStartOfWeek(now)
      : getStartOfMonth(now);

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

  // Group logs by date
  const groupedLogs = useMemo(() => {
    const groups: Record<string, typeof filteredLogs> = {};

    filteredLogs.forEach((log) => {
      const dateKey = formatDate(log.startedAt, 'short');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(log);
    });

    return Object.entries(groups).sort(
      ([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime()
    );
  }, [filteredLogs]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 20 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 8 }}>
            <Pressable onPress={() => router.back()} style={{ marginRight: 12 }}>
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </Pressable>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.textPrimary, flex: 1 }}>
              History & Stats
            </Text>
          </View>

          {/* Period Selector */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
            {(['week', 'month', 'all'] as const).map((period) => (
              <Pressable
                key={period}
                onPress={() => setSelectedPeriod(period)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: selectedPeriod === period ? colors.moduleHabits : colors.bgSurface,
                  borderWidth: 1,
                  borderColor: selectedPeriod === period ? colors.moduleHabits : colors.borderSurface,
                }}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    fontWeight: '600',
                    fontSize: 13,
                    color: selectedPeriod === period ? 'white' : colors.textPrimary,
                  }}
                >
                  {period === 'all' ? 'All Time' : `This ${period.charAt(0).toUpperCase() + period.slice(1)}`}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Summary Stats */}
          <View style={{
            backgroundColor: colors.bgSurface,
            borderWidth: 1,
            borderColor: colors.borderSurface,
            borderRadius: 14,
            padding: 16,
            marginBottom: 14
          }}>
            <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 15, marginBottom: 12 }}>
              Summary
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              <StatBox
                label="Total Time"
                value={formatDuration(analytics.totalDuration)}
                icon="time"
                color={colors.moduleHabits}
                colors={colors}
              />
              <StatBox
                label="Sessions"
                value={analytics.totalSessions.toString()}
                icon="list"
                color={colors.moduleHabits}
                colors={colors}
              />
              <StatBox
                label="Avg Session"
                value={formatDuration(Math.floor(analytics.averageSession))}
                icon="analytics"
                color={colors.moduleHabits}
                colors={colors}
              />
              <StatBox
                label="Top Activity"
                value={analytics.mostFrequentActivity}
                icon="star"
                color={colors.moduleHabits}
                colors={colors}
              />
            </View>
          </View>

          {/* By Category */}
          <View style={{
            backgroundColor: colors.bgSurface,
            borderWidth: 1,
            borderColor: colors.borderSurface,
            borderRadius: 14,
            padding: 16,
            marginBottom: 14
          }}>
            <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 15, marginBottom: 12 }}>
              Time by Category
            </Text>
            {Object.entries(analytics.byCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([category, duration]) => {
                const config = getHabitConfig(category as HabitCategory);
                const percentage = (duration / analytics.totalDuration) * 100;

                return (
                  <View key={category} style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ 
                          backgroundColor: config.color, 
                          borderRadius: 16, 
                          width: 28, 
                          height: 28, 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          marginRight: 8 
                        }}>
                          <Ionicons name={config.icon as any} size={14} color="white" />
                        </View>
                        <Text style={{ color: colors.textPrimary, fontWeight: '500', fontSize: 13 }}>
                          {category}
                        </Text>
                      </View>
                      <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                        {formatDuration(duration)} • {percentage.toFixed(0)}%
                      </Text>
                    </View>
                    <View style={{ height: 6, backgroundColor: colors.bgSurfaceHover, borderRadius: 3, overflow: 'hidden' }}>
                      <View
                        style={{ 
                          width: `${percentage}%`, 
                          height: '100%',
                          backgroundColor: config.color
                        }}
                      />
                    </View>
                  </View>
                );
              })}
          </View>

          {/* Recent Sessions - Grouped by Date */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 12 }}>
              Recent Sessions
            </Text>
            {groupedLogs.length === 0 ? (
              <View style={{
                backgroundColor: colors.bgSurface,
                borderWidth: 1,
                borderColor: colors.borderSurface,
                borderRadius: 12,
                padding: 24,
                alignItems: 'center'
              }}>
                <Ionicons name="time-outline" size={32} color={colors.textTertiary} />
                <Text style={{ color: colors.textSecondary, marginTop: 8, fontSize: 13 }}>
                  No sessions found
                </Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {groupedLogs.map(([date, dateLogs]) => (
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
                                width: 36, 
                                height: 36, 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                marginRight: 10 
                              }}>
                                <Ionicons name={config.icon as any} size={16} color="white" />
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 13 }}>
                                  {log.activity}
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                                  <View style={{ 
                                    backgroundColor: colors.bgSurfaceHover, 
                                    paddingHorizontal: 6, 
                                    paddingVertical: 2, 
                                    borderRadius: 4 
                                  }}>
                                    <Text style={{ color: colors.textSecondary, fontSize: 9, fontWeight: '500' }}>
                                      {log.category}
                                    </Text>
                                  </View>
                                  <Text style={{ color: colors.textTertiary, fontSize: 10 }}>
                                    {formatDurationHMS(log.duration || 0)}
                                  </Text>
                                </View>
                              </View>
                              <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface StatBoxProps {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  colors: any;
}

function StatBox({ label, value, icon, color, colors }: StatBoxProps) {
  return (
    <View style={{ 
      flex: 1, 
      minWidth: '47%', 
      backgroundColor: colors.bgSurfaceHover, 
      borderRadius: 10, 
      padding: 12 
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        <Ionicons name={icon} size={12} color={colors.textTertiary} />
        <Text style={{ color: colors.textSecondary, fontSize: 10, marginLeft: 4 }}>
          {label}
        </Text>
      </View>
      <Text style={{ color: color, fontWeight: 'bold', fontSize: 16 }} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}