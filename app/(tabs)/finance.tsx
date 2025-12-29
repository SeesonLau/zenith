// app/(tabs)/finance.tsx (UPDATED - Keep most of it, just update the icon imports)
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFinanceLogs } from '@/src/database/hooks/useDatabase';
import { formatCurrency } from '@/src/utils/formatters';
import { formatDate, getStartOfMonth, getEndOfMonth } from '@/src/utils/dateHelpers';
import { getTransactionTypeConfig } from '@/src/lib/constants';
import FloatingActionButton from '@/src/components/common/FloatingActionButton';
import EmptyState from '@/src/components/common/EmptyState';
import Button from '@/src/components/common/Button';
import StatCard from '@/src/components/finance/StatCard';
import type { CurrencyCode } from '@/src/types/database.types';

export default function FinanceScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth] = useState(new Date());

  const startDate = getStartOfMonth(selectedMonth);
  const endDate = getEndOfMonth(selectedMonth);
  const logs = useFinanceLogs(startDate, endDate);

  // Calculate statistics
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

  // Group by date
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
            <Text className="text-3xl font-bold text-white mb-2">Finance Tracker</Text>
            <Text className="text-slate-400 text-base">
              Track your income and expenses
            </Text>
          </View>

          {/* Summary Cards */}
          <View className="mb-6">
            {/* Balance Card */}
            <View className="gradient-green border border-green-700 rounded-2xl p-6 mb-4">
              <Text className="text-green-400 text-sm mb-1">Current Balance</Text>
              <Text className="text-white text-4xl font-bold mb-2">
                {formatCurrency(stats.balance)}
              </Text>
              <View className="flex-row items-center">
                <Ionicons
                  name={stats.balance >= 0 ? 'trending-up' : 'trending-down'}
                  size={16}
                  color={stats.balance >= 0 ? '#22c55e' : '#ef4444'}
                />
                <Text
                  className={`ml-1 text-sm ${
                    stats.balance >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {stats.balance >= 0 ? 'Positive' : 'Negative'} balance
                </Text>
              </View>
            </View>

            {/* Income & Expense Stats */}
            <View className="flex-row gap-3">
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
          </View>

          {/* Transactions List */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-semibold text-white">Recent Transactions</Text>
              <View className="bg-slate-800 px-3 py-1 rounded-full">
                <Text className="text-slate-300 font-semibold">{logs.length}</Text>
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
              <View className="space-y-4">
                {groupedLogs.map(([date, dateLogs]) => (
                  <View key={date}>
                    <Text className="text-slate-500 text-sm font-semibold mb-2 uppercase">
                      {date}
                    </Text>
                    <View className="space-y-2">
                      {dateLogs.map((log) => {
                        const typeConfig = getTransactionTypeConfig(log.transactionType);
                        
                        return (
                          <Pressable
                            key={log.id}
                            onPress={() => router.push(`/finance/${log.id}`)}
                            className="card p-4 active:bg-slate-700"
                          >
                            <View className="flex-row items-center">
                              <View
                                className={`${typeConfig.color} rounded-full w-12 h-12 items-center justify-center mr-4`}
                              >
                                <Ionicons
                                  name={typeConfig.icon}
                                  size={20}
                                  color="white"
                                />
                              </View>
                              <View className="flex-1">
                                <Text className="text-white font-semibold text-base mb-1">
                                  {log.item}
                                </Text>
                                <View className="flex-row items-center">
                                  <View className="bg-slate-700 px-2 py-1 rounded mr-2">
                                    <Text className="text-slate-300 text-xs">
                                      {log.typeCategory}
                                    </Text>
                                  </View>
                                  {log.location && (
                                    <View className="flex-row items-center">
                                      <Ionicons
                                        name="location"
                                        size={12}
                                        color="#64748b"
                                      />
                                      <Text className="text-slate-500 text-xs ml-1">
                                        {log.location}
                                      </Text>
                                    </View>
                                  )}
                                </View>
                              </View>
                              <View className="items-end">
                                <Text
                                  className={`font-bold text-lg ${typeConfig.textColor}`}
                                >
                                  {log.transactionType === 'income' ? '+' : '-'}
                                  {formatCurrency(log.totalCost, log.currency as CurrencyCode)}
                                </Text>
                                <Text className="text-slate-500 text-xs">
                                  {log.quantity > 1 &&
                                    `${log.quantity}x ${formatCurrency(log.cost, log.currency as CurrencyCode)}`}
                                </Text>
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
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton
        onPress={() => router.push('/finance/add')}
        icon="add"
        color="bg-green-500"
      />
    </View>
  );
}