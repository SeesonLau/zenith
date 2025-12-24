// app/habit/start.tsx
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
import { startHabitTimer } from '@/src/database/actions/habitActions';
import { HABIT_CATEGORIES, HABIT_ACTIVITIES } from '@/src/types/database.types';
import type { HabitCategory } from '@/src/types/database.types';
import Button from '@/src/components/common/Button';

const CATEGORY_COLORS: Record<HabitCategory, string> = {
  Productivity: 'bg-purple-500',
  'Self-Care': 'bg-green-500',
  Logistics: 'bg-blue-500',
  Enjoyment: 'bg-pink-500',
  Nothing: 'bg-gray-500',
};

const CATEGORY_ICONS: Record<HabitCategory, any> = {
  Productivity: 'briefcase',
  'Self-Care': 'heart',
  Logistics: 'car',
  Enjoyment: 'happy',
  Nothing: 'time',
};

export default function StartTimerScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    if (!selectedCategory || !selectedActivity) {
      Alert.alert('Error', 'Please select both category and activity');
      return;
    }

    setIsLoading(true);

    try {
      await startHabitTimer(selectedCategory, selectedActivity, notes || undefined);
      router.back();
    } catch (error) {
      console.error('Failed to start timer:', error);
      Alert.alert('Error', 'Failed to start timer');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-900"
    >
      <ScrollView className="flex-1">
        <View className="p-6">
          {/* Header */}
          <View className="flex-row items-center mb-6 mt-4">
            <Pressable onPress={() => router.back()} className="mr-4">
              <Ionicons name="close" size={28} color="white" />
            </Pressable>
            <Text className="text-2xl font-bold text-white flex-1">Start Timer</Text>
          </View>

          {/* Category Selection */}
          <Text className="text-white font-semibold text-lg mb-3">Select Category</Text>
          <View className="flex-row flex-wrap gap-3 mb-6">
            {HABIT_CATEGORIES.map((category) => (
              <Pressable
                key={category}
                onPress={() => {
                  setSelectedCategory(category);
                  setSelectedActivity(null);
                }}
                className={`flex-1 min-w-[45%] rounded-xl p-4 border-2 ${
                  selectedCategory === category
                    ? `${CATEGORY_COLORS[category]} border-opacity-100`
                    : 'bg-slate-800 border-slate-700'
                }`}
              >
                <View className="items-center">
                  <View
                    className={`${
                      selectedCategory === category ? 'bg-white/20' : 'bg-slate-700'
                    } rounded-full w-12 h-12 items-center justify-center mb-2`}
                  >
                    <Ionicons
                      name={CATEGORY_ICONS[category]}
                      size={24}
                      color={selectedCategory === category ? 'white' : '#64748b'}
                    />
                  </View>
                  <Text
                    className={`font-semibold text-center ${
                      selectedCategory === category ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    {category}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>

          {/* Activity Selection */}
          {selectedCategory && (
            <>
              <Text className="text-white font-semibold text-lg mb-3">Select Activity</Text>
              <View className="flex-row flex-wrap gap-2 mb-6">
                {HABIT_ACTIVITIES[selectedCategory].map((activity) => (
                  <Pressable
                    key={activity}
                    onPress={() => setSelectedActivity(activity)}
                    className={`px-4 py-3 rounded-xl ${
                      selectedActivity === activity
                        ? CATEGORY_COLORS[selectedCategory]
                        : 'bg-slate-800 border border-slate-700'
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        selectedActivity === activity ? 'text-white' : 'text-slate-400'
                      }`}
                    >
                      {activity}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {/* Notes */}
          <Text className="text-white font-semibold text-lg mb-3">Notes (Optional)</Text>
          <TextInput
            placeholder="Add any notes..."
            placeholderTextColor="#64748b"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            className="bg-slate-800 border border-slate-700 text-white p-4 rounded-xl mb-6"
            style={{ textAlignVertical: 'top' }}
          />

          {/* Start Button */}
          <Button
            onPress={handleStart}
            title="Start Timer"
            icon="play"
            variant="primary"
            fullWidth
            disabled={!selectedCategory || !selectedActivity}
            loading={isLoading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}