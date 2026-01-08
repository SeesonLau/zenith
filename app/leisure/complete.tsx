// app/leisure/complete.tsx - COMPACT VERSION
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { completeLeisureSession } from '@/src/database/actions/leisureActions';
import type { LeisureType } from '@/src/types/database.types';
import LeisureTypePicker from '@/src/components/leisure/LeisureTypePicker';
import Button from '@/src/components/common/Button';
import { formatDurationHMS } from '@/src/utils/formatters';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export default function CompleteLeisureScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const params = useLocalSearchParams<{ id: string; duration: string }>();
  const [type, setType] = useState<LeisureType>('Manga');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    if (!params.id) {
      Alert.alert('Error', 'Invalid session');
      return;
    }

    setIsLoading(true);

    try {
      await completeLeisureSession(
        params.id,
        type,
        title.trim() || undefined,
        notes.trim() || undefined
      );
      router.replace('/leisure');
    } catch (error) {
      console.error('Failed to complete leisure session:', error);
      Alert.alert('Error', 'Failed to save session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, padding: 20 }}>
          {/* Header with Duration */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20, 
            marginTop: 8 
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Pressable 
                onPress={() => {
                  Alert.alert(
                    'Discard Session?',
                    'Are you sure you want to discard this session?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Discard', 
                        style: 'destructive',
                        onPress: () => router.back()
                      },
                    ]
                  );
                }}
                style={{
                  backgroundColor: colors.bgSurface,
                  borderRadius: 18,
                  width: 36,
                  height: 36,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                  borderWidth: 1,
                  borderColor: colors.borderSurface,
                }}
              >
                <Ionicons name="close" size={20} color={colors.textPrimary} />
              </Pressable>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.textPrimary }}>
                Complete Session
              </Text>
            </View>

            {/* Duration Badge */}
            <View style={{
              backgroundColor: '#ec489915',
              borderWidth: 1,
              borderColor: '#ec4899',
              borderRadius: 10,
              paddingHorizontal: 10,
              paddingVertical: 6,
            }}>
              <Text style={{ 
                color: '#ec4899', 
                fontSize: 14, 
                fontFamily: 'monospace', 
                fontWeight: 'bold',
              }}>
                {formatDurationHMS(parseInt(params.duration || '0'))}
              </Text>
            </View>
          </View>

          {/* Scrollable Content */}
          <ScrollView 
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {/* Type Picker Section */}
            <View style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 13 }}>
                  Content Type
                </Text>
                <View style={{
                  backgroundColor: '#ef444420',
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 6,
                  marginLeft: 6,
                }}>
                  <Text style={{ color: '#ef4444', fontSize: 9, fontWeight: '700' }}>
                    REQUIRED
                  </Text>
                </View>
              </View>
              <LeisureTypePicker selected={type} onSelect={setType} />
            </View>

            {/* Title Section */}
            <View style={{ marginBottom: 14 }}>
              <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 13, marginBottom: 6 }}>
                Title <Text style={{ color: colors.textTertiary, fontSize: 11 }}>(Optional)</Text>
              </Text>
              <TextInput
                placeholder="e.g., One Piece Chapter 1000"
                placeholderTextColor={colors.textTertiary}
                value={title}
                onChangeText={setTitle}
                style={{
                  backgroundColor: colors.bgSurface,
                  borderWidth: 1,
                  borderColor: title ? '#ec4899' : colors.borderSurface,
                  borderRadius: 12,
                  padding: 12,
                  fontSize: 13,
                  color: colors.textPrimary,
                }}
              />
            </View>

            {/* Notes Section */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 13, marginBottom: 6 }}>
                Notes <Text style={{ color: colors.textTertiary, fontSize: 11 }}>(Optional)</Text>
              </Text>
              <TextInput
                placeholder="Add any notes..."
                placeholderTextColor={colors.textTertiary}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                style={{
                  backgroundColor: colors.bgSurface,
                  borderWidth: 1,
                  borderColor: notes ? '#ec4899' : colors.borderSurface,
                  borderRadius: 12,
                  padding: 12,
                  fontSize: 13,
                  color: colors.textPrimary,
                  textAlignVertical: 'top',
                  minHeight: 80,
                }}
              />
            </View>

            {/* Save Button */}
            <Button
              onPress={handleComplete}
              title="Save Session"
              icon="checkmark-circle"
              variant="primary"
              fullWidth
              loading={isLoading}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}