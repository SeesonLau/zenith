// src/components/common/NetworkStatus.tsx (NEW FILE - OPTIONAL)
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';

export default function NetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  if (isConnected === null) return null;

  return (
    <View className={`flex-row items-center justify-center py-2 px-4 rounded-full ${
      isConnected ? 'bg-green-900/20' : 'bg-red-900/20'
    }`}>
      <Ionicons
        name={isConnected ? 'wifi' : 'wifi-outline'}
        size={14}
        color={isConnected ? '#22c55e' : '#ef4444'}
      />
      <Text className={`text-xs font-medium ml-2 ${
        isConnected ? 'text-green-400' : 'text-red-400'
      }`}>
        {isConnected ? 'Online' : 'Offline'}
      </Text>
    </View>
  );
}