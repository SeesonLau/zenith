// app/finance/add.tsx
import React, { useState, useMemo, useEffect } from 'react'; // Added useMemo, useEffect
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
// Update import to include the new specific lists
import { 
  FINANCE_CATEGORIES, 
  EXPENSE_CATEGORIES, 
  INCOME_CATEGORIES, 
  CURRENCIES 
} from '@/src/constants/categories';
import type { TransactionType, FinanceTypeCategory, CurrencyCode } from '@/src/types/database.types';
import { formatCurrency } from '@/src/utils/formatters';
import Button from '@/src/components/common/Button';
import { useThemeColors } from '@/src/hooks/useThemeColors';

// Quick tags for item
const ITEM_TAGS = ['Fare'];

// Quick tags for location (additive)
const LOCATION_TAGS = ['to', 'House', 'Lipata', 'Punta', 'CIT-U'];

// Quick tags for cost (additive)
const COST_TAGS = [1, 5, 10, 50, 100];

// ❌ REMOVED: Static category sorting at the top
// ✅ KEEP: Currency sorting (since it doesn't change)
const CURRENCIES_SORTED = [...CURRENCIES].sort();
const CURRENCIES_COL1 = CURRENCIES_SORTED.slice(0, Math.ceil(CURRENCIES_SORTED.length / 2));
const CURRENCIES_COL2 = CURRENCIES_SORTED.slice(Math.ceil(CURRENCIES_SORTED.length / 2));

export default function AddTransactionScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const [item, setItem] = useState('');
  const [location, setLocation] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [cost, setCost] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('PHP');
  const [category, setCategory] = useState<FinanceTypeCategory | null>(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ✅ LOGIC: Calculate categories based on selected Type
  const { col1, col2 } = useMemo(() => {
    // 1. Select the correct list
    const currentList = transactionType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    
    // 2. Sort them
    const sorted = [...currentList].sort();

    // 3. Split into columns
    const half = Math.ceil(sorted.length / 2);
    return {
      col1: sorted.slice(0, half),
      col2: sorted.slice(half)
    };
  }, [transactionType]);

  // ✅ LOGIC: Reset selected category when switching types 
  // (Prevents having an Income type selected while on Expense tab)
  useEffect(() => {
    setCategory(null);
  }, [transactionType]);

  const totalCost = (parseFloat(quantity) || 0) * (parseFloat(cost) || 0);

  const handleItemTag = (tag: string) => {
    setItem(tag);
  };

  const handleLocationTag = (tag: string) => {
    setLocation(prev => {
      if (!prev) return tag;
      return `${prev} ${tag}`;
    });
  };

  const handleCostTag = (value: number) => {
    setCost(prev => {
      const currentValue = parseFloat(prev) || 0;
      const newValue = currentValue + value;
      return newValue.toString();
    });
  };

  const handleSave = async () => {
    if (!item.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }

    if (!cost || parseFloat(cost) <= 0) {
      Alert.alert('Error', 'Please enter a valid cost');
      return;
    }

    if (!category) {
      Alert.alert('Error', 'Please select a category');
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
    <SafeAreaView 
      edges={['top', 'bottom']} 
      style={{ flex: 1, backgroundColor: colors.bgPrimary }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={{
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderSurface,
          backgroundColor: colors.bgSurface
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Pressable onPress={() => router.back()} style={{ marginRight: 12 }}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </Pressable>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.textPrimary, flex: 1 }}>
              Add Transaction
            </Text>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{ padding: 20, paddingBottom: 120 }}>
            
            {/* Transaction Type Toggle - Compact */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              <Pressable
                onPress={() => setTransactionType('expense')}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: transactionType === 'expense' ? '#ef4444' : colors.borderSurface,
                  backgroundColor: transactionType === 'expense' ? '#ef444420' : colors.bgSurface,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <Ionicons name="arrow-up" size={16} color={transactionType === 'expense' ? '#ef4444' : colors.textSecondary} />
                <Text style={{ 
                  color: transactionType === 'expense' ? '#ef4444' : colors.textSecondary, 
                  fontWeight: '600',
                  fontSize: 14
                }}>
                  Expense
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setTransactionType('income')}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: transactionType === 'income' ? '#22c55e' : colors.borderSurface,
                  backgroundColor: transactionType === 'income' ? '#22c55e20' : colors.bgSurface,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <Ionicons name="arrow-down" size={16} color={transactionType === 'income' ? '#22c55e' : colors.textSecondary} />
                <Text style={{ 
                  color: transactionType === 'income' ? '#22c55e' : colors.textSecondary, 
                  fontWeight: '600',
                  fontSize: 14
                }}>
                  Income
                </Text>
              </Pressable>
            </View>

            {/* Item Name with Quick Tags */}
            <View style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 6 }}>
                <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 13 }}>
                  Item
                </Text>
                {ITEM_TAGS.map(tag => (
                  <Pressable
                    key={tag}
                    onPress={() => handleItemTag(tag)}
                    style={{
                      backgroundColor: colors.bgSurfaceHover,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: colors.borderSurface
                    }}
                  >
                    <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '500' }}>
                      {tag}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <TextInput
                value={item}
                onChangeText={setItem}
                style={{
                  backgroundColor: colors.bgSurface,
                  borderWidth: 1,
                  borderColor: item ? colors.moduleFinance : colors.borderSurface,
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 14,
                  color: colors.textPrimary
                }}
              />
            </View>

            {/* Location with Quick Tags */}
            <View style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 13 }}>
                  Location
                </Text>
                {LOCATION_TAGS.map(tag => (
                  <Pressable
                    key={tag}
                    onPress={() => handleLocationTag(tag)}
                    style={{
                      backgroundColor: colors.bgSurfaceHover,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: colors.borderSurface
                    }}
                  >
                    <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '500' }}>
                      {tag}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <TextInput
                value={location}
                onChangeText={setLocation}
                style={{
                  backgroundColor: colors.bgSurface,
                  borderWidth: 1,
                  borderColor: location ? colors.moduleFinance : colors.borderSurface,
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 14,
                  color: colors.textPrimary
                }}
              />
            </View>

            {/* Quantity & Cost */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
              <View style={{ flex: 0.5 }}>
                <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 13, marginBottom: 6 }}>
                  Qty
                </Text>
                <TextInput
                  placeholder="1"
                  placeholderTextColor={colors.textTertiary}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="decimal-pad"
                  style={{
                    backgroundColor: colors.bgSurface,
                    borderWidth: 1,
                    borderColor: colors.borderSurface,
                    borderRadius: 10,
                    padding: 12,
                    fontSize: 14,
                    color: colors.textPrimary
                  }}
                />
              </View>
              <View style={{ flex: 2.5 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 4 }}>
                  <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 13 }}>
                    Unit Cost
                  </Text>
                  {COST_TAGS.map(value => (
                    <Pressable
                      key={value}
                      onPress={() => handleCostTag(value)}
                      style={{
                        backgroundColor: colors.bgSurfaceHover,
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 5,
                        borderWidth: 1,
                        borderColor: colors.borderSurface
                      }}
                    >
                      <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: '600' }}>
                        +{value}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <TextInput
                  placeholder="0.00"
                  placeholderTextColor={colors.textTertiary}
                  value={cost}
                  onChangeText={setCost}
                  keyboardType="decimal-pad"
                  style={{
                    backgroundColor: colors.bgSurface,
                    borderWidth: 1,
                    borderColor: cost ? colors.moduleFinance : colors.borderSurface,
                    borderRadius: 10,
                    padding: 12,
                    fontSize: 14,
                    color: colors.textPrimary
                  }}
                />
              </View>
            </View>

            {/* Currency - 2 Columns */}
            <View style={{ marginBottom: 14 }}>
              <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 13, marginBottom: 8 }}>
                Currency
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1, gap: 6 }}>
                  {CURRENCIES_COL1.map(curr => (
                    <Pressable
                      key={curr}
                      onPress={() => setCurrency(curr)}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: currency === curr ? colors.moduleFinance : colors.borderSurface,
                        backgroundColor: currency === curr ? colors.moduleFinance + '20' : colors.bgSurface,
                      }}
                    >
                      <Text style={{
                        fontWeight: '600',
                        fontSize: 13,
                        color: currency === curr ? colors.moduleFinance : colors.textSecondary,
                        textAlign: 'center'
                      }}>
                        {curr}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <View style={{ flex: 1, gap: 6 }}>
                  {CURRENCIES_COL2.map(curr => (
                    <Pressable
                      key={curr}
                      onPress={() => setCurrency(curr)}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: currency === curr ? colors.moduleFinance : colors.borderSurface,
                        backgroundColor: currency === curr ? colors.moduleFinance + '20' : colors.bgSurface,
                      }}
                    >
                      <Text style={{
                        fontWeight: '600',
                        fontSize: 13,
                        color: currency === curr ? colors.moduleFinance : colors.textSecondary,
                        textAlign: 'center'
                      }}>
                        {curr}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            {/* Category - Dynamic Columns based on Type */}
            <View style={{ marginBottom: 14 }}>
              <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 13, marginBottom: 8 }}>
                Category ({transactionType === 'income' ? 'Income' : 'Expense'})
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {/* Dynamic Column 1 */}
                <View style={{ flex: 1, gap: 6 }}>
                  {col1.map(cat => (
                    <Pressable
                      key={cat}
                      onPress={() => setCategory(cat as FinanceTypeCategory)}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: category === cat ? colors.moduleFinance : colors.borderSurface,
                        backgroundColor: category === cat ? colors.moduleFinance + '20' : colors.bgSurface,
                      }}
                    >
                      <Text style={{
                        fontWeight: '500',
                        fontSize: 12,
                        color: category === cat ? colors.moduleFinance : colors.textSecondary,
                        textAlign: 'center'
                      }}>
                        {cat}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Dynamic Column 2 */}
                <View style={{ flex: 1, gap: 6 }}>
                  {col2.map(cat => (
                    <Pressable
                      key={cat}
                      onPress={() => setCategory(cat as FinanceTypeCategory)}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: category === cat ? colors.moduleFinance : colors.borderSurface,
                        backgroundColor: category === cat ? colors.moduleFinance + '20' : colors.bgSurface,
                      }}
                    >
                      <Text style={{
                        fontWeight: '500',
                        fontSize: 12,
                        color: category === cat ? colors.moduleFinance : colors.textSecondary,
                        textAlign: 'center'
                      }}>
                        {cat}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            {/* Notes */}
            <View style={{ marginBottom: 14 }}>
              <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 13, marginBottom: 6 }}>
                Notes
              </Text>
              <TextInput
                placeholder="Add any notes..."
                placeholderTextColor={colors.textTertiary}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={2}
                style={{
                  backgroundColor: colors.bgSurface,
                  borderWidth: 1,
                  borderColor: colors.borderSurface,
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 13,
                  color: colors.textPrimary,
                  textAlignVertical: 'top',
                  minHeight: 60
                }}
              />
            </View>

            {/* Total Display */}
            <View style={{
              backgroundColor: colors.bgSurface,
              borderWidth: 1,
              borderColor: colors.borderSurface,
              borderRadius: 12,
              padding: 14,
              marginBottom: 16
            }}>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4 }}>
                Total Amount
              </Text>
              <Text style={{ color: colors.textPrimary, fontSize: 28, fontWeight: 'bold' }}>
                {formatCurrency(totalCost, currency)}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Fixed Save Button */}
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 16,
          backgroundColor: colors.bgPrimary,
          borderTopWidth: 1,
          borderTopColor: colors.borderSurface
        }}>
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