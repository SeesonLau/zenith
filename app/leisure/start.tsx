//app/leisure/start.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { startLeisureTimer } from '@/src/database/actions/leisureActions';
import type { LeisureType } from '@/src/types/database.types';
import LeisureTypePicker from '@/src/components/leisure/LeisureTypePicker';
import Button from '@/src/components/common/Button';

export default function StartLeisureScreen() {
  const router = useRouter();
  const [type, setType] = useState<LeisureType>('Manga');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    setIsLoading(true);

    try {
      await startLeisureTimer(type, title.trim() || undefined, notes.trim() || undefined);
      router.back();
    } catch (error) {
      console.error('Failed to start leisure timer:', error);
      Alert.alert('Error', 'Failed to start session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-900"
    >
      <ScrollView className="flex-1">
        <View className="p-6">
          {/* Header */}
          <View className="flex-row items-center mb-6 mt-4">
            <Pressable onPress={() => router.back()} className="mr-4">
              <Ionicons name="close" size={28} color="white" />
            </Pressable>
            <Text className="text-2xl font-bold text-white flex-1">Start Leisure Session</Text>
          </View>

          {/* Type Picker */}
          <LeisureTypePicker selected={type} onSelect={setType} />

          {/* Title */}
          <Text className="text-white font-semibold mb-2">Title (Optional)</Text>
          <TextInput
            placeholder="e.g., One Piece Chapter 1000"
            placeholderTextColor="#64748b"
            value={title}
            onChangeText={setTitle}
            className="input mb-4"
          />

          {/* Notes */}
          <Text className="text-white font-semibold mb-2">Notes (Optional)</Text>
          <TextInput
            placeholder="Add any notes about this session..."
            placeholderTextColor="#64748b"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            className="input mb-6"
            style={{ textAlignVertical: 'top' }}
          />

          {/* Info */}
          <View className="bg-sky-900/20 border border-sky-700 rounded-xl p-4 mb-6">
            <View className="flex-row items-start">
              <Ionicons
                name="time"
                size={20}
                color="#0ea5e9"
                style={{ marginRight: 8, marginTop: 2 }}
              />
              <View className="flex-1">
                <Text className="text-sky-300 text-sm font-semibold mb-1">Timer Will Start</Text>
                <Text className="text-sky-200 text-xs">
                  The timer will begin immediately. Remember to stop it when you're done!
                </Text>
              </View>
            </View>
          </View>

          {/* Start Button */}
          <Button
            onPress={handleStart}
            title="Start Session"
            icon="play"
            variant="primary"
            fullWidth
            loading={isLoading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}