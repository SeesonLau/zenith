// ==========================================
// USAGE EXAMPLE: Finance Tracker
// ==========================================
// app/(tabs)/finance.tsx (Simplified example)

/*
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { createFinanceLog } from '@/src/database/actions/financeActions';

export default function FinanceScreen() {
  const [item, setItem] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [cost, setCost] = useState('');
  const [category, setCategory] = useState<FinanceTypeCategory>('Food');

  const handleSubmit = async () => {
    await createFinanceLog({
      transactionType: 'expense',
      item,
      quantity: parseFloat(quantity),
      cost: parseFloat(cost),
      currency: 'PHP',
      typeCategory: category,
    });
    
    // Reset form
    setItem('');
    setQuantity('1');
    setCost('');
  };

  return (
    <View className="p-4">
      <Text className="text-2xl font-bold mb-4">Add Transaction</Text>
      
      <TextInput
        placeholder="Item"
        value={item}
        onChangeText={setItem}
        className="border p-3 rounded mb-3"
      />
      
      <TextInput
        placeholder="Quantity"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
        className="border p-3 rounded mb-3"
      />
      
      <TextInput
        placeholder="Cost"
        value={cost}
        onChangeText={setCost}
        keyboardType="decimal-pad"
        className="border p-3 rounded mb-3"
      />
      
      <Pressable 
        onPress={handleSubmit}
        className="bg-blue-500 p-4 rounded"
      >
        <Text className="text-white text-center font-bold">
          Add Transaction
        </Text>
      </Pressable>
    </View>
  );
}
*/