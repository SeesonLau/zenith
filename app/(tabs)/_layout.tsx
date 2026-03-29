// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/contexts/ThemeContext';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { isLight } = useTheme();

  return (
    <Tabs
      screenOptions={{
        lazy: false,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isLight ? '#ffffff' : '#0f172a',
          borderTopColor: isLight ? '#e2e8f0' : '#1e293b',
          paddingBottom: insets.bottom,
          height: 56 + insets.bottom,
        },
        tabBarActiveTintColor: isLight ? '#0284c7' : '#38bdf8',
        tabBarInactiveTintColor: isLight ? '#94a3b8' : '#64748b',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: 'Habits',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="hourglass-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          title: 'Finance',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{
          title: 'Diary',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="leisure"
        options={{
          title: 'Leisure',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="film-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
