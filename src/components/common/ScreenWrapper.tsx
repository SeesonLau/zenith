// src/components/common/ScreenWrapper.tsx (NEW)
import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenWrapperProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wrapper component for all screens
 * Handles Android status bar and navigation bar safe areas
 */
export default function ScreenWrapper({ children, className = '' }: ScreenWrapperProps) {
  return (
    <SafeAreaView 
      edges={['top']} // Only apply top edge (status bar), bottom is handled by tab bar
      className={`flex-1 ${className}`}
    >
      {children}
    </SafeAreaView>
  );
}