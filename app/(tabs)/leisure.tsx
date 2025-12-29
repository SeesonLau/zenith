// app/(tabs)/leisure.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRunningLeisureTimers } from '@/src/database/hooks/useDatabase';
import { stopLeisureTimer } from '@/src/database/actions/leisureActions';
import { database } from '@/src/database';
import { Q } from '@nozbe/watermelondb';
import type LeisureLog from '@/src/database/models/LeisureLog';
import FloatingActionButton from '@/src/components/common/FloatingActionButton';
import EmptyState from '@/src/components/common/EmptyState';
import Button from '@/src/components/common/Button';
import LeisureTimerCard from '@/src/components/leisure/LeisureTimerCard';
import CompletedLeisureCard from '@/src/components/leisure/CompletedLeisureCard';

export default function LeisureScreen() {
  const router = useRouter();
  const runningTimers = useRunningLeisureTimers();
  const [refreshing, setRefreshing] = useState(false);
  const [completedSessions, setCompletedSessions] = useState<LeisureLog[]>([]);

  // Load completed sessions
  React.useEffect(() => {
    const subscription = database
      .get<LeisureLog>('leisure_logs')
      .query(
        Q.where('ended_at', Q.notEq(null)),
        Q.sortBy('started_at', Q.desc),
        Q.take(20)
      )
      .observe()
      .subscribe(setCompletedSessions);

    return () => subscription.unsubscribe();
  }, []);

  const handleStopTimer = async (timerId: string) => {
    try {
      await stopLeisureTimer(timerId);
    } catch (error) {
      console.error('Failed to stop timer:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  // Calculate stats
  const totalDuration = completedSessions.reduce((sum, log) => sum + (log.duration || 0), 0);
  const todaysSessions = completedSessions.filter((log) => {
    const today = new Date();
    return (
      log.startedAt.getDate() === today.getDate() &&
      log.startedAt.getMonth() === today.getMonth() &&
      log.startedAt.getFullYear() === today.getFullYear()
    );
  });

  return (
    <View className="flex-1 bg-slate-900">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0ea5e9" />
        }
      >
        <View className="p-6">
          {/* Header */}
          <View className="mb-6 mt-4">
            <Text className="text-3xl font-bold text-white mb-2">Leisure Tracker</Text>
            <Text className="text-slate-400 text-base">
              Track your media consumption time
            </Text>
          </View>

          {/* Active Sessions */}
          {runningTimers.length > 0 && (
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-semibold text-white">Active Session</Text>
                <View className="bg-slate-800 px-3 py-1 rounded-full">
                  <Text className="text-slate-300 font-semibold">{runningTimers.length}</Text>
                </View>
              </View>

              {runningTimers.map((timer) => (
                <LeisureTimerCard
                  key={timer.id}
                  id={timer.id}
                  type={timer.type}
                  title={timer.title}
                  notes={timer.notes}
                  startedAt={timer.startedAt}
                  onStop={handleStopTimer}
                  onPress={() => router.push(`/leisure/${timer.id}`)}
                />
              ))}
            </View>
          )}

          {/* Quick Stats */}
          <View className="card p-5 mb-6">
            <Text className="text-white font-semibold text-lg mb-3">Today's Stats</Text>
            <View className="flex-row justify-around">
              <View className="items-center">
                <Text className="text-slate-400 text-xs mb-1">Sessions</Text>
                <Text className="text-white text-2xl font-bold">{todaysSessions.length}</Text>
              </View>
              <View className="w-px bg-slate-700" />
              <View className="items-center">
                <Text className="text-slate-400 text-xs mb-1">Total Time</Text>
                <Text className="text-white text-2xl font-bold">
                  {Math.floor(todaysSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60)}m
                </Text>
              </View>
              <View className="w-px bg-slate-700" />
              <View className="items-center">
                <Text className="text-slate-400 text-xs mb-1">All Time</Text>
                <Text className="text-white text-2xl font-bold">
                  {Math.floor(totalDuration / 3600)}h
                </Text>
              </View>
            </View>
          </View>

          {/* Recent Sessions */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-semibold text-white">Recent Sessions</Text>
              <View className="bg-slate-800 px-3 py-1 rounded-full">
                <Text className="text-slate-300 font-semibold">{completedSessions.length}</Text>
              </View>
            </View>

            {completedSessions.length === 0 && runningTimers.length === 0 ? (
              <EmptyState
                icon="film-outline"
                title="No Sessions Yet"
                description="Start tracking your leisure time"
                action={
                  <Button
                    onPress={() => router.push('/leisure/start')}
                    title="Start Session"
                    icon="play"
                    variant="primary"
                  />
                }
              />
            ) : (
              <View>
                {completedSessions.map((session) => (
                  <CompletedLeisureCard
                    key={session.id}
                    id={session.id}
                    type={session.type}
                    title={session.title}
                    startedAt={session.startedAt}
                    duration={session.duration || 0}
                    notes={session.notes}
                    onPress={() => router.push(`/leisure/${session.id}`)}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Info Card */}
          <View className="bg-sky-900/20 border border-sky-700 rounded-xl p-4">
            <View className="flex-row items-start">
              <Ionicons
                name="information-circle"
                size={20}
                color="#0ea5e9"
                style={{ marginRight: 8, marginTop: 2 }}
              />
              <View className="flex-1">
                <Text className="text-sky-300 text-sm font-semibold mb-1">
                  Leisure Tracking
                </Text>
                <Text className="text-sky-200 text-xs">
                  Monitor your media consumption habits. Track what you watch, read, or view to
                  better understand your leisure patterns.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton
        onPress={() => router.push('/leisure/start')}
        icon="play"
        color="bg-sky-500"
      />
    </View>
  );
}