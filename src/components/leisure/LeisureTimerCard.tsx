// src/components/leisure/LeisureTimerCard.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDurationHMS } from '@/src/utils/formatters';
import { getRelativeTime } from '@/src/utils/dateHelpers';
import Button from '@/src/components/common/Button';
import { useThemeColors } from '@/src/hooks/useThemeColors';
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
  startedAt,
  onStop,
  onPress,
}: LeisureTimerCardProps) {
  const colors = useThemeColors();
  const [elapsedTime, setElapsedTime] = useState(0);

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
      style={{
        backgroundColor: colors.bgSurface,
        borderWidth: 2,
        borderColor: '#ec4899',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
      }}
    >
      {/* Active Indicator */}
      <View 
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#22c55e20',
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#22c55e50',
        }}
      >
        <View style={{ width: 5, height: 5, backgroundColor: '#22c55e', borderRadius: 3, marginRight: 5 }} />
        <Text style={{ color: '#22c55e', fontSize: 10, fontWeight: '700' }}>
          ACTIVE
        </Text>
      </View>

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingRight: 70 }}>
        <View 
          style={{
            backgroundColor: '#64748b',
            borderRadius: 20,
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Text style={{ fontSize: 20 }}>❓</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text 
            style={{
              color: colors.textTertiary,
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              fontWeight: '600',
              marginBottom: 2
            }}
          >
            IN PROGRESS
          </Text>
          <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: 'bold' }}>
            Untitled Session
          </Text>
        </View>
      </View>

      {/* Timer Display - Compact */}
      <View 
        style={{
          backgroundColor: colors.bgSurfaceHover,
          borderRadius: 12,
          padding: 12,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: '#0ea5e940',
          alignItems: 'center',
        }}
      >
        <Text 
          style={{
            color: '#0ea5e9',
            fontSize: 32,
            fontFamily: 'monospace',
            fontWeight: 'bold',
          }}
        >
          {formatDurationHMS(elapsedTime)}
        </Text>
        <Text style={{ color: colors.textTertiary, fontSize: 11, marginTop: 4 }}>
          Started {getRelativeTime(startedAt)}
        </Text>
      </View>

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