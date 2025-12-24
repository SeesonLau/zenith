// app/auth.tsx
import React, { useState } from 'react';
import { View, TextInput, Pressable, Text, Alert } from 'react-native';
import { useAuth } from '../src/contexts/AuthContext';
import { router } from 'expo-router';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signUp } = useAuth();

  const handleSignIn = async () => {
    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSignUp = async () => {
    try {
      await signUp(email, password);
      Alert.alert('Success', 'Check your email to confirm!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View className="flex-1 justify-center p-6 bg-white">
      <Text className="text-3xl font-bold mb-8 text-center">Zenith</Text>
      
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        className="border border-gray-300 p-4 rounded-lg mb-4"
      />
      
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className="border border-gray-300 p-4 rounded-lg mb-4"
      />
      
      <Pressable
        onPress={handleSignIn}
        className="bg-blue-500 p-4 rounded-lg mb-3"
      >
        <Text className="text-white text-center font-bold">Sign In</Text>
      </Pressable>
      
      <Pressable
        onPress={handleSignUp}
        className="bg-gray-500 p-4 rounded-lg"
      >
        <Text className="text-white text-center font-bold">Sign Up</Text>
      </Pressable>
    </View>
  );
}