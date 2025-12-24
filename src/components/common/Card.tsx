// ==========================================
// src/components/common/Card.tsx
// ==========================================
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
  const variantStyles = {
    default: 'bg-slate-800 border border-slate-700',
    elevated: 'bg-slate-800 shadow-lg',
  };

  const Component = onPress ? Pressable : View;

  return (
    <Component
      onPress={onPress}
      className={`
        ${variantStyles[variant]}
        rounded-xl p-4
        ${onPress ? 'active:bg-slate-700' : ''}
        ${className}
      `}
    >
      {children}
    </Component>
  );
}