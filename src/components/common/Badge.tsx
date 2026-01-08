// src/components/common/Badge.tsx themed
import React from 'react';
import { View, Text } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

export default function Badge({
  label,
  variant = 'default',
  size = 'md',
}: BadgeProps) {
  const colors = useThemeColors();

  const variantStyles = {
    default: { bg: colors.bgSurfaceHover, text: colors.textSecondary },
    success: { bg: '#22c55e30', text: '#22c55e' },
    warning: { bg: '#f59e0b30', text: '#f59e0b' },
    danger: { bg: '#ef444430', text: '#ef4444' },
    info: { bg: '#3b82f630', text: '#3b82f6' },
  };

  const sizeStyles = {
    sm: { px: 8, py: 2, fontSize: 11 },
    md: { px: 12, py: 4, fontSize: 13 },
  };

  const style = variantStyles[variant];
  const sizing = sizeStyles[size];

  return (
    <View style={{
      backgroundColor: style.bg,
      paddingHorizontal: sizing.px,
      paddingVertical: sizing.py,
      borderRadius: 20
    }}>
      <Text style={{
        color: style.text,
        fontSize: sizing.fontSize,
        fontWeight: '600'
      }}>
        {label}
      </Text>
    </View>
  );
}