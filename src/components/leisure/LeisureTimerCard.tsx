// src/components/leisure/LeisureTimerCard.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getLeisureConfig } from '@/src/lib/constants';
import { formatDurationHMS } from '@/src/utils/formatters';
import { getRelativeTime } from '@/src/utils/dateHelpers';
import Button from '@/src/components/common/Button';
import type { LeisureType } from '@/src/types/database.types';

interface LeisureTimerCardProps {
  id: string;
  type: LeisureType;
  title?: string;
  notes?: string;
  startedAt: Date;
  onStop: (id: string) => void;
  onPress?: () => void;
}

export default function LeisureTimerCard({
  id,
  type,
  title,
  notes,
  startedAt,
  onStop,
  onPress,
}: LeisureTimerCardProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const config = getLeisureConfig(type);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  return (
    <Pressable
      onPress={onPress}
      className={`rounded-2xl p-5 border-2 ${config.borderColor} border-opacity-30 mb-3`}
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)' }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <View className={`${config.color} rounded-full w-12 h-12 items-center justify-center mr-3`}>
            <Text className="text-2xl">{config.emoji}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-slate-400 text-xs uppercase tracking-wider">{type}</Text>
            <Text className="text-white text-lg font-bold">
              {title || `${type} Session`}
            </Text>
          </View>
        </View>
      </View>

      {/* Timer Display */}
      <View className="glass rounded-xl p-4 mb-3">
        <Text className="text-sky-400 text-4xl font-mono font-bold text-center">
          {formatDurationHMS(elapsedTime)}
        </Text>
        <Text className="text-slate-500 text-xs text-center mt-1">
          Started {getRelativeTime(startedAt)}
        </Text>
      </View>

      {/* Notes */}
      {notes && (
        <View className="bg-slate-800/50 rounded-lg p-3 mb-3">
          <Text className="text-slate-400 text-sm">{notes}</Text>
        </View>
      )}

      {/* Stop Button */}
      <Button
        onPress={() => onStop(id)}
        title="Stop Session"
        icon="stop"
        variant="danger"
        fullWidth
      />
    </Pressable>
  );
}