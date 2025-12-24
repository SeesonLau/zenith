// ==========================================
// src/components/common/StatCard.tsx
// ==========================================
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
    neutral: 'text-slate-400',
  };

  return (
    <View className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-4">
      <View className="flex-row items-center mb-2">
        <View className={`${color} rounded-full w-8 h-8 items-center justify-center mr-2`}>
          <Ionicons name={icon} size={16} color="white" />
        </View>
        <Text className="text-slate-400 text-sm">{label}</Text>
      </View>
      <Text className="text-white text-2xl font-bold mb-1">{value}</Text>
      {change && (
        <Text className={`text-xs ${changeColors[changeType]}`}>{change}</Text>
      )}
    </View>
  );
}