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

type TabView = 'monthly' | 'overall';
type ChartMode = 'time' | 'sessions';

// Tailwind → hex map for leisure types (used in charts)
const LEISURE_HEX: Record<LeisureType, string> = {
  Anime:       '#0ea5e9',
  Manga:       '#a855f7',
  Manhwa:      '#3b82f6',
  Manhua:      '#ef4444',
  Webtoon:     '#14b8a6',
  Animeh:      '#db2777',
  Mangah:      '#c026d3',
  Manhwah:     '#e11d48',
  Manhuah:     '#dc2626',
  Fanart:      '#8b5cf6',
  Imagination: '#6366f1',
  Acquainted:  '#f59e0b',
  Stranger:    '#f97316',
  Sensual:     '#b91c1c',
};

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
            {(['monthly', 'overall'] as TabView[]).map(tab => (
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
                  fontWeight: '600', fontSize: 13, textTransform: 'capitalize',
                }}>
                  {tab === 'monthly' ? 'Monthly' : 'Overall'}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Chart Mode Toggle */}
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
                  {mode === 'time' ? 'View: Time' : 'View: Sessions'}
                </Text>
              </Pressable>
            ))}
          </View>

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
                      const hex = LEISURE_HEX[type];
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
                        const hex = LEISURE_HEX[type];
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

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
