// src/components/common/Button.tsx (THEME-AWARE)
import React from 'react';
import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { IconProps } from '@expo/vector-icons/build/createIconSet';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconProps<any>['name'];
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

/**
 * Theme-aware button component
 * Uses semantic colors that adapt to Slate/White mode
 */
export default function Button({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
}: ButtonProps) {
  const variantStyles = {
    primary: 'bg-sky-500 active:bg-sky-600',
    secondary: 'bg-surface active:bg-surface-hover border border-surface-border',
    success: 'bg-green-500 active:bg-green-600',
    danger: 'bg-red-500 active:bg-red-600',
    ghost: 'bg-transparent active:bg-surface-hover',
  };

  const textVariantStyles = {
    primary: 'text-white',
    secondary: 'text-primary',
    success: 'text-white',
    danger: 'text-white',
    ghost: 'text-primary',
  };

  const sizeStyles = {
    sm: 'px-4 py-2',
    md: 'px-6 py-3',
    lg: 'px-8 py-4',
  };

  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50' : ''}
        rounded-xl flex-row items-center justify-center
        ${className}
      `}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'secondary' || variant === 'ghost' ? '#38bdf8' : 'white'} 
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons 
              name={icon as any} 
              size={iconSizes[size]} 
              color={variant === 'secondary' || variant === 'ghost' ? '#38bdf8' : 'white'} 
              style={{ marginRight: 8 }} 
            />
          )}
          <Text className={`${textVariantStyles[variant]} font-semibold ${textSizeStyles[size]}`}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons 
              name={icon as any} 
              size={iconSizes[size]} 
              color={variant === 'secondary' || variant === 'ghost' ? '#38bdf8' : 'white'} 
              style={{ marginLeft: 8 }} 
            />
          )}
        </>
      )}
    </Pressable>
  );
}