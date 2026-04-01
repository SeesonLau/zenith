// src/components/leisure/CompletedLeisureCard.tsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getLeisureConfig } from '@/src/lib/constants';
import { formatDuration } from '@/src/utils/formatters';
import { useThemeColors } from '@/src/hooks/useThemeColors';
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
  const colors = useThemeColors();
  const config = getLeisureConfig(type);

  const startStr = startedAt.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  });

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: colors.bgSurface,
        borderWidth: 1,
        borderColor: colors.borderSurface,
        borderLeftWidth: 3,
        borderLeftColor: config.hex,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* Emoji icon */}
        <View style={{
          backgroundColor: config.hex + '20',
          borderWidth: 1,
          borderColor: config.hex + '50',
          borderRadius: 10,
          width: 38,
          height: 38,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}>
          <Text style={{ fontSize: 20 }}>{config.emoji}</Text>
        </View>

        {/* Content */}
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 13, marginBottom: 2 }}>
            {title || `${type} Session`}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ color: colors.textTertiary, fontSize: 11 }}>
              {startStr}
            </Text>
            {notes ? (
              <>
                <Text style={{ color: colors.borderSurface }}>·</Text>
                <Text style={{ color: colors.textTertiary, fontSize: 11 }} numberOfLines={1}>
                  {notes}
                </Text>
              </>
            ) : null}
          </View>
        </View>

        {/* Duration badge + chevron */}
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <View style={{
            backgroundColor: config.hex + '20',
            borderWidth: 1,
            borderColor: config.hex + '50',
            borderRadius: 6,
            paddingHorizontal: 7,
            paddingVertical: 3,
          }}>
            <Text style={{ color: config.hex, fontSize: 11, fontWeight: '700' }}>
              {formatDuration(duration)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={14} color={colors.textTertiary} />
        </View>
      </View>
    </Pressable>
  );
}
