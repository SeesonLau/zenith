// app/diary/calendar.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDiaryEntries } from '@/src/database/hooks/useDatabase';
import { formatDate, addMonths } from '@/src/utils/dateHelpers';
import Button from '@/src/components/common/Button';

export default function DiaryCalendarScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  
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

  return (
    <ScrollView className="flex-1 bg-slate-900">
      <View className="p-6">
        {/* Header */}
        <View className="flex-row items-center mb-6 mt-4">
          <Pressable onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={28} color="white" />
          </Pressable>
          <Text className="text-2xl font-bold text-white flex-1">Calendar View</Text>
        </View>

        {/* Month Navigator */}
        <View className="card p-4 mb-6">
          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={handlePreviousMonth}
              className="bg-slate-700 rounded-lg p-3"
            >
              <Ionicons name="chevron-back" size={20} color="white" />
            </Pressable>

            <Text className="text-white text-xl font-bold">
              {formatDate(selectedDate, 'long').split(',')[0]}
            </Text>

            <Pressable
              onPress={handleNextMonth}
              className="bg-slate-700 rounded-lg p-3"
            >
              <Ionicons name="chevron-forward" size={20} color="white" />
            </Pressable>
          </View>
        </View>

        {/* Calendar Grid */}
        <View className="card p-4 mb-6">
          {/* Day Headers */}
          <View className="flex-row mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <View key={day} className="flex-1 items-center">
                <Text className="text-slate-500 text-xs font-semibold">{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Days */}
          <View className="flex-row flex-wrap">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <View key={`empty-${i}`} className="w-[14.28%] aspect-square p-1" />
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
                    // Navigate to entries for this day if any exist
                    if (entryCount > 0) {
                      // Could implement day-specific view
                      console.log(`Selected date: ${dateKey}`);
                    }
                  }}
                  className="w-[14.28%] aspect-square p-1"
                >
                  <View
                    className={`
                      flex-1 items-center justify-center rounded-lg
                      ${isToday ? 'bg-sky-500' : entryCount > 0 ? 'bg-green-500/30' : 'bg-slate-800'}
                    `}
                  >
                    <Text
                      className={`
                        font-semibold
                        ${isToday ? 'text-white' : entryCount > 0 ? 'text-green-400' : 'text-slate-400'}
                      `}
                    >
                      {day}
                    </Text>
                    {entryCount > 0 && (
                      <View className="absolute bottom-1">
                        <View className="bg-green-400 rounded-full w-1 h-1" />
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Legend */}
        <View className="card p-4 mb-6">
          <Text className="text-white font-semibold mb-3">Legend</Text>
          <View className="space-y-2">
            <View className="flex-row items-center">
              <View className="bg-sky-500 w-6 h-6 rounded mr-3" />
              <Text className="text-slate-300 text-sm">Today</Text>
            </View>
            <View className="flex-row items-center">
              <View className="bg-green-500/30 w-6 h-6 rounded mr-3" />
              <Text className="text-slate-300 text-sm">Has entries</Text>
            </View>
            <View className="flex-row items-center">
              <View className="bg-slate-800 w-6 h-6 rounded mr-3" />
              <Text className="text-slate-300 text-sm">No entries</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View className="card p-4 mb-6">
          <Text className="text-white font-semibold mb-3">This Month</Text>
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-slate-400 text-xs mb-1">Entries</Text>
              <Text className="text-white text-2xl font-bold">{entries.length}</Text>
            </View>
            <View className="w-px bg-slate-700" />
            <View className="items-center">
              <Text className="text-slate-400 text-xs mb-1">Days Active</Text>
              <Text className="text-white text-2xl font-bold">{entryMap.size}</Text>
            </View>
            <View className="w-px bg-slate-700" />
            <View className="items-center">
              <Text className="text-slate-400 text-xs mb-1">Streak</Text>
              <Text className="text-white text-2xl font-bold">
                {Math.floor((entryMap.size / daysInMonth) * 100)}%
              </Text>
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
      </View>
    </ScrollView>
  );
}