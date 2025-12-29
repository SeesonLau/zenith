// app/(tabs)/diary.tsx (FIXED - Add type casting for mood)
import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDiaryEntries } from '@/src/database/hooks/useDatabase';
import FloatingActionButton from '@/src/components/common/FloatingActionButton';
import EmptyState from '@/src/components/common/EmptyState';
import Button from '@/src/components/common/Button';
import DiaryCard from '@/src/components/diary/DiaryCard';
import type { MoodType } from '@/src/types/database.types'; // ADDED: Import MoodType

export default function DiaryScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate] = useState(new Date());

  const entries = useDiaryEntries(selectedDate.getFullYear(), selectedDate.getMonth());

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  // Calculate stats
  const totalWords = entries.reduce((sum, entry) => sum + entry.wordCount, 0);
  const thisWeekEntries = entries.filter((entry) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return entry.entryDate >= weekAgo;
  });

  return (
    <View className="flex-1 bg-slate-900">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0ea5e9" />
        }
      >
        <View className="p-6">
          {/* Header */}
          <View className="mb-6 mt-4">
            <Text className="text-3xl font-bold text-white mb-2">My Diary</Text>
            <Text className="text-slate-400 text-base">
              Document your thoughts and memories
            </Text>
          </View>

          {/* Quick Stats */}
          <View className="card p-5 mb-6">
            <Text className="text-white font-semibold text-lg mb-3">This Month</Text>
            <View className="flex-row justify-around">
              <View className="items-center">
                <Text className="text-slate-400 text-xs mb-1">Entries</Text>
                <Text className="text-white text-2xl font-bold">{entries.length}</Text>
              </View>
              <View className="w-px bg-slate-700" />
              <View className="items-center">
                <Text className="text-slate-400 text-xs mb-1">This Week</Text>
                <Text className="text-white text-2xl font-bold">{thisWeekEntries.length}</Text>
              </View>
              <View className="w-px bg-slate-700" />
              <View className="items-center">
                <Text className="text-slate-400 text-xs mb-1">Total Words</Text>
                <Text className="text-white text-2xl font-bold">
                  {(totalWords / 1000).toFixed(1)}k
                </Text>
              </View>
            </View>
          </View>

          {/* Entries List */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-semibold text-white">Recent Entries</Text>
              <View className="bg-slate-800 px-3 py-1 rounded-full">
                <Text className="text-slate-300 font-semibold">{entries.length}</Text>
              </View>
            </View>

            {entries.length === 0 ? (
              <EmptyState
                icon="book-outline"
                title="No Entries Yet"
                description="Start journaling your thoughts and experiences"
                action={
                  <Button
                    onPress={() => router.push('/diary/new')}
                    title="Write Entry"
                    icon="create"
                    variant="primary"
                  />
                }
              />
            ) : (
              <View>
                {entries.map((entry) => (
                  <DiaryCard
                    key={entry.id}
                    id={entry.id}
                    title={entry.title}
                    content={entry.content}
                    entryDate={entry.entryDate}
                    mood={entry.mood as MoodType | undefined}  
                    wordCount={entry.wordCount}
                    imageCount={0} // Will implement image count later
                    onPress={() => router.push(`/diary/${entry.id}`)}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Calendar View Button */}
          {entries.length > 0 && (
            <Button
              onPress={() => router.push('/diary/calendar')}
              title="Calendar View"
              icon="calendar"
              variant="secondary"
              fullWidth
            />
          )}

          {/* Info Card */}
          <View className="bg-sky-900/20 border border-sky-700 rounded-xl p-4 mt-6">
            <View className="flex-row items-start">
              <Ionicons
                name="information-circle"
                size={20}
                color="#0ea5e9"
                style={{ marginRight: 8, marginTop: 2 }}
              />
              <View className="flex-1">
                <Text className="text-sky-300 text-sm font-semibold mb-1">
                  Daily Journaling
                </Text>
                <Text className="text-sky-200 text-xs">
                  Regular journaling can improve mental clarity, reduce stress, and help you track
                  personal growth over time.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton
        onPress={() => router.push('/diary/new')}
        icon="create"
        color="bg-sky-500"
      />
    </View>
  );
}