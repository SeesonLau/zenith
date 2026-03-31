// app/(tabs)/finance.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFinanceLogs, useAllFinanceLogs } from '@/src/database/hooks/useDatabase';
import { formatCurrency } from '@/src/utils/formatters';
import { formatDate, getStartOfMonth, getEndOfMonth, addMonths } from '@/src/utils/dateHelpers';
import { getTransactionTypeConfig } from '@/src/lib/constants';
import FloatingActionButton from '@/src/components/common/FloatingActionButton';
import EmptyState from '@/src/components/common/EmptyState';
import Button from '@/src/components/common/Button';
import type { CurrencyCode } from '@/src/types/database.types';
import { useThemeColors } from '@/src/hooks/useThemeColors';

type TabView = 'transactions' | 'graph';

export default function FinanceScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [refreshing, setRefreshing] = useState(false);
  const refreshTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState<TabView>('transactions');

  const startDate = getStartOfMonth(selectedMonth);
  const endDate = getEndOfMonth(selectedMonth);
  const logs = useFinanceLogs(startDate, endDate);
  const allLogs = useAllFinanceLogs();

  const stats = useMemo(() => {
    const income = logs.filter(l => l.transactionType === 'income').reduce((s, l) => s + l.totalCost, 0);
    const expenses = logs.filter(l => l.transactionType === 'expense').reduce((s, l) => s + l.totalCost, 0);
    return { income, expenses };
  }, [logs]);

  const totalBalance = useMemo(() => {
    const totalIncome = allLogs.filter(l => l.transactionType === 'income').reduce((s, l) => s + l.totalCost, 0);
    const totalExpenses = allLogs.filter(l => l.transactionType === 'expense').reduce((s, l) => s + l.totalCost, 0);
    return totalIncome - totalExpenses;
  }, [allLogs]);

  // Per-day data for all days in the selected month
  const dailyData = useMemo(() => {
    const monthStart = getStartOfMonth(selectedMonth);
    const monthEnd = getEndOfMonth(selectedMonth);
    const days = [];
    const current = new Date(monthStart);
    while (current <= monthEnd) {
      const dateStr = current.toDateString();
      const dayIncome = logs
        .filter(l => l.transactionDate.toDateString() === dateStr && l.transactionType === 'income')
        .reduce((s, l) => s + l.totalCost, 0);
      const dayExpenses = logs
        .filter(l => l.transactionDate.toDateString() === dateStr && l.transactionType === 'expense')
        .reduce((s, l) => s + l.totalCost, 0);
      days.push({
        date: new Date(current),
        dayOfMonth: current.getDate(),
        dayName: current.toLocaleDateString('en-US', { weekday: 'short' }),
        income: dayIncome,
        expenses: dayExpenses,
      });
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [logs, selectedMonth]);

  const maxDailyAmount = useMemo(() =>
    Math.max(...dailyData.flatMap(d => [d.income, d.expenses]), 500),
  [dailyData]);

  const groupedLogs = useMemo(() => {
    const groups: Record<string, typeof allLogs> = {};
    allLogs.forEach(log => {
      const dateKey = formatDate(log.transactionDate, 'short');
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(log);
    });
    return Object.entries(groups).sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime());
  }, [allLogs]);

  useEffect(() => {
    return () => { if (refreshTimeout.current) clearTimeout(refreshTimeout.current); };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    refreshTimeout.current = setTimeout(() => setRefreshing(false), 500);
  };

  const monthName = selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.success} />
        }
      >
        <View style={{ padding: 20 }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 16, marginTop: 12,
          }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.textPrimary }}>
              Finance Tracker
            </Text>
            <Pressable
              onPress={() => router.push('/finance/analytics')}
              style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.borderSurface,
                borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, gap: 4,
              }}
            >
              <Ionicons name="bar-chart" size={16} color={colors.moduleFinance} />
              <Text style={{ color: colors.moduleFinance, fontSize: 13, fontWeight: '600' }}>Analytics</Text>
            </Pressable>
          </View>

          {/* Balance Card */}
          <View style={{
            backgroundColor: totalBalance >= 0 ? colors.moduleFinance : colors.danger,
            borderRadius: 14, padding: 18, marginBottom: 14,
          }}>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 4, fontWeight: '500' }}>
              Total Balance
            </Text>
            <Text style={{ color: '#ffffff', fontSize: 28, fontWeight: 'bold', marginBottom: 12 }}>
              {formatCurrency(totalBalance)}
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{
                flex: 1, backgroundColor: 'rgba(255,255,255,0.12)',
                borderRadius: 10, padding: 10,
              }}>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, marginBottom: 3 }}>
                  Income · {monthName.split(' ')[0]}
                </Text>
                <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: 'bold' }}>
                  +{formatCurrency(stats.income)}
                </Text>
              </View>
              <View style={{
                flex: 1, backgroundColor: 'rgba(255,255,255,0.12)',
                borderRadius: 10, padding: 10,
              }}>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, marginBottom: 3 }}>
                  Expenses · {monthName.split(' ')[0]}
                </Text>
                <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: 'bold' }}>
                  -{formatCurrency(stats.expenses)}
                </Text>
              </View>
            </View>
          </View>

          {/* Tab Toggle */}
          <View style={{
            flexDirection: 'row', backgroundColor: colors.bgSurface,
            borderRadius: 10, padding: 4, marginBottom: 16,
            borderWidth: 1, borderColor: colors.borderSurface,
          }}>
            {(['transactions', 'graph'] as TabView[]).map(tab => (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={{
                  flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8,
                  backgroundColor: activeTab === tab ? colors.moduleFinance : 'transparent',
                }}
              >
                <Text style={{
                  color: activeTab === tab ? '#ffffff' : colors.textSecondary,
                  fontWeight: '600', fontSize: 13,
                }}>
                  {tab === 'transactions' ? 'Transactions' : 'Graph'}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Graph Tab */}
          {activeTab === 'graph' && (
            <View>
              {/* Month Navigation */}
              <View style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.borderSurface,
                borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12,
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

              {/* Full-Month Bar Chart */}
              <View style={{
                backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.borderSurface,
                borderRadius: 14, padding: 14, marginBottom: 16,
              }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: 6, paddingBottom: 4 }}>
                    {dailyData.map((day, index) => {
                      const isToday = day.date.toDateString() === new Date().toDateString();
                      const incomeH = day.income > 0 ? Math.max((day.income / maxDailyAmount) * 72, 4) : 0;
                      const expenseH = day.expenses > 0 ? Math.max((day.expenses / maxDailyAmount) * 72, 4) : 0;

                      return (
                        <View key={index} style={{ width: 28, alignItems: 'center' }}>
                          {/* Day number */}
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

                          {/* Bar area */}
                          <View style={{ height: 80, justifyContent: 'flex-end', width: '100%', alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row', gap: 2, alignItems: 'flex-end' }}>
                              <View style={{
                                width: 9, height: incomeH || 2,
                                backgroundColor: incomeH > 0 ? colors.success : colors.bgSurfaceHover,
                                borderRadius: 2,
                              }} />
                              <View style={{
                                width: 9, height: expenseH || 2,
                                backgroundColor: expenseH > 0 ? colors.danger : colors.bgSurfaceHover,
                                borderRadius: 2,
                              }} />
                            </View>
                          </View>

                          {/* Day initial */}
                          <Text style={{
                            color: colors.textTertiary, fontSize: 8, marginTop: 4,
                          }}>
                            {day.dayName.charAt(0)}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </ScrollView>

                {/* Legend */}
                <View style={{
                  flexDirection: 'row', justifyContent: 'center', gap: 14,
                  marginTop: 10, paddingTop: 10,
                  borderTopWidth: 1, borderTopColor: colors.borderSurface,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 10, height: 10, backgroundColor: colors.success, borderRadius: 2, marginRight: 5 }} />
                    <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Income</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 10, height: 10, backgroundColor: colors.danger, borderRadius: 2, marginRight: 5 }} />
                    <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Expenses</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <View style={{ marginBottom: 20 }}>
              <View style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12,
              }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>
                  All Transactions
                </Text>
                <View style={{
                  backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.borderSurface,
                  paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10,
                }}>
                  <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 12 }}>
                    {allLogs.length}
                  </Text>
                </View>
              </View>

              {allLogs.length === 0 ? (
                <EmptyState
                  icon="wallet-outline"
                  title="No Transactions Yet"
                  description="Start tracking your finances by adding a transaction"
                  action={
                    <Button
                      onPress={() => router.push('/finance/add')}
                      title="Add Transaction"
                      icon="add"
                      variant="success"
                    />
                  }
                />
              ) : (
                <View style={{ gap: 12 }}>
                  {groupedLogs.map(([date, dateLogs]) => (
                    <View key={date}>
                      <Text style={{
                        color: colors.textTertiary, fontSize: 11, fontWeight: '600',
                        marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5,
                      }}>
                        {date}
                      </Text>
                      <View style={{ gap: 6 }}>
                        {dateLogs.map(log => {
                          const typeConfig = getTransactionTypeConfig(log.transactionType);
                          const isIncome = log.transactionType === 'income';

                          return (
                            <Pressable
                              key={log.id}
                              onPress={() => router.push(`/finance/${log.id}`)}
                              style={{
                                backgroundColor: colors.bgSurface, borderWidth: 1,
                                borderColor: colors.borderSurface, borderRadius: 12, padding: 12,
                              }}
                            >
                              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ position: 'relative', marginRight: 12 }}>
                                  <View style={{
                                    backgroundColor: typeConfig.hex, borderRadius: 20,
                                    width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
                                  }}>
                                    <Ionicons name={typeConfig.icon} size={18} color="white" />
                                  </View>
                                  <View style={{
                                    position: 'absolute', bottom: -2, right: -2,
                                    backgroundColor: isIncome ? colors.success : colors.danger,
                                    borderRadius: 8, width: 16, height: 16,
                                    alignItems: 'center', justifyContent: 'center',
                                    borderWidth: 2, borderColor: colors.bgSurface,
                                  }}>
                                    <Ionicons name={isIncome ? 'arrow-up' : 'arrow-down'} size={8} color="white" />
                                  </View>
                                </View>

                                <View style={{ flex: 1 }}>
                                  <Text style={{
                                    color: colors.textPrimary, fontWeight: '600',
                                    fontSize: 14, marginBottom: 3,
                                  }}>
                                    {log.item}
                                  </Text>
                                  <View style={{
                                    flexDirection: 'row', alignItems: 'center',
                                    flexWrap: 'wrap', gap: 6,
                                  }}>
                                    <View style={{
                                      backgroundColor: colors.bgSurfaceHover,
                                      paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
                                    }}>
                                      <Text style={{
                                        color: colors.textSecondary, fontSize: 10, fontWeight: '500',
                                      }}>
                                        {log.typeCategory}
                                      </Text>
                                    </View>
                                    {log.location && (
                                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Ionicons name="location" size={10} color={colors.textTertiary} />
                                        <Text style={{ color: colors.textTertiary, fontSize: 10, marginLeft: 2 }}>
                                          {log.location}
                                        </Text>
                                      </View>
                                    )}
                                  </View>
                                </View>

                                <View style={{ alignItems: 'flex-end', marginLeft: 6 }}>
                                  <Text style={{
                                    fontWeight: 'bold', fontSize: 15,
                                    color: isIncome ? colors.success : colors.danger,
                                  }}>
                                    {isIncome ? '+' : '-'}{formatCurrency(log.totalCost, log.currency as CurrencyCode)}
                                  </Text>
                                  {log.quantity > 1 && (
                                    <Text style={{ color: colors.textTertiary, fontSize: 10 }}>
                                      {log.quantity}x {formatCurrency(log.cost, log.currency as CurrencyCode)}
                                    </Text>
                                  )}
                                </View>
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
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      <FloatingActionButton
        onPress={() => router.push('/finance/add')}
        icon="add"
        color="bg-green-600"
      />
    </SafeAreaView>
  );
}
