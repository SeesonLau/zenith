// app/(tabs)/habits.tsx
// Example implementation showing the layered time system in action

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useRunningHabitTimers } from '@/src/database/hooks/useDatabase';
import { startHabitTimer, stopHabitTimer } from '@/src/database/actions/habitActions';
import type { HabitCategory } from '@/src/types/database.types';
import { HABIT_CATEGORIES, HABIT_ACTIVITIES } from '@/src/types/database.types';

export default function HabitsScreen() {
  const runningTimers = useRunningHabitTimers();
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  // Calculate elapsed time for each running timer
  const [elapsedTimes, setElapsedTimes] = useState<Record<string, number>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      const newElapsedTimes: Record<string, number> = {};
      runningTimers.forEach((timer) => {
        const elapsed = Math.floor((Date.now() - timer.startedAt.getTime()) / 1000);
        newElapsedTimes[timer.id] = elapsed;
      });
      setElapsedTimes(newElapsedTimes);
    }, 1000);

    return () => clearInterval(interval);
  }, [runningTimers]);

  const handleStartTimer = async () => {
    if (!selectedCategory || !selectedActivity) {
      Alert.alert('Error', 'Please select both category and activity');
      return;
    }

    try {
      await startHabitTimer(selectedCategory, selectedActivity);
      Alert.alert('Success', `Started ${selectedActivity} timer`);
      setSelectedCategory(null);
      setSelectedActivity(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to start timer');
      console.error(error);
    }
  };

  const handleStopTimer = async (timerId: string, activity: string) => {
    try {
      await stopHabitTimer(timerId);
      Alert.alert('Success', `Stopped ${activity} timer`);
    } catch (error) {
      Alert.alert('Error', 'Failed to stop timer');
      console.error(error);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="p-4">
        {/* Header */}
        <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Habit Tracker
        </Text>
        <Text className="text-gray-600 dark:text-gray-400 mb-6">
          Layered Time System - Multiple timers can run simultaneously
        </Text>

        {/* Active Timers Section */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            Active Timers ({runningTimers.length})
          </Text>
          
          {runningTimers.length === 0 ? (
            <View className="bg-white dark:bg-gray-800 rounded-lg p-6 items-center">
              <Text className="text-gray-500 dark:text-gray-400 text-center">
                No active timers. Start one below!
              </Text>
            </View>
          ) : (
            <View className="space-y-3">
              {runningTimers.map((timer) => (
                <View
                  key={timer.id}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                      <Text className="text-sm text-gray-500 dark:text-gray-400">
                        {timer.category}
                      </Text>
                      <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                        {timer.activity}
                      </Text>
                    </View>
                    <View className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
                      <Text className="text-blue-700 dark:text-blue-300 font-mono font-semibold">
                        {formatTime(elapsedTimes[timer.id] || 0)}
                      </Text>
                    </View>
                  </View>
                  
                  <Text className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                    Started: {timer.startedAt.toLocaleTimeString()}
                  </Text>

                  <Pressable
                    onPress={() => handleStopTimer(timer.id, timer.activity)}
                    className="bg-red-500 py-3 rounded-lg active:bg-red-600"
                  >
                    <Text className="text-white text-center font-semibold">
                      Stop Timer
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Start New Timer Section */}
        <View className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Start New Timer
          </Text>

          {/* Category Selection */}
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Category
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {HABIT_CATEGORIES.map((category) => (
              <Pressable
                key={category}
                onPress={() => {
                  setSelectedCategory(category);
                  setSelectedActivity(null);
                }}
                className={`px-4 py-2 rounded-full ${
                  selectedCategory === category
                    ? 'bg-blue-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <Text
                  className={`font-medium ${
                    selectedCategory === category
                      ? 'text-white'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {category}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Activity Selection */}
          {selectedCategory && (
            <>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Activity
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {HABIT_ACTIVITIES[selectedCategory].map((activity) => (
                  <Pressable
                    key={activity}
                    onPress={() => setSelectedActivity(activity)}
                    className={`px-4 py-2 rounded-full ${
                      selectedActivity === activity
                        ? 'bg-green-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        selectedActivity === activity
                          ? 'text-white'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {activity}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {/* Start Button */}
          <Pressable
            onPress={handleStartTimer}
            disabled={!selectedCategory || !selectedActivity}
            className={`py-4 rounded-lg ${
              selectedCategory && selectedActivity
                ? 'bg-blue-500 active:bg-blue-600'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <Text className="text-white text-center font-bold text-lg">
              Start Timer
            </Text>
          </Pressable>
        </View>

        {/* Example: Overlapping Timers Explanation */}
        <View className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <Text className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
            💡 Layered Time System
          </Text>
          <Text className="text-xs text-blue-800 dark:text-blue-200">
            Unlike traditional trackers, you can run multiple timers at once! 
            Example: Start "Travel" at 8:00 AM, then start "Reading" at 8:10 AM. 
            Both timers run independently until you stop them.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}