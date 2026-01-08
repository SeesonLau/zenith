// src/components/leisure/CompletedLeisureCard.tsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getLeisureConfig } from '@/src/lib/constants';
import { formatDurationHMS } from '@/src/utils/formatters';
import { formatDate } from '@/src/utils/dateHelpers';
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

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: colors.bgSurface,
        borderWidth: 1,
        borderColor: colors.borderSurface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* Icon */}
        <View 
          style={{
            backgroundColor: config.color,
            borderRadius: 22,
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 14,
          }}
        >
          <Text style={{ fontSize: 24 }}>{config.emoji}</Text>
        </View>
        
        {/* Content */}
        <View style={{ flex: 1 }}>
          <Text style={{ 
            color: colors.textPrimary, 
            fontWeight: '600', 
            fontSize: 16,
            marginBottom: 6,
            lineHeight: 20 
          }}>
            {title || `${type} Session`}
          </Text>
          
          {/* Meta Info */}
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            {/* Type Badge */}
            <View 
              style={{
                backgroundColor: config.bgColor,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: config.borderColor,
              }}
            >
              <Text style={{ color: config.textColor, fontSize: 11, fontWeight: '600' }}>
                {type}
              </Text>
            </View>
            
            {/* Duration */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="time" size={13} color={colors.textTertiary} />
              <Text 
                style={{
                  color: colors.textSecondary,
                  fontSize: 13,
                  marginLeft: 4,
                  fontWeight: '500',
                  fontFamily: 'monospace'
                }}
              >
                {formatDurationHMS(duration)}
              </Text>
            </View>
            
            {/* Date */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="calendar-outline" size={13} color={colors.textTertiary} />
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginLeft: 4 }}>
                {formatDate(startedAt, 'short')}
              </Text>
            </View>
          </View>

          {/* Notes Preview */}
          {notes && (
            <Text 
              style={{ 
                color: colors.textTertiary, 
                fontSize: 13,
                marginTop: 8,
                lineHeight: 18 
              }}
              numberOfLines={2}
            >
              {notes}
            </Text>
          )}
        </View>

        {/* Chevron */}
        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      </View>
    </Pressable>
  );
}