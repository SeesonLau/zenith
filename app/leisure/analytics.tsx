// app/leisure/analytics.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAllLeisureLogs, useLeisureLogs } from '@/src/database/hooks/useDatabase';
import { getLeisureConfig } from '@/src/lib/constants';
import { formatDuration } from '@/src/utils/formatters';
import { getStartOfMonth, getEndOfMonth, addMonths } from '@/src/utils/dateHelpers';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import type { LeisureType } from '@/src/types/database.types';

type TabView = 'monthly' | 'overall' | 'intervals';
type ChartMode = 'time' | 'sessions';

export default function LeisureAnalyticsScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [activeTab, setActiveTab] = useState<TabView>('monthly');
  const [chartMode, setChartMode] = useState<ChartMode>('time');
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const startDate = useMemo(() => getStartOfMonth(selectedMonth), [selectedMonth]);
  const endDate = useMemo(() => getEndOfMonth(selectedMonth), [selectedMonth]);

  const monthLogs = useLeisureLogs(startDate, endDate);
  const allLogs = useAllLeisureLogs();

  const monthName = selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // ─── Monthly stats ────────────────────────────────────────────────────────
  const monthStats = useMemo(() => {
    const totalSeconds = monthLogs.reduce((s, l) => s + (l.duration ?? 0), 0);
    const sessions = monthLogs.length;
    const avgSeconds = sessions > 0 ? Math.round(totalSeconds / sessions) : 0;
    const activeDays = new Set(monthLogs.map(l => l.startedAt.toDateString())).size;
    const daysInMonth = endDate.getDate();
    const avgSessionsPerDay = activeDays > 0 ? (sessions / activeDays).toFixed(1) : '0';
    const avgTimePerDay = daysInMonth > 0 ? Math.round(totalSeconds / daysInMonth) : 0;
    return { totalSeconds, sessions, avgSeconds, activeDays, daysInMonth, avgSessionsPerDay, avgTimePerDay };
  }, [monthLogs, endDate]);

  // Per-day data for the selected month
  const dailyData = useMemo(() => {
    const days: { date: Date; dayOfMonth: number; dayName: string; seconds: number; count: number }[] = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      const dateStr = current.toDateString();
      const dayLogs = monthLogs.filter(l => l.startedAt.toDateString() === dateStr);
      days.push({
        date: new Date(current),
        dayOfMonth: current.getDate(),
        dayName: current.toLocaleDateString('en-US', { weekday: 'short' }),
        seconds: dayLogs.reduce((s, l) => s + (l.duration ?? 0), 0),
        count: dayLogs.length,
      });
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [monthLogs, startDate, endDate]);

  const maxDaySeconds = useMemo(() =>
    Math.max(...dailyData.map(d => d.seconds), 1800),
  [dailyData]);

  const maxDayCount = useMemo(() =>
    Math.max(...dailyData.map(d => d.count), 1),
  [dailyData]);

  // Type breakdown for selected month
  const monthTypeBreakdown = useMemo(() => {
    const map: Partial<Record<LeisureType, { seconds: number; count: number }>> = {};
    monthLogs.forEach(l => {
      const t = l.type as LeisureType;
      if (!map[t]) map[t] = { seconds: 0, count: 0 };
      map[t]!.seconds += l.duration ?? 0;
      map[t]!.count += 1;
    });
    return Object.entries(map)
      .sort(([, a], [, b]) => b.seconds - a.seconds) as [LeisureType, { seconds: number; count: number }][];
  }, [monthLogs]);

  // ─── Overall stats ────────────────────────────────────────────────────────
  const overallStats = useMemo(() => {
    const totalSeconds = allLogs.reduce((s, l) => s + (l.duration ?? 0), 0);
    const sessions = allLogs.length;
    const avgSeconds = sessions > 0 ? Math.round(totalSeconds / sessions) : 0;

    // Unique active days
    const activeDays = new Set(allLogs.map(l => l.startedAt.toDateString())).size;

    // Longest single session
    const longestSeconds = allLogs.reduce((max, l) => Math.max(max, l.duration ?? 0), 0);

    return { totalSeconds, sessions, avgSeconds, activeDays, longestSeconds };
  }, [allLogs]);

  // Monthly trend: last 6 months
  const monthlyTrend = useMemo(() => {
    const months: { label: string; seconds: number; sessions: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = addMonths(new Date(), -i);
      const mStart = getStartOfMonth(d);
      const mEnd = getEndOfMonth(d);
      const mLogs = allLogs.filter(l => l.startedAt >= mStart && l.startedAt <= mEnd);
      months.push({
        label: d.toLocaleDateString('en-US', { month: 'short' }),
        seconds: mLogs.reduce((s, l) => s + (l.duration ?? 0), 0),
        sessions: mLogs.length,
      });
    }
    return months;
  }, [allLogs]);

  const maxTrendSeconds = useMemo(() =>
    Math.max(...monthlyTrend.map(m => m.seconds), 1),
  [monthlyTrend]);

  const maxTrendSessions = useMemo(() =>
    Math.max(...monthlyTrend.map(m => m.sessions), 1),
  [monthlyTrend]);

  // All-time type breakdown
  const overallTypeBreakdown = useMemo(() => {
    const map: Partial<Record<LeisureType, { seconds: number; count: number }>> = {};
    allLogs.forEach(l => {
      const t = l.type as LeisureType;
      if (!map[t]) map[t] = { seconds: 0, count: 0 };
      map[t]!.seconds += l.duration ?? 0;
      map[t]!.count += 1;
    });
    return Object.entries(map)
      .sort(([, a], [, b]) => b.seconds - a.seconds) as [LeisureType, { seconds: number; count: number }][];
  }, [allLogs]);

  const maxTypeSeconds = useMemo(() =>
    overallTypeBreakdown.length > 0 ? overallTypeBreakdown[0][1].seconds : 1,
  [overallTypeBreakdown]);

  // Gap between consecutive sessions (sorted oldest→newest, then reversed for display)
  const intervals = useMemo(() => {
    if (allLogs.length < 2) return [];
    const sorted = [...allLogs].sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime());
    const result: { gapSeconds: number; fromType: LeisureType; toType: LeisureType; toDate: Date }[] = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      const fromEnd = new Date(sorted[i].startedAt.getTime() + (sorted[i].duration ?? 0) * 1000);
      const gapMs = sorted[i + 1].startedAt.getTime() - fromEnd.getTime();
      if (gapMs > 0) {
        result.push({
          gapSeconds: Math.round(gapMs / 1000),
          fromType: sorted[i].type as LeisureType,
          toType: sorted[i + 1].type as LeisureType,
          toDate: sorted[i + 1].startedAt,
        });
      }
    }
    return result.reverse();
  }, [allLogs]);

  const intervalStats = useMemo(() => {
    if (intervals.length === 0) return null;
    const avg = Math.round(intervals.reduce((s, g) => s + g.gapSeconds, 0) / intervals.length);
    const min = Math.min(...intervals.map(g => g.gapSeconds));
    const max = Math.max(...intervals.map(g => g.gapSeconds));
    return { avg, min, max };
  }, [intervals]);

  const maxGapSeconds = useMemo(() =>
    intervals.length > 0 ? intervals.reduce((m, g) => Math.max(m, g.gapSeconds), 1) : 1,
  [intervals]);

  // [dayOfWeek 0=Mon…6=Sun][hour 0-23] session counts
  const dowHourData = useMemo(() => {
    const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0) as number[]);
    allLogs.forEach(l => {
      const jsDay = l.startedAt.getDay(); // 0=Sun
      const dow = jsDay === 0 ? 6 : jsDay - 1; // Mon=0…Sun=6
      grid[dow][l.startedAt.getHours()] += 1;
    });
    return grid;
  }, [allLogs]);

  // Format a gap duration including days
  const formatGap = (seconds: number): string => {
    if (seconds < 60) return '<1m';
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    if (seconds < 86400) {
      const h = Math.floor(seconds / 3600);
      const m = Math.round((seconds % 3600) / 60);
      return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }
    const d = Math.floor(seconds / 86400);
    const h = Math.round((seconds % 86400) / 3600);
    return h > 0 ? `${d}d ${h}h` : `${d}d`;
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 20 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 12 }}>
            <Pressable onPress={() => router.back()} style={{ marginRight: 12 }}>
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </Pressable>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.textPrimary, flex: 1 }}>
              Leisure Analytics
            </Text>
          </View>

          {/* Tab Toggle */}
          <View style={{
            flexDirection: 'row', backgroundColor: colors.bgSurface,
            borderRadius: 10, padding: 4, marginBottom: 12,
            borderWidth: 1, borderColor: colors.borderSurface,
          }}>
            {([['monthly', 'Monthly'], ['overall', 'Overall'], ['intervals', 'Intervals']] as [TabView, string][]).map(([tab, label]) => (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={{
                  flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8,
                  backgroundColor: activeTab === tab ? colors.moduleLeisure : 'transparent',
                }}
              >
                <Text style={{
                  color: activeTab === tab ? '#ffffff' : colors.textSecondary,
                  fontWeight: '600', fontSize: 13,
                }}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Chart Mode Toggle — hidden on Intervals tab */}
          {activeTab !== 'intervals' && (
            <View style={{
              flexDirection: 'row', backgroundColor: colors.bgSurface,
              borderRadius: 8, padding: 3, marginBottom: 16,
              borderWidth: 1, borderColor: colors.borderSurface,
            }}>
              {(['time', 'sessions'] as ChartMode[]).map(mode => (
                <Pressable
                  key={mode}
                  onPress={() => setChartMode(mode)}
                  style={{
                    flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: 6,
                    backgroundColor: chartMode === mode ? colors.moduleLeisure + 'cc' : 'transparent',
                  }}
                >
                  <Text style={{
                    color: chartMode === mode ? '#ffffff' : colors.textTertiary,
                    fontSize: 12, fontWeight: '600',
                  }}>
                    {mode === 'time' ? 'Time' : 'Sessions'}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* ── MONTHLY TAB ── */}
          {activeTab === 'monthly' && (
            <View>
              {/* Month Navigation */}
              <View style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.borderSurface,
                borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 14,
              }}>
                <Pressable
                  onPress={() => setSelectedMonth(addMonths(selectedMonth, -1))}
                  style={{ backgroundColor: colors.bgSurfaceHover, borderRadius: 8, padding: 6 }}
                >
                  <Ionicons name="chevron-back" size={16} color={colors.textSecondary} />
                </Pressable>
                <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: 'bold' }}>
                  {monthName}
                </Text>
                <Pressable
                  onPress={() => setSelectedMonth(addMonths(selectedMonth, 1))}
                  style={{ backgroundColor: colors.bgSurfaceHover, borderRadius: 8, padding: 6 }}
                >
                  <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                </Pressable>
              </View>

              {/* Monthly Hero */}
              <View style={{
                backgroundColor: colors.bgSurface,
                borderWidth: 1, borderColor: colors.borderSurface,
                borderLeftWidth: 4, borderLeftColor: colors.moduleLeisure,
                borderRadius: 14, padding: 18, marginBottom: 14,
              }}>
                <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '500', marginBottom: 4 }}>
                  Total Time · {monthName}
                </Text>
                <Text style={{ color: colors.moduleLeisure, fontSize: 30, fontWeight: 'bold', marginBottom: 12 }}>
                  {monthStats.totalSeconds > 0 ? formatDuration(monthStats.totalSeconds) : '—'}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  <View style={{
                    backgroundColor: colors.moduleLeisure + '18', borderWidth: 1,
                    borderColor: colors.moduleLeisure + '40', borderRadius: 10, padding: 10, flex: 1,
                  }}>
                    <Text style={{ color: colors.textTertiary, fontSize: 10, marginBottom: 3 }}>Sessions</Text>
                    <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: 'bold' }}>{monthStats.sessions}</Text>
                  </View>
                  <View style={{
                    backgroundColor: colors.moduleLeisure + '18', borderWidth: 1,
                    borderColor: colors.moduleLeisure + '40', borderRadius: 10, padding: 10, flex: 1,
                  }}>
                    <Text style={{ color: colors.textTertiary, fontSize: 10, marginBottom: 3 }}>Active Days</Text>
                    <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: 'bold' }}>
                      {monthStats.activeDays} / {monthStats.daysInMonth}
                    </Text>
                  </View>
                  <View style={{
                    backgroundColor: colors.moduleLeisure + '18', borderWidth: 1,
                    borderColor: colors.moduleLeisure + '40', borderRadius: 10, padding: 10, flex: 1,
                  }}>
                    <Text style={{ color: colors.textTertiary, fontSize: 10, marginBottom: 3 }}>Avg Session</Text>
                    <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: 'bold' }}>
                      {monthStats.avgSeconds > 0 ? formatDuration(monthStats.avgSeconds) : '—'}
                    </Text>
                  </View>
                  <View style={{
                    backgroundColor: colors.moduleLeisure + '18', borderWidth: 1,
                    borderColor: colors.moduleLeisure + '40', borderRadius: 10, padding: 10, flex: 1,
                  }}>
                    <Text style={{ color: colors.textTertiary, fontSize: 10, marginBottom: 3 }}>Sess / Day</Text>
                    <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: 'bold' }}>{monthStats.avgSessionsPerDay}</Text>
                  </View>
                </View>
              </View>

              {/* Daily Bar Chart */}
              <View style={{
                backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.borderSurface,
                borderRadius: 14, padding: 14, marginBottom: 14,
              }}>
                <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 12 }}>
                  Daily Activity
                </Text>
                <View style={{ position: 'relative' }}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', gap: 5, paddingBottom: 4 }}>
                      {dailyData.map((day, index) => {
                        const isToday = day.date.toDateString() === new Date().toDateString();
                        const barH = chartMode === 'time'
                          ? (day.seconds > 0 ? Math.max((day.seconds / maxDaySeconds) * 72, 4) : 0)
                          : (day.count > 0 ? Math.max((day.count / maxDayCount) * 72, 4) : 0);
                        const hasActivity = chartMode === 'time' ? day.seconds > 0 : day.count > 0;
                        return (
                          <View key={index} style={{ width: 28, alignItems: 'center' }}>
                            <View style={{
                              alignItems: 'center', marginBottom: 6,
                              backgroundColor: isToday ? colors.warning : 'transparent',
                              borderRadius: 4, paddingHorizontal: 2, paddingVertical: 1,
                            }}>
                              <Text style={{
                                color: isToday ? colors.bgPrimary : colors.textSecondary,
                                fontSize: 9, fontWeight: isToday ? 'bold' : '500',
                              }}>
                                {day.dayOfMonth}
                              </Text>
                            </View>
                            <View style={{ height: 80, justifyContent: 'flex-end', width: '100%', alignItems: 'center' }}>
                              {chartMode === 'sessions' && day.count > 0 && (
                                <Text style={{ color: colors.moduleLeisure, fontSize: 8, fontWeight: 'bold', marginBottom: 2 }}>
                                  {day.count}
                                </Text>
                              )}
                              {chartMode === 'time' && day.count > 0 && (
                                <Text style={{ color: colors.moduleLeisure, fontSize: 8, fontWeight: 'bold', marginBottom: 2 }} numberOfLines={1}>
                                  {`${Math.round(day.seconds / day.count / 60)}m`}
                                </Text>
                              )}
                              <View style={{
                                width: 16, height: barH || 2,
                                backgroundColor: hasActivity ? colors.moduleLeisure : colors.bgSurfaceHover,
                                borderRadius: 3,
                              }} />
                            </View>
                            <Text style={{ color: colors.textTertiary, fontSize: 8, marginTop: 4 }}>
                              {day.dayName.charAt(0)}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </ScrollView>
                  {/* Average time reference line */}
                  {chartMode === 'time' && monthStats.avgTimePerDay > 0 && (() => {
                    const avgBarH = Math.min(Math.max((monthStats.avgTimePerDay / maxDaySeconds) * 72, 2), 72);
                    // day badge ~20px + bar container 80px, line at (80 - avgBarH) from top of bar area
                    const lineTop = 20 + (80 - avgBarH);
                    return (
                      <View pointerEvents="none" style={{
                        position: 'absolute', top: lineTop, left: 0, right: 0,
                        flexDirection: 'row', alignItems: 'center',
                      }}>
                        <View style={{ flex: 1, height: 1, backgroundColor: colors.warning, opacity: 0.5 }} />
                        <View style={{
                          backgroundColor: colors.bgSurface,
                          borderWidth: 1, borderColor: colors.warning + '80',
                          borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2, marginLeft: 4,
                        }}>
                          <Text style={{ color: colors.warning, fontSize: 9, fontWeight: '700' }}>
                            avg {formatDuration(monthStats.avgTimePerDay)}
                          </Text>
                        </View>
                      </View>
                    );
                  })()}
                </View>
              </View>

              {/* Monthly Type Breakdown */}
              {monthTypeBreakdown.length > 0 && (
                <View style={{
                  backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.borderSurface,
                  borderRadius: 14, padding: 16, marginBottom: 20,
                }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 14 }}>
                    By Type
                  </Text>
                  <View style={{ gap: 12 }}>
                    {[...monthTypeBreakdown]
                      .sort(([, a], [, b]) => chartMode === 'time' ? b.seconds - a.seconds : b.count - a.count)
                      .map(([type, data]) => {
                      const config = getLeisureConfig(type);
                      const hex = config.hex;
                      const timePct = monthStats.totalSeconds > 0 ? (data.seconds / monthStats.totalSeconds) : 0;
                      const sessPct = monthStats.sessions > 0 ? (data.count / monthStats.sessions) : 0;
                      const pct = chartMode === 'time' ? timePct : sessPct;
                      return (
                        <View key={type}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                            <Ionicons name={config.icon as any} size={13} color={hex} />
                            <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '600', marginLeft: 6, flex: 1 }}>
                              {config.emoji} {type}
                            </Text>
                            <View style={{ alignItems: 'flex-end' }}>
                              {chartMode === 'time' ? (
                                <>
                                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                                    {formatDuration(data.seconds)}
                                  </Text>
                                  <Text style={{ color: colors.textTertiary, fontSize: 10 }}>
                                    {Math.round(timePct * 100)}%
                                  </Text>
                                </>
                              ) : (
                                <>
                                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                                    {data.count} sess
                                  </Text>
                                  <Text style={{ color: colors.textTertiary, fontSize: 10 }}>
                                    {Math.round(sessPct * 100)}%
                                  </Text>
                                </>
                              )}
                            </View>
                          </View>
                          <View style={{ height: 5, backgroundColor: colors.bgSurfaceHover, borderRadius: 3 }}>
                            <View style={{ height: 5, width: `${pct * 100}%`, backgroundColor: hex, borderRadius: 3 }} />
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

              {monthStats.sessions === 0 && (
                <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                  <Ionicons name="calendar-outline" size={40} color={colors.textTertiary} />
                  <Text style={{ color: colors.textTertiary, marginTop: 10, fontSize: 14 }}>
                    No sessions recorded this month
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* ── OVERALL TAB ── */}
          {activeTab === 'overall' && (
            <View>
              {/* All-time Hero */}
              <View style={{
                backgroundColor: colors.bgSurface,
                borderWidth: 1, borderColor: colors.borderSurface,
                borderLeftWidth: 4, borderLeftColor: colors.moduleLeisure,
                borderRadius: 14, padding: 18, marginBottom: 14,
              }}>
                <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '500', marginBottom: 4 }}>
                  All-Time Total
                </Text>
                <Text style={{ color: colors.moduleLeisure, fontSize: 30, fontWeight: 'bold', marginBottom: 12 }}>
                  {overallStats.totalSeconds > 0 ? formatDuration(overallStats.totalSeconds) : '—'}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  <View style={{
                    backgroundColor: colors.moduleLeisure + '18', borderWidth: 1,
                    borderColor: colors.moduleLeisure + '40', borderRadius: 10, padding: 10, flex: 1,
                  }}>
                    <Text style={{ color: colors.textTertiary, fontSize: 10, marginBottom: 3 }}>Sessions</Text>
                    <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: 'bold' }}>{overallStats.sessions}</Text>
                  </View>
                  <View style={{
                    backgroundColor: colors.moduleLeisure + '18', borderWidth: 1,
                    borderColor: colors.moduleLeisure + '40', borderRadius: 10, padding: 10, flex: 1,
                  }}>
                    <Text style={{ color: colors.textTertiary, fontSize: 10, marginBottom: 3 }}>Active Days</Text>
                    <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: 'bold' }}>{overallStats.activeDays}</Text>
                  </View>
                  <View style={{
                    backgroundColor: colors.moduleLeisure + '18', borderWidth: 1,
                    borderColor: colors.moduleLeisure + '40', borderRadius: 10, padding: 10, flex: 1,
                  }}>
                    <Text style={{ color: colors.textTertiary, fontSize: 10, marginBottom: 3 }}>Avg Session</Text>
                    <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: 'bold' }}>
                      {overallStats.avgSeconds > 0 ? formatDuration(overallStats.avgSeconds) : '—'}
                    </Text>
                  </View>
                  <View style={{
                    backgroundColor: colors.moduleLeisure + '18', borderWidth: 1,
                    borderColor: colors.moduleLeisure + '40', borderRadius: 10, padding: 10, flex: 1,
                  }}>
                    <Text style={{ color: colors.textTertiary, fontSize: 10, marginBottom: 3 }}>Longest</Text>
                    <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: 'bold' }}>
                      {overallStats.longestSeconds > 0 ? formatDuration(overallStats.longestSeconds) : '—'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Monthly Trend — last 6 months */}
              <View style={{
                backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.borderSurface,
                borderRadius: 14, padding: 16, marginBottom: 14,
              }}>
                <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 14 }}>
                  Monthly Trend (Last 6 Months)
                </Text>
                <View style={{ gap: 10 }}>
                  {monthlyTrend.map((m, i) => {
                    const pct = chartMode === 'time'
                      ? (maxTrendSeconds > 0 ? m.seconds / maxTrendSeconds : 0)
                      : (maxTrendSessions > 0 ? m.sessions / maxTrendSessions : 0);
                    const isCurrentMonth = i === monthlyTrend.length - 1;
                    return (
                      <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Text style={{
                          color: isCurrentMonth ? colors.textPrimary : colors.textSecondary,
                          fontSize: 12, fontWeight: isCurrentMonth ? '700' : '400', width: 30,
                        }}>
                          {m.label}
                        </Text>
                        <View style={{ flex: 1, height: 18, backgroundColor: colors.bgSurfaceHover, borderRadius: 4, overflow: 'hidden' }}>
                          {pct > 0 && (
                            <View style={{
                              width: `${pct * 100}%`, height: '100%',
                              backgroundColor: isCurrentMonth ? colors.moduleLeisure : colors.moduleLeisure + '60',
                              borderRadius: 4,
                            }} />
                          )}
                        </View>
                        <View style={{ alignItems: 'flex-end', width: 64 }}>
                          {chartMode === 'time' ? (
                            <Text style={{ color: colors.textTertiary, fontSize: 11 }}>
                              {m.seconds > 0 ? formatDuration(m.seconds) : '—'}
                            </Text>
                          ) : (
                            <Text style={{ color: colors.textTertiary, fontSize: 11 }}>
                              {m.sessions > 0 ? `${m.sessions} sess` : '—'}
                            </Text>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* All-Time Type Breakdown */}
              {overallTypeBreakdown.length > 0 && (
                <View style={{
                  backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.borderSurface,
                  borderRadius: 14, padding: 16, marginBottom: 20,
                }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 14 }}>
                    All-Time by Type
                  </Text>
                  <View style={{ gap: 12 }}>
                    {(() => {
                      const sorted = [...overallTypeBreakdown]
                        .sort(([, a], [, b]) => chartMode === 'time' ? b.seconds - a.seconds : b.count - a.count);
                      const maxOverallCount = sorted.length > 0 ? sorted[0][1].count : 1;
                      return sorted.map(([type, data]) => {
                        const config = getLeisureConfig(type);
                        const hex = config.hex;
                        const pct = chartMode === 'time'
                          ? (maxTypeSeconds > 0 ? data.seconds / maxTypeSeconds : 0)
                          : (maxOverallCount > 0 ? data.count / maxOverallCount : 0);
                        return (
                          <View key={type}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                              <Ionicons name={config.icon as any} size={13} color={hex} />
                              <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '600', marginLeft: 6, flex: 1 }}>
                                {config.emoji} {type}
                              </Text>
                              {chartMode === 'time' ? (
                                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                                  {formatDuration(data.seconds)}
                                </Text>
                              ) : (
                                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                                  {data.count} sess
                                </Text>
                              )}
                            </View>
                            <View style={{ height: 5, backgroundColor: colors.bgSurfaceHover, borderRadius: 3 }}>
                              <View style={{ height: 5, width: `${pct * 100}%`, backgroundColor: hex, borderRadius: 3 }} />
                            </View>
                          </View>
                        );
                      });
                    })()}
                  </View>
                </View>
              )}

              {overallStats.sessions === 0 && (
                <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                  <Ionicons name="bar-chart-outline" size={40} color={colors.textTertiary} />
                  <Text style={{ color: colors.textTertiary, marginTop: 10, fontSize: 14 }}>
                    No sessions recorded yet
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* ── INTERVALS TAB ── */}
          {activeTab === 'intervals' && (
            <View>
              {intervals.length < 1 ? (
                <View style={{ alignItems: 'center', paddingVertical: 48 }}>
                  <Ionicons name="git-branch-outline" size={40} color={colors.textTertiary} />
                  <Text style={{ color: colors.textTertiary, marginTop: 10, fontSize: 14 }}>
                    Need at least 2 sessions to show gaps
                  </Text>
                </View>
              ) : (
                <View style={{ marginBottom: 20 }}>
                  {/* Stats card */}
                  {intervalStats && (
                    <View style={{
                      backgroundColor: colors.bgSurface,
                      borderWidth: 1, borderColor: colors.borderSurface,
                      borderLeftWidth: 4, borderLeftColor: colors.moduleLeisure,
                      borderRadius: 14, padding: 18, marginBottom: 14,
                    }}>
                      <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '500', marginBottom: 4 }}>
                        Gap Between Sessions
                      </Text>
                      <Text style={{ color: colors.moduleLeisure, fontSize: 30, fontWeight: 'bold', marginBottom: 12 }}>
                        {formatGap(intervalStats.avg)}
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <View style={{
                          backgroundColor: colors.moduleLeisure + '18', borderWidth: 1,
                          borderColor: colors.moduleLeisure + '40', borderRadius: 10, padding: 10, flex: 1,
                        }}>
                          <Text style={{ color: colors.textTertiary, fontSize: 10, marginBottom: 3 }}>Avg Gap</Text>
                          <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: 'bold' }}>{formatGap(intervalStats.avg)}</Text>
                        </View>
                        <View style={{
                          backgroundColor: colors.moduleLeisure + '18', borderWidth: 1,
                          borderColor: colors.moduleLeisure + '40', borderRadius: 10, padding: 10, flex: 1,
                        }}>
                          <Text style={{ color: colors.textTertiary, fontSize: 10, marginBottom: 3 }}>Shortest</Text>
                          <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: 'bold' }}>{formatGap(intervalStats.min)}</Text>
                        </View>
                        <View style={{
                          backgroundColor: colors.moduleLeisure + '18', borderWidth: 1,
                          borderColor: colors.moduleLeisure + '40', borderRadius: 10, padding: 10, flex: 1,
                        }}>
                          <Text style={{ color: colors.textTertiary, fontSize: 10, marginBottom: 3 }}>Longest</Text>
                          <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: 'bold' }}>{formatGap(intervalStats.max)}</Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Gap Trend — vertical bar chart, oldest→newest left→right */}
                  <View style={{
                    backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.borderSurface,
                    borderRadius: 14, padding: 14, marginBottom: 14,
                  }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 12 }}>
                      Gap Trend
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={{ flexDirection: 'row', gap: 6, paddingBottom: 4 }}>
                        {[...intervals].reverse().slice(-40).map((gap, i) => {
                          const pct = maxGapSeconds > 0 ? gap.gapSeconds / maxGapSeconds : 0;
                          const barH = Math.max(pct * 72, 3);
                          const barColor = pct < 0.25
                            ? colors.success
                            : pct < 0.6
                              ? colors.moduleLeisure
                              : colors.warning;
                          const dateStr = gap.toDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
                          return (
                            <View key={i} style={{ width: 32, alignItems: 'center' }}>
                              <Text style={{ color: colors.textTertiary, fontSize: 8, marginBottom: 4 }}>
                                {formatGap(gap.gapSeconds)}
                              </Text>
                              <View style={{ height: 80, justifyContent: 'flex-end', width: '100%', alignItems: 'center' }}>
                                <View style={{
                                  width: 18, height: barH,
                                  backgroundColor: barColor,
                                  borderRadius: 3, opacity: 0.85,
                                }} />
                              </View>
                              <Text style={{ color: colors.textTertiary, fontSize: 8, marginTop: 4, textAlign: 'center' }}>
                                {dateStr}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    </ScrollView>
                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 10, justifyContent: 'center' }}>
                      {[
                        { color: colors.success, label: 'Short' },
                        { color: colors.moduleLeisure, label: 'Medium' },
                        { color: colors.warning, label: 'Long' },
                      ].map(({ color, label }) => (
                        <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: color }} />
                          <Text style={{ color: colors.textTertiary, fontSize: 10 }}>{label}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Session Count Heatmap — GitHub contribution style */}
                  {(() => {
                    const DOW_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                    const LEVELS = [
                      { max: 0,        color: null,      label: '0' },
                      { max: 2,        color: '#4ade80', label: '1–2' },
                      { max: 5,        color: '#facc15', label: '3–5' },
                      { max: 9,        color: '#fb923c', label: '6–9' },
                      { max: 14,       color: '#ef4444', label: '10–14' },
                      { max: Infinity, color: '#ec4899', label: '15+' },
                    ];
                    const getColor = (count: number): string =>
                      count === 0 ? colors.bgSurfaceHover
                        : (LEVELS.find(l => count <= l.max)?.color ?? '#ec4899');

                    // Hours starting at 6am, wrapping around: [6,7,...,23,0,1,...,5]
                    const HOURS = Array.from({ length: 24 }, (_, i) => (i + 6) % 24);
                    // Divider after column index 11 (hour 17 = 5pm) — splits Day | Night
                    const DIVIDER_COL = 11;

                    const fmtHour = (h: number): string =>
                      h === 0 ? '12' : h <= 12 ? `${h}` : `${h - 12}`;

                    const CELL = 11;
                    const GAP = 3;
                    const DIVIDER_W = 1;
                    const Y_WIDTH = 28;

                    // Build combined label + cell columns including divider element
                    // Each element is either { kind:'hour', hour, col } or { kind:'divider' }
                    type Col = { kind: 'hour'; hour: number; col: number } | { kind: 'divider' };
                    const columns: Col[] = [];
                    HOURS.forEach((hour, col) => {
                      columns.push({ kind: 'hour', hour, col });
                      if (col === DIVIDER_COL) columns.push({ kind: 'divider' });
                    });

                    return (
                      <View style={{
                        backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.borderSurface,
                        borderRadius: 14, padding: 16, marginBottom: 14,
                      }}>
                        <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 2 }}>
                          Session Count
                        </Text>
                        <Text style={{ color: colors.textTertiary, fontSize: 11, marginBottom: 12 }}>
                          Sessions started by hour &amp; day of week
                        </Text>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          <View>
                            {/* Section headers: Day | Night */}
                            <View style={{ flexDirection: 'row', marginBottom: 4, marginLeft: Y_WIDTH }}>
                              {/* Day label spans cols 0–11 (12 cells + 11 gaps) */}
                              <View style={{ width: 12 * CELL + 11 * GAP, alignItems: 'center' }}>
                                <Text style={{ color: colors.warning, fontSize: 9, fontWeight: '600' }}>☀ Day</Text>
                              </View>
                              {/* Divider spacer */}
                              <View style={{ width: DIVIDER_W + GAP * 2 }} />
                              {/* Night label spans cols 12–23 (12 cells + 11 gaps) */}
                              <View style={{ width: 12 * CELL + 11 * GAP, alignItems: 'center' }}>
                                <Text style={{ color: colors.info ?? '#60a5fa', fontSize: 9, fontWeight: '600' }}>🌙 Night</Text>
                              </View>
                            </View>

                            {/* Hour axis labels */}
                            <View style={{ flexDirection: 'row', marginBottom: 4, marginLeft: Y_WIDTH }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {columns.map((col, i) =>
                                  col.kind === 'divider' ? (
                                    <View key={`div-label-${i}`} style={{ width: DIVIDER_W, marginHorizontal: GAP }} />
                                  ) : (
                                    <Text key={`lbl-${col.hour}`} style={{
                                      width: CELL, color: colors.textTertiary,
                                      fontSize: 7, textAlign: 'center',
                                      marginRight: GAP,
                                    }}>
                                      {col.col % 2 === 0 ? fmtHour(col.hour) : ''}
                                    </Text>
                                  )
                                )}
                              </View>
                            </View>

                            {/* Grid */}
                            <View style={{ flexDirection: 'row' }}>
                              {/* Y-axis day labels */}
                              <View style={{ width: Y_WIDTH, gap: GAP }}>
                                {DOW_LABELS.map(d => (
                                  <View key={d} style={{ height: CELL, justifyContent: 'center' }}>
                                    <Text style={{ color: colors.textTertiary, fontSize: 8 }}>{d}</Text>
                                  </View>
                                ))}
                              </View>

                              {/* Cell rows */}
                              <View style={{ gap: GAP }}>
                                {dowHourData.map((row, dow) => (
                                  <View key={dow} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    {columns.map((col, i) =>
                                      col.kind === 'divider' ? (
                                        <View key={`div-${dow}-${i}`} style={{
                                          width: DIVIDER_W, height: CELL,
                                          backgroundColor: '#0f766e',
                                          marginHorizontal: GAP,
                                        }} />
                                      ) : (
                                        <View
                                          key={`cell-${dow}-${col.hour}`}
                                          style={{
                                            width: CELL, height: CELL, borderRadius: 2,
                                            backgroundColor: getColor(row[col.hour]),
                                            marginRight: GAP,
                                          }}
                                        />
                                      )
                                    )}
                                  </View>
                                ))}
                              </View>
                            </View>
                          </View>
                        </ScrollView>

                        {/* Legend */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 8, flexWrap: 'wrap' }}>
                          <Text style={{ color: colors.textTertiary, fontSize: 9 }}>Less</Text>
                          {LEVELS.map(l => (
                            <View key={l.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                              <View style={{
                                width: 10, height: 10, borderRadius: 2,
                                backgroundColor: l.color ?? colors.bgSurfaceHover,
                                borderWidth: l.color ? 0 : 1, borderColor: colors.borderSurface,
                              }} />
                              <Text style={{ color: colors.textTertiary, fontSize: 9 }}>{l.label}</Text>
                            </View>
                          ))}
                          <Text style={{ color: colors.textTertiary, fontSize: 9 }}>More</Text>
                        </View>
                      </View>
                    );
                  })()}

                  {/* Gap detail list */}
                  <View style={{
                    backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.borderSurface,
                    borderRadius: 14, padding: 16,
                  }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 14 }}>
                      Gap History (newest first)
                    </Text>
                    <View style={{ gap: 10 }}>
                      {intervals.slice(0, 40).map((gap, i) => {
                        const pct = maxGapSeconds > 0 ? gap.gapSeconds / maxGapSeconds : 0;
                        const fromConfig = getLeisureConfig(gap.fromType);
                        const toConfig = getLeisureConfig(gap.toType);
                        const fromHex = fromConfig.hex;
                        const toHex = toConfig.hex;
                        const dateStr = gap.toDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        const timeStr = gap.toDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

                        // Color the bar: short gaps green-tinted, long gaps red-tinted
                        const barColor = pct < 0.25
                          ? colors.success
                          : pct < 0.6
                            ? colors.moduleLeisure
                            : colors.warning;

                        return (
                          <View key={i}>
                            {/* Row header: from→to type + date */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                              <Text style={{ fontSize: 13, marginRight: 4 }}>{fromConfig.emoji}</Text>
                              <Ionicons name="arrow-forward" size={10} color={colors.textTertiary} />
                              <Text style={{ fontSize: 13, marginLeft: 4, flex: 1 }}>{toConfig.emoji}
                                <Text style={{ color: colors.textTertiary, fontSize: 11 }}> {gap.toType}</Text>
                              </Text>
                              <Text style={{ color: colors.textTertiary, fontSize: 10 }}>
                                {dateStr} {timeStr}
                              </Text>
                            </View>

                            {/* Bar row */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                              {/* Type dots */}
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, width: 20 }}>
                                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: fromHex }} />
                                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: toHex }} />
                              </View>

                              {/* Bar */}
                              <View style={{ flex: 1, height: 16, backgroundColor: colors.bgSurfaceHover, borderRadius: 4, overflow: 'hidden' }}>
                                {pct > 0 && (
                                  <View style={{
                                    width: `${Math.max(pct * 100, 2)}%`, height: '100%',
                                    backgroundColor: barColor, borderRadius: 4, opacity: 0.8,
                                  }} />
                                )}
                              </View>

                              {/* Gap label */}
                              <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '600', width: 52, textAlign: 'right' }}>
                                {formatGap(gap.gapSeconds)}
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                    {intervals.length > 40 && (
                      <Text style={{ color: colors.textTertiary, fontSize: 11, marginTop: 12, textAlign: 'center' }}>
                        Showing latest 40 of {intervals.length} gaps
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </View>
          )}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
