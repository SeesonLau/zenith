// src/components/common/Input.tsx  themed
import React from 'react';
import { View, TextInput, Text, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export default function Input({
  label,
  error,
  icon,
  ...props
}: InputProps) {
  const colors = useThemeColors();

  return (
    <View>
      {label && (
        <Text style={{ color: colors.textPrimary, fontWeight: '600', marginBottom: 8 }}>
          {label}
        </Text>
      )}
      <View style={{ position: 'relative' }}>
        {icon && (
          <View style={{ position: 'absolute', left: 16, top: 16, zIndex: 10 }}>
            <Ionicons name={icon} size={20} color={colors.textTertiary} />
          </View>
        )}
        <TextInput
          style={{
            backgroundColor: colors.bgSurface,
            borderWidth: 1,
            borderColor: error ? '#ef4444' : colors.borderSurface,
            borderRadius: 12,
            padding: 16,
            paddingLeft: icon ? 48 : 16,
            fontSize: 16,
            color: colors.textPrimary
          }}
          placeholderTextColor={colors.textTertiary}
          {...props}
        />
      </View>
      {error && (
        <Text style={{ color: '#ef4444', fontSize: 13, marginTop: 4 }}>
          {error}
        </Text>
      )}
    </View>
  );
}