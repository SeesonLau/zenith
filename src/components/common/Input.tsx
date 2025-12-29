// src/components/common/Input.tsx
import React from 'react';
import { View, TextInput, Text, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  containerClassName?: string;
}

export default function Input({
  label,
  error,
  icon,
  containerClassName = '',
  ...props
}: InputProps) {
  return (
    <View className={containerClassName}>
      {label && (
        <Text className="text-white font-semibold mb-2">{label}</Text>
      )}
      <View className="relative">
        {icon && (
          <View className="absolute left-4 top-4 z-10">
            <Ionicons name={icon} size={20} color="#64748b" />
          </View>
        )}
        <TextInput
          className={`
            input
            ${icon ? 'pl-12' : ''}
            ${error ? 'border-red-500' : ''}
          `}
          placeholderTextColor="#64748b"
          {...props}
        />
      </View>
      {error && (
        <Text className="text-red-400 text-sm mt-1">{error}</Text>
      )}
    </View>
  );
}