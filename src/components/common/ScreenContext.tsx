// src/components/common/ScreenContent.tsx (FIXED - No Syntax Errors)
import React from 'react';
import { View } from 'react-native';

interface ScreenContentProps {
  children: React.ReactNode;
  hasFAB?: boolean;
}

/**
 * Wrapper component for screen content that ensures:
 * 1. Proper spacing at the bottom to avoid FAB overlap
 * 2. Consistent padding across all screens
 * 3. Mobile-optimized layout
 */
export default function ScreenContent({ children, hasFAB = false }: ScreenContentProps) {
  return (
    <View className="p-6">
      {children}
      
      {hasFAB && <View className="h-32" />}
    </View>
  );
}