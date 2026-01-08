// app/habit/start.tsx - SPACE OPTIMIZED
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/src/components/common/Button';
import { startHabitTimer } from '@/src/database/actions/habitActions';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { getHabitConfig } from '@/src/lib/constants';
import type { HabitCategory } from '@/src/types/database.types';

const CATEGORY_ICONS: Record<HabitCategory, keyof typeof Ionicons.glyphMap> = {
  'Productivity': 'briefcase',
  'Self-Care': 'heart',
  'Logistics': 'car',
  'Enjoyment': 'happy',
  'Nothing': 'moon',
};

const CATEGORY_COLORS: Record<HabitCategory, string> = {
  'Productivity': '#a855f7',
  'Self-Care': '#22c55e',
  'Logistics': '#3b82f6',
  'Enjoyment': '#ec4899',
  'Nothing': '#64748b',
};

const CATEGORIES: HabitCategory[] = ['Productivity', 'Self-Care', 'Logistics', 'Enjoyment', 'Nothing'];

export default function StartHabitScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory>('Productivity');
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const config = getHabitConfig(selectedCategory);
  const activities = config?.activities || [];
  const useTwoColumns = activities.length > 5;

  const handleStartTimer = async () => {
    if (!selectedActivity) {
      Alert.alert('Error', 'Please select an activity');
      return;
    }

    setIsLoading(true);

    try {
      await startHabitTimer(selectedCategory, selectedActivity, notes.trim() || undefined);
      router.back();
    } catch (error) {
      console.error('Failed to start habit timer:', error);
      Alert.alert('Error', 'Failed to start timer');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 20 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, marginTop: 8 }}>
            <Pressable onPress={() => router.back()} style={{ marginRight: 12 }}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </Pressable>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.textPrimary }}>
              Start Activity
            </Text>
          </View>

          {/* Category Selection - Fill Width */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 10 }}>
              Category
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {CATEGORIES.map((category) => (
                <Pressable
                  key={category}
                  onPress={() => {
                    setSelectedCategory(category);
                    setSelectedActivity('');
                  }}
                  style={{
                    flex: 1,
                    flexBasis: '30%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: selectedCategory === category 
                      ? CATEGORY_COLORS[category] 
                      : colors.bgSurface,
                    borderWidth: 1.5,
                    borderColor: selectedCategory === category 
                      ? CATEGORY_COLORS[category] 
                      : colors.borderSurface,
                    borderRadius: 10,
                    paddingVertical: 10,
                    paddingHorizontal: 8,
                  }}
                >
                  <Ionicons
                    name={CATEGORY_ICONS[category]}
                    size={18}
                    color={selectedCategory === category ? 'white' : colors.textPrimary}
                  />
                  <Text
                    style={{
                      marginLeft: 6,
                      fontSize: 13,
                      fontWeight: '600',
                      color: selectedCategory === category ? 'white' : colors.textPrimary,
                    }}
                    numberOfLines={1}
                  >
                    {category}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Activity Selection - Dynamic Columns */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 10 }}>
              Activity
            </Text>
            {activities.length > 0 ? (
              <View style={{ 
                flexDirection: 'row', 
                flexWrap: 'wrap', 
                gap: 8 
              }}>
                {activities.map((activity) => (
                  <Pressable
                    key={activity}
                    onPress={() => setSelectedActivity(activity)}
                    style={{
                      width: useTwoColumns ? '48.5%' : '100%',
                      backgroundColor: selectedActivity === activity
                        ? `${CATEGORY_COLORS[selectedCategory]}20`
                        : colors.bgSurface,
                      borderWidth: 1.5,
                      borderColor: selectedActivity === activity
                        ? CATEGORY_COLORS[selectedCategory]
                        : colors.borderSurface,
                      borderRadius: 10,
                      paddingVertical: 12,
                      paddingHorizontal: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: selectedActivity === activity ? '600' : '500',
                        color: selectedActivity === activity 
                          ? CATEGORY_COLORS[selectedCategory]
                          : colors.textPrimary,
                        flex: 1,
                      }}
                      numberOfLines={1}
                    >
                      {activity}
                    </Text>
                    {selectedActivity === activity && (
                      <Ionicons 
                        name="checkmark-circle" 
                        size={18} 
                        color={CATEGORY_COLORS[selectedCategory]}
                        style={{ marginLeft: 6 }}
                      />
                    )}
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text style={{ color: colors.textTertiary, fontSize: 14 }}>
                No activities available
              </Text>
            )}
          </View>

          {/* Notes Section */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 }}>
              Notes <Text style={{ color: colors.textTertiary, fontSize: 13, fontWeight: '400' }}>(Optional)</Text>
            </Text>
            <TextInput
              placeholder="Add notes about this activity..."
              placeholderTextColor={colors.textTertiary}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              style={{
                backgroundColor: colors.bgSurface,
                borderWidth: 1,
                borderColor: colors.borderSurface,
                borderRadius: 10,
                padding: 12,
                fontSize: 14,
                color: colors.textPrimary,
                textAlignVertical: 'top',
                minHeight: 80,
              }}
            />
          </View>

          {/* Start Button */}
          <Button
            onPress={handleStartTimer}
            title="Start Timer"
            icon="play"
            variant="primary"
            fullWidth
            loading={isLoading}
            disabled={!selectedActivity}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}