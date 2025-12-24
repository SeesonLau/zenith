import { View, Text } from 'react-native';
import React from 'react';

export default function LeisureScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-950">
      <Text className="text-white text-xl font-bold">Leisure Tracker</Text>
      <Text className="text-slate-400 mt-2">Manga, Games & Media logs</Text>
    </View>
  );
}