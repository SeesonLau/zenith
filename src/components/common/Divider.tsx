// src/components/common/Divider.tsx
import React from 'react';
import { View, Text } from 'react-native';

interface DividerProps {
  label?: string;
  className?: string;
}

export default function Divider({ label, className = '' }: DividerProps) {
  if (label) {
    return (
      <View className={`flex-row items-center my-6 ${className}`}>
        <View className="flex-1 h-px bg-slate-700" />
        <Text className="text-slate-500 text-sm mx-4 uppercase tracking-wider">
          {label}
        </Text>
        <View className="flex-1 h-px bg-slate-700" />
      </View>
    );
  }

  return <View className={`divider ${className}`} />;
}