// src/components/leisure/LeisureTypePicker.tsx
import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LEISURE_CONFIG } from '@/src/lib/constants';
import type { LeisureType } from '@/src/types/database.types';

interface LeisureTypePickerProps {
  selected?: LeisureType;
  onSelect: (type: LeisureType) => void;
}

export default function LeisureTypePicker({ selected, onSelect }: LeisureTypePickerProps) {
  const types = Object.keys(LEISURE_CONFIG.types) as LeisureType[];

  return (
    <View>
      <Text className="text-white font-semibold mb-3">Content Type</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="mb-4"
      >
        <View className="flex-row gap-3">
          {types.map((type) => {
            const config = LEISURE_CONFIG.types[type];
            const isSelected = selected === type;

            return (
              <Pressable
                key={type}
                onPress={() => onSelect(type)}
                className={`
                  ${isSelected ? config.color : 'bg-slate-800'}
                  border-2 ${isSelected ? config.borderColor : 'border-slate-700'}
                  rounded-xl p-4 min-w-[120px] items-center
                `}
              >
                <Text className="text-3xl mb-2">{config.emoji}</Text>
                <Text className={`font-semibold ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                  {type}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}