// app/diary/new.tsx (POLISHED & THEME-AWARE)
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
import { createDiaryEntry } from '@/src/database/actions/diaryActions';
import type { MoodType } from '@/src/types/database.types';
import type { ImageInfo } from '@/src/utils/imageHelpers';
import MoodPicker from '@/src/components/diary/MoodPicker';
import RichTextEditor from '@/src/components/diary/RichTextEditor';
import ImageGallery from '@/src/components/diary/ImageGallery';
import Button from '@/src/components/common/Button';

export default function NewDiaryEntryScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<MoodType | undefined>();
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('Empty Entry', 'Please write something before saving.');
      return;
    }

    setIsLoading(true);

    try {
      await createDiaryEntry(
        {
          title: title.trim() || undefined,
          content: content.trim(),
          mood,
        },
        images.length > 0 ? images : undefined
      );

      router.back();
    } catch (error) {
      console.error('Failed to create diary entry:', error);
      Alert.alert('Error', 'Failed to save entry');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddImage = (imageInfo: ImageInfo) => {
    setImages([...images, imageInfo]);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-primary"
    >
      <View className="flex-1">
        {/* Header */}
        <View className="p-6 pb-4 border-b border-surface-border bg-surface">
          <View className="flex-row items-center justify-between">
            <Pressable onPress={() => router.back()}>
              <Ionicons name="close" size={28} color="#64748b" />
            </Pressable>
            <Text className="text-xl font-bold text-primary">New Entry</Text>
            <View className="w-7" />
          </View>
        </View>

        <ScrollView className="flex-1">
          <View className="p-6">
            {/* Mood Picker */}
            <MoodPicker selected={mood} onSelect={setMood} />

            {/* Title */}
            <Text className="text-primary font-semibold mb-2">Title (Optional)</Text>
            <TextInput
              placeholder="Give your entry a title..."
              placeholderTextColor="#64748b"
              value={title}
              onChangeText={setTitle}
              className="input mb-4"
            />

            {/* Content */}
            <Text className="text-primary font-semibold mb-2">
              What's on your mind? ({wordCount} words)
            </Text>
            <RichTextEditor
              value={content}
              onChangeText={setContent}
              placeholder="Write your thoughts, feelings, or experiences..."
              autoFocus={true}
            />

            {/* Image Gallery */}
            <View className="mt-4">
              <ImageGallery
                images={images}
                onAddImage={handleAddImage}
                onRemoveImage={handleRemoveImage}
                editable
                maxImages={6}
                maxTotalSize={5 * 1024 * 1024}
              />
            </View>

            {/* Info Card */}
            <View className="gradient-blue border border-sky-600/50 rounded-lg p-3 mt-4 mb-6">
              <View className="flex-row items-center">
                <Ionicons name="cloud-upload-outline" size={16} color="#0ea5e9" />
                <Text className="text-sky-300 text-xs ml-2">
                  Images will be uploaded to cloud storage automatically
                </Text>
              </View>
            </View>

            {/* Save Button */}
            <Button
              onPress={handleSave}
              title="Save Entry"
              icon="checkmark"
              variant="primary"
              fullWidth
              loading={isLoading}
              disabled={!content.trim()}
            />
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}