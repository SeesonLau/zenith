// src/components/common/Divider.tsx themed
import React from 'react';
import { View, Text } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface DividerProps {
  label?: string;
}

export default function Divider({ label }: DividerProps) {
  const colors = useThemeColors();

  if (label) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 24 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.borderSurface }} />
        <Text style={{
          color: colors.textTertiary,
          fontSize: 13,
          marginHorizontal: 16,
          textTransform: 'uppercase',
          letterSpacing: 1,
          fontWeight: '600'
        }}>
          {label}
        </Text>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.borderSurface }} />
      </View>
    );
  }

  return <View style={{ height: 1, backgroundColor: colors.borderSurface, marginVertical: 16 }} />;
}