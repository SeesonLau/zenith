// src/components/common/ScreenWrapper.tsx themed
import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface ScreenWrapperProps {
  children: ReactNode;
}

export default function ScreenWrapper({ children }: ScreenWrapperProps) {
  const colors = useThemeColors();
  
  return (
    <SafeAreaView 
      edges={['top']}
      style={{ flex: 1, backgroundColor: colors.bgPrimary }}
    >
      {children}
    </SafeAreaView>
  );
}