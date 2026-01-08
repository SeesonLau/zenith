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
import { useThemeColors } from '@/src/hooks/useThemeColors';

export default function LeisureDetailScreen() {
  const router = useRouter();
  const colors = useThemeColors();
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
      <View style={{ flex: 1, backgroundColor: colors.bgPrimary, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="film-outline" size={40} color="#64748b" />
        <Text style={{ color: colors.textPrimary, marginTop: 16 }}>Loading session...</Text>
      </View>
    );
  }

  const config = getLeisureConfig(leisureLog.type);
  const durationSeconds = leisureLog.duration || 0;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <View style={{ padding: 24 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, marginTop: 16 }}>
          <Pressable onPress={() => router.back()} style={{ marginRight: 16 }}>
            <Ionicons name="arrow-back" size={28} color={colors.textPrimary} />
          </Pressable>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.textPrimary, flex: 1 }}>
            Session Details
          </Text>
        </View>

        {/* Session Card */}
        <View 
          style={{
            borderRadius: 20,
            padding: 24,
            marginBottom: 24,
            borderWidth: 2,
            borderColor: config.borderColor,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ 
              backgroundColor: config.color,
              borderRadius: 32,
              width: 64,
              height: 64,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16
            }}>
              <Text style={{ fontSize: 36 }}>{config.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textTertiary, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                {leisureLog.type}
              </Text>
              <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: 'bold' }}>
                {leisureLog.title || `${leisureLog.type} Session`}
              </Text>
            </View>
          </View>

          {/* Duration Display */}
          <View style={{ 
            backgroundColor: colors.bgSurfaceHover,
            borderRadius: 16,
            padding: 20,
            marginBottom: 16
          }}>
            <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 8 }}>
              Total Duration
            </Text>
            <Text 
              style={{ 
                color: '#0ea5e9', 
                fontSize: 48, 
                fontFamily: 'monospace', 
                fontWeight: 'bold',
                textAlign: 'center' 
              }}
            >
              {formatDurationHMS(durationSeconds)}
            </Text>
          </View>
        </View>

        {/* Time Details */}
        <View style={{
          backgroundColor: colors.bgSurface,
          borderWidth: 1,
          borderColor: colors.borderSurface,
          borderRadius: 16,
          padding: 16,
          marginBottom: 24
        }}>
          <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 18, marginBottom: 16 }}>
            Time Details
          </Text>

          <DetailRow
            icon="play"
            label="Started"
            value={`${formatDate(leisureLog.startedAt, 'full')} at ${formatTime(leisureLog.startedAt)}`}
            colors={colors}
          />
          {leisureLog.endedAt && (
            <DetailRow
              icon="stop"
              label="Ended"
              value={`${formatDate(leisureLog.endedAt, 'full')} at ${formatTime(leisureLog.endedAt)}`}
              colors={colors}
            />
          )}
          <DetailRow 
            icon="time" 
            label="Duration" 
            value={formatDurationHMS(durationSeconds)} 
            colors={colors}
          />
        </View>

        {/* Notes */}
        {leisureLog.notes && (
          <View style={{
            backgroundColor: colors.bgSurface,
            borderWidth: 1,
            borderColor: colors.borderSurface,
            borderRadius: 16,
            padding: 16,
            marginBottom: 24
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="document-text-outline" size={20} color={colors.textSecondary} />
              <Text style={{ color: colors.textPrimary, fontWeight: '600', marginLeft: 8 }}>
                Notes
              </Text>
            </View>
            <Text style={{ color: colors.textSecondary }}>{leisureLog.notes}</Text>
          </View>
        )}

        {/* Insights */}
        <View 
          style={{
            backgroundColor: config.bgColor,
            borderWidth: 1,
            borderColor: config.borderColor,
            borderRadius: 16,
            padding: 16,
            marginBottom: 24
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Ionicons 
              name="bulb" 
              size={20} 
              style={{ 
                color: config.color,
                marginRight: 8,
                marginTop: 2 
              }} 
            />
            <View style={{ flex: 1 }}>
              <Text 
                style={{
                  color: config.textColor,
                  fontSize: 14,
                  fontWeight: '600',
                  marginBottom: 4
                }}
              >
                Session Insight
              </Text>
              <Text 
                style={{
                  color: config.textColor,
                  fontSize: 12,
                  opacity: 0.8
                }}
              >
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
  colors: any;
}

function DetailRow({ icon, label, value, colors }: DetailRowProps) {
  return (
    <View 
      style={{
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderSurface
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', flex: 1 }}>
        <Ionicons name={icon} size={20} color={colors.textTertiary} style={{ marginTop: 2 }} />
        <Text style={{ color: colors.textSecondary, fontSize: 14, marginLeft: 12, width: 80 }}>
          {label}
        </Text>
      </View>
      <Text style={{ color: colors.textPrimary, flex: 1 }}>{value}</Text>
    </View>
  );
}