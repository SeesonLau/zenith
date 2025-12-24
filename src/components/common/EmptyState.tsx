// ==========================================
// src/components/common/EmptyState.tsx
// ==========================================
import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  return (
    <View className="flex-1 items-center justify-center p-8">
      <View className="bg-slate-800 rounded-full w-20 h-20 items-center justify-center mb-4">
        <Ionicons name={icon as any} size={40} color="#64748b" />
      </View>
      <Text className="text-white text-xl font-semibold text-center mb-2">
        {title}
      </Text>
      {description && (
        <Text className="text-slate-400 text-sm text-center mb-6">
          {description}
        </Text>
      )}
      {action}
    </View>
  );
}