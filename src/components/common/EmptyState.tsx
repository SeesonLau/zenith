// src/components/common/EmptyState.tsx themed
import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import type { IconProps } from '@expo/vector-icons/build/createIconSet';

interface EmptyStateProps {
  icon: IconProps<any>['name'];
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  const colors = useThemeColors();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <View style={{
        backgroundColor: colors.bgSurfaceHover,
        borderRadius: 40,
        width: 80,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16
      }}>
        <Ionicons name={icon as any} size={40} color={colors.textTertiary} />
      </View>
      <Text style={{
        color: colors.textPrimary,
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 8
      }}>
        {title}
      </Text>
      {description && (
        <Text style={{
          color: colors.textSecondary,
          fontSize: 14,
          textAlign: 'center',
          marginBottom: 24
        }}>
          {description}
        </Text>
      )}
      {action}
    </View>
  );
}