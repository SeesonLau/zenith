// src/components/finance/StatCard.tsx (FIXED - Theme-Aware)
import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

export default function StatCard({
  icon,
  label,
  value,
  color,
  change,
  changeType = 'neutral',
}: StatCardProps) {
  const changeColors = {
    positive: 'text-green-400',
    negative: 'text-red-400',
    neutral: 'text-secondary',
  };

  return (
    <View className="flex-1 bg-surface border border-surface-border rounded-xl p-4">
      <View className="flex-row items-center mb-2">
        <View className={`${color} rounded-full w-8 h-8 items-center justify-center mr-2`}>
          <Ionicons name={icon} size={16} color="white" />
        </View>
        <Text className="text-secondary text-sm">{label}</Text>
      </View>
      <Text className="text-primary text-2xl font-bold mb-1">{value}</Text>
      {change && (
        <Text className={`text-xs ${changeColors[changeType]}`}>{change}</Text>
      )}
    </View>
  );
}