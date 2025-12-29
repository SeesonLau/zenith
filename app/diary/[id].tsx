// app/diary/[id].tsx (FIXED - Just update the import line)
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { database } from '@/src/database';
import type DiaryEntry from '@/src/database/models/DiaryEntry';
import { updateDiaryEntry, deleteDiaryEntry } from '@/src/database/actions/diaryActions';
import { getMoodConfig } from '@/src/lib/constants';
import { formatTime } from '@/src/utils/formatters';        // FIXED: Only formatTime from formatters
import { formatDate } from '@/src/utils/dateHelpers';       // FIXED: formatDate from dateHelpers
import type { MoodType } from '@/src/types/database.types';
import MoodPicker from '@/src/components/diary/MoodPicker';
import Button from '@/src/components/common/Button';

// ... rest of the code stays the same
export default function DiaryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editMood, setEditMood] = useState<MoodType | undefined>();

  useEffect(() => {
    loadEntry();
  }, [id]);

  const loadEntry = async () => {
    try {
      const diaryEntry = await database.get<DiaryEntry>('diary_entries').find(id);
      setEntry(diaryEntry);
      setEditTitle(diaryEntry.title || '');
      setEditContent(diaryEntry.content);
      setEditMood(diaryEntry.mood as MoodType | undefined);
    } catch (error) {
      console.error('Failed to load diary entry:', error);
      Alert.alert('Error', 'Entry not found');
      router.back();
    }
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      Alert.alert('Empty Entry', 'Content cannot be empty');
      return;
    }

    try {
      await updateDiaryEntry(id, {
        title: editTitle.trim() || undefined,
        content: editContent.trim(),
        mood: editMood,
      });
      setIsEditing(false);
      loadEntry();
    } catch (error) {
      Alert.alert('Error', 'Failed to update entry');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this diary entry? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDiaryEntry(id);
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete entry');
            }
          },
        },
      ]
    );
  };

  if (!entry) {
    return (
      <View className="flex-1 bg-slate-900 items-center justify-center">
        <Ionicons name="book-outline" size={40} color="#64748b" />
        <Text className="text-white mt-4">Loading entry...</Text>
      </View>
    );
  }

  const moodConfig = entry.mood ? getMoodConfig(entry.mood as MoodType) : null;

  return (
    <View className="flex-1 bg-slate-900">
      {/* Header */}
      <View className="p-6 pb-4 border-b border-slate-700">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </Pressable>
          {!isEditing && (
            <Pressable onPress={() => setIsEditing(true)}>
              <Ionicons name="create-outline" size={24} color="#0ea5e9" />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView className="flex-1">
        <View className="p-6">
          {isEditing ? (
            // Edit Mode
            <>
              <MoodPicker selected={editMood} onSelect={setEditMood} />

              <Text className="text-white font-semibold mb-2">Title</Text>
              <TextInput
                placeholder="Entry title..."
                placeholderTextColor="#64748b"
                value={editTitle}
                onChangeText={setEditTitle}
                className="input mb-4"
              />

              <Text className="text-white font-semibold mb-2">Content</Text>
              <TextInput
                value={editContent}
                onChangeText={setEditContent}
                multiline
                className="input mb-6"
                style={{ minHeight: 200, textAlignVertical: 'top' }}
              />

              <View className="flex-row gap-3">
                <Button
                  onPress={() => {
                    setIsEditing(false);
                    setEditTitle(entry.title || '');
                    setEditContent(entry.content);
                    setEditMood(entry.mood as MoodType | undefined);
                  }}
                  title="Cancel"
                  variant="secondary"
                  fullWidth
                />
                <Button
                  onPress={handleSaveEdit}
                  title="Save"
                  icon="checkmark"
                  variant="primary"
                  fullWidth
                />
              </View>
            </>
          ) : (
            // View Mode
            <>
              {/* Mood Badge */}
              {moodConfig && (
                <View className="flex-row items-center mb-4">
                  <View className={`${moodConfig.color} rounded-full w-12 h-12 items-center justify-center mr-3`}>
                    <Ionicons name={moodConfig.icon as any} size={24} color="white" />
                  </View>
                  <View>
                    <Text className="text-slate-400 text-xs uppercase">Mood</Text>
                    <Text className={`${moodConfig.textColor} font-semibold`}>
                      {entry.mood}
                    </Text>
                  </View>
                </View>
              )}

              {/* Title */}
              {entry.title && (
                <Text className="text-white text-3xl font-bold mb-4">
                  {entry.title}
                </Text>
              )}

              {/* Metadata */}
              <View className="flex-row items-center mb-6">
                <Ionicons name="calendar-outline" size={16} color="#64748b" />
                <Text className="text-slate-400 text-sm ml-2">
                  {formatDate(entry.entryDate, 'full')} at {formatTime(entry.entryDate)}
                </Text>
              </View>

              {/* Content */}
              <View className="card p-5 mb-6">
                <Text className="text-white text-base leading-7">
                  {entry.content}
                </Text>
              </View>

              {/* Stats */}
              <View className="card p-4 mb-6">
                <View className="flex-row justify-around">
                  <View className="items-center">
                    <Text className="text-slate-400 text-xs mb-1">Words</Text>
                    <Text className="text-white text-xl font-bold">{entry.wordCount}</Text>
                  </View>
                  <View className="w-px bg-slate-700" />
                  <View className="items-center">
                    <Text className="text-slate-400 text-xs mb-1">Characters</Text>
                    <Text className="text-white text-xl font-bold">{entry.content.length}</Text>
                  </View>
                  <View className="w-px bg-slate-700" />
                  <View className="items-center">
                    <Text className="text-slate-400 text-xs mb-1">Reading Time</Text>
                    <Text className="text-white text-xl font-bold">
                      {Math.ceil(entry.wordCount / 200)}m
                    </Text>
                  </View>
                </View>
              </View>

              {/* Insight */}
              <View className="bg-sky-900/20 border border-sky-700 rounded-xl p-4 mb-6">
                <View className="flex-row items-start">
                  <Ionicons
                    name="bulb"
                    size={20}
                    color="#0ea5e9"
                    style={{ marginRight: 8, marginTop: 2 }}
                  />
                  <View className="flex-1">
                    <Text className="text-sky-300 text-sm font-semibold mb-1">
                      Entry Insight
                    </Text>
                    <Text className="text-sky-200 text-xs">
                      {entry.wordCount < 50
                        ? 'A brief reflection. Every word counts in capturing your moment.'
                        : entry.wordCount < 200
                        ? 'A thoughtful entry. You\'ve captured the essence of your day.'
                        : entry.wordCount < 500
                        ? 'A detailed reflection. You\'ve given good depth to your thoughts.'
                        : 'An extensive journal entry! You\'ve really explored your experiences.'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Delete Button */}
              <Button
                onPress={handleDelete}
                title="Delete Entry"
                icon="trash"
                variant="danger"
                fullWidth
              />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}