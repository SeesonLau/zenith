// ==========================================
// src/components/common/FloatingActionButton.tsx
// ==========================================
import React from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  return (
    <Pressable
      onPress={onPress}
      className={`
        ${color} active:opacity-80
        absolute bottom-6 right-6
        w-16 h-16 rounded-full
        items-center justify-center
        shadow-lg
      `}
      style={{
        elevation: 5,
      }}
    >
      <Ionicons name={icon as any} size={28} color="white" />
    </Pressable>
  );
}
