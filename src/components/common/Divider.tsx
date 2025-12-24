// ==========================================
// src/components/common/Divider.tsx
// ==========================================
import React from 'react';
import { View } from 'react-native';

interface DividerProps {
  className?: string;
}

export default function Divider({ className = '' }: DividerProps) {
  return <View className={`h-px bg-slate-700 ${className}`} />;
}