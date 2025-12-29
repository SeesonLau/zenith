// src/components/common/DatePicker.tsx
import React, { useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDate } from '@/src/utils/dateHelpers';

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
        <Text className="text-white font-semibold mb-2">{label}</Text>
      )}
      <Pressable
        onPress={() => setShow(true)}
        className="input flex-row items-center justify-between"
      >
        <Text className="text-white">{getDisplayText()}</Text>
        <Ionicons name="calendar-outline" size={20} color="#64748b" />
      </Pressable>

      {show && (
        <DateTimePicker
          value={value}
          mode={mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          textColor="#ffffff"
          themeVariant="dark"
        />
      )}
    </View>
  );
}