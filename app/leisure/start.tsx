// app/leisure/start.tsx
import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { startLeisureTimer } from '@/src/database/actions/leisureActions';

export default function StartLeisureScreen() {
  const router = useRouter();

  useEffect(() => {
    const startTimer = async () => {
      try {
        await startLeisureTimer();
        router.replace('/leisure');
      } catch (error) {
        console.error('Failed to start leisure timer:', error);
        router.back();
      }
    };

    startTimer();
  }, []);

  return (
    <View className="flex-1 bg-primary items-center justify-center">
      <ActivityIndicator size="large" color="#ec4899" />
    </View>
  );
}