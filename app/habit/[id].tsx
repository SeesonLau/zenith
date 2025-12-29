// app/habit/[id].tsx (UPDATED)
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { database } from '@/src/database';
import type HabitLog from '@/src/database/models/HabitLog';
import { formatDurationHMS, formatTime } from '@/src/utils/formatters';
import { formatDate } from '@/src/utils/dateHelpers';
import { getHabitConfig } from '@/src/lib/constants';
import Button from '@/src/components/common/Button';
import type { HabitCategory } from '@/src/types/database.types';

export default function HabitDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [habitLog, setHabitLog] = useState<HabitLog | null>(null);

  useEffect(() => {
    loadHabitLog();
  }, [id]);

  const loadHabitLog = async () => {
    try {
      const log = await database.get<HabitLog>('habit_logs').find(id);
      setHabitLog(log);
    } catch (error) {
      console.error('Failed to load habit log:', error);
      Alert.alert('Error', 'Habit log not found');
      router.back();
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this habit session? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await habitLog?.markAsDeleted();
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete habit log');
            }
          },
        },
      ]
    );
  };

  if (!habitLog) {
    return (
      <View className="flex-1 bg-slate-900 items-center justify-center">
        <Ionicons name="hourglass-outline" size={40} color="#64748b" />
        <Text className="text-white mt-4">Loading session...</Text>
      </View>
    );
  }

  const category = habitLog.category as HabitCategory;
  const config = getHabitConfig(category);
  const durationSeconds = habitLog.duration || 0;

  return (
    <ScrollView className="flex-1 bg-slate-900">
      <View className="p-6">
        {/* Header */}
        <View className="flex-row items-center mb-6 mt-4">
          <Pressable onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={28} color="white" />
          </Pressable>
          <Text className="text-2xl font-bold text-white flex-1">Session Details</Text>
        </View>

        {/* Session Card */}
        <View className={`rounded-2xl p-6 mb-6 border-2 ${config.borderColor}`}>
          <View className="flex-row items-center mb-4">
            <View className={`${config.color} rounded-full w-16 h-16 items-center justify-center mr-4`}>
              <Ionicons name={config.icon as any} size={32} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-400 text-xs uppercase tracking-wider">{habitLog.category}</Text>
              <Text className="text-white text-2xl font-bold">{habitLog.activity}</Text>
            </View>
          </View>

          {/* Duration Display */}
          <View className="glass rounded-xl p-5 mb-4">
            <Text className="text-slate-400 text-sm mb-2">Total Duration</Text>
            <Text className="text-sky-400 text-5xl font-mono font-bold text-center">
              {formatDurationHMS(durationSeconds)}
            </Text>
          </View>
        </View>

        {/* Time Details */}
        <View className="card p-4 mb-6">
          <Text className="text-white font-semibold text-lg mb-4">Time Details</Text>
          
          <DetailRow
            icon="play"
            label="Started"
            value={`${formatDate(habitLog.startedAt, 'full')} at ${formatTime(habitLog.startedAt)}`}
          />
          {habitLog.endedAt && (
            <DetailRow
              icon="stop"
              label="Ended"
              value={`${formatDate(habitLog.endedAt, 'full')} at ${formatTime(habitLog.endedAt)}`}
            />
          )}
          <DetailRow
            icon="time"
            label="Duration"
            value={formatDurationHMS(durationSeconds)}
          />
        </View>

        {/* Notes */}
        {habitLog.notes && (
          <View className="card p-4 mb-6">
            <View className="flex-row items-center mb-2">
              <Ionicons name="document-text-outline" size={20} color="#94a3b8" />
              <Text className="text-white font-semibold ml-2">Notes</Text>
            </View>
            <Text className="text-slate-300">{habitLog.notes}</Text>
          </View>
        )}

        {/* Insights */}
        <View className={`${config.bgColor} border ${config.borderColor} rounded-xl p-4 mb-6`}>
          <View className="flex-row items-start">
            <Ionicons name="bulb" size={20} color="#a78bfa" style={{ marginRight: 8, marginTop: 2 }} />
            <View className="flex-1">
              <Text className={`${config.textColor} text-sm font-semibold mb-1`}>Session Insight</Text>
              <Text className={`${config.textColor} text-xs opacity-80`}>
                {durationSeconds < 300
                  ? 'Quick session! Every minute counts towards building your habit.'
                  : durationSeconds < 1800
                  ? 'Good session length! This is a solid time investment in yourself.'
                  : durationSeconds < 3600
                  ? 'Great focus! You dedicated serious time to this activity.'
                  : 'Impressive dedication! This was an extended deep work session.'}
              </Text>
            </View>
          </View>
        </View>

        {/* Delete Button */}
        <Button
          onPress={handleDelete}
          title="Delete Session"
          icon="trash"
          variant="danger"
          fullWidth
        />
      </View>
    </ScrollView>
  );
}

interface DetailRowProps {
  icon: any;
  label: string;
  value: string;
}

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <View className="flex-row py-3 border-b border-slate-700 last:border-b-0">
      <View className="flex-row items-start flex-1">
        <Ionicons name={icon} size={20} color="#64748b" style={{ marginTop: 2 }} />
        <Text className="text-slate-400 text-sm ml-3 w-20">{label}</Text>
      </View>
      <Text className="text-white flex-1">{value}</Text>
    </View>
  );
}