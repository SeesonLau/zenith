// app/finance/add.tsx (FIXED IMPORTS)
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createFinanceLog } from '@/src/database/actions/financeActions';
// ✅ FIXED: Import from categories.ts instead of database.types.ts
import { FINANCE_CATEGORIES, CURRENCIES } from '@/src/constants/categories';
import type { TransactionType, FinanceTypeCategory, CurrencyCode } from '@/src/types/database.types';
import { formatCurrency } from '@/src/utils/formatters';
import Button from '@/src/components/common/Button';

// FIXED: Using ACTUAL categories from database.types.ts
const CATEGORY_COLORS: Record<FinanceTypeCategory, string> = {
  Load: 'bg-blue-500',               // Mobile load, credits
  Fare: 'bg-cyan-500',               // Transportation
  School: 'bg-indigo-500',           // Education expenses
  'Personal-Physical': 'bg-pink-500', // Physical items (clothes, gadgets)
  'Personal-Digital': 'bg-purple-500', // Digital purchases (apps, subscriptions)
  Favor: 'bg-yellow-500',            // Money lent or borrowed
  Corrupt: 'bg-red-500',             // Unauthorized/corrupt transactions
  Food: 'bg-orange-500',             // Food and drinks
  Give: 'bg-green-500',              // Gifts, donations
  Refund: 'bg-teal-500',             // Refunds received
  Withdraw: 'bg-gray-500',           // Cash withdrawals
};

export default function AddTransactionScreen() {
  const router = useRouter();
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const [item, setItem] = useState('');
  const [location, setLocation] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [cost, setCost] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('PHP');
  const [category, setCategory] = useState<FinanceTypeCategory>('Food');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const totalCost = (parseFloat(quantity) || 0) * (parseFloat(cost) || 0);

  const handleSave = async () => {
    if (!item.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }

    if (!cost || parseFloat(cost) <= 0) {
      Alert.alert('Error', 'Please enter a valid cost');
      return;
    }

    setIsLoading(true);

    try {
      await createFinanceLog({
        transactionType,
        item: item.trim(),
        location: location.trim() || undefined,
        quantity: parseFloat(quantity) || 1,
        cost: parseFloat(cost),
        currency,
        typeCategory: category,
        notes: notes.trim() || undefined,
      });

      router.back();
    } catch (error) {
      console.error('Failed to create transaction:', error);
      Alert.alert('Error', 'Failed to save transaction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-primary">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-6 py-4 border-b border-surface-border bg-surface">
          <View className="flex-row items-center">
            <Pressable onPress={() => router.back()} className="mr-4">
              <Ionicons name="close" size={28} color="#64748b" />
            </Pressable>
            <Text className="text-2xl font-bold text-primary flex-1">Add Transaction</Text>
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-6 pb-32">
            {/* Transaction Type Toggle */}
            <View className="flex-row gap-3 mb-6">
              <Pressable
                onPress={() => setTransactionType('expense')}
                className={`flex-1 p-4 rounded-xl border-2 ${
                  transactionType === 'expense'
                    ? 'bg-red-500 border-red-500'
                    : 'bg-surface border-surface-border'
                }`}
              >
                <View className="items-center">
                  <Ionicons name="arrow-up" size={24} color="white" />
                  <Text className="text-white font-semibold mt-2">Expense</Text>
                </View>
              </Pressable>
              <Pressable
                onPress={() => setTransactionType('income')}
                className={`flex-1 p-4 rounded-xl border-2 ${
                  transactionType === 'income'
                    ? 'bg-green-500 border-green-500'
                    : 'bg-surface border-surface-border'
                }`}
              >
                <View className="items-center">
                  <Ionicons name="arrow-down" size={24} color="white" />
                  <Text className="text-white font-semibold mt-2">Income</Text>
                </View>
              </Pressable>
            </View>

            {/* Item Name */}
            <Text className="text-primary font-semibold mb-2">Item *</Text>
            <TextInput
              placeholder="e.g., Groceries, Salary, Coffee"
              placeholderTextColor="#64748b"
              value={item}
              onChangeText={setItem}
              className="input mb-4"
              style={{ color: '#ffffff' }}
            />

            {/* Location */}
            <Text className="text-primary font-semibold mb-2">Location (Optional)</Text>
            <TextInput
              placeholder="e.g., SM Mall, Office"
              placeholderTextColor="#64748b"
              value={location}
              onChangeText={setLocation}
              className="input mb-4"
              style={{ color: '#ffffff' }}
            />

            {/* Quantity & Cost */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-primary font-semibold mb-2">Quantity</Text>
                <TextInput
                  placeholder="1"
                  placeholderTextColor="#64748b"
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="decimal-pad"
                  className="input"
                  style={{ color: '#ffffff' }}
                />
              </View>
              <View className="flex-[2]">
                <Text className="text-primary font-semibold mb-2">Cost per Unit *</Text>
                <TextInput
                  placeholder="0.00"
                  placeholderTextColor="#64748b"
                  value={cost}
                  onChangeText={setCost}
                  keyboardType="decimal-pad"
                  className="input"
                  style={{ color: '#ffffff' }}
                />
              </View>
            </View>

            {/* Currency Picker */}
            <Text className="text-primary font-semibold mb-2">Currency</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <View className="flex-row gap-2">
                {CURRENCIES.map((curr) => (
                  <Pressable
                    key={curr}
                    onPress={() => setCurrency(curr)}
                    className={`px-4 py-2 rounded-lg ${
                      currency === curr ? 'bg-sky-500' : 'bg-surface'
                    }`}
                  >
                    <Text
                      className={`font-semibold ${
                        currency === curr ? 'text-white' : 'text-secondary'
                      }`}
                    >
                      {curr}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            {/* Category - FIXED: Using actual categories */}
            <Text className="text-primary font-semibold mb-2">Category</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {FINANCE_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-lg ${
                    category === cat ? CATEGORY_COLORS[cat] : 'bg-surface'
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      category === cat ? 'text-white' : 'text-secondary'
                    }`}
                  >
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Notes */}
            <Text className="text-primary font-semibold mb-2">Notes (Optional)</Text>
            <TextInput
              placeholder="Add any notes..."
              placeholderTextColor="#64748b"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              className="input mb-4"
              style={{ textAlignVertical: 'top', color: '#ffffff' }}
            />

            {/* Total Display */}
            <View className="card p-4 mb-6">
              <Text className="text-secondary text-sm mb-1">Total Amount</Text>
              <Text className="text-primary text-3xl font-bold">
                {formatCurrency(totalCost, currency)}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Fixed Save Button - SAFE FROM NAVIGATION BAR */}
        <View className="absolute bottom-0 left-0 right-0 p-6 bg-primary border-t border-surface-border">
          <Button
            onPress={handleSave}
            title="Save Transaction"
            icon="checkmark"
            variant={transactionType === 'income' ? 'success' : 'danger'}
            fullWidth
            loading={isLoading}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}