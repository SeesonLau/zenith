// src/components/diary/MoodPicker.tsx (IMPROVED)
import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DIARY_CONFIG } from '@/src/lib/constants';
import type { MoodType } from '@/src/types/database.types';

interface MoodPickerProps {
  selected?: MoodType;
  onSelect: (mood: MoodType) => void;
}

export default function MoodPicker({ selected, onSelect }: MoodPickerProps) {
  const moods = Object.keys(DIARY_CONFIG.moods) as MoodType[];

  return (
    <View>
      <Text className="text-white font-semibold mb-3">How are you feeling?</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="mb-4"
      >
        <View className="flex-row gap-3">
          {moods.map((mood) => {
            const config = DIARY_CONFIG.moods[mood];
            const isSelected = selected === mood;

            return (
              <Pressable
                key={mood}
                onPress={() => onSelect(mood)}
                className={`
                  ${isSelected ? config.color : 'bg-slate-800'}
                  rounded-xl p-3 min-w-[90px] items-center
                  ${isSelected ? '' : 'border-2 border-slate-700'}
                `}
              >
                <Text className="text-3xl mb-1">{config.emoji}</Text>
                <Text className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                  {mood}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}