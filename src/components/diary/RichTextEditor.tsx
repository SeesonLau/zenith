// src/components/diary/RichTextEditor.tsx
import React from 'react';
import { View, TextInput } from 'react-native';

interface RichTextEditorProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function RichTextEditor({
  value,
  onChangeText,
  placeholder = 'Write your thoughts...',
  autoFocus = false,
}: RichTextEditorProps) {
  return (
    <View className="flex-1">
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#64748b"
        multiline
        autoFocus={autoFocus}
        className="bg-slate-800 border border-slate-700 text-white p-4 rounded-xl flex-1 text-base"
        style={{ 
          textAlignVertical: 'top',
          minHeight: 200,
        }}
      />
    </View>
  );
}