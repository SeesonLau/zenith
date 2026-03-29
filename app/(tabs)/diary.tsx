// app/(tabs)/diary.tsx - INLINE STYLES VERSION
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDiaryEntries } from '@/src/database/hooks/useDatabase';
import { addMonths } from '@/src/utils/dateHelpers';
import { Strings } from '@/src/constants/strings';
import FloatingActionButton from '@/src/components/common/FloatingActionButton';
import EmptyState from '@/src/components/common/EmptyState';
import Button from '@/src/components/common/Button';
import DiaryCard from '@/src/components/diary/DiaryCard';
import type { MoodType } from '@/src/types/database.types';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export default function DiaryScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const entries = useDiaryEntries(selectedDate.getFullYear(), selectedDate.getMonth());

  useEffect(() => {
    if (__DEV__) console.log('📔 DIARY DEBUG: Entries Count:', entries.length);
  }, [entries]);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  const handlePreviousMonth = () => {
    setSelectedDate(addMonths(selectedDate, -1));
  };

  const handleNextMonth = () => {
    setSelectedDate(addMonths(selectedDate, 1));
  };

  const totalWords = entries.reduce((sum, entry) => sum + entry.wordCount, 0);
  const thisWeekEntries = entries.filter((entry) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return entry.entryDate >= weekAgo;
  });

  const currentStreak = thisWeekEntries.length;
  const monthName = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.moduleDiary} />
        }
      >
        <View style={{ padding: 24 }}>
          {/* Header */}
          <View style={{ marginBottom: 24, marginTop: 16 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 8 }}>
              {Strings.diary.screenTitle}
            </Text>
          </View>

          {/* Month Navigator */}
          <View style={{
            backgroundColor: colors.bgSurface,
            borderWidth: 1,
            borderColor: colors.borderSurface,
            borderRadius: 16,
            padding: 16,
            marginBottom: 16
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Pressable
                onPress={handlePreviousMonth}
                style={{ backgroundColor: colors.bgSurfaceHover, borderRadius: 8, padding: 12 }}
              >
                <Ionicons name="chevron-back" size={20} color={colors.textTertiary} />
              </Pressable>

              <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: 'bold' }}>
                {monthName}
              </Text>

              <Pressable
                onPress={handleNextMonth}
                style={{ backgroundColor: colors.bgSurfaceHover, borderRadius: 8, padding: 12 }}
              >
                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
              </Pressable>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={{
            backgroundColor: colors.bgSurface,
            borderWidth: 1,
            borderColor: colors.borderSurface,
            borderRadius: 16,
            padding: 20,
            marginBottom: 24
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 18 }}>
                {Strings.diary.thisMonth}
              </Text>
              {currentStreak > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.moduleDiary + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                  <Ionicons name="flame" size={14} color={colors.moduleDiary} />
                  <Text style={{ color: colors.moduleDiary, fontSize: 12, fontWeight: 'bold', marginLeft: 4 }}>
                    {currentStreak} {Strings.diary.streakLabel}
                  </Text>
                </View>
              )}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4, fontWeight: '500' }}>
                  {Strings.diary.statsEntries}
                </Text>
                <Text style={{ color: colors.textPrimary, fontSize: 28, fontWeight: 'bold' }}>
                  {entries.length}
                </Text>
              </View>
              <View style={{ width: 1, backgroundColor: colors.borderSurface }} />
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4, fontWeight: '500' }}>
                  {Strings.diary.statsThisWeek}
                </Text>
                <Text style={{ color: colors.textPrimary, fontSize: 28, fontWeight: 'bold' }}>
                  {thisWeekEntries.length}
                </Text>
              </View>
              <View style={{ width: 1, backgroundColor: colors.borderSurface }} />
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4, fontWeight: '500' }}>
                  {Strings.diary.statsTotalWords}
                </Text>
                <Text style={{ color: colors.textPrimary, fontSize: 28, fontWeight: 'bold' }}>
                  {(totalWords / 1000).toFixed(1)}k
                </Text>
              </View>
            </View>
          </View>

          {/* Entries List */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={{ fontSize: 20, fontWeight: '600', color: colors.textPrimary }}>
                {Strings.diary.recentEntries}
              </Text>
              <View style={{
                backgroundColor: colors.bgSurface,
                borderWidth: 1,
                borderColor: colors.borderSurface,
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 12
              }}>
                <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 14 }}>
                  {entries.length}
                </Text>
              </View>
            </View>

            {entries.length === 0 ? (
              <EmptyState
                icon="book-outline"
                title={Strings.diary.emptyTitle}
                description={Strings.diary.emptyDesc}
                action={
                  <Button
                    onPress={() => router.push('/diary/new')}
                    title={Strings.diary.newEntry}
                    icon="create"
                    variant="primary"
                  />
                }
              />
            ) : (
              <View style={{ gap: 12 }}>
                {entries.map((entry) => (
                  <DiaryCard
                    key={entry.id}
                    id={entry.id}
                    title={entry.title}
                    content={entry.content}
                    entryDate={entry.entryDate}
                    mood={entry.mood as MoodType | undefined}
                    wordCount={entry.wordCount}
                    imageCount={0}
                    onPress={() => router.push(`/diary/${entry.id}`)}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Calendar View Button */}
          {entries.length > 0 && (
            <Button
              onPress={() => router.push('/diary/calendar')}
              title={Strings.diary.calendarView}
              icon="calendar"
              variant="secondary"
              fullWidth
            />
          )}

          {/* Bottom Padding for FAB */}
          <View style={{ height: 128 }} />
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton
        onPress={() => router.push('/diary/new')}
        icon="create"
        color="bg-sky-600"
      />
    </SafeAreaView>
  );
}
