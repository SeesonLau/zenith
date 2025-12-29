// app/leisure/[id].tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { database } from '@/src/database';
import type LeisureLog from '@/src/database/models/LeisureLog';
import { getLeisureConfig } from '@/src/lib/constants';
import { formatDurationHMS, formatTime } from '@/src/utils/formatters';
import { formatDate } from '@/src/utils/dateHelpers';
import Button from '@/src/components/common/Button';

export default function LeisureDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [leisureLog, setLeisureLog] = useState<LeisureLog | null>(null);

  useEffect(() => {
    loadLeisureLog();
  }, [id]);

  const loadLeisureLog = async () => {
    try {
      const log = await database.get<LeisureLog>('leisure_logs').find(id);
      setLeisureLog(log);
    } catch (error) {
      console.error('Failed to load leisure log:', error);
      Alert.alert('Error', 'Session not found');
      router.back();
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this leisure session? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await leisureLog?.markAsDeleted();
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete session');
            }
          },
        },
      ]
    );
  };

  if (!leisureLog) {
    return (
      <View className="flex-1 bg-slate-900 items-center justify-center">
        <Ionicons name="film-outline" size={40} color="#64748b" />
        <Text className="text-white mt-4">Loading session...</Text>
      </View>
    );
  }

  const config = getLeisureConfig(leisureLog.type);
  const durationSeconds = leisureLog.duration || 0;

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
              <Text className="text-4xl">{config.emoji}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-slate-400 text-xs uppercase tracking-wider">
                {leisureLog.type}
              </Text>
              <Text className="text-white text-2xl font-bold">
                {leisureLog.title || `${leisureLog.type} Session`}
              </Text>
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
            value={`${formatDate(leisureLog.startedAt, 'full')} at ${formatTime(leisureLog.startedAt)}`}
          />
          {leisureLog.endedAt && (
            <DetailRow
              icon="stop"
              label="Ended"
              value={`${formatDate(leisureLog.endedAt, 'full')} at ${formatTime(leisureLog.endedAt)}`}
            />
          )}
          <DetailRow icon="time" label="Duration" value={formatDurationHMS(durationSeconds)} />
        </View>

        {/* Notes */}
        {leisureLog.notes && (
          <View className="card p-4 mb-6">
            <View className="flex-row items-center mb-2">
              <Ionicons name="document-text-outline" size={20} color="#94a3b8" />
              <Text className="text-white font-semibold ml-2">Notes</Text>
            </View>
            <Text className="text-slate-300">{leisureLog.notes}</Text>
          </View>
        )}

        {/* Insights */}
        <View className={`${config.bgColor} border ${config.borderColor} rounded-xl p-4 mb-6`}>
          <View className="flex-row items-start">
            <Ionicons name="bulb" size={20} color={config.color.replace('bg-', '#')} style={{ marginRight: 8, marginTop: 2 }} />
            <View className="flex-1">
              <Text className={`${config.textColor} text-sm font-semibold mb-1`}>
                Session Insight
              </Text>
              <Text className={`${config.textColor} text-xs opacity-80`}>
                {durationSeconds < 600
                  ? 'Quick session! Perfect for a short break.'
                  : durationSeconds < 1800
                  ? 'Nice session length. Good balance for leisure time.'
                  : durationSeconds < 3600
                  ? 'Extended session! Make sure to take breaks.'
                  : 'Long session detected. Remember to stay hydrated and stretch!'}
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