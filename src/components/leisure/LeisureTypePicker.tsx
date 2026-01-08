// src/components/leisure/LeisureTypePicker.tsx - COMPACT VERTICAL VERSION
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

const GROUP_COLORS: Record<LeisureTypeGroup, string> = {
  I: '#3b82f6',   // Blue
  II: '#ec4899',  // Pink
  III: '#a855f7', // Purple
};

export default function LeisureTypePicker({ selected, onSelect }: LeisureTypePickerProps) {
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
    <View>
      {groups.map((group) => {
        const isExpanded = expandedGroups.has(group);
        const types = getLeisureTypesForGroup(group) as readonly LeisureType[];
        const groupColor = GROUP_COLORS[group];
        const label = GROUP_LABELS[group];

        return (
          <View key={group} style={{ marginBottom: 10 }}>
            {/* Group Header */}
            <Pressable
              onPress={() => toggleGroup(group)}
              style={{
                backgroundColor: groupColor + '15',
                borderWidth: 1.5,
                borderColor: groupColor + '60',
                borderRadius: 10,
                padding: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={{
                  backgroundColor: groupColor,
                  borderRadius: 20,
                  width: 36,
                  height: 36,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}>
                  <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 14 }}>
                    {group}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: groupColor, fontWeight: '700', fontSize: 14 }}>
                    {label}
                  </Text>
                  <Text style={{ color: groupColor, fontSize: 10, opacity: 0.7 }}>
                    {types.length} types
                  </Text>
                </View>
              </View>
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={groupColor}
              />
            </Pressable>

            {/* Group Content - Vertical List */}
            {isExpanded && (
              <View style={{ marginTop: 6, marginLeft: 6, gap: 4 }}>
                {types.map((type) => {
                  const config = getLeisureConfig(type);
                  const isSelected = selected === type;
                  const label = getLeisureTypeLabel(type);

                  return (
                    <Pressable
                      key={type}
                      onPress={() => onSelect(type)}
                      style={{
                        backgroundColor: isSelected 
                          ? groupColor + '15'
                          : colors.bgSurface,
                        borderWidth: 1,
                        borderColor: isSelected 
                          ? groupColor
                          : colors.borderSurface,
                        borderRadius: 10,
                        padding: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        {/* Emoji Icon */}
                        <View style={{
                          backgroundColor: isSelected 
                            ? groupColor 
                            : colors.bgSurfaceHover,
                          borderRadius: 18,
                          width: 32,
                          height: 32,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 10,
                        }}>
                          <Text style={{ fontSize: 18 }}>{config.emoji}</Text>
                        </View>

                        {/* Type Label */}
                        <Text style={{
                          fontSize: 13,
                          fontWeight: isSelected ? '600' : '500',
                          color: isSelected 
                            ? groupColor
                            : colors.textPrimary,
                          flex: 1,
                        }}>
                          {label}
                        </Text>
                      </View>

                      {/* Checkmark for Selected */}
                      {isSelected && (
                        <Ionicons 
                          name="checkmark-circle" 
                          size={18} 
                          color={groupColor}
                        />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}