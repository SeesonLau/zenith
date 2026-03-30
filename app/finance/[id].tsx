// app/finance/[id].tsx - THEME COMPATIBLE & COMPACT
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFinanceLog } from '@/src/database/hooks/useDatabase';
import { deleteFinanceLog, updateFinanceLog } from '@/src/database/actions/financeActions';
import { formatCurrency } from '@/src/utils/formatters';
import { formatDate } from '@/src/utils/dateHelpers';
import Button from '@/src/components/common/Button';
import LoadingSpinner from '@/src/components/common/LoadingSpinner';
import { getFinanceCategoryConfig, FINANCE_CONFIG } from '@/src/lib/constants';
import type { CurrencyCode, TransactionType, FinanceTypeCategory } from '@/src/types/database.types';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import type { ThemeColors } from '@/src/hooks/useThemeColors';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, CURRENCIES } from '@/src/constants/categories';

const CURRENCIES_SORTED = [...CURRENCIES].sort();

export default function TransactionDetailScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const transaction = useFinanceLog(id);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editItem, setEditItem] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editCost, setEditCost] = useState('');
  const [editCurrency, setEditCurrency] = useState<CurrencyCode>('PHP');
  const [editCategory, setEditCategory] = useState<FinanceTypeCategory | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editTransactionType, setEditTransactionType] = useState<TransactionType>('expense');

  useEffect(() => {
    if (transaction) {
      setEditItem(transaction.item);
      setEditLocation(transaction.location || '');
      setEditQuantity(transaction.quantity.toString());
      setEditCost(transaction.cost.toString());
      setEditCurrency(transaction.currency as CurrencyCode);
      setEditCategory(transaction.typeCategory as FinanceTypeCategory);
      setEditNotes(transaction.notes || '');
      setEditTransactionType(transaction.transactionType as TransactionType);
    }
  }, [transaction]);

  const handleDelete = () => {
    Alert.alert('Delete Transaction', 'Are you sure you want to delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteFinanceLog(id);
            router.back();
          } catch {
            Alert.alert('Error', 'Failed to delete transaction');
          }
        },
      },
    ]);
  };

  const handleSave = async () => {
    if (!editItem.trim()) {
      Alert.alert('Validation', 'Item name is required');
      return;
    }
    const cost = parseFloat(editCost);
    const quantity = parseFloat(editQuantity);
    if (isNaN(cost) || cost <= 0 || isNaN(quantity) || quantity <= 0) {
      Alert.alert('Validation', 'Enter a valid quantity and cost');
      return;
    }
    if (!editCategory) {
      Alert.alert('Validation', 'Please select a category');
      return;
    }
    setIsSaving(true);
    try {
      await updateFinanceLog(id, {
        transactionType: editTransactionType,
        item: editItem.trim(),
        location: editLocation.trim() || undefined,
        quantity,
        cost,
        currency: editCurrency,
        typeCategory: editCategory,
        notes: editNotes.trim() || undefined,
      });
      setIsEditing(false);
    } catch {
      Alert.alert('Error', 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (transaction) {
      setEditItem(transaction.item);
      setEditLocation(transaction.location || '');
      setEditQuantity(transaction.quantity.toString());
      setEditCost(transaction.cost.toString());
      setEditCurrency(transaction.currency as CurrencyCode);
      setEditCategory(transaction.typeCategory as FinanceTypeCategory);
      setEditNotes(transaction.notes || '');
      setEditTransactionType(transaction.transactionType as TransactionType);
    }
    setIsEditing(false);
  };

  if (!transaction) {
    return <LoadingSpinner fullScreen />;
  }

  const isIncome = transaction.transactionType === 'income';
  const editCategories = editTransactionType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  if (isEditing) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView style={{ flex: 1 }}>
            <View style={{ padding: 20 }}>
              {/* Header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 12 }}>
                <Pressable
                  onPress={handleCancelEdit}
                  style={{ marginRight: 12 }}
                  accessibilityLabel="Cancel edit"
                  accessibilityRole="button"
                >
                  <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </Pressable>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.textPrimary, flex: 1 }}>
                  Edit Transaction
                </Text>
              </View>

              {/* Transaction Type Toggle */}
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
                {(['expense', 'income'] as TransactionType[]).map(type => {
                  const config = FINANCE_CONFIG.transactionTypes[type];
                  const isSelected = editTransactionType === type;
                  return (
                    <Pressable
                      key={type}
                      onPress={() => {
                        setEditTransactionType(type);
                        setEditCategory(null);
                      }}
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        paddingVertical: 10,
                        borderRadius: 10,
                        borderWidth: 1.5,
                        borderColor: isSelected ? config.hex : colors.borderSurface,
                        backgroundColor: isSelected ? config.hex + '20' : colors.bgSurface,
                      }}
                    >
                      <Ionicons name={config.icon} size={16} color={isSelected ? config.hex : colors.textSecondary} />
                      <Text style={{ color: isSelected ? config.hex : colors.textSecondary, fontWeight: '600', fontSize: 13 }}>
                        {config.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Item */}
              <View style={{ marginBottom: 14 }}>
                <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 13, marginBottom: 6 }}>Item</Text>
                <TextInput
                  value={editItem}
                  onChangeText={setEditItem}
                  placeholder="e.g. Lunch, Salary"
                  placeholderTextColor={colors.textTertiary}
                  style={{
                    backgroundColor: colors.bgSurface,
                    borderWidth: 1,
                    borderColor: colors.borderSurface,
                    borderRadius: 10,
                    padding: 12,
                    color: colors.textPrimary,
                    fontSize: 14,
                  }}
                />
              </View>

              {/* Location */}
              <View style={{ marginBottom: 14 }}>
                <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 13, marginBottom: 6 }}>Location</Text>
                <TextInput
                  value={editLocation}
                  onChangeText={setEditLocation}
                  placeholder="Optional"
                  placeholderTextColor={colors.textTertiary}
                  style={{
                    backgroundColor: colors.bgSurface,
                    borderWidth: 1,
                    borderColor: colors.borderSurface,
                    borderRadius: 10,
                    padding: 12,
                    color: colors.textPrimary,
                    fontSize: 14,
                  }}
                />
              </View>

              {/* Quantity & Cost */}
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 13, marginBottom: 6 }}>Qty</Text>
                  <TextInput
                    value={editQuantity}
                    onChangeText={setEditQuantity}
                    keyboardType="numeric"
                    style={{
                      backgroundColor: colors.bgSurface,
                      borderWidth: 1,
                      borderColor: colors.borderSurface,
                      borderRadius: 10,
                      padding: 12,
                      color: colors.textPrimary,
                      fontSize: 14,
                    }}
                  />
                </View>
                <View style={{ flex: 2 }}>
                  <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 13, marginBottom: 6 }}>Cost</Text>
                  <TextInput
                    value={editCost}
                    onChangeText={setEditCost}
                    keyboardType="numeric"
                    style={{
                      backgroundColor: colors.bgSurface,
                      borderWidth: 1,
                      borderColor: colors.borderSurface,
                      borderRadius: 10,
                      padding: 12,
                      color: colors.textPrimary,
                      fontSize: 14,
                    }}
                  />
                </View>
              </View>

              {/* Currency */}
              <View style={{ marginBottom: 14 }}>
                <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 13, marginBottom: 8 }}>Currency</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {CURRENCIES_SORTED.map(cur => (
                    <Pressable
                      key={cur}
                      onPress={() => setEditCurrency(cur as CurrencyCode)}
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 14,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: editCurrency === cur ? colors.moduleFinance : colors.borderSurface,
                        backgroundColor: editCurrency === cur ? colors.moduleFinance + '20' : colors.bgSurface,
                      }}
                    >
                      <Text style={{ color: editCurrency === cur ? colors.moduleFinance : colors.textSecondary, fontSize: 12, fontWeight: '600' }}>
                        {cur}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Category */}
              <View style={{ marginBottom: 14 }}>
                <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 13, marginBottom: 8 }}>
                  Category ({editTransactionType === 'income' ? 'Income' : 'Expense'})
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {[editCategories.slice(0, Math.ceil(editCategories.length / 2)), editCategories.slice(Math.ceil(editCategories.length / 2))].map((col, colIdx) => (
                    <View key={colIdx} style={{ flex: 1, gap: 6 }}>
                      {col.map(cat => {
                        const config = getFinanceCategoryConfig(cat as FinanceTypeCategory);
                        const isSelected = editCategory === cat;
                        return (
                          <Pressable
                            key={cat}
                            onPress={() => setEditCategory(cat as FinanceTypeCategory)}
                            style={{
                              paddingVertical: 8,
                              paddingHorizontal: 10,
                              borderRadius: 8,
                              borderWidth: 1,
                              borderColor: isSelected ? config.hex : colors.borderSurface,
                              backgroundColor: isSelected ? config.hex + '20' : colors.bgSurface,
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
                            <Ionicons name={config.icon as keyof typeof Ionicons.glyphMap} size={12} color={isSelected ? config.hex : colors.textSecondary} />
                            <Text style={{ color: isSelected ? config.hex : colors.textSecondary, fontWeight: '500', fontSize: 12, flex: 1 }}>
                              {cat}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </View>

              {/* Notes */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 13, marginBottom: 6 }}>Notes</Text>
                <TextInput
                  value={editNotes}
                  onChangeText={setEditNotes}
                  placeholder="Optional"
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  numberOfLines={3}
                  style={{
                    backgroundColor: colors.bgSurface,
                    borderWidth: 1,
                    borderColor: colors.borderSurface,
                    borderRadius: 10,
                    padding: 12,
                    color: colors.textPrimary,
                    fontSize: 14,
                    textAlignVertical: 'top',
                    minHeight: 80,
                  }}
                />
              </View>

              <Button
                onPress={handleSave}
                title="Save Changes"
                icon="checkmark"
                variant="primary"
                fullWidth
                disabled={isSaving}
              />
              <View style={{ height: 40 }} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 20 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 12 }}>
            <Pressable
              onPress={() => router.back()}
              style={{ marginRight: 12 }}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </Pressable>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.textPrimary, flex: 1 }}>
              Transaction Details
            </Text>
            <Pressable
              onPress={() => setIsEditing(true)}
              style={{
                backgroundColor: colors.bgSurface,
                borderWidth: 1,
                borderColor: colors.borderSurface,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 6,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}
              accessibilityLabel="Edit transaction"
              accessibilityRole="button"
            >
              <Ionicons name="pencil" size={14} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '500' }}>Edit</Text>
            </Pressable>
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
  colors: ThemeColors;
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
