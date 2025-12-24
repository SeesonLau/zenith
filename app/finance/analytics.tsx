// app/finance/analytics.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFinanceLogs } from '@/src/database/hooks/useDatabase';
import { formatCurrency } from '@/src/utils/formatters';
import { getStartOfMonth, getEndOfMonth, addMonths } from '@/src/utils/dateHelpers';
import type { CurrencyCode } from '@/src/types/database.types';

export default function FinanceAnalyticsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const startDate = getStartOfMonth(selectedMonth);
  const endDate = getEndOfMonth(selectedMonth);
  const logs = useFinanceLogs(startDate, endDate);

  // Calculate statistics
  const analytics = useMemo(() => {
    const income = logs.filter((l) => l.transactionType === 'income');
    const expenses = logs.filter((l) => l.transactionType === 'expense');

    const totalIncome = income.reduce((sum, l) => sum + l.totalCost, 0);
    const totalExpenses = expenses.reduce((sum, l) => sum + l.totalCost, 0);
    const balance = totalIncome - totalExpenses;

    // By category
    const categoryStats: Record<string, { total: number; count: number }> = {};
    expenses.forEach((log) => {
      if (!categoryStats[log.typeCategory]) {
        categoryStats[log.typeCategory] = { total: 0, count: 0 };
      }
      categoryStats[log.typeCategory].total += log.totalCost;
      categoryStats[log.typeCategory].count++;
    });

    // Top categories
    const topCategories = Object.entries(categoryStats)
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, 5);

    // Average transaction
    const avgIncome = income.length > 0 ? totalIncome / income.length : 0;
    const avgExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;

    // Largest transactions
    const largestIncome = income.sort((a, b) => b.totalCost - a.totalCost)[0];
    const largestExpense = expenses.sort((a, b) => b.totalCost - a.totalCost)[0];

    return {
      totalIncome,
      totalExpenses,
      balance,
      topCategories,
      avgIncome,
      avgExpense,
      largestIncome,
      largestExpense,
      incomeCount: income.length,
      expenseCount: expenses.length,
    };
  }, [logs]);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  const changeMonth = (delta: number) => {
    setSelectedMonth(addMonths(selectedMonth, delta));
  };

  const getPercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
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
            <Text className="text-2xl font-bold text-white flex-1">Analytics</Text>
          </View>

          {/* Month Selector */}
          <View className="flex-row items-center justify-between bg-slate-800 border border-slate-700 rounded-xl p-4 mb-6">
            <Pressable onPress={() => changeMonth(-1)} className="p-2">
              <Ionicons name="chevron-back" size={24} color="white" />
            </Pressable>
            <Text className="text-white text-lg font-semibold">
              {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
            <Pressable onPress={() => changeMonth(1)} className="p-2">
              <Ionicons name="chevron-forward" size={24} color="white" />
            </Pressable>
          </View>

          {/* Summary Cards */}
          <View className="mb-6">
            <View className="bg-gradient-to-br from-sky-900/30 to-sky-800/20 border border-sky-700 rounded-2xl p-6 mb-4">
              <Text className="text-sky-400 text-sm mb-1">Net Balance</Text>
              <Text className="text-white text-4xl font-bold mb-2">
                {formatCurrency(analytics.balance)}
              </Text>
              <View className="flex-row items-center">
                <Ionicons
                  name={analytics.balance >= 0 ? 'trending-up' : 'trending-down'}
                  size={16}
                  color={analytics.balance >= 0 ? '#22c55e' : '#ef4444'}
                />
                <Text className={`ml-1 text-sm ${analytics.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {analytics.balance >= 0 ? 'Surplus' : 'Deficit'}
                </Text>
              </View>
            </View>

            <View className="flex-row gap-3 mb-4">
              <View className="flex-1 bg-green-900/30 border border-green-700 rounded-xl p-4">
                <Text className="text-green-400 text-xs mb-1">Total Income</Text>
                <Text className="text-white text-2xl font-bold mb-1">
                  {formatCurrency(analytics.totalIncome)}
                </Text>
                <Text className="text-green-300 text-xs">
                  {analytics.incomeCount} transactions
                </Text>
              </View>
              <View className="flex-1 bg-red-900/30 border border-red-700 rounded-xl p-4">
                <Text className="text-red-400 text-xs mb-1">Total Expenses</Text>
                <Text className="text-white text-2xl font-bold mb-1">
                  {formatCurrency(analytics.totalExpenses)}
                </Text>
                <Text className="text-red-300 text-xs">
                  {analytics.expenseCount} transactions
                </Text>
              </View>
            </View>
          </View>

          {/* Top Categories */}
          <View className="mb-6">
            <Text className="text-white text-xl font-semibold mb-4">Top Spending Categories</Text>
            {analytics.topCategories.length === 0 ? (
              <View className="bg-slate-800 border border-slate-700 rounded-xl p-6 items-center">
                <Ionicons name="analytics-outline" size={40} color="#64748b" />
                <Text className="text-slate-400 mt-2">No expense data yet</Text>
              </View>
            ) : (
              <View className="space-y-3">
                {analytics.topCategories.map(([category, data], index) => {
                  const percentage = getPercentage(data.total, analytics.totalExpenses);
                  return (
                    <View key={category} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                      <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center flex-1">
                          <View className="bg-red-500 rounded-full w-8 h-8 items-center justify-center mr-3">
                            <Text className="text-white text-xs font-bold">#{index + 1}</Text>
                          </View>
                          <View className="flex-1">
                            <Text className="text-white font-semibold">{category}</Text>
                            <Text className="text-slate-400 text-xs">{data.count} transactions</Text>
                          </View>
                        </View>
                        <View className="items-end">
                          <Text className="text-white font-bold">{formatCurrency(data.total)}</Text>
                          <Text className="text-red-400 text-xs">{percentage}%</Text>
                        </View>
                      </View>
                      <View className="bg-slate-700 h-2 rounded-full overflow-hidden">
                        <View className="bg-red-500 h-full" style={{ width: `${percentage}%` }} />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Averages */}
          <View className="mb-6">
            <Text className="text-white text-xl font-semibold mb-4">Averages</Text>
            <View className="flex-row gap-3">
              <View className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-4">
                <Ionicons name="arrow-down" size={20} color="#22c55e" />
                <Text className="text-slate-400 text-xs mt-2">Avg Income</Text>
                <Text className="text-white text-xl font-bold">
                  {formatCurrency(analytics.avgIncome)}
                </Text>
              </View>
              <View className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-4">
                <Ionicons name="arrow-up" size={20} color="#ef4444" />
                <Text className="text-slate-400 text-xs mt-2">Avg Expense</Text>
                <Text className="text-white text-xl font-bold">
                  {formatCurrency(analytics.avgExpense)}
                </Text>
              </View>
            </View>
          </View>

          {/* Largest Transactions */}
          <View className="mb-6">
            <Text className="text-white text-xl font-semibold mb-4">Largest Transactions</Text>
            <View className="space-y-3">
              {analytics.largestIncome && (
                <View className="bg-green-900/20 border border-green-700 rounded-xl p-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-green-400 text-xs mb-1">Largest Income</Text>
                      <Text className="text-white font-semibold">{analytics.largestIncome.item}</Text>
                      <Text className="text-slate-400 text-xs">{analytics.largestIncome.typeCategory}</Text>
                    </View>
                    <Text className="text-green-400 text-xl font-bold">
                      +{formatCurrency(analytics.largestIncome.totalCost, analytics.largestIncome.currency as CurrencyCode)}
                    </Text>
                  </View>
                </View>
              )}
              {analytics.largestExpense && (
                <View className="bg-red-900/20 border border-red-700 rounded-xl p-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-red-400 text-xs mb-1">Largest Expense</Text>
                      <Text className="text-white font-semibold">{analytics.largestExpense.item}</Text>
                      <Text className="text-slate-400 text-xs">{analytics.largestExpense.typeCategory}</Text>
                    </View>
                    <Text className="text-red-400 text-xl font-bold">
                      -{formatCurrency(analytics.largestExpense.totalCost, analytics.largestExpense.currency as CurrencyCode)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Info Card */}
          <View className="bg-sky-900/20 border border-sky-700 rounded-xl p-4">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#38bdf8" style={{ marginRight: 8, marginTop: 2 }} />
              <View className="flex-1">
                <Text className="text-sky-300 text-sm font-semibold mb-1">Analytics Insight</Text>
                <Text className="text-sky-200 text-xs">
                  This analysis is based on {logs.length} transactions from {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}