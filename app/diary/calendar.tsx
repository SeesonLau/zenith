// app/diary/calendar.tsx 
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDiaryEntries } from '@/src/database/hooks/useDatabase';
import { addMonths } from '@/src/utils/dateHelpers';
import Button from '@/src/components/common/Button';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CELL_SIZE = (SCREEN_WIDTH - 48 - 8) / 7; // (screen - padding - gaps) / 7 days

export default function DiaryCalendarScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date(2024, 11, 1)); // December 2024
  
  const entries = useDiaryEntries(selectedDate.getFullYear(), selectedDate.getMonth());

  const handlePreviousMonth = () => {
    setSelectedDate(addMonths(selectedDate, -1));
  };

  const handleNextMonth = () => {
    setSelectedDate(addMonths(selectedDate, 1));
  };

  // Get days in month
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create entry map by date
  const entryMap = new Map<string, number>();
  entries.forEach((entry) => {
    const dateKey = entry.entryDate.toDateString();
    entryMap.set(dateKey, (entryMap.get(dateKey) || 0) + 1);
  });

  const monthYear = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-primary">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          {/* Header */}
          <View className="flex-row items-center mb-6 mt-4">
            <Pressable onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={28} color="#64748b" />
            </Pressable>
            <Text className="text-2xl font-bold text-primary flex-1">Calendar</Text>
          </View>

          {/* Month Navigator */}
          <View className="flex-row items-center justify-between mb-6">
            <Pressable
              onPress={handlePreviousMonth}
              className="bg-surface-hover rounded-full w-10 h-10 items-center justify-center"
            >
              <Ionicons name="chevron-back" size={20} color="#38bdf8" />
            </Pressable>

            <Text className="text-primary text-xl font-bold">{monthYear}</Text>

            <Pressable
              onPress={handleNextMonth}
              className="bg-surface-hover rounded-full w-10 h-10 items-center justify-center"
            >
              <Ionicons name="chevron-forward" size={20} color="#38bdf8" />
            </Pressable>
          </View>

          {/* Calendar Grid */}
          <View className="card p-4 mb-4">
            <View className="flex-row flex-wrap">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <View 
                  key={`empty-${i}`} 
                  style={{ width: CELL_SIZE, height: CELL_SIZE, padding: 4 }}
                />
              ))}

              {/* Actual days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const date = new Date(year, month, day);
                const dateKey = date.toDateString();
                const entryCount = entryMap.get(dateKey) || 0;
                const isToday = dateKey === new Date().toDateString();

                return (
                  <Pressable
                    key={day}
                    onPress={() => {
                      if (entryCount > 0) {
                        console.log(`Selected date: ${dateKey}`);
                      }
                    }}
                    style={{ width: CELL_SIZE, height: CELL_SIZE, padding: 4 }}
                  >
                    <View
                      className={`
                        flex-1 items-center justify-center rounded-lg
                        ${isToday ? 'bg-sky-500' : entryCount > 0 ? 'bg-green-500/30 border border-green-500' : 'bg-surface'}
                      `}
                    >
                      <Text
                        className={`
                          font-bold text-sm
                          ${isToday ? 'text-white' : entryCount > 0 ? 'text-green-400' : 'text-secondary'}
                        `}
                      >
                        {day}
                      </Text>
                      {entryCount > 1 && (
                        <Text className="text-green-400 text-[10px] font-bold">
                          {entryCount}
                        </Text>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Legend - COMPACT */}
          <View className="flex-row items-center justify-around mb-6 px-4">
            <View className="flex-row items-center">
              <View className="bg-sky-500 w-5 h-5 rounded mr-2" />
              <Text className="text-secondary text-xs">Today</Text>
            </View>
            <View className="flex-row items-center">
              <View className="bg-green-500/30 border border-green-500 w-5 h-5 rounded mr-2" />
              <Text className="text-secondary text-xs">Has entries</Text>
            </View>
            <View className="flex-row items-center">
              <View className="bg-surface w-5 h-5 rounded mr-2" />
              <Text className="text-secondary text-xs">Empty</Text>
            </View>
          </View>

          {/* Stats - COMPACT */}
          <View className="card p-4 mb-6">
            <View className="flex-row justify-around">
              <View className="items-center">
                <Text className="text-primary text-2xl font-bold">{entries.length}</Text>
                <Text className="text-secondary text-xs mt-1">Entries</Text>
              </View>
              <View className="w-px bg-surface-border" />
              <View className="items-center">
                <Text className="text-primary text-2xl font-bold">{entryMap.size}</Text>
                <Text className="text-secondary text-xs mt-1">Active Days</Text>
              </View>
              <View className="w-px bg-surface-border" />
              <View className="items-center">
                <Text className="text-primary text-2xl font-bold">
                  {Math.floor((entryMap.size / daysInMonth) * 100)}%
                </Text>
                <Text className="text-secondary text-xs mt-1">Completion</Text>
              </View>
            </View>
          </View>

          {/* New Entry Button */}
          <Button
            onPress={() => router.push('/diary/new')}
            title="Write New Entry"
            icon="create"
            variant="primary"
            fullWidth
          />

          {/* Bottom Padding for FAB */}
          <View className="h-24" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}