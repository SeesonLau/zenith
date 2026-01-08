// app/finance/[id].tsx - THEME COMPATIBLE & COMPACT
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { database } from '@/src/database';
import type FinanceLog from '@/src/database/models/FinanceLog';
import { formatCurrency } from '@/src/utils/formatters';
import { formatDate } from '@/src/utils/dateHelpers';
import Button from '@/src/components/common/Button';
import type { CurrencyCode } from '@/src/types/database.types';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export default function TransactionDetailScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [transaction, setTransaction] = useState<FinanceLog | null>(null);

  useEffect(() => {
    loadTransaction();
  }, [id]);

  const loadTransaction = async () => {
    try {
      const log = await database.get<FinanceLog>('finance_logs').find(id);
      setTransaction(log);
    } catch (error) {
      console.error('Failed to load transaction:', error);
      Alert.alert('Error', 'Transaction not found');
      router.back();
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Transaction', 'Are you sure you want to delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await transaction?.markAsDeleted();
            router.back();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete transaction');
          }
        },
      },
    ]);
  };

  if (!transaction) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgPrimary, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.textPrimary }}>Loading...</Text>
      </View>
    );
  }

  const isIncome = transaction.transactionType === 'income';

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
              Transaction Details
            </Text>
          </View>

          {/* Amount Card */}
          <View style={{
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
            backgroundColor: isIncome ? colors.success + '15' : colors.danger + '15',
            borderWidth: 2,
            borderColor: isIncome ? colors.success : colors.danger
          }}>
            <Text style={{
              fontSize: 12,
              marginBottom: 6,
              color: isIncome ? colors.success : colors.danger,
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              {isIncome ? 'Income' : 'Expense'}
            </Text>
            <Text style={{
              color: colors.textPrimary,
              fontSize: 40,
              fontWeight: 'bold',
              marginBottom: 8
            }}>
              {isIncome ? '+' : '-'}
              {formatCurrency(transaction.totalCost, transaction.currency as CurrencyCode)}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
              {formatDate(transaction.transactionDate, 'full')}
            </Text>
          </View>

          {/* Details */}
          <View style={{
            backgroundColor: colors.bgSurface,
            borderWidth: 1,
            borderColor: colors.borderSurface,
            borderRadius: 14,
            padding: 16,
            marginBottom: 16
          }}>
            <DetailRow
              icon="pricetag"
              label="Item"
              value={transaction.item}
              colors={colors}
            />
            <DetailRow
              icon="folder"
              label="Category"
              value={transaction.typeCategory}
              colors={colors}
            />
            {transaction.location && (
              <DetailRow
                icon="location"
                label="Location"
                value={transaction.location}
                colors={colors}
              />
            )}
            <DetailRow
              icon="cart"
              label="Quantity"
              value={transaction.quantity.toString()}
              colors={colors}
            />
            <DetailRow
              icon="cash"
              label="Unit Cost"
              value={formatCurrency(transaction.cost, transaction.currency as CurrencyCode)}
              colors={colors}
            />
            <DetailRow
              icon="globe"
              label="Currency"
              value={transaction.currency}
              colors={colors}
            />
            {transaction.notes && (
              <DetailRow
                icon="document-text"
                label="Notes"
                value={transaction.notes}
                colors={colors}
                isLast
              />
            )}
          </View>

          {/* Delete Button */}
          <Button
            onPress={handleDelete}
            title="Delete Transaction"
            icon="trash"
            variant="danger"
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface DetailRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  colors: any;
  isLast?: boolean;
}

function DetailRow({ icon, label, value, colors, isLast }: DetailRowProps) {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: isLast ? 0 : 1,
      borderBottomColor: colors.borderSurface
    }}>
      <Ionicons name={icon} size={18} color={colors.textTertiary} />
      <Text style={{ color: colors.textSecondary, fontSize: 13, marginLeft: 10, width: 90 }}>
        {label}
      </Text>
      <Text style={{ color: colors.textPrimary, flex: 1, fontSize: 14, fontWeight: '500' }}>
        {value}
      </Text>
    </View>
  );
}