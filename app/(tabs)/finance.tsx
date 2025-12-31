// app/(tabs)/finance.tsx - INLINE STYLES VERSION
import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFinanceLogs } from '@/src/database/hooks/useDatabase';
import { formatCurrency } from '@/src/utils/formatters';
import { formatDate, getStartOfMonth, getEndOfMonth, addMonths } from '@/src/utils/dateHelpers';
import { getTransactionTypeConfig } from '@/src/lib/constants';
import FloatingActionButton from '@/src/components/common/FloatingActionButton';
import EmptyState from '@/src/components/common/EmptyState';
import Button from '@/src/components/common/Button';
import StatCard from '@/src/components/finance/StatCard';
import type { CurrencyCode } from '@/src/types/database.types';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export default function FinanceScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

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
  };

  const handleNextMonth = () => {
    setSelectedMonth(addMonths(selectedMonth, 1));
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
        <View style={{ padding: 24 }}>
          {/* Header */}
          <View style={{ marginBottom: 24, marginTop: 16 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 8 }}>
              Finance Tracker
            </Text>
          </View>

          {/* Month Navigator */}
          <View style={{
            backgroundColor: colors.bgSurface,
            borderWidth: 1,
            borderColor: colors.borderSurface,
            borderRadius: 16,
            padding: 16,
            marginBottom: 16
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Pressable
                onPress={handlePreviousMonth}
                style={{ backgroundColor: colors.bgSurfaceHover, borderRadius: 8, padding: 12 }}
              >
                <Ionicons name="chevron-back" size={20} color="#64748b" />
              </Pressable>

              <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: 'bold' }}>
                {monthName}
              </Text>

              <Pressable
                onPress={handleNextMonth}
                style={{ backgroundColor: colors.bgSurfaceHover, borderRadius: 8, padding: 12 }}
              >
                <Ionicons name="chevron-forward" size={20} color="#64748b" />
              </Pressable>
            </View>
          </View>

          {/* Balance Card */}
          <View style={{ backgroundColor: colors.moduleFinance, borderRadius: 16, padding: 24, marginBottom: 16 }}>
            <Text style={{ color: '#86efac', fontSize: 14, marginBottom: 4, fontWeight: '500' }}>Current Balance</Text>
            <Text style={{ color: '#ffffff', fontSize: 36, fontWeight: 'bold', marginBottom: 8 }}>
              {formatCurrency(stats.balance)}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons
                name={stats.balance >= 0 ? 'trending-up' : 'trending-down'}
                size={16}
                color={stats.balance >= 0 ? '#86efac' : '#fca5a5'}
              />
              <Text style={{ marginLeft: 4, fontSize: 14, fontWeight: '500', color: '#d1fae5' }}>
                {stats.balance >= 0 ? 'Positive' : 'Negative'} balance
              </Text>
            </View>
          </View>

          {/* Income & Expense Stats */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
            <StatCard
              icon="arrow-down"
              label="Income"
              value={formatCurrency(stats.income)}
              color="bg-green-500"
              change={`${logs.filter((l) => l.transactionType === 'income').length} transactions`}
              changeType="neutral"
            />
            <StatCard
              icon="arrow-up"
              label="Expenses"
              value={formatCurrency(stats.expenses)}
              color="bg-red-500"
              change={`${logs.filter((l) => l.transactionType === 'expense').length} transactions`}
              changeType="neutral"
            />
          </View>

          {/* Transactions List */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={{ fontSize: 20, fontWeight: '600', color: colors.textPrimary }}>
                Recent Transactions
              </Text>
              <View style={{
                backgroundColor: colors.bgSurface,
                borderWidth: 1,
                borderColor: colors.borderSurface,
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 12
              }}>
                <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 14 }}>
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
              <View style={{ gap: 16 }}>
                {groupedLogs.map(([date, dateLogs]) => (
                  <View key={date}>
                    <Text style={{
                      color: colors.textTertiary,
                      fontSize: 14,
                      fontWeight: '600',
                      marginBottom: 8,
                      textTransform: 'uppercase',
                      letterSpacing: 1
                    }}>
                      {date}
                    </Text>
                    <View style={{ gap: 8 }}>
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
                              borderRadius: 16,
                              padding: 16
                            }}
                          >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <View style={{ position: 'relative', marginRight: 16 }}>
                                <View style={{
                                  backgroundColor: typeConfig.color,
                                  borderRadius: 24,
                                  width: 48,
                                  height: 48,
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <Ionicons name={typeConfig.icon} size={20} color="white" />
                                </View>
                                <View style={{
                                  position: 'absolute',
                                  bottom: -4,
                                  right: -4,
                                  backgroundColor: isIncome ? '#22c55e' : '#ef4444',
                                  borderRadius: 10,
                                  width: 20,
                                  height: 20,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderWidth: 2,
                                  borderColor: colors.bgSurface
                                }}>
                                  <Ionicons name={isIncome ? 'arrow-down' : 'arrow-up'} size={10} color="white" />
                                </View>
                              </View>

                              <View style={{ flex: 1 }}>
                                <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 16, marginBottom: 4 }}>
                                  {log.item}
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                                  <View style={{ backgroundColor: colors.bgSurfaceHover, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                                    <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '500' }}>
                                      {log.typeCategory}
                                    </Text>
                                  </View>
                                  {log.location && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                      <Ionicons name="location" size={12} color="#64748b" />
                                      <Text style={{ color: colors.textTertiary, fontSize: 12, marginLeft: 4 }}>
                                        {log.location}
                                      </Text>
                                    </View>
                                  )}
                                </View>
                              </View>

                              <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
                                <Text style={{
                                  fontWeight: 'bold',
                                  fontSize: 18,
                                  color: isIncome ? '#22c55e' : '#ef4444'
                                }}>
                                  {isIncome ? '+' : '-'}
                                  {formatCurrency(log.totalCost, log.currency as CurrencyCode)}
                                </Text>
                                {log.quantity > 1 && (
                                  <Text style={{ color: colors.textTertiary, fontSize: 12 }}>
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
          <View style={{ height: 128 }} />
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