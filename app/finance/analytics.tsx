// app/finance/analytics.tsx (CREATE NEW)
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { database } from '@/src/database';
import { Q } from '@nozbe/watermelondb';
import type FinanceLog from '@/src/database/models/FinanceLog';
import { formatCurrency } from '@/src/utils/formatters';
import { getStartOfMonth, getEndOfMonth, addMonths } from '@/src/utils/dateHelpers';
import { getFinanceCategoryConfig, getTransactionTypeConfig } from '@/src/lib/constants';
import type { FinanceTypeCategory, CurrencyCode } from '@/src/types/database.types';

export default function FinanceAnalyticsScreen() {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [logs, setLogs] = useState<FinanceLog[]>([]);

  // Load logs for selected month
  React.useEffect(() => {
    const startDate = getStartOfMonth(selectedMonth);
    const endDate = getEndOfMonth(selectedMonth);

    const subscription = database
      .get<FinanceLog>('finance_logs')
      .query(
        Q.where('transaction_date', Q.gte(startDate.getTime())),
        Q.where('transaction_date', Q.lte(endDate.getTime())),
        Q.sortBy('transaction_date', Q.desc)
      )
      .observe()
      .subscribe(setLogs);

    return () => subscription.unsubscribe();
  }, [selectedMonth]);

  // Calculate analytics
  const analytics = useMemo(() => {
    const income = logs
      .filter((log) => log.transactionType === 'income')
      .reduce((sum, log) => sum + log.totalCost, 0);

    const expenses = logs
      .filter((log) => log.transactionType === 'expense')
      .reduce((sum, log) => sum + log.totalCost, 0);

    const balance = income - expenses;

    // By category
    const byCategory: Record<string, number> = {};
    logs
      .filter((log) => log.transactionType === 'expense')
      .forEach((log) => {
        byCategory[log.typeCategory] = (byCategory[log.typeCategory] || 0) + log.totalCost;
      });

    // Largest transaction
    const largestExpense = logs
      .filter((log) => log.transactionType === 'expense')
      .sort((a, b) => b.totalCost - a.totalCost)[0];

    const largestIncome = logs
      .filter((log) => log.transactionType === 'income')
      .sort((a, b) => b.totalCost - a.totalCost)[0];

    // Average
    const avgTransaction = logs.length > 0 
      ? (income + expenses) / logs.length 
      : 0;

    return {
      income,
      expenses,
      balance,
      byCategory,
      largestExpense,
      largestIncome,
      avgTransaction,
      totalTransactions: logs.length,
    };
  }, [logs]);

  const handlePreviousMonth = () => {
    setSelectedMonth(addMonths(selectedMonth, -1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(addMonths(selectedMonth, 1));
  };

  const monthName = selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <ScrollView className="flex-1 bg-slate-900">
      <View className="p-6">
        {/* Header */}
        <View className="flex-row items-center mb-6 mt-4">
          <Pressable onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={28} color="white" />
          </Pressable>
          <Text className="text-2xl font-bold text-white flex-1">Analytics</Text>
        </View>

        {/* Month Navigator */}
        <View className="card p-4 mb-6">
          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={handlePreviousMonth}
              className="bg-slate-700 rounded-lg p-3"
            >
              <Ionicons name="chevron-back" size={20} color="white" />
            </Pressable>

            <Text className="text-white text-xl font-bold">{monthName}</Text>

            <Pressable
              onPress={handleNextMonth}
              className="bg-slate-700 rounded-lg p-3"
              disabled={selectedMonth >= new Date()}
            >
              <Ionicons name="chevron-forward" size={20} color="white" />
            </Pressable>
          </View>
        </View>

        {/* Summary Cards */}
        <View className="mb-6">
          {/* Balance */}
          <View className="gradient-green border border-green-700 rounded-2xl p-6 mb-4">
            <Text className="text-green-400 text-sm mb-1">Balance</Text>
            <Text className="text-white text-4xl font-bold">
              {formatCurrency(analytics.balance)}
            </Text>
          </View>

          {/* Income & Expenses */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1 card p-4">
              <View className="flex-row items-center mb-2">
                <View className="bg-green-500 rounded-full w-8 h-8 items-center justify-center mr-2">
                  <Ionicons name="arrow-down" size={16} color="white" />
                </View>
                <Text className="text-slate-400 text-sm">Income</Text>
              </View>
              <Text className="text-white text-2xl font-bold">
                {formatCurrency(analytics.income)}
              </Text>
            </View>

            <View className="flex-1 card p-4">
              <View className="flex-row items-center mb-2">
                <View className="bg-red-500 rounded-full w-8 h-8 items-center justify-center mr-2">
                  <Ionicons name="arrow-up" size={16} color="white" />
                </View>
                <Text className="text-slate-400 text-sm">Expenses</Text>
              </View>
              <Text className="text-white text-2xl font-bold">
                {formatCurrency(analytics.expenses)}
              </Text>
            </View>
          </View>

          {/* Additional Stats */}
          <View className="flex-row gap-3">
            <View className="flex-1 card p-4">
              <Text className="text-slate-400 text-xs mb-1">Transactions</Text>
              <Text className="text-white text-xl font-bold">{analytics.totalTransactions}</Text>
            </View>
            <View className="flex-1 card p-4">
              <Text className="text-slate-400 text-xs mb-1">Average</Text>
              <Text className="text-white text-xl font-bold">
                {formatCurrency(analytics.avgTransaction)}
              </Text>
            </View>
          </View>
        </View>

        {/* Expenses by Category */}
        <View className="card p-5 mb-6">
          <Text className="text-white font-semibold text-lg mb-4">Expenses by Category</Text>
          {Object.entries(analytics.byCategory)
            .sort(([, a], [, b]) => b - a)
            .map(([category, amount]) => {
              const config = getFinanceCategoryConfig(category as FinanceTypeCategory);
              const percentage = (amount / analytics.expenses) * 100;

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
                      {formatCurrency(amount)} • {percentage.toFixed(0)}%
                    </Text>
                  </View>
                  <View className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <View
                      className="bg-red-500"
                      style={{ width: `${percentage}%`, height: '100%' }}
                    />
                  </View>
                </View>
              );
            })}
        </View>

        {/* Largest Transactions */}
        <View className="card p-5 mb-6">
          <Text className="text-white font-semibold text-lg mb-4">Largest Transactions</Text>
          
          {analytics.largestIncome && (
            <View className="mb-4">
              <Text className="text-slate-400 text-xs mb-2 uppercase">Largest Income</Text>
              <View className="bg-green-900/20 border border-green-700 rounded-lg p-3">
                <Text className="text-white font-semibold">{analytics.largestIncome.item}</Text>
                <Text className="text-green-400 font-bold text-xl mt-1">
                  {formatCurrency(analytics.largestIncome.totalCost, analytics.largestIncome.currency as CurrencyCode)}
                </Text>
              </View>
            </View>
          )}

          {analytics.largestExpense && (
            <View>
              <Text className="text-slate-400 text-xs mb-2 uppercase">Largest Expense</Text>
              <View className="bg-red-900/20 border border-red-700 rounded-lg p-3">
                <Text className="text-white font-semibold">{analytics.largestExpense.item}</Text>
                <Text className="text-red-400 font-bold text-xl mt-1">
                  {formatCurrency(analytics.largestExpense.totalCost, analytics.largestExpense.currency as CurrencyCode)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Insights */}
        <View className="bg-sky-900/20 border border-sky-700 rounded-xl p-4">
          <View className="flex-row items-start">
            <Ionicons name="bulb" size={20} color="#0ea5e9" style={{ marginRight: 8, marginTop: 2 }} />
            <View className="flex-1">
              <Text className="text-sky-300 text-sm font-semibold mb-1">Financial Insight</Text>
              <Text className="text-sky-200 text-xs">
                {analytics.balance > 0
                  ? `Great job! You have a positive balance of ${formatCurrency(analytics.balance)} this month.`
                  : analytics.balance === 0
                  ? 'You broke even this month. Consider saving more next month.'
                  : `You overspent by ${formatCurrency(Math.abs(analytics.balance))}. Review your expenses to find savings opportunities.`}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}