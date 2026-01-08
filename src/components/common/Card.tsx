// src/components/common/Card.tsx - THEMED
// This already uses CSS variables from global.css which work correctly
import React, { ReactNode } from 'react';
import { View, Pressable } from 'react-native';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  className?: string;
  variant?: 'default' | 'elevated';
}

export default function Card({
  children,
  onPress,
  className = '',
  variant = 'default',
}: CardProps) {
  const Component = onPress ? Pressable : View;

  return (
    <Component
      onPress={onPress}
      className={`
        ${variant === 'elevated' ? 'card-elevated' : 'card'}
        p-4
        ${onPress ? 'active:opacity-90' : ''}
        ${className}
      `}
    >
      {children}
    </Component>
  );
}