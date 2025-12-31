// src/components/common/FloatingActionButton.tsx (FIXED - Lower Position, No Overlap)
import React from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { IconProps } from '@expo/vector-icons/build/createIconSet';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon: IconProps<any>['name'];
  color?: string;
}

export default function FloatingActionButton({
  onPress,
  icon,
  color = 'bg-sky-500',
}: FloatingActionButtonProps) {
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      onPress={onPress}
      className={`
        ${color} active:opacity-80
        absolute left-6
        w-16 h-16 rounded-full
        items-center justify-center
        shadow-lg
      `}
      style={{
        bottom: 20,
        elevation: 5,
        zIndex: 50,
      }}
    >
      <Ionicons name={icon as any} size={28} color="white" />
    </Pressable>
  );
}