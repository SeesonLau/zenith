// app/(tabs)/finance.tsx - REDESIGNED WITH CALENDAR ABOVE STATS
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFinanceLogs } from '@/src/database/hooks/useDatabase';
import { formatCurrency } from '@/src/utils/formatters';
import { formatDate, getStartOfMonth, getEndOfMonth, addMonths, getStartOfWeek, addDays } from '@/src/utils/dateHelpers';
import { getTransactionTypeConfig } from '@/src/lib/constants';
import FloatingActionButton from '@/src/components/common/FloatingActionButton';
import EmptyState from '@/src/components/common/EmptyState';
import Button from '@/src/components/common/Button';
import type { CurrencyCode } from '@/src/types/database.types';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export default function FinanceScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  
  // Find the week index that contains today's date
  const getTodayWeekIndex = (weeks: any[]) => {
    const today = new Date();
    const todayStr = today.toDateString();
    
    for (let i = 0; i < weeks.length; i++) {
      const week = weeks[i];
      const hasToday = week.days.some((day: any) => day.date.toDateString() === todayStr);
      if (hasToday) return i;
    }
    return 0; // fallback to first week
  };
  
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);

  const startDate = getStartOfMonth(selectedMonth);
  const endDate = getEndOfMonth(selectedMonth);
  const logs = useFinanceLogs(startDate, endDate);

  const stats = useMemo(() => {
    const income = logs
      .filter((log) => log.transactionType === 'income')
      .reduce((sum, log) => sum + log.totalCost, 0);

    const expenses = logs
      .filter((log) => log.transactionType === 'expense')
      .reduce((sum, log) => sum + log.totalCost, 0);

    const balance = income - expenses;

    return { income, expenses, balance };
  }, [logs]);

  // Calculate weekly data for calendar bar graph
  const weeklyData = useMemo(() => {
    const weeks: Array<{
      weekStart: Date;
      weekEnd: Date;
      days: Array<{
        date: Date;
        dayName: string;
        income: number;
        expenses: number;
        dayOfMonth: number;
      }>;
    }> = [];

    const monthStart = getStartOfMonth(selectedMonth);
    const monthEnd = getEndOfMonth(selectedMonth);
    
    let currentWeekStart = getStartOfWeek(monthStart);
    
    while (currentWeekStart <= monthEnd) {
      const weekEnd = addDays(currentWeekStart, 6);
      const days = [];

      for (let i = 0; i < 7; i++) {
        const currentDay = addDays(currentWeekStart, i);
        
        const dayIncome = logs
          .filter((log) => {
            const logDate = log.transactionDate;
            return logDate.toDateString() === currentDay.toDateString() && 
                   log.transactionType === 'income';
          })
          .reduce((sum, log) => sum + log.totalCost, 0);

        const dayExpenses = logs
          .filter((log) => {
            const logDate = log.transactionDate;
            return logDate.toDateString() === currentDay.toDateString() && 
                   log.transactionType === 'expense';
          })
          .reduce((sum, log) => sum + log.totalCost, 0);

        days.push({
          date: currentDay,
          dayName: currentDay.toLocaleDateString('en-US', { weekday: 'short' }),
          income: dayIncome,
          expenses: dayExpenses,
          dayOfMonth: currentDay.getDate(),
        });
      }

      weeks.push({
        weekStart: currentWeekStart,
        weekEnd,
        days,
      });

      currentWeekStart = addDays(currentWeekStart, 7);
    }

    return weeks;
  }, [logs, selectedMonth]);

  // Set the week index to today's week when weeklyData changes
  React.useEffect(() => {
    const todayIndex = getTodayWeekIndex(weeklyData);
    setSelectedWeekIndex(todayIndex);
  }, [weeklyData]);

  const currentWeek = weeklyData[selectedWeekIndex] || weeklyData[0];
  const maxDailyAmount = Math.max(
    ...currentWeek.days.flatMap(d => [d.income, d.expenses]),
    500 // Minimum scale
  );

  const groupedLogs = useMemo(() => {
    const groups: Record<string, typeof logs> = {};

    logs.forEach((log) => {
      const dateKey = formatDate(log.transactionDate, 'short');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(log);
    });

    return Object.entries(groups).sort(
      ([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime()
    );
  }, [logs]);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  const handlePreviousMonth = () => {
    setSelectedMonth(addMonths(selectedMonth, -1));
    // Don't reset to 0, let the useEffect handle it
  };

  const handleNextMonth = () => {
    setSelectedMonth(addMonths(selectedMonth, 1));
    // Don't reset to 0, let the useEffect handle it
  };

  const handlePreviousWeek = () => {
    if (selectedWeekIndex > 0) {
      setSelectedWeekIndex(selectedWeekIndex - 1);
    }
  };

  const handleNextWeek = () => {
    if (selectedWeekIndex < weeklyData.length - 1) {
      setSelectedWeekIndex(selectedWeekIndex + 1);
    }
  };

  const monthName = selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />
        }
      >
        <View style={{ padding: 20 }}>
          {/* Header */}
          <View style={{ marginBottom: 16, marginTop: 12 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 4 }}>
              Finance Tracker
            </Text>
          </View>

          {/* Calendar Bar Graph with Navigation */}
          <View style={{
            backgroundColor: colors.bgSurface,
            borderWidth: 1,
            borderColor: colors.borderSurface,
            borderRadius: 14,
            padding: 14,
            marginBottom: 16
          }}>
            {/* Month Navigation Header */}
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: 12
            }}>
              <Pressable
                onPress={handlePreviousMonth}
                style={{ 
                  backgroundColor: colors.bgSurfaceHover, 
                  borderRadius: 8, 
                  padding: 6
                }}
              >
                <Ionicons name="chevron-back" size={16} color={colors.textSecondary} />
              </Pressable>

              <View style={{ alignItems: 'center' }}>
                <Text style={{ 
                  color: colors.textPrimary, 
                  fontSize: 15, 
                  fontWeight: 'bold' 
                }}>
                  {monthName}
                </Text>
                <Text style={{ 
                  color: colors.textTertiary, 
                  fontSize: 10, 
                  marginTop: 2 
                }}>
                  Week {selectedWeekIndex + 1} of {weeklyData.length}
                </Text>
              </View>

              <Pressable
                onPress={handleNextMonth}
                style={{ 
                  backgroundColor: colors.bgSurfaceHover, 
                  borderRadius: 8, 
                  padding: 6
                }}
              >
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* Week Navigation */}
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 12,
              marginBottom: 12
            }}>
              <Pressable
                onPress={handlePreviousWeek}
                disabled={selectedWeekIndex === 0}
                style={{ 
                  backgroundColor: selectedWeekIndex === 0 ? colors.bgSurfaceHover + '40' : colors.bgSurfaceHover,
                  borderRadius: 6, 
                  padding: 4,
                  opacity: selectedWeekIndex === 0 ? 0.3 : 1
                }}
              >
                <Ionicons name="chevron-back" size={14} color={colors.textSecondary} />
              </Pressable>

              <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                {currentWeek.days[0].dayOfMonth} - {currentWeek.days[6].dayOfMonth}
              </Text>

              <Pressable
                onPress={handleNextWeek}
                disabled={selectedWeekIndex === weeklyData.length - 1}
                style={{ 
                  backgroundColor: selectedWeekIndex === weeklyData.length - 1 ? colors.bgSurfaceHover + '40' : colors.bgSurfaceHover,
                  borderRadius: 6, 
                  padding: 4,
                  opacity: selectedWeekIndex === weeklyData.length - 1 ? 0.3 : 1
                }}
              >
                <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* Calendar Bar Graph - 7 Days */}
            <View style={{ flexDirection: 'row', gap: 6, height: 120 }}>
              {currentWeek.days.map((day, index) => {
                const isToday = day.date.toDateString() === new Date().toDateString();
                const isCurrentMonth = day.date.getMonth() === selectedMonth.getMonth();
                
                return (
                  <View 
                    key={index} 
                    style={{ 
                      flex: 1, 
                      justifyContent: 'flex-end', 
                      alignItems: 'center',
                      opacity: isCurrentMonth ? 1 : 0.3
                    }}
                  >
                    {/* Day Number */}
                    <View style={{
                      width: '60%',
                      alignItems: 'center',
                      marginBottom: 4,
                      // Changed to RGBA for transparency (0.5 = 50% opacity)
                      backgroundColor: isToday ? '#fef08a' : 'transparent',
                      // Increased radius for rounder edges
                      borderRadius: 6, 
                      paddingVertical: 2
                    }}>
                      <Text style={{ 
                        color: isToday ? '#854d0e' : colors.textPrimary, 
                        fontSize: 11, 
                        fontWeight: isToday ? 'bold' : '600'
                      }}>
                        {day.dayOfMonth}
                      </Text>
                    </View>

                    {/* Income Bar (Up) */}
                    <View style={{
                      width: '60%',
                      height: day.income > 0 ? Math.max((day.income / maxDailyAmount) * 80, 6) : 0,
                      backgroundColor: colors.success,
                      borderTopLeftRadius: 3,
                      borderTopRightRadius: 3,
                      marginBottom: 1
                    }} />
                    
                    {/* Expense Bar (Down) */}
                    <View style={{
                      width: '60%',
                      height: day.expenses > 0 ? Math.max((day.expenses / maxDailyAmount) * 80, 6) : 0,
                      backgroundColor: colors.danger,
                      borderBottomLeftRadius: 3,
                      borderBottomRightRadius: 3,
                      marginBottom: 4
                    }} />
                    
                    {/* Day Name */}
                    <Text style={{ 
                      color: colors.textTertiary, 
                      fontSize: 9, 
                      textAlign: 'center',
                      fontWeight: '500'
                    }}>
                      {day.dayName}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Legend */}
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'center', 
              gap: 14, 
              marginTop: 10,
              paddingTop: 10,
              borderTopWidth: 1,
              borderTopColor: colors.borderSurface
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 10,
                  height: 10,
                  backgroundColor: colors.success,
                  borderRadius: 2,
                  marginRight: 5
                }} />
                <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Income</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 10,
                  height: 10,
                  backgroundColor: colors.danger,
                  borderRadius: 2,
                  marginRight: 5
                }} />
                <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Expenses</Text>
              </View>
            </View>
          </View>

          {/* Balance Card - Compact */}
          <View style={{ 
            backgroundColor: colors.moduleFinance, 
            borderRadius: 14, 
            padding: 18, 
            marginBottom: 14 
          }}>
            <Text style={{ color: '#86efac', fontSize: 12, marginBottom: 4, fontWeight: '500' }}>
              Current Balance
            </Text>
            <Text style={{ color: '#ffffff', fontSize: 28, fontWeight: 'bold', marginBottom: 6 }}>
              {formatCurrency(stats.balance)}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons
                name={stats.balance >= 0 ? 'trending-up' : 'trending-down'}
                size={14}
                color={stats.balance >= 0 ? '#86efac' : '#fca5a5'}
              />
              <Text style={{ marginLeft: 4, fontSize: 12, fontWeight: '500', color: '#d1fae5' }}>
                {stats.balance >= 0 ? 'Positive' : 'Negative'} balance
              </Text>
            </View>
          </View>

          {/* Income & Expense Stats - Compact */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
            <View style={{
              flex: 1,
              backgroundColor: colors.bgSurface,
              borderWidth: 1,
              borderColor: colors.borderSurface,
              borderRadius: 12,
              padding: 12
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <View style={{
                  backgroundColor: colors.success,
                  borderRadius: 14,
                  width: 24,
                  height: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 6
                }}>
                  <Ionicons name="arrow-down" size={12} color="white" />
                </View>
                <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Income</Text>
              </View>
              <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: 'bold' }}>
                {formatCurrency(stats.income)}
              </Text>
              <Text style={{ color: colors.textTertiary, fontSize: 10, marginTop: 2 }}>
                {logs.filter((l) => l.transactionType === 'income').length} transactions
              </Text>
            </View>

            <View style={{
              flex: 1,
              backgroundColor: colors.bgSurface,
              borderWidth: 1,
              borderColor: colors.borderSurface,
              borderRadius: 12,
              padding: 12
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <View style={{
                  backgroundColor: colors.danger,
                  borderRadius: 14,
                  width: 24,
                  height: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 6
                }}>
                  <Ionicons name="arrow-up" size={12} color="white" />
                </View>
                <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Expenses</Text>
              </View>
              <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: 'bold' }}>
                {formatCurrency(stats.expenses)}
              </Text>
              <Text style={{ color: colors.textTertiary, fontSize: 10, marginTop: 2 }}>
                {logs.filter((l) => l.transactionType === 'expense').length} transactions
              </Text>
            </View>
          </View>

          {/* Transactions List */}
          <View style={{ marginBottom: 20 }}>
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: 12 
            }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>
                Recent Transactions
              </Text>
              <View style={{
                backgroundColor: colors.bgSurface,
                borderWidth: 1,
                borderColor: colors.borderSurface,
                paddingHorizontal: 10,
                paddingVertical: 3,
                borderRadius: 10
              }}>
                <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 12 }}>
                  {logs.length}
                </Text>
              </View>
            </View>

            {logs.length === 0 ? (
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
                        const typeConfig = getTransactionTypeConfig(log.transactionType);
                        const isIncome = log.transactionType === 'income';
                        
                        return (
                          <Pressable
                            key={log.id}
                            onPress={() => router.push(`/finance/${log.id}`)}
                            style={{
                              backgroundColor: colors.bgSurface,
                              borderWidth: 1,
                              borderColor: colors.borderSurface,
                              borderRadius: 12,
                              padding: 12
                            }}
                          >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <View style={{ position: 'relative', marginRight: 12 }}>
                                <View style={{
                                  backgroundColor: typeConfig.color,
                                  borderRadius: 20,
                                  width: 40,
                                  height: 40,
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <Ionicons name={typeConfig.icon} size={18} color="white" />
                                </View>
                                <View style={{
                                  position: 'absolute',
                                  bottom: -2,
                                  right: -2,
                                  backgroundColor: isIncome ? colors.success : colors.danger,
                                  borderRadius: 8,
                                  width: 16,
                                  height: 16,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderWidth: 2,
                                  borderColor: colors.bgSurface
                                }}>
                                  <Ionicons name={isIncome ? 'arrow-up' : 'arrow-down'} size={8} color="white" />
                                </View>
                              </View>

                              <View style={{ flex: 1 }}>
                                <Text style={{ 
                                  color: colors.textPrimary, 
                                  fontWeight: '600', 
                                  fontSize: 14, 
                                  marginBottom: 3 
                                }}>
                                  {log.item}
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
                                      {log.typeCategory}
                                    </Text>
                                  </View>
                                  {log.location && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                      <Ionicons name="location" size={10} color={colors.textTertiary} />
                                      <Text style={{ 
                                        color: colors.textTertiary, 
                                        fontSize: 10, 
                                        marginLeft: 2 
                                      }}>
                                        {log.location}
                                      </Text>
                                    </View>
                                  )}
                                </View>
                              </View>

                              <View style={{ alignItems: 'flex-end', marginLeft: 6 }}>
                                <Text style={{
                                  fontWeight: 'bold',
                                  fontSize: 15,
                                  color: isIncome ? colors.success : colors.danger
                                }}>
                                  {isIncome ? '+' : '-'}
                                  {formatCurrency(log.totalCost, log.currency as CurrencyCode)}
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

          {/* Bottom Padding for FAB */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton
        onPress={() => router.push('/finance/add')}
        icon="add"
        color="bg-green-600"
      />
    </SafeAreaView>
  );
}