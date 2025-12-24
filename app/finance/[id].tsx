// app/finance/[id].tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { database } from '@/src/database';
import type FinanceLog from '@/src/database/models/FinanceLog';
import { formatCurrency } from '@/src/utils/formatters';
import { formatDate } from '@/src/utils/dateHelpers';
import Button from '@/src/components/common/Button';
import type { CurrencyCode } from '@/src/types/database.types'

export default function TransactionDetailScreen() {
  const router = useRouter();
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
      <View className="flex-1 bg-slate-900 items-center justify-center">
        <Text className="text-white">Loading...</Text>
      </View>
    );
  }

  const isIncome = transaction.transactionType === 'income';

  return (
    <ScrollView className="flex-1 bg-slate-900">
      <View className="p-6">
        {/* Header */}
        <View className="flex-row items-center mb-6 mt-4">
          <Pressable onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={28} color="white" />
          </Pressable>
          <Text className="text-2xl font-bold text-white flex-1">Transaction Details</Text>
        </View>

        {/* Amount Card */}
        <View
          className={`rounded-2xl p-6 mb-6 ${
            isIncome ? 'bg-green-900/30 border-green-700' : 'bg-red-900/30 border-red-700'
          } border-2`}
        >
          <Text className={`text-sm mb-2 ${isIncome ? 'text-green-400' : 'text-red-400'}`}>
            {isIncome ? 'Income' : 'Expense'}
          </Text>
          <Text className="text-white text-5xl font-bold mb-2">
            {isIncome ? '+' : '-'}
            {/* Cast to CurrencyCode */}
            {formatCurrency(transaction.totalCost, transaction.currency as CurrencyCode)}
          </Text>
          <Text className="text-slate-400 text-sm">
            {formatDate(transaction.transactionDate, 'full')}
          </Text>
        </View>

        {/* Details */}
        <View className="bg-slate-800 border border-slate-700 rounded-2xl p-4 mb-6">
          <DetailRow icon="pricetag" label="Item" value={transaction.item} />
          <DetailRow icon="folder" label="Category" value={transaction.typeCategory} />
          {transaction.location && (
            <DetailRow icon="location" label="Location" value={transaction.location} />
          )}
          <DetailRow
            icon="cart"
            label="Quantity"
            value={transaction.quantity.toString()}
          />
          <DetailRow
            icon="cash"
            label="Unit Cost"
            /* Cast to CurrencyCode */
            value={formatCurrency(transaction.cost, transaction.currency as CurrencyCode)}
          />
          <DetailRow icon="globe" label="Currency" value={transaction.currency} />
          {transaction.notes && (
            <DetailRow icon="document-text" label="Notes" value={transaction.notes} />
          )}
        </View>

        {/* Details */}
        <View className="bg-slate-800 border border-slate-700 rounded-2xl p-4 mb-6">
          <DetailRow icon="pricetag" label="Item" value={transaction.item} />
          <DetailRow icon="folder" label="Category" value={transaction.typeCategory} />
          {transaction.location && (
            <DetailRow icon="location" label="Location" value={transaction.location} />
          )}
          <DetailRow
            icon="cart"
            label="Quantity"
            value={transaction.quantity.toString()}
          />
          <DetailRow
            icon="cash"
            label="Unit Cost"
            // CHANGE THIS LINE BELOW:
            value={formatCurrency(transaction.cost, transaction.currency as CurrencyCode)}
          />
          <DetailRow icon="globe" label="Currency" value={transaction.currency} />
          {transaction.notes && (
            <DetailRow icon="document-text" label="Notes" value={transaction.notes} />
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
  );
}

function DetailRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View className="flex-row items-center py-3 border-b border-slate-700 last:border-b-0">
      <Ionicons name={icon} size={20} color="#64748b" />
      <Text className="text-slate-400 text-sm ml-3 w-24">{label}</Text>
      <Text className="text-white flex-1">{value}</Text>
    </View>
  );
}