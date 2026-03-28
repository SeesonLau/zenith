// src/components/leisure/LeisureTimerCard.tsx - COMPACT VERSION
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
        borderWidth: 1,
        borderColor: colors.moduleLeisure,
        borderRadius: 12,
        padding: 14,
      }}
    >
      {/* Active Badge */}
      <View style={{
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#22c55e20',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
      }}>
        <View style={{ 
          width: 4, 
          height: 4, 
          backgroundColor: '#22c55e', 
          borderRadius: 2, 
          marginRight: 4 
        }} />
        <Text style={{ color: '#22c55e', fontSize: 9, fontWeight: '600' }}>LIVE</Text>
      </View>

      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 10, 
        paddingRight: 60 
      }}>
        <View style={{
          backgroundColor: '#64748b',
          borderRadius: 20,
          width: 36,
          height: 36,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 10,
        }}>
          <Text style={{ fontSize: 18 }}>❓</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{
            color: colors.textTertiary,
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            fontWeight: '600',
            marginBottom: 2
          }}>
            IN PROGRESS
          </Text>
          <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: 'bold' }}>
            Untitled Session
          </Text>
        </View>
      </View>

      {/* Timer Display */}
      <View style={{
        backgroundColor: colors.bgSurfaceHover,
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.moduleLeisure + '50',
      }}>
        <Text style={{
          color: colors.moduleLeisure,
          fontSize: 28,
          fontFamily: 'monospace',
          fontWeight: 'bold',
          textAlign: 'center',
        }}>
          {formatDurationHMS(elapsedTime)}
        </Text>
        <Text style={{ 
          color: colors.textTertiary, 
          fontSize: 10, 
          marginTop: 4, 
          textAlign: 'center' 
        }}>
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