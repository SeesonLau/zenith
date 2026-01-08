// src/components/leisure/CompletedLeisureCard.tsx - COMPACT VERSION
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getLeisureConfig } from '@/src/lib/constants';
import { formatDurationHMS } from '@/src/utils/formatters';
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
        borderRadius: 12,
        padding: 12,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* Icon */}
        <View style={{
          backgroundColor: config.color,
          borderRadius: 20,
          width: 40,
          height: 40,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}>
          <Text style={{ fontSize: 22 }}>{config.emoji}</Text>
        </View>
        
        {/* Content */}
        <View style={{ flex: 1 }}>
          <Text style={{ 
            color: colors.textPrimary, 
            fontWeight: '600', 
            fontSize: 14,
            marginBottom: 3,
          }}>
            {title || `${type} Session`}
          </Text>
          
          {/* Meta Info */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: 6 
          }}>
            {/* Type Badge */}
            <View style={{
              backgroundColor: colors.bgSurfaceHover,
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
            }}>
              <Text style={{ 
                color: colors.textSecondary, 
                fontSize: 10, 
                fontWeight: '500' 
              }}>
                {type}
              </Text>
            </View>
            
            {/* Duration */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="time" size={10} color={colors.textTertiary} />
              <Text style={{
                color: colors.textTertiary,
                fontSize: 10,
                marginLeft: 2,
                fontFamily: 'monospace'
              }}>
                {formatDurationHMS(duration)}
              </Text>
            </View>
          </View>

          {/* Notes Preview */}
          {notes && (
            <Text style={{ 
              color: colors.textTertiary, 
              fontSize: 11,
              marginTop: 4,
              lineHeight: 16 
            }}
            numberOfLines={1}
            >
              {notes}
            </Text>
          )}
        </View>

        {/* Chevron */}
        <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
      </View>
    </Pressable>
  );
}