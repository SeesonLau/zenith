// src/components/common/Button.tsx
import React from 'react';
import { Pressable, Text, ActivityIndicator, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/hooks/useThemeColors';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

type VariantStyle = {
  bg: string;
  text: string;
  border?: string;
};

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
  style,
}: ButtonProps) {
  const colors = useThemeColors();

  const variantStyles: Record<ButtonVariant, VariantStyle> = {
    primary: { bg: '#0ea5e9', text: 'white' },
    secondary: { bg: colors.bgSurface, text: colors.textPrimary, border: colors.borderSurface },
    success: { bg: '#22c55e', text: 'white' },
    danger: { bg: '#ef4444', text: 'white' },
    ghost: { bg: 'transparent', text: colors.textPrimary },
  };

  const sizeStyles = {
    sm: { px: 16, py: 8, text: 14, icon: 16 },
    md: { px: 24, py: 12, text: 16, icon: 20 },
    lg: { px: 32, py: 16, text: 18, icon: 24 },
  };

  const isDisabled = disabled || loading;
  const variantStyle = variantStyles[variant];
  const sizing = sizeStyles[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[
        {
          backgroundColor: variantStyle.bg,
          paddingHorizontal: sizing.px,
          paddingVertical: sizing.py,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isDisabled ? 0.5 : 1,
          width: fullWidth ? '100%' : undefined,
          ...(variant === 'secondary' && {
            borderWidth: 1,
            borderColor: variantStyle.border 
          })
        },
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'secondary' || variant === 'ghost' ? '#0ea5e9' : 'white'} 
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={sizing.icon} 
              color={variantStyle.text}
              style={{ marginRight: 8 }} 
            />
          )}
          <Text style={{
            color: variantStyle.text,
            fontSize: sizing.text,
            fontWeight: '600'
          }}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={sizing.icon} 
              color={variantStyle.text}
              style={{ marginLeft: 8 }} 
            />
          )}
        </>
      )}
    </Pressable>
  );
}