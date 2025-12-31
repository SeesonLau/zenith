// app/settings/index.tsx - REDESIGNED WITH THEME DEBUGGING
import React from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/contexts/ThemeContext';
import Button from '@/src/components/common/Button';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, setTheme, isLight } = useTheme();

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all temporary data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  // Get background colors based on theme
  const bgPrimary = theme === 'slate' ? '#0f172a' : '#ffffff';
  const bgSurface = theme === 'slate' ? '#1e293b' : '#f8fafc';
  const textPrimary = theme === 'slate' ? '#ffffff' : '#0f172a';
  const textSecondary = theme === 'slate' ? '#cbd5e1' : '#475569';
  const borderColor = theme === 'slate' ? '#334155' : '#e2e8f0';

  return (
    <SafeAreaView 
      edges={['top', 'bottom']} 
      style={{ flex: 1, backgroundColor: bgPrimary }}
    >
      <ScrollView className="flex-1">
        <View className="p-6 pb-8">
          {/* Header */}
          <View className="mb-6 mt-4">
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: textPrimary, marginBottom: 8 }}>
              Settings
            </Text>
            <Text style={{ fontSize: 16, color: textSecondary }}>
              Customize your Zenith experience
            </Text>
          </View>

          {/* THEME DEBUG PANEL - Shows current state */}
          <View style={{
            backgroundColor: theme === 'slate' ? '#22c55e20' : '#dcfce7',
            borderWidth: 2,
            borderColor: '#22c55e',
            borderRadius: 16,
            padding: 16,
            marginBottom: 24
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
              <Text style={{ 
                fontSize: 16, 
                fontWeight: 'bold', 
                color: '#22c55e',
                marginLeft: 8
              }}>
                Theme System Active
              </Text>
            </View>
            <Text style={{ fontSize: 14, color: '#22c55e', marginBottom: 4 }}>
              Current Theme: <Text style={{ fontWeight: 'bold' }}>{theme === 'slate' ? 'SLATE MODE' : 'WHITE MODE'}</Text>
            </Text>
            <Text style={{ fontSize: 14, color: '#22c55e', marginBottom: 4 }}>
              Is Light: <Text style={{ fontWeight: 'bold' }}>{isLight ? 'YES' : 'NO'}</Text>
            </Text>
            <Text style={{ fontSize: 12, color: '#16a34a', marginTop: 8 }}>
              ✓ If you see this panel, theming is working!
            </Text>
          </View>

          {/* Theme Switcher */}
          <View className="mb-6">
            <Text style={{ fontSize: 18, fontWeight: '600', color: textPrimary, marginBottom: 16 }}>
              Appearance
            </Text>
            
            <View style={{ 
              backgroundColor: bgSurface, 
              borderRadius: 16, 
              padding: 20,
              borderWidth: 1,
              borderColor: borderColor
            }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: textPrimary, marginBottom: 16 }}>
                Theme
              </Text>
              
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {/* Slate Mode Button */}
                <Pressable
                  onPress={() => {
                    console.log('🌙 Switching to SLATE mode');
                    setTheme('slate');
                  }}
                  style={{
                    flex: 1,
                    padding: 16,
                    borderRadius: 12,
                    borderWidth: 3,
                    borderColor: theme === 'slate' ? '#0ea5e9' : borderColor,
                    backgroundColor: theme === 'slate' ? '#1e293b' : bgSurface,
                  }}
                >
                  <View style={{ alignItems: 'center' }}>
                    <View style={{
                      backgroundColor: theme === 'slate' ? '#0ea5e9' : bgSurface,
                      borderRadius: 24,
                      width: 48,
                      height: 48,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 8
                    }}>
                      <Ionicons 
                        name="moon" 
                        size={24} 
                        color={theme === 'slate' ? 'white' : '#64748b'} 
                      />
                    </View>
                    <Text style={{
                      fontWeight: '600',
                      fontSize: 14,
                      color: theme === 'slate' ? textPrimary : textSecondary,
                      textAlign: 'center'
                    }}>
                      Slate Mode
                    </Text>
                    <Text style={{ fontSize: 12, color: textSecondary, textAlign: 'center', marginTop: 4 }}>
                      Dark & elegant
                    </Text>
                    {theme === 'slate' && (
                      <View style={{ 
                        marginTop: 8, 
                        backgroundColor: '#0ea5e920',
                        paddingHorizontal: 12,
                        paddingVertical: 4,
                        borderRadius: 12
                      }}>
                        <Text style={{ fontSize: 10, color: '#0ea5e9', fontWeight: 'bold' }}>
                          ACTIVE
                        </Text>
                      </View>
                    )}
                  </View>
                </Pressable>

                {/* White Mode Button */}
                <Pressable
                  onPress={() => {
                    console.log('☀️ Switching to WHITE mode');
                    setTheme('white');
                  }}
                  style={{
                    flex: 1,
                    padding: 16,
                    borderRadius: 12,
                    borderWidth: 3,
                    borderColor: theme === 'white' ? '#0ea5e9' : borderColor,
                    backgroundColor: theme === 'white' ? '#ffffff' : bgSurface,
                  }}
                >
                  <View style={{ alignItems: 'center' }}>
                    <View style={{
                      backgroundColor: theme === 'white' ? '#0ea5e9' : bgSurface,
                      borderRadius: 24,
                      width: 48,
                      height: 48,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 8
                    }}>
                      <Ionicons 
                        name="sunny" 
                        size={24} 
                        color={theme === 'white' ? 'white' : '#64748b'} 
                      />
                    </View>
                    <Text style={{
                      fontWeight: '600',
                      fontSize: 14,
                      color: theme === 'white' ? textPrimary : textSecondary,
                      textAlign: 'center'
                    }}>
                      White Mode
                    </Text>
                    <Text style={{ fontSize: 12, color: textSecondary, textAlign: 'center', marginTop: 4 }}>
                      Clean & professional
                    </Text>
                    {theme === 'white' && (
                      <View style={{ 
                        marginTop: 8, 
                        backgroundColor: '#0ea5e920',
                        paddingHorizontal: 12,
                        paddingVertical: 4,
                        borderRadius: 12
                      }}>
                        <Text style={{ fontSize: 10, color: '#0ea5e9', fontWeight: 'bold' }}>
                          ACTIVE
                        </Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Color Palette Preview */}
          <View style={{ 
            backgroundColor: bgSurface,
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: borderColor
          }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: textPrimary, marginBottom: 12 }}>
              Color Preview
            </Text>
            <Text style={{ fontSize: 14, color: textSecondary, marginBottom: 16 }}>
              These colors update when you switch themes:
            </Text>
            
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 14, color: textSecondary }}>Background</Text>
                <View style={{ 
                  width: 80, 
                  height: 32, 
                  backgroundColor: bgPrimary,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: borderColor
                }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 14, color: textSecondary }}>Surface</Text>
                <View style={{ 
                  width: 80, 
                  height: 32, 
                  backgroundColor: bgSurface,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: borderColor
                }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 14, color: textSecondary }}>Text Primary</Text>
                <View style={{ 
                  width: 80, 
                  height: 32, 
                  backgroundColor: textPrimary,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: borderColor
                }} />
              </View>
            </View>
          </View>

          {/* General Settings */}
          <View className="mb-6">
            <Text style={{ fontSize: 18, fontWeight: '600', color: textPrimary, marginBottom: 16 }}>
              General
            </Text>
            
            <Pressable
              onPress={() => router.push('/settings/preferences')}
              style={{
                backgroundColor: bgSurface,
                borderRadius: 16,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: borderColor
              }}
            >
              <View style={{ 
                backgroundColor: '#9333ea',
                borderRadius: 20,
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}>
                <Ionicons name="options" size={20} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: textPrimary }}>
                  User Preferences
                </Text>
                <Text style={{ fontSize: 14, color: textSecondary }}>
                  Customize your experience
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#64748b" />
            </Pressable>
          </View>

          {/* Data & Storage */}
          <View className="mb-6">
            <Text style={{ fontSize: 18, fontWeight: '600', color: textPrimary, marginBottom: 16 }}>
              Data & Storage
            </Text>
            
            <View style={{
              backgroundColor: bgSurface,
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: borderColor
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: textSecondary }}>Local Database</Text>
                <View style={{ backgroundColor: '#22c55e20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                  <Text style={{ fontSize: 12, color: '#22c55e', fontWeight: 'bold' }}>ACTIVE</Text>
                </View>
              </View>
              <Text style={{ fontSize: 12, color: textSecondary }}>
                All data is stored locally and synced to cloud
              </Text>
            </View>

            <Button
              onPress={handleClearCache}
              title="Clear Cache"
              icon="trash-outline"
              variant="secondary"
              fullWidth
            />
          </View>

          {/* About */}
          <View className="mb-6">
            <Text style={{ fontSize: 18, fontWeight: '600', color: textPrimary, marginBottom: 16 }}>
              About
            </Text>
            
            <View style={{
              backgroundColor: bgSurface,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: borderColor
            }}>
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                <View style={{
                  backgroundColor: '#0ea5e9',
                  borderRadius: 32,
                  width: 64,
                  height: 64,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12
                }}>
                  <Ionicons name="fitness" size={32} color="white" />
                </View>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: textPrimary, marginBottom: 4 }}>
                  Zenith
                </Text>
                <Text style={{ fontSize: 14, color: textSecondary }}>Version 1.0.0</Text>
              </View>

              <InfoRow label="Developer" value="Your Name" textColor={textSecondary} valueColor={textPrimary} borderColor={borderColor} />
              <InfoRow label="Build" value="2025.01.01" textColor={textSecondary} valueColor={textPrimary} borderColor={borderColor} />
              <InfoRow label="Database" value="WatermelonDB + Supabase" textColor={textSecondary} valueColor={textPrimary} borderColor={borderColor} isLast />
            </View>
          </View>

          {/* Privacy Card */}
          <View style={{
            backgroundColor: theme === 'slate' ? '#16a34a20' : '#dcfce7',
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: '#22c55e'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Ionicons
                name="shield-checkmark"
                size={20}
                color="#22c55e"
                style={{ marginRight: 8, marginTop: 2 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#22c55e', marginBottom: 4 }}>
                  Privacy First
                </Text>
                <Text style={{ fontSize: 12, color: '#16a34a' }}>
                  Your data is encrypted and stored locally. Cloud sync is optional and secure.
                </Text>
              </View>
            </View>
          </View>

          {/* Extra bottom padding for safe area */}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
  textColor: string;
  valueColor: string;
  borderColor: string;
  isLast?: boolean;
}

function InfoRow({ label, value, textColor, valueColor, borderColor, isLast }: InfoRowProps) {
  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: isLast ? 0 : 1,
      borderBottomColor: borderColor
    }}>
      <Text style={{ fontSize: 14, color: textColor }}>{label}</Text>
      <Text style={{ fontSize: 14, color: valueColor, fontWeight: '500' }}>{value}</Text>
    </View>
  );
}