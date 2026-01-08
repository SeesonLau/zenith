// src/components/common/NetworkStatus.tsx thmed
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
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: isConnected ? '#22c55e20' : '#ef444420'
    }}>
      <Ionicons
        name={isConnected ? 'wifi' : 'wifi-outline'}
        size={14}
        color={isConnected ? '#22c55e' : '#ef4444'}
      />
      <Text style={{
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 8,
        color: isConnected ? '#22c55e' : '#ef4444'
      }}>
        {isConnected ? 'Online' : 'Offline'}
      </Text>
    </View>
  );
}