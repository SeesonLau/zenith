// src/components/common/DatePicker.tsx  themed
import React, { useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDate } from '@/src/utils/dateHelpers';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface DatePickerProps {
  label?: string;
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
  minimumDate?: Date;
  maximumDate?: Date;
}

export default function DatePicker({
  label,
  value,
  onChange,
  mode = 'date',
  minimumDate,
  maximumDate,
}: DatePickerProps) {
  const colors = useThemeColors();
  const [show, setShow] = useState(false);

  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const getDisplayText = () => {
    if (mode === 'time') {
      return value.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
    if (mode === 'datetime') {
      return `${formatDate(value, 'medium')} ${value.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })}`;
    }
    return formatDate(value, 'medium');
  };

  return (
    <View>
      {label && (
        <Text style={{ color: colors.textPrimary, fontWeight: '600', marginBottom: 8 }}>
          {label}
        </Text>
      )}
      <Pressable
        onPress={() => setShow(true)}
        style={{
          backgroundColor: colors.bgSurface,
          borderWidth: 1,
          borderColor: colors.borderSurface,
          borderRadius: 12,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Text style={{ color: colors.textPrimary }}>{getDisplayText()}</Text>
        <Ionicons name="calendar-outline" size={20} color={colors.textTertiary} />
      </Pressable>

      {show && (
        <DateTimePicker
          value={value}
          mode={mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          textColor={colors.textPrimary}
          themeVariant={colors.bgPrimary === '#0f172a' ? 'dark' : 'light'}
        />
      )}
    </View>
  );
}