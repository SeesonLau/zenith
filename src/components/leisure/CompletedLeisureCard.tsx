// src/components/leisure/CompletedLeisureCard.tsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getLeisureConfig } from '@/src/lib/constants';
import { formatDurationHMS, formatTime } from '@/src/utils/formatters';
import { formatDate } from '@/src/utils/dateHelpers';
import type { LeisureType } from '@/src/types/database.types';

interface CompletedLeisureCardProps {
  id: string;
  type: LeisureType;
  title?: string;
  startedAt: Date;
  duration: number;
  notes?: string;
  onPress: () => void;
}

export default function CompletedLeisureCard({
  type,
  title,
  startedAt,
  duration,
  notes,
  onPress,
}: CompletedLeisureCardProps) {
  const config = getLeisureConfig(type);

  return (
    <Pressable
      onPress={onPress}
      className="card p-4 mb-3 active:bg-slate-700"
    >
      <View className="flex-row items-center">
        <View className={`${config.color} rounded-full w-12 h-12 items-center justify-center mr-4`}>
          <Text className="text-2xl">{config.emoji}</Text>
        </View>
        
        <View className="flex-1">
          <Text className="text-white font-semibold text-base mb-1">
            {title || `${type} Session`}
          </Text>
          
          <View className="flex-row items-center flex-wrap gap-2">
            <View className={`${config.bgColor} px-2 py-1 rounded`}>
              <Text className={`${config.textColor} text-xs font-medium`}>
                {type}
              </Text>
            </View>
            
            <View className="flex-row items-center">
              <Ionicons name="time" size={12} color="#64748b" />
              <Text className="text-slate-500 text-xs ml-1">
                {formatDurationHMS(duration)}
              </Text>
            </View>
            
            <View className="flex-row items-center">
              <Ionicons name="calendar" size={12} color="#64748b" />
              <Text className="text-slate-500 text-xs ml-1">
                {formatDate(startedAt, 'short')}
              </Text>
            </View>
          </View>

          {notes && (
            <Text className="text-slate-400 text-xs mt-2 truncate-2">
              {notes}
            </Text>
          )}
        </View>

        <Ionicons name="chevron-forward" size={20} color="#64748b" />
      </View>
    </Pressable>
  );
}