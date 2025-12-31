// src/components/common/Card.tsx (THEME-AWARE)
import React, { ReactNode } from 'react';
import { View, Pressable } from 'react-native';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  className?: string;
  variant?: 'default' | 'elevated';
}

/**
 * Theme-aware card component
 * Uses CSS variables from global.css
 * Automatically adapts to Slate/White mode
 */
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