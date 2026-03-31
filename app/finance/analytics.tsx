// app/finance/analytics.tsx - THEME COMPATIBLE
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFinanceLogs, useAllFinanceLogs } from '@/src/database/hooks/useDatabase';
import { formatCurrency } from '@/src/utils/formatters';
import { getStartOfMonth, getEndOfMonth, addMonths } from '@/src/utils/dateHelpers';
import { getFinanceCategoryConfig } from '@/src/lib/constants';
import type { FinanceTypeCategory, CurrencyCode } from '@/src/types/database.types';
import { useThemeColors } from '@/src/hooks/useThemeColors';

type TabView = 'monthly' | 'overall';

export default function FinanceAnalyticsScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [activeTab, setActiveTab] = useState<TabView>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const startDate = useMemo(() => getStartOfMonth(selectedMonth), [selectedMonth]);
  const endDate = useMemo(() => getEndOfMonth(selectedMonth), [selectedMonth]);
  const monthlyLogs = useFinanceLogs(startDate, endDate);
  const allLogs = useAllFinanceLogs();

  const handlePreviousMonth = () => setSelectedMonth(addMonths(selectedMonth, -1));
  const handleNextMonth = () => setSelectedMonth(addMonths(selectedMonth, 1));
  const monthName = selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const isNextMonthDisabled =
    selectedMonth.getFullYear() > new Date().getFullYear() ||
    (selectedMonth.getFullYear() === new Date().getFullYear() &&
      selectedMonth.getMonth() >= new Date().getMonth());

  // Monthly analytics
  const monthly = useMemo(() => {
    const income = monthlyLogs.filter(l => l.transactionType === 'income').reduce((s, l) => s + l.totalCost, 0);
    const expenses = monthlyLogs.filter(l => l.transactionType === 'expense').reduce((s, l) => s + l.totalCost, 0);
    const byCategory: Record<string, number> = {};
    monthlyLogs.filter(l => l.transactionType === 'expense').forEach(l => {
      byCategory[l.typeCategory] = (byCategory[l.typeCategory] || 0) + l.totalCost;
    });
    const largestExpense = monthlyLogs.filter(l => l.transactionType === 'expense').sort((a, b) => b.totalCost - a.totalCost)[0];
    const largestIncome = monthlyLogs.filter(l => l.transactionType === 'income').sort((a, b) => b.totalCost - a.totalCost)[0];
    const expenseLogs = monthlyLogs.filter(l => l.transactionType === 'expense');
    const incomeLogs = monthlyLogs.filter(l => l.transactionType === 'income');
    return {
      income, expenses, balance: income - expenses, byCategory,
      largestExpense, largestIncome,
      avgExpense: expenseLogs.length > 0 ? expenses / expenseLogs.length : 0,
      avgIncome: incomeLogs.length > 0 ? income / incomeLogs.length : 0,
      totalTransactions: monthlyLogs.length,
    };
  }, [monthlyLogs]);

  // Overall analytics
  const overall = useMemo(() => {
    const totalIncome = allLogs.filter(l => l.transactionType === 'income').reduce((s, l) => s + l.totalCost, 0);
    const totalExpenses = allLogs.filter(l => l.transactionType === 'expense').reduce((s, l) => s + l.totalCost, 0);
    const netBalance = totalIncome - totalExpenses;

    const byCategory: Record<string, number> = {};
    allLogs.filter(l => l.transactionType === 'expense').forEach(l => {
      byCategory[l.typeCategory] = (byCategory[l.typeCategory] || 0) + l.totalCost;
    });

    const largestExpense = allLogs.filter(l => l.transactionType === 'expense').sort((a, b) => b.totalCost - a.totalCost)[0];
    const largestIncome = allLogs.filter(l => l.transactionType === 'income').sort((a, b) => b.totalCost - a.totalCost)[0];

    // Monthly trend — group all logs by year-month
    const monthMap: Record<string, { income: number; expenses: number; label: string; ts: number }> = {};
    allLogs.forEach(l => {
      const d = l.transactionDate;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthMap[key]) {
        monthMap[key] = {
          income: 0, expenses: 0,
          label: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          ts: new Date(d.getFullYear(), d.getMonth(), 1).getTime(),
        };
      }
      if (l.transactionType === 'income') monthMap[key].income += l.totalCost;
      else monthMap[key].expenses += l.totalCost;
    });
    const monthTrend = Object.values(monthMap).sort((a, b) => b.ts - a.ts);

    // Active months for averages
    const activeMonths = monthTrend.length || 1;
    const incomeLogs = allLogs.filter(l => l.transactionType === 'income');
    const expenseLogs = allLogs.filter(l => l.transactionType === 'expense');

    return {
      totalIncome, totalExpenses, netBalance, byCategory,
      largestExpense, largestIncome, monthTrend,
      totalTransactions: allLogs.length,
      avgMonthlyIncome: totalIncome / activeMonths,
      avgMonthlyExpenses: totalExpenses / activeMonths,
      avgPerIncomeTransaction: incomeLogs.length > 0 ? totalIncome / incomeLogs.length : 0,
      avgPerExpenseTransaction: expenseLogs.length > 0 ? totalExpenses / expenseLogs.length : 0,
      bestMonth: monthTrend.reduce<typeof monthTrend[0] | null>((best, m) => {
        const bal = m.income - m.expenses;
        return best === null || bal > (best.income - best.expenses) ? m : best;
      }, null),
      worstMonth: monthTrend.reduce<typeof monthTrend[0] | null>((worst, m) => {
        const bal = m.income - m.expenses;
        return worst === null || bal < (worst.income - worst.expenses) ? m : worst;
      }, null),
    };
  }, [allLogs]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 20 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 12 }}>
            <Pressable onPress={() => router.back()} style={{ marginRight: 12 }} accessibilityLabel="Go back" accessibilityRole="button">
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </Pressable>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.textPrimary, flex: 1 }}>
              Analytics
            </Text>
          </View>

          {/* Tab Toggle */}
          <View style={{
            flexDirection: 'row',
            backgroundColor: colors.bgSurface,
            borderWidth: 1,
            borderColor: colors.borderSurface,
            borderRadius: 12,
            padding: 4,
            marginBottom: 16,
          }}>
            {(['monthly', 'overall'] as TabView[]).map(tab => (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 9,
                  alignItems: 'center',
                  backgroundColor: activeTab === tab ? colors.moduleFinance : 'transparent',
                }}
              >
                <Text style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: activeTab === tab ? '#ffffff' : colors.textSecondary,
                }}>
                  {tab === 'monthly' ? 'Monthly' : 'Overall'}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* ── MONTHLY VIEW ── */}
          {activeTab === 'monthly' && (
            <>
              {/* Month Navigator */}
              <View style={{
                backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.borderSurface,
                borderRadius: 12, padding: 14, marginBottom: 16,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Pressable onPress={handlePreviousMonth} style={{ backgroundColor: colors.bgSurfaceHover, borderRadius: 8, padding: 10 }}>
                    <Ionicons name="chevron-back" size={18} color={colors.textPrimary} />
                  </Pressable>
                  <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: 'bold' }}>{monthName}</Text>
                  <Pressable
                    onPress={handleNextMonth}
                    disabled={isNextMonthDisabled}
                    style={{ backgroundColor: colors.bgSurfaceHover, borderRadius: 8, padding: 10, opacity: isNextMonthDisabled ? 0.3 : 1 }}
                  >
                    <Ionicons name="chevron-forward" size={18} color={colors.textPrimary} />
                  </Pressable>
                </View>
              </View>

              {monthly.totalTransactions === 0 ? (
                <View style={{
                  backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.borderSurface,
                  borderRadius: 14, padding: 40, alignItems: 'center', marginBottom: 16,
                }}>
                  <Ionicons name="bar-chart-outline" size={48} color={colors.textTertiary} />
                  <Text style={{ color: colors.textSecondary, fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 6 }}>
                    No data for {monthName}
                  </Text>
                  <Text style={{ color: colors.textTertiary, fontSize: 13, textAlign: 'center' }}>
                    Add transactions to see your financial analytics here.
                  </Text>
                </View>
              ) : (
                <>
                  {/* Balance */}
                  <View style={{
                    backgroundColor: monthly.balance >= 0 ? colors.moduleFinance : colors.danger,
                    borderRadius: 14, padding: 20, marginBottom: 12,
                  }}>
                    <Text style={{ color: '#ffffff', fontSize: 13, marginBottom: 4, opacity: 0.9 }}>Balance</Text>
                    <Text style={{ color: '#ffffff', fontSize: 32, fontWeight: 'bold' }}>{formatCurrency(monthly.balance)}</Text>
                  </View>

                  {/* Income & Expenses */}
                  <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                    <View style={{ flex: 1, backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.borderSurface, borderRadius: 12, padding: 14 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <View style={{ backgroundColor: colors.success, borderRadius: 16, width: 28, height: 28, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                          <Ionicons name="arrow-down" size={14} color="white" />
                        </View>
                        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Income</Text>
                      </View>
                      <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: 'bold' }}>{formatCurrency(monthly.income)}</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.borderSurface, borderRadius: 12, padding: 14 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <View style={{ backgroundColor: colors.danger, borderRadius: 16, width: 28, height: 28, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                          <Ionicons name="arrow-up" size={14} color="white" />
                        </View>
                        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Expenses</Text>
                      </View>
                      <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: 'bold' }}>{formatCurrency(monthly.expenses)}</Text>
                    </View>
                  </View>

                  {/* Stats row */}
                  <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                    <View style={{ flex: 1, backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.borderSurface, borderRadius: 12, padding: 12 }}>
                      <Text style={{ color: colors.textSecondary, fontSize: 11, marginBottom: 4 }}>Transactions</Text>
                      <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: 'bold' }}>{monthly.totalTransactions}</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.borderSurface, borderRadius: 12, padding: 12 }}>
                      <Text style={{ color: colors.textSecondary, fontSize: 11, marginBottom: 4 }}>Avg Expense</Text>
                      <Text style={{ color: colors.danger, fontSize: 16, fontWeight: 'bold' }}>{formatCurrency(monthly.avgExpense)}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                    <View style={{ flex: 1, backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.borderSurface, borderRadius: 12, padding: 12 }}>
                      <Text style={{ color: colors.textSecondary, fontSize: 11, marginBottom: 4 }}>Avg Income</Text>
                      <Text style={{ color: colors.success, fontSize: 16, fontWeight: 'bold' }}>{formatCurrency(monthly.avgIncome)}</Text>
                    </View>
                  </View>

                  {/* Category breakdown */}
                  {Object.keys(monthly.byCategory).length > 0 && (
                    <View style={{ backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.borderSurface, borderRadius: 14, padding: 16, marginBottom: 16 }}>
                      <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 16, marginBottom: 14 }}>Expenses by Category</Text>
                      {Object.entries(monthly.byCategory).sort(([, a], [, b]) => b - a).map(([category, amount]) => {
                        const config = getFinanceCategoryConfig(category as FinanceTypeCategory);
                        const percentage = (amount / monthly.expenses) * 100;
                        return (
                          <View key={category} style={{ marginBottom: 14 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ backgroundColor: config.hex, borderRadius: 14, width: 24, height: 24, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                                  <Ionicons name={config.icon as keyof typeof Ionicons.glyphMap} size={12} color="white" />
                                </View>
                                <Text style={{ color: colors.textPrimary, fontWeight: '500', fontSize: 13 }}>{category}</Text>
                              </View>
                              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{formatCurrency(amount)} • {percentage.toFixed(0)}%</Text>
                            </View>
                            <View style={{ height: 6, backgroundColor: colors.bgSurfaceHover, borderRadius: 3, overflow: 'hidden' }}>
                              <View style={{ width: `${percentage}%`, height: '100%', backgroundColor: config.hex }} />
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}

                  {/* Largest transactions */}
                  {(monthly.largestIncome || monthly.largestExpense) && (
                    <View style={{ backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.borderSurface, borderRadius: 14, padding: 16, marginBottom: 16 }}>
                      <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 16, marginBottom: 12 }}>Largest Transactions</Text>
                      {monthly.largestIncome && (
                        <View style={{ marginBottom: 12 }}>
                          <Text style={{ color: colors.textTertiary, fontSize: 11, marginBottom: 6, textTransform: 'uppercase' }}>Largest Income</Text>
                          <View style={{ backgroundColor: colors.success + '15', borderWidth: 1, borderColor: colors.success + '40', borderRadius: 10, padding: 12 }}>
                            <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 14 }}>{monthly.largestIncome.item}</Text>
                            <Text style={{ color: colors.success, fontWeight: 'bold', fontSize: 18, marginTop: 4 }}>{formatCurrency(monthly.largestIncome.totalCost, monthly.largestIncome.currency as CurrencyCode)}</Text>
                          </View>
                        </View>
                      )}
                      {monthly.largestExpense && (
                        <View>
                          <Text style={{ color: colors.textTertiary, fontSize: 11, marginBottom: 6, textTransform: 'uppercase' }}>Largest Expense</Text>
                          <View style={{ backgroundColor: colors.danger + '15', borderWidth: 1, borderColor: colors.danger + '40', borderRadius: 10, padding: 12 }}>
                            <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 14 }}>{monthly.largestExpense.item}</Text>
                            <Text style={{ color: colors.danger, fontWeight: 'bold', fontSize: 18, marginTop: 4 }}>{formatCurrency(monthly.largestExpense.totalCost, monthly.largestExpense.currency as CurrencyCode)}</Text>
                          </View>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Insight */}
                  <View style={{ backgroundColor: colors.info + '15', borderWidth: 1, borderColor: colors.info + '40', borderRadius: 12, padding: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                      <Ionicons name="bulb" size={18} color={colors.info} style={{ marginRight: 8, marginTop: 2 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.info, fontSize: 13, fontWeight: '600', marginBottom: 4 }}>Financial Insight</Text>
                        <Text style={{ color: colors.info, fontSize: 12, opacity: 0.9 }}>
                          {monthly.balance > 0
                            ? `Great job! You have a positive balance of ${formatCurrency(monthly.balance)} this month.`
                            : monthly.balance === 0
                            ? 'You broke even this month. Consider saving more next month.'
                            : `You overspent by ${formatCurrency(Math.abs(monthly.balance))}. Review your expenses to find savings opportunities.`}
                        </Text>
                      </View>
                    </View>
                  </View>
                </>
              )}
            </>
          )}

          {/* ── OVERALL VIEW ── */}
          {activeTab === 'overall' && (
            <>
              {allLogs.length === 0 ? (
                <View style={{
                  backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.borderSurface,
                  borderRadius: 14, padding: 40, alignItems: 'center', marginBottom: 16,
                }}>
                  <Ionicons name="stats-chart-outline" size={48} color={colors.textTertiary} />
                  <Text style={{ color: colors.textSecondary, fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 6 }}>
                    No transactions yet
                  </Text>
                  <Text style={{ color: colors.textTertiary, fontSize: 13, textAlign: 'center' }}>
                    Add transactions to see your overall financial picture.
                  </Text>
                </View>
              ) : (
                <>
                  {/* Net balance hero card */}
                  <View style={{
                    backgroundColor: overall.netBalance >= 0 ? colors.moduleFinance : colors.danger,
                    borderRadius: 16, padding: 22, marginBottom: 12,
                  }}>
                    <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '500', marginBottom: 4 }}>
                      All-Time Net Balance
                    </Text>
                    <Text style={{ color: '#ffffff', fontSize: 36, fontWeight: 'bold', marginBottom: 8 }}>
                      {formatCurrency(overall.netBalance)}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 16 }}>
                      <View>
                        <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, marginBottom: 2 }}>TOTAL IN</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 14, fontWeight: '600' }}>
                          +{formatCurrency(overall.totalIncome)}
                        </Text>
                      </View>
                      <View>
                        <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, marginBottom: 2 }}>TOTAL OUT</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 14, fontWeight: '600' }}>
                          -{formatCurrency(overall.totalExpenses)}
                        </Text>
                      </View>
                      <View>
                        <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, marginBottom: 2 }}>MONTHS</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 14, fontWeight: '600' }}>
                          {overall.monthTrend.length}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Monthly averages */}
                  <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                    <View style={{ flex: 1, backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.borderSurface, borderRadius: 12, padding: 12 }}>
                      <Text style={{ color: colors.textSecondary, fontSize: 10, marginBottom: 4 }}>Avg/Month Income</Text>
                      <Text style={{ color: colors.success, fontSize: 15, fontWeight: 'bold' }}>{formatCurrency(overall.avgMonthlyIncome)}</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.borderSurface, borderRadius: 12, padding: 12 }}>
                      <Text style={{ color: colors.textSecondary, fontSize: 10, marginBottom: 4 }}>Avg/Month Expenses</Text>
                      <Text style={{ color: colors.danger, fontSize: 15, fontWeight: 'bold' }}>{formatCurrency(overall.avgMonthlyExpenses)}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                    <View style={{ flex: 1, backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.borderSurface, borderRadius: 12, padding: 12 }}>
                      <Text style={{ color: colors.textSecondary, fontSize: 10, marginBottom: 4 }}>Avg per Income Txn</Text>
                      <Text style={{ color: colors.success, fontSize: 15, fontWeight: 'bold' }}>{formatCurrency(overall.avgPerIncomeTransaction)}</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.borderSurface, borderRadius: 12, padding: 12 }}>
                      <Text style={{ color: colors.textSecondary, fontSize: 10, marginBottom: 4 }}>Avg per Expense Txn</Text>
                      <Text style={{ color: colors.danger, fontSize: 15, fontWeight: 'bold' }}>{formatCurrency(overall.avgPerExpenseTransaction)}</Text>
                    </View>
                  </View>

                  {/* Best & worst months */}
                  {(overall.bestMonth || overall.worstMonth) && (
                    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                      {overall.bestMonth && (
                        <View style={{ flex: 1, backgroundColor: colors.success + '12', borderWidth: 1, borderColor: colors.success + '40', borderRadius: 12, padding: 12 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                            <Ionicons name="trending-up" size={13} color={colors.success} />
                            <Text style={{ color: colors.success, fontSize: 11, fontWeight: '600' }}>Best Month</Text>
                          </View>
                          <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '600', marginBottom: 2 }}>{overall.bestMonth.label}</Text>
                          <Text style={{ color: colors.success, fontSize: 13, fontWeight: 'bold' }}>
                            +{formatCurrency(overall.bestMonth.income - overall.bestMonth.expenses)}
                          </Text>
                        </View>
                      )}
                      {overall.worstMonth && (
                        <View style={{ flex: 1, backgroundColor: colors.danger + '12', borderWidth: 1, borderColor: colors.danger + '40', borderRadius: 12, padding: 12 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                            <Ionicons name="trending-down" size={13} color={colors.danger} />
                            <Text style={{ color: colors.danger, fontSize: 11, fontWeight: '600' }}>Worst Month</Text>
                          </View>
                          <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '600', marginBottom: 2 }}>{overall.worstMonth.label}</Text>
                          <Text style={{ color: colors.danger, fontSize: 13, fontWeight: 'bold' }}>
                            {formatCurrency(overall.worstMonth.income - overall.worstMonth.expenses)}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Monthly trend list */}
                  {overall.monthTrend.length > 0 && (
                    <View style={{ backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.borderSurface, borderRadius: 14, padding: 16, marginBottom: 16 }}>
                      <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 16, marginBottom: 12 }}>Monthly Trend</Text>
                      {overall.monthTrend.map((m, i) => {
                        const balance = m.income - m.expenses;
                        const isPositive = balance >= 0;
                        const maxVal = Math.max(...overall.monthTrend.map(x => Math.max(x.income, x.expenses)), 1);
                        return (
                          <View key={i} style={{ marginBottom: i < overall.monthTrend.length - 1 ? 12 : 0 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                              <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '500', width: 72 }}>{m.label}</Text>
                              <View style={{ flex: 1, marginHorizontal: 8, gap: 3 }}>
                                {/* Income bar */}
                                <View style={{ height: 5, backgroundColor: colors.bgSurfaceHover, borderRadius: 3, overflow: 'hidden' }}>
                                  <View style={{ width: `${(m.income / maxVal) * 100}%`, height: '100%', backgroundColor: colors.success, borderRadius: 3 }} />
                                </View>
                                {/* Expense bar */}
                                <View style={{ height: 5, backgroundColor: colors.bgSurfaceHover, borderRadius: 3, overflow: 'hidden' }}>
                                  <View style={{ width: `${(m.expenses / maxVal) * 100}%`, height: '100%', backgroundColor: colors.danger, borderRadius: 3 }} />
                                </View>
                              </View>
                              <Text style={{ color: isPositive ? colors.success : colors.danger, fontSize: 12, fontWeight: 'bold', width: 72, textAlign: 'right' }}>
                                {isPositive ? '+' : ''}{formatCurrency(balance)}
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}

                  {/* Top categories all-time */}
                  {Object.keys(overall.byCategory).length > 0 && (
                    <View style={{ backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.borderSurface, borderRadius: 14, padding: 16, marginBottom: 16 }}>
                      <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 16, marginBottom: 14 }}>Top Spending Categories</Text>
                      {Object.entries(overall.byCategory).sort(([, a], [, b]) => b - a).slice(0, 6).map(([category, amount]) => {
                        const config = getFinanceCategoryConfig(category as FinanceTypeCategory);
                        const percentage = (amount / overall.totalExpenses) * 100;
                        return (
                          <View key={category} style={{ marginBottom: 14 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ backgroundColor: config.hex, borderRadius: 14, width: 24, height: 24, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                                  <Ionicons name={config.icon as keyof typeof Ionicons.glyphMap} size={12} color="white" />
                                </View>
                                <Text style={{ color: colors.textPrimary, fontWeight: '500', fontSize: 13 }}>{category}</Text>
                              </View>
                              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{formatCurrency(amount)} • {percentage.toFixed(0)}%</Text>
                            </View>
                            <View style={{ height: 6, backgroundColor: colors.bgSurfaceHover, borderRadius: 3, overflow: 'hidden' }}>
                              <View style={{ width: `${percentage}%`, height: '100%', backgroundColor: config.hex }} />
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}

                  {/* All-time largest transactions */}
                  {(overall.largestIncome || overall.largestExpense) && (
                    <View style={{ backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.borderSurface, borderRadius: 14, padding: 16, marginBottom: 16 }}>
                      <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 16, marginBottom: 12 }}>All-Time Records</Text>
                      {overall.largestIncome && (
                        <View style={{ marginBottom: 12 }}>
                          <Text style={{ color: colors.textTertiary, fontSize: 11, marginBottom: 6, textTransform: 'uppercase' }}>Largest Income Ever</Text>
                          <View style={{ backgroundColor: colors.success + '15', borderWidth: 1, borderColor: colors.success + '40', borderRadius: 10, padding: 12 }}>
                            <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 14 }}>{overall.largestIncome.item}</Text>
                            <Text style={{ color: colors.success, fontWeight: 'bold', fontSize: 18, marginTop: 4 }}>
                              {formatCurrency(overall.largestIncome.totalCost, overall.largestIncome.currency as CurrencyCode)}
                            </Text>
                          </View>
                        </View>
                      )}
                      {overall.largestExpense && (
                        <View>
                          <Text style={{ color: colors.textTertiary, fontSize: 11, marginBottom: 6, textTransform: 'uppercase' }}>Largest Expense Ever</Text>
                          <View style={{ backgroundColor: colors.danger + '15', borderWidth: 1, borderColor: colors.danger + '40', borderRadius: 10, padding: 12 }}>
                            <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 14 }}>{overall.largestExpense.item}</Text>
                            <Text style={{ color: colors.danger, fontWeight: 'bold', fontSize: 18, marginTop: 4 }}>
                              {formatCurrency(overall.largestExpense.totalCost, overall.largestExpense.currency as CurrencyCode)}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Total transactions count */}
                  <View style={{ backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.borderSurface, borderRadius: 12, padding: 14, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Total Transactions Recorded</Text>
                    <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: 'bold' }}>{overall.totalTransactions}</Text>
                  </View>
                </>
              )}
            </>
          )}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
