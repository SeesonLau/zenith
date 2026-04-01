// app/leisure/edit.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLeisureLog } from '@/src/database/hooks/useDatabase';
import { updateLeisureLog, deleteLeisureLog } from '@/src/database/actions/leisureActions';
import LeisureTypePicker from '@/src/components/leisure/LeisureTypePicker';
import Button from '@/src/components/common/Button';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import type { LeisureType } from '@/src/types/database.types';

export default function EditLeisureScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const leisureLog = useLeisureLog(id);

  const [type, setType] = useState<LeisureType>('Manga');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [startedAt, setStartedAt] = useState(new Date());
  const [durationHours, setDurationHours] = useState('0');
  const [durationMins, setDurationMins] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (!leisureLog || initialized) return;
    setType(leisureLog.type as LeisureType);
    setTitle(leisureLog.title ?? '');
    setNotes(leisureLog.notes ?? '');
    setStartedAt(new Date(leisureLog.startedAt));
    const dur = leisureLog.duration ?? 0;
    setDurationHours(String(Math.floor(dur / 3600)));
    setDurationMins(String(Math.floor((dur % 3600) / 60)));
    setInitialized(true);
  }, [leisureLog]);

  const handleSave = async () => {
    if (!id) return;
    const hours = parseInt(durationHours, 10) || 0;
    const mins = parseInt(durationMins, 10) || 0;
    const duration = hours * 3600 + mins * 60;

    if (duration <= 0) {
      Alert.alert('Invalid Duration', 'Duration must be greater than 0.');
      return;
    }

    setIsLoading(true);
    try {
      await updateLeisureLog(id, {
        type,
        title: title.trim() || undefined,
        notes: notes.trim() || undefined,
        startedAt,
        duration,
      });
      router.back();
    } catch (error) {
      if (__DEV__) console.error('Failed to update session:', error);
      Alert.alert('Error', 'Failed to save changes.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLeisureLog(id);
              router.replace('/leisure');
            } catch {
              Alert.alert('Error', 'Failed to delete session.');
            }
          },
        },
      ]
    );
  };

  if (!leisureLog) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgPrimary, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.textTertiary }}>Loading...</Text>
      </View>
    );
  }

  const dateLabel = startedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeLabel = startedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={{ flex: 1, padding: 20 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 8 }}>
            <Pressable
              onPress={() => router.back()}
              style={{
                backgroundColor: colors.bgSurface, borderRadius: 18,
                width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
                marginRight: 12, borderWidth: 1, borderColor: colors.borderSurface,
              }}
            >
              <Ionicons name="close" size={20} color={colors.textPrimary} />
            </Pressable>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, flex: 1 }}>
              Edit Session
            </Text>
            <Pressable
              onPress={handleDelete}
              style={{
                backgroundColor: colors.danger + '18', borderRadius: 18,
                width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
                borderWidth: 1, borderColor: colors.danger + '40',
              }}
            >
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            {/* Type */}
            <View style={{ marginBottom: 14 }}>
              <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 13, marginBottom: 8 }}>
                Content Type
              </Text>
              <LeisureTypePicker selected={type} onSelect={setType} />
            </View>

            {/* Title */}
            <View style={{ marginBottom: 14 }}>
              <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 13, marginBottom: 6 }}>
                Title <Text style={{ color: colors.textTertiary, fontSize: 11 }}>(Optional)</Text>
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g., One Piece Chapter 1000"
                placeholderTextColor={colors.textTertiary}
                style={{
                  backgroundColor: colors.bgSurface, borderWidth: 1,
                  borderColor: title ? colors.moduleLeisure : colors.borderSurface,
                  borderRadius: 12, padding: 12, fontSize: 13, color: colors.textPrimary,
                }}
              />
            </View>

            {/* Notes */}
            <View style={{ marginBottom: 14 }}>
              <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 13, marginBottom: 6 }}>
                Notes <Text style={{ color: colors.textTertiary, fontSize: 11 }}>(Optional)</Text>
              </Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any notes..."
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={3}
                style={{
                  backgroundColor: colors.bgSurface, borderWidth: 1,
                  borderColor: notes ? colors.moduleLeisure : colors.borderSurface,
                  borderRadius: 12, padding: 12, fontSize: 13, color: colors.textPrimary,
                  textAlignVertical: 'top', minHeight: 80,
                }}
              />
            </View>

            {/* Date & Time */}
            <View style={{ marginBottom: 14 }}>
              <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 13, marginBottom: 8 }}>
                Date &amp; Time
              </Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Pressable
                  onPress={() => setShowDatePicker(true)}
                  style={{
                    flex: 1, backgroundColor: colors.bgSurface, borderWidth: 1,
                    borderColor: colors.borderSurface, borderRadius: 12, padding: 12,
                    flexDirection: 'row', alignItems: 'center', gap: 8,
                  }}
                >
                  <Ionicons name="calendar-outline" size={16} color={colors.moduleLeisure} />
                  <Text style={{ color: colors.textPrimary, fontSize: 13 }}>{dateLabel}</Text>
                </Pressable>
                <Pressable
                  onPress={() => setShowTimePicker(true)}
                  style={{
                    flex: 1, backgroundColor: colors.bgSurface, borderWidth: 1,
                    borderColor: colors.borderSurface, borderRadius: 12, padding: 12,
                    flexDirection: 'row', alignItems: 'center', gap: 8,
                  }}
                >
                  <Ionicons name="time-outline" size={16} color={colors.moduleLeisure} />
                  <Text style={{ color: colors.textPrimary, fontSize: 13 }}>{timeLabel}</Text>
                </Pressable>
              </View>
            </View>

            {/* Duration */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 13, marginBottom: 8 }}>
                Duration
              </Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textTertiary, fontSize: 11, marginBottom: 4 }}>Hours</Text>
                  <TextInput
                    value={durationHours}
                    onChangeText={v => setDurationHours(v.replace(/[^0-9]/g, ''))}
                    keyboardType="number-pad"
                    maxLength={2}
                    style={{
                      backgroundColor: colors.bgSurface, borderWidth: 1,
                      borderColor: colors.borderSurface, borderRadius: 12,
                      padding: 12, fontSize: 16, color: colors.textPrimary,
                      textAlign: 'center', fontWeight: '600',
                    }}
                  />
                </View>
                <View style={{ justifyContent: 'flex-end', paddingBottom: 14 }}>
                  <Text style={{ color: colors.textTertiary, fontSize: 18 }}>:</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textTertiary, fontSize: 11, marginBottom: 4 }}>Minutes</Text>
                  <TextInput
                    value={durationMins}
                    onChangeText={v => {
                      const n = parseInt(v.replace(/[^0-9]/g, '') || '0', 10);
                      setDurationMins(String(Math.min(n, 59)));
                    }}
                    keyboardType="number-pad"
                    maxLength={2}
                    style={{
                      backgroundColor: colors.bgSurface, borderWidth: 1,
                      borderColor: colors.borderSurface, borderRadius: 12,
                      padding: 12, fontSize: 16, color: colors.textPrimary,
                      textAlign: 'center', fontWeight: '600',
                    }}
                  />
                </View>
              </View>
            </View>

            <Button
              onPress={handleSave}
              title="Save Changes"
              icon="checkmark-circle"
              variant="primary"
              fullWidth
              loading={isLoading}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {showDatePicker && (
        <DateTimePicker
          value={startedAt}
          mode="date"
          display="default"
          onChange={(_, selected) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (selected) {
              const updated = new Date(startedAt);
              updated.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
              setStartedAt(updated);
            }
          }}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={startedAt}
          mode="time"
          display="default"
          onChange={(_, selected) => {
            setShowTimePicker(Platform.OS === 'ios');
            if (selected) {
              const updated = new Date(startedAt);
              updated.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
              setStartedAt(updated);
            }
          }}
        />
      )}
    </SafeAreaView>
  );
}
