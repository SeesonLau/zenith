// src/components/common/LoadingSpinner.tsx  themed
import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  size = 'large',
  color = '#0ea5e9',
  text,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const colors = useThemeColors();
  
  const content = (
    <>
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text style={{ color: colors.textSecondary, marginTop: 16, textAlign: 'center' }}>
          {text}
        </Text>
      )}
    </>
  );

  if (fullScreen) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgPrimary, alignItems: 'center', justifyContent: 'center' }}>
        {content}
      </View>
    );
  }

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      {content}
    </View>
  );
}