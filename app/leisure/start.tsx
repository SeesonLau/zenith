// app/leisure/start.tsx
import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { startLeisureTimer } from '@/src/database/actions/leisureActions';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export default function StartLeisureScreen() {
  const router = useRouter();
  const colors = useThemeColors();

  useEffect(() => {
    const startTimer = async () => {
      try {
        await startLeisureTimer();
        router.replace('/leisure');
      } catch (error) {
        if (__DEV__) console.error('Failed to start leisure timer:', error);
        router.back();
      }
    };

    startTimer();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={colors.moduleLeisure} />
    </View>
  );
}
