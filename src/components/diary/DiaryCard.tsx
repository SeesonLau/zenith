// src/components/diary/DiaryCard.tsx (FIXED - Theme-Aware)
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getMoodConfig } from '@/src/lib/constants';
import { formatTime } from '@/src/utils/formatters';
import { formatDate } from '@/src/utils/dateHelpers';
import type { MoodType } from '@/src/types/database.types';

interface DiaryCardProps {
  id: string;
  title?: string;
  content: string;
  entryDate: Date;
  mood?: MoodType;
  wordCount: number;
  imageCount?: number;
  onPress: () => void;
}

export default function DiaryCard({
  title,
  content,
  entryDate,
  mood,
  wordCount,
  imageCount = 0,
  onPress,
}: DiaryCardProps) {
  const moodConfig = mood ? getMoodConfig(mood) : null;
  const excerpt = content.length > 100 ? `${content.substring(0, 100)}...` : content;

  return (
    <Pressable
      onPress={onPress}
      className="card p-4 mb-3 active:opacity-90"
    >
      {/* Header */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1 mr-3">
          {title && (
            <Text className="text-primary font-bold text-lg mb-1" numberOfLines={1}>
              {title}
            </Text>
          )}
          <View className="flex-row items-center flex-wrap gap-2">
            <Text className="text-secondary text-xs">
              {formatDate(entryDate, 'medium')} • {formatTime(entryDate)}
            </Text>
            {moodConfig && (
              <View className="flex-row items-center">
                <Text className="text-lg mr-1">{moodConfig.emoji}</Text>
                <Text className={`${moodConfig.textColor} text-xs font-medium`}>
                  {mood}
                </Text>
              </View>
            )}
          </View>
        </View>

        {moodConfig && (
          <View className={`${moodConfig.color} rounded-full w-10 h-10 items-center justify-center`}>
            <Ionicons name={moodConfig.icon as any} size={20} color="white" />
          </View>
        )}
      </View>

      {/* Content Preview - Fixed 3 lines */}
      <View style={{ height: 60 }}>
        <Text className="text-secondary text-sm leading-5" numberOfLines={3}>
          {excerpt}
        </Text>
      </View>

      {/* Footer */}
      <View className="flex-row items-center justify-between pt-3 border-t border-surface-border mt-2">
        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center">
            <Ionicons name="document-text-outline" size={14} color="#64748b" />
            <Text className="text-tertiary text-xs ml-1">{wordCount} words</Text>
          </View>
          {imageCount > 0 && (
            <View className="flex-row items-center">
              <Ionicons name="image-outline" size={14} color="#64748b" />
              <Text className="text-tertiary text-xs ml-1">{imageCount}</Text>
            </View>
          )}
        </View>
        <Ionicons name="chevron-forward" size={16} color="#64748b" />
      </View>
    </Pressable>
  );
}