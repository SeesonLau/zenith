// app/leisure/[id].tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Pressable, Alert, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLeisureLog } from '@/src/database/hooks/useDatabase';
import { deleteLeisureLog, updateLeisureLog } from '@/src/database/actions/leisureActions';
import { getLeisureConfig } from '@/src/lib/constants';
import { formatDurationHMS, formatTime } from '@/src/utils/formatters';
import { formatDate } from '@/src/utils/dateHelpers';
import Button from '@/src/components/common/Button';
import LeisureTypePicker from '@/src/components/leisure/LeisureTypePicker';
import LoadingSpinner from '@/src/components/common/LoadingSpinner';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import type { ThemeColors } from '@/src/hooks/useThemeColors';
import type { LeisureType } from '@/src/types/database.types';

export default function LeisureDetailScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const leisureLog = useLeisureLog(id);

  const [isEditing, setIsEditing] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [editType, setEditType] = useState<LeisureType>('Manga');
  const [editTitle, setEditTitle] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editStartedAt, setEditStartedAt] = useState(new Date());
  const [editHours, setEditHours] = useState('0');
  const [editMins, setEditMins] = useState('0');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (!leisureLog) return;
    setEditType(leisureLog.type as LeisureType);
    setEditTitle(leisureLog.title ?? '');
    setEditNotes(leisureLog.notes ?? '');
    setEditStartedAt(new Date(leisureLog.startedAt));
    const dur = leisureLog.duration ?? 0;
    setEditHours(String(Math.floor(dur / 3600)));
    setEditMins(String(Math.floor((dur % 3600) / 60)));
  }, [leisureLog]);

  useEffect(() => {
    if (leisureLog) { setNotFound(false); return; }
    const t = setTimeout(() => setNotFound(true), 600);
    return () => clearTimeout(t);
  }, [leisureLog]);

  const handleCancelEdit = () => {
    if (leisureLog) {
      setEditType(leisureLog.type as LeisureType);
      setEditTitle(leisureLog.title ?? '');
      setEditNotes(leisureLog.notes ?? '');
      setEditStartedAt(new Date(leisureLog.startedAt));
      const dur = leisureLog.duration ?? 0;
      setEditHours(String(Math.floor(dur / 3600)));
      setEditMins(String(Math.floor((dur % 3600) / 60)));
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    const hours = parseInt(editHours, 10) || 0;
    const mins = parseInt(editMins, 10) || 0;
    const duration = hours * 3600 + mins * 60;
    if (duration <= 0) {
      Alert.alert('Invalid Duration', 'Duration must be greater than 0.');
      return;
    }
    setIsSaving(true);
    try {
      await updateLeisureLog(id, {
        type: editType,
        title: editTitle.trim() || undefined,
        notes: editNotes.trim() || undefined,
        startedAt: editStartedAt,
        duration,
      });
      setIsEditing(false);
    } catch {
      Alert.alert('Error', 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Session', 'Are you sure you want to delete this session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteLeisureLog(id);
            router.back();
          } catch {
            Alert.alert('Error', 'Failed to delete session.');
          }
        },
      },
    ]);
  };

  if (!leisureLog) {
    if (notFound) {
      return (
        <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
            <Ionicons name="film-outline" size={48} color={colors.textTertiary} />
            <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: 'bold', marginTop: 16, marginBottom: 8 }}>
              Session Not Found
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
              This session may have been deleted or does not exist.
            </Text>
            <Pressable
              onPress={() => router.back()}
              style={{ backgroundColor: colors.moduleLeisure, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 }}
            >
              <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 14 }}>Go Back</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      );
    }
    return <LoadingSpinner fullScreen />;
  }

  const config = getLeisureConfig(isEditing ? editType : leisureLog.type);

  // ── EDIT MODE ──────────────────────────────────────────────────────────────
  if (isEditing) {
    const dateLabel = editStartedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeLabel = editStartedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView style={{ flex: 1 }}>
            <View style={{ padding: 20 }}>
              {/* Header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 8 }}>
                <Pressable onPress={handleCancelEdit} style={{ marginRight: 12 }}>
                  <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </Pressable>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.textPrimary, flex: 1 }}>
                  Edit Session
                </Text>
              </View>

              {/* Type */}
              <View style={{ marginBottom: 14 }}>
                <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 13, marginBottom: 8 }}>
                  Content Type
                </Text>
                <LeisureTypePicker selected={editType} onSelect={setEditType} />
              </View>

              {/* Title */}
              <View style={{ marginBottom: 14 }}>
                <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 13, marginBottom: 6 }}>
                  Title <Text style={{ color: colors.textTertiary, fontSize: 11 }}>(Optional)</Text>
                </Text>
                <TextInput
                  value={editTitle}
                  onChangeText={setEditTitle}
                  placeholder="e.g., One Piece Chapter 1000"
                  placeholderTextColor={colors.textTertiary}
                  style={{
                    backgroundColor: colors.bgSurface, borderWidth: 1,
                    borderColor: editTitle ? colors.moduleLeisure : colors.borderSurface,
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
                  value={editNotes}
                  onChangeText={setEditNotes}
                  placeholder="Add any notes..."
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  numberOfLines={3}
                  style={{
                    backgroundColor: colors.bgSurface, borderWidth: 1,
                    borderColor: editNotes ? colors.moduleLeisure : colors.borderSurface,
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
                      flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
                      backgroundColor: colors.bgSurface, borderWidth: 1,
                      borderColor: showDatePicker ? colors.moduleLeisure : colors.borderSurface,
                      borderRadius: 10, padding: 12,
                    }}
                  >
                    <Ionicons name="calendar-outline" size={16} color={colors.moduleLeisure} />
                    <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '500' }}>{dateLabel}</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setShowTimePicker(true)}
                    style={{
                      flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
                      backgroundColor: colors.bgSurface, borderWidth: 1,
                      borderColor: showTimePicker ? colors.moduleLeisure : colors.borderSurface,
                      borderRadius: 10, padding: 12,
                    }}
                  >
                    <Ionicons name="time-outline" size={16} color={colors.moduleLeisure} />
                    <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '500' }}>{timeLabel}</Text>
                  </Pressable>
                </View>
              </View>

              {/* Duration */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 13, marginBottom: 8 }}>
                  Duration
                </Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.textTertiary, fontSize: 11, marginBottom: 4 }}>Hours</Text>
                    <TextInput
                      value={editHours}
                      onChangeText={v => setEditHours(v.replace(/[^0-9]/g, ''))}
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
                      value={editMins}
                      onChangeText={v => {
                        const n = parseInt(v.replace(/[^0-9]/g, '') || '0', 10);
                        setEditMins(String(Math.min(n, 59)));
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
                loading={isSaving}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {showDatePicker && (
          <DateTimePicker
            value={editStartedAt}
            mode="date"
            display="default"
            onChange={(_, selected) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selected) {
                const d = new Date(editStartedAt);
                d.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
                setEditStartedAt(d);
              }
            }}
          />
        )}
        {showTimePicker && (
          <DateTimePicker
            value={editStartedAt}
            mode="time"
            display="default"
            onChange={(_, selected) => {
              setShowTimePicker(Platform.OS === 'ios');
              if (selected) {
                const d = new Date(editStartedAt);
                d.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
                setEditStartedAt(d);
              }
            }}
          />
        )}
      </SafeAreaView>
    );
  }

  // ── VIEW MODE ──────────────────────────────────────────────────────────────
  const durationSeconds = leisureLog.duration ?? 0;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 20 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 8 }}>
            <Pressable onPress={() => router.back()} style={{ marginRight: 12 }}>
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </Pressable>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.textPrimary, flex: 1 }}>
              Session Details
            </Text>
            <Pressable
              onPress={() => setIsEditing(true)}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 4,
                backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.borderSurface,
                borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6,
              }}
            >
              <Ionicons name="pencil" size={14} color={colors.moduleLeisure} />
              <Text style={{ color: colors.moduleLeisure, fontSize: 13, fontWeight: '600' }}>Edit</Text>
            </Pressable>
          </View>

          {/* Session Card */}
          <View style={{
            backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.borderSurface,
            borderLeftWidth: 4, borderLeftColor: config.hex,
            borderRadius: 14, padding: 16, marginBottom: 14,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{
                backgroundColor: config.hex + '20', borderWidth: 1, borderColor: config.hex + '50',
                borderRadius: 12, width: 48, height: 48,
                alignItems: 'center', justifyContent: 'center', marginRight: 12,
              }}>
                <Text style={{ fontSize: 26 }}>{config.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textTertiary, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {leisureLog.type}
                </Text>
                <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: 'bold' }}>
                  {leisureLog.title || `${leisureLog.type} Session`}
                </Text>
              </View>
            </View>

            <View style={{
              backgroundColor: colors.bgSurfaceHover, borderRadius: 12, padding: 16,
              borderWidth: 1, borderColor: config.hex + '30',
            }}>
              <Text style={{ color: colors.textTertiary, fontSize: 11, marginBottom: 4, textAlign: 'center' }}>
                Total Duration
              </Text>
              <Text style={{
                color: config.hex, fontSize: 40, fontFamily: 'monospace',
                fontWeight: 'bold', textAlign: 'center',
              }}>
                {formatDurationHMS(durationSeconds)}
              </Text>
            </View>
          </View>

          {/* Time Details */}
          <View style={{
            backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.borderSurface,
            borderRadius: 14, padding: 16, marginBottom: 14,
          }}>
            <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 15, marginBottom: 12 }}>
              Time Details
            </Text>
            <DetailRow icon="play" label="Started"
              value={`${formatDate(leisureLog.startedAt, 'short')} at ${formatTime(leisureLog.startedAt)}`}
              colors={colors} />
            {leisureLog.endedAt && (
              <DetailRow icon="stop" label="Ended"
                value={`${formatDate(leisureLog.endedAt, 'short')} at ${formatTime(leisureLog.endedAt)}`}
                colors={colors} />
            )}
            <DetailRow icon="time" label="Duration"
              value={formatDurationHMS(durationSeconds)}
              colors={colors} isLast />
          </View>

          {/* Notes */}
          {leisureLog.notes && (
            <View style={{
              backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.borderSurface,
              borderRadius: 14, padding: 16, marginBottom: 14,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} />
                <Text style={{ color: colors.textPrimary, fontWeight: '600', marginLeft: 6, fontSize: 14 }}>Notes</Text>
              </View>
              <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 20 }}>
                {leisureLog.notes}
              </Text>
            </View>
          )}

          {/* Insight */}
          <View style={{
            backgroundColor: config.hex + '15', borderWidth: 1, borderColor: config.hex + '30',
            borderRadius: 12, padding: 14, marginBottom: 14,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Ionicons name="bulb" size={16} color={config.hex} style={{ marginRight: 8, marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: config.hex, fontSize: 12, fontWeight: '600', marginBottom: 4 }}>
                  Session Insight
                </Text>
                <Text style={{ color: config.hex, fontSize: 11, opacity: 0.9 }}>
                  {durationSeconds < 600
                    ? 'Quick session! Perfect for a short break.'
                    : durationSeconds < 1800
                    ? 'Nice session length. Good balance.'
                    : durationSeconds < 3600
                    ? 'Extended session! Take breaks.'
                    : 'Long session! Stay hydrated and stretch.'}
                </Text>
              </View>
            </View>
          </View>

          {/* Delete */}
          <Button onPress={handleDelete} title="Delete Session" icon="trash" variant="danger" fullWidth />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface DetailRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  colors: ThemeColors;
  isLast?: boolean;
}

function DetailRow({ icon, label, value, colors, isLast }: DetailRowProps) {
  return (
    <View style={{
      flexDirection: 'row', paddingVertical: 10,
      borderBottomWidth: isLast ? 0 : 1, borderBottomColor: colors.borderSurface,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', flex: 1 }}>
        <Ionicons name={icon} size={16} color={colors.textTertiary} style={{ marginTop: 1 }} />
        <Text style={{ color: colors.textSecondary, fontSize: 12, marginLeft: 8, width: 70 }}>{label}</Text>
      </View>
      <Text style={{ color: colors.textPrimary, flex: 1, fontSize: 12 }}>{value}</Text>
    </View>
  );
}
