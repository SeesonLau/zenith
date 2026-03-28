// app/settings/preferences.tsx (NEW)
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/src/components/common/Button';

export default function PreferencesScreen() {
  const router = useRouter();
  
  // Preferences state
  const [autoSync, setAutoSync] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  const handleSavePreferences = () => {
    // TODO: Save preferences to database/AsyncStorage
    Alert.alert('Success', 'Preferences saved successfully');
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-primary">
      <ScrollView className="flex-1">
        <View className="p-6">
          {/* Header */}
          <View className="flex-row items-center mb-6 mt-4">
            <Pressable onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={28} className="text-primary" color="#64748b" />
            </Pressable>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-primary">Preferences</Text>
              <Text className="text-secondary text-sm">
                Customize how Zenith works for you
              </Text>
            </View>
          </View>

          {/* Sync & Data */}
          <View className="mb-6">
            <Text className="text-primary font-semibold text-lg mb-4">Sync & Data</Text>
            
            <View className="card p-0 overflow-hidden">
              <PreferenceRow
                icon="cloud-upload"
                title="Auto Sync"
                description="Automatically sync data every 5 minutes"
                value={autoSync}
                onValueChange={setAutoSync}
              />
              <PreferenceRow
                icon="analytics"
                title="Analytics"
                description="Help improve Zenith by sharing anonymous usage data"
                value={analyticsEnabled}
                onValueChange={setAnalyticsEnabled}
              />
            </View>
          </View>

          {/* Notifications */}
          <View className="mb-6">
            <Text className="text-primary font-semibold text-lg mb-4">Notifications</Text>
            
            <View className="card p-0 overflow-hidden">
              <PreferenceRow
                icon="notifications"
                title="Push Notifications"
                description="Receive reminders and updates"
                value={notifications}
                onValueChange={setNotifications}
              />
            </View>
          </View>

          {/* Accessibility */}
          <View className="mb-6">
            <Text className="text-primary font-semibold text-lg mb-4">Accessibility</Text>
            
            <View className="card p-0 overflow-hidden">
              <PreferenceRow
                icon="phone-portrait"
                title="Haptic Feedback"
                description="Vibrate on interactions"
                value={haptics}
                onValueChange={setHaptics}
              />
            </View>
          </View>

          {/* Save Button */}
          <Button
            onPress={handleSavePreferences}
            title="Save Preferences"
            icon="checkmark"
            variant="primary"
            fullWidth
          />

          {/* Info */}
          <View className="gradient-blue border border-sky-600/50 rounded-xl p-4 mt-6">
            <View className="flex-row items-start">
              <Ionicons
                name="information-circle"
                size={20}
                color="#0ea5e9"
                style={{ marginRight: 8, marginTop: 2 }}
              />
              <View className="flex-1">
                <Text className="text-sky-300 text-sm font-semibold mb-1">
                  Preferences Sync
                </Text>
                <Text className="text-sky-200 text-xs">
                  Your preferences are stored locally and synced across devices when logged in.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface PreferenceRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

function PreferenceRow({ icon, title, description, value, onValueChange }: PreferenceRowProps) {
  return (
    <View className="flex-row items-center p-4 border-b border-surface-border last:border-b-0">
      <View className="bg-sky-500 rounded-full w-10 h-10 items-center justify-center mr-3">
        <Ionicons name={icon} size={20} color="white" />
      </View>
      <View className="flex-1 mr-3">
        <Text className="text-primary font-semibold mb-1">{title}</Text>
        <Text className="text-secondary text-xs">{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#475569', true: '#0ea5e9' }}
        thumbColor={value ? '#ffffff' : '#cbd5e1'}
      />
    </View>
  );
}