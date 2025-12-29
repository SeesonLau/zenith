// src/components/common/LoadingSpinner.tsx
import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

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
  const content = (
    <>
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text className="text-slate-400 mt-4 text-center">{text}</Text>
      )}
    </>
  );

  if (fullScreen) {
    return (
      <View className="flex-1 bg-slate-900 items-center justify-center">
        {content}
      </View>
    );
  }

  return (
    <View className="items-center justify-center p-8">
      {content}
    </View>
  );
}