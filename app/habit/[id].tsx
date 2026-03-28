// app/habit/[id].tsx - COMPACT VERSION
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { database } from '@/src/database';
import type HabitLog from '@/src/database/models/HabitLog';
import { formatDurationHMS, formatTime } from '@/src/utils/formatters';
import { formatDate } from '@/src/utils/dateHelpers';
import { getHabitConfig } from '@/src/lib/constants';
import Button from '@/src/components/common/Button';
import type { HabitCategory } from '@/src/types/database.types';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export default function HabitDetailScreen() {
  const router = useRouter();
  const colors = useThemeColors();
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
      'Are you sure you want to delete this session?',
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
              Alert.alert('Error', 'Failed to delete session');
            }
          },
        },
      ]
    );
  };

  if (!habitLog) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgPrimary, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="hourglass-outline" size={36} color={colors.textTertiary} />
        <Text style={{ color: colors.textPrimary, marginTop: 12 }}>Loading...</Text>
      </View>
    );
  }

  const category = habitLog.category as HabitCategory;
  const config = getHabitConfig(category);
  const durationSeconds = habitLog.duration || 0;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 20 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 8 }}>
            <Pressable onPress={() => router.back()} style={{ marginRight: 12 }}>
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </Pressable>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.textPrimary, flex: 1 }}>
              Session Details
            </Text>
          </View>

          {/* Session Card */}
          <View style={{
            backgroundColor: colors.bgSurface,
            borderWidth: 1,
            borderColor: colors.borderSurface,
            borderRadius: 14,
            padding: 16,
            marginBottom: 14
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ 
                backgroundColor: config.color, 
                borderRadius: 24, 
                width: 48, 
                height: 48, 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginRight: 12 
              }}>
                <Ionicons name={config.icon as any} size={24} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ 
                  color: colors.textTertiary, 
                  fontSize: 10, 
                  textTransform: 'uppercase', 
                  letterSpacing: 0.5 
                }}>
                  {habitLog.category}
                </Text>
                <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: 'bold' }}>
                  {habitLog.activity}
                </Text>
              </View>
            </View>

            {/* Duration Display */}
            <View style={{ 
              backgroundColor: colors.bgSurfaceHover, 
              borderRadius: 12, 
              padding: 16,
              borderWidth: 1,
              borderColor: colors.moduleHabits + '30'
            }}>
              <Text style={{ color: colors.textTertiary, fontSize: 11, marginBottom: 4, textAlign: 'center' }}>
                Total Duration
              </Text>
              <Text style={{ 
                color: colors.moduleHabits, 
                fontSize: 40, 
                fontFamily: 'monospace', 
                fontWeight: 'bold', 
                textAlign: 'center' 
              }}>
                {formatDurationHMS(durationSeconds)}
              </Text>
            </View>
          </View>

          {/* Time Details */}
          <View style={{
            backgroundColor: colors.bgSurface,
            borderWidth: 1,
            borderColor: colors.borderSurface,
            borderRadius: 14,
            padding: 16,
            marginBottom: 14
          }}>
            <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 15, marginBottom: 12 }}>
              Time Details
            </Text>
            
            <DetailRow
              icon="play"
              label="Started"
              value={`${formatDate(habitLog.startedAt, 'short')} at ${formatTime(habitLog.startedAt)}`}
              colors={colors}
            />
            {habitLog.endedAt && (
              <DetailRow
                icon="stop"
                label="Ended"
                value={`${formatDate(habitLog.endedAt, 'short')} at ${formatTime(habitLog.endedAt)}`}
                colors={colors}
              />
            )}
            <DetailRow
              icon="time"
              label="Duration"
              value={formatDurationHMS(durationSeconds)}
              colors={colors}
              isLast
            />
          </View>

          {/* Notes */}
          {habitLog.notes && (
            <View style={{
              backgroundColor: colors.bgSurface,
              borderWidth: 1,
              borderColor: colors.borderSurface,
              borderRadius: 14,
              padding: 16,
              marginBottom: 14
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} />
                <Text style={{ color: colors.textPrimary, fontWeight: '600', marginLeft: 6, fontSize: 14 }}>
                  Notes
                </Text>
              </View>
              <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 20 }}>
                {habitLog.notes}
              </Text>
            </View>
          )}

          {/* Insight */}
          <View style={{
            backgroundColor: config.color + '15',
            borderWidth: 1,
            borderColor: config.color + '30',
            borderRadius: 12,
            padding: 14,
            marginBottom: 14
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Ionicons name="bulb" size={16} color={config.color} style={{ marginRight: 8, marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: config.color, fontSize: 12, fontWeight: '600', marginBottom: 4 }}>
                  Session Insight
                </Text>
                <Text style={{ color: config.color, fontSize: 11, opacity: 0.9 }}>
                  {durationSeconds < 300
                    ? 'Quick session! Every minute counts.'
                    : durationSeconds < 1800
                    ? 'Good session length! Solid time investment.'
                    : durationSeconds < 3600
                    ? 'Great focus! Serious dedication.'
                    : 'Impressive! Extended deep work session.'}
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
    </SafeAreaView>
  );
}

interface DetailRowProps {
  icon: any;
  label: string;
  value: string;
  colors: any;
  isLast?: boolean;
}

function DetailRow({ icon, label, value, colors, isLast }: DetailRowProps) {
  return (
    <View style={{ 
      flexDirection: 'row', 
      paddingVertical: 10,
      borderBottomWidth: isLast ? 0 : 1,
      borderBottomColor: colors.borderSurface
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', flex: 1 }}>
        <Ionicons name={icon} size={16} color={colors.textTertiary} style={{ marginTop: 1 }} />
        <Text style={{ color: colors.textSecondary, fontSize: 12, marginLeft: 8, width: 70 }}>
          {label}
        </Text>
      </View>
      <Text style={{ color: colors.textPrimary, flex: 1, fontSize: 12 }}>{value}</Text>
    </View>
  );
}