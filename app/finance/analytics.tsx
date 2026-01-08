// app/finance/analytics.tsx - THEME COMPATIBLE
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { database } from '@/src/database';
import { Q } from '@nozbe/watermelondb';
import type FinanceLog from '@/src/database/models/FinanceLog';
import { formatCurrency } from '@/src/utils/formatters';
import { getStartOfMonth, getEndOfMonth, addMonths } from '@/src/utils/dateHelpers';
import { getFinanceCategoryConfig } from '@/src/lib/constants';
import type { FinanceTypeCategory, CurrencyCode } from '@/src/types/database.types';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export default function FinanceAnalyticsScreen() {
  const router = useRouter();
  const colors = useThemeColors();
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
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 20 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 12 }}>
            <Pressable onPress={() => router.back()} style={{ marginRight: 12 }}>
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </Pressable>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.textPrimary, flex: 1 }}>
              Analytics
            </Text>
          </View>

          {/* Month Navigator */}
          <View style={{
            backgroundColor: colors.bgSurface,
            borderWidth: 1,
            borderColor: colors.borderSurface,
            borderRadius: 12,
            padding: 14,
            marginBottom: 16
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Pressable
                onPress={handlePreviousMonth}
                style={{
                  backgroundColor: colors.bgSurfaceHover,
                  borderRadius: 8,
                  padding: 10
                }}
              >
                <Ionicons name="chevron-back" size={18} color={colors.textPrimary} />
              </Pressable>

              <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: 'bold' }}>
                {monthName}
              </Text>

              <Pressable
                onPress={handleNextMonth}
                style={{
                  backgroundColor: colors.bgSurfaceHover,
                  borderRadius: 8,
                  padding: 10
                }}
                disabled={selectedMonth >= new Date()}
              >
                <Ionicons name="chevron-forward" size={18} color={colors.textPrimary} />
              </Pressable>
            </View>
          </View>

          {/* Summary Cards */}
          <View style={{ marginBottom: 16 }}>
            {/* Balance */}
            <View style={{
              backgroundColor: analytics.balance >= 0 ? colors.moduleFinance : colors.danger,
              borderRadius: 14,
              padding: 20,
              marginBottom: 12
            }}>
              <Text style={{ color: '#ffffff', fontSize: 13, marginBottom: 4, opacity: 0.9 }}>
                Balance
              </Text>
              <Text style={{ color: '#ffffff', fontSize: 32, fontWeight: 'bold' }}>
                {formatCurrency(analytics.balance)}
              </Text>
            </View>

            {/* Income & Expenses */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
              <View style={{
                flex: 1,
                backgroundColor: colors.bgSurface,
                borderWidth: 1,
                borderColor: colors.borderSurface,
                borderRadius: 12,
                padding: 14
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{
                    backgroundColor: colors.success,
                    borderRadius: 16,
                    width: 28,
                    height: 28,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 8
                  }}>
                    <Ionicons name="arrow-down" size={14} color="white" />
                  </View>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Income</Text>
                </View>
                <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: 'bold' }}>
                  {formatCurrency(analytics.income)}
                </Text>
              </View>

              <View style={{
                flex: 1,
                backgroundColor: colors.bgSurface,
                borderWidth: 1,
                borderColor: colors.borderSurface,
                borderRadius: 12,
                padding: 14
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{
                    backgroundColor: colors.danger,
                    borderRadius: 16,
                    width: 28,
                    height: 28,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 8
                  }}>
                    <Ionicons name="arrow-up" size={14} color="white" />
                  </View>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Expenses</Text>
                </View>
                <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: 'bold' }}>
                  {formatCurrency(analytics.expenses)}
                </Text>
              </View>
            </View>

            {/* Additional Stats */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{
                flex: 1,
                backgroundColor: colors.bgSurface,
                borderWidth: 1,
                borderColor: colors.borderSurface,
                borderRadius: 12,
                padding: 12
              }}>
                <Text style={{ color: colors.textSecondary, fontSize: 11, marginBottom: 4 }}>
                  Transactions
                </Text>
                <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: 'bold' }}>
                  {analytics.totalTransactions}
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
                <Text style={{ color: colors.textSecondary, fontSize: 11, marginBottom: 4 }}>
                  Average
                </Text>
                <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: 'bold' }}>
                  {formatCurrency(analytics.avgTransaction)}
                </Text>
              </View>
            </View>
          </View>

          {/* Expenses by Category */}
          {Object.keys(analytics.byCategory).length > 0 && (
            <View style={{
              backgroundColor: colors.bgSurface,
              borderWidth: 1,
              borderColor: colors.borderSurface,
              borderRadius: 14,
              padding: 16,
              marginBottom: 16
            }}>
              <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 16, marginBottom: 14 }}>
                Expenses by Category
              </Text>
              {Object.entries(analytics.byCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => {
                  const config = getFinanceCategoryConfig(category as FinanceTypeCategory);
                  const percentage = (amount / analytics.expenses) * 100;

                  return (
                    <View key={category} style={{ marginBottom: 14 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <View style={{
                            backgroundColor: config.color.replace('bg-', '#'),
                            borderRadius: 14,
                            width: 24,
                            height: 24,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 8
                          }}>
                            <Ionicons name={config.icon as any} size={12} color="white" />
                          </View>
                          <Text style={{ color: colors.textPrimary, fontWeight: '500', fontSize: 13 }}>
                            {category}
                          </Text>
                        </View>
                        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                          {formatCurrency(amount)} • {percentage.toFixed(0)}%
                        </Text>
                      </View>
                      <View style={{
                        height: 6,
                        backgroundColor: colors.bgSurfaceHover,
                        borderRadius: 3,
                        overflow: 'hidden'
                      }}>
                        <View
                          style={{
                            width: `${percentage}%`,
                            height: '100%',
                            backgroundColor: colors.danger
                          }}
                        />
                      </View>
                    </View>
                  );
                })}
            </View>
          )}

          {/* Largest Transactions */}
          {(analytics.largestIncome || analytics.largestExpense) && (
            <View style={{
              backgroundColor: colors.bgSurface,
              borderWidth: 1,
              borderColor: colors.borderSurface,
              borderRadius: 14,
              padding: 16,
              marginBottom: 16
            }}>
              <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 16, marginBottom: 12 }}>
                Largest Transactions
              </Text>
              
              {analytics.largestIncome && (
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ color: colors.textTertiary, fontSize: 11, marginBottom: 6, textTransform: 'uppercase' }}>
                    Largest Income
                  </Text>
                  <View style={{
                    backgroundColor: colors.success + '15',
                    borderWidth: 1,
                    borderColor: colors.success + '40',
                    borderRadius: 10,
                    padding: 12
                  }}>
                    <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 14 }}>
                      {analytics.largestIncome.item}
                    </Text>
                    <Text style={{ color: colors.success, fontWeight: 'bold', fontSize: 18, marginTop: 4 }}>
                      {formatCurrency(analytics.largestIncome.totalCost, analytics.largestIncome.currency as CurrencyCode)}
                    </Text>
                  </View>
                </View>
              )}

              {analytics.largestExpense && (
                <View>
                  <Text style={{ color: colors.textTertiary, fontSize: 11, marginBottom: 6, textTransform: 'uppercase' }}>
                    Largest Expense
                  </Text>
                  <View style={{
                    backgroundColor: colors.danger + '15',
                    borderWidth: 1,
                    borderColor: colors.danger + '40',
                    borderRadius: 10,
                    padding: 12
                  }}>
                    <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 14 }}>
                      {analytics.largestExpense.item}
                    </Text>
                    <Text style={{ color: colors.danger, fontWeight: 'bold', fontSize: 18, marginTop: 4 }}>
                      {formatCurrency(analytics.largestExpense.totalCost, analytics.largestExpense.currency as CurrencyCode)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Insights */}
          <View style={{
            backgroundColor: colors.info + '15',
            borderWidth: 1,
            borderColor: colors.info + '40',
            borderRadius: 12,
            padding: 14
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Ionicons
                name="bulb"
                size={18}
                color={colors.info}
                style={{ marginRight: 8, marginTop: 2 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.info, fontSize: 13, fontWeight: '600', marginBottom: 4 }}>
                  Financial Insight
                </Text>
                <Text style={{ color: colors.info, fontSize: 12, opacity: 0.9 }}>
                  {analytics.balance > 0
                    ? `Great job! You have a positive balance of ${formatCurrency(analytics.balance)} this month.`
                    : analytics.balance === 0
                    ? 'You broke even this month. Consider saving more next month.'
                    : `You overspent by ${formatCurrency(Math.abs(analytics.balance))}. Review your expenses to find savings opportunities.`}
                </Text>
              </View>
            </View>
          </View>

          {/* Bottom padding */}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}