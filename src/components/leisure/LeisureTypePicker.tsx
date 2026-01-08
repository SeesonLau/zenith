// src/components/leisure/LeisureTypePicker.tsx
import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  getAllLeisureGroups,
  getLeisureTypesForGroup, 
  getLeisureTypeLabel,
  type LeisureTypeGroup 
} from '@/src/constants/categories';
import { getLeisureConfig } from '@/src/lib/constants';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import type { LeisureType } from '@/src/types/database.types';

interface LeisureTypePickerProps {
  selected?: LeisureType;
  onSelect: (type: LeisureType) => void;
}

const GROUP_LABELS = {
  I: 'General',
  II: 'Adult',
  III: 'Other',
} as const;

const GROUP_COLORS = {
  I: {
    bg: 'bg-blue-900/20',
    bgLight: 'bg-blue-100',
    border: 'border-blue-500',
    text: 'text-blue-400',
    textLight: 'text-blue-600',
    icon: '#3b82f6',
  },
  II: {
    bg: 'bg-pink-900/20',
    bgLight: 'bg-pink-100',
    border: 'border-pink-500',
    text: 'text-pink-400',
    textLight: 'text-pink-600',
    icon: '#ec4899',
  },
  III: {
    bg: 'bg-purple-900/20',
    bgLight: 'bg-purple-100',
    border: 'border-purple-500',
    text: 'text-purple-400',
    textLight: 'text-purple-600',
    icon: '#a855f7',
  },
} as const;

export default function LeisureTypePicker({ selected, onSelect }: LeisureTypePickerProps) {
  const { isLight } = useTheme();
  const colors = useThemeColors();
  const [expandedGroups, setExpandedGroups] = useState<Set<LeisureTypeGroup>>(
    new Set(['I']) // Start with Group I expanded
  );

  const toggleGroup = (group: LeisureTypeGroup) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

  const groups = getAllLeisureGroups();

  return (
    <View className="mb-6">
      <Text className="text-primary font-semibold mb-3 text-lg">
        Content Type
      </Text>

      {groups.map((group) => {
        const isExpanded = expandedGroups.has(group);
        const types = getLeisureTypesForGroup(group) as readonly LeisureType[];
        const groupColors = GROUP_COLORS[group];
        const label = GROUP_LABELS[group];

        return (
          <View key={group} className="mb-3">
            {/* Group Header */}
            <Pressable
              onPress={() => toggleGroup(group)}
              className={`
                ${isLight ? groupColors.bgLight : groupColors.bg}
                border-2 ${groupColors.border}
                rounded-xl p-4
                flex-row items-center justify-between
                active:opacity-80
              `}
            >
              <View className="flex-row items-center flex-1">
                <View 
                  className={`
                    ${isLight ? groupColors.bgLight : groupColors.bg}
                    rounded-full w-10 h-10 items-center justify-center mr-3
                    border ${groupColors.border}
                  `}
                >
                  <Text className={`${isLight ? groupColors.textLight : groupColors.text} font-bold text-lg`}>
                    {group}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className={`${isLight ? groupColors.textLight : groupColors.text} font-semibold text-base`}>
                    {label}
                  </Text>
                  <Text className="text-tertiary text-xs">
                    {types.length} types
                  </Text>
                </View>
              </View>
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={24}
                color={groupColors.icon}
              />
            </Pressable>

            {/* Group Content */}
            {isExpanded && (
              <View className="mt-2 ml-2">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 8 }}
                >
                  <View className="flex-row gap-3 py-2">
                    {types.map((type) => {
                      const config = getLeisureConfig(type);
                      const isSelected = selected === type;
                      const label = getLeisureTypeLabel(type);

                      return (
                        <Pressable
                          key={type}
                          onPress={() => onSelect(type)}
                          className={`
                            ${isSelected 
                              ? '' 
                              : isLight 
                                ? 'bg-white' 
                                : 'bg-surface'
                            }
                            border-2
                            rounded-xl p-4 min-w-[120px] items-center
                            shadow-lg
                            active:scale-95
                          `}
                          style={{
                            backgroundColor: isSelected ? config.color : undefined,
                            borderColor: isSelected ? config.borderColor : colors.borderSurface,
                            transform: [{ scale: 1 }],
                          }}
                        >
                          <Text className="text-3xl mb-2">{config.emoji}</Text>
                          <Text
                            className={`font-semibold text-center text-sm ${
                              isSelected 
                                ? 'text-white' 
                                : isLight 
                                  ? 'text-slate-700' 
                                  : 'text-secondary'
                            }`}
                          >
                            {label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}