// src/components/common/ScreenContent.tsx themed
import React from 'react';
import { View } from 'react-native';

interface ScreenContentProps {
  children: React.ReactNode;
  hasFAB?: boolean;
}

export default function ScreenContent({ children, hasFAB = false }: ScreenContentProps) {
  return (
    <View style={{ padding: 24 }}>
      {children}
      {hasFAB && <View style={{ height: 128 }} />}
    </View>
  );
}